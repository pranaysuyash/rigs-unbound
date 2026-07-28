import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import {
  acceptMission,
  completeMission,
  type MissionRuntimeState,
} from "./mission-lifecycle";
import type { MissionProposition } from "./mission-propositions";

const mission: MissionProposition = {
  id: "delivery-home-long-furrow",
  binding: "delivery",
  title: "Home → Long Furrow",
  premise: "Transport supplies.",
  briefing: "A delivery under pressure.",
  origin: "Home",
  destination: "Long Furrow",
  targetSiteId: "long-furrow",
  waypointIds: ["home", "long-furrow"],
  minInsight: 0,
  requiredCapabilities: ["tow"],
  rewardSalvage: 5,
  difficultyLabel: "standard",
  state: "available",
};

describe("mission lifecycle authority", () => {
  it("accepts one derived proposition into the persisted runtime contract", () => {
    const state = createInitialState();
    const result = acceptMission(state, mission, "utility-tractor", 1200);

    expect(result.ok).toBe(true);
    expect(result.state.activeMission).toEqual<MissionRuntimeState>({
      id: mission.id,
      binding: mission.binding,
      targetSiteId: mission.targetSiteId,
      waypointIds: mission.waypointIds,
      requiredCapabilities: mission.requiredCapabilities,
      rewardSalvage: mission.rewardSalvage,
      difficultyLabel: mission.difficultyLabel,
      activeRigId: "utility-tractor",
      acceptedAtMs: 1200,
      progressIndex: 0,
    });
  });

  it("rejects a second mission and makes completion idempotent", () => {
    const state = createInitialState();
    const accepted = acceptMission(state, mission, "utility-tractor", 1200);
    expect(accepted.ok).toBe(true);

    const second = acceptMission(
      accepted.state,
      { ...mission, id: "other" },
      "utility-tractor",
      1300,
    );
    expect(second.ok).toBe(false);

    const completed = completeMission(accepted.state, mission.id, 2400);
    expect(completed.ok).toBe(true);
    expect(completed.state.activeMission).toBeNull();
    expect(completed.state.progression.journeys["utility-tractor"]?.completedDeeds).toContain(
      `mission:${mission.id}`,
    );

    const repeated = completeMission(completed.state, mission.id, 2500);
    expect(repeated.ok).toBe(false);
    expect(repeated.state.salvage).toBe(completed.state.salvage);
  });
});
