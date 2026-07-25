# Renderer, Performance, and Accessibility Contract for First Public Smoke Test (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the minimum renderer, camera, performance, and accessibility contract that must hold before the first public smoke test for Rigs Unbound.

This note answers the open question in the canonical 3D analysis about the minimum camera and visual contract needed for accessibility before public exposure.
It does not replace the renderer policy, the accessibility checklist, or the KPI note.
It binds them into one gate.

Linked artifacts:

- [Render Accessibility Checklist](./RENDER_ACCESSIBILITY_CHECKLIST_2026-07-25.md)
- [Render Contract Profile Matrix](./RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Culling and LOD Spike Tests](./CULLING_LOD_SPIKE_TESTS_2026-07-25.md)
- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [Risk and Public-Readiness Register](./RISK_AND_PUBLIC_READINESS_REGISTER_2026-07-25.md)
- [Rendering Potential and Economy](./RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)

## Decision

Use `standard` as the default acceptance profile for the first public smoke test.

Use `mobile-safe` as the required fallback profile for reduced-motion and lower-budget validation.

Use `full` only as a benchmark profile for desktop-class comparison, not as the public smoke-test requirement.

The public smoke test is accepted only when the same representative loop remains readable in both `standard` and `mobile-safe` profiles.

## Minimum camera and visual contract

### Camera

- The active rig or objective must remain visible, inferable, or recoverable at all times.
- Camera shake, aggressive FOV pulses, and non-essential zoom must clamp under reduced-motion mode.
- Camera transitions must have a bounded settle time and must not hide control state or objective state.
- Camera collision or pull-in behavior may soften the view, but it may not erase hazard or obstacle context.

### Readability

- HUD and status text must remain legible in desktop and narrow-width layouts.
- Critical action outcomes must have a visible semantic equivalent, not motion alone.
- Terrain slope, wetness, hazard, and route cues must not depend only on color.
- Any essential state that canvas/WebGL cannot express reliably must have a DOM or semantic fallback.

### Degradation

- The renderer may reduce far-field detail, ambience, and decorative density first.
- Gameplay semantics must not change when the profile degrades.
- If budget pressure increases, feedback must remain visible even when polish drops away.
- Fallback events must be observable in logs, captures, or debug output.

## Public smoke test pass condition

A single representative vehicle loop must be playable in the `standard` profile, then repeated in `mobile-safe` with reduced motion, without losing:

- control readability,
- route or hazard readability,
- action feedback,
- camera legibility,
- state continuity.

## Required evidence for the gate

The following values must be visible when the gate is reviewed:

- per-frame actor count,
- active physics count,
- draw-call pressure,
- transition latency,
- fallback or degrade events.

Those values come from the KPI note and must be compared against deterministic fixture scenes.

## What this gate is not

- Not final art approval.
- Not a request for a new engine.
- Not a demand for custom shaders before they are needed.
- Not a public social or multiplayer readiness gate.

## Operational reading

If this gate fails, the failure should be interpreted as one of four things:

1. the camera is obscuring player judgment,
2. the scene is too visually dense for the chosen profile,
3. the accessibility fallback is incomplete,
4. the runtime instrumentation is not yet sufficient to explain the failure.

That classification keeps the team from treating every readability issue as an art issue.

## Relationship to the broader architecture

This contract sits between policy and implementation.

- The profile matrix defines what each renderer profile is allowed to spend.
- The accessibility checklist defines what must survive when motion or budget is reduced.
- The KPI note defines what evidence must be visible when judging the gate.
- The spike-test note defines the repeatable scene set that makes the gate measurable.

Together they define the public-smoke-test contract without widening the product scope.

## Addendum (2026-07-25): the smoke-test gate is already observable, but still not fully policy-bundled

- Re-checked the live browser surface and runtime wiring after reviewing the
  smoke-test gate.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime already exposes the core evidence this gate requires:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - an accessible DOM shell with the playable canvas as the focus target after
    the intro is dismissed
- The current implementation already satisfies the “minimum contract” shape in
  practice:
  - standard and mobile-safe camera/readability behavior are present,
  - reduced-motion clamping is present,
  - HUD text and semantic fallbacks are present,
  - measurable runtime values are available through the performance snapshot.
- What is still missing is the fully bundled smoke-test policy artifact:
  - explicit public-gate capture bundle,
  - named pass/fail summary for fallback events,
  - a single rendered comparison artifact that binds the profile matrix,
    checklist, and KPI evidence together.
- So the repo is past the “can we observe it?” question, but still short of the
  fully packaged gate that the contract describes.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.
