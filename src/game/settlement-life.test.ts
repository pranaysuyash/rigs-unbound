import { describe, expect, it } from "vitest";
import { NIGHT_START_MINUTE } from "./contracts";
import { createInitialState } from "./state";
import {
  deriveSettlementLife,
  resolveSettlementContribution,
  settlementContactSpeech,
} from "./settlement-life";
import { findSite } from "./world";

describe("open-world settlement life", () => {
  it("projects concurrent Rustline pressures from community history and a live route incident", () => {
    const state = createInitialState("SETTLEMENT-LIFE-RUSTLINE");
    const life = deriveSettlementLife(state, { quarryRunoutStatus: "active" });
    const rustline = life.find(
      (settlement) => settlement.settlementId === "rustline-salvage",
    );

    expect(rustline?.pressures.map((pressure) => pressure.kind)).toEqual(
      expect.arrayContaining(["route-isolation", "route-disruption"]),
    );
    expect(
      rustline?.responses.some((response) =>
        response.compatibleCapabilities.includes("tow"),
      ),
    ).toBe(true);
    expect(rustline?.residents.map((resident) => resident.activity)).toContain(
      "route-watch",
    );
  });

  it("keeps every authored resident present while changing their work under pressure", () => {
    const state = createInitialState("SETTLEMENT-LIFE-FURROW");
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "waterlogged",
    };
    const life = deriveSettlementLife(state, { quarryRunoutStatus: "dormant" });
    const furrow = life.find(
      (settlement) => settlement.settlementId === "long-furrow",
    );

    expect(furrow?.residents).toHaveLength(3);
    expect(furrow?.residents.map((resident) => resident.activity)).toContain(
      "sheltering",
    );
    expect(
      furrow?.services.every((service) => service.availability !== "open"),
    ).toBe(true);
  });

  it("lets different machine contributions relieve different Long Furrow services without completing the settlement", () => {
    const state = createInitialState("SETTLEMENT-LIFE-PARTIAL");
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "waterlogged",
      contributions: [
        {
          responseId: "long-furrow:cut-relief-channel",
          materialEffectId: "long-furrow:drainage-cut",
          capability: "plough",
          createdAtWorldMinutes: 440,
        },
      ],
    };

    const furrow = deriveSettlementLife(state, {
      quarryRunoutStatus: "dormant",
    }).find((settlement) => settlement.settlementId === "long-furrow");

    expect(furrow?.condition).toBe("waterlogged");
    expect(
      furrow?.services.find((service) => service.label === "Field exchange")
        ?.availability,
    ).toBe("open");
    expect(
      furrow?.services.find((service) => service.label === "Stores exchange")
        ?.availability,
    ).toBe("sheltering");
    expect(
      furrow?.responses.find(
        (response) => response.id === "long-furrow:cut-relief-channel",
      )?.status,
    ).toBe("contributed");
    expect(
      furrow?.responses.find(
        (response) => response.id === "long-furrow:move-soaked-stores",
      )?.status,
    ).toBe("available");
    expect(
      furrow?.responses.find(
        (response) => response.id === "long-furrow:move-soaked-stores",
      )?.consequence?.kind,
    ).toBe("raised-stores");
    expect(
      furrow?.residents.find((resident) => resident.role === "grower")
        ?.activity,
    ).toBe("field-work");
    expect(furrow && settlementContactSpeech(furrow)).toContain(
      "Cut relief channels",
    );
  });

  it("lets ordinary settlement work go off shift after dark without creating a time gate", () => {
    const state = createInitialState("SETTLEMENT-LIFE-NIGHT-RHYTHM");
    state.worldTimeMinutes = NIGHT_START_MINUTE + 15;
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "cultivated",
    };

    const furrow = deriveSettlementLife(state, {
      quarryRunoutStatus: "dormant",
    }).find((settlement) => settlement.settlementId === "long-furrow");

    expect(furrow?.shift).toBe("after-dark");
    expect(
      furrow?.services.every((service) => service.availability === "off-shift"),
    ).toBe(true);
    expect(
      furrow?.residents.find((resident) => resident.role === "grower")
        ?.activity,
    ).toBe("resting");
    expect(furrow?.responses).toEqual([]);
  });

  it("requires a machine to reach a material affordance rather than accepting help across a settlement", () => {
    const state = createInitialState("SETTLEMENT-LIFE-SPATIAL-AFFORDANCE");
    const furrow = findSite("long-furrow")!;
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "waterlogged",
    };

    expect(
      resolveSettlementContribution(
        state,
        { quarryRunoutStatus: "dormant" },
        { x: 0, z: 0, capabilities: ["tow"], interaction: "context" },
      ),
    ).toBeNull();
    expect(
      resolveSettlementContribution(
        state,
        { quarryRunoutStatus: "dormant" },
        {
          x: furrow.x + 7.4,
          z: furrow.z - 5.8,
          capabilities: ["tow"],
          interaction: "context",
        },
      )?.id,
    ).toBe("long-furrow:move-soaked-stores");
  });

  it("projects a community adaptation as partial capacity rather than a completed place", () => {
    const state = createInitialState("SETTLEMENT-LIFE-ADAPTATION");
    state.settlements["long-furrow"] = {
      ...state.settlements["long-furrow"],
      condition: "waterlogged",
      adaptations: [
        {
          id: "long-furrow:raise-stores-routine",
          materialEffectId: "long-furrow:self-raised-stores",
          createdAtWorldMinutes: 1440,
        },
      ],
    };
    const furrow = deriveSettlementLife(state, {
      quarryRunoutStatus: "dormant",
    }).find((settlement) => settlement.settlementId === "long-furrow");

    expect(furrow?.adaptations.map((adaptation) => adaptation.id)).toContain(
      "long-furrow:raise-stores-routine",
    );
    expect(
      furrow?.services.find((service) => service.label === "Stores exchange")
        ?.availability,
    ).toBe("limited");
    expect(
      furrow?.services.find((service) => service.label === "Field exchange")
        ?.availability,
    ).toBe("sheltering");
  });
});
