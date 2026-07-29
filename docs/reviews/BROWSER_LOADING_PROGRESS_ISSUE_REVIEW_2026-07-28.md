# Browser Loading Progress Issue Review

**Date:** 2026-07-28  
**Status:** Open browser-delivery issue; the loading story is still fragmented  
**Severity:** P2 player-facing clarity gap during startup  
**Evidence tier:** Tier 4 runtime/manual observation plus Tier 1 static source inspection

## Finding

The current browser surface is truthful and readable, and it already exposes a
semantic loading progressbar during bootstrap. The remaining issue is that the
loading story is still split across readiness, profile, and diagnostics instead
of presenting one cohesive player-facing warmup affordance.

Observed state:

- the public shell has a readable `Quality: standard.` profile line;
- the public shell has a readable `Saved locally just now` persistence line;
- the public shell has a readable readiness label: `Field systems ready. Restored session controls are active.`;
- the browser is no longer a dead black box;
- the browser now exposes a named `Loading status` progressbar while
  measuring;
- but the loading story is still split across progress, profile, and
  readiness surfaces.

## Root cause

The gap is not a missing DOM widget by itself. The current state model still
splits the loading story across surfaces:

- before entry, `bootstrapStatus` says `Measuring device performance… Choose Enter the field to begin.` and is exposed as a progressbar;
- after entry, it becomes `Field systems ready. Restored session controls are active.`;
- `PerformanceMonitor` is used for profile selection and diagnostics;
- `mapProgress` is world-survey progress, not startup loading progress.

So the browser-loading contract is still implicit because the state model
splits the warmup story across multiple surfaces instead of presenting one
cohesive loading narrative.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `index.html` `#game-shell` / `#bootstrap-status` | Startup shell and readiness label | Truthful, but not a dedicated progress meter |
| `src/main.ts` | Chooses world-entry state and updates bootstrap text | Binary `measuring` / `ready` transition |
| `src/main.ts` `PerformanceMonitor` | Measures frame/load evidence for profile choice | Canonical diagnostics, not player loading UI |
| `src/main.ts` `mapProgress` | World survey progress | Not startup loading progress |
| Live `Field 02` browser surface | Player-facing proof | Readable shell, named progressbar during warmup, still fragmented narrative |

## Why this matters

The app is already trustworthy enough not to look broken, but the browser
experience still asks the player to piece together progress from separate
ready, profile, and diagnostics surfaces. That is a weaker promise than one
cohesive loading narrative.

The distinction matters because the repo already depends on:

- profile fallback,
- reduced-motion behavior,
- public shell trust,
- and browser-first delivery.

Those behaviors deserve a visible bootstrap contract instead of an implicit one.

## Recommended next proof slice

The next durable slice should decide whether the browser shell needs:

1. a cohesive loading/warmup narrative separate from the ready shell;
2. a player-facing explanation of profile selection or fallback;
3. a browser proof that the chosen affordance survives narrow/mobile layout;
4. a manual screen-reader pass that confirms the loading story sounds calm,
   not fragmented.

## Closure trigger

This issue closes only when the browser surface either:

1. consolidates the current loading, profile, and readiness surfaces into a
   single cohesive warmup affordance, proven in-browser across the canonical
   Field 02 surface; or
2. the project explicitly accepts the current fragmented contract as the
   intended browser-delivery policy.

Documentation alone does not close the issue.

## Relationship to other browser-delivery notes

- [Web Loading and Profile Bootstrap Contract](../research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
- [3D Web Experience Live Repo Analysis](../research/3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md)
- [3D Game Current-State and Execution Audit](../research/3D_GAME_CURRENT_STATE_AND_EXECUTION_AUDIT_2026-07-26.md)

## Addendum (2026-07-28) - the issue is now grounded in a root-cause note

- The browser-delivery gap now has a source-level diagnosis in the current-state
  audit:
  - the state model is binary,
  - `bootstrapStatus` only toggles between measuring and ready,
  - there is no staged loading-progress state for the player.
- This review exists so the gap can be tracked as a durable issue rather than a
  vague UX impression.

## Addendum (2026-07-28) - the bootstrap contract is now verified live

The runtime entry point now exposes a determinate warmup contract in source,
and the live browser probe confirmed the full transition:

- while the shell is still warming up, `#bootstrap-status` is treated as a
  `progressbar` with a bounded bootstrap counter;
- the shell’s `aria-busy` state tracks that warmup window instead of staying
  pinned false;
- once the warmup target is satisfied, the status reverts to a normal live
  status line.

Live evidence now shows the initial progressbar state and the ready state, so
this is no longer just a design note. The issue was resolved in source and
confirmed in browser.


## Addendum (2026-07-28) - accessibility-tree proof confirms the loading contract

A follow-up browser probe through the accessibility tree confirmed the same
contract from assistive-technology perspective:

- the initial bootstrap surface exposes a `progressbar` role;
- the ready state remains a normal `status` role;
- the live text remains the player-facing copy, not an opaque diagnostic.

That closes the remaining ambiguity about whether the new warmup contract was
only a DOM attribute trick. It is now visible in the browser accessibility
tree as well.

## Addendum (2026-07-29) - the warmup contract exists, but the fresh shell still resolves to ready quickly

A later fresh-load recheck showed the shell landing in the ready state by the
time the browser probe sampled it:

- `#bootstrap-status` was already back to `Field systems ready. Restored
  session controls are active.`
- `#map-progress` remained the world-survey counter, not an asset-load meter.
- `#error-panel` stayed hidden on the normal shell, as expected.

That means the source-side warmup contract is real, but the visible loading
window is still not a durable asset-bootstrap affordance on a normal fast load.
The remaining seam is therefore perception and longevity of the loading cue,
not whether a warmup branch exists at all.

## Addendum (2026-07-29) - warmup is real, but the shell splits it across three surfaces

A fresh browser probe showed the warmup story is now present but fragmented:

- `#bootstrap-status` reads ready: `Field systems ready with standard scenery detail.`
- `#profile-status` reads measuring: `Quality: measuring. Still measuring frame performance.`
- `#runtime-diagnostics` carries the renderer-specific note:
  `Renderer visibility warmup: standard (insufficient-frame-samples)`.

So the browser now has the right ingredients, but the user-facing contract is
split between readiness, profile, and diagnostics instead of presenting one
cohesive loading story. That is the next seam worth tightening if we want the
shell to explain itself cleanly during the first impression.

## Addendum (2026-07-29) - the diagnostics visibility split is deliberate across routes

A live route comparison on the shell clarifies the policy:

- the public shell hides `#runtime-diagnostics`;
- the `?acceptance=field-02` surface reveals it with the renderer/backend
  summary;
- both routes still keep `#bootstrap-status` semantic and `#profile-status`
  visible.

So the issue is not that diagnostics accidentally show up on the public shell
or that progress semantics are missing. The remaining question is simply
whether the player-facing warmup sequence is coherent enough in its public
form.

## Addendum (2026-07-29) - the diagnostics summary is route-gated static text, not a live status region

A follow-up accessibility-tree probe clarified the semantics:

- the public shell still hides `#runtime-diagnostics`;
- the `?acceptance=field-02` surface reveals the renderer/backend summary;
- in the tree, that summary is exposed as `StaticText`, not as a semantic
  `status` or `progressbar` node;
- the real semantic live regions remain `#bootstrap-status` and
  `#profile-status`.

That means the policy question is even narrower than the review originally
phrased it: the acceptance/developer diagnostics are a readable summary, but
they are not a second live announcement surface.

## Addendum (2026-07-29) - the public shell is structurally calm; the remaining issue is narrative clarity

A public-shell accessibility-tree probe shows the live surface is already
sparse and readable:

- skip link, warmup dialog, current objective, field prompt, save status, and
  quality profile are all present as named live surfaces;
- `#bootstrap-status` is the named progressbar;
- `#runtime-diagnostics` does not appear in the public tree.

So the remaining issue is not structure. It appears to be phrasing and
sequence clarity: whether the bootstrap/profile story reads cleanly enough as a
first impression for players without adding more surfaces.

## Addendum (2026-07-29) - ADR-0039 is the policy name for the current route split

The review’s live route split now has a durable decision anchor:

- ADR-0039 keeps `#bootstrap-status` semantic on the public shell;
- ADR-0039 keeps `#profile-status` visible to the player;
- ADR-0039 route-gates `#runtime-diagnostics` to the acceptance/developer
  route as a readable summary, not a second live announcement surface.

That makes the remaining review question narrower and cleaner: the public
loading story should read coherently, while the acceptance route continues to
carry reviewer-facing runtime detail.
