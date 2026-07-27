import { describe, expect, it } from "vitest";
import { evaluateSlopeStability } from "./landslide-hazard";

describe("hillside mud landslide & shear avalanche engine", () => {
  it("maintains slope stability (Fs > 1.0) on gentle slopes under dry soil conditions", () => {
    const stable = evaluateSlopeStability(12, 0.2);
    expect(stable.safetyFactorFs).toBeGreaterThan(1.0);
    expect(stable.landslideTriggered).toBe(false);
  });

  it("triggers mud avalanche shear failure (Fs < 1.0) on steep saturated slopes", () => {
    const failure = evaluateSlopeStability(38, 0.95);
    expect(failure.safetyFactorFs).toBeLessThan(1.0);
    expect(failure.landslideTriggered).toBe(true);
    expect(failure.displacedMudVolumeM3).toBeGreaterThan(15);
  });
});
