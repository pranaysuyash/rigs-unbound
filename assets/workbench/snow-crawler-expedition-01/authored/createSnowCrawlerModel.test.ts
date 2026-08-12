import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { createSnowCrawlerModel } from "./createSnowCrawlerModel";

describe("createSnowCrawlerModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createSnowCrawlerModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("snow-crawler-expedition-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-frame");
    expect(names).toContain("caterpillar-track-left");
    expect(names).toContain("caterpillar-track-right");
    expect(names).toContain("pressurized-cab");
    expect(names).toContain("ice-breaker-plow");
    expect(names).toContain("diesel-power-core");
  });

  it("calculates non-empty bounding box within physical profile constraints", () => {
    const model = createSnowCrawlerModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track width ~ 3.1m, Height ~ 2.2m, Length ~ 5.0m
    expect(size.x).toBeGreaterThan(2.5);
    expect(size.x).toBeLessThan(3.8);
    expect(size.y).toBeGreaterThan(1.5);
    expect(size.z).toBeGreaterThan(4.2);
  });
});
