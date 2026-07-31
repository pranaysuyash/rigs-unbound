# Sunken Flats Waterworks Supersession Evidence

Date: 2026-07-29
Decision: [ADR-0052](../decisions/ADR-0052-sunken-flats-waterworks-supersession.md)

## What changed

The current world no longer models Sunken Flats as the canonical singleton
`floodgate-12`. Its persistent machine system is now
`sunken-flats-waterworks`, a regional hydrology authority with a distributed
renderer assembly. The old entity ID and the older `GameState.floodgate12`
shape remain input-only migration paths.

## Evidence

Tier 2:

- `npm run typecheck` passed.
- `npx vitest run src/game/infrastructure-network.test.ts src/game/infrastructure-network-state.test.ts` passed, 6 tests.
- The migration test proves an old entity record becomes the canonical
  Waterworks record and retains operational history.

Tier 3 and Tier 4:

- `npm run test:causeway-browser` passed at `http://127.0.0.1:4173`.
- The Skimmer travelled 185.35m through flooded terrain with 100% condition.
- The Waterworks was present at Sunken Flats, dormant and uninspected, before
  and after reload.
- The run had no active mission, no side mission, and no captured browser errors.
- The capture shows the regional assembly under the survey camera and the
  optional `Inspect Sunken Flats Waterworks` affordance.

Artifacts:

- `docs/reviews/assets/open-world-causeway-browser-acceptance-2026-07-29.png`
- `docs/reviews/assets/open-world-causeway-browser-acceptance-2026-07-29.json`

## Boundary

The proof does not establish final visual-art approval, collision authority for
the assembly, multiple service methods, or a completed power/logistics system.
It proves that the new identity is persistent, spatial, recoverable, optional,
and visible in the current open world.

`Chrome teardown exceeded 5 seconds` was emitted after the harness reported
PASS. It is an acceptance-harness teardown advisory, not a browser error or
failed assertion.
