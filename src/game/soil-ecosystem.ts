/**
 * Dynamic Soil Ecosystem & Vegetation Growth System.
 *
 * Tracks root density, moss regeneration, and natural vegetation recovery
 * over world time. Rain accelerates recovery; wheelspin rutting strips vegetation.
 */

export interface SoilEcosystemCell {
  x: number;
  z: number;
  vegetationCoverage: number; // 0..1 (0 = bare tilled mud, 1 = dense wild moss/shrub)
  rootDensity: number; // 0..1 (higher root density stabilizes soil against furrow erosion)
  soilHealth: number; // 0..1
}

export function updateSoilEcosystem(
  cell: SoilEcosystemCell,
  deltaDays: number,
  soilMoisture: number,
  wheelspinDamage: number, // 0..1
): SoilEcosystemCell {
  let vegetation = cell.vegetationCoverage;
  let rootDensity = cell.rootDensity;

  if (wheelspinDamage > 0) {
    // Wheelspin tears roots and strips vegetation
    vegetation = Math.max(0, vegetation - wheelspinDamage * 0.7);
    rootDensity = Math.max(0, rootDensity - wheelspinDamage * 0.4);
  } else {
    // Rain and moisture accelerate natural growth
    const growthRate = 0.05 * (1 + soilMoisture * 0.8) * deltaDays;
    vegetation = Math.min(1.0, vegetation + growthRate);
    rootDensity = Math.min(1.0, rootDensity + growthRate * 0.6);
  }

  const soilHealth = Math.min(1.0, (vegetation + rootDensity) * 0.5);

  return {
    ...cell,
    vegetationCoverage: Number(vegetation.toFixed(3)),
    rootDensity: Number(rootDensity.toFixed(3)),
    soilHealth: Number(soilHealth.toFixed(3)),
  };
}

/**
 * Calculates erosion resistance bonus granted by root density.
 * Root-dense soil reduces furrow depth accumulation by up to 50%.
 */
export function calculateErosionResistanceFactor(rootDensity: number): number {
  return Number((1 - rootDensity * 0.5).toFixed(3));
}
