/**
 * The gameplay kernel: fixed-step orchestration over the world substrate.
 *
 * This module owns *what happens*, not *how motion works* (`physics.ts`), *what
 * the ground is* (`terrain.ts`), or *what is out there* (`collision.ts`,
 * `exploration.ts`). It reads those, applies consequences, and writes
 * diagnostics. Keeping the orchestration thin is what lets each substrate be
 * tested in isolation.
 *
 * Determinism contract: given the same seed, the same `GameWorld`, the same
 * starting `GameState`, and the same sequence of `(input, dt)` pairs, this
 * produces identical output. `window.applyRigInput` and the vitest suite both
 * depend on it, and no code here may consult wall-clock time or `Math.random`.
 */

import {
  BUGGY_RAMP,
  CAMERA_MODES,
  type CameraMode,
  CARGO_PICKUP,
  cargoDeliveryTarget,
  cargoPickupTarget,
  effectiveProfile,
  FIELD_CLOCK_SAVE_SCHEMA_VERSION,
  FIELD_02_SAVE_SCHEMA_VERSION,
  FIXED_STEP_SECONDS,
  GLOAM_START_MINUTE,
  type CutFillEditRecord,
  type FleetInheritanceRecord,
  type FurrowMark,
  type ActiveMissionState,
  type FarmWaterworksChoice,
  type FarmWaterworksState,
  type GameState,
  type GroundMobilityState,
  type NorthFieldInvestigationState,
  type RoadRivalryState,
  IDLE_INPUT,
  type InputFrame,
  LANDMARKS,
  LEGACY_SAVE_SCHEMA_VERSION,
  MAX_CULTIVATED_CELLS,
  MAX_FURROWS,
  MODULES,
  MODULE_IDS,
  cultivatedRowsFor,
  type EffectiveRig,
  type HarvestState,
  type ModuleId,
  NIGHT_START_MINUTE,
  phaseForWorldTime,
  RIG_CAPABILITIES,
  RIG_IDS,
  RIG_SWITCH_RANGE,
  RIG_LAB_SAVE_SCHEMA_VERSION,
  RIG_PROFILES,
  rigCollisionRadius,
  type RigCapability,
  type RigId,
  type RigState,
  DRIFT_BERTH_SAVE_SCHEMA_VERSION,
  SAVE_SCHEMA_VERSION,
  PREVIOUS_SAVE_SCHEMA_VERSION,
  V27_SAVE_SCHEMA_VERSION,
  V26_SAVE_SCHEMA_VERSION,
  V18_SAVE_SCHEMA_VERSION,
  V24_SAVE_SCHEMA_VERSION,
  V17_SAVE_SCHEMA_VERSION,
  V12_SAVE_SCHEMA_VERSION,
  V13_SAVE_SCHEMA_VERSION,
  V14_SAVE_SCHEMA_VERSION,
  V15_SAVE_SCHEMA_VERSION,
  V16_SAVE_SCHEMA_VERSION,
  V11_SAVE_SCHEMA_VERSION,
  V10_SAVE_SCHEMA_VERSION,
  V9_SAVE_SCHEMA_VERSION,
  V8_SAVE_SCHEMA_VERSION,
  type SurveyRouteState,
  V7_SAVE_SCHEMA_VERSION,
  V6_SAVE_SCHEMA_VERSION,
  type WorldPhase,
  WORLD_CLOCK_START_MINUTES,
  WORLD_DAY_MINUTES,
  WORLD_LIMIT,
  WORLD_MINUTES_PER_REAL_SECOND,
  worldMinuteOfDay,
  type RestorationState,
  type OpeningNamingState,
  type ArrivalBargainState,
} from "./contracts";
import {
  createFirstNightThreat,
  firstNightThreatDiagnostic,
  firstNightThreatObstacle,
  recoverFirstNightThreat,
  resolveFirstNightThreat,
  type FirstNightThreatState,
} from "./first-night-threat";
import {
  createOpenWorldPromise,
  openWorldPromiseNarration,
  recoverOpenWorldPromise,
  resolveOpenWorldPromise,
} from "./open-world-promise";
import {
  CRAFTING_RECIPES,
  canCraftRecipe,
  craftRecipe,
} from "./salvage-crafting";
import {
  componentWearDeficit,
  createComponentHealth,
  formatWearDiagnostic,
  serviceSurchargeSalvage,
  updateComponentWear,
  WEAR_FLUSH_INTERVAL_M,
  type ComponentHealthState,
} from "./vehicle-maintenance";
import {
  createInitialProgressionState,
  moduleSlotsForJourney,
  JOURNEY_PHASES,
  MASTERY_RANKS,
  type RigJourneyState,
  type MasteryState,
  type JourneyPhase,
  type MasteryRank,
  type ProgressionState,
} from "./progression";
import { applyActivityCompletionProgression } from "./mission-resolver";
import {
  activeMissionMatching,
  completeMission,
  failMission,
} from "./mission-lifecycle";
import {
  applyFarmWaterworksSettlementOutcome,
  canFulfillCultivationNeed,
  createSettlementState,
  deriveSettlementCommunityPassageIds,
  deriveSettlementWorldLeads,
  isSettlementNeedOutcomeId,
  nearbySettlementContact,
  recordSettlementAdaptation,
  recordSettlementContribution,
  recoverSettlementState,
  rustlineServiceStocked,
} from "./settlement-needs";
import {
  availableSettlementCargoManifest,
  completeSettlementCargoDelivery,
  prepareSettlementCargo,
} from "./settlement-cargo";
import {
  deriveSettlementLife,
  communityAdaptationCandidates,
  resolveSettlementContribution,
  settlementContactSpeech,
  type SettlementResponseDefinition,
} from "./settlement-life";
import { deriveCommunityTraffic } from "./community-traffic";
import { MISSION_CLASSES, type MissionClass } from "./mission-propositions";
import {
  RELAY_CARGO_TOW_AFFORDANCE,
  NORTH_FIELD_SEISMIC_AFFORDANCE,
  SURVEY_CONTRACT_AFFORDANCE,
  resolveAffordance,
  type AffordanceResolution,
} from "./affordances";
import {
  activityDefinition,
  createRoadRivalryState,
  createSurveyRouteState,
  evaluateRoadRivalry,
  evaluateSurveyRoute,
  roadRivalryGateIds,
  roadRivalryStartInReach,
  startRoadRivalry,
  surveyRouteMinutesRemaining,
  surveyRouteTargets,
  withdrawRoadRivalry,
} from "./activities";
import {
  DEFAULT_TIRE_PRESSURE_PSI,
  MAX_TIRE_PRESSURE_PSI,
  MIN_TIRE_PRESSURE_PSI,
  type DifferentialMode,
  type RigToolState,
} from "./contracts";
import { SALVAGE_PICKUP_RADIUS } from "./exploration";
import { deriveWeatherState } from "./weather";
import { deriveFleetRecoveryAssessment } from "./fleet-recovery-assessment";
import {
  applyFleetRecovery,
  fleetRecoveryProjection,
  resolveFleetRecoveryCommand,
  type FleetRecoveryCommand,
  type FleetRecoveryTransition,
} from "./fleet-recovery-command";
import {
  evaluateCorridorQuality,
  resolveFirstRung,
  syncUnboundPassageFromCorridor,
  workshopActionable as firstRungWorkshopActionable,
} from "./first-rung";
import type { GameWorld } from "./gameworld";
import {
  advanceInfrastructure,
  createInfrastructureNetworkState,
  deriveInfrastructureEffects,
  performInfrastructureAction,
  publicInfrastructureNetwork,
  recoverInfrastructureNetwork,
  resolveInfrastructureAction,
} from "./infrastructure-network";
import {
  resolveDynamicBodyCollisions,
  type DynamicCollisionBody,
  type WorldCollisionContact,
} from "./collision";
import { clamp } from "./noise";
import {
  createUnboundPassageState,
  readUnboundPassage,
  restoreUnboundPassage,
} from "./unbound-passage";
import { rigIsStable, settleRig, stepRigMotion } from "./physics";
import { resolveTerrainTraversal } from "./terrain-traversal";
import {
  findSite,
  HOME_SITE,
  isWithinSiteServiceArea,
  NORTH_FIELD_SEISMIC_CACHE,
  RESOLVED_ROUTES,
  RIG_HOME_BERTHS,
  SITE_SIGNALS,
  WORLD_SITES,
} from "./world";
import { fireSeismicPulse } from "./seismic-probe";

const FURROW_SPACING = 1.1;
const CARGO_HITCH_DISTANCE = 2.8;
const CARGO_COLLISION_RADIUS = 0.9;
const CARGO_COLLISION_MASS = 1.35;
const PHASE_ORDER: readonly WorldPhase[] = ["day", "gloam", "night"];

/** Depth the plough cuts per pass, in metres. */
const PLOUGH_DEPTH = -0.13;

/**
 * Height the blade adds per pass in fill mode, in metres.
 *
 * Smaller than the cut depth because `DEFORM_MAX` (+0.3 m) is a third of the
 * available cut, so filling should take proportionally more passes than digging.
 * Filling a wet cell far enough crosses the mud/grass threshold in `surfaceFor`,
 * which is the point: soil moved by the player changes what the ground *is*.
 */
const PLOUGH_FILL = 0.075;

/**
 * How close two rigs must be to swap between them, in metres.
 *
 * Without this, switching rigs teleported the player's attention across the whole
 * world for free — which deleted logistics from a game whose entire substrate is
 * logistics. With it, where you park is a decision, fetching a stranded machine is
 * an errand, and the winch and the module fitted to the rig you left behind both
 * start to matter.
 */
export { RIG_SWITCH_RANGE } from "./contracts";

/** Salvage cost to restore a rig to full condition. */
export const REPAIR_COST = 3;

/** Condition restored per repair. */
const REPAIR_AMOUNT = 100;

/** Limp-home condition granted only after a rig is fully disabled. */
export const EMERGENCY_RECOVERY_CONDITION = 25;

function approach(value: number, target: number, amount: number): number {
  if (value < target) return Math.min(target, value + amount);
  return Math.max(target, value - amount);
}

function cycle<T>(values: readonly T[], current: T): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? values[0]!;
}

function createWheels(): GroundMobilityState["wheels"] {
  return Array.from({ length: 4 }, () => ({
    compression: 0.5,
    contact: true,
    slip: 0,
  }));
}

function createMobility(id: RigId): RigState["mobility"] {
  const profile = RIG_PROFILES[id];
  if (profile.mobilityAdapter === "hover") {
    return {
      kind: "hover",
      liftVelocity: 0,
      clearance: profile.rideHeight,
      cushionPressure: 1,
      skirtContact: true,
    };
  }
  return {
    kind: "ground",
    verticalVelocity: 0,
    grounded: true,
    jumpCooldownMs: 0,
    wheelRotation: 0,
    wheels: createWheels(),
  };
}

function createRig(
  id: RigId,
  x: number,
  z: number,
  heading = Math.PI,
): RigState {
  return {
    id,
    fieldName: RIG_PROFILES[id].fieldName,
    x,
    y: 0,
    z,
    heading,
    pitch: 0,
    roll: 0,
    speed: 0,
    steering: 0,
    distanceTravelled: 0,
    condition: 100,
    strain: 0,
    componentHealth: createComponentHealth(),
    componentWearFlushedAtM: 0,
    mobility: createMobility(id),
    attachments:
      id === "utility-tractor"
        ? [
            { id: "field-plough", engaged: false, mode: "cut" },
            { id: "tow-hook", engaged: false },
          ]
        : [{ id: "tow-hook", engaged: false }],
    modules: [],
    tools: {
      tirePressurePsi: DEFAULT_TIRE_PRESSURE_PSI,
      differentialMode: "open",
    },
    telemetry: {
      surfaceId: "grass",
      grade: 0,
      grip: 1,
      slip: 0,
      waterDepth: 0,
      engineLoad: 0,
      stalled: false,
    },
  };
}

export function createInitialState(seed = "UNBOUND-260725"): GameState {
  const rigs = RIG_IDS.reduce(
    (acc, id) => {
      acc[id] = createRig(
        id,
        RIG_HOME_BERTHS[id].x,
        RIG_HOME_BERTHS[id].z,
        RIG_HOME_BERTHS[id].heading,
      );
      return acc;
    },
    {} as Record<RigId, RigState>,
  );
  // The old man's tractor in Campaign One's opening: disabled but restorable.
  // This is the diegetic reason the workshop exists before the player can work.
  rigs["utility-tractor"].condition = 0;
  rigs["utility-tractor"].componentHealth = {
    tireTreadHealthPercent: 35,
    radiatorCleanlinessPercent: 25,
    winchCableIntegrityPercent: 60,
    alternatorBeltHealthPercent: 40,
  };

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed,
    worldTimeMinutes: WORLD_CLOCK_START_MINUTES,
    elapsedMs: 0,
    phase: "day",
    cameraMode: "chase",
    paused: false,
    mapOpen: false,
    activeRigId: "utility-tractor",
    rigs,
    cargoRelay: {
      id: "cargo-relay",
      status: "ready",
      startedAt: null,
      completedAt: null,
      bestTimeMs: null,
      assignment: null,
      cargo: {
        id: "relay-cargo",
        x: CARGO_PICKUP.x,
        y: 0.65,
        z: CARGO_PICKUP.z,
        heading: 0,
        attachedRigId: null,
        delivered: false,
      },
    },
    surveyRoute: createSurveyRouteState(),
    roadRivalry: createRoadRivalryState(),
    infrastructure: createInfrastructureNetworkState(),
    farmWaterworks: { choice: "unresolved", chosenAtWorldMinutes: null },
    northFieldInvestigation: {
      status: "unresolved",
      scannedAtWorldMinutes: null,
      anomalyDepthMeters: null,
    },
    settlements: createSettlementState(),
    activeMission: null,
    activeSideMissions: [],
    unboundPassage: createUnboundPassageState(),
    furrows: [],
    semanticEdits: [],
    fleetInheritance: [],
    discoveries: [],
    salvage: 0,
    salvageCollected: 0,
    inventory: {
      "steel-scrap": 0,
      microchips: 0,
      "fuel-cell-core": 0,
    },
    partsBin: [],
    restoration: {
      diagnosed: false,
      repaired: false,
      firstStart: false,
    },
    openingNaming: { status: "waiting" },
    arrivalBargain: { status: "unseen" },
    firstNightThreat: createFirstNightThreat(),
    openWorldPromise: createOpenWorldPromise(),
    recovery: {
      emergencyCount: 0,
      lastEmergencyAtMs: null,
    },
    progression: createInitialProgressionState(RIG_IDS),
    harvest: {
      cultivatedCells: [],
      cultivatedRows: 0,
      totalRows: 4,
      delivered: false,
      stormArrived: false,
      stormAtMinutes: 1200, // 20:00 in the deterministic weather clock
    },
    lastDiagnostic: null,
  };
}

export interface RigRenameResult {
  accepted: boolean;
  reason: string;
  fieldName: string | null;
}

/**
 * Change a vehicle's player-owned field name at the canonical workshop.
 *
 * Names are instance state, never blueprint configuration. The workshop is the
 * current intent surface because it already owns durable rig service; a future
 * dialogue naming beat will call this same transition rather than add another
 * identity write path.
 */
export function renameRig(
  state: GameState,
  rigId: RigId,
  requestedName: string,
  source: "workshop" | "opening-naming" = "workshop",
): RigRenameResult {
  const rig = state.rigs[rigId];
  if (!rig) {
    return {
      accepted: false,
      reason: "That rig is unavailable.",
      fieldName: null,
    };
  }
  if (source === "workshop" && !workshopInReach(state)) {
    const reason = "Rig names can be recorded at the Home Silo workshop.";
    state.lastDiagnostic = reason;
    return { accepted: false, reason, fieldName: null };
  }
  if (
    source === "opening-naming" &&
    (state.openingNaming.status !== "ready" ||
      !isOpeningNamingReady(state, rigId))
  ) {
    const reason =
      "That name is earned after the restored tractor has helped in the field.";
    state.lastDiagnostic = reason;
    return { accepted: false, reason, fieldName: null };
  }

  const fieldName = requestedName.trim().replace(/\s+/g, " ");
  if (
    fieldName.length < 2 ||
    fieldName.length > 28 ||
    /[\u0000-\u001F\u007F]/.test(fieldName)
  ) {
    const reason = "Use a name from 2 to 28 visible characters.";
    state.lastDiagnostic = reason;
    return { accepted: false, reason, fieldName: null };
  }

  const previousName = rig.fieldName;
  rig.fieldName = fieldName;
  if (source === "opening-naming") {
    state.openingNaming.status = "complete";
    state.lastDiagnostic = `The old man smiles. ${previousName} is now known as ${fieldName}.`;
  } else {
    state.lastDiagnostic = `${previousName} is now known as ${fieldName}.`;
  }
  return { accepted: true, reason: state.lastDiagnostic, fieldName };
}

function isOpeningNamingReady(state: GameState, rigId: RigId): boolean {
  return (
    rigId === "utility-tractor" &&
    state.restoration.firstStart &&
    state.furrows.some((furrow) => furrow.rigId === "utility-tractor")
  );
}

/** Complete the Campaign One naming beat through the shared identity transition. */
export function completeOpeningNaming(
  state: GameState,
  requestedName: string,
): RigRenameResult {
  return renameRig(state, "utility-tractor", requestedName, "opening-naming");
}

/**
 * Accept the old man's shelter-for-repair bargain.
 *
 * This is the canonical transition that makes the restoration loop available.
 * It is idempotent: accepting again leaves the state unchanged.
 */
export function acceptArrivalBargain(state: GameState): void {
  if (state.arrivalBargain.status === "accepted") return;
  state.arrivalBargain.status = "accepted";
  state.lastDiagnostic =
    "The old man nods. Fix the tractor, earn the bed. The workshop is open.";
}

/**
 * Refuse the old man's bargain without blocking future play.
 *
 * The offer can be presented again when the player opens the workshop.
 */
export function refuseArrivalBargain(state: GameState): void {
  if (state.arrivalBargain.status !== "unseen") return;
  state.arrivalBargain.status = "refused";
  state.lastDiagnostic =
    "The old man shrugs. The offer stands if you change your mind.";
}

/**
 * Commit the Home Valley waterworks branch once. The branch changes real field
 * memory and the existing drain-pump operation; it is not a mission-only flag.
 */
export function chooseFarmWaterworks(
  state: GameState,
  world: GameWorld,
  choice: Exclude<FarmWaterworksChoice, "unresolved">,
): boolean {
  if (!state.restoration.firstStart) {
    state.lastDiagnostic =
      "Bring the restored tractor to life before deciding the farm waterworks.";
    return false;
  }
  if (!workshopInReach(state)) {
    state.lastDiagnostic =
      "The old man needs this waterworks decision at the Home Silo workshop.";
    return false;
  }
  if (state.farmWaterworks.choice !== "unresolved") {
    state.lastDiagnostic =
      "The waterworks have already been set for this valley.";
    return false;
  }
  const longFurrow = findSite("long-furrow");
  if (!longFurrow) {
    state.lastDiagnostic =
      "Long Furrow is not available for waterworks planning.";
    return false;
  }

  const pumpId = "long-furrow-drain-pump";
  const pump = state.infrastructure.entities[pumpId];
  if (choice === "repair-pump") {
    world.applyWaterworksFieldCondition(longFurrow.x, longFurrow.z, 30, 0.22);
    state.infrastructure.entities[pumpId] = {
      ...pump,
      known: true,
      commandedOn: true,
    };
    state.lastDiagnostic =
      "Pump repaired. Long Furrow drains and the cultivation ground begins to firm.";
  } else {
    const approachX = (HOME_SITE.x + longFurrow.x) / 2;
    const approachZ = (HOME_SITE.z + longFurrow.z) / 2;
    world.applyWaterworksFieldCondition(approachX, approachZ, 24, 0.88);
    state.infrastructure.entities[pumpId] = {
      ...pump,
      known: true,
      commandedOn: false,
    };
    state.lastDiagnostic =
      "Channel redirected. The troughs are secure, but the low approach is now deep mud.";
  }
  state.farmWaterworks = {
    choice,
    chosenAtWorldMinutes: state.worldTimeMinutes,
  };
  applyFarmWaterworksSettlementOutcome(state, choice);
  return true;
}

/**
 * The resolved first-night threat as a real collidable obstacle, reusing the
 * same `Obstacle` primitive `world.incidentObstacles()` already renders
 * through. Returns an empty array before the threat resolves or once its
 * origin cannot be placed on the terrain.
 */
export function firstNightThreatObstacles(
  threat: FirstNightThreatState,
  world: GameWorld,
) {
  if (threat.originX === null || threat.originZ === null) return [];
  const obstacle = firstNightThreatObstacle(
    threat,
    world.terrain.height(threat.originX, threat.originZ),
  );
  return obstacle ? [obstacle] : [];
}

function recoverProgression(value: unknown): ProgressionState {
  if (!value || typeof value !== "object") {
    return createInitialProgressionState(RIG_IDS);
  }

  const candidate = value as Record<string, unknown>;
  const journeys: Record<string, RigJourneyState> = {};
  if (candidate.journeys && typeof candidate.journeys === "object") {
    for (const [rigId, journeyVal] of Object.entries(candidate.journeys)) {
      if (journeyVal && typeof journeyVal === "object") {
        const j = journeyVal as Record<string, unknown>;
        journeys[rigId] = {
          phase:
            typeof j.phase === "string" &&
            JOURNEY_PHASES.includes(j.phase as any)
              ? (j.phase as JourneyPhase)
              : "found",
          investment: typeof j.investment === "number" ? j.investment : 0,
          completedDeeds: Array.isArray(j.completedDeeds)
            ? j.completedDeeds.filter((d): d is string => typeof d === "string")
            : [],
        };
      }
    }
  }
  // Fill missing rigs
  for (const rigId of RIG_IDS) {
    if (!journeys[rigId]) {
      journeys[rigId] = { phase: "found", investment: 0, completedDeeds: [] };
    }
  }

  const mastery: Record<
    string,
    Partial<Record<RigCapability, MasteryState>>
  > = {};
  if (candidate.mastery && typeof candidate.mastery === "object") {
    for (const [rigId, masteryVal] of Object.entries(candidate.mastery)) {
      if (masteryVal && typeof masteryVal === "object") {
        const rigMastery: Partial<Record<RigCapability, MasteryState>> = {};
        for (const [cap, stateVal] of Object.entries(masteryVal)) {
          if (!RIG_CAPABILITIES.includes(cap as RigCapability)) continue;
          if (stateVal && typeof stateVal === "object") {
            const s = stateVal as Record<string, unknown>;
            rigMastery[cap as RigCapability] = {
              rank:
                typeof s.rank === "string" &&
                MASTERY_RANKS.includes(s.rank as any)
                  ? (s.rank as MasteryRank)
                  : "novice",
              points: typeof s.points === "number" ? s.points : 0,
              situations:
                s.situations && typeof s.situations === "object"
                  ? Object.fromEntries(
                      Object.entries(s.situations).map(([k, v]) => [
                        k,
                        typeof v === "number" ? v : 0,
                      ]),
                    )
                  : {},
            };
          }
        }
        mastery[rigId] = rigMastery;
      }
    }
  }

  const completedMilestones = Array.isArray(candidate.completedMilestones)
    ? candidate.completedMilestones.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  return {
    journeys,
    mastery,
    insight: typeof candidate.insight === "number" ? candidate.insight : 0,
    completedMilestones,
  };
}

/**
 * Place both rigs and the relay cargo on the terrain.
 *
 * Must be called after `createInitialState` or a save restore, before the first
 * step. A rig created at `y = 0` on 12 m terrain would otherwise spend its first
 * frames falling and register a hard landing at spawn.
 */
export function settleWorld(state: GameState, world: GameWorld): void {
  world.reconcileCommunityPassages(deriveSettlementCommunityPassageIds(state));
  for (const id of RIG_IDS) {
    const rig = state.rigs[id];
    settleRig(rig, effectiveProfile(id, rig.modules), world.terrain);
  }
  const cargo = state.cargoRelay.cargo;
  if (cargo.attachedRigId === null) {
    cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
  }
}

export function activeRig(state: GameState): RigState {
  return state.rigs[state.activeRigId];
}

export function activeProfile(state: GameState) {
  const rig = activeRig(state);
  return effectiveProfile(rig.id, rig.modules);
}

export function hasCapability(
  rig: RigState,
  capability: RigCapability,
): boolean {
  return effectiveProfile(rig.id, rig.modules).capabilities.includes(
    capability,
  );
}

function attachment(
  rig: RigState,
  id: RigState["attachments"][number]["id"],
): RigState["attachments"][number] | undefined {
  return rig.attachments.find((item) => item.id === id);
}

/** The workshop site, if the active rig is standing in its service area. */
export function workshopInReach(state: GameState) {
  const rig = activeRig(state);
  return WORLD_SITES.find(
    (site) =>
      "workshop" in site &&
      site.workshop === true &&
      isWithinSiteServiceArea(site, rig.x, rig.z),
  );
}

/**
 * Places able to perform mechanical maintenance. Home Silo remains the only
 * full workshop; Rustline becomes a maintenance yard only after the player has
 * materially restored its crews' ability to work.
 */
export function repairServiceInReach(state: GameState) {
  const workshop = workshopInReach(state);
  if (workshop) {
    return { site: workshop, name: "Home Silo workshop" } as const;
  }
  const rig = activeRig(state);
  const rustline = findSite("salvage-yard");
  if (
    rustline &&
    rustlineServiceStocked(state) &&
    isWithinSiteServiceArea(rustline, rig.x, rig.z)
  ) {
    return { site: rustline, name: "Rustline service yard" } as const;
  }
  return undefined;
}

// -----------------------------------------------------------------------------
// Player actions
// -----------------------------------------------------------------------------

export type PrimaryActionKind =
  | "release-cargo"
  | "prepare-settlement-cargo"
  | "attach-cargo"
  | "inspect-infrastructure"
  | "service-infrastructure"
  | "hear-settlement-contact"
  | "take-survey-contract"
  | "start-road-rivalry"
  | "withdraw-road-rivalry"
  | "probe-north-field"
  | "collect-salvage"
  | "lower-plough"
  | "raise-plough"
  | "contribute-settlement"
  | "deliver-harvest"
  | "none";

/** Versioned local intent contract for the first command/event proof slice. */
export const PRIMARY_ACTION_COMMAND_VERSION = 1 as const;
export const PRIMARY_ACTION_EVENT_VERSION = 1 as const;

export interface PrimaryActionCommand {
  version: typeof PRIMARY_ACTION_COMMAND_VERSION;
  type: "primary-action";
  actorId: RigId;
}

export type PrimaryActionRejectionReason =
  | "inactive-actor"
  | "unsupported-command"
  | "offer-unavailable"
  | "missing-capability"
  | "no-contextual-action";

/**
 * An immutable outcome of a validated primary-action command.
 *
 * The bounded run record assigns sequence/id metadata when it captures this
 * event. Keeping those concerns separate prevents an input-history detail from
 * becoming simulation authority.
 */
export interface PrimaryActionEvent {
  version: typeof PRIMARY_ACTION_EVENT_VERSION;
  type: "primary-action-resolved";
  command: PrimaryActionCommand;
  action: PrimaryActionKind;
  outcome: "accepted" | "rejected";
  reasonCode?: PrimaryActionRejectionReason;
}

export interface PrimaryActionResolution {
  kind: PrimaryActionKind;
  label: string;
  ariaLabel: string;
  /** Structured compatibility evidence when a contextual offer is denied. */
  affordance?: AffordanceResolution;
  settlementResponse?: SettlementResponseDefinition;
}

/**
 * Resolve the exact action before mutating anything.
 *
 * This is the shared truth for UI labels, accessibility text, browser
 * acceptance, and the mutation path below. It deliberately returns a semantic
 * kind rather than a callback so replay/authority layers can record intent.
 */
export function resolvePrimaryAction(
  state: GameState,
  world: GameWorld,
): PrimaryActionResolution {
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);
  const relay = state.cargoRelay;
  const cargo = relay.cargo;
  const settlementCargo = availableSettlementCargoManifest(state, rig.x, rig.z);

  if (settlementCargo) {
    return {
      kind: "prepare-settlement-cargo",
      label: settlementCargo.label,
      ariaLabel: settlementCargo.label,
    };
  }
  const pickup = cargoPickupTarget(relay);

  if (cargo.attachedRigId === rig.id) {
    return {
      kind: "release-cargo",
      label: "Release",
      ariaLabel: "Release relay cargo",
    };
  }

  const cargoAffordance = resolveAffordance(
    RELAY_CARGO_TOW_AFFORDANCE,
    { capabilities: profile.capabilities },
    {
      available: !cargo.delivered && cargo.attachedRigId === null,
      inRange: Math.hypot(rig.x - cargo.x, rig.z - cargo.z) <= pickup.radius,
    },
  );

  if (cargoAffordance.outcome === "legal") {
    return {
      kind: "attach-cargo",
      label: "Attach",
      ariaLabel: "Attach relay cargo",
    };
  }

  if (
    cargoAffordance.reasonCode === "missing-capability" &&
    cargoAffordance.outcome === "impossible" &&
    !cargo.delivered &&
    cargo.attachedRigId === null &&
    Math.hypot(rig.x - cargo.x, rig.z - cargo.z) <= pickup.radius
  ) {
    return {
      kind: "none",
      label: "Tow required",
      ariaLabel: "Relay cargo requires a tow capability",
      affordance: cargoAffordance,
    };
  }

  const infrastructureAction = resolveInfrastructureAction(
    state.infrastructure,
    {
      rigId: rig.id,
      x: rig.x,
      z: rig.z,
      capabilities: profile.capabilities,
      salvage: state.salvage,
      nowMs: state.elapsedMs,
    },
  );
  if (infrastructureAction.kind === "inspect") {
    return {
      kind: "inspect-infrastructure",
      label: infrastructureAction.label,
      ariaLabel: infrastructureAction.ariaLabel,
      affordance: infrastructureAction.affordance,
    };
  }
  if (infrastructureAction.kind === "service") {
    return {
      kind: "service-infrastructure",
      label: infrastructureAction.label,
      ariaLabel: infrastructureAction.ariaLabel,
      affordance: infrastructureAction.affordance,
    };
  }
  if (infrastructureAction.entityId !== null && infrastructureAction.label) {
    return {
      kind: "none",
      label: infrastructureAction.label,
      ariaLabel: infrastructureAction.ariaLabel,
      affordance: infrastructureAction.affordance,
    };
  }

  const northField = findSite("north-field");
  const northFieldAffordance = resolveAffordance(
    NORTH_FIELD_SEISMIC_AFFORDANCE,
    { capabilities: profile.capabilities },
    {
      available: state.northFieldInvestigation.status === "unresolved",
      inRange:
        northField !== undefined &&
        isWithinSiteServiceArea(northField, rig.x, rig.z),
    },
  );
  if (northFieldAffordance.outcome === "legal") {
    return {
      kind: "probe-north-field",
      label: "Pulse ground",
      ariaLabel: "Pulse the North Field seismic anomaly",
      affordance: northFieldAffordance,
    };
  }

  const node = world.exploration.nearestNode(
    rig.x,
    rig.z,
    SALVAGE_PICKUP_RADIUS,
    world.collectedNodes,
  );
  if (node) {
    return {
      kind: "collect-salvage",
      label: `Collect ${node.value}`,
      ariaLabel: `Collect ${node.value} salvage`,
    };
  }

  const plough = attachment(rig, "field-plough");
  if (plough && profile.capabilities.includes("plough")) {
    return plough.engaged
      ? {
          kind: "raise-plough",
          label: "Raise blade",
          ariaLabel: "Raise field plough",
        }
      : {
          kind: "lower-plough",
          label: "Lower blade",
          ariaLabel: "Lower field plough",
        };
  }

  const settlementResponse = resolveSettlementContribution(
    state,
    { quarryRunoutStatus: world.roadIncidentProjection().status },
    {
      x: rig.x,
      z: rig.z,
      capabilities: profile.capabilities,
      interaction: "context",
    },
  );
  if (settlementResponse) {
    return {
      kind: "contribute-settlement",
      label: settlementResponse.label,
      ariaLabel: `${settlementResponse.label} at the local settlement`,
      settlementResponse,
    };
  }

  // First playable slice: deliver cultivated crops at the Long Furrow barn.
  const lfSite = findSite("long-furrow");
  if (lfSite && !state.harvest.delivered && state.harvest.cultivatedRows > 0) {
    const barnX = lfSite.x + 14;
    const barnZ = lfSite.z + 2;
    const distToBarn = Math.hypot(rig.x - barnX, rig.z - barnZ);
    if (distToBarn < 6) {
      return {
        kind: "deliver-harvest",
        label: "Deliver harvest",
        ariaLabel: "Deliver cultivated crops to the Long Furrow barn",
      };
    }
  }

  // Named locals offer optional, revisitable place knowledge after immediate
  // machine work has taken priority. This is not a quest giver branch: hearing
  // them does not accept work, change state, or direct the player anywhere.
  const contact = nearbySettlementContact(state, rig.x, rig.z, 3, {
    quarryRunoutStatus: world.roadIncidentProjection().status,
  });
  if (contact) {
    return {
      kind: "hear-settlement-contact",
      label: `Hear ${contact.speaker}`,
      ariaLabel: `Hear ${contact.speaker} at ${contact.siteName}`,
    };
  }

  // The Grove Run is an optional local sport, not a contract board. It is
  // deliberately entered at the physical start line and can be withdrawn from
  // without failing a mission or changing the world.
  if (roadRivalryStartInReach(rig.x, rig.z)) {
    if (state.roadRivalry.status === "active") {
      return {
        kind: "withdraw-road-rivalry",
        label: "Leave Grove Run",
        ariaLabel: "Withdraw from the active Grove Run",
      };
    }
    if (profile.capabilities.includes("rally")) {
      return {
        kind: "start-road-rivalry",
        label: "Run Grove line",
        ariaLabel: "Start the Grove Run through Quarry Shelf to Home Silo",
      };
    }
  }

  /*
   * The survey contract board is a deliberate local offer, but it must not hide
   * ambient actions (collecting salvage) or immediate tool intent (plough control).
   * Keep this branch after salvage/plough checks so non-survey rigs retain expected
   * interaction paths at Home.
   */
  const surveyAvailable =
    state.surveyRoute.status === "ready" ||
    state.surveyRoute.status === "failed";
  const surveyAffordance = resolveAffordance(
    SURVEY_CONTRACT_AFFORDANCE,
    { capabilities: profile.capabilities },
    {
      available: surveyAvailable,
      inRange: isWithinSiteServiceArea(HOME_SITE, rig.x, rig.z),
    },
  );
  if (surveyAffordance.outcome === "legal") {
    return {
      kind: "take-survey-contract",
      label: "Take contract",
      ariaLabel: "Take the survey contract",
      affordance: surveyAffordance,
    };
  }
  const surveyMismatch =
    surveyAffordance.reasonCode === "missing-capability" &&
    surveyAvailable &&
    isWithinSiteServiceArea(HOME_SITE, rig.x, rig.z);

  // An impossible opportunity must not hide a legal contextual action such as
  // salvage collection or a fitted tool. Surface the mismatch only as the
  // fallback when nothing the active rig can actually do is in reach.
  if (surveyMismatch) {
    return {
      kind: "none",
      label: "Survey required",
      ariaLabel: "The survey contract requires a survey capability",
      affordance: surveyAffordance,
    };
  }

  return {
    kind: "none",
    label: "Explore",
    ariaLabel: "No contextual action in reach",
  };
}

/**
 * The single context action.
 *
 * Ordered as a priority chain so one button is never ambiguous: what you are
 * holding beats what you are standing on, which beats what you are carrying a
 * tool for. Every branch sets a diagnostic explaining the verb *and* its
 * consequence, per the UI rules in `DESIGN.md`.
 */
function primaryActionEvent(
  command: PrimaryActionCommand,
  action: PrimaryActionKind,
  outcome: PrimaryActionEvent["outcome"],
  reasonCode?: PrimaryActionRejectionReason,
): PrimaryActionEvent {
  return {
    version: PRIMARY_ACTION_EVENT_VERSION,
    type: "primary-action-resolved",
    command: { ...command },
    action,
    outcome,
    ...(reasonCode ? { reasonCode } : {}),
  };
}

/**
 * Validate, transition, and report the first explicit local activity command.
 *
 * This intentionally remains a narrow vertical slice. It establishes the
 * command -> validation -> transition -> event contract without inventing a
 * second event store or granting presentation ownership of game state.
 */
export function executePrimaryActionCommand(
  state: GameState,
  world: GameWorld,
  command: PrimaryActionCommand,
): PrimaryActionEvent {
  if (
    command.version !== PRIMARY_ACTION_COMMAND_VERSION ||
    command.type !== "primary-action"
  ) {
    return primaryActionEvent(
      command,
      "none",
      "rejected",
      "unsupported-command",
    );
  }
  if (command.actorId !== state.activeRigId) {
    return primaryActionEvent(command, "none", "rejected", "inactive-actor");
  }

  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);
  const relay = state.cargoRelay;
  const cargo = relay.cargo;
  const resolution = resolvePrimaryAction(state, world);

  if (resolution.kind === "prepare-settlement-cargo") {
    const manifest = availableSettlementCargoManifest(state, rig.x, rig.z);
    if (!manifest || !prepareSettlementCargo(state, manifest)) {
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    state.lastDiagnostic = manifest.loadedDiagnostic;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "release-cargo") {
    cargo.attachedRigId = null;
    const forwardX = Math.sin(rig.heading);
    const forwardZ = Math.cos(rig.heading);
    cargo.x = rig.x - forwardX * CARGO_HITCH_DISTANCE;
    cargo.z = rig.z - forwardZ * CARGO_HITCH_DISTANCE;
    cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
    attachment(rig, "tow-hook")!.engaged = false;
    state.lastDiagnostic = "Cargo released. The relay clock keeps running.";
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "attach-cargo") {
    cargo.attachedRigId = rig.id;
    attachment(rig, "tow-hook")!.engaged = true;
    if (relay.status === "ready") {
      relay.status = "active";
      relay.startedAt = state.elapsedMs;
    }
    const destination = cargoDeliveryTarget(relay);
    const destinationName = destination.siteId
      ? (findSite(destination.siteId)?.name ?? "the destination")
      : "Long Furrow";
    state.lastDiagnostic = `${profile.displayName} attached the cargo. Haul it to ${destinationName}.`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "take-survey-contract") {
    const targets = surveyRouteTargets();
    // A retaken contract starts clean rather than resuming a lapsed one: the
    // sightings were paid for by a window that has already closed.
    state.surveyRoute = {
      ...createSurveyRouteState(),
      status: "active",
      startedAtMinutes: state.worldTimeMinutes,
      bestSightedCount: state.surveyRoute.bestSightedCount,
    };
    state.lastDiagnostic = `Survey contract taken. Sight ${targets.length} signals before the light goes — you do not have to reach them.`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "start-road-rivalry") {
    state.roadRivalry = startRoadRivalry(
      state.roadRivalry,
      rig.id,
      state.elapsedMs,
    );
    state.lastDiagnostic = `${rig.fieldName} is on the Grove Run. Quarry Shelf first, then Home Silo. The run is yours to leave whenever you return to Toy Grove.`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "withdraw-road-rivalry") {
    state.roadRivalry = withdrawRoadRivalry(state.roadRivalry);
    state.lastDiagnostic =
      "Grove Run withdrawn. The valley keeps your completed records, not unfinished attempts.";
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "probe-north-field") {
    const localMoisture =
      world.fieldConditionAt(rig.x, rig.z)?.moistureRatio ??
      deriveWeatherState(state.worldTimeMinutes).soilMoisture;
    const result = fireSeismicPulse(rig.x, rig.z, 8, localMoisture, [
      NORTH_FIELD_SEISMIC_CACHE,
    ]);
    if (result.detectedAnomaly?.type !== "salvage-cache") {
      state.lastDiagnostic =
        "The pulse returned only ordinary strata. Reposition over the field signal.";
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    state.northFieldInvestigation = {
      status: "scanned",
      scannedAtWorldMinutes: state.worldTimeMinutes,
      anomalyDepthMeters: result.detectedAnomaly.depthMeters,
    };
    if (
      !state.discoveries.some((discovery) => discovery.id === "north-field")
    ) {
      state.discoveries.push({
        id: "north-field",
        discoveredAt: state.elapsedMs,
      });
    }
    state.progression.insight += 1;
    state.lastDiagnostic = `Seismic return: buried cache at ${result.detectedAnomaly.depthMeters.toFixed(1)} m. The North Field signal is real. +1 Insight.`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "collect-salvage") {
    const node = world.exploration.nearestNode(
      rig.x,
      rig.z,
      SALVAGE_PICKUP_RADIUS,
      world.collectedNodes,
    );
    if (!node) {
      state.lastDiagnostic =
        "The salvage signal moved out of reach. Reposition and try again.";
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    world.collect(node.id);
    const localInfrastructure = deriveInfrastructureEffects(
      state.infrastructure,
      node.x,
      node.z,
    );
    const recoveredValue = Math.max(
      1,
      Math.round(node.value * localInfrastructure.salvageYieldMultiplier),
    );
    state.salvage += recoveredValue;
    state.salvageCollected += recoveredValue;
    // Commodity awards are deterministic and tied to salvage value so crafting
    // reads as a consequence of exploration, not a separate economy.
    const steel = recoveredValue;
    const chips = Math.floor(recoveredValue / 2);
    const cores = Math.floor(recoveredValue / 3);
    state.inventory["steel-scrap"] += steel;
    state.inventory["microchips"] += chips;
    state.inventory["fuel-cell-core"] += cores;
    const commodityPart =
      chips > 0 || cores > 0
        ? ` (+${steel} steel${chips > 0 ? `, +${chips} chips` : ""}${cores > 0 ? `, +${cores} cores` : ""})`
        : "";
    const infrastructurePart =
      localInfrastructure.salvageYieldMultiplier === 1
        ? ""
        : ` Quarry network yield x${localInfrastructure.salvageYieldMultiplier.toFixed(2)}.`;
    state.lastDiagnostic = `Recovered ${recoveredValue} salvage${commodityPart}. ${state.salvage} in the bin.${infrastructurePart}`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (
    resolution.kind === "lower-plough" ||
    resolution.kind === "raise-plough"
  ) {
    const plough = attachment(rig, "field-plough");
    if (!plough) {
      state.lastDiagnostic = "The field plough is no longer available.";
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    plough.engaged = !plough.engaged;
    state.lastDiagnostic = plough.engaged
      ? "Field plough lowered. Soft ground will hold the cut."
      : "Field plough raised.";
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (resolution.kind === "contribute-settlement") {
    const response = resolveSettlementContribution(
      state,
      { quarryRunoutStatus: world.roadIncidentProjection().status },
      {
        x: rig.x,
        z: rig.z,
        capabilities: profile.capabilities,
        interaction: "context",
      },
    );
    if (!response) {
      state.lastDiagnostic =
        "The local work has changed. Read the settlement again before acting.";
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    const accepted = recordSettlementContribution(
      state,
      response.settlementId,
      {
        responseId: response.id,
        materialEffectId: response.materialEffectId,
        capability: response.capability,
        createdAtWorldMinutes: state.worldTimeMinutes,
      },
    );
    state.lastDiagnostic = accepted
      ? `${response.label}. ${response.explanation} The settlement remembers this help, but other pressures remain.`
      : "That local contribution is already part of the settlement's history.";
    return primaryActionEvent(
      command,
      resolution.kind,
      accepted ? "accepted" : "rejected",
      accepted ? undefined : "offer-unavailable",
    );
  }

  if (resolution.kind === "deliver-harvest") {
    if (state.harvest.delivered) {
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    if (state.harvest.cultivatedRows <= 0) {
      state.lastDiagnostic =
        "Nothing to deliver yet. Plough the crop rows first.";
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "no-contextual-action",
      );
    }
    state.harvest.delivered = true;
    const rows = state.harvest.cultivatedRows;
    const salvageReward = rows * 3;
    state.salvage += salvageReward;
    state.salvageCollected += salvageReward;
    // Record the long-furrow-first-cut outcome for settlement condition.
    const recorded = recordSettlementContribution(state, "long-furrow", {
      responseId: "long-furrow-first-cut",
      materialEffectId: "long-furrow:cultivated",
      capability: "plough",
      createdAtWorldMinutes: state.worldTimeMinutes,
    });
    state.lastDiagnostic = recorded
      ? `Delivered ${rows} rows of harvest. ${salvageReward} salvage earned. Sava Nune: The furrow is open.`
      : `Delivered ${rows} rows of harvest. ${salvageReward} salvage earned.`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  if (
    resolution.kind === "inspect-infrastructure" ||
    resolution.kind === "service-infrastructure"
  ) {
    const outcome = performInfrastructureAction(
      state.infrastructure,
      {
        rigId: rig.id,
        x: rig.x,
        z: rig.z,
        capabilities: profile.capabilities,
        salvage: state.salvage,
        nowMs: state.elapsedMs,
      },
      resolution.kind === "inspect-infrastructure" ? "inspect" : "service",
    );
    state.infrastructure = outcome.network;
    state.salvage += outcome.salvageDelta;
    state.lastDiagnostic = outcome.explanation;
    return primaryActionEvent(
      command,
      resolution.kind,
      outcome.accepted ? "accepted" : "rejected",
      outcome.accepted ? undefined : "no-contextual-action",
    );
  }

  if (resolution.kind === "hear-settlement-contact") {
    const contact = nearbySettlementContact(state, rig.x, rig.z, 3, {
      quarryRunoutStatus: world.roadIncidentProjection().status,
    });
    if (!contact) {
      state.lastDiagnostic =
        "The local has stepped away. Move closer to someone at the settlement.";
      return primaryActionEvent(
        command,
        resolution.kind,
        "rejected",
        "offer-unavailable",
      );
    }
    const life = deriveSettlementLife(state, {
      quarryRunoutStatus: world.roadIncidentProjection().status,
    }).find((settlement) => settlement.settlementId === contact.settlementId);
    state.lastDiagnostic = `${contact.speaker}: ${
      life ? settlementContactSpeech(life) : contact.text
    }`;
    return primaryActionEvent(command, resolution.kind, "accepted");
  }

  const reasonCode =
    resolution.affordance?.reasonCode === "missing-capability"
      ? "missing-capability"
      : "no-contextual-action";
  state.lastDiagnostic =
    reasonCode === "missing-capability"
      ? resolution.affordance?.affordanceId === "survey-contract-board"
        ? `${rig.fieldName} cannot take this contract: survey capability required.`
        : `${rig.fieldName} cannot attach this relay cargo: tow capability required.`
      : "Nothing in reach. Salvage sits off the graded tracks — leave the road.";
  return primaryActionEvent(command, resolution.kind, "rejected", reasonCode);
}

/** Compatibility entrypoint for existing input and browser surfaces. */
export function performPrimaryAction(
  state: GameState,
  world: GameWorld,
): PrimaryActionEvent {
  return executePrimaryActionCommand(state, world, {
    version: PRIMARY_ACTION_COMMAND_VERSION,
    type: "primary-action",
    actorId: state.activeRigId,
  });
}

/**
 * Winch self-recovery: earned anti-frustration.
 *
 * Being stuck on ground you cannot climb is the intended consequence of the grade
 * model, but being *permanently* stuck is a bug in the player's experience rather
 * than a lesson. Recovery is gated behind the winch module so the answer to
 * "I'm stuck" is a thing you went and earned, not a menu option.
 */
export function winchRecover(state: GameState, world: GameWorld): void {
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);

  if (rig.condition <= 0) {
    const cargo = state.cargoRelay.cargo;
    if (cargo.attachedRigId === rig.id) {
      cargo.attachedRigId = null;
      cargo.x = rig.x;
      cargo.z = rig.z;
      cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
      attachment(rig, "tow-hook")!.engaged = false;
    }

    const berth = RIG_HOME_BERTHS[rig.id];
    rig.x = berth.x;
    rig.z = berth.z;
    rig.heading = berth.heading;
    rig.speed = 0;
    rig.steering = 0;
    rig.strain = 0;
    rig.condition = EMERGENCY_RECOVERY_CONDITION;
    settleRig(rig, profile, world.terrain);
    state.recovery.emergencyCount = Math.min(
      999_999,
      state.recovery.emergencyCount + 1,
    );
    state.recovery.lastEmergencyAtMs = state.elapsedMs;
    state.lastDiagnostic = `Emergency field recovery returned ${rig.fieldName} to Home Silo with a ${EMERGENCY_RECOVERY_CONDITION}% limp-home patch. No salvage awarded.`;
    return;
  }

  if (!profile.capabilities.includes("winch")) {
    // Basic always-available recovery: a weak, costly nudge back to the nearest
    // track without needing a winch module.  This breaks the circular dependency
    // ChatGPT flagged: need salvage → stuck → can't get salvage → can't recover.
    // The winch is the superior version; this is the safety net.
    let bestX: number = HOME_SITE.x;
    let bestZ: number = HOME_SITE.z;
    let bestDistance = Infinity;
    for (const route of RESOLVED_ROUTES) {
      const dx = route.bx - route.ax;
      const dz = route.bz - route.az;
      const lengthSquared = dx * dx + dz * dz;
      const t =
        lengthSquared <= 1e-6
          ? 0
          : clamp(
              ((rig.x - route.ax) * dx + (rig.z - route.az) * dz) /
                lengthSquared,
              0,
              1,
            );
      const px = route.ax + dx * t;
      const pz = route.az + dz * t;
      const distance = Math.hypot(rig.x - px, rig.z - pz);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestX = px;
        bestZ = pz;
      }
    }

    if (bestDistance > 60) {
      state.lastDiagnostic =
        "Too far from any track for a basic nudge. Reverse or steer downhill.";
      return;
    }

    rig.x = bestX;
    rig.z = bestZ;
    rig.speed = 0;
    rig.steering = 0;
    rig.strain = clamp(rig.strain + 0.4, 0, 1);
    rig.condition = clamp(rig.condition - 8, 0, 100);
    settleRig(rig, profile, world.terrain);
    state.lastDiagnostic = `Nudged ${Math.round(bestDistance)} m back to the track. Condition ${Math.round(rig.condition)}%. A winch would cost less.`;
    return;
  }

  // Nearest point on the authored track network within reach.
  let bestX: number = HOME_SITE.x;
  let bestZ: number = HOME_SITE.z;
  let bestDistance = Infinity;
  for (const route of RESOLVED_ROUTES) {
    const dx = route.bx - route.ax;
    const dz = route.bz - route.az;
    const lengthSquared = dx * dx + dz * dz;
    const t =
      lengthSquared <= 1e-6
        ? 0
        : clamp(
            ((rig.x - route.ax) * dx + (rig.z - route.az) * dz) / lengthSquared,
            0,
            1,
          );
    const px = route.ax + dx * t;
    const pz = route.az + dz * t;
    const distance = Math.hypot(rig.x - px, rig.z - pz);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestX = px;
      bestZ = pz;
    }
  }

  if (bestDistance > 110) {
    state.lastDiagnostic =
      "No anchor point in winch range. Drive back toward a graded track.";
    return;
  }

  rig.x = bestX;
  rig.z = bestZ;
  rig.speed = 0;
  rig.steering = 0;
  rig.strain = clamp(rig.strain + 0.25, 0, 1);
  rig.condition = clamp(rig.condition - 2, 0, 100);
  settleRig(rig, profile, world.terrain);
  state.lastDiagnostic = `Winched ${Math.round(bestDistance)} m back to the graded track. Condition ${Math.round(rig.condition)}%.`;
}

export function installModule(
  state: GameState,
  world: GameWorld,
  moduleId: ModuleId,
): void {
  const rig = activeRig(state);
  const definition = MODULES[moduleId];
  if (!definition) {
    state.lastDiagnostic = "Unknown module.";
    return;
  }
  if (!workshopInReach(state)) {
    state.lastDiagnostic = `${definition.name} needs the Home Silo workshop. Drive back to the pad.`;
    return;
  }
  if (!definition.fits.includes(rig.id)) {
    state.lastDiagnostic = `${definition.name} does not fit ${rig.fieldName}.`;
    return;
  }
  if (rig.modules.includes(moduleId)) {
    state.lastDiagnostic = `${definition.name} is already fitted.`;
    return;
  }
  if (state.salvage < definition.cost) {
    state.lastDiagnostic = `${definition.name} costs ${definition.cost} salvage; ${state.salvage} in the bin.`;
    return;
  }

  state.salvage -= definition.cost;
  rig.modules.push(moduleId);
  settleRig(rig, effectiveProfile(rig.id, rig.modules), world.terrain);
  state.lastDiagnostic = `${definition.name} fitted. ${definition.promise}`;
}

export function repairRig(state: GameState): void {
  const rig = activeRig(state);
  const service = repairServiceInReach(state);
  if (!service) {
    state.lastDiagnostic =
      "Repairs need the Home Silo workshop pad or a supplied Rustline service yard.";
    return;
  }
  const wearDeficit = componentWearDeficit(rig.componentHealth);
  if (rig.condition >= 99.5 && rig.strain < 0.05 && wearDeficit < 0.5) {
    state.lastDiagnostic = "Nothing to repair.";
    return;
  }
  // Mechanical service is a surcharge on the base repair, so a pure condition
  // repair costs exactly what it always did and worn components make the bill
  // honest instead of hidden.
  const surcharge = serviceSurchargeSalvage(rig.componentHealth);
  const cost = REPAIR_COST + surcharge;
  if (state.salvage < cost) {
    state.lastDiagnostic = `Repairs cost ${cost} salvage; ${state.salvage} in the bin.`;
    return;
  }
  state.salvage -= cost;
  rig.condition = Math.min(100, rig.condition + REPAIR_AMOUNT);
  rig.strain = 0;
  rig.componentHealth = createComponentHealth();
  state.lastDiagnostic =
    surcharge > 0
      ? `${service.name} rebuilt ${rig.fieldName} to ${Math.round(rig.condition)}% — tread, radiator, cable, and belt back to spec.`
      : `${service.name} rebuilt ${rig.fieldName} to ${Math.round(rig.condition)}%.`;
}

/**
 * Read the tractor's mechanical state and record that diagnosis has happened.
 *
 * This is the visible half of `vehicle-maintenance.ts`: it turns hidden wear
 * percentages into a player-facing report.
 */
export function diagnoseRestoration(state: GameState): void {
  const rig = activeRig(state);
  if (!workshopInReach(state)) {
    state.lastDiagnostic = "Diagnosis needs the Home Silo workshop pad.";
    return;
  }
  state.restoration.diagnosed = true;
  state.lastDiagnostic = formatWearDiagnostic(
    rig.condition,
    rig.componentHealth,
  );
}

/**
 * The one-time restoration of the old man's tractor.
 *
 * The first call is free — the old man's parts and tools — and brings the
 * machine from disabled to fully serviceable. After that, the workshop charges
 * the normal repair tariff.
 */
export function performRestorationService(state: GameState): void {
  const rig = activeRig(state);
  if (!workshopInReach(state)) {
    state.lastDiagnostic = "Restoration needs the Home Silo workshop pad.";
    return;
  }
  if (!state.restoration.repaired) {
    rig.condition = 100;
    rig.strain = 0;
    rig.componentHealth = createComponentHealth();
    state.restoration.repaired = true;
    state.lastDiagnostic = `${rig.fieldName} rebuilt from the old man's parts — first start is yours.`;
    return;
  }
  repairRig(state);
}

/** Acknowledge the first successful engine start after restoration. */
export function performFirstStart(state: GameState): void {
  const rig = activeRig(state);
  if (!state.restoration.repaired) {
    state.lastDiagnostic = "The tractor needs rebuilding before it will start.";
    return;
  }
  if (rig.condition <= 0) {
    state.lastDiagnostic =
      "The engine turns over but the rig is disabled. Restore it first.";
    return;
  }
  if (state.restoration.firstStart) {
    state.lastDiagnostic = "The engine is already running.";
    return;
  }
  state.restoration.firstStart = true;
  state.lastDiagnostic = `${rig.fieldName} starts. The old man nods — work can begin.`;
}

/**
 * Craft a module from commodities at the workshop.
 *
 * Crafted modules go to the parts bin and can be fitted without spending
 * salvage, wiring `salvage-crafting.ts` into the shell economy.
 */
export function craftModule(
  state: GameState,
  recipeIndex: number,
): ModuleId | null {
  const recipe = CRAFTING_RECIPES[recipeIndex];
  if (!recipe) {
    state.lastDiagnostic = "Unknown blueprint.";
    return null;
  }
  if (!workshopInReach(state)) {
    state.lastDiagnostic = "Crafting needs the Home Silo workshop.";
    return null;
  }
  if (!canCraftRecipe(recipe, state.inventory)) {
    state.lastDiagnostic = `${recipe.name} needs more materials.`;
    return null;
  }
  const result = craftRecipe(recipe, state.inventory);
  if (!result.success) {
    state.lastDiagnostic = `${recipe.name} could not be assembled.`;
    return null;
  }
  state.inventory = result.updatedInventory;
  state.partsBin.push(recipe.outputModuleId as ModuleId);
  state.lastDiagnostic = `${recipe.name} crafted and moved to the parts bin.`;
  return recipe.outputModuleId as ModuleId;
}

/**
 * Install a module from the parts bin.
 *
 * Same compatibility rules as `installModule`, but consumes a crafted part
 * instead of salvage.
 */
export function installFromPartsBin(
  state: GameState,
  world: GameWorld,
  moduleId: ModuleId,
): void {
  const rig = activeRig(state);
  const definition = MODULES[moduleId];
  if (!definition) {
    state.lastDiagnostic = "Unknown module.";
    return;
  }
  if (!workshopInReach(state)) {
    state.lastDiagnostic = `${definition.name} needs the Home Silo workshop. Drive back to the pad.`;
    return;
  }
  const binIndex = state.partsBin.indexOf(moduleId);
  if (binIndex === -1) {
    state.lastDiagnostic = `${definition.name} is not in the parts bin.`;
    return;
  }
  if (!definition.fits.includes(rig.id)) {
    state.lastDiagnostic = `${definition.name} does not fit ${rig.fieldName}.`;
    return;
  }
  if (rig.modules.includes(moduleId)) {
    state.lastDiagnostic = `${definition.name} is already fitted.`;
    return;
  }

  state.partsBin.splice(binIndex, 1);
  rig.modules.push(moduleId);
  settleRig(rig, effectiveProfile(rig.id, rig.modules), world.terrain);
  state.lastDiagnostic = `${definition.name} fitted from the parts bin. ${definition.promise}`;
}

/** Versioned local intent contract for the second command/event proof slice. */
export const RIG_SELECTION_COMMAND_VERSION = 1 as const;
export const RIG_SELECTION_EVENT_VERSION = 1 as const;

export interface RigSelectionCommand {
  version: typeof RIG_SELECTION_COMMAND_VERSION;
  type: "select-rig";
  actorId: RigId;
  targetRigId: RigId;
}

export type RigSelectionRejectionReason =
  | "inactive-actor"
  | "target-out-of-range"
  | "unstable-active-rig"
  | "unsupported-command";

export interface RigSelectionEvent {
  version: typeof RIG_SELECTION_EVENT_VERSION;
  type: "rig-selection-resolved";
  command: RigSelectionCommand;
  outcome: "accepted" | "rejected";
  /** Duplicate selection is accepted but has no state transition. */
  changed: boolean;
  reasonCode?: RigSelectionRejectionReason;
}

function rigSelectionEvent(
  command: RigSelectionCommand,
  outcome: RigSelectionEvent["outcome"],
  changed: boolean,
  reasonCode?: RigSelectionRejectionReason,
): RigSelectionEvent {
  return {
    version: RIG_SELECTION_EVENT_VERSION,
    type: "rig-selection-resolved",
    command: { ...command },
    outcome,
    changed,
    reasonCode,
  };
}

export function executeRigSelectionCommand(
  state: GameState,
  command: RigSelectionCommand,
): RigSelectionEvent {
  if (
    command.version !== RIG_SELECTION_COMMAND_VERSION ||
    command.type !== "select-rig" ||
    !RIG_IDS.includes(command.actorId) ||
    !RIG_IDS.includes(command.targetRigId)
  ) {
    state.lastDiagnostic = "Selection command is unsupported.";
    return rigSelectionEvent(command, "rejected", false, "unsupported-command");
  }
  if (command.actorId !== state.activeRigId) {
    state.lastDiagnostic = "Only the active rig can request a rig switch.";
    return rigSelectionEvent(command, "rejected", false, "inactive-actor");
  }
  if (command.targetRigId === state.activeRigId) {
    return rigSelectionEvent(command, "accepted", false);
  }

  const current = activeRig(state);
  if (!rigIsStable(current)) {
    state.lastDiagnostic =
      "Stabilize the active rig before switching machines.";
    return rigSelectionEvent(command, "rejected", false, "unstable-active-rig");
  }

  // Rigs are objects in the world, not entries in a menu.
  const target = state.rigs[command.targetRigId];
  const distance = Math.hypot(target.x - current.x, target.z - current.z);
  if (distance > RIG_SWITCH_RANGE) {
    const targetProfile = effectiveProfile(command.targetRigId, target.modules);
    const nearest = WORLD_SITES.reduce<{ name: string; d: number } | null>(
      (best, site) => {
        const d = Math.hypot(target.x - site.x, target.z - site.z);
        return best === null || d < best.d ? { name: site.name, d } : best;
      },
      null,
    );
    const where = nearest && nearest.d < 60 ? ` at the ${nearest.name}` : "";
    state.lastDiagnostic = `${targetProfile.fieldName} is ${Math.round(distance)} m away${where}. Drive to it.`;
    return rigSelectionEvent(command, "rejected", false, "target-out-of-range");
  }

  current.speed = 0;
  current.steering = 0;
  state.activeRigId = command.targetRigId;
  const profile = effectiveProfile(command.targetRigId, target.modules);
  state.lastDiagnostic = `${profile.displayName} active · ${profile.capabilities.join(" + ")}.`;
  return rigSelectionEvent(command, "accepted", true);
}

export function selectActiveRig(
  state: GameState,
  rigId: RigId,
): RigSelectionEvent {
  return executeRigSelectionCommand(state, {
    version: RIG_SELECTION_COMMAND_VERSION,
    type: "select-rig",
    actorId: state.activeRigId,
    targetRigId: rigId,
  });
}

export function switchActiveRig(state: GameState): RigSelectionEvent {
  return selectActiveRig(state, cycle(RIG_IDS, state.activeRigId));
}

/**
 * Flip the blade between cutting and filling.
 *
 * Refuses on a rig with no blade, and says which rig has one, because a silent
 * no-op on a keypress is indistinguishable from a broken key.
 */
export function toggleBladeMode(state: GameState): void {
  const rig = activeRig(state);
  const plough = attachment(rig, "field-plough");
  const profile = effectiveProfile(rig.id, rig.modules);
  if (!plough || !profile.capabilities.includes("plough")) {
    state.lastDiagnostic = `${rig.fieldName} carries no blade. Torque does.`;
    return;
  }
  plough.mode = plough.mode === "fill" ? "cut" : "fill";
  state.lastDiagnostic =
    plough.mode === "fill"
      ? "Blade set to FILL. Soft ground rises behind you, and wet ground dries."
      : "Blade set to CUT. Furrows deepen behind you.";
}

export function cyclePhase(state: GameState): void {
  const minute = worldMinuteOfDay(state.worldTimeMinutes);
  let delta: number;
  if (state.phase === "day") {
    delta =
      minute < GLOAM_START_MINUTE
        ? GLOAM_START_MINUTE - minute
        : WORLD_DAY_MINUTES - minute + GLOAM_START_MINUTE;
  } else if (state.phase === "gloam") {
    delta =
      minute < NIGHT_START_MINUTE
        ? NIGHT_START_MINUTE - minute
        : WORLD_DAY_MINUTES - minute + NIGHT_START_MINUTE;
  } else {
    delta =
      minute < WORLD_CLOCK_START_MINUTES
        ? WORLD_CLOCK_START_MINUTES - minute
        : WORLD_DAY_MINUTES - minute + WORLD_CLOCK_START_MINUTES;
  }
  state.worldTimeMinutes += delta;
  state.phase = phaseForWorldTime(state.worldTimeMinutes);
}

export function cycleCamera(state: GameState): void {
  state.cameraMode = cycle(CAMERA_MODES, state.cameraMode);
}

export function selectCamera(state: GameState, cameraMode: CameraMode): void {
  state.cameraMode = cameraMode;
}

export function togglePause(state: GameState): void {
  state.paused = !state.paused;
}

export function toggleMap(state: GameState): void {
  state.mapOpen = !state.mapOpen;
}

// -----------------------------------------------------------------------------
// Fixed step
// -----------------------------------------------------------------------------

function updateCargo(state: GameState, world: GameWorld, rig: RigState): void {
  const relay = state.cargoRelay;
  const cargo = relay.cargo;
  if (cargo.attachedRigId !== rig.id) return;

  const forwardX = Math.sin(rig.heading);
  const forwardZ = Math.cos(rig.heading);
  cargo.x = rig.x - forwardX * CARGO_HITCH_DISTANCE;
  cargo.z = rig.z - forwardZ * CARGO_HITCH_DISTANCE;
  // The crate rides the terrain, not the rig's suspension: it should drag on the
  // ground behind a rig that is nose-up on a climb.
  cargo.y =
    Math.max(world.terrain.height(cargo.x, cargo.z), rig.y - 1.2) + 0.65;
  cargo.heading = rig.heading;

  const destination = cargoDeliveryTarget(relay);
  if (
    Math.hypot(cargo.x - destination.x, cargo.z - destination.z) <=
    destination.radius
  ) {
    cargo.attachedRigId = null;
    cargo.delivered = true;
    cargo.x = destination.x;
    cargo.z = destination.z;
    cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;
    attachment(rig, "tow-hook")!.engaged = false;
    relay.status = "complete";
    relay.completedAt = state.elapsedMs;
    const duration =
      relay.startedAt === null ? 0 : state.elapsedMs - relay.startedAt;
    relay.bestTimeMs =
      relay.bestTimeMs === null
        ? duration
        : Math.min(relay.bestTimeMs, duration);
    const assignedMissionId = relay.assignment?.missionId;
    const deliveryMission = assignedMissionId
      ? state.activeMission?.id === assignedMissionId
        ? state.activeMission
        : (state.activeSideMissions.find(
            (mission) => mission.id === assignedMissionId,
          ) ?? null)
      : activeMissionMatching(state, "delivery");
    const settlementDelivery = completeSettlementCargoDelivery(state);
    if (settlementDelivery) {
      world.reconcileCommunityPassages(
        deriveSettlementCommunityPassageIds(state),
      );
      state.progression = applyActivityCompletionProgression(
        state.progression,
        "cargo-relay",
        rig.id,
      );
      state.lastDiagnostic = settlementDelivery;
    } else if (deliveryMission) {
      completeMission(state, deliveryMission.id, state.elapsedMs, world);
    } else {
      state.progression = applyActivityCompletionProgression(
        state.progression,
        "cargo-relay",
        rig.id,
      );
      state.lastDiagnostic = `Relay delivered in ${(duration / 1000).toFixed(1)} s with ${RIG_PROFILES[rig.id].displayName}.`;
    }
  }
}

function resolveAttachedCargoCollisions(
  state: GameState,
  world: GameWorld,
  towingRig: RigState,
  towingProfile: ReturnType<typeof effectiveProfile>,
  previous: { x: number; z: number },
  dt: number,
): void {
  const cargo = state.cargoRelay.cargo;
  if (cargo.attachedRigId !== towingRig.id) return;

  const intended = { x: cargo.x, z: cargo.z };
  const terrainTraversal = resolveTerrainTraversal(
    world.terrain,
    towingProfile,
    previous.x,
    previous.z,
    intended.x,
    intended.z,
  );
  cargo.x = terrainTraversal.x;
  cargo.z = terrainTraversal.z;

  const cargoDeltaX = cargo.x - previous.x;
  const cargoDeltaZ = cargo.z - previous.z;
  const cargoForwardX = Math.sin(cargo.heading);
  const cargoForwardZ = Math.cos(cargo.heading);
  const cargoMotion: DynamicCollisionBody = {
    id: cargo.id,
    role: "cargo",
    x: cargo.x,
    z: cargo.z,
    speed:
      dt > 0
        ? (cargoDeltaX * cargoForwardX + cargoDeltaZ * cargoForwardZ) / dt
        : 0,
    heading: cargo.heading,
    mass: CARGO_COLLISION_MASS,
    radius: CARGO_COLLISION_RADIUS,
  };

  const obstacleCollision = world.obstacles.resolve(
    cargoMotion,
    CARGO_COLLISION_RADIUS,
    CARGO_COLLISION_MASS,
    world.felledObstacles,
    previous,
    [
      ...world.incidentObstacles(),
      ...firstNightThreatObstacles(state.firstNightThreat, world),
    ],
  );
  const structureCollision = world.structureCollision(
    cargoMotion,
    CARGO_COLLISION_RADIUS,
    previous,
  );
  const contacts: WorldCollisionContact[] = [];

  if (terrainTraversal.blocked) {
    const movementX = intended.x - previous.x;
    const movementZ = intended.z - previous.z;
    const movementLength = Math.hypot(movementX, movementZ);
    contacts.push({
      firstId: cargo.id,
      firstRole: "cargo",
      secondId: "terrain-face",
      secondRole: "terrain",
      response: "block",
      impactSpeed: Math.abs(cargoMotion.speed),
      normalX: movementLength > 1e-7 ? -movementX / movementLength : 0,
      normalZ: movementLength > 1e-7 ? -movementZ / movementLength : 0,
      swept: true,
      policyKnown: true,
    });
  }
  const obstacle = obstacleCollision.blockedBy ?? obstacleCollision.felled;
  if (obstacleCollision.hit && obstacle) {
    contacts.push({
      firstId: cargo.id,
      firstRole: "cargo",
      secondId: obstacle.id,
      secondRole: "obstacle",
      response: "block",
      impactSpeed: obstacleCollision.impactSpeed,
      normalX: obstacleCollision.normalX,
      normalZ: obstacleCollision.normalZ,
      swept: obstacleCollision.swept,
      policyKnown: true,
    });
  }
  if (structureCollision.hit && structureCollision.blockedBy) {
    contacts.push({
      firstId: cargo.id,
      firstRole: "cargo",
      secondId: structureCollision.blockedBy.id,
      secondRole: "structure",
      response: "block",
      impactSpeed: structureCollision.impactSpeed,
      normalX: structureCollision.normalX,
      normalZ: structureCollision.normalZ,
      swept: structureCollision.swept,
      policyKnown: true,
    });
  }

  const rigBodies = RIG_IDS.filter((id) => id !== towingRig.id).map((id) => {
    const otherRig = state.rigs[id];
    const otherProfile = effectiveProfile(id, otherRig.modules);
    return {
      rig: otherRig,
      profile: otherProfile,
      previousX: otherRig.x,
      previousZ: otherRig.z,
      body: {
        id,
        role: "rig",
        x: otherRig.x,
        z: otherRig.z,
        speed: otherRig.speed,
        heading: otherRig.heading,
        mass: otherProfile.mass,
        radius: rigCollisionRadius(otherProfile),
      } satisfies DynamicCollisionBody,
    };
  });
  const bodyCollision = resolveDynamicBodyCollisions(
    cargoMotion,
    rigBodies.map((entry) => entry.body),
    previous,
  );
  contacts.push(...bodyCollision.contacts);
  cargo.x = cargoMotion.x;
  cargo.z = cargoMotion.z;
  cargo.y = world.terrain.height(cargo.x, cargo.z) + 0.65;

  for (const entry of rigBodies) {
    entry.rig.x = entry.body.x;
    entry.rig.z = entry.body.z;
    entry.rig.speed = entry.body.speed;
    if (entry.rig.x !== entry.previousX || entry.rig.z !== entry.previousZ) {
      settleRig(entry.rig, entry.profile, world.terrain);
    }
  }

  world.noteCollisionContacts(contacts, bodyCollision.policyViolationCount);
  if (contacts.some((contact) => contact.response === "block")) {
    towingRig.speed *= 0.22;
    const strongest = contacts.reduce((current, contact) =>
      contact.impactSpeed >= current.impactSpeed ? contact : current,
    );
    state.lastDiagnostic = `Relay cargo contacted ${strongest.secondId} at ${strongest.impactSpeed.toFixed(1)} m/s; the hitch loaded up.`;
  }
}

/**
 * Discovery, survey sweep, and horizon-signal visibility.
 *
 * Runs regardless of whether the rig can currently drive: a disabled rig
 * parked at a site can still see it, and the survey sweep is bound to
 * position, not motion.
 */
function updateDiscoveryAndVisibility(
  state: GameState,
  world: GameWorld,
  rig: RigState,
  profile: EffectiveRig,
): void {
  for (const landmark of LANDMARKS) {
    if (state.discoveries.some((item) => item.id === landmark.id)) continue;
    if (Math.hypot(rig.x - landmark.x, rig.z - landmark.z) <= landmark.radius) {
      state.discoveries.push({
        id: landmark.id,
        discoveredAt: state.elapsedMs,
      });
      state.lastDiagnostic = `${landmark.name} discovered: ${landmark.verb}.`;
    }
  }

  if (world.claimSurveyRefresh(rig.id, rig.x, rig.z)) {
    const result = world.exploration.survey(
      rig.x,
      rig.y + profile.camera.focusHeight + 1.4,
      rig.z,
      profile.surveyRange,
      world.surveyedCells,
    );
    if (result.revealed.length > 24) {
      state.lastDiagnostic = `Mapped ${result.revealed.length} new cells from this vantage.`;
    }

    // A horizon signal is on the horizon or it is not. Recomputing it from the same
    // eye and the same sightline policy as the survey sweep is what makes climbing a
    // rise reveal a place, rather than a range check pretending to be sight.
    const eyeX = rig.x;
    const eyeY = rig.y + profile.camera.focusHeight + 1.4;
    const eyeZ = rig.z;
    world.visibleSignals.clear();
    for (const signal of SITE_SIGNALS) {
      const targetY = world.terrain.height(signal.x, signal.z) + signal.localY;
      if (
        world.exploration.sightlineClear(
          eyeX,
          eyeY,
          eyeZ,
          signal.x,
          targetY,
          signal.z,
        )
      ) {
        world.visibleSignals.add(signal.siteId);
      }
    }
  }
}

export function stepGame(
  state: GameState,
  world: GameWorld,
  input: InputFrame = IDLE_INPUT,
  seconds = FIXED_STEP_SECONDS,
): void {
  if (state.paused || seconds <= 0 || !Number.isFinite(seconds)) return;

  const dt = Math.min(seconds, 0.1);
  world.beginCollisionStep();
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);
  const towing = state.cargoRelay.cargo.attachedRigId === rig.id;
  const weather = deriveWeatherState(state.worldTimeMinutes);
  advanceInfrastructure(state.infrastructure, weather, dt);

  // First playable slice: detect storm arrival for harvest pressure.
  if (
    !state.harvest.stormArrived &&
    state.worldTimeMinutes >= state.harvest.stormAtMinutes
  ) {
    state.harvest.stormArrived = true;
    if (!state.harvest.delivered) {
      // Storm destroys uncollected crops — the field is waterlogged. Clear the
      // remembered cells alongside the derived count so the two cannot drift:
      // leaving cells behind would make the field un-recultivable while the
      // HUD reported zero rows.
      state.harvest.cultivatedCells.length = 0;
      state.harvest.cultivatedRows = 0;
      state.lastDiagnostic =
        "The storm has hit Long Furrow. The crop rows are waterlogged and ruined.";
    }
  }
  // Environmental authority is independent of whether the currently selected
  // machine can move. A disabled rig must not freeze rain-fed field changes or
  // persistent road incidents elsewhere in the open world.
  world.advanceFieldConditions(
    dt * WORLD_MINUTES_PER_REAL_SECOND,
    weather.rainIntensity,
    (x, z) =>
      deriveInfrastructureEffects(state.infrastructure, x, z)
        .soilDrainageRatePerHour,
  );
  world.advanceEcology(
    state.worldTimeMinutes,
    dt * WORLD_MINUTES_PER_REAL_SECOND,
    weather.rainIntensity,
  );
  const mechanicalDisturbance = Math.min(
    1,
    Math.abs(rig.speed) * 0.08 + rig.telemetry.slip * 0.7,
  );
  world.noteEcologyDisturbance(rig.x, rig.z, mechanicalDisturbance);
  const roadIncident = world.advanceRoadIncidents(
    state.worldTimeMinutes,
    weather.soilMoisture,
  );
  if (roadIncident.triggered) {
    state.lastDiagnostic =
      "Storm runoff has brought stone down across the Quarry Run. The road is still open country, but the old line has changed.";
  }
  // First playable slice: the authored first-night threat (FIRST_PLAYABLE_THE_
  // ROAD_THAT_WAS.md §3). Resolves once, the first stepGame call that reads
  // night phase with the threat still pending; resolveFirstNightThreat is
  // idempotent so later night-phase frames are a no-op.
  if (state.phase === "night" && state.firstNightThreat.status === "pending") {
    const northFieldSite = findSite("north-field");
    state.firstNightThreat = resolveFirstNightThreat(
      state.firstNightThreat,
      state.worldTimeMinutes,
      {
        waterworksChoice: state.farmWaterworks.choice,
        northFieldSurveyed:
          state.northFieldInvestigation.status !== "unresolved",
        northFieldX: northFieldSite?.x ?? HOME_SITE.x,
        northFieldZ: northFieldSite?.z ?? HOME_SITE.z,
        homeX: HOME_SITE.x,
        homeZ: HOME_SITE.z,
      },
    );
    const nightThreatDiagnostic = firstNightThreatDiagnostic(
      state.firstNightThreat,
      state.farmWaterworks.choice,
    );
    if (nightThreatDiagnostic) state.lastDiagnostic = nightThreatDiagnostic;
  }
  // First playable slice: the open-world-promise finale (FIRST_PLAYABLE_THE_
  // ROAD_THAT_WAS.md §5). Resolves once the night is survived, the
  // waterworks are settled, and the causeway is reopened; sets the vista
  // narration and switches to the existing, already-wired survey camera
  // mode rather than leaving the reveal as text only.
  if (state.openWorldPromise.status === "pending") {
    const previousPromiseStatus = state.openWorldPromise.status;
    state.openWorldPromise = resolveOpenWorldPromise(
      state.openWorldPromise,
      state.worldTimeMinutes,
      {
        firstNightResolved: state.firstNightThreat.status === "resolved",
        waterworksResolved: state.farmWaterworks.choice !== "unresolved",
        causewayReopened:
          state.settlements["sunken-flats"]?.completedNeedIds.includes(
            "sunken-flats-causeway",
          ) ?? false,
      },
    );
    if (
      previousPromiseStatus !== state.openWorldPromise.status &&
      state.openWorldPromise.status === "revealed"
    ) {
      const promiseNarration = openWorldPromiseNarration(
        state.openWorldPromise,
      );
      if (promiseNarration) state.lastDiagnostic = promiseNarration;
      state.cameraMode = "survey";
    }
  }
  const disabled = rig.condition <= 0;
  if (
    disabled &&
    (input.accelerate || input.brake || input.steerLeft || input.steerRight)
  ) {
    state.lastDiagnostic = `${rig.fieldName} is disabled. Press X or Winch for emergency field recovery.`;
  }
  if (disabled) {
    rig.speed = 0;
    rig.steering = 0;
    settleRig(rig, profile, world.terrain);
    // A stalled rig can still be looked out from — sight is not the engine's
    // job. Without this, a player parked at Home Silo before the restoration
    // beat would see nothing on the horizon, including the site they are
    // standing on.
    updateDiscoveryAndVisibility(state, world, rig, profile);
    state.elapsedMs += dt * 1000;
    advanceWorldClock(state, world, dt * WORLD_MINUTES_PER_REAL_SECOND);
    return;
  }

  // Weather and infrastructure share the same monotonic world clock. The world
  // changes before presentation can describe the consequence.
  const localInfrastructure = deriveInfrastructureEffects(
    state.infrastructure,
    rig.x,
    rig.z,
  );
  const localFieldCondition = world.fieldConditionAt(rig.x, rig.z);
  const previousRigPosition = { x: rig.x, z: rig.z };
  const previousCargoPosition = {
    x: state.cargoRelay.cargo.x,
    z: state.cargoRelay.cargo.z,
  };
  const motion = stepRigMotion(rig, profile, input, world.terrain, dt, {
    towing,
    ramp: BUGGY_RAMP,
    canJump: profile.capabilities.includes("jump"),
    soilMoisture: localFieldCondition?.moistureRatio ?? weather.soilMoisture,
    soilMoistureOffset: localInfrastructure.soilMoistureOffset,
    waterLevelOffsetM: localInfrastructure.waterLevelOffsetM,
    tools: rig.tools,
  });

  // Mechanical wear accrues in odometer batches because the wear maths rounds
  // to 0.1% and per-step deltas would vanish. The surface at flush time stands
  // in for the whole batch, which is accurate enough at 250 m granularity.
  if (
    rig.distanceTravelled - rig.componentWearFlushedAtM >=
    WEAR_FLUSH_INTERVAL_M
  ) {
    const batchM = rig.distanceTravelled - rig.componentWearFlushedAtM;
    const fordingMud =
      rig.telemetry.surfaceId === "mud" || rig.telemetry.surfaceId === "water";
    rig.componentHealth = updateComponentWear(
      rig.componentHealth,
      batchM / 1000,
      fordingMud,
      0,
    );
    rig.componentWearFlushedAtM = rig.distanceTravelled;
  }

  // ---------------------------------------------------------------------------
  // Collision. Resolved after motion so the push-out is the final word on
  // position, and the rig is re-settled if a tree came down under it.
  // ---------------------------------------------------------------------------
  const rigRadius = rigCollisionRadius(profile);
  const collision = world.obstacles.resolve(
    rig,
    rigRadius,
    profile.mass,
    world.felledObstacles,
    previousRigPosition,
    [
      ...world.incidentObstacles(),
      ...firstNightThreatObstacles(state.firstNightThreat, world),
    ],
  );
  const displacedIncident = world.displaceRoadIncident(
    collision.blockedBy?.id ?? null,
    profile.mass * 1000,
    Math.abs(collision.impactSpeed),
    rig.x,
    rig.z,
    state.worldTimeMinutes,
  );
  if (displacedIncident.cleared) {
    state.lastDiagnostic =
      "The runout has shifted clear. Quarry Shelf has its old line back, marked by fresh stone scars.";
  } else if (displacedIncident.moved) {
    state.lastDiagnostic =
      "The runout shifts under the machine. Keep working it clear.";
  }
  const structureCollision = world.structureCollision(
    rig,
    rigRadius,
    previousRigPosition,
  );

  const staticContacts: WorldCollisionContact[] = [];
  if (motion.traversalBlockReason === "terrain-face") {
    const movementX = rig.x - previousRigPosition.x;
    const movementZ = rig.z - previousRigPosition.z;
    const movementLength = Math.hypot(movementX, movementZ);
    staticContacts.push({
      firstId: rig.id,
      firstRole: "rig",
      secondId: "terrain-face",
      secondRole: "terrain",
      response: "block",
      impactSpeed: Math.abs(rig.speed),
      normalX: movementLength > 1e-7 ? -movementX / movementLength : 0,
      normalZ: movementLength > 1e-7 ? -movementZ / movementLength : 0,
      swept: true,
      policyKnown: true,
    });
  }
  if (collision.hit) {
    const obstacle = collision.blockedBy ?? collision.felled;
    if (obstacle) {
      staticContacts.push({
        firstId: rig.id,
        firstRole: "rig",
        secondId: obstacle.id,
        secondRole: "obstacle",
        response: "block",
        impactSpeed: collision.impactSpeed,
        normalX: collision.normalX,
        normalZ: collision.normalZ,
        swept: collision.swept,
        policyKnown: true,
      });
    }
  }
  if (structureCollision.hit && structureCollision.blockedBy) {
    staticContacts.push({
      firstId: rig.id,
      firstRole: "rig",
      secondId: structureCollision.blockedBy.id,
      secondRole: "structure",
      response: "block",
      impactSpeed: structureCollision.impactSpeed,
      normalX: structureCollision.normalX,
      normalZ: structureCollision.normalZ,
      swept: structureCollision.swept,
      policyKnown: true,
    });
  }
  world.noteCollisionContacts(staticContacts);

  const activeBody: DynamicCollisionBody = {
    id: rig.id,
    role: "rig",
    x: rig.x,
    z: rig.z,
    speed: rig.speed,
    heading: rig.heading,
    mass: profile.mass,
    radius: rigRadius,
  };
  const fleetBodies = RIG_IDS.filter((id) => id !== rig.id).map((id) => {
    const otherRig = state.rigs[id];
    const otherProfile = effectiveProfile(id, otherRig.modules);
    return {
      rig: otherRig,
      profile: otherProfile,
      previousX: otherRig.x,
      previousZ: otherRig.z,
      body: {
        id,
        role: "rig",
        x: otherRig.x,
        z: otherRig.z,
        speed: otherRig.speed,
        heading: otherRig.heading,
        mass: otherProfile.mass,
        radius: rigCollisionRadius(otherProfile),
      } satisfies DynamicCollisionBody,
    };
  });
  const relayCargo = state.cargoRelay.cargo;
  const cargoBody =
    relayCargo.attachedRigId === rig.id
      ? null
      : ({
          id: relayCargo.id,
          role: "cargo",
          x: relayCargo.x,
          z: relayCargo.z,
          speed: 0,
          heading: relayCargo.heading,
          mass: CARGO_COLLISION_MASS,
          radius: CARGO_COLLISION_RADIUS,
        } satisfies DynamicCollisionBody);
  const dynamicCollision = resolveDynamicBodyCollisions(
    activeBody,
    [
      ...fleetBodies.map((entry) => entry.body),
      ...(cargoBody ? [cargoBody] : []),
    ],
    previousRigPosition,
  );
  rig.x = activeBody.x;
  rig.z = activeBody.z;
  rig.speed = activeBody.speed;
  for (const entry of fleetBodies) {
    entry.rig.x = entry.body.x;
    entry.rig.z = entry.body.z;
    entry.rig.speed = entry.body.speed;
    if (entry.rig.x !== entry.previousX || entry.rig.z !== entry.previousZ) {
      settleRig(entry.rig, entry.profile, world.terrain);
    }
  }
  if (cargoBody) {
    relayCargo.x = cargoBody.x;
    relayCargo.z = cargoBody.z;
    relayCargo.y = world.terrain.height(relayCargo.x, relayCargo.z) + 0.65;
  }
  world.noteCollisionContacts(
    dynamicCollision.contacts,
    dynamicCollision.policyViolationCount,
  );

  if (collision.felled) {
    world.fell(collision.felled.id);
    state.lastDiagnostic = `${rig.fieldName} pushed a tree over. The clearing stays open.`;
  } else if (collision.hit && collision.impactSpeed > 3.2) {
    const damage = Math.min(
      12,
      (collision.impactSpeed - 3.2) *
        1.6 *
        (profile.landingTolerance > 8 ? 0.55 : 1),
    );
    rig.condition = clamp(rig.condition - damage, 0, 100);
    if (damage > 1.5) {
      state.lastDiagnostic = `${rig.fieldName} struck ${collision.blockedBy?.kind ?? "an obstacle"} · condition ${Math.round(rig.condition)}%.`;
    }
  }
  if (structureCollision.hit && structureCollision.impactSpeed > 3.2) {
    const damage = Math.min(
      12,
      (structureCollision.impactSpeed - 3.2) *
        1.6 *
        (profile.landingTolerance > 8 ? 0.55 : 1),
    );
    rig.condition = clamp(rig.condition - damage, 0, 100);
    if (damage > 1.5) {
      state.lastDiagnostic = `${rig.fieldName} struck ${structureCollision.blockedBy?.id ?? "an authored structure"} · condition ${Math.round(rig.condition)}%.`;
    }
  }
  if (dynamicCollision.hit) {
    const contact = dynamicCollision.contacts.reduce((strongest, current) =>
      current.impactSpeed >= strongest.impactSpeed ? current : strongest,
    );
    if (dynamicCollision.impactSpeed > 3.2) {
      const damage = Math.min(
        12,
        (dynamicCollision.impactSpeed - 3.2) *
          1.4 *
          (profile.landingTolerance > 8 ? 0.55 : 1),
      );
      rig.condition = clamp(rig.condition - damage, 0, 100);
    }
    const otherName =
      contact.secondRole === "rig"
        ? (state.rigs[contact.secondId as RigId]?.fieldName ?? contact.secondId)
        : "relay cargo";
    state.lastDiagnostic = `${rig.fieldName} contacted ${otherName} at ${contact.impactSpeed.toFixed(1)} m/s.`;
  }

  // ---------------------------------------------------------------------------
  // Consequences of motion.
  // ---------------------------------------------------------------------------
  if (motion.landingSpeed > profile.landingTolerance) {
    const damage = Math.min(
      16,
      (motion.landingSpeed - profile.landingTolerance) * 1.4,
    );
    rig.condition = clamp(rig.condition - damage, 0, 100);
    state.lastDiagnostic = `${profile.displayName} landed hard · condition ${Math.round(rig.condition)}%.`;
  } else if (motion.rampLaunch) {
    state.lastDiagnostic = `${profile.displayName} launched from the relay ramp.`;
  }

  if (motion.drowning) {
    rig.condition = clamp(rig.condition - 4.5 * dt, 0, 100);
    if (
      Math.floor(state.elapsedMs / 1500) !==
      Math.floor((state.elapsedMs + dt * 1000) / 1500)
    ) {
      state.lastDiagnostic = `Water over ${profile.fordDepth.toFixed(1)} m is drowning ${rig.fieldName}. Pontoons would cross this.`;
    }
  } else if (motion.stalled) {
    if (
      Math.floor(state.elapsedMs / 2000) !==
      Math.floor((state.elapsedMs + dt * 1000) / 2000)
    ) {
      state.lastDiagnostic = `Grade too steep for this gearing. Low-range gearing would climb it.`;
    }
  }

  if (motion.boundarySpeed > 0) {
    state.lastDiagnostic = "The boundary ridge turns the rig back.";
  } else if (motion.traversalBlockReason === "terrain-face") {
    state.lastDiagnostic =
      "A near-vertical terrain face blocks this rig. Reverse or turn downhill to escape.";
  }

  if (motion.distance > 0.04 && rig.telemetry.slip > 0.35) {
    world.noteWheelspin(
      rig.x,
      rig.z,
      clamp(
        weather.soilMoisture + localInfrastructure.soilMoistureOffset,
        0,
        1,
      ),
      Math.min(0.08, rig.telemetry.slip * motion.distance * 0.015),
    );
  }

  // ---------------------------------------------------------------------------
  // Ploughing writes into the terrain itself, then records a visual mark.
  // ---------------------------------------------------------------------------
  const plough = attachment(rig, "field-plough");
  if (
    plough?.engaged &&
    profile.capabilities.includes("plough") &&
    motion.distance > 0.001 &&
    Math.abs(rig.speed) > 1.2 &&
    rig.mobility.kind === "ground" &&
    rig.mobility.grounded
  ) {
    const forwardX = Math.sin(rig.heading);
    const forwardZ = Math.cos(rig.heading);
    const markX = rig.x - forwardX * 2.1;
    const markZ = rig.z - forwardZ * 2.1;
    const last = state.furrows[state.furrows.length - 1];
    const distanceFromLast = last
      ? Math.hypot(markX - last.x, markZ - last.z)
      : Infinity;
    if (distanceFromLast >= FURROW_SPACING) {
      // Drainage changes the ground's response to the same machine work. This
      // is not a route gate: the terrain always remains deformable, but a
      // maintained local drainage system lets the plough cut or grade more
      // effectively through the canonical terrain-memory authority.
      const groundInfrastructure = deriveInfrastructureEffects(
        state.infrastructure,
        markX,
        markZ,
      );
      const baseBladeDelta =
        plough.mode === "fill" ? PLOUGH_FILL : PLOUGH_DEPTH;
      const rootResistance =
        plough.mode === "cut"
          ? world.fieldErosionResistanceAt(markX, markZ)
          : 1;
      const bladeDelta = Number(
        (
          baseBladeDelta *
          groundInfrastructure.terrainWorkabilityMultiplier *
          rootResistance
        ).toFixed(3),
      );
      if (world.terrain.deform(markX, markZ, bladeDelta, 1)) {
        world.noteFieldWork(
          markX,
          markZ,
          clamp(
            weather.soilMoisture + groundInfrastructure.soilMoistureOffset,
            0,
            1,
          ),
        );
        const mode = plough.mode === "fill" ? "fill" : "cut";
        state.furrows.push({
          x: markX,
          z: markZ,
          heading: rig.heading,
          createdAt: state.elapsedMs,
          rigId: rig.id,
          mode,
        } satisfies FurrowMark);
        const physicalSettlementResponse = resolveSettlementContribution(
          state,
          { quarryRunoutStatus: world.roadIncidentProjection().status },
          {
            x: markX,
            z: markZ,
            capabilities: profile.capabilities,
            interaction: "plough-cut",
          },
        );
        if (physicalSettlementResponse) {
          const recorded = recordSettlementContribution(
            state,
            physicalSettlementResponse.settlementId,
            {
              responseId: physicalSettlementResponse.id,
              materialEffectId: physicalSettlementResponse.materialEffectId,
              capability: physicalSettlementResponse.capability,
              createdAtWorldMinutes: state.worldTimeMinutes,
            },
          );
          if (recorded) {
            state.lastDiagnostic = `${physicalSettlementResponse.label}. ${physicalSettlementResponse.explanation}`;
          }
        }
        const cultivationMission = activeMissionMatching(state, "cultivation");
        if (
          cultivationMission &&
          canFulfillCultivationNeed(cultivationMission, markX, markZ)
        ) {
          completeMission(state, cultivationMission.id, state.elapsedMs, world);
        }
        if (
          state.openingNaming.status === "waiting" &&
          isOpeningNamingReady(state, rig.id)
        ) {
          state.openingNaming.status = "ready";
          state.lastDiagnostic =
            "The old man watches the first furrow settle. He says the tractor has earned a name.";
        }
        if (state.furrows.length > MAX_FURROWS) {
          state.furrows.splice(0, state.furrows.length - MAX_FURROWS);
        }

        // Terrain just changed, so the Home -> Long Furrow corridor may have
        // become passable. This is the only place the passage opens: the
        // corridor probe is expensive, and mutation belongs to the fixed step
        // rather than to any selector. `evaluateCorridorQuality()` is pure, so
        // reading the game state can never trigger this transition.
        syncUnboundPassageFromCorridor(
          state,
          evaluateCorridorQuality(state, world),
          Math.max(0, Math.floor(state.elapsedMs)),
        );

        // Spatially bound route attribution to Home -> Long Furrow corridor (within 12m)
        const lfSite = findSite("long-furrow");
        const lfX = lfSite ? lfSite.x : 18;
        const lfZ = lfSite ? lfSite.z : -46;
        const totalDx = lfX - HOME_SITE.x;
        const totalDz = lfZ - HOME_SITE.z;
        const lenSq = totalDx * totalDx + totalDz * totalDz;
        const tClamped = Math.max(
          0,
          Math.min(
            1,
            ((markX - HOME_SITE.x) * totalDx +
              (markZ - HOME_SITE.z) * totalDz) /
              (lenSq || 1),
          ),
        );
        const projX = HOME_SITE.x + totalDx * tClamped;
        const projZ = HOME_SITE.z + totalDz * tClamped;
        const distToCorridor = Math.hypot(markX - projX, markZ - projZ);

        state.semanticEdits.push({
          mode,
          authorRigId: rig.id,
          x: markX,
          z: markZ,
          heading: rig.heading,
          width: profile.track,
          depthDelta: bladeDelta,
          affectedCellCount: 1,
          createdAt: state.elapsedMs,
          routeId: distToCorridor <= 12 ? "home-to-long-furrow" : undefined,
          visualCategory: mode === "fill" ? "fill-causeway" : "cut-tilled",
        } satisfies CutFillEditRecord);
        if (state.semanticEdits.length > MAX_FURROWS) {
          state.semanticEdits.splice(
            0,
            state.semanticEdits.length - MAX_FURROWS,
          );
        }

        // First playable slice: track cultivation of Long Furrow crop rows.
        // The south field is between localX 4..14 and localZ 8..20 relative
        // to the Long Furrow site anchor.
        if (!state.harvest.delivered && mode === "cut" && lfSite) {
          const inField =
            markX >= lfSite.x + 4 &&
            markX <= lfSite.x + 14 &&
            markZ >= lfSite.z + 8 &&
            markZ <= lfSite.z + 20;
          if (inField) {
            // Each unique half-metre cell in the field counts once toward
            // cultivation. The remembered cells live in `state.harvest` rather
            // than in a module-local Set so they survive save, replay-clone,
            // and determinism hashing — all three go through JSON, which
            // cannot represent a Set.
            const cellKey = `${Math.round(markX * 2)},${Math.round(markZ * 2)}`;
            const cells = state.harvest.cultivatedCells;
            if (
              !cells.includes(cellKey) &&
              cells.length < MAX_CULTIVATED_CELLS
            ) {
              cells.push(cellKey);
              state.harvest.cultivatedRows = cultivatedRowsFor(
                cells.length,
                state.harvest.totalRows,
              );
            }
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Fleet Inheritance: non-author rigs benefit from routes opened by others.
  // ---------------------------------------------------------------------------
  if (
    state.unboundPassage.status === "open" &&
    state.unboundPassage.openedByRigId !== null &&
    state.unboundPassage.openedByRigId !== rig.id
  ) {
    const longFurrow = findSite("long-furrow");
    if (longFurrow) {
      const distToHome = Math.hypot(rig.x - HOME_SITE.x, rig.z - HOME_SITE.z);
      const distToLF = Math.hypot(rig.x - longFurrow.x, rig.z - longFurrow.z);
      const gullyX = -2;
      const gullyZ = -12;
      const distToGully = Math.hypot(rig.x - gullyX, rig.z - gullyZ);

      // Traversal condition: rig is near Long Furrow or Home AND has crossed through the reclaimed gully zone
      if ((distToLF <= 22 || distToHome <= 22) && distToGully <= 14) {
        const alreadyRecorded = state.fleetInheritance.some(
          (entry) =>
            entry.benefitingRigId === rig.id &&
            entry.routeId === "home-to-long-furrow",
        );
        if (!alreadyRecorded) {
          const authorRigId = state.unboundPassage.openedByRigId;
          state.fleetInheritance.push({
            authorRigId,
            benefitingRigId: rig.id,
            routeId: "home-to-long-furrow",
            crossedAtMs: state.elapsedMs,
            persisted: true,
          });
          const authorName = state.rigs[authorRigId].fieldName;
          state.lastDiagnostic = `${rig.fieldName} is benefiting from the route opened by ${authorName}!`;
        }
      }
    }
  }

  updateDiscoveryAndVisibility(state, world, rig, profile);

  /*
   * Score from the same published sightline set the rail reads, but evaluate
   * the clock every fixed step. Observation is motion-throttled; expiry is not.
   * Otherwise an active contract can remain "active" at zero minutes forever
   * while the rig is stationary.
   */
  if (state.surveyRoute.status === "active") {
    const evaluation = evaluateSurveyRoute(
      state.surveyRoute,
      surveyRouteTargets(),
      world.visibleSignals,
      state.worldTimeMinutes,
    );
    state.surveyRoute = evaluation.state;
    if (evaluation.completed) {
      const surveyMission = activeMissionMatching(state, "survey");
      if (surveyMission) {
        completeMission(state, surveyMission.id, state.elapsedMs, world);
      } else {
        const reward = activityDefinition("survey-route").reward.salvage;
        state.salvage += reward;
        state.salvageCollected += reward;
        state.progression = applyActivityCompletionProgression(
          state.progression,
          "survey-route",
          rig.id,
        );
        state.lastDiagnostic = `Survey contract filed from sight alone. ${reward} salvage.`;
      }
    } else if (evaluation.failed) {
      const diagnostic =
        "Survey contract lapsed. The light went before every signal was sighted.";
      const lapsedSurvey = activeMissionMatching(state, "survey");
      if (lapsedSurvey) {
        failMission(state, lapsedSurvey.id, diagnostic);
      } else {
        state.lastDiagnostic = diagnostic;
      }
    } else if (evaluation.newlySighted.length > 0) {
      const remaining =
        surveyRouteTargets().length - evaluation.state.sighted.length;
      state.lastDiagnostic =
        remaining > 0
          ? `Signal sighted. ${remaining} left on the contract.`
          : "Signal sighted.";
    }
  }

  if (state.roadRivalry.status === "active") {
    const evaluation = evaluateRoadRivalry(
      state.roadRivalry,
      rig.id,
      rig.x,
      rig.z,
      state.elapsedMs,
    );
    state.roadRivalry = evaluation.state;
    if (evaluation.completed) {
      const seconds = (evaluation.completed.elapsedMs / 1000).toFixed(2);
      state.lastDiagnostic = evaluation.personalBest
        ? `${rig.fieldName} set a Grove Run personal best: ${seconds}s.`
        : `${rig.fieldName} finished the Grove Run in ${seconds}s. The record still stands.`;
    } else if (evaluation.checkpoint) {
      const remaining =
        roadRivalryGateIds().length - evaluation.state.nextGateIndex;
      state.lastDiagnostic =
        remaining > 0
          ? "Quarry Shelf crossed. Home Silo is the finish."
          : "Grove Run gate crossed.";
    }
  }

  updateCargo(state, world, rig);
  resolveAttachedCargoCollisions(
    state,
    world,
    rig,
    profile,
    previousCargoPosition,
    dt,
  );

  // Idle rigs recover strain, so parking a machine is a real choice.
  for (const id of RIG_IDS) {
    if (id === rig.id) continue;
    const idle = state.rigs[id];
    idle.strain = approach(idle.strain, 0, 0.04 * dt);
  }

  state.elapsedMs += dt * 1000;
  advanceWorldClock(state, world, dt * WORLD_MINUTES_PER_REAL_SECOND);
}

function advanceWorldClock(
  state: GameState,
  world: GameWorld,
  minutes: number,
): void {
  const previousDay = Math.floor(state.worldTimeMinutes / WORLD_DAY_MINUTES);
  state.worldTimeMinutes += minutes;
  state.phase = phaseForWorldTime(state.worldTimeMinutes);
  if (Math.floor(state.worldTimeMinutes / WORLD_DAY_MINUTES) === previousDay)
    return;
  for (const adaptation of communityAdaptationCandidates(state, {
    quarryRunoutStatus: world.roadIncidentProjection().status,
  })) {
    recordSettlementAdaptation(state, adaptation.settlementId, {
      id: adaptation.id,
      materialEffectId: adaptation.materialEffectId,
      createdAtWorldMinutes: state.worldTimeMinutes,
    });
  }
}

export function advanceGame(
  state: GameState,
  world: GameWorld,
  milliseconds: number,
): void {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return;
  let remaining = Math.min(milliseconds, 120_000) / 1000;
  while (remaining > 0) {
    const step = Math.min(FIXED_STEP_SECONDS, remaining);
    stepGame(state, world, IDLE_INPUT, step);
    remaining -= step;
  }
}

// -----------------------------------------------------------------------------
// Observability
// -----------------------------------------------------------------------------

function finiteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function fixedNumber(value: unknown, digits: number, fallback = 0): number {
  return Number(finiteNumber(value, fallback).toFixed(digits));
}

export function publicState(state: GameState, world: GameWorld): object {
  const rigSummary = (rig: RigState) => {
    const profile = effectiveProfile(rig.id, rig.modules);
    const mobility =
      rig.mobility.kind === "ground"
        ? {
            kind: rig.mobility.kind,
            grounded: rig.mobility.grounded,
            verticalVelocity: fixedNumber(rig.mobility.verticalVelocity, 3),
            wheelRotation: fixedNumber(rig.mobility.wheelRotation, 4),
            wheels: rig.mobility.wheels.map((wheel) => ({
              compression: fixedNumber(wheel.compression, 3),
              contact: wheel.contact,
            })),
          }
        : {
            kind: rig.mobility.kind,
            liftVelocity: fixedNumber(rig.mobility.liftVelocity, 3),
            clearance: fixedNumber(rig.mobility.clearance, 3),
            cushionPressure: fixedNumber(rig.mobility.cushionPressure, 3),
            skirtContact: rig.mobility.skirtContact,
          };
    return {
      id: rig.id,
      fieldName: rig.fieldName,
      x: fixedNumber(rig.x, 3),
      y: fixedNumber(rig.y, 3),
      z: fixedNumber(rig.z, 3),
      heading: fixedNumber(rig.heading, 4),
      pitch: fixedNumber(rig.pitch, 4),
      roll: fixedNumber(rig.roll, 4),
      speed: fixedNumber(rig.speed, 3),
      stable: rigIsStable(rig),
      mobility,
      condition: fixedNumber(rig.condition, 1),
      strain: fixedNumber(rig.strain, 3),
      componentHealth: { ...rig.componentHealth },
      distanceTravelled: fixedNumber(rig.distanceTravelled, 2),
      attachments: rig.attachments.map((item) => ({ ...item })),
      modules: [...rig.modules],
      tools: { ...rig.tools },
      capabilities: [...profile.capabilities],
      surveyRange: profile.surveyRange,
      terrain: {
        surface: rig.telemetry.surfaceId,
        grade: fixedNumber(rig.telemetry.grade, 3),
        grip: fixedNumber(rig.telemetry.grip, 3),
        slip: fixedNumber(rig.telemetry.slip, 3),
        waterDepth: fixedNumber(rig.telemetry.waterDepth, 2),
        stalled: rig.telemetry.stalled,
      },
    };
  };
  const currentRig = activeRig(state);
  const nearestSalvage = world.exploration.nearestNode(
    currentRig.x,
    currentRig.z,
    70,
    world.collectedNodes,
  );
  const firstRung = resolveFirstRung(state, world.collectedNodes, world);
  // One assessment, one projection. The board, the radial wheel, the HUD, and
  // the acceptance harness all read this — none of them re-derives whether a
  // recovery is possible, so they cannot drift apart.
  const publicWeather = deriveWeatherState(state.worldTimeMinutes);
  const settlementLife = deriveSettlementLife(state, {
    quarryRunoutStatus: world.roadIncidentProjection().status,
  });
  const habitat = world.habitatProjectionAt(
    currentRig.x,
    currentRig.z,
    state.worldTimeMinutes,
    publicWeather.soilMoisture,
    publicWeather.rainIntensity,
  );
  const ecology = world.ecologySnapshot();
  const collisionTelemetry = world.collisionTelemetry();
  const fleetRecovery = fleetRecoveryProjection(
    deriveFleetRecoveryAssessment(state, world, publicWeather),
  );
  const workshop = workshopInReach(state);
  const repairService = repairServiceInReach(state);
  const workshopActionable = firstRungWorkshopActionable(
    workshop !== undefined,
    state,
    firstRung,
  );
  const journeys = Object.fromEntries(
    RIG_IDS.map((rigId) => {
      const journey = state.progression.journeys[rigId] ?? {
        phase: "found",
        investment: 0,
        completedDeeds: [],
      };
      return [
        rigId,
        {
          phase: journey.phase,
          investment: journey.investment,
          completedDeeds: journey.completedDeeds,
          allowedModuleSlots: moduleSlotsForJourney(journey.phase),
        },
      ];
    }),
  );

  const mastery = Object.fromEntries(
    RIG_IDS.map((rigId) => {
      const rigMastery = state.progression.mastery[rigId] ?? {};
      const capMastery = Object.fromEntries(
        Object.entries(rigMastery).map(([cap, masteryState]) => [
          cap,
          {
            rank: masteryState.rank,
            points: masteryState.points,
          },
        ]),
      );
      return [rigId, capMastery];
    }),
  );

  return {
    schemaVersion: state.schemaVersion,
    seed: state.seed,
    worldTimeMinutes: fixedNumber(state.worldTimeMinutes, 4),
    worldMinuteOfDay: fixedNumber(worldMinuteOfDay(state.worldTimeMinutes), 4),
    elapsedMs: Math.round(state.elapsedMs),
    phase: state.phase,
    cameraMode: state.cameraMode,
    paused: state.paused,
    mapOpen: state.mapOpen,
    activeRigId: state.activeRigId,
    activeRig: rigSummary(activeRig(state)),
    rigs: Object.fromEntries(
      RIG_IDS.map((id) => [id, rigSummary(state.rigs[id])]),
    ),
    weather: {
      phase: publicWeather.phase,
      soilMoisture: fixedNumber(publicWeather.soilMoisture, 3),
      rainIntensity: fixedNumber(publicWeather.rainIntensity, 3),
    },
    habitat,
    ecology,
    fleetRecovery,
    progression: {
      insight: state.progression.insight,
      journeys,
      mastery,
      salvage: state.salvage,
      salvageCollected: state.salvageCollected,
      firstRung,
      unboundPassage: readUnboundPassage(state.unboundPassage, currentRig.id),
      workshopInReach: workshop?.id ?? null,
      repairServiceInReach: repairService?.site.id ?? null,
      workshopActionable,
      nearestSalvage:
        nearestSalvage === null
          ? null
          : {
              id: nearestSalvage.id,
              x: fixedNumber(nearestSalvage.x, 3),
              z: fixedNumber(nearestSalvage.z, 3),
              value: nearestSalvage.value,
              distance: fixedNumber(
                Math.hypot(
                  currentRig.x - nearestSalvage.x,
                  currentRig.z - nearestSalvage.z,
                ),
                2,
              ),
            },
      recovery: { ...state.recovery },
      farmWaterworks: state.farmWaterworks,
    },
    infrastructure: {
      entities: publicInfrastructureNetwork(
        state.infrastructure,
        currentRig.x,
        currentRig.z,
      ),
      localEffects: deriveInfrastructureEffects(
        state.infrastructure,
        currentRig.x,
        currentRig.z,
      ),
    },
    settlements: settlementLife.map((settlement) => ({
      id: settlement.settlementId,
      name: settlement.name,
      people: settlement.people,
      shift: settlement.shift,
      condition: settlement.condition,
      favor: settlement.favor,
      pressures: settlement.pressures.map((pressure) => ({
        id: pressure.id,
        kind: pressure.kind,
        label: pressure.label,
        severity: fixedNumber(pressure.severity, 3),
        compatibleCapabilities: [...pressure.compatibleCapabilities],
      })),
      services: settlement.services.map((service) => ({ ...service })),
      residents: settlement.residents.map((resident) => ({
        id: resident.id,
        role: resident.role,
        activity: resident.activity,
      })),
      adaptations: settlement.adaptations.map((adaptation) => ({
        id: adaptation.id,
        materialEffectId: adaptation.materialEffectId,
        label: adaptation.label,
      })),
      responses: settlement.responses.map((response) => ({
        id: response.id,
        materialEffectId: response.materialEffectId,
        label: response.label,
        compatibleCapabilities: [...response.compatibleCapabilities],
        interaction: response.interaction,
        status: response.status,
      })),
    })),
    communityTraffic: deriveCommunityTraffic(state).map((traffic) => ({
      id: traffic.id,
      materialEffectId: traffic.materialEffectId,
      kind: traffic.kind,
      sourceSiteId: traffic.sourceSiteId,
      targetSiteId: traffic.targetSiteId,
      x: fixedNumber(traffic.x, 2),
      z: fixedNumber(traffic.z, 2),
      outbound: traffic.outbound,
    })),
    communityLeads: deriveSettlementWorldLeads(state).map((lead) => ({
      id: lead.id,
      sourceSiteId: lead.sourceSiteId,
      targetSiteId: lead.targetSiteId,
      title: lead.title,
      mapLabel: lead.mapLabel,
    })),
    activity: {
      id: state.cargoRelay.id,
      status: state.cargoRelay.status,
      elapsedMs:
        state.cargoRelay.startedAt === null
          ? 0
          : Math.round(
              (state.cargoRelay.completedAt ?? state.elapsedMs) -
                state.cargoRelay.startedAt,
            ),
      bestTimeMs: state.cargoRelay.bestTimeMs,
      cargoAttachedTo: state.cargoRelay.cargo.attachedRigId,
      cargoManifestId: state.cargoRelay.assignment?.manifestId ?? null,
      delivered: state.cargoRelay.cargo.delivered,
      cargoPosition: {
        x: fixedNumber(state.cargoRelay.cargo.x, 3),
        y: fixedNumber(state.cargoRelay.cargo.y, 3),
        z: fixedNumber(state.cargoRelay.cargo.z, 3),
      },
      deliveryPosition: (() => {
        const destination = cargoDeliveryTarget(state.cargoRelay);
        return {
          x: destination.x,
          z: destination.z,
          siteId: destination.siteId,
        };
      })(),
      rampPosition: { x: BUGGY_RAMP.x, z: BUGGY_RAMP.z },
    },
    roadRivalry: {
      id: state.roadRivalry.id,
      status: state.roadRivalry.status,
      activeRigId: state.roadRivalry.activeRigId,
      nextGateIndex: state.roadRivalry.nextGateIndex,
      gateCount: roadRivalryGateIds().length,
      completedRuns: state.roadRivalry.completedRuns,
      bestTimeMsByRig: { ...state.roadRivalry.bestTimeMsByRig },
      lastRun: state.roadRivalry.lastRun,
    },
    roadIncident: world.roadIncidentProjection(),
    collision: {
      totalContacts: collisionTelemetry.totalContacts,
      policyViolationCount: collisionTelemetry.policyViolationCount,
      contactAgeSteps: collisionTelemetry.contactAgeSteps,
      contacts: collisionTelemetry.contacts.map((contact) => ({
        ...contact,
        impactSpeed: fixedNumber(contact.impactSpeed, 3),
        normalX: fixedNumber(contact.normalX, 4),
        normalZ: fixedNumber(contact.normalZ, 4),
      })),
    },
    mission: state.activeMission
      ? {
          id: state.activeMission.id,
          binding: state.activeMission.binding,
          missionClass: state.activeMission.missionClass,
          giverId: state.activeMission.giverId,
          targetSiteId: state.activeMission.targetSiteId,
          activeRigId: state.activeMission.activeRigId,
          progressIndex: state.activeMission.progressIndex,
          waypointCount: state.activeMission.waypointIds.length,
        }
      : null,
    activeSideMissions: state.activeSideMissions.map((mission) => ({
      id: mission.id,
      binding: mission.binding,
      missionClass: mission.missionClass,
      giverId: mission.giverId,
      targetSiteId: mission.targetSiteId,
      activeRigId: mission.activeRigId,
      progressIndex: mission.progressIndex,
      waypointCount: mission.waypointIds.length,
    })),
    // The authored world layout, so external tools (acceptance runs, the trailer
    // capture) can target a named place instead of hardcoding coordinates that
    // drift whenever `WORLD_SITES` is retuned.
    sites: WORLD_SITES.map((site) => ({
      id: site.id,
      name: site.name,
      verb: site.verb,
      x: site.x,
      z: site.z,
      discoverRadius: site.discoverRadius,
      workshop: "workshop" in site && site.workshop === true,
    })),
    worldMemory: {
      furrowCount: state.furrows.length,
      deformedCells: world.terrain.deformationCount(),
      felledObstacles: world.felledObstacles.size,
      collectedNodes: world.collectedNodes.size,
      surveyedCells: world.surveyedCells.size,
      surveyedFraction: fixedNumber(
        world.exploration.surveyedFraction(world.surveyedCells, 190),
        4,
      ),
      discoveries: state.discoveries.map((item) => item.id),
      visibleSignals: [...world.visibleSignals],
    },
    surveyRoute: {
      status: state.surveyRoute.status,
      targets: surveyRouteTargets(),
      sighted: state.surveyRoute.sighted,
      minutesRemaining: surveyRouteMinutesRemaining(
        state.surveyRoute,
        state.worldTimeMinutes,
      ),
      bestSightedCount: state.surveyRoute.bestSightedCount,
    },
    restoration: { ...state.restoration },
    arrivalBargain: { ...state.arrivalBargain },
    openingNaming: { ...state.openingNaming },
    lastDiagnostic: state.lastDiagnostic,
  };
}

// -----------------------------------------------------------------------------
// Save recovery and migration
// -----------------------------------------------------------------------------

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Recover harvest progress from an untrusted save.
 *
 * `cultivatedCells` is the authority and `cultivatedRows` is recomputed from
 * it, so a save that was hand-edited — or written by the earlier build that
 * stored the cell set outside the contract and lost it to `JSON.stringify` —
 * cannot restore a row count the remembered cells do not support. Malformed
 * or duplicate keys are dropped rather than rejecting the whole save, since a
 * player's other progress should survive a corrupt harvest block.
 */
function recoverHarvest(value: unknown): HarvestState {
  const fallback: HarvestState = {
    cultivatedCells: [],
    cultivatedRows: 0,
    totalRows: 4,
    delivered: false,
    stormArrived: false,
    stormAtMinutes: 1200,
  };
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Record<string, unknown>;

  const totalRows = isFiniteNumber(candidate.totalRows)
    ? Math.max(1, Math.floor(candidate.totalRows))
    : 4;

  const seen = new Set<string>();
  const cultivatedCells: string[] = [];
  if (Array.isArray(candidate.cultivatedCells)) {
    for (const entry of candidate.cultivatedCells) {
      if (typeof entry !== "string") continue;
      // Keys are written as "<int>,<int>"; anything else is not ours.
      if (!/^-?\d+,-?\d+$/.test(entry)) continue;
      if (seen.has(entry)) continue;
      seen.add(entry);
      cultivatedCells.push(entry);
      if (cultivatedCells.length >= MAX_CULTIVATED_CELLS) break;
    }
  }

  return {
    cultivatedCells,
    cultivatedRows: cultivatedRowsFor(cultivatedCells.length, totalRows),
    totalRows,
    delivered: candidate.delivered === true,
    stormArrived: candidate.stormArrived === true,
    stormAtMinutes: isFiniteNumber(candidate.stormAtMinutes)
      ? candidate.stormAtMinutes
      : 1200,
  };
}

function isRigId(value: unknown): value is RigId {
  return RIG_IDS.includes(value as RigId);
}

const DIFFERENTIAL_MODES: readonly DifferentialMode[] = [
  "open",
  "limited-slip",
  "locked",
];

function recoverToolState(candidate: unknown): RigToolState {
  const source = (candidate ?? {}) as Partial<RigToolState>;
  return {
    tirePressurePsi: isFiniteNumber(source.tirePressurePsi)
      ? clamp(
          source.tirePressurePsi,
          MIN_TIRE_PRESSURE_PSI,
          MAX_TIRE_PRESSURE_PSI,
        )
      : DEFAULT_TIRE_PRESSURE_PSI,
    differentialMode: DIFFERENTIAL_MODES.includes(
      source.differentialMode as DifferentialMode,
    )
      ? (source.differentialMode as DifferentialMode)
      : "open",
  };
}

function recoverActiveMission(candidate: unknown): ActiveMissionState | null {
  if (!candidate || typeof candidate !== "object") return null;
  const source = candidate as Partial<ActiveMissionState>;
  if (
    typeof source.id !== "string" ||
    typeof source.binding !== "string" ||
    typeof source.targetSiteId !== "string" ||
    !Array.isArray(source.waypointIds) ||
    !Array.isArray(source.requiredCapabilities) ||
    !isRigId(source.activeRigId) ||
    !isFiniteNumber(source.acceptedAtMs) ||
    !isFiniteNumber(source.progressIndex) ||
    !isFiniteNumber(source.rewardSalvage) ||
    !["standard", "hard", "extreme"].includes(source.difficultyLabel ?? "")
  ) {
    return null;
  }
  return {
    id: source.id,
    binding: source.binding,
    // Pre-v11 records carry no quest class or giver; default to the
    // world-derived shape so migrated in-flight missions stay valid.
    missionClass: MISSION_CLASSES.includes(source.missionClass as MissionClass)
      ? (source.missionClass as MissionClass)
      : "local",
    giverId: typeof source.giverId === "string" ? source.giverId : null,
    settlementOutcomeId: isSettlementNeedOutcomeId(source.settlementOutcomeId)
      ? source.settlementOutcomeId
      : null,
    targetSiteId: source.targetSiteId,
    waypointIds: source.waypointIds.filter(
      (id): id is string => typeof id === "string",
    ),
    requiredCapabilities: source.requiredCapabilities.filter(
      (cap): cap is RigCapability =>
        RIG_CAPABILITIES.includes(cap as RigCapability),
    ),
    rewardSalvage: Math.max(0, Math.floor(source.rewardSalvage)),
    difficultyLabel: source.difficultyLabel!,
    activeRigId: source.activeRigId,
    acceptedAtMs: Math.max(0, source.acceptedAtMs),
    progressIndex: Math.max(0, Math.floor(source.progressIndex)),
  };
}

function recoverActiveMissionList(candidate: unknown): ActiveMissionState[] {
  if (!Array.isArray(candidate)) return [];
  const recovered: ActiveMissionState[] = [];
  for (const entry of candidate) {
    const mission = recoverActiveMission(entry);
    // The focus slot owns main-class missions; drop any that leaked here.
    if (mission && mission.missionClass !== "main") recovered.push(mission);
  }
  return recovered;
}

function recoverModules(value: unknown, rigId: RigId): ModuleId[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<ModuleId>();
  for (const entry of value) {
    if (typeof entry !== "string") continue;
    const definition = MODULES[entry as ModuleId];
    if (definition && definition.fits.includes(rigId)) {
      seen.add(entry as ModuleId);
    }
  }
  return [...seen];
}

/**
 * Recover one rig from an untrusted record.
 *
 * Deliberately tolerant of *missing* fields introduced after v2 (pitch, roll,
 * strain, modules) and strict about fields that existed before: a v2 record
 * must still load, and a newer record with a corrupted position must not.
 */
function recoverMobility(
  candidate: Record<string, unknown>,
  id: RigId,
  allowLegacyGround: boolean,
): RigState["mobility"] | null {
  const expected = RIG_PROFILES[id].mobilityAdapter;
  const value = candidate.mobility;

  if (value && typeof value === "object") {
    const mobility = value as Record<string, unknown>;
    if (mobility.kind !== expected) return null;

    if (expected === "ground") {
      if (
        !isFiniteNumber(mobility.verticalVelocity) ||
        typeof mobility.grounded !== "boolean" ||
        !isFiniteNumber(mobility.jumpCooldownMs) ||
        !isFiniteNumber(mobility.wheelRotation) ||
        !Array.isArray(mobility.wheels) ||
        mobility.wheels.length !== 4
      ) {
        return null;
      }
      const wheels = mobility.wheels.map((value) => {
        if (!value || typeof value !== "object") return null;
        const wheel = value as Record<string, unknown>;
        if (
          !isFiniteNumber(wheel.compression) ||
          typeof wheel.contact !== "boolean" ||
          !isFiniteNumber(wheel.slip)
        ) {
          return null;
        }
        return {
          compression: clamp(wheel.compression, 0, 1),
          contact: wheel.contact,
          slip: clamp(wheel.slip, 0, 1),
        };
      });
      if (wheels.some((wheel) => wheel === null)) return null;
      return {
        kind: "ground",
        verticalVelocity: clamp(mobility.verticalVelocity, -40, 40),
        grounded: mobility.grounded,
        jumpCooldownMs: clamp(mobility.jumpCooldownMs, 0, 10_000),
        wheelRotation: mobility.wheelRotation,
        wheels: wheels as GroundMobilityState["wheels"],
      };
    }

    if (
      !isFiniteNumber(mobility.liftVelocity) ||
      !isFiniteNumber(mobility.clearance) ||
      !isFiniteNumber(mobility.cushionPressure) ||
      typeof mobility.skirtContact !== "boolean"
    ) {
      return null;
    }
    return {
      kind: "hover",
      liftVelocity: clamp(mobility.liftVelocity, -30, 30),
      clearance: clamp(mobility.clearance, 0, 12),
      cushionPressure: clamp(mobility.cushionPressure, 0, 1),
      skirtContact: mobility.skirtContact,
    };
  }

  if (
    !allowLegacyGround ||
    expected !== "ground" ||
    !isFiniteNumber(candidate.wheelRotation)
  ) {
    return null;
  }
  return {
    kind: "ground",
    verticalVelocity: isFiniteNumber(candidate.verticalVelocity)
      ? clamp(candidate.verticalVelocity, -40, 40)
      : 0,
    grounded:
      typeof candidate.grounded === "boolean" ? candidate.grounded : true,
    jumpCooldownMs: isFiniteNumber(candidate.jumpCooldownMs)
      ? clamp(candidate.jumpCooldownMs, 0, 10_000)
      : 0,
    wheelRotation: candidate.wheelRotation,
    wheels: createWheels(),
  };
}

function recoverComponentHealth(candidate: unknown): ComponentHealthState {
  const fresh = createComponentHealth();
  if (!candidate || typeof candidate !== "object") return fresh;
  const source = candidate as Partial<ComponentHealthState>;
  const percent = (value: unknown, fallback: number): number =>
    isFiniteNumber(value) ? clamp(value, 0, 100) : fallback;
  return {
    tireTreadHealthPercent: percent(
      source.tireTreadHealthPercent,
      fresh.tireTreadHealthPercent,
    ),
    radiatorCleanlinessPercent: percent(
      source.radiatorCleanlinessPercent,
      fresh.radiatorCleanlinessPercent,
    ),
    winchCableIntegrityPercent: percent(
      source.winchCableIntegrityPercent,
      fresh.winchCableIntegrityPercent,
    ),
    alternatorBeltHealthPercent: percent(
      source.alternatorBeltHealthPercent,
      fresh.alternatorBeltHealthPercent,
    ),
  };
}

function recoverRigFieldName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const fieldName = value.trim().replace(/\s+/g, " ");
  if (
    fieldName.length < 2 ||
    fieldName.length > 28 ||
    /[\u0000-\u001F\u007F]/.test(fieldName)
  ) {
    return fallback;
  }
  return fieldName;
}

function recoverRig(
  value: unknown,
  id: RigId,
  allowLegacyGround = false,
): RigState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.id !== id ||
    !isFiniteNumber(candidate.x) ||
    !isFiniteNumber(candidate.z) ||
    !isFiniteNumber(candidate.heading) ||
    !isFiniteNumber(candidate.speed) ||
    !isFiniteNumber(candidate.steering) ||
    !isFiniteNumber(candidate.distanceTravelled) ||
    !isFiniteNumber(candidate.condition) ||
    !Array.isArray(candidate.attachments)
  ) {
    return null;
  }

  const template = createRig(id, 0, 0);
  const mobility = recoverMobility(candidate, id, allowLegacyGround);
  if (!mobility) return null;
  const validAttachments = new Set(template.attachments.map((item) => item.id));
  const attachments = candidate.attachments
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const entry = item as Record<string, unknown>;
      return (
        typeof entry.id === "string" &&
        validAttachments.has(entry.id as never) &&
        typeof entry.engaged === "boolean"
      );
    })
    .map((item) => {
      const entry = item as {
        id: RigState["attachments"][number]["id"];
        engaged: boolean;
        mode?: unknown;
      };
      // Blade direction belongs to the plough alone. Attaching it to every
      // attachment made a save round-trip *mutate* state — the tow hook came back
      // carrying `mode: "cut"` — which changed the public-state hash and broke
      // deterministic replay at the very first checkpoint. Any unrecognised or
      // absent direction on the plough still becomes `cut`, so pre-blade records
      // load unchanged.
      if (entry.id !== "field-plough") {
        return { id: entry.id, engaged: entry.engaged };
      }
      return {
        id: entry.id,
        engaged: entry.engaged,
        mode: entry.mode === "fill" ? ("fill" as const) : ("cut" as const),
      };
    });
  if (attachments.length !== validAttachments.size) return null;

  const profile = RIG_PROFILES[id];
  const radius = Math.hypot(candidate.x, candidate.z);
  const scale = radius > WORLD_LIMIT ? WORLD_LIMIT / radius : 1;
  const recordedTelemetry =
    candidate.telemetry && typeof candidate.telemetry === "object"
      ? (candidate.telemetry as Record<string, unknown>)
      : null;

  return {
    id,
    fieldName: recoverRigFieldName(candidate.fieldName, profile.fieldName),
    x: candidate.x * scale,
    y: isFiniteNumber(candidate.y) ? clamp(candidate.y, -12, 200) : 0,
    z: candidate.z * scale,
    heading: candidate.heading,
    pitch: isFiniteNumber(candidate.pitch)
      ? clamp(candidate.pitch, -1.4, 1.4)
      : 0,
    roll: isFiniteNumber(candidate.roll) ? clamp(candidate.roll, -1.4, 1.4) : 0,
    speed: clamp(
      candidate.speed,
      profile.reverseLimit * 1.4,
      profile.topSpeed * 1.6,
    ),
    steering: clamp(candidate.steering, -1, 1),
    distanceTravelled: Math.max(0, candidate.distanceTravelled),
    condition: clamp(candidate.condition, 0, 100),
    strain: isFiniteNumber(candidate.strain)
      ? clamp(candidate.strain, 0, 1)
      : 0,
    componentHealth: recoverComponentHealth(candidate.componentHealth),
    // Pre-wear saves have no flush marker. Defaulting to the recovered
    // odometer means a migrated rig takes no retroactive wear dump for the
    // kilometres it drove before the wear system existed.
    componentWearFlushedAtM: isFiniteNumber(candidate.componentWearFlushedAtM)
      ? clamp(
          candidate.componentWearFlushedAtM,
          0,
          Math.max(0, candidate.distanceTravelled),
        )
      : Math.max(0, candidate.distanceTravelled),
    mobility,
    attachments,
    modules: recoverModules(candidate.modules, id),
    // Older saves carry no tool state. Defaulting is the correct migration:
    // the fields are presentation-of-commitment, not earned progress, so a
    // missing value means "the player has not committed to anything yet".
    tools: recoverToolState(candidate.tools),
    telemetry: {
      surfaceId:
        typeof recordedTelemetry?.surfaceId === "string"
          ? recordedTelemetry.surfaceId
          : template.telemetry.surfaceId,
      grade: isFiniteNumber(recordedTelemetry?.grade)
        ? recordedTelemetry.grade
        : template.telemetry.grade,
      grip: isFiniteNumber(recordedTelemetry?.grip)
        ? recordedTelemetry.grip
        : template.telemetry.grip,
      slip: isFiniteNumber(recordedTelemetry?.slip)
        ? clamp(recordedTelemetry.slip, 0, 1)
        : template.telemetry.slip,
      waterDepth: isFiniteNumber(recordedTelemetry?.waterDepth)
        ? Math.max(0, recordedTelemetry.waterDepth)
        : template.telemetry.waterDepth,
      engineLoad: isFiniteNumber(recordedTelemetry?.engineLoad)
        ? clamp(recordedTelemetry.engineLoad, 0, 1)
        : template.telemetry.engineLoad,
      stalled:
        typeof recordedTelemetry?.stalled === "boolean"
          ? recordedTelemetry.stalled
          : template.telemetry.stalled,
    },
  };
}

function legacyWorldTime(candidate: Record<string, unknown>): number {
  const elapsedMs = isFiniteNumber(candidate.elapsedMs)
    ? Math.max(0, candidate.elapsedMs)
    : 0;
  const base =
    candidate.phase === "gloam"
      ? GLOAM_START_MINUTE
      : candidate.phase === "night"
        ? NIGHT_START_MINUTE
        : WORLD_CLOCK_START_MINUTES;
  return base + Math.floor(elapsedMs / 2400);
}

/**
 * Recover a survey contract, or report that the record is unusable.
 *
 * Returns a fresh contract when the field is absent, because a v6 record predates
 * the activity and has nothing to lose. Anything present must be internally
 * consistent: a running contract needs a start minute, an idle one must not have
 * one, and a completed one must actually name every target it was paid for.
 */
function recoverSurveyRoute(
  value: unknown,
  allowMissing: boolean,
): SurveyRouteState | null {
  if (value === undefined || value === null) {
    return allowMissing ? createSurveyRouteState() : null;
  }
  if (typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;

  if (
    candidate.id !== "survey-route" ||
    !["ready", "active", "complete", "failed"].includes(
      String(candidate.status),
    ) ||
    (candidate.startedAtMinutes !== null &&
      !isFiniteNumber(candidate.startedAtMinutes)) ||
    !isFiniteNumber(candidate.bestSightedCount) ||
    candidate.bestSightedCount < 0
  ) {
    return null;
  }

  const targets = surveyRouteTargets();
  const validTargets = new Set<string>(targets);
  const rawSighted = Array.isArray(candidate.sighted) ? candidate.sighted : [];
  const sighted = rawSighted.filter(
    (entry, index): entry is string =>
      typeof entry === "string" &&
      validTargets.has(entry) &&
      rawSighted.indexOf(entry) === index,
  );

  const status = candidate.status as SurveyRouteState["status"];
  const startedAtMinutes = candidate.startedAtMinutes as number | null;
  const running = status === "active";
  const consistent =
    (status === "ready" && startedAtMinutes === null && sighted.length === 0) ||
    (running && startedAtMinutes !== null) ||
    (status === "failed" && startedAtMinutes !== null) ||
    (status === "complete" &&
      startedAtMinutes !== null &&
      targets.every((target) => sighted.includes(target)));
  if (!consistent) return null;

  return {
    id: "survey-route",
    status,
    startedAtMinutes,
    sighted,
    bestSightedCount: Math.max(
      Math.floor(candidate.bestSightedCount as number),
      sighted.length,
    ),
  };
}

/**
 * A missing road-rivalry record is a safe additive migration: it represented no
 * accepted work in earlier saves. Present records are still checked so a broken
 * run never restores with an impossible gate or a rig identity that does not
 * exist.
 */
function recoverRoadRivalry(value: unknown): RoadRivalryState {
  if (value === undefined || value === null) return createRoadRivalryState();
  if (typeof value !== "object") return createRoadRivalryState();
  const candidate = value as Record<string, unknown>;
  const status = candidate.status === "active" ? "active" : "ready";
  const startedAtMs = isFiniteNumber(candidate.startedAtMs)
    ? Math.max(0, candidate.startedAtMs)
    : null;
  const activeRigId = isRigId(candidate.activeRigId)
    ? candidate.activeRigId
    : null;
  const validActive =
    status === "active" && startedAtMs !== null && activeRigId !== null;
  const rawBest =
    candidate.bestTimeMsByRig && typeof candidate.bestTimeMsByRig === "object"
      ? (candidate.bestTimeMsByRig as Partial<Record<RigId, unknown>>)
      : {};
  const bestTimeMsByRig: Partial<Record<RigId, number>> = {};
  for (const rigId of RIG_IDS) {
    const valueForRig = rawBest[rigId];
    if (isFiniteNumber(valueForRig) && valueForRig >= 0) {
      bestTimeMsByRig[rigId] = Math.round(valueForRig);
    }
  }
  const rawLastRun =
    candidate.lastRun && typeof candidate.lastRun === "object"
      ? (candidate.lastRun as Record<string, unknown>)
      : null;
  const lastRun =
    rawLastRun &&
    isRigId(rawLastRun.rigId) &&
    isFiniteNumber(rawLastRun.elapsedMs) &&
    rawLastRun.elapsedMs >= 0 &&
    isFiniteNumber(rawLastRun.completedAtMs) &&
    rawLastRun.completedAtMs >= 0
      ? {
          rigId: rawLastRun.rigId,
          elapsedMs: Math.round(rawLastRun.elapsedMs),
          completedAtMs: Math.round(rawLastRun.completedAtMs),
        }
      : null;
  const gateCount = roadRivalryGateIds().length;
  const nextGateIndex =
    isFiniteNumber(candidate.nextGateIndex) && candidate.nextGateIndex >= 0
      ? Math.min(
          Math.floor(candidate.nextGateIndex),
          Math.max(0, gateCount - 1),
        )
      : 0;

  return {
    id: "road-rivalry",
    status: validActive ? "active" : "ready",
    startedAtMs: validActive ? startedAtMs : null,
    activeRigId: validActive ? activeRigId : null,
    nextGateIndex: validActive ? nextGateIndex : 0,
    completedRuns:
      isFiniteNumber(candidate.completedRuns) && candidate.completedRuns >= 0
        ? Math.floor(candidate.completedRuns)
        : 0,
    bestTimeMsByRig,
    lastRun,
  };
}

function recoverShared(
  candidate: Record<string, unknown>,
  rigs: Record<RigId, RigState>,
  allowMissingSurveyRoute = false,
): GameState | null {
  const relay = candidate.cargoRelay as Record<string, unknown> | undefined;
  const cargo = relay?.cargo as Record<string, unknown> | undefined;
  if (
    !relay ||
    !cargo ||
    relay.id !== "cargo-relay" ||
    !["ready", "active", "complete"].includes(String(relay.status)) ||
    (relay.startedAt !== null && !isFiniteNumber(relay.startedAt)) ||
    (relay.completedAt !== null && !isFiniteNumber(relay.completedAt)) ||
    (relay.bestTimeMs !== null && !isFiniteNumber(relay.bestTimeMs)) ||
    cargo.id !== "relay-cargo" ||
    !isFiniteNumber(cargo.x) ||
    !isFiniteNumber(cargo.z) ||
    !isFiniteNumber(cargo.heading) ||
    (cargo.attachedRigId !== null && !isRigId(cargo.attachedRigId)) ||
    typeof cargo.delivered !== "boolean"
  ) {
    return null;
  }

  const relayStatus = relay.status as GameState["cargoRelay"]["status"];
  const relayStarted = relay.startedAt as number | null;
  const relayCompleted = relay.completedAt as number | null;
  const relayBest = relay.bestTimeMs as number | null;
  const cargoAttachedRigId = cargo.attachedRigId as RigId | null;
  const cargoDelivered = cargo.delivered;
  const rawAssignment =
    relay.assignment && typeof relay.assignment === "object"
      ? (relay.assignment as Record<string, unknown>)
      : null;
  const assignment = rawAssignment
    ? (typeof rawAssignment.missionId === "string" ||
        rawAssignment.missionId === null) &&
      typeof rawAssignment.originSiteId === "string" &&
      typeof rawAssignment.destinationSiteId === "string" &&
      findSite(rawAssignment.originSiteId) !== undefined &&
      findSite(rawAssignment.destinationSiteId) !== undefined
      ? {
          missionId: rawAssignment.missionId as string | null,
          ...(typeof rawAssignment.manifestId === "string"
            ? { manifestId: rawAssignment.manifestId }
            : {}),
          originSiteId: rawAssignment.originSiteId,
          destinationSiteId: rawAssignment.destinationSiteId,
        }
      : null
    : null;

  // The relay is a small state machine; an inconsistent combination means the
  // record was hand-edited or a migration went wrong, and silently accepting it
  // would produce an activity that can never complete.
  const relayIsConsistent =
    (relayStatus === "ready" &&
      relayStarted === null &&
      relayCompleted === null &&
      relayBest === null &&
      cargoAttachedRigId === null &&
      cargoDelivered === false) ||
    (relayStatus === "active" &&
      relayStarted !== null &&
      relayCompleted === null &&
      cargoAttachedRigId !== null &&
      cargoDelivered === false) ||
    (relayStatus === "complete" &&
      relayStarted !== null &&
      relayCompleted !== null &&
      relayBest !== null &&
      cargoAttachedRigId === null &&
      cargoDelivered === true);
  if (!relayIsConsistent) return null;

  for (const id of RIG_IDS) {
    const towHook = attachment(rigs[id], "tow-hook");
    if (!towHook) return null;
    towHook.engaged = cargoAttachedRigId === id;
  }

  const furrows = (Array.isArray(candidate.furrows) ? candidate.furrows : [])
    .filter((mark): mark is FurrowMark => {
      if (!mark || typeof mark !== "object") return false;
      const item = mark as Partial<FurrowMark>;
      return (
        isFiniteNumber(item.x) &&
        isFiniteNumber(item.z) &&
        isFiniteNumber(item.heading) &&
        isFiniteNumber(item.createdAt) &&
        isRigId(item.rigId)
      );
    })
    .map((mark) => ({
      x: mark.x,
      z: mark.z,
      heading: mark.heading,
      createdAt: mark.createdAt,
      rigId: mark.rigId,
      mode: mark.mode === "fill" ? ("fill" as const) : ("cut" as const),
    }))
    .slice(-MAX_FURROWS);

  const semanticEdits = (
    Array.isArray(candidate.semanticEdits) ? candidate.semanticEdits : []
  )
    .filter((item): item is CutFillEditRecord => {
      if (!item || typeof item !== "object") return false;
      const edit = item as Partial<CutFillEditRecord>;
      return (
        (edit.mode === "cut" || edit.mode === "fill") &&
        isRigId(edit.authorRigId) &&
        isFiniteNumber(edit.x) &&
        isFiniteNumber(edit.z) &&
        isFiniteNumber(edit.heading) &&
        isFiniteNumber(edit.width) &&
        isFiniteNumber(edit.depthDelta) &&
        isFiniteNumber(edit.affectedCellCount) &&
        isFiniteNumber(edit.createdAt)
      );
    })
    .map((edit) => ({
      mode: edit.mode,
      authorRigId: edit.authorRigId,
      x: edit.x,
      z: edit.z,
      heading: edit.heading,
      width: edit.width,
      depthDelta: edit.depthDelta,
      affectedCellCount: edit.affectedCellCount,
      createdAt: edit.createdAt,
      routeId: typeof edit.routeId === "string" ? edit.routeId : undefined,
      visualCategory: (edit.visualCategory === "fill-causeway" ||
      edit.visualCategory === "graded-pass"
        ? edit.visualCategory
        : "cut-tilled") as CutFillEditRecord["visualCategory"],
    }))
    .slice(-MAX_FURROWS);

  const fleetInheritance = (
    Array.isArray(candidate.fleetInheritance) ? candidate.fleetInheritance : []
  )
    .filter((item): item is FleetInheritanceRecord => {
      if (!item || typeof item !== "object") return false;
      const record = item as Partial<FleetInheritanceRecord>;
      return (
        isRigId(record.authorRigId) &&
        isRigId(record.benefitingRigId) &&
        typeof record.routeId === "string" &&
        isFiniteNumber(record.crossedAtMs)
      );
    })
    .map((record) => ({
      authorRigId: record.authorRigId,
      benefitingRigId: record.benefitingRigId,
      routeId: record.routeId,
      crossedAtMs: record.crossedAtMs,
      persisted: Boolean(record.persisted),
    }));

  const validLandmarkIds = new Set(LANDMARKS.map((item) => item.id));
  const discoveries = (
    Array.isArray(candidate.discoveries) ? candidate.discoveries : []
  )
    .filter((item) => {
      if (!item || typeof item !== "object") return false;
      const discovery = item as Record<string, unknown>;
      return (
        typeof discovery.id === "string" &&
        validLandmarkIds.has(discovery.id) &&
        isFiniteNumber(discovery.discoveredAt)
      );
    })
    .map((item) => {
      const discovery = item as { id: string; discoveredAt: number };
      return { id: discovery.id, discoveredAt: discovery.discoveredAt };
    });

  /*
   * A survey contract is recovered rather than trusted.
   *
   * Absent (a v6 record) means a fresh contract, which is why adding it needed a
   * schema bump but not a lossy migration. Present means every field is checked and
   * the sighting list is filtered to sites that still exist, so a renamed anchor
   * cannot restore a contract that can never be completed. An inconsistent
   * combination is rejected outright for the same reason the relay rejects one.
   */
  const surveyRoute = recoverSurveyRoute(
    candidate.surveyRoute,
    allowMissingSurveyRoute,
  );
  if (!surveyRoute) return null;
  const roadRivalry = recoverRoadRivalry(candidate.roadRivalry);
  const unboundPassage = restoreUnboundPassage(candidate.unboundPassage);

  const cargoRadius = Math.hypot(cargo.x as number, cargo.z as number);
  const cargoScale = cargoRadius > WORLD_LIMIT ? WORLD_LIMIT / cargoRadius : 1;
  const worldTimeMinutes = isFiniteNumber(candidate.worldTimeMinutes)
    ? Math.max(0, candidate.worldTimeMinutes)
    : legacyWorldTime(candidate);
  const recovery =
    candidate.recovery && typeof candidate.recovery === "object"
      ? (candidate.recovery as Record<string, unknown>)
      : null;

  const rawInventory =
    candidate.inventory && typeof candidate.inventory === "object"
      ? (candidate.inventory as Record<string, unknown>)
      : null;
  const inventory: GameState["inventory"] = {
    "steel-scrap":
      rawInventory && isFiniteNumber(rawInventory["steel-scrap"])
        ? Math.max(0, Math.floor(rawInventory["steel-scrap"] as number))
        : 0,
    microchips:
      rawInventory && isFiniteNumber(rawInventory["microchips"])
        ? Math.max(0, Math.floor(rawInventory["microchips"] as number))
        : 0,
    "fuel-cell-core":
      rawInventory && isFiniteNumber(rawInventory["fuel-cell-core"])
        ? Math.max(0, Math.floor(rawInventory["fuel-cell-core"] as number))
        : 0,
  };

  const rawPartsBin = Array.isArray(candidate.partsBin)
    ? candidate.partsBin
    : [];
  const partsBin: ModuleId[] = rawPartsBin.filter(
    (item): item is ModuleId =>
      typeof item === "string" && MODULE_IDS.includes(item as ModuleId),
  );

  const rawRestoration =
    candidate.restoration && typeof candidate.restoration === "object"
      ? (candidate.restoration as Record<string, unknown>)
      : null;
  const restoration: RestorationState = {
    diagnosed: rawRestoration?.diagnosed === true,
    repaired: rawRestoration?.repaired === true,
    firstStart: rawRestoration?.firstStart === true,
  };
  const rawFarmWaterworks =
    candidate.farmWaterworks && typeof candidate.farmWaterworks === "object"
      ? (candidate.farmWaterworks as Record<string, unknown>)
      : null;
  const farmWaterworks: FarmWaterworksState = {
    choice:
      rawFarmWaterworks?.choice === "repair-pump" ||
      rawFarmWaterworks?.choice === "redirect-channel"
        ? rawFarmWaterworks.choice
        : "unresolved",
    chosenAtWorldMinutes:
      rawFarmWaterworks &&
      isFiniteNumber(rawFarmWaterworks.chosenAtWorldMinutes)
        ? Math.max(0, rawFarmWaterworks.chosenAtWorldMinutes)
        : null,
  };
  const rawNorthFieldInvestigation =
    candidate.northFieldInvestigation &&
    typeof candidate.northFieldInvestigation === "object"
      ? (candidate.northFieldInvestigation as Record<string, unknown>)
      : null;
  const northFieldInvestigation: NorthFieldInvestigationState = {
    status:
      rawNorthFieldInvestigation?.status === "scanned"
        ? "scanned"
        : "unresolved",
    scannedAtWorldMinutes:
      rawNorthFieldInvestigation &&
      isFiniteNumber(rawNorthFieldInvestigation.scannedAtWorldMinutes)
        ? Math.max(0, rawNorthFieldInvestigation.scannedAtWorldMinutes)
        : null,
    anomalyDepthMeters:
      rawNorthFieldInvestigation &&
      isFiniteNumber(rawNorthFieldInvestigation.anomalyDepthMeters)
        ? clamp(rawNorthFieldInvestigation.anomalyDepthMeters, 0, 50)
        : null,
  };
  const settlements = recoverSettlementState(
    candidate.settlements,
    farmWaterworks.choice,
  );
  const rawOpeningNaming =
    candidate.openingNaming && typeof candidate.openingNaming === "object"
      ? (candidate.openingNaming as Record<string, unknown>)
      : null;
  const openingNaming: OpeningNamingState = {
    status:
      rawOpeningNaming?.status === "complete"
        ? "complete"
        : restoration.firstStart &&
            furrows.some((furrow) => furrow.rigId === "utility-tractor")
          ? "ready"
          : "waiting",
  };
  const rawArrivalBargain =
    candidate.arrivalBargain && typeof candidate.arrivalBargain === "object"
      ? (candidate.arrivalBargain as Record<string, unknown>)
      : null;
  const arrivalBargain: ArrivalBargainState = {
    status:
      rawArrivalBargain?.status === "accepted"
        ? "accepted"
        : rawArrivalBargain?.status === "refused"
          ? "refused"
          : restoration.firstStart
            ? "accepted"
            : "unseen",
  };

  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    seed: String(candidate.seed),
    worldTimeMinutes,
    elapsedMs: Math.max(0, candidate.elapsedMs as number),
    phase: phaseForWorldTime(worldTimeMinutes),
    cameraMode: CAMERA_MODES.includes(candidate.cameraMode as CameraMode)
      ? (candidate.cameraMode as CameraMode)
      : "chase",
    paused: false,
    mapOpen: false,
    activeRigId: candidate.activeRigId as RigId,
    rigs,
    cargoRelay: {
      id: "cargo-relay",
      status: relayStatus,
      startedAt: relayStarted,
      completedAt: relayCompleted,
      bestTimeMs: relayBest,
      assignment,
      cargo: {
        id: "relay-cargo",
        x: (cargo.x as number) * cargoScale,
        y: isFiniteNumber(cargo.y) ? clamp(cargo.y, -12, 200) : 0.65,
        z: (cargo.z as number) * cargoScale,
        heading: cargo.heading as number,
        attachedRigId: cargoAttachedRigId,
        delivered: cargoDelivered,
      },
    },
    surveyRoute,
    roadRivalry,
    infrastructure: recoverInfrastructureNetwork(
      candidate.infrastructure,
      // Legacy v13 singleton state is intentionally input-only. Recovery maps
      // it into the canonical Sunken Flats waterworks entity.
      candidate.floodgate12,
    ),
    farmWaterworks,
    northFieldInvestigation,
    settlements,
    activeMission: recoverActiveMission(candidate.activeMission),
    activeSideMissions: recoverActiveMissionList(candidate.activeSideMissions),
    unboundPassage,
    furrows,
    semanticEdits,
    fleetInheritance,
    discoveries,
    salvage: isFiniteNumber(candidate.salvage)
      ? clamp(Math.floor(candidate.salvage), 0, 99_999)
      : 0,
    salvageCollected: isFiniteNumber(candidate.salvageCollected)
      ? clamp(Math.floor(candidate.salvageCollected), 0, 999_999)
      : isFiniteNumber(candidate.salvage)
        ? clamp(Math.floor(candidate.salvage), 0, 999_999)
        : 0,
    inventory,
    partsBin,
    restoration,
    openingNaming,
    arrivalBargain,
    firstNightThreat: recoverFirstNightThreat(candidate.firstNightThreat),
    openWorldPromise: recoverOpenWorldPromise(candidate.openWorldPromise),
    recovery: {
      emergencyCount:
        recovery && isFiniteNumber(recovery.emergencyCount)
          ? clamp(Math.floor(recovery.emergencyCount), 0, 999_999)
          : 0,
      lastEmergencyAtMs:
        recovery && isFiniteNumber(recovery.lastEmergencyAtMs)
          ? Math.max(0, recovery.lastEmergencyAtMs)
          : null,
    },
    progression: recoverProgression(candidate.progression),
    // First playable slice: harvest state. New saves include it; older saves
    // restore with default values so the experience starts fresh.
    harvest: recoverHarvest(candidate.harvest),
    // Preserve the recorded diagnostic verbatim, including null. Recovery used to
    // substitute a "record restored" message here, which meant an identical save
    // round-tripped to a *different* state — breaking deterministic replay at the
    // first checkpoint. A restore notice is a presentation concern and belongs in
    // `LoadResult.message`, which `storage.ts` already returns for that purpose.
    lastDiagnostic:
      typeof candidate.lastDiagnostic === "string"
        ? candidate.lastDiagnostic
        : null,
  };
}

function recoverCurrent(
  candidate: Record<string, unknown>,
  allowMissingSurveyRoute = false,
): GameState | null {
  const recovery =
    candidate.recovery && typeof candidate.recovery === "object"
      ? (candidate.recovery as Record<string, unknown>)
      : null;
  if (
    typeof candidate.seed !== "string" ||
    candidate.seed.length < 1 ||
    !isFiniteNumber(candidate.worldTimeMinutes) ||
    !isFiniteNumber(candidate.elapsedMs) ||
    !PHASE_ORDER.includes(candidate.phase as WorldPhase) ||
    candidate.phase !== phaseForWorldTime(candidate.worldTimeMinutes) ||
    !recovery ||
    !isFiniteNumber(recovery.emergencyCount) ||
    (recovery.lastEmergencyAtMs !== null &&
      !isFiniteNumber(recovery.lastEmergencyAtMs)) ||
    !isRigId(candidate.activeRigId) ||
    !candidate.rigs ||
    typeof candidate.rigs !== "object"
  ) {
    return null;
  }

  const rigValues = candidate.rigs as Partial<Record<RigId, unknown>>;
  const recoveredRigs = {} as Record<RigId, RigState>;
  for (const id of RIG_IDS) {
    if (rigValues[id] !== undefined) {
      const r = recoverRig(rigValues[id], id);
      if (!r) return null;
      recoveredRigs[id] = r;
    } else {
      const berth = RIG_HOME_BERTHS[id];
      recoveredRigs[id] = createRig(id, berth.x, berth.z, berth.heading);
    }
  }

  return recoverShared(
    candidate,
    recoveredRigs,
    allowMissingSurveyRoute,
  );
}

/**
 * Move only the untouched legacy Drift berth into the canonical Home chain.
 *
 * Position alone is not enough: an active, moved, damaged, strained, upgraded,
 * towing, or tool-engaged rig is player history and must remain exactly where
 * the earlier build recorded it.
 */
function relocatePristineLegacyDrift(state: GameState): boolean {
  const marsh = findSite("sunken-flats");
  if (!marsh) return false;
  const drift = state.rigs["marsh-skimmer"];
  const oldX = marsh.x + 8;
  const oldZ = marsh.z + 5;
  const untouched =
    state.activeRigId !== drift.id &&
    state.cargoRelay.cargo.attachedRigId !== drift.id &&
    Math.hypot(drift.x - oldX, drift.z - oldZ) <= 0.25 &&
    Math.abs(drift.speed) <= 0.01 &&
    drift.distanceTravelled <= 0.001 &&
    drift.condition >= 99.999 &&
    drift.strain <= 0.001 &&
    drift.modules.length === 0 &&
    drift.attachments.every((attachment) => !attachment.engaged);
  if (!untouched) return false;

  const berth = RIG_HOME_BERTHS[drift.id];
  drift.x = berth.x;
  drift.z = berth.z;
  drift.heading = berth.heading;
  drift.speed = 0;
  drift.steering = 0;
  return true;
}

function migrateV6(candidate: Record<string, unknown>): GameState | null {
  const recovered = recoverCurrent(candidate, true);
  if (!recovered) return null;
  recovered.lastDiagnostic =
    "Schema v6 record migrated. Survey contracts are available from the Home Silo.";
  return recovered;
}

function migrateV5(candidate: Record<string, unknown>): GameState | null {
  const recovered = recoverCurrent(candidate, true);
  if (!recovered) return null;
  if (relocatePristineLegacyDrift(recovered)) {
    recovered.lastDiagnostic =
      "Schema v5 record migrated. Untouched Drift is now berthed at Home Silo; player-positioned rigs were preserved.";
  } else {
    recovered.lastDiagnostic =
      "Schema v5 record migrated with existing rig positions preserved.";
  }
  return recovered;
}

/** Migrate the v4 field record into explicit world-clock/recovery state. */
function migrateV4(candidate: Record<string, unknown>): GameState | null {
  if (
    typeof candidate.seed !== "string" ||
    candidate.seed.length < 1 ||
    !isFiniteNumber(candidate.elapsedMs) ||
    !PHASE_ORDER.includes(candidate.phase as WorldPhase) ||
    !isRigId(candidate.activeRigId) ||
    !candidate.rigs ||
    typeof candidate.rigs !== "object"
  ) {
    return null;
  }

  const rigValues = candidate.rigs as Partial<Record<RigId, unknown>>;
  const recoveredRigs = {} as Record<RigId, RigState>;
  for (const id of RIG_IDS) {
    if (rigValues[id] !== undefined) {
      const r = recoverRig(rigValues[id], id);
      if (!r) return null;
      recoveredRigs[id] = r;
    } else {
      const berth = RIG_HOME_BERTHS[id];
      recoveredRigs[id] = createRig(id, berth.x, berth.z, berth.heading);
    }
  }

  const recovered = recoverShared(
    candidate,
    recoveredRigs,
    true,
  );
  if (recovered) {
    const relocated = relocatePristineLegacyDrift(recovered);
    recovered.lastDiagnostic = relocated
      ? "Schema v4 record migrated to the monotonic field clock, recovery log, and canonical Home berths."
      : "Schema v4 record migrated to the monotonic field clock and recovery log; player rig positions were preserved.";
  }
  return recovered;
}

/**
 * Migrate Field 02 legacy schema into the bounded-adapter state shape.
 */
function migrateField02Legacy(
  candidate: Record<string, unknown>,
): GameState | null {
  if (
    typeof candidate.seed !== "string" ||
    candidate.seed.length < 1 ||
    !isFiniteNumber(candidate.elapsedMs) ||
    !PHASE_ORDER.includes(candidate.phase as WorldPhase) ||
    !isRigId(candidate.activeRigId) ||
    !candidate.rigs ||
    typeof candidate.rigs !== "object"
  ) {
    return null;
  }

  const rigValues = candidate.rigs as Partial<Record<RigId, unknown>>;
  const recoveredRigs = {} as Record<RigId, RigState>;
  for (const id of RIG_IDS) {
    if (rigValues[id] !== undefined) {
      const r = recoverRig(rigValues[id], id, true);
      if (!r) return null;
      recoveredRigs[id] = r;
    } else {
      const berth = RIG_HOME_BERTHS[id];
      recoveredRigs[id] = createRig(id, berth.x, berth.z, berth.heading);
    }
  }

  const recovered = recoverShared(
    candidate,
    recoveredRigs,
    true,
  );
  if (recovered) {
    recovered.lastDiagnostic =
      "Field 02 record migrated. Drift is berthed in the Home Silo proximity chain.";
  }
  return recovered;
}

/**
 * Migrate a Field Test 001 (v1) record.
 *
 * v1 stored one `vehicle` on a flat plane. Position is preserved but the world it
 * was recorded in no longer exists, so the rig is re-settled onto terrain by
 * `settleWorld` after load rather than trusting the old `y`.
 */
function migrateV1(candidate: Record<string, unknown>): GameState | null {
  const vehicle = candidate.vehicle as Record<string, unknown> | undefined;
  if (
    typeof candidate.seed !== "string" ||
    candidate.seed.length < 1 ||
    !isFiniteNumber(candidate.elapsedMs) ||
    !PHASE_ORDER.includes(candidate.phase as WorldPhase) ||
    !vehicle ||
    !isFiniteNumber(vehicle.x) ||
    !isFiniteNumber(vehicle.z) ||
    !isFiniteNumber(vehicle.heading) ||
    !isFiniteNumber(vehicle.speed) ||
    !isFiniteNumber(vehicle.steering) ||
    !isFiniteNumber(vehicle.distanceTravelled) ||
    !isFiniteNumber(vehicle.wheelRotation) ||
    typeof vehicle.ploughLowered !== "boolean"
  ) {
    return null;
  }

  const migrated = createInitialState(candidate.seed);
  migrated.elapsedMs = Math.max(0, candidate.elapsedMs);
  migrated.worldTimeMinutes = legacyWorldTime(candidate);
  migrated.phase = phaseForWorldTime(migrated.worldTimeMinutes);
  if (CAMERA_MODES.includes(candidate.cameraMode as CameraMode)) {
    migrated.cameraMode = candidate.cameraMode as CameraMode;
  }

  const tractor = migrated.rigs["utility-tractor"];
  const radius = Math.hypot(vehicle.x, vehicle.z);
  const scale = radius > WORLD_LIMIT ? WORLD_LIMIT / radius : 1;
  tractor.x = vehicle.x * scale;
  tractor.z = vehicle.z * scale;
  tractor.heading = vehicle.heading;
  tractor.speed = clamp(
    vehicle.speed,
    RIG_PROFILES["utility-tractor"].reverseLimit,
    RIG_PROFILES["utility-tractor"].topSpeed,
  );
  tractor.steering = clamp(vehicle.steering, -1, 1);
  tractor.distanceTravelled = Math.max(0, vehicle.distanceTravelled);
  if (tractor.mobility.kind !== "ground") return null;
  tractor.mobility.wheelRotation = vehicle.wheelRotation;
  attachment(tractor, "field-plough")!.engaged = vehicle.ploughLowered;

  const validLandmarkIds = new Set(LANDMARKS.map((item) => item.id));
  if (Array.isArray(candidate.discoveries)) {
    migrated.discoveries = candidate.discoveries
      .filter((item) => {
        if (!item || typeof item !== "object") return false;
        const discovery = item as Record<string, unknown>;
        return (
          typeof discovery.id === "string" &&
          validLandmarkIds.has(discovery.id) &&
          isFiniteNumber(discovery.discoveredAt)
        );
      })
      .map((item) => {
        const discovery = item as { id: string; discoveredAt: number };
        return { id: discovery.id, discoveredAt: discovery.discoveredAt };
      });
  }
  migrated.lastDiagnostic =
    "Field Test 001 record migrated. The flat field is now terrain.";
  return migrated;
}

/**
 * Migrate a Rig Lab 01 (v2) record.
 *
 * v2's rig shape is a strict subset of the legacy schema, so the shared
 * recovery path handles it directly. The only semantic change is the world: v2
 * positions were recorded
 * on a flat plane inside a `±92` box, so they are clamped into the disc and
 * re-settled onto terrain.
 */
function migrateV2(candidate: Record<string, unknown>): GameState | null {
  const recovered = migrateField02Legacy(candidate);
  if (!recovered) return null;
  recovered.lastDiagnostic =
    "Rig Lab 01 record migrated. Both rigs re-settled onto real terrain.";
  return recovered;
}

function migratePriorSchema(
  candidate: Record<string, unknown>,
  sourceSchemaVersion: number,
): GameState | null {
  const recovered = recoverCurrent(candidate, true);
  if (!recovered) return null;
  const message =
    sourceSchemaVersion === V13_SAVE_SCHEMA_VERSION
      ? "Schema v13 record migrated. World infrastructure now owns the former Floodgate state."
      : `Schema v${sourceSchemaVersion} record migrated. Progression state is now tracked alongside the field.`;
  recovered.lastDiagnostic = message;
  return recovered;
}

function migrateV7(candidate: Record<string, unknown>): GameState | null {
  const recovered = recoverCurrent(candidate, true);
  if (!recovered) return null;
  recovered.lastDiagnostic =
    "Schema v7 record migrated. Semantic terrain edits and fleet route memory are enabled.";
  return recovered;
}

export function recoverState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion === SAVE_SCHEMA_VERSION) {
    return recoverCurrent(candidate);
  }
  if (candidate.schemaVersion === PREVIOUS_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, PREVIOUS_SAVE_SCHEMA_VERSION);
  }
  // v27 kept its own branch when v28 became PREVIOUS_SAVE_SCHEMA_VERSION.
  // Without it a v27 save falls through every case and recovers as null,
  // which the load path reads as "no save" — silent total progress loss.
  if (candidate.schemaVersion === V27_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V27_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V26_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V26_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V24_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V24_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V18_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V18_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V17_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V17_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V16_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V16_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V15_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V15_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V14_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V14_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V13_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V13_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V12_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V12_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V11_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V11_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V10_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V10_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V9_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V9_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V8_SAVE_SCHEMA_VERSION) {
    return migratePriorSchema(candidate, V8_SAVE_SCHEMA_VERSION);
  }
  if (candidate.schemaVersion === V7_SAVE_SCHEMA_VERSION) {
    return migrateV7(candidate);
  }
  if (candidate.schemaVersion === V6_SAVE_SCHEMA_VERSION) {
    return migrateV6(candidate);
  }
  if (candidate.schemaVersion === DRIFT_BERTH_SAVE_SCHEMA_VERSION) {
    return migrateV5(candidate);
  }
  if (candidate.schemaVersion === FIELD_CLOCK_SAVE_SCHEMA_VERSION) {
    return migrateV4(candidate);
  }
  if (candidate.schemaVersion === FIELD_02_SAVE_SCHEMA_VERSION) {
    return migrateField02Legacy(candidate);
  }
  if (candidate.schemaVersion === RIG_LAB_SAVE_SCHEMA_VERSION) {
    return migrateV2(candidate);
  }
  if (candidate.schemaVersion === LEGACY_SAVE_SCHEMA_VERSION) {
    return migrateV1(candidate);
  }
  return null;
}

/**
 * Issue a fleet-recovery command from the runtime.
 *
 * This is the single mutating entry point for recovery. It derives weather from
 * the same monotonic clock the simulation uses, resolves through the command
 * boundary, and applies only an accepted transition. A rejection returns its
 * player-readable reason rather than throwing, because "not yet, here is why"
 * is the normal answer during a logistics operation.
 */
export function performFleetRecovery(
  state: GameState,
  world: GameWorld,
  command: FleetRecoveryCommand,
): FleetRecoveryTransition {
  const weather = deriveWeatherState(state.worldTimeMinutes);
  const transition = resolveFleetRecoveryCommand(
    state,
    world,
    weather,
    command,
    Math.max(0, Math.floor(state.elapsedMs)),
  );
  if (transition.accepted) {
    applyFleetRecovery(state, transition.event);
  } else {
    state.lastDiagnostic = transition.reason;
  }
  return transition;
}

/**
 * Adjust the active rig's tyre pressure.
 *
 * A commitment with a cost: lower pressure floats better on soft ground and
 * gives up top end on hard ground. The kernel owns the value so it survives
 * reload and replay, and so the assessment and the wheel read the same number.
 */
export function setTirePressure(state: GameState, psi: number): string {
  const rig = activeRig(state);
  const next = clamp(psi, MIN_TIRE_PRESSURE_PSI, MAX_TIRE_PRESSURE_PSI);
  if (next === rig.tools.tirePressurePsi) {
    return `Tyres already at ${next} PSI.`;
  }
  const loweredPressure = next < rig.tools.tirePressurePsi;
  rig.tools.tirePressurePsi = next;
  state.lastDiagnostic = loweredPressure
    ? `Aired down to ${next} PSI. More float in mud, less top end on hardpan.`
    : `Aired up to ${next} PSI. Faster on hardpan, less float in mud.`;
  return state.lastDiagnostic;
}

/** Cycle the drivetrain coupling: open -> limited-slip -> locked -> open. */
export function cycleDifferentialMode(state: GameState): string {
  const rig = activeRig(state);
  const order: readonly DifferentialMode[] = ["open", "limited-slip", "locked"];
  const index = order.indexOf(rig.tools.differentialMode);
  const next = order[(index + 1) % order.length] ?? "open";
  rig.tools.differentialMode = next;
  state.lastDiagnostic =
    next === "locked"
      ? "Differential locked. Climbs better, turns wider."
      : next === "limited-slip"
        ? "Limited slip engaged. Some climb gain, mild scrub."
        : "Differential open. Turns freely, spins a wheel in mud.";
  return state.lastDiagnostic;
}
