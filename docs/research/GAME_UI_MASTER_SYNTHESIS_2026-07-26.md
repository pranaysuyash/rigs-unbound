# Game UI/UX Master Synthesis — Rigs Unbound

**Date:** 2026-07-26
**Research method:** 5 parallel deep-research agents + direct web research, 5 individual research documents, ~87KB total research output

---

## Research Index

| #   | Document                                                                                                                   | Focus                                                                                                         | Lines |
| --- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----- |
| 1   | [GAME_UI_PARADIGMS_DIEGETIC_SPATIAL_META](GAME_UI_PARADIGMS_DIEGETIC_SPATIAL_META_2026-07-26.md)                           | Diegetic, Spatial, Meta, and Non-HUD UI paradigms                                                             | 154   |
| 2   | [GAME_CONTROLS_NOVEL_INPUT_METHODS](GAME_CONTROLS_NOVEL_INPUT_METHODS_2026-07-26.md)                                       | Novel controls, browser APIs, accessibility-first input                                                       | 196   |
| 3   | [GAME_UI_ADAPTIVE_GENERATIVE_SYSTEMS](GAME_UI_ADAPTIVE_GENERATIVE_SYSTEMS_2026-07-26.md)                                   | State-driven, procedural, analog-feel, vehicle-as-UI                                                          | 184   |
| 4   | [GAME_UI_MICROINTERACTIONS_JUICE_FEEL](GAME_UI_MICROINTERACTIONS_JUICE_FEEL_2026-07-26.md)                                 | Game feel, juice, CSS/DOM animation, haptics, sound                                                           | 222   |
| 5   | [GAME_UI_REFERENCE_ANALYSIS](GAME_UI_REFERENCE_ANALYSIS_2026-07-26.md)                                                     | Reference game teardowns: SnowRunner, Forza, Persona 5, etc.                                                  | 181   |
| 6   | [GAME_VFX_STATE_SHELL_VISUAL_QUALITY](GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md)                                   | State Shell (hit/shield/strength), PBR, shadows, VFX, quality roadmap                                         | 260   |
| 7   | [EXPLAINER_GSAP_ANIMATION_ARCHITECTURE](EXPLAINER_GSAP_ANIMATION_ARCHITECTURE_2026-07-26.md)                               | GSAP explainer: benefits, licensing, motto alignment & native WebGL/CSS alternatives                          | 90    |
| 8   | [EVALUATION_GSAP_INTEGRATION](EVALUATION_GSAP_INTEGRATION_2026-07-26.md)                                                   | In-depth technical evaluation of GSAP: commercial license, Three.js blueprints & HUD integration              | 130   |
| 9   | [COMPREHENSIVE_ANIMATION_PHYSICS_LIBRARIES_EVALUATION](COMPREHENSIVE_ANIMATION_PHYSICS_LIBRARIES_EVALUATION_2026-07-26.md) | Evaluation of 409 JS/Python animation & physics libraries from the 2026 catalog for runtime & offline tooling | 140   |

---

## Executive Synthesis

### The Core Insight: The Rig IS the Interface

Across all five research streams, one principle emerged as the strongest fit for Rigs Unbound:

> **The vehicle's physical state, sounds, animations, and body language should be the primary information channel. The DOM HUD is a secondary, supplementary layer — a field-kit, not a dashboard replacement.**

This is not merely "diegetic UI." It's a deeper architectural commitment: the Three.js scene communicates the vehicle's story; the DOM layer provides only what the world itself cannot convey (text labels, menus, system-level controls). The vehicle's exhaust color, engine pitch, body tilt, tire marks, headlight state, attachment silhouette, and visible wear ARE the game's UI.

### The Five-Layer Information Architecture

Based on the research, Rigs Unbound should deliver information through five layers, ordered by immersion depth:

```
Layer 0: WORLD (most immersive)
  │  Terrain color/texture = traversability
  │  Lighting/atmosphere = time + danger
  │  Object silhouettes = affordances
  │  Tire tracks/furrows = player history
  │
Layer 1: VEHICLE BODY (diegetic)
  │  Visible damage, rust, smoke = condition
  │  Attachment silhouette = capabilities
  │  Engine sound pitch = speed/strain
  │  Headlights on/off = exploration mode
  │  Body lean/tilt = momentum/terrain
  │
Layer 2: SPATIAL MARKERS (semi-diegetic)
  │  Proximity glow on interactables
  │  Terrain-attached opportunity markers
  │  Directional audio cues
  │  Camera behavior (zoom-out = overview needed)
  │
Layer 3: FIELD KIT HUD (non-diegetic, themed)
  │  Condition indicator (not a health bar — a diagnostic sketch)
  │  Active capability label
  │  Compass/bearing strip
  │  Camera mode indicator
  │  Phase/time label
  │  Contextual action prompt
  │
Layer 4: SYSTEM OVERLAYS (non-diegetic, functional)
  │  Pause menu
  │  Settings/accessibility
  │  Save indicator
  │  Error surface
  │  Workshop/garage full-screen
```

### Design Principles Distilled

| Principle                                          | Source                                      | Application                                                                                                                              |
| -------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Readability over realism**                       | Dead Space analysis, Star Citizen critique  | Never sacrifice legibility for aesthetic. If the diegetic element can't be read, add a spatial or HUD fallback.                          |
| **Instant feedback, delayed response**             | Swink's Game Feel framework                 | The _rig_ may be heavy and slow to turn, but the _feedback_ (engine rev, exhaust burst, steering wheel animation) must be instantaneous. |
| **Information through modality, not density**      | Multi-modal architecture research           | Speed = engine sound + camera FOV + particle speed. Don't also put a speedometer unless the player asks for it.                          |
| **UI degradation mirrors vehicle state**           | Metro 2033, Pacific Drive                   | When the rig is damaged, the field-kit HUD should show static, flicker, or lose elements. A pristine rig = crisp HUD.                    |
| **Context-sensitive controls > mode switching**    | Zelda A-button, SnowRunner winch            | One action button that does the right thing based on proximity and capability. Don't make players memorize 12 keys.                      |
| **Accessibility is not a mode — it's a continuum** | The Last of Us Part II, Celeste Assist Mode | Steering assist, brake assist, auto-aim are always available. They reduce challenge, not dignity.                                        |
| **The camera is a UI element**                     | Rigs Unbound's 6 camera policies            | Chase = personality. Tactical = spatial reading. Hood = immersion. The camera switch IS a UI mode change.                                |

---

## Highest-Signal Novel Ideas for Rigs Unbound

### 1. The "Patchwork Dashboard" (Diegetic + State-Driven)

**Inspiration:** Metro 2033's wrist-watch, Pacific Drive's station wagon dashboard, Firewatch's paper map

A first-person/hood camera could show a cobbled-together dashboard on the rig itself: duct-taped gauges, a hand-drawn map clipped to the sun visor, a flickering CRT showing capability status. As the rig takes damage, gauges crack and flicker. As the rig is repaired and upgraded, new instruments appear. This IS the rig's character expressed through UI.

**Browser implementation:** Render as a textured plane in Three.js with dynamic canvas textures updated per-frame for gauge needles. Minimal GPU cost when using 2D canvas as texture source.

### 2. The "Rumor Map" Discovery System (Cognitive Scaffolding)

**Inspiration:** Outer Wilds' rumor map, Return of the Obra Dinn's deduction board

Instead of a quest log, give players a physical map (DOM overlay) with nodes that represent discoveries, rumors, and unknowns. Connecting nodes reveals relationships. The map IS the progress system — not XP bars, not percentage completions. "I've mapped 23 connections" is more meaningful than "67% complete."

**Why it fits:** Rigs Unbound's exploration of different regions, vehicles, and activities creates a natural web of discoveries. The rumor map replaces both the quest log and the achievement system.

### 3. Vehicle Sound as Primary Speedometer (Multi-Modal)

**Inspiration:** Racing game engine pitch + camera FOV + particle density

Instead of a numerical speed display:

- **Engine pitch** rises with speed (Web Audio API oscillator or layered samples)
- **Camera FOV** widens subtly at high speed, contracts at low speed
- **Particle density** (dust, gravel, leaves) increases with speed
- **Terrain audio** (crunch of gravel, splash of water) provides surface feedback

The player _feels_ speed through three simultaneous channels. A number is available in settings for players who want it.

### 4. Gyroscope Steering for Mobile (Browser-Native)

**Inspiration:** Real Racing 3, Splatoon gyro aiming

Mobile browser players tilt their device to steer. The `DeviceOrientationEvent` API (gamma for steering, beta for throttle/brake) with a low-pass filter for smoothing. This is the most natural control for a vehicle game on a phone — and almost no browser games do it.

**Implementation:** Require a user gesture to activate (button tap), then poll gamma/beta. Apply deadzone ±5°. Use exponential response curve for fine control near center, aggressive at extremes.

### 5. Context-Sensitive Action System (The "Smart Verb")

**Inspiration:** Zelda's A-button, SnowRunner's quick-winch, Farming Simulator tool cycle

One primary action button (`Space` / `E` / touch tap) that:

- Near cargo → attach/release
- Near damaged vehicle → repair/tow
- While driving → use current tool (plough, winch, scanner)
- Near workshop → enter workshop
- Near discovery → examine/collect

The button label dynamically updates in the HUD: "ATTACH" → "PLOUGH" → "ENTER" based on proximity and capability. This is already partially implemented in the current runtime; the research validates doubling down on this pattern.

### 6. UI That Evolves With Progression (Unlockable HUD)

**Inspiration:** Inscryption's evolving interface, Dead Space's RIG upgrades

Start with minimal UI — just the vehicle and the world. As the player discovers tools and capabilities, new HUD elements appear organically:

- Find a compass → compass appears in field kit
- Install a radio → radio interface unlocks
- Build a scanner → scanner overlay becomes available
- Earn a map → map tool appears

This turns UI elements into rewards, not defaults. It also provides natural onboarding: the player learns each element as it arrives, not all at once.

### 7. "Visual Haptics" for Browser (No Hardware Required)

**Inspiration:** Vlambeer's screenshake, camera micro-movements

Since browsers can't send force feedback to keyboards:

- **Impact:** Brief camera shake (decaying sinusoidal) + screen edge flash + hitstop (2-4 frame pause)
- **Tool engagement:** Camera drops slightly when plough enters soil, rebounds on release
- **Terrain:** Camera micro-vibrates on rough terrain, smooths on road
- **Damage:** Screen edge vignette pulses red, field-kit elements flicker
- **Success:** Brief golden screen-edge glow + satisfying audio "click"

All achievable with CSS transforms, opacity animations, and `requestAnimationFrame` coordination.

### 8. Asymmetric Co-op Controls (Future)

**Inspiration:** Keep Talking and Nobody Explodes, Lovers in a Dangerous Spacetime

One player drives (WASD/gamepad), another manages the map/scanner/radio on their own device (phone as second screen via WebSocket). The navigator sees a different UI — the field-kit map, upcoming hazards, resource locations — and calls out instructions. This leverages the browser's multiplayer capability without requiring both players to have gamepads.

---

## Anti-Patterns to Avoid

| Anti-Pattern          | Example                                   | Why It Fails                                | Rigs Unbound Guard                             |
| --------------------- | ----------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Icon spam             | Ubisoft open-world maps                   | Turns exploration into checkbox clearing    | Use rumor map, not marker saturation           |
| Information overload  | Star Citizen cockpit for new players      | Overwhelms; players can't prioritize        | Unlock HUD elements progressively              |
| UI that fights tone   | Neon arcade HUD on a gritty survival game | Breaks immersion                            | Field-kit aesthetic must match Patchwork Atlas |
| Forced mode switching | "Press T to enter build mode"             | Interrupts flow                             | Context-sensitive action, not mode buttons     |
| Dark patterns         | Energy timers, premium currency prompts   | Erodes trust                                | No dark patterns. Period.                      |
| Minimap dependency    | "I just stare at the minimap"             | Player stops looking at the beautiful world | Compass strip + directional audio + rumor map  |

---

## Browser-Specific Technical Opportunities

| Web API                             | Game UI Use                                              | Notes                                        |
| ----------------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| `DeviceOrientationEvent`            | Gyro steering on mobile                                  | Requires HTTPS + user gesture for permission |
| `Gamepad API` (vibrationActuator)   | Dual-motor rumble on compatible gamepads                 | Chrome/Edge support; polyfill for Firefox    |
| `Web Audio API`                     | Engine sound pitch mapping, spatial audio for world cues | AudioWorklet for low-latency processing      |
| `Web Speech API`                    | Voice commands for co-pilot mode                         | Chrome/Edge primary support                  |
| `Vibration API`                     | Mobile haptic patterns for impacts/terrain               | Simple but effective on Android              |
| `View Transitions API`              | Smooth transitions between game states (play ↔ workshop) | Progressive enhancement                      |
| CSS `@property` + custom properties | Reactive HUD state (condition color, gauge rotation)     | GPU-accelerated when using transforms        |
| `PointerLock API`                   | First-person camera control                              | Already standard for browser FPS games       |
| Canvas-as-texture                   | Dynamic dashboard gauges in Three.js                     | 2D canvas → texture update per frame         |
| `Intersection Observer`             | Lazy-load HUD elements, optimize off-screen widgets      | Performance optimization                     |

---

## Rigs Unbound-Specific Recommendations

### Immediate (Current Codebase)

1. **Enrich the existing field-kit HUD** with CSS micro-interactions: spring-easing on button presses, condition indicator that flickers when damaged, smooth camera-mode label transitions.
2. **Add camera FOV response** to speed: subtle widening at top speed, narrowing when stopped. ~5° range.
3. **Add engine sound pitch mapping** via Web Audio API: even a single oscillator modulated by rig speed adds tremendous feel.
4. **Make the action prompt dynamic**: label updates based on proximity context ("PLOUGH" → "ATTACH" → "ENTER").

### Near-Term (Next Proof)

5. **Implement gyroscope steering** for mobile touch players as an opt-in control mode.
6. **Add visual haptics**: camera shake on collision, tool-engagement camera drop, terrain micro-vibration.
7. **Add gamepad rumble** via `vibrationActuator` for compatible controllers.
8. **Design the rumor map** as the discovery/progress system prototype.

### Long-Term (Architecture)

9. **Build the 5-layer information architecture** as a formal contract alongside the existing camera/input contracts.
10. **Prototype the Patchwork Dashboard** for hood-camera view with dynamic canvas textures.
11. **Design the progressive HUD unlock system** where UI elements are rewards, not defaults.
12. **Explore asymmetric co-op** with phone-as-navigator via WebSocket.

---

## Open Questions for User Review

1. **How aggressive should diegetic UI be?** Full Pacific Drive–level dashboard immersion in hood view? Or keep it lighter as a field-kit always?
2. **Rumor map vs quest log**: Is the rumor map concept worth prototyping as the primary progress system?
3. **Gyroscope steering priority**: Worth implementing for mobile in the next proof, or defer until touch controls are more mature?
4. **Sound design budget**: Is Web Audio API engine sound mapping worth the complexity now, or is it a later-phase addition?
5. **Progressive HUD unlock**: Does starting with minimal UI fit the Rigs Unbound onboarding philosophy, or should the full field kit be present from the start?

---

## Anything Else? (Mandatory v4 Sweep)

- **Cross-cutting concern surfaced:** The camera system (6 policies) already functions as a UI mode system. The research validates this — each camera IS a different information architecture. Chase shows personality, Tactical shows spatial relationships, Hood shows immersion/dashboard. This should be documented as a formal UI contract alongside the rendering and input contracts.
- **Accessibility gap:** The current research on accessibility-first controls (switch access, one-handed schemes, dignity-preserving assists) reveals that the project's input contract should formalize these as first-class options, not afterthoughts. The `ACCESSIBILITY_AND_INPUT_CONTRACT` already names this gap but doesn't specify the concrete assist options.
- **Audio as UI is entirely absent** from the current runtime. This is the highest-signal single addition the project could make — engine sound alone would transform game feel.
- **No research was found on a direct competitor** doing vehicle-as-character in the browser with this depth of UI consideration. This is genuinely novel territory.
