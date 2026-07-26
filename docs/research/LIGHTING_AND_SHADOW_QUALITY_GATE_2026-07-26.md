# Lighting and Shadow Quality Gate

**Date:** 2026-07-26  
**Status:** Current posture documented; advanced shadow maps remain gated  
**Evidence tier:** Tier 1 - static source and documentation inspection. No test, build, browser, or target-device command was run in this pass.

## Decision

Blob shadows remain the only active shadow representation until an explicit renderer-quality proof demonstrates that a shadow-map tier is visually valuable and remains within its measured browser budget.

This is not a rejection of richer lighting. It preserves a correct sequence: establish the current inexpensive baseline, define an owner and fallback, then introduce a narrow measured tier rather than enabling global shadows as an unbounded visual upgrade.

## Current implementation

`src/game/renderer.ts` currently owns the lighting posture:

| Concern | Current behavior | Rationale |
| --- | --- | --- |
| Key lighting | One warm directional sun plus a cool/earthy hemisphere fill | Keeps terrain and rig forms legible without per-object lights. |
| Output | sRGB output and ACES filmic tone mapping | Provides the current stable color-management baseline. |
| Device cost | Pixel ratio capped at `1.75` | Prevents unbounded high-DPR fill-rate cost. |
| Shadows | `renderer.shadowMap.enabled = false`; runtime GLTF meshes are explicitly non-casting/non-receiving | Avoids shadow-map allocation and lifecycle cost. |
| Grounding | Blob-shadow representation | Retains contact/readability at a predictable cost. |

The renderer comment records the immediate reason: a Chrome lifecycle run observed a shadow-map allocation warning, and the blob posture is cheaper for first frame and low-power devices.

## Contract boundaries

| Owner | Owns | Must not own |
| --- | --- | --- |
| `GameRenderer` | Light construction, shadow representation, renderer-side resource use | Simulation truth, gameplay collision, direct UI preferences. |
| Runtime profile policy | Evidence-based request for a supported renderer quality tier | Hardware guesses from the user agent or hidden automatic visual changes. |
| Performance monitor | Frame-time/startup/renderer-resource evidence | VRAM claims it cannot directly observe. |
| Visual direction | Required readability and style outcomes | Permission to bypass a measured profile gate. |

The player-facing product surface must not expose internal threshold controls. If a future quality selector is introduced, it must present understandable choices and preserve the low-cost blob fallback.

## Advanced-shadow admission gate

Before enabling a shadow-map tier, implement and capture all of the following as one vertical proof:

1. A named renderer quality capability such as `blob` or `sun-shadow-1024`; no anonymous boolean switch.
2. A deterministic fallback from the proposed tier to blobs when the existing runtime-profile policy reports fallback.
3. Side-by-side visual evidence showing the gameplay value: rig grounding, terrain readability, camera obstruction clarity, and no unacceptable shadow swimming/popping.
4. Target-browser evidence for baseline and shadow tier: first-controllable time, average frame time, p95 frame time, draw calls, geometries, textures, and device/DPR context.
5. Explicit shadow-resource bounds: map resolution, light count, caster set, receiver set, frustum bounds, and update policy.
6. A recovery case proving that a fallback removes the shadow allocation without changing authoritative simulation state or input behavior.

Only after this proof may the project consider the narrow initial tier: one directional sun map with a tightly bounded active area. Cascaded shadow maps, dynamic shadow-casting headlights, screen-space contact shadows, SSAO, and a general post-processing graph are later independent decisions, not prerequisites or bundled upgrades.

## Non-goals

- Do not enable `PCFSoftShadowMap` globally now.
- Do not introduce a device-class or user-agent detector.
- Do not make gameplay, physics, collision, or camera authority depend on visual shadow state.
- Do not claim texture/geometry counts as VRAM totals; the current monitor exposes renderer allocation counts, not GPU memory bytes.

## Relationship to existing visual research

`GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md` remains the visual opportunity map. Its directional-shadow and quality-tier sections are proposals. This document is the current implementation gate that determines when those proposals can become active runtime behavior.

## Primary implementation references

- [Three.js `WebGLRenderer`](https://threejs.org/docs/pages/WebGLRenderer.html): renderer `info` is intended for debugging/monitoring, `shadowMap` is the renderer shadow-management surface, and drawing-buffer size is a function of logical size and pixel ratio.
- [Three.js `DirectionalLight`](https://threejs.org/docs/pages/DirectionalLight.html): the future single-sun tier must remain the explicit owner of any directional shadow configuration.
- [Three.js `LightShadow`](https://threejs.org/docs/pages/LightShadow.html): map size, camera bounds, bias, and update policy are concrete resources/parameters that require bounds and visual review.

These references explain available renderer mechanisms. They do not prove this project should enable them; the project-specific admission gate above remains controlling.

## Closure trigger

Revisit this gate only after a renderer proof is prepared against the current blob baseline on representative browser/device surfaces. Until then, preserving the existing visual baseline is the first-principles path: it is legible, bounded, deterministic, and operationally explainable.

## Anything else?

Yes: future lighting assets, post-processing, and weather must use the same profile/fallback evidence rather than treating shadows as the only renderer cost. No additional active lighting subsystem was found in this pass.
