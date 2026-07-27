import { describe, expect, it } from "vitest";
import { applyAltitudePowerDerate, computeBarometricAtmosphere } from "./barometric-engine";

describe("high-altitude barometric atmospheric engine", () => {
  it("reduces barometric pressure and air density at high elevation", () => {
    const seaLevel = computeBarometricAtmosphere(0, false);
    const mountainSummit = computeBarometricAtmosphere(120, false);

    expect(mountainSummit.pressureKpa).toBeLessThan(seaLevel.pressureKpa);
    expect(mountainSummit.airDensityKgM3).toBeLessThan(seaLevel.airDensityKgM3);
    expect(mountainSummit.engineAirEfficiency).toBeLessThan(1.0);
  });

  it("recovers engine air intake efficiency when forced induction module is fitted", () => {
    const naturallyAspirated = computeBarometricAtmosphere(150, false);
    const turboCharged = computeBarometricAtmosphere(150, true);

    expect(turboCharged.engineAirEfficiency).toBeGreaterThan(naturallyAspirated.engineAirEfficiency);

    const basePower = 100;
    const deratedPower = applyAltitudePowerDerate(basePower, naturallyAspirated.engineAirEfficiency);
    const recoveredPower = applyAltitudePowerDerate(basePower, turboCharged.engineAirEfficiency);

    expect(recoveredPower).toBeGreaterThan(deratedPower);
  });
});
