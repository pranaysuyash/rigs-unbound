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
import {
  ExplorationField,
  MAX_SURVEYED_CELLS,
  SURVEY_MOVE_THRESHOLD,
} from "./exploration";
import type { RigId } from "./contracts";
import {
  queryCameraObstruction,
  resolveRigStructureCollision,
  type CameraObstructionHit,
  type CameraObstructionOptions,
  type ScenePoint,
  type StructureCollisionBody,
  type StructureCollisionOutcome,
} from "./scene-query";
import { TerrainField, type DeformationEntry } from "./terrain";
import type { WorldSiteId } from "./world";

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
  /**
   * Runtime-only observation cadence.
   *
   * This is deliberately not save data. A freshly constructed or restored world
   * must run one observation sweep so derived horizon visibility is rebuilt from
   * the active rig's current eye position. Keeping the cache on the world also
   * avoids module-global object-identity state leaking across sessions.
   */
  private readonly surveyOrigins = new Map<RigId, { x: number; z: number }>();
  /**
   * Sites whose horizon signal the active rig can currently see.
   *
   * Derived world knowledge, not saved state: it is recomputed from position on the
   * same movement threshold as the survey sweep, so a loaded run rebuilds it on the
   * first step rather than carrying a stale set across sessions.
   */
  readonly visibleSignals = new Set<WorldSiteId>();

  constructor(readonly seed: string) {
    this.terrain = new TerrainField(seed);
    this.obstacles = new ObstacleField(seed, this.terrain);
    this.exploration = new ExplorationField(seed, this.terrain);

    // -----------------------------------------------------------------------
    // Authored terrain bottleneck: a deliberate gully between Home Silo and
    // Long Furrow that blocks the direct overland path. The player encounters
    // this during the first-session Reclamation journey: they see Long Furrow,
    // attempt the direct route, hit the face, learn they need the blade, and
    // then plough through it. This gully is *insurance* — procedural terrain
    // may already create steep faces, but this guarantees the blockage exists
    // on every seed so the journey is always discoverable.
    //
    // Placed on the direct line between the two sites, offset slightly off the
    // authored track corridor so it never interferes with the graded route.
    // The surface at this location must be deformable (grass/mud, not rock or
    // track) for the plough to work.
    // -----------------------------------------------------------------------
    // Placed perpendicular to the Home→Long Furrow route, offset ~10 m
    // outside the 7 m half-width corridor so the surface is deformable
    // (grass/mud, not hardpan track).
    const gullyX = -1;
    const gullyZ = -20;
    const gullyApplied = this.terrain.deform(gullyX, gullyZ, -0.38, 3);
    this.terrain.deform(gullyX + 4, gullyZ + 2, -0.22, 2);
    this.terrain.deform(gullyX - 3, gullyZ - 2, -0.18, 2);
    if (!gullyApplied) {
      console.warn(
        "Reclamation gully: primary deform rejected at",
        gullyX,
        gullyZ,
        "— surface may be non-deformable. The pre-blade journey will still"
        + " fire but the terrain face may not block traversal.",
      );
    }
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

  /**
   * Claim the next survey/visibility refresh for a rig after sufficient motion.
   *
   * The first call after construction or reset always succeeds.
   */
  claimSurveyRefresh(rigId: RigId, x: number, z: number): boolean {
    const last = this.surveyOrigins.get(rigId);
    if (last && Math.hypot(x - last.x, z - last.z) < SURVEY_MOVE_THRESHOLD) {
      return false;
    }
    this.surveyOrigins.set(rigId, { x, z });
    return true;
  }

  cameraObstruction(
    from: ScenePoint,
    to: ScenePoint,
    cameraRadius = 0.45,
    options?: CameraObstructionOptions,
  ): CameraObstructionHit | null {
    return queryCameraObstruction(this, from, to, cameraRadius, options);
  }

  structureCollision(
    rig: StructureCollisionBody,
    rigRadius: number,
  ): StructureCollisionOutcome {
    return resolveRigStructureCollision(this, rig, rigRadius);
  }

  reset(): void {
    this.terrain.clearDeformations();
    this.felledObstacles.clear();
    this.collectedNodes.clear();
    this.surveyedCells.clear();
    this.visibleSignals.clear();
    this.surveyOrigins.clear();
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
