import { describe, expect, it } from "vitest";
import {
  calculateErosionResistanceFactor,
  updateSoilEcosystem,
} from "./soil-ecosystem";

describe("dynamic soil ecosystem & vegetation engine", () => {
  it("regenerates vegetation over world time in moist soil", () => {
    const initialCell = {
      x: 0,
      z: 0,
      vegetationCoverage: 0.1,
      rootDensity: 0.1,
      soilHealth: 0.1,
    };
    const updated = updateSoilEcosystem(initialCell, 5, 0.8, 0);

    expect(updated.vegetationCoverage).toBeGreaterThan(0.1);
    expect(updated.rootDensity).toBeGreaterThan(0.1);
    expect(updated.soilHealth).toBeGreaterThan(0.1);
  });

  it("strips vegetation when heavy wheelspin damage is applied", () => {
    const lushCell = {
      x: 0,
      z: 0,
      vegetationCoverage: 0.9,
      rootDensity: 0.8,
      soilHealth: 0.85,
    };
    const damaged = updateSoilEcosystem(lushCell, 0.1, 0.5, 0.8);

    expect(damaged.vegetationCoverage).toBeLessThan(0.9);
    expect(damaged.rootDensity).toBeLessThan(0.8);
  });

  it("provides erosion resistance bonus when root density is high", () => {
    const bareResistance = calculateErosionResistanceFactor(0.0);
    const denseResistance = calculateErosionResistanceFactor(1.0);

    expect(bareResistance).toBe(1.0);
    expect(denseResistance).toBe(0.5); // 50% erosion reduction
  });
});
