# ADR-0024: Isolate real-key browser acceptance from continuous renderers

- Date: 2026-07-26
- Status: Accepted
- Scope: `tools/rig-lab-browser-acceptance.cjs`

## Context

Field 02 acceptance contains a real W/A/D first-rung traversal. The same run
also needs developer-surface, player-surface, camera, locomotion, persistence,
mobile-layout, and performance evidence. Keeping the continuously animating
developer renderer alive while the first-rung page drove real keyboard input
produced timing-sensitive failures even though isolated keyboard replays
reached the authored cache.

The failure was not addressed by relaxing the target, changing the salvage
radius, or bypassing the public input path.

## Decision

The harness will:

1. Close the initial developer page before starting first-rung traversal.
2. Run first-rung in a separate Chrome process.
3. Settle the rig with public brake keys before the Space salvage action.
4. Recreate the developer page after first-rung so boot-relative and
   entry-relative performance markers retain their normal timing baseline.
5. Keep the authored route targets, real keyboard input, interaction radius,
   workshop assertions, save/reload assertions, and console assertions intact.

The hover traversal fixture uses the open west basin lane at `(-134, -123)`
with heading `pi`, avoiding the authored `flats-stilt-np` collider while still
exercising water deeper than the ground rig's `1.1 m` ford depth.

## Alternatives rejected

- Increasing the target radius or moving the salvage target: would hide a
  player-facing navigation defect.
- Calling `window.performRigAction()` for first-rung: would bypass the public
  keyboard contract.
- Keeping the main renderer active and retrying indefinitely: would turn a
  timing race into an unreliable acceptance suite.
- Removing the hover no-damage assertion: would confuse structure collision
  damage with the hover water contract.

## Validation

The final isolated-server run passed `npm run test:browser` against
`http://127.0.0.1:4186/?acceptance=field-02` with:

- first-rung recovery, return-home, Lug tyres fit, and save/reload;
- terrain-face probes for all three rigs;
- cargo relay completion and persistence;
- ground ramp traversal and hover deep-water traversal;
- authored camera obstruction, felled-tree clearance, and hood views;
- desktop and narrow touch layout checks;
- performance metrics and zero browser console/page errors.

Focused live probes also confirmed the public keyboard path and the open west
basin lane independently before the full run.

## Revisit triggers

Revisit this decision if the browser acceptance suite gains a headless mode
with a deterministic virtual-time scheduler, if the renderer becomes explicitly
pausable at the page boundary, or if the first-rung proof moves to a dedicated
test surface with equivalent public-input semantics.
