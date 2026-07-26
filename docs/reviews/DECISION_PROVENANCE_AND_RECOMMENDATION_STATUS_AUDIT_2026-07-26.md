# Decision Provenance and Recommendation Status Audit

- Date: 2026-07-26
- Status: completed Tier 1 decision-provenance audit; recommendation-language
  audit remains active through RU-0906
- Scope: ADR-0006, ADR-0012, ADR-0018, ADR-0021, Farmfall, Time Trial Ghost,
  implementation-only ADRs, and high-impact library/adoption labels
- Canonical index:
  [Decision Register and Provenance Policy](../decisions/README.md)
- Predecessor:
  [Physics Decision Provenance and First-Principles Audit](PHYSICS_DECISION_PROVENANCE_AND_FIRST_PRINCIPLES_AUDIT_2026-07-26.md)

## Finding

The repository mixed five distinct claims:

1. the operator stated a product principle;
2. the operator explicitly accepted a named decision;
3. an agent selected a reversible implementation;
4. code/tests/runtime proved that implementation;
5. a research document recommended a candidate.

Those claims are not interchangeable. The correction preserves genuine
operator direction and executable evidence while removing authority that was
inferred from AI-generated background or from implementation alone.

## Audited decisions

| Artifact | Previous wording | Provenance finding | Effective status |
| --- | --- | --- | --- |
| ADR-0006 | Entire portability package “Accepted” from project-owner supply | The broad vehicle-universe and no-tractor-privilege principle is direct operator direction in this session. The exact buggy/towing fixture came from supplied ChatGPT material and agent implementation. | Product principle accepted; fixture implemented evidence |
| ADR-0012 | Shared frame accepted from the operator’s interaction-chain direction | “Physics, controls, animation, lighting, camera, sound and feedback are gameplay systems” was supplied as the user’s request. `RigFeedbackFrame` is the agent-selected, tested implementation seam. | Product principle accepted; local frame implemented and verified |
| ADR-0018 | Accepted from “do all” plus vertical-power amendment | The exploration document records the operator statement verbatim and the current persistent goal again instructs the agent to proceed on all open work. | Accepted; implementation incomplete |
| ADR-0021 | Accepted load-bearing architecture policy with Tier 1 evidence | No explicit sign-off trail exists for the exact policy. Strong alignment with `motto_v4.md` is not acceptance. | Proposed; explicit operator sign-off required |
| ADR-0022 | Accepted for implementation | This is a reversible runtime correction derived from measured evidence, not a product-policy sign-off. | Implemented and verified for current runtime |
| ADR-0024 | Accepted | This is a browser-harness lifecycle fix with integration evidence, not product policy. | Implemented and verified for current harness |
| Farmfall plan | Active plan under “do all” | The workstream is in scope, but exact threat, crop, schema, balance, and presentation details remain a proposal until implementation evidence exists. | Active execution candidate; design details proposed |
| Time Trial Ghost plan | Planned third workstream under “do all” | The workstream is in scope. Exact circuit/replay data shapes remain proposed and must follow current save/replay evidence. | Queued execution candidate; design details proposed |

## High-impact recommendation correction

The comprehensive animation/physics library evaluation previously called
PyBullet, Manim, and MoviePy “Approved Tooling,” claimed PyBullet was “Used,”
and placed Rapier inside product simulation authority. Static inspection found:

- no PyBullet implementation or evidence artifact validating the authored
  Field 02 or Rapier math;
- no current proof that Manim is part of the production workflow;
- media tooling evidence exists, but that does not approve every named library;
- Field 02 remains authored TypeScript simulation, while Rapier and Box3D are
  bounded labs.

That document now carries a prominent current-status correction. Its historical
rows remain intact and are non-authoritative.

## Plan authority

“Proceed on all” means each named workstream stays on the master tracker and is
worked in dependency order. It does not mean every implementation detail inside
an agent-authored plan has been accepted. The distinction is:

```text
workstream in scope
≠ exact design accepted
≠ implementation complete
≠ runtime verified
≠ production released
```

Farmfall and Time Trial therefore remain real obligations without converting
their first drafts into immutable architecture.

## Correction actions

- Added one canonical decision register and status vocabulary.
- Preserved ADR history while correcting current effective headers.
- Added append-only status/provenance entries to affected ADRs and plans.
- Kept ADR-0018 accepted because it has documented direct operator evidence.
- Kept ADR-0006 and ADR-0012 accepted only at the product-principle layer.
- Returned ADR-0021 to Proposed pending explicit operator sign-off.
- Reclassified ADR-0022 and ADR-0024 as implemented technical decisions.
- Kept Farmfall and Time Trial active while labelling exact designs proposed.
- Kept RU-0906 active until repository-wide recommendation-language output is
  generated and remaining false labels are corrected.

## Three-pass review

### Pass 1 — immediate correctness

Checked the named ADRs, plans, supplied session material, current tracker, and
the physics predecessor audit. Corrected false equivalence between supplied
material and operator authorship.

### Pass 2 — architecture and long-term viability

Separated durable product principles from bounded implementation seams. No
solver, controller, crop loop, threat model, or replay schema became universal
through documentation alone.

### Pass 3 — rule compliance and supervision readiness

Applied `motto_v4.md` AI-output, ADR-first, append-only update, evidence-tier,
and explicit sign-off rules. The effective status of every ADR is visible in
one register; open operator choices remain open.

## Anything else?

Yes. The next status-inflation risk is not only ADR wording. Research catalogs
contain recommendation verbs that can be mistaken for implementation or
production admission. RU-0906 stays open until a reusable audit enumerates
those labels and each high-impact false claim is corrected or bounded.
