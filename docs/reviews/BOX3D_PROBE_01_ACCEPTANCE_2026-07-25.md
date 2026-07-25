# Box3D Probe 01 acceptance

- Date: 2026-07-25
- Status: accepted as a bounded local experiment; not accepted as product solver
- Decision: [ADR-0017](../decisions/ADR-0017-replaceable-dynamics-foundation.md)
- Plan: [Box3D Browser Comparison 01](../plans/BOX3D_BROWSER_COMPARISON_01_2026-07-25.md)
- Risk class: medium experimental dependency and browser/WASM integration
- Highest evidence: Tier 4 local visual/runtime; no public deployment claim

## Outcome

Box3D now has a real browser proof in Rigs Unbound rather than a prose-only
watchlist entry.

The probe runs a five-body rig—one dynamic chassis and four physical wheel
bodies—through four Box3D wheel joints. It consumes the same project-owned
`VehicleIntent`, returns the same project-owned `DynamicsVehicle` telemetry and
capture shape, shares the Physics Lab renderer and six camera policies, and
loads only on the separate Box3D route.

Rapier remains the raycast-wheel proof. Box3D is the physical-wheel proof. No
winner has been selected.

## User-facing behavior

- `http://localhost:4173/box3d-lab.html` is playable.
- `W/S`, `A/D`, brake, handbrake, reset, touch controls, frequency, and time
  controls work through the existing laboratory runner.
- Chase, hood, side, tactical, top-down, and survey views are directly
  selectable.
- Positive throttle moves the bright vehicle nose away from the chase camera
  along visual local `+Z`.
- The desktop and narrow UI name Box3D, wrapper version, physical-wheel family,
  speed, slip estimate, wheel proximity, physics time, frame rate, and
  body/shape count.
- Reset restores the chassis and all four wheel bodies.
- The narrow layout no longer covers the experiment subtitle.

## Architecture result

The original `DynamicsService` contract accidentally made
`createRaycastVehicle` universal. It is now separated into:

```text
DynamicsService
├── RaycastVehicleDynamicsService
└── PhysicalWheelDynamicsService
```

The base contract owns only world construction, stepping, metrics, debug
geometry, and disposal. Rapier implements the raycast capability. Box3D
implements the physical-wheel capability. Both return `DynamicsVehicle`.

This is the durable result even if the Box3D package is later removed.

## Dependency and wrapper evidence

- Exact package: `box3d-wasm@0.2.0`
- Registry creation/modification: 2026-07-02
- Unpacked package size: 1,172,925 bytes
- Lock integrity:
  `sha512-cvju1RYCTeChr+CUc2Sh+EsFaypP+6SSlNNSuf4Y3+e4nUFu1O25xQLZTBVUqp1+Wn4Xa2fA4cxrtLzLoWOk4A==`
- Variant used: standard single-thread build
- TypeScript declarations: project-owned narrow declaration, because the
  package supplies none
- Native recording bindings: not exposed by the reviewed wrapper surface
- Lifecycle: adapter owns world, body, shape, and joint handles and deletes them
  explicitly

The production build reports the wrapper's conditional Node
`import("module")` as browser-externalized. The production browser route was
loaded after the build with zero console errors, so this is recorded wrapper
friction rather than a runtime failure.

## Measured build output

Production client output:

| Artifact              |         Raw |      Gzip |
| --------------------- | ----------: | --------: |
| Box3D WASM            |   520.91 kB | 214.73 kB |
| Box3D adapter chunk   |    31.97 kB |  12.04 kB |
| Rapier WASM           | 1,570.17 kB | 592.53 kB |
| Rapier adapter chunk  |   190.52 kB |  34.49 kB |
| Shared Three.js chunk |   548.69 kB | 138.99 kB |

These are artifact sizes, not a full cold-network comparison. Field 02,
Rapier, and Box3D remain separate entry/dynamic chunks.

## Verification

### Tier 2

`npm test`

- 102/102 root tests passed.
- 7/7 deterministic-kernel probe tests passed.
- Box3D tests prove physical-wheel motion, same-runtime scripted
  repeatability, complete assembly capture/restore, and disposal.
- Rapier tests remain green.

`npm run typecheck`

- root TypeScript check passed;
- deterministic-kernel probe TypeScript check passed.

The test harness now runs simulation files serially. During the first full run,
a Playwright Chrome GPU process was consuming most available CPU and caused
unrelated terrain/state plus both solver suites to exceed the unchanged
five-second per-test limit. After the browser daemon was shut down, the same
102 tests passed in 6.26 seconds. The five-second assertion timeout was not
raised.

### Tier 3

`npm run build`

- server and three client entries built successfully;
- Box3D WASM emitted as a separate artifact;
- production preview loaded the Box3D route and browser-readable state with
  zero console messages.

`npm run test:box3d-lab`

- Box3D `0.1.0 / box3d-wasm 0.2.0`;
- physical-wheel family;
- 13 bodies and 13 shapes (eight static fixtures plus five rig bodies);
- four wheel proximity contacts after settling;
- positive throttle advanced `+7.96 m` along world `z`;
- steering rotated chassis heading;
- all six camera policies selected;
- complete reset passed;
- 390 × 844 layout passed without telemetry/touch overlap;
- zero console warnings/errors.

`npm run test:physics-lab`

- Rapier route, surface traversal, capture/reset, six cameras, narrow layout,
  and console health passed after the shared-runner change.

`npm run test:browser`

- canonical Field 02 cargo, three-rig, camera, persistence, performance, narrow
  controls, and console workflow passed.

The Field 02 acceptance runner, Vite development server, and requested live
browser surface now share the canonical port `4173`.

### Tier 4

Visually inspected:

- [desktop chase](assets/box3d-probe-01-desktop.png);
- [top-down](assets/box3d-probe-01-top-down.png);
- [narrow chase](assets/box3d-probe-01-narrow.png).

The bright nose and lights make forward direction legible. The chase camera is
behind the rig. Top-down clearly shows heading. Narrow telemetry, controls, and
touch targets remain readable.

## Collision, minimap, and related exploration

The expanded comparison programme now covers:

- semantic collision categories/masks;
- blocking, felling, triggers, sensors, hazards, cargo, and attachments;
- CCD/tunnelling and recovery;
- terrain/prop camera obstruction;
- persistent, simulation-local, and presentation coordinate transforms;
- minimap marker/heading fidelity across capture, origin shift, and chunk
  boundaries;
- terrain heightfields, meshes, compounds, and material identity;
- chunk activation/unload and stable entity IDs;
- physical feedback/audio extraction;
- project replay checkpoints plus optional solver-native diagnostics.

The current authored game collision remains the canonical tree/rock behavior.
Box3D Probe 01 does not yet reproduce that behavior. Its displayed wheel
contact count is an AABB ground-proximity estimate, not a persistent native
contact query or category/mask proof.

## Known gaps and hardening paths

1. **No like-for-like solver verdict**
   - Gap: raycast Rapier and physical-wheel Box3D answer different controller
     questions.
   - Path: implement the same semantic collision/attachment scenario in both;
     then add Jolt only against an explicit controller requirement.

2. **Collision semantics are not integrated**
   - Gap: solver-native contacts do not yet produce project roles.
   - Path: implement the existing category/mask contract with rock, tree,
     trigger, sensor, hazard, attachment, and CCD cases.

3. **Minimap/world-frame integration is not implemented**
   - Gap: the lab exposes solver position but has no persistent/simulation frame
     transform or map inset.
   - Path: implement the new minimap/world-coordinate contract and round-trip
     tests.

4. **Box3D recording is unavailable through the wrapper**
   - Gap: native recording/replay is not bound.
   - Path: submit/own a narrow upstream binding or build a reviewed project
     wrapper; keep project semantic replay authoritative.

5. **Wrapper maturity**
   - Gap: unofficial package, no types, very young release/adoption history.
   - Path: pin exact integrity, monitor upstream, audit wrapper SHA and lifecycle,
     and keep removal cheap.

6. **Contact telemetry is approximate**
   - Gap: wheel proximity uses shape AABBs and a flat-ground threshold.
   - Path: bind/query persistent contacts or maintain event-backed contact state;
     validate ramps and non-flat terrain.

7. **Performance evidence is local**
   - Gap: one machine and warm/local transfer; no representative mobile or cold
     network profile.
   - Path: run a device/browser matrix with cold transfer, compile/init, memory,
     long-session lifecycle, and 30/60/120 Hz scenes.

## Three review passes

### Pass 1 — immediate correctness and completeness

- Corrected the stale “no npm package” statement.
- Caught and fixed the physical wheel-axis sign.
- Caught and fixed telemetry mutation during reads.
- Caught and fixed physical assembly reset tolerance in browser automation.
- Caught and fixed narrow header/telemetry overlap.
- Confirmed forward direction, steering, braking path, six views, restore,
  disposal, and console health.

### Pass 2 — architecture and long-term viability

- Removed raycast creation from the universal service.
- Kept Box3D isolated behind project-owned types and a dynamic route.
- Preserved semantic intent, presentation extraction, saves, activities, and
  Field 02 authority.
- Connected collision, minimap, camera, streaming, feedback, and replay to one
  comparison map instead of creating separate engine-owned systems.
- Confirmed no duplicate product runtime or save pipeline was introduced.

### Pass 3 — rule compliance and supervision readiness

- ADR and acceptance contract were updated before/following implementation.
- Official/primary sources and package metadata were checked.
- Exact package version and integrity are recorded.
- Tests, typecheck, build, all three browser workflows, screenshots, known
  gaps, and evidence ceilings are explicit.
- No commit, push, branch, deletion, deployment, or system-wide Emscripten
  install was performed.
- Parallel/unrelated local work remains uncommitted and was not discarded.

## Acceptance value

- **Player value:** a second real physics family is playable with correct
  forward framing, six views, narrow controls, and visible telemetry.
- **Team/product value:** the project can compare meaningful vehicle fantasies
  without letting one solver or tractor define the universe.
- **Internal/operational value:** exact dependency provenance, capability-based
  ports, deterministic tests, browser hooks, screenshots, metrics, rollback,
  and open gates make the experiment auditable and removable.

## Files and artifacts

Core implementation:

- `box3d-lab.html`
- `src/dynamics/box3d-dynamics.ts`
- `src/dynamics/box3d-dynamics.test.ts`
- `src/dynamics/contracts.ts`
- `src/dynamics/rapier-dynamics.ts`
- `src/types/box3d-wasm.d.ts`
- `src/physics-lab/config.ts`
- `src/physics-lab/main.ts`
- `src/physics-lab/styles.css`
- `physics-lab.html`
- `vite.config.ts`
- `vitest.config.ts`
- `package.json`
- `package-lock.json`

Verification and documentation:

- `tools/box3d-lab-browser-acceptance.cjs`
- `tools/README.md`
- `README.md`
- `docs/decisions/ADR-0017-replaceable-dynamics-foundation.md`
- `docs/plans/BOX3D_BROWSER_COMPARISON_01_2026-07-25.md`
- `docs/research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md`
- `docs/research/MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md`
- `docs/exploration/EXPLORATION_MAP.md`
- this acceptance record
- three Box3D screenshots under `docs/reviews/assets/`

## Anything else?

Yes. Box3D materially improves the shortlist, but the strongest conclusion is
architectural: solver comparison should continue while the product architecture
keeps moving. Collision, mapping, activities, cameras, persistence, and replay
must consume project semantics. A solver can win a controller family without
winning the whole universe.
