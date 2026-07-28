# Visible Input and Accessibility Profile Issue Review

**Date:** 2026-07-26  
**Status:** Open accessibility / profile-surface issue; no runtime change landed in this pass  
**Severity:** P2 player-facing clarity gap before broader device/profile expansion  
**Evidence tier:** Tier 1 static source inspection. No browser, screen-reader, or device command was run in this pass.

## Finding

The repo already computes and surfaces runtime profile information, but that signal is still mostly operator-facing. `src/main.ts` builds a `runtimeDiagnostics` line that includes profile state and fallback reasons, yet the diagnostics surface is hidden from the player HUD. The public shell remains truthful, but it still does not show a durable visible input/accessibility profile indicator that a player can actually read in-session.

## Current evidence

| Artifact                                                                              | Role now                                                       | Canonical status                                                         |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/main.ts`                                                                         | Builds runtime diagnostics, save text, and profile summary     | Active source of truth, but profile state is not player-facing.          |
| `src/game/runtime-profile-policy.ts`                                                  | Chooses `standard` or `mobile-safe` based on measured pressure | Canonical policy engine for runtime profile selection.                   |
| `index.html`                                                                          | Public shell and HUD structure                                 | No dedicated public profile/status element is visible here.              |
| `docs/research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md` | Existing analysis trail for the same gap                       | Confirms the missing player-facing signal is intentional and still open. |

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

## Addendum (2026-07-28) - the public profile signal is still hidden from the player surface

- Re-checked the live browser surface after the latest browser-delivery notes
  and confirmed the active Field 02 page still keeps `#runtime-diagnostics`
  hidden from the public HUD.
- That means the current runtime continues to expose the active profile and
  fallback reasons only through the operator/evidence surface, not as a
  player-facing indicator.
- The issue therefore remains open exactly where the contract says it should:
  the shell is truthful, the runtime policy is canonical, but the public
  browser surface still lacks one stable visible profile owner.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static trail
  inspection.

## Addendum (2026-07-28) - the shell now carries a visible profile line, but browser proof is still pending

- Static inspection of the current shell source now shows a dedicated
  `#profile-status` element alongside `#save-status`, and `src/main.ts` now
  populates that line from the runtime profile selection on bootstrap and on
  each update pass.
- The mobile shell keeps the profile line visible by hiding only the plain save
  line in the narrow breakpoint; the profile indicator remains part of the
  public HUD.
- The runtime profile policy is still canonical, and the visible line now
  explains whether the shell is in measuring, reduced, or standard quality
  mode using plain language.
- This is a source-level accessibility improvement, not a closure claim. The
  issue still needs live browser proof after the source change lands.
- Evidence depth: Tier 1 static source inspection of `index.html`,
  `src/main.ts`, and `src/styles.css`.

## Addendum (2026-07-28) - live browser proof now confirms the public profile line is visible

- Re-checked the live browser at `http://localhost:4173/?proof=1` on a
  390 × 844 viewport.
- The public profile line is present and readable:
  `Quality: standard. Still measuring frame performance.`
- The profile line keeps `role="status"` and `aria-live="polite"`, and it
  remains visible in the mobile shell.
- The operator diagnostics line stays hidden, so the public HUD and operator
  surface are still distinct.
- Evidence depth: Tier 4 live browser observation plus Tier 1 static source
  inspection.

## Addendum (2026-07-28) - stronger assistive-tech proof still needs a manual screen-reader pass

- The browser environment here does not expose `window.getComputedAccessibleNode`,
  so the programmatic accessibility-tree check is unavailable in this session.
- That means the browser proof above confirms visible DOM and live-region
  behavior, but not a full screen-reader narration path.
- The remaining closure step is therefore a manual VoiceOver/NVDA/JAWS-style
  pass, not further shell rewrites.
- Evidence depth: Tier 1 environment capability check plus Tier 4 browser
  proof already captured above.

## Addendum (2026-07-28) - Chrome accessibility tree now exposes the public profile line

- Ran a Chrome accessibility-tree snapshot against `http://localhost:4173/?proof=1`
  at 390 × 844.
- The tree contains the visible profile line as exposed text:
  `Quality: standard. Still measuring frame performance.`
- The tree also keeps the operator diagnostics surface separate from the
  public HUD, matching the source contract instead of collapsing the two.
- This is stronger than DOM-only proof because it confirms the content is
  exposed through Chrome’s accessibility tree, but it still is not a spoken
  VoiceOver/NVDA/JAWS narration test.
- Evidence depth: Tier 3/4 browser accessibility-tree observation plus Tier 1
  source inspection.
