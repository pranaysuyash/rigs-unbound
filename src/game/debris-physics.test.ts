import { describe, expect, it } from "vitest";
import {
  BoulderDebris,
  computeBoulderImpactDisplacement,
} from "./debris-physics";

describe("terrain debris & boulder displacement engine", () => {
  it("resists movement when low-speed light vehicle impact fails to overcome static friction", () => {
    const boulder: BoulderDebris = {
      id: "boulder-1",
      x: 50,
      z: 50,
      massKg: 500,
      staticFrictionCoeff: 0.7,
      displaced: false,
    };

    const result = computeBoulderImpactDisplacement(boulder, 800, 0.2, {
      x: 1,
      z: 0,
    });
    expect(result.displaced).toBe(false);
    expect(result.updatedBoulder.x).toBe(50);
  });

  it("displaces heavy boulder position when struck by a heavy tractor momentum", () => {
    const boulder: BoulderDebris = {
      id: "boulder-1",
      x: 50,
      z: 50,
      massKg: 400,
      staticFrictionCoeff: 0.5,
      displaced: false,
    };

    const result = computeBoulderImpactDisplacement(boulder, 3200, 4.5, {
      x: 1,
      z: 0,
    }); // Heavy tractor at 4.5 m/s
    expect(result.displaced).toBe(true);
    expect(result.updatedBoulder.x).toBeGreaterThan(50);
  });
});
