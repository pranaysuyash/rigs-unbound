import type { GameState } from "./contracts";
import { GameWorld, type WorldMemoryRecord } from "./gameworld";
import { createInitialState } from "./state";

export type RunRecordKind =
  "command" | "checkpoint" | "event" | "input" | "load" | "save";

export type RunRecordOriginDomain = "input" | "simulation" | "storage";

export type RunRecordReplayClass =
  "supported" | "diagnostic" | "non-replayable";

export const RUN_RECORD_SCHEMA_VERSION = 4;
export const RUN_RECORD_EVENT_VERSION = 1;
export const RUN_RECORD_INITIAL_CONTEXT_VERSION = 1;

export interface RunRecordEntry {
  /** Monotonic across retained and dropped entries for this in-memory record. */
  sequence: number;
  /** Stable identifier for cross-referencing a recorded outcome. */
  id: string;
  /** Version of the shared event-envelope fields below. */
  eventVersion: typeof RUN_RECORD_EVENT_VERSION;
  kind: RunRecordKind;
  originDomain: RunRecordOriginDomain;
  /** True only when the entry can participate in deterministic replay input. */
  replayable: boolean;
  /** True for observability anchors that never mutate replay state. */
  diagnosticsOnly: boolean;
  /**
   * Honest replay admission:
   * - supported entries reconstruct deterministic state;
   * - diagnostic entries are observations and may be ignored;
   * - non-replayable entries can change the run but cannot be reconstructed.
   */
  replayClass: RunRecordReplayClass;
  name: string;
  elapsedMs: number;
  atMs: number;
  payload: Record<string, unknown>;
}

/** Immutable simulation baseline required to replay a non-fresh local session. */
export interface RunRecordInitialContext {
  version: typeof RUN_RECORD_INITIAL_CONTEXT_VERSION;
  state: GameState;
  worldMemory: WorldMemoryRecord;
  stateHash: string;
  worldMemoryHash: string;
}

export interface RunRecord {
  schemaVersion: typeof RUN_RECORD_SCHEMA_VERSION;
  seed: string;
  startedAtMs: number;
  initialContext: RunRecordInitialContext;
  droppedEntries: number;
  entries: RunRecordEntry[];
}

export interface RunRecordVerification {
  ok: boolean;
  issues: string[];
}

export const MAX_RUN_RECORD_ENTRIES = 4096;
const RUN_RECORD_TRIM_BATCH = 512;

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

export function stableHashText(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `h${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createRunRecordInitialContext(
  state: GameState,
  world: GameWorld,
): RunRecordInitialContext {
  const stateSnapshot = cloneJson(state);
  const worldMemory = cloneJson(world.snapshot());
  return {
    version: RUN_RECORD_INITIAL_CONTEXT_VERSION,
    state: stateSnapshot,
    worldMemory,
    stateHash: stableHashText(JSON.stringify(stateSnapshot)),
    worldMemoryHash: stableHashText(JSON.stringify(worldMemory)),
  };
}

export function createRunRecord(
  seed: string,
  startedAtMs: number,
  initialContext = createRunRecordInitialContext(
    createInitialState(seed),
    new GameWorld(seed),
  ),
): RunRecord {
  return {
    schemaVersion: RUN_RECORD_SCHEMA_VERSION,
    seed,
    startedAtMs,
    initialContext,
    droppedEntries: 0,
    entries: [],
  };
}

const REPLAYABLE_COMMAND_NAMES = new Set([
  "advanceTime",
  "selectRig",
  "selectCamera",
  "installModule",
  "primaryAction",
  "tap",
  "enterWorld",
  "repairRig",
  "reset",
  "rig-tool",
]);

export function isReplayableCommandName(name: string): boolean {
  return REPLAYABLE_COMMAND_NAMES.has(name);
}

const DIAGNOSTIC_COMMAND_NAMES = new Set(["setAcceptanceManualStepping"]);

function eventMetadata(
  kind: RunRecordKind,
  name: string,
): Pick<
  RunRecordEntry,
  "originDomain" | "replayable" | "diagnosticsOnly" | "replayClass"
> {
  switch (kind) {
    case "input": {
      const supported = name === "sample";
      return {
        originDomain: "input",
        replayable: supported,
        diagnosticsOnly: false,
        replayClass: supported ? "supported" : "non-replayable",
      };
    }
    case "command": {
      const supported = isReplayableCommandName(name);
      const diagnostic = DIAGNOSTIC_COMMAND_NAMES.has(name);
      return {
        originDomain: "input",
        replayable: supported,
        diagnosticsOnly: diagnostic,
        replayClass: supported
          ? "supported"
          : diagnostic
            ? "diagnostic"
            : "non-replayable",
      };
    }
    case "checkpoint":
      return {
        originDomain: "simulation",
        replayable: false,
        diagnosticsOnly: true,
        replayClass: "diagnostic",
      };
    case "event":
      return {
        originDomain: "simulation",
        replayable: false,
        diagnosticsOnly: true,
        replayClass: "diagnostic",
      };
    case "load":
      return {
        originDomain: "storage",
        replayable: false,
        diagnosticsOnly: true,
        replayClass: "diagnostic",
      };
    case "save":
      return {
        originDomain: "storage",
        replayable: false,
        diagnosticsOnly: true,
        replayClass: "diagnostic",
      };
  }
}

export function appendRunRecordEntry(
  record: RunRecord,
  kind: RunRecordKind,
  name: string,
  elapsedMs: number,
  payload: Record<string, unknown> = {},
): void {
  if (record.entries.length >= MAX_RUN_RECORD_ENTRIES) {
    const removedEntries = Math.min(
      RUN_RECORD_TRIM_BATCH,
      record.entries.length,
    );
    record.entries.splice(0, removedEntries);
    record.droppedEntries += removedEntries;
  }

  const sequence = record.droppedEntries + record.entries.length;
  record.entries.push({
    sequence,
    id: `${record.seed}:${sequence}`,
    eventVersion: RUN_RECORD_EVENT_VERSION,
    kind,
    ...eventMetadata(kind, name),
    name,
    elapsedMs: Math.max(0, elapsedMs),
    atMs: Math.round(now()),
    payload,
  });
}

export function snapshotRunRecord(record: RunRecord): string {
  return JSON.stringify(record, null, 2);
}

export function verifyRunRecord(record: RunRecord): RunRecordVerification {
  const issues: string[] = [];

  if (record.schemaVersion !== RUN_RECORD_SCHEMA_VERSION) {
    issues.push(
      `Unexpected run record schema version: ${record.schemaVersion}`,
    );
  }
  if (typeof record.seed !== "string" || record.seed.length === 0) {
    issues.push("Run record seed is missing.");
  }
  if (!Number.isFinite(record.startedAtMs)) {
    issues.push("Run record start time is not finite.");
  }
  const initialContext = record.initialContext;
  if (!initialContext || typeof initialContext !== "object") {
    issues.push("Run record initial context is missing.");
  } else {
    if (initialContext.version !== RUN_RECORD_INITIAL_CONTEXT_VERSION) {
      issues.push("Run record initial context version is unsupported.");
    }
    if (!initialContext.state || typeof initialContext.state !== "object") {
      issues.push("Run record initial state is missing.");
    } else {
      const initialSeed = (initialContext.state as { seed?: unknown }).seed;
      if (initialSeed !== record.seed) {
        issues.push(
          "Run record initial state seed does not match record seed.",
        );
      }
      if (
        initialContext.stateHash !==
        stableHashText(JSON.stringify(initialContext.state))
      ) {
        issues.push("Run record initial state hash is invalid.");
      }
    }
    if (
      !initialContext.worldMemory ||
      typeof initialContext.worldMemory !== "object"
    ) {
      issues.push("Run record initial world memory is missing.");
    } else if (
      initialContext.worldMemoryHash !==
      stableHashText(JSON.stringify(initialContext.worldMemory))
    ) {
      issues.push("Run record initial world-memory hash is invalid.");
    }
  }
  if (!Number.isInteger(record.droppedEntries) || record.droppedEntries < 0) {
    issues.push("Run record dropped entry count is invalid.");
  }

  let previousElapsed = -1;
  let previousSequence = record.droppedEntries - 1;
  for (const [index, entry] of record.entries.entries()) {
    if (!Number.isInteger(entry.sequence) || entry.sequence < 0) {
      issues.push(`Entry ${index} has invalid sequence.`);
    }
    if (entry.sequence <= previousSequence) {
      issues.push(`Entry ${index} sequence did not advance.`);
    }
    previousSequence = entry.sequence;
    if (
      typeof entry.id !== "string" ||
      entry.id !== `${record.seed}:${entry.sequence}`
    ) {
      issues.push(`Entry ${index} has an invalid event id.`);
    }
    if (entry.eventVersion !== RUN_RECORD_EVENT_VERSION) {
      issues.push(`Entry ${index} has an unsupported event version.`);
    }
    if (
      entry.originDomain !== "input" &&
      entry.originDomain !== "simulation" &&
      entry.originDomain !== "storage"
    ) {
      issues.push(`Entry ${index} has an invalid origin domain.`);
    }
    if (
      entry.replayClass !== "supported" &&
      entry.replayClass !== "diagnostic" &&
      entry.replayClass !== "non-replayable"
    ) {
      issues.push(`Entry ${index} has an invalid replay class.`);
    } else if (
      (entry.replayClass === "supported" &&
        (!entry.replayable || entry.diagnosticsOnly)) ||
      (entry.replayClass === "diagnostic" &&
        (entry.replayable || !entry.diagnosticsOnly)) ||
      (entry.replayClass === "non-replayable" &&
        (entry.replayable || entry.diagnosticsOnly))
    ) {
      issues.push(`Entry ${index} has inconsistent replay flags.`);
    }
    if (
      entry.kind !== "command" &&
      entry.kind !== "checkpoint" &&
      entry.kind !== "event" &&
      entry.kind !== "input" &&
      entry.kind !== "load" &&
      entry.kind !== "save"
    ) {
      issues.push(`Entry ${index} has an invalid kind.`);
      continue;
    }
    const expectedMetadata = eventMetadata(entry.kind, entry.name);
    if (
      entry.originDomain !== expectedMetadata.originDomain ||
      entry.replayable !== expectedMetadata.replayable ||
      entry.diagnosticsOnly !== expectedMetadata.diagnosticsOnly ||
      entry.replayClass !== expectedMetadata.replayClass
    ) {
      issues.push(`Entry ${index} has metadata incompatible with its kind.`);
    }
    if (typeof entry.name !== "string" || entry.name.length === 0) {
      issues.push(`Entry ${index} has no name.`);
    }
    if (!Number.isFinite(entry.elapsedMs) || entry.elapsedMs < 0) {
      issues.push(`Entry ${index} has invalid elapsed time.`);
    }
    if (!Number.isFinite(entry.atMs) || entry.atMs < 0) {
      issues.push(`Entry ${index} has invalid timestamp.`);
    }
    if (entry.elapsedMs < previousElapsed) {
      issues.push(`Entry ${index} elapsed time moved backwards.`);
    }
    previousElapsed = entry.elapsedMs;
    if (entry.kind === "checkpoint") {
      if (typeof entry.payload.tickHash !== "string") {
        issues.push(`Checkpoint entry ${index} is missing a tick hash.`);
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}
