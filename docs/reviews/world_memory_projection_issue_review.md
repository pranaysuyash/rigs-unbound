# World Memory Projection Issue Review

Date: 2026-07-26

Status: contained as a non-authoritative prototype; no gameplay integration

## Finding

`src/game/world-memory.ts` derives a coarse `Map` of tilled or muddy soil cells
from `GameState.furrows` and current rig telemetry. Static reference search
finds no runtime caller outside its dedicated unit test.

The live world-memory path is separate and canonical:

```text
state step
  -> GameWorld.terrain.deform(...)
  -> GameWorld.snapshot() / WorldMemoryRecord
  -> storage save/load
  -> terrain, collision, camera, exploration, and renderer queries
```

The projection does not currently enter that path.

## Why this matters

The project promise is that terrain remembers work. A future consumer that
treats the derived map as physical truth would create two incompatible answers
to the same question:

- canonical terrain deformation uses `DEFORM_CELL = 1.5` metres and supports
  bounded elevation changes;
- the dormant projection groups state history into `SOIL_CELL_SIZE = 4` metre
  cells and infers depth from capped furrow marks and current wheel slip.

It cannot currently represent all canonical changes, including fill operations,
and it is neither persisted nor queried by physics. Promoting it directly would
make visual, collision, and save behavior diverge.

## Containment applied

- Updated the module header to identify it as a pure, non-authoritative
  projection.
- Documented that it must not mutate terrain, participate in persistence, or
  become a surface-query source.
- Preserved the code and its focused test rather than deleting potentially
  useful future analysis infrastructure.

## Future activation contract

Only reactivate this idea when a named feature needs an aggregate history view,
such as route wear, field maintenance, a map overlay, or a world-history
director. That feature must:

1. Read canonical `GameWorld` deformation and durable world memory, not only
   `GameState.furrows` or current telemetry.
2. Declare whether its output is presentation-only, analytics-only, or a new
   authoritative simulation field. The last option requires a versioned
   migration, query ownership decision, and save contract.
3. Keep the projection derivable and disposable; it must be rebuildable after
   load, chunk activation, replay, or recovery without becoming another save
   record.
4. Test cut, fill, mud, boundary cells, restore, and reset against the canonical
   terrain outcome.

## Evidence and remaining work

- Tier 1: static source/reference inspection; the only current non-test
  reference is the module itself.
- No behavior was changed and no tests were run in this pass.
- A runtime caller, if introduced later, requires Tier 2 equivalence tests and
  Tier 3 browser evidence that the derived visualization or activity feedback
  agrees with physical terrain.
