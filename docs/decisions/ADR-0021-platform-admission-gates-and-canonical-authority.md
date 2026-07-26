# ADR-0021: Platform Admission Gates and Canonical Authority

**Date:** 2026-07-26  
**Status:** Proposed — explicit operator sign-off required
**Decision type:** Load-bearing architecture policy  
**Evidence tier:** Tier 1 static architecture/source review for this decision. Linked artifacts may hold stronger evidence for individual existing behavior.

## Context

Rigs Unbound has a real fixed-step simulation, multiple rigs, procedural/authored world layers, persistence, presentation systems, performance fallback, replay artifacts, asset activation, and separate physics-lab dynamics work. It is therefore large enough for architectural shortcuts to create parallel truths, but not large enough to justify every common engine framework.

The product direction is machine-centric: a canonical `Rig` gains capabilities and interacts with a persistent world. The tractor is an initial machine, not an inheritance root or product boundary.

Without a governing policy, the project risks two opposite failures:

1. Add a generic ECS, event bus, streaming system, authority layer, mod SDK, planner, or render graph before a real use case proves its required contract.
2. Add a second local implementation when a new use case appears, leaving the simulation, renderer, UI, asset, replay, or content layers with incompatible truth sources.

## Decision

Adopt **canonical authority plus evidence-backed vertical admission gates** as the platform-growth policy.

### Canonical authority

| Domain | Canonical owner | Non-owner rule |
| --- | --- | --- |
| Simulation state/transitions | Fixed-step state and world systems | Presentation and diagnostics do not mutate authority. |
| World definition | Authored world schema, later validated normalized content definition | Renderer and activities do not duplicate spatial facts. |
| Player-caused spatial deltas | `GameWorld` bounded memory | Save/replay compose it; they do not create a second world state. |
| Rig capability compatibility | Effective rig profiles and affordance resolver | Activities/UI do not maintain rig-ID allowlists. |
| Input/commands | Current active input contract plus versioned command slices | A future multi-producer migration selects one canonical serialized intent. |
| Persistence/migration | Storage schema and owner-specific migrations | Consumers do not silently repair arbitrary stale payloads. |
| Presentation | Renderer, audio, UI consume state/events | Presentation does not become a second simulation. |
| Asset activation | Manifest/provenance/preflight plus renderer bridge fallback | Raw URLs and unreviewed generated assets do not enter runtime. |

### Admission rule

A new cross-cutting platform subsystem is added only when a named vertical use case demonstrates all of:

1. A real owner and input/output contract.
2. At least one concrete behavior that existing canonical paths cannot express without duplication.
3. Validation and failure/recovery behavior.
4. Observability sufficient to explain its active/fallback/error state.
5. A version/migration policy when its data is durable, replayed, exported, or networked.
6. A test and browser/device proof plan proportionate to its risk.

The first implementation must solve the named use case, retain a safe fallback, and avoid granting direct mutation authority to observers.

## Staged platform gates

| Area | Active posture | Admission trigger |
| --- | --- | --- |
| Multi-offer affordances | One `tow` world-offer proof | Second real world offer sharing a demonstrated additional constraint. |
| Event propagation | Explicit outcomes and diagnostic record entries | One semantic event required by multiple independent consumers. |
| Input canonicalization | Playable `InputFrame` path and physics-lab `VehicleIntent` path are distinct | Second shared input producer or a decision to unify replay/controller semantics. |
| Spatial audio | Local active-rig procedural voice | Second world audio source with lifecycle, accessibility, and budget proof. |
| Lighting/shadows | Blob shadows and bounded renderer baseline | Target-device visual/performance proof for one bounded directional tier. |
| World/content packs | Static typed authored schema | Second region/pack/editor/generated candidate requiring validated ingestion. |
| Streaming/residency | Single seeded world plus bounded deltas | Measured world/asset pressure and lifecycle/recovery proof. |
| Collision masks | Traversal and camera semantic queries | Third collision consumer such as triggers, hazards, projectiles, or AI sight. |
| AI/director | No runtime planner/director | Real multi-candidate proposal that benefits from validated selection. |
| Shared-world authority | Local commands/outcomes | Concrete shared-state conflict/ownership requirement. |
| ECS | Existing data-oriented boundaries | Measured actor/composition churn that current contracts cannot handle. |

## Consequences

### Positive

- Prevents duplicate sources of truth while preserving expansion paths.
- Keeps current browser delivery small, explainable, and recoverable.
- Makes performance, replay, migration, and future networking decisions auditable.
- Allows a new machine, region, activity, or presentation treatment to improve the same platform rather than branching it.

### Costs

- Some attractive systems remain explicitly staged until evidence exists.
- Each durable subsystem must carry validation, observability, versioning, and fallback work rather than landing as a narrow feature.
- Decisions require repository-local documentation and later update-log entries when the evidence changes.

## Alternatives considered

| Alternative | Rejected because |
| --- | --- |
| Build full platform infrastructure now | Creates architecture theatre and unvalidated abstractions. |
| Allow local feature-specific implementations | Produces divergence in capability, world, replay, and presentation semantics. |
| Treat all configuration as dynamic JSON | Removes compile-time safety without establishing an ingestion/validation pipeline. |
| Wait to think about architecture until multiplayer/large-world scope | Makes later migration more expensive and less reliable. |

## Validation and review plan

- Treat each linked gate as a decision-unit with its own source, test, browser/device, and operational evidence requirements.
- Do not claim active implementation from this ADR alone.
- Revisit before adding any subsystem named in the staged-gates table.
- Preserve this ADR and append dated update-log entries rather than rewriting historical decisions.

## Linked contracts

- `docs/research/ARCHITECTURE_REALITY_MATRIX_2026-07-26.md`
- `docs/research/CAPABILITY_AFFORDANCE_SECOND_PROOF_GATE_2026-07-26.md`
- `docs/research/WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE_2026-07-26.md`
- `docs/research/EVENT_PROPAGATION_AND_PRESENTATION_OBSERVER_GATE_2026-07-26.md`
- `docs/research/LIGHTING_AND_SHADOW_QUALITY_GATE_2026-07-26.md`
- `docs/research/AUDIO_PRESENTATION_AND_SPATIAL_BUDGET_CONTRACT_2026-07-26.md`
- `docs/research/OPERATOR_OBSERVABILITY_AND_DIAGNOSTICS_CONTRACT_2026-07-26.md`
- `docs/research/PROCEDURAL_DIRECTOR_AND_GENERATED_CONTENT_ADMISSION_GATE_2026-07-26.md`

## Update Log

### 2026-07-26 - Initial decision

Established the canonical-authority and admission-gate policy from current source and documented architecture boundaries. No framework subsystem was activated by this ADR.

### 2026-07-26 - Provenance and status correction

The initial **Accepted** label was unsupported. This is a load-bearing policy
derived by agents from Tier 1 architecture review and `motto_v4.md`; no explicit
operator sign-off for the exact decision text was recorded. The proposal and
linked analysis remain useful, but the effective status is **Proposed —
explicit operator sign-off required**. See
[the decision register](README.md) and the
[provenance audit](../reviews/DECISION_PROVENANCE_AND_RECOMMENDATION_STATUS_AUDIT_2026-07-26.md).

## Anything else?

Yes: the input-contract convergence finding is a concrete example of why this ADR exists. It needs a dedicated migration decision before a second shared input producer makes the split a replay/controller compatibility problem. The factual correction in its review is intentionally awaiting user direction rather than being silently changed.
