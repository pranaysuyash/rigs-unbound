# ADR-0023: Solver-neutral dynamics evidence program and provenance boundary

- Date: 2026-07-26
- Status: **Proposed — operator sign-off required**
- Decision owner / next reviewer: project owner
- Implementation owner: unassigned until sign-off
- Evidence tier: Tier 1 static architecture and provenance audit
- Related: ADR-0001, ADR-0006, ADR-0009, ADR-0012, ADR-0017
- Review:
  [Physics decision provenance and first-principles audit](../reviews/PHYSICS_DECISION_PROVENANCE_AND_FIRST_PRINCIPLES_AUDIT_2026-07-26.md)

## Context

Field 02 currently uses authored movement. Physics Lab 01 uses Rapier with a
raycast-wheel controller. Box3D Probe 01 uses Box3D with physical wheel bodies
and joints. All three are useful evidence.

ADR-0017 incorrectly transformed AI-generated background supplied for
evaluation into an accepted operator decision. It also allowed unlike-for-like
experiments to appear as a solver-selection program. The operator has corrected
that attribution and reopened the first-principles decision.

## Proposed decision

### 1. Do not select one global physics engine by default

Rigs Unbound may use authored motion and one or more bounded solver services.
A backend is admitted for a controller family only when a named playable
capability proves that it is useful.

The product-owned flow is:

```text
semantic intent
→ bounded rig/controller family
→ optional authored or solver-backed simulation
→ project-owned extracted state and semantic outcomes
→ world, capability, activity, persistence, replay, and presentation
```

### 2. Treat current labs as evidence fixtures

- Field 02 is the current canonical product runtime and authored baseline.
- Physics Lab 01 is an implemented Rapier raycast-wheel evidence fixture.
- Box3D Probe 01 is an implemented Box3D physical-wheel evidence fixture.
- Neither fixture is a permanent solver choice, product identity, mandatory
  roadmap lane, or fair categorical engine ranking.

The fixtures and their evidence remain preserved unless a later signed decision
changes their packaging or retention.

### 3. Admit backends through player-fantasy questions

Every new solver or controller experiment must start with:

- the rig fantasy or capability it enables;
- why the current authored/runtime path cannot express it cleanly;
- the controller family being tested;
- the semantic inputs and outcomes;
- the failure and recovery contract;
- the browser/device budget;
- the comparison method and evidence ceiling;
- the removal or rollback path.

“Which engine wins?” and “this package has more features” are not sufficient
experiment questions.

### 4. Make comparisons honest

A like-for-like engine comparison holds constant:

- rig profile and physical dimensions;
- controller technique;
- scene, terrain, colliders, and collision roles;
- semantic input tape and fixed timestep;
- extracted outcome and telemetry schema;
- recovery/capture procedure;
- browser, device, and build profile.

When technique changes as well as solver—such as Rapier raycast wheels versus
Box3D physical wheels—the result must be labelled as a
**solver-plus-controller-family bundle comparison**, not an engine verdict.

### 5. Keep ownership above solvers

No solver-native body, collider, joint, handle, contact manifold, or snapshot
format may become authoritative in:

- `Rig` identity or capability ownership;
- semantic actions;
- activities and scoring;
- world rules;
- durable saves or histories;
- replay/run-record contracts;
- camera, renderer, audio, or UI contracts.

Project-owned capture, semantic outcomes, observability, lifecycle, and failure
recovery remain mandatory.

### 6. Generalize only from real contrasting families

The current `DynamicsVehicle` seam requires wheel telemetry. It remains a
wheeled-lab contract.

A balance, buoyancy, flight, orbital, tracked, articulated, or other non-wheel
vertical must expose the next genuine common seam before a universal actor or
family-tagged telemetry contract is introduced. No speculative universal
registry is approved by this ADR.

### 7. Require explicit provenance and sign-off

Decision inputs must be labelled as:

- direct operator statement;
- explicit operator sign-off;
- operator-supplied AI or third-party proposal;
- agent inference/synthesis;
- static, test, or runtime evidence.

Only explicit operator sign-off moves a load-bearing ADR from Proposed to
Accepted. Supplying material for review is not acceptance.

## Evidence gates

A solver-backed family may graduate beyond an evidence fixture only after:

1. **Player-fantasy gate:** it materially enables a readable rig capability or
   consequence that the authored path cannot express cleanly.
2. **Rig-character gate:** distinct rigs remain predictable and do not collapse
   into reskinned chassis.
3. **Comparison-validity gate:** the experiment is like-for-like or explicitly
   declares its bundled differences.
4. **Browser-budget gate:** transfer size, first-controllable time, memory,
   physics/frame p50 and p95, and representative browser/device profiles pass.
5. **Reliability gate:** collision, CCD, constraints, recovery, capture,
   unload/reload, and declared repeatability behavior pass.
6. **Semantic-outcome gate:** gameplay consumes project-owned collision,
   attachment, damage, and traversal meanings.
7. **Operability gate:** versions, debug geometry, metrics, divergence evidence,
   failures, and unsupported values are visible and honest.
8. **Maintainability gate:** license, source inspectability, wrapper maturity,
   lifecycle burden, API churn, and clean removal are acceptable.
9. **World-scale gate:** streaming, coordinates, compounds, and persistent
   identities are tested only when a real playable world needs them.

## First candidate question

Proposed, not yet approved:

> Can an articulated towing/lifting/recovery activity with unstable cargo,
> semantic collision roles, breakage, capture/recovery, and readable feedback
> produce a meaningfully better vehicle fantasy than the authored baseline
> within browser budgets?

This question can support a fair comparison if the same controller technique
and scene are implemented across candidates. It should not automatically select
Rapier, Box3D, Jolt, or any other backend.

## Consequences after sign-off

- No immediate code refactor is required; the current separation is useful.
- New backend work remains paused until a named experiment is accepted.
- Public evidence-route treatment becomes a separate operator decision.
- A later non-wheel vertical may require a new family-scoped telemetry contract.
- A successful result may produce a hybrid architecture rather than a single
  solver winner.

## Options considered

### Ratify Rapier as the global foundation

Not proposed. The current lab does not close its own articulation,
representative-device, cross-runtime, or player-fantasy gates.

### Replace Rapier with Box3D

Not proposed. The current Box3D probe is alpha-wrapper evidence, changes wheel
technique, and lacks several product integration gates.

### Complete a Rapier/Box3D/Jolt three-way comparison now

Not proposed. A three-engine list is not a product question, and the existing
comparison harness is not like-for-like.

### Remove both labs immediately

Not proposed. The code and evidence are isolated, useful, and recoverable.
Removal should follow a signed packaging/retention decision, not a desire to
make the documentation visually consistent.

### Use only authored physics forever

Not proposed. Jointed machinery, unstable cargo, balance, buoyancy, destruction,
or future authority models may justify solver-backed families.

## Risks

- Multiple bounded services can increase dependency, testing, and lifecycle
  costs if family admission is weak.
- “Solver-neutral” can become abstraction theatre if contracts are generalized
  before contrasting implementations exist.
- Route-isolated labs can still create public-product confusion if deployment
  status is not explicit.
- A fair comparison costs more than two different demos but produces evidence
  that can actually support a decision.

## Rollback and migration

This ADR is Proposed and causes no runtime migration. If accepted, existing labs
are relabelled rather than rewritten. Any later route, dependency, or contract
change requires its own bounded plan, verification, and rollback.

## Revisit triggers

- a named capability cannot be expressed cleanly by the authored runtime;
- a non-wheel family exposes a real common dynamics seam;
- representative browser/device budgets invalidate a current backend;
- server/native/multiplayer authority changes the solver boundary;
- streaming or world-coordinate requirements become a real playable need;
- wrapper maintenance, licensing, or lifecycle risk changes materially.

## Operator sign-off

Pending. The operator must accept, revise, or reject:

1. the no-global-solver default;
2. the controller-family admission model;
3. the evidence gates;
4. the proposed articulated towing/lifting/recovery question;
5. the separate public-lab route decision.

## Update log

- 2026-07-26: Proposed after an internal-only wide-open brainstorm and static
  provenance audit. No external models were used. No solver, route, dependency,
  or code change is authorized by this proposal.

## Anything else?

Yes. The decision is intentionally about how evidence earns authority. Rapier,
Box3D, Jolt, and future engines are replaceable candidates. The persistent
product is the player’s rig, its capabilities, its history, and the consequences
it creates.
