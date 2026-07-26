# ADR-0007: Terrain is the simulation substrate, and we own the traversal model

- Status: **Accepted for the current runtime** (supersedes nothing; extends ADR-0001 and ADR-0003)
- Date: 2026-07-25
- Deciders: project owner (Pranay), implementing agent
- Related: [ADR-0001](ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md), [ADR-0003](ADR-0003-versioned-gameplay-content-composition.md), [ADR-0006](ADR-0006-rig-capability-portability.md)

## Context

Rig Lab 01 is playable but its world is a flat `210 × 210` plane with a hard
`WORLD_LIMIT` box, four proximity-trigger landmark circles, and decorative props
placed by a seeded RNG **inside the renderer**. The kernel has no concept of
ground shape at all: `stepGame` integrates `x`/`z` on a plane and sets `y = 0`
unless the rig is mid-jump.

Three consequences follow from that single fact, and all three are already
recorded as open gaps elsewhere in the project docs:

1. **Steering is the only meaningful input.** Throttle has no opponent, so the
   contrasting rig profiles in ADR-0006 can only be *read* off the HUD, never
   *felt*. `docs/reviews/RIG_LAB_01_ACCEPTANCE_2026-07-25.md` records exactly
   this: external players may describe "only different speeds."
2. **Exploration cannot exist.** There is no reason to prefer one route over
   another, no reason to climb anything, and no information to gain by moving.
   "Open world" currently means "large empty rectangle."
3. **Nothing else can be built.** Camera occlusion (flagged in `DESIGN.md`),
   collision, dust, suspension, traction, terrain-gated progression, and a map
   all need to ask the same question — *how high is the ground here, and what is
   it made of?* — and there is nobody to ask.

The renderer also currently **owns** world layout (props, roads, field strips
are constructed in `renderer.ts` from its own `seededRandom(seed)`). That is a
parallel truth source: the kernel cannot collide with, drive over, or reason
about anything the renderer invented. This violates the project's own
kernel/port separation in ADR-0001.

## Decision

### 1. A deterministic terrain field becomes the canonical world substrate

Introduce `src/game/terrain.ts`, a pure-TypeScript, renderer-independent field
with the contract:

```
height(x, z)  -> metres
normal(x, z)  -> unit vector
surface(x, z) -> SurfaceMaterial (grip, rollingDrag, deformable, …)
```

Every consumer — physics, collision, camera, exploration, renderer mesh
generation, minimap — reads **this one function**. The renderer stops inventing
world data and becomes a pure view of the field. There is exactly one answer to
"how high is the ground here," and it lives in the kernel.

### 2. Procedural generation is authored-anchored, not free

The field is `seed → domain-warped fBm + ridged spine + moisture channel`,
then **blended toward authored anchors**: named sites with a position, radius,
target elevation, and falloff. Home Valley is flat because an anchor says so,
not because the noise happened to be quiet there. This is the concrete
implementation of the exploration map's `world graph → biome → terrain →
landmarks` layering and of the "procedural means seeded and constrained by
authored rules" boundary in `README.md`.

Anchors give us invariants for free: spawn is always flat, landmark sites are
always reachable, and the workshop is never inside a cliff.

### 3. We write the vehicle traversal model ourselves; Rapier stays deferred

The traversal model is a **reduced-DOF body on four sampled contacts**: heading
and planar position integrate as today, while body elevation, pitch, and roll
are driven by spring-damper suspension against four terrain samples, and
longitudinal motion is opposed by measured grade, surface rolling drag, and a
traction limit derived from surface grip × wheel load.

We are not adopting Rapier for this layer. Reasoning:

- **Determinism is a shipped contract here.** `window.applyRigInput` and the
  vitest kernel suite depend on exact reproducibility. A pure-TS float model in
  a fixed step is trivially reproducible; a WASM solver's cross-build
  reproducibility is an additional thing to prove.
- **Feel is the product.** The disputed question in this project is whether a
  tractor and a buggy feel different. That is a question about a hand-authored
  handling curve, not about constraint-solver accuracy. Owning the curve is the
  point, not an accident.
- **Cost.** Rapier adds a WASM payload to a build that already trips Vite's
  500 kB advisory, for a body count of two.
- **The reduced model is honest about its limits.** Three rotational DOF
  (y, pitch, roll) on springs cannot tumble or rest on its roof. We accept that;
  a tractor that cannot barrel-roll is not a gameplay loss today.

**Trigger that flips this decision to Rapier (or equivalent):** the first
gameplay requirement for stacked/jointed rigid bodies, articulated trailers with
real hitch dynamics, destructible structures, or rollover as a fail state. At
that point the traversal model becomes a port behind the same
`RigState`-in/`RigState`-out boundary, and the kernel tests are the migration
harness. Recorded so this is a revisit, not a rewrite.

### 4. Grade becomes the primary progression gate

Because climbing is opposed by real measured gravity along the heading, a slope
the rig cannot climb is a **legible, diegetic lock**. Progression modules
(gearing, tires, winch, survey mast) change what terrain is passable rather than
incrementing a damage number. "I cannot climb that yet" replaces "I do not have
the key yet," with no locked door art required.

### 5. World memory becomes physical

Ploughing writes bounded height deltas into a sparse deformation map that
`height()` composes on top of the base field. The world does not merely draw a
memory of the player; the ground *is* different afterwards, and the physics
reads it back. Felled obstacles and harvested salvage persist the same way.

## Consequences

**Positive**

- One canonical world truth; the renderer/kernel parallel-source violation is closed.
- Physics, collision, camera, exploration, and UI all compose on one function.
- Rig contrast becomes felt (grade, grip, suspension) instead of tabulated.
- Terrain-gated progression needs no lock-and-key content.
- Determinism, the vitest suite, and the `window.*` browser contract all survive.
- No new runtime dependency; no new asset licensing surface.

**Negative / accepted risk**

- Save schema must go to v3. Mitigation: the existing v1→v2 migration pattern is
  extended, not replaced; v1 and v2 records still load.
- Terrain mesh generation costs boot time. Mitigation: measured, budgeted, and
  reported through the existing performance instrumentation rather than assumed.
- The reduced-DOF model cannot represent rollover (see above).
- Noise-field tuning is a data-layer concern under motto v4 §0.8: the parameters
  are versioned in code and covered by tests asserting invariants (spawn is
  flat, anchors hold, height is bounded and continuous), not by eyeballing.

## Alternatives considered

- **Keep the flat plane, add more props and activities.** Rejected: it multiplies
  content on top of the exact mechanic that has no depth. The acceptance review's
  "players only describe different speeds" risk gets worse, not better.
- **Adopt Rapier now and get vehicles "for free."** Rejected for this layer; see
  §3. Raycast-vehicle still requires authoring the same handling curve, so the
  cost is paid either way — plus WASM payload and determinism proof.
- **Author a fixed handmade heightmap.** Rejected: an image asset is a parallel
  truth source that cannot extend, cannot be seeded for variants, and cannot be
  deformed by gameplay without a writeback path we would have to build anyway.
- **Put terrain in the renderer and have physics query the mesh.** Rejected
  outright: that is the current architectural defect, formalized.

## Anything else?

Three cross-cutting items the per-item analysis missed:

1. **The hard `WORLD_LIMIT` box is now a design statement, not a stub.** With
   real terrain we can bound the world with impassable ridge anchors instead of
   an invisible wall that reverses your speed. The wall stays as a numerical
   safety clamp, but it should never be the thing the player meets.
2. **Audio was about to become the next "documented but unbuilt" gap.** Surface
   grip and wheel slip now exist as numbers, which means a procedural engine and
   tire voice is a small addition with a real signal to track. Doing it in the
   same pass avoids the pattern this project is already prone to — a design doc
   describing a system the runtime does not have. Synthesized audio also carries
   no asset-provenance obligation, which keeps the register clean.
3. **This ADR raises the evidence bar on ourselves.** Claiming "traversal feels
   different" is a Tier 4/5 claim requiring external players. What this pass can
   honestly claim is Tier 2/3: the grade, grip, and suspension differences are
   measurable in tests and observable in a browser. The external-player language
   gate from the Rig Lab 01 acceptance review stays open, and no amount of
   terrain closes it.

## Update log

- 2026-07-25: Accepted and implemented in the same pass; see
  `docs/plans/OPEN_WORLD_TRAVERSAL_2026-07-25.md` for the gated commit order and
  acceptance contract.

## Addendum (2026-07-26): shared terrain-face traversability boundary

The reduced-DOF adapters retain ownership of ordinary power, grip, suspension,
hover pressure, grade, and water behavior. A new solver-independent boundary
now owns one narrower invariant for every adapter: a rig may not tunnel through
or be lifted onto a discontinuous terrain face.

The boundary sweeps the motion-direction leading support edge, samples centre
and lateral footprint points, and compares local support rise with
adapter-shaped wheel/contact or hover-skirt envelopes. It also checks the
leading-to-trailing footprint rise so a start-from-rest attempt cannot place
the front support on an upper shelf. Direction comes from requested
displacement, not rig heading, so downhill movement and reverse escape remain
valid. A refusal returns semantic reason `terrain-face`; the gameplay layer
turns that into player/operator guidance.

This is deliberately not a new climb stat. Smooth grades still resolve through
traction, gearing, gravity, and cushion authority. Hover authority may reach
zero on an extreme grade; the former artificial minimum is removed.

Validation is Tier 2 through five focused boundary tests, the complete root
suite, and deterministic-kernel tests; Tier 3/4 browser acceptance searches the
real seeded terrain for an obstacle-free face and exercises Torque, Spark, and
Drift under deterministic manual stepping. Revisit envelope values when a
tracked, articulated, flying, or climbing adapter proves a distinct support
geometry, not merely when a rig needs different tuning.
