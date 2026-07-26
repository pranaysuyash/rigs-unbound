# Playtest Sim — First-Time Casual Player (2026-07-25)

Method: fresh-eyes simulated playtest driving real Chromium via Playwright against
http://127.0.0.1:4174/. No project files were read; everything below comes from the
screen. ~15+ minutes of equivalent play across multiple sessions. Screenshots in
`artifacts/playtest-casual/` (filenames referenced below). `render_game_to_text()`
was used 5 times as an accessibility aid, mostly for navigation.

## 1. What I think this game is

Rigs Unbound is a slow-burn, toy-box off-road driving game. You get three chunky
little machines — a farm tractor (Torque), a buggy (Spark) and a hovercraft
(Drift) — and a small open valley with mud, water, hills and trees. The world
itself is the opponent: the ground decides what you can cross ("THE GROUND
DECIDES", says the intro). You roam off the graded tracks to find "salvage",
haul it back to the Home Silo workshop, and bolt on modules (lug tyres, winch,
pontoons…) that unlock new terrain. There's a fog-of-war map that fills in as
you drive, and named landmarks with one-word verbs (TILL, HAUL, TOW, WADE,
ASCEND) that hint at jobs. It's more "meditative physics sandbox with light
progression" than a race or a mission game.

## 2. Everything I did, chronologically

1. **Loaded the page.** Title "RIGS UNBOUND", an intro card "FIELD 02 · TERRAIN
   TRAVERSAL — THE GROUND DECIDES" explaining the three rigs, salvage and the
   Home Silo. Big red ENTER THE FIELD button (01-first-load.png).
2. **Clicked to enter — missed the button twice** (my own mis-click both times).
   Notable: while the intro card was still up, the world kept running and my
   keyboard already worked — I drove to 33 km/h and "discovered Long Furrow"
   with the intro card still covering the screen (14-driving-w-2.png). The
   modal doesn't pause or lock anything.
3. **Entered properly.** Spawned as Torque, the red tractor, on a graded circle
   at Home Silo. Cute low-poly farm: silo, red barn, pond, trees. HUD shows
   grip/grade bars, speed, condition, salvage count, surveyed %, and a
   "signals on the horizon" list with distances (20-really-dismissed.png).
4. **Drove Torque around.** Reached ~33 km/h in 3 s, ~45 km/h on the hardpan
   track. Ran into a tree and _pushed it over_ — toast: "Torque pushed a tree
   over. The clearing stays open." (22-tq-6s.png). Genuinely made me grin.
5. **Pressed every key in the bottom bar.** M opened a fog-of-war field map
   (11% surveyed, "The map only shows ground your rig could see", 24-map-clean.png).
   C cycled cameras (Chase, Hood, Side, Tactical, Top-down, Survey — also a
   VIEW dropdown). P gave a huge PAUSED overlay (28-paused-clean.png). N
   flipped the lighting from day to "Gloam" to night with headlights
   (29-lights-on.png, 30-space-act-clean.png). Space lowered/raised Torque's
   plough ("Field plough lowered. Soft ground will hold the cut."). X said
   "No winch fitted. A recovery winch is 8 salvage at the Home Silo workshop."
   (28-collect-winch.png). B said "Spark carries no blade. Torque does."
6. **Ploughed a muddy slope.** Speed dropped to 6 km/h uphill in churned mud,
   grip "slipping" (25-tq-ploughing.png). The plough visibly cuts the ground.
7. **Pressed R and discovered rig-switching.** R cycles Torque → Spark → Drift,
   and each rig is a _separate parked vehicle somewhere in the world_ — switching
   teleports you to it. Spark was at the farm; Drift was floating out in the
   Sunken Flats wetlands (22-pressed-r-2.png). R while moving is refused:
   "Stabilize the active rig before switching machines." (25-back-to-torque.png)
8. **Drove Spark.** Much faster — 48 km/h in about a second, saw 65 km/h.
   Stalled on a 22% grassy slope: "Too steep for this gearing. Back off or find
   a line." Clipped two trees ("Spark struck tree · condition 88%" → 83%,
   28-sp-3s.png). Tried its jump (Space) at speed — saw a dust burst but I
   couldn't tell if I was airborne.
9. **Drove Drift.** Glides over standing water where Torque would drown:
   "Cushion holding · skim the flooded line Torque cannot ford." (29-salvage-hunt-3.png).
   Slid around at 16–23 km/h, cushion "weak" on bare rock. It happily drove up
   absurd grades ("steep up 202%", later 320%) at 23 km/h, which looked wrong.
10. **Drowned Torque in the pond — twice.** Drove into deep water; "Water is
    over the axles. Get out before it costs you." Condition drained 100 → 37 →
    19 → 0 % while the tractor sat dead (21-cross-2.png, 22-cross-3.png,
    24-map-after-south.png). At 0% the rig just stops.
11. **Hunted salvage for several minutes.** The HUD shows a compass readout
    ("S · salvage 41 m · 1 unit"). I hill-climbed the distance on foot… er,
    wheels — and kept crashing into trees (camera fully blocked by the canopy,
    23-creep-2.png) or sliding into the pond. Best I got was ~24 m away before
    wedging into a tree. Space near nothing said "Nothing in reach. Salvage
    sits off the graded tracks — leave the road." **I never collected a single
    unit.** The nearest salvage to spawn sits _across deep water_ from the
    tractor — brutal for a first-time player (26-topdown-s-5.png).
12. **Hunted the tow/cargo job.** The signals list says "Rustline Salvage · TOW"
    but nothing marks what to tow or where. I spotted an orange crate across
    the pond (20-arc-1.png), tried to reach it, drowned. Drove the long way
    around and never found a prompt. Gave up.
13. **Tried the workshop.** Number keys fit modules; with an empty bin:
    "Low-range gearing costs 6 salvage; 0 in the bin." (20-module-attempt.png).
    T repair said "Nothing to repair." So the whole progression loop was locked
    behind the salvage I couldn't reach.
14. **Reloaded the page.** Everything resets: intro card again, 5% surveyed,
    condition 100%, discoveries gone (21-reload-in-game.png). Same world layout,
    zero saved progress.
15. **Clicked Physics Lab.** A separate page, "Physics Lab 01 — DYNAMIC CHASSIS
    - RAYCAST WHEELS", labeled "EVIDENCE FIXTURE" — clearly a developer tool
      (26-physics-lab.png). It sat on "RAPIER LOADING" with a black viewport and
      zeroed stats.
16. **Clicked Reset field.** No intro card, survey % kept (18%) — it's an
    in-place field reset, not a game reset (22-after-reset.png).

## 3. How each machine FELT

- **Torque (tractor): "planted", "lumbering", "sturdy".** Slow to build speed
  but unstoppable-feeling — it shoves trees over, which is immensely satisfying.
  In mud it turns "slug-like" (20 km/h, 6 km/h ploughing uphill) — but in a way
  that reads as _work_, not as broken. Feels like it has genuine weight.
- **Spark (buggy): "twitchy", "eager", "fragile".** Launches off the line
  (48 km/h in ~1 s vs Torque's ~10), skittish on grass, stalls dead on modest
  hills, and every tree costs it condition. Quickest to get you in trouble.
- **Drift (hovercraft): "floaty", "slidy", "ghostly".** Turns feel like steering
  a bar of soap — it keeps drifting after you stop steering. Ignores water and
  climbs silly grades, so it feels like the "cheat" vehicle, but vague and
  unsatisfying to steer.

They absolutely differ beyond speed: mass/weight, hill ability, water behavior,
fragility, and steering response all read differently within seconds. That part
of the design lands.

## 4. Confused / delighted / bored / couldn't figure out

**Delighted:**

- Pushing a tree over with the tractor, and the game _remembering_ the clearing.
- The plough actually cutting the ground and slowing me down.
- The writing in the toasts ("skim the flooded line Torque cannot ford",
  "Spark carries no blade. Torque does.") — playful and informative.
- The fog-of-war map filling in as I explored; the gloam/night lighting with
  headlight cones.
- The rig-switch teleport: discovering Drift parked out in the wetlands was a
  nice surprise.

**Confused:**

- What am I actually supposed to DO first? The intro mentions salvage and
  modules, but the only guidance is "salvage sits off the graded tracks" — and
  the nearest salvage to spawn is across water the starting tractor can't
  cross. My first 10 minutes were: drive, crash, drown, repeat.
- The signals list (TILL, HAUL, TOW, SHRINK, WADE, ASCEND) — evocative verbs,
  zero explanation. I never found the TOW cargo or any prompt for it; the one
  crate-like object I saw was unreachable across deep water.
- Space means different things per rig (plough / jump / collect?) with no
  on-screen label beyond "act". I never confirmed what Spark's jump looks like
  or how salvage collection actually works (drive over it? press Space? X?).
- "B blade" appeared in the bottom bar at some point with no introduction.
- Physics Lab: a raw dev fixture ("EVIDENCE FIXTURE", Rapier loading stats)
  linked from the main HUD, and it rendered a black viewport. A casual player
  clicking this lands in a broken-looking engineering page.

**Bored:**

- Long empty drives between anything interactive. Once the tree-push novelty
  wore off (~5 min), there was nothing pulling me forward — no visible goal
  marker, no first job, no quick win.
- The 0%-condition drowned tractor just… sits there. No "rescue" flow offered
  (winch costs salvage I don't have), so the only move is reload or rig-switch.

**Wanted to do but couldn't figure out:**

- Collect even one unit of salvage (therefore: buy even one module, repair
  anything, see any progression at all).
- Attach a tow / do the cargo job.
- Jump the buggy in a way I could perceive.

## 5. Was there a goal? When would I have closed the tab?

There's clearly _meant_ to be a loop (salvage → modules → new terrain → the
landmark jobs), and the HUD/map imply longer arcs ("surveyed %", best times
maybe). But in a first session none of it is reachable: I found no tutorialized
first task, no first salvage placed where the starting rig can actually reach
it, and no marker for the cargo job. The game is honest about its systems but
stingy about its on-ramp.

On a real browser as a casual player from a link: the intro card and the chunky
tractor would buy ~3 minutes, the tree-push another 2. After drowning in the
pond with zero salvage and no idea what to do next — **I'd close the tab at
around 6–8 minutes**, feeling like I missed a rule the game never told me.

## 6. Bugs / visual glitches (with screenshots)

- **Hood camera is broken.** Solid grey screen on first use (25-cam2.png); on
  re-test, a huge black rectangle covers the frame at standstill
  (20-hood-verify.png) and a giant dark-red plane (the rig's body, camera
  inside it) fills the screen while driving (21-hood-driving.png).
- **Chase camera has no obstacle handling.** Driving behind a tree fills the
  whole screen with the green canopy blob (23-creep-2.png, 25-creep-4.png,
  26-nav-final.png). Happened constantly in the farmland.
- **Intro modal doesn't pause the game or block input.** You can drive around,
  discover landmarks and presumably crash while the welcome card is up
  (14-driving-w-2.png, 16-turning-left.png). Feels unintended.
- **Physics Lab page appears broken to players**: stuck on "RAPIER LOADING",
  black viewport, all stats zero (26-physics-lab.png). At minimum it reads as
  a dev artifact that shouldn't be a main-HUD button.
- **Drift climbs impossible grades** — "steep up 320%" at 23 km/h
  (24-drift-space.png, 22-drift-5s.png). Physically odd; maybe intended
  hovercraft behavior, but looks like a bug.
- **Dev stats visible in the player HUD**: "Local field record · 115 fps ·
  35 calls · 22 MB" on every screen. Probably a debug line left on.
- **Very dark/low-visibility areas** in the Sunken Flats even at in-game
  "DAY 06:57" — drove blind into a rock wall (22-drift-5s.png, 27-salvage-hunt-1.png).

(Not bugs, but noted: reload wipes all progress with no warning; "Reset field"
keeps survey % but its exact effect is unclear from the player's side.)

## 7. Would play again: 4/10

There's a lovely toy here — the weight of the tractor, the tree-felling, the
plough, the hovercraft skimming water, and writing with real personality. The
three rigs genuinely feel different within seconds. But as a first-time casual
player I spent 15 minutes failing to do the _one_ thing the game asked of me
(collect salvage), because the nearest unit is across water my starting vehicle
can't cross, the camera fights me near trees, and no first job ever presents
itself. I'd give it another shot if someone told me "here's what you do first" —
which is exactly the problem: the game should be the one telling me. 4/10 now;
easily a 7 with a guided first five minutes, a reachable first salvage, and the
hood cam and Physics Lab button cleaned up.
