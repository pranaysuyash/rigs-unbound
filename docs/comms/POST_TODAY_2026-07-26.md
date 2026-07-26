# First post — 2026-07-26

Attach `docs/comms/assets/trailer.mp4` (37.4 s, 1280x720, silent). Add a music
bed before posting.

**Known weakness in the current cut:** the ploughing beat shows only a couple of
furrows rather than a long cut trail. The capture script targets the authored
field correctly and the blade does engage, but the plough produced 2 furrows
instead of ~50 on this build; it produced 21 earlier the same day, so something in
the plough path regressed during a concurrent refactor. The trailer still reads
well if you lead on the marsh and hill beats. Re-render once that is fixed — the
furrow trail deserves to be the hero shot.

**This is post one, so it introduces the thing.** The bug stories are good
material and they are held back deliberately — they land far better as post three,
once people know what the project is. Opening your first public post with
"my tractor was driving backwards" frames you as the guy who makes mistakes
before anyone knows what you made.

Everything below is checked. Nothing is rounded up.

---

## X — the one to send

> Been building a driving game where the ground is the enemy.
>
> Mud, dust, rock and standing water all grip differently. The tractor claws
> through the marsh and struggles on speed. The little buggy is quick on hard
> ground and bogs down the moment it hits mud — it needs a run-up to get up
> anything steep.
>
> I didn't write those personalities. They fall out of one rule about how lugged
> tyres bite into soft ground. I only found out the tractor owned the marsh by
> measuring it afterwards.
>
> Runs in a browser, phone or laptop:
> rigs-unbound.suyashpranay.chatgpt.site

Reply, a minute later:

> Plough a furrow and it stays cut into the terrain. Drive back an hour later and
> your own lines are still there.
>
> The map only fills in ground your machine could actually see from where it
> stood, so climbing a hill buys you information.

Reply two, only if it's moving:

> No engine — the terrain generation and the vehicle physics are mine. It's one
> day old and there's no goal in it yet, so I have no idea if it's fun. That's the
> next thing to find out.

---

## X — single post, if you'd rather not thread

> A driving game where the ground is the enemy.
>
> Mud, dust, rock and water grip differently, so the tractor owns the marsh and
> the little buggy owns hard ground and needs a run-up at anything steep. I didn't
> write those personalities — they fall out of one rule about lugged tyres.
>
> Furrows you plough stay cut in the terrain. The map only shows ground you could
> actually see from where you stood.
>
> Browser, phone or laptop: rigs-unbound.suyashpranay.chatgpt.site
>
> One day old, no goal in it yet.

---

## LinkedIn

> I've started building a game. It runs in a browser tab, and the thing I'm
> chasing is simple: make the ground the opponent.
>
> Most driving games treat terrain as scenery with a friction value. Here it's a
> simulation. Slopes push back with real gravity. Seven surfaces — hardpan, grass,
> tilled soil, rock, dust, mud, standing water — each hold your tyres differently.
> So the tractor claws through the marsh where the light buggy is useless, and the
> buggy is quick across hard ground but bogs off the line and needs a run-up at
> any real hill.
>
> The part I find genuinely interesting is that I didn't design those
> personalities. They emerge from a single rule — lugged tyres recover a fraction
> of whatever grip the surface lacks — so lugs matter most exactly where the
> ground is worst. I only discovered the tractor had roughly twice the buggy's
> grip in the marsh by measuring it afterwards. At one point the simulation told
> me my own data was wrong: the buggy had better grip on the tractor's home field
> than the tractor did, which is not what a tractor is for, so the field's values
> changed.
>
> A few other things that work: ploughed furrows cut into the actual terrain and
> stay there, so an hour later you're driving past your own lines. The map only
> reveals ground your machine could genuinely see from where it stood, which means
> climbing a hill buys you information rather than a checkmark.
>
> There's no engine underneath it. The terrain generation, the vehicle physics,
> the audio and the save system are mine; Three.js only draws triangles.
>
> Playable in a browser on a phone or a laptop:
> rigs-unbound.suyashpranay.chatgpt.site
>
> Being straight about the state of it: this is one day old, there is no goal yet,
> and nobody outside the project has played it. So I genuinely don't know whether
> it's fun. That's the next thing to find out, and I'd rather say so now than
> discover it quietly in three months.

---

## Reddit — r/gamedev

Title: **Made the terrain the antagonist in a browser driving game — the vehicle personalities came out on their own**

> No engine. Three.js draws triangles; the terrain generation, traversal physics,
> procedural audio and saves are mine.
>
> The bet was that if the ground is a real simulation rather than a friction
> value, I wouldn't have to hand-author vehicle feel. Grip is:
>
>     surfaceGrip * tyreGrip + lugBonus * (1 - surfaceGrip)
>
> That second term means lugged tyres recover a fraction of whatever the surface
> _lacks_, so lugs are worth most exactly where grip is worst. The result is a
> tractor with about 1.9x the buggy's grip in marsh, while the buggy wins on
> hardpan. I didn't pick that crossover, I measured it.
>
> It also argued back once. Freshly tilled soil was authored at a grip value where
> the buggy came out ahead of the tractor on the tractor's own field, which is
> nonsense, so the soil value changed rather than the vehicles.
>
> Climbing is emergent too. Drive force decays toward top speed and is reduced
> below a lugging threshold, so a tractor makes full pulling force from a dead stop
> and a buggy geared for 75 km/h has to take a run-up. Neither has a "hill
> climbing" stat.
>
> Playable, no install: rigs-unbound.suyashpranay.chatgpt.site
>
> One day old, no goal yet — it's a traversal sandbox at this point, not a game.

---

## Video caption, if the trailer goes out on its own

> The ground is the enemy. Mud, rock, dust and water all grip differently, and
> the furrows you plough stay cut into the terrain.
>
> rigs-unbound.suyashpranay.chatgpt.site

---

## Holding for later posts

Post three or four, once people know what the project is. These are strong and
they are the reason to keep following — just not the introduction.

- **The tractor drove backwards.** Headlights and grille mounted on the same end
  as the plough. Looked fine in every screenshot; caught by a test about which way
  is forward.
- **An upgrade that lied.** "Low-range gearing — climbs steeper hills" changed
  nothing at all, because the tyres ran out of grip before the engine ran out of
  power. Every test passed, because they checked mechanics instead of claims.
- **The kernel ate the whole frame budget.** Collision re-derived every nearby rock
  and tree from scratch every frame — about 250 terrain queries per step, 18 ms
  against a 16.7 ms budget. Memoising a function that was already pure took it to
  0.29 ms.

The through-line when you tell them: _my tests checked that things worked, not
that they were true._

---

## Rules I applied

- No numbered thread, no emoji, no "here's what I learned", no moral at the end.
- Lead with the ground, because that's what the video shows and what's actually
  unusual.
- Specific numbers only where real: 1.9x, seven surfaces, one day, 75 km/h.
- Say the costly thing — one day old, no goal, nobody has played it. That's what
  makes the rest credible.
- Don't say "500-metre world" (it undercuts the grand place names) or "no install"
  (reads like a 2011 Flash bullet). "Runs in a browser, phone or laptop" carries
  the fact without the apology.
