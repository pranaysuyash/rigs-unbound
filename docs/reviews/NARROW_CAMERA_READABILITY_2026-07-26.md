# Narrow chase-camera readability review

- Date: 2026-07-26
- Status: implementation and isolated visual proof complete; integrated gate
  temporarily blocked by active parallel renderer work
- Risk: medium, player-facing camera composition
- Evidence: Tier 2 focused tests/typecheck before the parallel renderer edit;
  Tier 3 isolated production-build browser probe; Tier 4 screenshot inspection
- Related: ADR-0008, RU-0110 B9, Sites version 10 release review

## Problem observed in production

Sites version 10 passed the camera collision contract but its refreshed
`390×844` acceptance screenshot was not visually acceptable after emergency
recovery. The camera was technically path-clear and outside the rig, yet the
machine and Home geometry filled most of the playable view.

Two causes composed:

1. portrait chase requested a 2.5× boom, but obstruction resolution accepted
   the desktop-only 2.8 m minimum;
2. the starter tractor berth deliberately faced back through Home structures
   to continuously exercise camera obstruction.

The second choice made a test fixture part of every new and recovered player's
composition. Dedicated fixtures already prove structure and obstacle
obstruction, so this was not a valid product trade.

## Decision

1. Add a shared, profile-derived viewport policy for chase composition.
2. Require portrait chase to retain a minimum readable focus distance based on
   rig track width and authored chase distance.
3. When a clear ray still pulls too close, choose a farther, higher
   rear-shoulder fallback and expose the result as structured camera evidence.
4. Face the starter tractor roughly toward the guaranteed first cache instead
   of back through the workshop.
5. Keep dedicated Launch Ridge and standing-tree fixtures as the camera
   obstruction falsification paths.

This is not a rig-ID-specific camera hack. Viewport policy consumes aspect,
authored chase distance, and track width; world-data heading owns where the
machine is pointed.

## Contract added

`CameraResolutionEvidence` now exposes:

- `minimumReadableDistance`;
- `readableComposition`.

The result is readable only when:

- the resolved boom meets the viewport/profile minimum;
- the final path is clear;
- the camera does not intersect the rig.

The browser harness now asserts that the narrow emergency-recovery frame
satisfies this contract before capturing the narrow screenshot.

## Isolated proof

The working tree was frozen into an isolated temporary copy so concurrent Vite
builds could not replace hashed chunks during the probe.

Initial portrait recovery candidate:

- ideal distance: 29.082 m;
- resolved distance: 10.502 m;
- initial minimum: 9.02 m;
- geometry contract: passed;
- visual inspection: failed because the rig/workshop still dominated the view.

After raising the portrait floor and using the higher/farther fallback:

- ideal distance: 29.082 m;
- resolved distance: 15.395 m;
- minimum: 13 m;
- behind rig: true;
- path clear: true;
- self intersection: false;
- console problems: none;
- visual inspection: improved but still looked through Home geometry.

With the same renderer policy and the starter heading turned toward the first
cache:

- resolved distance: 29.068 m;
- obstruction: none;
- behind rig: true;
- path clear: true;
- self intersection: false;
- console problems: none;
- visual inspection: the horizon, terrain, other rigs, and useful travel
  direction became visible.

The last frame still shows excessive HUD/radar/tutorial density. That is a
separate UI hierarchy task and must not be hidden inside camera tuning.

## Checks run

- `npx vitest run src/game/camera.test.ts src/game/scene-query.test.ts`
  - passed: 2 files, 11 tests.
- `npm run typecheck`
  - passed before the later parallel water-renderer edit.
- isolated `npm run build`
  - passed, including player-asset boundary.
- isolated 390×844 Chrome probe
  - structured camera evidence passed; zero console problems.
- screenshot inspection
  - rejected the first two technically clear compositions;
  - accepted the cache-facing direction as a material improvement, with HUD
    density still open.

## Current integration blocker

After the isolated proof, a parallel water-shader edit entered
`src/game/renderer.ts` and the shared typecheck failed because
`GameRenderer.waterMaterial` was assigned without a declared owner. Static
inspection also found duplicate GLSL identifiers and a mismatch with the
existing day/night code that treats water as `MeshStandardMaterial`.

The camera work did not create this blocker. The renderer is a shared active
surface, so the water slice must settle or be reconciled before the full suite
and public deployment are rerun.

## Remaining gates

- [x] Profile-derived portrait minimum.
- [x] Structured readable-composition evidence.
- [x] Browser harness assertion added.
- [x] Isolated build and visual probe.
- [x] Starter heading has a focused first-cache-direction test.
- [ ] Parallel renderer typecheck restored.
- [ ] Full root/kernel/asset suite passes.
- [ ] Full frozen browser harness reaches and passes narrow recovery.
- [ ] Refreshed repo-owned narrow screenshot is visually inspected.
- [ ] Exact-source hook, commit, push, Sites deployment, and public acceptance.
- [ ] HUD/tutorial/radar hierarchy is reduced on narrow screens.

## Three-pass review

### Pass 1 — correctness

Separated collision validity from composition readability and rejected a frame
that passed the initial numeric threshold but remained unusable.

### Pass 2 — architecture

Kept camera policy profile-derived, kept heading in authored world data, and
kept obstruction falsification in dedicated fixtures instead of fresh-player
presentation.

### Pass 3 — supervision readiness

Recorded exact evidence, rejected frames, current parallel blocker, verified
versus pending gates, and the next closure path. No parallel renderer changes
were discarded or overwritten.
