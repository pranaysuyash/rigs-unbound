import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { deriveMissions } from "./mission-propositions";
import {
  createInitialProgressionState,
  addInsight,
} from "./progression";

describe("mission proposition derivation", () => {
  it("derives delivery propositions from discovered sites", () => {
    const state = createInitialState("MISSION-TEST");
    state.discoveries = [
      { id: "home-silo", discoveredAt: 1 },
      { id: "launch-ridge", discoveredAt: 2 },
    ];

    const missions = deriveMissions(
      state,
      createInitialProgressionState(),
      "clear",
      new Set(["home-silo", "launch-ridge"]),
    );

    const delivery = missions.find((mission) => mission.binding === "delivery");
    expect(delivery).toBeDefined();
    expect(delivery?.requiredCapabilities).toContain("tow");
    expect(delivery?.rewardSalvage).toBeGreaterThan(0);
  });

  it("keeps expedition propositions gated behind progression", () => {
    const state = createInitialState("MISSION-TEST");
    state.discoveries = [];
    const progression = addInsight(
      createInitialProgressionState(),
      8_000,
    );

    const missions = deriveMissions(
      state,
      progression,
      "clear",
      new Set(["sunken-flats", "launch-ridge", "toy-grove"]),
    );

    expect(missions.some((mission) => mission.binding === "expedition")).toBe(
      true,
    );
  });
});
