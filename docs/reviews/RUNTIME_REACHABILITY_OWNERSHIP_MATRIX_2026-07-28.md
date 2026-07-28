# Runtime Reachability Ownership Matrix (2026-07-28)

## Purpose

The runtime-reachability audit now gives the repo a measured orphan set:

- 79 non-test source modules total
- 50 entry-reachable modules
- 29 unreachable modules
- 2,201 unreachable lines
- 28 of the 29 unreachable modules already have tests
- `src/game/asset-manager.ts` is the only unreachable module with no tests

This review turns that measured set into an ownership classification so we do
not accidentally treat parallel-owned or future-bound work as junk.

The audit is static. It proves absence of a path from current entry points. It
does **not** prove a module is unused, dead, wrong, or safe to delete.

## Classification policy

- **Parallel-owned** means another active agent or branch has clearer current
  ownership than the audit can prove.
- **Future-bound contract** means the module is intentional design work that is
  not yet wired into the shipped entry graph.
- **Lab-only surface** means the module exists to support evidence, probes, or
  experimental surfaces rather than the player loop.
- **Contained prototype** means the module is a deliberate non-authoritative
  experiment with its own containment review and no gameplay integration yet.
- **Superseded contract** means the module once represented a real design
  direction, but a newer canonical path now owns the live contract.
- **Dead code** means the module has no current purpose, no credible planned
  purpose, and no preservation value.

Reachability alone is not enough to mark something dead.

## Findings

### Parallel-owned

None proven by this audit.

Static reachability does not carry provenance. Without explicit branch or task
ownership, the safe stance is to preserve the code until a caller inventory or
parallel-work handoff says otherwise.

### Lab-only surface

- `src/game/workshop-lab.ts`

Reason:

- the name and existing architecture notes frame it as a workshop-lab surface,
  not a canonical player path;
- the audit says it is not entry-reachable, but the surrounding docs treat it
  as a useful evidence fixture rather than junk.

### Contained prototype

- `src/game/world-memory.ts`

Reason:

- the module header says it is a pure, read-only interpretation of saved furrow
  and rig telemetry data;
- the dedicated review at
  `docs/reviews/world_memory_projection_issue_review.md` already classifies it
  as a contained non-authoritative prototype with no gameplay integration;
- the only code reference is its own unit test, so the module is intentionally
  preserved as an analysis surface rather than a live runtime path.

### Superseded contract

These modules look like intentional product or architecture work that is no
longer the canonical live path:

- `src/game/asset-manager.ts` - superseded by the manifest-driven runtime asset
  path in `src/game/runtime-assets.ts` and the renderer’s runtime bridge. The
  old centralized loader example survives in docs as historical context, but it
  is not the live admission path.
- `src/game/procedural-missions.ts` - superseded by the newer derived mission
  proposition system in `src/game/mission-propositions.ts` and the mission
  acceptance surface contracts. The old generator sketch still has a test and
  documentation trail, but it is no longer the canonical mission path.

### Future-bound contracts

These modules look like intentional product or architecture work that is not yet
wired into the current entry graph:

- `src/game/xp-progression.ts` - mode-scoped XP projection, with current docs
  keeping campaign progression canonical
- `src/game/campaign.ts` - campaign contract spine; tested and documented, but
  still not imported by the shipped runtime entry graph
- `src/game/signature.ts` - identity/signature contract
- `src/game/ghost.ts` - future-bound replay / ghost helper; tests exist, but
  the live replay authority remains the bounded run-record lane
- `src/game/winch-physics.ts` - rescue / recovery mechanics
- `src/game/weather.ts` - future-bound weather / traction contract; pure and
  tested, but the live runtime still passes weather as an injected string and
  does not import this module yet
- `src/game/salvage-crafting.ts` - salvage economy / crafting contract
- `src/game/seismic-probe.ts` - tactical sensing contract
- `src/game/thermal-camera.ts` - tactical sensing / inspection layer
- `src/game/procedural-missions.ts` - mission generation contract
- `src/game/expedition-economy.ts` - route / economy contract
- `src/game/radio-scanner.ts` - sensing / discovery contract
- `src/game/fleet-recovery.ts` - stranded-rig rescue payoff
- `src/game/topo-map.ts` - map / terrain-communication layer
- `src/game/differential-lock.ts` - traction / terrain-control contract
- `src/game/electrical-grid.ts` - infrastructure / power contract
- `src/game/debris-physics.ts` - destructible-world / debris contract
- `src/game/landslide-hazard.ts` - terrain hazard contract
- `src/game/vehicle-maintenance.ts` - upkeep / damage / service contract
- `src/game/soil-ecosystem.ts` - ground-state / growth contract
- `src/game/thermal-engine.ts` - heat / powertrain contract
- `src/game/fuel-efficiency.ts` - economy / range contract
- `src/game/cargo-crane.ts` - logistics / lifting contract
- `src/game/tire-pressure.ts` - traction control contract
- `src/game/surface-moisture.ts` - terrain-state contract
- `src/game/winch-pulley.ts` - recovery / towing mechanism

The thematic clustering matches the repo’s own reachability brainstorm: this is
the tactical vocabulary of the reclamation game, not random leftover code.

### Dead code

None proven.

The strongest available evidence points the other way: these modules align with
documented future systems, a tactical-off-road gameplay thesis, or lab/evidence
surfaces. Deleting them on reachability alone would risk discarding the parts
bin the project still intends to wire.

## What this means operationally

1. Do **not** delete any of the unreachable modules just because the audit
   found them unreachable.
2. Before wiring anything, re-derive the module against the current canonical
   layers and document whether it is supersession, wiring, or archival.
3. Treat `asset-manager.ts` as a superseded contract, not a live loader path.
   Preserve it as historical documentation unless a future wiring tranche
   explicitly revives the pattern.
4. Treat `workshop-lab.ts` as lab-only until a player-facing surface explicitly
   adopts it.
5. Keep the other modules as future-bound contracts until a named tranche or
   ADR wires them into the current loop.

## Next safe action

Inventory callers, then choose one of:

- wire through the canonical path,
- archive with an explicit decision record, or
- keep deferred with a documented product or architecture reason.

The audit is now a classification signal, not a cleanup order.
