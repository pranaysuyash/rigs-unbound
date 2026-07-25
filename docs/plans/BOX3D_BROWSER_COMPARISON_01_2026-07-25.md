# Box3D Browser Comparison 01

- Date: 2026-07-25
- Status: active bounded experiment
- Decision: [ADR-0017](../decisions/ADR-0017-replaceable-dynamics-foundation.md)
- Owner / next reviewer: project owner
- Evidence ceiling before implementation: Tier 1 static inspection

## Decision

Box3D is no longer a passive watchlist entry. Its official physical wheel
joints, recording/replay diagnostics, large-world direction, C17 API, and
browser build justify a mandatory experiment. The experiment does not delay or
replace the solver-independent rig architecture. It tests one different
controller family behind that architecture.

The first comparison is deliberately narrow:

- Rapier continues to prove a raycast-wheel controller;
- Box3D proves a physical-wheel controller;
- both consume project-owned semantic vehicle intent;
- both expose project-owned telemetry and body capture;
- both use the shared camera vocabulary and fixed-step browser discipline;
- neither solver object enters gameplay state, saves, activities, or render
  contracts.

This is not yet a winner-selection bakeoff. Comparing two different wheel
algorithms is useful architectural evidence, but it is not a fair claim that
one solver is categorically faster or better.

## Reviewed primary sources

- [Official Box3D announcement](https://box2d.org/posts/2026/06/announcing-box3d/)
- [Official Box3D repository](https://github.com/erincatto/box3d)
- [Official Box3D simulation and wheel-joint documentation](https://box2d.org/documentation3d/md_simulation.html)
- [Official Box3D recording/replay documentation](https://box2d.org/documentation3d/recording.html)
- [Third-party `box3d-wasm` wrapper repository](https://github.com/monteslu/box3d-wasm)
- [Official JoltPhysics.js repository](https://github.com/jrouwe/JoltPhysics.js)

Package registry metadata was also checked directly for the exact
`box3d-wasm@0.2.0` version, creation time, unpacked size, and integrity. The
exact package and integrity are pinned in `package-lock.json`.

## Corrected source reality

The operator-supplied review correctly identifies Box3D's official alpha and
its material features, but one packaging statement is already stale:

- the unofficial `box3d-wasm` npm package now exists;
- its reviewed version is pinned exactly for this experiment;
- it exposes a standard single-thread browser build and a deluxe threaded
  build;
- it has a working Three.js buggy example and physical wheel-joint bindings;
- it has no bundled TypeScript declarations;
- its wrapper repository and public adoption history are very young;
- Box3D's native recording/replay API is not assumed to be exposed by the
  wrapper until a binding and executable probe prove it.

The standard single-thread variant is the first target. The threaded variant
changes the hosting contract through `SharedArrayBuffer` and cross-origin
isolation, so it is a later explicit experiment rather than an automatic
default.

## Architecture change

The base `DynamicsService` contract owns only:

- static collision construction;
- fixed stepping;
- metrics;
- debug geometry;
- disposal.

Vehicle algorithms are explicit service capabilities:

```text
DynamicsService
├── RaycastVehicleDynamicsService
└── PhysicalWheelDynamicsService
```

Both families return the same project-owned `DynamicsVehicle` port. That port
is the comparison seam for semantic intent, capture/recovery, and extracted
telemetry. It does not require the solvers to share internal controller code or
pretend that a physical wheel is a ray.

## First executable probe

The Box3D browser surface must demonstrate:

1. asynchronous Box3D/WASM initialization;
2. a dynamic chassis with four physical wheel bodies;
3. suspension, steering, drive, and braking through Box3D wheel joints;
4. project-owned semantic intent;
5. fixed stepping and visible recovery;
6. project-owned body capture/restore;
7. engine, body, wheel-contact, step-time, render, and boot telemetry;
8. chase, hood, side, tactical, top-down, and survey camera selection;
9. a browser-readable state hook and a deterministic scripted-intent hook;
10. clean disposal and no Box3D objects in persistent game state.

## Comparison scenes and gates

The broader five-scene map remains the correct evidence programme, but each
scene has its own gate:

| Scene                        | Question                                                                                      | Status after Probe 01                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Tractor / buggy mobility     | Can the solver produce readable, tunable physical-wheel vehicle feel?                         | In scope                                    |
| Falling tree                 | Are long-body contacts, hinge/fall stability, and recovery useful for environmental play?     | Planned                                     |
| Excavator                    | Are articulated constraints, motors, limits, and tool contacts stable and debuggable?         | Planned                                     |
| Streamed compound settlement | Do baked compounds, activation, and large-coordinate policies meet world budgets?             | Planned                                     |
| Procedural replay            | Can a recorded mutation/input stream reproduce and explain divergence in the browser wrapper? | Blocked until recording bindings are proven |

Jolt enters the same harness only when its experiment answers one of these
questions. It should not be reduced to a duplicate falling-cubes benchmark.

## Related game-system comparison lanes

The solver comparison must also follow each physical result into the systems
that make it playable. These are not Box3D features; they are project-owned
contracts that every candidate must feed consistently.

| Lane                              | Current project reality                                                                                                                                                    | Comparison question                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collision response                | The canonical authored runtime has deterministic tree/rock obstacle resolution, including slide, damage, and felling. The solver labs currently have only static geometry. | Can contacts be translated into `blocked`, `fellable`, `trigger`, `sensor`, `hazard`, and `attachment` outcomes without engine handles entering gameplay?         |
| Collision categories and masks    | A durable contract exists, but its matrix and trigger/sensor proof are not implemented.                                                                                    | Can each candidate express the same project-owned category/mask matrix and visibly reject undefined pairs?                                                        |
| Continuous collision and recovery | Rapier enables CCD on the chassis; Box3D Probe 01 enables continuous simulation and bullet bodies. Both use bounded recovery.                                              | Which thin obstacles, high-speed impacts, tunnelling cases, and partial-failure recoveries remain stable?                                                         |
| Camera obstruction                | The product renderer handles terrain pull-in; arbitrary prop obstruction is still open. The labs share six camera policies but do not query solver geometry for occlusion. | Can camera obstruction consume a project-owned scene query rather than a solver-specific cast?                                                                    |
| Minimap and world coordinates     | `FieldMap` reads canonical terrain, surveyed cells, sites, cargo, and rig `x/z`; it does not read physics bodies.                                                          | Can solver transforms be extracted into the same world-coordinate port, including origin shifts and streamed chunks, without changing map semantics?              |
| Terrain and surfaces              | The product has one canonical terrain sampler; the labs use static surface strips.                                                                                         | Can heightfields, meshes, compounds, and surface material identity feed the same terrain/surface vocabulary?                                                      |
| Streaming and large worlds        | Chunk residency and manifest rules are documented but not implemented in the lab.                                                                                          | Can bodies, shapes, joints, map cells, and replay identities activate/unload deterministically without stale handles?                                             |
| Attachments and cargo             | The product has semantic tow/cargo state; the solver labs do not yet have physical constraints for it.                                                                     | Can a joint-backed attachment preserve semantic ownership, save recovery, breakage, and scoring across candidates?                                                |
| Feedback and audio                | The product perception chain already maps simulation state into readable feedback.                                                                                         | Can contact intensity, suspension load, slip, damage, and capability events be extracted consistently enough for sound, particles, shake, and accessibility cues? |
| Replay and diagnostics            | The product has a bounded run record; Box3D has native diagnostic recording, but the reviewed wrapper does not expose it.                                                  | Can the project replay semantic inputs and compare checkpoints while treating native recordings as optional solver diagnostics?                                   |

The minimap/world-coordinate lane is recorded separately in
`docs/research/MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md`. Collision
category ownership remains in the existing collision contract rather than being
duplicated here.

## Metrics

Every candidate run must report:

- exact engine and wrapper versions;
- first-controllable milliseconds;
- initial and route-specific JavaScript/WASM transfer sizes;
- body, collider/shape, joint, and active-body counts where exposed;
- physics step duration and frame-time p95;
- wheel contact count and vehicle speed;
- capture/restore outcome;
- runtime warnings and failures;
- wrapper lifecycle burden and missing API surface;
- the camera and input contracts exercised.

Cross-engine metric names are comparison vocabulary, not a promise that every
solver calculates them identically. Unsupported values must be marked
`unavailable`, never fabricated.

## Acceptance contract

Probe 01 reaches Tier 3 only when:

- TypeScript and the production multi-entry build pass;
- the Rapier lab tests and browser acceptance still pass;
- a separate Box3D entry loads without inflating Field 02's initial route;
- scripted input moves, steers, brakes, resets, and switches every camera;
- the browser-readable state identifies the physical-wheel family and exact
  wrapper version;
- the console contains no unhandled error or warning;
- desktop and narrow screenshots are reviewed;
- package and wrapper limitations are recorded;
- Field 02 remains the only canonical product runtime.

## Risks and rollback

- `box3d-wasm` is unofficial and early. The experiment owns a narrow adapter
  and exact version pin; removal of the entry, adapter, declaration, and
  dependency returns the repo to Rapier-only evidence.
- The wrapper requires explicit JS-handle deletion and simulation-object
  destruction. The adapter owns lifecycle and must be stress-checked before any
  promotion.
- Native Box3D recording files depend on matching struct layout/build. They are
  diagnostic evidence, not the game's save format.
- Single-machine same-build repeatability is not cross-platform determinism.
- A successful buggy probe does not prove tractors, excavators, large worlds,
  or replay.

## Validation plan

- Tier 1: inspect official Box3D announcement, simulation, recording, repository,
  wrapper source, package metadata, and Jolt browser integration.
- Tier 2: contract tests for capability separation, Box3D lifecycle, semantic
  input, capture/restore, and same-runtime repeatability.
- Tier 3: production build plus browser automation for both physics entries and
  the existing game.
- Tier 4: desktop and narrow visual review of direction, wheels, steering,
  suspension, camera framing, and telemetry.

## Anything else?

Yes. The most valuable result may be a loss. If Box3D's wrapper surface,
lifecycle burden, missing recording bindings, or browser cost defeats the
project criteria, that negative evidence still improves the architecture and
prevents a speculative engine migration. The probe exists to learn, not to
justify a preferred solver.
