/**
 * Canonical progression kernel.
 *
 * Progression is capability-shaped, not a universal level ladder:
 *   - Rig Journey records the history of a specific machine.
 *   - Verb Mastery records situation-weighted skill for a capability.
 *   - Insight records profile-level knowledge and content access.
 *
 * All state transitions are pure and serializable. Presentation derives names,
 * ranks, and slot allowances from this state; it does not own progression.
 */

import type { RigCapability } from "./contracts";

export const JOURNEY_PHASES = [
  "found",
  "stabilized",
  "working",
  "specialized",
  "hybridized",
  "storied",
] as const;
export type JourneyPhase = (typeof JOURNEY_PHASES)[number];

export interface JourneyPhaseDefinition {
  phase: JourneyPhase;
  index: number;
  requiredInvestment: number;
  requiredDeeds: number;
}

export const JOURNEY_PHASE_DEFINITIONS: readonly JourneyPhaseDefinition[] = [
  { phase: "found", index: 0, requiredInvestment: 0, requiredDeeds: 0 },
  { phase: "stabilized", index: 1, requiredInvestment: 50, requiredDeeds: 1 },
  { phase: "working", index: 2, requiredInvestment: 150, requiredDeeds: 2 },
  { phase: "specialized", index: 3, requiredInvestment: 350, requiredDeeds: 4 },
  { phase: "hybridized", index: 4, requiredInvestment: 700, requiredDeeds: 7 },
  { phase: "storied", index: 5, requiredInvestment: 1200, requiredDeeds: 12 },
];

export const MASTERY_RANKS = [
  "novice",
  "practiced",
  "seasoned",
  "master",
] as const;
export type MasteryRank = (typeof MASTERY_RANKS)[number];

export interface MasteryState {
  rank: MasteryRank;
  points: number;
  /** Situation hashes and their repetition counts. */
  situations: Record<string, number>;
}

export interface RigJourneyState {
  phase: JourneyPhase;
  investment: number;
  completedDeeds: readonly string[];
}

/** Durable progression state. No universal XP or player level exists here. */
export interface ProgressionState {
  journeys: Record<string, RigJourneyState>;
  mastery: Record<string, Partial<Record<RigCapability, MasteryState>>>;
  insight: number;
  completedMilestones: readonly string[];
}

export function createInitialProgressionState(
  rigIds: readonly string[] = [],
): ProgressionState {
  return {
    journeys: Object.fromEntries(
      rigIds.map((rigId) => [rigId, defaultJourney()]),
    ),
    mastery: {},
    insight: 0,
    completedMilestones: [],
  };
}

function defaultJourney(): RigJourneyState {
  return { phase: "found", investment: 0, completedDeeds: [] };
}

function defaultMastery(): MasteryState {
  return { rank: "novice", points: 0, situations: {} };
}

export function journeyForRig(
  state: ProgressionState,
  rigId: string,
): RigJourneyState {
  return state.journeys[rigId] ?? defaultJourney();
}

export function masteryForVerb(
  state: ProgressionState,
  rigId: string,
  capability: RigCapability,
): MasteryState {
  return state.mastery[rigId]?.[capability] ?? defaultMastery();
}

export function journeyPhaseFor(
  investment: number,
  deedCount: number,
): JourneyPhaseDefinition {
  let best = JOURNEY_PHASE_DEFINITIONS[0]!;
  for (const definition of JOURNEY_PHASE_DEFINITIONS) {
    if (
      investment >= definition.requiredInvestment &&
      deedCount >= definition.requiredDeeds
    ) {
      best = definition;
    }
  }
  return best;
}

export function masteryRankForPoints(points: number): MasteryRank {
  if (points >= 300) return "master";
  if (points >= 120) return "seasoned";
  if (points >= 40) return "practiced";
  return "novice";
}

/** Record restoration investment and a demonstrated deed for one rig. */
export function recordJourneyDeed(
  state: ProgressionState,
  rigId: string,
  deedId: string,
  investment = 0,
): ProgressionState {
  const current = journeyForRig(state, rigId);
  const deeds = current.completedDeeds.includes(deedId)
    ? [...current.completedDeeds]
    : [...current.completedDeeds, deedId];
  const nextInvestment = Math.max(0, current.investment + investment);
  const phase = journeyPhaseFor(nextInvestment, deeds.length).phase;

  return {
    ...state,
    journeys: {
      ...state.journeys,
      [rigId]: {
        phase,
        investment: nextInvestment,
        completedDeeds: deeds,
      },
    },
  };
}

/**
 * Record capability use with situation-weighted diminishing returns.
 *
 * The first occurrence of a situation is worth 10 points. Repeating the same
 * situation earns less, while a new terrain/load/phase/outcome combination
 * retains full value.
 */
export function recordMasteryEvent(
  state: ProgressionState,
  rigId: string,
  capability: RigCapability,
  situationHash: string,
): ProgressionState {
  const current = masteryForVerb(state, rigId, capability);
  const repetitions = current.situations[situationHash] ?? 0;
  const gain =
    repetitions === 0 ? 10 : Math.max(1, Math.floor(10 / (repetitions + 1)));
  const points = current.points + gain;
  const next: MasteryState = {
    rank: masteryRankForPoints(points),
    points,
    situations: {
      ...current.situations,
      [situationHash]: repetitions + 1,
    },
  };

  return {
    ...state,
    mastery: {
      ...state.mastery,
      [rigId]: {
        ...(state.mastery[rigId] ?? {}),
        [capability]: next,
      },
    },
  };
}

export function addInsight(
  state: ProgressionState,
  amount: number,
): ProgressionState {
  if (amount <= 0) return state;
  return { ...state, insight: state.insight + amount };
}

export function completeMilestone(
  state: ProgressionState,
  milestoneId: string,
): ProgressionState {
  if (state.completedMilestones.includes(milestoneId)) return state;
  return {
    ...state,
    completedMilestones: [...state.completedMilestones, milestoneId],
  };
}

export function moduleSlotsForJourney(phase: JourneyPhase): number {
  const index = JOURNEY_PHASE_DEFINITIONS.find((item) => item.phase === phase)?.index ?? 0;
  return Math.min(5, 1 + index);
}
