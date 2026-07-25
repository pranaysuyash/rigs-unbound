import assert from "node:assert/strict";
import test from "node:test";

import {
  advanceGame,
  createGameState,
  DEFENSE_DURATION_TICKS,
  FIXED_STEP_MS,
  renderGameToText,
  stepGame,
} from "../src/kernel.js";

test("same seed and inputs produce identical state", () => {
  const first = createGameState(12345);
  const second = createGameState(12345);
  const inputs = [
    { throttle: 1, steer: 0.4, action: false, elapsed: 740 },
    { throttle: 0.6, steer: -0.8, action: true, elapsed: 460 },
    { throttle: -0.3, steer: 0, action: false, elapsed: 300 },
  ];

  for (const { elapsed, ...input } of inputs) {
    advanceGame(first, input, elapsed);
    advanceGame(second, input, elapsed);
  }

  assert.deepEqual(first, second);
});

test("elapsed-time chunking does not change fixed-step output", () => {
  const singleChunk = createGameState(88);
  const manyChunks = createGameState(88);
  const input = { throttle: 0.75, steer: 0.2, action: false };

  advanceGame(singleChunk, input, 1_000);
  for (let index = 0; index < 50; index += 1) {
    advanceGame(manyChunks, input, FIXED_STEP_MS);
  }

  assert.deepEqual(singleChunk, manyChunks);
  assert.equal(singleChunk.tick, 50);
});

test("tractor identity and state persist from farm into defense", () => {
  const state = createGameState(77);
  const tractorId = state.vehicle.id;

  harvestRequiredCrops(state);

  assert.equal(state.mode, "defense");
  assert.equal(state.cameraMode, "top-down");
  assert.equal(state.vehicle.id, tractorId);
  assert.equal(state.vehicle.harvested, 3);
  assert.equal(state.vehicle.scrap, 3);
  assert.equal(state.vehicle.condition, 0.55);
  assert.match(state.vehicle.history.at(-1) ?? "", /signal field/);
});

test("defense transitions to a time trial without replacing the tractor", () => {
  const state = createGameState(4);
  harvestRequiredCrops(state);
  const tractorId = state.vehicle.id;

  state.vehicle.x = 50;
  state.vehicle.y = 32;
  for (let index = 0; index < DEFENSE_DURATION_TICKS; index += 1) {
    stepGame(state, { throttle: 0, steer: 0, action: false });
  }

  assert.equal(state.mode, "time-trial");
  assert.equal(state.cameraMode, "route");
  assert.equal(state.vehicle.id, tractorId);
  assert.match(state.vehicle.history.at(-1) ?? "", /Held the yard/);
});

test("time-trial completion retains accumulated history", () => {
  const state = createGameState(9);
  harvestRequiredCrops(state);
  state.enemies = [];
  state.defense.elapsedTicks = DEFENSE_DURATION_TICKS - 1;
  stepGame(state, { throttle: 0, steer: 0, action: false });

  for (const checkpoint of state.trial.checkpoints) {
    state.vehicle.x = checkpoint.x;
    state.vehicle.y = checkpoint.y;
    stepGame(state, { throttle: 0, steer: 0, action: false });
  }

  assert.equal(state.mode, "complete");
  assert.equal(state.trial.nextCheckpointIndex, state.trial.checkpoints.length);
  assert.ok(state.vehicle.history.length >= 4);
  assert.match(state.vehicle.history.at(-1) ?? "", /cross-mode run/);
});

test("unplowed contact can fail the run with an auditable event", () => {
  const state = createGameState(12);
  harvestRequiredCrops(state);
  state.vehicle.condition = 0.04;
  state.enemies = [
    {
      id: "threat-test",
      x: state.vehicle.x,
      y: state.vehicle.y,
      contactCooldownTicks: 0,
    },
  ];

  stepGame(state, { throttle: 0, steer: 0, action: false });

  assert.equal(state.mode, "failed");
  assert.equal(state.vehicle.condition, 0);
  assert.equal(state.events.at(-1)?.type, "run.failed");
});

test("text contract exposes actionable visible state without full history", () => {
  const state = createGameState(19);
  advanceGame(state, { throttle: 1, steer: 0.25, action: false }, 200);

  const payload = JSON.parse(renderGameToText(state));

  assert.equal(payload.schema, "rigs-unbound.kernel-probe-state.v1");
  assert.equal(payload.mode, "farm");
  assert.equal(payload.vehicle.id, state.vehicle.id);
  assert.equal(payload.crops.length, 5);
  assert.match(payload.coordinates, /origin is top-left/);
  assert.ok(payload.recentEvents.length <= 4);
  assert.equal("history" in payload.vehicle, false);
});

/**
 * @param {import("../src/kernel.js").GameState} state
 */
function harvestRequiredCrops(state) {
  for (const crop of state.crops.slice(0, 3)) {
    state.vehicle.x = crop.x;
    state.vehicle.y = crop.y;
    stepGame(state, { throttle: 0, steer: 0, action: true });
    for (let cooldown = 0; cooldown < 8; cooldown += 1) {
      stepGame(state, { throttle: 0, steer: 0, action: false });
    }
  }
}
