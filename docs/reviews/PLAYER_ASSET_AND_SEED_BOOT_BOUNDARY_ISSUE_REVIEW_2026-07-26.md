# Player Asset Distribution and Seed Boot Boundary Review

Date: 2026-07-26

## Scope

This review closes two release blockers found during the first playable
integration pass:

1. developer-only runtime proof assets were filtered from the player scene but
   were still copied wholesale into the player distribution;
2. seed preflight trusted an arbitrary non-empty saved seed before the saved
   `GameState` had passed canonical recovery.

## Decision

The canonical asset manifest controls both compilation and distribution:

- Vite development receives every runtime entry so the explicit developer and
  acceptance surfaces can exercise proof candidates;
- a player build receives only entries with `publicRuntimeApproved: true`;
- the build copies only public-approved runtime files;
- a post-build assertion rejects any unapproved runtime file, id, or runtime
  path found in the player output.
- runtime presentation stays manifest-owned but uses a stable world-site anchor
  plus offsets, so moving an authored site cannot silently strand an asset at an
  obsolete absolute coordinate.

Seed admission is now identical to state admission:

- `peekSavedSeed` returns a seed only from a state accepted by `recoverState`;
- `loadState` rejects a recovered state whose seed differs from the supplied
  `GameWorld`;
- recovery creates its clean `GameState` with the already-constructed world's
  seed, preserving the world/state constructor invariant even if storage changes
  between preflight and load.

## Validation contract

- Asset preflight unit coverage proves dirty and clean player distributions.
- The production build itself runs the player-asset assertion.
- Storage integration coverage proves accepted custom-seed restoration,
  unaccepted-seed recovery, and preflight/load mismatch recovery.

## Verification evidence

- `npm run build` passed:
  - application and deterministic-kernel typechecks passed;
  - Vite server and client production builds passed;
  - the integrated player-build assertion passed with no unapproved runtime
    files or manifest identities exposed.
- `npm run test:assets` passed all 9 assertions, including dirty and clean
  player-distribution fixtures.
- `npx vitest run src/game/storage.test.ts src/game/runtime-assets.test.ts`
  passed 8 assertions across 2 files.
- Focused Prettier validation passed for every implementation, manifest, test,
  configuration, and review file in this change.
- Vite still reports its existing advisory warning for a Three.js chunk above
  500 kB. The build succeeds, and that bundle-budget work is separate from these
  two correctness boundaries.

## Multi-pass review

### Pass 1 - immediate correctness

The scene-only filter was insufficient because distributed bytes remained
public. The fix moves enforcement to compilation, copy, and post-build
assertion. Seed validation now occurs before construction and is rechecked at
load.

### Pass 2 - architecture and long-term viability

No second asset catalog or recovery pipeline was introduced. Both changes extend
the existing manifest and `recoverState` authority. Development proof assets
remain intentionally available without weakening the player boundary.

### Pass 3 - supervision readiness

The gates are runnable through `npm run test:assets`, focused Vitest storage
tests, `npm run typecheck`, and `npm run build`. A failed player asset assertion
exits non-zero and names the exposed asset and output file.

## Anything else?

Approved GLBs with external image or buffer URIs will need those dependencies
represented as manifest-owned distribution files before approval. The present
public-approved set is empty, so this does not weaken the current release gate;
the manifest preflight remains the admission point for that future extension.

## Addendum (2026-07-28) - developer bridge candidates now load live

- Re-checked the browser on the developer surface:
  `http://localhost:4173/?surface=developer`.
- The runtime bridge list now contains two live imported assets:
  - `kenney-car-kit-breakable-crate-fixture`
  - `kenney-car-kit-tractor-preview`
- Both are loaded with fallback inactive, so the browser is no longer only
  proving manifest registration; it is proving runtime activation on the
  developer surface.
- The player distribution boundary remains intact because `publicRuntimeApproved`
  is still false for both rows, so the live developer bridge does not weaken the
  player-only release gate.
- Evidence depth: Tier 4 live browser inspection plus the existing build/test
  proof from this review.
