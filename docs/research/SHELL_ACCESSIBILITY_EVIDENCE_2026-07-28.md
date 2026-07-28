# Shell Accessibility Evidence (2026-07-28)

## Purpose

Capture the current state of the public shell accessibility contract in one
stable place so future analysis can reference the reusable probe, the compact
summary, and the remaining narration gap without rediscovering the same
evidence manually.

## Evidence sources

- Detailed probe: `npm run test:shell-accessibility`
- Compact summary: `npm run test:shell-accessibility:summary`
- Live browser surface: `http://127.0.0.1:4173/?proof=1`

## Observed state

- The public profile line is visible in the field-kit shell.
- The save/recovery line is visible and announced as a live status region.
- The operator diagnostics line remains hidden from the public HUD.
- The profile and save bands do not overlap on a 390 × 844 viewport.
- Chrome’s accessibility tree exposes both status lines as readable text.
- Both reusable commands exit cleanly with no console problems.

## Remaining gap

The only unproven piece is spoken narration in a manual screen reader pass
such as VoiceOver, NVDA, or JAWS. Browser-visible and accessibility-tree proof
are now in place, but this note does not claim a spoken narration result.

## Addendum (2026-07-28) - radial overlay focus still needs explicit handoff

- Re-checked the live radial quick-action overlay in the canonical browser
  after the shell evidence above was already in place.
- Opening the radial overlay renders the authored wheel, but the browser focus
  still lands on `BODY` instead of the close control:
  - `overlayHidden: false`
  - `overlayAria: "false"`
  - `activeTag: "BODY"`
  - `activeId: ""`
  - `closeFocused: false`
  - `itemCount: 8`
- That keeps the shell accessibility story honest: the radial wheel is now a
  real surface with real selection handling, but its focus landing is not yet a
  complete accessibility proof.
- Evidence depth: Tier 4 live browser inspection.

## Why this note exists

The repo already has durable reviews and a reusable probe. This note is a
small evidence landing page for the exact browser/accessibility state as of
2026-07-28 so future work can branch from a concrete reference rather than a
chat summary.


## Addendum (2026-07-28) - radial overlay focus handoff now succeeds

- Re-checked the live radial quick-action overlay after the shared overlay
  focus helper was hardened in `src/main.ts`.
- Clicking `Quick` now opens the wheel with focus landing on the close control:
  - `overlayHidden: false`
  - `overlayAria: "false"`
  - `activeTag: "BUTTON"`
  - `activeId: "radial-menu-close"`
  - `closeFocused: true`
  - `itemCount: 8`
- That closes the specific accessibility gap this note had been tracking. The
  remaining proof work for the wheel is now keyboard parity and announcement
  behavior, not focus handoff.
- Evidence depth: Tier 4 live browser inspection.

## Addendum (2026-07-28) - radial selection announces through a live status region

- Re-checked the live wheel after focus handoff landed on the close control.
- The wheel items are real buttons, and clicking a wheel action updates the
  toast live region with selection feedback:
  - `#toast` has `role="status"`
  - `#toast` has `aria-live="polite"`
  - clicking `Diff Lock (100%)` changes the toast text to
    `Diff Lock (100%) off.`
  - the clicked item’s `aria-pressed` state updates to `"false"`
- That means the wheel now has a visible and assistive-technology-friendly
  selection announcement path. Spoken narration in a manual screen reader pass
  is still a separate check, but the runtime feedback mechanism itself is live.
- Evidence depth: Tier 4 live browser inspection.
