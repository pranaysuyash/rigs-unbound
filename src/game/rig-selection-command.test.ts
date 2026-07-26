import { describe, expect, it } from "vitest";
import { GameWorld } from "./gameworld";
import {
  createInitialState,
  executeRigSelectionCommand,
  RIG_SELECTION_COMMAND_VERSION,
  settleWorld,
} from "./state";

describe("rig selection command", () => {
  it("accepts a nearby active rig's versioned selection intent", () => {
    const state = createInitialState("RIG-SELECTION-COMMAND");
    const world = new GameWorld(state.seed);
    const target = state.rigs["marsh-skimmer"];
    const actor = state.rigs["utility-tractor"];
    actor.x = target.x + 5;
    actor.z = target.z;
    settleWorld(state, world);

    expect(
      executeRigSelectionCommand(state, {
        version: RIG_SELECTION_COMMAND_VERSION,
        type: "select-rig",
        actorId: "utility-tractor",
        targetRigId: "marsh-skimmer",
      }),
    ).toMatchObject({
      outcome: "accepted",
      changed: true,
      command: { targetRigId: "marsh-skimmer" },
    });
    expect(state.activeRigId).toBe("marsh-skimmer");
  });

  it("rejects an inactive actor without mutating the active rig", () => {
    const state = createInitialState("RIG-SELECTION-INACTIVE");

    expect(
      executeRigSelectionCommand(state, {
        version: RIG_SELECTION_COMMAND_VERSION,
        type: "select-rig",
        actorId: "toy-buggy",
        targetRigId: "marsh-skimmer",
      }),
    ).toMatchObject({
      outcome: "rejected",
      changed: false,
      reasonCode: "inactive-actor",
    });
    expect(state.activeRigId).toBe("utility-tractor");
  });

  it("accepts a duplicate target idempotently", () => {
    const state = createInitialState("RIG-SELECTION-DUPLICATE");

    expect(
      executeRigSelectionCommand(state, {
        version: RIG_SELECTION_COMMAND_VERSION,
        type: "select-rig",
        actorId: "utility-tractor",
        targetRigId: "utility-tractor",
      }),
    ).toMatchObject({ outcome: "accepted", changed: false });
  });
});
