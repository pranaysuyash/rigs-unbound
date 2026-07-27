/**
 * Hillside Mud Landslide & Shear Avalanche Engine.
 *
 * Models infinite slope geotechnical stability factor (Fs), shear failure limits under heavy rain,
 * and mud avalanche displacement down steep mountain passes.
 */

export interface LandslideSlopeState {
  slopeAngleDeg: number;
  soilCohesionKpa: number;
  soilMoistureRatio: number;
  safetyFactorFs: number; // Fs < 1.0 triggers shear failure mudslide
  landslideTriggered: boolean;
  displacedMudVolumeM3: number;
}

export function evaluateSlopeStability(
  slopeAngleDeg: number,
  soilMoistureRatio: number,
  soilCohesionKpa = 15.0,
): LandslideSlopeState {
  const betaRad = (Math.max(0, slopeAngleDeg) * Math.PI) / 180;
  const phiRad = (28 * Math.PI) / 180; // Internal friction angle of wet soil (28°)
  const gamma = 18.5; // Soil unit weight kN/m³
  const z = 1.5; // Failure plane depth

  // Moisture saturation liquefies soil, reducing cohesion
  const effectiveCohesion = Math.max(1.0, soilCohesionKpa * (1 - soilMoistureRatio * 0.88));
  // Pore water pressure scales with soil moisture
  const u = soilMoistureRatio * 14.0;
  const normalStress = gamma * z * Math.pow(Math.cos(betaRad), 2) - u;
  const shearStrength = effectiveCohesion + Math.max(0, normalStress) * Math.tan(phiRad);
  const shearStress = gamma * z * Math.sin(betaRad) * Math.cos(betaRad);


  const safetyFactorFs = shearStress > 0 ? shearStrength / shearStress : 99.0;
  const landslideTriggered = safetyFactorFs < 1.0;
  const displacedMudVolumeM3 = landslideTriggered ? Number((12.5 * (1 + soilMoistureRatio)).toFixed(1)) : 0;

  return {
    slopeAngleDeg: Number(slopeAngleDeg.toFixed(1)),
    soilCohesionKpa: Number(soilCohesionKpa.toFixed(1)),
    soilMoistureRatio: Number(soilMoistureRatio.toFixed(2)),
    safetyFactorFs: Number(safetyFactorFs.toFixed(2)),
    landslideTriggered,
    displacedMudVolumeM3,
  };
}
