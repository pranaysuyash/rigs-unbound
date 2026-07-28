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

## Why this note exists

The repo already has durable reviews and a reusable probe. This note is a
small evidence landing page for the exact browser/accessibility state as of
2026-07-28 so future work can branch from a concrete reference rather than a
chat summary.
