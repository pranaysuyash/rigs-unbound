import { describe, expect, it } from "vitest";

import {
  CARGO_PICKUP,
  RIG_PROFILES,
  rigCollisionRadius,
  type RigId,
} from "./contracts";
import { GameWorld } from "./gameworld";
import {
  createInitialState,
  publicState,
  settleWorld,
  stepGame,
} from "./state";

const IDLE = {
  accelerate: false,
  brake: false,
  steerLeft: false,
  steerRight: false,
} as const;

function collisionScenario(target: RigId | "relay-cargo") {
  const state = createInitialState(`DYNAMIC-${target}`);
  const world = new GameWorld(state.seed);
  state.activeRigId = "utility-tractor";
  const tractor = state.rigs["utility-tractor"];
  // Torque narratively starts disabled awaiting restoration (see
  // createInitialState); this proof exercises collision, not that beat.
  tractor.condition = 100;
  const startX = CARGO_PICKUP.x - 6;
  const startZ = CARGO_PICKUP.z;
  tractor.x = startX;
  tractor.z = startZ;
  tractor.heading = Math.PI / 2;
  tractor.speed = 15;

  state.rigs["marsh-skimmer"].x = 120;
  state.rigs["marsh-skimmer"].z = 80;
  state.cargoRelay.cargo.x = 120;
  state.cargoRelay.cargo.z = 90;
  state.cargoRelay.cargo.attachedRigId = null;

  const tractorRadius = rigCollisionRadius(RIG_PROFILES["utility-tractor"]);
  if (target === "relay-cargo") {
    state.rigs["toy-buggy"].x = 110;
    state.rigs["toy-buggy"].z = 80;
    state.cargoRelay.cargo.x = startX + tractorRadius + 1.15;
    state.cargoRelay.cargo.z = startZ;
    state.cargoRelay.cargo.heading = Math.PI / 2;
  } else {
    const targetRadius = rigCollisionRadius(RIG_PROFILES[target]);
    state.rigs[target].x = startX + tractorRadius + targetRadius + 0.35;
    state.rigs[target].z = startZ;
    state.rigs[target].heading = Math.PI / 2;
    state.rigs[target].speed = 0;
  }
  settleWorld(state, world);
  return { state, world };
}

describe("fixed-step dynamic world collision", () => {
  it("prevents the active rig crossing a parked rig and exposes contact identity", () => {
    const { state, world } = collisionScenario("toy-buggy");
    const tractor = state.rigs["utility-tractor"];
    const buggy = state.rigs["toy-buggy"];
    const buggyStartX = buggy.x;

    stepGame(state, world, IDLE, 0.1);

    const minimum =
      rigCollisionRadius(RIG_PROFILES["utility-tractor"]) +
      rigCollisionRadius(RIG_PROFILES["toy-buggy"]);
    expect(
      Math.hypot(tractor.x - buggy.x, tractor.z - buggy.z),
    ).toBeGreaterThanOrEqual(minimum);
    expect(tractor.x).toBeLessThan(buggy.x);
    expect(buggy.x).toBeGreaterThanOrEqual(buggyStartX);

    const snapshot = publicState(state, world) as {
      collision: {
        totalContacts: number;
        policyViolationCount: number;
        contacts: Array<{
          firstId: string;
          secondId: string;
          firstRole: string;
          secondRole: string;
        }>;
      };
    };
    expect(snapshot.collision.policyViolationCount).toBe(0);
    expect(snapshot.collision.totalContacts).toBeGreaterThan(0);
    expect(snapshot.collision.contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          firstId: "utility-tractor",
          firstRole: "rig",
          secondId: "toy-buggy",
          secondRole: "rig",
        }),
      ]),
    );
    expect(state.lastDiagnostic).toContain("contacted Spark");
  });

  it("treats unattached relay cargo as a movable, identified world body", () => {
    const { state, world } = collisionScenario("relay-cargo");
    const tractor = state.rigs["utility-tractor"];
    const cargo = state.cargoRelay.cargo;
    const cargoStartX = cargo.x;

    stepGame(state, world, IDLE, 0.1);

    expect(tractor.x).toBeLessThan(cargo.x);
    expect(cargo.x).toBeGreaterThanOrEqual(cargoStartX);
    const snapshot = publicState(state, world) as {
      collision: {
        contacts: Array<{
          firstId: string;
          secondId: string;
          firstRole: string;
          secondRole: string;
        }>;
      };
    };
    expect(snapshot.collision.contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          firstId: "utility-tractor",
          firstRole: "rig",
          secondId: "relay-cargo",
          secondRole: "cargo",
        }),
      ]),
    );
    expect(state.lastDiagnostic).toContain("relay cargo");
  });

  it("sweeps reversing attached cargo against parked rigs instead of passing the hitch through them", () => {
    const state = createInitialState("DYNAMIC-ATTACHED-CARGO");
    const world = new GameWorld(state.seed);
    state.activeRigId = "utility-tractor";
    const tractor = state.rigs["utility-tractor"];
    tractor.condition = 100;
    const buggy = state.rigs["toy-buggy"];
    const cargo = state.cargoRelay.cargo;
    tractor.x = CARGO_PICKUP.x;
    tractor.z = CARGO_PICKUP.z;
    tractor.heading = Math.PI / 2;
    tractor.speed = -4.5;
    buggy.x = CARGO_PICKUP.x - 6;
    buggy.z = CARGO_PICKUP.z;
    buggy.heading = Math.PI / 2;
    state.rigs["marsh-skimmer"].x = 120;
    state.rigs["marsh-skimmer"].z = 80;
    settleWorld(state, world);

    cargo.x = CARGO_PICKUP.x - 2.8;
    cargo.z = CARGO_PICKUP.z;
    cargo.heading = Math.PI / 2;
    cargo.attachedRigId = "utility-tractor";
    state.cargoRelay.status = "active";
    const towHook = tractor.attachments.find(
      (attachment) => attachment.id === "tow-hook",
    );
    if (!towHook) throw new Error("missing utility tractor tow hook");
    towHook.engaged = true;
    const buggyStartX = buggy.x;

    stepGame(state, world, IDLE, 0.1);

    expect(cargo.x).toBeGreaterThan(buggy.x);
    expect(buggy.x).toBeLessThan(buggyStartX);
    const snapshot = publicState(state, world) as {
      collision: {
        contacts: Array<{
          firstId: string;
          secondId: string;
          firstRole: string;
          secondRole: string;
          swept: boolean;
          impactSpeed: number;
        }>;
      };
    };
    expect(snapshot.collision.contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          firstId: "relay-cargo",
          firstRole: "cargo",
          secondId: "toy-buggy",
          secondRole: "rig",
          swept: true,
          impactSpeed: expect.any(Number),
        }),
      ]),
    );
    const cargoContact = snapshot.collision.contacts.find(
      (contact) => contact.firstId === "relay-cargo",
    );
    expect(cargoContact?.impactSpeed).toBeGreaterThan(0);
    expect(state.lastDiagnostic).toContain("Relay cargo contacted");
  });
});
