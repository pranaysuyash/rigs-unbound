/**
 * Harvest slice: cultivation progress must survive persistence.
 *
 * These tests exist because cultivation dedup was originally held in a
 * `Set` hung off the state object with an `as any` cast. That works in memory
 * and fails at every JSON boundary the kernel has — save (`storage.ts`),
 * replay cloning (`run-record.ts`), and determinism hashing
 * (`replay-validator.ts`) — because `JSON.stringify(new Set())` is `{}`.
 *
 * The falsifier for "cultivation progress is real state": round-trip the game
 * state through JSON and re-run the same cultivation input. If the row count
 * moves, the dedup memory did not survive.
 */

import { describe, expect, it } from "vitest";
import {
  CULTIVATION_CELLS_PER_ROW,
  MAX_CULTIVATED_CELLS,
  SAVE_SCHEMA_VERSION,
  cultivatedRowsFor,
} from "./contracts";
import { createInitialState, recoverState } from "./state";

describe("cultivatedRowsFor", () => {
  it("needs a full cell quota before a row counts", () => {
    expect(cultivatedRowsFor(0, 4)).toBe(0);
    expect(cultivatedRowsFor(CULTIVATION_CELLS_PER_ROW - 1, 4)).toBe(0);
    expect(cultivatedRowsFor(CULTIVATION_CELLS_PER_ROW, 4)).toBe(1);
    expect(cultivatedRowsFor(CULTIVATION_CELLS_PER_ROW * 3, 4)).toBe(3);
  });

  it("never reports more rows than the field holds", () => {
    expect(cultivatedRowsFor(CULTIVATION_CELLS_PER_ROW * 99, 4)).toBe(4);
  });
});

describe("harvest state persistence", () => {
  function cultivate(cellCount: number) {
    const state = createInitialState();
    for (let i = 0; i < cellCount; i += 1) {
      state.harvest.cultivatedCells.push(`${i},0`);
    }
    state.harvest.cultivatedRows = cultivatedRowsFor(
      state.harvest.cultivatedCells.length,
      state.harvest.totalRows,
    );
    return state;
  }

  function roundTrip(state: ReturnType<typeof createInitialState>) {
    const recovered = recoverState(JSON.parse(JSON.stringify(state)));
    expect(recovered).not.toBeNull();
    return recovered!;
  }

  it("starts with no cultivated ground", () => {
    const state = createInitialState();
    expect(state.harvest.cultivatedCells).toEqual([]);
    expect(state.harvest.cultivatedRows).toBe(0);
  });

  it("carries the remembered cells across a JSON round trip", () => {
    const state = cultivate(CULTIVATION_CELLS_PER_ROW * 2);
    const recovered = roundTrip(state);

    expect(recovered.harvest.cultivatedCells).toHaveLength(
      CULTIVATION_CELLS_PER_ROW * 2,
    );
    expect(recovered.harvest.cultivatedRows).toBe(2);
  });

  it("does not let a reload re-credit ground already ploughed", () => {
    // The original defect: cultivatedRows persisted but the dedup memory did
    // not, so replaying the same furrows after a reload inflated the count.
    const state = cultivate(CULTIVATION_CELLS_PER_ROW * 2);
    const recovered = roundTrip(state);

    const before = recovered.harvest.cultivatedRows;
    for (const key of [...recovered.harvest.cultivatedCells]) {
      if (!recovered.harvest.cultivatedCells.includes(key)) {
        recovered.harvest.cultivatedCells.push(key);
      }
    }
    recovered.harvest.cultivatedRows = cultivatedRowsFor(
      recovered.harvest.cultivatedCells.length,
      recovered.harvest.totalRows,
    );

    expect(recovered.harvest.cultivatedRows).toBe(before);
  });

  it("recomputes the row count from the cells rather than trusting it", () => {
    const state = cultivate(CULTIVATION_CELLS_PER_ROW);
    const payload = JSON.parse(JSON.stringify(state));
    // A hand-edited or older-build save claiming four rows with one row of
    // remembered ground must not restore the inflated number.
    payload.harvest.cultivatedRows = 4;

    const recovered = recoverState(payload);
    expect(recovered?.harvest.cultivatedRows).toBe(1);
  });

  it("drops malformed and duplicate cell keys without losing the save", () => {
    const state = createInitialState();
    const payload = JSON.parse(JSON.stringify(state));
    payload.harvest.cultivatedCells = [
      "1,2",
      "1,2", // duplicate
      "-3,-4",
      "not-a-key",
      42,
      null,
      "5,6,7",
    ];

    const recovered = recoverState(payload);
    expect(recovered).not.toBeNull();
    expect(recovered!.harvest.cultivatedCells).toEqual(["1,2", "-3,-4"]);
  });

  it("survives a harvest block that is missing or the wrong type", () => {
    const state = createInitialState();
    for (const bad of [undefined, null, "harvest", 7, []]) {
      const payload = JSON.parse(JSON.stringify(state));
      payload.harvest = bad;
      const recovered = recoverState(payload);
      expect(recovered).not.toBeNull();
      expect(recovered!.harvest.cultivatedRows).toBe(0);
      expect(recovered!.harvest.cultivatedCells).toEqual([]);
    }
  });

  it("bounds the remembered cells so a long session cannot grow the save", () => {
    const state = createInitialState();
    const payload = JSON.parse(JSON.stringify(state));
    payload.harvest.cultivatedCells = Array.from(
      { length: MAX_CULTIVATED_CELLS + 500 },
      (_, i) => `${i},0`,
    );

    const recovered = recoverState(payload);
    expect(recovered!.harvest.cultivatedCells).toHaveLength(
      MAX_CULTIVATED_CELLS,
    );
  });

  it("keeps the delivered and storm flags across recovery", () => {
    const state = cultivate(CULTIVATION_CELLS_PER_ROW);
    state.harvest.delivered = true;
    state.harvest.stormArrived = true;
    state.harvest.stormAtMinutes = 999;

    const recovered = roundTrip(state);
    expect(recovered.harvest.delivered).toBe(true);
    expect(recovered.harvest.stormArrived).toBe(true);
    expect(recovered.harvest.stormAtMinutes).toBe(999);
  });
});

describe("save schema migration", () => {
  it("recovers a save written at the previous schema version", () => {
    const state = createInitialState();
    const payload = JSON.parse(JSON.stringify(state));
    payload.schemaVersion = SAVE_SCHEMA_VERSION - 1;

    expect(recoverState(payload)).not.toBeNull();
  });

  it("still recovers a v27 save after v28 became the previous version", () => {
    // Bumping SAVE_SCHEMA_VERSION shifts PREVIOUS_SAVE_SCHEMA_VERSION forward.
    // Without an explicit v27 branch the save falls through every case and
    // recovers as null, which the load path reads as "no save at all".
    const state = createInitialState();
    const payload = JSON.parse(JSON.stringify(state));
    payload.schemaVersion = 27;

    expect(recoverState(payload)).not.toBeNull();
  });
});
