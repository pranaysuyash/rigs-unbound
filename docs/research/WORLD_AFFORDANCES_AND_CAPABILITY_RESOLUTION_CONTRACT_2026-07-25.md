# World Affordances and Capability Resolution Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s world-verb and capability surface into a named resolution contract before interactions become a pile of special-case branches.

The project already has world sites with verbs, workshop/service areas, rig capabilities, and runtime admission checks. What it does not yet have is a first-class affordance-resolution contract that says what the world offers, what a capability requires, and how the engine decides whether an interaction is legal, possible, or deferred.

## Current evidence base

- World sites and verbs:
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Rig capabilities and adapter families:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
- Capability admission surface:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Capability contract note:
  - [docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)
- Roadmap lane for affordance and content-validation gating:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the ingredients for a useful affordance surface:

- world sites expose verbs and service radii,
- sites already imply workshop and discovery affordances,
- rig profiles already express machine capability sets,
- capability checks already gate actual actions.

That means the world can already be read as an affordance surface, even if the resolution contract is not yet named.

## What is still missing

The current surface still lacks:

- a dedicated affordance schema,
- a deterministic resolution rule for world object + capability pairings,
- explicit legality / possibility / deferral outcomes,
- versioning and validation for affordance records,
- a place to record why a world offer was rejected,
- a shared resolver that behavior and activities can reuse.

## Contract shape

A durable affordance contract should separate:

1. **World affordance**
   - identifier
   - version
   - owning domain
   - constraints
   - budget impact
   - fallback posture
2. **Capability claim**
   - rig or machine capability
   - adapter family
   - current state / version
   - prerequisites
3. **Resolution outcome**
   - legal
   - possible but deferred
   - impossible
   - fallback suggested
4. **Telemetry**
   - outcome code
   - rejection reason
   - whether the world or the capability caused the mismatch

This keeps capability checks from being buried inside activity-specific branches.

## Validation rules

The contract should fail visibly if it:

- treats a world verb as a guarantee,
- lets capability or affordance data drift out of version sync,
- hides why a resolution failed,
- allows a machine to act against an incompatible affordance,
- makes behavior or activity code the only place compatibility is checked,
- resolves interactions non-deterministically.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one affordance schema with version and owning-domain fields,
2. one resolver that returns legal / deferred / impossible outcomes,
3. one rejection reason surfaced for an incompatible capability claim,
4. one test proving a world verb and capability pair resolve deterministically,
5. one telemetry field naming which side caused the mismatch.

## Open questions

- Should world affordances be authored in world data, capability data, or both?
- Should the first resolver target `workshop`, `tow`, `survey`, or `plough`?
- Should mismatch telemetry be visible to the player, the operator, or both?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already uses the world as a set of readable offers.
This contract names the resolution step so behavior, activities, and future
machines can ask the same question and get the same answer.

## Addendum (2026-07-25) - Live resolution exists, but only as a diagnostic string

- The active runtime can already answer world-capability mismatches with a
  deterministic user-facing diagnostic.
- Example live denial after selecting the `toy-buggy` and invoking blade logic:
  `Spark carries no blade. Torque does.`
- That is enough to prove the world/capability surface is not hypothetical.
- It is not yet enough to prove a shared affordance resolver exists, because the
  outcome is still encoded as prose on the current action path rather than a
  reusable resolution record with legal / deferred / impossible outcome codes.
