/**
 * Dynamic Surface Moisture & Mud Saturation Engine.
 *
 * Models localized cell-based soil water absorption, drainage rates,
 * and shear strength reduction (kPa) during heavy rain storms.
 */

export interface SurfaceMoistureCell {
  x: number;
  z: number;
  moistureRatio: number; // 0..1 (0 = dry, 1 = fully saturated mud)
  soilShearStrengthKpa: number; // 40 kPa (firm) down to 5 kPa (deep mud)
  drainageRate: number; // Moisture loss rate per hour
}

export function updateSurfaceMoistureCell(
  cell: SurfaceMoistureCell,
  rainIntensity: number, // 0..1
  deltaHours: number,
): SurfaceMoistureCell {
  const absorptionRate = rainIntensity * 0.45; // Moisture increase per hour during rain
  const netMoistureChange = (absorptionRate - cell.drainageRate) * deltaHours;

  const newMoisture = Math.max(0, Math.min(1.0, cell.moistureRatio + netMoistureChange));
  // Shear strength drops non-linearly with moisture saturation
  const shearStrengthKpa = Math.max(5.0, 40.0 * Math.pow(1 - newMoisture * 0.85, 1.5));

  return {
    ...cell,
    moistureRatio: Number(newMoisture.toFixed(3)),
    soilShearStrengthKpa: Number(shearStrengthKpa.toFixed(1)),
  };
}
