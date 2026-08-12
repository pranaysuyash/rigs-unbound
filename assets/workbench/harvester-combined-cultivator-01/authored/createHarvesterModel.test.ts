import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createHarvesterModel } from "./createHarvesterModel";

describe("createHarvesterModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createHarvesterModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("harvester-combined-cultivator-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-frame");
    expect(names).toContain("panoramic-glass-cab");
    expect(names).toContain("rotary-header-drum");
    expect(names).toContain("grain-tank-auger");
    expect(names).toContain("dual-front-wheels");
    expect(names).toContain("rear-steering-wheels");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createHarvesterModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 3.2m, Height ~ 3.0m, Length ~ 5.5m
    expect(size.x).toBeGreaterThan(3.0);
    expect(size.y).toBeGreaterThan(2.2);
    expect(size.z).toBeGreaterThan(4.5);
  });
});
