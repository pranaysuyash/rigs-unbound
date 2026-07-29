# Map Overlay Dialog and Focus Issue Review

**Date:** 2026-07-26  
**Status:** Open accessibility/operability issue; no runtime change landed in this pass  
**Severity:** P2 player-facing keyboard and assistive-technology contract gap  
**Evidence tier:** Tier 1 static source inspection. No browser, screen-reader, or device command was run in this pass.

## Finding

`#map-overlay` behaves like a modal interaction surface, but it is currently only marked up as a labeled section:

- it is shown and hidden by `state.mapOpen` and `mapOverlay.hidden`;
- it has `aria-label="Field map"`;
- it does not declare `role="dialog"` or `aria-modal="true"`;
- the focus path does not move into the overlay when it opens;
- the close path does not restore focus to the control that opened the overlay.

The runtime does suppress some helper UI while the map is open, so this is not merely a visual overlay. It is already a mode switch. The missing piece is the accessibility contract that makes that mode switch obvious, operable, and recoverable for keyboard and assistive-technology users.

## Current evidence

| Artifact                        | Role now                                                                          | Canonical status                                   |
| ------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- |
| `index.html` `#map-overlay`     | Full-screen map surface with `aria-label` only                                    | Modal-like surface, not a declared dialog          |
| `src/main.ts` map toggle path   | Toggles `state.mapOpen` and `mapOverlay.hidden`, draws the field map when opening | Operability exists, but focus management is absent |
| `src/main.ts` keyboard path     | `Escape` closes the map before pause, so the map is not a dead end                | Good recovery behavior, incomplete dialog contract |
| `src/styles.css` `.map-overlay` | Visually occupies the whole viewport                                              | Presentation only; no semantic contract            |

## Why this matters

The current shape can work for pointer users, but keyboard and screen-reader users need three things to be explicit:

1. that the map is a separate mode and not just another section of the page;
2. how focus enters and exits that mode;
3. how the user gets back to the prior control after closing it.

Without that contract, the player can land on a seemingly modal overlay that is visually obvious but semantically under-described. That is a real operability risk, not just a standards nit.

## Recommended next proof slice

The next durable slice should make the map overlay a true dialog contract:

1. add dialog semantics to the overlay;
2. move focus into the close control or an equivalent entry point when the map opens;
3. restore focus to the opener when the map closes;
4. keep the existing Escape-to-close behavior;
5. confirm the tab order and announcement behavior in the browser.

## Closure trigger

This issue closes only when the map overlay is explicitly treated as a modal dialog in markup and focus flow, and that behavior is proven in-browser for keyboard users. Documentation alone does not close the issue.

## Anything else?

The map overlay is the next a11y surface worth hardening because it already changes interaction mode. If we leave it as only a labeled section, the repo will keep a visible-but-under-specified control surface in the public player path.

## Addendum (2026-07-28): live browser proof shows the map opens, but focus still does not land inside it

- Re-checked the canonical browser surface at `http://localhost:4173/`.
- Opening the map through the runtime path successfully makes `#map-overlay`
  visible and sets its aria-hidden state to `"false"`.
- The focus probe after opening still reports `document.activeElement` as
  `BODY`, not `#map-close` or another overlay control.
- That means the original static finding is still true in the live shell:
  the map behaves like a modal mode switch, but it is not yet an accessible
  dialog because focus does not move into the overlay.
- Evidence depth: Tier 4 live browser inspection plus Tier 1 static source
  inspection.

## Addendum (2026-07-28): source-side focus deferral has now landed, browser recheck pending

- `src/main.ts` now routes overlay entry focus through a deferred
  `focusAfterPaint(...)` helper for map, pause, and radial overlays.
- The code change is intended to let the focus land after the overlay is
  painted rather than in the same tick as the click path.
- This note is intentionally not claiming browser verification yet; the next
  proof step is to re-open the live shell and re-check the focus landing path
  after the patch.

## Addendum (2026-07-28): browser recheck now closes the map-overlay focus gap

- Re-opened the canonical browser shell and triggered the map overlay through
  the live `Map` control.
- The overlay now presents as a real modal dialog surface:
  - `#map-overlay` is visible;
  - `role="dialog"` is present;
  - `aria-modal="true"` is present;
  - the close button is the active element on open.
- Closing the overlay restores focus to `#game-canvas` instead of leaving the
  browser on `BODY`.
- That satisfies the issue’s closure trigger: the map overlay is now treated as
  an accessible modal dialog in both markup and focus flow, and the browser
  proof is live.

## Addendum (2026-07-28) - mobile focus recovery is now confirmed live

A fresh browser probe on a `390 x 844` mobile viewport confirmed the map
overlay now lands focus on `#map-close` after opening:

- `#map-overlay` opens with `role="dialog"` and `aria-modal="true"`;
- `#map-close` becomes the active element after the delayed open assertion;
- focus remains on the close control through later checks;
- the earlier mobile map-focus gap is now closed.

Evidence depth: Tier 4 live browser inspection.

## Anything else?

Yes. Keep the map issue closed as a focus-recovery problem; any future work on
that surface should focus on content, not re-opening the same accessibility bug.

## Addendum (2026-07-28) - the contract board is now open/focus-safe on desktop as well

The same shell hardening that fixed the map overlay also corrected the contract
board path:

- `Contracts` opens `#mission-board` as a real dialog,
- `#mission-board-close` receives and keeps focus,
- the board stays visible instead of getting displaced by the lesson surface,
- selecting a row enables `Accept contract`.

That is not a map issue, but it belongs in the same shell contract family: the
major overlay stack now proves open/focus behavior on the live runtime.

Evidence depth: Tier 4 live browser inspection.

## Anything else?

Yes. The overlay stack is now behaving as a stack, not as a set of competing
surfaces.

## Addendum (2026-07-29) - ADR-0039 keeps the public overlay stack separate from diagnostics

The map overlay contract now sits alongside the browser-policy split named in
ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- acceptance/developer diagnostics stay on the non-public side of the split.

That matters because the overlay stack is a player-facing shell concern, not a
place for the deeper runtime summary to leak into the public HUD.
