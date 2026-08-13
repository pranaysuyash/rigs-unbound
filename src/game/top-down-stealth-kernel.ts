/**
 * Top-Down Stealth Recon Gameplay Kernel
 *
 * Headless simulation rules for Sunken Flats Nocturnal Recon:
 * - Noise level and engine acoustic emission calculation.
 * - Sentry scan detection cones and illumination thresholds.
 * - Infiltration objective evaluation.
 */

export interface SentryTower {
  id: string;
  x: number;
  z: number;
  scanHeadingRad: number;
  scanConeAngleRad: number;
  scanRangeMeters: number;
}

export interface TopDownStealthState {
  status: "ready" | "active" | "detected" | "completed";
  noiseLevelPercent: number;
  detectedBySentry: string | null;
  objectivesCompleted: number;
}

export function createInitialStealthState(): TopDownStealthState {
  return {
    status: "ready",
    noiseLevelPercent: 0,
    detectedBySentry: null,
    objectivesCompleted: 0,
  };
}

export function evaluateStealthDetection(
  state: TopDownStealthState,
  playerX: number,
  playerZ: number,
  rigSpeedMps: number,
  sentries: readonly SentryTower[],
): TopDownStealthState {
  if (state.status === "detected" || state.status === "completed") return state;

  const noise = Math.min(100, Math.round(rigSpeedMps * 8));

  for (const sentry of sentries) {
    const dist = Math.hypot(playerX - sentry.x, playerZ - sentry.z);
    if (dist <= sentry.scanRangeMeters) {
      // Check angle within scan cone
      const angleToPlayer = Math.atan2(playerZ - sentry.z, playerX - sentry.x);
      const angleDiff = Math.abs(angleToPlayer - sentry.scanHeadingRad);
      if (angleDiff <= sentry.scanConeAngleRad / 2 && noise > 20) {
        return {
          ...state,
          noiseLevelPercent: noise,
          detectedBySentry: sentry.id,
          status: "detected",
        };
      }
    }
  }

  return {
    ...state,
    noiseLevelPercent: noise,
    status: "active",
  };
}
