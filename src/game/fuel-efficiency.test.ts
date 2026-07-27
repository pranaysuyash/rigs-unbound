import { describe, expect, it } from "vitest";
import { FuelState, updateFuelConsumption } from "./fuel-efficiency";

describe("fuel consumption & range efficiency engine", () => {
  it("burns fuel faster under high RPM and heavy engine load", () => {
    const initial: FuelState = {
      fuelTankCapacityLiters: 80,
      currentFuelLiters: 80,
      fuelBurnRateLitersPerMin: 0.02,
      estimatedRangeKm: 300,
      outOfFuel: false,
    };

    const cruising = updateFuelConsumption(initial, 1500, 0.3, 10, 60);
    const heavyPull = updateFuelConsumption(initial, 3000, 1.0, 4, 60);

    expect(heavyPull.fuelBurnRateLitersPerMin).toBeGreaterThan(cruising.fuelBurnRateLitersPerMin);
    expect(heavyPull.currentFuelLiters).toBeLessThan(cruising.currentFuelLiters);
  });

  it("flags outOfFuel when tank depletes to 0", () => {
    const emptyState: FuelState = {
      fuelTankCapacityLiters: 80,
      currentFuelLiters: 0.01,
      fuelBurnRateLitersPerMin: 0.5,
      estimatedRangeKm: 1,
      outOfFuel: false,
    };

    const depleted = updateFuelConsumption(emptyState, 2000, 0.8, 5, 10);
    expect(depleted.outOfFuel).toBe(true);
    expect(depleted.currentFuelLiters).toBe(0);
    expect(depleted.estimatedRangeKm).toBe(0);
  });
});
