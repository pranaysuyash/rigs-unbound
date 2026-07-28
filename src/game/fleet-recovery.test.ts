import { describe, expect, it } from "vitest";
import {
  createTandemTowConnection,
  updateTandemTowPhysics,
} from "./fleet-recovery";

describe("multi-vehicle tandem fleet recovery engine", () => {
  it("calculates zero tow strap tension when distance is within rest length", () => {
    const conn = createTandemTowConnection("rig-alpha", "rig-beta", 8.0);
    const updated = updateTandemTowPhysics(conn, 7.5, 12000, 15000);

    expect(updated.strapTensionN).toBe(0);
    expect(updated.combinedTractiveForceN).toBe(12000);
  });

  it("calculates dynamic tow tension and combined pulling force when stretched", () => {
    const conn = createTandemTowConnection("rig-alpha", "rig-beta", 8.0);
    const updated = updateTandemTowPhysics(conn, 10.0, 12000, 15000); // 2m stretch

    expect(updated.strapTensionN).toBeGreaterThan(5000);
    expect(updated.combinedTractiveForceN).toBeGreaterThan(12000);
  });
});
