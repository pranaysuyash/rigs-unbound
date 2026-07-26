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
The canonical analysis addendum now also covers the change-plane model plus
data/asset ingestion and resource governance contracts.
For quick lane navigation, use [3D Game Contract Index](./3D_GAME_CONTRACT_INDEX_2026-07-25.md).

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

Behavior should remain a separate contract-based decision layer, not a hidden side effect inside event emission. The useful split is:

- behavior chooses the next valid action;
- events record the authoritative mutation and its ordering;
- presentation reacts to the resulting state/event stream.

A minimal bounded recorder hook now exists in `src/main.ts` and
`src/game/run-record.ts`. It captures commands, input transitions, checkpoints,
and saves while exposing truncation, and checkpoint entries now carry a stable
tick hash. The browser surface now also exposes the structural verifier, but it
still does not provide durable playback verification.

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
- Capability contract note: [CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md](./CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md) now captures the current rig-profile capability surface and the first durable adapter/affordance questions.

### Lane C: Affordance and content-validation gating

- Add explicit affordance schema for world assets and world-facing interaction surfaces.
- Gate activity execution with world affordance resolution.
- Affordance contract note: [WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md](./WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md) now captures the world-verb and capability-resolution boundary.

### Lane D: Per-contract versioning + migration

- Add version tags to capability and activity JSON definitions.
- Extend migration path for content contract migration (separate from save migration).

### Lane E: Evidence and observability

- Add deterministic event sampling + profiling counters:
  - validation rejects
  - command latency
  - engine tick budget
  - content activation failures

### Lane F: Streaming world lifecycle

- Introduce `WorldChunkManifest` and chunk residency states.
- Add request/validate/activate/unload/rollback tests with active-chunk budget counters.
- Keep world truth canonical while residency remains a runtime concern only.
- Streaming contract note: [STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md) now captures the single-residency substrate and the missing manifest lifecycle.

### Lane G: ECS threshold and composition readiness

- Add a versioned composition schema for multi-capability entities.
- Add validation that rejects invalid capability bundles before runtime.
- Record the actor-count / coupling thresholds that would justify ECS migration.
- Keep the current typed state + adapter model canonical until that threshold is met.
- ECS contract note: [ECS Threshold and Composition Readiness Contract](./ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md) now captures the proof boundary and the migration trigger.

### Lane H: Authority envelope

- Add an authoritative mutation token schema and intent queue.
- Add duplicate-command, stale-ownership, and rejection telemetry tests.
- Keep shared-room and server-authoritative claims deferred until the lane proves replay-safe.

### Lane I: Simulation layers and resource governance

- Add a named domain-order table for the non-render simulation layers.
- Add a cross-layer budget ledger for CPU, GPU, active actors, and residency.
- Add fallback-policy telemetry when a layer downgrades due to budget pressure.
- Keep weather/economy/traffic/mission director domains isolated until their contracts are measured.
- Simulation layers note: [SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md](./SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md) now captures the owned-domain order and the governance boundary.

### Lane J: Modding and creator-pack validation

- Add a versioned pack manifest with dependency and provenance fields.
- Add compatibility validation against capability, activity, and affordance contracts.
- Add safe disable/rollback behavior for invalid or stale packs.
- Keep open UGC deferred until validated pack publication and moderation flow are proven.
- Modding contract note: [MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md](./MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md) now captures the staged pack lifecycle and the validation boundary.

### Lane K: Event graph and deterministic handlers

- Add a versioned event envelope with monotonic ordering and origin-domain fields.
- Add deterministic event-graph tests for deduplication and fixed-slice ordering.
- Add telemetry for event origin, fan-out, and replay-safe payload visibility.
- Keep event consumers domain-owned and read-only relative to state mutation.
- The current event evidence and proof slice live in [EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md).

### Lane L: Asset pipeline and provenance

- Add a versioned asset manifest with source, hash, license, and LOD intent fields.
- Add a provenance/license validator that rejects incompatible or incomplete asset records.
- Add a web asset ingest/compression contract so browser-facing assets carry source, derived, and replacement state before activation.
- Add browser-visible reject diagnostics for invalid, oversized, or unsupported assets.
- Add safe replacement and deprecation behavior for runtime asset entries.
- Keep runtime consuming validated manifests only, not raw source files.
- Asset pipeline note: [ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md) now captures the source-to-manifest and replacement boundary.

### Lane M: Behavior system and planner contracts

- Add a versioned behavior schema with trigger, capability, and fallback fields.
- Add deterministic fixed-slice tests for planner choice stability and capability rejection.
- Add telemetry for behavior branch selection and rejection reasons.
- Keep behavior read-only relative to state mutation; validation and kernel remain authoritative.
- Behavior contract note: [BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md](./BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md) now captures the command-to-decision gap and the deterministic planner rules.

### Lane N: Visibility-stage hardening

- Add a versioned visibility-policy schema with near/mid/far tiers.
- Add deterministic frustum and distance-culling tests tied to draw-path evidence.
- Add draw-call budget counters and fail-soft fallback behavior.
- Keep LOD degradations explicit across geometry, animation, physics, and particles.

### Lane O: Collision categories and masks

- Add a collision-category / collision-mask schema for ground, obstacle, hazard, trigger, projectile, sensor, and decorative roles.
- Add tests proving trigger and sensor contacts do not mutate physics state.
- Add telemetry for unexpected or incompatible category/mask pairs.
- Keep collision behavior explicit per role instead of one generalized obstacle resolver.
- The current collision evidence and proof slice live in [COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md).

### Lane P: Camera feel contracts

- Add a camera-policy schema with named modes, transition inputs, comfort profiles, and fallback handling.
- Add tests for smooth mode transitions, obstruction pull-in, and reduced-motion clamping.
- Add telemetry or debug fields that expose the active camera policy and transition reason.
- Keep camera policy separate from input handling, rendering, and per-machine geometry adapters.
- The current camera evidence and proof slice live in [CAMERA_FEEL_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/CAMERA_FEEL_CONTRACT_2026-07-25.md).

### Lane Q: Deterministic replay artifact

- Add a versioned replay artifact schema that carries captured input, tick anchors, run hashes, and recovery boundaries.
- Add a playback path that reuses the deterministic kernel and reports divergence clearly.
- Add visible failure modes for missing metadata, schema mismatch, and unsupported recovery points.
- Keep replay as a first-class product surface for debugging and authority work, not just a log file.
- The current run-record evidence and proof slice live in [REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md).

### Lane R: Shader and material strategy

- Add a layered material schema that separates base surfaces, modifiers, weather, wear, and readability overlays.
- Add at least one custom shader or material module for a gameplay-relevant cue such as terrain transition, hazard state, or weather feedback.
- Add a fallback path that preserves clarity when the custom path is unavailable.
- Keep visual identity and readability aligned so shader work supports gameplay instead of obscuring it.
- Shader contract note: [SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md](./SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md) now captures the layered material and fallback boundary.

### Lane S: Spatial culling and render streaming

- Add a distance-culling policy, a portal-visibility graph where applicable, and a chunk-residency model for render streaming.
- Add observable counters for residency, load/unload churn, and missed-cull pressure.
- Add a fallback path for tiers that cannot load in time or cannot be resolved safely.
- Keep spatial scaling measurable so the renderer sheds load deliberately instead of heuristically.
- The current visibility-stage evidence and proof slice live in [VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md).

### Lane T: LOD hierarchy and subsystem degradation

- Add a cross-subsystem LOD schema for geometry, materials, animation, AI, physics, particles, and feedback.
- Add tests for at least one geometry downgrade and one non-geometry downgrade path.
- Add telemetry that reports the active tier and the downgrade reason.
- Keep distant or low-priority simulation meaningful instead of collapsing it into an undefined state.
- The current visibility-stage evidence and proof slice live in [VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md).

### Lane U: Resource budgets and fallback envelope

- Add a cross-system budget ledger for CPU, GPU, memory/residency, active actors, and thermal or battery sensitivity where relevant.
- Add at least one low-budget fallback profile and test that it activates before overload becomes silent failure.
- Add telemetry and operator-visible summaries naming the oversubscribed resource and the subsystem that caused it.
- Keep resource governance explicit so the engine simplifies or sheds work by policy instead of by accident.
- The current resource-budget evidence and proof slice live in [RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md).

### Lane V: Portal visibility and bounded rooms

- Add a room/portal graph schema for indoor or bounded-space visibility.
- Add tests for closed-portal blocking, open-portal propagation, and missing-data fallback.
- Add telemetry that identifies the active room, portal path, or fallback visibility mode.
- Keep portal visibility complementary to distance and chunk culling so indoor spaces scale cleanly.
- Portal contract note: [PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md](./PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md) now captures the bounded-room visibility boundary.

### Lane W: Lighting and atmosphere strategy

- Add a staged lighting policy covering ambient, directional, local accents, and shadow quality tiers.
- Add explicit fallback rules for baked/probe lighting, blob shadows, or reduced shadow budgets.
- Add a low-cost atmosphere cue for weather or time-of-day readability.
- Keep lighting aligned with gameplay clarity so reduced budgets never make the world unreadable.
- Lighting contract note: [LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md](./LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md) now captures the readability-first lighting boundary.

### Lane X: Accessibility and input contracts

- Add a named-action schema with device-neutral intents and persistence for bindings/remaps.
- Add tests for remapping persistence, reduced-motion clamping, and contrast/readability guards.
- Add telemetry or debug fields for the active input profile or accessibility profile.
- Keep keyboard, gamepad, and touch expressing the same gameplay meaning unless intentionally different.
- Accessibility contract note: [ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md](./ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md) now captures the action-model and parity boundary.

### Lane Y: Kernel ordering and mutable subsystem gates

- Add an explicit tick-order and read/write authority table for mutable subsystems.
- Add validation gates that block state mutation outside the kernel order.
- Add replay-safe event emission points and telemetry for the active kernel stage.
- Keep renderer-only code presentation-only so future AI/mission/economy hooks cannot bypass the kernel.
- Kernel contract note: [KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md](./KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md) now captures the authoritative step-order boundary.

### Lane Z: World and architecture scalability

- Add a world-scaling policy for chunk or region lifecycle, load radius, unload policy, and migration boundaries.
- Add activity-pack activation tests with rollback and churn observability.
- Add a future-only boundary note for shared-state or online readiness so local play stays the canonical current mode.
- Keep activity growth packable and measurable so new content does not require a kernel rewrite.
- World-scalability contract note: [WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md](./WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md) now captures the growth boundary.

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

### Lane AA: Save and migration observability

- Add reason-code and version-metadata fields to world mutation paths.
- Add save and migration observability events for success, failure, and fallback paths.
- Add a replay-safe recovery note that preserves source-version information.
- Keep persistence auditable so recovery explains what happened, not just what data exists.
- Save contract note: [SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md](./SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md) now captures the persistence explanation boundary.

### Lane AB: Physics quality envelope

- Add deterministic terrain-contact and obstacle-stability invariants for the lightweight physics kernel.
- Add regression tests for slope handling, high-speed cornering, and fallback behavior around water or fluid-adjacent interactions.
- Add telemetry or debug fields for physics stability state or failure mode.
- Keep reduced-complexity physics playable and visibly stable instead of silently degrading.

### Lane AC: Authoring and reproducible content validation

- Add versioned content-manifest schemas for activities or world modules.
- Add validator-first rejection tests and reproducible validation result artifacts.
- Add provenance/source metadata and runtime-ready vs validation-only status signals.
- Keep imported, edited, or generated content inside the same runtime contracts as native content.
- Authoring contract note: [AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md](./AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md) now captures the manifest-validation boundary.

### Lane AD: Performance and readability baseline

- Add a single policy surface binding culling thresholds, LOD tiers, camera mode matrix, collision semantics, and budget counters.
- Add visible tables or policy docs for within-budget, degraded, and fail-soft states.
- Add per-frame instrumentation for actor count, physics count, and transition latency.
- Keep the umbrella baseline mapped to the existing fine-grained contracts instead of replacing them.
- The current physics quality envelope evidence and proof slice live in [PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md).
- Baseline contract note: [PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md](./PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md) now captures the umbrella policy layer.

### Lane AE: Second locomotion family and cross-mode continuity

- Add a second locomotion adapter or family definition using the existing contract stack.
- Reuse one shared semantic action set in at least one non-chase presentation mode.
- Add save/reload and rollback coverage for the new family.
- Keep expansion capability-first so new motion grammars preserve control continuity instead of branching the engine.
- Second-locomotion contract note: [SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md](./SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md) now captures the motion-grammar boundary.

### Lane AF: Authority model groundwork

- Add a local-first authority note that keeps shared-state and server-authoritative behavior future-only.
- Add authenticated mutation request/response shapes plus explicit reject behavior.
- Add durable-value recovery and telemetry for authority outcomes.
- Keep durable world changes distinct from speculative client simulation.
- Authority contract note: [AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md) now captures the future-only authority boundary.
- The current authority evidence and proof slice live in [AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md).

### Lane AG: Engine branch evaluation and alternate backend gating

- Keep Three.js as the canonical v1 path while defining a bounded benchmark branch for alternates.
- Trigger branch evaluation only on measurable budget failure or platform constraint.
- Compare alternates against the same culling, LOD, camera, collision, lighting, and observability contracts.
- Keep alternate backend work disposable unless evidence justifies migration.
- Engine-branch contract note: [ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md](./ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md) now captures the bounded comparison boundary.

### Lane AH: Replay and ghost product feature

- Add a shareable replay or ghost artifact schema with run identity, seed/origin, version, and compatibility status.
- Add deterministic playback verification plus mismatch handling for shared artifacts.
- Add clear trust boundaries for replay-only versus diagnostics-only surfaces.
- Keep replay as a product feature that still respects the deterministic simulation contract.
- Replay contract note: [REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md) now captures the shareable-artifact boundary.

### Lane AI: Verification harness and confidence gates

- Add deterministic fixture scenes or equivalent scenarios for culling, camera, collision, migration, and fallback checks.
- Add tiered evidence summaries that distinguish source/test/runtime proof.
- Add failure-report formats that preserve violated contracts and missing evidence tiers.
- Keep proof work reproducible so confidence changes are auditable instead of implied.
- Verification contract note: [VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md](./VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md) now captures the evidence-harness boundary.
- The harness should treat Physics Lab 01 as one of the canonical browser-visible fixtures once the acceptance trail is reviewed.

### Lane AJ: Physics lab browser experience and acceptance

- Keep Physics Lab 01 as a separate browser-experience evidence fixture with its own acceptance path.
- Add a dedicated runner or shared scenario entry for lab boot, controls, pause/debug/reset, fallback, and recovery.
- Keep Field 02 canonical so the lab supplements rather than competes with the public game path.
- Physics-lab contract note: [PHYSICS_LAB_BROWSER_EXPERIENCE_AND_ACCEPTANCE_CONTRACT_2026-07-25.md](./PHYSICS_LAB_BROWSER_EXPERIENCE_AND_ACCEPTANCE_CONTRACT_2026-07-25.md) now captures the lab boundary.
