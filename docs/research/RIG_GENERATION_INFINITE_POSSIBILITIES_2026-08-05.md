# Rig Generation for Infinite Possibilities — Expanded Exploration

**Date:** 2026-08-05
**Type:** Design expansion of `RIG_GENERATION_EVOLUTION_AND_PERSISTENCE_2026-08-05.md`
**Status:** This document corrects the earlier assumption that 36 authored archetypes is sufficient. The vision demands procedural generation as a core architecture, not a nice-to-have. This is a proposed direction; it must be reviewed against the first-playable slice.
**Evidence tier:** Tier 1 static source and contract synthesis, plus design reasoning from the vision docs.
**Consumer (2026-08-12):** None yet. [Game Director Audit — 2026-08-12](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md) §4.4 names this doc as scope expansion beyond the spine's current 3 hand-authored profiles, with no named consumer and nothing shipped against it — paused per [`NEXT_EXECUTION_BOARD_2026-08-12.md`](../plans/NEXT_EXECUTION_BOARD_2026-08-12.md) GD-13 until the first-playable slice ships and an explicit spine/ADR entry names what this unblocks. Content preserved unedited below.

---

## 1. The correction

The earlier document assumed 36 authored vehicles across 6 categories was the boundary. The user correctly identified this as too small. The vision docs say otherwise:

- The master catalog has 36 vehicles, but "we stopped because we were just exploring."
- The vehicle family atlas defines 11 families with infinite variants within each.
- The compositional episode grammar says "a contract can temporarily make the world play like a race, farm, rescue, defence, expedition, puzzle, survival problem, construction job, or something new."
- The long-term design doc describes 4 whole-game forms, each with different rig demands.
- The same-vehicle mode matrix shows 10 modes where the same rig plays fundamentally differently.
- The scene ladder has 20 scenes. The use-case ladder has 15 use cases. 20 × 15 = 300 combinations for one rig family.

**The conclusion:** You cannot author every possible rig. You need a system that generates infinite rigs from finite rules, while preserving identity, persistence, and balance.

---

## 2. What the vision actually demands

### The rig as verb, not noun

Every vision doc agrees: a rig is not a vehicle archetype. It is a **way of changing the world.** Torque is "the hand that cuts." Spark is "the mind that scouts." Drift is "the ghost that crosses." Switching rigs is switching the way the world can be changed.

This means rig identity is defined by **verbs** (capabilities), not by **nouns** (chassis shape). A tractor that ploughs, tows, and cultivates is a different rig from a tractor that ploughs, defends, and fortifies — even if they share the same chassis.

### One machine, many contracts

The episode grammar says the rig's identity persists across episodes. The world contract changes around it. A tractor in farming is a livelihood machine. The same tractor in zombie defense is a mobile survival platform. The rig's identity (cab, chassis, repair history, emotional read) stays the same. What changes is the loadout, camera, lighting, threat ecology, and pressure mechanics.

### Infinite content from finite systems

The vision explicitly rejects "procedural expanse with distance but no authored reason to care." Instead it proposes:
- Weather × surface × time of day = ~42 situations from one float
- Player-authored routes create content through play
- Decay makes roads become maintenance — a renewable loop
- The content axis is surfaces (multiplicative), not vehicles (linear)

This means rig generation is not about generating infinite unique vehicles. It is about generating **infinite configurations** of a finite set of archetypes, modules, and contexts.

---

## 3. The architecture: three layers of generation

### Layer 1: Archetype DNA (authored, finite)

The vehicle family atlas defines 11 families. Each family is an authored archetype with:
- **Locomotion class** — ground (wheels/tracks) or hover (pontoons/fans)
- **Core verbs** — the capabilities the family can express
- **Silhouette language** — cab shape, wheel family, repair grammar
- **Hardpoint schema** — which sockets exist, what categories fit each
- **Physics envelope** — min/max for every physics field
- **Material palette** — rust, bone enamel, sage metal, etc.

**This is authored, not procedural.** The archetype defines the character. You don't proceduralise a tractor's identity.

### Layer 2: Variant generation (procedural within archetype)

Given an archetype, a **seed** derives unique physical characteristics:

```typescript
interface RigDNA {
  // Identity (immutable unless major overhaul)
  archetypeId: string;           // which family
  seed: string;                  // deterministic variant seed
  passport: VehiclePassport;     // durable narrative history

  // Derived from seed (deterministic reconstruction)
  wheelbase: number;             // ±10% of canonical
  massDistribution: number;      // 0.45–0.55 front bias
  hardpointCount: number;        // how many sockets per location
  suspensionBase: number;        // ±15% of canonical
  engineCharacter: number;       // torque curve variation
  visualSeed: number;            // panel arrangement, weathering

  // Installed configuration (player-driven)
  modules: InstalledModule[];    // concrete parts with provenance
  tools: RigToolState;           // tire pressure, differential mode

  // History (append-only)
  journey: RigJourneyState;      // phase, investment, deeds
  mastery: MasteryState;         // per-capability skill
}
```

**Why this matters:** Two players both find a Torque-70. One has a slightly longer wheelbase (better towing stability), the other has a front-heavy bias (better ploughing). Both are recognisably Torque-70, but they *feel* different. The seed ensures: same archetype + same seed → same variant, forever.

### Layer 3: Context adaptation (procedural from episode grammar)

An episode is defined by the 7-part grammar:

```
Rig identity + Place + Contract graph + Pressure curve + Rule modifier + Discovery chain + Persistent consequence = Episode
```

The episode defines how the rig is **reinterpreted** for that context:

| Episode element | What it reads from the rig | What it produces |
|---|---|---|
| Rig identity | DNA, modules, journey, mastery | Eligible capabilities, social footprint |
| Place | Terrain, weather, water, structures | Physical constraints, opportunities |
| Contract graph | Rig capabilities, module compatibility | Objective, optional goals, escalation |
| Pressure curve | Rig condition, fuel, cargo state | Tradeoffs, time pressure |
| Rule modifier | Rig mobility class, module traits | Changed physics, visibility, communication |
| Discovery chain | Rig sensory channels, mastery | Observable clues, hidden mechanisms |
| Persistent consequence | Rig journey, passport, world state | Scars, route changes, new obligations |

**The procedural part is the combination.** The episode grammar generates infinite episode proposals from finite rules. Each proposal is validated against the 10-point coherence contract before activation.

---

## 4. How rig identity persists across infinite contexts

### The VehiclePassport

The vision defines a **VehiclePassport** — a durable narrative and provenance view that tracks:

- Rig identity, blueprint/version, acquisition provenance
- Journey phase, fitted/removed/damaged parts
- Scars, repairs, mastered verbs
- Traversal records, contracts completed/abandoned/failed
- People/factions helped or harmed
- Discoveries, close calls, wreck/rescue/rebuilding history

**The passport is immutable history.** It never changes retroactively. It only accumulates.

### The social footprint

World actors query the rig using **semantic footprint**, not rig names:

- Emergency authority (does the rig have rescue capability?)
- Civilian trust/fear (has the rig helped or harmed communities?)
- Military threat (does the rig have weapons/defense?)
- Noise/heat/vibration (is the rig loud or stealthy?)
- Previous incidents (has the rig been in accidents or failures?)

**The social footprint is derived from the passport.** It changes slowly as the rig's history accumulates. It is not procedural in the "random" sense — it is deterministic from the rig's actions.

### The identity invariants

These never change across contexts:
- Cab family (silhouette anchor)
- Wheel/locomotion family (movement character)
- Chassis memory (wheelbase, mass distribution from seed)
- Repair history (passport entries)
- Semantic blueprint (the rig's conceptual identity)
- Emotional read (the player's relationship to the rig)

These change per context:
- Loadout/modules (context-specific equipment)
- Camera contract (how the rig is framed)
- Lighting contract (how the rig is lit)
- Threat ecology (what dangers exist)
- Pressure mechanics (what forces tradeoffs)
- Control emphasis (what the player focuses on)

---

## 5. Procedural module generation

### Why modules must be procedural

The same-vehicle mode matrix shows 10 modes. Each mode needs different modules:
- Farming: plough, seeder, sprayer, trailer
- Racing: nitro, race tires, aero kit, roll cage
- Zombie defense: brush guard, floodlights, shields, turret
- Construction: crane arm, drill mast, stabilizer, salvage claw
- Aquatic: pontoons, sealed seams, sonar
- Orbital: thrusters, clamps, landing legs

The vehicle family atlas defines 11 families × 10 modes = 110 module configurations. But the vision says "infinite possibility." You cannot author 110+ module sets.

### The solution: module generation from rules

Modules are generated from:
1. **Archetype hardpoints** — what sockets exist on the chassis (authored per family)
2. **Context module pool** — what categories of modules are available in this context (authored per episode kind)
3. **Journey phase** — how many slots are available (1–5, already implemented)
4. **Mastery gates** — what capabilities are unlocked (already implemented)
5. **Salvage/craft/trade** — how modules are acquired (activity-driven)

The procedural part is the **combination**: given a chassis variant, a context, and a journey phase, the system generates the set of valid module configurations.

### Module taxonomy

```typescript
interface ModuleTemplate {
  id: string;
  category: ModuleCategory;      // "front" | "rear" | "roof" | "cargo" | "utility"
  function: ModuleFunction;      // what verb it enables
  fits: ArchetypeFamily[];       // which families can install it
  effects: ModuleEffects;        // physics modifications
  grantsCapability?: RigCapability;
  visualSignature: string;       // for renderer
  contextAffinity: ContextAffinity[];  // which contexts this module shines in
}

type ModuleCategory =
  | "cultivation"     // plough, seeder, sprayer
  | "towing"          // hitch, winch, trailer
  | "scouting"        // survey mast, sensor array, thermal camera
  | "defense"         // brush guard, shield, turret, floodlights
  | "construction"    // crane arm, drill mast, stabilizer
  | "locomotion"      // pontoons, thrusters, tracks, wings
  | "utility"         // cargo bed, fuel tank, repair kit
  | "performance"     // nitro, race tires, aero kit, roll cage

type ContextAffinity =
  | "farming" | "racing" | "survival" | "defense" | "construction"
  | "aquatic" | "orbital" | "absurd" | "exploration" | "rescue"
```

### How modules are generated for a context

Given:
- A rig DNA (archetype + seed + modules)
- A context (episode kind + place + pressure)
- A journey phase (1–5 slots)

The system generates:
1. Filter `ModuleTemplate` by `fits` (archetype compatibility)
2. Filter by `contextAffinity` (context relevance)
3. Filter by journey phase (slot count)
4. Filter by mastery gates (capability unlocks)
5. Rank by salvage/craft/trade availability
6. Present as options to the player

**The generation is constrained, not random.** The player chooses from valid options. The system ensures balance by bounding effects within the archetype envelope.

---

## 6. Procedural capability reinterpretation

### The key insight from the vision

"A plough can cultivate, cut drainage, shape a defensive lane, expose buried infrastructure, or prepare a launch surface." The same capability means different things in different contexts.

### How capability reinterpretation works

The 8 existing capabilities are **verbs**, not context-specific actions:

| Capability | Farming meaning | Racing meaning | Defense meaning | Construction meaning |
|---|---|---|---|---|
| `plough` | Cultivate soil, open furrows | Clear debris from race line | Shape defensive lanes, create barriers | Grade terrain, prepare foundations |
| `tow` | Haul trailers, move equipment | Tow damaged vehicles to pit | Evacuate civilians, reposition barricades | Move heavy materials, position structures |
| `jump` | Clear obstacles, reach elevated fields | Cut corners, gain speed | Escape threats, reach high ground | Reach elevated work sites |
| `winch` | Pull stumps, clear debris | Recover from off-track | Anchor positions, pull down structures | Lift heavy objects, secure structures |
| `survey` | Map soil conditions, find water | Scout race routes | Detect threats, find hidden enemies | Survey terrain, locate utilities |
| `ford` | Cross irrigation channels | Cut through water hazards | Flooded area operations | Aquatic construction |
| `hover` | Float over soft soil | Hydroplane on wet surfaces | Cross flooded areas | Floating work platforms |
| `rally` | Community events, competitions | Time trials, races | Rally defenses, coordinate response | Community building projects |

### How this enables infinite contexts

The capability system is **compositional.** A rig with `plough + tow + rally` can:
- Farm (cultivate + haul + community)
- Race (clear + recover + compete)
- Defend (shape + evacuate + coordinate)
- Construct (grade + move + build)

The same three capabilities produce four different gameplay experiences because the **context reinterpretation** changes what each capability means.

### The procedural part

The reinterpretation is not random — it is defined by the episode grammar:

```typescript
interface CapabilityReinterpretation {
  capability: RigCapability;
  context: EpisodeKind;
  meaning: string;              // "cultivate soil" vs "shape defensive lanes"
  effectiveness: number;        // 0.5–2.0 multiplier
  pressureModifier: string;     // "risk of crop loss" vs "risk of collapse"
  discoveryHook: string;        // "find buried irrigation" vs "find buried infrastructure"
}
```

The reinterpretation table is authored per context, not procedural. But the **combination** of rig capabilities × contexts × pressure curves generates infinite episode proposals.

---

## 7. Visual adaptation across contexts

### What changes visually

| Element | How it changes | How it's generated |
|---|---|---|
| **Silhouette** | Same cab, different attachments | Module attachment points on the chassis |
| **Condition** | Wear, damage, repairs | Condition state (0–100%) |
| **Lighting** | Day/dusk/night/deep-dark | Context lighting contract |
| **Camera** | Close chase/tactical/orbit/side | Context camera contract |
| **Weather** | Rain/fog/storm/clear | Context weather state |
| **Threat indicators** | Lights, shields, warnings | Context threat tier |

### What stays visually the same

- Cab family shape (silhouette anchor)
- Wheel/locomotion family
- Core palette (rust, bone enamel, sage metal)
- Repair grammar (patches, scars, mismatched panels)
- Emotional read (lived-in, not over-armored)

### The visual generation system

```typescript
interface VisualConfiguration {
  // From rig DNA
  archetypeVisual: ArchetypeVisual;   // cab, wheels, palette
  variantVisual: VariantVisual;        // wheelbase, mass, panel arrangement

  // From installed modules
  attachments: AttachmentVisual[];     // where modules mount, how they look

  // From context
  lighting: LightingConfig;            // day/night, light sources
  camera: CameraConfig;                // chase/orbit/side
  weather: WeatherVisual;              // rain/fog/storm effects
  threatVisual: ThreatVisual;          // warning lights, shields

  // From condition
  wearVisual: WearVisual;              // scratches, dents, rust patches
  repairVisual: RepairVisual;          // new panels, welds, patches
}
```

The visual configuration is **deterministic from the rig's state and the context.** Same rig + same context = same visuals. Different context = different lighting/camera/weather, but same silhouette.

---

## 8. The rig generation pipeline

### End-to-end flow

```
1. PLAYER FINDS/ACQUIRES A RIG
   → Archetype selected (from story, trade, discovery)
   → Seed generated (deterministic variant)
   → RigDNA created (archetype + seed + empty passport)

2. RIG ENTERS A CONTEXT (episode, activity, contract)
   → Context defines: available capabilities, module pool, physics modifiers,
     camera contract, lighting, threat ecology, pressure mechanics
   → Capability reinterpretation applied (same verb, different meaning)
   → Module options generated (filtered by archetype + context + journey + mastery)

3. PLAYER CONFIGURES THE RIG
   → Modules installed/removed (concrete parts with provenance)
   → Tools adjusted (tire pressure, differential mode)
   → Effective profile computed (blueprint + modules = runtime)

4. RIG PLAYS THROUGH THE CONTEXT
   → Physics simulated (deterministic from profile + terrain)
   → Journey deeds recorded (append-only)
   → Mastery points accumulated (situation-weighted)
   → Condition/wear updated (deterministic from activity)
   → Passport updated (new entries, never retroactive)

5. RIG EXITS THE CONTEXT
   → Persistent consequences applied (scars, route changes, new obligations)
   → Save serialized (DNA + modules + passport + journey + mastery)
   → Rig ready for next context

6. RIG ENTERS A DIFFERENT CONTEXT
   → Same DNA, different context = different configuration
   → Modules re-filtered for new context
   → Capability reinterpretation applied for new context
   → Visual adaptation applied (lighting, camera, weather)
   → Rig identity persists (cab, chassis, repair history, emotional read)
```

### The guarantee

Same DNA + same context + same modules → same experience, forever.
Different context → different configuration, same identity.
Different seed → different variant, same archetype.
Different modules → different capabilities, same identity.
Different history → different passport, same rig.

---

## 9. What procedural generation actually produces

### Not this

- Infinite unique vehicle models (that's an asset pipeline problem)
- Random stats that break balance (that's a design failure)
- Generic vehicles with no identity (that's the opposite of the vision)

### This

- **Infinite variants within archetypes** (seed-based, bounded by archetype envelope)
- **Infinite configurations from modules** (context-driven, constrained by hardpoints and journey)
- **Infinite episodes from finite rules** (episode grammar, validated by coherence contract)
- **Infinite contexts for the same rig** (reinterpretation of capabilities, not reskinning)
- **Infinite histories from player actions** (journey deeds, mastery, passport entries)

### The content formula

```
11 archetype families
  × ∞ seed variants per family
  × 8 capability reinterpretations per context
  × 10+ context types
  × 20+ scene types
  × 15+ use-case types
  × journey phases (1–5)
  × mastery ranks (4)
  = functionally infinite rig configurations
```

But the player only experiences the ones they build through play. The system generates possibility space; the player generates specific rigs through their choices.

---

## 10. Risks specific to infinite-generation architecture

### Risk 1: Identity collapse

**Problem:** If every rig is procedurally generated, no rig feels special.

**Mitigation:** The archetype is authored and recognisable. The seed creates "my Torque-70 is different from yours" but both are recognisably Torque-70. The passport creates "this rig has been through things." Identity comes from history, not from randomness.

### Risk 2: Module proliferation

**Problem:** Infinite modules means infinite balance problems.

**Mitigation:** Modules are generated from templates, not freeform. Each template has bounded effects within the archetype envelope. The 10-point coherence contract validates every combination before activation. The module pool per context is curated, not infinite.

### Risk 3: Context incoherence

**Problem:** A tractor fighting zombies feels wrong.

**Mitigation:** The genre-transformation rules (8 criteria from the long-term design doc) validate every context shift:
1. The place remains recognizable.
2. Established rig verbs gain new meaning.
3. Player competence carries through.
4. The transformation has a diegetic cause.
5. Consequences survive its end.
6. Failure supports recovery or continuation.
7. The emotional shift is paced and previewed.
8. It deepens the game's purpose rather than advertising another genre.

### Risk 4: Persistence complexity

**Problem:** Infinite configurations make save/load fragile.

**Mitigation:** The save is DNA + modules + passport + journey + mastery. The DNA is deterministic (archetype + seed). The modules are serialized concrete objects. The passport is append-only. The journey and mastery are versioned. The save is small, deterministic, and reconstructible.

### Risk 5: Visual asset explosion

**Problem:** Every module × every context needs visual representation.

**Mitigation:** Start with **attachment points** (module is visible on the rig) and **silhouette changes** (module changes the rig's outline). Detailed visual consequences are a later polish pass. The first proof is one rig + one module + one visible attachment. The 3D asset pipeline (img2threejs) generates meshes from reference, not from code.

---

## 11. First proof slice (revised)

The earlier document proposed: 1 archetype, 2 variants, 1 part, 1 deed.

The revised proof must demonstrate **cross-context identity persistence:**

1. **One archetype** (Torque-70) with **one seed variant**.
2. **Two contexts** (farming and defense — dramatically different).
3. **Two module configurations** (plough for farming, brush guard for defense).
4. **One capability reinterpretation** (`plough` means "cultivate" in farming and "shape barriers" in defense).
5. **One journey deed** recorded in both contexts (different timestamps, same rig).
6. **One save/load round-trip** that preserves identity across both contexts.
7. **Visual confirmation** — same rig silhouette, different lighting/camera/attachments.

### What this proves

- Cross-context identity persistence works.
- Capability reinterpretation is coherent.
- Module configuration changes per context.
- Journey history accumulates across contexts.
- Save/load preserves everything.
- The rig is recognisable as the same character in both contexts.

### What this does NOT prove

- Infinite archetype families (that's authored work).
- Full module template system (that's content, not architecture).
- Full episode grammar (that's a separate decision).
- 3D asset pipeline (that's a separate decision).

---

## 12. The throughline (corrected)

> A rig is not a vehicle. It is a character that exists across infinite contexts.

The architecture supports this by:
1. **Authored archetypes** — identity is designed, not random.
2. **Procedural variants** — two players' rigs feel different.
3. **Context adaptation** — the same rig plays differently in different episodes.
4. **Capability reinterpretation** — the same verb means different things in different contexts.
5. **Concrete parts** — upgrades are physical objects with stories.
6. **Deterministic history** — the rig remembers what you did with it.
7. **Append-only progression** — history is immutable, upgrades are additive.
8. **VehiclePassport** — durable narrative identity across all contexts.
9. **Social footprint** — how the world perceives and reacts to the rig.
10. **Persistence guarantee** — saved rigs are complete, self-contained, reconstructible.

The procedural layer is **inside** the authored archetype constraints, **on top of** the persistence layer, and **below** the player agency layer. It creates infinite possibility space without creating chaos, identity without creating imbalance, and personalisation without creating instability.

**The content axis is surfaces and contexts (multiplicative), not vehicles (linear).** That is the irreversible insight that makes infinite rig generation possible without infinite asset production.

---

## Linked artifacts

- [Rig Generation, Evolution, and Persistence](./RIG_GENERATION_EVOLUTION_AND_PERSISTENCE_2026-08-05.md)
- [Vehicle Family Atlas and Canonical Spec](../exploration/VEHICLE_FAMILY_ATLAS_AND_CANONICAL_SPEC_2026-07-28.md)
- [Same Vehicle Mode Matrix](../exploration/SAME_VEHICLE_MODE_MATRIX_2026-07-26.md)
- [Same Vehicle Multi-Mode Atlas](../exploration/SAME_VEHICLE_MULTI_MODE_ATLAS_2026-07-26.md)
- [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
- [Long-Term Game Design from First Principles](../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
- [Wide Open Brainstorm Rigs Unbound](../exploration/WIDE_OPEN_BRAINSTORM_RIGS_UNBOUND_2026-07-27.md)
- [The Big Idea](../exploration/THE_BIG_IDEA_2026-07-26.md)
- [Tractor Restoration and Modular Growth](../exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md)
- [Parts and Favor Economy Spec](../exploration/PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md)
- [Episode Runner Spec](./EPISODE_RUNNER_SPEC_2026-07-27.md)
- [Procedural World Building Primer](./PROCEDURAL_WORLD_BUILDING_PRIMER_2026-08-05.md)
- [src/game/contracts.ts](../../src/game/contracts.ts)
- [src/game/rig-ids.ts](../../src/game/rig-ids.ts)
- [src/game/progression.ts](../../src/game/progression.ts)
- [src/game/activities.ts](../../src/game/activities.ts)
