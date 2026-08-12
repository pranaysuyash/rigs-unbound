# Rig Generation, Evolution, and Persistence — Design Exploration

**Date:** 2026-08-05
**Type:** Design exploration + architecture proposal
**Status:** This is a proposed design direction. It must be reviewed against the first-playable slice before implementation. It builds on existing contracts (Journey/Mastery/Insight, Parts/Favor economy, RigProfile/EffectiveRig architecture) rather than replacing them.
**Evidence tier:** Tier 1 static source and contract synthesis, plus design reasoning. No runtime commands run.
**Consumer (2026-08-12):** None yet. [Game Director Audit — 2026-08-12](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md) §4.4 names this doc (with its companion `RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md`) as scope expansion beyond the spine's current 3 hand-authored profiles, with no named consumer and nothing shipped against it — paused per [`NEXT_EXECUTION_BOARD_2026-08-12.md`](../plans/NEXT_EXECUTION_BOARD_2026-08-12.md) GD-13 until the first-playable slice ships and an explicit spine/ADR entry names what this unblocks. Content preserved unedited below.

---

## 1. The question

> We have rigs but we don't have actual assets. Rigs are supposed to be evolving, based on real/fantasy worlds. How do we do the rig generation so that each player can evolve theirs differently? Each game mode, unlocks, etc. are different. Saved ones stay saved and don't change across the game unless upgraded. How can procedural help here, or do we need to think of something else?

This is the make-or-break design question. The answer determines whether Rigs Unbound has the "machine-centric identity" its product vision requires, or collapses into generic vehicle-as-container.

---

## 2. Current state (what exists in code)

### Rigs in code

Three rigs defined in `src/game/rig-ids.ts`:
- `utility-tractor` — ground, plough/tow/rally
- `toy-buggy` — ground, tow/jump/rally
- `marsh-skimmer` — hover, tow/survey/hover/rally

Each has a static `RigProfile` in `contracts.ts` — an immutable blueprint with 30+ physics fields (enginePower, tireGrip, lugBonus, fordDepth, suspension, camera mounts, etc.).

### Effective rig (blueprint + modules)

`effectiveProfile(rigId, modules)` composes the base profile with installed modules:
- Modules apply **effects** (multiplicative) and **offsets** (additive)
- Modules can **grant capabilities** (winch → tow, survey-mast → survey, flotation-pontoons → ford)
- Returns a new object — never mutates the base profile
- Module slots scale with Journey phase (1–5)

### Six modules

| Module | Fits | Grants | Key effect |
|---|---|---|---|
| low-range-gearing | tractor, buggy | — | torque ×3.8, top speed ×0.86 |
| lug-tires | tractor, buggy | — | grip ×1.06, lugBonus +0.34 |
| winch | tractor, buggy | `winch` | towSpeed ×1.14 |
| survey-mast | tractor, buggy | `survey` | range +62m |
| skid-plate | tractor, buggy | — | landingTolerance ×1.7 |
| flotation-pontoons | tractor, buggy | `ford` | fordDepth +1.9m |

### Progression (per-rig)

- **Journey** — 6 phases (found → storied), investment + completed deeds. Determines module slots (1–5).
- **Mastery** — per-rig, per-capability skill. 4 ranks (novice → master). Gates what the rig can do in context.
- **Insight** — profile-level knowledge. Gates expedition/survey content.

### Economy

- **Scrap** — soft currency, repair/fabrication
- **Parts** — concrete objects with function/compatibility/condition/provenance/traits
- **Favor** — relationship state, unlocks access (never spent)
- **Insight** — knowledge, gates content

### What's missing

- The master catalog defines **36 vehicles across 6 categories**, each with 3 tiers (Found → Restored → Overcharged). Only 3 are in code.
- The 3 in code are static blueprints — no procedural variation.
- Parts are defined as a concept in the economy spec but not implemented as a concrete object system.
- The garage/fleet roster is a projection contract, not implemented.
- No chassis variation, no procedural parts, no evolution consequences.

---

## 3. The design space

### What "rig generation" could mean

| Interpretation | What it produces | Pros | Cons |
|---|---|---|---|
| **Generate entire rigs from scratch** | Unique chassis, wheels, body, hardpoints from a seed | Maximum variety, infinite fleet | Silhouette unrecognisable, balance nightmare, persistence fragile |
| **Generate variants within archetypes** | Same silhouette, different wheelbase/mass/hardpoints from a seed | Variety within recognisable identity, balanced, reconstructible | Less variety than full generation |
| **Generate parts from salvage** | Concrete modules with traits and provenance | Player-discovered upgrades, provenance stories | More serialization, need trait system |
| **Generate evolution consequences** | Unique visual/behavioral outcomes from player choices | Rigs feel personal, history shows | More asset variety needed, harder to QA |
| **Generate nothing, only choose** | Player picks from authored options | Total quality control, simple | No procedural variety, same rigs every time |

### The right interpretation

**All of them, in layers.** The rig is not one thing generated once. It is a stack of layers, each with a different generation character:

1. **Chassis archetype** — authored (36 vehicles). This is the identity. It does not change.
2. **Chassis variant** — procedural within archetype (seed-derived wheelbase, mass, hardpoint count). This creates "my Torque-70 is different from yours."
3. **Installed parts** — concrete objects from salvage, trade, crafting. This is what the player does to the rig.
4. **Evolution consequences** — procedural visual/behavioral outcomes from part installation. This is what the rig becomes.
5. **Journey history** — deterministic from player actions. This is what the rig has been through.

The procedural layer is **inside authored constraints**, exactly like terrain is procedural noise inside authored biome/site/route rules.

---

## 4. The architecture

### 4.1 Chassis archetype (authored, not procedural)

The master catalog already defines this. Each vehicle has:
- **Identity** — name, silhouette language, materials, visual character
- **Locomotion class** — ground (wheels/tracks) or hover (pontoons/fans)
- **Hardpoint schema** — which sockets exist (front, rear, roof, cargo), what categories of modules fit each
- **Base capabilities** — what the chassis can do without any modules
- **Tier progression** — v1 (Found), v2 (Restored), v3 (Overcharged)

**This is authored, not procedural.** The archetype defines the character. You don't proceduralise a tractor's identity.

### 4.2 Chassis variant (procedural within archetype)

Given an archetype, a **chassis seed** derives:
- Wheelbase variation (±10% of canonical)
- Mass distribution variation (±5% front/rear bias)
- Hardpoint count variation (e.g., one tractor has 2 front sockets, another has 3)
- Suspension tuning variation (softer/stiffer within archetype envelope)
- Visual variation (panel arrangement, weathering pattern, repair history)

**Why this matters:** Two players both find a Torque-70. One has a slightly longer wheelbase (better towing stability), the other has a front-heavy bias (better ploughing). Both are recognisably Torque-70, but they *feel* different. The seed ensures: same archetype + same seed → same variant, forever.

**Storage:** archetype ID + seed. Reconstruction: re-derive the variant from the seed. No need to serialize the variant separately.

### 4.3 Installed parts (concrete objects, not procedural)

Parts are **concrete inventory objects** with:
- `function` — what verb or stat it affects
- `compatibility` — which rig/socket it fits
- `condition` — wear state affecting performance
- `provenance` — where it came from (salvage ID, NPC, trade, crafted)
- `traits` — optional modifiers (lightweight, rugged, salvaged, standard, strange)

**Parts are not procedural in the "random" sense.** They are deterministic consequences of specific activities:
- Salvage a wrecked seed-runner → get a cracked hopper (condition 42%, provenance: "salvaged from Field 07 seed-runner wreckage")
- Craft at workshop → get a standard winch assembly (condition 100%, provenance: "fabricated at Home Silo workshop")
- Trade with NPC → get a rugged plough blade (condition 87%, provenance: "traded from Meadow Workshop")

**Storage:** the part is serialized as a concrete object (function, compatibility, condition, provenance, traits). It persists exactly as saved. This is the "saved ones stay saved" guarantee.

### 4.4 Evolution consequences (procedural outcomes of player choices)

When a part is installed on a chassis variant, the game generates:
- **Visual consequences** — where the part mounts, how it changes the silhouette, weathering/patch marks
- **Behavioral consequences** — how the physics profile changes (already handled by `effectiveProfile`)
- **Narrative consequences** — what the rig's journey record says about this modification

**The procedural part is the visual/narrative consequence, not the physics.** Physics is deterministic (effects/offsets from the module definition). Visual consequences are generated from the chassis variant + part combination — e.g., a plough mounted on a front-heavy tractor produces different panel wear than on a rear-heavy one.

**Why this matters:** The rig's visual history is unique to that player's choices. The same module on different chassis variants produces different visual outcomes. This is what makes "my tractor" feel personal.

### 4.5 Journey history (deterministic from player actions)

Journey state is already defined:
- 6 phases (found → storied)
- Investment (number) + completed deeds (list)
- Module slots scale with phase

**The procedural part is the "deeds" list.** Each deed is a record of what the player did with the rig:
- "First ploughed the Long Furrow" (milestone deed)
- "Towed the Wrecker-One out of the Mud Flats" (rescue deed)
- "Surveyed the Sunken Flats in a storm" (survey deed)
- "Lost a wheel on the Ridge Road" (failure deed)

**These deeds are deterministic consequences of specific activities, not random.** But they accumulate uniquely per rig, creating a unique journey history.

**Storage:** deeds are serialized as part of `RigJourneyState`. They persist exactly as saved.

---

## 5. How procedural generation helps

### Where it helps

| Layer | What it generates | How it helps | Why it's safe |
|---|---|---|---|
| Chassis variant | Wheelbase, mass, hardpoints from seed | Two players' Torque-70s feel different | Seed is deterministic, archetype constrains variation |
| Part traits | Condition, provenance, traits from activity | Parts feel discovered, not bought from a catalog | Activity is deterministic, traits are bounded |
| Visual consequences | Panel wear, patch marks, silhouette changes from part+chassis | Rig's visual history is unique | Consequences are deterministic from chassis+part |
| Journey deeds | Deed records from activities | Rig's history is unique | Activities are deterministic |

### Where it does NOT help

| Layer | Why not | What to do instead |
|---|---|---|
| Chassis archetype | Identity must be authored and recognisable | Author 36 archetypes in the master catalog |
| Module compatibility | Rules must be explicit and testable | Author module definitions in code |
| Journey phases | Milestones must be designed and tested | Author 6 phases with thresholds |
| Capability gates | Gameplay rules must be authored | Author 8 capabilities and their contexts |
| Balance | Must be tuned by design, not randomness | Author physics envelopes per archetype |

### The key insight

**Procedural generation is for *variety within constraints*, not for *identity*.** The rig's identity comes from its archetype (authored), its history (player-driven), and its parts (activity-driven). Procedural generation creates *unique variants within those identities*, not the identities themselves.

---

## 6. Chassis generation — the missing piece

### What needs to be built

A `ChassisVariant` system that derives unique physical characteristics from a seed, constrained by the archetype:

```typescript
interface ChassisDNA {
  archetypeId: string;          // e.g., "torque-70"
  seed: string;                 // deterministic variant seed
  wheelbase: number;            // ±10% of canonical
  frontBias: number;            // 0.45–0.55 (mass distribution)
  hardpointSlots: HardpointSlot[];  // derived from archetype + seed
  suspensionBase: number;       // ±15% of canonical stiffness
  visualSeed: number;           // for panel arrangement, weathering
}

interface HardpointSlot {
  id: string;
  location: "front" | "rear" | "roof" | "cargo";
  category: ModuleCategory;     // which module types fit
  orientation: number;          // mounting angle
}
```

### How it works

1. Player finds a rig (or acquires one through story/trade)
2. The rig gets a `ChassisDNA` record: archetype + seed
3. The seed derives all variant characteristics
4. `effectiveProfile()` now takes `ChassisDNA` instead of just `RigId` — it uses the variant's wheelbase, mass distribution, hardpoint count, etc.
5. Module compatibility checks the hardpoint slots (not just the archetype)

### Persistence

- ChassisDNA is serialized as part of `RigState`
- Reconstruction: re-derive variant from seed + archetype
- The seed never changes unless the player explicitly "overhauls" the chassis (a major upgrade event)

### The guarantee

Same archetype + same seed → same variant, forever. Different seeds → different variants, forever. The variation is bounded by the archetype envelope (±10% wheelbase, etc.), so balance is preserved.

---

## 7. Part generation — salvaged, crafted, traded

### What needs to be built

A `Part` concrete object system that the economy spec already defines:

```typescript
interface Part {
  id: string;                    // unique instance ID
  function: PartFunction;        // what it does
  compatibility: PartCompatibility;  // which rigs/sockets
  condition: number;             // 0–100
  provenance: ProvenanceRecord;  // where it came from
  traits: PartTrait[];           // optional modifiers
  mountHistory: MountEvent[];    // which rigs it's been on
}

type PartTrait = "lightweight" | "rugged" | "salvaged" | "standard" | "strange" | "precision" | "field-repaired";

interface ProvenanceRecord {
  source: "salvage" | "craft" | "trade" | "story" | "gift";
  location?: string;             // where acquired
  npc?: string;                  // who gave/traded it
  timestamp?: number;            // game-time acquired
  description?: string;          // flavour text
}
```

### How parts are generated

Parts are **not randomly generated.** They are deterministic consequences of specific activities:

| Activity | Part generated | Traits | Provenance |
|---|---|---|---|
| Salvage a wrecked rig | Component matching the wreck's archetype | salvaged, condition 40–70% | "salvaged from [location] [rig-type] wreckage" |
| Craft at workshop | Standard component for the recipe | standard, condition 100% | "fabricated at [workshop]" |
| Trade with NPC | NPC's offered component | varies, condition 60–90% | "traded from [NPC] at [location]" |
| Story reward | Unique component for the story | story-specific traits, condition 80–100% | "rewarded for [story-deed]" |
| Discovery | Strange component from exploration | strange, condition varies | "discovered at [location]" |

### What "strange" parts are

Strange parts are **procedurally varied within authored constraints:**

```typescript
interface StrangePart extends Part {
  traits: ["strange", ...PartTrait[]];
  effectOverrides: Partial<ModuleEffects>;  // unusual stat modifications
  visualSignature: string;                   // for renderer
}
```

A "strange" part might have:
- An unusual effect combination (high torque + low grip, or survey range + jump impulse)
- A visual signature (glowing seam, unusual material, non-standard mounting)
- A provenance that tells a story ("found in the sealed section of the Quarry bore")

**The constraint:** strange parts must still pass the same validation gates as standard parts (schema, capability compatibility, world probe, resource budget). They cannot create impossible combinations or break the game.

### Persistence

Parts are serialized as concrete objects in `GameState.partsBin` or on the rig. They persist exactly as saved. Condition degrades with use (already handled by `vehicle-maintenance.ts`). Mount history records which rigs the part has been on.

---

## 8. Evolution system — player-driven divergence

### The three axes (already defined)

| Axis | What it tracks | How it evolves |
|---|---|---|
| **Journey** | Per-rig restoration history | Investment + deeds advance through 6 phases |
| **Mastery** | Per-rig, per-capability skill | Situation-weighted events accumulate points |
| **Insight** | Profile-level knowledge | Discovery, surveying, experimentation |

### How rig identity diverges across players

Player A finds a Torque-70 and:
1. Ploughs the Long Furrow → journey deed "first-plough", +mastery for plough
2. Tows a stranded buggy → journey deed "first-tow", +mastery for tow
3. Installs low-range-gearing → module slot consumed, torque increased
4. Discovers the Sunken Flats → +insight

Player B finds a Torque-70 and:
1. Tows a cargo relay → journey deed "first-tow", +mastery for tow
2. Surveys the Ridge Road → journey deed "first-survey", +mastery for survey
3. Installs survey-mast → module slot consumed, survey range increased
4. Discovers the Quarry → +insight

After one session, Player A's tractor is a **ploughing-focused workhorse** and Player B's tractor is a **survey-focused scout.** Both are recognisably Torque-70, but they have different:
- Journey deeds (different history)
- Mastery ranks (different skills)
- Installed modules (different capabilities)
- Visual consequences (different panel wear from different activities)

### How game modes affect evolution

Game modes are a **policy layer on top of the canonical rig state.** They constrain what's possible, not what's real.

| Mode | Chassis pool | Module availability | Journey gating | Mastery weighting |
|---|---|---|---|---|
| **Campaign** | Story-ordered (tractor first, then buggy, then skimmer) | Modules come from stories and characters | Story milestones unlock phases | Standard |
| **Expedition** | All archetypes discoverable | Modules come from exploration and salvage | Discovery milestones unlock phases | Exploration-weighted |
| **Salvage** | All archetypes purchasable/tradeable | Modules come from trade and crafting | Economy milestones unlock phases | Economy-weighted |
| **Challenge** | Pre-selected archetypes | Limited module pool | Constraint-based milestones | Skill-weighted |

**The rig identity (archetype + seed + parts + journey + mastery) is the same across modes.** The mode constrains what the player can *do* with the rig, not what the rig *is*.

### How upgrades work

An upgrade is a **state transition** that changes the rig's configuration:

| Upgrade type | What changes | What persists | What stays the same |
|---|---|---|---|
| **Install module** | New capability or stat adjustment | Module in slot, condition starts at 100% | Archetype, seed, journey, mastery |
| **Remove module** | Lose capability/stat | Module returns to inventory with wear | Archetype, seed, journey, mastery |
| **Repair component** | Restore condition | Component health improves | Everything else |
| **Overhaul chassis** | Major reconfiguration | New seed (variant changes), archetype stays | Archetype, journey, mastery |
| **Replace part** | New function/trait | New part installed, old part returned | Everything else |

**The critical rule:** upgrades are **additive or corrective, never regressive.** Installing a module adds a capability. Removing a module removes it. Repairing restores condition. The rig never *loses* journey history or mastery from an upgrade. The "saved ones stay saved" guarantee is absolute.

---

## 9. Persistence — the full picture

### What gets saved

```
RigState = {
  // Identity (archetype + variant)
  id: RigId,
  archetypeId: string,
  chassisDNA: ChassisDNA,           // seed-derived variant

  // Configuration (parts and modules)
  modules: ModuleId[],
  installedParts: Part[],            // concrete objects with provenance
  tools: RigToolState,

  // Runtime state
  x, y, z, heading, pitch, roll, speed, steering,
  condition, strain,
  componentHealth: ComponentHealthState,
  mobility: RigMobilityState,
  telemetry: { surfaceId, grade, grip, slip, ... },

  // History (deterministic from player actions)
  journey: RigJourneyState,         // phase, investment, deeds
  mastery: Partial<Record<RigCapability, MasteryState>>,
  distanceTravelled: number,
}
```

### What never changes without player action

- `archetypeId` — the rig's identity. Never changes.
- `chassisDNA.seed` — the variant. Changes only on major overhaul.
- `journey.completedDeeds` — history is append-only.
- `mastery.situations` — skill is append-only (points can't be un-earned).
- `installedParts` — parts persist until the player removes them.

### What changes with player action

- `modules` — installed/removed at workshop
- `installedParts` — added/removed with modules
- `componentHealth` — degrades with use, restored with repair
- `condition` — overall health, affected by damage and repair
- `tools` — tire pressure, differential mode (adjusted in field)
- `journey.investment` — increases with activity completion
- `journey.phase` — advances when investment + deeds meet threshold

### What changes with game events (but is deterministic)

- `x, y, z, heading` — position from driving
- `speed, steering` — physics state
- `telemetry` — terrain response
- `mobility` — ground/hover state

### The guarantee

A saved rig is a complete, self-contained record. Loading it reconstructs the exact same rig — same identity, same variant, same parts, same history, same skills. The only thing that changes is runtime state (position, speed, telemetry), which is reconstructed from the save + current terrain.

---

## 10. Risks and mitigations

### Risk 1: Chassis variant imbalance

**Problem:** A seed could produce an unplayable variant (e.g., too front-heavy to steer).

**Mitigation:** Variant bounds are tight (±10% wheelbase, ±5% mass bias). The archetype envelope is authored and tested. A variant within the envelope is always playable. A "malfunctioning" variant is a story hook, not a balance failure.

### Risk 2: Part proliferation

**Problem:** Too many parts with too many traits creates an overwhelming inventory.

**Mitigation:** Start with 3–5 distinct parts in the first loop (already specified in the economy spec). Add parts only when the game has enough content to make each part meaningful. The "small and legible" constraint from the economy spec applies here.

### Risk 3: Visual consequence complexity

**Problem:** Every part+chassis combination needs a visual outcome, which is an asset explosion.

**Mitigation:** Start with **attachment points** (part is visible on the rig) and **silhouette changes** (part changes the rig's outline). Detailed visual consequences (panel wear, patch marks) are a later polish pass. The first proof is one rig + one part + one visible attachment.

### Risk 4: Persistence drift

**Problem:** A code update changes how variants are derived, breaking saved rigs.

**Mitigation:** ChassisDNA is versioned. A variant derivation function must be pinned to the version. When the derivation changes, saved rigs with old versions are migrated or rejected at load time. This is the same pattern as the save/migration observability contract.

### Risk 5: Mode-specific balance

**Problem:** A module that's balanced in Campaign mode is broken in Challenge mode.

**Mitigation:** Game modes are policy layers that constrain module availability, not modify module effects. If a module is too strong in Challenge mode, it's excluded from the Challenge pool — its effects are not changed. This keeps the module definition canonical.

---

## 11. First proof slice

The smallest durable proof that this architecture works:

1. **One chassis archetype** (Torque-70) with **two seed variants** (player A and player B get different wheelbase/mass/hardpoints).
2. **One part** (plough blade) with **two provenance paths** (salvaged vs crafted — different condition and traits).
3. **One module slot** (front hardpoint) — both variants accept the plough, but the mounting position and visual attachment differ by variant.
4. **One journey deed** ("first-plough") — recorded on both rigs, different timestamps.
5. **Save/load round-trip** — both rigs save, load, and reconstruct identically.
6. **Visual confirmation** — both rigs look recognisably like Torque-70 but have different silhouettes (wheelbase, part mounting).

### What this proves

- Chassis variant generation works and is deterministic.
- Part serialization works and persists.
- Module mounting works on different variants.
- Journey history is unique per rig.
- Save/load preserves everything.
- Visual identity is recognisable but variant.

### What this does NOT prove

- Full 36-vehicle catalog (that's authored work, not architecture).
- Full module/parts inventory (that's content, not architecture).
- Game mode policy layers (that's a separate decision).
- Visual consequence polish (that's a later pass).

---

## 12. Decision map

| Decision | Recommendation | Rationale |
|---|---|---|
| Full rig generation vs variant generation | **Variant within archetype** | Identity must be authored; variety is procedural inside constraints |
| Procedural parts vs authored parts | **Deterministic from activity** | Parts are discovered/crafted/traded, not randomly generated |
| Strange parts | **Constrained procedural** | Authored trait system + validation gates, not freeform |
| Chassis seed persistence | **Serialize ChassisDNA** | Deterministic reconstruction, versioned for migration |
| Part persistence | **Serialize concrete objects** | Parts are inventory objects with provenance, not derived values |
| Journey persistence | **Append-only deeds** | History is immutable; investment is additive |
| Game mode policy | **Constraint layer, not effect modification** | Module effects are canonical; modes exclude, not nerf |
| First proof | **1 archetype, 2 variants, 1 part, 1 deed** | Smallest durable proof of the full architecture |

---

## 13. What this means for the 36-vehicle catalog

The master catalog defines 36 vehicles across 6 categories. The architecture above means:

- Each vehicle is an **authored archetype** (silhouette, locomotion, hardpoints, materials, tiers).
- Each vehicle gets a **variant system** (seed-derived physical characteristics within archetype bounds).
- Each vehicle has **3 authored tiers** (v1 Found, v2 Restored, v3 Overcharged) — these are visual/state milestones, not procedural.
- The player's rig evolves through the tiers by **journey progression + part installation**, not by "leveling up."
- Different players' Torque-70s at the same tier look recognisably similar but have different variants, parts, and histories.

**The catalog is authored work. The variant system is architecture. They are separate decisions.** Do not proceduralise the catalog; proceduralise the variation within it.

---

## 14. The throughline

> A rig is not a stat block. It is a machine with a history.

The architecture supports this by:
1. **Authored archetypes** — identity is designed, not random.
2. **Procedural variants** — two players' rigs feel different.
3. **Concrete parts** — upgrades are physical objects with stories.
4. **Deterministic history** — the rig remembers what you did with it.
5. **Append-only progression** — history is immutable, upgrades are additive.
6. **Mode policy** — different modes constrain possibilities, not identity.
7. **Persistence guarantee** — saved rigs are complete, self-contained, reconstructible.

The procedural layer is **inside** the authored constraints, **on top of** the persistence layer, and **below** the player agency layer. It creates variety without creating chaos, identity without creating imbalance, and personalisation without creating instability.

---

## Linked artifacts

- [Master Vehicle Catalog](../exploration/MASTER_VEHICLE_CATALOG.md)
- [Tractor Restoration and Modular Growth](../exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md)
- [Parts and Favor Economy Spec](../exploration/PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md)
- [Progression Model Coexistence and Composition](../exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md)
- [Garage Fleet Roster Spec](./GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md)
- [Core Loop and Progression Contract](./CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)
- [Rig Capability Vocabulary Decision](./RIG_CAPABILITY_VOCABULARY_DECISION_2026-07-26.md)
- [Rig Signature and Feedback Emission Contract](./RIG_SIGNATURE_AND_FEEDBACK_EMISSION_CONTRACT_2026-07-26.md)
- [Procedural World Building Primer](./PROCEDURAL_WORLD_BUILDING_PRIMER_2026-08-05.md)
- [src/game/contracts.ts](../../src/game/contracts.ts)
- [src/game/rig-ids.ts](../../src/game/rig-ids.ts)
- [src/game/progression.ts](../../src/game/progression.ts)
- [src/game/vehicle-maintenance.ts](../../src/game/vehicle-maintenance.ts)
