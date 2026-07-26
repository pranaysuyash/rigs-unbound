# Comprehensive Technical Evaluation: Animation, Physics, & Simulation Libraries for Rigs Unbound

**Date:** 2026-07-26  
**Context:** _Rigs Unbound_ — 3D Browser Vehicle Simulation (`Three.js` / `Vite` / `TypeScript` / `Python` Tooling)  
**Source Baseline:** 2026 Catalog of 409 JS & Python Animation, Physics, 3D, and Simulation Libraries (`Downloads/researches_lists/`)  
**Motto Alignment:** `motto_v4.md` — First-Principles, Long-Term Architecture, Decoupled Authority, Zero Breaking Changes.

---

## Executive Summary

Following our commercial license audit confirming **GSAP is 100% free for all commercial use**, this document synthesizes findings from the **409-entry 2026 Animation, Physics, and Simulation Catalog**. It answers two strategic questions:

1. **What else can GSAP help us with across the entire presentation layer?**
2. **What other JavaScript and Python libraries from the catalog can enhance our runtime and offline dev workflow?**

---

## Part 1: Deep-Dive into GSAP Capabilities for Rigs Unbound

Beyond simple property tweens, GSAP includes a suite of specialized plugins (all free under Webflow 2025+) that solve complex presentation challenges:

```
                      ┌──────────────────────────────────────────┐
                      │              GSAP ENGINE                 │
                      └────────────────────┬─────────────────────┘
                                           │
       ┌──────────────────┬────────────────┼──────────────────┬────────────────┐
       ▼                  ▼                ▼                  ▼                ▼
┌──────────────┐   ┌──────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Timeline     │   │ Flip Plugin  │   │ MorphSVG /  │   │ SplitText   │   │ Observer /  │
│ Choreography │   │ Seamless UI  │   │ DrawSVG     │   │ Field-Kit   │   │ Gesture     │
│ Cutscenes    │   │ Layout Shifts│   │ Diegetic UI │   │ Typography  │   │ Controls    │
└──────────────┘   └──────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
```

### 1.1 `gsap.timeline()` — Cutscenes & Presentation Choreography

- **Garage Vehicle Showcase:** Smoothly orbits camera around selected rig, adjusts FOV, flares State Shell rim light, and slides in module stats.
- **Activity Start Sequence:** 3-stage camera sweep from high orbital view down to hood-cam upon embarking on a delivery run.
- **Milestone Celebrations:** Choreographs victory sequence when completing a relay run or discovering an authored landmark.

### 1.2 `Flip` (First, Last, Invert, Play) — FLIP Animation Technique

- **Module & Workshop UI:** When equipping or swapping vehicle attachments (plough, winch, lug tires), HUD cards reorder seamlessly without calculating CSS absolute coordinates. GSAP's `Flip.from(state)` computes transform offsets automatically.
- **Minimap / Fullscreen Map Toggle:** Smoothly expands the field-kit minimap into a full-screen Rumor Map.

### 1.3 `MorphSVG` & `DrawSVG` — Diegetic Instrument Panel Graphics

- **Vector Instrument Gauges:** Animates SVG speedometer needles, tachometer arcs, and winch tension indicators.
- **Circuit-Board HUD Aesthetics:** `DrawSVG` animates SVG paths to simulate electrical power flowing into vehicle modules upon activation.

### 1.4 `SplitText` — Field-Kit Text Entrances

- **Mechanical Typewriter FX:** Animates incoming codex entries, landmark notifications, and operator diagnostic alerts character-by-character or word-by-word with a mechanical feel.

### 1.5 `Observer` & `ScrollTrigger` — Touch/Gesture UI Handling

- **Mobile Camera Orbit:** Intercepts swipe/pinch gestures without breaking event propagation.
- **Parallax Dashboard Overlays:** Shifts HUD elements based on pointer lock motion or gyroscope tilt.

---

## Part 2: Evaluation of JavaScript Runtime Libraries (Catalog Analysis)

From the 226 JavaScript/TypeScript entries in the 2026 Catalog, the following tools provide high first-principles value for _Rigs Unbound_:

| Library                    | Category               | License       | Evaluated Role in Rigs Unbound                                                         | Stance & Strategy                                                                    |
| -------------------------- | ---------------------- | ------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Theatre.js**             | 3D Animation Authoring | Apache 2.0    | Visual timeline editor for Three.js camera cutscenes and lighting sequences            | **Adopt for Cutscene Authoring** — Export JSON timelines to play via GSAP / Three.js |
| **PixiJS**                 | 2D GPU Engine          | MIT           | Ultra-fast 2D WebGL/WebGPU canvas for radar, minimap overlays, and dynamic HUD widgets | **Shortlist for 2D Minimap** — 60FPS vector/sprite HUD overlays                      |
| **Motion (Framer Motion)** | DOM Animation          | MIT           | Lightweight alternative for pure CSS DOM spring micro-interactions                     | **Optional Alternative** — Useful for lightweight standalone UI elements             |
| **Rive**                   | Vector State Machine   | Custom (Free) | Interactive vector state machines (animated dashboard gauges, mechanical icons)        | **Shortlist for Diegetic Gauges** — High-performance vector UI state machines        |
| **three-mesh-bvh**         | Spatial Query          | MIT           | Bounding Volume Hierarchy for ultra-fast Three.js raycasting and camera occlusion      | **Active / High Priority** — Prevents camera from clipping through terrain/trees     |
| **Popmotion**              | Physics Primitives     | MIT           | Pure functional spring, friction, and decay functions for input smoothing              | **Reference Integration** — Compliments `SpringDamper` in `feedback.ts`              |
| **Zdog**                   | 2D/3D Pseudo 3D        | MIT           | Pseudo-3D vector engine for minimalist HUD radar wireframes                            | **Niche Exploration** — Tactical radar wireframe rendering                           |

---

## Part 3: Evaluation of Python Simulation & Tooling Libraries

From the 183 Python entries in the catalog, these libraries provide powerful **offline research, validation, dev-log generation, and telemetry tooling**:

| Library               | Category                 | Evaluated Role for Rigs Unbound Workflow                                                              | Stance                                                                                        |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **PyBullet**          | 3D Rigid Body Physics    | Offline reference physics solver to generate baseline telemetry (friction curves, suspension damping) | **Approved Tooling** — Used to validate `physics.ts` and `Rapier.js` ground vehicle math      |
| **Manim (Community)** | Math/Physics Animation   | Automated programmatic video generator for technical explainers, dev logs, and documentation videos   | **Approved Tooling** — Generates animated explainers for vehicle physics & terrain algorithms |
| **Taichi Lang**       | GPU Multiphysics         | High-performance GPGPU simulation research for soil deformation, mud physics, and SPH water           | **Research Baseline** — Reference mathematical models for terrain displacement                |
| **MoviePy / imageio** | Media / Video            | Programmatic headless video compilation from simulation test runs                                     | **Approved Tooling** — Automated PR visual proof generator                                    |
| **Rerun SDK**         | Multimodal Visualization | Real-time telemetry visualizer for plotting multi-vehicle velocity, slip, and strain vectors          | **Shortlist Debugger** — Visual debugging for physics state telemetry                         |

---

## Part 4: First-Principles Architecture & Responsibility Matrix

To maintain clean architecture and avoid subsystem collisions:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RIGS UNBOUND ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. SIMULATION AUTHORITY  │ src/game/state.ts, physics.ts, Rapier.js        │
│                          │ (Fixed-step 60Hz physics kernel)                 │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 2. 3D RENDERING LAYER    │ src/game/renderer.ts, Three.js, Shaders         │
│                          │ (MeshPhysicalMaterial, State Shell, CSM Shadows) │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 3. PRESENTATION & TIMELINE│ GSAP (Timeline, Flip, SplitText) + Theatre.js   │
│                          │ (Camera cutscenes, HUD transitions, uniform VFX) │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 4. DOM HUD & GESTURES    │ CSS Custom Properties + GSAP Observer            │
│                          │ (Tactile spring buttons, touch/gyro input)       │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 5. OFFLINE DEV TOOLING   │ Python (PyBullet, Manim, Taichi, Rerun SDK)      │
│                          │ (Telemetry validation, dev-log video generation) │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cross-References

- [Master UI Synthesis](GAME_UI_MASTER_SYNTHESIS_2026-07-26.md) — Five-layer information architecture
- [GSAP Integration Evaluation](EVALUATION_GSAP_INTEGRATION_2026-07-26.md) — Technical & commercial evaluation of GSAP
- [State Shell & Visual Quality](GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md) — Three.js shaders and PBR roadmap
- [Global GSAP Policy](../../GLOBAL_GSAP_COMMERCIAL_LICENSE_AUDIT_2026-07-26.md) — Portfolio-wide licensing standard
