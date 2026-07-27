# 3D Game Skill-to-Repository Execution Ledger

**Date:** 2026-07-26  
**Status:** Active long-term execution ledger; no implementation claim  
**Evidence tier:** Tier 1 for code and document inspection in this audit; the cited runtime and test evidence remains owned by its original artifacts  
**Scope:** Rigs Unbound as a browser-delivered, machine-centric 3D simulation. The tractor is an initial rig, not the product boundary.

## Purpose

The supplied `3D Game Optimization Gaps` research is useful because it treats rendering, simulation, persistence, and extensibility as mutually dependent architecture rather than unrelated graphics tasks. This ledger turns that research into a repository-specific path.

It answers five concrete questions:

1. What is already real in the codebase?
2. Which proposed systems are justified now, which are only partially present, and which remain premature?
3. What durable contracts must not be bypassed as the project grows?
4. What is the next smallest vertical proof for each architectural lane?
5. What evidence must exist before a capability can be described as implemented?

This document is the active implementation-status and skill-provenance ledger for this audit. It is not a second architecture source of truth. Older synthesis documents preserve historical reasoning; they must not be treated as current status authorities. This ledger must be read with the linked exploration map, ADRs, source, tests, and runtime evidence.

## Inputs used

### Skills used one at a time

1. [`3d-games` skill](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)
   - Rendering pipeline, culling, LOD, batching, shader boundaries, simple collision shapes, collision layers, raycasts, camera behavior, and lighting cost.
2. [`3d-web-experience` skill](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/3d-web-experience/SKILL.md)
   - Browser delivery, device-scaled quality, loading/fallback behavior, and web-ready asset lifecycle.

The second skill is relevant because Rigs Unbound is a Three.js browser game. Its React/Spline examples are not a recommendation to change the current renderer stack.

### Repository evidence consulted in the continuing audit

| Surface                                                                                                                                                                                                                 | What it establishes                                                                                                               | Why it matters                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`src/game/contracts.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)                                                                                                                           | Fixed-step constants, versioned save contract, rig profiles, declared capability identifiers, and ground/hover mobility adapters. | The project already has a portable-rig seam; it should be deepened rather than replaced by a tractor-only hierarchy.                 |
| [`src/game/state.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)                                                                                                                                   | The simulation advances through a fixed-step kernel; player actions still perform direct state mutations.                         | Simulation order is a real foundation. Command validation and emitted events are the next missing separation.                        |
| [`src/game/collision.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/collision.ts)                                                                                                                           | Deterministic on-demand obstacle generation and rig-to-obstacle resolution.                                                       | Collision is no longer a pure renderer concern, but category/mask filtering and broadphase policy are not yet first-class contracts. |
| [`src/game/renderer.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)                                                                                                                             | Instanced environmental rendering, renderer metrics, blob-shadow choice, and known third-person terrain-occlusion limitation.     | Batching is established. Explicit visibility, LOD, quality, and camera-collision policies remain open.                               |
| [`src/game/performance.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)                                                                                                                       | Frame-time, FPS, draw-call, triangle, heap, load, and save telemetry.                                                             | Measurement exists; enforced budgets and quality adaptation do not.                                                                  |
| [`src/game/storage.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)                                                                                                                               | Versioned persistence and recovery/migration flow.                                                                                | Save compatibility is a real invariant that new durable contracts must join rather than bypass.                                      |
| [`src/main.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)                                                                                                                                               | Browser input and UI wiring invokes simulation operations directly.                                                               | This identifies the exact boundary where intent should eventually become commands.                                                   |
| [`docs/exploration/EXPLORATION_MAP.md`](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)                                                                                               | Existing gap matrix and continuation map.                                                                                         | This ledger extends the existing map; it does not supersede it.                                                                      |
| [`docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md`](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md) | Prior source-to-recommendation synthesis.                                                                                         | This ledger converts the synthesis into ordered contracts, proofs, and evidence gates.                                               |
| [`docs/decisions/ADR-0011-command-capability-affordance-state-separation.md`](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0011-command-capability-affordance-state-separation.md)                   | Existing decision direction for command, capability, affordance, and state boundaries.                                            | The recommended command/event work must land through the canonical ADR direction, not in a parallel abstraction.                     |

## First-principles target

Rigs Unbound is best described as a platform for **interacting with space through machines**. A machine may be mobile, stationary, mechanical, autonomous, or remote-controlled. It earns its place by adding capabilities that interact with a shared world.

The durable relationship is:

```text
Machine definition
  + capability instances
  + tuning and presentation profile
  + world affordances
  + activity requirements
  = gameplay that composes without type-specific engine branches
```

This does not require an immediate full ECS, plugin marketplace, multiplayer backend, universal renderer, or procedural director. It requires preserving the contracts that make those future options possible.

### Constitutional invariants

These rules should change rarely and must have explicit migration plans when they do.

1. **The simulation owns authoritative world mutation.** Rendering, audio, UI, and analytics observe state or events; they do not silently decide gameplay outcomes.
2. **A fixed-step kernel defines state order.** Variable browser frame time may affect interpolation and visual quality, not the ordering of authoritative mechanics.
3. **Durable state is versioned at its contract boundary.** Save files are not the only durable form: content definitions, capability state, activity schemas, replay formats, chunk records, and event payloads also need explicit versions once persisted or exchanged.
4. **Content is data only after it is validated.** Raw manifests, generated content, and future mod inputs must pass schema, reference, semantic, compatibility, and budget validation before activation.
5. **A renderer is a budgeted presentation consumer.** It chooses a representation for authoritative world data; it does not define whether a tree fell, a vehicle attached a trailer, or a bridge exists.
6. **Generic infrastructure must be proven by a second real use case.** A capability, adapter, or scheduler is extracted after repeated need, while ownership and invariants are established before shortcuts make extraction unsafe.
7. **Every scalable feature has a removal boundary.** Removing racing must not damage farming; removing hover locomotion must not change wheeled traction; replacing a weather shader must not alter terrain simulation.

## Current architecture assessment

### Foundations that are already useful

| Foundation                         | Evidence                                                                                                                                                                                                                                    | Assessment                      | Preservation rule                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Deterministic simulation kernel    | Fixed-step simulation flow in [`state.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts).                                                                                                                                 | Foundation present.             | Keep rendering and browser event cadence out of authority.                                         |
| Portable rig profile direction     | Rig profiles, capability identifiers, and mobility adapters in [`contracts.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts).                                                                                        | Foundation present but shallow. | Preserve `Rig` as the product noun; do not reintroduce tractor-only state.                         |
| Persistent-world seed and recovery | Deterministic obstacle field plus storage recovery/migrations in [`collision.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/collision.ts) and [`storage.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts). | Foundation present.             | World generation and persisted deltas must remain compatible across releases.                      |
| Batch-conscious renderer           | Repeated environmental props are instanced in [`renderer.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts).                                                                                                           | Foundation present.             | Expand selection/representation policy before replacing the renderer.                              |
| Baseline instrumentation           | Frame, draw-call, triangle, heap, load, and save metrics in [`performance.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts).                                                                                       | Foundation present.             | Turn metrics into explicit budgets before adding large-scale systems.                              |
| Save schema migration              | Versioned storage paths in [`storage.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts).                                                                                                                                | Foundation present.             | New persistent domains need local versions and migrations, not unbounded global-save conditionals. |

### Maturity matrix

| Concern from the supplied research                  | Current status                          | Evidence and limitation                                                                                                                                                                                                                                 | Next proof, not a speculative framework                                                                                                                                          |
| --------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frustum and distance culling                        | Partial, Tier 1 policy seam implemented | Logical near/mid/far/culled classification and visibility counters exist for environmental props. Instanced meshes still deliberately disable Three.js frustum culling in the current path, and no general occlusion or portal culling exists.          | Add profile selection, actual frustum behavior, fixture coverage, category-specific representations, and browser evidence before claiming culling/LOD closure.                   |
| Occlusion and portals                               | Partial                                 | Camera terrain obstruction, pull-in, and deterministic shoulder/high fallback now exist; general scene occlusion and room/portal topology do not.                                                                                                       | Browser evidence across obstruction cases first. Consider portal/cluster visibility only after interiors exist and profiling shows pressure.                                     |
| Geometry, texture, simulation, AI, and particle LOD | Missing explicit policy                 | Existing metrics show the measurement seam, but no tier contract selects representations or update frequencies.                                                                                                                                         | One foliage/obstacle representation ladder and one simulation-frequency policy, both driven by measured thresholds.                                                              |
| Render graph and material modifiers                 | Deferred                                | Current renderer favors a compact forward path and blob shadows. No evidence demands a general render graph.                                                                                                                                            | Define pass ownership and material inputs only when a second nontrivial visual pass or modifier requires it.                                                                     |
| Shader strategy                                     | Deferred, selective                     | Custom shader work is not yet the bottleneck established by evidence.                                                                                                                                                                                   | A single visual problem with a measurable budget or identity need: for example water, weather, or terrain wetness.                                                               |
| Camera feel contract                                | Partial, with obstruction resolution    | Rig profiles, speed-FOV behavior, reduced-motion behavior, terrain/obstacle pull-in, and deterministic camera fallbacks are implemented. Mode transition semantics and profile/fallback evidence still need to be formalized and exercised across rigs. | Profile/mode transition fixtures plus browser evidence on wheeled and hover rigs, including reduced-motion behavior.                                                             |
| Collision layers and masks                          | Partial                                 | Collision handles deterministic obstacles and rig resolution, but no category/mask matrix is modeled.                                                                                                                                                   | Introduce collision categories and a matrix for static world, dynamic rig, trigger, sensor, pickup, projectile, and decoration.                                                  |
| Physics and collision separation                    | Partial                                 | Physics and collision are distinct source areas; gameplay categories are still narrow.                                                                                                                                                                  | A second locomotion and interaction proof that shares contracts without forcing identical mechanics.                                                                             |
| Command, validation, state, and events              | Partial                                 | A semantic action resolver and bounded run-record hook exist, but browser handlers still call state mutators directly for several actions. There is no reusable command-validation-event envelope yet.                                                  | Route one semantic action through `command -> validation -> transition -> event -> presentation`, maintaining compatibility for current input and returning stable reason codes. |
| Authority scaling and networking                    | Deferred                                | There is no shared-state requirement yet.                                                                                                                                                                                                               | Command/event boundaries, deterministic replay probe, and state snapshots before any networking claim.                                                                           |
| Streaming world and assets                          | Missing                                 | Current world generation is on-demand but there is no chunk lifecycle or asset residency policy.                                                                                                                                                        | A manifest-backed chunk lifecycle only after measured CPU, memory, or load-pressure thresholds are exceeded.                                                                     |
| Asset pipeline                                      | Partial, activation bridge wired        | The manifest now names two proposed GLB bridge candidates; `runtime-assets.ts` derives their runtime URLs and the renderer supplies loader/fallback evidence. They are not yet `runtime-tested` or `approved`.                                          | A fresh browser observation, rights review, and promotion/replacement exercise for one candidate.                                                                                |
| ECS                                                 | Deferred                                | Components/adapters are useful ideas, but no evidence yet requires a wholesale ECS migration.                                                                                                                                                           | Use SoA/data-oriented structures only where entity scale and profiling prove object-oriented state is the pressure.                                                              |
| Data-driven activities                              | Direction set, not yet proven           | The capability direction exists, but activities need formal requirement schemas.                                                                                                                                                                        | One activity that accepts requirements instead of an allowed rig identity.                                                                                                       |
| Affordances                                         | Partial, one slice proven at Tier 1     | One versioned affordance-resolution slice now exists for relay cargo and tow admission. General world-object affordance coverage, activity schemas, content ingestion, and planner integration remain open.                                             | Add a third materially different affordance consumer and validate capability/activity definitions before runtime creation.                                                       |
| Content and contract validation                     | Partial                                 | Save migration exists; content ingestion validation is not yet the central path.                                                                                                                                                                        | Validate one rig/module/activity manifest before runtime creation.                                                                                                               |
| Replay and debugging                                | Record-only, playback deferred          | Fixed-step simulation and bounded run records exist, but there is no import, playback, re-simulation, or first-divergence report.                                                                                                                       | Store seed/schema/initial state plus semantic inputs; replay one short sequence against a seeded world and report the first mismatching tick/hash.                               |
| Observability and resource budgets                  | Partial                                 | Telemetry exists, enforcement and quality reactions do not.                                                                                                                                                                                             | Define quality profile thresholds with captureable before/after telemetry evidence.                                                                                              |
| Web fallback and loading lifecycle                  | Researching                             | Browser delivery is real, but the public-entry contract for loading, reduced-motion, fallback, and device-quality profiles is still being formalized.                                                                                                   | Truthful loading state, recoverable fallback, and low/balanced/high profile selection tied to measured budgets.                                                                  |

## Ownership model

The following boundary is intentionally narrow. It prevents a UI handler, renderer, mission, or future generator from becoming an alternate authority.

```text
Input / AI / Network
        |
        v
  Semantic commands
        |
        v
Validation + authority
        |
        v
Fixed-step simulation kernel
  |       |        |       |
  v       v        v       v
World  Capabilities Activities Economy
  |       |        |       |
  +-------+--------+-------+
              |
              v
       State transitions + events
            |             |
            v             v
      Storage/migration  Presentation
                         |     |     |
                         v     v     v
                     Renderer Audio  UI
```

| Owner                        | Owns                                                                        | Must not own                                          |
| ---------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| Simulation kernel            | Tick order, authoritative transitions, seeded-world rules                   | Frame presentation, DOM/UI behavior                   |
| World system                 | Regions, cells/chunks, terrain data, world affordances                      | Activity scoring or camera styling                    |
| Capability system            | Reusable action contracts, requirements, state, validation hooks            | A vehicle's brand/identity or one-off mission rewards |
| Locomotion adapter           | Specialized movement math and telemetry behind a stable outer contract      | Renderer meshes or activity-specific rules            |
| Activity system              | Objectives, eligibility, scoring, rewards, failure/recovery semantics       | Direct terrain/physics mutation outside commands      |
| Storage                      | Serialization, versions, migration, recovery                                | Gameplay decisions                                    |
| Renderer                     | Visibility, representation, lighting/material quality, visual interpolation | Authoritative world mutation                          |
| UI/input                     | Intent capture and presentation                                             | Direct mutation of authoritative world state          |
| Director/generator, if added | Proposals, schedules, candidates                                            | Unvalidated writes to the active world                |

## Required contract progression

### 1. Rig, capability, and affordance

The current capability identifiers are the right vocabulary, but booleans or identifiers alone cannot express durable behavior. A capability instance needs a versioned definition, state schema, validation hooks, actions, telemetry, and a specialized adapter where mechanics genuinely differ.

```ts
type CapabilityDefinition = {
  id: string;
  schemaVersion: number;
  requirements: readonly Requirement[];
  actions: readonly ActionDefinition[];
  validate: CapabilityValidator;
  simulate?: CapabilitySimulationAdapter;
  telemetry: readonly TelemetryEventName[];
};
```

This is a target contract, not code to introduce wholesale. It becomes justified after the second real reuse of a capability.

World objects should expose compatibility information instead of knowing vehicle types:

```ts
type Affordance =
  | { type: "towable"; massKg: number; connection: "rigid" | "cable" }
  | { type: "harvestable"; resourceId: string; quantity: number }
  | { type: "repairable"; damage: number }
  | { type: "dockable"; interface: "small" | "large" };
```

The desired relationship is `capability + compatible affordance -> validated interaction`. It is not `if rig.type === "tractor"`.

### 2. Commands, transitions, and events

The durable sequence for every user, AI, or future network request is:

```text
intent -> command -> validation -> authoritative state transition -> event -> presentation/telemetry
```

Example:

```ts
type AttachTowCommand = {
  type: "attach-tow";
  actorId: EntityId;
  targetId: EntityId;
};
```

Validation owns proximity, attachment compatibility, lock state, mass, and world constraints. The state transition owns the attachment. An event lets the renderer, audio, UI, replay, analytics, and future network replication react without obtaining mutation authority.

### 3. Visibility and quality

Visibility is a policy, not a collection of ad hoc renderer conditionals:

```text
candidate world object
  -> frustum result
  -> distance class
  -> relevance / occlusion hint
  -> representation tier
  -> submission decision
  -> frame budget telemetry
```

Every tier must be allowed to degrade visual detail while preserving gameplay authority. A distant mission-critical machine may use a simple visual proxy but must retain its simulation state according to an explicit simulation-frequency contract.

### 4. Browser device and asset lifecycle

The web delivery contract needs four outcomes:

1. A supported device receives a quality profile tied to explicit budgets.
2. A constrained or failed 3D device receives a coherent fallback or recovery path.
3. Loading state represents real load progress or a truthful indeterminate state; it is never a fake completion signal.
4. Imported assets, when they become material, have manifest ownership, provenance, byte budgets, decoding strategy, fallback, and telemetry.

The current vanilla Three.js choice remains appropriate for maximum control. Nothing in this ledger recommends a React, R3F, Spline, or engine migration.

## Execution order

The order is deliberately based on leverage, dependencies, and proof cost rather than the most visually impressive proposal.

### Phase 0: Make the existing renderer budgetable

**Objective:** Turn renderer metrics into policy-ready evidence before expanding the world.

**Deliverables:**

1. `VisibilityProfile` definitions for at least low, balanced, and high quality.
2. A pure classifier for distance class and desired representation for environmental categories.
3. Explicit telemetry for submitted, culled, and tiered instance counts.
4. A documented device/profile selection and fallback policy.
5. Fixtures that prove deterministic classification at thresholds.

**Do not do yet:** GPU occlusion, a universal render graph, WebGPU migration, portal system, or a broad asset rewrite.

**Acceptance evidence:** Targeted classifier tests; representative browser capture at desktop and narrow mobile viewport; telemetry comparison showing the policy's consequences; no claim of universal hardware support without real device evidence.

### Phase 1: Prove physically coherent interaction across two machine modes

**Objective:** Deepen the portable-rig foundation without pretending ground and hover movement are identical.

**Deliverables:**

1. Collision category/mask matrix for static world, dynamic rig, trigger, sensor, pickup, projectile, and decoration.
2. A camera-mode transition contract that preserves the implemented smooth follow, look-ahead, speed FOV, reduced-motion behavior, terrain pull-in, and fallback behavior.
3. A vertical proof that uses one interaction and two locomotion profiles where the outer contract is shared but the adapters remain specialized.
4. Collision and camera telemetry sufficient to diagnose failures.

**Recommended proof:** Tractor + towable payload, then a marsh skimmer that cannot use the same traction implementation but remains eligible for a compatible delivery/tow-style activity where constraints permit it.

**Acceptance evidence:** Focused collision/camera tests, browser walkthrough of normal and obstruction cases, and a saved/reloaded interaction state.

### Phase 2: Create the semantic action lane

**Objective:** Replace one direct browser-to-state mutation path with an authoritative command lane.

**Deliverables:**

1. Command envelope for one real action.
2. Validation result with user-facing rejection reason and machine-readable code.
3. Single authoritative transition function.
4. Emitted domain event consumed by presentation and telemetry.
5. Backward-compatible input routing through the new command path.

**Recommended proof:** `attach-tow` or module installation, because either has concrete compatibility, state, persistence, and feedback needs.

**Acceptance evidence:** Valid, invalid, duplicate, and recovery scenarios; save/load continuity; deterministic event ordering for a seeded test sequence.

### Phase 3: Validate content before it reaches simulation

**Objective:** Make new rigs, activities, and future assets safe to evolve without allowing arbitrary runtime data.

**Deliverables:**

1. Versioned manifest schema for one content class.
2. Schema, reference, semantic, compatibility, and budget validation.
3. Immutable normalized runtime definition.
4. Explicit migration path for previously persisted instances.
5. Content inspection output that points to source manifest and failed rule.

**Recommended proof:** A rig/module or activity manifest whose requirements are capability constraints, not a hard-coded allowed rig list.

**Acceptance evidence:** Valid fixture, rejected unknown reference, impossible capability combination, invalid asset reference, legacy-version migration, and source-linked error output.

### Phase 4: Introduce streaming only under measured pressure

**Trigger:** Established memory, load-time, draw-call, CPU, or asset residency pressure that cannot be addressed by Phase 0 policy.

**Deliverables:**

1. Chunk manifest and lifecycle: requested, loading, resident, inactive, evicted, failed.
2. World-state delta ownership separate from immutable chunk definition.
3. Deterministic activation/deactivation rules around the player and activity relevance.
4. Background load budget, cancellation, and failure recovery.
5. Save/migration and telemetry integration.

**Do not do yet:** Market the system as seamless open-world streaming until long traversal and failure recovery have runtime evidence.

### Phase 5: Replay and authority when actual product pressure exists

**Trigger:** A debugging, ghost, shared-state, or live-event need that demands repeatable intent logs.

**Deliverables:**

1. Seed plus versioned semantic command log.
2. Replay verifier and divergence report.
3. Snapshot and recovery policy.
4. Authority policy only when two writers can affect the same durable object.

**Acceptance evidence:** A short recorded sequence reaches the same digest/state on replay. Multiplayer is not claimed until contention, validation, reconciliation, and real transport behavior have all been exercised.

## Measurable budget system

The project already captures useful raw metrics. These thresholds should be chosen after a baseline capture, not copied from generic engine advice:

| Budget domain          | Required metrics                                                  | Policy decision enabled                                    |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| Frame responsiveness   | p50/p95 frame time, controllable-time-to-ready                    | Quality profile selection, adaptive degradation guardrails |
| GPU submission         | draw calls, triangles, visible instances, shadow/transparent work | LOD/culling/material decisions                             |
| Main-thread simulation | fixed-step count, physics/collision/AI/action time                | Simulation-frequency tiers and chunk activation limits     |
| Memory                 | heap, resident chunks/assets, retained decals/furrows/particles   | Eviction and representation caps                           |
| Network, later         | command rate, snapshot size, round-trip and reconciliation count  | Authority and replication model                            |
| Persistence            | save duration, bytes, migration duration/failure                  | Snapshot interval and state-shape decisions                |

No numerical target should be called a product budget until it is tied to a supported device class, an observed baseline, and a gameplay acceptance case.

## Vertical proof ladder

Architecture becomes real only when gameplay proves the boundary.

| Proof                             | Questions answered                                                                                    | Must not be faked by                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Tractor plus trailer              | Capability state, affordance compatibility, collision, cargo/tow persistence, detach/failure feedback | A UI-only toggle or vehicle-type branch          |
| Marsh skimmer                     | Specialized locomotion adapter, water/terrain transition, camera adaptation, shared semantic controls | Reusing wheeled traction under a different label |
| Stationary pump, turret, or drill | Machines that do not move, resource/power ownership, world persistence, autonomous operation          | Extending `Vehicle` with empty movement behavior |
| Drone                             | Three-dimensional locomotion, remote control, scan capability, alternate camera, line-of-sight        | A renderer-only free camera                      |
| Capability-gated activity         | Activity eligibility based on constraints and affordances                                             | `allowedRigTypes: ["car"]` style identity lists  |

The next framework extraction must be justified by evidence from at least two entries in this ladder.

## Explicit non-claims

This audit does **not** establish that Rigs Unbound currently has:

- occlusion culling, portal culling, or streaming world lifecycle;
- full multi-domain LOD;
- a render graph or material-modifier stack;
- collision masks/categories or a generalized broadphase;
- authoritative command/event architecture;
- deterministic replay;
- mod/plugin loading;
- multiplayer authority or networking;
- full ECS;
- generated-content validation;
- device fallback verified on real low-end hardware;
- a completed asset compression/provenance pipeline.

Those are implementation and verification tracks, not wording upgrades.

## Decision and documentation routing

| Topic                                    | Canonical next artifact                                                                                                                                | Required when                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Visibility profiles and quality fallback | ADR plus renderer/performance design note                                                                                                              | Before changing renderer selection policy                   |
| Collision categories/masks               | ADR or collision contract note                                                                                                                         | Before new interaction classes or projectiles               |
| Command/event lane                       | Extend or confirm [`ADR-0011`](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0011-command-capability-affordance-state-separation.md) | Before moving input handlers to commands                    |
| Manifest validation/versioning           | ADR plus schema/fixture documentation                                                                                                                  | Before externalized content starts driving runtime behavior |
| Streaming lifecycle                      | ADR plus chunk state-machine design                                                                                                                    | Only after measured pressure triggers the work              |
| Replay/authority                         | ADR plus replay format/version policy                                                                                                                  | Before shared world or ghost/replay claims                  |

Every implementation pass should append a dated evidence update to the applicable research/decision record rather than silently rewriting this planning snapshot.

## Three-pass review protocol for each implementation chunk

1. **Immediate correctness:** inspect contract callers, fixtures, invalid input, persistence impact, and user-visible failure behavior.
2. **Architecture:** confirm a single owner, no alternate mutation path, explicit migration, measurable budget impact, and no speculative generalization.
3. **Motto and handoff readiness:** record evidence tier, commands/checks run, runtime proof versus inference, open risk, and concrete closure condition.

## Current conclusion

The correct next architectural investment is not advanced shaders, a full ECS, multiplayer, or a giant streaming system. It is to make the existing renderer and simulation **explicitly budgeted and contract-driven**, then prove composition through a small number of radically different machines and interactions.

That preserves the strongest existing foundations:

- fixed-step deterministic simulation;
- portable rig profiles and locomotion adapters;
- seeded persistent-world behavior;
- renderer instancing and instrumentation;
- save migration and recovery;
- existing command/capability/affordance ADR direction.

It also closes the highest-risk seams before they turn into architectural debt: unmodeled visibility/LOD policy, direct state mutation from input, collision categories, camera-mode transition evidence, unvalidated content, and unmeasured device quality behavior.

## Addendum (2026-07-26) - accessibility and camera evidence correction

The `Accessibility Auditor` skill was applied after the initial ledger draft.
Current source and the existing runtime accessibility findings establish the
following:

- `index.html` has a named, keyboard-focusable playable canvas, a skip link to
  it, semantic landmarks, labelled controls, and labelled touch actions;
- `src/styles.css` supplies visible focus treatment and a
  `prefers-reduced-motion` stylesheet path;
- `src/game/renderer.ts` reads `prefers-reduced-motion`, suppresses
  presentation-only speed FOV expansion under that preference, and resolves
  terrain/obstacle obstruction through pull-in and deterministic alternate
  camera candidates;
- [`ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md`](ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md)
  records earlier Tier 4 confirmation that the skip link and focus handoff
  operate in the Field 02 browser surface.

The open delivery gap is therefore not basic keyboard entry or camera
obstruction. It is explicit, observable startup/profile/failure communication:

- no current source evidence in this pass proves a public loading progress or
  `aria-busy` contract;
- profile selection/degradation still needs named runtime evidence;
- keyboard-only completion, screen-reader announcements, reduced-motion camera
  behavior, and degraded-WebGL recovery each require fresh end-to-end evidence
  before an accessibility or device-support completion claim.

Evidence tier: Tier 1 current static inspection, plus the separately recorded
Tier 4 browser observation cited above. No browser or accessibility test was
run in this ledger update.

## Addendum (2026-07-26) - command and event maturity correction

The current source does not yet have a general command bus, but it has crossed
the most useful first boundary: [`resolvePrimaryAction`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
derives the current semantic action and its player/accessibility label without
mutating state. The same resolution drives the later mutation path, so desktop,
touch, and browser automation do not independently infer the active verb.

The remaining gap is precise:

| Present now                                                | Still required before replay/authority claims                    |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| Fixed-step simulation and local state-transition functions | Versioned semantic command envelope                              |
| Semantic primary-action resolution                         | Structured validation response and stable rejection codes        |
| Run-record commands, checkpoints, inputs, and saves        | Shared domain-event envelope with origin ownership               |
| Snapshot-driven renderer/UI response                       | Explicit replayable versus diagnostics-only event classification |
| Capability-aware local action gating                       | Ordering, deduplication, and fan-out policy                      |

## Addendum (2026-07-26) - visibility, camera, portal, and collision boundaries are now split into distinct evidence lanes

The follow-up `3d-games` review in this audit clarified four lanes that should
stay separate instead of collapsing into one generic renderer story:

- **Visibility / LOD:** `src/game/visibility.ts` now makes the near/mid/far/
  culled seam explicit for prop visibility and performance diagnostics, but it
  is still a policy seam rather than representation-changing asset LOD or
  subsystem cadence control.
- **Camera:** `src/game/camera.ts`, `src/game/renderer.ts`, and
  `src/main.ts` already hold a real mode/mount/obstruction policy. That lane is
  mature enough that the remaining work is product-facing recommendation or
  exposure, not a second camera state machine.
- **Portal visibility:** `src/game/world.ts` and `src/game/renderer.ts` still
  read as open-world first. The portal contract remains future-bound because no
  room graph, portal edge state, or portal telemetry exists in the live path.
- **Collision:** `src/game/collision.ts` plus `src/game/terrain-traversal.ts`
  give the runtime a narrow deterministic obstacle and terrain-face boundary,
  but no broad collision category/mask registry yet. The current matrix trigger
  should remain deferred until a third contact class actually needs it.

The useful synthesis is that the repo now has multiple named evidence lanes,
not one monolithic “3D polish” bucket. That is the right shape for the next
vertical proofs: use the lanes independently, keep each contract honest, and do
not promote one lane’s policy seam into another lane’s architecture.

Evidence depth: Tier 1 static source inspection for this audit pass. No fresh
runtime capture was run here.

[`src/main.ts`](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts) still
records a command/checkpoint around several direct calls such as module
installation, repair, recovery, rig switching, and primary action. That is
valuable observable behavior, but the recorder is not authoritative validation
or a reusable event graph. The correct next proof remains one high-impact
interaction that travels through `command -> validation -> transition -> event
-> presentation` with valid, invalid, duplicate, and persistence outcomes.

Evidence tier: Tier 1 current static inspection. Existing runtime observations
in ADR-0011 and the event-graph contract remain separate evidence, and no new
browser or test execution is claimed here.

## Addendum (2026-07-26) - capability and affordance maturity correction

The current rig model is already composition-first in the important sense:

- immutable rig profiles declare a mobility adapter and base capabilities;
- `effectiveProfile` composes installed modules into a derived capability set;
- `hasCapability` queries that derived set rather than branching on a rig name;
- `resolvePrimaryAction` produces a shared semantic action before the mutation
  path consumes it.

This supports the machine-centric product direction today. It is not yet the
versioned capability/affordance platform proposed for later growth. The missing
contracts remain:

| Current local behavior                           | Required before activities, planners, or external content can rely on it                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Capability identifiers and module composition    | Versioned capability definitions with requirements, state, actions, validation, telemetry, and migration semantics |
| World sites and action-specific proximity checks | Versioned world-affordance definitions with owning domain and constraints                                          |
| Player-facing diagnostic prose                   | Structured legal/deferred/impossible resolution result and stable reason codes                                     |
| State-local compatibility decisions              | Shared deterministic resolver consumable by activities, behavior, and future authority layers                      |

The next proof should therefore be a single affordance resolver around an
existing interaction, not a generic capability framework. It must return a
structured acceptance or rejection while preserving the existing semantic
action and player-facing explanation.

Evidence tier: Tier 1 current static inspection. No new runtime or test claim
is made by this addendum.

## Addendum (2026-07-26) - material and lighting maturity correction

The current renderer has a deliberate browser-safe visual baseline:

- `MeshStandardMaterial` carries terrain, props, and machines;
- terrain uses vertex color and stable tint rather than imported texture assets;
- the water, sky, discovery cues, headlights, and particles each use the
  narrowest material class that serves their visual role;
- ACES tone mapping, a directional sun, hemisphere fill, phase-driven
  fog/sky/headlight changes, and blob shadows provide readable day/gloam/night
  presentation without dynamic shadow-map cost.

This is a valid first-playable strategy, not a temporary graphics failure. The
remaining long-term work is contract work:

| Preserve                                                        | Add only after a measured need                                               |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Data-driven terrain identity and simulation-owned surface state | Layered base/modifier schema for weather, mud, wear, damage, and hazard cues |
| Instanced standard-material props                               | Representation-specific material simplification tied to visibility tiers     |
| Blob shadows and phase readability                              | Profile-governed lighting/shadow fallback matrix                             |
| Presentation-only visual response                               | Operator-visible active material/lighting strategy and fallback reason       |

No custom shader, render graph, or material-modifier framework is justified by
the current evidence alone. The first such proof must solve one named gameplay
cue, preserve a no-custom-material fallback, and expose its active strategy to
telemetry or a developer surface.

Evidence tier: Tier 1 current static inspection. Existing runtime observations
in the material and lighting contracts are separate evidence; this ledger
addendum makes no new browser-performance claim.

## Addendum (2026-07-26) - browser delivery, loading, and fallback are the next web-experience gate

- Re-checked the live browser daemon on the current Field 02 acceptance URL;
  the page is still live and the title remains `Rigs Unbound — Field 02`.
- The 3d-web-experience pass makes the next contract boundary explicit:
  browser delivery is not just "rendering works"; it must also define truthful
  loading state, recoverable fallback behavior, and explicit low/balanced/high
  quality-profile selection for constrained devices.
- Current runtime evidence already gives the project a canvas-first shell and
  diagnostics hooks, so the next proof should formalize the delivery contract
  rather than changing the Three.js stack.
- Evidence depth: Tier 4 runtime/status observation plus Tier 1 doc and skill
  inspection.

## Continuation checklist

- [ ] Record a baseline capture that binds current telemetry to a device/profile and playable scenario.
- [ ] Select the Phase 0 vertical proof and create its ADR/design contract before renderer behavior changes.
- [ ] Implement and verify Phase 0 under the three-pass protocol.
- [ ] Add evidence and remaining gaps to [`EXPLORATION_MAP.md`](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md).
- [ ] Select Phase 1 only after Phase 0 establishes policy and measurable pressure.
- [ ] Keep this ledger active until every non-claim is either proved, deliberately deferred with a trigger, or removed from product direction.

## Addendum (2026-07-27): reread bridge for the optimization-gaps thread

- The reread of the "3D Game Optimization Gaps" thread is archived in
  [Additional ChatGPT Research Ingestion](./ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md).
- The ledger already turns the conversation into repo-specific execution
  guidance; this addendum simply makes the updated ordering easy to reach from
  the same canonical trail.
- The durable sequence remains: kernel/simulation invariants first, then
  capability and affordance contracts, then migration/observability, then
  streaming and authority only after measurable pressure.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this execution ledger. This document still owns the
skill-to-repo guidance and sequencing frame; the new note carries the wider
machine-keeper thesis and long-range product direction.
