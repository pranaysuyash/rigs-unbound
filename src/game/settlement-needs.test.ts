import { describe, expect, it } from "vitest";
import { createInfrastructureNetworkState } from "./infrastructure-network";
import {
  createSettlementState,
  deriveSettlementCondition,
  settlementLampColor,
  settlementResidentCount,
} from "./settlement-needs";

describe("lived settlement conditions", () => {
  it("lets a failed drain pump make an earned Long Furrow visibly waterlogged in saturated weather", () => {
    const settlements = createSettlementState("repair-pump");
    settlements["long-furrow"] = {
      ...settlements["long-furrow"],
      condition: "cultivated",
      completedNeedIds: ["long-furrow-first-cut"],
    };
    const infrastructure = createInfrastructureNetworkState();
    const state = { settlements, infrastructure, worldTimeMinutes: 1200 };

    expect(deriveSettlementCondition(state, "long-furrow")).toBe("cultivated");

    infrastructure.entities["long-furrow-drain-pump"] = {
      ...infrastructure.entities["long-furrow-drain-pump"],
      condition: 10,
      components: {
        ...infrastructure.entities["long-furrow-drain-pump"].components,
        hydraulic: 10,
        power: 10,
      },
    };

    expect(deriveSettlementCondition(state, "long-furrow")).toBe("waterlogged");
    expect(settlementLampColor(state, "long-furrow")).toBe(0x9b6d49);
    expect(settlementResidentCount(state, "long-furrow")).toBe(1);

    infrastructure.entities["long-furrow-drain-pump"] = {
      ...infrastructure.entities["long-furrow-drain-pump"],
      condition: 100,
      components: {
        ...infrastructure.entities["long-furrow-drain-pump"].components,
        hydraulic: 100,
        power: 100,
      },
    };

    expect(deriveSettlementCondition(state, "long-furrow")).toBe("cultivated");
    expect(settlementResidentCount(state, "long-furrow")).toBe(3);
  });
});
