# Web Loading and Profile Bootstrap Contract (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the browser-facing loading, startup, and profile-selection contract for the current Three.js 3D app.

Linked policy artifacts:

- [ADR-0010: Rendering, accessibility, and motion-safety contract](../decisions/ADR-0010-rendering-accessibility-contract.md)
- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [ADR-0016: Performance and readability threshold baseline for v1.x](../decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
- [Render Contract Profile Matrix](./RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
- [3D Web Platform Accessibility & Deliverability Audit](./3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)

## Decision

The browser must never present the app as a dead black box while the 3D scene loads.

The player should always get one of the following states quickly:

- an interactive shell with visible loading progression,
- a readable fallback preview,
- or a degraded but usable baseline profile.

## Bootstrap states

### 1) Shell state

The shell state appears first.
It should show:

- app identity,
- loading progression or initialization message,
- a clear indication that the experience is still alive,
- a path to the first useful interaction once the scene is ready.

### 2) Warmup state

The engine can continue initializing assets, scene data, and runtime hooks while the shell remains visible.
During this state:

- the user should still understand that progress is happening;
- non-essential scene work may still be deferred;
- profile selection can be evaluated against measured thresholds.

### 3) Ready state

When the scene is ready, the app transitions into the playable profile without changing the meaning of the controls or the visible state.

### 4) Fallback state

If the chosen profile cannot meet the measured threshold:

- the app must degrade visibly,
- preserve gameplay semantics,
- and keep a readable baseline available rather than failing silently.

## Profile selection rules

- `standard` remains the default acceptance profile for first public smoke tests.
- `mobile-safe` is the required fallback when the measured startup/runtime envelope is weak or the device budget is constrained.
- `full` is benchmark-only unless a representative device proves it is safe enough to use.

Profile selection should be based on measured thresholds and captured runtime signals, not on guesswork alone.

## Loading and trust rules

A good loading experience must:

- show that the app is alive,
- indicate progress instead of spinning forever,
- preserve the player’s trust during warmup,
- and keep the first useful interaction close.

The contract is specifically meant to prevent:

- blank-screen ambiguity,
- silent stall,
- confusing profile changes,
- or a loading path that feels like a crash.

## Interaction rules during loading

The app may expose limited interaction during loading if that interaction is stable and does not create false expectations.

Allowed examples:

- a static preview,
- a start/continue affordance,
- a clear progress label,
- a reduced-motion or low-budget preview scene.

Not allowed:

- a fake progress bar,
- a silent black canvas,
- a control surface that looks ready but cannot respond,
- a fallback that hides important loading failure information.

## Measurement and evidence

The loading contract should be evaluated with:

- startup timing,
- first interactive frame timing,
- profile selection outcome,
- fallback visibility,
- and preserved control/state behavior after the scene becomes ready.

## What this contract is not

- Not a full streaming-system spec.
- Not a replacement for the render profile matrix.
- Not a content-loading pipeline design.
- Not a promise that every device can use the same profile.

## Relationship to the broader architecture

This note answers the web-audit gap about stable loading UX and profile bootstrap.
It gives the browser layer a durable rule: progress and fallback must be visible before the app asks the player to trust the scene.

## Addendum (2026-07-25): the shell is visible, but the bootstrap policy is still mostly implicit

- Re-checked the current startup path, browser surface, and live runtime state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current implementation already proves the first half of the contract:
  - `welcome-panel` is a real startup shell in `src/main.ts` and
    `src/styles.css`,
  - the shell prevents the app from looking like a dead black box,
  - `saveStatus` is populated immediately from the load result, so the browser
    always has a live textual state during boot,
  - entering the world dismisses the shell and focuses the canvas.
- What is still missing is the explicit bootstrap policy surface the contract
  asks for:
  - no real profile-selection UI or runtime profile chooser,
  - no visible loading progress meter or startup percentage,
  - no separate fallback-preview state distinct from the shell and ready states,
  - no measured profile-selection outcome visible to the user.
- So the browser is now past the “dead black box” risk, but the bootstrap path
  is still mostly a shell-plus-default-profile implementation rather than a
  fully named loading/profile policy.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - measured fallback policy is now explicit, renderer activation remains next

- `src/game/runtime-profile-policy.ts` now owns a conservative selection rule
  backed by the existing `PerformanceSnapshot`: retain `standard` until at
  least 90 bounded frame samples exist, then request `mobile-safe` only when
  average frame, p95 frame, or first-controllable budgets exceed the declared
  policy.
- The selector never auto-promotes to `full`. That profile remains a
  representative-device benchmark decision, not a user-agent or warmup guess.
- `PerformanceSnapshot.frameSampleCount` now makes the timing evidence itself
  inspectable, avoiding a fallback decision based on an empty or one-frame
  window. The returned reasons are intended for player-safe status text and
  developer diagnostics rather than hidden tuning.
- This is not yet a runtime fallback. The renderer still binds the active
  visibility profile at construction; the next implementation stage must allow
  a safe profile swap, rebuild its bounded props, expose the active selection,
  and prove semantic input/camera continuity.
- Evidence depth: Tier 1 source and focused-test implementation. Tests have not
  been executed in this pass; budget values remain provisional until a
  representative capture bundle accepts or revises them.

## Anything else? (profile-policy seed)

Heap is intentionally not a selection trigger yet because browser memory
telemetry is not universally available. It remains observable evidence until a
cross-browser, representative-device policy can state what it means safely.

## Addendum (2026-07-26) - measured fallback now changes the real visibility budget

- `GameRenderer.setVisibilityProfile(...)` is the canonical mutable boundary for
  the existing instanced-prop budget. It rebuilds the same deterministic prop
  set immediately with the selected profile's radius and preserves world,
  input, camera, save, and simulation state.
- The browser entry evaluates the measured policy during HUD updates. On the
  first supported fallback decision it switches from `standard` to
  `mobile-safe`, records a `runtimeProfileFallback` checkpoint with reasons,
  exposes selection in `render_game_to_text()` and developer diagnostics, and
  tells the player that scenery detail was reduced.
- The fallback is intentionally one-way for the current session. Automatic
  recovery needs a separately measured hysteresis/cooldown policy; repeatedly
  swapping scenery around a threshold would be worse than a stable conservative
  result.
- `full` remains benchmark-only. The profile policy cannot promote into it.
- Evidence depth: Tier 1 source/test implementation. Browser and
  representative-device continuity evidence still need to prove that the swap
  is readable and that the fallback has the intended cost reduction.

## Anything else? (real fallback)

The visible player message names only the perceptible change. Detailed reasons
remain in diagnostics and the checkpoint payload, so public copy does not leak
internal tuning language while operators retain an audit trail.

## Addendum (2026-07-26) - recovery is now hysteretic rather than permanently degraded

- `PerformanceSnapshot.totalFrameSampleCount` now supplies a monotonic evidence
  clock alongside the bounded timing window. The latter is correct for current
  frame quality; the former is required for a recovery hold that remains valid
  after the rolling buffer reaches capacity.
- `RuntimeProfileController` keeps `mobile-safe` active for 180 healthy frames
  after measured pressure clears, then restores `standard` once. A renewed
  breach immediately refreshes the fallback reasons and restarts the hold.
- Both transitions rebuild the canonical deterministic scenery set, announce a
  plain-language player status, expose the state in snapshots/diagnostics, and
  record distinct fallback or recovery checkpoints.
- Evidence depth: Tier 1 source/test implementation. The 180-frame value is a
  provisional policy constant until representative browser capture proves the
  transition is imperceptible enough and preserves the intended cost reduction.

## Anything else? (hysteresis)

The controller is intentionally scoped to existing visibility work. It does not
invent adaptive physics, AI, audio, or save-rate changes from render pressure.

## Addendum (2026-07-26) - the bootstrap state is textual and operator-visible, but not a named loading meter

- Re-checked the live browser bootstrap path against `src/main.ts` and
  `src/styles.css`.
- The browser already has a real textual shell:
  - `bootstrapStatus` is created at startup,
  - it is flipped to `ready` when the world handoff completes,
  - the shell prevents the app from looking like a dead box while the scene is
    still warming up.
- The browser already has operator-visible runtime state:
  - `runtimeDiagnostics` carries the selected profile and fallback reasons,
  - `mapProgress` reports surveyed world coverage and sight range.
- What is still missing is a separately named public loading/progress surface:
  - `mapProgress` is world-survey progress, not a startup progress meter,
  - there is no dedicated loading percentage or progress bar for the player,
  - there is no visible profile chooser on the public surface.
- So the correct reading is not that the browser is dead or silent; the current
  gap is that the loading story is still implicit rather than a first-class,
  named browser affordance.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture was
  run in this pass because the browser daemon poll timed out.

## Addendum (2026-07-25) - current Field 02 snapshot and remaining bootstrap gap

- Re-checked the live browser daemon after the earlier shell audit.
- The current runtime surface is `Rigs Unbound — Field 02`, and the daemon still
  reports zero console logs.
- The implementation status is unchanged in the important ways:
  - `welcome-panel` is still the real startup shell,
  - `saveStatus` still gives the player a live textual boot state,
  - the canvas handoff still happens when entering the world,
  - there is still no separate progress meter, startup percentage, or runtime
    profile selector visible to the player.
- So the app is not at risk of looking dead, but the bootstrap contract is still
  only partially explicit. The remaining work is to decide whether a visible
  loading/progress affordance should be promoted from “implicit enough” into a
  first-class browser state.

## Addendum (2026-07-26) - the shell is explicit, but progress and chooser remain implicit

- Re-checked the current browser entry against `src/main.ts` and
  `src/styles.css`.
- The startup shell is now unmistakably real:
  - `bootstrapStatus` exists in the welcome panel,
  - it flips to `ready` when world entry completes,
  - if a fallback profile is active before entry, the shell can say
    `Field systems ready with reduced scenery detail.`
- The browser also has explicit developer visibility:
  - `runtimeDiagnostics` shows renderer memory, bridge evidence, visibility,
    and profile state,
  - `mapProgress` reports survey progress and sight range.
- The remaining browser-facing gap is still the same first-class affordance
  problem:
  - `mapProgress` is not startup loading progress,
  - the public surface still has no dedicated loading percentage or bar,
  - there is still no visible profile chooser for the player.
- So the 3D web-experience lane now has a sharper conclusion:
  the app is trustworthy during boot, but the browser story remains shell-led
  rather than progress-led.
- Evidence depth: Tier 1 static source inspection on the current browser entry
  and stylesheet.

## Addendum (2026-07-26) - episode grammar depends on truthful bootstrap, not a fake start state

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this bootstrap contract.
- The episode grammar does not define loading, progress meters, or profile
  selection; it depends on this layer so the player enters a truthful shell and
  then experiences the chosen episode from a real ready state.
- This keeps the split clean: bootstrap owns entry truth and fallback clarity,
  while the episode grammar owns the authored experience that begins after the
  shell becomes ready.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.
