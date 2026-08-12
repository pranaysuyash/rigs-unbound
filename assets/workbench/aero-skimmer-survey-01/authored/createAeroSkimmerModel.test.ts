import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createAeroSkimmerModel } from "./createAeroSkimmerModel";

describe("createAeroSkimmerModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createAeroSkimmerModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("aero-skimmer-survey-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("composite-fuselage");
    expect(names).toContain("tilt-fan-left");
    expect(names).toContain("tilt-fan-right");
    expect(names).toContain("sensor-gimbal");
    expect(names).toContain("landing-skids");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createAeroSkimmerModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 2.6m, Height ~ 1.5m, Length ~ 3.6m
    expect(size.x).toBeGreaterThan(2.0);
    expect(size.x).toBeLessThan(3.5);
    expect(size.y).toBeGreaterThan(1.0);
    expect(size.z).toBeGreaterThan(3.0);
  });
});
