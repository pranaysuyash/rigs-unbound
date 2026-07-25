# Plan: Rendering, performance, and accessibility hardening (2026-07-25)

## Objective

Implement a concrete plan that enforces the renderer contract and accessibility baseline before expanding locomotion count or broad content polish. This aligns with the existing long-term architecture and keeps exploration evidence reliable.

## Dependencies

- [ADR-0007 Terrain as simulation substrate](../decisions/ADR-0007-terrain-as-simulation-substrate.md)
- [ADR-0010 Render contract + accessibility as mandatory non-functional gate](../decisions/ADR-0010-rendering-accessibility-contract.md)
- current kernel + storage evidence in [`src/`](../../src/) and decision map artifacts.

## Acceptance contract

Before shipping any public claim from this lane, evidence must exist for:

- defined visibility and quality profile policy;
- reduced-motion behavior for all camera/effect motion paths;
- documented and measured baseline + degraded profile outcomes;
- no regressions in deterministic browser test hooks:
  - `window.render_game_to_text()`
  - `window.advanceTime(ms)`
  - `window.getPerformanceSnapshot()`
- at least 1 representative narrow-device and 1 desktop acceptance snapshot.

## Planned work (ordered)

### 1) Contract implementation artifacts

1. Add `docs/research/RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md` with:
   - profile catalog (`full`, `standard`, `mobile-safe`)
   - profile knobs and hard limits
   - renderer fallback matrix
   - who owns which knob (physics, camera, audio, minimap)
2. Add `docs/research/RENDER_ACCESSIBILITY_CHECKLIST_2026-07-25.md` with concrete checks for:
   - reduced-motion,
   - contrast/readability,
   - input-feedback clarity,
   - UI timing safety.

### 2) Evidence-first execution slice

3. Extend browser acceptance checks to capture profile metadata and reduced-motion state.
4. Capture baseline metrics in `tools/rig-lab-browser-acceptance.cjs` output:
   - draw call estimate,
   - frame-time envelope,
   - heap/scene object growth,
   - fallback path chosen.
5. Add a temporary review artifact `docs/reviews/RENDER_PROFILE_ACCEPTANCE_2026-07-25.md` with screenshot references and gap list.

### 3) Product guardrails

6. Update [docs/WORKLOG.md](../../docs/WORKLOG.md) with a short decision gate status and completion blockers.
7. Add map/map-readiness references to [docs/exploration/EXPLORATION_MAP.md](../../docs/exploration/EXPLORATION_MAP.md) for render/accessibility gates.

## Decision points

- **Decision A (this plan):** continue with rendering/accessibility hardening first, or push another locomotion adapter first.
  - default: harden first, then expand.
- **Decision B:** set `mobile-safe` as default for all first public smoke routes.
  - default: yes, unless perf data proves `standard` is stable.
- **Decision C:** custom shaders only in explicit slices with measurable value.
  - default: terrain/contact/weather minimal shader set, then expand only if evidence requires.

## What is out of scope

- engine migration,
- multiplayer/authority systems,
- content-only roadmap expansion,
- final art-pipeline migration to external DCC stack.

## Anything else?

This lane should be completed as a single unit before broad visual expansion, because it raises the confidence bar on every future “looks better” decision.
