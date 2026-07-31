# ADR-0047 — Canonical Asset Definitions and Compiler Stages

Status: Proposed — operator sign-off required  
Date: 2026-07-29

## Decision

Rigs Unbound will treat a versioned canonical asset definition under
`assets/specs/` as the source of truth for each reusable asset. The definition
owns the semantic asset graph: identity, observed evidence, provisional
dimensions, component hierarchy, pivots, sockets, materials, action states,
collision ownership, LOD, runtime adapter, provenance, compiler stages, and
acceptance evidence.

`img2threejs` is a derived compiler stage. Its intake files, sculpt spec,
generated factory, PBR maps, comparison sheets, GLB, thumbnails, and runtime
adapter are outputs or evidence. None of them may silently become a second
authoritative definition.

## Context

The first field-plough run proved that image probe, reference admission, detail
inventory, and PBR extraction can pass while a generated sculpt spec remains
too shallow for production. Treating the validator failure as the end of the
workflow would produce a proof-of-concept asset, not an asset package another
agent could safely regenerate and integrate.

The project also has distinct ownership boundaries:

- the renderer owns visual presentation;
- simulation owns physical collision and terrain/tool authority;
- the manifest owns asset identity and lifecycle admission;
- the asset definition must connect those surfaces without collapsing them.

## Options considered

1. **Prompt plus generated sculpt JSON as the source of truth.** Rejected: it
   couples the asset to one tool and loses runtime behavior, collision, LOD,
   provenance, and replacement decisions.
2. **GLB as the source of truth.** Rejected: a mesh cannot explain gameplay
   verbs, semantic sockets, uncertainty, compiler inputs, or ownership.
3. **Canonical asset definition plus derived compiler stages.** Chosen: it
   preserves regeneration, reviewability, and domain ownership while allowing
   different output paths for rigs, rig parts, vegetation, roads, sprites, and
   scene kits.

## Required contract

Every candidate must provide:

- at least one admitted reference and explicit uncertainty list;
- macro/meso/micro component hierarchy where the asset requires it;
- named pivots, sockets, attachment contracts, and collision intent;
- independent material layers and local overrides;
- behavior states and action/interaction contracts;
- LOD and performance budgets;
- provenance and rights posture;
- compiler stages and derived artifact paths;
- validation gates with evidence tier and current disposition.

## Consequences

Positive:

- a new generator or polygon budget can rebuild from the same semantic asset;
- subagents receive bounded, explicit work packages;
- visual meshes cannot accidentally become simulation colliders;
- scene kits can compose admitted assets without replacing world truth;
- blocked gates remain actionable evidence rather than silent debt.

Tradeoffs:

- each asset requires more authoring before code generation;
- the first implementation needs a canonical factory-to-GLB seam;
- some image-derived values remain provisional until authored measurements or
  multi-view evidence replace them.

## Validation and rollback

The first implementation is the field-plough definition at
`assets/specs/field-plough-01.asset.json`. Manifest preflight now checks linked
canonical specs for required structural fields. The field-plough is accepted as
a development procedural candidate once its source definition and factory are
available. Visual refinement, collision separation, optional GLB delivery,
runtime adapter integration, and public provenance are evidence tracks, not a
self-imposed existence blocker. Simulation collision and public distribution
remain independently owned contracts.

Rollback is additive: remove or supersede the manifest link and retain the
historical spec/workbench evidence. No runtime state or simulation contract is
changed by this decision.

## Revisit triggers

- a second asset family proves that the contract cannot express its real
  geometry or behavior without parallel truth;
- a canonical factory-to-GLB/export path is selected;
- runtime adapter ownership changes;
- public distribution terms change;
- operator sign-off accepts or rejects the proposed contract.

## Anything else?

Yes. This ADR does not declare the field-plough production-ready. It records
the architecture required to make production readiness meaningful.

## Addendum (2026-07-29) — procedural candidates are open-world development assets

The earlier wording treated visual review, GLB export, and runtime adapter
integration as a single promotion barrier. That was an agent-imposed workflow
restriction, not a product requirement. The canonical lifecycle now distinguishes
`procedural-candidate` from `runtime-tested` and `public-approved`: a candidate
can be used for open-world exploration and iterative development as soon as its
semantic definition, derived factory, provenance posture, and current evidence
are recorded.

The evidence roadmap remains mandatory, but its entries describe what is known,
what needs refinement, and what owner must close each contract. It does not
prevent useful development work. Collision authority remains simulation-owned,
and public approval remains a distribution decision.
