# Mission Acceptance Empty State and Fallback Contract (2026-07-28)

**Status:** proposed presentation contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related board header contract:** [Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md)  
**Related accessibility analysis:** [Accessibility and Profile Visibility Live Repo Analysis](./ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)

## Purpose

Define what the acceptance board should do when there are no meaningful rows
to show, or when the surface is otherwise empty enough to feel broken without
an explicit explanation.

The board needs a fallback posture, not because the data model is broken, but
because a visually empty choice surface can confuse players unless it explains
itself.

## Decision

The board should never present a blank or ambiguous empty surface.

If there are no active, available, deferred, or history rows worth showing in
the current context, the board should present an explicit empty-state message
with a clear way back to play.

## Empty-state contract

Recommended empty-state language:

- `No contracts right now.`
- `Return to play to discover more.`

The exact wording can change, but the message must not be silent. The board
must explain that the empty state is intentional and recoverable.

## Fallback contract

The empty state should also provide a fallback path:

- a clear close/back action,
- a short explanation of why the board is empty,
- and, if relevant, a hint that the player may need to move, discover, or
  recover before more rows appear.

The fallback should not create a second authority or a hidden loading flow.

## Visibility contract

When the board is empty:

- the header should still show the board title and mode,
- the body should show the empty-state explanation,
- the close/back action should remain visible,
- and the board should not appear like a rendering failure.

If a loading or refresh state exists in the future, it should be explicit and
distinct from the empty state.

## Accessibility contract

The empty state should be readable by sighted users and screen readers alike:

- short, direct text,
- no reliance on color alone,
- no blank panel with no explanation,
- no hidden row that must be discovered to understand the state,
- clear close/back behavior,
- and a reason the board is empty or not yet populated if that reason exists.

## Validation rules

The contract should fail visibly if it:

- shows a blank board with no explanation,
- hides the close/back action in the empty state,
- confuses empty state with loading state,
- or suggests the board is broken when it is simply empty.

## Out of scope

- No new mission authority.
- No new save schema.
- No fake loading spinner unless a real load phase exists.
- No replacement for the surface, header, row, section, history, or transition
  contracts.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one explicit empty-state message,
2. one visible close/back path,
3. one line that explains why the board is empty or what to do next,
4. one stable header summary that still names the board,
5. one accessible reading order that makes the empty state understandable.

## Open questions

- Should the empty state differ between “no active rows” and “nothing yet
  discovered”?
- Should the board show a discovery hint or keep the hint on the shell?
- Should the empty state change based on the selected mode?
- Should loading and empty states share the same visual panel but different
  copy?

## Anything else?

Yes. This contract exists because a blank board is not neutral. Without an
explicit empty state, the browser surface looks broken; with one, it becomes an
honest part of the game’s discovery loop.

## Addendum (2026-07-29) - the next empty-state proof is a compact-shell-safe recovery hint

- The current empty-state contract already has the right core shape:
  - an explicit empty-state message;
  - a visible close/back path;
  - a stable header summary;
  - a readable reason or next step.
- The next proof slice should be a compact-shell-safe empty state that keeps
  that same recovery hint visible without pretending the board is loading.
- In other words: loading should explain waiting, and empty should explain
  absence. The next contract slice should preserve that distinction even when
  the shell is small.
- Anything else? No. A blank board is still not neutral; it should be an
  explicit, recoverable state on every viewport that can open the board.

## Addendum (2026-07-29) - the empty state should distinguish no active rows from nothing yet discovered

- The empty state should use different copy for "no active rows" versus "nothing yet discovered" because those are different player situations with different next-step guidance.
- That keeps the board honest without adding a new system: the player should know whether the board is empty because nothing is available right now or because discovery has not yet unlocked anything to show.
- The visual shell can stay the same, but the explanation should match the cause of the empty state.
- Anything else? No. Empty state should explain the specific absence, not just say the board is empty.

## Addendum (2026-07-29) - the broader discovery hint should stay on the shell, not inside the empty board

- Keep the concise empty-board message in the board itself, and keep the broader discovery hint on the shell or other outer guidance surface.
- That keeps the empty board focused on explaining its immediate absence and recovery path instead of becoming a second tutorial panel.
- The board can still point the player back to play, but the more general discovery guidance should live outside the empty surface.
- Anything else? No. Empty state should explain the board; the shell can explain the wider discovery loop.
