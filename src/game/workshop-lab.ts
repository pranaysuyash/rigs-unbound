/**
 * Diegetic Workshop Modular Customizer Engine.
 *
 * Computes mass distribution shifts, center of mass (CoM) offsets, rotational
 * inertia, and rollover stability factors when modules are attached to rig chassis sockets.
 */

import type { ModuleId, RigProfile } from "./contracts";
import { MODULES } from "./contracts";

export interface ChassisMassDistribution {
  totalMassKg: number;
  centerOfMassOffset: { x: number; y: number; z: number }; // Metres relative to chassis center
  yawInertiaKgM2: number;
  rolloverRisk: number; // 0..1 (higher top mass increases off-camber rollover)
}

export function computeChassisMassDistribution(
  baseProfile: RigProfile,
  fittedModuleIds: readonly ModuleId[],
): ChassisMassDistribution {
  let totalMassKg = baseProfile.mass * 1000; // Base mass in kg
  let sumY = 0.4; // Base CG height above axle plane
  let sumZ = 0;

  for (const modId of fittedModuleIds) {
    const mod = MODULES[modId];
    if (mod) {
      const modMass = 85.0; // 85kg per module
      totalMassKg += modMass;

      // Socket location biases:
      // Mast: Top rear (+y, -z)
      // Winch: Front low (-z, low y)
      if (modId === "survey-mast") {
        sumY += (modMass * 1.8) / totalMassKg;
        sumZ -= (modMass * 0.8) / totalMassKg;
      } else if (modId === "winch") {
        sumY += (modMass * 0.2) / totalMassKg;
        sumZ += (modMass * 1.2) / totalMassKg;
      }
    }
  }

  const cgY = Math.min(1.5, Math.max(0.2, sumY));
  const yawInertia = totalMassKg * (1.2 + Math.abs(sumZ) * 0.5);
  // Rollover risk scales with CG height divided by track width (1.8m)
  const rolloverRisk = Math.min(1.0, Math.max(0.05, (cgY / 1.8) * 0.85));

  return {
    totalMassKg: Number(totalMassKg.toFixed(1)),
    centerOfMassOffset: {
      x: 0,
      y: Number(cgY.toFixed(3)),
      z: Number(sumZ.toFixed(3)),
    },
    yawInertiaKgM2: Number(yawInertia.toFixed(1)),
    rolloverRisk: Number(rolloverRisk.toFixed(3)),
  };
}
