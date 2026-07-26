# Engine Branch Evaluation and Alternate Backend Gating Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s “alternate backend” discussion into a named evaluation contract so Three.js stays the canonical v1 path unless measurable pressure justifies a bounded comparison branch.

The current architecture already has enough structure to compare render backends if it ever has to. What it does not yet have is a first-class rule for when a branch is allowed, what it must compare, and why it must remain disposable unless evidence says otherwise.

## Current evidence base

- Canonical render path and performance posture:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
  - [docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
  - [docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- Readability and fallback policy:
  - [docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
  - [docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md)
- Roadmap lane for engine branch evaluation:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has a strong canonical path:

- Three.js is the current renderer path,
- performance and readability thresholds are already named,
- fallback behavior is already part of the policy stack,
- benchmark-style comparison can be measured using the existing threshold and KPI artifacts.

That means an alternate backend is a gated comparison, not an open-ended rewrite.

## What is still missing

The current surface still lacks:

- an explicit canonical-path note naming Three.js as default v1,
- a bounded benchmark branch definition with a stop condition,
- a measurable trigger for evaluating an alternate backend,
- a comparison checklist that uses the same contracts,
- a decision record template for acceptance or rejection,
- a disposal rule that keeps the benchmark branch from becoming a second product path.

## Contract shape

A durable engine-branch contract should separate:

1. **Canonical path**
   - Three.js remains default v1
   - no migration claim without evidence
2. **Trigger**
   - measurable budget failure
   - platform constraint
   - renderer capability gap
3. **Benchmark branch**
   - bounded in time and scope
   - disposable unless evidence justifies migration
4. **Comparison contract**
   - same culling thresholds
   - same LOD tiers
   - same camera policy
   - same collision semantics
   - same lighting/readability requirements
   - same observability and recovery visibility

This keeps comparison grounded in product constraints rather than taste.

## Validation rules

The contract should fail visibly if it:

- starts a branch without a measurable trigger,
- compares the alternate backend against a different scene or contract set,
- lets the benchmark branch become a shadow product path,
- ignores the canonical Three.js path,
- fails to define a stop condition,
- cannot explain why the branch was accepted or rejected.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one explicit canonical-path note naming Three.js as default v1,
2. one bounded benchmark branch definition with a stop condition,
3. one measurable trigger for evaluating an alternate backend,
4. one contract-comparison checklist for the benchmark branch,
5. one decision record template for branch acceptance or rejection.

## Open questions

- What measurable pressure would justify the first alternate-backend benchmark branch?
- Should the branch compare only render cost or also loading and recovery behavior?
- Should the acceptance decision live in an ADR or a benchmark report?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

Three.js remains the canonical path until evidence says otherwise.
This contract keeps any alternate backend comparison short, measurable, and
disposable.

## Addendum (2026-07-26) - the canonical path is explicit, but the measurable branch trigger is still missing

- Re-checked the engine-branch contract against the current repo state and the
  live runtime posture.
- The contract now has the right hard boundary:
  - Three.js remains the canonical v1 path,
  - alternate backends remain comparison branches, not shadow products.
- What is still missing is the trigger that would justify opening that branch:
  - no named measurable pressure threshold that currently demands an alternate
    backend comparison,
  - no branch-opening evidence bundle,
  - no stop-condition artifact tied to a specific benchmark run,
  - no acceptance/rejection decision record for a live comparison branch.
- The correct next proof is therefore not a new renderer path; it is a bounded
  benchmark trigger definition that can say when the comparison branch is
  allowed to exist at all.
- Evidence depth: Tier 1 static contract inspection, with the existing live
  runtime/posture evidence unchanged.
