# Rigs Unbound Issue Review: No-render fallback surface

Date: 2026-07-28

## Summary

The app has two renderer-adjacent resilience paths:

- renderer policy fallback (`rendererPolicy=off` or incompatible backend choice)
- WebGL context-loss recovery (`webglcontextlost` / `webglcontextrestored`)

The app now also has a true no-render fallback surface for when the 3D
experience cannot be carried at all. The boot error panel was promoted into the
canonical degraded-mode surface, and it is now reachable from the runtime
failure path as well as the acceptance preview hook.

## Evidence

### Source inspection

- `src/main.ts` now routes both startup failure and unrecoverable renderer
  recovery into the same fallback presenter.
- `index.html` contains a visible degraded-mode `#error-panel` with the heading
  `The 3D scene is unavailable.` and a retry button.
- `src/game/renderer.ts` still owns backend fallback and context-aware
  recovery, while the shell owns the user-facing no-render surface.

### Live browser probes

- `?rendererPolicy=off` still renders on WebGL with a policy fallback:
  `backend:webgl/auto (fallback)`.
- `?rendererPolicy=stable` stays on the direct path:
  `backend:webgl/auto (direct)`.
- Synthetic `webglcontextlost` / `webglcontextrestored` dispatches prove the
  recovery state machine is wired.
- The acceptance/developer hook `window.__showNoRenderFallback(...)` proves the
  visible no-render fallback surface in the live browser.

## Current status

The app is now resilient enough to explain renderer policy, context recovery,
and a separate user-facing no-render experience for the case where a 3D scene
cannot start or cannot be recovered.

## Why this matters

For a browser 3D experience, the current state now covers the full fallback
story:

- good: policy-controlled backend choice
- good: context-loss recovery messaging
- good: explicit static / no-render degraded mode

Without that third piece, the app can still fail in a way that is technically
explained but not productively handled. That gap is now closed.

## Recommended next step

Future work, if desired, is to expand the no-render fallback surface. The
current fallback already:

- tells the user that the 3D scene is unavailable
- preserves the existing save/status trust contract where possible
- offers a retry path
- avoids pretending the scene is healthy when it is not

## Acceptance criteria

- A user can reach a visible fallback surface when the renderer cannot be used.
- The fallback surface explains why 3D is unavailable in plain language.
- The fallback surface includes a recovery action.
- The live browser can prove the fallback path through the acceptance/developer
  hook.
- Documentation and tests describe the boundary between policy fallback,
  context recovery, and true no-render failure.

## Owner / follow-up

Next reviewer should decide whether the no-render fallback should stay as the
current shell overlay or evolve into:

1. a richer static overlay fallback inside the existing shell, or
2. a dedicated minimal non-3D mode with its own entry point.

## Evidence depth

- Tier 1: source inspection
- Tier 4: live browser inspection

## Resolution update

The no-render fallback surface now exists in the live shell:

- the formerly hidden boot error panel was promoted into the canonical degraded-mode
  surface;
- it now carries an explicit `alertdialog` name and description;
- `window.__showNoRenderFallback(...)` can surface it on developer/acceptance
  surfaces for verification;
- the live browser proof shows the panel visible, the canvas hidden, and focus
  landing on the retry button;
- Escape and Tab keep the user inside the fallback dialog, and the page scroll
  is locked while the fallback is visible.

That means the original missing piece is no longer missing. The remaining open
question is only whether the product later wants a richer non-3D mode beyond the
current fallback surface.

## Accessibility addendum (2026-07-28)

A live browser probe also confirmed the fallback behaves like a real modal
dialog:

- focus lands on `Try again`;
- `Tab` and `Shift+Tab` stay pinned to the retry button;
- `Escape` routes to the retry action;
- page scroll is locked while the fallback is visible.

That makes the no-render surface not only visible, but keyboard-operable.

## Accessibility tree addendum (2026-07-28)

A live Chrome accessibility-tree probe confirmed the dialog is exposed to assistive
tech as expected:

- `alertdialog` name: `The 3D scene is unavailable.`
- retry button name: `Try again`
- the fallback surface is represented as a named dialog rather than just a
  painted panel.

That is the proof the accessibility contract was missing before this pass: the
fallback is now visible, modal, keyboard-operable, and named in the AX tree.
