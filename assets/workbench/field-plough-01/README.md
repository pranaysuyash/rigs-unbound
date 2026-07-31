# Field Plough 01 — Reconstruction Workbench

Status: `development placeholder available; img2threejs blockout locked at refine-code`

This is the first bounded object package for the asset-first lane. The initial
generic img2threejs preview failed its reference comparison because semantic
component labels were reduced to unrelated primitives. That preview is retained
as compiler evidence, but it is superseded for visual use by
`authored/createFieldPloughModel.ts`.

The authored factory is a development procedural blockout that can be explored
and iterated in the open-world asset lane. It preserves the reference-specific
four-share structure, triangulated hitch, crossbeam, hydraulic assembly,
fastener rhythm, and named sockets. It does not yet claim photoreal hero
fidelity. Runtime adapter integration, simulation collision, optional GLB
delivery, and public distribution remain explicit separate contracts.

It is not an accepted img2threejs blockout pass. The governing skill was
subsequently rerun end to end. Strict spec validation passes, but Tier 1 still
fails at silhouette IoU `0.470` against `0.85` and aspect-ratio delta `0.1001`
against `0.05`. Scale delta now passes at `0.0611` against `0.08`. Divine Eye
returns `probe` at `0.714`, detects reconstruction mode, and the multi-angle
degeneration check passes. The locked pipeline therefore remains at
`blockout`, with the recorded action `refine-code`.

## Source

- [Object reference](../../generated/field-plough-01-object-reference-2026-07-29.png)
- [Generation prompt and review note](../../generated/field-plough-01-object-reference-2026-07-29.prompt.md)
- [Asset catalog](../../../docs/exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md)
- [Canonical asset definition](../../specs/field-plough-01.asset.json)

## Existing runtime seam

The project already names `field-plough` as an attachment and exposes a
renderer-owned `ploughPivot`. This package should eventually provide a visual
factory that can be adapted to that presentation seam without becoming
simulation authority.

## Required semantic nodes

- `root`
- `attachment-frame`
- `top-link-socket`
- `lower-left-hitch`
- `lower-right-hitch`
- `cross-beam`
- `plough-share-system` (repeated shares, count confirmed from evidence)
- `hydraulic-ram` with hinge pivots
- `soil-contact` / tool-edge markers
- simplified collider metadata, separate from visual geometry
- explicit folded/raised and lowered/deployed state hooks

## Pipeline evidence expected here

1. image probe and reference-admission result;
2. pre-spec assessment and quality contract;
3. detail inventory mapping fasteners, bevels, seams, rust, soil, and repeated
   shares to concrete spec fields;
4. strict sculpt-spec validation;
5. locked pass status and generated Three.js factory;
6. named review render(s), comparison sheet(s), and multi-angle inspection;
7. explicit self-correction action and a runtime-adapter disposition.

The workbench contains an authored procedural part package, not only a picture
or an unstructured blockout. The factory exposes stable attachment sockets,
replaceable share subassemblies, material slots, and `shareCount`, `wearLevel`,
and `paintColor` variants. The package contract is recorded at
`package/field-plough-01.part-package.json`, and the deterministic developer GLB
derivative is at `assets/runtime/field-plough-01.glb`.

This is usable as a developer rig part and as the source seam for future
customizable implements. It is not yet hero-reference approved: the current
img2threejs Tier 1 silhouette gate still fails, and the visual mesh remains
below the quality bar shown by the reference. A runtime derivative does not
become simulation collision authority or public distribution approval by
implication.

The canonical asset definition in `assets/specs/` is the source of truth for
identity, geometry intent, sockets, action states, materials, collision
ownership, LOD, provenance, compiler stages, and validation. The
`object-sculpt-spec.json` in this directory is a derived `img2threejs` input and
must not become a second authoritative asset definition.

## Current evidence

- Probe: passed.
- Reference admission: passed.
- Pre-spec assessment: completed; complex articulated hard-surface rig part.
- Detail inventory: 12 mapped observed details in `detail-inventory.json`.
- Painted-steel PBR extraction: passed at confidence `0.86` against threshold
  `0.70`.
- Normal sculpt-spec validation: passed with warnings.
- Strict sculpt-spec validation: passed with zero errors and zero warnings; see
  `strict-quality-result.md` and `validate-strict-quality.json`.
- Generic Three.js factory: generated at
  `generated/createFieldPloughModel.ts`, then rejected as the canonical visual
  because its comparison did not preserve the reference assembly.
- Canonical authored Three.js factory:
  `authored/createFieldPloughModel.ts`.
- Factory TypeScript compilation: passed in isolated workbench compilation.
- Browser review: captured from the named review harness, including a
  controlled raw-canvas comparison sheet and neutral/grazing multi-angle
  captures.
- Visual parity report: `review/visual-parity-review.json`; development blockout
  available as a placeholder, img2threejs blockout not accepted, and photoreal
  hero use rejected until the listed refinements close.
- Skill-owned review history: recorded directly in
  `object-sculpt-spec.json`; the first action is `refine-spec`, followed by
  `refine-code` after the canonical helicoidal, cutting-share, camera, and
  evidence-preservation contracts were strengthened.
- GLB export: deterministic developer derivative, 1,175,856 bytes, SHA-256
  `fa3681d96758b4808d84061858dd999b79dcc58307f574d2bf248896f356dc20`, with
  zero GLB preflight findings.
- Customization contract: available for 3 or 4 shares, normalized wear, and
  paint color, with named replaceable share mount and cutting-edge sockets.
- Runtime adapter: GLB and package are repo-local and validated; manifest
  admission is intentionally deferred to the parallel-owned runtime lane, so
  `src/game/` was left untouched.
- Public approval and hero reference fidelity: explicitly open, with the
  measured Tier 1 failures retained in `review/visual-parity-review.json`.

The reproducible compiler entry point is `npm run assets:build-field-plough`.
`assets:derive-field-plough` is the spec-only substep; the full command also
reruns strict validation, regenerates the factory, and prepares its visual
review path. The canonical asset definition remains authoritative.

The next refinement pass is production surface work: bevel fabricated edges,
deepen moldboard twist, refine cutting-share profiles, add authored wear masks,
and improve clevis, weld, hydraulic, and rear-side detail using additional
references. The authored blockout is already available for open-world
development review. Collision authority and runtime state stay with their
explicit owners.
