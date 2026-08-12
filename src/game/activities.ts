import {
  RIG_CAPABILITIES,
  type RigId,
  type RigCapability,
  type RoadRivalryState,
  type RoadRivalryRunRecord,
  type SurveyRouteState,
} from "./contracts";
import { WORLD_SITES, type WorldSiteId } from "./world";

export type { RoadRivalryState, SurveyRouteState };

/**
 * Typed activity definitions.
 *
 * Stage 1 of the refactor named in
 * `docs/research/ACTIVITY_CONTENT_AND_COMMAND_CONTRACT_READINESS_2026-07-26.md`,
 * which deferred this registry until a second materially different activity
 * existed and required that the first stage migrate *both* — wrapping only the new
 * one would create two activity truth paths.
 */
export const ACTIVITY_CONTRACT_VERSION = 1 as const;

export type ActivityId = "cargo-relay" | "survey-route" | "road-rivalry";

/**
 * What the ground *means* while an activity is running.
 *
 * This is the load-bearing idea of the whole project, so it is a named field
 * rather than an implicit consequence of each activity's code.
 *
 * Hauling and surveying run on the same heightfield, the same rig, the same fixed
 * step and the same save file. What differs is which property of the terrain
 * decides success. Under `haul`, elevation is a cost to be avoided: every metre
 * climbed is drive force spent and grip risked. Under `survey`, elevation is the
 * resource being spent *for*: height is what buys sightlines, so the hill that
 * punished the hauler is the thing the surveyor is looking for.
 *
 * A genre change in Rigs Unbound is therefore a change of binding, not a change of
 * scene. Naming it here is what stops the second activity from quietly becoming a
 * second game with its own world, its own physics and its own save format.
 */
export type ActivityBinding = "haul" | "survey" | "rally";

export interface ActivityDefinition {
  id: ActivityId;
  version: typeof ACTIVITY_CONTRACT_VERSION;
  name: string;
  /** One line of player-facing intent; not a rules description. */
  premise: string;
  binding: ActivityBinding;
  /**
   * Requirements are capability constraints, never rig ids.
   *
   * A machine qualifies by what it can do, so a future rig or a fitted module
   * qualifies automatically without this table being edited.
   */
  requiredCapabilities: readonly RigCapability[];
  /** Authored world anchors this activity resolves against, by site id. */
  worldRefs: readonly WorldSiteId[];
  reward: {
    salvage: number;
    /** Insight earned for knowledge progression. */
    insight: number;
    /** Investment applied to the completing rig's Journey. */
    journeyInvestment: number;
  };
}

export const ACTIVITY_DEFINITIONS: readonly ActivityDefinition[] = [
  {
    id: "cargo-relay",
    version: ACTIVITY_CONTRACT_VERSION,
    name: "Relay haul",
    premise: "Get the crate to the Long Furrow without shaking it off.",
    binding: "haul",
    requiredCapabilities: ["tow"],
    worldRefs: ["long-furrow"],
    reward: { salvage: 3, insight: 3, journeyInvestment: 2 },
  },
  {
    id: "survey-route",
    version: ACTIVITY_CONTRACT_VERSION,
    name: "Survey contract",
    // Won by seeing, never by arriving. The player is paid for knowledge.
    premise: "Sight every named signal before the light goes.",
    binding: "survey",
    requiredCapabilities: ["survey"],
    worldRefs: ["quarry-shelf", "toy-grove", "launch-ridge"],
    reward: { salvage: 5, insight: 5, journeyInvestment: 4 },
  },
  {
    id: "road-rivalry",
    version: ACTIVITY_CONTRACT_VERSION,
    name: "Grove Run",
    premise:
      "Take a machine from Toy Grove through Quarry Shelf to Home Silo. The land keeps the record.",
    binding: "rally",
    requiredCapabilities: ["rally"],
    worldRefs: ["toy-grove", "quarry-shelf", "home-silo"],
    // The record is the reward. A repeatable open-road activity must not turn
    // into a salvage faucet simply because a player improves a machine.
    reward: { salvage: 0, insight: 0, journeyInvestment: 0 },
  },
];

export interface ActivityDefinitionProblem {
  activityId: string;
  problem: string;
}

/**
 * Validate the registry against the world it claims to reference.
 *
 * Authored tables are trusted content, but "trusted" means checked at boot rather
 * than assumed: a definition naming a site that has been renamed, or a capability
 * that no longer exists, is a silently dead activity otherwise.
 */
export function validateActivityDefinitions(
  definitions: readonly ActivityDefinition[] = ACTIVITY_DEFINITIONS,
): readonly ActivityDefinitionProblem[] {
  const problems: ActivityDefinitionProblem[] = [];
  const seen = new Set<string>();
  const siteIds = new Set<string>(WORLD_SITES.map((site) => site.id));

  for (const definition of definitions) {
    if (seen.has(definition.id)) {
      problems.push({
        activityId: definition.id,
        problem: "duplicate activity id",
      });
    }
    seen.add(definition.id);

    if (definition.version !== ACTIVITY_CONTRACT_VERSION) {
      problems.push({
        activityId: definition.id,
        problem: `unsupported contract version ${String(definition.version)}`,
      });
    }

    if (definition.requiredCapabilities.length === 0) {
      // An activity every machine qualifies for cannot express a machine choice,
      // which is the entire point of a machine-centric game.
      problems.push({
        activityId: definition.id,
        problem: "no required capability",
      });
    }

    for (const capability of definition.requiredCapabilities) {
      if (!RIG_CAPABILITIES.includes(capability)) {
        problems.push({
          activityId: definition.id,
          problem: `unknown capability ${capability}`,
        });
      }
    }

    if (definition.worldRefs.length === 0) {
      problems.push({
        activityId: definition.id,
        problem: "no authored world reference",
      });
    }

    for (const siteId of definition.worldRefs) {
      if (!siteIds.has(siteId)) {
        problems.push({
          activityId: definition.id,
          problem: `unknown world anchor ${siteId}`,
        });
      }
    }

    if (definition.reward.salvage < 0) {
      problems.push({
        activityId: definition.id,
        problem: "reward cannot be negative",
      });
    }
  }

  return problems;
}

export function activityDefinition(id: ActivityId): ActivityDefinition {
  const found = ACTIVITY_DEFINITIONS.find((definition) => definition.id === id);
  if (!found) throw new Error(`Unknown activity definition: ${id}`);
  return found;
}

// -----------------------------------------------------------------------------
// Survey route rules
// -----------------------------------------------------------------------------

/** Diegetic minutes a survey contract allows before the light is gone. */
export const SURVEY_ROUTE_WINDOW_MINUTES = 240;

/** The sites a survey contract names, derived from the registry. */
export function surveyRouteTargets(): readonly WorldSiteId[] {
  return activityDefinition("survey-route").worldRefs;
}

export function createSurveyRouteState(): SurveyRouteState {
  return {
    id: "survey-route",
    status: "ready",
    startedAtMinutes: null,
    sighted: [],
    bestSightedCount: 0,
  };
}

export interface SurveyRouteEvaluation {
  state: SurveyRouteState;
  /** Sites newly sighted by this evaluation, for feedback and the run record. */
  newlySighted: readonly WorldSiteId[];
  completed: boolean;
  failed: boolean;
}

/**
 * Advance a survey contract from what the machine can currently see.
 *
 * Deliberately reads `visibleSignals` — present sight — rather than `discoveries`,
 * which records arrival. A surveyor is paid for line of sight, so a contract can be
 * completed from a ridge without the player ever entering the places named in it.
 * That is the mechanical difference between this binding and the haul binding, and
 * it is why the same valley plays as a different game.
 *
 * Pure: equal inputs give equal outputs, so it is replay-safe and testable without
 * a world.
 */
export function evaluateSurveyRoute(
  state: SurveyRouteState,
  targets: readonly WorldSiteId[],
  visibleSignals: ReadonlySet<WorldSiteId>,
  worldMinutes: number,
): SurveyRouteEvaluation {
  if (state.status !== "active" || state.startedAtMinutes === null) {
    return { state, newlySighted: [], completed: false, failed: false };
  }

  const newlySighted = targets.filter(
    (target) => visibleSignals.has(target) && !state.sighted.includes(target),
  );
  const sighted =
    newlySighted.length > 0
      ? [...state.sighted, ...newlySighted]
      : state.sighted;

  const complete = targets.every((target) => sighted.includes(target));
  // Completion is checked before expiry: sighting the last target on the closing
  // minute is a win, not a loss.
  const expired =
    !complete &&
    worldMinutes - state.startedAtMinutes >= SURVEY_ROUTE_WINDOW_MINUTES;

  return {
    state: {
      ...state,
      sighted,
      status: complete ? "complete" : expired ? "failed" : "active",
      bestSightedCount: Math.max(state.bestSightedCount, sighted.length),
    },
    newlySighted,
    completed: complete,
    failed: expired,
  };
}

/** Minutes left before the contract lapses; null when it is not running. */
export function surveyRouteMinutesRemaining(
  state: SurveyRouteState,
  worldMinutes: number,
): number | null {
  if (state.status !== "active" || state.startedAtMinutes === null) return null;
  return Math.max(
    0,
    SURVEY_ROUTE_WINDOW_MINUTES - (worldMinutes - state.startedAtMinutes),
  );
}

// -----------------------------------------------------------------------------
// Open-road rivalry rules
// -----------------------------------------------------------------------------

/** Course-entry radius. Crossing a gate is deliberately generous, not precise. */
export const ROAD_RIVALRY_GATE_RADIUS = 12;

/**
 * The first world reference is the voluntary start line. Every later reference
 * is a gate in order. The course uses sites and their existing track network;
 * it does not own terrain, colliders, or a second scene.
 */
export function roadRivalryCourseSiteIds(): readonly WorldSiteId[] {
  return activityDefinition("road-rivalry").worldRefs;
}

export function roadRivalryStartSiteId(): WorldSiteId {
  const [start] = roadRivalryCourseSiteIds();
  if (!start) throw new Error("Road rivalry requires an authored start site.");
  return start;
}

export function roadRivalryGateIds(): readonly WorldSiteId[] {
  return roadRivalryCourseSiteIds().slice(1);
}

function roadRivalrySite(id: WorldSiteId) {
  const site = WORLD_SITES.find((candidate) => candidate.id === id);
  if (!site) throw new Error(`Road rivalry references an unknown site: ${id}`);
  return site;
}

export function roadRivalryStartInReach(x: number, z: number): boolean {
  const start = roadRivalrySite(roadRivalryStartSiteId());
  return Math.hypot(x - start.x, z - start.z) <= ROAD_RIVALRY_GATE_RADIUS;
}

export function createRoadRivalryState(): RoadRivalryState {
  return {
    id: "road-rivalry",
    status: "ready",
    startedAtMs: null,
    activeRigId: null,
    nextGateIndex: 0,
    completedRuns: 0,
    bestTimeMsByRig: {},
    lastRun: null,
  };
}

export function startRoadRivalry(
  state: RoadRivalryState,
  rigId: RigId,
  startedAtMs: number,
): RoadRivalryState {
  if (state.status === "active") return state;
  return {
    ...state,
    status: "active",
    startedAtMs,
    activeRigId: rigId,
    nextGateIndex: 0,
  };
}

export function withdrawRoadRivalry(state: RoadRivalryState): RoadRivalryState {
  if (state.status !== "active") return state;
  return {
    ...state,
    status: "ready",
    startedAtMs: null,
    activeRigId: null,
    nextGateIndex: 0,
  };
}

export interface RoadRivalryEvaluation {
  state: RoadRivalryState;
  checkpoint: WorldSiteId | null;
  completed: RoadRivalryRunRecord | null;
  personalBest: boolean;
}

/**
 * Score the run from the authoritative machine position after physics. This is
 * intentionally a pure state transition: visual flags and UI prompts can
 * observe the result, but cannot declare a gate crossed.
 */
export function evaluateRoadRivalry(
  state: RoadRivalryState,
  rigId: RigId,
  x: number,
  z: number,
  elapsedMs: number,
): RoadRivalryEvaluation {
  if (
    state.status !== "active" ||
    state.activeRigId !== rigId ||
    state.startedAtMs === null
  ) {
    return { state, checkpoint: null, completed: null, personalBest: false };
  }

  const gates = roadRivalryGateIds();
  const gateId = gates[state.nextGateIndex];
  if (!gateId) {
    return { state, checkpoint: null, completed: null, personalBest: false };
  }
  const gate = roadRivalrySite(gateId);
  if (Math.hypot(x - gate.x, z - gate.z) > ROAD_RIVALRY_GATE_RADIUS) {
    return { state, checkpoint: null, completed: null, personalBest: false };
  }

  const nextGateIndex = state.nextGateIndex + 1;
  if (nextGateIndex < gates.length) {
    return {
      state: { ...state, nextGateIndex },
      checkpoint: gateId,
      completed: null,
      personalBest: false,
    };
  }

  const elapsed = Math.max(0, Math.round(elapsedMs - state.startedAtMs));
  const previousBest = state.bestTimeMsByRig[rigId];
  const personalBest = previousBest === undefined || elapsed < previousBest;
  const completed: RoadRivalryRunRecord = {
    rigId,
    elapsedMs: elapsed,
    completedAtMs: Math.round(elapsedMs),
  };
  return {
    state: {
      ...state,
      status: "ready",
      startedAtMs: null,
      activeRigId: null,
      nextGateIndex: 0,
      completedRuns: state.completedRuns + 1,
      bestTimeMsByRig: personalBest
        ? { ...state.bestTimeMsByRig, [rigId]: elapsed }
        : state.bestTimeMsByRig,
      lastRun: completed,
    },
    checkpoint: gateId,
    completed,
    personalBest,
  };
}
