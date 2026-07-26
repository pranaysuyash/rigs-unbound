import { describe, expect, it } from "vitest";
import {
  appendRunRecordEntry,
  createRunRecord,
  MAX_RUN_RECORD_ENTRIES,
  RUN_RECORD_EVENT_VERSION,
  RUN_RECORD_INITIAL_CONTEXT_VERSION,
  RUN_RECORD_SCHEMA_VERSION,
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
      sequence: 0,
      id: "field-02:0",
      eventVersion: RUN_RECORD_EVENT_VERSION,
      kind: "command",
      originDomain: "input",
      replayable: true,
      diagnosticsOnly: false,
      name: "enterWorld",
      elapsedMs: 0,
      payload: { source: "test" },
    });
    expect(verifyRunRecord(record)).toMatchObject({
      ok: true,
      issues: [],
    });
    expect(JSON.parse(snapshotRunRecord(record))).toMatchObject({
      schemaVersion: RUN_RECORD_SCHEMA_VERSION,
      seed: "field-02",
      startedAtMs: 42,
      initialContext: {
        version: RUN_RECORD_INITIAL_CONTEXT_VERSION,
      },
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

  it("assigns ordered envelope metadata without collapsing repeated inputs", () => {
    const record = createRunRecord("field-02", 0);

    appendRunRecordEntry(record, "input", "forward", 0);
    appendRunRecordEntry(record, "input", "forward", 1);
    appendRunRecordEntry(record, "checkpoint", "post-input", 2, {
      tickHash: "h1234",
    });
    appendRunRecordEntry(record, "save", "autosave", 3);

    expect(record.entries.map((entry) => entry.sequence)).toEqual([0, 1, 2, 3]);
    expect(record.entries.map((entry) => entry.id)).toEqual([
      "field-02:0",
      "field-02:1",
      "field-02:2",
      "field-02:3",
    ]);
    expect(record.entries.map((entry) => entry.originDomain)).toEqual([
      "input",
      "input",
      "simulation",
      "storage",
    ]);
    expect(record.entries.map((entry) => entry.replayable)).toEqual([
      true,
      true,
      false,
      false,
    ]);
    expect(verifyRunRecord(record)).toMatchObject({ ok: true, issues: [] });
  });

  it("keeps authoritative outcomes simulation-owned diagnostics", () => {
    const record = createRunRecord("field-02", 0);

    appendRunRecordEntry(record, "command", "primaryAction", 0, {
      source: "test",
    });
    appendRunRecordEntry(record, "event", "primaryActionOutcome", 1, {
      accepted: true,
    });

    expect(record.entries.map((entry) => entry.kind)).toEqual([
      "command",
      "event",
    ]);
    expect(record.entries[1]).toMatchObject({
      originDomain: "simulation",
      replayable: false,
      diagnosticsOnly: true,
    });
    expect(verifyRunRecord(record)).toMatchObject({ ok: true, issues: [] });
  });

  it("marks non-portable commands as diagnostics instead of replay promises", () => {
    const record = createRunRecord("field-02", 0);

    appendRunRecordEntry(record, "command", "placeRig", 0, {
      x: 10,
      z: 20,
    });

    expect(record.entries[0]).toMatchObject({
      originDomain: "input",
      replayable: false,
      diagnosticsOnly: true,
    });
    expect(verifyRunRecord(record)).toMatchObject({ ok: true, issues: [] });
  });

  it("reports a garbage runtime kind without throwing", () => {
    const record = createRunRecord("field-02", 0);
    appendRunRecordEntry(record, "event", "test", 0);
    (record.entries[0] as { kind: string }).kind = "garbage";

    expect(() => verifyRunRecord(record)).not.toThrow();
    expect(verifyRunRecord(record).issues).toContain(
      "Entry 0 has an invalid kind.",
    );
  });

  it("rejects envelope metadata that conflicts with its entry kind", () => {
    const record = createRunRecord("field-02", 0);

    appendRunRecordEntry(record, "event", "primaryActionOutcome", 0);
    record.entries[0]!.originDomain = "input";

    expect(verifyRunRecord(record).issues).toContain(
      "Entry 0 has metadata incompatible with its kind.",
    );
  });

  it("rejects a tampered initial simulation context", () => {
    const record = createRunRecord("field-02", 0);
    record.initialContext.stateHash = "h00000000";

    expect(verifyRunRecord(record).issues).toContain(
      "Run record initial state hash is invalid.",
    );
  });
});
