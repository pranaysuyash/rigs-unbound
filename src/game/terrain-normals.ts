import * as THREE from "three";

export function refreshTerrainNormalsInRegion(
  position: THREE.BufferAttribute,
  normal: THREE.BufferAttribute,
  cells: number,
  minIx: number,
  maxIx: number,
  minIz: number,
  maxIz: number,
): void {
  const size = cells + 1;
  const vertMinIx = Math.max(0, minIx - 1);
  const vertMaxIx = Math.min(size - 1, maxIx + 1);
  const vertMinIz = Math.max(0, minIz - 1);
  const vertMaxIz = Math.min(size - 1, maxIz + 1);

  for (let iz = vertMinIz; iz <= vertMaxIz; iz += 1) {
    for (let ix = vertMinIx; ix <= vertMaxIx; ix += 1) {
      normal.setXYZ(iz * size + ix, 0, 0, 0);
    }
  }

  // Source region: cells that touch any write-region vertex. A cell at
  // column/row `ix`/`iz` spans vertex columns `ix..ix+1` / rows `iz..iz+1`,
  // so the cell range is the write-vertex range widened by one more cell.
  const cellMinIx = Math.max(0, vertMinIx - 1);
  const cellMaxIx = Math.min(cells - 1, vertMaxIx);
  const cellMinIz = Math.max(0, vertMinIz - 1);
  const cellMaxIz = Math.min(cells - 1, vertMaxIz);

  const inWriteRegion = (ix: number, iz: number): boolean =>
    ix >= vertMinIx && ix <= vertMaxIx && iz >= vertMinIz && iz <= vertMaxIz;

  const pA = new THREE.Vector3();
  const pB = new THREE.Vector3();
  const pC = new THREE.Vector3();
  const nA = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  const accumulate = (
    vA: number,
    vB: number,
    vC: number,
    writeA: boolean,
    writeB: boolean,
    writeC: boolean,
  ): void => {
    if (!writeA && !writeB && !writeC) return;
    pA.fromBufferAttribute(position, vA);
    pB.fromBufferAttribute(position, vB);
    pC.fromBufferAttribute(position, vC);
    cb.subVectors(pC, pB);
    ab.subVectors(pA, pB);
    cb.cross(ab);
    if (writeA) {
      nA.fromBufferAttribute(normal, vA).add(cb);
      normal.setXYZ(vA, nA.x, nA.y, nA.z);
    }
    if (writeB) {
      nA.fromBufferAttribute(normal, vB).add(cb);
      normal.setXYZ(vB, nA.x, nA.y, nA.z);
    }
    if (writeC) {
      nA.fromBufferAttribute(normal, vC).add(cb);
      normal.setXYZ(vC, nA.x, nA.y, nA.z);
    }
  };

  for (let iz = cellMinIz; iz <= cellMaxIz; iz += 1) {
    for (let ix = cellMinIx; ix <= cellMaxIx; ix += 1) {
      // Same winding as buildTerrain's index buffer: (a, c, b), (b, c, d).
      const a = iz * size + ix;
      const b = a + 1;
      const c = a + size;
      const d = c + 1;
      const wA = inWriteRegion(ix, iz);
      const wB = inWriteRegion(ix + 1, iz);
      const wC = inWriteRegion(ix, iz + 1);
      const wD = inWriteRegion(ix + 1, iz + 1);
      accumulate(a, c, b, wA, wC, wB);
      accumulate(b, c, d, wB, wC, wD);
    }
  }

  for (let iz = vertMinIz; iz <= vertMaxIz; iz += 1) {
    for (let ix = vertMinIx; ix <= vertMaxIx; ix += 1) {
      const i = iz * size + ix;
      nA.fromBufferAttribute(normal, i).normalize();
      normal.setXYZ(i, nA.x, nA.y, nA.z);
    }
  }

  normal.needsUpdate = true;
}
