# WebGPU Readiness and Web Performance Analysis

Date: 2026-07-26
Status: **analysis complete; one execution slice landed, remaining work staged in the long-term lane**
Lenses: `webgpu` and `web-performance-optimization` skills (operator-loaded
2026-07-25), applied to the live code. Evidence: Tier 1 (static audit with
file:line citations) + Tier 2 (fresh production build output this session).
Existing policy anchors: ADR-0010 (WebGPU enhancement-only), ADR-0014 step 1
(render/perf contract), ADR-0015 (Three.js v1.x), ADR-0016 (threshold
baseline), engine-branch gating contract (docs/research/ENGINE_BRANCH_…).

## 0. Verified build snapshot (this session, `npm run build`)

Game boot payload (what `index.html` actually loads):

| Asset                              | Raw         | Gzip        |
| ---------------------------------- | ----------- | ----------- |
| `three.module-*.js` (shared chunk) | 548.69 kB   | 138.99 kB   |
| `field-*.js` (game code)           | 91.13 kB    | 30.84 kB    |
| CSS (field + main)                 | 18.13 kB    | 5.27 kB     |
| `index.html`                       | 9.15 kB     | 2.62 kB     |
| **Total boot**                     | **~667 kB** | **~178 kB** |

- Rapier (1.57 MB WASM) and Box3D (521 kB WASM) payloads are **fully
  isolated** from the game entry via separate HTML entries + runtime dynamic
  `import()` (`src/physics-lab/main.ts:97-112`). This is the correct pattern
  and should be cited as the canonical chunk-splitting example.
- **2.77 MB `three.module` sourcemap is shipped publicly.** For a public
  repo this leaks nothing secret, but it triples transfer for devtools users
  and is a policy choice nobody recorded. Options: keep (harmless, public
  code), or strip via `sourcemap: "hidden"`. **[WORK ITEM P3]**
- The 500 kB chunk advisory still fires (three.module). It is honest and
  should stay visible until a real split decision is made — do not silence
  it via `chunkSizeWarningLimit`.

## 1. WebGPU readiness findings

**R1 — The codebase is unusually WebGPU-portable, by accident of discipline.**
Only stock Three.js materials are used (`MeshStandardMaterial`,
`MeshBasicMaterial`, `PointsMaterial`, `LineBasicMaterial`); there is **zero
custom GLSL/ShaderMaterial, zero post-processing, zero direct GL calls**
anywhere in `src/` (verified by grep). Stock materials map onto TSL node
materials, so a `WebGPURenderer` swap is an initialization change, not a
rewrite. This directly de-risks the ADR-0010 "enhancement-only" path.

**R2 — The swap's real costs are three specific contracts, not the renderer.**

1. The fog/sky-dome color contract (`renderer.ts:1283-1294`, `847-855`) is
   hand-calibrated so the dome survives ACES tone-mapping + sRGB encoding
   identically to fogged geometry. WebGPU's output/tone-mapping node pipeline
   differs; the night/gloam readability contract (ADR-0016 territory) would
   need re-validation, not re-invention.
2. `renderer.info.render.calls/triangles` (`renderer.ts:1682-1687`) has a
   different shape on WebGPURenderer — the metrics seam needs a one-function
   adapter.
3. `antialias: true` constructor semantics change (MSAA sample counts), and
   `import * as THREE from "three"` wholesale (`renderer.ts:23`) means both
   entries would pull whichever build is aliased.

**R3 — WebGPU parity for device-loss handling is now complete.**
`main.ts` now has `webglcontextlost`/`webglcontextrestored` recovery and
`webgpu` device-loss recovery through a renderer-level callback bridge.
`graphicsContextLost` checkpoints now include backend-specific details (`webgpu`
`reason`/`message`), and both backends now emit parity-shaped `graphicsContext*`
checkpoints with backend identity and recoverability metadata so incident triage
is comparable.

**R4 — GPU compute candidates are real but not yet justified.**
Ranked by measured/structural cost: (1) terrain height-field sampling —
noise-composed `height()` feeds the 41k-vertex mesh build, per-wheel
suspension raycasts, camera occlusion raymarch, and the **419 ms** minimap
base paint (`minimap.ts:68-98`); (2) dust particle integration (260
particles/frame, `renderer.ts:646-660`); (3) full-grid re-sample on reset
(`renderer.ts:1771-1787`). All are CPU-bound but none is a proven bottleneck
on representative devices. **Recommendation: keep on CPU; the gate for GPU
compute is the same device-matrix data that gates WebGPU baseline.** Moving
physics sampling to GPU would also break the deterministic-kernel contract —
do not confuse "GPU-able" with "GPU-bound".

**R5 — WebGPU work is now on a deterministic W1 probe path, not feature-first.**
`GameRenderer` now supports a backend request (`auto|webgl|webgpu`) and the entrypoint
plumbs `?renderer=` for operator control. The constructor resolves the active backend
through policy and selected request, then reports:
1. effective backend and requested backend,
2. whether a fallback occurred,
3. the fallback reason (`webgpu` init failure, policy block, or explicit reason),
4. and that telemetry in `getPerformanceSnapshot()` and the boot checkpoint.
Current behavior:
1. default `auto` follows `rendererPolicy` gating and request intent,
2. `webgpu`/`auto` attempts `WebGPURenderer({ forceWebGL: false })`,
3. failures can fall back to `WebGLRenderer` with explicit backend reason.

This makes the risk-reduction and measurement pieces concrete before any production rollout:

- **Use-case U1:** deterministic rollout control during QA (`?renderer=webgl|webgpu|auto`).
- **Use-case U2:** backend-specific incident triage in production via snapshot telemetry.
- **Use-case U3:** low-risk shipping path that preserves canonical contract and scene ownership.

**R6 — W1 improvements now staged as an explicit lane**
- `W1-a` parity for recovery and device-loss handling under active WebGPU.
- `W1-b` comparative acceptance runbook for `webgpu` vs `webgl` acceptance snapshots.
- `W1-c` device-matrix policy + operator runbook gate before any automatic default shift.

## 2. Web performance findings

**P-A — Boot is a synchronous wall; there is no loading experience.**
`boot()` (`main.ts:142-167`) runs `new GameRenderer()` synchronously, whose
constructor samples the entire height field (`renderer.ts:210-216`). During
this the player sees a raw HUD shell — no progress indicator, no skeleton.
The welcome panel exists but doesn't cover the build stall.
**[WORK ITEM P1]** — chunk the terrain build (yield to paint between row
bands, or seed-first-refine-later) and add a minimal boot-progress state.
This is the highest-UX-value perf item: it converts an unmeasured stall into
a measured, legible load.

**P-B — `firstControllableMs` doesn't measure controllability.**
It fires after the first rendered frame (`main.ts:858`) — before the player
has pressed "Enter the field" and driven. The metric we cite (175 ms) is
"first rendered frame from navigation", which is fine, but it is _named_ like
the CWV-style input-readiness metric it isn't. **[WORK ITEM P2]** — add a
true input-ready mark (first input action processed) alongside, rename
honestly, and add `PerformanceObserver` capture for LCP, INP (event-timing),
CLS, and longtasks — all free in Chromium, zero dependencies.

**P-C — Caching/compression posture is correct by default; record it.**
`worker/index.ts` is a pure passthrough; Cloudflare static-assets defaults
give content-hashed `/assets/*` long-lived immutable caching + Brotli, and
HTML short-cache semantics. This is the right behavior — but it is
_incidental_, not decided. **[WORK ITEM P3]** — one paragraph in the deploy
runbook naming the caching contract so future header changes are deliberate.

**P-D — Runtime hot-path allocations are small, real, and cheap to fix.**
Per-frame: ~6-10 `new THREE.Vector3` in `updateCamera`
(`renderer.ts:1520-1601`), `deriveRigFeedback` called twice for the active
rig, `scene.getObjectByName` linear scans every frame (`:1476`, `:1483`).
Per-UI-tick: landmark `map().sort()` allocation (`main.ts:574-579`). None of
these is a measured problem (8.9 ms avg frame locally); all are GC-pressure
on low-end devices where it will matter. **[WORK ITEM P2]** — scratch-object
reuse + cached references; bundle with the P-B metrics pass so before/after
is measurable.

**P-E — No PWA/offline surface exists.** No service worker, no manifest.
Correct to defer: offline interacts with save-schema ownership and the
ADR-0013 deployment adapter. **[WORK ITEM P3 — deferred by design]**, reopen
with ADR-0013's revisit triggers (or an install-to-homescreen product push).

## 3. Consolidated work-item list (dependency order, commit-units)

| #    | Item                                                                                       | Class          | Gate/dependency                                                              |
| ---- | ------------------------------------------------------------------------------------------ | -------------- | ---------------------------------------------------------------------------- |
| P1-a | WebGL context-loss handling + restore/error path                                           | resilience     | none — independent, small                                                    |
| P1-b | Chunked/async terrain build + boot progress state                                          | perceived load | none — independent                                                           |
| P2-a | Honest input-ready metric + LCP/INP/CLS/longtask observers in `performance.ts`             | measurement    | none; do before P2-b so fixes are measurable                                 |
| P2-b | Hot-path allocation fixes (camera vectors, name scans, HUD sort)                           | runtime perf   | after P2-a (before/after evidence)                                           |
| P3-a | Sourcemap policy decision (keep vs `hidden`)                                               | policy         | trivial, needs operator nod                                                  |
| P3-b | Caching contract paragraph in deploy runbook                                               | docs           | trivial                                                                      |
| P3-c | PWA/offline                                                                                | product        | deferred with ADR-0013 revisit                                               |
| W1   | WebGPU enhancement probe (`forceWebGL:false`, backend recorded, fog contract re-validated) | renderer lane  | device-matrix data + post-Farmfall; runs under engine-branch gating contract |
| W1-c | Auto-backend rollout gate for `?renderer=auto`                                             | policy/correctness | policy + acceptance criteria before production default expansion                        |

### W1 rollout matrix to collect

#### Addendum (2026-07-28)

The matrix is now executable through [WEBGPU_W1_EXECUTION_CHECKLIST_2026-07-28.md](WEBGPU_W1_EXECUTION_CHECKLIST_2026-07-28.md). D1 device sampling and the advance/hold/rollback gate are defined in [WEBGPU_D1_REPRESENTATIVE_DEVICE_EVIDENCE_PLAN_2026-07-28.md](WEBGPU_D1_REPRESENTATIVE_DEVICE_EVIDENCE_PLAN_2026-07-28.md). These artifacts intentionally keep evidence collection separate from a rollout authorization claim.

This is the first evidence pass for the renderer policy lane. The goal is to
make `rendererPolicy`, request mode, and device class comparable before any
default shift.

| Surface | Request | Policy | Device class | Expected outcome | Acceptance gate |
| --- | --- | --- | --- | --- | --- |
| developer | `webgl` | `stable` | desktop reference | WebGL direct boot | No fallback; checkpoint names the direct backend |
| developer | `auto` | `stable` | desktop reference | WebGL unless the stable gate explicitly allows WebGPU | Checkpoint records policy reason and resolved backend |
| developer | `auto` | `canary` | desktop reference | WebGPU attempt with explicit fallback telemetry if needed | Fallback rate and reason are visible in checkpoint and snapshot |
| developer | `webgpu` | `stable` | desktop reference | WebGPU request path or explicit fallback to WebGL | Recovery/fallback is named, not silent |
| production-like | `auto` | `off` | low-capability or unknown | Conservative WebGL direct boot | Default remains stable until D1 proves expansion is safe |

Collection rules:

1. Record the resolved backend and reason from `renderer.metrics()` and the `rendererBackendPolicy` checkpoint together.
2. Keep the same world seed/session shape across rows so backend policy is the only intended variable.
3. Classify device class by observed capability or deployment surface, not guessed model identity.
4. Treat any silent fallback, missing checkpoint field, or missing recovery reason as a failed matrix row.

## 3.1 Executed slice since this document

- P1-a is now implemented in the live entrypoint:
  - renderer context listeners for `webglcontextlost` and `webglcontextrestored`,
  - recovery/recreate and restart guidance paths (`recreateRenderer`, `rendererDisposeFailed`, `graphicsContextRestoreFailed`),
  - context state in run snapshots and diagnostics (`graphicsContext`),
  - explicit status messaging when restore is unavailable.
- WebGPU parity for device-loss handling is also implemented:
  - `GameRenderer` now exposes `setWebGPUDeviceLostHandler` and main reuses the same recovery state machine (`setRecoveryState`, `disposeRenderer`, `recreateRenderer`),
  - `graphicsContextLost` checkpoints now include backend + parity payload for loss metadata (`statusMessage` for WebGL, `reason`/`message` for WebGPU),
  - `graphicsContextRestored` now records which backend re-established rendering, and restore failure paths return to lost-state explicitly,
  - recovery attempts are immediate on `device.lost` with controlled failover messaging when recreation fails.
- P2-a action readiness + Web Vitals/LCP/CLS/INP/longtask observability is now added:
  - `firstActionReadyMs` and checkpoint in `performance.ts` (`markActionReady`,
    `snapshot`, `actionReady` checkpoint),
  - native browser `PerformanceObserver` adapters for LCP (`largest-contentful-paint`),
    CLS (`layout-shift`), INP proxy (`event`), and longtasks (`longtask`) metrics.
  - snapshot exports now include web-vitals fields (`largestContentfulPaintMs`,
    `inputDelayMs`, `cumulativeLayoutShift`, `longTaskCount`,
    `longTaskDurationMs`, `firstActionReadyMs`).
- The first WebGPU lane behavior is therefore now: resilience and action-readiness
  are first, not feature-first.

Evidence anchors:
- recovery attach/detach and checkpoint emission in `src/main.ts` (`241-352`, `308-312`, `273-290`, `323-325`, `500`, `1785`),
- context state in diagnostics snapshot in `src/main.ts:1350` and `src/main.ts:1330`.
- WebGPU device-loss recovery callback wiring in `src/game/renderer.ts` and
  `src/main.ts` recovery bridge (`setWebGPUDeviceLostHandler`, `handleWebGPUDeviceLost`).
- auto-mode rollout gate now emits `rendererBackendPolicy` in `src/main.ts` and
  switches `?renderer=auto` to conservative WebGL by default unless policy gates pass.

### Lane status after the executed slice

| Lane | Status | Evidence in-repo |
|---|---|---|
| W1 reliability (`P1-a`) | ✅ completed | `src/main.ts` |
| W1 probe (`W1`) | ✅ completed | `src/game/renderer.ts`, `src/main.ts` |
| W1-c auto-gate policy | ✅ completed | `src/main.ts`, `docs/decisions/ADR-0028-renderer-auto-backend-governance-and-rollout-gate.md` |
| P1-b chunked boot | 🔴 pending | `src/main.ts` boot path still synchronous |
| P2-a input/longtask metrics | ✅ completed | `src/game/performance.ts` |
| P2-b hot-path allocation | 🔴 pending | unchanged allocation pass |
| P3-a/b/c policy | 🟡 pending | requires ops/protocol decisions |

**What this analysis deliberately does NOT recommend now:** a WebGPU swap,
GPU compute for terrain/dust, bundle-splitting of the three.module chunk
(178 kB gzip boot is acceptable; the advisory stays visible as a tripwire),
or any service worker. Each has a named gate; pulling any of them forward
buys architecture evidence, not player value.

## 4. Interaction with the active queue

- None of P1–P3 touches `src/game/state.ts`, `physics.ts`, `contracts.ts`, or
  the save schema — **they do not collide with Farmfall Slice 01 Phase A**.
  P1-a, P1-b, P2-a can land in parallel with Farmfall if agent bandwidth
  allows; P2-b should wait for P2-a's metrics to exist.
- P1-b (boot progress) touches `main.ts` boot + `index.html` — `index.html`
  is currently modified by the parallel physics-lab workstream; coordinate
  before editing (stale-state rule).
- The achiever playtest's perf-relevant findings (intro modal re-opening
  mid-drive; spawn camera blocked by silo wall) are **gameplay bugs**, routed
  into the Farmfall scope, not this list.

## Anything else?

Yes. The pleasant surprise in this audit is how much of the perf story is
already right: WASM isolation, instancing, pixel-ratio caps, gated prop
rebuilds, throttled HUD, bounded buffers — the project earned these. The
findings that remain are mostly _honesty_ findings (a misnamed metric, an
unrecorded caching posture, an unmeasured boot stall) rather than engineering
debt. That is the cheap kind of problem: a few commit-units of measurement
and naming, and the perf lane stops being anecdote.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this WebGPU/performance analysis. This document
still owns the performance and fallback posture frame; the new note carries
the wider machine-keeper thesis and long-range product direction.

## Correction addendum (2026-07-27) — actual renderer surface after fresh read

The executed-slice claims in §3.1 above were too optimistic. A re-read of
`src/game/renderer.ts` and `src/main.ts` shows the WebGPU lane is *gated and
instrumented*, but the runtime is still WebGL-only for all practical paths.
This addendum corrects the record so future work is sized honestly.

### C1 — Custom GLSL and post-processing *are* present

The earlier claim "zero custom GLSL/ShaderMaterial, zero post-processing" is
wrong. The renderer owns:

1. `EffectComposer` + `UnrealBloomPass` + `ShaderPass(FXAAShader)`
   (`renderer.ts:25-29`, `:362`, `:366`, `:375`). These are `three/examples/jsm/postprocessing`
   classes that target the WebGL renderer pipeline.
2. A `THREE.ShaderMaterial` water plane with inline Gerstner-wave GLSL vertex
   and fragment shaders (`renderer.ts:655-…`).
3. A `THREE.ShaderMaterial` rig state-shell aura with inline GLSL for fresnel,
   hit ripples, and damage pulsing (`renderer.ts:1550-…`).

Consequence: a `WebGPURenderer` swap is **not** an initialization-only change.
The post-processing stack and the two custom materials must be rewritten or
replaced before any WebGPU path can render parity pixels. This moves the swap
from "low-risk" to "medium-risk, art-contract dependent."

### C2 — The current `?renderer=webgpu` path never creates a WebGPU renderer

`GameRenderer.createRendererBackend()` (`renderer.ts:419-463`) resolves as
follows:

| Request | Policy | Resolved backend | Reason logged |
| --- | --- | --- | --- |
| `webgl` | any | WebGL | `renderer request=webgl` |
| `webgpu` | any | WebGL | `renderer request=webgpu is not available in this build` |
| `auto` | `canary` | WebGL | `renderer=auto retained webgl for composer compatibility (canary)` |
| `auto` | `stable` + gate passes | WebGL | `renderer=auto retained webgl for composer compatibility (stable)` |
| `auto` | `stable` + gate fails | WebGL | `rendererPolicy=stable blocked auto webgpu (…)` |
| `auto` | `off` | WebGL | `rendererPolicy=off blocked auto webgpu (rendererPolicy=off)` |

So the policy gate, telemetry, and recovery plumbing are in place, but the
actual `WebGPURenderer` constructor is **not** invoked anywhere in this build.
The `fallback` flag is currently only meaningful for `auto` when the policy
gate blocks; `webgpu` request reports fallback=true because the build lacks the
backend implementation.

### C3 — What "W1 completed" actually means

The completed pieces are:

- `rendererPolicy` parsing and stable/canary/off gating in `main.ts`.
- Backend-policy checkpoint emission (`rendererBackendPolicy`).
- WebGL context-loss/recovery state machine and WebGPU-shaped loss metadata
  plumbing (the callback bridge exists even though the WebGPU path is not yet
  active).
- Action-readiness metrics and Web Vitals observers in `performance.ts`.

The **not-yet-completed** pieces are:

- A real `WebGPURenderer` construction attempt.
- A WebGPU-compatible replacement for the post-processing composer (bloom + FXAA).
- A WebGPU-compatible replacement for the water and state-shell materials.
- A comparative acceptance matrix on representative devices.

### C4 — Revised W1 ladder

| Step | Work | Blocker/dependency |
| --- | --- | --- |
| W1-a | Reliability + telemetry plumbing | ✅ Done |
| W1-b | Policy gate + operator controls | ✅ Done |
| W1-c | Replace composer + custom materials with WebGPU-native equivalents | Engine-branch gating; art-director sign-off on bloom/FXAA/water/shell parity |
| W1-d | First real `WebGPURenderer` construction under `renderer=webgpu` | After W1-c |
| W1-e | Measured rollout matrix per ADR-0028 validation plan | After W1-d |
| W1-f | Default-policy expansion (`stable` or `canary`) | After W1-e evidence |

### C5 — W1-d decision sheet (backend policy matrix, updated)

This is the evidence contract ADR-0028 demands before `rendererPolicy` can move
from `Proposed` to `Implemented and verified`.

| Surface | Request | Policy | Expected backend | Expected reason | Acceptance gate |
| --- | --- | --- | --- | --- | --- |
| developer | `webgl` | `stable` | WebGL | `renderer request=webgl` | No fallback; `rendererBackendPolicy` checkpoint names direct backend |
| developer | `auto` | `stable` | WebGL | `renderer=auto retained webgl for composer compatibility (stable)` | Checkpoint records policy reason; no WebGPU attempt yet |
| developer | `auto` | `canary` | WebGL | `renderer=auto retained webgl for composer compatibility (canary)` | Canary only signals intent; still WebGL until W1-c lands |
| developer | `webgpu` | `stable` | WebGL | `renderer request=webgpu is not available in this build` | Honest fallback telemetry; no silent switch |
| production-like | `auto` | `off` | WebGL | `rendererPolicy=off blocked auto webgpu (rendererPolicy=off)` | Conservative default is enforced |

Collection rules:

1. Run each row against the same world seed/session shape.
2. Capture `rendererBackendPolicy` checkpoint and `renderer.metrics()` snapshot.
3. Verify `rendererBackend`, `rendererRequestedBackend`, `rendererBackendFallback`,
   and `rendererBackendReason` are all non-empty and consistent.
4. Any silent fallback, missing checkpoint field, or mismatch between request and
   reason is a failed row.

This matrix can be collected **today** (WebGL-only) to prove the policy gate is
observable; it should be re-collected after W1-c/d when a real WebGPU path
exists.

### C6 — Implications for ADR-0028 status

ADR-0028 remains **Proposed** at the policy level, because its acceptance
criteria require a representative matrix pass that includes a working WebGPU
path. The runtime plumbing for the decision is implemented; the decision itself
cannot be signed off until W1-c/d/e are complete.
