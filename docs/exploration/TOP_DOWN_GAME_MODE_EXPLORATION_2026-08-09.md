# Top-Down Game Mode Exploration — Rigs Unbound

- Date: 2026-08-09
- Status: **Design Exploration & Synthesis**
- Alignment: [Game Design Spine](../design/GAME_DESIGN_SPINE.md) (§1 Canonical Vision, §2 Pillars, §4 Story Architecture, §10 First Playable) & [Context Switching Mechanic](CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- Primary Question: How do we transform top-down perspective from a simple camera view into an immersive, distinct game mode while preserving persistent rig identity and vehicle control feel?

---

## 1. Vision Alignment & Executive Summary

In **Rigs Unbound**, vehicles are persistent playable characters. The core thesis—*"Same vehicle, many games"*—promises that the exact same machine (whether Torque the tractor, Spark the buggy, or Drift the skimmer) can participate in farming, racing, heavy hauling, zombie night defense, stealth reconnaissance, or tactical tower defense without losing its identity, upgrades, or scars.

Currently, top-down view exists in the project as a **camera policy** (ADR-0008: `selectCamera('top-down')`). It provides an exact overhead 90° view of the terrain and vehicle.

However, a **Top-Down Game Mode** is not just an elevated camera angle. It is an **Activity & Context Mode** that reinterprets:
1. **Control Scheme & Steering**: Resolving tank-drive vs screen-relative vs twin-stick aiming.
2. **HUD & Perception Overlay**: Fog of war, searchlight/beacon light cones, tactical threat radars, grid-aligned terrain contouring.
3. **Vehicle Verbs & Capabilities**: Reinterpreting `plough` as barricade construction / dredging, `haul` as supply-line feeder, `survey` as tactical threat detection.
4. **Gameplay Loop & Mode Archetypes**: Defense, Logistics, Stealth, and Retro-Arcade.

---

## 2. Four Top-Down Game Mode Archetypes

### Archetype A: Zombie / Horde Night Defense (Twin-Stick & Barricade Mode)
- **Place/Time**: Night fall at Home Farm or Rustline Station.
- **Core Loop**: Hostile automated drones or nocturnal horde threats attack community silos or relay power nodes. The player drives their rig in top-down view to defend the perimeter.
- **Mechanics**:
  - Use front attachments (`plough`, `blade`) to physically push heavy barricades and debris into defensive lanes.
  - Mount/activate searchlights and defensive turrets or sonic emitters.
  - Left stick / `WASD` drives the vehicle; Right stick / Mouse aims searchlights, turrets, or winches (Twin-Stick mode).
- **HUD**: Dynamic lighting cone, threat radar sweep, barricade integrity health bars, wave pressure meter.

### Archetype B: Tactical Logistics & Heavy Construction (Micro-RTS Mode)
- **Place/Time**: Sunken Flats bridge restoration, Disaster Zone recovery, or Quarry Runout.
- **Core Loop**: Precision terraforming, bridge laying, and cargo routing. The player manages multi-stage heavy hauling and ground preparation.
- **Mechanics**:
  - Precision grid-aligned movement or pointer-based destination targeting ("click to path" or precision joystick creep).
  - Overhead terrain elevation contours reveal mud, water depth, and gradient risks.
  - Crane/winch attachment controls with overhead vector lines showing tension and cargo physics.
- **HUD**: Grid overlay, soil bearing capacity heatmap, cargo weight distribution, cable tension gauge.

### Archetype C: Nocturnal Stealth & Reconnaissance (Fog of War Mode)
- **Place/Time**: Weather storms, restricted industrial ruins, or hostile patrol sectors.
- **Core Loop**: Infiltrate or survey unknown terrain without alerting automated security or nocturnal fauna.
- **Mechanics**:
  - Fog-of-war hides unvisited or unlit areas of the map.
  - Vehicle noise (engine RPM) and light emissions determine visibility/detection range.
  - Use `seismic-probe` and `radio-scanner` to detect hidden scrap caches or enemy patrol paths.
- **HUD**: Noise pulse indicator ring around vehicle, threat vision cones, signal frequency scanner.

### Archetype D: Retro-Arcade Circuit & Demolition Drift
- **Place/Time**: Bounded arena tracks, salt flats (e.g. Grove Run).
- **Core Loop**: High-speed competitive time-trials, checkpoint clearing, or obstacle evasion reminiscent of classic top-down racers (e.g. Micro Machines, GTA 1/2).
- **Mechanics**:
  - Screen-relative / Directional steering option for instant arcade feel.
  - Speed-based visual trail, oil slick / landmine deployment, jump pad alignment.
- **HUD**: Lap timing, drift meters, speed arc, minimap tracking.

---

## 3. Control & Steering Paradigms for Top-Down Perspective

A major challenge in top-down games is steering feel. Standard 3D vehicle tank controls (`W` = accelerate forward along vehicle nose, `A/D` = turn chassis) can feel counterintuitive when viewed overhead if the vehicle is driving towards the screen bottom.

We explore **3 control paradigms**:

| Control Mode | Mechanics | Pros | Cons | Ideal For |
| --- | --- | --- | --- | --- |
| **1. Vehicle-Centric (Tank/Heading-Relative)** | `W` accelerates forward along chassis vector; `A/D` rotates chassis. | Preserves authentic vehicle physics, momentum, and turn radius. | Can be disorienting when vehicle faces down/towards camera. | Tactical Construction, Heavy Hauling |
| **2. Screen-Relative (World-Directional)** | `W` drives UP on screen, `S` drives DOWN, `A` LEFT, `D` RIGHT. Vehicle automatically turns to face movement direction. | Instantly intuitive for arcade & quick reactions. | Can cause erratic chassis spin if turning tightly with heavy momentum. | Arcade Circuit, Evasion |
| **3. Twin-Stick (Drive + Aim Vector)** | `WASD` / Left-Stick handles vehicle translation (screen or vehicle-centric); Mouse / Right-Stick rotates turret / searchlight / winch independently. | High action density; complete freedom of movement and aiming. | Requires dual-input scheme (mouse+keyboard or dual analog gamepad). | Horde Night Defense, Stealth Recon |

### Proposed Control Solution: Context-Adaptive Steering Options
Allow the player to toggle between **Heading-Relative (Vehicle)** and **Screen-Relative (Arcade)** steering in Top-Down mode, while enabling **Twin-Stick Aiming** whenever a directional tool (light, winch, turret) is active.

---

## 4. Camera & Presentation Specification

- **Camera Type**: High-angle 3D Perspective (75° pitch angle) or Orthographic projection.
  - *Recommendation*: **Near-Orthographic 3D Perspective (75° - 80° tilt)**. Pure 90° top-down hides vehicle height, 3D depth, and wheels. A slight 75°-80° angle preserves diorama aesthetic, wheel suspension articulation, and vehicle silhouette legibility while maintaining top-down tactical reading.
- **Heading Orientation**:
  - Option A: **North-Up (Fixed)** — Camera stays locked to North. Best for map literacy and spatial orientation.
  - Option B: **Heading-Up (Track Rig)** — Camera rotates so vehicle is always facing UP. Best for driving stability, but can cause screen rotation dizziness.
  - *Recommendation*: **North-Up (Fixed) by default**, with smooth target lead offset in the direction of vehicle velocity.
- **Target Lead / Predictive Offset**: Camera smoothly offsets ahead of vehicle velocity vector so the player can see upcoming obstacles/threats.

---

## 5. Architectural Seams & Integration Points

1. **Activity Binding System (`src/game/activities.ts`)**:
   - Define new top-down activity definitions (e.g. `TOP_DOWN_DEFENSE`, `TOP_DOWN_TACTICAL`).
   - Bind input mode, camera policy bias, verb reinterpretation, and HUD overlay.

2. **Renderer & Camera (`src/game/renderer.ts`, `src/game/camera.ts`)**:
   - Extend camera policy solver to support dynamic target leading, orthographic/perspective toggle, and tactical grid rendering.

3. **HUD & Perception Chain (`src/game/hud.ts`, `src/game/perception.ts`)**:
   - Render tactical threat rings, headlight cones, fog-of-war masks, and grid coordinates.

4. **Engine Continuity**:
   - Retain Three.js renderer per ADR-0001 (no second 2D engine like Phaser/PixiJS).

---

## 6. Verification & Acceptance Criteria

- **Unit/Kernel Tests**: Validate state transitions between default mode and top-down game mode.
- **Browser Acceptance**: Verify camera posture switch, input mode toggle, HUD overlay rendering, and zero console errors on dev server (`port 4173`).
- **Observability**: `window.selectCamera('top-down')` and activity state exposed via `window.render_game_to_text()`.

---

## 7. Open Questions for Discussion

1. **Steering Preference**: Should top-down mode default to Screen-Relative driving (Arcade style) or Heading-Relative driving (Vehicle/Tank style)?
2. **Camera Tilt Angle**: Do we prefer exact 90° overhead or 75° near-orthographic diorama view?
3. **Primary Initial Archetype**: Which of the 4 archetypes (Horde Night Defense, Tactical Construction, Stealth Recon, or Retro Arcade) should be built as the first playable proof slice?
