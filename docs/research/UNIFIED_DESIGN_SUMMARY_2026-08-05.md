# Unified Design Summary — Rigs Unbound Foundational Systems

**Date:** 2026-08-05
**Status:** synthesis of exploration work; not an accepted ADR
**Purpose:** single entry point to all foundational design exploration from this session

---

## What this document is

This is a consolidated cross-reference of 7 exploration documents produced on 2026-08-05. It resolves contradictions, creates explicit links, and produces a single reference for anyone starting work on Rigs Unbound's core systems. Each section links back to the full exploration doc for depth.

**Read this first. Then read the linked docs for implementation detail.**

---

## 1. The core question

The project has 3 rigs, a seeded world, and a rendering pipeline — but no infinite possibilities, no meaningful context switching, no runtime episode lifecycle, no module management system, no asset generation pipeline, and no inhabitants. This session explored how to fill those gaps.

### Design questions addressed

| Question | Document | Answer |
|----------|----------|--------|
| Q1: Can a machine become an extension of self? | First Playable Slice | Prove through harvest completion |
| Q2: Can useful work be pleasurable? | First Playable Slice | Prove through terrain deformation + weather pressure |
| Q3: Can a place create motive? | NPC and Community | Prove through Sava Nune's harvest need |
| Infinite rig possibilities | Rig Generation + Asset Pipeline | 3-layer architecture + GenAI pipeline |
| One rig across contexts | Context Switching | Place-driven with capability reinterpretation |
| Episode lifecycle | Episode Runtime | 5-phase with bounded director |
| Physical rig modification | Module System | Hardpoint attachment + capability grants |

---

## 2. The system map

```text
                    ┌─────────────────────┐
                    │   INFINITE RIGS     │
                    │  (3-layer arch)     │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼────────┐ ┌───▼────┐ ┌────────▼────────┐
    │  ASSET PIPELINE  │ │ MODULE │ │  CONTEXT        │
    │  (GenAI hybrid)  │ │ SYSTEM │ │  SWITCHING      │
    └─────────┬────────┘ └───┬────┘ └────────┬────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                    ┌─────────▼───────────┐
                    │  EPISODE RUNTIME    │
                    │  (5-phase lifecycle)│
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  NPC / COMMUNITY    │
                    │  (place-bound needs)│
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  FIRST PLAYABLE     │
                    │  SLICE              │
                    │  ("First Harvest")  │
                    └─────────────────────┘
```

---

## 3. Infinite rig possibilities

**Doc:** [Rig Generation for Infinite Possibilities](RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)

### The 3-layer architecture

1. **Archetype DNA** — immutable identity per rig family (chassis type, locomotion profile, silhouette grammar)
2. **Variant Layer** — procedural variation within archetypes (color, proportions, module slots, personality)
3. **Context Adaptation** — same rig reads differently in different places

### Key insight

Infinite possibilities come from composing archetype DNA + variant layer + context adaptation, not from generating every rig from scratch. The 36-vehicle master catalog is a starting vocabulary, not a ceiling.

### What this does NOT need

- No infinite procedural mesh generation (too expensive for browser)
- No full-body customization (too complex for v1)
- No physics simulation of every possible configuration (too slow)

---

## 4. Asset pipeline

**Doc:** [Asset Pipeline for Infinite Rigs](ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md)

### The hybrid approach

| Layer | Tool | Purpose |
|-------|------|---------|
| Generation | Tripo P1, Meshy 6 | Create base meshes from text/image |
| Refinement | Blender MCP | Fix topology, add details |
| Texturing | Meshy AI Textures | Generate PBR materials |
| Sound | ElevenLabs, Stable Audio | Generate engine/impact sounds |
| Validation | Claude/Opus | Orchestrate pipeline, validate output |

### Critical constraint

GLB/glTF is the canonical runtime format. No other format enters the runtime. All generation pipelines must output GLB.

### Proof slice

Generate 3 variant tractor meshes from the same archetype DNA. Validate they share silhouette family, have correct hardpoint locations, and render at <50K triangles each.

---

## 5. Context switching

**Doc:** [Context Switching Mechanic](CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)

### The place-driven model

The rig inherits context from where it is. No explicit mode switching. No menu selection. The world graph determines what verbs are available.

### Capability reinterpretation

Same verb, different meaning per context:

| Verb | Farming | Defense | Racing |
|------|---------|---------|--------|
| plough | cultivate soil | shape defensive lanes | clear debris |
| tow | haul crops | reposition defenses | draft behind |
| shield | protect crops | block attackers | reduce drag |

### What this replaces

- No "mode select" menu
- No "context switch" button
- No separate game modes
- No loading screens between contexts

### What remains

- The rig's identity persists across all contexts
- Module attachments carry over
- History and memory persist
- The player's skill transfers

---

## 6. Episode runtime

**Doc:** [Episode Runtime Architecture](EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md)

### 5-phase lifecycle

```text
Proposal → Activation → Execution → Climax → Resolution
```

1. **Proposal** — episode offered to player (spatial discovery, not menu)
2. **Activation** — player commits, pressure begins
3. **Execution** — bounded director adjusts pressure, spawns events
4. **Climax** — peak pressure, decisive moment
5. **Resolution** — outcome applied, memory updated, access changed

### The director

A bounded, deterministic system that:
- Adjusts pressure based on player performance
- Seeds discoveries (salvage, shortcuts, secrets)
- Spawns events (weather shifts, obstacles, opportunities)
- Never overrides player agency
- Never generates content outside authored rules

### What this replaces

- No infinite procedural quests
- No random event spam
- No difficulty scaling that feels arbitrary
- No "mission complete" screens

---

## 7. Module system

**Doc:** [Module System Mechanics](MODULE_SYSTEM_MECHANICS_2026-08-05.md)

### Hardpoint-based attachment

Modules attach to physical hardpoints on the rig. Each hardpoint has:
- A location (front, rear, sides, top)
- A type (utility, weapon, sensor, mobility)
- A size class (small, medium, large)

### Capability grants and tradeoffs

Every module grants capabilities and imposes tradeoffs:
- **Grants**: new verbs, enhanced stats, special abilities
- **Tradeoffs**: weight, energy drain, maintenance cost, silhouette change

### Context-dependent effectiveness

A module's effectiveness changes per context:
- Plow module: high in farming, medium in defense, low in racing
- Shield module: high in defense, medium in farming, low in racing
- Engine boost: high in racing, medium in exploration, low in farming

### Workshop management

Modules are swapped at the workshop, not in the field. Field swapping is an earned capability (late-game).

---

## 8. NPC and community

**Doc:** [NPC and Community System](NPC_AND_COMMUNITY_SYSTEM_2026-08-05.md)

### Design principles

1. **NPCs are machines with agency**, not people with dialogue trees
2. **NPCs are place-bound** — they inhabit, not roam
3. **NPCs have needs, not quests** — observable, not marker-based
4. **NPCs remember** — every interaction leaves a trace

### Communication

- Visual cues (broken equipment, ready crops)
- Environmental cues (dark lights, stopped machines)
- Radio traffic (short functional messages)
- Field notes (written on Contracts board)
- Spatial presence (NPC near the need)

### First slice needs

- One NPC: Sava Nune (grower)
- One need: harvest south field before storm
- One response: acknowledgment if successful
- One memory: Sava remembers the player's action
- One access change: Sava offers more work if trusted

---

## 9. First playable slice

**Doc:** [First Playable Slice Plan](FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md)

### "First Harvest"

Torque-70 harvests a field before a storm arrives. 12-day implementation plan.

### What it validates

- **Q1**: Can a machine become an extension of self? (rig movement + module attachment)
- **Q2**: Can useful work be pleasurable? (terrain deformation + weather pressure)

### What it does NOT validate

- Infinite rig generation (that's a separate proof)
- Context switching (that's a separate proof)
- Full NPC system (that's a separate proof)
- Multiplayer (that's a separate proof)

### Implementation order

1. Rig movement and controls (days 1-2)
2. Module attachment system (days 3-4)
3. Terrain deformation (cultivate) (days 5-6)
4. Weather pressure system (days 7-8)
5. Storm arrival and consequence (days 9-10)
6. NPC response and memory (days 11-12)

---

## 10. Contradictions resolved

### "36 vehicles" vs "infinite possibilities"

The master catalog defines 36 vehicles. The vision demands infinite possibilities. Resolution: the 36 are archetype DNA, not a ceiling. The variant layer and context adaptation create infinite permutations within each archetype.

### "Procedural generation" vs "authored content"

The world is procedurally generated from a seed, but key locations are authored. Resolution: "procedural inside authored rules" (ADR-0007). The generator fills space between authored anchors; it never replaces them.

### "Mode switching" vs "context switching"

The same vehicle mode matrix defines 10 modes. But the vision says no mode menus. Resolution: context switching is place-driven, not menu-driven. The rig inherits context from location, not from player selection.

### "Dialogue trees" vs "communication"

NPCs need to communicate needs. But the vision says no dialogue trees. Resolution: NPCs communicate through visual/environmental cues and radio beats — functional, not conversational.

---

## 11. What's next

### Immediate (first playable slice)

1. Implement "First Harvest" — the 12-day plan
2. Prove Q1 and Q2 with player evidence
3. Get external playtest feedback

### Near-term (after first slice)

1. Add second context (defense or racing) to prove context switching
2. Add second NPC to prove community memory
3. Add second module type to prove hardpoint system

### Medium-term (after second slice)

1. Prove infinite rig generation with 3 archetype variants
2. Prove GenAI pipeline with 3 generated meshes
3. Prove episode runtime with 3 different episodes

---

## 12. Cross-references

| Document | Depends on | Produces for |
|----------|------------|--------------|
| Rig Generation | Master Catalog, Capability Model | Asset Pipeline (input), Module System (input) |
| Asset Pipeline | Rig Generation (archetype DNA), GLB/glTF format | First Playable (meshes), Context Switching (variants) |
| Context Switching | World Graph, Episode Runtime | First Playable (location-based verbs) |
| Episode Runtime | Context Switching, Module System | First Playable (pressure system) |
| Module System | Hardpoint Definitions, Capability Model | First Playable (module attachment) |
| NPC/Community | Parts & Favor Economy, Dialogue Surface | First Playable (Sava Nune) |
| First Playable | ALL of the above | Player evidence for Q1, Q2, Q3 |

---

## 13. Status summary

| System | Status | Next evidence |
|--------|--------|---------------|
| Rig Generation | Proposed | 3 archetype variants |
| Asset Pipeline | Proposed | 3 generated meshes |
| Context Switching | Proposed | 2-context demo |
| Episode Runtime | Proposed | 3 episode types |
| Module System | Proposed | 2 module types |
| NPC/Community | Proposed | 1 NPC, 1 need |
| First Playable | Proposed | "First Harvest" implementation |

---

## Linked artifacts

- [Rig Generation for Infinite Possibilities](RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)
- [Asset Pipeline for Infinite Rigs](ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md)
- [Context Switching Mechanic](../exploration/CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- [Episode Runtime Architecture](../exploration/EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md)
- [Module System Mechanics](../exploration/MODULE_SYSTEM_MECHANICS_2026-08-05.md)
- [NPC and Community System](../exploration/NPC_AND_COMMUNITY_SYSTEM_2026-08-05.md)
- [First Playable Slice Plan](../exploration/FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md)
- [Rig Generation, Evolution, and Persistence](RIG_GENERATION_EVOLUTION_AND_PERSISTENCE_2026-08-05.md)
- [Procedural World Building Primer](PROCEDURAL_WORLD_BUILDING_PRIMER_2026-08-05.md)
- [Procedural World Building Deep Dives](PROCEDURAL_WORLD_BUILDING_DEEP_DIVES_2026-08-05.md)
- [Master Vehicle Catalog](../exploration/MASTER_VEHICLE_CATALOG.md)
- [Game Design Spine](../design/GAME_DESIGN_SPINE.md)
- [Long-Term Game Design](../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
