# Game Reference Atlas

Date: 2026-07-25
Status: Tier 1 source research and design inference; none of these games were runtime-playtested in this pass

## Central synthesis

The strongest references do not suggest copying one game. They reveal a durable product grammar:

> one persistent vehicle identity + a quilt of activity regions + explicit contracts for camera, controls, state, rewards, and failure

The open world is better treated as a quilt than a soup. Distinct regions can use different mechanics without forcing every simulation to run everywhere. The vehicle’s passport—identity, capabilities, condition, history, upgrades, inventory, and notable outcomes—stays continuous.

## Related current visual surface

- [Vehicle Game Visual Exploration Living Catalog](../vehicle_game_visual_exploration_living_catalog.md) - prompt-ready scene inventory and reusable composition syntax for the current visual exploration trail.

## Vehicle construction, personality, and damage

| Reference                                                                                                                                                                        | What to study                                                                                   | What not to inherit                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Crossout](https://crossout.net/en/about)                                                                                                                                        | Functional modular construction, locational damage, salvage, blueprints, faction-as-playstyle   | Market/grind pressure and power escalation                                 |
| [Trailmakers](https://www.playtrailmakers.com/?p=4127)                                                                                                                           | One construction language spanning land, sea, air, space, expeditions, and shared creations     | Unbounded construction complexity at onboarding                            |
| [TerraTech](https://www.terratechgame.com/)                                                                                                                                      | Salvage defeated machines, assemble land/air forms, procedural exploration                      | Interchangeable procedural terrain without memorable purpose               |
| [LEGO 2K Drive](https://lego.2k.com/en-GB/drive/features/)                                                                                                                       | Guided garage, categorized pieces, constraints, visible stats, test before equip, terrain forms | Automatic transformation that erases consequence                           |
| [Scrap Mechanic](https://scrapmechanic.com/)                                                                                                                                     | Collaborative mechanical parts and moving contraptions                                          | Letting complex physics creations dictate the whole network/browser budget |
| [Besiege](https://www.besiegethegame.com/)                                                                                                                                       | Short readable goals, many machine solutions, entertaining destruction/failure                  | Disposable experiments with no persistent machine attachment               |
| [From the Depths](https://fromthedepthsgame.com/)                                                                                                                                | Deep component systems, AI configuration, land/sea/air construction                             | Its complexity is a ceiling, not an onboarding model                       |
| [Mad Max](https://avalanchestudios.com/stories/watch-the-magnum-opus-come-to-life)                                                                                               | The vehicle as a long-term companion and narrative project                                      | A purely combat-centered vehicle identity                                  |
| [Pacific Drive](https://www.pacificdrivegame.com/)                                                                                                                               | Garage → prepare → hostile expedition → salvage/damage → extract → repair/upgrade               | Maintenance that becomes chore instead of story/decision                   |
| [The Long Drive](https://store.steampowered.com/app/1017180/The_Long_Drive/) / [Jalopy](https://store.steampowered.com/app/446020/Jalopy__The_Road_Trip_Driving_Indie_Car_Game/) | Affection for a flawed machine, physical supplies, sparse road stories                          | Realism friction with no meaningful choice                                 |

### Transferable principle

The vehicle is body, backpack, house, and résumé. Its gameplay collision/handling identity can remain stable while cosmetics and visible history accumulate. Parts should create verbs and tradeoffs, not only rarity.

## Movement mastery and browser immediacy

| Reference                                                                                             | What to study                                                                                                                    | Warning                                                              |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Rocket League](https://www.rocketleague.com/)                                                        | A small legible action set supporting deep mastery; reset/training tools; cosmetic identity separated from standardized hitboxes | Broad modes cannot rescue weak driving feel                          |
| [Slow Roads](https://slowroads.io/) and [web.dev case study](https://web.dev/case-studies/slow-roads) | Instant browser entry, procedural driving, disciplined illusion, object reuse/pooling                                            | Endless roads still need reasons to care                             |
| [PolyTrack](https://www.kodub.com/apps/polytrack)                                                     | Rapid restarts, track editor, shareability, low-friction web racing                                                              | Runtime/mobile/persistence behavior remains to be directly tested    |
| [Narrow.One](https://narrow.one/)                                                                     | Fast browser entry into legible real-time 3D multiplayer                                                                         | Do not assume its constraints match an open-world vehicle simulation |

### Transferable principle

The first public link should reach a controllable vehicle before asking for an account, reading a lore wall, or compiling a garage spreadsheet.

## Farming, systems, day/night, and shared progression

| Reference                                                                                     | What to study                                                               | Warning                                                        |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Stardew Valley](https://www.stardewvalley.net/about/)                                        | Several activities feed shared place, recipes, professions, and discovery   | Multiple skills can become checklist labor                     |
| [Farm Together 2](https://www.milkstonestudios.com/2024/02/farm-together-2-early-access-faq/) | Cozy shared work, customization, town growth                                | Avoid waiting timers and social obligation                     |
| [FarmTown](https://farmtown.online/)                                                          | Browser-native shared locations, jobs, collectibles, guild ambition         | Direct runtime and economy evaluation still needed             |
| [Vampire Survivors](https://poncle.games/vs-online-faq)                                       | Horde readability, build choices, unlocks, independent multiplayer movement | Enemy count can overwhelm CPU/network/readability              |
| [Dwarf Fortress](https://bay12games.com/dwarves/dev.html)                                     | Generated history and interacting systems producing stories                 | Opaque complexity without causal logs and layered explanations |

### Transferable principle

Night should change grammar, not only gamma. The first tractor slice changes available verbs, priorities, camera density, and consequences while keeping place and vehicle continuous.

## Exploration, scale, and living worlds

| Reference                                                                                                         | What to study                                                                   | Warning                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Starlink: Battle for Atlas](https://www.ubisoft.com/en-us/company/about-us/our-brands/starlink-battle-for-atlas) | On-the-fly loadouts, specialist outposts, surface/atmosphere/space continuity   | Every travel scale needs purpose; seamlessness alone is not play                                                                                                 |
| [No Man’s Sky](https://www.nomanssky.com/)                                                                        | Exploration, trade, farming, bases, freighters, expeditions, tagged short goals | Infinite terrain still needs authored reasons to care                                                                                                            |
| [Astroneer](https://astroneer.space/)                                                                             | Terrain deformation, vehicles, bases, discovery, manufacturing, wonder          | Its [early multiplayer discussion](https://blog.astroneer.space/p/day-1-multiplayer-and-beyond/) shows how terrain and dynamic-object scope make networking hard |

### Transferable principle

Use separate scale/origin regimes connected by travel and durable consequences. A mobile garage/convoy/freighter can provide continuity without running one uniform physics world from toy room to orbit.

## Editors, creation ecosystems, and public operations

| Reference                                                                                                        | What to study                                                                                                            | Warning                                                                                        |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [Roblox](https://create.roblox.com/docs/platform)                                                                | Creation, collaboration, publishing, hosting, analytics, storage, localization, discovery, monetization as one ecosystem | Retention and monetization surfaces can replace the game’s purpose; moderation is foundational |
| [UEFN](https://dev.epicgames.com/documentation/en-us/fortnite/publishing-projects-in-unreal-editor-for-fortnite) | Play sessions, memory budgets, private versions, attribution, ratings, moderation, team workflows                        | A creator tool is an operating platform, not only a canvas                                     |
| [Core](https://www.coregames.com/create)                                                                         | Templates, multi-client preview, publishing, persisted values, explicit goal/end/restart checklist                       | Templates can produce clones without a distinctive grammar                                     |
| [Dreams](https://www.playstation.com/en-fi/games/dreams/)                                                        | Play/Create/Share, tutorials, remix ancestry, showcase campaign                                                          | Creation needs attribution and provenance                                                      |
| [Garry’s Mod Sandbox](https://wiki.facepunch.com/gmod/gamemodes/Sandbox)                                         | Maps/modes/tools/vehicles/saves/addons as separable surfaces; enable/disable/recovery                                    | Dependency graphs need version and compatibility management                                    |

### Transferable principle

The editor is backstage after the show. Players understand components better after a complete game demonstrates why they matter. The first creator feature should be saving and sharing a validated vehicle variant or contract, not an empty general-purpose world editor.

## Service longevity as a design input

Public games should preserve a meaningful local/offline core where practical.

- [LEGO 2K Drive’s official manual](https://assets.2k.com/1a6ngf98576c/4nYMDLfONpxXdpdw0Em0nN/d83785689d70800e9834e1a1d2160635/2KGWIN_LEGO_2K_Drive_NSW_Online_Manual_ENG.pdf) documents a finite online-availability commitment.
- [Mad Max’s service status](https://wbgamessupport.wbgames.com/hc/en-us/articles/360058007413-Mad-Max-Status-Update) illustrates how online-linked functionality can become unavailable while offline play survives.

Design implications:

- exportable/migratable saves;
- no account for the initial solo experience;
- core progression not needlessly dependent on a live service;
- explicit cache/update compatibility;
- a shutdown/sunset and player-data export story before accepting money.

## Mechanics matrix for this project

| System               | Transferable design                                                                 | First-playable interpretation                           |
| -------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Vehicle construction | Socketed parts with visible costs in mass, energy, heat, traction, size, or control | One tractor and three modules                           |
| Functional damage    | Damage changes behavior and appearance                                              | Wheels, core, tool, cargo/light                         |
| Vehicle as home      | Repairs, souvenirs, scars, and run history stay with it                             | Workshop state and morning result                       |
| Expedition loop      | Prepare → venture → improvise → survive/extract → repair                            | Day setup → night pressure → dawn recovery              |
| Camera as verb lens  | Perspective follows decision density                                                | Chase/isometric → readable tactical top-down            |
| Shared progression   | One activity’s reward opens a verb elsewhere                                        | Day tool has night use and tradeoff                     |
| Salvage economy      | Imperfect runs still feed experimentation                                           | Partial scrap/knowledge, not punitive zeroing           |
| Procedural remix     | Authored chunks/rules around recognizable landmarks                                 | Fixed barn/workshop, seeded plots/lanes/weather         |
| Social sharing       | Seed, ghost, build card, screenshot, challenge URL                                  | Share card before open UGC                              |
| World simulation     | Track only relations that create visible consequences                               | Crops, light/noise, route obstruction, weather/traction |

## Proposed `VehiclePassport`

- stable vehicle and chassis identity;
- mass, energy, heat, durability, traction, dimensions, cargo;
- mounted functional modules and compatibility;
- cosmetic shell separate from gameplay collision identity;
- condition, repairs, scars, provenance;
- mastery by verb/capability;
- discoveries, relationships, notable runs;
- supported activity/camera/control tags;
- saved variants and ancestry.

## Proposed `ActivityContract`

- entry/exit and diegetic transition;
- required/supported capabilities;
- world/seed/content versions;
- camera and input profile;
- allowed verbs;
- objective and encounter grammar;
- success, failure, abandon, retry, recovery;
- damage/persistence/outcome rules;
- reward authority and calculation;
- multiplayer authority;
- HUD/accessibility modules;
- asset/runtime/network budgets;
- deterministic fixtures and observability.

## Slice comparison

### Leading: Tractor at Dusk

A short guest session:

1. repair and drive a battered tractor;
2. choose three plots and find one optional module;
3. trigger/accept sunset;
4. select floodlight, seed tool, or trailer/barrier direction;
5. defend/rescue through crop shadows in tactical framing;
6. reach dawn with visible consequences;
7. repair, choose one sidegrade, replay or share a seed/build card.

### Later breadth probes

- **Shadow Convoy:** road expedition with top-down ambushes and a mobile garage.
- **Pocket Planet Garage:** toy-scale buggy → glider → tiny rocket across a room/planetoid.
- **Impossible County Fair:** race, tractor pull, delivery, stunt, and alien-defense activities around one social hub.
- **Machine Seed:** daily constrained construction challenges such as irrigating a crater or carrying a fragile giant egg.
- **Courier of the Fold:** bicycle/compact-vehicle contracts across a procedural county.

## UI flow lessons

Proposed flow:

- Landing: `Play as Guest`, `Continue`, later `Explore Builds`.
- First seconds: show three understandable verbs, not a stat wall.
- Garage: `Loadout`, `Build`, `Test`, `Save Variant`.
- World surface: opportunities as a vehicle dashboard/radio/map, not a SaaS card grid.
- Active HUD: vehicle condition, one context tool, immediate objective, threat/route direction.
- Result: what happened, what persisted/broke, what was earned, one meaningful next possibility.
- Account prompt only when saving across devices, sharing publicly, or joining friends.
- Creator ladder: play → inspect → duplicate → edit → validate/test → private link → review/publish.

## Anti-patterns

- A content mountain before base movement is joyful.
- Separate currencies/inventories/settings/upgrade trees per mode.
- Automatic adaptations that erase build decisions.
- Sudden camera plus input change under danger with no preview.
- A starter machine made obsolete by a power ladder.
- A full editor before `VehiclePassport` and `ActivityContract` stabilize.
- Procedural expanse without landmarks and causal stories.
- Daily streaks or waiting that punish wandering.
- Online dependency for solo saves or unlocked parts.
- Creator publishing without attribution, dependency versions, moderation, rollback, and private testing.

## Confidence and gaps

Confidence is high that these references contain the cited public design surfaces, medium that the proposed grammar transfers well, and low on actual feel until games are directly played and the local slice is tested. The next reference pass should include hands-on captures for a small set: Pacific Drive, Trailmakers, Slow Roads, PolyTrack, one browser multiplayer game, and one creator workflow.

## Anything else?

Borrow systems, not skins. The most important comparative question is always: “What does this reference teach about making a machine feel persistent when the activity changes?”
