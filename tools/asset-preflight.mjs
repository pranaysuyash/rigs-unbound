#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_STATUSES = new Set([
  "concept",
  "proposed",
  "approved",
  "runtime-tested",
  "blocked",
]);

function finding(code, message, assetId = null) {
  return { code, message, assetId };
}

function isPathInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (relative !== ".." &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
}

function safeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (path.posix.isAbsolute(value) || path.win32.isAbsolute(value))
    return false;
  if (
    /^[a-z][a-z\d+.-]*:/i.test(value) ||
    value.includes("?") ||
    value.includes("#")
  )
    return false;
  const normalized = path.posix.normalize(value.replaceAll("\\", "/"));
  return (
    normalized !== ".." &&
    !normalized.startsWith("../") &&
    !normalized.includes("//")
  );
}

function readUInt32(buffer, offset) {
  return buffer.readUInt32LE(offset);
}

function parseJsonChunk(buffer, filePath) {
  const findings = [];
  if (buffer.length < 12) {
    return {
      json: null,
      findings: [
        finding(
          "glb-header-truncated",
          `${filePath} is shorter than a GLB header.`,
        ),
      ],
    };
  }
  if (buffer.toString("ascii", 0, 4) !== "glTF") {
    findings.push(
      finding(
        "glb-magic-invalid",
        `${filePath} does not start with the glTF magic header.`,
      ),
    );
  }
  if (readUInt32(buffer, 4) !== 2) {
    findings.push(
      finding("glb-version-unsupported", `${filePath} is not GLB version 2.`),
    );
  }
  const declaredLength = readUInt32(buffer, 8);
  if (declaredLength !== buffer.length) {
    findings.push(
      finding(
        "glb-length-mismatch",
        `${filePath} declares ${declaredLength} bytes but contains ${buffer.length}.`,
      ),
    );
  }
  let offset = 12;
  let json = null;
  let binLength = 0;
  let chunkIndex = 0;
  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) {
      findings.push(
        finding(
          "glb-chunk-header-truncated",
          `${filePath} ends inside a chunk header.`,
        ),
      );
      break;
    }
    const chunkLength = readUInt32(buffer, offset);
    const chunkType = buffer.toString("ascii", offset + 4, offset + 8);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;
    if (chunkEnd > buffer.length) {
      findings.push(
        finding(
          "glb-chunk-truncated",
          `${filePath} chunk ${chunkIndex} exceeds the file boundary.`,
        ),
      );
      break;
    }
    if (chunkIndex === 0 && chunkType !== "JSON") {
      findings.push(
        finding(
          "glb-json-chunk-missing",
          `${filePath} must begin with a JSON chunk.`,
        ),
      );
    }
    if (chunkType === "JSON") {
      try {
        json = JSON.parse(
          buffer
            .toString("utf8", chunkStart, chunkEnd)
            .replace(/\u0000+$/g, "")
            .trim(),
        );
      } catch (error) {
        findings.push(
          finding(
            "glb-json-invalid",
            `${filePath} JSON chunk is invalid: ${error.message}`,
          ),
        );
      }
    } else if (chunkType === "BIN\u0000") {
      binLength = chunkLength;
    }
    offset = chunkEnd;
    chunkIndex += 1;
  }
  if (
    json === null &&
    !findings.some((item) => item.code === "glb-json-invalid")
  ) {
    findings.push(
      finding("glb-json-missing", `${filePath} has no readable JSON chunk.`),
    );
  }
  if (json && json.asset?.version !== "2.0") {
    findings.push(
      finding(
        "gltf-asset-version-invalid",
        `${filePath} JSON must declare asset.version 2.0.`,
      ),
    );
  }
  if (json?.buffers?.[0]?.byteLength > binLength) {
    findings.push(
      finding(
        "glb-bin-truncated",
        `${filePath} BIN chunk is smaller than buffers[0].byteLength.`,
      ),
    );
  }
  return { json, binLength, findings };
}

export function preflightGlbBuffer(buffer, filePath = "asset.glb") {
  return parseJsonChunk(buffer, filePath);
}

async function preflightGlbFile(filePath, repoRoot) {
  const findings = [];
  let buffer;
  try {
    buffer = await readFile(filePath);
  } catch (error) {
    return {
      json: null,
      findings: [
        finding(
          "runtime-file-unreadable",
          `${filePath} cannot be read: ${error.message}`,
        ),
      ],
    };
  }
  const parsed = parseJsonChunk(buffer, filePath);
  findings.push(...parsed.findings);
  const json = parsed.json;
  if (!json) return { json, findings };

  for (const [section, values] of [
    ["buffers", json.buffers],
    ["images", json.images],
  ]) {
    if (!Array.isArray(values)) continue;
    for (const [index, value] of values.entries()) {
      if (!value || typeof value.uri !== "string") continue;
      if (!safeRelativePath(value.uri)) {
        findings.push(
          finding(
            "external-uri-unsafe",
            `${filePath} ${section}[${index}].uri is not a safe relative path.`,
          ),
        );
        continue;
      }
      const dependency = path.resolve(path.dirname(filePath), value.uri);
      if (!isPathInside(repoRoot, dependency)) {
        findings.push(
          finding(
            "external-uri-outside-root",
            `${filePath} ${section}[${index}].uri escapes the repository root.`,
          ),
        );
        continue;
      }
      try {
        await readFile(dependency);
      } catch {
        findings.push(
          finding(
            "external-uri-missing",
            `${filePath} references missing ${section}[${index}].uri: ${value.uri}`,
          ),
        );
      }
    }
  }
  return { json, findings };
}

function validateEntry(entry, index, repoRoot, assetRoot) {
  const findings = [];
  const prefix = `entries[${index}]`;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return [finding("entry-invalid", `${prefix} must be an object.`)];
  }
  if (
    typeof entry.id !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)
  ) {
    findings.push(
      finding(
        "entry-id-invalid",
        `${prefix}.id must be stable kebab-case.`,
        entry.id ?? null,
      ),
    );
  }
  if (!VALID_STATUSES.has(entry.status)) {
    findings.push(
      finding(
        "entry-status-invalid",
        `${prefix}.status is not supported.`,
        entry.id ?? null,
      ),
    );
  }
  for (const field of ["kind", "sourceType", "rightsStatus", "intendedUse"]) {
    if (typeof entry[field] !== "string" || entry[field].length === 0) {
      findings.push(
        finding(
          "entry-field-missing",
          `${prefix}.${field} is required.`,
          entry.id ?? null,
        ),
      );
    }
  }
  if (entry.sourcePath !== undefined) {
    if (!safeRelativePath(entry.sourcePath)) {
      findings.push(
        finding(
          "source-path-unsafe",
          `${prefix}.sourcePath must be a safe repository-relative path.`,
          entry.id ?? null,
        ),
      );
    } else {
      const sourcePath = path.resolve(repoRoot, entry.sourcePath);
      if (!isPathInside(repoRoot, sourcePath))
        findings.push(
          finding(
            "source-path-outside-root",
            `${prefix}.sourcePath escapes the repository root.`,
            entry.id ?? null,
          ),
        );
    }
  }
  if (entry.runtimePath !== null && entry.runtimePath !== undefined) {
    if (
      !safeRelativePath(entry.runtimePath) ||
      !entry.runtimePath.toLowerCase().endsWith(".glb")
    ) {
      findings.push(
        finding(
          "runtime-path-invalid",
          `${prefix}.runtimePath must be a safe relative .glb path.`,
          entry.id ?? null,
        ),
      );
    } else {
      const runtimePath = path.resolve(repoRoot, entry.runtimePath);
      if (!isPathInside(assetRoot, runtimePath))
        findings.push(
          finding(
            "runtime-path-outside-asset-root",
            `${prefix}.runtimePath must remain inside assetRoot.`,
            entry.id ?? null,
          ),
        );
    }
  }
  if (
    ["approved", "runtime-tested"].includes(entry.status) &&
    !entry.runtimePath
  ) {
    findings.push(
      finding(
        "runtime-path-required",
        `${prefix}.runtimePath is required for ${entry.status} assets.`,
        entry.id ?? null,
      ),
    );
  }
  if (entry.sha256 !== undefined && !/^[a-f0-9]{64}$/.test(entry.sha256)) {
    findings.push(
      finding(
        "sha256-invalid",
        `${prefix}.sha256 must be a lowercase SHA-256 digest.`,
        entry.id ?? null,
      ),
    );
  }
  return findings;
}

export async function preflightManifestFile(manifestPath) {
  const absoluteManifestPath = path.resolve(manifestPath);
  const repoRoot = path.resolve(path.dirname(absoluteManifestPath), "..");
  const findings = [];
  let manifest;
  try {
    manifest = JSON.parse(await readFile(absoluteManifestPath, "utf8"));
  } catch (error) {
    return {
      manifestPath: absoluteManifestPath,
      entries: 0,
      findings: [
        finding(
          "manifest-invalid",
          `Manifest cannot be parsed: ${error.message}`,
        ),
      ],
    };
  }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    return {
      manifestPath: absoluteManifestPath,
      entries: 0,
      findings: [
        finding("manifest-shape-invalid", "Manifest root must be an object."),
      ],
    };
  }
  if (manifest.schemaVersion !== 1)
    findings.push(
      finding("manifest-version-invalid", "schemaVersion must be 1."),
    );
  if (manifest.runtimeFormat !== "glb")
    findings.push(
      finding("runtime-format-invalid", "runtimeFormat must be glb."),
    );
  if (!safeRelativePath(manifest.assetRoot)) {
    findings.push(
      finding(
        "asset-root-invalid",
        "assetRoot must be a safe repository-relative path.",
      ),
    );
  }
  const assetRoot = path.resolve(
    repoRoot,
    manifest.assetRoot ?? "assets/runtime",
  );
  if (!isPathInside(repoRoot, assetRoot))
    findings.push(
      finding(
        "asset-root-outside-root",
        "assetRoot must remain inside the repository.",
      ),
    );
  if (!Array.isArray(manifest.entries)) {
    findings.push(finding("entries-invalid", "entries must be an array."));
    return { manifestPath: absoluteManifestPath, entries: 0, findings };
  }
  const ids = new Set();
  for (const [index, entry] of manifest.entries.entries()) {
    findings.push(...validateEntry(entry, index, repoRoot, assetRoot));
    if (entry?.id) {
      if (ids.has(entry.id))
        findings.push(
          finding(
            "entry-id-duplicate",
            `Duplicate entry id: ${entry.id}.`,
            entry.id,
          ),
        );
      ids.add(entry.id);
    }
    if (entry?.sourcePath && safeRelativePath(entry.sourcePath)) {
      const sourcePath = path.resolve(repoRoot, entry.sourcePath);
      try {
        await readFile(sourcePath);
      } catch {
        findings.push(
          finding(
            "source-file-missing",
            `Source file is missing: ${entry.sourcePath}.`,
            entry.id ?? null,
          ),
        );
      }
    }
    if (entry?.runtimePath && safeRelativePath(entry.runtimePath)) {
      const runtimePath = path.resolve(repoRoot, entry.runtimePath);
      if (!isPathInside(assetRoot, runtimePath)) continue;
      try {
        await readFile(runtimePath);
        const result = await preflightGlbFile(runtimePath, repoRoot);
        findings.push(
          ...result.findings.map((item) => ({
            ...item,
            assetId: entry.id ?? null,
          })),
        );
      } catch {
        findings.push(
          finding(
            "runtime-file-missing",
            `Runtime file is missing: ${entry.runtimePath}.`,
            entry.id ?? null,
          ),
        );
      }
    }
  }
  return {
    manifestPath: absoluteManifestPath,
    entries: manifest.entries.length,
    findings,
  };
}

function printReport(report) {
  const errors = report.findings.length;
  console.log(JSON.stringify({ ...report, summary: { errors } }, null, 2));
  return errors === 0 ? 0 : 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifestPath =
    process.argv[2] ?? path.resolve("assets/asset-manifest.json");
  const report = await preflightManifestFile(manifestPath);
  process.exitCode = printReport(report);
}
