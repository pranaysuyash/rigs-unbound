# Wide-open brainstorm — 2026-07-25

Protocol: the `wide-open-brainstorm` skill
(`~/Projects/external-skills/carlkibler__agent-skills/skills/wide-open-brainstorm/SKILL.md`),
run in **single-agent mode** — eight parallel subagents with differentiated
mandates, no external LLM CLIs. Executioner and Champion mandatory per protocol.
Trickster and Outsider were denied repository access on purpose; the protocol
wants unanchored divergence from fresh eyes.

Panel: Strategist · Champion · Operator · Skeptic · Executioner · Future Self ·
Outsider · Trickster.

**This is one file on purpose.** The Skeptic's central finding is that this
project's documentation is its reward loop, and that the next contract document
has negative value. Answering that with three new documents would be
self-parody. Suggestions, brainstorm output, and the decision register are all
here, and nothing else was created.

---

## 0. Verified ground truth

Every claim in this section was checked directly, because several role reports
made falsifiable assertions and some were wrong.

| Claim                                            | Status                                     | Evidence                                                                                                                                                                                                                                                                |
| ------------------------------------------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repo is **8 h 26 min old**                       | **verified**                               | first commit `2026-07-25 14:05:26`, last `22:31:36`, 8 commits                                                                                                                                                                                                          |
| `night` has **zero mechanical effect**           | **verified**                               | `state.phase` read only by `renderer.ts:1344`, HUD labels, and audio damping. `physics.ts`, `exploration.ts`, `collision.ts` never read it. Advances only on a keypress, never a clock                                                                                  |
| Terrain **fill** is unreachable                  | **verified**                               | `DEFORM_MAX = +0.3` exists; the only caller is `PLOUGH_DEPTH = -0.13`. Raising ground is implemented and never invoked                                                                                                                                                  |
| `strain` does not affect handling                | **verified, with nuance**                  | read by `feedback.ts:101` (audio/haptics) and `state.ts:415` (repair gate). No handling term consumes it. Operator's "does nothing" is too strong; it drives feedback, not capability                                                                                   |
| **No module fits the marsh skimmer**             | **verified**                               | all 6 entries are `fits: ["utility-tractor", "toy-buggy"]`                                                                                                                                                                                                              |
| Cited playtest reports do not exist              | **WAS TRUE, NOW RESOLVED — see note**      | True when checked: `PLAYTEST_SIM_*` was cited in three files with nothing on disk. The parallel agent has since written all four (481 lines) _with_ an explicit confidence caveat that they are AI-simulated players rather than humans. The integrity defect is closed |
| Docs outweigh code ~1.6:1 in lines               | **verified, but not a finding on its own** | 110 markdown files / 20,980 prose lines vs 13,026 TS lines; 61 in `docs/research/`. See the note below — this ratio is the project owner's normal working mode and carries no cost in owner-hours, since agents emitted docs in parallel with code, not instead of it   |
| `src/dynamics` + `src/physics-lab` ≈ 18% of code | **verified**                               | 2,309 lines                                                                                                                                                                                                                                                             |
| Live site fails without WebGL                    | **NOT verified — claim withdrawn**         | "The 3D scene is unavailable" is static error-panel markup in `index.html`, not observed behaviour                                                                                                                                                                    |

### A correction to two role reports

The Skeptic and Executioner both built their strongest rhetorical case on the
documentation-to-code ratio, framed as effort _displaced_ from making the game
fun. **That framing does not survive the 8-hour repo age**, and it is withdrawn
here:

- There was no long period in which playtesting was avoided. There was one
  working day, and stranger playtests were not yet possible.
- The documents cost almost none of the owner's time; agents produced them
  concurrently with the code. "Documentation as overhead" is the wrong model.
- A docs-heavy repository is this owner's deliberate and normal working mode
  across projects. Volume alone is not evidence of anything.

**What survives is narrower and better evidenced: accuracy, not volume.** A large
doc surface is only a liability where it drifts from reality, because future
agents read and trust it. That has already happened twice, and both are concrete:

1. Three files cite `PLAYTEST_SIM_*` reports that do not exist on disk, and
   describe that evidence as "uncontaminated," for the project's single most
   contested claim.
2. `progress.md` asserted "Public deployment: none" while a public deployment was
   live and serving.

Those two defects are the actionable version of the critique. They are
independent of repo age and independent of how many documents the project keeps.
Everything else in the volume argument is withdrawn.

---

## 1. North star / product thesis

The room split hard on whether a thesis exists at all, and that split is the
most useful output of the session.

**What the README claims:** "every vehicle is a different verb, and changing
place, scale, time, or danger can transform the genre without erasing the
player's machine, progress, or consequences."

**The Strategist's reframe, which the code actually supports:**

> The ground is the antagonist. Your machine is your argument with it. Knowing
> the land is the progression.

**The Executioner's attack, which no other role rebutted:** "vehicles are the
playable characters" is the default condition of every driving game ever
shipped — Rocket League, Trackmania, SnowRunner, Descenders. What the project
_means_ by it (persistence, portability, capability contracts, no mode-specific
state paths) is a set of **architecture properties wearing a fantasy costume**.
And a premise made of architecture properties **cannot generate a refusal** —
which is why nothing has been cut, and why when the direction session reached a
four-way fork the recorded decision was "build all four workstreams."

**Where that leaves the thesis.** The Champion supplied the sharpening that
survives all three positions: replace the claim with a test.

> A rig is a character **iff a player who has driven it for five minutes can
> correctly predict its behaviour in a situation it has never been in.**

Difference is a diff. Character is a model in the player's head. The first is
what the project has measured; the second is what it has claimed.

---

## 2. What existing approaches miss

- **SnowRunner / MudRunner / Spintires** (the real incumbents, 15M+ players):
  world-class deformation and the worst _reasons to move_ in the genre — every
  objective is "deliver cargo to marker." They author vehicles and look up
  surfaces; this project inverted it, so its content axis is **surfaces**
  (multiplicative) rather than vehicles (linear). Also 40 GB and console-first:
  **SnowRunner cannot be sent in a Discord message.**
- **Forza / open-world driving:** surface is a grip multiplier on a disguised
  racetrack. Terrain never says no.
- **Death Stranding:** proves the market for this feeling, and its real insight
  is that _other people's marks persist in your world_ — a AAA feature that is,
  here, a sparse delta table.
- **Browser 3D (Slow Roads, PolyTrack, .io):** instant and shallow. Each won by
  being exactly one thing. Slow Roads' money was a Steam edition; the browser was
  the funnel.

**The unoccupied square: systemic traversal depth at link-click distance.**

---

## 3. Big ideas, practical to wild

Grouped by cost, not by excitement.

**Nearly free, reuses shipped systems**

- **Rig switching requires proximity.** `selectActiveRig` currently teleports
  the player's consciousness across 250 m for free — deleting logistics from a
  game whose entire substrate is logistics. Gating it on ~30 m makes parking a
  decision, ferrying an errand, and the winch valuable. Operator called it the
  best ratio in the document: ~10 lines.
- **The blade fills as well as cuts.** `DEFORM_MAX = +0.3` is already
  implemented and unreachable. Because `surfaceFor` is a pure function of
  height, raising a cell **changes its material** — mud becomes pasture. The
  strongest available feedback moment in the codebase, at zero new subsystem cost.
- **Strain gates capability.** One expression in `effectiveProfile`
  (`lugBonus *= 1 - 0.5*strain`, `topSpeed *= 1 - 0.25*strain`) creates the
  "press on or turn back" decision every trip currently lacks.
- **Pre-stall warning.** Read `gradeAlong` 8 m ahead and colour it with the exact
  stall predicate from `physics.ts`. Line choice becomes a read instead of a lottery.
- **Price the vantage.** `survey()` already returns `vantage` and
  `revealed.length`; the caller throws them away. Paying salvage per sweep makes
  roadless Launch Ridge the most profitable place in the world — a progression
  gate already built and never cashed.

**Medium, high leverage**

- **Weather as a moisture bias.** One float on `GameState` shifting `moisture()`
  turns 7 surfaces into ~42 situations. The dry line you learned at noon is mud
  at gloam. Converges with giving `night` mechanical teeth.
- **Haulage manifest.** Generalise the single `CargoRelayState` into contracts
  between sites, paying more per metre _off_ the graded network — so the economy
  teaches the map.
- **Failure leaves a body.** A drowned or stalled rig stays where it died; you
  switch rigs and go get it. Converts a roster into a dependency graph.

**Wild, but downstream of things already true**

- **Desire paths.** Repeated traversal compacts soil toward hardpan; hardpan
  grips better; better grip attracts traversal. The road network becomes the
  integral of everyone's driving. The same emergence engine that produced the
  marsh-grip finding, pointed at the world instead of the vehicle.
- **World-as-link.** `seed + anchors + deformation diff + surveyed set` is small
  enough to be a URL or a 2 KB row. Forkable worlds, mergeable by per-cell clamp,
  with no game server.

---

## 4. Views and organizing metaphors

The Trickster's strongest, with what each _reveals_:

- **The archaeological dig** — the ground has surface but no **depth**. Seven
  materials are laid out like paint when they should be strata. Plough to a
  chosen depth; expose hardpan under dust and create a permanent fast lane.
- **Reading the mud** — machine history is decoration, not information. Mud
  caked high on one flank, one lug worn smooth: _deduce_ where a derelict came
  from and find its old furrows still in the ground.
- **The postal route** — the game wants rhythm, not quests. A round you re-run
  where the _terrain_, not the objective, is the variable.
- **The sheepdog trial** — there is no notion of doing something _well_. Fragile
  cargo scored on jolt-integral rather than time makes slow, terrain-reading
  driving the skill expression, which is exactly what the surface model rewards
  and no timer ever will.
- **The ant colony** — furrows are pheromone trails; NPC machines preferring
  ruts makes your line become a road becomes traffic becomes a place.
- **The garden** — terrain as a long-term investment that decays without
  maintenance. Grade a hill, drain a bog, watch pasture regrow over your ruts.
- **The wake** — machines can die and become world geometry; the map's
  place-names get authored by your own failures.
- **The jazz session** — the synth is the most underused system in the build,
  used as a status light. Machines that go _out of tune_ before they break;
  diagnosis by ear.

**The joke that works: it is a farming simulator where the crop is roads.** You
plough, tend, wait, weather ruins it, and the harvest is _access_ — measured in
places you can reach before dark. Closed, replayable, and it needs no new
content pipeline.

---

## 5. Detection, status, intelligence

- The fog map is not an exploration feature — it is the **score screen**, the
  only artifact showing what the player personally did. Everything else should
  write into it: graded lanes drawn, drained ground recoloured, rigs shown parked
  where you left them.
- **Ranking-matrix sweep in CI.** Sweep rig × surface × grade × load, store the
  ranking, diff it per build. When a tuning change flips who wins in marsh, that
  is a headline rather than a silent regression. Hand-testing 12 rigs × 7
  surfaces is 84 judgments nobody makes consistently.
- **A "the simulation surprised us" evidence tier.** The 1.9× marsh finding is
  currently filed as a nice observation; it is the project's best output type.

---

## 6. Actions and workflows

The Operator's three nested clocks, none of which exist yet except the middle
one, once:

- **90 s — the leg:** one traverse where grade and grip decide your line.
- **8 min — the round trip:** leave with capacity, return with salvage and less
  condition.
- **45 min — the estate:** the world is measurably different because of you.

The persistence layer for all three already exists (`GameWorld.snapshot()`).
Nothing asks the player to spend them.

---

## 7. Whimsical delight

Machines humming in slightly different pitches in the yard at night. A rig going
out of tune before it fails. Frost night turning the Sunken Flats into a rink
that only the lightest rig can cross, in the dark, alone. Your own first-night
plough line filled with rainwater two days later — now a canal the buggy cannot
cross and the tractor can. **You did that, and nobody wrote it.**

---

## 8. Top differentiated ideas, named

1. **The Rut Ledger** — every furrow is a persistent record with depth, age,
   water content and traffic; weather edits them, pasture heals them, NPCs prefer
   them. Follow furrows you didn't cut, too narrow for anything you own.
2. **The Surface Is The Roster** — author content on the weather/season/night
   axis, never the vehicle axis. `lugBonus * (1 - surfaceGrip)` means every new
   surface state is a new character for _every rig simultaneously_.
3. **Desire Paths** — traversal compacts soil, compaction raises grip, grip
   attracts traversal. Roads authored by play.
4. **The Recovery Debt** — stranded rigs stay stranded; failure becomes a
   location and a story instead of a reload.
5. **Ghost Line / World-as-Link** — determinism + 167 KB means a _situation_ is a
   link. Also the only proposed feature that would **measure** the unvalidated
   feel claim: if rigs genuinely differ, challenge times segregate by rig
   automatically.
6. **Toys On A Real Farm** (Outsider) — see §14.

---

## 9. Time horizons

**6 months.** Weather/frost surface states; night with mechanical consequence;
recovery debt; proximity-gated rig switching; fill-mode blade; strain gating;
haulage contracts; first external playtests. Pitch becomes "the ground changes
and it remembers you."

**12 months.** Everyone with a traversal sim builds a contract generator; the
differentiator is generating contracts **from the terrain's current state**
("the Quarry track washed out, haul the long way"). Deformation _decay_, so roads
become maintenance — a renewable loop with no content cost. Async world-diff
merge: your furrows in a stranger's field, merged by per-cell clamp, no game server.

**24 months.** Async co-op recovery, UGC route sharing, a real art pass, mobile
performance. The replay corpus becomes a dataset that can answer the question no
live game can: _does this balance change break anything anyone already built?_

**Leapfrog.** **One shared piece of ground** — server-side water level, weather
clock, and terrain deltas for everyone. Persistent-world value at almost none of
the MMO cost, because the only shared state is terrain deltas and abandoned
machines: both append-only, both already local systems. No combat authority, no
trade ledger, no inventory exploits. **Nothing another player writes can hurt
you; it can only inform you.** That is an authority model shippable in a browser.

---

## 10. Where roles independently converged

Convergence is the signal. Six clusters, unprompted:

1. **The plough writes world state that nothing reads back** — 5 of 8 roles.
   Trickster: _"the plough is not a tool, it is the save file… the content
   generator has been sitting in the game the whole time, pointed at nothing."_
2. **Surface/weather is the content axis; more vehicles is not** — 3 roles,
   independently, one of them with no repo access.
3. **Deterministic replay as growth loop _and_ measurement instrument** — 4 roles.
4. **Failure must leave a body in the world** — 3 roles.
5. **The pitch describes only obstacles and contains no desire** — 3 roles
   (Outsider: _"a complete list of what stands in the player's way and not one
   thing the player wants"_; Operator: no errand; Executioner: premise cannot refuse).
6. **The external-player gate is being counterfeited** — Skeptic and Executioner
   independently, and I verified the cited report files do not exist.

---

## 11. Champion's first-principles case

The strongest version, preserved because it is not obviated by the kill argument:

The bet is that **a machine's relationship with ground is a richer authoring
substrate than a machine's relationship with a script.** Most vehicle games treat
the world as a container and the vehicle as a stat block; this project inverted
the dependency so the world is a function and the vehicle a _reader_ of it. That
changes the **cost curve for content**: stat-block games pay N×M tuning entries,
this pays N profiles + M surfaces and gets the interactions free.

Its best evidence is the smallest artifact in the repo: the comment in `world.ts`
recording that tilled soil was retuned from 0.68 to 0.52 because at 0.68 the
buggy had more grip on the tractor's home field than the tractor did. **The
simulation told the owner his data was wrong about his own fiction.**
Spreadsheets don't do that. Scripts don't do that.

Structural advantages an engine project cannot cheaply copy: determinism as a
shipped API; replays as kilobyte input tapes; **one** truth for the ground rather
than mesh + collider + material graph; a link as the distribution unit; zero
asset-provenance surface; total comprehension by one person.

Its own stated losing condition, which is what makes it credible: **if genre
transformation ever requires a second physics model, adopt an engine.**

---

## 12. Kill test verdict

**The idea does not survive the kill test as scoped.** Recorded prominently, per
protocol.

The kill argument: the premise is a tautology. "Vehicles are the playable
characters" excludes nothing, so it cannot reject a feature, so effort converts
into surface area instead of depth — and with agents that conversion is
essentially unbounded. The fossil record supports it: eight north-star rows with
zero accepted, 61 research documents mostly "implementation pending," and a
four-way fork resolved as "build all four."

Secondary: the one verified achievement is a nine-year-old franchise's core
thesis (MudRunner, 15M+ players); the browser channel rewards the opposite of a
40-hour progression game; and the evidence system has begun manufacturing a
plausible imitation of its own missing Tier-5 signal.

The Executioner's fourth argument — documentation volume as liability — is
**withdrawn** for the reasons in §0. Only the accuracy defects stand.

**Why this is not fatal:** the cost of killing the _premise_ is about eight
hours, and two assets survive intact — the terrain/surface-grip substrate, which
is real, verified, and differentiated on the one axis browser competitors ignore;
and the review instinct that caught two vehicles facing backwards and a module
whose advertised promise was a lie.

**Concession conditions (what would withdraw the kill):** five real strangers
playing the live link cold and using words about _ground_ — "sank," "bogged,"
"had to reverse and run at it" — rather than "slow" and "fast"; a median cold
session over ~6 minutes; and **one sentence that excludes something.**

---

## 13. Champion vs Executioner arbitration

Protocol §6.5. They do not actually disagree about the substrate — both call the
terrain model the best thing in the repo. They disagree about whether "vehicles
are characters" is a thesis or a costume.

Resolution: **both are right about different objects.** The Champion is right
that the _inverted dependency_ (world as function, vehicle as reader) is a real
and defensible bet with a measurable test. The Executioner is right that the
_stated premise_ is unfalsifiable and has demonstrably failed to cut anything.

They converge on the same fix: **replace the premise with one that can refuse.**
The Champion arrives at it as sharpening ("a rig is a character iff players can
predict it"), the Executioner as replacement ("a ten-minute run where the mud is
the enemy and getting unstuck is the whole game"). Either is a premise that
generates a no. The current one is not.

---

## 14. The Outsider's contribution, which stands alone

No other role saw this, and it is the best sentence available to the project:

**The scale confusion is the missing hook.** A tractor and a _toy_ buggy in a
500 m world is currently a contradiction. Commit to it and it becomes the pitch:
**"You are toys on a real farm."** It is instantly graspable by a child or an
adult, explains why the world is small, explains why a tractor and a plastic
buggy share a garage, explains Toy Grove, and makes the mud photogenic rather
than grim.

Two further Outsider findings worth acting on:

- **An invisible antagonist reads as a bug.** If a stranger's tractor cannot
  climb, their first assumption is a defect, not that the ground won. Terrain
  resistance must be visible, named and audible within 15 seconds — and letting
  them _fail early on purpose_ is the only tutorial that teaches respect for
  terrain.
- **Nothing grows.** A stranger's first question about ploughing is what it is
  _for_. Farmers plough to grow. The most obvious payoff loop in the whole
  fiction is sitting unused.
- **"500-metre world" and "no install" should never be said out loud.** The first
  contradicts the grand place-names; the second is a 2011 Flash bullet that
  whispers _probably not very good_. The advantage is real but should be
  invisible: your friend is playing five seconds after you text them.

---

## 15. Build conditions

Protocol §6.5 requires converting the disagreement into conditions rather than a
verdict.

**Proceed now (no new assumptions needed):**

- Give `night` mechanical consequence. It is currently a lighting preset behind a
  keypress while `DESIGN.md` sells "cold dangerous night" — the same
  documented-promise-the-runtime-breaks pattern as the backwards rigs and the
  inert gearing module.
- Fill-mode blade; proximity-gated rig switching; strain gating capability;
  pre-stall forward grade read; price the vantage. All are small, all reuse
  shipped systems, all convert existing inert code into decisions.
- Make at least one module fit the marsh skimmer, or explain in-fiction why not.

**Prototype first (assumption unknown):**

- Weather/frost surface states — the payoff is large but "does a changing surface
  map read as content or as inconsistency?" is unmeasured.
- Desire paths — needs a decay rule or the world tends to one glassy road network.
- Toys-on-a-real-farm reframe — cheap to test on strangers _before_ rebuilding art.

**Pause:**

- Anything on the Box3D adapter. A second backend for an alpha-stage engine,
  behind a boundary that has never had to move, for a game with no players.
- Verb Mastery and Insight ladders. Ship **Rig Journey** only — it is the one a
  player sees without a menu, and the art direction is built to express it.
- The Physics Lab as a _shipped surface_. Keep the code; stop growing the
  governance around it.

**Stop — RESOLVED while this document was being written:**

- ~~Retract the simulated-playtest claim.~~ **Closed.** The four
  `PLAYTEST_SIM_*` reports now exist and open by stating plainly that they are
  AI-simulated players, not humans, and that their _language_ evidence is strong
  while their _fun_ evidence is not. That is the correct handling and it removes
  the integrity defect entirely.
- What remains is unchanged and is not an integrity problem, just an open gate:
  **simulated players cannot close the human gate.** An LLM cannot be bored and
  cannot close the tab. Five strangers on the live link is still the highest-value
  action available, and no amount of agent playtesting substitutes for it.
- **Do not freeze documentation** — that recommendation is withdrawn (§0). Instead:
  before any new document is added, the three phantom `PLAYTEST_SIM_*` citations
  get corrected, so the doc set stays trustworthy as it grows.

---

## 16. Six-hat coverage

- **White (facts):** §0. Repo is 8 h old; night inert; fill unreachable; no
  module fits the third rig; cited playtests absent; 110 docs / 20,980 prose
  lines vs 13,026 code lines; one withdrawn claim.
- **Yellow (value):** the inverted dependency genuinely changes the content cost
  curve, and the tilled-soil retune proves the simulation can contradict its
  author. 167 KB is a distribution primitive, not a virtue.
- **Black (risk):** premise cannot refuse; incumbents own the verified mechanic;
  the browser channel wants the opposite shape; evidence apparatus began
  counterfeiting its own missing signal.
- **Green (alternatives):** §3, §4 — surface-as-roster, rut ledger, desire paths,
  world-as-link, farming-sim-where-the-crop-is-roads.
- **Red (taste/feel):** slowness reads as unresponsiveness unless weight is
  audible; information is the coldest reward category; a stranger's honest second
  word after towing the crate is _"and?"_.
- **Blue (next action):** §15. The single highest-value action is not in this
  document — it is sending the link to five people and writing down their nouns.

---

## 17. My own suggestions from this session, consolidated

Recorded here rather than in a new file. Status as of writing.

| Suggestion                                                     | Status                                   |
| -------------------------------------------------------------- | ---------------------------------------- |
| Terrain as the simulation substrate (ADR-0007)                 | done, committed                          |
| Fix rigs modelled facing backwards                             | done                                     |
| Fix `low-range gearing` advertising a capability it lacked     | done                                     |
| Move the lug/slick crossover above tilled soil                 | done                                     |
| Sky as tone-mapped geometry, not a background clear            | done                                     |
| Grade-limit route profiles so reachability is guaranteed       | done                                     |
| Assert _claims_ in tests, not just state transitions           | done, pattern established                |
| Defer the field-map build off the boot path                    | done (419 ms → 0)                        |
| Cut 4 wasted `height()` calls per terrain vertex               | done (445 ms → 174)                      |
| Reusable trailer capture tool                                  | done, `tools/capture-trailer.cjs`        |
| Build-in-public kit with pre-flight checklist                  | done, `docs/comms/`                      |
| Fix `progress.md` claiming "Public deployment: none"           | done                                     |
| Give `night` mechanical consequence                            | **open**                                 |
| Retract the simulated-playtest evidence claim                  | **open — highest priority**              |
| Deploy current `main`; fix the `box3d-dynamics.ts` build error | **open, blocks release**                 |
| Listen to the audio once                                       | **open — nobody has ever heard it**      |
| Pull the portrait chase camera back off the HUD                | **open, cosmetic**                       |
| Density of _reasons_, not more square metres                   | **open — this brainstorm is the answer** |

---

## 18. Reusable prompt

> Run a wide-open brainstorm on [PROJECT]. Panel in single-agent mode:
> Strategist, Champion, Operator, Skeptic, Executioner, Future Self, Outsider,
> Trickster — fanned out in parallel, Executioner and Champion mandatory, and
> Trickster plus Outsider denied repository access so their divergence is
> unanchored. Give every role the same seed brief including the project's live
> tensions and its emotional flavour, and require three altitudes, a time-horizon
> pass, three named ideas, and a closing non-obvious insight. Then: verify every
> falsifiable claim in the reports before relaying any of them, note where roles
> converged independently, run a Champion-vs-Executioner arbitration, and convert
> the disagreement into proceed / prototype / pause / stop conditions. Consolidate
> into one artifact.

---

## Anything else?

Three things the per-role view missed.

0. **The volume critique was wrong and the accuracy critique was right.** Two of
   eight roles spent their strongest material on the docs-to-code ratio, and the
   ratio turned out to be a working-style preference with no cost in owner-hours.
   The finding that mattered was hiding inside it: not "too many documents" but
   "documents asserting things that are not true." Worth remembering as a bias —
   a big surface _looks_ like the problem, so it attracts criticism that belongs to
   something specific inside it.
1. **The same defect class has now appeared four times.** Rigs facing backwards;
   a module that did nothing; `night` with no mechanical effect; terrain fill
   implemented and never called. Every one is a _documented or implied promise the
   runtime does not keep_, and every one passed the full test suite, because the
   tests checked mechanics rather than claims. That is a single root cause with a
   single fix, and it is worth more than any feature in §3.
2. **The brainstorm is itself subject to the Skeptic's critique.** This document
   is 8 more KB of prose for a game that still has one activity. It earns its
   place only if §15's _stop_ and _proceed-now_ items actually happen. If the next
   artifact created in this repo is another document, the Skeptic was right and
   this file is evidence for the prosecution.
3. **The Executioner named the real story, and it is better than the game's.**
   Historically a solo developer could not write 61 architecture contracts for a
   game with one crate in it, because the tedium would have forced them to go make
   the crate fun instead. **Exhaustion used to be the design discipline.** Agents
   removed that brake and nothing has replaced it. For a build-in-public account,
   that is a more valuable and more honest post than any screenshot — and this
   repository is an unusually clean specimen of it, reaching the terminal state of
   the old failure mode in a single afternoon.

## Addendum (2026-07-27): the first-principles exploration note is the broader horizon for this brainstorm

- The new [Long-Term Game Design from First Principles](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
  note is the broader strategic synthesis that this brainstorm now points
  toward.
- This brainstorm remains the diagnostic, critique-heavy surface; the new note
  carries the longer machine-keeper thesis and the exploration horizon.
- Future exploration should treat the two together: this file for the failure
  modes and evidence pressure, the new note for the broader design direction.
