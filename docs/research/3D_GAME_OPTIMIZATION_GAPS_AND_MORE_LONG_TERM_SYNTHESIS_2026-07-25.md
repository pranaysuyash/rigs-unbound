# 3D Game Optimization Gaps + Long-Term Expansion Synthesis

_Date:_ 2026-07-25
_Context:_ Rigs Unbound architecture audit aligned with the ChatGPT "3D Game Optimization Gaps" thread (core + additional layers + practical sequencing).

## Skill provenance

The audit was run with the `3d-games` skill family one file at a time:

- `/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md`
- `/Users/pranay/Projects/skills/game-development/3d-games/SKILL.md`

The skill guidance used here was limited to the rendering, shader, physics, camera, lighting, and LOD principles. The repo interpretation below is the project-specific layer: it maps those generic principles onto the current kernel, renderer, collision field, telemetry, and save model.

## 1) What was checked

We reviewed the existing repository and applied this directly to implementation reality, not abstract recommendations:

- Gameplay kernel and state orchestration
- World schema, migrations, and save recovery
- World/renderer boundary and presentation snapshot
- Collision and obstacle handling
- Capability and activity gating in current action system
- Performance telemetry and HUD/runtime metrics
- Existing exploration/research artifacts and execution docs already present in-repo
- Relevant 3D-game skills (`3d-games` variants) for consistency and checklist mapping

## 2) Current status by gap (implemented vs possible)

### A. Core engine invariants and kernel

- **Deterministic fixed-step tick loop** is implemented in `src/game/state.ts`.
- **Kernel ordering** is explicit (`input/actions -> terrain/physics -> camera/feedback -> diagnostics`) and supports deterministic replay-friendly structure.
- **State vs render split** is present (`snapshot`-driven render consumption), so renderer is presentation rather than simulation owner.
- **Current value:** highest foundation is already in place for future multiplayer, replay, and tooling.

### B. Storage, versioning, migration

- **Save payload migration path** exists in game state (`state.ts`) with guarded migration and schema checks, including fallback handling for malformed saves.
- **Storage snapshot shape** includes world memory separation.
- **Current value:** this is solid for continuity and prevents early-world lock-in.

### C. Culling, LOD, and scene complexity management

- **Partially present:** there is world-distance pruning and some coarse draw curation in renderer paths; the current renderer can still force explicit `frustumCulled = false` on several meshes (a deliberate artifact-performance shortcut).
- **Not yet implemented:** formal frustum pass pipeline, occlusion pass, portal culling, and structured distance LOD ladders for geometry/shaders/AI/physics tiers.
- **Risk:** terrain-open-world scale will become the first budget breaker as content density increases.

### D. Asset/scene streaming

- **Not yet fully present:** no complete chunk streaming/lifecycle pipeline for terrain + assets as player moves.
- **Current behavior:** world state can load persistently with constrained map scale.
- **Next required:** chunk scheduler, residency policies, asset manifest prefetch, unload thresholds.

### E. Capability system maturity

- **Foundation exists:** capability-like checks and rig profiles are implemented and tested for action gating in gameplay state.
- **Gap:** capabilities are not yet fully decoupled into versioned contract definitions with shared adapter semantics and rich parameterized definitions.
- **Next step:** formal schema + adapter separation between invariant behavior and machine-specific tuning.

### F. Affordance-based interaction model

- **Partially present:** interaction constraints exist at action and terrain levels, but world objects do not yet expose a generalized affordance API.
- **Gap:** activity logic still relies on specific flow checks in places; it should move to capability + affordance compatibility checks for scale.

### G. Camera feel

- **Foundational camera tuning exists** (lag, bob/boost feedback, HUD coupling, terrain/water cues).
- **Gap:** missing a formal state-machine camera contract as declarative config for non-vehicle and future platforms.

### H. Rendering strategy and materials

- **Separation exists** between simulation and presentation, with performance metric export.
- **Gap:** no render graph abstraction yet, and no formal material stack layering for modular modifiers (mud/snow/dust/rust/heat)
- **Priority:** medium, but valuable once content count grows.

### I. Collision layers and matrix

- **Current foundation:** obstacle field model and collision handling in `src/game/collision.ts`.
- **Gap:** full broadphase/category matrix is not yet explicit; this affects future object count scaling and editor/runtime safety.

### J. Authority, commands, events, and replay

- **Current:** command intent enters kernel, deterministic transitions are partially prepared by design.
- **Gap:** explicit command/event pipeline (Intent -> Validate -> State mutation -> Domain event -> presentation) is not yet formalized across all systems; deterministic replay artifact export is still light even though a bounded run-record lane and browser-visible verification hook now exist in `src/main.ts`.

### K. Observability and budgets

- **Strong baseline:** render and simulation telemetry are already captured into runtime snapshot (`drawCalls`, triangles, terrain build timing, fps proxy fields).
- **Gap:** budgets are not currently enforced by an adaptive scheduler across graphics/AI/physics tiers; no automated budget-failover thresholds in-loop yet.

## 2.1) Evidence matrix

| Area | Strongest current evidence | Status | What this proves |
| --- | --- | --- | --- |
| Deterministic kernel | `src/game/state.ts`, `src/game/state.test.ts` | Implemented | Fixed-step game orchestration and test-backed action ordering already exist. |
| Save/versioning | `src/game/state.ts`, `src/game/storage.ts` | Implemented | Multi-version recovery and state/world snapshot persistence are canonical. |
| Renderer boundary | `src/game/renderer.ts`, `src/main.ts` | Implemented | Presentation is snapshot-driven; the UI does not own simulation truth. |
| Culling/LOD | `src/game/renderer.ts`, `docs/exploration/EXPLORATION_MAP.md` | Partial | Renderer-side instancing exists, but explicit visibility tiers and subsystem LOD contracts do not. |
| Collision matrix | `src/game/collision.ts`, `src/game/physics.ts` | Partial | Obstacle resolution is centralized, but category/mask semantics are not yet explicit. |
| Capability model | `src/game/contracts.ts`, `src/game/state.ts` | Partial | Rig profiles and action gating exist, but capabilities are not yet fully versioned contracts. |
| Replay/event lane | `src/main.ts`, `src/game/run-record.ts`, `src/game/state.ts` | Partial | There is now a bounded in-memory run-record lane with input-transition capture, checkpoint hashes, a structural verifier, a browser-visible verification hook, and explicit truncation, but no durable playback verifier yet. |
| Chunk/world streaming | `src/game/gameworld.ts`, `docs/exploration/EXPLORATION_MAP.md` | Missing | The world is bounded and persistent, but not yet residency-streamed. |
| Observability | `src/game/performance.ts`, `src/main.ts` | Partial | Runtime metrics and user-visible telemetry exist, but budget enforcement is still manual. |

### 2.2) Contract-note reconciliation

The current implementation status above remains the source of truth, but the
repo now also has named contract notes for the main follow-on lanes.

For a compact lane directory, use [3D Game Contract Index](./3D_GAME_CONTRACT_INDEX_2026-07-25.md).

- Culling/LOD: [Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)
- Collision matrix: [Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md)
- Capability model: [Capability Contract and Adapter Guardrails](./CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)
- Replay/event lane: [Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md) and [Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md)
- Chunk/world streaming: [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
- Observability/resource control: [Resource Budget and Fallback Envelope](./RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md) and [Performance and Readability Baseline Contract](./PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md)

That means the synthesis no longer depends on the table alone for ownership;
the durable contract notes now carry the implementation runway forward.

## 3) What is possible next (low-risk, high leverage)

1. **Frustum + distance cull + LOD contracts**
   - Add visibility pruning stage before draw-call submission.
   - Add LOD tiers for non-player vehicles/entities, particle impostors, and physics/AI tick budgets.

2. **Streaming v1**
   - Define chunk + asset manifest versioned contract.
   - Start with terrain-ring streaming and deferred detail asset load.

3. **Capability/affordance contract v1**
   - Formalize capability definitions as validated data records.
   - Introduce world-affordance descriptors.
   - Resolve activity eligibility as capability × affordance compatibility.

4. **Migration hardening**
   - Expand per-contract versioning for runtime definitions (capabilities, activities, world chunk records).

5. **Command/event separation lane**
   - Extend the bounded run record into durable deterministic command/event replay.
   - Emit replayable domain events for audit and diagnostics.

## 4) Suggested execution order (first principles)

1. **Protect architecture now**: keep the kernel and split intact; do not route state updates from UI/audio/renderer.
2. **Introduce one next major proof**: capability-affordance compatibility for `tow/farm/harvest` + one new mobility adapter.
3. **Add culling + LOD** as soon as proof 1 introduces second entity density pressure.
4. **Introduce chunk residency + manifest** only when open-world radius exceeds current stable frame budget.
5. **Add replay+events** once command/lane separation is stable.

## 5) Acceptance gates (for this audit-to-implementation bridge)

- [ ] Frustum pass implemented and visible in renderer flow.
- [ ] Distance LOD and render tier budget enforced in at least two systems.
- [ ] At least one chunk streaming scenario measured and stable.
- [ ] Capability and activity schema versioned and validated on load.
- [ ] Command -> validation -> event -> render-update lane exists in one subsystem and is documented.
- [ ] Deterministic replay export/import path records at least input stream + world tick hash.
- [ ] Collision matrix added for at least high-frequency obstacle categories.

## 6) Evidence references already present in-repo

- `docs/WORKLOG.md`
- `docs/research/3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md`
- `docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md`
- `docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md`
- `src/game/state.ts`
- `src/game/contracts.ts`
- `src/game/renderer.ts`
- `src/game/storage.ts`
- `src/game/collision.ts`
- `src/game/performance.ts`
- `src/game/state.test.ts`

## 7) Notes from the latest “additional” recommendations integrated above

- Prioritize architecture before features.
- Abstract only after the second proven use case.
- Keep long-lived engine invariants (tick order, mutation rules, intent->state boundary) stable.
- Data that changes often stays in validated content; gameplay invariants remain in code/contracts.
