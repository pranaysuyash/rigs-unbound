# Progression Browser and Build Gate

Date: 2026-07-28  
Status: Open verification gate  
Related: [Progression contract review](PROGRESSION_CONTRACT_INTEGRATION_ISSUE_REVIEW_2026-07-28.md), [master tracker](../plans/MASTER_EXECUTION_TRACKER.md)

## Current evidence

- `npm run typecheck`: passed.
- `npx vitest run`: 65 files, 383 tests passed after the first-rung contract reconciliation.
- `node tools/first-cut-browser-acceptance.cjs`: 6/6 steps passed with zero console errors on canonical port 4173.
- The comprehensive `node tools/rig-lab-browser-acceptance.cjs` reached the touch path but remains open at a later shell assertion: `Field 02 welcome plate should be visible` at `tools/rig-lab-browser-acceptance.cjs:1052`.
- `npm run build`: blocked before bundling by unused radial-menu symbols and locals in parallel `src/main.ts` work.

## Changes in this slice

- First meaningful module fit now sets the mandatory first-rung completion flag while preserving `first-cut` as optional contextual guidance.
- The first-cut acceptance allowlist recognizes the live tractor-rust token.
- Control lessons no longer intercept touch controls; the touch-control layer is above the non-modal lesson.
- The browser harness retries a booting `render_game_to_text` bridge and emits diagnostics for lesson-gate timeouts.

## Remaining closure

1. Reproduce the `Field 02 welcome plate` failure from a fresh canonical server and classify whether it is a shell regression or harness state/setup issue.
2. Reconcile the radial-menu symbols in `src/main.ts` with the existing `index.html` markup so `npm run build` passes without deleting intended functionality.
3. Rerun the comprehensive browser harness and record desktop, touch, save/reload, and zero-console evidence.
4. Keep the XP policy prototype sequenced after these campaign gates; no XP fields belong in the current capability `ProgressionState`.

## Addendum (2026-07-28) - Gate closed

The previously open browser/build items are closed by current evidence. `npm run build` passed after radial menu wiring, and the canonical `node tools/rig-lab-browser-acceptance.cjs` run passed on port 4173 with first-rung desktop/touch, save/reload, keyboard/mouse/touch recovery, radial controls, replay, relay, camera/readability, and zero console problems. The final code gate also passed: `npm run typecheck && npx vitest run` reported 65 test files and 383 tests passing. The touch acceptance driver was hardened with a bounded 300-step Home Silo arrival budget and independent disabled-state fixtures for mouse and touch recovery; these changes affect acceptance isolation, not campaign rules.

Evidence tier: Tier 3 integration plus Tier 4 browser/manual surface. Representative WebGPU hardware evidence remains a separate D1 item; this gate used the current WebGL fallback path and does not claim WebGPU device acceptance.
