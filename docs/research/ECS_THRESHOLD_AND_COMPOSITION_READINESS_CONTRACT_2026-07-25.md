# ECS Threshold and Composition Readiness Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s ECS discussion into a named threshold contract so entity composition, capability bundles, and migration triggers remain proof-based instead of becoming an assumed architecture rewrite.

The current codebase is data-driven and module-organized, with deterministic state, adapter boundaries, and versioned persistence. That is a strong platform shape, but it is still not ECS. This contract says exactly when that should matter.

## Current evidence base

- Core simulation and adapters:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
  - [src/game/physics.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/physics.ts)
- World and runtime organization:
  - [src/game/gameworld.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/gameworld.ts)
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- Canonical analysis and rollout order:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the ingredients ECS would eventually organize:

- deterministic state and controlled mutation order,
- capability and module composition in data rather than inheritance,
- typed adapter boundaries around the core machine model,
- versioned persistence and recovery hooks,
- a roadmap that already treats ECS as a proof-based migration decision.

That means ECS should be documented as a threshold, not as a new identity for the project.

## What is still missing

The current surface still lacks:

- a quantified actor-count or coupling threshold that justifies ECS migration,
- a canonical composition schema for entities with multiple capabilities,
- a validation rule that rejects invalid capability bundles before runtime,
- a migration proof that preserves identity through composition change,
- an explicit statement that ECS serves the machine-centric model rather than replacing it,
- visibility into when the current adapter model has crossed its useful limits.

## Contract shape

A durable ECS readiness contract should separate:

1. **Composition now**
   - entity identity stays stable,
   - capabilities remain explicit data,
   - adapters remain canonical,
   - invalid bundles fail before runtime.
2. **Migration trigger**
   - define actor-count, simulation-graph, or cross-system coupling thresholds,
   - only move when a measured threshold is exceeded.
3. **Migration behavior**
   - preserve identity,
   - preserve event visibility,
   - preserve save compatibility or declare a versioned boundary.
4. **Future ECS role**
   - ECS should make machine/capability composition easier,
   - not become a hidden layer that obscures player-facing behavior.

## Validation rules

The contract should fail visibly if it:

- adopts ECS for style rather than proof,
- breaks entity identity during composition migration,
- accepts invalid capability bundles,
- hides system ownership behind a generic ECS layer,
- rewrites the current adapter model without a measured threshold,
- cannot explain which game pressure forced the migration.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one composition schema for an entity with multiple capabilities,
2. one validation rule that rejects an invalid capability bundle,
3. one test proving component migration preserves identity,
4. one threshold note stating when ECS would become justified.

## Open questions

- What measured actor-count or coupling threshold would actually justify ECS here?
- Which identity fields must survive a composition migration unchanged?
- Should the first proof slice stay purely data-validation based, or include a small runtime adapter shim?

## Linked artifacts

- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

ECS is a future option, not a current requirement.
The right long-term goal is to keep the machine-centric composition model explicit until real scale pressure proves a stronger structural need.

## Addendum (2026-07-25) - Live scale does not yet justify ECS

- Live browser evidence shows the current playable surface is still compact:
  - 3 rigs
  - 7 authored sites
  - 1 discovery
  - 0 furrows on the current snapshot
- The code structure matches that live scale:
  - explicit rig profiles,
  - explicit world-site records,
  - bounded world-memory sets,
  - no broad entity zoo that would force ECS to reduce coupling pressure.
- That means ECS remains correctly classified as a future migration threshold,
  not an immediate architecture requirement.
- The current useful standard is still machine-centric composition with explicit
  adapters and versioned persistence, revisited only when measured pressure
  proves the threshold has been crossed.
