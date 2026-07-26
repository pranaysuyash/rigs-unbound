# Physics Quality Envelope Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current lightweight traversal model into a named physics quality envelope.

The runtime already has a deterministic fixed-step traversal model, bounded collision checks, explicit terrain contact, and measured performance snapshots. That is a good first-playable physics posture. What it does not yet have is a first-class contract that names the stability envelope, fallback behavior, and observability for future growth.

## Current evidence base

- Traversal and motion model:
  - [src/game/physics.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/physics.ts)
- Deterministic game state and motion integration:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Performance visibility:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Roadmap lane for physics quality:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)

Live browser anchor:

- performance snapshot is exposed
- current live snapshot reports a measurable frame budget, draw calls, triangles, heap use, and first-controllable timing

## What is already there

The current physics model already has several strong properties:

- fixed-step determinism
- reduced-DOF body-on-four-contacts traversal
- emergent gearing, grade, and grip behavior
- explicit suspension, launch, and landing dynamics
- bounded obstacle checks
- observable motion outcomes such as slip, water depth, boundary impact, and stall

This is enough to call the physics layer intentional. It is not yet enough to call the quality envelope named.

## What is still missing

The repo still lacks a named policy for:

- explicit physics stability states
- terrain-contact invariants
- obstacle-contact invariants
- high-speed cornering or slope-handling thresholds
- water or fluid-adjacent fallback behavior
- operator-visible physics stability summaries

The current code already exposes the underlying outcome signals, but the policy that says when a simplified fallback is acceptable is still implicit.

## Contract shape

The physics envelope should separate:

1. deterministic locomotion
2. contact stability
3. fallback simplification
4. observable stability state
5. recovery / failure explanation

Suggested invariant families:

- terrain contact
- obstacle contact
- slope handling
- high-speed cornering
- stacking or near-overlap situations
- water or fluid-adjacent behavior

## Validation rules

The contract should fail visibly if it:

- loses fixed-step determinism
- allows collision counts to grow without bound
- hides a failed contact or unstable recovery
- changes feel without reporting the stability state
- silently simplifies water or slope handling in a way that players cannot observe

## Near-term proof slice

The smallest durable proof for this contract is:

1. one terrain-contact invariant test
2. one obstacle-stability regression test
3. one high-speed cornering or slope-handling test
4. one water or fluid-adjacent fallback rule
5. one telemetry or debug field for physics stability state

## Open questions

- Which current surface should be the canonical regression fixture for terrain contact?
- Should water fallback be represented as a visible slowdown, a clearance clamp, or a hard no-go state?
- Which physics state should be surfaced to operators first: grounded, airborne, slipping, stalled, or overloaded?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The physics layer is already stable enough to be a first-playable foundation. This contract makes the envelope explicit so the next locomotion or hazard step can extend the system without silently changing the game’s feel.

## Addendum (2026-07-25) - Live physics posture is stable and visible, but still not policyized

- Live browser evidence shows the current physics posture is compact and
  measurable:
  - about 78 draw calls,
  - about 105k triangles,
  - first-controllable and first-input-ready timing tracked separately,
  - a stable, grounded active rig with visible grip and condition readouts.
- The HUD already exposes the player-facing physics state:
  - `Grip`
  - `82%`
  - `100%`
  - `Home Silo workshop · fit modules, 0 salvage in the bin`
- The code path already surfaces the physics factors the contract cares about
  (`grounded`, `hover`, `slip`, `waterDepth`, `stalled`, condition, strain),
  but there is still no formal stability-state policy or fallback envelope.
- That means the physics layer is still best treated as an intentional
  first-playable foundation, not yet a named quality envelope with explicit
  fallback semantics.

## Addendum (2026-07-25) - The runtime exposes the physics signals, but the envelope is still implicit

- `src/main.ts` already renders the physics readout into the HUD:
  - condition,
  - grip,
  - slope/grade,
  - stall / water-depth / slipping state,
  - mobility-family labeling for ground versus hover.
- `src/game/performance.ts` and `window.getPerformanceSnapshot()` already expose
  the measurement side of the lane:
  - frame timing,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable timing.
- The live browser status remains healthy and the current runtime stays in the
  first-playable category, which matches the contract’s current evidence base.
- What is still missing is the explicit policy layer the contract names:
  - named stability states,
  - formal terrain/obstacle invariants,
  - a declared fallback envelope for slope/water simplification,
  - operator-visible summaries that say when the physics layer has simplified
    behavior rather than merely exposing the raw factors.
- So the correct interpretation is unchanged: the physics layer is intentional
  and measurable, but still not policyized into a first-class quality envelope.

## Addendum (2026-07-26) - terrain-face refusal is now explicit in code, but still not surfaced as a named envelope

- Re-checked the current motion stack against the live runtime and source.
- `src/game/terrain-traversal.ts` now makes the shared terrain-face boundary
  explicit in code:
  - a swept support-edge probe rejects discontinuous faces,
  - the refusal returns the semantic reason `terrain-face`,
  - ground and hover adapters use the same shared boundary with different
    support-rise thresholds.
- `src/game/physics.ts` consumes that boundary as a real `traversalBlockReason`
  inside the motion outcome, so the game already knows when a move was refused
  for a terrain-face reason.
- The runtime still does not expose this as a named physics envelope state:
  - the player can experience the refusal,
  - operators can read the underlying signals,
  - but the policy language for the fallback remains implicit rather than a
    surfaced stability class.
- So the contract’s next useful step is still the same: keep the shared
  terrain-face guard and add an explicit envelope/state summary on top of it
  instead of burying the rule inside motion math.

## Addendum (2026-07-26) - the live physics posture is still stable, and the envelope is still implicit

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current live performance snapshot remains in the first-playable band:
  - `averageFrameMs`: `20`
  - `p95FrameMs`: `21.5`
  - `framesPerSecond`: `50`
  - `drawCalls`: `72`
  - `triangles`: `104694`
  - `heapUsedMb`: `16.5`
  - `firstControllableMs`: `469.2`
- Treat those figures as diagnostic-only. Concurrent browser and capture
  workloads can contaminate timing evidence, so a clean representative-device
  profile remains required before the values define thresholds or public
  performance claims.
- `src/game/physics.ts` still behaves like a deliberate first-playable motion
  model:
  - fixed-step determinism,
  - terrain contact under four sampled wheels,
  - explicit slope, grip, slip, water, and stall outcomes,
  - terrain-face refusal now exists as a real traversal block reason in code.
- The runtime therefore already has the right signals for a quality envelope,
  but the policy surface is still missing:
  - no named stability states,
  - no explicit operator-visible summary of simplified physics,
  - no formal terrain/obstacle fallback envelope,
  - no boundary summary that says when the physics layer has simplified
    behavior rather than merely exposing the raw factors.
- The useful boundary is unchanged: the motion model is intentional and
  measurable, but it still needs a first-class stability envelope before future
  locomotion or hazard work starts layering on more feel changes.
