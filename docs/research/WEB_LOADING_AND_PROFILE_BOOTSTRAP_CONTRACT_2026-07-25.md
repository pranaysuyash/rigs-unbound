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
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.
