/**
 * Shared rig-perception contract.
 *
 * Physics owns authoritative motion. Presentation systems consume this derived,
 * read-only frame so animation, camera, audio, VFX, and UI agree about what the
 * machine is doing without writing competing simulation state.
 */

import type { EffectiveRig, RigId, RigState } from "./contracts";
import { clamp } from "./noise";

interface MotionExpressionProfile {
  maximumSteeringAngle: number;
  bodyRollRadians: number;
  drivePitchRadians: number;
  cameraForwardLook: number;
  cameraLateralLook: number;
  maximumFovBoost: number;
}

const DEFAULT_EXPRESSION: MotionExpressionProfile = {
  maximumSteeringAngle: 0.34,
  bodyRollRadians: 0.065,
  drivePitchRadians: 0.025,
  cameraForwardLook: 3,
  cameraLateralLook: 1.2,
  maximumFovBoost: 6,
};

const MOTION_EXPRESSION: Readonly<
  Partial<Record<RigId, MotionExpressionProfile>>
> = {
  "utility-tractor": {
    maximumSteeringAngle: 0.3,
    bodyRollRadians: 0.045,
    drivePitchRadians: 0.032,
    cameraForwardLook: 2.4,
    cameraLateralLook: 0.75,
    maximumFovBoost: 5,
  },
  "toy-buggy": {
    maximumSteeringAngle: 0.48,
    bodyRollRadians: 0.105,
    drivePitchRadians: 0.055,
    cameraForwardLook: 5.2,
    cameraLateralLook: 2.4,
    maximumFovBoost: 8,
  },
  "marsh-skimmer": {
    maximumSteeringAngle: 0,
    bodyRollRadians: 0.13,
    drivePitchRadians: 0.065,
    cameraForwardLook: 4.2,
    cameraLateralLook: 2.8,
    maximumFovBoost: 7,
  },
};

export interface RigFeedbackFrame {
  /** Normalized absolute road/water speed. */
  speedRatio: number;
  /** Normalized traction or cushion-authority loss. */
  tractionLoss: number;
  /** Combined propulsion, strain, and traction demand. */
  driveLoad: number;
  /** Signed turn force proxy: positive follows positive steering input. */
  lateralLoad: number;
  /** Front-wheel visual steering angle; zero for non-steering presentations. */
  steeringAngle: number;
  /** Presentation-only body offsets layered over physical terrain attitude. */
  bodyRollOffset: number;
  bodyPitchOffset: number;
  /** Camera anticipation offsets in rig-forward/right metres. */
  cameraForwardLook: number;
  cameraLateralLook: number;
  /** Additional field of view allowed by speed. */
  speedFovBoost: number;
  /** Scale applied to non-essential motion expression. */
  motionScale: number;
  /** Normalized rig condition / health factor (0.0 = damaged, 1.0 = pristine). */
  integrityRatio: number;
  /** Active impact impulse vector for hit VFX, if a collision occurred. */
  lastImpact?: {
    x: number;
    y: number;
    z: number;
    intensity: number;
  };
}

export class SpringDamper {
  value = 0;
  velocity = 0;
  constructor(
    public stiffness = 120,
    public damping = 12,
  ) {}

  update(target: number, dt: number): number {
    const force = (target - this.value) * this.stiffness;
    const dampForce = -this.velocity * this.damping;
    this.velocity += (force + dampForce) * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}

/**
 * Convert authoritative rig state into shared perceptual signals.
 *
 * Reduced motion retains essential physical attitude and wheel state, but clamps
 * presentation-only exaggeration and removes speed-driven field-of-view changes.
 */
export function deriveRigFeedback(
  rig: RigState,
  profile: EffectiveRig,
  reducedMotion = false,
): RigFeedbackFrame {
  const expression = MOTION_EXPRESSION[rig.id] ?? DEFAULT_EXPRESSION;
  const speedRatio = clamp(
    Math.abs(rig.speed) / Math.max(1, profile.topSpeed),
    0,
    1,
  );
  const tractionLoss = clamp(rig.telemetry.slip, 0, 1);
  const driveLoad = clamp(
    rig.telemetry.engineLoad * 0.72 + rig.strain * 0.38 + tractionLoss * 0.28,
    0,
    1,
  );
  const lateralLoad =
    rig.steering *
    speedRatio *
    clamp(Math.abs(rig.speed) / 2.2, 0, 1) *
    clamp(rig.telemetry.grip, 0.25, 1.1);
  const motionScale = reducedMotion ? 0.32 : 1;

  const integrityRatio = clamp(1 - rig.strain, 0, 1);

  return {
    speedRatio,
    tractionLoss,
    driveLoad,
    lateralLoad,
    steeringAngle:
      rig.mobility.kind === "ground"
        ? -rig.steering * expression.maximumSteeringAngle
        : 0,
    bodyRollOffset: -lateralLoad * expression.bodyRollRadians * motionScale,
    bodyPitchOffset: -driveLoad * expression.drivePitchRadians * motionScale,
    cameraForwardLook: speedRatio * expression.cameraForwardLook * motionScale,
    cameraLateralLook:
      -lateralLoad * expression.cameraLateralLook * motionScale,
    speedFovBoost: reducedMotion ? 0 : speedRatio * expression.maximumFovBoost,
    motionScale,
    integrityRatio,
  };
}
