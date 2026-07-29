# Field Plough 01 — Reconstruction Workbench

Status: `intake-pending`

This is the first bounded object package for the asset-first lane. It is a
rig-part candidate, not a runtime mesh, and it must not be copied into
`src/game/` without a separate integration review.

## Source

- [Object reference](../../generated/field-plough-01-object-reference-2026-07-29.png)
- [Generation prompt and review note](../../generated/field-plough-01-object-reference-2026-07-29.prompt.md)
- [Asset catalog](../../../docs/exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md)

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

The workbench may contain generated TypeScript and JSON, but it is not a
runtime asset package until the project’s GLB/runtime bridge question is solved
or the presentation path explicitly accepts a procedural factory.
