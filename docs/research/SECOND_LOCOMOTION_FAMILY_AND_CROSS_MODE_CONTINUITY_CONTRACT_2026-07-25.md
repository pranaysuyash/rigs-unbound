# Second Locomotion Family and Cross-Mode Continuity Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s existing hover rig into a named second locomotion-family contract so cross-mode continuity, save/reload, and rollback behavior stay explicit as the motion grammar grows.

The current codebase already includes a second locomotion family in `marsh-skimmer`, so the remaining work is not “invent a new rig type.” It is to make the proof boundary explicit: the same contract stack must support a different motion grammar without breaking shared actions, camera continuity, or recovery behavior.

## Current evidence base

- Rig and mobility definitions:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
- Motion integration and adapter dispatch:
  - [src/game/physics.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/physics.ts)
- Runtime rig switching and camera hooks:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Capability contract sibling note:
  - [docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)
- Analysis addendum for second locomotion and cross-mode continuity:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)

## What is already there

The repo already proves several important things:

- a non-ground mobility family exists,
- the world, input, camera, exploration, activity, persistence, and observability stacks can already host it,
- save/version behavior already preserves the transition from the first family to the second,
- the second family changes gameplay outcomes rather than only adding stat noise.

That means the motion grammar expansion is real, not speculative.

## What is still missing

The current surface still lacks:

- a contract that names the second locomotion family as a reusable architecture boundary,
- explicit shared action vocabulary across modes,
- a continuity rule for camera and input behavior,
- a save/reload or recovery test for the new family,
- an explicit rollback or failure path if the adapter cannot activate safely,
- a proof note that the family can move, stop, and recover without special casing the engine.

## Contract shape

A durable second-locomotion contract should separate:

1. **Family identity**
   - mobility adapter
   - capability bundle
   - state shape
2. **Shared action vocabulary**
   - what stays the same across modes
   - what intentionally changes
   - how the mapping is observed or debugged
3. **Continuity**
   - camera and input intelligibility
   - save/reload behavior
   - recovery after failure
4. **Rollback**
   - safe activation
   - explicit failure state
   - no partial activation that leaves the world ambiguous

This keeps future motion families from becoming isolated side branches.

## Validation rules

The contract should fail visibly if it:

- introduces a new family without preserving a shared action vocabulary,
- breaks save/reload or recovery behavior,
- makes camera or input unintelligible across the mode change,
- cannot roll back or fail visibly if the adapter activation fails,
- treats the second family as a stats package rather than a motion grammar,
- requires a bespoke activity controller just to stay usable.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one second locomotion adapter or family definition,
2. one shared semantic action set used in at least one non-chase presentation mode,
3. one save/reload or recovery test for the new family,
4. one continuity test showing mapped actions behave predictably across modes,
5. one explicit rollback or failure path if the adapter cannot activate.

## Open questions

- Which shared actions are most important to preserve first: move, recover, survey, or camera?
- Should the continuity proof be done with `marsh-skimmer` alone or with a new variant as well?
- Should the new family be measured primarily by feel, reach, or interaction changes?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The point of this contract is not to multiply rigs.
It is to prove that the capability stack can carry a different motion grammar
without collapsing shared controls or recovery behavior.

## Addendum (2026-07-25) - The second family is live, but the continuity proof is still partial

- `src/game/contracts.ts` already defines a real second locomotion family in the
  `marsh-skimmer` profile:
  - `mobilityAdapter: "hover"`
  - explicit `hover` capability
  - distinct mobility-state shape from the ground rigs
- `src/game/state.ts` and `src/main.ts` already route this family through the
  same shared world, camera, save, and recovery spine instead of treating it as
  a separate game mode.
- The browser-visible runtime therefore proves that the second family exists and
  is playable, but the named contract boundary is still incomplete:
  - no explicit shared-action continuity test yet,
  - no rollback/failure envelope for adapter activation yet,
  - no standalone proof note for save/reload behavior on the hover family yet.
- This makes the contract a true architecture seam now, not a speculative
  design note. The remaining work is to make its recovery and continuity
  guarantees explicit and testable.
