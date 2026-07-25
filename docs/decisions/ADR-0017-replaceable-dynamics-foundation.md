# ADR-0017: Rapier is the first replaceable browser dynamics foundation

- Date: 2026-07-25
- Status: accepted by operator direction
- Decision owner / next reviewer: project owner
- Implementation owner: current project agent
- Related: ADR-0001, ADR-0006, ADR-0007, ADR-0009, ADR-0011, ADR-0012

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

- 2026-07-25: Accepted from the project owner's supplied physics exploration
  map. This supersedes the research-only adoption gate in the earlier browser
  physics catalog while preserving its requirement for project-owned ports,
  fixed stepping, observability, snapshot evidence, and clean replacement.
