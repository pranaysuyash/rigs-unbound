/**
 * Seismic Subsurface Ground Probe Engine.
 *
 * Emits acoustic pulse shockwaves into ground strata to map subterranean rock layers,
 * buried salvage caches, and underground caverns beneath mud and water.
 */

export interface SubsurfaceLayer {
  depthMeters: number;
  density: number; // 0..1 (0 = hollow cavern, 1 = solid granite)
  strataType: "mud" | "sediment" | "granite" | "void" | "salvage-deposit";
}

export interface SeismicPulseResult {
  pulseOrigin: { x: number; z: number };
  penetrationDepthMeters: number;
  layers: SubsurfaceLayer[];
  detectedAnomaly: {
    type: "cavern" | "salvage-cache" | "dense-bedrock";
    depthMeters: number;
    signalStrength: number; // 0..1
  } | null;
}

export function fireSeismicPulse(
  x: number,
  z: number,
  pulseEnergy: number, // 1..10
  soilMoisture: number,
  knownCaches: readonly { x: number; z: number; depthMeters: number }[],
): SeismicPulseResult {
  // Moisture enhances acoustic coupling: deeper propagation in moist ground
  const effectiveMaxDepth = Math.min(
    50,
    pulseEnergy * 4.5 * (1 + soilMoisture * 0.4),
  );

  const layers: SubsurfaceLayer[] = [
    { depthMeters: 0.5, density: 0.3 + soilMoisture * 0.2, strataType: "mud" },
    { depthMeters: 3.0, density: 0.6, strataType: "sediment" },
    { depthMeters: 12.0, density: 0.95, strataType: "granite" },
  ];

  let detectedAnomaly: SeismicPulseResult["detectedAnomaly"] = null;
  let minCacheDist = Infinity;
  let matchedCache: (typeof knownCaches)[0] | null = null;

  for (const cache of knownCaches) {
    const dist = Math.hypot(cache.x - x, cache.z - z);
    if (
      dist < minCacheDist &&
      dist <= 25 &&
      cache.depthMeters <= effectiveMaxDepth
    ) {
      minCacheDist = dist;
      matchedCache = cache;
    }
  }

  if (matchedCache) {
    const proximityFactor = Math.max(0, 1 - minCacheDist / 25);
    detectedAnomaly = {
      type: "salvage-cache",
      depthMeters: matchedCache.depthMeters,
      signalStrength: Number(proximityFactor.toFixed(3)),
    };
    layers.push({
      depthMeters: matchedCache.depthMeters,
      density: 0.85,
      strataType: "salvage-deposit",
    });
  }

  return {
    pulseOrigin: { x, z },
    penetrationDepthMeters: Number(effectiveMaxDepth.toFixed(1)),
    layers,
    detectedAnomaly,
  };
}
