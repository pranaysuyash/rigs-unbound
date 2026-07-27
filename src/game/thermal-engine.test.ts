import { describe, expect, it } from "vitest";
import { EngineThermalState, updateEngineThermalState } from "./thermal-engine";

describe("engine thermal cooling engine", () => {
  it("heats engine under sustained heavy load", () => {
    const initial: EngineThermalState = {
      temperatureCelsius: 85,
      isOverheated: false,
      powerMultiplier: 1.0,
      warningIndicator: false,
    };

    const heated = updateEngineThermalState(initial, 1.0, 2.0, false, 25, 10);
    expect(heated.temperatureCelsius).toBeGreaterThan(85);
  });

  it("cools engine rapidly when fording cold water", () => {
    const hotState: EngineThermalState = {
      temperatureCelsius: 112,
      isOverheated: true,
      powerMultiplier: 0.8,
      warningIndicator: true,
    };

    const cooled = updateEngineThermalState(hotState, 0.2, 3.0, true, 18, 5);
    expect(cooled.temperatureCelsius).toBeLessThan(112);
  });
});
