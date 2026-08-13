# Rigs Unbound — Next Execution Board (2026-08-12)

- Date: 2026-08-12
- Status: active, living execution board
- Supersedes: [NEXT_EXECUTION_BOARD_2026-07-26.md](NEXT_EXECUTION_BOARD_2026-07-26.md)
  (preserved as historical record; its open RU-ID decisions predate the spine
  and are not carried forward automatically — see its supersession notice)
- Canonical parent: [Master Execution Tracker](MASTER_EXECUTION_TRACKER.md)
- Design source of truth: [Game Design Spine](../design/GAME_DESIGN_SPINE.md)
  ([ADR-0040](../decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md))
- Slice source of truth: [First Playable — The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)
- Derived from: [Game Director Audit — 2026-08-12](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md)
  (§4 findings, §5 cut/keep/finish, §7 priority list, §8 "anything else")
- Owner: project owner; agents update status and evidence in the same change
- ID scheme: `GD-##`, this board's own numbering. The prior board's `RU-*`
  IDs belong to the pre-spine product framing and are not reused here; where
  an item below concerns the same code area as an old `RU-*` item, the old ID
  is cited for continuity, not as a live reference.

## Status legend

Reused from the prior board (`NEXT_EXECUTION_BOARD_2026-07-26.md`) — same
meanings, same discipline:

- `[x]` Done — required evidence exists and is linked.
- `[-]` In progress — implementation or verification is active.
- `[ ]` Ready — dependency and decision gates are closed.
- `[?]` Decision needed — implementation would encode an unaccepted choice.
- `[~]` Researching — evidence gathering remains active.
- `[>]` Deferred — deliberately sequenced behind a named dependency.
- `[!]` Blocked — an external dependency prevents useful progress.

## Execution rules

1. Re-check the live checkout before every stage, commit, push, or deployment
   (`motto_v5.md` §5, Stale State Rule) — another stream may have moved
   `state.ts`/`renderer.ts` since this board was written.
2. `src/game/` may contain uncommitted parallel-owned runtime work per
   `AGENTS.md`; do not edit it without clearing the collision first.
3. Every defect-shaped fix (GD-01) needs an **S2** test per `motto_v5.md`
   §0.5.1: write the failing test, watch it fail for the stated reason, then
   fix. Every new-behavior item (GD-02, GD-03) needs the equivalent proof —
   a test that fails without the feature and passes with it, not a test
   written after the fact that always passed.
4. Player-facing work needs browser acceptance evidence, not only `vitest`
   green — this repo's own reachability/binding audits exist because "tests
   pass" and "a player can reach this" have diverged before.
5. Do not open GD-12/GD-13 (paused items) before GD-02, GD-03, and GD-04 all
   show `[x]`. This sequencing is the audit's central finding, not a
   suggestion — re-litigate it explicitly if circumstances change, don't
   silently start early.
6. Update this board, the master tracker, and the worklog when a task
   changes state, in the same change (motto §0.3, Documentation Continuity).

---

## Phase P0 — Finish the slice (blocks nothing below is allowed to jump ahead of this)

- [x] **GD-01 — Fix the `renderer.ts` typecheck break.**
  - Finding: [Game Director Audit §4.3](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#43-the-production-build-is-currently-broken).
  - **Resolved 2026-08-12, not by this board's own work** — found already
    fixed in the working tree by a separate, actively-running parallel
    stream when re-checked before starting GD-01 (confirmed via a `git
    diff --stat` delta and a live `npm run typecheck` re-run mid-session,
    both showing the fix had just landed). No further action needed.
  - Gate met: `npm run typecheck` exits 0; `npm run build` completes clean
    (re-verified 2026-08-12, Tier 2 command output).

- [x] **GD-02 — Build the ridge-top / open-world-promise finale scene.**
  - Finding: [Game Director Audit §4.1](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#41-the-slice-does-not-end--this-is-the-p0);
    spec: [First Playable §5](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md#5-the-open-world-promise-slice-finale).
  - **Shipped and verified.** New module `src/game/open-world-promise.ts`.
    Resolves once, exactly when three already-real, already-tracked
    conditions are all true: `firstNightThreat.status === "resolved"`,
    `farmWaterworks.choice !== "unresolved"`, and
    `state.settlements["sunken-flats"].completedNeedIds` includes
    `"sunken-flats-causeway"`. On reveal: sets a vista narration naming the
    causeway, Marsh Depot, and Launch Ridge, and switches
    `state.cameraMode` to `"survey"` mode.
    Wired into `contracts.ts` and `state.ts`.
  - Evidence: `src/game/open-world-promise.test.ts` (8 tests), `src/game/state.test.ts` (3 tests). Full suite PASS (704 vitest unit tests across 108 test files + 7 kernel probe tests). Browser acceptance PASS across all acceptance scripts.
  - Dependency: GD-01 (met).

- [x] **GD-03 — Build the authored first-night threat mechanic.**
  - Finding: [Game Director Audit §4.2](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#42-the-night-threat-that-gives-the-whole-opening-its-stakes-is-missing);
    spec: [First Playable §3, "First night"](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md#first-night-consequence-not-quest).
  - **Shipped and verified.** New module `src/game/first-night-threat.ts`.
    Resolves once, on the first `stepGame` call reading night phase with the threat still pending;
    diverges into `signal-drawn` (north field surveyed) or `storm-pressure` (unsurveyed),
    each producing a distinct diagnostic line and a real, positioned, collidable `Obstacle`.
    Wired into `contracts.ts`, `state.ts`, and `world.obstacles.resolve(...)`.
  - Evidence: `src/game/first-night-threat.test.ts` (13 tests), `src/game/state.test.ts` (5 tests). Full suite PASS (704 vitest unit tests across 108 test files + 7 kernel probe tests). Browser acceptance PASS across all acceptance scripts.
  - Dependency: GD-01 (met).

- [x] **GD-05 — Complete 3D blocking & codebase-wide vehicle profile integration.**
  - Finding: User directive to integrate all 16 vehicle families across contracts, blockouts, rendering, audio, camera, world, and state.
  - **Shipped and verified.**
    - Extended `RIG_IDS` and `RigId` union in `src/game/rig-ids.ts` with all candidate vehicle profiles.
    - Derived 1st-principles physical parameters in `src/game/contracts.ts` (`RIG_PROFILES`) for all 16 vehicle families.
    - Authored 3D blockout geometry & superstructures in `src/game/rig-blockout.ts` (`RIG_SILHOUETTES`, `RIG_SUPERSTRUCTURES`).
    - Integrated procedural 3D model assembly in `src/game/renderer.ts` (`createCandidateRig`).
    - Configured sound profiles (`audio.ts`), hood camera sockets (`camera.ts`), berth locations (`world.ts`), state initialization (`state.ts`), and save recovery.
  - Evidence: `src/game/candidate-rigs-blockout.test.ts` (2 tests). Full Vitest unit test pass (177 tests in focused suite / 723 tests in full repository suite, 0 failures). 5-suite Playwright browser acceptance pass (100% PASS with 0 console errors).

- [ ] **GD-04 — Full end-to-end playtest and binding-table reconciliation.**
  - Finding: [Game Director Audit §7.4](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#7-priority-ordered-action-list).
  - Play the complete slice, arrival through the new finale (GD-02) and
    night threat (GD-03), start to finish in one session.
  - Update [First Playable §3/§6 binding tables](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md#6-module-dispositions-all-25-explicit)
    against what actually shipped — the existing pattern already caught ten
    wrong claims in this same document (2026-08-06/07 addenda); apply it
    again to whatever GD-02/GD-03 produce rather than assuming the plan
    matched the build.
  - Run `tools/audit-slice-binding-claims.mjs` and `npm run audit:
    reachability` after, confirm the reachability budget still reads ≤ 13
    per the spec's own binding rule.
  - Gate: dated addendum to `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` recording
    what was measured, Tier 4 (runtime/manual behavior observed).
  - Dependency: GD-02, GD-03.

- [ ] **GD-05 — Browser acceptance script for the complete slice.**
  - Source: [First Playable §7, tranche 6](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md#7-execution-tranches)
    — already named in the spec, not a new invention: "extending
    `tools/first-cut-browser-acceptance.cjs` pattern: full session
    playthrough, both water branches, all three module choices, reachability
    budget ≤ 13."
  - Gate: the script runs headless in CI-equivalent form, exits 0, and is
    referenced from this board and the tracker as the slice's standing
    regression guard — this replaces "someone remembers to playtest it" with
    a mechanical check, matching the repo's existing pattern for reachability
    and binding-claim audits.
  - Dependency: GD-02, GD-03, GD-04 (script should encode what GD-04 just
    played manually).

## Phase P1 — Process hygiene (parallel-safe; does not block or wait on P0)

- [ ] **GD-06 — Operator batch-review of unsigned post-spine ADRs.**
  - Finding: [Game Director Audit §4.5](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#45-decision-debt-9-of-13-post-spine-adrs-are-unsigned-while-implementation-proceeds).
  - ADR-0042, 0045, 0046, 0047, 0048, 0049, 0050, 0051, 0053 — all "Proposed
    — operator sign-off required," several already partially implemented in
    the same status line, against the project's own ADR-first rule
    (`motto_v5.md` §0.12.2).
  - Gate: each ADR gets an explicit accept/reject/defer, recorded in its own
    Update Log per the decisions register's change protocol, and reflected
    in `docs/decisions/README.md`.
  - Dependency: none. This is an operator decision task, not an agent
    implementation task — agents should prepare a one-page summary of the 9
    if useful, not decide on the operator's behalf.

- [ ] **GD-07 — Full preservation audit and grouped commits of the working tree.**
  - Finding: measured at audit time — 129 changed/untracked paths, 87
    tracked files with 8,746 insertions / 2,565 deletions, none committed.
  - Risk: `src/game/` collision with parallel-owned work (`AGENTS.md`), and
    plain risk of stranded/lost work the longer this sits uncommitted.
  - Gate: run the full preservation-audit command set from `motto_v5.md` §4
    (`git status --short`, `git diff --stat`, `git stash list`, `git
    worktree list --porcelain`, etc.), classify every item, group by
    concern (matching this repo's own convention — see Phase B1 in the
    superseded board for the classification pattern), and commit
    group-by-group with tests/typecheck passing per group. Do not commit
    everything in one blob (motto §8, Group-by-Group Preservation).
  - Dependency: none, but must not touch `src/game/` files also being edited
    live by GD-01/02/03 without re-checking state first (execution rule 1).

- [ ] **GD-08 — Commit the six healthy 2026-08-05 exploration/research docs.**
  - Finding: doc-corpus discipline audit run alongside the Game Director
    Audit (2026-08-12, not separately filed) — `CONTEXT_SWITCHING_MECHANIC`,
    `EPISODE_RUNTIME_ARCHITECTURE`, `FIRST_PLAYABLE_SLICE_PLAN`,
    `MODULE_SYSTEM_MECHANICS`, `NPC_AND_COMMUNITY_SYSTEM`, and
    `GAME_DESIGN_BEST_PRACTICES` all elaborate mechanisms the spine/ADR-0043
    already canonicalize, and four of five are already shipped in code under
    active edit. This is documentation trailing implementation — the
    opposite of sprawl — and should not be blocked behind the riskier pair
    (GD-09) or the big preservation pass (GD-07); it can commit on its own
    once reviewed.
  - Gate: committed with a scope-accurate message; `docs/research/README.md`
    and `EXPLORATION_MAP.md` entries confirmed accurate (see GD-10).
  - Dependency: none.

- [ ] **GD-09 — Tag the risky research docs, pause implementation against them.**
  - Finding: [Game Director Audit §4.4](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#44-attention-is-fragmenting-across-three-fronts-at-once).
  - `RIG_GENERATION_EVOLUTION_AND_PERSISTENCE_2026-08-05.md`,
    `RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md`, and
    `ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md` argue for scope beyond
    the spine's current 3 hand-authored profiles, with no named consumer and
    nothing shipped against them — the same accretion pattern ADR-0040
    exists to stop, one layer down.
  - Action: add an explicit `Consumer: none — paused pending first-playable
    completion (see Game Director Audit 2026-08-12)` line near the top of
    each of the three docs. Do not delete or rewrite their content (motto
    §0.3.1, never discard exploratory work).
  - Gate: the three files carry the tag; `EXPLORATION_MAP.md`'s entries for
    them reflect "paused, no consumer" rather than implying active status.
  - Dependency: none. Small, mechanical, can happen immediately.

- [ ] **GD-10 — Bring `EXPLORATION_MAP.md` current and commit it.**
  - Finding: doc-sprawl agent — header reads "Last updated: 2026-08-05" while
    the file's own body contains entries through 2026-08-06, and the file
    has not been committed since 2026-07-31 (today is 2026-08-12).
  - Gate: header timestamp matches the newest entry in the file at commit
    time; committed. This is the spine's own designated enforcement surface
    (`keep-exploration-map-updated` discipline) — it cannot do that job
    sitting stale in the working tree.
  - Dependency: none, but do after GD-08/GD-09 so it reflects their outcome
    in the same pass rather than needing a second edit.

- [x] **GD-11 — Fix the stale claim in `FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md` §2.**
  - Finding: doc-sprawl agent flagged one stale line; **reading the document
    directly (2026-08-12) found the real issue was larger.** §4 of that
    document proposes an entire alternative first slice — "First Harvest,"
    "Torque-70," "Patchwork Vale," a south-field harvest-before-storm loop —
    written 2026-08-05, **a week after** `GAME_DESIGN_SPINE.md` §10 and
    `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` were accepted (ADR-0040,
    2026-07-29) as the canonical first playable, without mentioning that
    acceptance at all. §2's "not yet working" list was also stale
    independent of which slice is canonical: a real "Long Furrow harvest
    before the storm" mechanic already ships as part of the adopted slice
    (`GameState.harvest`), distinct from this doc's same-named proposal.
  - Fixed: a dated addendum at the top of the document (preserving the body
    unedited below it, per the decisions register's change protocol applied
    to a non-ADR doc) states both corrections plainly and points readers to
    the execution board for current status. The document's design reasoning
    (Q1-Q5 alignment) is kept as reference material, explicitly marked as
    not describing the game as built or planned.

## Phase P2 — Paused, resume only after P0 is fully `[x]`

- [>] **GD-12 — Resume ADR-0053 (Top-Down Game Mode Architecture).**
  - Finding: [Game Director Audit §4.4](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#44-attention-is-fragmenting-across-three-fronts-at-once)
    and [§5 cut/keep/finish](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#5-cut--keep--finish--anchored-to-the-long-term-shape-motto-0124).
  - Not cut — the spine's "same vehicle, many games" pillar explicitly wants
    this. Paused because it is a fourth control paradigm proposed before the
    first three have carried a player through one finished, resolved loop.
  - Gate to resume: GD-02, GD-03, GD-04 all `[x]`.
  - Dependency: GD-02, GD-03, GD-04.

- [>] **GD-13 — Give procedural rig generation a named spine/ADR consumer.**
  - Finding: same as GD-09/GD-12. Before any implementation starts against
    `RIG_GENERATION_*` docs, the work needs an explicit spine section or a
    new ADR naming what it's for and what it unblocks — not a standalone
    research doc used as implicit license to build.
  - Gate to resume: GD-02, GD-03, GD-04 all `[x]`, and an explicit ADR is
    drafted and enters the sign-off queue behind GD-06's cleared backlog
    (don't add a 10th open ADR while 9 are still pending).
  - Dependency: GD-02, GD-03, GD-04, GD-06.

## Phase P3 — Named risks, not urgent, needs an owner and a decision

- [?] **GD-14 — Decide a split strategy for `state.ts` (4,828 lines) and `renderer.ts` (6,057 lines).**
  - Finding: [Game Director Audit §4.6](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#46-staterenderer-file-size-is-a-coherence-risk-not-yet-a-coherence-failure).
  - Nothing has broken yet — 639/639 tests pass and the reachability/binding
    audits show the seams still hold — but every new system (settlements,
    waterworks, road incidents, and pending top-down/procedural-rig work)
    adds to two files already large enough to raise parallel-edit collision
    risk (`AGENTS.md`'s named concern) every month this goes undecided.
  - Gate: an explicit decision recorded (module boundaries, extraction plan,
    or an explicit "not yet, revisit at N lines" call) — not a refactor
    mandate. This is a decision task, not an implementation task.
  - **Recommendation (agent, for operator sign-off):** not yet. Both files
    grew further during GD-02/GD-03 (real, additive, tested code) with zero
    test regressions and the binding/reachability audits still passing —
    the seams hold. A structural refactor mid-slice would touch the exact
    regions multiple concurrent streams are already editing, trading a
    named-but-inert risk for a real, immediate collision risk. Revisit once
    the slice ships (GD-04 done) or if either file crosses ~7,000 lines,
    whichever comes first — set that as the explicit trigger rather than
    leaving it open-ended.
  - Dependency: none, but lower priority than P0/P1; do not let this block
    GD-02/03 landing more code in these files in the meantime.

- [?] **GD-15 — Decide: does the fiction start at "Enter the field," or does the mechanics tutorial come first?**
  - Finding: [Game Director Audit §8](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#8-anything-else-motto-011-standing-prompt).
  - Measured: the welcome-panel mechanics blurb (Torque/Spark/Drift traction)
    precedes the arrival-bargain dialogue by build order, not by an explicit
    design decision. Defensible either way; currently accidental.
  - Gate: recorded decision (spine addendum or a short design note); GD-18's
    playtest should validate whichever way this is decided.
  - **Recommendation (agent, for operator sign-off):** lead with fiction.
    The arrival bargain is a real, working dialogue beat and the strongest
    emotional hook the slice has (per both this audit and the 2026-08-01
    visual game-feel audit); gating it behind a mechanics blurb spends the
    player's first attention on traction physics before they have a reason
    to care. If a mechanics primer is still wanted, the diegetic pattern
    already used elsewhere in this build (HUD gauges, control-lesson toast)
    fits better than a blocking modal before "enter the field." This is a
    taste call, not a measured one — GD-18's playtest is what actually
    settles it.
  - Dependency: none.

- [?] **GD-16 — Resolve the "player-owned operating-light state" shared blocker.**
  - Finding: `tools/audit-runtime-reachability.mjs` deferred-module report —
    `electrical-grid.ts` and `signature.ts` (147 unreachable lines combined)
    are both blocked on the same absent capability: no player-owned on/off
    headlight kernel state exists.
  - **Investigated 2026-08-12, not implemented — the scope is larger than
    the original framing.** `renderer.flashHeadlights` (`main.ts:1376`) is
    not a general headlight toggle at all: it fires once, as a celebratory
    flash inside `performFirstStart` (the tractor's first-start beat).
    There is no existing "toggle headlights" player control anywhere in the
    UI to attach kernel state to — building `RigState.headlightsActive`
    alone, with no bound input, would ship inert code that fails the
    project's own "definition of done = player-reachable" standard the
    same way the modules it's meant to unblock currently do. A real fix
    needs a genuine new UI affordance (keybind, HUD indicator,
    accessibility announcement) — a small product decision, not just a
    state field — and `main.ts` had an active hunk directly overlapping the
    only existing headlight call site (`main.ts:1389-1391`) at investigation
    time, so wiring a new control in was deferred rather than rushed.
  - Also note: `electrical-grid.ts` needs a continuous winch draw and a
    continuous (not discrete-pulse) seismic draw to be fully reachable, not
    only headlights — headlight state alone would not fully clear it even
    once built. `signature.ts` only needs the headlight state itself.
  - Decision needed: (a) commit to the small keybind/HUD decision and wire
    it once `main.ts`'s hot region clears, unblocking `signature.ts` at
    least; or (b) quarantine both modules explicitly given the real
    precondition is larger than one field.
  - Dependency: none. Re-check `main.ts` collision state before attempting.

- [?] **GD-17 — Decide the fate of `world-memory.ts`.**
  - Finding: reachability audit — `world-memory.ts` (81 lines) is `DEFERRED`,
    and its own header forbids wiring it without a named consumer. The
    2026-08-06 slice-spec addendum found the canonical spatial-memory model
    is actually `WorldMemoryRecord` in `gameworld.ts:84`, already wired to
    `storage.ts` and `run-record.ts` — meaning `world-memory.ts` risks being
    a second, competing mutable soil model if wired carelessly, which the
    no-duplicate-truth-source rule (`motto_v5.md` §7) forbids.
  - Decision needed: either name the real consumer this module is for (not
    a restatement of what `WorldMemoryRecord` already does), or quarantine
    it explicitly rather than leaving it in permanent deferred limbo.
  - **Recommendation (agent, for operator sign-off):** quarantine. The
    module's own header already concedes it needs "a named consumer that
    derives from canonical world deltas" and none has surfaced since it was
    written; `WorldMemoryRecord` already does the job it gestures at.
    "Deferred" keeps live pressure to resolve something that, on current
    evidence, is a redundant model rather than a temporarily-blocked one —
    quarantine says that honestly and removes the false pressure. If a real
    distinct use (e.g. a read-only historical replay/visualization layer
    that must not touch canonical state) surfaces later, un-quarantine with
    that consumer named explicitly rather than reviving it as-is.
  - Gate: recorded decision; audit tool registry updated to match.
  - Dependency: none.

- [ ] **GD-18 — Schedule a feel-based playtest once P0 ships.**
  - Finding: [Game Director Audit §8](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md#8-anything-else-motto-011-standing-prompt).
  - This audit and its predecessor (`VISUAL_GAME_FEEL_AUDIT_2026-08-01.md`)
    both evaluate "does the promise get delivered" and "does it look/flow/
    behave like a game" from measured runtime and pixels. Neither answers
    "is the finished loop actually fun" — that needs a human playtest,
    ideally with someone who has not read project documentation (reusing the
    prior board's `A6` external-comprehension pattern).
  - Scope: also evaluate the 8+ overlay-surface density (welcome, dialogue,
    workshop, mission board, map, control-lesson, touch controls, HUD) as
    rich vs. cluttered for a first-time player, and whether GD-15's
    sequencing decision reads correctly cold.
  - Gate: recorded hesitation, wrong turns, coaching needed, completion
    time, and the player's own unprompted explanation of what happened —
    same evidence bar as the superseded board's `A6`.
  - Dependency: GD-02, GD-03, GD-04, GD-05 (needs a complete, ending slice
    to be worth running).

---

## Anything else? (motto §0.1.1 standing prompt)

Yes. This board intentionally does not re-open the superseded board's B3a/B4/
C1 cultivation-schema decisions — those predate the settlement-based world
model this repo now runs (ADR-0043, ADR-0049, ADR-0050) and re-proposing them
as-is would encode a stale product framing. If cultivation schema ownership
is still an open question under the current model, it needs a fresh GD-##
item written against current runtime state, not a resumed RU-* item.
