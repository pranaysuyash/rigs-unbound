# Open-World Community Traffic Contract

**Status:** Implemented and verified through the canonical local runtime.

**Date:** 2026-07-29

## Purpose

Community traffic makes a changed world legible. It is not an NPC simulation
layer that has authority over the player or over travel.

When a practical material fact exists, local people can visibly use it:

- `sunken-flats:sounded-crossing` supports a skiff movement between Sunken
  Flats and Marsh Depot.
- `rustline-salvage:marked-bypass` supports a freight cart movement between
  Rustline Salvage and Quarry Shelf.

Neither route discovers its destination, opens access, reserves terrain,
collides with rigs, assigns work, or changes mission state. A player can cross
the same space independently, ignore the movement, or use another machine and
route entirely.

## Authority boundary

```text
saved contribution or adaptation
        |
        v
material effect registry
        |
        v
pure traffic projection (world time plus authored site positions)
        |
        +--> public state and observability
        |
        +--> renderer-only skiff or freight-cart placement
```

The projection has no mutable traffic store. For a given save history and
world time, it produces the same route position. That is deterministic causal
explanation, not a deterministic player flow.

## Explicit non-goals

- no civilian pathfinding or AI authority;
- no collision bodies or physics interaction;
- no schedule the player must meet;
- no automatic discovery, route unlock, or service gate;
- no mission creation, completion, or failure;
- no new world clock or independent traffic persistence.

## Why this advances the open world

The player should see a world where people act on local knowledge. A surveyed
crossing becoming a skiff route is a visible consequence, but it remains a
choice made by the community and an observation available to the player. The
same change can reveal a possible route without turning the world into a
sequence of required tasks.

## Verification record

**Evidence tier:** Tier 3, local integration and canonical browser runtime.

- `npm run typecheck` passed, including the deterministic-kernel probe.
- `npx vitest run` passed: 85 test files and 515 tests.
- `src/game/community-traffic.test.ts` proves no movement exists before a
  supporting material fact, validates the Sunken Flats skiff without a Marsh
  Depot discovery, and proves time-based movement repeats without stored
  traffic state.
- The canonical `http://127.0.0.1:4173/` browser preserved the previously
  recorded `sunken-flats:sounded-crossing` contribution and projected one
  `community-traffic:sunken-flats:sounded-crossing` skiff toward Marsh Depot.
- That same runtime state reported `mission: null` and an empty
  `activeSideMissions` collection. The fresh browser console contained only
  Vite connection diagnostics.

## Remaining evidence limit

The renderer receives and places the skiff projection, and the live canvas is
present, but this record does not claim a human screenshot inspection of the
distant mesh. That is a presentation-quality follow-up, not a gameplay or
authority gap.
