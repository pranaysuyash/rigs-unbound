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
 *
 * `localY` is in the GROUND frame — metres above the surface the rig rests on,
 * the same frame the models are authored in, since the socket is parented into
 * the model's ground-frame group. It is *not* relative to the body origin the
 * way `RigProfile.camera.focusHeight` is; see `rig-blockout.ts` on the two
 * vertical frames.
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
    // Above the cabin roof (ground-frame 2.9), on the mast. The skimmer's model
    // was the one authored around its body origin rather than the ground, so
    // this socket moved up with it; at the old 2.75 it now sat inside the cabin.
    localY: 3.82,
    localZ: 1.72,
    lookDistance: 18,
    lookDrop: 0.12,
  },
} as const;

export type CameraPresetId =
  | "home-spawn"
  | "workshop-approach"
  | "steep-incline"
  | "shallow-water"
  | "terrain-editing"
  | "rig-switch"
  | "narrow-screen"
  | "night-completion";

export interface CameraPreset {
  id: CameraPresetId;
  label: string;
  cameraMode: "chase" | "hood" | "tactical" | "top-down" | "survey";
  distanceMultiplier: number;
  heightMultiplier: number;
  sideOffset: number;
}

export const CAMERA_PRESETS: Readonly<Record<CameraPresetId, CameraPreset>> = {
  "home-spawn": {
    id: "home-spawn",
    label: "Home Spawn",
    cameraMode: "chase",
    distanceMultiplier: 1.0,
    heightMultiplier: 1.0,
    sideOffset: 0,
  },
  "workshop-approach": {
    id: "workshop-approach",
    label: "Workshop Approach",
    cameraMode: "chase",
    distanceMultiplier: 0.85,
    heightMultiplier: 0.9,
    sideOffset: 1.2,
  },
  "steep-incline": {
    id: "steep-incline",
    label: "Steep Incline",
    cameraMode: "tactical",
    distanceMultiplier: 1.2,
    heightMultiplier: 1.4,
    sideOffset: 0,
  },
  "shallow-water": {
    id: "shallow-water",
    label: "Shallow Water",
    cameraMode: "chase",
    distanceMultiplier: 1.1,
    heightMultiplier: 0.85,
    sideOffset: 0,
  },
  "terrain-editing": {
    id: "terrain-editing",
    label: "Terrain Editing",
    cameraMode: "top-down",
    distanceMultiplier: 1.3,
    heightMultiplier: 1.8,
    sideOffset: 0,
  },
  "rig-switch": {
    id: "rig-switch",
    label: "Rig Switch",
    cameraMode: "tactical",
    distanceMultiplier: 1.5,
    heightMultiplier: 1.2,
    sideOffset: 2.0,
  },
  "narrow-screen": {
    id: "narrow-screen",
    label: "Narrow Screen Viewport",
    cameraMode: "chase",
    distanceMultiplier: 2.2,
    heightMultiplier: 1.5,
    sideOffset: 0,
  },
  "night-completion": {
    id: "night-completion",
    label: "Night Completion View",
    cameraMode: "survey",
    distanceMultiplier: 1.4,
    heightMultiplier: 1.3,
    sideOffset: 0,
  },
};
