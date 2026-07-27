import { describe, expect, it } from "vitest";
import { computeWinchTension, spoolWinchLine, WinchCableState } from "./winch-physics";

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

    const result = computeWinchTension({ x: 0, y: 0, z: 0 }, { x: 0, z: 0 }, cable);
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


    const result = computeWinchTension({ x: 0, y: 0, z: 0 }, { x: 0, z: 0 }, cable);
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
});
