/**
 * Authored world layout for Rigs Unbound.
 *
 * This module is **data, not behaviour**: it is the authored half of the
 * "procedural inside authored rules" contract in ADR-0007. `terrain.ts` reads
 * it to constrain a noise field; `contracts.ts` reads it for discovery
 * definitions; the renderer reads it to place set dressing. Nothing here may
 * import terrain or state, so the dependency order stays
 * `noise → world → terrain → contracts → state → renderer`.
 *
 * Under motto v4 §0.8 the tables below are production data: they decide
 * reachability, difficulty gating, and whether the spawn point is inside a
 * cliff. Terrain tests assert their invariants rather than trusting them.
 */

import type { RigId } from "./rig-ids";

/** Half-width of the simulated world, in metres. The world is a disc, not a box. */
export const WORLD_RADIUS = 250;

/** Numerical safety clamp. The player should meet the boundary ridge, never this. */
export const WORLD_LIMIT = 246;

/** Elevation of standing water. Terrain below this is flooded. */
export const WATER_LEVEL = 0;

/** Radius at which the impassable boundary ridge starts to rise. */
export const RIDGE_INNER_RADIUS = 196;

/** Radius at which the boundary ridge reaches full height. */
export const RIDGE_OUTER_RADIUS = 244;

/** Peak additional elevation contributed by the boundary ridge. */
export const RIDGE_HEIGHT = 78;

export type SurfaceId =
  "track" | "grass" | "tilled" | "rock" | "sand" | "mud" | "water";

export interface SurfaceMaterial {
  id: SurfaceId;
  displayName: string;
  /**
   * Traction coefficient. Multiplies the wheel-load limit on both drive force
   * and cornering force, so low grip produces wheelspin *and* understeer.
   */
  grip: number;
  /** Rolling-resistance multiplier. Above 1 costs top speed and climb ability. */
  rollingDrag: number;
  /** Whether a plough or heavy wheel can leave a persistent height delta. */
  deformable: boolean;
  /** Base render colour, used for terrain vertex colours. */
  color: number;
  /** How strongly this surface throws dust/spray when a wheel slips. */
  spray: number;
}

/**
 * Surface table. Grip and drag are the two numbers that make a tractor and a
 * buggy feel like different machines on the same ground, so they are tuned as a
 * set: `sand` and `mud` are where high mass and low gearing win, `track` is
 * where light mass and high power win.
 */
export const SURFACES: Readonly<Record<SurfaceId, SurfaceMaterial>> = {
  track: {
    id: "track",
    displayName: "Hardpan track",
    grip: 1,
    rollingDrag: 0.85,
    deformable: false,
    color: 0x6c6151,
    spray: 0.35,
  },
  grass: {
    id: "grass",
    displayName: "Pasture",
    grip: 0.82,
    rollingDrag: 1.05,
    deformable: true,
    color: 0x64763f,
    spray: 0.5,
  },
  tilled: {
    id: "tilled",
    displayName: "Tilled soil",
    // 0.52, not 0.68. The lug/slick crossover sits at a surface grip of about
    // 0.55: above it the buggy's higher `tireGrip` wins, below it the tractor's
    // `lugBonus` wins. At 0.68 the buggy had marginally *more* grip on freshly
    // tilled soil than the tractor did, which contradicts the whole point of the
    // field being the tractor's home ground. Verified in the browser:
    // tractor 0.801 / buggy 0.821 before, tractor ahead after.
    grip: 0.52,
    rollingDrag: 1.55,
    deformable: true,
    color: 0x7c6235,
    spray: 0.9,
  },
  rock: {
    id: "rock",
    displayName: "Bare rock",
    grip: 0.96,
    rollingDrag: 1.15,
    deformable: false,
    color: 0x77706a,
    spray: 0.15,
  },
  sand: {
    id: "sand",
    displayName: "Dust bowl",
    grip: 0.54,
    rollingDrag: 2.35,
    deformable: true,
    color: 0xa4894f,
    spray: 1.25,
  },
  mud: {
    id: "mud",
    displayName: "Churned mud",
    grip: 0.38,
    rollingDrag: 3.1,
    deformable: true,
    color: 0x4a3f2c,
    spray: 1.5,
  },
  water: {
    id: "water",
    displayName: "Standing water",
    grip: 0.16,
    rollingDrag: 5.8,
    deformable: false,
    color: 0x2c4a55,
    spray: 1.8,
  },
} as const;

export type BiomeId =
  "meadow" | "farmland" | "badlands" | "grove" | "highland" | "marsh";

/**
 * The stable verbs authored sites promise to the player.
 *
 * This is content vocabulary, not an activity implementation registry. Keeping
 * it owned by the world schema prevents a typo in a landmark from drifting away
 * from discovery, rumor, navigation, and future validated content-pack rules.
 */
export const WORLD_SITE_VERBS = [
  "restore",
  "till",
  "haul",
  "tow",
  "shrink",
  "wade",
  "ascend",
] as const;

export type WorldSiteVerb = (typeof WORLD_SITE_VERBS)[number];

export interface BiomeDefinition {
  id: BiomeId;
  displayName: string;
  /** Bias applied to the moisture channel; drives the surface-selection rules. */
  moistureBias: number;
  /** Multiplier on mid-frequency terrain detail. High values read as broken ground. */
  reliefScale: number;
}

export const BIOMES: Readonly<Record<BiomeId, BiomeDefinition>> = {
  meadow: {
    id: "meadow",
    displayName: "Home Valley",
    moistureBias: 0.06,
    reliefScale: 0.7,
  },
  farmland: {
    id: "farmland",
    displayName: "Terrace farmland",
    moistureBias: 0.1,
    reliefScale: 0.35,
  },
  badlands: {
    id: "badlands",
    displayName: "Badlands",
    moistureBias: -0.34,
    reliefScale: 1.5,
  },
  grove: {
    id: "grove",
    displayName: "Grove basin",
    moistureBias: 0.2,
    reliefScale: 0.85,
  },
  highland: {
    id: "highland",
    displayName: "Highland",
    moistureBias: -0.12,
    reliefScale: 1.25,
  },
  marsh: {
    id: "marsh",
    displayName: "Sunken flats",
    moistureBias: 0.46,
    reliefScale: 0.4,
  },
} as const;

/**
 * An authored site. Sites are simultaneously terrain anchors (they force a local
 * elevation so the place is buildable and reachable), discovery targets, and
 * biome seeds. Keeping those three roles on one record is deliberate: it makes
 * it impossible to author a landmark that the terrain then buries.
 */
export interface WorldSite {
  id: string;
  name: string;
  /** The verb this place promises. Shown in the opportunity rail. */
  verb: WorldSiteVerb;
  x: number;
  z: number;
  /** Radius within which the site counts as discovered. */
  discoverRadius: number;
  /**
   * Terrain anchor radius, in metres. Beyond this the site stops influencing
   * elevation.
   *
   * Kept close to the structure footprint on purpose. Large radii flatten tens of
   * metres at full strength and then stop, which is what made each site read as a
   * circular island stamped onto procedural filler. Small radii give a buildable
   * pad with a long, gentle transition into the surrounding land.
   */
  anchorRadius: number;
  /** Elevation the anchor pulls terrain toward, in metres. */
  elevation: number;
  /** 0..1 blend authority. 1 forces the elevation exactly at the centre. */
  anchorStrength: number;
  biome: BiomeId;
  /** Surface forced inside `serviceRadius`, if any. */
  padSurface?: SurfaceId;
  /** Radius of the forced-surface service area. */
  serviceRadius?: number;
  /** True when this site can install modules and repair condition. */
  workshop?: boolean;
}

/**
 * The authored site set.
 *
 * Layout intent, in one line each:
 * - Home Valley is flat, safe, central, and has the workshop.
 * - Long Furrow is the tractor's home ground: soft tilled soil, low relief.
 * - Quarry Shelf is the mid-distance stepping stone on the main track.
 * - Rustline and Toy Grove are the two far ends of the authored track network.
 * - Sunken Flats is deliberately *low* — the marsh punishes low grip.
 * - Launch Ridge is deliberately *high and roadless* — it is the terrain gate.
 */
export const WORLD_SITES: readonly WorldSite[] = [
  {
    id: "home-silo",
    name: "Home Silo",
    verb: "restore",
    x: 0,
    z: 12,
    discoverRadius: 16,
    anchorRadius: 46,
    elevation: 1.8,
    anchorStrength: 0.99,
    biome: "meadow",
    padSurface: "track",
    serviceRadius: 15,
    workshop: true,
  },
  {
    id: "long-furrow",
    name: "Long Furrow",
    verb: "till",
    x: 18,
    z: -46,
    discoverRadius: 22,
    anchorRadius: 34,
    elevation: 1.1,
    anchorStrength: 0.98,
    biome: "farmland",
    padSurface: "tilled",
    serviceRadius: 30,
  },
  {
    id: "quarry-shelf",
    name: "Quarry Shelf",
    verb: "haul",
    x: 82,
    z: 44,
    discoverRadius: 20,
    anchorRadius: 22,
    elevation: 12,
    anchorStrength: 0.97,
    biome: "highland",
    padSurface: "rock",
    serviceRadius: 18,
  },
  {
    id: "salvage-yard",
    name: "Rustline Salvage",
    verb: "tow",
    x: 148,
    z: -108,
    discoverRadius: 24,
    anchorRadius: 24,
    elevation: 9.5,
    anchorStrength: 0.97,
    biome: "badlands",
    padSurface: "sand",
    serviceRadius: 22,
  },
  {
    id: "toy-grove",
    name: "Toy Grove",
    verb: "shrink",
    x: 110,
    z: 148,
    discoverRadius: 24,
    anchorRadius: 22,
    elevation: 4.2,
    anchorStrength: 0.96,
    biome: "grove",
    padSurface: "grass",
    serviceRadius: 20,
  },
  {
    id: "sunken-flats",
    name: "Sunken Flats",
    verb: "wade",
    x: -126,
    z: -130,
    discoverRadius: 26,
    anchorRadius: 32,
    elevation: -1.5,
    anchorStrength: 0.98,
    biome: "marsh",
  },
  {
    id: "launch-ridge",
    name: "Launch Ridge",
    verb: "ascend",
    x: -158,
    z: 140,
    discoverRadius: 26,
    anchorRadius: 26,
    elevation: 46,
    anchorStrength: 0.985,
    biome: "highland",
    padSurface: "rock",
    serviceRadius: 22,
  },
] as const satisfies readonly WorldSite[];

/** Stable IDs derived from the one canonical authored site table. */
export type WorldSiteId = (typeof WORLD_SITES)[number]["id"];

export function findSite(id: string): WorldSite | undefined {
  return WORLD_SITES.find((site) => site.id === id);
}

/** Canonical service-area predicate shared by workshop and guidance queries. */
export function isWithinSiteServiceArea(
  site: WorldSite,
  x: number,
  z: number,
): boolean {
  return (
    Math.hypot(x - site.x, z - site.z) <=
    (site.serviceRadius ?? site.discoverRadius)
  );
}

/** A site id that is guaranteed to exist, for spawn and workshop lookups. */
export const HOME_SITE = WORLD_SITES[0]!;

/**
 * Authored structure geometry shared by rendering and spatial queries.
 *
 * Camera collision previously tried to infer the world from terrain alone while
 * the Home Silo buildings existed only as private renderer coordinates. Keeping
 * the visual dimensions and query proxy on the same record prevents those two
 * views of the world from drifting apart. Coordinates are local to the owning
 * site's terrain-grounded group.
 */
export type WorldStructureShape =
  | {
      kind: "box";
      width: number;
      height: number;
      depth: number;
    }
  | {
      kind: "cylinder";
      radius: number;
      radiusTop?: number;
      radiusBottom?: number;
      height: number;
      radialSegments: number;
    }
  | {
      kind: "cone";
      radius: number;
      height: number;
      radialSegments: number;
      scaleZ?: number;
    };

export interface WorldStructurePart {
  id: string;
  siteId: WorldSiteId;
  localX: number;
  localY: number;
  localZ: number;
  shape: WorldStructureShape;
  color: number;
  roughness?: number;
  rotationY?: number;
  /** Low pads do not need to shorten a camera boom. */
  cameraOccluder: boolean;
  /** True when a moving rig must remain outside this ground-level part. */
  rigCollider: boolean;
  /**
   * True for the one part per site that carries the unvisited signal.
   *
   * It is lit while the site is undiscovered and goes dark once the player has
   * driven there. The signal has to hang on a structure that belongs to the place:
   * an identical marker at every site makes a valley read as an instrumented test
   * fixture rather than somewhere people work.
   */
  discoverySignal?: boolean;
}

export const WORLD_STRUCTURE_PARTS: readonly WorldStructurePart[] = [
  {
    id: "home-barn",
    siteId: "home-silo",
    localX: -9,
    localY: 2.75,
    localZ: 3,
    shape: { kind: "box", width: 9, height: 5.5, depth: 7.5 },
    color: 0x7d352a,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "home-barn-roof",
    siteId: "home-silo",
    localX: -9,
    localY: 6.6,
    localZ: 3,
    shape: {
      kind: "cone",
      radius: 6.6,
      height: 2.6,
      radialSegments: 4,
      scaleZ: 0.8,
    },
    color: 0x3b3935,
    roughness: 0.95,
    rotationY: Math.PI / 4,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "home-silo-body",
    siteId: "home-silo",
    localX: 6,
    localY: 5.5,
    localZ: -2,
    shape: { kind: "cylinder", radius: 2.6, height: 11, radialSegments: 12 },
    color: 0xb6a88e,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "home-silo-roof",
    siteId: "home-silo",
    localX: 6,
    localY: 12.2,
    localZ: -2,
    shape: { kind: "cone", radius: 2.9, height: 2.4, radialSegments: 12 },
    color: 0x6c5d4c,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "home-workshop-pad",
    siteId: "home-silo",
    localX: 0,
    localY: 0.11,
    localZ: 0,
    shape: { kind: "cylinder", radius: 9, height: 0.22, radialSegments: 28 },
    color: 0x53504a,
    roughness: 0.9,
    cameraOccluder: false,
    rigCollider: false,
  },
  {
    id: "home-gantry-left",
    siteId: "home-silo",
    localX: -4.4,
    localY: 2.75,
    localZ: 0,
    shape: { kind: "box", width: 0.5, height: 5.5, depth: 0.5 },
    color: 0x8a8378,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "home-gantry-right",
    siteId: "home-silo",
    localX: 4.4,
    localY: 2.75,
    localZ: 0,
    shape: { kind: "box", width: 0.5, height: 5.5, depth: 0.5 },
    color: 0x8a8378,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "home-gantry-top",
    siteId: "home-silo",
    localX: 0,
    localY: 5.6,
    localZ: 0,
    shape: { kind: "box", width: 9.5, height: 0.5, depth: 0.6 },
    color: 0x8a8378,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "launch-rocket-body",
    siteId: "launch-ridge",
    localX: 0,
    localY: 7,
    localZ: 0,
    shape: {
      kind: "cylinder",
      radius: 1.5,
      radiusTop: 1.3,
      radiusBottom: 1.5,
      height: 11,
      radialSegments: 12,
    },
    color: 0xead8b8,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "launch-rocket-nose",
    siteId: "launch-ridge",
    localX: 0,
    localY: 14.3,
    localZ: 0,
    shape: { kind: "cone", radius: 1.3, height: 3.6, radialSegments: 12 },
    color: 0xb94f32,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "launch-rocket-fin-left",
    siteId: "launch-ridge",
    localX: 1.5,
    localY: 2.6,
    localZ: 0,
    shape: { kind: "box", width: 0.3, height: 3, depth: 3 },
    color: 0xb94f32,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "launch-rocket-fin-right",
    siteId: "launch-ridge",
    localX: -1.5,
    localY: 2.6,
    localZ: 0,
    shape: { kind: "box", width: 0.3, height: 3, depth: 3 },
    color: 0xb94f32,
    cameraOccluder: true,
    rigCollider: true,
  },
  // Salvage yard: crates stacked off a clear apron, under a gantry that reads
  // from the far side of the valley. Previously renderer-only scenery that rigs
  // drove straight through.
  {
    id: "salvage-crate-0",
    siteId: "salvage-yard",
    localX: -4.4,
    localY: 0.7,
    localZ: 8.2,
    shape: { kind: "box", width: 2.6, height: 1.4, depth: 2.1 },
    color: 0x8c3f2d,
    rotationY: -0.42,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-1",
    siteId: "salvage-yard",
    localX: -1.5,
    localY: 1.1,
    localZ: 8.2,
    shape: { kind: "box", width: 2.6, height: 2.2, depth: 2.1 },
    color: 0x76513e,
    rotationY: -0.28,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-2",
    siteId: "salvage-yard",
    localX: 1.4,
    localY: 1.5,
    localZ: 8.2,
    shape: { kind: "box", width: 2.6, height: 3.0, depth: 2.1 },
    color: 0x8c3f2d,
    rotationY: -0.14,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-3",
    siteId: "salvage-yard",
    localX: 4.3,
    localY: 0.7,
    localZ: 8.2,
    shape: { kind: "box", width: 2.6, height: 1.4, depth: 2.1 },
    color: 0x76513e,
    rotationY: 0.0,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-4",
    siteId: "salvage-yard",
    localX: -4.4,
    localY: 1.1,
    localZ: 10.8,
    shape: { kind: "box", width: 2.6, height: 2.2, depth: 2.1 },
    color: 0x8c3f2d,
    rotationY: 0.14,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-5",
    siteId: "salvage-yard",
    localX: -1.5,
    localY: 1.5,
    localZ: 10.8,
    shape: { kind: "box", width: 2.6, height: 3.0, depth: 2.1 },
    color: 0x76513e,
    rotationY: 0.28,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-6",
    siteId: "salvage-yard",
    localX: 1.4,
    localY: 0.7,
    localZ: 10.8,
    shape: { kind: "box", width: 2.6, height: 1.4, depth: 2.1 },
    color: 0x8c3f2d,
    rotationY: 0.42,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-crate-7",
    siteId: "salvage-yard",
    localX: 4.3,
    localY: 1.1,
    localZ: 10.8,
    shape: { kind: "box", width: 2.6, height: 2.2, depth: 2.1 },
    color: 0x76513e,
    rotationY: 0.56,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-arch-left",
    siteId: "salvage-yard",
    localX: -3.8,
    localY: 3,
    localZ: -6,
    shape: { kind: "box", width: 0.8, height: 6, depth: 0.8 },
    color: 0x55382f,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-arch-right",
    siteId: "salvage-yard",
    localX: 3.8,
    localY: 3,
    localZ: -6,
    shape: { kind: "box", width: 0.8, height: 6, depth: 0.8 },
    color: 0x55382f,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-arch-top",
    siteId: "salvage-yard",
    localX: 0,
    localY: 6,
    localZ: -6,
    shape: { kind: "box", width: 8.5, height: 0.8, depth: 0.8 },
    color: 0x55382f,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "salvage-gantry-left",
    siteId: "salvage-yard",
    localX: -7.5,
    localY: 5.2,
    localZ: 9.5,
    shape: { kind: "box", width: 1.1, height: 10.4, depth: 1.1 },
    color: 0x6d6a5f,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-gantry-right",
    siteId: "salvage-yard",
    localX: 7.5,
    localY: 5.2,
    localZ: 9.5,
    shape: { kind: "box", width: 1.1, height: 10.4, depth: 1.1 },
    color: 0x6d6a5f,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "salvage-gantry-beam",
    siteId: "salvage-yard",
    localX: 0,
    localY: 10.9,
    localZ: 9.5,
    shape: { kind: "box", width: 17, height: 1.2, depth: 1.4 },
    color: 0x7d7a6c,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "salvage-gantry-hoist",
    siteId: "salvage-yard",
    localX: -1.6,
    localY: 8.9,
    localZ: 9.5,
    shape: { kind: "box", width: 1.8, height: 2.6, depth: 1.8 },
    color: 0x8f4a2f,
    cameraOccluder: false,
    rigCollider: false,
  },
  {
    id: "salvage-gantry-lamp",
    siteId: "salvage-yard",
    localX: 0,
    localY: 12.1,
    localZ: 9.5,
    shape: {
      kind: "cylinder",
      radius: 0.42,
      radiusTop: 0.42,
      radiusBottom: 0.42,
      height: 0.9,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },

  // Toy grove: loose blocks plus a stacked tower. Giant toys, so the silhouette
  // is unmistakable at range and nothing about it reads as instrumentation.
  {
    id: "toy-block-0",
    siteId: "toy-grove",
    localX: 6.0,
    localY: 1.4,
    localZ: -3,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0xc8553d,
    rotationY: 0.0,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-1",
    siteId: "toy-grove",
    localX: 9.0,
    localY: 1.4,
    localZ: -3,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0x4d8a92,
    rotationY: 0.22,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-2",
    siteId: "toy-grove",
    localX: 12.0,
    localY: 1.4,
    localZ: -3,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0xe1ad52,
    rotationY: 0.44,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-3",
    siteId: "toy-grove",
    localX: 15.0,
    localY: 1.4,
    localZ: -3,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0x77578f,
    rotationY: 0.66,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-4",
    siteId: "toy-grove",
    localX: 6.0,
    localY: 1.4,
    localZ: 0,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0xc8553d,
    rotationY: 0.88,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-5",
    siteId: "toy-grove",
    localX: 9.0,
    localY: 1.4,
    localZ: 0,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0x4d8a92,
    rotationY: 1.1,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-6",
    siteId: "toy-grove",
    localX: 12.0,
    localY: 1.4,
    localZ: 0,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0xe1ad52,
    rotationY: 1.32,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-7",
    siteId: "toy-grove",
    localX: 15.0,
    localY: 4.2,
    localZ: 0,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0x77578f,
    rotationY: 1.54,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-8",
    siteId: "toy-grove",
    localX: 6.0,
    localY: 4.2,
    localZ: 3,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0xc8553d,
    rotationY: 1.76,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-block-9",
    siteId: "toy-grove",
    localX: 9.0,
    localY: 4.2,
    localZ: 3,
    shape: { kind: "box", width: 2.8, height: 2.8, depth: 2.8 },
    color: 0x4d8a92,
    rotationY: 1.98,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-tower-0",
    siteId: "toy-grove",
    localX: -8.5,
    localY: 1.75,
    localZ: -4.5,
    shape: { kind: "box", width: 3.4, height: 3.4, depth: 3.4 },
    color: 0x4d8a92,
    rotationY: -0.36,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "toy-tower-1",
    siteId: "toy-grove",
    localX: -8.5,
    localY: 5.25,
    localZ: -4.5,
    shape: { kind: "box", width: 3.4, height: 3.4, depth: 3.4 },
    color: 0xe1ad52,
    rotationY: -0.18,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "toy-tower-2",
    siteId: "toy-grove",
    localX: -8.5,
    localY: 8.75,
    localZ: -4.5,
    shape: { kind: "box", width: 3.4, height: 3.4, depth: 3.4 },
    color: 0x77578f,
    rotationY: 0.0,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "toy-tower-3",
    siteId: "toy-grove",
    localX: -8.5,
    localY: 12.25,
    localZ: -4.5,
    shape: { kind: "box", width: 3.4, height: 3.4, depth: 3.4 },
    color: 0xc8553d,
    rotationY: 0.18,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "toy-tower-4",
    siteId: "toy-grove",
    localX: -8.5,
    localY: 15.75,
    localZ: -4.5,
    shape: { kind: "box", width: 3.4, height: 3.4, depth: 3.4 },
    color: 0x4d8a92,
    rotationY: 0.36,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "toy-tower-lamp",
    siteId: "toy-grove",
    localX: -8.5,
    localY: 19.3,
    localZ: -4.5,
    shape: {
      kind: "cylinder",
      radius: 0.45,
      radiusTop: 0.45,
      radiusBottom: 0.45,
      height: 1.0,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },

  // Quarry shelf: cut slabs and a crusher hopper on legs. The hopper tapers
  // downward, which is why it is a cylinder with an inset top rather than a cone.
  {
    id: "quarry-slab-0",
    siteId: "quarry-shelf",
    localX: -15.1,
    localY: 0.45,
    localZ: -1.7,
    shape: { kind: "box", width: 4.2, height: 0.9, depth: 3.2 },
    color: 0x8b8278,
    rotationY: 0.0,
    cameraOccluder: false,
    rigCollider: true,
  },
  {
    id: "quarry-slab-1",
    siteId: "quarry-shelf",
    localX: -10.5,
    localY: 0.45,
    localZ: -1.7,
    shape: { kind: "box", width: 4.2, height: 0.9, depth: 3.2 },
    color: 0x8b8278,
    rotationY: 0.09,
    cameraOccluder: false,
    rigCollider: true,
  },
  {
    id: "quarry-slab-2",
    siteId: "quarry-shelf",
    localX: -5.9,
    localY: 0.45,
    localZ: -1.7,
    shape: { kind: "box", width: 4.2, height: 0.9, depth: 3.2 },
    color: 0x8b8278,
    rotationY: 0.18,
    cameraOccluder: false,
    rigCollider: true,
  },
  {
    id: "quarry-slab-3",
    siteId: "quarry-shelf",
    localX: -15.1,
    localY: 1.35,
    localZ: 1.8,
    shape: { kind: "box", width: 4.2, height: 0.9, depth: 3.2 },
    color: 0x8b8278,
    rotationY: 0.27,
    cameraOccluder: false,
    rigCollider: true,
  },
  {
    id: "quarry-slab-4",
    siteId: "quarry-shelf",
    localX: -10.5,
    localY: 1.35,
    localZ: 1.8,
    shape: { kind: "box", width: 4.2, height: 0.9, depth: 3.2 },
    color: 0x8b8278,
    rotationY: 0.36,
    cameraOccluder: false,
    rigCollider: true,
  },
  {
    id: "quarry-slab-5",
    siteId: "quarry-shelf",
    localX: -5.9,
    localY: 1.35,
    localZ: 1.8,
    shape: { kind: "box", width: 4.2, height: 0.9, depth: 3.2 },
    color: 0x8b8278,
    rotationY: 0.45,
    cameraOccluder: false,
    rigCollider: true,
  },
  {
    id: "quarry-hopper-leg-nn",
    siteId: "quarry-shelf",
    localX: 7.3,
    localY: 3.6,
    localZ: -3.2,
    shape: { kind: "box", width: 0.75, height: 7.2, depth: 0.75 },
    color: 0x5f5b52,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "quarry-hopper-leg-pn",
    siteId: "quarry-shelf",
    localX: 13.7,
    localY: 3.6,
    localZ: -3.2,
    shape: { kind: "box", width: 0.75, height: 7.2, depth: 0.75 },
    color: 0x5f5b52,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "quarry-hopper-leg-np",
    siteId: "quarry-shelf",
    localX: 7.3,
    localY: 3.6,
    localZ: 3.2,
    shape: { kind: "box", width: 0.75, height: 7.2, depth: 0.75 },
    color: 0x5f5b52,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "quarry-hopper-leg-pp",
    siteId: "quarry-shelf",
    localX: 13.7,
    localY: 3.6,
    localZ: 3.2,
    shape: { kind: "box", width: 0.75, height: 7.2, depth: 0.75 },
    color: 0x5f5b52,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "quarry-hopper",
    siteId: "quarry-shelf",
    localX: 10.5,
    localY: 9.6,
    localZ: 0,
    shape: {
      kind: "cylinder",
      radius: 4.6,
      radiusTop: 1.3,
      radiusBottom: 4.6,
      height: 4.8,
      radialSegments: 6,
    },
    color: 0x9a8f80,
    roughness: 0.9,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "quarry-hopper-cap",
    siteId: "quarry-shelf",
    localX: 10.5,
    localY: 12.4,
    localZ: 0,
    shape: { kind: "box", width: 9.4, height: 0.7, depth: 9.4 },
    color: 0x6c665c,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "quarry-hopper-lamp",
    siteId: "quarry-shelf",
    localX: 10.5,
    localY: 13.3,
    localZ: 0,
    shape: {
      kind: "cylinder",
      radius: 0.44,
      radiusTop: 0.44,
      radiusBottom: 0.44,
      height: 0.95,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },

  // Long furrow: an irrigation standpipe. A working field needs water more than
  // it needs a marker, and a tank on a pipe is visible over the whole terrace.
  {
    id: "furrow-standpipe",
    siteId: "long-furrow",
    localX: -11,
    localY: 6.6,
    localZ: 6,
    shape: {
      kind: "cylinder",
      radius: 0.7,
      radiusTop: 0.55,
      radiusBottom: 0.7,
      height: 13.2,
      radialSegments: 10,
    },
    color: 0x8a9095,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "furrow-tank",
    siteId: "long-furrow",
    localX: -11,
    localY: 14.4,
    localZ: 6,
    shape: {
      kind: "cylinder",
      radius: 2.6,
      radiusTop: 2.6,
      radiusBottom: 2.6,
      height: 2.6,
      radialSegments: 12,
    },
    color: 0x3f5b46,
    roughness: 0.85,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "furrow-tank-cap",
    siteId: "long-furrow",
    localX: -11,
    localY: 16.4,
    localZ: 6,
    shape: { kind: "cone", radius: 2.8, height: 1.6, radialSegments: 12 },
    color: 0x2f4436,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "furrow-tank-lamp",
    siteId: "long-furrow",
    localX: -11,
    localY: 17.6,
    localZ: 6,
    shape: {
      kind: "cylinder",
      radius: 0.4,
      radiusTop: 0.4,
      radiusBottom: 0.4,
      height: 0.9,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },

  // Sunken flats: a platform on stilts. Everything else here is under water, so
  // the only thing that can carry a signal is something standing above it.
  {
    id: "flats-stilt-nn",
    siteId: "sunken-flats",
    localX: 6.4,
    localY: 4.6,
    localZ: -9.6,
    shape: {
      kind: "cylinder",
      radius: 0.42,
      radiusTop: 0.34,
      radiusBottom: 0.42,
      height: 9.2,
      radialSegments: 8,
    },
    color: 0x6b6252,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "flats-stilt-pn",
    siteId: "sunken-flats",
    localX: 11.6,
    localY: 4.6,
    localZ: -9.6,
    shape: {
      kind: "cylinder",
      radius: 0.42,
      radiusTop: 0.34,
      radiusBottom: 0.42,
      height: 9.2,
      radialSegments: 8,
    },
    color: 0x6b6252,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "flats-stilt-np",
    siteId: "sunken-flats",
    localX: 6.4,
    localY: 4.6,
    localZ: -4.4,
    shape: {
      kind: "cylinder",
      radius: 0.42,
      radiusTop: 0.34,
      radiusBottom: 0.42,
      height: 9.2,
      radialSegments: 8,
    },
    color: 0x6b6252,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "flats-stilt-pp",
    siteId: "sunken-flats",
    localX: 11.6,
    localY: 4.6,
    localZ: -4.4,
    shape: {
      kind: "cylinder",
      radius: 0.42,
      radiusTop: 0.34,
      radiusBottom: 0.42,
      height: 9.2,
      radialSegments: 8,
    },
    color: 0x6b6252,
    cameraOccluder: true,
    rigCollider: true,
  },
  {
    id: "flats-deck",
    siteId: "sunken-flats",
    localX: 9,
    localY: 9.5,
    localZ: -7,
    shape: { kind: "box", width: 7.4, height: 0.6, depth: 7.4 },
    color: 0x7a6a52,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "flats-hut",
    siteId: "sunken-flats",
    localX: 9.9,
    localY: 11.3,
    localZ: -7.8,
    shape: { kind: "box", width: 3, height: 3.1, depth: 2.8 },
    color: 0x4e6b6e,
    cameraOccluder: true,
    rigCollider: false,
  },
  {
    id: "flats-signal-post",
    siteId: "sunken-flats",
    localX: 6.9,
    localY: 11.9,
    localZ: -5.4,
    shape: {
      kind: "cylinder",
      radius: 0.28,
      radiusTop: 0.28,
      radiusBottom: 0.28,
      height: 4.2,
      radialSegments: 8,
    },
    color: 0x59554c,
    cameraOccluder: false,
    rigCollider: false,
  },
  {
    id: "flats-signal-lamp",
    siteId: "sunken-flats",
    localX: 6.9,
    localY: 14.4,
    localZ: -5.4,
    shape: {
      kind: "cylinder",
      radius: 0.44,
      radiusTop: 0.44,
      radiusBottom: 0.44,
      height: 1.0,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },

  // The two sites that already had authored structures need only the signal.
  {
    id: "home-silo-lamp",
    siteId: "home-silo",
    localX: 6,
    localY: 13.6,
    localZ: -2,
    shape: {
      kind: "cylinder",
      radius: 0.42,
      radiusTop: 0.42,
      radiusBottom: 0.42,
      height: 0.95,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },
  {
    id: "launch-ridge-lamp",
    siteId: "launch-ridge",
    localX: 0,
    localY: 15.2,
    localZ: -6,
    shape: {
      kind: "cylinder",
      radius: 0.44,
      radiusTop: 0.44,
      radiusBottom: 0.44,
      height: 1.0,
      radialSegments: 10,
    },
    color: 0xffb347,
    cameraOccluder: false,
    rigCollider: false,
    discoverySignal: true,
  },
] as const;

/**
 * Where each site's horizon signal physically is, derived from the authored part
 * that carries it.
 *
 * The lamp's world height needs the site's terrain height added at runtime, so this
 * table holds local offsets only. Deriving it means a landmark cannot be moved in
 * `WORLD_STRUCTURE_PARTS` while a second table keeps pointing at the old place.
 */
export interface SiteSignal {
  siteId: WorldSiteId;
  x: number;
  z: number;
  localY: number;
}

export const SITE_SIGNALS: readonly SiteSignal[] = WORLD_SITES.flatMap(
  (site) => {
    const part = WORLD_STRUCTURE_PARTS.find(
      (candidate) =>
        candidate.siteId === site.id && candidate.discoverySignal === true,
    );
    if (!part) return [];
    return [
      {
        siteId: site.id,
        x: site.x + part.localX,
        z: site.z + part.localZ,
        // Top of the lamp: a signal is seen over a rise by its highest point.
        localY:
          part.localY +
          (part.shape.kind === "cylinder" ? part.shape.height * 0.5 : 0),
      },
    ];
  },
);

export interface RigHomeBerth {
  rigId: RigId;
  /** World-space berth centre. */
  x: number;
  z: number;
  heading: number;
  label: string;
}

/**
 * Canonical first-session and emergency-recovery berths.
 *
 * All three sit on the south side of the Home Silo service pad, clear of the
 * barn, silo, and gantry. Their spacing is wider than the rigs' collision
 * envelopes while keeping every machine inside the proximity-switch range.
 */
export const RIG_HOME_BERTHS: Readonly<Record<RigId, RigHomeBerth>> = {
  "utility-tractor": {
    rigId: "utility-tractor",
    x: HOME_SITE.x,
    z: HOME_SITE.z - 9,
    // Face roughly toward the guaranteed first cache. A new or recovered player
    // should see playable terrain and the next useful direction, not look back
    // through workshop geometry merely to exercise camera collision.
    heading: -Math.PI / 2,
    label: "Torque service berth",
  },
  "toy-buggy": {
    rigId: "toy-buggy",
    // Keep the guaranteed first-cache departure lane west of Torque clear now
    // that parked fleet bodies are real colliders rather than pass-through art.
    x: HOME_SITE.x + 7,
    z: HOME_SITE.z - 8,
    heading: Math.PI,
    label: "Spark service berth",
  },
  "marsh-skimmer": {
    rigId: "marsh-skimmer",
    x: HOME_SITE.x + 13,
    z: HOME_SITE.z - 7,
    heading: Math.PI,
    label: "Drift service berth",
  },
} as const;

export interface RouteSegment {
  from: WorldSiteId;
  to: WorldSiteId;
  /** Half-width of the graded corridor, in metres. */
  halfWidth: number;
}

/**
 * Authored track network.
 *
 * Routes do **not** flatten terrain — they suppress mid- and high-frequency
 * relief along the corridor and force the `track` surface. That keeps the large
 * shape of the land intact (a track still climbs a hill) while guaranteeing the
 * corridor is drivable, which is the cheap version of the exploration map's
 * "route clearance" validator.
 *
 * Launch Ridge is intentionally absent: the only way there is up.
 */
export const WORLD_ROUTES: readonly RouteSegment[] = [
  { from: "home-silo", to: "long-furrow", halfWidth: 7 },
  { from: "home-silo", to: "quarry-shelf", halfWidth: 6 },
  { from: "quarry-shelf", to: "toy-grove", halfWidth: 5.5 },
  { from: "home-silo", to: "sunken-flats", halfWidth: 5.5 },
  { from: "quarry-shelf", to: "salvage-yard", halfWidth: 5.5 },
] as const;

export interface ResolvedRoute {
  ax: number;
  az: number;
  bx: number;
  bz: number;
  halfWidth: number;
}

/** Routes with endpoints resolved to coordinates, computed once at module load. */
export const RESOLVED_ROUTES: readonly ResolvedRoute[] = WORLD_ROUTES.flatMap(
  (segment) => {
    const from = findSite(segment.from);
    const to = findSite(segment.to);
    if (!from || !to) {
      throw new Error(
        `World route references an unknown site: ${segment.from} -> ${segment.to}.`,
      );
    }
    return [
      {
        ax: from.x,
        az: from.z,
        bx: to.x,
        bz: to.z,
        halfWidth: segment.halfWidth,
      },
    ];
  },
);

/** Squared distance from a point to a finite segment. Hot path; no allocation. */
export function distanceToSegment(
  x: number,
  z: number,
  ax: number,
  az: number,
  bx: number,
  bz: number,
): number {
  const dx = bx - ax;
  const dz = bz - az;
  const lengthSquared = dx * dx + dz * dz;
  if (lengthSquared <= 1e-6) {
    return Math.hypot(x - ax, z - az);
  }
  let t = ((x - ax) * dx + (z - az) * dz) / lengthSquared;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(x - (ax + dx * t), z - (az + dz * t));
}
