# Vehicle Multiverse Game
## Visual Exploration Living Catalog

**Purpose:** Maintain a prompt-ready inventory of visual directions before implementation.  
**Rule:** Nothing in this catalog is approved for production merely because it is listed. Generate, prototype, or build only when explicitly requested.  
**Reference syntax:** Combine IDs such as `SCN-04 + HUD-07 + RIG-12 + MAP-03 + STYLE-05`.

## Navigation

- [Docs root landing page](README.md)
- [Research landing page](research/README.md)
- [Exploration Map](exploration/EXPLORATION_MAP.md)
- [Long-Term Game Design from First Principles](exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)

---

## 1. Exploration Axes

Every visual direction can vary across these axes:

| Axis | Useful ranges |
|---|---|
| Player scale | toy-sized, human vehicle, industrial machine, city-scale machine, planetary craft |
| Camera | cockpit, chase, side-on, top-down, isometric, tactical map, cinematic orbit, split-screen |
| Vehicle class | cycle, bike, kart, car, truck, tractor, mech, hovercraft, train, boat, aircraft, rocket, spaceship, hybrid |
| Gameplay | race, delivery, farming, rescue, survival, extraction, tower defence, convoy, stealth, exploration, construction, trade |
| World tone | playful, grounded, cosy, grim, heroic, absurd, mysterious, surreal, cosmic |
| Environment | urban, rural, desert, snow, jungle, ocean, underground, industrial, fantasy, alien, orbital |
| Time | dawn, midday, sunset, night, storm, seasonal, time-loop, day-night transformation |
| Rendering | painterly, stylised PBR, low-poly, voxel, clay, cel-shaded, realistic, miniature diorama, comic |
| UI density | minimal diegetic, arcade, tactical, simulator, card-driven, holographic, retro |
| Progression | parts, mastery, reputation, factions, research, crafting, mutation, relics, vehicle lineage |

---

## 2. Prompt Conventions

Prompts are written to establish composition, gameplay readability, world logic, and UI language. When generating:

- Ask for one concept per image unless the goal is a comparison board.
- Prefer visible vehicle silhouette, traversal route, threats, objectives, and landmarks.
- Keep text sparse. Use labels only when the image is specifically a UI board.
- Avoid copying a known game, franchise, logo, character, or interface.
- For production references, request orthographic views, material callouts, scale references, and state variations.
- For screenshots, request a believable playable frame rather than a poster unless key art is intended.

---

## 3. Scene and World Directions

### SCN-01 — Neon Megacity Circuit

**Core fantasy:** A high-speed night race through a dense vertical city where roads overlap, buildings move, advertisements become hazards, and shortcuts run through service tunnels.

**Gameplay possibilities:** Arcade racing, police pursuit, timed delivery, rival takedowns.

**Camera:** Third-person chase camera with occasional cinematic tunnel compression.

**Likely vehicles:** Street bike, tuner car, hover coupe, courier trike.

**Environmental systems:** Rain, reflective asphalt, traffic AI, destructible signs, magnetic boost lanes.

**HUD implications:** Circular speedometer, route ribbon, rival proximity, boost heat, shortcut warning.

**Reusable image prompt:** A playable third-person browser-game screenshot of a custom futuristic motorcycle racing through a rain-soaked neon megacity at night, layered elevated roads, moving traffic, holographic signs used as gameplay obstacles, visible alternate shortcuts through service tunnels, strong sense of speed, readable road edges, rival vehicles nearby, compact arcade HUD with speed, boost heat, race position and route ribbon, stylised premium 3D game art, crisp silhouettes, dynamic reflections, no existing brand logos, 16:9.


### SCN-02 — Rooftop Courier Run

**Core fantasy:** Small agile vehicles cross rooftops, maintenance bridges, elevators, cranes, and unfinished towers while carrying fragile cargo.

**Gameplay possibilities:** Precision traversal, delivery contracts, parkour driving, time trials.

**Camera:** Close chase camera with smart pullback before jumps.

**Likely vehicles:** Electric bike, micro buggy, one-wheel courier pod, drone-assisted cart.

**Environmental systems:** Wind gusts, moving cranes, fragile surfaces, cargo balance, route improvisation.

**HUD implications:** Cargo integrity, landing prediction, wind direction, destination elevation.

**Reusable image prompt:** A playable urban rooftop delivery game scene at golden hour, a compact electric courier buggy leaping between connected rooftops, cranes and maintenance bridges forming multiple routes, fragile cargo visibly strapped to the rear, distant skyline, wind banners indicating gusts, readable landing zones, premium stylised 3D graphics, dynamic chase camera, minimal HUD showing cargo integrity, wind direction, destination height and timer, believable browser game screenshot, no text-heavy poster layout, 16:9.


### SCN-03 — Farm Cycle: Day

**Core fantasy:** A peaceful productive farm where the vehicle is a working tool, not merely transport.

**Gameplay possibilities:** Ploughing, sowing, irrigation, harvesting, animal care, hauling, maintenance.

**Camera:** Wide third-person, low machinery camera, optional management overview.

**Likely vehicles:** Tractor, harvester, irrigation rover, utility quad, autonomous cart.

**Environmental systems:** Soil moisture, crop growth, seasons, machinery wear, terrain deformation.

**HUD implications:** Field task queue, crop health, fuel, attachment status, weather forecast.

**Reusable image prompt:** A serene playable farm simulation screenshot in a richly detailed countryside, a modular tractor cultivating rows while an autonomous utility cart follows, visible crop stages, irrigation channels, animals and distant farm buildings, warm morning light, terrain deformation behind the plough, readable gameplay route through the field, stylised realistic 3D art, clean agricultural HUD with crop health, soil moisture, attachment status, fuel and weather forecast, no real-world machinery brands, 16:9.


### SCN-04 — Farm Cycle: Night Siege

**Core fantasy:** The same farm transforms after sunset into a defendable territory using agricultural machines and improvised attachments.

**Gameplay possibilities:** Wave defence, perimeter repair, rescue, resource routing, mobile turret combat.

**Camera:** Third-person action camera with tactical overhead toggle.

**Likely vehicles:** Armoured tractor, harvester ram, floodlight truck, seed cannon rover.

**Environmental systems:** Power grid, barricades, crop damage, darkness, noise attraction, repairable structures.

**HUD implications:** Threat sectors, generator load, crop loss risk, wave timer, attachment heat.

**Reusable image prompt:** A playable night-time farm defence scene using the exact visual language of a grounded farm simulator transformed into survival gameplay, an armoured tractor with improvised floodlights and mounted tools defending barns and crop fields against shadowy creatures, fences breaking, generators powering safe zones, multiple threat directions, moonlit mist, readable combat spacing, third-person camera, tactical HUD showing threat sectors, generator load, crop damage risk, wave countdown and attachment heat, premium original game art, 16:9.


### SCN-05 — Flooded Village Rescue

**Core fantasy:** Vehicles operate through changing water depth to move people, supplies, and livestock during a flood.

**Gameplay possibilities:** Rescue, route planning, towing, bridge repair, supply distribution.

**Camera:** High third-person with waterline visibility and occasional map view.

**Likely vehicles:** Amphibious truck, tractor, rescue boat, hovercraft, improvised raft carrier.

**Environmental systems:** Water current, buoyancy, submerged hazards, civilians, collapsing paths.

**HUD implications:** Water depth, stability, passenger count, current direction, safe-route confidence.

**Reusable image prompt:** A playable disaster-rescue game screenshot in a flooded rural village during heavy rain, an amphibious utility truck moving through waist-deep water while towing a small rescue raft, rooftops and trees used as navigation landmarks, civilians waiting at marked safe points, floating debris and submerged road hazards, visible changing current, grounded but stylised 3D visuals, high third-person camera, compact rescue HUD showing water depth, stability, passengers, current direction and route confidence, respectful non-sensational tone, 16:9.


### SCN-06 — Desert Convoy

**Core fantasy:** A moving caravan crosses vast hostile terrain where fuel, formation, scouting, and vehicle condition matter.

**Gameplay possibilities:** Convoy escort, ambush defence, salvage, route choice, mobile base management.

**Camera:** Wide chase camera with tactical formation view.

**Likely vehicles:** Armoured truck, fuel tanker, scout bike, mobile workshop, sand skimmer.

**Environmental systems:** Heat, sandstorms, fuel consumption, visibility, soft terrain, raider ambushes.

**HUD implications:** Convoy formation, fuel range, heat, threat direction, damage overview.

**Reusable image prompt:** A playable desert convoy game scene at late afternoon, multiple custom vehicles moving in formation across dunes and cracked salt flats, lead armoured truck, fuel tanker, scout bike and mobile workshop, distant storm wall, alternate canyon route visible, dust trails communicating weight and speed, potential ambush silhouettes on ridges, premium stylised 3D environment, wide chase camera, tactical HUD with formation status, fuel range, heat, threat bearing and component damage, original designs, 16:9.


### SCN-07 — Canyon Vertical Race

**Core fantasy:** A route built around altitude, wall rides, switchbacks, cliff elevators, gliding sections, and falling debris.

**Gameplay possibilities:** Race, stunt chaining, checkpoint capture, rival sabotage.

**Camera:** Dynamic chase camera with vertical framing.

**Likely vehicles:** Dirt bike, rally buggy, climbing crawler, winged hybrid.

**Environmental systems:** Rockfall, wind, elevation, grip, breakable shortcuts.

**HUD implications:** Altitude, grip, jump line, rival ghost, risk multiplier.

**Reusable image prompt:** A playable vertical canyon racing screenshot, a compact rally buggy climbing a near-vertical switchback while another vehicle wall-rides along a curved rock face, suspended lifts, natural arches, gliding shortcuts and falling debris visible across multiple elevations, dramatic scale but readable route design, dynamic chase camera framed vertically, stylised premium 3D art, concise HUD with altitude, grip, jump trajectory, rival ghost and risk multiplier, no franchise resemblance, 16:9.


### SCN-08 — Whiteout Expedition

**Core fantasy:** A slow, dangerous traversal across snowfields where navigation and survival systems outweigh raw speed.

**Gameplay possibilities:** Exploration, rescue, surveying, convoy, shelter deployment.

**Camera:** Close third-person in whiteout, broader camera when weather clears.

**Likely vehicles:** Tracked rover, snowmobile, articulated crawler, heated supply truck.

**Environmental systems:** Snow depth, ice fracture, temperature, visibility, avalanche, battery drain.

**HUD implications:** Compass confidence, thermal status, traction, shelter distance, team condition.

**Reusable image prompt:** A playable polar expedition game screenshot in a near-whiteout blizzard, a tracked research rover leading two smaller snow vehicles across uneven snow and cracked ice, route poles barely visible, one distant emergency shelter light, snow accumulation on vehicle surfaces, believable traction and wind, tense but beautiful premium 3D art, close third-person camera, survival HUD with compass confidence, thermal status, traction, shelter distance and crew condition, 16:9.


### SCN-09 — Jungle Ruins Traverse

**Core fantasy:** Dense vegetation hides ancient roads, mechanical temples, wildlife, mud, and route-altering ruins.

**Gameplay possibilities:** Exploration, puzzle traversal, archaeology delivery, creature avoidance.

**Camera:** Third-person with foliage-aware camera and puzzle close-ups.

**Likely vehicles:** Trail bike, six-wheel rover, amphibious jeep, vine-cutting crawler.

**Environmental systems:** Mud, vegetation regrowth, wildlife, ancient mechanisms, water level changes.

**HUD implications:** Route memory, noise, wildlife alert, winch tension, relic signal.

**Reusable image prompt:** A playable jungle exploration game screenshot, a modular six-wheel rover entering an overgrown mechanical ruin, layered roots, waterfalls, stone tracks, rotating ancient gates and multiple muddy approaches, wildlife watching from cover, winch attached to a collapsed bridge, rich humid atmosphere, premium stylised 3D art, camera positioned for traversal readability, exploratory HUD showing route memory, noise level, wildlife alert, winch tension and relic signal, original worldbuilding, 16:9.


### SCN-10 — Swamp Salvage

**Core fantasy:** Heavy machinery retrieves lost cargo and machines from unstable wetlands while avoiding becoming trapped.

**Gameplay possibilities:** Salvage, towing, route probing, resource recovery, creature defence.

**Camera:** Low heavy-vehicle camera with overhead terrain scan.

**Likely vehicles:** Recovery truck, airboat, crawler crane, swamp bike, floating workshop.

**Environmental systems:** Mud suction, water depth, winch physics, fog, hidden debris, unstable islands.

**HUD implications:** Ground firmness, cable load, anchor quality, salvage value, escape route.

**Reusable image prompt:** A playable swamp salvage game scene at dawn, a heavy recovery truck on oversized tires winching a half-submerged machine from dark wetlands while a small airboat scouts ahead, unstable mud islands, reeds, fog and hidden debris, physically convincing cable tension and ground deformation, moody premium 3D visuals, low vehicle camera, practical HUD with ground firmness, cable load, anchor quality, salvage value and escape route, 16:9.


### SCN-11 — Storm Port Operations

**Core fantasy:** A coastal industrial port becomes a dynamic logistics and survival space during escalating storms.

**Gameplay possibilities:** Container transport, crane coordination, evacuation, ship support, storm survival.

**Camera:** Third-person vehicle view with logistics overview.

**Likely vehicles:** Terminal tractor, rescue tug, crane crawler, container carrier, amphibious loader.

**Environmental systems:** Wind, waves, loose containers, flooded lanes, lightning, crane movement.

**HUD implications:** Cargo lock, wind load, tide, route closure, harbour alert.

**Reusable image prompt:** A playable storm-port operations screenshot, a terminal tractor hauling locked containers through a coastal cargo port as rain lashes sideways, cranes moving overhead, waves overtopping a seawall, loose cargo becoming hazards, rescue tug visible in rough harbour water, cinematic but readable industrial layout, premium stylised 3D art, gameplay HUD showing cargo lock, wind load, tide, route closures and harbour alert, 16:9.


### SCN-12 — Underwater Seabed Run

**Core fantasy:** Submersible vehicles explore trenches, wrecks, thermal vents, and alien ecosystems with limited visibility.

**Gameplay possibilities:** Exploration, mining, rescue, specimen transport, pressure management.

**Camera:** Trailing underwater camera with sonar overlay.

**Likely vehicles:** Mini-sub, seabed crawler, drill rover, bio-luminescent glider.

**Environmental systems:** Pressure, oxygen, current, darkness, sonar, fragile ecosystems.

**HUD implications:** Depth, pressure margin, sonar contacts, hull stress, oxygen, sample integrity.

**Reusable image prompt:** A playable underwater vehicle exploration screenshot, a compact seabed crawler and mini-sub moving through a deep ocean trench near a wreck and glowing thermal vents, bioluminescent life, particulate water, narrow cave route and distant open abyss, strong depth cues, premium original 3D game art, trailing underwater camera, restrained sonar HUD showing depth, pressure margin, contacts, hull stress, oxygen and sample integrity, 16:9.


### SCN-13 — Volcanic Mining Run

**Core fantasy:** Industrial vehicles extract rare material while heat, lava movement, and structural collapse continuously reshape the route.

**Gameplay possibilities:** Mining, hauling, hazard control, timed extraction, machine cooling.

**Camera:** Third-person industrial camera with heat-map mode.

**Likely vehicles:** Drill rig, ore hauler, cooling rover, rail crawler, lava skimmer.

**Environmental systems:** Heat, lava flow, gas, rock collapse, cooling fluids, unstable tunnels.

**HUD implications:** Heat zones, payload, coolant, structural warning, exit timer.

**Reusable image prompt:** A playable volcanic mining game screenshot inside a vast active caldera, a rugged ore hauler following a drill rig across black rock bridges above moving lava, cooling rover spraying a safe path, collapsing tunnel entrance in the distance, heat distortion and glowing materials, premium stylised industrial 3D art, third-person camera, clear HUD with heat zones, payload, coolant, structural warning and extraction timer, 16:9.


### SCN-14 — Toy Room Grand Prix

**Core fantasy:** Everyday objects become giant terrain for toy-scale vehicles.

**Gameplay possibilities:** Race, collectathon, puzzle shortcuts, household hazard survival.

**Camera:** Low miniature chase camera.

**Likely vehicles:** Toy car, pull-back truck, block-built buggy, wind-up animal vehicle.

**Environmental systems:** Moving pets, rolling balls, carpet drag, furniture shadows, household interactions.

**HUD implications:** Toy battery, stunt chain, hidden path, owner proximity, collectible trail.

**Reusable image prompt:** A playable toy-scale racing screenshot in a child’s bedroom, small original toy vehicles racing across books, building blocks, a folded blanket ramp and a track made from household objects, a cat paw creating a dynamic hazard, warm afternoon light, exaggerated miniature scale, premium playful 3D art, low chase camera, compact HUD showing wind-up energy, stunt chain, hidden path hint, nearby giant movement and collectible trail, no commercial toy branding, 16:9.


### SCN-15 — Kitchen Micro-World

**Core fantasy:** Tiny utility vehicles operate inside a kitchen where liquids, heat, appliances, and food become terrain systems.

**Gameplay possibilities:** Delivery, cleanup, rescue, obstacle racing, ingredient gathering.

**Camera:** Macro close-up camera with clear depth-of-field control.

**Likely vehicles:** Mini forklift, crumb sweeper, bottle-cap racer, magnetic wall crawler.

**Environmental systems:** Steam, spills, moving utensils, appliance cycles, sticky surfaces.

**HUD implications:** Surface grip, heat, contamination, route timing, cargo freshness.

**Reusable image prompt:** A playable miniature vehicle game screenshot across a busy kitchen counter, a tiny forklift transporting ingredients over cutting-board bridges while a bottle-cap racer crosses a spilled liquid route, steam from a kettle, moving utensils and appliance hazards, macro photography scale with controlled depth of field, bright premium stylised 3D art, readable play path, HUD showing surface grip, heat, contamination, route timing and cargo freshness, no brand labels, 16:9.


### SCN-16 — Automated Factory Rebellion

**Core fantasy:** A fully automated factory becomes an enemy ecosystem of conveyors, robotic arms, scanners, presses, and sorting systems.

**Gameplay possibilities:** Stealth driving, sabotage, escape, machine possession, production rerouting.

**Camera:** Third-person action with tactical camera through machinery.

**Likely vehicles:** Maintenance cart, autonomous forklift, magnetic crawler, assembly-line hybrid.

**Environmental systems:** Conveyors, machine timing, security sensors, industrial robots, power routing.

**HUD implications:** Detection, machine cycle, override access, noise, route synchronization.

**Reusable image prompt:** A playable sci-fi factory infiltration screenshot, a small maintenance vehicle hiding beneath large robotic assembly arms while navigating moving conveyors, scanners, presses and sorting gates, multiple synchronized route windows, glossy industrial lighting, premium stylised 3D game art, third-person tactical framing, compact HUD showing detection, machine cycle timing, override access, noise and route synchronization, original factory design, 16:9.


### SCN-17 — Corporate Tower Extraction

**Core fantasy:** Vehicles move inside and outside a vertical corporate complex, using parking structures, elevators, glass offices, maintenance shafts, and facade routes.

**Gameplay possibilities:** Stealth extraction, data courier, hostage rescue, pursuit.

**Camera:** Top-down tactical indoors, chase camera outdoors.

**Likely vehicles:** Security cart, compact EV, wall crawler, executive hover pod.

**Environmental systems:** Access levels, cameras, elevators, alarms, breakable glass, crowds.

**HUD implications:** Access tier, camera cones, suspicion, elevator state, escape route.

**Reusable image prompt:** A playable near-future corporate tower extraction scene, a compact stealth vehicle crossing a polished office atrium while security cameras sweep visible cones, elevator banks, parking ramps and an exterior facade route offering alternate escape paths, restrained high-end architecture, premium stylised 3D art, partly isometric tactical camera, interface showing access tier, camera cones, suspicion, elevator state and escape route, no real corporate branding, 16:9.


### SCN-18 — Haunted Township Run

**Core fantasy:** Vehicles cross an abandoned town whose roads, buildings, signs, and geography change after dark.

**Gameplay possibilities:** Investigation, survival, delivery, chase, supernatural puzzle solving.

**Camera:** Moody chase camera with map distortion effects.

**Likely vehicles:** Old pickup, hearse-like utility car, lantern bike, ghost-powered carriage hybrid.

**Environmental systems:** Fog, shifting roads, possessed machinery, light as safety, unreliable map.

**HUD implications:** Sanity proxy, lantern charge, map confidence, pursuit distance, clue chain.

**Reusable image prompt:** A playable supernatural vehicle adventure screenshot in an abandoned township at night, an old customised pickup with protective lanterns driving through fog as street signs point in impossible directions and buildings subtly shift, distant spectral machinery following, road markings forming clues, atmospheric but gameplay-readable premium 3D art, chase camera, restrained HUD showing lantern charge, map confidence, pursuit distance, clue chain and vehicle condition, original horror tone without gore, 16:9.


### SCN-19 — Medieval Machine Kingdom

**Core fantasy:** Improvised mechanical vehicles exist in a fantasy kingdom of castles, villages, forests, monsters, and siege roads.

**Gameplay possibilities:** Questing, caravan escort, jousting race, siege support, crafting.

**Camera:** Third-person adventure camera.

**Likely vehicles:** Pedal cart, alchemical wagon, clockwork horse, siege crawler, dragon-glider hybrid.

**Environmental systems:** Magic weather, wooden bridges, monster territories, faction roads, alchemy fuel.

**HUD implications:** Quest route, faction standing, alchemy mix, armour, companion state.

**Reusable image prompt:** A playable fantasy vehicle adventure screenshot, an original clockwork wagon travelling toward a hilltop castle through a medieval village while a dragon-glider circles overhead, branching forest and siege-road routes, travellers and monster warning markers, warm painterly stylised 3D art with believable handcrafted mechanics, third-person adventure camera, HUD showing quest route, faction standing, alchemy fuel mixture, armour and companion state, no franchise references, 16:9.


### SCN-20 — Steampunk Sky City

**Core fantasy:** Airships, suspended roads, cable cars, propeller bikes, and floating foundries form a layered aerial city.

**Gameplay possibilities:** Air racing, courier work, salvage, faction combat, docking.

**Camera:** Wide aerial chase camera with altitude-aware composition.

**Likely vehicles:** Propeller bike, balloon truck, winged carriage, compact airship.

**Environmental systems:** Wind, altitude, lift, steam pressure, moving docks, cloud visibility.

**HUD implications:** Lift, steam pressure, altitude, docking alignment, wind corridor.

**Reusable image prompt:** A playable steampunk sky-city vehicle game screenshot, a compact propeller bike weaving between suspended roads, brass cable cars, floating foundries and airship docks above a sea of clouds, multiple height layers and wind corridors clearly visible, warm brass and cool sky contrast, premium original stylised 3D art, wide aerial chase camera, HUD showing lift, steam pressure, altitude, docking alignment and wind corridor, 16:9.


### SCN-21 — Cloud Island Homestead

**Core fantasy:** A calmer sky world mixes farming, exploration, transport, and weather management across floating islands.

**Gameplay possibilities:** Farming, bridge building, cargo flight, creature care, exploration.

**Camera:** Wide third-person with soft aerial transitions.

**Likely vehicles:** Glider tractor, balloon cart, cloud skiff, seed drone.

**Environmental systems:** Wind currents, cloud moisture, island drift, rain capture, aerial wildlife.

**HUD implications:** Wind map, moisture, cargo balance, island alignment, crop state.

**Reusable image prompt:** A playable cosy floating-island farming game screenshot, a glider-equipped tractor cultivating a small green island while balloon carts move supplies between neighbouring islands, visible rain collectors, drifting clouds, aerial creatures and temporary rope bridges, bright soft lighting, premium stylised 3D art, wide readable camera, calm HUD showing wind map, cloud moisture, cargo balance, island alignment and crop state, original setting, 16:9.


### SCN-22 — Alien Desert Survey

**Core fantasy:** An unknown planet is explored through geology, weather, biology, and ancient machine signals rather than constant combat.

**Gameplay possibilities:** Surveying, mapping, specimen collection, base deployment, anomaly investigation.

**Camera:** Third-person exploration with scanning overlays.

**Likely vehicles:** Six-wheel rover, hovering probe carrier, walking rig, deployable lab truck.

**Environmental systems:** Alien storms, low gravity, strange terrain, bio-signals, sensor uncertainty.

**HUD implications:** Terrain confidence, sample slots, radiation, signal triangulation, return range.

**Reusable image prompt:** A playable alien planetary survey screenshot, an original six-wheel rover crossing layered mineral dunes toward a distant geometric anomaly, deployable probes scanning strange plants, low-gravity dust arcs and a storm forming on the horizon, vast but navigable landscape, premium stylised science-fiction 3D art, third-person exploration camera, restrained HUD showing terrain confidence, sample capacity, radiation, signal triangulation and return range, 16:9.


### SCN-23 — Moon Mining Network

**Core fantasy:** A lunar industrial zone combines low-gravity traversal, resource logistics, habitat safety, and long-distance navigation.

**Gameplay possibilities:** Mining, hauling, infrastructure repair, crater racing, emergency rescue.

**Camera:** Wide low-gravity chase camera.

**Likely vehicles:** Pressurised rover, hopper truck, rail tug, jump-capable scout.

**Environmental systems:** Low gravity, dust, oxygen, communication delay, solar exposure, crater shadow.

**HUD implications:** Oxygen, comms strength, jump arc, payload, sunlight window.

**Reusable image prompt:** A playable moon mining game screenshot, pressurised rovers moving ore across a crater rim toward a modular habitat, one jump-capable scout airborne in low gravity, rail tug and solar fields visible, deep black sky and harsh shadow boundaries, premium stylised but physically grounded 3D art, wide chase camera, HUD showing oxygen, communication strength, jump arc, payload and sunlight window, original vehicle designs, 16:9.


### SCN-24 — Asteroid Salvage Belt

**Core fantasy:** Small ships and industrial rigs move between rotating asteroids, wrecks, cargo, and temporary anchors.

**Gameplay possibilities:** Zero-gravity salvage, towing, mining, rescue, pirate evasion.

**Camera:** Free-orbit third-person camera with orientation aids.

**Likely vehicles:** Salvage tug, mining pod, magnetic crawler, cargo frame, interceptor.

**Environmental systems:** Momentum, rotation, tether physics, debris, limited fuel, line-of-sight.

**HUD implications:** Relative velocity, anchor status, tether tension, fuel, collision prediction.

**Reusable image prompt:** A playable asteroid salvage game screenshot, a compact industrial tug tethered to a rotating wreck while a magnetic crawler moves across the surface, cargo frames floating nearby, multiple asteroids creating navigation lanes, strong scale and orientation cues, premium original 3D science-fiction art, free-orbit camera, practical HUD showing relative velocity, anchor status, tether tension, fuel and collision prediction, 16:9.


### SCN-25 — Orbital Station Breach

**Core fantasy:** Vehicle gameplay inside a damaged orbital station uses centrifugal gravity, vacuum sectors, maintenance tubes, and exterior hull routes.

**Gameplay possibilities:** Emergency repair, evacuation, stealth, containment, zero-g transition.

**Camera:** Third-person with smooth gravity-orientation shifts.

**Likely vehicles:** Maintenance rover, magnetic wheel cart, sealed rescue pod, exterior crawler.

**Environmental systems:** Gravity changes, decompression, rotating architecture, fire, power isolation.

**HUD implications:** Pressure, gravity orientation, oxygen, seal integrity, station rotation.

**Reusable image prompt:** A playable orbital station emergency screenshot, a sealed maintenance rover transitioning from a rotating gravity ring into a zero-gravity breach corridor, exposed exterior hull route visible through damaged panels, emergency lights, floating debris and compartment doors, premium original sci-fi 3D art, camera clearly communicates orientation change, HUD showing pressure, gravity orientation, oxygen, seal integrity and station rotation, 16:9.


### SCN-26 — Wormhole Sprint

**Core fantasy:** A highly abstract race through unstable spatial tunnels where route choice changes physics and vehicle form.

**Gameplay possibilities:** Time trial, transformation, risk routing, pattern recognition.

**Camera:** Forward chase camera with controlled visual distortion.

**Likely vehicles:** Adaptive racer, energy bike, folding craft, multi-form vehicle.

**Environmental systems:** Gravity shifts, time dilation, colour-coded physics zones, fragmentation.

**HUD implications:** Stability, route probability, transformation state, time delta, energy.

**Reusable image prompt:** A playable abstract science-fiction racing screenshot inside an unstable wormhole, an adaptive original vehicle changing shape while choosing between branching spatial tunnels, geometric gravity fields, debris frozen at different time rates and clear colour-coded route logic, spectacular but gameplay-readable premium 3D art, forward chase camera, minimal HUD showing stability, route probability, transformation state, time delta and energy, 16:9.


### SCN-27 — Post-Collapse Metro

**Core fantasy:** A ruined city supports survival, rebuilding, faction trade, underground routes, and improvised transport.

**Gameplay possibilities:** Scavenging, settlement support, convoy, defence, exploration.

**Camera:** Third-person open-world with tactical settlement map.

**Likely vehicles:** Improvised van, armoured bus, bike, rail cart, mobile generator.

**Environmental systems:** Collapsed roads, underground tunnels, factions, scarcity, weather, repair.

**HUD implications:** Supplies, settlement needs, noise, vehicle wear, reputation.

**Reusable image prompt:** A playable post-collapse city vehicle game screenshot, an improvised armoured bus crossing a broken avenue toward a survivor settlement while bikes scout subway entrances and a mobile generator powers street lights, collapsed overpasses create layered routes, grounded resource-focused tone, premium stylised 3D art, third-person camera, HUD showing supplies, settlement needs, noise, vehicle wear and faction reputation, no franchise resemblance, 16:9.


### SCN-28 — Living Bio-World

**Core fantasy:** Vehicles travel across or inside a gigantic living organism where roads pulse, surfaces heal, and biology replaces machinery.

**Gameplay possibilities:** Exploration, cleansing, harvesting, defence, symbiotic upgrading.

**Camera:** Third-person with macro-biological scale.

**Likely vehicles:** Symbiotic crawler, membrane skimmer, spore bike, organ-pod carrier.

**Environmental systems:** Pulsing terrain, immune response, fluid currents, healing surfaces, mutation.

**HUD implications:** Symbiosis, contamination, pulse timing, adaptation slots, route stability.

**Reusable image prompt:** A playable surreal biological vehicle adventure screenshot inside a colossal living world, an original symbiotic crawler moving along translucent tissue bridges above flowing luminous fluids, immune-cell creatures approaching, paths slowly healing behind the vehicle, strange but readable traversal landmarks, premium stylised organic 3D art, third-person camera, HUD showing symbiosis, contamination, pulse timing, adaptation slots and route stability, non-gory imaginative tone, 16:9.


## 4. HUD and Information-System Directions

### HUD-01 — Minimal Diegetic Driver HUD

**Design goal:** Keep information inside the world through dashboard lights, projected route lines, physical gauges, vehicle sounds, and visible damage.

**Best fit:** Immersive exploration, grounded racing, survival.

**Main trade-off:** Low cognitive clutter; difficult when many strategic systems must be shown.

**Reusable image prompt:** A clean UI concept board for a diegetic vehicle HUD: dashboard-mounted speed and heat gauges, route projected onto the road, damage visible on vehicle surfaces, audio-direction indicators integrated into mirrors, subtle objective light beacons in the world, day and night variants, cockpit and third-person examples, premium original game interface design, labelled callouts, dark neutral presentation board, 16:9.


### HUD-02 — Arcade Race HUD

**Design goal:** Prioritise speed, position, boost, route, time, drift chain, and rival distance.

**Best fit:** High-speed races and time trials.

**Main trade-off:** Excellent instant readability; can feel generic unless the shape language is distinctive.

**Reusable image prompt:** A polished arcade racing HUD exploration board for an original browser game, showing chase-camera screenshot plus separated components: circular speedometer, boost heat, position, lap, route ribbon, rival proximity, drift multiplier, shortcut warning and finish timing, three density variants from minimal to tournament mode, bold kinetic typography, readable at small size, no existing franchise styling, 16:9.


### HUD-03 — Tactical Combat HUD

**Design goal:** Expose threat direction, armour sectors, weapon heat, target priority, ability state, cover, and extraction information.

**Best fit:** Vehicle combat, extraction, wave defence.

**Main trade-off:** Supports decisions; risks overwhelming players during fast motion.

**Reusable image prompt:** A tactical vehicle-combat HUD design board, original interface language, central reticle with target prediction, segmented vehicle armour diagram, directional threat ring, weapon heat and ammo, ability cooldowns, objective route, extraction timer and ally status, showing normal, damaged, low-ammo and boss-target states, premium dark interface with restrained accent colours, readable labels, 16:9.


### HUD-04 — Farm Operations HUD

**Design goal:** Turn machinery status, crop condition, attachment configuration, soil data, and schedule into calm operational feedback.

**Best fit:** Farming, construction, logistics.

**Main trade-off:** Rich management without aggressive visual noise.

**Reusable image prompt:** A premium agricultural vehicle HUD board for an original game, showing a tractor gameplay screenshot and modular widgets for soil moisture, crop stage, attachment depth, seed or fertiliser flow, fuel, machinery wear, weather forecast, field task queue and route coverage, calm high-legibility interface, daylight and night-work variants, practical iconography, no real machinery branding, 16:9.


### HUD-05 — Survival Systems HUD

**Design goal:** Communicate heat, cold, oxygen, fuel, shelter, vehicle condition, crew state, and uncertain navigation.

**Best fit:** Expeditions, rescue, harsh environments.

**Main trade-off:** Good tension; should avoid becoming a spreadsheet.

**Reusable image prompt:** A survival vehicle HUD exploration board, showing environmental status as an integrated ring around a compact vehicle silhouette: temperature, oxygen, fuel, hull or chassis condition, traction, crew state, shelter distance and navigation confidence, with whiteout, underwater, desert heat and vacuum variants, premium original interface, readable but restrained, 16:9.


### HUD-06 — Convoy Command HUD

**Design goal:** Show formation, role, spacing, route risk, supply levels, damage, and orders across multiple vehicles.

**Best fit:** Escort, logistics, mobile base gameplay.

**Main trade-off:** Makes the convoy feel like a system; may require pausing or slow time.

**Reusable image prompt:** A convoy-command HUD design board for an original vehicle game, wide gameplay view with formation overlays, vehicle role icons, spacing lines, lead and rear threat warnings, fuel range, shared cargo, damage summary, route-risk forecast and quick formation orders, show chase view and tactical overview states, premium readable interface, 16:9.


### HUD-07 — Exploration Scanner HUD

**Design goal:** Layer optional scanning, terrain confidence, samples, anomalies, route memory, and sensor ambiguity.

**Best fit:** Alien survey, archaeology, underwater exploration.

**Main trade-off:** Encourages observation; overuse can turn every world into coloured overlays.

**Reusable image prompt:** A scientific exploration scanner HUD board for an original vehicle game, showing terrain scan, uncertain geometry, anomaly triangulation, sample inventory, signal strength, route memory, environmental hazards and return range, with toggled normal view versus scan view, transparent overlays that preserve world art, premium restrained science-fiction interface, 16:9.


### HUD-08 — Toy and Playful HUD

**Design goal:** Use stickers, wind-up meters, collectible trails, expressive icons, and physical toy metaphors.

**Best fit:** Toy worlds, child-friendly modes, light competition.

**Main trade-off:** Strong personality; can undermine serious modes if used globally.

**Reusable image prompt:** A playful toy-vehicle HUD exploration board, chunky sticker-like gauges for wind-up energy, stunt chain, collectible trail, hidden path hints, toy damage and giant-world alerts, physical button shapes, cardboard and plastic textures, screenshot examples in bedroom and kitchen miniature worlds, cheerful but sophisticated original game UI, 16:9.


### HUD-09 — Holographic Sci-Fi HUD

**Design goal:** Use spatial markers, vehicle holograms, orbital paths, relative velocity, and predictive trajectories.

**Best fit:** Space, hover, advanced technology.

**Main trade-off:** Supports 3D navigation; easily becomes decorative noise.

**Reusable image prompt:** A premium holographic HUD board for original space and hover vehicles, showing relative velocity, projected trajectory, collision prediction, tether tension, hull sections, energy routing, target lead, docking alignment and 3D objective markers, clean spatial design, transparent layers over a dark space screenshot, multiple alert states, no franchise visual language, 16:9.


### HUD-10 — Card-Driven Ability HUD

**Design goal:** Represent attachments, temporary powers, contracts, and combos as a small tactical deck.

**Best fit:** Hybrid action-strategy, roguelite runs, vehicle mutations.

**Main trade-off:** Creates build expression; can feel disconnected from driving if cards dominate.

**Reusable image prompt:** A vehicle action game HUD board integrating a compact ability-card hand with real-time driving: three attachment cards, one emergency card, combo meter, energy cost, cooldown state, upgrade rarity and context-sensitive card replacement, gameplay screenshot plus isolated components, premium original interface, tactile cards without resembling a known card game, 16:9.


### HUD-11 — Co-op Crew HUD

**Design goal:** Expose driver, gunner, navigator, engineer, and support responsibilities without duplicating every indicator.

**Best fit:** Local or online cooperative vehicles.

**Main trade-off:** Strong role clarity; requires role-aware layouts.

**Reusable image prompt:** A cooperative crew HUD concept board for a multi-role vehicle game, separate but visually related layouts for driver, gunner, navigator and engineer, shared objective and vehicle integrity at the centre, role-specific controls, alerts and communication pings, show four small screen examples and one combined vehicle state panel, premium original UX design, 16:9.


### HUD-12 — Adaptive Cross-Mode HUD

**Design goal:** A shared framework where modules appear, disappear, or transform when gameplay shifts between farming, racing, combat, exploration, and management.

**Best fit:** The core multi-mode product.

**Main trade-off:** Essential for coherence; difficult to design without explicit hierarchy rules.

**Reusable image prompt:** A systems-oriented adaptive HUD design board for an original multi-mode vehicle game, one base interface transforming across race, farming, combat, exploration and convoy states, consistent anchor positions and icon grammar, modules smoothly replaced rather than stacked, before-and-after examples, hierarchy rules, shared vehicle status core, premium production-ready interface thinking, 16:9.


## 5. Rig and Vehicle-Family Directions

### RIG-01 — Pedal and Cycle Family

**Fantasy:** Bicycles, cargo cycles, trikes, monocycles and pedal-powered fantasy machines.

**Modular systems:** Frames, wheels, gearing, cargo racks, suspension, handlebar tools, battery assist.

**Silhouette:** Light, narrow, exposed silhouette.

**Progression role:** Cheap entry class, precision traversal, endurance builds.

**Reusable image prompt:** An original vehicle rig design sheet showing a modular bicycle family: racing bike, cargo trike, off-road cycle, armoured survival trike and futuristic mono-wheel variant, front side rear three-quarter views, shared frame connection points, wheels, gearing, cargo, suspension and tool attachments, readable silhouettes, stylised production concept art, neutral background, labelled callouts, 16:9.


### RIG-02 — Motorbike Family

**Fantasy:** Street, dirt, courier, combat and hover-transition bikes.

**Modular systems:** Engine, battery, tyres, forks, fairings, saddle, storage, weapons, stabilisers.

**Silhouette:** Aggressive lean, exposed rider relationship.

**Progression role:** Speed and skill class with high risk.

**Reusable image prompt:** A production-oriented modular motorbike concept sheet for an original game, five variants built from one rig: neon street racer, rooftop courier, dirt explorer, armoured combat bike and hover-transition bike, orthographic and three-quarter views, attachment hardpoints, wheel and fork variants, storage, armour and energy modules, premium stylised 3D concept rendering, clear labels, 16:9.


### RIG-03 — Toy Vehicle Family

**Fantasy:** Pull-back cars, block vehicles, wind-up machines and improvised household toys.

**Modular systems:** Toy chassis, spring motor, plastic wheels, stickers, detachable blocks, magnets.

**Silhouette:** Chunky, readable, playful silhouettes.

**Progression role:** Collectible, highly customisable, suited to miniature worlds.

**Reusable image prompt:** An original toy vehicle customization sheet, modular pull-back car, block-built buggy, wind-up truck, magnetic wall crawler and toy rescue van, colourful plastic, wood and cardboard materials, interchangeable wheels, springs, stickers, magnets and block attachments, front side rear views plus exploded parts, playful premium concept art, no commercial toy branding, 16:9.


### RIG-04 — Compact Car Family

**Fantasy:** Hatchbacks, rally cars, couriers, city survivors and hover conversions.

**Modular systems:** Chassis, engine, battery, tyres, body panels, cargo, armour, aero, utility.

**Silhouette:** Familiar base made distinctive through modularity.

**Progression role:** Versatile generalist family.

**Reusable image prompt:** A modular compact-car design sheet for an original game, one recognisable base chassis transformed into city racer, rally car, courier EV, survival armour build and partial hover conversion, orthographic views, exploded attachment system, body panel swaps, cargo modules, armour, aero and utility tools, premium stylised industrial design, clean labelled presentation, 16:9.


### RIG-05 — Truck and Pickup Family

**Fantasy:** Utility pickups, armoured haulers, tow trucks, rescue and mobile workshops.

**Modular systems:** Cab, bed, suspension, tyres, crane, tow, fuel, armour, tools, crew modules.

**Silhouette:** Strong functional rear silhouette.

**Progression role:** Heavy utility and convoy backbone.

**Reusable image prompt:** An original modular truck concept board showing utility pickup, recovery tow truck, armoured convoy truck, rescue carrier and mobile workshop, shared cab and frame language, rear module interchange, crane, winch, fuel, armour and tool options, orthographic plus action three-quarter views, premium production concept art, clear scale reference, 16:9.


### RIG-06 — Agricultural Machine Family

**Fantasy:** Tractors, harvesters, seeders, irrigation rovers and farm-defence conversions.

**Modular systems:** Power unit, wheel or track sets, hitches, crop tools, storage, lights, defensive attachments.

**Silhouette:** Large wheels, visible work attachments.

**Progression role:** Economy, production and territory defence.

**Reusable image prompt:** A detailed original agricultural vehicle rig sheet, modular tractor core supporting plough, seeder, harvester, irrigation, cargo and night-defence configurations, large wheel and track options, hitch standards, floodlights, protective cages and improvised non-real-world attachments, orthographic and exploded diagrams, premium stylised 3D concept design, 16:9.


### RIG-07 — Heavy Construction Family

**Fantasy:** Bulldozers, excavators, cranes, loaders and bridge-laying machines.

**Modular systems:** Track base, hydraulic arms, buckets, blades, cranes, stabilisers, power tools.

**Silhouette:** Massive grounded silhouette.

**Progression role:** Terrain manipulation, construction, rescue, siege.

**Reusable image prompt:** A modular heavy-construction vehicle concept sheet for an original game, one tracked power base configured as bulldozer, excavator, crane, loader and bridge-layer, visible hydraulic logic, interchangeable arms and tools, stabilisers, armour and utility modules, orthographic views and functional diagrams, premium stylised industrial art, 16:9.


### RIG-08 — Amphibious Family

**Fantasy:** Vehicles that transition between roads, shallow water, deep water and marsh.

**Modular systems:** Sealed chassis, propellers, jets, pontoons, adjustable suspension, rescue gear.

**Silhouette:** Broad stable body with transformable lower section.

**Progression role:** Rescue and flexible traversal.

**Reusable image prompt:** An original amphibious vehicle design board, modular utility truck transforming between road, shallow-water, deep-water and marsh configurations, retractable wheels, pontoons, water jets, rescue raft, cargo and stabiliser modules, front side rear and transformation sequence, premium stylised functional concept art, 16:9.


### RIG-09 — Hover Family

**Fantasy:** Ground-skimming racers, cargo sleds, combat skimmers and alien survey craft.

**Modular systems:** Lift units, stabilisers, energy core, directional fins, cargo, shields, weapons.

**Silhouette:** Floating clean underside and wide stance.

**Progression role:** Fast terrain-independent traversal with energy management.

**Reusable image prompt:** A modular hovercraft family concept sheet for an original game, compact race skimmer, cargo sled, armoured combat hovercraft, alien survey platform and luxury city pod, shared lift-unit language, energy core, fins, shields and attachments, orthographic and underside views, premium original science-fiction industrial design, 16:9.


### RIG-10 — Rail and Train Family

**Fantasy:** Small rail carts, modular trains, armoured locomotives and track-laying vehicles.

**Modular systems:** Engine, carriages, cargo, turrets, repair car, habitat car, track tools.

**Silhouette:** Long compositional silhouette.

**Progression role:** Mobile base, logistics and route ownership.

**Reusable image prompt:** An original modular train rig board for a vehicle game, compact rail cart evolving into cargo train, armoured convoy locomotive, mobile settlement and track-laying expedition train, interchangeable cars for workshop, habitat, defence, fuel and storage, side profiles, coupling system and three-quarter action view, premium stylised concept art, 16:9.


### RIG-11 — Air and Glider Family

**Fantasy:** Gliders, propeller bikes, small planes, balloons and transformable road-air vehicles.

**Modular systems:** Wings, rotors, lift cells, control surfaces, landing gear, cargo, engines.

**Silhouette:** Clear aerial profile and transformation logic.

**Progression role:** Vertical mobility and weather gameplay.

**Reusable image prompt:** A production concept sheet for an original modular aerial vehicle family: glider bike, propeller courier, compact cargo plane, balloon tractor and road-to-air transforming vehicle, shared control surfaces and engine modules, folded and deployed states, orthographic views, premium stylised design, readable mechanical logic, 16:9.


### RIG-12 — Rocket and Spacecraft Family

**Fantasy:** Launch vehicles, orbital tugs, landers, interceptors and long-range ships.

**Modular systems:** Thrusters, tanks, heat shields, docking, cargo, habitat, weapons, sensors.

**Silhouette:** Strong propulsion axis and modular mission sections.

**Progression role:** Planet-to-space progression.

**Reusable image prompt:** An original modular spacecraft rig design board, small reusable rocket, lunar lander, orbital tug, asteroid salvage craft, interceptor and long-range exploration ship built from shared module standards, thrusters, tanks, docking rings, cargo, habitat and sensor sections, orthographic and exploded views, premium clean science-fiction industrial design, 16:9.


### RIG-13 — Mech-Vehicle Hybrid Family

**Fantasy:** Machines that shift between wheeled, tracked, walking and climbing modes.

**Modular systems:** Legs, wheels, tracks, articulated joints, stabilisers, manipulators, armour.

**Silhouette:** Transformable silhouette with visible mode logic.

**Progression role:** Extreme terrain and utility rather than humanoid combat alone.

**Reusable image prompt:** An original mech-vehicle hybrid concept board, one modular machine transforming between six-wheel rover, tracked crawler, four-legged walker and wall-climbing maintenance mode, clear joint and wheel deployment logic, cargo manipulator and utility attachments, orthographic transformation steps, premium stylised hard-surface concept art, no franchise resemblance, 16:9.


### RIG-14 — Creature-Vehicle Hybrid Family

**Fantasy:** Living or symbiotic mounts with mechanical modules.

**Modular systems:** Biological chassis, saddle, armour, energy organs, cargo pods, tools, sensory modules.

**Silhouette:** Organic asymmetric silhouette.

**Progression role:** Fantasy, alien and bio-world progression.

**Reusable image prompt:** A tasteful original creature-vehicle hybrid design sheet, several non-humanoid symbiotic transport forms combined with modular saddles, armour, cargo pods, tools and sensory devices, exploration, farming and combat variants, biological connection points explained, painterly premium concept art, neutral background, imaginative but not grotesque, 16:9.


### RIG-15 — Improvised Scrap Family

**Fantasy:** Vehicles built from salvaged panels, appliances, pipes, engines and unrelated machines.

**Modular systems:** Frames, mismatched wheels, exposed engines, welded armour, improvised tools.

**Silhouette:** Asymmetrical story-rich silhouettes.

**Progression role:** Crafting expression and post-collapse identity.

**Reusable image prompt:** An original improvised scrap-vehicle concept board, bicycle-engine buggy, appliance-armoured van, pipe-frame tow truck, generator cart and patched amphibious machine, visible hand-built construction logic, mismatched wheels, welded panels, exposed engines and modular scavenged tools, orthographic and three-quarter views, premium stylised concept art, 16:9.


### RIG-16 — Legendary Transforming Rig

**Fantasy:** A rare endgame vehicle that preserves one identity while shifting between land, water, air and space roles.

**Modular systems:** Core cockpit, transformation spine, wheel modules, lift surfaces, sealed hull, boosters.

**Silhouette:** Iconic central silhouette with recognisable core across forms.

**Progression role:** Long-term aspiration and mastery challenge.

**Reusable image prompt:** A flagship original transforming vehicle concept sheet for a long-term game, one iconic core cockpit and chassis shifting through land racer, amphibious craft, aerial glider and compact orbital form, transformation sequence must be mechanically readable, shared colour blocking and silhouette identity, premium production-grade 3D concept art, orthographic states and close-up connection details, no resemblance to existing transforming franchises, 16:9.


## 6. Map and World-Structure Directions

### MAP-01 — Hub-and-Spoke Region

**Structure:** A safe central settlement connects to increasingly dangerous themed zones.

**Strength and risk:** Strong onboarding and readable progression; risks repetition if every mission returns to hub.

**Key map elements:** Road gates, faction quarters, garage, markets, world exits.

**Reusable image prompt:** A stylised top-down game world map for an original vehicle adventure, central settlement hub with garage, market, faction districts and repair yards, roads branching to farm, forest, desert, mountain and ruined-city zones, visible progression gates and alternate connectors, readable landmarks, premium illustrated map UI, no text clutter, 16:9.


### MAP-02 — Continuous Open World

**Structure:** One connected landmass where biome, economy and danger shift gradually.

**Strength and risk:** Strong immersion; difficult content density and streaming requirements.

**Key map elements:** Natural barriers, long roads, settlements, weather fronts, shortcuts.

**Reusable image prompt:** A detailed top-down open-world map concept for a vehicle game, one continuous landmass transitioning naturally from city to farm, forest, mountains, desert and coast, major roads, hidden tracks, settlements, industrial sites, weather fronts and long-distance routes, clear biome blending and traversal logic, premium original cartographic game art, 16:9.


### MAP-03 — Layered Vertical City

**Structure:** Street, rooftop, underground, elevated rail and interior routes overlap.

**Strength and risk:** High reuse and mastery; navigation readability is the main risk.

**Key map elements:** Elevators, ramps, facade routes, parking structures, tunnels, transit lines.

**Reusable image prompt:** A multi-layer city map design board for an original vehicle game, same district shown as street level, underground tunnels, parking structures, elevated roads, rooftops and interior shortcuts, clear colour-coded connections and vertical transitions, tactical but attractive premium map UI, readable without dense labels, 16:9.


### MAP-04 — Procedural Road Network

**Structure:** Roads, events, hazards and rewards form a different run each session.

**Strength and risk:** Replayability and roguelite structure; must preserve memorable landmarks.

**Key map elements:** Nodes, branching roads, route modifiers, moving threats, repair stops.

**Reusable image prompt:** A procedural route map UI for an original vehicle roguelite, branching road network generated across varied biomes, nodes for repair, combat, trade, weather, mystery, boss and safe camp, route modifiers and visible risk-reward choices, several generated examples side by side, premium original interface design, 16:9.


### MAP-05 — Convoy Corridor

**Structure:** A long linear migration route with tactical detours, supply loops and moving threats.

**Strength and risk:** Good campaign momentum; less freedom than open world.

**Key map elements:** Fuel stops, ambush zones, bypasses, bridge repairs, mobile camp positions.

**Reusable image prompt:** A strategic convoy campaign map for an original vehicle game, long route crossing desert, mountains, towns and ruined infrastructure, main corridor with tactical detours, fuel stops, repair sites, ambush risk, blocked bridges and moving enemy fronts, convoy position clearly shown, premium illustrated map interface, 16:9.


### MAP-06 — Farm Parcel Grid

**Structure:** Fields, water, buildings, roads and ownership form an evolving production map.

**Strength and risk:** Supports planning and optimisation; can look sterile without terrain personality.

**Key map elements:** Field boundaries, crop rotation, irrigation, animal routes, machinery sheds.

**Reusable image prompt:** A premium farm management map UI for a vehicle game, irregular field parcels, crop stages, soil condition, irrigation channels, roads, barns, machinery sheds, animal routes and expansion plots, seasonal overlay examples and vehicle task routes, clear practical cartography with natural terrain texture, 16:9.


### MAP-07 — Tactical Arena

**Structure:** A compact combat space with lanes, cover, destructible terrain, capture points and elevation.

**Strength and risk:** Strong repeatable matches; needs multiple tactical identities.

**Key map elements:** Spawn zones, objective rings, ramps, cover, hazards, flank routes.

**Reusable image prompt:** A top-down tactical vehicle arena map concept, compact original battlefield with three primary lanes, multiple flank routes, elevation ramps, destructible cover, hazard zones, capture points and extraction exits, clear red and blue readability without excessive esports branding, premium game map presentation, 16:9.


### MAP-08 — Floating Island Network

**Structure:** Separate islands drift, connect temporarily and change route availability with weather.

**Strength and risk:** Visually distinctive systemic world; complex navigation state.

**Key map elements:** Wind corridors, rope bridges, air docks, cloud layers, moving islands.

**Reusable image prompt:** A top-down floating-island world map for an original vehicle game, dozens of varied islands connected by temporary bridges, wind corridors, air routes and cloud layers, island drift arrows, farms, ruins, settlements and storm zones, readable vertical depth and changing connections, premium illustrated fantasy map UI, 16:9.


### MAP-09 — Planetary Sector Map

**Structure:** A planet is divided by terrain, weather, resources, signal coverage and travel windows.

**Strength and risk:** Supports expedition planning; needs a useful surface-to-local zoom transition.

**Key map elements:** Landing zones, survey routes, storms, resources, bases, anomalies.

**Reusable image prompt:** A planetary exploration map interface for an original vehicle game, globe and regional surface views showing landing zones, rover routes, resource fields, storm movement, communication coverage, bases and anomalies, zoom transition panels from orbit to local terrain, premium clean science-fiction cartography, 16:9.


### MAP-10 — Orbital Node Network

**Structure:** Stations, moons, asteroid fields, jump routes and time-dependent windows form a 3D travel graph.

**Strength and risk:** Good strategic navigation; must communicate depth and motion clearly.

**Key map elements:** Orbits, transfer windows, fuel ranges, hazards, faction control.

**Reusable image prompt:** A 3D orbital navigation map UI for an original space vehicle game, planet, moons, stations, asteroid fields and jump gates connected by transfer paths, moving orbital positions, fuel-range bubbles, hazard volumes and faction zones, perspective and flattened views compared, premium original holographic interface, 16:9.


## 7. Major UI and Screen Directions

### UI-01 — Garage / Rig Bay

**Purpose:** The main place to inspect, assemble, test and understand a vehicle.

**Core contents:** Large manipulable vehicle, part slots, stats, comparison, test button, saved builds.

**Reusable image prompt:** A premium vehicle garage screen concept for an original browser game, large interactive vehicle at centre in a functional workshop, category rail for chassis, wheels, engine, armour, tools and cosmetics, selected part details, before-after stats, compatibility warnings, saved builds and test-drive action, clear hierarchy, rich 3D lighting, production-oriented UI, 16:9.


### UI-02 — World and Contract Board

**Purpose:** Choose what to do without reducing the world to a generic mission list.

**Core contents:** Map, local opportunities, relationships, weather, deadlines, rewards, route previews.

**Reusable image prompt:** A world-contract selection screen for an original multi-mode vehicle game, regional map with visible live opportunities for race, farm work, rescue, convoy, salvage and exploration, each contract showing route, weather, deadline, risk, faction and reward, contextual preview art, premium readable interface, not a generic mobile card grid, 16:9.


### UI-03 — Vehicle Collection Gallery

**Purpose:** Show ownership, lineage, rarity and functional differences across a growing collection.

**Core contents:** Families, silhouettes, unlock paths, mastery, favourite builds, missing discoveries.

**Reusable image prompt:** A premium vehicle collection gallery screen, original rigs organised by families from cycles and toy cars to tractors, trucks, hovercraft and spacecraft, strong silhouette cards, owned and undiscovered states, mastery progress, build count, lineage connections and featured favourite vehicle, sophisticated game UI, 16:9.


### UI-04 — Upgrade and Research Tree

**Purpose:** Connect mechanical upgrades to real gameplay consequences rather than abstract stat inflation.

**Core contents:** Branches, prerequisites, physical part changes, test comparisons, trade-offs.

**Reusable image prompt:** An original vehicle upgrade and research screen, branching system tied to visible physical changes on the vehicle, mobility, utility, defence, energy and specialist paths, before-after simulation panels, explicit trade-offs and prerequisites, clear progression without excessive glowing nodes, premium production UI, 16:9.


### UI-05 — Run Preparation Screen

**Purpose:** Make route, environment, contract and loadout decisions before deployment.

**Core contents:** Vehicle choice, attachments, cargo, crew, forecast, route, risk, insurance or recovery plan.

**Reusable image prompt:** A run-preparation screen for an original vehicle adventure game, chosen vehicle and attachments on the left, route and weather in the centre, cargo, crew roles, fuel, risk, recovery plan and contract goals on the right, clearly expose meaningful trade-offs, premium cohesive interface, 16:9.


### UI-06 — Post-Run Debrief

**Purpose:** Explain what happened, what was earned, what changed, and what the player can learn.

**Core contents:** Route replay, damage, resources, mastery, discoveries, failures, next decisions.

**Reusable image prompt:** A premium post-run debrief screen for an original vehicle game, route replay map, event timeline, vehicle damage diagram, resources gained and lost, mastery progress, discoveries, contract outcome, notable decisions and recommended repairs, analytical but visually engaging, 16:9.


### UI-07 — Map Editor / Mode Creator

**Purpose:** Let players or developers assemble terrain, routes, objectives, hazards and rules.

**Core contents:** Scene hierarchy, asset library, terrain tools, spline roads, objective graph, playtest.

**Reusable image prompt:** A sophisticated browser-based vehicle game editor interface, 3D viewport with roads, terrain and vehicles, left asset and prefab library, right properties and rule graph, bottom timeline or playtest controls, tools for spline roads, spawn points, objectives, hazards, weather and AI routes, premium practical UX, 16:9.


### UI-08 — Living World Dashboard

**Purpose:** Show the state of farms, settlements, convoys, factions, weather and active threats across time.

**Core contents:** World simulation, alerts, trends, dependencies, player influence.

**Reusable image prompt:** A living-world operations dashboard for an original vehicle game, regional map plus panels for settlements, farms, convoy movement, weather, faction control, resource flow and emerging threats, clearly show how player actions change systems over time, premium information design, not a corporate analytics dashboard, 16:9.


## 8. Rendering and Art-Direction Options

### STYLE-01 — Stylised PBR Adventure

**Visual language:** Readable exaggerated forms with physically based materials and cinematic light.

**Where it works:** Broadest long-term fit; scalable from farm to space.

**Main risk:** Can look generic without a distinctive shape language.

**Reusable image prompt:** A visual style exploration board for an original multi-world vehicle game using stylised physically based 3D rendering, exaggerated readable vehicle proportions, rich materials, cinematic but gameplay-safe lighting, examples across city, farm, desert and alien planet, consistent art direction and UI accents, production-minded concept board, 16:9.


### STYLE-02 — Painterly 3D

**Visual language:** 3D geometry with hand-painted surfaces, soft edges, selective detail and atmospheric colour.

**Where it works:** Strong storybook identity and broad environment flexibility.

**Main risk:** Fine mechanical customisation may become visually muddy.

**Reusable image prompt:** A painterly 3D style board for an original vehicle adventure, hand-painted surfaces over clear 3D forms, soft atmospheric edges, selective mechanical detail, expressive skies and terrain, examples of tractor farm, desert convoy, fantasy kingdom and floating islands, cohesive UI treatment, premium concept art, 16:9.


### STYLE-03 — Graphic Cel-Shaded

**Visual language:** Hard-edged lighting, bold shapes, ink-like accents and high motion clarity.

**Where it works:** Excellent action readability and performance potential.

**Main risk:** Can clash with cosy simulation unless softened.

**Reusable image prompt:** A graphic cel-shaded visual direction board for an original vehicle game, bold silhouettes, crisp shadow bands, controlled outline accents, dynamic speed effects, examples of city race, tactical combat, farm machinery and space chase, interface using matching graphic shapes, mature original art direction, 16:9.


### STYLE-04 — Miniature Diorama

**Visual language:** Worlds look handcrafted as physical table-top sets with tilt-shift scale cues.

**Where it works:** Ideal for toy worlds, farms, towns and tactical maps.

**Main risk:** Large-scale cosmic scenes may feel less convincing.

**Reusable image prompt:** A miniature diorama style exploration board for an original vehicle game, handcrafted-looking physical sets, tilt-shift depth, model terrain, painted vehicles and tactile materials, examples of farm, town, desert convoy and tactical arena, visible but subtle model-making detail, premium playful presentation, 16:9.


### STYLE-05 — Clean Low-Poly

**Visual language:** Intentional geometric reduction, strong colour blocking and low texture dependence.

**Where it works:** Browser performance and rapid content production.

**Main risk:** Can feel cheap if lighting, proportions and composition are weak.

**Reusable image prompt:** A premium clean low-poly art-direction board for an original browser vehicle game, deliberate geometric forms, strong silhouettes, restrained texture use, sophisticated lighting and colour blocking, examples across city, farm, snow and alien biomes, polished interface and VFX proving low-poly can feel high quality, 16:9.


### STYLE-06 — Voxel Systems World

**Visual language:** Terrain, vehicles and destruction use modular volumetric blocks without becoming a clone of known voxel games.

**Where it works:** Construction, destruction, procedural worlds and player creation.

**Main risk:** Vehicle curves and premium material feel are harder.

**Reusable image prompt:** An original voxel-based vehicle game style board, modular volumetric terrain and machinery, destructible roads, buildable bridges, farms, cities and alien geology, vehicles designed with a unique refined voxel grammar rather than copying known games, strong lighting, readable UI and production-quality presentation, 16:9.


### STYLE-07 — Retro-Futurist Illustration

**Visual language:** 1960s–1980s industrial optimism, bold print colour, analogue displays and speculative vehicles.

**Where it works:** Strong identity for sci-fi and advertising-like worldbuilding.

**Main risk:** May limit medieval, cosy or realistic modes.

**Reusable image prompt:** A retro-futurist visual direction board for an original vehicle game, optimistic speculative machinery, bold printed colour fields, analogue gauges, brushed metal and illustrated travel-poster influence, examples of city transport, moon rover, orbital tug and desert expedition, cohesive original UI language, 16:9.


### STYLE-08 — Grounded Cinematic Realism

**Visual language:** Believable scale, materials, weather and machinery, with controlled cinematic framing.

**Where it works:** Rescue, farming, logistics and serious survival.

**Main risk:** Content cost, performance cost and weaker fit for absurd vehicles.

**Reusable image prompt:** A grounded cinematic realism style board for an original vehicle simulation-adventure, physically believable machinery, weather, scale, terrain deformation and lighting, examples of farm operation, flood rescue, polar expedition and storm port, clear gameplay readability rather than film stills, restrained professional HUD, 16:9.


## 9. Exploration Board Formats

### BRD-01 — Scene Variety Board

**Use:** Compare many worlds quickly without committing to one.

**Reusable image prompt:** A premium visual exploration board for an original multi-mode vehicle game, twelve equally strong playable scene thumbnails covering neon race, farm day, farm night defence, desert convoy, flood rescue, jungle ruins, snow expedition, toy bedroom, fantasy kingdom, alien survey, moon mining and asteroid salvage, consistent vehicle-focused composition, minimal labels, cohesive presentation, 16:9.


### BRD-02 — Single World Deep Dive

**Use:** Explore one world through multiple gameplay states.

**Reusable image prompt:** A deep-dive concept board for one original game world, show the same farm region at dawn work, afternoon logistics, storm emergency, night defence, winter season and map overview, include vehicle variants, environmental systems, HUD changes and key landmarks, cohesive production concept presentation, 16:9.


### BRD-03 — Vehicle Family Board

**Use:** Test whether one base rig can support many roles without losing identity.

**Reusable image prompt:** A vehicle-family exploration board for an original game, one base utility truck transformed into racer, courier, farm support, rescue, convoy defence, salvage and exploration variants, orthographic views, action thumbnails, modular attachment system, silhouette comparison and shared design DNA, premium production concept art, 16:9.


### BRD-04 — HUD Evolution Board

**Use:** Compare minimal, arcade, tactical and simulation interfaces on the same scene.

**Reusable image prompt:** A UI comparison board using the same original vehicle gameplay screenshot four times with minimal diegetic HUD, arcade HUD, tactical combat HUD and simulation operations HUD, preserve identical scene composition to make density and hierarchy differences obvious, professional interface design study, 16:9.


### BRD-05 — Map-to-Gameplay Board

**Use:** Connect regional map, mission route, local tactical map and final screenshot.

**Reusable image prompt:** A map-to-gameplay design board for an original vehicle mission, regional world map, selected contract route, local tactical map, objective and hazard layout, then final playable third-person screenshot of the same location, clear visual continuity and scale transitions, premium production design presentation, 16:9.


### BRD-06 — Art-Style Comparison Board

**Use:** Test one scene across several render directions.

**Reusable image prompt:** A controlled visual style comparison board for an original vehicle game, the exact same tractor-at-night defence composition rendered in stylised PBR, painterly 3D, graphic cel-shaded, miniature diorama, clean low-poly and grounded realism, consistent camera, vehicle and enemy placement, labelled columns, professional art-direction study, 16:9.


---

## 10. Reusable Master Prompt Template

Use this when combining catalog items:

> Create a **[output type: playable screenshot / concept sheet / UI board / map board / key art]** for an original browser-based vehicle game. Combine **[scene ID and name]**, **[vehicle or rig ID]**, **[HUD ID]**, **[map structure if visible]**, and **[style ID]**. The player fantasy is **[one sentence]**. Show **[primary action]**, **[secondary system]**, **[important landmark]**, **[threat or objective]**, and **[route choice]**. Camera: **[camera choice]**. Vehicle silhouette must remain clear at gameplay distance. Environment must communicate **[weather, time, materials, scale]**. UI should expose only **[five most important variables]**. Make the image feel like a believable playable frame or production design reference, not generic promotional art. Use original vehicle and interface designs, no existing brands or franchise likeness. **[aspect ratio]**.

---

## 11. Production-Reference Prompt Template

> Create a production-ready concept sheet for **[vehicle / prop / environment / HUD component]** from an original vehicle game. Include front, side, rear, top and three-quarter views where relevant; exploded or modular connection view; material and colour callouts; functional labels; scale reference; default, damaged and upgraded states; clear silhouette thumbnails; and one small in-game context image. Prioritise mechanical and gameplay readability over decoration. Neutral presentation background, controlled lighting, original design language, no existing brand marks, 16:9.

---

## 12. Selection Checklist Before Generating

Before any generation, choose:

1. **Primary goal:** atmosphere, gameplay screenshot, UI study, rig design, map design, or production reference.
2. **Scene ID**
3. **Rig ID**
4. **HUD ID**
5. **Map ID**, if relevant
6. **Style ID**
7. **Camera**
8. **Time and weather**
9. **One dominant gameplay action**
10. **Five or fewer visible HUD variables**
11. **Whether the image must be implementation-faithful or exploratory**
12. **Required output ratio and resolution**

---

## 13. Combination Examples

- `SCN-04 + RIG-06 + HUD-03 + MAP-06 + STYLE-01`  
  Farm night defence using modular agricultural machines, tactical combat information, parcel-based territory, stylised PBR.

- `SCN-14 + RIG-03 + HUD-08 + MAP-04 + STYLE-04`  
  Toy-room procedural race with playful HUD and miniature-diorama rendering.

- `SCN-22 + RIG-13 + HUD-07 + MAP-09 + STYLE-02`  
  Alien planetary survey using a transforming rover, scientific scanner UI, planetary map, painterly 3D.

- `SCN-24 + RIG-12 + HUD-09 + MAP-10 + STYLE-07`  
  Asteroid salvage with modular spacecraft, spatial holographic HUD, orbital node network, retro-futurist art direction.

- `SCN-05 + RIG-08 + HUD-05 + MAP-02 + STYLE-08`  
  Flood rescue using amphibious machines, survival information, continuous region, grounded realism.

---

## 14. Maintenance Rules

- New ideas receive permanent IDs.
- Do not overwrite an older concept. Add a revision note or a new variant.
- Generated images should record the exact IDs and final prompt used.
- Strong results should gain an `APPROVED REFERENCE` note, not silently replace the prompt.
- Failed generations should record why they failed: composition, text, vehicle clarity, UI density, style drift, or gameplay ambiguity.
- Implementation work begins only after an explicit instruction to build or prototype.
