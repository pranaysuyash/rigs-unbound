/**
 * The authored first-night threat named in
 * `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §3: what comes for the
 * valley once dusk breaks, and why it differs from a generic storm. Whether
 * the player surveyed the north field before dusk decides who the night's
 * pressure is looking for — the buried signal (if found) or the farm itself
 * (if not). The waterworks branch does not change *which* threat arrives,
 * only the ground it crosses; that distinction lives in the diagnostic and
 * in the caller's terrain, not here.
 *
 * This module deliberately does not model mobile, pathing "night machines" —
 * no such entity/AI system exists yet in this codebase, and inventing one to
 * satisfy this beat would be a much larger, separate undertaking. What it
 * ships is the honest first increment: a real, save-persisted branch that
 * fires once, differs in four readable ways, and places a real positioned
 * hazard (reusing the same `Obstacle` primitive `road-incidents.ts` already
 * uses for the Quarry Runout) rather than only changing flavor text.
 */

import type { Obstacle } from "./collision";

export type FirstNightThreatStatus = "pending" | "resolved";
export type FirstNightThreatVariant = "signal-drawn" | "storm-pressure";
export type FirstNightWaterworksChoice =
  "repair-pump" | "redirect-channel" | "unresolved";

export interface FirstNightThreatState {
  id: "first-night-threat";
  status: FirstNightThreatStatus;
  variant: FirstNightThreatVariant | null;
  resolvedAtWorldMinutes: number | null;
  originX: number | null;
  originZ: number | null;
}

export interface FirstNightThreatInputs {
  waterworksChoice: FirstNightWaterworksChoice;
  northFieldSurveyed: boolean;
  northFieldX: number;
  northFieldZ: number;
  homeX: number;
  homeZ: number;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function createFirstNightThreat(): FirstNightThreatState {
  return {
    id: "first-night-threat",
    status: "pending",
    variant: null,
    resolvedAtWorldMinutes: null,
    originX: null,
    originZ: null,
  };
}

/**
 * Resolve the first night's threat once, at the caller's first day->night
 * transition. Idempotent: once resolved, later calls return the same state
 * unchanged, so a save that reloads mid-night cannot re-roll the variant.
 */
export function resolveFirstNightThreat(
  state: FirstNightThreatState,
  worldMinutes: number,
  inputs: FirstNightThreatInputs,
): FirstNightThreatState {
  if (state.status !== "pending") return state;
  const variant: FirstNightThreatVariant = inputs.northFieldSurveyed
    ? "signal-drawn"
    : "storm-pressure";
  const origin =
    variant === "signal-drawn"
      ? { x: inputs.northFieldX, z: inputs.northFieldZ }
      : { x: inputs.homeX, z: inputs.homeZ };
  return {
    id: "first-night-threat",
    status: "resolved",
    variant,
    resolvedAtWorldMinutes: Math.max(0, worldMinutes),
    originX: origin.x,
    originZ: origin.z,
  };
}

/** The player-visible line for the resolved threat, or null before it fires. */
export function firstNightThreatDiagnostic(
  state: FirstNightThreatState,
  waterworksChoice: FirstNightWaterworksChoice,
): string | null {
  if (state.status !== "resolved" || !state.variant) return null;
  const redirected = waterworksChoice === "redirect-channel";
  if (state.variant === "signal-drawn") {
    return redirected
      ? "Whatever answers under the north field is answering back — and the redirected channel has softened its only easy approach."
      : "Whatever answers under the north field is answering back. The firm ground from the repaired pump is the only mercy tonight.";
  }
  return redirected
    ? "The storm has found the farm on its own tonight, and the redirected channel has left the low path drowned under it."
    : "The storm has found the farm on its own tonight, same as any valley's.";
}

/**
 * Positions the resolved threat as a real, collidable hazard using the same
 * `Obstacle` primitive the Quarry Runout already renders through — this
 * reuses the existing rendering/collision path rather than adding a second
 * one. Signal-drawn reads larger and more disruptive than storm-pressure,
 * matching the diagnostic's framing that the signal variant is the sharper
 * threat.
 */
export function firstNightThreatObstacle(
  state: FirstNightThreatState,
  groundY: number,
): Obstacle | null {
  if (
    state.status !== "resolved" ||
    state.originX === null ||
    state.originZ === null
  ) {
    return null;
  }
  const signalDrawn = state.variant === "signal-drawn";
  return {
    id: "incident:first-night-threat",
    x: state.originX,
    z: state.originZ,
    groundY,
    radius: signalDrawn ? 3.1 : 2.3,
    height: signalDrawn ? 4.2 : 3.5,
    kind: "rock",
    fellable: false,
    variation: signalDrawn ? 0.62 : 0.38,
  };
}

/** Lenient recovery preserves older saves and rejects malformed/foreign records. */
export function recoverFirstNightThreat(value: unknown): FirstNightThreatState {
  const fallback = createFirstNightThreat();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Record<string, unknown>;
  if (candidate.id !== "first-night-threat") return fallback;
  const variant: FirstNightThreatVariant | null =
    candidate.variant === "signal-drawn" ||
    candidate.variant === "storm-pressure"
      ? candidate.variant
      : null;
  const resolved = candidate.status === "resolved" && variant !== null;
  return {
    id: "first-night-threat",
    status: resolved ? "resolved" : "pending",
    variant: resolved ? variant : null,
    resolvedAtWorldMinutes:
      resolved && isFiniteNumber(candidate.resolvedAtWorldMinutes)
        ? Math.max(0, candidate.resolvedAtWorldMinutes)
        : null,
    originX:
      resolved && isFiniteNumber(candidate.originX) ? candidate.originX : null,
    originZ:
      resolved && isFiniteNumber(candidate.originZ) ? candidate.originZ : null,
  };
}
