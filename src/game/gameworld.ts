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

import {
  ObstacleField,
  type Obstacle,
  type PlanarPoint,
  type WorldCollisionContact,
} from "./collision";
import { calculateErosionResistanceFactor } from "./soil-ecosystem";
import {
  ExplorationField,
  MAX_SURVEYED_CELLS,
  SURVEY_MOVE_THRESHOLD,
} from "./exploration";
import {
  FIELD_CONDITION_CELL_SIZE,
  MAX_FIELD_CONDITION_CELLS,
  advanceFieldCondition,
  createFieldConditionCell,
  disturbFieldCondition,
  fieldConditionCellOf,
  fieldConditionKey,
  recoverFieldConditionCell,
  type FieldConditionCell,
} from "./field-conditions";
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
import { findSite, type CommunityPassageId, type WorldSiteId } from "./world";
import {
  advanceQuarryRunout,
  createQuarryRunout,
  displaceQuarryRunout,
  quarryRunoutObstacle,
  recoverQuarryRunout,
  type QuarryRunoutState,
} from "./road-incidents";

/** Bound on felled obstacles retained, oldest dropped first. */
export const MAX_FELLED = 1500;

/** Bound on collected salvage node ids retained. */
export const MAX_COLLECTED_NODES = 2500;

export interface WorldMemoryRecord {
  deformation: DeformationEntry[];
  felled: string[];
  collected: string[];
  surveyed: number[];
  /** Optional so every prior spatial-memory record remains recoverable. */
  fieldConditions?: FieldConditionCell[];
  /** Optional so saves made before dynamic incidents recover unchanged. */
  quarryRunout?: QuarryRunoutState;
}

export interface CollisionTelemetrySnapshot {
  totalContacts: number;
  policyViolationCount: number;
  /** Fixed steps since these contacts occurred; zero means this step. */
  contactAgeSteps: number | null;
  contacts: readonly WorldCollisionContact[];
}

const COLLISION_CONTACT_RETENTION_STEPS = 12;
const MAX_RECENT_COLLISION_PAIRS = 16;

function trimSet<T>(target: Set<T>, limit: number): void {
  while (target.size > limit) {
    const oldest = target.keys().next();
    if (oldest.done) break;
    target.delete(oldest.value);
  }
}

function trimMap<K, V>(target: Map<K, V>, limit: number): void {
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
  /** Slow simulation state for terrain the player has disturbed. */
  private readonly fieldConditions = new Map<string, FieldConditionCell>();
  private fieldConditionElapsedWorldMinutes = 0;
  /** Monotonic signal for presentation mirrors of persistent field condition. */
  private fieldConditionRevision = 0;
  private totalCollisionContacts = 0;
  private collisionPolicyViolationCount = 0;
  private currentCollisionContacts: WorldCollisionContact[] = [];
  private recentCollisionContacts: WorldCollisionContact[] = [];
  private recentCollisionContactAgeSteps: number | null = null;
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
  private quarryRunout: QuarryRunoutState;
  private roadIncidentRevision = 0;

  constructor(readonly seed: string) {
    this.terrain = new TerrainField(seed);
    this.obstacles = new ObstacleField(seed, this.terrain);
    this.exploration = new ExplorationField(seed, this.terrain);
    this.quarryRunout = this.createQuarryRunout();

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
    // Authored terrain bottleneck: a deliberate gully between Home Silo and
    // Long Furrow that creates a visible mud depression on the direct overland
    // path. DEFORM_MIN clamps each cell to −0.42 m, so the gully cannot
    // hard-block the tractor (which needs ~4 m rise across its wheelbase).
    // Instead it provides a visible mud surface that slows traversal — the
    // player returns for the blade, ploughs through, and the R2 proof shows
    // tilled ground is faster than mud. Secondary deforms widen the depression
    // so an off-centre approach still encounters mud.
    //
    // ATTEMPT_ROUTE_RADIUS in first-rung.ts must stay ≥ the distance from
    // Long Furrow to this gully centre so the guidance prompt fires BEFORE
    // the player reaches the depression.
    const gullyX = -2;
    const gullyZ = -12;
    const gullyApplied = this.terrain.deform(gullyX, gullyZ, -0.42, 3);
    this.terrain.deform(gullyX + 4, gullyZ + 1, -0.3, 2);
    this.terrain.deform(gullyX - 3, gullyZ - 2, -0.2, 2);
    if (!gullyApplied) {
      console.warn(
        "Reclamation gully: primary deform rejected at",
        gullyX,
        gullyZ,
        "— surface may be non-deformable. The pre-blade journey will still" +
          " fire but the terrain face may not block traversal.",
      );
    }
  }

  /** Reconcile settlement-derived route history into the one canonical terrain field. */
  reconcileCommunityPassages(
    passageIds: readonly CommunityPassageId[],
  ): boolean {
    const changed = this.terrain.reconcileCommunityPassages(passageIds);
    if (changed) this.obstacles.invalidateTerrainRoutes();
    return changed;
  }

  private createQuarryRunout(): QuarryRunoutState {
    const quarry = findSite("quarry-shelf");
    const grove = findSite("toy-grove");
    if (!quarry || !grove) {
      throw new Error("Quarry Runout requires Quarry Shelf and Toy Grove.");
    }
    return createQuarryRunout(
      quarry.x + (grove.x - quarry.x) * 0.42,
      quarry.z + (grove.z - quarry.z) * 0.42,
    );
  }

  /** Advance optional environmental incidents from the canonical world clock. */
  advanceRoadIncidents(worldMinutes: number, soilMoistureRatio: number) {
    const transition = advanceQuarryRunout(
      this.quarryRunout,
      worldMinutes,
      soilMoistureRatio,
    );
    if (transition.state !== this.quarryRunout) {
      this.quarryRunout = transition.state;
      this.roadIncidentRevision += 1;
    }
    return transition;
  }

  /** Incident boulders are collision candidates beside, never inside, natural generation. */
  incidentObstacles(): readonly Obstacle[] {
    const boulder = this.quarryRunout.boulder;
    const groundY = boulder
      ? this.terrain.height(boulder.x, boulder.z)
      : this.terrain.height(this.quarryRunout.originX, this.quarryRunout.originZ);
    const obstacle = quarryRunoutObstacle(this.quarryRunout, groundY);
    return obstacle ? [obstacle] : [];
  }

  incidentObstaclesNear(x: number, z: number, range: number): readonly Obstacle[] {
    return this.incidentObstacles().filter(
      (obstacle) => Math.hypot(obstacle.x - x, obstacle.z - z) <= range,
    );
  }

  /** Move a runout boulder only after a real collision identifies it. */
  displaceRoadIncident(
    obstacleId: string | null,
    rigMassKg: number,
    rigSpeedMps: number,
    rigX: number,
    rigZ: number,
    worldMinutes: number,
  ) {
    const knownObstacle = this.incidentObstacles().find(
      (obstacle) => obstacle.id === obstacleId,
    );
    if (!knownObstacle) {
      return { moved: false, cleared: false, impulseN: 0 };
    }
    const transition = displaceQuarryRunout(
      this.quarryRunout,
      rigMassKg,
      rigSpeedMps,
      rigX,
      rigZ,
      worldMinutes,
    );
    if (transition.state !== this.quarryRunout) {
      this.quarryRunout = transition.state;
      this.roadIncidentRevision += 1;
    }
    return transition;
  }

  roadIncidentRevisionNumber(): number {
    return this.roadIncidentRevision;
  }

  roadIncidentProjection() {
    return {
      id: this.quarryRunout.id,
      status: this.quarryRunout.status,
      triggeredAtWorldMinutes: this.quarryRunout.triggeredAtWorldMinutes,
      clearedAtWorldMinutes: this.quarryRunout.clearedAtWorldMinutes,
      boulder: this.quarryRunout.boulder
        ? { x: this.quarryRunout.boulder.x, z: this.quarryRunout.boulder.z }
        : null,
    };
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
   * Read the persistent response of a disturbed patch, when the point has one.
   * Untouched terrain deliberately remains procedural and weather-driven.
   */
  fieldConditionAt(x: number, z: number): Readonly<FieldConditionCell> | null {
    const [cx, cz] = fieldConditionCellOf(x, z);
    return this.fieldConditions.get(fieldConditionKey(cx, cz)) ?? null;
  }

  /** Iterate canonical field-memory cells for presentation without creating a parallel map model. */
  *fieldConditionEntries(): IterableIterator<Readonly<FieldConditionCell>> {
    yield* this.fieldConditions.values();
  }

  /** Increases whenever persistent field condition is created, advanced, restored, or cleared. */
  fieldConditionRevisionNumber(): number {
    return this.fieldConditionRevision;
  }

  /**
   * Rooted ground resists further cutting. Untouched terrain stays governed by
   * its authored material; only remembered player-affected ground participates
   * in the slower biological response.
   */
  fieldErosionResistanceAt(x: number, z: number): number {
    const condition = this.fieldConditionAt(x, z);
    return condition
      ? calculateErosionResistanceFactor(condition.rootDensity)
      : 1;
  }

  /** Record deliberate terrain work through the same spatial-memory budget as terrain edits. */
  noteFieldWork(x: number, z: number, moistureRatio: number): void {
    const [cx, cz] = fieldConditionCellOf(x, z);
    const key = fieldConditionKey(cx, cz);
    const prior =
      this.fieldConditions.get(key) ??
      createFieldConditionCell(x, z, moistureRatio);
    this.fieldConditions.set(key, disturbFieldCondition(prior, 0.32));
    trimMap(this.fieldConditions, MAX_FIELD_CONDITION_CELLS);
    this.fieldConditionRevision += 1;
  }

  /**
   * Materialize a deliberate water-management outcome in the same bounded field
   * memory that weather, traction, the map, and terrain tint already consume.
   * Existing ecological history survives; only moisture-derived ground strength
   * is reset to the chosen local water state.
   */
  applyWaterworksFieldCondition(
    x: number,
    z: number,
    radius: number,
    moistureRatio: number,
  ): void {
    const boundedRadius = Math.max(FIELD_CONDITION_CELL_SIZE, radius);
    const boundedMoisture = Math.min(1, Math.max(0, moistureRatio));
    for (
      let sampleX = x - boundedRadius;
      sampleX <= x + boundedRadius;
      sampleX += FIELD_CONDITION_CELL_SIZE
    ) {
      for (
        let sampleZ = z - boundedRadius;
        sampleZ <= z + boundedRadius;
        sampleZ += FIELD_CONDITION_CELL_SIZE
      ) {
        if (Math.hypot(sampleX - x, sampleZ - z) > boundedRadius) continue;
        const [cx, cz] = fieldConditionCellOf(sampleX, sampleZ);
        const key = fieldConditionKey(cx, cz);
        const prior = this.fieldConditions.get(key);
        const waterCondition = createFieldConditionCell(
          sampleX,
          sampleZ,
          boundedMoisture,
        );
        this.fieldConditions.set(
          key,
          prior
            ? {
                ...waterCondition,
                vegetationCoverage: prior.vegetationCoverage,
                rootDensity: prior.rootDensity,
                soilHealth: prior.soilHealth,
              }
            : waterCondition,
        );
      }
    }
    trimMap(this.fieldConditions, MAX_FIELD_CONDITION_CELLS);
    this.fieldConditionRevision += 1;
  }

  /** Wheelspin creates a durable scar rather than a transient traction number. */
  noteWheelspin(
    x: number,
    z: number,
    moistureRatio: number,
    disturbance: number,
  ): void {
    if (disturbance <= 0) return;
    const [cx, cz] = fieldConditionCellOf(x, z);
    const key = fieldConditionKey(cx, cz);
    const prior =
      this.fieldConditions.get(key) ??
      createFieldConditionCell(x, z, moistureRatio);
    this.fieldConditions.set(key, disturbFieldCondition(prior, disturbance));
    trimMap(this.fieldConditions, MAX_FIELD_CONDITION_CELLS);
    this.fieldConditionRevision += 1;
  }

  /**
   * Advance only remembered field cells at a coarse world-time cadence. The
   * kernel supplies local machine drainage, keeping GameWorld independent from
   * any particular infrastructure implementation.
   */
  advanceFieldConditions(
    deltaWorldMinutes: number,
    rainIntensity: number,
    drainageRateAt: (x: number, z: number) => number,
  ): void {
    this.fieldConditionElapsedWorldMinutes += Math.max(0, deltaWorldMinutes);
    if (this.fieldConditionElapsedWorldMinutes < 5) return;
    const deltaWorldHours = this.fieldConditionElapsedWorldMinutes / 60;
    this.fieldConditionElapsedWorldMinutes = 0;
    for (const [key, cell] of this.fieldConditions) {
      const x = (cell.cx + 0.5) * FIELD_CONDITION_CELL_SIZE;
      const z = (cell.cz + 0.5) * FIELD_CONDITION_CELL_SIZE;
      this.fieldConditions.set(
        key,
        advanceFieldCondition(
          cell,
          deltaWorldHours,
          rainIntensity,
          drainageRateAt(x, z),
        ),
      );
    }
    if (this.fieldConditions.size > 0) this.fieldConditionRevision += 1;
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
    previous?: PlanarPoint,
  ): StructureCollisionOutcome {
    return resolveRigStructureCollision(this, rig, rigRadius, previous);
  }

  beginCollisionStep(): void {
    this.currentCollisionContacts = [];
    if (this.recentCollisionContactAgeSteps !== null) {
      this.recentCollisionContactAgeSteps += 1;
      if (
        this.recentCollisionContactAgeSteps > COLLISION_CONTACT_RETENTION_STEPS
      ) {
        this.recentCollisionContacts = [];
        this.recentCollisionContactAgeSteps = null;
      }
    }
  }

  noteCollisionContacts(
    contacts: readonly WorldCollisionContact[],
    policyViolationCount = 0,
  ): void {
    if (contacts.length > 0) {
      this.currentCollisionContacts.push(...contacts);
      for (const contact of contacts) {
        const existingIndex = this.recentCollisionContacts.findIndex(
          (recent) =>
            recent.firstId === contact.firstId &&
            recent.secondId === contact.secondId &&
            recent.firstRole === contact.firstRole &&
            recent.secondRole === contact.secondRole,
        );
        if (existingIndex < 0) {
          this.recentCollisionContacts.push({ ...contact });
        } else if (
          contact.impactSpeed >=
          this.recentCollisionContacts[existingIndex]!.impactSpeed
        ) {
          this.recentCollisionContacts[existingIndex] = { ...contact };
        }
      }
      if (this.recentCollisionContacts.length > MAX_RECENT_COLLISION_PAIRS) {
        this.recentCollisionContacts.splice(
          0,
          this.recentCollisionContacts.length - MAX_RECENT_COLLISION_PAIRS,
        );
      }
      this.recentCollisionContactAgeSteps = 0;
      this.totalCollisionContacts += contacts.length;
    }
    this.collisionPolicyViolationCount += Math.max(
      0,
      Math.trunc(policyViolationCount),
    );
  }

  collisionTelemetry(): CollisionTelemetrySnapshot {
    return {
      totalContacts: this.totalCollisionContacts,
      policyViolationCount: this.collisionPolicyViolationCount,
      contactAgeSteps: this.recentCollisionContactAgeSteps,
      contacts: this.recentCollisionContacts.map((contact) => ({
        ...contact,
      })),
    };
  }

  reset(): void {
    this.reconcileCommunityPassages([]);
    this.terrain.clearDeformations();
    this.felledObstacles.clear();
    this.collectedNodes.clear();
    this.surveyedCells.clear();
    this.fieldConditions.clear();
    this.quarryRunout = this.createQuarryRunout();
    this.roadIncidentRevision += 1;
    this.fieldConditionElapsedWorldMinutes = 0;
    this.fieldConditionRevision += 1;
    this.visibleSignals.clear();
    this.surveyOrigins.clear();
    this.totalCollisionContacts = 0;
    this.collisionPolicyViolationCount = 0;
    this.currentCollisionContacts = [];
    this.recentCollisionContacts = [];
    this.recentCollisionContactAgeSteps = null;
  }

  snapshot(): WorldMemoryRecord {
    return {
      deformation: this.terrain.deformationEntries(),
      felled: [...this.felledObstacles],
      collected: [...this.collectedNodes],
      surveyed: [...this.surveyedCells],
      fieldConditions: [...this.fieldConditions.values()],
      quarryRunout: this.quarryRunout,
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

    if (Array.isArray(record.fieldConditions)) {
      for (const entry of record.fieldConditions.slice(-MAX_FIELD_CONDITION_CELLS)) {
        const cell = recoverFieldConditionCell(entry);
        if (!cell) continue;
        this.fieldConditions.set(fieldConditionKey(cell.cx, cell.cz), cell);
      }
    }
    this.quarryRunout = recoverQuarryRunout(
      record.quarryRunout,
      this.createQuarryRunout(),
    );
    this.roadIncidentRevision += 1;
    this.fieldConditionRevision += 1;
  }
}
