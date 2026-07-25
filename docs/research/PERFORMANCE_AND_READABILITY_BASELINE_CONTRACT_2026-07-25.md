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
