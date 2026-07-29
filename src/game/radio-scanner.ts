/**
 * In-Cab Diegetic Radio & Signal Scanner.
 *
 * Scans proximity to undiscovered world sites, salvage nodes, and hidden tech caches.
 * Computes carrier frequency, distance, and signal strength (0..1) to drive Web Audio
 * static and signal pulse synthesizer.
 */

export interface RadioSignalState {
  signalStrength: number; // 0..1 (1 = directly on target)
  carrierFrequencyHz: number; // 88.5..108.0 MHz
  distanceMeters: number;
  /** Absolute compass bearing: north is 0 degrees and values increase clockwise. */
  bearingDegrees: number | null;
  nearestTargetName: string | null;
}

export const SCANNER_MAX_RANGE = 250; // Metres

/**
 * Turn an absolute field bearing into a deliberately coarse cockpit readout.
 *
 * The scanner is for orienting a player through the landscape, not for
 * replacing navigation with GPS precision.
 */
export function compassBearing(bearingDegrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  const normalized = ((bearingDegrees % 360) + 360) % 360;
  return directions[Math.round(normalized / 45) % directions.length]!;
}

export function deriveRadioSignal(
  rigX: number,
  rigZ: number,
  targets: readonly { name: string; x: number; z: number }[],
): RadioSignalState {
  if (targets.length === 0) {
    return {
      signalStrength: 0,
      carrierFrequencyHz: 92.3,
      distanceMeters: Infinity,
      bearingDegrees: null,
      nearestTargetName: null,
    };
  }

  let nearestDist = Infinity;
  let nearestTarget: { name: string; x: number; z: number } | null = null;

  for (const target of targets) {
    const dist = Math.hypot(target.x - rigX, target.z - rigZ);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestTarget = target;
    }
  }

  if (!nearestTarget || nearestDist > SCANNER_MAX_RANGE) {
    return {
      signalStrength: 0,
      carrierFrequencyHz: 92.3,
      distanceMeters: nearestDist,
      bearingDegrees: null,
      nearestTargetName: null,
    };
  }

  const signalStrength = Math.max(0, 1 - nearestDist / SCANNER_MAX_RANGE);
  // Hash target name to pseudo carrier frequency between 88.5 and 107.9 MHz
  let hash = 0;
  for (let i = 0; i < nearestTarget.name.length; i++) {
    hash = (hash << 5) - hash + nearestTarget.name.charCodeAt(i);
  }
  const carrierFrequencyHz = 88.5 + (Math.abs(hash) % 194) / 10;
  const bearingDegrees =
    ((Math.atan2(nearestTarget.x - rigX, nearestTarget.z - rigZ) * 180) /
      Math.PI +
      360) %
    360;

  return {
    signalStrength: Number(signalStrength.toFixed(3)),
    carrierFrequencyHz: Number(carrierFrequencyHz.toFixed(1)),
    distanceMeters: Number(nearestDist.toFixed(1)),
    bearingDegrees: Number(bearingDegrees.toFixed(1)),
    nearestTargetName: nearestTarget.name,
  };
}
