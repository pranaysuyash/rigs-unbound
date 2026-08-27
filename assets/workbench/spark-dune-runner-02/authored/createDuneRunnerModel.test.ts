import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  createDuneRunnerModel,
  duneRunnerWheelPivots,
} from "./createDuneRunnerModel";

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

  it("exposes kernel-consumable wheel pivots and axis markers", () => {
    const model = createDuneRunnerModel();

    // Physics order FL, FR, RL, RR; front pair sits forward of the rear pair.
    const pivots = duneRunnerWheelPivots(model);
    expect(pivots).toHaveLength(4);
    expect(pivots[0].position.z).toBeGreaterThan(pivots[2].position.z);
    expect(pivots[1].position.z).toBeGreaterThan(pivots[3].position.z);
    expect(pivots[0].position.x).toBeLessThan(pivots[1].position.x);
    for (const pivot of pivots) {
      expect(pivot.children.length).toBeGreaterThan(0);
    }

    // The renderer's orientation evidence reads real visible parts.
    expect(model.getObjectByName("front-marker")).toBeDefined();
    expect(model.getObjectByName("rear-marker")).toBeDefined();
  });
});
