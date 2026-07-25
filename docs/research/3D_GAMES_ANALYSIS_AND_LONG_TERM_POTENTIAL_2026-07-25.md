# 3D Games Technical Analysis (Rigs Unbound)

## Context and goal

Date: 2026-07-25

Owner: Pranay

Scope: Full in-repo technical+product analysis of current Rigs Unbound state for a 3D-first, long-term architecture, using the 3D game development skill principles.

Primary analysis lens:
- 3D games rendering/physics/camera principles
- Existing architecture in this repository
- Long-term, versioned and principle-aligned decisions (`motto_v4` direction)

## Skill used

- `[3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)`

## What is already there (current evidence)

### Runtime and architecture

- **Deterministic fixed-step gameplay kernel** is implemented and centralized.
  - Core orchestration path is in `src/game/state.ts` with explicit `tickMs` stepping and controlled state transitions.
- **Content is data-driven for core game definitions**:
  - Vehicle rig profiles, modules, actions, capabilities in `src/game/contracts.ts`.
  - World sites/routes/surfaces/limits in `src/game/world.ts`.
- **Split state model** for simulation/runtime vs persistable memory is present.
  - Runtime slices: terrain/exploration/obstacle runtime in `src/game/gameworld.ts`.
  - Persistent/savable memory uses versioned keys in `src/game/storage.ts` and migration helpers in `src/game/state.ts`.
- **Procedural world substrate** is implemented around heightmaps, anchors, routes, and grading/slope sampling in `src/game/terrain.ts`.
- **Physics/collision are custom and lightweight**:
  - Locomotion envelope (`traction`, `grade`, `stability`, `jump`) in `src/game/physics.ts`.
  - Deterministic obstacle resolution in `src/game/collision.ts` with a bounded obstacle model.
- **Renderer path is explicit and coherent**:
  - Three.js scene bootstrap and per-frame render pipeline in `src/game/renderer.ts`.
  - Terrain mesh, instanced props, minimap rendering, lights, sky/skybox transitions and basic post-state rendering in renderer + minimap pipeline.
- **Observability already exists**:
  - Metrics in `src/game/performance.ts`.
  - Debug/test hooks and publicState exposure in `src/game/state.ts`, plus browser hooks in `src/main.ts`.

### Existing UI/UX state and product positioning

- HUD, map, vehicle HUD, event messaging are in place.
- The core fantasy currently sits in a single strong baseline (tractors with multi-rig identity, modular tools, procedural terrain + authored world anchors).
- Existing decisions and exploration docs already encode long-term continuity concerns (`docs/exploration/EXPLORATION_MAP.md`, `docs/decisions` ADRs).

## What is strong right now

1. **First-principles separation is already happening in core areas**
   - Simulation is not tightly coupled to renderer.
   - Save/migration/versioning is already present.
2. **Directional clarity for long-term evolution**
   - `RIG_PROFILES`, capability actions, and module compatibility support extension to other locomotion families.
3. **Performance-conscious choices are visible**
   - Bounded map structures, capped world cell counts, deterministic step size.
4. **Good foundation for replayability and analytics**
   - Public state snapshots and debug window APIs support deterministic reproducibility and testing.

## Gaps against 3D-Games principles (from skill reference)

### 1) Rendering pipeline robustness

- **Frustum culling** is currently partial; there is scene structure but no explicit per-object frustum check pass listed in source.
- **Occlusion culling** appears not yet implemented as a deterministic pipeline stage.
- **LOD discipline** is mostly implicit (distance-aware drawing behavior not yet formally staged by asset/model LOD tiers).
- **Batching exists partially** through instancing, but not yet a formal draw-call budget and policy.

### 2) Shaders and effects

- No custom shader modules yet; this is okay for baseline and now, but custom surfaces will be needed to establish visual identity and non-trivial readability effects (terrain transitions, hazard feedback, weather cues, low-cost atmospheric cues).

### 3) Physics quality envelope

- The physics model is simplified and performant; good for first-playable iteration.
- It currently does not use a general collision layer stack (dynamic broadphase, layered masks, per-shape behavior) and remains intentionally constrained.
- For richer interactions, we should track where simplified assumptions become fragile (e.g., steep terrain, stacked obstacles, high-speed cornering, water interactions).

### 4) Camera system

- Camera modes and transitions exist but need formalized “feel” contracts:
  - acceleration/lift for chase follow,
  - obstruction handling,
  - explicit transition states,
  - adaptive FOV for speed and uncertainty states,
  - accessibility alternatives for motion-sensitive users.

### 5) Lighting and atmosphere

- Real-time shadows are likely conservative or minimal currently (reasonable), but there is no clear staged lighting strategy across quality tiers.
- No explicit baked/probe strategy for static scenes and no authored-lighting fallback by tier.

### 6) Accessibility and input

- Input remapping exists for keyboard/gamepad in principle.
- Need stronger named-action abstraction and user-tunable feel for sensitivity/motion/visual comfort (especially for camera shake, FOV spikes, and color/accessibility contrast).

### 7) World and architecture scalability

- World is already split into authored schema + procedural layers, but streaming/chunk migration and activity packing still appear to be early-phase.
- Multiplayer/online readiness is exploratory only; no authority boundary yet.

## What is possible next (bounded, long-term aligned)

### Immediate (low-risk, high value)

1. **Rendering hardening pass**
   - Add deterministic culling layers (frustum + distance LOD bucket + instancing policy).
   - Add per-camera debug counters and fail-safe budgets for draw calls.
2. **Shader-level visual language (minimal)**
   - Add one stylized world-shader path for slope/wetness/terrain transitions.
   - Add one lightweight effect shader/material variant for hazard zones.
3. **Physics hardening without architecture rewrite**
   - Keep custom kernel, add explicit terrain-contact/obstacle stability invariants and regression probes.
   - Introduce collision-layer flags for intent categories (ground, obstacle, fluid, hazard).
4. **Camera feel contracts**
   - Define transition table (`mode × speed × terrain × danger × user setting`).
5. **Save + migration observability uplift**
   - Ensure every world mutation path writes a reason code + version metadata.

### Near term (mid-risk, high leverage)

1. **Capability-first expansion to second locomotion family**
   - Use profile + adapter approach already present (`ground` profile scaffold) and add one constrained second family for proof.
2. **Authoring/tooling companion path**
   - Introduce validator-first content manifests for activities/world modules with reproducible check results.
3. **Deterministic streaming strategy**
   - Formalize “chunk request → load → validate → activate → rollback” for broader area coverage.
4. **Cross-mode continuity proof**
   - Reuse one semantic action set across at least one non-chase presentation mode.

### Later (higher risk, high upside)

1. **Engine branch evaluation**
   - Keep Three.js as canonical v1 but run one short benchmark branch for alternates if mobile budgets fail.
2. **Authority model groundwork**
   - Client simulation + server-authenticated mutation model for durable values.
3. **Replay/ghost pipeline as product feature**
   - Deterministic run records now can be shared with seed-sharing/social surfaces.

## Evidence and verification status

### Tier-2 (targeted static/runtime checks already possible)

- Gameplay kernel, migrations, rendering, and world model have source-level evidence.
- Existing tests include `src/game/state.test.ts` and `src/game/terrain.test.ts`.

### Required to raise confidence above Tier-2

- Add tests for:
  - culling correctness (non-visible entities absent from render path),
  - camera transition determinism,
  - collision invariants on extreme terrain slopes,
  - save/version migration matrix with negative corruption cases,
  - renderer fallback behavior under reduced capability.

## Strategic recommendation

### Recommendation R1 (primary)

Preserve and deepen current architecture instead of replacing it.

- Keep custom fixed-step kernel and data-driven content model.
- Treat rendering/physics as iterative hardening layers, not rewrites.
- Drive long-term expansion through capability interfaces (`RIG_PROFILES`, activity contracts, world manifests) rather than engine rewrites.

### Recommendation R2

Create a single “performance and readability baseline ADR” to bind:
- culling thresholds,
- LOD tiers,
- camera mode matrix,
- collision layer semantics.

This will reduce future drift and preserve long-term coherence with low overhead.

## Concrete follow-up work (ready-to-start)

1. `docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md` now captures renderer budget thresholds and a visual language plan.
2. `docs/research/CULLING_LOD_SPIKE_TESTS_2026-07-25.md` now captures the deterministic culling + LOD spike-test plan tied to fixture scenes.
3. `docs/decisions/ADR-0015-renderer-camera-policy-v1x.md` now documents the renderer/camera policy for v1.x to avoid ad-hoc growth.
4. `docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md` now captures the instrumentation KPIs for per-frame actor count, active physics count, and transition latency in production-like profiles.
5. `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md` now binds the first public smoke test gate across camera, accessibility, and fallback behavior.
6. `docs/research/PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md` now answers the high-speed readability question by binding physics to the shared perception frame.
7. `docs/decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md` now binds the shared threshold bands, fallback order, and capture bundle for public acceptance.
8. `docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md` now names the canonical comparison scenes for threshold capture bundles.
9. `docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md` now maps each subsystem to the most explanatory canonical capture.
10. `docs/research/READABILITY_METRIC_RUBRIC_2026-07-25.md` now names the primary predictor and supporting signals for unreadability review.
11. `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md` now names the player loop, progression grammar, and opportunity guidance for the machine-centric first playable.
12. `docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md` now names the browser loading and profile-bootstrap contract so the app never starts as a dead box.

## Open risks and residual questions

The major open risk list from the initial audit is now converted into named contracts and addenda. Remaining work is fixture-specific threshold tuning, capture selection, capture review, play-loop tuning, and runtime bootstrap enforcement, not policy discovery.

## Decision notes for long-term continuity

No architecture rewrite is proposed in this pass.

The codebase currently shows a strong base for this direction, and the highest-leverage path is:
- lock contracts early,
- tighten rendering/physics invariants,
- then expand gameplay breadth through capability-backed modular growth.

Addendum (2026-07-25): the first public smoke test gate is now explicitly documented in `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md`, so accessibility and readability are now acceptance contracts rather than open-ended questions.
The second locomotion family and authority boundary are also named later in this document as addenda, so they are no longer open risks here.
Addendum (2026-07-25): the high-speed readability question is now explicitly documented in `docs/research/PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md`, so physics speed is governed as a perception contract rather than a new engine requirement.
Addendum (2026-07-25): the remaining shared threshold questions are now bound by `docs/decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md`, which defines the bands, fallback order, and comparison bundle for public acceptance.
Addendum (2026-07-25): `docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md` now names the canonical comparison scenes used when those thresholds are compared over time.
Addendum (2026-07-25): `docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md` now maps each subsystem to the most explanatory comparison capture.
Addendum (2026-07-25): `docs/research/READABILITY_METRIC_RUBRIC_2026-07-25.md` now ranks transition latency first when a fixture starts to look unreadable.
Addendum (2026-07-25): `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md` now binds the 30-second loop, session loop, and long arc for the tractor-centric first playable.
Addendum (2026-07-25): `docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md` now binds the browser loading state, profile bootstrap, and fallback visibility.
Addendum (2026-07-25): `docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md` now binds the rig-capability surface, adapter registry, and affordance-resolution questions so capability checks stop being treated as ad hoc unions.
Addendum (2026-07-25): `docs/research/BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md` now binds the command-to-decision gap, planner determinism, and read-only decision layer so future AI or activity logic stays below the kernel.
Addendum (2026-07-25): `docs/research/STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md` now binds the chunk-manifest gap, residency lifecycle, and unload/rollback rules so world scale remains deterministic.
Addendum (2026-07-25): `docs/research/SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md` now binds the owned-domain order, budget governance, and downgrade visibility so multi-domain simulation stays composable.
Addendum (2026-07-25): `docs/research/MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md` now binds the pack lifecycle, compatibility checks, and safe rollback boundary so creator growth stays versioned and controlled.
Addendum (2026-07-25): `docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md` now binds the world-verb, capability-claim, and deterministic resolution boundary so interactions stay readable and reusable.
Addendum (2026-07-25): `docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md` now binds the source-artifact to runtime-manifest boundary so assets stay validated, versioned, and replaceable.
Addendum (2026-07-25): `docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md` now binds the layered material, readability, and fallback boundary so visual language stays composable.
Addendum (2026-07-25): `docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md` now binds the tiered lighting, shadow fallback, and atmosphere readability boundary so mood never obscures play.
Addendum (2026-07-25): `docs/research/PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md` now binds the room-portal graph and bounded-room visibility boundary so interiors scale with the same deterministic rules.
Addendum (2026-07-25): `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md` now binds the action-model, remap persistence, and device-parity boundary so controls stay readable across input surfaces.
Addendum (2026-07-25): `docs/research/KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md` now binds the authoritative tick-order and subsystem-gate boundary so future mutable systems stay replay-safe.
Addendum (2026-07-25): `docs/research/SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md` now binds the persistence explanation boundary so save and migration events stay auditable.
Addendum (2026-07-25): `docs/research/AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md` now binds the manifest-validation boundary so activities and world modules stay reproducible.
Addendum (2026-07-25): `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md` now binds the umbrella policy layer so the shared thresholds stay measurable and readable.
Addendum (2026-07-25): `docs/research/SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md` now binds the second motion grammar and cross-mode continuity boundary so new rigs preserve shared actions and rollback.
Addendum (2026-07-25): `docs/research/AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md` now binds the local-first authority boundary so durable state stays future-gated and explicit.
Addendum (2026-07-25): `docs/research/ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md` now binds the bounded backend-comparison boundary so alternates stay disposable unless evidence justifies migration.
Addendum (2026-07-25): `docs/research/VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md` now binds the evidence-harness boundary so confidence changes are reproducible and auditable.

## Addendum (2026-07-25): Untrusted ChatGPT optimization-context audit

Source checked: untrusted external context, `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676`.
Date checked against repo state: 2026-07-25.
Required policy: evidence-first; treat all external optimization claims as hypotheses until validated against source and runtime.

### 1) Core 3D optimization checklist

| Checkpoint | Current implementation | Evidence in repo | Status |
|---|---|---|---|
| Frustum culling | Per-object frustum cull is not enforced; many heavy batches are explicitly marked `frustumCulled = false`. | `src/game/renderer.ts:433`, `src/game/renderer.ts:591`, `src/game/renderer.ts:848` | Partial/blocked |
| Distance culling | No global distance culling stage exists. Visibility is mostly bounded by local prop rebuild radius and terrain region updates. | `src/game/renderer.ts:56-57`, `src/game/renderer.ts:441-447`, `src/game/renderer.ts:1302-1328` | Missing |
| Occlusion culling | Terrain occlusion helper is used only for camera pull-in, not as render-object occlusion pipeline. | `src/game/terrain.ts:736-765`, `src/game/renderer.ts:1542-1562` | Partial/blocked |
| Portal culling | No portal/bounded room graph. | `src/game/world.ts` has authored sites but no room/portal graph | Missing |
| Sector/chunk culling (render streaming) | Terrain is built in a full local mesh radius; no chunk streaming lifecycle. | `src/game/renderer.ts:242-318`, `src/game/terrain.ts:26-46` | Missing |
| LOD hierarchy | No explicit geometry/material/animation/AI/physics LOD tiers in render or update path. | `src/game/renderer.ts:390-434` (instanced props), `src/game/physics.ts` (single motion model), `src/game/collision.ts` (uniform obstacle treatment) | Missing |
| Shader strategy | Mostly `MeshStandardMaterial` plus vertex-color terrain; no custom shader modules in shipped code. | `src/game/renderer.ts:307-314`, `src/game/terrain.ts:2-8`, `src/game/world.ts:34-53` | Missing |
| Camera feel contracts | Camera has stateful modes with interpolation and terrain-aware pull-in; no formal transition/state machine contract or explicit accessibility policy in code path. | `src/game/renderer.ts:1461-1617`, `src/game/renderer.ts:1600-1607`, `docs/decisions/ADR-0008-camera-policies-and-direct-view-selection.md` | Partial |
| Collision layers / matrix | Spatial query is nearby-cell obstacle query; no multi-layer matrix for hazard/trigger/projectile separation. | `src/game/collision.ts:159-180`, `src/game/collision.ts:182-256` | Partial |
| Authority scaling | Deterministic local simulation only; no server-authoritative handoff or replay transport. | `src/game/state.ts:4-13`, `src/game/state.ts:194-203`, `src/game/contracts.ts` | Missing for scaling |

### 2) Additional systems from the same context

| Topic | Current implementation | Status |
|---|---|---|
| ECS | Game core is data-driven and module-organized but not ECS-based. | Missing |
| Streaming world | No tile/chunk streaming and reactivity cycle. | Missing |
| Asset pipeline | No formal texture/material/deformation-of-assets pipeline; procedural primitives and vertex-color terrain are baseline path. | Partial |
| Simulation layers | Physics, collision, and terrain are separated and deterministic, but no full multi-domain simulation graph (weather/economy/traffic/etc). | Partial |
| Behaviour system | No AI behavior tree/utility/planner system in play loop. | Missing |
| Event system | No general world-event scheduler/handler graph. | Missing |
| Modding architecture | Content is data-driven by profiles and world descriptors, but not user extension/mod surface yet. | Partial |
| Deterministic replay | Deterministic kernel and public snapshot exist; a bounded input-recording lane plus browser-visible verification hook now exist, but durable playback API remains missing. | Partial |
| Resource budgets | Runtime exposes draw calls/frame timing, but no explicit cross-system CPU/GPU/battery budget scheduler. | Partial |

### 3) What is actually strong already

- Deterministic gameplay kernel and bounded simulation surface remain a major advantage for long-term scaling.
- Terrain and obstacle generation are canonical and shared across physics, collision, and rendering; this is the same foundation needed for future culling/streaming/refactor work.
- Instanced props, batched updates, and fixed prop radius already reduce per-frame overhead versus naive object-per-prop world generation.
- Camera includes occlusion-derived pull-in and speed-dependent FOV, giving a usable feel skeleton.

### 4) Recommended audit-driven plan (ordered by highest leverage)

1. **Renderer hardening sprint (high priority):** add explicit distance buckets (`near/mid/far`) and formal frustum + object visibility test before draw submission.
2. **Shader + visual identity sprint:** create one minimal terrain material variant and one hazard material variant with shared constants.
3. **Collision-layer refactor sprint:** introduce `CollisionCategory` + `CollisionMask` contracts and route all obstacle/contact responses through category checks.
4. **Authority and replay sprint:** add authoritative simulation token + input log format + replay playback verification mode.
5. **World growth sprint:** define chunk manifest, load radius policy, unload policy, and route activation order with observability counters.

### 5) Skill alignment

- Skill in use: `3d-games` for architecture audit discipline and staged system hardening.
- Skill in use for visual/shader recommendations: `threejs-materials`.

### 6) Evidence and confidence

- Tier 1: static inspection confirms mapping claims.
- Tier 2: one runtime smoke pass would be required to raise confidence on frustum/distance/LOD behavior.
- Tier 3+: not run in this turn; the next step is to validate the sprint outputs by measuring draw-call budgets, frame percentile changes, and camera occlusion edge cases on representative hardware.

## Addendum (2026-07-25): Optimization continuation audit (second pass)

Source checked (same untrusted conversation): `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676`.
Scope added: gameplay architecture invariants behind the earlier rendering/perf list.

### A) Additional systems checkpoint — status vs implementation

| Checkpoint | Current implementation in repo | Evidence | Status |
|---|---|---|---|
| Deterministic gameplay kernel | Kernel updates are fixed-step and ordered through `stepGame`, then surfaced through deterministic public state + browser stepping. | `src/game/state.ts:516-575`, `src/main.ts:666-701`, `src/main.ts:632`, `src/game/state.ts:692` | Strong (in place) |
| World schema + world truth | Terrain/route/site content is authored as data and sampled/compiled by core substrate rather than spread across renderer behavior. | `src/game/world.ts`, `src/game/terrain.ts`, `src/game/contracts.ts`, `src/game/state.ts:692` | Strong (in place) |
| Renderer/subsystem separation | Render uses `GameWorld` snapshots for display only; simulation writes state/mutations. | `src/game/state.ts`, `src/game/renderer.ts`, `src/game/gameworld.ts` | Strong (in place) |
| Physics/locomotion separation | Motion model (`physics.ts`) is separate from state policy (`state.ts`) and terrain/collision contracts. | `src/game/physics.ts`, `src/game/state.ts`, `src/game/collision.ts`, `src/game/terrain.ts` | Strong/partial |
| Storage + migration discipline | Multi-version schema path with explicit v1/v2/v3 migration and recovery notes exists. | `src/game/state.ts:823-1360`, `src/game/storage.ts`, `src/game/contracts.ts` | Strong (in place) |
| Observability | Renderer metrics, save/perf snapshots, deterministic public debug surfaces, and browser acceptance hooks are present. | `src/game/performance.ts`, `src/game/state.ts:692`, `src/main.ts:587`, `src/main.ts:699` | Strong and expanding |
| ECS migration readiness | Not adopted; data is still module-structured with fixed adapters and deterministic interfaces. | `src/game/contracts.ts`, `src/game/state.ts`, `src/game/physics.ts` | Missing by design (planned) |
| Streaming world | No chunk lifecycle, no streaming manifest activation, no unload policy yet. | `src/game/terrain.ts`, `src/game/renderer.ts` | Missing |
| Behavior/event schedulers | No global BT/GOAP/event graph yet; behavior is event-driven in state/contract surface only. | `src/game/state.ts` | Missing |
| Replay transport | Replay is logically possible from deterministic kernel, and the browser now exposes a bounded run record plus structural verification hook. Durable input-log playback mode is still not a first-class API. | `src/game/state.ts`, `src/main.ts`, `src/game/run-record.ts` | Partial |

### B) High-signal follow-up ordering (from added content)

1. **Kernel hardening lane** (no engine swap): lock step ordering proof for all mutable subsystems (AI/mission/economy hooks when added) and keep renderer-only from mutating state.
2. **Chunked world growth lane**: introduce `WorldChunkManifest` style lifecycle (request, validate, activate, rollback, unload) and add chunk actor caps.
3. **Collision-layer lane**: add semantic categories/masks for obstacle, hazard, trigger, and decorative layers to avoid category leaks as locomotion count grows.
4. **Replay lane**: add compact input log + run hash + playback verifier in a versioned `RunRecord` format.
5. **Authority lane** (post first smoke): define authoritative mutation token and intent queue before introducing shared rooms.

### C) Repository evidence already useful for this pass

- `PLAN_RENDER_PERFORMANCE_ACCESSIBILITY_2026-07-25.md` already sets contract-first policy prerequisites.
- `ADR-0010` already states render, performance, and accessibility gates.
- `EXPLORATION_MAP.md` already contains the full multiplayer/social/UGC maturity ladder needed for later authority decisions.
- `docs/WORKLOG.md` already records the present implementation risks and evidence tiers.

### D) New residual risks from the added pass

| Risk | Why now | Immediate evidence gap |
|---|---|---|
| Chunk boundaries are inferred only by local prop radius | No real world-streaming/active-chunk policy yet, so scale-up cost is nonlinear. | Add chunk lifecycle test fixtures and load/unload counters. |
| No semantic collision categories yet | Obstacle behavior is currently functionally correct for small world, but non-obvious interactions will become coupled when projectiles/projectiles/AI expand. | Add matrix-based response tests and category-driven fixtures. |
| Replay surface absent as product artifact | Determinism helps debugging, but no portable run artifact exists for social/QA yet. | Record/replay API + checksum replay verification in `state.ts`/`main.ts` hooks. |
| Authority claims are still speculative | Durable mutations are local-only and safe; multiplayer claims must remain future-only. | Keep authority notes in `EXPLORATION_MAP` and avoid publishing shared-room behavior. |

### E) "Additional" closeout

The continuation segment strengthens the first-pass strategy: **kernel quality is already leading**, while **streaming, categories, replay surface, and authority gates are the next architectural backlog**. This maps directly to the existing `PLAN_RENDER_PERFORMANCE_ACCESSIBILITY` and `ROADMAP/ADRs` structure and does not require a new stack or a second skill framework to proceed.

## Addendum (2026-07-25): Change planes and machine-centric growth

This repo now has enough evidence to treat the bigger “and more” architecture as a bounded platform problem, not a generic rewrite.

### 1) Separate the four planes of change

- **Invariants**: tick order, save semantics, entity identity, world mutation rules, authority rules, input action model, event ordering.
- **Capabilities**: drive, tow, harvest, dig, fly, carry, build, repair, scan, dock, and future activity verbs.
- **Content**: vehicles, terrain, missions, rewards, world regions, weather presets, and encounter sets.
- **Tuning**: acceleration, traction, friction, reward rates, spawn frequency, camera lag, fuel use, and budgets.

The durable rule is: invariants change rarely, capabilities change occasionally, content changes frequently, and tuning changes constantly. That keeps the engine from being bent by every new activity idea.

### 2) Capabilities should be contracts

For the next layer, capabilities should be versioned contracts rather than booleans. Each capability should have:

- an identifier and version,
- requirements,
- actions,
- state schema,
- validation rules,
- telemetry hooks.

That is the right shape for a tractor, drone, mech, or factory module to share the same gameplay verb without sharing the same implementation.

### 3) Commands, events, state, and presentation stay separate

The healthiest runtime shape is:

1. input / AI / network produce commands;
2. validation and authority accept or reject those commands;
3. the kernel mutates state in a deterministic order;
4. events are emitted for replay/debugging;
5. renderer/audio/UI consume snapshots and events.

This matches the current code direction, and it is the minimum shape needed for replay, multiplayer authority, and long-term debugging.

### 4) Growth should become machine-centric, not vehicle-centric

The later architecture conversation points to a broader abstraction: machines can be vehicles, factories, turrets, drills, cranes, conveyors, or stationary devices. That matters because it lets new gameplay emerge from capability composition instead of adding a separate engine branch for every mode.

The guiding question becomes:

> what new capability does this machine add to the world simulation?

not:

> what new vehicle class do we need?

### 5) Near-term proof sequence

The lowest-risk proof sequence from this addendum is:

1. add one versioned capability contract;
2. add one command/event boundary in a single lane;
3. add one non-vehicle machine or activity slice;
4. add one streaming or visibility contract that uses the same deterministic snapshot path.

The dedicated contract notes now live at
[World and Architecture Scalability Contract](./WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md)
and [Simulation Layers and Resource Governance Contract](./SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md),
so the machine-centric growth lane now points at named boundaries instead of
staying only in the synthesis prose.

For the fuller lane map, keep using `docs/research/3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md`, `docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md`, and `docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md` as the detail chain.
For the quick lane index, use [3D Game Contract Index](./3D_GAME_CONTRACT_INDEX_2026-07-25.md).

## Addendum (2026-07-25): Data, asset, and ingestion contracts

The long-term architecture is not only about simulation and rendering. It also depends on how data enters the repo and becomes runtime truth.

### 1) Data/config is product code

Any schema, manifest, lookup table, label map, reward table, capability record, or mode contract should be treated as code-like product state:

- version it,
- validate it,
- document it,
- test it,
- migrate it deliberately.

That includes authored content, generated content, and any AI-assisted content that becomes part of the runtime surface.

### 2) Asset pipeline is a contract chain

The asset path should be seen as:

1. source artifact
2. normalized export
3. registry entry
4. runtime manifest
5. validated activation

The important fields are not only geometry and texture payloads, but also:

- provenance,
- license/ownership,
- hashes,
- compression profile,
- LOD intent,
- compatibility notes,
- replacement/deprecation path.

This matches the repo’s existing asset-pipeline notes and keeps future modding/public content from becoming a second truth source.

### 3) Ingestion must validate before runtime

Authoring output should be rejected early if it fails:

- schema validation,
- semantic validation,
- reference resolution,
- compatibility checks,
- budget checks,
- migration checks.

The runtime should consume immutable, validated records only. It should not be the place where malformed content first becomes visible.

### 4) Budgets need explicit fallback behavior

Resource governance is part of architecture, not a postscript:

- CPU
- GPU
- VRAM
- bandwidth
- battery/thermal profile
- draw-call budget
- content activation budget

Each budget band should have a documented fallback policy so the game degrades visibly and predictably instead of failing silently.

The dedicated contract notes now live at
[Web Asset Ingest and Compression Contract](./WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)
and [Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md),
so the data and ingestion lane now points at named boundaries instead of
remaining a broad content note.

### 5) Why this matters now

This layer is the difference between:

- one canonical content path,
- and a pile of parallel asset/data interpretations.

It also prepares the repo for the later modding, creator, and public-evidence surfaces already discussed in the exploration map.

### 6) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned content/asset manifest,
2. one validator that rejects malformed or unlicensed input,
3. one runtime fallback when a manifest is missing or incompatible,
4. one test proving the reject path happens before activation.

## Addendum (2026-07-25): Behavior and event scheduling contracts

The next unresolved middle layer is not another renderer tweak. It is the scheduler that sits between intent and presentation.

### 1) Separate behavior from event handling

- **Behavior system** answers: what should this actor or machine do next?
- **Event system** answers: what happened, in what order, and what should be observable or replayable?

Those are related but not the same. Keeping them distinct avoids turning world updates into a chain of ad hoc side effects.

### 2) Behavior should be contract-based

Behavior should be defined with stable contracts rather than hardcoded mode branches:

- identifier and version,
- trigger conditions,
- required capabilities,
- available actions,
- preconditions,
- budget limits,
- fallback behavior,
- telemetry hook.

This allows future planners or utility-style systems to sit behind the same interface without replacing the kernel.

### 3) Events should be deterministic and replay-friendly

A useful event layer should:

- assign monotonic sequence numbers,
- preserve the authoritative mutation order,
- carry schema versioning,
- avoid duplicate writes for the same mutation,
- expose a replay-safe payload format,
- be consumable by diagnostics and presentation.

That makes events a durable audit trail rather than a second world model.

### 4) Command / behavior / event / presentation order

The target lane is:

1. commands express player or AI intent;
2. validation and authority approve or reject intent;
3. behavior chooses the next valid action;
4. the kernel mutates state;
5. events describe what changed;
6. presentation reacts to the resulting snapshot/event stream.

This is the next logical step after the bounded run-record lane, because replay and diagnostics get much more valuable once the behavior and event boundaries are explicit.

### 5) Near-term proof slice

The smallest durable proof for this addendum is:

1. one deterministic event envelope,
2. one behavior contract with a versioned schema,
3. one test proving event order is stable across a fixed input slice,
4. one test proving a rejected behavior candidate does not mutate state.

The dedicated contract notes now live at
[Behavior System and Planner Contracts](./BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md)
and [Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md),
so the scheduler lane now points at named boundaries instead of staying folded
into the prose.

## Addendum (2026-07-25): Streaming-world contracts

The last major missing world-scale layer is not just “load more terrain.” It is a chunk lifecycle with explicit ownership, validation, and rollback rules.

### 1) Streaming should be a manifest-driven lifecycle

A streaming world needs a contract such as:

1. request chunk/region,
2. validate chunk identity and compatibility,
3. activate chunk into runtime residency,
4. observe budgets and actor caps,
5. rollback or unload when out of range or invalid.

This keeps world growth deterministic and testable instead of relying on implicit radius logic.

### 2) Streaming should preserve canonical world truth

The world schema should remain the source of truth, while streaming controls residency only. That means:

- a chunk manifest names what can load,
- runtime residency decides what is active,
- unloads preserve or serialize state before eviction,
- streamed content still passes through validation and migration rules.

### 3) Streaming should be budgeted

Streaming is not free. The contract should include:

- maximum active chunks,
- maximum active actors per chunk,
- fallback policy when residency exceeds budget,
- observability counters for load latency and unload churn.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one `WorldChunkManifest` schema,
2. one request/activate/unload lifecycle test,
3. one budget counter for active chunk residency,
4. one rollback test for invalid or stale chunk activation.

The dedicated contract note now lives at
[Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md),
so the streaming lane now points at a named boundary instead of leaving the
resident-chunk policy implicit.

## Addendum (2026-07-25): ECS and entity-composition readiness

The repo’s current architecture is data-driven and module-organized. That is a good place to be, but it is still not ECS. The right next step is to define when composition should become formal ECS, and what proof would justify that move.

### 1) Keep ECS as a threshold-based decision

ECS should not be adopted because it is fashionable. It should be adopted when one or more of these become true:

- actor count becomes high enough that component iteration clearly outperforms current structure,
- cross-cutting simulation layers become too coupled for the current module shape,
- one machine class needs many optional capabilities without inheritance sprawl,
- streaming and event layers need broader entity lifecycle management than the current model can express cleanly.

Until then, the current typed state + adapter model remains the canonical path.

### 2) Formalize composition before full ECS migration

Before any full ECS migration, the repo should lock:

- entity identity,
- capability instance shape,
- adapter boundaries,
- component versioning,
- lifecycle ownership,
- migration behavior,
- event visibility.

That gives the repo a stable composition model even if ECS stays deferred.

### 3) ECS should serve the machine-centric model, not replace it

If ECS ever lands, it should make machine/capability composition easier:

- one machine becomes a set of components,
- capabilities become attached contracts,
- systems operate on bounded component sets,
- runtime ownership stays deterministic and inspectable.

That keeps ECS in service of the platform vision rather than turning it into a new hidden abstraction layer.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one composition schema for an entity with multiple capabilities,
2. one validation rule that rejects an invalid capability bundle,
3. one test proving component migration preserves identity,
4. one threshold note stating when ECS would become justified.

The dedicated contract note now lives at
[ECS Threshold and Composition Readiness Contract](./ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md),
so the proof threshold is named separately from the broader analysis.

## Addendum (2026-07-25): Authority scaling contracts

The last unresolved top-level architecture gate is authority. The repo is deterministic locally, but it still lacks a first-class authoritative mutation pipeline for shared or replayable sessions.

### 1) Authority should own truth, not presentation

Authority exists to answer:

- which commands are accepted,
- which state mutations are valid,
- which actor or host owns the mutation,
- how conflicts are resolved,
- what gets recorded for audit and replay.

That keeps simulation truth in one place and prevents client-side drift.

### 2) Authority should be command-driven

The clean shape is:

1. input / AI / network produces intent;
2. validation checks identity, capability, and world state;
3. an authority token or host resolves the outcome;
4. the kernel mutates the canonical state;
5. events and records capture the result.

This is a stronger version of the current local command path and is the prerequisite for any shared-room or server-authoritative future.

### 3) Authority needs explicit failure and recovery behavior

The contract should include:

- rejected command telemetry,
- duplicate / replayed command handling,
- stale-ownership handling,
- disconnect / reconnection recovery,
- persistence of authoritative state,
- replay compatibility with authority decisions.

Without that, authority becomes a hidden network feature instead of a durable simulation contract.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one authoritative mutation token schema,
2. one intent queue with validation outcomes,
3. one test proving duplicate commands do not double-mutate state,
4. one test proving rejected authority candidates emit explicit telemetry.

The dedicated contract note now lives at
[Authority Model Groundwork Contract](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md),
so the authority lane now points at a named boundary instead of staying as a
general future-state note.

## Addendum (2026-07-25): Simulation layers and resource governance

The repo’s core world is already deterministic, but several cross-domain systems are still only implicit. The next step is to make simulation layers explicit and give them budget owners.

### 1) Simulation layers should be named domains

Each non-render domain should have a clear responsibility and an update order. Example domains:

- terrain and traversal,
- physics and collision,
- weather and atmosphere,
- economy and resource flow,
- mission and event logic,
- AI / behavior,
- persistence and recovery,
- presentation feedback.

That keeps “multi-domain simulation” from becoming one opaque loop.

### 2) Layers need ownership and ordering

Every layer should answer:

- what state it owns,
- what state it may read,
- what state it may mutate,
- what it emits downstream,
- what it must never bypass.

This preserves the current deterministic kernel while making future growth composable instead of ad hoc.

### 3) Resource governance must be cross-layer

Budgets should not live only in rendering. They should be tracked across:

- CPU time,
- GPU load,
- active actors/entities,
- active chunks/residency,
- event volume,
- save/migration cost,
- battery/thermal sensitivity.

Each budget band should trigger an explicit fallback policy rather than hidden degradation.

### 4) Simulation layers should support proof-first expansion

This is the right place for new domains like weather, economy, traffic, and mission directors to enter the architecture: as separate owned layers that can be added one at a time, measured, and rolled back if they destabilize the budget envelope.

### 5) Near-term proof slice

The smallest durable proof for this addendum is:

1. one owned domain-order table for simulation layers,
2. one budget ledger that spans at least CPU, GPU, and active actors,
3. one fallback policy test for a low-budget profile,
4. one telemetry path that records which layer caused a budget downgrade.

The dedicated contract note now lives at
[Simulation Layers and Resource Governance Contract](./SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md),
so the simulation-governance lane now points at a named boundary instead of
remaining implicit.

## Addendum (2026-07-25): Modding and creator-pack architecture

The current content model is data-driven, but it is not yet a safe modding surface. The next step is to define content packs as validated contracts so creator growth does not become a second mutable truth source.

### 1) Modding should be data-only by default

User-authored extensions should enter the game as validated data packs, not arbitrary runtime code. The default contract should support:

- manifest metadata,
- declared dependencies,
- version tags,
- capability and activity compatibility,
- asset provenance,
- rollback and disable behavior.

This matches the repo’s creator-ladder direction while keeping runtime authority in the core game.

### 2) Packs need explicit validation and compatibility rules

A pack should be rejected if it:

- references missing or incompatible schemas,
- violates asset provenance or licensing rules,
- exceeds budget or activation constraints,
- requests disallowed runtime behavior,
- introduces unresolved dependency loops.

That keeps modding safe without turning it into a free-for-all.

### 3) Creator surfaces should be staged

The natural sequence is:

1. inspectable pack manifest,
2. local/private validation,
3. shareable validated pack,
4. curated public publication,
5. moderation / rollback / deprecation handling.

The repo should not jump straight to open UGC. The safe path is validated content first, publication later.

### 4) Modding should reuse the existing contract layers

Pack validation should reuse:

- capability contracts,
- activity contracts,
- world affordance rules,
- resource budgets,
- migration/versioning,
- replay/telemetry hooks.

That prevents modding from becoming a parallel rules engine.

### 5) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned pack manifest,
2. one compatibility validator,
3. one dependency/provenance rejection test,
4. one safe disable/rollback path for an invalid pack.

The dedicated contract note now lives at
[Modding and Creator-Pack Validation Contract](./MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md),
so the modding lane now points at a named boundary instead of remaining a
generic growth idea.

## Addendum (2026-07-25): Event system and deterministic event graph

The repo still lacks a general world-event scheduler/handler graph. That layer should not be ad hoc scripts attached to features; it should be a versioned event contract that sits between simulation and presentation.

### 1) Events should be first-class simulation artifacts

An event should answer:

- what happened,
- when it happened,
- which subsystem emitted it,
- which state transition it corresponds to,
- whether it is replayable or diagnostics-only.

That makes events durable records instead of loose callbacks.

### 2) The event graph should be deterministic

The event system should preserve:

- monotonic ordering,
- schema versioning,
- deduplication rules,
- explicit fan-out ownership,
- replay-safe payloads,
- visibility to diagnostics and UI.

This keeps the event layer aligned with the deterministic kernel and the bounded recorder work already in place.

### 3) Event handlers should be owned by domains

Each domain should declare which events it consumes and which events it emits. For example:

- simulation domains emit authoritative state-change events,
- presentation domains consume those events for HUD/audio/visual feedback,
- diagnostics consume the same stream without mutating state.

This avoids a second hidden world model.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned event envelope,
2. one ordered event-graph test across a fixed input slice,
3. one deduplication test for repeated events,
4. one telemetry hook that records the event origin domain.

The dedicated contract note now lives at
[Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md),
so the event lane now points at a named boundary instead of only describing the
desired behavior.

## Addendum (2026-07-25): Asset pipeline and provenance contracts

The repo has strong asset provenance notes, but it still lacks a formal runtime asset pipeline. The next step is to make asset ingestion a versioned contract from source artifact to runtime manifest.

### 1) Asset flow should be explicit

The contract should look like:

1. source artifact,
2. normalized export,
3. manifest entry,
4. validation,
5. runtime activation,
6. deprecation or replacement.

This keeps the path from Blender/source art to runtime truth deterministic and inspectable.

### 2) Asset records should carry provenance

Every runtime-relevant asset record should include:

- source path or source ID,
- hash,
- license / ownership status,
- modification history,
- compression profile,
- LOD intent,
- replacement/deprecation path.

That prevents the asset layer from becoming a second hidden truth source.

### 3) Pipeline validation should reject bad inputs early

The pipeline should fail fast if an asset:

- lacks provenance or license metadata,
- exceeds the allowed budget or compression policy,
- violates naming or schema rules,
- references incompatible runtime expectations,
- has missing derived artifacts.

### 4) Asset pipeline should support staged runtime use

The runtime should only consume validated manifests, not raw source files. That means:

- candidate imports can be reviewed privately,
- validated packs can be promoted,
- deprecated assets can be replaced without ambiguity,
- the game can keep a consistent asset registry across sessions.

### 5) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned asset manifest schema,
2. one provenance/license validator,
3. one rejection test for a missing or incompatible asset record,
4. one safe replacement/deprecation path for a runtime asset entry.

The dedicated contract note now lives at
[Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md),
so the asset lane now points at a named boundary instead of remaining a broad
pipeline description.

## Addendum (2026-07-25): Behavior system and planner contracts

The repo still lacks a first-class AI behavior tree / utility / planner system in the play loop. The right way to add it is as a versioned behavior contract that chooses actions without mutating state directly.

### 1) Behavior should be a decision layer

Behavior should answer:

- what this actor or machine wants to do next,
- which capabilities it can use,
- which world affordances it can react to,
- what its fallback is when the preferred action is unavailable,
- how expensive the decision is allowed to be.

That keeps behavior distinct from both event emission and state mutation.

### 2) Behavior contracts should be versioned and composable

A behavior record should carry:

- identifier and version,
- trigger conditions,
- required capabilities,
- candidate actions,
- scoring or priority rules,
- budget limits,
- rejection reasons,
- telemetry hooks.

This lets the repo layer planners or utility-style systems on top of the same deterministic kernel.

### 3) Behavior must remain read-only relative to state mutation

Behavior chooses, validation approves, kernel mutates. That separation is important so the AI layer cannot become a hidden world model or a second authority surface.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned behavior schema,
2. one fixed-slice test proving a planner choice is deterministic,
3. one rejection test for a behavior candidate with missing capabilities,
4. one telemetry hook that records why a behavior branch lost the decision.

The dedicated contract note now lives at
[Behavior System and Planner Contracts](./BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md),
so the behavior lane now points at a named boundary instead of staying in the
analysis prose.

## Addendum (2026-07-25): World affordances and capability resolution

The repo already talks about affordances, but the contract should be explicit in its own right: world objects expose what they allow, and capabilities resolve against that surface before any state change.

### 1) Affordances are the world-facing contract

An affordance should describe what the world offers, not what an actor wants. Examples:

- `harvestable`
- `towable`
- `dockable`
- `damageable`
- `buildable-surface`
- `scan-target`

That keeps the world readable to capabilities and behavior systems.

### 2) Capability resolution should be deterministic

Capability resolution should answer:

- whether the affordance exists,
- whether the capability is compatible,
- whether the action is budgeted,
- what fallback or rejection path applies.

That makes capability admission a validation problem, not a hidden branch.

### 3) Affordances should be versioned and validated

Each affordance record should carry:

- identifier and version,
- owning domain,
- constraints,
- budget impact,
- visibility to behavior/capability systems,
- rejection telemetry.

That prevents the affordance surface from drifting away from the runtime truth.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned affordance schema,
2. one capability-to-affordance compatibility test,
3. one validation failure test for an incompatible action,
4. one telemetry hook that records the affordance that rejected the action.

The dedicated contract note now lives at
[World Affordances and Capability Resolution Contract](./WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md),
so the affordance lane now points at a named boundary instead of remaining an
implicit runtime idea.

## Addendum (2026-07-25): Visibility-stage culling and LOD contracts

The renderer still needs an explicit visibility stage. Batching and instancing help, but the repo should name the visibility contract itself: what can be seen, what should be drawn, and what should degrade as distance increases.

### 1) Visibility should be staged before draw submission

The draw path should answer, in order:

- is the object in view,
- is it close enough to matter,
- is it blocked or hidden by a better candidate,
- what LOD tier should it use,
- should it be submitted at all.

That keeps culling and LOD as policy, not incidental renderer behavior.

### 2) LOD should be multi-subsystem, not just geometry

LOD should be able to degrade:

- geometry detail,
- material complexity,
- animation sampling,
- AI update frequency,
- physics update frequency,
- particle density,
- audio richness.

This keeps distant objects readable without paying full simulation cost.

### 3) Visibility policy should be measured

The contract should expose:

- per-frame visible/drawn counts,
- draw-call budget,
- distance bucket counts,
- rejected/culled counts,
- fallback behavior when budgets are exceeded,
- camera-aware occlusion/pull-in interactions.

That gives the repo a measurable hardening target instead of a vague optimization wish.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one visibility-policy schema with `near/mid/far` tiers,
2. one fixed-slice test for frustum and distance culling behavior,
3. one draw-call budget counter with a fail-soft path,
4. one LOD downgrade test for at least one non-geometry subsystem.

The dedicated contract note now lives at
[Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md),
so the visibility lane now points at a named boundary instead of staying in the
optimization prose.

## Addendum (2026-07-25): Collision categories and mask contracts

The physics layer is still intentionally lightweight, but it should stop relying on a single generalized obstacle path once more actors, projectiles, and hazards enter the world. The contract should name collision categories and masks explicitly.

### 1) Collision should be category-driven

The world should distinguish at least these categories:

- ground,
- obstacle,
- hazard,
- trigger,
- projectile,
- sensor,
- decorative / non-colliding.

That makes collision intent visible instead of hiding it inside one broad resolver.

### 2) Masks should control who can interact

Each body or query should carry:

- a category,
- a mask,
- a collision intent,
- a fallback / ignore rule,
- telemetry for unexpected intersections.

This keeps the physics layer deterministic and easy to reason about when new locomotion families or hazards are introduced.

### 3) Collision behavior should be explicit per role

The contract should allow different handling for:

- solid obstacle resolution,
- trigger-only overlaps,
- hazard contact,
- projectile impact,
- sensor / line-of-sight queries,
- decorative non-interaction.

That prevents collision from becoming a single monolithic branch that handles everything the same way.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one collision-category/mask schema,
2. one fixed-slice test proving ignored collisions stay ignored,
3. one test proving trigger / sensor contacts do not mutate physics state,
4. one telemetry hook that records an unexpected collision-category pair.

The dedicated contract note now lives at
[Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md),
so the collision lane now points at a named boundary instead of remaining an
inline physics note.

## Addendum (2026-07-25): Camera feel contracts

The camera already contributes strongly to feel, but the current behavior still reads like a stateful heuristic bundle rather than a named contract. For a long-lived machine platform, camera policy should be explicit: what mode is active, why it transitions, how it handles obstructions, and how it respects motion comfort.

The dedicated contract note now lives at
[Camera Feel Contract](./CAMERA_FEEL_CONTRACT_2026-07-25.md), so this addendum
now points at the named boundary instead of leaving camera policy implied.

### 1) Camera should be a policy surface, not only a rig

The contract should separate:

- camera mode or policy,
- target and follow offset,
- transition source and destination,
- interpolation or damping rule,
- obstruction or pull-in fallback,
- FOV target and ramp rate,
- comfort / reduced-motion profile,
- debug reason for the current state.

This keeps the camera readable as a product system instead of a hidden collection of per-machine tweaks.

### 2) Camera behavior should be intentional

The contract should explicitly cover:

- smooth following,
- look-ahead,
- pull-in or push-out around terrain and props,
- speed-sensitive FOV changes,
- transition smoothing between modes,
- reduced-motion clamping,
- accessibility-friendly overrides.

That makes the camera easier to tune, explain, and validate when new machine types or activities arrive.

### 3) Obstruction handling needs its own fallback path

If the camera is obstructed by trees, walls, terrain, or large props, the fallback should be observable and deterministic. The system should record why the fallback happened and what mode or offset changed as a result. That avoids accidental snapping, silent collision between camera and environment, or inconsistent behavior between rigs.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one camera-policy schema with named modes and transition inputs,
2. one fixed-slice test proving mode transitions keep the intended target without unexpected snapping,
3. one reduced-motion path that clamps motion and FOV changes,
4. one obstruction-handling path that records why pull-in happened,
5. one debug or telemetry field that exposes the active policy and transition reason.

## Addendum (2026-07-25): Deterministic replay artifact

The repo already has a deterministic kernel and a bounded run-record foundation, which is enough to show the direction but not yet enough to treat replay as a first-class product surface. The missing contract is a portable replay artifact: not just a recorded input history, but a validated playback path that can reproduce a run, explain divergence, and preserve the same outcome ordering for debugging and future authority work.

The dedicated contract note now lives at
[Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md),
so replay now points at a named product boundary instead of only a capability
description.

### 1) Replay should be a first-class artifact

The replay contract should separate:

- captured input stream,
- simulation tick or sequence anchor,
- checksum or run hash,
- snapshot or recovery boundary,
- playback verifier,
- divergence report,
- operator-visible provenance.

That makes replay useful as a product feature, a debugging tool, and an architecture gate.

### 2) Replay should prove ordering, not just logging

The important property is not “did we record something?” but “can we reproduce the same state transitions in the same order?”. The contract should therefore expose whether playback matched:

- tick ordering,
- state mutation sequence,
- event emission order,
- recovery points,
- final summary hash.

This keeps replay tied to deterministic simulation instead of turning it into a passive recording feature.

### 3) Replay should fail visibly

If playback diverges, the system should say why. Useful failure modes include:

- missing input segment,
- checksum mismatch,
- schema version mismatch,
- unsupported recovery boundary,
- divergent state transition,
- missing replay metadata.

That makes replay a real confidence tool instead of a silent best-effort viewer.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned replay artifact schema,
2. one playback path that reuses the deterministic kernel,
3. one checksum or run-hash comparison that reports divergence,
4. one visible failure mode for incompatible or incomplete replay data,
5. one operator-visible provenance field for the replay source and version.

## Addendum (2026-07-25): Shader and material strategy

The repo currently leans on baseline materials and vertex-color terrain, which is fine for a first playable surface. The long-term contract still needs to say how identity, readability, weather cues, hazard feedback, and surface transitions will be handled without turning every visual effect into a bespoke one-off.

### 1) Materials should be layered, not duplicated

The render contract should distinguish:

- base surface material,
- surface modifiers,
- weather modifiers,
- damage or wear modifiers,
- hazard/readability overlays,
- low-cost atmospheric cues.

That keeps visual variety composable instead of requiring one-off material forks for every machine or terrain type.

### 2) Shader strategy should serve readability first

The first job of custom shader work should be to make the world easier to read:

- terrain transitions,
- mud/snow/wetness boundaries,
- hazard state cues,
- time-of-day or weather cues,
- vehicle state feedback,
- low-cost atmospheric distance cues.

That keeps visual identity aligned with gameplay clarity instead of chasing effect density for its own sake.

### 3) Baseline fallback must remain valid

If a material or shader path is unavailable, the fallback should still produce a coherent scene. That means:

- no required effect can be the only source of important gameplay information,
- the world must still be legible under the simplest supported material path,
- the low-end path should be deliberately designed, not accidental.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one material-layer schema that separates base surface and modifiers,
2. one custom shader or material module for a gameplay-relevant readability cue,
3. one fallback path that preserves clarity when the custom path is unavailable,
4. one test or capture proving a weather or surface cue remains legible on the fallback path,
5. one operator-visible note or debug field identifying the active material strategy.

The dedicated contract note now lives at
[Shader and Material Strategy Contract](./SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md),
so the shader lane now points at a named boundary instead of staying as a
rendering aside.

## Addendum (2026-07-25): Spatial culling and render streaming

The repo already benefits from bounded local terrain and a deterministic render path, but the long-term scale contract still needs to state how the world sheds spatial load. Distance, portal, and chunk-style streaming are not separate optimizations in practice; they are the same spatial budget problem at different scales.

### 1) Spatial scale should be staged

The contract should separate:

- distance culling,
- frustum culling,
- occlusion culling,
- portal graph visibility,
- sector or chunk residency,
- local prop rebuild radius.

That keeps the renderer from becoming one giant hidden visibility heuristic.

### 2) Render streaming should have residency rules

The system should define:

- what is always resident,
- what is loaded by distance,
- what is loaded by portal or room access,
- what is loaded by chunk proximity,
- what is only present in the local render radius,
- what gets evicted and when.

That gives the engine a clear answer to “what does the player need right now?” instead of letting every layer guess.

### 3) Spatial contracts should stay measurable

Every visibility tier should produce observable output:

- residency counts,
- load/unload churn,
- draw-call pressure,
- missed-cull counts,
- fallback counts when a tier cannot load in time.

That makes spatial scaling auditable rather than anecdotal.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one distance-culling policy,
2. one portal or room-visibility graph test,
3. one chunk-residency or render-radius test,
4. one observable counter for load/unload churn,
5. one fallback path for a tier that cannot load in time.

The dedicated contract notes now live at
[Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)
and [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md),
so the spatial lane now points at named boundaries instead of staying implicit.

## Addendum (2026-07-25): LOD hierarchy and subsystem degradation

The repo’s current visibility work proves the value of scale-aware rendering, but the long-term contract still needs to say what degrades, when it degrades, and which subsystems share the same downgrade logic. LOD is not only a geometry issue; it is a cross-system budget policy.

### 1) LOD should be explicit across subsystems

The contract should define tiers for:

- geometry,
- materials,
- animation,
- AI or behavior,
- physics,
- particles or effects,
- audio or feedback.

That keeps “far away” from meaning “undefined” and makes the degradation path reviewable.

### 2) Each subsystem should have its own downgrade rule

The contract should answer:

- what the near tier does,
- what the mid tier removes or simplifies,
- what the far tier collapses into,
- whether the subsystem can pause entirely,
- what telemetry records the downgrade.

This avoids pretending all subsystems can share one generic LOD switch.

### 3) Degradation must preserve gameplay meaning

The purpose of LOD is not just saving work; it is keeping distant or low-priority simulation readable and stable. If a subsystem degrades, the player should still understand:

- what the object is,
- whether it is active,
- whether it can affect the current task,
- whether it is safe to ignore until closer.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one cross-subsystem LOD schema with near/mid/far tiers,
2. one geometry downgrade test,
3. one non-geometry downgrade test for animation, AI, physics, or particles,
4. one telemetry field that records the active tier,
5. one fallback rule that preserves gameplay meaning when a tier is collapsed.

The dedicated contract note now lives at
[Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md),
so the LOD lane now points at a named boundary instead of remaining a shared
optimization idea.

## Addendum (2026-07-25): Resource budgets and fallback envelope

The repo already exposes some runtime timing and draw-call evidence, but the long-term contract still needs a named budget envelope. Resource management should not be an afterthought buried inside rendering or simulation; it should be a first-class rule for when the system must simplify, defer, or shed work.

### 1) Budgets should be explicit and cross-system

The contract should track at least:

- CPU time,
- GPU time or draw pressure,
- memory / residency pressure,
- active actor or entity count,
- battery or thermal sensitivity where relevant,
- save/migration cost when state is changing rapidly.

That makes resource pressure legible across the whole engine instead of only in the renderer.

### 2) Budget pressure should trigger named fallbacks

The contract should define what happens when pressure rises:

- which systems downgrade first,
- which systems pause,
- which systems keep priority,
- which telemetry field records the downgrade reason.

The fallback should be deliberate and named, not implicit and hidden.

### 3) Budgets should support operator decisions

If the system is over budget, the operator should be able to tell:

- what resource was exceeded,
- which subsystem caused it,
- whether the state is temporary or persistent,
- whether the world is safe to continue or should be simplified.

That keeps performance work actionable instead of mysterious.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one cross-system budget ledger covering CPU, GPU, memory/residency, and active actors,
2. one low-budget fallback profile,
3. one telemetry path that names the oversubscribed resource,
4. one test proving a degrade path activates before an overload becomes silent failure,
5. one operator-visible summary of current budget pressure.

The dedicated contract note now lives at
[Resource Budget and Fallback Envelope](./RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md),
so the budget lane now points at a named boundary instead of staying embedded
in the larger performance discussion.

## Addendum (2026-07-25): Portal visibility and bounded rooms

The repo’s world already has authored sites, but the visibility contract still needs an explicit room/portal model for enclosed or semi-enclosed spaces. Portal visibility is not a separate gimmick; it is the indoor version of spatial culling, and it should be named as such so building-scale content can scale without special-case rendering hacks.

### 1) Portal visibility should be a graph, not an ad hoc exception

The contract should define:

- rooms or bounded spaces,
- portal edges between spaces,
- open/closed state for each portal,
- visibility propagation across the graph,
- fallback behavior when graph data is missing.

That keeps indoor scale readable and lets authored spaces reason about what can actually be seen through a doorway, hatch, or connection.

### 2) Portal visibility should cooperate with broader spatial culling

The portal graph should not replace distance or chunk-based visibility. It should complement them:

- distance culling still applies outside the space,
- chunk residency still applies for world streaming,
- portal visibility narrows what is visible inside a bounded region,
- obstruction handling can still trim the final camera or render set.

That makes room-scale visibility part of the same architecture instead of a separate rendering system.

### 3) Portal contracts should stay observable

The system should report:

- which room is active,
- which portal admitted visibility,
- when a portal is closed or unresolved,
- when fallback visibility was used instead of graph traversal.

That makes indoor visibility debuggable and prevents silent leaks where an unused room still renders or an open passage disappears from the graph.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one room/portal graph schema,
2. one test proving a closed portal blocks visibility propagation,
3. one test proving an open portal admits visibility to the connected room,
4. one fallback path when portal data is missing,
5. one telemetry field that identifies the active room or portal path.

The dedicated contract note now lives at
[Portal Visibility and Bounded Rooms Contract](./PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md),
so the indoor-visibility lane now points at a named boundary instead of staying
as a rendering aside.

## Addendum (2026-07-25): Lighting and atmosphere strategy

The repo’s current lighting posture is allowed to stay conservative, but the contract still needs to state how lighting and atmosphere scale across tiers. Lighting is part of readability and mood, not just visual polish, so the fallback path has to remain intentional and legible.

### 1) Lighting should be tiered, not assumed

The contract should define:

- baseline ambient lighting,
- directional key lighting,
- local point or spot accents,
- shadow quality tiers,
- baked or probe-driven static lighting,
- low-cost atmosphere cues for weather and time of day.

That keeps the world readable when expensive lighting features are reduced.

### 2) Shadow strategy should have explicit fallbacks

The contract should say:

- when real-time shadows are allowed,
- when baked/probe lighting is preferred,
- when blob or simplified shadowing is acceptable,
- what happens if shadow budgets are exceeded.

That prevents shadow quality from becoming an implicit runtime surprise.

### 3) Lighting and atmosphere should preserve gameplay clarity

Even on the lowest tier, the player should still be able to tell:

- where the ground plane is,
- which surfaces are important,
- whether an area is dangerous or calm,
- what time/state the world is in.

Lighting therefore needs to support the readability contract, not compete with it.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one staged lighting policy with at least ambient and directional tiers,
2. one shadow fallback path for a reduced-budget tier,
3. one baked or probe-based static lighting rule,
4. one low-cost atmosphere cue for weather or time-of-day readability,
5. one telemetry or debug field that identifies the active lighting tier.

The dedicated contract note now lives at
[Lighting and Atmosphere Strategy Contract](./LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md),
so the lighting lane now points at a named boundary instead of leaving the
policy implied.

## Addendum (2026-07-25): Accessibility and input contracts

The repo already has input paths and reduced-motion behavior in pieces, but accessibility still needs a named contract so remapping, comfort, contrast, and device parity stay explicit. For a long-lived 3D game, input is not just control plumbing; it is part of how the player understands, survives, and returns to the world.

The dedicated contract note now lives at
[Accessibility and Input Contract](./ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md),
so the accessibility lane now points at a named boundary rather than a broad
requirements paragraph.

### 1) Input should be action-based, not control-based

The contract should separate:

- named actions,
- bindings per device,
- device-neutral intent,
- hold/tap/repeat semantics,
- remapping and persistence.

That keeps keyboard, gamepad, and touch from diverging into separate gameplay meanings.

### 2) Accessibility should cover motion and perception

The contract should explicitly define support for:

- reduced-motion behavior,
- camera shake limits,
- FOV spike limits,
- visual contrast / readability,
- text and icon clarity,
- comfort-preserving defaults.

That makes accessibility a gameplay quality gate, not just a settings screen concern.

### 3) Device parity should be deliberate

If a control exists on one device, the contract should say how the same action is expressed elsewhere or whether it is intentionally absent. This should be observable for:

- keyboard,
- gamepad,
- touch,
- pause/reset/recovery flows,
- accessibility toggles.

That reduces hidden feature drift between input surfaces.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one named-action schema with device-neutral intents,
2. one remapping or binding persistence test,
3. one reduced-motion clamp for camera or visual feedback,
4. one contrast/readability check for a core UI or world cue,
5. one telemetry or debug field that identifies the active input or accessibility profile.

## Addendum (2026-07-25): Kernel ordering and mutable subsystem gates

The deterministic kernel is a major strength, but the contract still needs to state how future mutable systems are allowed to enter the step order. If AI, missions, economy, traffic, or similar hooks are added, they must not become hidden state mutation paths that bypass the kernel’s ordering guarantees.

### 1) Kernel ordering should be explicit

The contract should define:

- the authoritative tick order,
- which systems may read state,
- which systems may mutate state,
- which systems are presentation-only,
- where validation happens before mutation,
- where replay-relevant events are emitted.

That keeps the kernel as the source of truth even as the world gains more subsystems.

### 2) New mutable subsystems should enter through gates

Any new subsystem that can change world state should declare:

- its write scope,
- its ordering dependency,
- its failure mode,
- its replay impact,
- its telemetry signal.

That prevents “just one more hook” from turning into a hidden second simulation loop.

### 3) Renderer-only and kernel-only responsibilities should stay separated

The contract should preserve a clean line between:

- state mutation,
- snapshot generation,
- render interpretation,
- debug/observability output.

That way the renderer can observe, but not authoritatively mutate, and future mutable layers remain easy to audit.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one ordered subsystem table showing read/write authority,
2. one validation gate that blocks a mutation outside the kernel order,
3. one replay-safe event emission point for a mutable subsystem,
4. one telemetry field that identifies the active kernel stage,
5. one test proving renderer-only code cannot mutate world state.

The dedicated contract note now lives at
[Kernel Ordering and Mutable Subsystem Gates Contract](./KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md),
so the kernel-order lane now points at a named boundary instead of staying in
the deterministic-simulation prose.

## Addendum (2026-07-25): World and architecture scalability

The repo already has strong local foundations, and the next long-term contract now names how the world grows without turning every new activity into a separate engine branch. Scalability here means both content growth and architecture growth: chunk migration, activity packing, machine expansion, and the future shape of online or shared-state readiness.

The dedicated contract note now lives at
[World and Architecture Scalability Contract](./WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md),
so the growth lane now points at a named boundary instead of staying a generic
future-direction statement.

### 1) World growth should remain bounded and testable

The contract should define:

- chunk or region lifecycle,
- load radius and unload policy,
- route or activity activation order,
- migration boundaries for saved state,
- observability for growth pressure.

That keeps world expansion deterministic instead of letting it depend on implicit radius logic.

### 2) Activity growth should be packable

Activities, missions, and machine families should be able to enter as bounded packs with clear validation and rollout rules. The contract should answer:

- what is the smallest stable activity bundle,
- what dependencies it needs,
- what state it owns,
- how it is rolled back,
- how it is measured.

That keeps content expansion from becoming a second mutable truth source.

### 3) Online and shared-state readiness should remain future-gated

The contract should preserve a clear boundary between:

- local deterministic play,
- replayable state,
- future authority or shared-room concerns.

That way, multiplayer or shared-world features can be staged when the product genuinely needs them, not assumed into the current architecture.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one world-scaling policy for load radius, unload, and migration boundaries,
2. one pack or activity activation test with rollback,
3. one observability counter for growth pressure or churn,
4. one explicit future-only boundary note for shared-state or online readiness,
5. one proof that activity growth can be added without rewriting the kernel order.

The contract note now exists at [World and Architecture Scalability Contract](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md), so this addendum now points at a named boundary instead of leaving the growth question open.

## Addendum (2026-07-25): Save and migration observability

Save/version recovery is already present, but the contract still needs to say how mutation, save, and migration events are explained when they happen. Without an explicit observability layer, versioned recovery exists but is harder to audit, debug, or replay with confidence.

### 1) Mutation paths should emit reason and version metadata

Every state-changing path should be able to report:

- why the mutation happened,
- which versioned schema or state shape it touched,
- whether the change is persisted, transient, or replay-only,
- which subsystem initiated it.

That makes state changes auditable instead of just structurally valid.

### 2) Save and migration events should be visible to operators

The contract should expose:

- save start / save success / save failure,
- migration start / migration success / migration fallback,
- schema-version boundaries,
- recovery or rollback path taken.

That keeps the persistence layer from becoming a hidden black box.

### 3) Recovery should preserve explanation, not just data

When a world is restored or migrated, the system should keep enough metadata to explain:

- what version it came from,
- what changed during migration,
- what data was recovered directly,
- what had to be normalized or dropped.

That makes future corruption handling and support work much more tractable.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one reason-code and version-metadata field on a world mutation path,
2. one save observability event for success or failure,
3. one migration observability event for success or fallback,
4. one replay-safe recovery note that preserves source version information,
5. one operator-visible summary of the latest save/migration action.

The contract note now exists at
[Save and Migration Observability Contract](./SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md),
so the persistence observability lane now points at a named boundary instead of
stopping at the addendum prose.

## Addendum (2026-07-25): Physics quality envelope

The physics layer is intentionally lightweight today, which is a sensible first-playable decision. The contract still needs to define the quality envelope so future interactions do not quietly break the game’s feel or stability as terrain, obstacles, water, speed, and stacked objects become more complex.

### 1) Physics should stay deterministic and bounded

The contract should preserve:

- fixed-step determinism,
- bounded collision checks,
- controlled locomotion envelopes,
- explicit failure states instead of hidden unstable behavior.

That keeps the physics layer predictable as more machine types arrive.

### 2) Stability needs named invariants

The physics contract should specify invariants for:

- terrain contact,
- obstacle contact,
- slope handling,
- high-speed cornering,
- stacking or near-overlap situations,
- water or fluid-adjacent behavior where relevant.

That makes the “feel” of motion auditable instead of implicit.

### 3) Reduced-complexity fallback should stay playable

If the physics model has to simplify, it should still preserve:

- locomotion clarity,
- collision intent,
- stable recovery from bad contact,
- visible degradation rather than silent failure.

This keeps simplification from turning into a player-facing bug.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one terrain-contact invariant test,
2. one obstacle-stability regression test,
3. one high-speed cornering or slope-handling test,
4. one fallback rule for water or fluid-adjacent behavior,
5. one telemetry or debug field for physics stability state.

The dedicated contract note now lives at
[Physics Quality Envelope Contract](./PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md),
so the motion-stability lane now points at a named boundary instead of
remaining only in the envelope prose.

The current physics quality envelope evidence and proof slice now live in
[PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md).

## Addendum (2026-07-25): Authoring and reproducible content validation

The repo’s content model is already data-driven, but the authoring path still needs a named contract so activities, world modules, and imported content cannot bypass validation just because they came from a tool, editor, or generated manifest. This is the place where validator-first content becomes a durable part of the architecture instead of a one-off workflow.

The dedicated contract note now lives at
[Authoring and Reproducible Content Validation Contract](./AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md),
so the authoring lane now points at the named validation boundary instead of a
generic workflow paragraph.

### 1) Content should enter through validated manifests

The contract should require:

- a manifest or pack description,
- schema validation,
- dependency and compatibility validation,
- provenance or source metadata,
- reproducible validation results.

That makes authoring artifacts reviewable and comparable across runs.

### 2) Tooling should report failures in a stable, reproducible way

The contract should define how tools report:

- missing fields,
- incompatible dependencies,
- invalid or unsupported world/activity combinations,
- rejected generated content,
- validation-only versus runtime-ready status.

That keeps authoring output useful to humans and automation alike.

### 3) Authoring should not bypass runtime contracts

Anything imported from a tool, editor, or AI-generated pipeline should still respect:

- capability contracts,
- affordance rules,
- migration/versioning,
- resource budgets,
- replay/debug visibility.

That prevents the tooling layer from becoming a second mutable truth source.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one versioned content-manifest schema for activities or world modules,
2. one validator-first rejection test,
3. one reproducible validation result artifact,
4. one provenance/source metadata field,
5. one runtime-ready vs validation-only status signal.

## Addendum (2026-07-25): Performance and readability baseline

The repo has now separated enough subsystems that the next useful contract is an umbrella baseline that ties their shared thresholds together. This is not a new engine layer; it is the named policy that binds the existing rendering, camera, collision, and observability contracts into one readable v1.x envelope.

### 1) The baseline should bind the shared thresholds

The contract should define a single policy surface for:

- culling thresholds,
- LOD tiers,
- camera mode matrix,
- collision layer semantics,
- per-frame actor and physics budgets,
- transition latency and budget counters.

That prevents each subsystem from quietly drifting on its own scale assumptions.

### 2) The baseline should be readable to operators and future maintainers

The contract should answer:

- what counts as within budget,
- what counts as degraded but acceptable,
- what counts as fail-soft fallback,
- what counters or alerts expose the degradation.

That keeps the baseline useful as a product/ops artifact, not just an internal note.

### 3) The baseline should map to the existing fine-grained contracts

This addendum should sit above the already named contracts for:

- [Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md),
- [Camera Feel Contract](./CAMERA_FEEL_CONTRACT_2026-07-25.md),
- [Lighting and Atmosphere Strategy Contract](./LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md),
- [Accessibility and Input Contract](./ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md),
- [Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md),
- [Physics Quality Envelope Contract](./PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md).

The dedicated contract note now lives at
[Performance and Readability Baseline Contract](./PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md),
so the umbrella policy now points at a named boundary instead of only listing
the lower-level contracts it sits above.

That makes it the umbrella policy, not a replacement.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one ADR or policy document binding the shared thresholds,
2. one visible budget table for culling, LOD, camera, and collision semantics,
3. one per-frame instrumentation set for actor count, physics count, and transition latency,
4. one fail-soft path that clearly records which threshold was exceeded,
5. one note showing how the umbrella policy maps to the existing fine-grained contracts.

## Addendum (2026-07-25): Second locomotion family and cross-mode continuity

The repo’s current first-playable slice is strong enough that the next proof-oriented growth step should be a second locomotion family using the same contract stack, not a bespoke side branch. The expansion needs to prove that the capability model can carry a different motion grammar while preserving a shared action vocabulary and a predictable presentation continuity.

### 1) The second locomotion family should use the same contract shape

The contract should require:

- a profile or adapter parallel to the existing ground family,
- explicit locomotion capabilities and limits,
- state validation before runtime activation,
- preserved save/reload behavior,
- explicit failure or rollback if the adapter cannot initialize safely.

That proves the system can grow by composition instead of by special casing one vehicle type.

### 2) Semantic actions should stay shared across modes

At least one non-chase presentation mode should reuse the same semantic action set so players do not have to relearn core controls when the camera or view changes. The contract should define:

- the shared action names,
- how each mode maps them,
- which actions are intentionally unavailable,
- how the mapping is observed or debugged.

That keeps cross-mode continuity a product feature instead of a hope.

### 3) The proof should include continuity, not only new capability

A successful second locomotion slice should show:

- the new family can move, stop, and recover,
- the shared action set still behaves consistently,
- camera and input remain intelligible across the mode change,
- fallback or rollback is visible if the new family fails.

That prevents the expansion from adding breadth while losing ergonomics.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one second locomotion adapter or family definition,
2. one shared semantic action set used in at least one non-chase presentation mode,
3. one save/reload or recovery test for the new family,
4. one continuity test showing the mapped actions behave predictably across modes,
5. one explicit rollback or failure path if the adapter cannot activate.

The dedicated contract note now lives at
[Second Locomotion Family and Cross-Mode Continuity Contract](./SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md),
so the second locomotion lane now points at a named boundary instead of a
generic growth description.

## Addendum (2026-07-25): Authority model groundwork

Local simulation is still the canonical current mode, but the architecture is now far enough along that the authority boundary should be named explicitly before any shared-room or durable remote mutation work is attempted. The goal here is not multiplayer in itself; it is a clear contract for how client-side simulation, authenticated mutation, and durable values relate when the product eventually needs that shape.

### 1) Client simulation should stay local-first

The contract should preserve:

- local deterministic simulation as the default path,
- client-side responsiveness for immediate feedback,
- authoritative validation before durable world mutation,
- explicit boundaries for what remains speculative versus durable.

That keeps current play responsive while making the future authority boundary legible.

### 2) Durable values should flow through authenticated mutation

The contract should define how durable world changes are handled when an authority layer exists:

- request from local simulation or intent producer,
- validation by the authoritative layer,
- accepted mutation written to durable state,
- rejected mutation reported explicitly,
- recovery metadata preserved.

That prevents durable state from being conflated with speculative client state.

### 3) Shared-state readiness should remain gated

The contract should make it obvious that:

- shared-room or server-authoritative behavior is future-only,
- replay-safe mutation is a prerequisite,
- current local play does not depend on remote infrastructure,
- durable values will still need audit and recovery traces.

That keeps future authority work staged instead of assumed.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one local-first authority note with explicit future-only shared-state wording,
2. one authenticated mutation request/response shape,
3. one reject path that leaves local speculative state unchanged,
4. one durable-value recovery note,
5. one telemetry field that identifies the authoritative mutation outcome.

The dedicated contract note now lives at
[Authority Model Groundwork Contract](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md),
so the authority lane now points at a named boundary instead of leaving the
future-only claim implicit.

## Addendum (2026-07-25): Engine branch evaluation and alternate backend gating

Three.js remains the canonical v1 path, but the architecture should still name when an alternate engine or rendering backend is worth a bounded benchmark branch. This is not a rewrite proposal; it is a disciplined evaluation gate for the case where mobile budgets, platform support, or renderer constraints force a comparison.

### 1) Canonical path should stay explicit

The contract should state:

- Three.js remains the default canonical path,
- alternates are only evaluated through a short benchmark branch,
- the benchmark branch is disposable unless evidence justifies migration.

That keeps the current product path stable while preserving room for measured comparison.

### 2) Alternate evaluation should be budget-driven

The decision to branch should be tied to measurable pressure, such as:

- mobile or low-end budget failure,
- unacceptable frame-time or memory behavior,
- missing platform capability in the canonical path,
- an inability to preserve the existing gameplay contracts.

That keeps evaluation grounded in product constraints rather than taste.

### 3) The benchmark branch should compare the same contracts

If an alternate backend is evaluated, it should be measured against the same:

- culling and LOD thresholds,
- camera policy,
- collision semantics,
- lighting/readability requirements,
- instrumentation and recovery visibility.

That makes the branch comparable instead of just different.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one explicit canonical-path note naming Three.js as default v1,
2. one bounded benchmark branch definition with a stop condition,
3. one measurable trigger for evaluating an alternate backend,
4. one contract-comparison checklist for the benchmark branch,
5. one decision record template for branch acceptance or rejection.

The dedicated contract note now lives at
[Engine Branch Evaluation and Alternate Backend Gating Contract](./ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md),
so the engine-branch lane now points at a named boundary instead of a generic
comparison paragraph.

## Addendum (2026-07-25): Replay and ghost product feature

The deterministic replay artifact is already a real architecture contract. The next step is to define the product surface around it: shareable runs, ghost playback, seed-based comparisons, and social/debug distribution. This is where replay stops being only a diagnostic tool and becomes part of the game’s long-term identity.

### 1) Replay should produce a shareable artifact

The contract should define a replay artifact that can carry:

- run identity,
- seed or equivalent deterministic origin,
- version information,
- input or command history reference,
- validation or compatibility status.

That makes replay something players or testers can exchange, not just inspect locally.

### 2) Ghost playback should remain reproducible

If a ghost or replay is shown back, it should still be anchored to the same deterministic simulation contract:

- same ordered inputs or command stream,
- same versioned state schema,
- same recovery boundaries,
- explicit mismatch handling if the replay cannot be trusted.

That keeps the ghost feature from becoming an approximate video instead of a true state trace.

### 3) Sharing and social surfaces should not weaken trust

The contract should make explicit:

- what is safe to share,
- what is replay-only or diagnostics-only,
- what the viewer can trust,
- what compatibility failures look like.

That preserves the integrity of the replay artifact when it moves beyond the local machine.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one shareable replay or ghost artifact schema,
2. one deterministic playback verification path for the artifact,
3. one version/seed identity field,
4. one explicit mismatch or incompatibility state,
5. one note describing how the artifact can be shared or inspected socially/debug-wise.

The dedicated contract note now lives at
[Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md),
so the replay/ghost lane now points at a named boundary instead of only a
feature description.

## Addendum (2026-07-25): Verification harness and confidence gates

The analysis already names the tests needed to raise confidence above Tier-2, but the repo still needs a first-class contract for how those proofs are organized, reproduced, and recorded. This is the layer that turns recommended checks into an explicit evidence harness for the architecture.

### 1) Proof work should use deterministic fixture scenes

The contract should require stable fixture scenes or equivalent deterministic inputs for:

- culling correctness,
- camera transition determinism,
- collision invariants on steep or extreme terrain,
- save/version migration negative cases,
- renderer fallback behavior under reduced capability.

That keeps evidence reproducible instead of dependent on ad hoc manual setup.

### 2) Confidence should be tied to named evidence tiers

The contract should define what it means to move from:

- source-level evidence,
- targeted test evidence,
- integration or browser-visible evidence,
- runtime/manual proof.

That keeps the proof process auditable and prevents test results from being overstated.

### 3) Failures should leave a useful trace

When a proof slice fails, the contract should ensure it reports:

- which fixture or scenario failed,
- what contract was violated,
- whether the failure is regression, missing coverage, or environment-only,
- what evidence tier is still missing.

That makes the proof harness useful for continuation rather than just pass/fail output.

### 4) Near-term proof slice

The smallest durable proof for this addendum is:

1. one deterministic fixture-scene schema or equivalent scenario definition,
2. one test for each named confidence gate category,
3. one tiered evidence summary that distinguishes source/test/runtime proof,
4. one failure-report format that preserves the violated contract and missing tier,
5. one reproducible run note that identifies the fixture inputs used.

The dedicated contract note now lives at
[Verification Harness and Confidence Gates Contract](./VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md),
so the proof harness lane now points at a named boundary instead of only a
general evidence discussion.
- Addendum (2026-07-25): the Physics Lab browser-experience gap now has a dedicated contract note, so the separate lab route and acceptance runner are tracked as an evidence fixture instead of an implicit side page.
