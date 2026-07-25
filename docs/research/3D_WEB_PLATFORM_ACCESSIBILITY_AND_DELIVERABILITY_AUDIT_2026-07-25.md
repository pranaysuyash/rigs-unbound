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

## What is already possible (not yet complete)

- Non-sticky 3D quality profiles are documented and can be tightened into startup/runtime gates.
- Accessibility concerns are acknowledged, and there are concrete fallback hooks planned for reduced motion and readability.
- Deterministic simulation gives a stable base for replay-like replay and authority later.

## What is missing (now and in near term)

1. **Delivery guardrails for first-class 3D web behavior**
   - No explicit first-class loading state contract for 3D module bootstrap.
   - Mobile-first fallback policy exists in matrix form but not fully enforced in gameplay code path.

2. **Visible performance degradation policy runtime binding**
   - Profile matrix exists, but startup auto-selection and profile switch behavior needs stronger binding in code.

3. **Accessibility + motion safety operationalization**
   - Reduced-motion handling and core readability checks are currently policy-level, not yet fully executable in all interactive paths.

4. **Web-model pipeline hardening**
   - 3D model optimization and compress/integrity checks are not yet formalized as content contracts.

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
- Loading fallback: not yet fully coded as contract enforcement.

## Concrete recommended web execution lane (non-architecture theatre)

### Lane 1 — Profile bootstrap + runtime binding (immediate)

- Bind profile selection to measurable startup/runtime thresholds.
- Ensure fallback sequence does not alter gameplay semantics.
- Verify every profile preserves core telemetry and outcome messages.

Evidence goal:
- Deterministic profile switch from `full -> standard -> mobile-safe` with preserved action state.
- No action loss from profile transition.

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
- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)
