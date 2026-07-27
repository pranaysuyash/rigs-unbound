import { describe, expect, it } from "vitest";
import { calculateFogVisibility, deriveThermalSignature } from "./thermal-camera";

describe("atmospheric fog & infrared thermal camera system", () => {
  it("calculates optical fog extinction and thermal view distance penetration", () => {
    const optical = calculateFogVisibility(0.8, 50, false);
    const thermal = calculateFogVisibility(0.8, 50, true);

    expect(optical.attenuationPercent).toBeGreaterThan(50);
    expect(thermal.viewDistanceM).toBeGreaterThan(optical.viewDistanceM);
  });

  it("derives thermal signature palette colors based on target temperature", () => {
    const cold = deriveThermalSignature("chassis", 15.0);
    const engineHot = deriveThermalSignature("engine-block", 98.0);

    expect(cold.thermalPaletteHex).toBe("#000033");
    expect(engineHot.normalizedHeatRatio).toBeGreaterThan(0.8);
    expect(engineHot.thermalPaletteHex).toBe("#ffffff");
  });
});
