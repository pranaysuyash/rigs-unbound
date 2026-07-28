/**
 * The authoritative fleet-recovery transition.
 *
 * Follows the shape already established by `unbound-passage.ts`:
 *
 *   command -> validation -> next state -> accepted/rejected -> event -> reason
 *
 * Nothing here reads the world directly. Every gate is decided by
 * `deriveFleetRecoveryAssessment()`, so the board, the radial wheel, the HUD,
 * and this command can never disagree about whether a recovery is possible —
 * they are all reading one assessment.
 *
 * A rejected command is a first-class outcome with a player-readable reason. It
 * is not an error and it must not throw: "you cannot do this yet, here is why"
 * is the most common thing a logistics operation says.
 */

import type { GameState, RigId } from "./contracts";
import type { GameWorld } from "./gameworld";
import {
  deriveFleetRecoveryAssessment,
  RECOVERY_RESTORED_CONDITION,
  type FleetRecoveryAssessment,
  type RecoveryBlockReason,
} from "./fleet-recovery-assessment";
import type { WeatherState } from "./weather";

export interface FleetRecoveryCommand {
  type: "recover-rig";
  /** The rig doing the pulling. Must match the assessed support rig. */
  supportRigId: RigId;
  /** The disabled rig being recovered. */
  strandedRigId: RigId;
}

export interface FleetRecoveryEvent {
  type: "fleet-recovery-completed";
  strandedRigId: RigId;
  supportRigId: RigId;
  /** Condition the recovered rig was restored to. */
  restoredCondition: number;
  /** Weather at the moment of recovery, recorded so the story survives. */
  weatherPhase: WeatherState["phase"];
  /** Ground saturation at the moment of recovery. */
  soilMoisture: number;
  tick: number;
}

export type FleetRecoveryTransition =
  | {
      accepted: true;
      event: FleetRecoveryEvent;
      reason: string;
      blockedBy: null;
    }
  | {
      accepted: false;
      event: null;
      reason: string;
      blockedBy: RecoveryBlockReason | "wrong-support-rig" | "wrong-stranded-rig";
    };

function reject(
  reason: string,
  blockedBy: RecoveryBlockReason | "wrong-support-rig" | "wrong-stranded-rig",
): FleetRecoveryTransition {
  return { accepted: false, event: null, reason, blockedBy };
}

/**
 * Validate and resolve a recovery command.
 *
 * **Pure.** It decides what should happen and returns the event; it does not
 * mutate `state`. `applyFleetRecovery()` is the only place the mutation lands,
 * which keeps this callable from a read-only surface that wants to know whether
 * the button should be enabled.
 */
export function resolveFleetRecoveryCommand(
  state: GameState,
  world: GameWorld,
  weather: WeatherState,
  command: FleetRecoveryCommand,
  tick: number,
): FleetRecoveryTransition {
  if (!Number.isInteger(tick) || tick < 0) {
    return reject(
      "Recovery events require a non-negative integer tick.",
      "no-disabled-rig",
    );
  }

  const assessment = deriveFleetRecoveryAssessment(state, world, weather);

  if (assessment.status === "none" || assessment.strandedRigId === null) {
    return reject("No rig is disabled.", "no-disabled-rig");
  }
  if (command.strandedRigId !== assessment.strandedRigId) {
    return reject(
      `${command.strandedRigId} is not the rig awaiting recovery.`,
      "wrong-stranded-rig",
    );
  }
  if (assessment.status !== "available") {
    return reject(
      assessment.reasons[0] ?? "Recovery is not possible yet.",
      assessment.blockedBy ?? "no-support-rig",
    );
  }
  if (command.supportRigId !== assessment.supportRigId) {
    return reject(
      `${command.supportRigId} is not in position to take the strap.`,
      "wrong-support-rig",
    );
  }

  return {
    accepted: true,
    reason: `${command.supportRigId} recovered ${command.strandedRigId}.`,
    blockedBy: null,
    event: {
      type: "fleet-recovery-completed",
      strandedRigId: command.strandedRigId,
      supportRigId: command.supportRigId,
      restoredCondition: RECOVERY_RESTORED_CONDITION,
      weatherPhase: weather.phase,
      soilMoisture: weather.soilMoisture,
      tick,
    },
  };
}

/**
 * Apply an accepted recovery to canonical state.
 *
 * Separated from resolution so that mutation happens in exactly one place, and
 * so a caller can ask "would this be accepted?" without changing anything.
 *
 * The recovered rig comes back **mobile but barely** — a recovery is a story
 * about a machine that survived, not a reset to full condition.
 */
export function applyFleetRecovery(
  state: GameState,
  event: FleetRecoveryEvent,
): void {
  const stranded = state.rigs[event.strandedRigId];
  stranded.condition = event.restoredCondition;
  stranded.speed = 0;

  state.lastDiagnostic =
    event.weatherPhase === "rain" || event.weatherPhase === "storm"
      ? `${event.supportRigId} dragged ${event.strandedRigId} clear through the wet. Condition ${event.restoredCondition}%.`
      : `${event.supportRigId} recovered ${event.strandedRigId}. Condition ${event.restoredCondition}%.`;
}

/** Read-only projection for boards, wheels, and acceptance output. */
export function fleetRecoveryProjection(
  assessment: FleetRecoveryAssessment,
): {
  id: "fleet-recovery";
  label: string;
  status: "available" | "conditional" | "blocked" | "none";
  reasons: readonly string[];
  command: FleetRecoveryCommand | null;
} {
  const command: FleetRecoveryCommand | null =
    assessment.status === "available" &&
    assessment.supportRigId !== null &&
    assessment.strandedRigId !== null
      ? {
          type: "recover-rig",
          supportRigId: assessment.supportRigId,
          strandedRigId: assessment.strandedRigId,
        }
      : null;

  return {
    id: "fleet-recovery",
    label:
      assessment.strandedRigId === null
        ? "No recovery needed"
        : `Recover ${assessment.strandedRigId}`,
    status: assessment.status,
    reasons: assessment.reasons,
    command,
  };
}
