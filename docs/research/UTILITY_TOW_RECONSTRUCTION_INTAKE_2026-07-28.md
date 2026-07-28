# Utility Tow Reconstruction Intake — 2026-07-28

Status: reference package assembled; `img2threejs` reconstruction not run
Stable candidate ID: `utility_tow_recovery_01`
Family: `utility_tow`
Related: [Vehicle Family Atlas and Canonical Spec](../exploration/VEHICLE_FAMILY_ATLAS_AND_CANONICAL_SPEC_2026-07-28.md), [Asset Pipeline and Provenance Contract](ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)

## Intake artifacts

| Artifact                                               | Role                                                     | Status                                              |
| ------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------- |
| `utility-tow-recovery-candidate-01-2026-07-28.png`     | identity and silhouette anchor                           | admitted single view; concept only                  |
| `utility-tow-reconstruction-turnaround-2026-07-28.png` | front-left, side, rear-left, and top reference sheet     | visual turnaround aid; not exact orthographic proof |
| `utility-tow-mode-diff-board-2026-07-28.png`           | farming/racing/construction/survival/absurd meaning diff | mode design evidence; not geometry input            |

All files live under
`docs/exploration/assets/vehicle-family-atlas-2026-07-28/` and are registered
in `docs/research/ASSET_PROVENANCE_REGISTER.md`.

The proposed structured record is
[`object-sculpt-spec-proposed.json`](assets/utility-tow-intake-2026-07-28/object-sculpt-spec-proposed.json).
It is intentionally marked `proposal-not-strict-quality-validated`; it is a
data-layer hypothesis and cannot generate runtime code yet.

## What the package establishes

- Persistent identity: teal/cream cab, orange recovery boom, twin front tow
  eyes, rear winch, side tool drawers, amber beacon, two-axle stance.
- Macro components: chassis, cab, hood/grille, front bumper/hitch, rear bed,
  recovery boom, winch spool, four wheels, beacon, service drawers.
- Functional verbs: tow, recover, carry, inspect, stabilize, and provide light.
- Proposed sockets: `front-tool-socket`, `rear-winch`, `boom-pivot`,
  `cargo-platform`, `beacon`, `left-front-wheel`, `right-front-wheel`,
  `left-rear-wheel`, `right-rear-wheel`, `root`.
- Proposed material families: painted metal, aged hardware, rubber, glass,
  emissive lamp, cable/rope.

## What remains unknown

The generated turnaround is useful evidence but does not prove exact geometry.
The following remain unverified and must not be silently invented as facts:

- real length, width, height, wheelbase, track width, ground clearance, and
  mass;
- exact rear, underside, and hidden-side geometry;
- true orthographic consistency between views;
- wheel pivot locations and steering limits;
- boom joint limits, winch cable path, stabilizer deployment, and load limits;
- material IDs, UV layout, texture resolution, and collision decomposition;
- animation hierarchy, origin conventions, and LOD budgets.

Provisional scale for discussion only: length `5.6 m`, width `2.2 m`, height
`2.7 m`. This is an authored hypothesis based on the family envelope, not an
image measurement or runtime contract.

## `img2threejs` admission gate

The candidate may proceed to reconstruction analysis only after:

1. the owner accepts the identity and the generated-reference terms;
2. the views are either replaced with authored orthographic views or explicitly
   marked as a single/multi-view approximation;
3. the proposed scale is confirmed or revised;
4. each socket and pivot receives a coordinate frame and confidence level;
5. the object class, component hierarchy, and ten identity-defining details
   are authored in a strict spec;
6. the first blockout is evaluated against silhouette and proportion evidence;
7. the result is kept outside the runtime manifest until topology, collision,
   materials, animation, and browser budget gates pass.

The current proposed record makes the missing decisions explicit; it does not
claim strict-quality validation or production readiness.

## Mode continuity review

The mode board succeeds as a design test because the rig’s role changes:

- farming: tow and provision land work;
- racing: carry ballast and optimize route handling;
- construction: deploy stabilizers and lift structural mass;
- survival: spend fuel and light coverage to protect a route or shelter;
- absurd discovery: transport an impossible object and reveal a new place.

The board is not continuity proof. Several panels alter attachments and camera
scale for readability, so it must not be used to infer production geometry.

## Rejection and recovery fixtures to generate next

- boom folded versus deployed with the same pivot origin;
- winch cable slack, taut, detached, and overloaded;
- cargo platform empty, balanced, overloaded, and damaged;
- one headlight disabled in darkness;
- front wheel bogged in mud while rear wheels retain traction;
- side drawer open without changing the chassis silhouette;
- damaged bumper and missing beacon while identity remains readable.

These fixtures test recovery and readability, not just hero-shot appeal.

## Anything else?

Yes. The multi-view image is a generated proposal, not a magic orthographic
turnaround. The correct long-term move is to use it to author a stricter,
measured spec and then let the mesh candidate compete against the spec. If the
mesh wins only by matching pixels while violating sockets, scale, or gameplay
verbs, it must be rejected.

## Update log

### 2026-07-28 — package assembled

- Added a four-view visual turnaround, a five-mode same-vehicle board, and a
  grounded snow-crawler candidate.
- Kept all outputs in project-owned exploration paths and below runtime
  manifest admission.
- Manual visual review passed for silhouette and role coverage; exact geometry,
  scale, and orthographic consistency remain open.
