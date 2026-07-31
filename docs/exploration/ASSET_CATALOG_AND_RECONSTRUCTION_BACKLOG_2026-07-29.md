# Asset Catalog and Reconstruction Backlog — 2026-07-29

Status: `Proposed` living catalog. This is the long-list planning surface for
object-first production; the machine-readable identity/status source remains
[`assets/asset-manifest.json`](../../assets/asset-manifest.json), and lineage
remains in the [asset provenance register](../research/ASSET_PROVENANCE_REGISTER.md).

## First-principles production split

The project needs a library of reusable semantic assets, not only scene
illustrations. Every candidate gets an identity, visual reference, material
families, sockets/pivots, collision role, animation or destruction role,
runtime budget, provenance, and a replacement path.

Each admitted candidate has one canonical definition under `assets/specs/`.
The manifest owns identity/lifecycle and points to that definition; workbench
files, `img2threejs` sculpt specs, textures, factories, GLBs, thumbnails, and
runtime adapters are derived artifacts. This prevents prompts, meshes, or
tool-specific JSON from becoming parallel sources of truth.

`img2threejs` is appropriate for isolated reconstructible objects and
articulated assemblies. It produces a code-only procedural Three.js candidate;
it does not extract a mesh from pixels, prove hidden geometry, or authorize a
runtime/public asset. Clouds, sprites, decals, road surfaces, water, and whole
scenes belong to 2D, texture, procedural, or composition pipelines instead of
being forced through object reconstruction.

## Canonical asset classes

| Class | Examples | Primary build path | First gate |
| --- | --- | --- | --- |
| `rigs` | utility tow, patchwork tractor, marsh hauler | imagegen reference -> `img2threejs` -> browser review | silhouette + sockets + action hierarchy |
| `rig-parts` | winch, boom, stabilizer, plough, beacon, wheel module | `img2threejs` or authored procedural module | attachment contract + pivot behavior |
| `props` | crates, drums, lamps, signs, tools, bridge hardware | authored reference -> procedural Three.js or GLB intake | readable identity + collider role |
| `vegetation` | trees, reeds, crop rows, root clusters | imagegen reference -> procedural instancing / authored low-poly | silhouette families + wind/LOD behavior |
| `roads-and-infrastructure` | mud road, timber road, culvert, bridge, floodgate | tileable materials + procedural scene modules | traversal readability + collision authority |
| `sprites-and-decals` | cloud cards, dust, birds, warning marks, route labels | imagegen -> 2D atlas / canvas / shader | alpha, scale, readability, licensing |
| `environment-assets` | water edge, mud bank, field, drainage station | procedural materials + modular geometry | material response + composition sockets |
| `scene-kits` | Marsh Depot, Floodgate 12, Home Silo | composition of admitted assets | repeatable placement + browser performance |

## Long list

### Rigs

- [ ] `utility_tow_recovery_01` — first reconstruction candidate; reference plate now lives in `assets/generated/`; workbench is `assets/workbench/utility-tow-recovery-01/`.
- [ ] `patchwork_tractor_01` — reconcile the existing tractor probe with current design spine and request a cleaner multi-view object package.
- [ ] `marsh_hauler_01` — amphibious cargo rig for water-edge routes.
- [ ] `field_crawler_01` — low-clearance farming/repair rig with implement sockets.
- [ ] `bridge_lifter_01` — construction rig whose stabilizers and lift points are gameplay-readable.
- [ ] `scout_bike_01` — light vehicle with a readable silhouette at compact viewport scale.

### Rig parts and modules

- [ ] `recovery_boom_module_01` — hinge pivot, cable socket, folded/deployed states.
- [ ] `winch_module_01` — spool, cable path, slack/taut/overload fixtures.
- [ ] `front_tow_eye_pair_01` — reusable towing attachment and collision proxy.
- [ ] `stabilizer_leg_pair_01` — hinge/root pivots and ground-contact sockets.
- [ ] `plough_implement_01` — tool socket, soil-contact cue, detachable group.
- [ ] `cargo_platform_module_01` — load boundary, balance/readability markers.
- [ ] `service_drawer_module_01` — open/closed hinge and operator affordance.
- [ ] `amber_beacon_module_01` — emissive material plus light-effect socket.
- [ ] `wheel_module_mud_01` — tire tread family, axle pivot, terrain contact proxy.
- [ ] `headlamp_pair_01` — glass, emissive bulb, broken/disabled fixture.

### Props

- [ ] `repair_crate_01`
- [ ] `fuel_drum_01`
- [ ] `tool_chest_01`
- [ ] `floodgate_warning_sign_01`
- [ ] `dock_lamp_01`
- [ ] `salvaged_pipe_stack_01`
- [ ] `rope_coil_01`
- [ ] `portable_generator_01`

### Vegetation

- [ ] `marsh_willow_tree_family_01` — 3 silhouette tiers, branch/root sockets, wind groups.
- [ ] `reed_cluster_family_01` — instanced strands, wetness variation, shallow-water placement.
- [ ] `crop_row_family_01` — readable field bands, damage states, traversal boundaries.
- [ ] `moss_root_cluster_01` — modular bank/structure dressing.
- [ ] `fallen_branch_family_01` — obstacle variants with simplified colliders.

### Roads and infrastructure

- [ ] `mud_road_tile_family_01` — dry/wet/rutted variants, tire-readability cues.
- [ ] `timber_causeway_tile_family_01` — deck, supports, broken segment state.
- [ ] `culvert_crossing_module_01` — water flow, embankment, traversal role.
- [ ] `floodgate_12_module_01` — gate, hinge, warning hardware, before/after state.
- [ ] `drainage_station_module_01` — pump, channel, service platform, route socket.
- [ ] `dock_edge_module_01` — water boundary, mooring points, cargo placement.

### Sprites, clouds, and 2D support

- [ ] `cloud_card_family_01` — 3 depth groups, alpha-tested cards, wind drift profiles.
- [ ] `dust_and_mist_atlas_01` — route-scale weather and recovery feedback.
- [ ] `bird_silhouette_atlas_01` — low-frequency ambience; no 3D reconstruction required.
- [ ] `route_mark_decal_atlas_01` — readable path cues with accessibility-safe contrast.
- [ ] `damage_and_wear_decal_atlas_01` — authored local variation, never truth for collision.

### Environment and scene kits

- [ ] `marsh_bank_material_family_01`
- [ ] `shallow_water_material_family_01`
- [ ] `field_soil_material_family_01`
- [ ] `marsh_depot_scene_kit_01` — composes road, depot, dock, lamps, crates, and tow rig.
- [ ] `floodgate_12_scene_kit_01` — composes gate, culvert, warning signs, water, and repair staging.
- [ ] `home_silo_scene_kit_01` — composes existing runtime bridge props with future authored modules.

## Admission contract for every candidate

1. **Reference** — isolated or tile-specific input with a review note; no scene
   plate is accepted as an object reference without an explicit crop or
   decomposition.
2. **Intake** — probe, suitability/admission result, and confidence/unknowns.
3. **Specification** — macro/meso/micro details, material layers, topology
   class, evidence references, and for attached parts a parent socket,
   local endpoints, overlap/embed depth, and gap tolerance.
4. **Build** — procedural source or authored runtime asset stays in a
   repo-owned workbench; visual mesh, collision proxy, sockets, and semantic
   groups are separate concerns.
5. **Review** — named browser viewpoints, comparison sheets, multi-angle
   inspection, and a recorded self-correction action.
6. **Runtime bridge** — remains an explicit integration track. A procedural
   candidate may be used for open-world development once its source definition,
   factory, evidence, and provenance are recorded. Preflight, browser,
   performance, collision, operator/readability, and public-rights evidence
   continue to describe readiness and ownership; `publicRuntimeApproved`
   remains false until the public promotion package is complete.

## Current queue

1. `utility_tow_recovery_01`: run intake and strict pre-spec gates against the
   new isolated object reference; stop or request additional views when the
   hidden geometry blocks confidence.
2. `recovery_boom_module_01`: derive a smaller part package from the rig so
   pivot/attachment behavior can be proved independently.
3. `mud_road_tile_family_01`: build as a procedural tile/material experiment,
   not an `img2threejs` object.
4. `marsh_willow_tree_family_01`: build as an instanced botanical family with
   LOD and wind groups, not as one photoreal reconstruction.
5. `cloud_card_family_01` and `dust_and_mist_atlas_01`: build through the 2D
   asset lane and keep them out of the mesh reconstruction queue.
6. `marsh_depot_scene_kit_01`: compose only after the first reusable object and
   module gates are evidenced.

## Evidence boundary

The first isolated plate is Tier 1 reference evidence: it is visually
inspected and technically present in the repo. It is not Tier 2/3 reconstruction
or runtime evidence. The existing tractor blockout remains a useful historical
probe, but its recorded visual gate failures mean it cannot be promoted by
inheritance.

## Anything else?

Yes. This catalog is deliberately broad, but execution is staged: one hero rig,
one reusable rig part, one road/infrastructure tile, one vegetation family,
one 2D atlas, then a scene kit that composes them. That sequence tests the
asset system's leverage before multiplying unreviewed content.

## Addendum (2026-07-29) — candidate availability is not public promotion

The field-plough package exposed an overly restrictive interpretation of this
catalog: it treated visual polish, GLB packaging, runtime adapter integration,
and public approval as a single stop sign. The long-term asset system instead
keeps a candidate usable for open-world development while each evidence track
advances independently. The canonical status is now
`procedural-candidate; refinement-open`, with browser evidence recorded and
collision/public ownership kept explicit.
