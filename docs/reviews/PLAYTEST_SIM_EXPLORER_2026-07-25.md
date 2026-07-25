# Playtest Simulation — First-Time Explorer/Tinkerer

- **Date:** 2026-07-25
- **Persona:** Explorer / systems tinkerer. Drives to the edges, pokes systems to see what responds, hunts for unexplained mechanics.
- **Build:** `http://127.0.0.1:4174/` — "Rigs Unbound — Field 02 · Terrain Traversal"
- **Method:** Real Chrome via Playwright, keyboard/mouse only, screenshots read visually. `render_game_to_text()` used 4× as an accessibility aid. ~90 minutes of play across two lives (the first ended in an unrecoverable soft-lock; the second was a fresh profile).
- **Evidence:** `artifacts/playtest-explorer/*.png` (referenced below by filename).

---

## 1. What I think this game is

Rigs Unbound is a slow-burn, systemic driving-survival game set on a single fog-of-war-covered farm valley ("Field 02"). You drive small utility rigs across terrain that is genuinely simulated — surface type, grade, water depth, and ground deformation all matter — and the valley is explicitly the antagonist: the title card says "THE GROUND DECIDES." You scout landmarks (a silo workshop, a quarry, a flooded flat, a ridge), collect salvage crates scattered off the graded tracks, and spend that salvage on modules (low-range gearing, lug tyres, winch, survey mast, skid plate, flotation pontoons) that progressively unlock terrain you previously could not cross. There is a farming verb (till/plough furrows), a hauling verb (tow cargo), a surveying verb (map the valley by physically seeing it), and a day/night cycle with headlights. It feels like the love child of MudRunner, a farming sim, and a cartography game — a game about earning the right to go places.

## 2. Everything I discovered, and what each discovery felt like

**The fog-of-war field map (M).** The map only shows ground my rig could physically see — "Climb for sightlines; a survey mast reaches further" (05-map.png). As I drove, the surveyed blob grew along my actual path, and the HUD tracks "SURVEYED %" (I reached 52%). This rewired my brain: every hill became a potential lookout. It felt like the game quietly respects curiosity — exploring *is* the progression.

**Terrain is a real opponent.** Surfaces announce themselves in the HUD: HARDPAN TRACK (82% grip), TILLED SOIL (59%), PASTURE (73%), CHURNED MUD (53%, "slipping"), BARE ROCK, STANDING WATER (42%). On a 30% mud bank the tractor stalled dead and the game *spoke to me*: "Too steep for this gearing. Back off or find a line" (13-toward-salvage2.png). Later: "Grade too steep for this gearing. Low-range gearing would climb it" (90-spark-jump.png). Getting refused by a hill and being told exactly which module would solve it felt fair — the world says "not yet," never "no."

**Trees fall.** Blundering through a wood at night I got the toast "Torque pushed a tree over" and later drove past the fallen log lying where it dropped (17-flats.png). The telemetry confirmed the world counts felled obstacles. A small thing, but it made the valley feel physical rather than decorative.

**The plough works and leaves scars.** Space engages the plough ("CAPABILITY: Ploughing"). It cuts a visible ladder-pattern furrow that persists — I later surveyed my own criss-crossed furrows from a hilltop, an X scratched into the hillside (39-plough-chase.png, 40-plough-chase2.png, 47-rig-switch.png). Genuinely delightful: my incompetent wandering was written into the ground.

**A hidden grading blade.** Partway through the night a new keybind silently appeared in the control bar: "B blade." Pressing it toasted "Blade set to FILL. Soft ground rises behind you, and wet ground dries" (44-blade-toast.png). Terrain deformation as a tool — dry out mud, build up soft ground. Nobody explained it; it just arrived. As a tinkerer I loved the implication (can I fill my way up a cliff? drain the Sunken Flats?) but I never got to exploit it.

**Toy Grove.** A grove where the "trees" are giant colorful toy blocks — red, blue, purple cubes scattered among the pines (39-plough-chase.png, 44-blade-toast.png). Its horizon verb is "SHRINK," never explained. Discovering it felt like finding the developer's sense of humor buried in the map.

**Water kills.** I chased a salvage crate into a flooded depression at night. Grip dropped to 42%, then: "Water is over the axles. Get out before it costs you" — and it did: condition collapsed 51% → 0% and the rig died mid-pond (66-crate-hit.png). Brutal, legible, and entirely my fault. The flotation-pontoon module description ("Crosses the Sunken Flats instead of drowning in them") suddenly read as prophecy.

**Rigs are physical objects.** Pressing R does not summon a vehicle — it tells you where one *is*: "Spark is 185 m away at the Home Silo. Drive to it" (47-rig-switch.png). Early on I also spotted what I believe is the Drift hover-rig parked in the shallows of the Sunken Flats, visible only as a distant silhouette in survey view (11-cam6.png). The fleet existing in the world, each rig parked where its specialty matters, is a lovely bit of coherence.

**Night exists and has a mood.** Around 21:40 game-time the light drained away; the clock badge flipped from DAY to GLOAM. N toggles headlights that throw a real cone onto the ground ahead (27-night-light.png). Driving by headlight, reading terrain by grip percentage instead of by eye, is a different game.

**The Physics Lab.** A bottom-bar button opens a whole hidden test fixture: "Physics Lab 01 — Drive forward through asphalt, gravel, mud and ice," with per-wheel contact readouts and narration toasts ("Mud raises rolling load and reveals wheelspin"; "Gravel lowers the grip budget without changing the controls"). When I drove off the lane it teleported me back: "Automatic recovery returned the chassis to the last reset capture" (78-lab-drive1.png, 79-lab-drive2.png). Finding the developer's workbench bolted onto the game was pure tinkerer bait.

**The world remembers everything — including my failure.** After drowning the tractor I reloaded the page entirely. The game dropped me straight back into the pond, 0% condition, furrows, discoveries, and 52% survey intact, with the note "Field record restored" (72-after-reload.png, 80-back-field.png). The save (localStorage `rigs-unbound.save.v4`) is rewritten continuously — even my attempt to wipe it by clearing storage before reload was defeated by the unload autosave. Only a brand-new browser profile produced a fresh valley.

**The southern scarp.** Driving for the world edge, I found the south guarded by a huge bare-rock scarp — 55–81% grades that the base tractor cannot climb, only slide down (53-south2.png, 42-to-grove2.png). I never saw the map's edge; the valley said "come back with better gearing." That is exactly the promise the module shop makes, so it reads as design, not accident — but it means the "how big is this place?" question went unanswered.

## 3. How each rig felt

**Torque (utility tractor, plough · tow):** *earnest, stubborn, agricultural, underpowered, honest.* Tops out around 41 km/h and gets there without drama. Sure-footed on pasture and track, hopelessly undergeared on wet banks — it stalls, slips, and once high-centered me in a mud pocket at a scarp base where even rocking and ploughing couldn't free it. A mule: it will plough all day and never once surprise you, and it will not save you from your own ambition.

**Spark (tow · jump):** *eager, skittish, tail-happy, fragile-confidence.* Noticeably faster — 57 km/h on tilled soil where Torque manages ~41 — and higher grip on hardpan (97% vs 82%). But on a 26% pasture grade it was already "slipping" at 23 km/h, and in churned mud it bogged to 3 km/h, far worse than Torque. The title card's description is accurate: a hardpan sprinter that needs a run-up at life. It lists a "jump" capability — my one jump attempt was swallowed by a UI bug (see below), so jump feel is unverified.

**Drift (hover rig):** *unrated — never reached.* It sits across the water at the Sunken Flats, and my Torque drowned trying to freestyle its way to everything water-adjacent. The fact that I couldn't just have it is, in its own way, the most tinkerer-baiting thing in the game.

**Did terrain make them matter differently? Absolutely.** Surface, grade, and water changed each rig's effective personality: Torque's torque only matters below ~30% grades and outside mud; Spark's speed only exists on prepared ground; water converts any wheeled rig into a corpse. The graded tracks are the highway system; leaving them is a decision, not a default. I never found a ramp to test, but the cargo-relay telemetry mentions one near the silo.

## 4. Alive or empty? Did it remember me?

**Verdict: alive as a system, empty as a place.** The valley reacts to everything — trees fall, furrows persist, the blade reshapes ground, water drowns engines, the map learns what I've seen, the clock burns, the workshop quotes module prices at my failures. And it *remembers*: across a full page reload, my furrows, felled trees, discoveries, survey progress, and even my drowned rig were exactly where I left them. That is more memory than most open worlds bother with.

But nothing lives here. No animals, no NPCs, no traffic, no wind in the trees that I could see, no one at the Home Silo. The "signals on the horizon" are landmarks, not people. It's a beautifully instrumented ghost valley — a model railway with real physics. For a tinkerer that is almost enough; for a soul it needs one living thing.

## 5. What I wanted to discover that wasn't there

- **The edge of the world.** I made a genuine expedition south and was walled by the scarp. I never learned whether the map ellipse is a hard boundary, a kill-plane, or more valley.
- **A working salvage pickup.** I never collected a single crate (see bugs) — so the entire module economy stayed theoretical. I badly wanted to buy low-range gearing and take revenge on that mud bank.
- **The Toy Grove's "SHRINK" verb.** Nothing I did to the blocks produced a response.
- **The summit of Launch Ridge** and its promised sightline reveal ("Climb for sightlines") — never reached.
- **The cargo-relay activity** (tow cargo from near the silo to a delivery point, with a ramp involved) — visible in telemetry, never triggered in play.
- **Drift on open water** — the fantasy the whole Sunken Flats is built around.
- **Morning.** Night fell and, for me, never ended (see bugs). I wanted the dawn the clock kept promising.
- **Any sign of another living thing.**

## 6. Bugs / glitches

1. **Soft-lock with no rescue (critical).** Rig drowned at 0% condition with 0 salvage: cannot move, T-repair requires 3 salvage I don't have, X reports no winch, R refuses remote rig swap ("Drive to it" — I can't). The visible escape hatch, the **"Reset field" button, does nothing** — clicked by mouse (73-reset-confirm.png, 74-reset-clicked.png), by direct JS `.click()` (75-reset-js.png), and while paused (81-reset-paused.png, 82-reset-dialog.png): no dialog, no effect, no reset. localStorage clearing is defeated by the unload autosave. Only a fresh browser profile recovers. A first-time player who drowns their tractor 30+ minutes in loses the save, full stop.
2. **Salvage crates appear uncollectable.** HUD read "SW · salvage 1 m · 2 units" (64-crate-1m.png) and I nudged directly into the crate (65-crate-nudge.png); salvage stayed 0 and the compass silently re-targeted another crate. Across ~15 minutes of hunting, multiple crates were driven onto/over with zero pickups. Either the pickup radius is broken or crates are physics objects that get shoved instead of collected.
3. **Day/night cycle derails.** Clock showed DAY 22:27 (26-crate-get.png), then ~3 real minutes later GLOAM 11:51 (27-night-light.png) — a backward jump. Thereafter the phase badge stayed GLOAM through midnight and past 06:00, and the world stayed night-dark for the remaining real hour, including at "06:15" and "08:24" (83-enter-again.png, 85-fresh2.png). Night fell and never ended.
4. **Hood camera is inside the rig.** Hood view fills the screen with the hood's red geometry; unusable (07-cam2.png).
5. **Title card re-appears over live gameplay.** While driving Spark, pressing Space re-summoned the "THE GROUND DECIDES / ENTER THE FIELD" card on top of the running world (90-spark-jump.png) — the enter-world button seems to retain DOM focus and Space re-triggers it. This also meant Spark's Space-jump could not be tested.
6. **"B blade" control materialized mid-session** with no unlock toast or explanation (present in 27-night-light.png's control bar, absent from the boot control list). Charming, but reads as a wiring surprise.
7. **Minor:** `page.click("text=Reset field")` timed out ("resolved to button" but not clickable) even though the button is topmost at its center — flaky hit-testing on the bottom bar (73/74 sequence).

## 7. "World I want more of" score: **7/10**

The valley itself is a 9: a place with real physics opinions, fog-of-war cartography, persistent scars, secrets parked across rivers, and a day/night mood — the exact kind of systemic toybox an explorer wants to lose weekends to. The playtest reality is a 5: I never collected a single salvage (so the whole module meta-game stayed locked), night fell and never ended, and my first life ended in a documented, inescapable soft-lock with a dead "Reset field" button. Fix the crate pickup, the clock, and give a stranded player one honest way home (a working reset, a walk-home option, or a free first tow), and this jumps to an 8–9. I would absolutely come back — I still don't know how big the valley is, and it bothers me.
