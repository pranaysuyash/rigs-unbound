# World Graph and Place Contract (2026-07-28)

**Status:** proposed topology contract - not implemented as a separate runtime authority  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related episode contract:** [Episode Runner Specification](./EPISODE_RUNNER_SPEC_2026-07-27.md)  
**Related ledger contract:** [Contract Ledger Specification](./CONTRACT_LEDGER_SPEC_2026-07-27.md)  
**Related shell contract:** [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)  
**Related roadmap:** [Integration-First Design and Unification Roadmap](../exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md)

## Purpose

Define the canonical world topology that the rest of the integration-first
stack reads.

The world graph is the master description of place. It is the topology that
connects authored sites, routes, regions, discovery signals, and future
procedural chunks into one navigable world. It is not a second simulation
authority, and it is not a decorative minimap structure.

This contract exists because the roadmap already names a "world graph" as the
foundation for the contract ledger and episode runner, but the repo did not yet
have a durable, explicit contract file for it.

## Current evidence the world graph contract must respect

- `src/game/world.ts` already defines authored sites, site signals, route
  segments, and resolved routes.
- `src/game/rumor-graph.ts` already defines graph-only nodes and edges that are
  close to the intended navigation model.
- `src/game/state.ts` already exposes `sites`, `worldMemory`, and the other
  read surfaces that make place legible to the rest of the stack.
- `docs/exploration/EXPLORATION_MAP.md` already sketches the connected-world
  model, generation layers, and validation needs.
- `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`
  already names the world graph as a unifying layer beneath the contract
  ledger and episode runner.

## Decision

The world graph is the **canonical topology of place**.

It must:

- describe where authored sites live,
- describe how routes connect them,
- describe how discovery and signals are attached to place,
- provide the source surface for navigation and episode selection,
- and remain readable to both player-facing and operator-facing systems.

It must not:

- become a second save schema,
- become a separate world simulation authority,
- contradict the terrain or route evidence in the runtime,
- or replace the current fixed-step kernel that actually mutates the world.

## World graph primitives

### Node

A node is a named place or navigable anchor. Examples:

- authored site,
- region anchor,
- route node,
- future activity anchor,
- future procedural place.

### Edge

An edge is a traversable relation between nodes. Examples:

- road or path segment,
- capability-gated passage,
- future portal or boundary,
- episode-graph link.

### Place

A place is a node plus the authored and generated material that makes it
meaningful:

- terrain grounding,
- discovery signals,
- affordances,
- nearby routes,
- readable identity,
- event hooks.

### Region

A region is a cluster of places with shared environmental or mechanical rules.

### Graph state

Graph state is the durable description of what is known, reachable, discovered,
blocked, or newly available in the current save.

## Generation layers

The connected-world model should keep the layers explicit:

```text
world graph → biome/region → terrain/routes/settlement → landmarks/activity anchors → encounters/resources → invariant validation → chunk packaging
```

The graph is the structural layer; terrain and content are derived layers that
must agree with it.

## Runtime sources

The world graph contract should be derivable from the current runtime sources:

- `WORLD_SITES`
- `SITE_SIGNALS`
- `WORLD_ROUTES`
- `RESOLVED_ROUTES`
- `publicState.sites`
- `publicState.worldMemory`
- `publicState.progression`
- the rumor graph node/edge definitions

The contract should not require a hidden duplicate topology store.

## Lifecycle

1. Read authored sites, routes, and discovery anchors.
2. Resolve the current graph state from the save and world data.
3. Attach discovery, reachability, and region context.
4. Expose the result to the contract ledger, episode runner, and UI shell.
5. Persist durable world deltas through the normal save path.

## Validation rules

The contract should fail visibly if it:

- invents a place that cannot be traced to authored or validated source data,
- allows a route that cannot be traversed by the declared capability envelope,
- hides discovery state or makes it non-deterministic,
- contradicts the terrain / route / site evidence,
- or becomes a separate truth source for topology.

## World-graph checks

The first durable graph checks should include:

- reachability and safe spawns,
- route clearance by vehicle dimensions and capabilities,
- mission solvability and exit paths,
- landmark spacing and readability,
- impossible overlap and physics stability,
- ecology and resource consistency,
- deterministic hashes under supported environments,
- recovery to an authored fallback chunk.

## Out of scope for this first slice

- No streaming system rewrite.
- No new save schema.
- No separate map authority.
- No procedural world generator overhaul.
- No multiplayer topology migration.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one canonical place graph readable from the existing runtime surfaces,
2. one route-clearance validator,
3. one discovery / signal mapping proof,
4. one durable fallback or recovery rule,
5. one source trace from the graph to the ledger and episode runner.

## Open questions

- Should the world graph be a single manifest or a family of manifests by scale
  regime?
- Should rumor-graph navigation remain a projection of the world graph or a
  separate authored layer that must stay in lockstep?
- Should chunk packaging own region boundaries, or should region boundaries be
  the source of chunking?
- How much of the world graph should be visible directly to the player versus
  only through derived shell surfaces?

## Anything else?

Yes: place is the thing the player remembers. If the graph cannot explain why a
place matters, it is not yet a useful topology contract.
