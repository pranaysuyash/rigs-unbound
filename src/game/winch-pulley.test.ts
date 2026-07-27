import { describe, expect, it } from "vitest";
import { computeWinchPulleyOutput, WinchPulleyConfig } from "./winch-pulley";

describe("winch snatch block & pulley mechanical advantage engine", () => {
  it("doubles pulling force and halves spool speed in 2x snatch block configuration", () => {
    const singleLine: WinchPulleyConfig = { pulleyRatio: 1, baseLinePullForceN: 35000, baseSpoolSpeedMps: 0.4 };
    const doubleLine: WinchPulleyConfig = { pulleyRatio: 2, baseLinePullForceN: 35000, baseSpoolSpeedMps: 0.4 };

    const output1 = computeWinchPulleyOutput(singleLine);
    const output2 = computeWinchPulleyOutput(doubleLine);

    expect(output2.effectivePullForceN).toBe(output1.effectivePullForceN * 2);
    expect(output2.effectiveSpoolSpeedMps).toBe(output1.effectiveSpoolSpeedMps / 2);
  });
});
