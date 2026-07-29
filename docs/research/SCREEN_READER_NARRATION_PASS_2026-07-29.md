# Screen Reader Narration Pass

- Date: 2026-07-29
- Status: planned manual QA pass; not yet executed to completion
- Evidence tier: Tier 1 synthesis
- Related contract: [Accessibility Statement and Public Promise Contract](ACCESSIBILITY_STATEMENT_AND_PUBLIC_PROMISE_CONTRACT_2026-07-28.md)
- Related evidence: [Shell Accessibility Evidence](SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md)
- Related browser policy: [ADR-0039: Browser policy surface split keeps bootstrap/profile public and route-gates diagnostics](../decisions/ADR-0039-browser-policy-surface-split-keeps-bootstrap-profile-public-and-route-gates-diagnostics.md)

## Purpose

The public shell now has the structural pieces the browser can verify:

- visible status lines;
- semantic loading progress;
- readable accessibility tree;
- compact statement page;
- route-gated diagnostics.

What remains is a spoken narration pass in a real screen reader. This note
turns that gap into a concrete manual QA script so the next reviewer does not
have to reconstruct the same checklist from scattered addenda.

## Routes to narrate

1. Public shell:
   - `http://127.0.0.1:4173/?acceptance=field-02`
2. Accessibility statement:
   - `http://127.0.0.1:4173/accessibility`

## Screen reader targets

Use at least one of:

- VoiceOver on macOS;
- NVDA on Windows;
- JAWS on Windows.

## What should be narrated on the public shell

The narration should make these facts discoverable without requiring sight:

- the page title and overall purpose;
- the skip link / route to playable world;
- the loading state and progress meaning;
- the visible quality/profile line;
- the save/status line;
- the current objective or primary action;
- the public accessibility statement link;
- the route-gated diagnostics policy, if the acceptance surface is used.

## What should be narrated on the accessibility statement page

The narration should make these facts discoverable without requiring sight:

- the page title and purpose;
- the current accessibility posture;
- the manual inclusive QA boundary;
- the known gaps, if any;
- the feedback / issue-reporting pointer;
- the last-updated stamp.

## Pass criteria

This pass is successful only if the screen reader narration is:

1. linear and understandable;
2. consistent with the visible browser state;
3. free of missing labels for the key public controls and status lines;
4. consistent across the public shell and the statement page;
5. not dependent on developer diagnostics to understand the player-facing flow.

## Failure signals

Treat the pass as incomplete if any of the following happen:

- the screen reader skips the skip link or major landmarks;
- the loading, profile, or save lines are not meaningfully announced;
- the statement page cannot be reached or understood from narration alone;
- the narration suggests the diagnostics route is part of the public shell;
- the spoken order is confusing enough that the user would need sighted help.

## What this note is not

- It is not evidence that the narration pass already succeeded.
- It is not a code change.
- It is not a replacement for the existing browser-tree evidence.

## Anything else?

Yes: if this pass cannot be done cleanly, the public promise is still too hard
to understand without sight.
