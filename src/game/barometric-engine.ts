/**
 * High-Altitude Barometric Atmospheric Engine.
 *
 * Models elevation-dependent barometric pressure (kPa), air density reduction,
 * and engine horsepower derating at mountain summits like Launch Ridge.
 */

export interface AtmosphericState {
  altitudeMeters: number;
  pressureKpa: number; // 101.325 kPa at sea level
  airDensityKgM3: number; // 1.225 kg/m³ at sea level
  engineAirEfficiency: number; // 0..1 (1.0 = 100% sea level density)
}

export function computeBarometricAtmosphere(
  altitudeMeters: number,
  hasSnorkelOrTurboModule: boolean,
): AtmosphericState {
  const h = Math.max(0, altitudeMeters);
  // Barometric formula: P = 101.325 * exp(-h / 8400)
  const pressureKpa = 101.325 * Math.exp(-h / 8400);
  const airDensityKgM3 = 1.225 * (pressureKpa / 101.325);

  let engineAirEfficiency = airDensityKgM3 / 1.225;
  if (hasSnorkelOrTurboModule) {
    // Forced induction / ram-air intake recovers air density penalty
    engineAirEfficiency = Math.min(1.0, engineAirEfficiency * 1.22);
  }

  return {
    altitudeMeters: Number(h.toFixed(1)),
    pressureKpa: Number(pressureKpa.toFixed(2)),
    airDensityKgM3: Number(airDensityKgM3.toFixed(3)),
    engineAirEfficiency: Number(engineAirEfficiency.toFixed(3)),
  };
}

export function applyAltitudePowerDerate(
  basePower: number,
  airEfficiency: number,
): number {
  return Number((basePower * airEfficiency).toFixed(2));
}
