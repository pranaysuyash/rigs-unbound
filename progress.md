# Progress

Original prompt: Explore and document a public browser-based open-world game in which customizable, unlockable vehicles—from cycles and toy cars through tractors, rockets, fantasy hybrids, and spaceships—are the playable characters. The world may move across farms, cities, space, races, farming, zombies, aliens, gunfights, tower defense, and other mechanics. Research game designs, systems, progression, UI, editors, browser-compatible free/open-source engines and packages, procedural generation, currencies, auth, state, multiplayer, interactions, and AI. Stay open to adjacent ideas, use first principles, follow motto v4, and continuously update a durable exploration map, decisions, discussions, and deferred work.

## Current state

- Stage: contrasting-rig capability validation
- Playable build: local **Rig Lab 01** at `http://127.0.0.1:4174/`
- Engine decision: open
- Reference runtime: provisional Three.js + Vite + TypeScript
- Project name: **Rigs Unbound**
- GitHub repository: `pranaysuyash/rigs-unbound`
- Public deployment: none

## Playable foundation — 2026-07-25

- Added a strict TypeScript fixed-step state kernel under `src/game/`.
- Added a provisional Three.js Patchwork Atlas field with a project-owned primitive tractor and four spatial opportunity landmarks.
- Implemented keyboard, gamepad, and responsive touch input through named actions.
- Implemented chase/tactical cameras and day/gloam/night presentation without replacing vehicle identity.
- Implemented a physical plough state that leaves distance-spaced, bounded furrow geometry.
- Added validated local save/recovery for rig position, presentation state, discoveries, and furrows.
- Added `window.render_game_to_text()` and bounded `window.advanceTime(ms)` browser hooks.
- Added a visible error surface, local instrumentation, pause, reset, and responsive field-kit HUD.
- Preserved the concurrently created `experiments/deterministic-kernel-probe/` as a disposable cross-mode fixture; root commands verify both without treating the experiment as production truth.

Verification:

- `npm run typecheck`: passed for the live TypeScript runtime and the JavaScript kernel probe.
- `npm test`: 6 live-runtime tests and 7 deterministic-kernel tests passed.
- `npm run build`: passed; output JS is 551.01 kB raw / 141.08 kB gzip and currently triggers Vite's 500 kB advisory warning.
- Visible-browser acceptance: drive, plough, camera/phase transition, deterministic hook, reload persistence, desktop layout, and `390 × 844` touch layout passed with zero captured console/page errors.
- Public deployment and external player comprehension remain unverified.

## Rig Lab 01 — 2026-07-25

- Replaced the single tractor-shaped state with persistent `RigState` entries and versioned `RigProfile` configuration.
- Added Torque, the utility tractor, and Spark, the toy buggy, to the same fixed-step action, camera, save, and renderer paths.
- Added capability queries for `plough`, `tow`, and `jump`; world interaction checks capabilities rather than rig names.
- Added one complete cargo-relay workflow: approach, attach, transport, automatic gate delivery, completion time, save, restore, and reset.
- Added a relay ramp. Spark can launch through profile data while Torque remains grounded.
- Added shared condition/landing state and distinct acceleration, speed, steering, mass, tow penalty, wheel radius, camera, and landing profiles.
- Migrated valid Field Test 001 v1 saves into the v2 multi-rig schema without dropping tractor position, trail, or furrows.
- Added startup, rolling frame-time, FPS, draw-call, triangle, heap-when-available, load, save-duration, and save-size instrumentation.
- Added a reusable visible-browser acceptance tool and durable desktop/narrow screenshots.

Verification:

- `npm run typecheck`: passed.
- `npm test`: 14 live-runtime tests and 7 preserved deterministic-kernel tests passed.
- `npm run format:check`: passed.
- `npm run build`: passed; output JS is 568.88 kB raw / 146.38 kB gzip and still triggers Vite's 500 kB advisory warning.
- `npm run test:browser`: passed cargo attach/delivery, contrasting rig movement, buggy ramp launch, periodic save, reload restore, local metrics, `390 × 844` layout, and console/page-error checks.
- The final local visible-browser run observed 175.0 ms from navigation start to first controllable frame, 8.89 ms average / 10.0 ms p95 sampled frame time, 41 draw calls, 1,658 triangles, 23.7 MB reported JS heap, a 0.10 ms periodic save, and a 1,260-byte save. These numbers are a machine/browser snapshot, not a production target.

## Parallel port validation — 2026-07-25

This read-only pass tested both live development surfaces while another agent
continued the root runtime:

- `4173` passed the standard browser-game client through farm → defense →
  time-trial with the same tractor identity, 55% condition, three scrap, and
  three harvested crops. Desktop and 320 px layouts, start, touch movement,
  restart, text state, console, and `F` fullscreen toggling passed.
- `4174` passed cold start after the concurrent refactor settled, deterministic
  `applyRigInput`, cargo approach/attach/tow/delivery, 4.3-second best-time
  persistence, tractor/buggy switching, tactical camera, gloam phase,
  pause-blocked movement, invalid-rig rejection, buggy ramp launch/landing
  damage, 390 × 844 layout, reload recovery, and a clean final console.
- During the parallel refactor, one intermediate `4174` load failed because
  `main.ts` requested the removed `togglePlough` export and typecheck exposed
  old `vehicle` references. The other agent completed the migration during this
  test pass; the then-current typecheck, 12 root tests + 7 probe tests, build,
  formatting, and whitespace checks all passed.
- `window.advanceTime(ms)` on `4174` deliberately advances idle state;
  deterministic controlled movement uses the newer `window.applyRigInput`
  contract. Generic clients that assume held keys plus `advanceTime` should be
  updated to call the canonical input hook.
- Remaining interaction gaps: `4174` has no fullscreen control yet; `4173`
  entered and exited fullscreen with `F`, while native `Escape` exit was not
  confirmed by the Playwright-controlled browser. Real-device touch hold,
  gamepad input, focus-loss recovery, WebGL fallback, cold-cache production
  loading, and low-power/mobile performance remain unverified.

## Completed in this pass

- Loaded the shared instruction stack, generated the canonical project context pack, and adopted the project-local motto v4.
- Inspected the supplied 2026 workbook as a read-only research source.
- Mapped the initial product thesis, gameplay loops, world grammar, progression, economy, multiplayer, AI, UGC, safety, accessibility, and browser constraints.
- Defined an engine bakeoff rather than prematurely choosing a renderer.
- Defined a narrow first-playable hypothesis that tests the multi-genre promise.
- Recorded architecture and slice hypotheses as proposed ADRs.
- Created a research/source register, game reference atlas, design direction, and living worklog.

## Additional research ingestion — 2026-07-25

- Inspected `vehicle_game_platform_exploration_2026.xlsx` and the accompanying ChatGPT narrative read-only.
- Verified the workbook’s 20-sheet structure, game-specific table counts, formulas, and engine-score calculations.
- Confirmed current primary-source claims about the open-source PlayCanvas editor frontend, Phaser 4.1, and newly announced alpha-stage Box3D.
- Preserved the workbook’s decision statuses as source metadata rather than treating 17 `Accepted` rows as project approval.
- Kept the canonical one-spendable-resource progression grammar rather than adding the workbook’s separate Credits currency.
- Added proposed ADRs for immutable blueprints/mutable instances/world manifests and versioned public share/evidence surfaces.
- Kept the tractor farm/defense loop as the first fun test; moved the same-tractor time trial to the immediate cross-mode architecture proof.
- Added Box3D as a watch/feasibility candidate without displacing Rapier.

## Prior proposed implementation unit

Build disposable technical probes for the same micro-scene:

1. one steerable vehicle using the same hashed Kenney Car Kit tractor GLB in every candidate;
2. one Kenney Racing Kit ramp, Car Kit box, Nature Kit field fixtures, and animated Graveyard zombie;
3. fixed-step simulation and deterministic seed;
4. chase and top-down camera transitions;
5. debug HUD with frame time, draw calls, physics bodies, seed, and current state;
6. keyboard/gamepad/touch input adapters;
7. state export through `window.render_game_to_text`;
8. deterministic stepping through `window.advanceTime(ms)`.

Run the probe in the leading engine candidates under the same acceptance checks. Keep probe code disposable; keep the gameplay and content contracts portable.

The two-engine prerequisite is superseded for immediate execution by the playable-foundation addendum to ADR-0001. The candidate comparison remains available when current runtime evidence identifies a concrete disputed engine question.

## Next coherent evidence unit

Use the live world to test openness through spatial consequences:

1. validate whether Torque and Spark feel meaningfully different to external players rather than only measuring different state values;
2. add collision/camera-occlusion handling before increasing scenery density;
3. extend the mobility adapter boundary with a genuinely different locomotion family—bicycle balance, tracked steering, water, or flight—only after recording its controller contract;
4. measure cold-cache production loading and representative low-power/mobile behavior rather than extrapolating from the local development server;
5. add a second capability composition, such as tow + repair rescue or carry + place construction, without creating an activity-specific state path.

## Kenney source-library audit — 2026-07-25

- Located and inspected the locally owned Kenney Game Assets All-in-1 3.4.0 bundle under `adhoc_resources`.
- Recorded the bundle’s approximate 1.2 GB / 84,992-file snapshot and its 2D, 3D, UI, icon, and audio breadth.
- Inspected bundle and sampled per-pack CC0 evidence; preserved the bundle’s no-direct-redistribution instruction.
- Visually reviewed Car, Nature, Toy Car, and Space pack previews for cross-world fit.
- Inspected selected GLB node, material, and animation metadata.
- Identified and hashed an eleven-file candidate manifest for a fair engine bakeoff.
- Kept all source assets in place; no copy, import, conversion, dependency, or runtime asset path was created.
- Documented a selective-import and Patchwork Atlas transformation policy in the asset audit, provenance register, design direction, exploration map, and ADR-0001.

## Direct visual-preference exploration — 2026-07-25

- Preserved the project-owner-provided preferred tractor/scene image as a project reference with source hash and provenance.
- Translated the preference into specific vehicle-character, selective-detail, camera, composition, lighting, and world-promise signals.
- Generated and inspected three original reference-guided boards:
  - persistent tractor character/model sheet;
  - six-role gameplay camera board;
  - fair Patchwork Atlas / Signal Noir / Salvage Opera comparison.
- Proposed Patchwork Atlas as the baseline, Signal Noir as a night/danger state layer, and Salvage Opera as a rare vista/event crescendo.
- Recorded runtime cautions: reduce gameplay depth-of-field, preserve vehicle screen presence, avoid underlit tactical scenes, replace generic spider threats, and test occlusion/mobile framing.
- Stored final prompts, critiques, hashes, dimensions, provenance, and next experiments in project documentation.
- No generated board was approved as a production or shipped asset.

## Tractor restoration and modular-growth proposal — 2026-07-25

- Converted the dilapidated-to-robust tractor idea into a proposed machine journey: found, stabilized, working, specialized, hybridized, and storied.
- Separated core restoration, chassis tuning, swappable modules, and deployed module states.
- Defined workshop-bound large swapping and later earned field-service options.
- Mapped nine multi-use module examples with day/night value and real costs.
- Bounded the first playable to one restored signature plow plus one support-module choice.
- Updated visual rules, the exploration map, the first-slice ADR, and the versioned-content ADR.
- No gameplay, schema, UI, asset, dependency, or runtime implementation was created.

## Deferred by design

- Final renderer/game engine
- Final physics engine
- Accounts and cloud saves
- Real-time multiplayer
- Trading and player markets
- Premium currency or real-money purchases
- Open user-generated content
- Generative AI in live gameplay
- Large procedural worlds
- Final visual identity and commercial name-clearance review

Each item has a research/gating path in the exploration map. “Deferred” here means “not allowed to become hidden scope in the first playable,” not “forgotten.”

## Testing contract when implementation begins

- Use a browser automation loop after every meaningful change.
- Test input, fixed-step physics, gameplay state, camera, UI, and rendering as one chain.
- Inspect active play, not only menus.
- Capture desktop and narrow/mobile screenshots.
- Check console errors and state text.
- Test restart, direct load, loss of focus, resize, poor performance, missing assets, and a WebGL fallback path.
- Keep a small number of named input actions rather than scattering raw key checks.

## Anything else?

The first code should answer a disputed question. It should not exist merely to make the repository look underway.

## Field 02 convergence and browser acceptance — 2026-07-25

- Integrated the parallel terrain, traversal, collision, exploration, minimap,
  procedural-audio, schema-v3 persistence, and six-policy camera work into the
  canonical root runtime.
- Repaired the reusable browser acceptance tool after Field 02 superseded the
  Rig Lab 01 title and v2 storage contract.
- Hardened `render_game_to_text()` so a not-yet-built minimap timing metric
  reports zero instead of breaking the whole observability contract.
- Added the missing open-world traversal plan referenced by ADR-0007 and closed
  ADR-0008 with an explicit “Anything else?” review and update log.
- Current checks passed: typecheck, 74 root tests, seven deterministic-kernel
  probe tests, production build, formatting, staged whitespace, and the full
  browser workflow on port 4174.
- Current Tier 4 browser evidence covers all six camera policies, top-down
  capture, terrain-aware cargo relay, buggy ramp traversal, schema-v3 reload,
  390 × 844 touch layout, performance snapshots, and zero console/page errors.
- The production build still carries a visible initial-chunk advisory; current
  local evidence does not replace cold-cache representative-device measurement
  or external player-feel validation.

## Anything else?

Yes. The next evidence unit should test a genuinely different locomotion family
or external player language against this terrain substrate. Adding more ground
vehicles or scenery would not yet answer the remaining portability and feel
questions.

## Rig Perception Chain 01 — 2026-07-25

- Added a tested shared simulation-to-perception frame.
- Renderer and audio now consume the same normalized speed, traction, load, and
  turn meanings.
- Added visible front-wheel steering, chassis load expression, chase-camera
  anticipation, reduced-motion clamping, and perception browser evidence.
- Fixed false impact feedback when switching between rigs with different saved
  condition values.
- Corrected portrait chase after screenshot review showed Drift clipped at
  `390 × 844`.
- Added ADR-0012, a comprehensive browser vehicle-physics catalog, the
  24-question exploration schema, implementation plan, and acceptance report.
- Verified 83 root tests, seven kernel-probe tests, typecheck, format, build,
  full browser workflow, screenshots, and zero console/page problems.
- Live development server remains available at
  `http://127.0.0.1:4173/?live=perception-chain-01`.

## Anything else?

Local evidence is Tier 4 for the implemented interaction chain. Player feel,
mobile-device budgets, haptics, prop-aware camera occlusion, and Rapier dynamics
remain open with named closure paths.
