import {
  RIG_CAPABILITIES,
  type RigCapability,
  type SurveyRouteState,
} from "./contracts";
import { WORLD_SITES, type WorldSiteId } from "./world";

export type { SurveyRouteState };

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

export type ActivityId = "cargo-relay" | "survey-route";

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
export type ActivityBinding = "haul" | "survey";

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
  reward: { salvage: number };
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
    reward: { salvage: 3 },
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
    reward: { salvage: 5 },
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

    if (definition.reward.salvage <= 0) {
      problems.push({
        activityId: definition.id,
        problem: "reward must be positive",
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
