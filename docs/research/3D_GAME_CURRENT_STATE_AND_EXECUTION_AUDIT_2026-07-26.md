# Rigs Unbound 3D Game Current-State and Execution Audit (2026-07-26)

## Purpose

This is the current evidence-backed companion to the earlier 3D game, 3D web,
physics, asset, capability, persistence, performance, and loading contracts.
It records what is live now, what is architectural truth, what was verified in
the browser, and what should happen next without turning future platform ideas
into speculative implementation.

The governing product direction remains: build a durable machine-and-world
simulation platform, while preserving a focused first playable experience.
The tractor is the initial playable rig, not the permanent product identity.

## Skills and evidence sources used

- `3d-games`: culling, LOD, shader/material boundaries, camera contracts,
  collision layers, simulation architecture, streaming, ECS tradeoffs,
  persistence, observability, and authority scaling.
- `3d-web-experience`: browser delivery, progressive loading, mobile layout,
  accessibility, performance budgets, runtime fallback, and diagnostics.
- `Browser Daemon`: desktop, narrow mobile, developer, Physics Lab, and Box3D
  browser inspection.
- `3d-asset-production`: runtime asset provenance, GLB inspection, manifest
  validation, licensing, and public-runtime approval boundaries.

Existing source documents were treated as dated hypotheses or decisions. Code,
the current browser, and command output are the current source of truth.

## Current architecture reality

| Area | Current truth | Evidence tier | Disposition |
|---|---|---:|---|
| Player path | Field 02 on port 4174 is the canonical player-facing path. | 4 | Preserve |
| Gameplay simulation | `src/game/physics.ts` owns the fixed-step ground and hover adapters. | 1 | Preserve and extend by proof |
| Renderer boundary | Simulation state and telemetry feed the renderer; renderer-only diagnostics do not own gameplay state. | 1 and 4 | Preserve |
| Dynamics experiments | Rapier and Box3D implement project-owned dynamics contracts for isolated lab surfaces. | 1 and 4 | Keep replaceable and lab-scoped |
| Locomotion | Ground and hover are bounded discriminated adapters with explicit mismatch errors. | 1 | Do not add a universal adapter yet |
| Capabilities | Rig profiles compose capabilities and modules; the affordance resolver is versioned and deterministic. | 1 | Preserve; prove a third real offer before generalizing further |
| Activities | Cargo relay and survey route are the first two real capability-consuming activity seams. | 1 and browser path inspection | Preserve the two-activity proof; generalize only after a third materially different offer |
| Persistence | Versioned keys v1-v6, seed peek before world construction, state/world-memory restore, migration and invalid-payload recovery. | 1 | Add structured event observability only when the next workflow needs it |
| Assets | Manifest and preflight enforce path, GLB, external-URI, hash, and approval rules. | 1 and 4 | Keep unapproved assets off the public player path |
| Runtime fallback | Standard profile is selected from frame metrics and resource pressure. | 1 and 4 | First-input and first-controllable latency remain observations, not fallback causes |
| Streaming | The repo has a streaming/residency contract, but no measured need for a full world streamer is established by this audit. | 1 | Defer until world scale or memory pressure proves it |
| Multiplayer authority | Separation seams exist conceptually through commands, state, events, and persistence, but no shared-world authority runtime exists. | 1 | Defer until a real shared-state feature exists |

## Live browser evidence

### Field 02, desktop

- `http://127.0.0.1:4174/` loaded with the correct title and welcome shell.
- The canvas and controls were present, `aria-busy=false`, and no application
  console or page errors were observed.
- After entering the field, the browser exposed deterministic state, active rig,
  terrain telemetry, world memory, run record, and performance diagnostics.
- A healthy run observed approximately 120 FPS with average frame time below
  9 ms and p95 frame time below 10 ms after the field was entered.

### Runtime-profile semantics regression

The previous policy treated delayed `firstControllableMs` as a reason to select
a fallback profile. That was incorrect: this metric includes player-controlled
welcome dwell and is an acceptance marker, not renderer pressure.

The current policy uses frame samples, average frame time, p95 frame time, and
resource pressure for profile selection. `firstInputReadyMs` and
`firstControllableMs` remain visible observations.

Fresh browser evidence after the fix:

- before Enter: standard profile, approximately 126 FPS, average frame time
  approximately 7.9 ms, no controllable marker yet;
- after a deliberately delayed Enter: standard profile, approximately 120 FPS,
  average frame time approximately 8.3 ms, p95 approximately 9.3 ms,
  `firstControllableMs` approximately 7.7 s, no fallback reasons;
- only Vite debug logs were observed in the console.

This is Tier 4 manual browser evidence for the semantic separation. The exact
latency remains useful for product acceptance, but it is no longer allowed to
misclassify a healthy render profile.

### Narrow mobile viewport

At `390x844`:

- `scrollWidth` equalled `clientWidth`;
- touch controls were visible and fit within the viewport;
- the welcome panel fit without horizontal overflow;
- the map overlay opened and fit the viewport, with a map canvas of roughly
  `336.8px` square.

This is Tier 4 layout evidence for the inspected viewport, not full device or
responsive certification.

### Physics Lab 01

- `http://127.0.0.1:4173/physics-lab.html` loaded the Rapier 3D lab with solver,
  speed, slip, wheel contact, physics time, frame time, bodies, colliders,
  camera, and time-scale controls.
- The lab remains an evidence fixture and is not a second player-facing game.

### Box3D Probe 01

- `http://127.0.0.1:4173/box3d-lab.html` loaded the reviewed single-thread
  Box3D standard build.
- The page showed Box3D and Box3D-WASM versions, four-wheel proximity, solver
  controls, and body/shape counts of `13/13`.
- Dispatching throttle input for two seconds produced approximately `54.4
  km/h`, approximately `19%` slip, `4/4` wheel proximity, approximately `0.10
  ms` physics time, and `120 fps`.

This is Tier 4 evidence that the physical-wheel probe responds to input. It is
not evidence that Box3D has replaced the canonical Field 02 traversal model.

### Developer surface and runtime asset bridges

On `http://127.0.0.1:4174/?surface=developer`:

- `body.dataset.surface` was `developer`;
- both reviewed bridge assets loaded successfully;
- asset statuses were `loaded` with fallback false;
- diagnostics showed approximately 120 FPS, 49 draw calls, two loaded bridges,
  and no fallback.

The player-facing path intentionally did not expose unapproved bridge assets.
This is the correct provenance boundary while public runtime approval remains
false in the manifest.

## Physics and locomotion findings

### What is sound

- `src/game/physics.ts` is deterministic, fixed-step, and project-owned.
- Ground motion derives contact, pitch, roll, grip, grade, traction, slip,
  suspension, water depth, towing, boundary behavior, strain, and telemetry.
- Hover motion is a distinct adapter with cushion pressure, clearance, water
  support, slope penalty, steering authority, and its own telemetry.
- Adapter lookup is bounded and validates profile/state mobility agreement.
- Rapier uses a raycast-vehicle service; Box3D uses a physical-wheel service.
- Both services expose plain project-owned capture state rather than leaking
  solver handles into durable game saves.

### What is not yet proven

- No production decision has been made between Rapier, Box3D, or another solver.
- No cross-engine parity contract has been established; the two lab services
  have different wheel models and telemetry fidelity.
- The formal terrain and water fallback envelope remains only partly policyized.
- There is no browser acceptance proof for long-duration physics stability,
  repeated recovery, or save/restore continuity across both lab engines.

### Correct next physics step

Do not rewrite the canonical simulation or replace the solver based on a single
probe. Create one measured cross-mode acceptance fixture that compares the
project-owned semantics, not internal solver details:

1. spawn and settle;
2. throttle and brake response;
3. steering sign and heading response;
4. surface change and slip visibility;
5. capture and restore;
6. dispose and recovery behavior;
7. frame and physics-time budgets.

The fixture should report engine-specific limitations explicitly instead of
forcing false parity.

## Capabilities, affordances, activities, and content

The current shape is intentionally narrow and healthy:

- `RigProfile.capabilities` is the canonical composed claim;
- modules add capabilities and tune physical traversal envelopes;
- `resolveAffordance()` distinguishes unavailable world state, missing machine
  capability, and out-of-range deferred interaction;
- the cargo relay and survey route are the first two real world offers
  consuming this boundary;
- the primary-action path validates a versioned command rather than allowing UI
  code to mutate state directly;
- authored world references remain code-owned while the content set is small.

The next architectural gate is not a universal JSON capability interpreter. It
is a third independently useful world offer or activity that reuses the same
resolver and exposes one additional constraint. Only shared constraints should
be generalized after that proof.

Do not claim that every button is already an affordance, do not route activity
eligibility through rig names, and do not let generated content mutate world
state without schema, semantic, budget, and reachability validation.

## Persistence and recovery

The live storage boundary currently provides:

- versioned save keys through schema v6;
- a seed peek before constructing the world;
- state and bounded world memory written and restored together;
- migration from older keys and schema shapes;
- invalid-payload recovery into a clean current state;
- source key, source schema version, world-memory presence, recovery reason,
  save key, schema version, byte count, and duration in the storage results.

The remaining gap is not basic save safety. It is a first-class persistence
event envelope with reason codes and a durable event history for success,
migration, recovery, and failure. That should be added when a real operator or
replay workflow needs it, rather than creating a second event pipeline now.

## Asset and delivery posture

`assets/asset-manifest.json` currently contains four entries:

- two concept/reference generated-image assets with no runtime path and no
  public-runtime approval;
- two Kenney CC0 runtime-tested GLB bridge assets with runtime paths, license
  metadata, and digest fields, but still no public-runtime approval.

`npm run assets:preflight && npm run test:assets` passed with zero findings and
seven asset tests passing. The manifest and preflight are the canonical asset
provenance path. Do not copy assets into the public player path outside this
manifest.

The next asset decision is product/legal approval of the specific bridge assets,
not more loader code. Until then, keep them on the developer/evidence surface.

## Priority execution order

### P0: already landed and now protected

- Keep first-input and first-controllable latency separate from render-profile
  fallback selection.
- Preserve Field 02 as the canonical player path.
- Preserve project-owned dynamics, capability, persistence, and asset contracts.

### P1: next implementation slice

- Add a third materially different activity or world offer using the existing
  capability and affordance resolver.
- Define the first shared constraint proven by the matched offers.
- Add focused tests and one browser proof for legal, deferred, unavailable,
  and missing-capability outcomes.

### P2: next evidence slice

- Build the cross-engine physics acceptance fixture described above.
- Capture save/restore and recovery continuity in the same fixture.
- Record long-duration frame, physics, memory, and fallback measurements.

### P3: conditional platform work

- Version typed activity/content definitions after the third consumer.
- Add structured command/event persistence when replay, AI, or authority needs
  it.
- Add streaming only after measured world residency or memory pressure.
- Add shared-world authority only when a real shared-state feature exists.

## Explicit non-goals for this phase

- No full ECS migration.
- No universal plugin marketplace or arbitrary runtime scripting.
- No speculative multiplayer backend.
- No Box3D replacement of the canonical traversal model.
- No public approval claim for unapproved assets.
- No shader rewrite before measured visual or GPU pressure.
- No renderer-owned mutation of authoritative simulation state.

## Three review passes

### Pass 1 - immediate correctness and completeness

The live player path, mobile viewport, physics labs, developer surface, runtime
profile behavior, asset preflight, capability boundary, and persistence boundary
were all inspected. The first-controllable fallback misclassification was fixed
and regression-tested. Remaining unknowns are listed rather than implied away.

### Pass 2 - architecture and long-term viability

The current design has one canonical owner for gameplay motion, one canonical
owner for rig-local animation channels (`vehicleAnimationSystem`) with an
explicit reserved `ClipActionBindings` contract for future authored clips, one
project-owned dynamics contract for replaceable lab services, one
capability-affordance resolver, one persistence boundary, and one asset
manifest/preflight path. The recommended next steps are gated by second-use
evidence and measured pressure, which avoids both improvised coupling and
architecture theatre.

### Pass 3 - rule compliance and handoff readiness

Evidence tiers are stated. Runtime claims are separated from static inference.
Unapproved assets, unproven cross-engine parity, incomplete physics envelopes,
and absent authority runtime are explicit open items with closure triggers.
This document links the current decision and existing contracts instead of
creating parallel truth sources.

## Validation record

The following checks passed during this audit sequence:

- `npx vitest run src/game/runtime-profile-policy.test.ts src/game/performance.test.ts src/game/replay-retention.test.ts src/game/run-record.test.ts`
  - 4 files, 17 tests passed.
- `npm run typecheck`
  - root TypeScript and deterministic-kernel probe typecheck passed.
- `npm run assets:preflight && npm run test:assets`
  - zero asset findings; 7 asset tests passed.
- Browser Daemon inspection of Field 02, narrow mobile, developer surface,
  Physics Lab 01, and Box3D Probe 01 produced the Tier 4 observations above.

The full suite and build remain a final acceptance step after the current audit
documentation and any next implementation slice are stable.

## Remaining gaps and closure criteria

| Gap | Current status | Closure criteria |
|---|---|---|
| Third capability-consuming offer/activity | Open by design | Two independent offers already exist; a third materially different offer must share a proven constraint and browser/test proof exists |
| Cross-engine parity | Open | Shared project-semantic fixture reports comparable outcomes and explicit engine limitations |
| Terrain/water fallback envelope | Review | Named policy covers slope, water, recovery, and player-visible diagnostics |
| Structured persistence events | Deferred | Replay/operator workflow requires durable reason-coded event history |
| Public asset approval | Review | Asset owner confirms license/provenance and manifest approval fields are updated |
| Long-duration performance/memory proof | Open | Recorded soak evidence across standard/mobile-safe profiles |
| Full device/accessibility certification | Unknown | Real target-device/browser matrix and assistive-technology pass completed |
| Multiplayer authority | Deferred | A real shared-state feature creates an authority requirement |

## Anything else?

Yes. The most important strategic finding is that Rigs Unbound already has the
beginnings of the right platform shape, but its value depends on preserving
boundaries while adding real second consumers. The next best move is therefore
not to add more engine categories. It is to make one more activity consume the
existing contracts, measure the shared behavior, and let that evidence decide
which abstractions deserve to become permanent.

The trailer and public build-in-public communication work should stay in the
separate `docs/comms/` lane. It can proceed once the next public-facing build
has a truthful feature/evidence list; it should not drive speculative engine
work or make unverified performance, asset, or multiplayer claims.

## Addendum (2026-07-26) - parallel-agent hold and current test convergence

The repository is being developed with parallel agents as a normal workflow.
During convergence, `src/game/contracts.ts` changed while this audit was in
progress. Per the project operating rule, that parallel-sensitive profile file
was not overwritten. A re-check found the authored `toy-buggy` capability claim
currently restored to `tow` plus `jump`, which keeps the cargo relay contract
coherent.

The current focused validation result is:

- replay validator, terrain, cargo relay, and the related state tests pass;
- one state fixture remains red because the buggy does not yet travel farther
  than the tractor after the same 180-step open-route input sequence;
- the likely closure belongs to rig-profile tuning, but that file is held until
  the parallel edit settles rather than being silently overwritten here.

This is a deliberate temporary hold, not a completion claim. The return gate is
to re-read the current profile, compare it with the authored handling contract,
adjust the smallest first-principles tuning value that restores both facts -
tractor pulls harder from rest and buggy wins on open ground - then rerun the
state, physics, full suite, build, and browser acceptance checks.

## Addendum (2026-07-26) - keyboard acceptance focus boundary

The first-rung browser acceptance initially reported a nearest distance of
18.11 m, meaning the rig did not move at all. This was not treated as evidence
that the salvage target, stopping radius, terrain, or physics should be relaxed.

Evidence gathered before the harness change:

- Tier 4 live Browser Daemon replay on the public `applyRigInput` boundary
  reached the authored target region in 27 controlled steps, with nearest
  distance 4.13 m.
- A standalone Playwright keyboard replay on a fresh context reached nearest
  distance 3.82 m using the same W/A/D steering policy as the acceptance tool.
- The multi-context acceptance runner was the only path that left the first-rung
  keyboard driver stationary, after opening and closing adjacent player and
  developer contexts.

The acceptance helper now brings the first-rung page to the front and focuses
its canvas before the real-key proof. This is a test-harness reliability fix,
not a gameplay workaround. The contract remains: real W/A/D input, the
authored target, and the existing 4.2 m stopping radius.

The next acceptance attempt exposed a separate transient Playwright/Vite
navigation race while reading the public snapshot. The harness state helper now
retries only that specific execution-context replacement, up to three attempts,
and still fails on a closed page, an unrelated error, or a repeated navigation.

The following reproduction isolated the remaining stationary keyboard run to
the acceptance runner's unconditional `slowMo: 18` setting in headless Chrome:
the same multi-context W/A/D replay advanced normally with slow motion disabled.
Slow motion is now an explicit `RIGS_BROWSER_SLOW_MO` opt-in for supervised
visual debugging, while the default acceptance path remains a real keyboard
replay with deterministic timing. A final focused reproduction showed that
calling `focus()` on the canvas or `bringToFront()` suppresses headless keyboard
stepping in this runner. The harness therefore leaves Playwright's normal
page-targeted keyboard path intact.

The subsequent run reached the first cache and then failed on the return-home
leg with no displacement. A clean-preview attempt could not be promoted to
acceptance evidence because the generated `dist/client` asset filenames changed
under the parallel workspace and the preview served a stale module reference.
The live dev server also exposed HMR-only runtime failures
(`isWithinSiteServiceArea`, `frameDurationMs`, and runtime asset-entry globals)
while the current static source still typechecks through the corresponding
boundaries. These are convergence blockers, not grounds to weaken the
return-home proof.

The release build currently compiles TypeScript and Vite but fails the final
player-build asset assertion because the two runtime bridge identities are not
approved in the manifest. This remains an explicit approval/provenance gate.

The fresh-server boot failure had a separate canonical projection defect: the
Vite manifest projection typed and injected only identity, path, and approval,
dropping `runtimePresentation` before `runtime-assets.ts` validated it. The
projection now preserves the manifest-owned presentation contract. This does
not approve either bridge asset or change the player/developer filter.

The final Field 02 attempt reached the salvage return-home flow but timed out
when the recommended workshop button was expected to become visible. The
isolated server recorded a parallel `src/game/renderer.ts` reload during that
run, so this attempt is not promoted to clean browser evidence. The remaining
acceptance closure is to rerun on a stable server after parallel renderer/main
edits settle, then verify workshop visibility, module fit, save/reload, mobile
layout, and console-error assertions end to end.

## Addendum (2026-07-26) - post-edit verification record

Post-edit checks completed after the Vite manifest projection repair:

- `npm test`: 27 Vitest files, 215 tests, and 7 deterministic-kernel probes
  passed.
- `npm run typecheck`: root and deterministic-kernel typechecks passed.
- `npm run assets:preflight && npm run test:assets`: zero manifest findings and
  9 asset tests passed.
- Clean-server `npm run test:physics-lab`: passed movement, four surface
  contracts, six cameras, narrow layout, and zero console problems.
- Clean-server `npm run test:box3d-lab`: passed physical-wheel contacts,
  movement/steering, six cameras, narrow layout, and zero console problems.

The normal Field 02 browser workflow was attempted on an isolated server after
the projection repair. It reached the salvage return-home flow, but the
recommended workshop control remained hidden while a parallel
`src/game/renderer.ts` reload occurred. This is recorded as unverified rather
than green. `npm run build` compiled TypeScript/Vite but failed the final player
asset assertion because both runtime bridge candidates remain
`publicRuntimeApproved: false`; no approval was inferred from CC0 metadata.

## Addendum (2026-07-26) - final browser/build convergence

The earlier post-edit note above is superseded by the clean current evidence
below; it is retained as historical record. The acceptance harness was kept
parallel-safe while converging: active shared files were not overwritten, and
the current first-rung and hover-fixture edits were re-read before each rerun.

The harness now closes the continuous developer renderer during real-key
first-rung traversal, runs that traversal in a separate Chrome process, settles
the rig with public brake keys before Space, and recreates the developer page
before later performance checks. This preserves the real W/A/D contract and
avoids changing production gameplay. The hover fixture now uses the open west
basin lane at `(-134, -123)` with heading `pi`; it exercises water depth `1.33 m`
with condition unchanged at `100`, without colliding with `flats-stilt-np`.

Final Tier 4 browser evidence:

- `RIGS_UNBOUND_URL=http://127.0.0.1:4186/?acceptance=field-02 npm run test:browser`
  passed the complete Field 02 acceptance.
- First-rung real keyboard evidence reached the cache, returned home, fitted
  `lug-tires`, and restored the fitted module and visible presentation after
  reload.
- Cargo relay completed and persisted; tractor, buggy, and skimmer all produced
  movement evidence.
- Camera obstruction, launch structure, standing-to-felled tree clearance, and
  hood camera contracts passed.
- Narrow touch controls stayed below the field with all action bounds inside
  the `390x844` viewport.
- Browser console/page errors were empty.

Final Tier 2/build evidence:

- `npm run build` passed TypeScript, Vite production compilation, and
  `npm run assets:assert-player-build`; no unapproved runtime files or manifest
  identities were exposed.
- The earlier asset-boundary failure was caused by the Vite manifest projection
  dropping `runtimePresentation`; the projection repair is now validated by the
  passing build and does not approve either runtime bridge asset.

Remaining non-green warnings are bounded and explicit: Vite reports large
chunks for `three.module` and `rapier`; this is a performance-hardening item,
not a correctness failure. Runtime bridge candidates remain
`publicRuntimeApproved: false` by deliberate provenance policy, while the
player build continues to exclude them.

## Addendum (2026-07-26) - final acceptance contract audit

### Pass 1 - immediate correctness and completeness

- Field 02 browser acceptance passed on the isolated `4186` server after the
  renderer-lifecycle and fixture corrections.
- `npm test` passed 27 Vitest files, 220 tests, and the 7 deterministic-kernel
  probes.
- `npm run typecheck` passed the root and deterministic-kernel projects.
- `npm run assets:preflight && npm run test:assets` passed with zero manifest
  findings and 9 asset tests.
- `npm run build` passed production compilation and the player asset boundary.

### Pass 2 - architecture and long-term viability

- The first-rung proof still uses public keyboard input and authored targets;
  the harness only controls renderer lifecycle and braking settlement.
- Hover validation still owns its no-damage assertion; the fixture now avoids a
  known authored stilt collider instead of suppressing collision consequences.
- The runtime asset projection remains manifest-owned and does not promote
  `publicRuntimeApproved` status.
- No duplicate API route, parallel runtime pipeline, or second simulation
  authority was introduced by this work.

### Pass 3 - rule compliance and supervision readiness

- Parallel-agent edits were preserved and re-read before each acceptance rerun;
  no active shared server or unrelated process was stopped.
- Earlier failed attempts remain recorded as historical evidence, with the
  superseding clean run explicitly linked by this addendum.
- Remaining review item: production chunks over 500 kB are a documented
  performance-hardening follow-up; closure requires a measured code-splitting
  plan and a repeat of browser performance evidence.
- Remaining policy item: runtime bridge candidates require an explicit
  provenance/release decision before any public approval; passing the build
  boundary intentionally does not make that decision for the product owner.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this current-state audit. This document still owns
the current runtime and acceptance frame; the new note carries the wider
machine-keeper thesis and long-range product direction.
