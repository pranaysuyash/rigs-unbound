# Wide-Open Brainstorm: Rigs Unbound

**Date:** 2026-07-27
**Seed:** "Vehicles are the playable characters. Terrain is the only building material. The land remembers what you do to it."
**Mode:** Single-agent (no external LLMs connected)

---

## 1. North Star Thesis

**You make land passable, and the land remembers.**

This is not a driving game. It is not a construction game. It is not a survival game. It is a **reclamation game** — the act of making something that was impossible become possible, and having the world bear witness to that act.

The irreversible insight: **the machine is the verb, not the noun.** The tractor is not a vehicle you drive. The tractor is the act of cutting, filling, and opening. When you switch from Torque to Spark, you are not switching vehicles — you are switching the *way the world can be changed*. That is the thesis that makes this project exist and nothing else does.

---

## 2. Executioner's Kill Test

**The strongest reason to kill this project:** The current build is an instrumented ghost world. Three simulated playtests described it as "a small valley, checklist, test field." No external player has ever said "I made a road." The 349 tests prove correctness. They do not prove anyone cares.

**Fatal flaws that no engineering will fix:**
1. The verbs (drive, survey, plough, fill, tow, collect, upgrade, jump, hover, recover) do not form one irresistible chain. They form a menu.
2. The world is continuous mathematically but fragmented experientially — seven named site circles, a "PATCHWORK RUMOR GRAPH," rig-specific demonstration regions.
3. The interface has become an engineering dashboard competing for attention.

**What would need to be true to reverse this verdict:**
- A stranger enters one continuous world, changes the land, crosses what previously blocked them, sees another machine benefit from their work, and wants to continue.
- This must happen within 15–20 minutes, without assistance, on the first session.
- Nobody describes the build as a lab, field selector, or tech demo.

**Current verdict: Conditional life.** The engineering substrate is unusually strong. The product surface is not yet a game. The next 2 commits must prove the Reclamation moment or the project should pivot to become a terrain-authoring tool (which the substrate already supports).

---

## 3. Champion's Defense

**First-principles defense of the thesis:**

The world has thousands of driving games. It has thousands of building games. It has zero games where the act of making a road IS the game — where the road is the character, the road is the story, and the road persists.

Rigs Unbound already has the hardest technical piece: deterministic terrain deformation that persists across sessions and survives version migrations. That is not a prototype feature. That is a foundation.

The 3 rigs are not "three vehicles." Torque is the hand that cuts. Spark is the mind that scouts. Drift is the ghost that crosses. Each one changes what the world can become. That is not a feature list. That is a design grammar.

The ChatGPT analysis said the project has "systems, not a validated game loop." That is correct. But the R2 proof (tilled ground is faster than mud) and the R3 proof (cross-rig benefit) show the game loop is ONE COMPLETED JOURNEY away from being real.

**The irreducible core:** The moment a player ploughs through a gully, looks back, and says "I made that road" — that is the moment the entire thesis is proven. Everything else is noise.

---

## 4. Strategist's 10,000-Foot View

**What should exist:**
- One continuous world, one seamless journey, one clear moment of "I did that"
- Three rigs that feel like three different ways of changing the world
- A terrain system that rewards ploughing and remembers what was done
- A UI that disappears when the world is doing its job

**What should NOT exist (kill list):**
- Field 02 branding (it's not a field, it's a world)
- Developer labs visible to players
- Permanent opportunity checklist (replace with landscape signals)
- Two separate map overlays (merge into one)
- Tactical navigator as permanent overlay (make it bounded)
- "Patchwork Rumor Graph" as player-facing language

---

## 5. Operator's Ground-Level Actions

**The 3 highest-leverage tactical moves RIGHT NOW:**

1. **Kill the field language.** Remove "Field 02" from every player-facing surface. The world has one name: the Reclamation. This costs 0 engineering and removes the biggest "test field" signal.

2. **Run the ChatGPT Step 1 corrective pass.** The 10 defects listed (seed-correct saves, terrain revision tracking, furrow circular-buffer rendering, cut/fill visual distinction, obstacle caching invalidation, survey cadence persistence, safe storage adapter, one map controller, prop invalidation, CI enforcement) are player-trust defects, not future-platform concerns.

3. **Build the one seamless journey.** The first-rung guidance already has 7 stages. The gully is placed. The R2 proof works. Wire the complete path: Home → gully sight → attempt → blade → plough → tilled crossing → Long Furrow arrival → second module → free-explore. This is ONE commit, not a project.

---

## 6. Cartographer's Map

**Project structure that serves the thesis:**

```
src/
├── game/
│   ├── world.ts          ← one world, not seven sites
│   ├── state.ts          ← deterministic kernel
│   ├── terrain.ts        ← the only building material
│   ├── first-rung.ts     ← the journey (currently 7 stages)
│   ├── renderer.ts       ← visual presentation
│   └── camera.ts         ← six policies
├── player-shell/         ← DOM UI (one surface, not five)
└── tools/                ← evidence fixtures
```

**Missing map lines:**
- No path from "I see the gully" to "I ploughed through it" that doesn't pass through a lab or field selector
- No visual signal that says "the world remembers" after terrain change
- No cross-rig handoff moment that feels like "Spark benefits from what Torque built"

---

## 7. Archivist's Record

**What this project has already proven (and should never redo):**
- Deterministic fixed-step simulation with versioned save migrations
- Terrain as shared truth for physics, collision, camera, and rendering
- Two distinct mobility families (ground + hover) with strict profile validation
- Runtime profile fallback with player-facing reason text
- First-rung guidance system with 7 progressive stages
- R2 proof: tilled ground is faster than mud
- R3 proof: cross-rig benefit after route opening
- Asset admission pipeline with versioned schema and preflight
- Replay validation with admitted initial context

**What should NEVER be built:**
- Generic event bus (the run record is the audit spine, not pub/sub)
- ECS migration (3 rigs, ~10 authored sites — the machine-centric model is correct)
- R3F/React migration (vanilla Three.js is the right choice)
- Generic ActivityDefinition (one proven activity, not two)
- Streaming/chunking (one world, one residency)
- Multiplayer (not until the single-player journey is proven)

---

## 8. Trickster's Insights

**The weird metaphor nobody is using:** The game is not about vehicles. It is about **scars on land.** Every furrow is a scar. Every tilled patch is a wound that heals into a road. The land is alive and the player is performing surgery on it. The "land remembers" is not a persistence feature — it is a relationship.

**The counterintuitive feature that would work:** Let the land heal. If you don't plough for a while, grass grows back over the furrows. The world is not static — it is trying to forget, and the player's job is to make the changes permanent. This would make "the land remembers" feel earned rather than guaranteed.

**What a 10-year-old would find most exciting:** The moment you switch from Torque (the slow, powerful cutter) to Spark (the fast, light scout) and realize Spark can now cross the road that Torque built. The feeling of "I have a different tool for this world now."

**The one sentence that would make someone describe this to a friend:** "You drive a tractor, cut through a swamp, and build a road that wasn't there before."

**The secret strength the engineering rigor is hiding:** The terrain deformation is VISUALLY SATISFYING even in primitive geometry. The furrow decals, the surface classification change, the before/after — these are not placeholder visuals. They are the actual game feel, just wearing low-poly clothes.

---

## 9. Skeptic's Gap Analysis

**Biggest gap between engineering and player experience:**
The HUD is an engineering dashboard. It shows instruments, diagnostics, opportunity rails, workshop panels, and control lessons — all at once. A first-time player sees 7+ competing surfaces within 3 seconds. The world is behind all of them.

**What will confuse a first-time player within 30 seconds:**
"What is Field 02? What is a Patchwork Rumor Graph? Why are there three maps? Which one do I look at?"

**What will make them close the tab within 5 minutes:**
"I don't know what to do. The instructions say 'Head toward Long Furrow' but I don't know where that is or why I should care."

**What would make them stay for 20 minutes:**
"I can see a gully blocking my path. I found a blade. I ploughed through it. The road is there. I want to see what's on the other side."

**Evidence we do NOT have and urgently need:**
- One external player completing the full journey without assistance
- A video of someone saying "I made that road"
- Mobile performance numbers on representative devices
- A/B data on "one map vs two maps" for player comprehension

---

## 10. Future Self (6 Months)

**If the Reclamation journey is proven, the project becomes:**
- A terrain-authoring platform where the vehicle is the cursor
- A cross-rig puzzle game where different machines unlock different paths
- A persistence showcase where the world is a living diary of player actions

**If it is NOT proven, the project becomes:**
- A technically impressive demo reel
- A reference implementation for procedural terrain deformation
- A cautionary tale about building systems before games

---

## 11. Outsider's Perspective

**What an outsider sees that the team cannot:**
The team sees a game with three rigs and a terrain system. The outsider sees a **tractor game.** That is not an insult — it is the single most powerful market position in the project. "Tractor game where you build roads" is instantly understood by everyone on earth. "Multi-rig terrain traversal platform with deterministic simulation and versioned save migrations" is understood by nobody.

The team should lean into the tractor. Make the tractor the hero. Make the road the story. Everything else is architecture that serves the tractor.

---

## 12. Customer Whisperer

**What players will actually say:**
- "Oh, I can see the ground changing when I plough. That's cool."
- "Wait, I can't drive through this mud. I need to plough it first."
- "I just built a road through a swamp. Nice."
- "Can I switch to the other truck and drive on the road I made?"
- "This is like a chill road-building game. I like it."

**What they will NOT say:**
- "The runtime profile fallback is working correctly."
- "The furrow circular buffer is rendering at capacity."
- "The obstacle cache invalidation is event-driven."

---

## 13. Six-Hat Coverage

| Hat | Coverage | Status |
|-----|----------|--------|
| White (Facts) | 349 tests, 127 TS files, 2954-line renderer, 3 rigs, 7 surfaces | ✅ Strong |
| Yellow (Value) | "I made a road" moment, cross-rig benefit, land remembers | ✅ Proven in R2/R3 |
| Black (Risk) | No external validation, engineering dashboard UI, field language | ⚠️ Critical gap |
| Green (Creativity) | Land that heals, tractor as character, road as story | 🔵 Unexplored |
| Red (Emotion) | Satisfaction of terrain change, pride of route opening | 🔵 Not measured |
| Blue (Process) | 10 corrective defects, corrective foundation pass defined | ✅ Planned |

---

## 14. Time-Horizon Leapfrog

**6 months:** Reclamation journey proven with external players. One seamless 15-20 minute loop. No field language. Clean UI.

**12 months:** Second journey (Spark's scouting path). Third journey (Drift's crossing path). Cross-rig puzzles.

**24 months:** Player-created routes. "Your road" shareable. Community terrain challenges.

**Leapfrog:** Let players name their roads. "Pranay's Cut" carved into the terrain. The road is a signed work of art.

---

## 15. Arbitration: Champion vs Executioner

**Executioner says:** "No external player has ever said 'I made a road.' Until that happens, this is an engineering demo."
**Champion says:** "The R2 proof shows the road-making mechanic works. The R3 proof shows cross-rig benefit works. The first-rung guidance wires the journey. The gully is placed. The next commit can prove the moment."

**Verdict:** Build conditions:
1. One external player completes the full journey without assistance
2. That player says something equivalent to "I made a road"
3. Mobile performance is acceptable on a representative device
4. Nobody describes the build as a lab, field selector, or tech demo

If all four conditions are met, the project lives. If not, pivot to terrain-authoring tool.

---

## 16. High-Signal Convergence

Multiple roles independently converged on:
1. **The UI is the biggest problem.** Not the renderer, not the physics, not the rigs — the UI competing for attention.
2. **"I made a road" is the moment.** Strategist, Champion, Trickster, and Customer Whisperer all identified this as the proof point.
3. **Kill the field language.** Every role flagged "Field 02" and developer-facing surfaces as player-trust violations.
4. **The tractor is the hero.** Outsider and Trickster both identified the tractor as the most powerful market position.

---

## 17. Build Conditions

**Immediate (next commit):**
- Kill "Field 02" language from all player surfaces
- Wire the complete first-rung journey (7 stages through to free-explore)
- Remove developer labs and diagnostic surfaces from player view

**Before external testing:**
- Complete the 10 corrective defects from ChatGPT Step 1
- Merge the two map overlays into one
- Add loading progress indicator

**Before the project can claim "game":**
- One external player completes the journey without assistance
- That player says "I made a road"
- Mobile performance is acceptable

---

## 18. Six-Hat Summary

The project has an unusually strong engineering substrate and a clear thesis ("You make land passable, and the land remembers"). The critical gap is product surface: the UI is an engineering dashboard, the world is fragmented by field language, and no external player has validated the core moment. The Reclamation journey (gully → blade → plough → tilled crossing → cross-rig benefit) is architecturally complete but not yet proven with real players. The next 2 commits should kill the field language and wire the seamless journey. The next external test should prove "I made a road." Everything else — LOD, streaming, multiplayer, ECS — is subordinate to that proof.

**Verdict: Conditional life. Prove the road, or pivot to the tool.**

---

## Reusable Prompt for Future Iterations

```
You are running a wide-open brainstorm for rigs-unbound.

PROJECT THESIS: "You make land passable, and the land remembers."
MOTTO: "Whole-Answer Mandate. Long-Term Build. Decision Records."
CURRENT STATE: 349 tests, 3 rigs, 7 surfaces, Reclamation journey being built.
CRITICAL GAP: No external player has validated "I made a road."

Apply these roles:
- STRATEGIST: 10k/1k/ground altitude mapping
- CHAMPION: Steelman the thesis
- EXECUTIONER: Argue to kill it
- TRICKSTER: Find non-obvious insights
- SKEPTIC: Gap between engineering and player experience
- FUTURE SELF: 6-month projection
- OUTSIDER: What the team can't see

Produce: North Star thesis, kill test, build conditions, time horizons, convergence points.
```
