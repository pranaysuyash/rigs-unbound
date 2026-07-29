import { describe, expect, it } from "vitest";
import { INFRASTRUCTURE_DEFINITIONS } from "./infrastructure-network";
import { GameWorld } from "./gameworld";
import {
  createInitialState,
  performPrimaryAction,
  publicState,
  recoverState,
  resolvePrimaryAction,
} from "./state";

describe("infrastructure network kernel integration", () => {
  it("persists a generic local-machine action and publishes spatial effects", () => {
    const state = createInitialState("INFRASTRUCTURE-NETWORK");
    const world = new GameWorld(state.seed);
    const gate = INFRASTRUCTURE_DEFINITIONS["floodgate-12"];
    const rig = state.rigs["utility-tractor"];
    rig.x = gate.x;
    rig.z = gate.z;
    rig.condition = 100;
    state.salvage = 8;

    expect(resolvePrimaryAction(state, world).kind).toBe("inspect-infrastructure");
    expect(performPrimaryAction(state, world).action).toBe("inspect-infrastructure");
    expect(performPrimaryAction(state, world).action).toBe("service-infrastructure");

    const restored = recoverState(JSON.parse(JSON.stringify(state)));
    expect(restored?.infrastructure).toEqual(state.infrastructure);
    expect(publicState(state, world)).toMatchObject({
      infrastructure: {
        localEffects: { waterLevelOffsetM: expect.any(Number) },
        // arrayContaining, not an exact array: the network has grown beyond
        // the floodgate since this proof was written, and this test only
        // cares that the floodgate's own entry is published correctly.
        entities: expect.arrayContaining([
          expect.objectContaining({ id: "floodgate-12", operating: true }),
        ]),
      },
    });
  });
});
