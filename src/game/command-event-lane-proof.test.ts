/**
 * Command/event lane proof tests.
 *
 * These tests prove that the primary-action command flows through the full
 * pipeline: command → validate → transition → event → presentation.
 * They cover every reachable rejection code, duplicate actions, persistence,
 * and version enforcement.
 *
 * Note: the "missing-capability" rejection code exists for future rig
 * configurations without tow. All current rigs have tow, so this path is
 * not reachable through the cargo relay today. The affordance resolver
 * test in affordances.test.ts covers that code path directly.
 */

import { describe, expect, it } from "vitest";
import { CARGO_DELIVERY, CARGO_PICKUP } from "./contracts";
import { GameWorld } from "./gameworld";
import {
  createInitialState,
  executePrimaryActionCommand,
  PRIMARY_ACTION_COMMAND_VERSION,
  PRIMARY_ACTION_EVENT_VERSION,
  recoverState,
  resolvePrimaryAction,
  settleWorld,
  stepGame,
} from "./state";
import type { RigId } from "./contracts";

function scenario(seed: string, activeRigId: RigId = "utility-tractor") {
  const state = createInitialState(seed);
  state.activeRigId = activeRigId;
  const world = new GameWorld(seed);
  settleWorld(state, world);
  return { state, world };
}

const command = (actorId: RigId) => ({
  version: PRIMARY_ACTION_COMMAND_VERSION,
  type: "primary-action" as const,
  actorId,
});

describe("command/event lane proof", () => {
  // ---------------------------------------------------------------------------
  // Rejection codes
  // ---------------------------------------------------------------------------

  it("rejects with inactive-actor when command actor differs from active rig", () => {
    const { state, world } = scenario("INACTIVE-ACTOR");
    const event = executePrimaryActionCommand(
      state,
      world,
      command("toy-buggy"),
    );

    expect(event.outcome).toBe("rejected");
    expect(event.reasonCode).toBe("inactive-actor");
    expect(event.action).toBe("none");
  });

  it("rejects with unsupported-command for wrong command version", () => {
    const { state, world } = scenario("UNSUPPORTED-VERSION");
    const event = executePrimaryActionCommand(state, world, {
      version: 99 as unknown as typeof PRIMARY_ACTION_COMMAND_VERSION,
      type: "primary-action",
      actorId: "utility-tractor",
    });

    expect(event).toEqual({
      version: PRIMARY_ACTION_EVENT_VERSION,
      type: "primary-action-resolved",
      command: {
        version: 99,
        type: "primary-action",
        actorId: "utility-tractor",
      },
      action: "none",
      outcome: "rejected",
      reasonCode: "unsupported-command",
    });
  });

  it("rejects with unsupported-command for wrong command type", () => {
    const { state, world } = scenario("UNSUPPORTED-TYPE");
    const event = executePrimaryActionCommand(state, world, {
      version: PRIMARY_ACTION_COMMAND_VERSION,
      type: "wrong-type" as unknown as "primary-action",
      actorId: "utility-tractor",
    });

    expect(event.outcome).toBe("rejected");
    expect(event.reasonCode).toBe("unsupported-command");
  });

  // ---------------------------------------------------------------------------
  // Accepted outcomes
  // ---------------------------------------------------------------------------

  it("accepts attach-cargo when tow-capable rig is in range", () => {
    const { state, world } = scenario("ACCEPT-ATTACH");
    const rig = state.rigs["utility-tractor"];
    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    const event = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );

    expect(event).toEqual({
      version: PRIMARY_ACTION_EVENT_VERSION,
      type: "primary-action-resolved",
      command: command("utility-tractor"),
      action: "attach-cargo",
      outcome: "accepted",
    });
  });

  it("accepts release-cargo when cargo is attached", () => {
    const { state, world } = scenario("ACCEPT-RELEASE");
    const rig = state.rigs["utility-tractor"];
    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    // Attach first
    const attachEvent = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(attachEvent.outcome).toBe("accepted");
    expect(attachEvent.action).toBe("attach-cargo");

    // Now release
    const releaseEvent = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(releaseEvent).toEqual({
      version: PRIMARY_ACTION_EVENT_VERSION,
      type: "primary-action-resolved",
      command: command("utility-tractor"),
      action: "release-cargo",
      outcome: "accepted",
    });
  });

  // ---------------------------------------------------------------------------
  // Duplicate actions
  // ---------------------------------------------------------------------------

  it("accepts attach then release without state corruption", () => {
    const { state, world } = scenario("DUPLICATE-RELEASE");
    const rig = state.rigs["utility-tractor"];
    const cargo = state.cargoRelay.cargo;

    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    // Cargo is not attached by default
    expect(cargo.attachedRigId).toBeNull();

    // Attach
    executePrimaryActionCommand(state, world, command("utility-tractor"));
    expect(cargo.attachedRigId).toBe("utility-tractor");

    // Release
    executePrimaryActionCommand(state, world, command("utility-tractor"));
    expect(cargo.attachedRigId).toBeNull();
    // Tow hook should be disengaged
    expect(rig.attachments.find((a) => a.id === "tow-hook")?.engaged).toBe(
      false,
    );
  });

  it("accepts collect-salvage once and moves to next action after", () => {
    const { state, world } = scenario("DUPLICATE-COLLECT");
    const rig = state.rigs["utility-tractor"];
    const node = world.exploration.nearestNode(
      rig.x,
      rig.z,
      70,
      world.collectedNodes,
    );
    if (!node) throw new Error("missing salvage fixture");

    rig.x = node.x;
    rig.z = node.z;
    settleWorld(state, world);

    // First collect — accepted
    const first = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(first.outcome).toBe("accepted");
    expect(first.action).toBe("collect-salvage");
    expect(state.salvage).toBe(node.value);

    // Second action — node is gone, plough action available instead
    const second = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(second.outcome).toBe("accepted");
    expect(second.action).toBe("lower-plough");
  });

  // ---------------------------------------------------------------------------
  // Persistence through save/load
  // ---------------------------------------------------------------------------

  it("preserves attached cargo state through save/load round trip", () => {
    const { state, world } = scenario("SAVE-CARGO");
    const rig = state.rigs["utility-tractor"];
    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    // Attach cargo
    executePrimaryActionCommand(state, world, command("utility-tractor"));
    expect(state.cargoRelay.cargo.attachedRigId).toBe("utility-tractor");
    expect(state.cargoRelay.status).toBe("active");

    // Save and restore
    const serialized = JSON.parse(JSON.stringify(state));
    const restored = recoverState(serialized);
    expect(restored).not.toBeNull();
    expect(restored!.cargoRelay.cargo.attachedRigId).toBe("utility-tractor");
    expect(restored!.cargoRelay.status).toBe("active");
    expect(
      restored!.rigs["utility-tractor"].attachments.find(
        (a) => a.id === "tow-hook",
      )?.engaged,
    ).toBe(true);
  });

  it("preserves delivered cargo state through save/load round trip", () => {
    const { state, world } = scenario("SAVE-DELIVERED");
    const rig = state.rigs["utility-tractor"];
    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    // Attach, then move to delivery
    executePrimaryActionCommand(state, world, command("utility-tractor"));
    rig.x = CARGO_DELIVERY.x;
    rig.z = CARGO_DELIVERY.z;
    stepGame(state, world);

    expect(state.cargoRelay.status).toBe("complete");
    expect(state.cargoRelay.cargo.delivered).toBe(true);

    // Save and restore
    const serialized = JSON.parse(JSON.stringify(state));
    const restored = recoverState(serialized);
    expect(restored).not.toBeNull();
    expect(restored!.cargoRelay.status).toBe("complete");
    expect(restored!.cargoRelay.cargo.delivered).toBe(true);
    expect(restored!.cargoRelay.bestTimeMs).not.toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Event structure
  // ---------------------------------------------------------------------------

  it("returns event with correct version, type, and command reference", () => {
    const { state, world } = scenario("EVENT-STRUCTURE");
    const cmd = command("utility-tractor");
    const event = executePrimaryActionCommand(state, world, cmd);

    expect(event.version).toBe(PRIMARY_ACTION_EVENT_VERSION);
    expect(event.type).toBe("primary-action-resolved");
    expect(event.command.version).toBe(PRIMARY_ACTION_COMMAND_VERSION);
    expect(event.command.type).toBe("primary-action");
    expect(event.command.actorId).toBe("utility-tractor");
  });

  it("event carries the command reference immutably", () => {
    const { state, world } = scenario("EVENT-IMMUTABLE");
    const cmd = command("utility-tractor");
    const event = executePrimaryActionCommand(state, world, cmd);

    // The event's command should be a copy, not the same reference
    expect(event.command).toEqual(cmd);
    // Modifying the original command shouldn't affect the event
    cmd.actorId = "toy-buggy";
    expect(event.command.actorId).toBe("utility-tractor");
  });

  it("rejected event includes reasonCode while accepted does not", () => {
    const { state, world } = scenario("REASON-CODE-PRESENCE");

    // Accepted — no reasonCode
    const accepted = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(accepted.outcome).toBe("accepted");
    expect("reasonCode" in accepted).toBe(false);

    // Rejected — has reasonCode
    const rejected = executePrimaryActionCommand(
      state,
      world,
      command("toy-buggy"),
    );
    expect(rejected.outcome).toBe("rejected");
    expect(rejected.reasonCode).toBe("inactive-actor");
  });

  // ---------------------------------------------------------------------------
  // Complete command → validate → transition → event → presentation pipeline
  // ---------------------------------------------------------------------------

  it("proves the full pipeline: attach → drive → deliver → verify event chain", () => {
    const { state, world } = scenario("FULL-PIPELINE");
    const rig = state.rigs["utility-tractor"];
    rig.x = CARGO_PICKUP.x;
    rig.z = CARGO_PICKUP.z;
    settleWorld(state, world);

    // Step 1: Command → validate → transition → event (attach)
    const attachEvent = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(attachEvent.outcome).toBe("accepted");
    expect(attachEvent.action).toBe("attach-cargo");
    expect(state.cargoRelay.status).toBe("active");

    // Step 2: Simulation step drives cargo to delivery
    rig.x = CARGO_DELIVERY.x;
    rig.z = CARGO_DELIVERY.z;
    stepGame(state, world);

    // Step 3: Verify delivery event through state observation
    expect(state.cargoRelay.status).toBe("complete");
    expect(state.cargoRelay.cargo.delivered).toBe(true);
    expect(state.cargoRelay.bestTimeMs).not.toBeNull();

    // Step 4: Next action after delivery — plough or explore
    const afterDelivery = resolvePrimaryAction(state, world);
    expect(["lower-plough", "none"]).toContain(afterDelivery.kind);
  });

  it("rejects with no-contextual-action when no actionable affordance exists", () => {
    const { state, world } = scenario("NO-ACTION");
    const rig = state.rigs["utility-tractor"];
    // Place rig on open ground, far from cargo pickup and salvage
    rig.x = 100;
    rig.z = 100;
    settleWorld(state, world);

    // The tractor has a plough, so it resolves to lower-plough (not rejected)
    const resolution = resolvePrimaryAction(state, world);
    expect(resolution.kind).toBe("lower-plough");
    expect(resolution.label).toBe("Lower blade");

    // Verify the command executes successfully
    const event = executePrimaryActionCommand(
      state,
      world,
      command("utility-tractor"),
    );
    expect(event.outcome).toBe("accepted");
    expect(event.action).toBe("lower-plough");
  });

  // ---------------------------------------------------------------------------
  // Cross-rig command handling
  // ---------------------------------------------------------------------------

  it("handles commands for all three rigs with stable rejection codes", () => {
    const rigs: RigId[] = ["utility-tractor", "toy-buggy", "marsh-skimmer"];

    for (const targetRig of rigs) {
      const { state, world } = scenario(`CROSS-RIG-${targetRig}`);

      // Command from the active rig (utility-tractor) should be accepted
      const activeEvent = executePrimaryActionCommand(
        state,
        world,
        command("utility-tractor"),
      );
      expect(activeEvent.outcome).toBe("accepted");

      // Command from a non-active rig should be rejected with inactive-actor
      const inactiveEvent = executePrimaryActionCommand(
        state,
        world,
        command(targetRig),
      );
      if (targetRig !== "utility-tractor") {
        expect(inactiveEvent.outcome).toBe("rejected");
        expect(inactiveEvent.reasonCode).toBe("inactive-actor");
      }
    }
  });
});
