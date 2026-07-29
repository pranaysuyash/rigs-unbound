import { describe, expect, it } from "vitest";
import * as THREE from "three";

import { refreshTerrainNormalsInRegion } from "./renderer";

/**
 * Mirrors buildTerrain()'s exact grid layout and index winding
 * (`a, c, b, b, c, d` per cell) so this test exercises the real triangulation,
 * not a simplified stand-in.
 */
function buildGridGeometry(
  cells: number,
  height: (ix: number, iz: number) => number,
): THREE.BufferGeometry {
  const size = cells + 1;
  const positions = new Float32Array(size * size * 3);
  for (let iz = 0; iz < size; iz += 1) {
    for (let ix = 0; ix < size; ix += 1) {
      const i = iz * size + ix;
      positions[i * 3] = ix;
      positions[i * 3 + 1] = height(ix, iz);
      positions[i * 3 + 2] = iz;
    }
  }
  const indices: number[] = [];
  for (let iz = 0; iz < cells; iz += 1) {
    for (let ix = 0; ix < cells; ix += 1) {
      const a = iz * size + ix;
      const b = a + 1;
      const c = a + size;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

/** A non-flat height field so normals vary and a trivial all-zero pass can't pass by accident. */
function baseHeight(ix: number, iz: number): number {
  return Math.sin(ix * 0.35) * Math.cos(iz * 0.28) + 0.05 * ix;
}

describe("refreshTerrainNormalsInRegion", () => {
  const cells = 12;
  const size = cells + 1;

  it("matches a full computeVertexNormals() recompute for every vertex after a patch deformation", () => {
    // "expected": deform, then do what buildTerrain/refreshTerrainRegion's old
    // code path did — a full geometry.computeVertexNormals().
    const expectedGeo = buildGridGeometry(cells, baseHeight);
    expectedGeo.computeVertexNormals();

    const minIx = 4;
    const maxIx = 7;
    const minIz = 3;
    const maxIz = 6;
    const expectedPosition = expectedGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        expectedPosition.setY(iz * size + ix, baseHeight(ix, iz) + 3.7);
      }
    }
    expectedPosition.needsUpdate = true;
    expectedGeo.computeVertexNormals();
    const expectedNormal = expectedGeo.getAttribute(
      "normal",
    ) as THREE.BufferAttribute;

    // "actual": identical starting geometry and identical deformation, but
    // normals refreshed only through refreshTerrainNormalsInRegion.
    const actualGeo = buildGridGeometry(cells, baseHeight);
    actualGeo.computeVertexNormals(); // matches buildTerrain()'s initial full build
    const actualPosition = actualGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        actualPosition.setY(iz * size + ix, baseHeight(ix, iz) + 3.7);
      }
    }
    actualPosition.needsUpdate = true;
    const actualNormal = actualGeo.getAttribute(
      "normal",
    ) as THREE.BufferAttribute;

    refreshTerrainNormalsInRegion(
      actualPosition,
      actualNormal,
      cells,
      minIx,
      maxIx,
      minIz,
      maxIz,
    );

    for (let iz = 0; iz < size; iz += 1) {
      for (let ix = 0; ix < size; ix += 1) {
        const i = iz * size + ix;
        expect(actualNormal.getX(i)).toBeCloseTo(expectedNormal.getX(i), 6);
        expect(actualNormal.getY(i)).toBeCloseTo(expectedNormal.getY(i), 6);
        expect(actualNormal.getZ(i)).toBeCloseTo(expectedNormal.getZ(i), 6);
      }
    }
  });

  it("does not write outside the changed box plus its one-vertex padding ring", () => {
    const geo = buildGridGeometry(cells, baseHeight);
    geo.computeVertexNormals();
    const position = geo.getAttribute("position") as THREE.BufferAttribute;
    const normal = geo.getAttribute("normal") as THREE.BufferAttribute;

    const minIx = 5;
    const maxIx = 5;
    const minIz = 5;
    const maxIz = 5;
    position.setY(minIz * size + minIx, baseHeight(minIx, minIz) + 9);
    position.needsUpdate = true;

    // Sentinel every vertex so any write outside the intended region is detectable.
    const sentinel = new THREE.Vector3(7, 7, 7);
    const untouchedBefore = new Map<number, THREE.Vector3>();
    for (let iz = 0; iz < size; iz += 1) {
      for (let ix = 0; ix < size; ix += 1) {
        const i = iz * size + ix;
        const inPaddedBox =
          ix >= minIx - 1 && ix <= maxIx + 1 && iz >= minIz - 1 && iz <= maxIz + 1;
        if (!inPaddedBox) {
          untouchedBefore.set(i, new THREE.Vector3().fromBufferAttribute(normal, i));
        } else {
          normal.setXYZ(i, sentinel.x, sentinel.y, sentinel.z);
        }
      }
    }

    refreshTerrainNormalsInRegion(
      position,
      normal,
      cells,
      minIx,
      maxIx,
      minIz,
      maxIz,
    );

    for (const [i, before] of untouchedBefore) {
      expect(normal.getX(i)).toBeCloseTo(before.x, 9);
      expect(normal.getY(i)).toBeCloseTo(before.y, 9);
      expect(normal.getZ(i)).toBeCloseTo(before.z, 9);
    }

    // The padded box itself must have moved off the sentinel — proves the
    // function actually ran, not that everything happened to be untouched.
    const centre = new THREE.Vector3().fromBufferAttribute(
      normal,
      minIz * size + minIx,
    );
    expect(centre.equals(sentinel)).toBe(false);
  });

  it("clamps the padded region to the mesh bounds at grid edges without throwing", () => {
    const geo = buildGridGeometry(cells, baseHeight);
    geo.computeVertexNormals();
    const position = geo.getAttribute("position") as THREE.BufferAttribute;
    const normal = geo.getAttribute("normal") as THREE.BufferAttribute;
    position.setY(0, baseHeight(0, 0) + 2);
    position.needsUpdate = true;

    expect(() =>
      refreshTerrainNormalsInRegion(position, normal, cells, 0, 0, 0, 0),
    ).not.toThrow();

    const n = new THREE.Vector3().fromBufferAttribute(normal, 0);
    expect(Number.isFinite(n.x) && Number.isFinite(n.y) && Number.isFinite(n.z)).toBe(
      true,
    );
    expect(n.length()).toBeCloseTo(1, 5);
  });

  it("matches a full recompute when the deformed box touches the far mesh corner", () => {
    const last = size - 1;
    const expectedGeo = buildGridGeometry(cells, baseHeight);
    expectedGeo.computeVertexNormals();
    const expectedPosition = expectedGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    expectedPosition.setY(last * size + last, baseHeight(last, last) + 5);
    expectedPosition.needsUpdate = true;
    expectedGeo.computeVertexNormals();
    const expectedNormal = expectedGeo.getAttribute(
      "normal",
    ) as THREE.BufferAttribute;

    const actualGeo = buildGridGeometry(cells, baseHeight);
    actualGeo.computeVertexNormals();
    const actualPosition = actualGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    actualPosition.setY(last * size + last, baseHeight(last, last) + 5);
    actualPosition.needsUpdate = true;
    const actualNormal = actualGeo.getAttribute(
      "normal",
    ) as THREE.BufferAttribute;

    refreshTerrainNormalsInRegion(
      actualPosition,
      actualNormal,
      cells,
      last,
      last,
      last,
      last,
    );

    for (let iz = 0; iz < size; iz += 1) {
      for (let ix = 0; ix < size; ix += 1) {
        const i = iz * size + ix;
        expect(actualNormal.getX(i)).toBeCloseTo(expectedNormal.getX(i), 6);
        expect(actualNormal.getY(i)).toBeCloseTo(expectedNormal.getY(i), 6);
        expect(actualNormal.getZ(i)).toBeCloseTo(expectedNormal.getZ(i), 6);
      }
    }
  });
});
