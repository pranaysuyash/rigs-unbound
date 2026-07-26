# Render Accessibility Checklist (2026-07-25)

## Scope

Controls and feedback surfaces in the current browser runtime:

- HUD and state text,
- camera mode transitions,
- motion/audio coupling,
- map and terrain visibility signals.

## Must-have checks (for acceptance)

1. Reduced motion

- all non-essential motion effects must provide reduced variant,
- animation spikes are clamped by user preference or profile.

2. Input-action visibility

- critical action outcomes remain explicit in HUD/telemetry,
- switching rigs/cameras remains deterministic and legible.

3. Readability and contrast

- critical status text survives in low-contrast environment,
- terrain, route, and warning cues never rely only on hue.

4. Layout and touch affordance

- no interactive target narrower than practical minimum,
- desktop and narrow widths maintain the same semantic state.

5. Audio clarity (existing runtime-backed path)

- key action/state changes map to a sound layer with clear hierarchy,
- audio remains understandable when motion is reduced.

6. Fallback behavior

- no profile change may remove basic state feedback,
- if renderer budget drops, feedback must remain.

## Audit cadence

- per gate, before public smoke test and before any major visual content addition.
- maintain a gap list in the linked review artifact.
