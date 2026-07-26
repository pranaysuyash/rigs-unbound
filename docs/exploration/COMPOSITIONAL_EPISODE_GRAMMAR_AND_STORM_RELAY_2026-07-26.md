# Compositional Episode Grammar and Storm Relay

- Date: 2026-07-26
- Status: **canonical proposal; not an accepted roadmap or implementation
  commitment**
- Evidence tier: Tier 1 synthesis of operator-supplied AI feedback, current
  repository contracts, and implemented Field 02 evidence
- Owner / next reviewer: project owner
- Tracker: RU-0901 and RU-0902

## Source and authority

This proposal captures ideas that previously existed across chat, supplied AI
feedback, the exploration map, the reference atlas, and smaller mechanic
descriptions.

Supplying or discussing those ideas did not make every detail an operator
decision. This document makes the proposal durable so it can be accepted,
revised, rejected, deferred, or used to define bounded experiments without
being rediscovered or silently promoted.

Related current sources:

- [Vision Synthesis and Next Proof](VISION_SYNTHESIS_AND_NEXT_PROOF_2026-07-25.md)
- [Game Reference Atlas](../research/GAME_REFERENCE_ATLAS_2026-07-25.md)
- [Versioned Gameplay Content Composition](../decisions/ADR-0003-versioned-gameplay-content-composition.md)
- [Rig Capability Portability](../decisions/ADR-0006-rig-capability-portability.md)
- [Sequenced Capability and Authority Rollout](../decisions/ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md)
- [Solver-neutral Dynamics Evidence Program](../decisions/ADR-0023-solver-neutral-dynamics-evidence-program.md)

## Product relationship

Rigs Unbound is one persistent vehicle universe, not a container of unrelated
minigames.

A contract can temporarily make the world play like a race, farm, rescue,
defence, expedition, puzzle, survival problem, construction job, or something
new. The player's rig, its capabilities, history, condition, relationships, and
world consequences continue through that change.

The reusable content unit is therefore not “mode.” It is an episode assembled
from shared world truths and a rig-specific way of acting on them.

## Seven-part compositional episode grammar

```text
Rig identity
+ Place
+ Contract graph
+ Pressure curve
+ Rule modifier
+ Discovery chain
+ Persistent consequence
= Episode
```

### 1. Rig identity

The selected or continuing rig contributes:

- movement signature;
- dimensions, mass, momentum, balance, buoyancy, lift, or other mobility truth;
- capability and attachment vocabulary;
- sensory channels;
- condition, damage, scars, and repairs;
- fitted modules and tradeoffs;
- mastery and player relationship;
- social footprint;
- previous incidents and unfinished obligations.

The rig must materially change the solution. A vehicle name, mesh, or top-speed
variation is insufficient.

### 2. Place

Place supplies persistent physical and social context:

- terrain, topology, scale, weather, water, atmosphere, gravity, and light;
- routes, structures, resources, hazards, ecosystems, factions, and communities;
- remembered work, damage, recovery sites, wrecks, and altered access;
- authored landmarks and procedural variation under one world identity.

The environment participates mechanically. It is not scenery around a mission
marker.

### 3. Contract graph

A contract declares the immediate promise and its alternatives:

- objective;
- optional and mutually exclusive goals;
- eligibility expressed through capabilities rather than rig names;
- escalation and recovery branches;
- success, partial success, abandonment, and failure outcomes;
- scoring or evaluation vocabulary;
- what the player is allowed to improvise.

A graph is preferred to a single binary mission because a damaged cargo,
stranded rig, missed deadline, rescued stranger, or discovered secret can
meaningfully change what happens next.

### 4. Pressure curve

Pressure evolves during play and forces tradeoffs:

- rising water;
- approaching storm;
- dwindling fuel or battery;
- spreading fire;
- structural collapse;
- increasing heat or radiation;
- pursuing swarm or rival crew;
- unstable cargo;
- passenger fear;
- growing mechanical damage;
- closing routes or changing currents.

Pressure must have a readable cause, observable state, and recoverable failure
path. A hidden countdown that only produces punishment is weak.

### 5. Rule modifier

A modifier changes how known systems behave:

- shifting gravity;
- living or hostile cargo;
- damage granting risky movement options;
- redirected weather;
- scale changes;
- time-loop opponents;
- no reliable map;
- one failed system from the start;
- changing traction, visibility, or communication rules.

A modifier should recombine existing systems rather than introduce a parallel
minigame that bypasses rig, world, activity, and persistence contracts.

### 6. Discovery chain

Discovery rewards observation, experimentation, and cross-rig knowledge:

- radio ciphers;
- reflected or sonar-only geometry;
- tracks, vibration, heat, magnetic, light, or acoustic clues;
- mechanisms found by one rig and activated by another;
- secrets spanning time, scale, worlds, or vehicle generations;
- unusual cargo or wrecks revealing another story;
- route knowledge that changes a later contract.

Discoveries should remain meaningful even when shared through a guide. The
interest must come from the system relationship, not only secrecy.

### 7. Persistent consequence

Every meaningful episode should leave something behind:

- a scarred or improved rig;
- a repaired, opened, damaged, flooded, or blocked route;
- altered terrain or ecology;
- displaced or grateful communities;
- a stranded rig or persistent wreck;
- a new attachment, part, relationship, rumour, or obligation;
- cargo delivered, lost, changed, or escaped;
- an unfinished recovery contract;
- a clue that matters somewhere else;
- an incident in the rig's passport;
- a replayable or shareable story moment.

Persistence earns its cost when it changes a later decision.

## Four distinct design functions

These concepts must not be collapsed into a single “twist” field:

| Function    | Question                                        | Example                                                   |
| ----------- | ----------------------------------------------- | --------------------------------------------------------- |
| Pressure    | What changes during play and creates urgency?   | Water rises through the lower route                       |
| Modifier    | Which known rules behave differently this time? | Radio guidance becomes intermittent                       |
| Discovery   | What can observation or experimentation reveal? | Interference encodes an old relay path                    |
| Consequence | What remains true after the episode?            | The relay works, a route opens, or a rig remains stranded |

The same fact can participate in more than one function only when the transition
is explicit. A storm may begin as pressure, reveal a discovery through lightning
patterns, and leave a persistent flooded route.

## Mechanic lattice

The episode grammar composes through this lattice:

```text
shared primitive
→ rig-specific interpretation
→ contract use
→ pressure
→ emergent interaction
→ persistent consequence
```

Example:

```text
joint/attachment primitive
→ Torque tows and stabilises; Spark pushes and redirects; Drift ferries
→ restore a damaged relay
→ water rises while guidance fails
→ cargo shifts, a route disappears, and a rig becomes a temporary anchor
→ restored communications, damaged equipment, a new route, or recovery debt
```

This lattice prevents architecture and content from splitting into two
unrelated systems. Shared primitives produce different vehicle fantasies,
activities make those differences valuable, and persistence turns the result
into game history.

## Idea-mixer coherence contract

An idea mixer is an authoring and exploration instrument, not an automatic
content publisher.

A generated combination remains a proposal until it passes:

1. **Rig-materiality check:** the rig changes the solution, risk, or available
   information.
2. **Environment-participation check:** place changes mechanics, not only theme.
3. **Contract-readability check:** the player can state the immediate objective.
4. **Pressure-tradeoff check:** pressure forces at least one understandable
   sacrifice or route choice.
5. **Modifier-recombination check:** the modifier uses existing primitives or
   declares the new primitive it needs.
6. **Discovery-fairness check:** clues are observable through available
   capabilities and do not require arbitrary guessing.
7. **Consequence check:** success, failure, or abandonment changes durable state.
8. **Recovery check:** failure generates a playable recovery, changed contract,
   or honest terminal state.
9. **Authority check:** generated content cannot mutate durable value until
   deterministic validation and operator/content admission pass.
10. **Browser-budget check:** content fits declared loading, simulation,
    presentation, and accessibility envelopes.

The mixer should be able to explain why a combination failed admission. It must
not silently paper over an incoherent combination with prose.

## VehiclePassport proposal

`VehiclePassport` is the durable narrative and provenance view of an owned rig.
It does not replace canonical mutable rig state, run records, world memory, or
module inventory. It projects them into a stable history.

Proposed entries:

- rig identity, blueprint/version, acquisition and previous-owner provenance;
- journey phase and major restoration changes;
- fitted, removed, damaged, improvised, or recovered parts;
- scars, repairs, repainting, deformation, and persistent visual incidents;
- mastered verbs and distinctive handling adaptations;
- meaningful routes, worlds, sites, and traversal records;
- contracts completed, abandoned, failed, or converted into recovery work;
- people, factions, convoys, or communities helped or harmed;
- cargo incidents;
- discoveries and cross-rig secrets;
- close calls and automatically captured story moments;
- wreck, loss, rescue, rebuilding, or inheritance history.

Every passport entry needs:

- stable identity;
- source event/run record;
- timestamp or world-time relationship;
- originating world/site/contract;
- explanation visible to the player;
- migration behavior;
- retention and pruning policy;
- optional evidence artifact reference.

## Social footprint

World actors should query semantic footprint rather than rig names.

Possible footprint channels:

- emergency/service authority;
- civilian trust or fear;
- military threat;
- industrial disruption;
- noise, light, heat, vibration, wake, emissions, and physical size;
- ownership, faction markings, damage, cargo, and previous incidents;
- whether the rig historically helped, harmed, trespassed, or abandoned the
  current place.

Examples:

- an ambulance receives access but creates an expectation to rescue;
- a tractor is welcomed in an agricultural community but may damage dense urban
  space;
- a tank recovery vehicle alarms civilians but may be the only rig able to
  recover a collapsed bridge section;
- a quiet bicycle can enter spaces where a large machine would trigger defence;
- an old spacecraft may be recognized by a station that remembers a prior
  docking incident.

## Behavioural cargo

Cargo is an actor in the handling and contract system, not a generic crate.

Properties may include:

- fragile;
- liquid;
- explosive;
- perishable;
- magnetic;
- illegal;
- living;
- hostile;
- communicative;
- temperature- or pressure-sensitive;
- too large for ordinary routes;
- shifting mass or balance;
- contaminating;
- frightened;
- able to change the objective.

Cargo behavior must feed:

- handling and attachment load;
- route eligibility;
- pressure;
- damage and recovery;
- sound, camera, UI, and accessible feedback;
- contract branching;
- persistent consequence and passport history.

## Cross-rig mysteries

One mystery may require several rigs without turning rig switching into a key:

```text
one rig perceives
→ another reaches
→ another manipulates
→ another transports or survives the consequence
```

Examples:

- Drift detects a submerged signal; Spark reaches a narrow relay chamber; Torque
  extracts the recovered mechanism.
- A bicycle hears a low-power interior broadcast; a truck supplies power; an
  orbital tug later recognizes the signal pattern.
- A toy vehicle enters a full-size rig, repairs a hidden mechanism, and changes
  that rig's future capability.

Knowledge persists independently from physical access, while every physical
change remains owned by canonical world and rig state.

## Story capture and post-run explanation

The system may propose a story moment when semantic events create:

- a near collision or narrow route;
- a hard recovery;
- a chain reaction;
- an improvised landing;
- cargo almost lost;
- a tow cable or attachment near failure;
- one rig rescuing another;
- a newly opened route;
- an unexpected capability combination;
- a discovery chain step;
- a consequence that changes later play.

Automatic capture must remain bounded:

- capture triggers use semantic outcomes, not frame-by-frame heuristics alone;
- the player can opt out and delete local captures;
- screenshots/replays name their source run and relevant state versions;
- captures do not become proof of fun or correctness;
- generated captions are proposals derived from recorded facts;
- retention follows the repository/player evidence policy.

A post-run summary should answer:

1. What did you try?
2. What changed during the run?
3. What tradeoff mattered?
4. What did the rig suffer, learn, or become?
5. What changed in the world or relationships?
6. What new opportunity, obligation, recovery, or mystery now exists?

## Storm Relay proposal

### Premise

A communications station fails while a storm pushes water through a
farm-to-city fringe. The player must restore relay power and signal alignment
before the lower routes disappear.

The environment includes:

- Home Silo and the repaired field edge;
- a low flooded road;
- a narrow elevated service route;
- soft terrain and one unstable bank;
- a damaged generator;
- relay equipment divided across more than one physical object;
- intermittent radio guidance;
- one hidden signal source;
- persistent places for stranded rigs or equipment.

### Contract graph

```text
inspect relay failure
→ recover or transport power equipment
→ reach and align relay points
→ stabilise the installation
→ restore communications

branches:
- equipment damaged → repair or accept reduced range
- lower route flooded → use elevation, ferry, or wait and lose time
- rig stranded → finish with another rig or create recovery contract
- hidden signal decoded → open cross-rig discovery chain
- partial restoration → communications return only for nearby regions
```

### Rig-specific solutions

#### Torque — utility tractor

- tows the heavy generator;
- pushes through soft terrain;
- stabilises equipment with attachments;
- can reshape a bank or create a safer recovery path;
- is slow on the elevated route and vulnerable to deep water.

#### Spark — toy buggy

- reaches elevated relay points through jumps and narrow routes;
- rapidly carries light components;
- scouts route changes;
- risks cargo damage, hard landings, and loss of traction under load;
- cannot simply tow the heavy generator.

#### Drift — marsh skimmer

- crosses flooded shortcuts and soft ground;
- ferries light equipment over water;
- senses or follows signal changes across the flooded area;
- loses authority on steep banks;
- cannot substitute for stable heavy anchoring.

### Pressure curve

1. Storm arrives: visibility and radio clarity degrade.
2. Lower ground saturates: grip and route cost change.
3. Water crosses the low road.
4. Equipment becomes exposed to damage.
5. Remaining safe routes narrow.
6. A stranded rig or dropped component creates a recovery branch.

### Modifier

Radio interference replaces perfect waypoint guidance. Direction is inferred
from:

- signal strength;
- intermittent bearings;
- landmarks;
- rig-specific sensing;
- previously surveyed world knowledge.

The modifier changes navigation without creating a second hidden map truth.

### Discovery chain

Interference contains a repeated cipher that does not belong to the damaged
relay. Different positions and capabilities reveal different fragments. Restoring
the relay opens a rumour or world link rather than resolving the mystery
immediately.

### Persistent outcomes

Success may:

- restore regional communication;
- reveal new rumours or contracts;
- open a route or workshop service;
- add the incident to participating rig passports;
- retain repaired relay equipment and altered terrain;
- reveal the first cipher fragment.

Failure or abandonment may:

- leave equipment damaged or displaced;
- strand the selected rig;
- create a recovery contract;
- reduce future communication coverage;
- preserve the flooded route and storm damage;
- allow another actor to find the equipment first.

### What Storm Relay tests

- one contract completed differently by contrasting rigs;
- capability queries rather than rig-name branches;
- pressure, modifier, discovery, and consequence as separate functions;
- physical/semantic cargo and attachment ownership;
- navigation without perfect waypoints;
- recovery as continuation;
- cross-rig history;
- a place changing without becoming the product's privileged setting.

### What it does not decide

- the final physics engine;
- a universal movement controller;
- the permanent first biome;
- a required three-rig party structure;
- multiplayer;
- procedural generation strategy;
- whether Storm Relay is the next implementation after the first-rung and
  Farmfall gates.

## Broader frontier

The same grammar can support:

- toy vehicles operating mechanisms inside full-size rigs;
- bicycles using silence, interiors, balance, and human-scale infrastructure;
- excavators permanently authoring routes;
- fire engines redirecting water, smoke, electricity, and crowds;
- garbage trucks turning debris into fuel, construction material, armour, or
  contamination;
- submarines navigating through sonar and inferred geometry;
- orbital tugs solving logistics through momentum and docking;
- convoys functioning as homes, workshops, communities, and moving contracts;
- wrecks from failed expeditions persisting for later recovery;
- mysteries spanning worlds, scales, perspectives, and vehicle generations.

## Farm-to-city fringe position

The farm-to-city fringe is valuable because it places many systems close
together:

- soft and paved terrain;
- agriculture and logistics;
- dense and open navigation;
- water, weather, fire, construction, and community response;
- human-scale and industrial-scale spaces;
- opportunities for Torque, Spark, Drift, and later rigs.

It is not architecturally privileged. Orbital, underwater, miniature, fantasy,
procedural, and other environments remain equal product possibilities. The
fringe earns use only when it provides high information gain for the current
experiment.

## Admission and sequencing

This proposal does not override the current execution dependency:

```text
complete first-session earn/spend/benefit
→ complete and externally test one consequence-bearing loop
→ select the product question with the highest information gain
→ admit a bounded episode experiment
```

Storm Relay is a strong candidate when the project needs to test cross-rig
pressure, physical cargo, communication, and recovery. It should not displace
Farmfall or another active slice merely because its proposal is comprehensive.

## Decision questions

The operator may accept, revise, reject, or defer:

1. the seven-part episode grammar;
2. the four-function pressure/modifier/discovery/consequence taxonomy;
3. the mechanic lattice;
4. the idea-mixer coherence contract;
5. the VehiclePassport projection;
6. Storm Relay as a future evidence candidate;
7. the non-privileged role of the farm-to-city fringe.

No runtime consequence follows until the relevant decision and dependency gates
are accepted.

## Anything else?

Yes. The grammar is successful only if it makes a small number of shared systems
produce genuinely different vehicle stories. If it becomes a template that
generates interchangeable missions with elaborate prose, it has failed.
