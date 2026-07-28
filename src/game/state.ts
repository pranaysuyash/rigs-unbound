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
  CARGO_DELIVERY,
  CARGO_PICKUP,
  effectiveProfile,
  FIELD_CLOCK_SAVE_SCHEMA_VERSION,
  FIELD_02_SAVE_SCHEMA_VERSION,
  FIXED_STEP_SECONDS,
  GLOAM_START_MINUTE,
  type CutFillEditRecord,
  type FleetInheritanceRecord,
  type FurrowMark,
  type GameState,
  type GroundMobilityState,
  IDLE_INPUT,
  type InputFrame,
  LANDMARKS,
  LEGACY_SAVE_SCHEMA_VERSION,
  MAX_FURROWS,
  MODULES,
  type ModuleId,
  NIGHT_START_MINUTE,
  phaseForWorldTime,
  RIG_CAPABILITIES,
  RIG_IDS,
  RIG_SWITCH_RANGE,
  RIG_LAB_SAVE_SCHEMA_VERSION,
  RIG_PROFILES,
  type RigCapability,
  type RigId,
  type RigState,
  DRIFT_BERTH_SAVE_SCHEMA_VERSION,
  SAVE_SCHEMA_VERSION,
  PREVIOUS_SAVE_SCHEMA_VERSION,
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
} from "./contracts";
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
  RELAY_CARGO_TOW_AFFORDANCE,
  SURVEY_CONTRACT_AFFORDANCE,
  resolveAffordance,
  type AffordanceResolution,
} from "./affordances";
import {
  activityDefinition,
  createSurveyRouteState,
  evaluateSurveyRoute,
  surveyRouteMinutesRemaining,
  surveyRouteTargets,
} from "./activities";
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
import { clamp } from "./noise";
import {
  createUnboundPassageState,
  readUnboundPassage,
  restoreUnboundPassage,
} from "./unbound-passage";
import { rigIsStable, settleRig, stepRigMotion } from "./physics";
import {
  findSite,
  HOME_SITE,
  isWithinSiteServiceArea,
  RESOLVED_ROUTES,
  RIG_HOME_BERTHS,
  SITE_SIGNALS,
  WORLD_SITES,
} from "./world";

const FURROW_SPACING = 1.1;
const CARGO_HITCH_DISTANCE = 2.8;
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
    mobility: createMobility(id),
    attachments:
      id === "utility-tractor"
        ? [
            { id: "field-plough", engaged: false, mode: "cut" },
            { id: "tow-hook", engaged: false },
          ]
        : [{ id: "tow-hook", engaged: false }],
    modules: [],
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
    rigs: {
      "utility-tractor": createRig(
        "utility-tractor",
        RIG_HOME_BERTHS["utility-tractor"].x,
        RIG_HOME_BERTHS["utility-tractor"].z,
        RIG_HOME_BERTHS["utility-tractor"].heading,
      ),
      "toy-buggy": createRig(
        "toy-buggy",
        RIG_HOME_BERTHS["toy-buggy"].x,
        RIG_HOME_BERTHS["toy-buggy"].z,
        RIG_HOME_BERTHS["toy-buggy"].heading,
      ),
      "marsh-skimmer": createRig(
        "marsh-skimmer",
        RIG_HOME_BERTHS["marsh-skimmer"].x,
        RIG_HOME_BERTHS["marsh-skimmer"].z,
        RIG_HOME_BERTHS["marsh-skimmer"].heading,
      ),
    },
    cargoRelay: {
      id: "cargo-relay",
      status: "ready",
      startedAt: null,
      completedAt: null,
      bestTimeMs: null,
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
    unboundPassage: createUnboundPassageState(),
    furrows: [],
    semanticEdits: [],
    fleetInheritance: [],
    discoveries: [],
    salvage: 0,
    salvageCollected: 0,
    recovery: {
      emergencyCount: 0,
      lastEmergencyAtMs: null,
    },
    progression: createInitialProgressionState(RIG_IDS),
    lastDiagnostic: null,
  };
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

// -----------------------------------------------------------------------------
// Player actions
// -----------------------------------------------------------------------------

export type PrimaryActionKind =
  | "release-cargo"
  | "attach-cargo"
  | "take-survey-contract"
  | "collect-salvage"
  | "lower-plough"
  | "raise-plough"
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
  const cargo = state.cargoRelay.cargo;

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
      inRange:
        Math.hypot(rig.x - cargo.x, rig.z - cargo.z) <= CARGO_PICKUP.radius,
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
    Math.hypot(rig.x - cargo.x, rig.z - cargo.z) <= CARGO_PICKUP.radius
  ) {
    return {
      kind: "none",
      label: "Tow required",
      ariaLabel: "Relay cargo requires a tow capability",
      affordance: cargoAffordance,
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
    state.lastDiagnostic = `${profile.displayName} attached the relay crate. Haul it to Long Furrow.`;
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
    state.salvage += node.value;
    state.salvageCollected += node.value;
    state.lastDiagnostic = `Recovered ${node.value} salvage. ${state.salvage} in the bin.`;
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

  const reasonCode =
    resolution.affordance?.reasonCode === "missing-capability"
      ? "missing-capability"
      : "no-contextual-action";
  state.lastDiagnostic =
    reasonCode === "missing-capability"
      ? resolution.affordance?.affordanceId === "survey-contract-board"
        ? `${profile.fieldName} cannot take this contract: survey capability required.`
        : `${profile.fieldName} cannot attach this relay cargo: tow capability required.`
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
    state.lastDiagnostic = `Emergency field recovery returned ${profile.fieldName} to Home Silo with a ${EMERGENCY_RECOVERY_CONDITION}% limp-home patch. No salvage awarded.`;
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
    state.lastDiagnostic = `${definition.name} does not fit ${RIG_PROFILES[rig.id].fieldName}.`;
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
  if (!workshopInReach(state)) {
    state.lastDiagnostic = "Repairs need the Home Silo workshop pad.";
    return;
  }
  if (rig.condition >= 99.5 && rig.strain < 0.05) {
    state.lastDiagnostic = "Nothing to repair.";
    return;
  }
  if (state.salvage < REPAIR_COST) {
    state.lastDiagnostic = `Repairs cost ${REPAIR_COST} salvage; ${state.salvage} in the bin.`;
    return;
  }
  state.salvage -= REPAIR_COST;
  rig.condition = Math.min(100, rig.condition + REPAIR_AMOUNT);
  rig.strain = 0;
  state.lastDiagnostic = `${RIG_PROFILES[rig.id].fieldName} rebuilt to ${Math.round(rig.condition)}%.`;
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
    state.lastDiagnostic = `${profile.fieldName} carries no blade. Torque does.`;
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

  if (
    Math.hypot(cargo.x - CARGO_DELIVERY.x, cargo.z - CARGO_DELIVERY.z) <=
    CARGO_DELIVERY.radius
  ) {
    cargo.attachedRigId = null;
    cargo.delivered = true;
    cargo.x = CARGO_DELIVERY.x;
    cargo.z = CARGO_DELIVERY.z;
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
    state.progression = applyActivityCompletionProgression(
      state.progression,
      "cargo-relay",
      rig.id,
    );
    state.lastDiagnostic = `Relay delivered in ${(duration / 1000).toFixed(1)} s with ${RIG_PROFILES[rig.id].displayName}.`;
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
  const rig = activeRig(state);
  const profile = effectiveProfile(rig.id, rig.modules);
  const towing = state.cargoRelay.cargo.attachedRigId === rig.id;
  const disabled = rig.condition <= 0;
  if (
    disabled &&
    (input.accelerate || input.brake || input.steerLeft || input.steerRight)
  ) {
    state.lastDiagnostic = `${profile.fieldName} is disabled. Press X or Winch for emergency field recovery.`;
  }
  if (disabled) {
    rig.speed = 0;
    rig.steering = 0;
    settleRig(rig, profile, world.terrain);
    state.elapsedMs += dt * 1000;
    state.worldTimeMinutes += dt * WORLD_MINUTES_PER_REAL_SECOND;
    state.phase = phaseForWorldTime(state.worldTimeMinutes);
    return;
  }

  // Weather is derived from the same monotonic world clock the phase uses, so
  // it is deterministic and replay-safe. It reaches the motion model here — the
  // simulation gets wetter ground *before* any mission copy claims it is harder.
  const weather = deriveWeatherState(state.worldTimeMinutes);
  const motion = stepRigMotion(rig, profile, input, world.terrain, dt, {
    towing,
    ramp: BUGGY_RAMP,
    canJump: profile.capabilities.includes("jump"),
    soilMoisture: weather.soilMoisture,
  });

  // ---------------------------------------------------------------------------
  // Collision. Resolved after motion so the push-out is the final word on
  // position, and the rig is re-settled if a tree came down under it.
  // ---------------------------------------------------------------------------
  const rigRadius = profile.track * 0.5 + 0.25;
  const collision = world.obstacles.resolve(
    rig,
    rigRadius,
    profile.mass,
    world.felledObstacles,
  );
  const structureCollision = world.structureCollision(rig, rigRadius);
  if (collision.felled) {
    world.fell(collision.felled.id);
    state.lastDiagnostic = `${profile.fieldName} pushed a tree over. The clearing stays open.`;
  } else if (collision.hit && collision.impactSpeed > 3.2) {
    const damage = Math.min(
      12,
      (collision.impactSpeed - 3.2) *
        1.6 *
        (profile.landingTolerance > 8 ? 0.55 : 1),
    );
    rig.condition = clamp(rig.condition - damage, 0, 100);
    if (damage > 1.5) {
      state.lastDiagnostic = `${profile.fieldName} struck ${collision.blockedBy?.kind ?? "an obstacle"} · condition ${Math.round(rig.condition)}%.`;
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
      state.lastDiagnostic = `${profile.fieldName} struck ${structureCollision.blockedBy?.id ?? "an authored structure"} · condition ${Math.round(rig.condition)}%.`;
    }
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
      state.lastDiagnostic = `Water over ${profile.fordDepth.toFixed(1)} m is drowning ${profile.fieldName}. Pontoons would cross this.`;
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
      const bladeDelta = plough.mode === "fill" ? PLOUGH_FILL : PLOUGH_DEPTH;
      if (world.terrain.deform(markX, markZ, bladeDelta, 1)) {
        const mode = plough.mode === "fill" ? "fill" : "cut";
        state.furrows.push({
          x: markX,
          z: markZ,
          heading: rig.heading,
          createdAt: state.elapsedMs,
          rigId: rig.id,
          mode,
        } satisfies FurrowMark);
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
          const authorName = RIG_PROFILES[authorRigId].fieldName;
          state.lastDiagnostic = `${profile.fieldName} is benefiting from the route opened by ${authorName}!`;
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Discovery and survey.
  // ---------------------------------------------------------------------------
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
      const reward = activityDefinition("survey-route").reward.salvage;
      state.salvage += reward;
      state.salvageCollected += reward;
      state.progression = applyActivityCompletionProgression(
        state.progression,
        "survey-route",
        rig.id,
      );
      state.lastDiagnostic = `Survey contract filed from sight alone. ${reward} salvage.`;
    } else if (evaluation.failed) {
      state.lastDiagnostic =
        "Survey contract lapsed. The light went before every signal was sighted.";
    } else if (evaluation.newlySighted.length > 0) {
      const remaining =
        surveyRouteTargets().length - evaluation.state.sighted.length;
      state.lastDiagnostic =
        remaining > 0
          ? `Signal sighted. ${remaining} left on the contract.`
          : "Signal sighted.";
    }
  }

  updateCargo(state, world, rig);

  // Idle rigs recover strain, so parking a machine is a real choice.
  for (const id of RIG_IDS) {
    if (id === rig.id) continue;
    const idle = state.rigs[id];
    idle.strain = approach(idle.strain, 0, 0.04 * dt);
  }

  state.elapsedMs += dt * 1000;
  state.worldTimeMinutes += dt * WORLD_MINUTES_PER_REAL_SECOND;
  state.phase = phaseForWorldTime(state.worldTimeMinutes);
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
      distanceTravelled: fixedNumber(rig.distanceTravelled, 2),
      attachments: rig.attachments.map((item) => ({ ...item })),
      modules: [...rig.modules],
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
  const fleetRecovery = fleetRecoveryProjection(
    deriveFleetRecoveryAssessment(state, world, publicWeather),
  );
  const workshop = workshopInReach(state);
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
    },
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
      delivered: state.cargoRelay.cargo.delivered,
      cargoPosition: {
        x: fixedNumber(state.cargoRelay.cargo.x, 3),
        y: fixedNumber(state.cargoRelay.cargo.y, 3),
        z: fixedNumber(state.cargoRelay.cargo.z, 3),
      },
      deliveryPosition: { x: CARGO_DELIVERY.x, z: CARGO_DELIVERY.z },
      rampPosition: { x: BUGGY_RAMP.x, z: BUGGY_RAMP.z },
    },
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
    lastDiagnostic: state.lastDiagnostic,
  };
}

// -----------------------------------------------------------------------------
// Save recovery and migration
// -----------------------------------------------------------------------------

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRigId(value: unknown): value is RigId {
  return RIG_IDS.includes(value as RigId);
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
    mobility,
    attachments,
    modules: recoverModules(candidate.modules, id),
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
  const tractor = recoverRig(rigValues["utility-tractor"], "utility-tractor");
  const buggy = recoverRig(rigValues["toy-buggy"], "toy-buggy");
  const skimmer = recoverRig(rigValues["marsh-skimmer"], "marsh-skimmer");
  if (!tractor || !buggy || !skimmer) return null;

  return recoverShared(
    candidate,
    {
      "utility-tractor": tractor,
      "toy-buggy": buggy,
      "marsh-skimmer": skimmer,
    },
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

/** Migrate v5 into the canonical three-rig Home berth contract. */
/**
 * Migrate a v6 record, which predates survey contracts.
 *
 * Purely additive: `recoverSurveyRoute` supplies a fresh contract when the field is
 * absent, so nothing in a v6 save is reinterpreted or lost.
 */
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
  const tractor = recoverRig(rigValues["utility-tractor"], "utility-tractor");
  const buggy = recoverRig(rigValues["toy-buggy"], "toy-buggy");
  const skimmer = recoverRig(rigValues["marsh-skimmer"], "marsh-skimmer");
  if (!tractor || !buggy || !skimmer) return null;

  const recovered = recoverShared(
    candidate,
    {
      "utility-tractor": tractor,
      "toy-buggy": buggy,
      "marsh-skimmer": skimmer,
    },
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
 *
 * The two ground rigs keep their established identity and motion state, while
 * Drift is introduced at its authored Sunken Flats berth. Adding the new rig
 * here is intentional schema migration, not recovery fallback: a corrupt legacy
 * Field 02 payload still rejects the whole record.
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
  const tractor = recoverRig(
    rigValues["utility-tractor"],
    "utility-tractor",
    true,
  );
  const buggy = recoverRig(rigValues["toy-buggy"], "toy-buggy", true);
  if (!tractor || !buggy) return null;

  const driftBerth = RIG_HOME_BERTHS["marsh-skimmer"];
  const skimmer = createRig(
    "marsh-skimmer",
    driftBerth.x,
    driftBerth.z,
    driftBerth.heading,
  );
  const recovered = recoverShared(
    candidate,
    {
      "utility-tractor": tractor,
      "toy-buggy": buggy,
      "marsh-skimmer": skimmer,
    },
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
  recovered.lastDiagnostic = `Schema v${sourceSchemaVersion} record migrated. Progression state is now tracked alongside the field.`;
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
