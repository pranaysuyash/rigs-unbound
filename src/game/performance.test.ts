import { describe, expect, it } from "vitest";
import { PerformanceMonitor } from "./performance";

describe("performance readiness markers", () => {
  it("records input readiness and controllability independently and only once", () => {
    const monitor = new PerformanceMonitor(100, 4.25);
    const metrics = { drawCalls: 12, triangles: 240 };

    expect(monitor.snapshot(metrics).firstInputReadyMs).toBeNull();
    expect(monitor.snapshot(metrics).firstControllableMs).toBeNull();

    monitor.markInputReady(125);
    monitor.markInputReady(190);
    monitor.markControllable(140);
    monitor.markControllable(210);

    const snapshot = monitor.snapshot(metrics);
    expect(snapshot.firstInputReadyMs).toBe(25);
    expect(snapshot.firstControllableMs).toBe(40);
    expect(snapshot.loadDurationMs).toBe(4.25);
  });
});
