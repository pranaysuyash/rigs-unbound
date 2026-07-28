/**
 * Authoritative mission acceptance and completion boundary.
 *
 * Mission propositions are read models. This module is the only place that
 * turns one into the persisted `GameState.activeMission` contract. Completion
 * is idempotent because the progression deed is the durable reward marker.
 */

import type { ActiveMissionState, GameState, RigCapability } from "./contracts";
import type { MissionProposition } from "./mission-propositions";
import { applyMissionRewards } from "./mission-resolver";
import type { RigId } from "./rig-ids";

export type MissionRuntimeState = ActiveMissionState;

export type MissionTransitionFailure =
  | "mission-already-active"
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
  const capabilities = state.rigs[rigId]?.modules.length
    ? state.rigs[rigId]!.modules
    : [];
  const profileCapabilities = state.rigs[rigId]
    ? (state.rigs[rigId]!.id === "marsh-skimmer"
        ? ["tow", "survey", "hover"]
        : state.rigs[rigId]!.id === "toy-buggy"
          ? ["tow", "jump"]
          : ["plough", "tow"]) as readonly RigCapability[]
    : [];
  void capabilities;
  return required.find((capability) => !profileCapabilities.includes(capability)) ?? null;
}

export function acceptMission(
  state: GameState,
  mission: MissionProposition,
  actorId: RigId,
  acceptedAtMs: number,
): MissionTransitionResult {
  if (state.activeMission !== null) {
    return { ok: false, state, reason: "mission-already-active" };
  }
  if (actorId !== state.activeRigId) {
    return { ok: false, state, reason: "inactive-rig" };
  }
  if (hasCompletedDeed(state, mission.id)) {
    return { ok: false, state, reason: "mission-already-completed" };
  }
  const missing = missingCapability(state, actorId, mission.requiredCapabilities);
  if (missing !== null) {
    return { ok: false, state, reason: "missing-capability" };
  }

  const activeMission: ActiveMissionState = {
    id: mission.id,
    binding: mission.binding,
    targetSiteId: mission.targetSiteId,
    waypointIds: [...mission.waypointIds],
    requiredCapabilities: [...mission.requiredCapabilities],
    rewardSalvage: mission.rewardSalvage,
    difficultyLabel: mission.difficultyLabel,
    activeRigId: actorId,
    acceptedAtMs: Math.max(0, acceptedAtMs),
    progressIndex: 0,
  };
  state.activeMission = activeMission;
  state.lastDiagnostic = `Mission accepted: ${mission.title}.`;
  return { ok: true, state, diagnostic: state.lastDiagnostic };
}

export function completeMission(
  state: GameState,
  missionId: string,
  completedAtMs: number,
): MissionTransitionResult {
  const active = state.activeMission;
  if (!active || active.id !== missionId) {
    return { ok: false, state, reason: "mission-not-active" };
  }
  if (hasCompletedDeed(state, missionId)) {
    state.activeMission = null;
    return { ok: false, state, reason: "mission-already-completed" };
  }

  const syntheticMission = {
    id: active.id,
    binding: active.binding,
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
  state.activeMission = null;
  state.lastDiagnostic = `Mission complete: ${missionId}. +${rewardResult.reward.salvage} salvage.`;
  return { ok: true, state, diagnostic: state.lastDiagnostic };
}
