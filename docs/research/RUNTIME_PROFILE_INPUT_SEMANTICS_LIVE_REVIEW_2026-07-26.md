# Runtime Profile and Input Semantics Live Review

Date: 2026-07-26
Evidence tier: Tier 4 runtime observation plus Tier 1 static inspection

## Scope

This review checks the browser-specific 3D delivery contract against the live
`4174` Field 02 surface and the current runtime policy.

## Live evidence

Fresh browser observation on `http://127.0.0.1:4174/`:

- title: `Rigs Unbound — Field 02`
- welcome shell: present before world entry
- world entry: successful through `Enter the field`
- console: no page errors or application warnings during the checked flow
- desktop viewport tested: `1682 x 1079`
- narrow viewport tested: `390 x 844`
- narrow layout horizontal overflow: none (`scrollWidth === clientWidth === 390`)
- touch controls: visible and inside the viewport
- map overlay: fits the narrow viewport at `390 x 844`
- Field 02 snapshot: deterministic state, active tractor, terrain telemetry,
  world memory, run record, performance metrics, and save metrics all present

Fresh runtime performance evidence after entering the field:

- average frame time: `8.33 ms`
- p95 frame time: `9.3 ms`
- frame rate: `120 FPS`
- draw calls: `49`
- triangles: `97,462`
- terrain build: `85.8 ms`
- first input ready: `9,287.1 ms`
- first controllable: `9,292.4 ms`
- selected profile before correction: `mobile-safe`
- fallback reason: `first-controllable-budget`

The frame measurements are healthy while the profile reason is not a renderer
pressure signal. The player-controlled welcome handoff is contaminating the
adaptive visibility decision.

## Static root cause

`src/main.ts` calls `markInputReady()` and enters the world from user actions.
The frame loop calls `markControllable()` only after `worldEntered` becomes
true. `src/game/runtime-profile-policy.ts` previously compared
`firstControllableMs` with `maximumFirstControllableMs` and used that result to
select `mobile-safe`.

That means a long welcome-panel dwell can change the scenery policy even when
the renderer is within its frame-time envelope.

## Resolution

Implemented in this pass:

- removed `maximumFirstControllableMs` from the adaptive visibility budget;
- removed `first-controllable-budget` from fallback reasons;
- retained `firstControllableMs` and `firstInputReadyMs` as observational
  metrics;
- added a focused regression test for delayed world entry;
- recorded the decision in [ADR-0022](../decisions/ADR-0022-runtime-profile-input-latency-separation.md).

## Remaining browser-delivery gaps

- The public shell is textual rather than a true progress meter.
- A clean representative-device capture is still needed before provisional
  frame thresholds become public performance claims.
- Full public runtime approval remains separate from developer-surface GLB
  loading; the live developer surface loaded both bridge assets successfully,
  while the player surface intentionally exposed no unapproved bridge assets.

## Anything else?

The live browser surfaces are functional and evidence-rich. The next highest
value runtime work is not a renderer rewrite: it is to measure and improve the
actual boot-to-ready path with renderer-owned timings, then prove profile
continuity after the policy correction.

## Addendum (2026-07-29) - ADR-0039 names the public-shell split this runtime review depends on

This runtime review now sits inside the browser-policy split named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- `#runtime-diagnostics` stays on the acceptance/developer side of the split.

That keeps the review honest about its subject: player-facing runtime profile
and input semantics, not an operator-only diagnostics lane.
