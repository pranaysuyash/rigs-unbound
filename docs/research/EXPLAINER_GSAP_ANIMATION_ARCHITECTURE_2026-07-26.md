# Technical Explainer: GSAP (GreenSock) vs Native Browser Animation Architecture

**Date:** 2026-07-26  
**Context:** _Rigs Unbound_ — 3D Browser Vehicle Simulation (`Three.js` / `Vite` / `TypeScript`)  
**Motto Alignment:** `motto_v4.md` — First-Principles, Zero High-Magic Dependencies, Long-Term Stability.

---

## 1. What is GSAP and Why Is It So Renowned?

### 1.1 What GSAP Is

**GSAP** (GreenSock Animation Platform) is an industry-standard JavaScript animation engine created over two decades ago (originally for Flash, then rewritten for the HTML5 web). It allows developers to animate CSS properties, SVG elements, Canvas objects, Three.js properties, and raw JavaScript numbers with ultra-fine control.

### 1.2 Why Developers Love GSAP (The "Good" Parts)

1. **High Performance & Sub-Pixel Precision:**
   GSAP bypasses standard DOM layout thrashing by caching inline values, batching DOM reads/writes, and using an internal ticker loop that auto-adjusts to screen refresh rates (60Hz, 120Hz, 144Hz ProMotion).
2. **Powerful Timeline Management (`gsap.timeline()`):**
   Unlike basic CSS transitions (which fire independently), GSAP allows sequencing complex multi-element animations:
   ```javascript
   const tl = gsap.timeline({ repeat: -1 });
   tl.to(car.position, { x: 10, duration: 1 })
     .to(camera.position, { y: 5, duration: 0.5 }, "-=0.2") // Overlap by 0.2s
     .to(hudElement, { opacity: 0, duration: 0.3 });
   ```
3. **Complex Easing & Physics Plugins:**
   Includes spring physics (`CustomEase`, `Elastic`), morphing (`MorphSVG`), path motion (`MotionPathPlugin`), and scroll triggers (`ScrollTrigger`).
4. **Cross-Browser Workarounds:**
   Historical browser bugs (especially around SVG transforms and Safari rendering quirks) are automatically normalized by GSAP's internal engine.

---

## 2. Why GSAP Is NOT Chosen for _Rigs Unbound_

Despite its excellence in marketing websites and interactive web presentation, GSAP is deliberately **excluded** from the core runtime of _Rigs Unbound_. Here are the first-principles reasons why:

### Reason 1: The "High-Magic" Dependency Principle (`motto_v4.md`)

_Rigs Unbound_ operates under strict doctrine:

> **Avoid high-level "magic" libraries that obscure state, couple physics to rendering timers, or introduce proprietary abstraction layers.**

GSAP owns its own internal animation ticker and mutated object state. In a 3D vehicle simulation with a **fixed-step physics kernel** (`60Hz FIXED_STEP_SECONDS`), letting a third-party animation engine mutate scene node transforms independently creates **state desynchronization** between physics authority and visual representation.

### Reason 2: Third-Party License & Governance Risk

While Webflow acquired GSAP in 2025 and made the software free to use, GSAP remains **proprietary, non-open-source software** owned by a single corporation.

- Its license prohibits reverse-engineering or building visual animation tooling that competes with Webflow.
- Relying on a third-party proprietary core for foundational game feel risks vendor lock-in and unexpected governance/licensing shifts over a 10-year project lifespan.

### Reason 3: Bundle Size & Performance Overhead

- Including GSAP + plugins adds 30KB–70KB of gzipped JavaScript.
- In a game running a 60FPS Three.js render loop (`requestAnimationFrame`), running a secondary JavaScript tick loop inside GSAP wastes CPU cycles and memory allocations (Garbage Collection spikes).

### Reason 4: Modern Web Standards Are Now Equivalent

In 2026, standard browser APIs provide 95% of GSAP's capabilities natively without external libraries:

- **CSS Custom Properties + `cubic-bezier()`:** Gives GPU-accelerated spring micro-interactions without main-thread JS overhead.
- **Web Animations API (`element.animate()`):** Provides programmatic timeline control built directly into browser engines.
- **Project-Owned Spring-Damper (`SpringDamper` in `feedback.ts`):** Math-accurate physics springs that run directly in our fixed-step loop.

---

## 3. Architecture Comparison: GSAP vs _Rigs Unbound_ Native

| Dimension                    | GSAP Approach                         | Rigs Unbound Native Approach                                    |
| ---------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| **Engine Core**              | External GSAP Ticker                  | Fixed-step `GameWorld` + single `requestAnimationFrame`         |
| **State Authority**          | GSAP mutates object values            | `state.ts` + `feedback.ts` compute read-only perceptual frames  |
| **Micro-Interactions**       | `gsap.to(".button", { scale: 1.05 })` | CSS `transition` with `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| **Vehicle Secondary Motion** | `gsap.to(car.rotation, { z: roll })`  | `SpringDamper` class in `feedback.ts`                           |
| **Hit Ripple VFX**           | `gsap.to(uniforms.uHitTime, ...)`     | Shader uniform updated via `performance.now()` in `renderer.ts` |
| **Dependencies**             | `gsap` (30-70KB proprietary)          | **Zero** animation dependencies                                 |

---

## 4. Summary & Recommendation

GSAP is a phenomenal tool for DOM web animation, marketing sites, and visual storytelling. However, for a **browser-native 3D physics simulation**, using project-owned WebGL shaders, CSS custom properties, and spring-damper math is faster, smaller, 100% open-source, and perfectly aligned with `motto_v4.md`.
