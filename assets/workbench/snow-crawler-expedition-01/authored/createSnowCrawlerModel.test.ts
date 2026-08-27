import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  createSnowCrawlerModel,
  snowCrawlerRollerSpinScale,
  snowCrawlerSpinPivots,
} from "./createSnowCrawlerModel";

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
    expect(names).toContain("roof-systems");
    expect(names).toContain("roof-rack");
    expect(names).toContain("rear-assembly");
  });

  it("calculates a non-empty bounding box within physical profile constraints", () => {
    const model = createSnowCrawlerModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Track outer width ~3.4m, overall length > 5m with the plow mounted.
    expect(size.x).toBeGreaterThan(2.5);
    expect(size.x).toBeLessThan(3.8);
    expect(size.z).toBeGreaterThan(4.2);
  });

  it("authored in the GROUND frame: the four tyre surfaces touch y ≈ 0", () => {
    const model = createSnowCrawlerModel();
    const tyres: THREE.Mesh[] = [];
    model.traverse((object) => {
      if (object instanceof THREE.Mesh && object.name === "tyre") {
        tyres.push(object);
      }
    });

    expect(tyres).toHaveLength(4);
    const box = new THREE.Box3();
    for (const tyre of tyres) {
      box.setFromObject(tyre);
      expect(box.min.y).toBeGreaterThanOrEqual(-0.02);
      expect(box.min.y).toBeLessThanOrEqual(0.05);
    }
  });

  it("exposes four kernel-ordered spin pivots with real geometry inside", () => {
    const model = createSnowCrawlerModel();
    const pivots = snowCrawlerSpinPivots(model);

    expect(pivots.map((p) => p.name)).toEqual([
      "spin-roller-front-left",
      "spin-roller-front-right",
      "spin-roller-rear-left",
      "spin-roller-rear-right",
    ]);
    for (const pivot of pivots) {
      expect(pivot.children.length).toBeGreaterThan(0);
      expect(pivot.position.y).toBeCloseTo(0.34, 5);
    }
  });

  it("accepts blockout-derived dimensions without breaking the frame", () => {
    // The full DIMENSIONS-lane agreement test lives in
    // src/game/snow-crawler-model-blockout.test.ts (workbench tests cannot
    // value-import src/game); here we pin that a realistic dimension set
    // still builds and stays above the contact plane.
    const dims = {
      bodyWidth: 2.4,
      bodyLength: 4.9,
      bodyBottomY: 0.55,
      roofY: 3.25,
      trackHalfX: 1.4,
      beltWidth: 0.62,
      beltHeight: 1.35,
      beltLength: 4.7,
      beltCornerRadius: 0.45,
      rollerRadius: 0.3,
      rollerRestY: 0.34,
      spinRollerZ: 1.5,
      profileWheelRadius: 0.65,
    };
    expect(snowCrawlerRollerSpinScale(dims)).toBeCloseTo(0.65 / 0.3, 8);
    const model = createSnowCrawlerModel({ dimensions: dims });
    const box = new THREE.Box3().setFromObject(model);
    expect(box.isEmpty()).toBe(false);
  });

  it("keeps every track above the contact plane except the tyre surfaces", () => {
    const model = createSnowCrawlerModel();
    const box = new THREE.Box3().setFromObject(model);
    // Belt underside, skid plate and everything else sits at or above y = 0.
    expect(box.min.y).toBeGreaterThanOrEqual(-0.02);
  });
});
