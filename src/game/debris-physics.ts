/**
 * Dynamic Terrain Debris & Boulder Displacement Engine.
 *
 * Simulates impulse momentum transfer when heavy vehicles collide with or push loose boulders,
 * clearing blocked mountain pass causeways and unblocking tracks.
 */

export interface BoulderDebris {
  id: string;
  x: number;
  z: number;
  massKg: number; // e.g. 450 kg
  staticFrictionCoeff: number; // 0.6
  displaced: boolean;
}

export function computeBoulderImpactDisplacement(
  boulder: BoulderDebris,
  rigMassKg: number,
  rigSpeedMps: number,
  impactVector: { x: number; z: number },
): { updatedBoulder: BoulderDebris; impulseN: number; displaced: boolean } {
  const g = 9.81;
  const staticFrictionForceN = boulder.staticFrictionCoeff * boulder.massKg * g;
  // Kinetic impact force = (rigMass * rigSpeed) / deltaImpactTime (0.1s)
  const impactImpulseN = (rigMassKg * rigSpeedMps) / 0.1;

  if (impactImpulseN <= staticFrictionForceN) {
    return { updatedBoulder: boulder, impulseN: Number(impactImpulseN.toFixed(1)), displaced: false };
  }

  // Calculate displacement magnitude
  const excessForceN = impactImpulseN - staticFrictionForceN;
  const accel = excessForceN / boulder.massKg;
  const displacementDistMeters = Math.min(6.0, 0.5 * accel * 0.05); // Bounded displacement distance

  const newX = boulder.x + impactVector.x * displacementDistMeters;
  const newZ = boulder.z + impactVector.z * displacementDistMeters;

  return {
    updatedBoulder: {
      ...boulder,
      x: Number(newX.toFixed(3)),
      z: Number(newZ.toFixed(3)),
      displaced: true,
    },
    impulseN: Number(impactImpulseN.toFixed(1)),
    displaced: true,
  };
}
