import * as THREE from "three";
import type { CameraMode, GameState, RigId } from "../contracts";
import { effectiveProfile } from "../contracts";
import type { GameWorld } from "../gameworld";
import { chaseViewportPolicy, RIG_HOOD_CAMERA_MOUNTS } from "../camera";
import { deriveRigFeedback } from "../feedback";
import type { CameraObstructionHit } from "../scene-query";
import type { RigParts } from "./vehicle-visual";

export interface CameraResolutionEvidence {
  rigId: RigId;
  mode: CameraMode;
  obstructionSource: CameraObstructionHit["source"] | null;
  obstructionId: string | null;
  idealDistance: number;
  resolvedDistance: number;
  minimumReadableDistance: number;
  /**
   * True when the final camera is clear of world/rig geometry and preserves the
   * viewport-specific minimum composition distance.
   */
  readableComposition: boolean;
  /** Signed camera displacement along rig-forward; negative means behind. */
  forwardOffset: number;
  /** True when the resolved camera remains on the rear side of the rig. */
  behindRig: boolean;
  pathClear: boolean;
  selfIntersecting: boolean;
  selfIntersectionPart: string | null;
}

/** Renderer-owned services the camera director needs per frame. */
export interface CameraDirectorDeps {
  readonly world: GameWorld;
  readonly camera: THREE.PerspectiveCamera;
  readonly rigs: Map<RigId, RigParts>;
  reducedMotion: () => boolean;
  syncSky: (position: THREE.Vector3) => void;
  labelPart: (object: THREE.Object3D) => string;
}

/**
 * Owns the cinematic camera: mode policies, terrain-obstruction pull-in,
 * emergency reframe, impact shake, narrative focus FOV, and the resolution
 * evidence contract. Extracted from GameRenderer (ADR-0054 unit 5, last).
 */
export class CameraDirector {
  private narrativeFocus = 0;
  private narrativeFocusTarget = 0;
  private cameraInitialised = false;
  private cameraRigId: RigId | null = null;
  private lastCameraMode: CameraMode | null = null;
  private lastCameraFocus: THREE.Vector3 | null = null;
  private lastCameraFocusY: number | null = null;
  private cameraResolution: CameraResolutionEvidence | null = null;
  private shake = 0;

  constructor(private readonly deps: CameraDirectorDeps) {}

  isInitialised(): boolean {
    return this.cameraInitialised;
  }

  lastFocusHeight(): number | null {
    return this.lastCameraFocusY;
  }


  /**
   * Position the camera, keeping the rig visible.
   *
   * Includes the terrain-occlusion pull-in that `DESIGN.md` records as an
   * unimplemented gap: the ideal camera position is raymarched against the height
   * field and pulled toward the rig if a hill is in the way. Without this the
   * player's own machine disappears behind terrain, which is exactly what the
   * accepted Rig Lab 01 screenshot shows happening behind a tree.
   */
  update(
    state: GameState,
    delta: number,
    profile: ReturnType<typeof effectiveProfile>,
  ): void {
    const rig = state.rigs[state.activeRigId];
    const parts = this.deps.rigs.get(rig.id);
    if (!parts) {
      throw new Error(`Missing rendered rig for camera: ${rig.id}`);
    }
    parts.root.updateWorldMatrix(true, true);
    const feedback = deriveRigFeedback(
      rig,
      profile,
      this.deps.reducedMotion(),
    );
    const chasePolicy = chaseViewportPolicy(
      this.deps.camera.aspect,
      profile.camera.chaseDistance,
      profile.track,
    );
    const narrow = chasePolicy.narrow;
    const forward = new THREE.Vector3(
      Math.sin(rig.heading),
      0,
      Math.cos(rig.heading),
    );
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    const focus = new THREE.Vector3(
      rig.x,
      rig.y +
        (state.cameraMode === "chase" ||
        state.cameraMode === "hood" ||
        state.cameraMode === "side"
          ? profile.camera.focusHeight
          : 0.8),
      rig.z,
    );
    this.lastCameraFocusY = focus.y;

    let desired: THREE.Vector3;
    let target: THREE.Vector3;

    if (state.cameraMode === "chase") {
      // Portrait has far less horizontal field of view. Pulling back 2.5× keeps
      // broad machines (and future articulated silhouettes) inside the safe
      // column between the field kit and touch controls. The policy remains
      // profile-scaled rather than branching on a rig id.
      const distance = profile.camera.chaseDistance * chasePolicy.distanceScale;
      const height = profile.camera.chaseHeight * chasePolicy.heightScale;
      const side = profile.camera.chaseSide * chasePolicy.sideScale;
      desired = new THREE.Vector3(rig.x, rig.y + height, rig.z)
        .addScaledVector(forward, -distance)
        .add(
          new THREE.Vector3(side, 0, 0).applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            rig.heading,
          ),
        );
      target = focus
        .clone()
        .addScaledVector(forward, 4 + feedback.cameraForwardLook)
        .addScaledVector(right, feedback.cameraLateralLook);
      target.y -= chasePolicy.targetDrop;
    } else if (state.cameraMode === "hood") {
      // The silhouette owns a named socket. A shared focus-relative offset put
      // Torque's camera inside its hood and could never describe the much lower
      // buggy or forward-cab skimmer honestly.
      const mount = RIG_HOOD_CAMERA_MOUNTS[rig.id];
      desired = parts.hoodCameraSocket.getWorldPosition(new THREE.Vector3());
      target = desired.clone().addScaledVector(forward, mount.lookDistance);
      target.y -= mount.lookDrop;
    } else if (state.cameraMode === "side") {
      // A readable inspection/action view that exposes suspension, attachments,
      // and towing without encoding any particular vehicle class.
      desired = focus
        .clone()
        .addScaledVector(right, narrow ? 13 : 11)
        .addScaledVector(forward, -2)
        .add(new THREE.Vector3(0, narrow ? 5.8 : 4.8, 0));
      target = focus.clone().addScaledVector(forward, 2.5);
    } else if (state.cameraMode === "tactical") {
      desired = new THREE.Vector3(
        rig.x,
        rig.y + (narrow ? 34 : 27),
        rig.z,
      ).addScaledVector(forward, -3);
      target = focus;
    } else if (state.cameraMode === "top-down") {
      // Top-down framing with 75° near-orthographic tilt angle and predictive target lead
      const leadScale = Math.min(rig.speed * 0.75, 12);
      const leadX = Math.sin(rig.heading) * leadScale;
      const leadZ = Math.cos(rig.heading) * leadScale;

      desired = new THREE.Vector3(
        rig.x + leadX,
        rig.y + (narrow ? 46 : 36),
        rig.z + leadZ + 5, // Tilted high-angle framing
      );
      target = new THREE.Vector3(rig.x + leadX, rig.y + 0.5, rig.z + leadZ);
    } else {
      // Survey: a high, pulled-back vantage for reading the land and planning a
      // route. Distinct from tactical, which stays close for manoeuvring.
      desired = new THREE.Vector3(
        rig.x,
        rig.y + (narrow ? 78 : 64),
        rig.z,
      ).addScaledVector(forward, -46);
      target = focus;
    }

    const idealDesired = desired.clone();
    const fullSceneQuery =
      state.cameraMode === "chase" || state.cameraMode === "side";
    let obstruction: CameraObstructionHit | null = null;
    let finalPathHit: CameraObstructionHit | null = null;

    if (state.cameraMode !== "hood") {
      const queryOptions = {
        includeObstacles: fullSceneQuery,
        includeStructures: fullSceneQuery,
      };
      const queryCandidate = (candidate: THREE.Vector3) =>
        this.deps.world.cameraObstruction(focus, candidate, 0.45, queryOptions);
      const pullBeforeHit = (
        candidate: THREE.Vector3,
        hit: CameraObstructionHit,
      ) => {
        const length = Math.max(0.001, focus.distanceTo(candidate));
        return focus
          .clone()
          .lerp(candidate, Math.max(0, hit.fraction - 0.55 / length));
      };

      obstruction = queryCandidate(desired);
      if (obstruction) {
        desired = pullBeforeHit(desired, obstruction);
        const minimumResolvedDistance =
          state.cameraMode === "chase"
            ? chasePolicy.minimumReadableDistance
            : 2.8;
        if (focus.distanceTo(desired) < minimumResolvedDistance) {
          // When the rig starts almost against a wall there is no usable boom
          // between focus and obstruction. Choose a deterministic shoulder/high
          // fallback rather than placing the near plane inside the rig.
          const sideDistance = Math.max(5, profile.track * 2);
          const wideSideDistance = Math.max(9, profile.track * 3.4);
          const fallbackCandidates = [
            focus
              .clone()
              .addScaledVector(right, wideSideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 5.2, 0)),
            focus
              .clone()
              .addScaledVector(right, -wideSideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 5.2, 0)),
            focus
              .clone()
              .addScaledVector(right, sideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 3.2, 0)),
            focus
              .clone()
              .addScaledVector(right, -sideDistance)
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 3.2, 0)),
            focus
              .clone()
              .addScaledVector(forward, -1.5)
              .add(new THREE.Vector3(0, 6.5, 0)),
          ];
          for (const candidate of fallbackCandidates) {
            candidate.y = Math.max(
              candidate.y,
              this.deps.world.terrain.height(candidate.x, candidate.z) + 2.4,
            );
            if (!queryCandidate(candidate)) {
              desired = candidate;
              break;
            }
          }
        }
      }

      // Also lift clear of the ground so a pulled-in camera does not end up
      // inside the same hill it was avoiding.
      desired.y = Math.max(
        desired.y,
        this.deps.world.terrain.height(desired.x, desired.z) +
          (obstruction ? 2.4 : 2),
      );
    }

    const cameraModeChanged =
      this.lastCameraMode !== null && this.lastCameraMode !== state.cameraMode;
    const focusTeleported =
      this.lastCameraFocus !== null &&
      this.lastCameraFocus.distanceTo(focus) > 8;
    const cameraDiscontinuity =
      this.cameraRigId !== rig.id ||
      cameraModeChanged ||
      focusTeleported ||
      this.deps.camera.position.distanceTo(desired) > 70;
    const desiredDistance = focus.distanceTo(desired);
    const currentDistance = focus.distanceTo(this.deps.camera.position);
    const needsImmediatePullIn =
      obstruction !== null && currentDistance > desiredDistance + 0.08;
    if (
      !this.cameraInitialised ||
      cameraDiscontinuity ||
      needsImmediatePullIn
    ) {
      this.deps.camera.position.copy(desired);
      this.cameraInitialised = true;
    } else {
      const blend =
        state.cameraMode === "chase"
          ? 1 - Math.exp(-6 * delta)
          : 1 - Math.exp(-3.5 * delta);
      this.deps.camera.position.lerp(desired, blend);
    }

    // A smoothed camera can still sweep through a nearer prop even when its
    // endpoint is valid. Re-query the actual candidate and pull inward
    // immediately; outward recovery remains smoothed above.
    if (state.cameraMode !== "hood") {
      const smoothedHit = this.deps.world.cameraObstruction(
        focus,
        this.deps.camera.position,
        0.45,
        {
          includeObstacles: fullSceneQuery,
          includeStructures: fullSceneQuery,
        },
      );
      if (smoothedHit) {
        const length = Math.max(0.001, focus.distanceTo(this.deps.camera.position));
        const safeFraction = Math.max(0, smoothedHit.fraction - 0.55 / length);
        this.deps.camera.position.lerpVectors(
          focus,
          this.deps.camera.position,
          safeFraction,
        );
        obstruction = obstruction ?? smoothedHit;
      }

      // Endpoint and boom checks can both be valid while an obstruction leaves
      // too little room for the rig itself. Enforce the final composition
      // invariant at the boundary that actually renders: select a clear,
      // elevated rear shoulder rather than accepting a camera inside the cab.
      const minimumRigClearance =
        state.cameraMode === "chase"
          ? Math.max(
              3.2,
              profile.track * 1.35,
              chasePolicy.minimumReadableDistance,
            )
          : Math.max(3.2, profile.track * 1.35);
      if (focus.distanceTo(this.deps.camera.position) < minimumRigClearance) {
        const emergencySide = narrow
          ? Math.max(10, profile.track * 3.6)
          : Math.max(6, profile.track * 2.5);
        const emergencyBack = narrow ? -4 : -0.5;
        const emergencyHeight = narrow ? 11 : 12;
        const emergencyCandidates = [
          focus
            .clone()
            .addScaledVector(right, emergencySide)
            .addScaledVector(forward, emergencyBack)
            .add(new THREE.Vector3(0, emergencyHeight, 0)),
          focus
            .clone()
            .addScaledVector(right, -emergencySide)
            .addScaledVector(forward, emergencyBack)
            .add(new THREE.Vector3(0, emergencyHeight, 0)),
          focus
            .clone()
            .addScaledVector(forward, narrow ? -9 : -4)
            .add(new THREE.Vector3(0, narrow ? 16 : 14, 0)),
        ];
        for (const candidate of emergencyCandidates) {
          candidate.y = Math.max(
            candidate.y,
            this.deps.world.terrain.height(candidate.x, candidate.z) + 3,
          );
          const candidateHit = this.deps.world.cameraObstruction(
            focus,
            candidate,
            0.45,
            {
              includeObstacles: fullSceneQuery,
              includeStructures: fullSceneQuery,
            },
          );
          if (!candidateHit) {
            this.deps.camera.position.copy(candidate);
            break;
          }
        }
      }

      finalPathHit = this.deps.world.cameraObstruction(
        focus,
        this.deps.camera.position,
        0.45,
        {
          includeObstacles: fullSceneQuery,
          includeStructures: fullSceneQuery,
        },
      );
    }
    this.cameraRigId = rig.id;
    this.lastCameraMode = state.cameraMode;
    this.lastCameraFocus = focus.clone();

    if (this.shake > 0.001) {
      this.shake = Math.max(0, this.shake - delta * 2.6);
      const magnitude = this.shake * 0.42;
      const phase = performance.now() * 0.045;
      this.deps.camera.position.x += Math.sin(phase) * magnitude;
      this.deps.camera.position.y += Math.sin(phase * 1.7) * magnitude * 0.7;
    }

    // Speed opens the field of view slightly; reduced-motion removes the
    // presentation-only expansion while retaining the chosen camera policy.
    const baseFov =
      state.cameraMode === "chase"
        ? 52 + feedback.speedFovBoost
        : state.cameraMode === "hood"
          ? 64 + feedback.speedFovBoost * 0.625
          : state.cameraMode === "side"
            ? 48
            : state.cameraMode === "top-down"
              ? 46
              : 52;
    this.narrativeFocus +=
      (this.narrativeFocusTarget - this.narrativeFocus) *
      (1 - Math.exp(-3 * delta));
    const targetFov = baseFov - this.narrativeFocus * 5;
    if (Math.abs(this.deps.camera.fov - targetFov) > 0.05) {
      this.deps.camera.fov +=
        (targetFov - this.deps.camera.fov) * (1 - Math.exp(-4 * delta));
      this.deps.camera.updateProjectionMatrix();
    }

    if (state.cameraMode === "top-down") {
      this.deps.camera.up.copy(forward);
    } else {
      this.deps.camera.up.set(0, 1, 0);
    }
    this.deps.camera.lookAt(target);
    this.deps.syncSky(this.deps.camera.position);

    const selfIntersectionPart = this.rigIntersectionPart(
      parts,
      this.deps.camera.position,
    );
    const cameraForwardOffset = this.deps.camera.position
      .clone()
      .sub(focus)
      .dot(forward);
    const resolvedDistance = Number(
      focus.distanceTo(this.deps.camera.position).toFixed(3),
    );
    const minimumReadableDistance =
      state.cameraMode === "chase"
        ? Number(chasePolicy.minimumReadableDistance.toFixed(3))
        : 0;
    this.cameraResolution = {
      rigId: rig.id,
      mode: state.cameraMode,
      obstructionSource: obstruction?.source ?? null,
      obstructionId: obstruction?.id ?? null,
      idealDistance: Number(focus.distanceTo(idealDesired).toFixed(3)),
      resolvedDistance,
      minimumReadableDistance,
      readableComposition:
        finalPathHit === null &&
        selfIntersectionPart === null &&
        resolvedDistance + 0.01 >= minimumReadableDistance,
      forwardOffset: Number(cameraForwardOffset.toFixed(3)),
      behindRig: cameraForwardOffset < -0.05,
      pathClear: finalPathHit === null,
      selfIntersecting: selfIntersectionPart !== null,
      selfIntersectionPart,
    };
  }

  rigIntersectionPart(
    parts: RigParts,
    worldPoint: THREE.Vector3,
  ): string | null {
    let intersectionPart: string | null = null;
    parts.root.traverse((object) => {
      if (
        intersectionPart ||
        !(object instanceof THREE.Mesh) ||
        !object.visible ||
        object.userData.cameraSolid === false
      ) {
        return;
      }
      const geometry = object.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      if (!geometry.boundingBox) return;
      const localPoint = object.worldToLocal(worldPoint.clone());
      if (
        geometry.boundingBox
          .clone()
          // The camera point can be outside a mesh while the 0.25 m near plane
          // still slices it into a screen-filling black polygon. Reserve a
          // little more than the near distance as the usable-view contract.
          .expandByScalar(0.35)
          .containsPoint(localPoint)
      ) {
        intersectionPart = this.deps.labelPart(object);
      }
    });
    return intersectionPart;
  }


  /**
   * Mark whether a dialogue beat is on screen. The camera eases toward a
   * narrower field of view while active and releases it on close; this is
   * the "camera reframes for a character moment" cue the mechanical
   * shake/flare/toast feedback deliberately does not use.
   */
  setNarrativeFocus(active: boolean): void {
    this.narrativeFocusTarget = active ? 1 : 0;
  }


  /** Register an impact so the camera can react to it. */
  addShake(amount: number): void {
    if (this.deps.reducedMotion()) return;
    this.shake = Math.min(1.2, this.shake + amount);
  }

  cameraEvidence(): CameraResolutionEvidence {
    if (!this.cameraResolution) {
      throw new Error(
        "Camera evidence is unavailable before the first render.",
      );
    }
    return { ...this.cameraResolution };
  }
}
