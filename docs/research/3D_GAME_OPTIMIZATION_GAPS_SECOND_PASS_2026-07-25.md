# 3D Game Optimization Gaps (Second-Pass, 2026-07-25)

## Scope and objective

This pass checks the untrusted conversation `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676` against live repository evidence for **optimization gates and long-term architecture**. The focus was on “additional systems” from the follow-on audit text (kernel, migration, streaming model, replay, authority), and the pass used this skill order:

1. `/Users/pranay/Projects/skills/game-development/3d-games/SKILL.md`
2. `/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md`
3. `/Users/pranay/Projects/skills/3d-web/threejs-shaders/SKILL.md`
4. `/Users/pranay/Projects/skills/3d-web/threejs-materials/SKILL.md`

## What is now strong (already implemented)

- Deterministic, fixed-step kernel and explicit world-surface contract are in place.
  - Evidence: `src/game/state.ts`, `src/game/main.ts`, `src/game/contracts.ts`
  - Migration and schema path are present and recovery-oriented.
  - Evidence: `src/game/storage.ts`, `src/game/state.ts`
- Renderer is separated from simulation state and uses the same terrain/collision substrate.
  - Evidence: `src/game/renderer.ts`, `src/game/gameworld.ts`, `src/game/terrain.ts`, `src/game/collision.ts`
- Instanced rendering is used for dense static props.
  - Evidence: `src/game/renderer.ts`
- Observability exists at runtime and acceptance layers.
  - Evidence: `src/game/performance.ts`, `src/game/renderer.ts`, `src/main.ts`

## What remains intentionally delayed or missing

| Topic | Current status | Why this matters | Suggested gate |
|---|---|---|---|
| Frustum distance/pixel visibility pipeline | Partial/blocked | Main path avoids some overdraw with mesh batching but sets `frustumCulled = false` on many heavy instanced groups. | Renderer hardening sprint |
| Distance/LOD policy | Missing explicit tiers (geometry/material/AI/physics) | Scale-up will become cost-nonlinear as more rig classes, hazards, and content types are added. | Add policy and fixture-based proof |
| Occlusion as renderer pass | Partial | Camera pull-in avoids geometry clipping, but no object-level occlusion submit filter. | Add occlusion stage or explicit non-occluder budget |
| Chunked stream lifecycle | Missing | Terrain is built locally, not chunk-loaded/unloaded by demand. | Add request/activate/rollback/unload lifecycle |
| Collision category matrix | Partial | Current obstacle contact path is uniform and correct for current scale, but not semantically separated by type intent. | Add `CollisionCategory` + `CollisionMask` and tests |
| Dedicated replay artifact | Partial | Determinism is strong, but public/shared playback record format is not yet first-class. | Add versioned input log + checksum + verifier |
| Multiplayer authority | Missing | Simulation is local/replayable, but no server-authoritative mutation pipeline yet. | Add authority lane only after deterministic replay and replay validation |

### Additional systems from extended audit conversation

The follow-on context adds architecture-facing growth risks not limited to rendering. Their current status and gates are:

| Topic | Current status | Why this matters | Suggested gate |
|---|---|---|---|
| ECS (Entity Component System) | Missing | Works today because object count is bounded; ECS reduces churn only when composition and actor count become high-volume. | Continue with adapter-first module composition until actor count or systemic feature breadth makes ECS the clear better trade-off. |
| Streaming world manifest | Missing | Without manifest+stream lifecycle, adding distant biomes/activities risks linear memory growth and long loads. | Add chunk manifest + streaming activation + unload + recovery path with deterministic IDs |
| Asset pipeline maturity | Partial | Current art path is usable but lacks a canonical material/mesh/audio validation and compression pipeline. | Define manifest schema + importer validation + provenance checks + compression profile + license gate |
| Simulation layers | Partial | Physics/collision/rendering are separated; broader systems like weather/economy/traffic still sit inside shared ad-hoc flows. | Introduce domain modules with explicit sequencing and owned state boundaries |
| Behaviour architecture | Missing | Current behavior is rule/path based in state flow; hard scaling to emergent AI/mission NPCs needs explicit planners. | Add one behavior abstraction (BT/GOAP/utility) and migrate target behaviors only where complexity is growing. |
| Event system | Missing | No general world event bus; one-off scripted events will become coupled and difficult to test. | Add deterministic event graph contracts + payload schema + replay compatibility |
| Modding architecture | Partial | Data-driven content exists, but creator/pack extension and compatibility validation are not yet first-class. | Add versioned data-pack manifest + pack validation + moderation/review workflow before external authoring. |
| Deterministic replay artifact | Partial | Input replay is not first-class yet, limiting QA, ghost, and social replay modes. | Finalize serialized run record, playback verifier, and signed checksum in save/repro bundle |
| Resource budgets | Partial | There are runtime counters, but no cross-system budget governor (CPU/GPU/VRAM/battery). | Define budget ledger + feature gate by budget band (low/medium/high), fail-soft fallback policies |

### Contract-note bridge

The status table above remains the implementation snapshot for this pass, but
the repo now has named contract notes that own the main follow-on lanes:

- Culling/visibility and LOD: [Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)
- Shader strategy: [Shader and Material Strategy Contract](./SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md)
- Collision matrix: [Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md)
- Streaming world: [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
- Asset pipeline: [Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- Simulation layers: [Simulation Layers and Resource Governance Contract](./SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md)
- Behavior/planner: [Behavior System and Planner Contracts](./BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md)
- Event graph: [Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md)
- Modding: [Modding and Creator Pack Validation Contract](./MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md)
- Replay artifact: [Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md)
- Resource governance: [Resource Budget and Fallback Envelope](./RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)
- ECS thresholding: [ECS Threshold and Composition Readiness Contract](./ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md)
- Authority grounding: [Authority Model Groundwork Contract](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md)

That means the follow-on recommendations are now owned by durable notes
instead of only existing as a sequence of audit bullets.

## Shader path position

No custom shader system is in production in this pass. Current material usage is pragmatic (standard/PBR-style material choices) and appropriate for the prototype stage. This maps to the shader/material skill guidance that says to defer custom GLSL until identity-carrying effects are contract-bound (mud transitions, hazard state, weather cues, danger cues).

## Recommended execution sequence for this branch

1. **Renderer hardening**: explicit visibility policy + budgets (frustum/distance/occlusion culling fixtures).
2. **Collision-layer and streaming preparation**: category masks before adding more actor classes and hazards.
3. **Replay transport**: stable `RunRecord` schema and playback verifier.
4. **Authority gating**: simulate mutation intent + ownership before social/small co-op.

No code changes were made in this pass; this is a documentation and validation-gate update only.

## 7) Contract-note map for the execution order

The execution order above is now backed by named contract notes, so the branch
can be continued from concrete boundaries instead of only from broad sprint
labels:

1. **Renderer hardening** → [Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md), [Camera Feel Contract](./CAMERA_FEEL_CONTRACT_2026-07-25.md), [Performance and Readability Baseline Contract](./PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md)
2. **Collision-layer and streaming preparation** → [Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md), [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
3. **Replay transport** → [Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md), [Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md)
4. **Authority gating** → [Authority Model Groundwork Contract](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md)
5. **Safe-to-formalize next** → [Kernel Ordering and Mutable Subsystem Gates Contract](./KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md), [Save and Migration Observability Contract](./SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md), [Renderer Performance and Accessibility Contract](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
6. **Possible now with low-to-medium effort** → [Capability Contract and Adapter Guardrails](./CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md), [World Affordances and Capability Resolution Contract](./WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md), [Authoring and Reproducible Content Validation Contract](./AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md)

## 6) Requested "and more" pass closure (2026-07-25)

The follow-on request includes long-term growth concerns (kernel correctness, migration discipline, command/event separation, behavior scaling, mod safety, and resource governance). They are mapped here as the current backlog for this project stage:

- **Safe to formalize next (high confidence):**
  - command/intent separation,
  - deterministic ordering and kernel invariants,
  - schema migration flow,
  - renderer/snapshot split.
- **Possible now with low-to-medium effort:**
  - per-contract versioning for capability/activity definitions,
  - affordance registry + compatibility validation,
  - collision category/mask model,
  - chunk/stream manifest schema.
- **Keep public claims deferred until proven:**
  - deterministic replay artifact and playback verification,
  - authority-capable mutation pipeline,
  - general event bus,
  - full ECS migration.

Decision: do **not** pursue full ECS, broad multiplayer authority, or open UGC publication until the deferred classes are implemented and regression-tested. This keeps the roadmap on the same first-principles path without architecture theatre.

Current confidence:

- **Code-path confidence:** Tier 1 evidence (static review) confirms the contract-first direction is already present in core source references.
- **Decision confidence:** `0.77` that lane ordering is correct for the current phase.
- **Implementation confidence:** medium that lanes are executable without major rewrites because each lane is tied to existing invariants in `state.ts`, `contracts.ts`, `renderer.ts`, and `storage.ts`.

Next proof steps (in order):

1. add one command/schema fixture for a non-trivial action with explicit reject reasons,
2. version one capability and one activity definition,
3. add deterministic replay verification test (input-log hash + terminal state parity),
4. add chunk activation/deactivation with bounded counters.

## Acceptance and evidence depth

- This pass is **Tier 1 (static inspection)** plus live path tracing from the cited files.
- Tier 2/3 runtime verification for new hardening items remains pending by design and requires explicit run records.
