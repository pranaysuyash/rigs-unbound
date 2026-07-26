# Pause State Announcement Issue Review

**Date:** 2026-07-26  
**Status:** Open accessibility issue; no runtime change landed in this pass  
**Severity:** P2 player-facing status announcement gap  
**Evidence tier:** Tier 1 static source inspection. No browser, screen-reader, or device command was run in this pass.

## Finding

The paused state is visible, but it is still not a dedicated announcement surface.

Current behavior:

- `state.paused` toggles in the simulation layer;
- `src/main.ts` updates `current-prompt` to `"Paused."` when paused;
- the page also shows a full-screen `.pause-overlay`;
- but neither the prompt nor the overlay is marked as a live region dedicated to pause-state changes.

That means the pause state is real and readable, but its transition is still mostly visual rather than explicitly announced. For keyboard and screen-reader users, that creates a small but real gap between the game being paused and the pause transition being clearly conveyed.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `src/main.ts` `current-prompt` | Updated to `"Paused."` when the game pauses | Visible state copy, not a dedicated announcement contract |
| `index.html` `#pause-overlay` | Full-screen paused indicator | Visual-only overlay |
| `src/main.ts` `togglePause(state)` path | Opens/closes the pause overlay and suppresses simulation actions | Good mode switch, incomplete announcement story |

## Why this matters

Pause is an important player-facing mode change because it suspends the simulation, changes input expectations, and can block movement or interaction. If the transition is only visible, users who depend on non-visual cues may not get the same reliable signal that the game has entered a paused state.

## Recommended next proof slice

The next durable slice should make pause a named, announced mode change:

1. decide which element owns the pause announcement;
2. give pause-state changes a dedicated announcement path;
3. keep the visible overlay as the immediate visual cue;
4. prove the state change in-browser with keyboard and assistive-tech flow.

## Closure trigger

This issue closes only when the pause transition is explicitly announced in a durable, named way and the browser flow proves it works alongside the visible overlay. Documentation alone does not close the issue.

## Anything else?

Yes: pause is not the same as map or save state. The overlay is a visual cue, but the announcement contract still needs to be explicit so the player gets the same mode-change signal through non-visual channels.
