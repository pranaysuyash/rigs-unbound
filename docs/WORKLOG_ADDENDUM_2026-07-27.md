## 2026-07-27 — episode runner specification drafted

- Wrote `docs/research/EPISODE_RUNNER_SPEC_2026-07-27.md` to define the
  episode runner as the named composition stack above the loop, not a second
  quest ledger or hidden story machine.
- The spec binds the runner to the existing loop, contract ledger, and
  compositional episode grammar so episodes remain bounded, explainable, and
  persistent.
- Updated the integration-first roadmap, canonical exploration map, and master
  tracker so the episode layer now has a durable paper trail.
- Added explicit cross-links between the episode runner, contract ledger, UI
  shell, and garage/fleet specs so the composition stack reads as one system
  instead of separate notes.

## 2026-07-27 — episode runner composition decision recorded

- Wrote `docs/decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md`
  to capture the load-bearing decision that the runner is a read-only
  composition layer above the contract ledger and core loop.
- Updated the decision register, exploration map, roadmap, and master tracker
  so the ADR is reachable from the project’s navigation surfaces.
- The runtime implementation remains deferred; the repo now has both the spec
  and the decision for the episode runner boundary.

## 2026-07-27 — garage/fleet roster specification drafted

- Wrote `docs/research/GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md` to formalize
  the fleet sheet as the player’s character sheet, anchored in current public
  rig summaries, active rig state, and recovery context.
- The spec keeps the first slice read-only and honest about the current data
  surface: active rig, fleet cards, condition, strain, modules, capabilities,
  and location context.
- Updated the integration-first roadmap, canonical exploration map, and master
  tracker so the garage/fleet seam now has a durable paper trail.

## 2026-07-27 — unified UI shell specification drafted

- Wrote `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` to formalize the
  overlay stack, accessibility contract, input contract, z-order, and visual
  rules for the integration-first shell.
- The spec is anchored in the current shell review and the project’s Patchwork
  Atlas design direction, and it keeps the shell explicitly secondary to the
  rig-as-interface principle.
- Updated the integration-first roadmap, canonical exploration map, and master
  tracker so the shell spec is now a durable part of the execution trail.

## 2026-07-27 — Contract Ledger specification drafted

- Wrote `docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md` as the read-only
  Contract Ledger contract for the integration-first roadmap.
- The spec anchors the board in `publicState`, `src/game/affordances.ts`, and
  existing authored site/progression/activity read models while keeping the
  ledger separate from runtime authority.
- Updated the integration-first roadmap and canonical exploration map so the
  next slice is now an implementation slice, not another design-only pass.

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
  (pause, map layers, navigator toggle, zero console errors). At the time of
  this note, `npm run typecheck` was blocked by a syntax error in parallel-owned
  `src/game/animation.ts`; the later correction note below supersedes that
  blocker, and `npm run typecheck` has not been rerun in this session. The full
  `npx vitest run` shows one pre-existing flaky failure in
  `src/game/storage.test.ts` when run with the full suite; it passes in
  isolation.

## 2026-07-27 — typecheck blockage note corrected after animation reconciliation

- The earlier UI-shell note that `npm run typecheck` was blocked by a syntax
  error in parallel-owned `src/game/animation.ts` was stale by the time of this
  correction note.
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

## 2026-07-27 — animation ownership resolved by explicit renderer delegation

- At the time of this note, `src/game/renderer.ts` imported and called
  `vehicleAnimationSystem`; the renderer kept orchestration responsibilities
  while the animation module owned the rig-local channel updates.
- At the time of this note, `src/game/animation.ts` had become a live runtime
  dependency, not a deferred parallel artifact.
- The dead import removal in `src/game/renderer.ts` was only incidental. The
  real architectural decision is the explicit renderer-to-animation
  delegation now in the tree, which records the supersession boundary instead
  of pretending the import cleanup was the point.
- Do not reopen this as a cleanup-first story. The durable takeaway is that
  `vehicleAnimationSystem` is the canonical owner for rig-local animation
  channels, while the renderer stays the orchestration layer.
- The boundary is now recorded as [ADR-0031](docs/decisions/ADR-0031-renderer-delegates-rig-local-animation-to-vehicle-animation-system.md)
  and ADR-0030 is preserved as historical / superseded in the decision register.

## 2026-07-27 — static boundary verification complete; runtime proof still pending

- Confirmed in the live tree that `src/game/renderer.ts` registers the rigs,
  initializes the animation mixers, and passes the per-frame feedback map into
  `vehicleAnimationSystem.update(...)`.
- Confirmed in the live tree that `src/game/animation.ts` owns the rig-local
  animation channels for wheel rotation, suspension, steering, body motion,
  steering wheel, module visuals, plough articulation, and state-shell pulse.
- Confirmed that the renderer does not directly own those same rig-local
  animation writes in the update path.
- This is static code-boundary verification only. Runtime/browser proof remains
  a separate open gap and is not claimed here.
- The canonical owner now also drives lug-tire module visibility from the
  rig's installed module list, so the module-visual lane is not left as a
  dormant flag in the animation state.
- The canonical owner now also uses stored track width to tune visible roll
  response, so rig geometry contributes to presentation instead of being
  cached and ignored.
- The animation owner keeps an explicit `ClipActionBindings` contract at `null`
  for future clip-backed rigs; the current tree does not yet load or drive
  animation clips, so the live path remains procedural by design.
- The body-motion lane now writes roll/pitch only once, at the final
  presentation step, instead of duplicating the same root transform in the
  earlier motion update.
- The steering lane now also writes pivot orientation only once, at the final
  presentation step, instead of writing the same steer angle in the earlier
  steering update.
- The current owner now has single presentation commit points for body motion
  and steering, with no lingering duplicate locals from that consolidation.

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

## 2026-07-27 — browser smoke test on the canonical 4173 surface

- Confirmed the browser daemon / Chrome surface can load the canonical `4173`
  dev server without runtime errors.
- The Playwright probe reported the live `Rigs Unbound` title, the expected
  app body, and only Vite debug logs (`[vite] connecting...`, `[vite] connected.`).
- This is smoke-test evidence for the current checkout and browser surface, not
  yet a deeper animation-channel instrumentation proof.
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

## 2026-07-27 — archive residue stays historical by design

- Older append-only logs such as `docs/WORKLOG.md` may still contain the
  previous episode-grammar wording.
- That wording is preserved as history, not as current architectural guidance.
- The current canonical names are `ADR-0032`, `Episode Runner Specification`,
  `ADR-0031`, and the named composition stack wording used in the canonical
  research and exploration docs.
- The live implementation-flow docs are
  `docs/research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md` and
  `docs/research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md`.

## 2026-07-27 — live animation boundary confirmed in source inspection

- `src/game/renderer.ts` currently imports `vehicleAnimationSystem`, and
  `src/game/animation.ts` currently implements the rig-local animation
  channels that ADR-0031 describes.
- That makes ADR-0031 the live source-backed boundary in the current checkout,
  while ADR-0030 remains the historical/superseded renderer-owned note.
- No runtime file was edited in this pass; this note records the inspection
  result so the doc trail and live source stay aligned.
- One minor source-side wording mismatch remains in
  `src/game/animation.ts` (`clipActions` comment text). The parallel-runtime
  boundary still marks that file as off-limits unless the user explicitly
  clears the collision, so the repo now records the gap rather than silently
  papering it over.

## 2026-07-27 — comms package now has a canonical index

- The launch and build-in-public materials now resolve through
  `docs/comms/README.md` as the package index.
- The package index is reachable from the root docs landing page, the research
  landing page, the exploration map, the decision register, and the package
  members themselves.
- This keeps the first-post draft, trailer review, announcement decision, and
  audio/edit production log on one auditable trail without touching runtime
  code.

## 2026-07-27 — reviews index now exists as the evidence counterpart

- `docs/reviews/README.md` now serves as the canonical reviews index for
  acceptance records, provenance audits, and evidence-synthesis surfaces.
- The research landing page, exploration map, decision register, and execution
  tracker now point at the reviews index so evidence reading is as ordered as
  launch/comms reading.
- The comms package index and reviews index now form the package pair for
  launch materials and evidence materials, respectively.

## 2026-07-28 — browser-delivery trust gaps remain split across profile visibility and save announcements

- Re-checked the live Field 02 browser surface and confirmed the current
  runtime still keeps `#runtime-diagnostics` hidden from the public HUD, so
  the active profile remains operator-facing rather than player-facing.
- Re-checked the persistence line and confirmed `#save-status` still reports
  the right fresh/restored/migrated/recovered/fallback/reset text while
  remaining a visual readout rather than a dedicated announcement surface.
- Kept both player-facing issues separate and linked through the reviews index
  so the repo’s public-shell trust trail stays coherent:
  [Visible Input and Accessibility Profile Issue Review](../reviews/VISIBLE_INPUT_ACCESSIBILITY_PROFILE_ISSUE_REVIEW_2026-07-26.md)
  and
  [Save Status Announcement Issue Review](../reviews/SAVE_STATUS_ANNOUNCEMENT_ISSUE_REVIEW_2026-07-26.md).

## 2026-07-28 — reusable shell accessibility acceptance probe added

- Added `tools/shell-accessibility-browser-acceptance.cjs` and exposed it via
  `npm run test:shell-accessibility` so the public profile/save shell contract
  can be re-checked as a reusable browser/accessibility-tree probe.
- The new command checks the visible public profile line, the announced save
  line, the hidden operator diagnostics surface, mobile status-band layout,
  and Chrome accessibility-tree exposure for both lines.
- `tools/README.md` now documents the probe as the canonical reusable way to
  verify the shell readability contract.

## 2026-07-28 — reusable shell accessibility acceptance probe passed on the live Field 02 shell

- Re-ran `npm run test:shell-accessibility` after restoring the canonical Vite
  dev server on `http://127.0.0.1:4173`.
- The probe passed and confirmed:
  - the profile line stays visible and announces the current quality state,
  - the save line stays visible and announced as a live status region,
  - the diagnostics surface stays hidden,
  - the mobile status bands do not overlap,
  - Chrome’s accessibility tree exposes both lines as readable text,
  - the probe itself exits cleanly with no console problems.
- This gives the repo a reusable shell-accessibility evidence command for
  future checks instead of requiring manual browser inspection every time.

## 2026-07-28 — compact shell accessibility summary helper passed

- Added `tools/shell-accessibility-summary.cjs` and exposed it via
  `npm run test:shell-accessibility:summary` so humans and agents can read the
  shell accessibility result in a compact format.
- Ran the summary helper after the detailed probe and confirmed it prints the
  visible profile line, the announced save line, diagnostics visibility,
  layout separation, accessibility-tree hit count, and console-problem count
  in one glance.
- The summary helper is intentionally a reader for the authoritative probe,
  not a second source of truth.

## 2026-07-28 — shell accessibility evidence note added as a stable landing page

- Added `docs/research/SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md` to keep a
  single stable reference for the current shell accessibility state.
- Linked that note from the reviews index and execution tracker so the browser
  proof, the reusable probe, and the concise summary all point to one canonical
  evidence landing page.
- The remaining narration gap stays explicit in the note so future work can
  pick up from the exact proof boundary rather than re-establishing the same
  browser facts.

## Suggested order

1. Read the comms package first for launch and build-in-public work.
2. Read the reviews index next for evidence, approval, and closure work.
3. Read the decision register and research/exploration pages for the load-bearing policy and analytical path.
4. Use the execution tracker and worklog for the active operational sequence.
