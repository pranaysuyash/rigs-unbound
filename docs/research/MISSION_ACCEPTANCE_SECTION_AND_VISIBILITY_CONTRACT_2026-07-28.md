# Mission Acceptance Section and Visibility Contract (2026-07-28)

**Status:** proposed presentation contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related row contract:** [Mission Acceptance Row and Announcement Contract](./MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md)  
**Related ledger spec:** [Contract Ledger Specification](./CONTRACT_LEDGER_SPEC_2026-07-27.md)

## Purpose

Define how the board should present rows once it already knows what the rows
are, which row is selected, and how the selected row is announced.

The board needs a presentation contract so it can be more than a flat list.
This note answers:

- which sections should be visible,
- which rows should remain visible versus filtered,
- how much of the ledger should be shown at once,
- and how the board should keep history without turning into a wall of noise.

## Decision

The first durable slice should present the board as a **compact, sectioned
ledger** rather than an unfiltered full dump.

The canonical visible sections are:

1. **Active**
2. **Available**
3. **Deferred**
4. **History**

This does not mean the hidden data disappears. It means the board should
prioritize the player-relevant rows first and only surface the rest when they
are useful to the current choice moment.

## Visibility rules

The board should obey these rules:

- Active rows are always visible when present.
- Available rows are visible when they can be taken now.
- Deferred rows are visible when they explain why a proposition is not yet
  ready.
- History rows are visible when they help the player understand what changed.
- Hidden rows may exist in source state, but the board should not surface them
  unless a reason-coded rule makes them relevant.

The board should not default to a raw full ledger if that makes the choice
surface harder to read than the world itself.

## Filtering contract

Filtering should be based on relevance, not secrecy.

Recommended filters:

- hide rows that cannot be explained to the player yet,
- collapse redundant history once the board gets crowded,
- keep the most recent or most relevant history rows visible,
- preserve the ability to expand to more detail when needed,
- never hide an actionable row without a reason string.

The goal is a board that feels like a readable agenda, not a spreadsheet.

## Section contract

Each section should have a visible heading and a short section-level summary.

Recommended section summaries:

- **Active:** what the player is currently doing.
- **Available:** what can be chosen right now.
- **Deferred:** what is visible but not yet ready.
- **History:** what matters from earlier choices.

These summaries should help screen-reader users and first-time players
understand the board without needing a legend.

## Compact-versus-full contract

The default board presentation should be compact, with optional expansion for
detail.

Recommended behavior:

- compact mode shows the current decision-relevant rows,
- expanded mode reveals the full readable ledger for the current context,
- the toggle should be explicit and accessible,
- the default should stay lightweight unless the player asks for more detail.

This keeps the board useful on small screens and prevents the shell from
becoming a dense management panel.

## Accessibility contract

The sectioned board should preserve:

- one predictable focus path into the board,
- visible section headings,
- row order that matches the spoken order,
- no hidden information that is needed to choose a row,
- clear labels for compact / expanded mode,
- a way to reach history without losing the current selection.

## Validation rules

The contract should fail visibly if it:

- shows a full unfiltered ledger by default and overwhelms the player,
- hides the active or available row behind history,
- makes the compact/full toggle ambiguous,
- removes reason-coded deferred rows entirely,
- or breaks the announced row and focus model from the companion contracts.

## Out of scope

- No new mission authority.
- No new save schema.
- No gameplay mutation from presentation.
- No new ledger source.
- No replacement for the row or surface contracts.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one board with the four canonical sections,
2. one compact mode and one explicit expansion mode,
3. one visible section summary per section,
4. one history row that remains readable without overwhelming the board,
5. one accessible toggle between compact and expanded views,
6. one focus path that preserves the selected row while moving through
   sections.

## Open questions

- Should the board remember compact versus expanded state per session?
- Should history collapse into a separate drawer once it exceeds a threshold?
- Should filtered-out rows be summarized in a counter or hidden entirely?
- Should section headings be navigable landmarks for screen readers?

## Header follow-through

The board header and summary contract now lives in
[Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md).

That note handles the title, visible summary counts, and compact/expanded
status line that sit above the sections.

## History follow-through

The history retention and recap contract now lives in
[Mission Acceptance History and Recap Contract](./MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md).

That note keeps the history section visible but bounded so the board can stay
compact without losing the memory of prior choices.

## Transition follow-through

The board transition and restore contract now lives in
[Mission Acceptance Transition and Restore Contract](./MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md).

That note keeps compact/expanded changes from feeling like a full page swap.

## Empty-state follow-through

The empty-state and fallback contract now lives in
[Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md).

That note keeps the sectioned board from becoming a blank panel when there are
no meaningful rows to show.

## Loading follow-through

The loading and refresh contract now lives in
[Mission Acceptance Loading and Refresh Contract](./MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md).

That note keeps the sectioned board from appearing blank while data is being
rebuilt.

## Anything else?

Yes. This contract is intentionally presentation-only. It does not decide what
the player may do. It only makes sure the board stays readable enough to make
that choice honestly.

## Addendum (2026-07-28): the sectioned board is already mounted on desktop, but compact/mobile hides the trigger path

- A desktop browser probe opened the acceptance board and showed a sectioned
  ledger with the header `Field contracts` and the subtitle `Choose what pulls
  you next`.
- The board summary reported `3 contracts resolved from the field state.`,
  which is exactly the kind of compact summary this contract asks for.
- The compact/mobile shell still hides the masthead button cluster, so the
  sectioned board is not presently exposed on the narrow ready view even
  though it exists in the desktop path.
- That means the visibility contract has a real implementation example now:
  desktop shows the compact sectioned ledger, while the mobile shell preserves
  only the textual status rail.
