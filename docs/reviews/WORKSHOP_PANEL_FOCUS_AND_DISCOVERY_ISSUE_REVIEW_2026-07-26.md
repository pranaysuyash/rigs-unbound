# Workshop Panel Focus and Discovery Issue Review

**Date:** 2026-07-26  
**Status:** Open accessibility/progression discovery issue; no runtime change landed in this pass  
**Severity:** P2 player-facing discoverability and keyboard-flow gap  
**Evidence tier:** Tier 1 static source inspection. No browser, screen-reader, or device command was run in this pass.

## Finding

The workshop panel is a real progression surface, but it is still under-specified as an accessibility and discoverability target.

Current behavior:

- `workshopPanel.hidden` is toggled based on proximity and map state;
- the panel appears only when the workshop is in reach;
- the panel presents upgrade choices that affect progression;
- but the code does not give the panel a dedicated focus entry, focus restoration, or announcement contract when it becomes available.

This is not a cosmetic issue. The workshop is a first-class game affordance that tells the player what they can do next. If it appears without a deliberate focus or announcement path, keyboard and assistive-technology users can miss the moment where the game is pointing them toward the next meaningful action.

## Current evidence

| Artifact                                | Role now                                                                       | Canonical status                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `index.html` `#workshop-panel`          | Conditional workshop surface with `aria-label="Workshop"`                      | Visible region, not a named dialog or announced discovery surface  |
| `src/main.ts` workshop visibility logic | Shows/hides the workshop based on `workshopInReach(state)` and `state.mapOpen` | Correct gating, incomplete focus/announcement story                |
| `src/main.ts` module list updates       | Buttons get stateful labels and eligibility                                    | Content is descriptive, but appearance is not explicitly announced |

## Why this matters

The workshop is where the player turns salvage into capability. That is one of the game’s core progression moments. If the panel appears only visually, then the player may not get a clear non-visual cue that a new upgrade path is now available.

The gap is larger than a generic a11y nicety because it touches the game’s core loop:

1. discover workshop;
2. enter workshop range;
3. learn what is now available;
4. choose a module;
5. change traversal capability.

The current implementation already does steps 1 and 2 in the simulation. It still needs a durable player-facing presentation contract for step 3.

## Recommended next proof slice

The next durable slice should make the workshop availability explicit to the player and keyboard user:

1. decide whether the workshop should announce itself as a contextual region or a dialog-like surface;
2. give the panel a dedicated announcement/focus entry when it becomes relevant;
3. restore focus cleanly when the player leaves the workshop;
4. confirm the first-fit/module-selection flow still works from keyboard and touch.

## Closure trigger

This issue closes only when the workshop panel has an explicit focus and announcement contract that survives browser interaction. Documentation alone does not close the issue.

## Anything else?

Yes: the workshop is not just another menu. It is the player’s capability gate. That makes its discoverability part of the core progression contract, not an optional UI flourish.

## Addendum (2026-07-28) - the workshop belongs to the same focus-managed shell family as the other major overlays

- Re-checked the workshop review against the current shell contract trail.
- The workshop is already treated as one of the major shell surfaces in
  `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`, alongside the map,
  contract board, garage, pause, and labs surfaces.
- That means the missing workshop proof is not a separate UI philosophy; it is
  the same runtime pattern the other overlays are converging on:
  - explicit focus entry,
  - visible heading and status,
  - clean focus restore on close,
  - and readable discovery of why the panel matters right now.
- The workshop remains a progression gate, not a second authority, so its
  next proof should stay presentation- and focus-oriented rather than adding
  any new state path.
