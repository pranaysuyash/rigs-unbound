import { describe, expect, it } from "vitest";
import {
  createFirstNightThreat,
  firstNightThreatDiagnostic,
  firstNightThreatObstacle,
  recoverFirstNightThreat,
  resolveFirstNightThreat,
  type FirstNightThreatInputs,
} from "./first-night-threat";

const NORTH_FIELD = { x: 40, z: -120 };
const HOME = { x: 0, z: 0 };

function inputs(
  overrides: Partial<FirstNightThreatInputs> = {},
): FirstNightThreatInputs {
  return {
    waterworksChoice: "repair-pump",
    northFieldSurveyed: false,
    northFieldX: NORTH_FIELD.x,
    northFieldZ: NORTH_FIELD.z,
    homeX: HOME.x,
    homeZ: HOME.z,
    ...overrides,
  };
}

// Regression: FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md's "first night" beat named
// the buried signal as the source of night pressure, differentiated by
// whether the north field was surveyed. Before this module, the runtime's
// only night-adjacent event was the branch-blind Quarry Runout storm, so this
// test would have failed against every prior implementation of night
// pressure in this repo.
describe("resolveFirstNightThreat", () => {
  it("orients to the buried signal only when the north field was surveyed", () => {
    const surveyed = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: true }),
    );
    const unsurveyed = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: false }),
    );

    expect(surveyed.variant).toBe("signal-drawn");
    expect(unsurveyed.variant).toBe("storm-pressure");
    expect(surveyed.variant).not.toBe(unsurveyed.variant);
  });

  it("places the signal-drawn threat at the north field, not the farm", () => {
    const resolved = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: true }),
    );
    expect(resolved.originX).toBe(NORTH_FIELD.x);
    expect(resolved.originZ).toBe(NORTH_FIELD.z);
  });

  it("places the storm-pressure threat at the farm, not the north field", () => {
    const resolved = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: false }),
    );
    expect(resolved.originX).toBe(HOME.x);
    expect(resolved.originZ).toBe(HOME.z);
  });

  it("resolves exactly once and ignores later calls (idempotent per save)", () => {
    const first = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: true }),
    );
    const second = resolveFirstNightThreat(
      first,
      2000,
      inputs({ northFieldSurveyed: false }),
    );
    expect(second).toEqual(first);
    expect(second.variant).toBe("signal-drawn");
    expect(second.resolvedAtWorldMinutes).toBe(1200);
  });

  it("records a non-negative world-minute timestamp even for a malformed negative input", () => {
    const resolved = resolveFirstNightThreat(
      createFirstNightThreat(),
      -5,
      inputs(),
    );
    expect(resolved.resolvedAtWorldMinutes).toBe(0);
  });
});

describe("firstNightThreatDiagnostic", () => {
  it("differs by both survey status and waterworks branch (4 distinct readings)", () => {
    const combinations = [
      { northFieldSurveyed: true, waterworksChoice: "repair-pump" as const },
      { northFieldSurveyed: true, waterworksChoice: "redirect-channel" as const },
      { northFieldSurveyed: false, waterworksChoice: "repair-pump" as const },
      {
        northFieldSurveyed: false,
        waterworksChoice: "redirect-channel" as const,
      },
    ];
    const readings = combinations.map((combo) => {
      const resolved = resolveFirstNightThreat(
        createFirstNightThreat(),
        1200,
        inputs(combo),
      );
      return firstNightThreatDiagnostic(resolved, combo.waterworksChoice);
    });

    for (const reading of readings) {
      expect(reading).not.toBeNull();
      expect(typeof reading).toBe("string");
    }
    expect(new Set(readings).size).toBe(4);
  });

  it("returns null before the threat has resolved", () => {
    expect(
      firstNightThreatDiagnostic(createFirstNightThreat(), "unresolved"),
    ).toBeNull();
  });
});

describe("firstNightThreatObstacle", () => {
  it("is null before the threat resolves", () => {
    expect(firstNightThreatObstacle(createFirstNightThreat(), 0)).toBeNull();
  });

  it("is a fellable-false rock at the resolved origin once it fires", () => {
    const resolved = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: true }),
    );
    const obstacle = firstNightThreatObstacle(resolved, 12.5);
    expect(obstacle).not.toBeNull();
    expect(obstacle?.x).toBe(NORTH_FIELD.x);
    expect(obstacle?.z).toBe(NORTH_FIELD.z);
    expect(obstacle?.groundY).toBe(12.5);
    expect(obstacle?.fellable).toBe(false);
    expect(obstacle?.kind).toBe("rock");
  });

  it("the signal-drawn hazard reads larger than the storm-pressure hazard", () => {
    const signalDrawn = firstNightThreatObstacle(
      resolveFirstNightThreat(
        createFirstNightThreat(),
        1200,
        inputs({ northFieldSurveyed: true }),
      ),
      0,
    );
    const stormPressure = firstNightThreatObstacle(
      resolveFirstNightThreat(
        createFirstNightThreat(),
        1200,
        inputs({ northFieldSurveyed: false }),
      ),
      0,
    );
    expect(signalDrawn?.radius ?? 0).toBeGreaterThan(
      stormPressure?.radius ?? 0,
    );
  });
});

describe("recoverFirstNightThreat", () => {
  it("recovers a resolved record exactly", () => {
    const resolved = resolveFirstNightThreat(
      createFirstNightThreat(),
      1200,
      inputs({ northFieldSurveyed: true }),
    );
    const roundTripped = recoverFirstNightThreat(
      JSON.parse(JSON.stringify(resolved)),
    );
    expect(roundTripped).toEqual(resolved);
  });

  it("falls back to pending for missing, malformed, or foreign records", () => {
    expect(recoverFirstNightThreat(undefined)).toEqual(
      createFirstNightThreat(),
    );
    expect(recoverFirstNightThreat(null)).toEqual(createFirstNightThreat());
    expect(recoverFirstNightThreat({ id: "quarry-runout" })).toEqual(
      createFirstNightThreat(),
    );
    expect(
      recoverFirstNightThreat({
        id: "first-night-threat",
        status: "resolved",
        variant: "not-a-real-variant",
      }),
    ).toEqual(createFirstNightThreat());
  });

  it("rejects a resolved status without a variant rather than inventing one", () => {
    const recovered = recoverFirstNightThreat({
      id: "first-night-threat",
      status: "resolved",
      variant: null,
    });
    expect(recovered.status).toBe("pending");
    expect(recovered.variant).toBeNull();
  });
});
