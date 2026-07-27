/**
 * Tire Pressure & Contact Patch Inflation Engine.
 *
 * Computes contact patch area expansion, ground pressure distribution (kPa),
 * mud floatation capability, and rolling resistance derived from tire air pressure (PSI).
 */

export interface TirePressureState {
  pressurePsi: number; // 10..45 PSI (10 = aired down for mud, 35 = highway pressure)
  contactPatchAreaM2: number;
  groundPressureKpa: number;
  mudFloatationFactor: number; // 0..1 (1 = max floatation)
  rollingResistanceCoeff: number;
}

export function calculateTirePressureState(
  pressurePsi: number,
  wheelLoadKg: number,
): TirePressureState {
  const clampedPsi = Math.min(45, Math.max(10, pressurePsi));
  // Baseline patch at 30 PSI = 0.08 m² per tire
  const patchAreaM2 = 0.08 * (30 / clampedPsi);
  const weightN = wheelLoadKg * 9.81;
  const groundPressureKpa = weightN / patchAreaM2 / 1000;

  // Floatation factor improves as pressure drops (larger patch spreads load)
  const floatation = Math.min(1.0, Math.max(0.1, (35 - clampedPsi) / 25));
  // Rolling resistance increases at low PSI on hard ground due to carcass flex
  const rollingResistance = 0.015 * (1 + (30 - clampedPsi) * 0.025);

  return {
    pressurePsi: Number(clampedPsi.toFixed(1)),
    contactPatchAreaM2: Number(patchAreaM2.toFixed(3)),
    groundPressureKpa: Number(groundPressureKpa.toFixed(1)),
    mudFloatationFactor: Number(floatation.toFixed(3)),
    rollingResistanceCoeff: Number(rollingResistance.toFixed(4)),
  };
}

export function adjustTirePressure(currentPsi: number, deltaPsi: number): number {
  return Number(Math.min(45, Math.max(10, currentPsi + deltaPsi)).toFixed(1));
}
