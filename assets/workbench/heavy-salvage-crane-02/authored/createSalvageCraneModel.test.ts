import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSalvageCraneModel } from "./createSalvageCraneModel";

describe("createSalvageCraneModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createSalvageCraneModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("heavy-salvage-crane-02");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-8x8");
    expect(names).toContain("operator-cab");
    expect(names).toContain("slewing-turntable-crane");
    expect(names).toContain("hydraulic-outriggers");
    expect(names).toContain("dual-winch-spools");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createSalvageCraneModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 2.8m, Height ~ 3.2m, Length ~ 7.8m
    expect(size.x).toBeGreaterThan(2.5);
    expect(size.y).toBeGreaterThan(2.2);
    expect(size.z).toBeGreaterThan(6.5);
  });
});
