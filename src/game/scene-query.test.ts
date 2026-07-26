import { describe, expect, it } from "vitest";

import type { Obstacle } from "./collision";
import { GameWorld } from "./gameworld";
import {
  firstSegmentAabbHit,
  firstSegmentSphereHit,
  queryCameraObstruction,
  type SceneQuerySource,
} from "./scene-query";

const SEED = "UNBOUND-260725";

function sourceWith(obstacles: readonly Obstacle[] = []): SceneQuerySource {
  const world = new GameWorld(SEED);
  return {
    terrain: world.terrain,
    obstacles: { near: () => [...obstacles] },
    felledObstacles: new Set<string>(),
  };
}

describe("scene-query primitives", () => {
  it("returns no hit for a clear segment and finite result for zero length", () => {
    expect(
      firstSegmentAabbHit(
        { x: -4, y: 4, z: 0 },
        { x: 4, y: 4, z: 0 },
        { minX: -1, minY: -1, minZ: 3, maxX: 1, maxY: 1, maxZ: 5 },
      ),
    ).toBeNull();
    expect(
      firstSegmentSphereHit(
        { x: 8, y: 8, z: 8 },
        { x: 8, y: 8, z: 8 },
        { x: 0, y: 0, z: 0 },
        1,
      ),
    ).toBeNull();
  });

  it("treats swept-radius tangency as an obstruction", () => {
    const fraction = firstSegmentAabbHit(
      { x: -5, y: 2, z: 2 },
      { x: 5, y: 2, z: 2 },
      { minX: -1, minY: -1, minZ: -1, maxX: 1, maxY: 1, maxZ: 1 },
      1,
    );
    expect(fraction).not.toBeNull();
    expect(fraction!).toBeCloseTo(0.3, 6);
  });
});

describe("camera scene query", () => {
  it("reports terrain when a segment descends through the ground", () => {
    const source = sourceWith();
    const ground = source.terrain.height(30, 30);
    const hit = queryCameraObstruction(
      source,
      { x: 30, y: ground + 10, z: 30 },
      { x: 30, y: ground - 2, z: 30 },
      0.4,
      { includeObstacles: false, includeStructures: false },
    );
    expect(hit?.source).toBe("terrain");
    expect(hit?.fraction).toBeGreaterThan(0);
    expect(hit?.fraction).toBeLessThan(1);
  });

  it("reports the nearest authored Home Silo part on the fresh-spawn chase line", () => {
    const source = sourceWith();
    const ground = source.terrain.height(0, 12);
    const hit = queryCameraObstruction(
      source,
      { x: 4, y: ground + 2.4, z: 6 },
      { x: 4, y: ground + 7.8, z: 20 },
      0.45,
      { includeTerrain: false, includeObstacles: false },
    );
    expect(hit?.source).toBe("structure");
    expect(hit?.id).toBe("home-silo-body");
    expect(hit?.fraction).toBeLessThan(0.7);
  });

  it("uses the rendered tree crown rather than only its narrow trunk", () => {
    const tree: Obstacle = {
      id: "tree-fixture",
      x: 0,
      z: 8,
      groundY: 0,
      radius: 0.45,
      height: 6,
      kind: "tree",
      fellable: true,
      variation: 0.5,
    };
    const source = sourceWith([tree]);
    const hit = queryCameraObstruction(
      source,
      { x: 1.8, y: 4.8, z: 0 },
      { x: 1.8, y: 4.8, z: 16 },
      0.35,
      { includeTerrain: false, includeStructures: false },
    );
    expect(hit).toMatchObject({ source: "obstacle", id: tree.id });
  });

  it("ignores a felled tree as a camera-height obstruction", () => {
    const tree: Obstacle = {
      id: "felled-fixture",
      x: 0,
      z: 8,
      groundY: 0,
      radius: 0.55,
      height: 6,
      kind: "tree",
      fellable: true,
      variation: 0.4,
    };
    const source = sourceWith([tree]);
    source.felledObstacles = new Set([tree.id]);
    expect(
      queryCameraObstruction(
        source,
        { x: 0, y: 4.5, z: 0 },
        { x: 0, y: 4.5, z: 16 },
        0.4,
        { includeTerrain: false, includeStructures: false },
      ),
    ).toBeNull();
  });

  it("returns the nearest source when obstacle and structure overlap the line", () => {
    const world = new GameWorld(SEED);
    const ground = world.terrain.height(0, 12);
    const tree: Obstacle = {
      id: "near-tree",
      x: 4,
      z: 8,
      groundY: ground,
      radius: 0.5,
      height: 5,
      kind: "tree",
      fellable: true,
      variation: 0.3,
    };
    const source: SceneQuerySource = {
      terrain: world.terrain,
      obstacles: { near: () => [tree] },
      felledObstacles: new Set(),
    };
    const hit = queryCameraObstruction(
      source,
      { x: 4, y: ground + 4.8, z: 4 },
      { x: 4, y: ground + 4.8, z: 20 },
      0.4,
      { includeTerrain: false },
    );
    expect(hit).toMatchObject({ source: "obstacle", id: tree.id });
  });
});
