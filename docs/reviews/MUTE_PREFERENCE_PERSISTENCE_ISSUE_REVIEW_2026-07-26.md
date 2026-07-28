# Mute Preference Persistence Issue Review

**Date:** 2026-07-26  
**Status:** Open audio/settings issue; no runtime change landed in this pass  
**Severity:** P2 player preference trust gap  
**Evidence tier:** Tier 1 static source inspection. No browser, build, or runtime command was run in this pass.

## Finding

The mute toggle is functional, but the preference does not appear to persist across reloads.

Current behavior:

- `src/main.ts` toggles `audio.setEnabled(next)` when the mute button is clicked;
- the button text and `aria-pressed` state update immediately;
- `RigAudio` treats mute as safe and non-fatal;
- but there is no visible persistence layer in `main.ts` or `audio.ts` for the mute preference;
- no `localStorage` key, save payload, or settings contract appears to preserve the choice.

That means the player can mute the game in-session, but the preference is likely lost on reload. For a setting that directly affects comfort and accessibility, this is a real trust and usability gap.

## Current evidence

| Artifact                       | Role now                                             | Canonical status                                      |
| ------------------------------ | ---------------------------------------------------- | ----------------------------------------------------- |
| `src/main.ts` mute handler     | Toggles audio enablement and updates the button      | Functional control, not persistent preference storage |
| `src/game/audio.ts` `RigAudio` | Safe no-op mute behavior and browser unlock handling | Presentation owner only                               |
| Storage path in repo           | Save/load exists for world and session state         | No explicit audio preference persistence path found   |

## Why this matters

Mute is not a cosmetic toggle. It is a comfort and accessibility setting. If the game forgets it after reload, the player must reassert their preference every session, which is a poor experience and a barrier for players who depend on quiet by default.

## Recommended next proof slice

The next durable slice should make mute a persisted preference:

1. choose the canonical storage location for user preferences;
2. persist mute alongside other local session preferences;
3. restore the preference before the audio system becomes audible;
4. prove the setting survives a reload in-browser.

## Closure trigger

This issue closes only when the mute preference is persisted and restored by the browser flow, and that behavior is proven in-runtime. Documentation alone does not close the issue.

## Anything else?

Yes: this is distinct from audio availability. The current contract already treats no-audio as a safe outcome. The missing piece is remembering the player’s own choice after the page reloads.
