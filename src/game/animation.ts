/**
 * Animation system for vehicle rigs.
 * Integrates with physics feedback system for wheel rotation, suspension, steering, and body animation.
 */

import * as THREE from "three";
import { SpringDamper } from "./feedback";
// import type { RigParts } from "./renderer";

/**
 * Animation state for a single rig.
 * Tracks animation mixers, actions, and procedural animation state.
 */
export interface RigAnimationState {
  // Animation mixer for keyframe animations (if any)
  mixer: THREE.AnimationMixer | null;
  actions: Map<string, THREE.AnimationAction>;
  // Procedural animation state
  wheelRotation: number;
  suspensionCompression: SpringDamper[];
  steeringAngle: SpringDamper;
  bodyRoll: SpringDamper;
  bodyPitch: SpringDamper;
  // Module visual state
  lugTireVisible: boolean;
  ploughAngle: SpringDamper;
  stateShellPulse: number;
  // Steering wheel animation
  steeringWheelAngle: SpringDamper;
}

/**
 * Manages animations for all vehicle rigs.
 * Integrates with physics feedback system for procedural animation.
 */
export class VehicleAnimationSystem {
  private rigAnimations: Map<string, RigAnimationState> = new Map();
  private rigParts: Map<string, any> = new Map();
  private wheelRadius: Map<string, number[]> = new Map();
  private trackWidth: Map<string, number> = new Map();

  constructor() {}

  /**
   * Register a rig for animation.
   */
  registerRig(rigId: string, parts: any, wheelRadius: number[], trackWidth: number): void {
    this.rigParts.set(rigId, parts);
    this.wheelRadius.set(rigId, wheelRadius);
    this.trackWidth.set(rigId, trackWidth);

    // Initialize animation state
    const state: RigAnimationState = {
      mixer: null,
      actions: new Map(),
      wheelRotation: 0,
      suspensionCompression: wheelRadius.map(() => new SpringDamper(120, 12)),
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
  update(delta: number, state: any): void {
    for (const [rigId] of this.rigAnimations) {
      const rigState = state.rigs?.[rigId];
      if (!rigState) continue;

      const parts = this.rigParts.get(rigId);
      if (!parts) continue;

      const feedback = this.computeFeedback(rigState);
      this.updateRigAnimation(rigId, delta, feedback);
    }
  }

  private computeFeedback(rigState: any): any {
    const speedRatio = Math.min(Math.abs(rigState.speed ?? 0) / 10, 1);
    
    return {
      speedRatio,
      tractionLoss: 0,
      driveLoad: 0,
      lateralLoad: 0,
      steeringAngle: rigState.steering ?? 0,
      bodyRollOffset: 0,
      bodyPitchOffset: 0,
      speedFovBoost: 0,
      cameraForwardLook: 0,
      cameraLateralLook: 0,
      motionScale: 1,
      integrityRatio: 1 - (rigState.strain ?? 0) / 100,
      lastImpact: undefined,
    };
  }

  private updateRigAnimation(rigId: string, delta: number, _feedback: any): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    if (!state || !parts) return;

    // Update animation mixer
    if (state.mixer) {
      state.mixer.update(delta);
    }

    // Update wheel rotation based on speed
    this.updateWheelRotation(rigId, delta);

    // Update suspension compression
    this.updateSuspension(rigId);

    // Update steering
    this.updateSteering(rigId);

    // Update body roll/pitch
    this.updateBodyMotion(rigId);

    // Update steering wheel
    this.updateSteeringWheel(rigId);

    // Update module visuals (lug tires, plough)
    this.updateModuleVisuals(rigId);

    // Update state shell pulse
    this.updateStateShell(rigId);

    // Apply transformations to Three.js objects
    this.applyTransformations(rigId);
  }

  private updateWheelRotation(rigId: string, delta: number): void {
    const state = this.rigAnimations.get(rigId);
    const parts = this.rigParts.get(rigId);
    const radius = this.wheelRadius.get(rigId);
    if (!state || !parts || !radius) return;

    // Get speed from rig state
    const rigState = this.rigParts.get(rigId)?.root?.userData?.rigState;
    const speed = Math.abs(rigState?.speed ?? 0);
    const wheelRadius = radius[0] || 0.5;
    
    if (speed > 0.01) {
      // Angular velocity = speed / radius
      const angularVelocity = speed / wheelRadius;
      state.wheelRotation += angularVelocity * delta;
      
      // Apply to wheel meshes
      if (parts.wheels) {
        parts.wheels.forEach((wheelGroup: THREE.Group) => {
            wheelGroup.rotation.x = state.wheelRotation;
          });
      }
    }
  }

  private updateSuspension(_rigId: string): void {
    // Suspension compression based on terrain and load
  }

  private updateSteering(_rigId: string): void {
    // Steering wheel animation
  }

  private updateBodyMotion(_rigId: string): void {
    // Body roll/pitch based on lateral/longitudinal acceleration
  }

  private updateSteeringWheel(_rigId: string): void {
    // Steering wheel rotation animation
  }

  private updateModuleVisuals(_rigId: string): void {
    // Lug tires, plough, etc.
  }

  private updateStateShell(_rigId: string): void {
    // State shell pulse animation
  }

  private applyTransformations(_rigId: string): void {
    // Apply all transformations to Three.js objects
  }
}

// Export singleton
export const vehicleAnimationSystem = new VehicleAnimationSystem();