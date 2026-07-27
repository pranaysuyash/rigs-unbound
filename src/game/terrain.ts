/**
 * The terrain field: the canonical answer to "how high is the ground here, and
 * what is it made of?" (ADR-0007).
 *
 * Pure TypeScript, no renderer dependency, fully determined by a seed string
 * plus the authored tables in `world.ts`. Physics, collision, camera occlusion,
 * exploration sightlines, the minimap, and the render mesh all read this one
 * object, so there is exactly one world.
 *
 * Composition order matters and is deliberate:
 *
 *   1. domain-warped continental fBm  — the large shape
 *   2. biome-scaled mid relief        — the character of a region
 *   3. masked ridged multifractal     — spines and the impassable rim
 *   4. authored site anchors          — guarantees flat, reachable places
 *   5. micro relief                   — texture the suspension can feel
 *   6. player deformation             — the world remembers
 *
 * Anchors come *after* the noise so authored intent always wins, and micro
 * relief comes after anchors so a graded pad still has surface texture. Both
 * orderings are load-bearing; swapping them produces either buried landmarks or
 * glassy, dead-feeling ground.
 */

import {
  clamp,
  fbm2,
  lerp,
  radialFalloff,
  ridged2,
  seedFromText,
  smoothStep,
} from "./noise";
import {
  BIOMES,
  type BiomeId,
  RESOLVED_ROUTES,
  RIDGE_HEIGHT,
  RIDGE_INNER_RADIUS,
  RIDGE_OUTER_RADIUS,
  SURFACES,
  type SurfaceId,
  type SurfaceMaterial,
  WATER_LEVEL,
  WORLD_SITES,
} from "./world";

/** Edge length of a deformation cell, in metres. */
export const DEFORM_CELL = 1.5;

/** Grid stride used to pack deformation cell coordinates into one integer key. */
const DEFORM_STRIDE = 4096;
const DEFORM_ORIGIN = DEFORM_STRIDE / 2;

/** Bound on stored deformation cells, so a long session cannot grow the save without limit. */
export const MAX_DEFORM_CELLS = 4200;

/** Deepest a single cell may be cut, in metres. */
const DEFORM_MIN = -0.42;
/** Highest a single cell may be raised (spoil ridges beside a furrow). */
const DEFORM_MAX = 0.3;

/** Slope (rise/run) above which ground reads and behaves as bare rock. */
const ROCK_SLOPE = 0.62;

/** Elevation above which ground is bare rock regardless of moisture. */
const ROCK_ELEVATION = 38;

/**
 * Maximum slope at which the plough can realistically work soil.
 * Above this (~14°), deformed ground keeps its natural classification
 * even if cut deep enough to cross the tilled threshold.
 */
const MAX_TILLED_SLOPE = 0.25;

/**
 * Cumulative deformation depth (metres, negative = cut) at which grass
 * becomes tilled soil. Expressed as a fraction of DEFORM_MIN so it scales
 * if the deformation bounds change. At PLOUGH_DEPTH = -0.13 m/pass, this
 * threshold is crossed after approximately 2 cut passes.
 */
const TILLED_DEFORMATION_THRESHOLD = DEFORM_MIN * 0.6;

/**
 * Maximum grade an authored route may present, as rise over run.
 *
 * 0.16 is ~9 degrees. This is the number that makes the track network a
 * *guarantee* rather than a hope: route profiles are grade-limited at
 * construction, so the weakest rig can always reach every routed site. Raising
 * this makes the world harder for the tractor; lowering it makes tracks look
 * artificially benched into hillsides.
 */
const MAX_ROUTE_GRADE = 0.16;

/** Target spacing of route profile samples, in metres. */
const ROUTE_SAMPLE_SPACING = 6;

/** How strongly a corridor centre overrides natural terrain. */
const ROUTE_AUTHORITY = 1;

interface RouteProfile {
  ax: number;
  az: number;
  dirX: number;
  dirZ: number;
  length: number;
  halfWidth: number;
  /** Grade-limited centreline elevations, evenly spaced along the segment. */
  elevations: Float64Array;
}

export interface GroundSample {
  /** Terrain elevation including deformation, in metres. */
  height: number;
  /** Unit surface normal. */
  normalX: number;
  normalY: number;
  normalZ: number;
  /** Gradient magnitude (rise over run). 0 is flat; 1 is 45 degrees. */
  slope: number;
  surface: SurfaceMaterial;
  /** Depth of standing water above the terrain, or 0 when dry. */
  waterDepth: number;
}

export interface DeformationEntry {
  /** Deformation cell index on the X axis. */
  cx: number;
  /** Deformation cell index on the Z axis. */
  cz: number;
  /** Height delta in metres. */
  delta: number;
}

function deformKey(cx: number, cz: number): number {
  return (cz + DEFORM_ORIGIN) * DEFORM_STRIDE + (cx + DEFORM_ORIGIN);
}

export class TerrainField {
  private readonly warpSeedX: number;
  private readonly warpSeedZ: number;
  private readonly baseSeed: number;
  private readonly detailSeed: number;
  private readonly ridgeSeed: number;
  private readonly microSeed: number;
  private readonly moistureSeed: number;

  /** Sparse player deformation, keyed by packed cell coordinate. */
  private readonly deformation = new Map<number, number>();

  /**
   * Monotonic mutation counter for the deformation map.
   *
   * The renderer must not gate mesh refreshes on `deformation.size`: deepening an
   * existing furrow changes a cell's value without changing the count, and the
   * FIFO eviction at capacity deletes one cell and adds another, also leaving the
   * count unchanged. Either case desynchronises the visible mesh from the terrain
   * the physics reads. A revision that only ever increases cannot miss an edit.
   */
  private revision = 0;

  /**
   * Route profiles, built on first use rather than in the constructor. They are
   * derived from `naturalHeight`, and building them eagerly would make
   * construction cost ~300 height samples even for callers that only ever ask
   * one question (the minimap legend, a unit test).
   */
  private routeProfiles: RouteProfile[] | null = null;

  constructor(readonly seedText: string) {
    const root = seedFromText(seedText);
    this.warpSeedX = seedFromText(`${seedText}:warp-x`);
    this.warpSeedZ = seedFromText(`${seedText}:warp-z`);
    this.baseSeed = root;
    this.detailSeed = seedFromText(`${seedText}:detail`);
    this.ridgeSeed = seedFromText(`${seedText}:ridge`);
    this.microSeed = seedFromText(`${seedText}:micro`);
    this.moistureSeed = seedFromText(`${seedText}:moisture`);
  }

  // ---------------------------------------------------------------------------
  // Region queries
  // ---------------------------------------------------------------------------

  /**
   * Biome at a point, resolved as a nearest-site Voronoi in units of anchor
   * radius. Scaling the distance by each site's own radius means a large site
   * claims a proportionally larger region, so region size is authored by the
   * same number that authors terrain influence.
   */
  /**
   * Smoothly blended biome character at a point.
   *
   * Regions used to resolve as a nearest-site Voronoi, which gave every place a
   * hard boundary: relief and moisture snapped from one biome's values to
   * another's across a single metre. That is the mathematical cause of the
   * "circular island, empty gap, circular island" read — the terrain was
   * numerically continuous but its *character* was not.
   *
   * Now every site contributes an inverse-square-ish influence and the continuous
   * properties are a weighted average, so badlands relief decays into meadow
   * relief over a hundred metres rather than at a line. `biomeAt` still returns a
   * discrete id for lookups that need one (obstacle density, salvage yield), and it
   * returns the argmax of the same weights, so the two never disagree.
   */
  private biomeInfluence(
    x: number,
    z: number,
  ): { moistureBias: number; reliefScale: number; dominant: BiomeId } {
    let totalWeight = 0;
    let moistureBias = 0;
    let reliefScale = 0;
    let dominant: BiomeId = "meadow";
    let bestWeight = -1;

    for (const site of WORLD_SITES) {
      const distance = Math.hypot(x - site.x, z - site.z);
      // Influence falls off with the square of distance measured in units of the
      // site's own radius, so a large site claims a proportionally larger region
      // without ever drawing an edge.
      const scaled = distance / Math.max(1, site.anchorRadius * 1.9);
      const weight = 1 / (0.12 + scaled * scaled);
      const biome = BIOMES[site.biome];
      totalWeight += weight;
      moistureBias += biome.moistureBias * weight;
      reliefScale += biome.reliefScale * weight;
      if (weight > bestWeight) {
        bestWeight = weight;
        dominant = site.biome;
      }
    }

    if (totalWeight <= 0) {
      const fallback = BIOMES.meadow;
      return {
        moistureBias: fallback.moistureBias,
        reliefScale: fallback.reliefScale,
        dominant: "meadow",
      };
    }
    return {
      moistureBias: moistureBias / totalWeight,
      reliefScale: reliefScale / totalWeight,
      dominant,
    };
  }

  biomeAt(x: number, z: number): BiomeId {
    return this.biomeInfluence(x, z).dominant;
  }

  /**
   * Corridor weight and graded elevation at a point, resolved in one pass.
   *
   * `height()` needs both numbers for every sample, and computing them separately
   * meant projecting onto all five route centrelines twice per terrain query — on
   * the hottest path in the game. One loop, two results.
   *
   * Overlapping authored routes are blended rather than selected by a single
   * winner. A max-weight winner can change at an intersection, carrying a
   * different corridor elevation across the boundary and creating a hidden
   * derivative discontinuity for suspension and grade queries.
   */
  private routeAt(x: number, z: number): { weight: number; elevation: number } {
    let totalWeight = 0;
    let weightedElevation = 0;

    for (const profile of this.profiles()) {
      const offsetX = x - profile.ax;
      const offsetZ = z - profile.az;
      const along = clamp(
        offsetX * profile.dirX + offsetZ * profile.dirZ,
        0,
        profile.length,
      );
      const lateral = Math.hypot(
        offsetX - profile.dirX * along,
        offsetZ - profile.dirZ * along,
      );
      const weight =
        1 - smoothStep(profile.halfWidth * 0.55, profile.halfWidth, lateral);
      if (weight <= 0) continue;

      const samples = profile.elevations.length;
      const position = (along / Math.max(1e-6, profile.length)) * (samples - 1);
      const index = clamp(Math.floor(position), 0, samples - 2);
      const elevation = lerp(
        profile.elevations[index]!,
        profile.elevations[index + 1]!,
        position - index,
      );
      totalWeight += weight;
      weightedElevation += elevation * weight;
    }

    return {
      weight: clamp(totalWeight, 0, 1),
      elevation: totalWeight > 0 ? weightedElevation / totalWeight : 0,
    };
  }

  /** 0..1 weight describing how strongly a point lies inside an authored track. */
  routeWeight(x: number, z: number): number {
    return this.routeAt(x, z).weight;
  }

  /** 0..1 moisture channel, biome-biased. Drives surface selection. */
  moisture(x: number, z: number): number {
    const raw = fbm2(x * 0.0055, z * 0.0055, this.moistureSeed, {
      octaves: 3,
      gain: 0.55,
    });
    const bias = this.biomeInfluence(x, z).moistureBias;
    return clamp(0.5 + raw * 0.5 + bias, 0, 1);
  }

  /**
   * Strongest authored anchor at a point, as `[weight, targetElevation]`.
   * Max-wins rather than accumulate: two overlapping flat pads must produce one
   * flat pad, not a bump between them.
   */
  private anchorAt(x: number, z: number): readonly [number, number] {
    let weight = 0;
    let target = 0;
    for (const site of WORLD_SITES) {
      const distance = Math.hypot(x - site.x, z - site.z);
      if (distance >= site.anchorRadius) continue;
      // One smooth falloff, deliberately. A two-stage core-plus-halo version was
      // tried and reverted: `min(1, core + halo)` plateaus at 1 and then falls off a
      // cliff when the core dies, which puts a derivative discontinuity at the pad
      // edge. Measured result was a 0.23 slope four metres from the spawn point and
      // rigs that could not pull away — exactly the "an anchor should not feel like
      // a pothole at its own edge" failure that `radialFalloff` exists to avoid.
      //
      // The circular-island read is fixed by shrinking `anchorRadius` to the
      // footprint scale instead, so the flat disc is ~10 m with a long gentle
      // transition, rather than tens of metres of table followed by an edge.
      const candidate =
        radialFalloff(distance, site.anchorRadius, 0.62) * site.anchorStrength;
      if (candidate > weight) {
        weight = candidate;
        target = site.elevation;
      }
    }
    return [weight, target];
  }

  // ---------------------------------------------------------------------------
  // Elevation
  // ---------------------------------------------------------------------------

  /**
   * Terrain before routes, deformation, and micro relief: the shape the land
   * would have if nobody had ever driven across it.
   *
   * Route profiles are built by sampling *this* function, so it must not depend
   * on routes — that would be circular.
   */
  private naturalHeight(
    x: number,
    z: number,
    precomputedAnchor?: readonly [number, number],
  ): number {
    // Anchors are resolved first even though they are applied last, because the
    // high-amplitude layers (spines, boundary rim) must be *suppressed* inside an
    // anchor rather than merely blended away afterwards. A 0.9-strength blend
    // still leaks 10% of a 27 m ridge, which is enough to lift Sunken Flats out
    // of its own water. Damping the source is the fix; blending is the polish.
    const [anchorWeight, anchorTarget] =
      precomputedAnchor ?? this.anchorAt(x, z);
    const anchorFree = 1 - anchorWeight;

    // 1. Domain warp. Feeding the continental field warped coordinates turns
    //    symmetric noise blobs into flowing landforms with valleys that bend.
    const warpX =
      fbm2(x * 0.0015, z * 0.0015, this.warpSeedX, { octaves: 2 }) * 48;
    const warpZ =
      fbm2(x * 0.0015, z * 0.0015, this.warpSeedZ, { octaves: 2 }) * 48;
    const px = x + warpX;
    const pz = z + warpZ;

    let height =
      fbm2(px * 0.0023, pz * 0.0023, this.baseSeed, {
        octaves: 4,
        gain: 0.52,
      }) * 23;

    // 2. Mid relief, scaled by the blended biome character so a region's
    //    roughness fades into its neighbour instead of switching at a boundary.
    const relief = this.biomeInfluence(x, z).reliefScale;
    height +=
      fbm2(x * 0.0122, z * 0.0122, this.detailSeed, { octaves: 4 }) *
      4.7 *
      relief *
      (1 - 0.85 * anchorWeight);

    // 3. Ridged spines, masked out of the central valley so home stays open,
    //    plus the impassable boundary rim. Both are damped inside anchors.
    const radius = Math.hypot(x, z);
    const spineMask = smoothStep(64, 168, radius) * anchorFree;
    height +=
      ridged2(px * 0.004, pz * 0.004, this.ridgeSeed, { octaves: 3 }) *
      27 *
      spineMask;
    height +=
      smoothStep(RIDGE_INNER_RADIUS, RIDGE_OUTER_RADIUS, radius) *
      RIDGE_HEIGHT *
      anchorFree;

    // 4. Authored anchors win.
    return lerp(height, anchorTarget, anchorWeight);
  }

  /** Terrain elevation without player deformation, in metres. */
  baseHeight(x: number, z: number): number {
    // Resolved once and threaded through: this function is called tens of
    // thousands of times to build the mesh and ~20 times per simulation step, so
    // recomputing the seven-site anchor scan or the five-route projection twice
    // per sample is the difference between a 150 ms and a 250 ms mesh build.
    const anchor = this.anchorAt(x, z);
    const route = this.routeAt(x, z);

    let height = this.naturalHeight(x, z, anchor);

    // 5. Authored routes bench a graded corridor into the natural land. The
    //    corridor elevation comes from a precomputed, grade-limited profile, so
    //    a routed site is reachable by construction rather than by luck.
    const routeW = route.weight;
    if (routeW > 0) {
      height = lerp(height, route.elevation, routeW * ROUTE_AUTHORITY);
    }

    // 6. Micro relief last, damped inside pads and tracks. This is the layer the
    //    suspension model turns into felt texture; without it the world is
    //    smooth in a way that reads as unfinished.
    const anchorWeight = anchor[0];
    height +=
      fbm2(x * 0.058, z * 0.058, this.microSeed, { octaves: 2 }) *
      0.58 *
      (1 - 0.62 * anchorWeight) *
      (1 - 0.72 * routeW);

    return clamp(height, -10, 150);
  }

  // ---------------------------------------------------------------------------
  // Route benching
  // ---------------------------------------------------------------------------

  /**
   * Build grade-limited elevation profiles for every authored route.
   *
   * Three passes, in order:
   *
   * 1. **Sample** the natural land along the centreline.
   * 2. **Smooth** with a small moving average, to remove micro wobble that would
   *    otherwise survive the grade limiter as a series of tiny ramps.
   * 3. **Grade-limit**, sweeping forward then backward with the endpoints pinned
   *    to their site elevations. Two-directional sweeping is required: a forward
   *    sweep alone shifts all the error to the far end and would detach the
   *    track from its destination pad.
   *
   * This is the cheap, deterministic form of the "route clearance by vehicle
   * capability" validator in the exploration map, run at construction instead of
   * as an offline check.
   */
  private buildRouteProfiles(): RouteProfile[] {
    return RESOLVED_ROUTES.map((route) => {
      const length = Math.hypot(route.bx - route.ax, route.bz - route.az);
      const samples = Math.max(
        8,
        Math.min(160, Math.ceil(length / ROUTE_SAMPLE_SPACING) + 1),
      );
      const step = length / (samples - 1);
      const dirX = length > 0 ? (route.bx - route.ax) / length : 1;
      const dirZ = length > 0 ? (route.bz - route.az) / length : 0;

      const elevations = new Float64Array(samples);
      for (let index = 0; index < samples; index += 1) {
        const distance = index * step;
        elevations[index] = this.naturalHeight(
          route.ax + dirX * distance,
          route.az + dirZ * distance,
        );
      }

      // Smooth.
      for (let pass = 0; pass < 3; pass += 1) {
        const previous = Float64Array.from(elevations);
        for (let index = 1; index < samples - 1; index += 1) {
          elevations[index] =
            previous[index - 1]! * 0.25 +
            previous[index]! * 0.5 +
            previous[index + 1]! * 0.25;
        }
      }

      // Pin endpoints to the authored pad elevations, then grade-limit.
      const startSite = WORLD_SITES.find(
        (site) => site.x === route.ax && site.z === route.az,
      );
      const endSite = WORLD_SITES.find(
        (site) => site.x === route.bx && site.z === route.bz,
      );
      if (startSite) elevations[0] = startSite.elevation;
      if (endSite) elevations[samples - 1] = endSite.elevation;

      // Grade-limit, sweeping both directions. Neither sweep may write index 0 or
      // `samples - 1`: those are the pad elevations, and letting a sweep move them
      // detaches the track from the place it is supposed to reach — which shows up
      // as a cliff at the corridor edge, not as a gentle error.
      const maximumStep = MAX_ROUTE_GRADE * step;
      for (let pass = 0; pass < 6; pass += 1) {
        for (let index = 1; index < samples - 1; index += 1) {
          elevations[index] = clamp(
            elevations[index]!,
            elevations[index - 1]! - maximumStep,
            elevations[index - 1]! + maximumStep,
          );
        }
        for (let index = samples - 2; index >= 1; index -= 1) {
          elevations[index] = clamp(
            elevations[index]!,
            elevations[index + 1]! - maximumStep,
            elevations[index + 1]! + maximumStep,
          );
        }
      }

      return {
        ax: route.ax,
        az: route.az,
        dirX,
        dirZ,
        length,
        halfWidth: route.halfWidth,
        elevations,
      };
    });
  }

  private profiles(): RouteProfile[] {
    if (!this.routeProfiles) {
      this.routeProfiles = this.buildRouteProfiles();
    }
    return this.routeProfiles;
  }

  /** Graded corridor elevation at a point. Kept for diagnostics and tests. */
  routeElevation(x: number, z: number): number {
    return this.routeAt(x, z).elevation;
  }

  /** Steepest grade present in any authored route profile, for validation. */
  steepestRouteGrade(): number {
    let steepest = 0;
    for (const profile of this.profiles()) {
      const step = profile.length / (profile.elevations.length - 1);
      for (let index = 1; index < profile.elevations.length; index += 1) {
        steepest = Math.max(
          steepest,
          Math.abs(
            profile.elevations[index]! - profile.elevations[index - 1]!,
          ) / step,
        );
      }
    }
    return steepest;
  }

  /** Bilinearly interpolated player deformation at a point, in metres. */
  deformationAt(x: number, z: number): number {
    if (this.deformation.size === 0) return 0;
    const gx = x / DEFORM_CELL;
    const gz = z / DEFORM_CELL;
    const cx = Math.floor(gx);
    const cz = Math.floor(gz);
    const tx = gx - cx;
    const tz = gz - cz;

    // Bilinear rather than nearest-cell: a hard cell step would be read by the
    // suspension model as a kerb and heard as a thud on every furrow edge.
    const d00 = this.deformation.get(deformKey(cx, cz)) ?? 0;
    const d10 = this.deformation.get(deformKey(cx + 1, cz)) ?? 0;
    const d01 = this.deformation.get(deformKey(cx, cz + 1)) ?? 0;
    const d11 = this.deformation.get(deformKey(cx + 1, cz + 1)) ?? 0;

    const lower = d00 + (d10 - d00) * tx;
    const upper = d01 + (d11 - d01) * tx;
    return lower + (upper - lower) * tz;
  }

  /** Terrain elevation including player deformation, in metres. */
  height(x: number, z: number): number {
    return this.baseHeight(x, z) + this.deformationAt(x, z);
  }

  /**
   * Full ground sample. Physics needs elevation, normal, slope, surface, and
   * water depth for the same point, and taking them together shares the four
   * neighbour height queries instead of repeating them per accessor.
   */
  sample(x: number, z: number, step = 0.85): GroundSample {
    const height = this.height(x, z);
    const east = this.height(x + step, z);
    const west = this.height(x - step, z);
    const north = this.height(x, z + step);
    const south = this.height(x, z - step);

    const dhdx = (east - west) / (2 * step);
    const dhdz = (north - south) / (2 * step);

    // Surface normal of the height field h(x,z) is (-dh/dx, 1, -dh/dz) normalised.
    const length = Math.hypot(dhdx, 1, dhdz);
    const slope = Math.hypot(dhdx, dhdz);

    return {
      height,
      normalX: -dhdx / length,
      normalY: 1 / length,
      normalZ: -dhdz / length,
      slope,
      surface: this.surfaceFor(x, z, height, slope),
      waterDepth: Math.max(0, WATER_LEVEL - height),
    };
  }

  /** Gradient magnitude at a point. */
  slope(x: number, z: number, step = 0.85): number {
    const dhdx =
      (this.height(x + step, z) - this.height(x - step, z)) / (2 * step);
    const dhdz =
      (this.height(x, z + step) - this.height(x, z - step)) / (2 * step);
    return Math.hypot(dhdx, dhdz);
  }

  /**
   * Signed grade along a heading: positive is uphill. This is the number that
   * makes a hill a gameplay gate, so physics reads it directly rather than
   * deriving it from the normal (which loses sign relative to travel).
   */
  gradeAlong(
    x: number,
    z: number,
    headingX: number,
    headingZ: number,
    step = 1.6,
  ): number {
    const ahead = this.height(x + headingX * step, z + headingZ * step);
    const behind = this.height(x - headingX * step, z - headingZ * step);
    return (ahead - behind) / (2 * step);
  }

  // ---------------------------------------------------------------------------
  // Surface
  // ---------------------------------------------------------------------------

  /**
   * Surface material selection. Order is a priority chain, not a blend: water
   * beats everything, then authored service pads, then tracks, then the
   * slope/elevation/moisture rules.
   */
  surfaceFor(
    x: number,
    z: number,
    height?: number,
    slope?: number,
  ): SurfaceMaterial {
    const elevation = height ?? this.height(x, z);
    if (elevation < WATER_LEVEL) {
      return SURFACES.water;
    }

    for (const site of WORLD_SITES) {
      if (!("padSurface" in site) || !("serviceRadius" in site)) continue;
      if (
        site.padSurface &&
        site.serviceRadius &&
        Math.hypot(x - site.x, z - site.z) <= site.serviceRadius
      ) {
        return SURFACES[site.padSurface];
      }
    }

    if (this.routeWeight(x, z) > 0.5) {
      return SURFACES.track;
    }

    const steepness = slope ?? this.slope(x, z);
    if (steepness > ROCK_SLOPE || elevation > ROCK_ELEVATION) {
      return SURFACES.rock;
    }

    // Deformation-based tilled classification. When cumulative cut deformation
    // exceeds the tilled threshold and the slope is gentle enough for the
    // plough to work, grass becomes tilled soil — the surface the blade was
    // designed to create. This is the Reclamation mechanic: the player alters
    // the land, and the surface classification changes to reflect it.
    if (steepness <= MAX_TILLED_SLOPE) {
      const cx = Math.round(x / DEFORM_CELL);
      const cz = Math.round(z / DEFORM_CELL);
      const deform = this.deformation.get(deformKey(cx, cz)) ?? 0;
      if (deform <= TILLED_DEFORMATION_THRESHOLD) {
        return SURFACES.tilled;
      }
    }

    if (elevation < WATER_LEVEL + 1.05) {
      return SURFACES.mud;
    }

    const wetness = this.moisture(x, z);
    if (wetness > 0.71) return SURFACES.mud;
    if (wetness < 0.34) return SURFACES.sand;
    return SURFACES.grass;
  }

  /** Convenience: the surface id at a point. */
  surfaceIdAt(x: number, z: number): SurfaceId {
    return this.surfaceFor(x, z).id;
  }

  /** True when the terrain at this point is below the waterline. */
  isSubmerged(x: number, z: number): boolean {
    return this.height(x, z) < WATER_LEVEL;
  }

  // ---------------------------------------------------------------------------
  // Deformation (world memory)
  // ---------------------------------------------------------------------------

  /**
   * Cut or raise ground at a point. Returns true when a cell actually changed,
   * so callers can decide whether the change is worth persisting.
   *
   * Non-deformable surfaces (rock, track, water) reject the change: a plough
   * cannot carve hardpan, and pretending otherwise would let the player erase
   * the authored track network.
   */
  deform(x: number, z: number, delta: number, radiusCells = 1): boolean {
    if (!Number.isFinite(delta) || delta === 0) return false;
    if (!this.surfaceFor(x, z).deformable) return false;

    const centreX = Math.round(x / DEFORM_CELL);
    const centreZ = Math.round(z / DEFORM_CELL);
    const span = Math.max(0, Math.min(3, radiusCells | 0));
    let changed = false;

    for (let iz = centreZ - span; iz <= centreZ + span; iz += 1) {
      for (let ix = centreX - span; ix <= centreX + span; ix += 1) {
        const falloff =
          span === 0
            ? 1
            : radialFalloff(
                Math.hypot(ix - centreX, iz - centreZ),
                span + 0.75,
                0.9,
              );
        if (falloff <= 0.02) continue;

        const key = deformKey(ix, iz);
        const previous = this.deformation.get(key) ?? 0;
        const next = clamp(previous + delta * falloff, DEFORM_MIN, DEFORM_MAX);
        if (Math.abs(next - previous) < 0.002) continue;

        if (previous === 0 && this.deformation.size >= MAX_DEFORM_CELLS) {
          // Budget reached. Drop the oldest insertion; Map preserves order, so
          // this is FIFO and the world forgets its earliest passes first.
          const oldest = this.deformation.keys().next();
          if (!oldest.done) {
            this.deformation.delete(oldest.value);
          }
        }
        this.deformation.set(key, next);
        this.revision += 1;
        changed = true;
      }
    }
    return changed;
  }

  deformationCount(): number {
    return this.deformation.size;
  }

  /**
   * Mutation revision. Increases on every accepted cell edit, load, and clear.
   *
   * Consumers that mirror terrain state (the render mesh, a minimap tile cache)
   * must compare this rather than `deformationCount()`.
   */
  deformationRevision(): number {
    return this.revision;
  }

  /** Serialisable deformation snapshot for the save record. */
  deformationEntries(): DeformationEntry[] {
    const entries: DeformationEntry[] = [];
    for (const [key, delta] of this.deformation) {
      const cx = (key % DEFORM_STRIDE) - DEFORM_ORIGIN;
      const cz = Math.floor(key / DEFORM_STRIDE) - DEFORM_ORIGIN;
      entries.push({ cx, cz, delta: Number(delta.toFixed(3)) });
    }
    return entries;
  }

  /** Replace deformation from a validated save record. */
  loadDeformations(entries: readonly DeformationEntry[]): void {
    this.deformation.clear();
    this.revision += 1;
    for (const entry of entries.slice(-MAX_DEFORM_CELLS)) {
      if (
        !Number.isFinite(entry.cx) ||
        !Number.isFinite(entry.cz) ||
        !Number.isFinite(entry.delta)
      ) {
        continue;
      }
      this.deformation.set(
        deformKey(entry.cx | 0, entry.cz | 0),
        clamp(entry.delta, DEFORM_MIN, DEFORM_MAX),
      );
    }
  }

  clearDeformations(): void {
    if (this.deformation.size > 0) {
      this.deformation.clear();
      this.revision += 1;
    }
  }

  // ---------------------------------------------------------------------------
  // Bulk sampling
  // ---------------------------------------------------------------------------

  /**
   * Sample a regular height grid.
   *
   * Both the render mesh and the minimap need tens of thousands of heights at
   * once. Sampling into a flat array and deriving normals from grid neighbours
   * costs one `height()` per vertex instead of five, which is the difference
   * between a ~50 ms and a ~250 ms boot.
   */
  sampleHeightGrid(
    originX: number,
    originZ: number,
    cells: number,
    step: number,
  ): Float32Array {
    const size = cells + 1;
    const heights = new Float32Array(size * size);
    for (let iz = 0; iz < size; iz += 1) {
      const z = originZ + iz * step;
      for (let ix = 0; ix < size; ix += 1) {
        heights[iz * size + ix] = this.height(originX + ix * step, z);
      }
    }
    return heights;
  }

  /**
   * March a ray from `(fromX, fromY, fromZ)` toward `(toX, toY, toZ)` and return
   * the fraction `0..1` at which terrain first blocks it, or 1 when the segment
   * is clear.
   *
   * Used for two different jobs that are the same query: pulling the chase
   * camera in front of a hill (the gap `DESIGN.md` records as unimplemented),
   * and deciding whether a distant map cell is visible from high ground.
   */
  raymarchBlocked(
    fromX: number,
    fromY: number,
    fromZ: number,
    toX: number,
    toY: number,
    toZ: number,
    samples = 14,
    clearance = 0.35,
  ): number {
    for (let index = 1; index <= samples; index += 1) {
      const t = index / samples;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      const z = fromZ + (toZ - fromZ) * t;
      if (this.height(x, z) + clearance > y) {
        return (index - 1) / samples;
      }
    }
    return 1;
  }
}
