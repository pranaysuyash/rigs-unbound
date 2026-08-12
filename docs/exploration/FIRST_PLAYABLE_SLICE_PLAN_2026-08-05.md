# First Playable Slice Plan — What to Build First

**Date:** 2026-08-05
**Status:** design exploration; not an accepted ADR
**Evidence tier:** Tier 1 synthesis of all exploration docs, existing code, and design-question roadmap
**Depends on:** All four exploration documents (Context Switching, Episode Runtime, Module System, Asset Pipeline)

## Addendum (2026-08-12) — this document's "First Harvest" proposal was not adopted; do not read it as current status

Flagged by [Game Director Audit — 2026-08-12](../../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md)
GD-11 and [NEXT_EXECUTION_BOARD_2026-08-12.md](../../plans/NEXT_EXECUTION_BOARD_2026-08-12.md).
Two corrections, preserved here rather than silently edited into the body
below (decisions register's change protocol, applied to a non-ADR doc):

1. **The canonical first playable is "The Road That Was"**, not "First
   Harvest." [`GAME_DESIGN_SPINE.md`](../design/GAME_DESIGN_SPINE.md) §10
   and [`FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)
   were accepted via ADR-0040 on 2026-07-29 — **a week before this
   document's own date**. This document's §4 "First Harvest" ("Torque-70"
   wakes in "Patchwork Vale," harvests the south field before a storm) is a
   parallel, unreconciled alternative that does not mention the already-
   accepted slice at all. It was never adopted; the "Road That Was" slice is
   the one in active implementation (see the execution board's GD-01
   through GD-05).
2. **§2's "Not yet working" list is now stale regardless of which slice is
   canonical.** A real "Long Furrow harvest before the storm" mechanic
   already exists in the shipped game (`GameState.harvest`,
   `createInitialState` in `src/game/state.ts`) — part of the adopted "Road
   That Was" slice's economy, and distinct from (predates) this document's
   own same-named "First Harvest" proposal. Readers should not infer
   current runtime status from this document's §2 table; check
   `npm run audit:reachability` and the execution board instead.

This document's design reasoning (Q1-Q5 alignment, slice-sizing questions in
§9) may still be useful reference material for a *future* slice — it is
preserved, not deleted — but it is not describing the game as currently
built or planned.

---

## 1. The problem this solves

The project has extensive design exploration but needs a concrete, buildable first slice that proves the core loop works end-to-end. Without this, design remains theoretical and implementation has no focused target.

The first playable slice must:
- Be buildable with existing tools and code
- Prove the core fantasy (one rig, meaningful work, persistent consequence)
- Validate the highest-risk design assumptions
- Create a playable experience that can be tested with real players
- Be small enough to complete in a focused sprint

---

## 2. What already exists in code

### Working systems
- Terrain generation (heightmap + vertex colors, seeded procedural)
- Basic rig movement (Torque-70, physics-based driving)
- Activity binding (haul, survey, rally)
- Day/night cycle
- Basic UI shell (loading, save, quality, notifications)
- Asset pipeline (manifest, preflight, GLB loading)
- Progression kernel (Journey, Mastery, Insight)
- World schema (WORLD_RADIUS=250, surfaces, biomes, sites, routes)

### Not yet working
- Episode runtime (designed, not implemented)
- Module system (designed, not implemented)
- Context switching (designed, not implemented)
- Fleet coordination (designed, not implemented)
- Full asset pipeline (only 2 GLBs in runtime)

---

## 3. Design-question alignment

The first playable should answer the highest-priority design questions from `docs/exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`:

| Question | What it asks | What the slice must prove |
|---|---|---|
| Q1: Can one machine become emotionally owned? | Players describe rig through personality, not stats | Rig feels like a character, not a vehicle |
| Q2: Can useful work be intrinsically pleasurable? | Players repeat work without rewards | Moving and using the rig is satisfying |
| Q3: Can a place create motive? | Beneficiary and consequence matter | The place has needs that matter |
| Q4: Can one complication create an authored story? | Player improvises, result persists | Failure creates memorable moments |
| Q5: Does a second rig deepen the same world? | Switching feels like inhabiting another body | Fleet adds strategy, not administration |

**The first slice should primarily answer Q1 and Q2.** Q3-Q5 can be partially addressed but are not the primary validation target.

---

## 4. The recommended first slice: "First Harvest"

### 4.1 Premise

Torque-70 (the starter rig) wakes in Patchwork Vale. One field needs harvesting before the storm arrives. The player must cultivate, haul, and deliver the harvest — or lose it.

### 4.2 What the player experiences

```text
1. WAKE UP
   - Torque-70 sits in a field
   - Morning light, birds, wind in crops
   - One objective: harvest the south field before the storm
   - The rig feels tactile, vulnerable, intriguing

2. PREPARE
   - Drive to the field (learn steering, momentum, terrain)
   - Attach plow (first module interaction)
   - Plow the field (cultivate verb, visible soil change)
   - Notice the sky darkening (pressure building)

3. WORK
   - Haul crops to the barn (load, balance, route choice)
   - The storm approaches (rain, wind, visibility drops)
   - The field becomes harder to navigate (mud, slippery)
   - Choose: rush and risk damage, or slow and lose some crops

4. COMPLICATION
   - One load gets stuck in mud (failure branch)
   - Options: winch self-free, abandon load, call for help
   - The storm intensifies (pressure peak)

5. RESOLUTION
   - Deliver the last load (or lose it)
   - Storm passes
   - See the result: barn has crops (success) or is empty (failure)
   - The field is changed (plowed, muddy, used)
   - Torque has a story (scar, repair, memory)

6. REVEAL
   - Dawn breaks
   - A radio signal appears (next episode teaser)
   - The world is slightly different because of what happened
   - The player wants to continue
```

### 4.3 Systems exercised

| System | How it's exercised | Proof it provides |
|---|---|---|
| Rig movement | Drive across varied terrain | Q2: movement is satisfying |
| Terrain interaction | Plow field, drive through mud | Q2: work is pleasurable |
| Module attachment | Attach plow in workshop | Module system works |
| Activity binding | Haul crops to barn | Activity system works |
| Pressure system | Storm approaches, time pressure | Q4: complication creates story |
| Day/night cycle | Morning → storm → dawn | World changes, rig persists |
| Consequence | Field plowed, crops delivered/lost | Q3: place has needs |
| Basic UI | Objective, pressure indicator | Player knows what to do |

---

## 5. Technical scope

### 5.1 Rig (existing + small additions)

- Torque-70 physics-based driving (already works)
- Add: plow attachment point (hardpoint definition)
- Add: module visual (plow GLB appears on rig)
- Add: plow interaction (cultivate verb when plow attached)
- Add: mud interaction (reduced traction, visual mud spray)

### 5.2 Terrain (existing + small additions)

- Patchwork Vale terrain (already works)
- Add: plowed field state (visual change: soil turned)
- Add: mud state (visual change: wet, reflective)
- Add: crop objects (simple GLB, instanced)
- Add: barn object (simple GLB, interaction point)

### 5.3 Weather (new, minimal)

- Storm system (simple: wind increases, rain starts, visibility drops)
- No complex weather simulation — just visual + mechanical effects
- Wind affects rig handling (pushes rig sideways)
- Rain reduces visibility and traction

### 5.4 Module system (new, minimal)

- Hardpoint definition (front-utility slot on Torque)
- Module attachment (workshop interaction, plow appears on rig)
- Module grant (plow enables cultivate verb)
- Module tradeoff (plow adds weight, reduces turning radius)

### 5.5 Pressure system (new, minimal)

- Storm timer (storm arrives in X minutes)
- Visual pressure (sky darkens, wind increases)
- Mechanical pressure (mud increases, visibility drops)
- Readable pressure (UI indicator shows storm progress)

### 5.6 Consequence system (new, minimal)

- Field state (plowed/not plowed persists)
- Crop state (delivered/not delivered persists)
- Rig state (damage, scars persist)
- World state (mud, weather persists)

### 5.7 UI (existing + additions)

- Objective display (harvest the south field)
- Pressure indicator (storm progress)
- Module status (plow attached/detached)
- Outcome summary (what happened, what changed)

---

## 6. Asset requirements

### 6.1 3D models (minimal)

| Model | Source | Purpose |
|---|---|---|
| Torque-70 | Existing GLB (tractor.glb) | Player rig |
| Plow | Generate with Tripo/Meshy | Module attachment |
| Crop field | Simple geometry (code-generated) | Harvest target |
| Barn | Simple geometry (code-generated) | Delivery point |
| Mud puddle | Simple geometry (code-generated) | Terrain effect |
| Rain particles | Particle system (code) | Weather effect |

### 6.2 Textures (minimal)

| Texture | Source | Purpose |
|---|---|---|
| Plowed soil | Generate with Meshy AI | Visual state change |
| Wet mud | Generate with Meshy AI | Visual state change |
| Crop | Generate with Meshy AI | Visual object |

### 6.3 Sound (minimal)

| Sound | Source | Purpose |
|---|---|---|
| Engine idle | ElevenLabs SFX | Rig character |
| Plow scrape | ElevenLabs SFX | Work feedback |
| Rain | Stable Audio | Weather atmosphere |
| Wind | Stable Audio | Weather atmosphere |
| Mud squelch | ElevenLabs SFX | Terrain feedback |
| Success jingle | Stable Audio | Outcome feedback |

---

## 7. What this proves

### 7.1 Core fantasy validation

- **Q1: Can one machine become emotionally owned?**
  - The player drives Torque through varied conditions
  - Torque has visible changes (plow attached, mud splatter, damage)
  - The player experiences Torque's limitations and strengths
  - The player makes choices that affect Torque's condition

- **Q2: Can useful work be intrinsically pleasurable?**
  - Plowing the field is visually satisfying (soil turns)
  - Hauling crops has physical feedback (weight, balance, momentum)
  - The storm creates urgency without punishment
  - Success feels earned, not given

### 7.2 Design risk reduction

- **Pressure system works** — storm creates readable urgency
- **Module system works** — plow attaches, grants capabilities, imposes tradeoffs
- **Consequence system works** — field state, crop state, rig state persist
- **Context switching works** — same rig, different conditions (day/night, clear/storm)
- **Episode structure works** — one bounded episode with clear objective and outcome

### 7.3 Technical validation

- **Asset pipeline works** — generate, validate, load GLB modules
- **Terrain interaction works** — plow affects terrain, mud affects driving
- **Weather system works** — visual + mechanical effects
- **UI communicates state** — objective, pressure, outcome visible

---

## 8. What this does NOT prove

- Full 10+ context support (that's content, not mechanism)
- Fleet coordination (that's a separate proof)
- Full episode grammar (that's content, not mechanism)
- Director AI (that's a separate proof)
- Procedural generation (that's a separate proof)
- Multiplayer (that's a separate proof)
- Full module catalog (that's content, not mechanism)
- Full progression system (that's a separate proof)

---

## 9. Implementation order

### Phase 1: Rig + Terrain (days 1-3)
1. Verify Torque-70 drives correctly on existing terrain
2. Add plow hardpoint definition
3. Generate plow GLB with Tripo/Meshy
4. Implement plow attachment (workshop interaction)
5. Implement plow visual (appears on rig)
6. Implement plow interaction (cultivate verb)
7. Test: can the player drive, attach plow, and cultivate?

### Phase 2: Crops + Barn (days 4-5)
1. Generate crop GLB (simple geometry)
2. Generate barn GLB (simple geometry)
3. Place crops in south field (instanced)
4. Place barn at delivery point
5. Implement crop pickup (haul interaction)
6. Implement crop delivery (barn interaction)
7. Test: can the player harvest and deliver?

### Phase 3: Weather + Pressure (days 6-7)
1. Implement storm system (wind, rain, visibility)
2. Implement mud effect (traction reduction, visual)
3. Implement storm timer (approaching storm)
4. Implement pressure UI (storm progress indicator)
5. Test: does the storm create readable urgency?

### Phase 4: Consequence + UI (days 8-9)
1. Implement field state persistence (plowed/not plowed)
2. Implement crop state persistence (delivered/lost)
3. Implement rig state persistence (damage, scars)
4. Implement outcome summary (what happened, what changed)
5. Test: do consequences persist and matter?

### Phase 5: Polish + Test (days 10-12)
1. Add sound effects (engine, plow, rain, mud)
2. Add visual polish (particles, lighting, camera)
3. Add accessibility (reduced motion, keyboard controls)
4. Playtest with fresh players
5. Iterate based on feedback

---

## 10. Success criteria

### Player experience
- [ ] Player can drive Torque-70 across varied terrain
- [ ] Player can attach and use the plow module
- [ ] Player can harvest and deliver crops
- [ ] Player experiences the storm as readable pressure
- [ ] Player sees consequences of their actions
- [ ] Player wants to continue after the episode ends
- [ ] Player describes Torque as "my tractor" (Q1)
- [ ] Player chooses to repeat or improve the operation without rewards (Q2)

### Technical
- [ ] Rig drives correctly on terrain
- [ ] Module attaches and works
- [ ] Storm creates visual + mechanical effects
- [ ] Consequences persist across sessions
- [ ] UI communicates state clearly
- [ ] Performance within browser budgets
- [ ] Accessibility basics work

### Design
- [ ] Pressure creates urgency without punishment
- [ ] Module tradeoffs feel meaningful
- [ ] Consequences affect later decisions
- [ ] The rig feels like a character
- [ ] The place feels like it matters

---

## 11. What comes after

If the first slice proves Q1 and Q2:

1. **Second rig** (Drift or Spark) — proves Q5 (fleet deepens the world)
2. **Second context** (night or defense) — proves context switching
3. **Second episode** (Storm Relay) — proves episode grammar
4. **Second place** (Sunken Flats) — proves world expansion

If the first slice fails Q1 or Q2:

1. **Diagnose** — what specifically didn't work?
2. **Iterate** — fix the weakest link
3. **Retest** — does the fix improve the experience?
4. **Decide** — continue or pivot?

---

## 12. Decision questions

1. Should "First Harvest" be the first slice, or should we start with something even smaller?
2. Is 12 days realistic for this scope, or should we cut further?
3. Should we use existing assets (tractor.glb) or generate new ones?
4. How much polish is enough for a first slice vs. a vertical slice?
5. Should we playtest internally first or with fresh players immediately?

---

## Linked artifacts

- [Context Switching Mechanic](./CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- [Episode Runtime Architecture](./EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md)
- [Module System Mechanics](./MODULE_SYSTEM_MECHANICS_2026-08-05.md)
- [Asset Pipeline for Infinite Rigs](../research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md)
- [Long-Term Game Design from First Principles](../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
- [Core Loop and Progression Contract](../research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)
- [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
- [Rig Generation for Infinite Possibilities](../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)
- [Master Vehicle Catalog](../exploration/MASTER_VEHICLE_CATALOG.md)
- [First Playable — The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)
