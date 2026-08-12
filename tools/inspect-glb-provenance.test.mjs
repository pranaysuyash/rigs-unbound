#!/usr/bin/env node

/**
 * Tests for the GLB provenance inspector.
 *
 * The inspector's value is that it reads `asset.generator` — the cheapest
 * provenance signal a GLB carries — so these tests pin the parse against
 * synthetic containers rather than repository fixtures. Real fixtures would
 * make the tests pass or fail for reasons unrelated to the parser (an asset
 * getting re-exported, or removed, as `plow_4_furrow.glb` was).
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { parseGlb, summarise } from "./inspect-glb-provenance.mjs";

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function chunk(type, payload) {
  const padding = (4 - (payload.length % 4)) % 4;
  const padded = Buffer.concat([
    payload,
    Buffer.alloc(padding, type === JSON_CHUNK ? 0x20 : 0x00),
  ]);
  const header = Buffer.alloc(8);
  header.writeUInt32LE(padded.length, 0);
  header.writeUInt32LE(type, 4);
  return Buffer.concat([header, padded]);
}

function buildGlb(json, binary = null) {
  const chunks = [chunk(JSON_CHUNK, Buffer.from(JSON.stringify(json), "utf8"))];
  if (binary) chunks.push(chunk(BIN_CHUNK, binary));
  const body = Buffer.concat(chunks);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + body.length, 8);
  return Buffer.concat([header, body]);
}

const MINIMAL = {
  asset: { version: "2.0", generator: "THREE.GLTFExporter r185" },
  scenes: [{ nodes: [0] }],
  nodes: [{ name: "field-plough-01" }],
  meshes: [{ name: "beam", primitives: [{ attributes: {}, material: 0 }] }],
  materials: [{ name: "paintedSteel" }],
};

// --- container parsing ------------------------------------------------------

test("parses a well-formed JSON+BIN container", () => {
  const parsed = parseGlb(buildGlb(MINIMAL, Buffer.alloc(16, 7)));

  assert.equal(parsed.version, 2);
  assert.deepEqual(parsed.chunks, ["JSON", "BIN"]);
  assert.equal(parsed.binaryLength, 16);
  assert.equal(parsed.json.asset.generator, "THREE.GLTFExporter r185");
});

test("parses a JSON-only container", () => {
  const parsed = parseGlb(buildGlb(MINIMAL));
  assert.deepEqual(parsed.chunks, ["JSON"]);
  assert.equal(parsed.binaryLength, 0);
});

test("rejects a file whose magic is not glTF", () => {
  const bogus = buildGlb(MINIMAL);
  bogus.write("FBX ", 0, "ascii");
  assert.throws(() => parseGlb(bogus), /not a GLB/);
});

test("rejects a file too short to hold a header", () => {
  assert.throws(() => parseGlb(Buffer.alloc(8)), /too short/);
});

test("rejects a chunk that overruns the file", () => {
  const truncated = buildGlb(MINIMAL);
  truncated.writeUInt32LE(0xffff, 12); // JSON chunk claims more than exists
  assert.throws(() => parseGlb(truncated), /past end of file/);
});

test("rejects a container with no JSON chunk", () => {
  const binOnly = Buffer.concat([
    (() => {
      const header = Buffer.alloc(12);
      header.write("glTF", 0, "ascii");
      header.writeUInt32LE(2, 4);
      header.writeUInt32LE(12, 8);
      return header;
    })(),
    chunk(BIN_CHUNK, Buffer.alloc(4)),
  ]);
  assert.throws(() => parseGlb(binOnly), /no JSON chunk/);
});

// --- provenance summary -----------------------------------------------------

test("surfaces the generator, digest, and structure counts", () => {
  const buffer = buildGlb(MINIMAL, Buffer.alloc(8));
  const summary = summarise(buffer, "fixture.glb");

  assert.equal(summary.generator, "THREE.GLTFExporter r185");
  assert.equal(summary.glTFVersion, "2.0");
  assert.equal(summary.bytes, buffer.length);
  assert.match(summary.sha256, /^[a-f0-9]{64}$/);
  assert.equal(summary.lengthMatchesHeader, true);
  assert.equal(summary.counts.nodes, 1);
  assert.equal(summary.counts.materials, 1);
  assert.equal(summary.counts.primitives, 1);
  assert.equal(summary.anyPrimitiveHasMaterial, true);
  assert.deepEqual(summary.nodeNames, ["field-plough-01"]);
  assert.deepEqual(summary.materialNames, ["paintedSteel"]);
});

test("reports an absent generator rather than inventing one", () => {
  const summary = summarise(
    buildGlb({ asset: { version: "2.0" } }),
    "fixture.glb",
  );

  assert.equal(summary.generator, null);
  assert.equal(summary.copyright, null);
  assert.equal(summary.assetExtras, null);
});

test("distinguishes unsurfaced geometry, the shape of an unprovenanced dump", () => {
  // This is the shape `plow_4_furrow.glb` had: trimesh generator, auto-named
  // nodes, and geometry with no material reference at all.
  const summary = summarise(
    buildGlb({
      asset: { version: "2.0", generator: "https://github.com/mikedh/trimesh" },
      scenes: [{ nodes: [0] }],
      nodes: [{ name: "world" }, { name: "geometry_0" }],
      meshes: [{ primitives: [{ attributes: {} }] }],
    }),
    "fixture.glb",
  );

  assert.equal(summary.generator, "https://github.com/mikedh/trimesh");
  assert.equal(summary.counts.materials, 0);
  assert.equal(summary.anyPrimitiveHasMaterial, false);
  assert.deepEqual(summary.nodeNames, ["world", "geometry_0"]);
  assert.deepEqual(summary.meshNames, ["(unnamed)"]);
});

test("flags a header length that disagrees with the file size", () => {
  const buffer = buildGlb(MINIMAL);
  buffer.writeUInt32LE(buffer.length + 4, 8);
  assert.equal(summarise(buffer, "fixture.glb").lengthMatchesHeader, false);
});

test("records declared copyright and extras when present", () => {
  const summary = summarise(
    buildGlb({
      asset: {
        version: "2.0",
        generator: "Blender glTF 2.0",
        copyright: "CC0 1.0",
        extras: { sourceKit: "kenney-car-kit" },
      },
    }),
    "fixture.glb",
  );

  assert.equal(summary.copyright, "CC0 1.0");
  assert.deepEqual(summary.assetExtras, { sourceKit: "kenney-car-kit" });
});
