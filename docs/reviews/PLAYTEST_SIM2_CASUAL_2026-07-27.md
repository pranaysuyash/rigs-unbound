# Playtest Sim 2 — First-Time Casual Player (2026-07-27)

Persona: casual player arriving from a link. No prior knowledge, no docs read. Played in a fresh
browser profile via Playwright at `http://127.0.0.1:4174/`, screenshots-first, keyboard/mouse only
(`render_game_to_text()` used ~5× as an accessibility aid when completely lost/stuck).
Screenshots: `artifacts/playtest2-casual/`. ~35 minutes of real play.

## 1. What I think this game is

A chill, moody off-road driving sandbox. You run a little farm/wasteland homestead with a small
fleet of characterful utility vehicles, drive them over terrain that genuinely fights back, find
salvage out in the wild, and spend it at the home silo on parts that let you cross more kinds of
ground. The hook is literally "the ground decides": mud, tilled soil, water and hills matter more
than horsepower. There's a survey/exploration layer (map fills in, named regions, discovery toasts)
and a light quest chain ("First Fit") that onboards you. Vibes: cozy diorama art meets
mud-runner physics.

## 2. Chronological play

- **Boot.** Title "RIGS UNBOUND", big modal: "THE GROUND DECIDES." introducing three rigs (Torque,
  Spark, Drift) in one evocative sentence each, plus "salvage sits off the graded tracks, spend it
  at the Home Silo." "Measuring device performance…" line, then ENTER THE FIELD button. Good hook.
  (`01-boot-retry.png`)
- First click on the button missed (button is smaller than it looks) — trivial.
- Tutorial card: drive with WASD/arrows. Pressed W. Torque crawled to 5 km/h, then 28 km/h…
  straight into the home silo, because the chase camera was *behind the building* at spawn.
  (`03-enter-field.png`, `06-drive-w.png`, `07-drive-long.png`)
- Cycled camera (C) → Hood view: lovely dash (engine strain, surface grip, load). Drove "forward"
  into a hillside — entire screen went black (camera inside terrain). Confusing.
  (`16-drive-more.png`)
- Blundered into a "Salvage in reach · press Space or Act · 5 units" prompt in the pasture west of
  spawn. Tutorial card explained contextual Act. By the time I pressed Space I'd drifted out of
  range and Space *lowered the plough* instead — which then anchored the tractor at 0 km/h.
  First "huh?" moment. (`09-cycle-view.png`, `11-collect.png`, `13-approach2.png`)
- Raised blade, spent several minutes lost: the "W · salvage N m" hint and I disagreed about
  directions; distance went 8→13→17→21 m. Backed into a tree, wedged, rocked free.
  (`18-turn-to-west.png`, `20-back-to-salvage.png`, `27-uturn2.png`)
- During a U-turn attempt I wedged Torque nose-first against the Home Silo wall and got **hard
  stuck**: no combination of W/S/A/D or blade-down ploughing moved it a centimetre.
  (`33-straight.png` → `39-fwd.png`)
- Clicked "Reset field" expecting a respawn — got a confirm saying it resets "both rigs, the relay,
  and everything the world remembers". That's a *wipe*, not a respawn. Backed out.
- Reloaded the page (persistence check): "Local save restored" — exact position, condition 99%,
  survey % kept. Persistence works. Minor: the intro modal ("THE GROUND DECIDES") shows again on
  top of a returning save.
- Still stuck post-reload. Pressed R — switched to **Spark** at the silo (rig-swap needs proximity).
- Spark off the line: 2 km/h after ~3 s on 97%-grip hardpan. Felt broken; then it spooled up to
  27+ km/h. The intro *did* warn me ("bogs off the line, needs a run-up") — fair, but the first
  3 seconds feel like a bug. (`47-spark-go.png`, `48-spark-runup.png`)
- S confused me: held S while rolling and kept going *forward* 12 m. It's brake-then-reverse.
  Learnable, but undiscoverable in the moment.
- Opened the map (M): "PATCHWORK RUMOR GRAPH" — 5/8 discoveries, named regions (Sunken Flats,
  Rustline Salvage, Long Furrow, Quarry Shelf, Toy Grove…), legend, "climb for sightlines."
  First real sense of a world. Delighted. (`50-map.png`)
- Crashed Spark into the silo (condition 100→90% — crash damage exists). Found Top-down view:
  instantly the best way to navigate. (`57-locate.png`, `60-c2.png`)
- Drove out toward the salvage hints, triggered "**Long Furrow discovered: till.**" toast — nice
  dopamine. (`64-to-wreck.png`)
- Followed the HUD compass to a "1 unit" salvage pile across a mud flat. Spark beached in
  **churned mud (grip 42%)**: 0 km/h for 30+ seconds of W, rocking, run-up attempts — nothing.
  X key: "No winch fitted. A recovery winch is 8 salvage at the Home Silo workshop." R key:
  "Drift is 85 m away at the Home Silo. Drive to it." I can't drive anywhere. **Dead end.**
  (`74-nearby.png` … `83-runup-go.png`)
- Accepted the full-wipe Reset. Replayed the opening with lesson learned: Torque, straight west
  from spawn to the 5-unit pile, "Salvage in reach" → Space → **"Recovered 5 salvage. 5 in the
  bin."** On a fresh run this took under 2 minutes. (`94-collect.png`)
- Drove home. Workshop opened with a clean 1–6 parts menu: Lug tyres (5, recommended), low-range
  gearing (6), survey mast (7), recovery winch (8), flotation pontoons (9), skid plate (5) — each
  with a one-line tradeoff ("Bites into mud…", "Costs top speed", "Crosses the Sunken Flats instead
  of drowning in them"). Bought the recommended **Lug tyres** with my 5. Delightful little shop.
  (`98-buy1.png`)
- R cycled Torque → Spark → **Drift** (marsh-skimmer hovercraft). Drift on pasture: 48 km/h,
  "CUSHION" gauge instead of GRIP, slides and coasts. Instantly the fun one. (`102-drift-go.png`)
- Quest chain continued: "Switch to Torque" → "Lower the blade" → presumably tilling at Long
  Furrow. Stopped here, quest in progress.

## 3. Vehicle feel — adjectives per machine

- **Torque (utility tractor):** deliberate, lumbering, honest, sure-footed, unstoppable-ish,
  tractor-in-a-cute-way. Full pull from standstill, slow steering, 28 km/h feels *earned*.
  Gets wedged on scenery and can't self-rescue.
- **Spark (toy buggy):** sleepy, then zippy; skatey; coasts forever; fragile (crash = condition
  loss); *pathetic* in mud — literally 0 km/h. Personality: an eager RC car.
- **Drift (marsh skimmer):** floaty, fast everywhere, slidey, effortless, grin-inducing. The
  hover cushion changes the whole feel — least "connected" to the ground (ironically).

**Do they differ beyond speed? Absolutely.** Different acceleration curves (Torque instant pull vs
Spark's 3–4 s bog vs Drift's surge), different grip logic per surface (Spark fine on hardpan,
dead in mud; Torque keeps pulling; Drift ignores surface grip entirely on a cushion), different
gauges (GRIP vs CUSHION), different capabilities (plough/tow vs tow/jump vs tow/survey), different
coast/braking behaviour. The trio reads as rock-paper-scissors for terrain, which is clearly the
game's thesis — and it lands.

## 4. Confused / delighted / bored

**Confused:**
- Compass hints ("W · salvage 8 m"). I never cracked the mapping, and with multiple piles the hint
  silently retargets ("5 units" → "1 unit"), so homing felt random. I only succeeded by memorizing
  a landmark from an earlier life.
- Contextual Space: collect vs lower-blade vs explore, changing by proximity. The idea is good
  ("never hides what will happen"), but my first-ever Space press did the *wrong* thing (plough).
- S = brake-then-reverse. No cue that reverse only engages at a stop.
- "Reset field" label vs its actual full-wipe semantics.
- Chase camera at spawn is behind the silo; hood camera goes black inside hills.

**Delighted:**
- The writing voice everywhere ("rides a lift cushion across the flooded Sunken Flats without
  pretending it has wheels", "the ground decides", workshop one-liners).
- The map ("Patchwork Rumor Graph") and discovery toasts.
- The workshop: affordable items highlighted, unaffordable explained ("Need 3 more"), tradeoffs
  in plain words.
- Three rigs that genuinely feel like different animals, and rig-swap by walking/driving up to
  them (with a pointer when they're far: "Drift is 85 m away at the Home Silo").
- Diorama look, dusk light, tiny dust puffs.

**Bored:**
- Long crawls at 2 km/h when a rig is out of its element (Spark in mud: 30+ s of holding W for
  zero metres — that's not challenge, it's dead air).
- Slow 180° turns in Torque (~15 s of holding W+A).

## 5. First task, time-to-reward, tab-close moment

- **Found the first task?** Yes — "FIRST FIT: Recover 5 salvage" is on-screen from the first
  second, plus a workshop nudge. Crystal clear *what*; unclear *where/how*.
- **Completed it?** Only on my second "life". Organically (first run): after ~25 minutes I had
  **0 salvage**, was beached in mud, and wiped the world. On the fresh run I completed it in
  **under 2 minutes** — the task itself is well-placed (a 5-unit pile ~20 m west of spawn); the
  onboarding just doesn't get you to it before you can get lost/stuck.
- **Time to first reward:** ~2 min on the informed run; effectively never on the blind run
  (first *earned* thing was the "Long Furrow discovered" toast at ~18 min, which did feel good).
- **When would I have closed the tab?** Two sharp moments: (1) ~12 min in, Torque welded to the
  silo, no input doing anything; (2) **definitively** at ~22 min, Spark immobile in mud 22 m from
  the prize, the only rescue tool (winch) priced in the currency I can't earn *because* I'm stuck,
  and the only other option a full progress wipe. A real casual player is gone there — not angry,
  just done. What kept me was the writing and wanting to meet Drift.

## 6. Bugs / issues (with screenshots)

1. **Hard stuck on building geometry** — Torque wedged against Home Silo; no input combination
   (drive, reverse, steer, blade) moves it; requires full world wipe. `33-straight.png`,
   `36-to-ring2.png`, `39-fwd.png`.
2. **Softlock-adjacent immobilization** — Spark at 0 km/h in churned mud for 30+ s of continuous
   input; no self-recovery available (winch gated behind 8 salvage, unobtainable while stuck).
   `74-nearby.png`, `81-explore.png`, `83-runup-go.png`.
3. **Hood camera clips inside terrain** — full-screen black while driving. `16-drive-more.png`.
4. **Spawn camera framing** — chase view opens behind/inside the silo, first drive is blind.
   `03-enter-field.png`, `06-drive-w.png`.
5. **"Reset field" is a full wipe, not a respawn** — confirm dialog: "Reset both rigs, the relay,
   and everything the world remembers?" Label undersells destructiveness; no softer "recover rig"
   option exists. (In my automated browser the confirm also auto-dismissed, so I could only accept
   it via a JS stub — worth a manual check that OK/Cancel work in a real browser.)
6. **Intro modal replays over a returning save** — "THE GROUND DECIDES" shows again after reload
   despite "Local save restored". Minor, but a returning player shouldn't re-read the pitch.
7. **Contextual-key collision at the worst moment** — the "Collect: Space/E" teaching card appears
   while Space still lowers the blade out of reach; first-time players will plough instead of
   collect. `09-cycle-view.png` → `11-collect.png`.
8. **Salvage hint silently retargets between piles** ("5 units" ↔ "1 unit") with no indication
   it's pointing somewhere else now. `64-to-wreck.png` vs `66-se-drive.png`.
9. **Automation-only rendering note** — first screenshot attempt timed out under SwiftShader
   (needed a 90 s budget); likely a headless-GPU artifact, not a game bug, but worth one real-GPU
   sanity pass.

## 7. Would I play again? **6/10**

The bones are lovely: a distinctive world, a clear and honest thesis ("the ground decides"), three
rigs with real personality, a shop I immediately understood and wanted more of, and writing that
made me smile. But my first 20 minutes were a tutorial in frustration: blind spawn camera, a
compass I couldn't trust, two separate get-stuck-forever states, and a rescue tool locked behind
the exact progress being stuck prevents. A casual player who hits the mud softlock won't file a
bug — they'll just leave. Fix the recovery loop (cheap tow-home, or winch-by-default, or unstuck
assist), make the salvage hint unambiguous, and stop the intro modal replaying — and this becomes
an 8 I'd happily reopen to go hover across the Sunken Flats.
