# Same Vehicle Mode Matrix

- Status: **living reference**
- Date: 2026-07-26
- Purpose: make the same vehicle legible across game modes, scene types, threat levels, and lighting states without losing identity

## Canonical machine

Use the same machine identity across all variants:

- same cab family;
- same chassis memory;
- same wheelbase or locomotion family unless a new movement class is explicitly part of the mode;
- same core repair history;
- same semantic blueprint;
- same emotional read;
- different mode-specific loadout and camera contract.

## Matrix

| Mode | Vehicle role | What changes visually | What changes mechanically | Camera bias | Light / visibility bias | Escalation hook |
| --- | --- | --- | --- | --- | --- | --- |
| Farming | Livelihood and field work | plow, seeder, trailer, mud, crop dust, repaired panels | traction, row handling, hauling, soil interaction | close chase / work view | broad daylight, readable shadows | stronger field tools, better lights for late work |
| Racing | Slow hero race machine | cleaner tires, race markings, stripped clutter, dust, maybe spoiler-like utility parts | braking, line choice, recovery, weight transfer, route memory | close chase, low angle | bright daytime or sunset glare, high contrast | pit repair, track-specific tires, burst boost, tow-start |
| Dystopian survival | Mobile shelter / scavenger rig | patched armor, strapped cargo, spare tanks, improvised storage, rooftop junk | fuel economy, repair scarcity, noise management, carry capacity | medium chase, observant | fog, rain, dusk, low power | stronger lights, battery packs, generator, salvage winch |
| Zombie defense | Anti-horde platform | brush guard, floodlights, roof rack, side shields, mounted tools or guns | crowd control, barricade pushing, ammo/fuel drain, noise risk | tactical chase / top-down hybrid | night, deep dark, flashing danger cues | bigger lights, search mast, turret, shredder, flare, sonic deterrent |
| Day/night contrast | Same machine, different time contract | daytime utility versus nighttime lighting architecture | work vs watchfulness, visibility vs stealth | same base camera, different contrast | day = soft; night = focused cones; deep dark = lamps define shape | work lights, beacon, side lamps, thermal/radar mast |
| Construction/salvage | Site tool | crane arms, hooks, drill mast, stabilizers, cranes, salvage clamps | lifting, cutting, towing, anchoring, structure interaction | medium orbit / practical work view | industrial daylight or floodlit night | heavier boom, cutter head, winch drum, jack legs |
| Urban service | Civic oddity | municipal colors, compact service bodies, route gear, signage-friendly shape | traffic, curb geometry, stop-start behavior, street access | medium chase / street view | overcast or city night | compact turn radius, side access, street-sweep tools |
| Aquatic / amphibious | Water-safe service rig | pontoons, sealed seams, higher intake, flotation, spray guards | buoyancy, water drag, shoreline transitions | side chase, horizon-aware | reflective daylight or storm water | stronger hull seals, rescue rail, sonar mast |
| Aerial / orbital | Sky or space support rig | thrusters, clamps, service booms, landing legs, heat shielding | lift, docking, stability, pressure / vacuum tolerance | wide chase or docking view | high contrast, starfield, runway lights | stronger clamps, reentry cradle, booster service |
| Absurd / mythic | Symbolic machine | larger lights, ceremonial parts, impossible add-ons, story-object scale | genre shifts, folklore behavior, impossible utility | whichever makes the machine readable | whatever makes the identity visible | lighthouse tractor, parade tractor, courtroom tractor, moon-rover tractor |

## Loadout families

These are reusable attachments and state changes that can be combined with the same base vehicle:

- work lights;
- roof beacon;
- floodlights;
- brush guard;
- plow;
- seeder;
- trailer;
- winch;
- crane arm;
- drill mast;
- salvage claw;
- storage racks;
- battery pack;
- generator;
- siren bar;
- flare launcher;
- search mast;
- radar mast;
- thermal mast;
- shield plates;
- side rails;
- turret or mounted defensive tool;
- tool racks;
- rescue stretchers or tow gear.

## Lighting ladder

### Day

- broad readability;
- shadows are for form, not concealment;
- the vehicle should read as labor or motion.

### Dusk / gloam

- transition state;
- long shadows;
- the vehicle is partially utility and partially tension.

### Night

- primary lamps become the design focus;
- the vehicle becomes a moving light source;
- enemies or obstacles should be readable in cone and spill.

### Deep dark

- the machine needs side lamps, mast lamps, or underglow to preserve shape;
- silhouette is often more important than color;
- visibility becomes a mechanic, not just an aesthetic.

## Threat ladder

### Tier 0: no threat

- farming, hauling, travel, exploration.

### Tier 1: nuisance

- stray obstacles, weather, terrain trouble, minor wildlife, small scavengers.

### Tier 2: local danger

- abandoned machines, hostile environment, small infected packs, route blockers.

### Tier 3: active defense

- barricade management, wave pressure, tactical lighting, improvised weapons.

### Tier 4: siege

- stronger lights, turret or shredder, crowd control, vehicle fortification.

### Tier 5: absurd escalation

- the tractor becomes a fortress, a legend, or a mobile authority object.

## Cross-mode rules

- If the same machine needs a totally different silhouette to work, record that as a new family, not a mode.
- If the same machine needs one new tool to adapt, keep it in the same family.
- If lighting alone changes the read, it is a mode.
- If the camera alone changes the feel, it is a presentation variant.
- If the ecology changes, it is a mode contract.

## Discussion note

The mode matrix is intended to keep the machine identity stable while allowing
genre-switching to feel dramatic. A tractor should not become a different
tractor every time the game changes. The world can become stranger; the machine
should remain the same character.

