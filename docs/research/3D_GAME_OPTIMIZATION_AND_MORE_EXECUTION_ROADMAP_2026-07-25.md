# 3D Game Optimization Gaps — “And More” Execution Roadmap

**Date:** 2026-07-25
**Repo:** `/Users/pranay/Projects/Game_dev/rigs-unbound`
**Source context:** conversation `6a64b5ee-9198-83e8-a94f-1ea55983f676` and local state audit pass.

## 1) Purpose and scope

This document captures the extra guidance from the “Optimization Gaps” conversation that was not yet explicitly codified in the existing long-term audit. It is written as a concrete, implementation-oriented runway aligned to:

- deterministic simulation-first architecture
- data contracts and migration discipline
- capability/affordance driven gameplay
- long-term maintainability over short-term patching

The companion evidence-and-provenance artifact for this roadmap is
[3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md](./3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md).
It records the `3d-games` skill provenance, a gap-by-gap evidence matrix, and the current acceptance gates.

The rollout-order ADR is [ADR-0014](../decisions/ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md).

## 2) Current implementation signal

Based on local code review, the repo already has these strong foundations:

- Simulation kernel with deterministic stepping and separated render input (`src/game/state.ts`)
- Capability checks and intent/state/action boundaries already present (`src/game/state.ts`)
- Split rendering from world state and snapshot-driven render path (`src/game/renderer.ts`)
- Separate terrain and physics/locomotion concerns (`src/game/terrain.ts`, `src/game/physics.ts`)
- Save/version migration touchpoints (`src/game/storage.ts`)
- Performance tracking and chunk-memory scaffolding for future spatial scaling (`src/game/performance.ts`, `src/game/gameworld.ts`)

These foundations support moving from “engine optimization list” to “platform architecture” without a disruptive rewrite.

---

## 3) “And more” recommendations transposed to concrete rules

### 3.1 Separate four kinds of change

Use these contract layers at architecture boundaries:

1. **Invariants** (rarely changed)
   - tick order
   - save semantics
   - entity identity
   - mutation and authority rules
   - renderer ownership
2. **Capabilities** (stable, infrequently changed)
   - locomotion families
   - tool and action families
   - resource interaction semantics
3. **Content** (frequently changed)
   - vehicle manifests
   - terrain definitions
   - activities and rewards
   - mission payloads
4. **Tuning** (rapidly changed)
   - friction, acceleration, camera feel
   - spawn rates and reward multipliers
   - load/quality budgets

**Policy:** never encode content/tuning into invariant code paths.

### 3.2 Capabilities as contracts (not booleans)

A capability is a contract:

- id/version
- requirements
- actions
- schema and validation
- simulation adapter
- telemetry events
- failure modes

This avoids generic `canX` flags that eventually become combinatorial conditionals.

### 3.3 Composition > inheritance

Do not hardcode taxonomies (`Tractor -> Vehicle -> GroundVehicle -> ...`).

Compose entities from capability instances + adapters.

### 3.4 Activities consume capabilities

Activities define required capability sets and constraints. Eligibility becomes matrix-based and dynamic.

### 3.5 World affordances

World entities should expose affordances (`harvestable`, `towable`, `dockable`, etc.).
Capabilities resolve against affordances at runtime.

### 3.6 Ingestion-time validation pipeline

Any content imported from authoring or AI generation must be normalized before runtime:

1. raw data
2. schema validation
3. semantic validation
4. reference resolution
5. compatibility checks
6. deterministic normalization
7. immutable runtime object build

### 3.7 Per-contract versioning

Version more than just global save version:

- capability schemas
- activity schemas
- entity definitions
- event payloads
- network payloads
- content manifests

### 3.8 Command / validation / state transition / event / presentation

Keep these distinct:

- user intent captured as command
- authority validates
- kernel mutates state
- event stream captures what happened
- renderer/UI/audio react from events/snapshots

This is the spine for replay, anti-cheat, deterministic testing, and future authority layer.

A minimal bounded recorder hook now exists in `src/main.ts` and
`src/game/run-record.ts`. It captures commands, input transitions, checkpoints,
and saves while exposing truncation, and checkpoint entries now carry a stable
tick hash. It still does not provide durable playback verification.

### 3.9 Generated content is untrusted input

AI/procedural outputs are candidates, not truth:

- geometry constraints
- performance budgets
- connectivity/safety checks
- pathing/reachability checks
- budgeted activation gates

### 3.10 Ownership boundaries

Each domain should own what it does best; do not let UI or renderer mutate simulation.

### 3.11 Stable outer contracts + explicit adapters

Keep outer interfaces stable (`LocomotionAdapter`, `CapabilityAdapter` style), but allow specialized implementations:

- wheeled
- tracked
- water
- aerial
- static-machine

### 3.12 Build vertical proofs

First prove architecture in game slices before broad generalization:

1. tractor + trailer pipeline
2. second locomotion adapter
3. non-vehicle machine
4. aerial drone path

### 3.13 Deletion resistance

Each new subsystem should be removable without collateral damage.

If removing one feature breaks unrelated modules, coupling is too high.

### 3.14 Keep specificity where it matters

Generalize infrastructure; preserve handcrafted/specialized gameplay feel in:

- vehicle feel and camera personality
- mission pacing and encounter design
- narrative and landmark identity

### 3.15 Recommended target stack

A minimal target state:

- input/AI/network -> commands
- validation + authority
- deterministic kernel
- world + capability + activity + economy + director services
- events + storage
- presentation layer (render/audio/ui)

Supporting tooling:

- schema registry
- content inspector
- migration utility
- profiler
- replay capture/replay playback
- event replay validation

---

## 4) Execution lanes from this pass (short-to-medium term)

Lane order is intentionally staged to avoid architecture theatre:

### Lane A: Safety and correctness (immediate)
- Add explicit command/event logs around state mutations already present in `state.ts`.
- Add compatibility matrix tests for capability requirements and activity admission.

### Lane B: Capability contract formalization
- Introduce/lock `CapabilityDefinition` and `MachineCapabilityState` shape with explicit adapters.
- Add validator tests for missing/invalid adapters.

### Lane C: Affordance and content-validation gating
- Add explicit affordance schema for world assets.
- Gate activity execution with world affordance resolution.

### Lane D: Per-contract versioning + migration
- Add version tags to capability and activity JSON definitions.
- Extend migration path for content contract migration (separate from save migration).

### Lane E: Evidence and observability
- Add deterministic event sampling + profiling counters:
  - validation rejects
  - command latency
  - engine tick budget
  - content activation failures

---

## 5) Risk and decision gate

**Highest risk at this stage**: expanding capability abstraction before vertical proof slices.

**Control:** constrain first expansion to two locomotion adapters + one non-vehicle machine + one data-driven activity migration.

---

## 6) Decision record snapshot

**Decision:** do not pursue full ECS/capability platform in one pass.
**Decision date:** 2026-07-25
**Why:** code already has enough invariant separation to layer capability contracts safely, but full generalization remains high-risk.
**Result:** prioritized “proof-first” execution where architecture breadth follows validated use-cases.

## 7) Acceptance criteria for completion of this roadmap layer

- Activity admission can be reasoned from capability constraints, not hard-coded type checks.
- Command stream is replayable into deterministic same-tick outcomes.
- World affordance mismatch produces explicit validation faults and telemetry.
- Migration and contract versioning exists for at least one capability and one activity schema.
- Rendering remains snapshot-driven after these changes.

## 8) Final synthesis from follow-up conversation block (decision-closure form)

### 8.1 What is complete in architecture now

1. Deterministic kernel + fixed-step simulation order: `state.ts`.
2. Snapshot-driven render contract: `renderer.ts` and `gameworld.ts`.
3. Initial capability-oriented profiles and intent/action boundaries: `contracts.ts` + `state.ts`.
4. Save/version recovery primitives: `storage.ts`, `state.ts`.

### 8.2 What is not complete yet

1. Full command/authority separation as production pipeline (present in shape, not full network-ready authority).
2. Capability definitions as versioned contracts with schema-level validation and migration.
3. World affordance system used by runtime interactions (designed, not universally enforced).
4. Deterministic replay artifact (input log/run hash playback).
5. Event graph and content-pipeline gating for generated or imported world updates.

### 8.3 Closure rule for this architecture phase

- We should not gate progress on “full ecosystem completeness.”
- We should close each iteration only when a new proof slice has:
  - schema-validated inputs,
  - deterministic ordering invariants,
  - explicit failure telemetry,
  - replayable outcomes.

Linked decision artifact for this architecture phase:

- [ADR-0011](../decisions/ADR-0011-command-capability-affordance-state-separation.md): contract-first command, capability, affordance, and state-separation gates.
