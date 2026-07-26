import { describe, expect, it } from "vitest";
import { RIG_PROFILES } from "./contracts";
import { GameWorld } from "./gameworld";
import { resolveTerrainTraversal } from "./terrain-traversal";
import { SITE_SIGNALS } from "./world";

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

describe("horizon signal visibility", () => {
  /**
   * The claim the game makes about itself is that climbing buys you information.
   * That is only true if terrain can genuinely hide a signal, so this asserts the
   * mechanism rather than the wiring: from the same ground position, raising the eye
   * must reveal at least as much as a low eye, and somewhere in the world a signal
   * must be hidden from ground level and visible from above it.
   */
  it("hides signals behind terrain and reveals them from a vantage", () => {
    const world = new GameWorld("UNBOUND-260725");

    let foundOccluded = false;
    for (const signal of SITE_SIGNALS) {
      const targetY = world.terrain.height(signal.x, signal.z) + signal.localY;

      // A point far from the signal, sampled around it so terrain varies.
      for (const angle of [0, 1.05, 2.1, 3.15, 4.2, 5.25]) {
        const eyeX = signal.x + Math.cos(angle) * 180;
        const eyeZ = signal.z + Math.sin(angle) * 180;
        const groundY = world.terrain.height(eyeX, eyeZ);

        const low = world.exploration.sightlineClear(
          eyeX,
          groundY + 2,
          eyeZ,
          signal.x,
          targetY,
          signal.z,
        );
        const high = world.exploration.sightlineClear(
          eyeX,
          groundY + 60,
          eyeZ,
          signal.x,
          targetY,
          signal.z,
        );

        // Raising the eye can never lose a sightline it already had.
        if (low) expect(high).toBe(true);
        if (!low && high) foundOccluded = true;
      }
    }

    expect(
      foundOccluded,
      "no signal anywhere was hidden at ground level but visible from a vantage",
    ).toBe(true);
  });
});
