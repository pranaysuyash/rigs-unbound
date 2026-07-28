import { describe, expect, it } from "vitest";
import { generateExpeditionMission } from "./procedural-missions";

describe("procedural expedition mission generator", () => {
  it("generates deterministic missions for the same seed and weather", () => {
    const m1 = generateExpeditionMission("SEED-101", "home-farm", "clear");
    const m2 = generateExpeditionMission("SEED-101", "home-farm", "clear");

    expect(m1).toEqual(m2);
    expect(m1.rewardScrap).toBeGreaterThan(0);
  });

  it("escalates mission difficulty and reward scrap payout during storm weather", () => {
    const clearMission = generateExpeditionMission(
      "SEED-202",
      "home-farm",
      "clear",
    );
    const stormMission = generateExpeditionMission(
      "SEED-202",
      "home-farm",
      "storm",
    );

    expect(stormMission.difficultyRating).toBe("extreme");
    expect(stormMission.rewardScrap).toBeGreaterThan(clearMission.rewardScrap);
    expect(stormMission.type).toBe("flood-rescue");
  });
});
