/**
 * Winch Snatch Block & Mechanical Advantage Pulley Engine.
 *
 * Models single-line (1x), double-line (2x), and triple-line (3x) snatch block mechanical advantages.
 * Doubling mechanical advantage doubles line pulling force (N) while halving line spool speed.
 */

export interface WinchPulleyConfig {
  pulleyRatio: 1 | 2 | 3; // 1x single line, 2x snatch block, 3x double block
  baseLinePullForceN: number; // e.g. 35,000 N
  baseSpoolSpeedMps: number; // e.g. 0.4 m/s
}

export interface WinchPulleyOutput {
  effectivePullForceN: number;
  effectiveSpoolSpeedMps: number;
  mechanicalAdvantageFactor: number;
}

export function computeWinchPulleyOutput(
  config: WinchPulleyConfig,
): WinchPulleyOutput {
  const n = config.pulleyRatio;
  const effectivePullForceN = config.baseLinePullForceN * n;
  const effectiveSpoolSpeedMps = config.baseSpoolSpeedMps / n;

  return {
    effectivePullForceN: Number(effectivePullForceN.toFixed(1)),
    effectiveSpoolSpeedMps: Number(effectiveSpoolSpeedMps.toFixed(3)),
    mechanicalAdvantageFactor: n,
  };
}
