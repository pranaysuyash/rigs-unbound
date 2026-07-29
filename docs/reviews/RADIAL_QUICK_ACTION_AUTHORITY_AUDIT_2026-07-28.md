# Radial Quick-Action Wheel Authority Audit

**Date:** 2026-07-28
**Repository:** pranaysuyash/rigs-unbound
**Audited head:** `cc16730` (`main`, pushed to `origin/main` earlier in this
session — `ace3fde..cc16730 main -> main`)
**Audit type:** Static source inspection — no runtime code was modified. No
Git write commands were run (no stage/commit/reset/merge/rebase/clean/push).

## 0. A note on methodology forced by the repository's current state

This repository has a very large amount of concurrent, uncommitted work in
progress right now — `git status` at the time of this audit showed roughly
100 modified/untracked files across `docs/`, `src/game/`, and `src/main.ts`,
including files this audit needed to read (`contracts.ts`, `state.ts`,
`physics.ts`, `main.ts`, `styles.css`). Some of it changed *while I was
reading it* earlier in this session. The repo's own `AGENTS.md` names this
explicitly: `src/game/` may hold uncommitted parallel-owned runtime work.

"Latest current main head" is not the same thing as "whatever is currently
on disk," because the disk is being edited by a process other than me right
now. I therefore pinned every citation in this report to the **actual
committed content at `cc16730`** via `git show cc16730:<path>`, not the live
working tree. I verified, file by file, that the specific functions this
audit depends on (`renderRadialMenu`, `deriveRigToolProjections`,
`setTirePressure`, `cycleDifferentialMode`, `toolTractionModifiers`,
`REPLAYABLE_COMMAND_NAMES`, the `tap`/command `switch` in
`replay-validator.ts`) are identical between what I read live and what is in
`cc16730`, so this report's findings hold regardless of the further
in-flight changes. Line numbers below are `cc16730` line numbers.

A second, unrelated complication: the host machine ran out of disk space
mid-audit (`/` hit ~98% capacity, commands began failing with `ENOSPC`,
including this file's first write attempt). Pranay is clearing space
concurrently. No project files, user documents, or other applications' data
were touched by me beyond one small rebuildable cache
(`~/Library/Caches/node-gyp`, ~64 MB).

---

## 1. Executive verdict

**The suspected decorative-toggle pattern was real, but it describes dead
code, not the live wheel.** `src/game/radial-ui.ts` — `deriveRadialMenuItems`,
`selectRadialMenuItem`, `RadialMenuItem.active` — is exactly the shape
described in the brief: a local boolean flipped on selection, hardcoded
`available: true` for most entries, one item (`tune-radio`) hardcoded
`active: true` from creation with no way to ever become inactive, and zero
connection to any `GameState` field or command. **But this module is not
what the player sees.** I traced every call site in `main.ts` (`cc16730`)
and confirmed `deriveRadialMenuItems` and `selectRadialMenuItem` are never
called, and the `radialMenuState` variable that holds `radial-ui.ts`'s
output is never read after assignment — only reassigned. It is dead code
still sitting in the module the brief asked me to inspect, imported for a
type and an initializer whose payload nothing consumes.

**The wheel players actually see is `src/game/rig-tool-projection.ts` +
`renderRadialMenu()` in `main.ts`, and it is a real, mostly-authoritative
implementation** — a materially different and much better answer than the
brief's suspicion assumed. Tyre pressure and differential lock are backed by
a real `GameState` field (`rig.tools`), a validated command
(`setTirePressure`, `cycleDifferentialMode` — both clamp/cycle correctly),
dispatch through a real click handler, a real physics consequence
(`toolTractionModifiers` feeds `stepRigMotion`, proven in
`rig-tools.test.ts` with an end-to-end speed comparison), and a real,
tested save/reload round trip through the actual storage path.

**What is not decorative but is broken: deterministic replay.** The click
handler records `recordCommand("rig-tool", { tool: tool.id })`
(`main.ts:894`), but `"rig-tool"` is not in `run-record.ts`'s
`REPLAYABLE_COMMAND_NAMES` set and not in `DIAGNOSTIC_COMMAND_NAMES` either,
so `run-record.ts:161-165` classifies it `replayClass: "non-replayable"`.
`replay-validator.ts:412-427`'s very first per-entry check halts replay the
moment it hits a non-replayable entry. **Any recorded playthrough that uses
the Pegboard's tyre-pressure or differential-lock controls cannot be
deterministically replayed** — not "diverges," but "refuses to even attempt
it." This is a genuine P1: the mechanic itself is real, but it silently
breaks a contract the project treats as load-bearing elsewhere (see the
previous audit in this same session,
[READ_MODEL_AND_COMMAND_BOUNDARY_AUDIT_2026-07-28.md](READ_MODEL_AND_COMMAND_BOUNDARY_AUDIT_2026-07-28.md),
for how seriously this repo takes replay determinism).

**Four of the seven items named in the brief are genuinely decorative or
unreachable, but they are unreachable because they were never migrated to
the new authoritative wheel, not because the new wheel presents them
falsely:** `winch-spool-in`, `winch-spool-out`, `fire-seismic-pulse`, and
`tune-radio` exist only in the dead `radial-ui.ts` module and are not
rendered anywhere. Their underlying mechanics — `fireSeismicPulse()`
(`seismic-probe.ts`) and `deriveRadioSignal()` (`radio-scanner.ts`) — are
real, pure, unit-tested functions with **zero call sites anywhere in
`main.ts`**. There is no `GameState` field for either. They are not lying to
the player; they are simply not present in the live UI at all. Winch spool
control specifically does not correspond to any mechanic in this codebase —
the only winch mechanic is the atomic, non-interruptible `winchRecover()`
(self-recovery), which has no "spool in / spool out" granularity to
misrepresent.

**Blunt conclusion (per the four options offered):** **Reduce the wheel to
only truthful actions.** The live wheel today already *is* mostly truthful
(tyres, diff lock) — it does not need replacement, and it should not be
removed, because tyre pressure and differential lock are real, tested,
persisted mechanics with no other UI surface. What needs to happen: (a) fix
the replay gap for the two live items (small, mechanical fix, detailed in
§12), (b) delete the dead `radial-ui.ts` module and its test, since keeping
it around is itself a trust hazard — a future contributor reading
`radial-ui.ts` in isolation would reasonably believe winch/radio/seismic
entries are live, and (c) either wire the `winch` placeholder entry to a
real command or remove it, since right now it renders as a permanently inert
button (Finding #3).

---

## 2. Live radial-wheel call graph

### Opening the wheel (three input paths, one code path)

```
KeyQ keydown                          [main.ts:1423-1430]
  → openOverlay("radial")             [main.ts:1082]

#touch-radial-action click            [main.ts:1535-1541]
  → openOverlay("radial")

(no gamepad binding exists — see §7)
```

```
openOverlay("radial")                 [main.ts:1082-1099]
  → radialMenuState = { ...createInitialRadialMenuState(state), isOpen: true }
      — createInitialRadialMenuState(state) [radial-ui.ts:87-95] is called,
        its .items are computed via deriveRadialMenuItems(state)
        [radial-ui.ts:25-85] — AND THEN NEVER READ. The assignment exists;
        nothing downstream dereferences radialMenuState.items or
        radialMenuState.selectedIndex anywhere in main.ts. Confirmed by
        `grep -n "radialMenuState\." main.ts` returning zero matches for any
        field access, only two whole-object reassignments (lines 1083, 1126).
  → if (pegboardPausesWorld && !state.paused): togglePause(state)   — ADR-0035
    accessibility opt-in, routes through the canonical pause path
  → renderRadialMenu()                [main.ts:862-905]  ← THE REAL RENDER PATH
  → radialOverlay.hidden = false
  → focusAfterPaint(radialMenuClose)
```

### Rendering the wheel (the authoritative path)

```
renderRadialMenu()                    [main.ts:862-905]
  → deriveRigToolProjections(state)   [rig-tool-projection.ts:43-111]
      — pure: reads rig.tools, rig.mobility.kind, effectiveProfile(...)
      — returns RigToolProjection[]: air-down-tires, air-up-tires,
        cycle-differential (only for wheeled rigs), winch (always)
  → for each projection: build <li><button>, set aria-pressed,
    aria-description = blockedReason ?? detail, disabled = blocked || no command
  → button click:
      if (!tool.command) → showToast(blockedReason ?? "already set"); return
      else:
        markActionReady()
        recordCommand("rig-tool", { tool: tool.id })   [main.ts:894]
        setTirePressure(state, psi)  OR  cycleDifferentialMode(state)
                                          [state.ts:2808 / state.ts:2823]
          → rig.tools.tirePressurePsi = next   OR  rig.tools.differentialMode = next
          → state.lastDiagnostic = <message>
        renderRadialMenu()   — re-derive immediately, so the list can never
                                show a stale status after its own command
        showToast(message)
```

### The mechanical consequence (proves it is not decorative)

```
stepGame(state, world, input, dt)     [state.ts:1239-1245]
  → stepRigMotion(rig, profile, input, world.terrain, dt, {
      towing, ramp, canJump, soilMoisture, tools: rig.tools,   ← LIVE VALUE
    })
    → toolTractionModifiers(options.tools)   [physics.ts:149]
        → calculateTirePressureState(tools.tirePressurePsi, 900)
        → computeAxleTorque(1000, 0.8, 0.25, tools.differentialMode)
      returns { softGripMultiplier, topSpeedMultiplier, steeringMultiplier }
      — these multiply directly into the motion model's grip/speed/steering
        terms for that step.
```

`rig-tools.test.ts:70-91` proves this end to end: identical rig, identical
input, 400 simulated steps, only `tirePressurePsi` differs — the aired-down
rig reaches a measurably lower top speed. This is not a claim I trusted from
a comment; I re-derived the call chain from `stepGame` down to the physics
multiplier myself.

### The dead path (radial-ui.ts — imported, never executed)

```
createInitialRadialMenuState(state)   [radial-ui.ts:87-95]  ← called (main.ts:1084, 1105)
  → deriveRadialMenuItems(state)      [radial-ui.ts:25-85]  ← called, transitively
      returns 7 RadialMenuItem[] with hardcoded `active`/`available` booleans
  → .items is stored on radialMenuState — NEVER READ AGAIN

selectRadialMenuItem(menu, index)     [radial-ui.ts:97-123]  ← NEVER CALLED from main.ts
  (grep across main.ts, cc16730: zero matches)
```

### Persistence / replay (the confirmed gap)

```
saveState(storage, state, world)      [storage.ts]
  → payload.state includes rig.tools  ← DOES persist correctly (tested)

recordCommand("rig-tool", {...})      [main.ts:894]
  → appendRunRecordEntry(..., kind: "command", name: "rig-tool", ...)
    → eventMetadata("command", "rig-tool")   [run-record.ts:154-166]
      → isReplayableCommandName("rig-tool") → false (not in
        REPLAYABLE_COMMAND_NAMES, run-record.ts:119-129)
      → DIAGNOSTIC_COMMAND_NAMES.has("rig-tool") → false (run-record.ts:135)
      → replayClass: "non-replayable"          ← THE GAP

validateDeterministicReplay(record)   [replay-validator.ts:354]
  → for each entry:
      if (entry.replayClass === "non-replayable")   [replay-validator.ts:412]
        return result("unsupported-entry", ...)      ← HALTS HERE
```

---

## 3. Item-by-item authority matrix

Legend for "Source": **dead** = only exists in `radial-ui.ts`, never
rendered; **live** = rendered by `rig-tool-projection.ts` via
`renderRadialMenu()`.

| # | Item (brief's naming) | Source | Reachable in live UI? | Availability derived from | `GameState` field | Named command | Validated | Dispatches command | Produces event/diagnostic | Visible sim change | Persists | Replays | Classification |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `winch-spool-in` | dead (`radial-ui.ts:29-36`) | **No** | Local boolean `active: false`, `available: modules.includes("winch")` | None — no spool-tension field exists anywhere | None | N/A | N/A | N/A | N/A | N/A | N/A | **Obsolete — remove.** No corresponding mechanic exists at all (winch is atomic recover-only) |
| 2 | `winch-spool-out` | dead (`radial-ui.ts:37-43`) | **No** | Same as above | None | None | N/A | N/A | N/A | N/A | N/A | N/A | **Obsolete — remove.** Same as #1 |
| 3 | `air-down-tires` | **live** (`rig-tool-projection.ts:56-67`) | **Yes** — keyboard(Q)/touch/click | `wheeled = rig.mobility.kind === "ground"`; `status` derived from `tools.tirePressurePsi <= 16` | `rig.tools.tirePressurePsi` | `set-tire-pressure` → `setTirePressure()` (`state.ts:2808`) | Yes — `clamp(psi, 10, 45)` | Yes (`main.ts:888-901`) | Yes — `state.lastDiagnostic` set | Yes — `toolTractionModifiers` → `stepRigMotion` (proven in test) | **Yes** — `rig.tools` saved, round-trip tested (`rig-tools.test.ts:206-263`) | **No** — `recordCommand("rig-tool")` is `replayClass: "non-replayable"` | **Authoritative but incomplete (P1: replay gap)** |
| 4 | `air-up-tires` | **live** (`rig-tool-projection.ts:68-81`) | **Yes** | Same mechanism, target `DEFAULT_TIRE_PRESSURE_PSI` (32) | `rig.tools.tirePressurePsi` | `set-tire-pressure` → `setTirePressure()` | Yes | Yes | Yes | Yes | Yes | **No** — same gap | **Authoritative but incomplete (P1: replay gap)** |
| 5 | `lock-differential` (brief) / rendered as `cycle-differential` | **live** (`rig-tool-projection.ts:83-95`) | **Yes** | `tools.differentialMode === "open" ? "available" : "engaged"` | `rig.tools.differentialMode` | `cycle-differential` → `cycleDifferentialMode()` (`state.ts:2823`) | Yes — cycles a fixed 3-state order, cannot land outside it | Yes | Yes | Yes — proven via steering-radius test (`rig-tools.test.ts:122-150`) | **Yes** — tested round trip | **No** — same gap | **Authoritative but incomplete (P1: replay gap).** Also a labeling mismatch — see Finding #4 |
| 6 | `fire-seismic-pulse` | dead (`radial-ui.ts:68-75`) | **No** | Local boolean; `available: modules.includes("survey-mast")` | None on `GameState` | None dispatched | N/A | N/A | N/A | `fireSeismicPulse()` exists (`seismic-probe.ts:25-80`), pure, unit-tested, **zero call sites in `main.ts`** | N/A | N/A | **Unreachable.** Real, tested, isolated mechanic with no wiring anywhere |
| 7 | `tune-radio` | dead (`radial-ui.ts:76-83`) | **No** | Local boolean, **hardcoded `active: true` at creation** — the one item that starts "on" and can never honestly be "off" without ever being toggled | None on `GameState` | None dispatched | N/A | N/A | N/A | `deriveRadioSignal()` exists (`radio-scanner.ts:18-66`), pure, unit-tested, **zero call sites in `main.ts`** | N/A | N/A | **Unreachable and misleading if ever surfaced as-is** — see Finding #5 |
| — | `winch` (not in the brief's 7, but the 4th live projection entry) | **live** (`rig-tool-projection.ts:101-108`) | **Yes** — always rendered when applicable | `hasWinch = profile.capabilities.includes("winch")` | `rig.modules` (indirectly) | **`command: null`, always** | N/A | Rendered but permanently disabled | N/A — button cannot be clicked | No | N/A | N/A | **Incomplete (P2).** Correctly reports blocked/available status, but is a dead button forever — see Finding #3 |

---

## 4. Canonical state and command map

| State | Owner | Written by | Read by |
|---|---|---|---|
| `rig.tools.tirePressurePsi` | `GameState` (`contracts.ts:92-99`, `RigToolState`) | `setTirePressure()` (`state.ts:2808`) — the only writer | `deriveRigToolProjections`, `toolTractionModifiers` (physics), `publicState`'s `rigSummary` (`state.ts:1956`, `tools: { ...rig.tools }`), save/restore |
| `rig.tools.differentialMode` | `GameState` | `cycleDifferentialMode()` (`state.ts:2823`) — the only writer | Same as above |
| Radial overlay open/closed | `main.ts` local (`activeOverlay`) | `openOverlay`/`closeOverlay` | Overlay visibility, focus management |
| `radialMenuState.items` / `.selectedIndex` | `radial-ui.ts` local type, held in `main.ts` | `deriveRadialMenuItems` (transitively, on open) | **Nothing.** Dead. |
| Seismic pulse result | Nowhere — `fireSeismicPulse()` returns a value with no owner | N/A — never called outside its own test | N/A |
| Radio signal state | Nowhere — `deriveRadioSignal()` returns a value with no owner | N/A — never called outside its own test | N/A |
| Winch spool tension | **Does not exist anywhere in `GameState` or any module.** `winch-physics.ts`/`winch-pulley.ts` model the winch as a single atomic recovery action (`winchRecover()`, `state.ts`), not a manual spool-in/spool-out state machine | N/A | N/A |
| Fleet-recovery availability | `deriveFleetRecoveryAssessment()` (`fleet-recovery-assessment.ts:97`) — pure, deterministic per its own doc comment | N/A (read model) | `publicState().fleetRecovery` (`state.ts:1982-1984`), `window.recoverStrandedRig` acceptance hook |
| Fleet-recovery command | `resolveFleetRecoveryCommand` / `applyFleetRecovery` (`fleet-recovery-command.ts:79,142`) | `performFleetRecovery()` (`state.ts`) | Only the acceptance hook `window.recoverStrandedRig` (`main.ts:~2500`) — **not wired to the radial wheel or any live player control today** |

---

## 5. Findings ordered by severity

### Finding #1 — P1: rig-tool commands break deterministic replay

**File/lines:** `src/main.ts:894` (the recording call);
`src/game/run-record.ts:119-129` (`REPLAYABLE_COMMAND_NAMES`, missing
`"rig-tool"`); `src/game/replay-validator.ts:354-427` (`validateDeterministicReplay`,
halts on `non-replayable`).
**Live call chain:** click a tire-pressure or diff-lock button →
`recordCommand("rig-tool", { tool: tool.id })` → entry stored with
`replayClass: "non-replayable"` → any later `validateDeterministicReplay`
call on that record returns `status: "unsupported-entry"` at that entry and
stops.
**Current player-visible behaviour:** None directly — the player sees the
tool change and the toast, correctly. The break is invisible until someone
tries to replay or verify the run.
**Expected mechanical behaviour:** A replay of a run that used the Pegboard
should reproduce the same tyre-pressure/diff-lock state at the same tick and
continue verifying checkpoints, exactly as `installModule` (a directly
comparable "set a persistent rig attribute" command) already does.
**Canonical-state ownership:** Correct already — `rig.tools` is the single
source of truth, mutated only by the two command functions.
**Command/event ownership:** Correct already — `setTirePressure`/
`cycleDifferentialMode` are the sole writers.
**Persistence and replay implications:** Persistence: fine (tested,
round-trips). Replay: broken, as described.
**Existing test coverage:** `rig-tools.test.ts` proves persistence
thoroughly (serialize round trip, real `saveState`/`loadState` round trip,
default-fill for old saves). **No test exercises `validateDeterministicReplay`
with a `"rig-tool"` entry present** — the gap is real and untested, which is
exactly why it shipped.
**Smallest safe correction:** Add `"rig-tool"` to `REPLAYABLE_COMMAND_NAMES`
in `run-record.ts:119-129`, and add a `case "rig-tool":` to
`replayCommand()`'s switch in `replay-validator.ts` (around line 239) that
validates `entry.payload.tool` against the known ids (`"air-down-tires"`,
`"air-up-tires"`, `"cycle-differential"`) and calls the same command
functions the live UI calls (`setTirePressure`/`cycleDifferentialMode`),
mirroring how `installModule` is handled.
**Long-term correction:** Same as the smallest fix — there is no larger
restructuring needed; this is a one-line registration gap in an otherwise
correct pattern, not a design flaw.
**Regression test required:** A `replay-validator` test: record a run that
issues a `rig-tool` command, replay it, assert `status === "verified"` and
that the replayed state's `rig.tools` matches.

### Finding #2 — P2: `radial-ui.ts` is dead code that still looks authoritative to a reader

**File/lines:** `src/game/radial-ui.ts` (entire file, 123 lines);
`src/game/radial-ui.test.ts` (entire file, 28 lines).
**Live call chain:** `main.ts` imports `createInitialRadialMenuState` and the
`RadialMenuState` type (`main.ts:127-129`), calls
`createInitialRadialMenuState(state)` on open (`main.ts:1083-1084, 1105`),
and stores the result in `radialMenuState` — which is then never read. No
other file imports `deriveRadialMenuItems` or `selectRadialMenuItem` (`grep -rn` across `src/` confirms zero call sites for either beyond the module's own test).
**Current player-visible behaviour:** None — this code runs (harmlessly)
every time the wheel opens, computing a full `RadialMenuItem[]` that is
immediately discarded.
**Expected behaviour:** Dead code that a passing reader would reasonably
believe is the live implementation, because it is well-commented and
plausible, and it is *still on the required-inspection list a security/
authority audit is told to check*, exactly as it was for me.
**Canonical-state ownership:** None — that is the problem. It presents
`RadialMenuItem.available`/`.active` as though derived from state, but the
module only receives `state` to check `modules.includes(...)` for two of
seven items; the rest are `true`/`false` constants.
**Player-visible consequence:** None today. Risk is entirely to future
maintainers and to anyone (agent or human) auditing "does the radial wheel
work" by reading `radial-ui.ts` in isolation, as this brief's own suspected-
problem section did.
**Save/reload, replay:** N/A (dead).
**Why existing tests did not detect it as dead:** `radial-ui.test.ts` tests
the module in isolation and passes, truthfully, because the module's *unit*
behaviour is exactly as designed — toggling a local boolean. Nothing tests
whether `main.ts` actually calls `selectRadialMenuItem`. This is the same
class of gap as Finding #1: correct unit tests, no integration proof.
**Smallest safe correction:** Delete `radial-ui.ts` and `radial-ui.test.ts`;
replace the `main.ts` import with a plain `let radialMenuOpen = false` if the
open/close boolean is still wanted as a local UI flag (it currently is not
even used for that — `activeOverlay === "radial"` already tracks open/closed
state; `radialMenuState` can likely be deleted entirely with zero behavior
change, but that should be verified with a type-check + full test run before
committing, since I did not modify code for this audit).
**Long-term correction:** Same as smallest — no larger design work needed,
this is pure removal of superseded code.
**Regression test required:** None needed for the deletion itself (nothing
depends on the deleted exports); re-run `npm run typecheck` and
`npx vitest run` after removal to confirm nothing else imports them
(I did not do this deletion — audit only, per instructions).

### Finding #3 — P2: the `winch` wheel entry is a permanently inert control

**File/lines:** `src/game/rig-tool-projection.ts:101-108` (the projection);
`src/main.ts:879, 888-892` (the disabled expression and click handler).
**Live call chain:** wheel open → `winch` entry rendered with
`status: hasWinch ? "available" : "blocked"`, `command: null` always →
`button.disabled = tool.status === "blocked" || tool.command === null` —
since `command` is always `null` for this entry, **this expression is `true`
unconditionally**, so the button can never be clicked, regardless of
`hasWinch`.
**Player-visible behaviour:** The entry shows correct status text
("available"/"blocked: no winch fitted") but the button is a dead, disabled
control forever. A player who fits a winch sees a Pegboard row that looks
identical in structure to the working tyre/diff rows, but never responds.
**Expected mechanical behaviour:** Either the entry should dispatch
`winchRecover()` when the active rig is itself disabled/needs it, or it
should not present as an actionable row at all (e.g., styled purely as
informational, not inside a `<button>`).
**Canonical-state ownership:** `winchRecover()` already exists, is
validated, produces a diagnostic, is replayable (`tap`/`recover` is in
`REPLAYABLE_COMMAND_NAMES` and handled in `replay-validator.ts:308-310`),
and is already bound to KeyX and the acceptance hook. It is simply not
reachable from this wheel entry.
**Smallest safe correction:** Either (a) give the `winch` projection a real
`command` (e.g., a new `RigToolCommand` variant `{ type: "winch-recover" }`)
dispatched to `winchRecover()` when the active rig's `condition <= 0`, with
`status: "blocked"` and a reason otherwise, or (b) render it as a
non-interactive status row (no `<button>`, or `aria-disabled` informational
text) so it stops looking like a control. Given the product boundary in §10
(the wheel executes immediate machine-local actions), (a) using the rig's
*own* winch for self-recovery — not fleet recovery — is the better fit and
reuses an existing, already-authoritative, already-replayable command.
**Long-term correction:** Same as (a).
**Regression test required:** A test asserting the `winch` projection's
`command` is non-null exactly when the active rig both has the capability
and needs it (condition ≤ 0, matching `winchRecover`'s own precondition).

### Finding #4 — P3: the brief's item name `lock-differential` doesn't match the live entry's id `cycle-differential`, and the label doesn't say "lock"

**File/lines:** `rig-tool-projection.ts:84-95`.
**Description:** The live entry cycles open → limited-slip → locked → open
on every click, labeled `Differential · ${tools.differentialMode}`. This is
correct and arguably better UX than a binary lock toggle (it exposes the
real 3-state mechanic `differential-lock.ts` models), but it means the
brief's premise ("is differential lock decorative?") doesn't map cleanly
onto what exists — there is no single "lock" action, there is a cycle. Not a
defect; flagged because the brief explicitly asked me to verify this item by
its stated name and I want the naming mismatch on record rather than silently
reinterpreted.
**Smallest safe correction:** None required; documentation/brief-writing
note only.

### Finding #5 — P2: `fire-seismic-pulse` and `tune-radio` are real, tested, pure mechanics with zero live wiring — and `tune-radio`'s dead-code default (`active: true`) would misrepresent state if ever reconnected carelessly

**File/lines:** `src/game/seismic-probe.ts:25-80`; `src/game/radio-scanner.ts:18-66`;
`src/game/radial-ui.ts:68-83` (the dead entries).
**Live call chain:** None. `grep -rn "fireSeismicPulse\|deriveRadioSignal" src/main.ts` returns zero matches. Both functions are called only from their
own test files (`seismic-probe.test.ts`, `radio-scanner.test.ts` — both pass,
2 tests each, per the full suite run earlier this session).
**Player-visible behaviour:** Neither mechanic is visible, audible, or
reachable in any way in the current build. There is no HUD cue, no audio
synthesis wired to `deriveRadioSignal`'s output despite the module's own
header comment claiming it drives "Web Audio static and signal pulse
synthesizer" — that synthesizer does not exist anywhere in `main.ts` or
`audio.ts` (checked: no call sites).
**Canonical-state ownership:** Neither has a `GameState` field. Neither has
a command. Both are pure functions awaiting integration.
**Why existing tests did not detect this as a problem:** They are not
supposed to — the unit tests correctly test pure functions in isolation.
Nothing tests (or claims to test) that these functions are reachable from
the player surface, because they aren't meant to be yet; they read as
evidence-lab-style prototype modules, similar in spirit to `physics-lab.html`
per the README's own "Rapier and Box3D are isolated evidence labs, not the
product runtime" framing — except these two have no equivalent "this is a
lab, not a feature" label anywhere.
**Smallest safe correction:** Delete the two corresponding dead entries from
`radial-ui.ts` (moot if Finding #2's whole-file deletion happens). If the
seismic/radio mechanics are wanted as real features later, that is new
scope, not a fix to this audit's findings — do not silently wire them in as
part of closing this report.
**Long-term correction:** If/when these become real features, they need the
same treatment tyre pressure got: a `GameState` field, a command, a
projection entry with a real `command`, and replay-name registration from
day one (learn from Finding #1).
**Regression test required:** None for removal. If wired later, same
pattern as `rig-tools.test.ts`.

---

## 6. Player-trust and UX consequences

- A player who fits a winch, opens the Pegboard, and sees a `winch` row that
  looks like every other row but never responds to a click will reasonably
  conclude the control is broken, not that it was never wired. This is worse
  for trust than an obviously-locked/greyed row with an explanatory reason —
  the tyre and diff rows model the right pattern (status + reason + working
  button when available); the winch row breaks that pattern by looking the
  same but never working.
- Tyre pressure and diff lock are, as far as I can find, **undocumented to
  the player anywhere else** — no control-guidance lesson, no first-use
  prompt references the Pegboard (`control-guidance.ts` and `affordances.ts`
  have zero mentions of "radial," "pegboard," or the tool ids; confirmed by
  direct grep). A mechanically real, well-tested, physics-consequential
  feature is currently discoverable only by a player who presses Q or finds
  the touch button unprompted. This is a missed-opportunity finding, not a
  correctness one — flagged for §14.

## 7. Accessibility and input-parity findings

- **Keyboard:** Full parity — KeyQ opens/closes (`main.ts:1423-1430`), and
  the radial overlay uses the same `focusAfterPaint` focus-entry pattern as
  every other overlay in this file (`main.ts:1099`).
- **Touch:** `#touch-radial-action` button (`main.ts:1535-1541`,
  `index.html:268`) opens it; each rendered tool is a real `<button>` with
  `aria-pressed`/`aria-description`, so touch activation works identically
  to click.
- **Gamepad: no parity.** `grep -n "gamepad" src/game/input.ts` shows
  gamepad input is wired only for steering/accelerate/brake (axis 0, buttons
  6/7) — there is no gamepad button mapped to opening the radial overlay
  anywhere in `main.ts` or `input.ts`. A gamepad-only player cannot reach the
  Pegboard at all. (P2 — should be tracked alongside any future gamepad
  support decision, not necessarily fixed in isolation.)
- **Screen-reader / ARIA:** the overlay itself has `role="dialog"
  aria-modal="true" aria-label="Quick actions"` (`index.html:528-534`); the
  list has `aria-live="polite"` (`index.html:553`); each button carries
  `aria-pressed` and `aria-description`. This is a reasonable baseline. I did
  not run a live screen reader against it (no browser acceptance script
  exists that exercises the radial overlay — see §9), so I cannot confirm
  the announced experience beyond what static markup implies.
- **Visual note:** despite `radial-ui.ts`'s header comment describing "a
  diegetic 360° quick-action menu," the actual rendered control
  (`.radial-menu-list`, `styles.css:1041-1080`) is a plain vertical
  `<ol>` list, not a circular/radial layout. The name "radial wheel" is a
  holdover from the dead module's framing and no longer describes the UI.
  Cosmetic/naming-only; not a defect.

## 8. Persistence and replay findings

Already detailed in Findings #1 and the call graph in §2. Summary:

| Aspect | Status |
|---|---|
| `rig.tools` save serialization | **Correct** — `storage.ts:saveState` includes it via `state`, tested |
| `rig.tools` load/restore | **Correct** — `recoverState` → `recoverToolState`, defaults old saves without `tools`, tested |
| `rig.tools` in `publicState()` | **Correct** — `state.ts:1956`, `tools: { ...rig.tools }`, so it is observable and would hash-compare correctly in a checkpoint if replay reached that far |
| `rig-tool` command replay | **Broken (Finding #1)** — halts replay validation entirely, does not merely diverge |
| `fleet-recovery` tap-action replay (adjacent, not currently wheel-reachable) | **Also broken**, same shape: `window.recoverStrandedRig` records `recordCommand("tap", { action: "fleet-recovery", ... })`, but `replay-validator.ts`'s `tap` switch (`lines 288-311`) has no `case "fleet-recovery"`; it falls to `default: return "tap command has an unsupported action 'fleet-recovery'."`, which is classified `"invalid-payload"` rather than a clean unsupported-entry message. Not player-facing today (acceptance-only hook), but directly relevant to §11's recommendation — wiring fleet recovery into the wheel without fixing this inherits the same defect shape as Finding #1. |

## 9. Current tests and missing tests

**Existing, and genuinely good:**
- `rig-tools.test.ts` (263 lines) — tradeoff physics (both directions), pure
  projection derivation, cost-always-stated invariant, winch-blocked-with-
  reason, no-tyre-entries-on-hoverable-rig, purity (`does not mutate state
  while projecting`), full serialize round trip, full `saveState`/`loadState`
  round trip, old-save default-fill. This is thorough, well-designed test
  coverage for the mechanic itself.
- `radial-ui.test.ts` (28 lines) — correctly tests the dead module's own
  behaviour; not wrong, just testing something nothing calls.

**Missing:**
1. **A replay test for `rig-tool` commands** (Finding #1) — the single most
   important gap; nothing currently proves or disproves replay works for
   this mechanic, and it doesn't.
2. **No browser-acceptance script touches the radial overlay at all.**
   `grep -rln "radial" tools/*.cjs tools/*.mjs` returns zero files. Every
   other major overlay in this repo has some acceptance evidence per the
   prior session's audit; the Pegboard has none. This means there is no
   live-browser proof that `openOverlay("radial")` actually renders, that
   keyboard/touch parity works end to end, or that the ARIA wiring produces
   a sane screen-reader experience.
3. **No integration test asserting `main.ts` actually calls
   `deriveRigToolProjections`/`setTirePressure`/`cycleDifferentialMode` from
   a real click** — `rig-tools.test.ts` tests the functions directly, which
   is correct for unit coverage, but nothing simulates the DOM click path,
   so a regression that disconnects the button's `addEventListener` from the
   command (as effectively happened to the `winch` entry) would not be
   caught.
4. **No test asserting `radial-ui.ts`'s exports are unused** (a "this module
   is intentionally dead, don't resurrect it silently" guard is unusual to
   write but the alternative is exactly this audit having to re-derive
   reachability from scratch).

## 10. Items to remove, disable, relabel, or wire

| Item | Action | Why |
|---|---|---|
| `winch-spool-in` / `winch-spool-out` (`radial-ui.ts`) | **Remove** | No corresponding mechanic exists; not a UI gap, a nonexistent feature |
| `fire-seismic-pulse` (`radial-ui.ts`) | **Remove from the wheel's dead list**; leave `seismic-probe.ts` alone as a standalone, unreached, tested module until/unless it becomes a real feature | Real function, zero wiring, no `GameState` field — not this audit's job to invent the integration |
| `tune-radio` (`radial-ui.ts`) | **Remove from the wheel's dead list**; same treatment for `radio-scanner.ts` | Same as above, plus the `active: true` default is actively misleading if ever reconnected without a fix |
| `radial-ui.ts` module + `radial-ui.test.ts` | **Remove entirely** (Finding #2) | Confirmed dead; keeping it is a trust and audit-cost hazard, not a feature |
| `air-down-tires` / `air-up-tires` | **Keep, wire replay** (Finding #1) | Real, tested, physically consequential; only the replay gap needs closing |
| `cycle-differential` (brief's `lock-differential`) | **Keep, wire replay** (Finding #1) | Same |
| `winch` placeholder entry | **Wire to `winchRecover()`** for self-recovery, or make it a non-button status row | Currently a permanently inert button (Finding #3) |

## 11. Recommended first authoritative radial slice

**Recommendation: do not pick a new slice — finish the one already half-
built.** The brief's candidate (disabled-rig-nearby → fleet-recovery
assessment → radial "Attach recovery strap" → `resolveFleetRecoveryCommand`
→ event → persistence/replay proof) is a reasonable *second* slice, but it
is not the right *first* one, for a concrete reason: **fleet recovery
already has the same replay gap this audit found in tyre pressure**
(§8, the `"fleet-recovery"` tap-action gap), so choosing it first means
fixing two independent replay-registration gaps before any of it is provably
correct, and it requires building new UI-to-command wiring from scratch
(the wheel has no fleet-recovery entry today at all).

Compare the realistic candidates:

| Candidate | New UI needed | New command needed | Replay gap to fix | Net new surface |
|---|---|---|---|---|
| **Finish tyre pressure / diff lock** (recommended) | None — already rendered | None — already exists | 1 (Finding #1, ~10 lines) | Zero — closes an existing slice |
| Wire `winch` entry to self-recovery `winchRecover()` | None — entry already rendered, just attach a command | None — `winchRecover` exists | **Zero** — `tap`/`recover` is already replayable | Small — one command mapping |
| Fleet recovery (brief's candidate) | Yes — no radial entry exists today | No — `performFleetRecovery` exists | Yes (the `"fleet-recovery"` tap-action gap, same shape as Finding #1) | Medium |
| Survey / blade / cargo / camera on the wheel | Yes for all — none currently on the wheel | Varies — survey/blade/cargo have commands; camera does too (`selectCamera`) | Would need per-action `recordCommand` review | Medium-to-large, and none of these are "immediate machine-local actions" in the same sense — survey and cargo are already multi-step activities with their own overlays/HUD, which risks violating §10's product boundary by duplicating an existing surface rather than complementing it |

**Ranked recommendation:**
1. **First:** Close Finding #1 (replay registration for `rig-tool`) — this
   is not a new slice, it is finishing the current one to the acceptance bar
   the rest of the codebase holds itself to.
2. **Second:** Wire the `winch` entry to `winchRecover()` (Finding #3) —
   reuses an already-fully-authoritative, already-replayable command, zero
   new UI, smallest possible increment, and directly fixes a dead button
   players can already see today.
3. **Third:** The brief's fleet-recovery candidate — genuinely the right
   next *new* slice after the above, because it is an existing mechanic
   (`deriveFleetRecoveryAssessment`/`performFleetRecovery` are already pure/
   validated per the prior audit), but it needs its own replay-registration
   fix first and net-new UI, so it should not be first.
4. Survey/blade/cargo/camera: **not recommended for the wheel** at all under
   the stated product boundary (§10) — these already have dedicated,
   working surfaces (primary-action key, mission board, HUD). Adding them to
   the radial wheel too would create the exact "board and wheel disagree
   about the same operation" risk the boundary is meant to prevent, and
   would duplicate rather than complement.

## 12. Minimal implementation sequence

Not performed (audit-only), stated for Pranay's review:

1. `run-record.ts:119-129` — add `"rig-tool"` to `REPLAYABLE_COMMAND_NAMES`.
2. `replay-validator.ts` — add a `case "rig-tool":` in `replayCommand()`'s
   switch (near the existing `installModule` case) that validates
   `entry.payload.tool` is one of the known ids and re-dispatches
   `setTirePressure`/`cycleDifferentialMode` with the same values the
   original command implies. (Note: the *value*, e.g. which PSI, is not
   currently recorded in the payload — only `{ tool: tool.id }` is recorded
   in `main.ts:894`. The replay handler will need to re-derive the target
   value from the id the same way `rig-tool-projection.ts` does, or the
   payload needs to carry the resolved command. Recommend the latter —
   record `{ tool: tool.id, command: tool.command }` — so replay does not
   need to re-derive intent from an id string.)
3. Add the replay regression test named in Finding #1.
4. Delete `radial-ui.ts` and `radial-ui.test.ts` (Finding #2), after
   confirming via typecheck + full test run that nothing else references
   them.
5. Give the `winch` projection entry a real command (Finding #3), gated on
   the active rig's own `condition <= 0`, dispatching `winchRecover()`.
6. Add a browser-acceptance script exercising the radial overlay (open via
   keyboard, open via touch, click a tool, verify toast + visible state
   change + reopen shows updated status) — closing the gap in §9.2.
7. Only after 1-6: consider the fleet-recovery slice (§11.3), including
   fixing its own separate replay gap first.

## 13. Acceptance criteria

1. A recorded run containing a `rig-tool` command replays with
   `status: "verified"`.
2. `radial-ui.ts` and `radial-ui.test.ts` no longer exist in the repo, and
   `npm run typecheck && npx vitest run` pass with no new failures.
3. The `winch` wheel entry either dispatches a real command when available,
   or is not rendered as an interactive `<button>`.
4. A browser-acceptance script proves the wheel opens via keyboard and
   touch, renders the live projection, and a click visibly changes both the
   toast text and the re-rendered row's status.
5. `npx tsc --noEmit` and `npx vitest run` both pass (baseline, already true
   today at `cc16730`; must remain true after the above changes).

## 14. Open decisions for Pranay

1. **Should the `winch` wheel entry do self-recovery (rig's own winch) or
   should it be removed until fleet recovery is wired?** I recommend
   self-recovery (§11.2) because it is the smallest true fix and reuses a
   fully-correct existing command, but "remove until there's something real
   to click" is also defensible if you'd rather the wheel show only entries
   that already do something today.
2. **Should tyre pressure / diff lock get a first-use control-guidance
   lesson**, given they are currently invisible to a player who doesn't
   stumble onto Q or the touch button (§6)? This is scope beyond "fix the
   wheel," but the mechanic being real and well-tested and undiscoverable
   feels like a gap worth naming even though it wasn't explicitly asked.
3. **Timing relative to the read-model/command-boundary audit's own open
   items** (this session's earlier report) — the `radial-ui.ts` deletion and
   the `rig-tool` replay fix are both small and independent of that report's
   findings, but if you want one coordinated cleanup pass across both
   reports' P1/P2 items, say so and I can scope that as a single follow-up
   task rather than two.
4. **Gamepad parity for opening the wheel (§7)** — is gamepad support a
   real target for this project at all right now, or is the existing
   steer/accelerate/brake-only gamepad wiring itself provisional? If
   provisional, this finding can be deferred indefinitely without
   contradiction.

## 15. Exact commands run and their results

All commands were run against the committed content at `cc16730` (pinned via
`git show cc16730:<path>` for the specific files this audit depended on, per
§0's methodology note) unless noted.

```bash
git log -1 --format='%H %cd' --date=iso
# cc16730... 2026-07-28 23:15:37 +0530

git show cc16730:src/main.ts | wc -l
# 2718

grep -n "deriveRadialMenuItems\|selectRadialMenuItem\|radialMenuState\." \
  <(git show cc16730:src/main.ts)
# zero matches for any field access or either function call — confirms
# radial-ui.ts's core exports are dead code in the committed head

grep -n "radial" tools/*.cjs tools/*.mjs
# no output — no browser-acceptance script touches the radial overlay

grep -n "gamepad" src/game/input.ts
# only accelerate/brake/steer axis/button reads — no radial/menu binding

grep -rn "fireSeismicPulse\|deriveRadioSignal" src/main.ts
# no output — neither function is called from the live game
```

Full project-level verification (`npx tsc --noEmit`, `npx vitest run`) was
already run earlier in this session, against the same `cc16730` head, before
this task began: **0 typecheck errors; 69 test files / 410 tests passed, 0
failed.** I did not re-run the full suite a second time for this audit since
no source files were touched between then and now (only this report and the
prior one were written); re-running was also constrained by the host disk
running out of space mid-session (§0). If Pranay wants a fresh full-suite run
for this specific commit, it should be re-run once the concurrent heavy
session and disk pressure have settled, since the working tree (distinct
from the audited commit) is under active, large-scale modification and a
full-suite run right now would exercise that in-flight code, not the audited
state.

---

## Appendix: correcting myself mid-audit

Finding #3 originally read, in an earlier draft of this reasoning, as "the
winch button shows a false 'already set' message" — implying a live,
clickable, misleading control. Re-checking the actual `disabled` expression
(`main.ts:879`) showed the button is unconditionally disabled whenever
`command === null`, which is always true for this entry, so that toast can
never actually fire. I corrected the finding before writing it here rather
than leaving the more alarming (and wrong) version in place — the real
defect is narrower (a permanently inert button, not an active lie), and that
distinction matters for how urgently Finding #3 should be prioritized
against Finding #1.
