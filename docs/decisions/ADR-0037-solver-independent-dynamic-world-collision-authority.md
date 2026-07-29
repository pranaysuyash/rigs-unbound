# ADR-0037: Solver-independent dynamic world collision authority

- Date: 2026-07-28
- Status: implemented and verified for the current runtime; broader solver policy remains Proposed
- Decision owner / next reviewer: project owner
- Implementation owner: current project agent
- Evidence tier at creation: Tier 2 baseline (`npm run typecheck`; 432/432 Vitest tests)
- Related: ADR-0007, ADR-0009, ADR-0017, ADR-0023, ADR-0034
- Research:
  [Dynamic World Collision Exploration](../research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md)

## Operator direction

The operator requested:

> "find a skill related to game dev or figure out object collison , explore the topic, update exploration map and fix the collision system in the game, should identify and be dynamic so the world feels real rather than just meshes where cars may pass through each other/terrain/anything, test and document, also work as per our long term 1st principles and motto_v4"

This is direct authorization to correct collision behavior in the current
runtime. It is not sign-off on Rapier, Box3D, or any other global solver
selection.

## Context

The current fixed-step runtime already has three project-owned physical
boundaries:

1. terrain contact and swept terrain-face refusal in `physics.ts` /
   `terrain-traversal.ts`;
2. procedural tree/rock overlap resolution in `collision.ts`;
3. authored structure overlap resolution in `scene-query.ts`.

Those boundaries prevent several mesh-only failures, but they remain incomplete:

- the active rig does not collide with parked rigs;
- the relay cargo is not a collision body;
- obstacle and structure checks are overlap-only, so a sufficiently large
  movement step can tunnel through a thin body;
- collision roles and fallback behavior remain implicit;
- the public/operator state does not identify the last contact pair.

The renderer is not the right place to repair this. Three.js meshes are
presentation, can use LOD or proxy geometry, and can be absent or replaced
without changing gameplay. Physical identity must remain in simulation-owned
records.

## Decision

### 1. Extend the current canonical collision authority

`src/game/collision.ts` remains the canonical semantic collision module. It
will own:

- collision-role identity;
- pair-response policy;
- continuous/swept circle queries for the current reduced-order bodies;
- mass-weighted dynamic body separation and velocity response;
- typed contact records.

No second collision runtime or mesh-derived collision registry is introduced.

### 2. Use semantic roles, not engine handles

The current vocabulary is:

- `terrain`
- `rig`
- `cargo`
- `obstacle`
- `structure`
- `trigger`
- `sensor`
- `decorative`

Blocking, overlap-only, and ignored pairs are explicit. Unknown roles fail
closed and increment observable policy telemetry. Future Rapier, Box3D, Jolt,
or other adapters must translate native contacts into these project-owned
roles and contact records.

### 3. Keep simple colliders separate from visual meshes

Current rigs and movable cargo use circular ground footprints. Procedural
obstacles use their authored radii. Structure parts continue to use authored
box/cylinder/cone proxy records from `WORLD_STRUCTURE_PARTS`.

This follows the selected `3d-games` skill's rule: simple collision shapes,
complex visuals. Imported GLBs and Three.js nodes do not become colliders merely
because they render.

Compound/convex footprints are admitted only when a real long or articulated
rig proves that a circle is materially wrong. That change must preserve the
same semantic roles and contact outcomes.

### 4. Prevent tunnelling in the shipped fixed-step path

Obstacle, structure, rig, and cargo checks use the movement segment from the
previous to proposed position. A contact at any point on that segment counts,
even when the final positions do not overlap.

Terrain continues to use the existing shared swept traversal boundary rather
than being duplicated in collision code.

### 5. Make movable bodies respond as bodies

Rig-to-rig and rig-to-cargo contacts:

- separate both movable bodies according to inverse mass;
- apply a bounded low-restitution impulse along the contact normal;
- preserve tangential motion where the reduced-order state can represent it;
- never silently teleport the active rig through the other body.

The response remains intentionally reduced-order: current `RigState` has planar
speed and heading rather than an authoritative 3D velocity vector. Full 6-DOF
rollover, stacking, joints, and deformable bodies remain solver-admission
questions under ADR-0023.

### 6. Identify and expose contact outcomes

`GameWorld` owns runtime-only collision telemetry:

- contact pair ids and roles;
- response type;
- impact speed;
- swept-vs-overlap detection;
- cumulative contact count;
- unknown/incompatible policy count.

`publicState()` exposes the bounded latest frame so browser acceptance and
operators can answer what hit what. Durable saves remain unchanged because a
transient contact is not world memory.

## Alternatives considered

### Admit Rapier into Field 02 now

Rejected for this correction. ADR-0023 is still Proposed and explicitly
withholds global solver authority. Replacing the shipped motion model would
change locomotion feel, bundle cost, replay assumptions, and controller
ownership far beyond the collision defect.

### Compute bounds from Three.js meshes every frame

Rejected. This makes presentation geometry gameplay authority, makes LOD and
asset swaps behavior-changing, and creates a second source of truth beside
terrain, obstacles, and `WORLD_STRUCTURE_PARTS`.

### Add only a rig-to-rig distance check in `state.ts`

Rejected. It would fix one symptom while leaving high-speed tunnelling,
cargo/world collisions, role policy, and observability unresolved.

### Use triangle meshes for every visible object

Rejected. It is needlessly expensive and unstable for moving bodies. Simple
primitive/compound collision proxies are the long-term contract; triangle or
heightfield geometry is reserved for fixed environment cases that truly need
it.

## Trade-offs and risks

- Circular rig footprints are conservative around long noses and trailers.
  They are correct for the current reduced-order controller but not the final
  answer for articulated rigs.
- Multiple simultaneous contacts are resolved deterministically in stable
  entity order, not by an iterative 3D constraint solver.
- A towed cargo body is still attached by an authored hitch relation, not a
  physical joint. Contact can stop or load the towing rig, but it cannot yet
  swing, roll, or jackknife.
- Collision telemetry is runtime-only; replay events remain a separate gate.

## Validation plan

### Tier 2

- policy matrix is symmetric and unknown roles fail closed;
- swept obstacle and structure tests prove no tunnelling;
- dynamic rig/rig and rig/cargo tests prove separation, mass response, and
  contact identity;
- existing terrain, camera, save, and motion tests remain green;
- root and kernel-probe typechecks pass.

### Tier 3

- browser acceptance on canonical port 4173 drives a rig into another rig and
  the relay cargo;
- public state identifies the contact pair;
- bodies remain separated;
- zero browser console errors;
- existing full Field 02 acceptance remains green.

### Tier 4

- manual visual review confirms visible body response reads as contact rather
  than a teleport, jitter loop, or invisible wall.

## Rollback and migration

The change does not alter the save schema. Removing the role/policy and dynamic
contact pass restores the previous behavior without migrating data. The
project-owned contact types may remain if a later solver replaces the response
mechanism.

## Revisit triggers

- an articulated trailer, long chassis, or asymmetric machine makes circular
  footprints visibly wrong;
- stacking, rollover, breakage, or joint constraints become named gameplay
  requirements;
- measured simultaneous-contact instability exceeds the current quality
  envelope;
- multiplayer authority requires contact events in deterministic replay.

## Anything else?

Yes. “Everything visible is solid” is not the goal. Pads, sensor volumes,
foliage, particle effects, and deliberate traversal openings must remain
non-blocking. The trust contract is stronger: every visible object has an
intentional physical role, and the simulation can explain that role.

## Update log

- 2026-07-28: Record created before implementation. Preserved the operator's
  exact request, current Tier 2 baseline, solver-neutral boundary, and the
  distinction between physical roles and rendered meshes.
- 2026-07-28: Implementation landed in the canonical fixed-step runtime.
  Semantic roles, fail-closed policy, swept obstacle/structure/body checks,
  mass-weighted rig/cargo response, signed hitch motion, conservative
  blueprint-derived rig footprints, and bounded strongest-contact telemetry are
  verified by 444 tests and focused canonical-browser acceptance. See
  [Dynamic World Collision Acceptance](../reviews/DYNAMIC_WORLD_COLLISION_ACCEPTANCE_2026-07-28.md).
  The comprehensive browser harness remains open at a stale parallel-owned
  steering assertion; no solver selection or ADR-0023 acceptance is implied.
