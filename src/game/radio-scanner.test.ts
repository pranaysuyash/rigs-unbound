import { describe, expect, it } from "vitest";
import { compassBearing, deriveRadioSignal } from "./radio-scanner";

describe("diegetic radio signal scanner", () => {
  it("returns zero signal strength when far from any target", () => {
    const targets = [{ name: "Sunken Flats", x: 200, z: 200 }];
    const signal = deriveRadioSignal(0, 0, targets);

    expect(signal.signalStrength).toBe(0);
    expect(signal.nearestTargetName).toBeNull();
  });

  it("returns strong signal strength and carrier frequency when close to target", () => {
    const targets = [{ name: "Sunken Flats", x: 30, z: 40 }];
    const signal = deriveRadioSignal(0, 0, targets);

    expect(signal.signalStrength).toBeGreaterThan(0.7);
    expect(signal.nearestTargetName).toBe("Sunken Flats");
    expect(signal.carrierFrequencyHz).toBeGreaterThanOrEqual(88.5);
    expect(signal.carrierFrequencyHz).toBeLessThanOrEqual(107.9);
    expect(signal.bearingDegrees).toBe(36.9);
  });

  it("keeps cockpit bearings intentionally coarse", () => {
    expect(compassBearing(0)).toBe("N");
    expect(compassBearing(44.9)).toBe("NE");
    expect(compassBearing(180)).toBe("S");
    expect(compassBearing(-90)).toBe("W");
  });
});
