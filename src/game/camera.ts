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

export type TopDownPresentationStyle =
  | "top-down-diorama" // 75° Near-Orthographic Perspective (Diorama View)
  | "top-down-flat"    // 90° Pure Flat Overhead Orthographic
  | "top-down-heading"; // Heading-Tracking Overhead

export interface TopDownCameraSpec {
  style: TopDownPresentationStyle;
  tiltAngleDeg: number;
  heightMetres: number;
  targetLeadSeconds: number; // Lead distance ahead of velocity vector
  headingLocked: boolean;
}

export const TOP_DOWN_CAMERA_SPECS: Readonly<Record<TopDownPresentationStyle, TopDownCameraSpec>> = {
  "top-down-diorama": {
    style: "top-down-diorama",
    tiltAngleDeg: 75,
    heightMetres: 28,
    targetLeadSeconds: 0.8,
    headingLocked: false,
  },
  "top-down-flat": {
    style: "top-down-flat",
    tiltAngleDeg: 90,
    heightMetres: 35,
    targetLeadSeconds: 0.5,
    headingLocked: false,
  },
  "top-down-heading": {
    style: "top-down-heading",
    tiltAngleDeg: 80,
    heightMetres: 25,
    targetLeadSeconds: 1.0,
    headingLocked: true,
  },
};

/**
 * Calculates predictive target lead offset for smooth top-down camera panning.
 */
export function calculateTopDownTargetLead(
  velocityX: number,
  velocityZ: number,
  leadSeconds: number,
  maxLeadMetres: number = 12,
): { leadX: number; leadZ: number } {
  let leadX = velocityX * leadSeconds;
  let leadZ = velocityZ * leadSeconds;
  const dist = Math.hypot(leadX, leadZ);
  if (dist > maxLeadMetres) {
    const scale = maxLeadMetres / dist;
    leadX *= scale;
    leadZ *= scale;
  }
  return { leadX, leadZ };
}

/**
 * Shared chase composition policy.
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
    localY: 3.82,
    localZ: 1.72,
    lookDistance: 18,
    lookDrop: 0.12,
  },
  "heavy-utility-tow-recovery-01": { localX: 0, localY: 3.6, localZ: 1.2, lookDistance: 17, lookDrop: 0.2 },
  "heavy-salvage-crane-02": { localX: 0, localY: 4.0, localZ: 1.5, lookDistance: 18, lookDrop: 0.22 },
  "snow-crawler-expedition-01": { localX: 0, localY: 3.2, localZ: 1.0, lookDistance: 16, lookDrop: 0.18 },
  "harvester-combined-cultivator-01": { localX: 0.5, localY: 3.8, localZ: 1.1, lookDistance: 16.5, lookDrop: 0.2 },
  "sentinel-mobile-fort-01": { localX: 0, localY: 4.5, localZ: 1.8, lookDistance: 20, lookDrop: 0.25 },
  "aero-skimmer-survey-01": { localX: 0, localY: 2.8, localZ: 0.9, lookDistance: 18, lookDrop: 0.12 },
  "aero-cargo-freighter-02": { localX: 0, localY: 3.9, localZ: 1.6, lookDistance: 19, lookDrop: 0.15 },
  "torque-field-cutter-02": { localX: 0.52, localY: 3.34, localZ: 0.55, lookDistance: 16, lookDrop: 0.25 },
  "spark-dune-runner-02": { localX: 0, localY: 1.9, localZ: 0.6, lookDistance: 17.5, lookDrop: 0.15 },
  "marsh-dredger-heavy-02": { localX: 0, localY: 3.7, localZ: 1.4, lookDistance: 17, lookDrop: 0.15 },
  "hauler-road-train-01": { localX: 0, localY: 3.8, localZ: 1.5, lookDistance: 18, lookDrop: 0.2 },
  "construction-excavator-01": { localX: -0.4, localY: 3.5, localZ: 1.1, lookDistance: 15.5, lookDrop: 0.22 },
  "micro-scout-pipe-crawler-01": { localX: 0, localY: 1.05, localZ: 0.3, lookDistance: 12, lookDrop: 0.1 },
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
