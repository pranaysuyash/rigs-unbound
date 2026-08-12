/**
 * Round-trip integrity for persisted game state.
 *
 * The falsifier this file encodes: `GameState` crosses a JSON boundary three
 * times in the shipped kernel — save (`storage.ts`), replay cloning
 * (`run-record.ts`), and determinism hashing (`replay-validator.ts`). Any
 * state that does not survive `JSON.stringify` is silently destroyed at all
 * three, and the loss is invisible to any test that keeps the state object in
 * memory.
 *
 * A `Set` serialises as `{}`. A `Map` serialises as `{}`. `undefined`,
 * functions, and `NaN` vanish or become `null`. Each of those is a live bug in
 * a deterministic kernel, and the reachability audit cannot see any of them —
 * it answers "can the player reach this module", not "does this module's state
 * survive a round trip".
 *
 * This is a class-level guard rather than a per-field test, so state added
 * later is covered without anyone remembering to write a test for it.
 */

import { describe, expect, it } from "vitest";
import { createInitialState, recoverState, stepGame } from "./state";
import { GameWorld } from "./gameworld";
import { IDLE_INPUT, FIXED_STEP_SECONDS } from "./contracts";

/** A value that JSON cannot represent without silent loss. */
interface Offender {
  path: string;
  kind: string;
}

/**
 * Walk a value and report anything `JSON.stringify` would quietly destroy.
 *
 * Deliberately reports the *path* rather than just the type: a bare "found a
 * Set" is not actionable in a state tree this size.
 */
function findNonSerializable(root: unknown): Offender[] {
  const offenders: Offender[] = [];
  const seen = new WeakSet<object>();

  function walk(value: unknown, path: string): void {
    if (value === null) return;
    const type = typeof value;

    if (type === "function") {
      offenders.push({ path, kind: "function" });
      return;
    }
    if (type === "undefined") {
      offenders.push({ path, kind: "undefined" });
      return;
    }
    if (type === "number" && !Number.isFinite(value as number)) {
      // NaN and +/-Infinity both serialise to null.
      offenders.push({ path, kind: `non-finite number (${String(value)})` });
      return;
    }
    if (type === "bigint" || type === "symbol") {
      offenders.push({ path, kind: type });
      return;
    }
    if (type !== "object") return;

    const obj = value as object;
    if (seen.has(obj)) return;
    seen.add(obj);

    if (obj instanceof Set) {
      offenders.push({ path, kind: "Set (serialises as {})" });
      return;
    }
    if (obj instanceof Map) {
      offenders.push({ path, kind: "Map (serialises as {})" });
      return;
    }
    if (obj instanceof Date) {
      // A Date survives stringify as a string but does not survive recovery as
      // a Date. In a deterministic kernel it is also a wall-clock dependency.
      offenders.push({ path, kind: "Date" });
      return;
    }

    if (Array.isArray(obj)) {
      obj.forEach((entry, i) => walk(entry, `${path}[${i}]`));
      return;
    }

    for (const [key, entry] of Object.entries(obj)) {
      walk(entry, path ? `${path}.${key}` : key);
    }
  }

  walk(root, "");
  return offenders;
}

function describeOffenders(offenders: Offender[]): string {
  return offenders.map((o) => `  ${o.path || "<root>"}: ${o.kind}`).join("\n");
}

/** Advance a fresh game far enough that lazily-created state exists. */
function playedState(steps: number) {
  const state = createInitialState();
  const world = new GameWorld(state.seed);
  for (let i = 0; i < steps; i += 1) {
    stepGame(state, world, IDLE_INPUT, FIXED_STEP_SECONDS);
  }
  return state;
}

describe("state survives the JSON boundary", () => {
  it("holds nothing JSON would destroy at creation", () => {
    const offenders = findNonSerializable(createInitialState());
    expect(
      offenders,
      `Non-serialisable state found:\n${describeOffenders(offenders)}`,
    ).toEqual([]);
  });

  it("holds nothing JSON would destroy after simulation", () => {
    // Lazily-created state is the dangerous case: the original
    // `_cultivatedCells` Set did not exist until the player ploughed, so a
    // creation-time check alone would have passed while the bug was live.
    const offenders = findNonSerializable(playedState(600));
    expect(
      offenders,
      `Non-serialisable state found after stepping:\n${describeOffenders(offenders)}`,
    ).toEqual([]);
  });

  it("recovers to a value that round-trips identically", () => {
    // Recovery must be a fixed point: recover(save(recover(save(x)))) must
    // equal recover(save(x)). If it is not, some field is being reshaped on
    // every load and the save is drifting.
    const state = playedState(600);
    const once = recoverState(JSON.parse(JSON.stringify(state)));
    expect(once).not.toBeNull();
    const twice = recoverState(JSON.parse(JSON.stringify(once)));

    expect(JSON.stringify(twice)).toBe(JSON.stringify(once));
  });

  it("does not silently drop contracted state on recovery", () => {
    // Every top-level key present before a save must be present after. A key
    // that vanishes is progress the player loses without being told.
    const state = playedState(600);
    const recovered = recoverState(JSON.parse(JSON.stringify(state)));
    expect(recovered).not.toBeNull();

    const before = Object.keys(state).sort();
    const after = Object.keys(recovered!).sort();
    expect(after).toEqual(before);
  });
});

describe("the guard itself", () => {
  // A detector that cannot fail is not a detector. These pin the walker.
  // Asserting the whole array rather than `[0]` is deliberate: indexing pins
  // only that *an* offender was found, so it passes whether the walker reports
  // one or fifty. Matching the full result pins the count and the path too.
  it("finds a Set, a Map, and a nested offender", () => {
    expect(findNonSerializable({ a: new Set([1]) })).toEqual([
      { path: "a", kind: expect.stringContaining("Set") },
    ]);
    expect(findNonSerializable({ a: new Map() })).toEqual([
      { path: "a", kind: expect.stringContaining("Map") },
    ]);
    expect(findNonSerializable({ a: { b: [{ c: new Set() }] } })).toEqual([
      { path: "a.b[0].c", kind: expect.stringContaining("Set") },
    ]);
  });

  it("finds non-finite numbers, which serialise to null", () => {
    expect(findNonSerializable({ a: NaN })).toEqual([
      { path: "a", kind: expect.stringContaining("non-finite") },
    ]);
    expect(findNonSerializable({ a: Infinity })).toEqual([
      { path: "a", kind: expect.stringContaining("non-finite") },
    ]);
  });

  it("accepts plain JSON-safe state", () => {
    expect(
      findNonSerializable({ a: 1, b: "s", c: null, d: [1, 2], e: { f: true } }),
    ).toEqual([]);
  });

  it("terminates on a cycle rather than overflowing the stack", () => {
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    expect(() => findNonSerializable(cyclic)).not.toThrow();
  });
});
