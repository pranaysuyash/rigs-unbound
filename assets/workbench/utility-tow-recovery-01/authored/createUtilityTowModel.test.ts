import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createUtilityTowModel } from "./createUtilityTowModel";

describe("createUtilityTowModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createUtilityTowModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("heavy-utility-tow-recovery-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-frame");
    expect(names).toContain("operator-cab");
    expect(names).toContain("recovery-boom-assembly");
    expect(names).toContain("winch-spool-unit");
    expect(names).toContain("outrigger-pads");
    expect(names).toContain("6x6-wheels");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createUtilityTowModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 2.6m, Height ~ 2.8m, Length ~ 6.5m
    expect(size.x).toBeGreaterThan(2.0);
    expect(size.x).toBeLessThan(3.5);
    expect(size.y).toBeGreaterThan(1.8);
    expect(size.z).toBeGreaterThan(5.5);
  });
});
