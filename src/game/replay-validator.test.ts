import { describe, expect, it } from "vitest";
import {
  createInitialState,
  advanceGame,
  cycleCamera,
  performPrimaryAction,
  publicState,
  selectCamera,
} from "./state";
import { GameWorld } from "./gameworld";
import {
  appendRunRecordEntry,
  createRunRecord,
  createRunRecordInitialContext,
  stableHashText,
} from "./run-record";
import { validateDeterministicReplay } from "./replay-validator";

function checkpoint(
  record: ReturnType<typeof createRunRecord>,
  state: ReturnType<typeof createInitialState>,
  world: GameWorld,
  name: string,
): void {
  appendRunRecordEntry(record, "checkpoint", name, state.elapsedMs, {
    tickHash: stableHashText(JSON.stringify(publicState(state, world))),
  });
}

describe("deterministic replay validator", () => {
  it("reconstructs the supported command subset and verifies checkpoints", () => {
    const record = createRunRecord("REPLAY-VALID", 0);
    const state = createInitialState(record.seed);
    const world = new GameWorld(record.seed);

    checkpoint(record, state, world, "boot");
    appendRunRecordEntry(record, "command", "selectCamera", state.elapsedMs, {
      cameraMode: "top-down",
    });
    selectCamera(state, "top-down");
    checkpoint(record, state, world, "camera-selected");
    appendRunRecordEntry(record, "command", "advanceTime", state.elapsedMs, {
      milliseconds: 1000,
    });
    advanceGame(state, world, 1000);
    checkpoint(record, state, world, "after-advance");

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      commandsApplied: 2,
      checkpointsVerified: 3,
    });
  });

  it("treats simulation outcomes as diagnostics rather than replay input", () => {
    const record = createRunRecord("REPLAY-EVENT", 0);
    const state = createInitialState(record.seed);
    const world = new GameWorld(record.seed);

    appendRunRecordEntry(record, "command", "primaryAction", 0, {
      source: "test",
    });
    performPrimaryAction(state, world);
    appendRunRecordEntry(record, "event", "primaryActionOutcome", 0, {
      accepted: true,
    });
    checkpoint(record, state, world, "after-primary-action");

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      commandsApplied: 1,
      checkpointsVerified: 1,
    });
  });

  it("replays named non-primary tap actions through canonical state reducers", () => {
    const record = createRunRecord("REPLAY-TAP", 0);
    const state = createInitialState(record.seed);
    const world = new GameWorld(record.seed);

    appendRunRecordEntry(record, "command", "tap", 0, {
      action: "camera",
    });
    cycleCamera(state);
    checkpoint(record, state, world, "after-camera-tap");

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      commandsApplied: 1,
      checkpointsVerified: 1,
    });
  });

  it("classifies commands outside the portable subset as diagnostics", () => {
    const record = createRunRecord("REPLAY-UNSUPPORTED", 0);

    appendRunRecordEntry(record, "command", "placeRig", 0, {
      x: 10,
      z: 20,
    });

    expect(record.entries[0]).toMatchObject({
      replayable: false,
      diagnosticsOnly: true,
    });
    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      commandsApplied: 0,
    });
  });

  it("reports the checkpoint that diverged", () => {
    const record = createRunRecord("REPLAY-DIVERGENCE", 0);

    appendRunRecordEntry(record, "checkpoint", "boot", 0, {
      tickHash: "h00000000",
    });

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: false,
      status: "diverged",
      issues: [expect.objectContaining({ sequence: 0 })],
    });
  });

  it("replays from an admitted restored-state context rather than a fresh seed", () => {
    const state = createInitialState("REPLAY-RESTORED");
    const world = new GameWorld(state.seed);
    state.salvage = 17;
    world.collect("restored-cache");
    const record = createRunRecord(
      state.seed,
      0,
      createRunRecordInitialContext(state, world),
    );

    checkpoint(record, state, world, "restored-boot");

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      checkpointsVerified: 1,
    });
  });
});
