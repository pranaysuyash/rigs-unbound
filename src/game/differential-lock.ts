/**
 * Differential Lock & Torque Vectoring Engine.
 *
 * Models Open, Limited-Slip, and 100% Locked differential dynamics across drive axles.
 * Prevents single-wheel spinouts in deep mud while modeling turning scrub radius penalties.
 */

export type DifferentialMode = "open" | "limited-slip" | "locked";

export interface AxleTorqueDistribution {
  leftWheelTorqueNm: number;
  rightWheelTorqueNm: number;
  effectiveDriveForceN: number;
  turningScrubFactor: number; // 1.0 = normal, 1.25 = wider turn radius due to locked diff scrub
}

export function computeAxleTorque(
  inputTorqueNm: number,
  leftGrip: number, // 0..1
  rightGrip: number, // 0..1
  mode: DifferentialMode,
): AxleTorqueDistribution {
  let leftTorque = inputTorqueNm * 0.5;
  let rightTorque = inputTorqueNm * 0.5;
  let scrub = 1.0;

  if (mode === "open") {
    // Open diff torque is limited by the wheel with minimum grip
    const minGrip = Math.min(leftGrip, rightGrip);
    leftTorque = inputTorqueNm * 0.5 * minGrip;
    rightTorque = inputTorqueNm * 0.5 * minGrip;
  } else if (mode === "limited-slip") {
    // Limited slip transfers up to 70% torque to high-grip wheel
    const totalGrip = leftGrip + rightGrip;
    if (totalGrip > 0) {
      leftTorque = inputTorqueNm * (leftGrip / totalGrip) * 0.85;
      rightTorque = inputTorqueNm * (rightGrip / totalGrip) * 0.85;
    }
    scrub = 1.08;
  } else if (mode === "locked") {
    // Locked diff splits torque 50/50 regardless of grip differences
    leftTorque = inputTorqueNm * 0.5;
    rightTorque = inputTorqueNm * 0.5;
    scrub = 1.25; // Tire scrubbing penalizes sharp turns
  }

  // Drive force is work done by gripping tires
  const driveForce = leftTorque * leftGrip + rightTorque * rightGrip;

  return {
    leftWheelTorqueNm: Number(leftTorque.toFixed(1)),
    rightWheelTorqueNm: Number(rightTorque.toFixed(1)),
    effectiveDriveForceN: Number(driveForce.toFixed(1)),
    turningScrubFactor: scrub,
  };
}
