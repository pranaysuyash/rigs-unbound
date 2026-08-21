import { WORLD_SITES } from "./world";
import type { RigId } from "./rig-ids";
import type { ProgressionState } from "./progression";
import type { UnboundPassageState } from "./unbound-passage";
import type { MissionBinding, MissionClass } from "./mission-propositions";
import type { ComponentHealthState } from "./vehicle-maintenance";
import type { CommodityType } from "./expedition-economy";
import type { InfrastructureNetworkState } from "./infrastructure-network";
import type { FirstNightThreatState } from "./first-night-threat";
import type { OpenWorldPromiseState } from "./open-world-promise";
import type {
  SettlementNeedOutcomeId,
  SettlementState,
} from "./settlement-needs";

export const SAVE_SCHEMA_VERSION = 29 as const;
export const PREVIOUS_SAVE_SCHEMA_VERSION = 28 as const;
export const V28_SAVE_SCHEMA_VERSION = 28 as const;
export const V27_SAVE_SCHEMA_VERSION = 27 as const;
export const V26_SAVE_SCHEMA_VERSION = 26 as const;
export const V24_SAVE_SCHEMA_VERSION = 24 as const;
export const V18_SAVE_SCHEMA_VERSION = 18 as const;
export const V17_SAVE_SCHEMA_VERSION = 17 as const;
export const V16_SAVE_SCHEMA_VERSION = 16 as const;
export const V15_SAVE_SCHEMA_VERSION = 15 as const;
export const V14_SAVE_SCHEMA_VERSION = 14 as const;
export const V13_SAVE_SCHEMA_VERSION = 13 as const;
export const V12_SAVE_SCHEMA_VERSION = 12 as const;
export const V11_SAVE_SCHEMA_VERSION = 11 as const;
export const V10_SAVE_SCHEMA_VERSION = 10 as const;
export const V9_SAVE_SCHEMA_VERSION = 9 as const;
export const V8_SAVE_SCHEMA_VERSION = 8 as const;
export const V7_SAVE_SCHEMA_VERSION = 7 as const;
export const V6_SAVE_SCHEMA_VERSION = 6 as const;
export const DRIFT_BERTH_SAVE_SCHEMA_VERSION = 5 as const;
export const FIELD_CLOCK_SAVE_SCHEMA_VERSION = 4 as const;
export const FIELD_02_SAVE_SCHEMA_VERSION = 3 as const;
export const RIG_LAB_SAVE_SCHEMA_VERSION = 2 as const;
export const LEGACY_SAVE_SCHEMA_VERSION = 1 as const;
export const FIXED_STEP_SECONDS = 1 / 60;
export const MAX_FURROWS = 640;

/** Absolute diegetic minutes at a new field's 06:40 start. */
export const WORLD_CLOCK_START_MINUTES = 400;
export const WORLD_DAY_MINUTES = 1440;
export const GLOAM_START_MINUTE = 18 * 60 + 45;
export const NIGHT_START_MINUTE = 22 * 60 + 20;
/** One in-world minute passes every 2.4 real simulation seconds. */
export const WORLD_MINUTES_PER_REAL_SECOND = 1 / 2.4;

export { WORLD_LIMIT } from "./world";

/** Gravity used by the traversal model, in m/s². */
export const GRAVITY = 15.5;

export type WorldPhase = "day" | "gloam" | "night";

export function worldMinuteOfDay(worldTimeMinutes: number): number {
  const finite = Number.isFinite(worldTimeMinutes) ? worldTimeMinutes : 0;
  return ((finite % WORLD_DAY_MINUTES) + WORLD_DAY_MINUTES) % WORLD_DAY_MINUTES;
}

export function phaseForWorldTime(worldTimeMinutes: number): WorldPhase {
  const minute = worldMinuteOfDay(worldTimeMinutes);
  if (minute >= GLOAM_START_MINUTE && minute < NIGHT_START_MINUTE) {
    return "gloam";
  }
  if (minute >= NIGHT_START_MINUTE || minute < WORLD_CLOCK_START_MINUTES) {
    return "night";
  }
  return "day";
}
export const CAMERA_MODES = [
  "chase",
  "hood",
  "side",
  "tactical",
  "top-down",
  "survey",
] as const;
export type CameraMode = (typeof CAMERA_MODES)[number];
export const CAMERA_LABELS: Readonly<Record<CameraMode, string>> = {
  chase: "Chase",
  hood: "Hood",
  side: "Side",
  tactical: "Tactical",
  "top-down": "Top-down",
  survey: "Survey",
};
export { RIG_IDS, type RigId } from "./rig-ids";
/** Stable adapter vocabulary for specialised locomotion implementations. */
export const MOBILITY_ADAPTERS = ["ground", "hover"] as const;
export type MobilityAdapter = (typeof MOBILITY_ADAPTERS)[number];
/** Stable machine capability vocabulary shared by profiles, modules, and offers. */
export const RIG_CAPABILITIES = [
  "plough",
  "tow",
  "jump",
  "winch",
  "survey",
  "ford",
  "hover",
  "rally",
] as const;
export type RigCapability = (typeof RIG_CAPABILITIES)[number];
export type AttachmentId = "field-plough" | "tow-hook";

/** Drivetrain coupling. Locked buys climb traction and costs turning ease. */
export type DifferentialMode = "open" | "limited-slip" | "locked";

/** Highway pressure. The neutral state a fresh rig starts in. */
export const DEFAULT_TIRE_PRESSURE_PSI = 32;
export const MIN_TIRE_PRESSURE_PSI = 10;
export const MAX_TIRE_PRESSURE_PSI = 45;

export interface RigToolState {
  /**
   * Airing down grows the contact patch: more float on soft ground, more
   * rolling resistance and less top speed on hard ground.
   */
  tirePressurePsi: number;
  differentialMode: DifferentialMode;
}
export type ActivityStatus = "ready" | "active" | "complete";

export type ContinuousAction =
  "accelerate" | "brake" | "steerLeft" | "steerRight";
export type TapAction =
  | "primary"
  | "switchRig"
  | "camera"
  | "phase"
  | "pause"
  | "map"
  | "recover"
  | "blade";

export interface InputFrame {
  accelerate: boolean;
  brake: boolean;
  /** Player-relative left turn request. */
  steerLeft: boolean;
  /** Player-relative right turn request. */
  steerRight: boolean;
}

export const IDLE_INPUT: InputFrame = {
  accelerate: false,
  brake: false,
  steerLeft: false,
  steerRight: false,
};

// -----------------------------------------------------------------------------
// Rig blueprints
// -----------------------------------------------------------------------------

export interface RigProfile {
  id: RigId;
  displayName: string;
  fieldName: string;
  mobilityAdapter: MobilityAdapter;
  capabilities: readonly RigCapability[];

  /**
   * Peak drive acceleration at full grip, in m/s².
   *
   * With `topSpeed`, `lowSpeedTorque`, and the surface's grip, this *is* the
   * gearing: `driveForce` in `physics.ts` decays force toward `topSpeed` and
   * reduces it below `lugSpeed`, and traction caps whatever survives. Climbing
   * ability is emergent from those terms rather than being a separate stat.
   */
  enginePower: number;
  /**
   * Fraction of engine force available from a dead stop, 0..1.
   *
   * This is the difference between a tractor and a speed-geared buggy that no
   * other number can express: a tractor makes full pulling force at walking pace,
   * so it climbs from rest; a buggy geared for 21 m/s bogs off the line and needs
   * a run-up. Without this term both rigs are traction-limited at a standstill,
   * which makes them climb identically and makes low-range gearing do nothing.
   */
  lowSpeedTorque: number;
  /** Speed at which full engine force becomes available, in m/s. */
  lugSpeed: number;
  reverseAcceleration: number;
  topSpeed: number;
  reverseLimit: number;
  coastDrag: number;
  activeBrake: number;
  turnRate: number;
  steeringResponse: number;
  wheelRadius: number;
  /** Front-to-rear contact separation, in metres. Drives pitch response. */
  wheelbase: number;
  /** Left-to-right contact separation, in metres. Drives roll response. */
  track: number;
  mass: number;

  /** Body height above the mean contact plane at rest, in metres. */
  rideHeight: number;
  /** Suspension spring rate, in 1/s². Higher is stiffer. */
  suspensionStiffness: number;
  /** Suspension damping, in 1/s. Higher settles faster. */
  suspensionDamping: number;
  /** Maximum suspension deflection, in metres. */
  suspensionTravel: number;

  /** Tyre grip multiplier applied to the surface's own grip. */
  tireGrip: number;
  /**
   * How much of a low-grip surface's deficit the tyres recover.
   *
   * This is the mechanical reason a tractor beats a buggy in mud: lugs claw at
   * soft ground, so a high `lugBonus` matters most exactly where `surface.grip`
   * is worst. Slicks have a high `tireGrip` and a low `lugBonus`, which makes
   * them faster on hardpan and useless in the marsh.
   */
  lugBonus: number;

  jumpImpulse: number;
  landingTolerance: number;
  towSpeedMultiplier: number;
  /** Water depth this rig can cross without taking damage, in metres. */
  fordDepth: number;

  camera: {
    chaseHeight: number;
    chaseDistance: number;
    chaseSide: number;
    focusHeight: number;
  };
}

export const RIG_PROFILES: Readonly<Record<RigId, RigProfile>> = {
  "utility-tractor": {
    id: "utility-tractor",
    displayName: "Utility Tractor",
    fieldName: "Torque",
    mobilityAdapter: "ground",
    capabilities: ["plough", "tow", "rally"],
    enginePower: 11,
    lowSpeedTorque: 1,
    lugSpeed: 4,
    reverseAcceleration: 5,
    topSpeed: 11,
    reverseLimit: -4.5,
    coastDrag: 2.1,
    activeBrake: 12,
    turnRate: 1.25,
    steeringResponse: 4.5,
    wheelRadius: 0.72,
    wheelbase: 3.1,
    track: 2.6,
    mass: 4.8,
    rideHeight: 0.95,
    suspensionStiffness: 62,
    suspensionDamping: 11,
    suspensionTravel: 0.34,
    tireGrip: 0.98,
    lugBonus: 0.42,
    jumpImpulse: 0,
    landingTolerance: 4,
    towSpeedMultiplier: 0.88,
    fordDepth: 1.1,
    camera: {
      chaseHeight: 7.2,
      chaseDistance: 11,
      chaseSide: 4.2,
      focusHeight: 1.7,
    },
  },
  "toy-buggy": {
    id: "toy-buggy",
    displayName: "Toy Buggy",
    fieldName: "Spark",
    mobilityAdapter: "ground",
    capabilities: ["tow", "jump", "rally"],

    enginePower: 22,
    lowSpeedTorque: 0.22,
    lugSpeed: 5.5,
    reverseAcceleration: 8,
    topSpeed: 21,
    reverseLimit: -7,
    coastDrag: 1.25,
    activeBrake: 18,
    turnRate: 2.35,
    steeringResponse: 7.5,
    wheelRadius: 0.43,
    wheelbase: 2.2,
    track: 2.9,
    mass: 1.2,
    rideHeight: 0.62,
    suspensionStiffness: 108,
    suspensionDamping: 8.5,
    suspensionTravel: 0.42,
    tireGrip: 1.16,
    lugBonus: 0.1,
    jumpImpulse: 7.4,
    landingTolerance: 6.8,
    towSpeedMultiplier: 0.58,
    fordDepth: 0.4,
    camera: {
      chaseHeight: 5.2,
      chaseDistance: 8.5,
      chaseSide: 3,
      focusHeight: 1.05,
    },
  },
  "marsh-skimmer": {
    id: "marsh-skimmer",
    displayName: "Marsh Skimmer",
    fieldName: "Drift",
    mobilityAdapter: "hover",
    capabilities: ["tow", "survey", "hover", "rally"],
    enginePower: 9.5,
    lowSpeedTorque: 1,
    lugSpeed: 1,
    reverseAcceleration: 6.5,
    topSpeed: 15,
    reverseLimit: -5,
    coastDrag: 1.65,
    activeBrake: 10,
    turnRate: 1.75,
    steeringResponse: 5.8,
    // These dimensional fields describe the adapter's footprint. The hover
    // adapter does not create or simulate wheels from them.
    wheelRadius: 0.68,
    wheelbase: 3.2,
    track: 3.4,
    mass: 2.2,
    rideHeight: 1.35,
    suspensionStiffness: 34,
    suspensionDamping: 8,
    suspensionTravel: 0.55,
    tireGrip: 0,
    lugBonus: 0,
    jumpImpulse: 0,
    landingTolerance: 5.4,
    towSpeedMultiplier: 0.68,
    fordDepth: Number.POSITIVE_INFINITY,
    camera: {
      chaseHeight: 6.2,
      chaseDistance: 10,
      chaseSide: 3.8,
      focusHeight: 1.3,
    },
  },
  "heavy-utility-tow-recovery-01": {
    id: "heavy-utility-tow-recovery-01",
    displayName: "Heavy Utility Tow & Recovery Rig",
    fieldName: "Titan-Tow",
    mobilityAdapter: "ground",
    capabilities: ["tow", "winch", "rally"],
    enginePower: 18,
    lowSpeedTorque: 0.9,
    lugSpeed: 3.5,
    reverseAcceleration: 6,
    topSpeed: 14,
    reverseLimit: -5,
    coastDrag: 2.5,
    activeBrake: 15,
    turnRate: 1.1,
    steeringResponse: 4.0,
    wheelRadius: 0.85,
    wheelbase: 4.2,
    track: 3.0,
    mass: 7.5,
    rideHeight: 1.1,
    suspensionStiffness: 75,
    suspensionDamping: 12,
    suspensionTravel: 0.38,
    tireGrip: 1.05,
    lugBonus: 0.35,
    jumpImpulse: 0,
    landingTolerance: 4.5,
    towSpeedMultiplier: 0.92,
    fordDepth: 1.4,
    camera: {
      chaseHeight: 8.0,
      chaseDistance: 13,
      chaseSide: 4.5,
      focusHeight: 2.0,
    },
  },
  "heavy-salvage-crane-02": {
    id: "heavy-salvage-crane-02",
    displayName: "Heavy 8x8 Salvage Crane Rig",
    fieldName: "Goliath Crane",
    mobilityAdapter: "ground",
    capabilities: ["tow", "winch", "survey"],
    enginePower: 16,
    lowSpeedTorque: 0.95,
    lugSpeed: 3.0,
    reverseAcceleration: 5,
    topSpeed: 12,
    reverseLimit: -4,
    coastDrag: 2.8,
    activeBrake: 16,
    turnRate: 0.95,
    steeringResponse: 3.5,
    wheelRadius: 0.9,
    wheelbase: 5.4,
    track: 3.2,
    mass: 12.0,
    rideHeight: 1.25,
    suspensionStiffness: 90,
    suspensionDamping: 15,
    suspensionTravel: 0.3,
    tireGrip: 1.0,
    lugBonus: 0.4,
    jumpImpulse: 0,
    landingTolerance: 3.5,
    towSpeedMultiplier: 0.95,
    fordDepth: 1.6,
    camera: {
      chaseHeight: 9.0,
      chaseDistance: 15,
      chaseSide: 5.0,
      focusHeight: 2.4,
    },
  },
  "snow-crawler-expedition-01": {
    id: "snow-crawler-expedition-01",
    displayName: "Sub-Zero Expedition Snow Crawler",
    fieldName: "Frostbite",
    mobilityAdapter: "ground",
    capabilities: ["plough", "tow", "survey"],
    enginePower: 14,
    lowSpeedTorque: 0.85,
    lugSpeed: 3.2,
    reverseAcceleration: 5.5,
    topSpeed: 13,
    reverseLimit: -4.5,
    coastDrag: 2.0,
    activeBrake: 14,
    turnRate: 1.3,
    steeringResponse: 5.0,
    wheelRadius: 0.65,
    wheelbase: 4.0,
    track: 2.8,
    mass: 6.2,
    rideHeight: 0.85,
    suspensionStiffness: 55,
    suspensionDamping: 10,
    suspensionTravel: 0.32,
    tireGrip: 1.2,
    lugBonus: 0.5,
    jumpImpulse: 0,
    landingTolerance: 5.0,
    towSpeedMultiplier: 0.85,
    fordDepth: 1.2,
    camera: {
      chaseHeight: 7.5,
      chaseDistance: 12,
      chaseSide: 4.0,
      focusHeight: 1.8,
    },
  },
  "harvester-combined-cultivator-01": {
    id: "harvester-combined-cultivator-01",
    displayName: "Harvester & Combined Cultivator",
    fieldName: "Reaper-70",
    mobilityAdapter: "ground",
    capabilities: ["plough", "tow", "rally"],
    enginePower: 12,
    lowSpeedTorque: 0.95,
    lugSpeed: 3.8,
    reverseAcceleration: 4.5,
    topSpeed: 10,
    reverseLimit: -4,
    coastDrag: 2.4,
    activeBrake: 13,
    turnRate: 1.15,
    steeringResponse: 4.2,
    wheelRadius: 0.8,
    wheelbase: 3.6,
    track: 2.9,
    mass: 5.8,
    rideHeight: 1.0,
    suspensionStiffness: 60,
    suspensionDamping: 11,
    suspensionTravel: 0.35,
    tireGrip: 0.95,
    lugBonus: 0.45,
    jumpImpulse: 0,
    landingTolerance: 4.0,
    towSpeedMultiplier: 0.82,
    fordDepth: 1.0,
    camera: {
      chaseHeight: 7.8,
      chaseDistance: 12.5,
      chaseSide: 4.2,
      focusHeight: 1.9,
    },
  },
  "sentinel-mobile-fort-01": {
    id: "sentinel-mobile-fort-01",
    displayName: "Sentinel Mobile Fortification Crawler",
    fieldName: "Ironclad",
    mobilityAdapter: "ground",
    capabilities: ["tow", "winch", "survey"],
    enginePower: 15,
    lowSpeedTorque: 0.98,
    lugSpeed: 2.5,
    reverseAcceleration: 4,
    topSpeed: 11,
    reverseLimit: -3.5,
    coastDrag: 3.0,
    activeBrake: 18,
    turnRate: 0.85,
    steeringResponse: 3.2,
    wheelRadius: 0.75,
    wheelbase: 4.8,
    track: 3.6,
    mass: 14.5,
    rideHeight: 1.2,
    suspensionStiffness: 110,
    suspensionDamping: 18,
    suspensionTravel: 0.28,
    tireGrip: 1.1,
    lugBonus: 0.48,
    jumpImpulse: 0,
    landingTolerance: 3.0,
    towSpeedMultiplier: 0.96,
    fordDepth: 1.8,
    camera: {
      chaseHeight: 9.5,
      chaseDistance: 16,
      chaseSide: 5.2,
      focusHeight: 2.5,
    },
  },
  "aero-skimmer-survey-01": {
    id: "aero-skimmer-survey-01",
    displayName: "Aero-Skimmer High-Altitude Rig",
    fieldName: "SkyScout",
    mobilityAdapter: "hover",
    capabilities: ["survey", "hover", "rally"],
    enginePower: 24,
    lowSpeedTorque: 0.4,
    lugSpeed: 4.0,
    reverseAcceleration: 8,
    topSpeed: 26,
    reverseLimit: -8,
    coastDrag: 1.2,
    activeBrake: 12,
    turnRate: 2.1,
    steeringResponse: 7.0,
    wheelRadius: 0.5,
    wheelbase: 3.0,
    track: 2.6,
    mass: 1.4,
    rideHeight: 1.5,
    suspensionStiffness: 25,
    suspensionDamping: 6,
    suspensionTravel: 0.6,
    tireGrip: 0,
    lugBonus: 0,
    jumpImpulse: 0,
    landingTolerance: 6.0,
    towSpeedMultiplier: 0.62,
    fordDepth: Number.POSITIVE_INFINITY,
    camera: {
      chaseHeight: 6.5,
      chaseDistance: 9.5,
      chaseSide: 3.5,
      focusHeight: 1.2,
    },
  },
  "aero-cargo-freighter-02": {
    id: "aero-cargo-freighter-02",
    displayName: "Aero Heavy Tilt-Rotor Cargo Skimmer",
    fieldName: "SkyFreight",
    mobilityAdapter: "hover",
    capabilities: ["tow", "survey", "hover"],
    enginePower: 20,
    lowSpeedTorque: 0.6,
    lugSpeed: 3.0,
    reverseAcceleration: 6.5,
    topSpeed: 20,
    reverseLimit: -6,
    coastDrag: 1.5,
    activeBrake: 11,
    turnRate: 1.5,
    steeringResponse: 5.2,
    wheelRadius: 0.75,
    wheelbase: 4.6,
    track: 3.8,
    mass: 4.5,
    rideHeight: 1.8,
    suspensionStiffness: 30,
    suspensionDamping: 8,
    suspensionTravel: 0.65,
    tireGrip: 0,
    lugBonus: 0,
    jumpImpulse: 0,
    landingTolerance: 5.5,
    towSpeedMultiplier: 0.75,
    fordDepth: Number.POSITIVE_INFINITY,
    camera: {
      chaseHeight: 8.5,
      chaseDistance: 14,
      chaseSide: 4.8,
      focusHeight: 2.2,
    },
  },
  "torque-field-cutter-02": {
    id: "torque-field-cutter-02",
    displayName: "Torque Heavy Field Cultivator",
    fieldName: "Torque-Max",
    mobilityAdapter: "ground",
    capabilities: ["plough", "tow", "rally"],
    enginePower: 15,
    lowSpeedTorque: 1.0,
    lugSpeed: 3.6,
    reverseAcceleration: 5,
    topSpeed: 12,
    reverseLimit: -4.5,
    coastDrag: 2.2,
    activeBrake: 13,
    turnRate: 1.2,
    steeringResponse: 4.4,
    wheelRadius: 0.78,
    wheelbase: 3.4,
    track: 2.8,
    mass: 5.2,
    rideHeight: 0.98,
    suspensionStiffness: 65,
    suspensionDamping: 12,
    suspensionTravel: 0.33,
    tireGrip: 1.02,
    lugBonus: 0.44,
    jumpImpulse: 0,
    landingTolerance: 4.2,
    towSpeedMultiplier: 0.86,
    fordDepth: 1.2,
    camera: {
      chaseHeight: 7.4,
      chaseDistance: 11.5,
      chaseSide: 4.0,
      focusHeight: 1.7,
    },
  },
  "spark-dune-runner-02": {
    id: "spark-dune-runner-02",
    displayName: "Spark Desert Dune Runner",
    fieldName: "SandSpark",
    mobilityAdapter: "ground",
    capabilities: ["tow", "jump", "rally"],
    enginePower: 26,
    lowSpeedTorque: 0.25,
    lugSpeed: 5.0,
    reverseAcceleration: 9,
    topSpeed: 24,
    reverseLimit: -8,
    coastDrag: 1.15,
    activeBrake: 19,
    turnRate: 2.4,
    steeringResponse: 8.0,
    wheelRadius: 0.45,
    wheelbase: 2.4,
    track: 2.7,
    mass: 1.1,
    rideHeight: 0.65,
    suspensionStiffness: 115,
    suspensionDamping: 9,
    suspensionTravel: 0.45,
    tireGrip: 1.22,
    lugBonus: 0.12,
    jumpImpulse: 8.2,
    landingTolerance: 7.2,
    towSpeedMultiplier: 0.55,
    fordDepth: 0.5,
    camera: {
      chaseHeight: 5.0,
      chaseDistance: 8.0,
      chaseSide: 3.0,
      focusHeight: 1.0,
    },
  },
  "marsh-dredger-heavy-02": {
    id: "marsh-dredger-heavy-02",
    displayName: "Marsh Heavy Dredger Hovercraft",
    fieldName: "MudDredger",
    mobilityAdapter: "hover",
    capabilities: ["tow", "survey", "hover"],
    enginePower: 12,
    lowSpeedTorque: 0.9,
    lugSpeed: 1.5,
    reverseAcceleration: 5,
    topSpeed: 13,
    reverseLimit: -4.5,
    coastDrag: 1.8,
    activeBrake: 11,
    turnRate: 1.4,
    steeringResponse: 5.0,
    wheelRadius: 0.72,
    wheelbase: 3.8,
    track: 3.6,
    mass: 3.6,
    rideHeight: 1.4,
    suspensionStiffness: 32,
    suspensionDamping: 7.5,
    suspensionTravel: 0.58,
    tireGrip: 0,
    lugBonus: 0,
    jumpImpulse: 0,
    landingTolerance: 4.8,
    towSpeedMultiplier: 0.72,
    fordDepth: Number.POSITIVE_INFINITY,
    camera: {
      chaseHeight: 7.0,
      chaseDistance: 11,
      chaseSide: 4.0,
      focusHeight: 1.5,
    },
  },
  "hauler-road-train-01": {
    id: "hauler-road-train-01",
    displayName: "Hauler Highway Cargo Rig",
    fieldName: "RoadKing",
    mobilityAdapter: "ground",
    capabilities: ["tow", "rally"],
    enginePower: 20,
    lowSpeedTorque: 0.75,
    lugSpeed: 4.5,
    reverseAcceleration: 5.5,
    topSpeed: 18,
    reverseLimit: -5,
    coastDrag: 1.9,
    activeBrake: 17,
    turnRate: 1.1,
    steeringResponse: 4.2,
    wheelRadius: 0.7,
    wheelbase: 5.0,
    track: 2.6,
    mass: 8.8,
    rideHeight: 0.9,
    suspensionStiffness: 80,
    suspensionDamping: 14,
    suspensionTravel: 0.32,
    tireGrip: 1.0,
    lugBonus: 0.2,
    jumpImpulse: 0,
    landingTolerance: 4.0,
    towSpeedMultiplier: 0.88,
    fordDepth: 0.8,
    camera: {
      chaseHeight: 7.5,
      chaseDistance: 13,
      chaseSide: 4.2,
      focusHeight: 1.8,
    },
  },
  "construction-excavator-01": {
    id: "construction-excavator-01",
    displayName: "Construction Earthmover Excavator",
    fieldName: "EarthShifter",
    mobilityAdapter: "ground",
    capabilities: ["plough", "tow", "winch"],
    enginePower: 13,
    lowSpeedTorque: 1.0,
    lugSpeed: 2.0,
    reverseAcceleration: 4,
    topSpeed: 9,
    reverseLimit: -3.5,
    coastDrag: 3.2,
    activeBrake: 16,
    turnRate: 1.0,
    steeringResponse: 3.8,
    wheelRadius: 0.6,
    wheelbase: 3.8,
    track: 3.0,
    mass: 11.0,
    rideHeight: 0.9,
    suspensionStiffness: 85,
    suspensionDamping: 15,
    suspensionTravel: 0.25,
    tireGrip: 1.15,
    lugBonus: 0.45,
    jumpImpulse: 0,
    landingTolerance: 3.8,
    towSpeedMultiplier: 0.9,
    fordDepth: 1.5,
    camera: {
      chaseHeight: 8.0,
      chaseDistance: 13.5,
      chaseSide: 4.4,
      focusHeight: 2.1,
    },
  },
  "micro-scout-pipe-crawler-01": {
    id: "micro-scout-pipe-crawler-01",
    displayName: "Micro-Scout Pipe & Duct Crawler",
    fieldName: "NanoScout",
    mobilityAdapter: "ground",
    capabilities: ["survey", "rally"],
    enginePower: 10,
    lowSpeedTorque: 0.3,
    lugSpeed: 4.0,
    reverseAcceleration: 6,
    topSpeed: 12,
    reverseLimit: -4,
    coastDrag: 1.0,
    activeBrake: 14,
    turnRate: 2.5,
    steeringResponse: 8.5,
    wheelRadius: 0.25,
    wheelbase: 1.2,
    track: 1.0,
    mass: 0.35,
    rideHeight: 0.3,
    suspensionStiffness: 120,
    suspensionDamping: 6,
    suspensionTravel: 0.2,
    tireGrip: 1.1,
    lugBonus: 0.15,
    jumpImpulse: 4.0,
    landingTolerance: 6.0,
    towSpeedMultiplier: 0.45,
    fordDepth: 0.3,
    camera: {
      chaseHeight: 4.0,
      chaseDistance: 6.0,
      chaseSide: 2.5,
      focusHeight: 0.6,
    },
  },
} as const;

/**
 * Wheel order and local sign convention, shared by simulation and presentation.
 *
 * The traversal model samples the terrain under four contacts at
 * `(signX * track/2, signZ * wheelbase/2)` in rig-local space, and every
 * per-wheel array in `RigMobilityState` is indexed in this order. The renderer
 * must place its visible wheels at the same points, or the wheel a player sees
 * is not the wheel that reads the ground.
 *
 * This lived privately in `physics.ts`, which made the ordering a simulation
 * implementation detail rather than the shared invariant it actually is: the
 * renderer duplicated it by hand and drifted (see `rig-blockout.ts`). It is a
 * contract, so it belongs here.
 *
 * Local +Z is the rig's front and local +X its right — stated in full in the
 * `physics.ts` coordinate contract.
 */
export const WHEEL_LOCAL_SIGNS: readonly (readonly [number, number])[] = [
  [-1, 1], // 0 front-left  (x sign, z sign)
  [1, 1], // 1 front-right
  [-1, -1], // 2 rear-left
  [1, -1], // 3 rear-right
] as const;

/** Human labels for the wheel indices, in `WHEEL_LOCAL_SIGNS` order. */
export const WHEEL_LABELS = [
  "front-left",
  "front-right",
  "rear-left",
  "rear-right",
] as const;

/**
 * Conservative simple collider enclosing the rig's authored wheel footprint.
 *
 * The runtime currently resolves planar circles rather than oriented compound
 * shapes. Using only half the track width let long vehicle noses enter visible
 * meshes before their centres touched. The half-diagonal encloses the front and
 * rear wheel arcs, so the simple proxy remains honest until a later solver
 * adapter can express the same blueprint as a capsule or compound collider.
 */
export function rigCollisionRadius(
  profile: Pick<RigProfile, "track" | "wheelbase" | "wheelRadius">,
): number {
  const halfLength = profile.wheelbase * 0.5 + profile.wheelRadius;
  const halfWidth = profile.track * 0.5 + 0.15;
  return Math.hypot(halfLength, halfWidth);
}

// -----------------------------------------------------------------------------
// Modules: the progression layer
// -----------------------------------------------------------------------------

export type ModuleId =
  | "low-range-gearing"
  | "lug-tires"
  | "winch"
  | "survey-mast"
  | "skid-plate"
  | "flotation-pontoons";

/**
 * A module is a physical part that changes what terrain is passable.
 *
 * Every effect below is a change to the *traversal envelope*, never a cosmetic
 * stat bump: gearing changes what grade you can climb, tyres change which
 * surfaces hold, pontoons change how deep you can ford, the mast changes how far
 * you can see. Progression is therefore legible on the map rather than in a
 * numbers panel (ADR-0007 §4).
 */
export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  /** What the player can newly do, phrased as a consequence. */
  promise: string;
  cost: number;
  fits: readonly RigId[];
  grantsCapability?: RigCapability;
  /** Multipliers and offsets applied to the base profile, in install order. */
  effects: Partial<{
    enginePower: number;
    lowSpeedTorque: number;
    topSpeed: number;
    tireGrip: number;
    lugBonus: number;
    towSpeedMultiplier: number;
    landingTolerance: number;
    fordDepth: number;
    suspensionStiffness: number;
  }>;
  /** Additive rather than multiplicative fields. */
  offsets?: Partial<{
    lugBonus: number;
    fordDepth: number;
    surveyRange: number;
  }>;
}

export const MODULES: Readonly<Record<ModuleId, ModuleDefinition>> = {
  "low-range-gearing": {
    id: "low-range-gearing",
    name: "Low-range gearing",
    promise: "Climbs grades that used to stall the engine. Costs top speed.",
    cost: 6,
    fits: ["utility-tractor", "toy-buggy"],
    // Deep gearing multiplies torque and restores pulling force from a stall,
    // which is what actually unlocks a grade. `lowSpeedTorque` is clamped to 1 in
    // `driveForce`, so this is a large factor on the buggy and a no-op on the
    // tractor, which already has all of it.
    effects: { enginePower: 1.5, lowSpeedTorque: 3.8, topSpeed: 0.86 },
  },
  "lug-tires": {
    id: "lug-tires",
    name: "Lug tyres",
    promise: "Bites into mud and dust bowls where slicks spin.",
    cost: 5,
    fits: ["utility-tractor", "toy-buggy"],
    effects: { tireGrip: 1.06 },
    offsets: { lugBonus: 0.34 },
  },
  winch: {
    id: "winch",
    name: "Recovery winch",
    promise:
      "Pulls itself off a bad line, and tows without losing as much speed.",
    cost: 8,
    fits: ["utility-tractor", "toy-buggy"],
    grantsCapability: "winch",
    effects: { towSpeedMultiplier: 1.14 },
  },
  "survey-mast": {
    id: "survey-mast",
    name: "Survey mast",
    promise: "Sees and maps far more of the land from any high ground.",
    cost: 7,
    fits: ["utility-tractor", "toy-buggy"],
    grantsCapability: "survey",
    effects: {},
    offsets: { surveyRange: 62 },
  },
  "skid-plate": {
    id: "skid-plate",
    name: "Skid plate",
    promise: "Takes hard landings and rock strikes without losing condition.",
    cost: 5,
    fits: ["utility-tractor", "toy-buggy"],
    effects: { landingTolerance: 1.7, suspensionStiffness: 1.08 },
  },
  "flotation-pontoons": {
    id: "flotation-pontoons",
    name: "Flotation pontoons",
    promise: "Crosses the Sunken Flats instead of drowning in them.",
    cost: 9,
    fits: ["utility-tractor", "toy-buggy"],
    grantsCapability: "ford",
    effects: {},
    offsets: { fordDepth: 1.9 },
  },
} as const;

export const MODULE_IDS = Object.keys(MODULES) as readonly ModuleId[];

/** Base survey sight range in metres, before a survey mast. */
export const BASE_SURVEY_RANGE = 46;

export interface EffectiveRig extends RigProfile {
  /** How far this rig can survey from its current vantage. */
  surveyRange: number;
  installedModules: readonly ModuleId[];
}

/**
 * Compose a rig's installed modules onto its immutable blueprint.
 *
 * Pure and cheap; called from the fixed step. Keeping this a derivation rather
 * than mutating `RIG_PROFILES` is what lets a save record store only a module id
 * list and still reproduce identical handling (ADR-0003).
 */
export function effectiveProfile(
  rigId: RigId,
  modules: readonly ModuleId[],
): EffectiveRig {
  const base = RIG_PROFILES[rigId];
  const composed: EffectiveRig = {
    ...base,
    camera: { ...base.camera },
    capabilities: [...base.capabilities],
    surveyRange: BASE_SURVEY_RANGE,
    installedModules: modules,
  };

  const capabilities = new Set<RigCapability>(composed.capabilities);

  for (const moduleId of modules) {
    const definition = MODULES[moduleId];
    if (!definition || !definition.fits.includes(rigId)) continue;

    for (const [key, factor] of Object.entries(definition.effects)) {
      if (typeof factor !== "number") continue;
      const field = key as keyof ModuleDefinition["effects"];
      composed[field] = composed[field] * factor;
    }
    if (definition.offsets) {
      for (const [key, offset] of Object.entries(definition.offsets)) {
        if (typeof offset !== "number") continue;
        const field = key as "lugBonus" | "fordDepth" | "surveyRange";
        composed[field] = composed[field] + offset;
      }
    }
    if (definition.grantsCapability) {
      capabilities.add(definition.grantsCapability);
    }
  }

  composed.capabilities = [...capabilities];
  return composed;
}

// -----------------------------------------------------------------------------
// Rig runtime state
// -----------------------------------------------------------------------------

/**
 * Which way the plough blade works.
 *
 * `cut` lowers terrain (the original behaviour). `fill` raises it. Both are
 * bounded by `DEFORM_MIN`/`DEFORM_MAX` in `terrain.ts`, and because `surfaceFor`
 * derives material from height, filling a wet cell far enough turns mud into
 * pasture. Raising ground was implemented in the terrain field from the start and
 * had no caller until now.
 */
export type BladeMode = "cut" | "fill";

export interface AttachmentState {
  id: AttachmentId;
  engaged: boolean;
  /**
   * Blade direction, for implements that move soil. Optional so older save
   * records load unchanged and default to `cut`.
   */
  mode?: BladeMode;
}

/** Per-wheel suspension and contact state. Four entries, front-left first. */
export interface WheelState {
  /** Suspension compression, 0 (extended) to 1 (bottomed out). */
  compression: number;
  /** True when this wheel is touching ground. */
  contact: boolean;
  /** Longitudinal slip ratio, 0 (gripping) to 1 (spinning freely). */
  slip: number;
}

export interface GroundMobilityState {
  kind: "ground";
  verticalVelocity: number;
  grounded: boolean;
  jumpCooldownMs: number;
  wheelRotation: number;
  wheels: WheelState[];
}

export interface HoverMobilityState {
  kind: "hover";
  liftVelocity: number;
  /** Current body clearance above terrain or standing water, in metres. */
  clearance: number;
  /** Smoothed lift authority, 0..1. Drives handling, sound, and presentation. */
  cushionPressure: number;
  /** True when the skirt is close enough to terrain/water to sustain lift. */
  skirtContact: boolean;
}

export type RigMobilityState = GroundMobilityState | HoverMobilityState;

export interface RigState {
  id: RigId;
  /**
   * Persistent, player-owned vehicle identity. The matching profile's field
   * name is only the authored suggestion used when recovering older saves.
   */
  fieldName: string;
  x: number;
  /** Body origin elevation in world space, in metres. */
  y: number;
  z: number;
  heading: number;
  /** Nose-up rotation in radians, derived from the contact plane. */
  pitch: number;
  /** Right-side-down rotation in radians, derived from the contact plane. */
  roll: number;
  speed: number;
  steering: number;
  distanceTravelled: number;
  condition: number;
  /** Fuel-free proxy for mechanical strain; rises under load, recovers at rest. */
  strain: number;
  /**
   * Mechanical wear per component — the layer beneath structural `condition`.
   * Kernel-owned: tread wear feeds effective grip, so it must survive reload
   * and replay.
   */
  componentHealth: ComponentHealthState;
  /** Odometer reading (m) at the last wear flush; see WEAR_FLUSH_INTERVAL_M. */
  componentWearFlushedAtM: number;
  mobility: RigMobilityState;
  attachments: AttachmentState[];
  modules: ModuleId[];
  /**
   * Tool states the player commits to. Each buys something and costs something,
   * which is what separates a tactical verb from a "better" button.
   *
   * Kernel-owned because they change motion and must survive reload and replay.
   */
  tools: RigToolState;
  /** Player-owned operating headlights state (on/off). Defaults to false during day. */
  headlightsActive?: boolean;
  /** Cached read-only telemetry for HUD and audio; not authoritative. */
  telemetry: {
    surfaceId: string;
    grade: number;
    grip: number;
    slip: number;
    waterDepth: number;
    engineLoad: number;
    stalled: boolean;
  };
}

export interface FurrowMark {
  x: number;
  z: number;
  heading: number;
  createdAt: number;
  rigId: RigId;
  /** Blade direction at time of creation. Unfolds from the plough attachment. */
  mode: BladeMode;
}

export interface DiscoveryState {
  id: string;
  discoveredAt: number;
}

export interface CargoState {
  id: "relay-cargo";
  x: number;
  y: number;
  z: number;
  heading: number;
  attachedRigId: RigId | null;
  delivered: boolean;
}

/** The one physical crate's mission route; null preserves the Relay-haul fallback. */
export interface CargoAssignment {
  /** Null when a player voluntarily loaded a community shipment. */
  missionId: string | null;
  /** Content-owned shipment semantics, never a second cargo physics model. */
  manifestId?: string;
  originSiteId: string;
  destinationSiteId: string;
}

export interface CargoRelayState {
  id: "cargo-relay";
  status: ActivityStatus;
  startedAt: number | null;
  completedAt: number | null;
  bestTimeMs: number | null;
  assignment: CargoAssignment | null;
  cargo: CargoState;
}

/**
 * A survey contract: paid for line of sight, never for arrival.
 *
 * Lives beside `CargoRelayState` because both are save state and the save schema
 * owns its own shapes. The *rules* live in `activities.ts`; this is only what
 * persists. Timing is in diegetic world minutes rather than elapsed milliseconds,
 * because a survey is bounded by the light, not by how long the player sat parked.
 */
export interface SurveyRouteState {
  id: "survey-route";
  status: ActivityStatus | "failed";
  startedAtMinutes: number | null;
  /** Site ids sighted so far, in the order they were first seen. */
  sighted: readonly string[];
  bestSightedCount: number;
}

/**
 * One completed open-road run. The run belongs to a machine, not a player
 * level, so the world can remember how different machines meet the same land.
 */
export interface RoadRivalryRunRecord {
  rigId: RigId;
  elapsedMs: number;
  completedAtMs: number;
}

/**
 * Persistent state for a voluntary, repeatable local road run.
 *
 * Unlike a mission, a road run has no acceptance slot, reward gate, expiry, or
 * world unlock. It only remembers the active attempt and the machines' local
 * records. The course geometry remains authored world data in `activities.ts`.
 */
export interface RoadRivalryState {
  id: "road-rivalry";
  status: "ready" | "active";
  startedAtMs: number | null;
  activeRigId: RigId | null;
  nextGateIndex: number;
  completedRuns: number;
  bestTimeMsByRig: Partial<Record<RigId, number>>;
  lastRun: RoadRivalryRunRecord | null;
}

/** The single authoritative accepted mission contract. Propositions remain derived. */
export interface ActiveMissionState {
  id: string;
  binding: MissionBinding;
  /** Quest class; "main" claims the focus slot exclusively. */
  missionClass: MissionClass;
  /** Character/site/faction that issued the mission, or null for world-derived. */
  giverId: string | null;
  /** Durable reference to a community consequence, never a UI-only callback. */
  settlementOutcomeId: SettlementNeedOutcomeId | null;
  targetSiteId: string;
  waypointIds: readonly string[];
  requiredCapabilities: readonly RigCapability[];
  rewardSalvage: number;
  difficultyLabel: "standard" | "hard" | "extreme";
  activeRigId: RigId;
  acceptedAtMs: number;
  progressIndex: number;
}

export interface CutFillEditRecord {
  mode: BladeMode;
  authorRigId: RigId;
  x: number;
  z: number;
  heading: number;
  width: number;
  depthDelta: number;
  affectedCellCount: number;
  createdAt: number;
  routeId?: string;
  visualCategory: "cut-tilled" | "fill-causeway" | "graded-pass";
}

export interface FleetInheritanceRecord {
  authorRigId: RigId;
  benefitingRigId: RigId;
  routeId: string;
  crossedAtMs: number;
  persisted: boolean;
}

/**
 * The first playable slice: harvest Long Furrow before the storm.
 *
 * This state is owned by `stepGame`, never by the renderer or UI. The crop
 * count and delivered flag are the single source of truth for the harvest
 * objective; the storm countdown is derived from the weather clock.
 */
export interface HarvestState {
  /**
   * Quantised field cells already ploughed, as `"<x2>,<z2>"` keys where each
   * component is the world coordinate rounded to half-metre resolution.
   *
   * This is the authority for cultivation progress; `cultivatedRows` is a
   * derived count kept alongside it for cheap reads. It must be a plain array
   * rather than a `Set` because `GameState` is persisted with
   * `JSON.stringify` (see `storage.ts`), which serialises a `Set` as `{}` and
   * would silently discard every recorded cell on save, replay-clone, and
   * determinism hashing.
   *
   * Bounded by `MAX_CULTIVATED_CELLS` so a long session cannot grow the save
   * without limit.
   */
  cultivatedCells: string[];
  /**
   * How many crop rows have been cultivated. Derived from `cultivatedCells`
   * via `cultivatedRowsFor()`; never assign to it independently.
   */
  cultivatedRows: number;
  /** Total crop rows available to cultivate. */
  totalRows: number;
  /** Whether the cultivated crops have been delivered to the barn. */
  delivered: boolean;
  /** Whether the storm has arrived and the field is now waterlogged. */
  stormArrived: boolean;
  /** World minutes when the storm arrives (derived from weather clock). */
  stormAtMinutes: number;
}

/** Field cells that must be ploughed to complete one crop row. */
export const CULTIVATION_CELLS_PER_ROW = 8;

/**
 * Upper bound on remembered cultivation cells. The Long Furrow south field is
 * 10m x 12m sampled at half-metre resolution, so a fully ploughed field needs
 * well under this; the cap exists to bound the save, not to limit play.
 */
export const MAX_CULTIVATED_CELLS = 2048;

/** Derive the crop-row count from remembered cultivation cells. */
export function cultivatedRowsFor(
  cellCount: number,
  totalRows: number,
): number {
  return Math.min(totalRows, Math.floor(cellCount / CULTIVATION_CELLS_PER_ROW));
}

export interface GameState {
  schemaVersion: typeof SAVE_SCHEMA_VERSION;
  seed: string;
  /** Absolute, monotonic diegetic minutes; presentation wraps at 24 hours. */
  worldTimeMinutes: number;
  elapsedMs: number;
  phase: WorldPhase;
  cameraMode: CameraMode;
  paused: boolean;
  mapOpen: boolean;
  activeRigId: RigId;
  rigs: Record<RigId, RigState>;
  cargoRelay: CargoRelayState;
  surveyRoute: SurveyRouteState;
  roadRivalry: RoadRivalryState;
  /** Persistent world machinery; activities may observe it but never own it. */
  infrastructure: InfrastructureNetworkState;
  /** One lasting player choice for the Home Valley waterworks. */
  farmWaterworks: FarmWaterworksState;
  /** Optional North Field subsurface investigation. */
  northFieldInvestigation: NorthFieldInvestigationState;
  /** Community condition, favor, and completed work across the current region. */
  settlements: SettlementState;
  activeMission: ActiveMissionState | null;
  /**
   * Concurrent non-main missions. The focus slot above stays the single
   * main-class authority; side/local missions may run alongside it.
   */
  activeSideMissions: ActiveMissionState[];
  unboundPassage: UnboundPassageState;
  furrows: FurrowMark[];
  semanticEdits: CutFillEditRecord[];
  fleetInheritance: FleetInheritanceRecord[];
  discoveries: DiscoveryState[];
  /** Spendable resource. One resource by design; see the exploration map. */
  salvage: number;
  /** Lifetime salvage collected, for the progress readout. */
  salvageCollected: number;
  /**
   * Commodity inventory for workshop crafting. Bounded to the three scrap
   * commodities; awards are deterministic and tied to salvage collection.
   */
  inventory: Record<CommodityType, number>;
  /**
   * Crafted modules awaiting installation. A part in the bin can be fitted
   * without spending salvage.
   */
  partsBin: ModuleId[];
  /** Restoration progress for the opening tractor beat. */
  restoration: RestorationState;
  /** Persistent completion state for the first player-authored rig name. */
  openingNaming: OpeningNamingState;
  /** Persistent state for the old man's arrival and shelter bargain. */
  arrivalBargain: ArrivalBargainState;
  /** Emergency recovery is exceptional, persisted, and operator-auditable. */
  recovery: {
    emergencyCount: number;
    lastEmergencyAtMs: number | null;
  };
  /** Durable advancement state. XP, rungs, and restoration live here. */
  progression: ProgressionState;
  /** First playable slice: Long Furrow harvest before the storm. */
  harvest: HarvestState;
  /** First playable slice: the authored first-night threat (§3 of the slice spec). */
  firstNightThreat: FirstNightThreatState;
  /** First playable slice: the open-world-promise finale (§5 of the slice spec). */
  openWorldPromise: OpenWorldPromiseState;
  saveStatus?: "saved" | "pending" | "restored" | "migrated";
  lastDiagnostic: string | null;
}

/**
 * Restoration progress for the old man's tractor in Campaign One's opening.
 *
 * Kept deliberately small: three booleans carry the diagnose → repair → first
 * start beat without inventing a parallel quest state machine.
 */
export interface RestorationState {
  diagnosed: boolean;
  repaired: boolean;
  firstStart: boolean;
}

/** The old man's naming beat is one-time world memory, not dialogue-local UI. */
export interface OpeningNamingState {
  status: "waiting" | "ready" | "complete";
}

/**
 * The arrival & bargain beat is durable world memory, not dialogue-local UI.
 *
 * It tracks whether the old man's shelter-for-repair offer has been seen,
 * accepted, or refused. A refused offer can be re-presented later.
 */
export interface ArrivalBargainState {
  status: "unseen" | "accepted" | "refused";
}

export type FarmWaterworksChoice =
  "unresolved" | "repair-pump" | "redirect-channel";

/** Save-owned water outcome; field cells and infrastructure provide its effects. */
export interface FarmWaterworksState {
  choice: FarmWaterworksChoice;
  chosenAtWorldMinutes: number | null;
}

export interface NorthFieldInvestigationState {
  status: "unresolved" | "scanned";
  scannedAtWorldMinutes: number | null;
  anomalyDepthMeters: number | null;
}

export interface LandmarkDefinition {
  id: string;
  name: string;
  verb: string;
  x: number;
  z: number;
  radius: number;
}

/**
 * Discovery targets, derived from the authored world layout rather than declared
 * twice. Before ADR-0007 this list was hand-maintained alongside renderer prop
 * placement, which is exactly the parallel-truth-source problem the ADR closes.
 */
export const LANDMARKS: readonly LandmarkDefinition[] = WORLD_SITES.map(
  (site) => ({
    id: site.id,
    name: site.name,
    verb: site.verb,
    x: site.x,
    z: site.z,
    radius: site.discoverRadius,
  }),
);

/** Maximum spatial distance for switching control between two physical rigs. */
export const RIG_SWITCH_RANGE = 34;

/** The cargo relay route, expressed relative to authored sites. */
export const CARGO_PICKUP = { x: 26, z: -6, radius: 5 } as const;
const CARGO_DELIVERY_SITE_ID = "long-furrow";
const cargoDeliverySite = WORLD_SITES.find(
  (site) => site.id === CARGO_DELIVERY_SITE_ID,
);
if (!cargoDeliverySite) {
  throw new Error(
    `Missing authored cargo delivery site: ${CARGO_DELIVERY_SITE_ID}`,
  );
}
export const CARGO_DELIVERY = {
  siteId: cargoDeliverySite.id,
  x: cargoDeliverySite.x,
  z: cargoDeliverySite.z,
  radius: 6,
} as const;

export interface CargoRouteTarget {
  siteId: string | null;
  x: number;
  z: number;
  radius: number;
}

/**
 * The physical relay crate is the pickup authority.
 *
 * An assignment supplies the semantic origin site, but a voluntary shipment
 * may stage the crate at an explicit stock bay inside that site. Returning the
 * crate coordinates keeps interaction rings and any caller that needs a pickup
 * target aligned with the rendered and colliding object.
 */
export function cargoPickupTarget(relay: CargoRelayState): CargoRouteTarget {
  const site = relay.assignment
    ? WORLD_SITES.find((item) => item.id === relay.assignment?.originSiteId)
    : undefined;
  return {
    siteId: site?.id ?? null,
    x: relay.cargo.x,
    z: relay.cargo.z,
    radius: CARGO_PICKUP.radius,
  };
}

/** Assigned mission destination or the legacy Relay-haul finish. */
export function cargoDeliveryTarget(relay: CargoRelayState): CargoRouteTarget {
  const site = relay.assignment
    ? WORLD_SITES.find(
        (item) => item.id === relay.assignment?.destinationSiteId,
      )
    : undefined;
  return site
    ? {
        siteId: site.id,
        x: site.x,
        z: site.z,
        radius: Math.min(8, site.serviceRadius ?? CARGO_DELIVERY.radius),
      }
    : CARGO_DELIVERY;
}
export const BUGGY_RAMP = {
  x: 24,
  z: -26,
  /** Proximity radius for the launch trigger; independent of the deck footprint. */
  radius: 3.6,
  minimumSpeed: 8,
  /**
   * Authored deck geometry. This is the single source of truth for the ramp's
   * shape: the renderer builds its mesh from these fields and the ground
   * adapter derives driveable surface height from the same fields, so the
   * visible ramp and the one a rig can actually stand on can never drift apart.
   */
  deckWidth: 6.5,
  deckDepth: 8,
  deckThickness: 0.6,
  /** Deck centre height above the terrain sample at (x, z). */
  deckOffset: 0.85,
  /** Tilt about the world X axis; negative pitches the far (+local Z) edge up. */
  tiltRadians: -0.18,
} as const;
