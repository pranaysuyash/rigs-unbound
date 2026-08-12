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
    const waterworks = INFRASTRUCTURE_DEFINITIONS["sunken-flats-waterworks"];
    const rig = state.rigs["utility-tractor"];
    rig.x = waterworks.x;
    rig.z = waterworks.z;
    rig.condition = 100;
    state.salvage = 8;

    expect(resolvePrimaryAction(state, world).kind).toBe(
      "inspect-infrastructure",
    );
    expect(performPrimaryAction(state, world).action).toBe(
      "inspect-infrastructure",
    );
    expect(performPrimaryAction(state, world).action).toBe(
      "service-infrastructure",
    );

    const restored = recoverState(JSON.parse(JSON.stringify(state)));
    expect(restored?.infrastructure).toEqual(state.infrastructure);
    expect(publicState(state, world)).toMatchObject({
      infrastructure: {
        localEffects: { waterLevelOffsetM: expect.any(Number) },
        // arrayContaining, not an exact array: the network may grow while this
        // proof only checks that the local waterworks entry is published.
        entities: expect.arrayContaining([
          expect.objectContaining({
            id: "sunken-flats-waterworks",
            operating: true,
          }),
        ]),
      },
    });
  });
});
