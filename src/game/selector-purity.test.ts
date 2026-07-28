import { describe, expect, it } from "vitest";

import { evaluateCorridorQuality, resolveFirstRung } from "./first-rung";
import { GameWorld } from "./gameworld";
import { createInitialState, publicState, stepGame } from "./state";
import { restoreUnboundPassage } from "./unbound-passage";

/**
 * Selector purity.
 *
 * `publicState()` and `render_game_to_text()` are read models. The browser
 * observability hook, the acceptance harness, and any read-only board surface
 * call them freely and repeatedly. If reading changes state, then looking at the
 * game plays it — progression can advance because a diagnostic panel was open,
 * and a replay can diverge from the run that produced it.
 *
 * These tests exist because that defect was real: `evaluateCorridorQuality()`
 * opened the Unbound Passage from inside the first-rung resolver, which
 * `publicState()` calls.
 */

function freshWorld() {
  const state = createInitialState();
  const world = new GameWorld(state.seed);
  return { state, world };
}

/** A structural fingerprint of everything a read model must never touch. */
function snapshot(state: ReturnType<typeof createInitialState>): string {
  return JSON.stringify(state);
}

describe("read models do not mutate canonical state", () => {
  it("publicState leaves the game state byte-identical", () => {
    const { state, world } = freshWorld();
    const before = snapshot(state);

    publicState(state, world);
    publicState(state, world);
    publicState(state, world);

    expect(snapshot(state)).toBe(before);
  });

  it("resolveFirstRung leaves the game state byte-identical", () => {
    const { state, world } = freshWorld();
    const before = snapshot(state);

    resolveFirstRung(state, world.collectedNodes, world);
    resolveFirstRung(state, world.collectedNodes, world);

    expect(snapshot(state)).toBe(before);
  });

  it("evaluateCorridorQuality never opens the Unbound Passage", () => {
    // The direct regression guard. Previously this call opened the passage as a
    // side effect of being asked a question about the terrain.
    const { state, world } = freshWorld();
    const before = snapshot(state);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      evaluateCorridorQuality(state, world);
    }

    expect(state.unboundPassage.status).not.toBe("open");
    expect(snapshot(state)).toBe(before);
  });

  it("stays pure after the simulation has advanced and terrain has changed", () => {
    // Purity must hold in a played-in world, not only at spawn, because the
    // corridor branch is only reachable once furrows exist.
    const { state, world } = freshWorld();
    for (let step = 0; step < 240; step += 1) {
      stepGame(state, world, {
        accelerate: true,
        brake: false,
        steerLeft: false,
        steerRight: false,
      });
    }

    const before = snapshot(state);
    publicState(state, world);
    resolveFirstRung(state, world.collectedNodes, world);
    evaluateCorridorQuality(state, world);

    expect(snapshot(state)).toBe(before);
  });
});

describe("the Unbound Passage only opens through its command boundary", () => {
  it("never persists an open passage that would reset on reload", () => {
    // `restoreUnboundPassage()` resets any "open" passage that is missing
    // either the opening rig or the opening lane. The old direct mutation set
    // only `openedByRigId`, so the passage appeared open in-session and
    // silently reverted after a reload. Whatever route opens it must therefore
    // produce a shape that survives its own restore.
    const { state, world } = freshWorld();

    for (let step = 0; step < 600; step += 1) {
      stepGame(state, world, {
        accelerate: true,
        brake: false,
        steerLeft: false,
        steerRight: false,
      });
    }

    const restored = restoreUnboundPassage(
      JSON.parse(JSON.stringify(state.unboundPassage)),
    );
    expect(restored.status).toBe(state.unboundPassage.status);

    if (state.unboundPassage.status === "open") {
      expect(state.unboundPassage.openedByRigId).not.toBeNull();
      expect(state.unboundPassage.openedByLaneId).not.toBeNull();
      expect(state.unboundPassage.revision).toBeGreaterThan(0);
    }
  });
});
