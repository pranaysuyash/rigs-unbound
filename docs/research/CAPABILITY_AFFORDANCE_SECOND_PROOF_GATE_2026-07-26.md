# Capability and Affordance Second-Proof Gate

**Date:** 2026-07-26  
**Status:** First real capability-to-world proof is active; general expansion is staged  
**Evidence tier:** Tier 1 - static source and test-source inspection. No test, build, browser, or runtime command was run in this pass.

## Decision

Preserve the existing capability/affordance resolver as the single canonical compatibility boundary. Do not build a universal interaction framework, ECS migration, or arbitrary data-driven capability interpreter until a second real world offer proves which additional constraints the current contract needs.

The next interaction must extend this boundary, not introduce `if (rig.id === ...)`, direct UI mutation, or activity-specific compatibility code.

## Current proof

The active relay-cargo flow already has the correct narrow shape:

```text
world offer declares `tow`
  -> effective rig profile claims capabilities
  -> resolveAffordance()
  -> legal | deferred | impossible result with reason/mismatch source
  -> validated primary action command
  -> authoritative state transition and presentation response
```

| Source                                             | Current responsibility                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `src/game/affordances.ts`                          | Versioned affordance definition, capability claim, availability, and deterministic resolution.            |
| `src/game/state.ts`                                | Resolves relay availability/range, turns the result into a primary-action outcome, and owns any mutation. |
| Effective rig profile in the state/contracts layer | Composes module and rig capability claims.                                                                |
| `src/game/affordances.test.ts`                     | Documents legal, incompatible, and out-of-range resolver outcomes.                                        |

The result intentionally distinguishes:

- `offer-unavailable`: the world is not currently offering the interaction;
- `missing-capability`: the machine claim is incompatible;
- `out-of-range`: a compatible machine can satisfy the offer after movement;
- `ready`: the action is permitted now.

That distinction is important for UI copy, replay diagnostics, future authority validation, AI proposals, and accessible feedback. It prevents a missing module from being confused with a world-state failure.

## What is deliberately not generalized yet

The current definition requires one capability and availability/range facts. It does not yet model:

- capability parameters such as tow mass, attachment type, battery, cargo capacity, or tool width;
- multiple required capabilities;
- mutually exclusive capability alternatives;
- semantic world affordances such as `harvestable`, `repairable`, `dockable`, or `buildable-surface`;
- activity-level requirement sets and reward/score rules;
- persisted affordance state or content-pack ingestion.

Those are valid future needs, not evidence that the first proof is wrong. Adding them pre-emptively would turn a clear contract into a speculative schema with no second consumer.

## Admission rule for the second proof

The next real interaction qualifies only if all of the following are true:

1. It is a player-visible world offer, not a UI-only permission check.
2. It can reuse the canonical effective-rig capability claim.
3. It must produce a legal/deferred/impossible outcome that UI, replay, and future authority can interpret.
4. Its availability facts have one clear authoritative owner in simulation/world state.
5. It has a safe no-capability and out-of-range behavior.
6. It has focused deterministic test coverage before a broader schema is extracted.

Candidate domains include field operation, repair, docking, construction, scanning, or recovery only when one is a genuine playable offer. A new vehicle type alone is not sufficient justification.

## Expansion rules after the second proof

If the second proof demonstrates a real shared constraint, evolve the existing contract in place:

- Add versioned parameters only for constraints used by both offers.
- Keep constraints semantic and validated, not arbitrary callback names or booleans.
- Let activities declare requirement sets; do not let activities own core physics or renderer behavior.
- Keep commands as intent, resolver output as validation evidence, state transitions as authority, and renderer/audio/UI as observers.
- Version any persisted affordance instance before it can enter saves, replays, generated content, or future network messages.

## Prohibited shortcuts

- `vehicle.type` or rig-ID allowlists inside an activity.
- A renderer, UI component, or audio callback directly attaching cargo, changing rewards, or mutating world state.
- A second independent capability checker that can disagree with `resolveAffordance()`.
- Generic JSON callbacks or unvalidated script names used as capability behavior.
- Claiming every existing action is already an affordance merely because it has a button.

## Long-term outcome

This gate keeps the product’s central abstraction intact: a rig is a machine with composed capabilities, and world/activity content offers compatible affordances. It enables tractors, skimmers, drones, stationary machines, and future tools to enrich the same simulation without forcing inheritance trees or activity-specific engine branches.

## Closure trigger

Replace this staged gate with a versioned multi-offer contract only after two independently useful world interactions share a demonstrated additional constraint. Until then, the current narrow resolver is the more durable architecture.

## Anything else?

Yes: any future planner, generated mission, or shared-world request must consume the resolver result rather than reimplement compatibility checks. No second live affordance consumer was evidenced in this pass.
