import { describe, expect, it } from "vitest";
import {
  computeWinchTension,
  spoolWinchLine,
  WinchCableState,
} from "./winch-physics";

describe("winch cable physics engine", () => {
  it("produces zero tension when distance is less than rest length", () => {
    const cable: WinchCableState = {
      attached: true,
      anchorId: "tree-1",
      anchorPos: { x: 10, y: 0, z: 0 },
      restLengthMeters: 15,
      currentLengthMeters: 10,
      tensionN: 0,
      snapped: false,
    };

    const result = computeWinchTension(
      { x: 0, y: 0, z: 0 },
      { x: 0, z: 0 },
      cable,
    );
    expect(result.tensionN).toBe(0);
    expect(result.snapped).toBe(false);
  });

  it("calculates pull force vector when stretched beyond rest length", () => {
    const cable: WinchCableState = {
      attached: true,
      anchorId: "tree-1",
      anchorPos: { x: 20, y: 0, z: 0 },
      restLengthMeters: 15,
      currentLengthMeters: 20,
      tensionN: 0,
      snapped: false,
    };

    const result = computeWinchTension(
      { x: 0, y: 0, z: 0 },
      { x: 0, z: 0 },
      cable,
    );
    expect(result.tensionN).toBeGreaterThan(1000);
    expect(result.pullVector.x).toBeGreaterThan(0);
  });

  it("spools in winch line to shorten rest length", () => {
    const cable: WinchCableState = {
      attached: true,
      anchorId: "tree-1",
      anchorPos: { x: 20, y: 0, z: 0 },
      restLengthMeters: 15,
      currentLengthMeters: 20,
      tensionN: 0,
      snapped: false,
    };

    const spooled = spoolWinchLine(cable, -2.5);
    expect(spooled.restLengthMeters).toBe(12.5);
  });

  it("fails anchor when tension exceeds anchor max hold force (S2/S3 sensitivity)", () => {
    const cable: WinchCableState = {
      attached: true,
      anchorId: "weak-tree-1",
      anchorPos: { x: 20, y: 0, z: 0 },
      anchorHoldForceN: 10_000, // Light tree holds max 10 kN
      restLengthMeters: 10,
      currentLengthMeters: 20,
      tensionN: 0,
      snapped: false,
    };

    const result = computeWinchTension(
      { x: 0, y: 0, z: 0 },
      { x: 0, z: 0 },
      cable,
    );

    // Tension is ~45,000 N which exceeds 10,000 N anchor limit
    expect(result.anchorFailed).toBe(true);
    expect(result.pullVector).toEqual({ x: 0, z: 0 });
  });

  it("snaps cable when tension exceeds CABLE_MAX_TENSION_N", () => {
    const cable: WinchCableState = {
      attached: true,
      anchorId: "rock-anchor-1",
      anchorPos: { x: 30, y: 0, z: 0 },
      anchorHoldForceN: 50_000, // Heavy rock holds up to 50 kN
      restLengthMeters: 10,
      currentLengthMeters: 30,
      tensionN: 0,
      snapped: false,
    };

    const result = computeWinchTension(
      { x: 0, y: 0, z: 0 },
      { x: 0, z: 0 },
      cable,
    );

    // Tension ~90,000 N exceeds 35,000 N cable limit
    expect(result.snapped).toBe(true);
    expect(result.anchorFailed).toBe(true); // Cable snapped and tension exceeds hold
    expect(result.pullVector).toEqual({ x: 0, z: 0 });
  });
});
