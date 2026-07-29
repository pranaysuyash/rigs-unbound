# Public Asset Promotion Approval Record Template

- Date: 2026-07-28
- Status: template; operator approval required to populate with a real decision
- Evidence tier: Tier 1 review artifact
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related workflow: [Public Asset Promotion Workflow for the First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)

## Purpose

This template gives the operator one durable place to record a public asset
promotion decision. It exists so the repo does not confuse:

```text
runtime-tested bridge proof -> developer-surface load/visibility
public approval -> player-safe shippable truth
```

The template is intentionally boring. The approval record should say what was
approved, why, and what remains reversible.

## Use this template for

- first public approval of a runtime-tested bridge;
- later replacement or deprecation of a public asset;
- any asset that must cross from developer proof into player-facing truth.

## Do not use this template for

- reference-only assets;
- developer-only bridge proof;
- provisional manifest entries;
- runtime assets that are still under investigation.

## Required fields

### Decision header

- Asset id:
- Asset kind:
- Current manifest status:
- Current `publicRuntimeApproved` value:
- Current runtime path:
- Rights status:
- Reviewer / approver:
- Decision date:

### Rights / provenance summary

- Source type:
- Source owner / license:
- Source hash or stable identity:
- What was checked for rights/provenance:
- What remains restricted or conditional:

### Why this asset

- Why this asset is the right first public candidate:
- Why it is lower risk than the alternatives:
- Why it should be public now rather than later:

### Proof already in hand

- Developer-surface bridge evidence:
- Browser/runtime proof:
- Loaded node count / runtime visibility:
- Fallback behavior:
- Manifest provenance / hash / license evidence:
- Rights/provenance summary used for the approval decision:

### Player-surface risk

- What the player will see:
- What could go wrong:
- What must stay unchanged:
- What fallback or rollback path exists:

### Replacement / rollback

- Replacement path:
- Alias or backward-compatibility path:
- Revert condition:
- Owner of rollback decision:

### Approval

- Approved: yes / no / deferred
- Approval note:
- Follow-up if deferred:

## Approval criteria

The decision is not complete unless:

1. the manifest entry is updated;
2. the player surface consumes the promoted asset;
3. the developer surface still reports the bridge cleanly;
4. the approval decision is durable and findable from the repo trail;
5. unapproved assets remain excluded from player distribution.

## Example entry skeleton

```md
- Asset id: kenney-car-kit-breakable-crate-fixture
- Asset kind: static-prop
- Current manifest status: runtime-tested
- Current publicRuntimeApproved value: false
- Current runtime path: assets/runtime/kenney-car-kit-breakable-crate-fixture.glb
- Rights status: cc0-verified-car-kit-3.0
- Reviewer / approver:
- Decision date:
```

## Anything else?

Yes: if the operator cannot fill this in cleanly, the asset is not ready for
public approval yet.
