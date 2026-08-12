# NPC and Community System — Who Lives Here and Why It Matters

**Date:** 2026-08-05
**Status:** design exploration; not an accepted ADR
**Evidence tier:** Tier 1 synthesis of existing parallel-owned settlement work, long-term design, playtest evidence, and first-playable requirements
**Depends on:** Long-Term Game Design, First Playable Slice Plan, Parts and Favor Economy

---

## 1. The problem this solves

The playtest found: "Nothing lives here. No animals, no NPCs, no traffic, no one at the Home Silo." The world feels empty because there are no inhabitants.

Q3 asks: "Can a place create motive?" This requires someone who needs something — a beneficiary, a community, a reason for the work to matter.

The first playable slice needs: a beneficiary (who needs the crops?), a reason (why does the harvest matter?), and a response (how does the community react?).

---

## 2. What already exists

- **Parallel-owned settlement modules** (src/game/, uncommitted): settlement-needs.ts, settlement-life.ts, community-traffic.ts
- **Named NPCs on Contracts board**: Mara Iles (pump keeper), Sava Nune (grower), Kellan Voss (yard chief), Ione Vale (ferry caller), Oren Pike (depot ferryman), Sera Tal (signal keeper)
- **Parts and Favor economy**: Favor = relationship state, not spendable currency. Earned by helping, completing contracts, keeping promises.
- **Dialogue surface plan** (docs/design/DIALOGUE_SURFACE_IMPLEMENTATION_PLAN_2026-07-31.md): Three-line panel, no branching dialogue trees
- **Factions** (long-term design): Hearthworks, Ordered Line, Freewheels, Deepwake, Graftwrights, Signal Choir

---

## 3. NPC design principles

1. **NPCs are machines with agency**, not people with dialogue trees. Character appears through work patterns, needs, memory, and response.
2. **NPCs are place-bound.** Each NPC belongs to a place. They don't roam — they inhabit. When the player leaves, the NPC stays. When the player returns, the NPC remembers.
3. **NPCs have needs, not quests.** No quest markers. Needs are observable: broken equipment, blocked routes, ready crops, approaching storm. The player chooses to help or not.
4. **NPCs remember.** Every interaction leaves a trace: helped (trust increases, options open), ignored (trust unchanged), harmed (trust decreases, options close).

---

## 4. The community model

### Community structure

```text
Community {
  id, name, place
  npcs: NPC[]
  needs: Need[]
  memory: CommunityMemory
  capacity: CommunityCapacity
  state: CommunityState
}
```

### NPC structure

```text
NPC {
  id, name, role, place
  needs: Need[]
  memory: NPCMemory
  state: NPCState
  relationships: Relationship[]
}
```

### Need structure

```text
Need {
  id, description
  type: "harvest" | "repair" | "protection" | "connection"
  urgency: "low" | "medium" | "high" | "critical"
  beneficiary: NPCId
  location: PlaceRef
  solution: SolutionHint[]  // capabilities needed
  status: "active" | "in-progress" | "completed" | "failed"
}
```

---

## 5. NPC communication

### How NPCs communicate needs

- **Visual cues**: broken equipment, blocked routes, ready crops
- **Environmental cues**: dark lights, stopped machines, overflowing water
- **Radio traffic**: short functional messages ("Harvest needed south field")
- **Field notes**: written records on the Contracts board
- **Spatial presence**: NPC positioned near the need

### How NPCs respond to player action

- **Verbal acknowledgment**: "Thank you" / "You saved the harvest"
- **Visual change**: NPC posture changes (relieved, grateful)
- **Behavior change**: NPC works differently (faster, safer)
- **Access change**: new options open (loaner rig, blueprint, trade)
- **Memory**: NPC remembers and references later

### The dialogue surface

Three-line panel, no branching dialogue trees. Beats are functional:
- [ACKNOWLEDGE] "The south field was ready. You got here just in time."
- [THANK] "Sava says the harvest is safe. She'll remember this."
- [REQUEST] "The storm's coming. We need the west field cleared too."
- [WARN] "Night's falling. The routes get harder after dark."
- [REMEMBER] "Last time you helped with the pump. We trust you."

---

## 6. Community interaction loops

### Observation loop

```text
Player arrives → observes need → infers solution → chooses to help →
acts → NPC responds → community adapts → player benefits
```

### Memory loop

```text
Player helps → community remembers → trust increases → options open →
player returns → community recognizes → new possibilities emerge
```

### Failure loop

```text
Player fails → community remembers → trust unchanged → window changes →
new need appears → player can still help → story continues
```

---

## 7. First slice implementation

For "First Harvest," the community system needs:
- **One NPC**: Sava Nune (grower)
- **One need**: harvest the south field before the storm
- **One response**: acknowledgment if successful, acknowledgment of loss if failed
- **One memory**: Sava remembers the player's action
- **One access change**: Sava offers more work if trusted

### What this proves
- A place can create motive (Q3)
- NPCs have observable needs
- NPCs remember player actions
- Trust creates access
- Failure creates story

### What this does NOT prove
- Full community system (that's content, not mechanism)
- Faction dynamics (that's a separate proof)
- Multi-NPC interactions (that's a separate proof)
- Dialogue trees (not planned — beats only)

---

## 8. Decision questions

1. Should NPCs be visible 3D models or abstract presence (radio, field notes)?
2. How many NPCs per community for the first slice?
3. Should NPC memory be visible to the player or implicit?
4. How does NPC trust affect gameplay mechanically (not just narratively)?
5. Should NPCs have their own schedules/routines, or be static?

---

## Linked artifacts

- [First Playable Slice Plan](FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md)
- [Parts and Favor Economy Spec](PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md)
- [Long-Term Game Design from First Principles](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
- [Dialogue Surface Implementation Plan](../design/DIALOGUE_SURFACE_IMPLEMENTATION_PLAN_2026-07-31.md)
- [Context Switching Mechanic](CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- [Episode Runtime Architecture](EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md)
