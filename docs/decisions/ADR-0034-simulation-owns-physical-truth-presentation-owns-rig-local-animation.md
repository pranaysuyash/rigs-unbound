# ADR-0034 — Simulation owns physical truth; the animation system owns how it is shown

- Date: 2026-07-28
- Status: **Implemented and verified for the current runtime** — technical
  correction within the requested scope; not a product-acceptance claim
- Supersedes: ADR-0031 (decision preserved, mechanism corrected)
- Owner: Rigs Unbound presentation shell
- Affected runtime: `src/game/animation.ts`, `src/game/renderer.ts`
- Related: ADR-0030 (historical), motto_v4 §7 (supersession), §21 (decision-driven
  refactor is a deliverable), §22 (rules right in spirit can be wrong in
  mechanism), §23 (`vehicleAnimationSystem`-style boundaries are long-term
  contracts)

## Context

ADR-0031 decided that `vehicleAnimationSystem` should own rig-local animation
and that the renderer should stop writing those transforms directly. It then
claimed the refactor had landed. On 2026-07-28 a reachability audit showed
`src/game/animation.ts` was imported by nothing: the decision was recorded, the
refactor was never delivered, and the record asserted otherwise. That correction
is appended to ADR-0031.

The obvious repair — wire the module as written — was examined and **rejected**.
Reading the module against the live kernel showed the ADR was right about the
boundary and wrong about the mechanism:

| Channel         | ADR-0031's module                                 | Live kernel                                                                                                      |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `wheelRotation` | integrated presentation-side from `speed × delta` | integrated in `physics.ts:468` with slip, **persisted in the save**, validated on load, emitted in `publicState` |
| suspension      | invented from `driveLoad` via spring dampers      | `mobility.wheels[i].compression` is kernel state                                                                 |
| body attitude   | `rotation.x/z` from dampers only                  | `heading`, `pitch`, `roll` are kernel state, with a presentation lean offset added on top                        |
| module visuals  | hardcoded `lug-tires`                             | generic loop over fitted modules                                                                                 |
| state shell     | no `uHitPoint`                                    | `uHitPoint` plus pending condition impacts                                                                       |

Wiring it as written would have created a **second, frame-rate-dependent truth
source for a persisted, replay-validated value** — precisely what motto §7
forbids — and would have dropped `heading`/`pitch`/`roll` from the root
transform, leaving every rig visually flat on sloped terrain.

There was also an inverted dependency: the module named as the owner imported
`RigParts` from the module it was supposed to own the channels for.

## Decision

1. **The fixed-step kernel owns physical truth.** Anything that survives a
   reload or a replay — position, heading, pitch, roll, wheel rotation, wheel
   compression, engagement state — is owned by simulation and is **read** by
   presentation, never recomputed.
2. **`vehicleAnimationSystem` owns rig-local presentation**: the mapping from
   that authoritative state to scene-graph transforms, plus genuinely
   presentation-local smoothing (the plough's visible swing rate).
3. **The renderer keeps orchestration**: world placement, phase, terrain, dust,
   camera, post-processing, and feedback derivation — the last because its
   evidence surface reports the same frames.
4. **Clip ownership is separate from rig ownership.** `registerClips(ownerId,
root, clips)` binds authored animations for _any_ scene object and gives them
   a mixer the frame loop ticks.
5. ADR-0031 is superseded, not deleted. Its boundary judgement survives; its
   mechanism and its implementation claim do not.

## What this delivered beyond the wiring

The exploration that preceded this ADR asked whether the module's dormant
channels should be deleted or built. Two were built rather than removed:

- **The cockpit steering control.** The module had a steering-wheel channel that
  resolved `getObjectByName("steeringWheel")` against an object no rig authored —
  a channel driving nothing. Rather than delete it, Torque and Spark now author a
  real raked steering column whose rim turns with the player's input at
  2.5× the road-wheel angle. This is the "rig is the interface" layer from the
  exploration map's Layer 1 rather than another HUD readout.
  **Honest boundary:** the current hood camera socket sits _ahead_ of the
  windscreen (tractor `localZ 0.55`), so it is a hood-mounted view, not an
  interior one. The control is placed where a driver would actually hold it and
  is visible from exterior cameras; a genuine cockpit payoff needs an interior
  camera that does not exist yet. That camera is a candidate work item, not a
  claim of this ADR.
- **The clip seam.** `clipActions` was permanently `null`. The GLB loader path
  was already calling `loadAsync` and discarding `gltf.animations`, so an
  imported asset shipping a spinning fan or a pumping jack stood frozen.
  Imported clips are now bound, played, and advanced, and the bound count is
  recorded in `RuntimeAssetBridgeEvidence.animationClipCount`.

Removed, with reason: the spring-damper re-derivations of wheel rotation and
suspension compression, and the `wheelRadius`/`trackWidth` caches that existed
only to serve them. This is a supersession under §7, not a lint-driven deletion
under the code-preservation rule — the deleted code computed values the kernel
already owns.

## Validation

Reproducible on this checkout.

- `node tools/audit-runtime-reachability.mjs` — `animation.ts` no longer appears;
  unreachable modules fell from 30 (2,365 lines) to 29 (2,040 lines).
- `npm run typecheck` — clean.
- `npx vitest run` — 65 files, 382 tests pass, including 10 new tests in
  `src/game/animation.test.ts`. That file previously had none.
- Live browser on the canonical `4173` surface, chase camera, under throttle and
  steering:
  - `getRigOrientationEvidence("utility-tractor")` → `visualFrontIsForward: true`,
    `frontAlongHeadingMetres: 6.246`. **This is the direct regression proof:**
    had ADR-0031 been implemented as written, the root transform would have lost
    `heading` and `pitch` and this invariant would be false.
  - `getRigPerceptionEvidence("utility-tractor")` → `cameraFocusContractMet: true`,
    `steeringAngle: -0.3` responding to input.
  - Zero console errors captured.

Named regression guards in `animation.test.ts`:

- attitude composes kernel `heading`/`pitch`/`roll` with the feedback offset;
- two presentation frames at identical simulation state produce an identical
  wheel pose, so no presentation-side integrator can drift from the save;
- suspension travel tracks kernel compression around its resting value;
- imported clips bind, play, and advance under `update()`.

## Consequences

- One truth source per physical value; replay determinism is structurally
  protected rather than protected by convention.
- The renderer's frame loop shed ~70 lines of rig-local transform writes.
- `RigParts` still crosses between the two modules as a **type-only** import, so
  there is no runtime cycle. Relocating it to a neutral presentation-contract
  module is a reasonable follow-up and was left out of this gate under §6.1
  scope control.
- Hover rigs remain wheel-less and cockpit-control-less by construction; a rig
  without an authored `steeringWheel` object is a rig-identity statement, not a
  missing feature.

## Rollback and revisit triggers

Revisit if:

- a rig's visual body becomes GLB-backed with authored clips, which would make
  rig-level clip ownership worth reuniting with the rig registration;
- an interior/cockpit camera lands, which changes how much the cockpit control
  should carry;
- a future channel genuinely needs presentation-local physical state that the
  kernel cannot own without polluting the save.

## Update log

- 2026-07-28: Recorded after superseding ADR-0031, landing the refactor that
  ADR-0031 decided but never delivered, correcting its mechanism, and building
  the two dormant channels rather than deleting them.
