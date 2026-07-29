# Collision Category and Mask Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current obstacle-resolution logic into an explicit collision-category / collision-mask policy.

The live code already resolves terrain contact and obstacle response deterministically, but the collision model is still largely implicit: obstacle kinds exist, and the physics layer asks the obstacle field to resolve overlaps, but there is no first-class matrix for ground, obstacle, hazard, trigger, projectile, sensor, and decorative roles.

## Current evidence base

- Obstacle and collision resolution:
  - [src/game/collision.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/collision.ts)
- Motion and contact outcomes:
  - [src/game/physics.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/physics.ts)
- Roadmap lane for collision categories and masks:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- Exploration map collision/camera/scale queue:
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## What is already there

The current collision logic already has useful structure:

- obstacle generation is deterministic and seed-driven
- obstacle resolution is role-aware for trees versus rocks
- trees can be felled by a heavy enough, fast enough rig
- rocks block and slide the rig rather than collapsing
- terrain and obstacle placement already avoid authored route/pad areas

That is a real gameplay foundation. It is not yet a full category/mask contract.

## What is still missing

The repo still lacks a named policy for:

- category assignment for each collidable role
- a collision-mask matrix describing allowed interactions
- trigger contacts that fire behavior without mutating physics state
- sensor contacts that observe but do not block
- projectile and hazard responses separate from general obstacle resolution
- telemetry for unexpected or incompatible category/mask pairs

The current system can express "tree" and "rock" as obstacle kinds, but it cannot yet say "this is a sensor, it should not mutate motion" or "this is a trigger, it should fire an event but not block the rig."

## Contract shape

The collision policy should separate:

1. category identity
2. mask compatibility
3. contact response
4. side effects
5. observable telemetry

Suggested top-level roles:

- ground
- obstacle
- hazard
- trigger
- projectile
- sensor
- decorative

## Validation rules

The contract should fail visibly if:

- a role is missing a category
- a mask pair is undefined
- a trigger mutates physics state directly
- a sensor blocks motion
- a projectile or hazard is routed through the wrong generic obstacle path
- an incompatible pair is silently accepted

## Near-term proof slice

The smallest durable proof for this contract is:

1. one category/mask matrix for the current roles
2. one test proving a trigger contact does not mutate physics state
3. one test proving a sensor contact does not mutate physics state
4. one telemetry field for unexpected or incompatible pairings
5. one documented fallback behavior for unknown roles

## Open questions

- Should triggers and sensors be implemented as separate broad-phase tags or as mask-only semantic roles?
- Which current gameplay object should become the first trigger candidate: workshop pad, cargo ring, or map landmark?
- Which current gameplay object should become the first sensor candidate: survey mast, route probe, or replay/debug probe?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The collision model already does the important first-playable job. This contract makes the next step explicit: separate passive observation, state-changing triggers, and blocking contacts before more systems start sharing the same space.

## Addendum (2026-07-25): solver-comparison consequence

The Box3D comparison makes the category/mask contract more urgent and clarifies
its ownership. Rapier collision groups, Box3D filters, and later Jolt object
layers are implementation mechanisms; none may become the gameplay vocabulary.

The comparison harness should add one shared contact scenario containing:

- a blocking rock;
- a fellable tree;
- a non-blocking delivery trigger;
- a non-blocking survey sensor;
- a damaging hazard;
- an attachment/cargo pair;
- a thin high-speed barrier for CCD evidence.

Each adapter must translate native contacts into the same semantic outcome
record. Unknown or incompatible pairs must increment visible telemetry and use a
documented fail-closed response. The current Box3D probe's wheel-contact value
is only an AABB proximity estimate because the young wrapper exposes event
arrays but not a persistent contact query. It must not be presented as a
general collision-semantic proof.

## Addendum (2026-07-25) - live collision behavior exists, but the matrix is still implicit

- Re-checked the collision contract against the current browser daemon snapshot
  and live repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime already has a real deterministic collision path:
  - `src/game/collision.ts` resolves obstacle contact with role-aware tree vs
    rock behavior,
  - `src/game/state.ts` consumes that outcome after motion and applies the
    consequences,
  - the current obstacle model already distinguishes blocking, fellable, and
    sliding responses.
- That means the game already has a meaningful collision foundation.
- What is still missing is the explicit matrix the contract calls for:
  - no first-class category/mask table for ground, obstacle, hazard, trigger,
    projectile, sensor, and decorative roles,
  - no dedicated trigger/sensor contact semantics,
  - no telemetry for unexpected or incompatible category/mask pairs,
  - no documented fallback for unknown roles.
- So the collision boundary is still implicit in the obstacle resolver, not yet
  a named interaction matrix that other systems can rely on.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-26) - obstacle roles are still narrow, and no new collision classes have surfaced in the live runtime

- Re-checked the current obstacle/collision source against the live browser
  snapshot.
- The live runtime still only needs the narrow blocking/felling/slide behavior
  that `src/game/collision.ts` already implements:
  - trees can be felled by heavy enough motion,
  - rocks block and slide,
  - the generated field stays deterministic and role-aware.
- The source still does **not** expose a first-class category/mask table:
  - no trigger class,
  - no sensor class,
  - no projectile class,
  - no hazard routing separate from generic obstacle response.
- That means the contract remains exactly where it should be for now:
  the game has a real collision foundation, but the next extension still needs a
  policy layer before broader interaction types can be added safely.

## Addendum (2026-07-26) - the live collision foundation remains narrow and deterministic

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current collision behavior is still the narrow first-playable set:
  - trees can be felled by heavy enough motion,
  - rocks block and slide,
  - the field stays deterministic and role-aware.
- `src/game/collision.ts` and `src/game/physics.ts` still do not expose a
  first-class category/mask matrix:
  - no trigger class,
  - no sensor class,
  - no projectile class,
  - no hazard routing separate from generic obstacle response.
- The live runtime therefore still validates the narrow obstacle foundation,
  but it does not yet need the broader collision vocabulary the contract names.
- The useful conclusion is unchanged: the current collision model is stable and
  readable, and the next extension should add a policy matrix before any new
  contact classes are introduced.

## Addendum (2026-07-26) - authored structures join canonical collision truth

The Launch Ridge review exposed a different collision class from the procedural
tree/rock field: visible authored landmark geometry could exist only in the
renderer. The rocket therefore looked solid while gameplay and camera queries
could not reason about its footprint.

The first durable authored-structure slice now uses
`WORLD_STRUCTURE_PARTS` as the shared record for:

- renderer geometry;
- camera obstruction;
- solver-independent circular-rig push-out.

Each part declares `cameraOccluder` and `rigCollider` separately. This prevents
decorative roofs, pads, and other visible pieces from silently becoming motion
blockers while still eliminating renderer-only solid landmarks. Rapier and
Box3D remain implementation adapters rather than authored-world truth.

Acceptance places the tractor inside the Launch Ridge rocket, advances the real
kernel, and proves both:

- the rig is pushed beyond the combined structure/rig footprint;
- the chase camera remains rear-side, path-clear, and outside the rig.

This is not yet the broader category/mask matrix named by this contract.
Triggers, sensors, hazards, projectiles, and CCD still need the planned policy
layer. The next structure-collision extension should preserve the same semantic
flags and add compound rig footprints only when a real articulated or long-rig
case requires them.

## Anything else? (authored structures)

Yes. An imported GLB is presentation data, not automatic collision authority.
Future landmark assets should map named nodes to existing authored structure
records, or update those records deliberately with tests. They should not
derive gameplay collision opportunistically from whatever mesh happens to
load.

## Addendum (2026-07-26) - two collision consumers are real; a third is the matrix trigger

- The `3d-games` review re-checked the live architecture rather than assuming
  that every collision concern should enter one generic bitmask today.
- The code has two distinct, project-owned collision consumers:
  - rig traversal uses deterministic circular contacts against procedural
    obstacles and authored `rigCollider` structure parts;
  - camera resolution uses typed segment queries against terrain, obstacles,
    and independently flagged `cameraOccluder` structure parts.
- Both consumers already share deterministic obstacle truth and authored
  structure records, but they intentionally need different shapes and outcomes.
  A tree crown can block a camera without becoming a rig contact shape; a pad
  can remain visible without becoming a traversal blocker.
- Decision: do not retrofit a category/mask registry into these two existing
  consumers. That would only wrap established semantic flags in a second source
  of truth. Introduce the matrix with the first third consumer that needs
  pairwise admission: projectile, sensor, pickup/trigger, hazard, or AI line of
  sight. At that point, migrate the existing flags into category definitions,
  define an unknown-role rejection outcome, and add telemetry for rejected
  category pairs.
- Evidence depth: Tier 1 static review of `src/game/collision.ts`,
  `src/game/scene-query.ts`, their tests, and the current authored-structure
  contract. No new runtime claim is made.

## Anything else? (matrix trigger)

The collision policy must remain simulation-owned. Render meshes and imported
assets can supply geometry only through an authored mapping; they cannot create
new physical roles by loading successfully.

## Addendum (2026-07-26) - source scan still shows narrow obstacle-only runtime collision

- Re-checked the runtime collision path after the earlier authored-structure
  note and the latest source scan.
- `src/game/collision.ts` still implements the same narrow first-playable
  behavior:
  - trees are fellable,
  - rocks block and slide,
  - determinism is preserved through the generated obstacle field.
- The source scan still does not show a first-class category/mask registry in
  runtime code:
  - no trigger class,
  - no sensor class,
  - no projectile class,
  - no hazard routing separate from generic obstacle response.
- So the policy boundary remains exactly where it should be for now:
  the current game has a stable collision foundation, but broader pairwise
  admission still needs a dedicated policy layer before new contact classes are
  added.

## Addendum (2026-07-26) - the live runtime is still obstacle-only, which keeps the matrix trigger honest

- Re-checked the current collision and physics code against the live browser
  surface and the current repo state.
- `src/game/collision.ts` still resolves the same narrow first-playable roles:
  trees can be felled, rocks block and slide, and authored structure parts stay
  under solver-independent ownership.
- `src/game/physics.ts` still consumes that outcome as a deterministic motion
  result; there is still no first-class category/mask registry in the runtime.
- The important implication is that the next matrix proof should not be a broad
  refactor of the existing obstacle resolver. The next proof should be the first
  third consumer that truly needs pairwise admission, such as a trigger,
  sensor, projectile, pickup, or hazard.
- That keeps the current collision foundation honest: obstacle resolution is
  real, and the broader category/mask contract remains a deliberate future
  boundary.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-26) - collision masks support episode grammar, but the matrix still remains future-bound

- The current collision foundation already does the important support work for
  episode readability: it keeps traversal, obstruction, and camera-safe
  geometry deterministic.
- That makes collision a support layer for the episode grammar, because
  episodes only stay readable if the player can understand what blocks, what
  yields, and what remains decorative.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - collision policy makes physical obstruction and traversal readable,
  - future category/mask rules will keep that readability stable when triggers,
    sensors, or other pairwise consumers arrive.
- This note does not introduce the category/mask matrix early; it only keeps
  the dependency visible so later episode work can rely on the current
  deterministic collision foundation.


## Addendum (2026-07-29) - the first matrix proof should be one trigger and one sensor

- Re-read the collision contract against the dynamic-world collision exploration.
- The runtime already has a solid blocking foundation for terrain, obstacle, and authored-structure contacts. The next proof should not add another blocker.
- The first matrix-worthy extension is one trigger and one sensor so the policy can separate: block, fire, observe, and ignore.
- A workshop/contract pad is a strong trigger candidate because it should fire a gameplay consequence without mutating motion. A survey mast or replay/debug probe is a strong sensor candidate because it should observe or announce without blocking.
- That makes the matrix concrete: the new roles are not just new names for obstacles; they are the first non-blocking pair that proves the policy vocabulary is doing real work.
- Evidence depth: Tier 1 static synthesis. No runtime trigger/sensor implementation was added in this pass.

Anything else? Yes: the collision policy only graduates once a non-blocking pair exists to exercise it.
