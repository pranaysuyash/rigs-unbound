import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  preflightGlbBuffer,
  preflightManifestFile,
} from "./asset-preflight.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function createGlb(json, bin = Buffer.alloc(0)) {
  const jsonBytes = Buffer.from(JSON.stringify(json));
  const jsonPadding = (4 - (jsonBytes.length % 4)) % 4;
  const paddedJson = Buffer.concat([
    jsonBytes,
    Buffer.alloc(jsonPadding, 0x20),
  ]);
  const binPadding = (4 - (bin.length % 4)) % 4;
  const paddedBin = Buffer.concat([bin, Buffer.alloc(binPadding)]);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, 4, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(
    12 + 8 + paddedJson.length + (paddedBin.length ? 8 + paddedBin.length : 0),
    8,
  );
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(paddedJson.length, 0);
  jsonHeader.write("JSON", 4, 4, "ascii");
  if (!paddedBin.length) return Buffer.concat([header, jsonHeader, paddedJson]);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(paddedBin.length, 0);
  binHeader.write("BIN\0", 4, 4, "ascii");
  return Buffer.concat([header, jsonHeader, paddedJson, binHeader, paddedBin]);
}

test("the checked-in manifest has no preflight findings", async () => {
  const report = await preflightManifestFile(
    path.join(projectRoot, "assets/asset-manifest.json"),
  );
  assert.deepEqual(report.findings, []);
  assert.equal(report.entries, 4);
});

test("a minimal GLB v2 is structurally accepted", () => {
  const result = preflightGlbBuffer(
    createGlb({
      asset: { version: "2.0", generator: "test" },
      scenes: [],
      nodes: [],
    }),
  );
  assert.deepEqual(result.findings, []);
  assert.equal(result.json.asset.version, "2.0");
});

test("truncated and unsafe GLB dependencies are rejected", async () => {
  const truncated = preflightGlbBuffer(Buffer.from("glTF"));
  assert.ok(
    truncated.findings.some((item) => item.code === "glb-header-truncated"),
  );

  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-assets-"),
  );
  try {
    const runtime = path.join(tempRoot, "assets/runtime/asset.glb");
    const manifestPath = path.join(tempRoot, "config/manifest.json");
    await mkdir(path.dirname(runtime), { recursive: true });
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(
      runtime,
      createGlb({
        asset: { version: "2.0" },
        buffers: [{ byteLength: 0, uri: "../outside.bin" }],
      }),
    );
    await writeFile(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        assetRoot: "assets/runtime",
        runtimeFormat: "glb",
        entries: [
          {
            id: "unsafe-dependency",
            kind: "static-prop",
            status: "runtime-tested",
            sourceType: "test",
            runtimePath: "assets/runtime/asset.glb",
            publicRuntimeApproved: false,
            rightsStatus: "test",
            intendedUse: "test",
          },
        ],
      }),
    );
    const result = await preflightManifestFile(manifestPath);
    assert.ok(
      result.findings.some((item) => item.code === "external-uri-unsafe"),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("manifest path traversal is rejected", async () => {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-manifest-"),
  );
  try {
    const manifestPath = path.join(tempRoot, "manifest.json");
    await writeFile(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        assetRoot: "assets/runtime",
        runtimeFormat: "glb",
        entries: [
          {
            id: "unsafe",
            kind: "static-prop",
            status: "proposed",
            sourceType: "test",
            sourcePath: "../../outside.txt",
            runtimePath: null,
            publicRuntimeApproved: false,
            rightsStatus: "review",
            intendedUse: "test",
          },
        ],
      }),
    );
    const report = await preflightManifestFile(manifestPath);
    assert.ok(
      report.findings.some((item) => item.code === "source-path-unsafe"),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("runtime files cannot escape the declared asset root", async () => {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-runtime-root-"),
  );
  try {
    const manifestPath = path.join(tempRoot, "config/manifest.json");
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        assetRoot: "assets/runtime",
        runtimeFormat: "glb",
        entries: [
          {
            id: "outside-runtime",
            kind: "static-prop",
            status: "proposed",
            sourceType: "test",
            runtimePath: "assets/not-runtime/asset.glb",
            publicRuntimeApproved: false,
            rightsStatus: "test",
            intendedUse: "test",
          },
        ],
      }),
    );
    const report = await preflightManifestFile(manifestPath);
    assert.ok(
      report.findings.some(
        (item) => item.code === "runtime-path-outside-asset-root",
      ),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("public runtime approval requires tested, hashed, licensed evidence", async () => {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-public-asset-"),
  );
  try {
    const manifestPath = path.join(tempRoot, "assets/asset-manifest.json");
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        assetRoot: "assets/runtime",
        runtimeFormat: "glb",
        entries: [
          {
            id: "unverified-public",
            kind: "static-prop",
            status: "proposed",
            sourceType: "test",
            runtimePath: null,
            publicRuntimeApproved: true,
            rightsStatus: "review",
            intendedUse: "test",
          },
        ],
      }),
    );

    const report = await preflightManifestFile(manifestPath);

    assert.ok(
      report.findings.some(
        (item) => item.code === "public-runtime-approval-unverified",
      ),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("runtime bytes must match the manifest digest", async () => {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-runtime-digest-"),
  );
  try {
    const runtimePath = path.join(tempRoot, "assets/runtime/asset.glb");
    const manifestPath = path.join(tempRoot, "assets/asset-manifest.json");
    await mkdir(path.dirname(runtimePath), { recursive: true });
    await writeFile(
      runtimePath,
      createGlb({ asset: { version: "2.0" }, scenes: [], nodes: [] }),
    );
    await writeFile(
      manifestPath,
      JSON.stringify({
        schemaVersion: 1,
        assetRoot: "assets/runtime",
        runtimeFormat: "glb",
        entries: [
          {
            id: "digest-mismatch",
            kind: "static-prop",
            status: "runtime-tested",
            sourceType: "test",
            runtimePath: "assets/runtime/asset.glb",
            publicRuntimeApproved: false,
            sha256: "0".repeat(64),
            rightsStatus: "test",
            intendedUse: "test",
          },
        ],
      }),
    );

    const report = await preflightManifestFile(manifestPath);

    assert.ok(
      report.findings.some((item) => item.code === "runtime-sha256-mismatch"),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
