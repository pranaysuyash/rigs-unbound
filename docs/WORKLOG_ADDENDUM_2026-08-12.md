# Worklog Addendum — 2026-08-12

## Rig Design Pipeline, Visual Blueprints & Procedural 3D Factories

- **Objective:** Establish in-project rig design system, specs, visual concept model sheets, orthographic 3D modeling blueprints, detail breakouts, and procedural Three.js factories across all 13 vehicle families in *Rigs Unbound*.
- **Rig Design System & Schema:**
  - Created [`docs/design/rigs/RIG_DESIGN_SYSTEM.md`](../design/rigs/RIG_DESIGN_SYSTEM.md) defining canonical spec fields (`track`, `wheelbase`, `wheelRadius`, `rideHeight`, `mass`), hardpoints, capability verbs, Patchwork Atlas visual rules, and 3D reconstruction prompts.
  - Created [`docs/design/rigs/README.md`](../design/rigs/README.md) tracking 16 catalog entries.
- **Authored Rig Specifications (13 Complete Specs):**
  - `heavy-utility-tow-recovery-01.md`, `heavy-salvage-crane-02.md`, `snow-crawler-expedition-01.md`, `harvester-combined-cultivator-01.md`, `sentinel-mobile-fort-01.md`, `aero-skimmer-survey-01.md`, `aero-cargo-freighter-02.md`, `torque-field-cutter-02.md`, `spark-dune-runner-02.md`, `marsh-dredger-heavy-02.md`, `hauler-road-train-01.md`, `construction-excavator-01.md`, `micro-scout-pipe-crawler-01.md`.
- **Visual Turnaround & Blueprint Assets (24 Assets):**
  - Generated 13 high-resolution 4-view turnaround sheets in [`assets/generated/rig_concepts/`](../../assets/generated/rig_concepts/).
  - Generated 11 orthographic 3D modeling blueprint sheets and component detail breakout sheets in [`assets/generated/rig_concepts/`](../../assets/generated/rig_concepts/).
  - Registered all 26 visual assets in [`assets/asset-manifest.json`](../../assets/asset-manifest.json).
- **Procedural 3D Model Factories & Workbenches (13 Workbenches):**
  - Authored `createUtilityTowModel.ts` & unit test in `assets/workbench/utility-tow-recovery-01/authored/`.
  - Authored `createSnowCrawlerModel.ts` & unit test in `assets/workbench/snow-crawler-expedition-01/authored/`.
  - Authored `createSentinelFortModel.ts` & unit test in `assets/workbench/sentinel-mobile-fort-01/authored/`.
  - Authored `createAeroSkimmerModel.ts` & unit test in `assets/workbench/aero-skimmer-survey-01/authored/`.
  - Authored `createHarvesterModel.ts` & unit test in `assets/workbench/harvester-combined-cultivator-01/authored/`.
  - Authored `createSalvageCraneModel.ts` & unit test in `assets/workbench/heavy-salvage-crane-02/authored/`.
  - Authored `createCargoFreighterModel.ts` & unit test in `assets/workbench/aero-cargo-freighter-02/authored/`.
  - Authored `createDuneRunnerModel.ts` & unit test in `assets/workbench/spark-dune-runner-02/authored/`.
  - Authored `createTorqueFieldCutterModel.ts` & unit test in `assets/workbench/torque-field-cutter-02/authored/`.
  - Authored `createMarshDredgerModel.ts` & unit test in `assets/workbench/marsh-dredger-heavy-02/authored/`.
  - Authored `createRoadTrainModel.ts` & unit test in `assets/workbench/hauler-road-train-01/authored/`.
  - Authored `createExcavatorModel.ts` & unit test in `assets/workbench/construction-excavator-01/authored/`.
  - Authored `createPipeCrawlerModel.ts` & unit test in `assets/workbench/micro-scout-pipe-crawler-01/authored/`.
- **Verification & Pipeline Audits:**
  - `npm run typecheck` passed with 0 errors.
  - `npm test` passed 704 vitest tests across 108 test files + 7 deterministic kernel probe tests.
  - `node tools/assert-player-build-assets.mjs` passed cleanly.
  - `node tools/asset-preflight.mjs` passed (44 entries, 0 errors).
  - `node tools/audit-asset-manifest-coverage.mjs` passed cleanly.
  - `node tools/audit-slice-binding-claims.mjs` passed cleanly (26 modules declared).
- **Git Commit & Remote Push:**
  - Pushed commits `959d492`, `d872bda`, `c7a7344`, and `7749fa7` directly to remote `origin/main`.

## Execution Board GD-02 / GD-03 Resolution & Full Browser Acceptance Suite Pass

- **Execution Board Progress:**
  - Updated [`docs/plans/NEXT_EXECUTION_BOARD_2026-08-12.md`](../plans/NEXT_EXECUTION_BOARD_2026-08-12.md) to mark **GD-02** (Open World Promise Finale Scene) and **GD-03** (Authored First-Night Threat Hazard) complete (`[x]`).
- **Browser Acceptance Suite Fixes & Verification:**
  - Updated `tools/acceptance-helpers.cjs` `restoreOpeningTractor` helper to unhide `#workshop-panel` and `.workshop__restoration` cleanly when switching active rig to `utility-tractor` during opening restoration sequence.
  - Executed full browser acceptance test suite:
    1. `first-cut-browser-acceptance.cjs`: PASS ✓
    2. `open-world-causeway-browser-acceptance.cjs`: PASS ✓
    3. `dialogue-surface-browser-acceptance.cjs`: PASS ✓
    4. `weather-scene-browser-acceptance.cjs`: PASS ✓
    5. `top-down-mode-browser-acceptance.cjs`: PASS ✓
  - All 5 Playwright browser acceptance scripts passed with 0 console errors.
- **3D Blocking & Codebase-Wide Vehicle Integration (All 16 Vehicles):**
  - Extended `RIG_IDS` and `RigId` union in `src/game/rig-ids.ts` with all 13 candidate rig IDs (`heavy-utility-tow-recovery-01`, `heavy-salvage-crane-02`, `snow-crawler-expedition-01`, `harvester-combined-cultivator-01`, `sentinel-mobile-fort-01`, `aero-skimmer-survey-01`, `aero-cargo-freighter-02`, `torque-field-cutter-02`, `spark-dune-runner-02`, `marsh-dredger-heavy-02`, `hauler-road-train-01`, `construction-excavator-01`, `micro-scout-pipe-crawler-01`).
  - Authored physical parameters in `RIG_PROFILES` (`src/game/contracts.ts`) for all 16 vehicle families.
  - Derived 3D blockout geometry & superstructures in `RIG_SILHOUETTES` and `RIG_SUPERSTRUCTURES` (`src/game/rig-blockout.ts`).
  - Integrated procedural 3D model assembly in `createCandidateRig` (`src/game/renderer.ts`).
  - Configured sound profiles (`audio.ts`), hood camera sockets (`camera.ts`), berth locations (`world.ts`), state initialization (`state.ts`), and save recovery.
  - Created `src/game/candidate-rigs-blockout.test.ts` to verify physical profile and 3D blockout geometry invariants across all 16 vehicle families.
  - Executed full Vitest suite (177 tests in focused suite / 723 tests in full repository suite, 0 failures).
  - Executed full 5-suite Playwright browser acceptance test pass (100% PASS with 0 console errors).


