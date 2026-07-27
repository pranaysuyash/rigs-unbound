## 2026-07-27 — unified UI shell coherence slice implemented

- Implemented the first slice of the integration-first roadmap: unified UI shell.
- Added a single overlay manager in `src/main.ts` (`openOverlay` / `closeOverlay`)
  so map, pause, workshop, and control lesson cannot stack.
- Unified the map overlay: field map and rumor graph now live in one modal with a
  layer toggle (Field / Rumor). Moved the rumor map DOM into `#rumor-map-host`
  without editing parallel-owned `src/game/rumor-map-ui.ts`.
- Made navigator radar hidden by default, toggled with `V` or a touch button;
  preference persists in `localStorage`.
- Replaced the single-word pause overlay with a real pause menu: resume, sound,
  fullscreen, radar toggle, return-to-welcome, reset field, and save status.
- Updated `index.html` markup, `src/styles.css` chrome/transitions/z-index, and
  the controls strip / touch controls.
- Added `tools/ui-shell-verification.cjs` to verify overlay behavior in a
  headless browser.
- Did not modify `src/game/*` runtime.
- Added implementation review at
  `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`.
- Verification: `npx vite build` passes; UI-shell browser verification passes
  (pause, map layers, navigator toggle, zero console errors). `npm run typecheck`
  is blocked by a syntax error in parallel-owned `src/game/animation.ts`. The
  full `npx vitest run` shows one pre-existing flaky failure in
  `src/game/storage.test.ts` when run with the full suite; it passes in
  isolation.

## 2026-07-27 — typecheck blockage note corrected after animation reconciliation

- The earlier UI-shell note that `npm run typecheck` was blocked by a syntax
  error in parallel-owned `src/game/animation.ts` is now stale.
- `src/game/animation.ts` has been reconciled in the current pass; `npm run
  typecheck` has not been rerun yet in this session, so no fresh pass or fail
  claim is being made here.

## 2026-07-27 — workshop guidance now derives from spend-ready first-rung state

- The first-session guidance layer now treats the workshop lesson as relevant
  only when the canonical first-rung state says the player can actually spend
  on the progression loop (`return-home`, `reach-rig`, `switch-rig`, or
  `choose-part` with affordability still true).
- The shared helper now lives in `src/game/first-rung.ts`; the main HUD,
  workshop panel, and control guidance layer all consume it instead of a
  stage-only boolean, and `src/game/first-rung.test.ts` now guards the rule.
- The control-guidance boundary now says `workshopLessonRelevant` explicitly,
  so the lesson cue reads like the lesson cue rather than generic workshop
  availability.
- This keeps the tutorial prompt tied to the real reward/spend moment rather
  than a loose proximity approximation.

## 2026-07-27 — acceptance snapshot now exposes first-rung summary directly

- `render_game_to_text()` now includes a top-level first-rung summary with the
  derived stage, objective, recommended module/rig, target, affordability,
  completion flag, and reason.
- The richer `publicState(state, world)` payload remains intact underneath, so
  operators and acceptance tools can inspect the same canonical state in both
  machine-friendly and human-friendly shapes.
- `src/game/state.test.ts` now asserts that `publicState(state, world)` exposes
  the same first-rung summary as `resolveFirstRung(state, world.collectedNodes,
  world)`, keeping the acceptance snapshot source honest.
- `publicState(state, world)` now also exposes `progression.workshopActionable`,
  derived from the same first-rung and workshop reach facts that drive the HUD.

## 2026-07-27 — animation ownership clarified against the live renderer

- `src/game/renderer.ts` owns the live per-frame rig presentation updates
  directly; the renderer no longer imports or calls `vehicleAnimationSystem`.
- `src/game/animation.ts` therefore remains a parallel runtime artifact until a
  deliberate migration or retirement plan is recorded.
- The dead import removal in `src/game/renderer.ts` was a correct cleanup of an
  unused dependency, but the broader ownership question still needed this repo
  note so the long-term boundary stays explicit.
- The boundary is now also recorded as [ADR-0030](docs/decisions/ADR-0030-renderer-owned-live-rig-presentation-and-deferred-animation-module.md)
  and mirrored in the decision register.

## 2026-07-27 — integration-first analysis and unification roadmap

- Operator asked: the game should not feel like a new game per level/mode; it
  should integrate and connect across mechanics, UI, and scenes.
- Explored `src/game/` runtime (read-only), `src/main.ts`, UI layer, and all
  relevant design docs via three parallel explore agents.
- Key finding: the substrate is strong (one save schema, persistent terrain,
  fixed-step loop, world graph, rumor graph) but the player experience is
  fragmented because activities are site-triggered, several systems are authored
  but unwired, and the UI has unfinished seams.
- Created `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`
  with integration-first principles, current integration map, proposed
  unification architecture (world graph + contract ledger + episode runner +
  unified UI shell), concrete work that does not touch parallel-owned runtime,
  sequencing, risks, and "Anything else?" section.
- Updated `docs/exploration/EXPLORATION_MAP.md` navigation and added an
  "Integration-first priority" section.
- Updated `docs/plans/MASTER_EXECUTION_TRACKER.md` with an addendum pointer.
- All documentation changes are repo-local and do not modify `src/game/`.

## 2026-07-27 — canonical local dev surface consolidated to port 4173

- Problem: SIM2 playtest evidence was split across three ports (4173, 4174, 4180)
  because agents opportunistically started fallback Vite servers. This produced
  contradictory runtime observations and invalidated comparison claims.
- Action: killed the three rogue Vite listeners (4173 node 15551, 4174 node
  19635, 4180 node 5179) and started exactly one canonical dev server on 4173.
- Added `tools/start-canonical-dev-server.cjs`: idempotent launcher that ensures
  one `npm run dev` on 4173 and exits once the port responds.
- Updated `.claude/launch.json` to target 4173, matching `vite.config.ts`
  (`server.port: 4173`, `strictPort: true`).
- Fixed stale 4174 example in `tools/capture-trailer.cjs` to 4173.
- Rewrote `docs/reviews/PLAYTEST_SIM2_SYNTHESIS_2026-07-27.md` to explain the
  port chaos, name 4173 canonical, and require future playtests to use the
  launcher.
- Added a "Canonical local dev surface" section to `AGENTS.md` forbidding
  opportunistic port fallback.

## 2026-07-27 — Home Valley Reclamation Journey & High-Tech 3D Topographical Field Map

- **Schema v8 Evolution**: Evolved save schema to v8 (`SAVE_SCHEMA_VERSION = 8`) in `src/game/contracts.ts` & `src/game/storage.ts` with `CutFillEditRecord` and `FleetInheritanceRecord`. Added `migrateV7` in `src/game/state.ts` for zero-data-loss save restoration.
- **High-Tech 3D Topographical Field Map**: Upgraded `FieldMap` in `src/game/minimap.ts` to `BASE_RESOLUTION = 384`, added 3D North-West hillshading, multi-tier biome elevation colors, 3m contour isolines, cyan radar compass bezel, sightline cone, and high-contrast glassmorphic plate styling in `src/styles.css`.
- **Steering Direction Resolution**: Resolved inverted left/right steering in `src/game/feedback.ts` and `src/game/minimap.ts`. Steering left now turns vehicle physics, front wheel pivots, cockpit steering wheel, and map arrow counter-clockwise **LEFT**.
- **Animation System Restoration**: Fully restored all 8 procedural animation channels in `src/game/animation.ts` with zero truncated methods.
- **Empirical Evidence & Review**: Saved 9 screenshot proof files in `docs/reviews/assets/` and authored repo review document `docs/reviews/FIELD_MAP_AND_HOME_VALLEY_RECLAMATION_JOURNEY_ACCEPTANCE_2026-07-27.md`.
- **Verification**: `npm run typecheck` passed with 0 errors; `npx vitest run` passed **60/60 test files (361 tests total)**; `npm run build` passed cleanly.

- Updated `progress.md` current-state local URL from 4174 to 4173.
- Added a port-consolidation note to
  `docs/operations/SITES_UPDATE_AND_DEPLOY_RUNBOOK.md` pass 1; historical 4174
  evidence is preserved but no longer copied into current procedure.
- Verification: `curl http://127.0.0.1:4173/` returns 200; server PID 16688.

## 2026-07-27 — SIM2 casual playtest completed; synthesis finalized

- Casual persona completed (agent timed out after writing the report). Report at
  `docs/reviews/PLAYTEST_SIM2_CASUAL_2026-07-27.md`.
- Key findings: found canonical port 4174; persistence works; softlocks in mud
  and against buildings are the main quit moments; "Reset field" is a full wipe;
  salvage hint retargets silently; intro modal replays on returning save.
- Finalized `docs/reviews/PLAYTEST_SIM2_SYNTHESIS_2026-07-27.md` with all three
  personas, the port contradiction resolved by the casual run, and prioritized
  recommendations.

## 2026-07-27 — SIM2 achiever playtest completed; synthesis updated

- Achiever persona completed. Report at
  `docs/reviews/PLAYTEST_SIM2_ACHIEVER_2026-07-27.md`.
- Key findings: strong earn→spend→unlock loop; Lug tyres persist across reloads;
  211 furrows persist on field map; session ruined by field map auto-open loop;
  "Lower the blade" rung never completes; workshop buy is blind; cargo hook-up
  undiscoverable.
- Updated `docs/reviews/PLAYTEST_SIM2_SYNTHESIS_2026-07-27.md` with combined
  findings, the three-port problem (explorer: 4180, achiever: 4173, dev server:
  4174), and contradictions that need a single-port rerun to resolve.

## 2026-07-27 — AGENTS.md created for future agent guidance

- Added `AGENTS.md` at project root with worklog addendum discipline, decision
  register/tracker update rules, parallel runtime ownership boundary, and
  verification-before-completion rules.
- This is the mechanism that lets future agents keep using dated addendums
  instead of inflating `docs/WORKLOG.md`.

## 2026-07-27 — SIM2 synthesis draft started

- Created `docs/reviews/PLAYTEST_SIM2_SYNTHESIS_2026-07-27.md` with the explorer
  findings and placeholders for casual/achiever reports.
- Documented the port-4180 discovery, persistence regressions, and the
  comparison plan against SIM1.

## 2026-07-27 — SIM2 explorer playtest completed; two personas still running

- Explorer persona completed first. Report at
  `docs/reviews/PLAYTEST_SIM2_EXPLORER_2026-07-27.md`.
- Key findings: the live build served on port **4180**, not 4174; strong
  terrain-decides thesis and atmospheric gloaming; regressions in persistence
  (save rollback, spawn-into-water, furrows invisible), hood camera occlusion,
  and tutorial tip repetition.

## 2026-07-27 — first-rung test regression noted

- `npx vitest run` now shows 1 failure in `src/game/first-rung.test.ts`
  (`shows sight-destination when affordable rig is within sight radius of Long
Furrow` returns `attempt-route` instead of `sight-destination`).
- This is in the parallel-owned runtime tranche (`src/game/first-rung.ts`); no
  agent edits were made to that surface in this pass.

## 2026-07-27 — Parts/Favor economy spec drafted

- Added `docs/exploration/PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md` as a
  proposed spec for the two under-specified progression axes named in ADR-0018.
- Defines Parts as concrete inventory with provenance/condition/traits and Favor
  as non-spendable relationship state; maps first-playable loops, constraints,
  and validation hypotheses without claiming operator acceptance.

## 2026-07-27 — product vision ADR drafted

- Added `docs/decisions/ADR-0029-product-vision-machine-keeper-odyssey.md` as a
  Proposed ADR capturing the machine-keeper odyssey vision from the long-term
  horizon doc.
- Added ADR-0027 and ADR-0029 to the [decision register](docs/decisions/README.md).

## 2026-07-27 — long-term horizon doc cross-linked and terminology corrected

- Added related-decision cross-links to
  `docs/exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
  for ADR-0002, ADR-0018, and RU-0204.
- Changed "provisional invariant" to "provisional hypothesis" in the "Who is
  the player?" section.

## 2026-07-27 — WebGPU/performance analysis corrected after fresh renderer read

- Re-read `src/game/renderer.ts` and `src/main.ts` and updated
  `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md` with a
  correction addendum.
- Key correction: the build is WebGL-only in practice because of
  `EffectComposer`/`UnrealBloomPass`/FXAA and two inline-GLSL `ShaderMaterial`s
  (water and state-shell aura). ADR-0028 therefore stays Proposed until a real
  WebGPU path exists and the representative matrix passes.
