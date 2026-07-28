# Read-Model Purity & Command Boundary Audit

**Date:** 2026-07-28  
**Repository:** pranaysuyash/rigs-unbound  
**Head:** latest main  
**Audit type:** Static source inspection — no runtime code was modified  

---

## 1. Executive verdict

**One confirmed P0 read-side mutation exists.** The function `evaluateCorridorQuality()` in `src/game/first-rung.ts` directly mutates `state.unboundPassage.status` and `state.unboundPassage.openedByRigId` during what is presented as a read-model evaluation. This mutation is reachable from every call to `publicState()` and `render_game_to_text()`, meaning the act of *observing* the game state changes the game state. The mutation bypasses the proper command/event boundary (`resolveUnboundPassageCommand`) and creates an incomplete passage-open state with no lane provenance and no revision increment.

No other read-side mutations of the same severity were found. The remainder of the read-model surface is clean: `readUnboundPassage`, `deriveMissions`, `snapshotXpProgression`, `deriveRigFeedback`, `resolveControlLesson`, `workshopInReach`, `workshopActionable`, `activeRig`, `activeProfile`, and all renderer/camera/feedback selectors are pure queries that do not write to canonical state.

**Recommendation: Fix now.** The mutation is idempotent (fires only once, when status transitions from "blocked" to "open"), but it violates the read/write separation that the project's own ADR-0001 and the command/event proof slice depend on. It also means deterministic replay checkpoint hashes depend on whether `publicState` was called before the checkpoint, which is an observability-ordering bug.

---

## 2. Scope and methodology

Inspected all files in the `src/game/` directory and `src/main.ts` that contain:
- functions named `resolve*`, `derive*`, `read*`, `public*`, `snapshot*`, `evaluate*`, `get*`
- selectors, projections, and read-model surfaces
- the `render_game_to_text` / `publicState` call graph
- the `run-record` and `replay-validator` snapshot generation
- HUD, workshop, minimap, navigator, rumor-map, control-guidance, and mission-board projections
- save serialization and restore validation

Call chains were traced from `render_game_to_text()` → `publicState()` → `resolveFirstRung()` → `evaluateCorridorQuality()` → `state.unboundPassage` mutation.

Typecheck and full test suite were run against the current head (387 tests pass, 1 pre-existing TS error in `first-rung.ts:295` unrelated to this audit).

---

## 3. Current mutation-authority map

### Valid kernel mutations (inside `stepGame`)
| Location | Object mutated | Classification |
|---|---|---|
| `state.ts:stepGame` → collision damage | `rig.condition` | Valid kernel mutation |
| `state.ts:stepGame` → drowning | `rig.condition` | Valid kernel mutation |
| `state.ts:stepGame` → landing damage | `rig.condition` | Valid kernel mutation |
| `state.ts:stepGame` → plough deform | `world.terrain`, `state.furrows`, `state.semanticEdits` | Valid kernel mutation |
| `state.ts:stepGame` → fleet inheritance | `state.fleetInheritance` | Valid kernel mutation |
| `state.ts:stepGame` → discovery | `state.discoveries` | Valid kernel mutation |
| `state.ts:stepGame` → survey evaluation | `state.surveyRoute`, `state.salvage` | Valid kernel mutation |
| `state.ts:stepGame` → cargo update | `state.cargoRelay.cargo` | Valid kernel mutation |
| `state.ts:stepGame` → idle strain recovery | `rig.strain` | Valid kernel mutation |
| `state.ts:stepGame` → time advance | `state.elapsedMs`, `state.worldTimeMinutes`, `state.phase` | Valid kernel mutation |

### Valid command handlers
| Location | Object mutated | Classification |
|---|---|---|
| `state.ts:executePrimaryActionCommand` | `cargo`, `relay`, `plough`, `state.salvage`, `state.surveyRoute`, `state.lastDiagnostic` | Valid command handler |
| `state.ts:executeRigSelectionCommand` | `state.activeRigId`, `current.speed`, `current.steering` | Valid command handler |
| `state.ts:installModule` | `rig.modules`, `state.salvage` | Valid command handler |
| `state.ts:winchRecover` | `rig.x`, `rig.z`, `rig.speed`, `rig.condition`, `rig.strain`, `cargo` | Valid command handler |
| `state.ts:repairRig` | `rig.condition`, `rig.strain`, `state.salvage` | Valid command handler |
| `state.ts:toggleBladeMode` | `plough.mode` | Valid command handler |
| `state.ts:cyclePhase` | `state.worldTimeMinutes`, `state.phase` | Valid command handler |
| `state.ts:selectCamera` | `state.cameraMode` | Valid command handler |
| `state.ts:togglePause` | `state.paused` | Valid command handler |
| `state.ts:toggleMap` | `state.mapOpen` | Valid command handler |

### Valid initialization mutations
| Location | Object mutated | Classification |
|---|---|---|
| `state.ts:settleWorld` | `rig.y`, `rig.speed`, `cargo.y` | Valid initialization mutation |
| `gameworld.ts:restore` | terrain, obstacles, surveyed cells | Valid initialization mutation |

### Invalid read-side mutation (P0)
| Location | Object mutated | Classification |
|---|---|---|
| **`first-rung.ts:evaluateCorridorQuality` lines 226-228** | **`state.unboundPassage.status`, `state.unboundPassage.openedByRigId`** | **Invalid read-side mutation** |

### Questionable orchestration mutations
None found. All mutations in `main.ts` are either command dispatches (calling into `state.ts` command handlers) or renderer/UI projections that do not touch `state`.

---

## 4. Read-model call graph

### The confirmed mutation path

```
render_game_to_text()                     [main.ts:2013]
  → snapshot()                            [main.ts:1971]
    → resolveFirstRung(state, world.collectedNodes, world)   [main.ts:1972]
    → publicState(state, world)            [main.ts:1979]
      → resolveFirstRung(state, world.collectedNodes, world) [state.ts:1596]
        → resolvePostFitRung(state, world) [first-rung.ts:520]
          → isCorridorPassable(state, world) [first-rung.ts:241]
            → evaluateCorridorQuality(state, world) [first-rung.ts:119]
              → state.unboundPassage.status = "open"         [first-rung.ts:227] ← MUTATION
              → state.unboundPassage.openedByRigId = state.activeRigId [first-rung.ts:228] ← MUTATION
```

**Note:** `snapshot()` calls `resolveFirstRung` twice — once directly (line 1972) and once indirectly through `publicState` (line 1979 → state.ts:1596). Both paths reach `evaluateCorridorQuality`. The mutation is idempotent (guarded by `state.unboundPassage.status !== "open"`), so the second call is a no-op. But the first call mutates during what should be a read.

### Confirmed-safe read paths

| Function | File | Mutates? | Notes |
|---|---|---|---|
| `readUnboundPassage` | unbound-passage.ts:164 | No | Pure projection from passage state to read model |
| `deriveMissions` | mission-propositions.ts | No | Pure — same state always produces same propositions |
| `snapshotXpProgression` | xp-progression.ts:161 | No | Pure snapshot of progression state |
| `deriveRigFeedback` | feedback.ts | No | Pure projection from rig telemetry |
| `resolveControlLesson` | control-guidance.ts | No | Pure selector from state |
| `workshopInReach` | state.ts | No | Spatial query — reads rig position vs site bounds |
| `workshopActionable` | first-rung.ts:72 | No | Pure boolean from workshop + module state |
| `workshopLessonRelevant` | first-rung.ts:57 | No | Pure boolean from first-rung resolution |
| `activeRig` | state.ts | No | Simple accessor |
| `activeProfile` | state.ts | No | Derived from rig + modules |
| `hasCapability` | state.ts | No | Derived from effective profile |
| `resolvePrimaryAction` | state.ts | No | Pure resolution — no side effects |
| `resolveTerrainTraversal` | terrain-traversal.ts | No | Pure geometry query |
| `evaluateSurveyRoute` | activities.ts | No (returns new state) | Immutable pattern — returns evaluation, caller assigns |
| `snapshotRunRecord` | run-record.ts:229 | No | Pure JSON serialization |
| `verifyRunRecord` | run-record.ts | No | Pure structural validation |
| `validateDeterministicReplay` | replay-validator.ts | No (creates internal session) | Creates isolated replay session, does not touch live state |
| `replayCheckpointHash` | replay-validator.ts | No | Computes hash from `publicState` — but see Finding #1 |

---

## 5. Findings ordered by severity

### Finding #1 — P0: Read-side mutation in `evaluateCorridorQuality`

**Severity:** P0  
**File:** `src/game/first-rung.ts`  
**Lines:** 226–228  
**Call chain:** `render_game_to_text` → `snapshot` → `publicState` → `resolveFirstRung` → `resolvePostFitRung` → `isCorridorPassable` → `evaluateCorridorQuality` → **mutates `state.unboundPassage`**  

**State mutated:** `state.unboundPassage.status` (set to `"open"`) and `state.unboundPassage.openedByRigId` (set to `state.activeRigId`)  

**Intentional?** Partially. The corridor-clearance check was designed to open the passage when the route becomes passable. But placing this mutation inside a function named `evaluateCorridorQuality` — which is called from `publicState` (a read model) — means observation changes state. The comment at line 228–231 even acknowledges this: *"This function is a selector. It is reached from `resolveFirstRung()`, which `publicState()` calls while building its read model, so any mutation here means reading state changes state."* The author was aware of the danger but left the mutation in place.

**Player-visible consequence:** The passage transitions from "blocked" to "open" during the HUD update, before any command is issued. The HUD shows the "second-fit" stage prompt. If the player never issues a command, the passage is already open.

**Save/reload consequence:** `state.unboundPassage` is persisted in the save payload. Once the mutation fires, it is saved. On reload, `restoreUnboundPassage` validates the schema and accepts the open state — even though no `resolveUnboundPassageCommand` was ever executed. The restored state looks valid but has:
- No `openedByLaneId` (the mutation only sets `openedByRigId`)
- No `revision` increment (revision stays at 0)
- No `PassageAttemptOutcome` recorded

This means the restored state has `status: "open"` with `openedByLaneId: null`, which passes `restoreUnboundPassage` validation (the validator only requires `openedByRigId` and `openedByLaneId` when status is "open" — wait, actually the validator at line 196–199 checks: `if (state.status === "open" && (!state.openedByRigId || !state.openedByLaneId))` — this would **reject** the state and reset to `createUnboundPassageState()`. So the mutation creates a state that **cannot survive save/reload**. This is a data loss bug.

**Deterministic replay consequence:** `replayCheckpointHash` calls `publicState(session.state, session.world)` to compute the checkpoint hash. In both the original run and replay, the checkpoint hash is computed from `publicState`, which triggers the mutation in both cases. So the hashes should be consistent — the mutation fires at the same point (during `publicState` call in checkpoint recording). The real replay risk is more subtle: if the corridor becomes passable between two checkpoints in the original run, the mutation fires during a HUD-update `publicState` call (which happens every frame), not at the checkpoint boundary. In replay, the mutation only fires during `replayCheckpointHash`. Since the mutation is idempotent, once it fires in the original run the state is permanently mutated, so the next checkpoint includes it. But this means the mutation's timing depends on when the HUD update runs relative to checkpoint recording, which is an observation-ordering dependency rather than a simulation-tick dependency.

**Why existing tests did not detect it:**  
- `first-rung.test.ts` tests `evaluateCorridorQuality` directly and checks the return value, but does not verify that `state.unboundPassage` was mutated as a side effect.
- `state.test.ts` tests `publicState` output but does not check that calling `publicState` changes `state.unboundPassage`.
- `unbound-passage.test.ts` tests `resolveUnboundPassageCommand` but not the bypass path through `evaluateCorridorQuality`.
- No test asserts that `publicState` is side-effect-free.

**Smallest safe correction:**  
Remove lines 226–228 from `evaluateCorridorQuality`. Instead, have `resolvePostFitRung` emit a structured signal (e.g. `corridorClear: true`) that `main.ts` consumes and routes through `resolveUnboundPassageCommand` with the correct lane provenance.

**Long-term architectural correction:**  
`evaluateCorridorQuality` should return `{ passable: boolean, ... }` and never touch `state`. The passage-open transition should be a command dispatched from the orchestration layer (`main.ts`) after the read model reports `corridorClear === true`. This keeps the read/write boundary clean and ensures every passage state transition has lane provenance, revision tracking, and event emission.

**Regression tests required:**  
1. Assert `publicState(state, world)` is side-effect-free: call it twice and verify `state` is unchanged.
2. Assert `evaluateCorridorQuality` does not mutate `state.unboundPassage`.
3. Assert the passage-open transition goes through `resolveUnboundPassageCommand` with a valid lane and revision.

---

### Finding #2 — P1: Passage state created by mutation cannot survive save/reload

**Severity:** P1  
**File:** `src/game/first-rung.ts` lines 226–228, `src/game/unbound-passage.ts` lines 196–199  
**Call chain:** Same as Finding #1  

**Description:** The mutation sets `state.unboundPassage.status = "open"` and `state.unboundPassage.openedByRigId = state.activeRigId`, but does NOT set `openedByLaneId`. The `restoreUnboundPassage` validator at line 196–199 checks:

```typescript
if (state.status === "open" && (!state.openedByRigId || !state.openedByLaneId)) {
    return createUnboundPassageState();
}
```

So a passage opened by the read-side mutation will be **reset to "blocked" on every save/reload cycle**. The player sees the passage open in the HUD, but after reload it reverts to blocked. This is a data-loss bug that ChatGPT's review also flagged ("screenshot-backed playtests connected to different servers" masking inconsistent state).

**Player-visible consequence:** After save/reload, the passage status reverts from "open" to "blocked" because the mutation-created state fails restoration validation. The player's terrain work persists (furrows are saved) but the passage status is lost.

**Smallest safe correction:**  
Same as Finding #1 — remove the mutation and route through `resolveUnboundPassageCommand` which sets all required fields.

---

### Finding #3 — P1: `snapshot()` calls `resolveFirstRung` twice per invocation

**Severity:** P1  
**File:** `src/main.ts` lines 1971–1979  
**Call chain:** `snapshot()` calls `resolveFirstRung` at line 1972, then `publicState` at line 1979 which calls `resolveFirstRung` again at `state.ts:1596`  

**Description:** The `snapshot()` function calls `resolveFirstRung(state, world.collectedNodes, world)` explicitly (line 1972) and then calls `publicState(state, world)` (line 1979) which internally calls `resolveFirstRung` again. This is redundant computation, and because `evaluateCorridorQuality` has a side effect, the first call mutates state and the second call is a no-op (guard: `state.unboundPassage.status !== "open"`). After Finding #1 is fixed, this becomes a pure performance issue.

**Smallest safe correction:**  
Remove the explicit `resolveFirstRung` call in `snapshot()` and use the one returned by `publicState`.

---

### Finding #4 — P2: `snapshot()` in main.ts calls `publicState` which calls `resolveFirstRung`, but the passage-open transition has no lane provenance

**Severity:** P2  
**File:** `src/game/first-rung.ts` lines 226–228  
**Description:** The mutation sets `openedByRigId` but not `openedByLaneId`. The unbound-passage system is designed around two lanes ("grade-and-brace" and "jump-and-scout") that carry different required capabilities and recovery paths. The read-side mutation bypasses this entirely, creating a passage-open state with no lane provenance. This means:
- No `PassageAttemptOutcome` is recorded
- No `UnboundPassageEvent` is emitted
- No `revision` is incremented
- The `recoveryLaneId` is never set

If the passage later needs recovery, the system has no record of which lane was used.

**Smallest safe correction:**  
Same as Finding #1 — route through `resolveUnboundPassageCommand` with the correct lane.

---

### Finding #5 — P2: No test asserts that `publicState` is side-effect-free

**Severity:** P2  
**File:** No test file  
**Description:** The `publicState` function is the primary observability surface. It is called from `render_game_to_text`, `replayCheckpointHash`, and the HUD update loop. No test asserts that calling `publicState` does not change `state`. This means any future read-side mutation will go undetected.

**Smallest safe correction:**  
Add a test: `expect(state).toEqual(stateBefore); publicState(state, world); expect(state).toEqual(stateBefore);`

**Long-term architectural correction:**  
Consider making `publicState` take a `Readonly<GameState>` parameter, or at minimum add a snapshot comparison test that runs on every CI pass.

---

### Finding #6 — P3: `applyMissionRewards` and `applyActivityCompletionProgression` use immutable pattern but `mission-resolver.ts` is not used from a read model

**Severity:** P3  
**File:** `src/game/mission-resolver.ts`  
**Description:** These functions return new state objects rather than mutating in place. This is the correct pattern. They are only called from command handlers (`stepGame` → cargo delivery, `executePrimaryActionCommand` → survey completion) and from the mission resolver (which is itself a command handler). No read-model path reaches them. Confirmed safe.

---

## 6. Confirmed-safe read paths

All of the following were inspected and confirmed to not mutate canonical state:

- `readUnboundPassage(state, actorRigId)` — pure projection
- `deriveMissions(state, progression, weatherPhase, visibleSites)` — pure derivation
- `snapshotXpProgression(state)` — pure snapshot
- `deriveRigFeedback(rig, terrain)` — pure projection
- `resolveControlLesson(state)` — pure selector
- `workshopInReach(state)` — spatial query
- `workshopActionable(workshopAvailable, state, firstRung)` — pure boolean
- `workshopLessonRelevant(firstRung)` — pure boolean
- `activeRig(state)` — accessor
- `activeProfile(state)` — derived
- `hasCapability(rig, capability)` — derived
- `resolvePrimaryAction(state, world)` — pure resolution
- `resolveTerrainTraversal(terrain, profile, sx, sz, ex, ez)` — pure geometry
- `evaluateSurveyRoute(...)` — returns new state, caller assigns (immutable pattern)
- `snapshotRunRecord(record)` — pure JSON serialization
- `verifyRunRecord(record)` — pure structural validation
- `validateDeterministicReplay(record)` — creates isolated session, does not touch live state
- `eligiblePassageLanes(capabilities)` — pure filter
- `canUseInheritedPassage(state, actorRigId)` — pure boolean
- `firstCompatibleRig(state, moduleId)` — pure query
- `hasFittedPart(state)` — pure boolean
- `totalFittedModules(state)` — pure count
- `resolvePreBladeJourney(state)` — pure resolution (no mutation)
- `resolveSecondFit(state)` — pure resolution (no mutation)
- All renderer selectors (`rigSummary`, visibility queries, camera obstruction)
- All UI projections (minimap, navigator, rumor-map, hood-dashboard, control-guidance)
- `world.snapshot()` — returns `WorldMemoryRecord`, does not mutate world
- `terrain.sample()`, `terrain.height()`, `terrain.slope()`, `terrain.surfaceIdAt()` — pure reads

---

## 7. Test coverage gaps

| Gap | Severity | Description |
|---|---|---|
| No side-effect-free assertion on `publicState` | P2 | `publicState` is called from acceptance tests and replay but no test verifies it doesn't mutate state |
| `evaluateCorridorQuality` side effect not tested | P1 | Tests call it directly but don't check that `state.unboundPassage` was mutated |
| Passage-open via read model not tested for save/reload round-trip | P1 | The mutation-created passage state fails `restoreUnboundPassage` validation |
| No replay-ordering test | P2 | No test verifies that calling `publicState` before vs after a checkpoint produces the same hash |
| `snapshot()` double-call of `resolveFirstRung` not tested | P3 | Redundant computation is not covered by performance or correctness tests |

---

## 8. Proposed target architecture

```
┌─────────────────────────────────────────────────────┐
│                    ORCHESTRATION                      │
│  main.ts: stepGame loop, acceptance hooks, HUD       │
│                                                       │
│  1. stepGame(state, world, input) — simulation        │
│  2. publicState(state, world) — read model            │
│  3. if corridor clear AND passage blocked:            │
│     → dispatch resolveUnboundPassageCommand           │
│       with laneId="grade-and-brace"                   │
│     → passage state transitions through command       │
│  4. HUD reads readUnboundPassage(passage, rigId)      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   SIMULATION KERNEL                   │
│  state.ts: stepGame, executePrimaryActionCommand,    │
│  executeRigSelectionCommand, installModule, etc.      │
│                                                       │
│  All mutations happen here, through named commands    │
│  that validate authority and produce events.          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                     READ MODELS                       │
│  first-rung.ts: resolveFirstRung, evaluateCorridor   │
│  mission-propositions.ts: deriveMissions              │
│  xp-progression.ts: snapshotXpProgression             │
│  feedback.ts: deriveRigFeedback                       │
│  unbound-passage.ts: readUnboundPassage               │
│                                                       │
│  Pure queries. Never mutate canonical state.          │
│  Return structured data; orchestration decides.       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  COMMAND HANDLERS                     │
│  resolveUnboundPassageCommand — passage transitions   │
│  executePrimaryActionCommand — primary action         │
│  executeRigSelectionCommand — rig switching           │
│  installModule — module fitting                       │
│  winchRecover — recovery                              │
│                                                       │
│  Validate authority, produce events, mutate state.    │
└─────────────────────────────────────────────────────┘
```

Key principles:
1. **Read models are pure.** `evaluateCorridorQuality` returns `{ passable: boolean, ... }` and never touches `state`.
2. **Passage transitions go through commands.** `resolveUnboundPassageCommand` validates lane capability, increments revision, and emits events.
3. **Orchestration dispatches commands.** `main.ts` reads the corridor quality, and if passable, dispatches the passage-open command.
4. **Snapshot hashes are deterministic.** `publicState` is side-effect-free, so checkpoint hashes are stable regardless of observation order.

---

## 9. Minimal correction sequence

### Step 1: Remove the mutation from `evaluateCorridorQuality` (Finding #1)

Delete lines 226–228 from `src/game/first-rung.ts`:
```typescript
// DELETE:
if (passable && state.unboundPassage.status !== "open") {
    state.unboundPassage.status = "open";
    state.unboundPassage.openedByRigId = state.activeRigId;
}
```

Add a `corridorClear` field to the `CorridorQuality` return:
```typescript
return { passable, minWidth, maxSlope, waterClearance, blockedPointCount: blockedCount, corridorClear: passable };
```

### Step 2: Dispatch the passage-open command from orchestration

In `src/main.ts`, inside the `recordCheckpoint` helper (which runs after every `stepGame` call and is the natural place for post-simulation transitions), add:
```typescript
if (state.unboundPassage.status === "blocked") {
  const quality = evaluateCorridorQuality(state, world);
  if (quality.passable) {
    const transition = resolveUnboundPassageCommand(
      state.unboundPassage,
      {
        type: "resolve-attempt",
        actorRigId: state.activeRigId,
        actorCapabilities: effectiveProfile(state.activeRigId, state.rigs[state.activeRigId].modules).capabilities,
        laneId: "grade-and-brace",
        outcome: { kind: "opened" },
      },
      Math.floor(state.elapsedMs / (FIXED_STEP_SECONDS * 1000)),
    );
    if (transition.accepted) {
      state.unboundPassage = transition.state;
    }
  }
}
```

**Note:** `effectiveProfile` is already imported in `main.ts` from `./game/contracts`. The `evaluateCorridorQuality` import needs to be added from `./game/first-rung`. `resolveUnboundPassageCommand` needs to be imported from `./game/unbound-passage`.

**Performance note:** This check runs every frame (via `recordCheckpoint`). Since the passage can only transition from "blocked" to "open" once (idempotent), the check short-circuits immediately once `status !== "blocked"`. The `evaluateCorridorQuality` call is the expensive part, but it already runs every frame via `publicState`, so this adds no new overhead.

### Step 3: Add side-effect-free assertion test

```typescript
it("publicState does not mutate canonical state", () => {
  const { state, world } = scenario("CORRIDOR-CLEAR");
  const before = JSON.parse(JSON.stringify(state));
  publicState(state, world);
  expect(state).toEqual(before);
});
```

### Step 4: Add passage-save-roundtrip test

```typescript
it("passage opened through command survives save/reload", () => {
  const state = createUnboundPassageState();
  const transition = resolveUnboundPassageCommand(state, {
    type: "resolve-attempt",
    actorRigId: "utility-tractor",
    actorCapabilities: ["plough", "tow"],
    laneId: "grade-and-brace",
    outcome: { kind: "opened" },
  }, 100);
  expect(transition.accepted).toBe(true);
  const restored = restoreUnboundPassage(JSON.parse(JSON.stringify(transition.state)));
  expect(restored.status).toBe("open");
  expect(restored.openedByLaneId).toBe("grade-and-brace");
});
```

---

## 10. Acceptance criteria for calling the boundary safe

1. `publicState(state, world)` is side-effect-free: calling it does not change `state`.
2. `evaluateCorridorQuality(state, world)` does not mutate `state.unboundPassage`.
3. The passage-open transition goes through `resolveUnboundPassageCommand` with a valid `laneId` and increments `revision`.
4. A passage opened through the command survives save/reload (round-trip test passes).
5. Checkpoint hashes are stable regardless of whether `publicState` was called before the checkpoint.
6. All 387+ tests pass with no regressions.
7. The TypeScript typecheck passes (the pre-existing `first-rung.ts:295` error is unrelated and should be tracked separately).

---

## 11. Open questions requiring Pranay's decision

1. **Should the corridor-clear trigger a specific lane?** The current system has two lanes ("grade-and-brace" for plough, "jump-and-scout" for jump). The corridor is cleared by ploughing, so "grade-and-brace" is the natural lane. But should the system allow the player to choose, or should the corridor-clear automatically select the plough lane?

2. **Should the passage-open event be emitted as a toast?** The current mutation silently opens the passage. A command-based transition would naturally produce an event that could surface as "Route opened to Long Furrow!" — is this desired?

3. **Should the first-rung progression use the passage status or the corridor quality as its gate?** Currently `resolvePostFitRung` calls `isCorridorPassable` to decide whether to advance to "second-fit". After the fix, should it read `state.unboundPassage.status === "open"` (which now requires a command) or continue probing corridor quality directly? The cleaner option is to read `state.unboundPassage.status === "open"` — this makes the read model depend on canonical state rather than recomputing the corridor quality.

4. **Is the pre-existing TS error at `first-rung.ts:295` (`Type 'string' is not assignable to type 'PassageAttemptOutcome'`) a separate issue?** It appears to be a type mismatch in an unrelated code path and should be tracked as a separate fix.

---

## 12. Exact commands run and their results

### TypeScript typecheck
```bash
npx tsc --noEmit 2>&1 | tail -20
```
**Result:** 1 error — `src/game/first-rung.ts(295,7): error TS2322: Type 'string' is not assignable to type 'PassageAttemptOutcome'.`  
This is a pre-existing type error unrelated to the read-model mutation finding.

### Full test suite
```bash
npx vitest run 2>&1 | tail -20
```
**Result:** 66 test files passed, 387 tests passed. No failures.

### Code search for mutation sites
```bash
# Searched for all state mutations in first-rung.ts
grep -n 'state\.\w*=' src/game/first-rung.ts
```
**Result:** 9 matches. Only lines 227–228 are write-side mutations (`state.unboundPassage.status = "open"`, `state.unboundPassage.openedByRigId = state.activeRigId`). The其余 7 are reads (`state.salvage >= ...`, `state.rigs[...]`, `state.furrows.length`, etc.).

### Code search for unboundPassage mutations across codebase
```bash
grep -n 'state\.unboundPassage\.\w*=' src/game/*.ts
```
**Result:** 2 write-sites total:
1. `first-rung.ts:227` — `state.unboundPassage.status = "open"` (the read-side mutation)
2. `first-rung.ts:228` — `state.unboundPassage.openedByRigId = state.activeRigId` (the read-side mutation)

All other `state.unboundPassage` references are reads (comparisons, accessors, or `readUnboundPassage` calls).

---

## Appendix: First principles check

| Principle | Status |
|---|---|
| Reads must not write | **VIOLATED** — `evaluateCorridorQuality` writes during a read |
| Commands express intent | Partially met — primary action and rig selection have commands; passage-open does not |
| Command handlers validate authority | Met for existing commands; passage-open bypasses this |
| Transitions produce complete state and events | Passage-open via mutation produces incomplete state (no laneId, no event) |
| Persistence must round-trip valid canonical state | **VIOLATED** — mutation-created passage state fails `restoreUnboundPassage` validation |
| Observability must not affect simulation | **VIOLATED** — `publicState` (observability) mutates passage state |
| Replay must not depend on whether an inspector was opened | **AT RISK** — checkpoint hashes depend on `publicState` call order |
| Acceptance hooks must remain isolated from player runtime authority | Met — acceptance hooks use `render_game_to_text` which calls `publicState`, but the mutation is in the read model, not the hook |
