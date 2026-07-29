# Decision Register and Provenance Policy

- Effective date: 2026-07-26
- Status: canonical decision index and status vocabulary
- Owner: repository decision trail
- Related review:
  [Decision Provenance and Recommendation Status Audit](../reviews/DECISION_PROVENANCE_AND_RECOMMENDATION_STATUS_AUDIT_2026-07-26.md)

## Why this register exists

An ADR records a decision or a proposed decision. Its presence does not prove
operator acceptance, implementation, runtime correctness, or release status.
Those are different claims and must be stated separately.

The repository previously used **Accepted** for several incompatible meanings:
operator sign-off, an agent-selected implementation, a passing local test, and
an implemented evidence fixture. That made proposals look authoritative and
made runtime evidence look like product intent.

This register is the effective status source when an older ADR header or body
uses ambiguous historical language. Historical ADR text remains preserved; a
dated update log records corrections.

## Suggested order

1. Use the comms package first when you are handling launch or build-in-public work.
2. Use the reviews index next when you need evidence, approval, or closure context.
3. Use the public asset promotion package index when you need the asset-gate trail in one place.
4. Use this decision register when you need the load-bearing policy or status source.
5. Use the execution tracker and worklog for the active operational sequence.

## Source taxonomy

| Source class                                 | What it proves                                                                           | What it cannot prove                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------- |
| Direct operator statement                    | The exact principle, constraint, correction, or requested outcome stated by the operator | Unstated implementation details     |
| Explicit operator sign-off                   | Acceptance of a named ADR or its exact decision text                                     | Runtime correctness                 |
| Operator-supplied AI or third-party material | Research/proposal input selected for evaluation                                          | Operator authorship or acceptance   |
| Agent inference or synthesis                 | A reviewable proposal                                                                    | Operator intent                     |
| Static/runtime/test evidence                 | Current code behavior and its evidence ceiling                                           | Product intent or operator approval |

“The operator supplied this material” describes transport. It does not mean the
operator authored, endorsed, accepted, or decided every statement in it.

## Status vocabulary

| Status                                               | Required evidence                                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Proposed — operator sign-off required**            | A load-bearing product, architecture, authority, public-surface, economy, or irreversible policy has been drafted but not explicitly accepted. |
| **Accepted by explicit operator sign-off**           | A traceable direct statement accepts the named decision or exact text.                                                                         |
| **Implemented and verified for the current runtime** | Code exists and has proportional test/runtime evidence. This is a technical fact, not operator acceptance.                                     |
| **Implemented evidence fixture**                     | A bounded experiment exists. It does not select a product-wide architecture or roadmap.                                                        |
| **Historical / superseded**                          | Preserved for context; a linked newer decision is effective.                                                                                   |
| **Deferred / paused**                                | The decision or implementation waits on a named dependency or evidence gate.                                                                   |
| **Rejected**                                         | The decision is intentionally not pursued; the reason and revisit trigger are recorded.                                                        |

Load-bearing ADRs move to **Accepted** only through explicit operator sign-off.
Agents may implement reversible technical corrections within the requested
scope and label them **Implemented and verified for the current runtime**.

## Effective ADR index

| ADR      | Effective status                                             | Evidence / boundary                                                                                                                                                                                                                |
| -------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADR-0001 | Proposed                                                     | Engine bakeoff remains unresolved; Three.js is current runtime evidence.                                                                                                                                                           |
| ADR-0002 | Proposed thesis test                                         | Tractor/day-night material is one scenario, not the product center.                                                                                                                                                                |
| ADR-0003 | Proposed                                                     | Versioned composition model remains a staged architecture proposal.                                                                                                                                                                |
| ADR-0004 | Proposed policy with implemented deployment evidence         | Public Sites versions exist; the broader evidence-surface policy is not thereby accepted.                                                                                                                                          |
| ADR-0005 | Accepted by direct operator direction; implemented           | Product/repository identity is Rigs Unbound.                                                                                                                                                                                       |
| ADR-0006 | Accepted product principle; implemented contrasting evidence | The open rig/capability thesis is direct operator direction. Rig Lab particulars are evidence, not a universal mandate.                                                                                                            |
| ADR-0007 | Implemented and verified for the current runtime             | Field 02 terrain/traversal ownership, not a universal world model.                                                                                                                                                                 |
| ADR-0008 | Direct operator direction plus implemented runtime evidence  | Six selectable camera policies, including top-down, are current product behavior.                                                                                                                                                  |
| ADR-0009 | Implemented and verified for the bounded proof               | Ground and hover adapters do not define future mobility families.                                                                                                                                                                  |
| ADR-0010 | Proposed                                                     | Rendering/accessibility contract still needs its complete product gate.                                                                                                                                                            |
| ADR-0011 | Proposed with partial implementation evidence                | Command/capability/affordance separation remains the intended canonical seam.                                                                                                                                                      |
| ADR-0012 | Operator-requested exploration; implemented local frame      | The interaction chain came from operator-supplied AI feedback; `RigFeedbackFrame` is verified local evidence, not operator-authored architecture text.                                                                             |
| ADR-0013 | Implemented and verified deployment adapter                  | This describes current Sites packaging, not a permanent hosting commitment.                                                                                                                                                        |
| ADR-0014 | Proposed                                                     | Replay/streaming/authority sequencing remains staged.                                                                                                                                                                              |
| ADR-0015 | Proposed with current Three.js evidence                      | It does not close ADR-0001 by itself.                                                                                                                                                                                              |
| ADR-0016 | Proposed thresholds with local evidence                      | Representative-device and production budgets remain open.                                                                                                                                                                          |
| ADR-0017 | Implemented evidence fixtures; solver selection unresolved   | Rapier and Box3D labs are evidence, not accepted product authority.                                                                                                                                                                |
| ADR-0018 | Accepted by documented direct operator direction             | Journey, Verb Mastery, Insight, and bounded in-verb power remain accepted; implementation is incomplete.                                                                                                                           |
| ADR-0019 | Implemented and verified for the current runtime             | Monotonic world clock and exceptional recovery are current behavior.                                                                                                                                                               |
| ADR-0020 | Implemented and verified locally                             | Contextual first-use guidance is current behavior; real-touch/release proof remains open.                                                                                                                                          |
| ADR-0021 | Proposed — operator sign-off required                        | Load-bearing canonical-authority/admission policy had only Tier 1 evidence.                                                                                                                                                        |
| ADR-0022 | Implemented and verified for the current runtime             | Renderer pressure no longer uses player-controlled entry latency.                                                                                                                                                                  |
| ADR-0023 | Proposed — operator sign-off required                        | Solver-neutral evidence policy and lab distribution consequences remain open.                                                                                                                                                      |
| ADR-0024 | Implemented and verified for the current acceptance harness  | Browser-process isolation is test infrastructure, not product policy.                                                                                                                                                              |
| ADR-0025 | Proposed product contract; implemented source-only fixture   | Named emissions exist as bounded evidence; listener policy, operating state, accessibility, and gameplay admission remain open.                                                                                                    |
| ADR-0026 | Proposed — operator sign-off required                        | Cultivation provenance, schema-v7 ownership, sequencing, reward, and terrain-after-sow policy remain open.                                                                                                                         |
| ADR-0027 | Proposed — operator sign-off required                        | Terrain transformation grammar (clear, grade, fill) supersedes ad-hoc cut/fill plough modes.                                                                                                                                       |
| ADR-0028 | Proposed — operator sign-off required                        | Auto/explicit renderer backend selection is policy-gated and checkpointed at startup and recovery.                                                                                                                                 |
| ADR-0029 | Proposed — operator sign-off required                        | Machine-keeper odyssey product vision; downstream slice evaluation filter.                                                                                                                                                         |
| ADR-0030 | Historical / superseded by ADR-0031                          | Renderer-owned direct rig presentation was replaced by explicit delegation to `vehicleAnimationSystem`.                                                                                                                            |
| ADR-0031 | **Superseded by ADR-0034 (2026-07-28)**                      | The ownership boundary survives; the mechanism and the implementation claim do not. Its module would have re-derived kernel-owned `wheelRotation`/compression and dropped heading/pitch/roll. Correction preserved in ADR history. |
| ADR-0032 | Proposed — operator sign-off required                        | Episode runner composes bounded episodes above the contract ledger instead of creating a second quest ledger or hidden story machine.                                                                                              |
| ADR-0033 | Accepted                                                      | Mission propositions are derived; one active accepted contract is persisted through the authoritative lifecycle boundary; capability-shaped progression is canonical for current games; XP remains an optional future/hybrid policy. |
| ADR-0034 | Implemented and verified for the current runtime             | Simulation owns physical truth; `vehicleAnimationSystem` owns rig-local presentation and imported clip playback. Verified by reachability audit, 382 tests, and live `visualFrontIsForward` browser evidence.                      |
| ADR-0035 | Accepted by direct operator direction; modality implemented | Pegboard runs live with an accessibility pause opt-in. Keyboard/pointer verified; narrow-viewport and touch still open. |
| ADR-0036 | Rejected for runtime admission; module quarantined            | Universal XP contradicts ADR-0018. `xp-progression.ts` is preserved but forbidden from the runtime; the reachability audit enforces it and the rule is proven to fail on violation. |
| ADR-0037 | Implemented and verified for the current runtime | Solver-independent semantic roles, CCD, dynamic rig/cargo response, and observable contact identity are locally verified. Global solver selection remains unresolved. |
| ADR-0038 | Proposed — operator sign-off required                        | Runtime-tested bridge admission stays separate from public approval; the first public candidate is the breakable crate, not the tractor preview. |
| ADR-0039 | Proposed — operator sign-off required                        | Public shell keeps bootstrap/profile visible and route-gates diagnostics to the acceptance/developer surface. |

## Related current surfaces

- [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
- [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
- [Dynamic World Collision Exploration](../research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md)
- [Vehicle Game Visual Exploration Living Catalog](../vehicle_game_visual_exploration_living_catalog.md)
- [Comms package](../comms/README.md)
- [Reviews index](../reviews/README.md)
- [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)

For the current rig-local animation boundary, use ADR-0034 together with the
Three.js Animation Implementation Flow; ADR-0030 is historical record only.
The live owner keeps the reserved `ClipActionBindings` contract explicit so
future clip-backed rigs have a named boundary instead of an implied slot.

## Related runtime implementation flows

- [Three.js Animation Implementation Flow](../research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md)
- [Three.js Interaction Implementation Flow](../research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md)

## Recommendation labels outside ADRs

Research and plan documents use this separate vocabulary:

- **Candidate:** worth evaluating; no implementation or sign-off implied.
- **Proposed:** a specific path recommended for review.
- **Experimental:** implemented as a bounded fixture.
- **Runtime-tested:** observed in the current runtime with named evidence.
- **Public-approved:** explicitly admitted to the production package or public
  surface through its canonical manifest/decision gate.
- **Rejected / Deferred:** not active, with a reason or dependency.

Words such as **Adopt**, **Approved**, **Used**, **Production baseline**, and
**Canonical** must link to code/evidence and, when load-bearing, explicit
operator sign-off. Otherwise they are historical prose and not current status.

## Change protocol

1. Preserve historical ADR text.
2. Correct the effective header when it is factually wrong.
3. Append a dated update-log entry explaining the old and new status.
4. Update this register and the master tracker in the same pass.
5. Record implementation evidence separately from operator/product acceptance.
6. Reopen a decision when new evidence changes the question; do not silently
   promote a proposal.

## Anything else?

Yes. This register prevents status inflation, but it cannot replace explicit
sign-off. Open load-bearing choices remain open even when their proposed text
is strong, aligned with `motto_v4.md`, or already partially implemented.
