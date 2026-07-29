# Accessibility Statement

Last updated: 2026-07-29

We want Rigs Unbound to be understandable, operable, and readable for as many
players as possible in the browser.

## Current accessibility posture

The current public shell already has:

- keyboard access to the main flow;
- a skip link to the playable world;
- visible focus treatment;
- semantic buttons and live status regions;
- a masthead accessibility link in the shell source that points to this page;
- the public Accessibility link makes the statement reachable from the shell;
- narrow/mobile readability without horizontal overflow;
- explicit bootstrap, save, and profile text in the shell;
- fallback-aware browser behavior in the live runtime;
- the shell accessibility tree exposes the skip link, main region, dialog, and key controls;
- the public statement remains readable when JavaScript is disabled;
- the public statement remains readable at 200% browser scale without horizontal overflow;
- reduced-motion browser settings are honored in the shell;
- the bootstrap loading state exposes a semantic progressbar while measuring, then becomes a ready status once the shell is live;
- the world clock stays passive text so the shell does not chatter on time updates;
- terse touch controls now expose clearer spoken names in the shell.
- live announcement surfaces now speak as full phrases in the shell (current objective, loading, save, quality, notification, and control lesson);
- the notification toast stays hidden when idle so it does not sit in the accessibility tree between messages.

## Manual inclusive QA status

The browser-delivery and accessibility trail has already exercised or recorded:

- 200% browser scale staying in bounds without horizontal overflow;
- JavaScript-disabled rendering of this statement page;
- reduced-motion behavior in the shell;
- accessibility-tree structure for the shell and the statement page.

The remaining manual step is a spoken screen-reader pass over the live shell
and statement page so the public promise can be judged by narration quality,
not only by browser-visible structure.

## What is still being improved

- spoken screen-reader narration for the public shell;
- keeping the statement easy to find from the shell and docs;
- stronger inclusive QA around screen-reader narration;
- clearer public feedback and issue-reporting guidance.

## Known gaps

The shell is structurally accessible, but not every experience has been
validated with manual assistive-technology testing yet.

The current public surface uses a semantic loading progressbar during
bootstrap, but the broader loading story still needs more manual assistive-
technology validation and clearer player-facing phrasing.

## Feedback

If you find an accessibility issue, please record it in the project docs or
open the relevant review surface so it can be tracked alongside the other
browser-delivery evidence.

## Related evidence

- [Shell Accessibility Evidence](research/SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md)
- [Accessibility and Profile Visibility Live Repo Analysis](research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)
- [Accessibility Statement and Public Promise Contract](research/ACCESSIBILITY_STATEMENT_AND_PUBLIC_PROMISE_CONTRACT_2026-07-28.md)

## Notes

This statement is a public-facing summary of the current browser shell, not a
promise that every accessibility standard has already been fully verified.
The team will keep improving the browser experience and updating this page as
new evidence lands.
