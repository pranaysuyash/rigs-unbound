# ADR-0017: Rapier is the first replaceable browser dynamics foundation

- Date: 2026-07-25
- Status: accepted by operator direction
- Current status (2026-07-26): **implemented evidence fixture; solver-specific
  acceptance withdrawn as unsupported; replacement policy is Proposed in
  ADR-0023 and requires operator sign-off**
- Decision owner / next reviewer: project owner
- Implementation owner: current project agent
- Related: ADR-0001, ADR-0006, ADR-0007, ADR-0009, ADR-0011, ADR-0012

## Provenance correction — 2026-07-26

The historical status and attribution above are preserved so the original
record remains auditable, but they are not current authority.

The physics exploration map and later Box3D review were AI-generated background
supplied by the operator for evaluation. Their recommendation language was
incorrectly transformed into “operator direction,” a “newer operator decision,”
and an accepted solver choice. Supplying an AI proposal is not authorship,
endorsement, or sign-off.

The operator has explicitly corrected that attribution and asked for the
decision to be re-derived from first principles using the internal-only
`wide-open-brainstorm` process. Therefore:

- Rapier remains an implemented raycast-wheel evidence fixture;
- Box3D remains an implemented physical-wheel evidence fixture;
- Field 02 remains the authored canonical product runtime;
- no Rapier, Box3D, Jolt, hybrid, or authored-only solver policy is accepted;
- the durable solver-neutral ownership model and future evidence gates are
  Proposed in
  [ADR-0023](ADR-0023-solver-neutral-dynamics-evidence-program.md);
- no code, dependency, route, or packaging consequence follows until the
  operator signs off on that proposal.

## Context

The reference runtime proved a deterministic authored ground controller, a
bounded hover adapter, terrain traversal, persistence, replay evidence, camera
policies, and a shared perception chain. It also recorded Rapier as a
research-only candidate that should remain outside the canonical runtime until
an experiment justified adoption.

The project owner has now supplied a more specific physics decision:

> TypeScript + Vite + Three.js + Rapier 3D, with the simulation isolated behind
> our own physics interface.

The same direction defines five ownership layers:

1. semantic player intent;
2. rig-specific controller;
3. physical simulation;
4. presentation extraction;
5. gameplay interpretation.

It also identifies a dynamic chassis followed by a raycast vehicle as the first
two experiments, a systems laboratory as the first proof surface, and Jolt as a
serious comparison track rather than the initial dependency.

This is a decision change, not an invitation to make Rapier the author of every
rig's feel. The authored controller remains valuable evidence and can continue
to own vehicles whose fantasy is better expressed through a bounded
approximation.

## Decision

### 1. Adopt Rapier as the first project-owned dynamics implementation

The root application depends on the official `@dimforge/rapier3d` package.
Rapier is consumed only through project-owned contracts. No gameplay,
presentation, persistence, activity, or input module imports Rapier types.

The first implementation exposes:

- fixed-step world ownership;
- dynamic rigid bodies and primitive colliders;
- a four-wheel raycast vehicle;
- semantic vehicle intent;
- extracted chassis and wheel state;
- contact, suspension, slip/impulse, speed, body-count, collider-count, and
  physics-time telemetry;
- project-owned snapshots;
- debug-line geometry;
- explicit disposal.

### 2. Keep vehicle character above the solver

Rapier owns rigid-body integration, contacts, suspension impulses, and
colliders. A vehicle-controller layer still owns:

- engine-force and brake curves;
- steering policy;
- assist policy;
- per-surface grip selection;
- rig configuration;
- translation from semantic intent into solver commands.

World and activity code consume semantic outcomes rather than Rapier contact
manifolds or handles.

### 3. Land the foundation as an executable physics laboratory

The first proof is a dedicated browser laboratory in the same Vite build. It is
not a second product runtime or a replacement world:

- Field 02 remains the authored traversal baseline;
- Physics Lab 01 is the solver-backed comparison and tuning surface;
- both share the same repository, build, browser delivery, camera vocabulary,
  and semantic control direction;
- the lab is separately loaded so Rapier's WebAssembly and lab assets do not
  inflate Field 02's first-controllable path.

The laboratory must expose multiple views, debug geometry, telemetry, reset,
pause, surface grip variation, and deterministic scripted input hooks.

### 4. Treat the physics map as a controller-family map

No universal “vehicle controller” is introduced. The long-term registry may
contain kinematic, dynamic rigid-body, raycast-wheel, physical-wheel,
hover-probe, buoyancy, aerodynamic, orbital, balance, tracked, rail, and
articulated controller families. Only implemented families enter code.

### 5. Keep Jolt as an evidence-gated comparison

Jolt remains the comparison candidate for tracked vehicles, motorcycles, soft
bodies, broader constraints, buoyancy, and large-world requirements. It does
not enter the dependency graph until a like-for-like benchmark has an explicit
question and acceptance gate.

## Options considered

### Keep Rapier research-only

Rejected by the newer operator decision. It would preserve a clean custom
kernel but leave joints, physical cargo, collision robustness, CCD, and
articulated machinery as prose rather than executable evidence.

### Replace every current mobility adapter immediately

Rejected. That would erase a proven authored baseline, couple the product to one
solver, and falsely assume raycast wheels are correct for hovercraft,
spacecraft, bicycles, boats, and rail vehicles.

### Put Rapier directly inside `state.ts` or the Three.js renderer

Rejected. Either path would make replay/gameplay or presentation depend on
engine handles and would violate the five-layer ownership model.

### Build a falling-cubes benchmark only

Rejected. Throughput without player intent, vehicle response, presentation
extraction, and telemetry does not answer a Rigs Unbound question.

## Trade-offs and risks

- A second executable surface increases test and documentation obligations.
  It is intentionally a laboratory with a distinct acceptance script.
- Rapier is pre-1.0. The project pins the dependency and owns the adapter so
  package changes do not leak through the product.
- WebAssembly adds download and initialization cost. A separate entry keeps it
  out of the Field 02 initial chunk; measurements must report it honestly.
- Raycast wheels are stable but approximate side-wheel impacts and deep
  geometry. Physical-wheel or hybrid controllers remain valid later families.
- Solver determinism does not make surrounding JavaScript automatically
  cross-platform deterministic. Snapshot and same-runtime replay evidence is
  required before stronger claims.

## Validation plan

- Tier 2:
  - semantic intent clamps invalid and out-of-range input;
  - identical scripted inputs produce identical extracted state in one runtime;
  - snapshot/restore returns to the captured body state;
  - reset and disposal are explicit;
  - the root authored-controller test suite remains green.
- Tier 3:
  - production build emits Field 02 and Physics Lab 01 as separate entries;
  - browser acceptance drives, steers, brakes, changes surface, switches every
    camera, toggles debug lines, resets, and observes clean console output;
  - the existing Field 02 browser workflow still passes.
- Tier 4:
  - visible desktop and narrow review confirms readable chassis direction,
    wheel steering/suspension, telemetry, camera composition, and controls.

## Rollback and migration

The lab is additive and has no save-schema authority. Removing the dependency
and lab entry leaves the current authored runtime intact. The project-owned
intent and dynamics contracts may remain if another solver replaces Rapier.

## Revisit triggers

- a like-for-like Jolt benchmark materially improves the required controller
  family, stability, performance, or memory ownership;
- the raycast vehicle cannot express the desired tractor/buggy evidence without
  solver-specific workarounds;
- mobile initialization or frame budgets fail the declared profile;
- physics authority moves to a worker or network host;
- a six-degree, balance, buoyancy, rail, or articulated controller requires the
  body and telemetry contracts to grow.

## Anything else?

Yes. The laboratory must not become the game's identity. It is a reusable
instrument for proving vehicle fantasies, controller families, and physical
capabilities. A successful solver integration makes unusual rigs easier to
build; it does not make every rig behave like the laboratory buggy.

## Update log

- 2026-07-26: Corrected decision provenance after operator feedback. The
  supplied physics map and Box3D review were AI-generated evaluation inputs, not
  explicit operator decisions. The solver-specific acceptance and mandatory
  experiment language are withdrawn as current authority. Existing
  implementations and evidence remain preserved. ADR-0023 now carries the
  replacement policy as Proposed, pending operator sign-off. See
  `docs/reviews/PHYSICS_DECISION_PROVENANCE_AND_FIRST_PRINCIPLES_AUDIT_2026-07-26.md`.
- 2026-07-25: Accepted from the project owner's supplied physics exploration
  map. This supersedes the research-only adoption gate in the earlier browser
  physics catalog while preserving its requirement for project-owned ports,
  fixed stepping, observability, snapshot evidence, and clean replacement.
- 2026-07-25: Box3D's public alpha, physical 3D wheel joints, browser build,
  recording/replay tooling, and large-world feature direction materially
  changed the comparison evidence. Box3D is promoted from a passive feasibility
  watch to a mandatory bounded browser experiment alongside Rapier and Jolt.
  This does not suspend the project-owned architecture while the comparison
  runs. Instead, the dynamics port is refined so the base service owns only
  shared world responsibilities, while raycast-wheel and physical-wheel
  creation are explicit service capabilities. A candidate may implement one or
  both without pretending that every rig uses the same wheel algorithm.
- 2026-07-25: The operator-supplied statement that no ready-made npm package
  exists is now stale. The third-party `box3d-wasm` package appeared on
  2026-07-02 and provides single-thread and threaded browser builds plus a
  Three.js vehicle example. It is young, unofficial, lacks TypeScript
  declarations, and does not currently prove that Box3D's recording API is
  bound. The first experiment therefore pins one reviewed version, uses the
  single-thread build, owns a narrow adapter, reports these limitations, and
  gives the package no save, replay, or product-runtime authority.
- 2026-07-25: Box3D comparison acceptance is defined in
  `docs/plans/BOX3D_BROWSER_COMPARISON_01_2026-07-25.md`. The first coherent
  implementation is a physical-wheel browser probe using the same semantic
  intent, camera vocabulary, telemetry envelope, fixed-step discipline, and
  recovery expectations as Physics Lab 01. Later falling-tree, articulated,
  compound-streaming, and replay scenes remain evidence gates rather than
  claims about the initial probe.
