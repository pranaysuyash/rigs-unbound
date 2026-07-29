# Public Asset Promotion Review

- Date: 2026-07-28
- Status: proposed; operator approval required
- Evidence tier: Tier 1 static synthesis plus Tier 4 live developer-surface bridge proof
- Related workflow: [Public Asset Promotion Workflow for First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- Related checklist: [Public Asset Promotion First Public Candidate Checklist](PUBLIC_ASSET_PROMOTION_FIRST_PUBLIC_CANDIDATE_CHECKLIST_2026-07-28.md)
- Related approval template: [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- Related field map: [Public Asset Promotion Approval Record Field Map](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md)
- Related player-gate note: [Public Asset Promotion Player-Gate Evidence Note](PUBLIC_ASSET_PROMOTION_PLAYER_GATE_EVIDENCE_NOTE_2026-07-28.md)
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related analysis:
  - [Asset Pipeline Live Repo Analysis](../research/ASSET_PIPELINE_LIVE_REPO_ANALYSIS_2026-07-26.md)
  - [Asset Authority and Shipped Mesh Contract](../research/ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)
  - [Asset Pipeline and Provenance Contract](../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
  - [Player Asset and Seed Boot Boundary Review](PLAYER_ASSET_AND_SEED_BOOT_BOUNDARY_ISSUE_REVIEW_2026-07-26.md)

## Purpose

This review records the first concrete public-approval candidate for the
runtime bridge that the repo already proves live on the developer surface.
The goal is to separate:

```text
developer bridge proof -> runtime-tested import and browser visibility
public approval -> player-safe shippable truth
```

The repo already has the bridge proof. This review is about the first asset that
should cross the public gate.

## Candidate order

### 1. `kenney-car-kit-breakable-crate-fixture`

Recommended first public candidate.

Why this one:

- it is the smallest runtime bridge candidate;
- it is less semantically entangled with core rig gameplay;
- it already proved live in the developer surface;
- it gives the manifest a low-risk promotion example;
- it is easier to roll back or replace if needed.

### 2. `kenney-car-kit-tractor-preview`

Hold back for now.

Why this one stays developer-only:

- it is larger and more identity-bearing;
- it is more entangled with vehicle semantics;
- it is a better proof that the bridge scales than it is a first public
  approval candidate.

## What is already proven

- The developer surface at `?surface=developer` loads both imported bridge
  candidates.
- The runtime bridge evidence reports both assets as loaded and fallback-free.
- The manifest keeps both rows at `publicRuntimeApproved: false`.
- The player surface therefore remains protected from accidental promotion.

## What still needs operator approval

Before `publicRuntimeApproved: true` is set on the first candidate, the operator
should confirm:

- that the breakable crate is the right first public asset;
- that the rights/provenance trail is sufficient for promotion;
- that the player surface should consume the promoted asset;
- that a replacement/deprecation path exists if the asset changes later;
- that the tractor preview should remain developer-only for now.

## Recommendation

Promote `kenney-car-kit-breakable-crate-fixture` first, not the tractor preview.
That keeps the approval workflow low-risk and preserves the tractor preview as a
useful developer-scale proof.

The durable boundary for that recommendation is recorded in ADR-0038:
runtime-tested bridge proof stays separate from `publicRuntimeApproved`.

The operator-facing checklist gives the actual step-by-step review path for the
crate candidate, the field map turns each blank in the approval template into
a specific source-evidence lookup, and the decision packet is the quickest
one-sit review path.

The player-gate evidence note is the short summary of why the player output is
still closed even though the developer bridge is live.

## Approval boundary

Approval is incomplete unless all of the following are true:

1. the manifest entry is updated;
2. the player surface begins consuming the promoted asset;
3. the developer surface still reports the bridge cleanly;
4. the decision is captured in a durable review or decision record;
5. unapproved runtime paths remain absent from player distribution.

## Non-goals

- No new asset catalog.
- No automatic promotion from CC0 rights alone.
- No merge of developer bridge proof and public approval into one field.
- No tractor-first approval just because the tractor is more visible.

## Anything else?

Yes: the repo should keep treating public approval as boring, explicit, and
separate from import success. That is what keeps the asset boundary honest.

## Addendum (2026-07-29) - the field map makes the approval worksheet operational

The approval template now has a companion worksheet: [Public Asset Promotion Approval Record Field Map](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md). That field map answers a different question from the template itself:

- the template is where the decision gets recorded;
- the field map is where each blank gets tied back to its source evidence;
- neither one becomes approval without operator sign-off.

That makes the trail easier to use without changing the fact that the crate has not been approved yet.

## Addendum (2026-07-29) - the decision packet is the quickest one-sit review path

The new [Public Asset Promotion Decision Packet](PUBLIC_ASSET_PROMOTION_DECISION_PACKET_2026-07-29.md) compresses the crate candidate trail into one operator-facing page. It is not approval; it is the shortest route to the approval context.

That keeps the review honest: the packet points to the pre-signoff record, the field map, and ADR-0038, but the actual approval decision still has to be recorded separately.
