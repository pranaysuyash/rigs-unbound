# WebGPU Readiness and Web Performance Analysis

Date: 2026-07-25
Status: **analysis complete; work items proposed, none started**
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

**R3 — No GPU-context resilience exists at all, on either backend.**
No `webglcontextlost` listener, no restore path, no WebGPU `device.lost`
handling, no feature detection — a lost context is a frozen canvas until
reload, with only the boot-time `try/catch` error panel (`main.ts:895-905`)
as mitigation. This is a **WebGL gap first** and the cheapest high-value
resilience work available. **[WORK ITEM P1]**

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

**R5 — WebGPU work stays queued, by policy and by evidence.**
ADR-0010's enhancement-only posture stands. When opened, the shape is:
`WebGPURenderer({ forceWebGL: false })` + `await renderer.init()` +
`backend.isWebGPUBackend` recorded in the performance snapshot, identical
scene/contracts, under the engine-branch gating contract. Not before
Farmfall; not before device-matrix data.

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
