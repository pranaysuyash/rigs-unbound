import { describe, expect, it } from "vitest";

import { RELAY_CARGO_TOW_AFFORDANCE, resolveAffordance } from "./affordances";

describe("resolveAffordance", () => {
  it("returns a stable legal result for a nearby tow-capable rig", () => {
    expect(
      resolveAffordance(
        RELAY_CARGO_TOW_AFFORDANCE,
        { capabilities: ["tow"] },
        { available: true, inRange: true },
      ),
    ).toMatchObject({
      outcome: "legal",
      reasonCode: "ready",
      mismatchSource: null,
      requiredCapability: "tow",
      contractVersion: 1,
    });
  });

  it("attributes an incompatible rig to the capability claim", () => {
    expect(
      resolveAffordance(
        RELAY_CARGO_TOW_AFFORDANCE,
        { capabilities: ["jump"] },
        { available: true, inRange: true },
      ),
    ).toMatchObject({
      outcome: "impossible",
      reasonCode: "missing-capability",
      mismatchSource: "capability",
    });
  });

  it("defers a compatible interaction until the rig is in range", () => {
    expect(
      resolveAffordance(
        RELAY_CARGO_TOW_AFFORDANCE,
        { capabilities: ["tow"] },
        { available: true, inRange: false },
      ),
    ).toMatchObject({
      outcome: "deferred",
      reasonCode: "out-of-range",
      mismatchSource: "world",
    });
  });
});
