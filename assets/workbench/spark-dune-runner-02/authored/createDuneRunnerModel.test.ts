import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createDuneRunnerModel } from "./createDuneRunnerModel";

describe("createDuneRunnerModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createDuneRunnerModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("spark-dune-runner-02");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("roll-cage-chassis");
    expect(names).toContain("cockpit-seats");
    expect(names).toContain("battery-belly-pack");
    expect(names).toContain("coilover-suspension");
    expect(names).toContain("sand-paddle-wheels");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createDuneRunnerModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 2.15m, Height ~ 1.6m, Length ~ 3.8m
    expect(size.x).toBeGreaterThan(2.0);
    expect(size.y).toBeGreaterThan(1.2);
    expect(size.z).toBeGreaterThan(3.2);
  });
});
