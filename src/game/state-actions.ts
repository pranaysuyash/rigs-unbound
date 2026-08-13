/**
 * Isolated Action & Command Handlers for GameState.
 *
 * This module extracts pure player command handlers, dialogue actions,
 * and state transitions from `state.ts` to keep the kernel loop thin and maintainable.
 */

import { type GameState, type RigId } from "./contracts";

export interface RigRenameResult {
  accepted: boolean;
  reason: string;
  fieldName: string | null;
}

/** Rename a player-owned rig instance in state. */
export function renameRigAction(
  state: GameState,
  rigId: RigId,
  requestedName: string,
  source: "workshop" | "opening-naming" = "workshop",
): RigRenameResult {
  const rig = state.rigs[rigId];
  if (!rig) {
    const reason = "Vehicle is not in the fleet.";
    state.lastDiagnostic = reason;
    return { accepted: false, reason, fieldName: null };
  }
  if (
    source === "opening-naming" &&
    (state.openingNaming.status !== "ready" ||
      !isOpeningNamingReady(state, rigId))
  ) {
    const reason =
      "That name is earned after the restored tractor has helped in the field.";
    state.lastDiagnostic = reason;
    return { accepted: false, reason, fieldName: null };
  }

  const fieldName = requestedName.trim().replace(/\s+/g, " ");
  if (
    fieldName.length < 2 ||
    fieldName.length > 28 ||
    /[\u0000-\u001F\u007F]/.test(fieldName)
  ) {
    const reason = "Use a name from 2 to 28 visible characters.";
    state.lastDiagnostic = reason;
    return { accepted: false, reason, fieldName: null };
  }

  const previousName = rig.fieldName;
  rig.fieldName = fieldName;
  if (source === "opening-naming") {
    state.openingNaming.status = "complete";
    state.lastDiagnostic = `The old man smiles. ${previousName} is now known as ${fieldName}.`;
  } else {
    state.lastDiagnostic = `${previousName} is now known as ${fieldName}.`;
  }
  return { accepted: true, reason: state.lastDiagnostic, fieldName };
}

function isOpeningNamingReady(state: GameState, rigId: RigId): boolean {
  return (
    rigId === "utility-tractor" &&
    state.restoration.firstStart &&
    state.furrows.some((furrow) => furrow.rigId === "utility-tractor")
  );
}

/** Complete the Campaign One naming beat through the shared identity transition. */
export function completeOpeningNamingAction(
  state: GameState,
  requestedName: string,
): RigRenameResult {
  return renameRigAction(
    state,
    "utility-tractor",
    requestedName,
    "opening-naming",
  );
}

/** Accept the old man's shelter-for-repair bargain. */
export function acceptArrivalBargainAction(state: GameState): void {
  if (state.arrivalBargain.status === "accepted") return;
  state.arrivalBargain.status = "accepted";
  state.lastDiagnostic =
    "The old man nods. Fix the tractor, earn the bed. The workshop is open.";
}

/** Refuse the old man's bargain without blocking future play. */
export function refuseArrivalBargainAction(state: GameState): void {
  if (state.arrivalBargain.status !== "unseen") return;
  state.arrivalBargain.status = "refused";
  state.lastDiagnostic =
    "The old man shrugs. The offer stands if you change your mind.";
}

/** Toggle headlights operating state for a active vehicle in state. */
export function toggleHeadlightsAction(
  state: GameState,
  rigId?: RigId,
): boolean {
  const targetId = rigId ?? state.activeRigId;
  const rig = state.rigs[targetId];
  if (!rig || rig.condition <= 0) {
    state.lastDiagnostic = "Vehicle is not operational.";
    return false;
  }
  rig.headlightsActive = !rig.headlightsActive;
  state.lastDiagnostic = rig.headlightsActive
    ? `${rig.fieldName} operating headlights activated.`
    : `${rig.fieldName} operating headlights deactivated.`;
  return rig.headlightsActive;
}
