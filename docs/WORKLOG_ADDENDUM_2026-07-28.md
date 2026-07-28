# Worklog Addendum — 2026-07-28

## Mission proposition and progression runtime foundation

## Continuation checkpoint — gameplay/render boundary and next slice (2026-07-28)

- Re-checked boundary work on `vehicleAnimationSystem` and `GameRenderer`:
  - `vehicleAnimationSystem` is still wired from `src/game/renderer.ts` and is
    the runtime owner for rig-local animation playback and disposal.
  - This is not an unsafe deletion; it is ownership-boundary completion work
    and explicit disposal on renderer teardown.
- Verified commands in this gate:
  - `npx vitest run src/game/state.test.ts src/game/storage.test.ts src/game/animation.test.ts`
  - `npm run -s typecheck`
  - `npm run -s build`
- `rg "vehicleAnimationSystem" src` confirms active references only through
  the runtime boundary.
- `src/game/` is still explicitly marked as a parallel-owned runtime boundary in
  repo instructions; I will continue with non-`src/game` slices unless you
  explicitly clear that collision for direct runtime edits.

Next safe slice targets (non-`src/game`):

- mission/mission-board acceptance contracts and any remaining ADR reconciliation,
- overlay/controls usability polish and evidence capture in `docs/research`.

Anything else? Yes—the unresolved boundary to keep this safe is whether
`src/game/` remains contested. Once the parallel stream is cleared, the next
runtime slice can proceed without widening overlap.

### Scope

Implemented the first gameplay-system foundation under the open-system constraint from `motto_v4`:

- account XP, level, and rung derivation;
- per-rig restoration XP as a separate parallel track;
- derived mission propositions instead of persisted mission tables;
- pluggable mission generator registry;
- mission reward resolution;
- canonical activity reward routing for cargo relay and survey route;
- nested `GameState.progression` save state;
- explicit v8 → v9 migration behavior;
- public runtime observability for progression.

### Decisions

- Created ADR-0033: `docs/decisions/ADR-0033-mission-proposition-derivation-and-nested-progression-state.md`.
- ADR-0033 remains Proposed because ADR-0018 currently records a different accepted progression spine. This implementation is runtime evidence, not silent product-level supersession.
- Progression is nested under `GameState.progression` so future tracks can expand without adding unrelated top-level fields.
- Missions are derived from state/world inputs and generator registration. They are not persisted as a rigid quest ledger.
- Existing activity definitions remain the reward authority. XP and restoration values were added there so cargo and survey do not create a parallel reward table.

### Files changed

- `src/game/progression.ts`
- `src/game/mission-propositions.ts`
- `src/game/mission-resolver.ts`
- `src/game/activities.ts`
- `src/game/contracts.ts`
- `src/game/state.ts`
- `src/game/storage.ts`
- `src/main.ts` (fixed stale runtime-profile enum comparison exposed by typecheck)
- tests for progression, missions, rewards, activities, and public state
- `docs/architecture/GAMEPLAY_SYSTEMS_ARCHITECTURE.md`
- `docs/systems/MISSION_SYSTEM_DESIGN.md`
- `docs/systems/PROGRESSION_SYSTEM.md`
- `docs/decisions/ADR-0033-mission-proposition-derivation-and-nested-progression-state.md`
- `docs/decisions/README.md`
- `docs/plans/MASTER_EXECUTION_TRACKER.md`

### Verification

- `npm run typecheck` passed.
- `npm run test` passed: 64 Vitest files, 368 tests, plus 7 deterministic-kernel probe tests.
- `npm run build` passed, including asset boundary verification.
- Targeted Prettier check passed for all touched TypeScript files.
- Repository-wide `npm run format:check` remains red across pre-existing unrelated files; no broad reformat was applied.

### Remaining gate

Priority 1 is not product-complete yet. The runtime foundation is implemented and verified, but the mission-board/acceptance surface and the ADR-0018 versus ADR-0033 progression decision remain open. The next implementation unit should close that gate before moving to workshop/equipment progression.

### Operator correction

The operator rejected a conservative/default-safe path. The implementation must continue toward the strongest long-term, first-principles architecture aligned with `motto_v4`, rather than remaining a bounded evidence fixture when the correct product path can be completed.

### Anything else?

Yes. The implementation must not be marketed or treated as a settled universal-XP product direction until the operator explicitly reconciles ADR-0018 and ADR-0033.

## Mission acceptance surface recheck

- Re-read the live `mission-propositions.ts`, `mission-resolver.ts`, and
  `progression.ts` files after the runtime-foundation note landed.
- Confirmed the important distinction now visible in the code:
  - mission propositions are derived every evaluation from world/progression
    state,
  - account XP and per-rig restoration are still separate tracks,
  - the live product still lacks an operator-accepted mission-board /
    acceptance surface.
- That means the current implementation can prove the opportunity split, but
  not the product decision for a universal mission-board authority.
- The next useful work is to keep the acceptance surface named explicitly, so
  future mission work doesn’t silently become a second quest ledger.

## Verification

- Static inspection of `src/game/mission-propositions.ts`,
  `src/game/mission-resolver.ts`, and `src/game/progression.ts`.
- Cross-check against `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md`
  and `docs/decisions/README.md` to keep the ADR-0033 boundary explicit.

## Accessibility shell status bands

- Re-checked the live browser shell on the current canonical 390 × 844 mobile
  viewport after the profile/save updates landed.
- Confirmed the public HUD now presents the shell state as two separate status
  bands:
  - profile quality state,
  - save/persistence announcements.
- Confirmed Chrome’s accessibility tree exposes both bands as readable text.
- The current gap is spoken screen-reader narration, not shell structure or AT
  visibility.

## Garage/fleet roster projection layer

- Re-read the `Garage / Fleet Roster Specification` after checking the current
  runtime state and the tracker lane for RU-0606.
- Confirmed the roster is still a projection layer, not a second garage
  authority:
  - no separate garage save model,
  - no roster-owned mutation path,
  - no hidden fleet inventory model.
- Confirmed the live runtime already exposes enough public state for a
  read-only first slice:
  - active rig identity,
  - per-rig summaries,
  - workshop reach / actionable readiness,
  - recovery state,
  - site context,
  - world memory.
- That means the next useful roster proof is the overlay and focus behavior,
  not more state plumbing.

## Contract ledger source-surface recheck

I rechecked the contract-ledger seam against the live runtime surfaces and
confirmed the spec's read-only framing is still correct:

- `publicState(state, world)` already exposes the authoritative player-facing
  fields the board needs.
- `src/game/affordances.ts` already resolves offers with reason-coded
  outcomes.
- The ledger remains a projection layer, not a new mission or progression
  authority.

Next step: keep the contract ledger as a read-only board built from
`publicState`, and keep operator diagnostics separate from player-facing rows.

## Garage/fleet roster shell reuse recheck

I rechecked the garage/fleet roster against the unified shell contract and
kept the next proof narrow and durable:

- the roster is still a read-only overlay, not a separate garage authority,
- it should reuse the unified overlay manager and focus behavior,
- the active rig remains the primary context,
- the missing proof is the overlay behavior itself, not additional storage.

This keeps the roster aligned with the shell rather than drifting into a
second inventory model.

## Input remap registry gap recheck

I rechecked the accessibility/input contract and kept the next gap precise:

- the first-use guidance surface is canonical,
- the opportunity compass now tells the player what matters next,
- the remaining missing contract is the persisted binding registry,
- remap restore-before-sampling is still future work.

That keeps the guidance layer from being mistaken for the actual control-layout
source of truth.

## Labs drawer contract drafted

I drafted a dedicated labs contract so the separate `physics-lab.html` and
`box3d-lab.html` pages have a durable in-world-instrument boundary:

- the labs remain evidence fixtures, not player-facing game modes,
- the drawer should preserve the current runtime context,
- the first slice should be a same-shell, focus-safe instrument surface,
- the labs should not own save state or become a second authority.

The contract now lives in
`docs/research/LABS_AS_IN_WORLD_INSTRUMENTS_CONTRACT_2026-07-28.md`.

## Radial quick-action wheel contract drafted

I drafted a radial wheel contract so the authored `src/game/radial-ui.ts`
surface has a durable long-term shape:

- the wheel is now treated as a bounded rig-local quick-action overlay,
- it must map to the canonical named-action model,
- it must preserve focus and context,
- it should not become a second control authority.

The contract now lives in
`docs/research/RADIAL_QUICK_ACTION_WHEEL_CONTRACT_2026-07-28.md`.

## World graph and place contract drafted

I drafted the missing world-graph contract so the canonical topology of place
has its own durable note:

- authored sites, routes, and discovery anchors now have one named topology
  contract,
- the contract ledger and episode runner can cite that topology explicitly,
- the graph is treated as the source of place, not a second simulation
  authority.

The contract now lives in
`docs/research/WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md`.

## Vehicle reconstruction package expansion

- Generated and project-localized a utility/tow four-view turnaround, a
  five-mode same-vehicle board, and an isolated snow-crawler candidate.
- Inspected each image manually before admission to the project reference
  tree. Hashes and dimensions are recorded in the provenance register and
  asset README.
- Added the dedicated [Utility Tow Reconstruction Intake](research/UTILITY_TOW_RECONSTRUCTION_INTAKE_2026-07-28.md)
  with component hierarchy, proposed sockets, material families, scale
  uncertainty, mode continuity review, failure fixtures, and `img2threejs`
  admission gates.
- No runtime manifest, GLB, renderer import, or production mesh was created.
  The existing manifest remains the canonical runtime gate.

Anything else? Yes. The turnaround is useful but not exact orthographic proof;
the mode board changes meaning but cannot establish geometry; and the snow
crawler still needs its own multi-view package before reconstruction.

## Proposed sculpt record authored

- Added `docs/research/assets/utility-tow-intake-2026-07-28/object-sculpt-spec-proposed.json`.
- The record makes identity, component hierarchy, provisional scale, material
  families, sockets, pivots, collision intent, unknowns, and admission gates
  explicit.
- It is deliberately marked `proposal-not-strict-quality-validated`; no
  generated code, mesh, GLB, manifest entry, or runtime import was created.

Anything else? Yes. The next proof requires the existing upstream strict
validator or a project-owned equivalent to validate this record before any
blockout factory is generated.

## Streaming residency boundary recheck

I rechecked the streaming/residency contract now that the world graph has a
named topology contract:

- the world graph owns place and route topology,
- the streaming contract owns chunk residency and rollback,
- the runtime is still single-residency until scale pressure requires the
  chunk lifecycle.

That keeps topology and residency separate without making either one vague.

## Runtime reachability classification

The new runtime reachability audit is a routing signal, not a deletion order:

- 30 unreachable non-test modules mean the repo has a real ownership boundary to
  classify, not a proof that the code is dead.
- In a repo with parallel agents and reserved lab/runtime surfaces, the next
  safe step is to classify each unreachable module as parallel-owned,
  future-bound, lab-only, or truly dead before removing anything.
- That keeps preserved work, exploratory code, and deferred platform seams from
  being collapsed into one misleading "unused" bucket.

## Motto alignment correction — save migration and persisted capability data

The completion review surfaced a policy failure: compiler-unused imports were
initially treated as deletable before checking supersession, schema history,
canonical ownership, and the long-term data contract. That approach was
reversed and corrected in the same work sequence.

- `RIG_CAPABILITIES` is retained and now validates persisted mastery keys during
  progression recovery; unknown capability data is rejected at the data
  boundary rather than silently becoming runtime state.
- `V8_SAVE_SCHEMA_VERSION` is retained and now participates in the migration
  chain. Both schema v8 and the previous schema v9 migrate through the shared
  predecessor path into the current schema v10 shape.
- The migration diagnostic now reports the actual source schema version.
- A focused regression test covers both predecessor versions and verifies that
  an unknown persisted capability is not admitted.

Verification after the correction:

- `git diff --check` — passed.
- `npm run typecheck` — passed, including the deterministic-kernel-probe
  package typecheck.
- `npx vitest run` — passed: 64 test files, 372 tests.

This correction preserves the parallel runtime design and strengthens its
canonical migration/data-validation boundaries. No runtime method or behavior
was deleted.

Anything else? Yes. The review rule is now explicit for future cleanup:
compiler diagnostics are signals to investigate, not authorization to delete;
every removal must first pass supersession, source-of-truth, migration, and
long-term product checks.

## 2026-07-28 — wide-open brainstorm produced a measured reachability finding

- Ran the external `wide-open-brainstorm` skill in single-agent mode (no
  `ask-*` LLM wrappers installed; repo precedent RU-0909 already established
  internal-only role play), with `game-design`, `game-development`,
  `threejs-game-director`, and `3d-web-experience` as supporting lenses.
- Refused to brainstorm against remembered facts and measured the repository
  first. That measurement produced the session's largest finding.
- Added `tools/audit-runtime-reachability.mjs` and six tests in
  `tools/audit-runtime-reachability.test.mjs`. The audit walks the transitive
  import graph from real entry points, so it catches orphan clusters that a
  naive "has an importer" grep reports as healthy — `expedition-economy.ts` is
  imported, but only by `salvage-crafting.ts`, which is itself unreachable.
- Result on this checkout: 78 non-test source modules, 48 entry-reachable,
  **30 unreachable (2,365 lines), 28 of them with passing tests**.
- Found and corrected a false claim in load-bearing records: ADR-0031 and the
  Master Execution Tracker both state `src/game/animation.ts` is wired into the
  live renderer path. It is imported by nothing. Recorded as a provenance
  repair in the same class as RU-0903, appended rather than rewritten.
- Fixed two real defects in the audit tool while building it: root-absolute
  Vite specifiers (`/src/main.ts`) were resolving against `process.cwd()`
  instead of the audited root, and archived HTML previews under `docs/` were
  conferring reachability on modules nothing ships.
- Brainstorm artifact:
  `docs/exploration/WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md`.
  Its central finding is **the Missing Middle**: the loop has verbs for
  departure and arrival and almost none for coping in between, and the UI has
  the matching hole at the matching altitude.
- Updated the exploration map and the execution tracker in the same pass;
  opened RU-0910 (wire three tactical verbs), RU-0911 (reachability budget
  policy), and RU-0912 (Act I fleet-versus-single-machine sequencing).
- No `src/game/` file was edited. RU-0910 explicitly requires operator
  clearance for the parallel-ownership collision before it can start.

Anything else? Yes. The uncomfortable part of this entry is that the brainstorm
artifact is itself another document in a repository that already has 276 of
them. Its defence is that it shipped a reusable measuring instrument alongside
the prose and that its recommended next action is a wiring commit. If the next
session produces another design note with no reachable verb behind it, this
entry should be read as evidence for the Executioner's case rather than against.

## Wiring experiment is now the next concrete step

The next concrete artifact is the wiring experiment for
`src/game/radial-ui.ts`, `src/game/weather.ts`, and
`src/game/fleet-recovery.ts`:

- see `docs/exploration/WIRING_EXPERIMENT_RADIAL_WEATHER_RECOVERY_2026-07-28.md`;
- it is a falsifiable wiring path, not another contract note;
- it should surface one reachable verb and one visible outcome path.
- current route anchors are `main.ts` recovery feedback, the recovery control
  lesson, weather-weighted recovery propositions, and `fleet-recovery.ts` as
  the consequence primitive.
- the experiment now crosses control guidance -> named action -> proposition
  -> command/result -> progression consequence.
- it now also probes whether the read-only contract board can be the player
  choice surface for that proposition.

## Addendum (2026-07-28) — the acceptance surface is now explicitly named

The acceptance-surface gap that kept showing up in the loop/progression and
ledger notes now has a durable research artifact:

- `docs/research/MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md`

That note keeps the board read-only while naming the accessible choice layer
above it. It should be the anchor for future analysis of focus, labels,
reason text, and accept/dismiss behavior.

## Addendum (2026-07-28) — the accessibility follow-through is also named now

The accessibility analysis now has a matching follow-up note:

- `docs/research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md`

The important point is not just that the board is visible. It is that the
board can be announced, focused, and dismissed as a real browser boundary, in
the same way save, pause, map, and workshop already need explicit contracts.

## Addendum (2026-07-28) — the row model and announcement contract are now named

The next concrete layer above the surface contract is now explicit:

- `docs/research/MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md`

This gives the worklog a place to point when discussing selection state,
spoken reasons, accept/dismiss naming, and focus restore behavior.

## Addendum (2026-07-28) — the board sectioning and visibility contract is now named

The next presentation-layer question has a durable artifact too:

- `docs/research/MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md`

That note keeps the board from becoming an unfiltered ledger dump and gives
future analysis a place to point when discussing compact versus expanded view,
visible sections, and history handling.

## Addendum (2026-07-28) — the board header and summary contract is now named

The orientation layer above the sections is also explicit now:

- `docs/research/MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md`

That gives the worklog a place to point when discussing board title, summary
counts, and the compact/expanded mode line.

## Addendum (2026-07-28) — the history recap contract is now named

The board's memory trail now has a concrete retention rule:

- `docs/research/MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md`

That keeps the worklog grounded when history becomes crowded and the board
needs to remain readable without losing older outcomes entirely.

## Addendum (2026-07-28) — the board transition and restore contract is now named

The board choreography now has a durable artifact too:

- `docs/research/MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md`

That gives the worklog a place to point when discussing open, reconfigure, and
close behavior without collapsing the board into a separate page model.

## Addendum (2026-07-28) — the empty-state fallback contract is now named

The zero-row board case now has a durable artifact too:

- `docs/research/MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md`

That gives the worklog a place to point when discussing no-rows behavior and
how the board explains itself instead of appearing broken.

## Addendum (2026-07-28) — the loading/refresh contract is now named

The in-progress board case now has a durable artifact too:

- `docs/research/MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md`

That gives the worklog a place to point when discussing how the board stays
honest while rows are still being rebuilt.

## 2026-07-28 — ADR-0034: the animation boundary was right, its mechanism was not

Fixed the false wiring claim from the reachability audit. The obvious repair —
wire `animation.ts` as ADR-0031 described — was examined and rejected, because
reading the module against the live kernel showed it would have damaged the game:

- it integrated its own `wheelRotation` from `speed x delta` per frame, while
  `physics.ts:468` already integrates it slip-aware in the fixed step, persists
  it, validates it on load, and publishes it in `publicState`. That is a
  frame-rate-dependent second truth source for a replay-validated value;
- it invented suspension compression from drive load, while the kernel owns
  `mobility.wheels[i].compression`;
- its `applyTransformations` set only the damped body angles, dropping
  `heading`, `pitch`, and `roll` — every rig would have gone visually flat on
  sloped terrain;
- it hardcoded `lug-tires` where the renderer had a generic module loop, and
  lost the state shell's `uHitPoint` damage-pulse location.

This is motto §22's worked example: a rule right in spirit, wrong in mechanism.
ADR-0034 therefore supersedes ADR-0031, keeps the ownership boundary (§23), and
corrects what the owner is allowed to compute. The kernel owns anything that
survives a reload or a replay; presentation reads it.

Rather than delete the module's two dormant channels, both were built:

- **Cockpit steering control.** The steering-wheel channel resolved
  `getObjectByName("steeringWheel")` against an object no rig authored. Torque
  and Spark now carry a real raked steering column whose rim turns at 2.5x the
  road-wheel angle. Placement was corrected after live browser evidence: the
  tractor's hood socket sits at `localZ 0.55`, _ahead_ of the windscreen, so it
  is a hood-mounted view rather than an interior one. The control now sits in
  the cab where a driver would hold it. The genuine cockpit payoff needs an
  interior camera that does not exist yet, and that is stated as a gap rather
  than claimed as a win.
- **Clip seam.** `clipActions` was permanently `null` while the GLB loader was
  already discarding `gltf.animations`. Imported clips now bind to a mixer the
  frame loop ticks, and the bound count is recorded in
  `RuntimeAssetBridgeEvidence.animationClipCount`.

Verification:

- `npm run audit:reachability` — unreachable modules 30 -> 29, lines 2,365 -> 2,040.
- `npm run typecheck` — clean.
- `npx vitest run` — 65 files, 382 tests; `src/game/animation.test.ts` is new
  with 10 tests and the file previously had none.
- Live 4173 chase camera under throttle and steering:
  `visualFrontIsForward: true`, `frontAlongHeadingMetres: 6.246`,
  `cameraFocusContractMet: true`, `steeringAngle: -0.3`, zero console errors.
  The orientation invariant is the direct proof: it would be false had ADR-0031
  been implemented literally.

Also updated canonical `motto_v4.md` in `~/Downloads` and the project copy
(verified byte-identical afterwards) with three §23 clauses this episode earned:
a boundary's status does not protect its mechanism; implementation claims must
name the check that would falsify them; and unreachable code cannot be trusted
to be correct, because nothing forces it to stay consistent with the runtime.

Anything else? Yes. The steering control is real and animated but its payoff is
gated on an interior camera. That gap is recorded here and offered as candidate
work rather than folded into this gate's claims.

## Progression model coexistence resolution — 2026-07-28

The operator clarified the intended architecture: retain both progression models, use the newer capability-shaped model as canonical for current games, and allow the XP model later in any game or as a deliberate hybrid.

Documented in `docs/exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md`:

- Journey/Mastery/Insight remains the canonical engine/product foundation.
- Universal XP/levels/rungs/restoration is an optional game policy, not dormant fields in the current `ProgressionState`.
- Hybrid games may award both from one activity through explicit, namespaced reward routing.
- No implicit conversion, aliases, or second editable authority is allowed.
- XP adoption requires a concrete consumer, policy state, migration contract, gates, UI, and tests.

Updated ADR-0033, the progression system design, gameplay architecture, decision register, tracker, and integration review to reflect this boundary. The progression-model conflict is resolved at the architecture/documentation level. The mission-board/acceptance surface remains a separate implementation gate.

Verification:

- `npm run typecheck` passed.
- `npx vitest run` passed: 64 test files, 372 tests.

## 2026-07-28 — P0: a read model was opening gameplay progression

External review (ChatGPT) flagged that `evaluateCorridorQuality()` mutated
canonical state. **Verified against source before acting** — all three claimed
failure modes are real:

1. **Reading changed state.** `publicState()` calls `resolveFirstRung()`, which
   reaches `evaluateCorridorQuality()`, which set
   `state.unboundPassage.status = "open"`. Calling `render_game_to_text()` or
   showing a read-only board could advance progression.
2. **It bypassed the command boundary.** `resolveUnboundPassageCommand()` already
   validates actor and lane, increments `revision`, and emits an event. Grep
   confirmed it was referenced *only from tests* — the canonical transition path
   was never used at runtime.
3. **It wrote an invalid persisted shape.** The mutation set `openedByRigId` but
   not `openedByLaneId`, and `restoreUnboundPassage()` resets any `"open"`
   passage missing either field back to blocked. The passage opened in-session
   and silently reverted on reload.

Worse than reported: the new guard fails at **spawn**, so the corridor was
already passable in a fresh world and the passage opened on the *first*
`publicState()` call.

### Fix

- `evaluateCorridorQuality()` is now a pure selector.
- `syncUnboundPassageFromCorridor()` owns the transition, routes through
  `resolveUnboundPassageCommand()`, and picks an eligible lane for the acting
  rig so the persisted shape survives its own restore.
- It is called from `stepGame()` inside the plough's terrain-deform branch —
  event-driven, so the expensive route probe runs only when terrain actually
  changed, and mutation lives in the fixed step where it belongs.

### Evidence that the guard is real, not vacuous

`src/game/selector-purity.test.ts` (5 tests). The defect was **temporarily
re-introduced** to confirm the guard catches it:

- with the defect restored: **2 failed / 3 passed**;
- with the fix in place: **5 passed**.

Full suite: 67 files, 392 tests pass. Typecheck clean for all touched files.

### Parallel-work note

`src/main.ts` currently reports unused mission-board symbols under typecheck
(`missionBoard*`, `WORLD_SITES`). These are **not** from this change — another
agent is mid-wiring a mission board; the suite grew from 65 to 67 files during
this gate. Left untouched per the parallel-ownership rule.

Anything else? Yes. The remaining items from the external review — the
`recovery` naming collision, the fleet-recovery assessment, weather→traction
wiring, the board/radial projection split, and the enforced `verify:head`
pipeline — are **not** done. They are real and worth doing, but each is its own
gate and this one closes the blocking correctness defect only.

## 2026-07-28 — continuation audit after acceptance rerun

- Ran `npm run audit:reachability:budget` and `npm run test:browser` on the live tracked surface.
- Reachability remains classified at `29` unreachable modules, under the adopted budget, with the unchanged warning that many tested modules remain off-entry and need explicit wiring or archival.
- Browser acceptance produced `fixtureReplayClassification: unsupported-entry` because the current fixture set still uses non-replayable `placeRig`; this is a known boundary that should be captured in the next wiring tranche rather than treated as a regression.
- Accessibility pass (`npm run test:shell-accessibility`) remains clean (no console problems), and the live acceptance profile still shows camera/readability, save/reload parity, and replay probes passing on desktop and narrow snapshots.
- The immediate next gate is unchanged from the execution board: A6 external fresh-player comprehension, then reconcile B3a/B4/C1 schema and ownership decisions before opening wider vertical choices.
- No source code was edited for this cycle beyond tracked acceptance artifacts; this cycle preserves the boundary with `src/game/` while the remaining gates are decided.
