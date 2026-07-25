export type RunRecordKind = "command" | "checkpoint" | "input" | "save";

export interface RunRecordEntry {
  kind: RunRecordKind;
  name: string;
  elapsedMs: number;
  atMs: number;
  payload: Record<string, unknown>;
}

export interface RunRecord {
  schemaVersion: 1;
  seed: string;
  startedAtMs: number;
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

export function createRunRecord(seed: string, startedAtMs: number): RunRecord {
  return {
    schemaVersion: 1,
    seed,
    startedAtMs,
    droppedEntries: 0,
    entries: [],
  };
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

  record.entries.push({
    kind,
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

  if (record.schemaVersion !== 1) {
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
  if (!Number.isInteger(record.droppedEntries) || record.droppedEntries < 0) {
    issues.push("Run record dropped entry count is invalid.");
  }

  let previousElapsed = -1;
  for (const [index, entry] of record.entries.entries()) {
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
