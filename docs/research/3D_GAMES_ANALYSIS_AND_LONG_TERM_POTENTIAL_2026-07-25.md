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

1. Add `docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md` with renderer budget thresholds and visual language plan.
2. Add culling + LOD spike tests tied to deterministic fixture scenes.
3. Add `ADR` documenting a renderer/camera policy for v1.x to avoid ad-hoc growth.
4. Add instrumentation KPIs for per-frame actor count, active physics count, and transition latency in production-like profiles.

## Open risks and residual questions

- Will simplified physics remain readable and fun at higher speed without introducing a heavier engine?
- What minimum camera/visual contract is needed for accessibility before the first public smoke test?
- Which second locomotion family gives most product value before adding a second camera system?
- Which online authority surface is worth exposing first (ghost/seed sync vs authoritative room?
)

## Decision notes for long-term continuity

No architecture rewrite is proposed in this pass.

The codebase currently shows a strong base for this direction, and the highest-leverage path is:
- lock contracts early,
- tighten rendering/physics invariants,
- then expand gameplay breadth through capability-backed modular growth.

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
| Deterministic replay | Deterministic kernel and public snapshot exist; no explicit input recording/replay playback API yet. | Partial |
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
| Replay transport | Replay is logically possible from deterministic kernel, but input log → playback mode is not yet a first-class API. | `src/game/state.ts`, `src/main.ts` | Partial |

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
