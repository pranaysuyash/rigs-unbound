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

## Addendum (2026-07-28) - the canonical Field 02 shell exposes its live status stack before entry

- Re-checked the live browser on the canonical `http://localhost:4173/?acceptance=field-02` surface after the dev server was relaunched.
- The shell opens in a measuring state rather than a ready state:
  - title: `Rigs Unbound`
  - `#bootstrap-status`: `Measuring device performance… Choose Enter the field to begin.`
  - `#save-status`: `New field ready · progress saves locally`
  - `#profile-status`: `Quality: measuring. Still measuring frame performance.`
  - `#runtime-diagnostics.hidden`: `false`
  - `main[aria-busy]`: `false`
  - focus lands on `BUTTON#enter-world`
  - no `[role=progressbar]` is present
  - the live status-region set includes `save-status`, `profile-status`, `bootstrap-status`, `control-lesson`, and `toast`
- The viewport also remained horizontally clean at the default browser size, so the public shell is still readable before entry.
- The shell source now includes a masthead accessibility link to the statement
  page, and the refreshed live browser surface shows that link in the rendered
  masthead.
- The named contract and the statement page now live at
  [Accessibility Statement and Public Promise Contract](ACCESSIBILITY_STATEMENT_AND_PUBLIC_PROMISE_CONTRACT_2026-07-28.md)
  and [Accessibility Statement](../ACCESSIBILITY_STATEMENT.md).
- Evidence depth: Tier 4 live browser inspection.

## Addendum (2026-07-29) - the earlier runtime-diagnostics visibility note is stale

A later live browser probe on the canonical shell surface corrected the earlier
profile evidence:

- `#profile-status` is visible and reads `Quality: measuring. Still measuring frame performance.`
- `#runtime-diagnostics` is hidden again on the public shell.
- `#bootstrap-status` is the real loading affordance and currently exposes a
  `progressbar` role while measuring.

So the public shell's current split is now more precise: loading progress is
semantic, profile state is visible, and diagnostics remain hidden from the
player HUD.

## Addendum (2026-07-29) - the earlier runtime-diagnostics visibility snapshot is stale

A later live browser probe on the canonical shell corrected the old snapshot:

- `#profile-status` is visible and reads `Quality: measuring. Still measuring frame performance.`
- `#runtime-diagnostics` is hidden from the public HUD again.
- `#bootstrap-status` is the real loading affordance and exposes a semantic
  `progressbar` while the shell is measuring.

So the current public split is: loading progress is semantic, profile state is
visible, and diagnostics remain developer-hidden.

## Addendum (2026-07-29) - the canonical shell now splits diagnostics by route

A current route comparison shows the shell has a deliberate two-surface split:

- the public shell hides `#runtime-diagnostics`;
- the `?acceptance=field-02` surface shows it with the renderer/backend
  summary;
- both surfaces keep the semantic loading progressbar and the visible quality
  line.

That makes the earlier snapshot too broad. The live contract is now clearer:
public shell stays concise, acceptance/developer shell exposes the deeper
runtime summary.

## Addendum (2026-07-29) - the accessibility tree follows the same route split

A current route comparison shows the same policy in the browser tree:

- the public shell hides `#runtime-diagnostics`;
- the `?acceptance=field-02` shell reveals the renderer/backend summary;
- `#bootstrap-status` remains the semantic progressbar;
- `#profile-status` remains the visible quality line.

So the earlier accessibility snapshot is still useful as a public-shell record,
but it should now be read alongside the acceptance route rather than as a whole-
product visibility statement.

## Addendum (2026-07-29) - ADR-0039 is the policy name for this public/acceptance split

The split observed in this evidence note now has a durable decision anchor:

- ADR-0039 keeps `#bootstrap-status` public and semantic;
- ADR-0039 keeps `#profile-status` public and visible;
- ADR-0039 route-gates `#runtime-diagnostics` to the acceptance/developer
  surface.

That gives this evidence note the right framing: it records the live browser
state, while ADR-0039 records the policy behind why the public shell stays
concise and the acceptance shell carries the deeper summary.

## Addendum (2026-07-29) - screen reader narration pass is now the remaining manual step

The browser-visible accessibility work is now in good shape: the shell has
readable status lines, semantic loading progress, a coherent tree, and the
statement page is browser-reachable. The remaining open step is the manual
screen-reader narration pass captured in
[Screen Reader Narration Pass](SCREEN_READER_NARRATION_PASS_2026-07-29.md).

That note is the next concrete QA artifact for the public shell and statement
page. It keeps the narration gap explicit without pretending it is already
closed.
