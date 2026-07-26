# Rig direction and landmark collision acceptance

- Date: 2026-07-26
- Runtime: `http://127.0.0.1:4173/?acceptance=field-02`
- Trigger: browser comment reporting that the tractor faced the player while
  moving
- Risk class: medium gameplay-control and spatial-readability correction
- Status: accepted locally; uncommitted

## User-visible result

The tractor now turns in the direction named by the input contract, its
physical-wheel adapters use the same convention, and the chase camera proves it
is on the rear side of the active rig. Top-down and the other five selectable
views remain available.

At Launch Ridge, the rocket is now part of canonical authored-world collision
truth. A rig placed inside the rocket is pushed outside its footprint, while
the chase camera chooses a clear rear-side composition instead of collapsing
inside the cab or structure.

The browser screenshot that triggered this review showed the retained Field
Test 001 surface. The current source and live acceptance surface are Field 02,
so the review treated the screenshot as symptom evidence and verified behavior
against the current runtime rather than assuming the older frame represented
the current build.

## Root cause

Rigs Unbound uses local `+Z` as a rig's visual and simulated front. In Three.js,
positive yaw from that direction turns toward world `+X`, which is the rig's
right when heading is zero. The semantic input model used positive steering for
the player's left, but ground, hover, Rapier, and Box3D heading application all
treated positive steering as positive yaw. The visual steering response then
inherited the same ambiguity.

The Launch Ridge rocket had a separate source-of-truth defect: it existed only
as renderer-owned geometry. Gameplay collision and camera queries therefore
could not know that the visible rocket occupied space.

The camera query already handled ordinary structures, terrain, and procedural
obstacles, but a close obstruction could leave a mathematically clear boom with
too little physical room around the rig. That allowed a valid query result to
remain visually inside the machine.

## Accepted contracts

### Direction

- Local `+Z` is visual and simulated forward.
- Positive semantic steering means the player's left.
- Ground and hover motion convert positive-left steering to negative yaw.
- Rapier and Box3D convert the same semantic value at their adapter boundary.
- Wheel meshes and camera anticipation translate that semantic sign to their
  Three.js presentation transforms without redefining it.

### Camera

- Chase-camera acceptance includes signed displacement along the rig's forward
  vector.
- A chase pose is rear-side only when `forwardOffset < 0`; distance alone is
  insufficient evidence.
- The final rendered pose must be path-clear and outside a profile-scaled rig
  clearance envelope.
- If an obstruction leaves too little room, the shared policy tries a clear,
  elevated rear shoulder.
- Hood view is intentionally forward of the rig origin and is not evaluated as
  a rear-side camera.

### Authored collision

- Structure dimensions and transforms live in `WORLD_STRUCTURE_PARTS`.
- Rendering, camera obstruction, and rig collision read the same structure
  records.
- `rigCollider` and `cameraOccluder` are separate semantic flags; visible parts
  do not become blocking merely because they are rendered.
- Structure collision stays solver-independent, so later physics adapters do
  not become the authored-world source of truth.

## Acceptance evidence

### Tier 2 — deterministic and adapter tests

- The tractor, buggy, and skimmer all decrease heading under left input.
- Rapier and Box3D positive semantic-left runs finish on world `-X`.
- A tractor placed inside the Launch Ridge rocket is pushed beyond the combined
  rocket/rig footprint.
- Focused result before the full suite: 83/83 tests passed across state,
  scene-query, feedback, Rapier, and Box3D files.
- Full result: 13 Vitest files and 138 tests passed; the deterministic kernel
  probe passed 7/7 tests.

### Tier 3 — production and physics-lab integration

- `npm run build` passed TypeScript checks for the main project and deterministic
  kernel probe, then built both Vite environments.
- `npm run test:physics-lab` passed with six camera modes and a clean console.
- `npm run test:box3d-lab` passed with negative steered heading, six camera
  modes, and a clean console.
- Asset preflight passed with four manifest entries and zero findings; its five
  tests passed.

### Tier 4 — live browser behavior

`npm run test:browser` passed on Field 02 with:

- live left input producing a negative heading delta and leftward displacement;
- visual-front evidence positive for all three rigs;
- spawn chase camera `forwardOffset = -4.642`, `behindRig = true`,
  `pathClear = true`, and no self-intersection;
- Launch Ridge push-out distance `3.051 m`;
- Launch Ridge chase camera `forwardOffset = -1.5`, rear-side, path-clear, and
  non-intersecting;
- direct selection of Chase, Hood, Side, Tactical, Top-down, and Survey;
- relay, ramp, save/restore, desktop, and narrow-layout acceptance;
- no browser console warnings or errors.

The refreshed visual artifacts are:

- `docs/reviews/assets/field-02-front-forward.png`
- `docs/reviews/assets/field-02-top-down.png`

Manual inspection confirms that the front of the tractor points away from the
rear chase camera and that the top-down view preserves the same front/rear
reading.

## Acceptance script correction

After collision became truthful, the acceptance script's simplistic
point-to-point driver repeatedly met a deterministic obstacle while approaching
the cargo. That driver is not a product navigation feature and has no avoidance
contract. The test now starts the relay approach on a short aligned path, just
as the delivery proof already did. Collision was not weakened or bypassed.

The browser suite also gained a direct signed-motion assertion, so it no longer
passes merely because front wheels animate.

## Three-pass review

### Pass 1 — immediate correctness and completeness

Checked simulation heading, visual front markers, wheel response, camera side,
Launch Ridge overlap, all view selections, and the current browser surface.
Added signed deterministic, adapter, structure, and browser assertions. No
input inversion or front/back mismatch remains in the tested paths.

### Pass 2 — architecture and long-term viability

Kept one semantic steering contract and translated only at coordinate-system
boundaries. Promoted the rocket from renderer-only geometry to authored world
data read by rendering and collision. Extended the existing camera policy and
query instead of adding tractor-specific branches. No vehicle-name checks or
parallel collision pipeline were introduced.

### Pass 3 — rule compliance and supervision readiness

Ran targeted tests, full tests, both physics browser labs, full Field 02 browser
acceptance, TypeScript/build, formatter, asset validation, and whitespace
checks. Updated the camera ADR, collision research contract, worklog, and this
review. Existing asset-bridge and other parallel work remained in place; no
commit, push, branch, cleanup, or deletion was performed.

## Remaining gaps and hardening path

- The production build reports the existing large-chunk advisory for Three.js
  and physics WASM. It does not block this correction; the closure path is the
  existing measured code-splitting/performance lane, not a steering-specific
  rewrite.
- The structure solver currently uses circular rig footprints and simple
  box/cylinder ground proxies. Articulated trailers or unusually long rigs
  should add bounded compound footprints while preserving the same authored
  structure records.
- The browser comment's exact retained Field Test 001 process was not the
  current server surface. Current behavior is Tier 4 verified on Field 02; any
  separately retained old build should be refreshed to consume the current
  source rather than patched independently.

## Value delivered

- User value: steering names now match motion, the tractor reads front-forward
  from chase and top-down views, and the Launch Ridge camera remains usable.
- Product/team value: all current rigs and both physical-wheel experiments share
  one direction contract, preventing a tractor-only fix from drifting later
  vehicles.
- Internal/operational value: signed camera evidence, canonical structure
  collision, and browser assertions make the defect reproducible and
  regression-resistant.

## Anything else?

Yes. Direction is a product-wide spatial contract, not a tractor tuning value.
Future bicycles, boats, aircraft, spacecraft, imported GLBs, and controller
adapters must declare how their native axes map to semantic forward and
semantic left at one bounded boundary. Camera acceptance should keep checking
signed side as well as distance, because a camera can be clear and still be on
the wrong side of the vehicle.
