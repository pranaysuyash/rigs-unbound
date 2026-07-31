# Open-World Community Traffic Evidence

**Date:** 2026-07-29

**Status:** Local integration verified. No player-flow or permission behavior
was introduced.

## Player-facing behavior

A material change can now become visible civilian movement:

- Surveying Sunken Flats' crossing produces a recurring skiff movement toward
  Marsh Depot.
- Marking Rustline Salvage's bypass produces recurring freight-cart movement
  toward Quarry Shelf.

The player is neither assigned nor required to follow either movement. It is
world legibility, not a route gate, task marker, escort objective, collision
body, or replacement for player travel.

## Ownership and implementation

| Concern | Owner |
| --- | --- |
| Durable enabling fact | `src/game/settlement-material-effects.ts` |
| Route position from history and world time | `src/game/community-traffic.ts` |
| Observable public projection | `src/game/state.ts` |
| Mesh construction and placement only | `src/game/renderer.ts` |

The projection holds no traffic save state. It reads recorded material effect
IDs, resolves authored source and destination sites, and derives an
outward-and-return cycle from `worldTimeMinutes`. Rendering cannot mutate the
effect, route, discovery state, mission state, or player access.

## Verification

**Tier 2:** `npm run typecheck` passed, including
`experiments/deterministic-kernel-probe` typechecking.

**Tier 2:** Full Vitest passed: 85 files and 515 tests. The dedicated
`community-traffic.test.ts` coverage proves empty initial traffic, a survey-led
skiff route that does not discover Marsh Depot, and reproducible time-driven
freight-cart movement.

**Tier 3:** The canonical Vite runtime on port `4173` retained the existing
Sunken Flats survey and returned this public projection:

```json
{
  "id": "community-traffic:sunken-flats:sounded-crossing",
  "materialEffectId": "sunken-flats:sounded-crossing",
  "kind": "skiff",
  "sourceSiteId": "sunken-flats",
  "targetSiteId": "marsh-depot",
  "x": -140.03,
  "z": -117.98,
  "outbound": true
}
```

The same browser state reported `mission: null` and
`activeSideMissions: []`. After a clean reload, the console contained only
normal Vite connection messages.

## Remaining limit

The runtime validates the state-to-renderer path and live canvas presence. A
human visual inspection of the distant skiff mesh is still a separate
presentation-quality check, so this evidence does not overstate it as a visual
art sign-off.
