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
