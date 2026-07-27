/**
 * Multi-Vehicle Tandem Fleet Recovery System.
 *
 * Coordinates multi-rig operations, connecting lead and support rigs via tandem tow straps
 * to combine tractive force and perform heavy mud extractions.
 */

export interface TandemTowConnection {
  leadRigId: string;
  supportRigId: string;
  strapRestLengthM: number;
  currentDistanceM: number;
  strapTensionN: number;
  combinedTractiveForceN: number;
  isStrapConnected: boolean;
}

export function createTandemTowConnection(
  leadRigId: string,
  supportRigId: string,
  strapRestLengthM = 8.0,
): TandemTowConnection {
  return {
    leadRigId,
    supportRigId,
    strapRestLengthM,
    currentDistanceM: strapRestLengthM,
    strapTensionN: 0,
    combinedTractiveForceN: 0,
    isStrapConnected: true,
  };
}

export function updateTandemTowPhysics(
  connection: TandemTowConnection,
  currentDistanceM: number,
  leadRigTractiveForceN: number,
  supportRigTractiveForceN: number,
  strapStiffness = 4500, // N/m stiffness
): TandemTowConnection {
  if (!connection.isStrapConnected) {
    return { ...connection, strapTensionN: 0, combinedTractiveForceN: leadRigTractiveForceN };
  }

  const stretchM = Math.max(0, currentDistanceM - connection.strapRestLengthM);
  const strapTensionN = Number((stretchM * strapStiffness).toFixed(1));

  // Combined force pulls stuck lead rig using support rig's tractive effort
  const combinedTractiveForceN = Number((leadRigTractiveForceN + Math.min(supportRigTractiveForceN, strapTensionN)).toFixed(1));

  return {
    ...connection,
    currentDistanceM: Number(currentDistanceM.toFixed(2)),
    strapTensionN,
    combinedTractiveForceN,
  };
}
