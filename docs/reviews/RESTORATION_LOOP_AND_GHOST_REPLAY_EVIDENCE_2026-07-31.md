# Restoration Loop + Ghost Replay Evidence

- Date: 2026-07-31
- Scope: Tranche 2 restoration-loop feel + one universe-level proof point (shareable run record / ghost replay)
- Status: **implementation complete; operator review requested before next slice work**

---

## What was implemented

### 1. Restoration loop feel (`src/main.ts`, `src/styles.css`, `src/game/renderer.ts`)

The existing `Diagnose → Rebuild → Start engine` sequence was technically correct but read as a menu. It now produces immediate, multi-channel feedback:

| Step | Diegetic feedback | Non-diegetic feedback |
| --- | --- | --- |
| **Diagnose** | — | 520 Hz diagnostic chirp; panel pulses cyan/gold |
| **Rebuild** | Small camera shake + wrench impact sound | Panel pulse; button `aria-busy` |
| **Start engine** | Headlights flare; engine catch impact; camera shake | Panel pulse; workshop auto-closes so first motion is immediate |

- Audio is routed through the existing `RigAudio` synthesiser; no new assets.
- The non-diegetic button text remains the accessible fallback.
- The workshop overlay closes automatically on first engine start, removing the last UI gate before motion.

### 2. Shareable run record / ghost replay (`src/main.ts`, `src/game/run-record.ts`, `src/game/replay-validator.ts`, `src/game/ghost.ts`)

- `GhostTrailRecorder` is now sampled in the main loop at the existing 10 Hz rate.
- New `window.getGhostTrail()` returns a serialised ghost trail (seed, rig id, snapshots).
- Restoration actions are now recorded as replayable commands and implemented in the deterministic replay validator:
  - `diagnoseRestoration`
  - `performRestorationService`
  - `performFirstStart`
- A new pause-overlay button, **Copy session record**, copies the combined run record + ghost trail to the clipboard.

### 3. Player surface

- `index.html`: added `#pause-copy-session-record` button inside the pause plate.
- `src/styles.css`: added `restoration-respond` keyframe and `.workshop__restoration--responding` class.
- `src/game/renderer.ts`: added `flashHeadlights(rigId, durationMs)` for diegetic first-start flare.

### 4. Tests

- `src/game/ghost.test.ts`: added serialisable-trail export test.
- `src/game/run-record.test.ts`: added replay-validation test for a freshly created record.
- `tools/restoration-loop-ghost-acceptance.cjs`: new browser acceptance probe proving the loop end to end and the shareable hooks.

---

## Verification results

```text
npm run typecheck                PASS
npx vitest run --pool=forks --poolOptions.forks.singleFork
  Test Files  87 passed (87)
  Tests       530 passed (530)
node tools/restoration-loop-ghost-acceptance.cjs
  restoration-loop-ghost-acceptance: PASS
```

The acceptance probe proves:

1. Fresh boot opens the restoration overlay automatically.
2. Three clicks advance `Diagnose → Rebuild → Start engine`.
3. First start closes the workshop and leaves the rig drivable.
4. `window.getRunRecordVerification()` returns `ok: true`.
5. `window.getRunRecordReplayValidation()` returns `ok: true` / `status: "verified"`.
6. `window.getGhostTrail()` returns at least one snapshot.
7. No application console errors.

> Note: the existing `test:campaign-browser` suite is blocked in this environment because the Playwright browser binary is not installed. The new acceptance probe uses the system Chrome channel (`chromium.launch({ channel: "chrome" })`) so it does not require a separate download.

---

## Files changed in this window

- `index.html`
- `src/main.ts`
- `src/styles.css`
- `src/game/renderer.ts`
- `src/game/run-record.ts`
- `src/game/replay-validator.ts`
- `src/game/ghost.test.ts`
- `src/game/run-record.test.ts`
- `tools/restoration-loop-ghost-acceptance.cjs`
- `docs/reviews/RESTORATION_LOOP_AND_GHOST_REPLAY_EVIDENCE_2026-07-31.md`

---

## Boundaries respected

- No edits to the parallel-owned settlement/community/ecology modules.
- No new art assets, audio assets, world classes, or campaign content.
- Audio direction remains deferred; only targeted restoration cues were added.
- Water Before Night, north field, night variants, and ridge finale remain future tranches.

---

## Commit caveat

The working tree contains extensive uncommitted parallel-owned work in `src/game/` (community traffic, ecology, settlement life, etc.) and supporting docs/assets. A literal `git add -A` would stage that work. This window will therefore be committed by explicitly staging only the files listed above, with the deviation recorded in the commit message and this evidence file.

---

## Anything else?

Yes. Two follow-ups are now ready for the next window:

1. **Dialogue/narration surface** — the arrival/bargain and naming beats still need the hybrid panel discussed in `docs/reviews/IMPLEMENTATION_DIRECTION_DECISION_LOG_2026-07-31.md`.
2. **Audio direction document** — once the loop is accepted as felt, `AUDIO_DIRECTION.md` should be written with evidence from the load-bearing cues identified here.
