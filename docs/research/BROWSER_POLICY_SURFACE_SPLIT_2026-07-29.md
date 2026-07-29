# Browser Policy Surface Split

**Date:** 2026-07-29  
**Status:** Current live shell contract snapshot  
**Evidence depth:** Tier 4 runtime/manual browser inspection plus Tier 1 source inspection

**Decision anchor:** [ADR-0039](../decisions/ADR-0039-browser-policy-surface-split-keeps-bootstrap-profile-public-and-route-gates-diagnostics.md)

## What the shell currently does

The live browser shell now has a three-part policy split:

- `#bootstrap-status` is the semantic loading surface and exposes a
  `progressbar` while the shell is measuring device performance.
- `#profile-status` is the player-facing quality line and stays visible on the
  public shell.
- `#runtime-diagnostics` is route-gated:
  - hidden on the public shell,
  - visible on `?acceptance=field-02`,
  - and used there to show the renderer/backend summary.

## Route comparison

The route split matters because it keeps the public shell quiet while still
leaving the deeper runtime summary available on the acceptance/developer
surface.

Observed behavior from live probes:

| Route | Bootstrap | Profile | Diagnostics |
| --- | --- | --- | --- |
| Public shell | semantic progressbar while measuring | visible quality state | hidden |
| `?acceptance=field-02` | semantic progressbar while measuring | visible quality state | visible renderer/backend summary |
| `?acceptance=field-02&rendererPolicy=off` | same public bootstrap/profile shape | same public bootstrap/profile shape | fallback diagnostics text |
| `?acceptance=field-02&rendererPolicy=stable` | same public bootstrap/profile shape | same public bootstrap/profile shape | direct-path diagnostics text |

Accessibility-tree probe detail:

- on the public shell, `#runtime-diagnostics` does not appear in the tree;
- on the acceptance route, the renderer/backend summary appears as static text,
  not as a live `status` region;
- the semantic live surfaces remain `#bootstrap-status` and `#profile-status`
  on both routes.

## Why this matters

This means the browser story is no longer about missing progress semantics.
That part exists.

The remaining product question is whether the public shell reads as one calm
warmup narrative, instead of three adjacent surfaces that players have to
mentally join:

- bootstrap progress,
- player-facing quality state,
- acceptance/developer diagnostics.

## What this is not

- It is not a missing loading affordance.
- It is not a missing visible profile line.
- It is not a renderer bug.
- It is not a public-shell diagnostics regression.

## Related current evidence

- [ADR-0039: Browser policy surface split keeps bootstrap/profile public and route-gates diagnostics](../decisions/ADR-0039-browser-policy-surface-split-keeps-bootstrap-profile-public-and-route-gates-diagnostics.md)
- [Web Loading and Profile Bootstrap Contract](WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
- [Visibility Profile Selection Design](VISIBILITY_PROFILE_SELECTION_DESIGN_2026-07-26.md)
- [Resource Budget and Fallback Envelope](RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)
- [Accessibility and Profile Visibility Live Repo Analysis](ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)
- [3D Web Experience Live Repo Analysis](3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md)

## Open question

The current public shell appears structurally complete enough that the
remaining work is phrasing and sequence clarity, not another layer of UI
structure. The open question is how to make the first-impression warmup story
read cleanly without adding more surfaces.

## Addendum (2026-07-29) - the public tree is already calm; the remaining work is phrasing

A fresh accessibility-tree probe of the public shell shows the current live
surface is structurally sparse and readable:

- skip link, warmup dialog, current objective, field prompt, save status, and
  quality profile are all present as named live surfaces;
- `#bootstrap-status` is the named progressbar;
- `#runtime-diagnostics` does not appear in the public tree at all.

That makes the remaining user-facing question narrower than the broad policy
split suggests: the public shell is already structurally calm, so the open work
is to make the warmup narrative read cleanly rather than to add more structure.
