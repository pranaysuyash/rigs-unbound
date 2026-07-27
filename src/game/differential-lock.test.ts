import { describe, expect, it } from "vitest";
import { computeAxleTorque } from "./differential-lock";

describe("differential lock & torque vectoring engine", () => {
  it("loses drive force in open diff mode when one wheel is stuck in 0 grip mud", () => {
    const openDiff = computeAxleTorque(500, 1.0, 0.0, "open");
    expect(openDiff.effectiveDriveForceN).toBe(0);
  });

  it("maintains 50% torque pull on gripping wheel when differential is locked", () => {
    const lockedDiff = computeAxleTorque(500, 1.0, 0.0, "locked");
    expect(lockedDiff.effectiveDriveForceN).toBeGreaterThan(200);
    expect(lockedDiff.turningScrubFactor).toBe(1.25);
  });
});
