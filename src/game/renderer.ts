/**
 * The view. Reads the world substrate; owns no world truth of its own.
 *
 * Before ADR-0007 this module scattered 42 decorative props with a private RNG,
 * which the kernel could neither collide with nor reason about. It now renders
 * exactly what `TerrainField`, `ObstacleField`, and `ExplorationField` say is
 * there, so what you see is what you can hit.
 *
 * ## Draw-call discipline
 *
 * Everything repeated is instanced: trees, rocks, felled trunks, salvage, and
 * furrow decals are one draw call each regardless of count. The previous build
 * added one mesh per furrow, which meant up to 640 draw calls of world memory.
 *
 * ## Coordinate contract
 *
 * Local **+Z is the front** of a rig (see the header of `physics.ts`). The
 * previous geometry violated this: the tractor's grille, hood, and headlights sat
 * at local −Z, the same end as the plough, so it drove cab-first with its lights
 * pointing backwards. Both rigs are rebuilt front-forward here.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import {
  CARGO_DELIVERY,
  CARGO_PICKUP,
  cargoDeliveryTarget,
  cargoPickupTarget,
  BUGGY_RAMP,
  type CameraMode,
  effectiveProfile,
  type GameState,
  MAX_FURROWS,
  type ModuleId,
  MODULE_IDS,
  MODULES,
  RIG_IDS,
  type RigId,
  type WorldPhase,
} from "./contracts";
import type { WeatherState } from "./weather";
import {
  felledTrunkLength,
  rockVisualHalfHeight,
  treeCrownCenterY,
  treeCrownRadius,
  treeTrunkHeight,
  type Obstacle,
} from "./collision";
import { chaseViewportPolicy, RIG_HOOD_CAMERA_MOUNTS } from "./camera";
import {
  blockoutFor,
  LUG_TREAD_FORM,
  type RigBlockout,
  type RigModuleMount,
  type RigSuperstructureVolume,
} from "./rig-blockout";
import { createFieldPlough01Model } from "../../assets/workbench/field-plough-01/authored/createFieldPloughModel";
import type { SalvageNode } from "./exploration";
import { vehicleAnimationSystem, type RigPresentationFrame } from "./animation";
import { deriveRigFeedback, type RigFeedbackFrame } from "./feedback";
import type { GameWorld } from "./gameworld";
import type { RuntimeBridgeSpec } from "./runtime-assets";
import type { CameraObstructionHit } from "./scene-query";
import {
  classifyVisibility,
  createPropVisibilityMetrics,
  DEFAULT_VISIBILITY_PROFILE,
  recordVisibilityCandidate,
  type PropVisibilityMetrics,
  type VisibilityProfileId,
  visibilityProfile,
} from "./visibility";
import {
  SURFACES,
  WATER_LEVEL,
  WORLD_RADIUS,
  WORLD_SITES,
  WORLD_STRUCTURE_PARTS,
  type WorldStructurePart,
} from "./world";
import {
  INFRASTRUCTURE_DEFINITIONS,
  INFRASTRUCTURE_ENTITY_IDS,
  createInfrastructureNetworkState,
  infrastructureIsOperating,
  type InfrastructureEntityId,
} from "./infrastructure-network";
import { settlementLampColor } from "./settlement-needs";
import { settlementMaterialEffect } from "./settlement-material-effects";
import { settlementResidentAnchors } from "./settlement-needs";
import { deriveSettlementCommunityPassageIds } from "./settlement-needs";
import {
  deriveSettlementLife,
  settlementAdaptationDefinitionsForSite,
  settlementResponseDefinitionsForSite,
  type SettlementResponseDefinition,
} from "./settlement-life";
import { deriveCommunityTraffic } from "./community-traffic";
import { SETTLEMENT_MATERIAL_EFFECTS } from "./settlement-material-effects";
import { findSite, RESOLVED_COMMUNITY_PASSAGES } from "./world";
import {
  isSettlementCargoManifestAvailable,
  SETTLEMENT_CARGO_MANIFESTS,
} from "./settlement-cargo";
import { roadRivalryCourseSiteIds } from "./activities";
import type { HabitatSpecies } from "./habitat";
import type { EcologyActorKind } from "./ecology";

function stableHabitatFraction(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function habitatSpeciesForEcologyKind(kind: EcologyActorKind): HabitatSpecies {
  if (kind === "grazers") return "small-grazer";
  if (kind === "waders") return "wading-bird";
  return "corvid";
}

const COLORS = {
  rust: 0xb94f32,
  bone: 0xead8b8,
  gold: 0xd9aa52,
  cyan: 0x6bc9c4,
  tire: 0x242421,
  night: 0x13283c,
} as const;

/** Terrain mesh sample spacing, in metres. */
const TERRAIN_STEP = 5.2;

/** Span of the terrain mesh, in metres. Slightly wider than the world disc. */
const TERRAIN_SPAN = (WORLD_RADIUS + 12) * 2;

/** Rig travel that triggers an obstacle/salvage instance rebuild, in metres. */
const PROP_REBUILD_DISTANCE = 34;

const MAX_TREE_INSTANCES = 900;
const MAX_ROCK_INSTANCES = 700;
const MAX_FELLED_INSTANCES = 220;
const MAX_NODE_INSTANCES = 260;
const MAX_DUST = 260;

/**
 * Recompute vertex normals for a grid-mesh terrain patch instead of the whole
 * mesh, so a small plough deformation doesn't pay for the untouched 99%+.
 *
 * `THREE.BufferGeometry.computeVertexNormals()` has no partial mode — it
 * always walks every triangle. Ploughing already scopes the *height* update
 * to a small vertex box (`refreshTerrainRegion`'s `minIx..maxIx`,
 * `minIz..maxIz`); this function scopes the *normal* update to match, using
 * the exact same unnormalized-cross-product accumulation Three.js's own
 * `computeVertexNormals()` uses (see `BufferGeometry.js`'s indexed-element
 * branch), so a partial run and a full run produce identical results — this
 * is a scoping change, not an approximation.
 *
 * A vertex's accumulated normal depends on every triangle that touches it, so
 * the recompute region must extend one ring of vertices beyond the changed
 * box: a vertex just outside `[minIx..maxIx] x [minIz..maxIz]` didn't move,
 * but it shares a triangle with one that did, so its face-normal contribution
 * changed too. Skipping that ring would leave a lighting seam at the patch
 * boundary even though every height value is correct.
 *
 * There are therefore two nested regions, not one:
 * - the **write region** (`vertMin.../vertMax...`): vertices whose normal is
 *   zeroed and rewritten — the changed box plus its one-vertex padding ring;
 * - the **source region**: the cells read to rebuild those normals, which
 *   must extend one ring of *cells* further still, because a write-region
 *   boundary vertex needs the contribution of its one neighbouring cell that
 *   didn't change, not only the cells that did. Reading that outer ring
 *   without gating the write would double-count onto vertices outside the
 *   write region that already hold a correct value — so the accumulate step
 *   below only ever writes to a vertex inside the write region, regardless of
 *   which cell in the source region it is currently processing.
 *
 * `position` and `normal` must be the terrain mesh's own attributes — this
 * mutates `normal` in place and does not resize or reallocate it.
 */
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

export interface RigParts {
  root: THREE.Group;
  /**
   * Ground-frame content holder, offset below `root` by the rig's ride height.
   *
   * `root` is mounted at `RigState.y`, the body origin. Rig models are authored
   * in the ground frame — wheel bottoms and blob shadows at y ≈ 0 — so this
   * group carries the single conversion between the two. See `rig-blockout.ts`.
   */
  body: THREE.Group;
  /** Named local-space mount authored on the rendered rig silhouette. */
  hoodCameraSocket: THREE.Object3D;
  /** Wheel spin pivots in physics order: front-left, front-right, rear-L, rear-R. */
  wheels: THREE.Group[];
  /** Steering pivots in the same order. Hover rigs expose an empty list. */
  steeringPivots: THREE.Group[];
  wheelRestY: number[];
  /**
   * Per-wheel multiplier turning the kernel's single reference wheel rotation
   * into each wheel's true rotation, in the same order. Derived by
   * `rig-blockout.ts` so unequal axles roll without visibly skidding.
   */
  wheelSpinScale: number[];
  /** Module-owned meshes, toggled from canonical fitted module ids each frame. */
  moduleVisuals: Partial<Record<ModuleId, THREE.Object3D[]>>;
  ploughPivot: THREE.Group | null;
  headlights: THREE.SpotLight;
  /** A real visible part at the nose, used to verify the visual/physics axis. */
  frontMarker: THREE.Object3D;
  /** A real visible part at the rear, used to verify the visual/physics axis. */
  rearMarker: THREE.Object3D;
  /** State Shell mesh representing surrounding integrity, aura, and hit ripples. */
  stateShell?: THREE.Mesh;
  stateShellMaterial?: THREE.ShaderMaterial;
}

export interface RigOrientationEvidence {
  rigId: RigId;
  heading: number;
  frontAlongHeadingMetres: number;
  visualFrontIsForward: boolean;
}

/**
 * Whether the rig a player *sees* is touching the ground they see it on.
 *
 * Sibling of {@link RigOrientationEvidence}, and for the same reason: it reads
 * world transforms off visible model parts rather than re-deriving authored
 * coordinates, so it catches a rig that has been mounted in the wrong vertical
 * frame. That failure shipped undetected — both ground rigs floated by exactly
 * their `rideHeight` and the hover rig by 0.63 m — because every unit test
 * compared authored numbers with authored numbers, and the two cues a player
 * would notice it by (ground texture parallax and a crisp shadow edge) were
 * independently degraded. Measuring rendered geometry against the terrain mesh
 * is the only check that could have failed.
 */
export interface RigGroundContactEvidence {
  rigId: RigId;
  /** Terrain height directly beneath the rig's body origin. */
  terrainY: number;
  /** Simulated body-origin elevation, i.e. `RigState.y`. */
  bodyOriginY: number;
  /** Profile ride height: how far the body origin should sit above contact. */
  rideHeight: number;
  /**
   * Signed gap between each visible tyre's lowest point and the terrain below
   * it. Positive floats, negative sinks. Empty for hover rigs.
   */
  wheelContactGaps: number[];
  /** Worst absolute tyre gap, or null when the rig draws no wheels. */
  worstWheelContactGap: number | null;
  /** Signed gap between the blob shadow and the terrain beneath it. */
  shadowGap: number;
  /**
   * For hover rigs: the visible skirt's lowest point above the terrain, which
   * should read as the air cushion rather than as an accidental float.
   */
  hoverSkirtGap: number | null;
  /** True when every visible contact cue is on the ground within tolerance. */
  contactsGround: boolean;
}

export interface RigPerceptionEvidence {
  rigId: RigId;
  reducedMotion: boolean;
  steeringAngle: number;
  bodyRollOffset: number;
  bodyPitchOffset: number;
  speedFovBoost: number;
  cameraFocusOffset: number | null;
  expectedFocusOffset: number;
  cameraFocusContractMet: boolean;
  visibleModules: ModuleId[];
}

/**
 * One fitted module's rendered volume.
 *
 * Two frames, deliberately. Anything measured against the *world* — where the
 * module is, how far it is above the ground — is world space. Anything measured
 * against the *rig* — what it interpenetrates, where it sits on its wheel — is
 * the rig body's own frame, because an axis-aligned box is only tight when the
 * thing inside it is axis-aligned, and a rig parked across a slope carries pitch
 * and roll that inflate every world box on it. The first survey of this surface
 * reported the tractor's skid plate 23 cm inside the chassis on a hillside and
 * 0 cm on the flat pad, for geometry that is bolted rigidly to that chassis and
 * had not moved relative to it at all. Body-local is also where the question is
 * meaningful: modules, superstructure and wheels are all children of the body,
 * so the only motion left in that frame is the motion that is really happening —
 * steering, suspension travel, the plough pivot.
 */
export interface RigModuleVisualSample {
  moduleId: ModuleId;
  /** Group name, i.e. `module:<id>`, and its index among that module's groups. */
  label: string;
  /**
   * What this visual is bolted to, recorded by whichever builder made it.
   *
   * It decides which measurements below mean anything. A hull bolt-on is judged
   * against the rig: it must clear the ground and touch nothing but its mounting
   * face. A `wheel` visual is a tread wrapping a tyre, and a tyre already tucks
   * under its own fender by design, so "overlaps rig structure" carries no signal
   * for it — {@link hostGap} and {@link hostOffset} are what say whether a tread
   * is a tread, and they need no terrain and no authored table to be read.
   */
  anchoredTo: "hull" | "wheel" | "unknown";
  /**
   * Whether the group is visible *and* every ancestor up to the scene is too.
   * `group.visible` alone would pass on a module hidden by its parent.
   */
  visible: boolean;
  /** World-space axis-aligned bounds. Null when the group draws no geometry. */
  worldMin: [number, number, number] | null;
  worldMax: [number, number, number] | null;
  /** Lowest rendered point minus the terrain beneath the module's centre. */
  groundGap: number | null;
  /** Distance from the module's centre to the rig's body origin, in metres. */
  offsetFromRig: number | null;
  /**
   * For a wheel-anchored tread: how far its lowest point hangs below the lowest
   * point of the tyre it wraps, in the body's frame. Null for anything else.
   *
   * The terrain-free way to ask "is this tread sitting right on its wheel". The
   * lug form reaches `radius * lugReachScale`, so this should come out at about
   * `radius * (lugReachScale - 1)` — 8.5 cm on the tractor's 0.85 m rear tyre —
   * plus the ~2.5% of a radius by which the tyre's 14-sided cylinder falls short
   * of a true circle in its own bounding box. {@link groundGap} cannot answer the
   * same question: on a slope the terrain under the tread's centre is not the
   * terrain the tyre is resting on, and suspension travel moves the whole wheel.
   */
  hostGap: number | null;
  /**
   * For a wheel-anchored tread: distance between its centre and its tyre's, in
   * the body's frame.
   *
   * A tread is concentric with its tyre by construction, so this is ~0. It is the
   * check that survives the exemption above: because a tread's overlaps with rig
   * structure are not read as defects, something has to prove the tread is still
   * *on the wheel* rather than rendered somewhere it would foul the rig freely.
   */
  hostOffset: number | null;
  /**
   * How far this module's geometry escapes the mount box it was built inside,
   * metres. Null for a wheel tread, which has no mount box.
   *
   * `buildModuleForm` states the contract in prose: every dimension is a ratio of
   * the mount, so nothing can push the module outside the envelope
   * `rig-blockout.test.ts` proved clear of the ground, the tyres and the other
   * modules. Being a *ratio* does not achieve that, and four of six forms were
   * quietly breaking it — a barrel whose radius came from `height` on a box
   * narrower than it was tall, a bracket placed at `width * 0.42` with a
   * half-extent of `width * 0.35`, a drum lying across an axis whose radius was
   * bounded by the wrong dimension, and a mast whose dish was 1.9× its own box.
   * Every clearance the blockout derives is void for a module that does not honour
   * this, so it is measured rather than promised.
   *
   * `fitFormToEnvelope` now clamps this to ~0 structurally; the field stays because
   * a guarantee nobody measures is how the prose contract got away with being
   * false for four forms. Read it with `envelopeFit`: this says the rig is safe,
   * that says whether the form was authored that way or rescued.
   */
  envelopeBreach: number | null;
  /**
   * The uniform scale `fitFormToEnvelope` applied to make the form fit, or null
   * for a wheel tread. 1 means it was authored to fit.
   *
   * Below 1 the module renders legally but smaller than designed, with nothing on
   * screen to say so — a silent defect, which is why acceptance fails on it rather
   * than treating the clamp as a success.
   */
  envelopeFit: number | null;
  /**
   * Solid rig parts this module's meshes interpenetrate, deepest first, measured
   * in the body's frame. The class of collision no unit test can see, because the
   * blockout does not model hand-authored superstructure — the tractor's cab and
   * roof are literals in `createTractor`.
   *
   * Measured per *mesh*, not per group. A group's bounding box is a solid cube
   * around a hollow form: the lug tread is a ring of 12 lugs and 2 bands, and its
   * group box is a filled block spanning the whole wheel, which reported the
   * chassis as 0.5 m of penetration when the two are merely side by side.
   *
   * `mountSurface` separates the two readings. An overlap with the chassis a
   * module bolts to is *seating*: a bolt-on modelled with a visible gap under it
   * reads as falling off the machine, so a centimetre or two is correct art.
   * An overlap with anything else — a cab, a grille — is a defect at any depth,
   * for a hull bolt-on. For a wheel tread it is not a defect signal at all: a
   * tyre passes under its own fender by design and a wider tread passes further.
   */
  structureOverlaps: { part: string; depth: number; mountSurface: boolean }[];
  /**
   * Other fitted modules this one interpenetrates, deepest first, measured in the
   * body's frame.
   *
   * The failure this exists for: lug tyres grow the tread ~10 cm per side, and
   * at full lock that put the tractor's flotation pontoons 6.8 cm inside its own
   * tread bands — on a rig the garage sells both modules to. `rig-blockout.ts`
   * now derives the wheel's clearance envelope from the tread form and clamps
   * underbody width to the wheel tunnel, but that is authored numbers checking
   * authored numbers. This measures the rendered result with every module the
   * rig can carry fitted at once, per mesh, so a lug passing between two
   * pontoons is not confused with the pontoon being inside the wheel's box.
   */
  moduleOverlaps: { module: string; depth: number }[];
}

/**
 * What the player can actually see of the modules they bought.
 *
 * Every other check on module placement compares authored numbers with authored
 * numbers: `rig-blockout.test.ts` proves the derived mount boxes clear each other,
 * the wheels, and the ground, but it is reasoning about the same table the mounts
 * come from. Three things live outside that table — the terrain's real height, the
 * rendered form built inside each mount box, and the hand-authored superstructure
 * each rig carries — and a module can be wrong against any of them while every
 * unit test passes.
 */
export interface RigModuleVisualEvidence {
  rigId: RigId;
  /** Modules currently fitted in `RigState`. */
  fittedModules: ModuleId[];
  /** Modules the garage will sell this rig at all. */
  offeredModules: ModuleId[];
  /** Front-wheel steering angle at the moment of measurement, radians. */
  steeringAngle: number;
  samples: RigModuleVisualSample[];
  /** Fitted modules with no rendered group — the "bought it, saw nothing" case. */
  missingVisuals: ModuleId[];
  /** Groups visible without their module being fitted, and the reverse. */
  visibilityMismatches: string[];
}

export interface CameraResolutionEvidence {
  rigId: RigId;
  mode: CameraMode;
  obstructionSource: CameraObstructionHit["source"] | null;
  obstructionId: string | null;
  idealDistance: number;
  resolvedDistance: number;
  minimumReadableDistance: number;
  /**
   * True when the final camera is clear of world/rig geometry and preserves the
   * viewport-specific minimum composition distance.
   */
  readableComposition: boolean;
  /** Signed camera displacement along rig-forward; negative means behind. */
  forwardOffset: number;
  /** True when the resolved camera remains on the rear side of the rig. */
  behindRig: boolean;
  pathClear: boolean;
  selfIntersecting: boolean;
  selfIntersectionPart: string | null;
}

export interface RuntimeAssetBridgeEvidence {
  assetId: string;
  runtimePath: string;
  status: "loading" | "loaded" | "fallback" | "error";
  fallbackActive: boolean;
  loadedNodeCount: number;
  /** Authored clips bound from the imported asset and handed a live mixer. */
  animationClipCount: number;
  errorMessage: string | null;
}

export type RendererBackend = "webgl" | "webgpu";
export type RendererBackendRequest = "auto" | "webgl" | "webgpu";
export type RendererPolicy = "stable" | "canary" | "off";

export interface RendererBackendPolicyConfig {
  request: RendererBackendRequest;
  policy: RendererPolicy;
  policyAllowsAutoWebGPU: boolean;
  policyReason: string;
}

type FXAAUniforms = {
  resolution: {
    value: {
      set: (x: number, y: number) => void;
    };
  };
};

interface InfrastructurePropParts {
  root: THREE.Group;
  activity: THREE.Object3D;
  beacon: THREE.Mesh;
}

function material(
  color: number,
  roughness = 0.76,
  metalness = 0.08,
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
  });
}

/**
 * Free every mesh's GPU-side geometry and material under `root`, including
 * `root` itself. `Object3D.remove()`/`.clear()` only detach from the scene
 * graph — they never call `.dispose()` — so anything taken out of the scene
 * this way (a superseded fallback prop, a torn-down runtime bridge asset)
 * must be disposed explicitly or its VRAM is held for the rest of the page
 * session with nothing left referencing it.
 */
export function disposeObjectGraph(root: THREE.Object3D): void {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach((m) => m.dispose());
    } else {
      child.material.dispose();
    }
  });
}

function box(
  width: number,
  height: number,
  depth: number,
  color: number,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color),
  );
}

/** A signal lamp that has been visited: the housing, unlit. */
const SIGNAL_LAMP_DARK = 0x4a3a24;

function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number,
  color: number,
): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material(color),
  );
}

function hoodCameraSocket(rigId: RigId): THREE.Object3D {
  const mount = RIG_HOOD_CAMERA_MOUNTS[rigId];
  const socket = new THREE.Object3D();
  socket.name = `camera:hood:${rigId}`;
  socket.position.set(mount.localX, mount.localY, mount.localZ);
  return socket;
}

/**
 * A diagnostic label for one rendered part, for evidence surfaces to report.
 *
 * Most rig geometry is anonymous — `box(2.4, 2.4, 2.1, COLORS.bone)` sets no
 * name — so the fallback is the part's geometry type and its local position.
 * That reads as a grep key rather than as a description: `BoxGeometry@0.00,2.70,-1.05`
 * finds `cab.position.set(0, 2.7, -1.05)` in one search. A name assigned purely
 * to make evidence readable can go stale against the object it names; a position
 * read off the live object cannot.
 */
function partLabel(object: THREE.Object3D): string {
  if (object.name) return object.name;
  const shape =
    object instanceof THREE.Mesh ? object.geometry.type : object.type;
  const { x, y, z } = object.position;
  return `${shape}@${x.toFixed(2)},${y.toFixed(2)},${z.toFixed(2)}`;
}

/**
 * How deep two axis-aligned boxes interpenetrate, or 0 when they are apart.
 *
 * The smallest of the three axis overlaps, which is the distance one box would
 * have to move to be clear — the useful number for "how wrong is this", since an
 * overlap of 0.002 m is a modelling seam and one of 0.2 m is a module inside a cab.
 */
function penetrationDepth(a: THREE.Box3, b: THREE.Box3): number {
  const x = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
  const y = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
  const z = Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z);
  if (x <= 0 || y <= 0 || z <= 0) return 0;
  return Math.min(x, y, z);
}

/**
 * Interpenetration a module is allowed against solid rig geometry, metres.
 *
 * Not zero, because two modules are *meant* to be flush: `standoffScale: 0` bolts
 * the skid plate and the gearing case directly to the hull's underside, so their
 * top face and the hull's bottom face are the same plane and float error decides
 * the sign. Two centimetres is well under the depth of any real mistake — the
 * survey mast through the tractor's cab was 25 cm.
 */
const STRUCTURE_CONTACT_TOLERANCE = 0.02;

export class GameRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(52, 1, 0.25, 900);
  private readonly gltfLoader = new GLTFLoader();
  private readonly sun = new THREE.DirectionalLight(0xffdeb0, 2.4);
  private readonly hemisphere = new THREE.HemisphereLight(
    0xb8ddff,
    0x5d422d,
    1.6,
  );

  private readonly rigs = new Map<RigId, RigParts>();
  private readonly cargo: THREE.Group;
  private readonly hitchLine: THREE.Line;
  private readonly infrastructureProps = new Map<
    InfrastructureEntityId,
    InfrastructurePropParts
  >();

  private terrainMesh!: THREE.Mesh;
  private terrainHeights!: Float32Array;
  private readonly terrainCells = Math.round(TERRAIN_SPAN / TERRAIN_STEP);
  private readonly terrainOrigin = -TERRAIN_SPAN / 2;

  private treeTrunks!: THREE.InstancedMesh;
  private treeCrowns!: THREE.InstancedMesh;
  private treeBillboards!: THREE.InstancedMesh;
  private treeBillboardCount = 0;
  private rocks!: THREE.InstancedMesh;
  private rockBillboards!: THREE.InstancedMesh;
  private rockBillboardCount = 0;
  private felledTrunks!: THREE.InstancedMesh;
  private salvageNodes!: THREE.InstancedMesh;
  private furrowDecals!: THREE.InstancedMesh;
  private water!: THREE.Mesh;
  private waterMaterial!: THREE.ShaderMaterial;
  private sky!: THREE.Mesh;

  private dust!: THREE.Points;
  private readonly dustPositions = new Float32Array(MAX_DUST * 3);
  private readonly dustVelocities = new Float32Array(MAX_DUST * 3);
  private readonly dustLife = new Float32Array(MAX_DUST);
  private dustCursor = 0;

  private readonly dummy = new THREE.Object3D();
  private readonly billboardDirection = new THREE.Vector3();
  private readonly billboardDefaultNormal = new THREE.Vector3(0, 0, 1);
  private propAnchorX = Number.POSITIVE_INFINITY;
  private propAnchorZ = Number.POSITIVE_INFINITY;
  private renderedFurrows = 0;
  private lastDeformCount = 0;
  private lastRouteRevision = 0;
  private readonly communityPassageDecks = new Map<string, THREE.Group>();
  private readonly roadRivalryMarkers = new Map<string, THREE.Group>();
  /** Ambient life is derived from GameWorld and has no collision authority. */
  private readonly habitatLife = new THREE.Group();
  private readonly habitatBodyGeometry = new THREE.SphereGeometry(0.18, 8, 6);
  private readonly habitatWingGeometry = new THREE.ConeGeometry(0.16, 0.54, 3);
  private readonly habitatLegGeometry = new THREE.BoxGeometry(
    0.026,
    0.28,
    0.026,
  );
  private readonly habitatBirdMaterial = new THREE.MeshStandardMaterial({
    color: 0xe8e0cd,
    roughness: 0.82,
  });
  private readonly habitatCorvidMaterial = new THREE.MeshStandardMaterial({
    color: 0x25272b,
    roughness: 0.9,
  });
  private readonly habitatGrazerMaterial = new THREE.MeshStandardMaterial({
    color: 0x9a7354,
    roughness: 0.94,
  });
  private habitatAnchorX = Number.POSITIVE_INFINITY;
  private habitatAnchorZ = Number.POSITIVE_INFINITY;
  private lastHabitatFieldRevision = -1;
  private lastHabitatEcologyRevision = -1;
  private lastHabitatWorldHour = -1;
  private lastRoadIncidentRevision = -1;
  private lastFieldConditionRevision = -1;
  private fieldColourAnchorX = Number.POSITIVE_INFINITY;
  private fieldColourAnchorZ = Number.POSITIVE_INFINITY;
  private readonly furrowCutColor = new THREE.Color(0x3a2c1e);
  private readonly furrowFillColor = new THREE.Color(0x8a7a5a);
  private readonly tempColor = new THREE.Color();
  private readonly wetFieldColour = new THREE.Color(0x49351f);
  private readonly damagedFieldColour = new THREE.Color(0x8f6934);
  private readonly recoveringFieldColour = new THREE.Color(0x5f8c48);
  private currentPhase: WorldPhase | null = null;
  private lastFrameTime = performance.now();
  private shake = 0;
  /**
   * Eased 0..1 wetness delivered to the scene. `render()` nudges it toward
   * `weatherTargetRain` each frame so weather arrival reads as arrival — the
   * air thickens and rain fades in rather than snapping. Gating rain geometry
   * and fog on one eased value keeps every wet signal in lockstep.
   */
  private currentRain = 0;
  private weatherTargetRain = 0;
  private weatherPhase: "clear" | "overcast" | "rain" | "storm" = "clear";
  /** Fog density the current weather wants (from `WeatherState.fogDensity`). */
  private weatherFogTarget = 0.004;
  /**
   * The exp-2 fog density the active presentation phase chose. Weather blends
   * from this base so clear weather leaves the phase exactly as authored and
   * rain can only thicken it — never thin the atmosphere below the phase's own
   * distance falloff.
   */
  private phaseBaseFogDensity = 0.0052;
  private rainPoints: THREE.Points | null = null;
  private rainPositions: Float32Array | null = null;
  private readonly headlightFlareUntil = new Map<RigId, number>();
  /**
   * 0..1 eased toward `narrativeFocusTarget` each frame. A dialogue beat
   * (a person talking to you) narrows the field of view slightly — a soft
   * focus pull distinct from the mechanical shake/flare used for
   * workshop-action feedback, so the camera itself marks the difference.
   */
  private narrativeFocus = 0;
  private narrativeFocusTarget = 0;
  private cameraInitialised = false;
  private cameraRigId: RigId | null = null;
  private lastCameraMode: CameraMode | null = null;
  private lastCameraFocus: THREE.Vector3 | null = null;
  private cameraResolution: CameraResolutionEvidence | null = null;
  private readonly runtimeBridgeEvidence = new Map<
    string,
    RuntimeAssetBridgeEvidence
  >();
  /** Loaded GLTF roots, kept so `dispose()` can free their GPU resources. */
  private readonly loadedRuntimeBridgeRoots = new Map<string, THREE.Object3D>();
  private activeVisibilityProfileId: VisibilityProfileId =
    DEFAULT_VISIBILITY_PROFILE;
  private propVisibility: PropVisibilityMetrics = createPropVisibilityMetrics();
  private readonly reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  private readonly feedbackFrames = new Map<RigId, RigFeedbackFrame>();
  /** One-frame presentation pulses sourced from authoritative condition loss. */
  private readonly pendingConditionImpacts = new Set<RigId>();
  private lastCameraFocusY: number | null = null;

  /** Boot cost of terrain mesh generation, in ms. Surfaced through metrics(). */
  terrainBuildMs = 0;
  /** Cost of the most recent ploughing-triggered terrain patch refresh, in ms. */
  terrainRegionRefreshMs = 0;

  private readonly backendPolicy: RendererBackendPolicyConfig;
  private readonly rendererRequestedBackend: RendererBackendRequest;
  private rendererBackend: RendererBackend = "webgl";
  private rendererBackendFallback = false;
  private rendererBackendReason = "WebGL fallback/default policy";

  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private fxaaPass!: ShaderPass;
  // quality-tier fields to the renderer: `RuntimeProfileController` measures the
  // frame window and the first controllable frame, and drives this class through
  // `setVisibilityProfile` (see `runtime-profile-policy.ts` and the call site in
  // `main.ts`). A second degrade path in the renderer has twice been added here and
  // twice been dead on arrival — never read, never written — which is worse than no
  // path at all, because it reads as a capability the renderer does not have.

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly world: GameWorld,
    private readonly runtimeBridgeSpecs: readonly RuntimeBridgeSpec[] = [],
    backendPolicy: RendererBackendPolicyConfig = {
      request: "auto",
      policy: "stable",
      policyAllowsAutoWebGPU: false,
      policyReason: "rendererPolicy=stable passed",
    },
  ) {
    this.backendPolicy = backendPolicy;
    this.rendererRequestedBackend = this.backendPolicy.request;

    const selectedBackend = this.createRendererBackend();
    this.renderer = selectedBackend.renderer;
    this.rendererBackend = selectedBackend.backend;
    this.rendererBackendFallback = selectedBackend.fallback;
    this.rendererBackendReason = selectedBackend.reason;

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    // Blob shadows rather than shadow maps: a shadow-map allocation warning was
    // observed in Chrome during lifecycle testing, and this is also the cheaper
    // first-frame posture on low-power devices. Revisit when measured value exists.
    this.renderer.shadowMap.enabled = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;

    // Initialize post-processing composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Bloom pass for emissive materials and bright highlights
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5, // strength
      0.4, // radius
      0.85, // threshold
    );
    this.composer.addPass(this.bloomPass);

    // FXAA anti-aliasing (cheaper than MSAA, works with WebGPU)
    const fxaaPass = new ShaderPass(FXAAShader);
    const fxaaUniforms = fxaaPass.material.uniforms as FXAAUniforms;
    fxaaUniforms.resolution.value.set(
      1 / (window.innerWidth * this.renderer.getPixelRatio()),
      1 / (window.innerHeight * this.renderer.getPixelRatio()),
    );
    this.composer.addPass(fxaaPass);
    this.fxaaPass = fxaaPass;

    this.sun.position.set(-120, 190, -70);
    this.scene.add(this.sun, this.hemisphere);

    this.buildSky();
    this.buildTerrain();
    this.buildWater();
    this.buildInstancedProps();
    this.buildDust();
    this.buildSites();
    this.buildSettlementCargoBays();
    this.buildCommunityTraffic();
    this.buildCommunityPassageDecks();
    this.buildRoadRivalryMarkers();
    this.buildInfrastructureProps();
    this.buildRuntimeBridgeAssets();
    this.buildStars();
    this.buildRain();
    this.buildStormClouds();

    for (const id of RIG_IDS) {
      let parts: RigParts;
      if (id === "utility-tractor") parts = this.createTractor();
      else if (id === "toy-buggy") parts = this.createBuggy();
      else if (id === "marsh-skimmer") parts = this.createSkimmer();
      else parts = this.createCandidateRig(id);

      this.rigs.set(id, parts);
      this.scene.add(parts.root);
    }

    // Rig-local presentation is owned by one subsystem (ADR-0034, superseding
    // ADR-0031). The renderer keeps world placement, phase, terrain, camera,
    // and post-processing; it no longer writes rig-local transforms directly.
    for (const [rigId, parts] of this.rigs) {
      vehicleAnimationSystem.registerRig(rigId, parts);
    }

    this.cargo = this.createCargo();
    this.hitchLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
      new THREE.LineBasicMaterial({ color: COLORS.gold }),
    );
    this.hitchLine.visible = false;
    this.scene.add(this.cargo, this.hitchLine);

    window.addEventListener("resize", this.resize);
    this.resize();
  }

  private createRendererBackend(): {
    backend: RendererBackend;
    renderer: THREE.WebGLRenderer;
    reason: string;
    fallback: boolean;
  } {
    const request = this.backendPolicy.request;
    if (request === "webgl") {
      return {
        backend: "webgl",
        renderer: this.createWebGLRenderer("renderer request=webgl"),
        reason: "renderer request=webgl",
        fallback: false,
      };
    }

    if (request === "webgpu") {
      return {
        backend: "webgl",
        renderer: this.createWebGLRenderer(
          "renderer request=webgpu is not available in this build",
        ),
        reason: "renderer request=webgpu unavailable; using webgl",
        fallback: true,
      };
    }

    const policyAllowsAutoWebGPU =
      this.backendPolicy.policy === "canary" ||
      (this.backendPolicy.policy === "stable" &&
        this.backendPolicy.policyAllowsAutoWebGPU);

    return {
      backend: "webgl",
      renderer: this.createWebGLRenderer(
        policyAllowsAutoWebGPU
          ? "renderer auto policy kept webgl for composer compatibility"
          : "policy gate block",
      ),
      reason: policyAllowsAutoWebGPU
        ? `renderer=auto retained webgl for composer compatibility (${this.backendPolicy.policy})`
        : `rendererPolicy=${this.backendPolicy.policy} blocked auto webgpu (${this.backendPolicy.policyReason})`,
      fallback:
        this.backendPolicy.request === "auto" && !policyAllowsAutoWebGPU,
    };
  }

  private createWebGLRenderer(reasonLabel: string): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (this.rendererBackendReason === "WebGL fallback/default policy") {
      this.rendererBackendReason = reasonLabel;
    }
    return renderer;
  }

  private readonly resize = (): void => {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update FXAA resolution
    if (this.fxaaPass) {
      const fxaaUniforms = this.fxaaPass.material.uniforms as FXAAUniforms;
      fxaaUniforms.resolution.value.set(
        1 / (width * this.renderer.getPixelRatio()),
        1 / (height * this.renderer.getPixelRatio()),
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Terrain
  // ---------------------------------------------------------------------------

  /**
   * Build the terrain mesh from the height field.
   *
   * Heights come from one bulk `sampleHeightGrid` call and normals are derived
   * from grid neighbours, which costs one `height()` per vertex instead of the
   * five a per-vertex `sample()` would need. Vertex colours carry the surface
   * material, so the world is readable with zero texture assets and zero asset
   * provenance obligations.
   */
  private buildTerrain(): void {
    const startedAt = performance.now();
    const cells = this.terrainCells;
    const size = cells + 1;

    this.terrainHeights = this.world.terrain.sampleHeightGrid(
      this.terrainOrigin,
      this.terrainOrigin,
      cells,
      TERRAIN_STEP,
    );

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(size * size * 3);
    const colors = new Float32Array(size * size * 3);
    const colour = new THREE.Color();

    for (let iz = 0; iz < size; iz += 1) {
      for (let ix = 0; ix < size; ix += 1) {
        const index = iz * size + ix;
        const x = this.terrainOrigin + ix * TERRAIN_STEP;
        const z = this.terrainOrigin + iz * TERRAIN_STEP;
        const y = this.terrainHeights[index]!;
        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Slope from the grid neighbours we already sampled. Calling `surfaceFor`
        // without it makes the field fall back to `slope()`, which is four more
        // `height()` queries per vertex — measured at ~300 ms of the terrain build
        // on its own, for a number that is sitting in the array beside us.
        const east = this.terrainHeights[index + (ix < cells ? 1 : -1)]!;
        const north = this.terrainHeights[index + (iz < cells ? size : -size)]!;
        const slope = Math.hypot(
          (east - y) / TERRAIN_STEP,
          (north - y) / TERRAIN_STEP,
        );

        const tint = this.resolveTerrainVertexColour(
          x,
          z,
          y,
          slope,
          ix,
          iz,
          colour,
        );
        colors[index * 3] = colour.r * tint;
        colors[index * 3 + 1] = colour.g * tint;
        colors[index * 3 + 2] = colour.b * tint;
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

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    this.terrainMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        metalness: 0.02,
      }),
    );
    this.terrainMesh.name = "terrain";
    this.scene.add(this.terrainMesh);
    this.terrainBuildMs = performance.now() - startedAt;
  }

  /**
   * Presentation-only terrain colour derived from canonical geometry and
   * GameWorld field memory. No renderer value can change traction, vegetation,
   * or terrain deformation.
   */
  private resolveTerrainVertexColour(
    x: number,
    z: number,
    height: number,
    slope: number,
    ix: number,
    iz: number,
    target: THREE.Color,
  ): number {
    const surface = this.world.terrain.surfaceFor(x, z, height, slope);
    target.setHex(surface.color);
    const field = this.world.fieldConditionAt(x, z);
    if (field) {
      const wetness = Math.max(
        0,
        Math.min(1, (field.moistureRatio - 0.3) / 0.7),
      );
      const damage = Math.max(0, Math.min(1, 1 - field.soilHealth));
      if (wetness > 0) target.lerp(this.wetFieldColour, wetness * 0.62);
      if (damage > 0) target.lerp(this.damagedFieldColour, damage * 0.28);
      if (wetness < 0.45 && field.soilHealth > 0.55) {
        target.lerp(
          this.recoveringFieldColour,
          (field.soilHealth - 0.55) * 0.28,
        );
      }
    }
    // A wider, still-natural-looking per-vertex tint spread than the prior
    // 0.9-1.08 range: at that narrow a swing the ground read as a flat,
    // single-tone plane from any camera angle pulled back far enough to lose
    // per-pixel shading (top-down, tactical, survey).
    return 0.78 + ((ix * 7 + iz * 13) % 13) * 0.028;
  }

  /** Refresh only a local terrain-colour patch from authoritative field memory. */
  private refreshTerrainColourRegion(
    centreX: number,
    centreZ: number,
    radius: number,
  ): void {
    const size = this.terrainCells + 1;
    const minIx = Math.max(
      0,
      Math.floor((centreX - radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const maxIx = Math.min(
      size - 1,
      Math.ceil((centreX + radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const minIz = Math.max(
      0,
      Math.floor((centreZ - radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const maxIz = Math.min(
      size - 1,
      Math.ceil((centreZ + radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    if (minIx > maxIx || minIz > maxIz) return;
    const colour = this.terrainMesh.geometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;
    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        const index = iz * size + ix;
        const x = this.terrainOrigin + ix * TERRAIN_STEP;
        const z = this.terrainOrigin + iz * TERRAIN_STEP;
        const height = this.terrainHeights[index]!;
        const east =
          this.terrainHeights[index + (ix < this.terrainCells ? 1 : -1)]!;
        const north =
          this.terrainHeights[index + (iz < this.terrainCells ? size : -size)]!;
        const slope = Math.hypot(
          (east - height) / TERRAIN_STEP,
          (north - height) / TERRAIN_STEP,
        );
        const tint = this.resolveTerrainVertexColour(
          x,
          z,
          height,
          slope,
          ix,
          iz,
          this.tempColor,
        );
        colour.setXYZ(
          index,
          this.tempColor.r * tint,
          this.tempColor.g * tint,
          this.tempColor.b * tint,
        );
      }
    }
    colour.needsUpdate = true;
  }

  /**
   * Re-sample terrain vertices inside a box.
   *
   * Ploughing writes into the height field, so the mesh has to be told. Only the
   * neighbourhood of the cut is rebuilt — without this the ground would deform
   * for physics while looking untouched, which is the worst of both.
   *
   * Normals are rebuilt with `refreshTerrainNormalsInRegion` (scoped to the
   * changed box plus one vertex ring), not `computeVertexNormals()` (whole
   * mesh). Ploughing fires on every deformation tick while a player holds the
   * plough control, and a full recompute costs ~10ms on a 102x102 grid to
   * update the ~130 triangles (0.6% of the mesh) that could have changed —
   * see ADR-0040.
   */
  private refreshTerrainRegion(
    centreX: number,
    centreZ: number,
    radius: number,
  ): void {
    const startedAt = performance.now();
    const size = this.terrainCells + 1;
    const minIx = Math.max(
      0,
      Math.floor((centreX - radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const maxIx = Math.min(
      size - 1,
      Math.ceil((centreX + radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const minIz = Math.max(
      0,
      Math.floor((centreZ - radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    const maxIz = Math.min(
      size - 1,
      Math.ceil((centreZ + radius - this.terrainOrigin) / TERRAIN_STEP),
    );
    if (minIx > maxIx || minIz > maxIz) return;

    const position = this.terrainMesh.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    for (let iz = minIz; iz <= maxIz; iz += 1) {
      for (let ix = minIx; ix <= maxIx; ix += 1) {
        const index = iz * size + ix;
        const x = this.terrainOrigin + ix * TERRAIN_STEP;
        const z = this.terrainOrigin + iz * TERRAIN_STEP;
        const y = this.world.terrain.height(x, z);
        this.terrainHeights[index] = y;
        position.setY(index, y);
      }
    }
    position.needsUpdate = true;

    const normal = this.terrainMesh.geometry.getAttribute("normal") as
      THREE.BufferAttribute | undefined;
    if (normal === undefined || normal.count !== position.count) {
      // Defensive fallback only: buildTerrain() always creates a matching
      // normal attribute before any refreshTerrainRegion call is reachable,
      // so this path is not expected to run in the live game.
      this.terrainMesh.geometry.computeVertexNormals();
    } else {
      refreshTerrainNormalsInRegion(
        position,
        normal,
        this.terrainCells,
        minIx,
        maxIx,
        minIz,
        maxIz,
      );
    }
    this.terrainRegionRefreshMs = performance.now() - startedAt;
  }

  private buildWater(): void {
    // Custom water shader with wave animation, foam, depth-based color, and specular highlights
    const initialInfrastructure = createInfrastructureNetworkState();
    const waterUniforms = {
      time: { value: 0 },
      waterColor: { value: new THREE.Color(SURFACES.water.color) },
      waterLevel: { value: WATER_LEVEL },
      sunDirection: { value: new THREE.Vector3(-0.6, 0.8, -0.4).normalize() },
      sunColor: { value: new THREE.Color(0xffd58a) },
      foamColor: { value: new THREE.Color(0xffffff) },
      deepColor: { value: new THREE.Color(0x0a1f2e) },
      shallowColor: { value: new THREE.Color(0x2a6b8a) },
      waveScale: { value: 1.0 },
      waveSpeed: { value: 0.8 },
      foamThreshold: { value: 0.65 },
      foamStrength: { value: 0.35 },
      specularPower: { value: 40.0 },
      specularIntensity: { value: 0.6 },
      // These inputs are presentation copies of canonical infrastructure
      // effects. The simulation still owns condition and waterline truth.
      infrastructureCenters: {
        value: INFRASTRUCTURE_ENTITY_IDS.map((id) => {
          const definition = INFRASTRUCTURE_DEFINITIONS[id];
          return new THREE.Vector2(definition.x, definition.z);
        }),
      },
      infrastructureRadii: {
        value: INFRASTRUCTURE_ENTITY_IDS.map((id) => {
          const effect = INFRASTRUCTURE_DEFINITIONS[id].effects.find(
            (candidate) => candidate.kind === "water-level-offset",
          );
          return effect?.radiusM ?? 0;
        }),
      },
      infrastructureWaterOffsets: {
        value: INFRASTRUCTURE_ENTITY_IDS.map((id) => {
          const definition = INFRASTRUCTURE_DEFINITIONS[id];
          const effect = definition.effects.find(
            (candidate) => candidate.kind === "water-level-offset",
          );
          return effect &&
            infrastructureIsOperating(
              definition,
              initialInfrastructure.entities[id],
            )
            ? effect.operatingValue
            : (effect?.dormantValue ?? 0);
        }),
      },
    };

    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: waterUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        uniform float time;
        uniform float waveScale;
        uniform float waveSpeed;

        // Gerstner wave function
        vec3 gerstnerWave(vec2 position, vec2 direction, float amplitude, float wavelength, float speed, float time) {
          float k = 2.0 * 3.14159265 / wavelength;
          float c = sqrt(9.81 / k);
          float f = k * dot(direction, position) - speed * time;
          float a = amplitude / k;

          float sinF = sin(f);
          float cosF = cos(f);

          return vec3(
            direction.x * a * sinF,
            a * cosF,
            direction.y * a * sinF
          );
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Sum multiple Gerstner waves
          vec3 waveOffset = vec3(0.0);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(1.0, 0.3)), 0.15 * waveScale, 12.0, 1.2 * waveSpeed, time);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(0.7, -0.7)), 0.1 * waveScale, 8.0, 1.5 * waveSpeed, time);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(0.3, 1.0)), 0.08 * waveScale, 5.0, 1.8 * waveSpeed, time);
          waveOffset += gerstnerWave(pos.xz, normalize(vec2(-0.5, 0.8)), 0.05 * waveScale, 3.0, 2.2 * waveSpeed, time);

          pos += waveOffset;

          // Calculate normal from wave derivatives (simplified)
          vec2 eps = vec2(0.1, 0.0);
          float h0 = pos.y;
          float hx = h0;
          float hy = h0;
          
          // Approximate normal from finite differences
          vec3 normal = normalize(vec3(
            -waveOffset.x / 0.1,
            1.0,
            -waveOffset.z / 0.1
          ));

          vNormal = normalize(normalMatrix * normal);

          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        uniform float time;
        uniform vec3 waterColor;
        uniform float waterLevel;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform vec3 foamColor;
        uniform vec3 deepColor;
        uniform vec3 shallowColor;
        uniform float foamThreshold;
        uniform float foamStrength;
        uniform float specularPower;
        uniform float specularIntensity;
        uniform vec2 infrastructureCenters[3];
        uniform float infrastructureRadii[3];
        uniform float infrastructureWaterOffsets[3];

        // Fresnel-Schlick approximation
        float fresnelSchlick(float cosTheta, float roughness) {
          float f0 = 0.02;
          return f0 + (1.0 - f0) * pow(1.0 - cosTheta, 5.0);
        }

        // Value noise for foam
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);

          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));

          vec2 u = f * f * (3.0 - 2.0 * f);

          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        // Fractal Brownian Motion
        float fbm(vec2 st, float time) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          float drainageMask = 0.0;
          float pressureTint = 0.0;
          for (int index = 0; index < 3; index++) {
            float radius = infrastructureRadii[index];
            if (radius <= 0.0) continue;
            float distanceToMachine = distance(vWorldPosition.xz, infrastructureCenters[index]);
            float t = clamp(1.0 - distanceToMachine / radius, 0.0, 1.0);
            float influence = t * t * (3.0 - 2.0 * t);
            float offset = infrastructureWaterOffsets[index];
            if (offset < 0.0) {
              drainageMask = max(drainageMask, influence * clamp(-offset / 2.6, 0.0, 1.0));
            } else {
              pressureTint = max(pressureTint, influence * clamp(offset / 1.1, 0.0, 1.0));
            }
          }
          // The terrain remains present behind a drained basin. This is a visual
          // consequence of the simulation's local waterline, not a new terrain
          // or collision shape owned by the renderer.
          if (drainageMask > 0.72) discard;

          // Depth-based color blending
          float depth = max(0.0, waterLevel - vWorldPosition.y);
          float depthFactor = smoothstep(0.0, 8.0, depth);
          vec3 baseColor = mix(shallowColor, deepColor, depthFactor);
          baseColor = mix(baseColor, deepColor, pressureTint * 0.55);

          // Fresnel effect for surface reflection
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float cosTheta = dot(vNormal, viewDir);
          float fresnel = pow(1.0 - max(0.0, cosTheta), 4.0);

          // Foam generation using noise
          float foamNoise = fbm(vUv * 20.0 + vec2(time * 0.1, time * 0.05), time);
          float foamEdge = smoothstep(0.6, 0.8, foamNoise);
          
          // Wave crest foam (based on normal angle)
          float waveFoam = smoothstep(0.7, 0.95, vNormal.y);
          
          // Combine foam sources
          float foam = max(foamEdge, waveFoam) * 0.35;
          foam = clamp(foam, 0.0, 1.0);

          // Specular highlight from sun
          vec3 halfVector = normalize(sunDirection + viewDir);
          float spec = max(0.0, dot(vNormal, halfVector));
          float sunSpec = pow(spec, specularPower) * specularIntensity;

          // Final color composition
          vec3 color = baseColor;
          
          // Add sun specular
          color += sunColor * sunSpec * max(0.0, dot(vNormal, sunDirection));
          
          // Add foam
          color = mix(baseColor, vec3(1.0, 1.0, 1.0), foam * 0.8);
          
          // Add sun specular
          color += sunColor * sunSpec * max(0.0, dot(vNormal, sunDirection));
          
          // Fresnel reflection
          color = mix(color, vec3(0.2, 0.4, 0.6) * sunColor, fresnel * 0.3);
          
          // Final opacity based on depth and angle
          float opacity = 0.75;
          opacity *= 1.0 - fresnel * 0.3;
          opacity *= 1.0 - drainageMask * 0.88;
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.water = new THREE.Mesh(
      new THREE.PlaneGeometry(TERRAIN_SPAN, TERRAIN_SPAN, 128, 128),
      waterMaterial,
    );
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = WATER_LEVEL;
    this.water.name = "water";
    this.scene.add(this.water);

    this.waterMaterial = waterMaterial;
  }

  /**
   * Presentation consumes network-owned state once per frame. The shader has
   * the same authored centres/radii as the effect resolver, but cannot mutate
   * an entity or decide whether a machine is operating.
   */
  private updateInfrastructureWater(state: GameState): void {
    const uniforms = this.waterMaterial.uniforms as {
      infrastructureCenters: { value: THREE.Vector2[] };
      infrastructureRadii: { value: number[] };
      infrastructureWaterOffsets: { value: number[] };
    };
    for (let index = 0; index < INFRASTRUCTURE_ENTITY_IDS.length; index += 1) {
      const id = INFRASTRUCTURE_ENTITY_IDS[index]!;
      const definition = INFRASTRUCTURE_DEFINITIONS[id];
      const effect = definition.effects.find(
        (candidate) => candidate.kind === "water-level-offset",
      );
      const centre = uniforms.infrastructureCenters.value[index]!;
      centre.set(definition.x, definition.z);
      uniforms.infrastructureRadii.value[index] = effect?.radiusM ?? 0;
      uniforms.infrastructureWaterOffsets.value[index] =
        effect &&
        infrastructureIsOperating(definition, state.infrastructure.entities[id])
          ? effect.operatingValue
          : (effect?.dormantValue ?? 0);
    }
  }

  /** Keep machine motion and status light strictly downstream of network state. */
  private updateInfrastructureProps(state: GameState, delta: number): void {
    for (const id of INFRASTRUCTURE_ENTITY_IDS) {
      const parts = this.infrastructureProps.get(id);
      if (!parts) continue;
      const definition = INFRASTRUCTURE_DEFINITIONS[id];
      const entity = state.infrastructure.entities[id];
      const operating = infrastructureIsOperating(definition, entity);
      parts.activity.rotation.z += operating ? delta * 2.4 : delta * 0.08;
      (parts.beacon.material as THREE.MeshBasicMaterial).color.setHex(
        !entity.known ? COLORS.gold : operating ? COLORS.cyan : 0xe45b4f,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Instanced props
  // ---------------------------------------------------------------------------

  private buildInstancedProps(): void {
    this.treeTrunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.24, 0.4, 1, 4),
      material(0x5f432f),
      MAX_TREE_INSTANCES,
    );
    this.treeCrowns = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 1),
      material(0x54682f),
      MAX_TREE_INSTANCES,
    );
    this.rocks = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(1, 0),
      material(0x7d746a),
      MAX_ROCK_INSTANCES,
    );
    this.treeBillboards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      material(0x5f7d4d),
      MAX_TREE_INSTANCES,
    );
    this.rockBillboards = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1, 1),
      material(0x7d746a),
      MAX_ROCK_INSTANCES,
    );
    this.felledTrunks = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.3, 0.34, 1, 6),
      material(0x6a5038),
      MAX_FELLED_INSTANCES,
    );
    this.salvageNodes = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      material(0x9a5c39, 0.7, 0.25),
      MAX_NODE_INSTANCES,
    );

    this.furrowDecals = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(1.05, 1.5),
      material(0xffffff, 1),
      MAX_FURROWS,
    );
    this.furrowDecals.count = 0;
    // Pre-fill all instances with the cut-furrow colour so the initial state
    // looks correct before any mode-specific calls happen.
    this.furrowCutColor.set(0x3a2c1e);
    this.furrowFillColor.set(0x8a7a5a);
    for (let i = 0; i < MAX_FURROWS; i++) {
      this.furrowDecals.setColorAt(i, this.furrowCutColor);
    }
    if (this.furrowDecals.instanceColor)
      this.furrowDecals.instanceColor.needsUpdate = true;

    /*
     * These dynamic clouds are rebuilt around the active rig. Geometry-only
     * bounds do not include the per-instance transforms, so they can cull
     * visible scenery. Keep culling disabled until refreshProps computes a
     * truthful aggregate instance bound after each rebuild.
     */
    for (const mesh of [
      this.treeTrunks,
      this.treeCrowns,
      this.rocks,
      this.treeBillboards,
      this.rockBillboards,
      this.felledTrunks,
      this.salvageNodes,
      this.furrowDecals,
    ]) {
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.frustumCulled = false;
      this.scene.add(mesh);
    }
  }

  /**
   * Rebuild prop instances around the rig.
   *
   * Called only when the rig has travelled `PROP_REBUILD_DISTANCE`, because
   * regenerating the obstacle field is a hash-and-sample loop and not something to
   * run per frame.
   */
  private refreshProps(state: GameState): void {
    const rig = state.rigs[state.activeRigId];
    const profile = visibilityProfile(this.activeVisibilityProfileId);
    const propRadius = profile.farMeters;
    const obstacles = [
      ...this.world.obstacles.near(rig.x, rig.z, propRadius),
      ...this.world.incidentObstaclesNear(rig.x, rig.z, propRadius),
    ];
    const nodes = this.world.exploration.nodesNear(
      rig.x,
      rig.z,
      propRadius,
      this.world.collectedNodes,
    );
    const visibility = createPropVisibilityMetrics(profile);
    const tierFor = (x: number, z: number) => {
      const tier = classifyVisibility(
        Math.hypot(x - rig.x, z - rig.z),
        profile,
      );
      recordVisibilityCandidate(visibility, tier);
      return tier;
    };

    // Reset billboard counters for this rebuild
    this.treeBillboardCount = 0;
    this.rockBillboardCount = 0;

    let trees = 0;
    let rocks = 0;
    let felled = 0;

    for (const obstacle of obstacles) {
      if (tierFor(obstacle.x, obstacle.z) === "culled") continue;
      const down = this.world.felledObstacles.has(obstacle.id);
      const groundY = this.world.terrain.height(obstacle.x, obstacle.z);
      // Terrain occlusion: skip instances hidden behind hills from camera.
      const testY = down
        ? groundY + felledTrunkLength(obstacle) * 0.5
        : obstacle.kind === "tree"
          ? groundY + treeTrunkHeight(obstacle) * 0.5
          : groundY + obstacle.radius * 0.35;
      if (this.isOccludedByTerrain(obstacle.x, testY, obstacle.z)) {
        visibility.occluded += 1;
        continue;
      }
      if (obstacle.kind === "tree" && !down) {
        if (trees >= MAX_TREE_INSTANCES) {
          visibility.capacityLimited += 1;
          continue;
        }
        this.placeTree(obstacle, trees);
        trees += 1;
      } else if (obstacle.kind === "tree") {
        if (felled >= MAX_FELLED_INSTANCES) {
          visibility.capacityLimited += 1;
          continue;
        }
        this.placeFelled(obstacle, felled);
        felled += 1;
      } else {
        if (rocks >= MAX_ROCK_INSTANCES) {
          visibility.capacityLimited += 1;
          continue;
        }
        this.placeRock(obstacle, rocks);
        rocks += 1;
      }
      visibility.submitted += 1;
    }

    let nodeCount = 0;
    for (const node of nodes) {
      if (tierFor(node.x, node.z) === "culled") continue;
      const scale = 0.8 + node.variation * 0.4;
      const testY = node.groundY + scale * 0.5;
      if (this.isOccludedByTerrain(node.x, testY, node.z)) {
        visibility.occluded += 1;
        continue;
      }
      if (nodeCount >= MAX_NODE_INSTANCES) {
        visibility.capacityLimited += 1;
        continue;
      }
      this.placeNode(node, nodeCount);
      nodeCount += 1;
      visibility.submitted += 1;
    }

    this.treeTrunks.count = trees;
    this.treeCrowns.count = trees;
    this.rocks.count = rocks;
    if (this.treeBillboards !== undefined) {
      this.treeBillboards.count = this.treeBillboardCount;
    }
    if (this.rockBillboards !== undefined) {
      this.rockBillboards.count = this.rockBillboardCount;
    }
    this.felledTrunks.count = felled;
    this.salvageNodes.count = nodeCount;

    this.treeTrunks.instanceMatrix.needsUpdate = true;
    this.treeCrowns.instanceMatrix.needsUpdate = true;
    this.rocks.instanceMatrix.needsUpdate = true;
    if (this.treeBillboards !== undefined) {
      this.treeBillboards.instanceMatrix.needsUpdate = true;
    }
    if (this.rockBillboards !== undefined) {
      this.rockBillboards.instanceMatrix.needsUpdate = true;
    }
    this.felledTrunks.instanceMatrix.needsUpdate = true;
    this.salvageNodes.instanceMatrix.needsUpdate = true;

    this.propAnchorX = rig.x;
    this.propAnchorZ = rig.z;
    this.propVisibility = visibility;

    // Compute aggregate bounds for frustum culling and enable it.
    this.computeAndSetInstanceBounds(this.treeTrunks, trees);
    this.computeAndSetInstanceBounds(this.treeCrowns, trees);
    this.computeAndSetInstanceBounds(this.rocks, rocks);
    this.computeAndSetInstanceBounds(this.felledTrunks, felled);
    this.computeAndSetInstanceBounds(this.salvageNodes, nodeCount);
    if (this.treeBillboards !== undefined) {
      this.computeAndSetInstanceBounds(
        this.treeBillboards,
        this.treeBillboardCount,
      );
    }
    if (this.rockBillboards !== undefined) {
      this.computeAndSetInstanceBounds(
        this.rockBillboards,
        this.rockBillboardCount,
      );
    }
    this.computeAndSetInstanceBounds(this.furrowDecals, this.renderedFurrows);
  }

  /**
   * Compute an aggregate bounding sphere from the active instance matrices and
   * enable frustum culling. InstancedMesh uses the base geometry bounds by
   * default, which do not reflect the actual instance spread. This must be
   * called after every rebuild so the renderer can skip off-screen meshes.
   */
  private computeAndSetInstanceBounds(
    mesh: THREE.InstancedMesh,
    count: number,
  ): void {
    if (count === 0) {
      mesh.boundingSphere = null;
      mesh.frustumCulled = false;
      return;
    }
    const sphere = new THREE.Sphere();
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < count; i += 1) {
      mesh.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);
      if (position.x < minX) minX = position.x;
      if (position.y < minY) minY = position.y;
      if (position.z < minZ) minZ = position.z;
      if (position.x > maxX) maxX = position.x;
      if (position.y > maxY) maxY = position.y;
      if (position.z > maxZ) maxZ = position.z;
    }

    const centerX = (minX + maxX) * 0.5;
    const centerY = (minY + maxY) * 0.5;
    const centerZ = (minZ + maxZ) * 0.5;
    sphere.center.set(centerX, centerY, centerZ);

    const dx = maxX - centerX;
    const dy = maxY - centerY;
    const dz = maxZ - centerZ;
    sphere.radius = Math.hypot(dx, dy, dz) + 1.0; // padding for scale

    mesh.boundingSphere = sphere;
    mesh.frustumCulled = true;
  }

  /**
   * Test if a world position is occluded by terrain from the current camera.
   * Uses the same raymarch logic as camera obstruction but with fewer samples
   * for performance. Returns true if the line of sight is blocked.
   */
  private isOccludedByTerrain(x: number, y: number, z: number): boolean {
    if (!this.cameraInitialised) return false;
    const cam = this.camera.position;
    // 8 samples is sufficient for prop occlusion; camera uses 14 for pull-in.
    // Clearance 0.5m accounts for prop size and avoids false hits on slopes.
    return (
      this.world.terrain.raymarchBlocked(cam.x, cam.y, cam.z, x, y, z, 8, 0.5) <
      1
    );
  }

  /**
   * Orient `this.dummy` so its +Z face normal points at the camera's actual
   * 3D position — full spherical billboarding, not just a horizontal (yaw)
   * facing.
   *
   * A yaw-only facing (rotate around Y so the plane "faces" the camera's
   * horizontal bearing) still stands the plane vertical. That reads fine
   * from a roughly-horizontal camera (Chase, Hood, Side) but is geometrically
   * useless against a steep overhead camera (Tactical, Top-down): a vertical
   * plane's cross-section viewed from above is a thin line no matter which
   * way it yaws, because yaw only rotates around the one axis the overhead
   * camera is looking straight down. Facing the true camera vector — pitch
   * included — is what actually keeps the flat LOD impostor looking like a
   * canopy/rock blob instead of a floating stick from every camera mode.
   *
   * Far-tier LOD billboards are rebuilt only when the rig moves (not every
   * frame), so this is a per-rebuild approximation rather than true
   * per-frame billboarding — sufficient here since the "far" tier is by
   * definition distant scenery, not something the camera sits on top of.
   */
  private faceBillboardAtCamera(x: number, y: number, z: number): void {
    this.billboardDirection
      .set(
        this.camera.position.x - x,
        this.camera.position.y - y,
        this.camera.position.z - z,
      )
      .normalize();
    this.dummy.quaternion.setFromUnitVectors(
      this.billboardDefaultNormal,
      this.billboardDirection,
    );
  }

  private placeTree(obstacle: Obstacle, index: number): void {
    const trunkHeight = treeTrunkHeight(obstacle);
    // Re-ground on the live height field rather than the cached groundY so trees
    // stay correctly positioned after plough deformation changes the terrain.
    const groundY = this.world.terrain.height(obstacle.x, obstacle.z);
    this.dummy.position.set(
      obstacle.x,
      groundY + trunkHeight * 0.5,
      obstacle.z,
    );
    this.dummy.rotation.set(0, obstacle.variation * Math.PI, 0);
    this.dummy.scale.set(
      obstacle.radius * 1.6,
      trunkHeight,
      obstacle.radius * 1.6,
    );
    this.dummy.updateMatrix();
    this.treeTrunks.setMatrixAt(index, this.dummy.matrix);

    const crownRadius = treeCrownRadius(obstacle);
    this.dummy.position.set(obstacle.x, treeCrownCenterY(obstacle), obstacle.z);
    this.dummy.rotation.set(0, obstacle.variation * 4.1, 0);
    this.dummy.scale.set(crownRadius, crownRadius * 1.3, crownRadius);
    this.dummy.updateMatrix();
    this.treeCrowns.setMatrixAt(index, this.dummy.matrix);

    // Also place billboard for far-tier LOD
    const tier = classifyVisibility(
      Math.hypot(obstacle.x - this.propAnchorX, obstacle.z - this.propAnchorZ),
      visibilityProfile(this.activeVisibilityProfileId),
    );
    if (
      tier === "far" &&
      this.treeBillboards !== undefined &&
      this.treeBillboardCount < MAX_TREE_INSTANCES
    ) {
      const billboardY = treeCrownCenterY(obstacle);
      this.dummy.position.set(obstacle.x, billboardY, obstacle.z);
      this.faceBillboardAtCamera(obstacle.x, billboardY, obstacle.z);
      this.dummy.scale.set(crownRadius * 1.5, crownRadius * 1.5, 1);
      this.dummy.updateMatrix();
      this.treeBillboards.setMatrixAt(
        this.treeBillboardCount,
        this.dummy.matrix,
      );
      this.treeBillboardCount += 1;
    }
  }

  private placeFelled(obstacle: Obstacle, index: number): void {
    const length = felledTrunkLength(obstacle);
    this.dummy.position.set(
      obstacle.x,
      obstacle.groundY + obstacle.radius * 0.9,
      obstacle.z,
    );
    // Lying on its side, so a cleared route is visibly a route you cleared.
    this.dummy.rotation.set(Math.PI / 2, obstacle.variation * Math.PI, 0.08);
    this.dummy.scale.set(obstacle.radius * 1.7, length, obstacle.radius * 1.7);
    this.dummy.updateMatrix();
    this.felledTrunks.setMatrixAt(index, this.dummy.matrix);
  }

  private placeRock(obstacle: Obstacle, index: number): void {
    // Re-ground on the live height field so rocks track the surface after
    // plough deformation changes the terrain height.
    const groundY = this.world.terrain.height(obstacle.x, obstacle.z);
    this.dummy.position.set(
      obstacle.x,
      groundY + obstacle.radius * 0.35,
      obstacle.z,
    );
    this.dummy.rotation.set(
      obstacle.variation * 0.6,
      obstacle.variation * Math.PI * 2,
      obstacle.variation * 0.4,
    );
    this.dummy.scale.set(
      obstacle.radius,
      rockVisualHalfHeight(obstacle),
      obstacle.radius * (0.85 + obstacle.variation * 0.3),
    );
    this.dummy.updateMatrix();
    this.rocks.setMatrixAt(index, this.dummy.matrix);

    // Also place billboard for far-tier LOD
    const tier = classifyVisibility(
      Math.hypot(obstacle.x - this.propAnchorX, obstacle.z - this.propAnchorZ),
      visibilityProfile(this.activeVisibilityProfileId),
    );
    if (
      tier === "far" &&
      this.rockBillboards !== undefined &&
      this.rockBillboardCount < MAX_ROCK_INSTANCES
    ) {
      const halfHeight = rockVisualHalfHeight(obstacle);
      const billboardY = obstacle.groundY + halfHeight;
      this.dummy.position.set(obstacle.x, billboardY, obstacle.z);
      this.faceBillboardAtCamera(obstacle.x, billboardY, obstacle.z);
      this.dummy.scale.set(obstacle.radius * 1.5, obstacle.radius * 1.5, 1);
      this.dummy.updateMatrix();
      this.rockBillboards.setMatrixAt(
        this.rockBillboardCount,
        this.dummy.matrix,
      );
      this.rockBillboardCount += 1;
    }
  }

  private placeNode(node: SalvageNode, index: number): void {
    const scale = 0.8 + node.variation * 0.4;
    this.dummy.position.set(node.x, node.groundY + scale * 0.5, node.z);
    this.dummy.rotation.set(0, node.variation * Math.PI, 0);
    this.dummy.scale.set(scale, scale * 0.8, scale);
    this.dummy.updateMatrix();
    this.salvageNodes.setMatrixAt(index, this.dummy.matrix);
  }

  // ---------------------------------------------------------------------------
  // Dust
  // ---------------------------------------------------------------------------

  private buildDust(): void {
    const geometry = new THREE.BufferGeometry();
    this.dustPositions.fill(-9999);
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.dustPositions, 3),
    );
    this.dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xd8c9a8,
        size: 0.7,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    this.dust.frustumCulled = false;
    this.scene.add(this.dust);
  }

  /**
   * Emit dust from a slipping wheel.
   *
   * Tied to `wheel.slip` and the surface's own `spray`, so the particle plume is a
   * readout of the traction model rather than decoration: a plume means you are
   * losing grip right now, on this ground.
   */
  private emitDust(
    x: number,
    y: number,
    z: number,
    strength: number,
    speed: number,
  ): void {
    const bursts = Math.min(3, Math.max(1, Math.round(strength * 3)));
    for (let burst = 0; burst < bursts; burst += 1) {
      const index = this.dustCursor;
      this.dustCursor = (this.dustCursor + 1) % MAX_DUST;
      const offset = index * 3;
      this.dustPositions[offset] = x;
      this.dustPositions[offset + 1] = y;
      this.dustPositions[offset + 2] = z;
      // Deterministic-looking spread from the index; visual only, never simulated.
      const angle = index * 2.399963;
      this.dustVelocities[offset] = Math.cos(angle) * (0.6 + speed * 0.06);
      this.dustVelocities[offset + 1] = 0.9 + strength * 1.3;
      this.dustVelocities[offset + 2] = Math.sin(angle) * (0.6 + speed * 0.06);
      this.dustLife[index] = 0.55 + strength * 0.5;
    }
  }

  private updateDust(delta: number): void {
    for (let index = 0; index < MAX_DUST; index += 1) {
      if (this.dustLife[index]! <= 0) continue;
      const offset = index * 3;
      this.dustLife[index] = this.dustLife[index]! - delta;
      if (this.dustLife[index]! <= 0) {
        this.dustPositions[offset + 1] = -9999;
        continue;
      }
      const velocityY = this.dustVelocities[offset + 1]!;
      this.dustPositions[offset] =
        this.dustPositions[offset]! + this.dustVelocities[offset]! * delta;
      this.dustPositions[offset + 1] =
        this.dustPositions[offset + 1]! + velocityY * delta;
      this.dustPositions[offset + 2] =
        this.dustPositions[offset + 2]! +
        this.dustVelocities[offset + 2]! * delta;
      this.dustVelocities[offset + 1] = velocityY - 1.6 * delta;
    }
    (
      this.dust.geometry.getAttribute("position") as THREE.BufferAttribute
    ).needsUpdate = true;
  }

  // ---------------------------------------------------------------------------
  // Authored sites
  // ---------------------------------------------------------------------------

  /** Ground a group at the terrain height of its own position. */
  private groundAt(group: THREE.Object3D, x: number, z: number): void {
    group.position.set(x, this.world.terrain.height(x, z), z);
  }

  private createStructurePart(part: WorldStructurePart): THREE.Mesh {
    let object: THREE.Mesh;
    if (part.shape.kind === "box") {
      object = box(
        part.shape.width,
        part.shape.height,
        part.shape.depth,
        part.color,
      );
    } else if (part.shape.kind === "cylinder") {
      object = cylinder(
        part.shape.radiusTop ?? part.shape.radius,
        part.shape.radiusBottom ?? part.shape.radius,
        part.shape.height,
        part.shape.radialSegments,
        part.color,
      );
    } else {
      object = new THREE.Mesh(
        new THREE.ConeGeometry(
          part.shape.radius,
          part.shape.height,
          part.shape.radialSegments,
        ),
        material(part.color, part.roughness),
      );
      object.scale.z = part.shape.scaleZ ?? 1;
    }
    object.name = `structure:${part.id}`;
    object.position.set(part.localX, part.localY, part.localZ);
    object.rotation.y = part.rotationY ?? 0;
    if (part.roughness !== undefined && part.shape.kind !== "cone") {
      (object.material as THREE.MeshStandardMaterial).roughness =
        part.roughness;
    }
    return object;
  }

  /**
   * Build compact, authored machine silhouettes from canonical infrastructure
   * definitions. Visible mesh is not collision authority.
   */
  private buildInfrastructureProps(): void {
    for (const id of INFRASTRUCTURE_ENTITY_IDS) {
      const definition = INFRASTRUCTURE_DEFINITIONS[id];
      const root = new THREE.Group();
      root.name = `infrastructure:${id}`;
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 6),
        new THREE.MeshBasicMaterial({ color: COLORS.gold }),
      );
      let activity: THREE.Object3D;

      if (id === "sunken-flats-waterworks") {
        const deck = box(8.2, 0.38, 3.6, 0x63584b);
        deck.position.set(0, 0.19, 0);
        const channel = box(7.1, 1.15, 0.58, 0x3f535e);
        channel.position.set(0, 0.76, -0.78);
        const catwalk = box(7.7, 0.18, 0.72, 0x875e3c);
        catwalk.position.set(0, 2.25, 0.48);
        const axle = new THREE.Group();
        for (const offset of [-2.35, 0, 2.35]) {
          const pillar = box(0.64, 2.7, 0.72, 0x6d7379);
          pillar.position.set(offset, 1.35, -0.78);
          const rotor = new THREE.Mesh(
            new THREE.TorusGeometry(0.46, 0.09, 6, 12),
            material(0xb6a88e, 0.48, 0.56),
          );
          rotor.rotation.y = Math.PI / 2;
          rotor.position.set(offset, 1.48, 0.58);
          axle.add(pillar, rotor);
        }
        const intake = cylinder(0.18, 0.22, 6.3, 8, 0x536c72);
        intake.rotation.z = Math.PI / 2;
        intake.position.set(0, 0.66, 1.1);
        beacon.position.set(0, 2.78, 0.48);
        root.add(deck, channel, catwalk, axle, intake, beacon);
        activity = axle;
      } else if (id === "long-furrow-drain-pump") {
        const pad = box(5.6, 0.38, 3.1, 0x514e47);
        pad.position.set(0, 0.19, 0);
        const housing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.82, 0.94, 3.7, 10),
          material(0x9a4931, 0.62, 0.26),
        );
        housing.rotation.z = Math.PI / 2;
        housing.position.set(0, 1.15, 0);
        const intake = cylinder(0.22, 0.22, 3.2, 8, 0x6c777c);
        intake.rotation.z = Math.PI / 2;
        intake.position.set(2.3, 0.68, 0);
        const rotor = new THREE.Mesh(
          new THREE.TorusGeometry(0.68, 0.1, 6, 12),
          material(0xd9aa52, 0.42, 0.5),
        );
        rotor.rotation.y = Math.PI / 2;
        rotor.position.set(-1.95, 1.15, 0);
        beacon.position.set(0, 2.32, 0);
        root.add(pad, housing, intake, rotor, beacon);
        activity = rotor;
      } else {
        const pad = box(6.2, 0.42, 4.2, 0x4e4f4a);
        pad.position.set(0, 0.21, 0);
        const tower = box(0.74, 4.5, 0.74, 0x63717b);
        tower.position.set(-1.75, 2.25, 0);
        const boom = box(4.7, 0.42, 0.55, 0x8f6b42);
        boom.position.set(0.4, 4.15, 0);
        const drum = new THREE.Mesh(
          new THREE.CylinderGeometry(0.72, 0.72, 1.3, 10),
          material(0x9a4931, 0.58, 0.28),
        );
        drum.rotation.z = Math.PI / 2;
        drum.position.set(0.95, 3.55, 0);
        const hose = cylinder(0.2, 0.2, 3.1, 8, 0x536c72);
        hose.rotation.z = Math.PI / 2;
        hose.position.set(1.15, 0.75, 0.65);
        beacon.position.set(-1.75, 4.9, 0);
        root.add(pad, tower, boom, drum, hose, beacon);
        activity = drum;
      }

      this.groundAt(root, definition.x, definition.z);
      this.infrastructureProps.set(id, { root, activity, beacon });
      this.scene.add(root);
    }
  }

  private buildSites(): void {
    for (const site of WORLD_SITES) {
      const group = new THREE.Group();
      group.name = `site:${site.id}`;

      for (const part of WORLD_STRUCTURE_PARTS) {
        if (part.siteId !== site.id) continue;
        const object = this.createStructurePart(part);
        if (part.discoverySignal) {
          // Unlit material so the lamp reads as a light source rather than a
          // painted cylinder, and so dimming it needs no lighting pass.
          object.material = new THREE.MeshBasicMaterial({ color: part.color });
          group.userData.signalLamp = object;
          group.userData.signalLitColor = part.color;

          // Signal beam: a tall, semi-transparent column of light above the
          // lamp. Visible from across the valley so the player always has a
          // directional landmark, even before discovery.
          const beam = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.6, 44, 8),
            new THREE.MeshBasicMaterial({
              color: part.color,
              transparent: true,
              opacity: 0.18,
              depthWrite: false,
            }),
          );
          beam.position.y = 22;
          beam.name = `signal-beam:${site.id}`;
          group.add(beam);
        }
        group.add(object);
      }

      const residentAnchors = settlementResidentAnchors(site.id);
      if (residentAnchors.length > 0) {
        const residents = new THREE.Group();
        residents.name = `settlement-residents:${site.id}`;
        residentAnchors.forEach((anchor, index) => {
          const resident = new THREE.Group();
          resident.name = `settlement-resident:${site.id}:${index}`;
          resident.position.set(anchor.x, 0, anchor.z);
          resident.rotation.y = anchor.heading;
          const body = box(
            0.52,
            1.15,
            0.34,
            index === 0 ? COLORS.rust : COLORS.bone,
          );
          body.position.y = 0.86;
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 8, 6),
            material(0xc99872, 0.82, 0.08),
          );
          head.position.y = 1.67;
          const hat = new THREE.Mesh(
            new THREE.ConeGeometry(0.36, 0.28, 6),
            material(index === 0 ? COLORS.gold : 0x46535a, 0.62, 0.3),
          );
          hat.position.y = 1.98;
          resident.add(body, head, hat);
          residents.add(resident);
        });
        group.add(residents);
      }

      const consequences = new THREE.Group();
      consequences.name = `settlement-consequences:${site.id}`;
      settlementResponseDefinitionsForSite(site.id).forEach((definition) => {
        const consequence = this.createSettlementConsequence(definition);
        if (consequence) consequences.add(consequence);
      });
      if (consequences.children.length > 0) group.add(consequences);

      const adaptations = new THREE.Group();
      adaptations.name = `settlement-adaptations:${site.id}`;
      settlementAdaptationDefinitionsForSite(site.id).forEach((definition) => {
        const consequence = this.createSettlementConsequence(definition);
        if (consequence) adaptations.add(consequence);
      });
      if (adaptations.children.length > 0) group.add(adaptations);

      this.groundAt(group, site.x, site.z);
      this.scene.add(group);
    }

    // Relay route furniture, grounded on real terrain.
    const pickupRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.14, 8, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.gold }),
    );
    pickupRing.rotation.x = Math.PI / 2;
    pickupRing.name = "relay-pickup-ring";
    pickupRing.position.set(
      CARGO_PICKUP.x,
      this.world.terrain.height(CARGO_PICKUP.x, CARGO_PICKUP.z) + 0.2,
      CARGO_PICKUP.z,
    );

    const deliveryRing = new THREE.Mesh(
      new THREE.TorusGeometry(CARGO_DELIVERY.radius * 0.75, 0.2, 8, 42),
      new THREE.MeshBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.82,
      }),
    );
    deliveryRing.name = "relay-delivery-ring";
    deliveryRing.rotation.x = Math.PI / 2;
    deliveryRing.position.set(
      CARGO_DELIVERY.x,
      this.world.terrain.height(CARGO_DELIVERY.x, CARGO_DELIVERY.z) + 0.24,
      CARGO_DELIVERY.z,
    );

    // Deck dimensions come from BUGGY_RAMP so this mesh and the ground adapter's
    // driveable-surface height (physics.ts) can never drift out of sync.
    const rampBase = this.world.terrain.height(BUGGY_RAMP.x, BUGGY_RAMP.z);
    const ramp = box(
      BUGGY_RAMP.deckWidth,
      BUGGY_RAMP.deckThickness,
      BUGGY_RAMP.deckDepth,
      0xd59a43,
    );
    ramp.name = "relay-ramp";
    ramp.position.set(
      BUGGY_RAMP.x,
      rampBase + BUGGY_RAMP.deckOffset,
      BUGGY_RAMP.z,
    );
    ramp.rotation.x = BUGGY_RAMP.tiltRadians;
    const rampStripe = box(5, 0.09, 1.2, COLORS.bone);
    rampStripe.position.set(
      BUGGY_RAMP.x,
      rampBase + BUGGY_RAMP.deckOffset + 0.6,
      BUGGY_RAMP.z - 0.4,
    );
    rampStripe.rotation.x = BUGGY_RAMP.tiltRadians;

    this.scene.add(pickupRing, deliveryRing, ramp, rampStripe);
  }

  private buildCommunityTraffic(): void {
    const group = new THREE.Group();
    group.name = "community-traffic";

    for (const effect of SETTLEMENT_MATERIAL_EFFECTS) {
      if (!effect.traffic) continue;
      const vehicle = new THREE.Group();
      vehicle.name = `community-traffic:${effect.id}`;
      vehicle.userData.trafficId = `community-traffic:${effect.id}`;
      vehicle.userData.trafficKind = effect.traffic.kind;
      vehicle.visible = false;

      if (effect.traffic.kind === "skiff") {
        const hull = box(2.65, 0.32, 1.05, COLORS.rust);
        hull.position.y = 0.26;
        const cargo = box(0.72, 0.38, 0.62, COLORS.bone);
        cargo.position.set(-0.3, 0.58, 0);
        const bow = new THREE.Mesh(
          new THREE.ConeGeometry(0.54, 0.9, 4),
          material(COLORS.rust, 0.7, 0.25),
        );
        bow.rotation.z = -Math.PI / 2;
        bow.position.set(1.52, 0.27, 0);
        vehicle.add(hull, cargo, bow);
      } else {
        const bed = box(2.4, 0.34, 1.08, 0x70513c);
        bed.position.y = 0.62;
        const load = box(1.05, 0.48, 0.74, COLORS.gold);
        load.position.set(-0.22, 1.02, 0);
        vehicle.add(bed, load);
        for (const x of [-0.78, 0.78]) {
          for (const z of [-0.64, 0.64]) {
            const wheel = new THREE.Mesh(
              new THREE.CylinderGeometry(0.34, 0.34, 0.18, 8),
              material(0x252321, 0.9, 0.08),
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, 0.36, z);
            vehicle.add(wheel);
          }
        }
      }

      group.add(vehicle);
    }

    this.scene.add(group);
  }

  private buildSettlementCargoBays(): void {
    const group = new THREE.Group();
    group.name = "settlement-cargo-bays";
    for (const manifest of SETTLEMENT_CARGO_MANIFESTS) {
      const origin = findSite(manifest.originSiteId);
      if (!origin) continue;
      const bay = new THREE.Group();
      bay.name = `settlement-cargo-bay:${manifest.id}`;
      bay.userData.manifestId = manifest.id;
      const x = origin.x + manifest.loadOffsetX;
      const z = origin.z + manifest.loadOffsetZ;
      const pallet = box(2.5, 0.18, 1.7, 0x6e5137);
      pallet.position.y = 0.1;
      const bundle = box(
        1.48,
        0.82,
        1.05,
        manifest.id === "sunken-causeway-kit" ? COLORS.cyan : COLORS.rust,
      );
      bundle.position.y = 0.58;
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 1.35, 6),
        material(COLORS.gold, 0.7, 0.22),
      );
      marker.position.set(0.92, 0.77, -0.52);
      bay.add(pallet, bundle, marker);
      this.groundAt(bay, x, z);
      group.add(bay);
    }
    this.scene.add(group);
  }

  private createSettlementConsequence(
    definition: Pick<SettlementResponseDefinition, "id" | "materialEffectId">,
  ): THREE.Group | null {
    const visual = settlementMaterialEffect(
      definition.materialEffectId,
    )?.consequence;
    if (!visual) return null;
    const root = new THREE.Group();
    root.name = `settlement-consequence:${definition.id}`;
    root.userData.consequenceId = definition.id;
    root.position.set(visual.offsetX, 0, visual.offsetZ);
    root.rotation.y = visual.heading ?? 0;
    root.visible = false;

    if (visual.kind === "raised-stores" || visual.kind === "ferry-cache") {
      const pallet = box(2.2, 0.2, 1.7, 0x5c4330);
      pallet.position.y = 0.1;
      const crateA = box(0.92, 0.82, 0.86, 0x8c5236);
      crateA.position.set(-0.42, 0.61, 0);
      const crateB = box(0.82, 0.68, 0.78, 0x9e6840);
      crateB.position.set(0.48, 0.54, 0.12);
      root.add(pallet, crateA, crateB);
    } else if (visual.kind === "yard-load") {
      const chassis = box(2.5, 0.36, 1.15, COLORS.rust);
      chassis.position.y = 0.36;
      const block = box(1.25, 0.92, 0.82, 0x57544b);
      block.position.set(-0.22, 0.92, 0);
      const wheel = cylinder(0.37, 0.37, 0.22, 10, COLORS.tire);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0.88, 0.38, 0.62);
      const secondWheel = wheel.clone();
      secondWheel.position.z = -0.62;
      root.add(chassis, block, wheel, secondWheel);
    } else if (visual.kind === "route-markers") {
      for (const [index, offset] of [
        [0, 0],
        [0.9, 0.45],
        [-0.82, 0.7],
      ] as const) {
        const post = cylinder(0.06, 0.08, 1.36, 6, 0x5b432c);
        post.position.set(offset, 0.68, index === 0 ? 0 : 0.15);
        const flag = box(0.62, 0.35, 0.04, COLORS.gold);
        flag.position.set(offset + 0.29, 1.12, index === 0 ? 0 : 0.15);
        root.add(post, flag);
      }
    } else if (visual.kind === "ford-line") {
      for (const offset of [-1.25, 1.25]) {
        const post = cylinder(0.09, 0.12, 1.35, 8, 0x66513b);
        post.position.set(offset, 0.68, 0);
        root.add(post);
      }
      const line = box(2.55, 0.05, 0.05, COLORS.gold);
      line.position.y = 1.04;
      root.add(line);
    } else if (visual.kind === "signal-array") {
      const mast = cylinder(0.09, 0.13, 2.9, 8, 0x59636a);
      mast.position.y = 1.45;
      const receiver = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.07, 6, 12),
        material(COLORS.cyan, 0.4, 0.35),
      );
      receiver.rotation.x = Math.PI / 2;
      receiver.position.y = 2.32;
      const base = box(0.9, 0.35, 0.9, 0x4f4d48);
      base.position.y = 0.18;
      root.add(base, mast, receiver);
    }
    return root;
  }

  /**
   * Terrain owns the actual raised route and all collision. These sparse deck
   * boards and rails only make a restored community causeway readable from the
   * driver's seat; their vertical placement is re-sampled from that terrain.
   */
  private buildCommunityPassageDecks(): void {
    for (const passage of RESOLVED_COMMUNITY_PASSAGES) {
      const group = new THREE.Group();
      group.name = `community-passage:${passage.id}`;
      group.visible = false;

      const length = Math.hypot(
        passage.bx - passage.ax,
        passage.bz - passage.az,
      );
      const segments = Math.max(1, Math.ceil(length / 4));
      const directionX = length > 0 ? (passage.bx - passage.ax) / length : 0;
      const directionZ = length > 0 ? (passage.bz - passage.az) / length : 1;
      const heading = Math.atan2(directionX, directionZ);
      const segmentLength = length / segments;
      const deckWidth = Math.max(2, passage.halfWidth * 2 - 0.34);

      for (let index = 0; index < segments; index += 1) {
        const along = (index + 0.5) * segmentLength;
        const x = passage.ax + directionX * along;
        const z = passage.az + directionZ * along;
        const deck = box(
          deckWidth,
          0.18,
          Math.max(0.35, segmentLength - 0.12),
          0x6e5137,
        );
        deck.name = `community-passage-deck:${passage.id}:${index}`;
        deck.position.set(x, this.world.terrain.height(x, z) + 0.12, z);
        deck.rotation.y = heading;
        deck.userData.terrainOffsetY = 0.12;
        group.add(deck);

        for (const side of [-1, 1] as const) {
          const rail = box(
            0.12,
            0.72,
            Math.max(0.35, segmentLength - 0.12),
            0x43372d,
          );
          rail.name = `community-passage-rail:${passage.id}:${index}:${side}`;
          const lateralX = -directionZ * side * (deckWidth * 0.5 - 0.12);
          const lateralZ = directionX * side * (deckWidth * 0.5 - 0.12);
          rail.position.set(
            x + lateralX,
            this.world.terrain.height(x + lateralX, z + lateralZ) + 0.48,
            z + lateralZ,
          );
          rail.rotation.y = heading;
          rail.userData.terrainOffsetY = 0.48;
          group.add(rail);
        }
      }

      this.communityPassageDecks.set(passage.id, group);
      this.scene.add(group);
    }
  }

  /**
   * Grove Run markers are permanent social geography, not race colliders. The
   * fixed-step activity system resolves a gate from the rig's authoritative
   * position; these posts merely make the local road culture legible in space.
   */
  private buildRoadRivalryMarkers(): void {
    const course = roadRivalryCourseSiteIds();
    const colors = [0x4ad7ff, 0xf5ca57, 0xee6d5d] as const;

    for (const [index, siteId] of course.entries()) {
      const site = WORLD_SITES.find((candidate) => candidate.id === siteId);
      if (!site) continue;

      const previous =
        WORLD_SITES.find(
          (candidate) => candidate.id === course[Math.max(0, index - 1)],
        ) ?? site;
      const next =
        WORLD_SITES.find(
          (candidate) =>
            candidate.id === course[Math.min(course.length - 1, index + 1)],
        ) ?? site;
      const group = new THREE.Group();
      group.name = `Grove Run ${index + 1}: ${site.name}`;
      group.position.set(
        site.x,
        this.world.terrain.height(site.x, site.z),
        site.z,
      );
      group.rotation.y = Math.atan2(next.x - previous.x, next.z - previous.z);

      const color = colors[index] ?? colors[colors.length - 1];
      const postMaterial = new THREE.MeshStandardMaterial({
        color: 0x382d25,
        roughness: 0.84,
      });
      const flagMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.2,
        roughness: 0.52,
      });
      const postGeometry = new THREE.BoxGeometry(0.18, 3.4, 0.18);
      const flagGeometry = new THREE.BoxGeometry(1.7, 0.72, 0.05);

      for (const side of [-1, 1] as const) {
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(side * 4.8, 1.7, 0);
        post.castShadow = true;
        post.receiveShadow = true;
        group.add(post);

        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(side * 4.0, 2.85, 0);
        flag.castShadow = true;
        group.add(flag);
      }

      this.roadRivalryMarkers.set(siteId, group);
      this.scene.add(group);
    }
  }

  private syncCommunityPassageDecks(state: GameState): void {
    const activePassages = new Set(deriveSettlementCommunityPassageIds(state));
    for (const [id, group] of this.communityPassageDecks) {
      group.visible = activePassages.has(
        id as typeof activePassages extends Set<infer T> ? T : never,
      );
      if (!group.visible) continue;
      group.children.forEach((part) => {
        const offsetY = part.userData.terrainOffsetY as number | undefined;
        if (offsetY === undefined) return;
        part.position.y =
          this.world.terrain.height(part.position.x, part.position.z) + offsetY;
      });
    }
  }

  private createHabitatSilhouette(species: HabitatSpecies): THREE.Group {
    const creature = new THREE.Group();
    const isGrazer = species === "small-grazer";
    const material =
      species === "corvid"
        ? this.habitatCorvidMaterial
        : isGrazer
          ? this.habitatGrazerMaterial
          : this.habitatBirdMaterial;
    const body = new THREE.Mesh(this.habitatBodyGeometry, material);

    if (isGrazer) {
      body.scale.set(1.5, 0.78, 0.94);
      body.position.y = 0.38;
      creature.add(body);
      const head = new THREE.Mesh(this.habitatBodyGeometry, material);
      head.scale.set(0.55, 0.55, 0.55);
      head.position.set(0, 0.54, 0.26);
      creature.add(head);
      for (const x of [-0.12, 0.12]) {
        for (const z of [-0.1, 0.1]) {
          const leg = new THREE.Mesh(this.habitatLegGeometry, material);
          leg.position.set(x, 0.14, z);
          creature.add(leg);
        }
      }
      return creature;
    }

    body.scale.set(0.9, 0.7, 1.35);
    body.position.y = 0.46;
    creature.add(body);
    for (const side of [-1, 1] as const) {
      const wing = new THREE.Mesh(this.habitatWingGeometry, material);
      wing.rotation.z = side * Math.PI * 0.48;
      wing.position.set(side * 0.19, 0.5, 0);
      creature.add(wing);
    }
    const leg = new THREE.Mesh(this.habitatLegGeometry, material);
    leg.position.set(-0.05, 0.14, 0);
    creature.add(leg);
    const secondLeg = leg.clone();
    secondLeg.position.x = 0.05;
    creature.add(secondLeg);
    return creature;
  }

  /**
   * Rebuild nearby persistent ecology groups. The active rig selects
   * visibility only; groups retain their world-owned population and location.
   */
  private syncHabitatLife(state: GameState): void {
    const rig = state.rigs[state.activeRigId];
    const fieldRevision = this.world.fieldConditionRevisionNumber();
    const ecologyRevision = this.world.ecologyRevisionNumber();
    const worldHour = Math.floor(state.worldTimeMinutes / 60);
    const moved =
      Math.hypot(rig.x - this.habitatAnchorX, rig.z - this.habitatAnchorZ) >=
      18;
    if (
      this.habitatLife.parent &&
      !moved &&
      fieldRevision === this.lastHabitatFieldRevision &&
      ecologyRevision === this.lastHabitatEcologyRevision &&
      worldHour === this.lastHabitatWorldHour
    ) {
      return;
    }

    if (!this.habitatLife.parent) {
      this.habitatLife.name = "ambient-habitat-life";
      this.scene.add(this.habitatLife);
    }
    this.habitatLife.clear();
    this.habitatAnchorX = rig.x;
    this.habitatAnchorZ = rig.z;
    this.lastHabitatFieldRevision = fieldRevision;
    this.lastHabitatEcologyRevision = ecologyRevision;
    this.lastHabitatWorldHour = worldHour;

    const ecologyActors = this.world.ecologyActorsNear(rig.x, rig.z, 72);
    let visualIndex = 0;
    for (const actor of ecologyActors) {
      if (visualIndex >= 18) break;
      const species = habitatSpeciesForEcologyKind(actor.kind);
      const count = Math.min(
        actor.population,
        species === "small-grazer" ? 4 : 6,
        18 - visualIndex,
      );
      for (let index = 0; index < count; index += 1) {
        const placement = stableHabitatFraction(`${actor.id}:${index}`);
        const radius =
          2.5 + stableHabitatFraction(`radius:${actor.id}:${index}`) * 7;
        const angle = placement * Math.PI * 2;
        const x = actor.x + Math.cos(angle) * radius;
        const z = actor.z + Math.sin(angle) * radius;
        const ground = this.world.terrain.sample(x, z);
        const creature = this.createHabitatSilhouette(species);
        creature.position.set(
          x,
          ground.height + Math.min(ground.waterDepth, 0.12),
          z,
        );
        creature.scale.setScalar(
          species === "small-grazer"
            ? 3.2
            : species === "wading-bird"
              ? 2.2
              : 1.8,
        );
        creature.rotation.y = angle + Math.PI * 0.5;
        creature.userData.baseHeading = creature.rotation.y;
        creature.userData.baseX = creature.position.x;
        creature.userData.baseY = creature.position.y;
        creature.userData.baseZ = creature.position.z;
        creature.userData.roamRadius =
          species === "small-grazer"
            ? 1.5 + placement * 1.4
            : 0.45 + placement * 0.75;
        creature.userData.motionRate = 0.7 + (visualIndex % 4) * 0.19;
        creature.userData.phase = placement * Math.PI * 2;
        creature.userData.ecologyActorId = actor.id;
        this.habitatLife.add(creature);
        visualIndex += 1;
      }
    }
  }

  private animateHabitatLife(elapsedMs: number): void {
    for (const creature of this.habitatLife.children) {
      const rate = Number(creature.userData.motionRate ?? 1);
      const phase = Number(creature.userData.phase ?? 0);
      const heading = Number(creature.userData.baseHeading ?? 0);
      const baseX = Number(creature.userData.baseX ?? creature.position.x);
      const baseY = Number(creature.userData.baseY ?? creature.position.y);
      const baseZ = Number(creature.userData.baseZ ?? creature.position.z);
      const roamRadius = Number(creature.userData.roamRadius ?? 0);
      const roamPhase = elapsedMs * 0.00016 * rate + phase;
      creature.position.x = baseX + Math.cos(roamPhase) * roamRadius;
      creature.rotation.y =
        heading + Math.sin(elapsedMs * 0.001 * rate + phase) * 0.12;
      creature.position.y =
        baseY + Math.sin(elapsedMs * 0.0017 * rate + phase) * 0.035;
      creature.position.z = baseZ + Math.sin(roamPhase * 0.87) * roamRadius;
    }
  }

  private animateSignalBeams(elapsedMs: number): void {
    for (const site of WORLD_SITES) {
      const group = this.scene.getObjectByName(`site:${site.id}`);
      if (!group) continue;
      const beam = group.getObjectByName(`signal-beam:${site.id}`);
      if (!beam) continue;
      const lamp = group.userData.signalLamp as THREE.Mesh | undefined;
      if (!lamp) continue;
      const mat = lamp.material;
      if (!(mat instanceof THREE.MeshBasicMaterial)) continue;
      const isLit =
        mat.color.getHex() !== SIGNAL_LAMP_DARK && mat.color.getHex() !== 0;
      beam.visible = isLit;
      if (isLit && beam instanceof THREE.Mesh) {
        const beamMat = beam.material;
        if (beamMat instanceof THREE.MeshBasicMaterial) {
          beamMat.opacity = 0.12 + Math.sin(elapsedMs * 0.0012) * 0.06;
        }
      }
    }
  }

  private buildRuntimeBridgeAssets(): void {
    this.runtimeBridgeSpecs.forEach((spec) => {
      const bridge = new THREE.Group();
      bridge.name = `bridge:${spec.assetId}`;
      bridge.rotation.y = spec.yaw;
      this.groundAt(bridge, spec.x, spec.z);

      const fallback = box(
        spec.fallbackWidth,
        spec.fallbackHeight,
        spec.fallbackDepth,
        spec.fallbackColor,
      );
      fallback.position.y = spec.fallbackHeight / 2;
      bridge.add(fallback);
      this.scene.add(bridge);
      this.runtimeBridgeEvidence.set(spec.assetId, {
        assetId: spec.assetId,
        runtimePath: spec.runtimeUrl,
        status: "loading",
        fallbackActive: true,
        loadedNodeCount: 0,
        animationClipCount: 0,
        errorMessage: null,
      });

      void this.gltfLoader
        .loadAsync(spec.runtimeUrl)
        .then((gltf) => {
          const root = gltf.scene ?? gltf.scenes[0];
          if (!root) return;

          root.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = false;
              child.receiveShadow = false;
            }
          });

          const bounds = new THREE.Box3().setFromObject(root);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z, 0.0001);
          const scale = spec.targetMaxDimension / maxDimension;
          root.scale.setScalar(scale);
          root.position.set(
            -center.x * scale,
            -bounds.min.y * scale,
            -center.z * scale,
          );

          // The fallback box is about to be replaced by the real asset.
          // `clear()` only detaches it from the scene graph — its geometry
          // and material are still GPU-resident until disposed explicitly.
          disposeObjectGraph(fallback);
          bridge.clear();
          bridge.add(root);
          this.loadedRuntimeBridgeRoots.set(spec.assetId, root);

          // An imported asset may ship authored clips. Before this, nothing
          // advanced them and the prop stood frozen; binding them to the
          // animation system's mixer makes the imported animation real.
          const boundClips = vehicleAnimationSystem.registerClips(
            spec.assetId,
            root,
            gltf.animations ?? [],
          );
          if (boundClips > 0) {
            vehicleAnimationSystem.playAllClips(spec.assetId);
          }

          this.runtimeBridgeEvidence.set(spec.assetId, {
            assetId: spec.assetId,
            runtimePath: spec.runtimeUrl,
            status: "loaded",
            fallbackActive: false,
            loadedNodeCount: root.children.length,
            animationClipCount: boundClips,
            errorMessage: null,
          });
        })
        .catch((error: unknown) => {
          this.runtimeBridgeEvidence.set(spec.assetId, {
            assetId: spec.assetId,
            runtimePath: spec.runtimeUrl,
            status: "error",
            fallbackActive: true,
            loadedNodeCount: 0,
            animationClipCount: 0,
            errorMessage:
              error instanceof Error
                ? error.message
                : String(error ?? "unknown"),
          });
          console.warn(
            `Runtime bridge asset could not load (${spec.assetId}); keeping fallback geometry.`,
            error,
          );
        });
    });
  }

  /**
   * The sky, as geometry rather than a clear colour.
   *
   * `scene.background` as a `THREE.Color` is written by a buffer clear, which does
   * **not** pass through tone mapping or the sRGB output encode. Fogged geometry
   * does. The result was a hard dark band around the whole horizon in broad
   * daylight: distant terrain resolved to a correctly-encoded light fog colour while
   * the sky behind it stayed dark and linear.
   *
   * An inside-out sphere with a tone-mapped basic material travels the same path as
   * everything else, so the horizon and the sky are guaranteed to agree by
   * construction instead of by matching two numbers through two different pipelines.
   * `fog: false` keeps the dome itself from being fogged toward its own colour, and
   * `depthWrite: false` keeps it from occluding anything.
   */
  private buildSky(): void {
    this.sky = new THREE.Mesh(
      new THREE.SphereGeometry(860, 18, 12),
      new THREE.MeshBasicMaterial({
        color: 0xbfd5c5,
        side: THREE.BackSide,
        fog: false,
        depthWrite: false,
      }),
    );
    this.sky.name = "sky";
    this.sky.frustumCulled = false;
    this.scene.add(this.sky);
  }

  private buildStars(): void {
    const positions: number[] = [];
    for (let index = 0; index < 260; index += 1) {
      const angle = index * 2.399963;
      const radius = 300 + ((index * 37) % 200);
      positions.push(
        Math.sin(angle) * radius,
        90 + ((index * 53) % 160),
        Math.cos(angle) * radius,
      );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const stars = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xdbeeff,
        size: 1.4,
        transparent: true,
        opacity: 0.85,
      }),
    );
    stars.name = "night-stars";
    this.scene.add(stars);
  }

  /**
   * Build a volume of falling rain streaks around the rig.
   *
   * Each particle holds a fixed world-space direction (downward streaks) with a
   * small authored horizontal lean so rain reads as falling rather than as a
   * static haze. The whole cloud is re-centred on the active rig every frame by
   * `render()`, so the precipitation follows the camera's frame of reference
   * without the player needing to out-drive it.
   *
   * The cloud is invisible until `setWeather` raises `weatherTargetRain`, and
   * `currentRain` is eased so handoff from clear to rain never pops.
   */
  private buildRain(): void {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const lean = 0.55;
    for (let index = 0; index < count; index += 1) {
      // Deterministic spread across a ~60 m x 40 m box centred on the origin;
      // the per-instance position is re-based onto the active rig each frame.
      const px = ((index * 37) % 61) - 30;
      const py = ((index * 53) % 41) - 20;
      const pz = ((index * 71) % 61) - 30;
      positions[index * 3] = px;
      positions[index * 3 + 1] = py;
      // A downward-leaning streak instead of a vertical drop: rain blown by the
      // wind reads as weather with direction, matching `windVector` on the state.
      positions[index * 3 + 2] = pz + lean;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    const rain = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x8fb2c8,
        size: 0.09,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    rain.name = "rain";
    rain.frustumCulled = false;
    this.rainPositions = positions;
    this.rainPoints = rain;
    this.scene.add(rain);
  }

  private stormClouds!: THREE.Group;
  private stormCloudMeshes: THREE.Mesh[] = [];

  private buildStormClouds(): void {
    this.stormClouds = new THREE.Group();
    this.stormClouds.name = "storm-clouds";

    // A cluster of dark, flat cloud volumes positioned on the horizon near
    // Long Furrow. They are always present but start nearly invisible; as the
    // weather clock approaches storm, they darken and thicken so the player
    // sees the threat building from across the valley.
    const LONG_FURROW_X = 18;
    const LONG_FURROW_Z = -46;
    const cloudCount = 7;
    for (let i = 0; i < cloudCount; i++) {
      const angle = (i / cloudCount) * Math.PI * 2;
      const spread = 28 + (i % 3) * 14;
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(18 + (i % 3) * 8, 8, 5),
        new THREE.MeshBasicMaterial({
          color: 0x2a2a2e,
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      cloud.position.set(
        LONG_FURROW_X + Math.cos(angle) * spread,
        52 + (i % 2) * 12,
        LONG_FURROW_Z + Math.sin(angle) * spread,
      );
      cloud.scale.set(1, 0.25, 1);
      cloud.userData.baseOpacity = 0.08 + (i % 3) * 0.04;
      cloud.userData.phase = i * 0.7;
      this.stormCloudMeshes.push(cloud);
      this.stormClouds.add(cloud);
    }
    this.scene.add(this.stormClouds);
  }

  private updateStormClouds(
    weatherPhase: string,
    rainIntensity: number,
    elapsedMs: number,
  ): void {
    // Storm clouds darken as the weather progresses: clear = nearly invisible,
    // overcast = faint shadow, rain = dark, storm = heavy.
    const targetOpacity =
      weatherPhase === "storm"
        ? 0.72
        : weatherPhase === "rain"
          ? 0.45
          : weatherPhase === "overcast"
            ? 0.18
            : 0.06;

    // Rain intensity provides a smooth blend within each phase.
    const intensityBlend = rainIntensity * 0.15;

    for (const cloud of this.stormCloudMeshes) {
      const mat = cloud.material as THREE.MeshBasicMaterial;
      const base = Number(cloud.userData.baseOpacity ?? 0.1);
      const phase = Number(cloud.userData.phase ?? 0);
      const drift = Math.sin(elapsedMs * 0.00008 + phase) * 0.03;
      mat.opacity = Math.min(
        1,
        (targetOpacity + intensityBlend) * base * 8 + drift,
      );
      // Slow lateral drift so the mass feels alive.
      cloud.position.x += Math.sin(elapsedMs * 0.00003 + phase) * 0.004;
    }
  }

  // ---------------------------------------------------------------------------
  // Rigs
  // ---------------------------------------------------------------------------

  /**
   * Build a cockpit steering control mounted on a raked column.
   *
   * The returned group is the column. Inside it, the spinning part is named
   * `steeringWheel` so `vehicleAnimationSystem` can resolve and turn it without
   * the renderer having to expose another typed part. The rim lies in the XY
   * plane, so the spin is a single rotation about local Z and the column's rake
   * stays on the parent — that keeps the animation channel one axis regardless
   * of how the rig is posed.
   *
   * This exists because the hood camera is a shipped feature that previously
   * looked at nothing. A control that visibly answers the player's steering
   * input is the rig telling the player what it is doing, which is the
   * "rig is the interface" layer rather than another HUD readout.
   */
  private steeringControl(
    radius: number,
    rimColor: number,
    rake: number,
  ): THREE.Group {
    const column = new THREE.Group();
    column.rotation.x = rake;

    const spin = new THREE.Group();
    spin.name = "steeringWheel";

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(radius, radius * 0.14, 6, 16),
      material(rimColor, 0.7, 0.1),
    );
    spin.add(rim);

    const hub = cylinder(
      radius * 0.22,
      radius * 0.22,
      radius * 0.18,
      8,
      COLORS.gold,
    );
    hub.rotation.x = Math.PI / 2;
    spin.add(hub);

    // Three spokes read as a steering wheel from the hood view without the
    // cost of a full rim mesh.
    for (let index = 0; index < 3; index += 1) {
      const angle = (index / 3) * Math.PI * 2;
      const spoke = box(radius * 0.12, radius * 0.92, radius * 0.1, rimColor);
      spoke.position.set(
        (Math.sin(angle) * radius) / 2,
        (Math.cos(angle) * radius) / 2,
        0,
      );
      spoke.rotation.z = -angle;
      spin.add(spoke);
    }

    const stalk = cylinder(
      radius * 0.1,
      radius * 0.1,
      radius * 1.1,
      6,
      0x2d2d29,
    );
    stalk.rotation.x = Math.PI / 2;
    stalk.position.z = -radius * 0.6;
    column.add(spin, stalk);

    return column;
  }

  private shadowGradientTexture: THREE.Texture | null = null;

  /**
   * Soft radial-falloff alpha map, generated once and reused by every blob
   * shadow. A uniform-opacity circle (the previous approach) reads as a hard,
   * unlit disc pasted onto the ground; a soft centre-to-edge falloff is what
   * actually sells contact-shadow "blob shadows" as shadows rather than decals
   * — this is the same trick stylised low-poly games (Mario-style blob
   * shadows) have used for decades specifically because a real shadow map was
   * too expensive.
   */
  private getShadowGradientTexture(): THREE.Texture {
    if (this.shadowGradientTexture) return this.shadowGradientTexture;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.shadowGradientTexture = texture;
    return texture;
  }

  private blobShadow(radius: number, opacity: number): THREE.Mesh {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 24),
      new THREE.MeshBasicMaterial({
        color: 0x111811,
        transparent: true,
        opacity,
        depthWrite: false,
        alphaMap: this.getShadowGradientTexture(),
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    // The one cue a player reads for "is this touching the ground". Named so
    // ground-contact evidence can find it on any rig without a parts field.
    shadow.name = "blob-shadow";
    // A transparent ground decal with `depthWrite: false` — not solid rig
    // geometry. It is a plane spanning the whole footprint at ground level, so
    // any surface reasoning about "which part is this touching" has to skip it or
    // every underbody answer is "the shadow".
    shadow.userData.cameraSolid = false;
    return shadow;
  }

  /**
   * Add a visible, module-owned tread band to a wheel spin pivot.
   *
   * The stock tyre stays authoritative for wheel size and contact. These outer
   * bands only expose the fitted lug-tyre state through silhouette and material,
   * so presentation never invents a second handling model.
   *
   * Every proud dimension comes from {@link LUG_TREAD_FORM} because a tread that
   * stands outboard of the tyre widens the wheel's clearance envelope, and the
   * pontoon that has to clear that envelope is derived in `rig-blockout.ts`. When
   * these were local literals — two of them absolute metres — the tractor's
   * pontoons sat 6.8 cm inside its own tread bands at full lock, on a rig the
   * garage sells both modules to.
   */
  private addLugTireVisual(
    spinPivot: THREE.Group,
    radius: number,
    width: number,
  ): THREE.Group {
    const tread = new THREE.Group();
    tread.name = "module:lug-tires";
    tread.userData.moduleAnchor = "wheel";
    const treadMaterial = material(0x4f5147, 0.96, 0.02);
    for (const side of [-1, 1] as const) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(
          radius * LUG_TREAD_FORM.bandRingScale,
          radius * LUG_TREAD_FORM.bandTubeScale,
          5,
          14,
        ),
        treadMaterial,
      );
      band.rotation.y = Math.PI / 2;
      band.position.x =
        side * (width * 0.5 + radius * LUG_TREAD_FORM.bandStandoffScale);
      tread.add(band);
    }
    const lugGeometry = new THREE.BoxGeometry(
      width + radius * LUG_TREAD_FORM.lugOverhangScale * 2,
      radius * LUG_TREAD_FORM.lugThicknessScale,
      radius * LUG_TREAD_FORM.lugDepthScale,
    );
    const lugReach =
      radius *
      (LUG_TREAD_FORM.lugReachScale - LUG_TREAD_FORM.lugThicknessScale / 2);
    for (let index = 0; index < LUG_TREAD_FORM.lugCount; index += 1) {
      const angle = (index / LUG_TREAD_FORM.lugCount) * Math.PI * 2;
      const lug = new THREE.Mesh(lugGeometry, treadMaterial);
      lug.position.set(0, Math.sin(angle) * lugReach, Math.cos(angle) * lugReach);
      // Point the block's *thickness* axis radially outward, so the dimension
      // named `lugThicknessScale` is the one that decides how proud of the tyre
      // the tread stands and `lugReachScale` is the outer surface it reaches.
      //
      // This was `rotation.x = angle`, which pointed the block's `lugDepthScale`
      // axis outward instead. The tread then reached `1.03 + 0.30/2 = 1.18` tyre
      // radii while `treadEnvelope` in `rig-blockout.ts` derived every clearance
      // around it from `lugReachScale: 1.1` — so the envelope understated the
      // rendered tread by 8% of a tyre radius, 6.8 cm on the tractor's rear
      // wheel, which is what kept putting the flotation pontoons inside it. Both
      // sides agreed with each other; only the browser disagreed with both.
      //
      // A rotation of `π/2 - angle` maps local +Y onto the outward radial
      // direction `(0, sin angle, cos angle)`, leaving `lugDepthScale` as the
      // block's length along the direction of travel, which is what a lug bar is.
      lug.rotation.x = Math.PI / 2 - angle;
      tread.add(lug);
    }
    tread.visible = false;
    spinPivot.add(tread);
    return tread;
  }

  /**
   * Build the form of one bolt-on module inside the box its mount derives.
   *
   * Every dimension below is a ratio of `mount.width` / `.height` / `.depth`, so
   * nothing here can push the module outside the envelope `rig-blockout.test.ts`
   * proved clear of the ground, the tyres, the other modules, and the hood
   * camera. That is the whole contract: the mount owns *where and how big*, this
   * method owns *what it looks like*, and the two cannot disagree because only
   * one of them has numbers.
   *
   * The alternative — `winch.position.set(0, 1.2, 2.3)` — is exactly the drift
   * that left every rig in this game floating above the terrain by its ride
   * height. A literal here would be the same mistake at a smaller scale.
   */
  private buildModuleForm(mount: RigModuleMount): THREE.Group {
    const group = new THREE.Group();
    group.name = `module:${mount.moduleId}`;
    const { width, height, depth } = mount;

    switch (mount.moduleId) {
      case "winch": {
        // A drum lying across the nose, between two end plates, with a fairlead
        // and a hook — the parts that read as "this can pull something".
        //
        // `rotation.z = π/2` lays the cylinder axis along x, which puts its radial
        // extent into *both* y and z, so the radius is bounded by the narrower of
        // the two — not by `height` alone. Taking the plates from `height * 0.46`
        // put them 2.8 cm outside a box whose depth is smaller than its height.
        const crossRadius = Math.min(height, depth) * 0.5;
        const drum = cylinder(
          crossRadius * 0.84,
          crossRadius * 0.84,
          width * 0.58,
          14,
          0x6f7a72,
        );
        drum.rotation.z = Math.PI / 2;
        group.add(drum);
        for (const side of [-1, 1] as const) {
          const plate = cylinder(
            crossRadius * 0.96,
            crossRadius * 0.96,
            width * 0.06,
            14,
            0x3d443f,
          );
          plate.rotation.z = Math.PI / 2;
          plate.position.x = side * width * 0.32;
          group.add(plate);
        }
        const fairlead = box(
          width * 0.82,
          height * 0.2,
          depth * 0.34,
          0x2f342f,
        );
        fairlead.position.set(0, height * 0.34, depth * 0.3);
        const hook = box(width * 0.12, height * 0.3, depth * 0.3, 0xc9a94f);
        hook.position.set(0, -height * 0.26, depth * 0.28);
        group.add(fairlead, hook);
        break;
      }
      case "survey-mast": {
        // Slim tower, three rungs, sensor head, dish. The rungs matter: a bare
        // pole at this width reads as an aerial, not as instrumentation worth 7.
        //
        // The mount box is deliberately much wider than the pole (see
        // `RIG_MODULE_FORMS`): the head and dish are the widest parts of this form,
        // and a box sized to the pole cannot contain them. x is the free axis on the
        // hull top, so the box takes its room there and the ratios below shrink to
        // match — the rendered silhouette is the one authored when the box was
        // pole-sized, but now every part of it is inside.
        const pole = cylinder(
          width * 0.052,
          width * 0.068,
          height * 0.9,
          8,
          0x8d9490,
        );
        pole.position.y = -height * 0.05;
        group.add(pole);
        for (let rung = 0; rung < 3; rung += 1) {
          const bar = box(width * 0.204, height * 0.014, depth * 0.78, 0x6d746f);
          bar.position.y = height * (rung * 0.24 - 0.24);
          group.add(bar);
        }
        // Square in plan, from whichever horizontal dimension is tighter, so the
        // head reads as an instrument pod on any hull. At `depth * 1.5` it reached
        // 4.1 cm into the tractor's cab across a mount box that clears the cab by
        // 2.2 cm — the module was never the thing out of place, its geometry was.
        const headSpan = Math.min(width * 0.393, depth * 0.96);
        const head = box(headSpan, height * 0.07, headSpan, 0x2f3a40);
        head.position.y = height * 0.44;
        // The dish leans back, so its radius spends most of itself in y and only a
        // quarter in z. Bounded by the box's half-width and by the room left above
        // the dish's own centre: 0.49w binds on the tractor's tall box, 0.13h on the
        // buggy's short one. `fitFormToEnvelope` is the guarantee for a hull whose
        // proportions make some third axis bind instead.
        const dishRadius = Math.min(width * 0.49, height * 0.13);
        const dish = cylinder(
          dishRadius,
          width * 0.0786,
          height * 0.05,
          12,
          0xd9d2bd,
        );
        dish.rotation.x = Math.PI * 0.42;
        dish.position.y = height * 0.36;
        group.add(head, dish);
        break;
      }
      case "flotation-pontoons": {
        // A sealed float: barrel along Z, capped both ends, on two brackets that
        // reach back toward the hull so it reads as bolted on rather than welded.
        //
        // The barrel's radius is half the *narrower* of the box's two cross-section
        // dimensions, so it is inscribed in the envelope on both rigs. Taking it
        // from `height` alone made the float 1.9 cm wider than its box on the
        // tractor, whose pontoon box is taller than it is wide.
        const barrelRadius = Math.min(width, height) * 0.5;
        const float = cylinder(
          barrelRadius,
          barrelRadius,
          depth * 0.82,
          12,
          0xd8cdb0,
        );
        float.rotation.x = Math.PI / 2;
        group.add(float);
        // Brackets reach toward the hull, so the sign of the mount's x says which
        // way is inboard. This is the only place a mirrored pair's two halves
        // differ; everything else about them is symmetric by derivation.
        const inboard = mount.x < 0 ? 1 : -1;
        for (const end of [-1, 1] as const) {
          const cap = cylinder(0.001, barrelRadius, depth * 0.09, 12, 0xb8ac8c);
          cap.rotation.x = end * (Math.PI / 2);
          cap.position.z = end * depth * 0.455;
          group.add(cap);
        }
        const bracketWidth = width * 0.7;
        for (const along of [-1, 1] as const) {
          const bracket = box(
            bracketWidth,
            height * 0.16,
            depth * 0.06,
            0x4a4f49,
          );
          // Flush with the inboard face of the envelope, not `width * 0.42` from
          // its centre: at that offset a bracket `width * 0.7` wide reached
          // `width * 0.77` from centre — `width * 0.27` outside its own box, and
          // the box is only `width * 0.19` clear of the rear tread band. That is
          // the 3.4 cm the browser measured of pontoon inside tyre at every place
          // and every steering angle, on a rig the garage sells both modules to.
          bracket.position.set(
            inboard * (width - bracketWidth) * 0.5,
            height * 0.32,
            along * depth * 0.3,
          );
          group.add(bracket);
        }
        break;
      }
      case "skid-plate": {
        // Plate on top of its own envelope, ribs hanging under it — both inside
        // the box, so the lowest point of the module is still the box's floor.
        const plate = box(width, height * 0.5, depth, 0x77706a);
        plate.position.y = height * 0.25;
        group.add(plate);
        for (let rib = 0; rib < 3; rib += 1) {
          const runner = box(
            width * 0.13,
            height * 0.5,
            depth * 0.94,
            0x565b55,
          );
          runner.position.set((rib - 1) * width * 0.36, -height * 0.25, 0);
          group.add(runner);
        }
        break;
      }
      case "low-range-gearing": {
        // A transfer case: housing, output barrel, drain plug. No capability and
        // no silhouette claim, so the read is close-up detail — "something was
        // fitted here" — rather than a distant outline.
        //
        // The housing is held a hair shy of the envelope's depth so the output
        // barrel can protrude from it and still be inside the box. Sizing both to
        // the full depth and the barrel to `depth * 1.02` is how it protruded
        // before, and it put 7 mm of barrel through each end of its own mount.
        const housing = box(width, height * 0.72, depth * 0.94, 0x4d5250);
        housing.position.y = height * 0.14;
        const barrel = cylinder(
          height * 0.26,
          height * 0.26,
          depth,
          10,
          0x6a7370,
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.y = -height * 0.22;
        const plug = cylinder(
          width * 0.07,
          width * 0.07,
          height * 0.08,
          8,
          0xc0a35a,
        );
        // Flush with the envelope floor, not `0.48` — the plug is `height * 0.08`
        // long, so its own half-length has to come out of the offset.
        plug.position.y = -height * 0.46;
        group.add(housing, barrel, plug);
        break;
      }
      case "lug-tires":
        // Unreachable: `lug-tires` is wheel-mounted, so `rig-blockout.ts` derives
        // no hull mount for it and `addLugTireVisual` owns its form. Named rather
        // than defaulted so that adding a seventh module is a type error here.
        break;
    }

    group.visible = false;
    return group;
  }

  /**
   * Shrink a module's form until it fits the box its mount derived, and record by
   * how much.
   *
   * The guarantee, not the intent. `buildModuleForm` is supposed to author every
   * form inside its envelope, and each form below does — but "inside" depends on
   * the box's aspect ratio, and the tractor's and the buggy's hulls have different
   * ones, so a single set of ratios cannot be checked by reading it. Two forms were
   * outside their boxes when this was measured for the first time, and one of them
   * had put the pontoon brackets 3.4 cm inside the rear tread at every place and
   * every steering angle.
   *
   * Uniform, about the box centre, so proportions survive. Silent shrinkage would
   * be its own defect — a module rendering smaller than authored with nothing to
   * show it — so the factor is recorded and module-visual acceptance fails when a
   * form needed more than a rounding error of it. The clamp is what makes every
   * clearance `rig-blockout.test.ts` proves true of the rendered rig; the recorded
   * factor is what stops the clamp from hiding an authoring mistake.
   */
  private fitFormToEnvelope(group: THREE.Group, mount: RigModuleMount): number {
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return 1;
    const half = [mount.width / 2, mount.height / 2, mount.depth / 2] as const;
    const reach = [
      Math.max(Math.abs(box.min.x), Math.abs(box.max.x)),
      Math.max(Math.abs(box.min.y), Math.abs(box.max.y)),
      Math.max(Math.abs(box.min.z), Math.abs(box.max.z)),
    ] as const;
    let fit = 1;
    for (let axis = 0; axis < 3; axis += 1) {
      if (reach[axis]! > half[axis]!) {
        fit = Math.min(fit, half[axis]! / reach[axis]!);
      }
    }
    if (fit < 1) group.scale.setScalar(fit);
    return fit;
  }

  /**
   * Build every module visual this rig can carry, from its derived mounts.
   *
   * Driven entirely by `blockout.moduleMounts`, so a rig no module fits gets an
   * empty record with no branch for it, and a module added to `MODULES` with a
   * form appears on every rig that lists it in `fits` without touching the three
   * rig builders.
   */
  private buildModuleVisuals(
    body: THREE.Group,
    blockout: RigBlockout,
  ): Partial<Record<ModuleId, THREE.Object3D[]>> {
    const visuals: Partial<Record<ModuleId, THREE.Object3D[]>> = {};
    for (const mount of blockout.moduleMounts) {
      const group = this.buildModuleForm(mount);
      const fit = this.fitFormToEnvelope(group, mount);
      group.position.set(mount.x, mount.y, mount.z);
      // Recorded where it is known rather than inferred later. A hull bolt-on
      // must not interpenetrate the rig; a wheel tread must. Module-visual
      // evidence reads this to tell the two apart without restating which
      // modules are wheel-mounted, which is knowledge `rig-blockout.ts` owns.
      group.userData.moduleAnchor = "hull";
      // The box the form promised to stay inside, carried on the group so the
      // promise can be *measured* instead of trusted. `buildModuleForm`'s
      // docblock claims that expressing every dimension as a ratio of the mount
      // keeps the form inside the envelope; that claim is not true on its own — a
      // radius of `height * 0.5` escapes a box narrower than it is tall, and a
      // part positioned at `width * 0.42` with a half-extent of `width * 0.35`
      // escapes by `width * 0.27`. Both of those were live, and the second put
      // the tractor's pontoon brackets 3.4 cm inside its own rear tread.
      group.userData.moduleEnvelope = {
        width: mount.width,
        height: mount.height,
        depth: mount.depth,
      };
      // How much `fitFormToEnvelope` had to shrink the form to keep that promise.
      // 1 means the form was authored to fit. Anything less means the clamp saved a
      // clearance the blockout had already proved, and acceptance says so out loud
      // rather than letting the module render quietly undersized.
      group.userData.moduleEnvelopeFit = fit;
      body.add(group);
      (visuals[mount.moduleId] ??= []).push(group);
    }
    return visuals;
  }

  private buildStateShell(
    boundsX: number,
    boundsY: number,
    boundsZ: number,
    baseColorHex: number,
  ): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
    const geometry = new THREE.BoxGeometry(
      boundsX * 1.08,
      boundsY * 1.08,
      boundsZ * 1.08,
      10,
      10,
      10,
    );
    const stateShellMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntegrity: { value: 1.0 },
        uHitPoint: { value: new THREE.Vector3() },
        uHitTime: { value: -99.0 },
        uBaseColor: { value: new THREE.Color(baseColorHex) },
        uDamageColor: { value: new THREE.Color(0xd94e34) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;
        void main() {
          vNormal = normal;
          vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntegrity;
        uniform vec3 uHitPoint;
        uniform float uHitTime;
        uniform vec3 uBaseColor;
        uniform vec3 uDamageColor;

        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        varying vec3 vWorldPosition;

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          float fresnel = pow(1.0 - max(0.0, dot(viewDir, vWorldNormal)), 2.6);
          
          float distToHit = length(vWorldPosition - uHitPoint);
          float timeSinceHit = uTime - uHitTime;
          float ripple = 0.0;
          if (timeSinceHit >= 0.0 && timeSinceHit < 0.65) {
            float waveRadius = timeSinceHit * 14.0;
            float waveWidth = 0.9;
            float distDelta = abs(distToHit - waveRadius);
            if (distDelta < waveWidth) {
              ripple = sin((1.0 - distDelta / waveWidth) * 3.14159) * (1.0 - timeSinceHit / 0.65);
            }
          }

          vec3 stateColor = mix(uDamageColor, uBaseColor, uIntegrity);
          float pulse = (1.0 - uIntegrity) * 0.22 * sin(uTime * 8.0);
          float alpha = clamp(fresnel * mix(0.65, 0.12, uIntegrity) + ripple * 0.75 + pulse, 0.0, 0.85);
          
          gl_FragColor = vec4(stateColor + vec3(ripple * 0.5), alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const mesh = new THREE.Mesh(geometry, stateShellMaterial);
    mesh.name = "vfx:state-shell";
    // The shell is a transparent VFX envelope, not solid rig geometry. Hood
    // cameras legitimately sit inside it, so it must not trip the near-plane
    // self-intersection contract used for opaque vehicle parts.
    mesh.userData.cameraSolid = false;
    return { mesh, material: stateShellMaterial };
  }

  /**
   * The utility tractor, built front-forward.

   *
   * Layout along local Z, front (+) to rear (−): grille and headlights at +2.6,
   * hood at +1.2, small steering wheels at +1.65, cab at −1.05, large drive wheels
   * at −1.25, plough at −3.2. The previous build had the grille, hood, headlights
   * *and* plough all at −Z, which is why it appeared to drive backwards.
   */
  /**
   * The plough attachment, built from the studio's own authored procedural
   * factory (`assets/workbench/field-plough-01/authored/createFieldPloughModel.ts`)
   * instead of the flat solid-colour box placeholder this used to be.
   *
   * That factory is deliberately *not* yet marked `publicRuntimeApproved` in
   * `assets/asset-manifest.json` — its img2threejs silhouette-accuracy gate
   * (Tier 1 IoU 0.470 against the reference photo) has not cleared threshold
   * for hero/production art. This use respects that: the manifest's own notes
   * describe the factory as a legitimate "repo-local developer derivative for
   * validating named part boundaries... and customizable rig-part
   * integration" — exactly this use, an internal placeholder upgrade, not a
   * claim that this is finished, approved hero art. `root.userData` on the
   * returned group still carries `visualAuthority`/`collisionAuthority`
   * markers the factory authored for this exact boundary.
   *
   * The factory has its own internal scale/origin convention (built to match
   * its reference photo, not this rig's pivot space), so the fit here is
   * computed from its actual bounding box rather than hand-guessed offsets:
   * scaled to the old placeholder's blade width and grounded so its lowest
   * point sits where the old teeth tips sat.
   */
  private buildPloughAttachment(): THREE.Object3D {
    const model = createFieldPlough01Model({
      castShadow: true,
      receiveShadow: true,
    });
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());

    const targetWidth = 4.6; // old blade width, the widest prior element
    const targetBottomY = -0.82; // old tooth-tip depth in pivot-local space
    const targetCenterZ = -0.85; // midpoint of the old beam-to-tooth-tip span

    const scale = size.x > 0 ? targetWidth / size.x : 1;
    model.scale.setScalar(scale);

    // Re-measure after scaling rather than assume the pre-scale bounds times
    // the scale factor, since RoundedBoxGeometry bevels make that an
    // approximation, not an identity.
    const scaledBounds = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
    model.position.set(
      -scaledCenter.x,
      targetBottomY - scaledBounds.min.y,
      targetCenterZ - scaledCenter.z,
    );
    return model;
  }

  /**
   * Look up one authored bodywork volume by label, in GROUND-frame metres.
   *
   * The blockout owns where a cab is; this is how the renderer asks. Before, both
   * owned it — the cab's size and position were literals in `createTractor` *and*
   * entries in `RIG_SUPERSTRUCTURES`, which is a duplicated constant with the two
   * copies in different files, the most durable form of drift there is. The
   * blockout's copy is the one that has to be right, because module placement is
   * derived from it, so the renderer reads from that and the literals are gone.
   *
   * Throws on an unknown label rather than returning a default. A silently-missing
   * cab would draw a rig with a hole in it while every placement check still passed
   * against the volume the model believes is there, which is worse than a crash on
   * first load: the blockout would be reserving space for bodywork nobody can see.
   */
  private bodywork(blockout: RigBlockout, label: string): RigSuperstructureVolume {
    const volume = blockout.superstructure.find((entry) => entry.label === label);
    if (!volume) {
      const known = blockout.superstructure.map((entry) => entry.label).join(", ");
      throw new Error(
        `${blockout.id} has no authored bodywork volume "${label}"; ` +
          `RIG_SUPERSTRUCTURES declares [${known}]`,
      );
    }
    return volume;
  }

  /**
   * A bodywork box, sized and placed from the blockout's authored volume.
   *
   * The common case: most bodywork *is* a box, so the volume the placement search
   * reasons about and the mesh a player sees are the same six numbers. Volumes
   * whose real geometry is curved (the buggy's roll bar, the skimmer's prow) take
   * the volume as their bounding box and invert its dimensions back into the
   * curve's parameters at the call site — see `createBuggy`.
   */
  private bodyworkBox(
    blockout: RigBlockout,
    label: string,
    color: number,
    roughness?: number,
    metalness?: number,
  ): THREE.Mesh {
    const volume = this.bodywork(blockout, label);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(volume.width, volume.height, volume.depth),
      material(color, roughness, metalness),
    );
    mesh.position.set(volume.x, volume.y, volume.z);
    return mesh;
  }

  /**
   * Build a rig's wheels from its blockout, in the simulation's wheel order.
   *
   * Both ground rigs previously ran their own copy of this loop with their own
   * hand-written coordinates, which is how the tractor came to sample terrain at
   * a footprint it never drew. Deriving from the blockout means the visible
   * wheel and the simulated contact are the same point by construction.
   *
   * Mounts are added to `body`, the ground-frame group, so `restY` keeps its
   * natural reading: a tyre of radius r centred at y = r touches y = 0.
   */
  private buildWheels(
    body: THREE.Group,
    blockout: RigBlockout,
    hubColor: number,
    hubRadiusScale: number,
  ): {
    wheels: THREE.Group[];
    steeringPivots: THREE.Group[];
    wheelRestY: number[];
    wheelSpinScale: number[];
    lugTireVisuals: THREE.Object3D[];
  } {
    const wheels: THREE.Group[] = [];
    const steeringPivots: THREE.Group[] = [];
    const wheelRestY: number[] = [];
    const wheelSpinScale: number[] = [];
    const lugTireVisuals: THREE.Object3D[] = [];

    for (const mount of blockout.wheelMounts) {
      const steeringPivot = new THREE.Group();
      steeringPivot.name = `wheel-mount-${mount.label}`;
      steeringPivot.position.set(mount.x, mount.restY, mount.z);
      const spinPivot = new THREE.Group();
      const wheel = cylinder(
        mount.radius,
        mount.radius,
        mount.width,
        14,
        COLORS.tire,
      );
      // Named so ground-contact evidence can measure the tyre's rendered extent
      // without counting module tread blocks that may not even be visible.
      wheel.name = "tyre";
      wheel.rotation.z = Math.PI / 2;
      const hubRadius = mount.radius * hubRadiusScale;
      const hub = cylinder(
        hubRadius,
        hubRadius,
        mount.width * 1.06,
        10,
        hubColor,
      );
      hub.rotation.z = Math.PI / 2;
      wheel.add(hub);
      spinPivot.add(wheel);
      lugTireVisuals.push(
        this.addLugTireVisual(spinPivot, mount.radius, mount.width),
      );
      steeringPivot.add(spinPivot);
      wheels.push(spinPivot);
      steeringPivots.push(steeringPivot);
      wheelRestY.push(mount.restY);
      wheelSpinScale.push(mount.spinScale);
      body.add(steeringPivot);
    }

    return {
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      lugTireVisuals,
    };
  }

  private createTractor(): RigParts {
    const blockout = blockoutFor("utility-tractor");
    const root = new THREE.Group();
    root.name = "persistent-rig";
    root.rotation.order = "YXZ";
    // Everything below is authored in the ground frame; this carries the single
    // conversion into the body frame the runtime mounts. See rig-blockout.ts.
    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("utility-tractor");

    const shadow = this.blobShadow(2.6, 0.3);
    shadow.position.set(0, blockout.shadowY, -0.2);
    shadow.scale.set(1, 1.65, 1);

    const chassis = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      0x4c3328,
    );
    chassis.position.y = blockout.hull.centreY;
    // The surface hull-anchored modules bolt to. A bolt-on is *meant* to seat a
    // centimetre or two into it — modelling a gap instead would read as a part
    // floating off the machine — so module-visual evidence has to tell "seated
    // against its mounting face" apart from "buried in the cab", which is a
    // defect. Marked at the three places that build a chassis rather than
    // inferred from a name or a position, so a rig rebuilt in a different shape
    // keeps the distinction.
    chassis.name = "chassis";
    chassis.userData.moduleMountSurface = true;
    // Bodywork from the blockout, not from literals here: the placement search
    // reserves space against these volumes, so the volume it reserves and the mesh
    // a player sees have to be the same numbers. Trim hangs off the volume it is
    // attached to for the same reason — a grille pinned at z 2.55 while the hood it
    // sits on moves is the drift this file exists to stop.
    const hood = this.bodyworkBox(blockout, "hood", COLORS.rust);
    const grille = box(1.9, 1, 0.2, 0x292824);
    grille.position.set(0, hood.position.y - 0.05, hood.position.z + 1.35);
    const cab = this.bodyworkBox(blockout, "cab", COLORS.bone);
    const cabVolume = this.bodywork(blockout, "cab");
    const windscreen = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 1.2, 0.1),
      material(0x274d58, 0.3, 0.15),
    );
    // Proud of the cab's forward face by half its own thickness, so the glass reads
    // as set into a frame rather than sunk behind one, and raised toward the
    // roofline where a windscreen sits.
    windscreen.position.set(
      0,
      cabVolume.y + 0.25,
      cabVolume.z + cabVolume.depth / 2 + 0.05,
    );
    const roof = this.bodyworkBox(blockout, "roof", 0x8e3328);
    const roofVolume = this.bodywork(blockout, "roof");
    const beacon = cylinder(0.2, 0.28, 0.4, 10, 0xe7a63b);
    // Standing on the roof, so it rises with the roof rather than through it.
    beacon.position.set(0.7, roofVolume.y + roofVolume.height / 2 + 0.24, roofVolume.z + 0.05);
    const exhaust = cylinder(0.13, 0.17, 2.4, 8, 0x2d2d29);
    exhaust.position.set(-0.68, 2.9, 1.4);

    const {
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      lugTireVisuals,
    } = this.buildWheels(body, blockout, COLORS.gold, 0.44);

    const ploughPivot = new THREE.Group();
    ploughPivot.position.set(0, 1, -2.5);
    ploughPivot.add(this.buildPloughAttachment());

    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffe7a8 });
    for (const x of [-0.68, 0.68]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12),
        headlightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1.85, 2.66);
      body.add(lens);
    }
    // A spotlight aimed forward, so night driving actually lights the road ahead.
    const headlights = new THREE.SpotLight(0xffd58a, 0, 46, 0.62, 0.45, 1.2);
    headlights.position.set(0, 2.1, 2.6);
    headlights.target.position.set(0, 0, 22);
    body.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(3.2, 2.8, 5.2, 0xe89d43);
    stateShell.position.set(0, 1.8, -0.2);

    // Inside the cab (centre z -1.05, depth 2.1), raked toward the seat, so it
    // is physically where a driver would hold it and reads through the
    // windscreen from the exterior cameras. The hood camera socket sits ahead
    // of the windscreen at z 0.55, so this control is deliberately behind that
    // view rather than pasted in front of it; an interior camera is what would
    // make it a true cockpit instrument.
    const steeringColumn = this.steeringControl(0.42, 0x30302c, -0.62);
    steeringColumn.position.set(0, 2.72, -0.55);

    body.add(
      shadow,
      chassis,
      hood,
      grille,
      cab,
      windscreen,
      roof,
      beacon,
      exhaust,
      steeringColumn,
      ploughPivot,
      headlights,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": lugTireVisuals,
      },
      ploughPivot,
      headlights,
      frontMarker: grille,
      rearMarker: ploughPivot,
      stateShell,
      stateShellMaterial,
    };
  }

  /** The toy buggy, built front-forward: nose and lights at +Z, tow hook at −Z. */
  private createBuggy(): RigParts {
    const blockout = blockoutFor("toy-buggy");
    const root = new THREE.Group();
    root.name = "toy-buggy";
    root.rotation.order = "YXZ";
    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("toy-buggy");

    const shadow = this.blobShadow(2.1, 0.26);
    shadow.position.y = blockout.shadowY;
    shadow.scale.set(1, 1.45, 1);

    const chassis = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      0x283d45,
    );
    chassis.position.y = blockout.hull.centreY;
    // The mounting face for hull-anchored modules; see `createTractor`.
    chassis.name = "chassis";
    chassis.userData.moduleMountSurface = true;
    const nose = this.bodyworkBox(blockout, "nose", 0xe1ad52);
    const cockpit = this.bodyworkBox(blockout, "cockpit", 0x315f6b, 0.28, 0.12);
    // The roll bar keeps its curve; only its *size* comes from the blockout. A
    // half-torus of major radius R and tube t bounds to `2(R+t) × (R+t) × 2t`, so
    // the authored box inverts cleanly: `R + t = width / 2` and `t = depth / 2`.
    // That is the whole point of boxing it in `RIG_SUPERSTRUCTURES` — the placement
    // search needs the space it denies, the player needs the arc, and neither has to
    // restate the other's numbers.
    const rollBarVolume = this.bodywork(blockout, "roll bar");
    const rollBarTube = rollBarVolume.depth / 2;
    const rollBarRadius = rollBarVolume.width / 2 - rollBarTube;
    const rollBar = new THREE.Mesh(
      new THREE.TorusGeometry(rollBarRadius, rollBarTube, 6, 16, Math.PI),
      material(COLORS.bone),
    );
    // Spun so the arc opens downward, which puts its centre on the volume's floor
    // rather than at the volume's centre.
    rollBar.position.set(
      rollBarVolume.x,
      rollBarVolume.y - rollBarVolume.height / 2,
      rollBarVolume.z,
    );
    rollBar.rotation.z = Math.PI;

    const {
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      lugTireVisuals,
    } = this.buildWheels(body, blockout, COLORS.cyan, 0.41);

    const towHook = cylinder(0.12, 0.16, 0.6, 8, COLORS.gold);
    towHook.rotation.x = Math.PI / 2;
    towHook.position.set(0, 0.5, -2);

    const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0xdffcff });
    for (const x of [-0.62, 0.62]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 0.12, 10),
        headlightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1, 1.9);
      body.add(lens);
    }
    const headlights = new THREE.SpotLight(0xc8f8ff, 0, 38, 0.55, 0.4, 1.3);
    headlights.position.set(0, 1.1, 1.9);
    headlights.target.position.set(0, 0, 20);
    body.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(2.4, 1.8, 4.2, 0xd9aa52);
    stateShell.position.set(0, 1.0, 0);

    // In the open cockpit (centre z -0.55), smaller and more steeply raked than
    // the tractor's, matching the buggy's go-kart posture. The buggy has no
    // windscreen, so this one is directly visible from chase and side views.
    const steeringColumn = this.steeringControl(0.3, 0x1f3b44, -0.78);
    steeringColumn.position.set(0, 1.42, -0.3);

    body.add(
      shadow,
      chassis,
      nose,
      cockpit,
      rollBar,
      towHook,
      headlights,
      cameraSocket,
      stateShell,
      steeringColumn,
    );
    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels,
      steeringPivots,
      wheelRestY,
      wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": lugTireVisuals,
      },
      ploughPivot: null,
      headlights,
      frontMarker: nose,
      rearMarker: towHook,
      stateShell,
      stateShellMaterial,
    };
  }

  /**
   * Drift, a compact marsh skimmer.
   *
   * Its silhouette exposes the mobility contract: sealed pontoons, a flexible
   * lift skirt, and twin rear fans instead of decorative wheels. Presentation
   * must not imply ground contacts the simulation does not own.
   *
   * Authored in the GROUND frame like the other rigs, so every height below
   * reads as metres above the marsh. It previously sat in a frame of its own —
   * y = 0 at the body origin, with the ground assumed 0.72 m below rather than
   * the profile's 1.35 — which left its blob shadow hovering 0.63 m in the air
   * and its lift skirt stopping 0.27 m short of the cushion it rides on.
   */
  private createSkimmer(): RigParts {
    const blockout = blockoutFor("marsh-skimmer");
    const root = new THREE.Group();
    root.name = "marsh-skimmer";
    root.rotation.order = "YXZ";
    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket("marsh-skimmer");

    const shadow = this.blobShadow(2.6, 0.22);
    shadow.position.y = blockout.shadowY;
    shadow.scale.set(1.2, 1.75, 1);

    // A lift skirt has to flare past the deck to trap its cushion, and taper
    // inward as it rises. Both are art, so both are ratios of derived extents:
    // retuning the profile widens the skirt with the hull instead of stranding
    // it at a hand-written radius.
    const skirtGeometry = blockout.hoverSkirt!;
    const skirtBottomRadius = (blockout.hull.width / 2) * 1.29;
    const skirt = new THREE.Mesh(
      new THREE.CylinderGeometry(
        skirtBottomRadius * 0.88,
        skirtBottomRadius,
        skirtGeometry.height,
        12,
      ),
      material(0x242a2b, 0.95, 0),
    );
    skirt.name = "hover-skirt";
    skirt.scale.z = blockout.hull.depth / blockout.hull.width;
    skirt.position.y = skirtGeometry.centreY;

    const deck = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      0x315861,
    );
    deck.position.y = blockout.hull.centreY;
    // The skimmer is sold no modules today, so nothing bolts to this deck. Marked
    // anyway: the moment a module lists `marsh-skimmer` in `fits`, its mount
    // surface has to already be declared or the geometry check reads a legitimate
    // seating as a foul.
    deck.name = "chassis";
    deck.userData.moduleMountSurface = true;
    // Like the buggy's roll bar, the prow keeps its cone and takes its size from the
    // blockout's bounding box. A 4-sided cone spun 45° presents corner-to-corner, so
    // its bounding width is the full diagonal — `radius = width / 2` — and its own
    // length lies along z once it is laid down, giving `height = depth`.
    const prowVolume = this.bodywork(blockout, "prow");
    const prow = new THREE.Mesh(
      new THREE.ConeGeometry(prowVolume.width / 2, prowVolume.depth, 4),
      material(COLORS.cyan, 0.58, 0.16),
    );
    prow.rotation.x = Math.PI / 2;
    prow.rotation.z = Math.PI / 4;
    prow.position.set(prowVolume.x, prowVolume.y, prowVolume.z);
    const cabin = this.bodyworkBox(blockout, "cabin", COLORS.bone);
    const cabinVolume = this.bodywork(blockout, "cabin");
    const windscreen = box(2.1, 0.58, 0.12, 0x234d5a);
    // On the cabin's forward face, in its upper half where a screen belongs.
    windscreen.position.set(
      0,
      cabinVolume.y + 0.23,
      cabinVolume.z + cabinVolume.depth / 2 + 0.03,
    );
    const roof = this.bodyworkBox(blockout, "roof", COLORS.rust);

    const pontoonMaterial = material(0x476f75, 0.66, 0.14);
    for (const x of [-1.72, 1.72]) {
      const pontoon = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.42, 3.7, 5, 10),
        pontoonMaterial,
      );
      pontoon.rotation.x = Math.PI / 2;
      pontoon.position.set(x, 1.22, 0.05);
      body.add(pontoon);
    }

    const fanMaterial = material(0x26383c, 0.62, 0.25);
    for (const x of [-0.92, 0.92]) {
      const fan = new THREE.Group();
      fan.position.set(x, 2.35, -2.35);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.66, 0.1, 8, 18),
        fanMaterial,
      );
      const hub = cylinder(0.15, 0.15, 0.24, 8, COLORS.gold);
      hub.rotation.x = Math.PI / 2;
      const bladeA = box(0.15, 1.05, 0.08, 0xc7a35b);
      const bladeB = bladeA.clone();
      bladeB.rotation.z = Math.PI / 2;
      fan.add(ring, hub, bladeA, bladeB);
      body.add(fan);
    }

    const towHook = cylinder(0.12, 0.16, 0.62, 8, COLORS.gold);
    towHook.rotation.x = Math.PI / 2;
    towHook.position.set(0, 1.17, -3);

    const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xbdfaff });
    for (const x of [-0.72, 0.72]) {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.12, 10),
        lightMaterial,
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 1.75, 3.45);
      body.add(lens);
    }
    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(0, 1.85, 3.3);
    headlights.target.position.set(0, 0.82, 23);
    body.add(headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(4.2, 2.2, 6.2, 0x6bc9c4);
    stateShell.position.set(0, 1.87, 0.2);

    body.add(
      shadow,
      skirt,
      deck,
      prow,
      cabin,
      windscreen,
      roof,
      towHook,
      headlights,
      cameraSocket,
      stateShell,
    );
    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels: [],
      steeringPivots: [],
      wheelRestY: [],
      wheelSpinScale: [],
      // Empty in practice, because no module in `MODULES` fits the skimmer — but
      // derived rather than hard-coded `{}`, so writing one for it is a data
      // change in `contracts.ts` and not a renderer change here.
      moduleVisuals: this.buildModuleVisuals(body, blockout),
      ploughPivot: null,
      headlights,
      frontMarker: prow,
      rearMarker: towHook,
      stateShell,
      stateShellMaterial,
    };
  }

  private createCandidateRig(rigId: RigId): RigParts {
    const blockout = blockoutFor(rigId);
    const root = new THREE.Group();
    root.name = rigId;
    root.rotation.order = "YXZ";

    const body = new THREE.Group();
    body.name = "rig-body-ground-frame";
    body.position.y = blockout.groundFrameOffsetY;
    root.add(body);
    const cameraSocket = hoodCameraSocket(rigId);

    const shadow = this.blobShadow(blockout.hull.width * 0.9, 0.25);
    shadow.position.y = blockout.shadowY;

    const hullMesh = box(
      blockout.hull.width,
      blockout.hull.height,
      blockout.hull.depth,
      COLORS.rust,
    );
    hullMesh.name = "chassis-hull";
    hullMesh.position.y = blockout.hull.centreY;

    const isHover = blockout.profile.mobilityAdapter === "hover";
    const wheelData = isHover
      ? {
          wheels: [] as THREE.Group[],
          steeringPivots: [] as THREE.Group[],
          wheelRestY: [] as number[],
          wheelSpinScale: [] as number[],
          lugTireVisuals: [] as THREE.Object3D[],
        }
      : this.buildWheels(body, blockout, COLORS.gold, 0.45);

    body.add(shadow, hullMesh);

    for (const form of blockout.superstructure) {
      const b = this.bodyworkBox(blockout, form.label, COLORS.bone);
      body.add(b);
    }

    root.add(cameraSocket);

    const headlights = new THREE.SpotLight(0xbdfaff, 0, 42, 0.62, 0.45, 1.2);
    headlights.position.set(0, blockout.hull.topY, blockout.hull.depth / 2);
    headlights.target.position.set(0, blockout.hull.centreY, blockout.hull.depth / 2 + 20);
    body.add(headlights, headlights.target);

    const { mesh: stateShell, material: stateShellMaterial } =
      this.buildStateShell(
        blockout.hull.width * 1.1,
        blockout.hull.height * 1.1,
        blockout.hull.depth * 1.1,
        0x6bc9c4,
      );
    stateShell.position.set(0, blockout.hull.centreY, 0);
    body.add(stateShell);

    return {
      root,
      body,
      hoodCameraSocket: cameraSocket,
      wheels: wheelData.wheels,
      steeringPivots: wheelData.steeringPivots,
      wheelRestY: wheelData.wheelRestY,
      wheelSpinScale: wheelData.wheelSpinScale,
      moduleVisuals: {
        ...this.buildModuleVisuals(body, blockout),
        "lug-tires": wheelData.lugTireVisuals,
      },
      ploughPivot: null,
      headlights,
      frontMarker: hullMesh,
      rearMarker: hullMesh,
      stateShell,
      stateShellMaterial,
    };
  }

  private createCargo(): THREE.Group {
    const root = new THREE.Group();
    root.name = "relay-cargo";
    const pallet = box(2.2, 0.25, 2, 0x604834);
    pallet.position.y = -0.45;
    const crate = box(1.75, 1.4, 1.55, 0x8c5236);
    crate.position.y = 0.3;
    const bandA = box(1.88, 0.13, 1.68, COLORS.gold);
    const bandB = bandA.clone();
    bandA.position.y = 0.07;
    bandB.position.y = 0.53;
    const beacon = cylinder(0.18, 0.22, 0.35, 8, COLORS.cyan);
    beacon.position.y = 1.17;
    root.add(pallet, crate, bandA, bandB, beacon);
    return root;
  }

  // ---------------------------------------------------------------------------
  // Furrows
  // ---------------------------------------------------------------------------

  private updateFurrows(state: GameState): void {
    if (state.furrows.length < this.renderedFurrows) {
      // A reset, a save restore, or a circular-buffer splice at MAX_FURROWS
      // shortened the list. When the oldest entries are trimmed the remaining
      // furrows shift down by `offset` indices, so instance-slot `i` now
      // corresponds to array entry `i - offset`. Detect that case and copy
      // forward rather than rebuilding from scratch every frame.
      const offset = this.renderedFurrows - state.furrows.length;
      if (offset > 0 && offset < this.renderedFurrows) {
        // Circular-buffer splice: copy shifted matrices and colours forward
        // in-place so the visual order matches the trimmed array.
        for (let i = offset; i < this.renderedFurrows; i++) {
          this.furrowDecals.getMatrixAt(i, this.dummy.matrix);
          this.furrowDecals.setMatrixAt(i - offset, this.dummy.matrix);
          if (this.furrowDecals.instanceColor) {
            const c = this.furrowDecals.getColorAt(i, this.tempColor);
            this.furrowDecals.setColorAt(i - offset, c);
          }
        }
      }
      this.renderedFurrows = state.furrows.length;
    }
    while (this.renderedFurrows < state.furrows.length) {
      const mark = state.furrows[this.renderedFurrows]!;
      this.dummy.position.set(
        mark.x,
        this.world.terrain.height(mark.x, mark.z) + 0.05,
        mark.z,
      );
      this.dummy.rotation.set(-Math.PI / 2, mark.heading, 0);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.updateMatrix();
      this.furrowDecals.setMatrixAt(this.renderedFurrows, this.dummy.matrix);
      // Cut furrows are dark brown; fill furrows are lighter to show raised ground.
      const colour =
        mark.mode === "fill" ? this.furrowFillColor : this.furrowCutColor;
      this.furrowDecals.setColorAt(this.renderedFurrows, colour);
      this.renderedFurrows += 1;
    }
    if (this.furrowDecals.count !== this.renderedFurrows) {
      this.furrowDecals.count = this.renderedFurrows;
      this.furrowDecals.instanceMatrix.needsUpdate = true;
      if (this.furrowDecals.instanceColor)
        this.furrowDecals.instanceColor.needsUpdate = true;
    }
  }

  private updateCropVisuals(state: GameState): void {
    const harvest = state.harvest;
    const totalRows = harvest.totalRows;
    const CROP_ROW_IDS = [
      "furrow-crop-row-0",
      "furrow-crop-row-1",
      "furrow-crop-row-2",
      "furrow-crop-row-3",
    ] as const;
    for (let i = 0; i < CROP_ROW_IDS.length; i++) {
      const mesh = this.scene.getObjectByName(CROP_ROW_IDS[i]!) as
        THREE.Mesh | undefined;
      if (!mesh) continue;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const rowThreshold = totalRows - (CROP_ROW_IDS.length - i);
      if (harvest.delivered) {
        mat.color.setHex(0x9aaa7e);
        mesh.scale.y = 0.3;
      } else if (harvest.stormArrived && !harvest.delivered) {
        mat.color.setHex(0x5a4a2a);
        mesh.scale.y = 0.15;
      } else if (harvest.cultivatedRows > rowThreshold) {
        mat.color.setHex(0xb09830);
        mesh.scale.y = 0.8;
      } else {
        mat.color.setHex(i % 2 === 0 ? 0x8baa4e : 0x7a9a3e);
        mesh.scale.y = 1;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Presentation state
  // ---------------------------------------------------------------------------

  /**
   * Apply a presentation phase.
   *
   * Fog colour **must** equal the background colour in every phase. The world is
   * ringed by a 78 m impassable ridge about 200 m out (see `world.ts`), so a large
   * band of the horizon is always distant geometry. When fog converged on a
   * different colour than the sky, that ridge resolved as a dark grey wall around
   * the whole horizon — in broad daylight. Matching the two makes the rim dissolve
   * into the sky, which is what distance is supposed to look like.
   */
  private updatePhase(phase: WorldPhase): void {
    if (phase === this.currentPhase) return;
    this.currentPhase = phase;
    const stars = this.scene.getObjectByName("night-stars");
    const waterMaterial = this.waterMaterial;
    const waterUniforms = waterMaterial.uniforms as {
      waterColor: { value: THREE.Color };
      deepColor: { value: THREE.Color };
      shallowColor: { value: THREE.Color };
    };
    const setWaterPalette = (
      waterColor: number,
      deepColor: number,
      shallowColor: number,
    ): void => {
      waterUniforms.waterColor.value.setHex(waterColor);
      waterUniforms.deepColor.value.setHex(deepColor);
      waterUniforms.shallowColor.value.setHex(shallowColor);
    };

    if (phase === "day") {
      this.scene.background = new THREE.Color(0xbfd5c5);
      (this.sky.material as THREE.MeshBasicMaterial).color.setHex(0xbfd5c5);
      this.phaseBaseFogDensity = 0.0052;
      this.scene.fog = new THREE.FogExp2(0xbfd5c5, this.phaseBaseFogDensity);
      this.sun.color.setHex(0xffdeb0);
      this.sun.intensity = 2.5;
      this.hemisphere.intensity = 1.6;
      setWaterPalette(0x3d6672, 0x0b1720, 0x0f3f5f);
      for (const rig of this.rigs.values()) rig.headlights.intensity = 0;
      if (stars) stars.visible = false;
    } else if (phase === "gloam") {
      this.scene.background = new THREE.Color(0x9d6b50);
      (this.sky.material as THREE.MeshBasicMaterial).color.setHex(0x9d6b50);
      this.phaseBaseFogDensity = 0.0058;
      this.scene.fog = new THREE.FogExp2(0x9d6b50, this.phaseBaseFogDensity);
      this.sun.color.setHex(0xff9d66);
      this.sun.intensity = 1.3;
      this.hemisphere.intensity = 0.9;
      setWaterPalette(0x4a4a58, 0x17202f, 0x2a5a77);
      for (const rig of this.rigs.values()) rig.headlights.intensity = 60;
      if (stars) stars.visible = true;
    } else {
      this.scene.background = new THREE.Color(COLORS.night);
      (this.sky.material as THREE.MeshBasicMaterial).color.setHex(COLORS.night);
      this.phaseBaseFogDensity = 0.007;
      this.scene.fog = new THREE.FogExp2(
        COLORS.night,
        this.phaseBaseFogDensity,
      );
      this.sun.color.setHex(0x86a8d6);
      this.sun.intensity = 0.35;
      this.hemisphere.intensity = 0.45;
      setWaterPalette(0x1c3340, 0x060d14, 0x14364c);
      for (const rig of this.rigs.values()) rig.headlights.intensity = 150;
      if (stars) stars.visible = true;
    }
  }

  /**
   * Feed the current weather state into the scene.
   *
   * The renderer treats weather as a *signal* rather than a parallel palette:
   * `setWeather` stores the rain target and fog density the weather clock wants,
   * and `render()` eases `currentRain` toward it each frame. Fog colour stays
   * welded to the phase background (the invariant documented on `updatePhase`);
   * weather only thickens density above the phase's own base, so clear weather
   * is indistinguishable from no weather and rain/storm visibly close in the
   * view distance.
   */
  setWeather(weather: WeatherState): void {
    this.weatherTargetRain = weather.rainIntensity;
    this.weatherFogTarget = weather.fogDensity;
    this.weatherPhase = weather.phase;
  }

  /**
   * Ease weather into the scene once per frame using the active rig as the
   * rain cloud's centre of reference. Runs every render even when dry so the
   * eased value can settle back toward 0 rather than stalling mid-fade.
   */
  private updateWeather(rigX: number, rigZ: number, delta: number): void {
    const ease = Math.min(1, delta * 1.6);
    this.currentRain += (this.weatherTargetRain - this.currentRain) * ease;
    if (this.currentRain < 0.001) this.currentRain = 0;

    const fog = this.scene.fog;
    if (fog instanceof THREE.FogExp2) {
      const target =
        this.currentRain > 0.01
          ? Math.max(this.phaseBaseFogDensity, this.weatherFogTarget)
          : this.phaseBaseFogDensity;
      fog.density += (target - fog.density) * ease;
    }

    const rain = this.rainPoints;
    const rainPositions = this.rainPositions;
    if (!rain || !rainPositions) return;
    const material = rain.material as THREE.PointsMaterial;
    material.opacity = this.currentRain * 0.5;
    if (this.currentRain <= 0.01) {
      if (rain.visible) rain.visible = false;
      return;
    }
    if (!rain.visible) rain.visible = true;

    // Re-anchor the cloud on the rig and drift the streaks downward so the
    // precipitation visibly falls rather than hanging in place.
    rain.position.set(rigX, 0, rigZ);
    const fallStep = 4.2 * delta;
    const positions = rainPositions;
    for (let index = 0; index < positions.length; index += 3) {
      positions[index + 1]! -= fallStep;
      // Never let a streak fall through the ground plane; wrap it to the top
      // of the cloud so the density in view stays constant.
      if (positions[index + 1]! < -20) {
        positions[index + 1]! += 40;
      }
    }
    const attribute = rain.geometry.getAttribute("position");
    attribute.needsUpdate = true;
  }

  /**
   * Mark whether a dialogue beat is on screen. The camera eases toward a
   * narrower field of view while active and releases it on close; this is
   * the "camera reframes for a character moment" cue the mechanical
   * shake/flare/toast feedback deliberately does not use.
   */
  setNarrativeFocus(active: boolean): void {
    this.narrativeFocusTarget = active ? 1 : 0;
  }

  /** Register an impact so the camera can react to it. */
  addShake(amount: number): void {
    if (this.reducedMotionQuery.matches) return;
    this.shake = Math.min(1.2, this.shake + amount);
  }

  /**
   * Flash a rig's headlights once, used for diegetic "machine responds" moments
   * such as the first engine start after restoration.
   */
  flashHeadlights(rigId: RigId, durationMs = 350): void {
    const parts = this.rigs.get(rigId);
    if (!parts) return;
    this.headlightFlareUntil.set(rigId, performance.now() + durationMs);
    // Force the light on so the flare is visible even in daylight.
    parts.headlights.visible = true;
  }

  /**
   * Queue a visual shell pulse for a condition-loss outcome.
   *
   * The simulation remains authoritative: this is deliberately presentation
   * state only, shares the existing audio/shake trigger, and does not claim a
   * physical collision point that the current collision outcome does not carry.
   */
  recordConditionImpact(rigId: RigId): void {
    this.pendingConditionImpacts.add(rigId);
  }

  // ---------------------------------------------------------------------------
  // Frame
  // ---------------------------------------------------------------------------

  render(state: GameState): void {
    const now = performance.now();
    const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    this.updatePhase(state.phase);

    // One-off headlight flares for diegetic machine-response moments.
    for (const [rigId, until] of this.headlightFlareUntil) {
      const parts = this.rigs.get(rigId);
      if (!parts || now >= until) {
        this.headlightFlareUntil.delete(rigId);
        continue;
      }
      const remaining = until - now;
      const flare = (remaining / 350) * 520;
      parts.headlights.intensity = Math.min(
        1200,
        parts.headlights.intensity + flare,
      );
    }

    this.updateFurrows(state);
    this.updateCropVisuals(state);
    this.updateInfrastructureWater(state);
    this.updateInfrastructureProps(state, delta);

    const activeRigState = state.rigs[state.activeRigId];
    this.updateWeather(activeRigState.x, activeRigState.z, delta);
    const profile = effectiveProfile(activeRigState.id, activeRigState.modules);

    // Storm clouds darken as the weather progresses.
    this.updateStormClouds(
      this.weatherPhase,
      this.weatherTargetRain,
      state.elapsedMs,
    );

    // Terrain mesh follows the height field when the plough changes it.
    // Gate on the terrain's mutation revision, never on its cell count. Deepening
    // an existing furrow changes a cell's value without changing the count, and the
    // FIFO eviction at capacity swaps one cell for another — both leave the count
    // identical while the ground the physics reads has moved.
    const deformCount = this.world.terrain.deformationRevision();
    if (deformCount !== this.lastDeformCount) {
      this.lastDeformCount = deformCount;
      this.refreshTerrainRegion(activeRigState.x, activeRigState.z, 9);
      // Event-driven prop invalidation: terrain deformation changes the
      // ground beneath nearby props, so force a prop rebuild on the next
      // frame rather than waiting for the rig to travel PROP_REBUILD_DISTANCE.
      this.propAnchorX = Number.POSITIVE_INFINITY;
      this.propAnchorZ = Number.POSITIVE_INFINITY;
    }

    // A community passage changes terrain height, surface material, and the
    // obstacle admissibility corridor over a large area. Rebuild once from the
    // same terrain authority rather than layering a visual-only bridge on top.
    const routeRevision = this.world.terrain.routeRevisionNumber();
    if (routeRevision !== this.lastRouteRevision) {
      this.lastRouteRevision = routeRevision;
      this.rebuildTerrainHeights();
      this.syncCommunityPassageDecks(state);
      this.propAnchorX = Number.POSITIVE_INFINITY;
      this.propAnchorZ = Number.POSITIVE_INFINITY;
    }
    const roadIncidentRevision = this.world.roadIncidentRevisionNumber();
    if (roadIncidentRevision !== this.lastRoadIncidentRevision) {
      this.lastRoadIncidentRevision = roadIncidentRevision;
      this.propAnchorX = Number.POSITIVE_INFINITY;
      this.propAnchorZ = Number.POSITIVE_INFINITY;
    }

    const fieldConditionRevision = this.world.fieldConditionRevisionNumber();
    const fieldColourMoved =
      Math.hypot(
        activeRigState.x - this.fieldColourAnchorX,
        activeRigState.z - this.fieldColourAnchorZ,
      ) >= 14;
    if (
      fieldConditionRevision !== this.lastFieldConditionRevision ||
      fieldColourMoved
    ) {
      this.lastFieldConditionRevision = fieldConditionRevision;
      this.fieldColourAnchorX = activeRigState.x;
      this.fieldColourAnchorZ = activeRigState.z;
      this.refreshTerrainColourRegion(activeRigState.x, activeRigState.z, 18);
    }

    this.syncHabitatLife(state);
    this.animateHabitatLife(state.elapsedMs);
    this.animateSignalBeams(state.elapsedMs);

    if (
      Math.hypot(
        activeRigState.x - this.propAnchorX,
        activeRigState.z - this.propAnchorZ,
      ) > PROP_REBUILD_DISTANCE
    ) {
      this.refreshProps(state);
    }

    // Derive each rig's feedback exactly once, then hand the whole frame to the
    // rig-local presentation owner. The renderer still owns feedback derivation
    // because its evidence surface reports the same frames.
    const presentationFrames = new Map<RigId, RigPresentationFrame>();
    for (const id of RIG_IDS) {
      const rigState = state.rigs[id];
      if (!this.rigs.has(id)) continue;
      const rigProfile = effectiveProfile(rigState.id, rigState.modules);
      const feedback = deriveRigFeedback(
        rigState,
        rigProfile,
        this.reducedMotionQuery.matches,
      );
      this.feedbackFrames.set(id, feedback);
      presentationFrames.set(id, {
        rigState,
        feedback,
        conditionImpact: this.pendingConditionImpacts.delete(id),
      });
    }
    vehicleAnimationSystem.update(delta, now / 1000, presentationFrames);

    // Dust from the active rig's slipping wheels.
    const ground = this.world.terrain.sample(
      activeRigState.x,
      activeRigState.z,
      1.2,
    );
    const spray = ground.surface.spray;
    if (activeRigState.mobility.kind === "ground") {
      for (
        let index = 0;
        index < activeRigState.mobility.wheels.length;
        index += 1
      ) {
        const wheel = activeRigState.mobility.wheels[index]!;
        if (!wheel.contact) continue;
        const strength = wheel.slip * spray;
        if (strength < 0.18) continue;
        const angle =
          activeRigState.heading + (index < 2 ? 0.4 : Math.PI - 0.4);
        const radius = profile.track * 0.5;
        this.emitDust(
          activeRigState.x + Math.sin(angle) * radius,
          ground.height + 0.3,
          activeRigState.z + Math.cos(angle) * radius,
          Math.min(1, strength),
          Math.abs(activeRigState.speed),
        );
      }
    } else if (
      Math.abs(activeRigState.speed) > 1.5 &&
      activeRigState.telemetry.waterDepth > 0.05
    ) {
      const rearX = activeRigState.x - Math.sin(activeRigState.heading) * 2.2;
      const rearZ = activeRigState.z - Math.cos(activeRigState.heading) * 2.2;
      this.emitDust(
        rearX,
        WATER_LEVEL + 0.15,
        rearZ,
        Math.min(1, Math.abs(activeRigState.speed) / profile.topSpeed),
        Math.abs(activeRigState.speed),
      );
    }
    this.updateDust(delta);

    // Cargo and hitch.
    const cargo = state.cargoRelay.cargo;
    this.cargo.visible = true;
    this.cargo.position.set(cargo.x, cargo.y, cargo.z);
    this.cargo.rotation.y = cargo.heading;

    this.hitchLine.visible = cargo.attachedRigId !== null;
    if (cargo.attachedRigId) {
      const attachedRig = state.rigs[cargo.attachedRigId];
      const positions = this.hitchLine.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      positions.setXYZ(0, attachedRig.x, attachedRig.y + 0.4, attachedRig.z);
      positions.setXYZ(1, cargo.x, cargo.y + 0.35, cargo.z);
      positions.needsUpdate = true;
      this.hitchLine.geometry.computeBoundingSphere();
    }

    const deliveryRing = this.scene.getObjectByName("relay-delivery-ring");
    if (deliveryRing) {
      const destination = cargoDeliveryTarget(state.cargoRelay);
      deliveryRing.position.set(
        destination.x,
        this.world.terrain.height(destination.x, destination.z) + 0.24,
        destination.z,
      );
      deliveryRing.rotation.z += delta * 0.42;
      deliveryRing.visible = !cargo.delivered;
    }
    const pickupRing = this.scene.getObjectByName("relay-pickup-ring");
    if (pickupRing) {
      const pickup = cargoPickupTarget(state.cargoRelay);
      pickupRing.position.set(
        pickup.x,
        this.world.terrain.height(pickup.x, pickup.z) + 0.2,
        pickup.z,
      );
      pickupRing.visible = !cargo.delivered && cargo.attachedRigId === null;
    }

    const communityTrafficById = new Map(
      deriveCommunityTraffic(state).map((traffic) => [traffic.id, traffic]),
    );
    const communityTraffic = this.scene.getObjectByName("community-traffic");
    communityTraffic?.children.forEach((vehicle) => {
      const traffic = communityTrafficById.get(
        vehicle.userData.trafficId as string,
      );
      vehicle.visible = traffic !== undefined;
      if (!traffic) return;
      vehicle.position.set(
        traffic.x,
        this.world.terrain.height(traffic.x, traffic.z) +
          (traffic.kind === "skiff" ? 0.26 : 0.38),
        traffic.z,
      );
      vehicle.rotation.y = traffic.heading;
    });

    const settlementCargoBays = this.scene.getObjectByName(
      "settlement-cargo-bays",
    );
    settlementCargoBays?.children.forEach((bay) => {
      const manifestId = bay.userData.manifestId as string;
      const manifest = SETTLEMENT_CARGO_MANIFESTS.find(
        (candidate) => candidate.id === manifestId,
      );
      bay.visible =
        manifest !== undefined &&
        isSettlementCargoManifestAvailable(state, manifest);
    });

    const settlementLifeBySite = new Map(
      deriveSettlementLife(state, {
        quarryRunoutStatus: this.world.roadIncidentProjection().status,
      }).map((settlement) => [settlement.siteId, settlement]),
    );

    for (const site of WORLD_SITES) {
      const group = this.scene.getObjectByName(`site:${site.id}`);
      const lamp = group?.userData.signalLamp as THREE.Mesh | undefined;
      if (!lamp) continue;
      const siteKnown =
        site.id === "home-silo" ||
        state.discoveries.some((item) => item.id === site.id);
      const settlementColor = siteKnown
        ? settlementLampColor(state, site.id)
        : null;
      const residents = group?.getObjectByName(
        `settlement-residents:${site.id}`,
      );
      if (residents) {
        const life = settlementLifeBySite.get(site.id);
        const anchors = settlementResidentAnchors(site.id);
        residents.visible =
          siteKnown && life !== undefined && life.residents.length > 0;
        residents.children.forEach((resident, index) => {
          const plan = life?.residents[index];
          const anchor = anchors[index];
          resident.visible =
            siteKnown && plan !== undefined && anchor !== undefined;
          if (!plan || !anchor) return;
          resident.position.set(
            anchor.x + plan.offsetX,
            Math.sin(state.elapsedMs / 820 + index * 1.7) * 0.035,
            anchor.z + plan.offsetZ,
          );
          resident.rotation.y = anchor.heading + plan.headingOffset;
          const body = resident.children[0] as THREE.Mesh | undefined;
          if (body && body.material instanceof THREE.MeshStandardMaterial) {
            body.material.color.setHex(plan.color);
          }
        });
      }
      const consequences = group?.getObjectByName(
        `settlement-consequences:${site.id}`,
      );
      if (consequences) {
        const contributed = new Set(
          settlementLifeBySite
            .get(site.id)
            ?.responses.filter((response) => response.status === "contributed")
            .map((response) => response.id) ?? [],
        );
        consequences.children.forEach((consequence) => {
          consequence.visible =
            siteKnown &&
            contributed.has(consequence.userData.consequenceId as string);
        });
      }
      const adaptations = group?.getObjectByName(
        `settlement-adaptations:${site.id}`,
      );
      if (adaptations) {
        const active = new Set(
          settlementLifeBySite
            .get(site.id)
            ?.adaptations.map((adaptation) => adaptation.id) ?? [],
        );
        adaptations.children.forEach((adaptation) => {
          adaptation.visible =
            siteKnown &&
            active.has(adaptation.userData.consequenceId as string);
        });
      }
      const infrastructure = INFRASTRUCTURE_ENTITY_IDS.map(
        (id) => INFRASTRUCTURE_DEFINITIONS[id],
      ).find((definition) => definition.siteId === site.id);
      if (infrastructure) {
        const entity = state.infrastructure.entities[infrastructure.id];
        const operating = infrastructureIsOperating(infrastructure, entity);
        // One authored lamp changes role once the player understands the
        // machine beneath it. This is a property of the landmark, not a new HUD
        // marker: amber calls the player toward an unknown place, cyan confirms
        // flow, and red makes a failed world service readable from the road.
        (lamp.material as THREE.MeshBasicMaterial).color.setHex(
          !entity.known
            ? siteKnown
              ? SIGNAL_LAMP_DARK
              : ((group?.userData.signalLitColor as number | undefined) ??
                SIGNAL_LAMP_DARK)
            : operating
              ? (settlementColor ?? COLORS.cyan)
              : 0xe45b4f,
        );
        continue;
      }
      // The housing stays: a dead lamp on a real structure still reads as a place
      // you have already been, where a vanished marker reads as a bug.
      (lamp.material as THREE.MeshBasicMaterial).color.setHex(
        settlementColor ??
          (siteKnown
            ? SIGNAL_LAMP_DARK
            : ((group?.userData.signalLitColor as number | undefined) ??
              SIGNAL_LAMP_DARK)),
      );
    }

    this.updateCamera(state, delta, profile);
    this.composer.render();
  }

  /**
   * Position the camera, keeping the rig visible.
   *
   * Includes the terrain-occlusion pull-in that `DESIGN.md` records as an
   * unimplemented gap: the ideal camera position is raymarched against the height
   * field and pulled toward the rig if a hill is in the way. Without this the
   * player's own machine disappears behind terrain, which is exactly what the
   * accepted Rig Lab 01 screenshot shows happening behind a tree.
   */
  private updateCamera(
    state: GameState,
    delta: number,
    profile: ReturnType<typeof effectiveProfile>,
  ): void {
    const rig = state.rigs[state.activeRigId];
    const parts = this.rigs.get(rig.id);
    if (!parts) {
      throw new Error(`Missing rendered rig for camera: ${rig.id}`);
    }
    parts.root.updateWorldMatrix(true, true);
    const feedback = deriveRigFeedback(
      rig,
      profile,
      this.reducedMotionQuery.matches,
    );
    const chasePolicy = chaseViewportPolicy(
      this.camera.aspect,
      profile.camera.chaseDistance,
      profile.track,
    );
    const narrow = chasePolicy.narrow;
    const forward = new THREE.Vector3(
      Math.sin(rig.heading),
      0,
      Math.cos(rig.heading),
    );
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    const focus = new THREE.Vector3(
      rig.x,
      rig.y +
        (state.cameraMode === "chase" ||
        state.cameraMode === "hood" ||
        state.cameraMode === "side"
          ? profile.camera.focusHeight
          : 0.8),
      rig.z,
    );
    this.lastCameraFocusY = focus.y;

    let desired: THREE.Vector3;
    let target: THREE.Vector3;

    if (state.cameraMode === "chase") {
      // Portrait has far less horizontal field of view. Pulling back 2.5× keeps
      // broad machines (and future articulated silhouettes) inside the safe
      // column between the field kit and touch controls. The policy remains
      // profile-scaled rather than branching on a rig id.
      const distance = profile.camera.chaseDistance * chasePolicy.distanceScale;
      const height = profile.camera.chaseHeight * chasePolicy.heightScale;
      const side = profile.camera.chaseSide * chasePolicy.sideScale;
      desired = new THREE.Vector3(rig.x, rig.y + height, rig.z)
        .addScaledVector(forward, -distance)
        .add(
          new THREE.Vector3(side, 0, 0).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            rig.heading,
          ),
        );
      target = focus
        .clone()
        .addScaledVector(forward, 4 + feedback.cameraForwardLook)
        .addScaledVector(right, feedback.cameraLateralLook);
      target.y -= chasePolicy.targetDrop;
    } else if (state.cameraMode === "hood") {
      // The silhouette owns a named socket. A shared focus-relative offset put
      // Torque's camera inside its hood and could never describe the much lower
      // buggy or forward-cab skimmer honestly.
      const mount = RIG_HOOD_CAMERA_MOUNTS[rig.id];
      desired = parts.hoodCameraSocket.getWorldPosition(new THREE.Vector3());
      target = desired.clone().addScaledVector(forward, mount.lookDistance);
      target.y -= mount.lookDrop;
    } else if (state.cameraMode === "side") {
      // A readable inspection/action view that exposes suspension, attachments,
      // and towing without encoding any particular vehicle class.
      desired = focus
        .clone()
        .addScaledVector(right, narrow ? 13 : 11)
        .addScaledVector(forward, -2)
        .add(new THREE.Vector3(0, narrow ? 5.8 : 4.8, 0));
      target = focus.clone().addScaledVector(forward, 2.5);
    } else if (state.cameraMode === "tactical") {
      desired = new THREE.Vector3(
        rig.x,
        rig.y + (narrow ? 34 : 27),
        rig.z,
      ).addScaledVector(forward, -3);
      target = focus;
    } else if (state.cameraMode === "top-down") {
      // Top-down framing with 75° near-orthographic tilt angle and predictive target lead
      const leadScale = Math.min(rig.speed * 0.75, 12);
      const leadX = Math.sin(rig.heading) * leadScale;
      const leadZ = Math.cos(rig.heading) * leadScale;

      desired = new THREE.Vector3(
        rig.x + leadX,
        rig.y + (narrow ? 46 : 36),
        rig.z + leadZ + 5, // Tilted high-angle framing
      );
      target = new THREE.Vector3(rig.x + leadX, rig.y + 0.5, rig.z + leadZ);
    } else {
      // Survey: a high, pulled-back vantage for reading the land and planning a
      // route. Distinct from tactical, which stays close for manoeuvring.
      desired = new THREE.Vector3(
        rig.x,
        rig.y + (narrow ? 78 : 64),
        rig.z,
      ).addScaledVector(forward, -46);
      target = focus;
    }

    const idealDesired = desired.clone();
    const fullSceneQuery =
      state.cameraMode === "chase" || state.cameraMode === "side";
    let obstruction: CameraObstructionHit | null = null;
    let finalPathHit: CameraObstructionHit | null = null;

    if (state.cameraMode !== "hood") {
      const queryOptions = {
        includeObstacles: fullSceneQuery,
        includeStructures: fullSceneQuery,
      };
      const queryCandidate = (candidate: THREE.Vector3) =>
        this.world.cameraObstruction(focus, candidate, 0.45, queryOptions);
      const pullBeforeHit = (
        candidate: THREE.Vector3,
        hit: CameraObstructionHit,
      ) => {
        const length = Math.max(0.001, focus.distanceTo(candidate));
        return focus
          .clone()
          .lerp(candidate, Math.max(0, hit.fraction - 0.55 / length));
      };

      obstruction = queryCandidate(desired);
      if (obstruction) {
        desired = pullBeforeHit(desired, obstruction);
        const minimumResolvedDistance =
          state.cameraMode === "chase"
            ? chasePolicy.minimumReadableDistance
            : 2.8;
        if (focus.distanceTo(desired) < minimumResolvedDistance) {
          // When the rig starts almost against a wall there is no usable boom
          // between focus and obstruction. Choose a deterministic shoulder/high
          // fallback rather than placing the near plane inside the rig.
          const sideDistance = Math.max(5, profile.track * 2);
          const wideSideDistance = Math.max(9, profile.track * 3.4);
          const fallbackCandidates = [
            focus
              .clone()
              .addScaledVector(right, wideSideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 5.2, 0)),
            focus
              .clone()
              .addScaledVector(right, -wideSideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 5.2, 0)),
            focus
              .clone()
              .addScaledVector(right, sideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 3.2, 0)),
            focus
              .clone()
              .addScaledVector(right, -sideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 3.2, 0)),
            focus
              .clone()
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 6.5, 0)),
          ];
          for (const candidate of fallbackCandidates) {
            candidate.y = Math.max(
              candidate.y,
              this.world.terrain.height(candidate.x, candidate.z) + 2.4,
            );
            if (!queryCandidate(candidate)) {
              desired = candidate;
              break;
            }
          }
        }
      }

      // Also lift clear of the ground so a pulled-in camera does not end up
      // inside the same hill it was avoiding.
      desired.y = Math.max(
        desired.y,
        this.world.terrain.height(desired.x, desired.z) +
          (obstruction ? 2.4 : 2),
      );
    }

    const cameraModeChanged =
      this.lastCameraMode !== null && this.lastCameraMode !== state.cameraMode;
    const focusTeleported =
      this.lastCameraFocus !== null &&
      this.lastCameraFocus.distanceTo(focus) > 8;
    const cameraDiscontinuity =
      this.cameraRigId !== rig.id ||
      cameraModeChanged ||
      focusTeleported ||
      this.camera.position.distanceTo(desired) > 70;
    const desiredDistance = focus.distanceTo(desired);
    const currentDistance = focus.distanceTo(this.camera.position);
    const needsImmediatePullIn =
      obstruction !== null && currentDistance > desiredDistance + 0.08;
    if (
      !this.cameraInitialised ||
      cameraDiscontinuity ||
      needsImmediatePullIn
    ) {
      this.camera.position.copy(desired);
      this.cameraInitialised = true;
    } else {
      const blend =
        state.cameraMode === "chase"
          ? 1 - Math.exp(-6 * delta)
          : 1 - Math.exp(-3.5 * delta);
      this.camera.position.lerp(desired, blend);
    }

    // A smoothed camera can still sweep through a nearer prop even when its
    // endpoint is valid. Re-query the actual candidate and pull inward
    // immediately; outward recovery remains smoothed above.
    if (state.cameraMode !== "hood") {
      const smoothedHit = this.world.cameraObstruction(
        focus,
        this.camera.position,
        0.45,
        {
          includeObstacles: fullSceneQuery,
          includeStructures: fullSceneQuery,
        },
      );
      if (smoothedHit) {
        const length = Math.max(0.001, focus.distanceTo(this.camera.position));
        const safeFraction = Math.max(0, smoothedHit.fraction - 0.55 / length);
        this.camera.position.lerpVectors(
          focus,
          this.camera.position,
          safeFraction,
        );
        obstruction = obstruction ?? smoothedHit;
      }

      // Endpoint and boom checks can both be valid while an obstruction leaves
      // too little room for the rig itself. Enforce the final composition
      // invariant at the boundary that actually renders: select a clear,
      // elevated rear shoulder rather than accepting a camera inside the cab.
      const minimumRigClearance =
        state.cameraMode === "chase"
          ? Math.max(
              3.2,
              profile.track * 1.35,
              chasePolicy.minimumReadableDistance,
            )
          : Math.max(3.2, profile.track * 1.35);
      if (focus.distanceTo(this.camera.position) < minimumRigClearance) {
        const emergencySide = narrow
          ? Math.max(10, profile.track * 3.6)
          : Math.max(6, profile.track * 2.5);
        const emergencyBack = narrow ? -4 : -0.5;
        const emergencyHeight = narrow ? 11 : 12;
        const emergencyCandidates = [
          focus
            .clone()
            .addScaledVector(right, emergencySide)
            .addScaledVector(forward, emergencyBack)
            .add(new THREE.Vector3(0, emergencyHeight, 0)),
          focus
            .clone()
            .addScaledVector(right, -emergencySide)
            .addScaledVector(forward, emergencyBack)
            .add(new THREE.Vector3(0, emergencyHeight, 0)),
          focus
            .clone()
            .addScaledVector(forward, narrow ? -9 : -4)
            .add(new THREE.Vector3(0, narrow ? 16 : 14, 0)),
        ];
        for (const candidate of emergencyCandidates) {
          candidate.y = Math.max(
            candidate.y,
            this.world.terrain.height(candidate.x, candidate.z) + 3,
          );
          const candidateHit = this.world.cameraObstruction(
            focus,
            candidate,
            0.45,
            {
              includeObstacles: fullSceneQuery,
              includeStructures: fullSceneQuery,
            },
          );
          if (!candidateHit) {
            this.camera.position.copy(candidate);
            break;
          }
        }
      }

      finalPathHit = this.world.cameraObstruction(
        focus,
        this.camera.position,
        0.45,
        {
          includeObstacles: fullSceneQuery,
          includeStructures: fullSceneQuery,
        },
      );
    }
    this.cameraRigId = rig.id;
    this.lastCameraMode = state.cameraMode;
    this.lastCameraFocus = focus.clone();

    if (this.shake > 0.001) {
      this.shake = Math.max(0, this.shake - delta * 2.6);
      const magnitude = this.shake * 0.42;
      const phase = performance.now() * 0.045;
      this.camera.position.x += Math.sin(phase) * magnitude;
      this.camera.position.y += Math.sin(phase * 1.7) * magnitude * 0.7;
    }

    // Speed opens the field of view slightly; reduced-motion removes the
    // presentation-only expansion while retaining the chosen camera policy.
    const baseFov =
      state.cameraMode === "chase"
        ? 52 + feedback.speedFovBoost
        : state.cameraMode === "hood"
          ? 64 + feedback.speedFovBoost * 0.625
          : state.cameraMode === "side"
            ? 48
            : state.cameraMode === "top-down"
              ? 46
              : 52;
    this.narrativeFocus +=
      (this.narrativeFocusTarget - this.narrativeFocus) *
      (1 - Math.exp(-3 * delta));
    const targetFov = baseFov - this.narrativeFocus * 5;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov +=
        (targetFov - this.camera.fov) * (1 - Math.exp(-4 * delta));
      this.camera.updateProjectionMatrix();
    }

    if (state.cameraMode === "top-down") {
      this.camera.up.copy(forward);
    } else {
      this.camera.up.set(0, 1, 0);
    }
    this.camera.lookAt(target);
    this.sky.position.copy(this.camera.position);

    const selfIntersectionPart = this.rigIntersectionPart(
      parts,
      this.camera.position,
    );
    const cameraForwardOffset = this.camera.position
      .clone()
      .sub(focus)
      .dot(forward);
    const resolvedDistance = Number(
      focus.distanceTo(this.camera.position).toFixed(3),
    );
    const minimumReadableDistance =
      state.cameraMode === "chase"
        ? Number(chasePolicy.minimumReadableDistance.toFixed(3))
        : 0;
    this.cameraResolution = {
      rigId: rig.id,
      mode: state.cameraMode,
      obstructionSource: obstruction?.source ?? null,
      obstructionId: obstruction?.id ?? null,
      idealDistance: Number(focus.distanceTo(idealDesired).toFixed(3)),
      resolvedDistance,
      minimumReadableDistance,
      readableComposition:
        finalPathHit === null &&
        selfIntersectionPart === null &&
        resolvedDistance + 0.01 >= minimumReadableDistance,
      forwardOffset: Number(cameraForwardOffset.toFixed(3)),
      behindRig: cameraForwardOffset < -0.05,
      pathClear: finalPathHit === null,
      selfIntersecting: selfIntersectionPart !== null,
      selfIntersectionPart,
    };
  }

  private rigIntersectionPart(
    parts: RigParts,
    worldPoint: THREE.Vector3,
  ): string | null {
    let intersectionPart: string | null = null;
    parts.root.traverse((object) => {
      if (
        intersectionPart ||
        !(object instanceof THREE.Mesh) ||
        !object.visible ||
        object.userData.cameraSolid === false
      ) {
        return;
      }
      const geometry = object.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if (!geometry.boundingBox) return;
      const localPoint = object.worldToLocal(worldPoint.clone());
      if (
        geometry.boundingBox
          .clone()
          // The camera point can be outside a mesh while the 0.25 m near plane
          // still slices it into a screen-filling black polygon. Reserve a
          // little more than the near distance as the usable-view contract.
          .expandByScalar(0.35)
          .containsPoint(localPoint)
      ) {
        intersectionPart = partLabel(object);
      }
    });
    return intersectionPart;
  }

  cameraEvidence(): CameraResolutionEvidence {
    if (!this.cameraResolution) {
      throw new Error(
        "Camera evidence is unavailable before the first render.",
      );
    }
    return { ...this.cameraResolution };
  }

  /**
   * Report the scene's live weather presentation for browser evidence.
   *
   * Returns the eased rain value, the delivered exp-2 fog density (versus the
   * phase's base), and the rain point cloud's visibility/opacity, so an
   * acceptance script can assert that weather actually reached the 3D scene —
   * not just the CSS shell.
   */
  weatherSceneEvidence(): {
    easedRain: number;
    fogDensity: number;
    phaseBaseFogDensity: number;
    rainVisible: boolean;
    rainOpacity: number;
  } {
    const rain = this.rainPoints;
    const material = rain?.material as THREE.PointsMaterial | undefined;
    return {
      easedRain: Number(this.currentRain.toFixed(3)),
      fogDensity:
        this.scene.fog instanceof THREE.FogExp2
          ? Number(this.scene.fog.density.toFixed(4))
          : 0,
      phaseBaseFogDensity: this.phaseBaseFogDensity,
      rainVisible: rain?.visible ?? false,
      rainOpacity: material ? Number(material.opacity.toFixed(3)) : 0,
    };
  }

  runtimeBridgeEvidenceFor(assetId: string): RuntimeAssetBridgeEvidence {
    const evidence = this.runtimeBridgeEvidence.get(assetId);
    if (!evidence) {
      throw new Error(`Missing runtime bridge evidence: ${assetId}`);
    }
    return { ...evidence };
  }

  runtimeBridgeEvidenceList(): RuntimeAssetBridgeEvidence[] {
    return this.runtimeBridgeSpecs.map((spec) =>
      this.runtimeBridgeEvidenceFor(spec.assetId),
    );
  }

  /**
   * Switch only the visibility budget for already-created instanced props.
   *
   * This cannot alter world, input, or simulation state. Rebuilding immediately
   * keeps the reported active profile and the actual submitted prop set aligned.
   */
  setVisibilityProfile(
    profileId: VisibilityProfileId,
    state: GameState,
  ): boolean {
    if (profileId === this.activeVisibilityProfileId) return false;
    this.activeVisibilityProfileId = profileId;
    this.propAnchorX = Number.POSITIVE_INFINITY;
    this.propAnchorZ = Number.POSITIVE_INFINITY;
    this.refreshProps(state);
    return true;
  }

  metrics(): {
    drawCalls: number;
    triangles: number;
    geometries: number;
    textures: number;
    terrainBuildMs: number;
    terrainRegionRefreshMs: number;
    visibility: PropVisibilityMetrics;
    gpuMemoryMb: number;
    rendererBackend: RendererBackend;
    rendererRequestedBackend: RendererBackendRequest;
    rendererBackendFallback: boolean;
    rendererBackendReason: string;
  } {
    return {
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      terrainBuildMs: Number(this.terrainBuildMs.toFixed(1)),
      terrainRegionRefreshMs: Number(this.terrainRegionRefreshMs.toFixed(2)),
      visibility: { ...this.propVisibility },
      gpuMemoryMb: this.estimateGpuMemoryMb(),
      rendererBackend: this.rendererBackend,
      rendererRequestedBackend: this.rendererRequestedBackend,
      rendererBackendFallback: this.rendererBackendFallback,
      rendererBackendReason: this.rendererBackendReason,
    };
  }

  /**
   * Estimate GPU memory usage in MB based on renderer info.
   * Formula: geometries * ~1KB + textures * ~4MB (assuming 1024x1024 RGBA)
   */
  private estimateGpuMemoryMb(): number {
    const { geometries, textures } = this.renderer.info.memory;
    const estimatedBytes = geometries * 1024 + textures * 1024 * 1024 * 4;
    return Number((estimatedBytes / (1024 * 1024)).toFixed(1));
  }

  /**
   * Prove that the rendered nose is on the same side of the rig as simulated
   * forward travel. This uses visible model parts—not duplicate authored
   * coordinates—so browser acceptance catches a future mesh built backwards.
   */
  orientationEvidence(state: GameState, rigId: RigId): RigOrientationEvidence {
    const rig = state.rigs[rigId];
    const parts = this.rigs.get(rigId);
    if (!parts) {
      throw new Error(`Missing rendered rig: ${rigId}`);
    }

    parts.root.updateWorldMatrix(true, true);
    const front = parts.frontMarker.getWorldPosition(new THREE.Vector3());
    const rear = parts.rearMarker.getWorldPosition(new THREE.Vector3());
    const forward = new THREE.Vector3(
      Math.sin(rig.heading),
      0,
      Math.cos(rig.heading),
    );
    const frontAlongHeading = front.sub(rear).dot(forward);

    return {
      rigId,
      heading: Number(rig.heading.toFixed(4)),
      frontAlongHeadingMetres: Number(frontAlongHeading.toFixed(3)),
      visualFrontIsForward: frontAlongHeading > 0,
    };
  }

  /**
   * Prove that the rendered rig is touching the rendered ground.
   *
   * Measures world-space geometry — the tyres' lowest points, the blob shadow,
   * a hover skirt's lower edge — against the terrain directly beneath each, so
   * it fails on a rig mounted in the wrong vertical frame. Authored-number tests
   * cannot: they compare the model's constants with each other and agree.
   *
   * The tolerance is deliberately loose. Suspension travel, terrain
   * interpolation between vertices, and a rig still settling all move a tyre off
   * the surface legitimately by centimetres. The bug this exists to catch moved
   * them by 0.62–1.35 m.
   */
  groundContactEvidence(
    state: GameState,
    rigId: RigId,
  ): RigGroundContactEvidence {
    const rig = state.rigs[rigId];
    const parts = this.rigs.get(rigId);
    if (!parts) throw new Error(`Missing rendered rig: ${rigId}`);
    const profile = effectiveProfile(rig.id, rig.modules);

    parts.root.updateWorldMatrix(true, true);
    const scratch = new THREE.Vector3();
    const bounds = new THREE.Box3();

    /** Lowest rendered point of a part, and the terrain under its centre. */
    const gapBelow = (part: THREE.Object3D): number => {
      bounds.setFromObject(part);
      bounds.getCenter(scratch);
      return bounds.min.y - this.world.terrain.height(scratch.x, scratch.z);
    };

    const wheelContactGaps = parts.wheels.map((spinPivot) => {
      const tyre = spinPivot.getObjectByName("tyre") ?? spinPivot;
      return Number(gapBelow(tyre).toFixed(3));
    });

    const shadow = parts.root.getObjectByName("blob-shadow");
    const shadowGap = shadow
      ? Number(
          (
            shadow.getWorldPosition(scratch).y -
            this.world.terrain.height(scratch.x, scratch.z)
          ).toFixed(3),
        )
      : Number.NaN;

    const skirt = parts.root.getObjectByName("hover-skirt");
    const hoverSkirtGap = skirt ? Number(gapBelow(skirt).toFixed(3)) : null;

    const worstWheelContactGap =
      wheelContactGaps.length === 0
        ? null
        : wheelContactGaps.reduce(
            (worst, gap) => (Math.abs(gap) > Math.abs(worst) ? gap : worst),
            0,
          );

    // A shadow must sit on the surface. Tyres may ride a little on suspension.
    // A hover skirt is *supposed* to be clear of the ground, so it is checked
    // against the cushion it should hold rather than against zero.
    const shadowOnGround =
      Number.isFinite(shadowGap) && Math.abs(shadowGap) <= 0.25;
    const wheelsOnGround =
      worstWheelContactGap === null ||
      Math.abs(worstWheelContactGap) <= profile.suspensionTravel + 0.25;
    const skirtOnCushion =
      hoverSkirtGap === null ||
      Math.abs(hoverSkirtGap - profile.suspensionTravel) <= 0.3;

    return {
      rigId,
      terrainY: Number(this.world.terrain.height(rig.x, rig.z).toFixed(3)),
      bodyOriginY: Number(rig.y.toFixed(3)),
      rideHeight: profile.rideHeight,
      wheelContactGaps,
      worstWheelContactGap,
      shadowGap,
      hoverSkirtGap,
      contactsGround: shadowOnGround && wheelsOnGround && skirtOnCushion,
    };
  }

  /**
   * Measure what the player can see of the modules they bought.
   *
   * Three facts about a module visual live outside every table a unit test can
   * read, and this is the only surface that reaches them:
   *
   *   1. The terrain's real height under the module, rather than the ground plane
   *      the blockout assumes at y = 0.
   *   2. The *rendered* form built inside the mount box, rather than the box.
   *   3. The rig's hand-authored superstructure — `createTractor` sets its cab at
   *      `(0, 2.7, -1.05)` as a literal, so `rig-blockout.ts` has no idea it is
   *      there, and the survey mast passes straight through it for any
   *      `zCentreScale` above about -0.47.
   *
   * "Solid rig part" reuses `userData.cameraSolid`, the marker the camera's own
   * self-intersection test already uses to mean "opaque vehicle geometry". A
   * second exclusion list would drift from that one; sharing it means marking the
   * state shell non-solid once fixes both callers.
   */
  moduleVisualEvidence(
    state: GameState,
    rigId: RigId,
  ): RigModuleVisualEvidence {
    const rig = state.rigs[rigId];
    const parts = this.rigs.get(rigId);
    if (!parts) throw new Error(`Missing rendered rig parts: ${rigId}`);

    parts.root.updateWorldMatrix(true, true);
    const moduleGroups = new Set<THREE.Object3D>();
    for (const visuals of Object.values(parts.moduleVisuals)) {
      for (const visual of visuals ?? []) moduleGroups.add(visual);
    }

    /** True when this object is inside any module's group. */
    const insideAModule = (object: THREE.Object3D): boolean => {
      for (let node: THREE.Object3D | null = object; node; node = node.parent) {
        if (moduleGroups.has(node)) return true;
      }
      return false;
    };

    /** True when `ancestor` is on this object's parent chain. */
    const isUnder = (
      object: THREE.Object3D,
      ancestor: THREE.Object3D | null,
    ): boolean => {
      if (!ancestor) return false;
      for (let node: THREE.Object3D | null = object; node; node = node.parent) {
        if (node === ancestor) return true;
      }
      return false;
    };

    /**
     * Every "is this inside that" test below runs in the rig body's own frame,
     * not in world space.
     *
     * An axis-aligned box is only tight when the thing inside it is axis-aligned.
     * Park the rig on a slope and the body picks up pitch and roll, every world
     * AABB on it inflates, and two parts that are merely flush start reporting
     * centimetres of penetration — the first survey of this surface showed the
     * tractor's skid plate 23 cm "swallowed" on a hillside and 0 cm on the pad,
     * for geometry that had not moved relative to the rig at all.
     *
     * Body-local is also the *meaningful* frame: modules, superstructure and
     * wheels are all children of `body`, so their relationships are rigid there
     * by construction, and the only motion that survives is the motion that is
     * really happening — steering, suspension travel, the plough pivot. Terrain
     * clearance stays in world space, because the ground is not in this frame.
     */
    parts.body.updateWorldMatrix(true, true);
    const toBodyLocal = new THREE.Matrix4().copy(parts.body.matrixWorld).invert();
    const localMatrix = new THREE.Matrix4();
    const localBox = (mesh: THREE.Mesh): THREE.Box3 | null => {
      const geometry = mesh.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if (!geometry.boundingBox) return null;
      const box = new THREE.Box3().copy(geometry.boundingBox);
      // `Box3.applyMatrix4` rebuilds the box from the eight transformed corners,
      // which is what makes this exact rather than an approximation.
      return box.applyMatrix4(
        localMatrix.multiplyMatrices(toBodyLocal, mesh.matrixWorld),
      );
    };

    const structure: {
      part: string;
      box: THREE.Box3;
      host: THREE.Object3D;
      mountSurface: boolean;
    }[] = [];
    parts.root.traverse((object) => {
      if (
        !(object instanceof THREE.Mesh) ||
        object.userData.cameraSolid === false ||
        insideAModule(object)
      ) {
        return;
      }
      const box = localBox(object);
      if (!box || box.isEmpty()) return;
      structure.push({
        part: partLabel(object),
        box,
        host: object,
        mountSurface: object.userData.moduleMountSurface === true,
      });
    });

    const fitted = [...rig.modules].sort() as ModuleId[];
    const offered = MODULE_IDS.filter((moduleId) =>
      MODULES[moduleId].fits.includes(rigId),
    );
    const samples: RigModuleVisualSample[] = [];
    const visibilityMismatches: string[] = [];
    const centre = new THREE.Vector3();
    const bodyOrigin = new THREE.Vector3();
    parts.root.getWorldPosition(bodyOrigin);

    /**
     * Every module visual measured once, before any of them is compared.
     *
     * Module-vs-module fouling is what the pontoon/lug-tread bug was, so the
     * boxes have to exist as a set before the pairwise pass can run. Invisible
     * groups are measured too — their bounds are recorded so an unfitted module
     * still reports its geometry — but only visible ones are eligible to foul,
     * because a collision the player cannot see is not one they can complain of.
     *
     * `meshes` is the list every overlap test actually uses, in the body's frame.
     * The world-space group box is kept for bounds, ground gap and offset, where
     * "the whole module's extent, where it actually is" is the honest quantity,
     * but it is far too coarse to ask "is this inside that": the lug tread's
     * group box is a filled cube spanning the entire wheel, and against the hull
     * box it reported half a metre of penetration for two parts that merely sit
     * side by side. `local` is the union of `meshes` — the same extent as `box`,
     * read in the frame the tread-vs-tyre comparison needs.
     */
    const measured: {
      moduleId: ModuleId;
      index: number;
      visual: THREE.Object3D;
      visible: boolean;
      box: THREE.Box3 | null;
      local: THREE.Box3 | null;
      meshes: THREE.Box3[];
    }[] = [];

    for (const moduleId of MODULE_IDS) {
      const visuals = parts.moduleVisuals[moduleId] ?? [];
      const isFitted = rig.modules.includes(moduleId);
      for (const [index, visual] of visuals.entries()) {
        // Effective visibility, not the flag: a module hidden by an invisible
        // ancestor is invisible to the player however its own flag reads.
        let visible = true;
        for (
          let node: THREE.Object3D | null = visual;
          node && visible;
          node = node.parent
        ) {
          visible = node.visible;
        }
        if (visible !== isFitted) {
          visibilityMismatches.push(
            `${moduleId}[${index}] visible=${visible} fitted=${isFitted}`,
          );
        }
        const box = new THREE.Box3().setFromObject(visual);
        const meshes: THREE.Box3[] = [];
        const local = new THREE.Box3();
        visual.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          const meshBox = localBox(object);
          if (!meshBox || meshBox.isEmpty()) return;
          meshes.push(meshBox);
          local.union(meshBox);
        });
        measured.push({
          moduleId,
          index,
          visual,
          visible,
          box: box.isEmpty() ? null : box,
          local: local.isEmpty() ? null : local,
          meshes,
        });
      }
    }

    /** Deepest penetration of any of `meshes` into `other`. */
    const deepestInto = (meshes: THREE.Box3[], other: THREE.Box3): number => {
      let deepest = 0;
      for (const mesh of meshes) {
        deepest = Math.max(deepest, penetrationDepth(mesh, other));
      }
      return deepest;
    };

    /**
     * How far a module's geometry escapes the mount box it was built inside.
     *
     * Measured from the same body-local per-mesh boxes every other overlap here
     * uses, offset by the group's own body-local position — which is the mount
     * centre, since the builder places the group there. Measuring in the *group's*
     * frame instead would divide out the scale `fitFormToEnvelope` applies and
     * report 0 for exactly the forms the clamp had to rescue, which is the one
     * reading this field exists to prevent.
     */
    const envelopeBreach = (
      visual: THREE.Object3D,
      meshes: THREE.Box3[],
    ): number | null => {
      const envelope = visual.userData.moduleEnvelope as
        | { width: number; height: number; depth: number }
        | undefined;
      if (!envelope) return null;
      const half = new THREE.Vector3(
        envelope.width / 2,
        envelope.height / 2,
        envelope.depth / 2,
      );
      const centre = visual.position;
      let worst = 0;
      for (const box of meshes) {
        worst = Math.max(
          worst,
          centre.x - half.x - box.min.x,
          box.max.x - centre.x - half.x,
          centre.y - half.y - box.min.y,
          box.max.y - centre.y - half.y,
          centre.z - half.z - box.min.z,
          box.max.z - centre.z - half.z,
        );
      }
      return Number(worst.toFixed(4));
    };

    /**
     * The uniform scale `fitFormToEnvelope` had to apply, or null for a tread.
     *
     * 1 means the form was authored to fit its box. Less means the clamp shrank it,
     * and module-visual acceptance treats that as an authoring failure rather than a
     * success — the module still renders legally, but smaller than designed.
     */
    const envelopeFit = (visual: THREE.Object3D): number | null => {
      const fit = visual.userData.moduleEnvelopeFit;
      return typeof fit === "number" ? Number(fit.toFixed(4)) : null;
    };

    for (const entry of measured) {
      const { moduleId, index, visual, visible, box, local, meshes } = entry;
      const anchor = visual.userData.moduleAnchor;
      const anchoredTo: RigModuleVisualSample["anchoredTo"] =
        anchor === "hull" || anchor === "wheel" ? anchor : "unknown";
      const label = `${partLabel(visual)}[${index}]`;

      if (!box) {
        samples.push({
          moduleId,
          label,
          anchoredTo,
          visible,
          worldMin: null,
          worldMax: null,
          groundGap: null,
          offsetFromRig: null,
          hostGap: null,
          hostOffset: null,
          envelopeBreach: envelopeBreach(visual, meshes),
          envelopeFit: envelopeFit(visual),
          structureOverlaps: [],
          moduleOverlaps: [],
        });
        continue;
      }
      box.getCenter(centre);

      // A wheel-anchored tread is *meant* to wrap the tyre and hub it rides on,
      // so its own wheel's meshes are excluded. What remains is reported but not
      // treated as a defect by the acceptance script — see `anchoredTo`.
      const ownWheel = anchoredTo === "wheel" ? visual.parent : null;
      const structureOverlaps = structure
        .filter(({ host }) => !isUnder(host, ownWheel))
        .map(({ part, box: other, mountSurface }) => ({
          part,
          depth: Number(deepestInto(meshes, other).toFixed(4)),
          mountSurface,
        }))
        .filter((hit) => hit.depth > STRUCTURE_CONTACT_TOLERANCE)
        .sort((left, right) => right.depth - left.depth);

      const moduleOverlaps = visible
        ? measured
            .filter(
              (other) => other !== entry && other.visible && other.box !== null,
            )
            .map((other) => {
              let depth = 0;
              for (const mesh of other.meshes) {
                depth = Math.max(depth, deepestInto(meshes, mesh));
              }
              return {
                module: `${other.moduleId}[${other.index}]`,
                depth: Number(depth.toFixed(4)),
              };
            })
            .filter((hit) => hit.depth > STRUCTURE_CONTACT_TOLERANCE)
            .sort((left, right) => right.depth - left.depth)
        : [];

      // The tyre this tread wraps, found the same way the ground-contact surface
      // finds it, and measured in the body's frame like everything else that is
      // rigid within the rig. Measuring against the tyre rather than the terrain
      // takes both suspension travel and slope out of the reading; measuring in
      // the body's frame takes the rig's pitch and roll out of it too.
      const hostTyre =
        anchoredTo === "wheel"
          ? (visual.parent?.getObjectByName("tyre") ?? null)
          : null;
      const hostBox =
        hostTyre instanceof THREE.Mesh ? localBox(hostTyre) : null;
      const hostCentre =
        hostBox && !hostBox.isEmpty()
          ? hostBox.getCenter(new THREE.Vector3())
          : null;
      const localCentre = local
        ? local.getCenter(new THREE.Vector3())
        : null;

      samples.push({
        moduleId,
        label,
        anchoredTo,
        visible,
        worldMin: [
          Number(box.min.x.toFixed(4)),
          Number(box.min.y.toFixed(4)),
          Number(box.min.z.toFixed(4)),
        ],
        worldMax: [
          Number(box.max.x.toFixed(4)),
          Number(box.max.y.toFixed(4)),
          Number(box.max.z.toFixed(4)),
        ],
        groundGap: Number(
          (box.min.y - this.world.terrain.height(centre.x, centre.z)).toFixed(4),
        ),
        offsetFromRig: Number(centre.distanceTo(bodyOrigin).toFixed(4)),
        hostGap:
          hostBox && !hostBox.isEmpty() && local
            ? Number((local.min.y - hostBox.min.y).toFixed(4))
            : null,
        hostOffset:
          hostCentre && localCentre
            ? Number(localCentre.distanceTo(hostCentre).toFixed(4))
            : null,
        envelopeBreach: envelopeBreach(visual, meshes),
        envelopeFit: envelopeFit(visual),
        structureOverlaps,
        moduleOverlaps,
      });
    }

    const rendered = new Set(
      Object.entries(parts.moduleVisuals)
        .filter(([, visuals]) => (visuals ?? []).length > 0)
        .map(([moduleId]) => moduleId as ModuleId),
    );

    return {
      rigId,
      fittedModules: fitted,
      offeredModules: offered,
      steeringAngle: Number(
        (this.feedbackFrames.get(rigId)?.steeringAngle ?? 0).toFixed(4),
      ),
      samples,
      missingVisuals: fitted.filter((moduleId) => !rendered.has(moduleId)),
      visibilityMismatches,
    };
  }

  /**
   * Expose presentation evidence without making rendered transforms game truth.
   * Browser acceptance uses this to prove that simulation telemetry reaches
   * animation/camera and that the operating-system motion preference is honored.
   */
  perceptionEvidence(state: GameState, rigId: RigId): RigPerceptionEvidence {
    const rig = state.rigs[rigId];
    const parts = this.rigs.get(rigId);
    if (!parts) throw new Error(`Missing rendered rig parts: ${rigId}`);
    const profile = effectiveProfile(rig.id, rig.modules);
    const feedback =
      this.feedbackFrames.get(rigId) ??
      deriveRigFeedback(rig, profile, this.reducedMotionQuery.matches);
    const expectedFocusOffset =
      state.cameraMode === "chase" ||
      state.cameraMode === "hood" ||
      state.cameraMode === "side"
        ? profile.camera.focusHeight
        : 0.8;
    const cameraFocusOffset =
      state.activeRigId === rigId && this.lastCameraFocusY !== null
        ? this.lastCameraFocusY - rig.y
        : null;

    return {
      rigId,
      reducedMotion: this.reducedMotionQuery.matches,
      steeringAngle: Number(feedback.steeringAngle.toFixed(4)),
      bodyRollOffset: Number(feedback.bodyRollOffset.toFixed(4)),
      bodyPitchOffset: Number(feedback.bodyPitchOffset.toFixed(4)),
      speedFovBoost: Number(feedback.speedFovBoost.toFixed(3)),
      cameraFocusOffset:
        cameraFocusOffset === null
          ? null
          : Number(cameraFocusOffset.toFixed(4)),
      expectedFocusOffset: Number(expectedFocusOffset.toFixed(4)),
      cameraFocusContractMet:
        cameraFocusOffset !== null &&
        Math.abs(cameraFocusOffset - expectedFocusOffset) < 0.001,
      visibleModules: Object.entries(parts.moduleVisuals)
        .filter(([, visuals]) => visuals.some((visual) => visual.visible))
        .map(([moduleId]) => moduleId as ModuleId),
    };
  }

  /** Force a full prop and furrow rebuild, after a reset or a save restore. */
  invalidate(state: GameState): void {
    this.renderedFurrows = 0;
    this.lastDeformCount = -1;
    this.lastRouteRevision = -1;
    this.lastRoadIncidentRevision = -1;
    this.lastFieldConditionRevision = -1;
    this.lastHabitatFieldRevision = -1;
    this.lastHabitatEcologyRevision = -1;
    this.lastHabitatWorldHour = -1;
    this.habitatAnchorX = Number.POSITIVE_INFINITY;
    this.habitatAnchorZ = Number.POSITIVE_INFINITY;
    this.fieldColourAnchorX = Number.POSITIVE_INFINITY;
    this.fieldColourAnchorZ = Number.POSITIVE_INFINITY;
    this.propAnchorX = Number.POSITIVE_INFINITY;
    this.propAnchorZ = Number.POSITIVE_INFINITY;
    this.refreshProps(state);
    this.rebuildTerrainHeights();
    this.syncCommunityPassageDecks(state);
    this.syncHabitatLife(state);
  }

  /** Re-sample the whole terrain mesh. Used after a reset clears deformation. */
  private rebuildTerrainHeights(): void {
    const size = this.terrainCells + 1;
    const position = this.terrainMesh.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    this.terrainHeights = this.world.terrain.sampleHeightGrid(
      this.terrainOrigin,
      this.terrainOrigin,
      this.terrainCells,
      TERRAIN_STEP,
    );
    for (let index = 0; index < size * size; index += 1) {
      position.setY(index, this.terrainHeights[index]!);
    }
    position.needsUpdate = true;
    this.terrainMesh.geometry.computeVertexNormals();
    this.refreshTerrainColourRegion(0, 0, WORLD_RADIUS + 12);
  }

  dispose(): void {
    window.removeEventListener("resize", this.resize);
    vehicleAnimationSystem.dispose();
    // `WebGLRenderer.dispose()` (below) only clears the renderer's own
    // internal WeakMap-based bookkeeping (see WebGLProperties.dispose() in
    // three's source) — it never calls gl.deleteBuffer()/gl.deleteTexture()
    // on a geometry or material that isn't disposed itself. GLTF-loaded
    // runtime bridge roots must be disposed explicitly, or their GPU buffers
    // are simply abandoned rather than freed.
    this.loadedRuntimeBridgeRoots.forEach((root) => disposeObjectGraph(root));
    this.loadedRuntimeBridgeRoots.clear();
    this.habitatBodyGeometry.dispose();
    this.habitatWingGeometry.dispose();
    this.habitatLegGeometry.dispose();
    this.habitatBirdMaterial.dispose();
    this.habitatCorvidMaterial.dispose();
    this.habitatGrazerMaterial.dispose();
    if (this.rainPoints) {
      this.rainPoints.geometry.dispose();
      (this.rainPoints.material as THREE.Material).dispose();
    }
    this.renderer.dispose();
  }
}
