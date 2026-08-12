import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSentinelFortModel } from "./createSentinelFortModel";

describe("createSentinelFortModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createSentinelFortModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("sentinel-mobile-fort-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-fortress");
    expect(names).toContain("quad-track-pods");
    expect(names).toContain("armored-command-core");
    expect(names).toContain("barricade-wing-left");
    expect(names).toContain("barricade-wing-right");
    expect(names).toContain("spotlight-mast");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createSentinelFortModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 3.4m, Height ~ 2.8m, Length ~ 4.8m
    expect(size.x).toBeGreaterThan(2.8);
    expect(size.x).toBeLessThan(4.2);
    expect(size.y).toBeGreaterThan(2.0);
    expect(size.z).toBeGreaterThan(4.0);
  });
});
