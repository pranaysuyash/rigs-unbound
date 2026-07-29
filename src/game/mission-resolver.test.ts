import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import {
  applyActivityCompletionProgression,
  applyMissionRewards,
} from "./mission-resolver";
import { createInitialProgressionState } from "./progression";
import type { MissionProposition } from "./mission-propositions";

describe("mission reward resolver", () => {
  it("routes canonical activity rewards into account and rig progression", () => {
    const progression = applyActivityCompletionProgression(
      createInitialProgressionState(["marsh-skimmer"]),
      "survey-route",
      "marsh-skimmer",
    );

    // survey-route awards insight and journey investment
    expect(progression.insight).toBe(5);
    expect(progression.journeys["marsh-skimmer"]?.investment).toBe(4);
    expect(progression.mastery["marsh-skimmer"]?.["survey"]?.points).toBe(10);
  });

  it("applies salvage and per-rig restoration xp on mission completion", () => {
    const state = createInitialState("REWARD-TEST");
    const progression = createInitialProgressionState(["utility-tractor"]);

    const mission: MissionProposition = {
      id: "delivery-home-launch",
      binding: "delivery",
      missionClass: "local",
      giverId: null,
      prerequisites: [],
      title: "Home to Launch",
      premise: "Move cargo up the ridge.",
      briefing: "A hard haul.",
      origin: "Home Silo",
      destination: "Launch Ridge",
      targetSiteId: "launch-ridge",
      waypointIds: ["home-silo", "launch-ridge"],
      minInsight: 0,
      requiredCapabilities: ["tow"],
      rewardSalvage: 12,
      difficultyLabel: "hard",
      state: "active",
    };

    const result = applyMissionRewards(
      state,
      progression,
      mission,
      50,
      true,
      "utility-tractor",
    );

    expect(result.state.salvage).toBe(12);
    expect(result.state.salvageCollected).toBe(12);
    expect(result.progression.insight).toBeGreaterThan(0);
    expect(
      result.progression.journeys["utility-tractor"]?.investment,
    ).toBeGreaterThan(0);
    expect(result.reward.salvage).toBe(12);
    expect(result.reward.insight).toBeGreaterThan(0);
  });
});
