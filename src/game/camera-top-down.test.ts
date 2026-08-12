import { describe, expect, it } from "vitest";
import {
  TOP_DOWN_CAMERA_SPECS,
  calculateTopDownTargetLead,
} from "./camera";

describe("Top-Down Camera Specs & Target Lead", () => {
  it("defines specs for diorama, flat, and heading presentation styles", () => {
    expect(TOP_DOWN_CAMERA_SPECS["top-down-diorama"].tiltAngleDeg).toBe(75);
    expect(TOP_DOWN_CAMERA_SPECS["top-down-flat"].tiltAngleDeg).toBe(90);
    expect(TOP_DOWN_CAMERA_SPECS["top-down-heading"].headingLocked).toBe(true);
  });

  it("calculates predictive target lead from velocity and bounds max lead distance", () => {
    const leadNormal = calculateTopDownTargetLead(10, 0, 0.5, 12);
    expect(leadNormal.leadX).toBe(5);
    expect(leadNormal.leadZ).toBe(0);

    const leadBounded = calculateTopDownTargetLead(100, 0, 1.0, 12);
    expect(leadBounded.leadX).toBe(12);
    expect(leadBounded.leadZ).toBe(0);
  });
});
