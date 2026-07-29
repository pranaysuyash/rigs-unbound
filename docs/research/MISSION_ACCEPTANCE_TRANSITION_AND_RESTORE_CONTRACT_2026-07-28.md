# Mission Acceptance Transition and Restore Contract (2026-07-28)

**Status:** proposed interaction contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related row contract:** [Mission Acceptance Row and Announcement Contract](./MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md)  
**Related section contract:** [Mission Acceptance Section and Visibility Contract](./MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md)  
**Related header contract:** [Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md)  
**Related history contract:** [Mission Acceptance History and Recap Contract](./MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md)

## Purpose

Define how the acceptance board opens, changes mode, preserves state, and
closes without becoming a second mode system.

The board already has named contracts for:

- the surface boundary,
- row announcement,
- sectioning and visibility,
- board header and summary,
- and history recap.

What remains is the choreography that ties those pieces together when the
board is used. This contract keeps that choreography explicit.

## Decision

The acceptance board should behave like a single recoverable interaction
surface with three predictable transitions:

1. **Open**
2. **Reconfigure**
3. **Close**

The surface should preserve the player’s context across those transitions.

## Open contract

When the board opens:

- it should enter from the current shell action,
- it should restore the last meaningful selected row if one exists,
- otherwise it should land on the most relevant active or available row,
- it should make the board title and summary visible immediately,
- and it should move focus into the board.

Opening the board should not erase the current runtime context.

## Reconfigure contract

Reconfiguration includes:

- switching compact and expanded mode,
- moving between rows,
- moving between sections,
- and collapsing or expanding history.

During reconfiguration:

- the selected row or section should remain stable unless a new choice is
  intentionally made,
- the header should update its summary without confusing the current selection,
- the board should continue to announce meaningful state changes,
- and the close path should remain available.

The board should not feel like a new page every time the mode changes.

## Close contract

When the board closes:

- it should return the player to the opener or the last play surface,
- it should restore focus to the opener,
- it should preserve the current board state for the next open, if that state
  is still relevant,
- and it should not lose the last chosen row unless the runtime itself changes
  it.

Closing the board should feel like backing out of a tool, not abandoning a
scene.

## Transition rules

Recommended transition rules:

- open should be slightly more legible than close,
- close should be quick and reliable,
- mode switching should not reset selection unless required,
- row selection should not reset the header summary,
- history expansion should not hide the current choice.

These rules keep the board predictable on keyboard, touch, and gamepad.

## Accessibility contract

The board transition should preserve:

- a single focus entry point on open,
- a single focus restore path on close,
- stable labels for open, compact, expanded, and close,
- no hidden transition state that the player must guess,
- and a readable reason when reconfiguration changes what is visible.

## Validation rules

The contract should fail visibly if it:

- opens without a focus target,
- closes without restoring context,
- resets selection on every mode toggle,
- makes open/close feel like unrelated pages,
- or loses the current board state without a runtime reason.

## Out of scope

- No new mission authority.
- No new save schema.
- No replacement for the row, section, header, or history contracts.
- No runtime mutation path.
- No new navigation model for the rest of the shell.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one explicit open action,
2. one explicit close action,
3. one mode toggle that preserves selection,
4. one focus restore path after close,
5. one preserved selected row across reopen when context has not changed,
6. one readable transition summary for reconfiguration.

## Open questions

- Should the board remember compact versus expanded mode across sessions?
- Should reopen land on the last selected row or the most relevant active row?
- Should history expansion count as reconfiguration or as a separate action?
- Should the shell expose a single board state memory or keep it local to the
  board?

## Anything else?

Yes. This contract is deliberately about motion between states, not a new
system. It keeps the acceptance surface feeling like one tool that can be
reopened and reused, rather than a set of different pages stitched together.

## Addendum (2026-07-28): the open transition is real on desktop, but the compact shell still blocks the entry point

- A desktop browser probe triggered the board and confirmed the open state
  mounts as a single overlay with a stable `Close` path and preserved board
  content.
- The board can therefore open, hold a header, and present row content without
  switching to a separate page.
- The compact/mobile shell still hides the trigger cluster entirely, so the
  transition contract is only partially exposed across viewport classes.
- The next question is not whether the transition exists, but whether the
  public compact shell should expose the same transition affordance in a
  smaller form.
