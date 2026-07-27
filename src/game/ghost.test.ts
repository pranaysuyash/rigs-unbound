import { describe, expect, it } from "vitest";
import type { RigState } from "./contracts";
import { GhostTrailRecorder } from "./ghost";

describe("ghost trail recorder", () => {
  it("records telemetry snapshots at 10Hz sample rate", () => {
    const recorder = new GhostTrailRecorder();
    const mockRig = { x: 10, y: 1, z: 20, heading: 0, speed: 5 } as RigState;

    recorder.record(mockRig, 0);
    recorder.record(mockRig, 50); // Ignored due to 100ms sample interval
    recorder.record(mockRig, 100);

    expect(recorder.getSnapshots()).toHaveLength(2);
  });

  it("interpolates ghost transform smoothly between keyframes", () => {
    const recorder = new GhostTrailRecorder();
    const mockRig1 = { x: 0, y: 0, z: 0, heading: 0, speed: 0 } as RigState;
    const mockRig2 = { x: 10, y: 0, z: 20, heading: 1, speed: 10 } as RigState;

    recorder.record(mockRig1, 0);
    recorder.record(mockRig2, 100);

    const mid = recorder.sampleAt(50);
    expect(mid).toBeDefined();
    expect(mid?.x).toBeCloseTo(5);
    expect(mid?.z).toBeCloseTo(10);
    expect(mid?.heading).toBeCloseTo(0.5);
  });
});
