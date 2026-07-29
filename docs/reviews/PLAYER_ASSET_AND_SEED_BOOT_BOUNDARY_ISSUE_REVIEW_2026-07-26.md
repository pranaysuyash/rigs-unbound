# Player Asset Distribution and Seed Boot Boundary Review

Date: 2026-07-26

- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)

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

## Addendum (2026-07-28) - runtime observability is not the same as player distribution

- Re-checked the current browser runtime snapshot and the asset-manifest gate.
- The runtime text can report bridge state for observability, but that does not
  mean the player distribution boundary has moved:
  - `runtime-tested` bridge assets are still separate from
    `publicRuntimeApproved`;
  - the build gate still rejects unapproved runtime files from player output;
  - the approved public set remains empty until operator sign-off is recorded.
- That distinction matters because the same runtime surface can be useful for
  developer proof while the player distribution path still stays closed.
- The durable policy boundary is now explicitly recorded in
  [ADR-0038](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md).
- Evidence depth: Tier 1 policy/readout synthesis plus Tier 4 runtime browser
  observation already captured in the bridge notes.

## Addendum (2026-07-28) - the developer bridge remains proof; the player gate still excludes unapproved assets

- Re-checked the live developer bridge notes alongside the existing
  player-asset build gate evidence.
- The runtime bridge proof is visible in the developer browser surface, but the
  player distribution path still excludes unapproved assets because
  `publicRuntimeApproved` remains false.
- The player gate is therefore still doing its job:
  - proof can be visible to operators;
  - unapproved runtime assets do not become player truth;
  - the crate stays the first public candidate, and the tractor preview stays
    developer-only proof.
- This is the correct long-term separation for the repo because it lets the
  runtime be observable without turning every visible bridge into a public
  promise.
- Evidence depth: Tier 1 review synthesis plus Tier 4 developer-surface bridge
  proof and the existing player-build gate evidence in this review.
