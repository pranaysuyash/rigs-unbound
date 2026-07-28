# Simulation Layers and Resource Governance Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s implicit multi-domain loop into a named simulation-layer contract with explicit ownership and update order.

The engine already separates terrain, physics, collision, persistence, presentation, and observable performance. What it does not yet have is a first-class contract that names the non-render simulation layers, their order, their read/write boundaries, and their downgrade behavior when budgets tighten.

## Current evidence base

- Deterministic kernel and ordered mutation surface:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- World substrate and spatial memory split:
  - [src/game/gameworld.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/gameworld.ts)
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
- Observable runtime pressure:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Resource-budget sibling note:
  - [docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)
- Roadmap lane for simulation layers and governance:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the ingredients of a layered simulation:

- terrain is canonical and shared,
- physics and collision are distinct from presentation,
- game-world memory is bounded and serializable,
- runtime performance is observable,
- the kernel already applies state transitions in a fixed order.

That means the architecture is already layered in practice even if the layer contract is not yet named.

## What is still missing

The current surface still lacks:

- a named domain-order table for simulation layers,
- a clear owner for each layer’s state,
- explicit read/write boundaries between layers,
- a declared emit/downstream contract,
- a governance rule for how budget pressure changes layer behavior,
- a traceable summary of which layer caused a fallback or downgrade.

## Contract shape

A durable simulation-layer contract should separate:

1. **Domain order**
   - terrain/traversal
   - physics/collision
   - behavior/mission logic
   - weather/atmosphere
   - economy/resource flow
   - persistence/recovery
   - presentation feedback
2. **Ownership**
   - what each layer owns
   - what each layer may read
   - what each layer may mutate
   - what each layer must never bypass
3. **Budget governance**
   - CPU budget
   - GPU budget
   - active actors/entities
   - residency/chunk load
   - save/migration cost
4. **Fallback policy**
   - which layer simplifies first
   - how the downgrade is surfaced
   - what telemetry is emitted
   - how recovery is detected

This keeps the simulation loop composable instead of turning it into one opaque “game step.”

## Validation rules

The contract should fail visibly if it:

- lets a layer mutate state outside its ownership boundary,
- skips the declared order,
- hides a budget downgrade,
- degrades a layer without naming the responsible domain,
- makes fallback depend on hidden heuristics instead of policy,
- allows a presentation layer to become an authority surface.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one owned domain-order table for non-render layers,
2. one budget ledger spanning CPU, GPU, active actors, and residency,
3. one fallback-policy test for a low-budget profile,
4. one telemetry path that records which layer caused a budget downgrade.

## Open questions

- Which layer should be the canonical first downgrade point when budgets tighten?
- Should weather and economy start as optional lanes or as always-on no-op layers?
- Should fallback summaries be surfaced in the HUD, the debug panel, or both?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)
- [RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)

## Anything else?

The simulation kernel is already strong enough to support multiple domains.
This contract names the order and the ownership rules so future weather,
economy, traffic, or mission layers stay measurable instead of becoming
implicit behavior glued onto the main loop.

## Addendum (2026-07-25): layered runtime exists, governance ledger does not yet

- Re-checked the current browser surface and repo state after the simulation
  layer review.
- The live app is still `Rigs Unbound — Field 02`, and the browser daemon
  remains healthy with zero console logs in the current status snapshot.
- The runtime already has layered simulation ingredients:
  - one deterministic gameplay kernel in `src/game/state.ts`,
  - terrain/physics/collision separation,
  - bounded world memory in `src/game/gameworld.ts`,
  - explicit runtime performance sampling in `src/game/performance.ts`,
  - renderer feedback separate from state ownership.
- What is still missing is the named governance layer this contract asks for:
  - an owned domain-order table for non-render layers,
  - a budget ledger that explicitly spans CPU, GPU, active actors, residency,
    and save/migration cost,
  - a fallback-policy table that says which layer downgrades first,
  - a recorded downgrade reason that can be surfaced back to the operator.
- In other words: the repo already behaves like a layered sim, but the budgets
  and downgrade policy are still implicit rather than contract-bound.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - fresh Field 02 recheck, same governance gap

- Re-checked the simulation-layers contract against the current browser daemon
  and live Field 02 runtime.
- The daemon still reports a healthy browser surface with zero console logs.
- The current runtime still proves the layered-simulation premise:
  - `src/game/state.ts` runs a deterministic gameplay kernel with ordered
    mutation,
  - `src/game/gameworld.ts` keeps world memory bounded and serializable,
  - `src/game/terrain.ts` and collision/physics stay separate from rendering,
  - `src/game/performance.ts` and `src/main.ts` expose runtime pressure
    measurements,
  - presentation still consumes snapshots rather than owning world truth.
- That means the repo already behaves like a layered sim in practice.
- The missing layer is still the named governance contract:
  - no owned domain-order table for non-render layers,
  - no explicit CPU/GPU/active-actor/residency/save budget ledger,
  - no fallback-policy table naming which layer downgrades first,
  - no recorded downgrade reason surfaced as policy.
- So the simulation stack is real, but the budget/governance envelope is still
  implicit rather than a first-class contract.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - the layered sim is live, but the governance ledger is still implicit

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/game/state.ts` still exposes the layered shape in the runtime:
  - world time and phase,
  - progression,
  - activity,
  - state snapshots and validation on load.
- `src/game/contracts.ts` still treats spendable resource as singular by design,
  which keeps the current resource economy simple and explicit rather than
  broad and inferred.
- `src/game/gameworld.ts` and `src/game/performance.ts` still provide the other
  halves of the layered sim:
  - bounded world memory,
  - observable runtime pressure,
  - separate persistence versus presentation ownership.
- That means the app already behaves like a layered simulation, but the named
  governance layer is still missing:
  - no owned domain-order table for non-render layers,
  - no CPU/GPU/actor/residency/save budget ledger,
  - no fallback-policy table naming which layer downgrades first,
  - no downgrade reason surfaced as policy.
- The useful conclusion is the same but now current: the engine already has
  layered simulation behavior, and the next durable step is to name the
  governance and downgrade policy so the budget story is reviewable instead of
  implicit.

## Addendum (2026-07-26) - renderer resource inputs are observable, cross-layer governance remains future-bound

`RendererMetrics` now includes raw Three.js geometry and texture counts in
addition to the existing frame and draw-path signals. This is a useful renderer
domain input for future governance because it distinguishes a visible-frame
problem from a resource-retention problem without claiming a browser-specific
VRAM total.

It does not yet constitute the governance ledger described by this contract:

- there is no comparable authoritative budget sample yet for active actors,
  residency, persistence cost, or future behavior/weather/economy domains;
- no cross-domain priority order decides which subsystem may degrade first;
- geometry/texture counts are not mapped to an automatic fallback threshold;
- asset bridge attribution requires a separate isolated measurement protocol,
  because aggregate counts include procedural and shared runtime resources.

The correct current boundary is therefore: renderer resource metrics are
observable diagnostics, while `mobile-safe` remains the only implemented
renderer-profile fallback. A cross-layer ledger becomes implementation-ready
only after at least one non-render domain has a measured pressure signal and a
safe degradation action that can be compared against the renderer policy.

Evidence tier: Tier 1 static inspection. No new fallback action, target-device
measurement, or cross-layer policy was introduced by this addendum.

## Addendum (2026-07-26) - the simulation stack is layered, but only the renderer has an active downgrade path

- Re-checked the current runtime against the simulation-layer contract.
- The code already behaves like a layered sim in practice:
  - `src/game/state.ts` owns deterministic kernel ordering and game-state
    consequences,
  - `src/game/gameworld.ts` keeps spatial memory bounded and serializable,
  - `src/game/performance.ts` measures pressure,
  - `src/game/runtime-profile-policy.ts` turns measured pressure into a
    renderer-only fallback path,
  - `src/main.ts` surfaces the measurements and selected profile.
- That means the layers are not merely conceptual anymore; they are explicit in
  the runtime.
- What is still missing is the broader governance ledger:
  - no named budget owner for non-render layers,
  - no active-actor/residency/save budget table,
  - no first-class downgrade policy for simulation, persistence, or content
    layers,
  - no visible operator summary that compares those layers against the renderer
    policy.
- So the durable boundary is now sharper: the repo has a real layered
  simulation with one active renderer downgrade path, but the cross-layer
  resource-governance envelope remains future work.

## Addendum (2026-07-26) - simulation governance supports episode grammar, but it does not replace it

- The layered simulation already does important support work for episodes:
  it keeps domain order, ownership, and fallback policy readable when multiple
  systems interact.
- That makes simulation governance a support layer for the named composition
  boundary, because episodes only stay coherent if weather, economy, traffic,
  persistence, and presentation still follow a visible order under pressure.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - simulation governance keeps the interacting domains ordered and
    downgradeable,
  - the episode layer remains the named composition stack above those
    domains, now named in
    [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
    and [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md).
- This note intentionally does not promote the governance ledger into a story
  system; it only keeps the dependency visible so future episode work can rely
  on the same domain-order policy.

## Addendum (2026-07-27): parallel-owned runtime tranche now points at these simulation families

- A new parallel-owned runtime tranche surfaced with atmospheric, debris,
  electrical-grid, and expedition-economy modules.
- Those modules fit the existing simulation-layer families in this contract:
  weather/atmosphere, terrain/mobility interaction, power/resource flow, and
  regional economy.
- The tranche is implementation evidence, not canonical adoption. It widens the
  proof surface for these domains, but it does not yet add a governance ledger
  or a new budget owner for them.
- The long-term implication is unchanged: if these systems become canonical,
  they should inherit the same ordered, downgradeable, evidence-first treatment
  as the existing simulation layers, while the episode composition boundary
  stays named in [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
  and [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md).
