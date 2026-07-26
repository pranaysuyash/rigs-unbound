import { describe, expect, it } from "vitest";

import { RIG_HOOD_CAMERA_MOUNTS } from "./camera";
import { RIG_IDS } from "./contracts";

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
