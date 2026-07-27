import { describe, expect, it } from "vitest";
import { CargoSlingState, updateCargoSlingPhysics } from "./cargo-crane";

describe("cargo sling pendulum physics engine", () => {
  it("induces sway angle and side force transfer during lateral vehicle acceleration", () => {
    const initial: CargoSlingState = {
      cableLengthMeters: 3.5,
      cargoMassKg: 1200,
      swayAngleRad: 0,
      swayAngularVelocityRadSec: 0,
      sideForceN: 0,
    };

    const swung = updateCargoSlingPhysics(initial, 3.5, 0.2); // 3.5 m/s² hard turn
    expect(swung.swayAngleRad).not.toBe(0);
    expect(Math.abs(swung.sideForceN)).toBeGreaterThan(100);
  });
});
