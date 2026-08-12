#!/usr/bin/env node

/**
 * Inspect GLB provenance and structure.
 *
 * Answers "where did this binary come from and what is inside it" without
 * opening a 3D tool. The `asset.generator` string is the most useful signal a
 * GLB carries: exporters stamp themselves, so a generator that does not match
 * this repository's own export pipeline is evidence of external origin, which
 * in turn means the rights status is unknown until someone establishes it.
 *
 * Usage:
 *   node tools/inspect-glb-provenance.mjs <file.glb> [more.glb ...]
 *   node tools/inspect-glb-provenance.mjs --json <file.glb>
 *   node tools/inspect-glb-provenance.mjs --all        # every .glb tracked below cwd
 *
 * Exit code is 0 for a readable GLB and 2 if any file could not be parsed, so
 * it is safe to use in a check. It makes no claim about rights: it reports what
 * the bytes say, and a human decides what that means.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const GLB_MAGIC = "glTF";
const JSON_CHUNK = 0x4e4f534a; // 'JSON'
const BIN_CHUNK = 0x004e4942; // 'BIN\0'

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".venv",
  "coverage",
]);

export function parseGlb(buffer) {
  if (buffer.length < 12) throw new Error("file is too short to be a GLB");
  const magic = buffer.toString("ascii", 0, 4);
  if (magic !== GLB_MAGIC) {
    throw new Error(`not a GLB: magic is ${JSON.stringify(magic)}`);
  }

  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);

  let offset = 12;
  let json = null;
  let binaryLength = 0;
  const chunks = [];

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + chunkLength;
    if (end > buffer.length) {
      throw new Error(
        `chunk at ${offset} claims ${chunkLength} bytes, past end of file`,
      );
    }
    if (chunkType === JSON_CHUNK) {
      json = JSON.parse(buffer.toString("utf8", start, end));
      chunks.push("JSON");
    } else if (chunkType === BIN_CHUNK) {
      binaryLength = chunkLength;
      chunks.push("BIN");
    } else {
      chunks.push(`0x${chunkType.toString(16)}`);
    }
    offset = end + ((4 - (chunkLength % 4)) % 4);
  }

  if (!json) throw new Error("GLB contains no JSON chunk");
  return { version, declaredLength, json, binaryLength, chunks };
}

export function summarise(buffer, filePath) {
  const { version, declaredLength, json, binaryLength, chunks } =
    parseGlb(buffer);
  const primitives = (json.meshes ?? []).flatMap(
    (mesh) => mesh.primitives ?? [],
  );

  return {
    path: filePath,
    bytes: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    version,
    lengthMatchesHeader: declaredLength === buffer.length,
    chunks,
    binaryLength,
    generator: json.asset?.generator ?? null,
    glTFVersion: json.asset?.version ?? null,
    copyright: json.asset?.copyright ?? null,
    assetExtras: json.asset?.extras ?? null,
    extensionsUsed: json.extensionsUsed ?? [],
    extensionsRequired: json.extensionsRequired ?? [],
    counts: {
      scenes: (json.scenes ?? []).length,
      nodes: (json.nodes ?? []).length,
      meshes: (json.meshes ?? []).length,
      primitives: primitives.length,
      materials: (json.materials ?? []).length,
      textures: (json.textures ?? []).length,
      images: (json.images ?? []).length,
      animations: (json.animations ?? []).length,
      skins: (json.skins ?? []).length,
    },
    anyPrimitiveHasMaterial: primitives.some(
      (primitive) => primitive.material !== undefined,
    ),
    nodeNames: (json.nodes ?? []).map((node) => node.name ?? "(unnamed)"),
    meshNames: (json.meshes ?? []).map((mesh) => mesh.name ?? "(unnamed)"),
    materialNames: (json.materials ?? []).map(
      (material) => material.name ?? "(unnamed)",
    ),
  };
}

async function findGlbs(root) {
  const found = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      found.push(...(await findGlbs(path.join(root, entry.name))));
    } else if (entry.name.toLowerCase().endsWith(".glb")) {
      found.push(path.join(root, entry.name));
    }
  }
  return found;
}

function printSummary(summary) {
  const c = summary.counts;
  console.log(`\n=== ${summary.path}`);
  console.log(
    `  ${summary.bytes} bytes | glTF ${summary.glTFVersion ?? "?"} | container v${summary.version} | chunks: ${summary.chunks.join("+")}`,
  );
  console.log(`  sha256:    ${summary.sha256}`);
  console.log(`  generator: ${summary.generator ?? "(none declared)"}`);
  console.log(`  copyright: ${summary.copyright ?? "(none declared)"}`);
  if (summary.assetExtras) {
    console.log(`  extras:    ${JSON.stringify(summary.assetExtras)}`);
  }
  if (!summary.lengthMatchesHeader) {
    console.log("  WARNING:   header length disagrees with file size");
  }
  console.log(
    `  structure: ${c.scenes} scene(s), ${c.nodes} node(s), ${c.meshes} mesh(es), ${c.primitives} primitive(s)`,
  );
  console.log(
    `  surfacing: ${c.materials} material(s), ${c.textures} texture(s), ${c.images} image(s) | primitives reference a material: ${summary.anyPrimitiveHasMaterial}`,
  );
  console.log(`  rigging:   ${c.animations} animation(s), ${c.skins} skin(s)`);
  if (summary.extensionsUsed.length > 0) {
    console.log(`  extensions: ${summary.extensionsUsed.join(", ")}`);
  }
  if (summary.nodeNames.length > 0) {
    console.log(`  nodes:     ${summary.nodeNames.slice(0, 24).join(", ")}`);
  }
  if (summary.materialNames.length > 0) {
    console.log(
      `  materials: ${summary.materialNames.slice(0, 24).join(", ")}`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const scanAll = args.includes("--all");
  let targets = args.filter((arg) => !arg.startsWith("--"));

  if (scanAll) targets = (await findGlbs(process.cwd())).sort();
  if (targets.length === 0) {
    console.error(
      "usage: node tools/inspect-glb-provenance.mjs [--json] <file.glb ...> | --all",
    );
    process.exit(1);
  }

  const summaries = [];
  let failed = false;
  for (const target of targets) {
    try {
      summaries.push(summarise(await readFile(target), target));
    } catch (error) {
      failed = true;
      if (!asJson)
        console.log(`\n=== ${target}\n  UNREADABLE: ${error.message}`);
      else summaries.push({ path: target, error: error.message });
    }
  }

  if (asJson) console.log(JSON.stringify(summaries, null, 2));
  else for (const summary of summaries) printSummary(summary);

  if (failed) process.exitCode = 2;
}
