# Performance and Readability Baseline Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s separate renderer, camera, collision, lighting, accessibility, and physics contracts into one umbrella performance/readability baseline.

The repo already has the fine-grained contracts. What it still lacks is the single policy surface that tells operators and maintainers what counts as within budget, degraded but acceptable, or fail-soft across the full playable loop.

## Current evidence base

- Renderer and budget notes:
  - [docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
  - [docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- Fine-grained contracts already in place:
  - [docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
  - [docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md)
  - [docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md)
  - [docs/research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)
  - [docs/research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md)
  - [docs/research/CAMERA_FEEL_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/CAMERA_FEEL_CONTRACT_2026-07-25.md)
  - [docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md)
- Roadmap lane for performance and readability baseline:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the pieces needed to evaluate the baseline:

- culling and LOD are named as contracts,
- camera feel and accessibility are named as contracts,
- lighting and materials already have readable fallback rules,
- physics has a named quality envelope,
- performance instrumentation exists to observe pressure.

That means the baseline is a policy umbrella, not a new engine layer.

## What is still missing

The current surface still lacks:

- a single policy surface for shared thresholds,
- a clear description of within-budget / degraded / fail-soft states,
- a visible mapping from the umbrella policy to the specialized contracts,
- a shared visible budget table for operator review,
- per-frame instrumentation policy for the core pressure signals,
- a documented fail-soft rule that records which threshold was exceeded.

## Contract shape

A durable baseline should separate:

1. **Shared thresholds**
   - culling thresholds
   - LOD tiers
   - camera mode matrix
   - collision semantics
   - transition latency
   - actor / physics budgets
2. **Budget states**
   - within budget
   - degraded but acceptable
   - fail-soft
   - blocked
3. **Operator-facing visibility**
   - visible budget table
   - summary of threshold state
   - active fallback or degrade note
4. **Contract mapping**
   - the umbrella policy must point to the specialized contracts rather than replace them

This keeps the baseline useful as both product policy and ops artifact.

## Validation rules

The contract should fail visibly if it:

- lets each subsystem drift on its own thresholds without an umbrella policy,
- hides degraded-but-acceptable states,
- fails to say which threshold was exceeded,
- ignores transition latency as a primary readability signal,
- drops actor or physics counts from the per-frame instrumentation set,
- replaces the specialized contracts instead of mapping to them.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one policy document binding culling thresholds, LOD tiers, camera mode matrix, and collision semantics,
2. one visible budget table for within-budget, degraded, and fail-soft states,
3. one per-frame instrumentation set for actor count, physics count, and transition latency,
4. one fail-soft path that records which threshold was exceeded,
5. one note showing how the umbrella baseline maps to the existing fine-grained contracts.

## Open questions

- Should the umbrella baseline be expressed as an ADR or a research note first?
- Should fail-soft states be visible in the HUD, debug panel, or logs?
- Which signal should be the primary trigger when multiple thresholds fail at once?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

This baseline should not replace the fine-grained contracts.
It should make their thresholds readable as one policy so the game can be
measured and explained as a whole.

## Addendum (2026-07-25) - The pieces are real, but the umbrella policy is still not first-class

- The live runtime already proves the baseline’s component contracts are not
  theoretical:
  - culling and LOD are named and observable,
  - camera modes and reduced-motion behavior are real,
  - collision semantics are explicit,
  - lighting, shader/material, physics, and performance lanes each have live
    evidence behind them.
- `src/main.ts` and `src/game/renderer.ts` already expose the pressure signals
  this umbrella policy would read:
  - `window.getPerformanceSnapshot()`,
  - `window.selectCamera()`,
  - `window.render_game_to_text()`,
  - camera resolution evidence,
  - HUD-visible state for controls, phase, and performance.
- The browser daemon remains healthy on the live field surface, so the baseline
  is still grounded in real runtime behavior rather than paper policy.
- What is still missing is the shared policy surface the contract describes:
  - no visible budget table for within-budget / degraded / fail-soft states,
  - no single fail-soft summary that says which threshold was exceeded,
  - no umbrella note that maps the thresholds back to the specialized
    contracts as one operational artifact.
- The correct reading is that the baseline already exists as a set of working
  contracts, but not yet as one maintainable policy surface for operators and
  maintainers.

## Addendum (2026-07-26) - The live surface now exposes a measurable baseline, but not the umbrella policy

- Re-checked the live browser surface on `Rigs Unbound — Field 02`; the
  browser daemon is healthy and the current console buffer is still empty.
- The current performance snapshot is concrete enough to anchor the umbrella
  contract:
  - `averageFrameMs`: `20.25`
  - `p95FrameMs`: `21.7`
  - `framesPerSecond`: `49.4`
  - `drawCalls`: `73`
  - `triangles`: `104694`
  - `terrainBuildMs`: `92.7`
  - `heapUsedMb`: `29.4`
  - `firstControllableMs`: `469.2`
  - `saveBytes`: `2969`
- Treat those values as a live diagnostic snapshot only. Concurrent
  browser/trailer GPU activity contaminated this session's timing evidence, so
  a clean representative-device capture remains required before performance
  thresholds or public claims can cite them.
- The same runtime snapshot shows why the baseline still matters:
  - the field is playable and readable,
  - the renderer is already under a real cost budget,
  - the save/load path is compact enough to surface in operator evidence.
- What is still missing is the umbrella policy layer the contract asks for:
  - no explicit within-budget / degraded / fail-soft table,
  - no operator-facing note that names which threshold was exceeded,
  - no single surface that maps the live numbers back to the specialized
    contracts as one readable operational artifact.
- The practical reading is that the app already has measurable pressure and
  visible readability, so the next step is to formalize the policy rather than
  debate whether the baseline exists at all.

## Addendum (2026-07-26) - the umbrella policy remains the missing operator artifact

- Re-checked the baseline contract against the current repo state and the
  live-field evidence trail.
- The repo now has enough measured pieces to support the umbrella policy:
  culling, LOD, camera, collision, readability, accessibility, and performance
  thresholds are all named somewhere in the contract stack.
- What still does not exist as a first-class artifact is the operator-facing
  budget table that combines those thresholds into one readable state summary
  for within-budget, degraded, and fail-soft conditions.
- The runtime can already show the numbers; the missing step is the one place
  that tells maintainers which threshold was exceeded and which fallback band
  the system is currently occupying.
- Treat the current live snapshot as diagnostic only until a clean
  representative-device capture can confirm the thresholds without concurrent
  browser/GPU contamination.

## Addendum (2026-07-26) - the umbrella baseline supports episode grammar, but it is not the episode grammar

- The performance/readability baseline already does the umbrella job for the
  current playable: it keeps culling, LOD, camera, collision, lighting, and
  budget pressure readable as one policy surface.
- That makes it a support layer for the episode grammar, because episodes only
  stay legible if the player can still read the whole playable loop under load
  and degrade conditions.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - the performance/readability baseline keeps that moment readable under
    pressure,
  - fail-soft states preserve enough clarity for the episode to remain
    interpretable.
- This note does not expand the baseline into a story system; it only keeps the
  dependency visible so later episode work can rely on a stable umbrella
  policy surface.

## Addendum (2026-07-26) - the umbrella policy now has a draft operator bundle, but it is still diagnostic

- A named draft operator artifact now exists at
  [docs/reviews/PERFORMANCE_READABILITY_OPERATOR_BUNDLE_2026-07-26.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/PERFORMANCE_READABILITY_OPERATOR_BUNDLE_2026-07-26.md).
- The draft packages the already-recorded live snapshot and the policy mapping
  into one readable surface, which makes the umbrella contract easier to
  review without re-reading the full trail.
- The artifact is still diagnostic only. It is not yet a public performance
  claim, and it still needs a clean representative-device capture before the
  repo can promote it to the canonical operator bundle.
- The missing pieces remain the same at the policy level: a visible budget
  table bound to final acceptance, a one-line fail-soft summary naming the
  exceeded threshold, and a single maintained mapping back to the specialized
  contract owners.

## Addendum (2026-07-29) - ADR-0039 keeps the public shell readable while the umbrella policy stays operator-facing

This umbrella baseline now sits alongside the browser-policy split named in
ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- acceptance/developer surfaces can carry `#runtime-diagnostics` and the
  budget-table style reasoning without turning the public HUD into an operator
  dashboard.

That keeps the baseline contract in the right layer: one maintainable policy
surface for operators, one clear public shell for the player.


## Addendum (2026-07-29) - the next baseline proof is one canonical budget table plus a fail-soft summary

- Re-read the umbrella baseline against the current visibility, camera, collision, accessibility, and KPI notes.
- The runtime already exposes enough diagnostic pressure to justify the umbrella policy as a real operator artifact, but the bundle is still only a draft.
- The next proof slice should therefore be one canonical budget table that says, for the live field snapshot, whether the app is within budget, degraded but acceptable, or fail-soft, and which threshold band is responsible when it is not within budget.
- The table should map directly back to the specialized contract owners rather than becoming a second hidden policy layer.
- The current KPI notes also make the remaining measurement gap explicit: actor count and active physics count still need to become first-class per-frame signals alongside the already-visible frame, draw, camera, and save metrics.
- Evidence depth: Tier 1 static synthesis from the current baseline, KPI, and operator-bundle notes. No new browser or benchmark command was run in this pass.

Anything else? Yes: the baseline is ready to be read as one policy, but not yet as one canonical operator table.

## Addendum (2026-07-29) - the operator table now has a precise measurement gap and owner map

- Re-read the umbrella baseline together with the operator-observability contract and the runtime KPI note.
- The next table should not just name the budget state; it should also say which owner is responsible for the exceeded threshold, so maintainers can trace the fallback back to the specialized contract instead of a vague global alarm.
- The current explicit measurement gap remains the same and should be called out in the table header or supporting note:
  - actor count,
  - active physics count.
- The practical shape is now clear enough for the next proof slice:
  - one canonical budget table,
  - one fail-soft summary naming the exceeded band,
  - one owner mapping back to the specialized contracts,
  - one explicit note that actor/physics remain first-class only after the runtime emits them directly.
- Evidence depth: Tier 1 static synthesis from the current baseline, KPI, and operator-observability notes.
