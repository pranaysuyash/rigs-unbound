# Public Asset Promotion Workflow for the First Runtime Bridge Candidate

- Date: 2026-07-28
- Status: proposed workflow; operator approval required
- Evidence tier: Tier 1 static synthesis plus Tier 4 live developer-surface bridge proof
- Related analysis:
  - [Asset Pipeline Live Repo Analysis](./ASSET_PIPELINE_LIVE_REPO_ANALYSIS_2026-07-26.md)
  - [Asset Authority and Shipped Mesh Contract](./ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)
  - [Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
  - [Player Asset and Seed Boot Boundary Review](../reviews/PLAYER_ASSET_AND_SEED_BOOT_BOUNDARY_ISSUE_REVIEW_2026-07-26.md)

## Purpose

The repo already proves that imported GLBs can be admitted, loaded, and
reported in the developer browser surface. This note defines the workflow for
promoting one of those runtime-tested assets to `publicRuntimeApproved: true`
without collapsing developer proof and player approval into the same decision.

The important distinction is:

```text
developer bridge proof -> runtime-tested, visible in developer surface
public approval        -> player-safe, shippable truth
```

The bridge can be real before the asset is public. That asymmetry is useful and
should be preserved.

## Current candidate order

### 1. `kenney-car-kit-breakable-crate-fixture`

Best first public candidate because it is:

- smaller and less semantically entangled than the tractor preview;
- already proved live in the developer surface;
- easier to reason about as a static prop;
- lower risk for approval, replacement, and rollback.

### 2. `kenney-car-kit-tractor-preview`

Keep this as developer-scale proof until the project explicitly wants a
vehicle-shaped asset to cross the player gate. It is valuable, but it carries
more identity and behavior implications than the crate.

## Promotion workflow

1. Confirm the manifest entry has source, hash, rights, runtime path, and
   replacement path fields recorded.
2. Confirm the asset is already `runtime-tested` on the developer surface.
3. Confirm the player surface still excludes it while `publicRuntimeApproved`
   remains false.
4. Record the approval decision in a separate review or decision artifact.
5. Set `publicRuntimeApproved: true` only after the approval decision exists.
6. Re-run player-surface verification to confirm the asset appears only after
   promotion.
7. Preserve the previous manifest entry or alias path if a replacement or
   deprecation step is needed later.

## What the approval decision must contain

The approval record should answer:

- what asset is being promoted;
- why it is the right first public candidate;
- what rights/provenance evidence was checked;
- what browser/runtime proof exists;
- what player-visible risk remains;
- what rollback or replacement path exists;
- who approved the promotion.

## Validation contract

Promotion is incomplete unless:

- the manifest entry is updated;
- the player surface consumes the promoted asset;
- the developer surface still reports the bridge cleanly;
- the approval decision is durable and findable from the repo trail;
- the player distribution boundary still rejects unapproved assets.

## Non-goals

- No new asset catalog.
- No automatic approval from CC0 status alone.
- No merge of developer proof and player approval into one field.
- No tractor-specific promotion just because the tractor is the more exciting
  asset.

## Revisit trigger

Revisit this workflow if the project changes the manifest authority model, if a
new public asset class is introduced, or if the player distribution policy is
refactored to a different approval mechanism.

## Anything else?

Yes: the workflow should remain deliberately boring. The asset becomes public
because a record says so, not because the developer bridge happened to load.

