import { describe, expect, it } from "vitest";
import {
  createInitialDefenseState,
  advanceDefenseWave,
} from "./top-down-defense-kernel";
import {
  createInitialTacticalState,
  applyDredgingProgress,
} from "./top-down-tactical-kernel";
import {
  createInitialStealthState,
  evaluateStealthDetection,
} from "./top-down-stealth-kernel";

describe("Top-Down Activity Gameplay Kernels", () => {
  describe("Horde Night Defense Kernel", () => {
    it("advances defense waves and calculates salvage rewards", () => {
      let state = createInitialDefenseState();
      state = { ...state, status: "active" };

      const advanced = advanceDefenseWave(state, 5);
      expect(advanced.threatsDefeated).toBe(10);
      expect(advanced.salvageEarned).toBe(7);
      expect(advanced.currentWaveIndex).toBe(1);
    });
  });

  describe("Quarry Tactical Logistics & Dredging Kernel", () => {
    it("applies dredging depth progress and completes channels", () => {
      let state = createInitialTacticalState();
      expect(state.status).toBe("ready");

      state = applyDredgingProgress(state, 10, 5, 2.5);
      expect(state.segments[0]?.complete).toBe(true);
      expect(state.totalDredgedMeters).toBe(2.5);
    });
  });

  describe("Sunken Flats Stealth Recon Kernel", () => {
    it("evaluates noise level and sentry detection cones", () => {
      const state = createInitialStealthState();
      const sentries = [
        {
          id: "tower-alpha",
          x: 0,
          z: 0,
          scanHeadingRad: 0,
          scanConeAngleRad: Math.PI / 2,
          scanRangeMeters: 20,
        },
      ];

      // Safe state out of range
      const safeEval = evaluateStealthDetection(state, 50, 50, 5, sentries);
      expect(safeEval.status).toBe("active");
      expect(safeEval.detectedBySentry).toBeNull();

      // Detected state inside cone with high noise
      const detectedEval = evaluateStealthDetection(state, 10, 0, 10, sentries);
      expect(detectedEval.status).toBe("detected");
      expect(detectedEval.detectedBySentry).toBe("tower-alpha");
    });
  });
});
