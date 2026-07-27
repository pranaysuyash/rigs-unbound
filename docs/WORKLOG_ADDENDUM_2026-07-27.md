## 2026-07-27 — SIM2 achiever playtest completed; synthesis updated

- Achiever persona completed. Report at
  `docs/reviews/PLAYTEST_SIM2_ACHIEVER_2026-07-27.md`.
- Key findings: strong earn→spend→unlock loop; Lug tyres persist across reloads;
  211 furrows persist on field map; session ruined by field map auto-open loop;
  "Lower the blade" rung never completes; workshop buy is blind; cargo hook-up
  undiscoverable.
- Updated `docs/reviews/PLAYTEST_SIM2_SYNTHESIS_2026-07-27.md` with combined
  findings, the three-port problem (explorer: 4180, achiever: 4173, dev server:
  4174), and contradictions that need a single-port rerun to resolve.

## 2026-07-27 — AGENTS.md created for future agent guidance

- Added `AGENTS.md` at project root with worklog addendum discipline, decision
  register/tracker update rules, parallel runtime ownership boundary, and
  verification-before-completion rules.
- This is the mechanism that lets future agents keep using dated addendums
  instead of inflating `docs/WORKLOG.md`.

## 2026-07-27 — SIM2 synthesis draft started

- Created `docs/reviews/PLAYTEST_SIM2_SYNTHESIS_2026-07-27.md` with the explorer
  findings and placeholders for casual/achiever reports.
- Documented the port-4180 discovery, persistence regressions, and the
  comparison plan against SIM1.

## 2026-07-27 — SIM2 explorer playtest completed; two personas still running

- Explorer persona completed first. Report at
  `docs/reviews/PLAYTEST_SIM2_EXPLORER_2026-07-27.md`.
- Key findings: the live build served on port **4180**, not 4174; strong
  terrain-decides thesis and atmospheric gloaming; regressions in persistence
  (save rollback, spawn-into-water, furrows invisible), hood camera occlusion,
  and tutorial tip repetition.

## 2026-07-27 — first-rung test regression noted

- `npx vitest run` now shows 1 failure in `src/game/first-rung.test.ts`
  (`shows sight-destination when affordable rig is within sight radius of Long
  Furrow` returns `attempt-route` instead of `sight-destination`).
- This is in the parallel-owned runtime tranche (`src/game/first-rung.ts`); no
  agent edits were made to that surface in this pass.

## 2026-07-27 — Parts/Favor economy spec drafted

- Added `docs/exploration/PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md` as a
  proposed spec for the two under-specified progression axes named in ADR-0018.
- Defines Parts as concrete inventory with provenance/condition/traits and Favor
  as non-spendable relationship state; maps first-playable loops, constraints,
  and validation hypotheses without claiming operator acceptance.

## 2026-07-27 — product vision ADR drafted

- Added `docs/decisions/ADR-0029-product-vision-machine-keeper-odyssey.md` as a
  Proposed ADR capturing the machine-keeper odyssey vision from the long-term
  horizon doc.
- Added ADR-0027 and ADR-0029 to the [decision register](docs/decisions/README.md).

## 2026-07-27 — long-term horizon doc cross-linked and terminology corrected

- Added related-decision cross-links to
  `docs/exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
  for ADR-0002, ADR-0018, and RU-0204.
- Changed "provisional invariant" to "provisional hypothesis" in the "Who is
  the player?" section.

## 2026-07-27 — WebGPU/performance analysis corrected after fresh renderer read

- Re-read `src/game/renderer.ts` and `src/main.ts` and updated
  `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md` with a
  correction addendum.
- Key correction: the build is WebGL-only in practice because of
  `EffectComposer`/`UnrealBloomPass`/FXAA and two inline-GLSL `ShaderMaterial`s
  (water and state-shell aura). ADR-0028 therefore stays Proposed until a real
  WebGPU path exists and the representative matrix passes.

