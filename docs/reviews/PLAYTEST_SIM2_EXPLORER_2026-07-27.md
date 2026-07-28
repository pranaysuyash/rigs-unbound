# Playtest SIM2 — First-Time Explorer/Tinkerer — 2026-07-27

Persona: explorer / systems tinkerer. Fresh eyes, no project files read. Played ~25 minutes equivalent via keyboard + mouse in Chromium against the local build (game was actually on port **4180**, not 4174 as briefed). 45+ screenshots in `artifacts/playtest2-explorer/`, referenced below by filename.

---

## 1. What I think this game is

**Rigs Unbound** is a low-poly vehicle-terrain sandbox where the terrain itself is the puzzle. The intro card says it plainly: "THE GROUND DECIDES." You run a small yard with three rigs — **Torque** (tractor: pulls from standstill, claws mud), **Spark** (buggy: fast on hardpan, bogs off the line / on hills), **Drift** (hover-skimmer: rides a lift cushion over flooded ground "without pretending it has wheels"). You drive out, **recover salvage** that sits off the graded tracks, **bank it at the Home Silo**, and **fit modules** to change what terrain you can cross. Around that core loop: a signal/radar navigator with unsurveyed bearings, a "Patchwork Rumor Graph" map of named places (Home Silo, Long Furrow, Sunken Flats, Quarry Shelf, Rustline Salvage, Launch Ridge, Toy Grove, Overland Freight Corridor — 5/8 discovered), per-rig context actions on Space (lower blade / explore / take contract), terrain shaping with a plough blade, a survey-percentage that grows as you roam, a condition/damage model, and a day/night cycle.

## 2. Discoveries, and what each felt like

- **The three-rig terrain triangle is real, not marketing.** Torque drove into standing water: grip collapsed to 42%, speed to 0–1 km/h, and the HUD coached me — "Water is over the axles. Get out before it costs you." then "Too steep for this gearing. Back off or find a line." While stuck, condition bled 91% → 31% (`38-out-of-water`, `40-drift-into-water`, `41-drift-water-crossing`). Drift later crossed the same water at 32 km/h (`27-skimmer-drive2`). Discovering that the warning text _means it_ was the best moment of the session — the game punishes and rewards exactly as the intro promised.
- **Contextual HUD warnings.** Grip/grade bars plus plain-language state lines ("slipping", "stalled", "weak cushion", "steep up 25%"). Felt like the machine talking to me. Excellent.
- **R switches rigs on the spot.** Each rig announces itself ("Toy Buggy active · tow + jump", "Marsh Skimmer active · tow + survey + hover") and the bottom control bar rewrites itself per rig. Felt like a garage I carry with me.
- **The map is a rumor graph, not a map.** M opens a node graph of place names with dotted unexplored edges and a discovery counter. Felt mysterious in the right way — I wanted to "unlock" nodes. But it told me nothing about actual geography, which stung when I was lost in fog.
- **Night exists and it's beautiful.** The clock runs roughly 25–30× real time (a day ≈ 50 min). At 18:45 the phase label flipped DAY → **GLOAM**, the sky went rust-red, visibility collapsed, my buggy's headlight (N) became a real tool, and the home base lit its windows (`61-light`, `62-buggy-roam`, `66-night-final`). The gloaming home-yard shot was the atmospheric peak.
- **Damage is positional and sticky.** Condition drops from drowning/stalling and survives reload; "Reset field" restores condition and repositions the rig. Water is a genuine fail-state generator.
- **Churned mud slows but doesn't stop Torque** (7 km/h at 53% grip, `58-grab3`) — again matching the intro's "claws through mud".
- **Unexplained set dressing I could not decode** — and I tried: a teal glowing ring on the ground by a pole (`48-after-reset`, `23-rig-switch`), an orange ramp/platform by the water (`49-post-reset-drive`, `27-skimmer-drive2`), a crate surrounded by an orange glowing ring near where I drowned (`38-out-of-water`). Nothing reacted to driving through/over. These _look_ like interactables and behaved like decals.
- **"Space" is fully contextual per rig** — lower blade (Torque), explore (Spark), take contract (Drift). Pressing "take contract" produced no visible change (`25-contract`).
- **Survey % grows as I drive** (5% → 19% over the session) with no explanation of what it buys.
- **Fog rolls in** in the southern pasture (`54-collect5`) — weather or region dressing, unclear, but it changed the mood.
- **Winch exists as a locked verb** ("X no winch") — a promise of a future tool.

## 3. Vehicle feel

- **Torque:** deliberate, grunt-y, honest. Pulls from 0, forgives mud, dies in water. Felt like a tractor should.
- **Spark:** skittish, eager, tail-happy — 58–61 km/h on pasture vs Torque's ~38, "slipping" warnings at speed. Felt like a toy in the best way.
- **Drift:** gliding, floaty, fast (70 km/h), cushion bar instead of grip, "weak" on 25% climbs. Felt alien compared to the other two — genuinely different machine, not a reskin.

Did terrain make machines matter differently? **Yes — this is the game's core strength.** Water is a hard gate for wheels and a non-event for the hover rig; mud is a shrug for Torque; hills expose Spark. The machine you bring _is_ the decision.

## 4. Alive or empty? Does the world remember me?

**Half-alive, and forgetful in ways that hurt.** The systems (gloaming, fog, damage, signals, discoveries, warnings) make the world feel authored and watchful — more alive than most browser sandboxes. But the memory test failed:

- I ploughed a straight line across open pasture, then reloaded and returned: **no visible furrow, before or after reload** (`51-furrow-topdown` vs `53-reloaded-topdown`). The "Shape soft ground" tip promises cut/fill; the field shows nothing.
- Position, condition, camera mode, and uncollected salvage spawns **do** survive reload (respawned within ~0.5 m of where I left, still ploughing, same red cube 9 m west — `51` vs `52`). Good.
- But an entire session's progress **rolled back**: "5 salvage in the bin" and an advanced objective chain ("Switch to Spark") reverted to "0 salvage in the bin / Recover 5 salvage" after reload (`25-contract` vs `30-back-to-water`) — while the HUD had been saying "Saved locally just now" the whole time. That message lies.
- Spawn position is inconsistent between loads: home, then X≈+35 (in deep water!), then X≈−49, then X≈−101 — sometimes restored, sometimes relocated, once into a drowning trap I had to burn condition escaping.

Verdict: atmospheric and systemically alive; does not yet remember my marks, and only sometimes remembers my progress.

## 5. What I wanted to discover that wasn't there

- A **visible mark** from the plough — a furrow, a cut, a filled rut. Anything. The one terrain-deformation verb the game advertises produces no evidence.
- A reason the **teal ring** and **orange-ringed crate** exist. I drove through, over, and around them: nothing.
- A **contract** that actually starts — Space "take contract" gave no UI, no waypoint, nothing.
- A working **jump** for Spark — pressed Space ("explore") at speed repeatedly; no airborne moment, no feedback.
- **Module fitting** — the headline loop. I never held 5 banked salvage in a session that persisted, partly because of the rollback bug, so the workshop stayed a label, not an experience.
- What **survey %** and the **rings** are for; what "Restore" at Home means (repair? respawn?).
- The world's **edge** — I ranged ±120 m and hit no boundary, but also found no new named region beyond Terrace Farmland/Home Valley labels (at X≈119 the label read "HOME VALLEY" again — either coarse naming or I looped).

## 6. Bugs (screenshots in `artifacts/playtest2-explorer/`)

1. **Hood camera is unusable** — cab geometry fills ~80% of the frame; only slivers of world visible at the edges. `13-at-salvage`, `15-blade-down`, `16-blade-drive`.
2. **Progress rollback on reload** — bin went 5 → 0 salvage and the objective chain reset after reload despite constant "Saved locally just now". `25-contract` vs `30-back-to-water`.
3. **Spawned into deep water** on one load (X≈35.3) and immediately took stall/drowning damage through no action of mine. `38-out-of-water` → `41-drift-water-crossing`.
4. **Spawn-position inconsistency** across reloads generally (home / X+35 / X−49 / X−101 for the same save lineage).
5. **Rig switch (R) silently unresponsive** while stalled in water — presses did nothing, no feedback why. `39-drift-active`…`41-drift-water-crossing` (stayed Torque).
6. **"NEW CONTROL" tips repeat every load** ("Change how you read the world" appeared 6+ times); clicking "Got it" does not stick across sessions, and the card blocks the lower-center view while driving.
7. **Objective guidance ping-pongs** — nearest-salvage retargeting flipped direction and distance rapidly (31 m S → 45 m E → 25 m E within seconds), which reads as noise, not help. `63-night-drive`, `64-night-ring?`, `66-night-final`.
8. **"Take contract" / "explore" / jump produce no observable effect** (or their feedback is invisible). `25-contract`, `59-jump1`, `60-jump2`.

## 7. Score: world-I-want-more-of

**7/10.** The terrain-decides thesis is honored by real systems — water that drowns you, mud that doesn't, a gloaming that makes headlights matter, three machines that genuinely feel like three answers to one question. That's a world with a spine, and I want the Sunken Flats, the rumor-graph edges, the winch, the modules. What holds it back is exactly what an explorer notices first: the world doesn't keep my marks, it forgot my progress once while claiming to save, and its most intriguing props (rings, ramp, contract verb) are currently postcards, not doors. Fix memory and feedback, and this is a 9.
