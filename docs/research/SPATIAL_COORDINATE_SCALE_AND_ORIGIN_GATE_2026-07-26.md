# Spatial Coordinate Scale and Origin Gate

**Date:** 2026-07-26  
**Status:** Bounded absolute coordinates are canonical; origin shifting is staged  
**Evidence tier:** Tier 1 static source inspection. No test, build, browser, or long-distance runtime command was run in this pass.

## Decision

Keep the current world in one absolute coordinate frame. The authored field is bounded to a 250 m radius with a 246 m numerical safety limit, so floating-origin rebasing, cell-local transforms, and coordinate virtualization are unnecessary today.

Any future origin system must be introduced as a versioned world-coordinate contract, not a renderer-only position hack.

## Current coordinate model

| Concern            | Current posture                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| World extent       | One bounded disc, `WORLD_RADIUS = 250`.                                                                               |
| Safety edge        | `WORLD_LIMIT = 246`; terrain ridge communicates the boundary before numerical clamp.                                  |
| Authored data      | Sites, structures, routes, terrain anchors, collision queries, minimap, and camera use the same absolute `x/z` frame. |
| Dynamic state      | Rigs and bounded world-memory deltas use that same frame.                                                             |
| Persistence/replay | Seed plus spatial deltas and state context reconstruct the same coordinate frame.                                     |
| Rendering          | Renderer projects the shared world frame; it does not own a private coordinate system.                                |

This is the simplest correct model for the active scale and a strength for determinism, camera behavior, route validation, and replay.

## Why rebasing is not a local renderer feature

Moving only visual objects near an origin while simulation, terrain, collision, minimap, world memory, or replay retain a different frame creates drift. A rig may visually sit beside a structure while collision tests its old position; a saved deformation may return in the wrong region; a noise field may change after a rebase; a replay may hash a different state.

If scale ever demands rebasing, a single transform boundary must affect all coordinate consumers atomically.

## Admission trigger

Consider an origin/partition coordinate contract only when measured evidence shows the bounded absolute frame is no longer adequate, such as:

- world or region scale expands beyond the current authored disc;
- float precision visibly damages camera, terrain, collision, or physics behavior at intended travel distance;
- a streamed/resident region lifecycle requires local transforms;
- multiplayer/shared-world architecture needs stable global coordinates and client-local presentation frames.

World size alone is not sufficient. The trigger is a demonstrated correctness or performance problem at an intended product scale.

## Required future contract

Before implementation, define:

```text
absolute world identity/coordinates
  <-> active origin or region transform
  <-> local simulation/render coordinates
```

The contract must state:

- stable absolute coordinate/unit conventions and region/cell identity;
- whether simulation remains absolute, local, or uses a dual representation;
- atomic rebase order for state, world fields, collision, camera, renderer, audio listener, minimap, and UI markers;
- persistence and replay representation, hashes, migrations, and old-record behavior;
- deterministic terrain/noise/asset placement independent of local origin;
- network authority/client transform rules if shared-world scope exists;
- region handoff, load failure, and recovery behavior;
- diagnostics exposing active origin/region and rebase count/reason.

## Safety invariants

- A rebase cannot alter authoritative distance, route, collision, capability, or reward results.
- A saved world-memory key remains attached to the same absolute location across sessions.
- Replaying an old recorded input/context cannot silently change due to a local origin transition.
- Camera/audio/UI presentation updates cannot precede or lag the authoritative transform update.
- World/region content references use stable IDs, never renderer-local offsets as identity.

## Non-goals

- No floating-origin code now.
- No coordinate conversion helper introduced without a second coordinate frame.
- No claim that current 250 m scale proves a future large-world model.
- No renderer-only workaround for simulation precision issues.

## Closure trigger

Replace this gate only when a larger-world vertical proof provides measured coordinate pressure and ships the complete state/world/render/persistence/replay migration together.

## Anything else?

Yes: coordinate scale is coupled to streaming, networking, and deterministic replay, but none of those should be activated merely because their future contracts are now named. The current bounded absolute frame is intentionally the canonical source of truth.
