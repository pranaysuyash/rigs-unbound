# Rigs Unbound — Master Execution Tracker

- Status: canonical living task list
- Last Updated: 2026-08-05 (weather-scene acceptance hardened and verified; acceptance-helper teardown defect fixed; modlens installed as out-of-repo working tool)
- Owner: project owner; agents update evidence and status in the same change
- Design source of truth: [Game Design Spine](../design/GAME_DESIGN_SPINE.md)
  ([ADR-0040](../decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md)
  accepted by operator sign-off 2026-07-29)
- Product research map: [Exploration Map](../exploration/EXPLORATION_MAP.md)
- Quick lane index: [3D Game Contract Index](../research/3D_GAME_CONTRACT_INDEX_2026-07-25.md)
- Public launch package: [Comms package](../comms/README.md)
- Evidence index: [Reviews index](../reviews/README.md)
- Asset public-gate package:
  [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- Decision source of truth: [ADRs](../decisions/)
- Evidence source of truth: [Worklog](../WORKLOG.md) and [reviews](../reviews/)
- Live implementation flows:
  [Three.js Animation Implementation Flow](../research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md)
  and
  [Three.js Interaction Implementation Flow](../research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md)
- Current rig-local animation boundary:
  [ADR-0034](../decisions/ADR-0034-simulation-owns-physical-truth-presentation-owns-rig-local-animation.md);
  ADR-0031 is historical / superseded; the reserved `ClipActionBindings` contract
  remains explicit for future clip-backed rigs.
- Focused current board:
  [Next Execution Board (2026-08-12)](NEXT_EXECUTION_BOARD_2026-08-12.md)
  — supersedes [the 2026-07-26 board](NEXT_EXECUTION_BOARD_2026-07-26.md),
  preserved as historical record.

## Game Director Audit (2026-08-12)

[Game Director Audit — 2026-08-12](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md)
found the first-playable slice unfinished at its two highest-leverage beats —
no ridge-top "open-world promise" finale scene exists (`camera.ts:100-184`'s
`CAMERA_PRESETS["night-completion"]` is dead code, imported nowhere), and the
authored first-night threat has zero implementation (a generic storm/landslide
event fires instead, unrelated to the waterworks/customization/survey
branches). It also found `npm run typecheck` currently fails on 3 errors in
`renderer.ts` (5811, 5835, 5922), blocking `npm run build`, and flagged 9
post-spine ADRs (0042, 0045-0051, 0053) still unsigned while new proposals
(top-down mode, procedural rig generation) queue behind them. The audit's
18-item task breakdown (explicit and implicit findings, each with a gate and
evidence-tier expectation) is now
[Next Execution Board (2026-08-12)](NEXT_EXECUTION_BOARD_2026-08-12.md);
that board is the live task list going forward — this section stays as the
audit's own pointer. Priority-ordered action list is in the audit's §7; P0 is
finishing the slice's ending before
any new control paradigm or generation system enters the runtime.

## Top-Down Game Mode exploration and ADR-0053 proposal (2026-08-09)

Explored and documented architecture, control paradigms, camera angles, HUD overlays, and 4 game mode archetypes for Top-Down View Game Mode:

- Canonical vision alignment: Rigs are persistent playable characters; top-down mode is a place- and contract-driven activity context ("same vehicle, many games"), not a menu choice or secondary engine port.
- Documented in [`docs/exploration/TOP_DOWN_GAME_MODE_EXPLORATION_2026-08-09.md`](../exploration/TOP_DOWN_GAME_MODE_EXPLORATION_2026-08-09.md).
- Proposed [`ADR-0053: Top-Down Game Mode Architecture and Control Paradigms`](../decisions/ADR-0053-top-down-game-mode-architecture-and-control-paradigms.md) (`Proposed — operator sign-off required`).
- Full worklog addendum in [`docs/WORKLOG_ADDENDUM_2026-08-09.md`](../WORKLOG_ADDENDUM_2026-08-09.md).

## Weather-scene acceptance hardening and tooling hygiene (2026-08-05)

Hardened `tools/weather-scene-browser-acceptance.cjs` so it produces valid
evidence on the canonical 4173 dev server:

- Playwright launch switched to `channel: "chrome"` (bundled `chromium` was
  unavailable in this environment).
- Snapshot read fixed: `snap.weatherPhase` → `snap.weather?.phase` (state
  nests weather under `snap.weather` in `src/game/state.ts`).
- Fixed 400ms blind wait replaced with `pollSceneConvergence` polling until
  `easedRain > 0.5`, so the run only claims success once the rain actually
  converges.
- Verified: `ok:true` against the running 4173 server.

Fixed a false-warning teardown defect in `tools/acceptance-helpers.cjs`:

- The 5s `setTimeout` warning guard was never cancelled on the clean-close
  path, keeping the event loop alive and firing `"Chrome teardown exceeded
  5 seconds."` even when close completed in ~90ms.
- Fix: track the guard handle, `clearTimeout` after the race resolves, warn
  only when the timeout wins. Measured wall time dropped ~8.78s → ~3.76s and
  the false warning is gone. Regression check: weather acceptance PASS.
- Pattern search: only the shared helper had the defect;
  `tools/add-trailer-audio.cjs` uses its own close without a guard timer and
  was left alone.

Full evidence: `docs/WORKLOG_ADDENDUM_2026-08-05.md`.

## Browser-shell visual polish evidence (2026-07-30)

The shell-focused AAA polish slice was implemented and rechecked on the
canonical local port. The current evidence is the pair of browser captures in
`/.codex-visual-polish-after-desktop-inworld.png` and
`/.codex-visual-polish-after-mobile-inworld.png`, alongside the approval pack
in [`docs/reviews/GAME_VISUAL_POLISH_APPROVAL_PACKAGE_2026-07-30.md`](../reviews/GAME_VISUAL_POLISH_APPROVAL_PACKAGE_2026-07-30.md).

Observed gains:

- shell framing now reads like a deliberate premium layer around the world;
- the header, field kit, and bottom strip feel more composited and less flat;
- the mobile horizon rail compresses into a broader, less crowded strip;
- the opening plate still lands strongly without overwhelming the frame.
- the shell now inherits world phase and weather into its presentation mood, so the page feels tied to live game state instead of staying visually static.
- Browser relaunch check on 2026-07-30 found and fixed a startup-order bug in the new pointer-atmosphere wiring, then confirmed the canonical page loads cleanly again at `http://localhost:4173/` with the game shell present.
- The same pass also added an active-rig accent layer, so the HUD trim now shifts with the selected machine. Browser state readback confirmed the accent update on the active rig, with the field-kit border matching the selected palette.
- Camera posture is now part of the same presentation layer. Browser readback confirmed the live camera variable swap between chase and top-down, and the shell restored cleanly back to chase after the check.
- A short presentation pulse now marks shell state changes. Browser readback confirmed a temporary `data-presentation-pulse` token when camera mode changed to `hood`, then the token cleared again after the transition and the browser was restored to chase.

## Game-design principles audit — whole app (2026-07-31)

Applied the `game-design` skill across source, design docs, exploration docs, and decision registers. Produced `docs/reviews/GAME_DESIGN_AUDIT_AND_RECOMMENDATIONS_2026-07-31.md` with:

- 30-second core-loop audit: opening is UI-gated before motion (three workshop clicks before the tractor moves).
- GDD completeness audit: all sections exist across docs, but audio direction is the thinnest surface and there is no single-page GDD summary.
- Player-psychology audit: Achiever and Explorer strong; Socializer and Killer under-served in the first playable.
- Difficulty/flow audit: front-loaded difficulty curve; no explicit difficulty or flow-state owner in the execution queue.
- Progression audit: skill/power/content/story present, but story progression needs the dialogue surface.
- Anti-pattern audit: strong guards, but documentation-to-features ratio and unreachable-module debt remain.
- Proposed six implementation tranches ordered by game-design leverage, starting with proving the 30-second loop.

Status: operator discussion stage. No implementation until the operator selects a path.

## Vision-hierarchy correction and full re-check (2026-07-31)

The previous game-design audit stopped at the machine-keeper odyssey (ADR-0029)
and did not treat the canonical open vehicle-universe vision as the governing
frame. This session corrected that frame and produced
[`docs/reviews/GAME_DESIGN_AUDIT_VISION_CORRECTION_AND_FULL_RECHECK_2026-07-31.md`](../reviews/GAME_DESIGN_AUDIT_VISION_CORRECTION_AND_FULL_RECHECK_2026-07-31.md).

Key corrections:

- The canonical vision is the **open vehicle universe** (`docs/design/GAME_DESIGN_SPINE.md` §1, ADR-0040 accepted 2026-07-29).
- ADR-0029 is reclassified as **Campaign One's identity/tone**, not the umbrella vision.
- The first playable slice is **The Road That Was**, governed by `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`.

Current runtime metrics:

- 92 non-test source modules, 77 reachable, **14 unreachable** (down from 25).
- Reachability budget ≤ 25 — PASS.
- Tranche 1 (quest semantics) — DONE.
- Tranche 2 (restoration/crafting loop) — wired and now player-reachable.
- Tranche 3 (Water Before Night) — DONE; both branches proven with browser acceptance.
- Tranches 4–6 (north field/night variants, dialogue/narration, ridge finale) — dialogue/narration surface is DONE; north field/night and ridge finale remain.

Highest gaps against the canonical vision:

- No second campaign candidate or second world-class proof.
- No shareable/replayable player record (`ghost.ts` unreachable).
- No economic loop (Scrap/Parts/marketplace not wired).
- No social/multiplayer layer.

Highest gaps against the slice:

- First 30 seconds are UI-gated (three workshop clicks before motion).
- No player-facing customization decision with consequence.
- No North Field mystery or first-night hazard pressure.
- No end-to-end browser acceptance for the full slice.

Four implementation options are offered, from narrowest (prove the 30-second
loop) to broadest (complete one slice loop plus one universe proof point). The
document recommends Option 1 or Option 2, depending on operator preference.

Status: operator discussion stage. No `src/game/` edits proposed until the
operator selects a scope and clears the parallel-owned runtime work.

## Implementation direction selected (2026-07-31)

Operator direction recorded in
[`docs/reviews/IMPLEMENTATION_DIRECTION_DECISION_LOG_2026-07-31.md`](../reviews/IMPLEMENTATION_DIRECTION_DECISION_LOG_2026-07-31.md)
and restoration-loop design in
[`docs/design/RESTORATION_LOOP_DESIGN_NOTE_2026-07-31.md`](../design/RESTORATION_LOOP_DESIGN_NOTE_2026-07-31.md).

**Universe-level gap to close:** shareable run record / ghost replay.
- Serves Game Design Spine Pillar 5 (inspectable/shareable) and the Social
  history persistence layer.
- Uses existing `src/game/ghost.ts`, `src/game/replay-validator.ts`, and the
  deterministic run-record contract.
- Smallest universe proof: no new art, world class, or campaign needed.

**Slice-level focus:** restoration loop (Tranche 2 of The Road That Was).
- Move from three text buttons (`Diagnose`, `Rebuild`, `Start engine`) to a
  direct inspect-and-act loop on the machine.
- Add immediate sound, vibration, and visual feedback.
- Target: player is in motion within 60 seconds.

**Dialogue surface:** hybrid.
- Dedicated dialogue panel for arrival/bargain and naming beats.
- Shell narration for action/world beats.

**Audio:** defer comprehensive `AUDIO_DIRECTION.md`; add only targeted sound
feedback for the restoration loop in this window.

**Commit route:** `git add -A` → `git commit` → full hook-gate → `git push`.

**Boundaries:**
- In scope: restoration-loop feel, ghost-replay wiring, tests, browser
  acceptance, documentation.
- Out of scope: Water Before Night, north field/night variants, ridge finale,
  settlement/community/ecology integration, comprehensive audio direction, new
  art assets or world classes.

Status: **implementation complete and verified**. Evidence is in
[`docs/reviews/RESTORATION_LOOP_AND_GHOST_REPLAY_EVIDENCE_2026-07-31.md`](../reviews/RESTORATION_LOOP_AND_GHOST_REPLAY_EVIDENCE_2026-07-31.md).
Commit is pending due to parallel-owned uncommitted changes in the working tree.

## Restoration loop + ghost-replay implementation evidence (2026-07-31)

Implemented the selected direction and closed both the slice-level restoration
loop and the universe-level shareable run-record/ghost-replay proof point.

Runtime changes:

- `src/main.ts`: restoration actions now emit immediate audio, panel pulse,
  camera shake, and an engine-start headlight flare; the workshop auto-closes
  on first start; restoration commands are recorded for deterministic replay;
  `GhostTrailRecorder` samples the active rig each frame; `window.getGhostTrail()`
  exposes the trail; a pause-overlay button copies the combined session record.
- `src/game/run-record.ts`: `diagnoseRestoration`, `performRestorationService`,
  `performFirstStart` added to the replayable command set.
- `src/game/replay-validator.ts`: implements the three restoration commands in
  deterministic replay.
- `src/game/renderer.ts`: `flashHeadlights(rigId)` for diegetic first-start
  response.
- `src/styles.css` + `index.html`: restoration pulse animation and session-record
  copy button.

Tests:

- `npm run typecheck` PASS.
- `npx vitest run --pool=forks --poolOptions.forks.singleFork` PASS 87 files /
  530 tests.
- `node tools/restoration-loop-ghost-acceptance.cjs` PASS using system Chrome
  channel (Playwright binary not installed in this environment).

New/updated docs:

- `docs/reviews/RESTORATION_LOOP_AND_GHOST_REPLAY_EVIDENCE_2026-07-31.md`
- `tools/restoration-loop-ghost-acceptance.cjs`

Boundaries respected: no edits to parallel-owned settlement/community/ecology
modules; no new art/audio assets, world classes, or campaign content;
comprehensive audio direction remains deferred.

## Water Before Night implementation evidence (2026-07-31)

Closed the Water Before Night evidence gap: the decision surface is now
player-reachable and both branches are proven to produce distinct world memory.

Runtime changes:

- `src/main.ts`: workshop panel actionability now includes the unresolved Water
  Before Night decision, so the panel stays open after restoration until the
  player makes the choice.
- `src/game/state.ts`: `publicState` exposes `progression.farmWaterworks` so the
  acceptance harness can verify the committed branch.
- `src/game/state.test.ts`: direct unit tests for `chooseFarmWaterworks` guard
  clauses and both branches; fixed a nested-describe accident that had placed
  migration tests inside the waterworks block.

Tests:

- `npm run typecheck` PASS.
- `npx vitest run` PASS 87 files / 538 tests.
- `node tools/water-before-night-browser-acceptance.cjs` PASS using system Chrome
  channel.
- `node tools/restoration-loop-ghost-acceptance.cjs` PASS (regression).
- `node tools/dialogue-surface-browser-acceptance.cjs` PASS (regression).

New/updated docs:

- `docs/reviews/WATER_BEFORE_NIGHT_EVIDENCE_2026-07-31.md`
- `docs/design/WATER_BEFORE_NIGHT_IMPLEMENTATION_PLAN_2026-07-31.md`
- `tools/water-before-night-browser-acceptance.cjs`
- `tools/restoration-loop-ghost-acceptance.cjs` (updated for new workshop behavior)

Boundaries respected: no edits to parallel-owned settlement/community/ecology
modules beyond exposing existing state in `publicState`; no new art/audio assets,
night-variant visuals, or first-night hazard sequences; north field and ridge
finale remain out of scope.

## Vision-hierarchy correction and whole-game execution order (2026-07-29)

Operator review (2026-07-29) found the recorded vision narrower than the
pitched open vehicle-universe, and found no authoritative story, quest,
exploration, or marketplace architecture despite heavy contract output.
Measured state agreed: 25 unreachable modules (1,836 lines) and a 41:4
docs-to-features ratio over the last 60 commits.

Correction landed this session and **accepted by operator sign-off the same
day** (condition: prior work is updated in place, never deleted):

- [Game Design Spine](../design/GAME_DESIGN_SPINE.md) — canonical whole-game
  design surface (vision, world-of-worlds topology, story layers, quest
  architecture, exploration architecture, economy/marketplace stances,
  multiplayer posture, continuity models, studio operating model);
- [ADR-0040](../decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md)
  — establishes the hierarchy and reclassifies ADR-0029 as Campaign One's
  identity rather than the umbrella vision;
- [First Playable — The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)
  — the integrated opening slice with module-by-module runtime bindings and a
  reachability gate of ≤ 13 unreachable modules.

**Execution order consequence:** the top of the queue is now the slice's six
tranches (quest semantics → restoration loop → Water Before Night → north
field/night variants → dialogue surface → ridge finale + acceptance). Existing
technical lanes continue only where a slice tranche needs them or where they
close an already-open acceptance gate. Every package below this section must
name the spine layer it serves when it is next touched; packages that cannot
are deferred by default per ADR-0040.

**Tranche 1 (quest semantics) — DONE 2026-07-29.** Quest classes, giver ids,
and a prerequisite graph landed on `MissionProposition`; the campaign
generator derives main-class contracts from `campaign.ts` (stale `home-farm`
site id corrected to `home-silo`; the marsh contract stays dormant until its
site is authored); `mission-lifecycle.ts` enforces one `main` focus mission
and up to three concurrent non-main side missions; binding-driven completion
hooks route through `activeMissionMatching` so side missions complete via the
same authority; the mission board groups rows by class, shows giver/status,
and explains disabled accept states. Removed the parallel
`deriveCampaignContracts`/`activeContractCount` engine from `campaign.ts`.
Evidence: `npm run typecheck` PASS; `npx vitest run --pool=forks
--poolOptions.forks.singleFork` PASS 76 files / 487 tests (new concurrency,
public-state, and campaign-chaining cases). Browser acceptance for the board
remains pending. Next: tranche 2 (restoration loop — wire
`vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts` into the
shell).

## Quest-semantics tranche note (2026-07-29)

- The first tranche is complete and narrowed to a versioned proposition
  contract:
  - `MissionProposition.missionClass`
  - `MissionProposition.giverId`
  - `MissionProposition.prerequisites`
- `MissionProposition.outcomes` is intentionally deferred: the prerequisite
  graph already handles campaign unlocking, and outcome consumers (favor,
  world-memory deltas) land with Tranches 2–3.
- The target behavior matches the slice doc: one `main` quest in the focus
  slot, up to three concurrent `side` / `local` / `hidden` / `repeatable`
  missions in `activeSideMissions`, and `campaign.ts` now routes through the
  mission lifecycle with no parallel campaign engine.
- The parallel-owned `src/game/` collision was cleared by committing the
  pending runtime work; Tranche 1 edits to `src/game/` are now landed and
  verified.
- The tracker should keep future tranche updates tied to the slice document so
  the design spine and execution order stay aligned.

## Restoration-loop tranche note (2026-07-29)

- The second tranche is the restoration loop: maintenance, workshop, and
  salvage as one recoverable player surface.
- The next proof slice should preserve the workshop overlay as the visible home
  for repair / restore actions, salvage as a bounded source of parts and
  provenance, and maintenance as a readable state change rather than a hidden
  stat bump.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.
- The tracker should continue to use the slice document as the canonical
  tranche description so the execution order stays aligned with the design
  spine.

## Water Before Night tranche note (2026-07-29)

- The third tranche is Water Before Night: the pump circuit, the repair versus
  redirect branch, and the first-night consequence as one causal loop.
- The next proof slice should preserve the consequence chain through
  `surface-moisture.ts`, `soil-ecosystem.ts`, `river-hydrology.ts`, and
  `world-memory.ts` so the field changes because of the player’s choice.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.
- The tracker should continue to use the slice document as the canonical
  tranche description so the execution order stays aligned with the design
  spine.

## North-field/night-variants tranche note (2026-07-29)

- The fourth tranche is north field + night variants: scanner/probe/topo
  wiring, hazard pressure, and the way the workshop choice changes the first
  night.
- The next proof slice should preserve the consequence chain through
  `seismic-probe.ts`, `radio-scanner.ts`, `topo-map.ts`, `landslide-hazard.ts`,
  `debris-physics.ts`, and `world-memory.ts` so the field changes because of
  the player’s choice.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.
- The tracker should continue to use the slice document as the canonical
  tranche description so the execution order stays aligned with the design
  spine.

## Dialogue/narration tranche note (2026-07-29)

- The fifth tranche is the dialogue and narration surface: a minimal,
  accessible, text-first conversation layer for the opening session.
- The next proof slice should preserve:
  - the arrival-and-bargain exchange as a readable conversation beat;
  - the naming moment as a player-authored decision surfaced through
    dialogue, not a hidden state edit;
  - shell narration as the announcement layer that frames the action;
  - one accessible text-first route rather than a second story engine or
    narrative system.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.
- The tracker should continue to use the slice document as the canonical
  tranche description so the execution order stays aligned with the design
  spine.

## Progression model reconciliation addendum (2026-07-28)

The two progression models are intentionally retained with explicit precedence:

- capability-shaped Journey/Mastery/Insight is canonical for the current games and engine foundation;
- universal XP/level/rung/restoration is an optional policy for future games;
- hybrid games may compose both through namespaced state and explicit reward routing;
- no implicit conversion or duplicate `ProgressionState` fields are added.

See [Progression Model Coexistence and Composition](../exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md) and the updated [Progression Contract Integration Review](../reviews/PROGRESSION_CONTRACT_INTEGRATION_ISSUE_REVIEW_2026-07-28.md). The progression-model conflict is resolved at the architecture/documentation level. The mission-board/acceptance surface remains a separate implementation gate.

The product decision is now clarified: capability-shaped progression remains
canonical; XP is a bounded projection/mode/legacy adapter and never a second
campaign authority. See [Progression Mode Interoperability and Legacy XP
Exploration](../research/PROGRESSION_MODE_INTEROP_AND_LEGACY_XP_EXPLORATION_2026-07-28.md).

Current evidence closes the progression integration gate for this slice:
`npm run typecheck` passed; `npx vitest run` passed with 65 files and 382 tests;
and `node tools/first-cut-browser-acceptance.cjs` passed all 6 canonical-port
browser steps with zero console errors. The verified flow includes the first
meaningful spend (`lug-tires`) and first-cut furrow creation. Next evidence is
player comprehension plus save/reload continuity before expanding progression
surfaces.

## Mission acceptance completion tranche (2026-07-28)

The mission-board implementation gate is now wired through one authoritative
runtime boundary:

- `mission-propositions.ts` remains derived and excludes completed mission deeds;
- `mission-lifecycle.ts` owns acceptance, completion, failure, exclusivity, and
  reward idempotency;
- `GameState.activeMission` is the only persisted in-flight contract;
- delivery and survey bindings route completion through the lifecycle;
- the public text contract exposes the active mission for replay/browser proof;
- reachability dispositions are recorded in the short
  [Runtime Reachability Dispositions](../exploration/RUNTIME_REACHABILITY_DISPOSITIONS_2026-07-28.md)
  note and the fuller [Runtime Reachability Ownership Matrix](../reviews/RUNTIME_REACHABILITY_OWNERSHIP_MATRIX_2026-07-28.md).

Evidence: `npm run typecheck` passed; `npm test` passed with 432 Vitest tests
and 7 deterministic kernel probes; the current reachability classification is
captured in the ownership matrix and disposition artifacts. Final browser,
accessibility, format, build, and diff evidence remains required before this
tranche is marked fully closed.

## Overlay accessibility seam recheck (2026-07-28)

The next safe docs-backed analysis seam is the major-overlay accessibility and
focus contract, not the contested runtime implementation:

- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` already names the shell
  stack and treats accessibility as structural.
- `docs/reviews/MAP_OVERLAY_DIALOG_AND_FOCUS_ISSUE_REVIEW_2026-07-26.md`,
  `docs/reviews/PAUSE_STATE_ANNOUNCEMENT_ISSUE_REVIEW_2026-07-26.md`, and
  `docs/reviews/TOUCH_RADIAL_ACTION_BOOT_BLOCKER_ISSUE_REVIEW_2026-07-28.md`
  keep the focus/announcement surfaces explicitly live.
- `docs/research/SHELL_ACCESSIBILITY_NEXT_SEAM_2026-07-28.md` now records the
  next slice: contract-board / modal-overlay semantics, focus restore, and
  keyboard/touch parity.
- `docs/reviews/CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md`
  now captures the exact missing runtime insertion point: the acceptance
  surface still needs a live board branch and command boundary.
- `docs/reviews/LABS_DRAWER_CONTINUITY_ISSUE_REVIEW_2026-07-28.md`
  now records the labs boundary: the shell still needs a mounted drawer or
  equivalent runtime route so labs preserve context instead of dropping it.
- `docs/reviews/INPUT_REMAP_PERSISTENCE_ISSUE_REVIEW_2026-07-26.md`
  now explicitly treats the radial wheel and controls legend as consumers of
  the canonical action model, not as the binding registry itself.
- `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md`
  now carries the source-level addendum: first-use guidance and controls help
  are explanatory surfaces, while the persisted binding registry remains the
  canonical action-layout source of truth.
- `docs/research/BROWSER_PROVED_SHELL_PROFILE_OWNER_CONTRACT_2026-07-26.md`
  now has live-browser proof that the public HUD owns the visible profile line
  while operator diagnostics stay separate.
- `docs/reviews/MUTE_PREFERENCE_PERSISTENCE_ISSUE_REVIEW_2026-07-26.md`
  now ties mute to the player-facing comfort/profile story, while keeping the
  missing persistent preference registry explicitly open.
- `docs/reviews/WORKSHOP_PANEL_FOCUS_AND_DISCOVERY_ISSUE_REVIEW_2026-07-26.md`
  now explicitly frames workshop as part of the same focus-managed shell
  family as the other major overlays, not a separate UI philosophy.
- `docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md`
  now records that the public shell shows profile/save state, but the
  resource-fallback envelope still lacks a canonical low-budget policy.
- `docs/research/WORLD_AFFORDANCES_AND_CAPABILITY_RESOLUTION_CONTRACT_2026-07-25.md`
  now states that the resolver is the shared decision surface beneath shell
  interactions, while remaining distinct from the shell itself.

`src/game/` remains parallel-owned and was not touched during this analysis.

New P1 drift found during the broader harness: the accepted first-rung contract
completes at the first meaningful module fit, while the current runtime/tests
keep `complete: false` until first-cut terrain transformation. See [Progression
Contract Integration Review](../reviews/PROGRESSION_CONTRACT_INTEGRATION_ISSUE_REVIEW_2026-07-28.md).
The runtime/tests are now reconciled to the accepted contract and the focused
first-cut browser proof passes. The comprehensive harness still times out at
the `Fit a part at Home Silo` control-lesson wait; do not claim player
comprehension or save/reload closure until that gate is resolved.

- Open browser-delivery trust gaps are tracked in the reviews index as
  separate player-facing issues: visible profile state and save/recovery
  announcement. Live browser and accessibility-tree proof now show both
  contracts in the rendered shell, with spoken narration validation still
  pending. The live radial quick-action wheel now mounts and opens, the focus
  handoff now lands on the close control, and selection updates a polite live
  status region; the remaining wheel accessibility proof is the manual spoken
  narration pass. See
  [Reviews](../reviews/README.md)
  for the canonical pointers. The current stable evidence landing page is
  [Shell Accessibility Evidence](../research/SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md)
  and the wheel contract note at
  [Radial Quick-Action Wheel Contract](../research/RADIAL_QUICK_ACTION_WHEEL_CONTRACT_2026-07-28.md).

### Browser witness stability note (2026-07-29)

The canonical developer route is reachable again at
`http://127.0.0.1:4173/?surface=developer`, but the browser-client DOM probe
still returned `undefined` after navigation. Treat the live browser as present
but the current IPC exec path as an unstable witness until a stronger DOM
inspection route is available.

## Browser/build gate addendum (2026-07-28)

The first-rung contract is reconciled; typecheck, 65/383 tests, and the 6-step
first-cut smoke pass. The comprehensive browser harness still has a later
shell assertion failure (`Field 02 welcome plate should be visible`), and
`npm run build` is blocked by unused radial-menu symbols in parallel
`src/main.ts`. See [Progression Browser and Build Gate](../reviews/PROGRESSION_BROWSER_AND_BUILD_GATE_2026-07-28.md).

## Suggested order

1. Use the comms package first for launch and build-in-public work.
2. Use the reviews index next for evidence, approval, and closure work.
3. Use the decision register when you need the load-bearing policy or status source.
4. Use the execution tracker and worklog for the current operational sequence.

## Recent Completed Work Packages (2026-07-27)

- `[x]` **Home Valley Reclamation Route Lifecycle, Fleet Inheritance & 3D Field Map Redesign**:
  - Schema v8 additive save evolution (`SAVE_SCHEMA_VERSION = 8`) with `CutFillEditRecord` & `FleetInheritanceRecord`.
  - Upgraded `FieldMap` in `src/game/minimap.ts` to `BASE_RESOLUTION = 384` with 3D North-West hillshading, multi-tier elevation colors, 3m contour isolines, and cyan compass radar bezel.
  - Resolved vehicle steering direction inversion across physics, animation, and map arrow.
  - Matured `evaluateCorridorQuality` to check gully tilling/grading, lateral width, and water level clearance.
  - Spatially bounded semantic edit route attribution and physical entry-to-exit traversal fleet inheritance.
  - Exposed type-safe public window hooks (`window.toggleWorkshop`, `window.selectRig`, `window.selectCamera`, `window.installRigModule`, `window.toggleFieldMap`, `window.placeRig`).
  - Fixed browser acceptance harness (`first-cut-acceptance.json` records **100% PASS ✓**, enforcing `process.exitCode = 1` on error).
  - Integrated `river-hydrology` hydrodynamic buoyancy, `barometric-engine` altitude power derating, and `soil-ecosystem` growth factors.
  - Added interactive **Machine Journal & Provenance Logbook** tab (`#map-layer-journal`).
  - Evidence report: [FIELD_MAP_AND_HOME_VALLEY_RECLAMATION_JOURNEY_ACCEPTANCE_2026-07-27.md](../reviews/FIELD_MAP_AND_HOME_VALLEY_RECLAMATION_JOURNEY_ACCEPTANCE_2026-07-27.md).

## How to maintain this tracker

## Addendum (2026-07-29) - open-world infrastructure authority

- `[-]` **RU-0940 - Persistent infrastructure network.** Replace the
  singleton Floodgate chain with authored machines that persist, advance under
  the fixed-step weather clock, and feed spatial water/soil effects into normal
  rig physics. Current entities are Floodgate 12, Long Furrow Drain Pump, and
  Quarry Dewatering Rig. Decision: [ADR-0042](../decisions/ADR-0042-open-world-infrastructure-network.md).
  - Current implementation: the renderer samples the same entity operation
    state to visually drain or darken local water, and the field atlas records
    discovered machine influence/condition. Quarry dewatering also changes
    material yield at the canonical salvage collection path. Long Furrow
    drainage changes the magnitude of persistent terrain deformation produced
    by a plough pass, without creating a field-access or route-unlock gate.
    Disturbed ground now retains bounded moisture, shear strength, vegetation,
    roots, and soil health in `GameWorld` memory; weather advances it and the
    local drain changes its rate. The field atlas reads those same cells as
    muddy, damaged, or recovering soil; root density also changes subsequent
    cut deformation. The nearby 3D terrain mesh projects the same revision as
    a local colour tint. Infrastructure service now consumes the canonical
    world-affordance resolver for capability admission rather than maintaining a
    second compatibility branch. Each machine now has a grounded low-poly
    renderer assembly with a canonical-state beacon and semantic moving part;
    collision authority remains intentionally separate. This is source evidence
    only.
  - Closure gate: save migration, headless network/physics tests, and canonical
    4173 visual evidence that the renderer represents the same local waterline.
  - Boundary: this is world substrate, not a mission or episode framework.

Use only these states:

- `[x] Done` — closure evidence is linked and the required gate passed.
- `[-] In progress` — implementation or verification is active.
- `[ ] Ready` — decision is sufficient and dependencies are closed.
- `[?] Decision needed` — implementation would encode a load-bearing choice.
- `[~] Researching` — evidence is being gathered; no implementation claim.
- `[>] Deferred` — deliberately sequenced behind a named dependency.
- `[!] Blocked` — an external dependency prevents meaningful progress.

Every item must name its closure gate. New findings are added here before an
agent leaves the task. “Done” is never inferred from code existing.

## Current ordered execution queue

This is the operational order. The detailed numbered items below remain the
canonical scope and acceptance contracts.

| Order | Status | Work package                                                      | Why now                                                                                       | Exit before advancing                                                                                                         |
| ----: | :----: | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
|     1 | `[x]`  | RU-0106–RU-0109: first-session P0 repair                          | These defects blocked entry, reward, recovery, or coherent time                               | Unit/migration contracts, development browser, rebuilt production preview, persistence, input parity, and zero console errors |
|     2 | `[x]`  | RU-0110: remaining P1/P2 playtest defects                         | Remove camera, spawn, lab/debug, affordance-label, and record confusion before adding ecology | Every B5–B12 item reproduced, dispositioned, tested, browser-reviewed, committed, pushed, and deployed                        |
|     3 | `[-]`  | RU-0901–RU-0909: session synthesis, provenance, and authority     | Missing synthesis and invented decision authority can misroute every later workstream         | Canonical proposal captured; ADR statuses sourced; tracker deduplicated; lab/public authority explicitly decided              |
|     4 | `[-]`  | RU-0601 + RU-0406: guidance and first meaningful spend            | A reachable reward is not yet a complete first rung                                           | Fresh profile reaches, understands, earns, spends, and recognizes the rig change without project knowledge                    |
|     5 | `[?]`  | RU-0202 + RU-0203: emissions and cultivation                      | Current plans conflict on sequencing, source/listener authority, and schema-v7 ownership      | Operator accepts sequencing and ADR-0025/0026 boundaries; then one real listener and one persistent crop vertical pass        |
|     6 | `[ ]`  | RU-0204 + RU-0205: night threats and dawn consequence             | Complete the first consequence-bearing day→night→dawn loop                                    | Threat failure/retry paths, persisted dawn record, player/operator explanation                                                |
|     7 | `[ ]`  | RU-0206 + RU-0405: mastery and schema v7                          | Progression must reward varied rig verbs without grind or save drift                          | Effective-profile composition, anti-grind tests, v6→v7 migration and recovery summary                                         |
|     8 | `[ ]`  | RU-0207 + RU-0208: presentation and fresh-eyes validation         | Kernel completion is not player comprehension or fun evidence                                 | Desktop/narrow acceptance, save/reload, three simulated personas, at least one human                                          |
|     9 | `[ ]`  | RU-0502–RU-0506 + RU-0603: production assets and public hardening | Replace proof meshes only after the first loop proves what assets and budgets matter          | Selective Kenney pipeline, representative-device profile, boot/readiness, streaming, accessibility                            |
|    10 | `[-]`  | RU-0304–RU-0307: deeper capability/physics proofs                 | Let real activities pose the next controller and collision questions                          | Shared roles, rescue activity, obstruction query, then one genuinely different motion family                                  |
|    11 | `[ ]`  | RU-0701–RU-0703: replay, guest identity, optional account link    | Sharing starts with inspectable local artifacts, not real-time authority                      | Ghost artifact, export/import, then accepted auth/conflict ADR                                                                |
|    12 | `[>]`  | RU-0704–RU-0707: social, co-op, AI proposals, creator ladder      | High-leverage but depends on stable state, authority, moderation, and recovery                | Named dependencies and operational safety gates close first                                                                   |
|    13 | `[~]`  | RU-0801–RU-0808: continuous research/skill coverage               | Research continues in parallel but must produce decisions or probes                           | Each recommendation is accepted, rejected, deferred, or linked to measured evidence                                           |

### Evidence and exploration note (2026-07-28)

The public asset promotion package index now links the live manifest/runtime
gate and its tests, so the public-approval trail is readable from one place.
The runtime reachability ownership matrix review now gives the measured orphan
set an explicit ownership classification, while the disposition note keeps the
budgeted archive/defer list visible from the exploration map. The dynamic
collision authority exploration and ADR-0037 now anchor the collision-contact
seam in the canonical decision and exploration maps. These are documentation
and evidence updates only; the parallel-owned runtime implementation remains
untouched.

#### Correction addendum (2026-07-28)

The preceding statement is a time-stamped pre-implementation checkpoint. The
operator subsequently cleared the collision runtime for direct work. ADR-0037
is now implemented and locally verified: semantic roles, CCD, dynamic rig/cargo
response, footprint-aware proxies, and operator contact telemetry are live.
See [Dynamic World Collision Acceptance](../reviews/DYNAMIC_WORLD_COLLISION_ACCEPTANCE_2026-07-28.md).

### Active work package checklist

#### RU-0110 live task list — remaining P1/P2 playtest defects

This is the active, ordered checklist. A defect is not closed by a code change
alone: its reproduction, contract, automated checks, browser evidence, and
documentation must all agree.

- [x] **RU-0110.0 — Preserve the incoming research batch before implementation.**
  - Evidence: guarded commit `3763a82da03282e11c98a69f2ef1da1b52f6e436`;
    local `main` and `origin/main` aligned after push; typecheck, 108 root
    tests, seven deterministic-kernel tests, Markdown links, and diff checks
    passed.
- [x] **RU-0110.1 — Refresh the live baseline and preserve parallel work.**
  - Evidence: both development ports returned HTTP 200; seven parallel
    research/worklog files and four review captures were classified as
    uncommitted project work and left untouched.
- [x] **RU-0110.2 — Reproduce and disposition B5–B12 with trustworthy
      evidence.**
  - B5 and B9 were reproduced: the old hood pose intersected Torque geometry
    and the fresh chase boom crossed the Home Silo structure. The old spawn's
    exact nearest hit was `home-silo-body`, correcting the earlier gantry-only
    attribution; the canonical v6 Home berth now resolves
    `home-barn-roof`.
  - B6 is reproduced as two gaps: first-session Drift acquisition is hidden
    logistics, while extreme terrain-face penetration affects all mobility
    adapters.
  - B7's prior stuck-lab symptom is not currently reproduced; direct lab boot
    works. The player/developer navigation defect remains.
  - B8, B11, and B12 are reproduced from the public HUD.
  - Evidence correction: the earlier Toy Buggy and Marsh Skimmer hood captures
    do not show their named active rigs. They remain preserved as contradicted
    audit evidence; the `ru-0110/*-hood-after.png` replacements assert the
    active rig before capture.
  - Closure: one baseline matrix records reproduced, not-reproduced, or
    superseded status for every B5–B12 item, with valid captures where a visual
    claim matters.
- [x] **RU-0110.3 — Introduce one canonical scene/camera obstruction query.**
  - Add a solver-independent swept camera query with typed nearest-hit evidence
    (`terrain`, procedural obstacle, or authored structure plus object ID and
    hit fraction).
  - Move Home Silo structural bounds to canonical world data consumed by both
    rendering and the query; do not create a renderer-only proxy truth.
  - Include visual obstacle bounds, standing/felled semantics, tangent
    clearance, finite/zero-length handling, and a bounded hot path.
  - Closure: focused tests cover clear segments, terrain, tree crowns, felled
    trees, authored gantry, tangent clearance, nearest-hit selection, and
    deterministic output.
  - Evidence: `scene-query.ts` composes terrain, procedural obstacles, felled
    world memory, and typed authored structures without importing Three.js;
    seven focused tests plus the full 116-test root suite pass.
- [x] **RU-0110.4 — Replace B5's hardcoded hood pose with rig-owned camera
      sockets.**
  - Author a named hood/cockpit socket for Torque, Spark, and Drift on each
    rendered rig; keep the contract compatible with later GLB node mounts.
  - Prevent camera-mode interpolation through rig geometry and expose
    operator-only evidence for the resolved pose.
  - Closure: all three sockets resolve outside their visual envelopes;
    per-rig browser checks report no self-intersection on desktop and narrow
    viewports.
  - Evidence: typed Torque/Spark/Drift mounts feed named renderer sockets;
    browser evidence reports clear paths and no self-intersection for all three
    rigs, with validated replacement captures under `docs/reviews/assets/ru-0110/`.
- [x] **RU-0110.5 — Resolve B9/B10 chase-camera obstruction without spawn
      hacks.**
  - Use the canonical query for immediate inward avoidance, slower outward
    recovery, a near-plane-safe margin, and post-smoothing revalidation.
  - Keep top-down/tactical cost bounded where full prop queries add no value.
  - Closure: fresh spawn clears the Home Silo structure; a deterministic standing
    tree shortens the boom; felling/clearing it restores the boom without
    oscillation or console errors.
  - Evidence: canonical v6 fresh spawn reports nearest hit
    `home-barn-roof`, resolves from 12.996 m to 5.484 m, then revalidates
    clear. The acceptance-only
    `?acceptance=field-02` fixture finds a real isolated procedural tree,
    observes obstacle pull-in, records the canonical felled-world mutation,
    and observes clear outward recovery. Port 4173 completed with exit code 0
    and zero captured console/page errors.
  - Evidence correction (2026-07-26): the current Home berth can present a
    fully clear 12.996 m chase path. Fresh-spawn acceptance therefore checks a
    clear-or-resolved conditional contract instead of requiring an obstruction
    to exist. The deterministic Launch Ridge structure and standing/felled-tree
    fixtures continue to prove typed inward resolution and outward recovery.
- [x] **RU-0110.6 — Create canonical, non-overlapping starting-rig berths.**
  - Keep spatial switching. Until an explicit claim/unlock mission exists,
    place every advertised starting rig at distinct Home Silo service berths
    that form a real proximity chain.
  - Reuse the same typed berth data for initial state, legacy recovery, and
    emergency recovery; no duplicated spawn coordinates.
  - Add a versioned migration that relocates only pristine legacy Drift state
    and preserves rigs the player already moved, used, or attached.
  - Closure: a fresh player acquires Torque→Spark→Drift without test
    teleportation; berths are dry, stable, non-overlapping, and recovery-safe;
    migration and round-trip tests pass.
  - Evidence: dependency-free rig IDs feed typed world berth records reused by
    fresh state and emergency recovery. Schema v6 reads v5 first, relocates
    only pristine inactive legacy Drift state, and preserves moved/used/attached
    rigs. Focused state/storage tests and fresh browser acquisition pass.
- [x] **RU-0110.7 — Add one shared swept terrain traversability boundary.**
  - Treat the observed cliff penetration as a shared substrate defect, not a
    Drift speed tweak. Add deterministic support-rise/face checks with
    adapter-owned wheel-contact and hover-skirt envelopes.
  - Allow blocked hover authority to reach zero, preserve downhill/reverse
    escape, and return a semantic block reason for player feedback.
  - Closure: Torque, Spark, and Drift cannot penetrate or launch up the seeded
    extreme face at rest or run-up speed; normal grades, water traversal,
    towing, deformation, and deterministic replay remain valid.
  - Evidence: one solver-independent leading-edge/footprint sweep is consumed
    by ground and hover adapters; five focused tests cover all rigs, high-speed
    tunnelling, normal grades, and downhill escape. The final 125-test root suite and
    seven kernel tests pass. A deterministic real-terrain browser fixture
    reaches the semantic `terrain-face` refusal for each adapter under
    acceptance-only manual stepping; final all-flow capture is tracked in
    RU-0110.10.
- [x] **RU-0110.8 — Establish an explicit player/developer surface boundary.**
  - Default player mode hides Physics Lab navigation and runtime
    fps/draw-call/heap diagnostics while keeping direct lab routes available.
  - One explicit developer/evidence surface reveals diagnostics and lab
    navigation for agents and operators.
  - Closure: query/mode behavior is tested; player and developer screenshots
    agree with the contract; direct lab routes still boot with zero errors.
  - Evidence: default player mode hides Physics Lab and runtime metrics;
    `?surface=developer` and `?acceptance=field-02` expose both. The player save
    line reports literal new/restored/migrated/saved-local state. Both 4173 and
    rebuilt 4174 browser runs passed default/developer assertions with zero
    console/page errors.
- [x] **RU-0110.9 — Make actions and persistence language contextual.**
  - Introduce one pure primary-action resolver used by both mutation and UI so
    desktop, touch, prompts, and automation cannot drift.
  - Label the current rig's action, blade availability, recovery, and world
    verbs accessibly on desktop and narrow viewports.
  - Separate persistence status, runtime diagnostics, and the existing genuine
    cargo-relay personal best. Replace the misleading `Local field record` text
    with literal saved/restored/local-state language; do not invent another
    best-time system.
  - Closure: keyboard, pointer, real-touch, aria-label, narrow-layout, and save
    messaging tests pass.
  - Evidence: a pure semantic primary-action resolver drives mutation,
    desktop text, touch text, and aria labels; blade and recovery labels expose
    capability/state instead of generic verbs. Focused tests plus both full
    browser runs cover keyboard, mouse, real touch, save/reload, and the
    `390×844` layout; visible labels include `Lower blade`, `Blade: cut`, and
    `No winch`.
- [x] **RU-0110.10 — Run the complete risk-matched acceptance matrix.**
  - Unit: scene query, camera mounts, terrain traversal, action resolver, save
    migration, and recovery.
  - Integration: typecheck, complete root suite, deterministic kernel suite,
    format, build, local-link check, and diff check.
  - Browser: ports 4173 and rebuilt 4174; desktop and 390×844; fresh profile,
    real proximity acquisition, every hood camera, spawn/prop obstruction,
    developer boundary, persistence, and zero console/page errors.
  - Harness lifecycle: deterministic runs default headless, close their context,
    and previously exited code 0 on both ports. Acceptance-only manual stepping
    now prevents wall-clock frames racing scripted terrain fixtures. The latest
    complete-flow rerun reached all gameplay gates but one screenshot timed out
    while a separate long-running trailer capture and browser daemon were using
    Chrome/GPU resources; that gate remained open until a bounded clean rerun
    passed.
  - Final result: after replacing HMR-sensitive `networkidle` waits with
    readiness-function gates and bounding error cleanup, the expanded harness
    exited code 0 on 4173 and rebuilt 4174 with zero console/page errors.
    `format:check`, 125 root tests, seven kernel tests, typecheck, and production
    build then passed from the formatted source; only the documented Vite
    > 500 kB Three.js advisory remains.
  - Closure: exact commands and outcomes are recorded with evidence tiers; no
    failing touched-area check is described as green.
- [x] **RU-0110.11 — Close documentation, review, git, and release gates.**
  - Update the relevant ADRs, camera/physics/UI contracts, playtest
    disposition, exploration map, worklog, evidence index, and this tracker.
  - Run the three explicit motto-v4 review passes and the missed-anything
    sweep; record user, team, and operational value plus remaining risks.
  - Re-audit all parallel work, run the full managed hook, `git add -A`,
    guarded commit without agent co-author trailers, push, publish the exact
    pushed source through Sites, verify terminal deployment and live routes,
    then update deployment provenance for the next agents.
  - Evidence: guarded gameplay commit `9c10d2b`, preserved research head
    `a8869ad`, Sites version 7 terminal success, HTTP 200 for Field 02 and both
    public evidence lab routes, full public production acceptance, zero captured
    console/page errors, and zero recent Worker error events.

#### RU-0601 + RU-0406 live task list — first understandable reward and spend

This is the next active work package. Its job is to close one complete
first-session rung before Farmfall adds more systems:

`notice a reachable opportunity → collect Scrap → return to Home Silo → choose
and fit a useful part → understand what changed → use that change in the world`.

The guidance layer must be derived from canonical game state. It must not become
a parallel quest state machine, add a second currency, or cover the playfield
with permanent instructions.

- [x] **RU-0601/0406.0 — Establish the current first-rung baseline.**
  - Fresh state starts with zero salvage.
  - The authored `first-recovery-cache` is 18 m from Home and awards 3 salvage.
  - The cheapest compatible modules cost 5; therefore the guaranteed first
    reward cannot currently buy a module.
  - The HUD already points toward nearby salvage and the workshop already
    performs canonical fitting, but neither surface explains the complete
    earn→return→spend→benefit chain.
  - Evidence level: Tier 1 current-source inspection plus the version-7
    production acceptance baseline. The full first-spend flow remains unproven.
- [x] **RU-0601/0406.1 — Add one pure first-rung stage resolver.**
  - Derive stages from existing canonical facts: first cache collected,
    current salvage, workshop reach, and fitted modules.
  - Proposed stages: `find-cache`, `collect-cache`, `return-home`, `choose-part`,
    `part-fitted`, and `free-explore`.
  - Return semantic objective, short mobile label, full accessible label,
    target position, and optional recommended module.
  - Keep the resolver read-only and renderer-independent; mutation remains in
    `performPrimaryAction()` and `installModule()`.
  - Tests: every stage, boundary distances, unexpected active rig, restored
    saves, already-fitted saves, and no contradictory stage.
- [x] **RU-0406.2 — Make the guaranteed first reward economically complete.**
  - Keep one currency: salvage/Scrap. Do not add credits, Favor, premium
    currency, or hidden tutorial grants.
  - Raise the uncollected authored first cache to the exact cheapest meaningful
    spend threshold, currently 5, or document and prove a better equally short
    authored payout path before implementation.
  - Preserve already-collected saves without retroactive duplication or a
    migration exploit; new/fresh profiles receive the corrected authored value.
  - Tests: fresh payout, collected-node idempotency, save/reload, malformed
    state bounds, and total/lifetime counters.
- [x] **RU-0601.3 — Turn the opportunity compass into contextual guidance.**
  - Use one compact objective chip plus the existing transient action prompt;
    keep the center and lower-middle playfield clear.
  - Express a verb and consequence, not quest bureaucracy:
    `Recover 5 Scrap`, `Return to Home Silo`, `Fit a part`, `Test the new grip`.
  - Preserve curiosity after the first part is fitted by collapsing back to
    world opportunities rather than continuing a forced tutorial rail.
  - Desktop and `390×844` layouts must preserve the playfield, 44 px touch
    targets, focus order, aria-live restraint, reduced motion, and player/
    developer surface separation.
- [x] **RU-0406.4 — Make the first workshop choice understandable and usable.**
  - Replace list-item click inference with explicit accessible install buttons
    or an equally strong native control contract.
  - Mark compatible, fitted, affordable, unavailable, and recommended states
    without relying on color alone.
  - Recommend a part because of its next world consequence, not because it is
    numerically cheapest. Current candidate: Lug tyres for Torque, tied to mud
    grip and the Long Furrow direction.
  - Keep other valid choices available; guidance may recommend but must not
    silently buy, lock the player into one build, or expose internal tuning.
  - Keyboard number keys, pointer, touch, and accessible names must invoke the
    same canonical `installModule()` path.
- [x] **RU-0406.5 — Make the fitted change perceptible.**
  - After fitting, explain the exact capability/traversal change and direct the
    player toward a nearby place where it matters.
  - Add a bounded success transition and feedback cue; respect reduced motion.
  - Do not claim the part helps where `effectiveProfile()` shows no meaningful
    change for the active rig.
  - Tests compare pre/post effective profile and player-visible consequence;
    browser evidence must show the fitted module survives save/reload.
- [-] **RU-0601/0406.6 — Add operator and acceptance evidence.**
  - Extend `render_game_to_text()` with the derived first-rung stage,
    recommended module, target, affordability, and completion reason.
  - Record semantic commands/checkpoints for collection and fitting without
    adding a second progression ledger.
  - Fresh browser flow must use real driving and real workshop interaction:
    no teleport, direct state grant, or direct `installRigModule()` shortcut.
  - Cover player and developer URLs, desktop and narrow view, keyboard,
    pointer, real touch, save/reload, reduced motion, and zero console/page
    errors on development, rebuilt preview, and public production.
  - Current evidence (2026-07-26): the finalized harness passed on `4173`
    development and the freshly rebuilt `4174` production-like preview with
    zero console/page problems. Both used real keyboard collection/return,
    pointer workshop fit, visible and persisted Lug tyres, six cameras,
    collision, reduced motion, desktop, and `390×844` coverage. The `4174`
    build also proved zero developer/private runtime asset bridges. Evidence:
    [first-rung acceptance addendum](../reviews/FIRST_RUNG_REWARD_AND_SPEND_ACCEPTANCE_2026-07-26.md#addendum-2026-07-26--finalized-4173-and-4174-acceptance).
    A later fresh production build passed the same full matrix on `4182` and
    strengthened the persistence wait to require the completed relay itself,
    not merely an earlier non-empty save. A subsequent full run used a
    `hasTouch` mobile context plus Chrome touch events to enter the world,
    acknowledge state-derived control lessons, hold the real touch direction
    buttons, collect through touch Act, return to Home, fit Lug tyres through
    touch, and verify the visible module after reload. Public Sites version 9
    then passed the complete real-touch and wider browser matrix with zero
    captured console/page problems. External-player comprehension evidence
    keeps this item in progress. Evidence:
    [Sites version 9 release](../reviews/SITES_VERSION_9_RELEASE_2026-07-26.md).
  - `render_game_to_text()` now includes a top-level first-rung summary with
    derived stage, objective, recommended module/rig, target, affordability,
    completion flag, and reason, while keeping `publicState(state, world)`
    intact underneath.
  - `publicState(state, world)` also now exposes `progression.workshopActionable`,
    the same derived spend-ready flag shared by `src/game/first-rung.ts`,
    the HUD, and the workshop panel; the lesson cue boundary now names
    `workshopLessonRelevant` explicitly in `src/game/control-guidance.ts`.
  - The naming cleanup landed on `main` as commit `8de9a5e`; public Sites
    release and external-player comprehension remain the open gates.
  - ADR-0030 is now historical; ADR-0034 records the simulation-vs-presentation
    boundary, and this session has wired `src/game/animation.ts` into the live
    renderer path (rig registration + `vehicleAnimationSystem.update(...)`).
    The canonical 4173 browser smoke test loaded the app without page errors.
- [-] **RU-0601/0406.7 — Close documentation and release.**
  - Append the relevant progression/UI ADRs, core-loop contract, exploration
    map, worklog, acceptance review, and this tracker.
  - Run the three motto-v4 passes, missed-anything sweep, format, typecheck,
    full tests, build, links, visual inspection, and complete browser matrix.
  - Preserve parallel work; run the full managed hook; commit without agent
    attribution; push `main`; save/deploy the exact pushed Sites source; append
    the deployment ledger and rollback target.
  - Closure: a fresh player can describe what they found, what they bought, and
    what became newly possible without reading project documentation.
  - Release evidence (2026-07-26): repair commit `5896833` is on
    `origin/main`; Sites version 9 deployed successfully; default and Field 02
    URLs returned HTTP 200; public real-touch/browser acceptance exited 0 with
    zero console/page problems. Release reconciliation and external-player
    comprehension remain open, so this item stays In progress.

#### Closed predecessor checklist — RU-0106 through RU-0109

- [x] Write failing contracts for RU-0106–RU-0109.
- [x] Gate background simulation and input behind explicit world entry.
- [x] Add one authored, reachable first salvage cache and canonical collection.
- [x] Add condition-zero immobility and auditable, non-rewarding recovery.
- [x] Separate absolute world time from activity elapsed time; migrate v4→v5.
- [x] Add keyboard, visible mouse, and touch recovery parity.
- [x] Pass typecheck, 108 root tests, seven kernel-probe tests, format, and build.
- [x] Pass Field 02 browser acceptance on ports 4173 and 4174 with zero captured
      console/page errors.
- [x] Record ADR/worklog/exploration/playtest closure and reconcile schema-v6
      planning.
- [x] Re-run the full gate after documentation settles.
- [x] Guarded `git add -A`, full motto hook attestation, commit, push, exact-source
      Sites version, production deployment, and smoke checks.

## 0. Repository, release, and continuity

- [x] **RU-0001 — Canonical project identity.** Rename the checkout, package,
      GitHub repository, and public title to **Rigs Unbound**.
  - Evidence: ADR-0005, `package.json`, Git remote
    `pranaysuyash/rigs-unbound`.
  - Closure: one local checkout on `main`; repository and product naming agree.
- [x] **RU-0002 — Guarded git workflow.** Install the managed v4
      `prepare-commit-msg`, `pre-commit`, and `commit-msg` gates, including the
      AI-co-author rejection.
  - Evidence: active files under `.git/hooks/`; prior guarded commits on `main`.
  - Closure: a normal commit passes only with fresh full-motto evidence and the
    required trailers.
- [x] **RU-0003 — Public Sites foundation.** Reuse the existing Sites project
      and publish version 4 from commit `aa82cee`.
  - Evidence: Sites version 4 source provenance and the live
    <https://rigs-unbound.suyashpranay.chatgpt.site> URL.
  - Closure: production deployment succeeds and the URL responds.
- [x] **RU-0004 — Preserve and publish the 2026-07-26 integration batch.**
  - Scope: gameplay repairs/additions, obstacle hot-path memoization, Rapier
    lab continuation, Box3D physical-wheel probe, playtest evidence,
    progression decision, trailer tooling/assets, research, and task tracking.
  - Evidence: guarded commit
    `1e7992125824a850eb27a9f9d2bbdbc95b229e2b`; local and `origin/main`
    alignment; Sites version 5 sourced from that exact commit; terminal
    production deployment `succeeded`; live HTTP 200 responses for Field 02,
    the Rapier Physics Lab, and the Box3D Probe.
  - Closure: `git add -A`; full v4 hook attestation; guarded commit; push to
    `origin/main`; Sites version saved and production deployment succeeded from
    that exact pushed commit; live smoke check recorded.
- [x] **RU-0005 — Keep deployment provenance current through version 7.**
  - Evidence: `progress.md`, the Sites runbook deployment ledger, the
    deployment acceptance addendum, and this tracker name version 7 and source
    commit `a8869ad25f72929b62b6722cb262c91b2b6c7999`.
  - Closure: after every deployed commit, update `progress.md` and this tracker
    with the deployed source SHA and evidence tier. Reopen this recurring gate
    when a newer production release is created.
- [ ] **RU-0006 — Bound repository evidence growth.**
  - Context: the current raw playtest corpus is about 84 MB and contains useful
    discovery history as well as failed exploratory runs; curated review and
    comms assets are separate.
  - Closure: record an explicit retain/archive/ignore policy without deleting
    historical evidence; define which future raw captures stay local and which
    summaries/screenshots belong in git.

## 1. Current playable and first-rung repair

- [x] **RU-0101 — Field 02 traversal substrate.**
  - Evidence: terrain, routes, surface/grip/grade, collision, minimap, world
    memory, three rigs, six cameras, schema-v4 persistence, and two-port browser
    acceptance.
- [x] **RU-0102 — Rig fantasy differentiation gate (simulated players).**
  - Evidence: three independent persona reports and
    [synthesis](../reviews/PLAYTEST_SIM_SYNTHESIS_2026-07-25.md).
  - Result: Torque, Spark, and Drift were described as different machine
    fantasies rather than merely different speeds.
  - Boundary: human taste evidence remains open.
- [x] **RU-0103 — Make rig switching spatial.**
  - Evidence: `RIG_SWITCH_RANGE`, reason-coded refusal, near/far/spawn tests,
    and updated acceptance driver.
  - Closure: a remote rig cannot be selected as a free teleport; onboarding
    swaps at the shared home pad remain possible.
- [x] **RU-0104 — Add reversible terrain grading.**
  - Evidence: blade cut/fill mode, save-compatible attachment recovery,
    keyboard/touch controls, state tests, and visible capability label.
  - Closure: Torque can lower or raise soft terrain through one project-owned
    attachment state.
- [x] **RU-0105 — Remove obstacle-field hot-path recomputation.**
  - Evidence: bounded deterministic cell memoization and the complete test and
    browser acceptance suites.
  - Closure: collision/prop queries reuse stable generated cells without
    changing deterministic outcomes.
- [x] **RU-0106 — Fix playtest P0 B1: title card re-entry.**
  - Evidence: disabled pre-entry input, fixed-step gate, immediate `[hidden]`
    CSS contract, keyboard focus transfer, second-Space primary action, and
    two-port browser regression.
  - Closure: the welcome plate neither reopens nor permits background
    simulation; focus enters the canvas once.
- [x] **RU-0107 — Fix playtest P0 B2: first salvage collection.**
  - Evidence: authored `first-recovery-cache`, reachability/slope tests,
    canonical primary-action collection, player prompt, save/reload, and
    two-port browser acceptance.
  - Closure: a fresh profile can find, understand, collect, and retain the
    first reward.
- [x] **RU-0108 — Fix playtest P0 B3: zero-condition recovery soft-lock.**
  - Evidence: ADR-0019, immobility and repeat-protection tests, persisted
    recovery audit fields, contextual desktop recovery button, keyboard,
    mouse, and isolated real-touch browser paths.
  - Closure: recovery awards nothing, restores 25% condition at Home Silo, and
    cannot be repeated as a resource exploit.
- [x] **RU-0109 — Fix playtest P0 B4: phase-clock consistency.**
  - Evidence: ADR-0019, absolute `worldTimeMinutes`, derived phase boundaries,
    v4→v5 migration, round-trip tests, and browser day→gloam→night→dawn cycle.
  - Closure: activity time and world time are separate; visible time is
    monotonic and survives reload.
- [x] **RU-0110 — Close cheap P1/P2 playtest defects.**
  - Scope: hood clipping, Drift spawn/recovery and extreme-grade behavior,
    player-vs-lab navigation, default debug telemetry, spawn occlusion,
    prop-aware camera obstruction, action labels, and record naming.
  - Gate: each defect has a reproduction, fix, and browser evidence; no
    developer fixture masquerades as a player objective.

## 2. First complete game loop — Farmfall Slice 01

- [x] **RU-0201 — Execute Phase 0 playability repair.**
  - Depends on: RU-0106 through RU-0110.
  - Source: [Farmfall plan](FARMFALL_SLICE_01_2026-07-25.md).
  - Closure: all Phase 0 gates green before new ecology state lands.
- [~] **RU-0202 — Emission/listener system.**
  - Current evidence: `signature.ts` implements a source-only experimental
    fixture with named acoustic/illumination/thermal-proxy channels, explicit
    generic operating context, no cached-telemetry/activity coupling, no
    universal score/falloff, and four passing focused tests.
  - Gate: operator accepts ADR-0025; one real listener owns sensitivity,
    falloff/occlusion/thresholds; active/inactive operating semantics,
    fixed-step behavior, replay, accessible feedback, and browser evidence pass.
  - 2026-07-27: ADR-0025 **Accepted** by operator. Remaining gate: the first
    real listener (RU-0204) with the evidence list above.
- [ ] **RU-0203 — Cultivation/crop loop.**
  - Finding: current v6 cannot be silently extended; deformation, furrows, and
    authored `tilled` surfaces cannot prove cultivation-cut provenance.
  - Gate: operator accepts ADR-0026 sequencing, schema-v7 owner, harvest value,
    post-sow terrain policy, and measured bounds; then
    plough→raise→sow→grow→harvest persists and invalid entries recover visibly.
  - 2026-07-27: ADR-0026 **Accepted** by operator; cultivation admitted first
    on schema-v7 ownership (Survey Route rebases or defers). Remaining gate:
    the vertical pass with harvest value, post-sow terrain policy, and bounds.
- [ ] **RU-0204 — Night threat ecology.**
  - Gate: bounded threats respond to explicit signature channels, damage rigs
    or crops, can be repelled through vehicle/world verbs, and dissolve at dawn.
- [ ] **RU-0205 — Dawn consequence record.**
  - Gate: one bounded, persisted summary explains crops saved/lost, rig damage,
    threats repelled, and mastery changes.
- [ ] **RU-0206 — Journey + Verb Mastery kernel.**
  - Decision: ADR-0018 accepted.
  - Gate: situation-weighted accrual resists repetition grind; per-verb power
    composes through `effectiveProfile()`; migration and balance caps tested.
- [ ] **RU-0207 — Farmfall presentation and full browser acceptance.**
  - Gate: one understandable day→night→dawn loop on desktop and narrow view,
    save/reload, no console errors, player-facing feedback, and updated docs.
- [ ] **RU-0208 — Repeat fresh-eyes playtests.**
  - Gate: same three simulated personas plus at least one real human session;
    compare comprehension/fun language against the pre-Farmfall baseline.

## 3. Vehicle, physics, and capability platform

- [x] **RU-0301 — Project-owned semantic vehicle intent and dynamics ports.**
  - Evidence: `src/dynamics/contracts.ts`, normalized intent, Rapier adapter,
    tests, and Physics Lab.
- [x] **RU-0302 — Rapier raycast-wheel Physics Lab 01.**
  - Evidence: four surfaces, fixed stepping, capture/reset, six cameras,
    telemetry/debug UI, unit and browser acceptance.
- [x] **RU-0303 — Box3D physical-wheel Probe 01.**
  - Evidence: exact `box3d-wasm@0.2.0` pin, four physical wheels/joints,
    complete assembly capture/restore, unit tests, desktop/narrow browser
    acceptance, and zero console problems.
  - Boundary: evidence compares controller families; it does not select a final
    physics engine.
- [-] **RU-0304 — Shared collision-role/mask fixture.**
  - Current-runtime slice complete: Field 02 owns solver-independent
    terrain/rig/cargo/obstacle/structure/hazard/projectile/trigger/sensor/
    decorative roles, fail-closed unknown handling, typed contact identity, and
    browser-visible policy telemetry.
  - Evidence: `collision.test.ts`, `world-collision.test.ts`,
    [ADR-0037](../decisions/ADR-0037-solver-independent-dynamic-world-collision-authority.md),
    and focused canonical browser acceptance.
  - Remaining gate: Rapier and Box3D express the same project-owned
    blocked/fellable/trigger/sensor/hazard/attachment roles without solver
    handles in game state. This still requires ADR-0023/operator sign-off and a
    named player-fantasy comparison question.
- [ ] **RU-0305 — Unstable trailer + lifting arm activity.**
  - Status: proposed candidate harness, not mandatory solver work; requires
    operator sign-off on ADR-0023.
  - Gate: one rescue/construction/recovery job exercises attachment ownership,
    breakage, load, capture/recovery, feedback, and candidate comparison.
- [x] **RU-0306 — Camera-obstruction query port.**
  - Closure: fulfilled by RU-0110.3/0110.5 rather than implemented again.
    `scene-query.ts` composes terrain, procedural obstacles, felled world
    memory, and authored structures into one solver-independent nearest-hit
    result. Chase/side/hood acceptance proves signed rear framing,
    structure/tree pull-in, felled-tree recovery, and no self-intersection.
- [ ] **RU-0307 — Next genuinely different motion family.**
  - Candidates: bicycle balance, tracks, buoyancy/hover, flight, 6-DOF, or
    articulation.
  - Decision gate: select the family that answers a product fantasy and exposes
    a new body-state contract; do not add another wheel-tuning demo.
- [>] **RU-0308 — Jolt comparison.**
  - Dependency: RU-0304 or RU-0305 must pose a constraint/controller question
    that Jolt can answer better than a duplicate benchmark.

## 4. Progression, economy, state, and content

- [x] **RU-0401 — Minimal economy grammar.**
  - Scrap is the one early spendable resource; Insight and Favor are
    non-spendable progression; Parts are concrete inventory.
- [x] **RU-0402 — Progression spine decision.**
  - ADR-0018: per-rig Journey, per-verb Mastery, and profile-level Insight; no
    universal player XP or aggregate power score.
- [>] **RU-0409 — Mission proposition and progression runtime foundation.**
  - Evidence: ADR-0033, `src/game/progression.ts`, derived mission generators,
    canonical activity reward routing, schema-v9 progression state, v8 migration,
    public-state observability, full local verification, and a live desktop
    `?acceptance=field-02` contract board that mounts with field-state row data
    and the `Field contracts` header/summary pair.
  - Gate: reconcile ADR-0033 with ADR-0018; keep the mission-board/acceptance
    surface decision explicit, and resolve the compact/mobile exposure policy
    separately before calling this product-complete. See
    `docs/reviews/CONTRACT_BOARD_COMPACT_EXPOSURE_POLICY_REVIEW_2026-07-28.md`
    for the current desktop-first recommendation and remaining compact-shell gap.
- [ ] **RU-0403 — Canonical module slot and compatibility model.**
  - Gate: immutable blueprint slots + mutable installed instances + explicit
    incompatibilities + derived capabilities; one validator and one
    `effectiveProfile()` composition path.
- [ ] **RU-0404 — Torque Restoration Proof 01.**
  - Gate: start visibly dilapidated; stabilize and repair; fit one signature
    working attachment and one support choice; body/sound/handling/history show
    the transformation without a universal stat ladder.
- [ ] **RU-0405 — Save schema v7 and migration observability.**
  - Context: schema v6 is now owned by ADR-0019 world-clock, emergency
    recovery state, and canonical multi-rig Home berths.
  - Gate: crops/mastery/dawn/signature state migrate from v6 with reason-coded
    recovery, bounded data, round-trip tests, and operator-visible summary.
- [ ] **RU-0406 — First job and first meaningful spend.**
  - Gate: a new player reaches, understands, earns, and spends the first Scrap
    without reading project docs.
- [>] **RU-0407 — Favor, Parts, NPC barter, and contracts.**
  - Dependency: first spend and Farmfall loop must prove the core economy.
- [>] **RU-0408 — Player trading or real-money systems.**
  - Dependency: explicit product decision, server authority, ledger/escrow,
    abuse controls, reconciliation, and legal/operational review. No premium
    currency is currently proposed.

## 5. World, rendering, assets, and performance

- [x] **RU-0501 — Selective Kenney source-library audit.**
  - Evidence: local all-in-one bundle provenance, sampled CC0 evidence, pack
    previews, hashes, and selective-import policy; source bundle stays private.
- [ ] **RU-0502 — Import the first production-intent asset set.**
  - Gate: copy only chosen assets into a project-owned source/runtime pipeline;
    provenance manifest, preflight, stable semantic IDs, compression/budget,
    replacement path, and visual review.
  - 2026-07-28 evidence: the manifest/runtime bridge split is now documented as
    a delivery gate rather than a second asset truth source; two imported GLBs
    remain runtime-tested developer bridges while `publicRuntimeApproved`
    still blocks player-surface promotion. The evidence index for that slice is
    [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md),
    and the load-bearing boundary is now recorded in
    [ADR-0038](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md).
    The approval record template is also available from the package index for
    future operator sign-off, but no populated approval record exists yet. The
    operator-facing first-candidate checklist is also linked there, alongside
    the player-gate evidence note and pre-signoff draft that summarize why
    runtime bridge proof still does not mean player approval.
- [ ] **RU-0503 — Cold-cache and representative-device profile.**
  - Gate: production URL on at least one real phone and one lower-power desktop;
    first input-ready, route transfer, frame p95, memory/thermal observations,
    touch, audio, context-loss/recovery, and degraded path recorded.
- [ ] **RU-0504 — Boot progress and honest readiness telemetry.**
  - Gate: loading is visible and non-blocking; `firstControllableMs` measures
    real input readiness; invalid/oversized content has a readable reject path.
- [ ] **RU-0505 — Chunk/sourcemap/cache policy.**
  - Current finding: production build is green but retains a >500 kB Three.js
    chunk advisory.
  - Gate: intentional code-splitting and sourcemap publication policy; cache
    headers and route isolation measured, not guessed.
- [ ] **RU-0506 — World residency/streaming proof.**
  - Gate: deterministic chunk manifest, residency transitions, stable IDs,
    bounded memory, unload/reload recovery, and minimap/world-coordinate
    continuity.
- [>] **RU-0507 — WebGPU runtime branch.**
  - Dependency: measured device/browser evidence shows the branch answers a
    real renderer or performance question; no shadow renderer by default.

## 6. UI, accessibility, feedback, and public surface

- [ ] **RU-0601 — First-session guidance without quest spam.**
  - Gate: opportunity compass explains reachable verbs, first salvage, current
    rig action, recovery, and night choice while preserving curiosity.
  - 2026-07-28 evidence: the live runtime already proves derived mission
    propositions and nested progression tracks, but the player-facing mission
    acceptance surface is still a decision gate, not an accepted product claim.
- [ ] **RU-0602 — Remappable action map and device parity.**
  - Gate: keyboard, touch, and gamepad use named actions; remaps persist;
    focus-loss and stuck-key recovery pass.
- [ ] **RU-0603 — Accessibility profile completion.**
  - Gate: reduced motion, contrast, non-audio threat cues, keyboard focus,
    readable touch targets, zoom/text behavior, and WebGL failure fallback.
  - 2026-07-28 evidence: the public shell now exposes separate profile and save
    status bands that are visible on mobile width and exposed in the
    accessibility tree; spoken screen-reader narration remains the missing
    proof.
- [x] **RU-0604 — Separate player surface from evidence laboratories.**
  - Gate: labs remain reachable through an explicit developer/evidence route
    while the public field flow presents player goals rather than debug tools.
  - Evidence: RU-0110.8 browser matrix; the player surface hides laboratory
    navigation/diagnostics and admits no developer-only runtime bridge assets.
- [ ] **RU-0605 — Audio and haptic human review.**
  - Gate: a human listens to the procedural mix across load/slip/phase and
    records comfort/readability findings; haptic design remains capability- and
    accessibility-aware.
- [ ] **RU-0606 — Fleet/workshop information architecture.**
  - Gate: journey, mastery, modules, condition, and provenance remain legible
    without dashboard/card sprawl or a universal power score.
  - 2026-07-28 evidence: the garage/fleet roster spec now confirms the runtime
    already exposes enough public state for a read-only first slice; the
    missing proof is the overlay, not the data model.

## 7. Replay, sharing, multiplayer, auth, AI, and creator systems

- [ ] **RU-0701 — Time Trial Ghost 01.**
  - Gate: versioned semantic input record, deterministic checkpoints,
    divergence explanation, per-circuit best record, shareable artifact, and
    backward-compatible replay policy.
- [ ] **RU-0702 — Guest/local identity and save export/import.**
  - Gate: versioned local profile, recovery bundle, explicit ownership, and no
    account requirement for first play.
- [?] **RU-0703 — Account link and cloud-save conflict policy.**
  - Decision needed: provider and conflict semantics.
  - Gate before implementation: ADR covering local→linked migration, auth vs
    authorization, offline queue, conflict UI, deletion/export, audit trail,
    and recovery.
- [>] **RU-0704 — Asynchronous social layer.**
  - Dependency: RU-0701 and RU-0703. Candidate scope: ghosts, shared seeds,
    records, and curated creations before real-time co-op.
- [>] **RU-0705 — Small authoritative co-op.**
  - Dependency: deterministic/replay evidence, server authority, abuse
    boundaries, reconnect/host migration decision, observability, and operator
    recovery.
- [ ] **RU-0706 — AI proposal boundary.**
  - Gate: any AI-authored mission/dialogue/content is versioned, validated,
    reviewable, deterministic at runtime, and has fallback; AI never authorizes
    economy, safety, or durable-value mutations.
- [>] **RU-0707 — Creator/editor ladder.**
  - Order: versioned internal data → inspector/validator → data-only packs →
    curated sharing → sandboxed scripting only if needed → open publishing only
    after moderation/rights/rollback operations.

## 8. Research and skill-coverage queue

Tagging a skill is not evidence that its guidance was analyzed. Each cluster
closes only when its relevant recommendations are reconciled against current
code and linked to accepted, rejected, deferred, or implemented outcomes.

- [~] **RU-0801 — Game direction and reference-game atlas.**
  - Coverage: game-development, game-director, wide-open brainstorm, indie/
    studio reference games, mechanics, UI flows, leveling, editors, and
    open-world coherence.
  - 2026-07-27 progress: product vision synthesized into
    [ADR-0029](../decisions/ADR-0029-product-vision-machine-keeper-odyssey.md)
    as a proposed machine-keeper odyssey; long-term horizon doc cross-linked to
    ADR-0002, ADR-0018, and RU-0204; Parts/Favor economy spec drafted in
    [Parts and Favor Economy Spec](../exploration/PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md).
  - Gate: source register + pattern synthesis + concrete probes, with copied
    inspiration rejected in favor of transferable principles.
- [~] **RU-0802 — Three.js and browser-game systems.**
  - Coverage: Three.js fundamentals, geometry, materials, textures, lighting,
    animation, loaders, interaction, shaders, post-processing, gameplay
    systems, R3F/Drei alternatives, web-game foundations, and 3D web delivery.
  - Gate: every recommendation mapped to current architecture, a measured need,
    or an explicit rejection/defer reason.
- [~] **RU-0803 — Game art and asset pipelines.**
  - Coverage: game-art, image generation, sprite pipeline, web 3D asset
    pipeline, 2D/3D asset production, Kenney, LOD/compression/provenance, and
    art-direction consistency.
  - Gate: first production-intent asset set and documented source→runtime
    pipeline, not another unbounded asset catalog.
- [~] **RU-0804 — Physics, animation, and simulation catalog.**
  - Coverage: the supplied JS/Python workbook, Rapier, Box3D, Jolt, Havok,
    cannon-es, ammo.js, character/vehicle controllers, fluids, destruction,
    IK, procedural animation, and deterministic/replay implications.
  - Gate: question-led experiments behind project-owned ports; no package
    collection for its own sake.
- [~] **RU-0805 — UI, accessibility, and frontend delivery.**
  - Coverage: game UI frontend, Three.js UI design, responsive controls,
    onboarding, HUD legibility, settings, accessibility, and public website.
  - Gate: screenshot/device review and accessibility acceptance tied to the
    current player job. Browser and accessibility-tree proof now cover the
    visible profile and save/recovery lines; spoken narration proof remains the
    next open closure step.
- [~] **RU-0806 — Testing and browser tooling.**
  - Coverage: game-testing, game-playtest, Browser/Playwright/Webwright,
    Chrome DevTools, deterministic hooks, visual evidence, performance traces,
    and fresh-eyes playtesting.
  - Gate: reusable harnesses cover direct load, interaction, resize, focus,
    save/reload, console, failure, and production smoke surfaces.
- [~] **RU-0807 — Multiplayer, auth, backend, economy, and safety.**
  - Coverage: multiplayer skill, Supabase/Postgres, Nakama/Colyseus,
    authorization, durable-value ledgers, moderation, privacy, abuse, and
    operator recovery.
  - Gate: ADRs and threat/failure models precede any public shared mutation.
- [~] **RU-0808 — WebGPU and performance.**
  - Coverage: WebGPU skill, browser compatibility, worker/off-main-thread
    options, WASM/threading/COOP-COEP, culling/LOD/streaming, caching, PWA, and
    representative-device budgets.
  - 2026-07-27 progress: corrected the WebGPU readiness analysis after a fresh
    read of `src/game/renderer.ts`; documented that the current build is WebGL-only
    in practice because of `EffectComposer`/`UnrealBloomPass`/FXAA and two inline
    GLSL `ShaderMaterial`s (water, state-shell aura); published the revised W1
    ladder and backend-policy evidence matrix in
    [WebGPU and Web Performance Analysis](../research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md).
  - Gate: measured profile data selects the next experiment.
- [x] **RU-0809 — Sites deployment workflow.**
  - Evidence: existing Sites project reused, source-provenance versions,
    packaging runbook, deployment status polling, and public URL.
  - Continuing duty: RU-0005.

## 9. Session-wide synthesis, provenance, and authority closure

This section captures the work that the 2026-07-26 session inventory found
outside the earlier tracker. It is not a second roadmap: these tasks repair the
canonical product/decision trail that every numbered workstream consumes.

- [x] **RU-0901 — Canonical compositional episode grammar.**
  - Scope: record the seven-part grammar
    (`Rig identity + Place + Contract graph + Pressure curve + Rule modifier +
Discovery chain + Persistent consequence`), the pressure/modifier/
    discovery/consequence taxonomy, and the mechanic lattice.
  - Include: failure-generated recovery contracts, VehiclePassport history,
    social footprint, behavioural cargo, cross-rig mysteries, adaptive HUD
    lenses, post-run consequence summaries, and automatic story captures.
  - Closure: one project-local proposal links the existing mechanic grammar,
    VehiclePassport, activity, persistence, replay, and world-memory contracts
    without claiming operator acceptance.
  - Evidence:
    [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).
- [x] **RU-0902 — Storm Relay and non-privileged frontier proof.**
  - Scope: capture the complete Storm Relay experiment for Torque, Spark, and
    Drift, including rising water, fragile cargo, radio interference,
    capability-specific solutions, persistent success, and stranded-rig
    recovery on failure.
  - Boundary: the farm-to-city fringe is a dense test biome, not the universe's
    privileged center; underwater, orbital, miniature, fantasy, procedural, and
    other worlds remain equally valid.
  - Closure: the proposal states what it tests, what remains reusable, its
    coherence/admission checks, and why it is not automatically the next
    implementation.
  - Evidence:
    [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).
- [x] **RU-0903 — Decision-provenance and sign-off audit.**
  - Scope: extend the completed physics audit across ADR-0006, ADR-0012,
    ADR-0018, ADR-0021, Farmfall, Time Trial Ghost, and other “operator
    direction” claims.
  - Gate: distinguish direct operator statement, explicit sign-off,
    operator-supplied AI/third-party proposal, agent inference, and runtime
    evidence; correct status append-only.
  - Closure: every load-bearing Accepted decision has a traceable sign-off or is
    returned to Proposed/Deferred without deleting its history.
  - Closure evidence (2026-07-26): added the canonical
    [decision register](../decisions/README.md) and
    [cross-session provenance audit](../reviews/DECISION_PROVENANCE_AND_RECOMMENDATION_STATUS_AUDIT_2026-07-26.md);
    corrected ADR-0006/0012 scope, returned unsupported load-bearing ADR-0021
    to Proposed, reclassified technical ADR-0022/0024 as implemented evidence,
    preserved the documented direct sign-off behind ADR-0018, and bounded
    Farmfall/Time Trial plan authority without removing them from the active
    work queue.
- [x] **RU-0904 — Tracker and authority deduplication.**
  - Scope: reconcile RU-0110.3 versus RU-0306, local technical acceptance versus
    product acceptance, and overlapping research/live-implementation entries.
  - Closure: every active item has one owner, one status, one dependency chain,
    and one evidence ceiling.
  - Closure evidence (2026-07-26): preserved both decisions while resolving the
    duplicate `ADR-0023` identifier; solver-neutral dynamics remains ADR-0023
    and the browser-harness lifecycle decision is ADR-0024. Marked RU-0306
    fulfilled by the already verified RU-0110.3/0110.5 scene-query work instead
    of scheduling a duplicate implementation. The decision register separates
    local implementation evidence from product acceptance; joint packages
    RU-0601/0406 and RU-0206/0405 retain one dependency order rather than
    parallel truth sources.
- [x] **RU-0905 — Canonical motto-v4 stale-reference correction.**
  - Finding: project `motto_v4.md` declared v4 canonical but one section still
    referenced a legacy, non-canonical motto source.
  - Gate: locate and correct the canonical upstream instruction source, rerun
    `agent-start`, and confirm generated project surfaces no longer reintroduce
    the stale reference.
  - Closure evidence (2026-07-26): corrected
    `/Users/pranay/Downloads/motto_v4.md`, `/Users/pranay/AGENTS.md`,
    `/Users/pranay/Projects/AGENTS.md`, and
    `/Users/pranay/Projects/agent-start`; made the bootstrap use one v4 source
    with a v4 workspace fallback; removed the generated “legacy bridge”
    contract; aligned canonical context paths to lowercase `docs/context`; ran
    `bash -n`; regenerated this project twice after the instruction changes;
    and confirmed no stale legacy startup, clause, source, bridge, or uppercase
    context-path references remain in the live stack. Legacy motto filenames are
    absent.
- [x] **RU-0906 — Research recommendation status-inflation audit.**
  - Scope: reconcile “Adopt,” “Approved,” “Used,” and implementation-authority
    labels across library, engine, UI, asset, and tooling evaluations.
  - Closure: every label is backed by current code/evidence and sign-off or is
    relabelled Candidate/Proposed/Experimental/Rejected/Deferred.
  - Closure evidence (2026-07-26): the decision register defines the canonical
    recommendation vocabulary; a tested reusable audit reports 44
    context-sensitive review candidates; every candidate class is dispositioned
    in the provenance audit; high-impact physics/library/GSAP claims carry
    current status tables; and surviving false operator-authorship wording in
    ADR-0006/0012 is withdrawn at the point of use. The audit remains a
    continuing review tool, not a zero-warning lint gate.
- [?] **RU-0907 — Evidence-lab production-surface decision.**
  - Scope: decide whether Physics Lab and Box3D Probe remain direct production
    routes, become developer-only build entries, or move to a separate evidence
    deployment.
  - Dependency: operator sign-off on ADR-0023 and alignment with RU-0604.
  - Closure: build, navigation, deployment, documentation, and rollback all
    express the same accepted policy.
- [ ] **RU-0908 — Session-wide requirement completion audit.**
  - Gate: recheck every explicit requirement, task ID, proposal, test,
    acceptance condition, deferred item, and decision against current code,
    runtime, docs, and external evidence.
  - Closure: no item is called Done from intent, documentation, or narrow tests;
    unresolved work remains visibly active with a concrete closure path.
- [x] **RU-0909 — Internal wide-open next-tranche arbitration.**
  - Scope: revisit the next product proof from first principles with internal
    Champion, Strategist, Future Self, Methodologist, Cartographer, Archivist,
    Data Steward, Skeptic, Trickster, Executioner, and Outsider roles; use no
    external models.
  - Closure: preserve disagreement, convergence, kill criteria, sequencing
    proposal, and the operator-sign-off boundary in one durable artifact.
  - Evidence:
    [Wide-Open Next-Tranche Arbitration](../exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md).
    The document proposes Unbound Passage before Signal Break while preserving
    Farmfall; it does not silently change the accepted roadmap.

## 10. Recurring acceptance gates

- [ ] **Before each commit:** re-read current status; classify every local
      item; inspect hooks and attribution; run targeted tests, typecheck, build,
      formatting, diff check, and the risk-appropriate browser path.
- [ ] **Before each deployment:** push the exact validated commit; package that
      exact source; save one Sites version; deploy only that version; poll to a
      terminal state; smoke the production URL.
- [ ] **Before each “done” claim:** three review passes; user/business/internal
      value; exact files/commands/outcomes; verified vs inferred; remaining gaps
      and hardening paths; uncommitted-state check; “Anything else?” answer.
- [ ] **After every fresh playtest or research pass:** add new findings here,
      update the exploration map, and route decisions to an append-only ADR before
      implementation.

## Addendum (2026-07-27) — next vertical recommendation pointer

The current recommendation for C1 is now cross-linked from
`docs/reviews/NEXT_VERTICAL_RECOMMENDATION_UNBOUND_PASSAGE_2026-07-27.md`.
That note records the same sequencing boundary in a durable review artifact
without changing the runtime lane or erasing the Farmfall alternative.

## Anything else?

Yes. The immediate product risk is no longer “can a browser render a vehicle
world?” The current build proves that. The risk is whether a first-time player
can reach a meaningful job, consequence, and improvement without searching for
the game inside an impressive systems playground. The dependency order is:

`publish current evidence → repair the first rung → complete Farmfall →
repeat external playtests → expand physics/world/social breadth only when the
game loop asks a sharper question`.

## Addendum (2026-07-27) — integration-first roadmap pointer

The project has a strong persistent substrate but still presents activities as
separate minigames. The integration-first analysis and roadmap at
`../exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`
captures the current integration gaps (dangling systems, UI seams, missing
contract ledger and episode runner) and proposes concrete work that does not
require editing the parallel-owned `src/game/` runtime. Agents should read it
before proposing new modes, activities, or UI panels.

## Addendum (2026-07-27) — unified UI shell coherence slice completed

The first integration-first slice now exists in
`docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md` and the dated addendum
at `docs/WORKLOG_ADDENDUM_2026-07-27.md`. It implements the single overlay
manager, unified map/radar/pause shell, and verification tool while preserving
the parallel-owned runtime. The next slices named in the roadmap are the
Contract Ledger overlay, the Garage / fleet roster overlay, and the
Labs-as-instruments drawer.

## Addendum (2026-07-27) — unified UI shell specification drafted

The shell now has a durable spec at
`docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`. It records the overlay
stack, accessibility contract, input contract, z-order, and visual rules that
the completed shell slice must continue to satisfy as the next overlay layers
come online.

## Addendum (2026-07-27) — garage/fleet roster specification drafted

The fleet sheet now has a durable spec at
`docs/research/GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md`. It captures the roster
as a character sheet over current public rig summaries, with read-only first
slice rules, accessibility, and the bridge between the active rig and the rest
of the fleet.

## Addendum (2026-07-27) — episode runner specification drafted

The episode runner now has a durable spec at
`docs/research/EPISODE_RUNNER_SPEC_2026-07-27.md`. It records the composition
engine above the loop so episodes can stay explainable, bounded, and durable
without turning into a second quest ledger; the load-bearing composition
boundary is now captured in
`docs/decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md`.

## Addendum (2026-07-27) — episode runner decision recorded

The episode runner composition decision now has a durable ADR at
`docs/decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md`.
It keeps the runner as a read-only composition layer above the contract ledger
and core loop rather than a second quest authority.

## Addendum (2026-07-27) — contract ledger specification drafted

The contract ledger now has a durable spec at
`docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md`. It records the read-only
overlay contract, row model, source mapping, and validation rules that the
next implementation slice must satisfy without becoming a second mission
authority.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this tracker. This tracker still owns the current
execution order and acceptance gates; the new note carries the wider
machine-keeper thesis and long-range product direction.

## Addendum (2026-07-28) — vehicle-family atlas expansion

The vehicle exploration lane now has a durable family registry and proposed
canonical spec at
`docs/exploration/VEHICLE_FAMILY_ATLAS_AND_CANONICAL_SPEC_2026-07-28.md`.
Three generated reference sheets were added for utility/tow,
rescue/emergency, and extreme/aspiration families. This is Tier 4 visual
exploration evidence only; it does not promote any image or mesh into runtime
truth. The next gate is candidate selection plus a reconstruction-ready
isolated reference package with dimensions, sockets, failure variants, and
uncertainty notes.

### Anything else?

Yes. The atlas must eventually include failure and occlusion fixtures so the
selection process measures recoverability and gameplay readability, not only
hero-shot appeal.

## Addendum (2026-07-28) — reconstruction package expansion

The vehicle exploration lane now includes a utility/tow turnaround, a
five-mode same-vehicle board, and an isolated snow-crawler candidate. The
dedicated intake contract is
`docs/research/UTILITY_TOW_RECONSTRUCTION_INTAKE_2026-07-28.md`.
Evidence remains Tier 4 visual/manual for the references and Tier 1 for the
proposed spec. No runtime manifest or GLB admission has occurred. The next
gate is strict multi-view/spec validation followed by a bounded reconstruction
candidate and browser proof.

### Anything else?

Yes. Generated turnaround views must not be promoted to exact orthographic
truth; their uncertainty is part of the asset record and must survive into the
mesh review.

## Addendum (2026-07-28) — contract ledger source-surface recheck

The contract-ledger slice remains a read-only projection layer in the current
runtime:

- `publicState(state, world)` in `src/game/state.ts` already exposes the
  contract inputs named by the spec.
- `src/game/affordances.ts` already supplies reason-coded affordance
  resolution for visible/deferred/incompatible offers.
- The first durable slice is still the board overlay and its documentation,
  not a new authority, save schema, or mutation path.

This adds evidence for the open RU-0601 / contract-ledger follow-up work
without touching `src/game/`.

## Addendum (2026-07-28) — garage/fleet roster shell reuse recheck

The garage/fleet roster lane still points at a read-only overlay proof:

- reuse the unified shell manager and focus contract,
- keep the active rig visually primary,
- derive from `publicState` instead of introducing a second garage model,
- treat presentation/focus behavior as the next proof, not more state plumbing.

That keeps RU-0606 aligned with the shell contract and the current runtime
shape.

## Addendum (2026-07-28) — input remap registry gap recheck

The accessibility/input lane still has one clear missing contract layer:

- first-use guidance is canonical,
- the opportunity compass is contextual,
- but the persisted binding registry is still absent.

The next proof should be a canonical action-layout source of truth with
reload-safe remap persistence, not a second help-only map.

## Addendum (2026-07-28) — labs drawer contract drafted

The labs lane now has a durable in-world-instrument contract at
`docs/research/LABS_AS_IN_WORLD_INSTRUMENTS_CONTRACT_2026-07-28.md`.

- The labs remain evidence fixtures, not a second game.
- The next proof is a same-shell drawer with preserved runtime context.
- The roadmap now has a named target for the `physics-lab.html` /
  `box3d-lab.html` continuity gap.

## Addendum (2026-07-28) — radial quick-action wheel contract drafted

The radial wheel lane now has a durable contract at
`docs/research/RADIAL_QUICK_ACTION_WHEEL_CONTRACT_2026-07-28.md`.

- The authored wheel in `src/game/radial-ui.ts` is now a named interaction
  surface instead of anonymous dead code.
- The next proof is a quick-action overlay that stays secondary to the rig and
  canonical action model.
- Keep the wheel aligned with the input registry / accessibility contract.

## Addendum (2026-07-28) — world graph and place contract drafted

The world graph lane now has a durable contract at
`docs/research/WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md`.

- Authored sites, routes, and discovery anchors now have a named topology
  contract.
- The contract ledger and episode runner can cite one canonical place source.
- The next proof is topology validation and source traceability, not another
  map metaphor.

## Addendum (2026-07-28) — streaming residency boundary recheck

The existing streaming/residency contract now sits below the new world-graph
contract:

- topology now lives in `docs/research/WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md`,
- residency remains the separate chunk-state/lifecycle boundary,
- the current world is still single-residency until measured scale pressure
  requires chunk activation.

## Addendum (2026-07-28) — runtime reachability audit and the Missing Middle

A wide-open brainstorm run against measured facts produced one finding that
changes the priority of several open items, plus one correction to this tracker.

### New standing instrument

`tools/audit-runtime-reachability.mjs` (six tests in
`tools/audit-runtime-reachability.test.mjs`) walks the transitive import graph
from the real entry points and reports every non-test module the player cannot
reach. Current result on this checkout:

- 78 non-test source modules, 48 entry-reachable
- **30 unreachable modules, 2,365 lines, 28 of them with passing tests**

Historical note: this 30-of-78 snapshot is the room's measurement context.
The current module-by-module classification lives in the ownership matrix
review and the short disposition note.

```bash
node tools/audit-runtime-reachability.mjs
node --test tools/audit-runtime-reachability.test.mjs
```

The next safe move is classification, not cleanup: split the unreachable set
into parallel-owned work, future-bound contracts, lab-only surfaces, and
genuinely dead code before any pruning decision.

### Correction — RU-0601/0406.6 contains a false wiring claim

This tracker and
[ADR-0031](../decisions/ADR-0031-renderer-delegates-rig-local-animation-to-vehicle-animation-system.md)
both state that `src/game/animation.ts` is wired into the live renderer path.
This was false in an earlier live checkout and is now corrected in this session:
`src/game/renderer.ts` now imports and updates `vehicleAnimationSystem`
on every frame. The original wording is still useful as provenance history, but
the implementation-claim assertion is now corrected.

Closure for this correction: tracker and ADR are now aligned; residual risks are
now in external-player comprehension and release-completion evidence, not ownership wiring.

### New items

- [ ] **RU-0910 — Wire three tactical verbs (the Missing Middle experiment).**
  - Scope: `tire-pressure.ts`, `winch-physics.ts` + `fleet-recovery.ts`, and
    `radial-ui.ts` as the surface that hosts them.
  - Why these three: they fill the empty step between departure and arrival,
    which four independent brainstorm roles identified as the reason the current
    build reads as a checklist rather than a journey.
  - Dependency: **operator clearance for `src/game/` collision** per `AGENTS.md`.
    No agent may begin this without that clearance.
  - Gate: each verb is a commitment with a reversal cost, reachable through the
    canonical primary-action/named-action path, persisted where it should be,
    with one player-visible consequence and tests. Target ~300 lines total.
  - Decision value: this is the cheap experiment that resolves the Champion vs.
    Executioner disagreement about whether the unreachable set is a parts bin or
    a mirage. If wiring requires redesign, the parts-bin defence fails and the
    correct move becomes explicit archival.

- [?] **RU-0911 — Reachability Budget policy.**
  - Decision needed: whether unreachable-module count becomes a tracked ceiling
    (`--max N`) in the verification path, with a declared allowance for
    deliberate pre-positioned work.
  - Boundary: budget, not purity gate. Reported by default; failing only under
    an explicitly adopted policy, matching the doc-authority audit convention.
  - Gate before adoption: operator sign-off on the ceiling and the allowance.

- [?] **RU-0912 — Act I sequencing: fleet versus one machine that changes.**
  - Open disagreement recorded by the brainstorm's Outsider role: every current
    document treats the three-rig fleet as foundational, and no evidence says a
    first-session player wants three machines.
  - Alternative: Act I is one machine that visibly transforms; the fleet is
    Act II. This sequences the Living Atlas Odyssey rather than contradicting it.
  - Gate: operator decision. It changes Act I and therefore RU-0404, RU-0606,
    and the first-rung guidance shape.

- [?] **RU-0913 — Single-rig disablement and recovery policy.**
  - Exploration: [Single-Rig Disablement and Recovery Exploration](../exploration/SINGLE_RIG_DISABLEMENT_AND_RECOVERY_EXPLORATION_2026-07-29.md).
  - Vision design space: [Recovery Web and Player Continuity Design Space](../exploration/RECOVERY_WEB_AND_PLAYER_CONTINUITY_DESIGN_SPACE_2026-07-29.md).
  - Proposed ADR: [ADR-0048](../decisions/ADR-0048-single-rig-failure-recovery-and-continuity.md).
  - Decision needed: if Act I begins with one rig, ordinary disablement should
    open a recovery constellation rather than a single current-runtime escape:
    home recall/teleport, reserved 25% Home Limp, character/vehicle switching,
    NPC or multiplayer help, earned rescue capacity, repair/mechanic calls,
    advanced self-repair, and physical stranded-rig recovery.
  - Gate: operator choice on which continuity paths are available at each
    campaign layer, what resource powers them, how social/multiplayer help
    enters, and whether true total loss exists outside a declared hard mode.
  - Runtime dependency: future changes touch `src/game/state.ts`, recovery
    command/result surfaces, save/reload, cargo/attachment state, world time,
    and accessible shell announcements. No implementation was made in this
    exploration pass because the runtime collision remains active.

### Anything else?

Yes. The measured docs-to-shipping commit ratio over the last 100 commits is
roughly 3.3 : 1 (49 docs commits, 15 feature/fix commits). That is defensible as
the cost of an agent-parallel labour model right up to the point where a
document makes a claim the runtime contradicts. That point has now been reached
once. RU-0910 is deliberately specified as a wiring commit rather than another
contract note for exactly that reason.

Full room and build conditions:
[Reachability and the Missing Middle](../exploration/WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md).

## Addendum (2026-07-28) — wiring experiment is now the next concrete step

The next concrete artifact is the wiring experiment for
`src/game/radial-ui.ts`, `src/game/weather.ts`, and
`src/game/fleet-recovery.ts`:

- see `docs/exploration/WIRING_EXPERIMENT_RADIAL_WEATHER_RECOVERY_2026-07-28.md`;
- it is a falsifiable wiring path, not another contract note;
- it should surface one reachable verb and one visible outcome path.
- it also probes whether the read-only contract board can be the player
  choice surface for that proposition.

## Addendum (2026-07-28) — the choice surface now has a named contract

The player-facing acceptance layer is now named in
`docs/research/MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md`.

That keeps the current gate explicit in tracker language:

- the contract ledger remains a read-only projection,
- the acceptance surface carries focus, labels, and choice semantics,
- the command/result path remains authoritative for state change.

This should be treated as the named follow-on to the wiring experiment, not as
a separate mission authority or a second save path.

## Addendum (2026-07-28) — the row and announcement model is now the next proof slice

The concrete next proof target is now named in
`docs/research/MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md`.

That makes the tracker language more precise:

- the ledger projects rows,
- the acceptance surface chooses from them,
- the row contract handles focus, announcement, and selection state,
- the shell keeps the boundary accessible and recoverable.

## Addendum (2026-07-28) — board sectioning and visibility now have a contract

The presentation follow-on is now explicit in
`docs/research/MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md`.

That makes the tracker language sharper:

- the ledger explains the rows,
- the row contract explains selection and announcement,
- the section contract explains compact versus expanded board shape.

## Addendum (2026-07-28) — the board header and summary now have a contract

The orientation layer is now explicit in
`docs/research/MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md`.

That keeps the tracker language layered:

- the ledger derives rows,
- the board header orients the player,
- the section contract groups rows,
- the row contract announces and focuses the choice.

## Addendum (2026-07-28) — the history recap now has a contract

The board's memory layer is now explicit in
`docs/research/MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md`.

That keeps the tracker language layered:

- the ledger derives rows,
- the board header orients,
- the section contract groups,
- the row contract announces,
- the history contract keeps the board from turning into an archive wall.

## Addendum (2026-07-28) — the board transition and restore now have a contract

The board choreography is now explicit in
`docs/research/MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md`.

That keeps the tracker language layered:

- the ledger derives rows,
- the board header orients,
- the section contract groups,
- the row contract announces,
- the history contract remembers,
- the transition contract restores.

## Addendum (2026-07-28) — the board empty state now has a contract

The no-rows fallback is now explicit in
`docs/research/MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md`.

That keeps the tracker language layered:

- the ledger derives rows,
- the board header orients,
- the section contract groups,
- the row contract announces,
- the history contract remembers,
- the transition contract restores,
- the empty-state contract explains when there is nothing to show.

## Addendum (2026-07-28) — the board loading state now has a contract

The in-progress refresh state is now explicit in
`docs/research/MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md`.

That keeps the tracker language layered:

- the ledger derives rows,
- the board header orients,
- the section contract groups,
- the row contract announces,
- the history contract remembers,
- the transition contract restores,
- the empty-state contract explains no rows,
- the loading contract explains rows still rebuilding.

## Addendum (2026-07-28) — the public shell already has the baseline accessibility primitives

The current source inspection shows the shell is already doing the obvious
accessibility work:

- `index.html` includes a skip link, a focusable playable canvas, named
  status regions, and live text for time/profile/save state.
- `src/main.ts` keeps the browser entry point in the wiring/HUD/observability
  lane rather than embedding gameplay rules there.
- `src/styles.css` already gives visible focus treatment and skip-link
  behavior.

That means the next proof slice is not “add basic shell accessibility.” It is
the acceptance board / proposition surface as a named, focus-managed
interaction contract with readable row semantics.

## Addendum (2026-07-28) — ADR-0034 landed; the next five are sequenced

### RU-0910 closure correction — the first orphan needed supersession, not wiring

RU-0910 was written as "wire three tactical verbs". The first module attempted
(`animation.ts`) proved that framing wrong and it is now corrected across the
tranche: **every orphan must be re-derived against the current authoritative
layers before it is connected.** ADR-0031's module would have created a
frame-rate-dependent second truth source for persisted, replay-validated kernel
state and dropped rig attitude entirely. ADR-0034 supersedes it.

- [x] **RU-0910.0 — Rig-local animation ownership (ADR-0034).**
  - Evidence: reachability 30 → 29 unreachable (2,365 → 2,040 lines); typecheck
    clean; 65 files / 382 tests pass including 10 new tests in
    `src/game/animation.test.ts`, which previously had none; live 4173 chase
    camera reports `visualFrontIsForward: true`,
    `frontAlongHeadingMetres: 6.246`, `cameraFocusContractMet: true`,
    `steeringAngle: -0.3`, zero console errors.
  - Built rather than deleted: the cockpit steering control (Torque, Spark) and
    the imported-asset clip seam (`animationClipCount` in bridge evidence).
  - Open gap, stated not hidden: the tractor's hood camera socket sits ahead of
    the windscreen, so no current camera sees the steering control properly. An
    interior camera is the first candidate for the _next_ tranche.

- [x] **RU-0911 — Reachability budget adopted.**
  - `npm run audit:reachability:budget` enforces `--max 29`; verified it passes
    at the current count and fails at 28.
  - Boundary: a budget with a declared allowance, not a purity gate. Lowering
    the ceiling is deliberate; raising it requires a recorded reason; explicit
    archival is a legitimate way to reduce the count.

### The sequenced tranche

Full reasoning, acceptance gates, and expansion paths for each item live in
[Next Five — The Reachability Tranche](NEXT_FIVE_REACHABILITY_TRANCHE_2026-07-28.md).
Each item is deliberately left open for redesign as playable evidence arrives.

|   # | Item                                                      | Status | Gate                                                                                            |
| --: | --------------------------------------------------------- | :----: | ----------------------------------------------------------------------------------------------- |
|   1 | Reachability budget                                       | `[x]`  | Adopted at 29, ratcheting                                                                       |
|   2 | The Pegboard — 1,000-ft tool-state layer (`radial-ui.ts`) | `[ ]`  | Named-action path, keyboard/pointer/touch parity, shell focus contract, clear playfield centre  |
|   3 | Tyre pressure + differential lock                         | `[ ]`  | Each is a commitment with a felt reversal cost; player can articulate the tradeoff unprompted   |
|   4 | Stranded, Not Reset (`winch-physics` + `fleet-recovery`)  | `[ ]`  | Disable → locate → reach → recover survives reload; composes with ADR-0019, no exploit loop     |
|   5 | `world-memory.ts`                                         | `[ ]`  | One player action visibly remembered in the machine's voice; not a second persistence authority |

### Decision recorded this gate

- **ADR-0035** — the Pegboard runs live, with an accessibility opt-in that
  pauses. Accepted by direct operator direction for the **modality only**; the
  geometry, tool list, and visual design remain Proposed. Reasoning: a tool
  choice made outside of time is inventory management, and coping under pressure
  is exactly what the Missing Middle diagnosis says is absent — while the opt-in
  keeps that from becoming a dexterity gate.

### Anything else?

Yes. This tranche can fail honestly. If three or more items need redesign rather
than wiring, the parts-bin defence collapses and the correct response is explicit
archival of most remaining orphans, not more wiring. That outcome would be a
result worth recording, not a setback. One data point exists so far and it
favours the Executioner.

## Addendum (2026-07-28) - Progression gate disposition

The capability-first progression gate is closed for this slice. Evidence: `npm run typecheck && npx vitest run` passed with 65 files / 383 tests; `npm run build` passed; canonical port 4173 browser acceptance passed for desktop/touch first-rung flow, save/reload, recovery input paths, radial controls, replay, relay, camera/readability, and zero console problems. Next bounded work is the optional XP-mode ledger prototype, namespaced outside campaign `ProgressionState`, with explicit reward routing and no implicit conversion to Journey, Mastery, or Insight.

## Addendum (2026-07-28) - Optional XP policy seam implemented

The capability-first campaign remains canonical. The optional Universal XP exploration now has an executable, isolated policy kernel in `src/game/xp-progression.ts`: mode and ruleset identity, account XP, derived level/rung, per-rig restoration XP, explicit source/event routing, cross-mode rejection, and idempotent retries. `src/game/xp-progression.test.ts` covers XP-only and hybrid-relevant boundaries without changing `GameState.progression` or the campaign mission resolver.

Evidence: focused XP tests passed (4/4); `npm run typecheck` passed for root and deterministic-kernel probe; full Vitest passed (66 files / 387 tests); `npm run build` passed including player asset assertions. Browser acceptance is intentionally not rerun for this non-wired pure kernel; the existing canonical campaign browser evidence remains valid. The next decision unit is a named XP-consuming mode with persistence, reset/season, unlock, and UI contracts before any runtime wiring.

### Anything else?

The old XP model is now both documented and executable as an optional policy, but it is not yet a player-facing feature and must not be described as campaign behavior.

## Addendum (2026-07-29) — live radial boot failure is now tracked separately from the static audit

The current developer route is still failing on the radial-menu startup
reference, and the live browser failure now has its own snapshot in the
evidence trail:

- [Radial Menu Boot Failure Snapshot](../research/RADIAL_MENU_BOOT_FAILURE_SNAPSHOT_2026-07-29.md)
- [Browser Runtime Parallel-State Integration Blocker](../reviews/BROWSER_RUNTIME_PARALLEL_STATE_INTEGRATION_BLOCKER_2026-07-26.md)
- [Radial Quick-Action Wheel Authority Audit](../reviews/RADIAL_QUICK_ACTION_AUTHORITY_AUDIT_2026-07-28.md)

Current live console evidence:

- `ReferenceError: createInitialRadialMenuState is not defined`
- follow-on module-load failure for `src/game/radial-ui.ts`

This is a runtime blocker snapshot, not a code fix. It keeps the live browser
failure separate from the older static dead-code analysis until the owning
runtime lane is stable again.

## Addendum (2026-07-28) — external-review sequence executed

The 2026-07-28 external review's ten-item sequence, worked in order.

|   # | Item                                     | Status | Evidence                                                                                                           |
| --: | ---------------------------------------- | :----: | ------------------------------------------------------------------------------------------------------------------ |
|   1 | P0: `publicState()` mutation             | `[x]`  | `selector-purity.test.ts`; guard proven by re-introducing the defect (2 fail / 3 pass), then removing it (5 pass)  |
|   2 | Route passage through its command        | `[x]`  | `syncUnboundPassageFromCorridor()` uses `resolveUnboundPassageCommand()`; called from `stepGame()`, not a selector |
|   3 | Rename `recovery` -> `salvage-retrieval` | `[x]`  | `mission-propositions.ts`; `fleet-recovery` reserved                                                               |
|   4 | Pure `deriveFleetRecoveryAssessment()`   | `[x]`  | `fleet-recovery-assessment.ts`; 12 vertical tests                                                                  |
|   5 | Weather -> actual traction               | `[x]`  | `MotionOptions.soilMoisture` into `stepGame()`; `weather-traction.test.ts`; `weather.ts` now reachable             |
|   6 | Board/radial as projections              | `[-]`  | `publicState().fleetRecovery` projection landed and browser-verified; `radial-ui.ts` still holds local booleans    |
|   7 | Authoritative command + event            | `[x]`  | `resolveFleetRecoveryCommand()` / `applyFleetRecovery()` / `performFleetRecovery()`                                |
|   8 | Vertical browser acceptance              | `[x]`  | Live `?acceptance=field-02` chain, all cases, reload persistence, zero console errors                              |
|   9 | Enforced `verify:head`                   | `[x]`  | `npm run verify:head` and `verify:head:browser`                                                                    |
|  10 | Docs reconciled with runtime             | `[x]`  | Architecture status-correction table; README current-runtime-facts table                                           |

### Blocked on parallel work

`verify:head` currently fails at the typecheck stage on unused `missionBoard*`
and `WORLD_SITES` symbols in `src/main.ts`. Those arrived from **another agent's
in-flight mission-board work during this gate** and were left untouched under the
parallel-ownership rule. Every file this work touched typechecks clean.

### Next

Item 6 is the only partial. The Pegboard slice (ADR-0035) converts
`radial-ui.ts` to pure projections and gives the already-working recovery
command a surface the player can actually press.

### Anything else?

Yes. The tranche's parts-bin experiment now has two data points and they
disagree, which is the useful outcome: `animation.ts` needed supersession
because it re-derived kernel-owned state, while `weather.ts` connected cleanly
because it did not. **That is the discriminator worth carrying forward** — ask
whether a dormant module invents state the kernel already owns, not whether it
has tests.

## Addendum (2026-07-28) — tranche items 2 and 3 closed; XP quarantined

| Tranche item                         | Status | Evidence                                                                                        |
| ------------------------------------ | :----: | ----------------------------------------------------------------------------------------------- |
| 1. Reachability budget               | `[x]`  | Enforced, ratcheted 29 -> 28 -> 25                                                              |
| 2. The Pegboard                      | `[x]`  | ADR-0035 validation; keyboard parity added, live confirmed, projections replace stored booleans |
| 3. Tyre pressure + differential lock | `[x]`  | `rig-tools.test.ts` (15 tests); both tradeoffs proven end-to-end; persists across reload        |
| 4. Stranded, Not Reset               | `[x]`  | Landed with the recovery vertical                                                               |
| 5. `world-memory.ts`                 | `[ ]`  | Last named item; highest supersession risk                                                      |

### New decision

- **ADR-0036** — universal XP quarantined. `xp-progression.ts` implements what
  ADR-0018 rejects. Preserved, not deleted; the reachability audit now enforces
  a quarantine list and was proven to fail when the module is made reachable.

### Verification at this gate

423 tests / 70 files · typecheck clean · reachability 25, budget enforced ·
live browser Pegboard flow with reload persistence and zero console errors.

### Anything else?

Yes. The orphan set has **three** classes, not two: parts bin (wires cleanly),
mirage (needs supersession), and contraband (must never be admitted). The audit
now enforces the third as a distinct rule. Applying the ADR-0034 discriminator
before wiring correctly predicted every outcome so far.

## Addendum (2026-07-28) — 3d-games lens: rendering optimization is implicit, not player-authored

The live browser shell still presents a readable 3D play surface with named
camera views and diagnostics, but it does not expose public culling, batching,
or LOD tuning controls. The existing `#game-canvas` and camera/help surfaces are
player-facing; the rendering optimizations stay behind the implementation
boundary. Evidence came from a live probe against `http://localhost:4173/?acceptance=field-02`
that returned no public culling/LOD terms in the DOM text, while still showing
FPS/backend/geometry/texture/bridge/prop readouts.

## Addendum (2026-07-28) — 3d-web-experience lens: accessible entry is present, fallback UI is not

The shell exposes web-facing entry points such as `Skip to playable world`,
`Fullscreen`, `Accessibility`, and touch-oriented view guidance, and the 3D
canvas remains mounted in a mobile-sized viewport. However, the probe did not
surface a dedicated loading skeleton, offline banner, static fallback, or low-end
quality selector in the ready state. `prefers-reduced-motion` also did not
register as active in the inspected session. This keeps the web-experience
contract partial: accessible entry is there, but explicit resilience/fallback
UI remains hidden behind implementation details.

## Addendum (2026-07-28) — accessibility semantics are robust, but not fully end-to-end tested

The shell already includes a skip link into the playable world, a focusable
canvas with an accessible name, named landmarks for the main gameplay regions,
keyboard-reachable controls, live status/alert regions, and hidden dialogs with
`aria-modal="true"` and label wiring. That is a strong accessibility structure
for a live game shell. The remaining unverified pieces are screen-reader output,
contrast ratios, and full keyboard trap behavior, so the accessibility story is
structurally good but not fully proved at runtime yet.

## Addendum (2026-07-28) — Physics Lab 01 exists as a live secondary route, but it currently enters fallback mode

The browser-daemon probe of `/physics-lab` showed a separate `Physics Lab 01`
page with a real canvas, telemetry, solver/time-scale controls, camera
selection, and a skip link. The route is clearly intended as a first-class
simulation surface. However, the current runtime state also shows
`Physics laboratory could not start. Return to Field 02`, so the lab is not yet
verified as a healthy end-to-end flow. No JS exception was visible beyond the
usual Vite connection logs, so the fallback may be deliberate rather than a
crash.

## Addendum (2026-07-28) — Box3D Probe 01 is another live simulation route, also in fallback mode

The browser-daemon probe of `/box3d-lab` showed a second dedicated route,
`Rigs Unbound — Box3D Probe 01`, with a canvas, telemetry, and solver/time
controls similar to the Rapier lab but with its own terminology (`Debug
contract`, `BOX3D 0.1.0 / BOX3D-WASM 0.2.0`, `BODIES / SHAPES`). The route is
also explicitly failing fast with `Box3D probe could not start. Return to
Rapier Physics Lab 01`. That makes the app’s physics experimentation lane real
but currently unresolved at startup.

## Addendum (2026-07-28) — accessibility statement is now a public browser pointer, not just a private doc

The shell’s `Accessibility` link resolves to a real browser-facing statement
page, and the repo also carries a mirrored `docs/ACCESSIBILITY_STATEMENT.md`
copy. The page names the current accessibility posture, what still needs
validation, and how to give feedback. That creates a durable public promise
surface for browser accessibility rather than relying on hidden notes alone.

## Addendum (2026-07-28) — loading/progress remains an open issue, and the statement now reflects that more accurately

The browser-loading progress review remains open: startup still relies on a
textual measuring/ready state rather than a dedicated visible progress or
warmup affordance. The accessibility statement now avoids overstating reduced-
motion support and keeps the loading story explicitly incomplete. This keeps
the public promise and the issue review aligned instead of drifting into a
false sense of closure.

## Addendum (2026-07-28) — refreshed browser check confirms the public accessibility statement now matches the revised wording

A fresh browser navigation to `/accessibility?refresh=1` showed the new
statement text live after the root `accessibility.html` source was updated.
That reestablishes alignment between the browser-facing pointer and the repo
statement: fallback-aware browser behavior is stated plainly, reduced-motion
handling remains a manual-validation item, and the loading story stays open.

## Addendum (2026-07-28) — root shell installability is still not surfaced

The canonical root shell exposes a favicon and `theme-color`, but no manifest
link, no active service-worker controller, and no standalone display mode. The
current browser contract remains browser-native playability rather than a
surfaced install/offline PWA promise.

## Addendum (2026-07-28) — asset bridge separation is live: developer sees GLBs, player does not

The live `?surface=developer` route sets `body.dataset.surface=developer` and
loads both bridge GLBs from `assets/runtime/`; the normal player surface sets
`body.dataset.surface=player` and loads no `.glb` runtime assets in the
inspected navigation. That matches the public asset-promotion boundary: the
bridge is runtime-real, but public approval remains separate and proposed.

## Addendum (2026-07-28) — mission acceptance is live as a dialog surface

The `Contracts` control in the canonical browser shell opens a real dialog with
`role="dialog"`, `aria-modal="true"`, focus landing on `#mission-board-close`,
selected row state via `aria-pressed`, and an enabled `Accept contract` button
once a proposition row is chosen. That makes the acceptance surface a runtime
fact rather than a speculative doc surface, while the broader mission-authority
design question remains separate.

## Addendum (2026-07-28) — map overlay accessibility gap is closed in the live browser

The canonical map overlay now opens as a true modal dialog with focus landing
on the close control and focus returning to `#game-canvas` on close. That
closes the earlier map-overlay focus issue in the live browser and keeps the
player-facing overlay contract aligned with the updated review note.

## Addendum (2026-07-28) — pause focus recovery is fixed, but pause announcement remains incomplete

The live `KeyP` pause path now opens a real dialog with focus landing on
`#pause-resume`, and closing the overlay returns focus to `#game-canvas`.
However, the visible pause state still relies on `#current-prompt` text
(`Paused.`) rather than a dedicated live-region announcement contract. The
focus/recovery portion of the earlier review is closed, but the announcement
surface itself remains an open browser-delivery item.

## Addendum (2026-07-28) — the workshop remains hidden on the current player surface

A live probe of the player shell found `#workshop-panel` in the DOM, but it
was still `hidden: true` and focus remained on `#game-canvas`. The visible
player controls did not expose a dedicated workshop trigger in the current
state, so the workshop remains a real progression surface in the source trail
but not yet a discoverable dialog on this player surface.

## Addendum (2026-07-28) — mobile radial focus proof tightened

The browser-delivery pass found a real mobile seam to keep tracking:

- `#welcome-panel` is an intentional first-run modal gate on the compact shell.
- After dismissing it, `#touch-radial-action` opens a four-item radial wheel
  in the `390 x 844` mobile viewport.
- The overlay is mounted, but focus stays on `#touch-radial-action` instead of
  moving to `#radial-menu-close`.
- `Tab` then escapes to `#control-lesson-dismiss`, so the overlay still needs
  a stronger focus-trap story on touch-sized shells.

This is a proof gap, not a boot blocker. The next step is to harden the mobile
focus contract and keep the desktop/mobile behavior documented in one place.

## Addendum (2026-07-28) — mobile radial open-state visibility remains unproven

The mobile browser probe now separates the issue into two layers:

- the radial overlay mounts and contains its items,
- but the computed visibility on the live mobile probe still reports hidden,
- and focus stays on `#touch-radial-action` instead of moving to the close
  control.

This means the next proof step is not just focus trapping. We need a clean open-
state check that proves the wheel is visible on touch-sized shells before the
focus claim can be considered meaningful.

## Addendum (2026-07-28) — pause focus recovery is live; announcement remains textual

A fresh browser probe of the pause path confirmed:

- `KeyP` opens a real dialog with `role="dialog"` and `aria-modal="true"`.
- Focus lands on `#pause-resume` when pause opens.
- Clicking Resume closes the overlay and returns focus to `#game-canvas`.
- The visible pause cue is still only `Paused.` in `#current-prompt`, with no
  dedicated `role` / `aria-live` contract.

That means the remaining pause gap is announcement semantics, not modal focus
recovery.

## Addendum (2026-07-28) — bootstrap status is readable, but not yet a progress contract

A live browser probe of the pre-entry shell found:

- `#welcome-panel` is a real modal gate with `role="dialog"` and
  `aria-modal="true"`.
- `#bootstrap-status` is a polite status region that says `Measuring device
performance… Choose Enter the field to begin.`.
- there is no `progress` element or `role="progressbar"` in the current live
  shell.
- `aria-busy` is not set on the bootstrap status region.

So the startup story is currently a narrated status path, not a bounded
progress contract.

## Addendum (2026-07-28) — contract board remains desktop-first on the compact shell

A mobile-sized browser probe confirmed the `Contracts` trigger is present in the
DOM but not exposed as a touch-shell box because `.masthead__buttons` is hidden
under the compact responsive rules.

This is a policy choice, not a broken click path. The current shell therefore
lacks a touch entry point for the contract board unless one is added later.

## Addendum (2026-07-28) — touch Radar is now isolated from the pause fallback

The compact-shell `Radar` button had an accidental coupling: the generic tap
handler could also route it into the pause fallback. The corrected runtime path
now skips the generic tap fallback for `button[data-tap-action="navigator"]`,
so the touch `Radar` action is only a navigator toggle.

That keeps the live compact shell aligned with its visible labels and removes a
cross-wire between a persistent HUD toggle and a modal overlay action.

## Addendum (2026-07-28) — touch Radar fix confirmed live

A live mobile browser probe confirmed the touch `Radar` action now toggles the
navigator only:

- `#navigator-panel` opens,
- `#pause-overlay` remains closed,
- the prompt does not shift into pause,
- the active element stays on the `Radar` button.

That closes the touch-Radar coupling bug at the runtime level.

## Addendum (2026-07-28) — mobile map focus recovery is now confirmed live

A fresh browser probe on a `390 x 844` mobile viewport confirmed the map
overlay now lands focus on `#map-close` after the delayed open assertion.
That closes the earlier mobile map-focus gap and gives the compact shell a
working touch-exposed modal with a proper close target.

## Addendum (2026-07-28) — the mobile radial wheel now stays open and focuses its close control

A fresh mobile browser probe confirmed the radial quick-action overlay now
behaves as a real modal surface:

- `Quick` opens the overlay,
- the control lesson no longer auto-closes it,
- focus lands on `#radial-menu-close`,
- the focus stays there,
- the four-item wheel remains visible.

This closes the earlier compact-shell radial focus/visibility gap.

## Addendum (2026-07-28) — the main prompt line is now an explicit live region

`#current-prompt` now carries `role="status"`, `aria-live="polite"`, and
`aria-atomic="true"`. A live browser probe confirmed the attributes are present
before entry and while pause is open, closing the remaining pause-announcement
gap in the current shell.

## Addendum (2026-07-28) — contract board now stays open and focuses its close control

A fresh desktop browser probe confirmed the mission board now behaves like a
proper modal overlay after the suppression fix:

- `Contracts` opens `#mission-board`,
- `#mission-board-close` receives focus and keeps it,
- rows can be selected,
- `Accept contract` enables,
- the board closes cleanly.

That closes the earlier contract-board overlay mismatch in the live shell.

## Addendum (2026-07-28) — bootstrap loading now has a determinate progress contract in source

The next browser-delivery seam now has source-level coverage:

- `#bootstrap-status` is no longer just a binary measuring/ready label;
- while the shell is measuring frame evidence, it now presents as a bounded
  progressbar;
- `aria-busy` tracks that warmup phase instead of remaining false during load;
- once the bootstrap target is reached, the surface returns to a normal status
  role.

Browser verification is now complete, so this is a closed evidence claim.

## Addendum (2026-07-28) — profile-status wording now resolves clearly across warmup and ready states

The public profile line has been tightened into a stable shell contract:

- warmup state: `Quality: measuring. Still measuring frame performance.`
- post-entry ready state: `Quality: standard. Full scenery detail is active.`
- the warmup bootstrap progressbar still stays separate from the profile line;
- the operator diagnostics surface remains hidden from the public HUD.

This is now verified in the live browser, so the tracker can record it as a
completed accessibility/profile polish step rather than an open wording gap.

## Addendum (2026-07-28) — the developer diagnostics lane now names the fallback policy

The hidden developer surface now exposes the runtime profile policy in terse,
operator-facing form. The live browser probe confirms the warmup and steady
states, and the fallback form is exercised by the policy helper test:

- warmup: `Renderer visibility warmup: standard (insufficient-frame-samples)`
- steady: `Renderer visibility steady: standard`
- fallback: `Renderer visibility fallback: mobile-safe (...)`

That means the tracker's earlier "operator-visible summary" gap is now closed in
practice as well as in source.

## Addendum (2026-07-28) — acceptance-only visibility preview is now verified live

The runtime visibility-preview seam now has live browser proof on the canonical
4173 dev server:

- developer surface exposes `window.__forceProfile("mobile-safe")`;
- the renderer accepts the preview profile and updates visibility metrics;
- the public HUD still reads `Quality: standard. Full scenery detail is active.`;
- the operator lane now reports
  `Renderer visibility fallback: mobile-safe (acceptance preview)`.

Validation completed:

- `npm run typecheck`
- `npx vitest run`
- live browser probe on `http://127.0.0.1:4173/?surface=developer`

## Addendum (2026-07-28) — renderer policy fallback is now a verified live browser behavior

The 3D-web-experience pass also proved the renderer policy gate is real:

- `?rendererPolicy=off` keeps the renderer on `webgl`;
- the snapshot reports `rendererBackendFallback: true`;
- the backend reason is explicit:
  `rendererPolicy=off blocked auto webgpu`;
- the runtime diagnostics line shows `backend:webgl/auto (fallback)`.

A companion `?rendererPolicy=stable` probe stays on the direct path:

- `rendererBackendFallback: false`;
- `rendererBackendReason: renderer=auto retained webgl for composer compatibility (stable)`;
- runtime diagnostics show `backend:webgl/auto (direct)`.

This is useful because it tells us the app already has a policy-controlled
degradation path for the renderer, but still lacks a broader static fallback
story for a true 3D outage.

## Addendum (2026-07-28) — context-loss recovery is wired, but the browser proof was synthetic

The live browser shell also confirms the renderer-loss recovery path is
connected:

- `webglcontextlost` on `#game-canvas` yields
  `Graphics context lost. Waiting for restore.`;
- `webglcontextrestored` yields
  `Graphics context restored. Recovered on developer profile standard.`;
- the diagnostics lane remains coherent while the state machine flips;
- the browser run did not expose `WEBGL_lose_context`, so this is a synthetic
  proof of wiring, not a true GPU-reset proof.

That keeps the tracker honest: the recovery envelope is real, but a separate
no-render outage surface is still unresolved.

## Addendum (2026-07-28) — the unresolved no-render gap is now tracked explicitly

The browser-3D review has been split into a dedicated issue note:

- `docs/reviews/rigs_unbound_issue_review_2026-07-28.md`

The tracked boundary is now explicit:

- policy fallback exists,
- context-loss recovery exists,
- true no-render fallback now exists.

## Addendum (2026-07-28) — the no-render fallback surface is now implemented

The browser-3D fallback story now has a visible degraded mode:

- `#error-panel` is the canonical no-render fallback surface;
- it is surfaced as an `alertdialog` with title, description, and retry action;
- `window.__showNoRenderFallback(...)` can reveal it on developer/acceptance
  runs;
- live browser proof shows the panel visible, canvas hidden, shell in fallback,
  focus on retry, and Escape/Tab trapped while scroll is locked.

That closes the remaining gap between policy fallback, recovery messaging, and
an actual user-facing no-render state.

## Addendum (2026-07-28) — the no-render fallback is keyboard-operable in the live browser

A live browser probe confirmed the degraded-mode dialog behaves like a modal
surface:

- focus lands on `Try again`;
- `Tab` and `Shift+Tab` stay pinned to the retry button;
- `Escape` routes to the retry action;
- page scroll remains locked while the fallback is visible.

That means the no-render surface now covers both visibility and keyboard
operability, which is the accessibility bar this shell needs for a true 3D
outage state.

## Addendum (2026-07-28) — the no-render fallback is named in the accessibility tree

A Chrome accessibility-tree probe confirmed the live fallback dialog is exposed
to assistive tech with the expected name:

- `alertdialog` name: `The 3D scene is unavailable.`
- retry button name: `Try again`

That makes the degraded-mode surface a true dialog contract, not just a visual
overlay with keyboard support.

## Addendum (2026-07-28) — the fresh-load shell still lacks a dedicated loading affordance

A fresh developer-surface load confirmed the ready shell is already readable,
but the browser-delivery contract still has one visible gap:

- `#bootstrap-status` reads as a ready-state message
  (`Field systems ready. Restored session controls are active.`), not a loading
  progress indicator;
- `#map-progress` is world-survey progress (`0% surveyed`), not an asset or
  scene-ingestion bar;
- `#error-panel` remains hidden on the ready shell, which is correct, but it
  leaves no dedicated loading/retry affordance for the asset bootstrap path.

This becomes the next documented browser-delivery seam: preserve the no-render
fallback contract, and add a truthful loading/retry surface for asset or scene
ingestion rather than reusing the ready-state text for progress.

The fresh browser probe also made the distinction sharper:

- `#map-progress` exists in the DOM but is `visibility: hidden`, so it is not a
  visible loading affordance;
- there is still no visible `role="progressbar"` or equivalent bootstrap UI on
  the ready shell.

The accessibility probe sharpens it further:

- the shell has multiple `aria-live="polite"` / `role="status"` regions, but
  they are gameplay/session state, not bootstrap progress;
- the live shell still exposes no loading-specific accessible name or progress
  announcement for asset or scene ingestion.

One source-side nuance matters here: `src/main.ts` already contains a
measuring-phase `role="progressbar"` branch for bootstrap, so the gap is not a
missing warmup contract in code. The fresh browser probe simply reaches the
ready phase quickly enough that the loading affordance is not durable as the
user-facing first impression.

The newer live probe makes the split more explicit:

- `#bootstrap-status` reads ready with standard scenery detail;
- `#profile-status` reads measuring and still talks about frame performance;
- `#runtime-diagnostics` carries the renderer visibility warmup detail.

So the shell has the right pieces, but the loading story is distributed across
three channels instead of being legible as one cohesive surface.

The control-surface probe adds one more nuance:

- `View` is already a real `<select id="camera-select" aria-label="Camera view">`;
- the available camera modes are named options (`Chase`, `Hood`, `Side`,
  `Tactical`, `Top-down`, `Survey`);
- lighting is only exposed in the keyboard/help legend (`N light`) and does
  not appear as a persistent on-screen control button in the live DOM.

So the camera contract is already durable, but lighting still needs a stronger
visible control story if we want the 3D shell to feel complete across input
modes.

## Addendum (2026-07-29) - renderer diagnostics are visible, but not announced

A fresh accessibility probe found one more split in the shell's 3D telemetry:

- `#bootstrap-status` is a proper live status region (`role="status"`,
  `aria-live="polite"`, `aria-atomic="true");
- `#runtime-diagnostics` is visible text, but it has no `role`, no `aria-live`,
  and no `aria-atomic` state;
- the renderer visibility warmup note is therefore readable on screen, but it is
  not announced as a status update for assistive tech.

So the shell still distinguishes user-facing readiness from diagnostics, but the
renderer warmup line remains an on-screen metric rather than a narrated state.

The touch/input probe adds one more clarity point:

- `touch-primary-action`, `touch-blade-action`, `touch-recovery-action`, and
  `touch-radial-action` are present in the live DOM;
- the touch strip exposes blade, recovery, and quick actions directly;
- those buttons carry explicit labels such as `Lower field plough` and
  `Switch blade from cut to fill`.

So the core work verbs are touch-ready, but lighting still is not:

- the shell does not expose a persistent touch-visible light toggle;
- lighting remains keyboard/help-legend only (`N light`);
- the light control is still less discoverable on pointer and touch-first
  surfaces than the other core rig actions.

## Addendum (2026-07-29) - some toggles announce state, while radar and quick action still only change text

A fresh control-state probe shows the shell already distinguishes good toggle
semantics from weaker ones:

- `mute-button` exposes `aria-pressed="false"`;
- the map layer buttons use `aria-pressed` to show the active layer;
- `controls-legend-toggle` exposes `aria-expanded="false"` with
  `aria-controls="controls-legend"`.

The remaining weak spots are the radar and quick-action controls:

- `pause-navigator` reads `Radar off`, but it has no `aria-pressed`, so its
  state is visible only as text;
- `touch-radial-action` reads `Quick`, but it also has no announced toggle or
  expanded state.

So the shell already has examples of good stateful controls. The next polishing
gap is making the radar and quick-action surfaces match that standard instead
of relying on label text alone.

## Addendum (2026-07-29) - the radial overlay is semantic, but its launcher still is not

A fresh browser probe confirms one more split in the quick-action surface:

- `#radial-overlay` is a proper `role="dialog"` surface with the expected
  hidden/visible behavior;
- `#touch-radial-action` is still just a plain button labeled `Quick`;
- the launcher does not expose `aria-expanded`, `aria-controls`, or a similar
  announced state contract for open/closed behavior.

So the wheel itself is semantically sound, but the launcher still relies on
label text instead of a stateful accessible contract. That makes the radial
entry point weaker than the dialog it opens.

## Addendum (2026-07-29) - two modal dialogs are still missing accessible names

A fresh modal-contract probe shows most overlays are labeled correctly, but two
dialogs are still under-specified:

- `#mission-board` and `#pause-overlay` expose `aria-labelledby` and are named
  dialogs;
- `#map-overlay` and `#radial-overlay` expose `role="dialog"` and
  `aria-modal="true"`, but they do not expose `aria-labelledby` or
  `aria-describedby`;
- both of those overlays therefore rely on visible text alone for their
  accessible name instead of a named dialog contract.

So the shell has modal behavior, but two of the overlays still need explicit
accessible naming to match the quality of the named mission board and pause
dialogs.

## Addendum (2026-07-29) - mission board and radial overlays now show the modal focus contract

Fresh browser probes confirmed the modal interaction path on two dialogs:

- `#mission-board` opens from its button, moves focus to
  `#mission-board-close`, and returns focus when closed;
- `#radial-overlay` opens from `#touch-radial-action`, moves focus to
  `#radial-menu-close`, and returns focus to `#game-canvas` when closed.

That means the shell already has a working modal-focus pattern, not just modal
markup.

The remaining unproven seam is the map overlay trigger:

- `#map-overlay` is still a hidden modal dialog in the DOM;
- in this session its visible touch/keyboard trigger did not produce an open
  state we could verify;
- so map-focus behavior remains unverified here, rather than positively broken.

So the modal contract is partly proven and partly still under observation. The
named dialogs and radial sheet now show the intended focus behavior, while the
map path needs a reliable live activation check before it can be called done.

## Addendum (2026-07-29) - pause now shows the modal focus contract too

A fresh keyboard probe confirmed the pause path works the same way as the other
named dialogs:

- pressing `P` opens `#pause-overlay`;
- focus lands on `#pause-resume`;
- closing the overlay returns focus to `#game-canvas`.

So pause is not just a labeled modal; it also follows the shell's modal focus
pattern.

## Addendum (2026-07-29) - the map overlay also follows the modal focus contract after entering the field

After entering the field, the map path became verifiable:

- clicking the `Map` control opens `#map-overlay`;
- focus lands on `#map-close`;
- closing the overlay returns focus to `#game-canvas`.

So the earlier unverified map seam was state-dependent, not broken. The map
overlay is another working modal-focus dialog once the shell has left the
welcome state.

## Addendum (2026-07-29) - the regular modal dialogs do not have the fallback's explicit Tab trap

Source inspection closes one last accessibility distinction:

- the no-render fallback installs a dedicated `keydown` handler that traps
  `Tab` and routes `Escape` to retry;
- the regular dialogs use shared open/close focus management, but they do not
  attach an equivalent dialog-specific `keydown` trap in source;
- that means the shell now has verified open/close focus behavior for the
  dialogs, but not the same explicit keyboard-trap contract the fallback
  surface has.

So the modal dialogs are usable and focus-managed, but the fallback still has a
strictly stronger keyboard contract than the regular overlays.

## Addendum (2026-07-29) - the map and radial launchers now expose open state, and pause radar is initialized too

The last control-state gaps from the recent shell audit are now wired through
source and reflected in the live browser:

- the map opener now exposes `aria-controls="map-overlay"` and
  `aria-expanded="false"`;
- `#touch-radial-action` now exposes `aria-controls="radial-overlay"` and
  `aria-expanded="false"`;
- `#pause-navigator` is initialized with `aria-pressed="false"` instead of
  relying on text alone at startup.

That means the earlier state-announcement gap on the map and radial launchers
is now closed. The remaining modal distinction is narrower: the regular dialogs
still use open/close focus management, while the no-render fallback keeps the
stronger explicit `Tab`/`Escape` trap.

## Addendum (2026-07-29) - the regular modal dialogs now share the Tab trap too

The shared modal keydown handler is now live in source, and a browser probe on
the pause dialog confirmed it:

- opening `#pause-overlay` and pressing `Tab` moved focus from
  `#pause-resume` to `#pause-mute`;
- the regular modal dialogs therefore now keep focus inside the dialog instead
  of leaking it back to the page;
- the fallback surface still keeps its dedicated retry behavior, but the
  regular dialogs are no longer weaker on Tab containment.

So the remaining difference is now mostly about fallback-specific retry
semantics, not basic modal focus trapping.

## Addendum (2026-07-29) - Shift+Tab wrap is source-backed, even though the live probe timed out

A direct source check shows the shared modal handler wraps focus in both
directions:

- `Tab` advances to the next focusable control inside the active modal;
- `Shift+Tab` wraps back through the same focusable set;
- the handler only runs while one of the visible modal dialogs is active.

The live pause probe for the reverse direction timed out, so that direction is
source-backed here rather than live-verified in this session. The important
part is still clear: the modal trap is intended to wrap, not just keep focus in
one direction.

## Addendum (2026-07-29) - Shift+Tab wrap is now live-verified on the pause modal

A fresh browser probe confirmed the reverse wrap in the real shell:

- `Tab` moved focus from `#pause-resume` to `#pause-mute`;
- `Shift+Tab` moved focus back from `#pause-mute` to `#pause-resume`;
- the pause modal therefore wraps focus in both directions in-browser.

So the shared modal trap is now fully verified live, not just from source.

## Addendum (2026-07-29) - the browser-policy split is now captured as an ADR

The live browser-policy snapshot now has a durable decision record:

- ADR-0039 proposes keeping `#bootstrap-status` public and semantic,
  `#profile-status` public and visible, and `#runtime-diagnostics` route-gated
  to acceptance/developer surfaces;
- the canonical browser-policy note records the current route split and the
  accessibility-tree semantics;
- the decision register now lists the ADR so the policy is discoverable from
  the repository decision index.

That gives the browser-policy work a stable architectural anchor instead of
only a chain of live-analysis addenda.

## Addendum (2026-07-29) -- settlement needs become the first world-social runtime stage

ADR-0043 is admitted by the operator's direct `continue` response after the
proposed design was presented. The first source-level stage is intentionally
inside the existing mission-proposition and mission-lifecycle authority:

- `settlement-needs.ts` owns bounded, versioned community condition and favor;
- waterworks and campaign outcomes now write the same state;
- Long Furrow can publish a real side need only after drainage makes its soil
  workable; it completes only when a capable rig actually ploughs the site;
- no new jobs board, economy store, or direct UI mutation path was introduced.

This addresses the open-world/social layer named by ADR-0040 without recasting
the project as another test chain. Test and canonical-port evidence remain
pending explicit verification approval.

Anything else? Yes. The next coherent extension is generic target-aware cargo
and field-work completion so Rustline, Sunken Flats, and Launch Ridge can issue
their own varied physical work rather than borrowing the fixed cargo-relay
completion route.

## Addendum (2026-07-29) -- target-aware cargo replaces the fixed delivery endpoint

The cargo substrate now carries an optional persisted assignment containing the
accepted delivery mission and its authored origin/destination sites. Mission
acceptance assigns the existing physical crate; towing resolves against that
destination only; route rings and public-state projection read the same target.
The legacy unassigned Relay haul remains available as a first-rung activity.
Runtime verification is pending.

## Addendum (2026-07-29) -- Marsh Depot activates a ford route and a community outcome

## Addendum (2026-07-29) -- Grove Run introduces optional open-road play

- `road-rivalry` is now a third activity binding with a voluntary Toy Grove ->
  Quarry Shelf -> Home Silo course and per-rig persistent records.
- It reuses world sites, terrain routes, authoritative post-physics position,
  local primary-action commands, and save recovery. It does not create a mission
  slot, route gate, currency faucet, or separate race scene.
- ADR-0045 records the proposed product boundary. Source integration exists;
  runtime/playtest/save-recovery evidence remains pending explicit verification.
- The renderer now shows permanent, non-colliding Grove Run gate posts at the
  same authored course sites. Visual identification is source-integrated only;
  browser/playtest evidence remains pending.

## Addendum (2026-07-29) -- Quarry Runout begins emergent world incidents

- Storm moisture can activate one persistent Quarry Runout boulder on the
  Quarry Shelf -> Toy Grove line. It lives in `GameWorld` snapshot/restore,
  joins canonical collision queries, and is rendered through the existing rock
  prop path.
- Impact displacement uses the existing debris calculation; clearing is a
  physical machine consequence, not a mission action. The incident is local and
  does not lock the wider terrain.
- ADR-0046 records the proposed authority boundary. Typecheck and the full
  Vitest suite pass; isolated desktop runtime evidence now covers storm trigger
  while the active rig is disabled, save/reload persistence, canonical boulder
  collision, and physical tractor displacement. Clearance, visual prop refresh,
  and terrain-bypass play evidence remain open.
- Camera-obstruction queries now consume the same dynamic incident-obstacle
  projection as collision and rendering; browser evidence for camera avoidance
  remains pending.
- Rustline and Home Valley named contacts now acknowledge active and cleared
  Runout history through read-only world knowledge. Their dialogue creates no
  mission, route gate, or second incident-state owner.

`marsh-depot` is now a canonical authored marsh site rather than dormant
campaign data. The existing ford-capability delivery can resolve there through
the target-aware crate assignment, and completion changes Marsh Depot from
cut-off to supplied while recording favor for its ferrymen. Runtime verification
remains pending.

## Addendum (2026-07-29) -- settlement favor now produces optional world knowledge

The first non-currency favor consequence is live at the source level. Completing
the Sunken Flats causeway outcome makes the Ferrymen's Cut available through the
existing Rumor Graph and tactical navigator: Marsh Depot becomes a named,
amber-rumored location connected from Sunken Flats. It is not promoted to a
discovery, waypoint, compulsory route, or new UI subsystem. The player retains
agency to travel there, ignore it, or find it independently. Runtime and
playtest evidence remain pending.

## Addendum (2026-07-29) -- settlement state now has named human ownership

The first local contacts are authored as settlement data and projected into the
existing field-notes area of the Contracts board. Their current lines derive
from durable settlement condition; local needs are issued in the appropriate
contact's name; and settlement completion announcements now acknowledge a
specific person. This is a compact social-world layer, not a dialogue tree or
new mission framework. Runtime and playtest evidence remain pending.

## Addendum (2026-07-29) -- community state now changes visible places

The renderer now maps known settlement condition to the site-owned horizon lamp
instead of creating a separate objective visual: cyan signals a functioning or
connected place, amber a workable opening, and red/dim a stressed or silent
place. Marsh Depot receives its first authored 3D identity -- a stilted
platform, shelter, fuel drum, and lamp -- through the canonical world-structure
table. Simulation stays authoritative; runtime and playtest evidence remain
pending.

## Addendum (2026-07-29) -- supplied Rustline now provides field maintenance

Rustline's first tangible service is maintenance-only repair at its authored
salvage-yard service area. The existing `repairRig` command, wear reset, and
salvage tariff remain the one authority; the state merely admits Rustline when
its community condition is `supplied`. Home Silo remains the sole full workshop
for restoration, crafting, module fitting, and naming. Runtime and playtest
evidence remain pending.

## Addendum (2026-07-29) -- settlement state now has visible human presence

Each settlement has authored crew anchors, rendered only after its site is
known. One named contact remains at struggling places; the full small crew
appears when the settlement is stable, workable, cultivated, supplied, or
connected. The silhouettes are renderer-only, non-colliding world dressing;
they do not create a hidden NPC simulation or new interaction path. Runtime and
playtest evidence remain pending.

## Addendum (2026-07-29) -- Rustline's first community job is now physical

After Rustline Salvage is discovered, its crews can publish a tow-required
parts-and-fuel run from Home Valley. The mission assigns the canonical crate to
Home Valley -> Rustline, then completion marks Rustline supplied and adds
favor. This is the first post-refactor community delivery and establishes the
content pattern for Sunken Flats, Launch Ridge, and later settlements.

## Addendum (2026-07-29) -- named locals now speak from the world

An optional `hear-settlement-contact` primary action derives from the named
resident anchor and the settlement's current authoritative condition. It is
available only at a personally known place and only after immediate physical
actions have been resolved. The result is revisitable local knowledge, not a
dialogue system, acceptance path, reward, waypoint, or progression gate.
Runtime and playtest evidence remain pending.

## Addendum (2026-07-29) -- Sunken Flats now creates a durable raised passage

The `sunken-flats-causeway` settlement outcome derives the first community
passage: a raised, grade-limited track from Sunken Flats to Marsh Depot. The
terrain field owns its height/material change, cached natural obstacles are
invalidated, renderer terrain is rebuilt from the same revision, and
`settleWorld` reapplies the passage after save recovery. The marsh is not
blocked before completion; this is a safer lasting route, not an unlock wall.
Runtime and playtest evidence remain pending.

The active passage now has an authored deck-and-rail presentation generated
from the same resolved terrain segment. It samples terrain height after route
activation and remains non-colliding; no visual layer is allowed to become a
second route or collision truth source. Runtime and driving-distance legibility
remain pending playtest.

## Addendum (2026-07-29) -- imagegen asset lane begins with infrastructure

The first durable asset in the ongoing imagegen lane is now in the existing
`assets/generated/` tree:

- `marsh-depot-floodgate-environment-concept-2026-07-29.png` is a 1536 × 1024
  Patchwork Atlas environment concept for Marsh Depot, Floodgate 12, the
  Sunken Flats water route, and the settlement-scale consequence of machine
  care.
- The exact prompt and generation flags live beside the image in the `.prompt.md`
  sidecar; the hash, intended use, rights posture, review note, and replacement
  path live in the Asset Provenance Register.
- The versioned asset manifest lists it as `reference` / `concept` with
  `publicRuntimeApproved: false`. No runtime import, mesh admission, or player
  distribution decision was made.
- Static visual inspection is Tier 4 for the generated image's readability;
  manifest and asset-preflight evidence is Tier 2. Runtime layout, collision,
  before/after persistence, and public approval remain open.

The durable queue is now: Floodgate 12 same-camera before/after; Marsh Depot
close plate; Long Furrow drainage station; isolated utility-tow reconstruction
candidate; and failure/readability fixtures. The queue is a planning instrument,
not evidence that those assets already exist.

Anything else? Yes: generated art must continue to strengthen the authored world
without replacing simulation-owned layout, physics, or settlement state. The
next asset should therefore be selected for a measurable visual comparison,
not only for beauty or breadth.

## Addendum (2026-07-29) -- object-first asset catalog and first reconstruction input

The asset lane now has a durable long-list catalog and explicit production
split at `docs/exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md`.
The first object candidate is `utility_tow_recovery_01`, with a repo-owned
isolated reference at `assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.png`
and a reconstruction workbench at `assets/workbench/utility-tow-recovery-01/`.

Current status is reference/intake-pending, not runtime-ready. The next gates
are image probe, reference admission, strict pre-spec/detail inventory,
action-ready hierarchy, locked pass review, and browser/multi-angle evidence.
Roads, trees, clouds, sprites, and scene kits remain separate queues with
appropriate procedural or 2D build paths. `src/game/` remains untouched.

Anything else? Yes: this moves the asset strategy from “generate a beautiful
scene” to “build reusable semantic assets, then compose the scene.”

## Addendum (2026-07-29) -- first bounded rig-part reference

The first focused reconstruction candidate is now the field-plough rig part:
`assets/generated/field-plough-01-object-reference-2026-07-29.png` with its
repo-owned workbench at `assets/workbench/field-plough-01/`. This follows the
existing `field-plough` attachment and `ploughPivot` seam identified by the
asset audit.

The next evidence is the staged img2threejs intake/spec pipeline. Runtime
promotion remains blocked by the missing factory-to-GLB/presentation bridge,
strict spec evidence, action hierarchy, collision separation, and browser
review. `src/game/` remains untouched.

Anything else? Yes: once this module passes, the same contract can be reused
for the tow boom, winch, stabilizer, wheel, and beacon modules before the full
utility tow rig is attempted.

## Addendum (2026-07-29) -- field-plough reconstruction gate remains blocked

The field-plough workbench has completed intake evidence but not reconstruction
promotion. Probe, reference admission, detail inventory, and painted-steel PBR
extraction passed; normal spec validation passed with warnings. Strict-quality
still reports 12 errors in the embedded sculpt spec, so no procedural factory,
GLB, runtime adapter, or public approval was created.

The closure criteria are explicit: embed the mapped details, replace generic
feature targets, author the macro/meso/micro hierarchy, add independent material
layers/local overrides and lighting entries, add the repeated-share system and
root material recipe, reach four viewpoints, then rerun normal and strict
validation before code generation.

Anything else? Yes: this is the first durable evidence that the object-first
catalog is enforcing quality rather than multiplying unreviewed placeholders.

## Addendum (2026-07-29) -- canonical semantic asset definition established

The field-plough package now has a canonical definition at
`assets/specs/field-plough-01.asset.json`, governed by ADR-0047. It is the
source of truth for asset semantics; image references, img2threejs specs, PBR
maps, factories, GLBs, and runtime adapters are derived stages.

Manifest preflight now validates linked canonical specs and the asset test suite
includes a structural grounding check. The field-plough remains blocked at
strict img2threejs quality and has no runtime promotion. This is an additive
architecture change with no `src/game/` edits.

Anything else? Yes: future families must add their canonical definitions before
the catalog multiplies derived outputs.

## Addendum (2026-07-29) -- derived blockout factory now exists

The field-plough canonical definition now compiles into a strict-quality-passing
img2threejs spec through `tools/derive-img2threejs-spec.mjs`. The current
blockout factory is at `assets/workbench/field-plough-01/generated/` and passes
isolated TypeScript compilation.

Remaining gates are browser render/comparison review, multi-angle visual
acceptance, action/collision separation review, factory-to-GLB packaging, and
runtime admission. The factory is still a derived workbench artifact.

Anything else? Yes: this is the first asset that has crossed from reference
image to canonical definition to validated procedural source, with the rest of
the production chain explicitly visible.

## Addendum (2026-07-29) -- reproducibility and repository health closure

The field-plough compiler lane now has a package-level rebuild command at
`assets:derive-field-plough`, plus an asset regression that checks the derived
spec and generated blockout factory remain present and linked to the canonical
definition. Asset preflight and asset tests pass (`11/11`), both img2threejs
spec gates pass with zero errors and warnings, and the factory compiles in
isolation.

The repository-wide typecheck passed and the current full Vitest run passed
(`80` files, `497` tests). The asset lane did not edit `src/game/`; parallel
runtime work remains separate. Visual/multi-angle review, factory-to-GLB
packaging, collision review, and runtime admission remain explicit open gates.

## Addendum (2026-07-29) -- open-world procedural candidate availability

The field-plough lane now records a `procedural-candidate` lifecycle. The
candidate factory and browser review harness are available for development and
open-world exploration. Refinement, optional GLB delivery, runtime adapter
integration, simulation-owned collision, and public provenance are tracked as
separate evidence and ownership work, rather than being combined into an
agent-imposed stop condition. The canonical spec, schema, preflight, README,
ADR-0047, and asset regression now encode this distinction.

## Addendum (2026-07-29) -- open-world settlement contribution stage

`ADR-0049` introduces a save-owned, bounded contribution history for community
responses. The first proof makes Long Furrow support genuinely partial: physical
plough cuts can improve field capacity, while tow work can protect stores. Both
remain voluntary, capability-specific, and non-gating. Rustline, Sunken Flats,
Marsh Depot, and Launch Ridge have response definitions ready for the same
projection model.

Current evidence includes `npm run typecheck` and the full Vitest suite: `84`
test files and `506` tests passed. Browser playtests, physical props for every
response, longer-lived resident knowledge, and migration away from legacy
`settlementOutcomeId` campaign contracts remain open.

## Addendum (2026-07-29) -- runtime contribution proof and visible consequences

The canonical browser surface at `4173` now proves the actual Long Furrow tow
response through the normal runtime command path: favor becomes `1`, Stores
exchange opens, Field exchange remains sheltered, the plough response remains
available, no mission is accepted, and no application console error appears.

Response history now projects grounded, authored consequence props. This is
renderer-only evidence of simulation-owned history, never another source of
world state. The next evidence is a human visual review of the changed prop and
resident arrangement, followed by delayed/ignored consequence behavior and the
legacy campaign-outcome migration.

## Addendum (2026-07-29) -- after-dark settlement rhythm proof

At the canonical browser's observed night boundary (`worldMinuteOfDay: 1366.6`),
Long Furrow entered `after-dark`: the unpressured Stores exchange became
`off-shift`, its seed keeper rested, and waterlogged field work remained
sheltered. No mission or side mission was created, and the browser console was
clean. The clock therefore changes social presentation and ordinary service
rhythm, not player permission or a failure deadline.

## Addendum (2026-07-29) -- Sunken causeway now derives from a shipment material fact

The terrain-owned Sunken Flats causeway no longer derives from the legacy
`sunken-flats-causeway` mission completion alone. A separate physical Home
Silo stock bay loads a causeway kit into the existing crate, and its voluntary
delivery records `sunken-flats:raised-causeway`. That material fact alone
derives the raised terrain route, its deck, and Sunken Flats connection state.
The surrounding marsh remains traversable without it. Cargo manifest ownership
is now schema v26; the current canonical browser migrated its v25 history
cleanly with no mission or cargo assignment created. Typecheck, the kernel
probe, and all 86 files/522 tests passed. A dedicated disposable-save shipment
playthrough remains open. See
`docs/reviews/OPEN_WORLD_SUNKEN_CAUSEWAY_MATERIAL_EVIDENCE_2026-07-29.md`.

## Addendum (2026-07-29) -- Rustline service stock now proves the first material-first migration

Rustline repair capacity no longer depends on directly writing `condition:
supplied` from mission completion. A player who knows Rustline can voluntarily
load the existing physical crate at Home Silo, tow it to the real yard, and
record `rustline-salvage:service-stocked`. The same material fact is added when
the legacy `rustline-parts-run` outcome recovers or completes, preserving old
history without retaining a second authority. The cargo, collision, and
primary-command systems remain canonical; there is no new quest system,
mission requirement, discovery change, or route permission. Typecheck, the
kernel probe, and the 86-file/520-test suite passed. Browser proof remains
open on a dedicated prepared save. See
`docs/reviews/OPEN_WORLD_RUSTLINE_MATERIAL_EXCHANGE_EVIDENCE_2026-07-29.md`.

## Addendum (2026-07-29) -- legacy mission authority is now an explicit open-world migration target

The current source has two conflicting settlement paths: material effects drive
newer service and resident projections, while legacy `settlementOutcomeId`
mission completion still directly changes settlement condition, favor,
passages, and repair capacity. ADR-0050 records a proposed material-first
supersession: Rustline's physical service stock becomes the first migration,
with optional missions retained only as narrative framing during compatibility.
No operator acceptance is claimed. See
`docs/decisions/ADR-0050-material-first-settlement-authority-migration.md`.

## Addendum (2026-07-29) -- material facts now produce visible, non-gating community traffic

The settlement-life material-effect registry now carries two optional,
presentation-only traffic affordances: a Sunken Flats sounding can support a
small skiff toward Marsh Depot, and a marked Rustline bypass can support a
freight cart toward Quarry Shelf. `community-traffic.ts` derives position from
saved material history plus the canonical world clock; it introduces no route
permission, discovery, task, collision, AI authority, or mutable traffic
state. `state.ts` exposes the result, while `renderer.ts` only places the
corresponding low-detail mesh. Typecheck, the deterministic-kernel probe, the
full 85-file/515-test suite, and a clean canonical browser reload on port 4173
all passed. The browser preserved a sounded-crossing skiff with no active
mission or side mission. See
`docs/reviews/OPEN_WORLD_COMMUNITY_TRAFFIC_EVIDENCE_2026-07-29.md`.

## Addendum (2026-07-29) -- Sunken causeway carries local machine knowledge, not a defined flow

The Sunken causeway delivery proof exposed that a ground tractor correctly
disables in the flooded destination. The content correction does not exempt the
tractor or introduce a hand-authored transfer sequence: the existing Marsh
Skimmer already combines `tow` with `hover`, so it can take the existing crate
across standing water through the canonical physics and cargo paths. The
causeway manifest now tells the player this practical fact after loading while
remaining voluntary and usable as ordinary cargo.

The result is a machine-driven possibility, not a task gate. The player can
ignore, stage, or move the kit by different means; the shared crossing appears
only after real delivery and remains a safer route rather than a permission
wall. `npm run typecheck && npx vitest run` passed with 86 files and 523 tests.
Dedicated disposable-save browser proof remains open; the existing player save
is preserved. See
`docs/reviews/OPEN_WORLD_SUNKEN_CAUSEWAY_MATERIAL_EVIDENCE_2026-07-29.md`.

## Addendum (2026-07-29) -- spatial settlement interaction correction

Settlement contribution authority now requires a relevant machine at a
specific local material affordance rather than choosing a response from the
whole settlement radius. Targeted coverage must prove both rejection away from
the affordance and acceptance at it, while preserving the existing no-mission,
no-route-unlock contract.

## Addendum (2026-07-29) -- field-plough visual reconstruction correction

The original generated field-plough preview failed controlled comparison. It
did not preserve the reference's four independent shares, three-point hitch
structure, hydraulic load path, or mechanical attachment hierarchy. It is now
retained only as compiler evidence.

The canonical development visual is
`assets/workbench/field-plough-01/authored/createFieldPloughModel.ts`. It
contains four named, depth-staggered share units, curved handed moldboards,
cutting points, clamps, pins, a crossbeam, triangulated top-link frame, lower
hitches, hydraulic assembly, and explicit sockets. Raw WebGL canvas captures,
multi-angle views, the latest controlled comparison, and a machine-readable
review are under `assets/workbench/field-plough-01/review/`.

The honest current classification is development-ready procedural blockout,
not photoreal production art. Independent audit scores are `6/10` for
development blockout utility, `3.5/10` for reference-faithful production use,
and `2/10` for photoreal use. The next highest-value work is stronger
helicoidal moldboards, integrated cutting shares, credible linkage and clamp
geometry, bevelled fabricated edges, and layered PBR wear. These are refinement
work items, not reasons to suppress development availability.

## Addendum (2026-07-29) -- img2threejs governing workflow correction

The earlier field-plough work used individual img2threejs scripts but did not
follow the `img2threejs` skill as the governing locked-pass workflow. That was
incorrect. The complete skill is now loaded and its required state is recorded
in the repository.

The skill-driven audit found that the original spec's phrase `curved profile
extrude` was too weak to prevent symmetric paddle-like shares, the reference
camera remained unsolved, the repeated-share critical feature was not gated at
blockout, and the derivation script erased review history. The canonical
definition and derivation path now require four handed helicoidal moldboards,
integrated forward cutting shares, depth staggering, camera occupancy and
silhouette targets, and preserved review evidence.

The refined spec passes normal and strict validation with zero errors and
warnings. The generated current-pass factory compiles. The locked pipeline
nevertheless remains at `blockout`: Tier 1 reports silhouette IoU `0.470 <
0.85` and aspect-ratio delta `0.1001 > 0.05`; scale delta now passes at `0.0611
<= 0.08`. Divine Eye returns `probe` at `0.714` with reconstruction mode
suspected, and the multi-angle degeneration check passes. The skill-owned
review history records `refine-spec` followed by `refine-code`. No later pass
is unlocked.

## Addendum (2026-07-29) -- living-frontier presentation now has place ownership

The habitat layer remains derived-only and non-gating, but its renderer no
longer creates fauna around the active rig. `GameWorld` now exposes fixed
terrain-cell patches whose environmental result and visual placement belong to
world coordinates. The renderer selects only nearby cells for streaming. This
preserves deterministic environmental cause without converting it into a
player-directed flow, mission, route gate, or ecological side system. Focused
world coverage proves a shared patch keeps its identity and coordinates while
the player changes observation position. General machine-noise disturbance is
explicitly deferred until it has a clear simulation owner and playtest proof.

## Addendum (2026-07-29) -- ecology becomes a persistent world actor

The living-frontier path no longer stops at deterministic ambient fauna. The
first runtime stage stores autonomous regional ecology groups in `GameWorld`
world memory, advances them from the shared environmental clock, and lets
machine-altered land affect their migration and population. Grazing creates a
small but real change to vegetation, roots, and soil health through the
canonical field-condition cells. The renderer mirrors groups rather than
spawning wildlife around the active rig. No task acceptance, route permission,
reward loop, or defined response was added. ADR-0051 is Proposed pending
operator sign-off; focused simulation and desktop runtime verification remain
open.

## Addendum (2026-07-29) -- field-plough becomes a customizable developer part

The previous placeholder-only posture was insufficient for a customizable rig
system. The authored field-plough factory now exposes 3-share and 4-share
variants, normalized wear and paint controls, stable attachment sockets,
replaceable share and cutting-edge sockets, and material-slot metadata. The
part package contract is
`assets/workbench/field-plough-01/package/field-plough-01.part-package.json`.

The authored factory was exported through the canonical browser harness and
Three `GLTFExporter` into `assets/runtime/field-plough-01.glb`. The derivative
is retained as a repo-local developer derivative pending the parallel-owned
runtime lane, has 78 nodes, 60 meshes, 22 materials, zero GLB preflight findings,
and digest
`fa3681d96758b4808d84061858dd999b79dcc58307f574d2bf248896f356dc20`.

This establishes the reusable part seam without falsifying visual readiness:
the img2threejs Tier 1 silhouette gate remains below threshold, so public
approval, hero reference fidelity, and simulation collision authority remain
closed. `src/game/` was not edited because its runtime ownership is parallel.

## Addendum (2026-07-29) -- persistent ecology has focused runtime evidence

The first ecology stage now has source, focused simulation, and isolated
browser evidence. Regional actor state persists through world memory; field
impact and recovery tests pass; a live survey-camera observation shows the
Long Furrow herd beside a player-controlled Skimmer with no mission or side
mission. `npm run typecheck` and 6 focused ecology/habitat tests pass. The
reusable `npm run test:ecology-browser` passes with zero browser errors. A
known unrelated full-suite failure remains in the parallel field-plough
runtime-asset expectation (524/525 total), preserved outside this lane.

## Addendum (2026-07-29) -- machine presence produces voluntary ecology response

Ecology is now bidirectional at the player-vehicle boundary. Speed and slip
write a bounded decaying disturbance into canonical world memory; nearby groups
relocate, while weather and time let the system recover. Browser acceptance
proved a real Skimmer encounter displaced the Long Furrow herd `27.93m` after
`34.62m` of normal fixed-step movement, retained full rig condition, and
created no mission or side mission. Focused TypeScript and simulation checks
pass. The unrelated parallel runtime-assets full-suite expectation remains the
only known broad-suite failure.

## 2026-07-29 addendum: Ecology is socially legible, not task-shaped

Long Furrow, Sunken Flats, and Rustline field notes now derive from the shared
persistent ecology actors. The notes report local observation only: they create
no mission, acceptance flow, route gate, or expected machine response.

- Ecology acceptance, 2026-07-29: Typecheck and four targeted ecology tests
  pass. Canonical-browser evidence confirms a moving Skimmer displaces the
  herd while no mission exists. Resident notes now expose this as local
  knowledge only; the broad-suite asset fixture mismatch remains separately
  preserved.

## Addendum (2026-07-29): Sunken Flats is regional infrastructure

ADR-0052 proposes the current canonical identity: `sunken-flats-waterworks`.
The former Floodgate singleton is recovery-only historical input. The
infrastructure keeps its independent weather, condition, and spatial hydrology
authority; it no longer frames the place as one named objective. Targeted
migration, source, and browser evidence are required before runtime completion
claims.

- Sunken Flats Waterworks evidence, 2026-07-29: canonical identity, legacy
  entity recovery, spatial hydrology, optional inspection, reload persistence,
  and visible regional assembly are verified by typecheck, six focused tests,
  and the 4173 browser route. Final art, collision, and multi-capability service
  remain intentionally open rather than implied by this proof.

## Addendum (2026-07-29): game visuals discovery is complete, implementation awaits approval

The existing-project visual prompt has been applied through Part 0. The
project-specific discovery and approval package is
`docs/reviews/GAME_VISUALS_DISCOVERY_AND_APPROVAL_PACKAGE_2026-07-29.md`.
It reconstructs the current Patchwork Atlas direction, renderer and asset
ownership, visual, performance, and readability gaps, and a bounded execution
brief.

The recommended first slice is a Sunken Flats / Marsh Depot before-and-after
visual consequence plus one traceable source-to-runtime asset representation
chain. This remains proposed. No implementation files were changed by the
discovery pass, and `src/game/` remains protected until the operator explicitly
clears the current parallel runtime ownership boundary.

Anything else? Yes. The package records that visual polish must be judged by
machine capability, place consequence, voluntary possibility, fallback
readability, and provenance, not by screenshot novelty alone.

## Addendum (2026-08-06): item 9 "Enforced `verify:head`" needs reading as scoped

The Fleet Recovery table above marks item 9 `[x]` with evidence "`npm run
verify:head` and `verify:head:browser`", and the "Blocked on parallel work"
note beneath it says the chain "currently fails at the typecheck stage on
unused `missionBoard*` and `WORLD_SITES` symbols in `src/main.ts`."

Both need qualifying, and the rows are left as written because this file is an
append-only log and is concurrently edited.

**The `[x]` is defensible but easy to misread.** What was delivered is the
*script*: `verify:head` and `verify:head:browser` exist and chain the right
steps. That is done. What the checkmark does **not** assert — and what a reader
scanning a completed-items table will assume — is that the gate is green. It is
not, and has not been for the life of the row.

**The blocker note is stale in its cause.** The typecheck failure it names is
resolved; `npm run typecheck` exits 0 as of 2026-08-06. The chain still cannot
complete, for an older and unrelated reason: `format:check` is the *first* link
and fails on files unmodified at HEAD. Fixing the typecheck symbols never could
have turned the chain green, because the chain never reached typecheck.

That is the substantive point. A blocker was recorded against step 2 of an `&&`
chain whose step 1 was already failing, which means the recorded blocker was not
the binding constraint and clearing it produced no observable change. When
diagnosing a chained gate, find the *first* failing link before attributing the
failure — an `&&` chain reports only its earliest error, so any later step's
status is unobserved, not passing.

**Current status of the gate**, re-measured today:

```bash
npm run format:check   # EXIT 1 — the binding constraint
npm run typecheck      # EXIT 0 — the blocker this file names is cleared
```

No count is restated here on purpose; run the command. Every other step in the
chain was run individually on 2026-08-06 at EXIT 0 — typecheck, 89 files / 558
tests, asset preflight, asset coverage, reachability self-tests, reachability
budget, build. Full per-step record in the 2026-08-06 `docs/WORKLOG.md` entries.

**Unblock**, needing operator sequencing rather than an agent decision: a
`prettier --write` sweep over the `format:check` glob. Blocked because a
minority of the failing files are currently modified in the working tree by
in-flight parallel work, and reformatting files another editor has open
entangles an unrelated repo-wide sweep with someone else's uncommitted changes.

Until that sweep lands, no document should record `verify:head` as passing.
Record the steps actually run.

## Addendum (2026-08-06, later): the sweep landed; item 9's gate is green

Supersedes the addendum immediately above, which is left as written because this
file is append-only and concurrently edited.

The operator approved the sweep. `prettier --write` was run over the
`format:check` glob — deliberately not `npm run format`, which is
`prettier --write .` and would have reflowed 100+ hand-wrapped prose files
including this tracker. 53 files were rewritten: 44 previously clean, plus 9
already carrying in-flight parallel work.

```bash
npm run format:check   # EXIT 0 — first time in this repo's recorded history
npm run verify:head    # EXIT 0 — all nine steps, exit code read directly
```

**Item 9 now reads straight.** The `[x]` asserted only that the *script*
existed; the gate behind it was red for the life of the row. Both are now true
at once, so the qualification the previous addendum asked for is no longer
needed — though the reason it was needed is worth keeping: a checkmark on
"enforced <gate>" says nothing about whether the gate passes unless someone
states the exit code separately.

**Withdrawn:** "until that sweep lands, no document should record `verify:head`
as passing." The sweep landed. Documents may now record it — citing the command
and reading its exit code directly, never through a pipe. `... | tail -50`
reports `tail`'s status, which is always 0; that is how the false PASS claims
corrected earlier on 2026-08-06 were produced, and a green gate does nothing to
fix a broken way of observing one.

**The entanglement concern was real and was tested, not assumed.** Every file
with uncommitted work was backed up first. The check that settled it:
`prettier --stdin-filepath <path> < backup`, compared byte-for-byte against
disk — which asks "is this file exactly what prettier produces from the
pre-sweep content?" and so cannot miss a category of change, unlike the
whitespace-stripped hashing tried first. Run over all 9 overlap files, not the 5
the weaker test flagged: **all 9 byte-identical**. No in-flight work was
altered.

**Still open, unchanged by this:** `format:check`'s glob is a hand-maintained
allowlist while `format` writes the whole tree. Widening it closed today's gap,
not the mechanism that produced it. The durable fix is `prettier --check .` with
a `.prettierignore` so checker and fixer describe one set by construction —
still an operator scope decision, because it pulls `docs/` into the gate.

**Not done:** nothing was committed. No git write action was taken at any point.
The tree carries 66 modified tracked files; because 9 of them hold both
formatting and feature work, a clean formatting-only commit needs staging by
hunk. That is the operator's call.
