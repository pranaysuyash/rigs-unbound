/**
 * Fuel Consumption & Range Efficiency Engine.
 *
 * Models fuel flow rates (L/min), load and RPM dependent burn,
 * fuel level depletion, and remaining driving range estimation (km).
 */

export interface FuelState {
  fuelTankCapacityLiters: number;
  currentFuelLiters: number;
  fuelBurnRateLitersPerMin: number;
  estimatedRangeKm: number;
  outOfFuel: boolean;
}

export function updateFuelConsumption(
  current: FuelState,
  engineRpm: number,
  engineLoad: number, // 0..1
  speedMps: number,
  deltaSeconds: number,
): FuelState {
  // Idle burn = 0.02 L/min, Max burn = 0.65 L/min at max RPM & load
  const rpmFactor = Math.max(0, engineRpm) / 3000;
  const burnRateLpm = 0.02 + 0.63 * rpmFactor * Math.max(0.1, engineLoad);
  const consumedLiters = burnRateLpm * (deltaSeconds / 60);

  const newFuelLiters = Math.max(0, current.currentFuelLiters - consumedLiters);
  const outOfFuel = newFuelLiters <= 0;

  // Range estimation based on current speed (m/s -> km/h) and burn rate (L/min -> L/h)
  const speedKmh = speedMps * 3.6;
  const burnRateLph = burnRateLpm * 60;
  const kmPerLiter = burnRateLph > 0 ? speedKmh / burnRateLph : 0;
  const estimatedRangeKm = outOfFuel ? 0 : Math.round(newFuelLiters * kmPerLiter);

  return {
    fuelTankCapacityLiters: current.fuelTankCapacityLiters,
    currentFuelLiters: Number(newFuelLiters.toFixed(2)),
    fuelBurnRateLitersPerMin: Number(burnRateLpm.toFixed(3)),
    estimatedRangeKm,
    outOfFuel,
  };
}
