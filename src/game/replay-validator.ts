import {
  CAMERA_MODES,
  FIXED_STEP_SECONDS,
  IDLE_INPUT,
  MODULE_IDS,
  RIG_IDS,
  type CameraMode,
  type InputFrame,
  type ModuleId,
  type RigId,
  type TapAction,
} from "./contracts";
import { GameWorld } from "./gameworld";
import {
  advanceGame,
  createInitialState,
  cycleCamera,
  cyclePhase,
  installModule,
  performPrimaryAction,
  publicState,
  repairRig,
  selectActiveRig,
  selectCamera,
  settleWorld,
  recoverState,
  stepGame,
  switchActiveRig,
  toggleBladeMode,
  toggleMap,
  togglePause,
  winchRecover,
} from "./state";
import {
  stableHashText,
  verifyRunRecord,
  type RunRecordInitialContext,
  type RunRecord,
  type RunRecordEntry,
} from "./run-record";

/** Prevent a malformed record from consuming an unbounded local validation run. */
export const MAX_REPLAY_ADVANCE_MS = 120_000;
const FIXED_STEP_MS = FIXED_STEP_SECONDS * 1000;
/** Floating elapsed clocks may drift by tiny fractions while still naming an exact tick. */
const FIXED_STEP_ALIGNMENT_TOLERANCE_MS = 0.001;

export type ReplayValidationStatus =
  | "verified"
  | "invalid-record"
  | "invalid-payload"
  | "unsupported-entry"
  | "truncated-record"
  | "diverged";

export interface ReplayValidationIssue {
  sequence: number | null;
  code: ReplayValidationStatus;
  message: string;
  details?: Record<string, unknown>;
}

export interface ReplayValidationResult {
  ok: boolean;
  status: ReplayValidationStatus;
  issues: ReplayValidationIssue[];
  commandsApplied: number;
  inputsApplied: number;
  checkpointsVerified: number;
  finalTickHash: string | null;
}

interface ReplaySession {
  state: ReturnType<typeof createInitialState>;
  world: GameWorld;
  input: InputFrame;
}

function result(
  status: ReplayValidationStatus,
  issues: ReplayValidationIssue[],
  commandsApplied: number,
  inputsApplied: number,
  checkpointsVerified: number,
  session: ReplaySession | null,
): ReplayValidationResult {
  return {
    ok: status === "verified",
    status,
    issues,
    commandsApplied,
    inputsApplied,
    checkpointsVerified,
    finalTickHash: session ? replayCheckpointHash(session) : null,
  };
}

function issue(
  sequence: number | null,
  code: ReplayValidationStatus,
  message: string,
  details?: Record<string, unknown>,
): ReplayValidationIssue {
  return details === undefined
    ? { sequence, code, message }
    : { sequence, code, message, details };
}

function compactValue(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return String(value);
  return serialized.length > 120
    ? `${serialized.slice(0, 117)}...`
    : serialized;
}

function checkpointDifferencePaths(
  expected: unknown,
  actual: unknown,
  path = "$",
  differences: string[] = [],
): string[] {
  if (differences.length >= 16 || Object.is(expected, actual)) {
    return differences;
  }
  if (
    expected === null ||
    actual === null ||
    typeof expected !== "object" ||
    typeof actual !== "object" ||
    Array.isArray(expected) !== Array.isArray(actual)
  ) {
    differences.push(
      `${path}: expected ${compactValue(expected)}, received ${compactValue(actual)}`,
    );
    return differences;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      differences.push(
        `${path}.length: expected ${expected.length}, received ${actual.length}`,
      );
    }
    const length = Math.min(expected.length, actual.length);
    for (let index = 0; index < length; index += 1) {
      checkpointDifferencePaths(
        expected[index],
        actual[index],
        `${path}[${index}]`,
        differences,
      );
      if (differences.length >= 16) break;
    }
    return differences;
  }

  const expectedRecord = expected as Record<string, unknown>;
  const actualRecord = actual as Record<string, unknown>;
  const keys = Array.from(
    new Set([...Object.keys(expectedRecord), ...Object.keys(actualRecord)]),
  ).sort();
  for (const key of keys) {
    if (!(key in expectedRecord) || !(key in actualRecord)) {
      differences.push(
        `${path}.${key}: expected ${compactValue(expectedRecord[key])}, received ${compactValue(actualRecord[key])}`,
      );
    } else {
      checkpointDifferencePaths(
        expectedRecord[key],
        actualRecord[key],
        `${path}.${key}`,
        differences,
      );
    }
    if (differences.length >= 16) break;
  }
  return differences;
}

function isInputFrame(value: unknown): value is InputFrame {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<InputFrame>;
  return (
    typeof input.accelerate === "boolean" &&
    typeof input.brake === "boolean" &&
    typeof input.steerLeft === "boolean" &&
    typeof input.steerRight === "boolean"
  );
}

function inputPayload(entry: RunRecordEntry): InputFrame | null {
  const input = entry.payload.input;
  return isInputFrame(input) ? input : null;
}

function finiteMilliseconds(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

function replayToElapsed(
  session: ReplaySession,
  targetElapsedMs: number,
): string | null {
  const deltaMs = targetElapsedMs - session.state.elapsedMs;
  if (deltaMs < -0.001) {
    return "Replay entry elapsed time precedes reconstructed simulation time.";
  }
  if (deltaMs > MAX_REPLAY_ADVANCE_MS) {
    return `Replay timing gap exceeds ${MAX_REPLAY_ADVANCE_MS} ms.`;
  }

  const alignedStepCount = Math.round(deltaMs / FIXED_STEP_MS);
  if (
    Math.abs(deltaMs - alignedStepCount * FIXED_STEP_MS) <=
    FIXED_STEP_ALIGNMENT_TOLERANCE_MS
  ) {
    for (let step = 0; step < alignedStepCount; step += 1) {
      stepGame(session.state, session.world, session.input, FIXED_STEP_SECONDS);
    }
    return null;
  }

  let remainingSeconds = Math.max(0, deltaMs) / 1000;
  while (remainingSeconds > 0) {
    const seconds = Math.min(FIXED_STEP_SECONDS, remainingSeconds);
    stepGame(session.state, session.world, session.input, seconds);
    remainingSeconds -= seconds;
  }
  return null;
}

function replayCommand(
  session: ReplaySession,
  entry: RunRecordEntry,
): string | null {
  switch (entry.name) {
    case "advanceTime": {
      const milliseconds = finiteMilliseconds(entry.payload.milliseconds);
      if (milliseconds === null) {
        return "advanceTime command requires positive finite milliseconds.";
      }
      if (milliseconds > MAX_REPLAY_ADVANCE_MS) {
        return `advanceTime exceeds ${MAX_REPLAY_ADVANCE_MS} ms.`;
      }
      advanceGame(session.state, session.world, milliseconds);
      return null;
    }
    case "selectRig": {
      const rigId = entry.payload.rigId;
      if (typeof rigId !== "string" || !RIG_IDS.includes(rigId as RigId)) {
        return "selectRig command requires a known rigId.";
      }
      selectActiveRig(session.state, rigId as RigId);
      return null;
    }
    case "selectCamera": {
      const cameraMode = entry.payload.cameraMode;
      if (
        typeof cameraMode !== "string" ||
        !CAMERA_MODES.includes(cameraMode as CameraMode)
      ) {
        return "selectCamera command requires a known cameraMode.";
      }
      selectCamera(session.state, cameraMode as CameraMode);
      return null;
    }
    case "installModule": {
      const moduleId = entry.payload.moduleId;
      if (
        typeof moduleId !== "string" ||
        !MODULE_IDS.includes(moduleId as ModuleId)
      ) {
        return "installModule command requires a known moduleId.";
      }
      installModule(session.state, session.world, moduleId as ModuleId);
      return null;
    }
    case "primaryAction":
      performPrimaryAction(session.state, session.world);
      return null;
    case "tap": {
      const action = entry.payload.action;
      if (typeof action !== "string") {
        return "tap command requires a named action.";
      }
      switch (action as TapAction) {
        case "switchRig":
          switchActiveRig(session.state);
          return null;
        case "camera":
          cycleCamera(session.state);
          return null;
        case "phase":
          cyclePhase(session.state);
          return null;
        case "pause":
          togglePause(session.state);
          return null;
        case "map":
          toggleMap(session.state);
          return null;
        case "blade":
          toggleBladeMode(session.state);
          return null;
        case "recover":
          winchRecover(session.state, session.world);
          return null;
        case "primary":
          return "primary tap must be represented by primaryAction.";
        default:
          return `tap command has an unsupported action '${action}'.`;
      }
    }
    case "enterWorld":
      return null;
    case "repairRig":
      repairRig(session.state);
      return null;
    case "reset":
      session.world.reset();
      session.state = createInitialState(session.state.seed);
      settleWorld(session.state, session.world);
      return null;
    default:
      return `Replay does not support command '${entry.name}'.`;
  }
}

function sessionFromInitialContext(
  context: RunRecordInitialContext,
): ReplaySession | null {
  const state = recoverState(context.state);
  if (!state) return null;
  const world = new GameWorld(state.seed);
  world.restore(context.worldMemory);
  return { state, world, input: { ...IDLE_INPUT } };
}

export function replayCheckpointHash(session: ReplaySession): string {
  return stableHashText(
    JSON.stringify(publicState(session.state, session.world)),
  );
}

/**
 * Validates only the deliberately portable deterministic subset of a run record.
 * It has no renderer, DOM, storage, or network dependency and never treats
 * simulation events or diagnostics as replay input. Semantic primary actions
 * are deliberately separate from UI tap dispatch.
 */
export function validateDeterministicReplay(
  record: RunRecord,
): ReplayValidationResult {
  const structural = verifyRunRecord(record);
  if (!structural.ok) {
    return result(
      "invalid-record",
      structural.issues.map((message) =>
        issue(null, "invalid-record", message),
      ),
      0,
      0,
      0,
      null,
    );
  }

  if (record.droppedEntries > 0) {
    return result(
      "truncated-record",
      [
        issue(
          null,
          "truncated-record",
          `Run record dropped ${record.droppedEntries} replay entr${
            record.droppedEntries === 1 ? "y" : "ies"
          } and cannot replay from its captured initial context.`,
        ),
      ],
      0,
      0,
      0,
      null,
    );
  }

  const session = sessionFromInitialContext(record.initialContext);
  if (!session) {
    return result(
      "invalid-record",
      [
        issue(
          null,
          "invalid-record",
          "Run record initial context could not be recovered.",
        ),
      ],
      0,
      0,
      0,
      null,
    );
  }
  let commandsApplied = 0;
  let inputsApplied = 0;
  let checkpointsVerified = 0;

  for (const entry of record.entries) {
    if (entry.replayClass === "non-replayable") {
      return result(
        "unsupported-entry",
        [
          issue(
            entry.sequence,
            "unsupported-entry",
            `Run contains non-replayable ${entry.kind} '${entry.name}'.`,
          ),
        ],
        commandsApplied,
        inputsApplied,
        checkpointsVerified,
        session,
      );
    }
    if (entry.kind === "command" && entry.replayClass === "diagnostic") {
      continue;
    }
    const timingIssue = replayToElapsed(session, entry.elapsedMs);
    if (timingIssue) {
      return result(
        "invalid-payload",
        [issue(entry.sequence, "invalid-payload", timingIssue)],
        commandsApplied,
        inputsApplied,
        checkpointsVerified,
        session,
      );
    }

    if (entry.kind === "input") {
      if (entry.name !== "sample") {
        return result(
          "unsupported-entry",
          [
            issue(
              entry.sequence,
              "unsupported-entry",
              `Replay does not support input '${entry.name}'.`,
            ),
          ],
          commandsApplied,
          inputsApplied,
          checkpointsVerified,
          session,
        );
      }
      const input = inputPayload(entry);
      if (!input) {
        return result(
          "invalid-payload",
          [
            issue(
              entry.sequence,
              "invalid-payload",
              "Input sample requires a complete boolean input frame.",
            ),
          ],
          commandsApplied,
          inputsApplied,
          checkpointsVerified,
          session,
        );
      }
      session.input = { ...input };
      inputsApplied += 1;
      continue;
    }

    if (entry.kind === "command") {
      const commandIssue = replayCommand(session, entry);
      if (commandIssue) {
        const status = commandIssue.startsWith("Replay does not support")
          ? "unsupported-entry"
          : "invalid-payload";
        return result(
          status,
          [issue(entry.sequence, status, commandIssue)],
          commandsApplied,
          inputsApplied,
          checkpointsVerified,
          session,
        );
      }
      commandsApplied += 1;
      continue;
    }

    if (entry.kind === "checkpoint") {
      const expectedHash = entry.payload.tickHash;
      const actualState = publicState(session.state, session.world);
      const actualHash = stableHashText(JSON.stringify(actualState));
      if (expectedHash !== actualHash) {
        const expectedState = entry.payload.state;
        const differences =
          expectedState && typeof expectedState === "object"
            ? checkpointDifferencePaths(expectedState, actualState)
            : [];
        return result(
          "diverged",
          [
            issue(
              entry.sequence,
              "diverged",
              `Checkpoint '${entry.name}' diverged: expected ${String(expectedHash)}, received ${actualHash}.`,
              differences.length > 0 ? { differences } : undefined,
            ),
          ],
          commandsApplied,
          inputsApplied,
          checkpointsVerified,
          session,
        );
      }
      checkpointsVerified += 1;
    }
  }

  return result(
    "verified",
    [],
    commandsApplied,
    inputsApplied,
    checkpointsVerified,
    session,
  );
}
