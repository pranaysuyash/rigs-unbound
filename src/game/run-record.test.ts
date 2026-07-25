import { describe, expect, it } from "vitest";
import {
  appendRunRecordEntry,
  createRunRecord,
  MAX_RUN_RECORD_ENTRIES,
  stableHashText,
  verifyRunRecord,
  snapshotRunRecord,
} from "./run-record";

describe("run record", () => {
  it("normalizes elapsed time and serializes its versioned contract", () => {
    const record = createRunRecord("field-02", 42);

    appendRunRecordEntry(record, "command", "enterWorld", -10, {
      source: "test",
    });

    expect(record.entries[0]).toMatchObject({
      kind: "command",
      name: "enterWorld",
      elapsedMs: 0,
      payload: { source: "test" },
    });
    expect(verifyRunRecord(record)).toMatchObject({
      ok: true,
      issues: [],
    });
    expect(JSON.parse(snapshotRunRecord(record))).toMatchObject({
      schemaVersion: 1,
      seed: "field-02",
      startedAtMs: 42,
      droppedEntries: 0,
    });
  });

  it("keeps a bounded recent window and reports truncation", () => {
    const record = createRunRecord("field-02", 0);

    for (let index = 0; index < MAX_RUN_RECORD_ENTRIES + 10; index += 1) {
      appendRunRecordEntry(record, "input", `sample-${index}`, index);
    }

    expect(record.entries.length).toBeLessThanOrEqual(MAX_RUN_RECORD_ENTRIES);
    expect(record.droppedEntries).toBeGreaterThan(0);
    expect(record.entries[record.entries.length - 1]?.name).toBe(
      `sample-${MAX_RUN_RECORD_ENTRIES + 9}`,
    );
  });

  it("produces a stable text hash for checkpoint anchors", () => {
    expect(stableHashText("field-02:boot")).toBe(
      stableHashText("field-02:boot"),
    );
    expect(stableHashText("field-02:boot")).not.toBe(
      stableHashText("field-02:step"),
    );
  });

  it("rejects checkpoints without hashes", () => {
    const record = createRunRecord("field-02", 0);

    appendRunRecordEntry(record, "checkpoint", "boot", 0, {
      state: {},
    });

    expect(verifyRunRecord(record)).toMatchObject({
      ok: false,
    });
    expect(verifyRunRecord(record).issues).toContain(
      "Checkpoint entry 0 is missing a tick hash.",
    );
  });
});
