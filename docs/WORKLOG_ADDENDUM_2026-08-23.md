# Worklog Addendum — 2026-08-23

Session role: Real-Time 3D Asset & Spatial Interaction Technical Artist.
Canonical record: `docs/reviews/UTILITY_TOW_ASSET_AUDIT_2026-08-23.md`
(full audit, evidence paths, task list). Tracker addendum appended to
`docs/plans/MASTER_EXECUTION_TRACKER.md`.

## Entries

1. **Asset lane picked and audited** — `heavy-utility-tow-recovery-01`.
   Four-source dimensional contest documented (RIG_PROFILES vs design spec vs
   detail inventory vs factory literals; 17–41% drift on load-bearing dims).
   Codex CLI second opinion (read-only) verified interaction is
   command/distance-based, so visual refinement cannot break picking or
   collision; enumerated runtime swap break points and two pre-existing P1
   defects (6x6 vs 4-simulated-wheels; marker collapse renderer.ts:4465-4466).

2. **Dimensional binding derived** —
   `assets/workbench/utility-tow-recovery-01/rig-envelope.json` via
   `tools/derive-rig-asset-envelope.ts`; `--check` exit 0.

3. **Authored factory refined** — `createUtilityTowModel.ts` rewritten
   envelope-bound: simulated wheels on exact contacts (±1.5, ±2.1, r
   0.765/0.935) with `simulationWheelIndex`; middle axle visual-only 6x6;
   spec identity kit (grilles, beacon, winch, outriggers, drawers, hazard
   bumper, ground decal). Three geometry defects found by the new drift-guard
   test and fixed: inherited boom rotation sign pointed the arm down; rim/hub
   widths overflowed root width; hook overhang exceeded root depth.

4. **Evidence captured on canonical 4173** — in-game before (4 camera modes,
   zero console problems); workbench before/after (5 viewpoints each, zero
   console errors). New reusable tools: `tools/capture-utility-tow-ingame.cjs`,
   `tools/capture-utility-tow-review.cjs`; new review harness
   `assets/workbench/utility-tow-recovery-01/review/`.

5. **Gates** — `npm run typecheck` clean; `npx vitest run` exit 0 (112 files /
   732 tests). Workbench README status updated; 2026-08-11 "no profile"
   blocker marked resolved with binding record.

6. **Environment incidents** — corrupted `node_modules` (empty vite `dist/`,
   missing rolldown) fixed via `npm ci`; `networkidle` identified as
   permanent-hang on dev-server pages (HMR) → capture tools use
   `domcontentloaded`; zombie vite from a previous session freed from port
   4173 per canonical-port rule (no fallback port used).

7. **Boundaries held** — no `src/game/` edits; no git write actions. Open
   tasks T-1..T-9 in the audit doc; pixel-level plate parity review pending
   non-spark analyzer quota.

Not committed; no git write action taken.

## Entry — Gameplay long-game evaluation (separate session, same date)

8. **Long-game evaluation authored** — prompted by operator: "current one
   looks like an experiment lab not a game." Evaluated the whole game across
   the spine, first-playable spec, 2026-08-12 board, three prior audits,
   and live runtime content surfaces. Output:
   `docs/reviews/GAMEPLAY_LONG_GAME_EVALUATION_2026-08-23.md` (Proposed,
   awaiting operator read) + tracker addendum pointer.
   Headline: the lab feeling decomposes into four measurable deficits
   (unproven core-loop feel — GD-18 still open; unstaged presentation;
   demo-scale content; process gating on auditor-verifiable evidence), with
   a three-phase improvement program (feel-first → second horizon → content
   cadence) and process guardrails. Recommends pausing TASK-VFX-01..04 until
   the staging/juice/playtest phase lands. Evaluation only: no `src/game/`
   edits; no git write actions.
