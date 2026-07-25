# ADR-0016: Performance and readability threshold baseline for v1.x

- Date: 2026-07-25
- Status: proposed
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [ADR-0010](./ADR-0010-rendering-accessibility-contract.md)
  - [ADR-0012](./ADR-0012-rig-perception-chain.md)
  - [ADR-0015](./ADR-0015-renderer-camera-policy-v1x.md)
  - [Rendering Potential and Economy](../research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
  - [Render Contract Profile Matrix](../research/RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)
  - [Runtime Instrumentation KPIs for Production-like Profiles](../research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
  - [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](../research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
  - [Physics Readability and Speed Contract](../research/PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md)

## Context

The repo now has named contracts for renderer budgets, accessibility, profile behavior, perception, and high-speed physics readability.

What it still needs is a single threshold baseline that tells the team when a scene is:

- within budget,
- degraded but acceptable,
- fail-soft and intentionally simplified,
- blocked and therefore not acceptable for a public smoke test or similar acceptance claim.

Without that baseline, each metric can drift on its own and the existing policy docs turn into a set of suggestions instead of one decision surface.

## Decision

### 1) Use four threshold states across the v1.x public envelope

Every measured profile should be classed as one of these states:

- **within budget**
  - the profile stays inside its named envelope;
  - readability is intact;
  - no non-essential fallback is required.
- **degraded but acceptable**
  - the scene crosses a soft target, but the named fallback keeps the scene readable;
  - gameplay semantics do not change;
  - the degradation is visible and intentional.
- **fail-soft**
  - the system must simplify further to protect readability or responsiveness;
  - the fallback path is still playable and observable;
  - the scene remains valid for internal review but may not qualify for public smoke-test acceptance.
- **blocked**
  - the scene loses control readability, hides critical state, changes gameplay semantics, or lacks a named fallback;
  - this is not acceptable for a public claim.

### 2) Bind thresholds to the existing policy surfaces

The threshold baseline governs these shared areas:

- culling and draw pressure,
- LOD tier changes,
- camera mode and camera-effect intensity,
- collision layer semantics,
- per-frame actor and physics budgets,
- transition latency,
- fallback visibility.

If a subsystem changes its thresholds, this ADR is the place that records the decision.

### 3) Set the fallback order explicitly

When pressure rises, the system should simplify in this order:

1. keep control readability and player response;
2. preserve terrain, hazards, and objective legibility;
3. reduce far-field and decorative detail;
4. clamp non-essential camera and motion effects;
5. simplify optional lighting or ambience;
6. record the fallback reason in telemetry or acceptance output.

This order keeps the player-facing truth intact while spending less budget.

### 4) Define the capture bundle used for threshold comparison

The easiest comparison format across time is a fixed fixture bundle with:

- one machine-readable metrics capture (`metrics.json` or equivalent);
- one screenshot or frame capture for the same fixture and profile;
- one short operator note naming the profile, fixture, and threshold state;
- one stable fixture identifier.

This bundle is what future threshold tuning should compare.

### 5) Preserve semantics across fallback

A profile may degrade, but it may not:

- change the meaning of a control,
- remove the ability to understand failure or recovery,
- silently alter collision or camera semantics,
- hide the reason a profile moved to a lower band.

## Consequences

### Positive

- gives the renderer, camera, physics, and observability layers one shared language for thresholds;
- reduces ad hoc tuning across separate notes;
- makes the first public smoke-test gate and later profile work comparable over time.

### Trade-offs

- some tuning choices now require an explicit policy update;
- a scene can be rejected for readability even if raw frame budget looks acceptable;
- the baseline is intentionally conservative until representative captures prove otherwise.

## Rejected alternatives

- **Let each subsystem keep its own thresholds.**
  - Rejected because it recreates silent drift and makes acceptance claims incoherent.
- **Use only a single FPS number.**
  - Rejected because it hides whether the scene failed due to culling, camera clarity, physics pressure, or fallback behavior.
- **Push threshold tuning into ad hoc review comments.**
  - Rejected because comments do not survive as policy.

## Validation plan

- Static:
  - confirm the threshold baseline is linked from the renderer, KPI, and readability notes;
  - confirm the public-smoke-test contract points at this ADR for threshold classification.
- Runtime / review:
  - compare fixture captures across `full`, `standard`, and `mobile-safe` profiles;
  - verify the same scene reports its threshold state consistently;
  - verify fallback reasons are visible in logs or captures.
- Evidence levels:
  - Tier 1: policy and doc coherence;
  - Tier 2: deterministic fixture captures and profile comparisons;
  - Tier 3: browser-visible threshold transitions on representative scenes;
  - Tier 4: observed readability on a real device.

## Acceptance criteria

This ADR is ready when the repo can point to:

1. the renderer/camera policy for v1.x;
2. the public-smoke-test accessibility contract;
3. the KPI note that records actor, physics, draw, and transition metrics;
4. the visual-language/budget companion note;
5. one fixture capture bundle that demonstrates within-budget, degraded, and fail-soft states.

## Update log

- 2026-07-25: proposed as the umbrella threshold baseline after the renderer, accessibility, physics readability, and KPI notes had already been named.
