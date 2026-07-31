#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VALID_STATUSES = new Set([
  "concept",
  "proposed",
  "procedural-candidate",
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

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function validateCanonicalSpec(spec, entry) {
  const findings = [];
  const assetId = entry?.id ?? null;
  const expectedAssetId =
    typeof assetId === "string"
      ? assetId.replace(/-object-reference$/, "")
      : null;
  if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
    return [
      finding(
        "spec-shape-invalid",
        "Canonical asset spec root must be an object.",
        assetId,
      ),
    ];
  }
  if (spec.schemaVersion !== 1) {
    findings.push(
      finding(
        "spec-version-invalid",
        "Canonical asset spec schemaVersion must be 1.",
        assetId,
      ),
    );
  }
  if (expectedAssetId && spec.assetId !== expectedAssetId) {
    findings.push(
      finding(
        "spec-asset-id-mismatch",
        `Canonical asset spec ${spec.assetId ?? "<missing>"} does not match ${expectedAssetId}.`,
        assetId,
      ),
    );
  }
  const components = Array.isArray(spec.components) ? spec.components : [];
  const componentIds = new Set();
  for (const component of components) {
    if (!component || typeof component.id !== "string") continue;
    if (componentIds.has(component.id)) {
      findings.push(
        finding(
          "spec-component-duplicate",
          `Canonical asset spec repeats component ${component.id}.`,
          assetId,
        ),
      );
    }
    componentIds.add(component.id);
  }
  for (const component of components) {
    if (component?.parent && !componentIds.has(component.parent)) {
      findings.push(
        finding(
          "spec-parent-missing",
          `Component ${component.id} references missing parent ${component.parent}.`,
          assetId,
        ),
      );
    }
  }
  const materials = Array.isArray(spec.materials) ? spec.materials : [];
  const materialIds = new Set(
    materials.map((material) => material?.id).filter(Boolean),
  );
  for (const component of components) {
    for (const materialId of component?.materials ?? []) {
      if (!materialIds.has(materialId)) {
        findings.push(
          finding(
            "spec-material-missing",
            `Component ${component.id} references missing material ${materialId}.`,
            assetId,
          ),
        );
      }
    }
  }
  for (const repetition of spec.repetitionSystems ?? []) {
    if (
      repetition?.prototypeComponent &&
      !componentIds.has(repetition.prototypeComponent)
    ) {
      findings.push(
        finding(
          "spec-repetition-prototype-missing",
          `Repetition ${repetition.id} references missing prototype ${repetition.prototypeComponent}.`,
          assetId,
        ),
      );
    }
  }
  const requiredObjects = [
    "lifecycle",
    "identity",
    "coordinateFrame",
    "behaviour",
    "runtime",
    "compiler",
    "validation",
    "provenance",
  ];
  for (const field of requiredObjects) {
    if (!spec[field] || typeof spec[field] !== "object") {
      findings.push(
        finding(
          "spec-object-missing",
          `Canonical asset spec is missing object ${field}.`,
          assetId,
        ),
      );
    }
  }
  if (
    typeof spec.runtime?.visualAuthority !== "string" ||
    typeof spec.runtime?.collisionAuthority !== "string"
  ) {
    findings.push(
      finding(
        "spec-authority-missing",
        "Canonical asset spec must name visual and collision authority.",
        assetId,
      ),
    );
  }
  if (
    !Array.isArray(spec.compiler?.stages) ||
    spec.compiler.stages.length < 2
  ) {
    findings.push(
      finding(
        "spec-compiler-stages-missing",
        "Canonical asset spec must list compiler stages.",
        assetId,
      ),
    );
  }
  if (
    !Array.isArray(spec.validation?.evidenceRoadmap) ||
    spec.validation.evidenceRoadmap.length < 3
  ) {
    findings.push(
      finding(
        "spec-evidence-roadmap-missing",
        "Canonical asset spec must list an evidence roadmap.",
        assetId,
      ),
    );
  }
  if (spec.assetFamily === "rig" || spec.assetFamily === "rig-part") {
    const levels = new Set(components.map((component) => component?.level));
    for (const level of ["macro", "meso", "micro"]) {
      if (!levels.has(level)) {
        findings.push(
          finding(
            "spec-component-level-missing",
            `Rig asset spec must include a ${level} component level.`,
            assetId,
          ),
        );
      }
    }
  }
  return findings;
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
  if (typeof entry.publicRuntimeApproved !== "boolean") {
    findings.push(
      finding(
        "public-runtime-approval-missing",
        `${prefix}.publicRuntimeApproved must be an explicit boolean.`,
        entry.id ?? null,
      ),
    );
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
  if (entry.specPath !== undefined) {
    if (
      !safeRelativePath(entry.specPath) ||
      !entry.specPath.toLowerCase().endsWith(".json")
    ) {
      findings.push(
        finding(
          "spec-path-unsafe",
          `${prefix}.specPath must be a safe repository-relative JSON path.`,
          entry.id ?? null,
        ),
      );
    } else {
      const specPath = path.resolve(repoRoot, entry.specPath);
      if (!isPathInside(repoRoot, specPath))
        findings.push(
          finding(
            "spec-path-outside-root",
            `${prefix}.specPath escapes the repository root.`,
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
  if (
    entry.runtimePath &&
    (!entry.runtimePresentation ||
      typeof entry.runtimePresentation.siteId !== "string" ||
      entry.runtimePresentation.siteId.length === 0 ||
      [
        "offsetX",
        "offsetZ",
        "yaw",
        "targetMaxDimension",
        "fallbackWidth",
        "fallbackHeight",
        "fallbackDepth",
        "fallbackColor",
      ].some(
        (field) =>
          typeof entry.runtimePresentation[field] !== "number" ||
          !Number.isFinite(entry.runtimePresentation[field]),
      ) ||
      entry.runtimePresentation.targetMaxDimension <= 0 ||
      entry.runtimePresentation.fallbackWidth <= 0 ||
      entry.runtimePresentation.fallbackHeight <= 0 ||
      entry.runtimePresentation.fallbackDepth <= 0 ||
      !Number.isInteger(entry.runtimePresentation.fallbackColor) ||
      entry.runtimePresentation.fallbackColor < 0 ||
      entry.runtimePresentation.fallbackColor > 0xffffff)
  ) {
    findings.push(
      finding(
        "runtime-presentation-invalid",
        `${prefix}.runtimePresentation must define a site anchor, finite offsets, and positive fallback dimensions for runtime assets.`,
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
  if (
    entry.licenseSha256 !== undefined &&
    !/^[a-f0-9]{64}$/.test(entry.licenseSha256)
  ) {
    findings.push(
      finding(
        "license-sha256-invalid",
        `${prefix}.licenseSha256 must be a lowercase SHA-256 digest.`,
        entry.id ?? null,
      ),
    );
  }
  if (
    entry.publicRuntimeApproved === true &&
    (!["approved", "runtime-tested"].includes(entry.status) ||
      !entry.runtimePath ||
      !entry.sha256 ||
      !entry.licensePath ||
      !entry.licenseSha256 ||
      !entry.rightsStatus.startsWith("cc0-verified"))
  ) {
    findings.push(
      finding(
        "public-runtime-approval-unverified",
        `${prefix} cannot be public without a tested lifecycle, runtime digest, and verified license evidence.`,
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
    if (entry?.specPath && safeRelativePath(entry.specPath)) {
      const specPath = path.resolve(repoRoot, entry.specPath);
      try {
        const spec = JSON.parse(await readFile(specPath, "utf8"));
        const requiredSpecFields = [
          "schemaVersion",
          "assetId",
          "assetFamily",
          "lifecycle",
          "components",
          "materials",
          "runtime",
          "validation",
        ];
        for (const field of requiredSpecFields) {
          if (!(field in spec)) {
            findings.push(
              finding(
                "spec-field-missing",
                `Canonical asset spec is missing ${field}: ${entry.specPath}.`,
                entry.id ?? null,
              ),
            );
          }
        }
        findings.push(...validateCanonicalSpec(spec, entry));
      } catch (error) {
        findings.push(
          finding(
            "spec-file-invalid",
            `Canonical asset spec cannot be parsed: ${entry.specPath}: ${error.message}`,
            entry.id ?? null,
          ),
        );
      }
    }
    if (entry?.runtimePath && safeRelativePath(entry.runtimePath)) {
      const runtimePath = path.resolve(repoRoot, entry.runtimePath);
      if (!isPathInside(assetRoot, runtimePath)) continue;
      try {
        const runtimeBuffer = await readFile(runtimePath);
        if (entry.sha256 && sha256(runtimeBuffer) !== entry.sha256) {
          findings.push(
            finding(
              "runtime-sha256-mismatch",
              `Runtime file digest does not match the manifest: ${entry.runtimePath}.`,
              entry.id ?? null,
            ),
          );
        }
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
    if (entry?.licensePath && safeRelativePath(entry.licensePath)) {
      const licensePath = path.resolve(repoRoot, entry.licensePath);
      if (!isPathInside(repoRoot, licensePath)) continue;
      try {
        const licenseBuffer = await readFile(licensePath);
        if (
          entry.licenseSha256 &&
          sha256(licenseBuffer) !== entry.licenseSha256
        ) {
          findings.push(
            finding(
              "license-sha256-mismatch",
              `License file digest does not match the manifest: ${entry.licensePath}.`,
              entry.id ?? null,
            ),
          );
        }
      } catch {
        findings.push(
          finding(
            "license-file-missing",
            `License file is missing: ${entry.licensePath}.`,
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
