import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createExcavatorModel } from "./createExcavatorModel";

describe("createExcavatorModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createExcavatorModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("construction-excavator-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("tracked-undercarriage");
    expect(names).toContain("upper-revolving-house");
    expect(names).toContain("operator-glass-cab");
    expect(names).toContain("articulated-boom-stick");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createExcavatorModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 3.0m, Height ~ 3.0m, Length ~ 6.5m
    expect(size.x).toBeGreaterThan(2.5);
    expect(size.y).toBeGreaterThan(2.0);
    expect(size.z).toBeGreaterThan(5.0);
  });
});
