# ADR-0015: Renderer and camera policy for v1.x

- Date: 2026-07-25
- Status: proposed
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [ADR-0008](./ADR-0008-camera-policies-and-direct-view-selection.md)
  - [ADR-0010](./ADR-0010-rendering-accessibility-contract.md)
  - [ADR-0012](./ADR-0012-rig-perception-chain.md)
  - [ADR-0014](./ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md)
  - [3D Game Optimization Gaps and Long-Term Expansion Synthesis](../research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md)
  - [3D Game Optimization Gaps -- "And More" Execution Roadmap](../research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
  - [Rendering Potential and Economy](../research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)

## Context

The runtime already has a canonical renderer, a camera vocabulary, and a growing set of render/accessibility contracts. What it still lacks is a single v1.x policy that binds the shared thresholds together so the renderer, camera, and observability layers do not drift independently.

The project now has enough evidence to state a renderer/camera policy without rewriting the engine:

- visibility and camera policy are already explicit concerns;
- the render path is snapshot-driven, not simulation-owned;
- the project already tracks a budget economy and a visual-language plan;
- the broader architecture prefers contract-first growth over ad hoc tuning.

This ADR turns those facts into a stable decision surface.

## Decision

### 1) Keep one canonical renderer policy for v1.x

The canonical v1.x renderer policy is:

- Three.js remains the default runtime renderer;
- renderer changes must preserve culling thresholds, LOD bands, camera behavior, and collision/readability semantics;
- the renderer may degrade, but it must do so through named fallback states rather than silent drift.

### 2) Bind camera and render policy together

Camera modes remain named and reusable. The renderer policy must preserve the existing camera vocabulary while protecting the player’s spatial literacy:

- direct selection and cycling remain available;
- speed, terrain, danger, and user settings may influence camera behavior, but only through named policy inputs;
- camera changes must remain observable and recoverable across saves and mode transitions.

### 3) Make budget and readability explicit

The v1.x policy uses a simple economy:

- spend first on player readability, nearby terrain, and critical feedback;
- spend second on distant detail, ambience, and optional effects;
- spend last on non-essential polish.

The policy therefore treats the following as first-class thresholds:

- per-frame actor count;
- active physics count;
- draw-call count;
- transition latency;
- memory/residency pressure;
- shadow/effect overhead where relevant.

### 4) Require profile-aware fallback behavior

At minimum the runtime should be able to reason about:

- full / desktop-class behavior;
- standard web behavior;
- mobile-safe or reduced-complexity behavior.

The profile needs to be visible in acceptance, not implicit in a device heuristic.

### 5) Preserve accessibility and motion safety

The renderer/camera policy must continue to enforce the existing accessibility direction:

- reduced-motion behavior remains supported;
- important state cues cannot rely only on motion or hue;
- camera and visual clarity must remain acceptable under fallback settings.

## Consequences

### Positive

- keeps renderer and camera growth from turning into per-feature exceptions;
- gives a clear owner for performance/readability tradeoffs;
- preserves player-facing clarity under budget pressure;
- makes future engine or backend evaluation measurable against a single policy.

### Trade-offs

- reduces short-term freedom to tune renderer behavior ad hoc;
- requires explicit threshold updates when new rigs, worlds, or motion grammars arrive;
- makes some visual changes policy changes, which is slower but safer.

## Rejected alternatives

- **Let renderer and camera drift independently.**
  - Rejected because it recreates the exact ad hoc growth problem this ADR is meant to prevent.
- **Treat render fallback as a purely technical concern.**
  - Rejected because visual clarity and camera readability are gameplay properties.
- **Replace the canonical renderer to solve budget pressure.**
  - Rejected because the evidence supports contract hardening before branch changes.

## Validation plan

- Static:
  - confirm this ADR is linked from the analysis and roadmap;
  - keep the performance/readability baseline note aligned with this policy.
- Runtime:
  - verify fixture scenes can report culling, LOD, actor count, physics count, and transition latency;
  - verify camera mode selection and fallback behavior remain observable;
  - verify reduced-complexity profiles still preserve clarity.
- Evidence levels:
  - Tier 2: deterministic fixture scenes and targeted checks;
  - Tier 3: browser-visible profile switching and reduced-motion smoke checks;
  - Tier 4: representative-device observation before public claims about the policy.

## Acceptance criteria

This ADR should be treated as ready when the repo can point to:

1. the renderer budget / visual-language companion note;
2. the performance and readability baseline policy;
3. the camera feel contract and direct selection policy;
4. visible profile-aware fallback behavior in runtime acceptance;
5. instrumentation for actor count, physics count, draw-call pressure, and transition latency.

## Update log

- 2026-07-25: proposed to capture the v1.x renderer/camera policy as a durable policy ADR after the performance/readability baseline note and camera/render contracts were already in place.
