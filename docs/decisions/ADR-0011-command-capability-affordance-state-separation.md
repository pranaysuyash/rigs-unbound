# ADR-0011: Command, capability, affordance and contract-first extension path

- Date: 2026-07-25
- Status: proposed
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [ADR-0001](ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md)
  - [ADR-0003](ADR-0003-versioned-gameplay-content-composition.md)
  - [ADR-0006](ADR-0006-rig-capability-portability.md)
  - [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md)
  - [ADR-0008](ADR-0008-camera-policies-and-direct-view-selection.md)
  - [ADR-0010](ADR-0010-rendering-accessibility-contract.md)

## Context

The project now has a fixed-step kernel, snapshot-driven rendering, terrain-centric simulation, and initial capability-based rig intent checks. The latest capability-style audit adds four additional structural requirements before scaling to broad ecosystems:

1. command/authority/state/event ordering as explicit contracts;
2. capability definitions as versioned, testable behavior contracts;
3. world affordances as interaction compatibility data;
4. generated-content safety gates before world mutation.

These requirements are not complete in the current implementation despite good directional alignment.

Evidence in current code today:

- Kernel and deterministic state transitions: `src/game/state.ts`
- Render presentation separation: `src/game/renderer.ts`, `src/game/gameworld.ts`
- Seed/value migration flow: `src/game/storage.ts`, `src/game/state.ts`
- Capability list and action gating: `src/game/contracts.ts`, `src/game/input.ts`, `src/game/state.ts`

## Decision

### 1. Adopt a fixed four-plane change model

Every evolving element must be classified into one of:

1. **Invariants** (rarely changed): kernel tick order, migration ownership, renderer boundaries, input intent model.
2. **Capabilities** (infrequent): locomotion, handling, interaction verbs, and their simulation adapters.
3. **Content** (frequent): world definitions, mission packs, rig profiles, visual presets.
4. **Tuning** (frequent): physics coefficients, reward multipliers, HUD/camera softness.

This prevents content/tuning from mutating core contract behavior.

### 2. Promote capability data to schema contracts before growth

Capabilities move from informal flags to versioned schemas with machine-readable requirements:

- `id`, `version`, `requirements`, `actions`, `telemetry`, `validationRules`, `migrationSemantics`
- runtime state kept in `MachineCapabilityState` with capability instance fields (cooldown, load limits, attachment constraints, failure conditions).

### 3. Enforce immutable command flow and distinct output stages

All high-impact inputs should follow:

- Command (intent, actor, target, timestamp/tick)
- Validation (requirements, affordances, cooldown/state checks)
- State transition (kernel mutation only)
- Event emission (result + reason codes)
- Presentation (render/audio/ui reaction from snapshot/event)

Renderer and UI must not mutate world state.

### 4. Add world affordance matching

World actors expose explicit affordances and capabilities request affordances, not concrete object names.

Example affordance keys: `towable`, `harvestable`, `dockable`, `repairable`, `build-surface`, `triggerable`.

### 5. Treat generated or imported content as untrusted input

Any content path that enters from generators, mod packs, or external edits follows:

`raw -> schema validate -> semantic validate -> reference resolve -> compatibility checks -> budget checks -> normalized runtime -> activation`

Only normalized assets are active in world systems.

### 6. Keep the command stack local-first now, authoritative-only later

The authoritative network lane should reuse the same command/event contracts once local replay/testing stabilizes.

## Consequences

1. Hardening work now is concentrated in contracts and validation, not in rendering hacks.
2. Additional locomotion/activity systems become safer and less coupled.
3. Replay, authority, and bug reconstruction become feasible without architectural rewrites.
4. Migration risk is reduced because changes are explicit per contract tier.

## Alternatives considered

- Continue with ad-hoc direct mutation and hardcoded rig branching.
  - Rejected: leaks interactions and blocks scaling.
- Replace with full ECS before any contract work.
  - Rejected: introduces framework migration risk before proof of compatibility.
- Ignore generated-content safety gates and trust input quality.
  - Rejected: high integrity and recovery risk.

## Validation plan

- Tier 1 evidence now:
  - decision artifacts in this ADR and aligned source references.
- Tier 2 planned:
  - command/event schema tests,
  - capability-definition validation tests,
  - affordance mismatch rejection tests,
  - migration test for changed contract shape.
- Tier 3 planned:
  - deterministic replay playback with event-log replay checksum,
  - browser acceptance on staged profiles.

## Acceptance for this ADR

This ADR reaches accepted implementation state when all are true:

1. At least one capability definition is defined as schema data + migration.
2. One full interaction path uses command -> validate -> transition -> event -> presentation.
3. One affordance mismatch path is rejected with a diagnosable telemetry event.
4. One external/procedural asset candidate is rejected by validation before activation.
5. Renderer path remains snapshot-driven throughout the added flow.

## Anything else?

This does not preclude later ECS or broader authority layers; it defines the contract surface required before those expansions are safe.
