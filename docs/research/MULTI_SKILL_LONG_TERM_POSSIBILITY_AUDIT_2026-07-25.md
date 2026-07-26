# Multi-Skill Long-Term Possibility Audit (Rigs Unbound)

Date: 2026-07-25

Project: `/Users/pranay/Projects/Game_dev/rigs-unbound`

Owner: Pranay

Primary objective: continue an end-to-end analysis of what exists, what is possible, and what must change next — using relevant skills one at a time and recording all durable findings in-repo.

## Skill lenses used (in sequence)

1. [game-development](/Users/pranay/Projects/skills/game-development/SKILL.md) — orchestration and foundational principles.
2. [game-development/3d-games](/Users/pranay/Projects/skills/game-development/3d-games/SKILL.md)
3. [external 3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)
4. [3d-web-experience](/Users/pranay/Projects/skills/3d-web-experience/SKILL.md)
5. [web-games](/Users/pranay/Projects/skills/game-development/web-games/SKILL.md)
6. [game-design](/Users/pranay/Projects/skills/game-development/game-design/SKILL.md)
7. [game-audio](/Users/pranay/Projects/skills/game-development/game-audio/SKILL.md)
8. [threejs-fundamentals](/Users/pranay/Projects/skills/3d-web/threejs-fundamentals/SKILL.md)
9. [threejs-shaders](/Users/pranay/Projects/skills/3d-web/threejs-shaders/SKILL.md)
10. [hig-foundations](/Users/pranay/Projects/skills/hig-foundations/SKILL.md)

## 1) What is already implemented (authoritative evidence)

### Engine / architecture

- Runtime kernel is custom and deterministic (fixed-step policy) with explicit browser hooks in `src/game/state.ts` and `src/main.ts`.
- Runtime/renderer split is in place: gameplay/world semantics and draw are separated (`src/game/gameworld.ts`, `src/game/state.ts`, `src/game/renderer.ts`).
- Data-driven content and capability model are present (`src/game/contracts.ts`, `src/game/world.ts`).
- World behavior is procedural + authored anchors (`src/game/terrain.ts`, `src/game/world.ts`).
- Save/version path exists and includes migration (`src/game/storage.ts`, `src/game/state.ts`).

### Input, camera, and controls

- Multi-device inputs are abstracted as actions and mapped for keyboard/gamepad (`src/game/input.ts`, `src/game/state.ts`).
- Multiple camera policies exist in renderer and are selectable (`src/game/renderer.ts`, `src/main.ts`).
- Activity switching supports persisted mission/rig-state continuity (`src/game/contracts.ts`, `src/game/state.ts`).

### Rendering and production surface

- Three.js is the explicit dependency and chosen runtime (`package.json`, `src/game/renderer.ts`, `vite.config.ts`).
- Public acceptance/test hooks already exist for observability and CI-like checks (`src/main.ts`, browser acceptance script in `tools/rig-lab-browser-acceptance.cjs`, test scripts in `package.json`).

### Audio and UX direction

- Procedural/game-state-driven audio exists in `src/game/audio.ts` and is wired through state transitions (`src/game/state.ts`).
- Design documentation already captures visual and direction commitments (`DESIGN.md`, `docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md`).

## 2) What the skills say vs what the repo has today

### Rendering pipeline quality (3d-games + threejs fundamentals)

- **Skill check:** frustum culling, occlusion culling, LOD, batching.
- **Repo status:** partial; basic render path and instancing exist but no explicit LOD tiering and no documented occlusion culling policy.
- **Interpretation:** foundation is strong for a first playable, but missing a formalized visibility budget and culling contract.

### Shader path (threejs-shaders)

- **Skill check:** custom effects for readability/performance and identity.
- **Repo status:** renderer is material/mesh driven; no custom shader system currently staged.
- **Interpretation:** currently at baseline; shader layer should be deferred until product-facing effects (mud, slope cues, danger fields, weather transitions) need guaranteed visuals across devices.

### Physics approach (3d-games + game-design)

- **Skill check:** simple colliders + layer filtering + deterministic control for first-pass.
- **Repo status:** reduced-DOF, capability-aware contact model exists in `src/game/physics.ts`; obstacle logic in `src/game/collision.ts`.
- **Interpretation:** aligned with current stage. Next risk is not “more realistic collisions” but **clarity on what each locomotion profile is allowed to do** and deterministic failure handling.

### Web platform strategy (web-games + 3d-web-experience)

- **Skill check:** WebGPU where possible, hard fallback to WebGL, asset budgets.
- **Repo status:** WebGPU-specific feature path is not yet explicit in engine entry; public dependency stack is a lean Three.js runtime.
- **Interpretation:** safe baseline remains WebGL-first; WebGPU can be introduced as enhancement after representative device matrix data.

### Accessibility / first-principles product UX (hig-foundations)

- **Skill check:** motion/contrast/label/feedback-first systems, platform-aware accommodation.
- **Repo status:** core game loop and control mapping are good, but product-facing accessibility controls and reduced-motion alternatives are not yet first-class documented in UI state.
- **Interpretation:** this is a high-value “now” item because it compounds quality and lowers rework risk before public smoke tests.

## 3) What is possible now (practical roadmap)

### Immediate, low-friction, high leverage

1. **Create a Rendering + Performance Policy doc** with explicit thresholds:
   - camera visibility budgets,
   - draw-call ceiling,
   - frustum/occlusion policy,
   - tiered fallback quality sets.
2. **Define a shader-first effects map** for only 2–3 product-significant effects (terrain transition, contact feedback, weather/darkness transitions).
3. **Add accessibility contracts**:
   - reduced motion mode,
   - contrast-safe palette checks,
   - keyboard/gamepad action-name announcements where feasible.
4. **Formalize collision and locomotion compatibility matrix** from current profiles into a testable manifest.

### Medium scope (next milestone)

1. **Add terrain-camera coupling as explicit contract tests** (surveyed cells, line-of-sight, visibility transitions) to remove ambiguity between physics/camera/world.
2. **Introduce render-level quality profile switching** by device capability and viewport class.
3. **Add deterministic generator/loader profiling** (probe times, memory, startup and first-frame budgets) into a stable artifact under `docs/research`.

### Strategic stretch (before expanding feature surface)

1. **Add one intentionally different locomotion family** via existing capability adapter contract instead of inventing a second engine.
2. **Split visuals into an explicit content manifest** (materials, color profiles, time-of-day presets) with validation that renderer consumes only validated references.
3. **Add multiplayer-ready telemetry envelope** only as “intent/event log,” not authority, until backend authority is accepted.

## 4) What is not yet safe to do in this phase

- Full custom engine migration to another Web 3D stack: no production benefit yet without evidence from existing probe baseline and migration risk.
- Blind WebGPU-only posture: WebGPU is enhancement only; fallback and feature detection are mandatory by current standards.
- Open social features (trading/chat/UGC) without policy, operator surfaces, and abuse model.
- AI-driven world generation directly into writeable world state without schema validation and replayability gates.

## 5) Proposed docs-to-be-next (not code changes now)

1. `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md` now exists as the first public smoke test gate for renderer, camera, and accessibility behavior.
2. `docs/decisions/ADR-0009-render-contract-and-fallback-policy.md` remains a proposed long-form ADR if the contract thresholds need policy codification.
3. `docs/plans/PLAN_RENDER_PERFORMANCE_ACCESSIBILITY_2026-07-25.md` remains the gated implementation order if implementation work begins.

These names are proposed; create only after you confirm doc priority.

## 6) Anything else?

Yes. The core technical stack is coherent, but the highest unclosed gap is not another engine or shader addition — it is **evidence discipline on the visible contract**:

- we have many experiments,
- we have implementation,
- we still need contract-level quality gates so every future feature is accepted against existing architecture rather than a separate style or stack.

Next decision required from you:

1. the renderer/performance/accessibility contract bundle is now documented as the immediate documentation-and-validation track,
2. the next branch point remains whether to prioritize a second locomotion family or a renderer hardening lane first.
