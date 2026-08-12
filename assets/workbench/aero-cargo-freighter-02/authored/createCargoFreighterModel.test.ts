import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createCargoFreighterModel } from "./createCargoFreighterModel";

describe("createCargoFreighterModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createCargoFreighterModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("aero-cargo-freighter-02");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("cargo-fuselage");
    expect(names).toContain("cockpit-cabin");
    expect(names).toContain("quad-tilt-rotors");
    expect(names).toContain("rear-loading-ramp");
    expect(names).toContain("multi-wheel-landing-gear");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createCargoFreighterModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Wingspan ~ 7.2m, Height ~ 3.5m, Length ~ 8.0m
    expect(size.x).toBeGreaterThan(6.0);
    expect(size.y).toBeGreaterThan(2.5);
    expect(size.z).toBeGreaterThan(7.0);
  });
});
