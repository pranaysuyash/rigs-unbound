import { RIG_IDS, type RigCapability, type RigId } from "./contracts";

export const UNBOUND_PASSAGE_SCHEMA_VERSION = 1 as const;
export const UNBOUND_PASSAGE_ID = "unbound-passage-01" as const;

export type PassageLaneId = "grade-and-brace" | "jump-and-scout";
export type PassageStatus = "blocked" | "open" | "recoverable";

export interface PassageLaneDefinition {
  id: PassageLaneId;
  label: string;
  requiredCapability: RigCapability;
  recoveryCapability: RigCapability;
  benefit: string;
}

export const PASSAGE_LANES: Readonly<
  Record<PassageLaneId, PassageLaneDefinition>
> = {
  "grade-and-brace": {
    id: "grade-and-brace",
    label: "Grade and brace the heavy lane",
    requiredCapability: "plough",
    recoveryCapability: "winch",
    benefit: "A compacted heavy route remains usable by another rig.",
  },
  "jump-and-scout": {
    id: "jump-and-scout",
    label: "Jump and scout the narrow lane",
    requiredCapability: "jump",
    recoveryCapability: "winch",
    benefit: "A marked narrow route remains discoverable by another rig.",
  },
} as const;

export interface UnboundPassageState {
  schemaVersion: typeof UNBOUND_PASSAGE_SCHEMA_VERSION;
  passageId: typeof UNBOUND_PASSAGE_ID;
  status: PassageStatus;
  revision: number;
  openedByRigId: RigId | null;
  openedByLaneId: PassageLaneId | null;
  failureCount: number;
  recoveryLaneId: PassageLaneId | null;
  recoveryReason: string | null;
}

export type PassageAttemptOutcome =
  { kind: "opened" } | { kind: "recoverable-failure"; reason: string };

export type UnboundPassageCommand =
  | {
      type: "resolve-attempt";
      actorRigId: RigId;
      actorCapabilities: readonly RigCapability[];
      laneId: PassageLaneId;
      outcome: PassageAttemptOutcome;
    }
  | {
      type: "recover";
      actorRigId: RigId;
      actorCapabilities: readonly RigCapability[];
    };

export type UnboundPassageEvent =
  | {
      type: "passage-opened";
      tick: number;
      passageId: typeof UNBOUND_PASSAGE_ID;
      actorRigId: RigId;
      laneId: PassageLaneId;
      benefit: string;
    }
  | {
      type: "passage-failed";
      tick: number;
      passageId: typeof UNBOUND_PASSAGE_ID;
      actorRigId: RigId;
      laneId: PassageLaneId;
      reason: string;
    }
  | {
      type: "passage-recovered";
      tick: number;
      passageId: typeof UNBOUND_PASSAGE_ID;
      actorRigId: RigId;
    };

export interface PassageTransition {
  accepted: boolean;
  state: UnboundPassageState;
  event: UnboundPassageEvent | null;
  reason: string | null;
}

export interface PassageReadModel {
  status: PassageStatus;
  openedByRigId: RigId | null;
  openedByLaneId: PassageLaneId | null;
  recoveryLaneId: PassageLaneId | null;
  inheritedBenefitAvailable: boolean;
  explanation: string;
}

const PASSAGE_STATUSES: readonly PassageStatus[] = [
  "blocked",
  "open",
  "recoverable",
] as const;

function cloneState(state: UnboundPassageState): UnboundPassageState {
  return { ...state };
}

function hasCapability(
  capabilities: readonly RigCapability[],
  required: RigCapability,
): boolean {
  return capabilities.includes(required);
}

function reject(state: UnboundPassageState, reason: string): PassageTransition {
  return {
    accepted: false,
    state: cloneState(state),
    event: null,
    reason,
  };
}

export function createUnboundPassageState(): UnboundPassageState {
  return {
    schemaVersion: UNBOUND_PASSAGE_SCHEMA_VERSION,
    passageId: UNBOUND_PASSAGE_ID,
    status: "blocked",
    revision: 0,
    openedByRigId: null,
    openedByLaneId: null,
    failureCount: 0,
    recoveryLaneId: null,
    recoveryReason: null,
  };
}

export function eligiblePassageLanes(
  capabilities: readonly RigCapability[],
): PassageLaneDefinition[] {
  return Object.values(PASSAGE_LANES).filter((lane) =>
    hasCapability(capabilities, lane.requiredCapability),
  );
}

export function canUseInheritedPassage(
  state: UnboundPassageState,
  actorRigId: RigId,
): boolean {
  return (
    state.status === "open" &&
    state.openedByRigId !== null &&
    state.openedByRigId !== actorRigId
  );
}

export function readUnboundPassage(
  state: UnboundPassageState,
  actorRigId: RigId,
): PassageReadModel {
  if (state.status === "open") {
    const inherited = canUseInheritedPassage(state, actorRigId);
    return {
      status: state.status,
      openedByRigId: state.openedByRigId,
      openedByLaneId: state.openedByLaneId,
      recoveryLaneId: null,
      inheritedBenefitAvailable: inherited,
      explanation: inherited
        ? "Another rig opened this passage; the inherited route is available."
        : "This rig authored the open passage; another rig can inherit it.",
    };
  }

  if (state.status === "recoverable") {
    return {
      status: state.status,
      openedByRigId: state.openedByRigId,
      openedByLaneId: state.openedByLaneId,
      recoveryLaneId: state.recoveryLaneId,
      inheritedBenefitAvailable: false,
      explanation: `The passage needs recovery before another attempt: ${state.recoveryReason ?? "unknown failure"}.`,
    };
  }

  return {
    status: state.status,
    openedByRigId: null,
    openedByLaneId: null,
    recoveryLaneId: null,
    inheritedBenefitAvailable: false,
    explanation:
      "The destination is blocked; choose a capability-authored lane.",
  };
}

export function resolveUnboundPassageCommand(
  state: UnboundPassageState,
  command: UnboundPassageCommand,
  tick: number,
): PassageTransition {
  if (!Number.isInteger(tick) || tick < 0) {
    return reject(state, "Passage events require a non-negative integer tick.");
  }
  const eventTick = tick;

  if (command.type === "recover") {
    if (state.status !== "recoverable") {
      return reject(state, "The passage does not currently need recovery.");
    }
    const recoveryLane = state.recoveryLaneId;
    if (!recoveryLane) {
      return reject(state, "The failed lane provenance is missing.");
    }
    const recoveryCapability = PASSAGE_LANES[recoveryLane].recoveryCapability;
    if (!hasCapability(command.actorCapabilities, recoveryCapability)) {
      return reject(
        state,
        `Recovery requires the ${recoveryCapability} capability.`,
      );
    }

    const nextState: UnboundPassageState = {
      ...createUnboundPassageState(),
      revision: state.revision + 1,
      failureCount: state.failureCount,
    };
    return {
      accepted: true,
      state: nextState,
      event: {
        type: "passage-recovered",
        tick: eventTick,
        passageId: UNBOUND_PASSAGE_ID,
        actorRigId: command.actorRigId,
      },
      reason: null,
    };
  }

  if (state.status === "open") {
    return reject(state, "The passage is already open.");
  }
  if (state.status === "recoverable") {
    return reject(state, "Recover the passage before attempting another lane.");
  }

  const lane = PASSAGE_LANES[command.laneId];
  if (!lane) {
    return reject(state, "The requested passage lane is unknown.");
  }
  if (!hasCapability(command.actorCapabilities, lane.requiredCapability)) {
    return reject(
      state,
      `This rig cannot use the lane; it requires ${lane.requiredCapability}.`,
    );
  }

  if (command.outcome.kind === "recoverable-failure") {
    const reason = command.outcome.reason.trim();
    if (reason.length === 0) {
      return reject(state, "A recoverable failure must explain its cause.");
    }
    const nextState: UnboundPassageState = {
      ...state,
      status: "recoverable",
      revision: state.revision + 1,
      failureCount: state.failureCount + 1,
      recoveryLaneId: command.laneId,
      recoveryReason: reason,
    };
    return {
      accepted: true,
      state: nextState,
      event: {
        type: "passage-failed",
        tick: eventTick,
        passageId: UNBOUND_PASSAGE_ID,
        actorRigId: command.actorRigId,
        laneId: command.laneId,
        reason,
      },
      reason: null,
    };
  }

  const nextState: UnboundPassageState = {
    ...state,
    status: "open",
    revision: state.revision + 1,
    openedByRigId: command.actorRigId,
    openedByLaneId: command.laneId,
    recoveryLaneId: null,
    recoveryReason: null,
  };
  return {
    accepted: true,
    state: nextState,
    event: {
      type: "passage-opened",
      tick: eventTick,
      passageId: UNBOUND_PASSAGE_ID,
      actorRigId: command.actorRigId,
      laneId: command.laneId,
      benefit: lane.benefit,
    },
    reason: null,
  };
}

export function serializeUnboundPassage(state: UnboundPassageState): string {
  return JSON.stringify(state);
}

export function restoreUnboundPassage(value: unknown): UnboundPassageState {
  if (!value || typeof value !== "object") return createUnboundPassageState();
  const candidate = value as Partial<UnboundPassageState>;
  if (
    candidate.schemaVersion !== UNBOUND_PASSAGE_SCHEMA_VERSION ||
    candidate.passageId !== UNBOUND_PASSAGE_ID ||
    !PASSAGE_STATUSES.includes(candidate.status as PassageStatus) ||
    !Number.isInteger(candidate.revision) ||
    (candidate.revision as number) < 0 ||
    !Number.isInteger(candidate.failureCount) ||
    (candidate.failureCount as number) < 0 ||
    (candidate.openedByRigId !== null &&
      !RIG_IDS.includes(candidate.openedByRigId as RigId)) ||
    (candidate.openedByLaneId !== null &&
      !((candidate.openedByLaneId as PassageLaneId) in PASSAGE_LANES)) ||
    (candidate.recoveryLaneId !== null &&
      !((candidate.recoveryLaneId as PassageLaneId) in PASSAGE_LANES)) ||
    (candidate.recoveryReason !== null &&
      typeof candidate.recoveryReason !== "string")
  ) {
    return createUnboundPassageState();
  }

  const state: UnboundPassageState = {
    schemaVersion: UNBOUND_PASSAGE_SCHEMA_VERSION,
    passageId: UNBOUND_PASSAGE_ID,
    status: candidate.status as PassageStatus,
    revision: candidate.revision as number,
    openedByRigId: candidate.openedByRigId as RigId | null,
    openedByLaneId: candidate.openedByLaneId as PassageLaneId | null,
    failureCount: candidate.failureCount as number,
    recoveryLaneId: candidate.recoveryLaneId as PassageLaneId | null,
    recoveryReason: candidate.recoveryReason as string | null,
  };

  if (
    state.status === "open" &&
    (!state.openedByRigId || !state.openedByLaneId)
  ) {
    return createUnboundPassageState();
  }
  if (
    state.status !== "open" &&
    (state.openedByRigId || state.openedByLaneId)
  ) {
    return createUnboundPassageState();
  }
  if (
    state.status === "recoverable" &&
    (!state.recoveryReason || !state.recoveryLaneId)
  ) {
    return createUnboundPassageState();
  }
  if (
    state.status !== "recoverable" &&
    (state.recoveryReason !== null || state.recoveryLaneId !== null)
  ) {
    return createUnboundPassageState();
  }
  return state;
}
