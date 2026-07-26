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

## Addendum (2026-07-25) - fresh runtime recheck, same bundled-gate gap

- Re-checked the smoke-test gate against the current browser daemon snapshot.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current runtime still exposes the evidence surface the gate depends on:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - an accessible DOM shell with the playable canvas as the focus target after
    intro dismissal
- The practical contract is still holding:
  - standard and mobile-safe readability behavior are present,
  - reduced-motion clamping is present,
  - HUD text and semantic fallback paths are present,
  - runtime metrics remain observable.
- The gap is still the same one:
  - no packaged smoke-test capture bundle,
  - no single public-gate artifact binding profile matrix, checklist, and KPI
    evidence,
  - no reusable pass/fail summary artifact for fallback events.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - the smoke-test gate is observable, and the runtime exposes the needed hooks

- The live browser daemon is still healthy on `Rigs Unbound — Field 02`, with
  zero console logs in the current snapshot.
- The runtime exposes the evidence surface the contract needs:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
- The browser entry point already keeps the accessibility shell intact after
  intro dismissal, so the gate is not just a renderer concern:
  - the playable canvas remains the focus target,
  - the DOM shell carries the fallback semantics,
  - reduced-motion and mobile-safe behavior remain part of the current runtime
    posture.
- Fresh review-image assets are present in the worktree, which means the gate
  has real capture candidates on disk even though the canonical bundle is still
  not packaged.
- The remaining gap is still the policy packaging layer:
  - no single capture bundle binding profile matrix, checklist, and KPI evidence,
  - no canonical pass/fail summary for fallback events,
  - no named smoke-test artifact that a maintainer can treat as the official
    public-gate package.
- So the contract remains correctly staged between implementation and release:
  observable in the live app, but still short of the fully packaged gate.

## Addendum (2026-07-25) - fresh Field 02 recheck, same packaged-gate gap

- Re-checked the live browser daemon while continuing the renderer /
  performance / accessibility lane.
- The current runtime surface is still `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The gate remains visibly supported by the runtime:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
  - a semantic DOM shell with the playable canvas as the post-intro focus
    target
- The current implementation still matches the intended minimum gate shape:
  - `standard` and `mobile-safe` behavior remain present,
  - reduced-motion clamping remains present,
  - HUD text and semantic fallback paths remain present,
  - the KPI surface is readable in-browser.
- What is still missing is the reusable public-gate artifact:
  - no bundled capture set binding profile matrix, checklist, and KPI evidence,
  - no canonical pass/fail summary for fallback events,
  - no operator-ready artifact that a maintainer can carry forward as the first
    smoke-test package.
- So the runtime is ready to be measured, but the review package still needs to
  be promoted before the gate becomes a durable delivery artifact.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - the live gate remains observable, but the bundled public artifact is still missing

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current live snapshot still shows the same playable, readable band:
  - `phase`: `gloam`,
  - `cameraMode`: `chase`,
  - performance remains in the same bounded first-playable range,
  - the active rig and objective remain visible and recoverable in the current
    snapshot.
- The runtime evidence hooks remain real and exposed:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
- The current sample did not surface a separate camera-resolution record, which
  is a good reminder that the gate still needs the packaged bundle rather than
  only ad hoc runtime inspection.
- What is still missing is the fully bundled public-gate artifact:
  - a capture bundle binding the profile matrix, checklist, and KPI evidence,
  - a canonical pass/fail summary for fallback events,
  - an operator-ready package that can be carried forward as the official smoke
    test record.
- The useful conclusion is unchanged: the runtime is still good enough to
  measure, but the release package remains the missing part of the contract.

## Addendum (2026-07-26) - episode grammar depends on this gate to stay readable publicly

- Re-checked the public-smoke-test contract against the episode-grammar
  direction.
- Episode grammar can only stay readable in the public promise if the smoke-
  test gate binds camera, performance, and accessibility evidence into one
  reviewable bundle.
- That makes this contract the public readability gate beneath episode
  grammar, not the story-composition layer itself.
- The missing artifact remains the same bundled public-gate package, but the
  dependency boundary is now explicit.
- Evidence tier: Tier 1 static inspection.
