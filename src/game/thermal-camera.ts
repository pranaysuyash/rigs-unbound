/**
 * Atmospheric Fog Extinction & Infrared Thermal Camera System.
 *
 * Models Beer-Lambert light extinction in dense mountain fog/dust,
 * providing a diegetic infrared thermal view highlighting engine heat and subsurface anomalies.
 */

export interface ThermalSignature {
  targetId: string;
  temperatureCelsius: number;
  normalizedHeatRatio: number; // 0..1
  thermalPaletteHex: string; // Hex color code
}

export interface FogVisibilityState {
  fogDensity: number; // 0..1
  viewDistanceM: number;
  attenuationPercent: number; // Light extinction percentage
  thermalModeActive: boolean;
}

export function calculateFogVisibility(
  fogDensity: number,
  targetDistanceM: number,
  thermalModeActive = false,
): FogVisibilityState {
  const density = Math.min(1.0, Math.max(0, fogDensity));
  const extinctionCoeff = density * 0.08;
  const lightTransmittance = Math.exp(-extinctionCoeff * targetDistanceM);
  const attenuationPercent = Number(((1 - lightTransmittance) * 100).toFixed(1));

  // Thermal camera penetrates optical fog, maintaining longer view distance
  const baseViewM = 250 * Math.exp(-extinctionCoeff * 15);
  const viewDistanceM = Number((thermalModeActive ? baseViewM * 1.8 : baseViewM).toFixed(1));

  return {
    fogDensity: Number(density.toFixed(2)),
    viewDistanceM,
    attenuationPercent,
    thermalModeActive,
  };
}

export function deriveThermalSignature(
  targetId: string,
  temperatureCelsius: number,
  ambientCelsius = 15.0,
): ThermalSignature {
  const heatRange = 105.0 - ambientCelsius;
  const delta = Math.max(0, temperatureCelsius - ambientCelsius);
  const normalizedHeatRatio = Number(Math.min(1.0, delta / heatRange).toFixed(2));

  let hex = "#000033"; // Cold dark blue
  if (normalizedHeatRatio > 0.85) {
    hex = "#ffffff"; // White hot
  } else if (normalizedHeatRatio > 0.6) {
    hex = "#ff3300"; // Hot red/orange
  } else if (normalizedHeatRatio > 0.3) {
    hex = "#ffcc00"; // Warm yellow
  } else if (normalizedHeatRatio > 0.1) {
    hex = "#3366cc"; // Cool cyan
  }

  return {
    targetId,
    temperatureCelsius: Number(temperatureCelsius.toFixed(1)),
    normalizedHeatRatio,
    thermalPaletteHex: hex,
  };
}
