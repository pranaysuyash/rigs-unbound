# Browser-Proved Shell Profile Owner Contract

**Date:** 2026-07-26  
**Status:** Open presentation/profile ownership issue; no runtime change landed in this pass  
**Evidence tier:** Tier 1 static source inspection. No browser, device, or screen-reader command was run in this pass.

## Decision

Keep the shell substrate, visibility policy, and runtime diagnostics as separate canonical pieces.

The repo already has:

- a real shell language in renderer state-shell work,
- a real runtime profile policy in `src/game/runtime-profile-policy.ts`,
- a hidden operator diagnostics line that can explain fallback and profile choice,
- accessibility-reviewed public shell behavior.

What it does not yet have is one browser-proved owner that ties those pieces together on the public surface.

## Current ownership split

| Concern                                | Current owner                     | Canonical status                                        |
| -------------------------------------- | --------------------------------- | ------------------------------------------------------- |
| Shell language / state-shell rendering | renderer and state-shell work     | Real runtime substrate exists.                          |
| Runtime profile choice                 | runtime profile policy            | Canonical decision engine exists.                       |
| Operator explanation                   | diagnostics and developer surface | Hidden from the public HUD.                             |
| Player-readable shell status           | public shell / HUD                | Present in pieces, but not as one browser-proved owner. |

## What is already real

- The shell language is not theoretical. The renderer already carries the state-shell substrate.
- The profile policy is not theoretical. The runtime already selects and reports a profile.
- The shell is truthful enough to support a browser surface.

That makes this a presentation ownership problem, not a missing-engine problem.

## What is still missing

The repo still lacks one explicit browser-proved contract for:

- which public element owns the active shell/profile signal,
- how that signal distinguishes player-facing state from operator diagnostics,
- how the visible shell profile relates to the selected quality band,
- how fallback or reduced-profile state is explained in plain language,
- how the browser proof survives reload and profile changes.

## Admission trigger

Treat this as a real contract boundary when the app depends on the player being able to answer, from the public surface:

```text
what shell/profile am I seeing,
why is it in this mode,
and what happened if the richer version is unavailable?
```

That trigger is already close. The missing piece is not more shell code. It is a named owner for the browser proof.

## Required future contract

The browser-proved shell profile owner should define:

```text
selected runtime profile
  -> shell presentation mode
  -> visible player-facing status
  -> operator diagnostics
  -> fallback/reduced-profile explanation
```

The contract should state:

- which element or HUD slot owns the visible profile signal;
- whether the shell status is a live region, a plain status line, or another named announcement surface;
- how the visible shell profile relates to reduced motion, visibility, and loading/fallback state;
- how the browser proof is captured on a representative viewport;
- how operator diagnostics remain separate from the public contract.

## Safety invariants

- The public shell must stay truthful.
- The operator diagnostics surface must remain distinct from the player HUD.
- The selected profile must not silently diverge from the shell language shown to the player.
- Fallback state must remain explicit rather than implied.
- No second source of truth should be created for profile selection.

## Non-goals

- No new presentation mode for its own sake.
- No duplication of the runtime profile policy.
- No collapse of diagnostics into the public HUD.
- No attempt to make the shell owner the same thing as the renderer owner.

## Closure trigger

Close this issue only when the repo can point to one browser-proved shell profile owner that:

- visibly identifies the active shell/profile to the player,
- explains fallback or reduced-profile state in plain language,
- remains stable across reload/profile changes,
- and keeps operator diagnostics separate.

## Anything else?

Yes: this contract is the bridge between the state-shell visual-language work and the accessibility/profile-visibility work. It gives the repo one shared ownership target instead of two adjacent unresolved questions.

## Addendum (2026-07-27) - the ownership gap was narrower at the time, but still real

- Re-checked the contract against the live renderer/profile trail.
- At the time of the addendum, the runtime profile selection and renderer
  fallback path were tiered in the performance flow, so the missing bridge was
  no longer the existence of a quality policy.
- What is still missing is a browser-proved owner for the public shell/profile
  signal itself:
  - visible active profile in the public surface,
  - plain-language fallback/recovery status,
  - stable public ownership separate from operator diagnostics.
- That means this contract should be read as a presentation-owner bridge over
  an already-tiered policy engine, not as a request to invent a second
  profile-selection system.
- Evidence depth: Tier 1 static inspection of the contract against the live
  renderer-performance and profile-selection docs.

## Addendum (2026-07-28) - the browser now has a visible profile owner, but the contract still keeps diagnostics separate

- Re-checked the live browser surface at `http://localhost:4173/?proof=1` on a
  390 × 844 viewport.
- The public shell now exposes a visible profile line that reads
  `Quality: standard. Still measuring frame performance.`
- The profile line is a public HUD element, while the operator diagnostics line
  remains hidden, so the ownership split still holds:
  - public profile owner on the shell,
  - hidden diagnostics for operator detail.
- That means the contract is no longer only hypothetical. The browser can now
  point to one player-facing owner for the visible profile state, while still
  preserving the separate operator/evidence lane.
- Evidence depth: Tier 4 live browser observation plus Tier 1 static contract
  inspection.
