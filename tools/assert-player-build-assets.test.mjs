#!/usr/bin/env node

/**
 * Tests for the player build asset boundary.
 *
 * This file exists because `assert-player-build-assets.mjs` had no test of its
 * own: two integration cases lived in `asset-preflight.test.mjs` (they reuse the
 * GLB fixture helpers there and still do), which left the boundary logic itself
 * unpinned. The cases below drive the pure core directly, so they cover the
 * branches that matter without building a dist tree.
 *
 * The property under test is that the manifest's two artifacts are judged
 * separately: `sourceFormInPlayerBuild` may excuse an identity string in the
 * bundle, and may NEVER excuse the bytes or the export path.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  evaluateBoundary,
  selectGuardedEntries,
} from "./assert-player-build-assets.mjs";

const RUNTIME_PATH = "assets/runtime/widget-01.glb";

function entry(overrides = {}) {
  return {
    id: "widget-01",
    sourcePath: "assets/workbench/widget-01/authored/createWidget.ts",
    runtimePath: RUNTIME_PATH,
    publicRuntimeApproved: false,
    ...overrides,
  };
}

function bundle(contents, bundlePath = "assets/index-abc123.js") {
  return { path: bundlePath, contents };
}

function run({ entries, distPaths = [], bundles = [] }) {
  return evaluateBoundary({
    entries,
    distPaths: new Set(distPaths),
    bundles,
  });
}

// --- which entries the boundary governs -------------------------------------

test("guards every unapproved entry, including ones with no runtime export", () => {
  const guarded = selectGuardedEntries({
    entries: [
      entry({ id: "approved-01", publicRuntimeApproved: true }),
      entry({ id: "unapproved-with-export" }),
      entry({ id: "unapproved-no-export", runtimePath: null }),
    ],
  });

  assert.deepEqual(
    guarded.map((item) => item.id),
    ["unapproved-with-export", "unapproved-no-export"],
  );
});

test("an unapproved entry with a null runtimePath does not match bundle text", () => {
  // Regression: `contents.includes(null)` coerces to the string "null", so a
  // bundle containing the word "null" (i.e. every bundle) would false-positive.
  const { findings } = run({
    entries: [entry({ id: "unapproved-no-export", runtimePath: null })],
    bundles: [bundle("const x = null; // no identity here")],
  });

  assert.deepEqual(findings, []);
});

// --- containment: never exemptable ------------------------------------------

test("flags unapproved bytes present in the build", () => {
  const { findings } = run({
    entries: [entry()],
    distPaths: [RUNTIME_PATH],
  });

  assert.equal(findings.length, 1);
  assert.match(findings[0], /unapproved runtime file exists/);
});

test("sourceFormInPlayerBuild does NOT excuse shipped bytes", () => {
  const { findings } = run({
    entries: [entry({ sourceFormInPlayerBuild: true })],
    distPaths: [RUNTIME_PATH],
    bundles: [bundle('userData.assetId = "widget-01";')],
  });

  assert.ok(
    findings.some((item) => /unapproved runtime file exists/.test(item)),
    "byte containment must hold regardless of the source-form declaration",
  );
});

test("sourceFormInPlayerBuild does NOT excuse a referenced export path", () => {
  const { findings } = run({
    entries: [entry({ sourceFormInPlayerBuild: true })],
    bundles: [bundle(`fetch("${RUNTIME_PATH}")`)],
  });

  assert.ok(
    findings.some((item) => /unapproved runtime path is referenced/.test(item)),
    "a bundle fetching the withheld export is a breach attempt, not a disclosure",
  );
});

// --- disclosure: exemptable, and verified -----------------------------------

test("flags an unapproved identity in the bundle when no exemption is declared", () => {
  const { findings, notes } = run({
    entries: [entry()],
    bundles: [bundle('userData.assetId = "widget-01";')],
  });

  assert.equal(findings.length, 1);
  assert.match(findings[0], /unapproved manifest identity is exposed by/);
  assert.deepEqual(notes, []);
});

test("accepts the identity when the source form is declared to ship, and says so", () => {
  const { findings, notes } = run({
    entries: [entry({ sourceFormInPlayerBuild: true })],
    bundles: [bundle('userData.assetId = "widget-01";')],
  });

  assert.deepEqual(findings, []);
  assert.equal(notes.length, 1);
  assert.match(notes[0], /accounted for by the declared source form/);
  assert.match(notes[0], /createWidget\.ts/);
});

test("reports one finding per exposing bundle file", () => {
  const { findings } = run({
    entries: [entry()],
    bundles: [
      bundle('"widget-01"', "assets/index-abc123.js"),
      bundle('"widget-01"', "assets/index-abc123.js.map"),
    ],
  });

  assert.equal(findings.length, 2);
});

// --- the exemption must stay load-bearing -----------------------------------

test("flags a stale exemption whose identity appears in no bundle", () => {
  const { findings } = run({
    entries: [entry({ sourceFormInPlayerBuild: true })],
    bundles: [bundle("nothing relevant here")],
  });

  assert.equal(findings.length, 1);
  assert.match(findings[0], /exemption is stale/);
});

test("an unapproved entry absent from the build is clean and silent", () => {
  const { findings, notes } = run({
    entries: [entry()],
    bundles: [bundle("unrelated bundle text")],
  });

  assert.deepEqual(findings, []);
  assert.deepEqual(notes, []);
});

test("approved entries are ignored entirely", () => {
  const { findings } = run({
    entries: selectGuardedEntries({
      entries: [entry({ publicRuntimeApproved: true })],
    }),
    distPaths: [RUNTIME_PATH],
    bundles: [bundle('"widget-01"')],
  });

  assert.deepEqual(findings, []);
});
