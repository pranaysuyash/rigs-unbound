import { describe, expect, it } from "vitest";
import { RIG_PROFILES } from "./contracts";
import { blockoutFor } from "./rig-blockout";
import { RIG_IDS } from "./rig-ids";

describe("Candidate Rigs Blockout & Profile Integration", () => {
  it("defines physical profiles for all 16 vehicle families", () => {
    expect(RIG_IDS.length).toBe(16);
    for (const id of RIG_IDS) {
      const profile = RIG_PROFILES[id];
      expect(profile).toBeDefined();
      expect(profile.id).toBe(id);
      expect(profile.wheelbase).toBeGreaterThan(0);
      expect(profile.track).toBeGreaterThan(0);
      expect(profile.mass).toBeGreaterThan(0);
      expect(profile.enginePower).toBeGreaterThan(0);
      expect(profile.rideHeight).toBeGreaterThan(0);
    }
  });

  it("derives valid 3D blockout geometry for all 16 vehicle families", () => {
    for (const id of RIG_IDS) {
      const blockout = blockoutFor(id);
      expect(blockout).toBeDefined();
      expect(blockout.hull.width).toBeGreaterThan(0);
      expect(blockout.hull.height).toBeGreaterThan(0);
      expect(blockout.hull.depth).toBeGreaterThan(0);
      expect(isFinite(blockout.groundFrameOffsetY)).toBe(true);
      expect(blockout.superstructure.length).toBeGreaterThan(0);

      if (blockout.profile.mobilityAdapter !== "hover") {
        expect(blockout.wheelMounts.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
