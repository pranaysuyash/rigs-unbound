# Game Systems Analysis and Long-Term Direction

Date: 2026-07-25
Status: **exploratory analysis; discussion input, not accepted design**
Author pass: full instruction-stack session (~/AGENTS.md → ~/Projects/AGENTS.md → motto_v4 → context pack), code verified as source of truth.

This document does three things:

1. states the verified current state and the central gap;
2. proposes, from first principles, the game-systems layer the operator asked for
   (leveling, new mechanics, modes, scenes, characters) in a form that fits the
   accepted design grammar instead of fighting it;
3. lists the decision points that need the operator before any of this becomes
   an ADR or code.

Nothing here is an ADR. Load-bearing items are marked **[DECISION]** and follow
the ADR-first process (motto §0.12.2): record, sign off, then implement.

---

## 1. Verified ground truth (2026-07-25)

Evidence tier: Tier 2 (83 root vitest tests + 7 kernel-probe tests passing this
session), Tier 1 (static inspection of ~4,500 LOC `src/`), Tier 4 from prior
recorded browser acceptances.

What exists and is real:

- A deterministic fixed-step kernel (`src/game/state.ts`, `physics.ts`,
  `terrain.ts`, `collision.ts`, `exploration.ts`, `gameworld.ts`, `noise.ts`)
  with seeded world generation, bounded mobility adapters (ground, hover),
  capability-gated interactions, world memory (furrows, felled trees, salvage,
  surveyed cells), and schema-v4 validated saves with v1–v3 migration.
- Three rigs (Torque, Spark, Drift) as data-driven profiles with real handling
  contrast; a shared perception chain (ADR-0012) feeding renderer, camera, and
  procedural audio from one derived frame.
- One complete activity: the cargo relay (approach → attach → tow → gate
  delivery → best time). Plus salvage collection, survey/discovery, ploughing,
  repair, winch recovery, and six progression modules composed via
  `effectiveProfile()`.
- Six camera policies, day/gloam/night presentation, minimap, run-record
  journal with tick hashes, perf instrumentation, browser acceptance tooling,
  and a verified public deployment.

What does **not** exist (verified by inspection, not assumed):

- No objectives, goals, win/loss, or session structure beyond the relay.
- No enemies, NPCs, wildlife, or any living thing that is not the player's rig.
- No economy loop: scrap/salvage accumulates and pays for repairs/modules, but
  nothing creates scarcity, choice, or pressure.
- No progression spine: modules exist as items, but there is no leveling,
  mastery, or journey structure connecting them into an arc.
- No farming, no night defense, no time trial — i.e. **ADR-0002, the
  first-playable slice that is supposed to validate the entire product thesis,
  is the least-implemented accepted-direction decision.**
- No second biome/scene; one 500 m world with 7 sites.

## 2. The central gap: an engine without a game

The project has spent its (single, remarkable) day building a portable
architecture: kernel, adapters, perception, persistence, deployment. That work
is genuinely good — the code is clean, layered, tested, and honest about its
evidence tiers. But the architecture ADRs (0006/0007/0009/0012) are Accepted
and implemented while the game-design decisions (0002 slice, 0003 content
model, 0011 command flow) are Proposed and mostly unbuilt. Acceptance is
trailing code on the contract layer, and the slice that tests the fun is
missing entirely.

First-principles read: **the next commit-units should buy fun evidence, not
more architecture.** The exploration map already says this ("the next evidence
unit should test player language, not more ground vehicles") — this document
sharpens it into a concrete systems proposal.

The game-design skill's 30-second test is the right bar: ACTION → FEEDBACK →
REWARD → REPEAT. Today the loop is: drive → world responds → …nothing asks
anything of the player. The relay is the only complete loop, and it has no
opposition, no scarcity, and no reason to repeat.

## 3. Leveling: reconciling the operator's ask with the design grammar

The operator wants leveling. The existing contract says "not a universal XP
ladder." These are compatible — the rejection was of _generic_ XP (a number
that goes up and makes everything uniformly stronger), not of progression
depth. The design grammar already contains the spine; it needs to be made
legible, named, and leveled.

Proposal — **three interlocking ladders, zero universal XP**:

### 3.1 Rig Journey (the character level)

The restoration arc already in the docs — _found → stabilized → working →
specialized → hybridized → storied_ — **is** the rig's level. Make it explicit:

- Each phase is a level with a name, a silhouette change, and an unlock.
- Advancement is gated by _deeds + investment_, not points: e.g. "working"
  requires core systems repaired (scrap cost) **and** one signature job
  completed (plough a first field / deliver a first relay).
- The phase is visible on the machine (DESIGN.md's repair seams, patches,
  silhouette) and in the field kit — the rig's body is its level badge.
- This is per-rig: Torque can be Storied while a newly found wreck is Found.
  The fleet sheet becomes the player's "character sheet."

### 3.2 Verb Mastery (the skill level)

Mastery-through-use, already sketched in the tractor doc, formalized:

- Every capability (`plough`, `tow`, `jump`, `survey`, `winch`, future `haul`,
  `defend`, `build`, `fly`…) carries a per-rig mastery track with a small
  number of named ranks (e.g. _Novice → Practiced → Seasoned → Master_).
- Mastery accrues only from **demonstrated, varied, successful use** — towing
  the same crate in a circle accrues nothing after the first repetitions;
  towing uphill at night in rain accrues more. This is the anti-grind rule:
  the system rewards _situations_, not repetitions. (Implementation sketch:
  mastery events keyed by situation-hash; diminishing returns per hash —
  cheap, deterministic, testable in the kernel.)
- Rank rewards are **depth, not raw power**: a Master of tow gets hitch
  stability options, new coupling types, and contract access — not a blanket
  +20% speed. Vertical power comes from modules/restoration (which cost
  scrap); horizontal optionality comes from mastery (which costs play).

### 3.3 Insight (the knowledge level)

Already designed as the non-spendable discovery currency. Keep it, and give it
one more job: Insight thresholds _reveal_ module categories, site lore, and
opportunity-compass range. It is the explorer's ladder and the pacing valve
for content unlocks.

What this deliberately avoids: a player level, a universal power score, XP
bars that fill from everything, and any spendable premium track. What it
delivers: three visible ladders, each tied to a different motivation type
(achiever: journey; killer/mastery: verb ranks; explorer: insight) — matching
the motivation table in the design skill without importing MMO grind grammar.

**[DECISION]** Adopt Journey/Mastery/Insight as the progression spine
(candidate ADR-0018). Depends on ADR-0003's blueprint/instance model for where
mastery lives (proposal: mastery is instance state — it is _this_ machine's
history; a fresh identical blueprint starts unranked).

## 4. New mechanics — first-principles candidates

Filter used: a mechanic earns its place only if it (a) makes a vehicle's
_shape/verbs_ matter, (b) writes to world memory, or (c) transforms genre
through place/time/scale. Ranked by evidence-per-commit:

### 4.1 Noise and light signature (the ecology substrate) — highest value

One scalar field the kernel already half-computes: engine load, speed, plough
state, tool use, and phase (day/night) combine into a rig's **signature** —
how much noise and light it emits. Everything alive reacts to signatures:

- Night threats drift toward noise/light → farming loudly at night is the
  risk-reward core of ADR-0002's defense loop, for free.
- Skittish salvage creatures flee signatures → stealth approaches (low gear,
  lights off, coasting) become a real verb.
- A quiet electric/hover rig vs a loud diesel tractor is a _mechanical_
  difference players can feel, not a stat sheet.

This is one kernel system that seeds farming risk, stealth, hunting, and
defense — and it makes audio (already procedural per rig) gameplay-relevant.
It also answers the DESIGN.md gap that night enemies "read as generic spider
drones": threats designed around _what they hunt_ (noise) have ecology, not
just silhouettes.

### 4.2 Terrain memory as gameplay

Furrows/deformation already persist. Make them matter: ploughed lines drain
water (affecting hover vs wheel choice after rain), packed trails become
faster routes (self-authored roads), wallowed mud traps heavy rigs. The world
remembering the player stops being a visual feature and becomes the strategy
layer — and it is already simulated and saved.

### 4.3 Capability-composition contracts (the quest grammar)

Not "quest markers" but **situations requiring two+ verbs**: tow + survey +
winch rescue (a rig stuck across water — already the named next activity in
the map), plough + defend (prepare ground by day, hold it by night), jump +
deliver (courier routes over broken terrain). Contracts are generated from
world state and capability queries — never rig names — so any future rig that
satisfies the verbs can attempt them. This is ADR-0011's affordance model
becoming content.

### 4.4 Opportunity compass (the guidance hypothesis, made concrete)

The map's "opportunity compass revealing verbs, not quest spam": a field-kit
element that points at _verbs in reach_ ("soft ground NE — ploughable",
"distress ping — winch range") rather than objectives. It doubles as the
onboarding teacher and the Insight payoff (insight extends its range/resolution).

### 4.5 Fleet-as-towers (defense mode, when defense lands)

Parked rigs are not inert: a rig with a module becomes a turret, a wall, a
light source, a decoy signature. Defense is fleet _placement_, which only this
game can offer — the genre transformation (farm → tower defense) happens by
_where you leave your machines_, diegetically.

Deliberately **not** proposed now: crafting trees, hunger/upkeep chores
(Pacific Drive's failure mode, per the reference atlas), PvP anything, pets,
building placement grids (conflicts with terrain-memory freeform).

## 5. Game modes on the current kernel

The north star is one world whose place/time/scale transforms genre — so
"modes" are _states and sites_, not menu entries. What each needs beyond
today's kernel:

| Mode                                     | Genre state               | Missing systems                                                                               | Kernel risk                  |
| ---------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------- |
| Farm day / defend night (ADR-0002 slice) | Time-state transformation | Crops/growth, signature ecology (4.1), night threats, dawn consequences                       | Medium — first living actors |
| Time trial / circuit                     | Same world, route rules   | Checkpoint/gate system, ghost replay (run-record exists — replay is the ADR-0014 step-4 gate) | Low — mostly contract work   |
| Rescue/salvage ops                       | Site-based                | Capability-composition contracts (4.3), stuck-rig/cargo entities                              | Low-medium                   |
| Convoy/escort                            | Route-based               | One NPC mover + threat reactions                                                              | Medium                       |
| Fleet defense (tower)                    | Site + night state        | 4.1 + 4.5 + wave director                                                                     | Medium-high                  |
| Toy-scale interior / space / launch      | Scale regime change       | Separate origin/scale regime — **deferred by design**, keep deferred                          | High — do not pull forward   |

Recommended sequencing in commit-units (dependency order, not priority order):
crops+signature ecology → night threats + dawn consequences (this _is_ the
0002 slice) → mastery/journey spine wired to the slice's deeds → time trial
with ghost (forces the replay lane honestly) → composition contracts → convoy.

## 6. Scenes and world structure

- Current world: 500 m disc, 6 biomes, 7 authored sites, deliberate emptiness
  budget ("large enough to be empty" is a recorded risk). **Density of reasons
  before area** — the next biome should not arrive until sites have states.
- Site states are the cheapest scene-multiplier: each site gets calm/crisis,
  day/night, owned/contested variants (DESIGN.md already demands two states
  per location). Seven sites × two+ states ≈ fifteen scenes without new terrain.
- Signal Noir (night/danger) and Salvage Opera (rare crescendo) are already
  positioned as _state layers over the same world_ — implement the first as
  the night-defense presentation pass, not a new scene.
- Region graph / second biome family stays gated behind the recorded gate
  (render/perf contract OR a locomotion family that changes outcomes).

## 7. Characters

- **Vehicles are the characters** (the experience promise). Roster strategy:
  hold at three. The recorded gate is external player language — do players
  say "heavy," "nervous," "skimming"? Until that gate passes, a fourth rig
  adds cost, not evidence.
- **NPCs**: favor-givers (workshop, blueprints, loaners) as _places with
  presence_ first (a lit workshop, a radio voice, a mailbox) — no walking
  humans needed for a long time; "no humans" is already the art direction.
- **Enemies**: the ecology board is a recorded open design gap. Proposal: the
  first enemy family is signature-hunters (4.1) — things that hear engines and
  see lights. That constraint generates silhouettes (listeners, moths,
  burrowers) instead of generic drones, and keeps combat about _the machine's
  tradeoffs_ (power vs quiet) rather than guns on a tractor.

## 8. Documentation hygiene findings (this pass)

Found while reading; recorded, not fixed (parallel agents are actively editing
these files; fixing concurrently risks destroying their work):

1. `MULTI_SKILL_LONG_TERM_POSSIBILITY_AUDIT` references "ADR-0009 render
   contract" — ADR-0009 is bounded mobility adapters; render contract is
   ADR-0010/0015/0016. Stale cross-reference.
2. The two-engine bakeoff (exploration map decision unit B) is effectively
   orphaned: ADR-0015 makes Three.js the v1.x default while ADR-0001 keeps the
   engine Proposed. This should be reconciled explicitly — either schedule the
   bakeoff or close unit B with a recorded reason. **[DECISION]**
3. Four overlapping Proposed ADRs cover renderer policy (0010/0012-parts/
   0015/0016); acceptance boundaries are blurry and code (run records,
   reduced motion) is landing ahead of sign-off. The contract layer needs an
   acceptance pass, not more proposals.
4. Exploration-map lane AE and the multi-skill audit still frame the "second
   locomotion family" as pending; Drift closed it. Stale.
5. Two 390×844 findings from the traversal review (touch-row overflow,
   workshop panel) were never explicitly closed by later acceptances.
6. Page title still says "Field 02"; `?acceptance=field-02` URL param is read
   by nothing; `ObstacleKind "stump"` is never generated; `main.ts` hardcodes
   `LANDMARKS[1]` (index-coupled to site ordering). Minor code fossils.
7. No ADR exists for: progression/economy spine (§3 proposes it), save
   backend/accounts, NPC/enemy authority, audio architecture, or a project
   license (ADR-0005 explicitly left it unselected — the repo is public).

## 9. Decision points for the operator

1. **[DECISION] Progression spine** (§3): adopt Journey/Mastery/Insight as the
   leveling model → becomes ADR-0018, then implementation in dependency order
   (mastery events in kernel → journey phases → field-kit legibility).
2. **[DECISION] Next build target**: the ADR-0002 slice (crops + signature
   ecology + night threats) is my strong recommendation — it is the accepted
   thesis test and turns §4.1/§4.2 into fun evidence. Alternatives: mastery
   spine first, or replay/ghost time-trial first (cheaper, but buys
   architecture evidence, not fun evidence).
3. **[DECISION] Engine question disposition** (§8.2): formally close the
   bakeoff as "Three.js accepted for v1.x per ADR-0015, bakeoff reopens only
   on a concrete disputed question" — or schedule the probe.
4. **[DECISION] Enemy ecology direction** (§7): signature-hunters as the first
   family vs another concept; also gates the pending enemy-ecology visual board.
5. **License selection** for the public repo (§8.7) — unglamorous, load-bearing.

## Operator decisions — 2026-07-25 (append)

Recorded verbatim from the direction session:

1. **Build target:** "do all" — all four options proceed: the farm/defense
   slice, the mastery/leveling spine, time trial + ghost replay, and the
   external-player gate **simulated** for now (fresh-eyes agent playtests
   standing in for strangers, real external playtest still open). Constraint
   given: same rules and documentation discipline stay intact.
2. **Leveling:** adopt the full Journey + Verb Mastery + Insight spine **and**
   strengthen it with vertical power — levels must make rigs visibly stronger,
   not only unlock options. Ratified as ADR-0018 (Accepted).
3. **Engine:** schedule the bakeoff probe. Note: a parallel workstream had
   already produced `docs/research/ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md`
   and a physics-lab surface this same day; the probe is scheduled against
   that contract rather than duplicated. ADR-0001 stays Proposed until probe
   evidence exists; ADR-0015 keeps Three.js as the v1.x default in the
   meantime.

## Anything else?

Yes. Two cross-cutting notes the per-section analysis did not say plainly:

- **The project's real risk is not tech, it is taste-at-a-distance.** Every
  acceptance review lists "external player language" as unverified. The single
  highest-value non-code action available is putting the build in front of
  three people who have never seen it and writing down their words. One hour
  of that is worth more than any system in this document.
- **Doc mass is becoming its own risk.** ~40 durable docs were written in one
  day; stale cross-references are already appearing (§8). The map needs a
  periodic reclassification pass (it claims to be a living system — living
  systems also prune), or future agents will navigate by fossils. This is a
  process decision, not a criticism: the docs-first discipline is why this
  analysis could be written from evidence.
