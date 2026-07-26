/**
 * Obstacle field and collision resolution.
 *
 * Obstacles are **generated on demand from the seed**, not stored. A cell
 * coordinate plus a slot index hashes to a stable position, size, and kind, so
 * the field is effectively unbounded, costs no memory, needs no save data, and is
 * identical for every player on the same seed.
 *
 * Only two things are persisted: which obstacles the player has knocked down.
 * That is the smallest possible representation of "the world remembers".
 *
 * Before ADR-0007 the renderer scattered 42 decorative props with its own RNG
 * and the kernel could not collide with any of them. This module is the single
 * source both sides read.
 */

import { cellRandom, clamp, seedFromText } from "./noise";
import type { TerrainField } from "./terrain";
import { WATER_LEVEL, type BiomeId } from "./world";

/** Edge length of an obstacle cell, in metres. */
export const OBSTACLE_CELL = 13;

/** Maximum obstacles considered per cell. */
const SLOTS_PER_CELL = 2;

/** Cap on memoised cell slots before the memo is dropped wholesale. */
const MAX_CACHED_CELLS = 40_000;

export type ObstacleKind = "tree" | "rock" | "stump";

export interface Obstacle {
  id: string;
  x: number;
  z: number;
  /** Ground elevation at the obstacle's base. */
  groundY: number;
  /** Collision radius, in metres. */
  radius: number;
  /** Visual height, in metres. */
  height: number;
  kind: ObstacleKind;
  /** Whether a heavy enough rig can knock this down. */
  fellable: boolean;
  /** Stable 0..1 variation value for rendering (rotation, tint, scale jitter). */
  variation: number;
}

/** Shared visual dimensions used by both instancing and camera obstruction. */
export function treeTrunkHeight(obstacle: Obstacle): number {
  return obstacle.height * 0.55;
}

/** Horizontal crown radius before the renderer's 1.3× vertical stretch. */
export function treeCrownRadius(obstacle: Obstacle): number {
  return 1.25 + obstacle.variation * 0.85;
}

export function treeCrownCenterY(obstacle: Obstacle): number {
  return obstacle.groundY + obstacle.height * 0.78;
}

export function felledTrunkLength(obstacle: Obstacle): number {
  return obstacle.height * 0.8;
}

export function rockVisualHalfHeight(obstacle: Obstacle): number {
  return obstacle.radius * (0.6 + obstacle.variation * 0.5);
}

/**
 * Obstacle density per biome, as a probability per cell slot.
 *
 * Farmland is nearly clear on purpose — the tilled field must stay ploughable —
 * and the grove is dense enough that navigating it is a skill.
 */
const BIOME_DENSITY: Readonly<Record<BiomeId, number>> = {
  meadow: 0.3,
  farmland: 0.07,
  badlands: 0.34,
  grove: 0.72,
  highland: 0.4,
  marsh: 0.2,
};

/** Probability that an obstacle in a biome is a rock rather than a tree. */
const BIOME_ROCKINESS: Readonly<Record<BiomeId, number>> = {
  meadow: 0.25,
  farmland: 0.4,
  badlands: 0.85,
  grove: 0.12,
  highland: 0.75,
  marsh: 0.2,
};

export interface CollisionOutcome {
  /** True when the rig was pushed out of an obstacle this step. */
  hit: boolean;
  /** Closing speed at impact, in m/s. */
  impactSpeed: number;
  /** Obstacle the rig knocked down, if any. */
  felled: Obstacle | null;
  /** Obstacle that stopped the rig, if any. */
  blockedBy: Obstacle | null;
}

const NO_COLLISION: CollisionOutcome = {
  hit: false,
  impactSpeed: 0,
  felled: null,
  blockedBy: null,
};

export class ObstacleField {
  private readonly seed: number;

  /**
   * Memo of resolved cell slots, including proven-empty ones (`null`).
   *
   * `obstacleAt` is a pure function of `(cell, slot, seed)`, but deriving one
   * candidate costs a `terrain.sample` (five `height()` queries) plus a biome scan
   * and a route projection. `resolve` examines ~50 candidates per simulation step
   * and the renderer examines ~1,400 per prop rebuild, so recomputing them was
   * costing ~250 terrain queries *per step* — measured at 18 ms/step against a
   * 16.7 ms frame budget, i.e. the kernel alone exceeded the entire frame.
   *
   * Because the field is deterministic and static apart from felling (tracked
   * separately in `GameWorld.felledObstacles`), caching cannot change behaviour.
   */
  private readonly cache = new Map<number, Obstacle | null>();

  constructor(
    seedText: string,
    private readonly terrain: TerrainField,
  ) {
    this.seed = seedFromText(`${seedText}:obstacles`);
  }

  /**
   * Resolve the obstacle in a given cell slot, or null when the slot is empty.
   *
   * Rejection rules matter as much as placement: nothing grows in standing water,
   * on bare rock faces, on the authored track network, or inside a service pad.
   * Without those rules the generator would block its own roads.
   */
  private obstacleAt(cx: number, cz: number, slot: number): Obstacle | null {
    // Pack the cell and slot into one integer key. The 4096 stride matches the
    // deformation grid's convention and comfortably covers the world disc.
    const key = ((cz + 2048) * 4096 + (cx + 2048)) * 4 + slot;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const resolved = this.resolveObstacleAt(cx, cz, slot);
    if (this.cache.size >= MAX_CACHED_CELLS) {
      // Pure memo, so dropping everything is always safe; a session that ranges
      // far enough to fill this simply pays the derivation cost again.
      this.cache.clear();
    }
    this.cache.set(key, resolved);
    return resolved;
  }

  private resolveObstacleAt(
    cx: number,
    cz: number,
    slot: number,
  ): Obstacle | null {
    const channel = slot * 977;
    const presence = cellRandom(cx, cz, channel + 1, this.seed);

    const jitterX = cellRandom(cx, cz, channel + 2, this.seed);
    const jitterZ = cellRandom(cx, cz, channel + 3, this.seed);
    const x = (cx + jitterX) * OBSTACLE_CELL;
    const z = (cz + jitterZ) * OBSTACLE_CELL;

    const biome = this.terrain.biomeAt(x, z);
    if (presence > BIOME_DENSITY[biome]) return null;

    // Keep the authored network and pads clear.
    if (this.terrain.routeWeight(x, z) > 0.25) return null;

    const ground = this.terrain.sample(x, z, 1.1);
    if (ground.height < WATER_LEVEL + 0.15) return null;
    if (ground.slope > 0.55) return null;

    const variation = cellRandom(cx, cz, channel + 4, this.seed);
    const isRock =
      cellRandom(cx, cz, channel + 5, this.seed) < BIOME_ROCKINESS[biome];

    if (isRock) {
      const radius = 0.75 + variation * 1.35;
      return {
        id: `r${cx}:${cz}:${slot}`,
        x,
        z,
        groundY: ground.height,
        radius,
        height: radius * (1.1 + variation * 0.6),
        kind: "rock",
        fellable: false,
        variation,
      };
    }

    const trunk = 0.42 + variation * 0.38;
    return {
      id: `t${cx}:${cz}:${slot}`,
      x,
      z,
      groundY: ground.height,
      radius: trunk,
      height: 4.2 + variation * 3.4,
      kind: "tree",
      fellable: true,
      variation,
    };
  }

  /** Every obstacle whose centre lies within `range` metres of a point. */
  near(x: number, z: number, range: number): Obstacle[] {
    const found: Obstacle[] = [];
    const span = Math.ceil(range / OBSTACLE_CELL) + 1;
    const centreX = Math.floor(x / OBSTACLE_CELL);
    const centreZ = Math.floor(z / OBSTACLE_CELL);
    const rangeSquared = range * range;

    for (let cz = centreZ - span; cz <= centreZ + span; cz += 1) {
      for (let cx = centreX - span; cx <= centreX + span; cx += 1) {
        for (let slot = 0; slot < SLOTS_PER_CELL; slot += 1) {
          const obstacle = this.obstacleAt(cx, cz, slot);
          if (!obstacle) continue;
          const dx = obstacle.x - x;
          const dz = obstacle.z - z;
          if (dx * dx + dz * dz <= rangeSquared) {
            found.push(obstacle);
          }
        }
      }
    }
    return found;
  }

  /**
   * Push a rig out of any obstacle it overlaps, and report what happened.
   *
   * A heavy rig moving fast fells a tree instead of stopping; a light one bounces
   * off it. That is the clearest capability contrast in the game that costs no
   * new content: the same tree is scenery to the tractor and a wall to the buggy.
   */
  resolve(
    rig: { x: number; z: number; speed: number; heading: number },
    rigRadius: number,
    mass: number,
    felledIds: ReadonlySet<string>,
  ): CollisionOutcome {
    const candidates = this.near(rig.x, rig.z, rigRadius + 3.2);
    if (candidates.length === 0) return NO_COLLISION;

    let outcome: CollisionOutcome = NO_COLLISION;

    for (const obstacle of candidates) {
      if (felledIds.has(obstacle.id)) continue;
      const dx = rig.x - obstacle.x;
      const dz = rig.z - obstacle.z;
      const distance = Math.hypot(dx, dz);
      const minimum = obstacle.radius + rigRadius;
      if (distance >= minimum) continue;

      const impactSpeed = Math.abs(rig.speed);

      // Heavy and fast enough fells a tree. The thresholds are deliberately
      // reachable by the tractor at working speed and out of reach for the buggy.
      if (
        obstacle.fellable &&
        mass >= 3 &&
        impactSpeed >= 4.5 &&
        obstacle.radius <= 0.75
      ) {
        rig.speed *= 0.62;
        outcome = {
          hit: true,
          impactSpeed,
          felled: obstacle,
          blockedBy: null,
        };
        continue;
      }

      // Push out along the contact normal, preserving the tangential component so
      // the rig slides around a rock rather than sticking to it.
      const nx = distance > 1e-4 ? dx / distance : 1;
      const nz = distance > 1e-4 ? dz / distance : 0;
      const overlap = minimum - distance;
      rig.x += nx * overlap;
      rig.z += nz * overlap;

      const forwardX = Math.sin(rig.heading);
      const forwardZ = Math.cos(rig.heading);
      const closing = -(forwardX * nx + forwardZ * nz) * rig.speed;
      if (closing > 0) {
        rig.speed *= clamp(
          1 - 0.9 * (closing / Math.max(1, impactSpeed)),
          -0.2,
          0.9,
        );
      }

      outcome = {
        hit: true,
        impactSpeed: Math.max(outcome.impactSpeed, Math.max(0, closing)),
        felled: outcome.felled,
        blockedBy: obstacle,
      };
    }

    return outcome;
  }
}
