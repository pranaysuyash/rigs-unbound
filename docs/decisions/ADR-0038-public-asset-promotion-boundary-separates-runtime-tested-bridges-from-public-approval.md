# ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval

- Date: 2026-07-28
- Status: Proposed — operator sign-off required
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [Asset Pipeline Live Repo Analysis](../research/ASSET_PIPELINE_LIVE_REPO_ANALYSIS_2026-07-26.md)
  - [Asset Pipeline and Provenance Contract](../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
  - [Asset Authority and Shipped Mesh Contract](../research/ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)
  - [Public Asset Promotion Workflow for the First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)
  - [Public Asset Promotion Review](../reviews/PUBLIC_ASSET_PROMOTION_REVIEW_2026-07-28.md)
  - [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)

## Context

The repo now has a live asset bridge:

- imported GLBs are admitted through `assets/asset-manifest.json`;
- `src/game/runtime-assets.ts` derives the bridge list from the manifest;
- `src/game/renderer.ts` loads the bridge assets and reports loaded/fallback
  status in the browser;
- the developer surface confirms the bridge is live for both bridge candidates.

That runtime proof is valuable, but it is not the same thing as public
approval. The repository needs one explicit boundary that says when a runtime
tested bridge may be treated as player-safe shippable truth.

Without that boundary, provenance, runtime proof, and player approval risk
collapsing into one ambiguous status word.

## Decision

Keep runtime-tested bridge admission separate from public approval.

Specifically:

1. `runtime-tested` means the developer surface can ingest, load, and report an
   imported asset.
2. `publicRuntimeApproved: true` means the asset has explicit operator sign-off
   for player-surface truth.
3. The manifest must not auto-promote an asset from runtime-tested to public
   approval.
4. The approval decision must live in a separate durable review or decision
   artifact and be linked from the asset package index.
5. The manifest row, the runtime bridge evidence, and the public-approval
   record must remain distinct sources of truth.

## Candidate order for the first public asset

1. `kenney-car-kit-breakable-crate-fixture`
2. `kenney-car-kit-tractor-preview`

The crate remains the best first public candidate because it is smaller, less
semantically entangled, and easier to roll back or replace.

The tractor preview remains developer-only bridge proof until the project
explicitly wants to promote a vehicle-shaped asset and own the additional
identity/behavior implications.

## Options considered

### 1. Auto-promote runtime-tested assets

Rejected.

Why: it collapses proof and approval into one step, hides operator intent, and
makes the player surface depend on bridge success rather than a deliberate
public decision.

### 2. Treat CC0 as sufficient approval

Rejected.

Why: rights status is necessary, but it does not answer player risk, rollout
order, replacement path, or public distribution intent.

### 3. Merge developer bridge proof and public approval into one flag

Rejected.

Why: that would create status inflation and make it impossible to tell whether
an asset is merely loadable or actually approved for player truth.

### 4. Separate runtime-tested and public-approved states

Accepted.

Why: it preserves auditability, keeps rollback simple, and lets the project
progress from bridge proof to public truth deliberately.

## Consequences

### Positive

- keeps the public gate boring and explicit;
- preserves a clean audit trail between import, runtime proof, and approval;
- makes rollback or replacement straightforward;
- keeps the player surface protected from accidental promotion.

### Trade-offs

- one more decision artifact must exist before `publicRuntimeApproved` flips;
- the approval path is a little slower than an auto-promotion model;
- reviewers must look in two places: the manifest for runtime state and the
  decision artifact for approval.

## Validation plan

Before any asset flips to `publicRuntimeApproved: true`, verify:

- the manifest entry contains source, hash, rights, runtime path, and
  replacement path;
- the developer surface reports the asset as loaded and fallback-free;
- the player surface still excludes the asset while unapproved;
- the approval record is durable, linked, and operator-authored or explicitly
  operator-approved;
- the player distribution boundary still rejects unapproved assets.

## Rollback / migration path

If the approved asset must change later:

- revert `publicRuntimeApproved` to `false` for the old entry if needed;
- keep the old runtime bridge evidence in the trail;
- point the approval record at the replacement path or successor asset;
- preserve a stable alias/path if the player surface has already been
  published against it.

## Owner or next reviewer

Operator approval required.

Next reviewer: project owner / operator.

## Revisit trigger

Revisit this ADR if:

- the manifest authority model changes;
- a new public asset class is introduced;
- the player distribution policy changes;
- a replacement/deprecation flow becomes the dominant path.

## Update log

- 2026-07-28: proposed the explicit boundary between runtime-tested bridge
  proof and public approval so the asset lane can progress without status
  inflation.
