# Design Direction

Status: **exploratory; not an accepted final art direction**

![Patchwork Atlas exploratory triptych](docs/exploration/assets/patchwork_atlas_triptych_2026-07-25.png)

The triptych is a generated concept probe, not production art. It successfully keeps a repaired fictional tractor and wide plow legible across warm farm, tactical night, and larger-world promise. It also exposes questions: the night enemies currently read as generic spider drones, the future vista is more conventional than the farm, and the tractor’s exact condition/module continuity needs a stricter model sheet. See the [asset provenance record](docs/research/ASSET_PROVENANCE_REGISTER.md).

## Direct preference signal — 2026-07-25

The project owner explicitly likes the triptych’s vehicle design and scene viewpoint and wants this direction explored further. That strengthens—not finalizes—the Patchwork Atlas lead.

The favored qualities are now more precisely defined:

- a persistent repaired machine large enough in frame to feel like a character;
- richer material and repair detail on the vehicle than on the simplified diorama world;
- close three-quarter chase/near-isometric play for personality;
- higher tactical framing when spatial information becomes more important;
- warm workday versus cool dangerous-night state contrast;
- immediate verb, local opportunity, and distant world promise in the same view;
- functional attachments that change silhouette and capability.

Three project-local boards now explore a canonical tractor character, six gameplay camera roles, and a fair Patchwork Atlas/Signal Noir/Salvage Opera comparison. See [Visual Direction Preference and Variants](docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md).

Current interpretation:

- Patchwork Atlas is the baseline language.
- Signal Noir is a danger/information-state transformation.
- Salvage Opera is a rare region/event crescendo.

Concept-art depth-of-field, darkness, and spectacle are not runtime targets until active-play readability and performance are measured.

## Runtime field-test interpretation — 2026-07-25

Field Test 001 translates Patchwork Atlas into reproducible primitive geometry rather than treating the concept board as production art.

The current runtime uses:

- a repaired rust/bone tractor silhouette with a physically legible plough;
- a low-chrome DOM field kit rather than a generic dashboard;
- distance-spaced furrows as the signature world-memory element;
- harvest-gold world-state labels and cyan opportunity signals;
- warm day, separated gloam, and cool night presentation states;
- six reusable camera policies: Chase for machine personality, Hood for driving, Side for attachments and motion, Tactical for local manoeuvring, Top-down for exact spatial reading, and Survey for route planning;
- four horizon signals—restore, tow, shrink, ascend—to keep the wider world promise visible without claiming those activities are complete.

The screenshot review corrected two issues in the same pass: the first tactical camera left excessive empty space, and the initial mobile control stack overlapped the field kit. The current camera keeps the rig and its trace central; the `390 × 844` layout leaves a measured gap between instruments and touch controls.

Dynamic shadow maps were replaced with a rig-attached blob shadow after Chrome reported a texture-storage warning during lifecycle testing. This is also the better first-field performance posture; richer shadows require measured visual value.

Known visual gap: terrain occlusion now pulls the camera clear, but nearby tall props can still dominate elevated framing. Add prop-aware collision before increasing scenery density or accepting the camera grammar across every world type.

## Experience promise

Vehicles are characters. The player should be able to recognize a machine by silhouette, movement, sound, wear, attached tools, and the stories visible on its body—not only by a nameplate or rarity color.

The interface should feel like a field kit attached to a changing machine, not a generic dashboard placed over every genre.

## Proposed visual grammar: Patchwork Atlas

The leading exploration direction combines:

- tactile, hand-built diorama environments;
- bold, readable vehicle silhouettes;
- visible repair seams, swapped modules, stickers, mud, scorch, crop dust, and cosmic residue;
- restrained color by biome, with high-contrast interaction cues;
- dramatic changes in light and atmosphere to signal a mechanical shift;
- ordinary objects becoming monumental when scale changes;
- grounded material response rather than universal neon glow.

This can make a tractor, toy car, bicycle, and rocket belong to one world without making them visually identical. “Patchwork” supplies continuity; each region supplies its own rules and palette.

## Two counter-directions to prototype

### Signal Noir

Hard silhouettes, pools of light, long shadows, sparse color, and radio-like UI. Strong for night defense, stealth, and top-down gunplay. Risk: it may suppress the warmth, collecting pleasure, and visual variety needed for farming and toy-scale play.

### Salvage Opera

Large skies, expressive machinery, colorful exhaust, impossible grafted modules, and theatrical vistas. Strong for aspiration and sharing. Risk: effects and scale can obscure interaction readability and overwhelm low-power devices.

Neither direction should be merged into Patchwork Atlas by default. A screenshot comparison should test which one best communicates the core loop.

## Vehicle character rules

- Silhouette communicates locomotion class before surface detail.
- Every attachment changes both appearance and at least one usable capability.
- Damage and repair tell a story; they are not random grunge.
- Rarity is expressed through unusual function and history, not just chroma.
- Real-world-inspired vehicles must avoid unlicensed brands, protected liveries, and deceptive replicas.
- A hybrid must show a legible parentage: what was grafted, why, and what tradeoff it caused.

### Restoration arc

The first tractor should begin dilapidated/basic and grow toward the robust preferred concept without being replaced by a different tractor.

Visual continuity must preserve recognizable bones: cab/roof silhouette, round-light face, wheel stance, beacon or mounting history, signature patch, chassis proportions, and meaningful scars.

Treat four changes differently:

- core restoration makes a broken system dependable;
- chassis tuning changes feel and tradeoffs;
- physical modules change available verbs and silhouette;
- deployed states change how an already installed module behaves.

Robust means capable and structurally convincing, not clean, over-armored, or covered with every unlocked attachment. See [Tractor Restoration and Modular Growth](docs/exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md).

## World rules

- A location should support at least two states or uses: day/night, calm/crisis, small/giant, ground/air, owned/contested, seasonal/corrupted.
- Procedural variation operates inside authored composition rules and validated traversal.
- Landmarks, routes, and affordances remain readable at gameplay speed.
- The same place visibly remembers player actions.
- Genre changes use diegetic transitions—entering a shadow zone, launching from a silo, shrinking through a workshop portal—not a contextless menu.

## UI rules

- Primary play uses low-chrome HUD layers; collection and workshop screens can be richer.
- Core status is visually attached to the vehicle where possible: lights, smoke, cargo, tool posture, audio, and decals.
- DOM-based HUD is preferred for accessibility and responsive layout unless measurement proves a canvas-only element necessary.
- Keyboard, gamepad, pointer, and touch share named actions.
- Interaction prompts explain the verb and consequence, not only the button.
- Use icon + text + state; never rely on color alone.
- Respect reduced motion, volume categories, scalable text, remapping, hold/toggle alternatives, subtitles, and high-contrast modes.

## Camera grammar

- Chase/near-isometric for traversal and vehicle personality.
- Top-down for dense tactical readability.
- Side framing supports readable suspension, attachment, and towing inspection; authored set pieces may request it without owning a separate camera branch.
- Transitions must preserve orientation and telegraph control changes.
- Camera collision, occlusion, motion comfort, and target reacquisition are first-class gameplay systems.

## Audio grammar

- Each vehicle has a layered mechanical voice: idle, load, traction, damage, tool, boost, and environment response.
- Music follows world state and player pressure rather than running as a constant wallpaper.
- Important threats and interaction states require non-audio equivalents.
- Generated audio, if explored, remains a proposal until rights, provenance, editing, loudness, looping, and in-game fit are reviewed.

## Browser visual budgets to measure

No numbers are accepted yet. The engine probes must establish separate desktop and mobile targets for:

- initial compressed download;
- time to first controllable frame;
- active object and physics-body counts;
- draw calls, triangles, texture memory, particles, lights, and shadow casters;
- CPU/GPU frame time;
- resolution scaling and fallback behavior.

## Anti-slop checks

- No generic purple-gradient landing-page visual language.
- No card grid pretending to be a game interface.
- No effects added solely to make a screenshot look “premium.”
- No tiny unreadable text or controls.
- No identical vehicle feel hidden beneath different meshes.
- No procedural expanse without authored reasons to move through it.

## Kenney source-library policy

The locally owned Kenney All-in-1 3.4.0 library is a strong prototype substrate, not an automatic final style. Its Car, Nature, Toy Car, and Space previews show a compatible low-poly readability language, and selected assets can make engine and mechanic comparisons materially fairer.

Rules:

- use exact source binaries for cross-engine fixtures;
- import only named assets needed by a current experiment;
- keep the paid bundle outside the project and never redistribute it directly;
- preserve per-pack CC0 evidence and source/derived hashes;
- keep semantic game identity separate from filenames and scene nodes;
- add authored wear, repair history, functional attachments, biome palettes, lighting, effects, and audio before claiming Patchwork Atlas fidelity;
- reject a raw multi-pack collage if players recognize the asset library before they recognize their machine and world.

See the [Kenney asset library audit](docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md).

## Anything else?

The design test is not “does this look like a polished game?” It is “can a player infer what this machine can do, what has happened to it, and what possibility is calling from the world?”

## Rig Lab 01 visual translation — 2026-07-25

The live runtime now tests visual contrast rather than using distant landmarks alone to imply breadth:

- **Torque** retains the rust/bone repaired utility silhouette, large rear stance, cab, exhaust, beacon, plough, and stable chase framing.
- **Spark** uses a low cyan/gold toy-buggy silhouette, exposed wheels, roll bar, compact tow hook, close camera, and visible airborne state.
- Relay cargo uses a gold-banded rust crate and cyan beacon.
- Pickup, ramp, and delivery gate form a readable route without a mode-selection menu.
- The same field-kit grammar changes rig name, capability, relay status, condition, speed, and camera without becoming separate genre HUDs.

The first narrow-screen pass revealed that the six-instrument field kit overlapped touch controls. The final `390 × 844` review has a measured 10.41 px vertical gap. Portrait chase distance and height now pull back to keep the active rig readable behind the interface.

Remaining visual gap: geometry communicates different silhouette and jump posture, but sound, suspension compression, tire slip, dust, towing strain, and animation do not yet communicate the full handling contrast. External-player language is the gate: if people describe only different speeds, the audiovisual and motion grammar needs another pass before more rigs are added.

### Anything else?

The buggy should not become the new anchor. Its job is to prove contrast. Later rigs may reject wheels, ground contact, chase framing, or the current scale entirely while retaining semantic actions and persistent identity.

## Marsh Skimmer 01 visual translation — 2026-07-25

Drift is the first runtime rig that rejects wheels and ground contact:

- a dark flexible lift skirt, sealed side pontoons, broad deck, and twin rear
  lift fans create a low-hover silhouette rather than a wheeled reskin;
- cyan/cream/rust materials keep it in the Patchwork Atlas family without
  copying Torque or Spark;
- water spray, lift-fan audio, cushion telemetry, and slight bank/pitch response
  expose the hover model through several channels;
- discovered site masts recede so the machine and route remain readable on
  arrival;
- camera policy hard-cuts across distant rig switches, then returns to smooth
  chase motion, avoiding a cross-map transition through terrain.
- portrait chase retains its extra distance/height but reduces the side offset,
  keeping broad rigs in the narrow horizontal field of view; its target composes
  the subject into the safe space above the field kit.

Primitive geometry remains proof material, not final art. The current rear
fans read clearly at gameplay scale but can resemble circular wheels in a
single rear screenshot; the asset/model pass should strengthen duct, blade,
skirt, and wake motion before this silhouette is treated as final.

### Anything else?

Object-aware camera occlusion is still unresolved. Terrain is raymarched, but a
large prop or undiscovered site mast can still obstruct the subject. This is a
camera/world-furniture contract to solve once prop collision volumes are
canonical, not a reason to add vehicle-specific camera offsets.

## Rig Perception Chain 01 — 2026-07-25

Vehicle feel now uses one shared derived frame for speed, propulsion/strain
load, traction loss, lateral load, steering expression, camera anticipation,
and motion comfort.

- Torque communicates slower steering, restrained chassis roll, and stable
  camera anticipation.
- Spark permits larger steering, pitch/roll, and speed framing.
- Drift banks through the same lateral-load meaning without inventing wheel
  state.
- Front wheels visibly steer on both ground rigs.
- Physical terrain attitude remains authoritative; presentation adds bounded
  readable exaggeration.
- Reduced motion keeps steering/suspension truth while clamping chassis and
  camera exaggeration and removing speed-driven FOV expansion.
- Portrait chase pulls back using the shared profile-scaled policy so broad rigs
  fit the horizontal safe area without a rig-name branch.

The current proof uses primitive geometry. Authored rigs need named wheel,
steering, suspension, tool, light, and damage nodes so the same contract can
drive final animation without mesh-specific searches.

### Anything else?

The next feel pass should be validated in player language: “heavy,” “nervous,”
“skimming,” “straining,” or another fantasy-specific description. Numeric
differences and passing presentation assertions do not prove emotional feel.
