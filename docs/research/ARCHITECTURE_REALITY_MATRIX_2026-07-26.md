# Rigs Unbound Architecture Reality Matrix

**Date:** 2026-07-26  
**Purpose:** A current-state index that distinguishes active implementation from staged architecture.  
**Evidence tier:** Tier 1 static inspection unless a linked acceptance artifact states stronger evidence. This index does not claim browser, device, build, or full-suite verification for the current analysis pass.

## Governing principle

Rigs Unbound is growing toward a machine-centric simulation platform, but it must earn each abstraction through a real vertical use case. The canonical noun is `Rig`: the tractor is an initial playable machine, not the product’s architectural ceiling.

The system should generalize durable rules and ownership boundaries while allowing vehicle feel, camera tuning, activity pacing, audio character, and visual identity to remain specific.

## Reality matrix

| Domain                | Active, evidenced reality                                                                                                              | Explicitly not active                                                       | Next admission gate                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Simulation kernel     | Fixed-step authoritative state/world flow with a renderer/presentation boundary                                                        | Full ECS or universal entity runtime                                        | Demonstrated high actor/composition pressure with profile evidence.                         |
| Rig composition       | Effective rig profiles compose modules/capabilities for multiple playable rigs                                                         | Deep vehicle inheritance tree                                               | A new machine should reuse the profile/adapter boundary before new abstraction.             |
| World affordances     | One versioned relay-cargo `tow` offer resolves capability/range/world availability                                                     | General interaction/plugin interpreter                                      | A second genuine world offer that shares a proven extra constraint.                         |
| Commands and outcomes | Primary action and rig selection have explicit intent/outcome slices                                                                   | Network authority or generic RPC layer                                      | A third real command pressure plus shared-state requirement.                                |
| Replay                | Versioned run records carry a hash-bound initial state/world context; local deterministic validation supports a bounded command subset | Ghost playback, remote verification, cross-version replay migration         | Browser playback proof and durable export/checkpoint format.                                |
| Replay retention      | Dropped history returns `truncated-record`, never replay certification                                                                 | Transparent replay of a retained suffix                                     | A format with a new hash-bound checkpoint at each retention boundary.                       |
| Persistence           | Versioned save/load, migration, bounded world memory, and load/save provenance                                                         | Per-domain migrations for all future content packs                          | Persisted domain instances or a second durable contract version.                            |
| World scale           | Seeded procedural terrain plus bounded spatial deltas                                                                                  | Chunk residency, eviction, streamed assets/regions                          | Measured memory/load/visibility pressure with lifecycle and recovery proof.                 |
| Collision             | Procedural obstacles, authored structure queries, rig/camera semantics                                                                 | General collision-mask registry                                             | A third distinct consumer such as trigger, projectile, hazard, or AI line of sight.         |
| Visibility and LOD    | Logical visibility/profile fallback and renderer metrics                                                                               | Representation-changing mesh LOD, general GPU occlusion, portals in runtime | Target-device evidence proving their cost/value.                                            |
| Lighting/shadows      | Directional/hemisphere lighting, ACES/sRGB, DPR cap, blob shadows, shadow maps disabled                                                | PCF/CSM, dynamic shadow lights, generic post-processing graph               | Quality-tier proof with visual comparison, resource bounds, fallback, and browser evidence. |
| Audio                 | Local procedural active-rig voice, surface/slip feedback, impact/chirp, user-gesture unlock, safe mute                                 | Music system, ambient zones, positional world audio, imported audio runtime | A second real audio producer with source lifecycle, accessibility, and budget proof.        |
| Assets                | Manifest/provenance/preflight direction and explicit runtime fallback behavior                                                         | General streamed asset residency or unrestricted generated-asset activation | Validated asset lifecycle with prefetch/cancel/evict and resource evidence.                 |
| AI/planning           | Deterministic command and affordance boundaries exist for future proposals                                                             | Planner/director with unrestricted writes                                   | A real multi-candidate AI decision that benefits from scored proposals.                     |
| Multiplayer/authority | Local command validation and outcome evidence prepare for authority                                                                    | Server-owned shared world, client prediction, reconciliation                | A concrete shared-state feature with conflict/ownership requirements.                       |

## Canonical documents by boundary

- [Replay artifact and ghost contract](REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md)
- [Run-record retention and replay certification](RUN_RECORD_RETENTION_AND_REPLAY_CERTIFICATION_CONTRACT_2026-07-26.md)
- [Save and migration observability](SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md)
- [Authority groundwork](AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md)
- [Activity content and command readiness](ACTIVITY_CONTENT_AND_COMMAND_CONTRACT_READINESS_2026-07-26.md)
- [Capability/affordance second-proof gate](CAPABILITY_AFFORDANCE_SECOND_PROOF_GATE_2026-07-26.md)
- [Rig capability vocabulary decision](RIG_CAPABILITY_VOCABULARY_DECISION_2026-07-26.md)
- [World schema and content ingestion](WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE_2026-07-26.md)
- [World site verb vocabulary decision](WORLD_SITE_VERB_VOCABULARY_DECISION_2026-07-26.md)
- [Spatial coordinate scale and origin gate](SPATIAL_COORDINATE_SCALE_AND_ORIGIN_GATE_2026-07-26.md)
- [World and architecture scalability](WORLD_AND_ARCHITECTURE_SCALABILITY_CONTRACT_2026-07-25.md)
- [Simulation layers and resource governance](SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md)
- [Lighting and shadow quality gate](LIGHTING_AND_SHADOW_QUALITY_GATE_2026-07-26.md)
- [Condition-impact presentation pulse](CONDITION_IMPACT_PRESENTATION_PULSE_2026-07-26.md)
- [Audio presentation and spatial budget](AUDIO_PRESENTATION_AND_SPATIAL_BUDGET_CONTRACT_2026-07-26.md)
- [Operator observability and diagnostics](OPERATOR_OBSERVABILITY_AND_DIAGNOSTICS_CONTRACT_2026-07-26.md)
- [Event propagation and presentation observer gate](EVENT_PROPAGATION_AND_PRESENTATION_OBSERVER_GATE_2026-07-26.md)
- [Behavior system and planner contracts](BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACT_2026-07-26.md)
- [Procedural director and generated-content admission](PROCEDURAL_DIRECTOR_AND_GENERATED_CONTENT_ADMISSION_GATE_2026-07-26.md)

## Do-not-do list

The following would create architecture theatre or duplicate truth under current evidence:

- build a full ECS before actor volume requires it;
- add streaming because it is a common open-world word rather than a measured need;
- turn every vehicle/action into a generic JSON callback;
- enable expensive renderer features without a measured quality tier and fallback;
- make audio, UI, or rendering mutate authoritative state;
- add a collision layer matrix before a third consumer needs one;
- introduce a server authority layer before a shared-world conflict exists;
- present a bounded/truncated diagnostic run record as a certified replay.

## Next vertical proofs, in dependency order

1. Browser playback of a complete, non-truncated run record from its captured context.
2. A second capability/affordance world offer from an actual game activity.
3. A second audio producer with explicit source lifecycle and fallback observability.
4. A renderer quality proof that compares blob shadows to one bounded directional shadow tier.
5. Cross-domain resource governance only after a non-render domain supplies measurable pressure.
6. Streaming residency only after world/asset scale crosses a documented threshold.

## Interpretation rules

- A doc describing a possible system is not proof that the system is implemented.
- A unit test or static type is not browser/device evidence.
- Metrics must identify what they actually measure; renderer geometry/texture counts are not VRAM totals.
- A future subsystem may propose commands and consume state/events, but it does not gain direct mutation authority.
- Every new durable input, content schema, replay format, save domain, and asset definition needs validation and versioning before it becomes player data.

## Review trigger

Update this matrix whenever a staged admission gate becomes active implementation, a canonical ownership boundary changes, or new evidence invalidates a current statement. Preserve historical decisions through dated addenda rather than silently rewriting the project’s architecture trail.

## Anything else?

Yes: the matrix intentionally keeps input-contract convergence and production/exported observability visible as open decisions. Neither is solved by the current local browser implementation alone.
