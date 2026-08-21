# Worklog Addendum — 2026-08-17

## Summary of Activity

- **Task:** Explore how rigs can keep being built procedurally from image
  references into a full-blown inventory with expansions and upgrades, and
  document everything.
- **Goal:** Consolidate the already-proven image-reference → runtime-rig path
  into canonical documentation, name the current frontier honestly, and give
  the paused procedural-generation scope (GD-13) a named consumer — without
  changing runtime code or reopening gated scope.
- **Type:** Documentation-only session (Tier 1 static inspection; no `src/`
  files touched, respecting the parallel-ownership boundary on `src/game/`).

## Accomplishments

1. **Mapped every rig production surface** (all Observed, live tree):
   - Identity/simulation: `src/game/rig-ids.ts` (16 ids), `RIG_PROFILES`,
     `MODULES` (6 modules, all fitting only the two starter rigs),
     `EffectiveRig` composition in `src/game/contracts.ts`.
   - Derived geometry: `RIG_SILHOUETTES`, `RIG_SUPERSTRUCTURES`,
     `RIG_MODULE_FORMS` in `src/game/rig-blockout.ts` with their enforcing
     tests (`rig-blockout.test.ts`, `candidate-rigs-blockout.test.ts`).
   - Image references: 26 plates in `assets/generated/rig_concepts/`
     (concept + orthographic + details per candidate rig), all 44
     `asset-manifest.json` entries verified (39 reference-kind).
   - Design specs: 13 files in `docs/design/rigs/specs/` following
     `RIG_DESIGN_SYSTEM.md` §2.
   - Authored models: 15 workbench TypeScript factories
     (`assets/workbench/*/authored/create*Model.ts`), each with a colocated
     test — and confirmed **none of the 13 rig factories is imported by the
     renderer** (only `createFieldPlough01Model` is, as the plough
     attachment); candidates render through the generic
     `createCandidateRig()` blockout path (`renderer.ts` ~4392).
   - Forge/envelope tooling: `tools/derive-img2threejs-spec.mjs` chain
     (proven end-to-end for `field-plough-01` including GLB export),
     `tools/rig-asset-envelope.ts` (the FORM/DIMENSIONS inversion that makes
     reconstructed rigs checkable against profiles), and the full browser
     acceptance toolset.
2. **Created
   [`docs/design/rigs/RIG_PRODUCTION_PIPELINE.md`](design/rigs/RIG_PRODUCTION_PIPELINE.md)** —
   the canonical stage reference (S0 reference plates → S1 spec → S2 profile
   → S3 blockout → S4 model FORM in three lanes → S5 acceptance gates →
   S6 renderer wiring → S7 catalog/manifest), including the Two-Lane
   Contract, lane decision rules, per-stage commands, the add-a-rig and
   add-a-module runbooks, an honest per-stage state table, and the GD-13
   boundary.
3. **Created
   [`docs/design/rigs/RIG_INVENTORY_EXPANSION_AND_UPGRADES_ROADMAP.md`](design/rigs/RIG_INVENTORY_EXPANSION_AND_UPGRADES_ROADMAP.md)** —
   inventory snapshot; four expansion waves (wire the 13 authored rigs →
   module fitment matrix + spec-socket realization → GD-13-gated variant
   layer → families/Lane C); upgrade-module design space sourced from the
   spec socket tables; fitment-matrix governance.
4. **Updated [`docs/design/rigs/README.md`](design/rigs/README.md)** —
   linked both new documents, corrected the status overview heading (16 rigs,
   not 13), updated the 13 candidate statuses from "Spec Locked / Concept
   Ready" to "Spec Locked / Authored (Wiring Pending)" to match the observed
   authored-model state, and pointed the add-new-rigs section at the
   pipeline runbook.

## Key findings worth recording

- **The shelf is fuller than the runtime shows.** 13 rigs have images, specs,
  profiles, blockouts, and authored 3D factories, yet render as generic
  blockout boxes and can buy no modules. The next inventory lever is wiring
  (S6), not more authoring.
- **The image→runtime path is proven exactly once** (field-plough, an
  attachment) and the rig-specific inversion — reference supplies FORM,
  `RIG_PROFILES` supply DIMENSIONS — is already codified in
  `tools/rig-asset-envelope.ts` with an unused-but-ready check path ("never
  been checked against a real authored rig spec, because none exists yet" per
  the 2026-08-11 worklog).
- **The upgrade economy is the widest gap:** six modules × two rigs vs ~78
  authored socket slots across the 13 specs.
- **GD-13 is answerable:** the roadmap's Waves 1–2 consume only proven lanes
  and existing contracts; Waves 3–4 hold the paused procedural scope with the
  research docs as design source, not implicit license.

## Verification

- Documentation-only: link targets verified against the live tree; command
  citations checked against `package.json` scripts and `tools/` contents.
- No code, config, or asset changed; no git write action taken.

---
*Date: 2026-08-17 | Owner: documentation session (rig production pipeline consolidation)*
