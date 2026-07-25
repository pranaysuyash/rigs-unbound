# Runtime Boot and Public-State Safety Note (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: a live-browser runtime check of the current Field 02 boot path and the
public-state snapshot used by `recordCheckpoint()` / browser observability.

## Why this note exists

During live inspection of `http://127.0.0.1:4173/?p0-repro=welcome`, the boot
path originally threw inside `publicState()` while serializing the current
state snapshot. The visible console error was:

`TypeError: Cannot read properties of undefined (reading 'toFixed')`

That made the boot path brittle in the exact place the repo uses for runtime
observability and checkpoint capture.

## Root cause

`publicState()` assumed every numeric field it serializes is already present and
finite. That is a stronger assumption than the repo’s current recovery surface
can safely guarantee, especially when the browser is restored from older or
partially populated local records.

The crash was not in the game loop itself. It was in the serialization layer
that turns live state into a checkpoint-readable snapshot.

## Fix applied

`src/game/state.ts` now uses tolerant number formatting helpers for the public
snapshot path:

- `finiteNumber()`
- `fixedNumber()`

These helpers keep the snapshot path from crashing when a field is missing or
non-finite, and they preserve the existing report shape by falling back to `0`
instead of aborting boot.

## Live verification after the fix

After reloading the same browser session:

- the page still loads at `Rigs Unbound — Field 02`;
- the `#game-canvas` element exists and remains keyboard-focusable;
- the skip link to `#game-canvas` is present;
- the page renders the expected HUD shell instead of crashing during boot;
- the browser status reports the page as running on `http://127.0.0.1:4173/?p0-repro=welcome`.

After activating `Enter the field` in the live browser:

- the welcome panel hides;
- `document.activeElement` becomes `canvas#game-canvas`;
- the focus landing path is therefore confirmed at runtime, not just in DOM
  markup.

## Why this matters

This keeps the boot/checkpoint path safe enough for:

- acceptance runs,
- observability capture,
- and future runtime proof slices.

It also means the repo’s focus/accessibility work is no longer undermined by a
serialization crash before the player can even enter the field.

## Linked artifacts

- [docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md)
- [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)

## Anything else?

This is a small fix with a large effect: it keeps boot-time observability from
becoming a hard failure point, which makes the rest of the runtime evidence
much more trustworthy.
