# Radial Menu Boot Failure Snapshot

- Date: 2026-07-29
- Status: live browser snapshot; not a fix
- Evidence tier: Tier 4 manual browser-daemon inspection
- Related blocker review: [Browser Runtime Parallel-State Integration Blocker](../reviews/BROWSER_RUNTIME_PARALLEL_STATE_INTEGRATION_BLOCKER_2026-07-26.md)
- Related authority audit: [Radial Quick-Action Wheel Authority Audit](../reviews/RADIAL_QUICK_ACTION_AUTHORITY_AUDIT_2026-07-28.md)

## What the live browser showed

The browser daemon was still attached to the canonical developer route:

- URL: `http://127.0.0.1:4173/?surface=developer`
- Title: `Rigs Unbound`
- Console log count reported by the daemon: `43`

The latest live console evidence included:

- `ReferenceError: createInitialRadialMenuState is not defined`
- follow-on module load failure for `src/game/radial-ui.ts`

## Why this note exists

The repository already has a broader blocker review and a static radial-wheel
authority audit. This snapshot keeps the current live browser failure separate
from those older facts so future work can see what changed on the wire.

## What this note does not claim

- It does not claim ownership of the runtime fix.
- It does not claim the radial wheel is fully broken or fully dead.
- It does not claim the public accessibility trail is invalid.
- It does not modify any runtime file.

## Current interpretation

The best current reading is that the developer route is live but out of sync
with the radial-menu startup reference. That makes this a runtime blocker to
reconcile later, not a docs-only discrepancy.

## Anything else?

Yes: if the browser daemon still points at the developer route and the same
reference error appears, the live runtime lane should be treated as unstable
until the owning edits settle.

## Addendum (2026-07-29) - browser exec probe is live again, but not yet a trustworthy DOM witness

A later browser-daemon check restored the canonical developer surface to a
live state:

- URL: `http://127.0.0.1:4173/?surface=developer`
- Title: `Rigs Unbound`
- Console log count reported by the daemon: `45`

However, the direct JavaScript DOM probe returned `undefined` for the sampled
page-state object, so the current browser IPC path is still not a dependable
DOM witness for the live app. That means the route is reachable, but the
verification channel itself needs a stronger check before it is used for any
player-facing or operator-facing claim.

This addendum does not change ownership, and it does not claim the runtime
lane is fixed.
