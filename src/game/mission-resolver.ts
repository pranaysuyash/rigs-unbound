/**
 * Mission reward and progression resolver.
 *
 * Rewards feed the canonical Journey/Mastery/Insight spine. Missions do not
 * create a second progression model and do not award a universal XP score.
 */

import { activityDefinition, type ActivityId } from "./activities";
import type { GameState } from "./contracts";
import type { MissionProposition } from "./mission-propositions";
import {
  addInsight,
  completeMilestone,
  recordJourneyDeed,
  recordMasteryEvent,
  type ProgressionState,
} from "./progression";

export interface MissionReward {
  insight: number;
  salvage: number;
  journeyInvestment: number;
  firstDiscovery: boolean;
}

/** Route canonical activity rewards into the three progression ladders. */
export function applyActivityCompletionProgression(
  progression: ProgressionState,
  activityId: ActivityId,
  rigId: string,
): ProgressionState {
  const activity = activityDefinition(activityId);
  let updated = addInsight(progression, activity.reward.insight);
  updated = recordJourneyDeed(
    updated,
    rigId,
    `activity:${activityId}`,
    activity.reward.journeyInvestment,
  );

  for (const capability of activity.requiredCapabilities) {
    updated = recordMasteryEvent(
      updated,
      rigId,
      capability,
      `${activityId}:${rigId}`,
    );
  }

  return updated;
}

export function computeMissionReward(
  mission: MissionProposition,
  distance: number,
  firstDiscovery: boolean,
  wasHard: boolean,
): MissionReward {
  const baseInsight = Math.max(1, Math.round(distance / 20));
  const difficultyMultiplier = wasHard ? 1.5 : 1;
  const discoveryBonus = firstDiscovery ? 2 : 0;
  const insight = Math.round(baseInsight * difficultyMultiplier + discoveryBonus);
  const journeyInvestment = Math.round(insight * 0.4);

  return {
    insight,
    salvage: mission.rewardSalvage,
    journeyInvestment,
    firstDiscovery,
  };
}

export function applyMissionRewards(
  state: GameState,
  progression: ProgressionState,
  mission: MissionProposition,
  distanceDriven: number,
  wasHard: boolean,
  activeRigId: string,
): { state: GameState; progression: ProgressionState; reward: MissionReward } {
  const firstDiscovery = !state.discoveries.some(
    (discovery) => discovery.id === mission.targetSiteId,
  );
  const reward = computeMissionReward(
    mission,
    distanceDriven,
    firstDiscovery,
    wasHard,
  );

  let updated = addInsight(progression, reward.insight);
  updated = recordJourneyDeed(
    updated,
    activeRigId,
    `mission:${mission.id}`,
    reward.journeyInvestment,
  );
  for (const capability of mission.requiredCapabilities) {
    updated = recordMasteryEvent(
      updated,
      activeRigId,
      capability,
      `${mission.binding}:${mission.targetSiteId}:${wasHard ? "hard" : "standard"}`,
    );
  }

  const nextState: GameState = {
    ...state,
    salvage: state.salvage + reward.salvage,
    salvageCollected: state.salvageCollected + reward.salvage,
  };

  return { state: nextState, progression: updated, reward };
}

export function computeFailurePenalty(_mission: MissionProposition): {
  salvageCost: number;
  diagnostic: string;
} {
  return {
    salvageCost: 0,
    diagnostic: "Mission failed. No salvage or progression awarded.",
  };
}

export interface RegisteredMilestone {
  id: string;
  insightThreshold: number;
  salvageBonus: number;
  message: string;
}

export const INSIGHT_MILESTONES: readonly RegisteredMilestone[] = [
  {
    id: "insight-5",
    insightThreshold: 5,
    salvageBonus: 5,
    message: "The field is beginning to make sense. New signals are resolving.",
  },
  {
    id: "insight-20",
    insightThreshold: 20,
    salvageBonus: 15,
    message: "Your field knowledge now supports longer expeditions.",
  },
  {
    id: "insight-50",
    insightThreshold: 50,
    salvageBonus: 30,
    message: "The map is becoming a working instrument, not just a record.",
  },
];

export function applyPendingMilestones(
  progression: ProgressionState,
  _currentSalvage: number,
): {
  progression: ProgressionState;
  salvageEarned: number;
  newMessages: readonly string[];
} {
  let updated = progression;
  let salvageEarned = 0;
  const newMessages: string[] = [];

  for (const milestone of INSIGHT_MILESTONES) {
    if (
      updated.insight >= milestone.insightThreshold &&
      !updated.completedMilestones.includes(milestone.id)
    ) {
      updated = completeMilestone(updated, milestone.id);
      salvageEarned += milestone.salvageBonus;
      newMessages.push(milestone.message);
    }
  }

  return { progression: updated, salvageEarned, newMessages };
}
