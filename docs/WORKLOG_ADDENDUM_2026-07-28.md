# Worklog Addendum — 2026-07-28

## Mission proposition and progression runtime foundation

## Analysis thread — 3D-games lens maps the current shell and proof gaps

- Re-read the `3d-games` skill and used it as the next analysis lens for the
  live app surface.
- Confirmed in-browser that the shell exposes a `Camera view` selector with
  six named modes and that the physics lab is still a separate evidence lane
  at `/physics-lab.html`.
- Added a durable analysis note so the current 3D state is now documented as a
  browser-visible shell plus a separate physics proof surface rather than as a
  generic "3D is hard" observation.
- The remaining gap from this pass is not the existence of camera or physics
  structure; it is the browser-visible threshold story for visibility, LOD,
  lighting, and fallback readability.

Anything else? Yes: the next lens should be browser-delivery oriented so we
can keep the current 3D contracts grounded in live surface behavior.

## Analysis thread — browser profile/status is already visible, so the loading gap narrows

- Re-checked the live `Field 02` browser surface and confirmed the player can
  already read `Quality: standard.` and `Saved locally just now` in-session.
- The same shell also shows `Field systems ready. Restored session controls are
  active.` plus visible `#profile-status` and `#save-status` regions, so the
  earlier “profile signal is still mostly indirect” framing is now outdated for
  this build.
- The remaining browser-delivery gap is now narrower and cleaner: there is
  still no dedicated progress bar or explicit `aria-busy` bootstrap marker.
- That makes the next proof question more precise: do we want to keep the
  current truthful indeterminate loading state, or add an explicit progress
  affordance before wider public delivery?

Anything else? Yes: the shell is already more transparent than the old note
implied, so the remaining work is about explicit loading evidence rather than
basic profile visibility.

## Analysis thread — asset promotion boundary is now a proposed ADR

- Re-checked the live asset trail after the developer-surface bridge proof and
  promoted the public-approval boundary into its own proposed ADR.
- The durable rule is now recorded in
  `docs/decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md`:
  runtime-tested bridge proof stays separate from `publicRuntimeApproved`.
- The first public candidate remains the breakable crate, while the tractor
  preview stays developer-only proof until the operator explicitly chooses to
  promote a vehicle-shaped asset.
- This keeps the asset trail boring on purpose: proof is not approval, and
  manifest admission is not player-safe truth until the decision record says
  so.
- The approval record now has a durable template too, so the operator has a
  concrete place to record a real promotion decision instead of improvising a
  one-off note.
- The first public candidate now also has a compact checklist, so the approval
  path is step-by-step instead of implied.
- A short player-gate evidence note now explains why developer runtime proof
  still does not open player distribution.

Anything else? Yes: the decision boundary is now a named artifact instead of an
implied workflow note.

## Analysis thread — public asset gate evidence trail

- Extended `docs/reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md`
  so the package index now links the live asset manifest, manifest schema,
  runtime bridge, and runtime tests.
- That keeps the public-asset promotion trail honest: the written review and
  workflow remain separate from the runtime admission gate, but the gate is now
  reachable from the same durable package page.
- Updated `docs/exploration/EXPLORATION_MAP.md`,
  `docs/decisions/README.md`, and `docs/plans/MASTER_EXECUTION_TRACKER.md` so
  the package index is discoverable from the canonical project maps.

Anything else? Yes: the public candidate remains proposed and operator
approval is still required; this work only improves the trail and the
discoverability of the evidence.

## Analysis thread — asset-production lens keeps creation separate from promotion

- Re-read the `3d-asset-production` skill against the current asset trail and
  confirmed the repo already has the right delivery ingredients:
  provenance tracking, normalized runtime candidates, validation hooks, and a
  public approval boundary.
- Updated the exploration map so the asset pipeline now points at the public
  promotion review, not just the manifest or the general design doc.
- The open work is still the promotion decision for the first candidate; the
  analysis now makes it clear that creating more assets is not the missing
  step.

Anything else? Yes: this remains documentation and evidence alignment, not a
runtime asset change.

## Analysis thread — 3D-web lens ties live browser-first evidence to policy naming

- Re-read the `3d-web-experience` skill against the live repo analysis and
  confirmed the current surface already has browser-first traits:
  runtime profile selection, narrow/mobile support, reduced-motion/fallback
  hooks, and bridge fallback handling.
- Added the live repo analysis to the exploration map so the browser-first
  evidence is now reachable from the same durable strategy page that names the
  broader browser-delivery audit.
- The remaining gap is still policy naming and explicit public delivery
  boundaries, not proof that the surface can already behave like a browser
  3D product.

Anything else? Yes: the browser-first evidence is real, but the contract still
needs a public name.

## Analysis thread — accessibility lens narrows the remaining proof stack

- Re-read the `Accessibility Auditor` checklist against the live shell notes
  and recorded the remaining proof stack explicitly.
- The shell already has the baseline primitives:
  skip link, keyboard focus, visible focus styles, semantic controls, and live
  status regions for bootstrap/profile/save.
- The next evidence slice is not another keyboard fix; it is the manual QA
  stack:
  - spoken screen-reader narration,
  - 200% zoom / narrow reflow,
  - JavaScript-disabled core fallback,
  - an explicit accessibility statement or equivalent durable pointer.
- That keeps the public promise honest about what is verified versus what is
  still only structurally present.

Anything else? Yes: the accessibility story is structurally strong, but the
manual inclusive QA pass still needs to be run.

## Analysis thread — live shell readout confirms the measuring-state surface

- Re-opened the canonical Field 02 browser surface after restarting the local
  dev server and confirmed the shell begins in a measuring state rather than a
  ready state.
- The live status stack now has explicit text at entry:
  - bootstrap status,
  - save status,
  - profile status,
  - control-lesson,
  - toast.
- Focus lands on the Enter World button, the viewport stays horizontally
  clean, and there is still no dedicated progress bar on the public shell.
- The remaining accessibility work is now the manual inclusive QA stack around
  the statement and shell, not the existence of the pointer itself.

Anything else? Yes: this is live-browser evidence, not a code change.

## Analysis thread — public accessibility statement becomes a named contract

- Added `docs/research/ACCESSIBILITY_STATEMENT_AND_PUBLIC_PROMISE_CONTRACT_2026-07-28.md`
  so the remaining browser accessibility gap is now a durable public-promise
  note instead of only an implied TODO in the live shell evidence.
- Linked that note from the exploration map so the public accessibility
  statement is reachable from the same durable navigation surface as the
  browser-delivery and loading-progress reviews.
- The shell source now includes a masthead accessibility link to the statement
  page, and the refreshed live browser surface now shows that link in the
  rendered masthead.
- A concrete docs page now exists too, and the remaining work is to keep it
  discoverable and maintain it as the inclusive-QA evidence changes.

Anything else? Yes: the gap is now named, not hidden.

## Analysis thread — browser loading progress trust gap indexed

- Added `docs/reviews/BROWSER_LOADING_PROGRESS_ISSUE_REVIEW_2026-07-28.md`
  to the browser-delivery exploration lane so the open loading-progress gap is
  now discoverable from the canonical map instead of only from the review file
  itself.
- Kept the browser-shell trust split explicit: profile visibility, save
  announcement, and truthful loading state remain separate concerns rather
  than one merged note.

Anything else? Yes: this is still documentation and evidence work, not a
runtime fix; the browser shell still needs a real loading-progress contract.

## Analysis thread — dynamic collision authority trail

- Added `docs/research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md` to
  the canonical exploration map and linked it from the decision register.
- Registered `ADR-0037` in `docs/decisions/README.md` so the collision
  authority correction is visible in the decision index without pretending it
  is accepted.
- Added a tracker note in `docs/plans/MASTER_EXECUTION_TRACKER.md` so future
  agents can see that the collision-contact seam is now being tracked as a
  documented evidence/decision thread.

Anything else? Yes: the runtime collision implementation remains parallel-owned
and untouched; only the research and documentation trail moved.

## Analysis thread — reachability narrative drift correction

- Re-read the reachability tranche notes and found a stale raw-count claim that
  no longer matched the current ownership classification trail.
- Preserved the historical 30-of-78 brainstorm snapshot, but added explicit
  addenda that point at the live [Runtime Reachability Ownership Matrix](reviews/RUNTIME_REACHABILITY_OWNERSHIP_MATRIX_2026-07-28.md)
  and [Runtime Reachability Dispositions](exploration/RUNTIME_REACHABILITY_DISPOSITIONS_2026-07-28.md)
  as the current interpretation layer.
- Normalized the short disposition note so it records the budgeted archive/defer
  set without hard-coding the count as if it were the live classification.

Anything else? Yes: the audit is still an evidence signal, not a deletion order,
and the newer ownership matrix now owns the measured classification.

## Analysis thread — parallel-runtime handoff and blocker surfaced in the index

- Added the parallel runtime handoff and the browser runtime blocker to
  `docs/reviews/README.md` so future continuation work can reach the active
  boundary without rediscovering it through the worklog.
- That keeps the current shared-lane story explicit:
  - the handoff records the active ownership boundary and safe order of
    operations,
  - the blocker records the browser/runtime failure state that must be
    re-entered only after the live lane stabilizes,
  - neither note is a request to overwrite parallel-owned runtime work.

Anything else? Yes: the worklog now points at the same parallel boundary the
reviews index does, so the chronological and navigational trails agree.

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

The durable review artifact for that classification is
`reviews/RUNTIME_REACHABILITY_OWNERSHIP_MATRIX_2026-07-28.md`.

`src/game/asset-manager.ts` has now been reclassified as a superseded contract:
the live admission path is manifest-driven runtime assets, not the old
centralized loader sketch documented in the 2026-07-27 loader-flow note.

`src/game/world-memory.ts` stays preserved as a contained prototype. The module
is a pure, read-only projection of furrow and rig telemetry, and its dedicated
containment review already says it has no gameplay integration yet.

`src/game/campaign.ts` stays preserved as a future-bound contract spine. It has
tests and documentation, but the shipped runtime entry graph still does not
import it, so it remains a designed-but-unwired seam rather than live gameplay
authority.

`src/game/ghost.ts` stays preserved as a future-bound replay helper. The live
replay authority is the bounded run-record lane (`src/game/run-record.ts` and
`src/game/replay-validator.ts`), while the ghost overlay/ghost-artifact work is
still a deferred product contract with its own plan and tests.

`src/game/procedural-missions.ts` stays preserved as a superseded generator
sketch. The newer mission-proposition system in `src/game/mission-propositions.ts`
and the mission acceptance surface now own the canonical mission path, so the
older generator is historical rather than live runtime wiring.

`src/game/weather.ts` stays preserved as a future-bound weather / traction
contract. The module is pure and tested, but the live runtime still passes
weather as an injected string into mission generation and does not import this
module yet.

`src/game/topo-map.ts` stays preserved as a superseded contour helper. The live
field map in `src/game/minimap.ts` already renders contour isolines and terrain
readability directly, so the older isolated contour generator is historical
rather than canonical runtime wiring.

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
- Result on this checkout (historical snapshot): 78 non-test source modules, 48 entry-reachable,
  **30 unreachable (2,365 lines), 28 of them with passing tests**. The current
  classification lives in the ownership matrix and disposition artifacts.
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

## 2026-07-28 — accessibility auditor seam recheck

- I used the `Accessibility Auditor` skill as the next analysis lens because the unified shell spec and the operator-observability contract both point to the overlay stack as the next trust boundary after the current runtime/progression work.
- Static review now ties the next safe docs-backed seam to the major-overlay contract surface:
  - `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` already names the map, contract board, workshop, garage, pause, labs, and control-lesson surfaces as one shell;
  - `docs/reviews/MAP_OVERLAY_DIALOG_AND_FOCUS_ISSUE_REVIEW_2026-07-26.md`,
    `docs/reviews/PAUSE_STATE_ANNOUNCEMENT_ISSUE_REVIEW_2026-07-26.md`, and
    `docs/reviews/TOUCH_RADIAL_ACTION_BOOT_BLOCKER_ISSUE_REVIEW_2026-07-28.md`
    show the current accessibility/focus gaps are still treated as live shell contracts;
  - the contract board remains planned in the shell spec and is still a read-only surface, not a second authority.
- The new boundary review at `docs/reviews/CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md`
  captures the specific missing step: the acceptance surface still needs a
  runtime command boundary and focus-managed board branch before it can be a
  player-reachable overlay rather than a spec-only projection.
- The new labs review at `docs/reviews/LABS_DRAWER_CONTINUITY_ISSUE_REVIEW_2026-07-28.md`
  records the separate-page continuity gap: the labs contract is clear, but
  the shell still needs a mounted drawer or equivalent route to preserve the
  current runtime context.
- The input-remap persistence review now has a fresh addendum clarifying that
  the radial wheel and visible controls legend are consumers of the canonical
  action model, not the registry itself. The missing layer is still one
  persisted binding source of truth.
- The core accessibility/input contract now says the same thing at the source
  level: help surfaces are explanatory, while the reload-safe binding registry
  remains the canonical action-layout source of truth.
- The browser-proved shell profile owner contract now also has live-browser
  proof that the public HUD carries the visible profile line while operator
  diagnostics stay separate.
- The mute-preference review now clarifies that mute belongs beside the
  player-facing profile owner as a durable comfort preference, but its
  persistence layer is still missing.
- The workshop review now sits in the same focus-managed shell family as the
  other major overlays, so its next proof stays presentation/focus-oriented
  rather than state-plumbing-oriented.
- The resource budget contract now carries a fresh addendum: the public shell
  shows profile and save state, but the fallback envelope is still policy-only
  and lacks a canonical low-budget decision path.
- The world affordance/capability resolver now has a fresh addendum saying it
  is the shared decision surface beneath workshop, acceptance, and radial
  interactions, but still not the shell itself.
- The audio presentation contract now carries a fresh addendum saying the
  shell already owns state narration, so audio remains a support channel for
  machine feel and cues rather than a second announcement system.
- Next safe exploration slice: document the contract-board / modal-overlay accessibility contract in more detail before any runtime touch, with explicit focus restoration, `role="dialog"`, `aria-modal="true"`, keyboard parity, and announcement behavior.
- Runtime files in `src/game/` remain contested and were not touched.

## 2026-07-28 — objective refresh: what is left and what is next

- Re-confirmed execution board and master tracker states after the latest local checks:
  - A6 external fresh-player comprehension is still open and explicitly unproven in all production/review documents.
  - B3a (Survey Route 01 / schema-v7 claim) and B4 (emissions + cultivation groundwork) remain `Decision needed` gates before widening vertical scope.
  - B8 is in-progress but explicitly needs a new preservation-audit + full managed hook + exact source push/deploy + public rerun before it can close again.
  - C1 is still `Decision needed` for the next vertical.
  - D1 performance envelope is still `[ ]` in the board and remains a separate evidence class from current functional browser passes.
- Ran live checks in this cycle:
  - `npm run audit:reachability:budget` passes at `--max 28` (`Non-test source modules: 81`, `Entry-reachable: 53`, `Unreachable: 28`).
  - `npm run test:reachability` passes (`6/6`, no failures).
- Key gating mismatch found:
  - Several files still carry stale language around a prior build/open-gate path, so next work should treat the current addenda as higher-precision than earlier status rows.
- Concrete next sequence (in order):
  1. Complete A6 with a clean external fresh-player run and record evidence.
  2. Resolve B3a/B4 decision dependencies with operator sign-off and ADR/decision links.
  3. If `C1` is set, begin C2 or C4 per decision, with B8-style preservation/deploy discipline only after that tranche is coherent.
  4. Execute D1 representative-device evidence only after UI/comprehension decisions are no longer speculative.
  5. Re-open `B8` only once local, GitHub, Sites, browser, and review evidence are coherent again.

## 2026-07-28 — the fleet-recovery vertical chain

Built the complete chain the external review found missing:

```text
world situation -> pure assessment -> projection -> validated command
-> authoritative transition -> event -> persistence
```

### What landed

- **Naming collision removed.** The mission binding `"recovery"` (which meant
  salvage) is now `"salvage-retrieval"`. `"fleet-recovery"` is reserved for
  recovering an actual rig.
- **`deriveFleetRecoveryAssessment()`** — one pure selector answering which rig
  is stranded, which rigs qualify, what capability is missing, whether proximity
  suffices, what weather is doing, and what command is issuable. The board, the
  radial wheel, the HUD, the browser hook, and the tests all read this one
  assessment, so they cannot drift apart.
- **Weather reaches traction.** `deriveWeatherState()` now feeds `stepGame()`
  and the motion model through a shared `MotionOptions.soilMoisture`. The
  simulation gets wetter ground *before* any mission copy claims it is harder.
  `weather.ts` moved from unreachable to reachable.
- **Authoritative command.** `resolveFleetRecoveryCommand()` follows the
  `unbound-passage.ts` shape: validation, accepted/rejected, event, reason. It
  is pure; `applyFleetRecovery()` is the only mutation. `performFleetRecovery()`
  is the single runtime entry point.
- **`verify:head`** — one pipeline: format, typecheck, tests, asset gates,
  reachability tests, reachability budget, build. Plus `verify:head:browser`.
- **Docs reconciled.** `GAMEPLAY_SYSTEMS_ARCHITECTURE.md` carries a status
  correction table (its ECS-lite / Rapier / XP / credits / markets claims are
  aspirational, not runtime). README gained a current-runtime-facts table.

### Verification

- 69 files, **410 tests** pass (up from 392).
- Reachability: 29 -> **28** unreachable; budget ratcheted to 28 and enforced.
- Typecheck clean for every file this work touched.
- Live browser on `?acceptance=field-02`, real chain, zero console errors:
  - no stranded rig -> `status: "none"`, no command;
  - stranded 60 m away -> `status: "conditional"`,
    *"utility-tractor is 60 m away. Drive within 12 m to attach the strap."*,
    `command: null`;
  - stranded 5 m away -> `status: "available"`, label *"Recover toy-buggy"*,
    command emitted;
  - `recoverStrandedRig()` -> accepted, condition 0 -> **25**,
    diagnostic *"utility-tractor recovered toy-buggy. Condition 25%."*;
  - repeat -> **rejected**, no double payout;
  - **after reload, condition persists at 25**.

### Corrections to the external review

- Its claim that the passage restore resets on a null lane was **right**;
  verified at `unbound-passage.ts:356-361`.
- Its schema-v10 claim was **right** (`SAVE_SCHEMA_VERSION = 10`); the several
  lower constants are historical migration anchors, not competing versions.
- The browser could not prove weather->traction because the spawn sits on
  hardpan, which `applyWeatherGripPenalty()` deliberately exempts. That is
  correct behaviour, so the proof moved to `weather-traction.test.ts`, which
  shows saturated soil produces more slip over an identical run.

### Not done

- The radial wheel still holds local `active` booleans; converting it to pure
  projections is the Pegboard slice (ADR-0035), not this gate.
- `src/main.ts` has unused `missionBoard*` / `WORLD_SITES` symbols from
  **parallel work landing during this gate**. Untouched per the ownership rule.
  `verify:head` will fail on them until that agent finishes.

## 2026-07-28 — quarantine, the Pegboard, and the first two commitments

### ADR-0036: universal XP is quarantined

The reachability audit surfaced `xp-progression.ts` — 175 lines, tested,
unreachable, implementing account XP and player levels. **ADR-0018, accepted by
explicit operator sign-off, rejects exactly that.**

This is the ADR-0031 failure mode with the polarity reversed: there, an
unreachable module held a wrong mechanism for an accepted boundary; here it holds
a rejected design. Both cases share the root cause — an unreachable module is
governed by nothing.

The module is **preserved, not deleted** (code-preservation rule), and instead
**quarantined**:

- `tools/audit-runtime-reachability.mjs` now carries an explicit quarantine list;
  importing a quarantined module from anything entry-reachable fails the audit
  and therefore `verify:head`;
- quarantined modules are excluded from the unreachable budget, because counting
  them would create pressure to "fix" them by wiring them;
- the file carries a status header so an agent reading only the source learns its
  standing.

**Proven to bite:** temporarily importing it from `state.ts` produced
`❌ Quarantine violations`, exit code 1, and a failing budget step. Restored, the
audit exits 0. Two tests cover the rule.

### The Pegboard is real (ADR-0035 validated)

- **Keyboard parity added.** The wheel was pointer/touch only — a core tool
  surface unreachable by keyboard, failing ADR-0035's own gate. `Q` now opens it.
- **Projections replace stored state.** `deriveRigToolProjections()` derives
  every label, status, cost, and command from canonical state.
  `RadialMenuItem.active` is no longer gameplay authority.
- **The accessibility opt-in works.** Live by default (`paused: false` while
  open); `setPegboardPausesWorld(true)` pauses and restores through the canonical
  path, and only un-pauses a pause it created.

### Tyre pressure and differential lock are commitments, not upgrades

New kernel-owned `RigToolState` on each rig, with defaulting restore for older
saves. Both compose into motion:

- **airing down** buys soft-ground float, costs top end — and only helps where
  grip is scarce, so on hardpan it is pure cost. That is what stops it being a
  permanent upgrade the player leaves switched on;
- **locking the differential** buys traction, costs turning, via the existing
  `computeAxleTorque` scrub factor.

Both modules passed the discriminator from ADR-0034 — they are pure functions
taking parameters, inventing no state the kernel owns — so they wired cleanly
rather than needing supersession.

### Mission acceptance authority

- Added `src/game/mission-lifecycle.ts` as the single mutation boundary between
  derived propositions and the persisted runtime contract.
- `GameState.activeMission` is the only in-flight mission state. The UI stores
  only selection/focus state and cannot accept a contract without the authority.
- Delivery and survey completion now route through the same lifecycle resolver;
  survey lapse clears the active contract through the same boundary.
- `mission:<id>` progression deeds make reward completion idempotent.
- Active mission state round-trips through save-shaped recovery and is exposed in
  the public text contract.
- Added 3 lifecycle tests covering acceptance, exclusivity, duplicate completion,
  reward idempotency, and recovery.
- Reachability dispositions are recorded in
`exploration/RUNTIME_REACHABILITY_DISPOSITIONS_2026-07-28.md`.

## Addendum (2026-07-28) — dynamic collision runtime implemented and verified

This supersedes the earlier same-day collision entry that said runtime work was
parallel-owned and untouched. The operator explicitly requested and cleared the
collision system for direct implementation.

Implemented:

- semantic collision roles and fail-closed pair policy in `collision.ts`;
- continuous circle sweeps for obstacles and dynamic bodies;
- swept authored box/circle structure proxies;
- time-of-impact ordering and re-testing for multiple candidate bodies;
- mass-weighted rig/rig, rig/cargo, and cargo/rig response;
- attached cargo terrain/obstacle/structure/fleet checks with signed reverse
  velocity;
- conservative rig footprints derived from wheelbase, wheel arc, and track;
- runtime contact identity, strongest-impact retention, policy violations, and
  bounded operator visibility;
- focused reusable browser acceptance plus JSON/screenshot evidence;
- east-side Spark/Drift Home berths so physical fleet bodies do not block the
  guaranteed westbound first-cache route.

Verification:

- focused collision/terrain/state: 5 files / 97 tests passed;
- full typecheck and Vitest: 74 files / 444 tests passed;
- production build and player-asset boundary passed;
- focused canonical browser collision acceptance passed with a 9.0 -> 2.012 m/s
  speed change, 0.303 m Spark displacement, 4.939 m separation, 8.972 m/s
  strongest swept contact, zero policy violations, and zero console problems.

The broad `npm run test:browser` is not claimed green: it reaches a stale
parallel-owned steering assertion that expects left input to decrease heading,
while the current passing steering contract intentionally increases heading.
The exact evidence and owner closure path are in
[Dynamic World Collision Acceptance](reviews/DYNAMIC_WORLD_COLLISION_ACCEPTANCE_2026-07-28.md).

Anything else? Yes: no solver was selected. The current correction strengthens
the project-owned meaning and evidence seam that any future Rapier, Box3D, or
Jolt adapter must implement.

## Verification after mission authority (historical same-day checkpoint)

- `npm run typecheck`: passed.
- `npm test`: passed, 432 tests plus 7 deterministic kernel probes.
- `npm run audit:reachability`: passed at 25 unreachable modules.
- That 25-count is the current budgeted live classification on this checkout;
  the older 30-of-78 brainstorming snapshot above is historical context, and
  the ownership matrix / disposition pair owns the live classification.
- Full build, browser, accessibility, format, and diff gates remain the final
  acceptance pass for this tranche.

## Addendum (2026-07-28) — 3d-web-experience is now the next exploration lens

- Re-read the `3d-web-experience` skill after the `3d-games` pass.
- The repo's browser-delivery story is already stronger than a generic 3D demo:
  named camera modes, separate physics-lab evidence, and browser-visible
  runtime/profile/status trails are all already in the docs.
- The remaining gap is the browser-facing honesty layer:
  explicit loading/progress, player-facing fallback explanation, and clear
  naming for essential-versus-degradable 3D.
- The canonical live browser analysis note now carries that conclusion in
  [3D Web Experience Live Repo Analysis](research/3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md).
- Next exploration should stay on the browser-delivery axis rather than
  jumping to a renderer rewrite.

## Addendum (2026-07-28) — Accessibility Auditor confirms the next proof is manual inclusive QA

- Re-read the `Accessibility Auditor` checklist against the current shell and
  the existing accessibility/profile visibility analysis.
- The current surface already has the baseline operability pieces:
  semantic controls, keyboard access, visible focus, skip-link behavior,
  announced bootstrap state, and visible profile/save state.
- The remaining work is manual proof, not a redesign:
  screen-reader pass, higher-zoom / narrow-reflow pass, JavaScript-disabled or
  core-functionality fallback pass, and a durable accessibility statement or
  equivalent public-promise pointer.
- The same browser-delivery honesty gap still applies: explicit loading/progress
  and a named reduced-capability story remain the open surface contract.
- The canonical analysis note now carries that conclusion in
  [Accessibility and Profile Visibility Live Repo Analysis](research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md).

## Addendum (2026-07-28) — the public shell and accessibility statement page now have live browser evidence

- Re-checked the public shell at `http://localhost:4173/` with a narrow
  viewport (`390 x 844`).
- The shell still exposes the core accessibility primitives in-browser:
  `main`, `header`, and `footer` landmarks; a focusable skip link to the
  playable world; and visible `#bootstrap-status`, `#save-status`, and
  `#profile-status` regions.
- The focusable order also includes the canvas, sound/fullscreen controls, the
  accessibility statement link, the physics-lab link, and the main control
  buttons, so the shell remains keyboard-operable rather than pointer-only.
- The dedicated accessibility statement page is live at
  `http://localhost:4173/accessibility`.
  - Title: `Accessibility Statement - Rigs Unbound`
  - Heading: `Accessibility Statement`
  - Purpose: public promise, remaining validation work, and user-facing test
    expectations
- The browser-delivery gap is still the same narrow one: explicit
  loading/progress is still absent, and the manual screen-reader / zoom /
  JavaScript-disabled checks remain open.

## Addendum (2026-07-28) — the accessibility statement page is narrow-safe and cross-links the evidence trail

- Re-checked the live accessibility statement page at
  `http://localhost:4173/accessibility` on the same narrow viewport
  (`390 x 844`).
- The page has no horizontal overflow at that width and keeps the promise
  surface readable:
  `main` is present, the heading is `Accessibility Statement`, and the page
  links back to the shell evidence, the live repo analysis, and the public
  promise contract.
- That means the statement page is now a real browser evidence hub, not only a
  doc entry.
- The remaining manual inclusive QA work is still open: screen-reader,
  high-zoom / narrow-reflow, and JavaScript-disabled fallback confirmation.

## Addendum (2026-07-28) — 3d-asset-production confirms the current work is promotion, not more art

- Re-read the `3d-asset-production` skill against the canonical asset-review
  trail.
- The repo already has the contract the skill wants:
  canonical manifest/preflight, source and provenance records, runtime bridge
  candidates, and a public-approval gate that remains separate from runtime
  test success.
- The current first public candidate remains the breakable crate, and the
  tractor preview remains developer-only bridge proof until the operator
  explicitly promotes a different asset.
- The right next step is not another art pass. It is the promotion path from
  reviewed source artifact to normalized export, browser activation, and
  operator-approved public distribution.

## Addendum (2026-07-28) — Agent Development says the repo already has the right parallel-handoff shape

- Re-read the `Agent Development` skill against the current handoff trail.
- The useful repo lesson is not "more agents"; it is "one obvious boundary per
  live lane." The current parallel-runtime handoff already provides that
  boundary.
- The handoff artifact is the right place to keep runtime-lane ownership
  explicit because it already explains what parallel-owned work must remain
  untouched and where the next agent should look first.
- The open gap is still operational clarity, not architecture: future work
  should keep hidden runtime edits out of the agent contract and route
  autonomous work through durable handoff notes instead.

## Addendum (2026-07-28) — Skill Development says the skill audit itself should stay the durable artifact

- Re-read the `Skill Development` guidance against the coverage map.
- The repo's skill trail is now useful because it distinguishes skill reads,
  applied guidance, incomplete provenance, and deliberate deferrals instead of
  collapsing them into one "used skill" bucket.
- The coverage map should be treated as a provenance ledger, not a checklist
  to exhaust mechanically. The next agent should use it to find the live
  boundary and the right proof slice, then continue from there.
- This pass did not need a runtime change; it only clarified how the skill
  inventory should be maintained for future continuation work.

## Addendum (2026-07-28) — 2d-games says the shell is a clarity stack, not a second game

- Re-read the `2d-games` skill against the unified shell spec and the live
  mobile shell evidence.
- The useful shell guidance is to keep the public surface in a few readable
  bands: status/prompt strip, explicit overlay planes, large touch actions,
  and an obvious return path to play.
- The current mobile shell already matches that direction because profile,
  save, and diagnostics are separated, the focus path remains obvious, and the
  public accessibility statement page gives the promise a durable home.
- The remaining work is refinement of those bands and their announcements, not
  a new shell authority or denser navigation.

## Addendum (2026-07-28) — game design keeps tow-plus-repair as the next coherent loop

- Re-read the `game-design` skill against the activity/command readiness note.
- Tow-plus-repair remains the strongest next activity candidate because it can
  prove a clear 30-second loop: action, feedback, recovery, repeat.
- That makes it a better third proof than a generic registry or plugin layer:
  the player-facing loop stays concrete while the command/result seam remains
  the same.
- The generic `ActivityDefinition` registry should still wait until that third
  materially different activity is real and can prove the same validation
  pattern in play.

## 2026-07-28 - next exploration boundary is browser delivery plus readable feedback

- App analysis now has a durable next-step note: the repo already proves
  browser-native 3D and named camera modes, but the live surface still needs
  a clearer loading story and one player-readable feedback lane.
- The `Rig Signature and Feedback Emission` note proves the source side; the
  missing work is a listener-owned presentation surface, not more source
  computation.
- The exploration map now points the next agent at that boundary so it can
  continue from the same evidence line instead of re-deriving the gap.

## 2026-07-28 - live browser probe tightened the loading story

- Used the browser-focused skill to check the public shell at
  `http://localhost:4173/?acceptance=field-02` in a 390 x 844 viewport.
- The live shell is not blank: it explicitly narrates a measured warmup state
  through `bootstrap-status`, `profile-status`, and `save-status`.
- The probe did not find a dedicated progress bar, `progress` element, or
  `aria-busy` marker, so the loading contract remains textual rather than a
  first-class progress affordance.
- That changes the analysis from “the browser needs a loading story” to “the
  browser already has a loading story, but it still lacks a visible progress
  indicator and a tighter browser-delivery contract.”

## 2026-07-28 - acceptance hooks exist, but only as hidden plumbing so far

- A follow-up browser probe found `#mission-board-button`,
  `#mission-board-close`, and `#mission-briefing-accept` in the DOM.
- Those elements were not visible or directly clickable in the ready shell,
  so the current runtime has acceptance-surface plumbing but not a mounted
  player-facing board.
- This is a useful refinement, not a contradiction: the repo is no longer
  missing the concept entirely, but it still has not shipped the reachable
  focus-safe choice layer the contract describes.

## 2026-07-28 - passive survey status also exists, so the acceptance path is layered

- A separate probe of the public shell found a hidden `#survey-contract`
  banner with the text `Contract ready`.
- That means the runtime has passive status plumbing in addition to the hidden
  acceptance hooks, but still no mounted row set or full player-facing board.
- The next note should preserve that layering so future work does not collapse
  status text, latent hooks, and the actual choice surface into one bucket.

## 2026-07-28 - desktop now proves the acceptance surface exists, but mobile still hides it

- A desktop browser probe at `1440 x 900` opened the `Contracts` button and
  confirmed the board mounts as a visible overlay with the header `Field
  contracts`.
- The board summary showed `3 contracts resolved from the field state.`, which
  proves the row/section/header contracts already have a live implementation.
- The compact/mobile shell at `390 x 844` still hides `.masthead__buttons`,
  so the acceptance surface is viewport-gated rather than universally exposed.
- The repo should now treat that as an explicit exposure policy question
  rather than a missing-board question.

## 2026-07-28 - shell contract now records the desktop-first contract board exposure

- The unified shell spec now records the same runtime distinction:
  acceptance board visible on desktop, hidden trigger cluster on compact
  mobile.
- That keeps the shell spec aligned with the live app rather than leaving the
  compact shell to imply a missing feature when the real issue is a viewport
  policy choice.

## 2026-07-28 - compact shell still lacks an alternate contract-board entry path after entering the field

- A compact-viewport browser probe after entering the field still showed no
  visible contract-board trigger path.
- The mobile story is therefore not "board present but hidden until later";
  it is "status hints remain visible, but the board has no alternate compact
  entry affordance yet."
- That is the concrete remaining product decision for the shell/contract
  boundary.

## 2026-07-28 - compact board exposure is separate from the runtime quality profile

- The compact-shell probe still reported `standard` awaiting evidence rather
  than `mobile-safe`.
- That means the hidden board trigger is a shell/exposure policy choice, not a
  visibility-profile fallback.
- The docs now preserve that separation so future work does not treat the
  contract-board entry path as a renderer-quality symptom.

## 2026-07-28 - compact shell still has no alternate contracts route through pause or touch

- A source scan of the shell actions found no compact/mobile path into the
  contract board through pause, touch, or keyboard shortcuts.
- The absence is broader than the masthead button cluster: the compact shell
  currently does not expose any alternate contract affordance at all.
- That keeps the remaining decision concrete in the notes: keep desktop-first
  board exposure, or add a smaller compact trigger later.

## 2026-07-28 - compact 3D surface is live but still lacks a dedicated progress meter

- A compact-viewport browser probe showed `#game-canvas` visible and
  interactive while `#map-canvas` stayed hidden.
- The shell exposed no `progress` element or `role="progressbar"` node, and
  the visible runtime status remained `Quality: standard.`
- That sharpens the 3D-web note: the app already boots into a live browser
  scene, but the loading/warmup story is still communicated through status
  text rather than a first-class progress affordance.

## 2026-07-28 - compact contract controls are hidden from the accessible path too

- A compact-viewport probe found the contract-related controls in the DOM, but
  they were all hidden:
  - `#mission-board-button`
  - `#reset-button`
  - `#mission-board-close`
  - `#mission-briefing-accept`
  - `#enter-world`
- That means the compact shell does not just hide the board visually; it also
  removes the board entry path from keyboard and assistive-tech reach.
- The repo should keep describing this as an exposure-policy question rather
  than a broken label or malformed dialog contract.

## 2026-07-28 - compact input still keeps the rest of the shell interactive

- A compact-viewport probe confirmed the shell still exposes map-layer buttons,
  map close, the control lesson dismiss button, pause controls, and the radial
  close button.
- So the compact surface is not globally stripped down; it selectively hides
  the contracts lane while preserving map, help, and pause interactions.
- That interaction split is worth keeping explicit in the notes because it
  explains why the remaining board issue is a shell affordance decision, not a
  general input failure.

## 2026-07-28 - lighting is phase-driven in the public shell, not a dedicated control surface

- A live browser probe showed `DAY` in the masthead/world-clock and a hidden
  `N light` hint in the controls legend.
- The shell does not expose a separate lighting settings panel, so lighting is
  currently communicated as world phase rather than as a player-facing system.
- That keeps the lighting story consistent with the rest of the shell: the
  visible controls stay on camera, map, pause, and contracts, while lighting
  remains an implicit background contract.

## 2026-07-28 - texture/material variety is visible through diagnostics and surface naming

- A live browser probe exposed `tex:16` in the runtime diagnostics.
- The shell also names the current ground/material state directly with
  `HARDPAN TRACK`, `SURFACE GRIP`, and `TRACK`.
- Hidden surface and module text carries material-driven language such as
  `Lug tyres`, `mud`, and `dust bowls`.
- The public UI still does not expose a dedicated texture/material settings
  panel, so the contract remains descriptive rather than configurable.

## 2026-07-28 - motion is visible as live gauges and shell transitions, not as a clip editor

- A browser probe found live SVG motion indicators for `speed-needle`,
  `tacho-needle`, and `radar-sweep`.
- The pause and radial overlays use opacity/visibility transitions, so the
  shell is already animating UI-state changes even without a clip timeline.
- The computed styles did not show a CSS keyframe animation name, which makes
  the motion contract feel stateful and telemetry-like rather than cinematic or
  editor-driven.
- The public shell therefore communicates motion through gauges and overlay
  transitions, not through a player-facing animation tool surface.

## 2026-07-28 - post-processing is lightweight shell polish, not a player-facing composer stack

- A probe found an SVG `#glow` filter on the rumor/map surface.
- The map legend and grade bar reinforce readability through styled UI state,
  but the shell does not expose bloom, vignette, color grading, or other
  dedicated post-processing controls.
- The effect stack is therefore present only as shell presentation polish,
  not as a player-owned `EffectComposer`-style feature.

## 2026-07-28 - loader behavior is modeled as world progress, while asset failure stays hidden

- A browser probe found `#map-progress` visible with the text `0% surveyed`.
- The shell still does not expose a dedicated asset-loading bar or
  `aria-busy` marker in the ready state.
- A no-render `#error-panel` exists with `The 3D scene is unavailable. Try again`,
  which means failure fallback is modeled in the DOM even though it is only
  surfaced on failure or preview, not in the public ready shell.
- The repo should keep world progress, asset loading, and failure fallback as
  separate concepts instead of collapsing them into one generic loading state.

## 2026-07-28 - geometry is reported through layout counts and sightline language

- A browser probe exposed `geo:105`, `bridges:2/2`, and `props:233/233` in the
  runtime diagnostics.
- The map and rumor surfaces describe survey reach and sightline-dependent
  visibility, and the map note explicitly says the map only shows ground the
  rig could see.
- There is no dedicated public geometry editor or instancing control surface,
  so the shell is reporting world layout rather than exposing mesh tooling.

## 2026-07-28 - material response is visible as grip and part choice, not a material editor

- A browser probe surfaced `GRIP 82%`, `GRADE level`, and `Ploughing` as live
  terrain/material response in the public HUD.
- The hidden workshop panel includes material-affecting parts like `Low-range
  gearing`, `Lug tyres`, and `Survey mast`.
- Those parts are described in terrain/material terms such as climbing grades,
  biting into mud and dust bowls, and extending sightlines.
- The shell still does not expose a dedicated material editor or paint booth,
  so material handling remains operational rather than authoring-oriented.

## 2026-07-28 - shader behavior is implied by the surface language, not exposed as a shader tool

- A browser probe confirmed the shell’s explicit effect signal is still the
  SVG `#glow` filter on the rumor/map surface.
- The game benefits from shader-backed readability, but the public UI does not
  expose a shader graph, fragment editor, uniform panel, or similar shader
  controls.
- The repo should keep the shader layer described as an implementation detail
  of surface treatment, not as a player-owned feature surface.

## 2026-07-28 - the public scene is a live canvas and camera selector, not a scene editor

- A browser probe confirmed `#game-canvas` is visible in the public shell.
- The help copy offers named camera views such as Chase, Hood, Side,
  Tactical, Top-down, and Survey, and the hidden `#camera-select` confirms the
  camera system is a real shell control.
- The hidden `#navigator-panel` exposes coordinate-style world readouts, which
  reinforces that the app is working in navigable scene space rather than a
  decorative overlay.
- The shell still does not expose a scene graph editor or transform hierarchy
  tool, so the fundamentals layer remains gameplay-facing instead of
  authoring-facing.

## 2026-07-28 - the browser-game shell is live, but not yet a full PWA contract

- A browser probe found that `navigator.serviceWorker` exists, but there are
  no active registrations and no service-worker controller on the current
  page.
- The document head has a favicon link, but no manifest link.
- The ready shell mounts no `<audio>` or `<video>` elements.
- The current browser-game contract is therefore a live WebGL app with browser
  controls and state, not a surfaced installable/offline PWA path.

## 2026-07-28 - sound is exposed as a control, but no media pipeline is mounted in the ready shell

- A browser probe confirmed the public shell exposes sound toggles in the
  masthead and pause overlay.
- The visible text includes `Sound on`, but there are no `<audio>` or
  `<video>` elements mounted in the ready shell.
- The current audio contract is therefore a control/state contract rather than
  an active playback surface.

## 2026-07-28 - asset production is hidden behind the build pipeline, not exposed in the shell

- A browser probe found no public export/import, provenance, or asset-delivery
  controls in the ready shell.
- There is no GLB/glTF/USD/FBX handoff panel, asset library, or version browser
  for the player to use.
- The workshop parts and world diagnostics are gameplay state, not asset
  production tooling.

## 2026-07-28 - rendering optimization remains implicit, while the shell exposes readable gameplay and live diagnostics

- A 3d-games probe confirmed the public shell keeps `#game-canvas` as the
  visible 3D entrypoint, with named camera views presented as a readability
  aid.
- The public DOM text does not surface culling, batching, or level-of-detail
  controls.
- The diagnostics strip does expose readouts such as FPS, backend, geometry,
  textures, bridges, and props, but those are status signals rather than
  tuning controls.
- The public contract is therefore “playable 3D world with readable views,”
  not “surface a renderer editor or optimization panel.”

## 2026-07-28 - the browser shell is web-accessible, but it still hides low-end and fallback choices

- A 3d-web-experience probe found `Skip to playable world`, `Fullscreen`, and
  `Accessibility` controls in the public shell.
- The current viewport was mobile-sized (`390 × 844`) and the 3D canvas stayed
  mounted, so the app is at least presentable in a compact browser layout.
- The shell shows touch-facing guidance, but no dedicated loading skeleton,
  offline banner, static 2D fallback, or low-end quality selector was surfaced
  in the ready state.
- `prefers-reduced-motion` was false in the current browser session, so motion
  reduction was not visibly exercised in this probe.

## 2026-07-28 - accessibility semantics are strong, though screen-reader behavior remains unverified

- A dedicated accessibility probe found a real skip link into `#game-canvas`
  and a focusable canvas named `Rigs Unbound playable world`.
- The live shell exposes semantic regions for game status, rig instruments,
  world opportunities, controls, touch controls, workshop, and footer info.
- Hidden dialogs already carry `role="dialog"` and `aria-modal="true"`, and
  several are wired to labels/descriptions instead of being anonymous overlays.
- The shell also exposes live regions for status, alerts, and bootstrap
  messages.
- I did not verify contrast ratios, screen-reader narration, or tab-trap
  behavior in this probe, so those remain open accessibility checks.

## 2026-07-28 - Physics Lab 01 is a separate simulation route, but it currently opens with a failure fallback message

- A browser-daemon probe of `/physics-lab` confirmed a real secondary route
  titled `Rigs Unbound — Physics Lab 01`.
- The route exposes a focusable `#physics-canvas` with the accessible name
  `Playable Rapier raycast vehicle laboratory`.
- It includes telemetry for speed, slip, wheel contact, physics step time,
  frame rate, bodies/colliders, camera view, solver rate, and time scale.
- The controls include pause, debug geometry, reset, camera selection, physics
  frequency, time scale, touch steering, and a return link back to `Field 02`.
- The current runtime state also shows `Physics laboratory could not start.
  Return to Field 02`, which reads like a built-in fallback rather than a
  silent crash.

## 2026-07-28 - Box3D Probe 01 is a parallel physics route with the same fallback pattern and different solver vocabulary

- A browser-daemon probe of `/box3d-lab` confirmed a second dedicated route
  titled `Rigs Unbound — Box3D Probe 01`.
- The canvas is named `Playable Box3D physical-wheel vehicle probe`, and the
  header frames the page as a `BOUNDED SOLVER EXPERIMENT / EVIDENCE FIXTURE`.
- The telemetry swaps in `BOX3D 0.1.0 / BOX3D-WASM 0.2.0` and reports bodies /
  shapes, slip estimate, wheel proximity, physics, frame, view, solver, and
  time.
- The route uses the same general control layout as the Rapier lab but renames
  the debug action to `Debug contract` and links back to `Rapier lab`.
- The current runtime state also shows `Box3D probe could not start. Return to
  Rapier Physics Lab 01`, so this route is also failing fast instead of
  silently hiding startup problems.

## 2026-07-28 - the accessibility statement is now a browser-facing public promise surface

- The shell’s `Accessibility` link opens a real statement page at
  `/accessibility`.
- The page names the current posture, the still-improving items, the known
  gaps, and a feedback path in plain browser-facing language.
- The durable markdown copy at `docs/ACCESSIBILITY_STATEMENT.md` mirrors the
  same promise, so the browser pointer and repo record stay aligned.
- The public statement is honest about what remains unproven, especially
  manual assistive-technology testing and the loading-progress story.

## 2026-07-28 - the loading/progress review remains open, and the statement wording now matches that more carefully

- The loading issue review still describes startup progress as a P2 clarity
  gap rather than a solved affordance.
- Its root-cause note points to a binary measuring/ready state model, with no
  staged warmup/progress phase exposed to the player.
- The accessibility statement now avoids overclaiming reduced-motion support;
  fallback-aware browser behavior is part of the live runtime posture, while
  reduced-motion handling still needs manual validation.

## 2026-07-28 - the browser-facing accessibility statement now matches the revised wording after a fresh load

- After updating `accessibility.html`, a refreshed browser navigation to
  `/accessibility?refresh=1` showed the new text live.
- The page now says `The live runtime includes fallback-aware browser
  behavior.` and `Reduced-motion handling still needs direct manual
  validation.`
- That closes the stale-wording drift between the public pointer and the repo
  statement while keeping the loading story explicitly open.

## 2026-07-28 - the root shell is browser-native but still not surfaced as an installable PWA

- A live probe of the canonical root shell found only a favicon and `theme-
  color` meta tag in the head.
- No manifest link is present, and there is no active service-worker
  controller on the inspected page.
- `display-mode: standalone` is false, so the app is still a browser-native
  shell rather than a surfaced install/offline contract.
- That keeps installability in the implementation boundary, not the player-
  facing promise surface.

## 2026-07-28 - the developer/public asset bridge split is real in the live browser

- The `?surface=developer` branch sets `body.dataset.surface=developer` and
  loads both runtime GLBs from `assets/runtime/`.
- The normal player surface sets `body.dataset.surface=player` and loads no
  `.glb` runtime assets in the inspected navigation.
- That confirms the asset-promotion docs are describing a real runtime fence:
  developer bridge proof is live, public asset approval is still separate.

## 2026-07-28 - the mission board is a live stateful dialog, not just a paper contract

- Opening `Contracts` in the live shell moved focus to `#mission-board-close`.
- The board reported `role="dialog"` and `aria-modal="true"`.
- The first proposition row was marked selected with `aria-pressed="true"`.
- `Accept contract` became enabled once a row was selected.
- The board stayed as a distinct overlay surface instead of turning the whole
  shell into a different page.

## 2026-07-28 - the map overlay now closes the old focus gap and behaves like a real dialog

- Opening the live map overlay now presents `#map-overlay` as a true modal
  dialog surface with `role="dialog"` and `aria-modal="true"`.
- The close control receives focus on open, which is the expected keyboard
  landing point.
- Closing the overlay restores focus to `#game-canvas` instead of leaving the
  browser on `BODY`.
- That closes the earlier accessibility issue review for the map overlay in the
  live browser.

## 2026-07-28 - pause focus recovery is fixed, but the announcement contract is still only textual

- Triggering pause through the live `KeyP` path opens the pause dialog with
  `role="dialog"` and `aria-modal="true"`.
- Focus now lands on `#pause-resume` when the overlay opens.
- Closing pause returns focus to `#game-canvas`.
- The visible pause cue is still just `Paused.` in `#current-prompt`, and that
  prompt does not have its own live-region announcement contract yet.
- So the earlier keyboard/focus gap is closed, but the explicit non-visual
  announcement path for pause remains open.
## 2026-07-28 - the workshop panel remains hidden on the current player surface

- A live probe found `#workshop-panel` in the DOM, but it was still `hidden:
  true` on the player surface.
- Focus stayed on `#game-canvas`, and the visible player controls did not
  expose a dedicated workshop trigger.
- That keeps the workshop as a real progression surface in the source trail,
  but not yet a discoverable dialog on this current player surface.

## Mobile radial focus proof tightened

I re-checked the radial quick-action wheel in the browser using a mobile-sized
viewport.

- `#welcome-panel` is an intentional modal gate with `Enter the field` as the
  visible dismiss path.
- After dismissal, `#touch-radial-action` opens the radial wheel and the live
  mobile item set is four actions: Air down, Air up, Differential open, and
  Winch.
- The wheel remains mounted, but focus stays on `#touch-radial-action` after
  open instead of moving to `#radial-menu-close`.
- Pressing `Tab` escapes to `#control-lesson-dismiss` (`Got it`), so the wheel
  still needs a stronger mobile focus-trap story.
- I recorded the updated evidence in
  `docs/research/RADIAL_QUICK_ACTION_WHEEL_CONTRACT_2026-07-28.md`,
  `docs/reviews/TOUCH_RADIAL_ACTION_BOOT_BLOCKER_ISSUE_REVIEW_2026-07-28.md`,
  and `docs/plans/MASTER_EXECUTION_TRACKER.md`.

## Mobile radial issue refined to visibility plus focus

A later browser probe sharpened the radial mobile finding.

- `#radial-overlay` is mounted and populated in the DOM.
- The computed `visibility` is still `hidden` on the mobile probe.
- `#radial-menu-close` exists and is focusable in markup, but focus remains on
  `#touch-radial-action`.
- I updated the analysis note, the radial contract note, the boot-blocker
  review, and the execution tracker to reflect the visibility-first diagnosis.

## Pause now proves focus recovery, but not a live announcement surface

I re-checked the pause path in the canonical shell.

- `KeyP` opens a real modal dialog and focus lands on `#pause-resume`.
- Clicking Resume closes the dialog and returns focus to `#game-canvas`.
- The visible pause cue is still only `Paused.` in `#current-prompt`.
- `#current-prompt` does not yet have its own `role` or `aria-live` contract.
- I recorded the updated state in the pause review, the 3D analysis note, and
  the execution tracker.

## Bootstrap status is narrated, not a progress meter

I checked the pre-entry shell on a mobile-sized viewport before entering the
world.

- `#welcome-panel` is a real modal gate.
- `#bootstrap-status` is a polite status region with the text `Measuring device
  performance… Choose Enter the field to begin.`
- there is no `progress` element or `role="progressbar"` in the live shell.
- `aria-busy` is not set on the bootstrap status region.
- I recorded the result in the 3D analysis note, the shell-accessibility next
  seam note, and the execution tracker.

## Contract board is desktop-first on the compact shell

I checked the mobile-sized shell and found that `#mission-board-button` is still
in the DOM, but `.masthead__buttons` is hidden by the responsive rules.

- The control exists.
- It has no rendered box on the compact shell.
- That makes the contract board a desktop-first overlay in the current runtime,
  not a touch-first surface.
- I recorded the distinction in the analysis note, the shell accessibility next
  seam note, and the execution tracker.

## Touch Radar now only toggles the navigator

I found and corrected a coupling bug in the shell runtime: the touch `Radar`
button was being picked up by the generic tap fallback and could also open the
pause overlay. The click binding now skips `button[data-tap-action="navigator"]`
in the generic tap loop, so `Radar` only toggles the navigator panel.

- This keeps the visible label honest.
- It prevents a single touch tap from cross-wiring a HUD toggle and pause.
- The fix lives in `src/main.ts`; the next pass should do a fresh browser
  confirmation of the touch path.

## Touch Radar fix confirmed live

I re-checked the mobile shell after skipping the generic tap fallback for the
navigator touch button.

- Tapping `Radar` now opens the navigator panel.
- The pause overlay stays closed.
- The prompt stays on the current world state.
- The active element stays on the `Radar` button.
- I recorded the live confirmation in the analysis note, the shell accessibility
  seam note, and the execution tracker.

## Mobile map focus recovery is now confirmed live

I re-checked the compact shell after hardening the map open path.

- Tapping `Map` opens the overlay as a real dialog.
- The delayed focus assertion now lands on `#map-close`.
- The close control stays focused on later checks.
- I recorded the confirmation in the analysis note, the shell accessibility
  seam note, the map issue review, and the execution tracker.

## Mobile radial wheel now stays open and focuses its close control

I re-checked the compact shell after suppressing the control lesson while the
radial wheel is open and adding a delayed focus assertion.

- Tapping `Quick` now opens the wheel and keeps it open.
- The four-item wheel stays visible.
- `#radial-menu-close` becomes the active element after the delayed focus
  assertion and stays there.
- I recorded the confirmation in the analysis note, the shell accessibility
  seam note, the radial review, and the execution tracker.

## Main prompt line is now a live status region

I updated `#current-prompt` so the shell’s headline state has an explicit
announcement contract.

- `role="status"`
- `aria-live="polite"`
- `aria-atomic="true"`

A browser probe confirmed the attributes are present before entering the world
and while pause is open. That closes the old “text only” pause-announcement gap.

## Contract board now stays open and focuses its close control

I re-checked the desktop shell after suppressing the control lesson while the
contract board is open.

- `Contracts` now opens the board and leaves it open.
- Focus lands on `#mission-board-close` and stays there.
- Selecting a row enables `Accept contract`.
- The board still closes cleanly.
- I recorded the live confirmation in the shell accessibility note, the 3D
  analysis note, the overlay review, and the execution tracker.

## Bootstrap loading now exposes determinate progress in source

I widened the bootstrap seam from a binary loading label to a determinate
progress contract in source:

- while the shell is still warming up with a dedicated bootstrap counter, `#bootstrap-status`
  behaves as a `progressbar`;
- `aria-busy` now follows the warmup window instead of staying pinned false;
- once the bootstrap target is met, the same surface returns to a normal status
  line.

That is the next browser-delivery step the repo needed. Browser verification is
now complete, so I’m treating this as a closed evidence claim.


## Profile line now speaks clearly in warmup and ready states

I tightened the public profile line so the shell explains its quality state in
plain language across the whole startup flow:

- warmup: `Quality: measuring. Still measuring frame performance.`
- after entry: `Quality: standard. Full scenery detail is active.`

The profile indicator stays separate from the bootstrap progress surface and
from the hidden operator diagnostics lane. I confirmed the result in the live
browser, so this is a real shell-accessibility improvement rather than just a
copy tweak.

## Operator diagnostics now name the fallback policy too

I also tightened the hidden developer diagnostics lane so it reports the
runtime profile policy in terse operator language. The live browser probe
confirms the warmup and steady forms, and the fallback form is covered by the
policy helper test:

- warmup: `Renderer visibility warmup: standard (insufficient-frame-samples)`
- steady: `Renderer visibility steady: standard`
- fallback: `Renderer visibility fallback: mobile-safe (...)`

That keeps the public HUD player-friendly while making the fallback envelope
easier to inspect when the developer surface is enabled.

## Addendum (2026-07-28) - acceptance-only visibility preview now has live browser proof

I closed the runtime preview seam that the 3D-game analysis and browser probe
had been circling:

- `window.__forceProfile("mobile-safe")` is now available on the developer
  surface;
- the renderer accepts the preview profile and the visibility metrics update;
- the public HUD remains `Quality: standard. Full scenery detail is active.`;
- the operator lane now reads
  `Renderer visibility fallback: mobile-safe (acceptance preview)`.

Validation:

- `npm run typecheck`
- `npx vitest run`
- live browser probe on `http://127.0.0.1:4173/?surface=developer`

That turns the acceptance-preview work from a design note into a verified shell
behavior.

## Addendum (2026-07-28) - renderer policy fallback is also verified live

I followed the 3D-web-experience seam one step further and confirmed the app
already has a live renderer policy gate:

- `?rendererPolicy=off` keeps the runtime on `webgl`;
- the snapshot reports `rendererBackendFallback: true`;
- the backend reason is explicit: `rendererPolicy=off blocked auto webgpu`;
- the developer diagnostics line mirrors the fallback state.

A comparison probe with `?rendererPolicy=stable` stays on the direct path:

- `rendererBackendFallback: false`;
- `rendererBackendReason: renderer=auto retained webgl for composer compatibility (stable)`;
- the diagnostics line shows `backend:webgl/auto (direct)`.

That gives the repo a more honest browser-3D story: the experience is already
policy-aware, but it still needs a broader degraded-experience contract for the
day the renderer itself cannot carry the scene.

## Addendum (2026-07-28) - context-loss recovery is wired, but the browser proof was synthetic

I pushed one step deeper into the 3D outage question and checked the live
recovery state machine:

- the shell listens for `webglcontextlost` and `webglcontextrestored` on
  `#game-canvas`;
- dispatching those events directly produced the expected user-facing status
  messages;
- the diagnostics lane stayed coherent through the transition;
- the browser run did not expose the `WEBGL_lose_context` extension, so this is
  a synthetic recovery proof, not a real GPU-loss test.

That means the app already knows how to narrate renderer loss and recovery. The
no-render fallback surface is now live as a separate degraded-mode path.

## Addendum (2026-07-28) - the remaining no-render gap was tracked as a review before implementation

I turned the unresolved browser-3D outage seam into a dedicated issue review:

- `docs/reviews/rigs_unbound_issue_review_2026-07-28.md`

The review now records the historical split clearly and notes that the no-render
fallback surface has since been implemented.

## Addendum (2026-07-28) - the no-render fallback surface is now implemented and live-verified

I closed the browser-3D outage seam by promoting the boot error panel into a
real degraded-mode surface:

- `#error-panel` is now the canonical no-render fallback surface;
- it is labeled as an `alertdialog` with a title and description;
- `window.__showNoRenderFallback(...)` can surface it on developer/acceptance
  runs for verification;
- the live browser proof shows the panel visible, the canvas hidden, the shell
  marked as fallback, focus on the retry button, and the fallback dialog
  trapping Escape/Tab while scroll is locked.

That gives the repo a true visible fallback for the case where the 3D scene
cannot be carried at all.

## Addendum (2026-07-28) - the no-render fallback is now keyboard-operable too

I re-checked the live browser surface after the accessibility pass:

- focus lands on `Try again`;
- `Tab` and `Shift+Tab` stay pinned to the retry button;
- `Escape` routes to the retry action;
- page scroll stays locked while the fallback is visible.

So the degraded-mode surface is now not just visible, but actually modal in the
keyboard sense as well.

## Addendum (2026-07-28) - the no-render fallback is exposed in the accessibility tree too

A Chrome accessibility-tree probe confirmed the live fallback dialog is named
and exposed to assistive tech:

- `alertdialog` name: `The 3D scene is unavailable.`
- retry button name: `Try again`

So the surface is now visible, modal, keyboard-operable, and readable by the AX
tree instead of just being a painted fallback panel.

## Addendum (2026-07-28) - the fresh-load shell still lacks a dedicated loading affordance

A fresh developer-surface load confirmed the ready shell is already readable,
but the browser-delivery contract still has one visible gap:

- `#bootstrap-status` reads as a ready-state message
  (`Field systems ready. Restored session controls are active.`), not a loading
  progress indicator;
- `#map-progress` is world-survey progress (`0% surveyed`), not an asset or
  scene-ingestion bar;
- `#error-panel` remains hidden on the ready shell, which is correct, but it
  leaves no dedicated loading/retry affordance for the asset bootstrap path.

So the next browser-delivery seam is now explicit: keep the no-render fallback
contract intact, and add a truthful loading/retry surface for asset or scene
ingestion instead of overloading the ready-state text.

The fresh browser probe also confirmed the distinction more sharply:

- `#map-progress` is present in the DOM but `visibility: hidden`, so it is not a
  visible loading affordance;
- there is still no visible `role="progressbar"` or equivalent bootstrap UI on
  the ready shell.

The accessibility probe sharpened it further:

- the shell has multiple `aria-live="polite"` / `role="status"` regions, but
  they are gameplay/session state, not bootstrap progress;
- the live shell still exposes no loading-specific accessible name or progress
  announcement for asset or scene ingestion.

One more source-side nuance matters: `src/main.ts` already contains a
measuring-phase `role="progressbar"` branch for bootstrap, so the gap is not
the absence of a warmup contract in code. The fresh browser probe simply lands
on the ready phase too quickly for the loading affordance to remain visible as
the user-facing first impression.

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
