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
    grip: 0.68,
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
  verb: string;
  x: number;
  z: number;
  /** Radius within which the site counts as discovered. */
  discoverRadius: number;
  /** Terrain anchor radius. Beyond this the site stops influencing elevation. */
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
    anchorRadius: 58,
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
    anchorRadius: 46,
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
    anchorRadius: 34,
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
    anchorRadius: 40,
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
    anchorRadius: 38,
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
    anchorRadius: 52,
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
    anchorRadius: 44,
    elevation: 46,
    anchorStrength: 0.985,
    biome: "highland",
    padSurface: "rock",
    serviceRadius: 22,
  },
] as const;

export function findSite(id: string): WorldSite | undefined {
  return WORLD_SITES.find((site) => site.id === id);
}

/** A site id that is guaranteed to exist, for spawn and workshop lookups. */
export const HOME_SITE = WORLD_SITES[0]!;

export interface RouteSegment {
  from: string;
  to: string;
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
      return [];
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
