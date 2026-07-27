# Game UI/UX Reference Analysis: Rigs Unbound

_Date: 2026-07-26_

This document provides a comprehensive, deeply researched analysis of game UI paradigms, interaction design, and control schemes. It focuses on specific reference games with innovative, acclaimed, or uniquely relevant UI/UX for the _Rigs Unbound_ project—a browser-based vehicle game where vehicles are the playable characters, featuring a "Patchwork Atlas" visual direction, field-kit style HUD, and multiple camera modes.

---

## 1. Vehicle/Driving Games with Notable UI

### SnowRunner & MudRunner

**Design Philosophy:** The UI must communicate complex physical interactions (terrain deformation, vehicle strain, weight distribution) without abstracting the simulation. The truck _is_ the UI in many ways.

**What Works (and Why):**

- **The Winch Interface:** Rather than complex menus, the winch UI uses a web of nodes connecting the vehicle to the environment. It translates a physical action into a spatial puzzle. Players quickly assess anchor strength and distance.
- **Damage Mechanics as UI:** Damage isn’t just a health bar; it’s compartmentalized (Engine, Gearbox, Suspension, Tires). When an engine takes damage, it stalls, sputters, and consumes more fuel. The UI "wobbles" to simulate the vibration of rough terrain, providing haptic-like visual feedback.
- **Terrain as Information:** The visual language of the terrain (darker mud equals higher viscosity and deeper extrusion) replaces the need for a "terrain difficulty" meter.
- **Immersive Mode:** Allows hiding most UI elements, forcing reliance on the truck's physical dashboard and environmental audio cues.

**What Fails:**

- Map navigation can be overly cluttered with waypoints. The process of planning a route sometimes feels disconnected from the tactile driving experience.

**Transferable to Rigs Unbound:**

- **Field-Kit Diagnostics:** For Rigs Unbound, vehicle health shouldn't be a generic bar. Use a diegetic "blueprint" or diagnostic tool that highlights stressed components.
- **Winch/Tow Interactions:** If vehicles are characters, towing or assisting another vehicle should use spatial node-based interactions (like SnowRunner’s winch) rather than menu-driven actions.

### Forza Horizon Series

**Design Philosophy:** A festival atmosphere where UI must bridge arcade accessibility with simulation depth.

**What Works (and Why):**

- **Dynamic HUD:** Speedometers curve with the screen edge, and UI elements (like skill chains) pop up dynamically but stay out of the direct line of sight.
- **Forza Vista:** An incredibly detailed inspection mode where the camera becomes a physical entity examining the car. It turns customization into a tactile exhibition.

**What Fails:**

- The menu systems outside of driving are often criticized for being overly tiled and nested, making simple tuning adjustments require too many clicks.

**Transferable to Rigs Unbound:**

- **Camera as Inspector:** Rigs Unbound can use a "Vista" style mode in the garage, where the camera acts as a mechanic's eye, zooming in on the "Patchwork Atlas" details of the rig.

### Star Citizen & Elite Dangerous

**Design Philosophy:** Diegetic interfaces where the cockpit _is_ the menu. Total immersion at the cost of steep learning curves.

**What Works (and Why):**

- **Multi-Function Displays (MFDs):** Screens within the cockpit display radar, power management, and targeting. The player looks _at_ the screen in the 3D space rather than having a 2D overlay.
- **Holographic Interfaces:** Menus project into the 3D space of the world.

**What Fails:**

- Massive information density can overwhelm new players. Text resolution can be an issue on lower-end displays or when viewed off-angle.

**Transferable to Rigs Unbound:**

- **Patchwork Dashboards:** Since Rigs Unbound features multiple camera modes, the first-person/dashboard camera could utilize diegetic instruments (taped-on GPS, analog dials) that fit the "field-kit" aesthetic perfectly.

---

## 2. Games with Iconic/Award-Winning UI

### Persona 5

**Design Philosophy:** "Punk-pop" rebellion. The UI is not a transparent window; it is a loud, integral part of the game's identity and narrative.

**What Works (and Why):**

- **Color Theory:** Aggressive use of stark red, black, and white. Minimal sub-colors ensure high contrast.
- **Ransom Note Typography:** Irregular, slanted text sizes mimic cut-outs, directly tying into the "warning letters" of the Phantom Thieves.
- **Battle Menu Transitions:** It abandons standard lists for a radial, button-mapped approach. Pressing 'Triangle' instantly triggers a specific sub-menu, with the character's 3D model transitioning dynamically. It feels like navigating a comic book layout in real-time.

**What Fails:**

- Can be overwhelming during the first few hours; the sheer kinetic energy of the UI can cause sensory fatigue for some players.

**Transferable to Rigs Unbound:**

- **UI as Brand:** Rigs Unbound's "Patchwork Atlas" aesthetic should not just be in the 3D world. The UI itself should look stitched together, improvised, and tactile—like a mechanic's notebook or a rugged field tablet.
- **Instantaneous Inputs:** Browser games need snappy feedback. Mapping specific vehicle abilities to single keystrokes with explosive, stylized transitions can make a web game feel incredibly premium.

### Hades

**Design Philosophy:** UI that enhances narrative flow and maintaining the momentum of a roguelite.

**What Works (and Why):**

- **Boon Selection:** The UI is clean, using distinct iconography and color-coding for different gods. It provides exactly the right amount of text (mechanic + lore flavor) without pausing the pacing for too long.
- **Diegetic Menus:** The hub world (the House of Hades) uses spatial positioning for menus (the mirror for upgrades, the contractor for house changes).

**Transferable to Rigs Unbound:**

- Spatial menus in the "garage" or hub area. Instead of a flat HTML menu, the player clicks on physical toolboxes or drafting tables to access upgrades.

### Dead Space

**Design Philosophy:** Pure diegesis. Zero HUD.

**What Works (and Why):**

- Health is a physical tube on the character's spine; ammo is projected holgraphically from the weapon.

**Transferable to Rigs Unbound:**

- If vehicles are characters, their physical state should communicate their health. Smoke, sputtering engines, damaged armor panels, or physical dials on the back of the rig can eliminate the need for traditional health bars.

---

## 3. Browser/Web Games with Innovative UI

### Townscaper

**Design Philosophy:** "Radically casual" creation without the friction of management.

**What Works (and Why):**

- **Procedural Organic Grid:** It hides the complex math (Wave Function Collapse) behind a simple, flowing grid.
- **Click-and-Build Interface:** The UI is merely a color palette. The _game_ decides what structure to build based on the context of where the player clicks.
- **Auditory/Visual Feedback:** Immediate, satisfying "pops" and procedural animations when placing a block.

**Transferable to Rigs Unbound:**

- **Contextual Upgrades:** In the garage, instead of navigating complex tech trees, clicking on a chassis might contextually snap appropriate parts (armor, wheels) into place with satisfying, toy-like animations.

### Krunker.io

**Design Philosophy:** Maximum performance and instant accessibility in a browser.

**What Works (and Why):**

- **Frictionless Entry:** Click a link and you are in the game. The UI is minimal HTML/CSS overlaying a WebGL canvas.
- **Deep Customization:** Despite the simple look, the settings menu allows for granular control over FOV, UI scale, and performance tweaks (disabling particles/shadows for pure FPS).

**What Fails:**

- The menu can feel like a spreadsheet, prioritizing function entirely over form.

**Transferable to Rigs Unbound:**

- Performance settings must be front and center. Browser environments vary wildly in capability; allowing players to instantly toggle "Performance Mode" vs "Fidelity Mode" (Patchwork Atlas visuals) is crucial.

### A Dark Room

**Design Philosophy:** UI evolution as narrative progression.

**What Works (and Why):**

- Starts with a single button ("Light Fire"). As the game expands, the UI expands from simple text to a resource manager, and eventually to an ASCII map. The UI _is_ the discovery.

**Transferable to Rigs Unbound:**

- Progressive disclosure. Start the player with a basic rig and a simple UI (speed, fuel). As they upgrade to complex rigs with specialized tools (cranes, weapons), the UI physically expands or adds new "modules" to the field-kit HUD.

---

## 4. Games Relevant to Rigs Unbound's Specific Needs

### The "Patchwork / Field-Kit" Aesthetic

**Reference:** _Firewatch_ & _Metro Exodus_

- **Metro Exodus:** The player uses a physical clipboard for a map, a lighter to illuminate it, and a geiger counter strapped to the wrist. The UI is grimy, tactile, and grounded.
- **Application for Rigs Unbound:** The HUD shouldn't be sleek vector graphics. It should look like duct tape, analog dials, CRT monitor scanlines, and rough schematics. If the player opens a map, render an animation of a hand unfolding a paper map on the dashboard.

### Vehicles as Characters & Camera as UI

**Reference:** _Rocket League_ & _NieR: Automata_

- **Rocket League:** The camera is tethered to the ball by default, making the UI of spatial awareness completely camera-driven.
- **NieR: Automata:** The game frequently shifts from 3D action to 2D side-scrolling to top-down shooter, changing the camera paradigm entirely.
- **Application for Rigs Unbound:** Since there are multiple camera modes, the UI must adapt.
  - _Chase Cam:_ Minimalist UI, speed/health clamped to the corners.
  - _Top-Down/Tactical Cam:_ The UI shifts to look like a drone operator's screen or a satellite readout, with grid overlays and tactical markers.
  - _Cockpit Cam:_ All 2D UI fades away, relying on the physical dashboard of the rig.

### Vehicle Customization

**Reference:** _Crossout_ & _Robocraft_

- **Crossout:** Allows players to build vehicles part-by-part. The UI shows center of mass, tonnage, and energy consumption.
- **Application:** Rigs Unbound needs a "Blueprint Mode." The screen turns into grid-paper, the vehicle renders in wireframe/blueprint style, and parts are snapped on. This fits the "Patchwork" vibe perfectly.

---

## 5. Anti-Patterns and UI Failures to Avoid

### 1. The Ubisoft "Icon Spam" & Cluttered HUDs

- **The Issue:** Games like _Far Cry_ or _Assassin's Creed_ often fill the screen with minimaps, objective markers, compasses, and persistent button prompts.
- **The Result:** "If everything is important, nothing is." Players stop looking at the beautiful game world and instead "follow the dot" on the minimap. It breaks immersion and removes the joy of discovery.
- **Rigs Unbound Solution:** Use environmental design. Instead of a giant glowing arrow pointing to an objective, use tire tracks in the mud, a plume of smoke on the horizon, or a physically mounted GPS unit inside the vehicle cabin.

### 2. Information Overload in Simulators

- **The Issue:** Dumping spreadsheets of data (torque curves, suspension telemetry) onto the screen at all times.
- **Rigs Unbound Solution:** Layer the information. The primary HUD should only show critical stats (Health/Fuel). Telemetry and deep stats should be relegated to a specific "Diagnostic Mode" or the garage.

### 3. Mobile-Style Dark Patterns in Browsers

- **The Issue:** Over-use of notifications, multi-currency shops that confuse real-world value, and UI elements designed to trap clicks (e.g., tiny 'X' buttons to close ads).
- **Rigs Unbound Solution:** Respect the player's time. A premium browser game must have clean, readable menus. Fast UI navigation (like _Persona 5_) will make the game feel high-quality, contrasting with cheap web-game norms.

### 4. Ludonarrative Dissonance in UI

- **The Issue:** A gritty, post-apocalyptic game featuring a pristine, Apple-esque futuristic glass UI.
- **Rigs Unbound Solution:** Total commitment to the "Patchwork Atlas." Every UI element should look like it was salvaged, coded on a 90s terminal, or sketched in a notebook.

---

## Conclusion & Actionable Next Steps for Rigs Unbound

1. **Develop a "Field-Kit" UI Bible:** Establish a visual language. Colors should be muted with high-contrast warning colors (yellow hazard tape, emergency red). Fonts should be rugged, monospaced, or hand-drawn.
2. **Prototype Diegetic Dashboards:** Experiment with moving UI elements (speed, fuel, damage) off the 2D screen overlay and onto the 3D vehicle model itself.
3. **Implement Camera-Driven UI Contexts:** Write logic that changes the HUD style based on the active camera (e.g., switching to a 'drone overlay' in top-down view).
4. **Garage as an Organism:** Make vehicle customization tactile. Instead of drop-down menus, allow clicking directly on the rig's chassis to swap out patched-together parts.

_End of Document_

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this UI reference analysis. This document still
owns the field-kit and diegetic interface frame; the new note carries the
wider machine-keeper thesis and long-range product direction.
