import { describe, expect, it } from "vitest";
import type { PerformanceSnapshot } from "./performance";
import { selectRuntimeProfile } from "./runtime-profile-policy";

function snapshot(
  overrides: Partial<PerformanceSnapshot> = {},
): PerformanceSnapshot {
  return {
    sampledAt: 0,
    firstControllableMs: 400,
    firstInputReadyMs: 300,
    averageFrameMs: 16.67,
    p95FrameMs: 20,
    frameSampleCount: 90,
    framesPerSecond: 60,
    drawCalls: 72,
    triangles: 100_000,
    heapUsedMb: null,
    loadDurationMs: 3,
    lastSaveDurationMs: 0,
    saveBytes: 0,
    terrainBuildMs: null,
    visibility: null,
    ...overrides,
  };
}

describe("runtime profile policy", () => {
  it("holds the standard baseline until a meaningful frame sample exists", () => {
    expect(selectRuntimeProfile(snapshot({ frameSampleCount: 89 }))).toEqual({
      profile: "standard",
      state: "awaiting-evidence",
      reasons: ["insufficient-frame-samples"],
    });
  });

  it("keeps the standard baseline inside its measured envelope", () => {
    expect(selectRuntimeProfile(snapshot())).toEqual({
      profile: "standard",
      state: "within-budget",
      reasons: [],
    });
  });

  it("selects mobile-safe with every exceeded budget reason", () => {
    expect(
      selectRuntimeProfile(
        snapshot({
          averageFrameMs: 26,
          p95FrameMs: 34,
          firstControllableMs: 2_600,
        }),
      ),
    ).toEqual({
      profile: "mobile-safe",
      state: "fallback",
      reasons: [
        "average-frame-budget",
        "p95-frame-budget",
        "first-controllable-budget",
      ],
    });
  });
});
