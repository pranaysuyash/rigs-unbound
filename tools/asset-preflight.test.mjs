import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  preflightGlbBuffer,
  preflightManifestFile,
} from "./asset-preflight.mjs";
import { assertPlayerBuildAssetBoundary } from "./assert-player-build-assets.mjs";

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
  assert.ok(report.entries > 0);
});

test("manifest-linked canonical asset specs are present and structurally grounded", async () => {
  const report = await preflightManifestFile(
    path.join(projectRoot, "assets/asset-manifest.json"),
  );
  assert.equal(
    report.findings.some((item) => item.code.startsWith("spec-")),
    false,
  );
  const fieldPlough = JSON.parse(
    await readFile(
      path.join(projectRoot, "assets/specs/field-plough-01.asset.json"),
      "utf8",
    ),
  );
  assert.equal(fieldPlough.assetId, "field-plough-01");
  assert.equal(fieldPlough.lifecycle.status, "procedural-candidate");
  assert.match(
    fieldPlough.lifecycle.runtimeAdmission,
    /available-for-development-and-open-world-review/,
  );
  assert.ok(fieldPlough.validation.evidenceRoadmap.length >= 3);
  assert.ok(fieldPlough.components.length >= 1);
  assert.ok(fieldPlough.behaviour.states.length >= 3);
  assert.equal(
    fieldPlough.runtime.generatedRuntime.glbPath,
    "assets/runtime/field-plough-01.glb",
  );
  assert.equal(
    fieldPlough.runtime.generatedRuntime.glbSha256,
    "fa3681d96758b4808d84061858dd999b79dcc58307f574d2bf248896f356dc20",
  );
  assert.equal(
    fieldPlough.runtime.generatedRuntime.factoryPath,
    "assets/workbench/field-plough-01/authored/createFieldPloughModel.ts",
  );
});

test("field-plough compiler outputs remain present and linked to the canonical definition", async () => {
  const derivedSpec = JSON.parse(
    await readFile(
      path.join(
        projectRoot,
        "assets/workbench/field-plough-01/object-sculpt-spec.json",
      ),
      "utf8",
    ),
  );
  const factory = await readFile(
    path.join(
      projectRoot,
      "assets/workbench/field-plough-01/generated/createFieldPloughModel.ts",
    ),
    "utf8",
  );

  assert.equal(derivedSpec.targetId, "field-plough-01");
  assert.equal(derivedSpec.sculptPipeline.currentPass, "blockout");
  assert.equal(derivedSpec.repetitionSystems.length, 2);
  assert.equal(derivedSpec.qualityTargets.reviewViewpoints.length, 4);
  assert.match(factory, /createFieldPlough01Model/);
  assert.match(factory, /field-plough/);
});

test("field-plough canonical authored factory preserves the reference-specific assembly", async () => {
  const factory = await readFile(
    path.join(
      projectRoot,
      "assets/workbench/field-plough-01/authored/createFieldPloughModel.ts",
    ),
    "utf8",
  );
  const review = JSON.parse(
    await readFile(
      path.join(
        projectRoot,
        "assets/workbench/field-plough-01/review/visual-parity-review.json",
      ),
      "utf8",
    ),
  );

  assert.match(factory, /shareCount === 3/);
  assert.match(factory, /\[-1\.68, -0\.56, 0\.56, 1\.68\]/);
  assert.match(factory, /top-link-socket/);
  assert.match(factory, /hydraulic-ram/);
  assert.match(factory, /simulation-owned/);
  assert.equal(review.classification, "development-ready procedural blockout");
  assert.equal(review.photorealProductionReady, false);
  assert.equal(review.admissionDecision.developmentProceduralUse, "accepted");
  assert.equal(review.img2threejsGateState.currentPass, "blockout");
  assert.deepEqual(review.img2threejsGateState.completedPasses, []);
  assert.equal(review.img2threejsGateState.tier1Passed, false);
  assert.equal(review.img2threejsGateState.decision, "refine-code");

  const sculptSpec = JSON.parse(
    await readFile(
      path.join(
        projectRoot,
        "assets/workbench/field-plough-01/object-sculpt-spec.json",
      ),
      "utf8",
    ),
  );
  assert.equal(sculptSpec.sculptPipeline.currentPass, "blockout");
  assert.deepEqual(sculptSpec.sculptPipeline.completedPasses, []);
  assert.equal(sculptSpec.reviewHistory.at(-1)?.action, "refine-code");
  assert.equal(
    sculptSpec.componentTree.find(
      (component) => component.id === "share-center",
    )?.geometryDescriptor.helicoidalSurface.sectionCount,
    9,
  );
});

test("field-plough exposes a reusable customizable part contract", async () => {
  const factory = await readFile(
    path.join(
      projectRoot,
      "assets/workbench/field-plough-01/authored/createFieldPloughModel.ts",
    ),
    "utf8",
  );
  const partPackage = JSON.parse(
    await readFile(
      path.join(
        projectRoot,
        "assets/workbench/field-plough-01/package/field-plough-01.part-package.json",
      ),
      "utf8",
    ),
  );

  assert.match(factory, /export function applyFieldPlough01Variant/);
  assert.match(factory, /shareCount\?: 3 \| 4/);
  assert.match(factory, /share-\$\{index \+ 1\}-mount-socket/);
  assert.deepEqual(partPackage.variantContract.shareCount, [3, 4]);
  assert.ok(partPackage.attachmentContract.sockets.includes("top-link-socket"));
  assert.equal(
    partPackage.runtimeDerivative.path,
    "assets/runtime/field-plough-01.glb",
  );
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
            runtimePresentation: {
              siteId: "test-site",
              offsetX: 0,
              offsetZ: 0,
              yaw: 0,
              targetMaxDimension: 1,
              fallbackWidth: 1,
              fallbackHeight: 1,
              fallbackDepth: 1,
              fallbackColor: 0,
            },
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
            runtimePresentation: {
              siteId: "test-site",
              offsetX: 0,
              offsetZ: 0,
              yaw: 0,
              targetMaxDimension: 1,
              fallbackWidth: 1,
              fallbackHeight: 1,
              fallbackDepth: 1,
              fallbackColor: 0,
            },
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

test("player build assertion rejects unapproved files and compiled identities", async () => {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-player-build-"),
  );
  try {
    const manifestPath = path.join(tempRoot, "assets/asset-manifest.json");
    const runtimePath = path.join(
      tempRoot,
      "dist/client/assets/runtime/proof.glb",
    );
    const bundlePath = path.join(tempRoot, "dist/client/assets/app.js");
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await mkdir(path.dirname(runtimePath), { recursive: true });
    await mkdir(path.dirname(bundlePath), { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({
        entries: [
          {
            id: "developer-proof",
            runtimePath: "assets/runtime/proof.glb",
            publicRuntimeApproved: false,
          },
        ],
      }),
    );
    await writeFile(runtimePath, "proof");
    await writeFile(bundlePath, 'const id = "developer-proof";');

    const { findings } = await assertPlayerBuildAssetBoundary(
      manifestPath,
      path.join(tempRoot, "dist/client"),
    );

    assert.ok(findings.some((item) => item.includes("runtime file exists")));
    assert.ok(
      findings.some((item) => item.includes("manifest identity is exposed")),
    );
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("player build assertion accepts a distribution with no unapproved exposure", async () => {
  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "rigs-unbound-clean-player-build-"),
  );
  try {
    const manifestPath = path.join(tempRoot, "assets/asset-manifest.json");
    const bundlePath = path.join(tempRoot, "dist/client/assets/app.js");
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await mkdir(path.dirname(bundlePath), { recursive: true });
    await writeFile(
      manifestPath,
      JSON.stringify({
        entries: [
          {
            id: "developer-proof",
            runtimePath: "assets/runtime/proof.glb",
            publicRuntimeApproved: false,
          },
        ],
      }),
    );
    await writeFile(bundlePath, 'const player = "ready";');

    await assert.doesNotReject(async () => {
      const { findings } = await assertPlayerBuildAssetBoundary(
        manifestPath,
        path.join(tempRoot, "dist/client"),
      );
      assert.deepEqual(findings, []);
    });
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
