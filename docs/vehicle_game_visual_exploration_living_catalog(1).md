# Vehicle Multiverse Game
## Visual Exploration Living Catalog

**Purpose:** Maintain a prompt-ready inventory of visual directions before implementation.  
**Rule:** Nothing in this catalog is approved for production merely because it is listed. Generate, prototype, or build only when explicitly requested.  
**Reference syntax:** Name only the IDs deliberately selected, such as `SCN-04 + LGT-06`, `RIG-12 + MAT-03`, or an integrated test such as `SCN-04 + RIG-06 + HUD-03 + MAP-06 + STYLE-01`.

### Revision 2.0 - Atomic visual systems

**Updated:** 2026-07-27

This revision expands the catalog beyond scenes, rigs, HUDs, maps, and styles. It adds independent systems for lighting, camera, weather, atmosphere, colour, materials, VFX, composition, scale, motion, and world transformation.

**Critical rule:** A visual does not need one option from every category. Select only the dimensions required to answer the current design question. A pure lighting study may use only `SCN + LGT`. A vehicle sheet may use only `RIG + MAT`. A fully integrated gameplay frame may use `SCN + RIG + HUD + MAP + STYLE`, but that is an integration test, not the default format.


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
| Lighting | natural, practical, neon, emergency, bioluminescent, volumetric, high-key, low-key |
| Weather | clear, rain, monsoon, fog, snow, whiteout, dust, ash, alien weather |
| Camera language | close chase, wide chase, cockpit, top-down, isometric, side-on, fixed diorama, free orbit |
| Composition | hero-centric, route-centric, threat encirclement, layered depth, landmark-led, split objective |
| Colour strategy | naturalistic, complementary, analogous, monochrome accent, faction-coded, time-coded |
| Material language | rugged industrial, toy plastic, painted metal, wood, ceramic, bio-organic, energy surface |
| VFX density | none, restrained, readable action, spectacle, environmental, interface-linked |
| Motion language | heavy, agile, elastic, mechanical, floaty, unstable, rhythmic, procedural |
| World state | intact, working, damaged, occupied, transformed, seasonal, time-fractured, player-built |
| Visual scope | isolated object, single mechanic, focused pair, scene study, integrated gameplay, comparison board |

---

## 2. Prompt Conventions

### Combination discipline

- Treat every catalog category as an independent design lens, not a mandatory ingredient.
- Use the smallest combination that can answer the question.
- Do not add a map merely because a map option exists.
- Do not add a HUD to environment, lighting, material, or mood studies unless interface behaviour is being tested.
- Do not force a named rendering style when exploring only camera, composition, or lighting.
- An image title must list only the IDs actually used.
- When several IDs are combined, state the design question the combination is meant to test.
- A strong standalone result may contain one ID plus a plain-language constraint.
- Fully integrated combinations are reserved for testing whether systems coexist coherently.

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



### Additional scene directions - Revision 2.0

### SCN-29 - Monsoon Megacity Response

**Core fantasy:** A dense city becomes a changing water-management and rescue network during prolonged monsoon rain.

**Gameplay possibilities:** Drain clearing, civilian rescue, emergency delivery, pump deployment, traffic rerouting.

**Camera:** High third-person with water-depth visibility and optional municipal map.

**Likely vehicles:** Amphibious van, drainage crawler, rescue bike, pump truck, elevated courier pod.

**Environmental systems:** Rising water, current, blocked drains, traffic, electrical hazards, bridge closures.

**HUD implications:** Water depth, pump network, civilian requests, safe roads, battery isolation.

**Reusable image prompt:** Create a believable playable browser-game screenshot during a severe monsoon in a dense original megacity. Show an amphibious municipal response vehicle moving through a flooded junction while a drainage crawler clears debris and elevated couriers cross temporary ramps. Roads must have visibly different water depths, current direction, disabled traffic and electrical hazard zones. Use a high third-person camera, grounded stylised 3D art and a compact emergency HUD showing water depth, pump network, rescue requests, safe roads and battery isolation. Keep the tone operational rather than catastrophic, 16:9.

### SCN-30 - Long-Distance Road Journey

**Core fantasy:** The journey itself is the game: changing landscapes, companions, vehicle maintenance, discoveries and route decisions.

**Gameplay possibilities:** Road trip, photography, conversation, camping, repairs, detours, small contracts.

**Camera:** Relaxed wide chase camera with scenic pullbacks.

**Likely vehicles:** Family van, classic coupe, camper truck, motorbike, modular trailer.

**Environmental systems:** Fuel, fatigue, weather, road quality, relationships, regional customs.

**HUD implications:** Next stop, fuel range, companion state, discoveries, road condition.

**Reusable image prompt:** Create a playable open-road journey screenshot for an original vehicle adventure. A customised camper van travels along a winding mountain road toward a distant town, with optional side roads, scenic stops, repair opportunities and changing weather visible ahead. Include companions and stored travel gear without turning the image into a poster. Use a relaxed wide chase camera, premium stylised 3D art and a restrained travel HUD showing next stop, fuel range, companion state, discovered places and road condition. Emphasise calm forward motion and meaningful route choice, 16:9.

### SCN-31 - Airport Ground Operations

**Core fantasy:** An airport becomes a tightly coordinated machine of towing, fuelling, baggage, safety and timed movement.

**Gameplay possibilities:** Aircraft towing, baggage logistics, emergency response, runway inspection, scheduling.

**Camera:** Third-person operations camera with tower-style overview toggle.

**Likely vehicles:** Pushback tug, baggage tractor, fuel truck, fire vehicle, runway inspection rover.

**Environmental systems:** Schedules, restricted zones, weather, wake turbulence, runway occupancy, safety rules.

**HUD implications:** Clearance, task queue, route hold, proximity warning, departure countdown.

**Reusable image prompt:** Create a playable airport ground-operations game screenshot at dawn. Show an original pushback tug moving a passenger aircraft while baggage tractors, a fuel vehicle and runway inspection rover operate on coordinated paths. Mark restricted lanes, active runway boundaries and hold points through world design rather than excessive overlays. Use crisp stylised realism, a practical third-person camera and a compact operations HUD showing clearance, task queue, route hold, proximity warning and departure countdown. No airline or airport branding, 16:9.

### SCN-32 - Scrapyard Economy

**Core fantasy:** A scrapyard is simultaneously a resource field, workshop, marketplace, puzzle space and combat arena.

**Gameplay possibilities:** Salvage sorting, crane operation, dismantling, trading, rig assembly, territory defence.

**Camera:** Low industrial third-person with crane and sorting overview.

**Likely vehicles:** Forklift, magnet crane crawler, compact hauler, cutting rover, improvised rig.

**Environmental systems:** Material grades, unstable stacks, machinery hazards, auctions, environmental contamination.

**HUD implications:** Payload value, material type, stability, buyer demand, tool condition.

**Reusable image prompt:** Create a playable scrapyard economy scene for an original vehicle game. A compact magnet-crane crawler sorts valuable machinery from unstable scrap piles while forklifts and improvised haulers follow marked lanes. Show material categories, cutting stations, auction bays and a workshop built into the yard. Use dusty afternoon lighting, detailed stylised industrial 3D art and a useful HUD showing payload value, material type, stack stability, buyer demand and tool condition. The scene should communicate work, risk and opportunity rather than generic wasteland combat, 16:9.

### SCN-33 - Crystal Cavern Expedition

**Core fantasy:** Vehicles navigate vast underground caverns where light, sound and mineral structures define the route.

**Gameplay possibilities:** Surveying, mining, bridge deployment, creature avoidance, geological puzzles.

**Camera:** Wide cave camera with headlight-led framing.

**Likely vehicles:** Crawler, drill rover, cable cart, wall climber, underground rail pod.

**Environmental systems:** Fragile crystals, echoes, darkness, cave-ins, underground rivers, magnetic anomalies.

**HUD implications:** Light range, structural stress, echo contacts, cable length, route memory.

**Reusable image prompt:** Create a playable underground expedition screenshot inside a vast original crystal cavern. A six-wheel crawler crosses a deployed bridge while a wall-climbing scout illuminates mineral formations and an underground river below. Headlights and reflected crystal light should reveal several possible routes without overexposing the cave. Use premium stylised 3D art, a wide readable camera and a compact exploration HUD showing light range, structural stress, echo contacts, cable length and route memory, 16:9.

### SCN-34 - Abandoned Amusement Park

**Core fantasy:** Old rides, service tunnels, tracks and attractions become a mechanically playful traversal world.

**Gameplay possibilities:** Race, power restoration, scavenging, puzzle routes, chase, ride reactivation.

**Camera:** Low chase camera with fixed attraction cameras for set pieces.

**Likely vehicles:** Kart, maintenance buggy, roller-coaster service car, bumper-car hybrid, tram.

**Environmental systems:** Moving rides, collapsing track, power circuits, funhouse distortion, weathered machinery.

**HUD implications:** Power zones, route switch, attraction cycle, vehicle charge, pursuit distance.

**Reusable image prompt:** Create a playable vehicle adventure screenshot in an abandoned original amusement park at twilight. A maintenance buggy races beneath a partially reactivated roller coaster while a bumper-car hybrid takes a shortcut through a dark arcade and service tram tracks form another route. Show rotating rides, powered and unpowered zones, switchable track sections and a distant pursuit threat. Use atmospheric stylised 3D art and a compact HUD showing power zones, route switch, attraction cycle, charge and pursuit distance, 16:9.

### SCN-35 - Archipelago Trade Routes

**Core fantasy:** Small islands form an economy of fishing, farming, repair, weather knowledge and sea travel.

**Gameplay possibilities:** Trading, fishing, rescue, smuggling, exploration, island development.

**Camera:** Wide water-level chase camera with chart view.

**Likely vehicles:** Sailing truck hybrid, catamaran, fishing skiff, cargo hydrofoil, amphibious bike.

**Environmental systems:** Tides, reefs, storms, currents, cargo condition, local prices.

**HUD implications:** Tide, wind, cargo, destination demand, safe harbour range.

**Reusable image prompt:** Create a playable archipelago trading screenshot for an original vehicle game. A modular cargo hydrofoil moves between lush islands while fishing skiffs, an amphibious bike and a distant storm create route decisions. Show reefs, tide-exposed sandbars, local docks and visible cargo modules. Use a water-level chase camera, bright premium stylised 3D art and a compact maritime HUD showing tide, wind, cargo condition, destination demand and safe-harbour range. The scene should feel systemic and exploratory, 16:9.

### SCN-36 - Storm Chaser Plains

**Core fantasy:** Vehicles pursue severe weather to collect data, deploy instruments and protect communities.

**Gameplay possibilities:** Storm tracking, sensor deployment, rescue, route prediction, equipment recovery.

**Camera:** Wide chase camera with radar-informed horizon composition.

**Likely vehicles:** Armoured research truck, sensor buggy, drone carrier, rescue pickup.

**Environmental systems:** Wind, hail, lightning, flash flooding, debris, changing storm path.

**HUD implications:** Storm vector, wind load, deployment window, shelter route, instrument status.

**Reusable image prompt:** Create a playable storm-chasing game screenshot across open plains. An armoured research truck races toward a rotating supercell while a sensor buggy deploys instruments and a rescue pickup diverts toward a farmhouse. Show rain curtains, lightning, debris movement and several road choices. Use a wide horizon-led chase camera, grounded premium 3D art and a practical HUD showing storm vector, wind load, deployment window, shelter route and instrument status. Avoid disaster-movie poster composition, 16:9.

### SCN-37 - Canal Restoration District

**Core fantasy:** A polluted urban canal becomes a vehicle-led cleanup, ecology and neighbourhood renewal system.

**Gameplay possibilities:** Waste collection, water testing, planting, transport, infrastructure repair.

**Camera:** High third-person with water and street layers visible.

**Likely vehicles:** Cleanup boat, floating excavator, cargo bike, filter barge, inspection rover.

**Environmental systems:** Water quality, flow, waste types, wildlife return, public access, construction phases.

**HUD implications:** Water quality, collected load, current, restoration target, district support.

**Reusable image prompt:** Create a playable urban canal-restoration screenshot for an original vehicle game. A compact cleanup boat collects floating waste while a filter barge treats water and cargo bikes move materials along the banks. Show one neglected section and one restored section with returning plants and public space. Use a high third-person camera, optimistic stylised 3D art and a clear HUD showing water quality, collected load, current, restoration target and district support, 16:9.

### SCN-38 - Living Construction Site

**Core fantasy:** A major construction project changes daily, opening and closing routes as machines build the environment.

**Gameplay possibilities:** Earthmoving, material delivery, crane coordination, safety, structural assembly.

**Camera:** Third-person machinery camera with time-lapse overview.

**Likely vehicles:** Excavator, crane, concrete carrier, bulldozer, bridge-layer, inspection rover.

**Environmental systems:** Terrain modification, schedules, worker zones, load balance, weather, structural dependencies.

**HUD implications:** Task dependency, load, ground stability, safety radius, completion state.

**Reusable image prompt:** Create a playable construction-site simulation screenshot in a large original urban development. Show an excavator reshaping terrain, a crane lifting a structural module and a concrete carrier navigating temporary roads that will disappear as the site evolves. Use strong spatial readability, premium stylised industrial 3D art and a practical HUD showing task dependency, load, ground stability, safety radius and completion state. The world should visibly be under construction rather than a static backdrop, 16:9.

### SCN-39 - Moving Train Infiltration

**Core fantasy:** The entire level moves through the world while players traverse carriages, roofs and parallel vehicles.

**Gameplay possibilities:** Infiltration, rescue, cargo recovery, pursuit, carriage control, route switching.

**Camera:** Dynamic side chase and close third-person across train sections.

**Likely vehicles:** Rail bike, maintenance cart, road interceptor, roof crawler, compact air vehicle.

**Environmental systems:** Train speed, carriage separation, tunnels, switches, wind, security systems.

**HUD implications:** Relative position, next obstacle, carriage state, route switch, extraction window.

**Reusable image prompt:** Create a playable moving-train infiltration screenshot for an original vehicle game. A rail bike approaches a long armoured train while a roof crawler moves between carriages and a road interceptor keeps pace beside the tracks. Show an approaching tunnel, a track switch and separable carriage sections. Use dynamic but readable side-chase composition, premium stylised 3D art and a compact HUD showing relative position, next obstacle, carriage state, route switch and extraction window, 16:9.

### SCN-40 - Colossal Creature Migration

**Core fantasy:** Vehicles travel alongside enormous peaceful creatures, protecting routes and learning their behaviour.

**Gameplay possibilities:** Escort, ecology, photography, rescue, clearing obstacles, anti-poaching defence.

**Camera:** Very wide scale camera with occasional close interaction.

**Likely vehicles:** Research rover, medical carrier, scout bike, observation balloon, supply truck.

**Environmental systems:** Migration patterns, terrain pressure, weather, animal stress, human settlements.

**HUD implications:** Creature stress, route forecast, distance, herd cohesion, intervention risk.

**Reusable image prompt:** Create a playable ecological expedition screenshot where original colossal creatures migrate across a vast landscape alongside small research vehicles. Show a rover protecting a young creature near a river crossing while an observation balloon maps the herd and a settlement lies ahead. Use an extremely wide scale-aware camera, premium painterly 3D art and a restrained HUD showing creature stress, route forecast, distance, herd cohesion and intervention risk. Avoid combat-first framing, 16:9.

### SCN-41 - Shrinking Laboratory Escape

**Core fantasy:** Vehicles and characters become microscopic inside a laboratory where dust, circuits and liquids create terrain.

**Gameplay possibilities:** Escape, puzzle traversal, sample transport, circuit repair, hazard avoidance.

**Camera:** Macro chase camera with controlled depth of field.

**Likely vehicles:** Micro rover, magnetic crawler, droplet skimmer, circuit bike.

**Environmental systems:** Static charge, liquid surface tension, fans, heat, moving mechanisms, contamination.

**HUD implications:** Scale state, charge, surface adhesion, contamination, route layer.

**Reusable image prompt:** Create a playable microscopic vehicle scene inside an original laboratory. A tiny magnetic crawler crosses a circuit board while a droplet skimmer navigates between beads of liquid and a micro rover transports a sample beneath moving machinery. Use macro-scale materials, deliberate depth of field and clear route edges. Add a compact HUD showing scale state, charge, adhesion, contamination and route layer. Premium imaginative 3D game art, 16:9.

### SCN-42 - Time-Fractured City

**Core fantasy:** Several historical and future versions of one city overlap, and vehicles cross between them to solve routes.

**Gameplay possibilities:** Time navigation, delivery, restoration, pursuit, cause-and-effect puzzles.

**Camera:** Third-person with split-era composition and transition camera.

**Likely vehicles:** Classic car, present EV, steam vehicle, hover car, temporal maintenance rig.

**Environmental systems:** Era shifts, changing roads, historical events, future construction, causality.

**HUD implications:** Current era, stability, anchor points, route continuity, consequence preview.

**Reusable image prompt:** Create a playable time-fractured city screenshot for an original vehicle game. The same avenue should visibly overlap across an old industrial era, present-day district and distant future, with a modular vehicle crossing a temporal boundary while route geometry changes ahead. Show anchor points and consequences through environment design. Use premium stylised 3D art, a readable third-person camera and a compact HUD showing current era, stability, anchor points, route continuity and consequence preview, 16:9.

### SCN-43 - Dream Roads

**Core fantasy:** Roads behave like memory and imagination: folding, repeating, floating, dissolving and responding to emotion.

**Gameplay possibilities:** Exploration, rhythm driving, symbolic puzzles, chase, narrative discovery.

**Camera:** Fluid chase camera with impossible but readable perspective.

**Likely vehicles:** Abstract car, paper vehicle, cloud bike, memory bus, shape-shifting rig.

**Environmental systems:** Gravity changes, looping space, colour shifts, symbolic landmarks, rhythm.

**HUD implications:** Emotional state, route certainty, rhythm alignment, memory fragments, wake threshold.

**Reusable image prompt:** Create a playable surreal driving screenshot in an original dream world. An abstract vehicle follows a road that folds upward into the sky while another route repeats through floating rooms and a third dissolves into clouds. Keep impossible geometry readable as gameplay. Use fluid composition, expressive premium 3D art and a minimal HUD showing emotional state, route certainty, rhythm alignment, memory fragments and wake threshold, 16:9.

### SCN-44 - Family Caravan Expedition

**Core fantasy:** A multi-vehicle family or community travels together, balancing comfort, safety, work and discovery.

**Gameplay possibilities:** Planning, co-operative driving, camping, repairs, child and elder needs, exploration.

**Camera:** Warm wide chase camera with caravan overview.

**Likely vehicles:** Camper van, support car, bike, utility trailer, compact scout.

**Environmental systems:** Fatigue, supplies, relationships, weather, camp quality, vehicle roles.

**HUD implications:** Caravan cohesion, comfort, supplies, next camp, individual requests.

**Reusable image prompt:** Create a warm playable caravan-expedition screenshot for an original vehicle game. A camper van, support car, utility trailer and scout bike travel through a changing landscape toward an evening campsite. Show practical stops, scenic discoveries and vehicle roles without making the scene sentimental. Use a wide chase camera, premium stylised 3D art and a gentle HUD showing caravan cohesion, comfort, supplies, next camp and individual requests, 16:9.

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



### Additional HUD directions - Revision 2.0

### HUD-13 - Navigation-First HUD

**Design goal:** Make route understanding primary and suppress most vehicle statistics until needed.

**Best fit:** Complex worlds, road trips, vertical cities, exploration.

**Main trade-off:** Excellent orientation; may hide mechanical depth during emergencies.

**Reusable image prompt:** Create an original navigation-first vehicle HUD board with route ribbon, landmark compass, vertical layer indicator, uncertainty, alternate path preview and contextual distance. Show city, wilderness and indoor variants. Keep speed and vehicle status secondary until danger occurs. Premium readable interface, 16:9.

### HUD-14 - Maintenance Diagnosis HUD

**Design goal:** Turn damage into understandable mechanical causes, symptoms and repair choices.

**Best fit:** Simulation, survival, salvage, heavy machinery.

**Main trade-off:** Deep and useful; can interrupt flow if shown constantly.

**Reusable image prompt:** Create a vehicle maintenance-diagnosis HUD concept board showing a modular rig silhouette, damaged components, symptoms, likely causes, temporary field repairs, required parts, repair time and risk of continued use. Include quick in-play warning state and detailed garage state. Premium original UI, 16:9.

### HUD-15 - Economy and Trade HUD

**Design goal:** Expose cargo value, regional demand, route cost, spoilage, legality and negotiation.

**Best fit:** Trading, convoy, island routes, delivery.

**Main trade-off:** Supports strategic play; can make exploration feel transactional.

**Reusable image prompt:** Create a premium trade HUD for an original vehicle game, showing cargo manifest, weight, condition, local demand, price trend, route cost, risk, buyer reliability and negotiation options. Include compact driving state and expanded market state. Avoid spreadsheet-heavy corporate styling, 16:9.

### HUD-16 - Accessibility-Adaptive HUD

**Design goal:** Allow information to change form through size, contrast, shape, sound, motion and redundancy.

**Best fit:** Every mode and audience.

**Main trade-off:** Requires disciplined design and testing rather than one accessibility preset.

**Reusable image prompt:** Create an accessibility-adaptive game HUD board showing the same vehicle scene in standard, high-contrast, large-text, low-motion, colour-independent and audio-cue-supported states. Demonstrate redundant shape coding, readable typography and customisable information density. Original production UX, 16:9.

### HUD-17 - Transformation-State HUD

**Design goal:** Explain which vehicle mode is active, what can transform, and what environmental conditions allow it.

**Best fit:** Multi-form rigs, amphibious vehicles, mech hybrids, space transitions.

**Main trade-off:** Crucial for clarity; risks feeling like a cooldown bar if transformation is physical.

**Reusable image prompt:** Create a transformation-state HUD for an original modular vehicle, showing land, water, climbing and flight modes, current geometry, transition readiness, blocked reasons, energy cost and predicted handling changes. Include in-world transformation previews and minimal driving overlay, premium original UI, 16:9.

### HUD-18 - Relationship and Crew HUD

**Design goal:** Show trust, requests, stress, responsibilities and communication without turning people into health bars.

**Best fit:** Caravans, co-op crews, narrative journeys.

**Main trade-off:** Human context becomes legible; careless quantification can feel mechanical.

**Reusable image prompt:** Create a relationship-aware crew HUD for an original vehicle journey game. Show role assignments, current requests, stress signals, communication pings, shared decisions and unresolved needs using subtle portraits and contextual cues rather than gamified affection meters. Include compact driving and camp-planning states, premium humane UI, 16:9.

### HUD-19 - Spectator and Broadcast HUD

**Design goal:** Explain the match, route, build, standings and key moments to viewers.

**Best fit:** Races, tournaments, creator streams, replays.

**Main trade-off:** Great for sharing; not suitable as the player's main HUD.

**Reusable image prompt:** Create an original spectator HUD board for a vehicle competition, including standings, route overview, selected vehicle build, live gaps, event timeline, key-moment replay and commentator data. Show full broadcast and compact stream-overlay variants. Clean premium interface, no resemblance to existing motorsport broadcasts, 16:9.

### HUD-20 - Photo and Cinematic HUD

**Design goal:** Support framing, lens, motion, focus, weather, time and replay control.

**Best fit:** Photography, build-in-public sharing, replays, community content.

**Main trade-off:** Powerful creative tool; must remain separate from normal gameplay.

**Reusable image prompt:** Create a photo-mode and cinematic-replay UI board for an original vehicle game, showing camera orbit, focal length, depth of field, focus target, shutter effect, time of day, weather, vehicle pose, path replay and clean screenshot toggle. Premium creator-friendly interface with keyboard and controller affordances, 16:9.

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



### Additional rig directions - Revision 2.0

### RIG-17 - Boat and Ship Family

**Fantasy:** River boats, fishing craft, rescue vessels, cargo ships and modular ocean explorers.

**Modular systems:** Hull, propulsion, rudder, deck modules, crane, nets, cabins, stabilisers, sails.

**Silhouette:** Long waterline silhouette with role expressed through deck layout.

**Progression role:** Trade, rescue, fishing, exploration and mobile-base progression.

**Reusable image prompt:** Create an original modular boat and ship family sheet showing river utility boat, fishing skiff, rescue craft, cargo catamaran and ocean exploration vessel. Include hull variants, propulsion, deck modules, cranes, cabins, stabilisers and sail options, orthographic and three-quarter views, premium production concept art, 16:9.

### RIG-18 - Emergency Response Family

**Fantasy:** Purpose-built fire, medical, rescue, utility and disaster-response vehicles.

**Modular systems:** Cab, storage, pumps, ladders, medical module, cutting tools, lighting, drone bay.

**Silhouette:** Highly legible role-based silhouette.

**Progression role:** Civilian rescue, urban operations and severe-weather gameplay.

**Reusable image prompt:** Create a modular emergency-response vehicle sheet for an original game, showing fire appliance, medical carrier, flood rescue truck, urban utility vehicle and command rig built from shared design language. Include pumps, ladders, medical modules, cutting tools, lighting and drone bays. No real emergency-service branding, 16:9.

### RIG-19 - Micro Utility Robot Family

**Fantasy:** Small autonomous or remote vehicles that scout, repair, clean and manipulate tight spaces.

**Modular systems:** Wheel, track, leg and magnetic bases; camera, arm, tool, sample and relay modules.

**Silhouette:** Compact functional silhouette with strong tool identity.

**Progression role:** Support units, puzzle tools and swarm gameplay.

**Reusable image prompt:** Create an original micro-utility robot family concept sheet with wheeled scout, tracked repair unit, magnetic wall crawler, six-legged sample robot and cleaning swarm unit. Show shared module sockets, cameras, arms, tools and relay components, clear scale reference and orthographic views, premium industrial design, 16:9.

### RIG-20 - Bus and Mobile Habitat Family

**Fantasy:** Passenger buses evolve into workshops, homes, clinics, command centres and moving settlements.

**Modular systems:** Cab, passenger shell, living module, storage, workshop, medical, power, rooftop systems.

**Silhouette:** Large inhabited silhouette with visible internal life.

**Progression role:** Caravan, settlement and long-journey backbone.

**Reusable image prompt:** Create an original modular bus and mobile-habitat design board showing public transport base, expedition bus, mobile workshop, clinic, family home and command centre. Include cutaway interiors, rooftop systems, storage, power and external attachments, premium stylised production concept art, 16:9.

### RIG-21 - Mining and Drilling Family

**Fantasy:** Machines built for excavation, sample extraction, tunnel support and ore logistics.

**Modular systems:** Drill heads, tracks, stabilisers, conveyors, sample bays, cooling, supports, sensors.

**Silhouette:** Forward-heavy industrial silhouette.

**Progression role:** Resource gathering, terrain opening and hazard management.

**Reusable image prompt:** Create an original mining vehicle rig sheet with compact drill rover, tunnel borer, sample crawler, ore hauler and support vehicle, shared industrial design, interchangeable drill heads, cooling, conveyors, stabilisers and sensors, orthographic and exploded views, premium concept art, 16:9.

### RIG-22 - Magnetic Climber Family

**Fantasy:** Vehicles travel across walls, ceilings, hulls and steel infrastructure.

**Modular systems:** Magnetic wheels, tracks, adhesion pads, articulated suspension, tether, inspection tools.

**Silhouette:** Low body hugging the surface.

**Progression role:** Vertical exploration, maintenance and infiltration.

**Reusable image prompt:** Create a modular magnetic-climbing vehicle family for an original game, including wall bike, hull crawler, bridge inspector, ceiling maintenance cart and compact rescue unit. Show adhesion systems, articulated suspension, tethers and tools in surface-relative orthographic views, premium original industrial design, 16:9.

### RIG-23 - Swarm Vehicle Family

**Fantasy:** Many small units cooperate as one playable system, changing formation and role.

**Modular systems:** Shared cores, wheels, rotors, tools, communication, docking and carrier modules.

**Silhouette:** Identity comes from formation as much as individual silhouette.

**Progression role:** Distributed exploration, repair, combat and construction.

**Reusable image prompt:** Create an original swarm-vehicle design board showing small modular units forming scout line, cargo platform, bridge, defensive ring and temporary large vehicle. Include individual unit orthographics, docking logic and formation diagrams, premium readable science-fiction concept art, 16:9.

### RIG-24 - Player-Built Kitbash Platform

**Fantasy:** A neutral chassis system allows deep player construction without losing physical plausibility.

**Modular systems:** Frames, mounting standards, power buses, control links, wheels, tools, body panels.

**Silhouette:** Silhouette depends on build but must obey balance and clearance rules.

**Progression role:** Creator mode, long-term ownership and emergent vehicle classes.

**Reusable image prompt:** Create a production design board for an original player-built vehicle platform. Show a neutral modular chassis, standard mounting grid, power and control connections, weight balance, wheel clearance and structural limits, followed by five radically different valid player builds. Include exploded parts and readable constraints, premium game-system concept art, 16:9.

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



### Additional map directions - Revision 2.0

### MAP-11 - Archipelago Sea-Lane Map

**Structure:** Water routes change with tide, wind, reef exposure and harbour access.

**Strength and risk:** Distinct maritime planning; risks looking empty without current and weather layers.

**Key map elements:** Sea lanes, reefs, tides, currents, ports, storms, cargo demand.

**Reusable image prompt:** Create an original maritime strategy map for a vehicle game, showing islands, ports, reefs, tide-exposed routes, wind and current fields, storm movement, cargo demand and safe-harbour range. Include local and regional zoom states with clean premium cartography, 16:9.

### MAP-12 - Underground Cave Network

**Structure:** Caverns, shafts, rivers, rail lines and collapses form a partially known 3D network.

**Strength and risk:** Strong discovery and route memory; difficult vertical readability.

**Key map elements:** Depth bands, surveyed tunnels, unknown voids, cave-ins, anchors, extraction points.

**Reusable image prompt:** Create a layered underground map UI for an original vehicle game, showing depth bands, caverns, shafts, underground rivers, rail lines, surveyed and unknown spaces, cave-in risks and deployed anchors. Compare flattened and volumetric views, premium readable cartography, 16:9.

### MAP-13 - Multi-Floor Interior Map

**Structure:** A large building is navigated across floors, ramps, lifts, shafts and exterior routes.

**Strength and risk:** Supports stealth and dense reuse; orientation must be immediate.

**Key map elements:** Floor stack, vertical connectors, access zones, cameras, exits, vehicle clearance.

**Reusable image prompt:** Create a multi-floor interior vehicle map for an original tower or factory, with stacked floors, parking ramps, lifts, maintenance shafts, facade routes, access levels, security zones and vehicle-clearance constraints. Premium tactical UI, 16:9.

### MAP-14 - Moving World Map

**Structure:** Major map elements physically move, such as trains, migrating creatures, floating islands or storms.

**Strength and risk:** Creates dynamic planning; route previews must communicate uncertainty.

**Key map elements:** Moving nodes, predicted paths, intercept windows, temporary connections, risk cones.

**Reusable image prompt:** Create a dynamic world map UI where key locations move over time: convoy, train, floating islands, migrating herd and storm front. Show predicted paths, intercept windows, temporary connections and uncertainty bands, premium original strategy interface, 16:9.

### MAP-15 - Seasonally Morphing Map

**Structure:** The same region changes routes and resources across wet, dry, winter and harvest seasons.

**Strength and risk:** High reuse with meaningful state change; content must be more than palette swaps.

**Key map elements:** Floodplains, frozen water, crop cycles, snow routes, seasonal settlements.

**Reusable image prompt:** Create a four-season world-map comparison for an original vehicle game, showing the same region in spring flood, summer growth, autumn harvest and winter freeze. Routes, resources, hazards and settlements must change structurally, not only visually. Premium illustrated cartography, 16:9.

### MAP-16 - Faction and Economy Network

**Structure:** Territories matter through production, trade, relationships and service access rather than colour fill alone.

**Strength and risk:** Supports strategic consequence; can become abstract if disconnected from places.

**Key map elements:** Supply chains, workshops, trust, demand, blockades, shared infrastructure.

**Reusable image prompt:** Create an original faction-and-economy map for a vehicle game, linking real places through supply chains, workshops, resource demand, trust, blockades and infrastructure dependence. Avoid simple coloured territory painting. Show how one road closure affects several settlements, premium readable UI, 16:9.

### MAP-17 - Knowledge and Uncertainty Map

**Structure:** The map records what the player actually knows, suspects, remembers and has not verified.

**Strength and risk:** Makes exploration meaningful; must avoid frustrating navigation.

**Key map elements:** Confidence, last-seen state, rumours, scanned routes, outdated hazards, landmarks.

**Reusable image prompt:** Create a knowledge-based exploration map UI for an original vehicle game, distinguishing verified roads, uncertain paths, old information, rumours, player notes, landmarks and sensor confidence. Show how the map updates after a scouting run. Premium tactile interface, 16:9.

### MAP-18 - Player-Built Infrastructure Map

**Structure:** Roads, bridges, stations, farms, defences and service points are added by players and alter future routes.

**Strength and risk:** Strong agency and long-term world change; simulation dependencies become complex.

**Key map elements:** Build zones, terrain constraints, traffic flow, maintenance, network effects.

**Reusable image prompt:** Create a player-built infrastructure map for an original vehicle game. Show roads, bridges, charging stations, repair depots, farms and defences placed over terrain, with construction constraints, traffic flow, maintenance state and network benefits. Include before and after world states, premium systems UI, 16:9.

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



### Additional UI directions - Revision 2.0

### UI-09 - Damage and Repair Bay

**Purpose:** Diagnose the exact consequences of damage and choose repair depth, parts and compromises.

**Core contents:** 3D damage view, component symptoms, temporary fixes, cost, time, salvage alternatives.

**Reusable image prompt:** Create a premium damage-and-repair screen for an original vehicle game, large manipulable damaged rig, component layers, symptoms, temporary field fixes, full repair options, replacement parts, salvage substitutions, time and performance consequences. Clear mechanical storytelling, 16:9.

### UI-10 - Market and Workshop Exchange

**Purpose:** Trade vehicles, parts, services and information without reducing everything to rarity cards.

**Core contents:** Local supply, part history, condition, compatibility, seller trust, negotiation.

**Reusable image prompt:** Create an original market and workshop exchange screen for a vehicle game, physical marketplace context around a clean interface showing part condition, compatibility, provenance, local supply, seller trust, negotiation and installation preview. Avoid generic mobile-store tiles, premium UX, 16:9.

### UI-11 - Narrative Contract Screen

**Purpose:** Present a job as a situation with people, constraints and consequences, not a checklist.

**Core contents:** Requester, context, route, urgency, trade-offs, likely changes, optional promises.

**Reusable image prompt:** Create a narrative contract-selection screen for an original vehicle game. Show the requester, situation, location, urgency, route, constraints, optional promises and possible consequences around one clear decision. Use contextual world imagery and restrained data, premium readable UI, 16:9.

### UI-12 - Faction and Relationship Screen

**Purpose:** Expose relationships through history, needs, agreements and conflicts.

**Core contents:** Timeline, shared projects, promises, trust reasons, active disputes, access.

**Reusable image prompt:** Create a faction-and-relationship screen for an original vehicle world, showing relationship history, fulfilled and broken promises, shared infrastructure, current needs, disputes, access and key people. Avoid single-number reputation bars as the main representation, premium game UI, 16:9.

### UI-13 - Crew and Role Planner

**Purpose:** Assign people, autonomous units and responsibilities based on skills, stress and mission needs.

**Core contents:** Crew cards, roles, schedule, vehicle stations, compatibility, contingency.

**Reusable image prompt:** Create a crew-and-role planning screen for an original vehicle expedition, showing driver, navigator, engineer, medic, scout and autonomous support units assigned to vehicle stations and shifts. Include skill fit, stress, relationships and contingency coverage, premium humane interface, 16:9.

### UI-14 - Build History and Blueprint Archive

**Purpose:** Preserve every meaningful vehicle evolution, experiment and reusable subassembly.

**Core contents:** Version tree, screenshots, parts, performance, notes, forks, restore and share.

**Reusable image prompt:** Create a build-history and blueprint archive screen for an original modular vehicle game, showing version lineage, named builds, changed parts, performance outcomes, player notes, reusable subassemblies, forks and restore or share actions. Premium creator-friendly UI, 16:9.

### UI-15 - Accessibility and Input Lab

**Purpose:** Make controls, information, motion and readability adjustable through live previews.

**Core contents:** Input remap, assist strength, camera motion, contrast, text, audio cues, timing.

**Reusable image prompt:** Create an accessibility and input-lab screen for an original vehicle game, with live gameplay preview while adjusting control remapping, steering assists, hold versus toggle, camera motion, field of view, contrast, text, audio cues and timing windows. Production-quality UX, 16:9.

### UI-16 - Replay, Film and Photo Studio

**Purpose:** Turn recorded play into editable sequences, screenshots and shareable stories.

**Core contents:** Timeline, cameras, cuts, speed, telemetry, captions, colour, export framing.

**Reusable image prompt:** Create a replay and photo studio screen for an original vehicle game, 3D viewport, camera list, path timeline, slow motion, cuts, telemetry overlays, focus, colour, weather, caption-safe framing and export ratios. Powerful but understandable creator interface, 16:9.

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



### Additional rendering directions - Revision 2.0

### STYLE-09 - Clay and Stop-Motion

**Visual language:** Hand-modelled clay surfaces, fingerprints, miniature sets and stepped expressive movement.

**Where it works:** Toy worlds, comedy, cosy adventure and handcrafted identity.

**Main risk:** Mechanical detail and high-speed readability need careful simplification.

**Reusable image prompt:** Create a clay and stop-motion art-direction board for an original vehicle game, hand-modelled vehicles, visible fingerprints, miniature sets, practical lighting and deliberately stepped animation cues. Show farm, toy room, town and fantasy machine examples with matching tactile UI, premium handcrafted presentation, 16:9.

### STYLE-10 - Hand-Drawn 2.5D Comic

**Visual language:** Illustrated vehicles and environments use layered depth, graphic panels and animated linework.

**Where it works:** Narrative journeys, stylish action and lower-content 3D requirements.

**Main risk:** Camera freedom and modular part consistency are harder.

**Reusable image prompt:** Create a hand-drawn 2.5D comic style board for an original vehicle game, layered illustrated environments, graphic shadows, animated linework, speed panels and expressive mechanical drawings. Show road journey, city chase, fantasy convoy and tactical scene with cohesive UI, 16:9.

### STYLE-11 - Retro Low-Resolution 3D

**Visual language:** Deliberately low-resolution textures, compact geometry and modern lighting discipline.

**Where it works:** Strong nostalgia, browser performance and rapid iteration.

**Main risk:** Can become imitation rather than intentional design.

**Reusable image prompt:** Create a retro low-resolution 3D style board for an original vehicle game, compact geometry, deliberately pixelated textures, limited colour ramps, modern readable lighting and strong silhouettes. Show city, farm, snow and space examples without copying a specific historical console or game, 16:9.

### STYLE-12 - Papercraft World

**Visual language:** Vehicles and terrain appear cut, folded, layered and printed from paper and card.

**Where it works:** Maps, toy scale, educational systems and playful transformation.

**Main risk:** Surface repetition and weak weight can reduce vehicle impact.

**Reusable image prompt:** Create a papercraft visual direction board for an original vehicle game, folded paper vehicles, layered cardboard terrain, printed roads, tabs, seams and pop-up structures. Show race, farm, floating island and map-editor examples with cohesive paper UI, premium handcrafted presentation, 16:9.

### STYLE-13 - Luminous Biopunk

**Visual language:** Organic forms, translucent tissue, living light and mechanical symbiosis.

**Where it works:** Alien, underwater and living-world settings.

**Main risk:** Visual noise and grotesque forms can reduce accessibility.

**Reusable image prompt:** Create a luminous biopunk art-direction board for an original vehicle game, translucent organic vehicles, living light, soft membranes, mineral structures and mechanical symbiosis. Show underwater, alien desert, living-world and orbital bio-ship examples, imaginative but non-gory, 16:9.

### STYLE-14 - Architectural Minimalism

**Visual language:** Precise shapes, restrained materials, calm surfaces and carefully controlled colour.

**Where it works:** Future cities, puzzle traversal, premium UI and clear navigation.

**Main risk:** May lack warmth, dirt and mechanical personality.

**Reusable image prompt:** Create an architectural-minimalist style board for an original vehicle game, precise large forms, restrained material palette, clean light, carefully placed colour and sparse but functional interface. Show future city, corporate tower, orbital station and puzzle arena examples, 16:9.

### STYLE-15 - Monochrome with Functional Accent

**Visual language:** Most of the world uses a narrow value range while gameplay information owns one or two colours.

**Where it works:** Stealth, noir, tactical readability and unusual identity.

**Main risk:** Can flatten environmental variety and fatigue the eye.

**Reusable image prompt:** Create a monochrome-with-functional-accent visual direction board for an original vehicle game, mostly charcoal, cream and grey world rendering with one accent for navigable routes and another for threats. Show city, snow, factory and haunted-town examples with matching UI, premium controlled art direction, 16:9.

### STYLE-16 - High-Saturation Toybox

**Visual language:** Bold colour blocking, soft forms, expressive proportions and energetic feedback.

**Where it works:** Toy worlds, arcade action, younger audiences and strong thumbnails.

**Main risk:** Can feel shallow unless systems and materials remain sophisticated.

**Reusable image prompt:** Create a high-saturation toybox style board for an original vehicle game, bold original colour blocking, soft readable forms, expressive vehicle proportions, tactile materials and energetic but controlled VFX. Show toy race, micro kitchen, cloud islands and robot sport examples, premium playful UI, 16:9.

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


### Additional exploration boards - Revision 2.0

### BRD-07 - Lighting State Board

**Use:** Test the same scene across lighting conditions without changing geometry or camera.

**Reusable image prompt:** Create a controlled lighting study board for one original vehicle scene, identical camera and geometry across hard midday, golden hour, blue hour, moonlight, headlights-only, storm lightning, emergency power and bioluminescent variants. Label each state and preserve gameplay readability, 16:9.

### BRD-08 - Camera Language Board

**Use:** Compare how camera distance, height and lens alter readability and emotion.

**Reusable image prompt:** Create a camera-language comparison board for the same original vehicle scene using close chase, wide chase, low wheel-level, top-down, isometric, cockpit, long-lens and fixed-diorama cameras. Keep vehicle, route and action identical, label each view, professional design study, 16:9.

### BRD-09 - Material Language Board

**Use:** Explore how one rig changes when built from different material systems.

**Reusable image prompt:** Create a material comparison board for one original utility vehicle, identical geometry rendered as painted industrial metal, toy plastic, wood and canvas, ceramic composite, salvaged scrap, bio-organic tissue, translucent energy material and paper craft. Label each and preserve part readability, 16:9.

### BRD-10 - Damage and State Board

**Use:** Define the visual progression from healthy to disabled without relying only on health bars.

**Reusable image prompt:** Create a vehicle state board showing the same original rig pristine, used, muddy, lightly damaged, severely damaged, overheated, flooded, frozen and field-repaired. Include close-ups of visual diagnostics and maintain recognisable silhouette, premium production reference, 16:9.

### BRD-11 - World Transformation Board

**Use:** Show how one location changes through play, time and failure.

**Reusable image prompt:** Create a world-transformation board for the same original farm location in untouched, productive, storm-damaged, fortified, night-under-attack, partially lost, repaired and thriving-late-game states. Preserve landmark continuity, label states and expose gameplay consequences, 16:9.

### BRD-12 - UI Density and Accessibility Board

**Use:** Compare information hierarchy rather than only visual style.

**Reusable image prompt:** Create a UI comparison board for the same vehicle gameplay scene in no-HUD, minimal, standard, tactical, simulation, high-contrast, large-text and colour-independent variants. Keep scene and camera identical, label states and demonstrate hierarchy, 16:9.


## 10. Lighting Directions

### LGT-01 - Hard Midday Sun

**Visual effect:** Sharp shadows, exposed form and high material clarity.

**Best fit:** Desert, farm, construction, architecture.

**Main risk:** Can flatten atmosphere and hide screen readability.

**Reusable prompt fragment:** Use hard overhead midday sunlight, crisp short shadows, high surface clarity, bright sky bounce and restrained exposure; preserve readable route edges.


### LGT-02 - Golden Hour

**Visual effect:** Warm low-angle light stretches shadows and gives depth.

**Best fit:** Road journeys, farms, deserts, hopeful scenes.

**Main risk:** Can become generic cinematic wallpaper.

**Reusable prompt fragment:** Use low warm golden-hour sunlight, long directional shadows, cool ambient fill and visible depth across the route; keep objectives readable.


### LGT-03 - Blue Hour

**Visual effect:** Cool environmental light with remaining warm practical lights.

**Best fit:** Cities, ports, calm transitions, suspense.

**Main risk:** Low contrast may reduce vehicle silhouette.

**Reusable prompt fragment:** Use deep blue-hour ambient light with warm windows and vehicle lamps, soft sky gradient and clear silhouette separation.


### LGT-04 - Bright Overcast

**Visual effect:** Soft shadowless illumination exposes colour and geometry evenly.

**Best fit:** UI testing, asset review, farm, city, production sheets.

**Main risk:** Can feel visually flat.

**Reusable prompt fragment:** Use bright overcast daylight, broad soft illumination, gentle contact shadows and accurate material colour without dramatic highlights.


### LGT-05 - Moonlit Night

**Visual effect:** Cool directional moonlight with deep shadow and selective practicals.

**Best fit:** Survival, exploration, quiet landscapes.

**Main risk:** Threats and roads can disappear.

**Reusable prompt fragment:** Use directional moonlight, cool sky fill, selective warm practical lights, visible terrain contours and controlled darkness without crushing gameplay information.


### LGT-06 - Headlights Only

**Visual effect:** The vehicle creates the visible world through a moving cone of light.

**Best fit:** Horror, caves, whiteout, power failure.

**Main risk:** Narrow visibility can obscure composition.

**Reusable prompt fragment:** Light the scene primarily through vehicle headlights and work lamps, with darkness beyond, reflective hazards and readable near-field route choices.


### LGT-07 - Industrial Practicals

**Visual effect:** Work lights, sodium lamps, machinery indicators and welding define space.

**Best fit:** Factory, port, mine, construction, scrapyard.

**Main risk:** Too many local lights create clutter.

**Reusable prompt fragment:** Use believable industrial practical lighting from work lamps, machinery indicators, welding and safety beacons, with restrained ambient fill.


### LGT-08 - Neon and Emissive City

**Visual effect:** Signs, lanes and vehicles emit functional coloured light.

**Best fit:** Future city, arcade race, nightlife.

**Main risk:** Can become decorative cyberpunk noise.

**Reusable prompt fragment:** Use functional neon lighting tied to roads, traffic and navigation, with wet reflections and disciplined colour zones rather than random signs.


### LGT-09 - Emergency Power

**Visual effect:** Normal lighting collapses into red, amber or sparse backup systems.

**Best fit:** Breach, siege, facility failure, rescue.

**Main risk:** Uniform red lighting destroys colour coding.

**Reusable prompt fragment:** Use intermittent emergency lighting, dark unpowered areas, backup beacons and local work lights; reserve red for critical state rather than coating everything.


### LGT-10 - Firelight

**Visual effect:** Warm unstable light reveals movement through flicker and smoke.

**Best fit:** Night camps, damage, siege, volcanic settings.

**Main risk:** Can romanticise destruction or obscure UI.

**Reusable prompt fragment:** Use dynamic firelight and ember glow as local sources, with cool ambient contrast, smoke shadows and readable vehicle surfaces.


### LGT-11 - Storm Lightning

**Visual effect:** Brief high-intensity flashes reveal threats and terrain.

**Best fit:** Storm chasing, sea, monsoon, horror.

**Main risk:** Random flashes can feel visually incoherent.

**Reusable prompt fragment:** Use dark storm ambient light punctuated by directional lightning flashes that briefly reveal landmarks, hazards and silhouettes.


### LGT-12 - Underwater Caustics

**Visual effect:** Moving filtered light patterns communicate water depth and surface motion.

**Best fit:** Shallow ocean, underwater ruins, flooded interiors.

**Main risk:** Strong patterns can distract from route edges.

**Reusable prompt fragment:** Use filtered underwater light, slow caustic patterns, particulate beams and depth-dependent colour while preserving navigation contrast.


### LGT-13 - Bioluminescent Ecology

**Visual effect:** Living organisms and surfaces provide coloured navigational light.

**Best fit:** Alien, underwater, bio-world, fantasy.

**Main risk:** Can lose hierarchy if everything glows.

**Reusable prompt fragment:** Use sparse bioluminescent organisms as landmarks, hazards and route cues, with dark non-emissive areas and controlled colour families.


### LGT-14 - Orbital Sunlight

**Visual effect:** Unfiltered sun creates extreme light and shadow with reflected planetary fill.

**Best fit:** Moon, asteroid, station exterior, space salvage.

**Main risk:** Black shadows can hide orientation.

**Reusable prompt fragment:** Use hard unfiltered solar light, deep shadow, subtle planetary bounce and strong rim light to clarify spacecraft orientation.


### LGT-15 - Eclipse and Partial Light

**Visual effect:** Large moving shadows create temporary safe or dangerous windows.

**Best fit:** Planetary, alien, dramatic systemic events.

**Main risk:** Can feel like pure spectacle unless linked to play.

**Reusable prompt fragment:** Use a moving eclipse shadow that changes visibility, temperature or energy generation; show the boundary clearly across terrain.


### LGT-16 - Volumetric Fog Light

**Visual effect:** Beams, haze and silhouettes create depth and uncertainty.

**Best fit:** Swamp, night farm, forest, port, haunted town.

**Main risk:** Excess fog hides playable space.

**Reusable prompt fragment:** Use restrained volumetric haze and directional beams to separate depth layers while keeping the immediate route and objectives crisp.


### LGT-17 - High-Key Playful Light

**Visual effect:** Bright soft light and coloured bounce create safe energetic space.

**Best fit:** Toy, kitchen, cloud island, family modes.

**Main risk:** Can remove physical weight.

**Reusable prompt fragment:** Use bright high-key lighting, soft shadows, cheerful coloured bounce and crisp object separation without plastic overexposure.


### LGT-18 - Noir Low-Key Light

**Visual effect:** A small number of hard sources create graphic silhouettes and mystery.

**Best fit:** Stealth, haunted town, corporate extraction, detective play.

**Main risk:** May sacrifice environmental information.

**Reusable prompt fragment:** Use low-key noir lighting with hard slashes, silhouette edges, reflective surfaces and one functional accent colour.


## 11. Camera and Lens Directions

### CAM-01 - Close Chase

**Visual effect:** Near the rear of the vehicle, emphasising handling and impact.

**Best fit:** Racing, combat, narrow routes.

**Main risk:** Weak situational awareness.

**Reusable prompt fragment:** Use a close third-person chase camera just above and behind the vehicle, strong vehicle presence, readable near-field route and controlled motion blur.


### CAM-02 - Wide Chase

**Visual effect:** Pull back to show route choices, scale and surrounding systems.

**Best fit:** Exploration, convoy, rescue, large vehicles.

**Main risk:** Vehicle may lose emotional presence.

**Reusable prompt fragment:** Use a wide third-person chase camera with the vehicle occupying roughly one-sixth of frame and multiple upcoming routes visible.


### CAM-03 - Low Wheel-Level

**Visual effect:** Near-ground camera communicates speed, weight and terrain texture.

**Best fit:** Racing, heavy machinery, toy scale.

**Main risk:** Obstacles can block the view.

**Reusable prompt fragment:** Use a low wheel-level camera, strong foreground motion, visible suspension and terrain contact, while keeping the next obstacle readable.


### CAM-04 - High Third-Person

**Visual effect:** Raised view shows immediate planning space without becoming top-down.

**Best fit:** Farming, rescue, logistics, tactical driving.

**Main risk:** Can feel detached.

**Reusable prompt fragment:** Use a high third-person camera that reveals nearby lanes, workers, hazards and objectives while preserving vehicle scale.


### CAM-05 - Top-Down Tactical

**Visual effect:** Directly or nearly overhead for spatial control.

**Best fit:** Extraction, arena, swarm, editor, puzzle.

**Main risk:** Reduces vertical drama and vehicle detail.

**Reusable prompt fragment:** Use a top-down tactical camera with clear terrain layers, vehicle facing, sightlines, cover and objective zones.


### CAM-06 - Isometric

**Visual effect:** Fixed angled view provides a model-like readable world.

**Best fit:** Strategy hybrids, diorama, construction, maps.

**Main risk:** Corners and tall objects can occlude play.

**Reusable prompt fragment:** Use a fixed isometric camera with occlusion-aware buildings, clean ground readability and strong object silhouettes.


### CAM-07 - Cockpit

**Visual effect:** Information and world are experienced from the vehicle interior.

**Best fit:** Simulation, immersion, survival.

**Main risk:** Limits vehicle customisation visibility.

**Reusable prompt fragment:** Use a cockpit camera with functional instruments, visible vehicle frame, mirrors and unobstructed route view; avoid decorative dashboard clutter.


### CAM-08 - Hood or Bumper

**Visual effect:** Forward view retains speed while reducing cockpit obstruction.

**Best fit:** Racing, narrow tunnels, cinematic driving.

**Main risk:** Little awareness of vehicle width.

**Reusable prompt fragment:** Use a hood-level forward camera with visible front bodywork, route apex and clear lateral reference points.


### CAM-09 - Side-On Tracking

**Visual effect:** The camera moves laterally with the vehicle.

**Best fit:** Train missions, 2.5D traversal, stunts.

**Main risk:** Route depth and turning become limited.

**Reusable prompt fragment:** Use a side-on tracking camera with layered foreground and background, readable jump arcs and route switches.


### CAM-10 - Fixed Diorama

**Visual effect:** Each space is framed like a physical set and the camera changes between rooms or zones.

**Best fit:** Toy worlds, puzzle spaces, calm management.

**Main risk:** Transitions can disrupt control.

**Reusable prompt fragment:** Use a fixed diorama camera with complete room readability, miniature scale cues and a clear path across the set.


### CAM-11 - Long-Lens Compression

**Visual effect:** Distant objects appear closer, intensifying pursuit and environmental scale.

**Best fit:** Convoy, storms, migration, long roads.

**Main risk:** Depth judgement becomes harder.

**Reusable prompt fragment:** Use a long-lens chase view that compresses distant storm, convoy or creature scale while preserving lane depth through markers and shadows.


### CAM-12 - Drone Follow

**Visual effect:** A semi-autonomous camera orbits and anticipates action.

**Best fit:** Open landscapes, creator-friendly footage, casual play.

**Main risk:** Unpredictable movement can cause discomfort.

**Reusable prompt fragment:** Use a smooth drone-follow camera with slow anticipatory repositioning, stable horizon and clear player control direction.


### CAM-13 - Tactical Free Camera

**Visual effect:** Player can pan, rotate and zoom independently while time slows or pauses.

**Best fit:** Convoy orders, construction, editor, defence.

**Main risk:** Breaks immediacy.

**Reusable prompt fragment:** Use a tactical free camera above the scene with clear selection, movement and order previews, distinct from real-time chase view.


### CAM-14 - Split Role View

**Visual effect:** Two simultaneous views show different roles or scales.

**Best fit:** Co-op crew, chase plus map, vehicle plus drone.

**Main risk:** Consumes screen space and adds cognitive load.

**Reusable prompt fragment:** Use a primary driving view with a smaller role-specific secondary view such as drone, gunner or map, maintaining clear hierarchy.


### CAM-15 - Cinematic Replay Camera

**Visual effect:** Authored or procedural camera cuts present key moments after play.

**Best fit:** Sharing, debrief, spectacle.

**Main risk:** Unsuitable for direct control.

**Reusable prompt fragment:** Use a replay camera sequence with establishing, tracking, close detail and impact shots derived from the same recorded action.


### CAM-16 - Free-Orbit Space Camera

**Visual effect:** Camera rotates around a craft with no fixed up direction.

**Best fit:** Asteroids, orbital station, zero gravity.

**Main risk:** Orientation confusion and motion sickness.

**Reusable prompt fragment:** Use a free-orbit third-person camera with stable craft-relative references, velocity vector and horizon substitutes.


## 12. Weather Directions

### WTH-01 - Clear Stable Weather

**Visual effect:** Baseline visibility and predictable handling.

**Best fit:** Asset, route and UI evaluation.

**Main risk:** May hide environmental depth.

**Reusable prompt fragment:** Use clear stable weather with high visibility and neutral environmental motion.


### WTH-02 - Light Rain

**Visual effect:** Wet surfaces, softer distance and mild grip change.

**Best fit:** City, farm, journey, atmosphere.

**Main risk:** Often used decoratively without gameplay effect.

**Reusable prompt fragment:** Use light rain that creates wet surfaces, visible droplets and modest grip change without obscuring the route.


### WTH-03 - Monsoon Downpour

**Visual effect:** Heavy water changes visibility, depth, flow and infrastructure.

**Best fit:** Urban rescue, rural flood, logistics.

**Main risk:** Can overwhelm image generation and screen readability.

**Reusable prompt fragment:** Use sustained monsoon rain with rising water, visible drainage, current and reduced visibility tied to gameplay.


### WTH-04 - Ground Fog

**Visual effect:** Low fog hides hazards while preserving skyline and landmarks.

**Best fit:** Swamp, farm night, haunted town.

**Main risk:** Can look like generic atmosphere.

**Reusable prompt fragment:** Use low ground fog that pools in depressions and reveals moving silhouettes while landmarks remain visible above it.


### WTH-05 - Dense Mist

**Visual effect:** Uniform moisture reduces long-range certainty.

**Best fit:** Forest, coast, mountain, mystery.

**Main risk:** Flattens depth.

**Reusable prompt fragment:** Use dense mist with progressively reduced contrast, local lights and close route markers.


### WTH-06 - Snowfall

**Visual effect:** Accumulation, tracks and muted sound alter traversal.

**Best fit:** Expedition, town, mountain.

**Main risk:** White surfaces can erase contrast.

**Reusable prompt fragment:** Use active snowfall, visible accumulation, tyre or track marks and coloured landmarks for navigation.


### WTH-07 - Whiteout

**Visual effect:** Wind-driven snow removes horizon and orientation.

**Best fit:** Survival and rescue.

**Main risk:** Potentially unreadable by design.

**Reusable prompt fragment:** Use near-whiteout conditions with route poles, headlights, wind direction and intermittent landmarks.


### WTH-08 - Dust Storm

**Visual effect:** Airborne particles hide terrain and damage machinery.

**Best fit:** Desert convoy, excavation, alien world.

**Main risk:** Orange monotony and low clarity.

**Reusable prompt fragment:** Use a moving dust wall, crosswind particles, reduced visibility and filter or heat consequences.


### WTH-09 - Thunderstorm

**Visual effect:** Rain, gusts and lightning create time-varying hazards.

**Best fit:** Storm chase, port, farm defence.

**Main risk:** Too many simultaneous effects.

**Reusable prompt fragment:** Use layered thunderstorm conditions with visible gusts, rain bands and lightning-linked hazard windows.


### WTH-10 - Hail

**Visual effect:** Physical impacts, slippery surfaces and shelter decisions.

**Best fit:** Plains, mountains, storms.

**Main risk:** Small hail is hard to depict meaningfully.

**Reusable prompt fragment:** Use visible hail impacts on vehicle and ground, accumulating slick surfaces and shelter opportunities.


### WTH-11 - Extreme Heat

**Visual effect:** Heat haze, cooling demand and material stress dominate.

**Best fit:** Desert, volcanic, industrial.

**Main risk:** Visual effect can distort readability.

**Reusable prompt fragment:** Use restrained heat shimmer, bleached distance, hot surfaces and cooling-system consequences.


### WTH-12 - Ashfall

**Visual effect:** Fine ash changes light, traction, filters and visibility.

**Best fit:** Volcanic, post-collapse, wildfire aftermath.

**Main risk:** Can resemble snow or generic dust.

**Reusable prompt fragment:** Use dark ashfall, surface accumulation, filter warnings and muted sunlight with clear material distinction.


### WTH-13 - High Wind

**Visual effect:** Crosswinds alter vehicles, debris, crops, waves and flight.

**Best fit:** Sky city, storm, convoy, bridge.

**Main risk:** Wind is invisible unless shown through effects.

**Reusable prompt fragment:** Use flags, vegetation, dust, vehicle lean and airborne debris to make crosswind direction legible.


### WTH-14 - Alien Atmospheric Event

**Visual effect:** Non-Earth weather changes gravity, charge, colour or matter state.

**Best fit:** Alien worlds and experimental modes.

**Main risk:** Can become arbitrary spectacle.

**Reusable prompt fragment:** Use one coherent alien weather rule, such as charged crystal rain or low-gravity dust, with visible gameplay consequences.


### WTH-15 - Calm After Storm

**Visual effect:** Wet surfaces, broken systems, clearing light and recovery create contrast.

**Best fit:** Repair, rescue, reflective scenes.

**Main risk:** Less immediate action.

**Reusable prompt fragment:** Use clearing clouds, remaining water or debris, soft returning light and visible recovery work.


## 13. Atmosphere and Emotional Tone

### ATM-01 - Cosy Productive

**Intent:** Work feels satisfying, safe and tangible.

**Best fit:** Farm, workshop, caravan, restoration.

**Reusable prompt fragment:** Use warm practical activity, organised tools, gentle motion and visible progress without sugary sentimentality.


### ATM-02 - Playful Competitive

**Intent:** Rivalry is energetic and expressive rather than hostile.

**Best fit:** Toy race, arcade, sports.

**Reusable prompt fragment:** Use bold readable reactions, playful hazards, clean rivalry and celebratory feedback.


### ATM-03 - Tense Operational

**Intent:** Pressure comes from systems failing, not only enemies.

**Best fit:** Rescue, port, airport, construction.

**Reusable prompt fragment:** Use clocks, dependent tasks, changing hazards and disciplined teams.


### ATM-04 - Lonely Exploratory

**Intent:** Scale and silence make discovery meaningful.

**Best fit:** Alien survey, snow, ocean, space.

**Reusable prompt fragment:** Use wide negative space, sparse signals and a small vehicle against a large environment.


### ATM-05 - Uncanny Familiar

**Intent:** Ordinary places behave slightly wrong.

**Best fit:** Haunted town, dream, time fracture.

**Reusable prompt fragment:** Use familiar architecture with subtle impossible changes and restrained supernatural cues.


### ATM-06 - Heroic Mechanical

**Intent:** Machines feel capable, purposeful and earned.

**Best fit:** Construction, rescue, defence, convoy.

**Reusable prompt fragment:** Use strong silhouettes, functional attachments and decisive lighting without militaristic excess.


### ATM-07 - Chaotic Improvised

**Intent:** Success comes from adaptation amid messy systems.

**Best fit:** Scrapyard, post-collapse, siege.

**Reusable prompt fragment:** Use asymmetry, temporary fixes, conflicting motion and readable pockets of control.


### ATM-08 - Sacred Monumental

**Intent:** The environment evokes awe and restraint.

**Best fit:** Ruins, colossal creatures, alien structures.

**Reusable prompt fragment:** Use vast scale, slow movement, deliberate light and minimal interface.


### ATM-09 - Industrial Relentless

**Intent:** Machinery and schedules continue regardless of the player.

**Best fit:** Factory, mine, port, train.

**Reusable prompt fragment:** Use rhythmic machinery, repeating structures and narrow windows for action.


### ATM-10 - Hopeful Rebuilding

**Intent:** The world visibly improves through practical work.

**Best fit:** Canal restoration, settlements, farms.

**Reusable prompt fragment:** Show before and after cues, returning life and infrastructure reconnecting.


### ATM-11 - Melancholic Journey

**Intent:** Places and machines carry history without stopping forward movement.

**Best fit:** Road trip, abandoned park, ruined city.

**Reusable prompt fragment:** Use weathered surfaces, quiet landmarks and restrained warm-cool contrast.


### ATM-12 - Surreal Liberating

**Intent:** Impossible movement feels freeing rather than threatening.

**Best fit:** Dream roads, cloud worlds, wormholes.

**Reusable prompt fragment:** Use fluid geometry, open space and coherent visual rhythm.


## 14. Colour-System Directions

### CLR-01 - Natural Regional Palette

**Intent:** Colours derive from believable climate, soil, vegetation and materials.

**Reusable prompt fragment:** Use locally coherent colours with one gameplay accent.


### CLR-02 - Warm-Cool Functional Split

**Intent:** Warm marks safety or activity; cool marks distance or danger, or vice versa.

**Reusable prompt fragment:** Use a deliberate warm-cool hierarchy tied to gameplay state.


### CLR-03 - Complementary Hero Contrast

**Intent:** Vehicle and environment use opposite colour families for silhouette.

**Reusable prompt fragment:** Give the hero vehicle a complementary colour against the dominant environment.


### CLR-04 - Analogous Calm Palette

**Intent:** Neighbouring hues create cohesion and low visual aggression.

**Reusable prompt fragment:** Use an analogous three-hue palette with value contrast carrying gameplay readability.


### CLR-05 - Monochrome Plus Accent

**Intent:** One accent carries routes, threats or interaction.

**Reusable prompt fragment:** Render most surfaces in a narrow neutral range and reserve one accent for actionable information.


### CLR-06 - Faction-Coded Palette

**Intent:** Colour consistently identifies organisations across vehicles, buildings and UI.

**Reusable prompt fragment:** Use faction colours sparingly across markings and interface, with shapes as redundant coding.


### CLR-07 - Biome-Coded Palette

**Intent:** Each world has a recognisable palette while shared objects retain identity.

**Reusable prompt fragment:** Define a biome palette and preserve vehicle identity through stable neutral materials.


### CLR-08 - Time-Coded Palette

**Intent:** Colour temperature and saturation shift with time of day or timeline.

**Reusable prompt fragment:** Use palette progression to indicate time while maintaining object colours.


### CLR-09 - Threat Escalation Palette

**Intent:** The environment gradually adopts warning colours as danger rises.

**Reusable prompt fragment:** Introduce warning colour only as threat escalates, not from the beginning.


### CLR-10 - Toybox Saturation

**Intent:** High saturation is organised through large simple colour blocks.

**Reusable prompt fragment:** Use bold clean colour blocks, neutral separators and limited simultaneous accents.


### CLR-11 - Earth and Machine

**Intent:** Organic terrain uses muted earth hues; machinery uses controlled industrial paint.

**Reusable prompt fragment:** Separate organic and manufactured forms through material-aware colour.


### CLR-12 - Alien Spectral Palette

**Intent:** Unfamiliar colour relationships remain internally consistent.

**Reusable prompt fragment:** Use one unusual spectral relationship repeated across sky, geology, life and UI accents.


## 15. Material and Surface Directions

### MAT-01 - Painted Industrial Metal

**Intent:** Scratches, seams, grease and repair marks communicate use.

**Reusable prompt fragment:** Use layered painted metal with edge wear, grease and replaceable panels.


### MAT-02 - Toy Plastic

**Intent:** Mould seams, translucent parts, stickers and scuffs communicate scale.

**Reusable prompt fragment:** Use varied toy plastic finishes, mould lines, safe rounded edges and worn stickers.


### MAT-03 - Wood, Canvas and Rope

**Intent:** Handmade vehicles feel repairable and local.

**Reusable prompt fragment:** Use timber structure, canvas covers, rope tension and metal fasteners with believable load paths.


### MAT-04 - Salvaged Scrap

**Intent:** Mismatched components show provenance and improvisation.

**Reusable prompt fragment:** Use varied salvaged metals and reused objects while preserving functional assembly logic.


### MAT-05 - Ceramic Composite

**Intent:** Clean heat-resistant surfaces create advanced but non-metallic machines.

**Reusable prompt fragment:** Use matte ceramic panels, fine seams, heat staining and restrained metallic structure.


### MAT-06 - Transparent and Translucent

**Intent:** Internal systems become visible through glass, resin or membranes.

**Reusable prompt fragment:** Use transparent sections selectively to expose function without making the entire object visually noisy.


### MAT-07 - Rubber and Soft Armour

**Intent:** Flexible surfaces communicate impact, seal and grip.

**Reusable prompt fragment:** Use compressed rubber, inflatable structures and flexible armour with visible deformation.


### MAT-08 - Bio-Organic Surface

**Intent:** Living material heals, pulses and changes state.

**Reusable prompt fragment:** Use non-gory organic material with subtle pulse, translucency and mechanical attachment points.


### MAT-09 - Energy or Holographic Matter

**Intent:** Some vehicle parts are projected, temporary or field-based.

**Reusable prompt fragment:** Use energy surfaces only where they perform a function, with clear emitters and failure states.


### MAT-10 - Paper and Card

**Intent:** Folds, print, tabs and layered edges define a crafted world.

**Reusable prompt fragment:** Use visible folds, cut edges, print texture and structural tabs.


### MAT-11 - Mud, Snow and Environmental Coating

**Intent:** Accumulation records where the vehicle has travelled.

**Reusable prompt fragment:** Apply location-specific dirt, mud, snow, salt or ash according to contact and airflow.


### MAT-12 - Modular Mixed Material

**Intent:** Each subsystem has a material suited to its function.

**Reusable prompt fragment:** Assign structure, armour, seals, tools and energy systems distinct but coherent materials.


## 16. VFX Directions

### VFX-01 - Tyre and Track Contact

**Intent:** Dust, mud, snow, water and debris reveal traction and weight.

**Reusable prompt fragment:** Show surface-specific contact effects tied to wheel slip and vehicle mass.


### VFX-02 - Speed Language

**Intent:** Motion blur, streaks, camera shake and particles indicate speed.

**Reusable prompt fragment:** Use restrained directional motion cues while keeping vehicle and route sharp.


### VFX-03 - Impact and Damage

**Intent:** Sparks, fragments, deformation and warning effects explain collisions.

**Reusable prompt fragment:** Use material-specific impact effects and persistent visible damage, not generic explosions.


### VFX-04 - Tool and Work Feedback

**Intent:** Cutting, drilling, sowing, spraying and lifting have distinctive effects.

**Reusable prompt fragment:** Show tool-specific particles and material response directly at the contact point.


### VFX-05 - Scanning and Sensors

**Intent:** Pulses, highlights and uncertainty visualize hidden information.

**Reusable prompt fragment:** Use sparse scan waves and confidence gradients that preserve world visibility.


### VFX-06 - Weather Interaction

**Intent:** Rain, snow, dust and wind react to vehicle motion.

**Reusable prompt fragment:** Make weather bend, splash, accumulate or trail according to vehicle movement.


### VFX-07 - Energy and Heat

**Intent:** Heat shimmer, glow and venting show power stress.

**Reusable prompt fragment:** Tie emissive intensity, venting and distortion to actual energy state.


### VFX-08 - Transformation

**Intent:** Mechanical movement, locks, seals and energy transfer explain mode change.

**Reusable prompt fragment:** Show ordered transformation stages with readable moving parts and settling motion.


### VFX-09 - Objective and Route

**Intent:** World-space markers guide without floating clutter.

**Reusable prompt fragment:** Use grounded route projections, physical beacons and landmark-linked markers.


### VFX-10 - Environmental Destruction

**Intent:** Breakage reflects material, structure and force.

**Reusable prompt fragment:** Use staged material-specific destruction with persistent debris and changed navigation.


### VFX-11 - Reward and Progress

**Intent:** Feedback confirms success without covering play.

**Reusable prompt fragment:** Use brief localised reward effects tied to the completed object or route.


### VFX-12 - Silence and Suppression

**Intent:** Removing effects can communicate stealth, vacuum, power loss or emotional change.

**Reusable prompt fragment:** Deliberately reduce particles, glow and motion feedback to mark suppressed states.


## 17. Composition Directions

### CMP-01 - Hero Vehicle Dominant

**Intent:** Vehicle occupies the visual centre and defines the frame.

**Reusable prompt fragment:** Place the vehicle on a strong third with clear silhouette and route ahead.


### CMP-02 - Route Dominant

**Intent:** The path and its choices are the primary subject.

**Reusable prompt fragment:** Frame multiple upcoming routes with the vehicle smaller but clearly oriented.


### CMP-03 - Landmark Led

**Intent:** A destination or structure pulls the eye through the scene.

**Reusable prompt fragment:** Use a major landmark as the focal endpoint and compose the road toward it.


### CMP-04 - Threat Encirclement

**Intent:** Pressure arrives from several directions around a defended centre.

**Reusable prompt fragment:** Place threats in layered arcs around the objective while preserving escape routes.


### CMP-05 - Layered Depth

**Intent:** Foreground, midground and background each contain gameplay information.

**Reusable prompt fragment:** Use three clear depth bands with one actionable element in each.


### CMP-06 - Scale Contrast

**Intent:** A small vehicle is contrasted against a colossal world element.

**Reusable prompt fragment:** Keep the vehicle readable while a massive creature, structure or storm dominates the background.


### CMP-07 - Split Objective

**Intent:** Two valuable directions compete visually and mechanically.

**Reusable prompt fragment:** Frame two distinct objectives on opposite sides with the player positioned between them.


### CMP-08 - Process Chain

**Intent:** Several vehicles or machines show sequential work across the frame.

**Reusable prompt fragment:** Compose an operational chain from input through processing to output.


### CMP-09 - Circular Arena

**Intent:** Action revolves around a central space, structure or capture point.

**Reusable prompt fragment:** Use radial lanes and clear ring hierarchy around a central objective.


### CMP-10 - Vertical Stack

**Intent:** Routes and activity layer above and below the player.

**Reusable prompt fragment:** Compose multiple readable elevations connected by ramps, lifts or flight paths.


### CMP-11 - Negative Space Tension

**Intent:** Empty space creates uncertainty, loneliness or anticipation.

**Reusable prompt fragment:** Leave a large quiet region ahead of the vehicle with one distant signal or threat.


### CMP-12 - Diorama Completeness

**Intent:** The entire playable room or small zone is visible at once.

**Reusable prompt fragment:** Frame the complete play space with clear boundaries, entrances and interactive clusters.


## 18. Scale Directions

### SCL-01 - Micro

**Intent:** Dust, circuitry, droplets and fibres become terrain.

**Reusable prompt fragment:** Use macro material detail and familiar objects as giant landmarks.


### SCL-02 - Toy

**Intent:** Furniture and household objects define enormous navigable spaces.

**Reusable prompt fragment:** Use low cameras and tactile toy materials to communicate size.


### SCL-03 - Human Vehicle

**Intent:** Cars, bikes and utility machines relate directly to people and streets.

**Reusable prompt fragment:** Use doors, people, lane width and furniture as reliable scale references.


### SCL-04 - Industrial

**Intent:** Heavy machines reshape terrain and infrastructure.

**Reusable prompt fragment:** Use workers, ladders, tyres and buildings to communicate mass.


### SCL-05 - Convoy

**Intent:** Several vehicles form a moving system larger than one rig.

**Reusable prompt fragment:** Show formation, spacing and shared route across a wide frame.


### SCL-06 - Settlement

**Intent:** Vehicles connect buildings, services and populations.

**Reusable prompt fragment:** Show a vehicle as part of a functioning district rather than isolated action.


### SCL-07 - Landscape

**Intent:** The route crosses geographic formations larger than any structure.

**Reusable prompt fragment:** Use long roads, weather and terrain layers with a small readable vehicle.


### SCL-08 - Colossal

**Intent:** Creatures, machines or ruins dwarf cities and vehicles.

**Reusable prompt fragment:** Use multiple intermediate scale references to avoid arbitrary gigantism.


### SCL-09 - Planetary

**Intent:** Travel and systems span regions or an entire world.

**Reusable prompt fragment:** Connect orbit, region and local surface through clear scale transitions.


### SCL-10 - Orbital

**Intent:** Relative position, velocity and rotation replace conventional ground scale.

**Reusable prompt fragment:** Use planet curvature, station modules and craft shadows as orientation references.


## 19. Motion and Animation Directions

### MOT-01 - Heavy Mechanical

**Intent:** Slow acceleration, suspension compression and delayed settling.

**Reusable prompt fragment:** Show mass through body lag, tyre deformation and long braking.


### MOT-02 - Agile Responsive

**Intent:** Immediate steering, lean and quick recovery.

**Reusable prompt fragment:** Show sharp direction changes, controlled body roll and precise contact.


### MOT-03 - Elastic Toy

**Intent:** Spring, wobble and squash create playful motion.

**Reusable prompt fragment:** Use physically coherent toy bounce and spring recoil.


### MOT-04 - Rhythmic Machinery

**Intent:** Repeating industrial cycles form timing challenges.

**Reusable prompt fragment:** Synchronise conveyors, arms, presses or pumps into readable loops.


### MOT-05 - Floating Hover

**Intent:** Vehicles glide with subtle drift and stabilisation.

**Reusable prompt fragment:** Show lateral drift, corrective thrusters and ground effect.


### MOT-06 - Zero-Gravity Momentum

**Intent:** Rotation and velocity persist without automatic stopping.

**Reusable prompt fragment:** Show inertial travel, thruster corrections and relative motion cues.


### MOT-07 - Transforming

**Intent:** Mode changes follow a clear mechanical sequence.

**Reusable prompt fragment:** Animate locks, folds, weight transfer and final settling in ordered stages.


### MOT-08 - Swarm Coordinated

**Intent:** Many units form patterns and temporary structures.

**Reusable prompt fragment:** Show local unit motion producing a clear larger formation.


### MOT-09 - Environmental Reactive

**Intent:** Vehicle movement responds to mud, water, snow, wind and terrain.

**Reusable prompt fragment:** Vary body motion, contact and wake according to surface.


### MOT-10 - Unstable Damaged

**Intent:** Misalignment, vibration and delayed response communicate failure.

**Reusable prompt fragment:** Use asymmetric movement and component-specific instability.


### MOT-11 - Cinematic Exaggerated

**Intent:** Motion is amplified for impact while remaining readable.

**Reusable prompt fragment:** Use brief camera and vehicle exaggeration only at key moments.


### MOT-12 - Calm Deliberate

**Intent:** Slow controlled motion makes work and exploration satisfying.

**Reusable prompt fragment:** Use smooth starts, precise tool movement and minimal camera shake.


## 20. World-State and Transformation Directions

### TRN-01 - Day to Night

**Intent:** Work, traffic, threats and lighting change over one continuous cycle.

**Reusable prompt fragment:** Show the same landmarks and routes changing function from day to night.


### TRN-02 - Seasonal Change

**Intent:** Water, snow, crops, roads and settlements alter across seasons.

**Reusable prompt fragment:** Change geometry, access and activity, not only colour.


### TRN-03 - Weather Escalation

**Intent:** Clear conditions develop into storm, flood, snow or dust.

**Reusable prompt fragment:** Show visible stages with increasing systemic consequences.


### TRN-04 - Power State

**Intent:** Powered, partial, emergency and dark states alter navigation.

**Reusable prompt fragment:** Tie light, doors, machinery and hazards to the power network.


### TRN-05 - Construction Progress

**Intent:** The world moves from terrain to structure to functioning district.

**Reusable prompt fragment:** Preserve landmark continuity across construction phases.


### TRN-06 - Damage and Repair

**Intent:** A location is damaged, bypassed, stabilised and rebuilt.

**Reusable prompt fragment:** Show persistent damage and practical repair stages.


### TRN-07 - Ecological Restoration

**Intent:** Polluted or barren spaces regain water quality, plants and wildlife.

**Reusable prompt fragment:** Show measurable environmental changes linked to player work.


### TRN-08 - Occupation and Liberation

**Intent:** Control changes alter checkpoints, services, traffic and public life.

**Reusable prompt fragment:** Show functional world differences beyond flags and colour.


### TRN-09 - Temporal Era Shift

**Intent:** The same place changes between historical, present and future states.

**Reusable prompt fragment:** Preserve geography while architecture, roads and systems change.


### TRN-10 - Player-Built Evolution

**Intent:** Roads, farms, workshops and defences accumulate from player choices.

**Reusable prompt fragment:** Show a clear before, intermediate and mature player-shaped world.

## 21. Combination Grammar

### 21.1 Combination sizes

#### A. Atomic study

Use one catalog ID when testing one isolated question.

Examples:

- `LGT-06` - Can headlights alone make the route readable?
- `CAM-03` - Does a wheel-level camera make the tractor feel heavy?
- `MAT-02` - What does the vehicle language become when treated as a physical toy?
- `HUD-16` - How should the interface behave in high-contrast and low-motion modes?

The scene or object may be described in plain language without assigning IDs to every background decision.

#### B. Focused pair

Use two IDs when the design question concerns an interaction between two systems.

Examples:

- `SCN-33 + LGT-06` - Crystal cave expedition lit mainly by headlights.
- `RIG-17 + MAT-03` - Handmade sailing and cargo craft using wood, canvas and rope.
- `SCN-14 + CAM-10` - Toy-room race framed as a complete miniature diorama.
- `HUD-03 + CLR-05` - Tactical combat interface using monochrome plus one functional accent.

#### C. Focused trio

Use three IDs when one additional dimension is necessary to make the test meaningful.

Examples:

- `SCN-36 + CAM-11 + WTH-09` - Storm chasing with long-lens compression during a thunderstorm.
- `RIG-24 + UI-14 + STYLE-05` - Player-built vehicles, blueprint history and clean low-poly rendering.
- `SCN-42 + TRN-09 + CLR-08` - Time-fractured city with era changes communicated through time-coded colour.

#### D. Integrated gameplay frame

Use four or more IDs only when evaluating coexistence across systems.

Example:

- `SCN-04 + RIG-06 + HUD-03 + MAP-06 + STYLE-01`

This asks whether farm defence, agricultural vehicle identity, tactical HUD, parcel structure and rendering language work together. It is useful, but it should not become the default prompt pattern.

#### E. Comparison board

Use a `BRD` ID plus the one subject being held constant.

Examples:

- `BRD-07 + SCN-04` - The same farm defence scene across lighting states.
- `BRD-08 + RIG-06` - The same tractor action across camera languages.
- `BRD-09 + RIG-04` - The same compact car across material systems.

### 21.2 What should not be combined automatically

- Environment concept plus HUD, unless interface integration is the question.
- Rig sheet plus map, unless deployment footprint or path clearance is the question.
- Lighting board plus multiple different scenes, because geometry must stay fixed for comparison.
- Camera board plus changing action, because the camera effect becomes impossible to isolate.
- Art-style board plus different vehicles, unless vehicle identity across styles is the explicit question.
- Production orthographic sheet plus cinematic action framing in the same main panel.
- Every available dimension merely to make the prompt look comprehensive.

### 21.3 Naming rule

The displayed name must include only selected IDs, followed by a plain-language expansion.

Examples:

- `SCN-30 + ATM-11`
  - Long-Distance Road Journey + Melancholic Journey

- `RIG-22 + MAT-05 + LGT-14`
  - Magnetic Climber Family + Ceramic Composite + Orbital Sunlight

- `BRD-07 + SCN-04`
  - Lighting State Board + Farm Cycle: Night Siege

### 21.4 Design-question field

Every generation log should include:

**Design question:** One sentence describing what the visual is testing.

Examples:

- Can a farm remain visually recognisable while functioning as a night defence arena?
- Can an interface explain a transforming vehicle without relying on text?
- Does the low wheel-level camera improve perceived weight enough to justify reduced visibility?
- Can toy materials support sophisticated route planning without appearing aimed only at children?

## 22. Reusable Master Prompt Template

Use this for a focused or integrated visual. Delete every field that is not relevant. Do not fill categories merely because placeholders exist.

> Create a **[output type: playable screenshot / concept sheet / UI board / map board / key art / isolated study]** for an original browser-based vehicle game. Selected catalog references: **[list only the IDs deliberately chosen]**. The player fantasy is **[one sentence]**. Show **[primary action]**, **[secondary system]**, **[important landmark]**, **[threat or objective]**, and **[route choice]**. Camera: **[camera choice]**. Vehicle silhouette must remain clear at gameplay distance. Environment must communicate **[weather, time, materials, scale]**. UI should expose only **[five most important variables]**. Make the image feel like a believable playable frame or production design reference, not generic promotional art. Use original vehicle and interface designs, no existing brands or franchise likeness. **[aspect ratio]**.

---

## 23. Production-Reference Prompt Template

> Create a production-ready concept sheet for **[vehicle / prop / environment / HUD component]** from an original vehicle game. Include front, side, rear, top and three-quarter views where relevant; exploded or modular connection view; material and colour callouts; functional labels; scale reference; default, damaged and upgraded states; clear silhouette thumbnails; and one small in-game context image. Prioritise mechanical and gameplay readability over decoration. Neutral presentation background, controlled lighting, original design language, no existing brand marks, 16:9.

---

## 24. Selection Checklist Before Generating

### Required decisions

1. **Design question:** What exactly should this visual prove, compare or expose?
2. **Output type:** Playable screenshot, isolated study, production sheet, UI board, map, key art or comparison board.
3. **Selected IDs:** Include only the relevant IDs. One ID is valid.
4. **Held constants:** What must not change so the result can be compared?
5. **Primary subject:** Vehicle, environment, route, interface, map, material, lighting or motion.
6. **Camera:** Choose only when camera is important to the question.
7. **Action or state:** One dominant action, process or state.
8. **Readability target:** What must remain legible at first glance?
9. **Exclusions:** What must not appear, such as HUD, text, enemies, poster layout or unrelated catalog panels?
10. **Output ratio and intended use:** Exploration, implementation reference, social post, editor reference or asset sheet.

### Optional decisions

- Scene ID
- Rig ID
- HUD ID
- Map ID
- UI ID
- Style ID
- Lighting ID
- Camera ID
- Weather ID
- Atmosphere ID
- Colour ID
- Material ID
- VFX ID
- Composition ID
- Scale ID
- Motion ID
- Transformation ID

Optional means optional. Most generations should use only two to four deliberate constraints.

---

## 25. Combination Examples

### Sparse and focused examples

- `SCN-33 + LGT-06`  
  Crystal Cavern Expedition using headlights-only lighting. No HUD, no map and no named style required.

- `RIG-17 + MAT-03`  
  Boat and Ship Family explored through wood, canvas and rope. This is a rig sheet, not a scene.

- `SCN-36 + CAM-11 + WTH-09`  
  Storm Chaser Plains using long-lens compression during a thunderstorm.

- `HUD-16 + CLR-05`  
  Accessibility-adaptive interface using monochrome plus functional accent.

- `BRD-07 + SCN-04`  
  Farm Night Defence held constant while lighting changes.

- `TRN-07 + SCN-37`  
  Canal Restoration District shown through ecological recovery states.

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

## 26. Maintenance Rules

- New ideas receive permanent IDs.
- Do not overwrite an older concept. Add a revision note or a new variant.
- Generated images should record the exact IDs, design question, held constants, exclusions and final prompt used.
- Do not infer missing category IDs from visual details. Record only what was deliberately selected.
- Prefer focused studies before integrated combinations.
- Strong results should gain an `APPROVED REFERENCE` note, not silently replace the prompt.
- Failed generations should record why they failed: composition, text, vehicle clarity, UI density, style drift, or gameplay ambiguity.
- Implementation work begins only after an explicit instruction to build or prototype.


---

## 27. Visual Generation Log

This section records every generated exploration without promoting it to an approved production direction. Each entry keeps the exact combination, prompt, output reference, status, and review fields.

### GEN-001 — Farm Night Defence

**Combination:** `SCN-04 + RIG-06 + HUD-03 + MAP-06 + STYLE-01`  
**Combination class:** Integrated gameplay frame. This five-option structure is not the default for future images.  
**Design question:** Can a recognisable farm, agricultural rig, tactical combat layer, parcel-based territory and stylised PBR rendering coexist in one playable frame?  
**Expanded name:** Farm Night Defence + Agricultural Machine Rig + Tactical Combat HUD + Farm Parcel Grid + Stylised PBR  
**Status:** `GENERATED — UNREVIEWED`  
**Generated:** 2026-07-27  
**Output file:** `farm_night_defense_with_tactical_hud.png`  
**Approval:** Not approved. Awaiting explicit review.  
**Review fields:** composition, gameplay readability, rig identity, HUD hierarchy, map usefulness, art-direction fit, implementation feasibility.

**Exact generation prompt:**

> Create a single polished visual exploration image for an original browser-based vehicle game. This is a concept image, not based on any existing franchise. The image should prominently mention the chosen combination name at the top in clean readable text: "SCN-04 + RIG-06 + HUD-03 + MAP-06 + STYLE-01". Under or beside it, include a smaller readable subtitle: "Farm Night Defence + Agricultural Machine Rig + Tactical Combat HUD + Farm Parcel Grid + Stylised PBR".
> 
> Main image content: a playable in-game screenshot style scene of a farm at night transformed into a survival defense battleground. Show an armoured modular tractor as the hero vehicle, built from agricultural machinery with visible defensive add-ons: improvised floodlights, reinforced plating, a front plough-ram, and a mounted tool or turret attachment. The tractor is defending barns, fences, silos, and crop fields against shadowy creature attackers approaching from multiple directions. Include a moonlit sky, light fog or mist, warm farm lights, broken fences, and clear sightlines across field parcels. The environment should visibly reflect a farm parcel grid with lanes, crop blocks, dirt roads, irrigation lines, and defendable zones.
> 
> HUD/UI: integrate a tactical combat HUD that feels premium and readable. Include a central aiming reticle, directional threat indicators, weapon heat, ammo, segmented vehicle condition or armour, objective list, wave countdown, generator or power status, and mini-map or sector map showing parcel-based threat sectors. Keep the UI clean and believable, not overcrowded.
> 
> Style: stylised PBR 3D art with rich materials, cinematic but gameplay-readable lighting, clear silhouettes, and a premium modern browser-game feel. Make the vehicle silhouette strong and the route and combat space easy to understand. Emphasize that this is a real gameplay frame, not a poster collage. High detail, original design language, visually exciting but practical for a game.

---

### GEN-002 — Toy Room Grand Prix

**Combination:** `SCN-14 + RIG-03 + HUD-08 + MAP-04 + STYLE-04`  
**Expanded name:** Toy Room Grand Prix + Toy Vehicle Rig + Playful HUD + Procedural Road Network + Miniature Diorama  
**Status:** `GENERATION FAILED — CONTENT DRIFT`  
**Attempted:** 2026-07-27  
**Intended output file:** `toy_room_grand_prix_procedural_diorama.png`  
**Actual discarded outputs:** `a_wide_poster_like_design_moodboard_scene_over.png`, `a_wide_detailed_concept_art_game_design_moodboa.png`  
**Why this follows GEN-001:** It deliberately tests the opposite end of the design space: playful scale, tactile miniature materials, route improvisation, and non-combat information design.  

**Failure record:**

- Attempt 1 ignored the selected combination and rendered a visual-catalog poster around the earlier farm concept.
- Attempt 2 again ignored the selected IDs and rendered an unrelated desert combat-racing catalog board.
- Both outputs are `DISCARDED`, not references, and must not influence the game direction.
- Primary failure class: prompt adherence and catalog-context leakage.
- Secondary failure class: unwanted infographic layout instead of a clean playable frame.
- Retry constraint: generate only the toy-room playable scene, with no catalog, moodboard, metadata panels, or unrelated IDs.

**Approval:** Not approved. Awaiting explicit review.  
**Review fields:** toy-scale readability, route branching, procedural-map communication, vehicle modularity, HUD originality, hazard clarity, visual age range, implementation feasibility.

**Exact generation prompt:**

> Create a single polished visual exploration image for an original browser-based vehicle game. This is an exploratory playable-frame concept, not a poster collage and not based on any existing game or toy franchise.
> 
> Prominently show the chosen combination name at the top in clean readable text:
> "SCN-14 + RIG-03 + HUD-08 + MAP-04 + STYLE-04"
> 
> Add a smaller subtitle:
> "Toy Room Grand Prix + Toy Vehicle Rig + Playful HUD + Procedural Road Network + Miniature Diorama"
> 
> SCENE AND GAMEPLAY:
> Show a low chase-camera playable race inside a child's bedroom transformed into a huge miniature world. The hero vehicle is an original pull-back toy car assembled from modular toy parts. It is racing against several clearly different toy rigs across a procedurally assembled route made from books, wooden blocks, rulers, cardboard tubes, pencils, a folded blanket ramp, desk cables, storage boxes and a partially built track. The route should branch visibly into at least three meaningful choices: a fast exposed jump across books, a safer winding path under furniture, and a risky shortcut through a moving household hazard.
> 
> The image must communicate that the route changes between runs. Show modular road segments, snapping connectors, reroute arrows or a compact route preview that makes procedural assembly understandable without becoming abstract. Include memorable giant-scale hazards: a rolling ball, a cat paw or tail entering the play space, a desk fan creating a wind zone, and a human footstep warning in the far background. Keep the tone adventurous and playful, not childish or generic.
> 
> VEHICLE RIG:
> The hero toy car should have a strong silhouette and visible modularity: pull-back spring housing, swappable wheels, magnetic attachment points, clip-on spoiler, small cargo slot, front bumper tool and sticker-like cosmetic layers. Rival vehicles can include a block-built buggy, wind-up truck, bottle-cap racer and magnetic wall crawler. All designs must be original and physically believable as toys.
> 
> HUD:
> Use a distinctive playful HUD that feels made from stickers, translucent plastic, cardboard tabs and toy packaging graphics. Show only the most useful information:
> - position and checkpoint progress
> - wind-up energy
> - stunt chain
> - branching route choice
> - giant-world hazard warning
> - collectible trail
> 
> The HUD must remain readable and compact. Avoid a conventional military or sci-fi interface. Make route selection obvious without covering the playfield.
> 
> MAP STRUCTURE:
> Include a small procedural road-network widget showing the current room route as connected segments with unknown branches, reward nodes, hazard nodes and a finish point. It should visually match the toy-world materials rather than look like a generic digital minimap.
> 
> STYLE:
> Miniature diorama presentation with tactile materials, handcrafted details, soft tilt-shift depth cues, warm afternoon sunlight, dust motes, realistic plastic and cardboard textures, and deliberately readable gameplay composition. The result should look like a premium modern browser game screenshot that could plausibly be played, with clear road edges, scale, vehicle spacing and hazard timing. Original art direction, no commercial toy logos or recognisable branded objects, 16:9.

---

## 28. Visual Exploration Sequence

The current sequence is intentionally broad rather than iterative. Future entries should alternate focused studies with occasional integration tests:

1. `GEN-001`: Grounded night combat and tactical density.
2. `GEN-002`: Playful miniature racing and procedural routes — generation pending after two discarded drifted attempts.
3. `NEXT CANDIDATE`: `BRD-07 + SCN-04` lighting board holding the farm geometry constant.
4. `NEXT CANDIDATE`: `SCN-22 + HUD-07` focused alien-survey and scanner study.
5. `NEXT CANDIDATE`: `RIG-17 + MAT-03` boat-family material and construction study.
6. `NEXT CANDIDATE`: `SCN-05 + WTH-03 + CAM-04` focused flood-rescue readability test.
7. `NEXT CANDIDATE`: `SCN-24 + CAM-16` free-orbit navigation study.
8. `NEXT CANDIDATE`: `SCN-19 + ATM-08` fantasy mechanical kingdom atmosphere study.

The sequence may be changed at any time. A generated item remains exploratory until explicitly marked `APPROVED REFERENCE`.
