# Playtest Sim — First-Time Achiever — 2026-07-25

Fresh-eyes simulated playtest of the build served at `http://127.0.0.1:4174/` ("RIGS UNBOUND — FIELD 02 · TERRAIN TRAVERSAL"). Played by driving a real Chromium via scripted keyboard/mouse input, reading the screen from screenshots. No project files, docs, or source were read. Roughly 10+ in-game sessions (day clock 06:41 → 08:00 across runs). Screenshots: `artifacts/playtest-achiever/`.

## 1. What I think this game is

Rigs Unbound is a physics-driving game about a small fleet of chunky work rigs loose in a rural valley. The land itself is the opponent: mud bogs you, water drowns your engine, boulders wreck your bodywork, and steep grades stall you. You roam from a home base (the Home Silo), survey the map, discover "signals" (points of interest, each with a verb — TILL, HAUL, TOW, WADE, ASCEND, SHRINE, RESTORE), and collect salvage crates scattered off the graded tracks. Salvage is money: you spend it at the silo workshop on modules (lug tyres, pontoons, winch, low-range gearing…) that change what terrain your rig can cross. Different rigs are built for different ground — the pitch text is literally "THE GROUND DECIDES."

## 2. Objectives I identified — and what I completed

Identified, roughly in the order I found them:

- **Collect salvage** — a persistent HUD guidance line gives bearing + distance + unit count to the nearest salvage ("SW · salvage 32 m · 1 unit"). Clearly the core loop.
- **Spend salvage at the Home Silo workshop** — six numbered modules: Low-range gearing (6), Lug tyres (5), Recovery winch (8), Survey mast (7), Skid plate (5), Flotation pontoons (9). "T repairs for 3 salvage." Pressing X with no winch gave the perfect nudge: _"No winch fitted. A recovery winch is 8 salvage at the Home Silo workshop."_
- **Survey the field** — a completion % on the HUD and map ("5% surveyed · 46 m sight"); the map only shows ground your rig could see, and climbing extends sightlines. My surveyed % climbed 5% → 30% just by driving.
- **Discover signals** — Signals on the Horizon panel: Home Silo (RESTORE), Long Furrow (TILL), Quarry Shelf (HAUL), Rustline Salvage (TOW), Toy Grove (SHRINE), Sunken Flats (WADE), Launch Ridge (ASCEND), each with a live distance.
- **A day clock** (DAY 06:41…) — implies structure, but I never saw anything happen at a particular time.

Completed: discovered Home Silo and Long Furrow (with a toast: "Long Furrow discovered: till."), pushed a tree over ("The clearing stays open."), engaged the plough and tilled soil, crawled through churned mud in the tractor without damage, wrecked the buggy twice (wedged on a boulder at 22% condition; drowned in a pond at 0%).

**Not completed:** I never banked a single salvage unit, never fitted a module, never finished a signal job. The nearest salvage consistently sat ~25–45 m away inside churned mud (Sunken Flats) or boulder fields. I got as close as ~24 m before bogging, circling, or wrecking. So the entire spend/upgrade half of the loop stayed theoretical for me.

## 3. How each machine felt

- **Torque (utility tractor):** _planted, deliberate, tractor-honest, stubborn._ ~30–43 km/h on pasture, slows to a 0–10 km/h crawl in churned mud but keeps pulling and takes no damage doing it. With the plough down it feels _anchored_, like the machine is biting the ground on purpose. This is the rig I trusted.
- **Spark (toy buggy, unlocked with R):** _skittish, eager, reckless, brittle._ 71 km/h on grass — genuinely thrilling after the tractor — but it murders itself: it shed ~80% condition bouncing off boulders in under a minute and later drowned in a pond. Felt like a glass cannon scout. It has `tow · jump` capability; I never found a satisfying moment for the jump.

Would I pick different machines for different jobs? Absolutely, and the game clearly wants that: buggy for a hardpan sprint to the Rustline Salvage tow job, tractor for anything muddy, steep, or heavy. That's the best design instinct in the game.

## 4. Progression experience

The skeleton is exactly what an achiever wants: a currency (salvage), a shop with six meaningful unlocks that visibly expand what terrain you can cross, a map-completion %, and a discovery checklist. The problem is the **first rung of the ladder is too high**. In the equivalent of 10–15 minutes I banked 0 salvage, fitted 0 modules, and completed 0 signals. The only "number go up" I actually felt was surveyed % (5% → 30%) and the two discovery toasts. There's no score, no best times, no records, no completion states on the signals list (just "found" or a distance). The HUD line "Local field record: 103 fps · 35 calls · 24 MB" _looks_ like a score readout but is performance telemetry — as a player hunting for my stats, that was a small betrayal.

## 5. Achiever frustrations

- **I never learned how salvage pickup actually works** — drive over it? press Space? The crates are small, sit among boulders, and there's no pickup radius or "collected!" confirmation visible to aim for. The game's single most important verb is its least explained.
- **No fail/recovery flow for a wreck.** At 0% condition my drowned buggy just sat there — no "wrecked" screen, no tow-back-to-silo loop, no stated cost. I didn't know if I'd lost something or what to do next.
- **No compass heading.** The HUD gives bearing-to-salvage but never my own heading, so instrument-driving is guesswork. A tiny compass strip would fix this.
- **The intro modal re-opens mid-drive** (see Bugs) — it interrupts a run at speed with text I already read.
- **Spawn camera faces the silo wall** every single reset; the first thing I see each run is beige concrete.
- **"Physics Lab" ships in the main UI.** One misclick yanks you out of the game into a dev telemetry fixture. Immersion-destroying for a player build.
- **No persistence visible** — every reload resets the world. An achiever wants their salvage and modules to survive a session.
- Day clock ticks but nothing visibly scheduled — if there's a night threat or deadline, sell it earlier.

## 6. Bugs / glitches

1. **Briefing modal ("THE GROUND DECIDES") re-appears mid-drive**, world still simulating behind it at 26–32 km/h — it popped while I was driving through the Long Furrow area, more than once per session. (`23-h1.png`, `24-h2.png`, `27-h5.png`)
2. **Spawn camera occluded by the silo** on every boot/reset — you spawn staring into a wall and must drive blind for the first second. (`16-spawn.png`, `40-cl-start.png`)
3. **No wreck/game-over state at 0% condition** — drowned buggy sits submerged indefinitely with only the generic water warning. (`81-end.png`)
4. **Drowned rig rendering**: submerged buggy visible through the water plane with the warning card up; legible but reads as "game didn't notice I died." (`81-end.png`)
5. Minor: "Local field record" line mislabeled/misleading — it records renderer stats, not player records. (most HUD screenshots, e.g. `93-end.png`)

Not bugs, but notable: trees are knock-downable with persistent clearings, water warnings are excellent and specific ("Water over 1.1 m is drowning Torque. Pontoons would cross this."), and grip/grade readouts are genuinely useful driving instruments.

## 7. "Would grind this" score: 6/10

The bones are genuinely good — a legible economy, six upgrades that each change _where you can go_ (not just stats), two rigs with sharply different personalities, and terrain that keeps its promise to "decide." I'd want to grind it. But the grind never started: after 10+ minutes I had zero banked salvage because the first crate is guarded by mud and boulders and the pickup mechanic is never taught, there's no score/best-time/completion tracking to chase, and the world resets on reload. Move one easy salvage crate onto grass near spawn, add a pickup confirmation, track personal records, and give wrecks a consequence loop — I'd raise this to an 8.
