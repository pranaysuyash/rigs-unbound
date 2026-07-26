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

## Addendum (2026-07-25) - live resolution is real, but still phrased as action prose

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime already proves that world/capability mismatches are real:
  - a selection of `toy-buggy` followed by blade logic can still produce the
    deterministic denial `Spark carries no blade. Torque does.`
- That is enough to show the world surface is not hypothetical.
- What is still missing is the reusable resolver envelope the contract asks for:
  - explicit legal / deferred / impossible outcome codes,
  - a structured rejection record naming which side caused the mismatch,
  - a shared resolver entry point that behavior and activities can both call.
- So the repo has a real affordance language today, but it still encodes the
  resolution result in action prose rather than a first-class compatibility
  record.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-25) - Live resolution exists, but only as a diagnostic string

- The active runtime can already answer world-capability mismatches with a
  deterministic user-facing diagnostic.
- Example live denial after selecting the `toy-buggy` and invoking blade logic:
  `Spark carries no blade. Torque does.`
- That is enough to prove the world/capability surface is not hypothetical.
- It is not yet enough to prove a shared affordance resolver exists, because the
  outcome is still encoded as prose on the current action path rather than a
  reusable resolution record with legal / deferred / impossible outcome codes.

## Addendum (2026-07-26) - world offers are explicit, but resolution is still not a first-class record

- Re-checked the live source in `src/game/world.ts` and `src/game/state.ts`
  against the current browser daemon snapshot.
- The world surface is still genuinely affordance-shaped:
  - authored sites carry a `verb`,
  - workshop/service areas imply place-based offers,
  - capability checks in the state layer still decide whether the current rig
    can actually perform the action.
- The live browser surface remains healthy and still reports the same direct
  denial style when a rig/capability mismatch occurs.
- The important gap is unchanged:
  - no shared resolver record,
  - no explicit legal / deferred / impossible code path,
  - no telemetry field naming which side caused the mismatch in a structured
    way.
- So the world is already asking meaningful questions, but the answer is still
  emitted as action prose instead of a reusable affordance-resolution envelope.

## Addendum (2026-07-26) - the world is affordance-shaped, but the resolver is still prose-driven

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current source still makes the world legible as offers:
  - authored sites carry a `verb`,
  - workshop/service areas expose place-based interaction pressure,
  - `src/game/state.ts` still decides whether the active rig can satisfy the
    offer through capability checks.
- The runtime therefore already has a real affordance language:
  - the world says what it offers,
  - the rig says what it can do,
  - the state layer decides the result.
- What is still missing is the contract envelope around that decision:
  - no structured legal / deferred / impossible outcome code,
  - no reusable resolver record shared by behavior and activities,
  - no structured rejection payload naming which side caused the mismatch,
  - no affordance versioning or validation path.
- The useful boundary is still the same: the app already has a meaningful world
  vocabulary, but it is not yet a first-class affordance resolver that future
  planners can query as data.
