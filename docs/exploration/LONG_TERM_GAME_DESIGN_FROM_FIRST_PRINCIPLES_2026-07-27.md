# Long-Term Game Design from First Principles

Date: 2026-07-27  
Status: **whole-game exploration; recommendation, not an accepted ADR**  
Evidence: Tier 1 synthesis of current project direction, design documents, reference research, accepted decisions, and four independent game-design critiques; no external-player validation yet

Related: [ADR-0002](../decisions/ADR-0002-first-playable-farmfall-ecology.md) (first-playable day/night loop), [ADR-0018](../decisions/ADR-0018-progression-model-journey-verb-mastery-insight.md) (progression model), [RU-0204](../plans/MASTER_EXECUTION_TRACKER.md) (night threats and dawn consequence).

## Executive thesis

Rigs Unbound should grow toward a **machine-keeper odyssey through a living,
fractured world**.

The player restores a small family of strange machines, learns each one as a
different physical body, uses them to reconnect places and communities, and
eventually carries a mobile workshop from an intimate home landscape toward
impossible scales and horizons. The world remembers how the player helped,
what they neglected, which routes they made, and what every machine survived.

The durable fantasy is:

> **I gave abandoned machines a second life, learned what each one could become,
> and used my strange fleet to leave a wounded world more connected—but not
> necessarily more controlled.**

This is larger than a tractor game, but more coherent than a vehicle anthology.
It provides a reason farming, rescue, racing, construction, defense, toy-scale
travel, watercraft, flight, and spaceflight might belong to one journey: each is
a different way of crossing, caring for, or changing the same world.

The recommended whole-game form is:

> **A persistent home grows into a wandering workshop. Each region is a dense,
> remembered place with its own work, relationships, danger, and physical
> truth. Rare changes of scale or genre reveal that these places belong to a
> larger living atlas.**

This document deliberately separates:

- **preserved vision** — what the project has already consistently expressed;
- **recommended thesis** — the strongest current synthesis;
- **design hypotheses** — promising but unproven answers;
- **near-term tests** — questions playable evidence must answer;
- **operator decisions** — choices that should not be silently accepted here.

---

## 1. Begin with the player, not the rig catalog

### Why does someone start?

The immediate invitation should be emotionally legible:

> A battered machine wakes in a place that needs it. One repair, one reachable
> need, and one distant impossible landmark promise that both machine and world
> can become more than they are.

Players should not begin because a menu offers farming, racing, defense, and
exploration. They begin because:

- the machine is tactile, vulnerable, and intriguing;
- the nearby place contains an understandable need;
- their first action makes a visible difference;
- the horizon promises a larger world without explaining all of it;
- the machine already feels like something worth keeping.

### For whom is this game?

The primary audience is players attracted to **tactile machine mastery, repair
attachment, adventurous exploration, and visible stewardship**. They enjoy
learning a difficult body, solving practical problems creatively, caring about
a place, and seeing history accumulate.

Builders, co-op specialists, collectors, and creators are important secondary
audiences after the solo foundation works. The game is not optimized for pure
combat power fantasy, collection completion, survival grind, idle management,
or leaderboard-first competition.

This audience is a hypothesis to validate before retention design. “Fresh
players” should include people with this appetite; testing only a broad,
undifferentiated audience could reject a distinctive game for not being generic.

### Who is the player?

The provisional hypothesis is **direct machine embodiment**. During operation,
the player is one active rig; there is no default humanoid operator separating
player from machine. Other fleet members retain character and agency rather
than becoming equipment slots. Tactical coordination may later supplement, but
never replace, embodied rig operation.

Switching rigs should therefore feel like inhabiting another distinct body and
perspective—not selecting a unit from a roster. This must be tested directly in
player language.

### Why does someone keep playing?

Long-term desire should come from six mutually reinforcing motives:

| Desire     | Player thought                              | Game expression                                               |
| ---------- | ------------------------------------------- | ------------------------------------------------------------- |
| Attachment | “This is my machine.”                       | Repairs, quirks, scars, sound, history, care                  |
| Mastery    | “I understand how this body works.”         | Weight, terrain, tools, route judgment, technique             |
| Agency     | “That was my solution.”                     | Multiple physical approaches and consequential preparation    |
| Belonging  | “My work matters here.”                     | Recurring places, inhabitants, favors, visible dependence     |
| Curiosity  | “What is over there—and what can reach it?” | Signals, regions, mysteries, scale changes, strange rigs      |
| Legacy     | “The world can show what I did.”            | Persistent roads, fields, water, structures, ecology, stories |

No single progression bar can sustain this. The game becomes durable when the
player accumulates **identity, capability, relationships, knowledge, and
consequences**, not merely resources.

### What stories should players tell afterward?

The desired stories are not content summaries such as “I completed the marsh
mission.” They are authored incidents:

- “I overloaded Torque to save the pump, sank near the reeds, and had to return
  with Drift through the channel I dredged earlier.”
- “The road I cut for the harvest became the evacuation route when the storm
  arrived.”
- “I kept the unreliable original starter because its strange idle warned me
  before the signal took control.”
- “We left the old bridge broken to preserve the wetland, so our convoy now
  crosses by ferry.”
- “That scorched panel came from the launch where I sacrificed the cargo rig to
  keep the workshop in orbit.”

If players mainly tell stories about unlock tiers, quest completion, or which
vehicle has the best stats, the central promise has failed.

---

## 2. The experience contract across time

### Fun in 30 seconds: operate a meaningful body

```text
notice a physical possibility or problem
→ read terrain, load, weather, machine state, and risk
→ choose a line, speed, posture, or tool
→ commit through expressive control
→ feel weight, traction, strain, momentum, sound, and resistance
→ leave a visible result
→ notice the next consequence or possibility
```

The minimum standard is that moving and using a rig is satisfying without XP,
loot, enemies, or dialogue. The machine must continuously answer the player's
input with character.

### Fun in ten minutes: make a plan survive contact with the world

A short outing should contain:

1. a clear need or enticing opportunity;
2. a preparation choice;
3. meaningful travel rather than dead distance;
4. useful work using the rig's physical identity;
5. an unexpected complication;
6. an improvised recovery or tradeoff;
7. a visible consequence;
8. a reason to continue or return.

### Fun in one session: complete an expedition story

Target emotional shape, not a mandatory clock:

```text
home / workshop
→ choose a purpose and prepare
→ travel through a known place with changed conditions
→ perform connected work
→ discover a complication or competing need
→ choose whether to press on, divert, sacrifice, or extract
→ reach a climax through operation, rescue, navigation, or danger
→ return, recover, or establish a field solution
→ inspect machine and world consequences
→ reveal one strong next possibility
```

A session should usually end with:

- one remembered event;
- one visible world change;
- one machine or fleet decision;
- one relationship consequence;
- one unanswered possibility.

### Fun across the campaign: responsibility expands with capability

The emotional arc should evolve:

1. **Survivor** — can I make this wreck move?
2. **Operator** — I understand how this machine behaves.
3. **Helper** — I can solve a need that matters to someone.
4. **Caretaker** — my interventions change this place over time.
5. **Fleet keeper** — different machines depend on and complement one another.
6. **Pathfinder** — the workshop can cross regions and physical regimes.
7. **World shaper** — my choices affect ecology, connection, and culture.
8. **Legend** — my fleet and atlas form a unique autobiography.

### Fun after the ending: expression rather than infinite escalation

Long-tail play can support several identities without one mandatory treadmill:

- master operator: expressive physical challenges and difficult recoveries;
- fleet curator: restore unusual machines and preserve meaningful provenance;
- world steward: revisit consequences and respond to changing regions;
- explorer/archivist: discover routes, histories, and physical anomalies;
- creator: publish bounded routes, operations, and challenge contracts;
- co-op specialist: contribute a complementary machine to shared work.

The game should not need endless stat inflation, seasonal resets, or attendance
pressure to remain interesting.

---

## 3. What makes this one game rather than many vehicle games?

The project's current north star—“every vehicle is a different verb”—is a
powerful **mechanics rule**, not a sufficient **game purpose**.

The coherent hierarchy is:

```diagram
┌──────────────────────────────────────────────────────────────┐
│ PURPOSE                                                      │
│ Reconnect, care for, and reshape a living fractured world    │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ HOME                                                         │
│ A workshop/fleet preserves relationships, history, and intent│
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ BODY                                                         │
│ Each rig supplies distinct movement, tools, limits, and feel │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ SITUATION                                                    │
│ Place, weather, scale, culture, and danger reinterpret verbs │
└──────────────────────────┬───────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────┐
│ LEGACY                                                       │
│ Machine, relationships, and world remember the consequences  │
└──────────────────────────────────────────────────────────────┘
```

The stronger rule is:

> **Every rig expresses a shared world problem through a different physical
> strategy.**

Genre transformation is coherent when the player's established competence is
reinterpreted rather than discarded. A plough can cultivate, cut drainage,
shape a defensive lane, expose buried infrastructure, or prepare a launch
surface. The context changes its meaning; the player still recognizes the
machine and their learned relationship with it.

---

## 4. Four viable whole-game forms

These are genuine alternatives, not feature packages to combine indiscriminately.

### Form A — The Living County

**Fantasy:** Know every road, machine, and community in one dense region, then
watch years of work accumulate visibly.

**Shape:** One deeply simulated home landscape with several settlements,
seasons, crises, and state changes. New rigs reinterpret old places.

**Strengths:**

- strongest attachment and world memory;
- makes slow utility work meaningful;
- supports relationships and consequences cheaply relative to breadth;
- easiest place to make ordinary work emotionally important.

**Risks:**

- may underdeliver on “Unbound” and cosmic aspiration;
- familiar places can feel exhausted if changes are shallow;
- one ecology may not justify the full vehicle universe.

**Best if:** the heart of the project is stewardship and intimacy.

### Form B — The Wandering Fleet

**Fantasy:** Lead a traveling family of machines and a mobile workshop through
a world no single rig could cross.

**Shape:** A connected route graph of dense regional sandboxes. The workshop is
home; fleet and cargo choices shape every expedition. Regions continue changing
after departure and may be revisited.

**Strengths:**

- strongest expression of a growing fleet;
- naturally justifies new biomes, cultures, and vehicle classes;
- preserves an emotional home while allowing large-scale travel;
- makes complementary multi-rig operations the mature game.

**Risks:**

- regions may feel disposable or episodic;
- convoy management may become inventory administration;
- departure can weaken belonging if relationships do not persist.

**Best if:** the heart is journey, found family, and capability composition.

### Form C — The Impossible Atlas

**Fantasy:** Every machine reveals a different truth about the same world.

**Shape:** A compact landscape revisited across radically different scales and
physical regimes. A tractor field, toy-scale interior, flooded underworld, sky
route, and orbital structure are connected layers of one place.

**Strengths:**

- most distinctive and surprising concept;
- new rigs structurally reinterpret known landmarks;
- content reuse becomes revelation rather than repetition;
- supports a strong central mystery.

**Risks:**

- highest conceptual and content-design difficulty;
- “anything can happen” can erase stakes and understandable rules;
- can become a sequence of ingenious puzzles without emotional continuity.

**Best if:** the heart is discovery, transformation, and systemic Metroidvania.

### Form D — The Civilization Journey

**Fantasy:** Carry one lineage of machines and communities from fragile local
survival toward planetary and eventually interplanetary connection.

**Shape:** The campaign expands in eras: bicycle/hand-scale movement, farming
and utility, regional infrastructure, industrial transport, aviation, launch,
and space. Earlier machines remain socially and mechanically meaningful.

**Strengths:**

- gives the tractor-to-rocket ambition a clear arc;
- creates powerful aspiration and civilizational stakes;
- work at small scale can visibly enable later wonders;
- connects technology with culture and ecology.

**Risks:**

- progression can imply old machines and places are primitive or obsolete;
- content burden is enormous if every era is a separate game;
- risks becoming a technology tree rather than a personal journey;
- escalation can devalue the intimate opening.

**Best if:** the heart is legacy, aspiration, and collective transformation.

### Comparative judgment

| Criterion             | Living County | Wandering Fleet | Impossible Atlas | Civilization Journey |
| --------------------- | ------------: | --------------: | ---------------: | -------------------: |
| Machine attachment    |     Excellent |       Excellent |             Good |                 Good |
| Place attachment      |     Excellent |            Good |             Good |             Variable |
| Vehicle breadth       |       Limited |       Excellent |        Excellent |            Excellent |
| Narrative coherence   |        Strong |          Strong |           Medium |               Medium |
| Genre-change support  |        Medium |          Strong |        Excellent |               Strong |
| Long-term aspiration  |        Medium |       Excellent |        Excellent |            Excellent |
| Content scalability   |        Strong |            Good |        Difficult |            Difficult |
| Distinctiveness       |          Good |          Strong |        Excellent |               Strong |
| Social/co-op fit      |          Good |       Excellent |             Good |               Strong |
| Risk of fragmentation |           Low |          Medium |             High |                 High |

---

## 5. Recommended synthesis: The Living Atlas Odyssey

The strongest long-term shape is **The Wandering Fleet grounded in The Living
County, with rare Impossible Atlas revelations and a bounded Civilization
Journey in the background**.

This is a hierarchy, not a feature pile:

1. **The home county earns attachment.**
   The player restores one machine, helps specific inhabitants, and learns that
   useful work has persistent consequences.

2. **The workshop becomes the enduring home.**
   When the world expands, home travels with the player. The garage preserves
   rigs, relationships, memories, preparation, and cultural continuity.

3. **The wandering fleet becomes the campaign form.**
   Regions create new needs and physical truths. A small active fleet enables
   complementary solutions; it is not a warehouse of collectible stats.

4. **Atlas anomalies create rare wonder.**
   Scale changes, toy worlds, impossible interiors, and orbital links reveal
   that the world is stranger than it first appeared. Their rarity preserves
   legibility and awe.

5. **Civilizational change emerges as consequence.**
   The player may help communities connect fields, roads, waterways, skies, and
   orbit, but the game remains about who and what those systems serve—not about
   climbing a generic technology ladder.

Recommended one-sentence north star:

> **Restore a family of strange machines, take your moving workshop across a
> fractured living world, and leave every place visibly changed by how you
> chose to help.**

This preserves the current project north star while adding the missing answer
to “why?”

---

## 6. A candidate world premise: The Sleeping Atlas

This premise is a strong hypothesis, not accepted canon.

The world was once coordinated by the **Atlas**: roads, farms, canals,
workshops, weather systems, signal towers, ports, and launchworks designed to
act as one dependable network. Its makers are absent, transformed, or no
longer in control. Machines survived by repairing one another, inheriting
parts, building local customs, and choosing purposes beyond their original
specifications.

Now the Atlas is waking incorrectly.

Its signal restores infrastructure and predicts disasters, but also recalls
machines to obsolete assigned roles. It straightens improvised routes,
standardizes incompatible parts, and treats accumulated quirks as damage.

The central conflict is not freedom versus an obviously evil enemy. It is:

> **Can a world be reliably connected without turning every being back into a
> tool?**

The campaign asks whether the Atlas should be restored, rewritten, distributed,
or left beautifully incomplete.

The provisional material baseline is that **autonomous machine communities
coexist with living ecologies**. Regions depend on concrete flows of water,
energy, biomass, parts, shelter, information, and usable routes. Their makers
remain absent or ambiguous. This grounds cultivation, infrastructure, Favor,
and rescue in needs that exist beyond quest text without requiring every
inhabitant to be a conventional human or talking vehicle.

### Why this premise is useful

- “Unbound” gains thematic meaning: chosen purpose versus assigned function.
- Vehicle restoration and customization become questions of identity.
- Different regions and physical regimes can belong to one network.
- The antagonist threatens the exact thing players value: accumulated machine
  history and local difference.
- World restoration remains morally interesting rather than automatically good.
- The opening tractor still matters in the final world-scale decision.

### Premise alternatives worth preserving

1. **The Road After People** — machines continue work after their makers vanish;
   emotionally powerful but risks making vehicles feel like substitutes waiting
   for humans to return.
2. **The Folded World** — incompatible scales and places were joined by a
   transport accident; visually liberating but can weaken causality and stakes.
3. **The Moving Commonwealth** — communities survive aboard vehicle convoys;
   excellent campaign structure but weaker mystery and place attachment.

The recommended synthesis uses the moving commonwealth as campaign form and
folded-world phenomena as rare Atlas failures, while keeping the makers
ambiguous rather than making their return the purpose of the story.

---

## 7. Characters, cultures, and emotional attachment

### The three character layers

1. **Rig as body** — movement, limitations, tools, condition, and physical
   personality.
2. **Fleet/workshop as family and home** — continuity, preparation, mutual
   dependence, and shared history.
3. **Places and inhabitants as meaning** — needs, recognition, disagreement,
   consequences, and belonging.

Vehicles alone can create fascination and mastery. They cannot automatically
create someone worth helping, a culture worth understanding, or a consequence
worth regretting.

### Avoid easy anthropomorphism

The rigs should not become ordinary human characters with windshield eyes and
constant dialogue. Character should first appear through:

- handling under load;
- idle and engine rhythm;
- headlight, tool, and suspension posture;
- route preferences and hesitation;
- reactions to damage, repair, terrain, and former parts;
- radio motifs, horn language, mechanical gestures, and traces;
- how one machine physically assists another.

Words can exist, especially through radios, workshops, inhabitants, and signal
networks, but they should interpret physical behavior rather than replace it.

### Fleet relationships are playable

Machines form relationships by:

- towing and recovering one another;
- scouting routes another can cross;
- carrying, sheltering, or stabilizing another rig;
- donating power, tools, or storied parts;
- opening routes others exploit;
- serving as parked support during a crisis;
- teaching paired techniques through shared work.

The player believes two machines matter to one another after depending on both
in a remembered incident—not after filling a friendship meter.

### Candidate ideological factions

Factions should embody competing beliefs about purpose, repair, freedom, and
collective responsibility:

- **Hearthworks** — place-bound utility machines who believe being needed gives
  purpose; caring but suspicious of rootless experimentation.
- **Ordered Line** — infrastructure and service fleets restoring dependable
  standards; genuinely helpful but prone to erasing difference.
- **Freewheels** — couriers, racers, scouts, toys, and hybrids who create new
  routes; inventive but often leave maintenance to others.
- **Deepwake** — water and marsh machines who accept ecological change; wise
  about adaptation but reluctant to build anything permanent.
- **Graftwrights** — salvagers who liberate and recombine parts; preserve through
  reuse but may ignore provenance and consent.
- **Signal Choir** — relays and observatories listening to the waking Atlas;
  knowledgeable but tempted to surrender judgment to patterns.

No faction should be a reputation vending machine or purely correct. The player
should experience its virtue and failure through shared work and regional
consequences.

---

## 8. World and region grammar

A region is not a biome skin. Each region needs:

1. **material identity** — what the place is physically made from;
2. **work fantasy** — what useful or expressive work happens there;
3. **traversal question** — what movement demands from different bodies;
4. **material dependency** — what must flow, be maintained, or be produced;
5. **inhabitants and culture** — who has adapted to this place and what they value;
6. **beneficiary and consent** — who requested change, who benefits, and who pays;
7. **state transformation** — how calm/work becomes crisis, wonder, or danger;
8. **world memory** — what changes persist and alter later choices;
9. **social argument** — what belief about care, freedom, or progress is tested;
10. **distant promise** — what visible possibility calls the player onward.

### Illustrative campaign regions

#### Patchwork Vale — home and useful work

- Soil, timber, irrigation, barns, patchwork repairs.
- Cultivate, tow, clear, rescue, rebuild.
- Mud, slopes, waterways, crop density, fragile bridges.
- Tests whether service to a place is chosen purpose or inherited obligation.
- Remains emotionally relevant after the workshop begins traveling.

#### Sunken Flats — adaptation and contested restoration

- Reeds, salt, silt, oxidized steel, drowned roads.
- Survey, skim, ferry, dredge, recover, pump.
- Changes in water level and channel shape alter ecology and access.
- Tests whether restoring the old road is better than accepting a new wet world.

#### Pocket Metropolis — consequence at another scale

- Wood grain, fabric, plastic, circuitry, vents, household mechanisms.
- Courier work, stealth, miniature construction, salvage, precision movement.
- Must be fully real, not comic relief; “small” lives and places still matter.
- Reveals that the Atlas network repeats across scales.

#### Ironwood Pass — common infrastructure and unequal cost

- Rock, snow, rail, cable, trestles, industrial remnants.
- Haul, climb, winch, grade, maintain, convoy.
- Tests who pays to build and preserve a road everyone uses.
- Can reveal or provide the carrier that becomes the mobile workshop.

#### Glasswind Expanse — following versus taming energy

- Salt glass, turbines, charged dust, mirrored wreckage.
- Sail, generate, race, orient, cool, shield.
- Temporary storm routes make speed a form of cartography.
- Tests whether unpredictable systems should be domesticated or followed.

#### Crownworks — collective aspiration

- Launch gantries, fuel farms, vertical rail, ceramic shielding, cloud.
- Supply, assemble, balance, launch, recover.
- Ground logistics become ascent; every earlier decision affects mass, fuel,
  resilience, and who gets carried forward.
- Tests whether progress means leaving the world or connecting it.

These are possibility examples, not a committed content list.

---

## 9. Activity and genre grammar

Activities should be **work, play, and crisis embedded in place**, not isolated
mode kiosks.

The reusable design unit remains:

\[
\text{rig verb} + \text{world condition} + \text{tradeoff}
\rightarrow \text{persistent consequence}
\]

But the whole-game layer adds purpose:

\[
\text{physical consequence} + \text{someone or somewhere that cares}
\rightarrow \text{meaningful story}
\]

### Activity families and their emotional jobs

| Activity               | Primary pleasure                 | Meaning in the larger game                          |
| ---------------------- | -------------------------------- | --------------------------------------------------- |
| Cultivation/ecology    | rhythm, planning, transformation | sustain places and reveal ecological tradeoffs      |
| Hauling/logistics      | route judgment, load management  | connect communities and make promises physical      |
| Rescue/recovery        | improvisation, responsibility    | turn failure and vulnerability into stories         |
| Construction           | authorship, problem-solving      | create durable shared infrastructure                |
| Racing/courier work    | expression, flow, mastery        | map unstable routes and move urgent knowledge       |
| Exploration/survey     | curiosity, navigation            | make the unknown legible without conquering it      |
| Salvage/repair         | diagnosis, care, discovery       | preserve history and create machine relationships   |
| Defense/protection     | pressure, preparation, sacrifice | protect consequences the player already values      |
| Stealth/signature play | restraint, tension, reading      | make power, noise, light, and visibility meaningful |
| Flight/spaceflight     | awe, precision, aspiration       | extend connection without invalidating ground work  |

### Transformation rules

A genre shift is valid only if:

1. the place remains recognizable;
2. established rig verbs gain new meaning;
3. player competence carries through;
4. the transformation has a diegetic cause;
5. consequences survive its end;
6. failure supports recovery or continuation;
7. the emotional shift is paced and previewed;
8. it deepens the game's purpose rather than advertising another genre.

Night should not always mean combat. Dangerous states can center on flood,
evacuation, navigation, stealth, containment, structural collapse, fragile
cargo, machine recall, or rescuing something unable to move itself.

---

## 10. Progression: from possession to legacy

ADR-0018's Journey/Mastery/Insight spine remains an accepted project decision.
It defines three interlocking, differently owned forms of progression—not one
linear hierarchy. The whole-game design adds **derived states**, not more XP
ladders.

### Recommended progression hierarchy

```text
ACCEPTED INTERLOCKING PROGRESSION (ADR-0018)
├─ Rig Journey: this machine becomes dependable, expressive, and storied
├─ Verb Mastery: this rig becomes stronger and more capable within its verbs
└─ Insight: the player reveals knowledge, categories, and possibilities

PROPOSED DERIVED WHOLE-GAME STATES
├─ Fleet capability: roster + relationships + loadouts enable operations
├─ Regional legacy: remembered changes create new opportunities and costs
└─ Social/creative expression: routes, builds, contracts, stories, and help
```

Fleet capability is deliberately not a fourth XP bar. It is an explainable
result of which machines trust the player, what each can do, how they are
configured, and which relationships or routes have been established. Regional
legacy is world state, not completion percentage.

### Long-term refinement to test

The accepted situation-hash mastery model risks becoming opaque XP. A stronger
player-facing form may be **named mastery proofs**: a legible portfolio of deeds
such as recovering a moving load from floodwater, towing safely through unstable
ground, or completing a survey under limited visibility.

Ambient use can still build familiarity. Major ranks should answer “what has
this rig proven?” rather than “how full is this hidden counter?”

This does not overturn ADR-0018 here. It records a revisit hypothesis against
the ADR's own trigger: mastery becomes gameable, opaque, or grind-inducing.
Likewise, **Insight** remains the accepted name. Presenting it through specific
atlas discoveries rather than a prominent numeric total is a UI and experience
hypothesis, not a rename of the canonical progression state.

### Vertical power boundary

In-domain growth should improve:

- dependability;
- control under difficult conditions;
- technique and recovery options;
- tuning range;
- capacity for more ambitious problems.

It should not:

- trivialize earlier places;
- make one rig universally best;
- force stat-scaled jobs or enemies;
- make a new machine feel like abandoning progress;
- replace route judgment and physical skill.

### Acquisition

A rig should join the player's story through discovery, rescue, inheritance,
trust, restoration, or a shared deed—not a shop catalog or random rarity pull.

Before ownership, a machine may be:

- encountered as a place-bound character;
- borrowed for a specific need;
- assisted repeatedly;
- rescued or reconstructed;
- convinced to travel;
- entrusted by a community.

The player should remember why each important machine joined the fleet.

### Retirement without deletion

A beloved rig can remain meaningful when no longer in the active convoy:

- stationed at a landmark or community;
- integrated into the workshop;
- entrusted as a route guardian;
- used as a mentor/loaner machine;
- preserved with its stories and parts;
- inherited into another machine through a specific component.

Retirement can be one of the game's most emotional forms of progression.

---

## 11. Economy, care, failure, and stakes

### Economy serves decisions, not retention pressure

Keep a small, legible grammar:

- **Scrap** — ordinary repair and fabrication liquidity;
- **Parts** — concrete functional objects with provenance and tradeoffs;
- **Favor** — relationship state and permission, never a spendable token;
- **Insight** — accepted non-spendable progression, presented through specific
  discoveries and understanding rather than only “Insight: 620.”

Every major reward should deepen attachment, expand possibility, preserve a
story, or enable expression. If it does none of those, it is progression noise.

### Care is choice, not tax

Good care asks:

- preserve an unreliable original part or replace it with dependable standard
  hardware?
- accept a visible repair style from a community?
- stop to cool or push through and risk a new quirk?
- donate a storied component to save another rig?
- configure for quiet operation, heavy output, resilience, or repairability?

Bad care is repeated refueling, automatic decay, repair-all clicking, inventory
chores, or punishment for experimenting.

### Failure creates the next story

Failure should usually create:

- a rescue operation;
- an altered or blocked route;
- lost or damaged cargo with social consequences;
- a machine quirk or visible scar;
- a favor owed;
- an ecological change;
- an alternate objective;
- a hard choice about what can still be saved.

If reloading is consistently more attractive than continuing, the failure
system has failed.

### Persistence never punishes real-world absence

Real-world absence must never damage a save. Time advances through play,
explicit departure, or accepted commitments. “Neglect” means a visible
opportunity cost between competing needs—not an offline timer. Consequential
changes are previewed and bounded; severe loss requires explicit risk-taking or
creates a recoverable follow-up story.

### Escalating stakes

- **Personal:** Will this machine remain recognizable through restoration?
- **Relational:** Who depends on the player's promise, and what happens if it
  is broken?
- **Local:** Which routes, habitats, livelihoods, and customs survive?
- **Political:** Who controls shared infrastructure, standards, and repair?
- **World-scale:** Can dependable connection coexist with chosen difference?

World-ending danger should never make the local field or first machine feel
irrelevant. The finale should depend on verbs, places, and relationships earned
throughout the journey.

---

## 12. Narrative delivery and mystery

Narrative should be carried through play before exposition:

- a route that bends toward an obsolete destination;
- a machine refusing a replacement part;
- a community's repair style visible on the fleet;
- radio fragments that change when parts are exchanged;
- a field or canal reacting to earlier intervention;
- a recalled rig abandoning a place that needs it;
- workshop objects and parked machines preserving campaign history;
- recurring inhabitants who recognize outcomes, not just quest flags.

Every major revelation should change a physical rule, destination,
relationship, or decision. Lore that exists only to be read should be rare.

### Mystery layers

1. What is the signal: protocol, emergency system, accumulated memory, old
   authority, or emerging distributed person?
2. Why do repaired/hybridized rigs resist it: mixed provenance, conflicting
   obligations, player-authored history, or chosen identity?
3. What happened to the makers, and does the answer matter more than the world
   that exists now?
4. Is the Atlas wrong, or is central coordination solving real disasters at an
   unacceptable cost?

The player should not be a chosen one by hidden ancestry. Their fleet resists
because of what happened during play.

---

## 13. Single-player, social play, and creation

### Single-player is the complete foundation

The world, relationships, fleet, and campaign must feel whole alone. Social
systems may deepen stories; they must not repair an empty solo game.

### Asynchronous social first

Strong early forms include:

- shareable run records and route ghosts;
- seed links and private challenges;
- machine/build cards that include provenance and stories;
- photos with readable world and rig history;
- lending a rig as a ghost/helper without transferring ownership;
- messages or traces attached to difficult routes;
- multiple style categories rather than one global fastest leaderboard.

### Selective co-op: a working convoy

The best co-op fantasy is not identical rigs multiplying damage. It is
complementary work:

- scout/surveyor;
- hauler;
- recovery specialist;
- builder/stabilizer;
- agile courier;
- water, air, or heavy support.

Jobs should become richer through communication and interdependence, not merely
gain more health or cargo. No role should become repetitive support labor.

World-changing decisions require explicit ownership and consent. A guest should
not be able to overwrite a host's remembered place.

### Creation grows from game literacy

The creator ladder should be:

1. save and share a build;
2. remix an eligible build with visible ancestry;
3. create a route or checkpoint contract;
4. compose an operation from validated verbs, constraints, and world states;
5. create bounded encounters or region packs;
6. consider sandboxed scripting only after composition proves insufficient.

The first creator product should be a **Contract Kit**, not a general world
editor. Creation should emerge after players understand what makes the game
interesting.

---

## 14. Replayability and long-term evolution

Replay comes from reinterpretation:

- another rig makes a familiar place a different problem;
- a loadout creates a real tradeoff;
- weather, season, time, danger, or scale changes local meaning;
- prior world choices open and close routes;
- regional outcomes have alternatives;
- deterministic contracts support ghosts and mastery;
- co-op changes capability composition;
- player-created constraints reveal new strategies.

Replay should not depend on:

- randomized stat loot;
- exponential material requirements;
- daily chores or login streaks;
- expiring progression;
- health inflation;
- resetting the world every season;
- repeating identical jobs for favor or currency.

World evolution can be permanent without being a conventional live service.
New regions, rigs, crises, and creator grammars can expand the atlas while old
machines and places retain value.

---

## 15. Different play styles and accessibility

The game should support different motivations without flattening its identity:

- **Caretaker:** relationships, restoration, ecology, low time pressure.
- **Operator:** demanding handling, recovery, load, and terrain mastery.
- **Explorer:** routes, signals, mysteries, and unusual physical regimes.
- **Builder:** infrastructure, land shaping, and persistent world authorship.
- **Adventurer:** danger, crisis, improvisation, and high-stakes expeditions.
- **Social player:** convoy coordination, ghosts, and shared contracts.
- **Creator:** builds, routes, challenges, and bounded region composition.

Difficulty should be decomposable:

- route complexity;
- terrain instability;
- visibility and weather;
- time pressure;
- cargo fragility;
- information scarcity;
- damage persistence;
- recovery availability;
- threat intensity;
- control assistance.

Players should be able to seek demanding driving without punitive loss, or
meaningful consequences without high-speed execution. Assists should not reduce
campaign rewards or label a save as inferior.

---

## 16. Content scalability: depth before combinatorial explosion

The broad vision fails if every rig requires its own campaign and every region
must support every possible verb equally.

### Content should scale through layered reuse

One strong landmark supports:

1. discovery;
2. useful work;
3. a transformed state;
4. danger or crisis;
5. a later payoff, regret, or alternate use;
6. reinterpretation by another rig;
7. relationship or faction consequences.

Seven deep landmarks can create more game than seventy isolated activities.

### Region compatibility is selective

Every rig need not solve every situation. A region should contain:

- opportunities for its native capabilities;
- optional routes for surprising off-label uses;
- legitimate reasons to leave some rigs at the workshop;
- a few multi-rig operations;
- alternate help through borrowing, relationships, or infrastructure.

### New-rig gate

A new playable rig should do at least two of the following:

- create a new bodily/locomotion fantasy;
- add a distinct core verb;
- reinterpret an existing region;
- complement another machine in an operation;
- carry a strong relationship or discovery story;
- enable a new family of player-created contracts.

Different speed, durability, combat output, or silhouette alone is insufficient.

---

## 17. Hard tradeoffs and anti-visions

Rigs Unbound must not become:

- a generic open-world checklist with vehicle avatars;
- a collection game where rigs are rarity-colored stat packages;
- a survival-crafting chore loop where maintenance erodes affection;
- an anthology of disconnected farming, racing, defense, and space minigames;
- a combat game that solves every machine by adding a weapon;
- a procedural expanse with distance but no authored reason to care;
- an infrastructure simulator where communities are resource sinks;
- a technology ladder that treats old machines and places as obsolete;
- a live-service obligation engine;
- a creator platform with a thin game attached;
- a technical showcase whose clean architecture outruns evidence of desire.

### Irreversible decisions to avoid early

- publicly promising an unlimited many-genre anthology;
- universal power scaling;
- every-rig × every-verb mastery matrices;
- procedural activity generation as the primary dramatic structure;
- seamless cross-scale world simulation;
- mandatory real-time day/night pressure;
- universal combat capability;
- open trading or shared persistent economy;
- broad public UGC before a complete authored game proves the grammar;
- an active garage so large that rigs become inventory.

---

## 18. Recommended campaign arc

### Act I — The Last Working Yard

Restore one machine and one home landscape. Establish care, useful work,
relationships, world memory, danger, and the first buried signal.

### Act II — Roads Worth Reopening

Reconnect nearby communities. Encounter factions and machines with competing
ideas of purpose. Acquire rigs through relationships and shared deeds.

### Act III — The Moving Workshop

Transform the garage into a mobile home. Fleet composition, promises, cargo,
and route choice gain strategic meaning. Leaving a region becomes consequential.

### Act IV — Impossible Country

One evidence-proven impossible regime—water, altered scale, aerial routes,
folded infrastructure, or orbit—reveals the Atlas's true reach. Earlier verbs
are reinterpreted, not discarded. Other anomaly families remain candidates for
later expansions until they independently pass the genre-continuity gate.

### Act V — A World Reconnected

Fleet-scale operations decide the future of the network. The player chooses
between centralized restoration, distributed coordination, radical autonomy,
or an intentionally unfinished balance.

The finale should use the first game's verbs at larger consequence: cultivate,
route, haul, recover, stabilize, illuminate, survey, assemble, and launch. The
starter machine must matter because of its accumulated history, not nostalgia
alone.

### Minimum complete campaign

The base game does not need to ship every imagined regime. A complete campaign
requires:

- one deep home county;
- a small number of contrasting connected regions;
- the workshop's transformation into a mobile home;
- one impossible regime proven to preserve mastery and emotional continuity;
- one network decision that pays off accumulated relationships and world state.

Toy scale, flight, orbit, and other anomalies compete for that first slot. One
must pass Design Question 8 before another becomes part of the base campaign.
Tractor-to-space remains a long-term aspiration, not an automatic content list.

---

## 19. What is preserved, hypothesized, and still open?

### Explicitly accepted contracts

- ADR-0018 accepts three interlocking progression forms: Rig Journey, Verb
  Mastery with bounded in-domain power, and Insight.
- Other accepted technical/gameplay contracts continue to constrain future
  implementation, but no accepted ADR yet defines the complete game's fantasy,
  world premise, or campaign form.

### Inherited proposed north-star constraints

- Vehicles are playable characters rather than skins.
- Every important machine has distinct verbs, tradeoffs, feel, and history.
- The world is discovered spatially rather than reduced to a mode menu.
- Place, scale, time, weather, and danger can transform play.
- Machine, progression, and consequences persist through transformations.
- The same place visibly remembers player actions.
- Progression belongs to rigs, capabilities, knowledge, and relationships—not
  one universal player level.

These are repeatedly expressed in README, DESIGN, and the Exploration Map, but
the relevant map entries remain Proposed rather than accepted whole-game canon.

### Exploratory visual preference

- Patchwork Atlas is the strongest current visual baseline and has a direct
  operator preference signal, but DESIGN explicitly marks it exploratory rather
  than final accepted art direction.
- The prompt-ready visual exploration inventory now lives in
  [Vehicle Game Visual Exploration Living Catalog](../vehicle_game_visual_exploration_living_catalog.md),
  which collects scene directions, axes, and reusable prompt syntax without
  approving any direction for production by default.

### Recommended long-term thesis

- The whole game is a machine-keeper odyssey, not a rig showcase.
- A living home grows into a wandering fleet and mobile workshop.
- Places and inhabitants provide meaning; rigs provide bodies and strategies.
- The mature game is about connecting a fractured world without erasing its
  differences.
- Rare scale/genre transformations provide wonder inside a coherent journey.

### High-value hypotheses

- The Sleeping Atlas is the strongest world premise.
- The workshop should physically become mobile.
- The active fleet should remain small and relational.
- Named mastery proofs will be more legible than opaque situation-hash accrual.
- Failure-as-follow-up-story will create stronger attachment than reloads or
  repair taxes.
- Asynchronous traces and selective convoy co-op fit better than an MMO world.
- Bounded contract creation is the right first UGC surface.

### Open operator decisions

1. Is the primary emotional center **caretaking places**, **found-family fleet
   journey**, **mystery/discovery**, or **civilizational aspiration**? The
   recommendation orders them: care → fleet → mystery → civilization.
2. Should machines and inhabitants communicate mostly through mechanical
   behavior, through radio/dialogue, or through a richer mixed language?
3. Should the Sleeping Atlas premise become canon, remain one candidate, or be
   replaced by a less explicit world mythology?
4. How morally ambiguous should world restoration be? Is the player choosing
   between real tradeoffs or eventually discovering one correct answer?
5. Is the campaign primarily one authored journey with systemic variation, or
   a replayable world whose campaign is lighter?
6. Should the player directly operate one rig at a time, coordinate a fleet
   tactically, or eventually alternate between both?

No answer is silently accepted by this exploration.

---

## 20. Design-question roadmap

This is ordered by dependency of understanding, not by technology.

### Question 0 — Does the intended audience desire this fantasy?

Test the premise with players attracted to tactile machine mastery, repair,
adventurous exploration, and stewardship before optimizing broad-market
comprehension or retention.

**Evidence threshold:** the intended players express desire to inhabit, care
for, and solve meaningful problems through a flawed machine—not merely approval
of the concept art or technical novelty.

### Question 1 — Can one machine become emotionally owned?

Test whether players describe a rig through personality, remembered incidents,
and care—not only speed or utility.

**Evidence threshold:** fresh players voluntarily call it “my” machine, remember
a trait or scar, and express concern about what happens to it.

### Question 2 — Can useful work be intrinsically pleasurable?

Test whether moving, attaching, shaping, hauling, or recovering remains fun
without progression rewards.

**Evidence threshold:** players choose to repeat or improve an operation with
rewards removed.

### Question 3 — Can a place create motive?

Test whether a recognizable beneficiary, local need, and visible consequence
make work matter more than an abstract contract.

**Evidence threshold:** players can say who or what they helped and care about
the resulting place state without a completion score.

### Question 4 — Can one complication create an authored story?

Test recoverable failure: the first plan breaks, the player improvises, and the
result persists.

**Evidence threshold:** players retell the complication and prefer continuation
to reload.

### Question 5 — Does a second rig deepen the same world?

Test one contrasting machine against existing places and needs.

**Evidence threshold:** players willingly switch because the situation invites
another strategy, without feeling they abandoned investment in the first rig.
They describe the switch as inhabiting or operating a different body, not
selecting another unit from an inventory.

### Question 6 — Does the workshop feel like home?

Test preparation, display, repair, relationships, and memory as an inhabitable
emotional space—not merely a menu.

**Evidence threshold:** players notice changes in the workshop and use it to
tell the history of their fleet.

### Question 7 — Can leaving a region preserve attachment?

Test a short journey away and return with a persistent consequence.

**Evidence threshold:** players care what happened in their absence, recognize
their earlier decisions, and want to revisit rather than simply consume the
next map.

### Question 8 — Can genre transformation preserve mastery?

Test one state change—night, flood, storm, scale, or danger—in which familiar
verbs gain new meaning.

**Evidence threshold:** players describe the transformation as “the same game
under new pressure,” not an unrelated minigame.

### Question 9 — Can the fleet create cooperation rather than administration?

Test a two-rig operation first sequentially, then with two players or agents.

**Evidence threshold:** capability choice creates communication and memorable
interdependence without spreadsheet management.

### Question 10 — Does the world premise deepen play?

Introduce the Atlas conflict through a physical event, not exposition.

**Evidence threshold:** players understand the choice, feel its relevance to
their machine, and disagree meaningfully about the right outcome.

---

## 21. Proceed, prototype, pause, and kill conditions

### Proceed

Proceed toward the Living Atlas Odyssey if evidence shows:

- players attach to a machine;
- useful work is intrinsically satisfying;
- visible beneficiaries and consequences increase motivation;
- another rig changes strategy rather than merely stats;
- familiar verbs survive a state transformation;
- players want to know what lies beyond the home region.

### Prototype without commitment

- Sleeping Atlas story premise and communication style;
- home-to-mobile-workshop transformation;
- named mastery proofs versus situation-hash accrual;
- recoverable failure and rescue chains;
- one rare scale transition;
- asynchronous rig lending or ghost assistance;
- complementary two-rig operations;
- a bounded Contract Kit.

### Pause expansion

Pause new regions, rigs, and genres if:

- players describe the game as a physics demo or technology showcase;
- progression is more motivating than physical operation;
- the world contains tasks but no one or nothing worth helping;
- night/crisis feels like another game;
- new rigs require fully bespoke content to matter;
- fleet management becomes more prominent than operating machines;
- cosmic escalation makes the home and starter rig feel disposable.

### Kill or reformulate the broad thesis

After several materially different complete-loop prototypes and fresh-player
tests, reformulate if:

- players do not form machine attachment;
- world persistence is noticed but not valued;
- useful work is not enjoyable without rewards;
- players consistently prefer generic racing or combat over machine care and
  world consequence;
- switching rigs feels better than developing relationships with them;
- genre transformations repeatedly destroy mastery and coherence;
- the content cost of each rig grows like a separate game.

If that happens, preserve the proven pleasure and choose a more focused game:
vehicle mastery, machine-care expedition, physical land shaping, convoy rescue,
or tactical fleet defense. Do not keep the anthology merely because the
architecture can host it.

---

## 22. Six-hat and role-coverage synthesis

This exploration incorporated independent player-fantasy, world/narrative,
progression/longevity, and adversarial execution passes.

- **Facts / White:** current vision, accepted progression decision, existing
  activity grammar, and lack of external-player evidence were separated from
  recommendations.
- **Value / Yellow:** machine attachment, persistent place, fleet family,
  authored legacy, and cross-scale wonder are the strongest upside.
- **Risk / Black:** fantasy fragmentation, content multiplication, audience
  ambiguity, progression bureaucracy, and emotional emptiness are the primary
  failure modes.
- **Creative / Green:** Living County, Wandering Fleet, Impossible Atlas, and
  Civilization Journey were explored as competing forms before synthesis.
- **Feeling / Red:** warmth, competence, care, rugged pioneering, dangerous
  wonder, belonging, and tenderness after crisis define the desired emotional
  signature.
- **Direction / Blue:** the recommendation, design-question roadmap, evidence
  thresholds, and proceed/prototype/pause/kill conditions convert exploration
  into decisions without pretending hypotheses are accepted.

Role coverage included Strategist, Champion, Operator, Cartographer, Archivist,
Trickster, Skeptic, Future Self, Outsider/Customer Whisperer, and Executioner.
The Champion preserves the tractor-to-space ambition; the Executioner prevents
that ambition from becoming an incoherent product promise.

---

## Anything else?

Yes.

The long-term differentiator is not the number of rigs, genres, or worlds. It
is **biography made physical**:

- the machine's body records the journey;
- the workshop records the fleet's relationships;
- the landscape records the player's work;
- communities record who benefited and who paid;
- routes record how the world became connected;
- the ending records what kind of connection the player believed in.

If those layers are strong, a tractor can eventually reach orbit without the
game losing its soul. If they are weak, adding rockets, toy cities, combat, or
multiplayer will only make the absence of a game more expensive.

The next design conversation should therefore not ask “what mechanic should we
add?” It should ask:

> **Whose life changes because this machine crossed this place—and what will the
> player still be able to see, feel, and regret later?**

## Addendum (2026-07-27): the thesis now has a named composition stack

- The current integration-first trail gives this design thesis a concrete
  composition layer:
  [Contract Ledger Specification](../research/CONTRACT_LEDGER_SPEC_2026-07-27.md),
  [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md),
  and [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md).
- That layer does not replace the thesis. It gives the thesis a stable way to
  express “how an episode is assembled” without inventing a second mission or
  story authority.
- The wider long-term shape still stands: the home grows, the fleet gains
  biography, and the world remembers the consequences. The named composition
  stack is how those consequences become bounded, explainable episodes.
