# Behavior System and Planner Contract (2026-07-26)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Make the current affordance resolver and primary-action pipeline explicit so the
repo can tell the difference between:

- a deterministic single-step resolver,
- a future multi-candidate planner,
- and a generic AI policy layer.

The live code already has real semantic resolvers for multiple offers and a
single contextual-action resolution path. That is strong evidence for a
behavior boundary. It is not yet a general planner.

## Current evidence base

- Affordance resolver:
  - [src/game/affordances.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/affordances.ts)
- Primary-action resolution:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Existing affordance contract note:
  - [docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md)

## What is already there

The current behavior path already has several planner-like properties:

- the world offer is named and versioned,
- the rig claim is derived from composed capabilities,
- the resolver is deterministic,
- the outcome is structured as `legal`, `deferred`, or `impossible`,
- primary action resolution consumes the structured result instead of a callback,
- the action path remains replay-safe and player-facing.

That is enough to prove a real behavior contract exists.

## What is still missing

The repo still lacks a named policy for:

- multi-candidate planning,
- candidate scoring and tie-breaking,
- planner-owned branch traces,
- versioned behavior schema for multi-candidate decision surfaces,
- generic plan execution separate from the immediate action resolver,
- structured fallbacks when several offers are simultaneously valid.

The current code can answer one contextual question well. It cannot yet plan
across several competing actions as a reusable domain service.

## Contract shape

The next behavior layer should separate:

1. offer discovery
2. candidate validation
3. candidate scoring
4. deterministic tie-breaking
5. execution trace
6. user-facing diagnosis

Suggested planner-facing fields:

- planner id
- planner version
- candidate list
- scores
- rejection reasons
- chosen candidate
- tie-break rule
- execution trace

## Validation rules

The contract should fail visibly if it:

- mutates state before candidate selection is complete
- chooses different candidates for equal inputs without a declared rule
- hides a rejected candidate's reason code
- re-implements capability checks in multiple subsystems
- turns the primary-action resolver into a hidden planner
- claims generic planner coverage without a multi-candidate proof

## Near-term proof slice

The smallest durable proof for this contract is:

1. one multi-candidate selector over the existing affordance boundary,
2. one deterministic tie-breaking rule for equal-score candidates,
3. one planner trace that records the rejected and chosen candidates,
4. one test for equal-input stability,
5. one documented fallback when no candidate is valid.

## Open questions

- Should the first behavior selector compare survey, repair, or another world
  interaction?
- Should tie-breaking prefer proximity, capability strength, or explicit
  priority order?
- Should planner traces stay in the run record or live in a separate behavior
  audit stream?

## Linked artifacts

- [WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already has a real affordance resolver and a primary-action outcome
path. This contract makes clear that those are still the foundation, not a
general planner. The next step is to add a multi-candidate decision proof
before inventing a broader planning abstraction.

## Addendum (2026-07-26) - the resolver is real, and the planner is still future-bound

- Re-checked the live source instead of treating the contract as hypothetical.
- `src/game/affordances.ts` now provides the real versioned affordance contract
  and deterministic resolver:
  - `AFFORDANCE_CONTRACT_VERSION = 1`
  - `legal`, `deferred`, `impossible`
  - `ready`, `out-of-range`, `missing-capability`, `offer-unavailable`
  - mismatch ownership across world/capability/null
- `src/game/state.ts` consumes that resolver in `resolvePrimaryAction(...)`,
  which means the current gameplay already has one structured, replay-safe
  behavior boundary.
- What is still missing is the planner layer:
  - no multi-candidate selection,
  - no tie-break trace,
  - no generic behavior schema,
  - no multi-candidate proof yet.
- So the right interpretation is narrow and durable: the app already has a real
  behavior contract, but the planner remains a deliberate future boundary.
