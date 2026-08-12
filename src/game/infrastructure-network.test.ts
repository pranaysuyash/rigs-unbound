import { describe, expect, it } from "vitest";
import {
  INFRASTRUCTURE_DEFINITIONS,
  advanceInfrastructure,
  createInfrastructureNetworkState,
  deriveInfrastructureEffects,
  performInfrastructureAction,
  recoverInfrastructureNetwork,
  resolveInfrastructureAction,
} from "./infrastructure-network";
import { deriveWeatherState } from "./weather";

function actorAt(
  id: keyof typeof INFRASTRUCTURE_DEFINITIONS,
  capabilities: readonly ("tow" | "plough")[],
  salvage = 10,
) {
  const definition = INFRASTRUCTURE_DEFINITIONS[id];
  return {
    rigId: "utility-tractor",
    x: definition.x,
    z: definition.z,
    capabilities,
    salvage,
    nowMs: 100,
  };
}

describe("open-world infrastructure network", () => {
  it("turns serviced Sunken Flats waterworks into a local hydrology authority instead of a route flag", () => {
    let network = createInfrastructureNetworkState();
    const waterworks = INFRASTRUCTURE_DEFINITIONS["sunken-flats-waterworks"];
    const before = deriveInfrastructureEffects(
      network,
      waterworks.x,
      waterworks.z,
    );

    expect(
      resolveInfrastructureAction(
        network,
        actorAt("sunken-flats-waterworks", ["tow"]),
      ).kind,
    ).toBe("inspect");
    network = performInfrastructureAction(
      network,
      actorAt("sunken-flats-waterworks", ["tow"]),
      "inspect",
    ).network;
    const service = performInfrastructureAction(
      network,
      actorAt("sunken-flats-waterworks", ["tow"]),
      "service",
    );
    network = service.network;
    const after = deriveInfrastructureEffects(
      network,
      waterworks.x,
      waterworks.z,
    );

    expect(service).toMatchObject({ accepted: true, salvageDelta: -4 });
    expect(after.waterLevelOffsetM).toBeLessThan(before.waterLevelOffsetM);
    expect(
      deriveInfrastructureEffects(network, waterworks.x + 100, waterworks.z)
        .waterLevelOffsetM,
    ).toBe(0);
  });

  it("keeps multiple authored machines alive under the same deterministic weather clock", () => {
    const network = createInfrastructureNetworkState();
    const pump = INFRASTRUCTURE_DEFINITIONS["long-furrow-drain-pump"];
    const quarry = INFRASTRUCTURE_DEFINITIONS["quarry-dewatering-rig"];
    const beforePump = network.entities[pump.id].condition;
    const beforeQuarry = network.entities[quarry.id].condition;

    advanceInfrastructure(network, deriveWeatherState(1230), 120);

    expect(network.entities[pump.id].condition).toBeLessThan(beforePump);
    expect(network.entities[quarry.id].condition).toBeLessThan(beforeQuarry);
    expect(
      deriveInfrastructureEffects(network, pump.x, pump.z).soilMoistureOffset,
    ).toBeLessThan(0);
    expect(
      deriveInfrastructureEffects(network, pump.x, pump.z)
        .soilDrainageRatePerHour,
    ).toBeGreaterThan(0);
    expect(
      deriveInfrastructureEffects(network, quarry.x, quarry.z)
        .waterLevelOffsetM,
    ).toBeLessThan(0);
  });

  it("changes terrain workability without turning field access into an unlock gate", () => {
    const network = createInfrastructureNetworkState();
    const pump = INFRASTRUCTURE_DEFINITIONS["long-furrow-drain-pump"];

    expect(
      deriveInfrastructureEffects(network, pump.x, pump.z)
        .terrainWorkabilityMultiplier,
    ).toBeGreaterThan(1);

    network.entities[pump.id] = {
      ...network.entities[pump.id],
      condition: 10,
      components: {
        ...network.entities[pump.id].components,
        hydraulic: 10,
        power: 10,
      },
    };

    expect(
      deriveInfrastructureEffects(network, pump.x, pump.z)
        .terrainWorkabilityMultiplier,
    ).toBeGreaterThanOrEqual(0.35);
    expect(
      deriveInfrastructureEffects(network, pump.x, pump.z)
        .terrainWorkabilityMultiplier,
    ).toBeLessThan(1);
  });

  it("uses the shared affordance contract when a nearby rig cannot service a machine", () => {
    const network = createInfrastructureNetworkState();
    const waterworks = INFRASTRUCTURE_DEFINITIONS["sunken-flats-waterworks"];
    network.entities[waterworks.id] = {
      ...network.entities[waterworks.id],
      known: true,
    };

    expect(
      resolveInfrastructureAction(
        network,
        actorAt("sunken-flats-waterworks", ["plough"]),
      ),
    ).toMatchObject({
      kind: "none",
      reason: "missing-capability",
      affordance: {
        affordanceId: "infrastructure-service:sunken-flats-waterworks",
        outcome: "impossible",
        reasonCode: "missing-capability",
        mismatchSource: "capability",
      },
    });
  });

  it("maps a legacy floodgate entity record into the canonical regional waterworks", () => {
    const recovered = recoverInfrastructureNetwork(
      {
        entities: {
          "floodgate-12": {
            known: true,
            commandedOn: true,
            components: {
              hydraulic: 80,
              mechanical: 70,
              power: 100,
              control: 75,
            },
            lastInspectedAtMs: 0,
            lastServicedAtMs: 30,
            lastServicedByRigId: "utility-tractor",
          },
        },
      },
      null,
    );

    expect(recovered.entities["sunken-flats-waterworks"]).toMatchObject({
      id: "sunken-flats-waterworks",
      known: true,
      commandedOn: true,
      lastInspectedAtMs: 0,
      lastServicedAtMs: 30,
      lastServicedByRigId: "utility-tractor",
    });
  });
});
