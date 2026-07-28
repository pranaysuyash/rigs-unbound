import { describe, expect, it } from "vitest";
import { RIG_PROFILES } from "./contracts";
import { computeChassisMassDistribution } from "./workshop-lab";

describe("workshop lab mass distribution engine", () => {
  it("computes baseline chassis mass without fitted modules", () => {
    const baseTractor = RIG_PROFILES["utility-tractor"];
    const dist = computeChassisMassDistribution(baseTractor, []);

    expect(dist.totalMassKg).toBe(baseTractor.mass * 1000);
    expect(dist.rolloverRisk).toBeLessThan(0.3);
  });

  it("increases total mass and top CG height when mounting a high survey mast", () => {
    const baseTractor = RIG_PROFILES["utility-tractor"];
    const bareDist = computeChassisMassDistribution(baseTractor, []);
    const mastDist = computeChassisMassDistribution(baseTractor, [
      "survey-mast",
    ]);

    expect(mastDist.totalMassKg).toBeGreaterThan(bareDist.totalMassKg);
    expect(mastDist.centerOfMassOffset.y).toBeGreaterThan(
      bareDist.centerOfMassOffset.y,
    );
    expect(mastDist.rolloverRisk).toBeGreaterThan(bareDist.rolloverRisk);
  });
});
