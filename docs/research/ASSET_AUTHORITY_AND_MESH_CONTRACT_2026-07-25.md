# Asset Authority and Shipped Mesh Contract — 2026-07-25

## Decision

Rigs Unbound will not treat “reference image” and “mesh” as mutually exclusive
sources of truth.

- A reference image is design evidence and an input to reconstruction or art
  direction. It is not a shipped runtime asset.
- A validated mesh/GLB may be the canonical shipped visual artifact for a
  specific platform/profile. The mesh is not disqualified merely because it was
  generated or reconstructed.
- A playable vehicle also needs a versioned vehicle contract that owns behavior
  and compatibility data the mesh cannot fully express: dimensions, wheel and
  suspension pivots, sockets/hardpoints, collision intent, capabilities,
  animation roles, LOD targets, material slots, and save/replay compatibility.

The resulting relationship is:

```text
vehicle contract / blueprint ──┐
                               ├─> validated runtime mesh profile ─> browser
reference images ──────────────┘
```

The blueprint does not replace the mesh, and the mesh does not replace the
blueprint.

## Why this is the right boundary

For a static prop, a validated mesh can reasonably be the primary authoring and
runtime artifact. For a playable vehicle, the visual asset participates in
physics, interaction, animation, upgrades, attachments, and compatibility. A
mesh alone cannot reliably define those contracts, while an image cannot define
topology, pivots, UVs, collision, or runtime budgets.

This means the prior conversation's strongest claim is accepted with one
qualification: a specification is the source of truth for vehicle behavior and
regeneration, while an approved mesh is the source of truth for the shipped
visual geometry of a named profile.

## Authority by artifact

| Artifact | Authority | Not authoritative for |
| --- | --- | --- |
| Concept/model-sheet image | identity, style, repair language, visual intent | topology, scale, collision, animation, runtime budgets |
| Isolated reconstruction reference | admitted single-view reconstruction evidence | hidden surfaces, exact dimensions, multi-angle consistency |
| Vehicle blueprint/spec | dimensions, capabilities, sockets, pivots, collision/LOD intent, compatibility | final surface topology and baked visual appearance |
| Approved source mesh/DCC | editable visual source for a specific asset profile | game behavior unless linked to the blueprint |
| Validated GLB/runtime mesh | shipped visual geometry/material/hierarchy for a profile | future regeneration intent or unmodeled gameplay semantics |
| Manifest entry | identity, provenance, status, hashes, replacement path, source/runtime linkage | artistic judgment by itself |

## Promotion contract for a mesh

A generated or reconstructed mesh can move from candidate to shipped runtime only
when all of these are true:

1. its source/reference and rights status are recorded;
2. it is linked to a vehicle blueprint or static-prop contract;
3. scale, axis, hierarchy, pivots, sockets, material slots, collision intent,
   LOD targets, and fallback/replacement behavior are explicit;
4. the exported GLB passes structural preflight;
5. the actual browser consumer loads it successfully;
6. visual, semantic, performance, and failure-path evidence is recorded;
7. the manifest stores the source hash and derived runtime hash/profile.

The current tractor does not meet this promotion contract. Its isolated image is
admitted reference evidence, and its generated factory is an intake artifact;
the blockout visual gate remains failed. This is a quality gate, not a rejection
of the mesh approach.

## Current implementation mapping

- `assets/asset-manifest.json` remains the identity/provenance registry.
- `object-sculpt-spec-authored.json` is the current reconstruction/geometry
  specification, not yet the complete vehicle gameplay blueprint.
- The generated Three.js factory is a candidate visual artifact under the
  intake directory, not a production runtime asset.
- `runtimePath: null` is correct until a validated GLB and browser proof exist.
- The next vehicle-specific contract should be added before runtime promotion,
  rather than encoding sockets, collision, or animation assumptions only inside
  the mesh file.

## Options considered

1. **Image as canonical runtime truth** — rejected; it cannot provide runtime
   geometry or behavior contracts.
2. **Mesh as the only canonical truth** — rejected for playable vehicles; it
   loses behavior, compatibility, and regeneration semantics.
3. **Specification replaces the mesh** — rejected; the game still needs a
   validated visual artifact with measurable browser behavior.
4. **Linked blueprint plus validated mesh profile** — chosen; it preserves
   shipping pragmatism while keeping vehicle evolution and compatibility
   explicit.

## Revisit trigger

Revisit this decision if Rigs Unbound limits vehicles to static decorative props,
or if a future runtime format provides a formally validated, portable contract
for all gameplay semantics currently held outside the mesh.
