# Refactor Decision Architect Evaluation — Large Files & Structural Debt

- **Date:** 2026-08-21
- **Role:** Refactor Decision Architect
- **Status:** Strategic Assessment & Architectural Governance
- **Target Files:**
  - `src/game/renderer.ts` (6,779 lines — Primary Target)
  - `src/game/state.ts` (4,908 lines — Secondary Assessment)
  - `src/main.ts` (4,161 lines — Secondary Assessment)
- **Baseline Verification:** 112/112 test files passed, 732/732 unit tests passing cleanly; `tsc --noEmit` clean.

---

## 1. Executive Summary & Verdict

### Core Question
> **"Should we refactor larger files like `renderer.ts`, and if so, what is the smallest defensible intervention that materially improves the system while guaranteeing zero loss of functionality?"**

### Verdict: **APPROVE WITH NARROWER SCOPE & PRECONDITIONS (Level 3 Module Restructuring)**
1. **`renderer.ts` (6,779 LOC):** **APPROVE FOR DECOMPOSITION (Level 3).** High divergent change, low cohesion, and high blast radius across foliage, vehicle presentation, particle FX, lighting, and camera systems. However, this is NOT a rewrite or redesign (Levels 4-6). It is a pure structural extraction into cohesive sub-presenters behind the existing `GameRenderer` façade and `RendererAdapter` contract.
2. **`state.ts` (4,908 LOC):** **DEFER.** Despite large file size, `state.ts` has high cohesion (authoritative deterministic kernel), 94 dedicated invariant tests (`state.test.ts`), and zero divergent UI/rendering coupling. Splitting `state.ts` now introduces high state-synchronization risk with zero gameplay payoff.
3. **`main.ts` (4,161 LOC):** **DEFER / MONITOR.** High UI orchestration and DOM binding, but low algorithmic coupling. Refactoring `main.ts` should wait until the renderer decomposition is stabilized.

---

## 2. In-Depth Diagnosis: `src/game/renderer.ts` (6,779 LOC)

### A. Problem Classification
- **Divergent Change & Low Cohesion:** `renderer.ts` currently houses 14 distinct visual and spatial domains in a single monolith:
  1. Terrain mesh creation, region-scoped normal recomputation, and elevation sampling.
  2. Dynamic water geometry, wave animation, and reflection shaders.
  3. Instanced prop rendering (trees, rocks, trunks, salvage) and distance culling.
  4. Particle systems (wheel roost, dust clouds, speed-responsive diesel smoke).
  5. Infrastructure models (Sunken Flats waterworks, power pylons, animated pumping stations).
  6. World sites, cargo bays, community passage decks, and road rivalry waypoints.
  7. Ecological silhouettes and fauna movement.
  8. Sky dome, celestial bodies, stars, dynamic storm clouds, and rain sheets.
  9. Procedural vehicle blockouts, suspension coilover springs, 6-bolt lug hubs, tire treads, headlights, and volumetric light cones.
  10. Lighting, PCF soft shadow cascades (2048x2048), and directional rig tracking.
  11. Camera policies (chase, hood mount, top-down diorama, orbital).
  12. Post-processing stack (`EffectComposer`, `RenderPass`, `UnrealBloomPass`, `FXAAShader`, `CinematicColorGradeShader`).
  13. Tactical HUD projection, target lead reticles, and raycast queries.
  14. Resource cleanup and GPU object graph disposal (`disposeObjectGraph`).

### B. Root Structural Cause
As visual features were added (ADR-0007 terrain substrate, ADR-0010 accessibility, ADR-0034 rig presentation, ADR-0041 normal recompute, ADR-0053 top-down diorama, and 2026-08-21 AAA visual roadmap), they were appended directly into `GameRenderer` rather than delegated to specialized subsystem presenters.

### C. Refactor Gradient & Minimum Effective Intervention
- **Level 0 (Do Nothing):** Rejected. Divergent change is already creating risk during the AAA Visual Fidelity Roadmap (`TASK-VFX-01` through `TASK-VFX-04`).
- **Level 1 (Hygiene / Comments):** Insufficient. Does not reduce blast radius.
- **Level 2 (Local Method Restructure):** Insufficient. 6,779 lines remain in one file.
- **Level 3 (Module Restructuring — RECOMMENDED):** Extract 6 cohesive internal presenters behind `GameRenderer` in `src/game/rendering/`:
  - `EnvironmentPresenter`: Terrain, water, sky, stars, weather particles.
  - `PropsPresenter`: Instanced trees, rocks, salvage nodes, visibility culling.
  - `InfrastructurePresenter`: Waterworks, pylons, pipes, community decks, cargo bays.
  - `VehicleVisualPresenter`: Blockouts, authored model bridges, suspension, wheels, headlights, smoke/dust.
  - `CameraDirector`: Presets, chase smoothing, hood mounts, diorama matrices.
  - `PostProcessingPipeline`: Composers, bloom, FXAA, cinematic color grading.
- **Levels 4–6 (Domain / Subsystem Rewrite):** **STRICTLY REJECTED.** `GameRenderer` already correctly adheres to ADR-0007 and ADR-0034 (simulation owns physical truth; renderer only presents). Redesigning contracts or switching engines is wasteful and high-risk.

---

## 3. Behavioral Invariants & Preservation Contract

Any future refactor of `renderer.ts` MUST strictly enforce the following invariants:

### Hard Invariants (Zero Tolerance for Regression)
1. **Simulation Purity:** The renderer must NEVER mutate `GameState` or any kernel data structures.
2. **Coordinate & Forward Convention:** Local **+Z is the front** of every rig (per ADR-0007, ADR-0034, and `physics.ts`). Geometry and headlight cones must point front-forward.
3. **Draw-Call & Instancing Discipline:** Instanced props (trees, rocks, salvage, furrow decals) must remain single draw calls per category regardless of instance count.
4. **Performance & Memory Leak Discipline:** `disposeObjectGraph()` and WebGL context teardown must release all geometries, materials, and textures without GPU memory leaks (verified by `renderer-dispose.test.ts`).
5. **Region Normal Scope:** Terrain deformation during ploughing must use patch-scoped normal recomputation (ADR-0041) without reverting to full-mesh recalculation.
6. **Backend Selection Policy:** WebGL default with explicit policy fallback (ADR-0028) must remain operational.

### Soft Invariants
1. **Visual Parity:** Cinematic color grade parameters, shadow softness, bloom intensity, and volumetric cone opacity must match the golden visual captures (`stage5_rig_detail_vfx`).

---

## 4. Preconditions & Verification Architecture

Before extracting any module from `renderer.ts`, the following gates MUST be satisfied:

1. **Automated Visual Parity Harness Baseline:**
   - Execute `node tools/capture-visual-parity.cjs` on canonical port 4173 to generate baseline golden frames across all 16 fleet rigs, day/night weather states, and camera modes.
2. **Expanded Renderer Unit Tests:**
   - Create unit tests for isolated sub-presenters (e.g. `vehicle-visual-presenter.test.ts`, `camera-director.test.ts`, `props-presenter.test.ts`) prior to extraction.
3. **Full Regression Suite Green:**
   - `npm run typecheck && npx vitest run` (732/732 tests passing).
4. **Zero-Git-Mutation Gate:**
   - No Git mutations during refactoring.

---

## 5. Stop Conditions & Kill Criteria

### Stop Conditions (When Refactoring is Complete)
- `src/game/renderer.ts` becomes a thin orchestration façade (<600 LOC) delegating to `src/game/rendering/*`.
- Each sub-presenter file is <800 LOC with single, well-defined cohesion.
- All 732 existing unit tests pass without modification.
- Visual parity captures match the pre-refactor golden frames with 0 visual regression.
- Canonical dev server (port 4173) boots with zero console warnings or WebGL errors.

### Kill Criteria (When Refactoring Must Be Abandoned)
- If intermediate extraction breaks frame-rate budget (>10% drop in FPS or draw call spikes).
- If any circular dependency is introduced between rendering subsystems.
- If simulation state leakage or mutation is required to make an extraction work.
- If test laundering is required (changing test expectations rather than fixing presenter output).

---

## 6. Decision & Recommended Roadmap

1. **Step 1:** Operator sign-off on [ADR-0054](../decisions/ADR-0054-modular-renderer-decomposition-and-behavioral-invariants.md).
2. **Step 2:** Pre-refactor golden capture and sub-presenter unit test harnesses.
3. **Step 3:** Incremental extraction of sub-presenters one by one, verifying Vitest and visual parity after each extraction.
4. **Step 4:** Final audit by Semantic Preservation Reviewer and regression check.
