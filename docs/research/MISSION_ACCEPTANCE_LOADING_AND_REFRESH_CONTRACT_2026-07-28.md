# Mission Acceptance Loading and Refresh Contract (2026-07-28)

**Status:** proposed presentation contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related surface contract:** [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md)  
**Related empty-state contract:** [Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md)  
**Related board header contract:** [Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md)

## Purpose

Define how the acceptance board should behave while it is loading or refreshing
data so that it does not look broken or empty by accident.

This contract is separate from the empty-state contract:

- loading means the board is waiting on refreshed data or rebuilding its
  visible rows,
- empty means the board has genuinely no meaningful rows to show in the
  current context.

## Decision

The board should use an explicit loading or refresh state whenever the current
rows are not yet ready to be shown.

The board should not silently fall through to an empty-looking panel if the
reason is only that rows are still being recomputed.

## Loading contract

Recommended loading behavior:

- show a short loading or refreshing message,
- keep the board title visible,
- keep the close/back path visible,
- do not imply that the board is empty when it is merely waiting,
- preserve the last known context if one is available.

The loading message should be short and honest.

## Refresh contract

When the board is updating from a recent state change:

- keep the current selection or section visible if possible,
- show that the board is refreshing rather than resetting,
- avoid clearing the surface unless the runtime really needs to rebuild it,
- and keep the player oriented with the header summary.

If refresh is slow enough to be noticeable, it should remain readable.

## Distinction from empty state

The board should clearly distinguish:

- loading / refreshing,
- empty state,
- and populated board.

That distinction should be obvious in both text and focus behavior.

## Accessibility contract

The loading / refresh state should support:

- a visible status line,
- a readable live announcement when the board changes state,
- no silent blank panel while waiting,
- clear recovery from loading into the normal board,
- and no confusion between "still loading" and "nothing to show."

## Validation rules

The contract should fail visibly if it:

- shows a blank board while rows are still loading,
- confuses loading with empty state,
- hides the close/back path during refresh,
- or resets the board in a way that makes it feel broken.

## Out of scope

- No new mission authority.
- No new save schema.
- No separate loading page.
- No replacement for the surface, empty-state, header, or row contracts.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one explicit loading or refreshing message,
2. one stable board title and close/back path during loading,
3. one visible distinction between loading and empty,
4. one preserved context line when data refreshes,
5. one accessible announcement that the board is still updating.

## Addendum (2026-07-28): the current runtime already has truthful bootstrap text, but not a progress meter

- Re-checked the live shell at `http://localhost:4173/?acceptance=field-02`
  in a 390 x 844 viewport.
- The shell now exposes truthful bootstrap text:
  - `#bootstrap-status` reads `Measuring device performance… Choose Enter the field to begin.`
  - `#profile-status` reads `Quality: measuring. Still measuring frame performance.`
  - `#save-status` reads `New field ready · progress saves locally`
- That means the current browser experience is already narrating warmup and
  readiness, but it still does not expose the first-class progress affordance
  this contract prefers:
  - no visible `progress` element,
  - no `role="progressbar"`,
  - no `aria-busy` marker.
- The correct conclusion is not “loading is missing”; it is “loading exists as
  truthful text, but the board/loading contracts still have room for a more
  explicit progress cue if the product wants one.”

## Open questions

- Should the loading message say "Loading contracts" or "Refreshing board"?
- Should loading preserve the last row list until the refresh completes?
- Should refresh be animated or just text-based?
- Should loading ever be shown if the board is rebuilt synchronously?

## Anything else?

Yes. This contract is the last obvious browser-experience guardrail for the
board lane. A board that is loading should not look empty; a board that is
empty should not look broken; a board that is populated should not bury the
player in noise.

## Addendum (2026-07-29) - ADR-0039 keeps the public loading story and the acceptance summary separate

This loading-and-refresh contract now belongs to the same browser-policy
family as the shell split named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic while the app is
  measuring;
- the public shell keeps `#profile-status` visible and readable;
- reviewer-facing runtime summary text stays on the acceptance/developer
  surface instead of leaking into the player-facing loading story.

That separation matters here because the board should remain honest about
loading and refresh without trying to become the operator diagnostics panel.

## Addendum (2026-07-29) - the next loading proof is compact-shell-safe context preservation

- The current contract already knows the board should say when it is loading
  or refreshing instead of looking empty by accident.
- The next proof slice should be one compact-shell-safe loading/refresh state
  that preserves:
  - the board title,
  - the last known selection or section context when available,
  - a short honest loading or refreshing message,
  - and the visible close/back path.
- That keeps loading distinct from empty state even on smaller viewports, and
  it avoids turning the board into a second diagnostics surface.
- Anything else? No. The loading story should explain waiting, not invent a new
  board mode.

## Addendum (2026-07-29) - loading should say loading on initial entry and refreshing on in-place updates

- Use "Loading contracts" for the initial load and "Refreshing board" for an in-place refresh.
- During refresh, keep the last known row list visible until the update completes so the board does not flicker into an empty state.
- If the board is rebuilt synchronously, do not show a loading state at all; just move straight to the ready board.
- Anything else? No. Loading should explain waiting, refreshing should explain re-fetching, and synchronous rebuilds should stay honest by skipping the loading phase.

## Addendum (2026-07-29) - loading should preserve the last row list until refresh completes

- During refresh, keep the last known row list visible until the update completes so the board does not flicker into an empty state.
- That preserves context while the board is waiting and keeps loading distinct from empty state.
- The loading message can say the board is refreshing, but the rows should still anchor the user until the new data arrives.
- Anything else? No. Refresh should update the board, not briefly erase it.

## Addendum (2026-07-29) - refresh should stay text-based rather than animated

- Refresh should remain text-based rather than animated so the board stays calm, readable, and easy to understand while it updates.
- If any motion exists elsewhere in the shell, it should belong to explicit content or transition rules, not to the loading state itself.
- That keeps the loading/refresh experience honest: the board says what it is doing instead of trying to perform a separate animation language.
- Anything else? No. Loading should explain waiting, and refresh should do it plainly.

## Addendum (2026-07-29) - synchronous rebuilds should skip loading entirely

- If the board is rebuilt synchronously, do not show a loading state at all; move straight to the ready board.
- That keeps loading reserved for cases where the player truly has to wait and prevents a zero-duration rebuild from becoming meaningless status noise.
- The board should still preserve its title, close/back path, and ready copy, but it should not pretend to load when it is already ready.
- Anything else? No. Synchronous rebuilds should be honest enough to skip the loading phase entirely.
