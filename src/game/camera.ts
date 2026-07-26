import type { RigId } from "./contracts";

export interface RigCameraMount {
  /** Local-space position of the authored socket on the rendered rig root. */
  localX: number;
  localY: number;
  localZ: number;
  lookDistance: number;
  lookDrop: number;
}

/**
 * Canonical hood/cockpit sockets.
 *
 * These records author named Object3D sockets today and can map directly to GLB
 * node names later. They are deliberately rig-specific presentation data:
 * camera policy remains shared, while each silhouette owns where a driver or
 * forward sensor can physically see from.
 */
export const RIG_HOOD_CAMERA_MOUNTS: Readonly<Record<RigId, RigCameraMount>> = {
  "utility-tractor": {
    localX: 0.52,
    localY: 3.34,
    localZ: 0.55,
    lookDistance: 16,
    lookDrop: 0.25,
  },
  "toy-buggy": {
    localX: 0,
    localY: 1.88,
    localZ: 0.58,
    lookDistance: 17,
    lookDrop: 0.18,
  },
  "marsh-skimmer": {
    localX: 0,
    localY: 2.75,
    localZ: 1.72,
    lookDistance: 18,
    lookDrop: 0.12,
  },
} as const;
