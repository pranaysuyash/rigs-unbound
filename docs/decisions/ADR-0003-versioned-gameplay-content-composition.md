# ADR-0003: Versioned gameplay-content composition

- Status: Proposed
- Date: 2026-07-25
- Owner: Architecture/domain
- Next reviewer: Project owner after schema fixtures and round-trip tests

## Context

Many vehicles, worlds, activities, and eventual creator tools must coexist without making renderer scenes, save data, owned progression, and authored definitions compete as sources of truth.

The additional workbook proposes immutable vehicle blueprints, mutable owned vehicle instances, versioned world recipes, mode packs, mission contracts, and a run director. The direction is strong, but authored configuration and ephemeral runtime state must be separated more precisely.

## Decision

Propose the following canonical model family.

### `VehicleBlueprint`

Immutable, versioned definition:

- stable blueprint ID and version;
- chassis envelope and collision/attachment metadata;
- locomotion/power/tool/cargo/sensor/survivability slots;
- default capabilities and compatibility constraints;
- semantic asset-manifest keys;
- tuning/config version;
- content license/provenance references.

Publishing a change creates a new version. It does not mutate existing owned history.

### `VehicleInstance`

Mutable owned state:

- stable instance ID;
- referenced blueprint ID/version;
- owned component-instance references;
- installed loadout and presets;
- condition, damage, repairs, visible scars;
- mastery/history/notable outcomes;
- name and permitted cosmetics;
- provenance and ownership ledger references where relevant.

It contains no renderer nodes, physics bodies, React state, or unversioned asset filenames.

### `WorldRecipe`

Immutable, versioned generation intent:

- recipe ID/version;
- topology, biome, route, landmark, encounter, resource, and budget policies;
- supported quality/camera/scale profiles;
- generator and content dependencies;
- deterministic seed-stream contract;
- validator suite and authored fallback.

### `WorldManifest`

Compiled output:

- recipe, generator, content, and seed versions;
- generated chunks/routes/landmarks/activities;
- traversal/capability and performance allocations;
- validation report;
- deterministic content hash where supported;
- sparse runtime-mutation anchor IDs.

It is output from the world compiler, not hand-edited runtime truth.

### `ModePack`

Reusable rules/presentation contract:

- allowed and required capabilities;
- semantic action and camera profile;
- simulation systems and order;
- HUD/audio/accessibility modules;
- failure/escape/restart semantics;
- asset/runtime/network budgets;
- deterministic fixtures.

### `MissionContract`

Authored objective/outcome contract:

- entry and exit;
- vehicle/world requirements and loaner/fallback policy;
- trigger, state, decision, action, exception, terminal state;
- objectives/modifiers/scoring;
- reward proposal and authority boundary;
- damage/persistence outcome;
- content rating/safety metadata.

### `RunSpec`

Shareable stable input:

`vehicle instance/loadout ref + world recipe/manifest ref + mode-pack ref + mission-contract ref + seed/version envelope`

It contains no mutable run director.

### `RunDirector`

Ephemeral runtime orchestration:

- active phase/state transitions;
- encounter pacing and spawn decisions;
- validated runtime mutations;
- failure/recovery handling;
- event emission and operator/debug state.

It is created from the `RunSpec`, is not a content asset, and is not trusted as a durable reward authority.

### `RunRecord`

Reproducible result:

- `RunSpec` reference;
- build/browser/quality signature;
- semantic input and significant event stream;
- periodic snapshots/checkpoints as required;
- terminal outcome, proposed rewards, committed durable transaction IDs;
- desync/validation/fallback/error markers.

## Composition flow

```text
VehicleBlueprint ──> VehicleInstance/loadout
WorldRecipe + seed + versions + vehicle envelope + contract
                  └─> WorldCompiler ─> validated WorldManifest

VehicleInstance ref
+ WorldManifest/Recipe ref
+ ModePack ref
+ MissionContract ref
+ version envelope
                  └─> RunSpec ─> RunDirector ─> RunRecord
```

## Semantic capability policy

Capabilities such as `can_plow`, `can_tow`, `can_fly`, or `can_power_structures` are derived from valid chassis/component composition. They are not free-floating booleans the client can grant itself.

World and mission systems query:

- explicit capabilities;
- quantified envelopes such as mass, size, clearance, traction, power, cargo, heat, and environment;
- incompatibilities and tradeoffs;
- loaner/fallback policy.

## Consequences

### Benefits

- Owned history survives blueprint evolution.
- Shares and replays pin exact versions.
- Renderer/engine probes use the same content truth.
- Procedural validation can consider the actual vehicle envelope.
- Focused editors can produce bounded canonical objects.
- Save migrations operate on explicit versions rather than filenames or scene nodes.

### Costs and risks

- More identifiers and migrations.
- Version graphs can become difficult to inspect.
- Capability derivation can become an opaque rules engine.
- Excessive genericity could precede real gameplay needs.
- Blueprint fixes may require a compatibility or migration policy for old instances.

## Guardrails

- Build only fields exercised by a real probe or invariant.
- Use stable semantic IDs; filenames are never durable APIs.
- Every schema has validation, version, migration/rejection behavior, and human-readable diagnostics.
- Derived capabilities are explainable back to components and constraints.
- Runtime/renderer/physics objects never enter canonical data.
- Reward proposals do not become durable state without the appropriate local/server authority.
- Creator edits produce new versions and retain ancestry/provenance.

## Validation plan

Tier 2 requirements:

- round-trip fixtures for tractor, kart/bicycle, drone/hover, and one hybrid;
- invalid slot, cyclic dependency, missing version, incompatible environment, oversized route, and corrupted-instance tests;
- same `RunSpec` resolves all dependencies or fails with a specific diagnostic;
- renderer-object serialization rejection;
- version-migration fixtures;
- capability-explanation snapshot.

Tier 3 requirements:

- one vehicle instance survives farm → defense → time-trial contracts;
- the same world/run/share objects load through at least two engine probes;
- save/replay recovery after an interrupted write.

## Rollback or migration

Because status is Proposed and no runtime exists, the model can still be replaced without player migration. Once a public build emits these IDs, schema changes require versioned migration/compatibility and a deprecation record.

## Revisit triggers

- The first slice needs fewer or differently owned models.
- A schema cannot explain why a vehicle qualifies for an activity.
- Version pinning makes share links fragile or excessively large.
- A second engine cannot consume the same manifests.
- Creator use demonstrates a missing ancestry/dependency boundary.

## Update Log

- 2026-07-25: Proposed from the additional ChatGPT workbook/text research; no schema implemented.

## Anything else?

The content model should make impossible states hard to represent without turning every creative combination into bureaucracy. The first fixtures must test both freedom and rejection quality.

## Addendum — 2026-07-25 restoration, tuning, modules and deployed state

The vehicle-growth proposal clarifies four distinct state classes:

- restoration/condition belongs to meaningful component state on the owned `VehicleInstance`;
- chassis tuning belongs to validated component composition or a versioned tuning configuration;
- installed physical modules are owned component-instance references occupying compatible blueprint hardpoints;
- deployed state is runtime/persisted module state and does not imply that a different module was installed.

Loadout presets reference owned compatible component instances. They do not clone parts, bypass mass/power/clearance limits, or grant derived capabilities directly.

Decision effect: **status remains Proposed**. No schema field is accepted until the first tractor round-trip fixture exercises it.

See [Tractor Restoration and Modular Growth](../exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md).

### Anything else?

Separating installed identity from deployed state keeps “raise the plow” cheap and immediate without making “replace the plow with a sensor mast” an unexplained mid-field inventory action.
