# Vision Synthesis and Next Proof

Date: 2026-07-25
Status: **strong draft recommendation; requires operator acceptance and active-plan reconciliation, not a new ADR**
Evidence: Tier 1 current code/docs inspection, Tier 4 recorded browser evidence and current screenshots, plus in-progress simulated-playtest artifacts where explicitly noted

## Decision in one line

**Proceed with Farmfall, but make the first proof one field, one valuable crop,
one signature-hunting threat family, one plough that creates value by day and
shapes danger at night, one dusk commitment, and one dawn consequence; sequence
mastery, replay, and wider architecture behind proof that this loop is readable
and fun.**

This preserves the operator's “do all” direction. It changes dependency order,
not ambition.

## The vision, understood

Rigs Unbound is not primarily an open-world driving game. It is a **machine
character game** in which:

1. the vehicle is the persistent protagonist, not a disposable mount or skin;
2. each machine is a different verb set, with shape, handling, tools, damage,
   history, and mastery changing what the player can do;
3. the world is an opportunity field, not a mode menu;
4. place, time, scale, weather, and danger can transform the genre while the
   same machine, consequences, and player relationship persist;
5. the world remembers work—furrows, routes, damage, rescued things, altered
   sites, scars, and stories—and that memory later changes strategy;
6. progression should be visible on the machine and in what it can accomplish,
   not reduced to a universal player level.

The strongest emotional fantasy is:

> **I kept this improbable machine alive, taught it to do difficult things, and
> can read our shared history in both its body and the world.**

The strongest product distinction is not “many vehicle types” or “many
genres.” Those are breadth claims. The distinction is **continuity through
transformation**: the tractor that worked the field by day becomes the thing
that must protect that work at night, then carries the consequences into dawn
and eventually into stranger places.

## What the game must not become

- A generic open-world checklist with vehicles instead of human avatars.
- A vehicle-collection game where handling differences are mostly stat cards.
- A technology sandbox whose main reward is inspecting systems and telemetry.
- A survival-crafting chore loop in which maintenance erodes affection for the
  machine.
- A disconnected anthology of racing, farming, defense, and space minigames.
- A combat game that solves every vehicle fantasy by mounting a gun.
- A procedural expanse that offers distance without authored reasons to care.

These are kill conditions because each one erases the project's unique claim.

## Current reality

### Trustworthy today

- Three persistent rigs share one deterministic kernel and save record while
  expressing materially different ground, jump, and hover behavior.
- Capabilities, mobility adapters, terrain response, condition, attachments,
  modules, cargo, exploration, cameras, perception, audio, and world memory
  have real implementation paths rather than presentation-only promises.
- The relay is a complete approach/attach/transport/deliver loop.
- The public/browser evidence surface, save migrations, tests, and performance
  instrumentation are stronger than a normal exploration prototype.
- Patchwork Atlas gives the project a coherent visual thesis: a richly
  characterized repaired machine against a simplified, readable diorama
  world, with warm work states and cool danger states.

### Not trustworthy yet

- There is no evidence that the game is compelling after the novelty of
  driving three rigs wears off.
- The world contains opportunities and resources, but little need, opposition,
  relationship, or consequence. It behaves more like a capable proving ground
  than a place the player protects.
- No living ecology currently reacts to the machine.
- The proposed ADR-0002 day-work/night-danger thesis has not been made playable
  or formally accepted.
- Progression systems exist as parts and proposals, but no repeated experience
  has yet earned the complexity of three progression ladders.
- “Heavy,” “nervous,” and “skimming” remain designer claims until fresh players
  use comparable language without being taught it.

### First-time comprehension warning

Current screenshots and the in-progress casual/achiever captures show a real
presentation problem: the welcome card, workshop, horizon signals, field kit,
controls, resource counts, survey percentage, performance metrics, and world
markers compete simultaneously. The visible systems suggest depth, but the
player's immediate reason to act is weak. In some captures the workshop and
horizon panels overlap.

This matters more than cosmetic polish. Rigs Unbound promises discovery through
the world, yet the current UI explains several future systems before the world
creates a meaningful need for one of them.

## The next proof: Farmfall as a dramatic micro-loop

The current Farmfall plan has the right ingredients. Its risk is packaging too
many of them as one implementation unit. The smallest complete dramatic proof
is:

```diagram
┌──────────────────────────────────────────────────────────────┐
│ DAY: create value                                            │
│ Torque ploughs one field → sow one crop → see what can be lost│
└─────────────────────────────┬────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ DUSK: make a legible choice                                  │
│ Bank a smaller safe return, or commit the crop to night      │
└─────────────────────────────┬────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ NIGHT: the machine creates its own danger                    │
│ Engine/tool/light signature attracts hunters                 │
│ Plough furrows route/repel; loud power is useful but risky   │
└─────────────────────────────┬────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ DAWN: consequence persists                                   │
│ Saved/eaten crop + rig damage + visible field scars remain   │
└─────────────────────────────┬────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ CARE: improve this machine because of what happened          │
│ Repair or fit one meaningful countermeasure, then repeat     │
└──────────────────────────────────────────────────────────────┘
```

The key design relationship is:

\[
\text{useful machine power} \rightarrow \text{signature} \rightarrow
\text{attention} \rightarrow \text{consequence}
\]

That relationship is uniquely on-vision because the vehicle's strength and
weakness are the same embodied fact. It can later support stealth, wildlife,
convoys, rescue, defense, and alien ecologies without introducing a generic
aggro meter disconnected from the machine.

Signature alone is not enough to prove the game's thesis. For this slice,
Torque's plough must be a **dual-use verb**: it creates the thing worth
protecting by day, then its furrows, blade posture, or soil displacement must
route, slow, repel, or otherwise shape hunters at night. Otherwise the slice is
generic farming plus aggro plus vehicle collision.

The player-facing dusk transition must be an explicit interaction at the field
or workshop that commits the exposed crop to a premium night outcome. The `N`
phase key can remain a development shortcut, but it is not a diegetic decision.
Once the crop is committed, doing nothing must permit loss; before commitment,
banking the crop safely for a smaller return remains a legitimate strategy.

## Mechanics grammar — how Rigs Unbound becomes a game platform

The mechanic strategy should not be “add farming, then add racing, then add
combat.” That produces unrelated modes. The reusable unit is a **machine verb
meeting a world condition and leaving a consequence**:

\[
\text{rig verb} + \text{world condition} + \text{tradeoff}
\rightarrow \text{persistent consequence}
\]

Examples:

- `plough + soft soil + noise` → crop value, defensive furrows, attracted
  hunters;
- `tow + steep mud + load` → rescue, rut formation, hitch strain, route memory;
- `jump + broken road + fragile cargo` → shortcut, delivery risk, landing damage;
- `hover + flooded ground + slope` → access across water, reduced authority on
  banks, fan signature;
- `survey + darkness + exposed mast` → better knowledge, greater visibility to
  threats;
- `winch + unstable object + anchor quality` → recovery, repositioned world
  object, cable/rig strain.

This grammar lets activities become combinations of shared truths rather than
bespoke minigames.

### The five foundational mechanic families

#### 1. Locomotion as problem-solving

Movement should continuously ask “how does this machine cross this place?”
rather than only “how fast can it go?”

- Torque, traction, gearing, momentum, balance, buoyancy, lift, heat, and fuel
  define different movement fantasies.
- Surface, grade, water, wind, load, damage, and weather alter the answer.
- Better routes can be discovered or authored; the fastest geometric line need
  not be the fastest machine-specific line.
- Failure should usually create a recoverable situation—bogged, rolled, stalled,
  overheated, stranded—not an instant generic death screen.

Current evidence already supports ground and hover envelopes. The next useful
locomotion proof is not another speed profile; it is a situation where route,
load, and recovery produce different choices.

#### 2. Physical manipulation

The strongest vehicle verbs affect things outside the vehicle:

- attach / detach;
- tow / push / pull;
- lift / lower / stabilize;
- plough / cut / compact / dig;
- pump / spray / extinguish;
- carry / place / assemble;
- deploy / retract / anchor.

Every major attachment should alter four things together:

1. silhouette;
2. available verbs;
3. handling or resource cost;
4. world consequence.

An attachment that changes only a stat is weak. An attachment that changes only
appearance is cosmetic. The signature Rigs Unbound attachment changes what the
machine can physically make true.

#### 3. Sensing and signature

Machines both perceive and announce themselves.

- Sensing channels: headlights, survey mast, radar, radio, thermal, sonar,
  vibration, tracks, crop movement, sound direction.
- Signature channels: noise, light, heat, vibration, wake, smoke, radio emission,
  disturbed terrain.
- More information should often require exposure: brighter lights reveal a
  route but reveal the rig; an extended mast sees farther but becomes a target.
- Threats and wildlife should react to particular channels, not a universal
  hidden aggro number.

The player-facing display may summarize risk, but simulation and replay evidence
must preserve channel causes separately.

#### 4. Machine care and transformation

Care should deepen attachment without becoming maintenance busywork.

- Damage changes behavior and leaves a readable story.
- Field repair restores function imperfectly; workshop restoration changes the
  machine more deeply.
- Tuning redistributes tradeoffs instead of producing universal upgrades.
- Journey phases alter body, reliability, and available complexity.
- Mastery changes how effectively a specific rig performs a practiced verb.

Good damage creates a decision: finish the task while steering pulls, abandon
value to protect the machine, improvise a repair, or call another rig. Bad damage
is a red bar plus a repair tax.

#### 5. World memory and ecology

The world must remember more than collectibles:

- furrows alter movement or threat paths;
- repeated traffic compacts a trail into a faster route;
- mud ruts hold water or trap a later heavy load;
- felled vegetation changes visibility and habitat;
- repaired bridges and placed objects open routes;
- noise/light history changes what approaches a site;
- saved, neglected, or damaged locations enter different states.

Persistence earns its cost when yesterday's solution becomes today's terrain.
If a world mutation never affects a future choice, it is visual history rather
than gameplay history.

### Core tradeoff equations

These relationships should generate decisions across many activities:

| Benefit                  | Cost or exposure                                      | Player expression                    |
| ------------------------ | ----------------------------------------------------- | ------------------------------------ |
| More power               | More noise, heat, fuel use, traction loss             | Push now or preserve control         |
| More load                | Less speed, stability, clearance, stopping authority  | One risky trip or several safe trips |
| Larger attachment        | More capability, worse maneuverability and visibility | Specialize before entering a site    |
| More light/sensing       | Better information, greater detection                 | See and be seen                      |
| Faster completion        | More damage/signature/cargo risk                      | Efficiency versus care               |
| Permanent terrain change | Better route or defense, ecological side effects      | Shape the world deliberately         |
| Field repair             | Immediate recovery, imperfect long-term condition     | Continue or return home              |

These are more valuable than isolated content because each new rig, region, and
activity can reinterpret them.

### Activity recipes from shared mechanics

| Activity           | Shared mechanic composition                            | Persistent result                                     |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| Farmfall           | plough + sow + signature + defend + dawn               | crop state, furrows, rig scars, mastery evidence      |
| Rescue             | survey + route choice + winch/tow + stabilization      | rescued machine, changed relationship, ruts/damage    |
| Construction       | haul + lift + place + anchor                           | bridge, shelter, tower, or route becomes real         |
| Time trial         | surface reading + route authorship + risk              | ghost/replay, worn route, machine record              |
| Salvage extraction | sensing + quiet approach + attachment + escape load    | recovered part, awakened hazard, altered wreck        |
| Fleet defense      | park rigs + deploy modules + manage signatures         | site survives, machines damaged, formation remembered |
| Convoy             | load distribution + escort + repair + route adaptation | cargo/characters arrive, route knowledge improves     |
| Flood response     | hover/ford + pump/tow + changing water                 | drained area, rescued cargo, transformed access       |
| Launch operation   | haul + assemble + fuel + protect + ignite              | new scale/region becomes reachable                    |

This is the path from tractor to rocket without becoming a menu anthology: each
new genre is a denser composition of verbs the world already understands.

### Rig-specific mechanical identities

The current rigs should not merely have different numbers:

| Rig    | Dominant fantasy          | Excels through                                         | Meaningful weakness                                         |
| ------ | ------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| Torque | dependable working power  | low-speed traction, ploughing, stable heavy tow        | loud, slow, poor escape, large turning needs                |
| Spark  | improvised momentum       | acceleration, jumping, route shortcuts, rapid response | unstable load, fragile landings, poor mud/water authority   |
| Drift  | access where ground fails | water crossing, broad survey, low-friction traversal   | fan/wake signature, slope instability, weak precise pushing |

Future candidates should enter only when they introduce a new control truth:

- bicycle: balance, pedaling cadence, near-silent signature;
- tracked rig: pivot steering, obstacle climbing, heavy terrain damage;
- walker: foot placement and stability on broken ground;
- aircraft: lift, stall, wind, landing commitment;
- rocket: mass ratio, heat, staging, irreversible trajectory.

A fourth rig that only occupies a point between Torque and Spark should be
rejected.

### Combat without defaulting to guns

Threat interaction should first use machine verbs:

- route with furrows, barriers, light, sound, or decoys;
- repel through mass, wake, spray, exhaust, or tool posture;
- pin, tow, trap, bury, flood, illuminate, or isolate;
- protect vulnerable value by moving it or changing terrain;
- escape through a route another locomotion family cannot use.

Weapons can exist later, but they should be physical modules with weight,
signature, ammunition, recoil, mounting, and opportunity costs—not a universal
combat layer pasted onto every rig.

### Failure, recovery, and consequence

The default failure ladder should be:

1. warning and readable loss of margin;
2. degraded control or damaged capability;
3. recoverable situation requiring a different verb or rig;
4. lost value or changed world state;
5. only then, full run failure when the activity truly needs it.

This makes failure produce stories and future jobs. A bogged tractor can create
a rescue contract; a broken bridge can create a construction objective; a lost
crop can change the next restoration choice.

### Mechanics acceptance filter

Before implementing a proposed mechanic, require clear answers to all seven:

1. What action does the player perform?
2. What physical or systemic truth changes?
3. How is the result perceived without reading a meter?
4. What tradeoff prevents a dominant answer?
5. What future decision remembers the result?
6. How can another rig solve it differently?
7. Which existing shared contract owns it?

Reject or redesign mechanics that are presentation-only, universally optimal,
rig-name-gated, forgotten after the activity, or dependent on a bespoke mode
state that bypasses the canonical kernel.

### Mechanics prototype order

1. **Farmfall dual-use plough + signature ecology** — proves one verb can
   transform across genre states.
2. **Articulated rescue** — tow + winch/lift + unstable load + route choice;
   proves multi-verb physical composition and recoverable failure.
3. **Self-authored routes** — compaction/ruts/drainage affect later traversal;
   proves world memory is strategic rather than decorative.
4. **Fleet-as-tools defense** — parked rigs and deployed modules influence a
   site; proves the roster matters without direct control of every rig.
5. **Time trial + trustworthy ghost** — proves replay and route expression once
   a meaningful handling challenge exists.
6. **Scale/flight transition** — only after the above grammar survives; proves
   the platform can transform radically without losing continuity.

This is a priority order, not permission to build all six before evaluating the
first.

## Four gated implementation units

These are dependency/decision units, not calendar estimates.

### Unit 1 — Headless dramatic loop

Build only enough deterministic state to prove:

- one ploughed/sown/mature crop target;
- one signature whose noise, light, and tool contributions remain separately
  inspectable even when presented as a combined risk;
- one hunter behavior with seek, consume, repel, and dawn removal;
- one plough interaction that changes both day creation and night defense;
- one world interaction that commits the crop to night risk/reward;
- one persistent dawn consequence;
- deterministic save/load and bounded state.

Do **not** add mastery ranks, a broad crop catalog, multiple threat archetypes,
a wave director, loot tables, or journey UI here. The gate is whether the
choice has meaningful outcomes under deterministic tests, not whether the
future progression model is fully represented.

### Unit 2 — Perception and comprehension

Make the loop readable through the existing shared perception chain:

- signature must be inferable from engine sound, lights, tool posture, and one
  restrained field-kit indicator;
- a hunter must telegraph what it senses and where it intends to go;
- the threatened crop must be visible as value before it is endangered;
- dawn must show the changed field and machine before showing a score panel;
- hide development metrics in normal player presentation;
- make the welcome surface teach one immediate action, then reveal systems only
  when their need appears;
- fix panel collision before adding mastery or dawn UI.

Gate: a fresh player can answer “what did the threat notice?”, “what could I
lose?”, and “what will I try differently next time?” without reading a design
explanation.

Run the first Farmfall proof as **Torque-only in presentation**. Preserve
capability-driven implementation internally, but do not let immediate roster
switching or three-rig novelty mask whether one machine sustains the full loop.
The standing three-rig player-language test remains a separate evaluation.

### Unit 3 — Progression earned by the loop

Only after the dramatic loop works, connect ADR-0018:

- record plough/tow/defense situations as mastery evidence;
- let one rank produce one visibly bounded in-verb improvement;
- let one deed + investment advance one Journey transition;
- make the machine's body communicate the change before adding a progression
  dashboard;
- explain why a situation counted or stopped counting so anti-grind behavior
  feels fair rather than arbitrary.

Gate: players describe the machine as having learned or become better at a
specific job, not merely that a bar increased.

### Unit 4 — Replay and wider proof

Use the now-meaningful run for replay/ghost evidence:

- replay the same dusk decision and report divergence;
- compare a louder/faster and quieter/slower strategy;
- expose one shareable dawn story, not raw diagnostic telemetry;
- run the alternate-engine probe only against a concrete failure or budget
  question exposed by this slice.

The engine bakeoff remains valid work, but it is not on the fun-critical path.
Without a disputed runtime question, it compares implementations rather than
protecting a player outcome.

## Cross-role exploration

### Champion

Farmfall is the strongest version of the thesis because one familiar machine
expresses work, risk, defense, damage, care, and progression without a genre
menu. It turns the project's current strengths—terrain memory, phase changes,
perception, persistent rigs, modules—into one story rather than adding another
parallel system.

### Operator

The critical path is Unit 1 → Unit 2 → fresh-player gate. Mastery and replay can
follow through stable contracts, but neither should delay observing whether
players understand and desire a second night. Current parallel Physics Lab and
simulated-playtest work should remain isolated from this path.

### Cartographer

Signature ecology is a useful substrate because it connects existing engine
load, phase, lights, tools, audio, threats, crop value, and future wildlife.
The crop is not the platform; **sensed machine consequence** is the platform.
Future regions may interpret signature differently—heat in snow, vibration
underground, radiation in space—without replacing the cause/effect grammar.

### Archivist

The repository already contains enough contracts to implement the proof. The
next documentation should primarily record observed decisions and acceptance
evidence. New speculative contract documents should be created only when a
slice exposes a real unresolved boundary.

### Trickster

The surprising alternative is to make night **opt-in exposure**, not a forced
wave. The player can bank a smaller guaranteed harvest before dusk, or commit
the crop to a larger/rarer night return. This keeps safety valid while ensuring
that passivity after commitment has a real cost. Chosen exposure is more
interesting than an automatic timer.

### Skeptic / Executioner

The kill case is strong: farming plus night enemies is common, and a tractor
with enemies can become a shallow mash-up. Stop or redesign if the optimal
strategy is always full throttle, if threats merely chase the nearest player,
if defense becomes generic collision combat, or if dawn is only a score card.
The loop survives only if machine-specific signature tradeoffs and persistent
world consequences create different stories.

### Future Self

If successful, this slice becomes the reusable grammar for later genre shifts:
create value, expose it through a machine-specific tradeoff, face an ecology,
carry consequences, adapt the rig. If unsuccessful, the project learns early
that continuity and capability alone are not sufficient, before multiplying
worlds and content.

### Outsider / Customer Whisperer

The public pitch should be experiential, not architectural:

> “By day your old machine builds the farm. At night its noise and lights tell
> hungry things where you are. Every repair, scar, and field remembers what you
> chose.”

If a fresh player does not retell something close to that after one cycle, the
slice has not communicated the product.

## Six-hat coverage

- **White / facts:** the kernel, rigs, relay, terrain memory, persistence, and
  public runtime exist; living ecology, stakes, and the accepted day/night loop
  do not.
- **Yellow / value:** Farmfall composes existing investments into the clearest
  demonstration of vehicle continuity through genre change.
- **Black / risk:** scope bundling, UI overload, generic enemies, passive
  optimal play, and progression arriving before desire can all invalidate the
  proof.
- **Green / alternatives:** sensed signatures can vary by region; chosen
  exposure can replace forced waves; dawn stories can replace score-first
  summaries.
- **Red / taste:** the repaired tractor protecting work it created is emotionally
  specific. Another abstract system or fourth rig is not.
- **Blue / next action:** sequence Units 1–4, stop at each evidence gate, and let
  observed player language decide expansion.

## Ranked next actions

1. **Implement Unit 1 as the next game-critical path.** Highest risk-adjusted
   value; it tests the core fantasy rather than another substrate.
2. **Run Unit 2 before broadening content.** The existing first-load UI already
   shows comprehension debt; adding more meters now will make it worse.
3. **Complete three fresh-player observations on the same script.** Simulated
   agents can find interface defects, but they cannot validate human delight,
   tension, or attachment. Record exact player words and unprompted actions.
4. **Attach ADR-0018 to observed deeds only after one night is fun.** Keep the
   accepted spine, but let real play determine event weights and rewards.
5. **Put replay/ghost after a meaningful run exists.** A replay of a story is a
   product feature; a replay of a proving ground is architecture evidence.
6. **Keep the engine probe bounded and parallel.** Promote an alternate backend
   only if it wins against a named Farmfall requirement or measured budget.
7. **Pause fourth-rig and second-region work.** Neither answers the current
   uncertainty; both multiply content and tuning cost.

## Additional next suggestions from current evidence

These recommendations incorporate the current automated casual/achiever/explorer
artifacts. Those artifacts are useful Tier 1–3 interface and state evidence, not
human player evidence: automation used internal state text, repeated scripted
inputs, and browser storage that may contain prior progress.

### 1. Establish a clean first-player evidence protocol

Before interpreting another simulated or human session:

- use a fresh browser context with no local storage, cache, or service-worker
  state;
- record the exact build hash, save schema, seed, viewport, input device, and
  sound state;
- prevent the observer/player from reading `render_game_to_text()` or debug
  telemetry during the comprehension portion;
- do not script destinations using hidden coordinates;
- record first action, first confusion, first voluntary goal, first recovery,
  and whether the player continues after the first reward;
- keep a separate instrumented replay for diagnosis after the blind session.

The current automation found useful defects, but it cannot be called a
fresh-eyes playtest while internal state and persisted progress guide it.

### 2. Replace the “everything at once” opening with one authored first job

The first minute should not expose the complete platform. Start with a physical
need in view:

> The workshop needs one short furrow before dusk. Lower the plough, make the
> line, and return.

Teach drive → tool → visible world change → return/reward. Then reveal salvage,
rig switching, views, map, distant signals, and modules as the world creates a
reason for each. The horizon can still promise breadth, but it should not compete
with the current verb.

This is not a traditional tutorial corridor. It is the first small job in the
same persistent world, and its furrow becomes part of the first night defense.

### 3. Make opportunity guidance singular and recoverable

The current interface exposes many horizon signals while automation still
struggled to orient toward salvage and return home. Use a guidance stack:

1. one **current intention** chosen by the player or immediate context;
2. one bearing/distance cue with a visible world referent;
3. terrain-aware warning when the current rig is unlikely to reach it;
4. a recovery suggestion after repeated stalled or circling behavior;
5. all other opportunities remain discoverable but visually secondary.

Guidance should name the verb and consequence—“soft field: plough a defensive
line”—rather than only a landmark noun or quest marker.

### 4. Reconcile player-facing control language

The current evidence exposes a contract mismatch: project docs describe `N` as
cycling day/gloam/night, while extracted player-facing text labels it `N light`.
Farmfall also proposes using the same phase change as a deliberate decision.

Separate these concepts:

- **lights** are a normal machine action with signature consequences;
- **commit to dusk/night** is a world interaction with explicit stakes;
- **cycle phase** remains a development/testing command, not normal play.

Do this before signature ecology, otherwise players cannot learn whether their
light choice or a global phase toggle caused danger.

### 5. Make the first threat visually explain its sensor

Do not begin with a general enemy that happens to consume a signature scalar.
Its body and behavior should expose the sensing rule:

- oversized listening structures pivot toward engine pulses;
- light-sensitive surfaces flare or orient toward headlights;
- uncertain detection produces searching behavior before pursuit;
- loss of signal causes investigation at the last sensed location, not perfect
  tracking;
- furrows, barriers, and terrain visibly interrupt or redirect approach.

The player should learn the ecology by watching the creature, not by reading an
aggro meter.

### 6. End each cycle with a world-first “dawn postcard”

Before presenting scores, frame the changed machine and field:

- surviving crop and visible losses;
- furrows that helped or failed;
- fresh damage, mud, bent attachment, or depleted light;
- one concise causal sentence: “Three listeners followed your work lights; the
  west furrow diverted two.”

Store this as a bounded story/evidence object that can later seed journey memory,
sharing, and replay. It should be derived from authoritative events, not generated
flavor claiming things the simulation did not record.

### 7. Make authored player expression part of Farmfall

Do not pre-place the one correct defensive field layout. Let players decide:

- where furrows run;
- where the valuable crop remains exposed;
- whether the tractor faces escape, interception, or continued work;
- where lights or a beacon create attraction;
- which safe return they bank before night.

The proof is stronger if two players reach dawn with visibly different fields
and stories from the same seed.

### 8. Turn failure into the next activity

After Farmfall, the strongest second slice is not a standalone rescue mission.
Let a Farmfall consequence produce it:

- Torque bogs or breaks while protecting the field;
- the player must bring Drift across water or Spark along a fast dry route;
- recover with tow/winch/lift while preserving the damaged field state;
- the rescued rig retains the scar and the route retains the recovery marks.

This makes multi-rig play a consequence of caring for one machine, not a roster
selection feature looking for content.

### 9. Add a documentation/content budget

The repository now has many overlapping contracts and concurrent plans. Before
creating another speculative contract, require one of:

- a newly observed player behavior;
- a concrete implementation boundary not owned by an existing ADR/contract;
- a failed acceptance gate that needs a recorded decision;
- a reusable content grammar proven by at least one runnable example.

Otherwise append evidence to the existing plan, ADR update log, exploration map,
or acceptance report. Documentation should preserve learning, not become a
parallel game made of plans.

## 10. WebGPU as a vision-lane, not a feature lane

Treat graphics modernization as a long-term capability that serves the same
player contract rather than adding a separate “tech mode.” This lane is
acceptable only if it increases the quality of the same causal loop the vision
already values: one machine, one consequential activity, one remembered world.
It is grounded in the current `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md` findings.

### 10.1 Use cases that align with the thesis

1. **Backend portability and reliability**
   - Run the same simulation scene on `WebGLRenderer` and `WebGPURenderer` from
     the same feature contract.
   - Keep context-loss and restart behavior explicit instead of boot-time fatal.
   - Make backend and quality tier part of the operational profile evidence.

2. **Night and danger readability as gameplay infrastructure**
   - Preserve the fog/sky and contrast contract while improving throughput.
   - Increase horizon legibility where it directly affects signature reading,
     approach timing, and recovery choices.

3. **World and consequence scale**
   - Enable larger authored and mutated worlds (more terrain marks, routes,
     obstacles, and world-memory states) without forcing content simplification.
   - Keep memory persistence coherent by never changing meaning when changing
     renderer.

4. **Measured resilience on heterogeneous devices**
   - Track backend capability in one recorded contract and make downgrade
     behavior boringly reliable.
   - Prioritize recoverability over benchmark vanity.

5. **Future performance headroom reserve**
   - Keep CPU deterministic as the base of truth for simulation.
   - Allow compute migration only when it is gated by clear throughput
     evidence and does not harm replay/simulation determinism.

### 10.2 Near-term improvements to enter now

- Add explicit graphics-context recovery paths and restart guidance.
- Add boot progress and an action-ready readiness signal tied to first
  controllable intent, not merely first render.
- Normalize renderer stats under backend differences and keep them in the same
  profile stream.
- Record sourcemap and caching posture as product policy rather than one-off
  build tuning.

### 10.3 Roadmap by gate (ordered)

- **W1: reliability-first lane** (now)
  - context loss handling, restore path, and restart observability;
  - boot progress and input-ready semantics.
- **W2: compatibility probe lane** (post-Farmfall base acceptance)
  - `WebGPURenderer` probe path with backend recorded in profile snapshots;
  - night/fog contract revalidation before any default path changes.
- **W3: conditional expansion lane** (after sustained device-matrix evidence)
  - targeted compute experiments only where they unblock proven gameplay needs;
  - reject any change that improves frame metrics while reducing trust in cause
    and consequence.

The refusal criteria are equally important: do not authorize feature-specific
render experiments, shader rewrites, or compute migration until the current
proof loop itself is stable and observable.

### 10.4 Delivery evidence (as executed)

- **Use case 1 implemented:** explicit graphics-context recovery as a reliability
  contract (WebGL lost/restore listeners, renderer teardown/recreate path, and
  observable status transitions).
- **Use case 2 implemented:** action priority now keeps ambient salvage/plough
  pathways active at Home so non-survey rigs are not blocked by survey
  presentation.
- **Use case 3 implemented:** far-tier prop billboard writes include defensive checks so
  runtime rendering cannot dereference missing mesh state.
- **Long-term evidence update:** restart and context-loss status now flows through
  run snapshots and developer diagnostics, so resilience moves from implicit to
  explicit contract.
- **Use case 4 implemented:** `action-readiness` and core browser timing path is
  now visible in runtime contract (`src/game/performance.ts` and `src/main.ts`), with
  explicit `actionReady` checkpoints and `largestContentfulPaintMs`, `inputDelayMs`,
  `cumulativeLayoutShift`, and `longTask*` fields in the snapshot payload.

This keeps WebGPU inside the product’s long-term architecture: not an end in
itself, but a cleaner foundation for more persistent consequence, safer systems,
and better world-driven tension.

### 10.5 Use-case and improvement ledger (long-term execution, current state)

| Use case | Why it exists in this vision | Current status | Next best action |
|---|---|---|---|
| Reliable recovery across WebGL loss events | Keeps long sessions from collapsing on context churn and preserves simulation continuity | ✅ Implemented in entrypoint recovery path (`src/main.ts`) | Keep and extend to `WebGPU.device.lost` when the renderer branch opens |
| Boot readiness and action-readiness contract | Prevents misleading load telemetry and aligns readiness with player agency | ✅ Implemented (`firstActionReadyMs`, `actionReady` checkpoint, observers in `src/game/performance.ts`) | Close loop with W1 probe and keep INP proxy sample interpretation in acceptance proof |
| Backend capability portability | Avoids a second rendering stack and keeps one world contract for both paths | 🟡 Recorded gap: resilience is in `WebGL` while probe + migration is deferred | Land `W1` probe contract: detect/record backend capability and add a gated `WebGPU` branch |
| Night readability under performance mode changes | Preserves consequence legibility when visibility is most important | 🟡 Existing `WebGL` tone/fog contracts proven in `WebGPU` analysis | Re-validate fog/sky and signature contract before any default backend shift |
| Scaling authored consequence states | Supports larger world memory and route richness without semantic drift | 🟡 No renderer-path blocker; world-memory contracts are intact | Measure and gate world-size expansion against deterministic replay/actor budgets |

### 10.6 Anything else?

- No unresolved WebGPU blockers are inside the gameplay contract itself.
- The unresolved blockers are execution-policy and probe-lane items (W1/W2), so the next slice should stay in the rendering/performance lane until recoverability and metrics observability are complete.

## Pre-registered causal comparison

Before evaluating delight, run the same deterministic seed and crop state under
three strategies:

| Strategy               | Expected signature                          | Expected threat behavior                 | Expected outcome                           |
| ---------------------- | ------------------------------------------- | ---------------------------------------- | ------------------------------------------ |
| Loud / fast / lit      | High, with legible causes                   | Earlier acquisition and stronger pursuit | Fast work, highest exposure                |
| Quiet / slow / dark    | Low                                         | Delayed or lost acquisition              | Slower work, lower exposure                |
| Committed but inactive | Minimal rig signature; crop remains exposed | Crop-directed consumption still occurs   | Material loss; passivity does not dominate |

In each strategy, capture noise, light, tool contribution, hunter target changes,
crop outcome, rig damage, and whether plough-created terrain changed the result.

Fail the proof if:

- full throttle dominates without a meaningful cost;
- quiet play changes a meter but not hunter acquisition or outcomes;
- inactive play after commitment preserves the premium crop;
- ploughing affects daytime value but not nighttime decisions;
- threats act as nearest-player chasers regardless of sensed evidence.

## Proof protocol

For each fresh player, observe without explaining the systems:

1. What do they do in the first 30 seconds?
2. Do they create or recognize something valuable before dusk?
3. Can they predict that noise/light changes danger?
4. Do they change driving, lighting, or tool use because of that prediction?
5. At dawn, can they name one consequence caused by their choice?
6. Do they voluntarily start a second cycle?
7. How do they describe Torque without offered adjectives?
8. What story do they retell afterward?

Proceed to broader content when at least two of three fresh players:

- correctly explain the signature relationship without being taught;
- name a specific loss or save they caused;
- choose a different strategy for another night;
- describe the active rig with behavior words rather than only speed/appearance;
- voluntarily continue or ask what upgrade would help.

This two-of-three threshold is directional evidence, not broad validation.
Simulated agents count only for interface/debug findings; delight, tension,
attachment, and voluntary replay require human observation.

Prototype again if comprehension is present but desire is weak. Pause if players
need UI explanation to perceive cause and effect. Kill or fundamentally redesign
the loop if players understand it and still find the machine irrelevant to the
outcome.

## Documentation policy from here

- Keep this artifact as the vision/sequence rationale.
- The active `FARMFALL_SLICE_01_2026-07-25.md` currently packages mastery and
  journey presentation into the same completion boundary as the dramatic loop.
  This document recommends a different dependency order. If the operator
  accepts it, append that decision to the active plan and ADR-0002 after current
  parallel edits settle; until then, do not pretend both sequences are one
  canonical plan.
- Record observed playtest language in review artifacts, not in design claims.
- Append load-bearing decisions to ADR update logs; do not rewrite their
  original rationale.
- Prefer one acceptance report per implemented proof over new pre-implementation
  contract documents.

## Anything else?

Yes. The visual gap between the Patchwork Atlas concept and the runtime is real,
but richer assets and lighting are not the first closure path. The larger gap is
**dramatic causality**: the concept art shows a machine that has work to do,
something to lose, danger caused by its own power, and a larger destination.
The primitive runtime can prove that with simple geometry. If it cannot, visual
fidelity will only make the proving ground prettier.

The most important near-term design rule is therefore:

> **Do not add a system unless the next dawn can remember it.**

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md` is the broader
horizon for this proof ladder. This document remains the active sequencing and
acceptance rationale for Farmfall; the new note carries the wider
machine-keeper thesis and long-range design expansion.
