#!/usr/bin/env node
/**
 * Check the first-playable slice spec's module disposition table against the
 * real import graph.
 *
 * Why this exists
 * ---------------
 * `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6 claims a disposition for
 * every module the slice touches: wired by the slice, conditionally wired, or
 * re-archived with a named future home. That table is a hand-maintained claim
 * about a set the import graph already derives, and nothing checked the two
 * against each other. Between 2026-07-29 and 2026-08-06, four separate binding
 * claims in this document were opened and all four were wrong.
 *
 * This is the same failure shape as `format:check`'s hand-maintained glob: a
 * human-curated list purporting to describe a machine-derivable set, drifting
 * silently because nothing compares them. The fix is the same — derive the
 * comparison instead of trusting the curation.
 *
 * What this tool can and cannot prove
 * -----------------------------------
 * It CAN falsify:
 *   - a disposition that names a module which does not exist;
 *   - a module claimed "wired" that the graph cannot reach, with no recorded
 *     deferral explaining why;
 *   - a module claimed "re-archived" that the graph *does* reach — i.e. the
 *     spec says parked and the runtime says live;
 *   - a declared group count that disagrees with the modules actually listed;
 *   - an unreachable module that the table never dispositions at all, despite
 *     the section heading claiming the list is exhaustive;
 *   - the same module dispositioned twice under conflicting groups.
 *
 * It CANNOT prove the half that matters most: that the named module actually
 * models the mechanism the quest needs. `signature.ts` is reachable-or-not in a
 * way this tool can measure, but whether it models component provenance (it
 * does not) is a semantic question that requires reading the module. Three of
 * the four wrong claims found by hand were wrong in exactly that way — a
 * plausible module name mistaken for a module that implements the mechanism.
 * A green run here means the table's bookkeeping is sound, not that its design
 * claims are true. Do not read it as more than that.
 *
 * Usage
 * -----
 *   node tools/audit-slice-binding-claims.mjs            # human-readable
 *   node tools/audit-slice-binding-claims.mjs --json     # machine-readable
 *
 * Exits 1 on any contradiction.
 */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { auditReachability } from "./audit-runtime-reachability.mjs";

const TOOL_REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SPEC_PATH = "docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md";
const SOURCE_DIR = "src";

/**
 * Entry points must match the reachability audit exactly. If they drift, this
 * tool and `audit:reachability` would disagree about what "reachable" means and
 * the disagreement would surface as a phantom spec contradiction.
 */
const ENTRY_POINTS = [
  "src/main.ts",
  "src/physics-lab/main.ts",
  "vite.config.ts",
  "vitest.config.ts",
  "worker/index.ts",
];

/**
 * Group label prefix -> disposition kind.
 *
 * Matched against the bolded label in §6. An unrecognised label is a hard
 * error rather than a skipped group: silently ignoring a renamed heading would
 * drop its modules from the check while the tool still reported success, which
 * is precisely the kind of quiet coverage loss this tool exists to prevent.
 */
const GROUP_KINDS = [
  { match: /^wired by/i, kind: "wired" },
  { match: /^wired if/i, kind: "conditional" },
  { match: /archived/i, kind: "archived" },
];

/** Extracts `**Label (N):**` markers that open each disposition group. */
const GROUP_HEADER = /\*\*(.+?)\s*\((\d+)\)\s*:\*\*/g;

/** Extracts a backticked module basename, e.g. `campaign.ts`. */
const MODULE_TOKEN = /`([A-Za-z0-9._-]+\.ts)`/g;

/** Extracts the declared total from the section heading. */
const SECTION_HEADING =
  /^##\s*\d+\.\s*Module dispositions\s*\(all\s+(\d+),\s*explicit\)/im;

function classifyGroup(label) {
  for (const { match, kind } of GROUP_KINDS) {
    if (match.test(label)) return kind;
  }
  return null;
}

/**
 * Parse §6 of the slice spec into disposition groups.
 *
 * Pure: takes markdown text, returns structure. Kept free of filesystem and
 * graph access so tests can drive contradiction cases from inline fixtures
 * rather than by mutating the repository's real spec.
 */
export function parseDispositionSection(markdown) {
  const headingMatch = SECTION_HEADING.exec(markdown);
  if (!headingMatch) {
    throw new Error(
      "Could not find the module dispositions section. Expected a heading of " +
        'the form "## 6. Module dispositions (all N, explicit)".',
    );
  }

  const declaredTotal = Number(headingMatch[1]);
  const bodyStart = headingMatch.index + headingMatch[0].length;
  const rest = markdown.slice(bodyStart);

  // The section ends at the next top-level heading. Without this bound the
  // parser would swallow every backticked module name in the rest of the file.
  const nextHeading = /^##\s/m.exec(rest);
  const body = nextHeading ? rest.slice(0, nextHeading.index) : rest;

  const headers = [...body.matchAll(GROUP_HEADER)];
  const groups = headers.map((header, index) => {
    const chunkStart = header.index + header[0].length;
    const chunkEnd =
      index + 1 < headers.length ? headers[index + 1].index : body.length;
    const chunk = body.slice(chunkStart, chunkEnd);
    const label = header[1].trim();

    return {
      label,
      kind: classifyGroup(label),
      declaredCount: Number(header[2]),
      modules: [...chunk.matchAll(MODULE_TOKEN)].map((m) => m[1]),
    };
  });

  return { declaredTotal, groups };
}

/**
 * Compare parsed dispositions against measured module states.
 *
 * `moduleStates` maps a module basename to one of:
 *   { state: "reachable" }
 *   { state: "unreachable", deferred: string | null }
 *   { state: "quarantined" }
 *   { state: "missing" }
 *   { state: "ambiguous", paths: string[] }
 *
 * Returns { findings, notes }. A finding is a contradiction and fails the run;
 * a note is true-but-not-wrong information that would be lost if suppressed.
 */
export function crossCheckDispositions({
  declaredTotal,
  groups,
  moduleStates,
  unreachablePaths = [],
}) {
  const findings = [];
  const notes = [];

  // --- Structural integrity of the table itself -----------------------------

  const seen = new Map();
  for (const group of groups) {
    if (group.kind === null) {
      findings.push({
        kind: "unknown-group",
        label: group.label,
        detail:
          `disposition group "${group.label}" does not map to a known kind. ` +
          "Add it to GROUP_KINDS, or the modules under it go unchecked.",
      });
    }

    if (group.modules.length !== group.declaredCount) {
      findings.push({
        kind: "count-mismatch",
        label: group.label,
        detail:
          `declares ${group.declaredCount} modules but lists ` +
          `${group.modules.length}.`,
      });
    }

    for (const module of group.modules) {
      if (seen.has(module)) {
        findings.push({
          kind: "duplicate-disposition",
          module,
          detail:
            `dispositioned under both "${seen.get(module)}" and ` +
            `"${group.label}".`,
        });
      } else {
        seen.set(module, group.label);
      }
    }
  }

  const listedTotal = groups.reduce((sum, g) => sum + g.modules.length, 0);
  if (listedTotal !== declaredTotal) {
    findings.push({
      kind: "total-mismatch",
      detail:
        `the section heading claims ${declaredTotal} modules but the groups ` +
        `list ${listedTotal}.`,
    });
  }

  // --- Each claim against the graph -----------------------------------------

  for (const group of groups) {
    for (const module of group.modules) {
      const measured = moduleStates.get(module) ?? { state: "missing" };
      const where = `${module} (${group.label})`;

      if (measured.state === "missing") {
        findings.push({
          kind: "missing-module",
          module,
          detail: `${where} names a module that does not exist in ${SOURCE_DIR}/.`,
        });
        continue;
      }

      if (measured.state === "ambiguous") {
        findings.push({
          kind: "ambiguous-module",
          module,
          detail:
            `${where} resolves to more than one file ` +
            `(${measured.paths.join(", ")}); the basename is not unique.`,
        });
        continue;
      }

      if (group.kind === "wired") {
        if (measured.state === "reachable") continue;
        if (measured.state === "quarantined") {
          findings.push({
            kind: "wired-but-quarantined",
            module,
            detail:
              `${where} is claimed wired, but the reachability audit ` +
              "quarantines it. Those are contradictory decisions.",
          });
          continue;
        }
        if (measured.deferred) {
          // A deferral is a recorded, preconditioned reason — the claim is
          // pending, not wrong. Surfacing it as a note keeps the outstanding
          // work visible without failing a run for tracked, explained debt.
          notes.push({
            kind: "wired-pending-deferral",
            module,
            detail: `${where} is not yet reachable. Deferred: ${measured.deferred}`,
          });
          continue;
        }
        findings.push({
          kind: "wired-but-unreachable",
          module,
          detail:
            `${where} is claimed wired, is not reachable, and has no ` +
            "recorded deferral explaining why.",
        });
        continue;
      }

      if (group.kind === "archived") {
        if (measured.state !== "reachable") continue;
        findings.push({
          kind: "archived-but-reachable",
          module,
          detail:
            `${where} is claimed parked for a future home, but the import ` +
            "graph reaches it today. The spec understates what is live.",
        });
        continue;
      }

      if (group.kind === "conditional" && measured.state === "reachable") {
        notes.push({
          kind: "condition-resolved",
          module,
          detail:
            `${where} is reachable, so the condition has been met. The spec ` +
            "still phrases it as pending.",
        });
      }
    }
  }

  // --- Exhaustiveness -------------------------------------------------------

  // The heading claims the list is explicit and complete. An unreachable module
  // absent from it is undispositioned code: it has no recorded future and no
  // recorded reason for being parked.
  for (const path of unreachablePaths) {
    const basename = path.split("/").pop();
    if (seen.has(basename)) continue;
    findings.push({
      kind: "undispositioned-unreachable",
      module: basename,
      detail:
        `${path} is unreachable but appears in no disposition group, though ` +
        "the section heading claims the list is explicit.",
    });
  }

  return { findings, notes };
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Build basename -> measured state from the filesystem and the import graph. */
export async function measureModuleStates({ rootDir, report }) {
  const files = (await walk(resolve(rootDir, SOURCE_DIR))).filter(
    (file) => file.endsWith(".ts") && !/\.(test|spec)\.ts$/.test(file),
  );

  const byBasename = new Map();
  for (const file of files) {
    const basename = file.split("/").pop();
    if (!byBasename.has(basename)) byBasename.set(basename, []);
    byBasename.get(basename).push(relative(rootDir, file));
  }

  const unreachable = new Map(report.unreachable.map((row) => [row.path, row]));
  const quarantined = new Set(report.quarantined);

  const states = new Map();
  for (const [basename, paths] of byBasename) {
    if (paths.length > 1) {
      states.set(basename, { state: "ambiguous", paths });
      continue;
    }
    const [path] = paths;
    if (quarantined.has(path)) {
      states.set(basename, { state: "quarantined", path });
    } else if (unreachable.has(path)) {
      states.set(basename, {
        state: "unreachable",
        path,
        deferred: unreachable.get(path).deferred,
      });
    } else {
      states.set(basename, { state: "reachable", path });
    }
  }

  return states;
}

export async function auditSliceBindingClaims({
  rootDir = process.cwd(),
} = {}) {
  const root = resolve(rootDir);
  const markdown = await readFile(resolve(root, SPEC_PATH), "utf8");
  const { declaredTotal, groups } = parseDispositionSection(markdown);

  const report = await auditReachability({
    rootDir: root,
    sourceDir: SOURCE_DIR,
    entryPoints: ENTRY_POINTS,
  });

  const moduleStates = await measureModuleStates({ rootDir: root, report });
  const { findings, notes } = crossCheckDispositions({
    declaredTotal,
    groups,
    moduleStates,
    unreachablePaths: report.unreachable.map((row) => row.path),
  });

  return {
    specPath: SPEC_PATH,
    declaredTotal,
    groups: groups.map((group) => ({
      label: group.label,
      kind: group.kind,
      declaredCount: group.declaredCount,
      moduleCount: group.modules.length,
    })),
    findings,
    notes,
  };
}

function render(result) {
  const lines = ["# Slice binding-claim audit", ""];
  lines.push(
    `Spec: \`${result.specPath}\` §6 — ${result.declaredTotal} modules declared.`,
    "",
  );

  lines.push(
    "| Group | Kind | Declared | Listed |",
    "| --- | --- | ---: | ---: |",
  );
  for (const group of result.groups) {
    lines.push(
      `| ${group.label} | ${group.kind ?? "**unknown**"} | ${group.declaredCount} | ${group.moduleCount} |`,
    );
  }
  lines.push("");

  if (result.findings.length > 0) {
    lines.push("## ❌ Contradictions", "");
    for (const finding of result.findings) {
      lines.push(`- **${finding.kind}** — ${finding.detail}`);
    }
    lines.push("");
  } else {
    lines.push(
      "No contradictions. Every disposition agrees with the import graph.",
      "",
    );
  }

  if (result.notes.length > 0) {
    lines.push("## Notes (true, not failures)", "");
    for (const note of result.notes) {
      lines.push(`- **${note.kind}** — ${note.detail}`);
    }
    lines.push("");
  }

  lines.push(
    "This checks the table's bookkeeping, not its design claims. Whether a",
    "named module actually models the mechanism the quest needs still requires",
    "reading the module.",
  );

  return lines.join("\n");
}

async function main(argv) {
  const asJson = argv.includes("--json");
  const result = await auditSliceBindingClaims({ rootDir: TOOL_REPO_ROOT });

  process.stdout.write(
    asJson ? `${JSON.stringify(result, null, 2)}\n` : `${render(result)}\n`,
  );

  if (result.findings.length > 0) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main(process.argv);
}
