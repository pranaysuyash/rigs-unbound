# Build-in-public kit — 2026-07-25

Drafts only. **Nothing here has been posted, and nothing should be posted until
the pre-flight checklist at the bottom passes.**

Live build: <https://rigs-unbound.suyashpranay.chatgpt.site>

## The honest positioning

What this is: a **playable exploration**, ~10k lines, running in a browser,
with no full game engine in the Field 02 runtime — hand-written terrain,
traversal physics, procedural audio, and save system on top of Three.js for
rendering. Separate Rapier and Box3D laboratories now test replaceable dynamics
without silently turning either solver into the game architecture.

What it is **not**: a game. There is no goal, no progression arc beyond six
modules, no story, and nobody outside the project has played it. Every draft
below says so, because the repo's own README commits to being "honest about its
maturity" and a launch post that overclaims burns the exact credibility that
build-in-public is for.

**The strongest material is not the screenshots. It is the two lies the game told
me.** Everyone posts terrain screenshots. Almost nobody posts "my vehicle had been
driving backwards for a week and I only found out because I wrote a test about
which way is forward."

---

## Draft A — X / Twitter thread

> **1/**
> I'm building a game. In a browser tab. No Unity, no Godot, no engine.
>
> Hand-written terrain, physics, and audio. ~10k lines.
>
> This week it told me two lies to my face. 🧵

> **2/**
> Lie #1: my tractor had been driving backwards.
>
> Its headlights, grille and hood were all mounted on the same end as the plough.
> It had been reversing everywhere, lights pointing behind it, for days.
>
> It looked fine in screenshots. That's the problem with screenshots.

> **3/**
> Lie #2 was worse, because it was a promise to the player.
>
> An upgrade called "low-range gearing" said: *climbs grades that used to stall
> the engine.*
>
> It did nothing. Zero. Not "a small effect" — literally no change to any climb.

> **4/**
> Why: both vehicles were already traction-limited standing still. Their tyres
> gave out before their engines did. So adding engine power changed nothing.
>
> A test asserting "this module changes this outcome" caught it.
> A test asserting "the button is clickable" never would.

> **5/**
> The fix was the missing physics: a tractor makes full pulling force from a dead
> stop. A buggy geared for 75 km/h *bogs* off the line and needs a run-up.
>
> Now gearing does what it says. And "take a run at that hill" is a real thing you
> learn, not a tooltip.

> **6/**
> The thing I actually got right: **the ground is the antagonist.**
>
> On a flat plane, steering is the only input that matters. So there's nothing to
> learn and nowhere interesting to go. A bigger flat plane is not a bigger game.

> **7/**
> So terrain became a simulated system, not a backdrop. Slope resists you with real
> gravity. Surface decides your grip. Mud, dust, rock, and standing water each hold
> differently.
>
> Tractor: 1.9× the grip of the buggy in the marsh.
> Buggy: wins on hardpan.

> **8/**
> Nobody scripted that. It falls out of one line: lugged tyres recover a fraction
> of what the surface *lacks*, so lugs matter most exactly where grip is worst.
>
> Two vehicles that used to differ only on a spreadsheet now differ in the mud.

> **9/**
> Also in: the plough cuts the actual terrain heightfield and it stays cut. The map
> only reveals ground your rig could really see, so climbing a hill buys you
> information.
>
> Playable now, phone or desktop, no install:
> 🔗 rigs-unbound.suyashpranay.chatgpt.site

> **10/**
> It is emphatically not a game yet. No goal, no story, and no one outside has
> played it — so I have no idea if it's fun. That's the next thing to find out.
>
> Build-in-public means posting it before that's answered.

---

## Draft B — LinkedIn

**I'm learning game development by building one in a browser tab.**

No engine. Hand-written terrain generation, vehicle physics, procedural audio and
persistence, with Three.js doing only the rendering. About 10,000 lines so far.

Two things I found this week are worth sharing, because both are mistakes that
looked like success.

**My tractor had been driving backwards.** Its headlights, grille and hood were
mounted on the same end as its plough. It reversed everywhere for days. It looked
completely fine in screenshots — which is exactly why screenshots are not
verification.

**An upgrade lied to the player.** A part called "low-range gearing" promised it
would climb grades that stalled the engine. It changed nothing at all. The reason
was subtle: both vehicles were already limited by tyre grip, not engine power, so
more power had nothing to bite on. Every test I had passed, because they all
checked mechanics — is the button clickable, does the state transition — rather
than checking the *claim*.

That reframed how I test. Now the suite asserts promises: this part changes this
outcome; this surface favours this tyre. Two of my worst bugs were false promises,
not crashes, and only claim-based tests catch those.

The design lesson was bigger. Originally the world was a flat plane, and on flat
ground steering is the only input that matters — so there is nothing to learn and
nowhere meaningfully different to go. A bigger flat plane is not a bigger game.

So I made the ground the antagonist. Slope now resists you with real gravity.
Surface material decides your grip. The result: the tractor has 1.9× the grip of
the buggy in the marsh, while the buggy wins on hard ground. Nobody scripted that
— it emerges from one rule, that lugged tyres recover a fraction of what the
surface lacks, so they matter most where grip is worst. Two vehicles that used to
differ only on a spreadsheet now differ in the mud.

You can drive it in a browser, on a phone or a laptop, no install:
https://rigs-unbound.suyashpranay.chatgpt.site

To be clear about what it isn't: this is not a game yet. There's no goal, no
story, and nobody outside the project has played it, so I genuinely don't know if
it's fun. Finding that out is the next step — and saying so before I know is the
part of building in public that actually costs something.

---

## Draft C — devlog post (long form)

**Title:** The ground is the antagonist
**Subtitle:** What I learned making terrain a simulated system instead of a backdrop

### 1. The leap

I'm building an open-world vehicle game that runs in a browser tab, without a
full game engine. Three.js draws the Field 02 triangles; its terrain, traversal
model, audio, saves, and exploration are project-owned. Separate evidence
laboratories use Rapier and Box3D behind project-owned dynamics ports. The
premise is that **vehicles are the playable characters**: a tractor and a dune
buggy shouldn't be the same car with different paint.

### 2. The problem: a flat plane is not a world

The first playable version had two vehicles with genuinely different stat blocks —
different acceleration, top speed, mass, steering. And they felt identical.

The reason is embarrassing in hindsight. The world was a flat plane. On flat
ground, throttle has no opponent, so the only input that matters is steering. All
those carefully tuned numbers had nothing to push against. Players would only ever
be able to *read* the difference off the HUD.

The instinct at that point is to add content: more vehicles, more places, more
activities. That instinct is wrong. It multiplies content on top of the one
mechanic that has no depth. A bigger flat plane is not a bigger game.

### 3. Making the ground fight back

Terrain became the substrate everything else reads. One function answers *how high
is the ground here and what is it made of*, and physics, collision, the camera, the
map and the renderer all ask it.

Three couplings do the work, and none of them is a stat:

**Grade is gravity.** Slope resistance is the real gravitational component along
your direction of travel. A hill you can't climb is therefore a physical fact
rather than a locked door. I get progression gating for free, with no key-and-door
content: "I can't climb that yet" is legible without a single tooltip.

**Gearing is emergent.** Drive force falls off toward top speed *and* falls off
below a lugging threshold. A tractor makes full force from rest. A buggy geared for
75 km/h bogs off the line. Neither has a "hill climbing" stat.

**Grip gates everything.** Surface grip limits drive force *and* steering
authority. Lugged tyres recover a fraction of what the surface *lacks* — so lugs
are worth most exactly where grip is worst. That single line produces the whole
identity split: the buggy wins on hardpan, the tractor has 1.9× its grip in the
marsh. I didn't script either outcome.

Then routes. Authored tracks between sites are **grade-limited at construction** —
a smoothing pass and a two-directional grade limiter guarantee the corridor never
exceeds ~9°, so the weakest vehicle can always reach every connected place. That
makes reachability a property of the generator rather than something I hope for.
Exactly one site is deliberately left unrouted: the high ridge. The only way there
is up, and a test asserts it's the only one, so I can't accidentally strand a
landmark.

### 4. Two lies

**The tractor drove backwards.** Grille, hood and headlights were at local −Z —
the same end as the plough — while travel is toward +Z. It had been reversing
everywhere with its lights pointing behind it. It was present in *accepted* review
screenshots. Nothing caught it because no test asserted which way a vehicle faces.

**An upgrade did nothing while promising something.** "Low-range gearing: climbs
grades that used to stall the engine." It changed no climb whatsoever, because both
vehicles were traction-limited at a standstill — their tyres gave out before their
engines did, so adding engine power had nothing to bite on. The module was a lie in
the UI for as long as it existed.

Both of these pass every test that checks mechanics. Button clickable: yes. State
transitions: correct. Save round-trips: fine. The tests I added afterwards assert
*claims* instead — this module changes this outcome, this surface favours this
tyre, this route is climbable by the weakest rig. Two of my worst bugs were false
promises, not crashes.

### 5. Where it is

Live, no install, phone or desktop:
<https://rigs-unbound.suyashpranay.chatgpt.site>

One hundred and two root tests, seven deterministic-kernel tests, and five asset
pipeline tests are green locally. The plough cuts the real heightfield and the
cut persists. The map only reveals ground your vehicle could actually see, so
climbing buys information. Production transfer and cold-cache numbers must be
remeasured after the current deployment rather than copied from the older build.

And it is not a game. There's no goal, no story, six upgrade modules, and nobody
outside the project has driven it — so I don't know whether any of this is fun. The
central claim, that these vehicles feel like different machines, is still unproven
by anyone but me. That's next.

---

## Addendum — 2026-07-26: automated trailer capture is now available

The original recording note below is historical and superseded. A reusable
offline-render tool now drives the deterministic browser hooks, produces
frame-accurate footage, and encodes:

- `docs/comms/assets/trailer.mp4`;
- `docs/comms/assets/trailer.gif`;
- `docs/comms/assets/trailer-poster.jpg`.

The current trailer and poster have been visually inspected. They are draft
public materials, not evidence that the game is fun. `tools/capture-trailer.cjs`
is the canonical regeneration path; a human-recorded take is still useful when
real-time input feel or audio needs to be represented.

## Recording the demo (historical note)

**Superseded 2026-07-26:** the project did not have a continuous capture path at
the time of this note. The options considered then were:

1. **Two stills already captured from the live build** (desktop with a visible
   plough furrow trail; portrait mobile with the touch controls). These are usable
   as-is for the post. The desktop one is the strongest single image the project
   has: rolling terrain, the machine, and its cut trail in one frame.
2. **An automation GIF** is technically possible via the Chrome extension, but it
   captures one frame per scripted action, not continuous video. For a *driving*
   game that reads as a stuttery slideshow. I'd recommend against it.
3. **You record 60 seconds yourself.** QuickTime (`Cmd-Shift-5`) or OBS. With the
   shot list below this is a ten-minute job and will look dramatically better than
   anything automated.

### Shot list — 55 seconds, in order

Open the live URL, press **Enter the field**, then:

| # | Time | Action | What it shows |
|---|------|--------|---------------|
| 1 | 0–6 s | Drive forward on the home pad, then off it onto grass | The world exists; scale reads |
| 2 | 6–14 s | Press **Space** (plough down), drive a long slow curve | The trail cuts into the ground and stays |
| 3 | 14–20 s | **C** to Top-down, look at the furrows you just cut | World memory, unmistakably |
| 4 | 20–28 s | **C** back to Chase, drive at a steep hillside and stall | Grade as a real wall; watch the grade bar go red |
| 5 | 28–36 s | Turn, take a run-up, climb a gentler line | The skill: reading terrain |
| 6 | 36–44 s | Drive into the Sunken Flats (marsh) | Grip drops 73% → 53%, speed 33 → 10 km/h on the HUD |
| 7 | 44–50 s | **R** to switch to Spark, same marsh | Visibly worse. Same ground, different machine |
| 8 | 50–55 s | **M** for the field map | Fog-of-war: only what you surveyed |

**Capture notes**

- Press **U** first if you don't want engine audio in the take; leave it on if you
  do (it's synthesised, no assets).
- Record at 1280×720 or larger, windowed, so the HUD text stays legible.
- Shots 6 and 7 are the whole thesis. If you only keep 10 seconds, keep those.
- For a single looping clip for X, shot 2 alone (plough trail curving away) is the
  best 6 seconds in the build.

---

## Pre-flight checklist — do this before posting

- [x] **Deploy current `main`.** Sites version 5 is sourced from
      `1e7992125824a850eb27a9f9d2bbdbc95b229e2b`; Field 02, the Rapier lab, and
      the Box3D probe returned HTTP 200 after the terminal-success deployment.
- [x] **Fix the stale deployment claim in `progress.md`.** It now records the
      live URL, Sites version, source commit, and the rule that live can trail
      local `main`.
- [x] **Generate a trailer through the reusable capture path.** MP4, GIF, and
      poster outputs exist under `docs/comms/assets/`; re-run after the current
      build is deployed if public footage must match production exactly.
- [ ] **Hard-reload the live site in a private window** and confirm first frame
      feels acceptable. Payload is healthy (167 KB, 1.7 s DOMContentLoaded) but
      time-to-first-frame has never been measured in a normal window — only in a
      throttled automation browser, where the number is meaningless.
- [ ] **Drive it on your actual phone**, not just an emulated viewport. Portrait
      layout verified good at 390×844 on the live build; real touch and real
      thermals are not the same test.
- [ ] **Listen to the audio once.** It's wired to real slip/load signals and has
      never been heard by a human. Unheard audio is not shipped audio.
- [ ] **Decide the licence question.** The README currently reserves all reuse
      rights. A build-in-public post drives people to the repo; be ready for
      "can I use this?"
- [ ] Optional but cheap: pull the portrait chase camera back so the field-kit
      panel stops overlapping the machine on phones.
