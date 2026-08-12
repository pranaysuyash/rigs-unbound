# Procedural World Building — How It Works, Pros and Cons

**Date:** 2026-08-05
**Type:** Educational primer + Rigs Unbound mapping
**Status:** Reference document. It explains the technique space and then maps it to the repo's current architecture so future world-building decisions have shared vocabulary.
**Evidence tier:** Tier 1 static source and contract synthesis. No runtime commands run in this pass.

---

## 1. What "procedural world building" actually means

Procedural generation (procgen) is **content produced by rules and algorithms at runtime (or build time) instead of being hand-placed by an author**. Procedural *world building* is that idea applied to the world itself: terrain, biomes, roads, rivers, settlements, dungeons, vegetation, and even missions.

The defining property is **compression**: instead of storing a map, you store *the seed plus the recipe*. Given the same seed and the same rules, you get the same world. Change the seed, get a different world for free.

Three things every procgen system balances:

1. **Determinism** — same seed → same world, so saves, replays, and bug reports are reproducible.
2. **Constraint** — the generator must respect gameplay rules (a spawn point must not be inside a cliff; a road must reach somewhere useful).
3. **Quality** — output must pass the same bar a human author would set, and fail visibly when it does not.

Procgen is a **spectrum, not a binary**. Almost no serious game is "100% procedural" or "100% authored". The real question is *how much* of what layer is procedural, and *who* wins conflicts between generated output and authored intent.

---

## 2. The spectrum: authored → hybrid → procedural

| Approach | Who decides what exists | Examples | Strengths | Weaknesses |
|---|---|---|---|---|
| Fully authored | Humans place everything | Most linear games, handcrafted hubs (Dark Souls, Halo campaigns) | Total quality control, deliberate pacing, hand-made vistas | Expensive to scale, finite content, replay wears out |
| **Hybrid** (author + generator) | Humans author rules, intent, and anchors; generator fills the rest inside those rules | **Rigs Unbound (current)**, Minecraft's villages-in-handcrafted-seed, Breath of the Wild (generated noise + hand-placed shrines and towns), Spelunky 2 (levels composed from authored chunks) | Best of both: quality where it matters, scale where it does not | Requires discipline to keep "authored intent always wins" |
| Fully procedural | Algorithm decides everything from a seed | Minecraft (vanilla terrain), Dwarf Fortress (whole world), No Man's Sky (planets), Caves of Qud, Unexplored | Near-infinite scale, replayability, tiny storage | Hard to guarantee quality, authorial voice can vanish, balance and narrative suffer |

The industry trend is **away from "everything random" and toward curated hybrid**: generators that respect hand-authored anchors, constraints, and difficulty curves. See Spelunky 2, Deep Rock Galactic, Hades (hand-built rooms assembled by rules), Returnal.

---

## 3. Core building-block techniques

### 3.1 Noise functions — the ground layer
- **Value noise / Perlin noise / Simplex noise**: smooth pseudo-random scalar fields. Used for height, moisture, temperature.
- **fBm (fractal Brownian motion)**: several octaves of noise summed at increasing frequency / decreasing amplitude. Produces natural, self-similar detail — mountains at one scale, rocks at another. Rigs Unbound uses `fbm2` for its continental shape.
- **Domain warping**: sample noise *through* displaced coordinates (feed the noise a position that was itself displaced by noise). Creates organic, non-gridlike folds — the "large shape" pass in `terrain.ts`.
- **Ridged multifractal**: absolute-value noise (ridges) used for mountain spines and crests. Rigs Unbound uses `ridged2` masked for the impassable rim.
- **Perlin/Legendre-esque tricks**: radial falloff, smoothstep, and clamping shape noise into gameplay boundaries.

Noise gives you *a heightfield and a texture of values*. It does **not** give you places, meaning, or gameplay. That is the job of the layers above.

### 3.2 Biome mapping
Classify terrain by sampling multiple noise fields (elevation + moisture + temperature) and looking up a biome table. Biome becomes a **world rule, not a palette**: in Rigs Unbound, biome selects both visual surface and physical coefficients (grip, rolling drag, deformability), so a "marsh" changes driving physics, not just colour.

### 3.3 Heightfield construction order (Rigs Unbound's recipe)
From `terrain.ts`, composition order is load-bearing — swapping layers buries landmarks or flattens the world to glass:

1. domain-warped continental fBm — the large shape
2. biome-scaled mid relief — the character of a region
3. masked ridged multifractal — spines and the impassable rim
4. **authored site anchors** — guarantees flat, reachable places (anchors come *after* the noise so authored intent always wins)
5. micro relief — texture the suspension can feel
6. player deformation — the world remembers (sparse deltas)

### 3.4 Rules-based shape generators
- **L-systems / grammars**: rewrite rules grow roads, rivers, city blocks, trees, rivers, branching structures. Good for *paths and connectivity*.
- **Wave Function Collapse (WFC)**: given example tiles and adjacency constraints, generate an arrangement consistent with the constraints. Excellent for handcrafted-looking interiors, villages, tilesets — at the cost of backtracking cost and occasional unsolvable regions.
- **Dungeon / room-packing algorithms**: BSP trees, cellular automata, random room placement + corridors (Spelunky, Binding of Isaac).
- **Agent-based / ecologically-driven simulation**: entities "grow" terrain and ecosystems over time from simple rules (Dwarf Fortress, town simulation, road-building cars). Expensive but organic and reactive.

### 3.5 Content composition
- **Chunk graphs**: authored building blocks assembled by rules (Hades, Spelunky, No Man's Sky's parts). Quality is bounded by the quality of the pieces.
- **Template + parameters**: one authored pattern with randomizable values (sites, structures, encounters).
- **Seeded slot / noise-lookup placement**: the generator reads a noise value at a coordinate to decide "is there a site here?" — this is what makes placement deterministic without storing positions.

### 3.6 The critical non-technique: **post-validation**
Every generator must be paired with a validator. The generator proposes; the validator rejects, regenerates, or repairs anything that breaks a gameplay rule (unreachable objective, spawn inside a cliff, blocked critical route). Rigs Unbound's external-content admission gate and procedural-director gate both name this: *generated candidates must pass schema → semantic → capability → world-probe → budget validation before activation.*

---

## 4. How it works end-to-end (the canonical pipeline)

```
seed (string or int)
  → deterministic RNG (from seed)
  → noise fields / grammar / agents
  → constrained by authored tables (biomes, sites, routes, surfaces)
  → validated (reachability, spawn, capability, budget)
  → activated into a canonical world object
  → players mutate it (deltas)
  → save = seed + authored rules + deltas   (NOT the whole generated world)
  → replay = the same derivation with the same seed
```

The single most important architectural insight: **a procedural world is not saved as a map, it is saved as a recipe plus its edit history.** That is why Rigs Unbound persists terrain deformation, felled obstacles, collected nodes, and surveyed cells — bounded spatial memory — instead of a serialized copy of every height.

---

## 5. Advantages (pros)

1. **Near-infinite scale at near-zero authoring cost.** A seed is ~bytes; the world it implies can be arbitrarily large. Storage and build size stay tiny.
2. **Replayability and variety.** Change the seed, the run, or the day and the same content pipeline produces a fresh world. Core to roguelike and exploration design.
3. **Determinism enables reliable persistence and replays.** Seed + deltas means saves are small, migration-safe, and auditable. Rigs Unbound's replay/ghost and save contracts already rely on this.
4. **Consistent physics/world coupling.** When terrain, physics coefficients, navigation, and rendering all derive from the same deterministic substrate (one canonical query surface), there is exactly one world — no renderer-only geometry silently disagreeing with collision.
5. **Procedural texture variety.** Mass-decorating the world with vegetation, rocks, and set dressing becomes cheap, so long stretches of ground stop repeating.
6. **Cold-start / loading friendliness.** A seed generates on demand; no need to stream a multi-GB map on first load (the flip side is the streaming problem below).
7. **Creative serendipity.** Generators produce unexpected-but-valid configurations that human authors would never draw, which can seed new handcrafted content.

---

## 6. Disadvantages (cons)

1. **Quality control is hard.** Generators are statistically correct, not intentionally designed. You trade "why is this here?" craft for "this satisfies constraints." Uninteresting or broken output is a constant tail risk.
2. **Authorial voice and meaning erode.** A human can make a valley *mean* something. A generator makes a valley that meets elevation constraints. Narrative, landmark significance, and pacing must be injected deliberately (anchored sites are how Rigs Unbound preserves this).
3. **Balance and difficulty drift.** Randomness produces difficulty spikes, softlocks, and unplayable configurations unless validation and clamping are strict. Spawn-point guarantees and reachability probes exist exactly because of this.
4. **Bug-reproduction and test surface complexity.** Determinism helps, but a bug that only occurs for seed #48261 with a specific mutation history is harder to reason about than a hand-placed map. Tests must assert *invariants over the generator* (Rigs Unbound's terrain tests assert invariants rather than trusting tables).
5. **"Sameyness" and banding.** Without careful tuning, noise produces generic rolling hills and cursed repetition; seams appear at chunk borders, and fractal patterns read as artificial.
6. **Perf/cost of generation.** Full procedural world-gen at runtime is CPU/GPU work. Mitigations: precompute, LOD-based generation, streaming, generation in chunks. Rigs Unbound currently keeps generation cheap and single-residency by *not* streaming.
7. **Streaming/residency complexity.** Infinite worlds force chunking, residency lifecycles, unload/rollback policies, and budget accounting — a whole subsystem (see the Streaming World Manifest contract, which is deliberately staged as a *future* boundary in this repo).
8. **Tuning is a project of its own.** Every new rule interacts with every other; tweaking the biome map can silently break a route guarantee. The rule surface needs the same testing discipline as gameplay code.

---

## 7. The trap list (patterns that fail)

- **Generator directly mutating world truth.** Generated output must pass validation and a canonical activation path before it becomes state. Rigs Unbound's director gate forbids the director from writing to `GameState`/`GameWorld` directly.
- **Persistence of the whole generated world.** Saving an entire heightfield instead of seed + deltas destroys the point and bloats saves.
- **Renderer-only placement.** If the renderer invents geometry that physics/navigation don't know about, players fall through or drive into invisible walls. One canonical query surface must own "what exists."
- **No validation gate.** Unvalidated output produces unreachable objectives, impossible terrain constraints, and dead critical routes.
- **Hidden chunk policy.** If residency/runtime loading is an emergent property of radius logic instead of a named budget, you get a silent second world model.
- **Confusing "procedural selection" with "AI-driven generation".** Selecting between two authored candidates (safe) and having a model author new world/event content (untrusted input + privacy + safety layer) are different risk classes. Rigs Unbound treats them separately.

---

## 8. Pros vs cons — decision cheat-sheet

| If you need… | Then procgen… |
|---|---|
| Endless variety / replayable exploration | Strong yes |
| Tiny storage / small download | Strong yes (seed + rules) |
| Reliable saves & replays | Yes, if deterministic |
| Hand-crafted moments and storytelling | Weak — inject via anchored authoring |
| Predictable difficulty and pacing | Yes, only with validation gates |
| Total visual/artistic control | Weak — generators need heavy art direction |
| Simple bug hunting across all possible worlds | Weak — needs invariant-based testing |
| Small team, big world | Strong yes — the whole reason it exists |

---

## 9. When to move along the spectrum (general guidance)

1. **Start authored, add procedure where cost is real.** Hand-place what is cheap and critical; generate what is abundant and low-stakes. Rigs Unbound's `world.ts` authored tables (radius, surfaces, biomes, sites, routes) + seeded terrain fill is this exact split.
2. **Make authored intent always win.** If a generator and an authored site disagree, the authored site wins. Rigs Unbound puts site anchors *after* the noise so a landmark can never be buried.
3. **Add a validator before you add a bigger generator.** A generator without a gate is a liability, not a feature.
4. **Stream only when measured pressure says so.** A named residency/budget subsystem is cheaper to add later than to remove if premature.
5. **Preserve one canonical world truth.** No matter how much is generated, there is exactly one answer to "what is at coordinate X."

---

## 10. Rigs Unbound — where the project actually sits

| Layer | Current approach | Source / contract |
|---|---|---|
| World shape & identity | **Authored** — one disc world, `WORLD_RADIUS = 250`, boundary ridge, `WATER_LEVEL`, waterline limits | `src/game/world.ts` |
| Surfaces & physics coefficients | **Authored** — grip, rolling drag, deformability, spray per surface | `src/game/world.ts` `SURFACES` |
| Biomes | **Authored** — biome tables select surface/relief; biome is a world rule, not a palette | `src/game/world.ts` `BIOMES` |
| Landmarks / sites / routes / structures | **Authored** — canonical IDs consumed by terrain, discovery, renderer, minimap, navigator, collision | `src/game/world.ts`, `WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE` |
| Terrain heightfield | **Procedural inside authored rules** — seeded composition (domain-warped fBm → biome relief → masked ridges → **authored anchors** → micro relief → player deformation) | `src/game/terrain.ts`, ADR-0007 |
| World memory / persistence | **Seed + bounded deltas** — deformation, felled, collected, surveyed; never a serialized heightfield | `src/game/gameworld.ts`, `src/game/storage.ts` |
| Streaming / residency | **Not implemented, deliberately staged** — single-residency world until a measured trigger | `STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT` |
| Procedural director / generated content | **Not active, gated** — proposal-only, must never mutate world truth directly | `PROCEDURAL_DIRECTOR_AND_GENERATED_CONTENT_ADMISSION_GATE` |
| External content packs | **Not active, gated** — typed source remains canonical; validation pipeline required before any external producer | `WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE` |

The honest summary: **Rigs Unbound is already a hybrid-procedural game — it generates terrain from a seed, but every gameplay-meaningful thing (landmarks, routes, surfaces, biome rules) is authored, and authored intent is guaranteed to win.** That is the strongest position on the spectrum for a small team shipping an open-world vehicle game, and it matches where the industry has converged.

### What the primer implies for the project's next decisions

- **Streaming residency stays future-bound until a measured pressure source exists** (memory budget breach, render/sim scaling with unloaded distance, a new travel boundary, or content needing independent residency). The first proof is a deterministic chunk key + one validated request/validate/activate/unload lifecycle + a budget counter — *not* a full streamer.
- **If the world grows procedurally (new regions), the content-ingestion gate is the contract that must land with it**: schema → semantic validation → cross-reference → terrain/route/connectivity probe → asset/capability checks → immutable runtime definition → versioned activation. Never bypass it with ad hoc runtime objects.
- **Any future "director" is a proposal system only.** It ranks candidates; validation/state systems decide legality; the unselected candidate must not mutate the world.
- **Invariant-based testing is the correct test strategy for the generator**: assert spawn guarantees, route reachability, anchor flatness, ridge limits, and that authored intent beats noise — not pixel-perfect world snapshots.

---

## 11. Glossary

| Term | Meaning |
|---|---|
| Seed | Small input that fully determines a deterministic generator's output |
| fBm | Fractional Brownian motion — summed noise octaves for natural detail |
| Domain warping | Sampling noise through displaced coordinates for organic folds |
| Ridged multifractal | Absolute-value noise creating crests/ridges |
| Biome | A region-classifying rule (elevation/moisture/temp) — a rule, not a texture |
| Anchor | Authored point that the generator must respect (flat pad, landmark site) |
| L-system | Rewrite grammar for branching structures and paths |
| WFC | Wave Function Collapse — constraint-based tile arrangement |
| Chunk | A bounded region with a residency lifecycle (future boundary in this repo) |
| Deltas | Player-caused changes persisted on top of seed-derived world |
| Validation gate | The layer that rejects invalid generated output before activation |

---

## 12. Deep dives

Every technique and tradeoff in this primer is expanded at implementation depth — including WFC, L-systems, noise composition, agent sims, persistence, streaming/residency, and the testing strategy — in
[Procedural World Building — Deep Dives](PROCEDURAL_WORLD_BUILDING_DEEP_DIVES_2026-08-05.md).

## 13. Further reading

- Sebastien Lague's *Procedural Generation* YouTube series — the standard visual primer.
- *Procedural Generation in Game Design* (Short & Adams, eds., CRC Press) — comprehensive anthology.
- Amit Patel's Red Blob Games (redblobgames.com) — noise, WFC, road/river generation, world building.
- Kate Compton's *Practical Procedural Generation for Everyone* — the "build a generator that knows what it's for" framing.
- Kate Compton, *So you want to build a generator* (GDC 2016) — the canonical "generator construction kit" talk.

## Linked artifacts

- [World Schema and Content Ingestion Gate](./WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE_2026-07-26.md)
- [Streaming World Manifest and Residency Contract](./STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
- [Procedural Director and Generated Content Admission Gate](./PROCEDURAL_DIRECTOR_AND_GENERATED_CONTENT_ADMISSION_GATE_2026-07-26.md)
- [World Graph and Place Contract](./WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md)
- [src/game/world.ts](../../src/game/world.ts)
- [src/game/terrain.ts](../../src/game/terrain.ts)
- [ADR-0007](../decisions/README.md) — procedural-inside-authored-rules
