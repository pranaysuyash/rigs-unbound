# ADR-0054: Modular Renderer Subsystem Decomposition and Behavioral Invariants

- **Status:** Accepted — operator sign-off received in session 2026-08-25 ("accepted, make sure no regressions, all features/functionalities etc either remain intact or enhanced"). Execution plan: [`docs/plans/LARGE_FILE_REFACTOR_EXECUTION_PLAN_2026-08-25.md`](../plans/LARGE_FILE_REFACTOR_EXECUTION_PLAN_2026-08-25.md)
- **Date:** 2026-08-21
- **Author:** Refactor Decision Architect
- **Target File:** `src/game/renderer.ts` (6,779 LOC)
- **Related ADRs:**
  - [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md) (Terrain substrate contract)
  - [ADR-0028](ADR-0028-renderer-auto-backend-governance-and-rollout-gate.md) (Renderer backend governance)
  - [ADR-0034](ADR-0034-simulation-owns-physical-truth-presentation-owns-rig-local-animation.md) (Simulation owns physics; presentation owns visual local animation)
  - [ADR-0041](ADR-0041-terrain-region-refresh-scopes-normal-recompute-to-the-changed-patch.md) (Patch-scoped normal recompute)
  - [ADR-0044](ADR-0044-runtime-bridge-fallback-and-loaded-mesh-disposal.md) (Resource disposal)
  - [ADR-0053](ADR-0053-top-down-game-mode-architecture-and-control-paradigms.md) (Renderer adapter contract & top-down diorama)
- **Evaluation Review:** [`docs/reviews/REFACTOR_DECISION_ARCHITECT_EVALUATION_2026-08-21.md`](../reviews/REFACTOR_DECISION_ARCHITECT_EVALUATION_2026-08-21.md)

---

## Context

`src/game/renderer.ts` is currently the largest file in Rigs Unbound at 6,779 lines of code. It contains the Three.js rendering implementation for the entire game, encompassing terrain rendering, dynamic water, instanced foliage/props, particle systems (dust, wheel roost, diesel smoke), infrastructure models, settlement features, wildlife silhouettes, sky/weather, procedural vehicle geometry, lighting with PCF soft shadow cascades, camera directors, and post-processing passes.

With the active AAA Visual Fidelity Overhaul Initiative (`TASK-VFX-01` through `TASK-VFX-04`), modifications to visual systems have high change frequency and divergent blast radius.

The **Refactor Decision Architect** evaluated whether and how to refactor `renderer.ts` using first-principles engineering economics, blast radius mapping, and behavioral preservation contracts.

---

## Decision Proposal

1. **Intervention Level: Level 3 (Module Restructuring)**
   - Decompose `src/game/renderer.ts` into a suite of cohesive subsystem presenters located in `src/game/rendering/`.
   - Retain `GameRenderer` in `src/game/renderer.ts` as a thin orchestration façade (<600 LOC) that implements the existing `RendererAdapter` contract.
   - **No Architectural Migration (Levels 4–6):** Do not switch rendering engines, do not redesign the simulation-to-presentation seam, and do not introduce new state abstractions.

2. **Proposed Subsystem Boundaries (`src/game/rendering/`):**
   - `EnvironmentPresenter`: Terrain height/color mesh, water shader & reflection, sky dome, stars, storm clouds, and rain sheets.
   - `PropsPresenter`: Instanced trees, rocks, felled trunks, salvage nodes, and visibility/frustum culling.
   - `InfrastructurePresenter`: Waterworks, electrical pylons, pipeline networks, community passage decks, and cargo bays.
   - `VehicleVisualPresenter`: Procedural rig blockouts, authored workbench model bridges, suspension struts/coilovers, 6-bolt wheel hubs, tire lugs, and module sockets.
   - `ParticleFXPresenter`: Ballistic furrow wheel roost, dust puffs, speed/strain-responsive diesel exhaust trails.
   - `CameraDirector`: Viewport policy, chase camera interpolation, hood camera socket mounts, top-down diorama projection, and obstruction raycasting.
   - `PostProcessingPipeline`: EffectComposer, UnrealBloomPass, FXAAShader, and CinematicColorGradeShader.

3. **Behavioral Invariants & Preservation Contract:**
   - **Simulation Purity:** The renderer must NEVER mutate `GameState` or any kernel data structures.
   - **Coordinate Contract:** Local **+Z is the front** of every rig (per ADR-0007, ADR-0034, and `physics.ts`). Geometry, headlights, and volumetric cones must face front-forward.
   - **Draw-Call & Instancing Discipline:** Instanced props (trees, rocks, salvage, furrow decals) must remain single draw calls per category regardless of count.
   - **Resource Disposal Discipline:** `disposeObjectGraph()` and WebGL context teardown must release all geometries, materials, and textures without GPU memory leaks (verified by `renderer-dispose.test.ts`).
   - **Region Normal Scope:** Terrain deformation during ploughing must use patch-scoped normal recomputation (ADR-0041).
   - **Backend Selection Policy:** WebGL default with explicit policy fallback (ADR-0028) remains operational.

---

## Preconditions & Rollout Gates

Before implementation begins:
1. Capture baseline visual golden frames via `tools/capture-visual-parity.cjs` across all 16 fleet rigs and weather states on canonical port 4173.
2. Author isolated unit tests for sub-presenters (e.g. `vehicle-visual-presenter.test.ts`, `camera-director.test.ts`).
3. Execute incremental extractions one subsystem at a time, verifying `npm run typecheck && npx vitest run` at every intermediate state.
4. Verify visual parity after complete extraction.

---

## Consequences

### Positive
- Reduces single-file blast radius from 6,779 LOC to cohesive files <800 LOC.
- Enables independent unit testing and development of foliage, vehicle mechanics, and particle systems.
- Eliminates divergent change conflicts during AAA visual upgrades.

### Negative / Costs
- Engineering effort to extract and verify 7 subsystem modules.
- Requires strict adherence to preservation invariants to prevent visual or memory regression.
