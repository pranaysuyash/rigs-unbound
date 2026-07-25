# Patchwork Tractor Reconstruction Plan

Status: **design proposal; no procedural code generated**

This plan converts the admitted isolated reference into an implementation-ready discussion artifact for the `img2threejs` staged build. It is intentionally separate from the runtime renderer and does not claim that generated pixels are physically accurate.

## Delivery contract

- Consumer: browser/WebGL Three.js runtime.
- First output: deterministic procedural TypeScript factory with named `Object3D` pivots; later GLB export remains optional.
- Intended role: playable static vehicle body with modular attachment points, wheel animation hooks, front tool socket, rear cargo socket, and simplified collider proxies.
- Baseline: stylized low/mid-poly silhouette with material richness carried by independent PBR channels and procedural local overrides.
- Scale: provisional vehicle length `4.2 m`, width `2.1 m`, height `2.4 m`; confirm against the project vehicle/world scale before runtime integration.
- Review views: front three-quarter, rear three-quarter, side, and elevated front; the current source directly proves only front three-quarter.
- Approval: concept/reference only until owner review, multi-angle consistency, and generated-reference terms are accepted.

## Component hierarchy

### Macro

1. `root` — vehicle origin, bounds, global action metadata.
2. `chassis-system` — frame, axle line, wheelbase, underside collider.
3. `body-and-attachments` — cab, hood, fenders, tool/cargo sockets, lights, exhaust.

### Meso

- `hood-shell` — front engine block, grille recess, headlamp mounts.
- `cab-shell` — roof, windshield, side windows, frame posts, interior blockout.
- `rear-bed` — rear cargo/tool platform and patchwork side panels.
- `wheel-system` — four wheel pivots, tire volumes, hubs, tread repetition.
- `front-hitch` — twin mounting plates, central coupling, tool socket.
- `rear-hitch` — rear coupling and attachment socket.
- `exhaust-stack` — pipe, muffler, curved outlet, heat-darkened finish.
- `lighting-system` — headlights, amber beacon, rear lamps, emissive hooks.

## Identity-defining detail inventory

Each detail must map to a real `component.localFeatures` or `material.localOverrides` field in the eventual spec:

| ID | Kind | Observed feature | Proposed mapping |
| --- | --- | --- | --- |
| `cab-roof-bevels` | bevel | Thick chamfered roof plates catch the upper key light | `cab-shell/roof-edge-bevel` |
| `patchwork-panel-seams` | seam | Irregular cream, rust, and green replacement panels meet with dark seams | `painted-metal/panel-seam-darkening` |
| `panel-fastener-rows` | fastener | Repeated rivets/bolts track hood, cab, and fender boundaries | `wheel-system/fastener-instancing` |
| `rust-and-dirt-patina` | stain | Brown oxidation and grime collect in panel recesses and lower chassis | `painted-metal/patina-cavity-mask` |
| `scraped-edge-wear` | scratch | Bright worn edges expose high-use corners and attachment hardware | `painted-metal/edge-wear-mask` |
| `front-grille-slats` | linework | Dark horizontal grille bars define the front face | `hood-shell/grille-slats` |
| `headlight-lenses` | emissive | Two circular warm lamps read as primary face/interaction cues | `lighting-system/headlight-emissive` |
| `amber-beacon` | emissive | Raised amber beacon crowns the cab and signals vehicle identity | `lighting-system/beacon-emissive` |
| `tread-and-hub-repeat` | ridge | Chunky tire lugs and concentric hubs repeat around four wheels | `wheel-system/tread-and-hub-instancing` |
| `hitch-and-socket-hardware` | hole | Front coupling holes and plates communicate modular tool attachment | `front-hitch/tool-socket` |

The image contains enough evidence for these ten mappings, but not enough to infer hidden-side geometry, exact dimensions, or mechanically correct attachment internals.

## Material plan

- `painted-metal`: base color zones from `#593F2B`, `#89664B`, `#C1A17F`, rust-dark `#322417`, and shadow-dark `#130D07`; roughness base approximately `0.717` with visible variation; independent AO, height, normal, and wear masks.
- `rubber`: low-saturation dark tire material with meso tread geometry and micro roughness variation; do not model every tread lug as a unique mesh.
- `glass`: dark transparent cab glazing with conservative opacity/reflection treatment; validate against the browser renderer rather than assuming DCC glass behavior.
- `emissive-lamp`: warm headlight and amber beacon materials with optional matching point-light hooks; emissive color is not a substitute for lighting.
- `aged-metal-hardware`: darker low-roughness hubs, hinges, exhaust, and hitch parts with localized oxidation.

Reference-derived PBR evidence is stored under `pbr-base/`:

- confidence `0.86`, target `0.7`;
- palette `#593F2B`, `#322417`, `#130D07`, `#89664B`, `#C1A17F`;
- roughness base `0.717`, variation `0.143`;
- normal strength `0.238`;
- single-image limitation remains active.

## Action readiness

Required sockets/pivots before code generation:

- `front-tool-socket` at the front hitch center;
- `rear-tool-socket` at the rear coupling;
- `left-front-wheel`, `right-front-wheel`, `left-rear-wheel`, `right-rear-wheel` at wheel axle pivots;
- `cab-beacon` at the beacon base;
- `cargo-platform` across the rear bed;
- `root` at the chassis centerline and ground contact plane.

Collider plan: chassis box plus four wheel capsules/cylinders and a simple front-tool proxy. Do not use the visual mesh as the gameplay collider by default.

## Review gates before implementation

1. Confirm the owner accepts the isolated generated image as a reconstruction reference.
2. Add a rear/side or orthographic reference, or explicitly accept the single-view approximation.
3. Populate the strict `ObjectSculptSpec` with this hierarchy and detail mapping.
4. Generate only the locked `blockout` pass.
5. Capture the browser render and comparison sheet from the same three-quarter camera.
6. Continue only if silhouette/proportion reaches the critical threshold; otherwise refine the spec before adding detail.

The next implementation should be the blockout factory only. Material polish, sockets, and runtime registration should follow after the first browser comparison rather than being bundled into an unverified one-shot mesh.
