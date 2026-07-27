# Parallel Runtime Integration Handoff

- Date: 2026-07-26
- Status: active handoff; runtime integration intentionally not started
- Evidence tier: Tier 1 live worktree inspection plus Tier 2 isolated passage tests
- Skill applied: `/Users/pranay/Projects/skills/3d-web/3d-web-experience/SKILL.md`
- Current remote baseline: `5896833 fix(build): admit Vite 8 WASM plugin`

## Why this handoff exists

The repository is being edited by multiple agents on the shared `main` worktree.
The correct long-term action is not to force a clean tree or edit through active
ownership. This file records the safe integration order so the Unbound Passage
proof and first-rung closure can continue without parallel-work loss or a second
runtime authority.

## Active surfaces not to edit in this tranche

The live status showed active edits in:

- `.claude/launch.json`
- `docs/WORKLOG.md`
- `docs/decisions/README.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `docs/plans/FARMFALL_SLICE_01_2026-07-25.md`
- `docs/plans/MASTER_EXECUTION_TRACKER.md`
- `docs/research/ACTIVITY_CONTENT_AND_COMMAND_CONTRACT_READINESS_2026-07-26.md`
- `docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md`
- first-rung and evidence assets under `docs/reviews/`
- `src/game/contracts.ts`
- `src/game/renderer.ts`
- `src/game/state.ts`
- `src/game/storage.ts`
- `src/main.ts`
- `src/styles.css`
- `tools/rig-lab-browser-acceptance.cjs`
- staged world, exploration, first-rung, and gameworld files
- untracked signature, passage, ADR, showcase-tool, and `src/game/animation.ts` files

These files may contain valuable work from other agents. They must be treated
as canonical in their current form, but not edited by this tranche.

## Safe work completed

The isolated passage proof is present in:

- `src/game/unbound-passage.ts`
- `src/game/unbound-passage.test.ts`
- `docs/reviews/FIRST_RUNG_AND_UNBOUND_PASSAGE_ADMISSION_2026-07-26.md`

It has two capability-authored lanes, provenance, inherited-benefit queries,
recoverable failure, winch-gated recovery, and versioned fail-closed restoration.
The targeted test result was one file and six tests passing. An isolated
TypeScript compilation of the new module also passed.

This is a contract proof, not yet a player-facing feature. It intentionally does
not write storage, mutate `GameState`, control the renderer, or decide physics.

## 3D-web skill application

The current stack is vanilla Three.js with direct renderer control. That is a
good fit for the game because the project needs explicit performance budgets and
simulation/presentation separation rather than a framework abstraction.

For Unbound Passage, the skill creates these non-negotiable constraints:

- 3D must communicate the blocked route, the selected lane, and the inherited
  consequence; decorative 3D is not a deliverable;
- route truth stays in state/world ownership, never in a shader, camera, or HUD
  flag;
- the new route marker or repaired geometry must be bounded, disposable, and
  safe to downgrade;
- mobile and reduced-motion profiles need a non-animated equivalent cue;
- the interface must remain usable while 3D assets or effects load;
- a static or low-detail fallback must preserve the action explanation;
- camera motion and lighting may improve comprehension but cannot decide success;
- the second-rig benefit must be visible in traversal, not only in presentation.

## Required integration order

1. Stabilize the active `state.ts`, `contracts.ts`, renderer, storage, and
   first-rung edits.
2. Restore the current constructor/typecheck invariant and run the full project
   typecheck. The last observed failure was a missing `surveyCadence` field in
   `src/game/state.ts:1703`; recheck before claiming this remains current.
3. Rerun first-rung browser acceptance on the canonical served port, including
   local touch, module fit, save/reload, return-home, and comprehension.
4. Add the passage state to the canonical state owner and save payload, using the
   existing migration path rather than a new storage writer.
5. Connect capability/affordance resolution to the locomotion result and then
   call the passage reducer. The reducer must not infer physical success.
6. Observe passage events through the existing run-record/event-shaped seam.
7. Derive guidance and renderer cues from state; do not create a second quest or
   episode ledger.
8. Run browser evidence for both lanes, second-rig inheritance, save/reload,
   failure/recovery, mobile behavior, reduced motion, and human comprehension.
9. Only then update the canonical first-rung and execution-tracker records,
   stage grouped changes, run hooks, and commit with the parallel work preserved.

## Completion blockers

- Full repository typecheck was previously blocked by an active `state.ts`
  constructor mismatch; current status must be rechecked after the parallel
  agent settles.
- First-rung browser evidence has not been rerun against the current mixed tree.
- Passage state is not yet wired into canonical `GameState`/`GameWorld` storage.
- The second-rig inherited benefit has not been observed in the browser.
- Operator sequencing acceptance is recorded as required by the arbitration
  document, not assumed from this handoff.

## Validation refresh

- `npm run typecheck` passes for the application and deterministic-kernel
  package.
- `npm test` passes with 29 Vitest files and 241 tests; the deterministic
  kernel probe passes 7 tests.
- `src/game/unbound-passage.test.ts` is included in the green suite with 6
  passing tests.
- Browser acceptance remains pending because the acceptance tool and evidence
  assets are active parallel surfaces. Unit and kernel evidence do not prove
  player comprehension, mobile behavior, or save/reload browser behavior.

## Addendum (2026-07-27) — animation file classified as parallel runtime work

`src/game/animation.ts` is present as a new untracked file and appears to be a
parallel runtime-owned animation system rather than part of the passage or
state/store tranche. It is intentionally left untouched in this handoff so the
owning agent can either complete or discard it without this tranche absorbing a
second authority model.

The file is now present as a compile-safe skeleton so it no longer blocks
typecheck, but its runtime integration still belongs to the parallel runtime
surface and remains outside the passage/state tranche.

## Addendum (2026-07-27) — interaction file is a separate runtime-owned boundary

The live tree now exposes a new untracked implementation-flow artifact at
`docs/research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md` rather
than a present `src/game/interaction.ts` source file. It is still runtime-owned
renderer/interaction evidence, not part of the passage/state tranche.

The current renderer already references the animation system and initializes an
interaction system, so the runtime additions should be treated as a coherent
presentation/interaction lane even while the passage/state tranche remains the
canonical simulation/persistence lane.

## Addendum (2026-07-27) — same-vehicle comparison boards are separate exploration work

`docs/exploration/SAME_VEHICLE_COMPARISON_BOARDS_2026-07-27.md` and its asset
folder are separate exploration/design evidence, not passage admission or
runtime wiring. They can inform later trailer, image, or prompt work, but they
should not be merged into the passage/state tranche or treated as runtime
authority.

## Addendum (2026-07-27) — passage is now wired into canonical state and save/load

The isolated proof has moved one layer deeper without touching the active
runtime/browser tranche:

- `src/game/contracts.ts` now includes `unboundPassage` in `GameState`.
- `src/game/state.ts` seeds the passage, restores it with the reducer's own
  validator, and exposes the read model in `publicState`.
- `src/game/storage.test.ts` and `src/game/state.test.ts` now prove the
  round-trip and snapshot integration.

The runtime/browser seam remains intentionally open because `src/main.ts` and
the renderer-facing integration are still live parallel surfaces. The next safe
step is to attach player interaction and live presentation to the canonical
state, then re-run browser evidence.

## Decision

Continue with independent contract proofs, research, and handoff artifacts while
parallel runtime files are live. Do not claim the full Unbound Passage feature
complete until the ordered integration and browser evidence above are complete.
This preserves the long-term first-principles architecture: one authoritative
simulation state, one persistence owner, explicit capability contracts, and a
replaceable Three.js presentation layer.

## Addendum (2026-07-27) — newer runtime tranche broadens the live lane

The live tree now also carries `src/game/landslide-hazard.ts`,
`src/game/procedural-missions.ts`, `src/game/radial-ui.ts`, and
`src/game/vehicle-maintenance.ts` as new untracked runtime modules with matching
tests. They are still parallel-owned implementation evidence, not passage/state
tranche material, and they widen the live runtime lane without changing the
canonical simulation/persistence boundary.
