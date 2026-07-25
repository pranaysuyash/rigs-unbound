# Behavior System and Planner Contracts (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s current command-and-state flow into a named behavior/planner contract instead of a hidden future system.

The current runtime already has immutable intent capture, deterministic stepping, and explicit state mutation boundaries. What it does not yet have is a first-class behavior layer that chooses the next valid action without mutating state directly.

## Current evidence base

- Deterministic kernel and ordered state mutation:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Immutable command capture and run-record scaffolding:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
  - [src/game/run-record.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/run-record.ts)
- Capability/admission surface the planner would need to respect:
  - [docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)
- Roadmap lane for behavior/planner contracts:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the correct boundaries for a future behavior layer:

- commands are captured as explicit intent,
- the kernel is the only authority that mutates state,
- the run-record surface already preserves a bounded history of command/checkpoint/save entries,
- capability checks exist at the rig/profile level,
- world sites and verbs already give the planner a readable target surface.

That means a planner can be added without rewriting the simulation model.

## What is still missing

The current surface still lacks:

- a versioned behavior schema,
- a stable planner interface that returns candidates rather than mutating state,
- deterministic choice ordering for equal-score candidates,
- explicit rejection reasons when the required capability or affordance is missing,
- telemetry for branch selection and branch rejection,
- a declared budget for how much thinking a behavior step is allowed to spend.

## Contract shape

A durable behavior contract should separate:

1. **Trigger**
   - what caused the behavior to run,
   - what actor or machine owns the decision,
   - what world snapshot it can inspect
2. **Candidate generation**
   - available actions,
   - capability constraints,
   - affordance constraints,
   - budget constraints
3. **Scoring / choice**
   - deterministic priority order,
   - stable tie-break rules,
   - fallback selection when the preferred branch is invalid
4. **Decision result**
   - chosen action,
   - rejection reasons for losers,
   - telemetry keys for branch tracing

This keeps behavior as a decision layer, not a second world-authority layer.

## Validation rules

The contract should fail visibly if it:

- mutates state directly,
- produces different choices for the same fixed slice and seed,
- accepts a candidate that violates capability requirements,
- hides the reason a branch lost the decision,
- bypasses the kernel’s authoritative order,
- depends on wall-clock randomness instead of deterministic inputs.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned behavior schema,
2. one fixed-slice test proving a planner choice is deterministic,
3. one rejection test for a behavior candidate with missing capabilities,
4. one telemetry hook that records why a behavior branch lost the decision,
5. one explicit read-only contract showing behavior cannot mutate state directly.

## Open questions

- Should the first behavior example be an NPC-like route choice, a machine task selector, or an activity scorer?
- Should behavior telemetry live alongside run records, or in a separate debug trace?
- Should planner choice be deterministic by score then identifier, or by score then authored priority list?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already has command capture and a deterministic kernel. This contract
names the missing decision layer so future AI, NPC, and activity planners can
grow as readers of the world rather than silent co-authors of state.

## Addendum (2026-07-25) - Live command capture is present, planner layer is not

- Live browser evidence from `window.getRunRecordVerification()` returns
  `ok: true` with no issues.
- The current run record includes concrete `command`, `checkpoint`, `input`,
  and `save` entries, so the app already has durable observability for intent
  and outcome slices.
- The trace is still descriptive rather than predictive:
  - it records what happened,
  - it does not expose a first-class planner that enumerates candidates,
  - it does not yet emit deterministic branch-selection or branch-rejection
    telemetry as a separate behavior layer.
- That keeps this contract correctly placed: the next step is to add a
  versioned planner interface on top of the existing run record, not to replace
  the current command/state boundary.
