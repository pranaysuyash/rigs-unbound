import { describe, expect, it } from "vitest";
import { generateElevationContours } from "./topo-map";

describe("diegetic topo map & isometric contour generator", () => {
  it("extracts elevation contours and classifies flat terrain as safe", () => {
    const flatGrid = [
      [10, 10, 10],
      [10, 10, 10],
      [10, 10, 10],
    ];

    const contours = generateElevationContours(flatGrid, 2.0, 5.0);
    expect(contours.length).toBeGreaterThan(0);
    expect(contours[0]?.hazardLevel).toBe("safe");
    expect(contours[0]?.slopeAngleDeg).toBe(0);
  });

  it("classifies steep mountain slopes as danger hazard level", () => {
    const steepGrid = [
      [0, 15, 30],
      [0, 15, 30],
      [0, 15, 30],
    ];

    const contours = generateElevationContours(steepGrid, 2.0, 5.0);
    const danger = contours.find((c) => c.hazardLevel === "danger");
    expect(danger).not.toBeUndefined();
    expect(danger?.slopeAngleDeg).toBeGreaterThan(28);
  });
});
