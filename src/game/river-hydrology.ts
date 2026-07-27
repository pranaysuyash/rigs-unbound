/**
 * Dynamic River Hydrology & Water Drag Engine.
 *
 * Models hydrodynamic current drag vectors, Archimedes chassis buoyancy,
 * river flow velocity, and engine hydro-lock drowning depth.
 */

export interface RiverHydroState {
  waterDepthM: number;
  currentVelocityMps: number;
  submergedVolumeM3: number;
  buoyancyForceN: number;
  currentDragForceN: number;
  engineHydroLocked: boolean;
  effectiveGripRatio: number;
}

export function calculateRiverHydroState(
  waterDepthM: number,
  vehicleVelocityMps: number,
  currentVelocityMps: number,
  chassisMassKg = 4500,
  hasSnorkelModule = false,
  intakeHeightM = 1.4,
): RiverHydroState {
  const depth = Math.max(0, waterDepthM);
  const submergedVolumeM3 = Math.min(4.5, depth * 2.2); // Contact volume submerged
  const densityWater = 1000; // kg/m³
  const g = 9.81;

  // Archimedes Buoyancy Force
  const buoyancyForceN = submergedVolumeM3 * densityWater * g;
  const netWeightN = chassisMassKg * g - buoyancyForceN;

  // Loss of ground pressure reduces tire grip ratio
  const weightRatio = Math.max(0.05, netWeightN / (chassisMassKg * g));
  const effectiveGripRatio = Number(Math.min(1.0, weightRatio).toFixed(2));

  // Hydrodynamic Drag Force (F = 0.5 * rho * v^2 * Cd * A)
  const relativeVelocity = Math.abs(currentVelocityMps - vehicleVelocityMps);
  const frontalArea = Math.min(3.5, depth * 1.8);
  const cd = 0.9; // Drag coefficient of truck chassis
  const currentDragForceN = Number((0.5 * densityWater * Math.pow(relativeVelocity, 2) * cd * frontalArea).toFixed(1));

  // Engine Hydro-Lock Risk (water depth > intake height without snorkel)
  const engineHydroLocked = depth > intakeHeightM && !hasSnorkelModule;

  return {
    waterDepthM: Number(depth.toFixed(2)),
    currentVelocityMps: Number(currentVelocityMps.toFixed(1)),
    submergedVolumeM3: Number(submergedVolumeM3.toFixed(2)),
    buoyancyForceN: Number(buoyancyForceN.toFixed(1)),
    currentDragForceN,
    engineHydroLocked,
    effectiveGripRatio,
  };
}
