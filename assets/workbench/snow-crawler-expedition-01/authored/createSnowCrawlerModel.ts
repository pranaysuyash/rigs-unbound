import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { RigBlockout } from "../../../../src/game/rig-blockout";

/**
 * Sub-Zero Expedition Snow Crawler — authored FORM lane model.
 *
 * Rebuilt from the reference plates
 * (`assets/generated/rig_concepts/snow_crawler_expedition_01_{concept,orthographic,details}.png`)
 * under the Two-Lane Contract: every metre arrives through
 * {@link SnowCrawlerDimensions} (derived from `blockoutFor`); this file owns
 * only ratios, composition, and materials. Authored in the GROUND frame —
 * track contact at y ≈ 0, front of the rig toward +Z.
 *
 * Runtime anchors the renderer and acceptance gates depend on:
 * - exactly four meshes named `"tyre"` (belt ground runs, front/rear per
 *   side) whose lowest extent touches y ≈ 0 — the ground-contact contract;
 * - four spin pivots named `spin-roller-{front|rear}-{left|right}`, exported
 *   in the kernel's wheel order (FL, FR, RL, RR) via
 *   {@link snowCrawlerSpinPivots}; each pivot contains its roller (front
 *   pivots also carry the drive sprocket);
 * - `front-marker` on the plow and `rear-marker` on the rear bumper.
 */

export type SnowCrawlerDimensions = {
  /** Armored body width (narrower than the track outer edges, per the plate). */
  bodyWidth: number;
  /** Armored body length along Z. */
  bodyLength: number;
  /** Body underside in the GROUND frame (belly clearance). */
  bodyBottomY: number;
  /** Roofline in the GROUND frame (before roof furniture). */
  roofY: number;
  /** Track centre-line |x| (half of the profile `track`). */
  trackHalfX: number;
  /** Belt width across X. */
  beltWidth: number;
  /** Belt outer height from the contact plane. */
  beltHeight: number;
  /** Belt loop length along Z. */
  beltLength: number;
  /** Belt corner radius (roller-orbit radius on the loop ends). */
  beltCornerRadius: number;
  /** Road roller radius. */
  rollerRadius: number;
  /** Road roller hub height in the GROUND frame. */
  rollerRestY: number;
  /** |z| of the front/rear spin rollers (kernel wheel positions). */
  spinRollerZ: number;
  /** Profile mean rolling radius — the kernel's reference wheel. */
  profileWheelRadius: number;
};

export type SnowCrawlerModelOptions = {
  dimensions?: SnowCrawlerDimensions;
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  plowActive?: boolean;
  thermalGlowActive?: boolean;
  qualityPriority?: "reference-fidelity" | "runtime-budget";
};

/**
 * DIMENSIONS lane adapter: derive every authored metre from the canonical
 * blockout so a profile change rescales the whole model coherently. Ratios
 * live here; metres come in through the blockout.
 */
export function snowCrawlerDimensionsFromBlockout(
  blockout: RigBlockout,
): SnowCrawlerDimensions {
  const beltWidth = blockout.wheelMounts[0]?.width ?? 0.78;
  return {
    bodyWidth: blockout.hull.width * 0.86,
    bodyLength: blockout.hull.depth * 0.845,
    bodyBottomY: blockout.hull.bottomY + 0.02,
    roofY: blockout.hull.topY + 1.88,
    trackHalfX: blockout.profile.track / 2,
    beltWidth,
    beltHeight: blockout.profile.rideHeight * 1.59,
    beltLength: blockout.profile.wheelbase * 1.175,
    beltCornerRadius: blockout.profile.rideHeight * 0.45,
    rollerRadius: blockout.profile.wheelRadius * 0.462,
    rollerRestY: blockout.profile.rideHeight * 0.4,
    spinRollerZ: blockout.profile.wheelbase * 0.375,
    profileWheelRadius: blockout.profile.wheelRadius,
  };
}

const DEFAULT_DIMENSIONS: SnowCrawlerDimensions = {
  bodyWidth: 2.4,
  bodyLength: 4.9,
  bodyBottomY: 0.55,
  roofY: 3.05,
  trackHalfX: 1.4,
  beltWidth: 0.62,
  beltHeight: 1.35,
  beltLength: 4.7,
  beltCornerRadius: 0.38,
  rollerRadius: 0.3,
  rollerRestY: 0.34,
  spinRollerZ: 1.5,
  profileWheelRadius: 0.65,
};

// ---------------------------------------------------------------------------
// Palette (Patchwork Atlas, matched against the reference plates)
// ---------------------------------------------------------------------------

/**
 * Fresh materials per factory call. The renderer's zero-leak disposal
 * (`disposeObjectGraph`) may tear a scene down mid-session (WebGL backend
 * fallback), so no material may be shared across model instances.
 */
function createSnowCrawlerMaterials() {
  return {
    paint: new THREE.MeshStandardMaterial({
      color: 0x7d8b73,
      metalness: 0.22,
      roughness: 0.55,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0x4a5054,
      metalness: 0.72,
      roughness: 0.46,
    }),
    trackSteel: new THREE.MeshStandardMaterial({
      color: 0x2c3033,
      metalness: 0.66,
      roughness: 0.55,
    }),
    rubber: new THREE.MeshStandardMaterial({
      color: 0x212426,
      metalness: 0.12,
      roughness: 0.9,
    }),
    snow: new THREE.MeshStandardMaterial({
      color: 0xeef2f4,
      metalness: 0.0,
      roughness: 0.4,
    }),
    thermal: new THREE.MeshStandardMaterial({
      color: 0x9c0f06,
      emissive: 0xb00a00,
      emissiveIntensity: 3.4,
      metalness: 0.1,
      roughness: 0.3,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x39464e,
      metalness: 0.1,
      roughness: 0.18,
      transmission: 0.2,
      transparent: true,
      opacity: 0.94,
    }),
    lamp: new THREE.MeshStandardMaterial({
      color: 0xffdf95,
      emissive: 0xffc35e,
      emissiveIntensity: 1.1,
      metalness: 0.2,
      roughness: 0.25,
    }),
    marker: new THREE.MeshStandardMaterial({
      color: 0xd97a2b,
      emissive: 0x93430f,
      emissiveIntensity: 0.35,
      metalness: 0.2,
      roughness: 0.5,
    }),
    wood: new THREE.MeshStandardMaterial({
      color: 0x5a4a33,
      metalness: 0.05,
      roughness: 0.85,
    }),
  };
}

type SnowCrawlerMaterials = ReturnType<typeof createSnowCrawlerMaterials>;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

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
    Math.min(0.03, smallestDimension * 0.12),
  );
}

type MeshFinish = (mesh: THREE.Mesh) => THREE.Mesh;

function makeFinish(options: SnowCrawlerModelOptions): MeshFinish {
  return (mesh) => {
    mesh.castShadow = options.castShadow ?? true;
    mesh.receiveShadow = options.receiveShadow ?? true;
    return mesh;
  };
}

function finish(
  geometry: THREE.BufferGeometry,
  mat: THREE.Material,
  finishMesh: MeshFinish,
): THREE.Mesh {
  return finishMesh(new THREE.Mesh(geometry, mat));
}

/**
 * Rounded-rectangle *ring* in the local XY plane (extrusion along local Z),
 * later rotated so the ring lies in world ZY and the extrusion along X.
 */
function trackLoopShape(
  length: number,
  height: number,
  cornerRadius: number,
  thickness: number,
): THREE.Shape {
  const halfL = length / 2;
  const halfH = height / 2;
  const r = cornerRadius;
  const outer = new THREE.Shape();
  outer.moveTo(-halfL + r, -halfH);
  outer.lineTo(halfL - r, -halfH);
  outer.absarc(halfL - r, -halfH + r, r, -Math.PI / 2, 0, false);
  outer.lineTo(halfL, halfH - r);
  outer.absarc(halfL - r, halfH - r, r, 0, Math.PI / 2, false);
  outer.lineTo(-halfL + r, halfH);
  outer.absarc(-halfL + r, halfH - r, r, Math.PI / 2, Math.PI, false);
  outer.lineTo(-halfL, -halfH + r);
  outer.absarc(-halfL + r, -halfH + r, r, Math.PI, (3 * Math.PI) / 2, false);

  const innerHalfL = halfL - thickness;
  const innerHalfH = halfH - thickness;
  const innerR = Math.max(0.04, r - thickness);
  const hole = new THREE.Path();
  hole.moveTo(-innerHalfL + innerR, -innerHalfH);
  hole.lineTo(innerHalfL - innerR, -innerHalfH);
  hole.absarc(innerHalfL - innerR, -innerHalfH + innerR, innerR, -Math.PI / 2, 0, true);
  hole.lineTo(innerHalfL, innerHalfH - innerR);
  hole.absarc(innerHalfL - innerR, innerHalfH - innerR, innerR, 0, Math.PI / 2, true);
  hole.lineTo(-innerHalfL + innerR, innerHalfH);
  hole.absarc(-innerHalfL + innerR, innerHalfH - innerR, innerR, Math.PI / 2, Math.PI, true);
  hole.lineTo(-innerHalfL, -innerHalfH + innerR);
  hole.absarc(
    -innerHalfL + innerR,
    -innerHalfH + innerR,
    innerR,
    Math.PI,
    (3 * Math.PI) / 2,
    true,
  );
  outer.holes.push(hole);
  return outer;
}

/**
 * One cleat anchor on the belt loop's outer surface, in GROUND-frame
 * coordinates. `distance` runs along the perimeter starting at the middle of
 * the bottom run heading toward −Z (then rear arc → top run → front arc).
 * `outOffset` pushes the cleat outward along the surface normal; the result
 * is clamped so a cleat never penetrates the contact plane.
 */
function beltLoopSample(
  distance: number,
  dims: SnowCrawlerDimensions,
  outOffset: number,
): { position: THREE.Vector3; tiltX: number } {
  const halfL = dims.beltLength / 2;
  const r = dims.beltCornerRadius;
  const straightL = dims.beltLength - 2 * r;
  const arc = Math.PI * r;
  let s = distance % (2 * (straightL + arc));

  if (s < straightL) {
    return {
      position: new THREE.Vector3(0, outOffset, halfL - r - s),
      tiltX: 0,
    };
  }
  s -= straightL;
  if (s < arc) {
    const a = s / r; // 0 at rear-bottom, π at rear-top
    return {
      position: new THREE.Vector3(
        0,
        Math.max(r - (r + outOffset) * Math.cos(a), outOffset),
        -(halfL - r) - (r + outOffset) * Math.sin(a),
      ),
      tiltX: -a,
    };
  }
  s -= arc;
  if (s < straightL) {
    return {
      position: new THREE.Vector3(0, dims.beltHeight + outOffset, -halfL + r + s),
      tiltX: Math.PI,
    };
  }
  s -= straightL;
  const a = s / r; // 0 at front-top heading down to front-bottom
  return {
    position: new THREE.Vector3(
      0,
      Math.max(r + (r + outOffset) * Math.cos(a), outOffset),
      halfL - r + (r + outOffset) * Math.sin(a),
    ),
    tiltX: a,
  };
}

// ---------------------------------------------------------------------------
// Subassembly builders
// ---------------------------------------------------------------------------

type TrackSide = -1 | 1;

function buildTrackAssembly(
  side: TrackSide,
  dims: SnowCrawlerDimensions,
  mats: SnowCrawlerMaterials,
  finishMesh: MeshFinish,
): { group: THREE.Group; spinPivots: Map<"front" | "rear", THREE.Group> } {
  const group = new THREE.Group();
  group.name = side < 0 ? "caterpillar-track-left" : "caterpillar-track-right";
  group.position.set(side * dims.trackHalfX, 0, 0);

  const halfL = dims.beltLength / 2;
  const halfH = dims.beltHeight / 2;
  const r = dims.beltCornerRadius;
  const beltThickness = dims.beltHeight * 0.16;

  // Belt loop.
  const loop = trackLoopShape(
    dims.beltLength,
    dims.beltHeight,
    r,
    beltThickness,
  );
  const beltGeometry = new THREE.ExtrudeGeometry(loop, {
    depth: dims.beltWidth,
    bevelEnabled: false,
    curveSegments: 14,
  });
  beltGeometry.translate(0, 0, -dims.beltWidth / 2);
  beltGeometry.rotateY(Math.PI / 2); // ring → world ZY, extrusion → X
  const belt = finish(beltGeometry, mats.rubber, finishMesh);
  belt.name = "track-belt";
  belt.position.y = halfH; // outer bottom sits on the contact plane
  group.add(belt);

  // Ice cleats (grousers) around the loop perimeter.
  const grouserCount = 30;
  const grouserGeometry = fabricatedBoxGeometry(
    dims.beltWidth,
    0.07,
    0.11,
  );
  const grousers = new THREE.InstancedMesh(
    grouserGeometry,
    mats.trackSteel,
    grouserCount,
  );
  const dummy = new THREE.Object3D();
  const perimeter = 2 * (dims.beltLength - 2 * r) + 2 * Math.PI * r;
  const cleatOutOffset = 0.045;
  for (let i = 0; i < grouserCount; i += 1) {
    const sample = beltLoopSample(
      (i / grouserCount) * perimeter + 0.045,
      dims,
      cleatOutOffset,
    );
    dummy.position.copy(sample.position);
    dummy.rotation.set(sample.tiltX, 0, 0);
    dummy.updateMatrix();
    grousers.setMatrixAt(i, dummy.matrix);
  }
  grousers.castShadow = true;
  grousers.name = "ice-cleats";
  group.add(grousers);

  // Spin pivots first: the front/rear road rollers parent into them so kernel
  // rotation spins real geometry. Pivot origin = roller hub (GROUND frame).
  const spinPivots = new Map<"front" | "rear", THREE.Group>();
  const frontRollerZ = dims.spinRollerZ;
  const rearRollerZ = -dims.spinRollerZ;
  for (const which of ["front", "rear"] as const) {
    const pivot = new THREE.Group();
    pivot.name = `spin-roller-${which}-${side < 0 ? "left" : "right"}`;
    pivot.position.set(0, dims.rollerRestY, which === "front" ? frontRollerZ : rearRollerZ);
    spinPivots.set(which, pivot);
    group.add(pivot);
  }

  // Road rollers: five per side; the end pair live inside their spin pivots.
  const roadWheelZs = [-1.5, -0.75, 0, 0.75, 1.5].map(
    (k) => k * (dims.spinRollerZ / 1.5),
  );
  for (const z of roadWheelZs) {
    const roller = finish(
      new THREE.CylinderGeometry(
        dims.rollerRadius,
        dims.rollerRadius,
        dims.beltWidth * 0.86,
        16,
      ),
      mats.trackSteel,
      finishMesh,
    );
    roller.rotation.z = Math.PI / 2;
    const hub = finish(
      new THREE.CylinderGeometry(
        dims.rollerRadius * 0.42,
        dims.rollerRadius * 0.42,
        dims.beltWidth * 0.92,
        10,
      ),
      mats.steel,
      finishMesh,
    );
    hub.rotation.z = Math.PI / 2;
    roller.add(hub);

    const pivot =
      z === frontRollerZ
        ? spinPivots.get("front")
        : z === rearRollerZ
          ? spinPivots.get("rear")
          : undefined;
    if (pivot) {
      pivot.add(roller);
    } else {
      roller.position.set(0, dims.rollerRestY, z);
      group.add(roller);
    }
  }

  // Drive sprocket (front loop end) parents into the front spin pivot.
  const sprocket = finish(
    new THREE.CylinderGeometry(r * 0.62, r * 0.62, dims.beltWidth * 0.8, 14),
    mats.trackSteel,
    finishMesh,
  );
  sprocket.rotation.z = Math.PI / 2;
  const sprocketLocalZ = halfL - r - frontRollerZ;
  sprocket.position.set(0, r - dims.rollerRestY, sprocketLocalZ);
  spinPivots.get("front")!.add(sprocket);
  for (let t = 0; t < 9; t += 1) {
    const angle = (t / 9) * Math.PI * 2;
    const tooth = finish(
      fabricatedBoxGeometry(dims.beltWidth * 0.78, 0.06, 0.075),
      mats.trackSteel,
      finishMesh,
    );
    tooth.position.set(
      0,
      r - dims.rollerRestY + Math.sin(angle) * (r * 0.62 + 0.02),
      sprocketLocalZ + Math.cos(angle) * (r * 0.62 + 0.02),
    );
    tooth.rotation.x = -angle;
    spinPivots.get("front")!.add(tooth);
  }

  // Idler (rear loop end), static.
  const idler = finish(
    new THREE.CylinderGeometry(r * 0.55, r * 0.55, dims.beltWidth * 0.8, 14),
    mats.trackSteel,
    finishMesh,
  );
  idler.rotation.z = Math.PI / 2;
  idler.position.set(0, r, -(halfL - r));
  group.add(idler);

  // Fender over the top run + snow dusting.
  const fender = finish(
    fabricatedBoxGeometry(dims.beltWidth - 0.02, 0.06, dims.beltLength * 0.72),
    mats.paint,
    finishMesh,
  );
  fender.position.set(0, dims.beltHeight + 0.09, -dims.beltLength * 0.06);
  group.add(fender);
  const fenderSnow = finish(
    fabricatedBoxGeometry(dims.beltWidth - 0.22, 0.03, dims.beltLength * 0.3),
    mats.snow,
    finishMesh,
  );
  fenderSnow.position.set(0, dims.beltHeight + 0.13, -dims.beltLength * 0.18);
  group.add(fenderSnow);

  // The four ground-contact "tyre" surfaces: belt bottom runs, front/rear.
  const tyreRunLength = dims.beltLength / 2 - r / 2;
  for (const which of ["front", "rear"] as const) {
    const run = finish(
      fabricatedBoxGeometry(dims.beltWidth, 0.1, tyreRunLength),
      mats.rubber,
      finishMesh,
    );
    run.name = "tyre";
    run.position.set(0, 0.05, (which === "front" ? 1 : -1) * (dims.beltLength / 4));
    group.add(run);
  }

  return { group, spinPivots };
}

/**
 * One plow wing: a broad, low plate canted into a V and tilted back, with
 * thermal strips on the working face and a toothed cutting edge. Local space;
 * the caller positions/rotates the returned group into the plow assembly.
 */
function buildPlowWing(
  side: TrackSide,
  dims: SnowCrawlerDimensions,
  options: SnowCrawlerModelOptions,
  mats: SnowCrawlerMaterials,
  finishMesh: MeshFinish,
): THREE.Group {
  const wing = new THREE.Group();
  const plowHeight = dims.beltHeight * 0.82;
  const wingWidth = dims.bodyWidth * 0.68;

  const plate = finish(
    fabricatedBoxGeometry(wingWidth, plowHeight, 0.1),
    mats.paint,
    finishMesh,
  );
  wing.add(plate);

  // Working-face thermal strips (the plate's identity feature: two red lines).
  for (const stripIndex of [0, 1]) {
    const strip = finish(
      fabricatedBoxGeometry(wingWidth * 0.82, 0.085, 0.035),
      options.thermalGlowActive ?? true ? mats.thermal : mats.steel,
      finishMesh,
    );
    strip.position.set(0, plowHeight * (stripIndex === 0 ? 0.22 : -0.08), 0.075);
    wing.add(strip);
  }

  // Cutting teeth along the bottom edge, poking forward.
  for (let t = 0; t < 8; t += 1) {
    const tooth = finish(
      fabricatedBoxGeometry(0.07, 0.12, 0.08),
      mats.trackSteel,
      finishMesh,
    );
    tooth.position.set((t - 3.5) * (wingWidth / 8), -plowHeight * 0.62, 0.05);
    wing.add(tooth);
  }

  // Cant into the V (outer edge forward) and tilt the working face back hard,
  // so the thermal strips face the camera the way the plate draws them.
  const cant = Math.PI / 6.4;
  wing.rotation.y = -side * cant;
  wing.rotation.x = 0.5;
  wing.position.set(side * wingWidth * 0.5 * Math.cos(cant), 0, -side * 0.2);
  return wing;
}

function buildPlow(
  dims: SnowCrawlerDimensions,
  options: SnowCrawlerModelOptions,
  mats: SnowCrawlerMaterials,
  finishMesh: MeshFinish,
): THREE.Group {
  const group = new THREE.Group();
  const plowHeight = dims.beltHeight * 0.82;
  // Cutting teeth reach just to the contact plane: blade edge at ground level.
  group.position.set(0, plowHeight * 0.70 + 0.08, dims.beltLength / 2 + 0.34);
  group.name = "ice-breaker-plow";

  for (const side of [-1, 1] as const) {
    group.add(buildPlowWing(side, dims, options, mats, finishMesh));
  }

  // Small center keel joining the wings.
  const keel = finish(
    fabricatedBoxGeometry(0.2, plowHeight * 0.95, 0.09),
    mats.steel,
    finishMesh,
  );
  keel.position.set(0, 0, 0.18);
  group.add(keel);

  // A-frame push arms running back under the nose.
  for (const side of [-1, 1] as const) {
    const arm = finish(
      new THREE.CylinderGeometry(0.06, 0.06, 1.05, 10),
      mats.steel,
      finishMesh,
    );
    arm.rotation.x = Math.PI / 2.6;
    arm.position.set(side * 0.5, -0.06, -0.85);
    group.add(arm);
  }

  const lipSnow = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 1.15, 0.04, 0.05),
    mats.snow,
    finishMesh,
  );
  lipSnow.position.set(0, plowHeight * 0.58, 0.02);
  lipSnow.rotation.x = 0.5;
  group.add(lipSnow);

  return group;
}

// ---------------------------------------------------------------------------
// Model factory
// ---------------------------------------------------------------------------

export function createSnowCrawlerModel(
  options: SnowCrawlerModelOptions = {},
): THREE.Group {
  const dims = options.dimensions ?? DEFAULT_DIMENSIONS;
  const mats = createSnowCrawlerMaterials();
  const finishMesh = makeFinish(options);
  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.18,
        roughness: 0.62,
      })
    : mats.paint;

  const root = new THREE.Group();
  root.name = "snow-crawler-expedition-01";

  // 1. Chassis frame + armored van body (the plate's dominant volume).
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-frame";

  const skidPlate = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.92, 0.14, dims.bodyLength * 0.86),
    mats.steel,
    finishMesh,
  );
  skidPlate.position.set(0, dims.bodyBottomY - 0.1, 0);
  chassisGroup.add(skidPlate);

  const lowerSkirt = finish(
    fabricatedBoxGeometry(dims.bodyWidth, 0.5, dims.bodyLength * 0.98),
    mats.steel,
    finishMesh,
  );
  lowerSkirt.position.set(0, dims.bodyBottomY + 0.18, 0);
  chassisGroup.add(lowerSkirt);

  const bodyHeight = dims.roofY - dims.bodyBottomY - 0.36;
  const mainBody = finish(
    fabricatedBoxGeometry(dims.bodyWidth, bodyHeight, dims.bodyLength),
    paintMat,
    finishMesh,
  );
  mainBody.position.set(0, dims.bodyBottomY + 0.43 + bodyHeight / 2, 0);
  mainBody.name = "armored-body";
  chassisGroup.add(mainBody);

  // Integrated nose: hood block carries the grille and lamp pairs; bumper
  // wraps under it. All front faces align at the same z so nothing floats.
  const noseFrontZ = dims.bodyLength / 2 + 0.18;
  const hood = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.99, 0.95, 0.8),
    paintMat,
    finishMesh,
  );
  hood.position.set(0, dims.bodyBottomY + 1.35, dims.bodyLength / 2 - 0.22);
  chassisGroup.add(hood);

  const grilleBack = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.52, 0.4, 0.05),
    mats.trackSteel,
    finishMesh,
  );
  grilleBack.position.set(0, dims.bodyBottomY + 1.35, noseFrontZ - 0.035);
  chassisGroup.add(grilleBack);
  for (let slat = 0; slat < 5; slat += 1) {
    const slatMesh = finish(
      fabricatedBoxGeometry(0.05, 0.42, 0.025),
      mats.steel,
      finishMesh,
    );
    slatMesh.position.set(
      (slat - 2) * dims.bodyWidth * 0.092,
      dims.bodyBottomY + 1.35,
      noseFrontZ + 0.005,
    );
    chassisGroup.add(slatMesh);
  }

  for (const side of [-1, 1] as const) {
    for (const lampOffset of [-0.11, 0.11]) {
      const lamp = finish(
        new THREE.CylinderGeometry(0.085, 0.085, 0.06, 14),
        mats.lamp,
        finishMesh,
      );
      lamp.rotation.x = Math.PI / 2;
      lamp.position.set(
        side * dims.bodyWidth * 0.335 + lampOffset * 0.6,
        dims.bodyBottomY + 1.38,
        noseFrontZ + 0.01,
      );
      chassisGroup.add(lamp);
    }
  }

  const bumper = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 1.0, 0.2, 0.18),
    mats.trackSteel,
    finishMesh,
  );
  bumper.position.set(0, dims.bodyBottomY + 0.72, noseFrontZ - 0.04);
  chassisGroup.add(bumper);

  const roofPlate = finish(
    fabricatedBoxGeometry(dims.bodyWidth, 0.12, dims.bodyLength * 0.99),
    paintMat,
    finishMesh,
  );
  roofPlate.position.set(0, dims.roofY - 0.06, 0);
  chassisGroup.add(roofPlate);

  root.add(chassisGroup);

  // 2 & 3. Caterpillar tracks.
  for (const side of [-1, 1] as const) {
    const track = buildTrackAssembly(side, dims, mats, finishMesh);
    root.add(track.group);
  }

  // 4. Pressurized cab: sloped two-pane windshield + roof light bar + side glass.
  const cabGroup = new THREE.Group();
  cabGroup.name = "pressurized-cab";

  const windshieldTilt = -0.55;
  const windshieldY = dims.bodyBottomY + bodyHeight - 0.24;
  const windshieldZ = dims.bodyLength / 2 - 0.3;
  const windshieldFrame = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.92, 0.86, 0.11),
    mats.steel,
    finishMesh,
  );
  windshieldFrame.position.set(0, windshieldY, windshieldZ);
  windshieldFrame.rotation.x = windshieldTilt;
  cabGroup.add(windshieldFrame);

  for (const side of [-1, 1] as const) {
    const pane = finish(
      fabricatedBoxGeometry(dims.bodyWidth * 0.41, 0.7, 0.05),
      mats.glass,
      finishMesh,
    );
    pane.position.set(side * dims.bodyWidth * 0.225, windshieldY, windshieldZ + 0.045);
    pane.rotation.x = windshieldTilt;
    cabGroup.add(pane);

    const sideWindow = finish(
      fabricatedBoxGeometry(0.04, 0.52, 1.15),
      mats.glass,
      finishMesh,
    );
    sideWindow.position.set(
      side * (dims.bodyWidth / 2 + 0.005),
      dims.bodyBottomY + bodyHeight - 0.42,
      dims.bodyLength / 2 - 1.05,
    );
    cabGroup.add(sideWindow);

    const doorSeam = finish(
      fabricatedBoxGeometry(0.02, bodyHeight * 0.82, 0.035),
      mats.trackSteel,
      finishMesh,
    );
    doorSeam.position.set(
      side * (dims.bodyWidth / 2 + 0.005),
      dims.bodyBottomY + bodyHeight * 0.52,
      dims.bodyLength / 2 - 1.72,
    );
    cabGroup.add(doorSeam);
  }

  const lightBarHousing = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.68, 0.17, 0.26),
    mats.trackSteel,
    finishMesh,
  );
  lightBarHousing.position.set(0, dims.roofY + 0.09, dims.bodyLength / 2 - 0.5);
  cabGroup.add(lightBarHousing);
  for (let i = 0; i < 4; i += 1) {
    const lamp = finish(
      new THREE.CylinderGeometry(0.078, 0.078, 0.08, 12),
      mats.lamp,
      finishMesh,
    );
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(
      (i - 1.5) * dims.bodyWidth * 0.155,
      dims.roofY + 0.09,
      dims.bodyLength / 2 - 0.42,
    );
    cabGroup.add(lamp);
  }

  root.add(cabGroup);

  // 5. Roof systems: radar dome, antenna array, exhaust stack, gear rack.
  const roofSystems = new THREE.Group();
  roofSystems.name = "roof-systems";

  const domePlatform = finish(
    fabricatedBoxGeometry(1.0, 0.08, 1.0),
    mats.steel,
    finishMesh,
  );
  domePlatform.position.set(-0.42, dims.roofY + 0.1, -0.62);
  roofSystems.add(domePlatform);
  const domeBase = finish(
    new THREE.CylinderGeometry(0.36, 0.44, 0.18, 16),
    mats.steel,
    finishMesh,
  );
  domeBase.position.set(-0.42, dims.roofY + 0.23, -0.62);
  roofSystems.add(domeBase);

  const dome = finish(
    new THREE.SphereGeometry(0.5, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    mats.trackSteel,
    finishMesh,
  );
  dome.position.set(-0.42, dims.roofY + 0.3, -0.62);
  dome.name = "radar-dome";
  roofSystems.add(dome);

  const domeSnow = finish(
    new THREE.SphereGeometry(
      0.508,
      20,
      8,
      0,
      Math.PI * 2,
      Math.PI * 0.4,
      Math.PI * 0.16,
    ),
    mats.snow,
    finishMesh,
  );
  domeSnow.position.set(-0.42, dims.roofY + 0.3, -0.62);
  roofSystems.add(domeSnow);

  for (const [antennaX, antennaZ, height] of [
    [0.72, 1.15, 1.15],
    [0.95, 0.7, 0.95],
    [0.55, 0.55, 0.8],
  ] as const) {
    const whip = finish(
      new THREE.CylinderGeometry(0.014, 0.02, height, 6),
      mats.steel,
      finishMesh,
    );
    whip.position.set(antennaX, dims.roofY + height / 2 + 0.04, antennaZ);
    roofSystems.add(whip);
  }
  const crossbar = finish(
    fabricatedBoxGeometry(0.5, 0.025, 0.025),
    mats.steel,
    finishMesh,
  );
  crossbar.position.set(0.83, dims.roofY + 0.92, 0.92);
  roofSystems.add(crossbar);

  root.add(roofSystems);

  // Diesel exhaust stack with heat-shield rings (mid-right roofline).
  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = "diesel-power-core";
  const stack = finish(
    new THREE.CylinderGeometry(0.085, 0.1, 1.3, 12),
    mats.steel,
    finishMesh,
  );
  stack.position.set(0.78, dims.roofY + 0.62, 0.35);
  exhaustGroup.add(stack);
  for (const ringY of [0.28, 0.58, 0.88]) {
    const ring = finish(
      new THREE.TorusGeometry(0.105, 0.02, 6, 14),
      mats.trackSteel,
      finishMesh,
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.78, dims.roofY + ringY, 0.35);
    exhaustGroup.add(ring);
  }
  const stackSnow = finish(
    new THREE.CylinderGeometry(0.092, 0.092, 0.03, 12),
    mats.snow,
    finishMesh,
  );
  stackSnow.position.set(0.78, dims.roofY + 1.27, 0.35);
  exhaustGroup.add(stackSnow);
  root.add(exhaustGroup);

  // Roof rack (rear deck) with gear crates + fuel barrel.
  const rack = new THREE.Group();
  rack.name = "roof-rack";
  for (const railX of [-0.85, 0.85]) {
    const rail = finish(
      fabricatedBoxGeometry(0.05, 0.16, dims.bodyLength * 0.34),
      mats.steel,
      finishMesh,
    );
    rail.position.set(railX, dims.roofY + 0.14, -dims.bodyLength * 0.3);
    rack.add(rail);
  }
  for (const railZ of [-dims.bodyLength * 0.42, -dims.bodyLength * 0.18]) {
    const crossRail = finish(
      fabricatedBoxGeometry(dims.bodyWidth * 0.74, 0.05, 0.05),
      mats.steel,
      finishMesh,
    );
    crossRail.position.set(0, dims.roofY + 0.2, railZ);
    rack.add(crossRail);
  }
  const crateA = finish(
    fabricatedBoxGeometry(0.6, 0.3, 0.7),
    mats.wood,
    finishMesh,
  );
  crateA.position.set(-0.34, dims.roofY + 0.32, -dims.bodyLength * 0.36);
  rack.add(crateA);
  const strapA = finish(
    fabricatedBoxGeometry(0.62, 0.32, 0.06),
    mats.trackSteel,
    finishMesh,
  );
  strapA.position.set(-0.34, dims.roofY + 0.32, -dims.bodyLength * 0.36);
  rack.add(strapA);
  const crateB = finish(
    fabricatedBoxGeometry(0.5, 0.24, 0.56),
    mats.wood,
    finishMesh,
  );
  crateB.position.set(0.32, dims.roofY + 0.29, -dims.bodyLength * 0.22);
  rack.add(crateB);
  const barrel = finish(
    new THREE.CylinderGeometry(0.17, 0.17, 0.42, 14),
    mats.marker,
    finishMesh,
  );
  barrel.position.set(0.55, dims.roofY + 0.32, -dims.bodyLength * 0.4);
  rack.add(barrel);
  root.add(rack);

  // 6. Ice-breaker V-plow (the rig's nose marker for the runtime contract).
  const plow = buildPlow(dims, options, mats, finishMesh);
  root.add(plow);

  // 7. Rear face: door, window, taillights, bumper marker, side ladder.
  const rearGroup = new THREE.Group();
  rearGroup.name = "rear-assembly";
  const rearDoor = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.6, bodyHeight * 0.8, 0.04),
    mats.steel,
    finishMesh,
  );
  rearDoor.position.set(0, dims.bodyBottomY + bodyHeight * 0.55, -dims.bodyLength / 2 - 0.015);
  rearGroup.add(rearDoor);
  const rearWindow = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.34, 0.4, 0.03),
    mats.glass,
    finishMesh,
  );
  rearWindow.position.set(0, dims.bodyBottomY + bodyHeight * 0.72, -dims.bodyLength / 2 - 0.035);
  rearGroup.add(rearWindow);
  for (const side of [-1, 1] as const) {
    const tail = finish(
      fabricatedBoxGeometry(0.12, 0.2, 0.05),
      mats.marker,
      finishMesh,
    );
    tail.position.set(side * dims.bodyWidth * 0.36, dims.bodyBottomY + 0.9, -dims.bodyLength / 2 - 0.03);
    rearGroup.add(tail);
  }
  const rearBumper = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.96, 0.18, 0.16),
    mats.steel,
    finishMesh,
  );
  rearBumper.position.set(0, dims.bodyBottomY + 0.62, -dims.bodyLength / 2 - 0.1);
  rearBumper.name = "rear-marker";
  rearGroup.add(rearBumper);
  for (const railZ of [-dims.bodyLength * 0.32, -dims.bodyLength * 0.44]) {
    const rail = finish(
      fabricatedBoxGeometry(0.03, 1.5, 0.03),
      mats.steel,
      finishMesh,
    );
    rail.position.set(dims.bodyWidth / 2 + 0.05, dims.bodyBottomY + 0.95, railZ);
    rearGroup.add(rail);
  }
  for (let rung = 0; rung < 6; rung += 1) {
    const rungMesh = finish(
      fabricatedBoxGeometry(0.03, 0.025, 0.42),
      mats.steel,
      finishMesh,
    );
    rungMesh.position.set(
      dims.bodyWidth / 2 + 0.05,
      dims.bodyBottomY + 0.35 + rung * 0.24,
      -dims.bodyLength * 0.38,
    );
    rearGroup.add(rungMesh);
  }
  root.add(rearGroup);

  // 7a. Snow dusting on the roof front edge and hood top (the plate's tell).
  const roofSnow = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.96, 0.035, 0.5),
    mats.snow,
    finishMesh,
  );
  roofSnow.position.set(0, dims.roofY + 0.035, dims.bodyLength / 2 - 0.45);
  root.add(roofSnow);
  const hoodSnow = finish(
    fabricatedBoxGeometry(dims.bodyWidth * 0.9, 0.03, 0.45),
    mats.snow,
    finishMesh,
  );
  hoodSnow.position.set(0, dims.bodyBottomY + 1.85, dims.bodyLength / 2 - 0.22);
  root.add(hoodSnow);

  // 7b. Side panel seams, side markers, and rear mud flaps.
  for (const side of [-1, 1] as const) {
    const seamUpper = finish(
      fabricatedBoxGeometry(0.015, 0.03, dims.bodyLength * 0.9),
      mats.steel,
      finishMesh,
    );
    seamUpper.position.set(
      side * (dims.bodyWidth / 2 + 0.008),
      dims.bodyBottomY + 1.55,
      0,
    );
    root.add(seamUpper);
    const seamLower = finish(
      fabricatedBoxGeometry(0.015, 0.03, dims.bodyLength * 0.9),
      mats.steel,
      finishMesh,
    );
    seamLower.position.set(
      side * (dims.bodyWidth / 2 + 0.008),
      dims.bodyBottomY + 0.85,
      0,
    );
    root.add(seamLower);
    for (const markerZ of [dims.bodyLength * 0.3, -dims.bodyLength * 0.42]) {
      const marker = finish(
        fabricatedBoxGeometry(0.03, 0.09, 0.05),
        mats.marker,
        finishMesh,
      );
      marker.position.set(
        side * (dims.bodyWidth / 2 + 0.012),
        dims.bodyBottomY + 1.0,
        markerZ,
      );
      root.add(marker);
    }
    const mudFlap = finish(
      fabricatedBoxGeometry(dims.beltWidth * 0.9, 0.34, 0.04),
      mats.rubber,
      finishMesh,
    );
    mudFlap.position.set(
      side * dims.trackHalfX,
      dims.beltHeight * 0.5,
      -dims.beltLength / 2 - 0.06,
    );
    root.add(mudFlap);
  }

  // 8. Rivet lines along the body shoulders (instanced, deterministic).
  for (const side of [-1, 1] as const) {
    const rivetGeometry = new THREE.SphereGeometry(0.02, 8, 6);
    const rivets = new THREE.InstancedMesh(rivetGeometry, mats.steel, 12);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 12; i += 1) {
      dummy.position.set(0, 0, (i - 5.5) * (dims.bodyLength / 14));
      dummy.updateMatrix();
      rivets.setMatrixAt(i, dummy.matrix);
    }
    rivets.position.set(
      side * (dims.bodyWidth / 2 + 0.012),
      dims.bodyBottomY + 0.75,
      0,
    );
    rivets.castShadow = true;
    root.add(rivets);
  }

  return root;
}

/**
 * Spin pivots in the kernel's wheel order: front-left, front-right,
 * rear-left, rear-right. The renderer maps these onto `RigParts.wheels`.
 */
export function snowCrawlerSpinPivots(model: THREE.Group): THREE.Group[] {
  const order: Array<
    "front-left" | "front-right" | "rear-left" | "rear-right"
  > = ["front-left", "front-right", "rear-left", "rear-right"];
  return order.map((name) => {
    const pivot = model.getObjectByName(`spin-roller-${name}`);
    if (!(pivot instanceof THREE.Group)) {
      throw new Error(`snow-crawler: missing spin pivot ${name}`);
    }
    return pivot;
  });
}

/** Kernel rotation multiplier for the drawn roller radius. */
export function snowCrawlerRollerSpinScale(dims: SnowCrawlerDimensions): number {
  return dims.profileWheelRadius / dims.rollerRadius;
}

// ---------------------------------------------------------------------------
// Look-dev helpers (review surface + evidence captures)
// ---------------------------------------------------------------------------

export type SnowCrawlerViewpoint = {
  azimuthDeg: number;
  elevationDeg: number;
  distanceScale?: number;
};

export function frameSnowCrawlerCamera(
  camera: THREE.PerspectiveCamera,
  model: THREE.Object3D,
  viewpoint: SnowCrawlerViewpoint,
): void {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const centre = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(centre);
  const radius = Math.max(size.x, size.y, size.z) * 0.5;
  const distance =
    (radius / Math.sin((camera.fov * Math.PI) / 360)) *
    (viewpoint.distanceScale ?? 1.18);
  const azimuth = (viewpoint.azimuthDeg * Math.PI) / 180;
  const elevation = (viewpoint.elevationDeg * Math.PI) / 180;
  camera.position.set(
    centre.x + Math.sin(azimuth) * Math.cos(elevation) * distance,
    centre.y + Math.sin(elevation) * distance,
    centre.z + Math.cos(azimuth) * Math.cos(elevation) * distance,
  );
  camera.lookAt(centre);
  camera.updateProjectionMatrix();
}

export function createSnowCrawlerLookDevLights(
  mode: "neutral" | "grazing" | "reference",
): THREE.Group {
  const group = new THREE.Group();
  const key = new THREE.DirectionalLight(
    0xffffff,
    mode === "grazing" ? 2.4 : 2.8,
  );
  key.position.set(4, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 6;
  key.shadow.camera.bottom = -6;
  key.shadow.bias = -0.0004;
  const fill = new THREE.DirectionalLight(0xdfe8f2, mode === "reference" ? 1.5 : 1.1);
  fill.position.set(-5, 3.5, -4);
  const rim = new THREE.DirectionalLight(0xcfe4ff, mode === "grazing" ? 1.6 : 0.9);
  rim.position.set(-2, 4, -7);
  const ambient = new THREE.AmbientLight(0xf2f4f6, mode === "neutral" ? 0.85 : 0.55);
  group.add(key, fill, rim, ambient);
  return group;
}

export function createSnowCrawlerEnvironment(
  renderer: THREE.WebGLRenderer,
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return environment;
}
