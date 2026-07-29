# Accessibility Statement and Public Promise Contract (2026-07-28)

## Skills consulted

1. [Accessibility Auditor](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/accessibility-auditor/SKILL.md)

## Purpose

Name the durable public accessibility statement boundary for the current
browser-first surface. The live shell already proves keyboard access, visible
status regions, focus landing, and narrow-layout readability. What remains is
keeping the statement easy to find and keeping its evidence current so a player
can see where accessibility status, known issues, and feedback live without
having to infer that from runtime diagnostics or chat history.

This note is not a runtime refactor. It is a public-promise contract that keeps
the accessibility story durable and discoverable.

## Current evidence base

- Live shell evidence:
  - [Shell Accessibility Evidence](SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md)
- [Screen Reader Narration Pass](SCREEN_READER_NARRATION_PASS_2026-07-29.md)
- Live repo accessibility analysis:
  - [Accessibility and Profile Visibility Live Repo Analysis](ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)
- Browser-delivery policy trail:
  - [3D Web Platform Accessibility & Deliverability Audit](3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
  - [Web Loading and Profile Bootstrap Contract](WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
- Browser-policy decision trail:
  - [ADR-0039: Browser policy surface split keeps bootstrap/profile public and route-gates diagnostics](../decisions/ADR-0039-browser-policy-surface-split-keeps-bootstrap-profile-public-and-route-gates-diagnostics.md)

## What the live shell already proves

- The public shell exposes readable bootstrap, save, and profile status lines.
- Keyboard focus lands on the `Enter World` control.
- The shell stays readable at narrow/mobile widths without horizontal overflow.
- A dedicated progress bar is still absent, so the loading story is textual
  rather than meter-based.

## What is still missing

- one clear statement of current conformance posture;
- one durable route for feedback or issue reporting;
- one compact known-issues section or link to the active accessibility gaps;
- one visible last-updated stamp so the statement can be audited over time.

## Contract shape

A good public accessibility statement should be:

1. discoverable from the public shell or the main docs navigation;
2. readable without developer tooling;
3. scoped to the browser-facing public experience;
4. honest about known gaps and what is already working;
5. separate from operator diagnostics and runtime debugging data.

At minimum, the statement should answer:

- what level of accessibility is currently being targeted;
- what the team believes already works;
- what known gaps remain;
- how a user can report a problem;
- when the statement was last reviewed.

## Recommended next proof slice

1. Add or link a durable accessibility-statement page from the public docs or
   shell navigation.
2. Keep the statement separate from runtime diagnostics.
3. Ensure the statement names the current manual QA stack:
   - spoken screen reader pass,
   - 200% zoom / narrow reflow,
   - JavaScript-disabled fallback,
   - visible last-updated timestamp.
4. Keep the browser-delivery and accessibility contracts aligned so the public
   promise is explicit rather than implied.

## Revisit trigger

Revisit this note when the public shell or docs navigation has a stable,
auditable accessibility-statement pointer and the manual inclusive QA stack has
been run against it.

## Linked artifacts

- [Accessibility Statement](../ACCESSIBILITY_STATEMENT.md)
- [Browser Loading Progress Issue Review](../reviews/BROWSER_LOADING_PROGRESS_ISSUE_REVIEW_2026-07-28.md)
- [Accessibility and Profile Visibility Live Repo Analysis](ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)
- [Shell Accessibility Evidence](SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md)
- [Screen Reader Narration Pass](SCREEN_READER_NARRATION_PASS_2026-07-29.md)

## Anything else?

Yes: the live shell is already structurally accessible enough to operate. The
missing part is no longer the pointer itself. The missing part is the manual
inclusive QA stack that proves the public promise still holds under screen
reader, zoom, reflow, and JavaScript-disabled conditions.

## Addendum (2026-07-29) - the public accessibility pointer is live and durable

The shell now links to the public accessibility statement through the visible
`Accessibility` control in the masthead, and the statement page itself lives in
the repo as a durable artifact.

That means the public promise boundary is now discoverable from the browser
surface instead of only from repo knowledge. The remaining work is to keep the
statement current with the evidence trail and to run the manual inclusive QA
stack against the statement page itself.

## Addendum (2026-07-29) - browser-daemon probe confirms the public statement route is stable

A live browser-daemon status check on the canonical browser session reported
the current URL as `http://127.0.0.1:4173/accessibility` and the title as
`Accessibility Statement - Rigs Unbound`.

A live DOM probe of the same page confirmed:

- the main heading is `Accessibility Statement`;
- the visible links point to `Shell evidence`, `Live repo analysis`, and
  `Public promise contract`;
- the body text still carries the public-promise summary, the last-updated
  stamp, and the current accessibility-posture bullets.

That is useful evidence because it shows the public promise page is not only
present in the repo, but also reachable through the live browser surface and
still carrying the expected content shape.

## Addendum (2026-07-29) - the statement page now names the manual inclusive QA boundary

The public accessibility statement now carries an explicit manual-inclusive QA
section. It names the browser-level checks that are already part of the public
trail:

- 200% browser scale without horizontal overflow;
- JavaScript-disabled rendering of the statement page;
- reduced-motion behavior in the shell;
- accessibility-tree structure for the shell and the statement page.

It also keeps the remaining gap honest:

- spoken screen-reader narration still needs a live manual pass.

That is the right shape for the public promise. It keeps the statement
discoverable, it keeps the browser-level evidence visible, and it avoids
pretending the manual spoken pass is already done.

## Addendum (2026-07-29) - compact-viewport browser navigation confirms the statement is reachable

A live browser probe navigated directly to
`http://127.0.0.1:4173/accessibility.html` and confirmed the statement page
loads with the expected title, `Accessibility Statement - Rigs Unbound`.
The browser viewport was also resized to `390 x 844` during the probe, so the
statement has now been exercised at the same compact width class the shell
uses for mobile-like review.

That is still not the full manual inclusive QA stack. It does, however, move
the public promise from static documentation into a browser-reachable page
that has already been opened in a compact viewport.

## Addendum (2026-07-29) - the statement page also stays readable with JavaScript disabled

A follow-up browser probe loaded the same statement page with JavaScript
disabled. The page still rendered the public promise content, kept the title
`Accessibility Statement - Rigs Unbound`, and remained horizontally
uncluttered at `390 x 844`.

This closes one of the manual inclusive-QA assumptions: the public statement
does not depend on script execution to remain usable. The remaining proof gap
is now narrower and more specific, centered on screen-reader narration.

## Addendum (2026-07-29) - Chrome page-scale probe confirms 200% browser zoom stays in bounds

A Chrome CDP probe set the statement page scale factor to `2` and then
re-checked layout. The page stayed at `390 x 844` in the layout viewport, and
the measured `scrollWidth` still matched `innerWidth`, so there was no
horizontal overflow at 200% scale.

That is the most important browser-level result from this pass: the public
statement is not only readable without JavaScript, it also remains in bounds
at a 200% browser-scale probe. The remaining manual-QA gap is now primarily
screen-reader narration.

## Addendum (2026-07-29) - shell reduced-motion handling is live and browser-verified

A shell probe compared normal and reduced media states on a transition-bearing
overlay element. Under normal conditions, the overlay plate reported
`transitionDuration: 0.22s` and the backdrop reported `transitionDuration:
0.22s, 0.22s`. Under `prefers-reduced-motion: reduce`, both collapsed to
`1e-05s`, which matches the global CSS clamp.

That is enough to treat reduced-motion handling as verified for the shell
surface. The remaining manual-QA focus is now screen-reader narration.

## Addendum (2026-07-29) - the statement page exposes a coherent accessibility tree

A Chrome accessibility-tree probe of the statement page returned a root web
area named `Accessibility Statement - Rigs Unbound`, a `main` region named
`Accessibility Statement`, headings for the page sections, and the expected
links to the shell evidence, live repo analysis, and public promise contract.

That means the remaining screen-reader work is now specifically about spoken
narration and review quality, not missing landmarks or broken tree structure.

## Addendum (2026-07-29) - the main shell accessibility tree is also coherent

A Chrome accessibility-tree probe of the shell returned a `RootWebArea` named
`Rigs Unbound`, a `link` for `Skip to playable world`, a `main` region, a
`dialog` for the warmup panel, the expected action buttons, and the public
`Accessibility statement` link.

That means the remaining screen-reader work on the live shell is spoken
narration quality, not missing landmarks or broken control exposure.

## Addendum (2026-07-29) - terse touch controls now have clearer spoken names

The live shell accessibility-tree probe now reports clearer spoken names for the
short touch-action buttons: `Switch rig`, `Cycle camera view`, `Open map`,
`Toggle radar`, `Recovery unavailable`, and `Open quick actions`.

That is a concrete narration improvement, and it pairs with the newly named live
announcement surfaces on the shell: world clock, current objective, loading,
save, quality, notification, and control lesson. The remaining screen-reader
work is now spoken review quality, not unlabeled live regions.

## Addendum (2026-07-29) - the world clock and current objective now speak as full phrases

A fresh browser accessibility-tree probe now reports the current objective as a
full sentence rather than a bare label/value split. The world clock is now
passive text, so it no longer competes for spoken attention while the shell is
running. That makes the shell easier to follow in a real screen reader,
because the important live surface is now the objective, not the clock.

## Addendum (2026-07-29) - the shell no longer exposes anonymous live status nodes

A follow-up accessibility-tree probe found no `status` nodes without a spoken
name. The live shell now exposes named status surfaces for the world clock,
current objective, field prompt, save status, quality profile, loading status,
notification, and control lesson.

That closes the structural naming gap for the current accessibility pass. The
remaining work is now true spoken-review quality, not anonymous live-region
cleanup.

## Addendum (2026-07-29) - the notification toast now stays out of the tree while idle

The shell's notification toast is now hidden from the accessibility tree when
it is not carrying an active message. That keeps the live announcement surface
available for real feedback without leaving an idle notification region sitting
in the tree between announcements.

This is a small but useful noise reduction step. The remaining accessibility
work is still spoken-review quality, but the notification surface itself is now
quieter when the shell is idle.

## Addendum (2026-07-29) - the loading surface now exposes a semantic progressbar while measuring

A fresh live probe of the shell's bootstrap state now shows a named
`Loading status` progressbar while the shell is still measuring device
performance. The same surface switches back to a normal ready status once the
warmup threshold is met.

That means the earlier loading-gap notes were too broad. The remaining work is
not about missing progress semantics; it is about how cohesive and readable the
bootstrap/loading story feels to a human screen-reader user.

## Addendum (2026-07-29) - the public promise should keep citing the same browser-policy split

The accessibility statement stays strongest when it points at the same live
browser-policy that the shell already uses:

- public shell keeps `#bootstrap-status` semantic and visible;
- public shell keeps `#profile-status` visible and readable;
- acceptance/developer surfaces can carry `#runtime-diagnostics` without
  turning the public promise into an operator-only panel.

So the statement's job is not to duplicate diagnostics. Its job is to remain
the user-facing promise about what already works, what still needs manual QA,
and where to report gaps.


## Addendum (2026-07-29) - the remaining screen-reader focus is shell narration quality, not more structure

- The public statement and the shell evidence now agree that the remaining accessibility gap is spoken narration quality rather than missing landmarks or broken controls.
- The next useful proof slice is the same one the game-design pass named: the shell should speak the tow-plus-repair loop as a coherent recovery story, not as isolated status updates.
- In other words, the public promise is now structurally sound enough that the next improvement is about how the shell sounds when it guides the player through action, consequence, and recovery.
- Evidence depth: Tier 1 static synthesis from the current public-promise and loop notes. No new screen-reader run was executed in this addendum.

Anything else? Yes: the statement page is durable; the remaining work is narration quality on the live shell.

## Addendum (2026-07-29) - screen reader narration pass is the last manual boundary

The public accessibility contract now has a concrete manual QA artifact for
the remaining spoken narration check: [Screen Reader Narration Pass](SCREEN_READER_NARRATION_PASS_2026-07-29.md).

That keeps the contract honest about what is still unverified while making the
last manual step easy to find from the promise page itself.
