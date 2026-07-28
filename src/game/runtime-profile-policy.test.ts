import { describe, expect, it } from "vitest";
import { PerformanceMonitor, type PerformanceSnapshot } from "./performance";
import {
  RuntimeProfileController,
  selectRuntimeProfile,
} from "./runtime-profile-policy";

function snapshot(
  overrides: Partial<PerformanceSnapshot> = {},
): PerformanceSnapshot {
  const baseSnapshot: PerformanceSnapshot = {
    sampledAt: 0,
    firstControllableMs: 400,
    firstInputReadyMs: 300,
    firstActionReadyMs: null,
    averageFrameMs: 16.67,
    p95FrameMs: 20,
    frameSampleCount: 90,
    totalFrameSampleCount: 90,
    framesPerSecond: 60,
    drawCalls: 72,
    triangles: 100_000,
    geometries: 44,
    textures: 1,
    heapUsedMb: null,
    loadDurationMs: 3,
    lastSaveDurationMs: 0,
    saveBytes: 0,
    terrainBuildMs: null,
    visibility: null,
    gpuMemoryMb: null,
    rendererBackend: "webgl",
    rendererRequestedBackend: "auto",
    rendererBackendFallback: false,
    rendererBackendReason: "requested-webgl",
    largestContentfulPaintMs: null,
    inputDelayMs: null,
    cumulativeLayoutShift: 0,
    longTaskCount: 0,
    longTaskDurationMs: 0,
  };

  return {
    ...baseSnapshot,
    ...overrides,
    sampledAt: overrides.sampledAt ?? baseSnapshot.sampledAt,
    firstControllableMs:
      overrides.firstControllableMs ?? baseSnapshot.firstControllableMs,
    firstInputReadyMs:
      overrides.firstInputReadyMs ?? baseSnapshot.firstInputReadyMs,
    firstActionReadyMs:
      overrides.firstActionReadyMs ?? baseSnapshot.firstActionReadyMs,
    averageFrameMs: overrides.averageFrameMs ?? baseSnapshot.averageFrameMs,
    p95FrameMs: overrides.p95FrameMs ?? baseSnapshot.p95FrameMs,
    frameSampleCount:
      overrides.frameSampleCount ?? baseSnapshot.frameSampleCount,
    totalFrameSampleCount:
      overrides.totalFrameSampleCount ?? baseSnapshot.totalFrameSampleCount,
    framesPerSecond: overrides.framesPerSecond ?? baseSnapshot.framesPerSecond,
    rendererBackend: overrides.rendererBackend ?? "webgl",
    rendererRequestedBackend: overrides.rendererRequestedBackend ?? "auto",
    rendererBackendFallback: overrides.rendererBackendFallback ?? false,
    rendererBackendReason: overrides.rendererBackendReason ?? "requested-webgl",
    drawCalls: overrides.drawCalls ?? baseSnapshot.drawCalls,
    triangles: overrides.triangles ?? baseSnapshot.triangles,
    geometries: overrides.geometries ?? baseSnapshot.geometries,
    textures: overrides.textures ?? baseSnapshot.textures,
    heapUsedMb: overrides.heapUsedMb ?? baseSnapshot.heapUsedMb,
    loadDurationMs: overrides.loadDurationMs ?? baseSnapshot.loadDurationMs,
    lastSaveDurationMs:
      overrides.lastSaveDurationMs ?? baseSnapshot.lastSaveDurationMs,
    saveBytes: overrides.saveBytes ?? baseSnapshot.saveBytes,
    terrainBuildMs: overrides.terrainBuildMs ?? baseSnapshot.terrainBuildMs,
    visibility: overrides.visibility ?? baseSnapshot.visibility,
    gpuMemoryMb: overrides.gpuMemoryMb ?? baseSnapshot.gpuMemoryMb,
    largestContentfulPaintMs:
      overrides.largestContentfulPaintMs ??
      baseSnapshot.largestContentfulPaintMs,
    inputDelayMs: overrides.inputDelayMs ?? baseSnapshot.inputDelayMs,
    cumulativeLayoutShift:
      overrides.cumulativeLayoutShift ?? baseSnapshot.cumulativeLayoutShift,
    longTaskCount: overrides.longTaskCount ?? baseSnapshot.longTaskCount,
    longTaskDurationMs:
      overrides.longTaskDurationMs ?? baseSnapshot.longTaskDurationMs,
  };
}

describe("runtime profile policy", () => {
  it("holds the standard baseline until a meaningful frame sample exists", () => {
    expect(selectRuntimeProfile(snapshot({ frameSampleCount: 89 }))).toEqual({
      profile: "standard",
      state: "awaiting-evidence",
      reasons: ["insufficient-frame-samples"],
      reasonText: "Still measuring frame performance.",
    });
  });

  it("keeps the standard baseline inside its measured envelope", () => {
    expect(selectRuntimeProfile(snapshot())).toEqual({
      profile: "standard",
      state: "within-budget",
      reasons: [],
      reasonText: "",
    });
  });

  it("selects mobile-safe with every exceeded budget reason", () => {
    expect(
      selectRuntimeProfile(
        snapshot({
          averageFrameMs: 26,
          p95FrameMs: 34,
        }),
      ),
    ).toEqual({
      profile: "mobile-safe",
      state: "fallback",
      reasons: ["average-frame-budget", "p95-frame-budget"],
      reasonText:
        "Average frame time exceeded the comfort target. Stutter spikes exceeded the comfort target.",
    });
  });

  it("holds fallback through a healthy hysteresis window before recovery", () => {
    const controller = new RuntimeProfileController(
      {
        minimumFrameSamples: 3,
        maximumAverageFrameMs: 20,
        maximumP95FrameMs: 30,
        maximumFirstControllableMs: 2_500,
      },
      { minimumHealthyFrames: 5 },
    );

    expect(
      controller.evaluate(
        snapshot({
          frameSampleCount: 3,
          totalFrameSampleCount: 3,
          averageFrameMs: 21,
        }),
      ),
    ).toMatchObject({ profile: "mobile-safe", state: "fallback" });
    expect(
      controller.evaluate(
        snapshot({ frameSampleCount: 3, totalFrameSampleCount: 7 }),
      ),
    ).toEqual({
      profile: "mobile-safe",
      state: "fallback",
      reasons: ["average-frame-budget", "recovery-window"],
      reasonText:
        "Average frame time exceeded the comfort target. Waiting for steady frames before restoring detail.",
    });
    expect(
      controller.evaluate(
        snapshot({
          frameSampleCount: 3,
          totalFrameSampleCount: 8,
        }),
      ),
    ).toEqual({
      profile: "standard",
      state: "within-budget",
      reasons: [],
      reasonText: "",
    });
  });

  it("restarts the healthy recovery window after renewed renderer pressure", () => {
    const controller = new RuntimeProfileController(
      {
        minimumFrameSamples: 3,
        maximumAverageFrameMs: 20,
        maximumP95FrameMs: 30,
        maximumFirstControllableMs: 2_500,
      },
      { minimumHealthyFrames: 5 },
    );

    expect(
      controller.evaluate(
        snapshot({
          frameSampleCount: 3,
          totalFrameSampleCount: 3,
          averageFrameMs: 21,
        }),
      ),
    ).toMatchObject({ profile: "mobile-safe", state: "fallback" });
    expect(
      controller.evaluate(
        snapshot({ frameSampleCount: 3, totalFrameSampleCount: 6 }),
      ),
    ).toMatchObject({ profile: "mobile-safe", state: "fallback" });
    expect(
      controller.evaluate(
        snapshot({
          frameSampleCount: 3,
          totalFrameSampleCount: 7,
          averageFrameMs: 21,
        }),
      ),
    ).toMatchObject({ profile: "mobile-safe", state: "fallback" });
    expect(
      controller.evaluate(
        snapshot({ frameSampleCount: 3, totalFrameSampleCount: 11 }),
      ),
    ).toEqual({
      profile: "mobile-safe",
      state: "fallback",
      reasons: ["average-frame-budget", "recovery-window"],
      reasonText:
        "Average frame time exceeded the comfort target. Waiting for steady frames before restoring detail.",
    });
    expect(
      controller.evaluate(
        snapshot({ frameSampleCount: 3, totalFrameSampleCount: 12 }),
      ),
    ).toEqual({
      profile: "standard",
      state: "within-budget",
      reasons: [],
      reasonText: "",
    });
  });

  it("restarts the healthy recovery window after renewed renderer pressure", () => {
    const controller = new RuntimeProfileController(
      {
        minimumFrameSamples: 3,
        maximumAverageFrameMs: 20,
        maximumP95FrameMs: 30,
        maximumFirstControllableMs: 2_500,
      },
      { minimumHealthyFrames: 5 },
    );
    expect(
      controller.evaluate(
        snapshot({
          frameSampleCount: 3,
          totalFrameSampleCount: 3,
          averageFrameMs: 21,
        }),
      ),
    ).toMatchObject({ profile: "mobile-safe", state: "fallback" });

    controller.reset();

    expect(
      controller.evaluate(
        snapshot({
          frameSampleCount: 0,
          totalFrameSampleCount: 0,
          averageFrameMs: 0,
          p95FrameMs: 0,
        }),
      ),
    ).toEqual({
      profile: "standard",
      state: "awaiting-evidence",
      reasons: ["insufficient-frame-samples"],
      reasonText: "Still measuring frame performance.",
    });
  });
});

describe("first controllable frame budget", () => {
  /**
   * The budget exists because a link-native game loses a visitor in seconds. These
   * assert it actually changes the selection — an unconsumed budget field is the
   * same inert-promise defect as a module that advertises a capability it lacks.
   */
  it("degrades immediately on a slow first frame, without waiting for frame samples", () => {
    const selection = selectRuntimeProfile(
      snapshot({ firstControllableMs: 6_000, frameSampleCount: 0 }),
    );
    expect(selection.profile).toBe("mobile-safe");
    expect(selection.state).toBe("fallback");
    expect(selection.reasons).toContain("first-controllable-budget");
  });

  it("leaves a fast first frame on the standard profile", () => {
    const selection = selectRuntimeProfile(
      snapshot({ firstControllableMs: 450 }),
    );
    expect(selection.reasons).not.toContain("first-controllable-budget");
    expect(selection.profile).toBe("standard");
  });

  it("does not degrade when the first frame has not been reached yet", () => {
    const selection = selectRuntimeProfile(
      snapshot({ firstControllableMs: null, frameSampleCount: 0 }),
    );
    expect(selection.reasons).toEqual(["insufficient-frame-samples"]);
  });

  it("excludes welcome-panel dwell from the first controllable budget", () => {
    const monitor = new PerformanceMonitor(0, 3);
    const renderer = {
      drawCalls: 1,
      triangles: 12,
      geometries: 1,
      textures: 0,
      rendererBackend: "webgl" as const,
      rendererRequestedBackend: "auto" as const,
      rendererBackendFallback: false,
      rendererBackendReason: "test",
    };

    monitor.beginControllableMeasurement(120_000);
    monitor.markControllable(120_016);

    expect(
      selectRuntimeProfile(monitor.snapshot(renderer)).reasons,
    ).not.toContain("first-controllable-budget");
    expect(monitor.snapshot(renderer).firstControllableMs).toBe(16);
  });
});
