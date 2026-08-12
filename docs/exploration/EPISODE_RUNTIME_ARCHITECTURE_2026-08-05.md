# Episode Runtime Architecture — How Episodes Actually Execute

**Date:** 2026-08-05
**Status:** design exploration; not an accepted ADR
**Evidence tier:** Tier 1 synthesis of Episode Runner Spec, episode grammar, contract ledger, and core loop contract
**Depends on:** Episode Runner Specification, Compositional Episode Grammar, Contract Ledger Specification

---

## 1. The problem this solves

The Episode Runner Specification defines the episode as a composition layer above the contract ledger. The episode grammar defines the 7-part structure. But neither specifies **how an episode actually runs at runtime** — the frame-by-frame, moment-by-moment execution that makes an episode feel like a lived experience rather than a data structure.

The missing details:
- How does an episode spawn into the world?
- How does the director create pressure during a live episode?
- How does the rig interact with episode systems?
- How are win/fail/recovery states determined?
- How are consequences applied after an episode ends?
- How does the UI communicate episode state without breaking immersion?

---

## 2. What already exists

### Episode Runner Spec (composition layer)
From `docs/research/EPISODE_RUNNER_SPEC_2026-07-27.md`:
- Runner composes bounded episodes above the contract ledger
- Lifecycle: inspect → select → validate → materialize → handoff → observe → persist → emit
- Runner is read-only — it doesn't mutate durable state
- Runner produces: player-facing summary, machine-readable plan, operator-facing explanation

### Episode Grammar (content structure)
From `docs/exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md`:
- 7 parts: Rig identity + Place + Contract graph + Pressure curve + Rule modifier + Discovery chain + Persistent consequence
- 4 functions: Pressure, Modifier, Discovery, Consequence
- Idea-mixer coherence contract (10 checks)

### Contract Ledger (durable state)
From `docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md`:
- Ledger tracks promises, obligations, and outcomes
- Contracts have eligibility, objectives, branches, and consequences
- Ledger is the source of truth for what's been agreed

### Core Loop (session shape)
From `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md`:
- Session shape: garage → choose objective → travel → encounter → consequence → return → modify → reveal
- The episode is one iteration of this loop

---

## 3. Episode lifecycle (frame-by-frame)

### Phase 1: Episode proposal (before the episode starts)

The runner inspects the current state and proposes an episode:

```text
1. Runner reads current state:
   - Active rig (capabilities, condition, history)
   - Current place (context, terrain, social state)
   - Contract ledger (existing obligations, available contracts)
   - Progression gates (what the rig has earned)
   - World state (weather, time, threats)

2. Runner selects or synthesizes an episode:
   - Matches rig capabilities to available contracts
   - Matches place context to contract requirements
   - Checks eligibility (capability-based, not rig-name)
   - Proposes pressure curve and modifiers

3. Runner validates against grammar:
   - Rig-materiality check (does the rig change the solution?)
   - Environment-participation check (does the place change mechanics?)
   - Contract-readability check (can the player state the objective?)
   - Pressure-tradeoff check (does pressure force a sacrifice?)
   - Modifier-recombination check (does the modifier use existing primitives?)
   - Discovery-fairness check (are clues observable?)
   - Consequence check (does success/failure change durable state?)
   - Recovery check (does failure create a playable recovery?)
   - Authority check (does deterministic validation pass?)
   - Browser-budget check (does content fit loading/simulation envelopes?)

4. Runner materializes episode plan:
   - Creates EpisodePlan data structure
   - Records source trace (what inputs produced this plan)
   - Emits proposal to UI (player-facing summary)
```

### Phase 2: Episode activation (player accepts)

The player accepts the contract, and the episode activates:

```text
1. Player reads contract brief:
   - Objective (what to do)
   - Location (where to go)
   - Stakes (what matters)
   - Eligibility (what the rig needs)

2. Player accepts:
   - Contract moves from "available" to "active" in ledger
   - Episode plan is finalized
   - Pressure curve begins
   - Rule modifiers activate
   - UI updates (objective marker, pressure indicator)

3. Episode systems initialize:
   - Pressure system starts (timer, threat, weather change)
   - Modifier system activates (radio interference, limited fuel)
   - Discovery system seeds clues (radio ciphers, tracks, signals)
   - Consequence system prepares (what will change if succeeded/failed)
```

### Phase 3: Episode execution (the live episode)

During the episode, the rig interacts with episode systems:

```text
Frame-by-frame:
1. Read rig state (position, velocity, condition, cargo)
2. Read episode state (pressure level, modifier active, clues found)
3. Read world state (terrain, weather, threats, routes)
4. Update pressure (increase gradually, force tradeoffs)
5. Update modifiers (interference, limitations, opportunities)
6. Check discovery triggers (did the rig find a clue?)
7. Check contract progress (objective completed? branches taken?)
8. Check failure conditions (rig destroyed? deadline missed? route blocked?)
9. Check recovery conditions (can the rig be rescued? can the contract be modified?)
10. Emit feedback (visual, audio, UI, haptic)
```

### Phase 4: Episode climax (the decisive moment)

Every episode has a climax — the moment where the outcome is determined:

```text
Examples:
- Storm reaches peak intensity (pressure climax)
- Rig reaches the relay station (objective climax)
- Hidden signal is decoded (discovery climax)
- Rig becomes stranded (failure climax)
- Last cargo is delivered (success climax)

The climax is not always the end. After the climax:
- Success: consequences are applied, episode resolves
- Partial success: some consequences apply, some deferred
- Failure: recovery branch activates, episode continues in recovery mode
- Abandonment: rig withdraws, consequences are partial
```

### Phase 5: Episode resolution (after the climax)

After the climax, the episode resolves:

```text
1. Outcome determined:
   - Success, partial success, failure, or abandonment
   - Source trace recorded (what happened, why)

2. Consequences applied:
   - Rig changes (damage, repairs, scars, upgrades)
   - World changes (routes opened/blocked, terrain altered, structures changed)
   - Relationship changes (favor gained/lost, trust earned/broken)
   - Knowledge changes (discoveries recorded, mysteries advanced)
   - Cargo changes (delivered, lost, changed, escaped)

3. Episode plan archived:
   - EpisodePlan → EpisodeOutcome
   - Applied consequences recorded
   - Recovered consequences recorded
   - World state notes recorded
   - Reward notes recorded
   - Diagnostics recorded

4. Player receives summary:
   - What happened
   - What changed
   - What new possibilities exist
   - What obligations remain
```

---

## 4. The pressure system

Pressure is the mechanic that creates urgency and forces tradeoffs. It's not a timer — it's a readable, observable system that evolves during play.

### Pressure types

| Type | Example | How it works | How the rig responds |
|---|---|---|---|
| Environmental | Rising water, approaching storm | Changes terrain, routes, visibility | Adapt route, increase speed, seek shelter |
| Resource | Dwindling fuel, limited ammo | Forces conservation, route planning | Reduce consumption, find resupply, extract early |
| Threat | Pursuing swarm, rival crew | Creates pursuit, forces defensive action | Evade, fight, hide, divert |
| Structural | Collapsing bridge, spreading fire | Changes available routes, creates danger | Reinforce, reroute, rescue, abandon |
| Social | Stranded passenger, urgent request | Creates moral obligation, time pressure | Help (costs time), ignore (costs favor), improvise |
| Information | Intermittent radio, hidden signal | Changes navigation, creates mystery | Listen, scout, decode, improvise |

### Pressure curve design

Every episode has a pressure curve that evolves during play:

```text
Phase 1: Setup (low pressure)
  - Introduce the situation
  - Let the player plan
  - Establish the baseline

Phase 2: Escalation (rising pressure)
  - Introduce complications
  - Force tradeoffs
  - Narrow options

Phase 3: Climax (peak pressure)
  - Maximum urgency
  - Final decision
  - Outcome determined

Phase 4: Resolution (pressure release)
  - Apply consequences
  - Reveal new possibilities
  - Return to ambient state
```

### Pressure must be readable

The player must always understand:
- What is causing the pressure
- How much pressure exists
- What options remain
- What happens if pressure continues

Pressure that is hidden, arbitrary, or unresponsive is not pressure — it's punishment.

---

## 5. The modifier system

Modifiers change how known systems behave during an episode. They're not new mechanics — they're reinterpretations of existing mechanics.

### Modifier types

| Type | Example | How it changes existing systems |
|---|---|---|
| Environmental | Gravity shift, redirected weather | Changes movement, traction, projectile paths |
| Informational | No reliable map, intermittent radio | Changes navigation, planning, communication |
| Resource | Limited fuel, fragile cargo | Changes route choice, speed, risk tolerance |
| Temporal | Time loop, accelerated decay | Changes urgency, consequence, planning |
| Mechanical | One failed system from start | Changes capability, forces improvisation |
| Social | Hostile locals, hidden identity | Changes access, trust, negotiation |

### Modifier rules

1. **Modifiers recombine existing primitives** — they don't introduce parallel minigames
2. **Modifiers are observable** — the player can see or sense the modification
3. **Modifiers are bounded** — they last for the episode, not forever
4. **Modifiers interact with rig capabilities** — a modifier that disables a rig's primary capability forces improvisation

---

## 6. The discovery system

Discovery rewards observation, experimentation, and cross-rig knowledge. It's not hidden loot — it's observable system relationships.

### Discovery types

| Type | Example | How it's discovered |
|---|---|---|
| Signal | Radio ciphers, interference patterns | Listen, decode, triangulate |
| Physical | Tracks, vibrations, heat signatures | Observe, follow, measure |
| Environmental | Reflected geometry, sonar-only shapes | Use sensors, compare observations |
| Cross-rig | Mechanism found by one rig, activated by another | Coordinate, share knowledge |
| Temporal | Secrets spanning time, scale, or generations | Revisit, compare, piece together |

### Discovery rules

1. **Clues are observable through available capabilities** — no arbitrary guessing
2. **Discoveries remain meaningful when shared** — the interest is system relationships, not secrecy
3. **Discoveries advance mysteries** — they don't just reward exploration
4. **Discoveries have persistent consequences** — they change what's possible later

---

## 7. The consequence system

Consequences are the persistent changes that make episodes meaningful. They're not rewards — they're world state changes that alter later decisions.

### Consequence types

| Type | Example | How it persists |
|---|---|---|
| Rig | Scar, repair, upgrade, damage | Stored in rig state, visible on model |
| World | Route opened/blocked, terrain altered, structure changed | Stored in world state, affects later navigation |
| Relationship | Favor gained/lost, trust earned/broken | Stored in social state, affects later access |
| Knowledge | Discovery recorded, mystery advanced | Stored in progression state, affects later decisions |
| Cargo | Delivered, lost, changed, escaped | Stored in episode outcome, affects later obligations |

### Consequence rules

1. **Consequences are durable** — they survive episode end
2. **Consequences are legible** — the player can see what changed
3. **Consequences affect later decisions** — they're not just narrative flavor
4. **Consequences can be recovered** — failure creates recovery stories, not dead ends
5. **Consequences are bounded** — they don't cascade infinitely

---

## 8. The director role

The director is not a hidden AI that controls the game. It's a bounded system that adjusts pressure, spawns events, and maintains episode coherence during a live episode.

### Director responsibilities

1. **Pressure management** — adjust pressure based on rig performance, world state, and episode progress
2. **Event spawning** — introduce complications, discoveries, and opportunities at readable moments
3. **Modifier management** — activate/deactivate modifiers based on episode state
4. **Discovery seeding** — place clues in observable locations
5. **Consequence preparation** — track what will change based on episode outcome

### Director constraints

1. **Director is deterministic** — same state + same seed = same director decisions
2. **Director is inspectable** — operator can see why the director made each decision
3. **Director doesn't mutate durable state** — it proposes changes, the kernel applies them
4. **Director respects rig capabilities** — it doesn't spawn events the rig can't perceive
5. **Director respects browser budgets** — it doesn't spawn more than the renderer can handle

### Director decision flow

```text
Every frame:
1. Read episode state (pressure level, modifier active, clues found)
2. Read rig state (position, velocity, condition, capabilities)
3. Read world state (terrain, weather, threats, routes)
4. Evaluate pressure trajectory (is it on curve? too fast? too slow?)
5. Evaluate event opportunities (is this a readable moment for a complication?)
6. Evaluate discovery opportunities (has the rig earned a clue?)
7. Emit director decisions (pressure adjustment, event spawn, discovery seed)
8. Record decisions for operator inspection
```

---

## 9. The UI contract

The UI communicates episode state without breaking immersion.

### UI elements

| Element | What it shows | When it appears |
|---|---|---|
| Episode banner | Episode title, objective | Episode start |
| Pressure indicator | Current pressure level, readable cause | During episode |
| Objective marker | Where to go, what to do | During episode |
| Discovery hints | Clue locations, signal strength | When clues are nearby |
| Consequence preview | What will change if succeeded/failed | Before final decision |
| Outcome summary | What happened, what changed | Episode end |

### UI rules

1. **UI is diegetic when possible** — pressure shown through lighting, sound, terrain, not just meters
2. **UI is minimal** — only show what the player needs to make decisions
3. **UI is accessible** — all information available through multiple channels (visual, audio, haptic)
4. **UI doesn't spoil** — don't show hidden discoveries or future consequences
5. **UI persists** — episode history visible after resolution

---

## 10. The data flow

```text
Episode Proposal:
  Runner reads state → Runner validates grammar → Runner materializes plan → UI shows brief

Episode Activation:
  Player accepts → Contract activates → Systems initialize → Pressure begins

Episode Execution:
  Rig interacts → World responds → Director adjusts → Pressure escalates → Clues appear

Episode Resolution:
  Outcome determined → Consequences applied → World updated → Player receives summary
```

### Data structures

```text
EpisodePlan:
  id, kind, title, summary
  rigId, placeId
  contractIds[]
  pressureCurve[]
  ruleModifiers[]
  discoveryChain[]
  successConditions[]
  partialSuccessConditions[]
  failureConditions[]
  recoveryConditions[]
  persistentConsequences[]
  sourceTrace[]

EpisodeOutcome:
  id, episodeId
  status: completed | failed | abandoned | partial
  summary
  appliedConsequences[]
  recoveredConsequences[]
  worldStateNotes[]
  rewardNotes[]
  diagnostics[]
```

---

## 11. The recovery system

Failure doesn't end the episode — it transforms it. Recovery is a continuation, not a restart.

### Recovery types

| Type | Example | How it works |
|---|---|---|
| Physical | Rig stranded, needs towing | Another rig can rescue, or emergency escape activates |
| Contract | Objective failed, modified objective appears | Contract branches to recovery objective |
| Resource | Cargo lost, salvage opportunity appears | Lost cargo becomes salvageable wreck |
| Relationship | Promise broken, repair opportunity appears | Broken trust creates recovery obligation |
| Knowledge | Discovery failed, alternative clue appears | Missed clue leads to different discovery |

### Recovery rules

1. **Recovery is honest** — failure has real consequences
2. **Recovery is playable** — the player can continue, not just reload
3. **Recovery is legible** — the player knows what happened and what's possible
4. **Recovery creates stories** — failure leads to memorable moments
5. **Recovery is bounded** — not every failure can be recovered

---

## 12. What this enables

- **Episodes feel alive** — pressure escalates, discoveries appear, consequences accumulate
- **Episodes are readable** — the player always knows what's happening and why
- **Episodes are deterministic** — same state + same seed = same experience
- **Episodes are inspectable** — operator can see why every decision was made
- **Episodes create stories** — pressure, discovery, and consequence produce memorable moments
- **Episodes persist** — consequences survive, affecting later decisions
- **Episodes compose** — one episode's consequences become another episode's context

---

## 13. First proof slice

The smallest durable proof that episode runtime works:

1. **One episode** (Storm Relay) with one rig (Torque)
2. **One pressure type** (rising water) with one escalation curve
3. **One modifier** (radio interference) that changes navigation
4. **One discovery** (hidden signal) that requires observation
5. **One consequence** (route opened or blocked) that persists
6. **One recovery branch** (rig stranded, emergency escape)
7. **One outcome summary** (what happened, what changed)

### What this proves
- Episode lifecycle works end-to-end
- Pressure creates readable urgency
- Modifiers change existing systems
- Discoveries reward observation
- Consequences persist and affect later decisions
- Recovery is honest and playable
- UI communicates episode state

### What this does NOT prove
- Full 7-part grammar support (that's content, not mechanism)
- Director AI (that's a separate proof)
- Cross-rig episodes (that's a separate proof)
- Procedural episode generation (that's a separate proof)

---

## 14. Decision questions

1. Should the director be a separate system, or part of the episode runner?
2. How many pressure types can stack before the episode becomes incoherent?
3. Should recovery be a separate episode kind or a branch inside the same episode?
4. How does the UI communicate pressure without breaking immersion?
5. Should episodes have predetermined lengths, or evolve naturally?
6. How does the director handle player skill variation (good players vs. struggling players)?

---

## Linked artifacts

- [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
- [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
- [Contract Ledger Specification](../research/CONTRACT_LEDGER_SPEC_2026-07-27.md)
- [Core Loop and Progression Contract](../research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)
- [Context Switching Mechanic](./CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- [Module System Mechanics](./MODULE_SYSTEM_MECHANICS_2026-08-05.md)
- [Long-Term Game Design from First Principles](../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
