import { describe, expect, it } from "vitest";
import { ElectricalGridState, updateElectricalGrid } from "./electrical-grid";

describe("electrical battery & alternator power grid", () => {
  it("recharges battery when alternator output exceeds load current", () => {
    const initial: ElectricalGridState = {
      batteryCapacityAh: 75,
      currentChargeAh: 40,
      batteryVoltage: 12.2,
      isHeadlightsActive: false,
      isWinchActive: false,
      isSeismicActive: false,
      accessoryCutoffTriggered: false,
    };

    const charged = updateElectricalGrid(initial, 2500, 60); // 2500 RPM for 60s
    expect(charged.currentChargeAh).toBeGreaterThan(40);
  });

  it("triggers accessory cutoff when heavy winch load depletes battery voltage below 10.8V", () => {
    const lowBattery: ElectricalGridState = {
      batteryCapacityAh: 75,
      currentChargeAh: 2, // Nearly empty
      batteryVoltage: 10.7,
      isHeadlightsActive: true,
      isWinchActive: true,
      isSeismicActive: false,
      accessoryCutoffTriggered: false,
    };

    const updated = updateElectricalGrid(lowBattery, 800, 5); // Low idle RPM under 110A winch load
    expect(updated.accessoryCutoffTriggered).toBe(true);
    expect(updated.isWinchActive).toBe(false);
  });
});
