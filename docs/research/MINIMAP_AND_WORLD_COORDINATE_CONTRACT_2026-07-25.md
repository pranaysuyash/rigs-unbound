# Minimap and World-Coordinate Contract (2026-07-25)

## Purpose

Keep navigation, exploration memory, solver transforms, streaming, and
large-world experiments aligned to one project-owned coordinate truth.

Physics engines should move rigs. They should not own what the map means, which
places have been surveyed, or how persistent world identity is represented.

## Current evidence

The existing `FieldMap` is already more than a decorative minimap:

- it lazily samples the canonical terrain field rather than renderer geometry;
- it reveals only surveyed cells;
- it draws discovered authored sites, nearby salvage, cargo, the active rig,
  and heading;
- it consumes game-state `x/z` and canonical world constants, not Three.js
  objects or physics bodies;
- it records first-open terrain-build cost separately from boot.

That separation is correct and must survive solver adoption.

## Current gaps

- Dynamics labs do not display a map or prove that extracted solver transforms
  align with the canonical terrain/map coordinates.
- The map assumes one fixed world disc centered on the current origin.
- Chunk residency, origin rebasing, portals, interiors, altitude layers, water,
  air, and orbital spaces have no map-space contract yet.
- Collision/occlusion changes are not represented: a felled tree can persist in
  world memory while the map has no obstacle-change layer.
- The map does not expose route cost, slope, clearance, rig capability, or
  surface suitability.
- There is no automated round-trip check from world position to map pixel and
  back.

## Coordinate ownership

Use three explicit spaces:

```text
Persistent world coordinate
    stable identity used by saves, activities, discoveries, and maps

Simulation-local coordinate
    bounded coordinate passed to the active physics world or chunk

Presentation coordinate
    renderer/camera-relative coordinate used for visual precision
```

Adapters own the transforms between these spaces. Box3D, Rapier, Jolt, Three.js,
and the minimap never infer them independently.

The minimum transform record is:

```ts
interface WorldFrame {
  worldId: string;
  chunkId: string;
  origin: { x: number; y: number; z: number };
  revision: number;
}
```

A solver body position becomes a persistent position only through the active
`WorldFrame`. Origin shifts update the frame and simulation bodies together;
they do not rewrite discoveries or map history.

## Map layers

The durable map should compose layers with separate update rates and ownership:

1. terrain/elevation substrate;
2. surveyed/fog memory;
3. authored sites and routes;
4. live rig, cargo, objectives, and threats;
5. persistent world changes such as felled obstacles or built structures;
6. capability-aware route/readability overlays;
7. diagnostics for chunk residency, origin, collision roles, and replay.

The player map should expose only useful product layers. Diagnostic layers stay
behind an explicit lab/debug affordance.

## Physics comparison tests

Every solver candidate should pass:

1. spawn at a known persistent coordinate and render at the same map pixel;
2. drive a fixed semantic route and preserve heading orientation;
3. cross a surface/chunk boundary without a map jump;
4. restore a capture and return to the same map coordinate;
5. collide/fell an object and preserve the same persistent object identity;
6. shift simulation origin while leaving map/discovery coordinates unchanged;
7. unload and reload a chunk without duplicate bodies or duplicate map markers;
8. report map-transform revision and active chunk in browser-readable state.

## Near-term implementation slice

The first bounded implementation should:

- extract the current `FieldMap.toPixel` calculation into a pure,
  round-trip-tested world/map transform;
- add `worldId`, `chunkId`, `origin`, and `revision` to a lab-only
  `WorldFrame`;
- expose persistent and simulation-local rig positions together in the solver
  comparison snapshot;
- render a small diagnostic route/map inset in both physics labs;
- verify the same scripted path produces the same map-space direction and
  checkpoint order even when physical trajectories differ.

This is a comparison of coordinate and activity semantics, not a requirement
that different solvers produce identical floating-point paths.

## Related exploration

- Collision categories/masks determine which world changes belong on the map.
- Camera obstruction and top-down/survey policies determine what navigation
  information is legible during play.
- Streaming manifests own chunk activation; the map may show known unloaded
  regions without activating their simulation.
- Replay checkpoints should reference persistent coordinates and stable entity
  IDs, not solver handles.
- Water, air, space, interiors, and portals need explicit layer/topology rules
  before a single flat map is generalized.

## Validation

- Tier 1: current `FieldMap`, terrain, world-memory, collision, and solver ports
  inspected.
- Tier 2 target: pure coordinate round-trip and heading-orientation tests.
- Tier 3 target: both solver browser routes drive and restore while their map
  markers and checkpoint order remain correct.
- Tier 4 target: desktop and narrow review confirms the map is useful without
  obscuring vehicle control or telemetry.

## Anything else?

Yes. A minimap is not merely a UI widget. It is a compact audit of whether the
world, simulation, exploration, streaming, persistence, and player navigation
agree about where things are. If those systems cannot share this contract, a
larger open world will amplify the disagreement.
