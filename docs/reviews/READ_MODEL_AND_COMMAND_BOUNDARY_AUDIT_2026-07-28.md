# Read-Model Purity & Command Boundary Audit

**Date:** 2026-07-28
**Repository:** pranaysuyash/rigs-unbound
**Head:** `ace3fde1d59ee98b54e47766e94f9aa68704d094` (`main`, 2026-07-28 21:54:49 +0530)
**Audit type:** Static source inspection — no runtime code was modified. No Git write commands were run (no stage/commit/reset/merge/rebase/clean).

---

## 0. Relationship to the prior audit at this same path

A file at this exact path already existed at HEAD, committed in `aad070f`. It
documents a **P0 finding that was real at the time it was written**:
`evaluateCorridorQuality()` in `src/game/first-rung.ts` used to mutate
`state.unboundPassage.status` / `state.unboundPassage.openedByRigId` directly,
reachable from `publicState()` and therefore from `render_game_to_text()`.

That defect **no longer exists in the current source** at the commit named
above. The mutation was removed and replaced with a documented split:
`evaluateCorridorQuality()` is now a pure probe, and a new function,
`syncUnboundPassageFromCorridor()`, performs the actual transition — through
`resolveUnboundPassageCommand()` — and is called only from `stepGame()`
(`src/game/state.ts:1353`), never from any read path. A dedicated regression
suite, `src/game/selector-purity.test.ts`, exists specifically to keep this
fixed. `docs/plans/MASTER_EXECUTION_TRACKER.md` (the "external-review
sequence executed" addendum) records this fix as closed, with the same
prove-it-both-ways methodology this audit independently re-verified below.

**This means the previous version of this report was stale relative to
current `main` and would have misled anyone reading it as ground truth.** It
described line numbers and a mutation site (`first-rung.ts:227–228`,
`state.unboundPassage.status = "open"`) that do not exist in the current
file. This document replaces it with the current, independently re-verified
picture, per the instruction to treat current source as authoritative over
docs when they conflict. The conflict itself is Finding #0 below.

---

## 1. Executive verdict

**No P0 read-side mutation exists in the current `main` head.** The
originally-suspected path —

```
render_game_to_text() → publicState() → resolveFirstRung() →
evaluateCorridorQuality() → mutation of state.unboundPassage
```

— was traced end to end and does **not** mutate state. `evaluateCorridorQuality()`
computes and returns a `CorridorQuality` value only; it never assigns to
`state.unboundPassage` or any other field of `state`. The only site that opens
the Unbound Passage from corridor clearance, `syncUnboundPassageFromCorridor()`,
is invoked exactly once, from inside `stepGame()`'s ploughing branch, and
always routes through `resolveUnboundPassageCommand()` — the same command
boundary every other passage transition uses.

I independently re-ran the specific verification the fix's own regression
suite performs (byte-identical `JSON.stringify(state)` before/after repeated
calls to `publicState`, `resolveFirstRung`, and `evaluateCorridorQuality`,
including after 240–600 simulated steps that create furrows and clear the
corridor) and confirm the claim: reading never changes `state`.

Beyond that specific path, I traced the broader read-model surface named in
the brief — `publicState`, `render_game_to_text` (`window.render_game_to_text`,
which wraps `publicState` + `resolveFirstRung`), mission propositions, HUD/
workshop/minimap/navigator/rumor-map/control-guidance projections, fleet-
recovery projection, save serialization/restore, and run-record/replay
snapshot generation — and found **one genuine but pre-existing and
already-fixed defect (now closed), zero new P0/P1 findings, and two P2/P3
process/documentation findings** (this stale-report issue, and one minor
drift risk in `radial-ui.ts`). Full detail in §5.

**Recommendation: tolerate as-is; no code change required for the boundary
itself.** The one action item is documentation hygiene: keep this file, and
any file at this path, synchronized with actual source state going forward,
since a stale audit claiming a live P0 is arguably worse than no audit — it
trains the reader to distrust the audit trail.

---

## 2. Scope and methodology

Read, in order, before analysis: `/Users/pranay/AGENTS.md`,
`/Users/pranay/Projects/AGENTS.md`, repo-local `AGENTS.md` (there is no
repo-local `CLAUDE.md`), `docs/decisions/README.md`,
`docs/plans/MASTER_EXECUTION_TRACKER.md` (tail), and the two most relevant
existing reviews (`READ_MODEL_AND_COMMAND_BOUNDARY_AUDIT_2026-07-28.md` itself,
and `CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md`). The
repo-local `AGENTS.md` states `src/game/` may contain uncommitted
parallel-owned runtime work and should not be edited without clearing the
collision — moot for this task since it is read-only by design.

Static inspection covered, in full:
- `src/game/first-rung.ts` (813 lines, full read)
- `src/game/state.ts` (2719 lines; `stepGame`, `advanceGame`, `publicState`,
  all command handlers, and all recovery/migration functions read in full or
  in targeted windows)
- `src/game/unbound-passage.ts` (382 lines, full read)
- `src/game/mission-propositions.ts` (370 lines, full read)
- `src/game/mission-resolver.ts` (180 lines, full read)
- `src/game/replay-validator.ts` (540 lines, full read)
- `src/game/storage.ts` (304 lines, full read)
- `src/game/fleet-recovery-assessment.ts`, `fleet-recovery-command.ts`
  (targeted read of the exported public surface)
- `src/game/exploration.ts`, `src/game/terrain.ts` (targeted: `nearestNode`,
  `deformationCount`, `surveyedFraction`, `sightlineClear`)
- `src/main.ts` (2649 lines; targeted grep + read of every `state.<field> =`
  assignment site, the `snapshot()`/`render_game_to_text` wiring, the mission
  board render path, and the fleet-recovery acceptance hook)
- Every other file in `src/game/*.ts` (`minimap.ts`, `navigator-ui.ts`,
  `rumor-map-ui.ts`, `hood-dashboard-ui.ts`, `control-guidance.ts`,
  `feedback.ts`, `xp-progression.ts`, `radial-ui.ts`, `animation.ts`, etc.):
  swept with `grep` for any `state.<field> =` / `.push(` / `.splice(`
  assignment pattern outside of `state.ts`'s own command handlers and
  `first-rung.ts`'s `syncUnboundPassageFromCorridor`, to catch mutation
  hiding in a file not on the named suspect list.

Call chains were traced from `window.render_game_to_text` (`src/main.ts:2140`)
down through `snapshot()` → `resolveFirstRung()` / `publicState()` →
`resolvePostFitRung()` → `isCorridorPassable()` → `evaluateCorridorQuality()`,
and separately from `stepGame()`'s ploughing branch down through
`syncUnboundPassageFromCorridor()` → `resolveUnboundPassageCommand()`.

Verification run against the current head:
- `npx tsc --noEmit` — **0 errors** (the prior report's claimed pre-existing
  `first-rung.ts:295` type error is also gone; see §12).
- `npx vitest run` — **69 test files passed, 410 tests passed, 0 failed.**

No implementation changes were made. No file under `src/` was edited.

---

## 3. Current mutation-authority map

### Valid kernel mutations (inside `stepGame`, `src/game/state.ts:1192`)
| Location | Object mutated | Classification |
|---|---|---|
| collision damage | `rig.condition` | Valid kernel mutation |
| drowning | `rig.condition` | Valid kernel mutation |
| landing damage | `rig.condition` | Valid kernel mutation |
| plough deform | `world.terrain`, `state.furrows`, `state.semanticEdits` | Valid kernel mutation |
| corridor-clear passage open | `state.unboundPassage` (via `syncUnboundPassageFromCorridor` → `resolveUnboundPassageCommand`) | Valid kernel mutation |
| fleet inheritance | `state.fleetInheritance` | Valid kernel mutation |
| discovery | `state.discoveries` | Valid kernel mutation |
| survey evaluation | `state.surveyRoute`, `state.salvage`, `state.progression` | Valid kernel mutation |
| cargo update | `state.cargoRelay.cargo` (via `updateCargo`) | Valid kernel mutation |
| idle strain recovery | `rig.strain` | Valid kernel mutation |
| time advance | `state.elapsedMs`, `state.worldTimeMinutes`, `state.phase` | Valid kernel mutation |

### Valid command handlers (`src/game/state.ts`)
| Location | Object mutated | Classification |
|---|---|---|
| `executePrimaryActionCommand` / `performPrimaryAction` | `cargo`, `plough.mode`, `state.salvage`, `state.surveyRoute`, `state.lastDiagnostic` | Valid command handler |
| `executeRigSelectionCommand` / `selectActiveRig` / `switchActiveRig` | `state.activeRigId`, rig speed/steering | Valid command handler |
| `installModule` | `rig.modules`, `state.salvage`, `state.lastDiagnostic` | Valid command handler |
| `winchRecover` | `rig.x/z/speed/condition/strain`, `state.recovery.*`, `cargo` | Valid command handler |
| `repairRig` | `rig.condition`, `rig.strain`, `state.salvage` | Valid command handler |
| `toggleBladeMode` | `plough.mode` | Valid command handler |
| `cyclePhase` | `state.worldTimeMinutes`, `state.phase` | Valid command handler |
| `cycleCamera` / `selectCamera` | `state.cameraMode` | Valid command handler |
| `togglePause` | `state.paused` | Valid command handler |
| `toggleMap` | `state.mapOpen` | Valid command handler |
| `performFleetRecovery` → `resolveFleetRecoveryCommand` / `applyFleetRecovery` | `rig.condition`, `rig.speed`, `state.lastDiagnostic` | Valid command handler (single mutating entry point, documented as such) |

### Valid initialization mutations
| Location | Object mutated | Classification |
|---|---|---|
| `settleWorld` | `rig.y/speed`, `cargo.y` | Valid initialization mutation |
| `storage.ts:loadState` → `settleWorld`, `world.restore`/`world.reset` | `world.*`, freshly-constructed `state` | Valid initialization mutation |
| `replay-validator.ts:sessionFromInitialContext` | freshly-constructed replay-local `state`/`world` | Valid initialization mutation (isolated session, not live state) |

### Invalid read-side mutations found in current source
**None.** The one historical instance (documented in §0) is confirmed absent.

### Questionable orchestration mutations
**None found.** `src/main.ts` contains exactly one direct `state.<field> =`
assignment outside a command dispatch: `state.lastDiagnostic = ...` inside
`persist()` on a save-write failure (`src/main.ts:2516`) — this is itself
inside a command-like action (the save attempt), sets only a diagnostic
string, and is not reachable from any read/observability path. All other
`main.ts` mutation is through calling into the `state.ts` command handlers
listed above. `src/game/animation.ts:344` assigns `state.ploughAngle`, but
that `state` parameter is `RigAnimationState`, a renderer-local presentation
object per ADR-0031/ADR-0034's simulation/presentation split — not
`GameState`. Confirmed out of scope for canonical-state purity, correctly so.

### Acceptance-only mutation
`window.recoverStrandedRig`, `window.fitModuleAcceptance`, etc. in
`src/main.ts` dispatch through the same command handlers as the live UI
(`performFleetRecovery`, `installModule`, ...) rather than a parallel path.
Classified as **valid command handler**, invoked from an acceptance-only
entry point — not a second authority.

### Dead or unreachable code
The player-facing **mission/contract board** described in
`CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md` is largely
spec-level: `deriveMissions()` (a pure read model) is wired into
`renderMissionBoard()` in `main.ts`, but that same review states no live,
focus-managed accept/dismiss overlay branch exists yet. This is relevant here
only in that it means the mission board **cannot currently violate the
command boundary at runtime**, because there is no runtime accept path to
audit — the risk is real but not yet reachable. Tracked as an open item, not
a finding against this audit's scope.

---

## 4. Read-model call graph

### The originally-suspected path (traced, confirmed non-mutating)

```
window.render_game_to_text                [main.ts:2140]
  → snapshot()                            [main.ts:2098]
    → resolveFirstRung(state, ...)        [main.ts:2099]  — pure
    → publicState(state, world)           [main.ts:2103 via spread]
      → resolveFirstRung(state, ...)      [state.ts:1623]  — pure
        → resolvePostFitRung(state, world) [first-rung.ts:527]
          → isCorridorPassable(state, world) [first-rung.ts:253]
            → evaluateCorridorQuality(state, world) [first-rung.ts:123]
              → returns { passable, minWidth, maxSlope, waterClearance,
                          blockedPointCount }   — NO WRITE TO `state`
```

`evaluateCorridorQuality` was read in full (`first-rung.ts:123–251`). It
computes probes via `world.terrain.sample(...)` (read) and
`resolveTerrainTraversal(...)` (pure) and returns a plain object. The
function body carries an explicit in-code note (lines 230–242) recording
that an earlier revision mutated `state.unboundPassage` here directly, why
that was wrong (it bypassed `resolveUnboundPassageCommand`, wrote an
incomplete shape missing `openedByLaneId`, and meant reading state changed
state), and where the transition now lives. I verified this note against
the actual function body rather than trusting it: there is no assignment to
`state` anywhere in the function.

### The actual (correct) mutation path for the same gameplay moment

```
stepGame(state, world, input, dt)          [state.ts:1192]
  → (inside the ploughing branch, only when a new furrow mark is recorded)
    → syncUnboundPassageFromCorridor(       [state.ts:1353, first-rung.ts:271]
        state,
        evaluateCorridorQuality(state, world),   — pure input
        tick,
      )
      → resolveUnboundPassageCommand(       [unbound-passage.ts:204]
          state.unboundPassage,
          { type: "resolve-attempt", ... },
          tick,
        )
      → state.unboundPassage = transition.state   [first-rung.ts:301] — MUTATION,
                                                     but only reachable from stepGame
```

`stepGame` is called only from `advanceGame` (`state.ts:1542`) and directly
from the input loop and `replay-validator.ts`'s `replayToElapsed`/
`replayCommand("advanceTime")`. It is never called from `publicState`,
`resolveFirstRung`, `render_game_to_text`, or any function whose name matches
`resolve*/derive*/read*/public*/snapshot*/evaluate*/get*` in a read-model
sense — those functions call `stepGame`'s *effects* (i.e., they read the
`state.unboundPassage` that a prior `stepGame` call already produced), never
`stepGame` itself.

### Confirmed-safe read paths

| Function | File | Mutates? | Notes |
|---|---|---|---|
| `evaluateCorridorQuality` | first-rung.ts:123 | **No (verified; historically yes)** | Pure probe; returns `CorridorQuality` only |
| `resolveFirstRung` | first-rung.ts:668 | No | Delegates to `resolvePostFitRung`/`resolveSecondFit`/`resolvePreBladeJourney`, all pure |
| `resolvePostFitRung` | first-rung.ts:527 | No | Calls `isCorridorPassable` (pure wrapper around `evaluateCorridorQuality`) |
| `publicState` | state.ts:1566 | No | Builds a plain object from reads only; verified byte-identical state before/after 3x calls |
| `render_game_to_text` (`snapshot`) | main.ts:2098 | No | Wraps `resolveFirstRung` + `publicState` + renderer/perf metrics reads |
| `readUnboundPassage` | unbound-passage.ts:164 | No | Pure projection |
| `deriveMissions` | mission-propositions.ts:332 | No | Builds and sorts a new array from reads; all four generators read-only |
| `deriveFleetRecoveryAssessment` | fleet-recovery-assessment.ts:97 | No | Explicitly documented "deterministic and pure" |
| `fleetRecoveryProjection` | fleet-recovery-command.ts:157 | No | Takes an assessment value, not `state`; pure |
| `workshopInReach` | state.ts:439 | No | Spatial query, `.find()` only |
| `workshopActionable` / `workshopLessonRelevant` | first-rung.ts:75/58 | No | Pure booleans |
| `activeRig` / `activeProfile` / `hasCapability` | state.ts | No | Accessors/derivations |
| `world.exploration.nearestNode` / `.nodesNear` | exploration.ts:204 | No | Pure nearest-search |
| `world.terrain.deformationCount` / `.deformationRevision` | terrain.ts:782/792 | No | Plain getters |
| `world.exploration.surveyedFraction` | exploration.ts:314 | No | Pure geometric fraction |
| `replayCheckpointHash` | replay-validator.ts:342 | No | Hashes `publicState(...)` output; safe because `publicState` is pure |
| `validateDeterministicReplay` | replay-validator.ts:354 | No (mutates only an isolated replay-local session) | Constructs its own `state`/`world` via `sessionFromInitialContext`; never touches the live session |
| `saveState` / `loadState` (read half) | storage.ts:263/132 | `loadState` mutates a freshly-constructed `state`/`world` only, never an existing live session passed in | Correctly scoped to initialization |
| `radial-ui.ts:deriveRadialMenuItems` | radial-ui.ts:25 | No | Pure, but see Finding #2 (drift risk vs. `deriveFleetRecoveryAssessment`) |

---

## 5. Findings ordered by severity

### Finding #0 — P1 (process/documentation): the audit file at this exact path was stale and described a live P0 that no longer exists

**Severity:** P1 (documentation integrity, not runtime risk)
**File:** `docs/reviews/READ_MODEL_AND_COMMAND_BOUNDARY_AUDIT_2026-07-28.md` (prior version, committed in `aad070f`)
**Description:** The previous content of this exact file asserted, in its
executive verdict, that `evaluateCorridorQuality()` "directly mutates
`state.unboundPassage.status`" at "lines 226-228" and that this was
reachable from every `publicState()`/`render_game_to_text()` call. At the
current `main` head, no such mutation exists at those lines or anywhere in
the function; the mutation was already removed and replaced by
`syncUnboundPassageFromCorridor()` called from `stepGame()`, with a
dedicated regression suite (`selector-purity.test.ts`) and a tracker entry
(`MASTER_EXECUTION_TRACKER.md`, "external-review sequence executed", item 1)
recording the fix as closed and independently reproduced (2 fail / 3 pass
with the defect reintroduced, 5 pass with it removed).
**Player-visible consequence:** None directly — this is a docs artifact, not
runtime. But an agent or human trusting this file at face value without
reading current source would flag a non-existent P0 and could waste a cycle
"fixing" already-fixed code, or worse, misjudge the actual boundary as unsafe.
**Why prior review process did not catch this:** The previous audit was
apparently written to describe the state of the bug either before the fix
landed or as a design document that preceded it, and was never updated once
the fix committed alongside it in the same commit tree. Nothing in the repo
enforces that a review doc's claims are re-verified against source at each
commit.
**Smallest safe correction:** This document (replacing the stale one).
**Long-term architectural correction:** None needed for runtime; consider a
lightweight doc-freshness convention (e.g., a "verified against commit
`<hash>`" line, already added here) for any review doc that makes a
mutation/purity claim, so a future reader can tell at a glance whether the
claim has been re-checked since.
**Regression tests required:** None (docs-only finding).

### Finding #1 — P3: `radial-ui.ts` still computes fleet-recovery availability with local booleans instead of the canonical projection

**Severity:** P3
**File:** `src/game/radial-ui.ts`
**Description:** `docs/plans/MASTER_EXECUTION_TRACKER.md` already flags this
itself (item 6, marked `[-]`, not `[x]`): `publicState().fleetRecovery`
(built from `deriveFleetRecoveryAssessment` + `fleetRecoveryProjection`) is
the canonical, tested projection for whether a fleet recovery is available,
but `radial-ui.ts`'s `deriveRadialMenuItems` computes its own local booleans
for the radial wheel rather than consuming that projection. This is not a
purity violation — `deriveRadialMenuItems` does not mutate `state` — but it
is a drift risk: two independent derivations of "is recovery available"
can silently disagree (e.g. the HUD board says available, the radial wheel
says not, or vice versa) if one is updated and the other is not.
**Call chain:** `deriveRadialMenuItems(state)` — self-contained, does not
call `deriveFleetRecoveryAssessment` or `fleetRecoveryProjection`.
**State or world object mutated:** None — this is a correctness/drift
finding, not a mutation finding.
**Player-visible consequence:** Radial wheel could show a recovery option as
available/unavailable inconsistently with the HUD board, in an edge case
where the two derivations diverge.
**Save/reload consequence:** None.
**Deterministic replay consequence:** None (neither path is part of replay
checkpoint state).
**Why existing tests did not detect it:** `radial-ui.test.ts` tests
`deriveRadialMenuItems` in isolation; there is no cross-check test asserting
it agrees with `fleetRecoveryProjection` for the same state.
**Smallest safe correction:** Have `deriveRadialMenuItems` accept the
already-computed `fleetRecoveryProjection` result (or call
`deriveFleetRecoveryAssessment`/`fleetRecoveryProjection` itself) instead of
recomputing local booleans.
**Long-term architectural correction:** Same as the smallest fix — there is
no larger restructuring needed, just routing the radial wheel through the
existing canonical projection, consistent with how `publicState.fleetRecovery`
already documents itself: "One assessment, one projection... none of them
re-derives whether a recovery is possible, so they cannot drift apart" — an
invariant `radial-ui.ts` currently sits outside of.
**Regression tests required:** A test asserting
`deriveRadialMenuItems(state).find(recoveryItem).enabled ===
(fleetRecoveryProjection(deriveFleetRecoveryAssessment(state, world, weather)).status === "available")` for a representative set of states.

### No P0 or P1 runtime findings

No other candidate mutation sites were found. The full sweep in §2's
methodology (every `state.<field> =` / `.push(` / `.splice(` in
`src/game/*.ts`, plus a targeted read of `main.ts`'s equivalent patterns)
turned up nothing outside the command-handler/kernel set enumerated in §3.

---

## 6. Confirmed-safe read paths

All functions listed in §4's "Confirmed-safe read paths" table, plus:

- `hasCapability(rig, capability)` — derived from `effectiveProfile`
- `resolvePrimaryAction(state, world)` — pure resolution, no side effects
  (the mutating half is the separate `executePrimaryActionCommand`)
- `resolveTerrainTraversal(terrain, profile, sx, sz, ex, ez)` — pure geometry
- `eligiblePassageLanes(capabilities)` — pure filter over `PASSAGE_LANES`
- `canUseInheritedPassage(state, actorRigId)` — pure boolean
- `firstCompatibleRig` / `hasFittedPart` / `totalFittedModules` (first-rung.ts) — pure
- `resolvePreBladeJourney` / `resolveSecondFit` (first-rung.ts) — pure resolutions, no mutation
- `world.exploration.sightlineClear` — pure line-of-sight query
- `restoreUnboundPassage` (unbound-passage.ts:322) — a validating parser: it
  rejects an "open" state missing `openedByRigId`/`openedByLaneId` and any
  "recoverable" state missing `recoveryLaneId`/`recoveryReason`, falling back
  to `createUnboundPassageState()`. This is the safety net Finding #0's
  historical bug would have hit on reload (a passage opened without
  `openedByLaneId` would have been silently reset to blocked on the next
  load) — it is itself pure (constructs and returns a new state, does not
  mutate its input) and was read in full.
- `verifyRunRecord`, `snapshotRunRecord` (run-record.ts, referenced from
  replay-validator.ts) — structural validation and JSON serialization only.

---

## 7. Test coverage gaps

| Gap | Severity | Description |
|---|---|---|
| No cross-check between `radial-ui.ts` and the canonical fleet-recovery projection | P3 | See Finding #1 |
| Mission board accept/dismiss command boundary is untested because it is unbuilt | P2 (tracked separately) | Per `CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md`; not a purity gap today because there is no runtime path to violate, but it is a gap that will need its own boundary test once the board ships |
| No "doc claims match source" check | P1 (process) | Nothing currently prevents a review doc's mutation claim from going stale the way this file's previous version did; see Finding #0 |

The existing purity coverage itself is strong and does not need duplication:
`selector-purity.test.ts` already asserts (a) `publicState` is byte-identical
before/after repeated calls, (b) `resolveFirstRung` is byte-identical
before/after repeated calls, (c) `evaluateCorridorQuality` never opens the
passage as a side effect, (d) purity holds after 240 simulated steps that
create furrows, and (e) the passage, once opened via the command boundary
after 600 steps, is either not open or carries a complete shape (`openedByRigId`,
`openedByLaneId`, `revision > 0`) that survives `restoreUnboundPassage`. All
five assertions were re-read and independently confirmed correct against the
current function bodies, not merely trusted because the test exists.

---

## 8. Proposed target architecture

The target architecture is **already implemented**, not proposed. Stated for
completeness and as the standard against which future changes should be
checked:

```
┌─────────────────────────────────────────────────────┐
│                    ORCHESTRATION (main.ts)            │
│  Input loop → stepGame/advanceGame → HUD render        │
│  HUD render reads publicState(), resolveFirstRung(),   │
│  deriveMissions(), fleetRecoveryProjection(), etc.      │
│  User/acceptance actions dispatch named commands        │
│  (installModule, performFleetRecovery, winchRecover,    │
│  toggleBladeMode, selectActiveRig, ...)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              SIMULATION KERNEL (state.ts)              │
│  stepGame() — the only place `state.unboundPassage`     │
│  transitions from corridor clearance, always via         │
│  resolveUnboundPassageCommand(). Command handlers         │
│  validate authority and mutate directly, in place.        │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                     READ MODELS                        │
│  first-rung.ts: resolveFirstRung, evaluateCorridorQuality│
│  mission-propositions.ts: deriveMissions                 │
│  fleet-recovery-assessment.ts: deriveFleetRecoveryAssessment│
│  unbound-passage.ts: readUnboundPassage                  │
│  state.ts: publicState                                    │
│  All pure. Return structured data; never touch `state`.   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  COMMAND HANDLERS                       │
│  resolveUnboundPassageCommand, resolveFleetRecoveryCommand│
│  executePrimaryActionCommand, executeRigSelectionCommand  │
│  installModule, winchRecover, repairRig, toggleBladeMode  │
│  Validate authority, produce events/transitions, mutate.   │
└─────────────────────────────────────────────────────┘
```

The one deviation from this diagram is `radial-ui.ts` (Finding #1), which
sits in the "read models" layer but does not consume the canonical
`fleet-recovery-assessment.ts` projection — a drift risk, not a boundary
violation.

---

## 9. Minimal correction sequence

Since no P0/P1 runtime defect exists, there is no mutation to remove. The
correction sequence is documentation and drift hardening only:

1. **Done, by this document.** Replace the stale audit content at this path
   with the current, re-verified findings (Finding #0).
2. **Optional, P3.** Route `radial-ui.ts`'s recovery-availability boolean
   through `fleetRecoveryProjection`/`deriveFleetRecoveryAssessment` instead
   of a local recomputation (Finding #1).
3. **Optional, process.** When the mission/contract board (per
   `CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md`) gets a real
   runtime accept/dismiss branch, add a purity test analogous to
   `selector-purity.test.ts` asserting the board's render path does not
   mutate `state`, before it ships.

---

## 10. Acceptance criteria for calling the boundary safe

All of the following are already met on current `main`:

1. `publicState(state, world)` is side-effect-free — verified.
2. `evaluateCorridorQuality(state, world)` does not mutate
   `state.unboundPassage` or any other field — verified.
3. The passage-open transition goes through `resolveUnboundPassageCommand`
   with a valid `laneId` and increments `revision` — verified
   (`syncUnboundPassageFromCorridor` at `first-rung.ts:271`).
4. A passage opened through the command survives save/reload — verified via
   `selector-purity.test.ts`'s round-trip assertion and independent reading
   of `restoreUnboundPassage`'s validation rules.
5. Checkpoint hashes are stable regardless of whether `publicState` was
   called before the checkpoint — true as a consequence of (1); confirmed by
   reading `replayCheckpointHash` and `validateDeterministicReplay`, which
   both depend only on `publicState`'s purity.
6. All tests pass with no regressions — **69 files / 410 tests, 0 failures**,
   independently re-run for this audit.
7. TypeScript typecheck passes — **0 errors**, independently re-run for this
   audit (the prior report's claimed pre-existing error at
   `first-rung.ts:295` is also gone).

Nothing further is required to call this specific boundary safe today. The
open item is process (§0, §9.1) and one drift risk (§5 Finding #1), not a
runtime safety gap.

---

## 11. Open questions requiring Pranay's decision

1. **Should review docs carry a "verified against commit `<hash>`" line as a
   standing convention?** This audit found that the exact same file path had
   gone stale relative to source without anyone flagging it. A lightweight
   convention (a header line, checked informally on read rather than
   enforced by tooling) would catch this cheaply for future audits of the
   same kind.
2. **Is Finding #1 (`radial-ui.ts` drift risk) worth fixing now, given
   `MASTER_EXECUTION_TRACKER.md` already tracks it as open (`[-]`) under a
   different initiative?** It is low severity and already known; this audit
   does not add new information beyond confirming it is still open and
   explaining precisely why it matters (radial wheel vs. HUD board
   disagreement risk).
3. **Should the mission/contract board's eventual runtime wiring be gated on
   a purity test existing first**, given this audit's central finding is
   that the *previous* real P0 in this codebase was exactly this shape (a
   read path that quietly grew a write)? Recommend yes, as a standing rule
   for any future read-model addition, not just this one board.

---

## 12. Exact commands run and their results

### TypeScript typecheck
```bash
npx tsc --noEmit
```
**Result:** exit 0, no output — 0 errors.

### Full test suite
```bash
npx vitest run
```
**Result:** `Test Files 69 passed (69)`, `Tests 410 passed (410)`, 0 failed.
Included, among the 69 files: `selector-purity.test.ts`, `first-rung.test.ts`,
`state.test.ts`, `state-progression.test.ts`, `fleet-recovery-vertical.test.ts`,
`replay-retention.test.ts`, `run-record.test.ts`, `storage-provenance.test.ts`,
`command-event-lane-proof.test.ts`, `mission-propositions.test.ts`,
`mission-resolver.test.ts`, `radial-ui.test.ts`.

### Code search for `state.unboundPassage` write sites
```bash
grep -n 'state\.unboundPassage[.= ]' src/game/*.ts src/main.ts
```
**Result:** Exactly one write site across the entire codebase:
`first-rung.ts:301` (`state.unboundPassage = transition.state;`), inside
`syncUnboundPassageFromCorridor`, which is called only from
`stepGame` (`state.ts:1353`). All other references are reads: comparisons
in `publicState`, `resolvePostFitRung`'s corridor logic, the fleet-inheritance
branch in `stepGame`, and `readUnboundPassage`.

### Code search for any `state.<field> =` mutation outside command handlers
```bash
grep -rn 'state\.\w+ *=[^=]|state\.\w+\.push\(|state\.\w+\.splice\(' src/game/*.ts
```
**Result:** Every match resolved to a line inside a named command handler or
`stepGame`'s kernel body (§3's tables), except `animation.ts:344`, which
mutates a renderer-local `RigAnimationState`, not `GameState`.

### Code search for direct state mutation in `main.ts`
```bash
grep -n 'state\.\w+ *[+\-]?=[^=]' src/main.ts | grep -v '===|!==|<=|>='
```
**Result:** One match — `main.ts:2516`, `state.lastDiagnostic = ...` on a
save-write failure inside `persist()`.

---

## Appendix: First principles check

| Principle | Status |
|---|---|
| Reads must not write | **Met** — `evaluateCorridorQuality`, `publicState`, `resolveFirstRung`, `deriveMissions`, `deriveFleetRecoveryAssessment` all verified pure |
| Commands express intent | Met — every canonical-state mutation traced to a named command handler or the `stepGame` kernel |
| Command handlers validate authority | Met — `resolveUnboundPassageCommand` validates capability/lane; `resolveFleetRecoveryCommand` validates tow/range/grip; module/rig-select commands validate cost/fit/range |
| Transitions produce complete state and events | Met for the passage boundary specifically — `resolveUnboundPassageCommand` always sets `openedByLaneId` alongside `openedByRigId` and increments `revision`, unlike the historical mutation this audit's predecessor described |
| Persistence must round-trip valid canonical state | Met — `restoreUnboundPassage` rejects incomplete shapes; no code path currently produces one |
| Observability must not affect simulation | Met — `publicState`/`render_game_to_text` verified side-effect-free |
| Replay must not depend on whether an inspector was opened | Met, as a direct consequence of the above — `replayCheckpointHash` depends only on `publicState`, which is pure |
| Acceptance hooks must remain isolated from player runtime authority | Met — acceptance hooks (`window.recoverStrandedRig`, etc.) dispatch the same command handlers as live UI, not a parallel authority |

**Bottom line: fix now vs. tolerate vs. reject — none apply as stated,
because there is nothing live to fix.** The boundary is sound on current
`main`. The one action worth taking is correcting the stale claim this same
report used to make (done, by replacing it) and, at Pranay's discretion,
the small `radial-ui.ts` drift fix in Finding #1.
