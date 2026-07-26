#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
 * Assert the player distribution boundary against the canonical asset manifest.
 *
 * This checks both physical output files and compiled browser code. The latter
 * prevents an unapproved developer-only id or runtime path from becoming a
 * discoverable public manifest even when no bytes were copied.
 */
export async function assertPlayerBuildAssetBoundary(manifestPath, clientRoot) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const unapproved = manifest.entries.filter(
    (entry) => entry.runtimePath && entry.publicRuntimeApproved === false,
  );
  const findings = [];

  for (const entry of unapproved) {
    const outputPath = path.resolve(clientRoot, entry.runtimePath);
    if (await exists(outputPath)) {
      findings.push(
        `${entry.id}: unapproved runtime file exists at ${entry.runtimePath}`,
      );
    }
  }

  const browserFiles = (await filesUnder(clientRoot)).filter(
    (filePath) =>
      filePath.endsWith(".js") ||
      filePath.endsWith(".js.map") ||
      filePath.endsWith(".html"),
  );
  for (const browserFile of browserFiles) {
    const contents = await readFile(browserFile, "utf8");
    for (const entry of unapproved) {
      if (contents.includes(entry.id) || contents.includes(entry.runtimePath)) {
        findings.push(
          `${entry.id}: unapproved manifest identity is exposed by ${path.relative(
            clientRoot,
            browserFile,
          )}`,
        );
      }
    }
  }

  return findings;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifestPath = path.resolve(
    process.argv[2] ?? "assets/asset-manifest.json",
  );
  const clientRoot = path.resolve(process.argv[3] ?? "dist/client");
  const findings = await assertPlayerBuildAssetBoundary(
    manifestPath,
    clientRoot,
  );
  if (findings.length > 0) {
    console.error(findings.join("\n"));
    process.exitCode = 2;
  } else {
    console.log(
      "Player build asset boundary passed: no unapproved runtime files or manifest identities exposed.",
    );
  }
}
