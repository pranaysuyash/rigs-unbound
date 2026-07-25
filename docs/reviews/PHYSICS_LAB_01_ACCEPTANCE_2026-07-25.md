# Physics Lab 01 acceptance

- Date: 2026-07-25
- Status: locally accepted
- Risk class: medium local runtime and dependency change
- Evidence ceiling: Tier 4 local browser observation
- Decision: [ADR-0017](../decisions/ADR-0017-replaceable-dynamics-foundation.md)
- Plan: [Physics Lab 01](../plans/PHYSICS_LAB_01_2026-07-25.md)

## Exact user-facing behavior changed

- A dedicated Physics Lab is available from Field 02 and at
  `/physics-lab.html`.
- The lab contains a real dynamic chassis with four Rapier raycast wheels.
- `WASD`, arrow keys, Space, Shift, and touch controls become normalized
  throttle, steering, brake, and handbrake intent.
- The vehicle responds differently on asphalt, gravel, mud, and ice.
- The vehicle's bright nose and headlamps identify its front, and positive
  throttle moves that front toward visual positive Z.
- Players can select Chase, Hood, Side, Tactical, Top-down, and Survey views
  directly, or cycle them with `C`.
- Players can pause, reset, expose collider debug geometry, choose 30/60/120 Hz
  physics, and choose 0.5×/1×/2× laboratory time.
- Telemetry reports speed, slip, wheel contact, solver step cost, frame rate,
  bodies, colliders, surface profile, and recovery count.
- Automatic recovery returns an escaped or fallen chassis to a plain-data reset
  capture.

## Value delivered

- **Player value:** vehicle direction, wheel contact, surface response, camera
  choice, and recovery are directly playable and legible.
- **Product/team value:** a second, solver-backed motion implementation now
  tests the Rigs Unbound portability thesis without turning one vehicle or
  solver into the product architecture.
- **Internal/operational value:** fixed-step, capture/restore, surface, contact,
  loading, rendering, and console evidence are browser-queryable and
  repeatable.

## Architecture outcome

The dependency direction is:

```text
input source
  -> normalized VehicleIntent
  -> project-owned DynamicsVehicle
  -> Rapier adapter
  -> project-owned telemetry/capture
  -> Three.js presentation and browser evidence
```

`src/dynamics/contracts.ts` exposes plain objects only. Rapier imports and
handles remain in `src/dynamics/rapier-dynamics.ts`. The renderer receives
extracted body/wheel state. Laboratory world data receives a
`DynamicsService`, not the Rapier implementation. The Field 02 entry does not
import the laboratory entry or Rapier adapter.

This is a bounded wheeled-controller family. It is not a universal controller
for tracked rigs, bicycles, hovercraft, boats, aircraft, spacecraft, or fantasy
machines.

## Adjacent Activity Expansion audit

The current code was checked against the continuing ChatGPT architectural
checklist rather than adopting its wording as unquestioned truth.

Verified by static pattern search:

- no repeated `activeRig === "tractor"`, `vehicle.type === "tractor"`,
  `TractorController`, or `UniversalVehicleController` path exists in shared
  runtime code;
- named camera policies remain in the shared camera vocabulary;
- ground and hover mobility are already bounded adapters in Field 02;
- the Physics Lab consumes `VehicleIntent` and `DynamicsService`;
- capability-gated plough behavior has an explicit negative test;
- the only direct tractor handling found in shared state recovery is the
  bounded migration from a historical tractor-only save.

The existing shared cargo relay already supplies the adjacent towing/delivery
evidence across Torque, Spark, and Drift. Physics Lab 01 adds a different kind
of evidence: the same semantic input and camera vocabulary can drive a
solver-backed chassis without replacing that activity or save architecture.

## Files in the implementation slice

### Runtime and tests

- `src/game/vehicle-intent.ts`
- `src/game/vehicle-intent.test.ts`
- `src/dynamics/contracts.ts`
- `src/dynamics/rapier-dynamics.ts`
- `src/dynamics/rapier-dynamics.test.ts`
- `src/physics-lab/config.ts`
- `src/physics-lab/main.ts`
- `src/physics-lab/renderer.ts`
- `src/physics-lab/styles.css`
- `physics-lab.html`
- `index.html`
- `src/styles.css`
- `vite.config.ts`
- `vitest.config.ts`
- `package.json`
- `package-lock.json`

### Decisions, plans, research, and project truth

- `docs/decisions/ADR-0009-bounded-mobility-adapters.md`
- `docs/decisions/ADR-0017-replaceable-dynamics-foundation.md`
- `docs/research/BROWSER_VEHICLE_PHYSICS_TECHNIQUE_CATALOG_2026-07-25.md`
- `docs/plans/PHYSICS_LAB_01_2026-07-25.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `README.md`
- `tools/README.md`
- `docs/WORKLOG.md`
- `progress.md`
- this acceptance record

### Intentional visual-QA artifacts

- `docs/reviews/assets/physics-lab-01-desktop.png`
- `docs/reviews/assets/physics-lab-01-top-down.png`
- `docs/reviews/assets/physics-lab-01-debug.png`
- `docs/reviews/assets/physics-lab-01-narrow.png`

These are review evidence, not production art.

## Current focused evidence

The first browser acceptance run passed:

- Rapier 3D `0.19.3`;
- four wheel contacts after settlement;
- positive throttle moved Z from approximately `-52` to `-44.49`;
- forward speed reached approximately `40.3 km/h` in the short proof run;
- steering reached the raycast wheels and changed chassis yaw;
- asphalt, gravel, mud, and ice were all traversed;
- surface friction-slip values were ordered `4.5`, `2.65`, `1.28`, `0.52`;
- all six camera modes were directly selected;
- 120 Hz selection and plain-data reset capture passed;
- first controllable was approximately `141 ms` in the final warm local run;
- physics step was approximately `0.10 ms`;
- the frame used `43` draw calls and `1,236` triangles;
- the `390 × 844` layout had no telemetry/touch overlap;
- zero console warnings, console errors, or page errors.

Measurements describe one local Chrome run. They are not a representative
device budget, public deployment result, or player-feel claim.

## Visual review

- Desktop chase makes the bright front nose and headlamps readable.
- Top-down makes route, ramp, cones, and vehicle heading readable.
- Debug geometry exposes chassis/collider bounds without hiding the rig.
- Narrow capture keeps telemetry, camera/frequency/time controls, and touch
  controls separate.
- The lab reads as an evidence fixture rather than a farming, racing, or
  tractor-specific game.

## Multi-pass review

### Pass 1 — immediate correctness and completeness

- Focused intent and dynamics tests passed.
- Typecheck and the production multi-page build passed.
- Browser acceptance passed direction, steering, surfaces, cameras, frequency,
  reset, narrow layout, and console-health checks.
- Four screenshots were inspected.

### Pass 2 — architecture and long-term viability

- Rapier types remain within one adapter.
- Plain project-owned capture data contains no solver handles.
- Physics Lab is a separate Vite entry, so its WebAssembly is not part of the
  Field 02 entry graph.
- Camera policies and semantic intent are reused.
- No universal vehicle controller or tractor-name-gated shared behavior was
  introduced.
- Jolt remains an evidence-gated comparison rather than a parallel product.

### Pass 3 — compliance and supervision readiness

- The full 92-test root suite, seven-test kernel suite, asset tests, typecheck,
  formatting, production build, Physics Lab acceptance, and existing Field 02
  acceptance passed.
- ADR, plan, research, exploration, tool, worklog, progress, and acceptance
  surfaces were aligned in the same pass.
- No deletion, branch, stash, reset, checkout, rebase, or history rewrite was
  performed.

## Commands and outcomes

- `/Users/pranay/Projects/agent-start --project /Users/pranay/Projects/Game_dev/rigs-unbound --skip-index`
  - loaded and refreshed the canonical project context before implementation.
- `npm test`
  - passed 92 root tests and seven deterministic-kernel tests.
- `npm run typecheck`
  - passed for the root project and deterministic-kernel probe.
- `npm run test:assets`
  - passed five asset-manifest/GLB preflight tests.
- `npm run format:check`
  - initially identified four new physics files, then passed after formatting
    those exact files.
- `npm run build`
  - passed the server and client production builds.
  - emitted separate Field 02 and Physics Lab entries plus a separately
    referenced 1,570.17 kB raw / 592.53 kB gzip Rapier WASM asset.
  - retained the known advisory for the 548.69 kB shared Three.js chunk.
- `RIGS_PHYSICS_LAB_URL=http://127.0.0.1:4173/physics-lab.html?acceptance=physics-lab-final npm run test:physics-lab`
  - passed direction, steering, four surfaces, six cameras, debug, 120 Hz,
    reset, narrow layout, and console/page-error assertions.
- `RIGS_UNBOUND_URL=http://127.0.0.1:4173/?acceptance=field-02 npm run test:browser`
  - passed the existing cargo, buggy, hover, perception, reduced-motion,
    save/reload, camera, narrow layout, performance, and console/page-error
    regression chain.
- static pattern audit with `rg`
  - found no repeated shared-runtime tractor-name branch or universal
    controller; the direct tractor path is bounded to legacy save migration.

## Verified versus inferred

Verified:

- intent normalization and invalid-input clamping;
- fixed-step chassis movement;
- same-runtime deterministic replay;
- project-owned capture and restore;
- production build separation;
- local browser direction, steering, surface traversal, camera selection,
  reset, debug, narrow layout, and console health;
- reviewed screenshots and live port-4173 route.

Inferred:

- the handling profiles communicate the desired vehicle fantasy;
- Rapier will remain the best solver after articulation and load tests;
- the current local metrics fit representative low-end devices;
- players will understand the laboratory without external observation.

## Known gaps and hardening paths

1. **Player feel is unproven.**
   - Closure: blinded external tests comparing descriptions of a light buggy,
     utility tractor, and later articulated rig.
2. **Representative-device performance is unproven.**
   - Closure: cold-cache desktop and mobile-safe profile runs recording WASM
     transfer/compile, first control, average/p95 frame, memory, thermal, and
     battery behavior.
3. **Articulated capability behavior is unproven.**
   - Closure: unstable towable trailer plus motorized excavator arm tied to one
     rescue, construction, or recovery activity.
4. **Cross-session solver state is deliberately absent.**
   - Closure: first define replay/save authority boundaries; then version
     project-owned captures without persisting raw Rapier snapshots or handles.
5. **Determinism evidence is bounded.**
   - Closure: compare reloaded executions, browsers, build modes, and supported
     CPU targets; report divergence rather than promising universal parity.
6. **Raycast wheels cover one controller family.**
   - Closure: add balance, tracked, buoyancy, flight, or six-degree adapters
     only when a concrete rig fantasy requires each seam.
7. **The shared Three.js chunk still triggers the existing Vite size advisory.**
   - Closure: measure cold-cache cost before deciding whether renderer
     decomposition or chunk policy is justified.

## Preservation and local state

- Unrelated and parallel work was preserved.
- A parallel process updated `main` during implementation and included the
  dynamics contracts, adapter, tests, configuration, and ADR in commit
  `aa82cee`; this task did not create or push that commit.
- Remaining Physics Lab entry, UI, acceptance, screenshots, and documentation
  changes are local until the user reviews repository state.
- The Field 02 acceptance refreshed its four existing visual-QA screenshots.
- Parallel untracked research contracts and playtest scripts were preserved and
  were not claimed as Physics Lab implementation work.
- No file was deleted or moved.

## Follow-up decision

No decision is required to use the local lab. The next meaningful solver choice
is whether to authorize the articulated towing/lifting experiment after this
baseline remains green. That should be judged by vehicle fantasy, replay,
recovery, and measured cost—not by a falling-cubes benchmark.

## Anything else?

The lab proves that the solver boundary is executable. It does not prove that
the abstraction is final. Every future physics slice must continue checking the
Adjacent Activity Expansion seams and must be willing to revise the contracts
when a genuinely different rig exposes a false shared assumption.
