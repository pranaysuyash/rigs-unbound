# Browser vehicle-physics technique catalog

- Date: 2026-07-25
- Status: researched; package probe not yet installed
- Decision relationship: ADR-0001, ADR-0007, ADR-0009, ADR-0012
- Runtime baseline: custom deterministic fixed-step TypeScript controllers +
  Three.js presentation

## Executive decision

Rigs Unbound should retain authored, bounded mobility adapters as the source of
vehicle identity and evaluate **Rapier as a bounded dynamics service**, first
for joints, articulated tools, dynamic cargo/debris, sensors, scene queries,
and continuous collision detection.

This is a hybrid architecture:

```text
semantic input
→ authored mobility adapter
→ world/capability rules
→ optional rigid-body and joint service
→ authoritative outcome
→ shared perception frame
→ renderer/audio/UI
```

A general solver supplies physical primitives. It does not decide how a
tractor, bicycle, excavator, submarine, or orbital tug should feel.

## Current local evidence

The reference runtime already owns:

- fixed-step deterministic orchestration;
- ground and hover mobility adapters;
- per-wheel height sampling, suspension compression, contact, and slip;
- terrain grip, rolling drag, water depth, grade, and deformation;
- bounded collision and recovery;
- cargo towing and a capability-composed activity;
- body pitch/roll, airborne state, hover pressure, strain, and damage;
- procedural wheel/suspension animation, particles, lights, audio, camera, HUD,
  save migration, and browser observability.

This means an engine probe must beat a real baseline. “It has rigid bodies” is
not sufficient evidence.

## Technique lattice

| Domain        | Cheapest useful approximation             | Higher-fidelity technique                    | Gameplay evidence required                |
| ------------- | ----------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| Rigid motion  | authored planar/vertical integration      | dynamic 6-DOF rigid bodies                   | mass and impacts change decisions         |
| Wheel contact | terrain samples at wheel points           | raycast wheels or contact patches            | surface, load, and slip are learnable     |
| Suspension    | spring-damper per contact                 | constraint/joint suspension                  | compression and rebound affect control    |
| Tyres         | friction envelope + slip proxy            | longitudinal/lateral slip curves             | drifting, bogging, braking, towing        |
| Tracks        | differential steering + footprint samples | linked/contact-driven track model            | pivoting and terrain pressure matter      |
| Lean/balance  | target lean + fall envelope               | constrained multibody rider/rig              | cadence, balance, recovery skill          |
| Hover         | support height + cushion authority        | pressure/contact field                       | terrain/water clearance changes control   |
| Buoyancy      | sampled waterline forces                  | distributed buoyancy points + waves          | ballast, currents, capsize risk           |
| Aerodynamics  | lift/drag curves                          | per-surface forces + stall/turbulence        | energy management and landing skill       |
| Orbital/space | inertial 6-DOF integration                | n-body/patched-conic layers                  | orientation and velocity separate cleanly |
| Articulation  | authored transforms                       | revolute/prismatic/spherical joints + motors | leverage, clearance, ground stability     |
| Towing        | spring hitch + speed/load limit           | jointed trailer/rope chain                   | reversing, sway, cargo balance            |
| Terrain       | height field + surface channels           | deformable height/voxel/material field       | route authorship persists                 |
| Damage        | scalar condition + event thresholds       | component graph + detachable bodies          | failure changes control and recovery      |
| Destruction   | authored state swap                       | fracture graph / constrained pieces          | debris and openings alter solutions       |
| Fields        | sampled force function                    | spatial field volumes                        | gravity, magnetism, wind are readable     |
| Time          | fixed-step replay                         | snapshots + rollback/resimulation            | ghosts, rewind, verification              |

## Solver/package candidates

### Custom deterministic adapters — keep

Best for:

- distinctive control signatures;
- cheap ground/hover/flight approximations;
- deterministic tests and compact saves;
- explicit assistance and accessibility;
- terrain/capability rules that remain legible.

Risks:

- every new physical family needs authored mathematics;
- complex contacts, joint chains, and piles become expensive to maintain;
- collision robustness must be proven rather than assumed.

### Rapier JavaScript/WASM — leading bounded service probe

Official Rapier documentation lists rigid-body forces/collisions, joints,
contact events, sensors, snapshotting, JavaScript bindings, and optional
cross-platform determinism. Its JavaScript documentation also covers query
pipelines, sleeping islands, CCD, and solver integration parameters.

Relevant fit:

- impulse joints for trailers, ropes, hoses, and breakable attachments;
- multibody joints for excavator/crane mechanisms;
- motors for hydraulic-like target position/velocity;
- sensors and scene queries for tools, hazards, and camera/interaction
  visibility;
- nonlinear CCD for fast cargo, projectiles, and small toy vehicles;
- snapshots for experiments and verification.

Important constraint: Rapier determinism still requires identical initial
values and insertion order; JavaScript transcendental functions can break
cross-platform equality even when the solver itself is deterministic.

Primary sources:

- [Rapier overview](https://rapier.rs/docs/)
- [Rapier determinism](https://rapier.rs/docs/user_guides/javascript/determinism/)
- [Rapier joints and motors](https://rapier.rs/docs/user_guides/javascript/joints/)
- [Rapier simulation structures](https://rapier.rs/docs/user_guides/javascript/simulation_structures/)
- [Rapier snapshots](https://rapier.rs/docs/user_guides/javascript/serialization/)
- [Rapier continuous collision detection](https://rapier.rs/docs/user_guides/javascript/rigid_body_ccd/)

### Three.js physics addons — useful probes, not the product boundary

Three.js documents wrapper addons for Ammo, Jolt, and Rapier, and explains the
parallel physics-world/render-world synchronization model. These wrappers are
valuable for isolated comparisons. Rigs Unbound still needs its own physics
port, lifecycle, serialization, determinism, capability, and observability
contracts.

Primary sources:

- [Three.js physics integration](https://threejs.org/manual/en/physics.html)
- [Three.js Jolt addon](https://threejs.org/docs/pages/JoltPhysics.html)

### Jolt Physics WASM — comparison candidate

Jolt is an actively maintained rigid-body/collision engine with a browser port
and a Three.js addon. It is a useful performance/stability comparison for
dynamic rigid-body scenes. The current Three.js addon presents a deliberately
small mesh/body interface, so a serious evaluation would use the underlying
port rather than treat the addon as a full gameplay architecture.

### Cannon-es — pure TypeScript comparison

Cannon-es is small, understandable, and integrates without a WASM boundary. It
provides bodies, constraints, springs, contact materials, and raycast vehicle
support. The Three.js manual currently describes it as apparently no longer
maintained, making it weaker as a long-term canonical dependency despite its
excellent inspectability.

Primary source:

- [cannon-es repository](https://github.com/pmndrs/cannon-es)

### Ammo.js / Bullet — legacy breadth comparison

Ammo/Bullet provides a broad feature surface and many Three.js examples,
including ropes, cloth, terrain, breaking, and instancing. Its wrapper and
memory-management ergonomics are heavier, and current Three.js guidance
describes Ammo.js as no longer maintained. It remains a comparison point, not a
leading integration choice.

### Babylon Havok — engine-bakeoff reference

Babylon exposes Havok for the web through its physics integration, including
rigid-body simulation and character-controller support. It matters in the
engine bakeoff, but adopting it inside the current Three.js reference runtime
would create a renderer/physics integration boundary unlike the chosen
project-owned ports.

Primary sources:

- [Babylon.js specifications](https://www.babylonjs.com/specifications/)
- [Havok for the web package](https://www.npmjs.com/package/@babylonjs/havok)

## Browser execution trade-offs

### Main thread

Advantages:

- simplest deterministic order;
- no transform-copy protocol;
- easiest debugging.

Costs:

- solver spikes compete with rendering, input, and DOM;
- large joint/contact scenes can cause visible frame pacing failures.

### Worker with message passing

Advantages:

- isolates physics cost;
- works without shared memory.

Costs:

- serialization/copy latency;
- more difficult fixed-step ownership;
- render interpolation and event ordering become explicit contracts.

### Worker with shared memory

Advantages:

- low-copy transform exchange;
- suitable for larger body counts.

Costs:

- `SharedArrayBuffer` requires cross-origin isolation headers and compatible
  hosting/resource policy;
- worker failures, lifecycle, and stale-frame recovery need observability.

[MDN documents the COOP/COEP requirements for cross-origin isolation and shared
memory](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/crossOriginIsolated).

### WASM boundary

Advantages:

- mature native solvers and predictable hot-loop performance.

Costs:

- initialization/download cost;
- JS/WASM marshaling;
- snapshots and object handles require explicit ownership;
- threading may increase hosting and compatibility constraints.

## First Rapier experiment contract

The experiment should remain outside the canonical runtime until it passes:

1. Same fixed timestep and deterministic seed.
2. A trailer with a revolute/limited joint.
3. A motorized two-link excavator arm.
4. Dynamic cargo with CCD.
5. Contact/sensor events translated into project-owned outcomes.
6. Snapshot/restore equality within the chosen determinism boundary.
7. Desktop and constrained-mobile measurements:
   - compressed dependency cost;
   - initialization time;
   - average and p95 frame time;
   - active/sleeping bodies;
   - contacts and joints;
   - snapshot bytes/time;
   - worker versus main-thread cost.
8. Clean removal: the reference runtime still builds and plays without the
   experiment dependency.

## Adoption gate

Adopt Rapier behind a `DynamicsService` port only if the experiment proves:

- articulated or dynamic behavior that the custom kernel cannot express cleanly;
- measurable performance within declared profiles;
- deterministic/replay behavior compatible with project contracts;
- bounded serialization and failure recovery;
- no loss of authored rig identity or semantic action ownership.

## Anything else?

Yes. The next physics question should be attached to a player fantasy. A solver
benchmark with falling cubes proves throughput; an excavator lifting unstable
cargo proves whether the system serves Rigs Unbound.
