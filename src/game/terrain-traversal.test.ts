import { describe, expect, it } from "vitest";
import { RIG_PROFILES } from "./contracts";
import { resolveTerrainTraversal } from "./terrain-traversal";

const cliff = {
  height(_x: number, z: number): number {
    return z >= 0 ? 11 : 0;
  },
};

const normalGrade = {
  height(_x: number, z: number): number {
    return z * 0.18;
  },
};

describe("shared terrain traversability boundary", () => {
  it.each(["utility-tractor", "toy-buggy", "marsh-skimmer"] as const)(
    "blocks %s from penetrating a seeded extreme face",
    (rigId) => {
      const result = resolveTerrainTraversal(
        cliff,
        RIG_PROFILES[rigId],
        0,
        -0.5,
        0,
        -0.3,
      );
      expect(result).toEqual({
        blocked: true,
        reason: "terrain-face",
        x: 0,
        z: -0.5,
      });
    },
  );

  it("sweeps a high-speed run-up instead of tunnelling across the face", () => {
    const result = resolveTerrainTraversal(
      cliff,
      RIG_PROFILES["toy-buggy"],
      0,
      -8,
      0,
      3,
    );
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe("terrain-face");
  });

  it("allows normal authored grades and downhill or reverse escape", () => {
    expect(
      resolveTerrainTraversal(
        normalGrade,
        RIG_PROFILES["utility-tractor"],
        0,
        -2,
        0,
        2,
      ).blocked,
    ).toBe(false);
    expect(
      resolveTerrainTraversal(cliff, RIG_PROFILES["marsh-skimmer"], 0, 2, 0, -2)
        .blocked,
    ).toBe(false);
  });
});
