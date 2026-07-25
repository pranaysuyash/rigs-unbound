# Authority Model Groundwork Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s local-first deterministic simulation into a named authority contract so shared-state and server-authoritative behavior remain future-gated instead of assumed.

The current runtime already captures commands, runs a deterministic kernel, and persists local state with versioned recovery. What it does not yet have is a first-class authority model that defines how durable world changes should be validated, accepted, rejected, and recovered when an authority layer is eventually introduced.

## Current evidence base

- Command capture and browser wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Deterministic kernel and state mutation:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Local persistence and recovery:
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- Authority lane in the roadmap:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right local-first posture:

- commands are explicit,
- the kernel mutates canonical state in a deterministic order,
- saves are versioned and recoverable,
- local play does not depend on remote infrastructure.

That means authority can be introduced as a boundary instead of a rewrite.

## What is still missing

The current surface still lacks:

- a local-first authority note with explicit future-only shared-state wording,
- authenticated mutation request/response shapes,
- a reject path that leaves speculative local state unchanged,
- durable-value recovery metadata,
- telemetry for authoritative outcomes,
- a clear statement that shared-state or server-authoritative behavior is not current mode.

## Contract shape

A durable authority contract should separate:

1. **Intent**
   - request from local simulation, input, or AI
   - what is being asked
2. **Validation**
   - identity
   - capability
   - world state
   - conflict detection
3. **Authority decision**
   - accepted
   - rejected
   - deferred
   - recovery required
4. **Durable mutation**
   - write to canonical state
   - preserve recovery metadata
   - keep speculative state separate
5. **Visibility**
   - telemetry
   - operator-visible reason for reject or accept

This keeps current local play responsive while making the future authority boundary explicit.

## Validation rules

The contract should fail visibly if it:

- lets durable state be changed without authority validation,
- confuses speculative local state with accepted durable state,
- hides reject reasons,
- loses recovery metadata,
- assumes shared-state or server authority before the product needs it,
- allows a reject to mutate local speculative state as if it were accepted.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one local-first authority note with explicit future-only shared-state wording,
2. one authenticated mutation request/response shape,
3. one reject path that leaves local speculative state unchanged,
4. one durable-value recovery note,
5. one telemetry field that identifies the authoritative mutation outcome.

## Open questions

- Which durable mutation should be the first authority-shaped proof: save, repair, or a module install?
- Should authority telemetry live in the HUD or only in logs/debug surfaces?
- Should the request/response shape be shared across future network and local replay paths?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

Local deterministic play remains the canonical current mode.
This contract keeps the future authority boundary legible so durable world
changes can be validated without collapsing speculative input into truth.
