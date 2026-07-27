import { describe, expect, it } from "vitest";
import { calculateRiverHydroState } from "./river-hydrology";

describe("dynamic river hydrology & water drag engine", () => {
  it("calculates buoyancy force and grip reduction in deep water crossings", () => {
    const hydro = calculateRiverHydroState(1.2, 2.0, 3.5, 4500, false, 1.4);
    expect(hydro.buoyancyForceN).toBeGreaterThan(15000);
    expect(hydro.effectiveGripRatio).toBeLessThan(1.0);
    expect(hydro.currentDragForceN).toBeGreaterThan(100);
    expect(hydro.engineHydroLocked).toBe(false);
  });

  it("hydro-locks engine when water depth exceeds intake height without a snorkel module", () => {
    const drowned = calculateRiverHydroState(1.8, 0, 2.0, 4500, false, 1.4);
    expect(drowned.engineHydroLocked).toBe(true);

    const savedBySnorkel = calculateRiverHydroState(1.8, 0, 2.0, 4500, true, 1.4);
    expect(savedBySnorkel.engineHydroLocked).toBe(false);
  });
});
