# First post — 2026-07-26

**This post announces Rigs Unbound.** Not a terrain demo, not a physics toy — the
project, with its full stated ambition, on the record, dated.

Related surfaces:

- [Comms package index](README.md)
- [Trailer and X Announcement Decision](TRAILER_AND_X_ANNOUNCEMENT_DECISION_2026-07-26.md)
- [Trailer and Build-in-Public Release Review](TRAILER_AND_POST_RELEASE_REVIEW_2026-07-26.md)
- [Trailer Audio and Edit Production Log](TRAILER_AUDIO_AND_EDIT_PRODUCTION_LOG_2026-07-26.md)

The earlier draft of this file led with mud and grip and left the vision out. That
was wrong. Mud is *evidence*. The thing being announced is the north star in
[README.md](../../README.md):

> Build a playful world where every vehicle is a different verb, and where changing
> place, scale, time, or danger can transform the genre without erasing the
> player's machine, progress, or consequences.

---

## The strategic argument for announcing big on day one

Announcing a vision this large from a one-day-old build invites exactly one
reaction: *show me.* There are two ways to survive that, and you need both.

1. **Carry mechanical proof of the central claim, not a mockup of it.** The
   vision's load-bearing claim is that machines differ *in kind*, not in stat
   blocks. That is already true in the build and it was not authored — the tractor
   and the buggy got their personalities from one grip rule, and I found out which
   one owned the marsh by measuring afterwards. That is the strongest possible
   opening evidence, because it is the vision working at small scale without
   anybody hand-writing the outcome.
2. **Price the ambition honestly in the same breath.** One day old. No goal in it
   yet. Nobody outside the project has played it. Saying that yourself is what
   separates an announcement from a pitch deck.

The alternative — open small, "here's a driving demo," scale the story up later —
costs you the framing permanently. People file you under the first thing they see.
A terrain demo becomes a terrain-demo guy. This project is not a terrain demo.

---

## Blocking checklist before this goes out

- [ ] **Redeploy the public build.** The live deployment still has the pre-fix
      steering (left input turns right). `main` is correct; the site is not. Do not
      share the link until the deployed build is from current `main` and steering is
      verified by hand in a fresh tab, cache cleared.
- [ ] **Watch `docs/comms/assets/trailer-final.mp4` once, with sound.** Every audio
      claim below is measurement. I cannot hear it.
- [ ] Re-render the trailer if the ploughing beat still shows only a couple of
      furrows (see *Trailer state*).
- [ ] Use `docs/comms/assets/trailer-final.mp4` as the default attachment; keep
      `trailer.mp4` only as the silent fallback.

---

## Trailer state

`docs/comms/assets/trailer-final.mp4` — 37.4 s, 1280x720, stereo AAC. Both audio
layers were generated here, nothing licensed, nothing owed to the provenance
register:

- **The engine** is the game's own procedural diesel synth (`src/game/audio.ts`),
  re-rendered offline by `tools/add-trailer-audio.cjs` and pitched by the same speed
  and wheel-slip telemetry a player hears.
- **The music** is an ACE-Step cue generated locally from a brief written for this
  footage (`generate_rigs_unbound_cue.py` in the music-lab repo), then
  sidechain-ducked *by* the engine layer so the machine stays audible through it.

Measured: -13.7 LUFS integrated (platforms target about -14), peak -4.3 dB, no
clipping, audio length exactly matching picture. Of two generated takes the one used
has its mid range 6.8 dB below its low end, which is what leaves room for the engine;
the other was 1.4 dB down and masked it.

**Known weakness in the current cut:** the ploughing beat shows a couple of furrows
rather than a long cut trail — the capture produced 2 where it produced 21 earlier the
same day. Lead on the marsh and hill beats until that is traced and re-rendered; the
furrow trail deserves to be the hero shot.

If the mix feels flat, drop `loudnorm` from the final ffmpeg stage (command in the
worklog). `trailer-with-audio.mp4` (engine only) and `trailer.mp4` (silent) are kept
beside it.

---

## X — the announcement thread

**Post 1 — the vision. This is the one that matters.**

> I'm building a game called Rigs Unbound, and the idea is that a vehicle is a
> verb, not a skin.
>
> A tractor, a bicycle, a toy car, a rocket — each one should make a different kind
> of story possible, not just look different over the same handling model. And
> driving somewhere new should be able to change what genre you're in, without ever
> taking your machine, your damage or your history away from you.
>
> One machine, carried through farming and hauling and racing and rescue, keeping
> the scars.
>
> rigs-unbound.suyashpranay.chatgpt.site

**Post 2 — the proof, a minute later. Attach the trailer here.**

> First evidence it can actually work: I never wrote the tractor's personality, or
> the buggy's.
>
> I wrote one rule about how lugged tyres bite into soft ground. Out of it came a
> tractor that claws through marsh and is miserable at speed, and a little buggy
> that's quick on hard ground, bogs the instant it hits mud, and needs a run-up at
> anything steep.
>
> I found out the tractor owned the marsh by measuring it afterwards.

**Post 3 — the stake in the ground.**

> That's the whole bet. If two machines can end up different in kind from one rule
> about dirt, they can differ in kind all the way up — and the ground is the thing
> that makes them differ.
>
> So the ground is a simulation, not a friction value. Plough a furrow and it stays
> cut into the terrain; drive past an hour later and your own lines are still there.
> The map only fills in ground your machine could actually see from where it stood,
> so climbing a hill buys you information.

**Post 4 — the price, only if the thread is moving.**

> Honest state of it: one day old, no goal in it yet, nobody outside the project has
> played it, so I don't know if it's fun. No engine either — the terrain, the
> physics, the audio and the saves are mine, and Three.js draws triangles.
>
> I'd rather announce the whole idea now and be held to it than reveal it later once
> it's safe.

---

## X — single post, if you'd rather not thread

> I'm building a game called Rigs Unbound. The idea: a vehicle is a verb, not a
> skin. A tractor, a bicycle, a rocket should each make different stories possible —
> and driving somewhere new should change what genre you're in without taking your
> machine or its scars away from you.
>
> First proof it works: I never wrote the tractor's personality. I wrote one rule
> about lugged tyres biting into soft ground, and out came a tractor that owns the
> marsh and a buggy that's fast on hardpan and needs a run-up at any hill. I
> measured that afterwards, I didn't design it.
>
> Browser, phone or laptop: rigs-unbound.suyashpranay.chatgpt.site
>
> One day old, no goal in it yet.

---

## LinkedIn

> I've started building a game, in public, from the first day. It's called Rigs
> Unbound and it runs in a browser tab.
>
> The premise is one sentence: a vehicle should be a verb, not a skin.
>
> In most games a vehicle is a body swapped over the same handling model with
> different numbers attached. I want the opposite. A tractor, a bicycle, a toy car,
> a rocket, something stranger — each one's shape, tools, limits and history should
> change which stories and which mechanics are available at all. And moving into a
> new place, or a new scale, or a new kind of danger should be able to transform the
> genre you're playing without erasing the machine you brought, the upgrades you
> earned, or the damage you're carrying. One machine, taken through farming and
> hauling and racing and rescue, keeping its scars the whole way.
>
> That is an enormous claim to make on day one, so here is the first piece of
> evidence that it's mechanically real rather than a mood board.
>
> I never authored the personalities of the two vehicles in the build. I wrote one
> rule about how lugged tyres bite into soft ground — lugs recover a fraction of
> whatever grip the surface lacks, so they matter most exactly where the ground is
> worst. What came out of it was a tractor that claws through marsh and is unhappy
> at speed, and a light buggy that's quick across hard ground, bogs the moment it
> touches mud, and has to take a run-up at any real climb. Neither has a
> hill-climbing stat. I discovered the tractor had roughly twice the buggy's grip in
> the marsh by measuring it after the fact.
>
> At one point the simulation argued back. Freshly tilled soil was authored at a
> value where the buggy beat the tractor on the tractor's own field, which is not
> what a tractor is for — so the soil changed, not the vehicles. That's the
> behaviour I want from the whole project: a world with opinions I have to respect.
>
> Two other things already hold. Ploughed furrows cut into the real terrain and stay
> there, so an hour later you're driving past your own lines. And the map only
> reveals ground your machine could genuinely see from where it stood, which makes
> climbing a hill an act that buys you information rather than ticking a box.
>
> There's no engine underneath. The terrain generation, the traversal physics, the
> audio and the save system are mine; Three.js draws triangles.
>
> Playable now, browser, phone or laptop:
> rigs-unbound.suyashpranay.chatgpt.site
>
> The honest state: it is one day old, there is no goal in it yet, and nobody
> outside the project has played it, so I do not know whether it's fun. That's the
> next thing to find out. I'm announcing the full ambition now, at the point where
> it's least defensible, because I'd rather be held to it in public than quietly
> discover in three months that I'd talked myself into something smaller.

---

## Reddit — r/gamedev

Title: **Announcing Rigs Unbound: a browser game where a vehicle is a verb, not a skin — and the first two vehicle personalities wrote themselves**

> No engine. Three.js draws triangles; terrain generation, traversal physics,
> procedural audio and saves are mine.
>
> **The design goal.** A vehicle should not be a body swapped over one handling
> model. A tractor, a bicycle, a toy car, a rocket should each make different
> mechanics and different stories possible, and changing place, scale, time or
> danger should be able to change the genre without erasing the player's machine,
> progress or consequences. Persistent machine, transformable world.
>
> **Why I think that's reachable rather than a mood board.** The load-bearing claim
> is that machines differ in kind rather than in stats. That is already happening,
> and I didn't author it. Grip is:
>
>     effectiveGrip = surfaceGrip * tyreGrip + lugBonus * (1 - surfaceGrip)
>
> The second term means lugged tyres recover a fraction of whatever the surface
> *lacks*, so lugs are worth most exactly where grip is worst. Result: a tractor with
> about 1.9x the buggy's grip in marsh, and a buggy that wins on hardpan. I didn't
> pick that crossover — I measured it.
>
> Climbing is emergent for the same reason. Drive force decays toward top speed and
> is reduced below a lugging threshold, so a tractor makes full pulling force from a
> dead stop and a buggy geared for 75 km/h has to take a run-up. Neither vehicle has
> a hill-climbing stat.
>
> It also argued back once: tilled soil was authored at a grip value where the buggy
> beat the tractor on the tractor's own field, which is nonsense, so the soil value
> changed rather than the vehicles.
>
> **Terrain is the substrate, not scenery.** Seven surfaces, material derived from
> height, ploughed furrows persisted as real heightfield edits, fog-of-war revealed
> by raymarched sightlines from wherever the machine actually stood.
>
> Playable, no install: rigs-unbound.suyashpranay.chatgpt.site
>
> One day old, no goal yet — a traversal sandbox with a stated destination, not a
> finished game. Happy to be told which part of the ambition you think breaks first.

---

## Video caption, if the trailer goes out on its own

> Rigs Unbound — a vehicle should be a verb, not a skin.
>
> One rule about lugged tyres gave the tractor the marsh and the buggy the hardpan.
> The furrows you plough stay cut into the terrain.
>
> rigs-unbound.suyashpranay.chatgpt.site

---

## Defending the announcement in replies

Expect "this is just a terrain demo with a big story attached." The answer is a
mapping from each vision claim to something already running, plus an honest gap
column. Keep it to hand:

| Vision claim | Already true in the build | Not yet |
|---|---|---|
| A vehicle is a verb, not a skin | Two rigs whose behaviour diverges in kind from one grip rule, plus emergent gearing; measured, not authored | Only two rigs; no bicycle, rocket or hybrid |
| The world transforms the genre | Seven surfaces, height-derived material, grade-limited routes, sites with distinct opportunities | No genre shift yet — one traversal mode |
| Your machine and its consequences persist | Persisted terrain edits, saved spatial memory, deterministic replay of a run | No damage, parts or upgrade history carried between activities |
| A world is a link | 167 KB link-native build; a world is a seed plus a sparse diff | Not shared between players yet |

If asked what's next, the honest answer is the medium-term design being explored in
`docs/exploration/THE_BIG_IDEA_2026-07-26.md`: the blade becomes the primary verb, the
ground you move becomes the only building material, and traffic compacts soil into
roads nobody designed. Say it's a pitch under evaluation, not a promise.

---

## Holding for later posts

Strong material, deliberately kept out of the announcement. Bug stories land far
better as post three or four, once people know what the project is — opening with "my
tractor drove backwards" frames you as the guy who makes mistakes before anyone knows
what you made.

- **The tractor drove backwards.** Headlights and grille mounted on the same end as
  the plough. Looked fine in every screenshot; caught by a test about which way is
  forward.
- **An upgrade that lied.** "Low-range gearing — climbs steeper hills" changed
  nothing, because the tyres ran out of grip before the engine ran out of power.
  Every test passed, because they checked mechanics instead of claims.
- **The kernel ate the whole frame budget.** Collision re-derived every nearby rock
  and tree from scratch every step — about 250 terrain queries, 18 ms against a
  16.7 ms budget. Memoising a function that was already pure took it to 0.29 ms.
- **A "smoother" terrain anchor that trapped the player.** Blending a flat core into
  a halo left a derivative discontinuity: 0.23 slope four metres from spawn, and the
  rigs couldn't pull away. Smooth-looking is not smooth.

The through-line when you tell them: *my tests checked that things worked, not that
they were true.*

---

## Rules applied

- Lead with the vision. The terrain is the exhibit, not the thesis.
- No numbered thread, no emoji, no "here's what I learned", no moral at the end.
- Specific numbers only where real: 1.9x, seven surfaces, one day, 75 km/h, 167 KB.
- Say the costly thing in the same breath as the ambitious thing. Announcing big and
  admitting it's undefended is credible; announcing big alone is not.
- Don't say "500-metre world" (undercuts the place names) or "no install" (reads like
  a 2011 Flash bullet). "Runs in a browser, phone or laptop" carries it without the
  apology.
