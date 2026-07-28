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

| Artifact                          | Authority                                                                      | Not authoritative for                                      |
| --------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Concept/model-sheet image         | identity, style, repair language, visual intent                                | topology, scale, collision, animation, runtime budgets     |
| Isolated reconstruction reference | admitted single-view reconstruction evidence                                   | hidden surfaces, exact dimensions, multi-angle consistency |
| Vehicle blueprint/spec            | dimensions, capabilities, sockets, pivots, collision/LOD intent, compatibility | final surface topology and baked visual appearance         |
| Approved source mesh/DCC          | editable visual source for a specific asset profile                            | game behavior unless linked to the blueprint               |
| Validated GLB/runtime mesh        | shipped visual geometry/material/hierarchy for a profile                       | future regeneration intent or unmodeled gameplay semantics |
| Manifest entry                    | identity, provenance, status, hashes, replacement path, source/runtime linkage | artistic judgment by itself                                |

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

## Addendum (2026-07-25): the repo is still reference-first, not shipped-mesh-first

- Re-checked the asset-authority contract against the current runtime and
  provenance records.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current runtime is still asset-light and procedural rather than imported-
  mesh-driven:
  - `src/game/renderer.ts` explicitly documents zero texture assets and zero
    asset provenance obligations for the current terrain pass,
  - the runtime still uses authored/procedural terrain, instanced props, and
    runtime-built Three.js geometry,
  - the provenance register still classifies the tractor references as
    concept/reference only, not approved shipped runtime assets,
  - the asset-pipeline contract still treats a versioned runtime asset manifest
    as the next durable step once imported art actually enters the playable
    path.
- That means the authority boundary in practice is still:
  - reference image for intent,
  - blueprint/spec for behavior and compatibility,
  - runtime procedural/Three.js geometry for the live field,
  - no imported shipped mesh authority yet for the browser runtime.
- The missing layer is still the promotion bridge:
  - no approved runtime GLB for the tractor/rig path,
  - no manifest entry proving a shipped mesh profile,
  - no browser-loaded imported mesh that has passed the promotion contract.
- So the contract is correctly staged: concept and provenance exist, but the
  shipped-mesh authority layer is still future work.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  doc, and provenance inspection.

## Addendum (2026-07-26) - promotion rules exist, but no mesh has crossed them yet

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The shipped-mesh boundary is now explicit in the repo's asset spine:
  - `assets/asset-manifest.json` names the registry entries and keeps them
    reference/proposed with `runtimePath: null`,
  - `tools/asset-preflight.mjs` refuses to treat promoted assets as valid
    unless they are safe repository-relative `.glb` runtime paths inside
    `assets/runtime`,
  - the manifest already records source and rights notes where they exist.
- That means the promotion contract is real, but not yet exercised:
  - no approved runtime GLB exists for the tractor or rig path,
  - no shipped mesh profile is active in browser play,
  - no replacement/deprecation cycle has been tested against a live imported
    asset,
  - the live field is still rendered from procedural/runtime-built geometry.
- The useful conclusion is that the repo now has the authority ladder for
  assets, but the actual mesh promotion is still future work.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-26) - bridge asset copied into repo runtime, browser proof still pending

- The authority ladder now has a concrete first runtime candidate in the repo:
  - `kenney-car-kit-breakable-crate-fixture`,
  - `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`,
  - source hash `38b74901586f61fb9d4bb54c55bcdafeb498ddda547063503c60d3e8d357dc87`.
- The renderer now contains a bridge fixture hook for that imported prop, so
  the repo has moved beyond naming-only authority into actual runtime wiring.
- I have **not** observed the live browser with this new bridge yet, so the
  authoritative claim is still limited to static code and repo state:
  - the asset has been copied into the repo-owned runtime directory,
  - the manifest points at it,
  - the renderer can attempt to load it with a fallback.
- The remaining proof obligation is browser-visible runtime confirmation.
- Evidence depth: Tier 1 static code/doc inspection, with the live browser
  confirmation still outstanding.

## Addendum (2026-07-26) - browser proof is complete for the first bridge asset

- Re-checked the live browser after the runtime texture dependency was copied.
- The bridge evidence hook now reports the crate as actually loaded rather than
  sitting on fallback:
  - `assetId`: `kenney-car-kit-breakable-crate-fixture`,
  - `status`: `loaded`,
  - `fallbackActive`: `false`,
  - `loadedNodeCount`: `1`,
  - `errorMessage`: `null`.
- The browser console returned to zero logs after the texture dependency was
  mirrored into `assets/runtime/Textures/colormap.png`.
- This satisfies the first shipped-mesh-style promotion proof for a small
  static prop:
  - manifest entry exists,
  - runtime copy exists,
  - renderer consumes it,
  - browser sees it cleanly.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-26) - tractor preview proves the bridge scales

- Re-checked the live browser after promoting the tractor preview into the same
  bridge path.
- The runtime now has two concrete asset bridges proving the authority ladder:
  - crate bridge: `kenney-car-kit-breakable-crate-fixture`, loaded, one node,
    no fallback,
  - tractor preview: `kenney-car-kit-tractor-preview`, loaded, five nodes, no
    fallback.
- That matters because it shows the manifest/authority contract is not limited
  to tiny props; it can carry a larger vehicle-shaped asset through the same
  promotion path without collapsing back to procedural-only truth.
- The live browser surface remains clean aside from the expected Vite connect
  logs.
- Evidence depth: Tier 4 runtime/manual observation.

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

## Addendum (2026-07-26) - runtime bridge exists, but public approval is still gated

- Re-checked the live manifest and runtime bridge after the asset-production
  skill pass.
- The manifest is no longer just a reference registry:
  - two entries now carry real `runtimePath` values,
  - both are runtime-tested GLB bridges,
  - both still remain `publicRuntimeApproved: false`.
- The runtime bridge is therefore real, but it is still developer-scoped rather
  than publicly approved.
- That keeps the contract honest:
  - `assets/asset-manifest.json` owns identity, source, license, and approval
    state;
  - `src/game/runtime-assets.ts` owns the bridge gate and presentation contract;
  - the runtime asset bridge is not yet the same thing as public runtime
    approval.
- `runtimePath: null` remains correct only for the reference-only entries. It is
  no longer a universal statement about the whole manifest.
- The next durable asset proof should be a public-runtime admission gate or a
  vehicle-specific mesh contract, not another hidden bridge.

## Addendum (2026-07-28) - developer bridge proof is live; approval still belongs to the manifest gate

- Re-checked the canonical browser on the developer surface:
  `http://localhost:4173/?surface=developer`.
- The current runtime bridge evidence reports both imported assets as loaded:
  - crate: `kenney-car-kit-breakable-crate-fixture`,
  - tractor preview: `kenney-car-kit-tractor-preview`.
- The public approval gate is still separate from that bridge proof because the
  manifest keeps `publicRuntimeApproved: false` for both assets.
- The right asset-authority conclusion has not changed:
  - developer bridge proof is about import and browser visibility,
  - public approval is a distinct promotion decision,
  - the breakable crate remains the best first candidate for that decision,
  - the tractor preview remains the better developer-scale proof, not the
    first public candidate.
- Evidence depth: Tier 4 live browser inspection plus current manifest state.
