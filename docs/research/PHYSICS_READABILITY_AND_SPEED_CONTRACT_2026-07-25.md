# Physics Readability and Speed Contract (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the minimum contract that keeps simplified physics readable, fun, and explainable as speed rises in the current 3D browser runtime.

Linked artifacts:

- [ADR-0012: Rig perception is a shared gameplay contract](../decisions/ADR-0012-rig-perception-chain.md)
- [Browser vehicle-physics technique catalog](./BROWSER_VEHICLE_PHYSICS_TECHNIQUE_CATALOG_2026-07-25.md)
- [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
- [Render Contract Profile Matrix](./RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Risk and Public-Readiness Register](./RISK_AND_PUBLIC_READINESS_REGISTER_2026-07-25.md)

## Decision

Use a shared, read-only perception frame to keep physics readable under speed.

The contract is not “make the physics more realistic.”
The contract is “make the same simplified physics easier to read as speed and load rise.”

That means the runtime should spend its budget on:

- control authority,
- traction or cushion loss,
- body attitude,
- camera anticipation,
- audio and visual confirmation,
- reduced-motion clamping.

## Minimum readability envelope

### 1) Semantic signal must survive speed

At higher speed, the player must still be able to read:

- whether the rig is gripping or slipping,
- whether the body is leaning or leveling,
- whether the load is increasing,
- whether the camera is warning or merely following,
- whether the action succeeded or failed.

### 2) Exaggeration may change, semantics may not

Speed can intensify some presentation effects, but the meaning must remain stable.

Allowed:

- stronger wheel/track motion,
- more camera anticipation,
- more pronounced body pitch and roll,
- louder contact or strain cues,
- clearer HUD or telemetry emphasis.

Not allowed:

- motion that hides the player’s control state,
- camera pulses that erase context,
- visual effects that replace core feedback,
- speed cues that exist only in one sensory channel.

### 3) Reduced-motion and low-budget paths must remain legible

If motion is reduced or budget is lowered:

- the physical truth stays intact,
- presentation exaggeration is clamped,
- feedback must still be visible in text, camera, or audio,
- no profile may remove the meaning of speed or failure.

### 4) Speed should reveal risk, not hide it

The point of speed is to create readable tension.
A good higher-speed state should make it easier to understand:

- that the rig is nearing a control edge,
- that terrain or surface choice matters,
- that strain is accumulating,
- that the player should brake, turn, recover, or commit.

## Existing contract relationship

This note sits under ADR-0012.

ADR-0012 already says the chain is:

`input → intent → simulation → animation → camera → lighting/VFX → sound/haptics → UI → perception`

This note narrows the speed question inside that chain:

- the perception frame is shared,
- the speed envelope is bounded,
- the presentation layers may exaggerate, but not reinterpret, the semantics.

## Acceptance evidence

The contract should be considered satisfied when a representative loop shows:

- readable speed change,
- readable steering or load change,
- visible feedback for slip or strain,
- no loss of control readability under reduced motion,
- no camera effect that hides failure or recovery.

## What this contract is not

- Not a request for full vehicle simulation.
- Not a mandate for extra solver complexity.
- Not a demand for more screen shake.
- Not a new camera policy.

## Relationship to the broader architecture

This note answers the open question in the 3D analysis about whether simplified physics remains readable and fun at higher speed.

It does so by making readability a contract of perception, not a promise of physics fidelity.
