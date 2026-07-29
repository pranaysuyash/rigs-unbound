# Public Asset Promotion Package Index

This is the navigation page for the public-asset promotion package. It is not
the approval decision itself; it points at the review, workflow, provenance,
and evidence surfaces that keep the promotion gate honest.

## Backlinks

- [Reviews index](README.md)
- [Docs root landing page](../README.md)

## Start here

- [Public Asset Promotion Review](PUBLIC_ASSET_PROMOTION_REVIEW_2026-07-28.md)
- [Public Asset Promotion Decision Packet](PUBLIC_ASSET_PROMOTION_DECISION_PACKET_2026-07-29.md)
- [Public Asset Promotion First Public Candidate Checklist](PUBLIC_ASSET_PROMOTION_FIRST_PUBLIC_CANDIDATE_CHECKLIST_2026-07-28.md)
- [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- [Public Asset Promotion Approval Record Field Map](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md)
- [Public Asset Promotion Pre-Signoff Record](PUBLIC_ASSET_PROMOTION_PRE_SIGNOFF_RECORD_2026-07-29.md)
- [Public Asset Promotion Decision Packet](PUBLIC_ASSET_PROMOTION_DECISION_PACKET_2026-07-29.md)
- [Public Asset Promotion Player-Gate Evidence Note](PUBLIC_ASSET_PROMOTION_PLAYER_GATE_EVIDENCE_NOTE_2026-07-28.md)
- [Public Asset Promotion Workflow for First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)
- [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- [Asset Authority and Shipped Mesh Contract](../research/ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)
- [Asset Pipeline and Provenance Contract](../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- [Asset Provenance Register](../research/ASSET_PROVENANCE_REGISTER.md)
- [Asset Pipeline Live Repo Analysis](../research/ASSET_PIPELINE_LIVE_REPO_ANALYSIS_2026-07-26.md)
- [Player Asset and Seed Boot Boundary Review](PLAYER_ASSET_AND_SEED_BOOT_BOUNDARY_ISSUE_REVIEW_2026-07-26.md)

## Suggested order

1. Read the public asset promotion review first.
2. Read the public promotion workflow next to see how approval is decided.
3. Read the authority and provenance contracts for the boundary between bridge
   proof and public approval.
4. Read the provenance register and live repo analysis for the supporting
   runtime trail.
5. Keep the player-asset boundary review as the broader runtime proof that
   the bridge is live without being public.

## What this package is for

- keep public approval separate from runtime bridge success;
- keep rights, provenance, budget, and operator reasoning attached to the
  promotion decision;
- keep the first public candidate low-risk and reversible;
- keep the public gate readable from one durable navigation page;
- avoid creating a second source of truth for asset authority.

## Current status

The package is assembled, but the promotion decision remains proposed and
operator approval is still required. The first public candidate remains
`kenney-car-kit-breakable-crate-fixture`; the tractor preview remains
developer-only bridge proof for now.

The remaining proof is not another bridge candidate. It is the operator
approval record carrying the compact rights/provenance summary, runtime proof,
and rollback path for the promoted asset.

## Provenance

- [Public Asset Promotion Review](PUBLIC_ASSET_PROMOTION_REVIEW_2026-07-28.md)
- [Public Asset Promotion Decision Packet](PUBLIC_ASSET_PROMOTION_DECISION_PACKET_2026-07-29.md)
- [Public Asset Promotion First Public Candidate Checklist](PUBLIC_ASSET_PROMOTION_FIRST_PUBLIC_CANDIDATE_CHECKLIST_2026-07-28.md)
- [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- [Public Asset Promotion Approval Record Field Map](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md)
- [Public Asset Promotion Pre-Signoff Record](PUBLIC_ASSET_PROMOTION_PRE_SIGNOFF_RECORD_2026-07-29.md)
- [Public Asset Promotion Decision Packet](PUBLIC_ASSET_PROMOTION_DECISION_PACKET_2026-07-29.md)
- [Public Asset Promotion Player-Gate Evidence Note](PUBLIC_ASSET_PROMOTION_PLAYER_GATE_EVIDENCE_NOTE_2026-07-28.md)
- [Public Asset Promotion Workflow for First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)
- [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- [Asset Authority and Shipped Mesh Contract](../research/ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)
- [Asset Pipeline and Provenance Contract](../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- [Asset Provenance Register](../research/ASSET_PROVENANCE_REGISTER.md)
- [Asset Pipeline Live Repo Analysis](../research/ASSET_PIPELINE_LIVE_REPO_ANALYSIS_2026-07-26.md)

## Runtime evidence

- [`assets/asset-manifest.json`](../../assets/asset-manifest.json)
- [`assets/asset-manifest.schema.json`](../../assets/asset-manifest.schema.json)
- [`src/game/runtime-assets.ts`](../../src/game/runtime-assets.ts)
- [`src/game/runtime-assets.test.ts`](../../src/game/runtime-assets.test.ts)

These are the live code-and-manifest surfaces that keep the public-asset
promotion gate honest:

- the manifest records which imported assets are still public-ineligible;
- the runtime bridge filters the player surface to exclude unapproved assets;
- the tests prove the player surface stays empty for unapproved bridges and
  that the developer surface still sees the bridge candidates.

Anything else?

- No additional runtime gate appears necessary for this package index right now.
- The remaining work is operator approval, not more bridge plumbing.

## Addendum (2026-07-29) - the package index is discovery, not authority

The package index is intentionally not the approval decision. It is the
operator's entrypoint to the decision trail.

That means:

- the approval record template is the canonical location for the real public
  asset decision;
- the workflow explains how the decision is made;
- the package index only stitches the trail together so the operator can find
  the right artifact quickly;
- no asset becomes public truth because it appears in this index alone.

This keeps the approval boundary boring and durable: bridge proof, approval
record, and shipped truth stay separate until the manifest and player surface
change together.

## Addendum (2026-07-29) - no populated approval record exists yet

A quick repo search only found the approval record template and the proposed
ADR/workflow/checklist trail. I did not find a filled-in public-asset approval
record for the first candidate.

That means the current state is still:

- runtime bridge proof: present;
- public approval decision: not yet populated;
- package index: discoverability surface only;
- approval template: canonical place where the real decision will live once
  an operator fills it in.

This is the exact gap the package index should point to, so future work can
see that the asset lane is ready for a decision artifact but not yet carrying
one.
