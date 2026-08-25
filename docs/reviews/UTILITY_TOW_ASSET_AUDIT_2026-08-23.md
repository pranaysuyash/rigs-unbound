# Utility Tow Asset Audit — heavy-utility-tow-recovery-01

- **Date:** 2026-08-23
- **Role:** Real-Time 3D Asset & Spatial Interaction Technical Artist
- **Doctrine:** Operating Doctrine v6.1 — truth labels (Observed / Verified / Inferred / Proposed / Contested), evidence tiers 0–5, test sensitivity S0–S3, action levels L0–L3
- **Scope:** one asset lane, end to end — reference corpus, runtime wiring, authored factory, dimensional binding, before/after evidence, and the task list that follows from the findings
- **Out of scope / untouched:** `src/game/` (parallel-owned runtime; never edited this session), git write actions (none taken)

---

## 1. Target selection

**Observed.** The workbench has exactly two object-first asset lanes: `field-plough-01` (complete through review harness) and `utility-tow-recovery-01` (intake complete, authored factory started, stalled). The tow rig is the richer audit target:

- richest reference set in the repo: concept, details, and orthographic plates (`assets/generated/rig_concepts/heavy_utility_tow_recovery_01_{concept,details,orthographic}.png`) plus an isolated object-reference plate and its generation prompt
- an authored factory existed (`assets/workbench/utility-tow-recovery-01/authored/createUtilityTowModel.ts`) but predated the rig's admission into `RIG_PROFILES` — it was authored against guessed dimensions
- the runtime renders it through the generic candidate proxy (`createCandidateRig`), so the gap between authored work and runtime reality is maximal here

## 2. Reference corpus and the dimensional contest

**Observed.** Four sources describe this rig's dimensions, and they disagree:

| Source | track | wheelbase | wheelRadius | rideHeight | topSpeed | turnRate |
|---|---|---|---|---|---|---|
| `src/game/contracts.ts:350-370` (`RIG_PROFILES`) | 3.00 | 4.20 | 0.85 | 1.10 | 14 | 1.1 |
| `docs/design/rigs/specs/heavy-utility-tow-recovery-01.md` §1 | 2.80 | 4.20 | 0.65 | 0.85 | 18 | 1.8 |
| `detail-inventory.json` derivedEnvelope | 2.80 | 4.20 | 0.65 | 0.85 | — | — |
| authored factory literals (pre-refinement) | 2.50 | 4.0 (axles ±2.2/1.8) | 0.55 | — | — | — |

**Verified.** `RIG_PROFILES` is the simulation authority: the kernel consumes it, `rig-blockout.ts` derives all proxy geometry from it, and `docs/design/rigs/RIG_DESIGN_SYSTEM.md` §1 mandates "Strict Dimensional Alignment" of specs to profiles. The design spec and the inventory carry the stale pre-admission numbers.

**Contested → resolved.** The design spec's role is now to describe FORM and identity, not dimensions; the envelope tool (`tools/derive-rig-asset-envelope.ts`) is the sole dimensional hand-off. This session derived and committed the binding file: `assets/workbench/utility-tow-recovery-01/rig-envelope.json` (GROUND frame). Binding rule, per the field-plough precedent: **the reference plate supplies FORM; RIG_PROFILES supplies DIMENSIONS.**

### Reference decomposition status

**Observed (limitation).** Direct pixel analysis of the three rig-concept plates did not happen this session: the non-spark image analyzer's 5-hour quota was exhausted (reset 19:36 same day) and the spark-backed analyzer is excluded by operator instruction. The "as imagined" decomposition was instead built from Tier 1/2 authored descriptions of those plates — the generation prompt (`utility-tow-recovery-01-object-reference-2026-07-29.prompt.md`), the design spec §3, and the detail inventory:

- **Primary forms:** compact two-axle-in-reference / 6x6-in-sim recovery truck; heavy stance, weight over the rear bogie; long flat deck; cab over front axle.
- **Secondary forms:** square-jawed cab with window grilles and amber roof beacon; 2-stage telescoping bone-enamel boom with hinge pivot and hydraulic lift cylinder; winch spool with visible cable; outriggers behind the rear bogie; push bumper with twin tow loops; side service drawers.
- **Tertiary marks:** yellow/black hazard striping on the rear bumper, "15T HOIST"-class stencils (texturing pass — deliberately deferred, not modeled as geometry), rust and wear at frame joints.
- **Materials:** weathered industrial orange cab `#da5a1b`; bone enamel `#e0e4e8`; dark chassis steel `#222629`; hydraulic chrome `#d0d5dd`; rubber `#1a1c1e`; glass `#88c4dc`; amber emissive beacon; steel cable `#808588`; hazard yellow `#f2c230`.

Pixel-level verification of silhouette proportion against the plates is a listed open task (§7, T-3).

## 3. Runtime wiring audit (independently verified by Codex CLI, read-only)

**Verified** (Codex session `01a00eee`, 2026-08-20; line anchors re-checked against the working tree):

1. **Rig interaction is command/distance-based, not mesh-raycast.** Selection goes through `state.ts:1888-1904` / `1927-1978` and `window.selectRig` (`main.ts:3582-3586`); `replay-validator.ts:257-264` binds commands the same way; `scene-query.ts` raycasts only for camera obstruction; `collision.ts` is movement contact math with a role policy. **Consequence:** visual refinement of this asset cannot break picking, commands, or collision. The lane is safe to iterate without runtime ownership.
2. **The authored factory is NOT wired into runtime.** `renderer.ts:64` imports only the field-plough factory; lines 948-951 dispatch tractor/buggy/skimmer bespoke and everything else to `createCandidateRig` (rust BoxGeometry hull + bone boxes + `buildWheels`). The tow rig currently renders as the generic candidate proxy in-game.
3. **Swap-in break points, when wiring eventually happens** (all in parallel-owned `src/game/` — listed as tasks, not executed): wheel order contract (`animation.ts:303-333`), module visuals (`renderer.ts:4451-4463`), `rig-module-visual-acceptance.cjs:239/246/309`, hood camera socket (`camera.ts:136`, `renderer.ts:4402`), state shell (`renderer.ts:441-449, 4441-4449`), `rig-lab-browser-acceptance.cjs:1652/1860`.
4. **P1 runtime defects in the blast radius (pre-existing, not caused by this session):** the 6x6↔4-simulated-wheels contract gap (visual identity says six wheels, `WHEEL_LOCAL_SIGNS` at `contracts.ts:~785-790` simulates exactly four); front/rear marker collapse (`renderer.ts:4465-4466` — both markers alias the hull mesh).

## 4. Authored-factory drift audit and refinement

**Observed (before).** The pre-refinement factory drifted 17–41% from the derived envelope on every load-bearing dimension:

| Binding | Envelope (derived) | Factory (before) | Drift |
|---|---|---|---|
| Simulated wheel x | ±1.500 | ±1.25 | −17% |
| Front axle z | +2.100 | +1.8 | −14% |
| Rear axle z | −2.100 | −2.2 | +5% |
| Front tyre radius | 0.765 | 0.55 | −28% |
| Rear tyre radius | 0.935 | 0.55 | −41% |
| Tyre width | 0.765 / 0.935 | 0.42 | −45% |
| Hull/deck footprint | 3.15 × 5.88 | deck 2.4 × 4.0 at y 0.6 | below hull slab |
| Boom pose | raised (spec: telescopic recovery boom) | rotation sign dipped the arm **below** horizontal toward the rear axle | wrong sign |

**Verified (after).** The refined factory (`createUtilityTowModel.ts`, rewritten this session) is bound to a single exported `UTILITY_TOW_ENVELOPE` constant block generated from the envelope JSON, and the drift-guard test imports `rig-envelope.json` directly:

- four simulated wheel nodes named exactly `wheel-front-left/right`, `wheel-rear-left/right`, at (±1.5, r, ±2.1), tyre radius/width = envelope values, centre at y = radius (ground contact exact), `userData.simulationWheelIndex` bound to 0–3
- the two middle-axle wheels (`wheel-mid-*`, z −0.85) carry `simulationWheelIndex: null` — 6x6 visual identity preserved, with the simulated pair landing on the rearmost axle so the kernel-animated contacts coincide with real tyres
- chassis rails/deck authored inside the derived hull volume; deck top at hull top 1.485; deck narrowed to 2.1 m between the wheel wells (tyre inner faces ±1.03) plus a full-width rear step plate — the previous full-width deck would have clipped through the 0.935-wide rear tyres
- push bumper, twin tow loops, and rear hazard bumper all inside root half-depth 3.035
- spec identity kit added: window grilles, mirrors, beacon bar, winch drum with flanges, outriggers with stowed/deployed poses, service drawers, fuel drum + chain locker, alternating hazard stripes (geometry, not texture), ground-decal contact shadow at envelope lift 0.04
- the boom rotation sign was corrected: a rearward (−Z) arm needs **positive** X rotation to raise; the inherited negative sign pointed the boom down into the rear axle (caught by the new pose test, fixed in factory)

**Verified.** Drift guard: `npx vitest run assets/workbench/utility-tow-recovery-01/authored/createUtilityTowModel.test.ts` → 4/4 pass, including envelope-imported wheel assertions and deployed-pose ground-contact checks. Envelope freshness: `npx vite-node tools/derive-rig-asset-envelope.ts heavy-utility-tow-recovery-01 --check …/rig-envelope.json` → exit 0.

## 5. Evidence

All captures on the canonical dev server (port 4173) via headless Playwright chrome; capture tools are reusable, stored in `tools/`:

- **In-game "before" (runtime candidate proxy):** `assets/workbench/utility-tow-recovery-01/review/ingame-before/{chase,side,survey,top-down}.png` + `capture-state.json` (zero console problems; rig switch via `window.selectRig` succeeded). Tool: `tools/capture-utility-tow-ingame.cjs`.
- **Workbench "before" (authored factory, pre-refinement):** `…/review/{front,rear}-three-quarter-neutral-before.png`, `side-neutral-before.png`, `boom-close-up-neutral-before.png`, `front-three-quarter-grazing-before.png`. Tool: `tools/capture-utility-tow-review.cjs`.
- **Workbench "after":** same five viewpoints, `*-after.png` + `browser-review-state-after.json` (zero console errors).
- **Review harness (new):** `…/review/index.html` + `main.ts` — `window.utilityTowReview` surface with 4 named viewpoints, neutral/grazing lighting, reference plate panel.
- **Full gate:** `npm run typecheck` → clean; `npx vitest run` → **112 files / 732 tests passed**, exit 0.

**Inferred (operator checkpoint).** The PNGs are captured and console-clean but human-verified review of the before/after pair is the operator's call — the visual-parity review step of the field-plough pipeline, reproduced here as a pending sign-off rather than assumed.

## 6. Session incidents worth keeping

- `node_modules` was corrupted (vite `dist/` empty, then rolldown missing) — fixed by `rm -rf node_modules && npm ci`; the canonical server then started cleanly.
- `waitUntil: "networkidle"` hangs forever on dev-server pages (vite HMR keeps the network busy) — the review-capture tool now uses `domcontentloaded`; this likely explains historical flakiness in similar scripts.
- A zombie vite from a previous session held port 4173 without answering; per the canonical-port rule it was killed and the server restarted via `tools/start-canonical-dev-server.cjs`. No fallback port was used at any point.

## 7. Task list

Runtime tasks require the parallel-ownership collision on `src/game/` to be cleared by the operator before anything in P1 is touched.

**P1 — runtime wiring (blocked on `src/game/` clearance)**

- T-1: Wire `createUtilityTowModel` into `renderer.ts` candidate dispatch (import at :64, dispatch at 948-951), keeping `createCandidateRig` for rigs without authored factories. Break points in §3.3 all need passing: wheel order contract (`animation.ts:303-333` — the four simulated nodes must animate; the mid pair must not), module visuals, hood socket, state shell, both acceptance scripts.
- T-2: Fix front/rear marker collapse at `renderer.ts:4465-4466` (both alias `hullMesh`) — bind markers to actual front/rear reference nodes so length cues read correctly.
- T-3: Pixel-level parity review of the after renders vs the three rig-concept plates (silhouette proportion, material read) — blocked on non-spark analyzer quota; then a `visual-parity-review.json` in the review dir, field-plough style.
- T-4: GLB forge + runtime admission for the refined factory (field-plough path: `assets:build-*` script family), only after T-1/T-3 pass.

**P2 — contracts and docs (unblocked)**

- T-5: Reconcile the design spec §1 table to `RIG_PROFILES` (or re-mark every row as non-normative), and refresh `detail-inventory.json` derivedEnvelope numbers — both currently carry stale pre-admission dimensions.
- T-6: Resolve the 6x6↔4-wheels contract question formally: either document "visual-only third axle" in the rig's design spec (matching this factory's approach) or extend `WHEEL_LOCAL_SIGNS` — a design decision, not a code edit.
- T-7: The stale "no RIG_PROFILES entry" blocker is now resolved in the workbench README (this session); keep the README status current as T-1..T-4 land.

**P3 — polish (unblocked, optional)**

- T-8: Texture-level story marks ("15T HOIST" stencil, rust decals) — deliberately not geometry; needs a texturing pass policy first.
- T-9: `boomExtension`/`boomAngleDeg` poses as named review variants in the harness (`createVariant` already exposed).

## 8. Files changed this session

- `assets/workbench/utility-tow-recovery-01/authored/createUtilityTowModel.ts` — rewritten, envelope-bound
- `assets/workbench/utility-tow-recovery-01/authored/createUtilityTowModel.test.ts` — drift guard (envelope-imported)
- `assets/workbench/utility-tow-recovery-01/rig-envelope.json` — derived binding (new)
- `assets/workbench/utility-tow-recovery-01/review/{index.html,main.ts}` — review harness (new)
- `assets/workbench/utility-tow-recovery-01/review/*.png`, `browser-review-state-*.json`, `ingame-before/*` — evidence (new)
- `tools/capture-utility-tow-ingame.cjs`, `tools/capture-utility-tow-review.cjs` — reusable capture tools (new)
- `assets/workbench/utility-tow-recovery-01/README.md` — status updated, stale blocker resolved
- this document, tracker entry, worklog addendum

No `src/game/` file was edited. No git write action was taken.
