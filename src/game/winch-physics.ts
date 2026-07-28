/**
 * Physical Cable & Winch Anchoring Engine.
 *
 * Computes cable tension vector dynamics, elastic spring-damper pull forces,
 * and line snapping limits when winching heavy rigs up steep inclines or out of deep mud.
 */

export interface CableAnchorPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  maxHoldForceN: number; // Breaking limit of anchor tree/rock
}

export interface WinchCableState {
  attached: boolean;
  anchorId: string | null;
  anchorPos: { x: number; y: number; z: number } | null;
  restLengthMeters: number;
  currentLengthMeters: number;
  tensionN: number;
  snapped: boolean;
}

export const CABLE_MAX_TENSION_N = 35_000; // 35 kN steel cable limit
export const CABLE_SPRING_K = 4_500; // N/m stiffness
export const CABLE_DAMPING_C = 350; // N/(m/s) damping

export function computeWinchTension(
  rigPos: { x: number; y: number; z: number },
  rigVelocity: { x: number; z: number },
  cable: WinchCableState,
): {
  tensionN: number;
  pullVector: { x: number; z: number };
  snapped: boolean;
} {
  if (!cable.attached || !cable.anchorPos || cable.snapped) {
    return { tensionN: 0, pullVector: { x: 0, z: 0 }, snapped: cable.snapped };
  }

  const dx = cable.anchorPos.x - rigPos.x;
  const dz = cable.anchorPos.z - rigPos.z;
  const currentDist = Math.hypot(dx, dz);

  if (currentDist <= cable.restLengthMeters) {
    return { tensionN: 0, pullVector: { x: 0, z: 0 }, snapped: false };
  }

  const stretchMeters = currentDist - cable.restLengthMeters;
  const unitX = dx / currentDist;
  const unitZ = dz / currentDist;

  // Relative velocity along line direction
  const relVel = rigVelocity.x * unitX + rigVelocity.z * unitZ;
  const tensionN = Math.max(
    0,
    stretchMeters * CABLE_SPRING_K - relVel * CABLE_DAMPING_C,
  );

  const snapped = tensionN > CABLE_MAX_TENSION_N;

  return {
    tensionN: Number(tensionN.toFixed(1)),
    pullVector: snapped
      ? { x: 0, z: 0 }
      : {
          x: Number((unitX * tensionN).toFixed(1)),
          z: Number((unitZ * tensionN).toFixed(1)),
        },
    snapped,
  };
}

export function spoolWinchLine(
  cable: WinchCableState,
  deltaMeters: number,
): WinchCableState {
  if (!cable.attached || cable.snapped) return cable;

  const newRestLength = Math.max(2.0, cable.restLengthMeters + deltaMeters);
  return {
    ...cable,
    restLengthMeters: Number(newRestLength.toFixed(2)),
  };
}
