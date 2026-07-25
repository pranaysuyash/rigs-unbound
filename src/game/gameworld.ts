/**
 * `GameWorld` owns the procedural fields and the player's spatial deltas.
 *
 * ## Why this is separate from `GameState`
 *
 * `GameState` is the small, strictly validated record: rigs, the active activity,
 * progression totals. Everything in it is checked field by field on load.
 *
 * The spatial deltas — which ground has been ploughed, which trees are down,
 * which nodes are gone, which cells are mapped — are *sets and grids*, not
 * records. They are bounded by count rather than by schema, they are cheap to
 * validate as "a list of numbers or short strings", and the fixed step needs to
 * query them thousands of times without allocating. Keeping them as live `Set`s
 * and `Map`s beside the fields that read them avoids rebuilding a lookup
 * structure from an array on every step.
 *
 * This is a split of *responsibility*, not a duplicate truth source: each datum
 * lives in exactly one place, and `storage.ts` composes both halves into one save
 * record.
 */

import { ObstacleField } from "./collision";
import { ExplorationField } from "./exploration";
import { MAX_SURVEYED_CELLS } from "./exploration";
import { TerrainField, type DeformationEntry } from "./terrain";

/** Bound on felled obstacles retained, oldest dropped first. */
export const MAX_FELLED = 1500;

/** Bound on collected salvage node ids retained. */
export const MAX_COLLECTED_NODES = 2500;

export interface WorldMemoryRecord {
  deformation: DeformationEntry[];
  felled: string[];
  collected: string[];
  surveyed: number[];
}

function trimSet<T>(target: Set<T>, limit: number): void {
  while (target.size > limit) {
    const oldest = target.keys().next();
    if (oldest.done) break;
    target.delete(oldest.value);
  }
}

export class GameWorld {
  readonly terrain: TerrainField;
  readonly obstacles: ObstacleField;
  readonly exploration: ExplorationField;

  readonly felledObstacles = new Set<string>();
  readonly collectedNodes = new Set<string>();
  readonly surveyedCells = new Set<number>();

  constructor(readonly seed: string) {
    this.terrain = new TerrainField(seed);
    this.obstacles = new ObstacleField(seed, this.terrain);
    this.exploration = new ExplorationField(seed, this.terrain);
  }

  fell(id: string): void {
    this.felledObstacles.add(id);
    trimSet(this.felledObstacles, MAX_FELLED);
  }

  collect(id: string): void {
    this.collectedNodes.add(id);
    trimSet(this.collectedNodes, MAX_COLLECTED_NODES);
  }

  noteSurveyed(keys: readonly number[]): void {
    for (const key of keys) {
      this.surveyedCells.add(key);
    }
    trimSet(this.surveyedCells, MAX_SURVEYED_CELLS);
  }

  reset(): void {
    this.terrain.clearDeformations();
    this.felledObstacles.clear();
    this.collectedNodes.clear();
    this.surveyedCells.clear();
  }

  snapshot(): WorldMemoryRecord {
    return {
      deformation: this.terrain.deformationEntries(),
      felled: [...this.felledObstacles],
      collected: [...this.collectedNodes],
      surveyed: [...this.surveyedCells],
    };
  }

  /**
   * Restore spatial memory from an untrusted record.
   *
   * Deliberately lenient per entry and strict in aggregate: a single malformed id
   * is dropped rather than failing the whole load, because losing a session's
   * ploughing to one bad number would be a worse outcome than losing one furrow.
   * Counts are still hard-capped so a hand-edited save cannot exhaust memory.
   */
  restore(value: unknown): void {
    this.reset();
    if (!value || typeof value !== "object") return;
    const record = value as Partial<WorldMemoryRecord>;

    if (Array.isArray(record.deformation)) {
      this.terrain.loadDeformations(
        record.deformation.filter(
          (entry): entry is DeformationEntry =>
            !!entry &&
            typeof entry === "object" &&
            Number.isFinite((entry as DeformationEntry).cx) &&
            Number.isFinite((entry as DeformationEntry).cz) &&
            Number.isFinite((entry as DeformationEntry).delta),
        ),
      );
    }

    if (Array.isArray(record.felled)) {
      for (const id of record.felled.slice(-MAX_FELLED)) {
        if (typeof id === "string" && id.length > 0 && id.length < 32) {
          this.felledObstacles.add(id);
        }
      }
    }

    if (Array.isArray(record.collected)) {
      for (const id of record.collected.slice(-MAX_COLLECTED_NODES)) {
        if (typeof id === "string" && id.length > 0 && id.length < 32) {
          this.collectedNodes.add(id);
        }
      }
    }

    if (Array.isArray(record.surveyed)) {
      for (const key of record.surveyed.slice(-MAX_SURVEYED_CELLS)) {
        if (Number.isFinite(key) && key >= 0) {
          this.surveyedCells.add(key | 0);
        }
      }
    }
  }
}
