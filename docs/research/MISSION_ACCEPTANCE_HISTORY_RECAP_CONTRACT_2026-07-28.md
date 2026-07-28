# Mission Acceptance History and Recap Contract (2026-07-28)

**Status:** proposed presentation contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related section contract:** [Mission Acceptance Section and Visibility Contract](./MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md)  
**Related board header contract:** [Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md)

## Purpose

Define how the acceptance board should keep history legible without turning
into a wall of prior choices.

The board already has a history section. This note makes the history section
bounded and readable so the player can understand what happened before without
losing the current choice.

## Decision

History should stay in the board as a visible section, not as a separate
hidden archive.

The first durable slice should:

- keep recent history visible inline,
- summarize older history when the section gets crowded,
- and preserve a path to more detail without obscuring current choices.

That means the board remains one surface with one memory trail, not two
separate places for current work and historical work.

## Retention contract

Recommended history retention behavior:

- keep the most recent meaningful outcomes visible,
- keep a smaller number of older outcomes as summarized history,
- preserve notable milestones even if they are older,
- collapse repetitive entries into a short recap if they stop teaching
  anything new,
- never delete a history item from the player-facing contract just because the
  board is crowded.

The exact retention threshold can evolve, but the rule should stay simple:
history is meant to explain the current state, not compete with it.

## Recap contract

When the history section gets dense, the board should be able to show a short
recap instead of every item at full detail.

Recommended recap forms:

- `3 earlier contracts summarized`
- `2 recent recoveries`
- `1 notable milestone`

The recap should always make it clear that detail exists, even if the board is
currently compact.

## Visibility contract

History should remain:

- visible as a section,
- concise by default,
- expandable when the player asks for more detail,
- and never allowed to bury the active or available rows.

History rows should not become the default focal point when a fresh choice is
present.

## Accessibility contract

The history section should support:

- a clear section heading,
- a short section summary,
- a readable recap count if the section is collapsed or summarized,
- a way to reach older history without losing the selected row,
- a stable reading order that keeps active and available items ahead of history
  when choice matters now.

## Validation rules

The contract should fail visibly if it:

- hides current opportunities behind history,
- turns history into an unbounded wall of text,
- deletes older outcomes with no recap,
- makes the recap ambiguous about whether details exist,
- or breaks the selection and focus behavior from the companion contracts.

## Out of scope

- No new save schema.
- No new mission authority.
- No separate archive page.
- No automatic deletion of history from the underlying state.
- No replacement for the section, row, or header contracts.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one visible history section,
2. one recap summary when the section is crowded,
3. one path to expand more history,
4. one preserved selection path back to active or available rows,
5. one history entry that remains readable as a meaningful outcome,
6. one section summary that keeps the board compact by default.

## Open questions

- What threshold should trigger the recap summary?
- Should notable milestones always stay expanded?
- Should history entries be grouped by session, contract, or outcome type?
- Should the recap count be shown in the board header or only in the history
  section?

## Transition follow-through

The board transition and restore contract now lives in
[Mission Acceptance Transition and Restore Contract](./MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md).

That note keeps the history section from resetting unexpectedly when the board
opens, closes, or toggles mode.

## Empty-state follow-through

The empty-state and fallback contract now lives in
[Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md).

That note gives the history section a clear explanation when there is nothing
to show or when the board needs to explain an empty state instead of looking
broken.

## Loading follow-through

The loading and refresh contract now lives in
[Mission Acceptance Loading and Refresh Contract](./MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md).

That note keeps the history section from appearing empty while the board is
still refreshing.

## Anything else?

Yes. This contract keeps history honest. The board should remember enough to
teach the player, but not so much that it stops being a place to choose the
next thing.
