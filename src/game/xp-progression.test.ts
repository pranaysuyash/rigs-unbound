import { describe, expect, it } from "vitest";
import {
  applyXpReward,
  createInitialXpProgressionState,
  levelFromXp,
  snapshotXpProgression,
  xpForLevel,
} from "./xp-progression";

describe("optional XP progression policy", () => {
  it("keeps level and rung derived from the account XP ledger", () => {
    const state = createInitialXpProgressionState("time-trial", "rules-1");
    const result = applyXpReward(state, {
      eventId: "run:001",
      sourceId: "cargo-relay",
      modeId: "time-trial",
      accountXp: 500,
      rigId: "utility-tractor",
      restorationXp: 120,
    });

    expect(result.status).toBe("applied");
    const snapshot = snapshotXpProgression(result.state);
    expect(snapshot.level).toBe(levelFromXp(500));
    expect(snapshot.rung.rung).toBe(2);
    expect(snapshot.perRigRestorationXp["utility-tractor"]).toBe(120);
    expect(result.state.rulesetVersion).toBe("rules-1");
  });

  it("does not double-award a retried event", () => {
    const state = createInitialXpProgressionState("arcade");
    const event = {
      eventId: "run:retry-safe",
      sourceId: "storm-relay",
      modeId: "arcade",
      accountXp: 100,
    };

    const first = applyXpReward(state, event);
    const second = applyXpReward(first.state, event);

    expect(first.status).toBe("applied");
    expect(second.status).toBe("duplicate");
    expect(second.state.accountXp).toBe(100);
    expect(second.state.awardedEventIds).toEqual(["run:retry-safe"]);
  });

  it("rejects cross-mode rewards without mutating the ledger", () => {
    const state = createInitialXpProgressionState("season-1");
    const result = applyXpReward(state, {
      eventId: "campaign:001",
      sourceId: "cargo-relay",
      modeId: "campaign",
      accountXp: 999,
    });

    expect(result.status).toBe("mode-mismatch");
    expect(result.state).toEqual(state);
  });

  it("preserves the historical level curve as a policy utility", () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(10)).toBe(3162);
    expect(levelFromXp(xpForLevel(10))).toBe(10);
  });
});
