# Physics Lab Browser Experience and Acceptance Contract (2026-07-25)

## Skills consulted

1. [3d-web-experience](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/3d-web-experience/SKILL.md)

## Purpose

Turn the standalone Physics Lab 01 surface into a named browser-experience contract so it stays a deliberate evidence fixture rather than drifting into a shadow product path.

The main Field 02 experience remains the canonical player-facing path. Physics Lab 01 exists to isolate drivetrain, solver, camera, accessibility, loading, and recovery evidence in a browser environment with a simpler scene and clearer telemetry.

## Current evidence base

- Browser entrypoint and separate lab shell:
  - [physics-lab.html](/Users/pranay/Projects/Game_dev/rigs-unbound/physics-lab.html)
  - [src/physics-lab/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/physics-lab/main.ts)
  - [src/physics-lab/styles.css](/Users/pranay/Projects/Game_dev/rigs-unbound/src/physics-lab/styles.css)
- Shared web shell and entry link:
  - [index.html](/Users/pranay/Projects/Game_dev/rigs-unbound/index.html)
  - [src/styles.css](/Users/pranay/Projects/Game_dev/rigs-unbound/src/styles.css)
- Build and route wiring:
  - [package.json](/Users/pranay/Projects/Game_dev/rigs-unbound/package.json)
  - [vite.config.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/vite.config.ts)
- Browser acceptance and evidence patterns:
  - [tools/physics-lab-browser-acceptance.cjs](/Users/pranay/Projects/Game_dev/rigs-unbound/tools/physics-lab-browser-acceptance.cjs)
  - [docs/reviews/assets/physics-lab-01-desktop.png](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/assets/physics-lab-01-desktop.png)
  - [docs/reviews/assets/physics-lab-01-top-down.png](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/assets/physics-lab-01-top-down.png)
  - [docs/reviews/assets/physics-lab-01-debug.png](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/assets/physics-lab-01-debug.png)
  - [docs/reviews/assets/physics-lab-01-narrow.png](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/assets/physics-lab-01-narrow.png)
  - [docs/reviews/RIG_PERCEPTION_CHAIN_01_ACCEPTANCE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/RIG_PERCEPTION_CHAIN_01_ACCEPTANCE_2026-07-25.md)
  - [docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
  - [docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
  - [docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md)

## What is already there

The lab already has a strong browser-facing shell:

- a dedicated `physics-lab.html` route with its own title and canvas,
- a focusable canvas and skip link,
- explicit telemetry labels for speed, slip, contact, frame cost, and body/collider counts,
- pause, debug, reset, camera, frequency, and time-scale controls,
- a fallback error panel for start-up failure,
- text hooks in `src/physics-lab/main.ts` that expose renderable state for automation,
- a dedicated acceptance runner in the worktree that exercises the lab route and captures screenshots and console/page-error state.

That means the lab is already more than a demo. It is a browser evidence surface that can support repeatable comparison work.

## What is still missing

The current surface still lacks:

- a checked-in, reviewed acceptance record tying the lab runner to the canonical docs,
- lab-specific acceptance criteria for boot, controls, pause/debug/reset, and failure recovery,
- a recorded proof that the lab remains an evidence fixture rather than a second canonical product path,
- browser-visible budget notes for first-controllable time, frame timing, and fallback visibility,
- a durable recommendation for whether the lab runner stays separate from or is shared with the Field 02 runner.

## Contract shape

A durable browser-lab contract should separate:

1. **Canonical player surface**
   - Field 02 remains the main public game path
2. **Lab surface**
   - Physics Lab 01 remains a focused evidence fixture
3. **Shared bootstrap**
   - same web-app shell contracts
   - explicit route and skip/focus path
   - readable error and loading states
4. **Acceptance runner**
   - boot sequence proof
   - camera/control proof
   - pause/debug/reset proof
   - runtime telemetry proof
   - recovery/fallback proof
5. **Evidence outputs**
   - screenshots
   - text snapshot
   - console/page-error capture
   - timing and performance metrics

This keeps the lab measurable without allowing it to become a second product.

## Validation rules

The contract should fail visibly if it:

- cannot reach the lab route from the app shell,
- starts without accessible labels or telemetry,
- hides the error state when the dynamics backend cannot start,
- reuses the Field 02 acceptance flow without lab-specific assertions,
- loses the canonical distinction between Field 02 and Physics Lab 01,
- omits the route, metrics, or failure mode from the recorded evidence.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one dedicated physics-lab acceptance runner or shared runner scenario,
2. one recorded browser acceptance output for the lab surface,
3. one docs note naming the lab as an evidence fixture,
4. one confirmation that Field 02 remains the canonical player path.

## Open questions

- Should the lab runner live beside `tools/rig-lab-browser-acceptance.cjs` as a separate file, or as a shared scenario switch?
- Should the lab acceptance compare camera/readability against Field 02, or only prove the lab’s solver and fallback behavior?
- Should lab evidence live in the same review series as Field 02 or in a separate fixture review family?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

Physics Lab 01 is valuable because it makes solver, camera, and fallback behavior easier to inspect.
The long-term rule is that this lab must stay a supporting evidence fixture, not a competing canonical product path.

## Addendum — 2026-07-25 implementation reconciliation

The near-term proof slice is now implemented locally:

- `tools/physics-lab-browser-acceptance.cjs` remains a separate runner because
  wheel contact, surface profiles, solver frequency, debug geometry, and
  plain-data reset are lab-specific assertions;
- semantic input, the six camera policies, accessibility expectations,
  performance vocabulary, and console/page-error capture remain shared
  contracts;
- [Physics Lab 01 acceptance](../reviews/PHYSICS_LAB_01_ACCEPTANCE_2026-07-25.md)
  records the reviewed browser output, metrics, screenshots, evidence ceiling,
  preservation state, and remaining gaps;
- [Physics Lab 01 plan](../plans/PHYSICS_LAB_01_2026-07-25.md) names the lab as
  a disposable evidence fixture;
- Field 02 remains the canonical player-facing path.

The open runner question is therefore resolved for this version: keep separate
scenario files while sharing contracts and evidence language. Revisit
consolidation only if duplicated orchestration becomes a measured maintenance
problem.

### Anything else?

The fixture must continue proving its own removal boundary. If Field 02 cannot
build and run without loading Rapier or the laboratory module, the lab has
crossed from bounded evidence into shadow architecture.
