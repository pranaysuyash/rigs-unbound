import { describe, expect, it } from "vitest";
import { IDLE_VEHICLE_INTENT, normalizeVehicleIntent } from "./vehicle-intent";

describe("normalizeVehicleIntent", () => {
  it("returns a neutral semantic frame when input is absent", () => {
    expect(normalizeVehicleIntent(undefined)).toEqual(IDLE_VEHICLE_INTENT);
  });

  it("clamps axes and rejects non-finite values", () => {
    expect(
      normalizeVehicleIntent({
        throttle: 4,
        steering: -8,
        brake: Number.NaN,
        handbrake: -2,
        primaryTool: 1.7,
        secondaryTool: Number.POSITIVE_INFINITY,
      }),
    ).toMatchObject({
      throttle: 1,
      steering: -1,
      brake: 0,
      handbrake: 0,
      primaryTool: 1,
      secondaryTool: 0,
    });
  });
});
