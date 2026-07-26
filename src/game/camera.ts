import type { RigId } from "./contracts";

export interface RigCameraMount {
  /** Local-space position of the authored socket on the rendered rig root. */
  localX: number;
  localY: number;
  localZ: number;
  lookDistance: number;
  lookDrop: number;
}

export interface ChaseViewportPolicy {
  narrow: boolean;
  distanceScale: number;
  heightScale: number;
  sideScale: number;
  targetDrop: number;
  /**
   * Minimum focus-to-camera distance that still leaves a useful portrait
   * composition after obstruction resolution.
   */
  minimumReadableDistance: number;
}

/**
 * Shared chase composition policy.
 *
 * A clear camera ray is necessary but not sufficient: a portrait viewport can
 * pass collision checks while a pulled-in boom fills the screen with the rig.
 * Keep that readability threshold profile-derived so broad rigs and future
 * silhouettes do not need identity-specific branches.
 */
export function chaseViewportPolicy(
  aspect: number,
  chaseDistance: number,
  track: number,
): ChaseViewportPolicy {
  const narrow = Number.isFinite(aspect) && aspect > 0 && aspect < 0.8;
  if (!narrow) {
    return {
      narrow: false,
      distanceScale: 1,
      heightScale: 1,
      sideScale: 1,
      targetDrop: 0,
      minimumReadableDistance: Math.max(2.8, track * 1.08),
    };
  }
  return {
    narrow: true,
    distanceScale: 2.5,
    heightScale: 1.55,
    sideScale: 0,
    targetDrop: 2.2,
    minimumReadableDistance: Math.max(13, chaseDistance * 1.05, track * 4),
  };
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
