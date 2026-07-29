# Shell Accessibility Next Seam

**Date:** 2026-07-28  
**Status:** static analysis note  
**Evidence tier:** Tier 1 static source inspection and design reasoning

## Why this note exists

The current repo already treats the unified shell as a real contract surface,
not a decorative UI layer. The next durable analysis seam is therefore not
"more UI" in the abstract. It is the accessibility and focus contract for the
major overlays that already define the shell.

This note records the next safe slice so the shell work can keep moving without
drifting into the contested `src/game/` runtime files.

## Sources reviewed

- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`
- `docs/research/OPERATOR_OBSERVABILITY_AND_DIAGNOSTICS_CONTRACT_2026-07-26.md`
- `docs/reviews/MAP_OVERLAY_DIALOG_AND_FOCUS_ISSUE_REVIEW_2026-07-26.md`
- `docs/reviews/PAUSE_STATE_ANNOUNCEMENT_ISSUE_REVIEW_2026-07-26.md`
- `docs/reviews/TOUCH_RADIAL_ACTION_BOOT_BLOCKER_ISSUE_REVIEW_2026-07-28.md`
- `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`

## What the current docs already prove

1. The shell is intended to be one layer over the simulation, not a second
   game.
2. Major overlays are already a named inventory: map, contract board,
   workshop, garage/fleet roster, pause menu, labs drawer, and control lesson.
3. Accessibility is already a structural requirement in the shell spec.
4. The operator-observability contract already treats local diagnostics as an
   acceptance surface, not a gameplay authority.
5. Existing reviews still frame the map, pause, and radial surfaces as live
   focus/announcement contracts rather than solved details.

## What is still missing

- The contract-board overlay is planned but not yet live in the shell spec's
  current evidence lane.
- The shell-spec contract is still describing the accessibility shape rather
  than proving it in the runtime surface.
- The next durable proof should cover modal overlay semantics, focus restore,
  escape/close behavior, live announcements, and keyboard/touch parity as one
  coherent accessibility contract.

## Next safe slice

The next analysis/documentation slice should focus on the contract-board /
major-overlay accessibility contract:

- `role="dialog"` and `aria-modal="true"` for major overlays,
- visible heading and description linkage,
- focus trapping and restoration,
- explicit close/back affordances,
- announcement surface for state changes,
- keyboard parity for every major action,
- no hidden second authority for the board or shell.

That slice is a good fit for the current repo state because it advances shell
trust and user comprehension without requiring contested runtime edits.

## Addendum (2026-07-28) - the next seam now includes bootstrap progress semantics

A live browser probe on a `390 x 844` viewport tightened the next shell-access
slice:

- `#welcome-panel` is already a real modal gate with `role="dialog"` and
  `aria-modal="true"`.
- `#bootstrap-status` is a polite `role="status"` region with narrated text,
  not a progressbar.
- no `progress` element or `role="progressbar"` is present in the current live
  shell.
- `aria-busy` is not set on the bootstrap status region.

That means the next seam is no longer just “major overlays need focus and
restore behavior.” It also includes the bootstrap / startup announcement path:
readable status text is already there, but a bounded progress contract is not.

## Addendum (2026-07-28) - the mission board is desktop-first in the current compact shell

A mobile-sized browser probe found that `#mission-board-button` exists in the
DOM but has no rendered box because `.masthead__buttons` is hidden under the
current responsive rules.

So the contract-board / major-overlay slice is now split into two questions:

- desktop overlay accessibility, which is already partially proven,
- compact-shell exposure policy, which currently leaves no touch entry point
  for the contract board.

That is an intentional tradeoff in the current shell, but it should be named
explicitly so future work can decide whether the board deserves a mobile entry
path or should stay desktop-first.

## Addendum (2026-07-28) - the touch Radar control is now a single-purpose toggle

A code-path review found a real coupling bug in the compact shell: the touch
`Radar` action could also trigger the pause fallback through the generic tap
handler. The runtime now skips the generic tap path for
`button[data-tap-action="navigator"]`, so `Radar` only toggles the navigator
overlay.

That is a useful accessibility and trust improvement even before the next
browser confirmation pass:

- the visible label now matches the actual action,
- the compact shell no longer risks opening pause from a Radar tap,
- the pause fallback stays reserved for explicit pause entry points.

Evidence depth: Tier 1 source inspection of the corrected runtime path.

Anything else? Yes. The next browser probe should confirm the compact-shell
Radar button no longer cross-wires pause state.

## Addendum (2026-07-28) - the touch Radar control is now confirmed live as a single-purpose toggle

A fresh browser probe on a `390 x 844` mobile viewport confirmed the runtime
fix for the touch `Radar` control:

- tapping `Radar` turns `#navigator-panel` on,
- `#pause-overlay` stays closed,
- the active element remains the `Radar` button,
- the prompt stays on the current world state rather than shifting into pause.

That means the compact shell now has a clean separation between a persistent HUD
toggle and the pause modal path.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. This is a good example of the shell contract becoming more
truthful without needing a larger UI rewrite.

## Addendum (2026-07-28) - the mobile map overlay now proves focus handoff too

A fresh live browser probe on a `390 x 844` mobile viewport confirmed that the
map overlay now hands focus to its close control on open:

- `Map` opens `#map-overlay` as a real dialog,
- `#map-close` becomes the active element after the delayed open assertion,
- the focus stays on the close control through later checks,
- the earlier mobile map-focus gap is now closed.

That means the touch-exposed major overlays are now better separated:

- `Map` is a touch-exposed overlay with working close focus,
- `Radar` is a pure navigator toggle,
- `Contracts` remains desktop-first by policy.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The shell is no longer just touch-exposed; at least one touch-
exposed overlay now proves the focus contract end to end.

## Addendum (2026-07-28) - the mobile radial wheel now proves the full open/focus contract

A fresh browser probe on a `390 x 844` mobile viewport confirmed the radial
quick-action contract end to end:

- `Quick` opens `#radial-overlay` as a visible dialog,
- the overlay stays open across later checks,
- `#radial-menu-close` becomes the active element after the delayed focus
  assertion,
- the close control stays focused through later checks,
- the four-item wheel remains visible.

That means the compact shell now has two touch-exposed overlays with working
focus handoff:

- Map,
- Radial quick actions.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The mobile shell’s overlay contract is now much more
credible, because the two most important touch surfaces both prove a real open-
and-close story.

## Addendum (2026-07-28) - the main prompt line is now a live status region

`#current-prompt` now carries the announcement contract directly:

- `role="status"`
- `aria-live="polite"`
- `aria-atomic="true"`

A live browser probe confirmed the attributes are present before the world is
entered and while pause is open. That means the shell’s primary prompt line now
serves as a real announcement surface, not just a heading whose text changes.

Evidence depth: Tier 4 live browser inspection plus Tier 1 markup inspection.

Anything else? Yes. The shell now has a stronger single source for the player’s
headline state, which is exactly where pause and startup narration should live.

## Addendum (2026-07-28) - the desktop contract board now stays open and focuses its close control

A fresh desktop browser probe confirmed the contract board path after the
suppression fix:

- clicking `Contracts` opens `#mission-board` as a real dialog,
- `#mission-board-close` becomes the active element and stays focused,
- the board remains visible across later checks,
- selecting a row enables `Accept contract`,
- the board can still be closed cleanly.

That means the shell now has a third major overlay with a working open/focus/
selection path on the live runtime: Map, Radial quick actions, and the contract
board.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The desktop contract board is no longer a lingering focus
bug; it is a stable overlay contract that now matches the shell spec more
closely.

## Addendum (2026-07-28) - the bootstrap shell now exposes determinate loading semantics in source

The boot surface has moved from a binary loading label to a determinate warmup
contract in source:

- while the shell is still warming up with a dedicated bootstrap counter, `#bootstrap-status` is now a
  `progressbar` rather than a plain status line;
- the shell’s `aria-busy` state follows that warmup window instead of staying
  pinned false;
- once the warmup sample target is satisfied, the same surface returns to a
  normal status role.

That is the accessibility seam we were looking for: the player now has an
explicit loading affordance, not just a narrated one. Browser verification is
now complete.


## Addendum (2026-07-28) - accessibility-tree proof confirms the bootstrap contract

A follow-up browser probe through the accessibility tree confirmed the warmup
contract is not just visible in the DOM; it is present to assistive tech too:

- the initial loading surface exposes `progressbar` in the AX tree;
- the ready surface remains a plain `status`;
- the player-facing text is preserved as the accessible name/content.

That matters because the accessibility seam is now proven at the API surface
screen readers consume, not just in markup inspection.


## Addendum (2026-07-28) - the public profile line now carries the clearer ready-state wording too

A follow-up live browser probe confirmed the profile line now behaves like a
proper user-facing status region across the full shell lifecycle:

- warmup: `Quality: measuring. Still measuring frame performance.`
- post-entry ready state: `Quality: standard. Full scenery detail is active.`
- the loading progress surface stays separate from the profile surface;
- the HUD remains readable on its own without collapsing into developer
  diagnostics.

That is a good shell-accessibility seam because the player now has both a
warmup indicator and a post-entry quality statement that use plain language.

## Addendum (2026-07-28) - the hidden diagnostics lane now names the fallback policy too

The developer-surface formatter now reports the renderer visibility policy in
terse form while staying hidden from the public HUD. The live browser probe
confirms the warmup and steady shapes, and the fallback form is covered by the
policy helper test:

- warmup: `Renderer visibility warmup: standard (insufficient-frame-samples)`;
- steady: `Renderer visibility steady: standard`;
- fallback: `Renderer visibility fallback: mobile-safe (...)`.

That keeps the public shell readable while preserving an explicit fallback
summary for operators and reviewers.

## Addendum (2026-07-28) - the next accessibility seam is dialog naming consistency

A fresh live browser audit confirmed the shell already has the basics in place:

- a visible `Skip to playable world` link exists;
- the root shell exposes semantic landmarks (`main`, `header`, `aside`,
  `footer`);
- the profile/status surfaces are live regions;
- the modal surfaces are using `role="dialog"` with `aria-modal="true"`.

The next thing to inspect is whether every modal surface has an explicit
accessible name in the accessibility tree, because the current DOM shows a mix
of explicit labels and heading-driven dialogs. That is not yet a bug report;
it is the next accessibility seam to verify with the same browser-first care.

Evidence depth: Tier 4 live browser inspection plus Tier 1 DOM inspection.

## Addendum (2026-07-29) - ADR-0039 names the public/acceptance split behind this seam

This shell-accessibility seam now sits under the same browser-policy decision
trail named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` readable in plain language;
- acceptance/developer surfaces can keep the deeper runtime summary without
  turning the public shell into an operator console.

That framing matters here because the seam is about the player’s first
impression, not about duplicating the diagnostics lane in the public HUD.
