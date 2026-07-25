# World and Architecture Scalability Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s world-growth discussion into a named scalability contract so chunk growth, activity packs, migration boundaries, and shared-state readiness stay bounded and testable.

The repo already has local deterministic simulation, versioned recovery, and separate analysis/roadmap lanes. What it does not yet have is a first-class contract that says how the world grows without turning every new activity into a separate engine branch.

## Current evidence base

- Deterministic kernel and recovery:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- World/growth discussion and lane:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right local foundations:

- world state is deterministic and versioned,
- save/load already carries migration boundaries,
- the broader architecture already separates renderer, simulation, and persistence,
- the roadmap already names the world/architecture scalability lane.

That means scalability can be documented as a governed boundary instead of a speculative rewrite.

## What is still missing

The current surface still lacks:

- a world-scaling policy for chunk or region lifecycle,
- load-radius and unload-policy rules,
- migration boundaries for saved state and activity packs,
- observability for growth pressure or churn,
- a future-only boundary note for shared-state or online readiness,
- a clear statement that activity growth must remain packable rather than kernel-rewriting.

## Contract shape

A durable scalability contract should separate:

1. **World growth**
   - chunk or region lifecycle
   - load radius
   - unload policy
   - migration boundaries
2. **Activity growth**
   - activity pack validation
   - rollout and rollback
   - own-state boundaries
   - activation observability
3. **Architecture growth**
   - keep kernel order stable
   - keep growth measurable
   - keep new content out of the core branch structure
4. **Future readiness**
   - local deterministic play remains current mode
   - shared-state or online readiness remains future-gated

This keeps growth packable and measurable.

## Validation rules

The contract should fail visibly if it:

- grows the world without explicit lifecycle policy,
- lets activity packs mutate shared kernel assumptions,
- lacks rollback or churn visibility,
- assumes online/shared-state readiness before the product needs it,
- forces a kernel rewrite for new content,
- cannot explain which part of growth is local, replayable, or future-only.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one world-scaling policy for load radius, unload, and migration boundaries,
2. one pack or activity activation test with rollback,
3. one observability counter for growth pressure or churn,
4. one explicit future-only boundary note for shared-state or online readiness,
5. one proof that activity growth can be added without rewriting the kernel order.

## Open questions

- Which world unit should become canonical first: chunk, region, or activity pack?
- What observable metric best captures growth pressure for this project?
- Should shared-state readiness stay purely documented until a later authority lane proves it?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

This contract is not a promise of online play.
It is a boundary note that keeps local growth measurable until the product genuinely needs broader scale.

## Addendum (2026-07-25): live world scale remains intentionally compact

- Re-checked the current runtime and repository state after the scalability lane review.
- The live browser surface is still `Field 02`, and the current snapshot remains small and explicit rather than streamed:
  - 3 rigs
  - 7 authored sites
  - 1 discovery
  - 0 furrows in the sampled state
- The code still encodes a bounded world disc and bounded runtime memory, not a streaming region system:
  - `WORLD_RADIUS = 250`
  - `WORLD_LIMIT = 246`
  - `MAX_FELLED = 1500`
  - `MAX_COLLECTED_NODES = 2500`
- That means the contract is still correctly acting as a future scalability boundary, not a live chunk/region policy layer.
- Missing layers remain the same:
  - chunk or region lifecycle policy,
  - load/unload rules,
  - growth-pressure observability,
  - pack activation rollback,
  - future shared-state readiness.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code inspection.
