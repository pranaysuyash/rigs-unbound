import { describe, expect, it } from "vitest";
import { CAMPAIGN_CONTRACTS } from "./campaign";
import { deriveMissions, type MissionProposition } from "./mission-propositions";
import { acceptMission, completeMission } from "./mission-lifecycle";
import { createInitialState } from "./state";

describe("campaign contracts engine", () => {
  it("surfaces campaign missions through the unified proposition pipeline", () => {
    const state = createInitialState("CAMPAIGN-TEST");
    const missions = deriveMissions(state, state.progression, "clear", new Set());

    const campaignMissions = missions.filter(
      (m): m is MissionProposition & { missionClass: "main" } =>
        m.missionClass === "main",
    );
    expect(campaignMissions.length).toBeGreaterThan(0);

    const initialContract = campaignMissions.find(
      (m) => m.id === "contract-sunken-relay",
    );
    expect(initialContract).toBeDefined();
    expect(initialContract?.giverId).toBe("old-man");
    expect(initialContract?.requiredCapabilities).toContain("tow");
  });

  it("locks follow-up campaign contracts until the relay route is completed", () => {
    const state = createInitialState("CAMPAIGN-TEST");
    const missions = deriveMissions(state, state.progression, "clear", new Set());

    expect(
      missions.some((m) => m.id === "contract-sunken-relay"),
    ).toBe(true);
    expect(
      missions.some((m) => m.id === "contract-ridge-ascent"),
    ).toBe(false);
  });

  it("unlocks chained campaign contracts after the root contract completes", () => {
    const state = createInitialState("CAMPAIGN-TEST");
    const missions = deriveMissions(state, state.progression, "clear", new Set());
    const relay = missions.find((m) => m.id === "contract-sunken-relay")!;

    const accepted = acceptMission(
      state,
      relay,
      state.activeRigId,
      state.elapsedMs,
    );
    expect(accepted.ok).toBe(true);

    const completed = completeMission(
      state,
      relay.id,
      state.elapsedMs + 1000,
    );
    expect(completed.ok).toBe(true);

    const after = deriveMissions(state, state.progression, "clear", new Set());
    expect(
      after.some((m) => m.id === "contract-ridge-ascent"),
    ).toBe(true);
  });

  it("keeps authored campaign data in sync with proposition expectations", () => {
    expect(CAMPAIGN_CONTRACTS.some((c) => c.id === "contract-sunken-relay")).toBe(
      true,
    );
    expect(CAMPAIGN_CONTRACTS.some((c) => c.id === "contract-ridge-ascent")).toBe(
      true,
    );
  });
});
