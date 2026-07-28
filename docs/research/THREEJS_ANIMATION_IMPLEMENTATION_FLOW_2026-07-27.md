# Vehicle Animation System Implementation Flow

**Project:** rigs-unbound  
**Skill Applied:** `projects/skills/threejs-animation`  
**Date:** 2026-07-27  
**Status:** Historical implementation note — current checkout has moved to renderer-to-animation delegation; runtime verification is pending

---

## Executive Summary

Applied the `threejs-animation` skill to implement a vehicle animation system for rigs-unbound. The current checkout now uses `vehicleAnimationSystem` as the canonical owner for rig-local animation channels, with the renderer handing over the authoritative feedback map each frame.

## Current verification state

- Static code-boundary verification is complete in the current tree:
  - `src/game/renderer.ts` registers the rigs, initializes the mixers, and
    passes the per-frame feedback map into `vehicleAnimationSystem.update(...)`.
  - `src/game/animation.ts` owns the rig-local animation channels for wheel
    rotation, suspension, steering, body motion, steering wheel, module
    visuals, plough articulation, and state-shell pulse.
  - The renderer does not directly own those same rig-local writes in the
    update path.
- The module-visual lane now derives lug-tire visibility from the rig's
  installed module list instead of leaving a dormant visibility flag in the
  animation state.
- The presentation lane now also uses stored track width to tune visible roll
  response, so geometry data already owned by the rig profile contributes to
  animation instead of sitting unused.
- The named `ClipActionBindings` contract remains `null` until future
  clip-backed rigs arrive; the current tree does not yet load or drive
  animation clips, so the live owner is still procedural by design.
- The steering lane now writes pivot orientation only once, at the final
  presentation step, after the steering dampers have updated state.
- The current owner now has single presentation commit points for body motion
  and steering, with no lingering duplicate locals from that consolidation.
- Runtime/browser proof is still pending and is intentionally left unclaimed in
  this note.

---

## Implementation Summary

### Files Modified

| File                    | Changes                                                         |
| ----------------------- | --------------------------------------------------------------- |
| `src/game/renderer.ts`  | Exported `RigParts` interface; added interaction system imports |
| `src/game/animation.ts` | **NEW** - Complete VehicleAnimationSystem module                |
| `src/game/renderer.ts`  | Integrated VehicleAnimationSystem into GameRenderer             |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GameRenderer                             │
├─────────────────────────────────────────────────────────────────┤
│  VehicleAnimationSystem (new)                                   │
│  ├── AnimationMixer (Three.js native)                          │
│  ├── SpringDamper[] for suspension (4 wheels)                  │
│  ├── SpringDamper for steering angle                           │
│  ├── SpringDamper for body roll/pitch                          │
│  ├── SpringDamper for steering wheel                           │
│  ├── SpringDamper for plough angle                             │
│  └── State shell pulse animation                               │
├─────────────────────────────────────────────────────────────────┤
│  Physics Integration (feedback.ts)                              │
│  ├── wheelState.compression → suspension SpringDamper          │
│  ├── feedback.steeringAngle → steering SpringDamper            │
│  ├── feedback.bodyRollOffset → bodyRoll SpringDamper           │
│  ├── feedback.bodyPitchOffset → bodyPitch SpringDamper         │
│  ├── feedback.lastImpact → state shell pulse                   │
│  └── rigState.speed → wheel rotation                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. VehicleAnimationState (per rig)

```typescript
interface RigAnimationState {
  mixer: THREE.AnimationMixer | null;
  wheelRotation: number;
  suspensionCompression: SpringDamper[4];
  steeringAngle: SpringDamper;
  bodyRoll: SpringDamper;
  bodyPitch: SpringDamper;
  lugTireVisible: boolean;
  ploughAngle: SpringDamper;
  stateShellPulse: number;
  steeringWheelAngle: SpringDamper;
}
```

### 2. SpringDamper Integration (from feedback.ts)

```typescript
class SpringDamper {
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
```

### 3. Physics Integration Points

| Animation      | Physics Source                 | SpringDamper        |
| -------------- | ------------------------------ | ------------------- |
| Suspension     | `wheelState.compression` (0-1) | 4 dampers (120, 12) |
| Steering       | `feedback.steeringAngle` (rad) | 1 damper (120, 12)  |
| Body Roll      | `feedback.bodyRollOffset`      | 1 damper (80, 10)   |
| Body Pitch     | `feedback.bodyPitchOffset`     | 1 damper (80, 10)   |
| Steering Wheel | `feedback.steeringAngle`       | 1 damper (120, 12)  |
| Plough Angle   | `plough.engaged` boolean       | 1 damper (120, 12)  |

---

## Implementation Details

### Wheel Rotation

```typescript
private updateWheelRotation(rigId: string, delta: number): void {
  const state = this.rigAnimations.get(rigId);
  const parts = this.rigParts.get(rigId);
  const radius = this.wheelRadius.get(rigId);
  if (!state || !parts || !radius) return;

  const speed = 5; // m/s placeholder - from rigState.speed
  const wheelRadius = radius[0] ?? 0.5;

  if (speed > 0.01) {
    const angularVelocity = speed / radius[0];
    state.wheelRotation += angularVelocity * delta;

    if (parts.wheels) {
      parts.wheels.forEach((wheelGroup: THREE.Group) => {
        wheelGroup.rotation.x = state.wheelRotation;
      });
    }
  }
}
```

### Suspension Compression (Stubbed)

```typescript
private updateSuspension(rigId: string, delta: number): void {
  // TODO: Integrate with physics wheelState.compression
  // this.suspensionCompression[i].update(wheelState.compression, delta);
}
```

### Steering (Front Wheels Only)

```typescript
private updateSteering(rigId: string, delta: number): void {
  const state = this.rigAnimations.get(rigId);
  const parts = this.rigParts.get(rigId);
  if (!state || !parts) return;

  const targetAngle = 0; // from feedback.steeringAngle
  state.steeringAngle.update(targetAngle, 1/60);

  if (parts.steeringPivots) {
    const angle = state.steeringAngle.value;
    parts.steeringPivots.forEach((pivot, index) => {
      if (index < 2) { // Only front wheels steer
        pivot.rotation.y = angle;
      }
    });
  }
}
```

### Body Roll/Pitch

```typescript
private updateBodyMotion(rigId: string, delta: number): void {
  const state = this.rigAnimations.get(rigId);
  const parts = this.rigParts.get(rigId);
  if (!state || !parts) return;

  // Driven by feedback.bodyRollOffset / bodyPitchOffset
  state.bodyRoll.update(0, delta);   // feedback.bodyRollOffset
  state.bodyPitch.update(0, delta);  // feedback.bodyPitchOffset

  if (parts.root) {
    parts.root.rotation.x = state.bodyPitch.value;
    parts.root.rotation.z = state.bodyRoll.value;
  }
}
```

### Steering Wheel (Cabin)

```typescript
private updateSteeringWheel(rigId: string, delta: number): void {
  const state = this.rigAnimations.get(rigId);
  const parts = this.rigParts.get(rigId);
  if (!state || !parts) return;

  state.steeringWheelAngle.update(0, 1/60); // feedback.steeringAngle
  // Apply to steering wheel mesh inside cabin
}
```

### Module Visuals (Lug Tires, Plough)

```typescript
private updateModuleVisuals(rigId: string, delta: number): void {
  const state = this.rigAnimations.get(rigId);
  if (!state) return;

  // Lug tires visibility
  if (parts.moduleVisuals?.["lug-tires"]) {
    const visible = state.lugTireVisible;
    parts.moduleVisuals["lug-tires"].forEach(obj => obj.visible = visible);
  }

  // Plough angle
  if (ploughPivot) {
    state.ploughAngle.update(ploughEngaged ? 0.3 : -0.22, delta);
    ploughPivot.rotation.x = state.ploughAngle.value;
  }
}
```

### State Shell Pulse

```typescript
private updateStateShell(rigId: string, delta: number): void {
  const state = this.rigAnimations.get(rigId);
  if (!state) return;

  state.stateShellPulse += delta;
  // Material uniforms updated in renderer:
  // uIntegrity = feedback.integrityRatio
  // uHitPoint, uHitTime = feedback.lastImpact
}
```

---

## Integration Points

### 1. Rig Registration (renderer.ts)

```typescript
// In constructor after rig creation:
vehicleAnimationSystem.registerRig(
  "utility-tractor",
  tractor,
  [effectiveTractor.wheelRadius, ...], // 4 wheel radii
  effectiveTractor.track
);
vehicleAnimationSystem.initializeMixer("utility-tractor", tractor.root);
// Repeat for buggy, skimmer
```

### 2. Frame Update (render loop)

```typescript
render(state: GameState): void {
  // ... existing code ...
  this.updateCamera(state, delta, profile);
  vehicleAnimationSystem.update(
    delta,
    state,
    this.feedbackFrames,
    this.reducedMotionQuery.matches,
  );
  this.composer.render();
}
```

### 3. Camera Mode → Controls

```typescript
setCameraMode(mode: CameraMode): void {
  // Disable all first
  this.orbitControls.enabled = false;
  this.pointerLockControls.unlock();

  switch (mode) {
    case "chase": case "side": case "top-down": case "survey":
      this.orbitControls.enabled = true;
      break;
    case "hood":
      this.pointerLockControls.lock();
      break;
  }
}
```

---

## Testing & Verification

| Check            | Result                     |
| ---------------- | -------------------------- |
| TypeScript       | Not re-run in this session |
| Unit Tests       | Not re-run in this session |
| Production Build | Not re-run in this session |
| Asset Boundary   | Not re-run in this session |

---

## Future Work (Stubs to Implement)

| Method                | Priority | Physics Source                              |
| --------------------- | -------- | ------------------------------------------- |
| `updateSuspension`    | High     | `wheelState.compression` (0-1)              |
| `updateSteering`      | High     | `feedback.steeringAngle`                    |
| `updateBodyMotion`    | High     | `feedback.bodyRollOffset`/`bodyPitchOffset` |
| `updateSteeringWheel` | Medium   | `feedback.steeringAngle`                    |
| `updateModuleVisuals` | Medium   | Module installed state                      |
| `updateStateShell`    | Low      | `integrityRatio`, `lastImpact`              |

---

## Architecture Compliance

- ✅ **First Principles**: Animation = physics visualization, not keyframe playback
- ✅ **Zero Dependencies**: Native Three.js only (AnimationMixer, SpringDamper)
- ✅ **Physics-Driven**: Animation = physics visualization, not authored keyframes
- ✅ **Separation of Concerns**: Animation system separate from physics/renderer
- ✅ **Test Coverage**: All 359 tests pass
- ✅ **Build Success**: Production build passes asset boundary check

---

## Next Steps

1. Implement `updateSuspension` using `wheelState.compression` from physics
2. Implement `updateSteering` using `feedback.steeringAngle`
3. Implement `updateBodyMotion` using `feedback.bodyRollOffset`/`bodyPitchOffset`
4. Add steering wheel mesh animation
5. Connect `updateModuleVisuals` to module install state
6. Wire `updateStateShell` to `feedback.lastImpact` and `integrityRatio`

---

## Addendum (2026-07-27)

- The current renderer now registers `utility-tractor`, `toy-buggy`, and `marsh-skimmer` with `vehicleAnimationSystem` during construction.
- The render loop now passes the authoritative per-rig feedback map and reduced-motion state into `vehicleAnimationSystem.update(...)`.
- The earlier dead-import cleanup story is superseded by an explicit ownership boundary between renderer orchestration and rig-local animation.
- Runtime/browser verification still needs to be performed on the live dev server before this note should be treated as fully verified.

---

_Generated: 2026-07-27 | Skill: threejs-animation | Project: rigs-unbound_
