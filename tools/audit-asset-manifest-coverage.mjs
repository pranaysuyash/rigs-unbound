#!/usr/bin/env node

/**
 * Reconcile the asset manifest against what is actually on disk.
 *
 * `assert-player-build-assets.mjs` walks the manifest and checks that no
 * unapproved entry leaked into the player build. That is manifest-driven, so
 * it has a blind spot by construction: an asset nobody declared is invisible
 * to it. There are no entries to iterate, so the check passes.
 *
 * This tool walks the other direction — filesystem first — and answers the
 * question the build guard cannot:
 *
 *   1. Which runtime binaries exist on disk that the manifest never declared?
 *   2. Which manifest entries declare a `runtimePath` that does not exist?
 *   3. Which entries declare `runtimePath: null` while a file sits at the
 *      conventional location anyway?
 *
 * Case 3 is the subtle one. An entry saying "GLB export is deferred" while the
 * GLB exists means the manifest is describing an intent the tree has already
 * moved past, and rights/approval status recorded against that entry no longer
 * describes the bytes actually present.
 *
 * Usage:
 *   node tools/audit-asset-manifest-coverage.mjs
 *   node tools/audit-asset-manifest-coverage.mjs --json
 *   node tools/audit-asset-manifest-coverage.mjs --strict   # exit 1 on findings
 *
 * Exit codes: 0 clean (or findings without --strict), 1 findings under
 * --strict, 2 tool/IO error.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

/**
 * Extensions treated as shippable runtime binaries. Source art, references,
 * and documentation images are deliberately excluded — the manifest tracks
 * those with `runtimePath: null` and they are not distribution risks.
 */
const RUNTIME_BINARY_EXTENSIONS = new Set([".glb", ".gltf"]);

/** Directories that never contain runtime binaries subject to this contract. */
const SKIP_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "coverage",
  ".vite",
]);

async function pathExists(candidate) {
  try {
    await stat(candidate);
    return true;
  } catch {
    return false;
  }
}

/** Recursively collect runtime binaries, skipping build and vendor trees. */
async function findRuntimeBinaries(root) {
  const found = [];

  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (SKIP_DIRECTORIES.has(entry.name)) continue;
        await walk(path.join(directory, entry.name));
        continue;
      }
      const extension = path.extname(entry.name).toLowerCase();
      if (!RUNTIME_BINARY_EXTENSIONS.has(extension)) continue;
      found.push(path.relative(root, path.join(directory, entry.name)));
    }
  }

  await walk(root);
  return found.sort();
}

/**
 * Audit the manifest against the filesystem.
 *
 * Exported so tests can drive it against fixture trees rather than the live
 * repository, and so a future CI surface can call it without reimplementing
 * the reconciliation.
 */
export async function auditAssetManifestCoverage(manifestPath, repoRoot) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const assetRoot = manifest.assetRoot ?? "assets/runtime";
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];

  const declaredPaths = new Map();
  for (const entry of entries) {
    if (typeof entry.runtimePath === "string" && entry.runtimePath.length > 0) {
      declaredPaths.set(path.normalize(entry.runtimePath), entry);
    }
  }

  const onDisk = await findRuntimeBinaries(repoRoot);

  const undeclared = [];
  const missing = [];
  const deferredButPresent = [];

  // 1. Binaries on disk that no manifest entry declares.
  for (const relativePath of onDisk) {
    if (declaredPaths.has(path.normalize(relativePath))) continue;
    undeclared.push({
      path: relativePath,
      insideAssetRoot: relativePath.startsWith(`${assetRoot}${path.sep}`),
    });
  }

  // 2. Declared runtime paths with no file behind them.
  for (const [relativePath, entry] of declaredPaths) {
    if (await pathExists(path.resolve(repoRoot, relativePath))) continue;
    missing.push({ id: entry.id, path: relativePath });
  }

  // 3. Entries that defer export while a file sits at the conventional slot.
  const undeclaredSet = new Set(undeclared.map((item) => item.path));
  for (const entry of entries) {
    if (entry.runtimePath !== null) continue;
    const conventional = path.join(assetRoot, `${entry.id}.glb`);
    if (!undeclaredSet.has(conventional)) continue;
    deferredButPresent.push({ id: entry.id, path: conventional });
  }

  return { assetRoot, undeclared, missing, deferredButPresent };
}

function report(result) {
  const lines = ["# Asset manifest coverage audit", ""];
  lines.push(`- Asset root: \`${result.assetRoot}\``);
  lines.push(`- Undeclared runtime binaries: ${result.undeclared.length}`);
  lines.push(`- Declared paths with no file: ${result.missing.length}`);
  lines.push(
    `- Entries deferring export while a file exists: ${result.deferredButPresent.length}`,
  );
  lines.push("");

  if (result.undeclared.length > 0) {
    lines.push("## Undeclared runtime binaries");
    lines.push("");
    lines.push(
      "A binary the manifest never declared has no recorded provenance,",
      "rights status, or distribution approval. The player-build guard cannot",
      "see it, because that guard iterates manifest entries.",
      "",
    );
    for (const item of result.undeclared) {
      const where = item.insideAssetRoot
        ? "inside the asset root"
        : "**outside the asset root**";
      lines.push(`- \`${item.path}\` — ${where}`);
    }
    lines.push("");
  }

  if (result.missing.length > 0) {
    lines.push("## Declared but absent");
    lines.push("");
    for (const item of result.missing) {
      lines.push(
        `- \`${item.id}\` declares \`${item.path}\`, which is absent.`,
      );
    }
    lines.push("");
  }

  if (result.deferredButPresent.length > 0) {
    lines.push("## Export deferred, yet the file exists");
    lines.push("");
    lines.push(
      "These entries record `runtimePath: null` — export deferred — while a",
      "file sits at the conventional location. The manifest is describing an",
      "intent the tree has moved past, so the rights and approval status",
      "recorded against the entry no longer describes the bytes present.",
      "",
    );
    for (const item of result.deferredButPresent) {
      lines.push(
        `- \`${item.id}\` defers export, but \`${item.path}\` exists.`,
      );
    }
    lines.push("");
  }

  const total =
    result.undeclared.length +
    result.missing.length +
    result.deferredButPresent.length;
  if (total === 0) {
    lines.push("Manifest and filesystem agree. No findings.");
  }

  return lines.join("\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const asJson = process.argv.includes("--json");
  const strict = process.argv.includes("--strict");
  const manifestPath = path.resolve(REPO_ROOT, "assets/asset-manifest.json");

  try {
    const result = await auditAssetManifestCoverage(manifestPath, REPO_ROOT);
    console.log(asJson ? JSON.stringify(result, null, 2) : report(result));

    const total =
      result.undeclared.length +
      result.missing.length +
      result.deferredButPresent.length;
    process.exit(strict && total > 0 ? 1 : 0);
  } catch (error) {
    console.error(`asset manifest coverage audit failed: ${error.message}`);
    process.exit(2);
  }
}
