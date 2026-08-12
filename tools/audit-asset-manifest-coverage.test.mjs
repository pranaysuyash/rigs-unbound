#!/usr/bin/env node

/**
 * Self-tests for the asset manifest coverage audit.
 *
 * The audit's value is that it fails when the manifest and the filesystem
 * disagree. A tool that has only ever reported "clean" is not evidence that it
 * works, so each case below builds a fixture tree that provokes exactly one
 * finding and asserts the audit reports it.
 *
 * Run: node tools/audit-asset-manifest-coverage.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { auditAssetManifestCoverage } from "./audit-asset-manifest-coverage.mjs";

/** Build a throwaway repo-shaped tree and run the audit against it. */
async function withFixture(manifest, files, run) {
  const root = await mkdtemp(path.join(tmpdir(), "asset-coverage-"));
  try {
    for (const relativePath of files) {
      const absolute = path.join(root, relativePath);
      await mkdir(path.dirname(absolute), { recursive: true });
      // Content is irrelevant; the audit reconciles paths, not bytes.
      await writeFile(absolute, "glb-fixture");
    }
    const manifestPath = path.join(root, "asset-manifest.json");
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    await run(await auditAssetManifestCoverage(manifestPath, root), root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

const ASSET_ROOT = "assets/runtime";

test("reports nothing when manifest and filesystem agree", async () => {
  await withFixture(
    {
      assetRoot: ASSET_ROOT,
      entries: [
        {
          id: "declared",
          runtimePath: `${ASSET_ROOT}/declared.glb`,
          publicRuntimeApproved: false,
        },
      ],
    },
    [`${ASSET_ROOT}/declared.glb`],
    (result) => {
      assert.deepEqual(result.undeclared, []);
      assert.deepEqual(result.missing, []);
      assert.deepEqual(result.deferredButPresent, []);
    },
  );
});

test("finds a binary the manifest never declared", async () => {
  await withFixture(
    { assetRoot: ASSET_ROOT, entries: [] },
    [`${ASSET_ROOT}/orphan.glb`],
    (result) => {
      assert.equal(result.undeclared.length, 1);
      assert.equal(result.undeclared[0].path, `${ASSET_ROOT}/orphan.glb`);
      assert.equal(result.undeclared[0].insideAssetRoot, true);
    },
  );
});

test("flags an undeclared binary outside the asset root", async () => {
  // The live case: a GLB swept into the repository root by an omnibus commit.
  await withFixture(
    { assetRoot: ASSET_ROOT, entries: [] },
    ["stray.glb"],
    (result) => {
      assert.equal(result.undeclared.length, 1);
      assert.equal(result.undeclared[0].path, "stray.glb");
      assert.equal(
        result.undeclared[0].insideAssetRoot,
        false,
        "a root-level binary must be marked as outside the asset root",
      );
    },
  );
});

test("finds a declared path with no file behind it", async () => {
  await withFixture(
    {
      assetRoot: ASSET_ROOT,
      entries: [{ id: "ghost", runtimePath: `${ASSET_ROOT}/ghost.glb` }],
    },
    [],
    (result) => {
      assert.equal(result.missing.length, 1);
      assert.equal(result.missing[0].id, "ghost");
    },
  );
});

test("finds an entry that defers export while the file exists", async () => {
  // The live `field-plough-01` case: runtimePath null, GLB present anyway.
  await withFixture(
    {
      assetRoot: ASSET_ROOT,
      entries: [{ id: "deferred", runtimePath: null }],
    },
    [`${ASSET_ROOT}/deferred.glb`],
    (result) => {
      assert.equal(result.deferredButPresent.length, 1);
      assert.equal(result.deferredButPresent[0].id, "deferred");
      // It is also undeclared — both findings are true and both are reported.
      assert.equal(result.undeclared.length, 1);
    },
  );
});

test("ignores build output and vendor trees", async () => {
  // Without the skip list every dependency's sample models would be reported.
  await withFixture(
    { assetRoot: ASSET_ROOT, entries: [] },
    [
      "node_modules/three/example.glb",
      "dist/client/bundled.glb",
      ".git/objects/blob.glb",
    ],
    (result) => {
      assert.deepEqual(result.undeclared, []);
    },
  );
});

test("ignores non-runtime asset formats", async () => {
  // References and source art are tracked with runtimePath null by design and
  // are not distribution risks; only shippable binaries are in scope.
  await withFixture(
    { assetRoot: ASSET_ROOT, entries: [] },
    ["assets/generated/reference.png", "assets/workbench/authored.ts"],
    (result) => {
      assert.deepEqual(result.undeclared, []);
    },
  );
});

test("treats .gltf as a runtime binary alongside .glb", async () => {
  await withFixture(
    { assetRoot: ASSET_ROOT, entries: [] },
    [`${ASSET_ROOT}/scene.gltf`],
    (result) => {
      assert.equal(result.undeclared.length, 1);
    },
  );
});

test("tolerates a manifest with no entries array", async () => {
  await withFixture(
    { assetRoot: ASSET_ROOT },
    [`${ASSET_ROOT}/a.glb`],
    (result) => {
      assert.equal(result.undeclared.length, 1);
    },
  );
});
