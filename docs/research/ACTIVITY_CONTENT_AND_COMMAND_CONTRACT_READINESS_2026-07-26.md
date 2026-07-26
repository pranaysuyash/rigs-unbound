# Activity, Content, and Command Contract Readiness (2026-07-26)

## Skill consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Establish what Rigs Unbound already proves about machine composition and
activity logic, and name the exact threshold for turning the present typed game
rules into validated activity/content contracts. This prevents two opposite
failures:

- baking every future activity into the simulation kernel, and
- building an unproven generic plugin, JSON, or ECS layer for one activity.

## Static evidence reviewed

- `src/game/contracts.ts`
  - defines typed rig profiles, module definitions, capability lists, cargo
    relay state, and authored activity anchors;
  - derives effective rig behavior by composing installed modules over an
    immutable rig blueprint.
- `src/game/affordances.ts`
  - resolves a world offer against a machine capability claim with structured
    legal, unavailable, and missing-capability outcomes.
- `src/game/state.ts`
  - resolves contextual player intent before mutation;
  - owns the cargo relay state machine and strict save-state consistency checks;
  - applies the resolved primary action directly to state and `GameWorld`.

Evidence level: Tier 1 static inspection. This note does not claim browser,
replay, or content-ingestion validation.

## What is already sound

### Composition rather than rig-name inheritance

`effectiveProfile()` derives capabilities and traversal behavior from a rig
blueprint plus installed modules. Existing interaction code asks whether the
effective profile has `plough`, `tow`, `winch`, or another capability; it does
not branch on a display-name taxonomy. This is the correct starting shape for a
machine-centric product.

### One real capability-affordance proof

The relay cargo offer requires `tow`. `resolveAffordance()` distinguishes a
legal interaction, an unavailable offer, a range failure, and an incompatible
machine. That gives UI and mutation code a shared compatibility result rather
than letting each surface reimplement the rule.

### Activity state is guarded on restore

The cargo relay has a coherent `ready` -> `active` -> `complete` state machine.
Save recovery rejects contradictory combinations of timing, attachment, and
delivery state rather than restoring an activity that cannot complete.

### Content remains code-authored while it is small

Three rig profiles, six modules, one activity, and the current authored field
are a small enough surface for typed TypeScript tables. Treating these tables as
trusted authored content is simpler and safer than introducing a weak external
data loader before there is a second real content pack.

## Current architectural boundary

The project does **not** yet have independently validated activity or content
definitions:

- `CargoRelayState` is save state, but not an `ActivityDefinition` with rules,
  requirements, rewards, and versioning.
- Activity anchors such as pickup and delivery positions are typed constants
  beside the state contract, not references resolved from a manifest.
- `performPrimaryAction()` correctly resolves an intent first, but then mutates
  `GameState` and `GameWorld` directly. There is no general command validation
  result or domain-event output for an activity action.
- `RigCapability` is currently a useful closed union, but capabilities do not
  yet declare their own version, parameter schema, actions, validation rules,
  adapter, or telemetry contract.
- Save schema migration is versioned, while rig, module, capability, activity,
  and authored-content definitions have no independent compatibility version.
- There is no raw-content ingestion path, schema validator, reference resolver,
  or semantic validator. This is appropriate only while content remains in
  trusted code.

These are real future boundaries, not evidence of a hidden data-driven system.

## Ownership rules to preserve

| Domain | Owns | Must not own |
|---|---|---|
| `GameWorld` | terrain, spatial affordances, durable world deltas | mission scoring or UI decisions |
| capability contract | reusable machine action constraints | a particular activity's reward/pacing |
| activity contract | objectives, requirements, state transition rules, rewards | terrain/physics implementation |
| command boundary | player/AI/network intent and validation result | rendering behavior |
| event boundary | immutable record of accepted transition | authoritative state mutation |
| storage | serialization and migration | gameplay policy |
| renderer, audio, UI | interpretation of snapshots and events | direct authoritative mutation |

## Deliberately deferred implementation

Do not add a generic activity registry, arbitrary JSON loader, capability
plugin host, or event bus solely to represent the cargo relay. That would add a
parallel abstraction without a third use case and would weaken the current
typed validation path.

The current direct primary-action path is acceptable for the one proven
activity, provided it remains isolated and does not become the default pattern
for unrelated activities.

## Addendum (2026-07-26) - canonical authored references now feed the rumor map

The visible rumor map previously repeated site coordinates and described the
active cargo relay as a Home Silo-to-Quarry route even though the canonical
delivery target is Long Furrow. The graph now derives all site identity and
spatial facts from `WORLD_SITES`, and its relay placement/arrival edge from
`CARGO_PICKUP` plus the delivery site's canonical reference. Graph-specific
descriptions, capability gates, and relationship edges remain local metadata.

This is the intended content ownership split: authored world/activity contracts
own facts; a presentation projection owns only how those facts are connected
and explained. The change is source/test implemented but unexecuted in this
pass (Tier 1).

## Trigger for the first coherent refactor

Start the refactor when a third activity with materially different
requirements is approved, for example a timed survey route, field operation,
or repair contract. The resulting first stage must migrate both activities;
wrapping only the new one would create three activity truth paths.

### Stage 1: typed definitions, not untrusted data

Introduce a small, immutable `ActivityDefinition` registry in TypeScript with:

- stable `id` and `version`,
- objective and completion rules,
- capability requirements expressed as constraints rather than rig ids,
- authored world references,
- reward and failure policy,
- a state initializer and semantic validator.

Definitions must be validated at boot for duplicate ids, unknown capability
references, missing world anchors, impossible requirement combinations, and
unsupported versions.

### Stage 2: command -> validate -> transition -> event

Replace direct activity mutation with an explicit flow:

```text
Input / AI / future network request
  -> ActivityCommand
  -> validation against state, capability, and world affordance
  -> authoritative transition
  -> immutable domain event
  -> state snapshot, run record, renderer/audio/UI response
```

Commands express intent; events describe accepted outcomes. Neither rendering
nor UI may write activity state directly. The initial command/event slice should
cover the migrated cargo relay and the third activity only.

#### Current first proof

The cargo relay primary action now supplies a narrower local proof before the
three-activity registry refactor: a versioned actor command is validated, the
existing transition runs through `GameState`, and an immutable accepted or
rejected outcome is captured by the run record. This does not change the
three-activity requirement for generalizing activity definitions; it verifies the
command ownership seam that both future activities must reuse.

### Stage 3: external content only after the typed registry proves stable

If mods, authored packs, procedural generation, or remote content become real,
add this ingest path before runtime activation:

```text
raw content
  -> structural schema validation
  -> reference resolution
  -> semantic validation
  -> normalization
  -> immutable runtime definitions
```

Generated or downloaded content remains untrusted until this process succeeds.
It may not mutate world state directly.

## Required proof and observability

The first activity-contract delivery is acceptable only when it supplies:

1. Tier 2 tests for two activities using the same requirement matcher without
   rig-name checks.
2. Tier 2 tests for invalid capability, missing anchor, incompatible version,
   impossible objective, and rejected command paths.
3. A versioned event payload captured in the run record for one accepted and one
   rejected activity command.
4. Tier 3 browser evidence that the migrated cargo relay and third activity
   show the same outcome after save/load.
5. Operator-visible diagnostics for validation rejections, state transitions,
   and content compatibility failures.

## Decision

Preserve the current typed, single-activity implementation and its strict save
validation. Build the generic boundary only as the first coherent refactor of
three real activities. This is the long-term path because it generalizes stable
contracts and ownership, while keeping vehicle feel, camera behavior, pacing,
and authored landmarks deliberately specific.

## Addendum (2026-07-26) - the affordance proof is real, so the three-activity gate stays the right boundary

- Re-checked the current activity/command surface against the live resolver and
  state code.
- `src/game/affordances.ts` now provides a versioned, deterministic resolver
  with `legal`, `deferred`, and `impossible` outcomes for the relay-cargo/tow
  interaction.
- `src/game/state.ts` still treats that as a contextual command-resolution
  seam, not a general activity registry.
- That means the repo now has a real structured proof for one activity seam,
  but it still does **not** have:
  - a versioned `ActivityDefinition` registry,
  - a second materially different activity using the same matcher,
  - a generic command -> validate -> transition -> event pipeline for multiple
    activities,
  - content ingestion / semantic validation for untrusted packs.
- The useful boundary is therefore unchanged:
  - keep the current typed single-activity model,
  - defer the generic registry until a second real activity exists,
  - treat the live affordance resolver as the proof that the seam is worth
    generalizing later, not as a reason to generalize immediately.
- Evidence tier: Tier 1 static inspection plus earlier recorded runtime notes.

## Addendum (2026-07-26) - the command outcome seam is now real, and the generic activity registry now waits on a third offer

- Re-checked `src/game/state.ts`, `src/game/affordances.ts`, and the current
  activity-command path against the live repo state.
- The current runtime now proves the command/affordance seam is not just
  conceptual:
  - a versioned affordance record resolves to legal / deferred / impossible,
  - the primary-action path captures a structured accepted/rejected outcome,
  - the run record can observe that outcome without becoming the authority.
- That is enough to justify keeping the typed, single-activity model as the
  canonical boundary for now.
- What is still intentionally missing is a third materially different
  activity that would prove the generic registry shape:
  - no third activity uses the same matcher,
  - no shared `ActivityDefinition` registry has earned the runtime beyond the
    existing two activities,
  - no content-ingestion path should be generalized yet.
- So the repo now has a real command-outcome seam, but the long-term refactor
  should still wait until a third activity proves the same pattern instead of
  forcing the current three-activity seam to pretend it is already a platform.
- Evidence depth: Tier 1 static source inspection. No browser or test execution
  was run in this update.

## Addendum (2026-07-26) - the primary-action path now proves a local command outcome, but still only for one proven activity seam

- Re-checked `src/game/state.ts` and `src/main.ts` after the command executor
## Addendum (2026-07-26) - episode grammar composes above activity contracts, not instead of them

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this contract, not beneath it.
- This activity/content readiness note still owns the lower-level threshold:
  a second materially different activity must prove the same matcher and
  command/event seam before a generic activity registry is justified.
- The episode grammar simply names how place, rig identity, pressure,
  discovery, and consequence combine into a single authored episode once the
  lower-level activity contracts are already valid.
- In other words: activity contracts own objective/requirement/reward
  validation; episode grammar owns how those activities are composed into a
  richer playable story.
  landed.
- The current primary-action path is now a real versioned command boundary:
  - `resolvePrimaryAction()` picks a semantic action before mutation,
  - `executePrimaryActionCommand()` validates the versioned command and returns
    a structured accepted/rejected outcome,
  - `performPrimaryAction()` remains the compatibility entrypoint and now
    returns that same event,
  - browser call sites capture the accepted/rejected event in the bounded run
    record.
- That is a real proof slice for one activity seam, not a generic activity
  registry.
- The remaining boundary is still the same:
  - only the proven relay/primary-action seam uses the shared outcome shape,
  - there is still no second materially different activity using the same
    matcher,
  - the generic `ActivityDefinition` registry should still wait for the second
    activity proof.
- Evidence tier: Tier 1 static source inspection. No browser/test execution was
  run in this pass.

## Addendum (2026-07-26) - the next activity proof is still the third use case, with tow-plus-repair as the strongest candidate

- Re-checked the current activity seam against the live command/state spine.
- The repo still has one proven activity boundary and no second materially
  different activity in the runtime.
- The strongest next candidate is a tow-plus-repair rescue flow because it can
  reuse the current affordance matcher while introducing a different objective
  shape, different failure mode, and different recovery story.
- That does not justify a generic planner yet; it only sharpens the next
  activity proof slice.
- The generic `ActivityDefinition` registry should still wait until that second
  activity exists and can prove the same command/result pattern.
- Evidence depth: Tier 1 static source inspection.
