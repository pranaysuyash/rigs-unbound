# 3D Web Platform Accessibility & Deliverability Audit (2026-07-25)

## Skills consulted (in sequence)

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)
2. [3d-web-experience](/Users/pranay/Projects/skills/3d-web-experience/SKILL.md)

## Purpose

Provide a complete, repo-local audit of web-delivery, performance profile, accessibility, and interaction feasibility for the user-requested “analyse what is there, what is possible, and more” objective.

## Current implementation signal (authoritative local evidence)

- Engine/runtime path is Three.js with deterministic simulation contract and renderer-presentational split:
  - `src/game/state.ts`
  - `src/game/renderer.ts`
  - `src/game/gameworld.ts`
- Deterministic migration path exists for saved state and schema evolution:
  - `src/game/storage.ts`
- Terrain/prop world is already a central deterministic substrate:
  - `src/game/terrain.ts`, `src/game/world.ts`
- Input exists for keyboard/gamepad/touch with browser hook scaffolding:
  - `src/main.ts`
- Existing render/perf profiling hooks exist:
  - `src/game/performance.ts`
- Render/quality policy exists at decision level:
  - [ADR-0010](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0010-rendering-accessibility-contract.md)
  - `docs/research/RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md`
  - `docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md`

## What is already possible (not yet complete)

- Non-sticky 3D quality profiles are documented and can be tightened into startup/runtime gates.
- Accessibility concerns are acknowledged, and there are concrete fallback hooks planned for reduced motion and readability.
- Deterministic simulation gives a stable base for replay-like replay and authority later.

## What is missing (now and in near term)

1. **Delivery guardrails for first-class 3D web behavior**
   - The loading and profile bootstrap contract now exists as a named policy surface.
   - Mobile-first fallback policy exists in matrix form and is now tied to that bootstrap contract.

2. **Visible performance degradation policy runtime binding**
   - Profile matrix exists, but startup auto-selection and profile switch behavior needs stronger binding in code.

3. **Accessibility + motion safety operationalization**
   - Reduced-motion handling and core readability checks are present, and the live browser pass has now confirmed the remaining keyboard gaps are closed:
     - the enter-world focus handoff now lands on `canvas#game-canvas`,
     - a skip link now exists into the main interactive region.
   - See [ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md).

4. **Web-model pipeline hardening**
   - The web asset ingest and compression contract now names source-to-runtime provenance, validation, compression, and replacement rules.
   - Runtime loader binding and reject-path enforcement still need code-level proof.

5. **Command/event/state split execution path**
   - Decision/validation/event split is modeled as architecture direction but not complete in code path yet:
     - [ADR-0011](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0011-command-capability-affordance-state-separation.md)

## 3D-web-specific checks vs 3d-web-experience guidance

The 3d-web skill highlights three non-negotiables that map to the current repo:

- Purpose over novelty: 3D is retained where gameplay value exists, not used as decoration.
- Mobile-first constraint: desktop-only 3D is high risk.
- Stable loading UX: load progression and graceful fallback are necessary for trust and completion.

Repo evidence alignment:

- Purpose: gameplay-first simulation and terrain-first activity loop already support this.
- Mobile risk: profile matrix and ADRs acknowledge low-end constraints.
- Loading fallback: now named as a bootstrap contract, but still needs runtime enforcement and profile binding in code.

## Concrete recommended web execution lane (non-architecture theatre)

### Lane 1 — Profile bootstrap + runtime binding (immediate)

- Bind profile selection to measurable startup/runtime thresholds.
- Ensure fallback sequence does not alter gameplay semantics.
- Verify every profile preserves core telemetry and outcome messages.
- Use the loading/bootstrap contract as the user-facing entry point for that selection.

Evidence goal:

- Deterministic profile switch from `full -> standard -> mobile-safe` with preserved action state.
- No action loss from profile transition.
- Visible loading progression until the first interactive frame.

### Lane 2 — Accessibility + reduced-motion hardening

- Add explicit reduced-motion gating in camera effects and non-essential motion.
- Add readability fallbacks for UI/readouts independent of hue-only cues.

Evidence goal:

- Same control success across profiles, same mission outcomes.

### Lane 3 — Content ingest hardening (pipeline)

- Add web content contract for mesh/material/audio checks and provenance.
- Add loader contract + reject path for oversized or invalid assets.

Evidence goal:

- Invalid content is rejected before simulation/world activation.

### Lane 4 — Command/event/state proof slice

- Implement one command path that is end-to-end validated against command -> state -> event.
- Add one test for affordance incompatibility rejection.
- Add one deterministic replay test for that interaction.

Evidence goal:

- Replay and telemetry show one explicit reason code and no world mutation without validated command.

## Long-term evidence model (motto-v4 aligned)

For each lane, we require:

1. **Type and architecture proof** (Tier 2)
2. **Runtime profile verification** (Tier 3)
3. **Representative-device observation** (Tier 4)

Only after Tier 3+ closure on each lane should we publish public-claim scope wider than local-only.

## Linked source artifacts

- [ADR-0010](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0010-rendering-accessibility-contract.md)
- [ADR-0011](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0011-command-capability-affordance-state-separation.md)
- [ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md)
- [WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)

## Addendum (2026-07-25) - Live canvas-first surface check

- Runtime observation at `http://127.0.0.1:4173/?p0-repro=welcome` confirms
  the current Field 02 surface is intentionally canvas-first:
  - `#game-canvas` and `#map-canvas` are present,
  - the skip link to `#game-canvas` is present,
  - `window.render_game_to_text()` and `window.getPerformanceSnapshot()`
    remain available for operator visibility.
- The same DOM snapshot did not expose a separate `progress`, `aria-busy`, or
  other explicit loading marker.
- That is not a defect claim by itself, but it does keep the 3d-web-experience
  question open for slower/public entry:
  - should the minimal loader be treated as intentional,
  - or should a bounded loading/fallback affordance be added before broader
    mobile/public expansion?
- Evidence tier: Tier 4 runtime/manual observation.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this audit. This document still owns the browser
delivery, accessibility, and deliverability frame; the new note carries the
wider machine-keeper thesis and long-range product direction.

## Addendum (2026-07-28) - current browser-delivery lens after the 3D-games pass

- Re-read the current repo against the browser-delivery lane after the 3D-games
  skill pass.
- The live browser shape is still intentionally canvas-first and operator-visible
  rather than decorative:
  - `#game-canvas` and `#map-canvas` remain the central surfaces,
  - camera selection remains a named user action,
  - performance snapshots and renderer text hooks remain available,
  - the browser-facing docs still treat reduced-motion and profile choice as
    first-class policy concerns.
- The durable gap is not whether the app can show 3D. It is whether the public
  browser experience can be packaged as a trustworthy, restartable, profile-
  aware surface with explicit loading, fallback, and capture evidence.
- The next proof bundle should bind:
  - visible loading or a truthful indeterminate state,
  - profile switching from `full -> standard -> mobile-safe`,
  - reduced-motion clamping,
  - one canonical capture bundle for public-smoke-test review.
- Evidence depth for this addendum: Tier 1 static inspection in this pass.
  Earlier Tier 4 runtime evidence remains owned by the earlier browser addenda.

## Addendum (2026-07-28) - live Field 02 browser recheck

- Re-checked the canonical browser daemon on `http://127.0.0.1:4173/?acceptance=field-02`.
- The current page title is `Rigs Unbound`.
- The public shell now shows the live trust line the contract expects:
  - `Quality: standard.`
  - `Saved locally just now`
  - `Field systems ready. Restored session controls are active.`
  - visible `#profile-status` and `#save-status` regions on the public surface
  - `runtimeDiagnostics` is visible rather than hidden in this build
- The current body text still does **not** expose a dedicated progress bar or
  `aria-busy` loading marker, so the browser remains honest about the current
  loading-policy gap rather than pretending to have a more explicit bootstrap
  state than it really does.
- Captured console logs were all Vite connect/connected messages; no gameplay
  errors were present in the sampled buffer.
- Evidence depth: Tier 4 runtime/manual observation for the live page state.

## Addendum (2026-07-29) - ADR-0039 now names the public/acceptance split this audit was observing

The browser-delivery split in this audit now has a durable decision anchor:

- ADR-0039 keeps `#bootstrap-status` public and semantic;
- ADR-0039 keeps `#profile-status` public and visible;
- ADR-0039 route-gates `#runtime-diagnostics` to the acceptance/developer
  surface.

That matters here because this audit is the browser-delivery evidence trail,
while ADR-0039 now captures the policy rule behind the public/acceptance split.
The public shell should continue to read as player-facing, and the acceptance
surface should continue to carry reviewer-facing diagnostics.
