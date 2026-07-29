
## Addendum (2026-07-28) - pause focus and close recovery are live; announcement remains textual

A fresh browser probe of the pause path in the canonical shell confirms the
current state more cleanly:

- opening pause through `KeyP` presents a real dialog with `role="dialog"` and
  `aria-modal="true"`;
- focus lands on `#pause-resume` when the overlay opens;
- clicking Resume closes the overlay and returns focus to `#game-canvas`;
- the visible pause message is still just `Paused.` in `#current-prompt`;
- `#current-prompt` still has no dedicated `role` or `aria-live` contract of its
  own.

So the earlier keyboard/focus concern is no longer the open problem. The
remaining gap is the non-visual announcement contract for pause, which is still
textual rather than explicitly surfaced.

Evidence depth: Tier 4 live browser inspection.

## Anything else?

Yes. The pause path now behaves like a real modal, so the next proof should be
about announcement semantics rather than reopening the focus question.

## Addendum (2026-07-28) - the pause announcement surface is now explicit

The prompt/status line is now marked up as a live region in `index.html`:

- `#current-prompt` now has `role="status"`, `aria-live="polite"`, and
  `aria-atomic="true"`;
- a live browser probe confirms those attributes are present before entry and
  while pause is open;
- the pause dialog still opens and focus still lands on `#pause-resume`;
- the visible `Paused.` message now rides on an explicit announcement surface
  instead of plain text alone.

That closes the remaining pause-announcement gap the review was tracking.

Evidence depth: Tier 4 live browser inspection plus Tier 1 markup inspection.

## Anything else?

Yes. The pause path is now both modal and announced, so the old “textual only”
warning should be treated as closed in the current runtime.
