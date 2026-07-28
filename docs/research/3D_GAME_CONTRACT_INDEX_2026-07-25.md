# 3D Game Contract Index (2026-07-25)

This index is a navigation aid, not a separate source of truth. Each linked
contract note remains authoritative for its lane; this file simply makes the
current 3D-game architecture map easier to traverse.

## Core platform contracts

| Lane                 | Contract note                                                                                                                | Owns                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Core loop            | [Core Loop and Progression Contract](./CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)                                     | Player-facing loop, session progression, recovery grammar                        |
| Capability model     | [Capability Contract and Adapter Guardrails](./CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)                     | Rig capabilities, adapter binding, reason-coded admission, affordance resolution |
| World affordances    | [World Affordances and Capability Resolution Contract](./WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md) | World verbs, affordance records, deterministic capability matching               |
| Behavior/planner     | [Behavior System and Planner Contracts](./BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md)                               | Decision layer, planner selection, deterministic action choice                   |
| Event graph          | [Event Graph and Deterministic Handlers Contract](./EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md)           | Ordered event envelopes, handler ownership, replay-safe mutations                |
| Contract ledger      | [Contract Ledger Specification](./CONTRACT_LEDGER_SPEC_2026-07-27.md)                                                      | Read-only activity ledger, progression gates, publicState-derived mission view  |
| Episode runner       | [Episode Runner Specification](./EPISODE_RUNNER_SPEC_2026-07-27.md) and [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md) | Named composition stack, episode plan, consequence schema                      |
| Kernel ordering      | [Kernel Ordering and Mutable Subsystem Gates Contract](./KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md) | Mutation order, validation gates, renderer-only separation                       |
| Save and migration   | [Save and Migration Observability Contract](./SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md)                       | Save visibility, migration reporting, recovery explanation                       |
| Authority groundwork | [Authority Model Groundwork Contract](./AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md)                                   | Local-first authority, future-only shared-state boundaries                       |
| World scalability    | [World and Architecture Scalability Contract](./WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md)                   | Chunk growth, activity packing, migration boundaries                             |
| ECS readiness        | [ECS Threshold and Composition Readiness Contract](./ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md)         | Composition threshold, identity-preserving migration trigger                     |

## Spatial and rendering contracts

| Lane                               | Contract note                                                                                                                                    | Owns                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Visibility and LOD                 | [Visibility Stage and LOD Contract](./VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)                                                           | Frustum/distance policy, subsystem LOD tiers, draw budgets                 |
| Collision matrix                   | [Collision Category and Mask Contract](./COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md)                                                     | Category/mask semantics, trigger/hazard/projectile handling                |
| Camera feel                        | [Camera Feel Contract](./CAMERA_FEEL_CONTRACT_2026-07-25.md)                                                                                     | Mode transitions, comfort policy, obstruction handling                     |
| Shader/material                    | [Shader and Material Strategy Contract](./SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md)                                                   | Layered materials, readability cues, fallback behavior                     |
| Renderer performance/accessibility | [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md) | Smoke-test acceptance profile, reduced-motion safety, baseline readability |
| Unified UI shell                   | [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)                                                                          | Overlay stack, accessibility contract, input contract, z-order             |
| Garage / fleet roster              | [Garage / Fleet Roster Specification](./GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md)                                                                  | Fleet sheet, active rig, location/status, character-sheet summary          |
| Accessibility/input                | [Accessibility and Input Contract](./ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md)                                                             | Named actions, remaps, comfort settings, device parity                     |
| Lighting/atmosphere                | [Lighting and Atmosphere Strategy Contract](./LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md)                                           | Readability-first lighting tiers, shadow fallback rules                    |
| Portal visibility                  | [Portal Visibility and Bounded Rooms Contract](./PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md)                                     | Room graphs, portal propagation, indoor fallback behavior                  |
| Resource budgets                   | [Resource Budget and Fallback Envelope](./RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)                                                   | Cross-system budget bands, degrade rules, operator visibility              |
| Performance/readability baseline   | [Performance and Readability Baseline Contract](./PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md)                                   | Umbrella thresholds across culling, camera, collision, and budgets         |
| Physics quality                    | [Physics Quality Envelope Contract](./PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md)                                                           | Deterministic motion envelope, stability invariants, fallback playability  |
| Physics readability/speed          | [Physics Readability and Speed Contract](./PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md)                                                 | Simplified physics readability under rising speed and load                 |

## World growth, content, and ingestion contracts

| Lane                     | Contract note                                                                                                                    | Owns                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Asset authority/mesh     | [Asset Authority and Shipped Mesh Contract](./ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)                                   | Reference-vs-mesh truth boundary, shipped visual geometry, vehicle blueprint compatibility |
| Streaming world          | [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)               | Chunk lifecycle, residency, rollback, unload policy                                        |
| Asset pipeline           | [Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)                                 | Source-to-runtime asset flow, provenance, replacement rules, resource-aware promotion gate |
| Web asset ingest         | [Web Asset Ingest and Compression Contract](./WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)                           | Browser-facing asset manifests, compression, activation gating                             |
| Web loading/bootstrap    | [Web Loading and Profile Bootstrap Contract](./WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)                         | Shell/loading states, fallback preview, profile selection                                  |
| Authoring validation     | [Authoring and Reproducible Content Validation Contract](./AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md) | Validator-first manifests, reproducible content admission                                  |
| Modding                  | [Modding and Creator Pack Validation Contract](./MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md)                     | Pack lifecycle, compatibility, moderation and rollback                                     |
| Simulation layers        | [Simulation Layers and Resource Governance Contract](./SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md)         | Domain order, owned state, fallback governance                                             |
| Minimap/world coordinate | [Minimap and World-Coordinate Contract](./MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md)                                   | Map-space truth, surveyed cells, coordinate ownership                                      |

## Replay, testing, and alternate backend contracts

| Lane                       | Contract note                                                                                                                                    | Owns                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Replay artifact            | [Replay Artifact and Ghost Contract](./REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md)                                                         | Shareable run records, checksums, playback verification                |
| Verification harness       | [Verification Harness and Confidence Gates Contract](./VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md)                         | Deterministic fixtures, tiered evidence, failure reporting             |
| Second locomotion family   | [Second Locomotion Family and Cross-Mode Continuity Contract](./SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md)       | Cross-mode continuity, shared actions, rollback safety                 |
| Engine branch gating       | [Engine Branch Evaluation and Alternate Backend Gating Contract](./ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md) | Bounded backend comparisons, stop conditions, migration decision gates |
| Browser acceptance fixture | [Physics Lab Browser Experience and Acceptance Contract](./PHYSICS_LAB_BROWSER_EXPERIENCE_AND_ACCEPTANCE_CONTRACT_2026-07-25.md)                 | Lab route, acceptance runner, evidence fixture boundaries              |

## How to use this index

1. Start with the lane that matches the next architecture question.
2. Read the linked contract note for the authoritative boundary.
3. Use the research audit docs for the implementation snapshot and sequencing.
4. Use `docs/WORKLOG.md` for the dated continuity trail.

## Related synthesis docs

- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](./3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md](./3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md](./3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md](./3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](./3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## Related visual reference surfaces

- [Vehicle Game Visual Exploration Living Catalog](../vehicle_game_visual_exploration_living_catalog.md) - exploratory prompt-ready scene inventory and reusable composition syntax; explicitly not production-approved by default.
- [Additional ChatGPT Research Ingestion](./ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md)
- [Compositional Episode Grammar and Storm Relay](./COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)

## Supporting continuity artifacts

- [Docs root landing page](../README.md)
- [Rigs Unbound Exploration Map](../exploration/EXPLORATION_MAP.md)
- [Worklog](../WORKLOG.md)
- [Master Execution Tracker](../plans/MASTER_EXECUTION_TRACKER.md)
- [Render hardening plan](../plans/PLAN_RENDER_PERFORMANCE_ACCESSIBILITY_2026-07-25.md)
- [Risk and Public-Readiness Register](./RISK_AND_PUBLIC_READINESS_REGISTER_2026-07-25.md)
