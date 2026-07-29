# Public Asset Promotion First Public Candidate Checklist

- Date: 2026-07-28
- Status: checklist; operator approval required
- Evidence tier: Tier 1 review artifact
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related workflow: [Public Asset Promotion Workflow for the First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)
- Related approval template: [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)

## Candidate

- Asset id: `kenney-car-kit-breakable-crate-fixture`
- Asset kind: `static-prop`
- Current manifest status: `runtime-tested`
- Current `publicRuntimeApproved` value: `false`
- Runtime path: `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`

## Operator checklist

### 1. Boundary check

- Confirm the asset is runtime-tested in the developer surface.
- Confirm the player surface still excludes the asset while
  `publicRuntimeApproved` is `false`.
- Confirm the approval boundary is recorded in ADR-0038.

### 2. Rights and provenance check

- Confirm the source path and source type are recorded.
- Confirm the rights status is recorded and readable.
- Confirm the manifest entry has a source hash and runtime hash or equivalent
  derived identity.
- Confirm the approval record includes a compact rights/provenance summary
  tied to the decision, not only to the registry entry.

### 3. Risk and replacement check

- Confirm why the crate is the lowest-risk first public candidate.
- Confirm what the player will see if the asset is promoted.
- Confirm the rollback or replacement path if the asset later changes.

### 4. Approval record check

- Fill the approval record template for the real decision.
- Name the approver.
- Record the decision date.
- Record the approval note or the explicit reason for deferral.
- Record the compact rights/provenance summary in the approval record.

### 5. Post-approval verification

- Re-run player-surface verification after promotion.
- Confirm the player surface now consumes the promoted asset.
- Confirm the developer surface still reports the bridge cleanly.
- Confirm the public-approved set remains explicit and findable from the
  package trail.

## Approval threshold

If any of the following are still unclear, do not promote yet:

- why this crate is the right first public asset;
- what risk changes for the player;
- how rollback would work;
- whether the approval record is durable and findable;
- whether the manifest entry has the right provenance fields.

## Anything else?

Yes: if the operator cannot check every item without guesswork, the asset is not
ready for public approval yet.
