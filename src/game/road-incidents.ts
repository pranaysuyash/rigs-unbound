/** Persistent, optional road incidents with no quest or renderer ownership. */

import type { Obstacle } from "./collision";
import {
  computeBoulderImpactDisplacement,
  type BoulderDebris,
} from "./debris-physics";
import {
  evaluateSlopeStability,
  type LandslideSlopeState,
} from "./landslide-hazard";

export type QuarryRunoutStatus = "dormant" | "active" | "cleared";

export interface QuarryRunoutState {
  id: "quarry-runout";
  status: QuarryRunoutStatus;
  originX: number;
  originZ: number;
  triggeredAtWorldMinutes: number | null;
  clearedAtWorldMinutes: number | null;
  stability: LandslideSlopeState | null;
  boulder: BoulderDebris | null;
}

export interface QuarryRunoutAdvance {
  state: QuarryRunoutState;
  triggered: boolean;
}

export interface QuarryRunoutDisplacement {
  state: QuarryRunoutState;
  moved: boolean;
  cleared: boolean;
  impulseN: number;
}

const INCIDENT_BOULDER_ID = "incident:quarry-runout";
const TRIGGER_MOISTURE = 0.92;
const CLEARANCE_DISTANCE_M = 1.5;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function createQuarryRunout(
  originX: number,
  originZ: number,
): QuarryRunoutState {
  return {
    id: "quarry-runout",
    status: "dormant",
    originX,
    originZ,
    triggeredAtWorldMinutes: null,
    clearedAtWorldMinutes: null,
    stability: null,
    boulder: null,
  };
}

/** High saturation can alter a road whether or not the player is nearby. */
export function advanceQuarryRunout(
  state: QuarryRunoutState,
  worldMinutes: number,
  soilMoistureRatio: number,
): QuarryRunoutAdvance {
  if (state.status !== "dormant" || soilMoistureRatio < TRIGGER_MOISTURE) {
    return { state, triggered: false };
  }
  const stability = evaluateSlopeStability(38, soilMoistureRatio);
  if (!stability.landslideTriggered) return { state, triggered: false };
  return {
    state: {
      ...state,
      status: "active",
      triggeredAtWorldMinutes: Math.max(0, worldMinutes),
      stability,
      boulder: {
        id: INCIDENT_BOULDER_ID,
        x: state.originX,
        z: state.originZ,
        massKg: 30_000,
        staticFrictionCoeff: 0.9,
        displaced: false,
      },
    },
    triggered: true,
  };
}

export function quarryRunoutObstacle(
  state: QuarryRunoutState,
  groundY: number,
): Obstacle | null {
  if (state.status !== "active" || !state.boulder) return null;
  return {
    id: state.boulder.id,
    x: state.boulder.x,
    z: state.boulder.z,
    groundY,
    radius: 2.3,
    height: 3.5,
    kind: "rock",
    fellable: false,
    variation: 0.38,
  };
}

/** A collision, rather than a menu action, is the only way to clear the runout. */
export function displaceQuarryRunout(
  state: QuarryRunoutState,
  rigMassKg: number,
  rigSpeedMps: number,
  rigX: number,
  rigZ: number,
  worldMinutes: number,
): QuarryRunoutDisplacement {
  if (state.status !== "active" || !state.boulder) {
    return { state, moved: false, cleared: false, impulseN: 0 };
  }
  const dx = state.boulder.x - rigX;
  const dz = state.boulder.z - rigZ;
  const length = Math.hypot(dx, dz);
  const impact = computeBoulderImpactDisplacement(
    state.boulder,
    rigMassKg,
    rigSpeedMps,
    length > 1e-5 ? { x: dx / length, z: dz / length } : { x: 1, z: 0 },
  );
  if (!impact.displaced) {
    return { state, moved: false, cleared: false, impulseN: impact.impulseN };
  }
  const cleared =
    Math.hypot(
      impact.updatedBoulder.x - state.originX,
      impact.updatedBoulder.z - state.originZ,
    ) >= CLEARANCE_DISTANCE_M;
  return {
    state: {
      ...state,
      status: cleared ? "cleared" : "active",
      clearedAtWorldMinutes: cleared ? Math.max(0, worldMinutes) : null,
      boulder: cleared ? null : impact.updatedBoulder,
    },
    moved: true,
    cleared,
    impulseN: impact.impulseN,
  };
}

/** Lenient recovery preserves older world records and rejects malformed boulders. */
export function recoverQuarryRunout(
  value: unknown,
  fallback: QuarryRunoutState,
): QuarryRunoutState {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Record<string, unknown>;
  if (candidate.id !== "quarry-runout") return fallback;
  const requestedStatus: QuarryRunoutStatus =
    candidate.status === "active" || candidate.status === "cleared"
      ? candidate.status
      : "dormant";
  const rawBoulder =
    candidate.boulder && typeof candidate.boulder === "object"
      ? (candidate.boulder as Record<string, unknown>)
      : null;
  const boulder: BoulderDebris | null =
    rawBoulder &&
    rawBoulder.id === INCIDENT_BOULDER_ID &&
    isFiniteNumber(rawBoulder.x) &&
    isFiniteNumber(rawBoulder.z)
      ? {
          id: INCIDENT_BOULDER_ID,
          x: rawBoulder.x,
          z: rawBoulder.z,
          massKg: 30_000,
          staticFrictionCoeff: 0.9,
          displaced: rawBoulder.displaced === true,
        }
      : null;
  const active = requestedStatus === "active" && boulder !== null;
  return {
    id: "quarry-runout",
    status: active
      ? "active"
      : requestedStatus === "cleared"
        ? "cleared"
        : "dormant",
    originX: isFiniteNumber(candidate.originX)
      ? candidate.originX
      : fallback.originX,
    originZ: isFiniteNumber(candidate.originZ)
      ? candidate.originZ
      : fallback.originZ,
    triggeredAtWorldMinutes: isFiniteNumber(candidate.triggeredAtWorldMinutes)
      ? Math.max(0, candidate.triggeredAtWorldMinutes)
      : null,
    clearedAtWorldMinutes: isFiniteNumber(candidate.clearedAtWorldMinutes)
      ? Math.max(0, candidate.clearedAtWorldMinutes)
      : null,
    stability: null,
    boulder: active ? boulder : null,
  };
}
