/**
 * Cargo Sling & Cable Crane Pendulum Physics Engine.
 *
 * Simulates suspended cargo container sway, dynamic side-load transfer,
 * and pendulum damping during vehicle turns and bumpy terrain traversal.
 */

export interface CargoSlingState {
  cableLengthMeters: number;
  cargoMassKg: number;
  swayAngleRad: number; // Pendulum angle relative to vertical
  swayAngularVelocityRadSec: number;
  sideForceN: number;
}

export function updateCargoSlingPhysics(
  current: CargoSlingState,
  vehicleLateralAccelMps2: number, // Centripetal or turn acceleration
  deltaSeconds: number,
): CargoSlingState {
  const g = 9.81;
  const L = current.cableLengthMeters;

  // Pendulum equation: theta_ddot = -(g/L)*sin(theta) - (accel/L)*cos(theta) - damping*theta_dot
  const damping = 0.4;
  const angularAccel =
    -(g / L) * Math.sin(current.swayAngleRad) -
    (vehicleLateralAccelMps2 / L) * Math.cos(current.swayAngleRad) -
    damping * current.swayAngularVelocityRadSec;

  const newVel = current.swayAngularVelocityRadSec + angularAccel * deltaSeconds;
  const newAngle = current.swayAngleRad + newVel * deltaSeconds;

  // Dynamic side force transferred to towing vehicle
  const sideForceN = current.cargoMassKg * g * Math.sin(newAngle);

  return {
    cableLengthMeters: L,
    cargoMassKg: current.cargoMassKg,
    swayAngleRad: Number(newAngle.toFixed(4)),
    swayAngularVelocityRadSec: Number(newVel.toFixed(4)),
    sideForceN: Number(sideForceN.toFixed(1)),
  };
}
