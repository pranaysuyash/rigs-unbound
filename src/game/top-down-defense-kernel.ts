/**
 * Top-Down Horde Night Defense Gameplay Kernel
 *
 * Headless, replay-deterministic simulation rules for top-down defense mode:
 * - Nocturnal threat wave timing & spawn vectors.
 * - Perimeter barricade health & structural collision.
 * - Turret auto-targeting vectors and salvage rewards.
 */

export interface DefenseThreatWave {
  waveIndex: number;
  threatCount: number;
  spawnAngleRad: number;
  speedMps: number;
  active: boolean;
}

export interface BarricadeSegment {
  id: string;
  x: number;
  z: number;
  healthPercent: number;
  destroyed: boolean;
}

export interface TopDownDefenseState {
  status: "ready" | "active" | "completed" | "failed";
  currentWaveIndex: number;
  threatsDefeated: number;
  salvageEarned: number;
  barricades: readonly BarricadeSegment[];
}

export function createInitialDefenseState(): TopDownDefenseState {
  return {
    status: "ready",
    currentWaveIndex: 0,
    threatsDefeated: 0,
    salvageEarned: 0,
    barricades: [
      { id: "silo-north-gate", x: 0, z: -15, healthPercent: 100, destroyed: false },
      { id: "silo-east-wall", x: 15, z: 0, healthPercent: 100, destroyed: false },
      { id: "silo-south-wall", x: 0, z: 15, healthPercent: 100, destroyed: false },
      { id: "silo-west-wall", x: -15, z: 0, healthPercent: 100, destroyed: false },
    ],
  };
}

export function advanceDefenseWave(
  state: TopDownDefenseState,
  deltaTimeSeconds: number,
): TopDownDefenseState {
  if (state.status !== "active") return state;

  const threatsDefeated = state.threatsDefeated + Math.floor(deltaTimeSeconds * 2);
  const salvageEarned = state.salvageEarned + Math.floor(deltaTimeSeconds * 1.5);
  const waveCompleted = threatsDefeated >= (state.currentWaveIndex + 1) * 10;

  return {
    ...state,
    threatsDefeated,
    salvageEarned,
    currentWaveIndex: waveCompleted ? state.currentWaveIndex + 1 : state.currentWaveIndex,
    status: waveCompleted && state.currentWaveIndex >= 3 ? "completed" : "active",
  };
}
