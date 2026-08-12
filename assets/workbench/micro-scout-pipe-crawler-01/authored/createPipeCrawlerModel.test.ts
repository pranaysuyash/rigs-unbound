import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createPipeCrawlerModel } from "./createPipeCrawlerModel";

describe("createPipeCrawlerModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createPipeCrawlerModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("micro-scout-pipe-crawler-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-tubular-pod");
    expect(names).toContain("6-wheeled-magnetic-drive");
    expect(names).toContain("pantograph-camera-mast");
    expect(names).toContain("dual-led-spotlights");
    expect(names).toContain("tether-spool-connector");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createPipeCrawlerModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 0.65m, Height ~ 0.5m, Length ~ 0.9m
    expect(size.x).toBeGreaterThan(0.5);
    expect(size.y).toBeGreaterThan(0.3);
    expect(size.z).toBeGreaterThan(0.7);
  });
});
