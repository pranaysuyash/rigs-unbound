import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createRoadTrainModel } from "./createRoadTrainModel";

describe("createRoadTrainModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createRoadTrainModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("hauler-road-train-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("prime-mover-chassis");
    expect(names).toContain("sleeper-cab-unit");
    expect(names).toContain("fifth-wheel-hitch");
    expect(names).toContain("triple-rear-axles");
    expect(names).toContain("primary-flatbed-trailer");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createRoadTrainModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 2.5m, Height ~ 2.8m, Length ~ 15m with trailer
    expect(size.x).toBeGreaterThan(2.2);
    expect(size.y).toBeGreaterThan(2.2);
    expect(size.z).toBeGreaterThan(10.0);
  });
});
