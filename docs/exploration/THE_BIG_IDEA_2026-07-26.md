# The big idea — 2026-07-26

A design pitch, not a contract. One headline concept, the argument for it, the
smallest thing that would prove or kill it, and the reasons it might be wrong.

---

## 1. The pitch, in one sentence

> **A game where the only thing you build is ground, the ground remembers
> everything every player has ever done to it, and a whole world is a link.**

Working name for the mode: **Reclamation**.

You are a machine. There are no people. A valley is impassable, and you make it
passable — not by unlocking it, but by *physically moving earth with a blade you
drive yourself*. Every metre you grade is a permanent change to the heightfield.
Every rut you wear compacts the soil and makes the next crossing faster. Every
route you open is a route the next machine can use, including machines belonging
to people you will never meet.

The genre framing that makes it click: **a city-builder whose only building
material is dirt, whose only tool is a vehicle you personally drive, and whose
save file is the terrain itself.**

---

## 2. Why this idea and not a different one

I did not pick this because it sounds ambitious. I picked it because it is the
only concept I can find where **every load-bearing prerequisite is already built
and paid for**, and where the things this codebase does unusually well stop being
engineering trivia and become the product.

| The engine already has | Most projects don't | It becomes |
|---|---|---|
| A heightfield that is a pure function of a seed | terrain is baked art | a world is 8 bytes |
| Persistent sparse deformation, bounded and validated | terrain edits are engine-owned blobs | a world's *history* is kilobytes |
| Surface material derived from **height** (`surfaceFor`) | material is painted separately | moving soil changes what ground *is* |
| A deterministic fixed-step kernel with input replay | physics is frame-coupled | a run is a shareable, verifiable tape |
| Emergent vehicle identity from one grip rule | vehicles are stat blocks | machines differ *because of the dirt* |
| 167 KB, link-native, zero assets | 40 GB storefront build | distribution is a message |

The last column is the pitch. Nothing there is a wish; it is an inventory.

**The specific insight:** `surfaceFor` derives material from elevation. That means
raising a muddy cell far enough *turns it into pasture*. Soil is not decoration
being pushed around — soil is the state machine. A player with a blade is editing
the world's rules, not its appearance. I do not know of another vehicle game where
that is true, and it exists in this repo today, reachable and uncalled.

---

## 3. The loop, at three timescales

**90 seconds — the crossing.** You need to get from here to there. The ground says
no: too steep for your gearing, too soft for your tyres, water too deep to ford.
You read the land and pick a line. This already works and is the best thing in
the build.

**40 minutes — the works.** You stop *going around* the problem and start
*removing* it. Cut a bench into the slope so the grade drops under your climb
limit. Fill a bog until it dries into pasture. Bridge a gully with its own spoil.
This is a session with a beginning and an end, and its reward is not points — it
is that a place you could not reach is now reachable, permanently, and the fog map
shows it.

**Weeks — the network.** The valley grows a road system nobody designed. Traffic
compacts soil toward hardpan; hardpan grips better; better grip attracts traffic.
Rain silts your cuts and regrows pasture over unused ruts, so the network needs
maintenance. What you are really playing is **the second derivative of everyone's
driving.**

---

## 4. The five systems, and how much of each already exists

| System | State | What's missing |
|---|---|---|
| **Blade cut/fill** | shipped today | depth control; spoil conservation (dirt removed must go somewhere) |
| **Compaction → desire paths** | not built | ~40 lines: traversal raises a per-cell compaction value; `surfaceFor` reads it toward `track` |
| **Decay** | not built | a `touchedAt` per deformation cell and a bounded decay pass; makes maintenance a renewable loop with zero content cost |
| **Grade/grip gating** | shipped | nothing |
| **World diff merge** | not built | the hard part is already done — diffs are sparse, per-cell, and **commutative under clamped max**, so merging needs no authority, no tick, no rollback |

Four of the five are additive to systems that already run. That ratio is the
reason to believe this is buildable rather than merely appealing.

---

## 5. What is genuinely new here

I want to be careful, because "novel" is usually a lie. Three specific claims:

1. **Terrain as the only construction material.** City-builders place objects.
   Snowrunner deforms mud cosmetically and resets it. Landlord-style terraforming
   games edit terrain with a god cursor. Here you terraform *from inside a vehicle
   that is itself subject to the terrain you are changing* — you can bog your own
   grader in the bog it is draining. The tool and the obstacle are the same object.
2. **Soil that changes the rules, not the texture.** Because material derives from
   height, filling is a state transition (mud → pasture → track) rather than a
   paint job. That is a rules engine disguised as a bulldozer.
3. **Multiplayer with no server and no authority problem.** The only shared state
   is terrain deltas and abandoned machines. Both are append-only and monotone.
   **Nothing another player writes to the world can hurt you; it can only inform
   you.** No combat authority, no trade ledger, no inventory exploits, no
   anti-cheat. That is a genuinely unusual position, and it exists only because the
   world is a small commutative diff over a seeded function.

---

## 6. Why the content never runs out

The failure mode of every open world is that content is authored and therefore
finite. Three generators here are not:

- **Weather × surface.** Seven surfaces times a moisture/frost state is ~40
  situations from one float. The dry line you learned at noon is mud at dusk. Frost
  turns the marsh into a one-night highway. No new terrain, no new vehicles.
- **The players.** Every route dug is content for the next machine. This is the
  Death Stranding insight, except here it costs a KV row instead of a studio.
- **Decay.** The world un-solves itself at a bounded rate, so the same valley is
  re-playable without a designer touching it.

---

## 7. The distribution engine

A world is `seed + anchor manifest + deformation diff + surveyed set`. All four are
small. Therefore:

- **A valley is a URL.** Send someone the valley you spent a week grading.
- **A valley is forkable.** Take the shared world as it stands, branch it, wreck
  it, submit your diff back. Merge is per-cell clamped max — there is no conflict
  resolution to write.
- **A run is a tape.** `seed + rig + input log` reproduces byte-exactly, so a
  challenge — *this hill, this machine, beat my ghost* — fits in a link with no
  server and no video.

The unit of distribution is not the game. It is the situation. That is the growth
loop, the onboarding (a 90-second challenge beats any tutorial), **and** the
measuring instrument for the one unvalidated claim in the project: if the rigs
genuinely feel different, challenge times segregate by rig automatically, and you
have data instead of an opinion.

---

## 8. The vertical slice that proves or kills it

Deliberately small, because the Skeptic in the last review was right that this
project's failure mode is writing documents like this one instead of building.

**One valley. One machine. One impassable place. Twenty minutes.**

- Torque, a blade, and a bog between the player and somewhere they can see but
  cannot reach. The fog map shows the destination from the start — desire first,
  obstacle second.
- Cut and fill with real spoil conservation: what you dig has to go somewhere, so
  the fill comes out of a cut you chose to make.
- Compaction on, decay off. One session should not outlive its own progress.
- Ends the moment the player drives across ground that was water when they arrived.

**The single question it answers:** does moving dirt with a vehicle feel like
building something, or does it feel like chores?

If five strangers finish that and one of them says *"I made a road"* — unprompted,
in their own words — the thesis is alive and everything in §4 through §7 is worth
building. If they say *"I dug a hole for a while"*, the concept is dead and it cost
one slice instead of a year.

---

## 9. Why this might be wrong

Honest failure modes, in the order I think they're likely.

1. **Earthmoving is slow, and slow is boring.** Grading a 60 m bench at a
   tractor's blade rate could be tedious rather than satisfying. Mitigation: the
   loop must pay out in *access*, visibly, within one session — and the fog map is
   the payout surface. If it doesn't land in the slice, no amount of systems fixes
   it.
2. **The player cannot see what they changed.** Terrain edits are subtle at eye
   level. Without a strong before/after read — the map, a contour overlay, the
   surface label flipping "Churned mud" → "Pasture" — the work is invisible and
   therefore unrewarding.
3. **Shared worlds could feel like litter.** Other people's half-finished cuts
   might read as vandalism rather than as inheritance. Mitigation: decay favours
   *used* routes, so the network is curated by traffic, not by moderation.
4. **It is a construction game, and the audience for that may not be the audience
   for a driving game.** This is the real strategic risk and I do not have an
   answer for it beyond the slice.
5. **Scope.** Spoil conservation and merge are both easy to describe and fiddly to
   get right. Neither belongs in the slice.

---

## 10. What I would cut to do this

Straight, because a pitch that adds without subtracting is a wish list.

- **The genre ladder** — zombies, gunfights, tower defence, space. Not deferred:
  *deleted from the pitch*. They are what makes this project unable to say no.
- **Rigs four and up**, until the slice answers its question.
- **Verb Mastery and Insight ladders.** Ship Rig Journey only — the machine's body
  visibly changing is the one progression a player reads without a menu.
- **The second dynamics backend.** The authoritative step must stay pure-TS and
  deterministic, or replays, sharing, merging, and verification all die at once.
  That invariant is now load-bearing for the entire pitch above.

---

## 11. If I could keep only one thing

Compaction. Traversal compacts soil, compaction raises grip, grip attracts
traversal. Forty lines, no new subsystems, and it converts the emergence engine
that already produced the tractor-versus-buggy result from a property of *vehicles*
into a property of *the world*. Roads authored by driving. It is the smallest
change in this document with the largest change in what the game is about.

---

## Anything else?

Three things.

1. **This document is subject to its own warning.** The last review found that
   writing the correct analysis has been substituting for acting on it. This pitch
   earns its place only if §8 gets built. If the next artifact in this repo is
   another document, this one was part of the problem.
2. **The pitch is downstream of one invariant.** Everything in §5, §6 and §7
   depends on the authoritative simulation staying deterministic and pure. That
   invariant will not die from disagreement; it will die from convenience — a WASM
   backend promoted to default, one GPU kernel in the step. It should be written
   down as a hard rule now, while nobody wants to break it.
3. **The honest version of the ambition.** "Vehicles are the playable characters"
   cannot refuse a feature, which is why nothing has been cut. **"You make land
   passable, and the land remembers"** refuses almost everything — including most
   of what is currently on the roadmap. That is not a downside. That is the entire
   reason to adopt it.

## Addendum (2026-07-27): the first-principles exploration note gives this pitch a longer horizon

- The new [Long-Term Game Design from First Principles](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
  note is the broader strategic counterpart to this pitch.
- This pitch argues for the smallest proving slice: compaction, terrain memory,
  and a world that remembers driving.
- The first-principles note expands that into the longer machine-keeper
  odyssey, so future exploration should treat the two together rather than as
  competing theses.
