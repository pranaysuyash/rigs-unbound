# Reclamation Strategic Synthesis

- Date: 2026-07-26
- Status: **Proposed** — operator decision required before implementation
- Context: two independent analyses (Buffy repo audit + ChatGPT structural critique) converging on the same conclusion from different angles
- Related: `motto_v4.md` §0 (Boldness), §0.0.1 (Whole-Answer), §0.12.4 (Cut/Keep/Finish), §11 (Engineering Standards), §12 (Product Alignment)

---

## What both analyses agree on

The repo has a **stronger technical foundation than its product surface suggests**. Both analyses identify the same core strengths:

- deterministic fixed-step kernel (`src/game/state.ts`)
- renderer-independent state (`src/game/renderer.ts` consumes snapshots, never invents truth)
- terrain as simulation substrate (`src/game/terrain.ts` — ADR-0007, Accepted)
- versioned save migrations through four schema versions
- three rigs with genuinely different locomotion (ground × 2, hover × 1)
- persistent deformation, fallen trees, salvage, survey
- command → validation → transition → event proof slice (`executePrimaryActionCommand`)
- runtime observability and browser acceptance hooks

Both analyses also agree on the same diagnosis: **the project has systems but not yet a validated game loop**.

---

## Where ChatGPT is correct

### 1. The world is continuous mathematically, fragmented experientially

This is the sharpest observation. The terrain is one connected heightfield with smooth biome blending (`biomeInfluence` in `src/game/terrain.ts`), but every player-facing system chops it into discrete islands:

- "Field 02" branding on the landing page
- seven named site circles with one-word verbs
- a node-based "PATCHWORK RUMOR GRAPH" overlay
- a separate tactical navigator radar
- rig-specific demonstration regions
- glowing rings and masts as discovery markers

**The UI tells the player the world is a graph of nodes. The terrain says it is continuous ground. These contradict.**

### 2. The interface has become an engineering dashboard

The current DOM surface contains or creates simultaneously:

- main field kit (6 instruments)
- opportunity rail
- permanent controls strip
- workshop panel
- traditional field map
- rumor graph map
- tactical navigator (permanently created, not a bounded mode)
- hood dashboard (camera-driven)
- control lessons (contextual notifications)
- developer diagnostics
- toasts and overlays

This is not "insufficient UI." It is **competing UI authorities**. The navigator alone is never hidden — it is created once and updated every frame, whether the player wants it or not.

### 3. The testing proves correctness, not value

The repo has ~90+ tests proving state transitions are deterministic. The three simulated playtests all described the build as a "small valley," "checklist," "test field," or "instrumented ghost world." That signal matters more than whether representation-LOD is implemented.

### 4. Several correctness defects remain that affect player trust

From ChatGPT's list, verified against current code:

| Defect | Current status (Tier 1) |
|--------|------------------------|
| Non-default-seed saves can discard world memory during boot | `recoverShared` preserves `lastDiagnostic` verbatim now, but seed-dependent world memory restoration path still has implicit assumptions in `recoverRig` |
| Terrain visual invalidation uses deformation count vs revision | `terrain-revision` field exists in schema but renderer prop rebuild still checks `furrowRevision` counters |
| Cut and fill produce the same generic furrow visual | `setFurrow` records depth/slope but the renderer applies one rust-tone displacement regardless of blade mode |
| Bounded furrow rendering fails when entries rotate at capacity | furrow circular buffer in renderer can lose visual entries when capacity is reached without graceful degradation |
| Obstacle caching assumes mutable terrain is static | `collision.ts` obstacle field is generated once at world init; terrain deformation does not invalidate cached obstacle positions |
| Collected salvage and felled trees may remain visually stale | prop rebuild depends on prop-rebuild radius traversal, not immediate event-driven invalidation |
| Survey cadence lives in a WeakMap outside persisted state | confirmed — `surveyCooldowns` is runtime-only and resets on reload |
| Storage failures can still throw | `loadState` wraps parsing in try/catch but `saveState` does not guarantee atomic write |
| Two separate map overlays have conflicting state | field map and rumor graph share `mapOpen` but maintain separate DOM trees and update cadences |
| Automated browser testing remains machine-specific | Playwright scripts use absolute paths to a local skill directory; no CI-friendly module resolution |
| No GitHub workflow enforces local checks | `package.json` has test/typecheck scripts but no `.github/workflows/` CI pipeline exists |

---

## Where ChatGPT is inaccurate or imprecise

### 1. "Biome blending" is not continuous

ChatGPT says "biome blending" exists. The actual implementation (`biomeInfluence` in `src/game/terrain.ts`) uses inverse-distance-weighted influence from site anchors. This is smoother than nearest-site Voronoi but still produces **site-dominated regions**, not true continuous biome gradients. The "circular island, empty gap, circular island" read that ChatGPT correctly identifies as a problem is precisely because `biomeInfluence` still resolves to dominant biome per-site rather than blending moisture/relief across arbitrary terrain positions.

The recent `biomeInfluence` refactor (visible in the git diff) replaced the old nearest-site Voronoi with a weighted blend across all site anchors. This is a real improvement — no more hard edges between biomes. However, the influence still falls off with the square of distance measured in units of the site's own radius, so large sites dominate nearby terrain heavily. The blend is **continuous but site-anchored**, not truly position-independent. For the Reclamation loop this is actually acceptable: the player transforms terrain *within* a biome, not across biome boundaries.

### 2. "executePrimaryActionCommand" is real, not stale

ChatGPT says: "A complete `executePrimaryActionCommand()` lane is therefore still a proposal or stale branch context."

This is **factually wrong for the current main branch**. The git diff and source inspection confirm:

- `executePrimaryActionCommand()` exists in `src/game/state.ts`
- it validates a versioned command and returns a structured `PrimaryActionEvent`
- `performPrimaryAction()` returns the same event
- browser call sites capture accepted/rejected outcomes in the run record
- 15 tests prove the command → validate → transition → event pipeline

ChatGPT likely reviewed an older snapshot or a different branch. The command/event proof slice is real and landed.

### 3. R3F migration is not being proposed

ChatGPT argues against React Three Fiber migration. This is correct advice, but the project never proposed it. ADR-0001 (Proposed) keeps Three.js as the v1.x default. The engine-bakeoff lane exists as a future comparison gate, not an active migration path. ChatGPT is solving a problem that does not exist.

### 4. "Renderer should stop being one large owner" — already partially done

ChatGPT proposes splitting `GameRenderer` into `TerrainView`, `RigViewRegistry`, `PropPopulationView`, etc. The codebase already has partial separation:

- `terrain.ts` owns terrain data independently of rendering
- `gameworld.ts` owns spatial memory separately
- `camera.ts` owns physical camera mounts
- `scene-query.ts` owns camera obstruction independently

The renderer is large (~2400 lines) but it is not "one large owner of everything." It is the largest remaining monolith, but the extraction boundary is clearer than ChatGPT suggests.

---

## What neither analysis adequately addresses

### The Reclamation journey does not exist yet as a designed sequence

Both analyses agree the project needs "one seamless 15–20 minute Reclamation journey." But neither defines what that journey actually is in terms of:

1. **Starting state**: which rig, what loadout, what visible destination
2. **Blocker encounter**: what terrain feature stops the player and why
3. **First failure**: the rig attempts and fails, teaching the player the problem
4. **Salvage discovery**: where is the first cache, how does the player reach it
5. **First modification**: the blade cuts/fills, showing visible terrain change
6. **Surface classification change**: the terrain type shifts (meadow ↔ mud), proving the world noticed
7. **Route opening**: a previously impassable path becomes traversable
8. **Persistence proof**: the route survives reload
9. **Cross-rig benefit**: Spark or Drift benefits from the opened route
10. **Completion**: the player arrives at the destination without leaving the world

The current `first-rung.ts` covers steps 3–5 partially (find cache → collect → earn → return → choose part → free explore) but it stops at "fit a module." It does not close the loop back to terrain transformation as the core reward.

### The "land remembers" feedback loop is weak

The terrain stores furrows, but:
- furrows are visual-only displacement (no gameplay consequence beyond surface type)
- cut and fill produce the same visual record (no distinction between clearing a path and building a mound)
- the player cannot see a before/after comparison of their terrain work
- no other rig benefits from terrain changes in a visible way (the "cross-rig benefit" step is not implemented)
- the furrow circular buffer can lose entries at capacity without the player knowing

---

## The motto_v4-aligned path forward

Per §0.12.4 (Cut/Keep/Finish Anchored to Long-Term Product Shape):

> A feature that is part of the long-term shape is finished properly even when expensive. A feature that is not part of the shape is cut, not deferred by default.

The long-term shape is now clear: **Reclamation** — terrain as the only building material, the land remembers what you did, and other machines benefit from your work.

### What to cut (not part of the shape)

| Item | Rationale |
|------|-----------|
| Farmfall crops/signature ecology/night threats | ADR-0002 depends on the Reclamation loop being proven first; crops are a second activity, not the first loop |
| Fourth rig | Breadth should be measured by new assumptions exposed, not roster size (EXPLORATION_MAP addendum) |
| ECS migration | No measured pressure at current scale; composition-first model is sufficient |
| Generic ActivityDefinition registry | Only one activity seam proven; wait for second proof |
| Chunk streaming | World is one canonical residency; streaming is future-gated |
| Replay playback transport | Record/verify is proven; playback is a product feature, not a technical prerequisite |
| Multiplayer authority | Local-first is the proven mode; shared state is future-gated |
| Representation LOD | Current visibility budget is sufficient for the Reclamation loop scope |
| Collision category/mask generalization | Narrow obstacle behavior is sufficient; triggers/sensors/hazards are future |
| Developer labs (Rig Lab, Physics Lab, Box3D Probe) | These are evidence fixtures, not player-facing surfaces. Hide behind `?acceptance=` flag; remove from player-visible links and nav. Keep the acceptance runners but do not expand them.

### What to finish (part of the shape)

| Item | Commit-units | Primary files | Proof gate |
|------|-------------|---------------|------------|
| **R1: Terrain transformation feedback** | ~3 commits | `src/game/renderer.ts` (furrow visual by blade mode), `src/game/state.ts` (blade mode recorded in furrow record), `src/game/terrain.ts` (cut/fill depth semantics) | Cut vs fill produce distinct visual records; player sees before/after |
| **R2: Route opening proof** | ~2 commits | `src/game/terrain.ts` (surface classification shift on deformation), `src/game/physics.ts` (traversalBlockReason resolves differently after deformation), `src/game/collision.ts` (obstacle cache invalidation on terrain change) | A furrowed path changes surface classification; a blocked route becomes traversable |
| **R3: Cross-rig benefit** | ~2 commits | `src/game/state.ts` (terrain changes visible to all rigs via shared world), `src/main.ts` (rig switch after terrain work) | Spark or Drift benefits from terrain Torque transformed |
| **R4: Persistence proof** | ~1 commit | `src/game/storage.ts` (terrain deformation round-trips correctly), `src/game/state.ts` (recovery preserves terrain revisions) | Terrain changes survive save/load and are visible to all rigs |
| **R5: Reclamation journey (end-to-end)** | ~2 commits | `src/game/first-rung.ts` (extend resolver through terrain transformation → route opening → cross-rig handoff), `src/game/world.ts` (authored blocker placement) | One 15-minute loop from blocker → failure → salvage → transform → cross → arrive |
| **R6: Player surface simplification** | ~2 commits | `index.html` (remove Field 02 branding, hide labs), `src/main.ts` (combine map overlays, make navigator toggleable), `src/styles.css` (simplified HUD) | Remove Field 02 branding; combine map overlays; make navigator optional |
| **R7: Correctness repairs** | ~3 commits | `src/game/storage.ts` (atomic save), `src/game/renderer.ts` (event-driven prop invalidation), `src/game/state.ts` (persisted survey cadence) | Storage atomicity, prop invalidation on event, survey cadence persistence |

**Total: ~15 commits, dependency-ordered.**

**Dependency graph:** R7 should land first (correctness foundation). R1–R2 build terrain transformation. R3–R4 prove persistence and cross-rig. R5 wires the end-to-end journey. R6 simplifies the player surface in parallel with R1–R5.

### What to keep (already proven, preserve as-is)

- deterministic kernel and save migration
- terrain-as-substrate architecture
- three rigs with distinct locomotion
- command/event proof slice
- camera policies and perception chain
- runtime observability
- browser acceptance infrastructure
- Patchwork Atlas visual direction

---

## The acceptance test (§0.4)

The Reclamation loop passes when:

1. A stranger enters one continuous world
2. A bog, gully, or steep face blocks a desirable destination
3. The starting vehicle can attempt and fail
4. The first salvage cache is reachable
5. The blade cuts and fills with a visible before/after
6. Surface classification changes
7. A route becomes traversable
8. The route persists after reload
9. Another rig benefits from the newly opened route
10. The player completes the journey without entering another field, lab, or activity screen
11. At least four of five players finish without assistance
12. At least one independently says something equivalent to "I made/opened a road"
13. Nobody describes the build primarily as a lab, field selector, or tech demo

**Prerequisite for items 11–13:** External playtest infrastructure must exist first — screen sharing, observation notes template, recording consent, and a fresh-save entry point. This is a commit-unit within R5, not a free bonus.

---

## Anything else?

Yes. Three things ChatGPT's analysis misses that motto_v4 §0.1.1 requires:

1. **The Reclamation journey is the rejection filter.** Every future feature request, rig addition, activity proposal, and UI surface should be tested against: "Does this make the Reclamation loop more compelling, or is it a parallel experiment?" If it is a parallel experiment, it does not enter the queue until the loop is proven with real players.

2. **The terrain transformation grammar needs a design ADR.** Currently, furrows are the only terrain modification. The Reclamation loop requires at minimum: clearing (removing a blocker), grading (smoothing a slope), and filling (bridging a gap). These are distinct verbs with distinct visual consequences. This is a load-bearing design decision that should be recorded before implementation, per motto_v4 §0.12.2.

3. **The first-rung resolver stops before the Reclamation reward.** `src/game/first-rung.ts` currently ends at "fit a module → free explore." It does not close the loop back to terrain transformation as the core reward. The resolver needs a sixth stage: after fitting the blade module, the first rung should guide the player through their first terrain transformation and route opening, not release them into open-ended exploration. This is the onboarding → Reclamation handoff and it is the most important gap in the first-session experience.

---

## Decisions required from operator before implementation

Per motto_v4 §0.4 and §0.12.2, the following decisions must be explicit before commit-units begin:

1. **Terrain verbs**: Which terrain transformations are in scope for the Reclamation loop? Minimum viable: clear (remove blocker), grade (smooth slope), fill (bridge gap). Are there others?
2. **Lab routes**: Hide behind `?acceptance=` flag only, or remove from DOM entirely?
3. **Starting rig**: Does the Reclamation journey begin with Torque only, or does the player choose?
4. **Map overlays**: Merge field map and rumor graph into one surface, or keep separate with a toggle?
5. **Navigator**: Make the tactical navigator a toggleable mode (M key), or remove it from the default HUD?
6. **Terrain verb priority**: Implement clear first (most visible), or grade first (most common)?

---

## Update log

- 2026-07-26: Initial synthesis from two independent analyses (Buffy repo audit + ChatGPT structural critique). Proposed status; operator decision required.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this strategic synthesis. This document still owns
the Reclamation decision frame; the new note carries the wider machine-keeper
thesis and long-range product direction.
