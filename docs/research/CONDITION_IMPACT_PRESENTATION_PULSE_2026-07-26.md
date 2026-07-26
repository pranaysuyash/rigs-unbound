# Condition-Impact Presentation Pulse

**Date:** 2026-07-26  
**Status:** Implemented presentation-only bridge  
**Evidence tier:** Tier 1 source inspection. No test, build, browser, or runtime command was run in this pass.

## Finding

The renderer already owned state-shell hit uniforms, but its optional `RigFeedbackFrame.lastImpact` field had no producer in the source tree. Collision/structure systems report impact severity, and the runtime already used authoritative condition loss to trigger camera shake and procedural impact audio. The visual shell could therefore remain inert even when the player heard and felt an impact.

## Decision

Use the existing authoritative condition-loss outcome as the single current presentation trigger for shake, audio, and a one-frame state-shell pulse.

The pulse is intentionally centred on the rig shell because the current collision outcome does not carry a stable local hit coordinate. It is an honest damage/readability cue, not a fabricated physical hit-location effect.

## Implementation

- `main.ts` calls `renderer.recordConditionImpact(rig.id)` beside its existing shake and audio response when condition drops past the established threshold.
- `GameRenderer` stores one pending pulse per rig and consumes it during rendering.
- State-shell uniforms receive a centre-shell point and current time exactly once for the pending condition impact.
- Existing optional `feedback.lastImpact` remains a future extension point for a real local collision coordinate; it is not treated as populated today.

## Authority and accessibility

```text
collision/physics consequence
  -> authoritative rig condition loss
  -> presentation orchestration
  -> camera shake + audio impact + state-shell pulse
```

The renderer cannot create damage, alter condition, or affect collision. Reduced-motion behavior remains governed by the existing camera-shake policy; audio and visible condition/UI signals remain independent channels.

## Non-goals

- No new simulation event bus.
- No hit-location physics or renderer-to-state feedback.
- No claim that the pulse identifies the actual collision contact point.
- No extra particle system, material framework, or renderer profile change.

## Review passes

### Pass 1 - Immediate correctness

Traced the existing shell-uniform path and confirmed `lastImpact` had no producer. Reused the already authoritative condition-loss threshold instead of creating a parallel collision detector.

### Pass 2 - Architecture and long-term viability

Kept a transient pulse inside the renderer. The presentation bridge shares an existing outcome with audio/shake but does not serialize, persist, replay as input, or mutate simulation state.

### Pass 3 - Rule compliance and supervision readiness

Recorded the missing local-hit-coordinate limitation and Tier 1 evidence. No test, build, browser, or runtime verification was run, so the pulse is not claimed visually verified.

## Anything else?

Yes: a future true hit-location effect needs a versioned collision outcome carrying a stable local/world contact point, explicit replay treatment, and tests. It must not be inferred from renderer geometry after the fact.
