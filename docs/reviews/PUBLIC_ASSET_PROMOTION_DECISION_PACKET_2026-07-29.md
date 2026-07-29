# Public Asset Promotion Decision Packet

- Date: 2026-07-29
- Status: operator packet; approval still required
- Evidence tier: Tier 4 runtime/manual observation plus Tier 1 synthesis
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- Related checklist: [Public Asset Promotion First Public Candidate Checklist](PUBLIC_ASSET_PROMOTION_FIRST_PUBLIC_CANDIDATE_CHECKLIST_2026-07-28.md)
- Related field map: [Public Asset Promotion Approval Record Field Map](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md)
- Related pre-signoff record: [Public Asset Promotion Pre-Signoff Record](PUBLIC_ASSET_PROMOTION_PRE_SIGNOFF_RECORD_2026-07-29.md)
- Related template: [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- Related workflow: [Public Asset Promotion Workflow for First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)

## Purpose

This packet is the quickest one-sit review path for the first public asset
candidate. It is a compact cover note for the operator, not the decision
itself.

The repo already distinguishes the relevant layers:

```text
manifest -> identity and runtime bridge state
field map -> how to fill the decision
pre-signoff record -> prefilled evidence draft
template -> durable approval record
ADR-0038 -> the boundary between runtime-tested bridge proof and public approval
```

## Candidate

- Asset id: `kenney-car-kit-breakable-crate-fixture`
- Asset kind: `static-prop`
- Current manifest status: `runtime-tested`
- Current `publicRuntimeApproved` value: `false`
- Current runtime path: `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`

## What is already proven

- the crate bridge loads in the developer browser surface;
- the manifest keeps the candidate at `publicRuntimeApproved: false`;
- the player surface still excludes the asset;
- the rights/provenance trail is recorded in the provenance register;
- the approval template, field map, and pre-signoff record are all present;
- the tracker and reviews navigation now point at the same approval trail.

## What the operator still has to decide

1. whether this crate is the right first public asset;
2. whether the rights/provenance trail is sufficient for promotion;
3. whether the player surface should consume it now;
4. whether a replacement/deprecation path is acceptable;
5. whether the tractor preview should remain developer-only for now.

## What the packet points to next

- Use the field map to fill each blank in the approval template.
- Use the pre-signoff record to review the current evidence without mistaking it for approval.
- Use ADR-0038 to keep bridge proof separate from public approval.

## Approval criteria that still matter

- the manifest entry must be updated;
- the player surface must begin consuming the promoted asset;
- the developer surface must still report the bridge cleanly;
- the decision must be durable and findable from the repo trail;
- unapproved assets must remain excluded from player distribution.

## Anything else?

Yes: if the operator cannot decide after reading this packet, the asset gate is
still not ready for approval.

## Addendum (2026-07-29) - the packet is readable, but the populated approval record is still missing

- Re-read the package index, field map, pre-signoff record, and approval
  template together with this packet.
- The repo now has the right decision trail shape:
  - discovery surface,
  - field map,
  - pre-signoff record,
  - approval template,
  - runtime bridge proof.
- What is still missing is the filled approval record itself. Until that exists,
  this packet remains a cover note, not a decision.
- That distinction matters because the operator needs one durable populated
  artifact that can be pointed at as the actual approval source of truth.
- Evidence depth: Tier 1 static synthesis from the package index and the
  operator packet trail. No new browser or manifest mutation was run in this
  pass.
