# Mission Acceptance Row and Announcement Contract (2026-07-28)

**Status:** proposed browser interaction contract - not implemented as a
separate authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related shell contract:** [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)  
**Related accessibility analysis:** [Accessibility and Profile Visibility Live Repo Analysis](./ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)

## Purpose

Define the concrete row model and announcement lifecycle for the acceptance
surface.

The acceptance surface already has a named role: it is the player-facing place
where a derived proposition becomes a choice. This note narrows that down to
the row level so the board can be focus-managed, readable, and announced
without turning into a new mission authority.

## What this contract is for

The board needs to do more than show rows. It needs to tell the player:

- which row is currently selected,
- whether that row is actionable, deferred, unavailable, or historical,
- why the row has that state,
- what the primary action does,
- and how to get back to play.

This note is the browser-facing interaction layer that makes those answers
stable.

## Proposed row model

Each row should carry both ledger information and UI selection state.

```ts
type AcceptanceRowStatus =
  "available" | "active" | "deferred" | "unavailable" | "history";

type AcceptanceRowSelection = "unselected" | "selected" | "expanded";

type AcceptanceRow = {
  id: string;
  title: string;
  summary: string;
  status: AcceptanceRowStatus;
  selection: AcceptanceRowSelection;
  section: "active" | "available" | "deferred" | "history";
  reason?: string | null;
  actionLabel?: string | null;
  secondaryLabel?: string | null;
  sourceKind:
    "activity" | "progression" | "site" | "worldMemory" | "affordance";
  isAcceptable: boolean;
};
```

The important split is:

- `status` describes the proposition’s state in the world,
- `selection` describes the current browser focus state,
- `section` describes the board grouping,
- `isAcceptable` describes whether the primary action can be taken now.

## Announcement contract

The board should announce state changes in plain language.

Recommended announcement shape:

```text
Selected: Salvage Cache. Available. Weather makes this harder.
Primary action: Accept.
Secondary action: Inspect.
```

The exact wording can change, but the information must not:

- the selected row name,
- the selected row state,
- the reason or constraint,
- the explicit action names.

If a row becomes unavailable or deferred while focused, the board should
announce the change and keep the focus path recoverable.

## Focus contract

The board must behave like a predictable focus-managed dialog boundary:

1. Opening the board moves focus into the board.
2. Focus lands on the most relevant row.
3. Arrow or equivalent navigation changes the selected row.
4. The selected row is the source of the announcement.
5. Accept and dismiss remain explicit controls.
6. Closing the board restores focus to the opener.

The focus model may be roving-tabindex or a similar accessible pattern, but it
must preserve the distinction between board navigation and page navigation.

## Validation rules

The contract should fail visibly if it:

- exposes a row state without a matching reason,
- allows selection but not announcement,
- allows acceptance without a named action,
- loses the opener focus on close,
- makes keyboard navigation depend on pointer-only affordances,
- conflates selection state with authoritative simulation state,
- or hides actionable rows behind unlabeled UI.

## Out of scope

- No new mission authority.
- No new save schema.
- No runtime mutation from the board itself.
- No generated content system.
- No replacement for the ledger projection contract.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one board row set with a selected row,
2. one visible selected-state indicator,
3. one announcement path for selection changes,
4. one accept action and one dismiss/back action,
5. one restored focus path after close,
6. one keyboard-only path through rows and actions,
7. one touch path that preserves the same row semantics.

## Open questions

- Should the board announce every selection change or only state transitions?
- Should expanded rows expose details inline or in a detail pane?
- Should historical rows remain focusable or read-only only?
- Should the first slice use explicit section headers or a single filtered list?

## Presentation follow-through

The section and visibility contract now lives in
[Mission Acceptance Section and Visibility Contract](./MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md).

That keeps row semantics separate from board layout:

- this note owns selection and announcement,
- the section note owns compact versus expanded board shape,
- the surface contract owns the player-choice boundary.

## Header follow-through

The header and summary contract now lives in
[Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md).

That note handles the title, counts, and mode summary that frame the rows
before selection begins.

## History follow-through

The history retention and recap contract now lives in
[Mission Acceptance History and Recap Contract](./MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md).

That note makes history a readable memory trail instead of a scrolling archive.

## Transition follow-through

The board transition and restore contract now lives in
[Mission Acceptance Transition and Restore Contract](./MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md).

That note keeps row selection stable through open, toggle, and close changes.

## Empty-state follow-through

The empty-state and fallback contract now lives in
[Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md).

That note gives the row layer a clear fallback when there are no rows to
announce.

## Loading follow-through

The loading and refresh contract now lives in
[Mission Acceptance Loading and Refresh Contract](./MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md).

That note keeps the row layer from announcing a blank state while rows are
still being refreshed.

## Anything else?

Yes. This contract is intentionally small. It does not decide what the board
ultimately becomes; it only makes sure the choice surface can be used, heard,
and exited without ambiguity.

## Addendum (2026-07-28): the current runtime only exposes a passive survey status, not a row set

- Re-checked the canonical browser surface at `http://localhost:4173/`.
- The live DOM shows `#survey-contract` as a hidden `p` with `aria-live="polite"`,
  and its visible text fragment reads `Contract ready`.
- That is useful status feedback, but it is not yet the selectable row model
  this contract describes:
  - no row list,
  - no selected-state indicator,
  - no announce-on-selection path,
  - no accept/dismiss controls.
- So the runtime currently provides a passive announcement hint, not the live
  row-and-announcement surface.
- Evidence depth: Tier 4 live browser inspection plus Tier 1 source inspection.

## Addendum (2026-07-28): the runtime has survey status plus hidden controls, but still no visible row set

- A later browser probe found the latent controls `#mission-board-button`,
  `#mission-board-close`, and `#mission-briefing-accept` in the DOM.
- Those controls were not visible in the ready shell, so the row-and-announcement
  surface remains inaccessible to the player even though the plumbing exists.
- The most precise current reading is:
  - survey contract = passive status hint,
  - hidden controls = latent acceptance plumbing,
  - row contract = still not mounted as a player-visible, keyboard-safe set.
- That keeps the row contract honest about its current shape and avoids
  overstating the current runtime as a finished board.

## Addendum (2026-07-28): the row set is visible on desktop, not on the compact shell

- A desktop probe opened the board and confirmed the row set is already
  mounted in the runtime.
- The visible board includes a selectable row list plus briefing content, which
  means the row model is not purely speculative anymore.
- The compact/mobile shell still hides the trigger cluster, so the row
  contract remains a desktop-visible player surface rather than a universally
  discoverable one.
- The most useful current distinction is:
  - row model = present and mounted on desktop,
  - row model = hidden behind viewport policy on the compact shell,
  - announcement contract = still needed to make the row selection legible.

## Addendum (2026-07-29) - ADR-0039 keeps the row contract on the public-shell side of the split

This row-and-announcement contract now sits alongside the browser-policy split
named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- `#runtime-diagnostics` stays on the acceptance/developer side of the split,
  so row announcements do not need to turn the public HUD into an operator
  console.

That keeps row selection, announcement, and focus handling centered on the
player-facing shell.

## Addendum (2026-07-29) - the next row proof is a compact-shell-safe visible row set with announcement

- The row contract already knows what it wants: selected rows, announcement on
  change, explicit accept/dismiss actions, and restored focus on close.
- The next proof slice should therefore be one compact-shell-safe row set that
  preserves:
  - one visible selected-state indicator;
  - one announcement path for selection changes;
  - one accept action and one dismiss/back action;
  - one keyboard-only path through rows and actions.
- That keeps the row layer usable on the small shell without turning selection
  into a hidden or pointer-only behavior.
- Anything else? No. Row selection should stay legible before it becomes
  actionable.
