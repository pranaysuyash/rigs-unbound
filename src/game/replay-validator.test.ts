import { describe, expect, it } from "vitest";
import {
  createInitialState,
  advanceGame,
  cycleCamera,
  cycleDifferentialMode,
  performPrimaryAction,
  publicState,
  repairRig,
  selectCamera,
  settleWorld,
  setTirePressure,
  stepGame,
} from "./state";
import { GameWorld } from "./gameworld";
import { DEFAULT_TIRE_PRESSURE_PSI } from "./contracts";
import { AIRED_DOWN_PSI } from "./rig-tool-projection";
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

  it("keeps long fixed-step input transitions aligned despite elapsed float drift", () => {
    const record = createRunRecord("REPLAY-INPUT-TICKS", 0);
    const state = createInitialState(record.seed);
    const world = new GameWorld(record.seed);

    for (let tick = 0; tick < 240; tick += 1) {
      const input = {
        accelerate: tick % 6 < 3,
        brake: tick % 17 === 0,
        steerLeft: tick % 19 < 4,
        steerRight: tick % 23 < 3,
      };
      appendRunRecordEntry(record, "input", "sample", state.elapsedMs, {
        input,
      });
      stepGame(state, world, input);
    }
    checkpoint(record, state, world, "after-long-input-sequence");

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      inputsApplied: 240,
      checkpointsVerified: 1,
    });
  });

  it("refuses to certify a command outside the portable subset", () => {
    const record = createRunRecord("REPLAY-UNSUPPORTED", 0);

    appendRunRecordEntry(record, "command", "placeRig", 0, {
      x: 10,
      z: 20,
    });

    expect(record.entries[0]).toMatchObject({
      replayable: false,
      diagnosticsOnly: false,
      replayClass: "non-replayable",
    });
    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: false,
      status: "unsupported-entry",
      commandsApplied: 0,
      issues: [
        expect.objectContaining({
          sequence: 0,
          message: "Run contains non-replayable command 'placeRig'.",
        }),
      ],
    });
  });

  it("ignores a diagnostic-only runner control without certifying a mutation", () => {
    const record = createRunRecord("REPLAY-DIAGNOSTIC", 0);
    const state = createInitialState(record.seed);
    const world = new GameWorld(record.seed);

    appendRunRecordEntry(record, "command", "setAcceptanceManualStepping", 0, {
      enabled: true,
    });
    checkpoint(record, state, world, "after-runner-control");

    expect(validateDeterministicReplay(record)).toMatchObject({
      ok: true,
      status: "verified",
      commandsApplied: 0,
      checkpointsVerified: 1,
    });
  });

  it("replays repair and reset through canonical reducers", () => {
    const state = createInitialState("REPLAY-RECOVERY");
    const world = new GameWorld(state.seed);
    state.salvage = 10;
    state.rigs[state.activeRigId].condition = 50;

    const contextualRecord = createRunRecord(
      state.seed,
      0,
      createRunRecordInitialContext(state, world),
    );
    appendRunRecordEntry(
      contextualRecord,
      "command",
      "repairRig",
      state.elapsedMs,
      {},
    );
    repairRig(state);
    checkpoint(contextualRecord, state, world, "after-repair");

    appendRunRecordEntry(
      contextualRecord,
      "command",
      "reset",
      state.elapsedMs,
      {},
    );
    world.reset();
    const resetState = createInitialState(state.seed);
    settleWorld(resetState, world);
    checkpoint(contextualRecord, resetState, world, "after-reset");

    expect(validateDeterministicReplay(contextualRecord)).toMatchObject({
      ok: true,
      status: "verified",
      commandsApplied: 2,
      checkpointsVerified: 2,
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

  describe("rig-tool commands (Pegboard tyre pressure and differential lock)", () => {
    // The replay contract is the resolved command, not the display id — see
    // RADIAL_QUICK_ACTION_AUTHORITY_AUDIT_2026-07-28.md Finding #1. Replay
    // must never re-derive player intent from a UI label.

    it("replays an air-down command and verifies", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-AIR-DOWN", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      checkpoint(record, state, world, "boot");
      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-down-tires",
        command: { type: "set-tire-pressure", psi: AIRED_DOWN_PSI },
      });
      setTirePressure(state, AIRED_DOWN_PSI);
      checkpoint(record, state, world, "after-air-down");

      expect(state.rigs[state.activeRigId].tools.tirePressurePsi).toBe(
        AIRED_DOWN_PSI,
      );
      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: true,
        status: "verified",
        commandsApplied: 1,
        checkpointsVerified: 2,
      });
    });

    it("replays an air-up command and verifies", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-AIR-UP", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-down-tires",
        command: { type: "set-tire-pressure", psi: AIRED_DOWN_PSI },
      });
      setTirePressure(state, AIRED_DOWN_PSI);
      checkpoint(record, state, world, "aired-down");

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-up-tires",
        command: {
          type: "set-tire-pressure",
          psi: DEFAULT_TIRE_PRESSURE_PSI,
        },
      });
      setTirePressure(state, DEFAULT_TIRE_PRESSURE_PSI);
      checkpoint(record, state, world, "after-air-up");

      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: true,
        status: "verified",
        commandsApplied: 2,
        checkpointsVerified: 2,
      });
    });

    it("replays a differential-cycle command and verifies", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-DIFF", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      checkpoint(record, state, world, "boot");
      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "cycle-differential",
        command: { type: "cycle-differential" },
      });
      cycleDifferentialMode(state);
      checkpoint(record, state, world, "after-cycle");

      expect(state.rigs[state.activeRigId].tools.differentialMode).toBe(
        "limited-slip",
      );
      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: true,
        status: "verified",
        commandsApplied: 1,
        checkpointsVerified: 2,
      });
    });

    it("preserves order across multiple sequential tool commands", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-SEQUENCE", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      checkpoint(record, state, world, "boot");

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-down-tires",
        command: { type: "set-tire-pressure", psi: AIRED_DOWN_PSI },
      });
      setTirePressure(state, AIRED_DOWN_PSI);
      checkpoint(record, state, world, "step-1-aired-down");

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "cycle-differential",
        command: { type: "cycle-differential" },
      });
      cycleDifferentialMode(state);
      checkpoint(record, state, world, "step-2-limited-slip");

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "cycle-differential",
        command: { type: "cycle-differential" },
      });
      cycleDifferentialMode(state);
      checkpoint(record, state, world, "step-3-locked");

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-up-tires",
        command: {
          type: "set-tire-pressure",
          psi: DEFAULT_TIRE_PRESSURE_PSI,
        },
      });
      setTirePressure(state, DEFAULT_TIRE_PRESSURE_PSI);
      checkpoint(record, state, world, "step-4-aired-up");

      // The order matters: locked differential + full pressure is a different
      // final state than the same two commands applied in the other order
      // would produce for any mechanic that isn't purely commutative. Every
      // intermediate checkpoint verifying independently is what proves the
      // sequence, not just the final one.
      expect(state.rigs[state.activeRigId].tools).toEqual({
        tirePressurePsi: DEFAULT_TIRE_PRESSURE_PSI,
        differentialMode: "locked",
      });
      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: true,
        status: "verified",
        commandsApplied: 4,
        checkpointsVerified: 5,
      });
    });

    it("includes the expected final rig.tools in checkpoint state", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-CHECKPOINT-STATE", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-down-tires",
        command: { type: "set-tire-pressure", psi: AIRED_DOWN_PSI },
      });
      setTirePressure(state, AIRED_DOWN_PSI);
      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "cycle-differential",
        command: { type: "cycle-differential" },
      });
      cycleDifferentialMode(state);
      checkpoint(record, state, world, "final");

      const finalPublicState = publicState(state, world) as {
        rigs: Record<string, { tools: unknown }>;
        activeRigId: string;
      };
      expect(
        finalPublicState.rigs[finalPublicState.activeRigId]!.tools,
      ).toEqual({
        tirePressurePsi: AIRED_DOWN_PSI,
        differentialMode: "limited-slip",
      });
      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: true,
        status: "verified",
        commandsApplied: 2,
        checkpointsVerified: 1,
      });
    });

    it("fails as invalid-payload on a malformed command type", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-BAD-TYPE", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-down-tires",
        command: { type: "teleport-rig", psi: AIRED_DOWN_PSI },
      });
      checkpoint(record, state, world, "unreached");

      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: false,
        status: "invalid-payload",
        commandsApplied: 0,
        issues: [
          expect.objectContaining({
            sequence: 0,
            message:
              "rig-tool command payload does not match a known command variant.",
          }),
        ],
      });
    });

    it("fails as invalid-payload on a malformed (non-finite) PSI", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-BAD-PSI", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        toolId: "air-down-tires",
        command: { type: "set-tire-pressure", psi: Number.NaN },
      });
      checkpoint(record, state, world, "unreached");

      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: false,
        status: "invalid-payload",
        commandsApplied: 0,
        issues: [
          expect.objectContaining({
            sequence: 0,
            message:
              "rig-tool command payload does not match a known command variant.",
          }),
        ],
      });
    });

    it("fails as invalid-payload when toolId is missing", () => {
      const record = createRunRecord("REPLAY-RIG-TOOL-NO-ID", 0);
      const state = createInitialState(record.seed);
      const world = new GameWorld(record.seed);

      appendRunRecordEntry(record, "command", "rig-tool", state.elapsedMs, {
        command: { type: "cycle-differential" },
      });
      checkpoint(record, state, world, "unreached");

      expect(validateDeterministicReplay(record)).toMatchObject({
        ok: false,
        status: "invalid-payload",
        commandsApplied: 0,
        issues: [
          expect.objectContaining({
            sequence: 0,
            message: "rig-tool command requires a toolId.",
          }),
        ],
      });
    });
  });
});
