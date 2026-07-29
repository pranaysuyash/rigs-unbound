# Public Asset Promotion Approval Record Field Map

- Date: 2026-07-29
- Status: operator worksheet; approval still required
- Evidence tier: Tier 1 synthesis
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- Related checklist: [Public Asset Promotion First Public Candidate Checklist](PUBLIC_ASSET_PROMOTION_FIRST_PUBLIC_CANDIDATE_CHECKLIST_2026-07-28.md)
- Related template: [Public Asset Promotion Approval Record Template](PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_TEMPLATE_2026-07-28.md)
- Related workflow: [Public Asset Promotion Workflow for First Runtime Bridge Candidate](../research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md)

## Purpose

This worksheet maps the blank approval record template to the exact source
evidence the operator should consult when deciding whether the first public
asset may cross from runtime-tested bridge proof into player-safe truth.

It is deliberately not the approval decision. It only answers:

- which field comes from which source;
- which evidence already exists;
- which items still require operator judgment.

## Canonical candidate

- Asset id: `kenney-car-kit-breakable-crate-fixture`
- Secondary runtime bridge candidate: `kenney-car-kit-tractor-preview`

## Field map

### Decision header

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| Asset id | Manifest row and package index trail | Must match the stable semantic key exactly. |
| Asset kind | Manifest row / provenance register | Keep static-prop vs vehicle semantics explicit. |
| Current manifest status | `assets/asset-manifest.json` and runtime bridge review | Should still be `runtime-tested` before approval. |
| Current `publicRuntimeApproved` value | `assets/asset-manifest.json` | Approval remains `false` until operator sign-off. |
| Current runtime path | Manifest row and bridge evidence note | Use the project-owned runtime path, not a derived guess. |
| Rights status | Provenance register and asset audit trail | Needs a compact, readable license/source summary. |
| Reviewer / approver | Operator sign-off | This is the field that cannot be synthesized by an agent. |
| Decision date | Operator decision date | Use the actual sign-off date, not the worksheet date. |

### Rights / provenance summary

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| Source type | Provenance register | Distinguish CC0, private source library, generated, scanned, or modeled. |
| Source owner / license | Provenance register and library audit | Must be readable in the decision record itself. |
| Source hash or stable identity | Manifest / provenance register | Prefer the stable source identity that downstream reviewers can verify. |
| What was checked for rights/provenance | Workflow + checklist + provenance register | Record the exact checks, not a vague “looked okay.” |
| What remains restricted or conditional | Provenance register and policy notes | State any limits on redistribution, reuse, or replacement. |

### Why this asset

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| Why this asset is the right first public candidate | Candidate checklist and promotion review | Use the documented low-risk reasoning, not a new rationale. |
| Why it is lower risk than the alternatives | Candidate checklist and workflow | Compare against the tractor preview explicitly. |
| Why it should be public now rather than later | Operator judgment plus current runtime evidence | This is the part that needs sign-off, not synthesis alone. |

### Proof already in hand

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| Developer-surface bridge evidence | Developer runtime bridge note / review trail | Confirms the asset loads in the developer surface. |
| Browser/runtime proof | Live runtime evidence already captured in the repo trail | Keep the proof source visible in the record. |
| Loaded node count / runtime visibility | Runtime bridge evidence note / manifest runtime report | Use the measured figure from the live bridge evidence. |
| Fallback behavior | Runtime bridge review / player-gate evidence note | Should state fallback inactive for the bridge proof. |
| Manifest provenance / hash / license evidence | Asset manifest + provenance register | Prove identity and rights together. |
| Rights/provenance summary used for the approval decision | Filled approval record itself | This must be copied into the decision artifact, not just referenced. |

### Player-surface risk

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| What the player will see | Runtime preview and operator judgment | Keep the player-facing effect concrete. |
| What could go wrong | Player-gate note, workflow, and candidate checklist | Focus on mismatch, confusion, rollback, or authoring drift. |
| What must stay unchanged | Manifest invariants and player gate | Preserve the unapproved/approved split. |
| What fallback or rollback path exists | Workflow and ADR-0038 | Must be reversible without ambiguity. |

### Replacement / rollback

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| Replacement path | Workflow and asset-provenance trail | Name the successor or replacement candidate if one exists. |
| Alias or backward-compatibility path | Manifest policy and runtime bridge notes | Only include if the player surface already depends on it. |
| Revert condition | Operator judgment plus manifest gate | State the exact trigger that would flip the asset back. |
| Owner of rollback decision | Operator / project owner | This is operational authority, not a synthesis field. |

### Approval

| Template field | Recommended source / evidence | Notes |
| --- | --- | --- |
| Approved: yes / no / deferred | Operator sign-off | This is the final authority field. |
| Approval note | Operator sign-off | Keep it brief, explicit, and reversible. |
| Follow-up if deferred | Checklist and workflow | Capture the next check or dependency. |

## What is already available

- The manifest/runtime bridge split is documented.
- The first public candidate is already named.
- The approval template exists.
- The package index points at the trail.
- The decision register keeps ADR-0038 in proposed status until sign-off.

## What is still missing

- A populated operator approval record.
- A traced sign-off for the crate or a deliberate deferral.
- Any manifest update that would follow a real approval.

## Anything else?

Yes: if the operator has to guess how to fill any field above, the trail is
still too implicit.
