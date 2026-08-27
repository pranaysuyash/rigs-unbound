import { describe, expect, it } from "vitest";
import * as THREE from "three";
import {
  createSnowCrawlerModel,
  snowCrawlerDimensionsFromBlockout,
  snowCrawlerRollerSpinScale,
} from "../../assets/workbench/snow-crawler-expedition-01/authored/createSnowCrawlerModel";
import { blockoutFor } from "./rig-blockout";

/**
 * DIMENSIONS-lane agreement for the snow crawler's authored model: the
 * factory's metre inputs must come from the canonical blockout, and the
 * drawn rolling elements must relate honestly to the kernel's reference
 * wheel radius. Lives on the src side because workbench tests cannot
 * value-import `src/game`.
 */
describe("snow crawler model ↔ blockout agreement", () => {
  const blockout = blockoutFor("snow-crawler-expedition-01");
  const dims = snowCrawlerDimensionsFromBlockout(blockout);

  it("takes every metre from the blockout, never from a local literal", () => {
    expect(dims.trackHalfX).toBe(blockout.profile.track / 2);
    expect(dims.profileWheelRadius).toBe(blockout.profile.wheelRadius);
    expect(dims.bodyWidth).toBeCloseTo(blockout.hull.width * 0.86, 8);
    expect(dims.bodyLength).toBeCloseTo(blockout.hull.depth * 0.845, 8);
    expect(dims.beltWidth).toBeCloseTo(blockout.wheelMounts[0]!.width, 8);
    expect(dims.beltLength).toBeCloseTo(blockout.profile.wheelbase * 1.175, 8);
  });

  it("draws a smaller roller than the reference wheel and spins it faster", () => {
    expect(dims.rollerRadius).toBeLessThan(blockout.profile.wheelRadius);
    const spinScale = snowCrawlerRollerSpinScale(dims);
    expect(spinScale).toBeGreaterThan(1);
    expect(spinScale).toBeCloseTo(
      blockout.profile.wheelRadius / dims.rollerRadius,
      8,
    );
  });

  it("builds a model whose extent respects the profile envelope", () => {
    const model = createSnowCrawlerModel({ dimensions: dims });
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    const outerHalfWidth = Math.max(
      blockout.hull.width / 2,
      blockout.profile.track / 2 + dims.beltWidth / 2 + 0.035,
    );
    expect(size.x).toBeLessThanOrEqual(outerHalfWidth * 2 + 0.05);
    expect(box.min.y).toBeGreaterThanOrEqual(-0.02);
  });
});
