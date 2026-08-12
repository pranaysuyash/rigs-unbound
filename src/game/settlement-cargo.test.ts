import { describe, expect, it } from "vitest";
import {
  createInitialState,
  executePrimaryActionCommand,
  resolvePrimaryAction,
  settleWorld,
  stepGame,
} from "./state";
import {
  availableSettlementCargoManifest,
  completeSettlementCargoDelivery,
  prepareSettlementCargo,
} from "./settlement-cargo";
import {
  recoverSettlementState,
  deriveSettlementCommunityPassageIds,
  rustlineServiceStocked,
  sunkenCausewayBuilt,
} from "./settlement-needs";
import { GameWorld } from "./gameworld";
import { FIXED_STEP_SECONDS, IDLE_INPUT } from "./contracts";
import { findSite } from "./world";

describe("voluntary settlement cargo", () => {
  it("offers Rustline service stock only after the player knows the yard", () => {
    const state = createInitialState("SETTLEMENT-CARGO-KNOWLEDGE");

    expect(availableSettlementCargoManifest(state)).toBeUndefined();
    state.discoveries = [{ id: "salvage-yard", discoveredAt: 12 }];
    expect(availableSettlementCargoManifest(state)?.id).toBe(
      "rustline-service-stock",
    );
  });

  it("records physical stock delivery as material history without an active mission", () => {
    const state = createInitialState("SETTLEMENT-CARGO-DELIVERY");
    state.discoveries = [{ id: "salvage-yard", discoveredAt: 12 }];
    state.worldTimeMinutes = 240;
    const manifest = availableSettlementCargoManifest(state)!;

    expect(prepareSettlementCargo(state, manifest)).toBe(true);
    expect(state.cargoRelay.assignment).toEqual({
      missionId: null,
      manifestId: "rustline-service-stock",
      originSiteId: "home-silo",
      destinationSiteId: "salvage-yard",
    });
    expect(state.cargoRelay.cargo).toMatchObject({
      x: 18,
      z: 1,
      attachedRigId: null,
    });
    state.cargoRelay.cargo.delivered = true;

    expect(completeSettlementCargoDelivery(state)).toContain("repair bay");
    expect(rustlineServiceStocked(state)).toBe(true);
    expect(state.settlements["rustline-salvage"].contributions).toEqual([
      expect.objectContaining({
        responseId: "rustline-salvage:deliver-service-stock",
        materialEffectId: "rustline-salvage:service-stocked",
        capability: "tow",
      }),
    ]);
    expect(state.activeMission).toBeNull();
    expect(state.activeSideMissions).toEqual([]);
  });

  it("loads service stock from Home Silo through the ordinary primary command, without a mission", () => {
    const state = createInitialState("SETTLEMENT-CARGO-COMMAND");
    state.discoveries = [{ id: "salvage-yard", discoveredAt: 12 }];
    state.rigs[state.activeRigId].x = 18;
    state.rigs[state.activeRigId].z = 1;
    const world = {} as GameWorld;

    expect(resolvePrimaryAction(state, world).kind).toBe(
      "prepare-settlement-cargo",
    );
    expect(
      executePrimaryActionCommand(state, world, {
        version: 1,
        type: "primary-action",
        actorId: state.activeRigId,
      }),
    ).toEqual(
      expect.objectContaining({
        action: "prepare-settlement-cargo",
        outcome: "accepted",
      }),
    );
    expect(state.cargoRelay.assignment?.missionId).toBeNull();
    expect(state.cargoRelay.assignment?.destinationSiteId).toBe("salvage-yard");
    expect(resolvePrimaryAction(state, world).kind).toBe("attach-cargo");
    expect(
      executePrimaryActionCommand(state, world, {
        version: 1,
        type: "primary-action",
        actorId: state.activeRigId,
      }),
    ).toEqual(
      expect.objectContaining({
        action: "attach-cargo",
        outcome: "accepted",
      }),
    );
    expect(state.cargoRelay.cargo.attachedRigId).toBe(state.activeRigId);
    expect(state.activeMission).toBeNull();
    expect(state.activeSideMissions).toEqual([]);
  });

  it("keeps repeated shipment completion idempotent", () => {
    const state = createInitialState("SETTLEMENT-CARGO-IDEMPOTENT");
    state.discoveries = [{ id: "salvage-yard", discoveredAt: 12 }];
    expect(
      prepareSettlementCargo(state, availableSettlementCargoManifest(state)!),
    ).toBe(true);
    state.cargoRelay.cargo.delivered = true;

    completeSettlementCargoDelivery(state);
    completeSettlementCargoDelivery(state);

    expect(state.settlements["rustline-salvage"].contributions).toHaveLength(1);
  });

  it("keeps shipment choices spatial and makes the Sunken causeway a material route fact", () => {
    const state = createInitialState("SETTLEMENT-CARGO-CAUSEWAY");
    state.discoveries = [{ id: "sunken-flats", discoveredAt: 12 }];

    expect(availableSettlementCargoManifest(state, 0, 12)).toBeUndefined();
    const manifest = availableSettlementCargoManifest(state, 12, 1)!;
    expect(manifest.id).toBe("sunken-causeway-kit");
    expect(prepareSettlementCargo(state, manifest)).toBe(true);
    state.cargoRelay.cargo.delivered = true;

    expect(completeSettlementCargoDelivery(state)).toContain("raised route");
    expect(sunkenCausewayBuilt(state)).toBe(true);
    expect(deriveSettlementCommunityPassageIds(state)).toEqual([
      "sunken-flats-causeway",
    ]);
    expect(state.activeMission).toBeNull();
  });

  it("reconciles the raised passage through the Marsh Skimmer's fixed-step towing path", () => {
    const state = createInitialState("SETTLEMENT-CARGO-CAUSEWAY-WORLD");
    const world = new GameWorld(state.seed);
    settleWorld(state, world);
    state.discoveries = [{ id: "sunken-flats", discoveredAt: 12 }];
    const manifest = availableSettlementCargoManifest(state, 12, 1)!;
    expect(prepareSettlementCargo(state, manifest)).toBe(true);
    const destination = findSite("sunken-flats")!;
    state.activeRigId = "marsh-skimmer";
    const rig = state.rigs[state.activeRigId];
    rig.x = destination.x;
    rig.z = destination.z;
    rig.y = world.terrain.height(rig.x, rig.z) + 0.65;
    state.cargoRelay.status = "active";
    state.cargoRelay.startedAt = 0;
    state.cargoRelay.cargo.attachedRigId = rig.id;
    const routeRevision = world.terrain.routeRevisionNumber();

    for (let index = 0; index < 8; index += 1) {
      stepGame(state, world, IDLE_INPUT, FIXED_STEP_SECONDS);
    }

    expect(state.cargoRelay.cargo.delivered).toBe(true);
    expect(sunkenCausewayBuilt(state)).toBe(true);
    expect(world.terrain.routeRevisionNumber()).toBeGreaterThan(routeRevision);
    expect(deriveSettlementCommunityPassageIds(state)).toEqual([
      "sunken-flats-causeway",
    ]);
  });

  it("recovers the legacy Rustline mission outcome into the same material fact", () => {
    const recovered = recoverSettlementState(
      {
        "rustline-salvage": {
          condition: "supplied",
          favor: 1,
          completedNeedIds: ["rustline-parts-run"],
          contributions: [],
          adaptations: [],
        },
      },
      "unresolved",
    );

    expect(rustlineServiceStocked({ settlements: recovered })).toBe(true);
    expect(recovered["rustline-salvage"].contributions).toEqual([
      expect.objectContaining({
        responseId: "rustline-salvage:deliver-service-stock",
        materialEffectId: "rustline-salvage:service-stocked",
      }),
    ]);
  });

  it("recovers the legacy Sunken causeway outcome into the raised-passage fact", () => {
    const recovered = recoverSettlementState(
      {
        "sunken-flats": {
          condition: "connected",
          favor: 2,
          completedNeedIds: ["sunken-flats-causeway"],
          contributions: [],
          adaptations: [],
        },
      },
      "unresolved",
    );

    expect(sunkenCausewayBuilt({ settlements: recovered })).toBe(true);
    expect(
      deriveSettlementCommunityPassageIds({ settlements: recovered }),
    ).toEqual(["sunken-flats-causeway"]);
  });
});
