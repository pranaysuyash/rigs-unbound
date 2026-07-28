# Touch Radial Action Boot Blocker Issue Review

Status: resolved as a boot blocker; live radial shell still needs stronger accessibility proof
Severity: P0 runtime blocker removed, accessibility/interaction proof remains
Scope: `src/main.ts`, `index.html`, touch-control wiring, live browser startup

## Finding

The canonical browser shell now boots again with the radial touch DOM in place.
`index.html` includes the required `#touch-radial-action` element and the radial
shell nodes that `src/main.ts` requires:

- `#radial-overlay`
- `#radial-menu-list`
- `#radial-menu-close`

The original startup blocker is no longer present.

## Evidence

- `src/main.ts:629`
  - boot requires `#touch-radial-action`
- `index.html`
  - touch controls now include `#touch-radial-action`
  - radial overlay shell nodes are now present in-markup
- `src/main.ts`
  - already implements the `openRadial` path in runtime branching
  - opens the wheel from the touch affordance and closes it through the shared
    overlay path

## Impact

- The shell can start without the previous missing-element fatal error.
- Browser-based verification of the radial behavior now shows the wheel opens,
  renders its items, and closes again, but the observed focus path still needs
  stronger proof.
- Earlier conclusions about the shell are no longer historical-only; the wheel is
  now a live surface, but its accessibility proof is still incomplete.

## Likely cause

The radial control shell and touch control were restored, and the runtime branch for
opening radial actions is now present in `src/main.ts`. The remaining question is
whether the focus and selection path is fully accessible in the browser.

## Recommended closure path

1. Keep the radial touch and shell elements as explicit runtime contract assets in
   the shell.
2. Continue proving the browser focus, escape-to-close, and announcement behavior
   for the live wheel.
3. Validate item selection and active-state announcement in-browser before treating
   the wheel as fully operable.

## What remains unverified

- What interaction model should be used for the selection path once the wheel is
  treated as a primary player surface.
- Whether any radial-specific announcements should be added now or deferred until
  the selection path is proven.
- Whether the wheel needs keyboard parity in addition to the touch/button entry
  that currently opens it.

## Addendum (2026-07-28) - focus handoff still lands on BODY

- Re-checked the live browser surface after the boot blocker was already
  resolved.
- The wheel opens from `#touch-radial-action` and renders its authored items,
  but focus does not land on `#radial-menu-close`:
  - `overlayHidden: false`
  - `overlayAria: "false"`
  - `activeTag: "BODY"`
  - `activeId: ""`
  - `closeFocused: false`
  - `itemCount: 8`
- So the original boot blocker is gone, but the interaction proof is still
  incomplete. The next closure step is explicit focus handoff plus keyboard
  parity, not another startup workaround.
- Evidence depth: Tier 4 live browser inspection.


## Addendum (2026-07-28) - focus handoff now succeeds; keyboard parity remains

- Re-checked the live browser surface after the shared overlay focus helper
  was hardened in `src/main.ts`.
- The wheel still opens from `#touch-radial-action` and renders its authored
  items, but the browser now focuses `#radial-menu-close` as intended:
  - `overlayHidden: false`
  - `overlayAria: "false"`
  - `activeTag: "BUTTON"`
  - `activeId: "radial-menu-close"`
  - `closeFocused: true`
  - `itemCount: 8`
- The boot blocker remains resolved, and the accessibility proof is stronger,
  but the remaining closure work is keyboard parity and announcement behavior
  for the wheel selection path.
- Evidence depth: Tier 4 live browser inspection.
