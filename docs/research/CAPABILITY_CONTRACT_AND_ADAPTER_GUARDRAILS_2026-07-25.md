# Capability Contract and Adapter Guardrails (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current rig capability vocabulary into a named contract surface instead of a typed convenience layer.

The repo already uses capability-aware rig profiles, attachment/tool slots, and action admission checks. That is a strong foundation. What it does not yet have is a first-class capability contract that says:

- what a capability is,
- how it is versioned,
- how it binds to a simulation adapter,
- how it reports failure,
- and how world-facing affordances resolve against it.

## Current evidence base

- Rig profiles and capability unions:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
- Capability checks, profile resolution, and primary-action gating:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- World-site verbs and workshop/service data:
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Long-term execution lane for capability formalization:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the beginnings of a capability system:

- `RigCapability` is a real domain type, not a loose string bag.
- `RigProfile.capabilities` already expresses machine-level affordances.
- `MobilityAdapter` already distinguishes ground and hover motion families.
- `hasCapability(...)` already acts as a runtime admission gate.
- World sites already expose verbs, workshop flags, and service radii that behave like affordance seeds.

That means the product is past the “everything is hardcoded” stage.

## What is still missing

The current surface still lacks:

- a `CapabilityDefinition` schema with id/version/requirements/actions/state/telemetry,
- a `MachineCapabilityState` envelope for mutable capability-specific state,
- a validator that rejects unknown or unsupported adapters,
- explicit admission reason codes when a capability is not available,
- a clear contract for how world affordances resolve against capability claims,
- per-capability versioning and migration rules,
- a registry that keeps simulation adapters canonical instead of ad hoc.

## Contract shape

A durable capability contract should separate:

1. **Capability definition**
   - id
   - version
   - requirements
   - actions
   - state schema
   - telemetry keys
   - failure modes
2. **Capability instance**
   - which rig/module/entity owns it
   - current mutable state
   - adapter binding
   - versioned payload
3. **Admission result**
   - allowed / denied
   - reason code
   - operator-visible explanation
   - fallback or recovery hint
4. **World affordance resolution**
   - what the world offers
   - what the capability requires
   - whether the interaction is legal, possible, or deferred

This is the layer that keeps future motion families, tools, and interaction types from becoming one-off `if` chains.

## Validation rules

The contract should fail visibly if it:

- claims a capability with no adapter implementation,
- accepts an unknown capability id,
- binds a capability to the wrong mobility family,
- lets an activity request an action the rig cannot actually perform,
- hides admission failure without a reason code,
- mutates capability state without version metadata,
- treats a world verb as a guarantee when the rig cannot satisfy the affordance.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned `CapabilityDefinition` schema,
2. one adapter registry check,
3. one explicit admission-denial reason code path,
4. one capability-state payload version field,
5. one world-affordance resolution example tied to a real rig/action pair.

## Open questions

- Which should be the canonical first capability contract: `tow`, `plough`, `survey`, or `hover`?
- Should capability failure be surfaced in the HUD, a debug panel, or both?
- Should affordance resolution live in world data, capability data, or a shared resolver module?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The capability layer is already strong enough to support the next expansion step.
This contract makes the boundary explicit so future rigs, modules, and interaction
systems can grow without silently turning capability checks into brittle
branching logic.

## Addendum (2026-07-25) - Live admission is boolean plus prose, not a structured envelope

- Live browser evidence on the active runtime shows `hasCapability(...)` is a
  real boolean gate, and the `window` hooks still expose the capability-bearing
  rigs.
- A denied action currently yields a prose diagnostic such as
  `Spark carries no blade. Torque does.` rather than a structured admission
  payload with versioned reason codes.
- That means the capability contract is correctly identified as a next-step
  contract: the runtime already knows how to reject, but it does not yet
  standardize the rejection envelope for downstream planners or telemetry.

## Addendum (2026-07-25) - Capability composition is live; adapter governance is still implicit

- `src/game/contracts.ts` already composes profile capabilities from base rig
  profiles and fitted modules, so the runtime is not using a brittle
  inheritance-only model.
- `src/game/state.ts` already consumes that composed profile through
  `hasCapability(...)`, `effectiveProfile(...)`, and the action gates that check
  `plough`, `tow`, `jump`, and `winch` availability.
- The live runtime therefore proves the _composition_ half of the contract, but
  the adapter-governance half is still implicit:
  - there is no versioned capability-definition registry,
  - there is no structured adapter registration envelope,
  - and the player-facing denial path still only emits prose diagnostics.
- This keeps the lane in the right category:
  - capability contracts are real,
  - capability governance is still a named gap,
  - and the next durable step is to formalize the adapter registry and explicit
    denial envelope without flattening the current profile/module composition
    model.

## Addendum (2026-07-26) - fresh source recheck, composition still leads and governance still needs structure

- Re-checked the live source in `src/game/contracts.ts` against the current
  capability lane.
- The current rig model still clearly remains composition-first:
  - `RigCapability` is a real domain type,
  - `RIG_PROFILES` carries explicit capability arrays,
  - `marsh-skimmer` is still a distinct hover-family profile rather than a
    hardcoded exception.
- The player-facing boundary is still the same:
  - capability admission happens through runtime checks,
  - denied actions still surface prose diagnostics instead of a structured
    reason envelope,
  - adapter governance is still implicit rather than registry-driven.
- So the contract is still pointing at the right next step:
  formalize capability definitions, adapter registration, and denial reason
  codes without throwing away the already-working composition model.

## Addendum (2026-07-26) - current capability flow is still composition-first and prose-denied

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/game/contracts.ts` still shows a real composition model:
  - `RIG_PROFILES` carries explicit capability arrays,
  - `effectiveProfile()` composes fitted modules onto an immutable rig profile,
  - `MODULES` can grant extra capabilities without replacing the base rig.
- `src/game/state.ts` still consumes that composed profile through runtime
  admission checks:
  - `hasCapability(...)`,
  - `resolvePrimaryAction(...)`,
  - `performPrimaryAction(...)`,
  - `installModule(...)`,
  - `repairRig(...)`,
  - `winchRecover(...)`.
- The live admission shape is still intentionally lightweight:
  - a capability is either present or absent,
  - failures surface as prose diagnostics,
  - there is no versioned capability-definition registry,
  - there is no structured denial envelope with reason codes,
  - adapter governance is still implicit rather than registry-driven.
- That means the contract boundary is still correct:
  - composition is real and working,
  - governance structure is still a named gap,
  - future planners should consume these admissions, not replace the current
    composition model with a brittle hierarchy.

## Addendum (2026-07-26) - first structured admission is capability-composition backed

- The relay-cargo interaction now consumes a `CapabilityClaim` from
  `effectiveProfile(...).capabilities`, preserving the existing base-rig plus
  module composition path as the only capability truth source.
- `src/game/affordances.ts` adds the first versioned admission envelope rather
  than a capability registry: it identifies the required capability, outcome,
  reason code, mismatch owner, and contract version.
- The first explicit denial is `missing-capability` for a nearby rig attempting
  the relay cargo without `tow`. This replaces a generic contextual no-op with
  structured evidence while retaining the human-readable diagnostic.
- Adapter governance, mutable capability-state schemas, per-capability
  migrations, and a definition registry remain intentionally unimplemented.
  They need a second materially different capability/adapter use case before
  becoming a framework.
- Evidence level: Tier 1 static source inspection. The focused resolver tests
  were authored but not executed in this pass.

## Addendum (2026-07-29) - the next capability proof is a versioned definition plus one owned adapter boundary

- Re-read the capability contract after the event, streaming, and observability
  passes.
- The repo already has structured admissions and composition-backed capability
  claims. The missing piece is no longer “can the game tell me yes or no?”
  The missing piece is the contract surface that says what a capability is and
  which adapter owns it.
- The next proof slice should therefore be the smallest versioned boundary that
  makes the capability lane explicit:
  - one versioned capability definition record,
  - one owned adapter registration boundary,
  - one explicit denial reason code path for an unsupported claim,
  - one world-affordance example tied to a real rig/action pair.
- That keeps the current composition model intact while making future machines,
  tools, and motion families easier to validate and explain.
- Evidence depth: Tier 1 static synthesis from the capability contract and the
  existing structured-admission notes. No new capability registry was added in
  this pass.
