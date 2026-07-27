# Next Vertical Recommendation: Unbound Passage 01

- Date: 2026-07-27
- Status: proposed sequencing; operator sign-off required
- Evidence tier: Tier 1 repository synthesis
- Related:
  - [Wide-Open Next-Tranche Arbitration](../exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md)
  - [3D Game Skill Application: Unbound Passage 01](../research/3D_GAME_SKILL_APPLICATION_UNBOUND_PASSAGE_2026-07-26.md)
  - [First-Rung and Unbound Passage Admission Review](FIRST_RUNG_AND_UNBOUND_PASSAGE_ADMISSION_2026-07-26.md)
  - [Next Execution Board](../plans/NEXT_EXECUTION_BOARD_2026-07-26.md)

## What this note does

This is a durable recommendation record, not runtime implementation.

The current first-principles recommendation remains:

```text
close the first-rung browser/comprehension gates
→ accept sequencing on Unbound Passage 01
→ prove one cross-rig persistent consequence
→ only then decide whether Farmfall or Signal Break should follow
```

The recommendation is intentionally separated from the live runtime lane.
That keeps the repository honest about what is a proposal, what is accepted,
and what is still waiting on operator sign-off.

## Why Unbound Passage is still the leading candidate

The arbitration and skill-analysis docs converge on the same thing:

- it proves whether one rig can author a durable world change for another rig;
- it exercises capability and affordance resolution without inventing a generic
  episode engine first;
- it can be kept small enough to use the current deterministic state, world,
  run-record, and persistence seams;
- it is more architectural than another same-rig vertical, but still narrower
  than a broad Farmfall expansion.

That makes it the best next proof of cross-rig causality after the first-rung
work stabilizes.

## What this note does not do

- It does not accept the sequencing on behalf of the operator.
- It does not implement passage runtime wiring.
- It does not touch the live renderer/style lane.
- It does not claim browser admission for Unbound Passage 01.

## Current gate status

- First-rung browser evidence remains the prerequisite for opening the next
  vertical in the active runtime.
- The passage reducer exists as a pure proof and carries canonical state/save
  language in the repo, but the player-facing browser/runtime admission is still
  gated.
- Parallel runtime edits remain separate and must stay separate until their own
  lane is ready for review.

## Practical next step

Keep documenting and sequencing, but do not merge this recommendation into the
runtime until the operator explicitly accepts C1 and the current live worktree
is stable enough to rerun the browser admission path.

