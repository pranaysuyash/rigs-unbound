/**
 * Fleet recovery assessment — the single source of truth for "can this stranded
 * rig be recovered, by whom, and what is stopping it".
 *
 * This module is a **pure selector**. It reads canonical state and returns an
 * explanation; it never mutates. `src/game/selector-purity.test.ts` guards that
 * property for the read models that reach this code.
 *
 * One assessment feeds every surface: the contract board (plan the operation),
 * the radial wheel (execute the local step), the HUD prompt, the acceptance
 * output, and the tests. Without that, each surface invents its own idea of
 * whether recovery is possible and they drift apart.
 *
 * The design boundary this encodes: **fleet recovery is a player-operated
 * logistics operation, not a magic rescue button.** The board plans it, the
 * world and the rigs make it difficult, and the radial wheel executes the steps.
 */

import {
  effectiveProfile,
  RIG_IDS,
  type GameState,
  type RigCapability,
  type RigId,
} from "./contracts";
import type { GameWorld } from "./gameworld";
import { effectiveGrip } from "./physics";
import { applyWeatherGripPenalty, type WeatherState } from "./weather";

/** How close a support rig must be before a strap can be attached. */
export const RECOVERY_CONNECTION_RANGE_M = 12;

/**
 * Minimum effective grip under the support rig for a recovery to be attempted.
 * Below this the strap would simply drag the support rig into the same hole.
 */
export const RECOVERY_MIN_GRIP = 0.42;

/** Condition restored to a recovered rig — mobile again, but barely. */
export const RECOVERY_RESTORED_CONDITION = 25;

export type RecoveryBlockReason =
  | "no-disabled-rig"
  | "no-support-rig"
  | "missing-tow-capability"
  | "support-too-far"
  | "insufficient-traction";

export interface RecoveryCandidate {
  rigId: RigId;
  distanceM: number;
  hasTow: boolean;
  /** Effective grip under this rig after weather and surface are applied. */
  grip: number;
  withinRange: boolean;
  /** Null when this rig could act right now. */
  blockedBy: RecoveryBlockReason | null;
}

export interface FleetRecoveryAssessment {
  /** `available` = a command can be issued now. */
  status: "available" | "conditional" | "blocked" | "none";
  strandedRigId: RigId | null;
  /** The best candidate, or null when none qualifies. */
  supportRigId: RigId | null;
  candidates: readonly RecoveryCandidate[];
  /** Ordered, player-readable explanations. Never empty unless `status` is `none`. */
  reasons: readonly string[];
  blockedBy: RecoveryBlockReason | null;
  /** True when weather is actively worsening the attempt. */
  weatherPressure: boolean;
  /** Guidance for a `conditional` result: where the player must go. */
  destination: { x: number; z: number } | null;
}

const NONE: FleetRecoveryAssessment = {
  status: "none",
  strandedRigId: null,
  supportRigId: null,
  candidates: [],
  reasons: [],
  blockedBy: "no-disabled-rig",
  weatherPressure: false,
  destination: null,
};

function hasTow(capabilities: readonly RigCapability[]): boolean {
  return capabilities.includes("tow");
}

/**
 * Assess whether any disabled rig can be recovered.
 *
 * Deterministic and pure: the same state, world, and weather always produce the
 * same assessment, which is what lets replay reproduce a recovery exactly.
 */
export function deriveFleetRecoveryAssessment(
  state: GameState,
  world: GameWorld,
  weather: WeatherState,
): FleetRecoveryAssessment {
  const strandedRigId =
    RIG_IDS.find((rigId) => state.rigs[rigId].condition <= 0) ?? null;
  if (!strandedRigId) return NONE;

  const stranded = state.rigs[strandedRigId];
  const weatherPressure = weather.phase === "rain" || weather.phase === "storm";

  const candidates: RecoveryCandidate[] = [];
  for (const rigId of RIG_IDS) {
    if (rigId === strandedRigId) continue;
    const rig = state.rigs[rigId];
    if (rig.condition <= 0) continue; // a second casualty cannot rescue the first

    const profile = effectiveProfile(rig.id, rig.modules);
    const distanceM = Math.hypot(rig.x - stranded.x, rig.z - stranded.z);
    const withinRange = distanceM <= RECOVERY_CONNECTION_RANGE_M;

    // Grip is measured under the *support* rig, because that is the rig that has
    // to pull. Weather lowers it through the same helper the motion model uses,
    // so the assessment cannot claim conditions the simulation does not share.
    const ground = world.terrain.sample(rig.x, rig.z);
    const grip = applyWeatherGripPenalty(
      effectiveGrip(ground.surface.grip, profile.tireGrip, profile.lugBonus),
      ground.surface.id,
      weather.soilMoisture,
    );

    const towCapable = hasTow(profile.capabilities);
    const blockedBy: RecoveryBlockReason | null = !towCapable
      ? "missing-tow-capability"
      : !withinRange
        ? "support-too-far"
        : grip < RECOVERY_MIN_GRIP
          ? "insufficient-traction"
          : null;

    candidates.push({
      rigId,
      distanceM,
      hasTow: towCapable,
      grip,
      withinRange,
      blockedBy,
    });
  }

  if (candidates.length === 0) {
    return {
      ...NONE,
      status: "blocked",
      strandedRigId,
      blockedBy: "no-support-rig",
      reasons: [`${stranded.id} is disabled and no other rig is operational.`],
      weatherPressure,
    };
  }

  // Prefer a rig that can act now; otherwise the nearest tow-capable rig, so the
  // guidance points at the machine actually worth driving.
  const ready = candidates.filter((candidate) => candidate.blockedBy === null);
  const towCapable = candidates.filter((candidate) => candidate.hasTow);
  const ordered = [...(ready.length > 0 ? ready : towCapable)].sort(
    (a, b) => a.distanceM - b.distanceM,
  );
  const best = ordered[0] ?? null;

  if (!best) {
    return {
      status: "blocked",
      strandedRigId,
      supportRigId: null,
      candidates,
      blockedBy: "missing-tow-capability",
      reasons: [
        `No operational rig has a tow hook. ${stranded.id} cannot be recovered until one does.`,
      ],
      weatherPressure,
      destination: null,
    };
  }

  const reasons: string[] = [];
  if (best.blockedBy === null) {
    reasons.push(`${best.rigId} is in range and can take the strap.`);
    if (weatherPressure) {
      reasons.push(
        `Wet ground is cutting traction — the pull will be slower than it looks.`,
      );
    }
    return {
      status: "available",
      strandedRigId,
      supportRigId: best.rigId,
      candidates,
      blockedBy: null,
      reasons,
      weatherPressure,
      destination: { x: stranded.x, z: stranded.z },
    };
  }

  if (best.blockedBy === "support-too-far") {
    reasons.push(
      `${best.rigId} is ${Math.round(best.distanceM)} m away. Drive within ${RECOVERY_CONNECTION_RANGE_M} m to attach the strap.`,
    );
    if (weatherPressure) {
      reasons.push(`Rain is saturating the ground on the way.`);
    }
    return {
      status: "conditional",
      strandedRigId,
      supportRigId: best.rigId,
      candidates,
      blockedBy: "support-too-far",
      reasons,
      weatherPressure,
      destination: { x: stranded.x, z: stranded.z },
    };
  }

  if (best.blockedBy === "insufficient-traction") {
    reasons.push(
      `${best.rigId} is in range but the ground under it will not hold a pull.`,
    );
    reasons.push(
      weatherPressure
        ? `Wet ground has dropped grip to ${best.grip.toFixed(2)}. Lug tyres, or wait for the rain to pass.`
        : `Grip is ${best.grip.toFixed(2)}. Lug tyres would bite here.`,
    );
    return {
      status: "blocked",
      strandedRigId,
      supportRigId: best.rigId,
      candidates,
      blockedBy: "insufficient-traction",
      reasons,
      weatherPressure,
      destination: { x: stranded.x, z: stranded.z },
    };
  }

  reasons.push(`${best.rigId} has no tow hook.`);
  return {
    status: "blocked",
    strandedRigId,
    supportRigId: best.rigId,
    candidates,
    blockedBy: "missing-tow-capability",
    reasons,
    weatherPressure,
    destination: null,
  };
}
