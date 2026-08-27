import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type HarvesterModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  headerActive?: boolean;
  augerExtended?: boolean;
};

function fabricatedBoxGeometry(
  width: number,
  height: number,
  depth: number,
): RoundedBoxGeometry {
  const smallestDimension = Math.min(width, height, depth);
  return new RoundedBoxGeometry(
    width,
    height,
    depth,
    2,
    Math.min(0.028, smallestDimension * 0.12),
  );
}

const harvesterGreen = new THREE.MeshStandardMaterial({
  color: 0x2e6b36,
  metalness: 0.3,
  roughness: 0.5,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x222629,
  metalness: 0.75,
  roughness: 0.5,
});

const headerSteel = new THREE.MeshStandardMaterial({
  color: 0xb0b8c0,
  metalness: 0.85,
  roughness: 0.35,
});

const rubberBlack = new THREE.MeshStandardMaterial({
  color: 0x1a1c1e,
  metalness: 0.1,
  roughness: 0.85,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x98d4e8,
  metalness: 0.05,
  roughness: 0.05,
  transmission: 0.8,
  transparent: true,
  opacity: 0.75,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: HarvesterModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createHarvesterModel(
  options: HarvesterModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "harvester-combined-cultivator-01";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.3,
        roughness: 0.5,
      })
    : harvesterGreen;

  // 1. Chassis Frame
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-frame";

  const mainBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 1.4, 4.2), paintMat),
    options,
  );
  mainBody.position.set(0, 1.3, 0);
  chassisGroup.add(mainBody);

  const subFrame = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.2, 0.4, 4.4), frameDark),
    options,
  );
  subFrame.position.set(0, 0.6, 0);
  chassisGroup.add(subFrame);

  root.add(chassisGroup);

  // 2. High Panoramic Glass Cabin
  const cabGroup = new THREE.Group();
  cabGroup.name = "panoramic-glass-cab";
  cabGroup.position.set(0, 2.3, 1.4);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.2, 1.2, 1.6), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  const glassWindow = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.1, 0.8, 0.1), glassMaterial),
    options,
  );
  glassWindow.position.set(0, 0.1, 0.76);
  cabGroup.add(glassWindow);

  // Ladder
  const ladder = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.4, 1.8, 0.1), frameDark),
    options,
  );
  ladder.position.set(-1.15, -0.6, 0.5);
  cabGroup.add(ladder);

  root.add(cabGroup);

  // 3. Wide Front Rotary Cutter Header Drum
  const headerGroup = new THREE.Group();
  headerGroup.name = "rotary-header-drum";
  headerGroup.position.set(0, 0.5, 2.6);

  const headerFrame = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(4.4, 0.6, 0.8), frameDark),
    options,
  );
  headerGroup.add(headerFrame);

  const reelDrum = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.2, 24), headerSteel),
    options,
  );
  reelDrum.rotation.z = Math.PI / 2;
  reelDrum.position.set(0, 0.1, 0.2);
  headerGroup.add(reelDrum);

  root.add(headerGroup);

  // 4. Grain Tank & Auger Pipe
  const augerGroup = new THREE.Group();
  augerGroup.name = "grain-tank-auger";
  augerGroup.position.set(0, 2.2, -0.5);

  const hopper = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.3, 0.9, 2.4), frameDark),
    options,
  );
  augerGroup.add(hopper);

  const augerPipe = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 16), headerSteel),
    options,
  );
  if (options.augerExtended) {
    augerPipe.rotation.y = Math.PI / 2; // Swiveled outward for unloading
    augerPipe.position.set(1.9, 0.4, 0);
  } else {
    augerPipe.rotation.x = Math.PI / 2; // Stowed along side
    augerPipe.position.set(-1.25, 0.4, -0.8);
  }
  augerGroup.add(augerPipe);

  root.add(augerGroup);

  // 5. Dual Front Drive Wheels
  //
  // Each side's dual tyres live inside one named pivot group so the renderer
  // can hand the kernel real spin pivots (FL, FR, RL, RR physics order) and
  // parent them into its steering columns. Tyre offsets are relative to the
  // pivot; the pivot sits at the dual-set's mean track position.
  const frontWheelsGroup = new THREE.Group();
  frontWheelsGroup.name = "dual-front-wheels";

  const frontTyreGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.5, 24);
  for (const [side, suffix] of [
    [-1, "fl"],
    [1, "fr"],
  ] as const) {
    const pivot = new THREE.Group();
    pivot.name = `wheel-${suffix}`;
    pivot.position.set(side * 1.575, 0.75, 1.2);
    for (const dual of [-0.275, 0.275]) {
      const tyre = finishMesh(new THREE.Mesh(frontTyreGeo, rubberBlack), options);
      tyre.rotation.z = Math.PI / 2;
      tyre.position.set(dual, 0, 0);
      pivot.add(tyre);
    }
    frontWheelsGroup.add(pivot);
  }
  root.add(frontWheelsGroup);

  // 6. Rear Wheels
  const rearWheelsGroup = new THREE.Group();
  rearWheelsGroup.name = "rear-steering-wheels";

  const rearTyreGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24);
  for (const [side, suffix] of [
    [-1, "rl"],
    [1, "rr"],
  ] as const) {
    const pivot = new THREE.Group();
    pivot.name = `wheel-${suffix}`;
    pivot.position.set(side * 1.2, 0.5, -1.8);
    const tyre = finishMesh(new THREE.Mesh(rearTyreGeo, rubberBlack), options);
    tyre.rotation.z = Math.PI / 2;
    pivot.add(tyre);
    rearWheelsGroup.add(pivot);
  }
  root.add(rearWheelsGroup);

  // Chaff spreader fan housing at rear — doubles as the rear axis marker.
  // (The kernel sim steers the front pair; the authored rear-steer identity
  // stays in the geometry naming.)
  const spreader = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.8, 0.5, 0.6), frameDark),
    options,
  );
  spreader.name = "rear-marker";
  spreader.position.set(0, 0.65, -2.2);
  root.add(spreader);

  return root;
}

/**
 * Wheel spin pivots in kernel physics order: front-left, front-right,
 * rear-left, rear-right. Front pivots carry both dual tyres; the kernel
 * spins each pivot about its local X.
 */
export function harvesterWheelPivots(model: THREE.Group): THREE.Group[] {
  const pivots = ["wheel-fl", "wheel-fr", "wheel-rl", "wheel-rr"].map((name) =>
    model.getObjectByName(name),
  );
  if (pivots.some((pivot) => !(pivot instanceof THREE.Group))) {
    throw new Error(
      "harvester-combined-cultivator-01: authored model is missing its wheel pivots",
    );
  }
  return pivots as THREE.Group[];
}
