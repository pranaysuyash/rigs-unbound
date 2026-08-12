# Top-Down Game Mode Exploration — Rigs Unbound

- Date: 2026-08-09 (Updated: 2026-08-12)
- Status: **Design Synthesis — Unconstrained Multi-Engine & Multi-Mode Architecture**
- Alignment: [Game Design Spine](../design/GAME_DESIGN_SPINE.md) (§1 Canonical Vision, §2 Pillars, §4 Story Architecture, §10 First Playable) & [Context Switching Mechanic](CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- Primary Principle: **Unconstrained Gameplay & Multi-Engine Flexibility**. Self-imposed architectural constraints must never restrict gameplay quality, visual excellence, or player agency. If a 2D engine (such as Phaser or PixiJS) or a hybrid 2D/3D pipeline enhances top-down gameplay, micro-RTS tactical maps, or retro arcade modes, the engine adapter architecture will support it directly.

---

## 1. Vision Alignment & Executive Summary

In **Rigs Unbound**, vehicles are persistent playable characters. The core thesis—*"Same vehicle, many games"*—promises that the exact same machine (whether Torque the tractor, Spark the buggy, or Drift the skimmer) can participate in farming, racing, heavy hauling, zombie night defense, stealth reconnaissance, or tactical tower defense without losing its identity, upgrades, or scars.

Following **Operator Direction (2026-08-12)**:
1. **No Artificial Engine Restrictions**: We do not lock top-down mode into Three.js alone if 2D engines (PixiJS, Phaser) or hybrid 2D+3D overlays deliver better gameplay, sharper 2D graphics, micro-RTS UI readability, or retro arcade feels.
2. **Full Multi-Mode & Control Suite ("Do All")**: Support all four top-down mode archetypes, all three control paradigms, and configurable camera angles/projections.
3. **Headless Kernel Decoupling**: Because our gameplay simulation (`src/game/state.ts`) is headless and renderer-independent (ADR-0001), any renderer—Three.js 3D, PixiJS 2D, or Phaser Arcade—can subscribe to the vehicle's state (`x`, `z`, `yaw`, speed, capabilities) without breaking save schema or vehicle identity.

---

## 2. Four Top-Down Game Mode Archetypes & Renderer Options

### Archetype A: Zombie / Horde Night Defense (Twin-Stick & Barricade Mode)
- **Place/Time**: Night fall at Home Farm or Rustline Station.
- **Core Loop**: Hostile automated drones or nocturnal horde threats attack community silos or relay power nodes. The player drives their rig in top-down view to defend the perimeter.
- **Renderer Choice**: **Hybrid 3D + PixiJS/Canvas Overlay** (3D Three.js lighting & shadow mesh for terrain/rig, with PixiJS handling ultra-crisp 2D threat radar rings, dynamic searchlight vision cones, and barricade health meters).

### Archetype B: Tactical Logistics & Heavy Construction (Micro-RTS Mode)
- **Place/Time**: Sunken Flats bridge restoration, Disaster Zone recovery, or Quarry Runout.
- **Core Loop**: Precision terraforming, bridge laying, and cargo routing.
- **Renderer Choice**: **Near-Orthographic 3D or PixiJS Tactical Map**. Grid-aligned terrain contours, cargo weight distribution vectors, and soil bearing heatmaps rendered with high-performance 2D canvas/WebGL sprite batching.

### Archetype C: Nocturnal Stealth & Reconnaissance (Fog of War Mode)
- **Place/Time**: Weather storms, restricted industrial ruins, or hostile patrol sectors.
- **Core Loop**: Infiltrate or survey unknown terrain without alerting security.
- **Renderer Choice**: **2D/3D Hybrid Fog-of-War**. PixiJS pixel-shrouded fog-of-war layer overlaid on Three.js 3D dark world, reacting to noise pulse rings and signal frequency probes.

### Archetype D: Retro-Arcade Circuit & Demolition Drift
- **Place/Time**: Bounded arena tracks, salt flats, or dashboard arcade minigames.
- **Core Loop**: High-speed competitive time-trials, checkpoint clearing, or obstacle evasion (micro-machines / GTA 1 style).
- **Renderer Choice**: **Phaser / PixiJS 2D Retro Engine**. Option for pure 2D sprite top-down racing mode with retro pixel-art tiles and 2D particle drift trails.

---

## 3. Flexible Control Paradigm Suite

`InputController` exposes three player-selectable control paradigms:

| Control Mode | Mechanics | Pros | Cons | Default Activity |
| --- | --- | --- | --- | --- |
| **1. Vehicle-Centric (Tank / Heading-Relative)** | `W` accelerates forward along chassis vector; `A/D` rotates chassis. | Preserves authentic vehicle physics, momentum, and turn radius. | Can be disorienting when vehicle faces down/towards camera. | Tactical Construction, Heavy Hauling |
| **2. Screen-Relative (World-Directional Arcade)** | `W` drives UP on screen, `S` drives DOWN, `A` LEFT, `D` RIGHT. Vehicle automatically turns to face movement direction. | Instantly intuitive for arcade & quick reactions. | Can cause erratic chassis spin if turning tightly with heavy momentum. | Arcade Circuit, Evasion |
| **3. Twin-Stick (Drive + Aim Vector)** | `WASD` / Left-Stick handles vehicle translation (screen or vehicle-centric); Mouse / Right-Stick rotates turret / searchlight / winch independently. | High action density; complete freedom of movement and aiming. | Requires dual-input scheme (mouse+keyboard or dual analog gamepad). | Horde Night Defense, Stealth Recon |

---

## 4. Multi-Engine & Multi-Camera Architecture

The gameplay kernel passes vehicle state to renderer adapters via a unified contract:

```text
       [ Headless Gameplay Kernel (src/game/state.ts) ]
                          |
      +-------------------+-------------------+
      |                   |                   |
[ Three.js 3D Adapter ] [ PixiJS 2D Overlay ] [ Phaser 2D Engine ]
  (75° Diorama / 90°    (Fog of War, Radar,    (Retro Arcade Mode)
   Perspective View)     Micro-RTS Overlay)
```

- **Three.js 3D Adapter**: 75° Diorama Near-Orthographic, 90° Overhead, or Heading-Tracking.
- **PixiJS 2D Overlay**: Ultra-sharp vector UI, tactical grid lines, vision cones, and fog-of-war pixel masks overlaid on 3D viewport.
- **Phaser 2D Engine Adapter**: Dedicated 2D sprite engine for retro arcade levels, minigames, or classic top-down drift racing.

---

## 5. Architectural Integration & Seams

1. **Renderer Adapter Interface (`src/game/renderer-contract.ts`)**:
   - Define agnostic rendering contract (`renderFrame(kernelState, dt)`).
   - Allows Three.js, PixiJS, or Phaser adapters to consume state seamlessly.

2. **Activity Binding System (`src/game/activities.ts`)**:
   - Register top-down activities and select preferred renderer/overlay combination.

3. **Input Controller (`src/game/input.ts`)**:
   - Support Tank, Arcade, and Twin-Stick control schemes with in-game hotkeys.

---

## 6. Verification & Acceptance Criteria

- **Kernel Independence**: Verify `src/game/state.ts` runs 100% deterministically without requiring any DOM/WebGL context.
- **Renderer Adapter Tests**: Verify Three.js, PixiJS overlay, and 2D adapters consume `KernelState` correctly.
- **Browser Acceptance**: Verify smooth switching between control modes and camera/engine views on port `4173`.
