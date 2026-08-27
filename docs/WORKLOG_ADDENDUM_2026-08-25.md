# Worklog Addendum — 2026-08-25

Session role: gameplay-evaluation follow-up (retry of failed 2026-08-23
evidence gathering). Canonical record:
`docs/reviews/GAMEPLAY_LONG_GAME_EVALUATION_2026-08-23.md` §Addendum.
Compressed tracker record appended to `docs/plans/MASTER_EXECUTION_TRACKER.md`.

## Entries

1. **Image analyzer retries succeeded** (fresh CDN URLs after Read re-upload).
   Stage 6 farm-day verdict: "100% a prototype/tech demo" (inconsistent art
   direction, spreadsheet UI, visible debug text; captured under the
   performance safeguard). Stage 5 night-threat verdict: threat is purely
   textual — no storm atmosphere, placeholder lighting, UI dominates, "zero
   tension." Both corroborate the 2026-08-01 feel audit three weeks and two
   visual overhauls later.

2. **Port-4173 squatter incident (×2, diagnosed and resolved).** A
   `python -m http.server` serving `~/Projects/pdf_editor` (spawned by a
   `.workbuddy-ai` tool; PIDs 8334 then 21405, the second respawned after the
   first was killed) held `127.0.0.1:4173`, making
   `start-canonical-dev-server.cjs` report healthy ("already responding")
   while every acceptance script failed at bootstrap with a misleading
   90-second timeout (`/src/main.ts` → Python 404). Killed both squatters
   (per AGENTS.md canonical-port rule; trivially restartable static servers);
   Vite (PID 95519) verified sole owner; `/src/main.ts` returns the JS
   transform. **Operator note:** the `workbuddy-ai` static server from
   `pdf_editor` may respawn on 4173 again; if acceptance fails at bootstrap,
   run the hardened launcher — it now names the squatter.

3. **Hardened `tools/start-canonical-dev-server.cjs`.** Health check no
   longer accepts any port responder: probes `GET /src/main.ts`, requires a
   JavaScript transform containing the `render_game_to_text` marker. On a
   non-canonical responder it prints `lsof` port-owner evidence + the kill
   command and exits 1 (never kills unknown processes itself). Verified:
   healthy path ("already healthy… canonical Vite transform", exit 0).

4. **Acceptance-integrity finding (material).** The complete-slice
   acceptance's Steps 6–7 read `firstNightThreatResolved`,
   `openWorldPromiseFinaleRevealed`, and `obstacles` from
   `render_game_to_text()` — fields that do not exist in the observability
   contract (`publicState` never exposes them) — with `?? false` fallbacks
   and `pass: x !== null`. The GD-03 night threat and GD-02 finale had never
   been browser-verified; the GD-05 "browser acceptance PASS" board evidence
   overstated coverage for exactly those two beats.

5. **Runtime verified live — new reusable probe
   `tools/probe-night-beat.cjs` (PASS).** Fresh save → real player path
   (salvage → restoration through the workshop → `recordWaterworksChoice`) →
   forced night via `window.advanceTime` (38 ticks, day→night) → authored
   threat diagnostic landed: "The storm has found the farm on its own
   tonight, same as any valley's." (`first-night-threat.ts:101`). The
   runtime is sound; the harness was the broken part. This is the first
   browser-layer verification of the night beat.

6. **Made the slice harness truthful.**
   `tools/complete-slice-browser-acceptance.cjs`: Step 6 now drives night and
   asserts the authored diagnostic (verified live in the re-run); Step 7 now
   fails honestly — named follow-ups: (a) add the sunken-relay contract
   completion step so the finale can fire, (b) expose
   `firstNightThreat`/`openWorldPromise` in `render_game_to_text()`. Tools
   documented in `tools/README.md`.

7. **Live regression logged (not fixed — `src/game/` boundary).** The
   complete-slice run also fails its console gate on
   `THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated` warnings (×2),
   introduced by the AAA Stage 2 shadow work in `renderer.ts` and uncaught
   because the full slice acceptance was not re-run after the visual
   overhaul. **Complete-slice acceptance is currently red on the working
   tree.** Fix is a one-liner (`PCFShadowMap` or current API name) — held for
   ownership clearance.

8. **Gates.** All tool changes verified by live execution (launcher healthy
   path; probe PASS end-to-end; patched acceptance runs to its honest Step 7
   failure with all prior steps passing). No TypeScript touched, so
   typecheck/vitest scope is unchanged from the standing tree state.

9. **Boundaries held.** No `src/game/` edits; no git write actions.

Not committed; no git write action taken.

---

## Session 3 (2026-08-25, later): commit/push of parallel visual work + refactor planning

1. **Gitignore updated.** Added `.playwright-mcp/` and root
   `.codex-visual-polish-*.png` debris patterns; classified all untracked
   artifacts before `git add -A` (evidence PNGs and docs justified for
   tracking; logs/session state excluded).
2. **Full gate run.** `npm run verify:head` initially failed prettier on 4
   files; ran `npm run format` (whitespace-only, no semantic change to the
   parallel-owned `src/game/` files) and re-ran: full chain green.
3. **Committed and pushed** as `5e6790f` (Stage 3–6 visuals, tools, docs,
   evidence sets; trailers + 19/19 section attestation with diff-aware
   evidence) and `586c45f` (hook-rendered motto review artifact). Tree clean.
4. **Large-file refactor plan published**
   (`docs/plans/LARGE_FILE_REFACTOR_EXECUTION_PLAN_2026-08-25.md`): live-truth
   re-verification of the 2026-08-21 evaluation, per-file verdicts
   (renderer decompose / state defer / main defer), seven-presenter extraction
   order, zero-loss preservation contract, regression matrix, and blockers P1
   (PCFSoftShadowMap red acceptance fix) and P2 (ADR-0054 sign-off). Tracker
   addendum updated. No implementation performed; statuses unchanged.

## Entry — operator-cleared execution (same date, later session)

10. **Operator standing direction applied** ("everything should be done long
    term, first principles, doctrine aligned") — treated as `src/game/`
    clearance for the two named follow-ups. Parallel-stream state first
    verified: ADR-0054 renderer decomposition units 1–6 and the PCFSoftShadowMap
    fix (`857ba28`) already committed; prior session's tools/docs committed in
    `5e6790f`.
11. **Observability contract extended** (`src/game/state.ts` publicState):
    now exposes `firstNightThreat` (status/variant/resolvedAtWorldMinutes),
    `openWorldPromise` (status/revealedAtWorldMinutes), and `campaignProgress`
    (causewayReopened, waterworksChoice). New contract tests
    `src/game/public-state-slice-contract.test.ts` (3) pin the shape.
12. **Probe upgraded** to assert the resolved state, not just the diagnostic.
    Third python-squatter respawn (PID 58670) raced and cleared; probe PASS:
    `firstNightThreat.status=resolved variant=storm-pressure`.
13. **Harness Step 7** updated: precondition readout via real fields; single
    remaining gap named (sunken-relay cargo-delivery step). Gates:
    `npm run typecheck` clean; `npx vitest run` 735/735.
    Not committed; no git write action taken.
14. **Relay-step mechanics traced and baked into the harness** (Step 7
    comment): preconditions, assignment shape (missionId===null), and the
    completeSettlementCargoDelivery path. Implementation + verification run
    is the next session's first move; not half-landed unverified.

## 2026-08-27 (session 2) — Wave 1 fleet wiring begins

15. **Crawler integration landed** (`9379cff`): authored snow-crawler
    factory wired into the renderer parts factory; observability slice,
    capture harness, workbench v5 evidence, and doctrine copies all pushed
    after full gates (typecheck clean, vitest 742/742). Port-4173 python
    squatter respawned a fifth time (PID 17749); killed per canonical-port
    doctrine.
16. **Wave 1a — spark-dune-runner-02 wired** (template proof for the
    remaining ten parked factories): factory wheels converted to named
    kernel-consumable spin pivots (`duneRunnerWheelPivots`, physics order
    FL/FR/RL/RR), visible axis markers added (`front-marker` bull-bar,
    `rear-marker` tow hitch); renderer adapter reparents factory wheels
    under blockout-positioned steering columns with hub compensation so
    kernel yaw and suspension travel move the visible tyres; spin scale
    read from blockout mounts.
17. **Shared generic review surface** added at
    `assets/workbench/shared/rig-review.html` (`?rig=<workbench-id>`,
    window key `rigReview`) so every remaining Wave-1 rig gets evidence
    captures without a bespoke review page. Dune-runner v1 captures taken
    through it (front-three-quarter, side, rear-three-quarter; zero console
    errors).

## 2026-08-27 (session 2, cont.) — Wave 1b: three more rigs wired

18. **Wave 1b complete** — torque-field-cutter-02, heavy-utility-tow-
    recovery-01, harvester-combined-cultivator-01 all render through their
    authored factories. Each factory gained named kernel-consumable spin
    pivots + axis markers; the four adapters were consolidated into a shared
    `createAuthoredWheeledRig` helper (blockout-authoritative columns, hub
    compensation, per-rig marker names + shell tint). Utility-tow keeps its
    6x6 identity: four simulated contacts map to kernel columns, cosmetic
    middle axle stays visual-only. Harvester duals ride one pivot per side.
19. **Evidence**: v1 neutral-lighting captures for cutter, utility-tow
    (v2-shared), harvester via the shared review surface; zero console
    errors. Gates: tsc clean; vitest 743/743.
