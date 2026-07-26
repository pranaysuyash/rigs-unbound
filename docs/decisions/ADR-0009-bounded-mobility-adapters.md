# ADR-0009: Bounded mobility adapters own locomotion-specific state

- Date: 2026-07-25
- Status: implemented and verified for the bounded Field 02 proof
- Decision owner: project owner through the standing vehicle-universe mandate
- Implementation owner: current project agent
- Next reviewer: project owner after Marsh Skimmer browser evidence
- Related: [ADR-0003](ADR-0003-versioned-gameplay-content-composition.md),
  [ADR-0006](ADR-0006-rig-capability-portability.md),
  [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md), and
  [ADR-0008](ADR-0008-camera-policies-and-direct-view-selection.md)

## Context

Rigs Unbound claims that bicycles, tractors, toys, watercraft, aircraft, rockets,
and hybrids can remain persistent playable characters without forcing them
through one universal physics controller.

The current code does not yet prove that claim. `MobilityAdapter` has only
`"ground"`, while universal `RigState` contains four wheels, wheel rotation,
ground contact, suspension compression, and a `grounded` flag. Those fields are
honest for Torque and Spark but become architectural fiction for a boat,
hovercraft, bicycle, aircraft, or spacecraft.

Adding a third wheeled profile would avoid the question. Adding a skimmer with
four invisible wheels would answer it incorrectly.

Field 02 already contains the right adjacent test environment: Sunken Flats has
deep water that harms ground rigs, the world and terrain are deterministic,
camera policies are typed, exploration and persistence are shared, and the
semantic input contract is renderer-independent.

## Decision

### 1. Shared rig state stops pretending every vehicle has wheels

`RigState` retains identity, world transform, planar speed and steering,
condition, strain, attachments, modules, and shared telemetry. Locomotion-only
state moves into a discriminated union:

- `GroundMobilityState`
  - `kind: "ground"`
  - contact stability, vertical velocity, jump cooldown, wheel rotation, and
    four suspension contacts;
- `HoverMobilityState`
  - `kind: "hover"`
  - lift velocity, current clearance, cushion pressure, and skirt contact.

Consumers narrow by `mobility.kind`. No fake wheels, placeholder contacts, or
vehicle-name branches are allowed.

### 2. A mobility adapter owns motion and settling

The canonical adapter boundary consumes:

- the shared rig instance;
- its composed immutable profile;
- the same semantic `InputFrame`;
- the canonical terrain/world substrate;
- a fixed time step;
- explicit contextual options such as towing and authored launch geometry.

It mutates the rig through one deterministic step and returns one shared
`MotionOutcome` contract for consequences, diagnostics, persistence,
observability, audio, and world interaction.

The registry is keyed by the profile’s `mobilityAdapter`; state and profile
kinds must agree. An invalid pairing fails visibly in development and fails
closed during save recovery.

### 3. Ground behavior is preserved as the first adapter

The existing four-contact suspension and traction model becomes the
`ground` adapter without changing its player-facing behavior. Its tests are the
migration harness. This is an ownership refactor, not permission to retune
Torque or Spark.

### 4. Marsh Skimmer 01 is the concrete hover proof

Add one fictional low-hover utility skimmer, field name **Drift**, parked near
Sunken Flats.

Its proof obligations are:

- same persistent rig identity and save as Torque and Spark;
- same accelerate, brake, steer, switch, camera, map, pause, and reset actions;
- a real `hover` adapter with no wheel state;
- clearance held above terrain or water through a damped lift model;
- water does not trigger drowning, while steep terrain and towing still impose
  explicit costs;
- all six camera policies remain selectable;
- exploration and discoveries remain shared;
- renderer silhouette communicates a skirt, lift fans, pontoons, and no wheels;
- text observability exposes hover clearance and cushion state;
- deterministic tests prove deep-water traversal where an unmodified ground rig
  bogs and takes damage.

The skimmer does not get a new minigame, currency, world, save, input stack, or
activity controller. Its value is exposing assumptions in shared systems.

### 5. Schema v4 owns the mobility-state migration

The save schema advances from v3 to v4. Valid v3 records migrate each existing
rig’s wheel/contact fields into `mobility.kind === "ground"` and add a fresh
Drift instance without discarding world memory.

Keys remain versioned. The v3 record is still readable for rollback; invalid
mobility data fails closed with a visible recovery diagnostic.

## Options considered

1. **Add another wheeled rig.**
   - Rejected: more content, no new architectural evidence.
2. **Reuse the ground controller with invisible wheels.**
   - Rejected: false abstraction and permanent ground assumptions in universal
     state.
3. **Build full free flight now.**
   - Rejected for this evidence unit: six-axis control, altitude authority,
     airspace, camera comfort, and collision volumes introduce too many
     questions at once.
4. **Build a water-only boat.**
   - Useful later, but it needs docking/stranding/recovery rules before the
     player can switch to it safely. A low-hover skimmer tests water and land
     adjacency while remaining recoverable in the current world.
5. **Introduce a bounded union and prove it with low hover.**
   - Accepted: it removes the current false universal state and adds the
     smallest genuinely non-ground playable proof.

## Trade-offs and risks

- Schema v4 touches contracts, recovery, renderer, tests, and browser tooling.
  The first coherent stage must land all of them together.
- Hover can trivialize terrain progression. Drift therefore crosses water but
  loses authority and strain on steep ground; it is not a universal best rig.
- Shared `speed` and `steering` remain planar concepts. Free flight or orbital
  motion may later require a broader velocity/orientation body contract.
- A registry can become abstraction theater. Only implemented adapters enter
  the union; no speculative tracked, aquatic, flight, or orbital types are
  added.
- Remote rig switching is already allowed. Future multiplayer may require a
  diegetic ownership/presence rule, but this local proof does not invent one.

## Validation plan

- Tier 2:
  - existing Torque/Spark motion and migration tests remain green;
  - v3-to-v4 migration preserves both ground histories and world memory;
  - invalid profile/state adapter pairings fail recovery;
  - identical hover seeds and inputs remain deterministic;
  - Drift crosses deep water without drowning;
  - Drift loses control or accumulates strain on unsuitable steep ground;
  - public state contains no wheel contract for Drift.
- Tier 3:
  - production build and full deterministic probe pass;
  - browser acceptance switches through three rigs, selects every camera,
    drives Drift across water, reloads schema v4, and verifies shared discovery.
- Tier 4:
  - visible desktop and narrow play confirm the skimmer silhouette, readable
    hover response, camera framing, touch controls, and clean console.

External player language remains a separate gate. This proof may establish
architectural portability without proving that Drift is fun.

## Rollback and revisit

The v3 save key remains readable. Reverting the hover rig must not restore wheel
fields to universal state; the `ground` union is still the correct ownership
shape.

Revisit the shared body contract when a real free-flight, orbital, articulated,
or balance-driven adapter proves planar speed/steering or Euler pose inadequate.

## Anything else?

Yes. The success metric is not “three vehicles.” It is that adding Drift forces
ground-only assumptions out of shared contracts, and that deleting Drift later
would still leave a more truthful architecture. If the implementation adds
hover branches throughout UI, activities, storage, and rendering instead of
one bounded adapter plus one renderer factory, the experiment has failed.

## Update log

- 2026-07-25: Accepted for implementation after Field 02 closed the terrain and
  camera prerequisites and the standing exploration map identified a second
  locomotion family as the next highest-leverage evidence unit.
- 2026-07-25: ADR-0017 accepted Rapier as the first replaceable browser
  dynamics foundation after the owner supplied a more specific physics
  direction. This does not invalidate bounded mobility adapters: controller
  family and solver implementation remain separate decisions, and the authored
  ground/hover adapters remain comparison evidence.
- 2026-07-26: Status and physics provenance corrected. The bounded ground/hover
  adapter proof is implemented and verified; the historical solver-acceptance
  statement above is no longer current authority. ADR-0017 now records Rapier
  and Box3D as evidence fixtures, and ADR-0023 remains Proposed. See
  [the decision register](README.md).
