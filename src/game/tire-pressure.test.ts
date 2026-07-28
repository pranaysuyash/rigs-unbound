import { describe, expect, it } from "vitest";
import {
  adjustTirePressure,
  calculateTirePressureState,
} from "./tire-pressure";

describe("tire pressure & contact patch engine", () => {
  it("expands contact patch area and lowers ground pressure when airing down", () => {
    const highway = calculateTirePressureState(35, 500);
    const airedDown = calculateTirePressureState(12, 500);

    expect(airedDown.contactPatchAreaM2).toBeGreaterThan(
      highway.contactPatchAreaM2,
    );
    expect(airedDown.groundPressureKpa).toBeLessThan(highway.groundPressureKpa);
    expect(airedDown.mudFloatationFactor).toBeGreaterThan(
      highway.mudFloatationFactor,
    );
  });

  it("adjusts tire pressure cleanly within 10 to 45 PSI limits", () => {
    expect(adjustTirePressure(20, -15)).toBe(10);
    expect(adjustTirePressure(40, 10)).toBe(45);
    expect(adjustTirePressure(30, -5)).toBe(25);
  });
});
