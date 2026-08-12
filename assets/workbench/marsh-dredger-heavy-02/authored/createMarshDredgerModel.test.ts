import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createMarshDredgerModel } from "./createMarshDredgerModel";

describe("createMarshDredgerModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createMarshDredgerModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("marsh-dredger-heavy-02");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("pontoon-chassis");
    expect(names).toContain("amphibious-track-pods");
    expect(names).toContain("excavator-arm");
    expect(names).toContain("operator-cab");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createMarshDredgerModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 3.6m, Height ~ 2.8m, Length ~ 6.5m
    expect(size.x).toBeGreaterThan(3.0);
    expect(size.y).toBeGreaterThan(2.0);
    expect(size.z).toBeGreaterThan(5.0);
  });
});
