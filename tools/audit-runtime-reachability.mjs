#!/usr/bin/env node

/**
 * Runtime reachability audit.
 *
 * Answers one question the documentation cannot answer for itself:
 * which TypeScript modules can actually be reached from a shipped entry point?
 *
 * A module that is typechecked, tested, and documented but never imported by
 * any entry-reachable module is an *unreachable claim*: it describes behaviour
 * the player can never observe. This audit makes that count measurable so the
 * project can treat it as a tracked number instead of a rediscovered surprise.
 *
 * The audit is deliberately static and dependency-free. It does not execute the
 * app, so it cannot prove a reachable module is *used* — only that a path from
 * an entry point exists. Absence of a path is the strong signal; presence of a
 * path is a weaker one.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

/**
 * The repository this tool ships in. QUARANTINED and DEFERRED name paths in
 * *this* tree, so registry checks are meaningless against a fixture root and
 * are scoped to runs that actually audit this repository.
 */
const TOOL_REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];

/** Static import, `export ... from`, and dynamic `import()` specifiers. */
const IMPORT_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']/g,
  /\bimport\s*["']([^"']+)["']/g,
];

/** `<script type="module" src="...">` entries in an HTML shell. */
const HTML_MODULE_PATTERN = /<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;

/**
 * Modules that an accepted decision forbids from the runtime.
 *
 * Unreachable is a budgeted allowance; quarantined-and-reachable is a hard
 * failure. These are excluded from the unreachable count because their
 * unreachability is intentional and permanent — counting them would create
 * pressure to "fix" them by wiring them, which is the exact opposite of intent.
 */
const QUARANTINED = new Map([
  [
    "src/game/xp-progression.ts",
    "ADR-0036: universal XP is rejected by ADR-0018 and must not reach the runtime.",
  ],
]);

/**
 * Modules that cannot be wired today because a named precondition is unmet.
 *
 * "Unreachable" was conflating three different states with three different
 * correct responses:
 *
 *   1. Not yet connected — connective work is all that is missing. Wire it.
 *   2. Must not be connected — an accepted decision forbids it. See QUARANTINED.
 *   3. Cannot be connected until something else exists — wiring it today would
 *      create a parallel system or fabricate behaviour the game does not have.
 *
 * State 3 had no representation, so it read as state 1 and produced planning
 * that treated a design blocker as connective work.
 *
 * Deferred modules **stay in the unreachable budget**, unlike quarantined ones.
 * That asymmetry is deliberate. Quarantine is permanent and decided, so its
 * count should never move and excluding it is correct. Deferral is temporary
 * and conditional — the entire point is that it should eventually resolve — so
 * it must keep counting, or the budget stops applying pressure exactly where
 * pressure is still wanted. Excluding deferrals would also make this map an
 * escape hatch: anything inconvenient gets labelled "deferred" and the budget
 * quietly stops meaning anything.
 *
 * An entry here is a claim with an owner. If the precondition is met, wire the
 * module and delete the entry — the audit fails on a stale entry so this map
 * cannot rot into folklore.
 *
 * `sharedBlocker` names a missing capability the deferral needs, using a stable
 * slug so two entries blocked by the same absent concept can be recognised as
 * one problem. Free-text preconditions destroy that: three entries describing
 * the same gap in three phrasings read as three unrelated blockers. Read it as
 * *necessary*, not *sufficient* — clearing a shared blocker may leave an entry
 * still waiting on something else, which is why it never discharges an entry on
 * its own.
 */
const DEFERRED = new Map([
  [
    "src/game/world-memory.ts",
    {
      precondition:
        "A named consumer that derives from canonical world deltas.",
      sharedBlocker: null,
      rationale:
        "Despite the filename this is not consequence persistence. Canonical " +
        "spatial memory is `WorldMemoryRecord` (gameworld.ts), already wired " +
        "to storage.ts and run-record.ts. This module is an experimental " +
        "read-only soil-displacement projection whose own header forbids " +
        "wiring it without a named consumer; doing so would stand up a second " +
        "mutable soil model beside the canonical one.",
    },
  ],
  [
    "src/game/electrical-grid.ts",
    {
      precondition:
        "Kernel state and player control for at least one modelled load.",
      sharedBlocker: "player-owned-operating-light-state",
      rationale:
        "Models a rig 12V accessory budget — headlights, winch, and seismic " +
        "draw against alternator charge. None of those exist as kernel state " +
        "the player drives: headlights are renderer-only with no on/off state, " +
        "the seismic probe is a discrete pulse rather than a continuous load, " +
        "and no winch is wired at all. Wiring this today would mean inventing " +
        "the loads it claims to measure.",
    },
  ],
  [
    "src/game/signature.ts",
    {
      precondition:
        "One real listener plus accessible player feedback, landing together.",
      sharedBlocker: "player-owned-operating-light-state",
      rationale:
        "Derives acoustic, illumination, and thermal-proxy emission channels " +
        "from rig motion and strain. Its own header calls it an evidence " +
        "fixture until a listener owns channel sensitivity, falloff, and " +
        "thresholds; nothing imports it but its test. Its `illumination` " +
        "input is explicitly blocked on the same absent concept " +
        "electrical-grid.ts waits for: the header forbids production callers " +
        "inferring it from Three.js objects, because no player-owned light " +
        "state exists. Note the slice spec binds this module to component " +
        "provenance — it models no such thing.",
    },
  ],
]);

/**
 * Build-time entry points that live outside `src/` but legitimately pull
 * modules into the graph (Vite/Vitest config plugins, for example).
 */
const BUILD_CONFIG_ENTRIES = [
  "vite.config.ts",
  "vitest.config.ts",
  "worker/index.ts",
];

function isTestFile(absolutePath) {
  return /\.(test|spec)\.[cm]?tsx?$/.test(absolutePath);
}

/**
 * Ambient declaration files are never imported at runtime by design; counting
 * them as unreachable would inflate the budget with a permanent false positive.
 */
function isAmbientDeclaration(absolutePath) {
  return absolutePath.endsWith(".d.ts");
}

function isSourceFile(absolutePath) {
  return SOURCE_EXTENSIONS.includes(extname(absolutePath).toLowerCase());
}

async function walk(targetPath) {
  const absolute = resolve(targetPath);
  let entryStat;
  try {
    entryStat = await stat(absolute);
  } catch {
    return [];
  }

  if (entryStat.isFile()) {
    return [absolute];
  }

  const entries = await readdir(absolute, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .filter((entry) => entry.name !== "node_modules")
      .map((entry) => walk(resolve(absolute, entry.name))),
  );
  return nested.flat();
}

/**
 * Resolve a relative import specifier the way Vite/TypeScript would, trying the
 * extensionless form, each source extension, and the directory index form.
 */
async function resolveSpecifier(specifier, fromFile, rootDir) {
  if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
    return null; // bare package specifier — outside the project graph
  }

  // Root-absolute specifiers are Vite's `/src/...` form and must resolve
  // against the audited root, not the process working directory.
  const base = specifier.startsWith("/")
    ? resolve(rootDir, `.${specifier}`)
    : resolve(dirname(fromFile), specifier);

  const withoutExplicitJs = base.replace(/\.js$/, "");
  const candidates = [
    base,
    ...SOURCE_EXTENSIONS.map((extension) => `${withoutExplicitJs}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => `${base}/index${extension}`),
  ];

  for (const candidate of candidates) {
    if (!isSourceFile(candidate)) continue;
    try {
      const candidateStat = await stat(candidate);
      if (candidateStat.isFile()) return candidate;
    } catch {
      // try the next candidate shape
    }
  }
  return null;
}

async function readImports(absolutePath, rootDir) {
  const source = await readFile(absolutePath, "utf8");
  const specifiers = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match = pattern.exec(source);
    while (match) {
      specifiers.add(match[1]);
      match = pattern.exec(source);
    }
  }

  const resolved = [];
  for (const specifier of specifiers) {
    const target = await resolveSpecifier(specifier, absolutePath, rootDir);
    if (target) resolved.push(target);
  }
  return resolved;
}

/**
 * Only root-level HTML shells confer reachability. Archived evidence previews
 * under `docs/` must not make a module look wired.
 */
async function discoverHtmlEntries(rootDir) {
  const rootEntries = await readdir(rootDir, { withFileTypes: true });
  const htmlFiles = rootEntries
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(rootDir, entry.name))
    .filter((file) => extname(file).toLowerCase() === ".html");

  const moduleEntries = [];
  for (const htmlFile of htmlFiles) {
    const source = await readFile(htmlFile, "utf8");
    HTML_MODULE_PATTERN.lastIndex = 0;
    let match = HTML_MODULE_PATTERN.exec(source);
    while (match) {
      const target = await resolveSpecifier(match[1], htmlFile, rootDir);
      if (target) moduleEntries.push(target);
      match = HTML_MODULE_PATTERN.exec(source);
    }
  }
  return [...new Set(moduleEntries)];
}

async function countLines(absolutePath) {
  const source = await readFile(absolutePath, "utf8");
  return source.split("\n").length;
}

/**
 * Build the reachable set from the given entry points, then report every
 * non-test source module that the traversal never visited.
 */
/**
 * Find registry entries that have rotted.
 *
 * Two ways a registry goes wrong, both silent without this check:
 *
 *   - It names a module that no longer exists (renamed, deleted, moved). The
 *     entry then protects nothing while still reading as an active decision.
 *   - A deferred module became reachable, meaning its precondition was met and
 *     it was wired. The entry is now a stale claim that wiring is blocked.
 *
 * Pure and exported so the detector can be tested directly on synthetic input.
 * Testing it through a fixture tree is not possible: the registries name paths
 * in this repository, so a fixture root would report every entry as stale.
 */
export function findStaleRegistryEntries({
  knownPaths,
  reachablePaths,
  quarantined = [],
  deferred = [],
}) {
  const stale = [];
  const known = new Set(knownPaths);
  const reached = new Set(reachablePaths);

  for (const [paths, registry] of [
    [quarantined, "QUARANTINED"],
    [deferred, "DEFERRED"],
  ]) {
    for (const path of paths) {
      if (known.has(path)) continue;
      stale.push({
        path,
        registry,
        reason: "registered module does not exist",
      });
    }
  }

  for (const path of deferred) {
    if (!reached.has(path)) continue;
    stale.push({
      path,
      registry: "DEFERRED",
      reason:
        "module is now reachable — the precondition was met, so delete the entry",
    });
  }

  return stale;
}

/**
 * Group deferrals by the capability they are waiting on.
 *
 * The point is prioritisation. A flat list of preconditions cannot answer
 * "which single missing thing is holding back the most code?", because each
 * entry states its blocker in its own words. Slugging the shared ones makes the
 * question answerable: N modules and M lines are waiting on one absent concept.
 *
 * Only blockers shared by two or more entries are reported. A blocker unique to
 * one module is already fully described by that module's precondition, and
 * promoting it would pad the report with restatements.
 *
 * Line totals come from the unreachable rows rather than the registry, so the
 * figure counts what is actually still in the budget.
 */
export function summarizeSharedBlockers(deferred, unreachableRows) {
  const linesByPath = new Map(
    unreachableRows.map((row) => [row.path, row.lines]),
  );
  const groups = new Map();

  for (const [path, entry] of deferred) {
    const slug = entry.sharedBlocker;
    if (!slug) continue;
    if (!groups.has(slug))
      groups.set(slug, { blocker: slug, paths: [], lines: 0 });
    const group = groups.get(slug);
    group.paths.push(path);
    group.lines += linesByPath.get(path) ?? 0;
  }

  return [...groups.values()]
    .filter((group) => group.paths.length > 1)
    .sort((a, b) => b.lines - a.lines || a.blocker.localeCompare(b.blocker));
}

export async function auditReachability({
  rootDir = process.cwd(),
  sourceDir = "src",
  entryPoints = [],
} = {}) {
  const root = resolve(rootDir);
  const allFiles = (await walk(resolve(root, sourceDir))).filter(isSourceFile);
  const sourceFiles = allFiles.filter(
    (file) => !isTestFile(file) && !isAmbientDeclaration(file),
  );

  const discovered = await discoverHtmlEntries(root);
  const explicit = entryPoints.map((entry) => resolve(root, entry));
  const buildConfigs = BUILD_CONFIG_ENTRIES.map((entry) =>
    resolve(root, entry),
  );
  const candidateEntries = [
    ...new Set([...discovered, ...explicit, ...buildConfigs]),
  ];
  const entries = [];
  for (const entry of candidateEntries) {
    try {
      if ((await stat(entry)).isFile()) entries.push(entry);
    } catch {
      // a declared build entry that does not exist in this checkout
    }
  }

  const reachable = new Set();
  const queue = [...entries];
  while (queue.length > 0) {
    const current = queue.pop();
    if (reachable.has(current)) continue;
    reachable.add(current);
    for (const next of await readImports(current, root)) {
      if (!reachable.has(next)) queue.push(next);
    }
  }

  // A quarantined module that became reachable is a decision violation, not a
  // budget item. Report it separately and loudly.
  const quarantineViolations = [];
  for (const [relativePath, note] of QUARANTINED) {
    const absolute = resolve(root, relativePath);
    if (reachable.has(absolute)) {
      quarantineViolations.push({ path: relativePath, note });
    }
  }

  // Registry rot check. Scoped to this repository: the registries name paths
  // in this tree, so running it against a fixture root would report every
  // entry as stale and the signal would be noise.
  const auditingThisRepo = root === TOOL_REPO_ROOT;
  const staleRegistryEntries = auditingThisRepo
    ? findStaleRegistryEntries({
        knownPaths: sourceFiles.map((file) => relative(root, file)),
        reachablePaths: [...reachable].map((file) => relative(root, file)),
        quarantined: [...QUARANTINED.keys()],
        deferred: [...DEFERRED.keys()],
      })
    : [];

  const unreachable = [];
  for (const file of sourceFiles) {
    if (reachable.has(file)) continue;
    if (QUARANTINED.has(relative(root, file))) continue;
    const relativePath = relative(root, file);
    const deferral = DEFERRED.get(relativePath) ?? null;
    unreachable.push({
      path: relativePath,
      lines: await countLines(file),
      hasTest: allFiles.some(
        (candidate) =>
          isTestFile(candidate) &&
          candidate.replace(/\.(test|spec)\./, ".") === file,
      ),
      // Deferred modules stay in this list and in the budget by design; the
      // annotation records why wiring is blocked, not that it is excused.
      deferred: deferral ? deferral.precondition : null,
    });
  }
  unreachable.sort((a, b) => b.lines - a.lines || a.path.localeCompare(b.path));

  const totalLines = (
    await Promise.all(sourceFiles.map((file) => countLines(file)))
  ).reduce((sum, lines) => sum + lines, 0);
  const unreachableLines = unreachable.reduce(
    (sum, entry) => sum + entry.lines,
    0,
  );

  return {
    entryPoints: entries.map((entry) => relative(root, entry)),
    moduleCount: sourceFiles.length,
    reachableCount: sourceFiles.filter((file) => reachable.has(file)).length,
    unreachableCount: unreachable.length,
    totalLines,
    unreachableLines,
    unreachable,
    quarantined: [...QUARANTINED.keys()],
    quarantineViolations,
    deferred: [...DEFERRED.entries()].map(([path, entry]) => ({
      path,
      precondition: entry.precondition,
      sharedBlocker: entry.sharedBlocker ?? null,
      rationale: entry.rationale,
    })),
    sharedBlockers: summarizeSharedBlockers(DEFERRED, unreachable),
    staleRegistryEntries,
  };
}

function renderMarkdown(report) {
  const lines = [];
  lines.push("# Runtime reachability audit", "");
  if (report.quarantineViolations.length > 0) {
    lines.push("## ❌ Quarantine violations", "");
    for (const violation of report.quarantineViolations) {
      lines.push(`- **${violation.path}** is reachable. ${violation.note}`);
    }
    lines.push("");
  }
  if (report.staleRegistryEntries.length > 0) {
    lines.push("## ❌ Stale registry entries", "");
    for (const entry of report.staleRegistryEntries) {
      lines.push(`- **${entry.path}** (${entry.registry}) — ${entry.reason}.`);
    }
    lines.push("");
  }
  lines.push(
    `- Entry points: ${report.entryPoints.join(", ") || "none found"}`,
  );
  lines.push(
    `- Non-test source modules: ${report.moduleCount} (${report.totalLines} lines)`,
  );
  lines.push(
    `- Entry-reachable modules: ${report.reachableCount}`,
    `- Unreachable modules: ${report.unreachableCount} (${report.unreachableLines} lines)`,
    "",
  );

  if (report.unreachableCount === 0) {
    lines.push(
      "Every non-test source module is reachable from an entry point.",
    );
    return lines.join("\n");
  }

  lines.push(
    "| Module | Lines | Has tests | Deferred |",
    "| --- | ---: | :---: | :---: |",
  );
  for (const entry of report.unreachable) {
    lines.push(
      `| ${entry.path} | ${entry.lines} | ${entry.hasTest ? "yes" : "no"} | ${
        entry.deferred ? "yes" : "—"
      } |`,
    );
  }

  const deferredInBudget = report.unreachable.filter((entry) => entry.deferred);
  if (deferredInBudget.length > 0) {
    lines.push(
      "",
      "## Deferred — blocked on a named precondition",
      "",
      "These still count against the budget. Deferral is temporary and",
      "conditional, so the pressure to resolve it stays on; only an accepted",
      "decision (quarantine) removes a module from the count.",
      "",
    );
    for (const entry of report.deferred) {
      if (!deferredInBudget.some((row) => row.path === entry.path)) continue;
      lines.push(`- **${entry.path}** — needs: ${entry.precondition}`);
      lines.push(`  ${entry.rationale}`);
    }

    if (report.sharedBlockers.length > 0) {
      lines.push(
        "",
        "### Shared blockers",
        "",
        "One absent capability blocking several modules. Clearing it is",
        "necessary but may not be sufficient — check each precondition.",
        "",
      );
      for (const group of report.sharedBlockers) {
        lines.push(
          `- **${group.blocker}** — ${group.paths.length} modules, ${group.lines} lines: ${group.paths.join(", ")}`,
        );
      }
    }
  }

  lines.push(
    "",
    "A module with tests but no entry path is tested behaviour the player",
    "cannot reach. Wire it, or record an explicit archived/deferred status.",
  );
  return lines.join("\n");
}

async function main(argv) {
  const args = argv.slice(2);
  const json = args.includes("--json");
  const failOnFindings = args.includes("--fail-on-findings");
  const maxIndex = args.indexOf("--max");
  const max = maxIndex >= 0 ? Number(args[maxIndex + 1]) : null;
  const entryPoints = args.filter(
    (arg, index) =>
      !arg.startsWith("--") && !(maxIndex >= 0 && index === maxIndex + 1),
  );

  const report = await auditReachability({ entryPoints });

  process.stdout.write(
    json
      ? `${JSON.stringify(report, null, 2)}\n`
      : `${renderMarkdown(report)}\n`,
  );

  if (report.quarantineViolations.length > 0) {
    for (const violation of report.quarantineViolations) {
      process.stderr.write(
        `Quarantine violation: ${violation.path} is reachable. ${violation.note}\n`,
      );
    }
    process.exitCode = 1;
  } else if (report.staleRegistryEntries.length > 0) {
    // Not a reachability finding — the registry itself is wrong, and a wrong
    // registry silently weakens every check built on it.
    for (const entry of report.staleRegistryEntries) {
      process.stderr.write(
        `Stale ${entry.registry} entry: ${entry.path} — ${entry.reason}.\n`,
      );
    }
    process.exitCode = 1;
  } else if (failOnFindings && report.unreachableCount > 0) {
    process.exitCode = 1;
  } else if (
    max !== null &&
    Number.isFinite(max) &&
    report.unreachableCount > max
  ) {
    process.stderr.write(
      `Unreachable module count ${report.unreachableCount} exceeds budget ${max}.\n`,
    );
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main(process.argv);
}
