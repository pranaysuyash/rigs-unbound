import { describe, expect, it } from "vitest";
import {
  SurfaceMoistureCell,
  updateSurfaceMoistureCell,
} from "./surface-moisture";

describe("surface moisture & mud saturation engine", () => {
  it("saturates soil cell and reduces soil shear strength during heavy rain", () => {
    const dryCell: SurfaceMoistureCell = {
      x: 0,
      z: 0,
      moistureRatio: 0.1,
      soilShearStrengthKpa: 35.0,
      drainageRate: 0.05,
    };

    const wetCell = updateSurfaceMoistureCell(dryCell, 1.0, 1.5); // 1.5 hours of heavy rain
    expect(wetCell.moistureRatio).toBeGreaterThan(0.1);
    expect(wetCell.soilShearStrengthKpa).toBeLessThan(35.0);
  });

  it("drains soil cell and restores shear strength when rain stops", () => {
    const saturatedCell: SurfaceMoistureCell = {
      x: 0,
      z: 0,
      moistureRatio: 0.8,
      soilShearStrengthKpa: 12.0,
      drainageRate: 0.15,
    };

    const drainedCell = updateSurfaceMoistureCell(saturatedCell, 0.0, 2.0); // 2 hours of dry weather
    expect(drainedCell.moistureRatio).toBeLessThan(0.8);
    expect(drainedCell.soilShearStrengthKpa).toBeGreaterThan(12.0);
  });
});
