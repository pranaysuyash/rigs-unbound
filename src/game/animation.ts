/**
 * Rig-local presentation owner for Rigs Unbound.
 *
 * This module owns the mapping from **authoritative simulation state** to the
 * rig's scene-graph transforms: wheel spin, suspension travel, steering, body
 * attitude, module visibility, plough articulation, the cockpit steering
 * control, and the state-shell uniforms.
 *
 * ## Why it consumes rather than derives
 *
 * An earlier revision of this module integrated its own `wheelRotation` from
 * speed x delta and invented suspension compression from drive load using
 * spring dampers. Both of those values are already owned by the fixed-step
 * kernel: `wheelRotation` is integrated in `physics.ts`, persisted in the save,
 * validated on load, and emitted in `publicState`. Re-deriving them here would
 * have created a second, frame-rate-dependent truth source for a replay-
 * validated value, and the presentation would have drifted from the save.
 *
 * The rule this module follows: **the kernel owns physical truth; this module
 * owns how that truth is shown.** Anything that must survive a reload or a
 * replay is read, never recomputed.
 *
 * See ADR-0034, which supersedes ADR-0031.
 */

import * as THREE from "three";
import type { RigFeedbackFrame } from "./feedback";
import type { ModuleId, RigId, RigState } from "./contracts";
import type { RigParts } from "./renderer";

/** Plough articulation targets, in radians. */
const PLOUGH_ENGAGED_ANGLE = 0.3;
const PLOUGH_STOWED_ANGLE = -0.22;
/** Exponential approach rate for the plough, per second. */
const PLOUGH_APPROACH_RATE = 8;

/**
 * Steering-wheel travel relative to the road-wheel angle. Real vehicles turn
 * the hand control much further than the steered wheels; without this the
 * cockpit control reads as broken at normal steering angles.
 */
const STEERING_CONTROL_RATIO = 2.5;

/** Resting suspension compression. Above it the wheel rides up into the arch. */
const SUSPENSION_REST_COMPRESSION = 0.5;
const SUSPENSION_VISUAL_TRAVEL = 0.6;

/** Shell-impact fallback point, used when an outcome has no local hit coordinate. */
const DEFAULT_IMPACT_POINT = { x: 0, y: 0.6, z: 0, intensity: 1 } as const;

/**
 * Clip actions bound from an imported rig's authored animations, keyed by clip
 * name. `null` means this rig is procedural only — it has no authored clips.
 */
export type ClipActionBindings = ReadonlyMap<
  string,
  THREE.AnimationAction
> | null;

/**
 * One frame of authoritative input for a single rig.
 *
 * The caller supplies simulation state and the already-computed feedback frame
 * so that feedback is derived exactly once per rig per frame, and so this
 * module never becomes a second place that decides what the rig is doing.
 */
export interface RigPresentationFrame {
  rigState: RigState;
  feedback: RigFeedbackFrame;
  /**
   * True when a condition drop must pulse the state shell even though no
   * collision supplied a contact point.
   */
  conditionImpact: boolean;
}

/** Per-rig presentation state that is genuinely presentation-local. */
export interface RigAnimationState {
  /**
   * Smoothed plough angle. This is presentation-only: the kernel owns whether
   * the plough is engaged, this owns how quickly it visibly swings.
   */
  ploughAngle: number;
  /** Cached cockpit control, resolved once at registration rather than per frame. */
  steeringControl: THREE.Object3D | null;
}

/**
 * A scene object that carries authored animation clips.
 *
 * Clip ownership is deliberately separate from rig ownership. A rig may one day
 * have a clip-backed body, but the first real producer of authored clips in this
 * project is the imported-asset path: a GLB world prop can ship its own
 * animations, and without a mixer nothing would ever advance them.
 */
interface ClipOwnerState {
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
}

/** Read-only view of a clip owner's bindings, for evidence and acceptance. */
export interface ClipEvidence {
  ownerId: string;
  clipNames: string[];
  playing: string[];
}

export class VehicleAnimationSystem {
  private readonly rigAnimations = new Map<string, RigAnimationState>();
  private readonly rigParts = new Map<string, RigParts>();
  private readonly clipOwners = new Map<string, ClipOwnerState>();

  /**
   * Register a rig's presentation parts.
   *
   * The cockpit steering control is resolved here, once, instead of by a
   * `getObjectByName` traversal on every frame.
   */
  registerRig(rigId: string, parts: RigParts): void {
    this.rigParts.set(rigId, parts);
    this.rigAnimations.set(rigId, {
      ploughAngle: PLOUGH_STOWED_ANGLE,
      steeringControl: parts.root.getObjectByName("steeringWheel") ?? null,
    });
  }

  /**
   * Bind authored animation clips for any scene object.
   *
   * `GLTFLoader` returns `gltf.animations`, and until now nothing advanced
   * them: an imported asset that shipped a spinning fan or a pumping jack sat
   * frozen in the world. Binding here gives those clips a mixer that the frame
   * loop actually ticks.
   *
   * Returns the number of clips bound, so callers record real evidence instead
   * of assuming the binding worked.
   */
  registerClips(
    ownerId: string,
    root: THREE.Object3D,
    clips: readonly THREE.AnimationClip[],
  ): number {
    if (clips.length === 0) return 0;

    const existing = this.clipOwners.get(ownerId);
    const owner: ClipOwnerState = existing ?? {
      mixer: new THREE.AnimationMixer(root),
      actions: new Map(),
    };
    for (const clip of clips) {
      owner.actions.set(clip.name, owner.mixer.clipAction(clip, root));
    }

    this.clipOwners.set(ownerId, owner);
    return clips.length;
  }

  /** Play a bound clip. Returns false when the owner has no such clip. */
  playClip(ownerId: string, clipName: string, loop = true): boolean {
    const action = this.clipOwners.get(ownerId)?.actions.get(clipName);
    if (!action) return false;
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !loop;
    action.play();
    return true;
  }

  /** Play every clip an owner has bound. Returns how many started. */
  playAllClips(ownerId: string, loop = true): number {
    const owner = this.clipOwners.get(ownerId);
    if (!owner) return 0;
    let started = 0;
    for (const name of owner.actions.keys()) {
      if (this.playClip(ownerId, name, loop)) started += 1;
    }
    return started;
  }

  /** Stop a bound clip. Returns false when the owner has no such clip. */
  stopClip(ownerId: string, clipName: string): boolean {
    const action = this.clipOwners.get(ownerId)?.actions.get(clipName);
    if (!action) return false;
    action.stop();
    return true;
  }

  /** Operator-facing clip evidence; never consumed by gameplay. */
  clipEvidence(ownerId: string): ClipEvidence | null {
    const owner = this.clipOwners.get(ownerId);
    if (!owner) return null;
    const entries = [...owner.actions];
    return {
      ownerId,
      clipNames: entries.map(([name]) => name),
      playing: entries
        .filter(([, action]) => action.isRunning())
        .map(([name]) => name),
    };
  }

  /**
   * Apply one presentation frame for every registered rig.
   *
   * `timeSeconds` is the renderer's shared frame clock, so the shell shader and
   * every other time-driven channel read one clock rather than each keeping
   * their own accumulator.
   */
  update(
    delta: number,
    timeSeconds: number,
    frames: ReadonlyMap<RigId, RigPresentationFrame>,
  ): void {
    for (const owner of this.clipOwners.values()) {
      owner.mixer.update(delta);
    }

    for (const [rigId, state] of this.rigAnimations) {
      const frame = frames.get(rigId as RigId);
      const parts = this.rigParts.get(rigId);
      if (!frame || !parts) continue;

      this.applyBodyTransform(parts, frame);
      this.applyModuleVisuals(parts, frame.rigState);
      this.applyStateShell(parts, frame, timeSeconds);
      this.applyWheels(parts, frame);
      this.applySteeringControl(state, frame);
      this.applyPlough(state, parts, frame, delta);
    }
  }

  /**
   * Body attitude is simulation truth (`heading`, `pitch`, `roll`) plus a
   * presentation-only lean offset. Dropping the simulation half would leave the
   * rig visually flat on sloped terrain.
   */
  private applyBodyTransform(
    parts: RigParts,
    { rigState, feedback }: RigPresentationFrame,
  ): void {
    parts.root.position.set(rigState.x, rigState.y, rigState.z);
    parts.root.rotation.y = rigState.heading;
    // Positive pitch is nose-up; a Y-then-X rotation drops +Z for positive X,
    // so the sign is inverted here.
    parts.root.rotation.x = -rigState.pitch + feedback.bodyPitchOffset;
    parts.root.rotation.z = rigState.roll + feedback.bodyRollOffset;
  }

  private applyModuleVisuals(parts: RigParts, rigState: RigState): void {
    for (const [moduleId, visuals] of Object.entries(parts.moduleVisuals)) {
      const visible = rigState.modules.includes(moduleId as ModuleId);
      for (const visual of visuals ?? []) visual.visible = visible;
    }
  }

  private applyStateShell(
    parts: RigParts,
    { feedback, conditionImpact }: RigPresentationFrame,
    timeSeconds: number,
  ): void {
    const uniforms = parts.stateShellMaterial?.uniforms;
    if (!uniforms) return;

    if (uniforms["uTime"]) uniforms["uTime"].value = timeSeconds;
    if (uniforms["uIntegrity"])
      uniforms["uIntegrity"].value = feedback.integrityRatio;

    const impact = feedback.lastImpact;
    if (
      (impact || conditionImpact) &&
      uniforms["uHitPoint"] &&
      uniforms["uHitTime"]
    ) {
      // Collision outcomes identify severity but not always a stable local hit
      // coordinate; the shell centre carries that damage pulse instead.
      const point = impact ?? DEFAULT_IMPACT_POINT;
      (uniforms["uHitPoint"].value as THREE.Vector3).set(
        point.x,
        point.y,
        point.z,
      );
      uniforms["uHitTime"].value = timeSeconds;
    }
  }

  /**
   * Wheel spin and suspension travel are both read from kernel mobility state.
   * Hover rigs carry no wheel array and are skipped.
   *
   * The kernel integrates one reference rotation for the whole rig,
   * `distance / profile.wheelRadius`, because it models a single mean rolling
   * radius. A rig whose axles differ — a tractor's drive wheels dwarf its
   * steering wheels — needs each wheel scaled to its own radius, or the larger
   * pair visibly skids. `parts.wheelSpinScale` carries that per-wheel factor,
   * derived in `rig-blockout.ts` from the radius actually drawn.
   */
  private applyWheels(
    parts: RigParts,
    { rigState, feedback }: RigPresentationFrame,
  ): void {
    if (rigState.mobility.kind !== "ground") return;

    for (let index = 0; index < parts.wheels.length; index += 1) {
      const wheel = parts.wheels[index];
      const steeringPivot = parts.steeringPivots[index];
      const rest = parts.wheelRestY[index];
      if (!wheel || !steeringPivot || rest === undefined) continue;

      // Absent a declared scale, fall back to the reference rate rather than
      // freezing the wheel: a missing entry is a rig-authoring gap, and a
      // stationary wheel on a moving rig reads as a worse bug than a fast one.
      const spinScale = parts.wheelSpinScale[index] ?? 1;
      wheel.rotation.x = rigState.mobility.wheelRotation * spinScale;
      steeringPivot.rotation.y = index < 2 ? feedback.steeringAngle : 0;

      const wheelState = rigState.mobility.wheels[index];
      if (wheelState) {
        const travel =
          (wheelState.compression - SUSPENSION_REST_COMPRESSION) * 2 * 0.5;
        steeringPivot.position.y = rest + travel * SUSPENSION_VISUAL_TRAVEL;
      }
    }
  }

  /**
   * Turn the cockpit steering control, when the rig authors one.
   *
   * The control spins about local Z because its rim geometry lies in the XY
   * plane; the rake of the column lives on the parent group, so this channel
   * stays a single-axis rotation regardless of how the rig is posed.
   *
   * A rig without a named `steeringWheel` object simply has no cockpit control;
   * that is a rig-identity statement, not a missing feature.
   */
  private applySteeringControl(
    state: RigAnimationState,
    { feedback }: RigPresentationFrame,
  ): void {
    if (!state.steeringControl) return;
    state.steeringControl.rotation.z =
      -feedback.steeringAngle * STEERING_CONTROL_RATIO;
  }

  private applyPlough(
    state: RigAnimationState,
    parts: RigParts,
    { rigState }: RigPresentationFrame,
    delta: number,
  ): void {
    if (!parts.ploughPivot) return;

    const engaged = rigState.attachments.some(
      (attachment) => attachment.id === "field-plough" && attachment.engaged,
    );
    state.ploughAngle = THREE.MathUtils.lerp(
      state.ploughAngle,
      engaged ? PLOUGH_ENGAGED_ANGLE : PLOUGH_STOWED_ANGLE,
      1 - Math.exp(-PLOUGH_APPROACH_RATE * delta),
    );
    parts.ploughPivot.rotation.x = state.ploughAngle;
  }

  /** Release every registration; used when the renderer disposes its scene. */
  dispose(): void {
    for (const owner of this.clipOwners.values()) {
      owner.mixer.stopAllAction();
    }
    this.clipOwners.clear();
    this.rigAnimations.clear();
    this.rigParts.clear();
  }
}

export const vehicleAnimationSystem = new VehicleAnimationSystem();
