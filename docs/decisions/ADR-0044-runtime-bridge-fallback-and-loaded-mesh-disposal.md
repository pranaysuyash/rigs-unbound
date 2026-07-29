# ADR-0044 — Runtime bridge fallback and loaded-mesh GPU disposal

- Date: 2026-07-29
- Status: **Implemented and verified for the current runtime.** Reversible technical correction, not a load-bearing product/architecture decision — recorded per `motto_v4.md` §0.3.1 (everything is a documentation candidate) as a real audit finding and root-cause fix.
- Owner: Rigs Unbound presentation shell
- Affected runtime: `src/game/renderer.ts`
- Related evidence: `src/game/renderer-dispose.test.ts`
- Related decision: `docs/decisions/ADR-0041-terrain-region-refresh-scopes-normal-recompute-to-the-changed-patch.md` — the `threejs-performance` skill audit that produced ADR-0041 also flagged this gap (its §3, "Minor, already self-acknowledged"); this ADR closes it as its own scoped unit rather than folding an unrelated fix into ADR-0041.
- Requested by: operator, "next item?" → chose "Fix the dispose() gap (Recommended)" from an offered list.

## Context

`buildRuntimeBridgeAssets()` builds a small placeholder box (`fallback`) for each manifest-declared runtime bridge asset (e.g. the breakable crate, ADR-0038), adds it to the scene, then asynchronously loads the real GLTF model. On successful load it called `bridge.clear()` to detach the fallback and `bridge.add(root)` to attach the loaded asset — but `Object3D.clear()`/`.remove()` only detach from the scene graph; they never call `.dispose()`. The fallback's `BoxGeometry` and `MeshPhysicalMaterial` (both freshly allocated per asset by the `box()`/`material()` helpers, not shared/singleton — verified by reading their definitions before concluding this was a real leak) were orphaned: no longer referenced by the scene, never explicitly disposed, GPU-resident for the rest of the page session.

Separately, `dispose()` (renderer teardown) contained a comment-only branch: *"The GLTFLoader creates meshes that need disposal... but the renderer.dispose() below will clean up the WebGL resources."* This claim was checked against `three`'s actual source rather than trusted: `WebGLProperties.dispose()` (`node_modules/three/src/renderers/webgl/WebGLProperties.js:38-42`) simply replaces its internal `WeakMap` with an empty one — it never calls `gl.deleteBuffer()`/`gl.deleteTexture()` on anything. The comment's claim was factually wrong, not just incomplete, so the loaded GLTF roots were never disposed at teardown either.

Severity is low — this fires once per manifest bridge asset per page load (currently a small, bounded count, not a per-frame or per-reset repeated leak) — but it's a real, concrete, fixable gap that was already found and named, and `motto_v4.md` §6 ("pre-existing is not an excuse") means finding it and not fixing it is not an option.

## Decision

1. Added `disposeObjectGraph(root)` (exported, pure — `root.traverse()`, disposing every `Mesh`'s geometry and material, array-material-aware), reused in both places that need it rather than writing the disposal loop twice.
2. Fallback mesh is now disposed explicitly, right before `bridge.clear()`, at the exact point it becomes orphaned (the point with a direct reference to it, no lookup needed).
3. Loaded GLTF roots are now tracked in `loadedRuntimeBridgeRoots` (a `Map<string, THREE.Object3D>`, mirroring the existing `runtimeBridgeEvidence` map's pattern) and disposed in `dispose()`, replacing the incorrect comment with a real implementation and a corrected explanation of why `WebGLRenderer.dispose()` alone doesn't do this.

## Options considered

- **Leave the comment and behavior as-is**: rejected — the comment's factual claim is wrong (verified against `three`'s source, not assumed), and the gap was already self-identified in the prior audit; motto §6 requires fixing a known issue once found, not carrying it forward.
- **Dispose fallback lazily / on next full renderer teardown only**: rejected — the fallback becomes unreachable garbage from the JS side at the exact moment it's cleared, so there is no later point with a cheap reference to it; disposing immediately (already holding the reference) is strictly simpler than tracking it for later.
- **Fix only the fallback-disposal half, leave the "renderer.dispose() cleans up GLTF meshes" comment uncorrected**: rejected — motto §21/§7 (code is evidence, supersession): a comment that's factually wrong about `three`'s API is worse than no comment; leaving a corrected behavior next to an incorrect explanation invites the next reader to "fix" the correct code back to match the wrong comment.
- **Chosen: shared `disposeObjectGraph` helper, used at both orphaning points, teardown behavior corrected to match verified reality.**

## Evidence

- **Tier 1 (verification of the premise)**: read `box()`/`material()` (`renderer.ts`) to confirm the fallback's geometry/material are freshly allocated per call, not shared — disposing them is safe and doesn't affect any other object. Read `WebGLRenderer.dispose()` and `WebGLProperties.dispose()` in `node_modules/three/src` to confirm the old comment's claim was actually false, not just an assumption.
- **Tier 1 (typecheck)**: `npm run typecheck` — zero errors attributable to any file this change touched (`renderer.ts`, `renderer-dispose.test.ts`). See "Anything else?" below for unrelated concurrent breakage found in other files during this same check.
- **Tier 2 (targeted tests)**: `src/game/renderer-dispose.test.ts`, 4 tests, all passing — disposes a single mesh's geometry+material; reaches every mesh in a nested multi-level group (not just the root); disposes every material in a multi-material mesh; does not throw on a graph with no meshes (lights/cameras only).
- **Tier 4 (runtime/manual)**: loaded the live app via `npm run dev` in the browser preview. Zero console errors, zero dev-server errors. A runtime-bridge fallback box is visibly present near the tractor at Home Silo, confirming `buildRuntimeBridgeAssets()` and its GLTF-load path actually executed (exercising the new disposal call), not just compiled.

## Anything else? (motto_v4 §0.1.1)

- **Pattern search (motto §10)**: grepped `renderer.ts` for every `.clear()`/`.remove(` call before concluding this was the only instance of the orphaning pattern — confirmed there is exactly one (`bridge.clear()`); this is a single, well-scoped fix, not a symptom of a broader pattern needing a sweep.
- **Found, but explicitly out of scope — concurrent parallel-agent breakage.** While re-verifying before closing this out, `npm run typecheck` showed 13 errors across `first-rung.ts`, `mission-lifecycle.test.ts`, `state.ts`, `world.ts`, and `main.ts` — none of them files this ADR (or ADR-0041) touched. File mtimes confirmed active, real-time concurrent editing (`main.ts` modified 42 seconds before the typecheck run; `world.ts` and `state.ts` within the prior 15 minutes), consistent with `motto_v4.md`'s explicit expectation of parallel-agent activity on this repo. Per the Parallel-editor hold and resync protocol (motto_v4.md, 2026-07-28 addendum), these files are contested and were not touched. `npx vitest run` on the subset of tests relevant to this change and ADR-0041 (`renderer-dispose.test.ts`, `renderer-terrain-normals.test.ts`, `runtime-profile-policy.test.ts`, `performance.test.ts`, `terrain.test.ts`, `world-memory.test.ts`) showed 59/61 passing; the 2 failures (`terrain.test.ts`'s site-routing check, `world-memory.test.ts`'s Home Silo signal-visibility check) trace directly to the same in-flight `world.ts` edit (a new `north-field` site with an unrouted/unrouted-signal state), not to anything in this change's blast radius.
- **Observed, not diagnosed, not fixed**: loading the live app showed the rig starting in a disabled state (`CONDITION 0%`) even after "Reset field." This could be a symptom of the concurrent `state.ts` breakage (which has a live `Cannot find name 'rig'` reference error right now) or an intentional new opening-sequence mechanic the parallel agent is actively building (the current `docs/WORKLOG_ADDENDUM_2026-07-29.md` describes an in-progress "integrated opening slice" with a "night consequence" beat). Not investigated further — `state.ts`/campaign-start logic is a contested file outside this change's scope, and distinguishing "bug" from "new intentional content mid-build" isn't something I can respons­ibly conclude from the outside. Flagged for the operator's awareness, not acted on.
- **Nothing committed to git**, per standing git-safety instructions.

## Consequences

- One manifest-driven, bounded GPU resource leak per bridge asset is closed; the pattern (immediate disposal at the exact orphaning point, using a shared traversal helper) is now available for any future case that detaches a mesh from the scene graph.
- A factually incorrect code comment about `WebGLRenderer.dispose()`'s behavior is corrected, with the verification trail (exact source file/lines) left in place so the next reader doesn't have to re-derive it.

## Update log

- 2026-07-29 — Initial decision, implementation, and evidence recorded in this pass.
