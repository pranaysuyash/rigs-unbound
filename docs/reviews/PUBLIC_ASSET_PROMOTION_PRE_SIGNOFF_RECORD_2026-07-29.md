# Public Asset Promotion Pre-Signoff Record

- Date: 2026-07-29
- Status: draft pre-signoff; operator approval required
- Evidence tier: Tier 4 runtime/manual observation plus Tier 1 synthesis
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- Related checklist: [Public Asset Promotion First Public Candidate Checklist](PUBLIC_ASSET_PROMOTION_FIRST_PUBLIC_CANDIDATE_CHECKLIST_2026-07-28.md)
- Related field map: [Public Asset Promotion Approval Record Field Map](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md)
- Related template: [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- Related workflow: [Public Asset Promotion Workflow for First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)

## Purpose

This is not the approval decision. It is a prefilled draft that collects the
current evidence for the first public candidate so the operator can review the
remaining decision fields in one place.

The draft preserves the distinction that the repo has already established:

```text
runtime-tested bridge proof -> developer-surface load/visibility
public approval -> player-safe shippable truth
```

## Decision header

- Asset id: `kenney-car-kit-breakable-crate-fixture`
- Asset kind: `static-prop`
- Current manifest status: `runtime-tested`
- Current `publicRuntimeApproved` value: `false`
- Current runtime path: `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`
- Rights status: copied open-asset runtime derivative from the inspected Kenney bundle; pack-level CC0 evidence already recorded in the provenance register
- Reviewer / approver: pending operator sign-off
- Decision date: pending operator sign-off

## Rights / provenance summary

- Source type: copied open-asset runtime derivative from the inspected Kenney bundle
- Source owner / license: private external asset library (`Kenney Game Assets All-in-1 3.4.0`); use remains governed by the inspected bundle and recorded pack-level CC0 evidence
- Source hash or stable identity: `38b74901586f61fb9d4bb54c55bcdafeb498ddda547063503c60d3e8d357dc87`
- What was checked for rights/provenance: source path, source type, manifest linkage, provenance register, runtime copy, and bridge evidence trail
- What remains restricted or conditional: player distribution remains blocked until operator sign-off records `publicRuntimeApproved: true`

## Why this asset

- Why this asset is the right first public candidate: it is the smallest runtime bridge candidate and the least semantically entangled with core rig behavior
- Why it is lower risk than the alternatives: it is easier to roll back or replace than the tractor preview and it does not carry vehicle identity concerns
- Why it should be public now rather than later: pending operator judgment; the repo only proves the bridge and trail, not the approval decision

## Proof already in hand

- Developer-surface bridge evidence: the developer browser surface loads the crate bridge cleanly
- Browser/runtime proof: live browser evidence recorded in the asset provenance and bridge analysis notes
- Loaded node count / runtime visibility: `loadedNodeCount: 1`
- Fallback behavior: `fallbackActive: false`
- Manifest provenance / hash / license evidence: manifest entry plus provenance register and source hash above
- Rights/provenance summary used for the approval decision: this draft only; the final decision record must restate it directly

## Player-surface risk

- What the player will see: a small static prop promoted into player truth if approved
- What could go wrong: accidental promotion without operator sign-off, mismatched player expectations, or later replacement friction
- What must stay unchanged: the unapproved/approved split, the manifest gate, and the ability to keep the tractor preview developer-only
- What fallback or rollback path exists: revert `publicRuntimeApproved` to `false`, preserve the runtime bridge evidence, and point the approval record at any replacement path

## Replacement / rollback

- Replacement path: project-authored prop or a more identity-bearing variant only after the bridge proof is no longer the thing under review
- Alias or backward-compatibility path: none required yet
- Revert condition: any operator decision that the crate is not the right first public candidate or that the player surface should stay closed
- Owner of rollback decision: operator / project owner

## Approval

- Approved: deferred
- Approval note: awaiting operator sign-off; this draft is prefilled so the remaining decision can be reviewed without reconstructing the evidence trail
- Follow-up if deferred: use the approval template, the checklist, and the field map together when the operator is ready to make the decision

## Anything else?

Yes: if this draft is mistaken for approval, the asset gate is still too implicit.
