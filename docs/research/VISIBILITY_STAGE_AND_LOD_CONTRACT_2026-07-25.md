# Visibility Stage and LOD Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)
2. [Browser Daemon](/Users/pranay/Projects/skills/testing/playwright-skill/SKILL.md)

## Purpose

Turn the current renderer's practical visibility choices into a named policy surface.

The live app already instantiates world props around the rig, keeps terrain in a single mesh, uses blob shadows instead of shadow maps, and exposes performance hooks for draw calls, triangles, frame timing, and first-controllable time. What it does not yet have is a formal contract for what counts as near, mid, far, or absent across rendering and simulation.

## Current evidence base

- Renderer:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Performance:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Exploration map:
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

Runtime anchor:

- live browser page exposes `render_game_to_text`, `getPerformanceSnapshot`, and `selectCamera`
- live browser page currently focuses the playable world canvas after the intro is dismissed

## What is already there

The renderer already shows the beginnings of a visibility budget:

- terrain is a single mesh derived from a height field
- repeated props are instanced rather than individually drawn
- prop instances are rebuilt around the rig within a fixed radius
- furrows are instanced instead of accumulated as one mesh per mark
- stars and sky are explicitly treated as whole-scene presentation pieces
- blob shadows are used instead of real shadow maps

That is a sensible first-playable posture. It is not yet a formal visibility-stage contract.

## What is still missing

The repo still lacks a named policy for:

- frustum culling fixtures and exclusions
- distance-based visibility tiers
- subsystem-specific LOD
- portal or cluster visibility, where it becomes relevant
- counters for missed-cull pressure and residency churn

At the moment, some mesh classes explicitly disable automatic frustum culling because the current renderer is prioritizing consistent presentation over a formal visibility graph. That is a valid implementation choice for a first slice, but it needs a contract before more scale or more content arrives.

## Contract shape

The visibility policy should separate:

1. camera-space visibility
2. local draw-radius visibility
3. distant simulation tiers
4. hidden or inactive residency

The policy should define what each tier means for:

- geometry
- materials
- animation
- physics
- AI or interaction updates
- particles and feedback

## Validation rules

The contract should be considered healthy only if it can answer:

- what is visible in the camera frustum
- what is only present in the local render radius
- what can still simulate at reduced frequency
- what is fully inactive
- what is currently suppressed by fallback behavior

## Near-term proof slice

The smallest durable proof for this contract is:

1. one visible-actor culling fixture that excludes a non-visible entity from draw submission
2. one distance-tier matrix for geometry and at least one non-geometry subsystem
3. one observable counter for missed-cull pressure or residency churn
4. one regression test that proves the downgrade tier remains readable instead of disappearing into undefined behavior

## Open questions

- Should the first explicit culling fixture operate on a prop field, a clustered world site, or a dedicated synthetic scene?
- Which subsystem should be the first non-geometry LOD proof: animation, AI, physics, or particles?
- When should portal visibility graduate from "if applicable" to a real graph contract in this project?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The renderer already behaves like a deliberate first-pass visibility budget. This contract makes that budget legible so future scale decisions can be measured instead of guessed.

## Addendum (2026-07-25): visibility budget is real, policy is still implicit

- Re-checked the current renderer path and live browser surface after the
  contract review.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The renderer already implements the visibility behavior this contract names:
  - a single terrain mesh derived from the height field,
  - repeated props and furrows as instanced draws,
  - local prop rebuilds around the rig within `PROP_RADIUS = 168`,
  - rebuilds gated by `PROP_REBUILD_DISTANCE = 34`,
  - explicit `frustumCulled = false` on presentation pieces that currently need
    stable always-present rendering,
  - performance metrics exposing draw calls and triangle count.
- That means the first-pass visibility budget is a live reality, not a theory.
- What is still missing is the policy surface:
  - explicit visible vs local-radius vs distant-sim tier naming,
  - counters for missed-cull pressure or residency churn,
  - a formal downgrade/readability regression test for non-geometry LOD.
- So the contract remains useful as a boundary note, but the repo should still
  treat it as an implicit renderer policy until those named counters/tests exist.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - the visibility budget stays deliberate, but the tier contract is still not named

- Re-checked the live browser daemon and current renderer source.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The current renderer still behaves like a deliberate first-pass visibility
  budget:
  - terrain remains a single mesh derived from the height field,
  - trees, rocks, felled trunks, salvage, and furrows remain instanced,
  - prop rebuilds are still radius-bounded around the rig,
  - presentation pieces such as the sky and dust still opt out of default
    frustum culling when stability matters more than a formal visibility graph,
  - performance hooks still expose draw calls, triangles, and frame timing.
- That means the first-pass visibility budget is still real and useful.
- The missing layer is still the named policy surface:
  - no visible/local-radius/distant-sim tier matrix,
  - no counters for missed-cull pressure or residency churn,
  - no regression test proving a downgrade tier stays readable rather than
    disappearing into undefined behavior.
- So the renderer remains intentionally compact and legible, but visibility/LOD
  is still an implicit policy rather than a first-class contract artifact.

## Addendum (2026-07-26) - Phase 0 visibility policy is now implemented at Tier 1

`src/game/visibility.ts` now centralizes `full`, `standard`, and
`mobile-safe` distance bands. The active renderer keeps the existing
`standard` far distance of 168 m, so this first proof preserves current visual
range while making each obstacle and salvage candidate classify as `near`,
`mid`, `far`, or `culled` during the existing prop rebuild.

`GameRenderer.metrics()` and `PerformanceMonitor.snapshot()` now expose:

- active profile identifier;
- logical candidate and submitted counts;
- near/mid/far/culled counts;
- capacity-limited count.

This is deliberately not a claim that dynamic profile selection, per-instance
frustum culling, representation-specific LOD, or subsystem-frequency LOD is
complete. It creates the deterministic threshold and telemetry seam those
later changes require.

Evidence tier: Tier 1 implementation inspection. No fresh test, browser
benchmark, or representative-device run is claimed in this addendum.

## Addendum (2026-07-26) - developer-facing visibility observability

- The existing developer diagnostics now display the current renderer visibility
  snapshot beside FPS, draw calls, heap use, and runtime asset-bridge status.
- The compact `props:` segment reports submitted/candidate props, near/mid/far
  tier counts, culled candidates, and instance-capacity pressure. The same
  snapshot remains available to run records and `window.getPerformanceSnapshot`.
- This adds an operator-facing measurement path for the Tier 1 visibility policy
  without introducing a second debug UI or exposing tuning controls on the
  player-facing surface.
- This is not proof of dynamic profile selection, per-instance frustum culling,
  occlusion culling, geometric LOD, or mobile-runtime acceptance. Those remain
  separate future claims requiring their own measurements.
- Evidence level: Tier 1 static source inspection; no browser or benchmark run
  was performed in this pass.

## Addendum (2026-07-26) - visibility tiers are not imported-asset LODs

- The visibility classifier now has a measured runtime fallback path, but the
  production-asset review confirms that it still changes only the bounded
  procedural prop set. It does not select different mesh representations.
- The two manifest-owned GLB bridge candidates each have one runtime URL and
  are developer-only pending public approval. They cannot truthfully establish
  LOD0/LOD1/LOD2 behavior.
- The first geometric LOD proof must be an asset-delivery slice, not a renderer
  shortcut: one approved static asset with linked variants, stable spatial and
  collision/socket contracts, distance thresholds, import validation, and
  before/after browser cost/readability evidence.
- Until that proof exists, `near`, `mid`, and `far` mean visibility accounting
  only. This distinction prevents a future profile selector from presenting
  draw-radius reduction as richer asset optimization than it actually is.

## Anything else? (LOD truth)

The current fallback remains valuable because it reduces deterministic scenery
work without changing gameplay. It should not be marketed or documented as
geometric LOD until representation variants have passed the asset gate.

## Addendum (2026-07-26) - visibility is measured, but representation LOD is still future work

- Re-checked the live visibility code in `src/game/visibility.ts` and the
  renderer diagnostics that consume it.
- The runtime now has a stable visibility budget surface:
  - `full`, `standard`, and `mobile-safe` distance profiles,
  - `near`, `mid`, `far`, and `culled` classification,
  - candidate/submitted/capacity-limited counters in `PropVisibilityMetrics`,
  - the active profile surfaced alongside draw calls and frame timing.
- The active `standard` profile still preserves the existing `farMeters = 168`
  radius, so this is a measured accounting seam rather than a geometric
  content change.
- That means the contract can now say something more precise:
  visibility is explicit and observable, but imported-asset representation LOD
  is still missing.
- The next proof should therefore be an asset-delivery slice with actual
  representation variants, not another renderer-local distance shortcut.
- Evidence depth: Tier 1 static source inspection of `src/game/visibility.ts`
  plus the current renderer diagnostic path.

## Addendum (2026-07-26) - episode grammar depends on visibility to keep episodes readable

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this visibility contract.
- The episode grammar does not change the visibility budget or LOD policy; it
  depends on them so the player can actually read the pressure, discovery, and
  persistent consequence the episode is trying to communicate.
- This preserves the boundary: visibility/LOD remains the legibility layer,
  while episode grammar remains the story-composition layer that uses that
  legibility.
