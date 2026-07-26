# Visible Input and Accessibility Profile Issue Review

**Date:** 2026-07-26  
**Status:** Open accessibility / profile-surface issue; no runtime change landed in this pass  
**Severity:** P2 player-facing clarity gap before broader device/profile expansion  
**Evidence tier:** Tier 1 static source inspection. No browser, screen-reader, or device command was run in this pass.

## Finding

The repo already computes and surfaces runtime profile information, but that signal is still mostly operator-facing. `src/main.ts` builds a `runtimeDiagnostics` line that includes profile state and fallback reasons, yet the diagnostics surface is hidden from the player HUD. The public shell remains truthful, but it still does not show a durable visible input/accessibility profile indicator that a player can actually read in-session.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `src/main.ts` | Builds runtime diagnostics, save text, and profile summary | Active source of truth, but profile state is not player-facing. |
| `src/game/runtime-profile-policy.ts` | Chooses `standard` or `mobile-safe` based on measured pressure | Canonical policy engine for runtime profile selection. |
| `index.html` | Public shell and HUD structure | No dedicated public profile/status element is visible here. |
| `docs/research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md` | Existing analysis trail for the same gap | Confirms the missing player-facing signal is intentional and still open. |

## Why this matters

The current architecture can already answer the operator question:

```text
what profile did the runtime choose, and why?
```

But the player still cannot answer that question from the public shell. That becomes a trust and accessibility problem once the repo depends more heavily on profile fallback, reduced visibility, or comfort-mode behavior:

- the player cannot tell whether they are in a reduced-detail or fallback state,
- the player cannot read the active accessibility/comfort profile directly,
- the player cannot distinguish hidden diagnostics from public HUD state.

## Decision for the current stage

Keep the runtime profile policy as the canonical decision engine. Treat the player-facing profile signal as a separate presentation contract that still needs one explicit public indicator.

Do not turn diagnostics into the public HUD by accident.

## Required next proof slice

1. Add one player-facing indicator that shows the active comfort/profile state.
2. Make fallback or reduced-profile reasons readable in plain language.
3. Keep the operator diagnostics surface separate from the player HUD.
4. Prove the signal is visible and stable during a reload or profile change.

## What must not happen

- Expose only a hidden developer metric and call it player-facing.
- Collapse the public shell and operator diagnostics into one shared text line.
- Hide the active profile in a tooltip or console-only path.
- Change the runtime profile policy without a readable surface for its result.

## Closure trigger

This issue closes only when the player can see the active input/accessibility or quality profile in the public shell, and the indicator explains fallback or reduced-profile state in plain language.
