/**
 * Exploration: the survey grid and the salvage field.
 *
 * The design question this answers is "why would a player go anywhere?" The
 * answer here has two halves, and both are terrain-coupled on purpose:
 *
 * 1. **Surveying rewards elevation.** A map cell is revealed when the rig can
 *    actually see it, tested by raymarching the terrain field. Climbing therefore
 *    pays off in information, and the survey mast module multiplies that payoff.
 *    No tower props, no unlock markers — the hill *is* the mechanic.
 * 2. **Salvage rewards leaving the road.** Nodes are rejected inside the authored
 *    track corridors, so everything worth collecting is off-route. The graded
 *    network gets you close safely; the last stretch costs you traction.
 *
 * Like obstacles, both fields are generated from the seed on demand. Only the
 * player's deltas — which cells are mapped, which nodes are gone — are saved.
 */

import { cellRandom, seedFromText } from "./noise";
import type { TerrainField } from "./terrain";
import { WATER_LEVEL, type BiomeId } from "./world";

/** Edge length of a survey cell, in metres. */
export const SURVEY_CELL = 18;

/** Grid stride for packing survey cell coordinates into one integer key. */
const SURVEY_STRIDE = 1024;
const SURVEY_ORIGIN = SURVEY_STRIDE / 2;

/** Bound on mapped cells retained in a save. */
export const MAX_SURVEYED_CELLS = 6000;

/** Edge length of a salvage cell, in metres. */
export const SALVAGE_CELL = 27;

/** Radius within which a rig collects a salvage node. */
export const SALVAGE_PICKUP_RADIUS = 4.6;

/** Distance a rig must move before the survey sweep runs again. */
export const SURVEY_MOVE_THRESHOLD = 2.5;

/** Cells closer than this are mapped without a line-of-sight test. */
const SURVEY_FREE_RADIUS = 21;

/**
 * Authored first-session cache.
 *
 * Procedural salvage owns the long-term exploration field, but the first verb
 * cannot depend on a lucky seed. This cache sits just outside the Home Silo
 * service pad on gentle meadow ground: close enough to teach "leave the track,
 * press Act", far enough that collecting it is still a spatial decision.
 */
export const FIRST_SALVAGE_NODE = {
  id: "first-recovery-cache",
  x: -18,
  z: 5,
  value: 5,
} as const;

export function surveyKey(cellX: number, cellZ: number): number {
  return (cellZ + SURVEY_ORIGIN) * SURVEY_STRIDE + (cellX + SURVEY_ORIGIN);
}

export function surveyCellOf(x: number, z: number): readonly [number, number] {
  return [Math.floor(x / SURVEY_CELL), Math.floor(z / SURVEY_CELL)];
}

export function unpackSurveyKey(key: number): readonly [number, number] {
  return [
    (key % SURVEY_STRIDE) - SURVEY_ORIGIN,
    Math.floor(key / SURVEY_STRIDE) - SURVEY_ORIGIN,
  ];
}

/**
 * Salvage yield per biome.
 *
 * The badlands pay best and are the furthest away past the roughest ground, so
 * the risk/reward gradient points outward. The marsh pays well too, but only a
 * rig that can ford it collects anything.
 */
const BIOME_SALVAGE: Readonly<
  Record<BiomeId, { chance: number; value: number }>
> = {
  meadow: { chance: 0.16, value: 1 },
  farmland: { chance: 0.12, value: 1 },
  badlands: { chance: 0.46, value: 3 },
  grove: { chance: 0.24, value: 2 },
  highland: { chance: 0.34, value: 2 },
  marsh: { chance: 0.34, value: 3 },
};

export interface SalvageNode {
  id: string;
  x: number;
  z: number;
  groundY: number;
  /** Salvage units awarded on collection. */
  value: number;
  biome: BiomeId;
  variation: number;
}

export interface SurveyResult {
  /** Newly mapped cell keys. */
  revealed: number[];
  /** Highest elevation advantage used during the sweep, for HUD feedback. */
  vantage: number;
}

export class ExplorationField {
  private readonly salvageSeed: number;

  constructor(
    seedText: string,
    private readonly terrain: TerrainField,
  ) {
    this.salvageSeed = seedFromText(`${seedText}:salvage`);
  }

  // ---------------------------------------------------------------------------
  // Salvage
  // ---------------------------------------------------------------------------

  private nodeAt(cx: number, cz: number): SalvageNode | null {
    const jitterX = cellRandom(cx, cz, 11, this.salvageSeed);
    const jitterZ = cellRandom(cx, cz, 12, this.salvageSeed);
    const x = (cx + 0.1 + jitterX * 0.8) * SALVAGE_CELL;
    const z = (cz + 0.1 + jitterZ * 0.8) * SALVAGE_CELL;

    const biome = this.terrain.biomeAt(x, z);
    const rule = BIOME_SALVAGE[biome];
    if (cellRandom(cx, cz, 13, this.salvageSeed) > rule.chance) return null;

    // Everything worth having is off the authored network.
    if (this.terrain.routeWeight(x, z) > 0.35) return null;

    const ground = this.terrain.sample(x, z, 1.2);
    // A node on a near-vertical face would be unreachable; one in deep water is
    // reserved for a rig that can ford, which is legitimate, so only the terrain
    // *slope* disqualifies a site.
    if (ground.slope > 0.72) return null;

    const variation = cellRandom(cx, cz, 14, this.salvageSeed);
    const bonus = cellRandom(cx, cz, 15, this.salvageSeed) < 0.22 ? 1 : 0;

    return {
      id: `${cx}:${cz}`,
      x,
      z,
      groundY: Math.max(ground.height, WATER_LEVEL),
      value: rule.value + bonus,
      biome,
      variation,
    };
  }

  /** Salvage nodes within `range` metres of a point, excluding collected ids. */
  nodesNear(
    x: number,
    z: number,
    range: number,
    collected: ReadonlySet<string>,
  ): SalvageNode[] {
    const found: SalvageNode[] = [];
    const firstDx = FIRST_SALVAGE_NODE.x - x;
    const firstDz = FIRST_SALVAGE_NODE.z - z;
    if (
      !collected.has(FIRST_SALVAGE_NODE.id) &&
      firstDx * firstDx + firstDz * firstDz <= range * range
    ) {
      const firstGround = this.terrain.sample(
        FIRST_SALVAGE_NODE.x,
        FIRST_SALVAGE_NODE.z,
        1.2,
      );
      found.push({
        ...FIRST_SALVAGE_NODE,
        groundY: Math.max(firstGround.height, WATER_LEVEL),
        biome: this.terrain.biomeAt(FIRST_SALVAGE_NODE.x, FIRST_SALVAGE_NODE.z),
        variation: 0.42,
      });
    }
    const span = Math.ceil(range / SALVAGE_CELL) + 1;
    const centreX = Math.floor(x / SALVAGE_CELL);
    const centreZ = Math.floor(z / SALVAGE_CELL);
    const rangeSquared = range * range;

    for (let cz = centreZ - span; cz <= centreZ + span; cz += 1) {
      for (let cx = centreX - span; cx <= centreX + span; cx += 1) {
        const node = this.nodeAt(cx, cz);
        if (!node || collected.has(node.id)) continue;
        const dx = node.x - x;
        const dz = node.z - z;
        if (dx * dx + dz * dz <= rangeSquared) {
          found.push(node);
        }
      }
    }
    return found;
  }

  /** The nearest uncollected node within range, or null. */
  nearestNode(
    x: number,
    z: number,
    range: number,
    collected: ReadonlySet<string>,
  ): SalvageNode | null {
    let best: SalvageNode | null = null;
    let bestDistance = Infinity;
    for (const node of this.nodesNear(x, z, range, collected)) {
      const distance = Math.hypot(node.x - x, node.z - z);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = node;
      }
    }
    return best;
  }

  // ---------------------------------------------------------------------------
  // Survey
  // ---------------------------------------------------------------------------

  /**
   * Map every survey cell visible from an eye position.
   *
   * Cells inside `SURVEY_FREE_RADIUS` are mapped unconditionally — you can see
   * the ground you are standing on — and everything beyond that must pass a
   * terrain raymarch. The eye is raised above the rig so a tall mast genuinely
   * sees over a rise that blocks the bare cab.
   *
   * Cost is bounded by `range`, and callers are expected to invoke this only
   * after the rig has moved `SURVEY_MOVE_THRESHOLD`, which keeps a ~46 m sweep at
   * a few hundred height samples per second rather than per frame.
   */
  survey(
    eyeX: number,
    eyeY: number,
    eyeZ: number,
    range: number,
    surveyed: Set<number>,
  ): SurveyResult {
    const revealed: number[] = [];
    const span = Math.ceil(range / SURVEY_CELL);
    const centreX = Math.floor(eyeX / SURVEY_CELL);
    const centreZ = Math.floor(eyeZ / SURVEY_CELL);
    let vantage = 0;

    for (let cz = centreZ - span; cz <= centreZ + span; cz += 1) {
      for (let cx = centreX - span; cx <= centreX + span; cx += 1) {
        const key = surveyKey(cx, cz);
        if (surveyed.has(key)) continue;

        const targetX = (cx + 0.5) * SURVEY_CELL;
        const targetZ = (cz + 0.5) * SURVEY_CELL;
        const distance = Math.hypot(targetX - eyeX, targetZ - eyeZ);
        if (distance > range) continue;

        if (distance > SURVEY_FREE_RADIUS) {
          const targetY = this.terrain.height(targetX, targetZ) + 1.2;
          const clear = this.terrain.raymarchBlocked(
            eyeX,
            eyeY,
            eyeZ,
            targetX,
            targetY,
            targetZ,
            10,
            0.6,
          );
          if (clear < 1) continue;
          vantage = Math.max(vantage, eyeY - targetY);
        }

        surveyed.add(key);
        revealed.push(key);
      }
    }

    return { revealed, vantage };
  }

  /** Fraction of the disc of `radius` around the origin that has been mapped. */
  surveyedFraction(surveyed: ReadonlySet<number>, radius: number): number {
    const cells = Math.ceil(radius / SURVEY_CELL);
    let total = 0;
    for (let cz = -cells; cz <= cells; cz += 1) {
      for (let cx = -cells; cx <= cells; cx += 1) {
        const x = (cx + 0.5) * SURVEY_CELL;
        const z = (cz + 0.5) * SURVEY_CELL;
        if (Math.hypot(x, z) <= radius) total += 1;
      }
    }
    if (total === 0) return 0;

    let mapped = 0;
    for (const key of surveyed) {
      const [cx, cz] = unpackSurveyKey(key);
      const x = (cx + 0.5) * SURVEY_CELL;
      const z = (cz + 0.5) * SURVEY_CELL;
      if (Math.hypot(x, z) <= radius) mapped += 1;
    }
    return Math.min(1, mapped / total);
  }
}
