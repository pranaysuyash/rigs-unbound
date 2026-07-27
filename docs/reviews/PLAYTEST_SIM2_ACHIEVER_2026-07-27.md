# Playtest SIM2 — Achiever Persona (2026-07-27)

Fresh-eyes simulated playtest of Rigs Unbound (served build, played on `http://127.0.0.1:4173/` — **note: the brief said port 4174, which was dead; 4173 was the live server**). Driven via Playwright in headed Chromium with real keyboard input; impressions taken from screenshots first. ~1.5 h of real session time, in-game day 06:40 → 16:09. Screenshots in `artifacts/playtest2-achiever/`.

## 1. What I think this game is

A 3D top-down-ish driving game about **running machines over terrain that fights back and remembers**. You pilot named rigs (Torque the tractor, Spark the buggy, Drift the hover-skimmer) around a persistent valley, survey the fog-of-war map, recover **salvage** (currency), and spend it at the **Home Silo workshop** on modules that change what terrain each rig can cross. Named sites on a "Patchwork Rumor Graph" (Long Furrow, Quarry Shelf, Rustline Salvage, Sunken Flats, Launch Ridge, Toy Grove) each carry a verb — till, haul, tow, wade, ascend, shrink — that implies a job and a required machine/capability. There's a meta-goal: an "Unbound passage" that is blocked until you open it via capability lanes. Terrain deformation (furrows, felled obstacles) persists across sessions; saves are local.

## 2. Objectives identified and completed

The game chains objectives through a "FIRST FIT" rung plus dynamic HUD directives:

| Objective | Status | Notes |
|---|---|---|
| Enter the field (welcome panel) | ✅ ~1 min | Button click works; the "Measuring device performance…" line never resolves (see bugs) |
| FIRST FIT: Recover 5 salvage | ✅ | Collected the authored first cache at (-18, 5) — "Recovered 5 salvage. 5 in the bin." (shot 29) |
| FIRST FIT: Fit Lug tyres | ✅ | Bought at Home Silo with number key `2` — "Lug tyres fitted. Bites into mud and dust bowls where slicks spin." (shot 32). Module persists across reloads |
| Head toward Long Furrow | ✅ | Discovered the site; biome changed to TILLED SOIL · TERRACE FARMLAND |
| Lower the blade | ⚠️ partially | Space lowers the plough and the HUD advances, but the internal rung never marks complete (see bugs) |
| Plough toward Long Furrow (furrow counter) | ✅ ongoing | Counter climbed 0 → 211; tilled patches visibly persist on the field map (shot 41) |
| Find 8 more salvage | ❌ not finished | Seen as a directive; collected only the first cache |
| Cargo-relay timed activity | ❌ never started | Found cargo at (26,-6), delivery at (18,-46); could not discover the hook-up interaction — no prompt appears near the cargo, Space/X did nothing |
| Survey the valley | 42% | Surveyed % ticks up as you drive; field map reveals only ground your rig could see |
| Discover sites (rumor graph) | 5/8 | Home Silo, Long Furrow confirmed discovered |

## 3. Vehicle feel

- **Torque (utility tractor):** deliberate, torquey, honest. Pulls from a standstill, ~40 km/h top, shrugs off mud. The workhorse — plough + tow.
- **Spark (toy buggy):** squirrely and quick — hit 68 km/h on hardpan, grip falls off a cliff (97% → 54%) the moment you leave the track. Jump capability I didn't get to use meaningfully.
- **Drift (marsh skimmer):** floaty; the HUD literally swaps GRIP for a CUSHION gauge. Survey + hover. Feels like the wrong tool everywhere except water, which is the point.

**Would I pick different machines per job?** Yes, and the game clearly wants that: the intro sells each rig's terrain identity, sites have verbs that map to rigs (wade → Drift, till → Torque), and swapping is a single `R` press near a parked rig with a "Drift is 41 m away" pointer. This is the strongest design idea in the game.

## 4. Progression experience

- **Earned:** 5 salvage (first cache), 211 furrows, 42% survey, 2 site discoveries, one module.
- **Spent:** 5 salvage → **Lug tyres** at Home Silo (number-key purchase, blind — no visible catalog with prices in the HUD; the tutorial just says "choose an affordable part, keys 1–6").
- **What the spend changed:** a persistent module on the rig (`lug-tires` survives reload) with a clear flavor payoff line. Mechanically it's situational (mud/dust-bowl traction), not an immediate visible power spike — grip read 82% → 87% in the same pasture, which is noise-level. The real unlock promise is "cross terrain you couldn't before," which I didn't get to verify against a mud wall in-session.
- **Number go up vs mastery:** both, briefly. The furrow counter is pure dopamine (32 → 211 in seconds of ploughing), salvage is a clean earn-spend loop, and survey % is a steady drip. But the mastery side (learning to brake before nodes, reverse-escape off cliffs, manage condition) is where the game actually lives — and right now the feedback loop there is buggy enough (below) that "number go up" carried the session.

## 5. Achiever frustrations

1. **The field map auto-opens roughly every second** and covers the entire screen (input still works, but you're driving blind behind a modal). I spent the whole session fighting it. Session-ruining if unfixed.
2. **The quest tracker disagrees with itself.** HUD said "Lower the blade"; I lowered the blade (Space), got the "Field plough lowered" toast and carved 211 furrows — yet the underlying rung still reads `complete: false` and its own aria hint says "Press B" (B only toggles fill/cut mode). An achiever staring at an uncompletable checklist item will assume the game is broken.
3. **Cargo-relay is a black box.** A timed delivery activity with a best-time slot — exactly my drug — but nothing tells you how to attach the cargo. No prompt at proximity, Space/X do nothing, `X` reads "no winch". Dead end.
4. **No visible repair path.** Condition melts from collisions (one bad cliff grind took 97% → 0%), the signals list says "Home Silo RESTORE", but I never found a restore action; emergency recovery (`X` when disabled) is the only fix and it limps you home at 25% with no salvage compensation.
5. **The salvage hint retargets silently** between nodes ("nearest salvage"), so chasing a specific cache by the HUD bearing is like following a compass that keeps changing its mind.
6. Buying blind at the workshop: no catalog, no prices, no confirmation of what keys 1–6 map to before you commit 5 hard-won salvage.

## 6. Bugs (with screenshots)

- **B1 — Field map auto-open loop.** Overlay reopens ~1 s after every close, indefinitely, regardless of input. Shots 12, 16, 34, 41, 43. (Verified: CLOSE click works, `map:false`, then `map:true` again within a second, repeatedly.)
- **B2 — Quest rung "Lower the blade" never completes.** Blade lowered, furrows carved, rung stays `first-cut / complete: false`; aria guidance ("Press B") contradicts the HUD ("Space lower blade"). State dump after B: mode toggles fill↔cut, `engaged: false`, rung unchanged.
- **B3 — Welcome panel perf probe never finishes.** "Measuring device performance… Choose Enter the field to begin." still present after 20+ s, headless and headed. Entry still works. Shots 01, 06–08.
- **B4 — Chase camera occluded by the silo.** Half the screen is a flat wall when near Home Silo. Shot 32.
- **B5 (minor) — Map HUD "0% surveyed"** in the field-map header while the main HUD reports 20–42%. Shots 18, 34.
- Port note: brief's URL (4174) refused connections; game actually served on 4173.

## 7. Would-grind score: **6 / 10**

The bones are genuinely good: a legible earn→spend→unlock-terrain loop, three meaningfully different machines, a persistent world that records my furrows, and counters everywhere an achiever looks. But I lost more session time to the map modal, the stuck quest rung, and undiscoverable interactions (cargo hook, repair) than to any intended challenge. Fix B1–B3 and surface the workshop catalog + cargo hookup, and this is an 8 — I'd keep grinding salvage to open the Unbound passage.
