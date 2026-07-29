# Mission Acceptance Board Header and Summary Contract (2026-07-28)

**Status:** proposed presentation contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related section contract:** [Mission Acceptance Section and Visibility Contract](./MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md)  
**Related row contract:** [Mission Acceptance Row and Announcement Contract](./MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md)

## Purpose

Define the board-level header and summary language that sits above the sectioned
ledger.

The surface already has a row model, a sectioning model, and an announcement
model. What it still needs is a consistent header that tells the player:

- what this board is,
- how many choices matter right now,
- whether the board is in compact or expanded mode,
- and which row or section currently has the player's attention.

This is not a new authority. It is the concise browser-facing summary that
keeps the choice surface readable at a glance.

## Decision

The board header should be a short, always-visible summary area.

Recommended header contents:

- board title
- one-line purpose statement
- compact / expanded mode indicator
- selected-row or selected-section context
- actionable count or current opportunity count
- a visible close/back affordance

The header should not become a second navigation menu.

## Title contract

The board title should use plain player language first.

Recommended title pattern:

`Contracts`

Optional subtitle pattern:

`Choose what to do next`

The title should not require the player to know internal system names like
ledger, proposition, or command boundary.

## Summary contract

The header summary should answer three questions quickly:

1. What kind of choices are here?
2. How many are immediately relevant?
3. What mode is the board in?

Example summary:

`3 available, 1 deferred, 2 history, compact view`

The exact wording can change, but the data categories should remain stable.

## Selection context contract

When a row or section is selected, the header should show a short context line.

Recommended context patterns:

- `Selected: Salvage Cache`
- `Selected: Available`
- `Selected: History`

The context line should be short enough to fit on small screens without pushing
the primary rows off the page.

## Mode indicator contract

The header should make compact versus expanded state explicit.

Recommended mode labels:

- `Compact`
- `Expanded`

If the board uses a toggle, the current mode should be announced in the header
and reflected in the toggle label itself.

## Accessibility contract

The header should support:

- one visible heading for the board,
- one short summary line that can be read aloud,
- one explicit compact/expanded control label,
- one close/back control with a real text label,
- no reliance on icon-only header controls,
- a reading order that keeps title -> summary -> controls consistent.

If the header summary changes because the selected row changes, the update
should be understandable without moving focus away from the current selection.

## Validation rules

The contract should fail visibly if it:

- hides the board title behind iconography,
- shows a misleading count of available items,
- makes compact/expanded mode unclear,
- pushes the current selection out of sight,
- or duplicates the full row contents in the header.

## Out of scope

- No new mission authority.
- No new save schema.
- No board mutation path.
- No replacement for the row, section, or surface contracts.
- No additional game logic.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one visible board title,
2. one short summary line with counts or mode,
3. one current selection context line,
4. one explicit mode indicator,
5. one explicit close/back label,
6. one reading order that stays stable across mode changes.

## Open questions

- Should the summary count include hidden rows or only visible ones?
- Should the selection context line show the selected section or selected row?
- Should the board title change in different contexts, or remain constant?
- Should the mode indicator be text-only or text plus icon?

## Transition follow-through

The board transition and restore contract now lives in
[Mission Acceptance Transition and Restore Contract](./MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md).

That note keeps the header summary stable across open, reconfigure, and close
events.

## Empty-state follow-through

The empty-state and fallback contract now lives in
[Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md).

That note gives the header a clear companion for the zero-row case.

## Loading follow-through

The loading and refresh contract now lives in
[Mission Acceptance Loading and Refresh Contract](./MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md).

That note gives the header a clear companion for the refresh case.

## Anything else?

Yes. This contract is intentionally small. It exists so the player can orient
themselves before reading the rows, not so the board can become another
dashboard.

## Addendum (2026-07-28): the header contract now matches a real desktop board, but not the compact shell

- A desktop probe of the acceptance board showed the exact kind of header this
  contract describes:
  - title: `Field contracts`
  - subtitle: `Choose what pulls you next`
  - summary: `3 contracts resolved from the field state.`
  - explicit `Close` control
- That means the header and summary language is no longer just aspirational;
  it is already mounted in the desktop runtime.
- The compact/mobile shell still suppresses the trigger cluster, so this
  header is not yet available to every viewport that can play the game.

## Addendum (2026-07-29) - ADR-0039 keeps the header on the player-facing side of the browser split

This board-header contract now sits alongside the browser-policy split named
in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- `#runtime-diagnostics` stays on the acceptance/developer side of the split,
  where the richer summary can remain readable without displacing the player
  HUD.

That keeps the header contract focused on player orientation rather than on
repeating operator diagnostics in the visible board summary.

## Addendum (2026-07-29) - the next header proof is the compact-shell entry point, not another desktop summary

- The desktop runtime already proves the board header and summary can exist as
  a readable overlay.
- The remaining gap is the compact shell, which still suppresses the trigger
  cluster that opens the board in smaller viewports.
- The next proof slice should therefore be one compact-shell-visible entry
  point that preserves:
  - the board title,
  - the short summary line,
  - the explicit mode indicator,
  - and the close/back path.
- That keeps the contract aligned across viewport classes instead of treating
  the small shell as a different board.
- Anything else? No. The board should stay the same tool, just scaled to the
  shell that is using it.

## Addendum (2026-07-29) - the compact shell already exposes the board entry point, so the header is not desktop-only

- A compact-viewport probe at `390 x 844` showed the `Contracts` button visible
  and focusable, which means the board header is not limited to desktop-sized
  shells.
- The earlier compact-shell assumption in this contract should therefore be
  read as historical context, not current truth.
- The durable rule is now:
  - compact mode still preserves a visible entry point to the same board;
  - the header title, summary line, and close/back path should remain
    readable in that smaller presentation;
  - the board stays the same tool, just scaled to the shell that is using it.
- Anything else? No. The header contract should describe the compact entry
  point the runtime already has, not the one it used to lack.

## Addendum (2026-07-29) - the board summary count should reflect visible rows

- The summary count should describe the rows currently visible in the board, not the hidden or filtered rows that are summarized elsewhere.
- That keeps the header honest about what the player can actually inspect right now and avoids double-counting rows that are already represented by filter or recap counters.
- If the board needs to explain hidden rows, that explanation belongs in the relevant section or filter summary, not in the header count itself.
- Anything else? No. The header count should orient the player to the visible board state, not the entire hidden row universe.

## Addendum (2026-07-29) - the board title should remain constant across contexts

- The board title should stay constant so the header remains an anchor while mode, summary, and rows do the contextual work.
- That keeps the board easy to recognize when the player opens it from different states without adding another changing label to the header.
- The title can still be paired with a mode indicator or summary line, but the title itself should not become a context-sensitive status string.
- Anything else? No. The board title should identify the surface, not the current situation.

## Addendum (2026-07-29) - the live board header currently has no dedicated mode-indicator node

- A live DOM probe of the open `Contracts` board shows the header is composed of the `Field contracts` index, the board title `Choose what pulls you next`, and the `Close` button.
- There is no separate mode-indicator element in that live header structure, so the current surface does not answer the text-only-versus-icon question by presence alone.
- That means the next proof slice, if a mode indicator is introduced, should be text-first and explicit before any icon treatment is considered.
- Anything else? No. The header should not be forced into iconography when the live board does not yet expose the mode indicator as a distinct control.

## Addendum (2026-07-29) - the broader shell search also found no compact/expanded mode cue in sampled DOM

- A page-wide DOM search for `compact`, `expanded`, and `mode` returned no matching text, ids, classes, or aria labels in the sampled shell.
- That means the live surface is currently relying on other labels, not a dedicated compact-versus-expanded cue, to orient the player.
- The contract should therefore treat the mode-indicator question as an open affordance decision, not as a feature already present elsewhere in the shell.
- Anything else? No. The shell sample does not currently expose a separate mode indicator to reuse.
