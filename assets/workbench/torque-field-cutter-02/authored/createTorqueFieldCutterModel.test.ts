import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createTorqueFieldCutterModel } from "./createTorqueFieldCutterModel";

describe("createTorqueFieldCutterModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createTorqueFieldCutterModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("torque-field-cutter-02");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("heavy-tractor-frame");
    expect(names).toContain("climate-control-cab");
    expect(names).toContain("front-mulcher-head");
    expect(names).toContain("flail-mower-wings");
    expect(names).toContain("high-clearance-wheels");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createTorqueFieldCutterModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 2.4m, Height ~ 2.4m, Length ~ 5.0m
    expect(size.x).toBeGreaterThan(2.2);
    expect(size.y).toBeGreaterThan(1.8);
    expect(size.z).toBeGreaterThan(4.0);
  });
});
