# Dynamic World Collision Exploration

- Date: 2026-07-28
- Status: implementation-directed exploration
- Evidence at creation: Tier 1 architecture inspection plus Tier 2 clean
  baseline (`npm run typecheck`; 432/432 Vitest tests)
- Skill used:
  `/Users/pranay/Projects/skills/game-development/3d-games/SKILL.md`
- Decision:
  [ADR-0037](../decisions/ADR-0037-solver-independent-dynamic-world-collision-authority.md)

## Question

How should Rigs Unbound prevent vehicles, cargo, terrain, obstacles, and
authored structures from behaving like disconnected meshes while preserving
vehicle character, deterministic fixed stepping, replaceable dynamics, and
browser budgets?

## Live architecture findings

### Physical truth already exists

- `terrain-traversal.ts` sweeps a proposed movement across terrain and returns a
  semantic `terrain-face` refusal.
- `collision.ts` deterministically generates trees/rocks and resolves circular
  rig overlap, including tree felling.
- `scene-query.ts` resolves rig footprints against authored
  `WORLD_STRUCTURE_PARTS`.
- `renderer.ts` reads those same records; procedural obstacles and authored
  structures are not renderer-only decoration.

### The missing middle

- `stepGame()` resolves only the active rig against obstacles and structures.
- Parked rigs never enter collision resolution.
- Relay cargo is positioned after the collision pass and never blocks a rig or
  the world.
- Obstacle and structure resolution checks the final position only.
- Contact outcomes identify an obstacle or structure locally but have no common
  role vocabulary or public telemetry.

This means the defect is not “there is no collision system.” It is “the
collision authority stops before dynamic bodies and continuous movement.”

## First-principles invariants

1. Simulation owns physical truth; presentation owns appearance.
2. A mesh loading successfully cannot create a gameplay collider.
3. Every body has an intentional semantic role.
4. Broad phase rejects distant pairs; narrow phase decides actual contact.
5. Fast movement must test the path, not only the final position.
6. Contact response and gameplay consequence are separate.
7. The system must identify what collided and expose unexpected pair policy.
8. Fixed-step order and entity order remain deterministic.
9. Simple primitives are preferred until a real shape falsifies them.
10. A future solver changes the mechanism, not the project-owned meaning.

## External research

### Rapier official documentation

- [Rigid body types](https://rapier.rs/docs/user_guides/javascript/rigid_body_type/)
  distinguishes dynamic, fixed, and kinematic bodies. It explicitly warns that
  commanded kinematic motion can pass through walls unless the application
  performs obstacle queries or uses a controller. This is directly relevant to
  the current authored vehicle motion.
- [Continuous collision detection](https://rapier.rs/docs/user_guides/javascript/rigid_body_ccd/)
  describes CCD as the mechanism that prevents fast bodies from missing
  contacts (tunnelling), and recommends enabling it only where relative speed
  justifies the cost.
- [Collision groups](https://rapier.rs/docs/user_guides/javascript/collider_collision_groups/)
  separates broad/narrow-phase pair filtering from solver-force filtering.
  Rigs Unbound should own the semantic matrix and let adapters translate it.
- [Colliders](https://rapier.rs/docs/user_guides/javascript/colliders/) recommends
  primitive/convex/compound shapes for dynamic bodies, warns against dynamic
  triangle meshes, and identifies heightfields/trimeshes as fixed-environment
  tools.
- [Advanced collision detection](https://rapier.rs/docs/user_guides/javascript/advanced_collision_detection_js/)
  separates broad phase, narrow phase, contact data, collision events, and
  force events. This supports separate detection, response, and gameplay
  interpretation.
- [Determinism](https://rapier.rs/docs/user_guides/javascript/determinism/)
  states that JavaScript/WASM Rapier can be cross-platform deterministic only
  when initialization and insertion order are identical and surrounding
  operations are deterministic. Solver use would not remove the project's
  replay obligations.

### Three.js official documentation

- [Box3](https://threejs.org/docs/pages/Box3.html) can compute world-space
  bounds from rendered objects, but requires current world matrices and can be
  conservative or expensive. It is useful for asset validation/debugging, not
  as canonical gameplay authority.

### Selected game-development skill

The `3d-games` skill recommends:

- simple colliders with complex visuals;
- layer-based filtering;
- mesh colliders mainly for terrain and only with explicit cost awareness.

That maps cleanly to the existing architecture: authored primitive proxies for
rigs/structures/obstacles, semantic role filtering, and terrain owned by
`TerrainField` rather than by the rendered mesh.

## Options

| Option | Strength | Failure |
| --- | --- | --- |
| Replace Field 02 with Rapier now | Native contacts, CCD, forces, joints | Unsigned solver decision; changes locomotion, bundle, replay, and ownership |
| Mesh-derived Three.js bounds | Automatically follows visuals | Presentation becomes physical truth; LOD/assets silently change gameplay |
| One-off rig distance check | Small code change | Leaves cargo, tunnelling, roles, telemetry, and world integration broken |
| Extend solver-independent kernel | Preserves current feel and contracts; closes live defect | Reduced-order response cannot provide rollover/stacking/joints |

## Chosen implementation direction

Extend the solver-independent kernel:

1. semantic collision roles and explicit pair policy in `collision.ts`;
2. reusable swept-circle query;
3. swept obstacle and authored-structure checks;
4. mass-weighted rig/rig and rig/cargo response;
5. cargo/world collision after hitch placement;
6. runtime-only contact telemetry exposed in `publicState()`;
7. targeted, full, and canonical-browser verification.

The result is an honest current-runtime collision system, not a claim that the
final vehicle universe has solved 3D rigid-body physics.

## Evidence ceiling

The planned implementation can prove:

- current rigs/cargo do not tunnel through current terrain/obstacle/structure/
  body proxies;
- collision roles and contact identity are observable;
- the fixed-step runtime remains deterministic for the tested cases.

It cannot prove:

- rollover, stacking, articulation, breakage, or compound-body stability;
- representative-device performance without browser/device measurement;
- multiplayer authority or durable replay of collision events;
- that circular proxies fit future long/asymmetric rigs.

## Anything else?

Yes. The exploration changes the collision-matrix trigger documented in
`COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md`: dynamic rig/cargo
interaction is now the real third consumer. The matrix is no longer abstraction
theatre; it has a concrete pairwise-admission job in the shipped runtime.

## Implementation findings addendum (2026-07-28)

The implementation falsified four details that were not visible in the initial
static audit:

1. **Endpoint overlap still needs CCD.** A sweep that ended inside another body
   was initially treated as ordinary overlap and could be pushed through the far
   side. The resolver now rewinds to earliest time of impact whenever the sweep
   did not start inside.
2. **Entity order is not contact order.** Fleet-ID iteration could select a
   farther body before a nearer body. Broad candidates are now sorted by impact
   fraction and re-tested after each resolution, preventing phantom contacts
   beyond the first blocker.
3. **Width-only rig circles were visually dishonest.** The physical radius now
   encloses the wheelbase/wheel-arc/track footprint. This remains a conservative
   circle, not a claim that oriented capsules are unnecessary.
4. **One-frame telemetry is operationally invisible.** The operator read model
   now keeps the strongest record for each of at most 16 recent pairs for 12
   fixed steps, with explicit age. Repeated low-speed contact cannot erase the
   impact that caused damage.

Attached cargo also required signed longitudinal velocity. Using path distance
as always-positive speed made reversing cargo report that it was moving away
from the body it was visibly approaching.

The runtime/browser evidence and remaining limits are recorded in
[Dynamic World Collision Acceptance](../reviews/DYNAMIC_WORLD_COLLISION_ACCEPTANCE_2026-07-28.md).


## Addendum (2026-07-29) - the next collision proof is one trigger and one sensor, not another blocker

- Re-read the exploration against the current 3d-games lens.
- The runtime already proves the blocking / felling / slide path for terrain, obstacles, and authored structures. The next durable proof is therefore not more blocking contacts.
- The next proof slice should introduce one non-blocking trigger and one passive sensor so the category/mask matrix earns a concrete third consumer.
- Good candidate roles are a workshop or contract-pad trigger and a survey / replay probe sensor, because they exercise the same semantic-admission boundary without mutating physical truth.
- That keeps the matrix honest: blocking contacts stay blocking, triggers fire effects, sensors observe, and both remain simulation-owned rather than mesh-derived.
- Evidence depth: Tier 1 static synthesis from the current collision exploration and 3d-games skill. No runtime change was made in this pass.

Anything else? Yes: the matrix is only real once a non-blocking role exists to justify it.
