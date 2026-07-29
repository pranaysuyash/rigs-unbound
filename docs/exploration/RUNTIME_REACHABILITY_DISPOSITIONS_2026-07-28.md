# Runtime Reachability Dispositions

Date: 2026-07-28

The runtime reachability audit records a budgeted unreachable-module set. The
exact measured count and module-by-module ownership are classified in the
ownership matrix review; the budget is enforced separately by
`npm run audit:reachability:budget`. These modules are not silently treated as
player-facing features.

## Disposition

The following modules are retained as tested design probes or future vertical
candidates. They are not claimed as reachable gameplay until a future tranche
wires them through a canonical command and state path:

- `asset-manager.ts`
- `campaign.ts`
- `signature.ts`
- `ghost.ts`
- `winch-physics.ts`
- `salvage-crafting.ts`
- `seismic-probe.ts`
- `world-memory.ts`
- `thermal-camera.ts`
- `procedural-missions.ts`
- `expedition-economy.ts`
- `radio-scanner.ts`
- `fleet-recovery.ts`
- `topo-map.ts`
- `workshop-lab.ts`
- `electrical-grid.ts`
- `debris-physics.ts`
- `landslide-hazard.ts`
- `vehicle-maintenance.ts`
- `soil-ecosystem.ts`
- `thermal-engine.ts`
- `fuel-efficiency.ts`
- `cargo-crane.ts`
- `surface-moisture.ts`
- `winch-pulley.ts`

This is an explicit archive/defer disposition, not evidence that the player can
use these systems. New player-facing work must either wire a module and reduce
the count or replace an archived module with a documented reason and preserve
the budget.

See also: [Runtime Reachability Ownership Matrix](../reviews/RUNTIME_REACHABILITY_OWNERSHIP_MATRIX_2026-07-28.md) for the fuller ownership classification and module-by-module rationale.

## Enforcement

- `npm run audit:reachability` produces the inventory.
- `npm run audit:reachability:budget` fails if unreachable modules exceed 25.
- `npm run test:reachability` validates the audit tool itself.
