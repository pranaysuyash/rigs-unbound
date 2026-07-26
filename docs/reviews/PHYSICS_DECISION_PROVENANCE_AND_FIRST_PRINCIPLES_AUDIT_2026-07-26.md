# Physics Decision Provenance and First-Principles Audit

- Date: 2026-07-26
- Status: completed Tier 1 contradiction/provenance audit; architecture decision
  reopened for operator sign-off
- Method: `wide-open-brainstorm`, using internal Codex subagents only; no
  external models
- Scope: Rapier, Box3D, Jolt, the authored Field 02 runtime, solver/controller
  boundaries, public evidence surfaces, and decision provenance
- Decision proposal:
  [ADR-0023](../decisions/ADR-0023-solver-neutral-dynamics-evidence-program.md)

## Mandate

The operator identified two failures:

1. physics recommendations had become contradictory and insufficiently grounded
   in first principles, long-term product shape, and `motto_v4.md`;
2. the agent attributed choices to the operator when the source was
   AI-generated material supplied for evaluation.

This audit does not infer a replacement solver choice from that correction.
It separates what the operator actually said, what AI material proposed, what
the repository implemented, and what the runtime proves.

## Source taxonomy

Future decision records must identify each source using this taxonomy:

| Source class                                 | Meaning                                                                                  | Can accept a load-bearing ADR?                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Direct operator statement                    | The operator personally states a principle, constraint, correction, or requested outcome | It can establish that stated direction, but not unstated implementation details |
| Explicit operator sign-off                   | The operator accepts a named ADR or its exact decision text                              | Yes                                                                             |
| Operator-supplied AI or third-party material | Material supplied for critique, research, or continuation                                | No; it is proposal/research input                                               |
| Agent inference or synthesis                 | A conclusion produced by an agent or subagent                                            | No; it remains proposed until accepted                                          |
| Static/runtime/test evidence                 | What code, tests, builds, or observed behavior demonstrate                               | It can validate facts, not create operator intent                               |

“Supplied by the operator” describes transport and provenance. It does not mean
“authored,” “endorsed,” “accepted,” or “decided by the operator.”

## Factual runtime baseline

Tier 1 inspection establishes:

- Field 02 currently uses the authored reduced-degree-of-freedom traversal model
  in `src/game/physics.ts`.
- Physics Lab 01 is a separately loaded Rapier raycast-wheel fixture.
- Box3D Probe 01 is a separately loaded Box3D physical-wheel fixture.
- `src/dynamics/contracts.ts` keeps solver handles out of project-owned capture,
  telemetry, and service contracts.
- Raycast-wheel and physical-wheel creation are separate service capabilities.
- The current shared `DynamicsVehicle` contract requires wheel telemetry. It is
  therefore a useful wheeled-lab seam, not yet a universal dynamics contract for
  bicycles, buoyancy, flight, orbital motion, or other non-wheel families.
- The README correctly says that no engine has been accepted and that Box3D is
  evidence rather than the product runtime or a final solver decision.

The implementation proves isolation and recoverability. It does not prove a
solver winner.

## Provenance defects

| Repository claim                                                         | Source reality                                                                                                            | Correction                                                                  |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ADR-0017 status is “accepted by operator direction”                      | The supplied physics map says “I would use” Rapier for a first implementation; it is recommendation language from ChatGPT | Solver-specific acceptance is withdrawn; the experiment remains implemented |
| The project owner “supplied a more specific physics decision”            | The operator supplied AI-generated background for the agent to evaluate                                                   | Record it as AI research input, not operator authorship                     |
| Keeping Rapier research-only was rejected by a “newer operator decision” | No direct operator sign-off for that rejection was found                                                                  | Reclassify it as an agent-selected experimental sequence                    |
| Box3D became a “mandatory” experiment from an “operator-supplied review” | The Box3D attachment is written in ChatGPT’s voice and says to compare candidates before commitment                       | Preserve the probe as evidence; withdraw mandatory/operator-decision status |
| PyBullet was “approved” and “used” to validate game/Rapier math          | No PyBullet implementation or evidence artifact was found outside that prose claim                                        | Reclassify it as a catalog candidate; validation is unproven                |
| Rapier.js is part of product simulation authority                        | Field 02 remains authored; Rapier is lab-only                                                                             | State the split explicitly                                                  |

## Contradiction matrix

### 1. Product truth versus ADR status

The README says no engine is accepted. ADR-0017 says Rapier was accepted by
operator direction. The README matches current code and evidence; the ADR status
does not.

### 2. Experiment design versus winner language

The Box3D plan correctly says that Rapier raycast wheels versus Box3D physical
wheels is not a winner-selection bakeoff. The same plan calls Box3D mandatory.
Because both solver and controller technique change, the current probes answer:

> Can the project-owned boundary host two different wheel-family experiments?

They do not answer:

> Which physics engine is better for Rigs Unbound?

### 3. Prior brainstorm versus shipped route treatment

The 2026-07-25 wide-open brainstorm said to pause Box3D adapter growth and keep
the Physics Lab code without growing it as a shipped surface. The build later
included both lab routes. Both directions originated in agent synthesis and were
not explicitly arbitrated by the operator.

The routes may remain as historical executable evidence. Their public/canonical
product status is reopened and must not be inferred from their presence in the
build.

### 4. Adoption gate versus implementation sequence

The earlier physics catalog required a real product capability such as
articulated towing, unstable cargo, or a lifting arm, plus browser budgets,
recovery, and replay evidence. The later sequence installed a chassis-and-wheel
lab before those gates were closed. That is valid as an experiment, but it
cannot inherit “accepted foundation” status from an incomplete gate.

### 5. Universal language versus a wheel-specific contract

The base dynamics service is solver-neutral, but `DynamicsVehicle.telemetry()`
currently returns mandatory wheel state. Promoting this as the universal rig
dynamics contract would repeat the original tractor anchoring at a different
layer. Keep it bounded until a non-wheel family exposes the next shared seam.

## First-principles invariants

The durable architecture is:

```text
semantic player intent
→ bounded rig/controller family
→ optional authored or solver-backed simulation service
→ project-owned extracted state and semantic outcomes
→ capability/activity/world interpretation
→ presentation, persistence, replay, and diagnostics
```

The invariants are:

1. A solver does not define rig identity or product identity.
2. No global physics-engine selection exists by default.
3. Controller-family requirements drive backend admission.
4. The same product may legitimately use authored controllers and multiple
   bounded solver services.
5. Solver-native handles never enter durable game state, saves, activities,
   cameras, or presentation contracts.
6. Experiments answer named player-fantasy questions, not library feature lists.
7. Comparisons hold controller technique, scene, semantic inputs, outputs,
   timestep, and hardware profile constant, or they explicitly state that a
   solver-plus-technique bundle is being compared.
8. Generalization follows a second concrete family that exposes a real seam.

## Wide-open panel synthesis

The panel used Champion, Strategist, Methodologist, Skeptic, Executioner,
Operator, Archivist, Future Self, Cartographer, Trickster, and
Customer-Whisperer perspectives.

### Champion

Retain the project-owned boundary and the executable labs. They are valuable
proof that the product can isolate semantic intent, lifecycle, capture, and
telemetry from solver implementations.

### Executioner

Kill false operator attribution, “accepted foundation” language, mandatory
backend expansion, and global-winner framing. Pause new solver work until a
named product question exists.

### Operator and Archivist

Preserve historical text, append dated corrections, make current status
prominent, and require explicit sign-off for the proposed replacement decision.
Do not remove dependencies or routes merely to make the documents look tidy.

### Trickster

The strongest result may be a hybrid with no single winner: authored motion for
some rig fantasies, a joint-heavy solver for articulation, and another bounded
service for a future server or world-scale need. “One engine” is an
implementation preference, not a product principle.

### Customer Whisperer

Players do not care which solver won. They care whether Torque feels heavy,
Spark feels agile, Drift behaves differently, collisions are readable, cargo
creates decisions, failures recover honestly, and their machine’s history
persists.

## Champion-versus-Executioner arbitration

The retained value is the **boundary and evidence**. The rejected claim is the
**authority and status** assigned to particular solvers.

- Retain: authored Field 02 baseline, semantic intent, family-scoped dynamics
  services, plain capture/telemetry, lab code, tests, and evidence artifacts.
- Relabel: Rapier and Box3D as implemented, bounded, historical evidence
  fixtures.
- Pause: new engines, solver ranking, public-lab governance growth, and any
  universalization of the wheeled telemetry contract.
- Kill: AI-to-operator attribution, “mandatory” backend language, global solver
  winner framing, and claims that unlike-for-like probes settled architecture.
- Reopen: whether direct public lab routes remain part of the production
  distribution.

## Six Hats

- **White — facts:** Field 02 is authored; Rapier and Box3D are separate labs;
  the comparison changes both solver and wheel technique; no final engine has
  been accepted.
- **Red — experience:** the decision trail feels untrustworthy because confident
  prose masks who actually decided what.
- **Black — risk:** false provenance can make agents continue expensive work
  under invented authority and turn experimental seams into product law.
- **Yellow — value:** the existing isolation is useful and makes correction
  cheap; experiments can be preserved without owning the roadmap.
- **Green — alternatives:** hybrid per-family solvers, authored motion, or a
  future like-for-like vertical are all valid.
- **Blue — process:** use the source taxonomy, explicit operator sign-off, named
  product questions, append-only updates, and evidence-tiered acceptance.

## Product-horizon optionality

These are architecture horizons, not delivery estimates.

- **Near horizon:** ground rigs, towing, articulation, collision semantics, and
  representative browser budgets. Keep the labs bounded and route-isolated.
- **Middle horizon:** balance, buoyancy, flight, and streaming will test whether
  wheel-mandatory telemetry should become a tagged family-specific union or a
  more general actor envelope.
- **Long horizon:** multiplayer authority, native/server simulation, modding, or
  very large worlds may require different client and server solvers. Semantic
  commands, outcomes, identities, and versioned plain captures must remain the
  durable boundary.

## Proceed / prototype / pause / kill

### Proceed

- Correct false provenance append-only.
- Keep Field 02 as the canonical product runtime.
- Keep the solver-neutral service and ownership boundaries.
- Retain the two labs as executable evidence.
- Present ADR-0023 for operator sign-off.

### Prototype after sign-off

Choose one player-fantasy question. The strongest current candidate is an
articulated towing/lifting/recovery activity with unstable cargo, semantic
collision roles, breakage, capture/recovery, readable feedback, and fixed input
tapes. If engines are compared, hold controller technique and scenario constant.

### Pause

- New physics backends, including Jolt merely to complete a three-engine list.
- Global engine-ranking claims.
- Public-lab governance and promotion.
- Generalizing wheel telemetry into the universal Rig contract.

### Kill

- “Operator decided” language derived from supplied AI output.
- “Mandatory solver experiment” without explicit operator sign-off.
- Treating a package feature matrix or falling-cubes benchmark as a Rigs
  Unbound architecture decision.

## Wider audit boundary

The pattern search found other records that need provenance review, including
ADR-0006, ADR-0012, and the currently developing ADR-0021. Their broad product
principles may be aligned, but exact implementation choices must not inherit
operator authorship from supplied ChatGPT text.

ADR-0021 is parallel work and was not edited in this pass. Its Accepted,
load-bearing status should be checked against an explicit sign-off trail before
it becomes authority.

The library evaluation’s PyBullet/Rapier authority claims are directly
corrected by a dated addendum because static search found no supporting
implementation evidence.

## Derived correction plan

1. Add a prominent dated provenance/status correction to ADR-0017 while
   preserving its historical text.
2. Add dated corrections to the Rapier and Box3D plans.
3. Create ADR-0023 as Proposed and operator-gated.
4. Correct the README phrase “canonical lab routes” to “public evidence lab
   routes.”
5. Record this correction in the exploration map and progress history.
6. Do not refactor code, remove dependencies, or change deployment routes until
   ADR-0023 and the public-evidence question receive operator sign-off.

## Decision gates requiring the operator

1. Accept, revise, or reject ADR-0023’s solver-neutral ownership model.
2. Choose whether the next physics question is articulated
   towing/lifting/recovery or another concrete rig fantasy.
3. Decide whether evidence labs should remain directly reachable in production,
   become development-only, or move to a separate evidence deployment.
4. Approve any dependency, route, or contract refactor derived from those
   decisions.

The present operator correction authorizes correcting false attribution and
reopening the decision. It does not select Rapier, Box3D, Jolt, or another
solver.

## Evidence and review passes

- Evidence tier: Tier 1 static repository, attachment, and decision-trail
  inspection.
- Pass 1 — immediate correctness: traced the two source attachments into the
  ADR and plan claims; corrected source classification.
- Pass 2 — architecture: separated durable ownership boundaries from
  wheel-family experiments; tested the proposal against non-wheel and future
  authority cases.
- Pass 3 — supervision readiness: preserved history, kept the new ADR Proposed,
  named operator gates, and avoided code/dependency/route mutation.

## Anything else?

Yes. The deeper defect is not Rapier or Box3D. It is a decision pipeline that
allowed polished AI prose to skip provenance, evidence, arbitration, and
operator sign-off. The source taxonomy and proposed ADR make that failure
visible and prevent future agents from turning “please evaluate this” into “the
operator decided this.”
