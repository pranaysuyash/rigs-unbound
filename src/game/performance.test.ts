import { describe, expect, it } from "vitest";
import { PerformanceMonitor } from "./performance";

describe("performance readiness markers", () => {
  it("records input readiness and controllability independently and only once", () => {
    const monitor = new PerformanceMonitor(100, 4.25);
    const metrics = {
      drawCalls: 12,
      triangles: 240,
      geometries: 4,
      textures: 2,
    };

    expect(monitor.snapshot(metrics).firstInputReadyMs).toBeNull();
    expect(monitor.snapshot(metrics).firstControllableMs).toBeNull();

    monitor.markInputReady(125);
    monitor.markInputReady(190);
    monitor.beginControllableMeasurement(130);
    monitor.markControllable(140);
    monitor.markControllable(210);

    const snapshot = monitor.snapshot(metrics);
    expect(snapshot.firstInputReadyMs).toBe(25);
    expect(snapshot.firstControllableMs).toBe(10);
    expect(snapshot.loadDurationMs).toBe(4.25);
    expect(snapshot.geometries).toBe(4);
    expect(snapshot.textures).toBe(2);
  });

  it("reports how many bounded frames support its timing summary", () => {
    const monitor = new PerformanceMonitor(0, 0);
    const metrics = { drawCalls: 0, triangles: 0, geometries: 0, textures: 0 };

    monitor.recordFrame(12);
    monitor.recordFrame(16);
    monitor.recordFrame(20);

    expect(monitor.snapshot(metrics)).toMatchObject({
      frameSampleCount: 3,
      totalFrameSampleCount: 3,
      averageFrameMs: 16,
      p95FrameMs: 20,
    });

    monitor.resetFrameWindow();
    expect(monitor.snapshot(metrics)).toMatchObject({
      frameSampleCount: 0,
      totalFrameSampleCount: 0,
      averageFrameMs: 0,
      p95FrameMs: 0,
    });
  });
});
