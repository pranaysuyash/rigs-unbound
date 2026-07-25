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
