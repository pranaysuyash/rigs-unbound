import { describe, expect, it } from "vitest";
import { ComponentHealthState, performFieldRepair, updateComponentWear } from "./vehicle-maintenance";

describe("component mechanical wear & field maintenance engine", () => {
  it("clogs radiator during mud fording and frays cable during heavy winching", () => {
    const freshState: ComponentHealthState = {
      tireTreadHealthPercent: 100,
      radiatorCleanlinessPercent: 100,
      winchCableIntegrityPercent: 100,
      alternatorBeltHealthPercent: 100,
    };

    const worn = updateComponentWear(freshState, 5.0, true, 28000);
    expect(worn.radiatorCleanlinessPercent).toBeLessThan(100);
    expect(worn.winchCableIntegrityPercent).toBeLessThan(100);
    expect(worn.tireTreadHealthPercent).toBeLessThan(100);
  });

  it("restores component health percentage when performing field repairs", () => {
    const degradedState: ComponentHealthState = {
      tireTreadHealthPercent: 40,
      radiatorCleanlinessPercent: 50,
      winchCableIntegrityPercent: 60,
      alternatorBeltHealthPercent: 70,
    };

    const repaired = performFieldRepair(degradedState, "radiatorCleanlinessPercent", 35);
    expect(repaired.radiatorCleanlinessPercent).toBe(85);
  });
});
