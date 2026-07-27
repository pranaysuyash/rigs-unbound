# Rigs Unbound — 3D Game Optimization Gaps (Full Continuation Audit)

Date: 2026-07-25

Owner: Pranay

Source examined:

- `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676`
- repo evidence under `src/` and `docs/`

Objective:

- Continue the prior optimization audit by covering the extended architecture section (kernel, world schema, rendering separation, simulation layering, modding economy, authority) and convert that into an explicit, prioritized, repository-documented platform backlog.

Skills used in this pass (in order):

1. `3d-games`
2. `3d-web-experience`
3. `threejs-materials`
4. `threejs-shaders`

## 1) Ground truth map: What is proven in current code

These are already implemented (or strongly present) according to source evidence.

- Deterministic simulation kernel and ordered stepping
  - `src/game/state.ts`
- Data-oriented content surface (`RIG_PROFILES`, world anchors, capability actions)
  - `src/game/contracts.ts`, `src/game/world.ts`
- Explicit split between simulation and rendering snapshots
  - `src/game/state.ts`, `src/game/renderer.ts`, `src/game/gameworld.ts`
- Migration/versioning path for save/load
  - `src/game/storage.ts`, `src/game/state.ts`
- Physics and collision separation with shared terrain substrate
  - `src/game/physics.ts`, `src/game/collision.ts`, `src/game/terrain.ts`
- Render optimization scaffolding and observable telemetry
  - `src/game/renderer.ts`, `src/game/performance.ts`, `src/main.ts`

## 2) Extended audit matrix (conversation + repo cross-check)

| Area                           | Conversation Claim/Intent                                 | Current Reality                                                                   |              Status | Concrete Next Step                                                                                                                            |
| ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------: | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Core render pipeline hardening | Culling/LOD/visibility as first-class pipeline            | Partial for occlusion pull-in and bounded prop radius, no staged visibility graph | **Partial/Blocked** | Add explicit per-frame visibility buckets (frustum + distance buckets + semantic occluder hint) before draw submission and validate counters. |
| Shader strategy                | Separation by domain (terrain/vehicle/weather)            | PBR/standard materials present; no domain shader library in production path       |         **Missing** | Add minimal 2–4 shared material variants and shared uniforms contract.                                                                        |
| Deterministic kernel           | Fixed-step ordered tick, deterministic snapshots          | Implemented                                                                       |          **Strong** | Add explicit kernel ownership notes in any new AI/economy/weather hooks.                                                                      |
| World schema/model discipline  | Data-driven schema over object class explosion            | Content is schema-based in core path                                              |          **Strong** | Add compatibility validation checks for all authored plugins and tool outputs.                                                                |
| Renderer separation            | Simulation snapshot feeds presentation layer              | Implemented and reused across runtime and minimap                                 |          **Strong** | Preserve and codify in render-accessibility ADR as required contract.                                                                         |
| Collision matrix               | Category/mask semantics                                   | Obstacle path exists; categories are partial/unified                              |         **Partial** | Introduce `CollisionCategory` + `CollisionMask` and matrix assertions.                                                                        |
| Streaming world                | Chunk/chunk manifest lifecycle                            | Not yet present                                                                   |         **Missing** | Add world chunk manifest request/validate/activate/unload flow and deterministic IDs.                                                         |
| Asset pipeline                 | Validation/compression/versioning for material/mesh/audio | Not centralized to game-ready manifest pipeline                                   |         **Partial** | Add importer + versioned asset manifest + provenance/copyright validation rules.                                                              |
| Simulation layers              | Weather/economy/traffic/logic decoupled as domains        | Core currently robust around terrain/mobility                                     |         **Partial** | Add first optional domains with explicit `system` interfaces and ordering.                                                                    |
| Behaviour architecture         | BT/GOAP/utility for AI                                    | Behaviour is currently fixed flow with no planner                                 |         **Missing** | Add one behavior abstraction behind a stable interface only where complexity requires.                                                        |
| Event system                   | Deterministic event/mission scheduling                    | No global event graph                                                             |         **Missing** | Add deterministic event bus + payload schema for systems and replays.                                                                         |
| Modding architecture           | Authoring as content packs                                | Core is data-driven; no public pack/validation channel yet                        |         **Partial** | Add schema-vetted pack manifest + compatibility + moderation/review policy first.                                                             |
| Deterministic replay artifact  | Input replay + shared artifact                            | Tick determinism exists, but no formal replay transport                           |         **Partial** | Add compact versioned run log + checksum + verifier.                                                                                          |
| Resource governance            | Budget envelopes per device/context                       | Basic frame counters exist; no governor policy                                    |         **Partial** | Add CPU/GPU/VRAM/battery budget classes + fallback strategy.                                                                                  |
| Authority scaling              | Server-authoritative mutation model                       | Not introduced; local-only deterministic                                          |         **Missing** | Add intent queue + validation token model after replay+event lanes are stable.                                                                |
| Machine-centric growth         | Treat abilities as capabilities; machines not vehicles    | Early capability abstraction in profiles; no machine plugin graph                 |         **Partial** | Add machine-definition schema and composition rules for non-mobility machines.                                                                |

### 2.1) Contract-note reconciliation

The status matrix above is still the implementation truth, but the repo now has
named contract notes for the major growth lanes:
For a compact lane index, use [3D Game Contract Index](./3D_GAME_CONTRACT_INDEX_2026-07-25.md).

- Culling/visibility and LOD: [Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)
- Streaming world: [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
- Collision matrix: [Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md)
- Asset pipeline: [Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- Simulation layers: [Simulation Layers and Resource Governance Contract](./SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md)
- Behavior system: [Behavior System and Planner Contracts](./BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md)
- Event system: [Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md)
- Modding: [Modding and Creator Pack Validation Contract](./MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md)
- Replay: [Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md)
- Resource governance: [Resource Budget and Fallback Envelope](./RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)
- Authority: [Authority Model Groundwork Contract](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md)
- Machine-centric growth: [ECS Threshold and Composition Readiness Contract](./ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md)

That means this audit can now point to a named boundary for each major
platform-direction question instead of treating them as a single open-ended
future list.

## 3) What is already possible vs what is currently possible but intentionally deferred

### Already possible with current architecture

- Add new locomotion families through profile/registry without replacing renderer.
- Persist migration-safe gameplay state and deterministic replays at the simulation level.
- Extend renderer without changing simulation logic if using snapshot contract.

### Possible but not yet used (and likely valuable)

- Replace static object culling with staged visibility policy.
- Introduce event bus before adding social/multiplayer surfaces.
- Stand up a machine/plugin directory (activity/activity module contracts) without full ECS migration.

### Deliberately deferred

- ECS migration is not yet the right first move unless actor graph/volume crosses a proven threshold.
- Multiplayer authority claims should remain false until replay + authority intent pipeline exists.

## 4) Long-horizon architecture synthesis from the “more” section

This maps to the machine-centric growth proposal:

- Treat the world as a **runtime schema** and machines/activities as composable capability sets.
- Treat cameras, weather, audio, and rendering as replaceable presentation systems fed by simulation snapshots.
- Let growth happen in plugin-like activity layers (farm/race/defence/exploration/research/repair/etc.) instead of hardwired mode branches.

Recommended canonical domain split (ordered and enforced by data contract):

1. `world_schema`: regions, routes, anchors, resources, spawned entities, capability envelopes
2. `simulation_systems`: physics/collision/economy/weather/mission/events
3. `activity_plugins`: objective packs and machine-compatibility contracts
4. `presentation_systems`: render/camera/audio/ui
5. `governance`: budgets, authority, migration, replay, provenance

## 5) Recommended completion sequence (platform-first, not feature-first)

1. **Render hardening lane**
   - Add visibility buckets and deterministic actor cull metrics.
   - Add culling + LOD fixture set.
2. **Governance + replay lane**
   - Add deterministic run record schema and verifier.
   - Add resource envelope profile and fallback policy.
3. **Interaction lane**
   - Add collision category/mask matrix.
   - Add event scheduling contract used by activities.
4. **World growth lane**
   - Add chunk manifest + load/unload lifecycle.
5. **Authority lane**
   - Add mutation intent token + validation stage before any shared session claims.

## 6) Required evidence updates to finalize this audit as closed-loop

- [ ] Add a dedicated `WorldChunkManifest` schema and smoke test.
- [ ] Add `CollisionCategory` fixture tests proving non-colliding layers are skipped.
- [ ] Add run log serializer/verifier tests.
- [ ] Add event bus integration test with deterministic ordering.
- [ ] Add resource budget thresholds and degraded-mode tests (low/medium/high profiles).

## 7) Repo linkage

- Primary consolidated analysis: `docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md`
- Prior continuation pass: `docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md`
- Current checkpoint map: `docs/exploration/EXPLORATION_MAP.md`
- Contracts: `docs/decisions/ADR-0010-rendering-accessibility-contract.md`

## 8) Confidence and boundaries

This is a strategic documentation audit (no runtime/code behavior changes).

- Evidence depth: Tier 1 static + file-trace, aligned with static acceptance from prior passes.
- Runtime confirmation remains pending for each proposed lane.
- No public multiplayer, streaming, or pack governance claims should be made until their gates are completed.

## 9) “And more” extraction: high-leverage additions the conversation introduced

The later conversation adds a second-order rule: treat change as one of four planes.

- **Invariants** (rarely change): tick order, schema compatibility, input intent model, ownership boundaries, persistence ownership, and event ordering.
- **Capabilities** (sometimes change): `plough`, `tow`, `survey`, `winch`, `hover`, and any future `repair`/`build`/`fight` style verbs.
- **Content** (frequently changes): rigs, terrain definitions, mission contracts, rewards, and world recipe variants.
- **Tuning** (often changes): motor torque constants, drift coefficients, reward rates, budgets, and camera timing.

### Capability contracts are behavior surfaces, not flags

Current code already uses capability lists on rigs (`RIG_PROFILES`), but this should be formalized into explicit definitions for the next wave:

1. **CapabilityDefinition** (versioned schema)
   - `id`, `version`, `requirements`, `actions`, `validationRules`, telemetry contract.
2. **MachineCapabilityState** (runtime state)
   - Parameters that alter capability execution per instance: cooldowns, wear, attachment points, strain/cooldown, module quality.
3. **Compatibility matrix**
   - Capability requirements on activities and affordances are resolved before action execution.

This is directly supported by existing files:

- registry path: `RIG_PROFILES`, `MODULES` in `src/game/contracts.ts` and `src/game/input.ts`
- kernel path: `src/game/state.ts`
- validation path: `src/game/storage.ts`
- world truth path: `src/game/gameworld.ts`

### Four-pipe architecture extension (authoritative order)

To keep this platform scalable without adding duplicate truths:

1. `Input / AI / Network` produce **Commands** (immutable intent).
2. `Validation + Authority` filters invalid/tampered commands and resolves deterministic outcomes.
3. `Kernel` applies ordered systems (`physics`/`collision`/`economy`/`activities`/`events`).
4. `Presentation` consumes a simulation snapshot (`renderer`, `audio`, `HUD`).

If authority is not live today, do not bypass this shape: build the same structure locally first so multiplayer can reuse it later.

### What is now possible to implement immediately (without architecture debt)

The following additions are safe with current dependencies and avoid ECS/microservice risk:

- **Replay artifact**: log deterministic input + selected seed + world memory hash at fixed-step boundaries.
- **Event bus (single-threaded)**: deterministic queue with monotonic sequence and explicit event payload schema.
- **Collision category matrix**: typed categories and masks to prevent unintended heavy-object blocking on light rigs.
- **Streaming manifest**: content-defined chunk keys and life-cycle (`pending | active | evicted`), then lazy terrain/procedural activation.
- **Governed resource profiles**: low/medium/high budget policy with graceful degradation.

### Priority lane with explicit proof obligation

Lane A (recommended first): **Render hardening + budgets**

- prove: stable first-controllable < 5s on Tier-2 desktop and no regression in 360p mobile path.

Lane B: **Governance + replay**

- prove: one canonical run record loads in current fixed-step replay harness and produces byte-stable final states.

Lane C: **Collision matrix + affordances**

- prove: at least one heavy-light interaction now differs in effect via capability compatibility, not by bespoke branch.

Lane D: **World stream manifest + deterministic chunks**

- prove: out-of-view worlds do not allocate terrain/obstacle work in the frame budget path.

Lane E: **Authority envelope**

- prove: local-only mode remains deterministic when mutation passes through command validation; multiplayer can be swapped in later with same interface.

## 10) Addendum (2026-07-25) - fresh Field 02 runtime recheck, same backlog shape

- Re-checked the platform audit against the current browser daemon and the live
  `Field 02` runtime.
- The daemon still reports a healthy browser surface with zero console logs.
- The current runtime still supports the platform backlog’s core premise:
  - bounded playable loop,
  - deterministic local simulation,
  - accessible shell and focus handoff,
  - observable render/performance metrics,
  - asset provenance formalized as reference-first, not runtime-imported,
  - visibility/culling behavior intentionally bounded but not yet harnessed as a
    reusable spike test.
- The main high-level gaps are still the same and remain correctly future-gated:
  - no shipped-mesh authority layer,
  - no packaged comparison bundle for visibility/performance/accessibility,
  - no runtime-imported asset manifest in the playable path,
  - no formal replay transport or authority intent pipeline,
  - no chunk manifest / streaming lifecycle proving out-of-view work stays out
    of the frame budget.
- This means the long-term backlog is still the right backlog, but the repo now
  has enough live evidence to keep the risky lanes sequenced rather than
  hand-wavy.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  and doc inspection.

## Addendum (2026-07-27): reread of the updated 3D optimization gaps ordering

- The 2026-07-27 reread of the "3D Game Optimization Gaps" thread is now
  captured in
  [Additional ChatGPT Research Ingestion](./ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md).
- The durable order remains unchanged but is now sharper: kernel/render split
  first, then capability contracts, command/event separation, storage and
  migration, observability, and only later streaming or authority expansion.
- No new runtime evidence was required for this addendum; it is a navigation
  and ordering update only.

## Addendum (2026-07-27): first-principles horizon for the platform audit

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this platform audit. This document still owns the
platform-risk frame and sequencing of proof obligations; the new note carries
the wider machine-keeper thesis and long-range product direction.
