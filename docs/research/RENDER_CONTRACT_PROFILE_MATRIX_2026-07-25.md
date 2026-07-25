# Render Contract Profile Matrix (2026-07-25)

## Purpose

Set explicit non-functional constraints for all renderer-affecting work.

## Canonical profile table

| Profile | Audience | Shadow strategy | Fog/atmosphere | Instancing | Effect budget | Fallback policy | Camera effect intensity |
|---|---|---|---|---|---|---|---|
| full | desktop benchmark | full when stable + bounded | near/far and volumetric terms allowed | high | custom materials + one shader layer | degrade to standard when budget exceeded | enabled with safe clamp |
| standard | default web baseline | soft shadows, capped count | bounded fog only | medium | one custom effect layer | degrade to mobile-safe | moderate, motion-aware |
| mobile-safe | representative mobile/low-end | no dynamic shadows | low-cost fog | conservative | no heavy post effects | reduced set, motion-safe |

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
