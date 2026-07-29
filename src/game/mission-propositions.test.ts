import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { acceptMission, completeMission } from "./mission-lifecycle";
import { deriveMissions } from "./mission-propositions";
import { createInitialProgressionState, addInsight } from "./progression";

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

  it("derives the campaign root contract as a main-class quest with a giver", () => {
    const state = createInitialState("MISSION-TEST");

    const missions = deriveMissions(
      state,
      createInitialProgressionState(),
      "clear",
      new Set(),
    );

    const relay = missions.find((m) => m.id === "contract-sunken-relay");
    expect(relay).toBeDefined();
    expect(relay?.missionClass).toBe("main");
    expect(relay?.giverId).toBe("old-man");
    expect(relay?.requiredCapabilities).toContain("tow");

    // Chained contracts stay hidden until the relay deed exists, and the
    // dormant marsh contract stays inert until its site is authored.
    expect(missions.some((m) => m.id === "contract-ridge-ascent")).toBe(false);
    expect(missions.some((m) => m.id === "contract-marsh-ford")).toBe(false);
  });

  it("unlocks chained campaign contracts through the completion deed", () => {
    const state = createInitialState("MISSION-TEST");
    const derived = deriveMissions(
      state,
      createInitialProgressionState(),
      "clear",
      new Set(),
    );
    const relay = derived.find((m) => m.id === "contract-sunken-relay");
    expect(relay).toBeDefined();

    const accepted = acceptMission(state, relay!, "utility-tractor", 500);
    expect(accepted.ok).toBe(true);
    const completed = completeMission(state, relay!.id, 90_000);
    expect(completed.ok).toBe(true);

    const after = deriveMissions(
      state,
      state.progression,
      "clear",
      new Set(),
    );
    expect(after.some((m) => m.id === "contract-sunken-relay")).toBe(false);
    const ridge = after.find((m) => m.id === "contract-ridge-ascent");
    expect(ridge).toBeDefined();
    expect(ridge?.missionClass).toBe("main");
    expect(ridge?.prerequisites).toEqual([
      { kind: "mission-completed", missionId: "contract-sunken-relay" },
    ]);
  });

  it("keeps expedition propositions gated behind progression", () => {
    const state = createInitialState("MISSION-TEST");
    state.discoveries = [];
    const progression = addInsight(createInitialProgressionState(), 8_000);

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
