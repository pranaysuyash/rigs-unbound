# Context Switching Mechanic — How the Same Rig Plays Differently

**Date:** 2026-08-05
**Status:** design exploration; not an accepted ADR
**Evidence tier:** Tier 1 synthesis of existing contracts, mode matrix, episode grammar, and long-term design
**Depends on:** Same Vehicle Mode Matrix, Compositional Episode Grammar, Long-Term Game Design

---

## 1. The problem this solves

The game's core innovation is one persistent rig across 10+ contexts (farming, racing, defense, construction, aquatic, aerial, absurd, etc.). The mode matrix shows *what* changes per context. The episode grammar shows *how* episodes are composed. But neither specifies the **runtime mechanism** that transitions a rig between contexts while preserving identity.

Without this mechanism, context switching is either:
- A menu selection (breaks immersion, defeats the "same rig" promise)
- A hard cut (breaks persistence, defeats the "living world" promise)
- Undefined (blocks implementation)

The question is: **how does the game transition between contexts at runtime while keeping the rig's identity intact?**

---

## 2. What already exists

### Mode matrix (what changes)
From `docs/exploration/SAME_VEHICLE_MODE_MATRIX_2026-07-26.md`:
- Same cab family, chassis memory, wheelbase, repair history, semantic blueprint
- Different loadout, camera contract, lighting, mechanical behavior
- 10 modes defined: Farming, Racing, Dystopian Survival, Zombie Defense, Day/Night, Construction, Urban Service, Aquatic, Aerial, Absurd/Mythic

### Genre-transition contract (what each transition must define)
From `docs/exploration/EXPLORATION_MAP.md`:
1. Diegetic trigger
2. Player preview/consent
3. Input changes
4. Camera changes
5. State carried in
6. Outcome carried out
7. Failure and escape
8. Accessibility alternative
9. Resume/reconnect behavior
10. Telemetry and test state

### Episode grammar (the content unit)
From `docs/exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md`:
- 7-part grammar: Rig identity + Place + Contract graph + Pressure curve + Rule modifier + Discovery chain + Persistent consequence
- The episode is the reusable content unit, not "mode"

### Activity binding (current code)
From `src/game/activities.ts`:
- Three bindings: haul, survey, rally
- Each binding defines: movement style, camera bias, activity verbs
- Activities are spatial, not menu-selected

---

## 3. Three models for context switching

### Model A: Place-driven (recommended)

The context is determined by **where the rig is**, not what the player selects.

```text
Patchwork Vale (farmland)    → farming context active
Sunken Flats (marshland)     → aquatic context active
Ironwood Pass (mountains)    → hauling context active
Pocket Metropolis (toy-scale) → courier context active
Night falls                  → survival context overlays
Horde approaches             → defense context overlays
```

**How it works:**
- Each place has a primary context and optional overlay contexts
- The rig inherits the place's context automatically
- The rig's capabilities are reinterpreted through the place's lens
- Overlays (night, storm, danger) add secondary context layers
- No menu selection needed — the rig physically moves between places

**Example:**
```text
Torque in Patchwork Vale:
  → plough verb = cultivate fields
  → haul verb = tow crops to barn
  → camera = close chase, work view
  → lighting = broad daylight

Torque in Sunken Flats:
  → plough verb = dredge channels
  → haul verb = ferry equipment across water
  → camera = side chase, horizon-aware
  → lighting = reflective daylight or storm

Torque at night in Patchwork Vale:
  → plough verb = cultivate (unchanged)
  → haul verb = tow (unchanged, but harder)
  → camera = close chase, lamp-lit
  → lighting = focused cones, deep dark
  → overlay = survival (reduced visibility, tension)
```

**Advantages:**
- Seamless — no menu, no cut, no break in immersion
- Persistent — the rig's identity survives because the place changes, not the rig
- Composable — overlays stack (night + storm + danger = three context layers)
- Deterministic — same place + same conditions = same context
- Playable — the rig physically moves between contexts

**Risks:**
- Places must be designed to support their context (you can't farm on a mountain)
- The rig must have capabilities relevant to the place (Torque can't fly)
- Overlay stacking must not create incoherent combinations

### Model B: Episode-driven

The context is determined by **what episode the player enters**.

```text
Accept "Storm Relay" contract → defense + aquatic context active
Accept "Field Restoration" contract → farming context active
Accept "Race Circuit" contract → racing context active
```

**How it works:**
- The player accepts a contract from the contract ledger
- The contract defines the context (place + pressure + rules)
- The rig enters the episode's context for its duration
- When the episode ends, the context reverts to the ambient place

**Advantages:**
- Explicit — the player knows what context they're entering
- Bounded — episodes have clear start/end
- Composable — episodes can layer contexts

**Risks:**
- Breaks the "seamless world" promise if episodes feel like mode selections
- Episodes must be discoverable spatially, not just from a menu
- The transition must be diegetic (the contract is a real thing in the world)

### Model C: Capability-triggered

The context is determined by **what the rig is equipped with**.

```text
Plough equipped    → farming context active
Winch equipped    → recovery context active
Turret equipped   → defense context active
Spoiler equipped  → racing context active
```

**How it works:**
- The rig's equipped modules determine its active context
- Swapping modules changes the context
- The rig's capabilities define what it can do

**Advantages:**
- Direct — the rig's physical state determines its context
- Player-controlled — the player chooses by equipping modules

**Risks:**
- Reduces context to loadout (the rig becomes a stat package)
- Breaks the "same rig" promise if module swapping feels like mode selection
- Requires a module-swapping mechanic that feels physical, not menu-driven

---

## 4. Recommended approach: Place-driven with episode overlays

**Primary: Model A (place-driven)** — the rig inherits context from where it is.
**Secondary: Model B (episode-driven)** — episodes add pressure, rules, and consequences on top of the place context.
**Reject: Model C (capability-triggered)** — it reduces context to loadout.

### The mechanic in detail

#### 4.1 Place context (ambient)

Every place has:
- **Primary context** — the dominant activity type (farming, hauling, exploration)
- **Terrain truth** — what the ground is made of, what routes exist
- **Social truth** — who lives here, what they need, what they fear
- **Lighting truth** — time of day, weather, atmosphere
- **Affordance map** — what verbs are available in this place

The rig inherits the place's context automatically. When Torque enters Patchwork Vale, it becomes a farming rig — not because the player selected "farming mode," but because the place makes farming relevant.

#### 4.2 Context overlays (stackable)

Overlays add secondary context layers:
- **Time overlay** — day/night changes visibility, tension, available work
- **Weather overlay** — storm/fog/clear changes terrain, routes, danger
- **Danger overlay** — threat level changes priorities, available actions
- **Season overlay** — crop cycles, water levels, temperature

Overlays stack: a night storm in farmland = farming + survival + navigation challenge.

#### 4.3 Episode context (bounded)

Episodes add:
- **Contract** — a specific objective with success/failure conditions
- **Pressure** — escalating difficulty that forces tradeoffs
- **Rules** — modified game rules (radio interference, limited fuel, etc.)
- **Discovery** — observable clues that reward exploration
- **Consequence** — persistent changes to the rig, place, or relationships

Episodes are bounded — they start, escalate, climax, and resolve. The context reverts to ambient when the episode ends.

#### 4.4 Capability reinterpretation

The same verb means different things in different contexts:

```text
Verb: "plough"
  Farming context  → cultivate fields, prepare soil
  Defense context  → shape defensive lanes, create barricades
  Racing context   → clear debris from track
  Construction     → grade terrain, prepare foundation
  Aquatic          → dredge channels, clear waterways

Verb: "haul"
  Farming context  → tow crops to barn
  Racing context   → transport parts to pit stop
  Defense context  → move barricades, supply ammo
  Construction     → carry materials to site
  Aquatic          → ferry equipment across water

Verb: "survey"
  Farming context  → assess soil quality, plan crops
  Racing context   → scout route, find shortcuts
  Defense context  → locate threats, map defenses
  Construction     → measure site, plan layout
  Aquatic          → map channels, find hazards
```

The rig's physical capabilities don't change — the **meaning** of its capabilities changes based on context.

#### 4.5 Camera reinterpretation

The camera contract changes per context:

```text
Farming:  close chase, work view, broad daylight
Racing:   close chase, low angle, bright/sunset
Defense:  tactical chase/top-down hybrid, night
Aquatic:  side chase, horizon-aware
Construction: medium orbit, practical work view
Aerial:   wide chase or docking view
Absurd:   whichever makes the rig readable
```

The camera reinterprets, not replaces. The rig stays in the center — the viewing angle, distance, and lighting change.

---

## 5. The transition mechanism

### 5.1 Physical transition (place-driven)

When the rig moves between places, the context transitions smoothly:

```text
1. Rig approaches place boundary
2. Terrain changes (soil → mud → water)
3. Lighting changes (daylight → dusk)
4. Ambient sounds change (birds → insects → water)
5. Available verbs change (cultivate → dredge)
6. Camera subtly adjusts (chase → side)
7. Context label updates in UI
```

No menu. No cut. The rig physically crosses a boundary and the world changes around it.

### 5.2 Episode entry (contract-driven)

When the player accepts a contract, the episode context activates:

```text
1. Player finds contract (spatial discovery or radio signal)
2. Contract brief appears (objective, location, stakes)
3. Player accepts (or declines)
4. Episode pressure begins (storm approaches, threat appears)
5. Rules modify (radio interference, limited fuel)
6. Camera adjusts (tactical view for defense)
7. Episode label appears in UI
```

The transition is diegetic — the contract is a real thing in the world (a radio call, a sign, a person asking for help).

### 5.3 Overlay activation (automatic)

Overlays activate based on conditions:

```text
Night falls     → visibility overlay (lamps become primary)
Storm arrives   → weather overlay (rain, wind, flooding)
Threat appears  → danger overlay (tension, threat indicators)
Season changes  → seasonal overlay (crop cycles, water levels)
```

Overlays don't interrupt play — they modify it gradually. The player notices the change through sensory cues (darkness, rain, distant sounds) before the UI announces it.

---

## 6. State carried across transitions

### What persists
- Rig identity (chassis, history, scars, repairs)
- Rig capabilities (what it can do)
- Rig condition (damage, fuel, cargo)
- World memory (routes, consequences, relationships)
- Episode history (what happened, what changed)

### What changes
- Active context label
- Available verbs (reinterpreted, not replaced)
- Camera contract
- Lighting/atmosphere
- Pressure/danger level
- UI hints and affordances

### What reverts
- Episode-specific rules (radio interference ends when episode ends)
- Temporary pressure (storm passes, threat leaves)
- Episode-specific UI (objective markers disappear)

---

## 7. The "same rig" preservation rules

1. **The rig never transforms** — it stays physically the same machine
2. **Capabilities are reinterpreted** — plough means different things, not new things
3. **The camera reinterprets** — viewing angle changes, not the rig's position
4. **The world changes around the rig** — terrain, lighting, sounds, not the rig itself
5. **History persists** — scars, repairs, and memories survive context changes
6. **The rig's limitations are permanent** — Torque can't fly, even in an aerial context
7. **The rig's strengths are permanent** — Torque can tow, even in a racing context

---

## 8. Cross-rig context switching

When the player has multiple rigs, context switching becomes fleet coordination:

```text
Torque in Patchwork Vale  → farming context
Drift in Sunken Flats     → aquatic context
Spark on race circuit     → racing context
```

The player can switch between rigs (inhabiting another body, not selecting a unit). Each rig experiences its place's context independently. The fleet's combined capabilities enable operations that no single rig could perform.

### Fleet context operations

```text
Operation: "Storm Relay"
  Torque hauls the generator (farming/hauling context)
  Drift ferries equipment across flood (aquatic context)
  Spark scouts the elevated route (racing/exploration context)
  All three rigs contribute to one episode from different places
```

---

## 9. Anti-patterns to avoid

1. **Menu-driven mode selection** — breaks immersion, defeats "same rig" promise
2. **Hard cuts between contexts** — breaks persistence, defeats "living world" promise
3. **Module-swapping as context switching** — reduces context to loadout
4. **Universal capability** — every rig can do everything (breaks identity)
5. **Context-specific rigs** — different rigs for different contexts (breaks "same rig" promise)
6. **Invisible transitions** — context changes without sensory cues (confusing)
7. **Abrupt transitions** — context changes instantly (jarring)
8. **Reversible context** — player can undo context changes (breaks persistence)

---

## 10. What this enables

- **One rig, many stories** — the same Torque experiences farming, racing, defense, and absurd contexts, creating unique stories per playthrough
- **Fleet as capability composition** — different rigs in different contexts create emergent operations
- **World as context source** — the place determines the context, not the player's menu
- **Persistence as identity** — the rig's history survives context changes, making it a character
- **Discovery as motivation** — new places reveal new contexts, encouraging exploration
- **Consequence as meaning** — context changes have persistent effects, making choices matter

---

## 11. First proof slice

The smallest durable proof that context switching works:

1. **One rig** (Torque) in **one place** (Patchwork Vale)
2. **Two contexts** — farming (day) and survival (night)
3. **One transition** — day-to-night with gradual lighting change
4. **One verb reinterpretation** — "haul" means different things in each context
5. **One camera change** — close chase (day) to lamp-lit chase (night)
6. **One persistent consequence** — a route ploughed during the day is harder to navigate at night

### What this proves
- Context can change without breaking the rig's identity
- The same verb has different meanings in different contexts
- The camera can reinterprete without replacing the rig
- Persistence survives context changes

### What this does NOT prove
- Full 10+ context support (that's content, not mechanism)
- Fleet coordination (that's a separate proof)
- Episode-driven context (that's a separate proof)
- Overlay stacking (that's a separate proof)

---

## 12. Decision questions

1. Should context switching be entirely place-driven, or should episodes override place context?
2. How many overlays can stack before the context becomes incoherent?
3. Should the rig's capabilities be modified by context, or only reinterpreted?
4. How does the player know what context they're in without breaking immersion?
5. Should context transitions be instant, gradual, or triggered by specific actions?
6. How does the fleet coordinate across different contexts?

---

## Linked artifacts

- [Same Vehicle Mode Matrix](../exploration/SAME_VEHICLE_MODE_MATRIX_2026-07-26.md)
- [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
- [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
- [Long-Term Game Design from First Principles](../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
- [Core Loop and Progression Contract](../research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)
- [Asset Pipeline for Infinite Rigs](../research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md)
- [Rig Generation for Infinite Possibilities](../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)
- [src/game/activities.ts](../../src/game/activities.ts)
- [src/game/contracts.ts](../../src/game/contracts.ts)
