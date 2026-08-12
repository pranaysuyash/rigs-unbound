# Procedural World Building — Deep Dives (All Techniques + Tradeoffs)

**Date:** 2026-08-05
**Type:** Reference companion to `PROCEDURAL_WORLD_BUILDING_PRIMER_2026-08-05.md`
**Status:** Educational deep-dive. Every section explains the technique at implementation depth, gives the strengths/weakness/risk picture, shows pseudocode where useful, and maps it to Rigs Unbound's actual architecture.
**Evidence tier:** Tier 1 static source and contract synthesis. No runtime commands run in this pass.

---

## Table of contents

1. Noise composition (heights, fBm, warping, ridges)
2. Biome mapping (classification as world rules)
3. L-systems / grammars (paths, rivers, cities)
4. Wave Function Collapse (tile-space constrained generation)
5. Room packing / BSP / cellular automata (dungeons & interiors)
6. Agent-based and ecological simulation
7. Content composition: chunk graphs, template + parameters, placement
8. Post-validation gates (the safety layer)
9. Persistence: seed + deltas (why it wins)
10. Streaming / residency (the tradeoff and the trigger)
11. Determinism, reproducibility, and testing strategy
12. Rigs Unbound — consolidated guidance and decision map

---

## 1. Noise composition

### The problem noise solves
A truly random heightfield is white noise — chaotic, unnatural, and unreadable. Noise functions produce *correlated* randomness: nearby points are similar, distant points differ smoothly. That correlation is what reads as "terrain."

### Value / Perlin / Simplex
- **Value noise:** random values at integer lattice points, smoothly interpolated between them. Cheap, slightly blobby.
- **Perlin noise:** gradient vectors at lattice points, dot-multiplied with the offset to the sample point, smoothed with a fade curve. Produces a continuous derivative-free field; the classic choice.
- **Simplex noise:** Perlin's successor, lower computational cost in higher dimensions, fewer axis-aligned artifacts.

### fBm (fractal Brownian motion)
Sum several noise octaves:

```text
height(x) = Σ octaveᵢ amplitudeᵢ · noise(frequencyᵢ · x + offsetᵢ)
amplitudeᵢ = persistenceᵢ
frequencyᵢ = lacunarityᵢ (typ. ~2.0)
```

- **Persistence** (~0.5) controls how fast amplitude decays; low persistence = smooth, high = rough.
- **Lacunarity** (~2.0) controls how fast frequency grows; controls detail density.
- The result has detail at every scale — the "natural" look. Rigs Unbound's `fbm2` is this continental-shape pass.

### Domain warping
Instead of sampling noise at `x`, sample it at `x + noise(x)`:

```text
h = noise2( x + warpScale · noise2(x, seedA),
            y + warpScale · noise2(y, seedB) )
```

Warping bends the field so shapes fold and drift like eroded rock rather than sitting on a rigid grid. It is the difference between "obviously a fractal" and "looks drawn." Rigs Unbound uses it as the large-shape pass so the disc world has organic, non-gridlike character.

### Ridged multifractal
`abs(noise(x))` folds the field back on itself, creating sharp crests and valleys — mountain spines. Invert and you get ravines. Rigs Unbound masks a ridged field with a radial falloff to form the impassable boundary rim.

### Radial falloff & shaping
A `radialFalloff` (e.g., `1 - smoothstep(inner, outer, distance)`) multiplies the field to guarantee the world edges down to a boundary. Rigs Unbound's `RIDGE_INNER_RADIUS`→`RIDGE_OUTER_RADIUS` ramp produces the ridged rim, and `WORLD_LIMIT` is the numerical clamp so players meet the ridge, never a NaN cliff.

### The shaping mistakes
- **Swapping composition order** — e.g., adding micro relief before anchors — produces buried landmarks or glassy dead ground. Order is a correctness property, not a style choice.
- **No clamping at the rim** — players fall through or hit a wall of NaNs.
- **Pure noise with no biome/anchor layer** — a heightfield is a texture; without meaningful override it reads "random hills."

---

## 2. Biome mapping

### How classification works
Sample *multiple* correlated noise fields at a coordinate, threshold them jointly, and look up a biome:

```text
elevation = fbm(seedA, p)
moisture  = fbm(seedB, p)     # separate seed → uncorrelated
latitude  = fbm(seedC, p)

biome = BIOME_TABLE[elev→low/mid/high][moisture→dry/wet][lat→north/equator]
```

### Why biome is a rule, not art
The critical move — which Rigs Unbound makes correctly — is that a biome selects **behavioral coefficients, not just colour**. Grip, rolling drag, deformability, spray, and surface type all derive from the biome/surface record. That way a mud patch changes *driving physics*, and the renderer, physics, audio, and minimap all agree because they query the same surface record. Otherwise you get sand that looks wet or mud you can't feel.

### Rigs Unbound specifics
`BIOMES` in `world.ts` selects surface/relief; `SURFACES` carries the physical coefficients (`grip`, `rollingDrag`, `deformable`). Terrain, physics/readability, and audio/feedback all consume these. A biome change is a world-rule change, never a palette swap.

---

## 3. L-systems and grammars

### What they are
A set of rewrite rules applied repeatedly to a starting string, where symbols carry turtle-graphics meaning (draw forward, turn, branch). Used to generate *connected, branching structure*: roads, rivers, tree canopies, city blocks.

```text
axiom:  F
rules:  F → F[+F]F[-F]      # branch
        X → F-[[X]+X]+F[+FX]-X   # fiddle with angles
interpret: F=line, +=turn R, -=turn L, [ =push, ] =pop
```

### Why they matter for worlds
- **Guaranteed connectivity.** Because a road/river is one continuous recursive structure, it can't fragment into disconnected fragments the way random placement can. This is why L-systems are the right tool for *routes* and *accessibility*.
- **Branching city/road networks** with minor roads, major avenues, and radial growth.

### Tradeoffs
- Tone/angle tuning is fiddly; too many rules → self-similar and robotic.
- Deterministic rewriting produces the *same* shape per seed — good for reproducibility, means you must remap seeds for variety.
- L-systems describe *lines*, not polygons/volumes — you still need a second pass to turn stroke paths into road meshes or riverbanks.

### Notes for future Rigs Unbound direction
Rigs Unbound's routes are **authored intent in `world.ts`** (`RESOLVED_ROUTES`), and terrain constructs them from that intent. If the project ever adds *generated* routes (new procedural regions), an L-system or shortest-path-through-noise approach would be the connectivity-safe generator — but it must still feed through the route-validation and connectivity-probe gates before activation.

---

## 4. Wave Function Collapse (WFC)

### The idea
Given (a) a set of tiles and (b) adjacency constraints (this tile can border that tile), fill an output grid so every neighbour pair is legal. Each cell starts "superposed" with all possible tiles; you pick the lowest-entropy cell, collapse it to a tile, propagate the constraints, and repeat — backtracking if a cell is forced illegal.

### Why it's beloved
- Output looks **handcrafted** — villages, tilesets, architecture, interiors — because constraints encode real design rules (windows beside windows, walls adjacent, roofs on top).
- Works for both 2D tile maps and 3D voxel-style structures.

### Costs and failure modes
- **Unsatisfiable regions.** Sometimes propagation dead-ends; you need backtracking, a walk of failure, or repair. Budget the cost.
- **Backtracking cost** can blow up on large grids; mitigation is smaller regions, constraint relaxation, or "contradiction → resample a boundary."
- **"Boring" output** if constraints are too loose (everything anywhere) or too tight (template lockstep).
- Constraint authoring is a real craft; bad constraints produce cursed geometry that violates the spirit even when legally consistent.

### Rigs Unbound relevance
Not currently used — the game has no tile/interior/populated-settlement generation surface. WFC would be the *right* tool only if a future feature (modular barns, settlements, tile-based interiors) needs assembly of piece-sets under adjacency rules. Any such generator must still run through the content-admission + asset-resolution gate, since its output would define structure proxies and collision geometry that physics/renderer must agree on.

---

## 5. Room packing, BSP, and cellular automata (dungeons & interiors)

### Five standard families
1. **Random placement + corridor join** (Binding of Isaac first floors): scatter rooms, choose positions, connect nearest-neighbour or ordered loops. Simple, playable, but corridors can read as artificial.
2. **BSP (binary space partition):** recursively split a region; each leaf is a room; connect parent boundaries. Produces a balanced, tree-structured dungeon — easy to guarantee a spanning tree of connectivity and a hierarchy (e.g., boss at deepest leaf).
3. **Cellular automata** (CA): start with random fill, run `Game of Life`-ish rules (`if neighbourCount ≥ 4 → solid, if ≤ 1 → empty`) a few generations. Produces organic, cave-like blobs. Poor at guaranteed connectivity — you must carve connecting corridors afterward.
4. **Prefab/template stamping:** place authored room chunks into a grid or graph; assemble by rules (Hades, Returnal). Quality bounded by the authored pieces; deterministic and easy to tune difficulty per room.
5. **Graph-layout (the modern choice):** author the *abstract* layout as a node graph (start → shops → shrine → boss), then pick rooms and corridors to fit each node/edge. Gives explicit narrative control over structure while keeping per-room variety.

### The key tradeoff
- CA/organic = great texture, poor guarantee.
- Graph/BSP = great guarantee, more authored structure.
- Prefab stamping = best art quality per unit, least algorithmic novelty.
The industry trend is steadily toward **graph-layout + authored-prefab**, because it separates "guaranteed structure" from "random content within structure."

---

## 6. Agent-based and ecological simulation

### What it is
Entities ("agents") run simple local rules over many time-steps, and their individual actions *accumulate* into a grand structure. Examples: cars carving roads between towns, erosion agents lowering peaks, town agents deciding where to build, villages that grow by proximity.

### Why it's powerful
- **Emergent, self-affirming structures** that look like history — because they *have* a history. Roads connect places that evicted each other; cities form where rivers meet.
- **Reactive and fragile in a good way:** cut a road and the settlement pattern changes downstream.

### Costs
- **Expensive.** Thousands of agent steps for a whole world; usually precomputed offline at build time, not at runtime.
- **Hard to predict and validate.** Emergence is exactly what makes it hard to guarantee "this route is always passable." You add validation after the fact (this is why Rigs Unbound's world probe checks critical routes separately).
- **Determinism** is preserved if the agent loop has a fixed, seed-derived scheduling — but it makes rule-tweaking nonlinear and hard to tune.

### Rigs Unbound relevance
Not used. The repo's posture (deterministic kernel, authored guarantees, bounded budgets) pushes away from heavy runtime agent sims toward *constrained generators + validation*. If ecology/community-traffic generation is ever wanted, it fits the project's existing "community adaptation" direction only as a *precompute/offline* pass whose output is validated and frozen into immutable world data — not a live runtime writer.

---

## 7. Content composition and placement

### Chunk graphs
Author a **library of chunks** (room tiles, building blocks, terrain patches), then assemble them with a rule/registry. The generator's job is *connection and selection*, not creation. Pros: quality bounded by pieces, easy difficulty logic, deterministic. Cons: needs a big piece library; seams between chunks need handling.

### Template + parameters
One authored pattern with randomised values — a settlement whose *number of buildings, orientation, spacing* vary while the composition rule is fixed. Cheap, consistent, and tuneable. This is the highest-value-per-effort technique for most games.

### Seeded placement
Decide "is there a site here?" by reading a noise/lookup value at the coordinate:

```text
if hash(seed, cellX, cellY) in [0, density) → spawn a site variant
```

Because the lookup is a pure function of coordinate + seed, placement is deterministic without storing positions. Perfect for scatter-dressing (trees, rocks, grass tufts) and for Rigs Unbound's set dressing, which reads the world to place decoration.

---

## 8. Post-validation gates (the safety layer)

### Why every generator needs one
Generators are *statistically* correct. Zero validation means broken output reaches players: unreachable objectives, impossible terrain constraints, blocked critical routes, invalid rewards. Rigs Unbound's whole posture is that **proposal ≠ authority**: the generator proposes, the validation/state layer decides legality.

### The Rigs Unbound admitted-pipeline (from the world-content admission gate)
Any generated candidate must pass, in order:

1. **Schema validation** — types, versions, bounded fields.
2. **Semantic world validation** — unique IDs, resolvable references, finite in-bounds numbers.
3. **Cross-reference resolution** — sites/routes/structures/capabilities/responses resolve exactly once.
4. **Terrain/route/connectivity probe** — spawn reachable, critical routes unblocked, anchors not buried, no contradictory routes.
5. **Asset & capability compatibility** — rigs can physically do it; assets pass manifest/provenance approval.
6. **Normalization** → immutable runtime definition.
7. **Versioned activation** — with migration/rejection policy and a safe fallback for invalid content.

### Design principle
Validation fails **before a playable session starts**, returns a diagnostics report, and falls back to an already-approved pack where applicable. The renderer/audio/UI must *observe*, never *repair* — they must not silently invent values to make malformed content "look right."

---

## 9. Persistence: seed + deltas (why it wins)

### The two options
1. **Serialize the whole world** — fast to load, but save size scales with world size, is fragile to version drift, and defeats the point of procgen.
2. **Save seed + authored rules + deltas** — tiny saves, migration-friendly, replayable. Requires the world to be *derivable* (deterministic) and the deltas to be *bounded and sparse*.

### How Rigs Unbound does it
`GameWorld` is seed-bound and deterministic. `storage.ts` writes the world as **bounded spatial deltas** — terrain deformation, felled obstacles, collected nodes, surveyed cells — beside `GameState` in one versioned local payload, and restores them into the same world instance before settling the rig. It never serialises the heightfield. That is why saves stay ~constant-sized across a long session, and why the boundary-ridge / deformation bounds (`DEFORM` caps) exist: so a long session cannot grow the save without limit.

### The rule that protects it
A chunk may be *inactive in memory*, but it must never become an **alternative answer to what the world is at a coordinate.** `GameWorld` stays the only query surface for terrain, obstacles, exploration, collision, and persistence. Deltas carry an explicit owning region key; cross-boundary queries still go through `GameWorld`.

---

## 10. Streaming / residency (the tradeoff)

### What streaming buys and costs
- **Buys:** infinite worlds, bounded runtime memory, per-bit loading, async asset activation.
- **Costs:** a residency lifecycle (pending/active/evicted/rejected), activation validation, budget accounting, unload/rollback policy, seam handling, churn observability — a whole subsystem, plus the risk of a *silent second world model* if residency becomes a copy of world truth.

### The trigger discipline (Rigs Unbound's stance)
The streaming contract is deliberately **documented-future, not implemented** because the world is single-residency and there is no measured pressure. Start only when a profiler identifies a real source:

1. world/asset memory exceeding the declared device budget,
2. simulation or render work scaling with unloaded-distance content,
3. content that cannot be represented in the current authored field without independent residency,
4. a planned travel boundary whose assets need asynchronous activation.

### The first safe proof (smallest durable slice)
Not a full streamer:
1. one deterministic `WorldChunkKey` from fixed grid coordinates,
2. one manifest-validated request/validate/activate/unload lifecycle,
3. one active-chunk budget counter,
4. one operator-visible churn / activation-latency summary,
5. prove `activate → mutate → evict → reactivate` preserves terrain, obstacle, exploration, and save/load outcomes, including mutations on a chunk border.

### The key correctness rule (repeated)
Residency must partition **memory ownership and residency state**, never **world truth**. `GameWorld` remains the only answer to "what is at coordinate X." A chunk being evicted can never silently discard resident world memory — unload/rollback must be explicit and observability-recorded.

---

## 11. Determinism, reproducibility, and testing

### Why determinism is the foundation
Determinism is what makes all the other guarantees possible: reproducible saves, replay/ghost, auditable results, and bug reports you can actually re-run. Sources of non-determinism to hunt: frame-timing-dependent transitions, hash-map iteration order in RNG-dependent loops, floating-point non-associativity across threads, time/random global state, and logged-in-user identity.

### The test strategy that fits generators
You cannot snapshot-test "every possible world." Instead **assert invariants over the generator**:
- spawn point is inside reachable terrain, never inside the ridge;
- critical routes are passable;
- authored anchors stay flat and unburied (assert anchors beat noise);
- ridge limits and waterline are respected;
- deformation deltas stay bounded;
- generate many seeds in CI and assert the same invariants hold across them (property/seed-sweep testing).

Rigs Unbound's terrain tests already assert these invariants rather than trusting the authored tables — that is the correct pattern, applied to the generator.

### Replay and authority
Activation and material outcomes become **versioned events/checkpoints** where replay requires them. Renderer, audio, UI, and analytics observe outcomes; they cannot approve them by themselves.

---

## 12. Rigs Unbound — consolidated decision map

| Topic | Current stance | Future trigger to move | First safe proof if it moves |
|---|---|---|---|
| Terrain | Authored rules + seeded noise; anchored sites win | Adding a second region / want more variety | Keep anchors-after-noise; add biome relief only behind validation |
| Biome | Authored rules, not palette | New surfaces/regions | Surface record stays the single physical/visual source |
| Routes | Authored intent; terrain constructs them | Generated routes in new regions | L-system or shortest-path + connectivity probe |
| WFC / interiors | Not used | Modular buildings, settlements, interiors | Stamp authored chunks under a graph layout + asset gate |
| Agent sim | Not used | Community/ecology-reactive world | Offline precompute → validate → freeze to immutable data |
| World persistence | Seed + bounded deltas | World grows, deltas exceed budget | Assert/delta budget rollover, not full re-serialisation |
| Streaming / residency | Single residency, future-bound | Measured pressure (memory/sim/content/travel) | Chunk key + lifecycle + budget + border mutation test |
| Generated content / director | Gated, proposal-only | First multi-candidate experience | Two authored candidates + explain + no world mutation |
| External content packs | Gated, typed source canonical | Second content producer | Full ingestion pipeline + version policy in the same change |

**The throughline for every future world-building decision in Rigs Unbound:** *propose with a rule-based generator, validate through the canonical gate, activate only as versioned immutable data, and let authored intent and the deterministic kernel remain the source of truth.* No generator ever writes world truth directly; no validator silently repairs; no residency duplicates the world; no pack bypasses schema.

---

## Linked artifacts

- [Procedural World Building Primer](./PROCEDURAL_WORLD_BUILDING_PRIMER_2026-08-05.md)
- [World Schema and Content Ingestion Gate](./WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE_2026-07-26.md)
- [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
- [Procedural Director and Generated Content Admission Gate](./PROCEDURAL_DIRECTOR_AND_GENERATED_CONTENT_ADMISSION_GATE_2026-07-26.md)
- [World Graph and Place Contract](./WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md)
- [Authoring and Reproducible Content Validation Contract](./AUTHORING_AND_REPRODUCIBLE_CONTENT_VALIDATION_CONTRACT_2026-07-25.md)
- [src/game/world.ts](../../src/game/world.ts)
- [src/game/terrain.ts](../../src/game/terrain.ts)
- [src/game/gameworld.ts](../../src/game/gameworld.ts)
- [src/game/storage.ts](../../src/game/storage.ts)