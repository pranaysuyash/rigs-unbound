# ADR-0010: Render contract + accessibility as mandatory non-functional gate

- Date: 2026-07-25
- Status: proposed
- Owner: Pranay
- Decider: project team
- Decision owner: project owner (Pranay)
- Related:
  - [ADR-0001 Headless gameplay kernel and engine bakeoff](./ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md)
  - [ADR-0007 Terrain is the simulation substrate](./ADR-0007-terrain-as-simulation-substrate.md)
  - [ADR-0008 Camera policies and direct view selection](./ADR-0008-camera-policies-and-direct-view-selection.md)
  - [ADR-0009 Bounded mobility adapters own locomotion-specific state](./ADR-0009-bounded-mobility-adapters.md)
  - [TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25](../research/TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25.md)

## Context

Current runtime evidence shows strong kernel and world progression infrastructure (`src/game/state.ts`, `src/game/terrain.ts`, `src/game/renderer.ts`) and a real actionability path across rigs/world/migration. Cross-skill review now points to the next highest leverage gap: the project does not yet have a **formal render/perf/accessibility contract**, so current behavior can drift without measurable guardrails.

The project can ship more content and more rigs safely only if these non-functional gates are explicit:

- what to draw, when to cull, and how to degrade gracefully by device;
- how motion, camera transitions, and effects scale on lower-end hardware;
- how reduced-motion and readability requirements are handled before broader public exposure.

## Decision

### 1) Introduce a canonical renderer contract as data, not code preference

Create a repo-local render contract under `docs/` and enforce it as a documented dependency for renderer changes:

- visibility policy (`frustum`, planned occlusion strategy, draw-call budget, LOD bands);
- terrain/material feedback policy (slope, wetness, danger and time-of-day visual cue mapping);
- renderer fallback policy (pure WebGL baseline, optional WebGPU/advanced path in feature branch only).

Implementation consequence:

- renderer performance and accessibility decisions become part of planning, not ad-hoc tuning.

### 2) Declare explicit runtime quality profiles instead of implicit behavior

Define at least three profiles used by startup config and runtime state:

- `full` (desktop/classic path),
- `standard` (default web path),
- `mobile-safe` (reduced complexity).

Each profile pins concrete knobs (shadow strategy, fog complexity, instancing density, effect budget, HUD density, audio layers where UI-dependent).

### 3) Add accessibility and motion-safety as first-class product constraints

Before expanding public playability claims, the runtime must include explicit handling for:

- reduce-motion variant for camera effects and non-essential motion effects;
- readable feedback for input outcome and camera mode;
- color-conveyance fallback paths (shape/animation/telemetry not only hue);
- minimum contrast and interaction clarity for critical UI state markers.

### 4) Stage shader/effect growth from contract evidence

Custom materials/shaders are introduced only when the contract records a measurable requirement.
Priority order:

1. slope/wetness cueing and terrain affordance readability;
2. contact/suspension feedback cues;
3. atmospheric/time-of-day polish.

### 5) Keep WebGPU as enhancement with hard fallback guarantees

No hard dependency that can break baseline operation on WebGL-compatible devices.

- Baseline: deterministic Three.js/renderer path under current dependency set in `package.json`.
- Enhancement: optional WebGPU experiments behind feature checks and explicit fallback behavior.

## Implementation consequences

### Positive

- protects current architecture from renderer drift;
- reduces late rework when adding locomotion families or terrain complexity;
- gives objective review path before every public test;
- aligns with motto_v4 requirement to document and harden before claim-heavy iteration.

### Costs / trade-offs

- additional documentation and acceptance overhead before content tuning;
- reduced short-term freedom in art iteration.

This is accepted in exchange for lower long-term uncertainty and lower release risk.

## Rejected alternatives

- Adding engine-level or shader-only optimization without defining contracts first.
  - Rejected: optimizes symptoms but not invariants.
- Treating accessibility as post-hoc UX pass.
  - Rejected: increases rework and introduces hidden launch risk.
- WebGPU-first path without full WebGL fallback policy.
  - Rejected: reduces reach and violates the web-platform risk posture.

## Validation plan

- Static: docs review + plan review by owner before any renderer-affecting PR.
- Runtime: browser acceptance script extends matrix to capture:
  - framerate envelope,
  - draw-call and actor counts,
  - profile-switch effects,
  - console warnings/errors,
  - visible mode fallback behavior.
- Evidence levels:
  - Tier 2: stateful acceptance checks remain deterministic.
  - Tier 3: production build + browser probes include profile switching and reduced-motion smoke checks.
  - Tier 4: representative-device observation before public-facing commitments.

## What this enables

This ADR enables the next hardening lane (renderer and UX contract first), while keeping engine-selection flexibility open.

## Anything else?

Do not treat this as an art-only ADR; treat it as a systems contract that protects gameplay evidence and future locomotion expansion.

## Update log

- 2026-07-25: proposed from the current multi-skill analysis pass to turn renderer/accessibility gaps into enforced gates before the next public-facing build.
- 2026-07-25: the operator's perception-chain outcome made reduced-motion and
  feedback active implementation requirements. ADR-0012 now derives shared
  motion expression from authoritative rig telemetry; full quality profiles,
  budgets, and player-facing comfort controls remain proposed here.

## Addendum (2026-07-26): player and developer evidence surfaces separated

The default public/player surface now hides Physics Lab navigation and live
fps/draw-call/heap tuning metrics. Those remain available on the explicit
`?surface=developer` surface and the guarded `?acceptance=field-02` evidence
surface. The direct lab URLs remain bootable; navigation visibility is not route
deletion.

Persistence status remains visible to players, but now uses literal state such
as new field, local restore/migration, or saved locally. Runtime diagnostics
have their own developer-only element and aria label instead of sharing the
save line. Contextual touch controls expose the current semantic verb and
capability availability through text and aria labels, not colour alone.

This closes the public debug-leak portion of the accessibility contract. Full
quality-profile selection and representative-device budgets remain open.
