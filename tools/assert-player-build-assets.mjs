#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Assert the player distribution boundary against the canonical asset manifest.
 *
 * An asset entry can have two artifacts, and the manifest names them separately:
 *
 *   sourcePath  - e.g. an authored procedural factory (.ts), which a bundler
 *                 COMPILES INTO the player build when player code imports it.
 *   runtimePath - e.g. an exported .glb, which only reaches the player build if
 *                 something copies the bytes there.
 *
 * `publicRuntimeApproved` is named for, and scoped to, the RUNTIME artifact.
 * This tool once applied it to the bare `id` string as well, which conflated two
 * different invariants:
 *
 *   containment - unapproved BYTES must not ship. Hard, unconditional, and the
 *                 only invariant that can actually leak an artifact to a player.
 *   disclosure  - an unapproved developer-only identity should not become a
 *                 discoverable public manifest.
 *
 * Those come apart whenever an asset's source form legitimately ships while its
 * runtime binary does not: the source stamps its own id, so the id string is in
 * the bundle by construction, with no byte ever crossing the boundary. A single
 * boolean cannot express "the source ships, the binary does not", so the
 * manifest carries `sourceFormInPlayerBuild` for exactly that case.
 *
 * That flag is a claim, so this tool VERIFIES it rather than trusting it:
 *   - it never relaxes containment (checks 1 and 2 below ignore it entirely);
 *   - it must be load-bearing. If an entry claims its source form ships but the
 *     id appears in no bundle, the claim has rotted and is reported. Exemptions
 *     that stop being checked are how allowlists quietly stop meaning anything.
 *
 * What this tool CANNOT prove: that a bundle occurrence of the id came from the
 * declared sourcePath rather than from some other reference. It proves the bytes
 * are absent, which is the invariant that governs what a player can obtain.
 */

const BUNDLE_EXTENSIONS = [".js", ".js.map", ".html"];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function filesUnder(root) {
  if (!(await exists(root))) return [];
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const candidate = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...(await filesUnder(candidate)));
    else if (entry.isFile()) files.push(candidate);
  }
  return files;
}

/**
 * Entries the boundary governs.
 *
 * Deliberately keyed on `publicRuntimeApproved` alone. An earlier version also
 * required a truthy `runtimePath`, which made an unapproved entry with no
 * runtime export INVISIBLE to every check below — the disclosure rules apply to
 * an unapproved identity whether or not an export exists yet.
 */
export function selectGuardedEntries(manifest) {
  return (manifest.entries ?? []).filter(
    (entry) => entry.publicRuntimeApproved === false,
  );
}

function hasRuntimePath(entry) {
  return typeof entry.runtimePath === "string" && entry.runtimePath.length > 0;
}

/**
 * Pure boundary evaluation.
 *
 * @param entries      guarded manifest entries
 * @param distPaths    Set of dist-relative POSIX paths present in the build
 * @param bundles      [{ path, contents }] of compiled browser output
 * @returns { findings, notes } - findings fail the build, notes are evidence
 */
export function evaluateBoundary({ entries, distPaths, bundles }) {
  const findings = [];
  const notes = [];

  for (const entry of entries) {
    // 1. Containment. Never exemptable: this is the only check that governs
    //    whether a player can actually obtain the unapproved artifact.
    if (hasRuntimePath(entry) && distPaths.has(entry.runtimePath)) {
      findings.push(
        `${entry.id}: unapproved runtime file exists at ${entry.runtimePath}`,
      );
    }

    // 2. Runtime path disclosure. Also never exemptable: a bundle carrying the
    //    export path is code trying to fetch bytes we withheld.
    if (hasRuntimePath(entry)) {
      for (const bundle of bundles) {
        if (bundle.contents.includes(entry.runtimePath)) {
          findings.push(
            `${entry.id}: unapproved runtime path is referenced by ${bundle.path}`,
          );
        }
      }
    }

    // 3. Identity disclosure, and 4. the staleness of any exemption from it.
    const exposedBy = bundles
      .filter((bundle) => bundle.contents.includes(entry.id))
      .map((bundle) => bundle.path);
    const sourceFormShips = entry.sourceFormInPlayerBuild === true;

    if (exposedBy.length > 0 && !sourceFormShips) {
      for (const bundlePath of exposedBy) {
        findings.push(
          `${entry.id}: unapproved manifest identity is exposed by ${bundlePath}`,
        );
      }
    } else if (exposedBy.length > 0 && sourceFormShips) {
      notes.push(
        `${entry.id}: identity appears in ${exposedBy.length} bundle file(s), accounted for by the declared source form ${entry.sourcePath ?? "(unspecified)"}; runtime bytes remain withheld.`,
      );
    } else if (exposedBy.length === 0 && sourceFormShips) {
      findings.push(
        `${entry.id}: sourceFormInPlayerBuild is true but the identity appears in no bundle; the exemption is stale and must be removed from the manifest.`,
      );
    }
  }

  return { findings, notes };
}

export async function assertPlayerBuildAssetBoundary(manifestPath, clientRoot) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const entries = selectGuardedEntries(manifest);

  const allFiles = await filesUnder(clientRoot);
  const distPaths = new Set(
    allFiles.map((filePath) =>
      path.relative(clientRoot, filePath).split(path.sep).join("/"),
    ),
  );

  const bundles = [];
  for (const filePath of allFiles) {
    if (!BUNDLE_EXTENSIONS.some((suffix) => filePath.endsWith(suffix)))
      continue;
    bundles.push({
      path: path.relative(clientRoot, filePath).split(path.sep).join("/"),
      contents: await readFile(filePath, "utf8"),
    });
  }

  return evaluateBoundary({ entries, distPaths, bundles });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifestPath = path.resolve(
    process.argv[2] ?? "assets/asset-manifest.json",
  );
  const clientRoot = path.resolve(process.argv[3] ?? "dist/client");
  const { findings, notes } = await assertPlayerBuildAssetBoundary(
    manifestPath,
    clientRoot,
  );
  for (const note of notes) console.log(`note: ${note}`);
  if (findings.length > 0) {
    console.error(findings.join("\n"));
    process.exitCode = 2;
  } else {
    console.log(
      "Player build asset boundary passed: no unapproved runtime files or manifest identities exposed.",
    );
  }
}
