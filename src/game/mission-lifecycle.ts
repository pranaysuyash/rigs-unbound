/**
 * Authoritative mission acceptance and completion boundary.
 *
 * Mission propositions are read models. This module is the only place that
 * turns one into persisted mission state. The focus slot
 * (`GameState.activeMission`) is the single main-class authority; non-main
 * missions may also run concurrently in `GameState.activeSideMissions`.
 * Completion is idempotent because the progression deed is the durable
 * reward marker.
 */

import {
  effectiveProfile,
  type ActiveMissionState,
  type GameState,
  type RigCapability,
} from "./contracts";
import type { MissionProposition } from "./mission-propositions";
import { applyMissionRewards } from "./mission-resolver";
import type { RigId } from "./rig-ids";

export type MissionRuntimeState = ActiveMissionState;

/**
 * Bounds concurrent side missions so the save payload and mission UI stay
 * readable; raise deliberately, never implicitly.
 */
export const MAX_ACTIVE_SIDE_MISSIONS = 3 as const;

export type MissionTransitionFailure =
  | "mission-already-active"
  | "side-mission-limit"
  | "inactive-rig"
  | "missing-capability"
  | "mission-already-completed"
  | "mission-not-active";

export type MissionTransitionResult =
  | { ok: true; state: GameState; diagnostic: string }
  | { ok: false; state: GameState; reason: MissionTransitionFailure };

function hasCompletedDeed(state: GameState, missionId: string): boolean {
  return Object.values(state.progression.journeys).some((journey) =>
    journey.completedDeeds.includes(`mission:${missionId}`),
  );
}

function missingCapability(
  state: GameState,
  rigId: RigId,
  required: readonly RigCapability[],
): RigCapability | null {
  const rig = state.rigs[rigId];
  if (!rig) return required[0] ?? null;
  const profileCapabilities = effectiveProfile(
    rig.id,
    rig.modules,
  ).capabilities;
  return (
    required.find((capability) => !profileCapabilities.includes(capability)) ??
    null
  );
}

/** All in-flight missions: focus slot first, then side missions. */
export function allActiveMissions(
  state: GameState,
): readonly ActiveMissionState[] {
  return state.activeMission
    ? [state.activeMission, ...state.activeSideMissions]
    : [...state.activeSideMissions];
}

/**
 * First in-flight mission with the given binding, focus slot first. The
 * simulation's binding-driven completion hooks (delivery arrival, survey
 * resolution) use this so side missions complete through the same authority
 * as the focus mission.
 */
export function activeMissionMatching(
  state: GameState,
  binding: ActiveMissionState["binding"],
): ActiveMissionState | null {
  return (
    allActiveMissions(state).find((mission) => mission.binding === binding) ??
    null
  );
}

function findActiveMission(
  state: GameState,
  missionId: string,
): ActiveMissionState | null {
  return (
    allActiveMissions(state).find((mission) => mission.id === missionId) ?? null
  );
}

function removeActiveMission(state: GameState, missionId: string): void {
  if (state.activeMission?.id === missionId) {
    state.activeMission = null;
    return;
  }
  state.activeSideMissions = state.activeSideMissions.filter(
    (mission) => mission.id !== missionId,
  );
}

export function acceptMission(
  state: GameState,
  mission: MissionProposition,
  actorId: RigId,
  acceptedAtMs: number,
): MissionTransitionResult {
  if (findActiveMission(state, mission.id) !== null) {
    return { ok: false, state, reason: "mission-already-active" };
  }
  if (actorId !== state.activeRigId) {
    return { ok: false, state, reason: "inactive-rig" };
  }
  if (
    mission.missionClass !== "repeatable" &&
    hasCompletedDeed(state, mission.id)
  ) {
    return { ok: false, state, reason: "mission-already-completed" };
  }
  const missing = missingCapability(
    state,
    actorId,
    mission.requiredCapabilities,
  );
  if (missing !== null) {
    return { ok: false, state, reason: "missing-capability" };
  }

  const focusFree = state.activeMission === null;
  if (!focusFree && mission.missionClass === "main") {
    // One main-class mission at a time; the focus slot is its only home.
    return { ok: false, state, reason: "mission-already-active" };
  }
  if (!focusFree && state.activeSideMissions.length >= MAX_ACTIVE_SIDE_MISSIONS) {
    return { ok: false, state, reason: "side-mission-limit" };
  }

  const activeMission: ActiveMissionState = {
    id: mission.id,
    binding: mission.binding,
    missionClass: mission.missionClass,
    giverId: mission.giverId,
    targetSiteId: mission.targetSiteId,
    waypointIds: [...mission.waypointIds],
    requiredCapabilities: [...mission.requiredCapabilities],
    rewardSalvage: mission.rewardSalvage,
    difficultyLabel: mission.difficultyLabel,
    activeRigId: actorId,
    acceptedAtMs: Math.max(0, acceptedAtMs),
    progressIndex: 0,
  };
  if (focusFree) {
    state.activeMission = activeMission;
  } else {
    state.activeSideMissions = [...state.activeSideMissions, activeMission];
  }
  state.lastDiagnostic = `Mission accepted: ${mission.title}.`;
  return { ok: true, state, diagnostic: state.lastDiagnostic };
}

export function completeMission(
  state: GameState,
  missionId: string,
  completedAtMs: number,
): MissionTransitionResult {
  const active = findActiveMission(state, missionId);
  if (!active) {
    return { ok: false, state, reason: "mission-not-active" };
  }
  if (
    active.missionClass !== "repeatable" &&
    hasCompletedDeed(state, missionId)
  ) {
    removeActiveMission(state, missionId);
    return { ok: false, state, reason: "mission-already-completed" };
  }

  const syntheticMission = {
    id: active.id,
    binding: active.binding,
    missionClass: active.missionClass,
    giverId: active.giverId,
    prerequisites: [],
    title: active.id,
    premise: "",
    briefing: "",
    origin: "",
    destination: active.targetSiteId,
    targetSiteId: active.targetSiteId as MissionProposition["targetSiteId"],
    waypointIds: active.waypointIds as MissionProposition["waypointIds"],
    minInsight: 0,
    requiredCapabilities: active.requiredCapabilities,
    rewardSalvage: active.rewardSalvage,
    difficultyLabel: active.difficultyLabel,
    state: "active" as const,
  } satisfies MissionProposition;

  const rewardResult = applyMissionRewards(
    state,
    state.progression,
    syntheticMission,
    Math.max(1, completedAtMs - active.acceptedAtMs) / 1000,
    active.difficultyLabel !== "standard",
    active.activeRigId,
  );
  Object.assign(state, rewardResult.state);
  state.progression = rewardResult.progression;
  removeActiveMission(state, missionId);
  state.lastDiagnostic = `Mission complete: ${missionId}. +${rewardResult.reward.salvage} salvage.`;
  return { ok: true, state, diagnostic: state.lastDiagnostic };
}

export function failMission(
  state: GameState,
  missionId: string,
  diagnostic: string,
): MissionTransitionResult {
  if (findActiveMission(state, missionId) === null) {
    return { ok: false, state, reason: "mission-not-active" };
  }
  removeActiveMission(state, missionId);
  state.lastDiagnostic = diagnostic;
  return { ok: true, state, diagnostic };
}
