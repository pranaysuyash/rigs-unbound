# Three.js Interaction System Implementation Flow

**Project:** rigs-unbound
**Skill Applied:** `projects/skills/threejs-interaction`
**Date:** 2026-07-27
**Status:** Complete — All tests pass, build succeeds

---

## Executive Summary

Applied the `threejs-interaction` skill to rigs-unbound, adding a comprehensive interaction system that handles:

- **Camera Controls** (OrbitControls, PointerLockControls)
- **Object Selection** (raycasting with click/double-click handlers)
- **Hover Effects** (emissive highlighting with cursor change)
- **Object Manipulation** (TransformControls with keyboard shortcuts)
- **Camera Mode Integration** (auto-switch controls per rig camera mode)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    InteractionSystem                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ OrbitControls   │  │PointerLockControls│ │ TransformControls│ │
│  │ (chase/side/    │  │ (hood camera     │ │ (object drag/   │ │
│  │ top-down/       │  │ mode)             │ │ rotate/scale)   │ │
│  │ survey modes)   │  │                  │ │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Raycaster (hover/click detection on registered objects)        │
│  Mouse position tracking (NDC normalized coords)                │
│  Keyboard shortcuts (G=translate, R=rotate, S=scale, Esc)      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Details

### 1. OrbitControls (chase/side/top-down/survey modes)

```typescript
const orbitControls = new OrbitControls(camera, domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.08;
orbitControls.minDistance = 4;
orbitControls.maxDistance = 60;
orbitControls.minPolarAngle = 0.1;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.target.set(rig.x, rig.y + 1.2, rig.z);
orbitControls.update();
```

### 2. PointerLockControls (hood mode)

```typescript
const pointerLockControls = new PointerLockControls(camera, domElement);
// Auto-lock on hood mode; unlock on Escape
```

### 3. TransformControls (object manipulation)

```typescript
const transformControls = new TransformControls(camera, domElement);
transformControls.addEventListener("dragging-changed", (event) => {
  orbitControls.enabled = !event.value; // Disable orbit during drag
});
// Keyboard: G=translate, R=rotate, S=scale, Escape=detach
```

### 4. Raycaster & Hover

```typescript
const raycaster = new THREE.Raycaster();
raycaster.near = 0.1;
raycaster.far = 100;

function onPointerMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  // Throttle to 20fps max for performance
}
```

### 5. Click Selection

```typescript
function onClick(event) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickables, true);
  if (intersects.length > 0) {
    selectObject(intersects[0].object);
  }
}
```

---

## Camera Mode → Controls Mapping

| Camera Mode | OrbitControls | PointerLockControls | Notes                 |
| ----------- | ------------- | ------------------- | --------------------- |
| chase       | ✅ Enabled    | Unlocked            | Default follow camera |
| side        | ✅ Enabled    | Unlocked            | Side view             |
| top-down    | ✅ Enabled    | Unlocked            | Overhead view         |
| survey      | ✅ Enabled    | Unlocked            | Wide survey mode      |
| hood        | ❌ Disabled   | ✅ Locked           | First-person from cab |
| tactical    | ✅ Enabled    | Unlocked            | Tactical overview     |

---

## Integration Points

### Renderer Integration

```typescript
// In GameRenderer constructor:
this.interactionSystem = new InteractionSystem(
  this.camera,
  this.domElement,
  this.scene,
);
this.interactionSystem.registerRig("utility-tractor", tractor);
this.interactionSystem.registerRig("toy-buggy", buggy);
this.interactionSystem.registerRig("marsh-skimmer", skimmer);

// In render loop:
this.interactionSystem.update(delta, state);
```

### Camera Mode Switching

```typescript
setCameraMode(mode: CameraMode): void {
  this.interactionSystem.setCameraMode(mode);
}
```

---

## Testing & Verification

| Check            | Result          |
| ---------------- | --------------- |
| TypeScript       | ✅ Clean        |
| Unit Tests       | ✅ 361/361 pass |
| Production Build | ✅ Success      |

---

## Architecture Compliance

- ✅ **First Principles**: Native Three.js controls (no external deps)
- ✅ **Physics-Driven**: Camera follows rig position/heading
- ✅ **Separation of Concerns**: Interaction system separate from rendering
- ✅ **Test Coverage**: All 361 tests pass
- ✅ **Build Success**: Production build passes

---

## Files Modified

- `src/game/interaction.ts` — **NEW** InteractionSystem module
- `src/game/renderer.ts` — Integrated InteractionSystem into GameRenderer
- `src/game/animation.ts` — VehicleAnimationSystem (already implemented)

---

_Generated: 2026-07-27 | Skill: threejs-interaction | Project: rigs-unbound_
