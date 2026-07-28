/**
 * Vehicle animation system for rigs-unbound.
 * Integrates with physics feedback system for wheel rotation, suspension, steering, and body animation.
 */

import * as THREE from "three";
import { SpringDamper, deriveRigFeedback, type RigFeedbackFrame } from "./feedback";
import { effectiveProfile, type RigId, type RigState, type GameState } from "./contracts";
import type { RigParts } from "./renderer";

/**
 * Reserved clip-backed action bindings for future authored rig animations.
 * `null` means the current tree has not yet introduced clip-driven actions.
 */
export type ClipActionBindings = ReadonlyMap<string, THREE.AnimationAction> | null;

/**
 * Animation state for a single rig.
 * Tracks animation mixers, clip actions, and procedural animation state.
 */
export interface RigAnimationState {
  mixer: THREE.AnimationMixer | null;
  /** Reserved clip-backed action bindings; null until authored clips arrive. */
  clipActions: ClipActionBindings;
  wheelRotation: number;
  suspensionCompression: SpringDamper[];
  steeringAngle: SpringDamper;
  bodyRoll: SpringDamper;
  bodyPitch: SpringDamper;
  lugTireVisible: boolean;
  ploughAngle: SpringDamper;
  stateShellPulse: number;
  steeringWheelAngle: SpringDamper;
}

/**
 * Manages animations for all vehicle rigs.
 * Integrates with physics feedback system for procedural animation.
 */
export class VehicleAnimationSystem {
  private rigAnimations: Map<string, RigAnimationState> = new Map();
  private rigParts: Map<string, RigParts> = new Map();
  private wheelRadius: Map<string, number[]> = new Map();
  private trackWidth: Map<string, number> = new Map();

  /**
   * Register a rig for animation.
   */
  registerRig(
    rigId: string,
    parts: RigParts,
    wheelRadius: number[],
    trackWidth: number,
  ): void {
    this.rigParts.set(rigId, parts);
    this.wheelRadius.set(rigId, wheelRadius);
    this.trackWidth.set(rigId, trackWidth);

    const state: RigAnimationState = {
      mixer: null,
      // `clipActions` stays null until future imported animation clips arrive.
      // The current tree has no clip-backed rig actions yet, so the live owner
      // remains procedural until assets or authored clips arrive.
      clipActions: null,
      wheelRotation: 0,
      suspensionCompression: parts.wheels.map(() => new SpringDamper(120, 12)),
      steeringAngle: new SpringDamper(120, 12),
      bodyRoll: new SpringDamper(80, 10),
      bodyPitch: new SpringDamper(80, 10),
      lugTireVisible: false,
      ploughAngle: new SpringDamper(120, 12),
      stateShellPulse: 0,
      steeringWheelAngle: new SpringDamper(120, 12),
    };

    this.rigAnimations.set(rigId, state);
  }

  /**
   * Initialize animation mixer for a rig when its root is available.
   */
  initializeMixer(rigId: string, root: THREE.Object3D): void {
    const state = this.rigAnimations.get(rigId);
    if (!state) return;

    state.mixer = new THREE.AnimationMixer(root);
  }

  /**
   * Update all animations for a frame.
   */
  update(
    delta: number,
    state: GameState,
    feedbackByRig?: ReadonlyMap<RigId, RigFeedbackFrame>,
    reducedMotion = false,
  ): void {
    for (const [rigId] of this.rigAnimations) {
      const rigState = state.rigs?.[rigId as RigId];
      if (!rigState) continue;

      const parts = this.rigParts.get(rigId);
      if (!parts) continue;

      const feedback =
        feedbackByRig?.get(rigId as RigId) ?? this.computeFeedback(rigState, reducedMotion);
      this.updateRigAnimation(rigId, delta, rigState, feedback);
    }
  }

  private computeFeedback(
    rigState: RigState,
    reducedMotion: boolean,
  ): RigFeedbackFrame {
    const profile = effectiveProfile(rigState.id, rigState.modules);
    return deriveRigFeedback(rigState, profile, reducedMotion);
  }

  private updateRigAnimation(
    rigId: string,
    delta: number,
    rigState: RigState,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts) return;

    if (state.mixer) {
      state.mixer.update(delta);
    }

    this.updateWheelRotation(rigId, delta, rigState);
    this.updateSuspension(rigId, delta, feedback);
    this.updateSteering(rigId, delta, feedback);
    this.updateBodyMotion(rigId, delta, feedback);
    this.updateSteeringWheel(rigId, delta, feedback);
    this.updateModuleVisuals(rigId, delta, rigState, feedback);
    this.updateStateShell(rigId, delta, rigState, feedback);
    this.applyTransformations(rigId);
  }

  private updateWheelRotation(
    rigId: string,
    delta: number,
    rigState: RigState,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    const radius = this.wheelRadius.get(rigId);
    if (!state || !parts || !radius) return;

    const speed = Math.abs(rigState.speed ?? 0);
    const radVal = radius[0] ?? 0.5;

    if (speed > 0.01) {
      const angularVelocity = speed / radVal;
      state.wheelRotation =
        (state.wheelRotation + angularVelocity * delta) % (Math.PI * 2);

      if (parts.wheels) {
        parts.wheels.forEach((wheelGroup: THREE.Group) => {
          wheelGroup.rotation.x = state.wheelRotation;
        });
      }
    }
  }

  private updateSuspension(
    rigId: string,
    delta: number,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    const trackWidth = this.trackWidth.get(rigId) ?? 2.6;
    if (!state || !parts) return;

    const loadCompression = feedback.driveLoad * 0.07;
    const tractionCompression = feedback.tractionLoss * 0.03;
    const widthFactor = Math.max(0.75, Math.min(1.15, 2.6 / Math.max(1.2, trackWidth)));
    const pitchBias = feedback.bodyPitchOffset * 0.5;
    const rollBias = feedback.bodyRollOffset * 0.5 * widthFactor;

    parts.wheels.forEach((wheelGroup, index) => {
      const damper = state.suspensionCompression[index];
      if (!damper) return;

      const sideBias = index % 2 === 0 ? -rollBias : rollBias;
      const axleBias = index < 2 ? -pitchBias : pitchBias;
      const targetCompression = Math.max(
        0,
        loadCompression + tractionCompression + sideBias + axleBias,
      );
      const compression = damper.update(targetCompression, delta);
      const restY = parts.wheelRestY[index] ?? wheelGroup.position.y;
      wheelGroup.position.y = restY - compression;
    });
  }

  private updateSteering(
    rigId: string,
    delta: number,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts) return;

    state.steeringAngle.update(feedback.steeringAngle, delta);
  }

  private updateBodyMotion(
    rigId: string,
    delta: number,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    const trackWidth = this.trackWidth.get(rigId) ?? 2.6;
    if (!state || !parts) return;

    const widthFactor = Math.max(0.75, Math.min(1.15, 2.6 / Math.max(1.2, trackWidth)));
    state.bodyRoll.update(feedback.bodyRollOffset * widthFactor, delta);
    state.bodyPitch.update(feedback.bodyPitchOffset, delta);
  }

  private updateSteeringWheel(
    rigId: string,
    delta: number,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts) return;

    const targetAngle = feedback.steeringAngle * 2.5;
    const angle = state.steeringWheelAngle.update(targetAngle, delta);

    const steeringWheel = parts.root?.getObjectByName("steeringWheel");
    if (steeringWheel) {
      steeringWheel.rotation.y = angle;
    }
  }

  private updateModuleVisuals(
    rigId: string,
    delta: number,
    rigState: RigState,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts) return;

    state.lugTireVisible = rigState.modules.includes("lug-tires");

    if (parts.moduleVisuals?.["lug-tires"]) {
      const visible = state.lugTireVisible;
      parts.moduleVisuals["lug-tires"].forEach((obj: THREE.Object3D) => {
        obj.visible = visible;
      });
    }

    if (parts.ploughPivot) {
      const isPloughEngaged = rigState.attachments.some(
        (a) => a.id === "field-plough" && a.engaged,
      );
      const targetAngle = isPloughEngaged ? -feedback.driveLoad * 0.12 - 0.2 : 0;
      const currentAngle = state.ploughAngle.update(targetAngle, delta);
      parts.ploughPivot.rotation.x = currentAngle;
    }
  }

  private updateStateShell(
    rigId: string,
    delta: number,
    rigState: RigState,
    feedback: RigFeedbackFrame,
  ): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts || !parts.stateShellMaterial) return;

    state.stateShellPulse += delta;

    const material = parts.stateShellMaterial;
    if (material && material.uniforms) {
      const conditionRatio = (rigState.condition ?? 100) / 100;
      if (material.uniforms.uIntegrity) {
        material.uniforms.uIntegrity.value = conditionRatio;
      }
      if (material.uniforms.uTime) {
        material.uniforms.uTime.value = state.stateShellPulse;
      }
      if (feedback.lastImpact && material.uniforms.uHitTime) {
        material.uniforms.uHitTime.value = performance.now() / 1000;
      }
    }
  }

  private applyTransformations(rigId: string): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts) return;

    // Final presentation commit point for body and steering state.
    if (parts.root) {
      parts.root.rotation.x = state.bodyPitch.value;
      parts.root.rotation.z = state.bodyRoll.value;
    }

    if (parts.steeringPivots) {
      const angle = state.steeringAngle.value;
      parts.steeringPivots.forEach((pivot: THREE.Group, index: number) => {
        if (index < 2) {
          pivot.rotation.y = angle;
        }
      });
    }
  }
}

export const vehicleAnimationSystem = new VehicleAnimationSystem();
