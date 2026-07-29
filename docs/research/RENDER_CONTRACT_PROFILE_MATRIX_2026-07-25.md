# Render Contract Profile Matrix (2026-07-25)

## Purpose

Set explicit non-functional constraints for all renderer-affecting work.

## Canonical profile table

| Profile     | Audience                      | Shadow strategy            | Fog/atmosphere                        | Instancing   | Effect budget                       | Fallback policy                          | Camera effect intensity |
| ----------- | ----------------------------- | -------------------------- | ------------------------------------- | ------------ | ----------------------------------- | ---------------------------------------- | ----------------------- |
| full        | desktop benchmark             | full when stable + bounded | near/far and volumetric terms allowed | high         | custom materials + one shader layer | degrade to standard when budget exceeded | enabled with safe clamp |
| standard    | default web baseline          | soft shadows, capped count | bounded fog only                      | medium       | one custom effect layer             | degrade to mobile-safe                   | moderate, motion-aware  |
| mobile-safe | representative mobile/low-end | no dynamic shadows         | low-cost fog                          | conservative | no heavy post effects               | reduced set, motion-safe                 |

## Frustum / visibility

- Renderer must avoid submitting clearly off-camera entities.
- Use Three.js frustum defaults plus explicit bounds checks where custom objects exist.
- If occlusion is added, record it as a contract item in this matrix.

## Draw-call and simulation coupling

- Draw-call spikes must be traced against scene state growth.
- Any new prop category must define a max count per profile.
- World mesh/props/adapters should share canonical world contracts (`src/game/terrain.ts`, `src/game/world.ts`).

## Degradation behavior

- Profile selection is driven by measured startup/runtime budget, not user agent sniffing alone.
- When a profile degrades, it must not change gameplay semantics.
- Degradation must preserve player comprehension via text/telemetry consistency.

## Accessibility baseline

- No profile may disable core readability cues when motion is reduced.
- Camera shake, aggressive FOV pulses, and non-essential motion must clamp under reduced-motion.
- UI contrast and focus feedback remain profile-independent.

## Measurement hooks

Use `window.getPerformanceSnapshot()` + acceptance outputs as source of truth.

- frameTime envelope,
- heap trend,
- visible actor counts,
- mesh/material counts,
- shader/material branch count.

## Governance

Any update to this matrix must include:

- rationale,
- observed regression evidence,
- review signature from implementation owner,
- decision update log entry in a linked ADR if thresholds change.

## Addendum (2026-07-26) - current implementation boundary

This profile table is the required target policy, not proof that all profile
behavior is runtime-enforced today.

Current static source evidence establishes a deliberate first-pass renderer
budget:

- terrain remains a single height-field-derived mesh;
- repeated world props and furrows are instanced and rebuilt within a bounded
  radius around the active rig;
- draw-call, triangle, frame-time, heap, load, and save measurements are
  available through existing telemetry;
- the renderer currently sets `frustumCulled = false` for instanced prop sets,
  dust, and sky presentation objects where stable presentation is preferred to
  incomplete custom bounds behavior;
- camera reduced-motion behavior and terrain/obstacle pull-in are implemented.

The following parts of the matrix remain implementation gates rather than
current guarantees:

1. Explicit `full`, `standard`, and `mobile-safe` runtime profile selection.
2. Named geometry/non-geometry visibility tiers and profile-specific limits.
3. A visible loading/profile/failure state for slower or constrained entry.
4. Culling counters, downgrade-readability tests, and representative-device
   evidence.

The immediate first proof is therefore a deterministic visibility classifier
and telemetry surface for one instanced environmental category. It must make
the current radius mechanism and any chosen frustum behavior observable before
the renderer claims profile-aware culling or LOD.

Evidence tier: Tier 1 static inspection of renderer and performance code. No
fresh benchmark or browser run is claimed by this addendum.

## Addendum (2026-07-26) - visibility counters are now observable

- The developer diagnostics reuse the canonical `PerformanceSnapshot.visibility`
  field rather than creating a renderer-specific diagnostic path.
- Operators can now see candidate, submitted, tier, culled, and capacity-limited
  counts while assessing the current standard profile.
- The counters inform future profile and LOD decisions; they do not select a
  profile or change an object's visual representation at runtime.
- Evidence level: Tier 1 static source inspection. Runtime values still need
  browser/benchmark capture before they can support performance claims.

## Addendum (2026-07-26) - the render profile matrix supports episode grammar, but it is not the episode grammar

- The profile matrix already does important support work for episodes: it
  keeps the render budget, visibility tier, and fallback policy readable across
  device classes.
- That makes it a support layer for the episode grammar, because episodes only
  stay legible if the player can still read the world under the chosen runtime
  profile.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - the render profile matrix keeps that moment readable under budget,
  - the active profile remains a presentation policy, not story ownership.
- This note intentionally does not promote the profile matrix into a gameplay
  system; it only keeps the dependency visible so later episode work can rely
  on the same profile policy.

## Addendum (2026-07-29) - ADR-0039 keeps the public profile line separate from acceptance diagnostics

The render profile matrix now maps cleanly onto ADR-0039:

- the public shell keeps `#bootstrap-status` semantic;
- the public shell keeps `#profile-status` visible to the player;
- `#runtime-diagnostics` remains the acceptance/developer summary lane.

That keeps the matrix focused on quality policy and fallback behavior, while
the public shell remains the player-facing place where the selected profile is
named in plain language.
