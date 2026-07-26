# GAME UI RESEARCH: ADAPTIVE, GENERATIVE, PROCEDURAL, AND STATE-DRIVEN SYSTEMS

**Date:** July 26, 2026
**Context:** _Rigs Unbound_ (Browser-based 3D vehicle game, playable vehicles as characters, field-kit HUD aesthetic, multiple camera modes).

---

## 1. EXECUTIVE SUMMARY AND THE PARADIGM SHIFT IN GAME UI

The traditional paradigm of game user interfaces (UI) has long been dominated by the static Heads-Up Display (HUD)—a 2D overlay of meters, minimaps, and icons rigidly affixed to the edges of the screen. While functional, this approach often creates a cognitive barrier between the player and the game world, acting as a "fourth wall" that constantly reminds the player they are interacting with a software application rather than inhabiting a living world.

In recent years, game design has seen a massive shift toward **Adaptive, Generative, Procedural, and State-Driven UI systems**. These modern paradigms treat the UI not as a separate overlay, but as an integrated, reactive, and sometimes physical component of the game's ecosystem. The UI becomes a living entity that responds to the player's cognitive load, the state of the game world, and the physical condition of the avatar (or in the case of _Rigs Unbound_, the vehicle).

For _Rigs Unbound_—a browser-based game where the vehicle is the protagonist and the aesthetic is defined as a "field-kit"—this research is critical. Browser environments demand highly optimized, scalable, and resolution-independent designs, making procedural UI highly relevant. Furthermore, the "vehicle-as-character" concept inherently demands that the UI be deeply tied to the machine's physical state. A field-kit aesthetic implies ruggedness, analog functionality, and tactile interaction, actively pushing back against sterile, digital overlays.

This document explores these advanced UI paradigms deeply, breaking them down into theoretical concepts, concrete industry examples, and direct applications for the development of _Rigs Unbound_.

---

## 2. UI THAT TRANSFORMS WITH GAME STATE

State-driven UI is predicated on the idea that the interface should reflect the emotional and physical reality of the game moment. Rather than a health bar simply decreasing in length, the entire interface ecosystem reacts to the degradation of the player-character's status.

### The Theory of State-Driven UI

State-driven UI leverages the psychological concept of "embodied cognition"—the idea that our understanding of the world is deeply rooted in our physical state and environment. When a UI transforms based on game state, it bypasses the analytical brain (which reads a number, like "20% Health") and appeals directly to the emotional brain (which sees a cracked, bleeding, or malfunctioning screen and feels panic). This type of UI is highly dynamic, often utilizing degradation, distortion, and contextual hiding.

### Industry Examples and Case Studies

- **Dead Space (The Gold Standard of Diegetic State UI):**
  _Dead Space_ revolutionized UI by removing the traditional HUD entirely. Isaac Clarke's health is displayed as an illuminated tube on the spine of his suit; his ammunition is a holographic counter projected directly from his weapon. When Isaac is heavily damaged, his posture changes, his breathing becomes ragged (audio UI), and the visual fidelity of his holographic menus can distort. The UI degrades in tandem with his physical state.
- **Metro Series (2033, Last Light, Exodus):**
  The _Metro_ games utilize physical degradation as a primary UI state change. The player's gas mask is essential for survival. As the player takes damage, the mask cracks. These cracks are not just cosmetic; they obscure vision, acting as a permanent, state-driven UI penalty until repaired. Furthermore, condensation builds up on the mask, requiring the player to perform a physical action (wiping the mask) to clear their vision. The UI here is a physical barrier that must be managed.
- **Hellblade: Senua's Sacrifice (Psychological UI):**
  _Hellblade_ uses audio and visual hallucinations as its primary UI. The "state" of Senua's psychosis dictates the density of the information. Whispering voices warn of incoming attacks (audio UI), and the visual field narrows and distorts when she is overwhelmed. The UI changes appearance based on panic and calm states, abandoning meters entirely for pure sensory feedback.
- **Ghost of Tsushima (Environmental State UI):**
  While exploring, the game uses the wind to guide the player (Guiding Wind mechanic). This environmental UI changes based on the weather state and the player's target. The UI is seamlessly woven into the world's physical state.

### Application to _Rigs Unbound_

For a vehicle-centric game with a field-kit aesthetic, state-driven UI offers massive potential:

1.  **Mechanical UI Degradation:** Instead of a health bar, the "Field-Kit" UI should physically degrade. If the UI is presented as a dashboard monitor or a ruggedized tablet, taking heavy damage could crack the digital screen, introduce static, or cause certain UI widgets to short-circuit and spark, temporarily obscuring information.
2.  **Thermal and Environmental States:** If the vehicle is overheating, the edges of the UI could warp with heat haze, or the color grading of the entire interface could shift toward high-contrast reds and oranges. If driving through deep mud or a storm, the "lens" of the UI (or the physical dashboard) could accumulate dirt, requiring a mechanical "wipe" action to read the gauges clearly.
3.  **Information Triage Under Panic:** When the vehicle is at critical health or moving at extreme speeds, the UI should enter a "panic state." Non-essential information (like the minimap, or detailed suspension telemetry) should fade away, while critical survival information (engine heat, imminent collision warnings) pulses and grows in size. The UI actively filters information based on the vehicle's stress state.

---

## 3. PROCEDURALLY GENERATED AND ATTENTION-AWARE UI

Procedural generation is typically associated with level design, but its application to UI architecture is a growing field. Procedural UI involves generating layouts, shapes, and behaviors at runtime using algorithms rather than pre-baked assets. Coupled with Attention-Aware systems, this creates interfaces that are not only infinitely scalable but also cognitively optimized.

### The Theory of Procedural and Attention-Aware UI

Procedural UI relies on vector mathematics, shaders, and dynamic layout engines. It is inherently resolution-independent, which is crucial for browser games that must adapt to an infinite variety of window sizes.

Attention-Aware UI is rooted in the PAM (Perception, Attention, Memory) framework. Human attention is a finite resource. In a fast-paced game, bombarding the player with static information leads to cognitive overload. Attention-aware systems track the player's likely focus (often the center of the screen or the immediate hazard) and dynamically rearrange or surface UI elements to intercept that gaze without breaking focus.

### Industry Examples and Case Studies

- **Dynamic Layout Systems (e.g., MPUI Kit in Unity):**
  Many modern engines use procedural generation to draw UI elements (like rounded boxes, gradients, and borders) via shaders rather than sprites. This allows for modular, widget-based HUDs that can seamlessly animate, expand, and collapse based on context.
- **MMO Information Triage (World of Warcraft Add-ons):**
  While visually cluttered, advanced WoW add-ons (like WeakAuras) are highly procedural and attention-aware. They track thousands of game variables but only display massive, glowing icons near the center of the screen when a specific, critical action is required. They procedurally generate the UI layout based on the exact combat context.
- **Left 4 Dead (The AI Director):**
  While known for pacing, the AI Director concept applies to UI. The game determines what the player needs to know. If a teammate is pinned, their silhouette highlights procedurally through walls. The UI algorithm calculates relevance based on distance, line of sight, and urgency.
- **Forza Horizon (Dynamic HUD scaling):**
  Racing games often dynamically scale their UI. At high speeds, the speedometer might enlarge slightly, while peripheral information fades, mimicking tunnel vision and procedurally adjusting the layout to center the player's attention on the road and the immediate telemetry.

### Application to _Rigs Unbound_

1.  **The Modular Field-Kit Layout:** Since _Rigs Unbound_ features multiple camera modes (chase cam, hood cam, tactical overview), the UI must be procedurally generated to adapt. In chase cam, the UI might collapse into a compact widget in the corner. In a tactical overhead mode, it procedurally expands into a full "blueprint" layout, revealing detailed suspension and drive-train telemetry.
2.  **Attention-Aware Hazard Warnings:** If a vehicle approaches a critical drop or an incoming projectile, an attention-aware system doesn't just blink a light in the corner of the screen. It procedurally generates a high-contrast visual cue along the vector of the hazard, intercepting the player's natural eye movement toward the threat.
3.  **Canvas/WebGL Optimization:** For a browser game, using procedural shaders to draw the "Field-Kit" (analog dials, rugged metal bezels, CRT scanlines) instead of downloading large texture atlases will drastically improve load times and performance. The UI can be generated mathematically on the GPU.

---

## 4. ANALOG/PHYSICAL-FEEL UI IN DIGITAL GAMES

The "Field-Kit" aesthetic explicitly calls for an analog, physical feel. This is a deliberate departure from the hyper-clean, holographic interfaces of sci-fi games, leaning instead toward skeuomorphism, mechanical friction, and tactile reality.

### The Theory of Analog Interfaces

Analog UI grounds the player in the physical reality of the game world. It relies on the psychological principle of "affordance"—the idea that the visual design of an object suggests how it should be used. A digital slider implies a smooth drag; a rusty, analog toggle switch implies a satisfying, mechanical "click" and a binary state. Analog UI often requires the player-character to physically manipulate an object in the world, taking their eyes off the horizon and introducing a deliberate, tension-building vulnerability.

### Industry Examples and Case Studies

- **Firewatch (The Paper Map and Compass):**
  _Firewatch_ eschews a minimap. To navigate, the player must press a button to have the character physically raise a paper map and a separate compass. The map doesn't show a glowing arrow indicating the player's location; the player must triangulate using the compass and landmarks. The UI is a physical object that obscures the screen when used.
- **Far Cry 2 (The Diegetic Map and GPS):**
  In _Far Cry 2_, the map is a physical piece of paper held in the character's hand. When driving, the character rests it on their leg. If the player looks down at the map, they are not looking at the road, creating extreme tension. Furthermore, the map physically degrades over time.
- **Return of the Obra Dinn (The Journal):**
  The entire game's UI is centered around a physical, meticulously detailed notebook. The act of flipping pages, crossing out names, and filling in deductions feels intensely tactile, grounding the abstract logic puzzles in a physical medium.
- **Outer Wilds (Ship's Log and Dashboard):**
  The spaceship in _Outer Wilds_ features a heavily analog dashboard. The landing camera is a literal CRT screen that drops down. The fuel and structural integrity are physical gauges that the player must look at. The rumor map is a physical corkboard connecting clues with string.
- **Alien: Isolation (The Motion Tracker):**
  The motion tracker is a bulky, analog device. When the player brings it up, the background (the actual game world) blurs through depth-of-field effects. The player must choose whether to focus their eyes (and the camera) on the UI or on the world, but they cannot clearly see both at once.

### Application to _Rigs Unbound_

1.  **The Literal Field-Kit:** The UI should not feel like an HTML overlay; it should feel like a ruggedized piece of military or expeditionary hardware strapped to the vehicle. It should feature brass bezels, cracked glass, and physical toggle switches.
2.  **Analog Telemetry:** Instead of a digital speedometer reading "85 mph," use an analog tachometer that physically shakes and bounces as the vehicle traverses rough terrain. The needle should not move smoothly; it should jitter with the physics of the suspension.
3.  **Physical Interaction Modes:** When entering a "garage" or "tuning" state, the UI could shift to a physical clipboard or a spiral-bound notebook. Modifying the vehicle involves flipping pages or swapping out polaroid photos of parts, accompanied by heavy, tactile sound design (paper rustling, metal clanking).
4.  **Deliberate Friction:** In certain camera modes, checking detailed telemetry should require "looking down" or shifting focus, introducing the _Far Cry 2_ tension of taking eyes off the road to read the map.

---

## 5. VEHICLE-AS-UI: THE MACHINE IS THE INTERFACE

In a game where vehicles are the playable characters, the most profound UI paradigm is to eliminate traditional UI entirely and use the vehicle itself as the primary communicator of information. The machine's physical state _is_ the interface.

### The Theory of Vehicle-as-UI

This approach is the ultimate expression of diegetic design. By mapping critical gameplay information (health, speed, capacity, status effects) directly onto the 3D model of the vehicle and its behavior, the player develops a deep, symbiotic relationship with the machine. The vehicle becomes a living organism whose "body language" must be read and interpreted.

### Industry Examples and Case Studies

- **Pacific Drive (The Masterclass in Vehicle-as-UI):**
  The station wagon in _Pacific Drive_ is the entire UI hub. Damage is communicated by missing doors, shattered windows, and sparking engines. The "Quirks" system means the car develops emergent behaviors (e.g., turning the steering wheel turns on the radio), forcing the player to diagnose the machine based on its physical feedback. The dashboard contains physical dials for fuel and battery, requiring the player to look around the cabin to gather data.
- **Jalopy (Tactile Maintenance):**
  In _Jalopy_, there are no menus for car health. You must physically open the hood, pull out the battery, and look at its physical state to know if it needs replacing. The car's performance—its struggle to climb hills, the smoke from the exhaust—is the only UI that tells you it needs maintenance.
- **MudRunner / SnowRunner (Physics as UI):**
  These games use terrain deformation and vehicle physics as their primary UI. You know you are losing traction not because a light flashes, but because you physically see the tires spinning and digging ruts into the mud. You know the engine is struggling because the exhaust smoke thickens and turns black. The visual feedback of the 3D model interacting with the environment is the interface.
- **Mad Max (Visual Upgrades):**
  Every upgrade to the Magnum Opus in _Mad Max_ changes its silhouette. You know how much armor the car has by looking at the welded spikes and plates. The vehicle's visual design is an instant, readable interface of its capabilities.

### Application to _Rigs Unbound_

Since the vehicles _are_ the characters, treating the 3D model as the primary UI is essential.

1.  **Body Language and Stance:** A damaged vehicle shouldn't just have a low health bar; its suspension should sag on one side, its alignment should pull, and it should limp. Overheating should be communicated by visible heat distortion waves radiating off the hood and the glowing red of exhaust pipes.
2.  **Attachments as Silhouette UI:** The "field-kit" concept implies modularity. When a player equips a new radar, winch, or engine block, it must be prominently visible on the 3D model. The silhouette of the vehicle instantly communicates its loadout to the player (and to opponents).
3.  **Environmental Marking:** The vehicle should leave a trail that acts as a UI history. Deep tire tracks, leaked oil, or scattered debris tell the story of where the vehicle has been and its current state.
4.  **Headlights and Illumination as UI:** In dark environments, the vehicle's headlights act as the player's cone of vision. Upgrading headlights changes the "UI" of exploration. If the battery is low, the lights dim and flicker, providing a terrifying, diegetic indicator of power loss.

---

## 6. MULTI-MODAL INFORMATION ARCHITECTURE

Relying solely on visual UI (whether diegetic or overlaid) is a mistake in fast-paced or complex games. Multi-modal architecture distributes information across different sensory channels—visual, auditory, and haptic—to reduce cognitive load and create a richer interface tapestry.

### The Theory of Multi-Modal UI

Information can be categorized on a spectrum from **Explicit** (a specific number to be read, like "45 RPM") to **Implicit** (a feeling or sound, like a high-pitched engine whine). Humans are excellent at processing implicit, multi-modal information subconsciously. By layering these channels, a game can communicate massive amounts of data without overwhelming the visual cortex.

### Industry Examples and Case Studies

- **Racing Game Audio Architecture (Gran Turismo, Forza):**
  Professional sim racers rarely look at the RPM gauge. The game communicates engine speed entirely through audio pitch. Furthermore, tire grip is communicated through high-frequency tire squeals (audio) and controller rumble (haptics). The UI is "felt" and "heard," not just seen.
- **Journey (Musical UI):**
  _Journey_ uses musical chords to communicate interaction. When players "sing" to each other or to the environment, the length and pitch of the note is the UI. The scarf length acts as the visual UI for jump capacity, creating a seamless multi-modal loop.
- **Overwatch (Sound as Spatial UI):**
  _Overwatch_ has incredibly dense visual UI, but it relies heavily on audio UI for spatial awareness. Every character has unique footstep sounds, and the volume of those footsteps is dynamically mixed based on the threat level. The audio engine acts as a procedural UI layer, telling the player exactly where danger is without a visual indicator.
- **Need for Speed (FOV and Camera Motion as UI):**
  To communicate extreme speed, rather than relying on a digital number, games use dynamic Field of View (FOV) adjustments. As speed increases, the camera pulls back, the FOV widens (creating a tunnel effect), radial motion blur is applied, and the camera shakes. The visual processing of the _world_ becomes the UI for speed.

### Application to _Rigs Unbound_

1.  **Engine Acoustics as Primary Telemetry:** The state of the engine must be communicated via dynamic audio mixing. A healthy engine hums; a damaged engine sputters, backfires, and grinds. The player should know their vehicle's health with their eyes closed.
2.  **Dynamic Camera UI:** Utilize the browser's WebGL capabilities to manipulate the camera. If the vehicle is suffering from heavy G-forces or impacts, the camera should shake, the FOV should distort, and chromatic aberration should increase. The camera itself acts as the interface conveying physical stress.
3.  **UI Sound Design:** The "Field-Kit" UI must have heavy, satisfying, mechanical sound design. Clicking a button shouldn't produce a digital "beep," but the heavy thud of a metal toggle switch. This reinforces the physical nature of the interface even when interacting with a 2D element.

---

## 7. NICHE AND EXPERIMENTAL UI SYSTEMS

Looking beyond standard genres can provide unique inspirations for _Rigs Unbound_. Experimental games often blur the line between the user interface and the core gameplay loop.

### Industry Examples and Case Studies

- **Noita (Pixel-based World-as-UI):**
  In _Noita_, every pixel is simulated. The world itself is the UI for elemental reactions. You don't read a text box about water putting out fire; you see the blue pixels interact with the red pixels and turn into grey steam pixels. The physics engine is the interface for understanding the game's logic.
- **Papers, Please (The Interface is the Game):**
  The entire game revolves around organizing a cramped, physical desk. Dragging documents, stamping passports, and comparing rulebooks _is_ the gameplay. The UI is intentionally clunky and overwhelming to simulate the bureaucratic nightmare of the setting.
- **Baba Is You (Rules as Physical Game Objects):**
  _Baba Is You_ turns the underlying logic of the game (the code/UI rules) into physical blocks that the player must push around. The interface for changing the game rules is embedded entirely within the spatial puzzle mechanics.
- **Dwarf Fortress (Information Density as an Aesthetic):**
  _Dwarf Fortress_ presents a staggering amount of information through ASCII (or now, pixel art) interfaces. It embraces overwhelming complexity, treating data density not as a flaw, but as a feature for hardcore players who want to simulate everything.

### Application to _Rigs Unbound_

1.  **The Drag-and-Drop Garage (Papers, Please style):** Instead of a clean, list-based menu for upgrading the vehicle, the Garage UI could be a physical, messy workspace. The player drags heavy, physics-enabled parts onto a blueprint of the vehicle. Organizing the inventory feels like organizing a real, cramped toolbox.
2.  **Elemental Interaction UI (Noita style):** If _Rigs Unbound_ features environmental hazards (mud, acid, fire), the visual interaction of these elements on the vehicle's chassis should be the primary interface. Mud should dynamically cake onto the tires and reduce grip; fire should char the paint. The physics material system acts as the UI.
3.  **Terminal/CLI Interactions:** Fitting the "Field-Kit" aesthetic, advanced tuning or diagnostics could involve a faux Command Line Interface (CLI). Typing commands to run diagnostics on the vehicle's suspension adds an incredibly niche, deeply immersive hacker/mechanic vibe that suits the rugged, browser-based nature of the game.

---

## CONCLUSION

For _Rigs Unbound_, the user interface cannot be an afterthought; it must be an integrated, mechanical component of the game world. By moving away from static 2D overlays and embracing **State-Driven degradation**, **Procedural Widget generation**, **Analog physicality**, and the **Vehicle-as-UI** philosophy, the game can achieve a level of immersion that transcends its browser-based constraints. The "Field-Kit" aesthetic is not just a visual style; it is a mandate for tactile, multi-modal, and deeply reactive interface design.
