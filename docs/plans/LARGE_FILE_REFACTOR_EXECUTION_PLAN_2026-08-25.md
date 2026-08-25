# Large-File Refactor Execution Plan — 2026-08-25

- **Status:** Proposed — execution blocked on operator sign-off of
  [ADR-0054](../decisions/ADR-0054-modular-renderer-decomposition-and-behavioral-invariants.md)
  and clearance of the two preconditions in §6.
- **Date:** 2026-08-25
- **Supersedes:** nothing. Extends
  [`REFACTOR_DECISION_ARCHITECT_EVALUATION_2026-08-21.md`](../reviews/REFACTOR_DECISION_ARCHITECT_EVALUATION_2026-08-21.md)
  with post-Stage-6 live truth and turns its verdicts into an executable,
  regression-gated sequence.
- **Doctrine basis:** Operating Doctrine 8.0 (§3 proportional rigor, §5 canonical
  paths, §6 semantic salvage, §11 engineering integrity); repo AGENTS.md
  (parallel runtime ownership of `src/game/`, canonical port 4173, verification
  before completion claims).
- **Baseline evidence (Observed 2026-08-25):** `npx vitest run` → 112/112 test
  files, 732/732 tests pass; `tsc --noEmit` clean; full `npm run verify:head`
  green. Complete-slice *browser* acceptance separately RED (see §6 P1).

---

## 1. Objective

Reduce structural risk in the largest source files without losing any feature,
behavior, visual output, or performance characteristic. The intervention class
for every file in scope is **structural extraction only** (Refactor Gradient
Level ≤ 3). No engine migration, no contract redesign, no simulation/presentation
seam change.

## 2. Live-truth inventory (measured 2026-08-25)

| File | LOC | Methods | Churn (last 200 commits) | Test coverage | Verdict |
|---|---|---|---|---|---|
| `src/game/renderer.ts` | 6,786 | 89 | 30 (highest) | dispose + terrain-normals only | **Decompose (L3)** per ADR-0054 |
| `src/game/state.ts` | 4,908 | ~40 exported actions | 29 | 94 invariant tests (`state.test.ts`, 2,176 LOC) | **Defer** |
| `src/main.ts` | 4,161 | boot closure + UI helpers | 41 (highest count) | indirect via slice acceptance | **Defer / monitor** |
| `src/game/world.ts` | 1,912 | — | 13 | via world tests | Monitor |
| `src/game/rig-blockout.ts` | 1,575 | — | low | dedicated 932-LOC tests | Monitor |
| `src/game/contracts.ts` | 1,571 | — | 23 | via kernel tests | Monitor |

Churn and size are Observed from git log and wc; cohesion judgments are Inferred
from structure inspection and the 2026-08-21 evaluation.

## 3. First-principles diagnosis

Structural debt cost = P(change lands in file) × P(collateral break) × cost of
verification. For each file:

1. **renderer.ts** — 14 unrelated visual domains in one file; every AAA stage
   (1–6) appended methods here; highest divergent change; weakest unit coverage
   relative to blast radius. Cost of each further change grows; extraction pays.
2. **state.ts** — single cohesive deterministic kernel; every function operates
   on one `GameState`; 94 invariant tests pin behavior; split would create
   synchronization risk with zero gameplay payoff. Size ≠ debt.
3. **main.ts** — high churn but low algorithmic coupling (DOM binding, tone
   selection, boot wiring); refactoring before renderer stabilizes would churn
   both seams at once. Sequence after renderer.

## 4. Feature-preservation contract (zero functional loss)

Hard invariants (from ADR-0054, unchanged):

1. Renderer never mutates `GameState` (simulation purity, ADR-0007/0034).
2. Local +Z is rig front everywhere geometry/light faces are built.
3. One draw call per instanced prop category regardless of instance count.
4. `disposeObjectGraph()` releases all GPU resources (pinned by
   `renderer-dispose.test.ts`).
5. Terrain deformation uses patch-scoped normal recompute (ADR-0041, pinned by
   `renderer-terrain-normals.test.ts`).
6. WebGL default backend with policy fallback (ADR-0028) stays operational.
7. Soft invariant: pixel-level visual parity against golden frames captured
   immediately before extraction (stage3–6 sets under
   `docs/reviews/assets/visual_overhaul/` are the reference aesthetic, not the
   parity oracle; fresh same-session captures are).

Rule: **all 732 existing tests must pass unmodified at every step.** Changing a
test expectation to make an extraction fit ("test laundering") is a kill
criterion, not progress.

## 5. Execution sequence (one subsystem per PR-sized unit)

Preconditions (§6) first, then strictly in this order — cheapest, most isolated
seam first so the harness proves itself on low-risk extractions:

1. **PostProcessingPipeline** → `src/game/rendering/post-processing.ts`
   (EffectComposer, RenderPass, UnrealBloomPass, FXAAShader,
   CinematicColorGradeShader). Smallest surface; validates harness end-to-end.
2. **ParticleFXPresenter** → `particle-fx.ts` (dust, roost, diesel exhaust).
3. **PropsPresenter** → `props.ts` (instanced trees/rocks/trunks/salvage +
   culling). Draw-call invariant S3-checkable via renderer stats.
4. **EnvironmentPresenter** → `environment.ts` (terrain mesh, water, sky,
   weather sheets).
5. **CameraDirector** → `camera-director.ts`.
6. **InfrastructurePresenter** → `infrastructure.ts`.
7. **VehicleVisualPresenter** → `vehicle-visual.ts` (largest, most entangled;
   last while harness is most trusted).

Per-unit gate (every unit, no exceptions):
`npm run typecheck && npx vitest run` green → visual parity diff vs same-day
golden frames → draw-call/FPS spot check on port 4173 → commit.

Final state target: `renderer.ts` < 600 LOC façade implementing the existing
`RendererAdapter` contract (`renderer-adapter.ts` unchanged); every extracted
file < 800 LOC.

Kill criteria (abandon/revert unit): >10% FPS drop, circular dependency between
presenters, any required GameState mutation, test laundering, parity failure
that isn't a capture artifact.

## 6. Preconditions (blockers, in order)

- **P1 — Fix the known red acceptance:** complete-slice console gate fails on
  `THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated` (×2) from Stage 2
  shadow work. One-line fix in `renderer.ts`. Must be fixed (with an S2 record:
  fails today, passes after) before golden frames, or the baseline bakes in a
  console error. Requires `src/game/` ownership clearance.
- **P2 — Operator sign-off on ADR-0054** (remains Proposed until explicit
  sign-off; this plan does not promote it).
- **P3 — Golden-frame baseline:** run `node tools/capture-visual-parity.cjs`
  against canonical port 4173 for all fleet rigs × weather × camera states;
  store under `docs/reviews/assets/refactor-parity/<date>/`.
- **P4 — Sub-presenter unit-test skeletons** exist and fail-for-the-right-reason
  (S0→S1) before their extraction begins.

## 7. Regression strategy summary

| Layer | Check | Tier/Sensitivity |
|---|---|---|
| Types | `tsc --noEmit` every step | T2/S1 |
| Units | 732 vitest tests unmodified | T2/S1; any new defect fixed S2 |
| GPU lifecycle | `renderer-dispose.test.ts` | T2/S1 (mutation-testable S3) |
| Normals scope | `renderer-terrain-normals.test.ts` | T2/S1 |
| Visual | same-session golden frame diffs | T4 |
| Runtime | dev server 4173, console clean, FPS/draw-call budget | T4 |
| Full chain | `npm run verify:head` per completed subsystem | T3 |

## 8. Deferred files — revisit triggers

- `state.ts`: revisit if kernel actions exceed ~60 exported mutations, or if a
  second consumer of `GameState` appears outside `src/game/`.
- `main.ts`: begin after presenter extraction completes, splitting along the
  already-visible seams (presentation-tone selectors, pointer/shell sync,
  renderer-policy resolution, boot closure) into `src/ui/`.
- Mid-tier files (world, rig-blockout, contracts): no action; re-measure when
  any exceeds 2,500 LOC or enters top-3 churn twice consecutively.

## 9. Long-term anti-regrowth governance

Once the first presenter is extracted, new visual-feature work MUST land in
`src/game/rendering/*`, not append to the façade. Enforce informally via review
until a lint budget rule is warranted; re-audit size/churn quarterly using the
command block in §2.

## 10. Status & next action

Awaiting: P1 fix authorization (`src/game/` clearance), then ADR-0054 sign-off.
No implementation under this plan has occurred. Evidence tiers above are labels
on planned checks, not claims they have run.

---

## Addendum (2026-08-25, session 3): execution log + supersession audit

Operator cleared the `src/game/` boundary and accepted ADR-0054 this session.
Execution status per §5 sequence:

| Unit | Scope | Status | Evidence |
|---|---|---|---|
| P1 | PCFSoftShadowMap deprecation fix | DONE (`857ba28`) | S2 red->green console probe |
| 1/7 | PostProcessingPipeline -> rendering/post-processing.ts | DONE | tsc+vitest+parity noise-floor |
| 2/7 | ParticleFXPresenter -> rendering/particle-fx.ts | DONE | same |
| 3/7 | PropsPresenter -> rendering/props.ts | DONE | same |
| 4a | Terrain subsystem -> rendering/environment.ts (+ terrain-normals.ts canonical home) | this commit | below |

### Supersession audit (Doctrine §6, operator-directed)

Method: every symbol removed from renderer.ts was extracted from the
pre-refactor baseline (`857ba28`), whitespace/prettier-normalized, declared
mechanical transforms applied, and compared body-by-body against its new home.

Declared transforms (value-identical by construction):
- dependency injection: `this.world` -> `this.deps.world` / local `world`;
  `this.activeVisibilityProfileId` -> `deps.profileId()`; 
  `isOccludedByTerrain()` -> injected closure; camera position injection.
- field renames: propAnchorX/Z -> anchorX/Z; terrainCells/Origin -> cells/origin;
  tempColor -> scratchColor; terrainBuildMs -> buildMs.
- visibility: class-private methods became public presenter API.
- dust/exhaust pool construction inlined into presenter constructor.

Findings:
1. **REAL LOSS FOUND + RESTORED:** the furrow-decal aggregate-bounds call
   (`computeAndSetInstanceBounds(furrowDecals, renderedFurrows)`) was dropped
   when refreshProps moved. Without it furrow decals never regain frustum
   culling. Restored: bounds helper is now one exported function in props.ts,
   called by both presenter and renderer's refreshProps. Lesson recorded: a
   moved method's *tail lines* are as load-bearing as its head.
2. **MISTRANSCRIPTION CAUGHT PRE-COMMIT:** rebuildTerrainHeights was first
   written from memory (wrong: invented per-index sampling loop); replaced with
   verbatim original before any gate ran. Memory is not an extraction tool.

Rule reaffirmed: nothing is removed unless its full semantic content is proven
present at the canonical new home. Unused import bindings left behind by a move
are removed only after the symbol is confirmed live at the destination.
