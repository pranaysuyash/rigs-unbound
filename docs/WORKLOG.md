## 2026-07-27 — playtest2 artifact bundle classified

- New local evidence surfaced in `artifacts/playtest2-achiever.cjs`,
  `artifacts/playtest2-casual.cjs`, `artifacts/playtest2-explorer.cjs`, and
  `artifacts/playtest2-explorer/`.
- The scripts are reusable local drivers; the explorer screenshots currently
  show `ERR_CONNECTION_REFUSED` against `127.0.0.1:4174`, so they are launcher
  diagnostics rather than gameplay proof.
- Preserved the disposition in
  `docs/reviews/PLAYTEST2_ARTIFACT_DISPOSITION_2026-07-27.md` so the next pass
  can rerun or cite them without confusing a failed connection with a valid
  playtest.

## 2026-07-27 — next vertical recommendation formalized without touching runtime

- Captured the current sequencing recommendation in
  `docs/reviews/NEXT_VERTICAL_RECOMMENDATION_UNBOUND_PASSAGE_2026-07-27.md`.
- The note keeps Unbound Passage 01 as the leading next-vertical candidate
  while explicitly preserving the operator-sign-off gate and avoiding the live
  renderer/style lane that another process is currently editing.
- No runtime code was changed in this pass; this is a documentation-only
  continuity step so future work can resume from the current synthesis without
  rediscovering the same decision boundary.

## 2026-07-27 — parallel first-rung and gully edits parked untouched

- The live tree currently contains uncommitted edits in `src/game/first-rung.ts`
  and `src/game/gameworld.ts` that reintroduce the pre-blade scouting branch and
  shift the authored gully placement.
- Those edits are preserved as parallel work and were intentionally not folded
  into the validated terrain / renderer checkpoints because the earlier browser
  acceptance run showed the pre-blade branch breaks the canonical first-rung
  flow after salvage collection.
- This note records the separation so the next pass can either validate that
  tranche on its own or keep it parked without rediscovering the same conflict.

## 2026-07-27 — terrain deformation now reclassifies soil on the live field

- Implemented deformation-aware surface classification in `src/game/terrain.ts`
  so deeply cut gentle ground becomes `tilled` while steep deformed ground
  stays in its natural surface class.
- Added direct terrain coverage for both the gentle-ground promotion and the
  steep-slope gate, plus the existing deformation-count preservation update in
  `src/game/state.test.ts`.
- The terrain change is documented by [ADR-0022](docs/decisions/ADR-0022-terrain-transformation-surface-classification.md) and now has live test coverage on the current tree.

## 2026-07-27 — water shader compile warning removed

- Removed the duplicate `cameraPosition` declaration from the water fragment
  shader and collapsed the duplicated Blinn-Phong variables into a single
  specular path.
- Switched the water specular highlight to the existing `specularPower` and
  `specularIntensity` uniforms instead of hardcoded literals.
- Re-ran the live acceptance proof: the first-cut flow still passes and the
  browser console now reports zero shader errors.

## 2026-07-27 — first-cut evidence now follows the runtime contract

- Removed the experimental pre-blade scouting branch that was hijacking the
  canonical return-home / choose-part flow after salvage collection.
- Made workshop fitting settle the HUD through the same path used by the
  acceptance hook, so the visible first-rung stage stays in sync with the
  simulation after module installation.
- Updated the first-cut browser acceptance harness to read the canonical
  `worldMemory.furrowCount` snapshot field instead of a non-existent top-level
  `furrows` array.
- Validation on the live tree now passes end to end: `npm run typecheck` and
  `node tools/first-cut-browser-acceptance.cjs`.

## 2026-07-27 — first-rung gating now preserves the workshop flow

- Narrowed the pre-blade scouting branch so it no longer hijacks the workshop
  return-home / fit flow when Torque is already at Home Silo.
- Improved the save failure surface so the live status and toast now show the
  actual storage error instead of a generic fallback message.
- Kept the gully warning in `GameWorld` so the direct-route blockage remains
  visible in logs if the authored deform ever fails on a seed.
- Added regression coverage for the new sight-destination / attempt-route
  thresholds and the "stay home first" branch.
- Validation on the live tree: `npm run typecheck` passed, and targeted
  `first-rung` / `world-memory` Vitest files passed.
- Unbound Passage remains sequenced behind the recorded arbitration gate and
  operator sign-off; no runtime integration started in this tranche.

## 2026-07-27 — Master Vehicle Catalog & Visual Asset Pipeline

- Created the canonical [Master Vehicle & Rig Catalog](docs/exploration/MASTER_VEHICLE_CATALOG.md) documenting 36 unique vehicle concepts across 6 core categories with 108 upgrade/version tiers (`v1` Found, `v2` Restored, `v3` Overcharged).
- Defined silhouette specifications, locomotion classes, hardpoints, material tokens, and upgrade arcs for every rig family (Farm Utility, Service/Recovery, Toy/Micro, Rescue/Defense, Extreme/Aspirational, Fantasy/Cosmic).
- Generated a concept art reference sheet (`master_rig_catalog_lineup`) adhering to single-subject/lineup isolation rules on neutral backdrops for downstream `img2threejs` 3D reconstruction.
- Verified system status and documented provenance linkage for future engine reconstruction.

## 2026-07-26 — active tranche contradictions converted into tested boundaries

- Preserved the released rig-neutral first rung: the reward→return→fit loop
  completes when any compatible rig fits its first part. Removed the staged
  proposal that forced every player into Torque, a blade cut, and Long Furrow
  before completion. Terrain transformation remains a separate capability
  proof, not universal onboarding.
- Corrected first-use guidance so the learned workshop lesson does not
  immediately cascade into optional camera/map lessons and keep the workshop
  hidden. Keyboard and touch now reach the same taught workshop transition.
- Moved survey refresh cadence out of save state and into runtime-owned
  `GameWorld` state. A restored world now rebuilds derived horizon visibility on
  its first step, and reset clears both visibility and cadence.
- Replaced the unsafe remove-before-write local-save attempt with one canonical
  Web Storage replacement. Write failure is surfaced while the prior save
  remains intact.
- Hardened the experimental Unbound Passage reducer with failed-lane
  provenance, canonical rig ids, and fail-closed event ticks.
- Reconciled the new Survey Route candidate: stationary contracts expire on
  world time, completion rewards exactly once, and impossible survey offers do
  not hide legal salvage or tool actions.
- Removed incomplete billboard ownership from the effective renderer path and
  kept dynamic instance culling disabled until truthful aggregate bounds are
  computed. Corrected the renderer research note's earlier false “complete”
  claims.
- Remaining admission choices are explicit: Survey Route versus cultivation
  schema ownership, next-vertical sequencing, runtime Passage wiring,
  emission listener semantics, renderer bounds/visual proof, replay coverage,
  and external fresh-player comprehension.

## 2026-07-26 — the horizon rail now reports sight, not range

- Revised my own answer from earlier the same day. I had gated unsurveyed sites
  behind invented distance tiers (close / near / far / distant at 60 / 140 / 260 m).
  That was a UI convention layered on top of a game that already answers the
  question properly: the survey system decides what the player knows by raymarching
  terrain from the rig's eye. Inventing a second, weaker rule for the same question
  is the parallel-truth defect in miniature.
- The rail now has the three states a machine can actually be in:
  - a place it has reached — name and verb, remembered without needing line of sight,
  - a signal it can currently see — a cardinal bearing and a coarse range,
  - a signal terrain is hiding — "No signal / out of sight", and nothing else.
- Climbing a rise therefore reveals places for real, which is the claim the project
  has been making about itself in prose since before it was true in the rail.
- Extracted `ExplorationField.sightlineClear` and routed _both_ the survey sweep and
  signal visibility through it. Two independent notions of "can this machine see
  that" would drift, and the player would get a map and a HUD disagreeing about the
  same hill. 10 samples at 0.6 m: a gameplay sightline, not an occlusion query.
- `SITE_SIGNALS` is derived from the authored part carrying `discoverySignal`, using
  the top of the lamp, so a landmark cannot be moved in `WORLD_STRUCTURE_PARTS`
  while a second table keeps pointing at where it used to be.
- Visibility lives on the world as `visibleSignals`, recomputed inside the same
  movement-threshold block as the survey sweep — the sightline only changes when the
  machine moves, and it is the same evidence from the same eye. It is derived, not
  saved: a loaded run rebuilds it on the first step rather than trusting a stale set.
- Published once through `publicState().worldMemory.visibleSignals` so the rail and
  any future map overlay read one truth.
- Styling carries the same three states as the words (dimmed row and outline, full
  outline, filled and glowing), so the state never rests on colour alone.
- Tests: `SITE_SIGNALS` derivation and placement; a single publication point that is
  empty before the kernel looks and matches the world after it does; and — the one
  that matters — that terrain genuinely occludes a signal at ground level and a
  60 m vantage reveals it, while raising the eye can never lose a sightline it
  already had. That asserts the mechanism rather than the wiring.
- Two mistakes of mine worth recording:
  - I first wrote the visibility test calling `advanceGame(state, world, input, dt)`.
    The real signature is `(state, world, elapsedMs)`, so the third argument became
    `NaN`, zero steps ran, and the test failed with an empty set. I read that as a
    product bug for one probe cycle before the probe showed `surveyed: 0` — the
    kernel had never stepped at all.
  - I trusted the browser over the kernel. The long-running dev server was serving a
    stale module (I had cleared `node_modules/.vite` underneath it earlier), so the
    new field was absent from the page while present in source. Kernel-side
    verification was both faster and stronger.
- `fpsHistory` / `degraded` / `qualityTier` reappeared in the renderer during a
  concurrent edit and were removed a second time. Replaced with a comment naming
  `RuntimeProfileController` as the owner of runtime degradation, because a
  delete-war is not a fix — the reason has to live where the mistake gets made.

## 2026-07-26 — Sites clean-install repair and real-touch first rung

- Sites version 8 failed before build because `vite-plugin-wasm@3.5.0` declared
  Vite peer support only through 7 while the project uses Vite 8.1.5.
- Upgraded the canonical package and lockfile to `vite-plugin-wasm@3.6.0`;
  registry metadata and the installed lock entry both declare Vite 8 support.
- Proved the release environment boundary with a clean `npm ci` (117 packages,
  zero audit vulnerabilities), then passed typecheck, production build, player
  asset isolation, 220 main tests, 7 kernel tests, 9 asset tests, preflight,
  formatting, and diff hygiene.
- Extended browser acceptance with a real-touch first rung. The mobile context
  uses Chrome touch events against visible on-screen controls for entry,
  simultaneous driving/steering, contextual Act, return, workshop fit, and
  persistence. The rebuilt `4174` run passed with zero captured console/page
  problems.
- Corrected two harness assumptions found by the touch run: Drive precedes
  Workshop in the canonical guidance priority, and touch braking needs a
  tighter cache approach margin to remain inside the interaction radius.

## 2026-07-26 — finalized 4173/4174 first-rung and production-boundary evidence

- Stabilized the real-keyboard first-rung browser path around the product
  contract: collect only after braking, return to the Home service area rather
  than its centre, and stop on the derived `choose-part` transition.
- Isolated deep-water hover from authored stilt collision by giving the fixture
  a deterministic heading away from the platform.
- Made runtime asset-bridge assertions environment-aware on initial and
  recreated pages. Development requires resolved developer candidates;
  production-like builds require none.
- Passed the finalized full acceptance on `4173` and freshly rebuilt `4174`
  with zero captured console/page problems. The `4174` run additionally proved
  the production bundle exposes no developer/private runtime bridges.
- Inspected refreshed evidence. Lug tread and the post-fit Long Furrow
  consequence are perceptible; the first-rung side composition and narrow HUD
  remain crowded and are tracked as visual-polish work rather than silently
  accepted as public-quality captures.

### Three-pass outcome

1. Immediate correctness: first-rung, hover, persistence, camera, responsive,
   and player/developer boundary assertions pass on both local surfaces.
2. Architecture: the harness observes canonical derived state and public input;
   it does not teleport, grant rewards, or introduce a second progression or
   asset-admission authority.
3. Supervision readiness: exact URLs, remaining real-touch/public-production
   gates, visual limitations, and the release path are recorded in the
   acceptance report and master tracker.

## 2026-07-26 — the instruction stack is v4-only from source through generated context

- Corrected the canonical `/Users/pranay/Downloads/motto_v4.md` multi-pass
  clause from “revalidate against motto_v3” to motto_v4.
- Updated `/Users/pranay/AGENTS.md` and `/Users/pranay/Projects/AGENTS.md` so
  startup loads the only canonical project doctrine, `motto_v4.md`, and treats
  v2/v3 filenames as retired rather than compatibility inputs.
- Corrected the shared hook description to require the actual v4 attestation.
- Updated `/Users/pranay/Projects/agent-start` to remove the exported “legacy
  bridge,” report retired doctrine paths honestly, and use the workspace v4
  file as a real fallback when the Downloads source is unavailable.
- Resolved a second instruction drift: shared docs said `Docs/context` while
  the executable generator and this repository use canonical lowercase
  `docs/context`.
- `bash -n /Users/pranay/Projects/agent-start` passed. Regenerated the current
  project context after both instruction changes. The project now has one
  `motto_v4.md`, no v2/v3 doctrine files, and generated context that names only
  v4 as authority.

## 2026-07-26 — the first reward-to-fit loop passed on the current shared runtime

- Ran the complete Field 02 acceptance against the stable current development
  server at `http://127.0.0.1:4180/?acceptance=field-02`.
- The first-rung lane uses only real W/A/S/D keys, canonical Space collection,
  the real workshop button, and save/reload. It does not teleport, grant
  currency, or call an installation mutation hook.
- Reworked the acceptance-only route controller to converge through bounded
  forward/reverse corrections, stop inside interaction areas, and use dry
  navigation waypoints without weakening collision.
- Corrected stale or over-specific assertions encountered during the run:
  product title versus developer world designation; clear-or-resolved Home
  chase camera; the canonical 4.6 m cache boundary; Home workshop momentum;
  the new solid Sunken Flats stilt platform; and incomparable boot-relative
  versus entry-relative performance timestamps.
- Tier 4 result: full browser acceptance passed with zero console/page
  problems. First-rung fit/restoration, six cameras, rear-side chase, Top-down,
  authored and procedural camera collision, relay, ramp, terrain faces,
  deep-water hover, reduced motion, desktop, and `390×844` checks all passed.
- Current performance sample was local development evidence, not a production
  budget claim: 659.7 ms entry-relative first controllable, 11.77 ms average /
  17.6 ms p95 frame time, 125 draw calls, 105,274 triangles, 32.6 MB reported
  heap, and 3,193-byte current save.
- Focused first-rung/control/command tests passed 32/32; main and kernel
  typechecks passed; harness syntax and touched formatting passed.
- Visual QA: desktop makes the fitted tread and Long Furrow consequence
  legible. The narrow composition remains crowded even though controls are
  unclipped; real-touch and external-player comprehension remain open.
- Preserved both concurrent ADRs and removed their duplicate identifier:
  solver-neutral dynamics remains ADR-0023; browser acceptance renderer
  lifecycle is ADR-0024.
- Exact-final 4174 rebuilt preview, full release gates, public production,
  real touch, human comprehension, and deployment remain open.

## 2026-07-26 — the landmarks caused a real per-step regression, and the rail was giving away the map

- **Regression I introduced, caught and fixed.** Authoring the site landmarks took
  `WORLD_STRUCTURE_PARTS` from ~13 parts to 72, and `resolveRigStructureCollision`
  walked every collider every step. Each part cost a `findSite` linear scan _and_ a
  full `terrain.height` evaluation — domain-warped fBm, the most expensive pure
  function in the project. Two simulation tests that had been passing in about a
  second timed out at 5 s.
  - Host load was 334 at the time, so blaming contention was available and would
    have been wrong. The arithmetic says otherwise: ~50 colliders x one fBm sample
    per step is a real cost that did not exist before this change.
  - Fixed by precomputing `SITE_COLLIDER_GROUPS` at module load — colliders grouped
    by site with a bounding reach — so the kernel rejects a whole site with one
    distance test and evaluates terrain height once per _nearby site_ instead of
    once per part. A rig is near at most one site, so the common case is now a
    handful of arithmetic operations.
  - It is a pure reorganisation: same parts, same iteration order, same resolved
    centres. Measured on the two tests that had been timing out:
    `traversal model > low-range gearing climbs from rest` went from a 5 s timeout
    (17 648 ms elapsed) to **373 ms**, and `world memory > cuts the terrain when
ploughing` from a timeout (6 521 ms) to **1 102 ms**. Full suite 27 files /
    220 tests green, exit 0. The numbers rule out host contention as the cause:
    contention does not resolve by rearranging a loop.
  - This is the third time in this session that the fix was "stop recomputing a
    pure function inside the step loop" (the obstacle field was the first, at 63x).
    The pattern is worth naming: authored-world growth is cheap to render and
    expensive to collide against, so any new authored table needs a spatial reject
    before it needs anything else.
- **The opportunity rail was contradicting the survey model.** It was built once at
  boot from `LANDMARKS` with every site's name, verb and a live metre-accurate
  distance — including places the player had never seen. The game's whole
  exploration premise is that the map only reveals ground the machine could
  actually see, and the HUD was handing over a complete gazetteer for free.
  - An unsurveyed site now reads `Unsurveyed`, a cardinal `bearing`, and a coarse
    band (close / near / far / distant). The name and the verb are what discovery
    pays out, so they arrive on arrival.
  - Reused the existing `headingLabel` rather than writing a second cardinal
    vocabulary. The world's forward vector is `(sin heading, cos heading)`, so
    `atan2(dx, dz)` is the same angle convention: +Z is north, +X is east.
  - Verified live against the geometry rather than by eye: quarry-shelf at
    dx +34 / dz +6 reads E, toy-grove at +62/+110 reads NE, sunken-flats at
    -174/-168 reads SW, launch-ridge at -206/+102 reads NW, and every band matches
    its measured distance.
- Evidence depth: Tier 3 for the rail (browser-verified against computed bearings)
  and Tier 3 for the collision fix (targeted suites green, full suite re-run).

## 2026-07-26 — the automation hang was a missing invariant, not three unlucky scripts

- Third occurrence this session of the same failure shape: a Playwright script
  that launches a browser, throws before its own `finally` is reachable, and then
  never exits. `tools/capture-trailer.cjs` burned 14 hours that way, and
  `artifacts/playtest-explorer/driver.cjs` was found still running after 19 h 36 m
  having written nothing since 23:00 the previous night.
- Counted the blast radius instead of fixing the instance: 12 browser-driving
  scripts in the repo, exactly one of which had a deadline — the one already
  hardened after it hung. Eleven could hang forever.
- Extracted the guard as `tools/browser-watchdog.cjs` and armed it at module load
  in all 12, including replacing `capture-trailer.cjs`'s private copy so there is
  one definition rather than two. The timer is `unref`'d, so arming it never keeps
  a finished process alive, and it exits non-zero because an overrun is a failure.
- Deadlines are set from each script's realistic worst case (15 min for the
  acceptance runs, 25 for the captures, 30 for the playtest driver), not from its
  typical case. The deadline bounds a hang; it is not a performance budget.
- Documented in `tools/README.md` with the rule for new scripts: a browser script
  that cannot exit is worse than one that fails, because a failure is visible.
- Verified with `node --check` on all 13 touched files.
- Host state at the time, recorded because it distorted every timing in this
  session: load average 334, WindowServer at 90% CPU, 76 Chrome renderers, 93 node
  processes (almost all idle MCP servers). `ps` itself timed out at 120 s. No
  frame-timing measurement taken under these conditions is usable.

## 2026-07-26 — the sites became places, and the runtime-profile budget stopped being decoration

- Closed the last renderer-owned parallel truth source for world geometry.
  `scene-query.ts` already stated the invariant — "a visible landmark cannot
  become renderer-only scenery that rigs pass through" — and the salvage crates,
  toy blocks, quarry slabs and entrance arch violated it. All 8 crates, 10 blocks,
  6 slabs and the arch were renderer-hardcoded meshes with no collider and no
  camera occlusion: you drove straight through every one of them.
- Moved them into `WORLD_STRUCTURE_PARTS` unchanged in shape and colour, so they
  now get collision and camera occlusion from the canonical route for free. The
  clusters were shifted off site centre, because a solid prop pile on a route
  endpoint is a place you cannot arrive at.
- Authored a distinct landmark for the five sites that had none: a gantry crane
  over the salvage yard, a stacked toy tower, a quarry hopper on legs, an
  irrigation standpipe and tank at the long furrow, and a stilt platform above the
  sunken flats. 59 authored parts in total.
- Deleted the uniform cyan ring and 11-metre mast that stood at every site. They
  were doing real work — the mast marked an unvisited place at range — so the work
  was preserved rather than dropped: `WorldStructurePart.discoverySignal` marks the
  one part per site that carries the unvisited lamp, and the renderer lights it or
  darkens it from `state.discoveries`. Identical instrument gizmos at seven sites
  is what made a valley read as a test fixture.
- Removed "Field 02" from the player surface (document title, masthead eyebrow,
  welcome plate). The seed is already a readable, shareable world identity, so the
  masthead names the world — `World UNBOUND-260725` — rather than the acceptance
  fixture the surface was cut from. The fixture label survives on the developer
  surface, where an acceptance run genuinely needs it.
- Implemented `maximumFirstControllableMs` end to end instead of accepting its
  deletion. Time-to-first-controllable-frame is the decisive metric for a
  link-native game, and it is evidence available on the first frame — long before a
  90-sample frame window can say anything. It is now declared on
  `RuntimeProfileBudget`, carried in the standard budget at 2 500 ms, checked
  _before_ the sample-count gate, and reported as a `first-controllable-budget`
  fallback reason. A declared-but-unconsumed budget field is the same inert-promise
  defect as a module that advertises a capability it lacks.
- Removed `fpsHistory`, `degraded` and `qualityTier` from the renderer. They were a
  second auto-degrade path that was never read or written; runtime quality
  degradation is owned by `RuntimeProfileController` -> `setVisibilityProfile`
  (`src/main.ts`), which works.
- New invariants in `world-schema.test.ts`: every site keeps open approach
  bearings into its discovery radius (rays walked inward from outside the
  footprint, >25% of the compass clear), every site has exactly one discovery
  signal, every part stays inside its site's anchor radius, and every signal sits
  at least 10 m up so it reads over terrain.
  - The first version of that test asserted a clear apron at the exact site centre
    and failed on authored barns that predate this work. It was asserting the wrong
    thing: discovery fires inside `discoverRadius` (16-26 m), so a rig never needs
    the centre. Rewritten as the property the game actually requires.
- Evidence depth: Tier 3. 27 test files / 220 tests green, `tsc --noEmit` clean,
  and browser-verified at `127.0.0.1:4174` — no console errors, document title and
  masthead read `Rigs Unbound` / `World UNBOUND-260725`, and the salvage arch plus
  the gantry with its lamp lit are visible from the western approach.
- Not a regression, recorded so it is not rediscovered: the pale quads that appear
  under a rig with the blade down are fill-mode furrow marks. Cut and fill share
  one `FurrowMark` with no mode, so filled ground is drawn with cut geometry. Still
  open, on the review list.
- Also recorded: `__RUNTIME_ASSET_ENTRIES__` is inlined by a Vite `define`, so a
  manifest edit does not invalidate the cached transform. One asset test failed
  against a stale colour mid-session and passed after clearing `node_modules/.vite`.
  The gate can therefore pass against a manifest value that is no longer on disk.

## 2026-07-26 — the activity-command seam is real, and the generic registry now waits for a third activity

- Applied the `3d-games` lens to the activity/content readiness contract.
- Rechecked `src/game/state.ts`, `src/game/affordances.ts`, and
  `docs/research/ACTIVITY_CONTENT_AND_COMMAND_CONTRACT_READINESS_2026-07-26.md`.
- Confirmed the seam is now real:
  - a versioned affordance resolves to legal / deferred / impossible,
  - the primary-action path records a structured accepted/rejected outcome,
  - the run record observes the outcome without owning the authority.
- The remaining boundary is still deliberate:
  - no third materially different activity has proven the same pattern,
  - the generic `ActivityDefinition` registry remains correctly deferred,
  - content ingestion should stay out until the third proof exists.
- Recorded the finding in the activity-readiness contract so the repo keeps a
  durable note of why the single-activity model is still the right boundary.
- Evidence depth: Tier 1 static source inspection. No browser or test execution
  was run in this update.

## 2026-07-26 — the State Shell has runtime hooks, but not yet one canonical browser-proved visual profile

- Applied the `3d-games` / visual-quality lens to the State Shell lane.
- Rechecked `src/game/renderer.ts`, `src/game/feedback.ts`, `src/game/audio.ts`,
  and `docs/research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md`.
- Confirmed the shell is no longer just a concept:
  - the renderer already has a state-shell mesh and material slot,
  - the shared feedback frame carries integrity and impact data,
  - the audio layer already modulates a shell oscillator from integrity.
- The remaining gap is promotion, not invention:
  - no single browser-proved visual shell profile owns the language yet,
  - no representative-device proof ties the shell look to a named quality band,
  - the shell remains an architectural lane rather than a shipped presentation
    system.
- Recorded the issue in a dedicated review and mirrored it into the visual
  quality research trail so the repo keeps a durable note of the shell’s
  current boundary.
- Evidence depth: Tier 1 static source inspection. No browser/device capture
  was run in this update.

## 2026-07-26 — the browser-delivery policy is still unnamed, but the narrow/mobile surface is holding up

- Applied the `3d-web-experience` lens to the browser-delivery contract.
- Rechecked `docs/research/3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md`,
  `docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md`,
  and the live narrow/mobile review trail.
- Confirmed the browser delivery path is already intentionally shaped:
  - narrow/mobile layout support exists,
  - touch controls use the same named semantic action model,
  - runtime profile and asset fallback handling are visible in code,
  - the shell remains truthful during boot.
- Confirmed the recent live review did not show a layout break at `390×844`:
  - no horizontal overflow,
  - touch controls visible,
  - map overlay fits the narrow viewport.
- The remaining gap is the public naming of the browser-delivery policy, not
  another layout patch.
- Evidence depth: Tier 1 static source inspection plus the earlier Tier 4 live
  browser review trail. No new browser run was performed in this update.

## 2026-07-26 — the performance/readability umbrella policy is still missing as one operator artifact

- Applied the `Accessibility Auditor` / readability lens to the umbrella
  performance baseline.
- Rechecked `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md`
  against the current repo notes and live surface evidence.
- Confirmed the component thresholds are real and named across the stack:
  culling, LOD, camera, collision, accessibility, and performance contracts
  are already present.
- The remaining gap is the operator-facing umbrella artifact:
  - no single visible budget table yet,
  - no one-line fail-soft summary naming the exceeded threshold,
  - no canonical table that tells maintainers which budget band the app is in.
- Recorded the gap in the baseline contract so the repo keeps one durable note
  of the remaining policy surface instead of scattering the same observation
  across multiple reviews.
- Evidence depth: Tier 1 static source inspection plus the previously recorded
  live diagnostic snapshot. No new browser or device walkthrough was run in
  this update.

## 2026-07-26 — visible profile state is still operator-facing even though the runtime can already compute it

- Applied the `Accessibility Auditor` lens to the profile-visibility contract.
- Rechecked `src/main.ts`, `src/game/runtime-profile-policy.ts`, and the
  profile-visibility research trail.
- Confirmed the runtime already knows the active profile and fallback reasons:
  - profile selection is computed in code,
  - `runtimeDiagnostics` includes profile summary data,
  - the developer/evidence surface can explain the chosen profile.
- The remaining gap is player-facing visibility:
  - the public HUD does not yet show a durable profile indicator,
  - fallback/reduced-profile state is still mostly operator-facing,
  - the public shell has not been given a plain-language comfort/profile readout.
- Recorded the issue in a dedicated review and mirrored it into the profile
  analysis trail so the repo keeps a durable note of the next accessibility
  contract.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this update.

## 2026-07-26 — input remap persistence is still open even though lesson guidance is canonical

- Applied the `Accessibility Auditor` lens to the control-input contract.
- Rechecked `src/game/input.ts`, `src/main.ts`, and
  `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md`.
- Confirmed the live input path is still browser-key canonical:
  - `KEY_ACTIONS` remains a fixed keyboard-to-action map,
  - gamepad and gyro are sampled alongside it,
  - learned control lessons persist separately as guidance, not bindings.
- The remaining gap is preference persistence, not discovery:
  - no canonical binding registry is visible,
  - no remap layout is saved/restored,
  - no reload-survival proof exists yet for preferred controls.
- Recorded the issue in a dedicated review and mirrored it into the input
  contract so the repo keeps a durable record of the next accessibility layer.
- Evidence depth: Tier 1 static source inspection. No browser, reload, or
  device walkthrough was run in this update.

## 2026-07-26 — mute works in-session, but the preference still is not persisted

- Applied the `3d-web-experience` / audio-presentation lens to the mute
  control.
- Rechecked `src/main.ts` and `src/game/audio.ts`.
- Confirmed the current mute interaction is safe and functional:
  - button label and `aria-pressed` update immediately,
  - audio enablement toggles in-session,
  - no-audio remains a safe outcome for the browser.
- The remaining gap is persistence:
  - no visible local preference key or save path exists for mute,
  - the current source does not restore mute on reload,
  - the setting is still session-only.
- Recorded the issue in a dedicated review and mirrored it into the audio
  contract so the repo keeps a durable record of the preference gap.
- Evidence depth: Tier 1 static source inspection. No browser or reload
  walkthrough was run in this update.

## 2026-07-26 — save and recovery are truthful, but the announcement contract is still implicit

- Applied the `Accessibility Auditor` lens to the persistence/status path.
- Rechecked `index.html` and `src/main.ts`.
- Confirmed the save line is already honest:
  - `#save-status` receives fresh, restored, migrated, recovered, fallback,
    and reset messages,
  - the text remains visible in the shell,
  - bootstrap announcements are handled separately.
- The remaining gap is announcement, not content:
  - `#save-status` is still only a visible text field,
  - it is not a dedicated live region or named recovery announcement contract,
  - the player can read the state but may not hear or otherwise receive the
    transition explicitly.
- Recorded the issue in a dedicated review and mirrored it into the analysis
  trail so the repository keeps a durable backlog of remaining player-surface
  contracts.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this update.

## 2026-07-26 — the workshop is a capability gate, but it still lacks a discovery/focus contract

- Applied the `Accessibility Auditor` lens to the workshop surface.
- Rechecked `index.html` and `src/main.ts`.
- Confirmed the workshop already acts like a real progression gate:
  - it appears only when in reach,
  - it hides while the map is open,
  - it presents module choices that change rig capability.
- The remaining gap is discoverability and focus:
  - `#workshop-panel` is only a labeled section,
  - there is no dedicated focus entry or restore path,
  - its appearance is not explicitly announced as a new capability moment.
- Recorded the issue in a dedicated review and mirrored it into the analysis
  trail so the repository keeps a durable backlog of remaining player-surface
  contracts.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this update.

## 2026-07-26 — pause is visible, but the announcement contract is still implicit

- Applied the `Accessibility Auditor` lens to the pause-state path.
- Rechecked `src/main.ts`, `index.html`, and the paused-state prompt update.
- Confirmed pause is already a real mode switch:
  - `current-prompt` changes to `Paused.`,
  - the full-screen pause overlay appears,
  - paused state suppresses normal simulation activity.
- The remaining gap is announcement, not visibility:
  - the prompt is not a dedicated live region,
  - the overlay is visual only,
  - there is no explicit pause-status announcement contract yet.
- Recorded the issue in a dedicated review and mirrored it into the analysis
  trail so the repo keeps a durable accessibility backlog.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this update.

## 2026-07-26 — the map overlay is a real mode switch, but it still lacks a dialog/focus contract

- Applied the `Accessibility Auditor` lens to the map overlay interaction.
- Rechecked `index.html`, `src/main.ts`, and `src/styles.css`.
- Confirmed the map surface is already modal-like in behavior:
  - it toggles a full-screen overlay,
  - it suppresses some HUD/helper surfaces while open,
  - `Escape` closes the map before pause.
- The remaining gap is semantic and focus-related:
  - `#map-overlay` is only a labeled section,
  - it lacks `role="dialog"` / `aria-modal="true"`,
  - focus does not move into the overlay on open,
  - focus does not restore to the opener on close.
- Recorded the issue in a dedicated review and added a research addendum so
  the repo keeps a durable accessibility trail instead of chat-only notes.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this update.

## 2026-07-26 — the renderer performance lane has shifted from "basic culling and memory visibility" to quality-tier integration

- Applied the `3d-web-experience` lens to the renderer-performance lane.
- Rechecked `src/game/renderer.ts`, `src/game/performance.ts`, and
  `src/main.ts`.
- Confirmed the live renderer already has the earlier culling/memory fixes that
  the first analysis note treated as missing:
  - instanced meshes now compute bounding spheres and keep frustum culling on;
  - the performance snapshot now includes `gpuMemoryMb`.
- The remaining live gap is narrower and more useful:
  - renderer quality knobs are still mostly static;
  - pixel ratio is still capped with a hard-coded `1.75`;
  - runtime profile selection reaches visibility detail, but not DPR or other
    expensive renderer budgets.
- That makes adaptive quality-tier integration the next renderer-focused gap,
  not a repeat of the earlier culling or GPU-memory findings.
- Evidence depth: Tier 1 static source inspection. No browser run or render
  capture was performed in this update.

## 2026-07-26 — the lab snapshot is richer than Field 02 for physics inspection, but it is still a lab-local metric shape

- Applied the `3d-web-experience` lens to the Physics Lab 01 evidence fixture.
- Rechecked `src/physics-lab/main.ts` and the lab shell.
- Confirmed the lab exposes a dedicated physics-specific snapshot with:
  - controller family,
  - paused/debug state,
  - camera mode,
  - physics frequency,
  - time scale,
  - surface identity and friction/rolling values,
  - vehicle telemetry,
  - dynamics metrics,
  - render metrics,
  - recovery count.
- That makes the lab a stronger solver/chassis inspection surface than Field 02,
  but the metric shape is still lab-local rather than a canonical runtime budget
  schema.
- The useful boundary is clearer now:
  - Physics Lab 01 is a supporting evidence fixture,
  - Field 02 remains the canonical player loop,
  - and the two surfaces should keep distinct metric shapes.
- Evidence depth: Tier 1 static source inspection. No browser run or capture
  was performed in this update.

## 2026-07-26 — the primary-action path now proves a local command outcome, but still only for one proven activity seam

- Applied the `3d-games` lens to the activity/command readiness lane.
- Rechecked `src/game/state.ts` and `src/main.ts`.
- Confirmed the primary-action path is now a real versioned command boundary:
  - `resolvePrimaryAction()` picks a semantic action before mutation,
  - `executePrimaryActionCommand()` validates the versioned command and returns
    a structured accepted/rejected outcome,
  - `performPrimaryAction()` remains the compatibility entrypoint but now
    returns that same event,
  - browser call sites capture the accepted/rejected event in the bounded run
    record.
- That is a real proof slice for one activity seam, not a generic activity
  registry.
- The remaining boundary is still the same:
  - only the proven relay/primary-action seam uses the shared outcome shape,
  - there is still no third materially different activity using the same
    matcher,
  - the generic `ActivityDefinition` registry should still wait for the third
    activity proof.
- Evidence depth: Tier 1 static source inspection. No browser/test execution
  was run in this update.

## 2026-07-26 — the snapshot now carries transition and save timing, but not the full readability rubric

- Applied the `3d-games` lens to the runtime-instrumentation lane.
- Rechecked `src/game/performance.ts` and `src/main.ts`.
- Confirmed the snapshot already exposes useful readable pressure signals:
  - frame timing,
  - FPS,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable time,
  - first-input-ready time,
  - save size,
  - terrain-build time.
- The remaining mismatch is the rubric, not the presence of metrics:
  - the KPI note still asks for per-frame actor count,
  - and active physics count,
  - but the live snapshot does not name those directly.
- So the runtime has a partially complete readability envelope: transition latency and save/load pressure are visible, while the actor/physics dimension remains implicit.
- Evidence depth: Tier 1 static source inspection. No fresh browser or benchmark capture was run in this update.

## 2026-07-26 — save/recovery messages are truthful, but they still are not a dedicated announcement surface

- Applied the `Accessibility Auditor` lens to the persistence/readout path.
- Rechecked `src/main.ts` and `index.html`.
- Confirmed the save/recovery messages are truthful:
  - fresh, restored, migrated, recovered, and fallback states are written to
    `#save-status`,
  - the text is updated from the live load result and runtime fallback
    decisions.
- The remaining gap is announcement, not truth:
  - `#save-status` is still visual-only,
  - it does not have its own `role="status"` or `aria-live`,
  - bootstrap announcements are handled separately by `#bootstrap-status`.
- So the player can read the persistence state, but may not be told about it
  through a dedicated assistive-technology announcement path yet.
- Evidence depth: Tier 1 static source inspection. No runtime assistive-tech
  walkthrough was run in this update.

## 2026-07-26 — the bootstrap shell is announced, but the persistence/status line is still visual only

- Applied the `Accessibility Auditor` lens to the public shell and status
  surfaces.
- Rechecked `index.html` and `src/main.ts`.
- Confirmed the bootstrap entry path is already announced:
  - `#bootstrap-status` has `role="status"`, `aria-live="polite"`, and
    `aria-atomic="true"`,
  - the shell also uses `aria-busy` during the transition from loading to
    ready.
- The persistence/status line is still only visible text:
  - `#save-status` updates on load/recovery/profile changes,
  - but it does not currently have its own live-region contract.
- So the player can already hear the bootstrap shell, but may still miss
  persistence or recovery changes unless they are announced through another
  path.
- Evidence depth: Tier 1 static source inspection. No runtime assistive-tech
  walkthrough was run in this update.

## 2026-07-26 — runtime-bridge 3D is already separated from gameplay-critical world truth, but the boundary is still implicit

- Applied the `3d-web-experience` lens to the runtime-bridge / gameplay-truth boundary.
- Rechecked `src/game/runtime-assets.ts`, `src/game/scene-query.ts`, and
  `src/game/renderer.ts`.
- Confirmed the code already keeps two different truths separate:
  - imported runtime-bridge assets are filtered by manifest ownership and
    public approval, and they keep fallback geometry alive on failure,
  - camera obstruction and visible-world queries still come from terrain,
    obstacles, felled state, and authored structures rather than from bridge
    meshes.
- That means the repo already has a real line between decorative/runtime-bridge
  3D and gameplay-critical world truth.
- The remaining gap is that the browser-delivery contract still doesn’t name
  that boundary publicly, so future contributors have to infer it from the code.
- Evidence depth: Tier 1 static source inspection. No runtime or browser pass
  was run in this update.

## 2026-07-26 — touch and narrow-layout support are real, but the browser delivery contract still needs a public name

- Applied the `3d-web-experience` lens to the browser delivery lane.
- Rechecked `src/main.ts` and `src/styles.css`.
- Confirmed the browser is already intentionally mobile-aware:
  - touch buttons route through the same semantic actions as keyboard and gamepad,
  - pointer capture/release keeps the touch flow in the same action model,
  - a coarse-pointer / narrow-width media query repositions the touch controls
    below the field kit instead of overlapping the desktop HUD.
- That means the experience is not desktop-only; the narrow/mobile layout is
  already part of the current browser contract.
- The remaining gap is still the named browser-delivery policy that explains
  which pieces are essential, which can degrade, and which are optional.
- Evidence depth: Tier 1 static source inspection. No runtime or device capture
  was run in this update.

## 2026-07-26 — the current lighting/material envelope is coherent, but still mostly implicit

- Applied the `3d-games` lens to the presentation / lighting lane.
- Rechecked `src/game/renderer.ts` and the existing shader/material contract trail.
- Confirmed the live renderer already has a deliberate baseline:
  - one directional sun plus one hemisphere fill,
  - ACES filmic tone mapping and explicit exposure,
  - phase-driven sky, fog, water, and headlight changes,
  - a narrow `state-shell` shader for rig integrity feedback rather than a broad custom shader stack.
- The remaining gap is still the named envelope:
  - no player/operator-visible lighting/material strategy field in the public surface,
  - no tiered material envelope that says when to stay baseline versus introduce richer modifiers,
  - no evidence that the shader/material lane should branch beyond the current scoped shader.
- Evidence depth: Tier 1 static source inspection. No runtime or browser pass was run in this update.

## 2026-07-26 — the public shell is truthful, but the active profile is still operator-facing

- Applied the accessibility/profile-visibility lens to the live browser surface.
- Rechecked `src/main.ts`, `src/styles.css`, and the browser-visible runtime diagnostics path.
- Confirmed the player-facing shell already does its job truthfully:
  - `bootstrapStatus` names the entry state,
  - `saveStatus` names the persistence state,
  - the welcome flow stays operable with keyboard focus and semantic buttons.
- The remaining gap is still the active profile signal:
  - `runtimeDiagnostics` stays hidden on the player surface,
  - active runtime profile and fallback reasons remain in the developer/evidence surface,
  - there is no durable visible input/accessibility profile indicator in the public HUD.
- Evidence depth: Tier 1 static source inspection. No runtime or browser pass was run in this update.

## 2026-07-26 — asset admission is schema-backed, but the broader authoring manifest is still future-facing

- Applied the `3d-games` lens to the authoring / reproducible-content lane.
- Rechecked `assets/asset-manifest.schema.json`, `assets/asset-manifest.json`,
  and `tools/asset-preflight.mjs`.
- Confirmed the repo now proves a real, reproducible asset-admission slice:
  - the manifest has a versioned schema,
  - required provenance and rights fields are enforced,
  - preflight validates GLB structure, safe dependency paths, and missing
    external dependencies,
  - runtime approval remains separated from public approval.
- The remaining gap is still the broader authoring envelope:
  - no general versioned content-manifest schema for activities or world
    modules,
  - no reproducible validation-result artifact for the broader authored-content
    path,
  - no runtime-ready / validation-only / deprecated lifecycle signal across the
    whole content model,
  - no general pack lifecycle that can disable or roll back invalid authored
    content without becoming a second authority surface.
- Evidence depth: Tier 1 static source and schema inspection. No runtime or
  test pass was run in this update.

## 2026-07-26 — module composition is explicit, and ECS still lacks a measured threshold

- Applied the `3d-games` lens to the ECS threshold lane.
- Rechecked `src/game/contracts.ts`, `src/game/state.ts`, and
  `src/game/physics.ts`.
- Confirmed the runtime still expresses composition directly through the
  machine-centric model:
  - `RigProfile` carries capabilities and camera/motion tuning as explicit
    data,
  - `installModule()` validates module fit, cost, ownership, and workshop
    access before mutating the active rig,
  - `effectiveProfile()` composes installed modules onto an immutable rig
    blueprint rather than delegating to a generic ECS runtime.
- The remaining gap is still the threshold proof itself:
  - no quantified actor-count or coupling trigger,
  - no canonical multi-capability entity schema beyond the current rig model,
  - no migration proof that preserves identity through a composition-model
    change,
  - no evidence that the current adapter model has crossed its useful limits.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — module composition and asset admission are real, but pack lifecycle is still future-gated

- Applied the `3d-games` lens to the modding / creator-pack lane.
- Rechecked `src/game/contracts.ts`, `src/game/state.ts`,
  `src/game/runtime-assets.ts`, and `assets/asset-manifest.json`.
- Confirmed the runtime now proves the important local substrate for packs:
  - rig capabilities and modules are data-driven,
  - `installModule()` validates cost, compatibility, and ownership before
    mutating canonical rig state,
  - asset admission is gated by a versioned manifest and preflight/rights
    metadata,
  - runtime bridges remain separated from public approval.
- The remaining gap is still the pack lifecycle itself:
  - no versioned pack manifest in the playable path,
  - no explicit pack dependency graph,
  - no staged publication or moderation workflow,
  - no general safe disable / rollback path for player-activatable packs.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — event outcomes still do not justify a generic runtime bus

- Applied the `3d-games` lens to the shared event-graph lane.
- Rechecked `src/main.ts`, `src/game/state.ts`, and `src/game/run-record.ts`.
- Confirmed the current architecture still has only a few direct consumers for
  semantic outcomes:
  - browser HUD / status surfaces,
  - replay and verification hooks,
  - diagnostics / run-record capture,
  - the owning simulation/state reducers.
- The repo still has not crossed the justification threshold for a generic
  runtime event bus or fan-out registry.
- The bounded run record remains the audit/replay spine, not a pub/sub system.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — first-use guidance is canonical, but remapping is still future work

- Applied the `3d-games` lens to the input and control-guidance lane.
- Rechecked `src/main.ts`, `src/game/control-guidance.ts`, and
  `src/game/input.ts`.
- Confirmed the runtime now has a real canonical first-use guidance surface:
  - `resolveControlLesson()` picks a single context-aware lesson from semantic
    gameplay relevance,
  - the lessons are non-modal and suppress themselves when welcome, map, or
    pause owns attention,
  - learned lesson IDs persist in browser-local storage so the same explanation
    does not keep reappearing after the player has used it.
- The remaining gap is still the policy layer the contract names:
  - no persisted remap schema,
  - no visible input/accessibility profile state,
  - no cross-device preference sync,
  - no formal parity statement for intentionally unsupported differences.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — local authority now exposes source metadata and reject paths

- Applied the `3d-games` lens to the authority lane.
- Rechecked `src/main.ts`, `src/game/state.ts`, and `src/game/storage.ts`.
- Confirmed the local-first authority model now makes its structure explicit:
  - `primaryAction` and `selectRig` each emit a versioned command intent plus a
    separate simulation-origin outcome event,
  - accepted and rejected outcomes carry stable reason codes,
  - `loadState()` surfaces `sourceKey`, `sourceSchemaVersion`,
    `worldMemoryPresent`, and `recoveryReason`.
- The remaining gap is still the remote/shared-state envelope:
  - no authenticated remote mutation API,
  - no shared-state/server-authoritative boundary,
  - no durable-value rejection transport.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — resource fallback is visible, but the wider budget ledger is still open

- Applied the `3d-games` lens to the resource-budget lane.
- Rechecked `src/game/performance.ts`, `src/game/runtime-profile-policy.ts`,
  and the browser wiring in `src/main.ts`.
- Confirmed the runtime now has a real visible fallback and recovery path:
  - `runtimeProfileFallback` and `runtimeProfileRecovery` checkpoints record the
    active profile plus triggering reasons,
  - the player sees `Performance safeguard active: reduced scenery detail.`,
  - developer diagnostics expose fps, draw calls, geometry/texture counts,
    heap, bridge status, visibility counts, and the active profile summary.
- The remaining gap is still the broader resource-governance envelope:
  - no cross-system CPU/GPU/memory ledger,
  - no named subsystem owner for those budgets,
  - no thermal or battery-sensitive policy,
  - no representative-device threshold for the wider app.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — replay validation now has an admitted baseline

- Applied the `3d-games` lens to the replay lane.
- Rechecked `src/game/run-record.ts`, `src/game/replay-validator.ts`, and
  `src/game/storage.ts`.
- Confirmed the current run record now carries a versioned admitted initial
  context with separate state and world-memory hashes.
- Confirmed the local replay validator now reconstructs from that admitted
  baseline and uses checkpoint hashes as the divergence anchor.
- The remaining gap is still the same public artifact boundary:
  - no browser playback transport,
  - no ghost/share compatibility envelope,
  - no user-facing replay divergence report,
  - no replay-safe trust split exposed to players.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — visibility tiering is explicit, representation LOD is still future work

- Applied the `3d-games` lens to the visibility/LOD lane.
- Rechecked `src/game/visibility.ts` and the renderer diagnostics path that
  surfaces it.
- Confirmed the runtime now has a stable visibility budget:
  - `full`, `standard`, and `mobile-safe` profiles,
  - `near`, `mid`, `far`, and `culled` tiers,
  - candidate/submitted/capacity-limited counters,
  - active profile exposure in developer diagnostics.
- The active `standard` profile still preserves the existing `farMeters = 168`
  radius, so this remains accounting and observability rather than geometric
  asset LOD.
- The remaining gap is still representation-level LOD for imported assets.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — camera feel is now a resolved policy surface

- Applied the `3d-games` lens to the camera lane.
- Rechecked `src/main.ts`, `src/game/renderer.ts`, and `src/game/state.ts`.
- Confirmed the camera is no longer hidden behind renderer-only behavior:
  - `camera-select` is visible in the UI,
  - camera changes record commands and checkpoints,
  - `getCameraResolutionEvidence()` exposes obstruction and resolved pose data,
  - reduced-motion trims expression without changing spatial safety.
- The remaining gap is not the camera system itself but the player-facing
  explanation layer:
  - no explicit camera reason string,
  - no advisory recommendation surface,
  - no separate durable camera-policy artifact beyond save-state mode plus
    runtime evidence.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — browser loading and profile affordance recheck

- Applied the `3d-web-experience` lens to the public browser surface.
- Rechecked `src/main.ts`, `src/styles.css`, and the loading/bootstrap contract.
- Confirmed the browser has an explicit shell and operator-visible state:
  - `bootstrapStatus` flips to `ready`,
  - fallback profile text is visible when scenery detail is reduced,
  - `runtimeDiagnostics` exposes renderer and profile evidence,
  - `mapProgress` is world-survey progress and sight range.
- The gap remains first-class browser affordance, not raw readiness:
  - no public loading percentage,
  - no loading bar,
  - no visible profile chooser.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — streaming residency and asset approval separation

- Applied the `3d-games` lens to the next world-scale boundary.
- Rechecked the live source split:
  - `src/game/gameworld.ts`
  - `src/game/storage.ts`
  - `assets/asset-manifest.json`
  - `src/game/runtime-assets.ts`
- Confirmed the world is still one canonical residency, while asset approval is
  already a separate manifest gate:
  - world memory snapshots and restores remain composed through one save
    payload,
  - runtime bridge assets are filtered by `publicRuntimeApproved`,
  - streaming should therefore keep residency ownership separate from asset
    provenance.
- The remaining gap is still the same first-principles boundary:
  - no chunk manifest,
  - no residency lifecycle,
  - no activation/unload/rollback planner,
  - no active-chunk budget or churn counters.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — asset pipeline and provenance recheck

- Applied the `3d-games` lens to the asset-governance lane.
- Rechecked the manifest and runtime bridge source:
  - `assets/asset-manifest.json`
  - `src/game/runtime-assets.ts`
  - `docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md`
- Confirmed the registry now has four entries and two runtime-tested GLB bridge
  assets, while `publicRuntimeApproved` still gates player visibility.
- The current gap is narrower and more useful:
  - no publicRuntimeApproved asset yet,
  - no manifest-backed public release path,
  - no replacement/deprecation cycle exercised on a publicly approved asset.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture or
  test execution was run in this pass.

## 2026-07-26 — command and event envelope recheck

- Applied the `3d-games` lane to the event-graph boundary.
- Rechecked `src/main.ts`, `src/game/run-record.ts`, and
  `src/game/replay-validator.ts`.
- Confirmed the repo now has a reusable local event envelope:
  - ordered entries with `eventVersion`, `originDomain`, and replayability
    classification,
  - command and diagnostics-only outcome capture in the same bounded history,
  - replay validation that can re-run the portable subset and reject
    unsupported or divergent entries.
- The shared event graph itself is still missing:
  - no generic subscriber/fan-out registry,
  - no per-handler ownership map,
  - no deduplication policy for replay-safe consumers,
  - no domain-owned event bus separate from the run record.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture or
  test execution was run in this pass.

## 2026-07-26 — authority boundary recheck

- Applied the `3d-games` lens to the current authority lane.
- Rechecked `src/main.ts`, `src/game/state.ts`, `src/game/run-record.ts`, and
  the active authority contract.
- Confirmed the live mode is still local-first and deterministic, but now with
  a sharper intent/outcome split:
  - command intent is recorded explicitly,
  - canonical state mutation still lives in the simulation kernel,
  - a separate simulation-origin event records the authoritative outcome,
  - replayable input is separated from diagnostics-only simulation/storage
    entries in the run record.
- The missing layer remains unchanged:
  - no authenticated request/response boundary,
  - no explicit reject-path state separation beyond local deterministic
    mutation,
  - no durable-value recovery metadata as policy,
  - no operator-visible authoritative outcome summary,
  - no shared-state/server-authoritative artifact.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this update.

## 2026-07-26 — replay validation surface recheck

- Applied the `3d-games` lane to the replay/proof boundary.
- Rechecked `src/game/run-record.ts`, `src/game/replay-validator.ts`, and
  `src/main.ts`.
- Confirmed the browser now exposes:
  - `getRunRecord()`,
  - `getRunRecordVerification()`,
  - `getRunRecordReplayValidation()`.
- The validator is now a real executable proof:
  - it reconstructs the admitted initial context,
  - replays the portable command/input subset,
  - verifies checkpoint tick hashes,
  - and reports unsupported or diverged entries with explicit codes.
- The missing boundary remains the product artifact surface:
  - no browser playback transport,
  - no ghost/share compatibility envelope,
  - no end-user replay divergence report,
  - no trust split for replay-safe versus diagnostics-only artifact data.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture or
  test execution was run in this pass.

## 2026-07-26 — resource budget and fallback envelope recheck

- Applied the `3d-games` lens to the active resource-governance lane.
- Rechecked `src/game/performance.ts`, `src/game/runtime-profile-policy.ts`,
  and `src/main.ts` against the existing resource-budget contract.
- Confirmed the repo now has a real visual-budget fallback path:
  - runtime checkpoints record `runtimeProfileFallback` and
    `runtimeProfileRecovery` with reasons,
  - the player sees `Performance safeguard active: reduced scenery detail.`,
  - developer diagnostics show the active profile, visibility counts, draw
    calls, geometry/texture counts, and heap where available.
- The remaining gap is broader than renderer pressure:
  - no cross-system CPU/GPU/memory ledger,
  - no named subsystem owner for the wider budgets,
  - no thermal or battery-sensitive policy,
  - no evidence-backed representative-device threshold for the full app.
- Evidence depth: Tier 1 static source inspection. No browser capture or test
  execution was run in this pass.

## 2026-07-26 — 3D skill-to-repo ledger synthesis pass

- Continued the active 3D analysis using the `3d-games` lens after the browser
  loading/bootstrap lane.
- Rechecked the current renderer, camera, portal, visibility, and collision
  evidence, then consolidated the lane boundaries in the active execution
  ledger.
- Current synthesis:
  - visibility/LOD now has a real Tier 1 seam in `src/game/visibility.ts`, but
    it still stops short of representation-changing asset LOD or subsystem
    cadence control;
  - camera policy is already explicit enough that the remaining work is
    product-facing recommendation/visibility, not a parallel state machine;
  - portal visibility remains future-bound because the world is still
    open-world first and has no room graph or portal edge model;
  - collision remains a narrow deterministic obstacle/terrain-face boundary,
    with the broader category/mask registry still deferred until a third
    contact class needs it.
- Evidence depth: Tier 1 static source inspection. No fresh runtime capture
  was run in this pass.

## 2026-07-26 — web loading/bootstrap surface recheck

- Applied the `3d-web-experience` skill to the browser-facing loading lane.
- Rechecked `src/main.ts` and `src/styles.css` against the existing
  `WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT` note.
- Confirmed the browser already has a real textual bootstrap shell and
  operator-visible diagnostics:
  - `bootstrapStatus` starts as live text and flips to `ready` on world entry,
  - `runtimeDiagnostics` exposes the selected profile and fallback reasons,
  - `mapProgress` reports surveyed world coverage and sight range.
- The remaining gap is a named public loading affordance:
  - `mapProgress` is world-survey progress, not startup progress,
  - there is no dedicated loading percentage or progress bar,
  - there is no visible profile chooser on the public surface.
- Evidence depth: Tier 1 static source inspection. The browser daemon poll
  timed out in this pass, so no fresh runtime capture was added.

## 2026-07-26 — renderer resource-count observability

- Applied the `threejs-performance` skill to the existing performance monitor,
  renderer metrics, and fallback policy.
- Added raw renderer geometry and texture allocation counts to snapshots,
  checkpoints, and developer diagnostics without fabricating a GPU-memory byte
  estimate or adding unmeasured automatic degradation.
- Kept adaptive behavior scoped to the proven visibility policy; asset and
  residency budgets remain future measured decisions.
- Evidence depth: Tier 1 source/test implementation. No test or browser capture
  was run in this pass.

## 2026-07-26 — bounded mobility-adapter proof reconciliation

- Rechecked ground and hover motion against the current contracts, physics
  registry, state creation, and recovery behavior.
- Confirmed the project has a real two-family locomotion proof: discriminated
  mobility state, strict profile/state mismatch rejection, shared semantic
  input, and adapter-owned stepping/settling.
- Recorded the third-family gate: only a real new locomotion grammar may justify
  a versioned shared context; no generic vehicle hierarchy or speculative
  adapter taxonomy was added.
- Evidence depth: Tier 1 static source review, retaining prior focused/runtime
  evidence without rerunning it.

## 2026-07-26 — event-graph staging surface recheck

- Re-checked the command/event lane against the live `run-record` envelope and
  the browser entry wiring.
- Confirmed the repo now has a canonical ordered history substrate, but still
  no shared dispatch graph:
  - no fan-out registry,
  - no per-handler ownership map,
  - no replay-safe dedup policy,
  - no playback-vs-diagnostics consumer split.
- Recorded the distinction in the event-graph contract so later work does not
  confuse canonical command history with a first-class event bus.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — replay source-scan recheck

- Re-checked the replay lane after the latest record-only confirmation.
- A fresh source scan still finds no playback entrypoint, ghost share API, or
  divergence-report executor in runtime code.
- The repo remains strong as a recorder/verifier, but not yet as a shareable
  replay surface.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — collision source-scan recheck

- Re-checked the runtime collision lane after the latest source scan.
- `src/game/collision.ts` still only exposes the narrow first-playable obstacle
  behavior:
  - trees are fellable,
  - rocks block and slide,
  - determinism is preserved through the generated obstacle field.
- The repo still has no first-class category/mask registry in runtime code, so
  triggers, sensors, hazards, and projectiles remain future policy work rather
  than hidden assumptions.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — streaming residency source-scan recheck

- Re-checked the world residency lane against the current source.
- `src/game/gameworld.ts` still models one canonical world with terrain,
  obstacles, and exploration as live fields, not chunk manifests.
- `src/game/storage.ts` still persists that world as one composed payload
  alongside state, so load/save remains single-residency.
- `src/game/world.ts` still defines one authored field bounded by one radius and
  one site set, which keeps the streaming trigger intentionally future-bound.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — asset authority and mesh contract recheck

- Re-checked the asset authority lane against the live manifest and runtime
  bridge.
- The manifest now has two real runtime GLB entries, but both remain
  `publicRuntimeApproved: false`, so the bridge is developer-scoped rather than
  publicly approved.
- That means the live runtime bridge exists, but the manifest still owns the
  source, rights, and approval boundary rather than the mesh itself.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — behavior/planner contract introduced

- Added a dedicated contract note for the current affordance resolver and
  primary-action path.
- The repo now distinguishes a real deterministic behavior boundary from a
  future multi-candidate planner:
  - one versioned affordance contract exists,
  - primary action resolution consumes it,
  - no general planner or tie-break trace exists yet.
- Evidence depth: Tier 1 source/doc implementation. No runtime or test pass was
  run in this step.

## 2026-07-26 — accessibility and profile-visibility recheck

- Re-checked the live public surface with the accessibility skill.
- The UI already has real keyboard and focus mechanics plus semantic button and
  link controls; it is not pointer-only.
- The remaining gap is still the same:
  - no player-facing profile/status indicator,
  - fallback/reduced-profile state is still mostly indirect to players,
  - the public contract for comfort state is still not explicit.
- Evidence depth: Tier 1 static source inspection. No runtime/browser proof was
  run in this step.

## 2026-07-26 — ecs threshold and composition recheck

- Re-checked the live composition lane against the ECS threshold contract and
  the current runtime source.
- The code still expresses the machine-centric model directly:
  - `src/game/contracts.ts` composes installed modules onto immutable rig
    blueprints,
  - `src/game/state.ts` keeps rigs, modules, and world state explicit,
  - `src/game/gameworld.ts` keeps world memory as bounded sets and snapshots.
- The current live scale still does not justify an ECS migration:
  - only three rigs are active,
  - authored sites remain a small fixed set,
  - world memory is bounded and replayable,
  - no broad entity zoo or coupling pressure is visible yet.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — authority local intent/outcome split recheck

- Re-checked the live authority lane after the run-record event-envelope
  correction.
- The local authority boundary is now more explicit:
  - `src/main.ts` records explicit `primaryAction` intent,
  - `src/game/state.ts` resolves and mutates canonical state locally,
  - `src/main.ts` records a separate simulation-origin `primaryActionOutcome`
    event.
- That keeps the current authority mode local-first while still making the
  intent-versus-outcome split auditable in the run record.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — simulation layers and resource governance recheck

- Re-checked the live simulation-layer lane against the current runtime source.
- The code already behaves like a layered sim in practice:
  - `src/game/state.ts` owns deterministic kernel ordering and game-state
    consequences,
  - `src/game/gameworld.ts` keeps spatial memory bounded and serializable,
  - `src/game/performance.ts` measures pressure,
  - `src/game/runtime-profile-policy.ts` turns measured pressure into a
    renderer-only fallback path,
  - `src/main.ts` surfaces the measurements and selected profile.
- The missing layer is still broader resource governance:
  - no budget owner for non-render layers,
  - no active-actor/residency/save budget table,
  - no first-class downgrade policy for simulation, persistence, or content
    layers.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — modding and creator-pack lifecycle recheck

- Re-checked the live content-admission lane against the manifest and
  preflight code.
- Asset admission is now real in a local slice:
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, path safety, digest
    integrity, and missing dependencies,
  - runtime bridges exist for approved/tested GLBs while public approval stays
    separately gated.
- The broader creator-pack lifecycle is still missing:
  - no versioned pack manifest in the playable path,
  - no explicit dependency graph for packs,
  - no staged publication or moderation workflow,
  - no runtime-ready / validation-only / deprecated status across general
    authored content,
  - no safe disable or rollback path for a pack lifecycle that players can
    actually activate.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — modding creator packs bridged to episode grammar

- Added an addendum to `docs/research/MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md`
  stating that episode grammar depends on pack validation to keep pack lifecycle
  explicit and that local-only pack posture remains the live mode.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  modding and creator-pack lane now explicitly sits beneath episode grammar.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — minimap and navigator coordinate recheck

- Re-checked the live coordinate layer against the minimap and navigator UI
  source.
- The field map remains anchored to the canonical world radius and persistent
  world memory.
- The tactical navigator overlay still uses a separate hardcoded `200` world
  scale for radar placement and click-to-world conversion.
- That means the UI has two explicit scale assumptions today, which should stay
  visible until a formal rebasing / transform contract exists.
- Evidence depth: Tier 1 static source inspection. No runtime or test pass was
  run in this step.

## 2026-07-26 — rumor-map canonical world and activity alignment

- Replaced duplicated site coordinates, names, biomes, elevations, and verbs in
  the live rumor graph with derivation from `WORLD_SITES`.
- Corrected the visible cargo-relay story from an obsolete Quarry Shelf route to
  the canonical Long Furrow delivery contract, including its graph placement
  and delivery edge.
- Preserved graph-specific descriptions, capability gates, and relationship
  metadata, and added focused canonical-source coverage.
- Evidence depth: Tier 1 source/test implementation. No test or browser map
  interaction was run in this pass.

## 2026-07-26 — world-memory projection ownership containment

- Audited `src/game/world-memory.ts` against canonical terrain deformation,
  storage, and rendering paths. The soil-cell map is currently test-only and
  derives from state history; it is not a live simulation, persistence, or
  rendering source.
- Preserved the prototype but marked it read-only and non-authoritative so a
  future route-wear or map feature cannot accidentally create a second terrain
  truth source.
- Added a durable activation contract requiring derivation from canonical world
  deltas, disposable reconstruction, and equivalence evidence before use.
- Evidence depth: Tier 1 static reference/source review. No runtime behavior or
  test execution claimed.

## 2026-07-26 — shader and material contract reconciliation

- Applied the dedicated `threejs-shaders` skill to the current renderer and
  corrected the material strategy record: the field uses PBR/vertex-color
  baselines plus one presentation-only state-shell shader, not a generic shader
  library or standard-material-only path.
- Confirmed its uniforms derive from canonical rig feedback and it remains
  non-authoritative, non-solid VFX; no terrain/weather/wear shader fork was
  added without a measured player-readability requirement.
- Recorded the adoption gate for future shader work: canonical input ownership,
  baseline fallback, strategy diagnostics, and Tier 2/Tier 3 evidence.
- Evidence depth: Tier 1 static source and skill review. No shader/browser
  verification run in this pass.

## 2026-07-26 — primary-action command and outcome proof

- Added the first explicit local command contract around cargo relay primary
  actions: versioned actor intent -> validation -> existing state transition ->
  immutable accepted/rejected outcome with stable reason codes.
- Preserved `performPrimaryAction` as the compatibility entrypoint and captured
  its returned outcome in the bounded run record at player and acceptance call
  sites, without adding a second event store or a network authority path.
- Added focused state coverage for accepted relay attachment and rejected
  inactive-actor commands.
- Evidence depth: Tier 1 source/test implementation. No test, replay playback,
  or browser acceptance run in this pass.

## 2026-07-26 — runtime-profile renewed-pressure correction

- Corrected `RuntimeProfileController` so every new measured fallback breach
  restarts the required uninterrupted healthy recovery interval.
- Added a regression case covering initial fallback, partial recovery, renewed
  renderer pressure, insufficient renewed health, and eventual valid recovery.
- Kept the issue review open because focused test and browser fixture evidence
  were not run in this pass; static code presence is not behavioral proof.
- Evidence depth: Tier 1 source/test implementation.

## 2026-07-26 — activity and content-contract readiness boundary

- Reconciled current rig, module, affordance, activity-state, and primary-action
  code against the machine/capability architecture direction.
- Confirmed typed authored tables and a single cargo relay remain the correct
  current implementation, while activity definitions, per-contract versioning,
  semantic command validation, and domain events are not yet implemented.
- Recorded the two-activity proof gate and the staged typed-definition ->
  command/event -> external-content validation path in
  `docs/research/ACTIVITY_CONTENT_AND_COMMAND_CONTRACT_READINESS_2026-07-26.md`.
- Evidence depth: Tier 1 static inspection; no external-content or browser
  validation claimed.

## 2026-07-26 — production-asset LOD gate reconciliation

- Applied the `3d-asset-production` skill to the manifest, runtime bridge, and
  visibility policy.
- Confirmed the two GLB bridge candidates are runtime-tested developer assets
  with one representation each and no public approval; they do not prove
  geometric LOD.
- Recorded the first real LOD admission requirements: linked variants, stable
  spatial/collision/socket/material contracts, provenance, thresholds, and
  browser/readability evidence.
- Evidence depth: Tier 1 source/manifest review, retaining prior bridge runtime
  evidence without re-running it.

## 2026-07-26 — camera-policy reconciliation

- Applied the user-named `3d-games` camera guidance to current code, tests,
  contracts, and ADR evidence.
- Corrected the camera contract: the executable policy already has typed modes,
  per-rig sockets, collision-aware final-pose resolution, reduced-motion
  behavior, mode/discontinuity safety, and detailed camera evidence.
- Avoided adding a duplicate camera framework. The remaining real work is
  explainable player-overridable recommendations and current browser feel
  capture across rigs/viewports.
- Evidence depth: Tier 1 fresh static review, retaining prior Tier 2/Tier 4
  evidence without claiming it was re-run.

## 2026-07-26 — authority lane continuation

- Read the authority-model groundwork contract against the current command/event and save/recovery spine.
- Confirmed the live mode is still local-first; the next proof should be one local authenticated mutation envelope rather than a multiplayer claim.
- Appended the concrete local-authority gap to the contract and the canonical exploration map.
- Evidence depth: Tier 1 static inspection with prior Tier 4 runtime anchors.

## 2026-07-26 — engine-branch lane continuation

- Read the engine-branch evaluation contract against the current repo posture.
- Confirmed the canonical Three.js path is explicit, but the branch-opening trigger is still missing.
- Appended the measurable-trigger gap to the engine-branch contract and the canonical exploration map.
- Evidence depth: Tier 1 static inspection.

## 2026-07-26 — runtime-profile hysteresis issue review

- Identified a local recovery-clock defect after the initial hysteresis pass:
  renewed measured pressure updates reasons but does not yet reset the recovery
  window.
- Added `docs/reviews/runtime_profile_hysteresis_issue_review.md` with the
  user/system impact, exact correction, focused regression shape, and browser
  acceptance evidence required before the recovery guarantee is claimed.
- Status: open correction required; initial fallback remains separately scoped.

## 2026-07-26 — renderer fallback recovery hysteresis

- Added monotonic lifetime frame evidence so policy timing does not depend on a
  capped rolling frame window.
- Added a controller that holds `mobile-safe` through 180 healthy frames,
  refreshes the hold on renewed pressure, and restores `standard` once the
  evidence window closes.
- Fallback and recovery are both visible, checkpointed, and limited to the
  renderer's deterministic visibility budget.
- Evidence depth: Tier 1 source/test implementation. No tests, browser
  verification, or representative-device capture was run in this pass.
- Open closure: calibrate the provisional window from captures and prove
  readability/cost deltas across actual profile transitions.

## 2026-07-26 — measured renderer visibility fallback

- Connected the measured `standard`/`mobile-safe` policy to the renderer's
  actual instanced-prop budget through `GameRenderer.setVisibilityProfile`.
- First qualified pressure activates a stable, one-way session fallback,
  immediately rebuilds deterministic scenery, records a checkpoint with reason
  codes, exposes state in snapshots/developer diagnostics, and presents a
  player-safe reduced-scenery notice.
- No gameplay state, input meaning, physics cadence, save behavior, or automatic
  `full` promotion changed.
- Evidence depth: Tier 1 source implementation. No automated tests, browser
  session, or representative-device capture was run in this pass.
- Open closure: renderer-swap tests, hysteresis/recovery policy, before/after
  metrics capture, and browser readability proof.

## 2026-07-26 — measured runtime-profile policy seed

- Applied the `3d-web-experience` skill to the existing browser telemetry and
  visibility ladder.
- Added frame-sample observability plus a pure `standard`/`mobile-safe`
  selection policy that never guesses from user-agent data or auto-promotes
  `full`. It holds standard until a 90-frame window exists and records every
  fallback reason.
- Added focused unit coverage for insufficient evidence, within-budget standard,
  and multi-reason low-budget fallback selection.
- Evidence depth: Tier 1 source/test implementation. No tests, browser run, or
  representative-device capture was executed in this pass.
- Open closure: wire the policy to safe renderer profile swapping, make the
  active decision visible, define hysteresis, and capture fallback continuity.

## 2026-07-26 — versioned run-record event envelope

- Evolved the existing bounded run record rather than creating a parallel event
  store. Schema v2 entries now expose deterministic sequence/id, event version,
  origin domain, and replayable-versus-diagnostics classification.
- Added focused unit coverage for ordered repeated inputs, diagnostic checkpoint
  and save classifications, and envelope verification.
- Evidence depth: Tier 1 source/test inspection. No automated test or runtime
  execution was run in this pass.
- Open closure: event-specific payload schemas, handler registration/fan-out,
  idempotent event kinds, durable migration, and authority transport remain
  separate gates.

## 2026-07-26 — collision-policy continuation

- Applied the named `3d-games` skill to the real collision and scene-query
  ownership boundaries.
- Confirmed two intentional consumers already share world truth: deterministic
  rig contact and camera obstruction. Existing `rigCollider` and
  `cameraOccluder` roles remain the canonical narrow policy.
- Recorded the durable matrix trigger: add a category/mask registry only with
  the first third pairwise consumer such as a projectile, sensor, pickup,
  hazard, or AI line-of-sight system.
- Evidence depth: Tier 1 static source/test/contract review. No checks were run
  during this documentation pass.

## 2026-07-26 — creator-pack lane continuation

- Read the modding and authoring validation contracts against the current asset and content-validation slices.
- Confirmed that local content validation is real, but general creator-pack lifecycle support is still future-gated.
- Appended the pack-lifecycle gap to the modding and authoring contracts and the canonical exploration map.
- Evidence depth: Tier 1 static inspection with earlier Tier 4 runtime anchor.

## 2026-07-26 — behavior/planner lane continuation

- Read the behavior-system and planner contracts against the current command/state spine.
- Confirmed the runtime already performs single-verb decision resolution, but not a separate multi-candidate planner.
- Appended the next proof slice to the behavior contract and the canonical exploration map, narrowing the next step to a machine/task selector or activity scorer with deterministic tie-breaks.
- Evidence depth: Tier 1 static inspection with existing Tier 4 runtime anchor.

## 2026-07-26 — resource-budget lane continuation

- Read the resource budget and renderer/profile contracts against the current performance hooks.
- Confirmed that the runtime now measures enough signals for a policy envelope, but the fallback ownership is still implicit.
- Appended the budget/fallback gap to the resource envelope contract and the canonical exploration map.
- Evidence depth: Tier 1 static inspection with prior Tier 4 runtime anchor.

## 2026-07-25 — 3D Optimization Gaps "and more" pass

### Objective

- Analyze the full `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676` follow-on guidance against current project state and append explicit execution gates for contract correctness, scaling, and deferred claims.

### What was changed

- Appended the synthesis section in:
  - [docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md) to classify:
    - what can be formalized immediately,
    - what is possible now,
    - and what is deferred until tests close.
- Ensured map-level gate status remains aligned with the open queue in [docs/exploration/EXPLORATION_MAP.md](exploration/EXPLORATION_MAP.md), including culling/LOD/streaming/replay/authority gates.

### Evidence and status

- Type of change: documentation only, architecture continuity update.
- Evidence depth: Tier 1 with static source-to-doc trace and explicit gap ranking.
- Runtime validation: not executed in this pass.
- Completion level: planning and sequencing gates tightened; execution gates still pending.

### Why this matters

- Prevents the requested long-pass from becoming an undocumented "future list."
- Preserves the current long-term architecture by sequencing high-risk systems behind deterministic replay/validation gates.
- Keeps authority, ECS, and broad streaming claims deferred with explicit close conditions.

### Next closure criteria

- Add command fixture and one explicit reject path test.
- Ship versioned capability and activity definitions with migration semantics.
- Add deterministic replay artifact and playback parity assertion.
- Add chunked world lifecycle counters tied to deterministic IDs.

## 2026-07-25 — 3D web-delivery and command-capability contract continuation

### Objective

- Continue the architecture analysis lane by continuing one-skill-at-a-time review and documenting web-delivery + contract-first execution gates directly in repo artifacts.

### What was changed

- Read and applied additional skill guidance from:
  - [3d-web-experience](/Users/pranay/Projects/skills/3d-web-experience/SKILL.md)
- Added:
  - [docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
- Linked this audit into exploration/decision records by appending:
  - [docs/decisions/ADR-0011-command-capability-affordance-state-separation.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0011-command-capability-affordance-state-separation.md) linkage in roadmap
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md) web-delivery addendum

### Evidence and status

- Type of change: docs/decision continuity update.
- Evidence depth: Tier 1 static alignment plus explicit policy-to-artifact linkage checks.
- Runtime validation: not executed in this pass.
- Completion level: planning proof gates and decision continuity advanced; implementation gates still pending.

### Why this matters

- Prevents the web layer from becoming a “render only” afterthought.
- Ensures reduced-motion/load/fallback behaviors are treated as invariants, not optional polish.
- Keeps command/affordance architecture continuation tied directly to web performance and accessibility commitments.

### Next closure criteria

- Bind profile selection to measured startup/runtime thresholds.
- Add deterministic reduced-motion camera/input fallback behavior.
- Add content ingest reject paths with schema/payload validation before activation.
- Implement one end-to-end command->validation->state->event->presentation interaction with event telemetry.

# Worklog and Evidence Register

## 2026-07-26 — accessible bootstrap-state implementation

- Used the Accessibility Auditor guidance to convert the existing welcome shell
  into the canonical accessible entry contract rather than creating a second
  loading overlay.
- `index.html` now starts `#game-shell` busy and provides a labeled modal entry
  dialog with an atomic polite live status. `src/main.ts` changes the status to
  ready once world/storage initialization finishes and places focus on the entry
  control; the existing entry action still transfers focus to `#game-canvas`.
- `src/styles.css` provides explicit loading/ready text prefixes without relying
  on color or animation to communicate state.
- Evidence depth: Tier 1 static implementation. No automated test, browser
  walkthrough, or screen-reader run was executed in this pass.
- Open closure: add a measured quality-profile policy and exercise a deliberate
  bootstrap failure so fallback/retry semantics are truthful before any public
  readiness claim.

## 2026-07-26 — visibility and state-shell lane continuation

- Read the visibility/profile contracts and the state-shell visual-quality research.
- Reconfirmed that the repo now measures renderer visibility and profile tiers, but the actual vehicle-state shell is still an architectural lane rather than a browser-proved canonical profile.
- Appended the remaining shell-language gap to the VFX contract and the canonical exploration map.
- Evidence depth: Tier 1 static inspection with prior Tier 4 browser anchoring for the runtime surface.

## 2026-07-26 — command/event lane continuation

- Read the current command/event contract and run-record shape against the live repo state.
- Confirmed that the app still has local history capture, but no reusable shared event envelope yet.
- Appended the event-graph gap to the contract and the canonical exploration map so the next proof slice stays focused on a versioned envelope rather than another local record path.
- Evidence depth: Tier 1 static inspection plus existing Tier 4 runtime staging proof.

## 2026-07-26 — 3d-asset-production continuation

- Read the `3d-asset-production` skill and applied it to the current manifest-driven asset bridge.
- Rechecked the live browser daemon and the asset manifest: two imported GLB bridge assets are runtime-tested, but both remain `publicRuntimeApproved: false`.
- Appended the asset-production gap to the asset pipeline contract so runtime loading stays distinct from public approval.
- Evidence depth: Tier 4 runtime/status observation plus Tier 1 skill, manifest, and doc inspection.

## 2026-07-26 — accessibility lane continuation

- Read the `Accessibility Auditor` skill and applied it to the current browser-delivery gap.
- Rechecked the live browser daemon for the Field 02 surface; it remains live and operable.
- Appended explicit accessibility policy notes for truthful loading, fallback, and visible quality/profile state to the accessibility contract and runtime findings.
- Evidence depth: Tier 4 runtime/status observation plus Tier 1 skill and doc inspection.

## 2026-07-26 — 3d-web-experience continuation

- Read the `3d-web-experience` skill and used it to frame the next analysis lane after the 3D engine and asset-provenance passes.
- Rechecked the live browser daemon: it is still running on `http://127.0.0.1:4173/?acceptance=field-02` with title `Rigs Unbound — Field 02`.
- The next documented gap is the browser-delivery contract: truthful loading state, recoverable fallback behavior, and explicit quality-profile selection for constrained devices.
- Evidence depth: Tier 4 runtime/status observation plus Tier 1 skill and doc inspection.

## 2026-07-25 — 3d-web-experience runtime check

- Used the `3d-web-experience` skill to inspect the live Field 02 browser
  surface rather than only the static docs.
- Confirmed the current page is canvas-first and still exposes the expected
  accessibility and operator hooks:
  - `#game-canvas`
  - `#map-canvas`
  - skip link to `#game-canvas`
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
- The same DOM snapshot did not show a separate `progress`, `aria-busy`, or
  other explicit loading marker, so the next web-experience question is whether
  the minimal loading/fallback chrome is intentional or should be made
  explicit for slower/public entry.
- Evidence depth: Tier 4 runtime/manual observation on
  `http://127.0.0.1:4173/?p0-repro=welcome`.

## 2026-07-25 — web asset ingest snapshot correction

- Re-checked the browser daemon while continuing the asset ingest / provenance
  lane.
- Corrected the current runtime surface in the asset-ingest contract from
  `Rigs Unbound — Physics Lab 01` to `Rigs Unbound — Field 02`; the daemon
  still reports zero console logs.
- The correction does not change the architectural conclusion:
  - the live runtime remains asset-light and procedurally authored,
  - `src/game/renderer.ts` still documents zero texture assets for the current
    terrain pass,
  - no imported runtime GLB/FBX/texture manifest is active in the playable
    path yet.
- The missing durable milestone is still a versioned manifest that the runtime
  actually consumes before browser asset activation becomes a live gate.

## 2026-07-25 — web loading bootstrap snapshot continuation

- Re-checked the live browser daemon while continuing the browser delivery lane.
- The current runtime surface remains `Rigs Unbound — Field 02`, with zero
  console logs in the daemon snapshot.
- The browser still has the right shell behavior:
  - `welcome-panel` is the real startup shell,
  - `saveStatus` gives a live text boot state,
  - entering the world dismisses the shell and focuses the canvas.
- The remaining open question is still explicit bootstrap visibility:
  - no separate progress meter,
  - no startup percentage,
  - no runtime profile selector visible to the player.
- That means the runtime is past the dead-black-box risk, but the loading /
  profile policy is still implicit rather than fully first-class in the UI.

## 2026-07-25 — threshold capture selection recheck

- Re-checked the threshold capture selection protocol against the live Field 02
  runtime.
- The protocol still matches the current app shape and the fresh review images
  already on disk:
  - `docs/reviews/assets/field-02-front-forward.png`
  - `docs/reviews/assets/field-02-top-down.png`
  - `docs/reviews/assets/rig-lab-01-desktop.png`
  - `docs/reviews/assets/rig-lab-01-narrow.png`
- The right comparison categories remain unchanged:
  - near-field dense scene,
  - occluded / hidden scene,
  - distance-gradient scene,
  - pressure scene,
  - reduced-motion comparison scene.
- What is still missing is the packaged comparison bundle itself: fixture id,
  metrics capture, screenshot/frame capture, operator note, and threshold state.

## 2026-07-25 — asset-production review continuation

- Re-checked the asset-production review against the live Field 02 runtime and
  the current `assets/asset-manifest.json` posture.
- The manifest remains the canonical registry and still contains:
  - two reference/concept tractor records,
  - one proposed Kenney static-prop fixture record,
  - `runtimePath: null` for all current entries.
- Slice A is therefore the right boundary:
  - provenance/rights metadata is formalized,
  - but no imported GLB/texture/audio asset is active in the playable path yet.
- The next durable asset milestone remains a runtime-import proof, not a broad
  import of art assets into the renderer.

## 2026-07-25 — runtime instrumentation KPI recheck

- Re-checked the runtime instrumentation note against the live browser daemon.
- The current runtime surface is still `Rigs Unbound — Field 02`, with zero
  console logs in the snapshot.
- The KPI surface is live and observable:
  - `PerformanceMonitor.snapshot()`
  - `window.getPerformanceSnapshot()`
  - `window.render_game_to_text()`
  - HUD save / fps / draw-call / heap readouts
- The remaining gap is still packaging:
  - no repeatable profile comparison artifact,
  - no per-profile operator summary tied to a fixture,
  - no reusable fallback/degrade summary artifact,
  - no canonical screenshot/frame bundle binding the metrics together.

## 2026-07-25 — renderer/accessibility gate recheck

- Re-checked the renderer/performance/accessibility gate against the live Field
  02 runtime.
- The runtime still exposes the gate hooks:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
- The runtime still carries the right minimum gate shape:
  - `standard` and `mobile-safe` behavior are present,
  - reduced-motion clamping is present,
  - HUD text and semantic fallback paths are present,
  - the playable canvas remains the focus target after the intro is dismissed.
- The remaining gap is still the same packaged artifact gap:
  - no bundled capture set,
  - no canonical pass/fail summary for fallback events,
  - no operator-ready public smoke-test package.

## 2026-07-25 — culling/LOD spike-test recheck

- Re-checked the culling/LOD spike-test note against the live Field 02 runtime.
- The runtime is still healthy and the browser daemon still reports zero
  console logs.
- The current renderer posture still looks like a deliberate visibility budget:
  - repeated props are instanced,
  - prop rebuilds are radius-bounded,
  - some meshes disable automatic frustum culling for stable presentation,
  - draw calls and triangles remain compact enough for the scene.
- The formal gap remains unchanged:
  - no deterministic near-field fixture bundle,
  - no occluded/hidden fixture bundle,
  - no distance-gradient fixture bundle,
  - no pressure fixture bundle,
  - no reusable metrics/capture bundle promoted for comparison over time.

## 2026-07-25 — rendering-economy recheck

- Re-checked the rendering-economy note against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The runtime still exposes the frame-budget economy the note names:
  - Three.js canonical path,
  - instanced repeated world items,
  - radius-bounded prop drawing,
  - `PerformanceMonitor` / `window.getPerformanceSnapshot()` for draw-call,
    triangle, frame-time, memory, and terrain-build metrics,
  - HUD fps and save-health readouts.
- The remaining gap is still packaging:
  - no repeatable capture bundle,
  - no operator note for budget changes under pressure,
  - no screenshot/frame capture tied to the metrics,
  - no baseline promotion path for explanatory captures.

## 2026-07-25 — platform long-term audit recheck

- Re-checked the 3D platform long-term audit against the current Field 02
  runtime and browser daemon.
- The current runtime still matches the audit’s core premise:
  - bounded playable loop,
  - deterministic local simulation,
  - accessible shell and focus handoff,
  - observable render/performance metrics,
  - reference-first asset provenance,
  - intentionally bounded visibility/culling behavior.
- The highest-risk gaps remain future-gated:
  - no shipped-mesh authority layer,
  - no packaged comparison bundle for visibility/performance/accessibility,
  - no runtime-imported asset manifest in the playable path,
  - no formal replay transport or authority intent pipeline,
  - no chunk manifest / streaming lifecycle proving out-of-view work stays out
    of the frame budget.
- That keeps the backlog honest: the long-term platform shape is still right,
  but the risky lanes remain documented as future work rather than assumed
  delivered behavior.

## 2026-07-25 — replay artifact and ghost contract recheck

- Re-checked the replay/ghost contract against the live Field 02 runtime.
- The daemon is still healthy and reports zero console logs.
- The current runtime still exposes the bounded record surface:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
  - seed-backed bounded run records with commands, inputs, checkpoints, and
    saves
- The recorder is therefore real and useful as an internal audit log.
- The missing layer remains the first-class replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report from replay execution,
  - no diagnostics-only vs replay-safe trust split.
- So the contract remains correctly staged: record/verify now, replay/ghost
  artifact later.

## 2026-07-25 — streaming-world residency recheck

- Re-checked the streaming-world contract against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The world substrate still behaves like a single canonical residency:
  - one `GameWorld`,
  - one `TerrainField`,
  - one obstacle field,
  - one exploration field,
  - one snapshot/save boundary.
- `src/game/world.ts` remains authored world data and anchors, not a chunk
  residency graph.
- `src/game/storage.ts` still saves/restores the world as one payload.
- The missing layer remains the chunk-streaming contract:
  - no `WorldChunkManifest`,
  - no residency states,
  - no activate/unload/rollback lifecycle,
  - no residency churn observability.

## 2026-07-25 — authority model groundwork recheck

- Re-checked the authority contract against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The runtime still supports the local-first authority posture:
  - commands are captured explicitly,
  - the deterministic kernel owns canonical mutation,
  - local persistence restores or replaces invalid records without treating
    them as truth.
- That means local input remains authoritative for the current slice, and no
  remote authority is required yet.
- The missing layer remains the shared-state envelope:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata as policy,
  - telemetry for authoritative outcomes,
  - a visible shared-state/server-authoritative boundary artifact.

## 2026-07-25 — simulation layers and resource governance recheck

- Re-checked the simulation-layers contract against the live Field 02 runtime.
- The browser daemon is still healthy and reports zero console logs.
- The runtime still proves the layered-simulation premise:
  - deterministic gameplay kernel with ordered mutation,
  - bounded, serializable world memory,
  - terrain/physics/collision separated from rendering,
  - runtime pressure measurements exposed through performance hooks,
  - presentation consuming snapshots rather than owning world truth.
- The missing layer remains the named governance envelope:
  - no owned domain-order table for non-render layers,
  - no explicit CPU/GPU/active-actor/residency/save budget ledger,
  - no fallback-policy table naming which layer downgrades first,
  - no recorded downgrade reason surfaced as policy.

## 2026-07-25 — accessibility auditor live recheck

- Re-read the `Accessibility Auditor` skill and rechecked the live Field 02
  runtime using the browser daemon.
- Confirmed the page now has a usable accessibility shell:
  - named landmarks (`main`, `header`, `aside`, `section`, `role="status"`,
    `role="alert"`)
  - meaningful headings
  - a visible skip link
  - a keyboard-focusable `#game-canvas`
  - focus landing on `canvas#game-canvas` after entry
- The current open question is no longer the core keyboard route; it is whether
  the loading/fallback chrome should be made more explicit for slower public
  entry or kept intentionally minimal.
- Evidence depth: Tier 4 runtime/manual observation on
  `http://127.0.0.1:4173/?p0-repro=welcome`.

## 2026-07-25 — 3d-asset-production source-and-runtime split

- Used the `3d-asset-production` skill to distinguish concept/reference assets
  from runtime assets in the current app.
- Confirmed the live Field 02 runtime is still intentionally asset-light:
  - terrain readability is carried by vertex colours and procedural geometry,
  - `src/game/renderer.ts` explicitly documents zero texture assets for the
    terrain pass,
  - there is no imported runtime GLB/FBX/texture manifest yet.
- The repo’s current asset work therefore sits in the right order:
  reference art and source-library audits already exist, and the next durable
  step is a versioned runtime asset manifest once imported art enters the
  playable path.
- Evidence depth: Tier 1 static inspection plus live runtime context.

## 2026-07-25 — Capability and governance runway addendum

### Objective

- Convert the second-tier conversation recommendations into a repository-documented
  long-term architecture addendum focused on high-impact low-risk sequencing.

### What was changed

- Appended a new section to
  `docs/research/3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md` covering:
  - capability as contract vs boolean
  - command/validation/kernel/presentation ordering
  - replay/event/restricted-authority sequencing
  - deferred lanes with proof obligations
- Appended a new addendum to
  `docs/exploration/EXPLORATION_MAP.md` with scope status and lane-order decision
  criteria.

### Evidence and status

- Type of change: documentation only.
- Evidence depth: Tier 1 static source alignment; no runtime change in this pass.
- Decision confidence: sufficient for planning, not sufficient for implementation.
- Explicitly unchanged: renderer split, fixed-step kernel, persistence, and current
  activity loop.

### Why this matters

- Keeps architecture drift in check by adding a capability-first interpretation of
  “more” recommendations.
- Prevents premature multiplayer or streaming claims by sequencing authority and
  streaming after replay + validation lanes.
- Makes the next engineering pass measurable: each lane now has a pass criterion.

### Next closure criteria

- Render and resource budgets are quantified and benchmarked.
- A compact run/replay record with bounded input capture and checkpoint hashes lands.
- Deterministic event bus + capability-affordance compatibility passes at least one
  end-to-end interaction test.
- Stream manifest and chunk lifecycle lands with deterministic activation.

## 2026-07-25 — First executable open field

### Operator direction

- Treated the incoming ChatGPT review as critique, not a specification.
- Preserved the broad Rigs Unbound product horizon after the owner clarified that the game remains open rather than being anchored to every narrowing recommendation.
- Changed ADR-0001's immediate execution order from “two candidates before runtime” to “one provisional reference runtime, then compare when evidence identifies a concrete engine question.”

### Implementation

- Created a Vite/TypeScript/Three.js browser runtime at the repository root.
- Kept game state, fixed-step movement, named actions, furrow memory, discovery, validation, serialization, and browser hooks outside Three.js.
- Built a primitive Patchwork Atlas tractor/world without importing private source-library assets.
- Added keyboard, gamepad, touch, pause, reset, local recovery, visible diagnostics, DOM instruments, opportunity signals, chase/tactical cameras, and day/gloam/night states.
- Added 6 live state-kernel tests.
- Reconciled parallel work under `experiments/deterministic-kernel-probe/`: preserved it as a disposable fixture, scoped Vitest to the live TypeScript runtime, and made root checks run both suites.

### Runtime findings and fixes

- Port conflict: a parallel Python experiment occupied `127.0.0.1:4173`; the 3D Vite runtime moved to `4174` rather than terminating or overwriting the parallel session.
- Furrow density: the first browser drive created 118 marks over 16 metres because spacing compared the tractor position with the prior rear mark. Spacing now compares consecutive rear-mark coordinates; the same acceptance drive produced 16 marks over 17.41 metres.
- Camera composition: tactical mode initially left excessive empty space. It now centers the rig/world trace at a lower camera height.
- Mobile composition: the first `390 × 844` layout overlapped the field kit and stacked action controls. The field kit now ends at `687.20 px` and touch controls begin at `714.41 px`.
- WebGL lifecycle: dynamic shadow-map testing produced a Chrome texture-storage warning. The field now uses a project-owned blob shadow, and the animation loop stops before renderer disposal. The final acceptance run captured zero console warnings/errors.
- Persistence test: reload can preserve a bounded number of in-flight furrows newer than the periodic checkpoint through `beforeunload`; the acceptance assertion now checks no-loss plus bounded freshness rather than false exact equality.

### Commands and outcomes

- `npm install`
  - Installed current local dependency versions and reported 0 audit vulnerabilities.
- `npm run typecheck`
  - Passed root strict TypeScript and the deterministic JavaScript probe check.
- `npm test`
  - Passed 6 live-runtime tests and 7 deterministic-probe tests.
- `npm run build`
  - Passed. Output: HTML 4.73 kB, CSS 8.63 kB, JS 551.01 kB raw / 141.08 kB gzip.
  - One advisory remains: the single Three.js application chunk exceeds Vite's 500 kB raw warning threshold. Owner: runtime architecture. Closure: measure first controllable frame and split/replace renderer loading only if the profile shows player value; do not hide the warning by raising the threshold.
- Visible Playwright acceptance against `http://127.0.0.1:4174/`
  - Drove 17.41 metres, created 16 distance-spaced furrows, switched to tactical/gloam, advanced through the browser hook, recovered local world memory after reload, and passed the narrow-layout non-overlap assertion.
  - Captured zero final console warnings/errors or page errors.

### Evidence and readiness

- Tier 2: typechecks and 13 targeted state/kernel tests.
- Tier 3: production build, browser interaction chain, browser-hook stepping, and local persistence recovery.
- Tier 4: visible desktop and narrow browser observation.
- Code-ready: yes for the local field-test contract.
- Feature-ready: partial; it proves drive/tool/world-memory/camera/state seams but landmark verbs are signals, not full activities.
- Launch-ready: no; there is no public deployment, external player evidence, accepted engine, performance budget, camera-occlusion system, or production asset pipeline.

### Review passes

1. Immediate correctness: fixed furrow spacing, port ambiguity, WebGL lifecycle warning, and mobile overlap.
2. Architecture: separated live and disposable kernels, preserved renderer-independent state, and kept Three.js provisional.
3. Supervision readiness: synchronized README, progress, design, ADR, plan, tests, and evidence wording; no commit or push performed.

### Anything else?

Yes. The game now moves without shrinking its future. The next work should make horizon signals produce distinct spatial consequences and measure runtime behavior before expanding scenery or accepting an engine.

## 2026-07-25 — Exploration foundation

### Baseline

- The repository contained only generated/runtime context material and no game implementation.
- The supplied private workbook `js_python_animation_simulation_physics_3d_2d_catalog_2026.xlsx` was inspected read-only outside the repository.
- Workbook snapshot: 409 catalog entries across JavaScript/TypeScript, Python, legacy/emerging, recommended stacks, and taxonomy sheets; workbook verification date recorded as 2026-07-10.
- No git mutation, dependency installation, credential creation, external account change, deployment, or modification of the supplied workbook was performed.

### Instruction and context actions

- Read the global and projects-level instruction stack.
- Generated the canonical project context with the shared workspace `agent-start` tool for this repository.
- Loaded the project-local motto v4 and generated context pack.
- Applied the named game design, web game, 2D/3D, Three.js, WebGPU, UI, art, asset, testing, playtest, browser, and wide-open exploration guidance.
- Probed optional external media credentials without exposing values. Tripo, Gemini, and ElevenLabs keys were not available; no external media generation was attempted.
- Checked for the wide-open brainstorming skill’s optional external-LLM panel tools; none were available, so local parallel research perspectives were used.

### Research actions

- Classified the workbook as a discovery catalog rather than an adoption manifest.
- Checked current official documentation for representative rendering, engine, physics, multiplayer, backend, and browser paths.
- Delegated independent technology, game-reference, and risk critiques, then reconciled them into the project artifacts.
- Generated and visually inspected one comparative art-direction triptych. Copied it into the project, preserved the original generated file, recorded its hash/prompt/provenance, and marked it concept-only.

### Key commands and outcomes

- `<workspace>/agent-start --project <repo>`
  - Generated the project-local motto v4 and canonical context pack under `docs/context/agent-start/`, with `.agent/` compatibility mirrors.
- `find . -maxdepth 4 -type f -print | sort`
  - Confirmed the initial project baseline and later the documented artifact inventory.
- `shasum -a 256 docs/exploration/assets/patchwork_atlas_triptych_2026-07-25.png`
  - Recorded SHA-256 `bdc8165c12b3beccd6a586a4246d2b959b2fc8ad5cae05b8a446621b8079224a`.
- `node -e '<local Markdown link validation script>'`
  - Inspected 13 project Markdown files and reported `broken_local_links=0`.
- `rg -n "TODO|TBD|placeholder|coming soon|100%|1\\.00|final engine selected|production-ready|launch-ready" README.md DESIGN.md progress.md docs --glob '*.md'`
  - Reported no hidden completion claims or placeholder markers.
- `rg -n "Scrap|Signal|Insight|Favor|currency" README.md DESIGN.md progress.md docs --glob '*.md'`
  - Used during architecture review to find and resolve progression vocabulary drift.

### Decision status

- Proposed: renderer-independent gameplay kernel plus comparable engine probes.
- Proposed: tractor day/night first-playable hypothesis.
- Open: engine, physics integration, backend, art direction, final economy, networking, UGC, AI use, public name.
- Rejected for the first playable: multi-engine production runtime, MMO scope, premium currency, open UGC, and live generative gameplay.

### Evidence tiers

- Tier 0: untested creative hypotheses and future mechanics.
- Tier 1: local file/workbook inspection and official-source research.
- Tier 2: documentation structure/link/content checks recorded below.
- Tier 3–5: none. There is no integrated game, observed runtime, production-like deployment, or real-player evidence.

### Review passes

#### Pass 1 — Immediate correctness and completeness

- Checked the request against the README, exploration map, brainstorm, engine research, game atlas, risk register, design direction, ADRs, progress, and worklog.
- Confirmed all 13 project-authored Markdown files had resolvable local links (`broken_local_links=0`).
- Confirmed each load-bearing project artifact includes an `Anything else?` review section.
- Confirmed no final-engine, production-ready, launch-ready, `100%`, or placeholder claim remained.
- Changed: added the risk/provenance navigation links and recorded the generated concept’s weaknesses rather than presenting it as final art.

#### Pass 2 — Architecture and long-term viability

- Reconciled independent engine, game-reference, and adversarial public-readiness reviews.
- Confirmed one renderer-neutral game/content truth, one versioned vehicle/activity contract family, and no duplicate runtime route/pipeline/code exists because implementation has not begun.
- Confirmed Three/Babylon/PlayCanvas/Godot remain experiments rather than parallel production truths.
- Confirmed the connected-region model, single-vehicle first slice, guest/local-first save, staged multiplayer, server-authoritative durable state, data-only creator ladder, and AI proposal boundary agree across artifacts.
- Found vocabulary drift between `Signal` and `Insight`; standardized on one spendable soft resource (`Scrap`), non-spendable `Insight`, non-spendable `Favor`, and concrete parts. A world “signal” remains fiction, not currency.
- Changed: made the one-vehicle tractor slice the leading decision unit while retaining multi-vehicle breadth as a later proof of the grammar.

#### Pass 3 — Rule compliance and supervision readiness

- Rechecked the shared/project instruction stack, motto v4 acceptance contract, skill-driven test hooks, asset provenance, evidence tiers, deferred-system gates, and append-only ADR update logs.
- Confirmed no dependency install, code route, duplicate pipeline, external account mutation, deployment, git mutation, secret output, or modification of the supplied workbook occurred.
- Confirmed the first-playable’s trigger, states, decisions, actions, exception/failure paths, terminal state, durable outcome, user view, and operator/test visibility are documented.
- Confirmed runtime truth is still explicitly unknown: no Tier 3–5 gameplay evidence exists.
- Changed: recorded exact key commands/outcomes, artifact preservation, public-readiness gates, and the reason a public deployment was not claimed.

### Uncommitted and parallel work

- All files created in this exploration remain local.
- No commit or push was requested or performed.
- Git status was intentionally not inspected because the active project doctrine permits git checks only with explicit approval; therefore broader repository commit state is unverified, while this session's newly created artifacts are known to be local-only.
- No unrelated source work was present or modified.
- Generated `agent-start` context files and the project-local motto v4 were created by the required context process and left for review.
- `mcp-shell.log` existed at baseline and was left untouched.

## Anything else?

This log distinguishes research confidence from game confidence. A well-supported plan is not evidence that the proposed game is fun.

## 2026-07-25 — Additional ChatGPT research ingestion

### Inputs

- `<private-research>/vehicle_game_platform_exploration_2026.xlsx`
  - SHA-256: `149e87a1a82e36a9b4bfe3d45c3954f56c12f9e30115bd0998ef3696a62af993`
  - Read-only; source left unchanged.
- `<private-attachment>/pasted-text.txt`
  - SHA-256: `9865316570decd61682f3104524333ffa1a2d0d0930d0da1a60f9093ed7cc2a2`
  - Read-only; source left unchanged.

### Spreadsheet analysis

- Loaded through the bundled Python/openpyxl runtime.
- Confirmed 20 sheets, 22 structured tables, 42 formulas, 3 charts, and the preserved 409-entry master catalog.
- Confirmed all stated game-specific row counts.
- Confirmed unique mode names, vehicle-system items, engine names, tool names, editor names, progression-system names, roadmap orders, and decision IDs.
- Confirmed all 96 tooling rows and 14 engine rows have nonblank license/access and HTTP(S) source fields. This is a completeness check, not independent license verification.
- Confirmed engine weights sum to 1.0 and all cached weighted scores match manual calculation.
- Ran authoring-heavy, control/performance-heavy, and physics/mode-heavy sensitivity profiles; candidate ranking changed as documented.
- Observed openpyxl warnings for unsupported conditional-formatting extensions. The workbook was not saved, so the source extensions were not removed.

### Primary-source refresh

- Confirmed the PlayCanvas Editor Frontend MIT announcement from the official PlayCanvas blog.
- Confirmed Phaser 4.1.0 “Salusa” from the official Phaser release.
- Confirmed Box3D’s June 2026 announcement, C17 architecture/features, and author-stated alpha maturity from the official Box2D site.
- Did not treat the absence of an observed JavaScript/WASM integration as proof that none can exist; recorded it as an unproven adoption path.

### Reconciliation decisions

- The workbook’s 17 `Accepted` rows remain source-author statuses. No repo ADR was promoted.
- The project retains Scrap as its one spendable early resource; Credits was not added.
- The first slice remains tractor farm → defense. A same-tractor time trial becomes the immediate cross-mode proof.
- PlayCanvas gains a stronger authoring probe, not engine-selection status.
- Box3D enters a bounded feasibility watch, not the dependency plan.
- Incoming content boundaries were formalized as Proposed ADR-0003.
- Incoming public share/evidence objects were formalized as Proposed ADR-0004.

### Key commands and outcomes

- `<workspace-python> - <<'PY' ... load_workbook(...) ... PY`
  - Inspected workbook structure, tables, formulas, rows, source/license completeness, unique identifiers, engine scoring, and sensitivity without writing the file.
- `shasum -a 256 <text-source> <workbook-source>`
  - Recorded both source hashes above.
- `node -e '<local Markdown link validation script>'`
  - Inspected 16 project-authored Markdown files and reported `broken_local_links=0`.
- `rg -n "Credits|Scrap|Insight|Favor" README.md DESIGN.md progress.md docs --glob '*.md'`
  - Confirmed Credits appears only in the documented incoming conflict/rejection; the canonical grammar remains Scrap/Insight/Favor.
- `rg -n "Status: Accepted|- Status: Accepted|final engine|engine selected|production-ready|launch-ready|100%|1\\.00" ...`
  - Confirmed no project ADR was silently marked Accepted and no unsupported completion claim was introduced.
- `<workspace>/agent-start --project <repo>`
  - Completed project indexing; the generated session-context timestamp initially remained stale.
- `<workspace>/agent-start --project <repo> --skip-index`
  - Regenerated the canonical context pack and `.agent` mirrors; `SESSION_CONTEXT.md` now records `2026-07-25T07:40:23Z`.

### Pass 1 — Immediate correctness and completeness

- Compared both new sources against the existing README, exploration map, technology research, risk register, progression vocabulary, ADRs, and progress record.
- Verified workbook structure rather than trusting the narrative’s counts.
- Added the ingestion review, two proposed ADRs, workbook/source hashes, and direct navigation.
- Resolved Credits/Scrap and first-slice/race conflicts explicitly.
- Result: the new research is preserved without overwriting earlier decisions.

### Pass 2 — Architecture and long-term viability

- Separated immutable definitions, mutable owned state, compiled world output, runtime orchestration, and run evidence.
- Corrected `RunDirector` from authored input to ephemeral runtime state.
- Confirmed share-object URLs are conceptual product routes, not duplicate API-route authorization.
- Preserved one runtime truth while allowing Phaser/Box3D/other tools as disposable laboratories.
- Tested engine-score sensitivity and retained raw candidate evidence over aggregate-score authority.
- Result: new structure strengthens the long-term model without multiplying canonical truths.

### Pass 3 — Rule compliance and supervision readiness

- Rechecked motto v4 AI-output, data/config, decision-record, evidence-tier, append-only update, and `Anything else?` requirements.
- Confirmed both source files remain unchanged, no dependency/code/deployment/git/account mutation occurred, and no runtime claim was made.
- Confirmed every new load-bearing artifact has status, owner/reviewer, validation, risks, revisit triggers, update log, and `Anything else?`.
- Confirmed Tier 3–5 game evidence remains absent and visible.
- Result: the research ingestion is auditable and ready to supervise; implementation decisions remain open.

### Files created

- `docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md`

## 2026-07-25 — Optimization gaps audit continuation

### Scope

- Continued structured review of the untrusted optimization conversation `chatgpt-conversation://6a64b5ee-9198-83e8-a94f-1ea55983f676`, with explicit check against source files for rendering, kernel, and progression-scaling architecture.
- Recorded findings in:
  - `docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md` (new "second-pass" addendum section),
  - `docs/exploration/EXPLORATION_MAP.md` (new optimization continuity checkpoint table).

### What changed

- Confirmed deterministic kernel, migration, renderer split, and migration/recovery path are already present and should not be rewritten.
- Marked missing/high-risk items as active queue entries (chunked streaming, collision layer matrix, replay transport, explicit chunked visibility lanes).
- Aligned new queue items with existing render contract (`PLAN_RENDER_PERFORMANCE_ACCESSIBILITY_2026-07-25.md`) and non-functional ADR (`ADR-0010`) so decisions remain coherent.

### Evidence notes

- No code/runtime behavior changed in this pass.
- No tests were run because this was a structured analysis-and-documentation update.
- Confidence remains **Tier 2 static** for all map decisions.
- Remaining confidence barrier: render/runtime hardening artifacts are still pending implementation and execution.

### What is still required

- Add deterministic culling/LOD tests tied to draw-path evidence.
- Add collision category/mask fixtures before introducing more non-ground locomotion classes.
- Add replay input/log + verifier before any public shared-session narrative.
- `docs/decisions/ADR-0003-versioned-gameplay-content-composition.md`
- `docs/decisions/ADR-0004-versioned-public-evidence-surfaces.md`

### Files updated

- `README.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/research/TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25.md`
- `docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md`
- `docs/decisions/ADR-0002-first-playable-tractor-day-night-loop.md`
- `docs/WORKLOG.md`
- `docs/context/agent-start/SESSION_CONTEXT.md`
- `docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt`
- `docs/context/agent-start/STEP1_ENV.sh`
- `.agent/SESSION_CONTEXT.md`
- `.agent/AGENT_KICKOFF_PROMPT.txt`
- `.agent/STEP1_ENV.sh`
- `motto_v4.md` (refreshed from the canonical source by `agent-start`)

### Evidence status

- Tier 1: source inspection and current official-source checks.
- Tier 2: workbook structure, uniqueness, formula, score, sensitivity, and local-link checks.
- Tier 3–5: none.

### Uncommitted and preserved work

- No git command, commit, stage, or push was run.
- All session changes are local-only.
- Both user-provided research sources and the prior project artifacts were preserved.
- No source workbook copy was created, avoiding a second editable workbook truth.

## Anything else?

The 45 modes, 96 tools, and 28 incoming decisions are useful search spaces—not permission to expand the runtime. Their best next role is to supply fixtures and falsifiable experiments after the owning ADRs are accepted.

## 2026-07-25 — Kenney paid-library audit

### Scope and preservation

- Inspected the private external `Kenney Game Assets All-in-1 3.4.0` library read-only.
- Observed an approximately 1.2 GB, 84,992-file source library spanning 2D, 3D, UI, icons, audio, archive packs, and supporting material.
- Also located the private external `kenney_new-platformer-pack-1.1`; classified it as a later 2D/side-view candidate.
- No source asset, preview, license, archive, or supplied pack was modified, copied, converted, moved, or deleted.
- No runtime asset directory or second editable bundle truth was created.

### Rights and visual review

- Read the All-in-1 `Readme.html` and sampled licenses from Car, Toy Car, Nature, Space, Racing, Graveyard, Impact Sounds, Input Prompts, and New Platformer packs.
- Recorded CC0 personal/commercial/modification permission and optional attribution from the inspected files.
- Preserved the bundle-level instruction not to redistribute the All-in-1 package directly.
- Visually inspected the Car, Nature, Toy Car, and Space preview sheets.
- Assessed the library as a strong readable low-poly substrate, with a material identity risk if raw packs become an unmodified “Kenney collage.”

### Technical inspection

- Identified a current Car Kit tractor, shovel variant, separate tractor wheels, crate, Racing Kit ramp, Nature Kit props, and animated Graveyard zombie.
- Parsed selected GLB metadata read-only.
- Confirmed the base tractor has four named wheel nodes plus a body node; the shovel tractor has named body, shovel, and wheel nodes.
- Confirmed the zombie has articulated named parts and 32 clips, including idle, walk, sprint, die, attacks, interactions, and holding states.
- Recorded byte sizes and SHA-256 values for the eleven proposed common probe fixtures.
- Kept archive Mini Car Kit assets out of the primary manifest because the current Car Kit supersedes them for this experiment.

### Key commands and outcomes

- `find` and `rg` over the local Kenney directories
  - Located the main and separate packs; mapped relevant vehicle, environment, UI, audio, road, defense, farm, city, toy, and space content without writing sources.
- extension/count and size inventory commands
  - Observed 84,992 main-bundle files and 4,724 GLBs within the approximately 1.2 GB bundle.
- `shasum -a 256 <selected assets and license evidence>`
  - Recorded repeatable source identities in the Kenney audit.
- `node - <selected GLBs>`
  - Parsed GLB JSON chunks and reported nodes, meshes, materials, animations, and position-accessor bounds without converting the assets.
- visual inspection of four local `Preview.png` files
  - Confirmed cross-pack readability and the need for an authored Patchwork Atlas identity pass.
- `node - <audit-manifest verification>`
  - Parsed all 11 candidate rows from the audit and confirmed every recorded byte size and SHA-256 matched the current source file.
- `node - <local Markdown link validation>`
  - Inspected 19 project Markdown files and reported `broken_local_links=0`.
- `find . -type f` restricted to common 3D asset and Kenney-preview extensions
  - Returned no project files, confirming the source library was not accidentally copied into the repository.
- One attempted macOS-style `stat -f` command encountered the environment’s different `stat` behavior; it made no changes. Byte sizes were then obtained with `wc -c`.

### Pass 1 — Immediate correctness and completeness

- Reconciled the user’s asset note with the first-slice needs and engine comparison scene.
- Checked licensing at bundle and sampled pack levels instead of inferring rights from the paid acquisition alone.
- Inspected visual previews and exact candidate files rather than listing pack names only.
- Changed: added a dedicated audit, source-library provenance entry, and exact hashed first-probe manifest.
- Result: the project now knows what can be tested first and what has not been imported or approved.

### Pass 2 — Architecture and long-term viability

- Kept `adhoc_resources` as an external source library, not a runtime path or second game-content truth.
- Defined semantic asset keys, source/derived hash separation, identical cross-engine fixture rules, per-pack license retention, collider proxies, and measurable importer friction.
- Distinguished prototype substrate, first-slice support, breadth laboratories, and archive-only content.
- Changed: ADR-0001 now requires the same Kenney binaries across engine candidates; DESIGN requires an authored Patchwork Atlas transformation before final-style claims.
- Result: the library accelerates experiments without binding durable state to filenames, scene nodes, one renderer, or the full paid bundle.

### Pass 3 — Rule compliance and supervision readiness

- Rechecked evidence tiers, asset provenance, public redistribution boundaries, AI-output boundary, documentation continuity, and no-silent-production-asset requirements.
- Confirmed no git, dependency, account, deployment, runtime, or source-library mutation occurred.
- Confirmed all 11 manifest sizes/hashes match, all 19 local Markdown links resolve, and no Kenney 3D/preview binary exists inside the project.
- Confirmed Tier 3–5 evidence remains absent: the assets have not been imported, rendered, profiled, animated in the project, or player-tested.
- Changed: progress and exploration records now surface both the opportunity and the visual-coherence/licensing gates.
- Result: the audit is reviewable and implementation-ready without overclaiming game or production evidence.

### Files created

- `docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md`

### Files updated

- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/research/ASSET_PROVENANCE_REGISTER.md`
- `docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md`
- `docs/WORKLOG.md`

### Evidence status

- Tier 1: local library, previews, licenses, pack organization, and asset metadata inspected.
- Tier 2: selected files, byte sizes, hashes, nodes, materials, and animation clip names checked.
- Tier 3–5: none.

### Anything else?

Kenney makes experimentation cheaper, not design automatic. The valuable next proof is whether the same tractor fixture imports and drives consistently across engines while remaining legible in chase and top-down cameras.

## 2026-07-25 — Direct visual preference and controlled variants

### Input and interpretation

- Inspected the project-owner-provided 1774 × 887 tractor triptych at original resolution.
- Preserved it at `docs/exploration/assets/references/tractor_patchwork_atlas_user_preference_2026-07-25.png`.
- Recorded SHA-256 `adf64c7028e2a55670cbed1255b6745e682f00b0bb5eef5fc2938bfa518674d4`.
- Interpreted the preference as a combination of persistent machine identity, selective detail, tactile diorama composition, close near-isometric character presence, warm/cool world-state contrast, and visible distant promise.
- Did not treat the preference as automatic production approval or an exact camera specification.

### Image-generation skill action

- Used the built-in image-generation path with the preserved image explicitly labeled as a visual-language/camera/material/mood reference rather than an edit target.
- Generated three separate original concept boards:
  - persistent tractor character sheet;
  - gameplay camera-language board;
  - invariant-scene art-direction triptych.
- Copied the selected outputs into `docs/exploration/assets/design_explorations/` while preserving the generated originals.
- Recorded exact prompts in `docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md`.

### Visual review

- Character sheet: strong stable silhouette, tire ratio, round-light expression, repair grammar, turquoise patch, and functional hardpoints; true orthographic views and exact patch/socket maps remain needed.
- Camera board: close chase, work, tactical, workshop, bridge, and wide-vista roles are legible; gameplay depth-of-field, occlusion, mobile safe areas, and sustained wide-view scale remain unproven.
- Art-direction board: Patchwork Atlas reads as the strongest baseline; Signal Noir works as a danger-state layer; Salvage Opera works as an event/region-scale crescendo.
- Cross-board gap: generic spider-like threats persist and require a separate enemy-ecology exploration.

### Key commands and outcomes

- original-resolution local image inspection
  - Confirmed composition, subject scale, surface language, camera patterns, and visible weaknesses.
- copy and `shasum -a 256`
  - Preserved one input reference and three generated outputs; recorded stable project hashes.
- `file <four project PNGs>`
  - Confirmed RGB PNG type and expected dimensions.
- built-in image generation, three reference-guided calls
  - Produced one distinct board per question, following the image-generation skill’s multi-asset rule.
- `node - <image provenance and local-link verification>`
  - Recomputed all four project image hashes/dimensions, matched every provenance record, inspected 20 Markdown files, and reported `broken_local_links=0`.

### Pass 1 — Immediate correctness and completeness

- Separated the preference into character, material, camera, world-composition, and light/state signals.
- Generated focused boards rather than unstructured near-duplicates.
- Inspected every output at original resolution and documented both strengths and failures.
- Result: “this kind” is now a concrete, reviewable visual hypothesis.

### Pass 2 — Architecture and long-term viability

- Connected the preferred visual language to the existing vehicle identity, camera grammar, first slice, browser budget, and Kenney transformation path.
- Kept Patchwork Atlas, Signal Noir, and Salvage Opera in a hierarchy rather than averaging them into one noisy style.
- Kept concept images outside durable gameplay identity and camera constants.
- Result: the preference guides art investment without prematurely locking runtime or asset architecture.

### Pass 3 — Rule compliance and supervision readiness

- Recorded input and output provenance, hashes, prompts, human review, production status, known gaps, and replacement/validation paths.
- Confirmed the generated boards are proposals, not gameplay or player evidence.
- Confirmed no external account, dependency, deployment, runtime, or git mutation occurred.
- Result: the exploration is reproducible and ready for the next visual or runtime decision.

### Files created

- `docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md`
- `docs/exploration/assets/references/tractor_patchwork_atlas_user_preference_2026-07-25.png`
- `docs/exploration/assets/design_explorations/tractor_character_model_sheet_2026-07-25.png`
- `docs/exploration/assets/design_explorations/tractor_gameplay_camera_board_2026-07-25.png`
- `docs/exploration/assets/design_explorations/tractor_art_direction_triptych_2026-07-25.png`

### Files updated

- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/research/ASSET_PROVENANCE_REGISTER.md`
- `docs/WORKLOG.md`

### Evidence status

- Tier 1: preference statement, preserved reference, three generated boards, and visual inspection.
- Tier 2: all four project image hashes/dimensions matched their provenance records; 20 Markdown files reported zero broken local links.
- Tier 3–5: none.

### Anything else?

The most valuable next image is not another beauty shot. It is a strict orthographic tractor sheet and a grayscale/mobile silhouette test that can constrain a real model and camera prototype.

## 2026-07-25 — Dilapidated-to-robust tractor progression discussion

### Proposal

- The project owner proposed a dilapidated/basic starting tractor that becomes visually robust through upgrades and gains switchable additions.
- Reconciled the proposal with the existing damaged-tractor trigger, persistent `VehicleInstance`, module tradeoffs, preferred visual direction, and one-vehicle first-slice boundary.
- Recorded the product phrase `same bones, changing verbs`.

### Design outcome

- Separated restoration, specialization/tuning, swappable physical modules, and deployed module states.
- Proposed the journey `found → stabilized → working → specialized → hybridized → storied`.
- Preserved cab/roof silhouette, round-light face, wheel stance, beacon/mount history, signature patch, chassis proportions, scars and sound motifs as identity anchors.
- Defined workshop-bound large swaps and later earned field-service mechanics.
- Mapped modules to multiple verbs and explicit mass, power, handling, cargo, clearance, setup or vulnerability costs.
- Bounded the first playable to a drivable incomplete tractor, early stabilization, restored plow, one support-module choice, and visible dawn consequences.

### Architecture outcome

- Kept `VehicleBlueprint` responsible for hardpoints, compatibility and envelopes.
- Kept `VehicleInstance` responsible for owned components, condition, repairs, loadouts, scars and history.
- Clarified that a preset references owned parts and cannot clone them or bypass constraints.
- Clarified that deployed module state is not an installation change.
- Added Proposed addenda to ADR-0002 and ADR-0003; no decision was promoted to Accepted.

### Pass 1 — Immediate correctness and completeness

- Checked the idea against current slice, vehicle, visual, progression, economy, workshop and data-model artifacts.
- Preserved the emotional appeal while removing an unbounded all-upgrades-at-once interpretation.
- Result: the idea now has a concrete first-loop expression and explicit exclusions.

### Pass 2 — Architecture and long-term viability

- Prevented gear-score progression, magical hot-swapping, duplicate vehicle identity and renderer-owned modules.
- Made later mobile service, quick couplers, tool trailers, support drones and co-op service vehicles legitimate earned extensions.
- Result: the same model can scale from a tractor to bicycles, toy cars, watercraft, rockets and hybrids without one inheritance tree.

### Pass 3 — Rule compliance and supervision readiness

- Recorded status, tradeoffs, failure modes, validation questions, state ownership and first-playable boundary.
- Confirmed no code, schema, asset, dependency, runtime, deployment, account or git mutation occurred.
- Rechecked 21 Markdown files and reported `broken_local_links=0`; confirmed both ADR addenda remain Proposed and no unsupported completion/production claim was introduced.
- Tier 1 only: design reasoning and current-artifact reconciliation; no playable behavior exists.
- Result: ready for paper flow, visual evolution board and runtime fixture review.

### Files created

- `docs/exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md`

### Files updated

- `README.md`
- `DESIGN.md`
- `progress.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/decisions/ADR-0002-first-playable-tractor-day-night-loop.md`
- `docs/decisions/ADR-0003-versioned-gameplay-content-composition.md`
- `docs/WORKLOG.md`

### Anything else?

The robust end-state is most meaningful when it reveals decisions. A tractor with every attachment installed would communicate collection; a tractor with a few carefully chosen systems and beloved repairs communicates authorship.

## 2026-07-25 — Rigs Unbound identity and public-repository preparation

### Authorization and baseline

- The project owner selected **Rigs Unbound** as the game name and `rigs-unbound` as the GitHub repository name.
- The project owner explicitly authorized repository initialization, `git add -A`, a hook-compliant commit, public GitHub repository creation, and push.
- The workspace was not a Git repository at baseline.
- The intended GitHub account was authenticated and the target repository slug was available at the time of the read-only check.

### Identity decision

- Added Accepted ADR-0005 as the canonical naming decision.
- Updated README, progress, and the living exploration map to use **Rigs Unbound**.
- Kept the local `openworld_1` folder name as a location rather than a competing public identity.
- Kept engine, art, economy, multiplayer, and production decisions open.
- Recorded that commercial name/trademark/domain clearance remains a separate pre-launch gate.

### Public boundary and artifact classification

- Added a root `.gitignore` for operating-system metadata, editor state, secrets, logs, caches, dependencies, build output, Python/game-engine generated files, and machine-generated agent context.
- Classified `mcp-shell.log` as machine-local runtime output and excluded it.
- Classified `.agent/` and `docs/context/agent-start/` as generated local instruction/context mirrors and excluded them; canonical durable design and decision documents remain tracked.
- Kept the five project concept/reference images because they are intentional design references with hashes, provenance, review status, and replacement paths.
- Kept `motto_v4.md` as the project-local doctrine source.
- Kept the private paid Kenney source library outside the repository. Only its audit, hashes, license evidence, and candidate manifest are publishable in this commit.
- Sanitized public documentation so private machine paths are represented by descriptive source labels or placeholders.
- Did not add a software/content license: public visibility does not itself grant reuse rights, and license selection remains an explicit project-owner decision.

### Scope

- This publication unit contains the existing research, exploration, visual evidence, decisions, progress, and provenance records plus the new identity/publication boundary.
- There is still no game runtime, dependency manifest, engine selection, deployment, account system, multiplayer service, or production claim.

### Pre-commit checks

- Initialized an empty Git repository on `main`.
- Regenerated the local context pack and installed the managed pre-commit, prepare-commit-message, and commit-message policy hooks.
- Confirmed the hooks include both the motto attestation gate and the no-AI-co-author-trailer guard.
- Inspected 21 Markdown files and found `broken_local_links=0`.
- Searched publishable files for common private-key, service-token, API-key, and credential-assignment patterns; no match was found.
- Searched publishable documents for absolute user, attachment, temporary-folder, and private asset-library paths; no absolute private machine path remained.
- Confirmed no intended tracked file exceeded 20 MB.
- Recomputed the five intentional concept/reference image hashes; each matched its provenance record.
- Confirmed `.agent/`, `docs/context/agent-start/`, and `mcp-shell.log` are ignored while the durable project documents and images remain candidates for the initial commit.
- Completed the coverage-complete 51-section motto review and preserved its generated, human-readable report at `docs/reviews/motto_review.md`.
- Corrected the shared hook renderer so that its report identifies the audited doctrine as motto v4 rather than the obsolete v3 label.

### Anything else?

The first public commit should preserve why the project exists and how it will make decisions, while refusing to imply that research artifacts are already a playable game.

## 2026-07-25 — Local checkout renamed to `rigs-unbound`

### Requested change

- The project owner requested that the local `openworld_1` directory use the Rigs Unbound identity as well.
- Selected the filesystem-safe canonical slug `rigs-unbound`, matching the GitHub repository.

### Migration

- Verified the current checkout had no uncommitted tracked changes.
- Verified the target `Game_dev/rigs-unbound` directory did not already exist.
- Moved the complete checkout from `Game_dev/openworld_1` to `Game_dev/rigs-unbound`.
- Confirmed the old path no longer exists and the new directory retains the same Git repository, `main` branch, `origin`, and commit history.
- Regenerated the ignored `.agent/` and `docs/context/agent-start/` context surfaces at the new location.
- Confirmed their project paths and collection identifier now use `Game_dev/rigs-unbound`.
- Preserved the previous publication entry unchanged as historical evidence of the folder name at that time.

### Boundaries

- No source, design, asset, dependency, gameplay, remote repository, or deployment path was moved outside the checkout.
- No old context/index collection was deleted; cleanup of shared indexed state requires a separate preservation audit.

### Anything else?

The local folder, GitHub slug, and machine-facing project identifier now express one identity, while the human-facing title remains **Rigs Unbound**.

## 2026-07-25 — Rig Lab 01: contrasting rigs and adjacent towing capability

### Baseline and decision

- Re-read the global/project instruction stack, project motto v4, generated context pack, 3D-game skill, Browser Daemon skill, current code, decisions, progress, design, and prior vehicle-game memory.
- Re-ran `agent-start --project Game_dev/rigs-unbound --skip-index`.
- Baseline `npm run typecheck` passed.
- Baseline `npm test` passed: 6 live-runtime and 7 preserved deterministic-kernel tests.
- Recorded Accepted ADR-0006 before refactoring the load-bearing state/save contract.

### Implementation

- Replaced the universal `vehicle`/tractor constants with two persistent rig states and versioned profiles.
- Added Torque and Spark through one semantic input, fixed-step controller, camera, renderer, save, and public-state path.
- Added `plough`, `tow`, and `jump` capability queries plus attachment state.
- Added a complete cargo-relay workflow and a profile-driven buggy ramp launch.
- Advanced local save schema v1 to v2 with deterministic legacy migration.
- Added local startup/frame/render/heap/save/load instrumentation.
- Added reusable `npm run test:browser` visible-Chrome acceptance and project-local screenshot evidence.
- Preserved `experiments/deterministic-kernel-probe/` and the private-asset boundary untouched.

### Review findings and corrections

#### Pass 1 — immediate correctness and completeness

- Found the tractor-only state and renderer assumptions.
- Refactored the canonical path instead of adding `BuggyController`.
- Browser automation initially braked after reaching cargo and rolled outside the interaction radius; corrected the acceptance driver to stop on the semantic reach threshold.
- Result: attach, tow, deliver, jump, save, reload, and reset are complete local workflows.

#### Pass 2 — architecture and long-term viability

- Confirmed activities query capabilities rather than rig names.
- Kept `ground` explicit as one mobility adapter rather than a universal physics claim.
- Replaced per-frame hitch-geometry recreation with updates to one stable position buffer.
- Preserved renderer-independent state and provisional Three.js status.
- Result: no second controller, save, activity, renderer, or input source of truth.

#### Pass 3 — rule compliance and supervision readiness

- Initial narrow layout overlapped instruments and touch controls; final layout has a measured 10.41 px gap.
- Portrait camera was pulled back after screenshot inspection.
- Separated desktop, save, restored, and narrow performance snapshots.
- Added the required plan, decision update, design/exploration continuity, 23.5 kB acceptance review, and “Anything else?” sections.
- Result: local evidence is reviewable; public launch and broad universe portability remain explicitly unproved.

### Final verification

- `npm run typecheck`: passed.
- `npm test`: 14 live-runtime + 7 preserved experiment tests passed.
- `npm run format:check`: passed.
- `npm run build`: passed.
  - HTML 5.22 kB raw / 1.65 kB gzip.
  - CSS 8.64 kB raw / 2.59 kB gzip.
  - JavaScript 568.88 kB raw / 146.38 kB gzip.
  - Vite's 500 kB advisory remains visible.
- `npm run test:browser`: passed in visible Chrome.
  - Cargo attach/delivery and reload persistence passed.
  - Torque moved 43.87 m; Spark moved 103.23 m.
  - Spark reached 1.70 m airborne height.
  - `390 × 844` controls/instruments did not overlap.
  - Captured console/page errors: zero.
- Final local desktop sample: 175.0 ms from navigation start to first controllable, 8.89 ms average / 10.0 ms p95 frame time, 41 calls, 1,658 triangles, 23.7 MB reported JS heap; periodic-save snapshot 0.10 ms and 1,260 bytes.

### Artifacts and boundaries

- Created `docs/reviews/assets/rig-lab-01-desktop.png`.
- Created `docs/reviews/assets/rig-lab-01-narrow.png`.
- No private source asset was copied.
- No public deployment was performed.
- No git staging, commit, push, branch, history, or cleanup action was performed.

### Anything else?

The current technical contrast is real, but player-perceived contrast remains unverified. The next quality gate is whether external players independently describe Torque and Spark with different verbs and emotions rather than only noticing different speed.

## 2026-07-25 — Direct camera policies and Top-down live view

### Baseline and scope

- Refreshed the project context pack and re-read the 3D-game and Browser Daemon guidance.
- Rechecked the live Field 02 runtime after parallel terrain/progression work had superseded the earlier Rig Lab-only state.
- Baseline `npm run typecheck` passed.
- Baseline `npm test` passed with 72 root tests and seven preserved kernel-probe tests.
- Scoped the change to the canonical camera contract, state transition, renderer policy, interface selection, save recovery, browser observability, acceptance coverage, and durable decision record.

### Implementation

- Replaced the private three-item camera order with typed `CAMERA_MODES` and reusable labels.
- Added Hood, Side, and exact heading-oriented Top-down policies while preserving Chase, Tactical, and Survey.
- Added direct `selectCamera` state control and `window.selectCamera(mode)` browser control.
- Added an accessible View selector; `C` and the touch Cam action still cycle the same ordered policies.
- Preserved rig-specific values only for machine scale and chase/focus offsets; no camera policy branches on a rig id.
- Preserved current-schema camera choice through recovery.
- Added ADR-0008 and synchronized README and design-camera language.

### Pass 1 — immediate correctness and completeness

- The first test run correctly exposed one outdated expectation: after Chase, the new ordered next policy is Hood rather than Tactical. Updated the assertion to match the single canonical order.
- The browser test initially captured Top-down during its transition and produced an unrepresentative close frame. Added a bounded settling wait before evidence capture.
- A concurrent dev-server reload destroyed one Playwright execution context on the first acceptance attempt. Re-ran from stable current files; the complete workflow passed.
- Result: all six direct choices, selector/state agreement, cycle order, wraparound, save recovery, and live Top-down selection are exercised.

### Pass 2 — architecture and long-term viability

- Confirmed camera meanings live in one product-level vocabulary rather than per-rig or per-activity controllers.
- Preserved the existing Survey policy introduced by the terrain work instead of overwriting newer workspace state.
- Avoided number-key conflicts with workshop-module fitting.
- Kept the known future boundary explicit: unusual machine geometry may justify a bounded camera-mount adapter, while prop-aware collision remains separate from policy selection.
- Result: a bicycle, aircraft, or spacecraft can test the same policies without inheriting tractor or wheel assumptions.

### Pass 3 — rule compliance and supervision readiness

- `npm test`: 74 root tests plus seven kernel-probe tests passed.
- `npm run build`: typecheck and production build passed; JavaScript remains above Vite's 500 kB advisory at 617.70 kB raw / 162.84 kB gzip.
- `npm run format:check`: passed after formatting the previously unmatched `src/game/performance.ts`.
- `npm run test:browser`: passed in visible Chrome across cargo, jump, schema-v3 save/reload, all six cameras, `390 × 844` touch layout, and zero console/page errors.
- Browser Daemon was restarted after an IPC collision caused by parallel client commands, navigated to the live server, and left at `http://127.0.0.1:4174/?live=camera-policies` in Top-down.
- Result: Tier 4 local browser evidence exists; representative-device performance, external player comfort, prop collision, and non-ground-rig portability remain open.

### Acceptance evidence and boundaries

- Created `docs/reviews/assets/field-02-top-down.png`.
- Updated the existing desktop and narrow acceptance screenshots through the full browser run.
- Live acceptance sample: 458.3 ms first controllable, 21.89 ms average frame, 20.7 ms p95, 68 draw calls, 100,822 triangles, and 30.6 MB reported heap. These are local development-run observations, not device or production targets.
- No dependency, private source asset, public deployment, git staging, commit, push, branch, history, or cleanup action was performed.

### Anything else?

The camera vocabulary is now usable and visible, but comfort is not a one-frame property. A sustained-play review should measure motion comfort and prop obstruction in each policy before these values are treated as tuned production defaults.

## Traversal substrate correctness pass — 2026-07-25

This entry covers the terrain-substrate work in
[ADR-0007](decisions/ADR-0007-terrain-as-simulation-substrate.md) and the eight
defects it surfaced. Full record:
[traversal substrate acceptance review](reviews/TRAVERSAL_SUBSTRATE_ACCEPTANCE_2026-07-25.md).

### What changed for a player

The ground became a simulated system rather than a surface. Grade opposes the
engine with real gravity, surface material limits both drive force and steering
authority, suspension reads four terrain contacts, ploughing cuts the height field
itself, salvage sits off the graded tracks, and the map only shows ground the rig
could actually see. Observed in the browser: driving from pasture into the Sunken
Flats dropped grip 73% → 53% and speed 33 → 10 km/h.

### Defects found, and what each one teaches

- **Both rigs faced backwards.** Grille, hood, and headlights sat at local −Z with
  the plough, while travel is toward +Z. Present in the _accepted_ Rig Lab 01
  screenshot. No test asserted which way a rig faces, so nothing caught it.
- **`low-range gearing` was a false promise.** It claimed to climb grades that
  stall the engine and changed no climb at all, because traction bound before power
  did. Fixed with a `lowSpeedTorque` lugging term; the tractor now pulls from rest
  and the buggy needs a run-up.
- **The buggy out-gripped the tractor on tilled soil**, contradicting the field
  being the tractor's home ground.
- **Route endpoints detached from their pads** — an 11 m cliff at the Quarry
  corridor edge, caused by the grade limiter overwriting its own pinned endpoints.
- **A dark wall around the horizon in daylight**, because a `scene.background`
  colour clear skips tone mapping and the sRGB encode while fogged geometry does
  not. The first hypothesis (mismatched fog colour) was wrong and is recorded as
  wrong.
- **`placeRig` reported the previous location's surface**, which briefly produced a
  false reading inside the acceptance check itself.
- Plus a renderer-owned world layout the kernel could not collide with, and four
  wasted `height()` calls per terrain vertex.

Two of these were false _promises_ rather than crashes. A module that does nothing
and a vehicle that faces backwards both pass every test that only checks state
transitions. The tests added here assert claims — this module changes this outcome,
this surface favours this tyre — not only mechanics.

### Verification

- `npm run typecheck`: clean.
- `npm test`: 75 root tests (was 14) plus 7 preserved kernel-probe tests.
- `npm run build`: passes; 617.70 kB raw / 162.84 kB gzip, still over Vite's
  500 kB advisory.
- Terrain mesh build 445 ms → 174 ms; field map build removed from boot entirely
  (419 ms → 0 ms, deferred to first open); furrow draw calls 640 → 1; first
  controllable frame 3,946 ms → 458 ms.

### Measurement honesty

Frame timing inside the automation browser is unusable: a single 10,298 ms
`requestAnimationFrame` gap was observed and it reported 12 fps for a build whose
per-frame CPU cost measures 0.46 ms for step + render + HUD combined. The ~46 fps
figure in the acceptance review comes from a visible Chrome window and is an M3 Max
snapshot, not a target and not a device claim.

### Still open

External player comprehension (the central "do these feel different" claim),
audio heard by a human, device and cold-cache performance, the 390 × 844 layout
after this pass, and rollover. The world is also now large enough to be empty:
500 m with seven sites risks the "procedural expanse without authored reasons"
that DESIGN.md forbids, and more rigs or biomes will not fix that.

### Parallel work preserved

A parallel agent extended this pass mid-session with a six-mode camera vocabulary
and a Marsh Skimmer rig. Their work was left intact; only a stale hardcoded camera
assertion inside this pass's own test was updated to be table-driven.

## 2026-07-25 — Live visual-forward verification and browser-port correction

- Confirmed the reported backwards-driving defect was real in the earlier model: simulated travel used local `+Z`, while visible nose parts had been authored at `−Z`.
- Rechecked the corrected current geometry: tractor grille/headlights/small steering wheels are at `+Z`, the plough and large drive wheels are at `−Z`; the buggy nose is at `+Z` and tow hook at `−Z`.
- Added `GameRenderer.orientationEvidence()` using actual visible front/rear model parts. The browser acceptance now fails if either rendered nose projects opposite the rig's simulated heading.
- Added `window.getRigOrientationEvidence(id)` so the same contract is inspectable during live debugging rather than inferred from a screenshot.
- Found the in-app browser pointed at port `4173` while the verified server was on `4174` and `4173` had no listener. Moved the single development server to `4173`, updated the current README and acceptance defaults, and retained historical port references as historical evidence.
- Re-ran the full camera/cargo/jump/save/mobile browser workflow on `4173` and refreshed the visual artifacts.
- Captured `docs/reviews/assets/field-02-front-forward.png` after 900 ms of forward tractor input in Chase view.
- Final checks passed with 78 root tests, seven preserved kernel-probe tests, clean typecheck/formatting, production build, and zero current-page console errors.

### Three-pass review

- Pass 1 — correctness: verified both visible noses produce positive distance along simulated heading and observed forward movement with the corrected model.
- Pass 2 — architecture: asserted the visual/physics coordinate contract through real scene objects rather than a duplicated orientation flag.
- Pass 3 — supervision: checked tests, typecheck, production build, formatting, live browser console, current URL, and screenshot evidence; no git or deployment operation was performed.

### Anything else?

A future imported GLB must nominate real nose and rear reference nodes when it enters the renderer. That keeps the acceptance contract useful after primitive geometry is replaced instead of silently returning to a hand-authored assumption.

## 2026-07-25 — Marsh Skimmer 01 bounded mobility adapter

### Baseline and decision

- Re-entered the canonical instruction/context stack and ran `agent-start`
  against the renamed `rigs-unbound` checkout.
- Preserved the parallel camera, minimap, rendering/accessibility, research, and
  screenshot changes already present in the shared tree.
- Chose the existing Sunken Flats as the smallest honest test of a second
  locomotion family. A third wheeled profile would add content without exposing
  an architectural assumption.
- Recorded the decision in
  [ADR-0009](decisions/ADR-0009-bounded-mobility-adapters.md) and the derived
  scope in
  [Marsh Skimmer 01 plan](plans/MARSH_SKIMMER_01_2026-07-25.md).

### Implementation

- Advanced save schema v3 → v4 while preserving v1, v2, and v3 recovery.
- Moved ground-only fields into `GroundMobilityState`; added
  `HoverMobilityState` for lift velocity, clearance, cushion pressure, and skirt
  contact.
- Added a typed registry that owns stepping, settling, and stability for the
  implemented `ground` and `hover` families.
- Added Drift at the authored Sunken Flats berth with a deterministic
  low-hover controller, slope/strain trade-off, and no drowning.
- Added a wheel-free primitive renderer, lift-fan voice, water spray, Cushion
  HUD, public hover telemetry, shared switching, and v4 persistence.
- Extended browser acceptance through three orientation fixtures, deep-water
  motion, no-wheel state, condition preservation, Cushion UI, save, and reload.

### Visual review corrections

- The first passing screenshot was unusable because the camera smoothed from a
  distant Spark position to Drift and travelled through terrain. Added a
  policy-level hard cut when the active rig changes or the desired camera
  position discontinuity exceeds 70 m; ordinary driving remains smoothed.
- The replacement shot drove directly toward the Sunken Flats mast. The
  acceptance route now uses Drift's offset berth, and discovered site masts
  recede so arrival composition remains readable.
- The narrow layout assertions passed while the screenshot still cropped Drift
  on the right. A 35% side-offset trial was insufficient; portrait chase now
  uses 10% of the cinematic side offset with a stronger distance/height
  pullback for the narrow horizontal field of view. Its look target is biased
  downward so the rig composes upward into the safe space above the field kit
  rather than behind the instruments.
- The long autonomous towing leg flaked twice by orbiting/stalling outside the
  gate. Browser acceptance now uses the existing test-only placement hook to
  align the attached cargo 12 m from delivery, then drives the real final towing
  leg. This keeps attach → tow → deliver coverage while removing navigation-bot
  quality from the release gate.
- The rear fans can still resemble circular wheels in one static rear view.
  This is recorded as an authored-model/silhouette hardening item rather than
  hidden behind the passing runtime contract.

### Multi-pass result

- Pass 1: existing ground behavior stayed green; new deterministic water,
  hover-repeatability, steep-ground, mismatch-recovery, and v3 migration tests
  passed.
- Pass 2: replaced the initial two-way dispatcher with the registry promised by
  ADR-0009; no speculative adapter types entered the contract.
- Pass 3: docs, tests, runtime hooks, browser evidence, confidence boundary, and
  remaining hardening paths are recorded in
  [Marsh Skimmer 01 acceptance](reviews/MARSH_SKIMMER_01_ACCEPTANCE_2026-07-25.md).

### Evidence and boundaries

- `npm test`: 83 root tests plus seven preserved kernel-probe tests passed.
- `npm run typecheck`: passed across the game and probe.
- `npm run format:check`: passed.
- `npm run build`: passed; 633.48 kB raw / 167.17 kB gzip JavaScript, with the
  existing 500 kB Vite advisory.
- `npm run test:browser` on port 4173: passed cargo, ramp, three rigs, six
  cameras, steering/body/camera perception, reduced-motion clamping, hover
  water, schema-v4 reload, `390 × 844`, and zero console/page errors.
- No dependency, private Kenney source asset, deployment, branch, stage, commit,
  push, history, cleanup, or deletion operation was performed.

### Anything else?

The architecture proof is strong local evidence; the fun claim is still open.
The next valuable step is external player-language testing and a shared
rescue/repair activity before another roster addition, unless a new locomotion
family exposes a specific body-state assumption the current union cannot hold.

## Optimization gaps second-pass (2026-07-25)

- Completed a structured second-pass analysis of the untrusted optimization-context conversation against live files, with a skill-by-skill audit path (`3d-games`, `threejs-shaders`, `threejs-materials`) to preserve evidence-first method discipline.
- Confirmed no code-path changes were introduced in this pass; all outputs are docs-only.
- Added `docs/research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md` with:
  - implemented-vs-missing mapping for culling/LOD/streaming/replay/authority/collision layers;
  - explicit execution ordering aligned to render/perf/accessibility first, then collision/streaming/replay, then authority;
  - skill-to-repo evidence linkage.
- Remaining open gates from this pass:
  - frustum+distance+LOD visibility policy and fixture;
  - collision-category matrix for obstacle/hazard/trigger/projectile surfaces;
  - replay transport and verifier;
  - server-authority plan after replay determinism and public workflow safety contracts are in place.

### 2026-07-25 — Optimization/additional systems continuation (same day)

- Per the follow-on "3D Game Optimization Gaps" context, the same untrusted
  conversation thread was re-checked for broader architecture growth systems beyond
  the initial rendering/physics/perf list.
- Added the systems gap matrix into
  [3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md](research/3D_GAME_OPTIMIZATION_GAPS_SECOND_PASS_2026-07-25.md),
  covering:
  - ECS migration readiness
  - streaming world manifest
  - asset pipeline maturity
  - simulation layers
  - behavior/event architecture
  - modding architecture
  - deterministic replay artifact
  - resource governance
- Synced the same queue into
  [EXPLORATION_MAP.md](../docs/exploration/EXPLORATION_MAP.md) under
  **3D optimization continuity checkpoint** so long-term queueing remains visible.
- Confirmed and documented that the highest-confidence claims are:
  - fixed-step deterministic kernel and save migration are present,
  - renderer state separation is intact,
  - observability exists for first-pass hardening,
  - multiplayer/streaming/replay authority claims are still non-functional.
- No runtime code was changed for this pass; this was an analysis/curation
  update only (evidence tier: static inspection + path-level references).

## 2026-07-25 — Platform-continuation audit expansion

- Per the same objective and the untrusted optimization-context conversation, I ran a second continuation synthesis pass that explicitly maps the “more” section (deterministic kernel as architecture pillar, world schema, renderer/subsystem separation, modding economics, machine-centric capabilities, authority pipeline) into a single platform backlog artifact.
- Added [3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md] with:
  - a matrix that crosschecks claim intent to current repo evidence,
  - explicit status per area (`Strong`, `Partial`, `Missing`),
  - a machine-centric platform sequence,
  - and closed-loop evidence-gate checklist.
- Synced the continuation registry into [EXPLORATION_MAP.md] under the
  3D optimization continuity and machine-capability sections.
- Used the same skill-by-skill audit order:
  - 3d-games → 3d-web-experience → threejs-materials → threejs-shaders.
- This pass remains docs-only; execution remains pending on the highest-priority
  gates (render hardening, replay governance, collision matrix, chunk manifest,
  authority lane).

## 2026-07-25 — Rig Perception Chain 01

- Accepted the project-owner rule that physics, controls, animation, camera,
  lighting/VFX, audio/haptics, UI, and player perception form one gameplay
  chain.
- Added a derived `RigFeedbackFrame` shared by renderer and procedural audio;
  simulation remains authoritative and save-compatible.
- Added visible front-wheel steering, bounded propulsion/lateral chassis
  expression, and speed/steering chase-camera anticipation.
- Added operating-system reduced-motion handling for optional body/camera
  expression and speed-driven field-of-view changes.
- Changed condition feedback history from one active-rig scalar to per-rig
  values, preventing a rig switch from looking like new damage.
- Screenshot review caught broad-rig clipping in portrait chase. The shared
  profile-scaled policy now uses a stronger pullback and zero cinematic side
  offset in narrow view.
- Recorded ADR-0012, the implementation plan, a browser-physics technique
  catalog, exploration schema expansion, design rules, and acceptance evidence.
- Parallel work introduced ADR-0011 while this lane was active; references were
  rechecked and the perception ADR was preserved as ADR-0012.
- Evidence:
  - 83 root tests and seven kernel-probe tests passed;
  - typecheck, formatting, and production build passed;
  - browser acceptance passed three rigs, six cameras, cargo, ramp, hover,
    perception evidence, reduced motion, reload, and `390 × 844`;
  - zero console/page problems;
  - current build: 633.47 kB raw / 167.17 kB gzip JavaScript, retaining the
    existing 500 kB advisory.

### Anything else?

The new evidence proves that the perception pipeline is connected. Emotional
feel, representative-device budgets, haptics, articulated tools, and the
leading Rapier service hypothesis remain explicit proof gates.

- 2026-07-25: Created `docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md` to consolidate the latest “3D Game Optimization Gaps” recommendations with repo-grounded implementation status and a prioritized execution order. Included gap-by-gap status (kernel, migration, culling/LOD, streaming, capabilities, affordances, collisions, authority/events, observability) and concrete acceptance gates.
- 2026-07-25: Added a `3d-games` skill synthesis checkpoint to `docs/exploration/EXPLORATION_MAP.md` so the per-skill guidance now lands in the canonical exploration map rather than only in research notes. The checkpoint now explicitly ties frustum culling, LOD, layer-based collisions, camera policy, and shadow strategy back to the live implementation and the remaining proof gates.
- 2026-07-25: Added skill provenance to `docs/research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md` so the audit records which `3d-games` skill files were used and what layers of guidance were applied versus project-specific interpretation.
- 2026-07-25: Added an evidence matrix to the same synthesis doc so the audit now names the strongest repository proof for each major gap area (kernel, save/versioning, renderer boundary, culling/LOD, collision matrix, capability model, replay/event lane, chunk streaming, observability).
- 2026-07-25: Cross-linked the execution roadmap to the new synthesis artifact so the implementation runway and the evidence/provenance layer now point at one another instead of drifting apart.
- 2026-07-25: Cleaned two wording slips in the new synthesis/roadmap docs (`capabililty` -> `capability`, duplicate `boundary boundaries`) so the long-term notes remain readable and search-friendly.
- 2026-07-25: Added [ADR-0014](decisions/ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md) to make the capability/streaming/replay/authority/ECS rollout order explicit, then linked it back into the canonical exploration map and roadmap.
- 2026-07-25: Implemented a lightweight bounded run-record lane in `src/main.ts` and `src/game/run-record.ts`, capturing commands, input transitions, checkpoints, and saves so the replay gate has a concrete starting point without unbounded tab-lifetime growth. The browser surface now also exposes the structural verifier alongside the record snapshot.
- 2026-07-25: Extended `docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md` with the bounded recorder state and a compact change-plane / machine-centric growth addendum so the canonical analysis now reflects the current replay contract and the later “and more” architecture in one place.
- 2026-07-25: Extended the same canonical analysis with a data/asset/ingestion addendum and linked that contract layer back into the roadmap so manifests, validation, provenance, and resource budgets are now documented as product architecture rather than implied build steps.
- 2026-07-25: Corrected the canonical analysis replay row so it now states the bounded input-recording lane and browser-visible verification hook as current reality while keeping durable playback API work explicitly open.
- 2026-07-25: Added a behavior/event scheduler addendum to the canonical analysis and mirrored the split into the roadmap so behavior selection stays distinct from event recording and presentation.
- 2026-07-25: Added a streaming-world contract addendum to the canonical analysis and a matching roadmap lane so chunk residency is now described as a manifest-driven lifecycle with explicit activation, unload, and rollback rules.
- 2026-07-25: Added an ECS/entity-composition addendum to the canonical analysis and a threshold-gated ECS lane in the roadmap so ECS remains a proof-based migration decision instead of an assumption.
- 2026-07-25: Added [ECS Threshold and Composition Readiness Contract](research/ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md) so the composition threshold, migration trigger, and identity-preservation proof slice now live as a dedicated contract note and are linked from analysis, roadmap, and exploration.
- 2026-07-25: Added an authority-scaling addendum to the canonical analysis and a matching roadmap lane so authoritative mutation, intent queues, and replay-safe rejection handling are now explicit contracts instead of implied future work.
- 2026-07-25: Added a simulation-layer and resource-governance addendum to the canonical analysis and a matching roadmap lane so cross-domain systems now have an explicit ordered domain table and budget ledger instead of being implicit loop behavior.
- 2026-07-25: Added a modding and creator-pack addendum to the canonical analysis and a matching roadmap lane so user-authored content is now framed as versioned, validated packs with explicit compatibility and rollback rules.
- 2026-07-25: Added an event-system addendum to the canonical analysis and a matching roadmap lane so world events are now framed as versioned deterministic envelopes with ordered handlers and replay-safe telemetry.
- 2026-07-25: Added an asset-pipeline addendum to the canonical analysis and a matching roadmap lane so runtime assets now flow through versioned manifests with provenance, validation, and safe replacement rules.
- 2026-07-25: Added a web asset ingest/compression/provenance contract and tied it into the web audit plus roadmap lane so browser-facing assets now have explicit source-to-runtime validation, compression, and reject-path rules.
- 2026-07-25: Ran a live accessibility browser pass on the current Field 02 runtime, fixed the concrete keyboard gaps (added a skip link and made the canvas a reliable focus target), and rechecked that dismissing the intro now lands focus on `canvas#game-canvas`. Preserved the positive signals too: semantic landmarks, visible focus rings, reduced-motion support, and no console errors.
- 2026-07-25: Added a visibility-stage and LOD contract after rechecking the live renderer evidence (`render_game_to_text`, `getPerformanceSnapshot`, `selectCamera`) so the instanced world, blob-shadow posture, and current draw-radius strategy are now documented as a deliberate first-pass visibility budget rather than an implicit heuristic.
- 2026-07-25: Added a replay artifact and ghost contract after rechecking the live bounded recorder hooks (`getRunRecord`, `getRunRecordVerification`) so the current record shape, verification state, and missing playback/divergence rules are now documented as a product surface rather than only a debug log.
- 2026-07-25: Added a collision category and mask contract after rechecking the live obstacle-resolution code so obstacle kinds, trigger/sensor behavior, and collision telemetry are now documented as an explicit contract instead of only an implicit resolver.
- 2026-07-25: Added a camera feel contract after rechecking the live camera modes and profile-driven camera work so named modes, obstruction pull-in, reduced-motion clamping, and transition observability are now documented as an explicit contract instead of only renderer behavior.
- 2026-07-25: Added a physics quality envelope contract after rechecking the live traversal model and performance snapshots so deterministic motion, stability invariants, and fallback behavior are now documented as an explicit contract instead of only physics code.
- 2026-07-25: Added a resource budget and fallback envelope after rechecking the live performance snapshot so measured frame, draw, triangle, heap, and load posture are now documented as an explicit resource-governance contract instead of only runtime telemetry.
- 2026-07-25: Added an event graph and deterministic handlers contract after rechecking the command/checkpoint/save flow so event identity, ordering, ownership, and replay-safe payload rules are now documented as an explicit contract instead of only feature-local signaling.
- 2026-07-25: Added a behavior-system addendum to the canonical analysis and a matching roadmap lane so AI/planner behavior is now a versioned read-only decision layer rather than implicit feature logic.
- 2026-07-25: Added a world-affordance addendum to the canonical analysis and tightened the roadmap affordance lane so capability resolution now explicitly validates against world-facing interaction surfaces.
- 2026-07-25: Added a visibility-stage addendum to the canonical analysis and a matching roadmap lane so culling and LOD are now explicit policy with measurable draw budgets and degradations.
- 2026-07-25: Added a collision-category addendum to the canonical analysis and a matching roadmap lane so physics now distinguishes ground, obstacle, hazard, trigger, projectile, sensor, and decorative roles explicitly.

## 2026-07-25 — OpenAI Sites deployment preparation

- Re-entered the instruction stack and regenerated the canonical project context
  after the user requested a public Sites deployment.
- Audited the shared worktree before mutation: one `main` worktree, no stash, no
  local-only commits, and all parallel source/docs/research/visual evidence
  preserved.
- Recorded [ADR-0013](decisions/ADR-0013-sites-deployment-adapter.md) and added a
  bounded Cloudflare Worker-compatible adapter around the existing Vite game.
  The runtime, state model, local persistence, and gameplay routes remain
  canonical and unchanged by hosting.
- Source-controlled only the opaque Sites project ID. No source credential,
  environment value, token, private paid source asset, or runtime secret was
  added.
- Upgraded the hosting toolchain from the bundled template versions to patched
  current releases after the first audit reported transitive advisories.
  `npm audit --json` then reported zero vulnerabilities.
- Verification before commit:
  - `npm run typecheck`: passed;
  - `npm test`: 83 root tests and seven kernel-probe tests passed;
  - `npm run build`: passed and emitted Worker/client/hosting artifacts;
  - production-compatible preview on `4174`: full browser acceptance passed
    with zero console/page errors;
  - the existing 633 kB bundle advisory remains a visible hardening item.
- The exact acceptance boundary and three review passes are recorded in
  [Sites deployment acceptance](reviews/SITES_DEPLOYMENT_ACCEPTANCE_2026-07-25.md).
  Production success is not claimed until the immutable commit is pushed,
  packaged, saved, deployed, and reported `succeeded` by Sites.

### Production closure

- The exact source commit passed the managed hook, was pushed to GitHub and the
  Sites source repository, rebuilt cleanly, and passed the Sites packaging
  validator.
- Public access was enabled and Sites reported terminal `succeeded` status.
- Live URL:
  [https://rigs-unbound.suyashpranay.chatgpt.site](https://rigs-unbound.suyashpranay.chatgpt.site)
- Live verification returned HTTP 200 and passed the product contract: correct
  title, visible welcome surface, schema-v4 state export, Torque/Spark/Drift
  roster, and zero console/page errors.
- The first `networkidle` browser condition timed out; this was not treated as a
  product failure because an always-running game is not expected to become
  network-idle. The corrected readiness contract used DOM content plus explicit
  game assertions and passed.
- Sites Worker error logs contained no recent errors after the live probes.

## 2026-07-25 — Bounded run-record foundation preserved from parallel work

- Preserved the parallel run-record integration that arrived during deployment
  closure and treated it as runtime code, not a docs-only artifact.
- Rejected an unbounded fixed-step input log because a held control would append
  roughly 60 entries per second for the lifetime of the tab.
- Changed the recorder to capture input transitions, retain a bounded recent
  window, and report dropped-entry count explicitly.
- Added deterministic tests for schema serialization, elapsed-time
  normalization, bounded retention, and truncation visibility.
- Re-ran the full port-4174 browser acceptance and a focused keyboard-driven
  recorder probe; command, checkpoint, and input entries were visible, the
  structural verifier returned `ok: true` with no issues, and the browser
  reported zero console/page errors.
- This remains a diagnostics/reproducibility foundation, not a deterministic
  replay claim: durable storage and playback parity are still required, even
  though checkpoint hashes, a structural verifier, and a browser-visible
  verification hook are now in place.
- 2026-07-25: Added a camera-feel addendum to the canonical analysis and a matching roadmap lane so camera policy, transition rules, obstruction handling, reduced-motion behavior, and FOV changes are explicit product contracts.
- 2026-07-25: Added a deterministic-replay addendum to the canonical analysis and a matching roadmap lane so replay becomes a portable artifact with playback verification, divergence reporting, and operator-visible provenance.
- 2026-07-25: Added a shader/material addendum to the canonical analysis and a matching roadmap lane so visual identity, readability, weather cues, hazard feedback, and low-end fallbacks are explicit contract surfaces.
- 2026-07-25: Added a spatial-culling addendum to the canonical analysis and a matching roadmap lane so distance, portal, chunk-residency, and render-streaming behavior are explicit scale contracts.
- 2026-07-25: Added an LOD addendum to the canonical analysis and a matching roadmap lane so geometry, materials, animation, AI, physics, particles, and feedback all have explicit downgrade contracts.
- 2026-07-25: Added a resource-budget addendum to the canonical analysis and a matching roadmap lane so CPU, GPU, memory, residency, active actors, and battery/thermal pressure have explicit fallback envelopes.
- 2026-07-25: Added a portal-visibility addendum to the canonical analysis and a matching roadmap lane so room/portal graphs have explicit bounded-room visibility contracts.
- 2026-07-25: Added a lighting-and-atmosphere addendum to the canonical analysis and a matching roadmap lane so staged lighting, shadow fallbacks, and low-cost readability cues are explicit contracts.
- 2026-07-25: Added an accessibility-and-input addendum to the canonical analysis and a matching roadmap lane so named actions, remapping, reduced-motion, contrast, and device parity are explicit contracts.
- 2026-07-25: Added a kernel-ordering addendum to the canonical analysis and a matching roadmap lane so mutable subsystems must enter through explicit tick-order, write-scope, and replay-safe gates.
- 2026-07-25: Added a world-and-architecture-scalability addendum to the canonical analysis and a matching roadmap lane so chunk growth, activity packs, migration boundaries, and shared-state readiness stay bounded and testable.
- 2026-07-25: Added a save-and-migration observability addendum to the canonical analysis and a matching roadmap lane so state mutations, saves, and migrations carry reason codes, version metadata, and explicit recovery visibility.
- 2026-07-25: Added a physics-quality-envelope addendum to the canonical analysis and a matching roadmap lane so terrain contact, obstacle stability, cornering, and fallback behavior stay deterministic and playable.
- 2026-07-25: Added an authoring-and-content-validation addendum to the canonical analysis and a matching roadmap lane so content manifests, provenance, and validator-first results are explicit contracts.
- 2026-07-25: Added a performance-and-readability baseline addendum to the canonical analysis and a matching roadmap lane so culling, LOD, camera, collision, and instrumentation thresholds have one umbrella policy surface.
- 2026-07-25: Added a second-locomotion-family and cross-mode continuity addendum to the canonical analysis and a matching roadmap lane so capability-first motion expansion preserves shared actions and recovery behavior across modes.
- 2026-07-25: Added an authority-model groundwork addendum to the canonical analysis and a matching roadmap lane so local-first simulation, authenticated mutation, and durable-value recovery have an explicit future authority boundary.
- 2026-07-25: Added an engine-branch evaluation addendum to the canonical analysis and a matching roadmap lane so alternate backends are only benchmarked against the canonical Three.js path when budgets or platform constraints justify it.
- 2026-07-25: Added a replay-and-ghost product feature addendum to the canonical analysis and a matching roadmap lane so shareable replay artifacts stay deterministic, versioned, and trustable.
- 2026-07-25: Added a verification-harness and confidence-gates addendum to the canonical analysis and a matching roadmap lane so deterministic fixtures, tiered evidence, and failure traces are explicit proof contracts.
- 2026-07-25: Created `docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md` as the renderer budget-threshold and visual-language companion note referenced by the canonical analysis.
- 2026-07-25: Created [ADR-0015](decisions/ADR-0015-renderer-camera-policy-v1x.md) as the v1.x renderer/camera policy ADR referenced by the canonical analysis follow-up list.
- 2026-07-25: Created `docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md` as the production-like profile KPI note referenced by the canonical analysis follow-up list.
- 2026-07-25: Created `docs/research/CULLING_LOD_SPIKE_TESTS_2026-07-25.md` as the deterministic culling and LOD spike-test companion note referenced by the canonical analysis follow-up list.
- 2026-07-25: Created `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md` to answer the first-public-smoke-test accessibility/camera gate and bound the standard/mobile-safe acceptance profiles.
- 2026-07-25: Updated the canonical 3D analysis to remove the open accessibility smoke-test question and point it at the new renderer/performance/accessibility contract note.
- 2026-07-25: Updated the multi-skill long-term possibility audit so the renderer/performance/accessibility contract bundle is recorded as the immediate documentation-and-validation track.
- 2026-07-25: Reconciled the renderer budget and KPI companion notes so their open questions now point to the new first-public-smoke-test contract instead of repeating the same gap.
- 2026-07-25: Created `docs/research/PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md` to answer the remaining high-speed readability question through the shared perception frame.
- 2026-07-25: Updated the canonical 3D analysis so the open physics-readability risk is now a named contract instead of a dangling question.
- 2026-07-25: Created `docs/decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md` to bind the shared threshold bands, fallback order, and capture bundle for public acceptance.
- 2026-07-25: Reconciled the KPI and rendering-economy notes so their threshold questions now point at ADR-0016 rather than behaving like standalone policy gaps.
- 2026-07-25: Created `docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md` to name the canonical comparison scenes for threshold captures.
- 2026-07-25: Updated the KPI and rendering-economy notes so fixture-selection questions now point at the canonical threshold fixture baseline.
- 2026-07-25: Created `docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md` to map each subsystem to the most explanatory canonical capture.
- 2026-07-25: Updated the KPI and rendering-economy notes so capture-selection questions now point at the new selection protocol instead of lingering as open policy questions.
- 2026-07-25: Created `docs/research/READABILITY_METRIC_RUBRIC_2026-07-25.md` to name transition latency as the lead unreadability predictor and rank the supporting signals.
- 2026-07-25: Updated the KPI, rendering-economy, and canonical analysis notes so the unreadability question now points at the metric rubric instead of lingering open.
- 2026-07-25: Created `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md` to bind the 30-second loop, session loop, long arc, and opportunity guidance.
- 2026-07-25: Updated the exploration map and canonical analysis so the player-loop contract is now part of the repo’s living architecture instead of an implied design idea.
- 2026-07-25: Created `docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md` to bind browser loading progression, fallback visibility, and profile bootstrap.
- 2026-07-25: Updated the 3D web audit and canonical analysis so the loading-fallback gap now points at the named bootstrap contract.
- 2026-07-25: Created `docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md` to formalize rig capabilities, adapter binding, reason-coded admission, and world-affordance resolution.
- 2026-07-25: Created `docs/research/BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md` to formalize the command-to-decision layer, deterministic planner choice, and read-only behavior boundaries.
- 2026-07-25: Created `docs/research/STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md` to formalize the chunk-manifest lifecycle, residency states, budget counters, and rollback rules.
- 2026-07-25: Created `docs/research/SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md` to formalize owned simulation layers, update order, and governance fallback visibility.
- 2026-07-25: Created `docs/research/MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md` to formalize validated creator packs, compatibility rules, and rollback-safe publication staging.
- 2026-07-25: Created `docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md` to formalize the world-verb/capability resolution step and keep interactions deterministic.
- 2026-07-25: Created `docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md` to formalize the source-to-manifest asset path, provenance validation, and runtime replacement rules.
- 2026-07-25: Created `docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md` to formalize layered materials, readability, and fallback strategy for renderer cues.
- 2026-07-25: Created `docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md` to formalize tiered lighting, shadow fallback, and atmosphere readability.
- 2026-07-25: Created `docs/research/PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md` to formalize room/portal graphs and bounded-room visibility.
- 2026-07-25: Created `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md` to formalize named actions, remap persistence, and device-parity controls.
- 2026-07-25: Created `docs/research/KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md` to formalize the authoritative step order and mutable subsystem gates.
- 2026-07-25: Created `docs/research/SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md` to formalize versioned persistence, migration observability, and recovery summaries.
- 2026-07-25: Created `docs/research/AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md` to formalize manifest validation, provenance metadata, and runtime-ready status.
- 2026-07-25: Updated the exploration map so the behavior/planner and simulation-layer/resource-governance backlog rows now point at their existing contract notes instead of reading as unnamed gaps.
- 2026-07-25: Reconciled the remaining exploration-map backlog rows to their named contract notes so chunked world scaling, ECS, LOD, portal visibility, shader/material, collision, replay, modding, and resource governance are all discoverable from the canonical map.
- 2026-07-25: Normalized the exploration backlog table wording from raw Missing/Partial labels to named-contract status so the canonical map now reflects documented ownership even where implementation is still pending.
- 2026-07-25: Normalized the occlusion-integration row to named-contract status so visibility-stage work is now described consistently with the existing contract note.
- 2026-07-25: Normalized the frustum/distance culling row to named-contract status so the visibility-stage backlog block is now fully described in contract terms.
- 2026-07-25: Added a contract-note reconciliation section to the optimization synthesis doc so the major follow-on lanes now point at the exact durable notes that own them.
- 2026-07-25: Added a contract-note reconciliation section to the platform long-term audit so each major platform-growth lane now has a named boundary note.
- 2026-07-25: Added a contract-note bridge to the second-pass optimization audit so the extended follow-on recommendations now point at the named durable notes that own them.
- 2026-07-25: Expanded the second-pass audit bridge to include shader/material, asset-pipeline, and simulation-layer contract notes so the full follow-on trail is linked rather than partial.
- 2026-07-25: Replaced the umbrella-baseline addendum's generic contract list with explicit links to the named contract notes for visibility, camera, lighting, accessibility, collision, and physics.
- 2026-07-25: Added explicit contract links to the camera, replay, accessibility, world-scaling, and authoring addenda in the main analysis doc so those lanes now point at named boundaries instead of broad prose.
- 2026-07-25: Added an explicit contract anchor to the save/migration observability addendum so the persistence observability lane now points at the named boundary.
- 2026-07-25: Added an explicit contract anchor to the lighting and atmosphere addendum so the lighting lane now points at the named boundary.
- 2026-07-25: Added an explicit contract anchor to the performance/readability baseline addendum so the umbrella policy now points at its named boundary.
- 2026-07-25: Added explicit contract anchors to the second-locomotion, authority, engine-branch, replay, and verification-harness addenda so the remaining growth lanes now point at named boundaries.
- 2026-07-25: Added an explicit contract anchor to the streaming addendum so chunk residency now points at the named boundary.
- 2026-07-25: Added a contract-note map to the second-pass audit execution order so the renderer, collision, replay, authority, and formalization lanes now point at exact owning notes.
- 2026-07-25: Created `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md` to formalize the umbrella policy over culling, LOD, camera, collision, and transition budgets.
- 2026-07-25: Created `docs/research/SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md` to formalize the second motion grammar, shared actions, and rollback continuity.
- 2026-07-25: Created `docs/research/AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md` to formalize the local-first authority boundary and future-only shared-state wording.
- 2026-07-25: Created `docs/research/ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md` to formalize the bounded backend-comparison gate.
- 2026-07-25: Created `docs/research/VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md` to formalize deterministic fixtures, evidence tiers, and confidence gates.

## 2026-07-25 — Physics Lab 01: replaceable chassis and raycast-wheel dynamics

- Executed ADR-0017's first coherent physics slice with Rapier `0.19.3` behind
  project-owned intent and dynamics contracts.
- Added a separate Physics Lab entry with a dynamic chassis, four raycast
  wheels, asphalt/gravel/mud/ice response, fixed-step controls, plain-data
  capture/reset, debug geometry, automatic recovery, and six camera policies.
- Made the visual front explicit and added browser proof that positive throttle
  moves the front toward local positive Z.
- Added focused intent/dynamics tests and a reusable browser acceptance tool.
- Captured and inspected desktop, top-down, debug, and `390 × 844` evidence.
- Continued the Adjacent Activity Expansion audit: no repeated
  tractor-name-gated shared-runtime behavior or universal controller appeared;
  the direct tractor migration path remains bounded to historical save input.
- Recorded the decision, plan, research/exploration updates, acceptance
  contract, tool use, and known articulation/device/player-feel gaps.
- A parallel process updated `main` during this work and included part of the
  physics foundation in `aa82cee`; this task did not create or push that commit.

### Anything else?

The next physics evidence should compose unstable towing and motorized lifting
into one rescue, construction, or recovery activity. More isolated chassis
tuning would now provide less information than testing articulation, load, and
capability ownership together.

- 2026-07-25: Added a Physics Lab browser-experience addendum and roadmap lane so the standalone lab stays a browser evidence fixture with explicit boot, accessibility, fallback, and acceptance boundaries.
- 2026-07-25: Linked the replay and ghost roadmap lane back to the existing replay contract so the shareable-artifact boundary is no longer an orphaned bullet list.
- 2026-07-25: Linked the authority roadmap lane back to the existing authority contract so future shared-state behavior remains explicitly future-gated.
- 2026-07-25: Added a world-and-architecture scalability contract so chunk growth, activity packs, migration boundaries, and shared-state readiness stay bounded and testable.
- 2026-07-25: Folded Physics Lab 01 into the verification-harness contract so the browser-visible fixture now anchors the confidence-gates trail as well as the lab-specific acceptance review.

## 2026-07-25 — Direction session: game-systems analysis, ADR-0018, Farmfall plan, simulated playtests

- Full instruction-stack session: explored code, docs, and all 16 ADRs;
  verified ground truth (typecheck + 83 root tests + 7 kernel-probe tests
  green at session start).
- Created `docs/exploration/GAME_SYSTEMS_ANALYSIS_AND_DIRECTION_2026-07-25.md`:
  verified-state assessment, the "engine without a game" gap analysis,
  first-principles leveling/mechanics/modes/scenes/characters proposals, and
  documentation-hygiene findings.
- Operator decisions recorded verbatim in that doc: build all four
  workstreams (farm/defense slice, mastery spine, time trial + ghost,
  external-player gate simulated for now); leveling = full spine **plus**
  in-verb vertical power; engine bakeoff probe scheduled against the existing
  engine-branch gating contract (not duplicated).
- Created ADR-0018 (Accepted): Journey + Verb Mastery + Insight progression
  spine with situation-weighted accrual and bounded in-verb power composed
  through `effectiveProfile()`.
- Created `docs/plans/FARMFALL_SLICE_01_2026-07-25.md`: crops, noise/light
  signature ecology, night threats, dawn consequences, and the mastery
  kernel, with explicit scope boundaries against parallel physics-lab work.
- Launched three uncontaminated simulated-player agents (casual / achiever /
  explorer) against the live build; reports land in
  `docs/reviews/PLAYTEST_SIM_*_2026-07-25.md` with screenshots under
  `artifacts/playtest-*`.

### Anything else?

Yes. The multi-agent stale-state rule was applied wrong at first in this
session (shared docs were avoided instead of re-read); corrected in the same
session — append-only edits with fresh anchors are the motto-conformant path,
and that is how this entry was made.

- 2026-07-25: Created `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md` after the operator loaded the `webgpu` and `web-performance-optimization` skills — full renderer/boot/bundle/caching audit with a prioritized P1–P3 work-item list; headline findings: zero custom GLSL makes WebGPU portability cheap, no context-loss handling exists, boot is a synchronous terrain-build wall with no loading state, `firstControllableMs` measures first render not input-readiness, and WASM payloads are correctly isolated.
- 2026-07-25: Fresh production build recorded in that analysis: game boot ~667 kB raw / ~178 kB gzip; the 2.77 MB three.module sourcemap ships publicly (policy item P3-a).
- 2026-07-25: First simulated playtest (achiever) accepted into evidence: rig fantasy language gate passed ("planted/deliberate/stubborn/honest" vs "skittish/eager/reckless/brittle"), but the economy first rung is unreachable (0 salvage banked in 10+ min, pickup untaught); four bugs routed into Farmfall scope (intro modal re-opens mid-drive, spawn camera blocked by silo wall, no wreck state at 0% condition, Physics Lab dev button exposed in player UI).
- 2026-07-25: Casual and explorer playtests completed (both agents hit the 2h cap still playing, resumed in report-only mode). Casual 4/10 (tab-close at ~6–8 min): Torque "planted/lumbering/sturdy", Spark "twitchy/eager/fragile", Drift "floaty/slidy/ghostly"; found hood camera broken and Drift's 320%-grade climb. Explorer 7/10: "alive as a system, empty as a place — a beautifully instrumented ghost valley"; confirmed persistence works (world restored even a drowned rig); found the salvage-collection defect, day/night clock derail, and the drowned-rig soft-lock.
- 2026-07-25: Created `docs/reviews/PLAYTEST_SIM_SYNTHESIS_2026-07-25.md` — three-persona cross-tabulation: fantasy-differentiation gate PASSED by all personas; blocking fun gap = missing first rung (0 salvage banked by everyone); 12-bug consolidated list (4× P0); scores 4/6/7 with a named cheap path to 7–8. Meta-finding: fresh-eyes simulation caught P0s that all prior tests missed because every prior test knew how the game was supposed to be played; the lane is now proven and repeats after Farmfall.
- 2026-07-25: Farmfall Slice 01 plan revised — Phase 0 (playability repair: B1–B4 P0s + reachable first salvage + P1/P2 cheap fixes) prepended ahead of the kernel phase; implementation launched with regression-test-first mandate.

## 2026-07-25 — Box3D Probe 01 and expanded solver evidence map

- Re-verified Box3D against its official announcement, repository, simulation
  docs, and recording docs; verified the new third-party `box3d-wasm@0.2.0`
  package, so the earlier “no ready npm package” statement is now recorded as
  stale.
- Updated ADR-0017 before implementation: Box3D is now a mandatory bounded
  physical-wheel experiment, while Rapier remains the raycast-wheel proof and
  the product architecture stays solver-independent.
- Split the dynamics service into a shared world port plus explicit raycast and
  physical-wheel creation capabilities.
- Added a single-thread Box3D adapter with four physical wheel bodies/joints,
  semantic intent, telemetry, complete assembly capture/restore, explicit
  lifecycle disposal, exact dependency integrity, and no save/activity
  authority.
- Added the separate `/box3d-lab.html` route through the existing Physics Lab
  runner and renderer. Six views, correct positive-front direction, desktop and
  narrow controls, and browser-readable state all passed.
- Added a Box3D browser acceptance runner and inspected desktop, top-down, and
  narrow screenshots. Positive throttle advanced `+7.96 m` in the acceptance
  run, steering rotated the chassis, all views selected, reset restored four
  wheel bodies, and console problems were empty.
- Expanded the comparison programme into collision roles/masks, CCD, camera
  obstruction, minimap/world-frame fidelity, terrain/material identity,
  streaming, attachments, feedback/audio, and replay diagnostics. Added the
  minimap/world-coordinate contract rather than letting solver-local
  coordinates become map or save truth.
- Verification: 102 root tests + 7 kernel tests passed; typecheck passed;
  production build passed with separate 520.91 kB Box3D WASM and 31.97 kB
  adapter chunks; Box3D, Rapier Physics Lab, and canonical Field 02 browser
  workflows passed.
- The first full test attempt exposed severe CPU contention from a live
  Playwright Chrome GPU process. The daemon was stopped, simulation files were
  made file-serial without raising the five-second per-test timeout, and the
  complete suite then passed in 6.26 seconds.
- No commit, push, branch, deployment, system-wide Emscripten installation,
  deletion, or cleanup was performed. Parallel Farmfall/playtest/progression
  work was preserved.

### Anything else?

Box3D is now executable evidence, not an architectural anchor. The next
high-information proof is the shared semantic collision/attachment scene plus a
world-frame/minimap inset; Jolt should enter only when that harness has an
explicit controller or constraint question.

## 2026-07-26 — Integration, two-port acceptance, and master tracker

### Baseline and preservation

- Loaded the global/project instruction stack, full project `motto_v4.md`,
  generated context pack, Git Commit Helper skill, and Sites hosting skill.
- `agent-start --project` reached its documented shared-context fallback, then
  hung after the timeout; the process was stopped and the required fallback
  loop was completed from the live instruction files and generated pack.
- Confirmed the ambient `openworld_1` path is stale and the authoritative
  checkout is `/Users/pranay/Projects/Game_dev/rigs-unbound`.
- Confirmed one `main` worktree, no stash, and `HEAD == origin/main ==
aa82cee` before the integration commit.
- Classified the local set as source changes, research/decision continuity,
  curated visual/video evidence, reusable browser tools, and raw simulated
  playtest evidence. No files exceeded GitHub's single-file limit and the
  repository scan found no credential pattern in the candidate set.

### Verification

- `npm run typecheck` — passed.
- `npm test` — 102 root tests and seven deterministic-kernel tests passed.
- `npm run test:assets` — five asset tests passed.
- `npm run format:check` — passed.
- `npm run build` — passed; Field 02, Rapier Physics Lab, and Box3D Probe
  entries built separately. Vite retained the advisory for the 548.69 kB
  Three.js chunk.
- `RIGS_UNBOUND_URL=http://127.0.0.1:4173/?acceptance=field-02 npm run
test:browser` — passed with zero console/page problems.
- The same Field 02 acceptance on port `4174` — passed with zero console/page
  problems.
- Rapier Physics Lab browser acceptance on `4173` — passed across movement,
  steering, four surfaces, six cameras, reset, and narrow layout.
- Box3D Probe browser acceptance on `4173` — passed across physical-wheel
  movement, steering, six cameras, full-assembly reset, and narrow layout.
- Sites read-only provenance check — version 4 is sourced from `aa82cee` and
  the current public URL is active.

### Documentation continuity

- Added `docs/plans/MASTER_EXECUTION_TRACKER.md` as the canonical task ledger
  with explicit states, dependencies, evidence, and closure gates.
- Corrected `progress.md` deployment provenance and added the current
  integration evidence and next-risk summary.
- Added a dated supersession note to the build-in-public kit: trailer capture
  now exists, field-vs-lab engine wording is precise, current test claims are
  accurate, and deployment remains a pre-flight gate.
- Continued the 3D-games analysis continuity pass by anchoring the remaining
  prose-only addenda to named contract notes for behavior/event scheduling,
  authority, simulation layers, modding, event graphs, asset pipeline,
  affordances, visibility, collision, spatial culling, LOD, budgets, portals,
  and kernel ordering.
- Also bridged the earlier data/asset ingestion lane, machine-centric growth
  synthesis, and shader/material strategy to their named contract notes so the
  full analysis trail is now contract-backed instead of partially descriptive.
- Normalized the remaining physics-quality envelope section so it now uses the
  same explicit contract-bridge language as the rest of the canonical analysis
  doc.
- Extended the second-pass synthesis contract bridge so the lower-lane notes
  (camera, lighting, accessibility, physics quality, performance baseline,
  world affordances, save/migration, content validation, second locomotion,
  engine-branch gating, and verification harness) are now named explicitly.
- Added a dedicated 3D-game contract index so the expanding lane map has one
  durable navigation entry point alongside the research, audit, and roadmap
  docs.
- Exposed the new contract index from the exploration map so the backlog view
  and the contract lattice are now linked from the same navigation surface.
- Wired the contract index into the roadmap and synthesis docs so the wider
  3D-game research stack now has a single compact navigation entry point.
- Normalized the synthesis doc pointer to the contract index into a clean
  standalone paragraph for easier scanning.
- Added the contract index pointer to the platform audit so the top-level
  architecture doc now shares the same quick navigation surface.
- Added the contract index pointer to the second-pass synthesis doc so the
  follow-on audit and the contract lattice share one compact jump point.
- Expanded the contract index to include the remaining obvious lanes: core
  loop, minimap/world coordinates, asset authority, web loading/bootstrap,
  renderer accessibility, and physics readability/speed.
- Added the accessibility/input lane to the contract index after the filename
  comparison surfaced one remaining omission in the navigation table.
- Added a supporting continuity section to the contract index so the
  exploration map, worklog, master tracker, render plan, and public-readiness
  register are surfaced alongside the contract lattice.
- Added the contract index to the master execution tracker header so the
  execution view now has the same quick lane entry point as the research docs.
- Added a docs-root landing page and linked it from the contract index so the
  project now has one obvious start-here entry point for docs navigation.
- Added root-README links to the docs landing page and contract index so the
  repository itself now points directly at the docs navigation surfaces.
- Added a navigation block to the exploration map so the map itself now points
  at the docs root landing page, contract index, tracker, and worklog.
- Added a research-root landing page and linked it from both the docs root and
  repository README so the research stack now has a direct entry point.
- Added back-links from the research landing page to the docs root and root
  README so the navigation path is bidirectional instead of one-way.
- Replaced the docs landing page's directory placeholders with concrete
  research and ADR targets so the page stays clickable and portable.
- Added the asset pipeline, shipped-mesh authority, and web-ingest contracts
  to the research landing page so the 3D asset-production lane is now surfaced
  alongside the rest of the live evidence stack.
- Added the web performance, accessibility, and loading/bootstrap docs to the
  research landing page so browser runtime analysis now has a clear entry point
  beside the asset and architecture lanes.
- Added the core-loop, capability, replay, and verification contracts to the
  research landing page so the simulation spine is now visible from the same
  root navigation surface.
- Added the streaming, modding, authority, and world-scaling contracts to the
  research landing page so world-growth governance has the same root entry
  point as assets, web runtime, and simulation.
- Added the visibility, collision, camera, shader, lighting, and renderer
  accessibility contracts to the research landing page so the spatial
  readability lane is now visible alongside the rest of the research stack.
- Added the threshold, KPI, readability, and rendering-economy docs to the
  research landing page so the evidence-and-metrics lane is now a first-class
  navigation surface as well.
- Added the accessibility findings, render checklist, vehicle-physics catalog,
  game reference atlas, multi-skill audit, and tagged skill coverage map to
  the research landing page so the reference and provenance lane is surfaced
  beside the other research groups.
- Added the Kenney audit and tractor intake / reconstruction / preview docs to
  the research landing page so the asset-intake evidence lane is visible as a
  first-class research surface too.
- Added a master synthesis doc and linked it from the research landing page so
  the repo now has a compact what-exists / what-is-possible / what-next handoff
  above the lane-specific contracts.
- Documented and fixed the live boot/public-state crash in `src/game/state.ts`
  with a runtime note so checkpoint serialization no longer hard-fails on
  missing numeric fields during boot.
- Verified the live enter-world path lands focus on `canvas#game-canvas` and
  recorded that proof in the runtime safety note so the accessibility fix is
  now browser-confirmed too.
- Added a live runtime baseline snapshot with the current performance metrics
  and run-record verifier status so the repo now has a durable observability
  baseline to compare against on future passes.
- Clarified the semantics of `firstControllableMs` so the repo now distinguishes
  controllability timing from any future explicit input-readiness metric.
- Added a live `firstInputReadyMs` metric and documented its semantics so the
  runtime now tracks input readiness separately from controllability.
- Refreshed the live runtime baseline snapshot with the latest observed
  performance values so the evidence note stays aligned with the current live
  browser session.
- Added the accessibility, authoring, behavior, culling, backend, physics lab,
  portal, budget, and locomotion proof docs to the research landing page so
  the operational proof lane has a direct entry point too.

### Three-pass review

1. **Immediate correctness and completeness:** checked the complete local
   inventory, representative visuals, dependency/build changes, source
   contracts, test suites, both local ports, laboratories, and public Sites
   provenance. No candidate file was silently dropped.
2. **Architecture and long-term viability:** confirmed Field 02 remains the
   canonical game runtime; Rapier raycast wheels and Box3D physical wheels are
   separate bounded capabilities behind project-owned ports; the master
   tracker prioritizes the first game loop ahead of additional engine breadth.
3. **Rule compliance and supervision readiness:** rechecked v4 hook and
   co-author guards, evidence tiers, append-only decision continuity,
   deployment-source alignment, known P0 playtest gaps, and the final
   acceptance-report requirements.

### Evidence and boundaries

- Tier 2: typecheck, unit/integration suites, asset tests, formatting, build.
- Tier 4: visible browser acceptance on 4173/4174 and both dynamics labs,
  including desktop/narrow layouts and console capture.
- Tier 5 is not claimed. Real-phone thermals/touch/audio, cold-cache production
  loading, WebGL context recovery, and real human fun/taste remain open.
- The raw playtest corpus is retained because it documents discovery and failed
  paths; a future evidence-retention policy must bound growth without deleting
  historical material.

### Anything else?

Yes. The current systems playground is stronger than its first-session game
loop. The dependency order is now explicit: publish this evidence, repair the
first rung, complete Farmfall, repeat external playtests, then let those results
choose the next physics, world, social, or asset expansion.

## 2026-07-26 — Integration batch commit, push, and Sites version 5

### Exact release chain

- Staged the complete 414-file preservation batch after classifying source,
  package/config, curated media, review screenshots, reusable tools, raw
  simulated-playtest evidence, and concurrent documentation.
- Completed the coverage-complete motto-v4 commit review: all 51 sections
  passed with diff-aware evidence; the normal managed hooks ran without
  bypass; no AI co-author trailer was added.
- Created guarded commit
  `1e7992125824a850eb27a9f9d2bbdbc95b229e2b` and pushed `main` to GitHub.
  Local `main` and `origin/main` were then verified at the same SHA with a
  clean worktree.
- Pushed that exact source state to the existing Sites source repository
  without printing or persisting the short-lived credential.
- Packaged the clean commit with the Sites-provided packager, saved Sites
  version 5, deployed the saved version, and polled deployment
  `appgdep_6a651eeb031081919103b85b9e4eba0c` to terminal `succeeded`.
- Node-based production smoke checks returned HTTP 200 with expected content
  for `/`, `/physics-lab.html`, and `/box3d-lab.html`.

### Acceptance and evidence

- Tier 2: typecheck, 102 root tests, seven kernel tests, five asset-security
  tests, formatting, local Markdown links, and staged-diff integrity passed.
- Tier 3: the production Worker/client build, exact-source push, Sites
  packaging, and saved-version provenance passed.
- Tier 4: Field 02 browser acceptance passed on 4173 and 4174; the Rapier and
  Box3D labs passed local browser acceptance; Sites reported a successful
  public production deployment and all three public routes returned HTTP 200.
- Not claimed: a fresh full production-browser interaction pass, real-device
  performance, cold-cache first frame, WebGL recovery, audio listening, or
  human taste/fun evidence.

### Three-pass closure

1. **Immediate correctness:** rechecked current git state after parallel
   changes, repaired three whitespace defects and three broken local links, and
   reran the full staged validation set.
2. **Architecture and long-term viability:** kept Field 02 as the canonical
   player surface, Rapier and Box3D as replaceable capability laboratories, one
   Sites project, one source branch, and one repeatable deployment runbook.
3. **Rule compliance and supervision readiness:** preserved every parallel
   artifact requested by `git add -A`, recorded exact source/deployment
   provenance, updated the canonical task ledger, and retained explicit P0,
   evidence-growth, performance, device, and human-playtest gaps.

### Anything else?

Yes. Publishing closes RU-0004; it does not make the systems playground a
complete game. The next implementation gate is RU-0106 through RU-0110, with
the first priority being the title-card re-entry and zero-condition recovery
soft-lock because they can prevent a player from reaching or recovering the
core loop.

## 2026-07-26 — First-rung P0 repair (RU-0106 through RU-0109)

### Baseline and decisions

- Reproduced background simulation under the welcome plate. Keyboard focus
  re-entry did not reproduce in the current baseline, so the acceptance harness
  now protects both non-reentry and non-simulation contracts.
- Confirmed there was no guaranteed authored first salvage, condition-zero
  rigs could drift/soft-lock, and visible phase time mixed unrelated clocks.
- Accepted ADR-0019: absolute world time, schema-v5 migration, exceptional
  recovery, explicit world-entry gating, and canonical first-salvage action.

### Implementation

- Added authored `first-recovery-cache`, reachable from Home Silo and collected
  through `performPrimaryAction`.
- Added `worldTimeMinutes`, derived phase boundaries, v4→v5 migration, and
  persisted recovery audit fields.
- Disabled fixed-step movement at zero condition and added a non-rewarding Home
  Silo recovery to 25% condition with repeat protection.
- Gated held input, fixed-step simulation, periodic saves, and input-readiness
  telemetry behind entry; added immediate welcome `[hidden]` behavior.
- Added a contextual desktop mouse recovery action while retaining keyboard and
  responsive touch actions through the same semantic transition.

### Verification and three passes

1. Immediate correctness: TypeScript passed; 62 targeted state/storage tests
   passed; full suite passed with 108 root tests and seven kernel-probe tests.
2. Architecture: activity time remains separate from the world clock; normal
   winch behavior remains capability-gated; v1–v5 save recovery remains one
   canonical chain; Farmfall is resequenced to schema v6.
3. Supervision readiness: formatting and production build passed; Field 02
   browser acceptance passed on `4173` and rebuilt `4174`, covering welcome
   gating, first salvage, day→gloam→night→dawn, reload, keyboard/mouse/touch
   recovery, repeat protection, narrow layout, and zero console/page errors.

Remaining before release: final diff/link/security checks, full motto
attestation, guarded commit/push, exact-source Sites deployment, and production
smoke. RU-0110 (B5–B12) is the next gameplay work package.

## 2026-07-25 — behavior planner and event graph boundary check

- Re-read the behavior/planner and event-graph contracts, then verified the
  live run record through `window.getRunRecordVerification()`.
- Confirmed the app already captures command/checkpoint/input/save history with
  a clean run-record verification result.
- Confirmed the missing layer is still the planner/event envelope itself:
  - no first-class candidate generator,
  - no deterministic branch-selection telemetry,
  - no explicit origin-domain event envelope.
- This keeps the architecture honest: observability exists, but behavior
  planning and event ownership remain explicit next contracts rather than
  accidental hidden behavior.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — capability and affordance admission check

- Re-read the capability and affordance contracts, then exercised a live denied
  action in the browser runtime.
- Verified the runtime already has a real boolean capability gate via
  `hasCapability(...)` and capability-bearing rig profiles.
- Verified a denied capability path produces a deterministic prose diagnostic
  rather than a structured reason envelope:
  - selecting `toy-buggy`
  - invoking blade logic
  - diagnostic: `Spark carries no blade. Torque does.`
- This keeps the current boundary honest: capability resolution is real, but
  the reusable admission envelope and shared resolver still need to be named
  before future planners can depend on them.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — save and migration observability check

- Re-read the save/migration contract and verified the live browser persistence
  surface.
- Confirmed the runtime is using a single versioned save key in localStorage:
  - `rigs-unbound.save.v5`
- Confirmed the HUD exposes a current save status line, but it is still a
  combined health/readout surface rather than a structured persistence reason
  envelope:
  - `Local field record · 50 fps · 78 calls · 15.6 MB`
- Confirmed the run record verification remains clean (`ok: true`), and save
  events are already present in the durable history.
- The missing layer is the explicit load/save/migration reason metadata the
  contract calls for.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-26 — Sites version 6 release

- Pushed guarded commit
  `f5a007d1e9866fea510fcef1cfba102a7ee85e13` to GitHub `main` and the existing
  Sites source branch.
- Packaged from an isolated copy of that exact commit, saved Sites version 6,
  and polled deployment `appgdep_6a652cbbcf108191a07becdbe1beaaf7` to terminal
  `succeeded`.
- Public checks: Field 02 returned HTTP 200; the historical lab `.html` URLs
  redirected to canonical routes; both canonical lab routes returned HTTP 200.
- Fresh public-browser evidence: welcome gating kept elapsed time at zero,
  entry exposed schema v5 and `first-recovery-cache`, input readiness was
  measured, and the captured console had zero entries.
- Preserved concurrent accessibility, asset-provenance, behavior/event, and
  capability/affordance documentation for the follow-up docs commit.

### Anything else?

Yes. Version 6 is the current public first-rung baseline, not completion of the
game. RU-0110 is next; representative-device, cold-cache, WebGL recovery,
audio, and human-fun evidence remain open.

## 2026-07-25 — replay artifact and ghost boundary check

- Re-read the replay contract and verified the live run-record surface.
- Confirmed the browser exposes `getRunRecord()` and
  `getRunRecordVerification()`, and the current verification result is clean.
- Confirmed the bounded record already captures commands, inputs, checkpoints,
  and saves.
- Confirmed the missing layer is still the playback artifact itself:
  - no exposed replay path in the current browser surface,
  - no ghost/share compatibility envelope,
  - no playback divergence report yet.
- This keeps the boundary honest: the recorder is real, but replay remains the
  next contract rather than a shipped product surface.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — verification harness and confidence gates check

- Re-read the verification harness contract and checked the live browser proof
  surface it is meant to organize.
- Confirmed the runtime already exposes the needed evidence hooks:
  - `window.getPerformanceSnapshot()`
  - `window.getRunRecordVerification()`
- Confirmed the current runtime metrics are already being surfaced in the live
  browser state, alongside a clean run-record verification result.
- The missing layer is still the canonical capture bundle and tiered evidence
  summary the contract names, but the first bundle candidate is now named in
  the verification-harness contract.
- This keeps the harness in the right role: it organizes real evidence, but it
  is not yet the finished cross-contract capture package.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — ECS threshold and composition readiness check

- Re-read the ECS threshold contract and checked the current runtime scale.
- Live browser evidence shows a small explicit composition surface:
  - 3 rigs
  - 7 authored sites
  - 1 discovery
  - 0 furrows in the current snapshot
- The implementation matches that scale with explicit profiles, sites, and
  bounded world-memory sets rather than a broad entity zoo.
- ECS therefore remains a future threshold decision, not a current
  architecture requirement.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — culling and LOD spike-test boundary check

- Re-read the culling/LOD spike-test contract and checked the current renderer
  posture against live metrics.
- Confirmed the renderer is intentionally using a first-pass visibility budget:
  - repeated props are instanced,
  - prop rebuilds stay inside a fixed local radius,
  - some meshes explicitly disable automatic frustum culling for stable
    presentation.
- Confirmed the live browser profile remains compact:
  - about 78 draw calls,
  - about 105k triangles,
  - first-controllable and first-input-ready metrics are still tracked.
- The missing layer is still the formal spike-test harness that would prove
  culling and distance-LOD behavior against deterministic fixture scenes.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — physics quality envelope check

- Re-read the physics quality contract, then checked the live physics posture
  and HUD readouts.
- Confirmed the current runtime is still compact and measurable:
  - about 78 draw calls,
  - about 105k triangles,
  - first-controllable and first-input-ready metrics are tracked separately.
- Confirmed the HUD already surfaces the player's physics state directly:
  - `Grip`
  - `82%`
  - `100%`
  - a prompt summarizing the current action context
- Confirmed the code path already exposes the core physics factors
  (`grounded`, `hover`, `slip`, `waterDepth`, `stalled`, condition, strain),
  but not a formal stability-state policy with explicit fallback semantics.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — world and architecture scalability boundary check

- Re-read the world and architecture scalability contract and sampled the live
  browser profile again.
- Confirmed the current runtime is still intentionally compact:
  - 3 rigs
  - 7 authored sites
  - 1 discovery
  - 0 furrows in the sampled state
- Confirmed the code still uses a bounded world disc and bounded runtime memory
  rather than a streaming region/chunk system:
  - `WORLD_RADIUS = 250`
  - `WORLD_LIMIT = 246`
  - `MAX_FELLED = 1500`
  - `MAX_COLLECTED_NODES = 2500`
- The missing layer remains policy, not proof:
  - chunk/region lifecycle,
  - load/unload rules,
  - growth-pressure observability,
  - pack activation rollback,
  - future shared-state readiness.
- This keeps the scalability lane honest: local growth is real, but broader
  scale is still a future-gated boundary rather than a live implementation.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — streaming residency boundary check

- Re-read the streaming world manifest/residency contract against the current
  repo state.
- Confirmed the repo is still built around one canonical world object and one
  save payload:
  - one `GameWorld` with terrain, obstacles, and exploration memory
  - one `GameState` saved/restored together with world memory
  - one authored disc world and one authored site set
- Confirmed the live browser surface still behaves like a single residency, not
  a region-manifest manager.
- The missing layer remains the same policy family named by the contract:
  - chunk/region manifest,
  - residency states,
  - validation before activation,
  - active-budget counters,
  - unload/rollback rules,
  - churn observability.
- This preserves the intended progression: scale the current world cleanly
  before adding a second truth source.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — simulation layers and resource governance check

- Re-read the simulation layers and resource governance contract and sampled
  the live browser surface again.
- Confirmed the current browser status is still healthy:
  - `Rigs Unbound — Field 02`
  - zero console logs in the status snapshot
- Confirmed the runtime already behaves like a layered sim:
  - deterministic kernel
  - terrain / physics / collision separation
  - bounded world memory
  - performance metrics
  - renderer feedback separated from state ownership
- The missing layer is still the explicit governance contract:
  - domain-order table,
  - budget ledger,
  - fallback priority,
  - downgrade reason reporting.
- This keeps the meaning honest: the architecture is layered today, but the
  governance rules are still implicit and should stay named until they are
  formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — resource budget and fallback envelope check

- Re-read the resource budget and fallback envelope contract and the runtime
  performance wiring.
- Confirmed the live app is still exposing measurable pressure fields:
  - frame timing
  - draw calls
  - triangle count
  - heap use
  - load duration
  - first-controllable time
  - save size
- Confirmed the browser surface is healthy and still named `Rigs Unbound —
Field 02` in the current daemon snapshot.
- The missing layer is still the policy envelope:
  - cross-system budget ledger,
  - explicit fallback profile,
  - pre-overload fallback test,
  - operator-visible oversubscription summary,
  - subsystem attribution for the fallback.
- This keeps the contract honest: the game can measure cost today, but the
  fallback behavior is not yet a first-class policy.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — camera feel contract check

- Re-read the camera feel contract and traced the current camera runtime path.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime camera system already includes the contract’s key
  ingredients:
  - named modes and switching,
  - profile-driven offsets,
  - terrain obstruction pull-in,
  - speed-based FOV expansion,
  - reduced-motion clamping,
  - telemetry hooks for camera-feel evidence.
- The missing layer is still the explicit policy artifact:
  - transition reason table,
  - operator-visible policy summary,
  - separate formal camera-policy schema.
- This keeps the distinction honest: camera feel is implemented, but the policy
  contract is still implicit and should stay named until formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — visibility stage and LOD contract check

- Re-read the visibility stage and LOD contract and the renderer code that
  implements the current visibility budget.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the renderer already behaves like a first-pass visibility budget:
  - single terrain mesh
  - instanced props and furrows
  - local prop rebuilds around the rig
  - `frustumCulled = false` on presentation pieces that currently need it
  - performance metrics for draw calls and triangles
- The missing layer is still the formal policy surface:
  - explicit visibility tiers,
  - missed-cull / residency churn counters,
  - downgrade/readability regression test for non-geometry LOD.
- This keeps the distinction honest: visibility behavior is real, but the
  policy contract is still implicit and should stay named until formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — renderer performance and accessibility smoke-test check

- Re-read the public smoke-test renderer/performance/accessibility contract and
  the runtime wiring that supports it.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already exposes the key evidence surfaces the contract
  expects:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - an accessible DOM shell with the playable canvas as the focus target after
    the intro is dismissed
- The missing layer is still the fully bundled public-gate artifact:
  - one capture bundle,
  - one named fallback summary,
  - one rendered comparison artifact binding matrix/checklist/KPI evidence.
- This keeps the smoke-test gate honest: observable today, but still not yet
  packaged as the final public acceptance bundle.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — replay artifact and ghost contract check

- Re-read the replay artifact and ghost contract and traced the bounded run
  record path.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the code already proves the bounded record is real:
  - versioned seed-backed record creation,
  - command/input/checkpoint/save entry capture,
  - schema and seed verification,
  - exposed browser hooks for record and verification.
- The missing layer is still the first-class playback artifact:
  - no exposed playback path,
  - no ghost share/compatibility envelope,
  - no replay divergence report,
  - no trust-classification split between diagnostics-only and replay-safe data.
- This keeps the contract honest: audit logging exists, but replay/ghost product
  behavior is still future work.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — authority model groundwork check

- Re-read the authority model groundwork contract and the local-first runtime
  state/persistence path.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the code already proves the local-first authority posture:
  - explicit command capture in `src/main.ts`
  - deterministic kernel mutation in `src/game/state.ts`
  - versioned local save/recovery in `src/game/storage.ts`
  - clean fallback when a local record is incompatible
- The missing layer is still the first-class authority contract:
  - authenticated request/response shapes,
  - reject-path state separation,
  - durable-value recovery metadata,
  - authoritative outcome telemetry,
  - shared-state/server-authoritative boundary artifact.
- This keeps the boundary honest: local authority is real today, while shared
  authority remains future-gated instead of assumed.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — accessibility and input contract check

- Re-read the accessibility and input contract alongside the runtime input and
  accessibility evidence.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime now supports the contract’s base claims:
  - device-neutral named actions in `src/game/input.ts`
  - keyboard and gamepad feeding the same action model
  - touch/button controls routing into the same tap/hold semantics
  - reduced-motion behavior present in renderer/feedback paths
  - skip-link/focus gap closed in the live accessibility recheck
- The missing layer is still the policy surface:
  - persisted remaps,
  - visible input/accessibility profile state,
  - comfort policy for motion and contrast,
  - parity statement for intentionally unsupported differences.
- This keeps the distinction honest: the shell is operable today, but the
  explicit accessibility/input policy is still not fully formalized.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — web loading and profile bootstrap check

- Re-read the web loading and profile bootstrap contract and the browser
  startup wiring.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current implementation already avoids the dead-black-box risk:
  - `welcome-panel` is a real startup shell
  - `saveStatus` is populated immediately from the load result
  - entering the world dismisses the shell and focuses the canvas
- The missing layer is still the explicit bootstrap policy:
  - no real profile-selection UI,
  - no visible loading progress meter,
  - no distinct fallback-preview state,
  - no measured profile-selection outcome visible to the user.
- This keeps the boundary honest: loading is visible today, but the bootstrap
  policy remains mostly implicit rather than fully packaged.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — runtime instrumentation KPI check

- Re-read the runtime instrumentation KPI note and the performance snapshot
  implementation.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already exposes the KPI vocabulary the note names:
  - `PerformanceMonitor.snapshot()`
  - `window.getPerformanceSnapshot()`
  - HUD-visible fps/draw-call/heap/save-status values
- The missing layer is still the operational bundle:
  - repeatable profile comparison artifact,
  - readable operator summary per profile/fixture pair,
  - fallback/degrade summary tied to the fixture,
  - screenshot or frame capture bound to the metrics.
- This keeps the KPI note honest: the numbers are visible today, but the
  packaged comparison evidence is still implicit rather than finished.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — threshold fixture baseline and capture-selection check

- Re-read the threshold fixture baseline and capture-selection protocol.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime still fits the canonical comparison shape:
  - one compact world,
  - one active loop,
  - visible renderer metrics,
  - reduced-motion / mobile-safe behavior already present.
- Confirmed the baseline fixture categories remain the right explanatory set:
  - near-field dense scene,
  - occluded / hidden scene,
  - distance-gradient scene,
  - pressure scene,
  - reduced-motion comparison scene.
- The missing layer is still the packaged capture bundle:
  - fixture,
  - metrics capture,
  - screenshot/frame capture,
  - operator note,
  - threshold state.
- This keeps the comparison scaffolding honest: the selection rules are real,
  but the long-term capture set they point to is still not finished.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — physics readability and speed contract check

- Re-read the physics readability and speed contract and the shared perception
  frame implementation.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already implements the contract’s core behavior:
  - authoritative motion in `src/game/physics.ts`
  - shared perception frame in `src/game/feedback.ts`
  - camera/body/speed presentation in `src/game/renderer.ts`
  - readable HUD values in `src/main.ts`
- Confirmed the runtime already exposes the intended readable signals:
  - grip/slip/stall semantics
  - body roll and pitch offsets
  - camera anticipation
  - speed-driven FOV expansion
  - reduced-motion suppression of presentation exaggeration
- The missing layer is still the policy/evidence bundle:
  - named readable-speed regression capture,
  - summary of whether the change comes from speed, terrain, or traction,
  - canonical proof cues for higher-speed readability.
- This keeps the contract honest: the game is already readable at speed, but
  the explicit policy/evidence layer remains implicit rather than fully named.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — rendering potential and economy check

- Re-read the rendering potential and economy note and the renderer/performance
  surfaces.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already exposes the budget economy the note describes:
  - Three.js canonical rendering path
  - instanced repeated world items
  - radius-bounded prop drawing
  - `PerformanceMonitor` and `window.getPerformanceSnapshot()`
  - HUD-level frame health through save status and fps
- Confirmed the renderer already follows the recommended spend order:
  - protect camera response and nearby readability first
  - maintain terrain/obstacle fidelity around the active rig
  - bound distant props and decorative density
- The missing layer is still the packaged comparison artifact:
  - repeatable capture bundle,
  - operator note for what changed under pressure,
  - screenshot/frame capture tied to metrics,
  - baseline promotion path for explanatory captures.
- This keeps the frame-budget companion honest: the spending model is visible
  today, but the reusable comparison set is still not finished.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — asset authority and shipped mesh contract check

- Re-read the asset authority and mesh contract and the provenance/runtime
  evidence it depends on.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime is still asset-light and procedural:
  - zero texture assets and zero asset provenance obligations for the current
    terrain pass in `src/game/renderer.ts`
  - authored/procedural terrain and instanced props in the live field
  - provenance register still classifies the tractor references as concept/
    reference only, not approved shipped runtime assets
  - runtime asset manifest remains the next durable step once imported art enters
    the playable path
- The missing layer is still the promotion bridge:
  - no approved runtime GLB for the tractor/rig path,
  - no manifest entry proving a shipped mesh profile,
  - no browser-loaded imported mesh that has passed the promotion contract.
- This keeps the authority boundary honest: the repo has concepts, provenance,
  and procedural runtime geometry, but not yet a shipped-mesh authority layer.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  doc, and provenance inspection.

## 2026-07-25 — web asset ingest and compression contract check

- Re-read the web asset ingest and compression contract alongside the asset
  pipeline and provenance contract.
- Confirmed the live browser surface is still `Rigs Unbound — Physics Lab 01`,
  with zero console logs in the current daemon snapshot.
- Confirmed the runtime is still asset-light and procedural:
  - terrain readability comes from authored geometry and vertex colours in
    `src/game/renderer.ts`
  - no imported runtime GLB/FBX/texture manifest is active in the playable path
    yet
  - provenance work remains in concept/reference and source-library notes
- The missing layer is still the manifest bridge:
  - no versioned runtime asset manifest is being consumed by the browser yet
  - no imported asset has crossed the activation gate in the playable path
  - compression remains a future runtime concern, not a live browser policy
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — loading and profile bootstrap contract recheck

- Re-read the loading/bootstrap contract and the profile matrix after the fresh
  browser snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Physics Lab 01`, with zero console logs in the current daemon
  snapshot.
- Confirmed the bootstrap shell is doing the right basic job:
  - the app is not a dead black box,
  - the shell stays visible until entry,
  - the canvas becomes the interactive landing point after activation.
- The remaining gap is still policy-level rather than survival-level:
  - no explicit loading progress meter,
  - no separate fallback-preview state,
  - no runtime-visible profile chooser or measured profile-selection outcome.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — threshold fixture and capture-selection recheck

- Re-read the threshold fixture baseline and capture-selection protocol after
  the fresh browser snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still fits the existing canonical comparison shape:
  - bounded world,
  - active simulation loop,
  - visibility and accessibility hooks,
  - reduced-motion behavior already present.
- The missing layer is still the packaged comparison bundle:
  - one representative capture per fixture,
  - metrics capture bound to the frame,
  - operator note and threshold state in one reusable artifact.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — smoke-test gate recheck

- Re-read the renderer/performance/accessibility smoke-test contract against
  the current browser daemon snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still exposes the gate’s required evidence surface:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - accessible canvas landing after intro dismissal
- The missing layer is still the bundled public-gate artifact:
  - no packaged capture bundle,
  - no single artifact binding checklist, profile matrix, and KPI evidence,
  - no reusable pass/fail summary for fallback events.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — culling and LOD spike-test recheck

- Re-read the culling and LOD spike-test contract against the current browser
  daemon snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still behaves like a deliberate visibility-budget scene:
  - instanced repeated props,
  - radius-bounded prop rebuilds,
  - terrain and the active play space remain the main visible workload.
- The missing layer is still the formal spike harness:
  - one deterministic fixture bundle,
  - one occluded/hidden scene,
  - one distance-gradient scene,
  - one pressure scene,
  - repeatable capture + metrics artifact for comparison over time.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — risk and public-readiness register recheck

- Re-read the risk and public-readiness register against the current browser
  daemon snapshot and live repo contracts.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime still fits the conservative solo-lab posture:
  - bounded playable loop,
  - deterministic local simulation,
  - readable HUD/state surfaces,
  - no evidence of public chat, trade, UGC, or cash-linked systems in the live
    path.
- The higher-risk public branches remain future-gated:
  - multiplayer authority,
  - economy/trading,
  - public UGC and moderation,
  - social identity and child-safety obligations,
  - account recovery and public operator support surfaces.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — authority-groundwork contract recheck

- Re-read the authority-groundwork contract against the current browser daemon
  snapshot.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still supports the local-first authority posture:
  - explicit command capture,
  - deterministic canonical state mutation,
  - local save/restore with recovery metadata,
  - clean failure for invalid local records.
- The missing layer is still the shared-state authority contract:
  - authenticated request/response shapes,
  - explicit reject-path separation,
  - durable-value recovery metadata as policy,
  - authoritative outcome telemetry,
  - visible shared-state/server-authoritative boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — command/state separation decision recheck

- Re-read ADR-0011 against the current browser daemon snapshot and live repo
  state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current implementation still follows the intended local spine:
  - command capture is explicit,
  - deterministic kernel mutation owns durable state,
  - presentation reacts from snapshot/render state,
  - capability admission and affordance rejection are real.
- The missing layer is still the structured contract envelope:
  - request/response objects,
  - versioned reason codes,
  - distinct telemetry for accept/reject/defer,
  - explicit speculative-vs-durable state boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — behavior/planner contract recheck

- Re-read the behavior/planner contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the current runtime still supports the local command/state spine:
  - explicit command capture,
  - deterministic kernel stepping,
  - snapshot-driven presentation,
  - bounded run-record history with command/checkpoint/input/save entries.
- The missing layer is still the named planner envelope:
  - versioned behavior schema,
  - deterministic candidate ordering,
  - branch-selection / branch-rejection telemetry,
  - fixed thinking budget,
  - read-only contract that prevents direct state mutation.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — world-affordance resolution contract recheck

- Re-read the world-affordance resolution contract against the current browser
  daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already proves world/capability mismatches are real:
  - selecting `toy-buggy` and invoking blade logic still yields the deterministic
    denial `Spark carries no blade. Torque does.`
- The missing layer is still the reusable resolver envelope:
  - explicit legal / deferred / impossible outcome codes,
  - structured rejection record naming the mismatch side,
  - shared resolver entry point for behavior and activities.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-26 — planner trigger narrowed by live affordance resolution

- Re-checked the behavior/planner lane against the current command/state spine
  and the live affordance resolver.
- `src/game/affordances.ts` now provides a real versioned resolver with
  `legal`, `deferred`, and `impossible` outcomes plus stable reason codes and
  mismatch ownership.
- `src/game/state.ts` already uses that resolver for the relay-cargo/tow path,
  so the repo has one honest structured decision boundary.
- That means the planner trigger is now narrower, not broader:
  - there is still no versioned behavior schema,
  - no candidate enumeration interface,
  - no deterministic tie-break surface for equal-score candidates,
  - no separate branch-trace stream.
- The next planner proof should therefore be a multi-candidate selector, not a
  general planner framework.

## 2026-07-25 — authoring and reproducible content validation recheck

- Re-read the authoring and reproducible content validation contract against the
  current browser daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already validates content before acceptance:
  - state/load paths reject bad or incompatible records,
  - the content model remains data-driven,
  - modules/world definitions already have explicit identities.
- The missing layer is still the reproducible authoring envelope:
  - versioned content-manifest schemas,
  - validator-first rejection tests,
  - reproducible validation result artifacts,
  - runtime-ready vs validation-only status,
  - provenance/source metadata that survives authoring.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — asset provenance and pipeline recheck

- Re-read the asset provenance register and asset pipeline contract against the
  current browser daemon snapshot and repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the project still has the right provenance posture:
  - concept/reference images are registered with hashes and intended-use notes,
  - the private Kenney library is documented as a source library,
  - runtime remains asset-light and procedurally authored.
- The missing layer is still the runtime bridge:
  - no imported runtime asset has become the durable truth source yet,
  - no approved runtime manifest has replaced reference-only status,
  - no public reuse decision has been elevated into a shipped asset path.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  provenance, and doc inspection.

## 2026-07-25 — modding and creator-pack validation recheck

- Re-read the modding and creator-pack validation contract against the current
  browser daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still supports the right underlying posture for packs:
  - data-driven world and rig content,
  - load-time validation and migration,
  - provenance and asset validation contracts already named elsewhere.
- The missing layer is still the pack lifecycle:
  - versioned pack manifest,
  - explicit dependencies,
  - safe disable/rollback behavior,
  - staged publication/moderation flow,
  - a hard boundary keeping packs out of runtime authority.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — creator-pack publication boundary recheck

- Re-read the modding contract and the public evidence surfaces ADR against the
  current browser daemon snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still supports local validated content growth:
  - creator packs remain data-first,
  - load-time validation and migration are still the boundary,
  - safe disable / rollback remains the future behavior.
- The missing layer is still the public publication side:
  - no published pack route,
  - no moderated public pack workflow,
  - no public creator-discovery surface,
  - no pack lifecycle that would treat packs as shared public evidence.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — public evidence/share-route recheck

- Re-read ADR-0004 against the current browser daemon snapshot and live repo
  state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- A source search of `src/` did not reveal any live share/public object route
  family, so the proposed URL shapes remain decision-level only.
- The runtime is still treating public evidence as future-facing:
  - no publication workflow,
  - no moderation queue,
  - no canonical share route family in the playable path.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  repo search inspection.

## 2026-07-25 — replay artifact and ghost contract recheck

- Re-read the replay contract against the current browser daemon snapshot and
  live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still exposes the bounded record surface:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
  - command, input, checkpoint, and save entries in the versioned record
- The missing layer is still the replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report from replay execution,
  - no trust-classification split between diagnostics-only and replay-safe
    data.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — event graph and deterministic handlers recheck

- Re-read the event-graph contract against the current browser daemon snapshot
  and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already emits meaningful outcomes:
  - commands with names and payloads,
  - checkpoints with stable state hashes,
  - saves with schema/version metadata,
  - user-facing toasts/status surfaces,
  - input transitions in the bounded run record.
- The missing layer is still the named event graph:
  - no explicit versioned event envelope,
  - no origin-domain ownership field in a shared event contract,
  - no replayable vs diagnostics-only split,
  - no deduplication/ordering policy as a first-class boundary.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — kernel ordering and mutable subsystem gates recheck

- Re-read the kernel-ordering contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime still proves the core kernel boundary:
  - `src/game/state.ts` owns the fixed-step orchestration and canonical mutation
    order,
  - `src/game/renderer.ts` remains presentation-only,
  - `src/main.ts` captures commands and routes user intent into the kernel,
  - replay-sensitive state remains visible through the bounded run-record lane.
- The missing layer is still the named gate table:
  - no explicit subsystem read/write authority matrix,
  - no replay-safe event emission point per mutable subsystem,
  - no kernel-stage telemetry field,
  - no documented renderer-only versus kernel-only enforcement surface.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — collision category and mask contract recheck

- Re-read the collision-category contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live browser surface is still healthy and named
  `Rigs Unbound — Field 02`, with zero console logs in the current daemon
  snapshot.
- Confirmed the runtime already has a real deterministic collision path:
  - `src/game/collision.ts` resolves obstacle contact with role-aware tree vs
    rock behavior,
  - `src/game/state.ts` consumes that outcome after motion and applies the
    consequences,
  - the current obstacle model already distinguishes blocking, fellable, and
    sliding responses.
- The missing layer is still the explicit interaction matrix:
  - no first-class category/mask table for ground, obstacle, hazard, trigger,
    projectile, sensor, and decorative roles,
  - no dedicated trigger/sensor contact semantics,
  - no telemetry for unexpected or incompatible pairs,
  - no documented fallback for unknown roles.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## 2026-07-25 — resource budget and fallback envelope recheck

- Re-read the resource-budget contract against the current browser daemon
  snapshot and live repo state.
- Confirmed the live app is still `Rigs Unbound — Field 02`, and the browser
  daemon is healthy with zero console logs in the 

## Master Vehicle Catalog & Image Generation Infrastructure — 2026-07-27

- Created the canonical [Master Vehicle & Rig Catalog](docs/exploration/MASTER_VEHICLE_CATALOG.md) documenting 36 unique vehicle concepts across 6 core categories with 108 upgrade/version tiers (`v1` Found, `v2` Restored, `v3` Overcharged).
- Defined silhouette specifications, locomotion classes, hardpoints, material tokens, and upgrade arcs for every rig family (Farm Utility, Service/Recovery, Toy/Micro, Rescue/Defense, Extreme/Aspirational, Fantasy/Cosmic).
- Generated a concept art reference sheet (`master_rig_catalog_lineup`) adhering to single-subject/lineup isolation rules on neutral backdrops for downstream `img2threejs` 3D reconstruction.
- Verified system status and documented provenance linkage for future engine reconstruction.

## Current status snapshot.
- Confirmed the runtime already exposes the measurement fields through
  `PerformanceMonitor.snapshot()` and `window.getPerformanceSnapshot()`:
  - frame timing,
  - draw calls,
  - triangle count,
  - heap use,
  - load duration,
  - first-controllable time,
  - save size.
- The missing layer is still the explicit fallback policy:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback before overload,
  - no operator-visible summary naming the oversubscribed resource.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## 2026-07-25 — save and migration observability continuation

- Continued the 3D-game analysis lane using the `3d-games` skill and re-read
  the live persistence path before documenting anything new.
- Confirmed the save spine is already durable:
  - `src/game/storage.ts` uses versioned save keys and recovery branches.
  - `src/main.ts` records save activity into the run record and exposes
    `window.getRunRecordVerification()`.
  - `src/game/run-record.ts` keeps checkpoint hashes and monotonic timing
    checks.
- Appended a new addendum to
  `docs/research/SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md`
  clarifying that the persistence lane is observable but still missing a named
  reason-code / source-version envelope.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — capability contract formalization continuation

- Extended the same 3D-game analysis pass into the capability-contract lane
  from the execution roadmap.
- Confirmed the runtime already composes capability claims from rig profiles and
  fitted modules:
  - `src/game/contracts.ts` holds the capability vocabulary and profile
    composition.
  - `src/game/state.ts` gates actions through `hasCapability(...)` and
    `effectiveProfile(...)`.
- Appended a new addendum to
  `docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md`
  clarifying that composition is live while adapter governance remains implicit.
- Evidence depth: Tier 1 static inspection.
- Runtime state during this note: browser daemon still healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — second locomotion continuity continuation

- Continued the same analysis run into the second-locomotion-family contract.
- Confirmed the runtime already has a real hover family:
  - `src/game/contracts.ts` defines `marsh-skimmer` with `mobilityAdapter:
"hover"`.
  - `src/game/state.ts` and `src/main.ts` route that family through the same
    world, camera, save, and recovery spine.
- Appended a new addendum to
  `docs/research/SECOND_LOCOMOTION_FAMILY_AND_CROSS_MODE_CONTINUITY_CONTRACT_2026-07-25.md`
  clarifying that the family is live while the explicit continuity proof remains
  partial.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — authority model groundwork continuation

- Continued the analysis run into the authority-model lane from the roadmap.
- Rechecked the current runtime posture against the contract:
  - `src/main.ts` still captures commands explicitly,
  - `src/game/state.ts` still owns deterministic canonical mutation,
  - `src/game/storage.ts` still recovers or replaces invalid local records
    without treating them as truth.
- Appended a new addendum to
  `docs/research/AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md`
  clarifying that local-first authority is the current mode, while the
  shared-state/server-authoritative envelope remains future-gated.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — event graph / deterministic handlers continuation

- Continued the analysis run into the event-graph lane from the roadmap.
- Confirmed the runtime already records a meaningful history surface:
  - `src/main.ts` records commands and checkpoints into the bounded run record,
  - `src/game/run-record.ts` verifies monotonic timing and checkpoint hashes,
  - the browser surface exposes both `window.getRunRecord()` and
    `window.getRunRecordVerification()`.
- Appended a new addendum to
  `docs/research/EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md`
  clarifying that command/checkpoint/save history is real while the event
  envelope remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — minimap and world-coordinate continuation

- Continued the same analysis run into the minimap/world-coordinate lane.
- Confirmed the current field map already acts as a real coordinate audit:
  - `src/game/minimap.ts` samples canonical terrain once and reuses it for
    surveyed reveal,
  - the map uses `GameWorld.surveyedCells` plus world `x/z` coordinates for
    sites, salvage, cargo, and the active rig,
  - `src/main.ts` keeps the surveyed percentage visible in the HUD.
- Appended a new addendum to
  `docs/research/MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md`
  clarifying that the map is already meaningful while the explicit
  round-trip/world-frame contract remains partial.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — physics quality envelope continuation

- Continued the 3D-game analysis run into the physics-quality lane from the
  roadmap.
- Rechecked the runtime and confirmed the physics layer is already observable
  rather than opaque:
  - `src/main.ts` renders condition, grip, slope/grade, stall, water-depth, and
    mobility-family readouts in the HUD.
  - `src/game/performance.ts` and `window.getPerformanceSnapshot()` expose the
    measurement surface for frame timing, draw calls, triangles, heap use, load
    duration, and first-controllable timing.
- Appended a new addendum to
  `docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md`
  clarifying that the physics signals are live while the formal stability
  envelope remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — shader and material strategy continuation

- Continued the 3D-game analysis run into the shader/material lane from the
  roadmap.
- Rechecked the renderer and world data paths against the contract:
  - `src/game/renderer.ts` already uses standard materials, vertex-color
    terrain, phase-based fog/sky changes, and readability cues such as dust and
    rust,
  - `src/game/world.ts` and `src/game/terrain.ts` already supply the data-driven
    surface identity that the renderer consumes.
- Appended a new addendum to
  `docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md`
  clarifying that the visual language is already real while the layered
  material envelope remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — lighting and atmosphere strategy continuation

- Continued the same analysis run into the lighting/atmosphere lane from the
  roadmap.
- Rechecked the renderer and HUD against the contract:
  - `src/game/renderer.ts` already stages a directional sun, hemisphere light,
    phase-based fog/sky shifts, blob-shadows, and headlights for gloam/night,
  - `src/main.ts` already exposes world phase in the HUD, so the lighting
    posture is visible to the player.
- Appended a new addendum to
  `docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md`
  clarifying that the lighting strategy is live but still implicit rather than
  contract-shaped.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — verification harness and confidence gates continuation

- Continued the 3D-game analysis run into the verification-harness lane.
- Rechecked the live proof surface against the contract:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.getRunRecordVerification()`
  - the browser daemon is still healthy on the live field surface
- Noted that fresh review-image assets already exist in the worktree, so the
  harness now has real capture candidates rather than just policy text.
- Appended a new addendum to
  `docs/research/VERIFICATION_HARNESS_AND_CONFIDENCE_GATES_CONTRACT_2026-07-25.md`
  clarifying that the proof surface is real while the canonical bundle and
  confidence transition rule remain unnamed, and then naming the first bundle
  candidate set explicitly.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — renderer performance and accessibility smoke-test continuation

- Continued the same analysis run into the renderer/performance/accessibility
  smoke-test lane.
- Rechecked the live evidence surface against the contract:
  - `window.render_game_to_text()`
  - `window.getPerformanceSnapshot()`
  - `window.selectCamera()`
  - `window.getCameraResolutionEvidence()`
- Confirmed the browser entry point still keeps the accessibility shell intact
  after intro dismissal and that the current daemon snapshot remains healthy on
  `Rigs Unbound — Field 02`.
- Appended a new addendum to
  `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md`
  clarifying that the smoke-test gate is observable while the packaged public
  bundle is still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — performance and readability baseline continuation

- Continued the 3D-game analysis run into the umbrella performance/readability
  baseline lane.
- Rechecked the live runtime evidence behind the umbrella policy:
  - culling and LOD are named and observable,
  - camera modes and reduced-motion behavior are real,
  - collision, lighting, shader/material, physics, and performance lanes already
    have live evidence behind them,
  - `window.getPerformanceSnapshot()`, `window.selectCamera()`, and
    `window.render_game_to_text()` expose the pressure signals the baseline
    would read.
- Appended a new addendum to
  `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md`
  clarifying that the component contracts are real while the single umbrella
  budget surface is still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — runtime instrumentation KPI continuation

- Continued the 3D-game analysis run into the runtime-instrumentation KPI lane.
- Rechecked the live metrics surface behind the contract:
  - `src/game/performance.ts` already exposes frame timing, draw calls,
    triangle count, heap use, load duration, first-controllable time,
    first-input-ready time, save size, and terrain build time,
  - `src/main.ts` already forwards that snapshot into the live browser surface
    and HUD summary.
- Appended a new addendum to
  `docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md`
  clarifying that the metrics are surfaced while the canonical comparison
  bundle remains implicit.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — threshold fixture and capture-selection continuation

- Continued the 3D-game analysis run into the threshold-fixture / capture-
  selection lanes.
- Rechecked the live runtime and the on-disk capture candidates against the
  contract:
  - `docs/reviews/assets/field-02-front-forward.png`
  - `docs/reviews/assets/field-02-top-down.png`
  - `docs/reviews/assets/rig-lab-01-desktop.png`
  - `docs/reviews/assets/rig-lab-01-narrow.png`
- Appended new addenda to both
  `docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md` and
  `docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md`
  clarifying that the fixture categories and selection table already match the
  runtime, while the promoted comparison bundle is still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

## 2026-07-25 — culling and LOD spike-test continuation

- Continued the 3D-game analysis run into the culling/LOD spike-test lane.
- Rechecked the live renderer evidence behind the contract:
  - repeated props are instanced,
  - prop rebuilds remain bounded to a local radius,
  - some meshes intentionally disable automatic frustum culling for stable
    presentation,
  - `src/game/renderer.ts` and `src/main.ts` already expose draw-call,
    triangle, and timing metrics plus text and performance snapshots.
- Appended a new addendum to
  `docs/research/CULLING_LOD_SPIKE_TESTS_2026-07-25.md`
  clarifying that the visibility budget is real while the formal spike harness
  and reusable proof bundle are still missing.
- Evidence depth: Tier 1 static inspection plus live browser status check.
- Runtime state during this note: browser daemon healthy, current title
  `Rigs Unbound — Field 02`, console logs `0`.

---WORKLOG APPEND---

## 2026-07-25 — accessibility loading explicitness recheck

- Re-checked the live Field 02 runtime with the accessibility-auditor lane.
- The original keyboard/focus gap remains closed:
  - `#game-canvas` is keyboard focusable,
  - the skip link is present,
  - dismissing the intro now lands focus on `canvas#game-canvas`,
  - semantic landmarks are still present in the shell.
- The remaining accessibility-adjacent question is startup explicitness:
  - no explicit progress element,
  - no visible `aria-busy` indicator in the current DOM snapshot,
  - no public loading/profile percentage in the shell.
- That makes the next improvement a loader/boot affordance question, not a basic keyboard-accessibility repair.

## 2026-07-25 — asset-production import-proof recheck

- Re-checked the live Field 02 runtime with the `3d-asset-production` lane.
- The browser daemon still reports zero console logs and the active surface is
  still `Rigs Unbound — Field 02`.
- The manifest/preflight boundary is still the correct long-term asset gate:
  - `assets/asset-manifest.json` remains the canonical registry,
  - the runtime still separates source/provenance from runtime derivative,
  - provenance and rights metadata remain part of the asset story.
- The current runtime still does not consume an imported asset package in the
  playable path:
  - no GLB/texture/audio derivative is active yet,
  - no runtime activation record exists for a validated asset key,
  - the procedural terrain/prop path is still the live browser truth.
- The next durable asset milestone remains a browser import and activation
  proof, not a broader art import.

## 2026-07-26 — capability-composition recheck

- Re-checked the current source contract lane with the `3d-games` skill.
- `src/game/contracts.ts` still shows the runtime is composition-first:
  - `RigCapability` is a real domain type,
  - `RIG_PROFILES` carries explicit capability arrays,
  - `marsh-skimmer` remains a distinct hover-family profile.
- The current gameplay boundary is still implicit governance, not a formal
  adapter registry:
  - capability admission is handled at runtime,
  - failed actions still surface prose diagnostics,
  - the next durable step is structured capability definitions plus explicit
    reason codes.

## 2026-07-26 — physics and collision policy recheck

- Re-checked the live motion stack with the `3d-games` skill.
- `src/game/terrain-traversal.ts` now makes the shared terrain-face refusal
  explicit in code:
  - swept support-edge probes reject discontinuous faces,
  - the refusal returns `terrain-face`,
  - ground and hover adapters use the same boundary with different support
    thresholds.
- `src/game/physics.ts` consumes that boundary as a real motion outcome field,
  so the runtime already knows when a move was refused for terrain-face
  reasons.
- `src/game/collision.ts` still only needs the narrow obstacle roles the live
  game uses today:
  - trees can be felled,
  - rocks block and slide,
  - the field remains deterministic and role-aware.
- The remaining gap is still policy surface, not raw behavior:
  - no named physics envelope state,
  - no first-class collision category/mask table,
  - no trigger/sensor/projectile/hazard policy layer yet.

## 2026-07-26 — lighting and atmosphere policy recheck

- Re-checked the live renderer and HUD against the `3d-games` skill.
- `src/game/renderer.ts` already drives lighting by world phase:
  - directional sun and hemisphere light for the base model,
  - day/gloam/night switching for sky colour, fog, and headlight intensity,
  - blob shadows as the low-cost fallback posture.
- `src/main.ts` already exposes the active world phase in the HUD, so lighting
  context is visible to the player rather than only buried in renderer code.
- The remaining gap is policy naming, not behavior:
  - no tier matrix surfaced as contract data,
  - no explicit operator/debug field naming the active lighting strategy,
  - no formal rule for when atmosphere should simplify before readability is
    at risk.

## 2026-07-26 — world affordance resolution recheck

- Re-checked the live world/capability surface with the `3d-games` skill.
- `src/game/world.ts` still exposes real authored offers through site verbs and
  workshop/service areas.
- `src/game/state.ts` still resolves those offers through capability checks, so
  the world/capability mismatch is not hypothetical.
- The live runtime still emits a direct denial string rather than a structured
  resolver record.
- The remaining gap is the same one named in the contract:
  - no legal / deferred / impossible outcome envelope,
  - no structured mismatch telemetry,
  - no shared resolver entry point for behavior and activities.

## 2026-07-26 — replay artifact recheck

- Re-checked the live replay lane with the `3d-games` skill and browser daemon.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The bounded record spine remains concrete:
  - `schemaVersion`, `seed`, `startedAtMs`, `droppedEntries`,
  - ordered command / input / checkpoint / save entries,
  - checkpoint entries with stable tick hashes.
- `verifyRunRecord()` still passes in the live snapshot, so the record is
  useful as an internal audit and validation log.
- The remaining gap is unchanged:
  - no exposed playback path,
  - no ghost/share compatibility envelope,
  - no divergence report,
  - no diagnostics-vs-replay-safe trust split.

## 2026-07-26 — event graph recheck

- Re-checked the current command/checkpoint/toast/save flow with the
  `3d-games` skill.
- `src/main.ts` still routes outcomes through local command and toast/status
  paths, while `src/game/run-record.ts` keeps the bounded history verifiable.
- That makes the current flow useful for observability and internal validation,
  but still not a first-class shared event graph.
- The remaining gap is unchanged:
  - no versioned shared event envelope,
  - no origin-domain ownership field,
  - no replayable vs diagnostics-only split on the event surface,
  - no explicit deduplication / ordering policy as a contract.

## 2026-07-26 — kernel ordering recheck

- Re-checked the live orchestration boundary with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The kernel boundary is still the real source of truth:
  - `src/game/state.ts` owns the fixed-step orchestration and canonical
    mutation order,
  - `src/game/renderer.ts` remains presentation-only,
  - `src/main.ts` captures commands and routes intent into the kernel,
  - run-record capture keeps replay-sensitive history visible.
- The remaining gap is policy naming, not kernel behavior:
  - no ordered subsystem authority table,
  - no explicit replay-safe event emission point per mutable subsystem,
  - no kernel-stage telemetry field exposed as a first-class boundary,
  - no documented enforcement surface for renderer-only versus kernel-only
    responsibilities.

## 2026-07-26 — save and migration observability recheck

- Re-checked the live persistence lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- `src/main.ts` now keeps the HUD save status truthful across fresh/restored/
  migrated/recovered paths, and the persist path still records saves into the
  bounded run record.
- `src/game/storage.ts` still owns the actual load/save branching:
  - versioned keys,
  - migration from older save records,
  - clean replacement for incompatible payloads.
- The remaining gap is still the same contract layer:
  - no structured save/load reason-code field,
  - no versioned persistence-event schema,
  - no source-version metadata as a first-class event field,
  - no operator summary separate from the status string and toast.

## 2026-07-26 — RU-0110 B5–B12 implementation and acceptance

### Scope completed

- Replaced hardcoded hood framing with named Torque/Spark/Drift camera sockets.
- Added one solver-independent camera scene query across terrain, procedural
  obstacles, felled memory, and typed authored Home structures.
- Added immediate camera pull-in, slower recovery, post-smoothing revalidation,
  fallback framing, and mesh-envelope self-intersection evidence.
- Added canonical three-rig Home berths and schema-v6 persistence.
- Added selective v5 migration: only pristine inactive legacy Drift state moves;
  any moved/used/attached player state is preserved.
- Added one swept terrain-face boundary shared by ground and hover adapters,
  including at-rest footprint refusal, high-speed sweep, semantic reason, and
  downhill/reverse escape.
- Removed artificial minimum hover authority on extreme grades.
- Added a pure semantic primary-action resolver consumed by mutation, desktop
  labels, touch labels, aria labels, and browser automation.
- Split public/player persistence status from developer fps/draw-call/heap
  diagnostics; hid Physics Lab navigation on the default player surface while
  retaining explicit developer/evidence surfaces and direct routes.
- Hardened the browser harness with query-gated fixtures, deterministic manual
  stepping, readiness-function navigation, bounded failure cleanup, and
  active-rig assertions before captures.

### Verification evidence

- `npm run format:check` — passed.
- `npm test` — 12 files / 125 root tests passed.
- `npm run test:kernel-probe` — seven tests passed.
- `npm run build` — passed after typecheck; known advisory remains for the
  minified Three.js chunk above 500 kB.
- Field 02 browser acceptance on `4173` — exit code 0, zero captured
  console/page errors.
- Rebuilt production-preview acceptance on `4174` — exit code 0, zero captured
  console/page errors.
- Both browser runs covered player/developer surface boundaries, fresh
  Torque→Spark→Drift proximity acquisition, Home/tree/hood camera resolution,
  three real-terrain face fixtures plus downhill escape, first salvage, cargo
  relay, ramp, deep-water hover, save/reload, keyboard/mouse/touch recovery,
  reduced motion, six views, and `390×844` layout.
- Detailed evidence and caveats:
  `docs/reviews/RU_0110_ACCEPTANCE_2026-07-26.md`.

### Three-pass review

1. **Immediate correctness/completeness:** every B5–B12 finding has a current
   disposition, code path, automated check, and browser evidence. Contradicted
   earlier hood captures remain preserved; validated replacements assert active
   rig identity.
2. **Architecture/long-term viability:** rig identity is dependency-free;
   authored berths/structures have one world-data source; camera and terrain
   queries are solver-independent; ground/hover feel remains adapter-owned;
   action semantics are resolved once rather than copied into UI.
3. **Rule compliance/supervision readiness:** docs, ADRs, exploration map,
   tracker, review artifact, tests, browser evidence, and acceptance caveats are
   synchronized. No duplicate route, renderer-owned world truth, hidden failure,
   or AI co-author attribution was introduced.

### Value delivered

- **Player value:** every advertised rig is reachable immediately; cameras stay
  readable around structures/trees and inside each rig; impossible faces behave
  consistently; controls say what they will do; public HUD is less confusing.
- **Team/project value:** later rigs, GLBs, solvers, activities, and public builds
  reuse typed ports instead of accumulating rig-name patches.
- **Operational value:** migrations preserve player history, acceptance evidence
  identifies exact sources/reasons, developer diagnostics stay available without
  leaking into player presentation, and browser runs terminate predictably.

### Remaining non-blocking hardening

- Clean representative-device performance capture without concurrent
  trailer/browser-daemon GPU load.
- Structured event/reason schemas for action, traversal, and persistence before
  replay/network authority.
- Product decision on compiling acceptance mutation hooks out of public
  production bundles.
- New uncontaminated external-player session for comprehension and feel.

## 2026-07-26 — resource budget and fallback recheck

- Re-checked the live performance lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- `src/game/performance.ts` still exposes a rich measurement envelope:
  - frame timing,
  - p95 / average frame times,
  - FPS,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable time,
  - save bytes and last save duration.
- `src/main.ts` continues to surface those metrics through the developer/evidence
  readout and `window.getPerformanceSnapshot()`.
- The remaining gap is still policy, not measurement:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused the fallback.
- The current visibility fallback itself is already owned by
  `RuntimeProfileController`; the unresolved layer is the broader resource
  governor beyond the renderer visibility lane.

## 2026-07-26 — authoring validation recheck

- Re-checked the live content-admission lane with the `3d-asset-production`
  skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The repo already has a real asset-specific validation spine:
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, path safety, and
    missing dependencies,
  - all candidate runtime paths remain out of the playable path until proof
    exists.
- The remaining gap is the general authoring envelope:
  - no versioned content-manifest schema for activities or world modules,
  - no reproducible validation-result artifact for broader authored content,
  - no clean validation-only/runtime-ready/deprecated status signal across the
    general content surface,
  - no reusable authoring contract covering imported, edited, or generated
    content beyond the asset slice.

## 2026-07-26 — world scalability recheck

- Re-checked the live world-memory lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- `src/game/gameworld.ts` still models growth as bounded memory sets plus
  terrain deformation:
  - `felledObstacles`
  - `collectedNodes`
  - `surveyedCells`
  - terrain deformation entries
- `snapshot()` and `restore()` keep that memory replayable and recoverable
  through the save system.
- The remaining gap is still the scalability envelope, not the local memory
  substrate:
  - no chunk or region lifecycle policy,
  - no load/unload radius rules,
  - no growth-pressure observability,
  - no pack activation rollback policy,
  - no future shared-state readiness boundary beyond documentation.

## 2026-07-26 — ECS readiness recheck

- Re-checked the live composition lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The codebase still expresses composition directly rather than through ECS:
  - `src/game/contracts.ts` composes installed modules onto immutable rig
    blueprints,
  - `src/game/state.ts` keeps rigs, modules, and world state explicit,
  - `src/game/gameworld.ts` keeps world memory as bounded sets and snapshots.
- The live scale remains compact, so there is still no measured pressure that
  justifies an ECS migration threshold.
- The remaining gap is still the threshold contract:
  - no quantified actor-count or coupling trigger,
  - no canonical multi-capability composition schema beyond the current rig
    model,
  - no migration proof that preserves identity through a component-model
    change,
  - no explicit statement that ECS should serve the machine-centric model
    rather than replace it.

## 2026-07-26 — camera policy recheck

- Re-checked the live camera lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The camera system is still doing real gameplay work:
  - named modes remain exposed in `src/game/contracts.ts`,
  - `src/main.ts` routes mode selection through commands and checkpoints,
  - `src/game/renderer.ts` resolves obstruction pull-in and speed FOV,
  - reduced-motion clamping remains active in the feedback path,
  - `getCameraResolutionEvidence()` exposes active camera-resolution evidence.
- The remaining gap is still the named policy layer:
  - no camera-policy schema,
  - no explicit transition reason table,
  - no operator-visible camera-policy summary field,
  - no separate persistent camera-policy artifact beyond the save-state camera
    mode.

## 2026-07-26 — camera lane is now a resolved policy surface

- Re-checked the camera lane against the current browser surface and the
  existing policy notes.
- Confirmed the runtime already exposes camera selection, obstruction
  evidence, and reduced-motion-safe behavior, so the camera lane is more than
  a hidden renderer quirk.
- Mirrored the latest boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between resolved camera policy
  and the still-missing player-facing reason string / durable policy artifact.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — visibility and LOD recheck

- Re-checked the live visibility lane with the `3d-games` skill.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The current renderer still behaves like a deliberate first-pass visibility
  budget:
  - terrain remains a single mesh derived from the height field,
  - trees, rocks, felled trunks, salvage, and furrows remain instanced,
  - prop rebuilds are still radius-bounded around the rig,
  - presentation pieces such as the sky and dust still opt out of default
    frustum culling when stability matters more than a formal visibility graph,
  - performance hooks still expose draw calls, triangles, and frame timing.
- The remaining gap is still the named policy surface:
  - no visible/local-radius/distant-sim tier matrix,
  - no counters for missed-cull pressure or residency churn,
  - no regression test proving a downgrade tier stays readable rather than
    disappearing into undefined behavior.

## 2026-07-26 — shader/material strategy recheck

- Re-checked the live shader/material lane with the `3d-games` skill and a live
  browser snapshot.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The active material path is still deliberately simple and readable:
  - `src/game/renderer.ts` uses `THREE.MeshStandardMaterial`,
  - terrain uses vertex colors instead of a bespoke layered shader stack,
  - repeated terrain props remain instanced,
  - `src/game/world.ts` and `src/game/terrain.ts` still supply the visual
    vocabulary through data-driven surface, biome, and site definitions.
- The current browser snapshot confirms the field is legible, but the contract
  is still implicit:
  - no layered material schema,
  - no modifier versioning for weather/wear/hazard cues,
  - no operator-visible material-strategy flag.
- The next exploration question is whether the first formal material contract
  should start from terrain transitions, weather feedback, or surface wear.

## 2026-07-26 — performance/readability baseline recheck

- Re-checked the live umbrella performance/readability lane with the
  `3d-games` skill and a live browser snapshot.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The current performance snapshot gives us a real baseline to anchor:
  - `averageFrameMs` is `20.25`,
  - `p95FrameMs` is `21.7`,
  - `framesPerSecond` is `49.4`,
  - `drawCalls` is `73`,
  - `triangles` is `104694`,
  - `terrainBuildMs` is `92.7`,
  - `heapUsedMb` is `29.4`,
  - `firstControllableMs` is `469.2`,
  - `saveBytes` is `2969`.
- These values are a live diagnostic snapshot, not a representative-device
  performance baseline: concurrent browser/trailer GPU activity contaminated
  this session's timing evidence. They may guide the next clean capture but must
  not support a public performance claim.
- The remaining gap is still the umbrella policy surface:
  - no visible within-budget / degraded / fail-soft table,
  - no operator-facing summary that names the exceeded threshold,
  - no single artifact that maps the live numbers back to the specialized
    contracts as one operational policy.
- The next exploration question is how much of that umbrella should be surfaced
  in HUD versus debug tooling versus durable docs.

## 2026-07-26 — minimap/world-coordinate recheck

- Re-checked the live minimap/world-coordinate lane with the `3d-games` skill
  and the current browser snapshot.
- The runtime is still healthy on `Rigs Unbound — Field 02`, with zero console
  logs in the current daemon snapshot.
- The current snapshot confirms the map is still doing real coordinate audit
  work:
  - `surveyedCells` is `19`,
  - `surveyedFraction` is `0.0546`,
  - `discoveries` currently contains `home-silo`,
  - the nearest salvage and authored site list are still presented in world
    coordinates.
- The remaining gap is still the transform boundary:
  - no round-trip world-pixel-world test,
  - no `WorldFrame` / origin-revision record in runtime,
  - no chunk-residency or origin-rebase proof,
  - no diagnostic overlay for route cost, clearance, or capability-aware
    pathing.
- The next exploration question is how to make that map contract survive
  rebasing and richer topologies without losing coordinate identity.

## 2026-07-26 — streaming-world residency recheck

- Re-checked the live streaming-world lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The world substrate is still one canonical residency:
  - one `GameWorld`,
  - one `TerrainField`,
  - one obstacle field,
  - one exploration field,
  - one composed save payload in `src/game/storage.ts`.
- The remaining gap is still the streaming contract boundary:
  - no chunk manifest,
  - no residency states,
  - no activate/unload/rollback lifecycle,
  - no active-chunk budget counters,
  - no unload/rollback observability.
- The next exploration question is whether the first streaming proof should be
  authored from world data, region cells, or a hybrid manifest.

## 2026-07-26 — replay artifact and ghost continuity recheck

- Re-checked the live replay lane with the `3d-games` skill and the current
  browser daemon status plus a run-record verification probe.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live browser surface still exposes:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
- The current verification result remains `ok: true` with no issues.
- The run-record spine is still bounded and versioned:
  - schema version,
  - seed,
  - ordered entries,
  - checkpoint tick hashes,
  - cap-and-trim behavior.
- The remaining gap is still the first-class replay/ghost artifact surface:
  - no exposed playback path,
  - no compatibility envelope,
  - no replay divergence report,
  - no trust split between diagnostics-only and replay-safe output.
- The next exploration question is whether replay should land first as a debug
  validator, a shareable ghost, or a dual-purpose artifact with explicit
  compatibility rules.

## 2026-07-26 — authority model groundwork recheck

- Re-checked the live authority lane with the `3d-games` skill and the current
  browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live mode remains local-first:
  - `src/main.ts` captures commands as explicit browser-side events,
  - `src/game/state.ts` owns deterministic canonical mutation order,
  - `src/game/storage.ts` saves and restores local state with versioned
    recovery and clean fallback behavior.
- The remaining gap is still the shared-state envelope:
  - no authenticated mutation request/response shape,
  - no explicit reject-path state separation,
  - no durable-value recovery metadata surfaced as policy,
  - no telemetry for authoritative outcomes,
  - no visible shared-state/server-authoritative boundary artifact.
- The next exploration question is which authority-shaped proof should come
  first once a shared-state feature is actually needed: save, repair, or module
  install.

## 2026-07-26 — simulation layers and resource governance recheck

- Re-checked the live simulation-layer lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The runtime already behaves like a layered simulation:
  - `src/game/state.ts` carries world time, phase, progression, activity, and
    snapshot validation,
  - `src/game/gameworld.ts` keeps world memory bounded,
  - `src/game/performance.ts` and `src/main.ts` expose runtime pressure,
  - `src/game/contracts.ts` still keeps spendable resource singular by design.
- The remaining gap is still the governance envelope:
  - no owned domain-order table,
  - no CPU/GPU/actor/residency/save budget ledger,
  - no fallback-policy table,
  - no recorded downgrade reason surfaced as policy.
- The next exploration question is which layer should be the canonical first
  downgrade point once the budget ledger becomes first-class.

## 2026-07-26 — resource budget and fallback envelope recheck

- Re-checked the live resource-budget lane with the `3d-games` skill and the
  current browser daemon status plus a live performance snapshot.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current performance snapshot still shows a measurable pressure picture:
  - `averageFrameMs` is `20.01`,
  - `p95FrameMs` is `21.7`,
  - `framesPerSecond` is `50`,
  - `drawCalls` is `72`,
  - `triangles` is `104694`,
  - `terrainBuildMs` is `92.7`,
  - `heapUsedMb` is `12.7`,
  - `loadDurationMs` is `2.7`,
  - `firstControllableMs` is `469.2`,
  - `saveBytes` is `2971`.
- The runtime already measures cost and exposes it through browser hooks.
- The remaining gap is still the envelope:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused fallback.
- The next exploration question is whether the first trigger should be frame
  time, heap, or draw-call pressure.

## 2026-07-26 — ECS threshold and composition readiness recheck

- Re-checked the live ECS lane with the `3d-games` skill and the current browser
  daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current architecture remains composition-first:
  - `src/game/contracts.ts` composes modules onto immutable rig blueprints,
  - `src/game/state.ts` keeps rigs, modules, and world state explicit,
  - `src/game/gameworld.ts` keeps world memory as bounded sets and snapshots.
- The live scale still does not justify ECS:
  - only three rigs are active,
  - authored sites remain a small fixed set,
  - world memory is bounded and replayable,
  - no broad entity zoo or coupling pressure is visible yet.
- The remaining gap is still the migration threshold:
  - no measured actor-count or coupling trigger,
  - no canonical multi-capability composition schema beyond the current rig
    model,
  - no migration proof that preserves identity through a component-model
    change,
  - no explicit statement that ECS should serve the machine-centric model
    rather than replace it.
- The next exploration question is what measured pressure would actually justify
  an ECS migration in this project.

## 2026-07-26 — behavior/planner boundary recheck

- Re-checked the live behavior/planner lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current runtime already has decision-shaped logic:
  - `resolvePrimaryAction()` resolves a semantic action before mutation,
  - `performPrimaryAction()` applies the chosen effect and records the
    consequence,
  - `selectActiveRig()`, `installModule()`, `repairRig()`, and `winchRecover()`
    validate and explain state transitions explicitly.
- The remaining gap is the planner envelope:
  - no versioned behavior schema,
  - no candidate-enumeration interface,
  - no deterministic tie-break surface for equal-score candidates,
  - no separate branch-trace stream naming why one branch lost.
- The next exploration question is when the project will actually need to rank
  multiple candidate actions rather than resolve one contextual action at a
  time.

## 2026-07-26 — capability/adaptor guardrails recheck

- Re-checked the live capability lane with the `3d-games` skill and the current
  browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current code remains composition-first:
  - `RIG_PROFILES` carries explicit capability arrays,
  - `effectiveProfile()` composes fitted modules onto an immutable rig profile,
  - `MODULES` can grant extra capabilities without replacing the base rig.
- The live admission path is still lightweight and prose-driven:
  - capability checks are boolean,
  - denied actions surface human-readable diagnostics,
  - there is no versioned capability-definition registry,
  - there is no structured denial envelope with reason codes,
  - adapter governance is still implicit rather than registry-driven.
- The next exploration question is which capability should be the first
  formally versioned envelope: tow, plough, survey, or hover.

## 2026-07-26 — world affordances and capability resolution recheck

- Re-checked the live world-affordance lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The world remains affordance-shaped in code:
  - authored sites carry a `verb`,
  - workshop/service areas expose place-based interaction pressure,
  - `src/game/state.ts` decides whether the active rig can satisfy the offer
    through capability checks.
- The remaining gap is still the resolver envelope:
  - no legal / deferred / impossible outcome code,
  - no reusable resolver record shared by behavior and activities,
  - no structured rejection payload naming which side caused the mismatch,
  - no affordance versioning or validation path.
- The next exploration question is which world offer should become the first
  fully structured resolver example: workshop, tow, survey, or plough.

## 2026-07-26 — asset pipeline and provenance recheck

- Re-checked the live asset-pipeline lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `assets/asset-manifest.json` is a real registry, but still pre-runtime:
  - `schemaVersion` is `1`,
  - `assetRoot` is `assets/runtime`,
  - `runtimeFormat` is `glb`,
  - all three entries still have `runtimePath: null`.
- The registry already tracks the important provenance shape:
  - source/reference paths,
  - rights status,
  - intended use,
  - a hash on the admitted reconstruction reference.
- The remaining gap is still activation:
  - no imported runtime asset is active in the playable path,
  - no manifest entry has crossed into runtime truth,
  - no replacement/deprecation cycle has been exercised on a live imported
    asset,
  - no runtime validator is consuming the registry yet.
- The next exploration question is which asset class should become the first
  runtime-activated proof: static prop, terrain variant, or vehicle-related art.

## 2026-07-26 — authoring validation and reproducible content recheck

- Re-checked the live authoring-validation lane with the `3d-asset-production`
  skill and the current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The repo already validates content in the slices that matter today:
  - state/load paths reject bad or incompatible records,
  - module and world definitions remain data-driven,
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, safe paths, and
    missing dependencies.
- The remaining gap is the general content envelope:
  - no versioned content-manifest schema for activities or world modules,
  - no reproducible validation-result artifact for the general content path,
  - no status signal that cleanly separates validation-only, runtime-ready,
    and deprecated across the broader authored content surface,
  - no reusable authoring envelope that applies the same contracts to
    imported, edited, or generated content beyond the asset slice.
- The next exploration question is whether the first general manifest should
  cover activities, world modules, or both.

## 2026-07-26 — lighting and atmosphere recheck

- Re-checked the live lighting lane with the `3d-games` skill and the current
  browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The renderer already has a real lighting posture:
  - a directional sun and hemisphere light provide the base model,
  - lighting responds to world phase with fog/sky/headlight shifts,
  - blob shadows remain the low-cost fallback posture.
- `src/main.ts` still surfaces world phase in the HUD, so the player can see
  the active lighting context.
- The remaining gap is the policy envelope:
  - no tier matrix in contract data,
  - no operator/debug field naming the active lighting strategy,
  - no formal fallback rule stating exactly when atmosphere should simplify
    before clarity is endangered.
- The next exploration question is which atmosphere cue should become the first
  named policy item: dawn/dusk, fog, or storm conditions.

## 2026-07-26 — lighting and atmosphere live-field recheck

- Re-checked the live lighting lane again with the `3d-games` skill and a live
  performance snapshot.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live snapshot currently shows `phase: day` and `cameraMode: chase`, with
  the field still readable under the existing conservative lighting posture.
- The current runtime still uses:
  - directional sun + hemisphere light,
  - phase-driven fog/sky/headlight changes,
  - blob-shadow fallback posture.
- The remaining gap is still the policy envelope:
  - no tier matrix in contract data,
  - no operator/debug field naming the active lighting strategy,
  - no formal fallback rule stating exactly when atmosphere should simplify
    before clarity is endangered.
- The next exploration question is whether the first named atmosphere cue
  should be dawn/dusk, fog, or storm conditions.

## 2026-07-26 — physics quality and collision recheck

- Re-checked the live physics/collision lanes with the `3d-games` skill and a
  live performance snapshot.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live performance snapshot remains in the first-playable band:
  - `averageFrameMs` is `20`,
  - `p95FrameMs` is `21.5`,
  - `framesPerSecond` is `50`,
  - `drawCalls` is `72`,
  - `triangles` is `104694`,
  - `heapUsedMb` is `16.5`,
  - `firstControllableMs` is `469.2`.
- These figures are a diagnostic snapshot, not a representative-device
  baseline. Concurrent browser and capture workloads remain capable of
  contaminating timing evidence, so they must not support public performance
  claims or threshold decisions without a clean profile run.
- The current physics model still has the right motion signals:
  - fixed-step determinism,
  - terrain contact under four sampled wheels,
  - explicit slope, grip, slip, water, and stall outcomes,
  - terrain-face refusal now exists as a real traversal block reason in code.
- The current collision model still stays intentionally narrow:
  - trees can be felled by heavy enough motion,
  - rocks block and slide,
  - no trigger/sensor/projectile/hazard matrix exists yet.
- The remaining gap is the policy envelope for both lanes:
  - no named physics stability states,
  - no operator-visible summary of simplified physics,
  - no first-class collision category/mask matrix.
- The next exploration question is which lane should get the first formal
  policy artifact: stability states or collision categories.

## 2026-07-26 — minimap and world-coordinate recheck

- Re-checked the live minimap/world-coordinate lane with the `3d-games` skill
  and a live world snapshot.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current snapshot still proves the map is a real navigation audit:
  - `phase` is `gloam`,
  - `surveyedCells` is `19`,
  - `surveyedFraction` is `0.0546`,
  - `discoveries` contains `home-silo`,
  - `nearestSalvage`, `workshopInReach`, and authored sites are all reported in
    world coordinates.
- `src/game/minimap.ts` still derives the map from canonical world constants and
  persistent world memory rather than from renderer geometry or physics
  handles.
- The remaining gap is still the transform contract:
  - no round-trip world-pixel-world test,
  - no `WorldFrame` / origin-revision record in runtime,
  - no chunk-residency or origin-rebase proof,
  - no diagnostic overlay for route cost, clearance, or capability-aware
    pathing.
- The next exploration question is how to make that contract survive rebasing
  and richer topologies without losing coordinate identity.

## 2026-07-26 — renderer performance and accessibility recheck

- Re-checked the live renderer/performance/accessibility lane with the current
  browser daemon status and a live runtime snapshot.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live snapshot still shows the game in a readable first-playable band:
  - `phase` is `gloam`,
  - `cameraMode` is `chase`,
  - the active rig and objective remain visible and recoverable,
  - performance remains bounded and measurable.
- The runtime evidence hooks remain real:
  - `window.render_game_to_text()`,
  - `window.getPerformanceSnapshot()`,
  - `window.selectCamera()`,
  - `window.getCameraResolutionEvidence()`.
- The remaining gap is still the public-gate package:
  - no capture bundle binding the profile matrix, checklist, and KPI evidence,
  - no canonical pass/fail summary for fallback events,
  - no operator-ready artifact that can be carried forward as the official
    smoke-test record.
- The next exploration question is which artifact should be the first packaged
  public-gate deliverable: capture bundle, pass/fail summary, or both together.

## 2026-07-26 — streaming-world residency recheck

- Re-checked the live streaming-world lane with the `3d-games` skill and the
  current browser daemon status.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/game/gameworld.ts` still owns one canonical `GameWorld` with:
  - one terrain field,
  - one obstacle field,
  - one exploration field,
  - bounded spatial sets for felling, collection, and survey history.
- `src/game/storage.ts` still writes and restores that world as one composed
  payload alongside state, with versioned keys rather than streamed manifests.
- The live snapshot still behaves like one playable residency:
  - one field substrate,
  - one save boundary,
  - one spatial-memory record,
  - no residency lifecycle state.
- The remaining gap is still the streaming layer:
  - no `WorldChunkManifest`,
  - no pending/active/evicted/rollback residency states,
  - no activation validation,
  - no active-chunk budget counters,
  - no unload/rollback observability.
- The next exploration question is what should author the first chunk lifecycle
  proof: world data, route/biome cells, or a hybrid manifest.

## 2026-07-26 — RU-0110 public release and handoff

- Pushed guarded gameplay commit `9c10d2b` and late-research preservation commit
  `a8869ad`; local `HEAD`, GitHub `origin/main`, and the Sites source branch
  were aligned at `a8869ad` before version saving.
- Packaged the already-green production build with the installed Sites
  packager. Sites saved version 7 with the exact pushed commit provenance and
  deployment `appgdep_6a6564e8f510819186b047775995d015` reached terminal
  `succeeded`.
- Public route evidence:
  - Field 02 returned HTTP 200;
  - `/physics-lab.html` redirected to `/physics-lab`, which returned HTTP 200;
  - `/box3d-lab.html` redirected to `/box3d-lab`, which returned HTTP 200.
- The first production acceptance invocation used the bare URL from the
  runbook and failed its developer-surface precondition because acceptance-only
  fixtures are correctly query-gated. The runbook command now includes
  `?acceptance=field-02`.
- The corrected full production acceptance passed with zero captured
  console/page errors. It covered fresh three-rig acquisition, Home/tree/hood
  cameras, all-rig terrain-face refusal and downhill escape, relay/ramp/deep
  water activities, persistence, keyboard/mouse/touch recovery, reduced motion,
  six views, and `390×844` layout.
- Sites returned no recent production Worker error events.
- Production automation timings remain non-representative because browser/GPU
  workloads were concurrent. A clean device matrix and external-player session
  remain open; the functional release evidence is still valid.
- **User value:** the public build now contains the readable cameras, reachable
  rigs, honest controls, and traversal boundaries proven by RU-0110.
- **Team value:** future agents have an exact version-to-commit ledger,
  corrected production command, rollback candidates, and deployment handoff.
- **Operational value:** source provenance, package validation, terminal
  deployment state, live-route behavior, browser errors, and Worker errors are
  all recorded rather than inferred.

## 2026-07-26 — asset activation bridge recheck

- Re-checked the live browser daemon before documenting the asset bridge.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The asset spine is now explicit but still pre-runtime:
  - `assets/asset-manifest.json` is the registry,
  - `tools/asset-preflight.mjs` is the promotion gate,
  - current entries stay at concept/proposed/reference with `runtimePath:
null`.
- The bridge condition is now clearer than before:
  - promoted assets must land as safe repository-relative `.glb` paths inside
    `assets/runtime`,
  - `approved` and `runtime-tested` entries require a runtime path,
  - no imported GLB is active in the playable browser path yet.
- The next question is whether the first bridge proof should be a static prop,
  a tractor rig mesh, or a smaller fixture that exercises the same promotion
  path without adding gameplay risk.

## 2026-07-26 — first runtime asset should be a small static prop

- Re-checked the live runtime before choosing the first imported-asset proof.
- The current surface already exercises the core gameplay contract:
  - active rig `utility-tractor`,
  - companion rigs `toy-buggy` and `marsh-skimmer`,
  - live activity `cargo-relay`,
  - observable world memory and performance telemetry.
- Because the runtime already carries multiple locomotion and capability paths,
  the first runtime asset should prove the import/manifest bridge without
  introducing new gameplay semantics at the same time.
- The better first bridge proof is a small static prop or fixture in
  `assets/runtime`, promoted through the manifest and visible in browser play.
- The tractor mesh remains the eventual flagship candidate, but it is not the
  cleanest first proof because it overlaps with the existing rig semantics.

## 2026-07-26 — chosen bridge candidate is the Car Kit breakable crate

- Re-checked the Kenney audit and the current manifest before freezing the
  first runtime asset candidate.
- The chosen first bridge candidate is now explicit:
  - `3D assets/Car Kit/Models/GLB format/box.glb`,
  - stable semantic key `kenney-car-kit-breakable-crate-fixture`.
- Why this is the best first proof:
  - it is a small static prop, so it isolates the import bridge from tractor
    gameplay semantics,
  - it is still representative enough to validate manifest admission,
    provenance, browser visibility, and replacement behavior,
  - it sets a clean baseline for the later flagship vehicle asset.
- The manifest was tightened to this exact candidate, but it is still not
  runtime-activated:
  - `runtimePath` now points at a repo-owned runtime copy,
  - the renderer has a bridge fixture hook for the imported GLB,
  - live browser confirmation is still pending.

## 2026-07-26 — bridge evidence API became generic and manifest-driven

- Added the manifest-backed bridge evidence API:
  - `window.getRuntimeBridgeEvidenceList()`
  - `window.getRuntimeBridgeEvidence(assetId)`
- The bridge now reports `loading`, `loaded`, `fallback`, or `error` state in
  code, plus the runtime path and fallback status.
- The browser briefly needed a reload while the API changed, but the live page
  now reports the manifest-driven bridge list cleanly.

## 2026-07-26 — first runtime bridge is live and clean

- Re-checked the live acceptance surface after mirroring the crate texture
  dependency into `assets/runtime/Textures/colormap.png`.
- The bridge evidence hook now reports:
  - `assetId`: `kenney-car-kit-breakable-crate-fixture`,
  - `runtimePath`: `http://127.0.0.1:4173/assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`,
  - `status`: `loaded`,
  - `fallbackActive`: `false`,
  - `loadedNodeCount`: `1`,
  - `errorMessage`: `null`.
- The browser console returned to zero logs after the texture copy.
- This is the first live runtime asset bridge in the repo: manifest, runtime
  copy, renderer hook, texture dependency, and browser evidence all line up.

## 2026-07-26 — tractor preview bridge confirms the pattern scales

- Added `kenney-car-kit-tractor-preview` as a second runtime asset bridge.
- The tractor preview loads cleanly in the live browser with:
  - `status: loaded`,
  - `fallbackActive: false`,
  - `loadedNodeCount: 5`,
  - `errorMessage: null`.
- This shows the bridge pattern is not just for a tiny prop:
  - it can carry a multi-node vehicle-shaped GLB through the same manifest and
    runtime path,
  - the same texture dependency family works,
  - the browser remains clean after load.

## 2026-07-26 — runtime snapshot now includes bridge evidence

- Updated `render_game_to_text()` so the canonical runtime snapshot includes
  `runtimeAssetBridges`.
- The main JSON payload now carries both bridge states directly:
  - crate bridge,
  - tractor preview bridge.
- This is the useful observability gain from the bridge lane:
  asset loading is no longer only visible through helper hooks; it is part of
  the app’s canonical runtime snapshot.

## 2026-07-26 — developer HUD now shows bridge health directly

- Updated the developer diagnostics line to surface bridge status inline.
- The live HUD now reads:
  - `crate:loaded`
  - `tractor:loaded`
- That keeps the asset bridge visible to operators without opening the
  canonical JSON snapshot or helper hooks.

## 2026-07-26 — bridge health remains runtime-only, not save data

- Re-checked the storage contract after the HUD/snapshot changes.
- Save payloads still contain only:
  - `state`
  - `worldMemory`
- Bridge health is intentionally not serialized:
  - the asset files already rehydrate it on reload,
  - persisting it would create a second truth source,
  - runtime reload should stay the source of truth for bridge health.

## 2026-07-26 — bridge selection is now derived from the manifest

- Added `src/game/runtime-assets.ts` as the manifest-derived source of runtime
  bridge specs.
- The renderer now consumes the manifest-backed bridge list instead of owning
  hardcoded bridge URLs.
- The browser snapshot includes `runtimeAssetBridges` as a list, and the HUD
  summarizes bridge health as `bridges:2/2`.
- Live proof after the refactor:
  - crate bridge loaded,
  - tractor preview bridge loaded,
  - console clean aside from Vite connect logs.
- The bridge API is now generic as well:
  - `window.getRuntimeBridgeEvidenceList()`
  - `window.getRuntimeBridgeEvidence(assetId)`

## 2026-07-26 — rig-left steering, rear-side camera, and Launch Ridge collision

- Traced the browser report that Torque appeared to face the player while
  moving through the canonical simulation, renderer, camera, Rapier, and Box3D
  paths.
- Fixed the shared direction contract:
  - local `+Z` remains rig forward,
  - positive semantic steering means the player's left,
  - simulation and physics adapters translate that value to negative yaw,
  - wheel and camera presentation consume the same semantic sign.
- Added signed chase-camera evidence (`forwardOffset`, `behindRig`) and a final
  profile-scaled rig-clearance fallback.
- Promoted the Launch Ridge rocket from renderer-only geometry to canonical
  authored structure data used by rendering, camera queries, and rig collision.
- Strengthened browser acceptance with a real signed left-turn movement check
  and a Launch Ridge overlap/camera fixture.
- Kept the real collision response intact when the acceptance driver's
  obstacle-free assumption failed; the cargo proof now uses a short aligned
  approach rather than pretending the test driver is an avoidance system.
- Verification:
  - focused gameplay/dynamics set: 83/83 passed,
  - full Vitest: 13 files and 138 tests passed,
  - deterministic kernel probe: 7/7 passed,
  - Field 02 browser acceptance: passed, six cameras, clean console,
  - Physics Lab browser acceptance: passed, six cameras, clean console,
  - Box3D Lab browser acceptance: passed, negative steered heading, clean
    console,
  - TypeScript and production build: passed,
  - asset tests: 5/5 passed,
  - asset preflight: four entries, zero findings,
  - repository format and `git diff --check`: passed.
- Three-pass result:
  1. correctness — signed input, heading, displacement, visual front, camera
     side, and structure push-out agree;
  2. architecture — one semantic direction contract and one authored structure
     source serve contrasting rigs and adapters without vehicle-name branches;
  3. supervision — runtime, tests, docs, console, artifacts, and parallel-work
     preservation were rechecked.
- Full evidence and acceptance contract:
  `docs/reviews/RIG_DIRECTION_AND_LANDMARK_COLLISION_ACCEPTANCE_2026-07-26.md`.
- No commit, push, branch mutation, cleanup, or deletion was performed.

### Anything else?

Direction conventions must be explicit at every future mobility and imported
asset boundary. A visually clear camera can still be on the wrong side, so
signed side evidence should remain part of camera regression acceptance.

## 2026-07-26 - 3D skill-to-repository execution ledger and visibility policy

- Applied the `3d-games`, `3d-web-experience`, `3d-asset-production`, and `Accessibility Auditor` skills one at a time to compare the long-term 3D platform direction against the live Rigs Unbound source and existing research contracts.
- Created `docs/research/3D_GAME_SKILL_TO_REPO_EXECUTION_LEDGER_2026-07-26.md` as the canonical current-state, ownership, maturity, risk, and implementation-sequencing ledger. Linked it from the research index and exploration map rather than duplicating the existing contract set.
- Reconciled stale asset-bridge claims across the manifest preflight test, tool README, and provenance contract: four manifest entries exist; two proposed GLB assets are runtime candidates; runtime observation and rights review remain required before calling either asset runtime-tested or approved.
- Added the first bounded visibility-policy seam in `src/game/visibility.ts`, wired its deterministic distance classification and counters into `src/game/renderer.ts`, and exposed the resulting snapshot through `src/game/performance.ts`. This deliberately preserves the current standard 168m prop radius and does not claim per-instance frustum culling, dynamic profile selection, or geometric LOD.
- Updated the visibility and rendering contracts to distinguish the Tier 1 source-level policy seam from future browser/runtime evidence. No tests, typecheck, browser run, benchmark, or git operation was performed in this pass; existing parallel-work evidence remains separate and was preserved untouched.

## 2026-07-26 - capability-affordance resolution proof

- Added a narrowly scoped, versioned capability-affordance resolver in `src/game/affordances.ts` and applied it to the real relay-cargo/tow interaction in `src/game/state.ts`.
- The resolver emits deterministic legal, deferred, or impossible outcomes with stable reason codes and mismatch ownership; it draws the capability claim from the canonical composed rig profile instead of rig identity.
- Added focused pure resolver coverage in `src/game/affordances.test.ts` and updated the affordance/capability contracts with the exact boundary: two real activity seams exist, while generic activity schemas, content ingestion, adapter registries, planner integration, and authority work remain deliberately deferred pending a multi-candidate proof.
- No tests, typecheck, browser run, benchmark, or git operation was performed in this pass. Existing parallel-work evidence remains separate and preserved.

## 2026-07-26 — activity/content contract readiness recheck

- Re-checked the activity/content lane against the current resolver and command
  state.
- `src/game/affordances.ts` now provides a versioned, deterministic resolver
  with `legal`, `deferred`, and `impossible` outcomes for the relay-cargo/tow
  interaction.
- `src/game/state.ts` still treats that as a contextual command-resolution
  seam, not a general activity registry.
- The generic activity boundary remains the same:
  - no versioned `ActivityDefinition` registry,
  - no third materially different activity using the same matcher,
  - no multi-activity command -> validate -> transition -> event pipeline,
  - no content ingestion / semantic validation for untrusted packs.
- The useful conclusion is unchanged: the repo now has two real activity seams,
  and it should only generalize once a multi-candidate proof exists.

## Blade fill, rig proximity, and a 63x step-time fix — 2026-07-26

### What changed for a player

- **The blade fills as well as cuts** (`B`). `DEFORM_MAX = +0.3` had existed in the
  terrain field since the first commit with no caller; only the `-0.13` plough cut
  was ever used. Because `surfaceFor` derives material from height, filling wet
  ground far enough turns mud back into pasture — soil the player moves now changes
  what the ground _is_. HUD reads "Filling" vs "Ploughing"; the mode persists in the
  save and older records default to `cut`.
- **Rig switching is a place, not a menu.** `selectActiveRig` refused nothing before,
  so swapping rigs teleported the player's attention across the whole world for free
  — which deleted logistics from a game whose entire substrate is logistics. It now
  refuses beyond 34 m and names the distance and the site: _"Drift is 178 m away at
  the Sunken Flats. Drive to it."_
- `publicState` now exposes the authored `sites` table so external tools target a
  named place instead of hardcoding coordinates that drift when `WORLD_SITES` is
  retuned.

### The performance defect this uncovered

Benchmarking the step path while testing the above found the kernel running at
**18.06 ms per fixed step against a 16.7 ms frame budget** — the simulation alone
exceeded the entire frame. Cause: `ObstacleField.resolve` re-derived every candidate
obstacle from scratch on every step, and each derivation costs a `terrain.sample`
(five `height()` queries) plus a biome scan and a route projection. That is roughly
250 terrain queries per step for a field that is a pure function of the seed.

Memoising the already-pure `obstacleAt` took it to **0.286 ms/step, a 63x
improvement** (108% of frame budget to 1.7%). The renderer's prop rebuild, which
examines ~1,400 candidates, benefits by the same mechanism.

Absolute timings were taken under a machine load average of 294 (concurrent browser
suites from parallel work) and should be treated as relative, not as device numbers.

### Two corrections to earlier findings in this repo

- **The phantom playtest citations are resolved.** `PLAYTEST_SIM_*` was cited in
  three files with nothing on disk when checked; all four reports (481 lines) now
  exist and open by stating plainly that these are AI-simulated players rather than
  humans. That is the correct handling and closes the integrity defect. The
  remaining gate is unchanged and is not an integrity problem: simulated players
  cannot close a human gate, because an LLM cannot be bored and cannot close the tab.
- **A steering inversion was investigated and not confirmed in `main`.** The public
  build does steer backwards (holding left yields +1.33 rad, a clockwise turn), but
  `main` is already correct — the heading integration is `rig.heading -=`, so the
  `left - right` steer target turns left as labelled. Verified on a clean build:
  left gives N→W, right gives N→E, symmetric. An intermediate edit of mine briefly
  double-negated it; that edit was reverted. **The live site therefore trails a fix
  that already exists, and should be redeployed before the link is shared.**

### Verification

- `npm run typecheck`: clean.
- `npm test`: 141 root tests plus 7 kernel-probe tests passed.
- `npm run build`: passed.
- `npm run format:check`: passed.
- Browser: blade cut produced 21 furrows / 54 deformed cells and fill raised the same
  ground; the proximity refusal was observed with its distance message; `sites` is
  present in the text contract.

### Anything else?

The blade and the switch gate are both cases of the same thing: a capability that
already existed in the substrate and had no caller. `DEFORM_MAX` was reachable from
day one, and `selectActiveRig` always knew where the other rigs were. Before adding
a system, it is worth asking which existing one is already implemented and simply
never invoked — that search has now paid out twice in one pass.

## 2026-07-26 - renderer visibility observability

- Applied the `3d-web-experience` skill to the current Three.js delivery path and
  routed the canonical `PerformanceSnapshot.visibility` counters into the
  existing developer diagnostics instead of adding a parallel debug interface.
- The diagnostics now show submitted/candidate props, near/mid/far classifications,
  culled count, and instance-capacity pressure next to FPS, draw calls, heap, and
  runtime asset-bridge state.
- Updated the visibility and render-profile contracts with the explicit boundary:
  this is an operator-facing Tier 1 measurement seam, not dynamic profile
  selection, LOD, occlusion culling, or mobile acceptance evidence.
- No tests, typecheck, browser run, benchmark, or git operation was performed in
  this pass. Existing parallel-work evidence remains separate and preserved.

## 2026-07-26 - contextual first-use controls and integrated acceptance

- Added one rig-neutral first-use guidance resolver for drive, contextual act,
  workshop fit, blade, camera, surveyed map, nearby rig switching, and recovery.
- Lessons explain purpose plus keyboard/touch input, retire on use or dismissal,
  and persist only as the browser UI preference
  `rigs-unbound.control-lessons.v1`.
- Kept the surveyed map's fog-of-war knowledge contract; the new `M`/`Map`
  lesson introduces it when useful rather than creating an omniscient minimap.
- Rebuilt the production artifact and restarted the preview before refreshing
  visual evidence. This caught and eliminated stale-bundle screenshot evidence.
- Bounded post-report Chrome teardown in the browser acceptance harness; the
  corrected production run now exits `0` after emitting its result.
- Verified desktop and 390×844 first-use layouts in:
  - `docs/reviews/assets/control-guidance-first-use-desktop.png`
  - `docs/reviews/assets/control-guidance-first-use-narrow.png`
- Current integrated evidence:
  - `npm test`: 21 Vitest files / 167 tests and 7/7 kernel-probe tests passed.
  - `npm run test:assets`: 7/7 passed.
  - `npm run test:physics-lab`: passed with six cameras and clean console.
  - `npm run test:box3d-lab`: passed with negative left-steer heading, six
    cameras, and clean console.
  - production `npm run test:browser`: passed fresh control lesson, signed
    steering, six views, structure collision, activity/save, desktop/narrow,
    and clean-console checks.
  - current `4173` `npm run test:browser`: repeated the full flow and exited
    `0` with `consoleProblems: []`.
  - `npm run build`: passed and copied the three approved runtime assets into
    `dist/client/assets/runtime`.
- No commit, push, branch, cleanup, or deletion was performed. Parallel asset,
  rendering, exploration, and UI work remains preserved in the shared tree.

### Anything else?

The next input-layer milestone is not more hard-coded tips. It is a canonical
binding registry that can supply the permanent strip, contextual prompts,
first-use lessons, remap UI, and device glyphs from the same semantic actions.

## 2026-07-26 — collision category/mask recheck

- Re-checked the live collision lane against the current browser surface and
  the source.
- The runtime still only needs the obstacle foundation that exists today:
  - trees are fellable,
  - rocks block and slide,
  - authored structure parts remain under solver-independent collision flags.
- There is still no first-class category/mask registry in the runtime, which is
  correct for the current first-playable scope.
- The next collision proof should therefore be the first third consumer that
  actually needs pairwise admission, such as a trigger, sensor, projectile,
  pickup, or hazard.
- That keeps the contract honest: the repo has a real collision foundation, and
  the broader matrix remains a deliberate future boundary rather than a silent
  assumption.

## 2026-07-26 — streaming-world residency recheck

- Re-checked the streaming-world lane against the current world substrate.
- `src/game/gameworld.ts` still owns one canonical `GameWorld` with one terrain
  field, one obstacle field, and one exploration field.
- `src/game/storage.ts` still writes and restores that world as one composed
  payload alongside state, rather than loading or evicting chunk manifests.
- `src/game/world.ts` still defines one authored field bounded by a single
  radius and authored site set, not a streamed residency graph.
- That means the world remains intentionally single-residency.
- The next safe proof remains a bounded residency planner with a real measured
  trigger, not a broad streaming rewrite.

## 2026-07-26 — live boundary map synthesis

- Consolidated the current lane rechecks into one cross-cutting summary.
- The current split is now:
  - visibility budget: active and auditable, with `mobile-safe` fallback and a
    recovery window;
  - replay: record and verify are real, playback is still missing;
  - collision: obstacle truth is real, category/mask matrix is still future;
  - streaming: the world remains single-residency, chunk residency is still
    future-bound.
- The next implementation order remains unchanged: command/event slice, replay
  playback, collision masks, budget state/fallback beyond visibility, then a
  second capability/affordance consumer.
- The useful architectural conclusion is still the same: the repo has a real
  first-playable core, and larger systems should stay gated by measured
  pressure rather than assumed future complexity.

## 2026-07-26 — replay artifact recheck

- Re-checked the replay lane against the current repo state and the recorded
  live browser history.
- `src/game/run-record.ts` still carries the right bounded replay spine:
  versioned schema, deterministic seed, monotonic ids, replayable vs
  diagnostics-only classification, and checkpoint tick-hash validation.
- `src/main.ts` still exposes the record and verifier hooks, which keeps the
  browser in audit-log territory.
- The missing layer is still replay playback and ghost compatibility:
  - no exposed playback path,
  - no compatibility envelope,
  - no divergence report,
  - no diagnostics-vs-replay-safe trust split.
- The next replay proof should start as a debug validator or local playback
  harness before it tries to become a shareable ghost surface.

## 2026-07-26 — runtime asset resource-attribution gate

- Reconciled the runtime asset bridge with the renderer's newly exposed
  aggregate geometry/texture counters.
- The two signals deliberately remain separate:
  - bridge status and node count prove a manifest-owned GLB reached the scene;
  - aggregate counts show whole-runtime resource pressure, not per-asset VRAM.
- Documented the public-promotion evidence protocol: exact derivative bytes,
  decoded mesh/texture facts, isolated before/after/dispose captures, target
  profile budget, and fallback evidence.
- No manifest schema expansion, automatic fallback rule, asset promotion, test,
  browser run, or build was performed. The gate is Tier 1 design/static
  evidence until an asset is actually considered for public approval.

## 2026-07-26 — primary-action recorder trust-boundary correction

- Reconciled the run-record implementation against the deterministic
  command/validation/transition/event split.
- Corrected the concrete mismatch: `primaryActionOutcome` was previously
  recorded as a replayable input command even though it is the authoritative
  simulation result of an already-recorded intent.
- Added a simulation-origin, diagnostics-only `event` record kind, strict
  kind-to-envelope metadata validation, and focused coverage for valid outcome
  events plus malformed metadata rejection.
- The tap and acceptance paths now record explicit `primaryAction` intent and a
  separate `primaryActionOutcome` event. No playback, ghost API, shared event
  bus, browser run, build, or test execution was performed; current evidence is
  Tier 1 static source/test inspection.

## 2026-07-26 — bounded deterministic replay validator

- Added a renderer-free local replay validator that reconstructs the canonical
  state/world pair from a run-record seed and checks `publicState` checkpoint
  hashes after replaying only declared deterministic inputs and commands.
- The validator reports structural invalidity, malformed payloads, unsupported
  replayable entries, and divergence separately; it refuses to turn acceptance
  helpers or diagnostics into replay behavior.
- Added focused coverage for a valid command sequence, ignored simulation event,
  unsupported command, and checkpoint divergence.
- This remains a local debug proof, not browser playback, a ghost/share API,
  or a network authority layer. No test, build, browser run, or git action was
  performed; evidence is Tier 1 static source/test inspection.

## 2026-07-26 — replayable tap-command alignment

- Removed duplicated primary tap dispatch from the replayable command stream;
  the named `primaryAction` command is now the sole replay intent and its
  outcome remains a simulation diagnostic event.
- Extended the validator through canonical reducers for named non-primary tap
  actions: rig switch, camera cycle, phase, pause, map, blade, and recovery.
- Acceptance helpers, reset/storage paths, unknown actions, and legacy primary
  tap records remain explicitly rejected rather than being replayed with
  invented behavior. No test, build, browser run, or git action was performed;
  evidence is Tier 1 static source/test inspection.

## 2026-07-26 — replay validation observability hook

- Added the read-only `window.getRunRecordReplayValidation()` acceptance/debug
  hook beside structural run-record verification.
- The hook reports validator status and issue details without replaying on the
  player surface or mutating game state. Runtime/browser proof remains pending;
  no test, build, browser run, or git action was performed in this slice.

## 2026-07-26 — replay initial-context admission

- Advanced run records to schema v3 with one immutable, hash-bound initial
  state/world-memory context captured after canonical load and world settling.
- The validator now restores that admitted baseline before processing commands,
  making restored local sessions eligible for deterministic validation rather
  than silently replaying from a fresh seed.
- Added focused context-integrity and restored-context replay coverage. This is
  not a second persistence path, replay import, cross-build migration, or ghost
  share feature. No test, build, browser run, or git action was performed;
  evidence is Tier 1 static source/test inspection.

## 2026-07-26 — structured persistence provenance

- Extended the existing load/save results with source slot, source schema,
  world-memory presence, invalid-payload recovery reason, and canonical save
  key/schema facts.
- Added a storage-origin diagnostics-only boot load record and enriched save
  records without introducing another storage route or replaying durable state.
- Added focused fresh/migrated/recovered/save-provenance coverage. A restored
  save remains intentionally outside seed-only replay validation until a future
  artifact admits initial state and world-memory snapshots. No test, build,
  browser run, or git action was performed; evidence is Tier 1 static
  source/test inspection.

## 2026-07-26 — second local authority command proof

- Consolidated rig selection behind a versioned local `select-rig` command and
  immutable outcome with active-actor, stability, range, unsupported-command,
  and idempotency semantics.
- Existing tap and acceptance selection paths now retain replayable intent and
  record a separate simulation-origin selection outcome.
- Added focused accepted, inactive-actor rejection, and idempotent-target
  coverage. No test, build, browser run, network action, or git action was
  performed; evidence is Tier 1 static source/test inspection.

## 2026-07-26 — episode grammar bridged above activity contracts

- Added a durable bridge from the new episode-grammar proposal to the core
  loop, contract index, exploration map, and activity/content readiness note.
- The episode grammar now reads as a composition layer above activity
  validation, not a replacement for the lower-level activity/content threshold.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the event layer

- Added a durable bridge from the episode-grammar proposal to the event graph
  and deterministic handlers contract.
- The event layer now explicitly owns the persistent consequence side of the
  episode grammar, while the grammar itself remains the story-composition
  layer above it.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar linked to the core loop

- Linked the new compositional episode grammar proposal into the canonical
  contract index and exploration map.
- Added a core-loop addendum stating that the episode grammar composes above
  the loop rather than replacing it.
- The loop remains the canonical 30-second/session grammar; the new proposal
  now names how place, rig identity, pressure, discovery, and persistent
  consequence combine into a single authored episode.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the world-growth boundary

- Added a world-growth addendum stating the episode grammar does not define
  chunk residency, load radius, unload policy, or migration boundaries.
- The growth contract remains the lower-level policy layer until a measured
  scale trigger proves a real residency system is needed.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to tractor restoration history

- Added a tractor-restoration addendum stating the episode grammar composes
  above restoration, specialization, and module switching.
- The tractor arc still owns the machine-progression grammar; the episode layer
  now explains how lived episodes become visible machine history and scars.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to replay history

- Added a replay-contract addendum stating the episode grammar depends on
  inspectable consequence history without replacing the replay substrate.
- The replay layer now explicitly owns the audit/ghost history for what
  happened, while the episode grammar remains the story-composition layer.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to save/migration observability

- Added a save-observability addendum stating the episode grammar depends on
  persistence to carry visible machine-history changes across reloads and
  schema changes.
- The persistence envelope now explicitly owns the durability of episode
  consequence, while the episode grammar remains the story-composition layer.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to camera and visibility

- Added camera and visibility addenda stating the episode grammar depends on
  player-legibility layers to frame pressure, discovery, and consequence.
- Camera policy and visibility/LOD remain the view and budget layers; the
  episode grammar remains the story-composition layer above them.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to accessibility/input

- Added an accessibility/input addendum stating the episode grammar depends on
  named actions, remaps, and comfort policy to make player agency expressible.
- Input/accessibility remains the player-agency and comfort layer; the episode
  grammar remains the story-composition layer above it.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to operator observability

- Added an operator-diagnostics addendum stating the episode grammar depends
  on diagnostics to inspect consequence, history, and fallback.
- Operator observability remains the explainability and investigation layer;
  the episode grammar remains the story-composition layer above it.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the resource envelope

- Added a resource-envelope addendum stating the episode grammar depends on
  the fallback and pressure policy to keep episodes readable under load.
- The resource envelope remains the budget and fallback layer; the episode
  grammar remains the story-composition layer above it.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to web loading bootstrap

- Added a bootstrap addendum stating the episode grammar depends on truthful
  entry state rather than a fake or implied start state.
- The web-loading/profile bootstrap contract remains the entry-truth layer;
  the episode grammar remains the story-composition layer above it.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to progression and economy

- Added a progression addendum stating the episode grammar depends on the
  Scrap/Insight/Favor/Parts grammar and the reward schedule to leave lasting
  progression consequences.
- The progression contract remains the long-arc resource and reward layer; the
  episode grammar remains the story-composition layer above it.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to lighting and materials

- Added addenda to `docs/research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md`
  and `docs/research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md`
  stating that lighting and material posture support episode readability but do
  not replace the episode grammar.
- The lighting and material contracts remain the visual policy layers; the
  episode grammar remains the story-composition layer above them.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the optimization roadmap umbrella

- Added an addendum to `docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md`
  stating that the episode grammar sits above the roadmap’s visual policy
  lanes.
- The roadmap remains the umbrella planning surface; the episode grammar
  remains the story-composition layer above the visual policy lanes.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the performance/readability baseline

- Added an addendum to `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md`
  stating that the performance/readability baseline supports episode grammar
  but is not the episode grammar.
- The baseline remains the umbrella operator policy; the episode grammar
  remains the story-composition layer above that umbrella.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to collision policy

- Added an addendum to `docs/research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md`
  stating that collision policy supports episode grammar but the broader
  category/mask matrix remains future-bound.
- Collision remains the deterministic obstruction layer; the episode grammar
  remains the story-composition layer above that obstruction policy.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to audio presentation

- Added an addendum to `docs/research/AUDIO_PRESENTATION_AND_SPATIAL_BUDGET_CONTRACT_2026-07-26.md`
  stating that audio presentation supports episode grammar but does not own it.
- Audio remains a presentation consumer of authoritative state; the episode
  grammar remains the story-composition layer above that feedback surface.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to world affordance resolution

- Added an addendum to `docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md`
  stating that world affordance resolution supports episode grammar but is not
  the episode grammar.
- World affordance resolution remains the legality/deferred/impossible layer;
  the episode grammar remains the story-composition layer above that offer
  vocabulary.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to behavior/planner logic

- Added an addendum to `docs/research/BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md`
  stating that behavior/planner logic supports episode grammar but does not
  replace it.
- Behavior/planner logic remains the deterministic choice layer; the episode
  grammar remains the story-composition layer above that decision surface.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to simulation governance

- Added an addendum to `docs/research/SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md`
  stating that simulation governance supports episode grammar but does not
  replace it.
- Simulation governance remains the domain-order and fallback layer; the
  episode grammar remains the story-composition layer above those domains.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to streaming residency

- Added an addendum to `docs/research/STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md`
  stating that streaming residency supports episode grammar but is not the
  episode grammar.
- Streaming residency remains future-bound; the episode grammar remains the
  story-composition layer above the canonical world substrate.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to state-shell presentation

- Added an addendum to `docs/research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md`
  stating that state-shell presentation supports episode grammar but is not
  the episode grammar.
- State-shell presentation remains the readable rig-state layer; the episode
  grammar remains the story-composition layer above that visual language.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the render profile matrix

- Added an addendum to `docs/research/RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md`
  stating that the render profile matrix supports episode grammar but is not
  the episode grammar.
- The profile matrix remains the runtime visibility policy; the episode grammar
  remains the story-composition layer above that policy.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — episode grammar bridged to the event observer gate

- Added an addendum to `docs/research/EVENT_PROPAGATION_AND_PRESENTATION_OBSERVER_GATE_2026-07-26.md`
  stating that the observer gate remains the propagation boundary while the
  episode grammar stays the story-composition layer above it.
- Mirrored the same decision into `docs/exploration/EXPLORATION_MAP.md` so the
  accessibility/profile and event-sharing lanes keep the same durable boundary.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — asset public approval bridged from runtime proof

- Added an addendum to `docs/research/ASSET_PIPELINE_LIVE_REPO_ANALYSIS_2026-07-26.md`
  stating that `runtime-tested` bridge assets are browser ingestion proofs,
  while `publicRuntimeApproved` remains the separate promotion gate.
- Mirrored the same public-approval boundary into `docs/exploration/EXPLORATION_MAP.md`
  so the asset lane keeps its promotion decision separate from story
  composition and public presentation.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — procedural director bridged above episode grammar

- Added an addendum to `docs/research/PROCEDURAL_DIRECTOR_AND_GENERATED_CONTENT_ADMISSION_GATE_2026-07-26.md`
  stating that the procedural director remains a proposal layer above episode
  grammar rather than the authority for story composition or world mutation.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  director, episode-grammar, and generated-content lanes keep a shared
  proposal-vs-authority distinction.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — kernel ordering bridged to episode grammar

- Added an addendum to `docs/research/KERNEL_ORDERING_AND_MUTABLE_SUBSYSTEM_GATES_CONTRACT_2026-07-25.md`
  stating that episode grammar depends on kernel order for durable consequence
  and must consume authoritative outcomes rather than authoring state.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  kernel-ordering lane explicitly owns the mutation order beneath story
  composition.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — authoring validation bridged to episode grammar

- Added an addendum to `docs/research/AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md`
  stating that episode grammar depends on validated authored content but does
  not replace the content-manifest envelope.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  authoring/content-validation lane stays the upstream truth for runtime-ready,
  validation-only, and deprecated content states.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — ECS readiness bridged to episode grammar

- Added an addendum to `docs/research/ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md`
  stating that episode grammar composes above the current machine-centric
  composition model and that ECS remains a future migration threshold.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  ECS lane stays a proof-based threshold rather than an implicit rewrite path.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — command/event envelope bridged to episode grammar

- Added an addendum to `docs/research/COMMAND_EVENT_ENVELOPE_LIVE_REPO_ANALYSIS_2026-07-26.md`
  stating that episode grammar depends on the command/event envelope to stay
  inspectable and that the run record remains the audit spine rather than a
  second authority surface.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  command/event lane remains the shared history spine beneath story
  composition, replay, and diagnostics.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — public smoke-test gate bridged to episode grammar

- Added an addendum to `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md`
  stating that episode grammar depends on the public smoke-test gate to stay
  readable publicly and that the bundled gate artifact remains the missing
  delivery package.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  public promise row now explicitly sits beneath episode grammar.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — authority model bridged to episode grammar

- Added an addendum to `docs/research/AUTHORITY_MODEL_GROUNDWORK_CONTRACT_2026-07-25.md`
  stating that episode grammar depends on the authority model to keep
  consequence durable and that local-first authority remains the live mode.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  authority-model gate now explicitly sits beneath episode grammar.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — physics quality bridged to episode grammar

- Added an addendum to `docs/research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md`
  stating that episode grammar depends on the physics envelope to keep motion
  readable and that the current first-playable motion model remains the live
  mode.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  physics-quality lane now explicitly sits beneath episode grammar.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — session backlog provenance, arbitration, and fresh preview evidence

- Added a canonical decision register, corrected unsupported decision
  authority, and added a reusable recommendation-language audit.
- Ran `wide-open-brainstorm` with internal subagents only. Preserved the
  Champion/Executioner disagreement and proposed Unbound Passage before Signal
  Break without converting it into operator approval or removing Farmfall.
- Rebuilt the current project and ran the complete browser acceptance matrix
  against the exact preview on port `4182`.
- The first run found a stale-save race in the harness. The persistence gate
  now waits for the completed relay record itself; the corrected full run
  exited 0 with zero captured console/page problems.
- Added a second fresh first-rung profile using a real `hasTouch` mobile context
  and Chrome touch holds. It proved the driving, contextual Act, and workshop
  lessons at first relevance; touch driving to the cache and Home; touch
  collection and fitting; and visible/persisted Lug tyres after reload.
- The subsequent exact-build `4182` full matrix exited 0 with zero captured
  console/page problems. External-player comprehension and public release
  evidence remain open.

## 2026-07-26 — Farmfall source/listener and cultivation gate correction

- Started RU-0202 from the current code rather than the stale Farmfall formula.
- An adversarial review rejected the first draft because it read cached
  telemetry as authority, coupled emission to Cargo Relay, combined channels
  into a universal attraction score, owned listener falloff, and changed public
  replay snapshots without a real consumer.
- Reworked `signature.ts` into a source-only experimental fixture: named
  acoustic/illumination/thermal-proxy channels, explicit generic operating
  inputs, no activity import, no universal score/falloff, and no save/public
  state mutation. Four focused tests pass.
- Kept RU-0202 open until a real listener, operating-state semantics,
  accessible feedback, replay, browser, and performance evidence land together.
- Stopped RU-0203 implementation after proving that current deformation,
  furrows, and authored `tilled` surfaces cannot distinguish cultivation cut
  from fill/grading and that the plan's v5→v6 migration is stale.
- Added proposed ADR-0026 for semantic soil-preparation provenance and schema-v7
  ownership. Sequencing, harvest value, post-sow terrain behavior, and measured
  capacity/timing require operator sign-off.
- Removed an incomplete duplicate renderer auto-degrade path that broke
  typecheck and contradicted the existing `RuntimeProfileController` authority.

## 2026-07-26 — browser-delivery contract bridged to episode grammar

- Added an addendum to `docs/research/3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md`
  stating that episode grammar depends on browser delivery policy to keep the
  public experience readable and that the browser-first surface remains the
  live mode.
- Mirrored the same boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  public promise now explicitly sits beneath episode grammar and the browser-
  delivery contract.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — accessibility profile visibility bridged to browser delivery

- Added an addendum to `docs/research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md`
  stating that the remaining shell gap is a player-facing comfort/profile
  indicator rather than another keyboard or input fix.
- Mirrored that boundary into `docs/exploration/EXPLORATION_MAP.md` so the
  public promise also carries visible profile state instead of leaving it
  operator-only.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — map overlay focus boundary documented

- Added an addendum to `docs/research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md`
  stating that the map overlay still lacks a true dialog/focus contract even
  though it already acts as a mode switch.
- Mirrored the same browser-accessibility boundary into `docs/exploration/EXPLORATION_MAP.md`
  so the map overlay is tracked as a first-class focus-managed browser seam.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — state-shell visual language now needs a browser-proved profile owner

- Added an addendum to `docs/research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md`
  stating that the shell language still needs one browser-proved profile owner
  tied to the selected quality mode.
- Mirrored that presentation-layer boundary into `docs/exploration/EXPLORATION_MAP.md`
  so the shell stays a contract lane rather than becoming an implicit product
  promise.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — shell runtime substrate is real, but profile ownership is still unresolved

- Rechecked `src/game/renderer.ts` and `src/game/feedback.ts` to confirm the
  shell is already a real runtime substrate:
  - the renderer owns a dedicated state-shell mesh and shader envelope,
  - feedback computes integrity and impact values that feed the shell,
  - the renderer pushes those uniforms from live rig feedback each frame.
- Updated the shell-quality research note and exploration map so the remaining
  gap is now specifically browser-proved shell profile ownership, not whether
  the shell exists.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static source inspection plus documentation editing.

## 2026-07-26 — command/event envelope wording corrected to shared-graph status

- Rechecked the command/event research note and the exploration-map backlog
  entry against the live repo state.
- Corrected the exploration map so it now says the bounded event envelope is
  reusable, while the shared fan-out graph is still missing.
- This keeps the contract aligned with the current code: the run record is a
  real audit spine, but the reusable shared graph remains the unresolved layer.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static documentation inspection and editing.

## 2026-07-26 — third activity candidate narrowed for the planner boundary

- Rechecked the activity-content and planner contracts against the live
  command/state spine.
- Confirmed the repo already has two proven activity seams in source
  (`cargo-relay` and `survey-route`).
- Documented the strongest next candidate as a tow-plus-repair rescue flow,
  because it would reuse the matcher while forcing a distinct objective shape
  and recovery story.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — audio mute persistence mirrored into the exploration map

- Rechecked the audio presentation contract against the current browser shell.
- Confirmed mute already works in-session but is not yet restored from durable
  storage after reload.
- Added the missing exploration-map mirror so the audio comfort seam is
  discoverable alongside the research note and worklog entry.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — rig signature now needs a listener-owned consumer

- Rechecked the audio presentation contract against the new deterministic
  rig-emission source.
- Confirmed the source is a real fixture, but still lacks a listener-owned
  presentation path and accessible player-facing cue.
- Extended the audio research note so the next proof slice is clear: one
  readable player-facing cue before any broader scheduler is generalized.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — route-clearance contract continuation

- Rechecked the live route-clearance lane with the `3d-games` skill and the
  current terrain/state/contracts code.
- Confirmed the runtime already owns authored grade-limited corridors and a
  nearest-track recovery path, but not a general route-cost planner.
- Added a dedicated research note so the next proof slice stays narrow:
  candidate generation, capability-aware scoring, structured reasons,
  diagnostics, and replayable evidence.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — Sites version 9 released and publicly touch-accepted

- Preserved the validated first-rung release in guarded commit `a340fbd`.
- Sites version 8 failed before build because `vite-plugin-wasm@3.5.0` did not
  declare Vite 8 peer compatibility.
- Upgraded the plugin to `3.6.0`, kept Vite 8.1.5, passed a clean install and
  the full build/test/asset/format gates, then committed and pushed the scoped
  repair as `5896833`.
- Saved and deployed exact-source Sites version 9. Deployment
  `appgdep_6a66391c33ac8191905ac87775b1585e` reached `succeeded`; the default
  and Field 02 public URLs returned HTTP 200.
- Ran the complete browser matrix against public production. A fresh
  `390×844`, `hasTouch` profile drove with rendered touch controls, collected
  five salvage, returned Home, fitted Lug tyres, reloaded, and observed the
  completed state and visible module. The run exited 0 with zero captured
  console/page problems.
- Added the focused next-execution board and exact version-9 release handoff.
  External-player comprehension, release-doc commit grouping, and admission of
  the newer parallel gameplay tranche remain open.

## 2026-07-26 — browser-proved shell profile owner documented

- Applied the `Accessibility Auditor` and `3d-games` lenses to the shared
  shell/profile boundary.
- Confirmed the repo already has a real shell substrate, a runtime profile
  policy, and operator diagnostics, but still lacks one browser-proved owner
  for the public shell/profile signal.
- Added a dedicated research note and mirrored it into the exploration map so
  the state-shell lane and the accessibility/profile-visibility lane now point
  at one shared contract boundary.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — audio burst suppression is still only a prose contract

- Rechecked `src/game/audio.ts` against the bursty-event lane.
- Confirmed the current audio implementation uses disposable one-shot impacts
  and immediate acknowledgements, but no explicit duplicate-event suppression
  or cooldown owner exists yet.
- Added the missing addendum to the audio contract and mirrored it into the
  exploration map so rapid impact / interaction streams remain a named
  boundary instead of a hidden future bug.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — performance/readability bundle is now a named draft artifact

- Rechecked the umbrella performance/readability baseline against the current
  repo state and the existing live-snapshot trail.
- Confirmed the draft operator bundle now exists at
  `docs/reviews/PERFORMANCE_READABILITY_OPERATOR_BUNDLE_2026-07-26.md` and
  packages the already-recorded frame, draw, terrain, heap, readiness, and
  save signals into one readable operator surface.
- Mirrored that draft into the exploration map and the baseline contract so
  the repo now has a single named place to point at while the representative-
  device capture remains outstanding.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — world schema/content ingestion gate is now mirrored into the live map

- Rechecked the authored-world lane against `src/game/world.ts` and the new
  world-schema/content ingestion gate.
- Confirmed the canonical world layout still lives in typed source and that
  external content remains staged behind a future admission pipeline rather than
  being treated as a second truth source.
- Mirrored the gate into the exploration map so the repo now has one durable
  place to point at for authored world truth versus future pack/region input.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — operator diagnostics stay a developer evidence lane

- Rechecked the operator-observability contract against the current repo
  state and the existing acceptance/debug evidence surfaces.
- Confirmed the repo already has the right separated pieces for local
  acceptance evidence, including the public snapshot, run record, replay
  verifier, performance snapshot, runtime profile selection, asset evidence,
  and developer diagnostics DOM panel.
- Mirrored that contract into the exploration map so the repo keeps one
  durable place to point at for the rule that diagnostics extend evidence
  surfaces instead of becoming a second authority.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — event history is canonical, but dispatch ownership is still future work

- Rechecked the event-graph contract against the current record/history path
  and the new versioned run-record envelope.
- Confirmed the runtime already has a canonical event-history substrate, but
  it still stages the graph rather than providing a shared dispatch/ownership
  model.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the rule that record history is real while
  handler fan-out and consumer ownership remain future work.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — capability composition is live, but governance is still implicit

- Rechecked the capability contract against `src/game/contracts.ts`,
  `src/game/state.ts`, and the structured admission envelope added for the
  relay-cargo path.
- Confirmed the runtime is composition-first: base rig profiles plus fitted
  modules still drive capability admission, and the first structured denial
  envelope is backed by that path.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between live composition and
  still-implicit governance structure.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — the public smoke-test gate is observable, but the bundled artifact is still missing

- Rechecked the renderer/performance/accessibility contract against the current
  repo state and the live gate hooks.
- Confirmed the runtime already exposes the core public-smoke-test evidence
  surface, but the bundled public-gate artifact is still missing as a single
  reusable package.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between an observable gate and
  a packaged public-release artifact.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — physics stability is real, but the envelope is still implicit

- Rechecked the physics quality envelope contract against `src/game/physics.ts`
  and `src/game/terrain-traversal.ts`.
- Confirmed the runtime already has a deliberate first-playable motion model,
  and the terrain-face refusal is now a real traversal-block reason in code.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between real stability signals
  and a still-implicit physics envelope.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — persistence provenance is structured, but the broader envelope still matters

- Rechecked the save/migration observability contract against `src/game/storage.ts`
  and the structured persistence-provenance update already landed in the
  contract.
- Confirmed the runtime now preserves source key, source schema version,
  world-memory presence, and recovery reason at the canonical persistence
  boundary.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between structured provenance
  and the still-missing operator summary envelope.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — lighting is live and readable, but the policy envelope is still implicit

- Rechecked the lighting and atmosphere contract against `src/game/renderer.ts`
  and the live Field 02 runtime snapshots.
- Confirmed the runtime already keeps the field legible across day/gloam/night
  with the current conservative lighting posture.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between a readable lighting
  system and a still-implicit policy envelope.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — shader/material is live, but the state shell remains a narrow shader

- Rechecked the shader/material contract against `src/game/renderer.ts` and
  the current live runtime posture.
- Confirmed the renderer still uses a readable baseline plus one scoped,
  state-driven VFX shader, so the visual language is real but intentionally
  narrow.
- Mirrored that boundary into the exploration map so the repo keeps one
  durable place to point at for the distinction between a narrow state-shell
  shader and a general material system.
- No test, build, browser run, or git action was performed; evidence remains
  Tier 1 static inspection and documentation editing.

## 2026-07-26 — integrated schema-v7 keyboard/touch matrix passed

- Froze the corrected production build at
  `/tmp/rigs-unbound-acceptance.c6sHjF` and served it on `4191`; this avoided
  concurrent Vite rebuilds invalidating shared `dist` hashes during the browser
  run.
- Corrected the browser harness so narrow touch layout is inspected in its real
  `hasTouch`/coarse-pointer context rather than a resized desktop context.
- Corrected the main prompt so an executable in-range salvage action is not
  hidden by ambient Home workshop copy. The semantic action resolver remains
  the single owner for desktop, touch, ARIA, lesson, and mutation.
- Full browser acceptance exited zero with no captured console/page problems.
  It covered keyboard and real-touch first rung, six cameras, front/forward
  alignment, authored collision, three-rig terrain-face refusal and downhill
  escape, cargo relay, ramp, reduced motion, recovery, save/reload, and
  `390×844` layout.
- Verification:
  - `npm test`: 31 files / 267 tests plus 7/7 kernel tests passed;
  - `npm run typecheck`: passed;
  - `npm run build`: passed, with the known Three.js chunk advisory;
  - `npm run test:assets`: 9/9 passed;
  - `npm run assets:preflight`: zero findings;
  - `npm run format:check`: passed after scoped formatting;
  - `git diff --check`: passed.
- Added
  `docs/reviews/INTEGRATED_ADMISSION_MATRIX_2026-07-26.md` and linked B7 to it.
  External-player comprehension, representative-device performance, replay
  truth, operator decisions, commit/push, and public deployment remain open.

## 2026-07-26 — replay truth and real-touch fixed-step reconstruction passed

- Added run-record schema 4 replay classes: `supported`, `diagnostic`, and
  `non-replayable`.
- Unknown or acceptance-only state-changing commands no longer masquerade as
  diagnostics or produce a false `verified` result.
- Added canonical replay handling for repair and reset; acceptance blade, map,
  and recovery helpers now record the same semantic tap commands as real input.
- A real-touch first-rung replay initially diverged after 130 input samples by
  `0.001` in two wheel-compression values. The cause was accumulated
  floating-point partial steps at elapsed values that represented exact fixed
  ticks.
- Added fixed-step alignment within `0.001 ms`, a 240-transition regression
  test, compact checkpoint difference paths, and
  `tools/replay-record-inspect.ts`.
- The captured 252-entry touch record then verified with 225 inputs, three
  commands, and thirteen checkpoints.
- Final frozen browser evidence on `4193` passed the full matrix with zero
  captured console/page problems. It verified the real-touch first rung,
  verified canonical post-reload history, and rejected a later acceptance-only
  `placeRig` as `unsupported-entry`.
- Full verification: 31 Vitest files / 275 tests, 7/7 kernel tests, typecheck,
  production build, and player-asset boundary passed.
- During the verification window, concurrent work reintroduced a
  tractor/blade-specific `first-cut` requirement into the universal first rung.
  That contradicted B2 and broke typecheck plus two first-rung tests. The
  rig-neutral “any first compatible fit completes the rung” contract was
  restored; terrain transformation remains a separate capability proof.

## 2026-07-27 — route-opening proof hardened against live terrain variance

- Reworked `src/game/route-opening.test.ts` so the proof searches the live
  terrain for any mud cell that still becomes tilled under a two-pass probe,
  instead of relying on a narrow height band and a longer water-edge corridor.
- The traversal comparison now measures the same patch before and after local
  deformation, with the live scenario using three cuts on the chosen patch,
  which matches the actual terrain contract more closely and keeps the proof
  seed-stable.
- Verification:
  - `npm run typecheck`: passed;
  - `npx vitest run src/game/route-opening.test.ts src/game/unbound-passage.test.ts`: passed.

## 2026-07-27 — unbound passage made first-class in state and persistence

- Added `unboundPassage` to the canonical `GameState`, seeded it in
  `createInitialState`, restored it through the reducer's own validation helper,
  and exposed the read model in `publicState` under progression.
- The player-facing snapshot now reports whether the currently active rig can
  inherit the route opened by another rig, which makes the passage benefit
  visible without a second truth source.
- Current saves missing `unboundPassage` restore to a fresh contract rather
  than failing or inventing a second owner, so the field remains additive for
  older local records.
- Added coverage for the new state contract and save/load round-trip.
- Verification:
  - `npm run typecheck`: passed;
  - `npx vitest run src/game/state.test.ts src/game/storage.test.ts src/game/unbound-passage.test.ts`: passed.

## 2026-07-27 — same-vehicle comparison boards cross-linked into exploration docs

- Added the new farming-versus-racing, survival-versus-construction, and
  urban-versus-absurd comparison boards to the exploration map, atlas, and
  prompt-sheet evidence trail.
- These boards are now treated as exploration evidence for identity continuity,
  not as runtime assets or passage admission surfaces.
- Registered the same-vehicle comparison board set in the asset provenance
  register with hashes, dimensions, and linked documentation.

## 2026-07-27 — 3D optimization gap reread ingested into research trail

- Appended a dated addendum to
  `docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md` to
  capture the new reread of the "3D Game Optimization Gaps" thread.
- The addendum keeps the repo-local ordering clear: deterministic kernel and
  simulation/render split first, then capability contracts, command/event
  separation, storage/migration, observability, and only later streaming or
  multiplayer expansion.
- No runtime files were touched in this research-only pass.

## 2026-07-27 — research landing pages now point at the reread addendum

- Added the ingestion note to the top-level research landing pages so the new
  2026-07-27 reread is discoverable from the main research entry points.
- The master synthesis and the research README now both point at
  `docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md`.

## 2026-07-27 — legacy 3D audits bridged to the reread addendum

- Added explicit 2026-07-27 addenda to the older long-term analysis/audit docs
  so the updated ordering is discoverable from those legacy entry points too.
- The platform audit, second-pass audit, and broad long-term analysis now all
  point readers back to the reread archive in
  `docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md`.
- The execution roadmap now carries the same bridge so the implementation lane
  and the analysis lane stay aligned.

## 2026-07-27 — parallel review and skill ledger now bridge to the reread

- Added the same 2026-07-27 reread bridge to the parallel review addendum and
  the skill-to-repo execution ledger so the remaining canonical research paths
  point back to the addendum instead of leaving the update isolated.

## 2026-07-27 — Three.js animation implementation flow left parallel-owned

- A new untracked implementation-flow doc surfaced in the live tree at
  `docs/research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md`.
- It is runtime implementation evidence from the parallel lane, not part of the
  canonical research bridge work, so it remains untouched in this pass.
- Keeping that boundary explicit preserves the long-term research trail without
  colliding with the live implementation tranche.

## 2026-07-27 — canonical research sweep for the reread addendum is clean

- Re-swept the canonical research docs for remaining `3D Game Optimization
  Gaps` references that lacked the reread bridge.
- No additional canonical research doc needed a bridge after the earlier
  updates; the remaining live outlier is the parallel-owned implementation-flow
  note, which stays isolated.

## 2026-07-27 — additional runtime tranche surfaced and remains parallel-owned

- New untracked runtime modules appeared in the live tree:
  `src/game/barometric-engine.ts`, `src/game/debris-physics.ts`,
  `src/game/electrical-grid.ts`, and `src/game/expedition-economy.ts`.
- A second set of untracked runtime modules also surfaced:
  `src/game/fuel-efficiency.ts`, `src/game/salvage-crafting.ts`,
  `src/game/surface-moisture.ts`, and `src/game/winch-pulley.ts`.
- Matching untracked tests surfaced for both groups of modules.
- These look like a parallel implementation tranche, not canonical research
  material, so they remain untouched in this pass and are recorded here only as
  boundary evidence.

## 2026-07-27 — current untracked artifacts are now classified by lane

- Exploration evidence: the same-vehicle comparison boards remain project-owned
  exploration reference art and stay tied to the provenance register.
- Exploration evidence: the new
  `docs/exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
  note is canonical exploration guidance and is already linked from the
  exploration map.
- Research evidence: the Three.js animation implementation flow remains
  parallel-owned implementation evidence and stays outside the canonical
  research bridge.
- Runtime evidence: the new barometric, debris, electrical-grid, and
  expedition-economy modules plus tests remain parallel-owned implementation
  tranche work and are left untouched.

## 2026-07-27 — parallel runtime tranche now maps to simulation and budget contracts

- The new runtime tranche is now tied back to the existing simulation-layer and
  resource-envelope contracts as future-facing evidence.
- This keeps the architecture trail current without promoting the untracked
  implementation files into canonical repo truth.

## 2026-07-27 — parallel review addendum now names the broader runtime tranche

- The canonical parallel review addendum now classifies the atmospheric,
  debris, electrical-grid, expedition-economy, fuel-efficiency,
  salvage-crafting, surface-moisture, and winch-pulley modules as parallel-owned
  implementation evidence.
- The research canon stays clean; the runtime lane stays independent.

## 2026-07-27 — first-principles exploration note is canonical exploration guidance

- The new `docs/exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
  note is already linked from the exploration map, so it belongs in the
  canonical exploration lane rather than the runtime implementation lane.
- It broadens the design thesis while remaining a recommendation, not an
  accepted ADR.

## 2026-07-27 — exploration syntheses bridged to the first-principles note

- Added dated addenda to the systems-analysis and big-idea exploration docs so
  they explicitly point readers at the new long-term first-principles synthesis.
- The original documents remain intact; the new note is treated as the broader
  exploration horizon rather than a replacement.

## 2026-07-27 — next-tranche arbitration now points at the first-principles horizon

- Added a dated addendum to the next-tranche arbitration so it explicitly uses
  the long-term first-principles note as the broader strategic horizon.
- The arbitration still owns the near-term portability test and sequencing gate.

## 2026-07-27 — wide-open brainstorm now points at the first-principles horizon

- Added a dated addendum to the broad brainstorm so it explicitly points at
  the new long-term first-principles exploration synthesis.
- The brainstorm remains the diagnostic and critique surface; the new note
  carries the broader machine-keeper horizon.

## 2026-07-27 — vision synthesis now points at the first-principles horizon

- Added a dated addendum to the next-proof vision synthesis so it explicitly
  uses the long-term first-principles note as the broader horizon for the
  Farmfall proof ladder.
- The vision doc still owns the sequencing and acceptance rationale; the new
  note carries the broader machine-keeper thesis.

## 2026-07-27 — open-world brainstorm now points at the first-principles horizon

- Added a dated addendum to the open-world vehicle brainstorm so it explicitly
  uses the long-term first-principles note as the broader horizon.
- The brainstorm still owns the generative idea surface; the new note carries
  the wider machine-keeper platform direction.

## 2026-07-27 — visual direction now points at the first-principles horizon

- Added a dated addendum to the visual-direction preference doc so it
  explicitly uses the long-term first-principles note as the broader horizon
  for art direction and camera readability.
- The visual-direction doc still owns the preferred signals and runtime camera
  hypotheses; the new note carries the broader machine-keeper thesis.

## 2026-07-27 — execution board now points at the first-principles horizon

- Added a dated addendum to the next execution board so it explicitly uses the
  long-term first-principles note as the broader horizon for sequencing and
  long-term direction.
- The execution board still owns the current gating and sequencing decisions;
  the new note carries the wider machine-keeper thesis.

## 2026-07-27 — top-level research syntheses now point at the first-principles horizon

- Added dated addenda to the master 3D synthesis and the long-term potential
  analysis so they explicitly use the long-term first-principles note as the
  broader horizon.
- Those docs still own the research map and broad analysis frame; the new note
  carries the wider machine-keeper thesis and long-range product direction.

## 2026-07-27 — platform audit and execution roadmap now point at the first-principles horizon

- Added dated addenda to the platform long-term audit and execution roadmap so
  they explicitly use the long-term first-principles note as the broader
  horizon.
- Those docs still own the platform-risk frame and delivery order; the new note
  carries the wider machine-keeper thesis and long-range product direction.

## 2026-07-27 — top-level tracker and strategic synthesis docs now point at the first-principles horizon

- Added dated addenda to the master execution tracker, long-term optimization
  synthesis, reclamation strategic synthesis, and multi-skill possibility audit
  so they explicitly use the long-term first-principles note as the broader
  horizon.
- Those docs still own their current execution, synthesis, and decision frames;
  the new note carries the wider machine-keeper thesis and long-range product
  direction.

## 2026-07-27 — current-state audit and execution ledger now point at the first-principles horizon

- Added dated addenda to the current-state execution audit and skill-to-repo
  execution ledger so they explicitly use the long-term first-principles note
  as the broader horizon.
- Those docs still own the current runtime and skill guidance frames; the new
  note carries the wider machine-keeper thesis and long-range product direction.

## 2026-07-27 — UI master synthesis now points at the first-principles horizon

- Added a dated addendum to the UI master synthesis so it explicitly uses the
  long-term first-principles note as the broader horizon for UI architecture
  and control contracts.
- The UI synthesis still owns the information-display and interaction frame;
  the new note carries the wider machine-keeper thesis and long-range product
  direction.

## 2026-07-27 — rendering-economy and command/event envelope notes now point at the first-principles horizon

- Added dated addenda to the rendering-economy note and the command/event
  envelope analysis so they explicitly use the long-term first-principles note
  as the broader horizon.
- Those docs still own the frame-budget and replayability-envelope frames; the
  new note carries the wider machine-keeper thesis and long-range product
  direction.

## 2026-07-27 — asset-pipeline and WebGPU/performance analyses now point at the first-principles horizon

- Added dated addenda to the asset-pipeline analysis and WebGPU/performance
  analysis so they explicitly use the long-term first-principles note as the
  broader horizon.
- Those docs still own the asset-provenance and performance/fallback frames;
  the new note carries the wider machine-keeper thesis and long-range product
  direction.

## 2026-07-27 — UI reference and Kenney asset audit now point at the first-principles horizon

- Added dated addenda to the UI reference analysis and Kenney asset audit so
  they explicitly use the long-term first-principles note as the broader
  horizon.
- Those docs still own the field-kit/diegetic-interface and asset provenance /
  public-approval frames; the new note carries the wider machine-keeper thesis
  and long-range product direction.

## 2026-07-27 — runtime handoff now names the interaction boundary separately

- Added a dated addendum to the parallel runtime handoff so `src/game/interaction.ts`
  is explicitly classified as a separate runtime-owned boundary alongside the
  animation file.
- The runtime lane remains outside the passage/state tranche; the handoff now
  keeps the ownership split readable for the next agent.

## 2026-07-27 — renderer integration confirms the animation/interaction runtime lane

- Re-checked `src/game/renderer.ts` and confirmed it already imports
  `src/game/animation.ts` and initializes the interaction system.
- That keeps animation and interaction together as a coherent
  presentation/interaction lane, separate from the canonical passage/state
  tranche.

## 2026-07-27 — parallel review addendum now names the interaction boundary too

- Added a dated addendum to the parallel review addendum so the new
  `docs/research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md`
  artifact is explicitly classified alongside `src/game/animation.ts` as
  runtime-owned evidence.
- The canonical research trail now matches the handoff note on the ownership
  split, keeping the research canon and live lane consistent even though the
  earlier `src/game/interaction.ts` source file is no longer present in the
  current tree.

## 2026-07-27 — same-vehicle comparison boards now point at the first-principles horizon

- Added a dated addendum to the same-vehicle comparison boards so they
  explicitly use the long-term first-principles note as the broader horizon.
- The boards still own the paired-mode identity evidence; the new note carries
  the wider machine-keeper thesis and long-range product direction.

## 2026-07-27 — runtime tranche now includes hazard, missions, UI, and maintenance modules

- Added dated addenda to the parallel runtime handoff and parallel review
  addendum so the newly surfaced `src/game/landslide-hazard.ts`,
  `src/game/procedural-missions.ts`, `src/game/radial-ui.ts`, and
  `src/game/vehicle-maintenance.ts` modules are classified as parallel-owned
  runtime evidence.
- The canonical simulation/persistence boundary remains unchanged while the
  live runtime lane grows.
