# Research: Game UI Paradigms & Non-HUD Information Design

**Date:** 2026-07-26
**Context:** _Rigs Unbound_ — a browser-based 3D vehicle game where vehicles are the playable characters, featuring a "Patchwork Atlas" visual direction, field-kit style HUD, and multiple camera modes.

---

## Executive Summary

As game design evolves away from cluttered, spreadsheet-like interfaces, modern paradigms emphasize immersion, spatial awareness, and narrative integration. For _Rigs Unbound_, where the vehicle _is_ the character, the interface must bridge the gap between traditional mechanical feedback (gauges, dials, readouts) and modern character-action UI (health, status, abilities).

This document deeply explores four primary paradigms: **Diegetic UI**, **Spatial UI**, **Meta UI**, and **Non-HUD Information Design**. By leveraging the "Patchwork Atlas" visual direction and the field-kit aesthetic, _Rigs Unbound_ can utilize physicalized in-cab instruments (Diegetic), localized 3D world markers (Spatial), narrative-driven system glitches (Meta), and sensory feedback (Non-HUD) to create a cohesive, immersive browser-based experience.

---

## 1. Diegetic UI: The World as the Interface

### First Principles Definition

Diegetic UI refers to interface elements that exist directly within the fictional 3D world of the game. They are perceptible to both the player _and_ the characters within the game universe. Instead of existing on a 2D plane layered over the screen (non-diegetic), these elements are rendered as physical objects, displays, or indicators in the environment.

### Best Examples from Shipped Games

| Game                                    | Implementation                                                                                                                      | Why it Works                                                                                                                            |
| :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Dead Space** (2008/2023)              | Health is displayed as a glowing spine tube on Isaac's suit; ammo is projected holographically from the weapon itself.              | Removes the traditional HUD entirely, keeping the player's eyes on the center of the screen where the horror action happens.            |
| **Star Wars: Republic Commando** (2005) | The entire UI is framed as the inside of a Mandalorian helmet visor. Rain drops, dirt, and blood splatter on the "glass."           | Justifies standard HUD elements (health, ammo, squad commands) by grounding them in the fiction of a tactical visor.                    |
| **Forza Motorsport / Assetto Corsa**    | Interior dashboard views provide exact telemetry (RPM, speed, gear, fuel) via physically modeled steering wheels and dash clusters. | Essential for simulator purists; perfectly marries the physical reality of driving with the information needed to play.                 |
| **Metro Exodus** (2019)                 | Artyom’s physical wrist watch, geiger counter, and lighter serve as UI. The player must wipe their gas mask to see clearly.         | Forces the player to physically interact with their UI (e.g., checking the map board in real-time without pausing), escalating tension. |
| **Firewatch** (2016)                    | The player must hold up a physical paper map and a compass in-world to navigate.                                                    | Grounds the player in the wilderness survival aspect; no magical GPS minimap exists.                                                    |

### Academic/GDC Research Context

Research presented at GDC (e.g., UI/UX summits) consistently highlights that diegetic UI significantly increases "presence" (the feeling of actually being in the virtual world). However, studies on cognitive load indicate that forcing players to look away from the focal point (e.g., looking down at a dashboard while driving at 200mph) can cause critical attention failures. Anthony Stonehouse's influential essay on UI paradigms categorizes diegetic design as the pinnacle of immersion but warns against sacrificing readability for realism.

### Application to _Rigs Unbound_

For a game where vehicles are characters, the diegetic UI is essentially the character's "face" and "body language."

- **The "Patchwork Atlas" Dashboard:** The vehicle's dashboard should be a cobbled-together array of analog dials, CRT monitors, and digital readouts.
- **Physicalized Health/Status:** Instead of a red health bar, use physical wear indicators on the rig. A temperature gauge on the hood that glows red-hot; sputtering steam valves; a physical "check engine" light taped over with duct tape that flashes when critical.
- **In-World Navigation:** Instead of a floating minimap, present a physical, perhaps slightly torn, topographical map clipped to the sun visor or resting on the passenger seat, which the camera can glance at using a dedicated button.
- **Field-Kit Aesthetic:** Attach physical clipboards, polaroids, and handwritten sticky notes to the interior of the cab to relay objectives or lore.

### Tradeoffs and Failure Modes

- **Readability:** Text on a 3D dashboard can become illegible due to lighting changes, shadows, or low resolution.
- **FOV/Camera Angle Dependency:** If the player switches to a chase camera (third-person), the diegetic dashboard is lost. The game must have a fallback (like a spatial or semi-diegetic HUD) for third-person views.
- **Cognitive Load:** Looking down at a dashboard takes eyes off the road.

### Browser/Web-Specific Considerations

- **Resolution and Anti-Aliasing:** WebGL/WebGPU canvases in browsers can sometimes struggle with crisp text rendering on 3D textures at lower resolutions. Diegetic UI elements must use high-contrast colors and large, bold typography to remain readable on compressed textures.
- **Aspect Ratios:** Browser windows are frequently resized. A dashboard that looks perfect in 16:9 might have critical gauges cropped out in an ultra-wide or 4:3 window.

---

## 2. Spatial UI: Anchored to 3D Space

### First Principles Definition

Spatial UI elements are presented in the 3D game space but are _not_ part of the game's fiction (the characters cannot see them). They are attached to the environment or objects but serve only the player. This includes floating names over enemies, interaction button prompts on doors, or waypoint markers floating in the sky.

### Best Examples from Shipped Games

| Game                                 | Implementation                                                                                                                                                       | Why it Works                                                                                                                                          |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tom Clancy's The Division** (2016) | Holographic lines anchor to the street to show GPS routes; menus float next to the character rather than sticking to the screen glass.                               | Keeps the screen clean while providing complex RPG data. It feels diegetic due to the "smart lens" fiction, but mechanically functions as spatial UI. |
| **Splinter Cell: Conviction** (2010) | Objectives and narrative text are physically projected onto the walls and environments (e.g., a giant "INFILTRATE THE MANSION" projected on the side of a building). | Replaces loading screens and objective logs with cinematic, environmentally integrated typography.                                                    |
| **Death Stranding** (2019)           | Holographic markers placed by other players exist in the 3D world, warning of dangers or offering encouragement.                                                     | Creates a sense of shared physical space in an asynchronous multiplayer environment.                                                                  |

### VR Lessons for Flat Screens

VR design has revolutionized spatial UI because 2D screen-space HUDs induce motion sickness in VR.

- **Depth Cues & Occlusion:** UI should properly hide behind physical objects. If a floating marker is 50 meters away, it must be occluded by a building that is 10 meters away. Drawing UI "always on top" breaks depth perception.
- **Interaction Zones:** VR teaches us that UI is most comfortable when placed in a specific "Goldilocks" zone—not too close to cross the eyes, not too far to be illegible.

### Application to _Rigs Unbound_

- **Proximity Indicators:** Use floating, rusty, or holographic markers attached to scavengeable parts in the world. As the rig gets closer, the UI unfolds like a Swiss-army knife to show what the part is.
- **World-Anchored Waypoints:** Instead of a compass on the screen, project tire-track holograms or painted lines onto the actual terrain to guide the player, fitting the "Patchwork Atlas" theme.
- **Targeting and Social:** If other rigs (players or NPCs) are present, their status could be represented by spatial UI hovering above them—perhaps designed to look like a ham-radio frequency readout rather than a standard MMO nameplate.

### Tradeoffs and Failure Modes

- **Visual Clutter:** Too many floating icons turn the beautiful game world into a spreadsheet of chaotic floating text.
- **Readability Against Backgrounds:** A white floating text might be readable against a dark mountain but invisible against the sky. Dynamic contrast or subtle backplates are required.

### Browser/Web-Specific Considerations

- **Performance:** Rendering hundreds of floating UI planes in world-space, especially with transparency and text scaling, can cause overdraw and tank WebGL performance. Use instanced rendering or limit the number of active spatial UI elements.

---

## 3. Meta UI: The Self-Aware Interface

### First Principles Definition

Meta UI acknowledges that it is a video game interface. It breaks the fourth wall, manipulating the game's menus, HUD, or even the player's operating system to create a narrative effect. It plays with the player's expectations of how software is "supposed" to behave.

### Best Examples from Shipped Games

| Game                        | Implementation                                                                                                                        | Why it Works                                                                               |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------- |
| **Inscryption** (2021)      | The game UI pretends to be an old floppy disk OS. The interface glitches, rewinds, and speaks to the player.                          | Deepens the mystery; the UI itself is a character and an antagonist.                       |
| **Pony Island** (2016)      | The player must "hack" the game's actual options menu to progress, fixing broken code to unlock gameplay.                             | Blurs the line between playing a game and debugging a cursed piece of software.            |
| **NieR: Automata** (2017)   | The character is an android, so the HUD is her literal OS. If you uninstall her "OS Chip" in the UI menu, she dies and the game ends. | A brilliant fusion of Diegetic and Meta UI that ties narrative deeply to system mechanics. |
| **Eternal Darkness** (2002) | Sanity effects include fake "Controller Disconnected" messages, volume bars lowering automatically, and simulated blue-screens.       | Uses the interface to induce actual real-world panic in the player.                        |

### Application to _Rigs Unbound_

Given the "field-kit" and "Patchwork Atlas" aesthetic, the game can treat the browser window as an analog, patched-together terminal connecting the player to the rig.

- **Boot Sequences:** When loading the game, instead of a standard loading bar, show a terminal booting up, initializing the rig's chassis, checking fuel pressure, and establishing a "satellite link" via the browser.
- **Damage Representation via UI Glitch:** When the rig takes massive damage, the UI shouldn't just flash red—it should tear, glitch, or temporarily desync (CRT scanline effects, chromatic aberration), implying the connection between the player's "terminal" and the rig is failing.
- **Meta Objectives:** The player might have to interact with the game's actual settings menu (e.g., "re-calibrating the audio frequencies" in the settings to tune into a hidden in-game radio station).

### Tradeoffs and Failure Modes

- **Player Frustration:** If the UI intentionally malfunctions during high-stakes gameplay, it can cause legitimate anger. Meta elements should enhance the narrative, not cause cheap deaths.
- **Loss of Trust:** If a game fakes a crash, players might actually just close the browser thinking it broke.

### Browser/Web-Specific Considerations

- **The Ultimate Meta Canvas:** Because _Rigs Unbound_ is in a browser, you can utilize the DOM. You can manipulate the HTML outside the WebGL canvas. For instance, taking heavy damage could cause the actual webpage background to flicker, or the browser tab's `<title>` could change to "SIGNAL LOST...".
- **Security Restrictions:** Browsers prevent games from manipulating the actual OS (unlike native games like _OneShot_), so meta effects must be contained within the browser tab, DOM, and cursor hijacking (via Pointer Lock API).

---

## 4. Non-HUD Information Design

### First Principles Definition

Non-HUD information design is the practice of communicating critical game state data entirely through the environment, sound, camera behavior, and animation, removing the need for explicit graphical interface elements altogether. It relies on human intuition and sensory feedback.

### Categories and Best Examples

#### A. Environmental Storytelling

- **Journey (2012):** The entire objective of the game is communicated by a singular glowing mountain always visible in the distance. No waypoints needed.
- **The Last of Us (2013):** Safe areas are usually brightly lit with warm sunlight, while dangerous infected zones are dark, choked with spores, and visually claustrophobic.
- **Application:** In _Rigs Unbound_, use tire tracks in the mud, oil slicks, or smoke rising over a hill to guide the player to points of interest or warn them of other rigs.

#### B. Sound Design as UI

- **Engine & Mechanics:** In racing games, skilled players shift gears entirely by the pitch of the engine audio, not by looking at the RPM gauge.
- **Threat Detection:** In _Hunt: Showdown_, snapping twigs, distant gunshots, and barking dogs provide a highly accurate "audio map" of enemy locations without a single red dot on a minimap.
- **Application:** For _Rigs_, a failing transmission should _sound_ awful (grinding gears, whining). Low fuel could be signaled by the engine sputtering. Approaching hostile rigs can be heard via heavy diesel rumbles before they are seen.

#### C. Camera Behavior as Information

- **Speed & Impact:** As a vehicle moves faster, the camera FOV slightly widens (speed lines), and camera shake increases. When taking a hit, a violent camera jolt communicates damage better than a health bar.
- **Focus Points:** The camera slowly drifting toward a massive canyon jump or an incoming threat passively tells the player, "look at this."
- **Application:** _Rigs Unbound_ features multiple camera modes. The transition between them can carry information. A hard impact could temporarily knock a third-person "drone" camera out of alignment, forcing static or a reset.

#### D. Animation and VFX

- **Status via VFX:** Instead of a health bar, a vehicle shows damage physically: crumpled fenders, sparks flying from the undercarriage, black smoke billowing from the hood, and a limp, off-balance suspension.
- **Application:** If a rig's tire is blown, the physical animation of the rig dragging its axle communicates the status instantly. If a rig is "healing" or repairing, physical sparks from a welding blowtorch or structural realignments should play out in the 3D space.

### Tradeoffs and Failure Modes

- **Accessibility:** Relying heavily on audio cues excludes deaf/hard-of-hearing players. Relying on subtle color changes excludes colorblind players. Non-HUD design MUST be multi-sensory (e.g., an audio cue is accompanied by a visual VFX cue).
- **Ambiguity:** Sometimes a player just needs to know exactly how much health they have. If the engine is smoking, they might not know if that means 50% health or 1% health.

### Browser/Web-Specific Considerations

- **Audio Autoplay Policies:** Web browsers strictly block audio until the player interacts with the page. You must design a robust "Click to Start Engine" initial interaction to unlock the Web Audio API context.
- **Performance vs VFX:** Heavy particle effects (smoke, sparks, dynamic deformation) can be expensive in the browser. You may need to rely more on clever sound design and camera work to convey damage if WebGL particle limits are reached.

---

## Conclusion: Synthesizing the Paradigms for _Rigs Unbound_

To create a groundbreaking UI for _Rigs Unbound_, the development team should employ a hybrid approach:

1.  **Core Vehicle Telemetry:** Use **Diegetic UI** (Patchwork Atlas gauges, taped-up dials) for primary driving feedback when in cockpit view.
2.  **World Navigation:** Use **Spatial UI** (anchored holographic markers, projected tire tracks) for wayfinding, keeping the screen edges completely clean of HUD elements.
3.  **Narrative & Tone:** Use **Meta UI** (browser DOM manipulation, field-kit boot sequences, terminal glitches) to frame the game as a tactile, slightly unstable connection to a remote machine.
4.  **Damage & Status:** Rely entirely on **Non-HUD Information Design** (smoke, grinding audio, camera shake, visual deformation) to communicate the physical state of the rig, only falling back on spatial UI for accessibility options.

By pushing the boundaries of what browser capabilities allow (combining WebGL with DOM manipulation), _Rigs Unbound_ can deliver an interface that doesn't just display information, but actively enriches the game's world and characters.
