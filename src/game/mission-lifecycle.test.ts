import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { recoverState } from "./state";
import {
  acceptMission,
  completeMission,
  type MissionRuntimeState,
} from "./mission-lifecycle";
import type { MissionProposition } from "./mission-propositions";

const mission: MissionProposition = {
  id: "delivery-home-long-furrow",
  binding: "delivery",
  missionClass: "main",
  giverId: "old-man",
  prerequisites: [],
  title: "Home → Long Furrow",
  premise: "Transport supplies.",
  briefing: "A delivery under pressure.",
  origin: "Home",
  destination: "Long Furrow",
  targetSiteId: "long-furrow",
  waypointIds: ["home-silo", "long-furrow"],
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
      missionClass: mission.missionClass,
      giverId: mission.giverId,
      targetSiteId: mission.targetSiteId,
      waypointIds: mission.waypointIds,
      requiredCapabilities: mission.requiredCapabilities,
      rewardSalvage: mission.rewardSalvage,
      difficultyLabel: mission.difficultyLabel,
      settlementOutcomeId: null,
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
    expect(
      completed.state.progression.journeys["utility-tractor"]?.completedDeeds,
    ).toContain(`mission:${mission.id}`);

    const repeated = completeMission(completed.state, mission.id, 2500);
    expect(repeated.ok).toBe(false);
    expect(repeated.state.salvage).toBe(completed.state.salvage);
  });

  it("persists and recovers the active contract through the save-shaped state", () => {
    const state = createInitialState();
    const accepted = acceptMission(state, mission, "utility-tractor", 1200);
    expect(accepted.ok).toBe(true);

    const recovered = recoverState(JSON.parse(JSON.stringify(state)));
    expect(recovered?.activeMission).toEqual(state.activeMission);
  });
});

describe("per-class mission concurrency", () => {
  const sideMission = (id: string): MissionProposition => ({
    ...mission,
    id,
    missionClass: "side",
    giverId: null,
  });

  it("runs a side mission alongside the active main mission", () => {
    const state = createInitialState();
    expect(acceptMission(state, mission, "utility-tractor", 1000).ok).toBe(
      true,
    );

    const side = acceptMission(
      state,
      sideMission("side-1"),
      "utility-tractor",
      1100,
    );
    expect(side.ok).toBe(true);
    expect(state.activeMission?.id).toBe(mission.id);
    expect(state.activeSideMissions.map((m) => m.id)).toEqual(["side-1"]);
  });

  it("rejects a second main-class mission while one is in the focus slot", () => {
    const state = createInitialState();
    expect(acceptMission(state, mission, "utility-tractor", 1000).ok).toBe(
      true,
    );

    const secondMain = acceptMission(
      state,
      { ...mission, id: "main-2" },
      "utility-tractor",
      1100,
    );
    expect(secondMain.ok).toBe(false);
    if (!secondMain.ok) {
      expect(secondMain.reason).toBe("mission-already-active");
    }
  });

  it("bounds concurrent side missions at the named limit", () => {
    const state = createInitialState();
    expect(acceptMission(state, mission, "utility-tractor", 1000).ok).toBe(
      true,
    );
    for (let i = 1; i <= 3; i++) {
      expect(
        acceptMission(
          state,
          sideMission(`side-${i}`),
          "utility-tractor",
          1000 + i,
        ).ok,
      ).toBe(true);
    }

    const overflow = acceptMission(
      state,
      sideMission("side-4"),
      "utility-tractor",
      2000,
    );
    expect(overflow.ok).toBe(false);
    if (!overflow.ok) expect(overflow.reason).toBe("side-mission-limit");
  });

  it("completes a side mission without disturbing the focus mission", () => {
    const state = createInitialState();
    expect(acceptMission(state, mission, "utility-tractor", 1000).ok).toBe(
      true,
    );
    expect(
      acceptMission(state, sideMission("side-1"), "utility-tractor", 1100).ok,
    ).toBe(true);

    const completed = completeMission(state, "side-1", 2200);
    expect(completed.ok).toBe(true);
    expect(state.activeSideMissions).toHaveLength(0);
    expect(state.activeMission?.id).toBe(mission.id);
    expect(
      state.progression.journeys["utility-tractor"]?.completedDeeds,
    ).toContain("mission:side-1");
  });

  it("persists and recovers concurrent side missions through the save shape", () => {
    const state = createInitialState();
    expect(acceptMission(state, mission, "utility-tractor", 1000).ok).toBe(
      true,
    );
    expect(
      acceptMission(state, sideMission("side-1"), "utility-tractor", 1100).ok,
    ).toBe(true);

    const recovered = recoverState(JSON.parse(JSON.stringify(state)));
    expect(recovered?.activeSideMissions).toEqual(state.activeSideMissions);
  });

  it("recovers a pre-v11 record without side missions as an empty list", () => {
    const state = createInitialState();
    const payload = JSON.parse(JSON.stringify(state)) as Record<
      string,
      unknown
    >;
    payload.schemaVersion = 10;
    delete payload.activeSideMissions;

    const recovered = recoverState(payload);
    expect(recovered).not.toBeNull();
    expect(recovered?.activeSideMissions).toEqual([]);
  });

  it("accepts a side mission into the side slot even when no main is active", () => {
    const state = createInitialState();
    const side = acceptMission(
      state,
      sideMission("side-standalone"),
      "utility-tractor",
      1000,
    );
    expect(side.ok).toBe(true);
    expect(state.activeMission).toBeNull();
    expect(state.activeSideMissions.map((m) => m.id)).toEqual([
      "side-standalone",
    ]);
  });
});
