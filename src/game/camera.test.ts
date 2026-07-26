import { describe, expect, it } from "vitest";

import { chaseViewportPolicy, RIG_HOOD_CAMERA_MOUNTS } from "./camera";
import { RIG_IDS, RIG_PROFILES } from "./contracts";

describe("rig camera mounts", () => {
  it("authors one finite, forward-looking hood socket for every rig", () => {
    expect(Object.keys(RIG_HOOD_CAMERA_MOUNTS).sort()).toEqual(
      [...RIG_IDS].sort(),
    );
    for (const rigId of RIG_IDS) {
      const mount = RIG_HOOD_CAMERA_MOUNTS[rigId];
      expect(
        [
          mount.localX,
          mount.localY,
          mount.localZ,
          mount.lookDistance,
          mount.lookDrop,
        ].every(Number.isFinite),
      ).toBe(true);
      expect(mount.localY).toBeGreaterThan(1);
      expect(mount.lookDistance).toBeGreaterThan(10);
      expect(mount.lookDrop).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("chase viewport policy", () => {
  it("preserves the authored desktop composition", () => {
    const tractor = RIG_PROFILES["utility-tractor"];
    const policy = chaseViewportPolicy(
      16 / 9,
      tractor.camera.chaseDistance,
      tractor.track,
    );
    expect(policy).toMatchObject({
      narrow: false,
      distanceScale: 1,
      heightScale: 1,
      sideScale: 1,
      targetDrop: 0,
    });
    expect(policy.minimumReadableDistance).toBeCloseTo(2.808);
  });

  it("requires a readable portrait boom for every rig profile", () => {
    for (const rigId of RIG_IDS) {
      const profile = RIG_PROFILES[rigId];
      const policy = chaseViewportPolicy(
        390 / 844,
        profile.camera.chaseDistance,
        profile.track,
      );
      expect(policy.narrow).toBe(true);
      expect(policy.distanceScale).toBeGreaterThan(1);
      expect(policy.sideScale).toBe(0);
      expect(policy.minimumReadableDistance).toBeGreaterThanOrEqual(8);
      expect(policy.minimumReadableDistance).toBeGreaterThan(
        profile.track * 2.5,
      );
    }
  });

  it("fails safely to desktop policy for invalid aspect input", () => {
    expect(chaseViewportPolicy(Number.NaN, 11, 2.6).narrow).toBe(false);
    expect(chaseViewportPolicy(0, 11, 2.6).narrow).toBe(false);
  });
});
