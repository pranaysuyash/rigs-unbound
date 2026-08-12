# Worklog Addendum — 2026-08-11

## Rig blockouts: three-way dimensional drift, and the two frames that caused most of it

Scope: `src/game/rig-blockout.ts` (+ tests), `src/game/renderer.ts`,
`src/game/animation.ts` (+ tests), `src/game/camera.ts`, `src/main.ts`,
`tools/rig-ground-contact-acceptance.cjs`.

The task was "create rig blockouts based on the current designs." What the
first-principles version of that turned out to require was not new art but a
reconciliation: the three rigs' hand-authored models had drifted from
`RIG_PROFILES` in three independent ways, and every existing test agreed with
the drift.

### The three drifts

**1. Footprint.** Wheelbase, track width, and hull extents were literals in
`renderer.ts` that no longer matched the profile the simulation drives. A rig
whose drawn wheels are not where the kernel's contact points are will visibly
lean the wrong way on a slope, because the visual pivot and the physical pivot
are different rectangles.

**2. Wheel spin rate.** The kernel integrates **one** reference rotation from a
single mean rolling radius (`distance / wheelRadius`). The tractor's rear wheels
are drawn considerably larger than that mean, so at the reference rate they swept
more ground than the rig covered — a permanent low-grade skid on the rear axle.
Fix: a per-wheel `wheelSpinScale = wheelRadius / drawnRadius`, applied in
`applyWheels`. Rolling without slip is θ = distance/r, so scaling the single
reference rotation by the radius ratio is exactly right — no kernel change and
no new profile fields.

**3. Two vertical frames.** The big one. `RigState.y` means *body origin
elevation*: physics rests it at `meanContact + rideHeight` (`physics.ts:355`,
and `supportY + rideHeight` for hover at `:732`/`:951`), and `animation.ts:241`
assigns it straight to `root.position.y`. So **root-local y = 0 is the body
origin.** The models, however, were authored the way anyone sane authors a
vehicle — wheel bottoms and shadow at y ≈ 0, heights read as "metres above the
ground." Both frames are defensible. They differ by exactly `rideHeight`, and
nothing in the codebase named either of them.

Consequence: **every rig shipped floating**, by exactly its ride height — the
tractor 0.95 m, the buggy 0.62 m.

### The hover rig had its own third variant

The skimmer was authored around its body origin, but against an *assumed* ride
height of ~1.00 rather than the profile's 1.35. So it floated its shadow 0.63 m
and left its lift skirt 0.82 m above the ground against a 0.55 m cushion — a rig
whose entire visual premise is "it hovers by this much" was hovering by the
wrong much.

This is the argument for **one** authoring frame rather than for documenting
two. In the ground frame, "shadow on the ground" is `y ≈ 0` and "skirt reaches
the cushion" is `y = hoverClearance`. Neither expression mentions `rideHeight`,
so neither can be got wrong by forgetting it. The failure mode becomes
unrepresentable rather than merely discouraged. The skimmer was therefore
converted to the same ground frame as the other two: a `body` group at
`groundFrameOffsetY` holds all art, and the root keeps carrying the body origin
the kernel positions.

Confirming the diagnosis: the derived skirt (height 0.59075, centre 0.845375)
came out nearly identical to the authored 0.62 / −0.22 shifted by +1.07. The
author's internal proportions were self-consistent; only the frame was wrong.

### Derive, don't declare

A literal cannot disagree with itself, which is why literals were what drifted.
`rig-blockout.ts` now derives the whole silhouette from `RIG_PROFILES`, with the
art declaring only **proportions**:

- `RIG_SILHOUETTES` holds ratios (tractor axle scales 0.82 / 1.18, buggy and
  skimmer 1 / 1); the profile supplies scale. Retuning a profile now rescales
  the silhouette coherently instead of desynchronising it.
- Axle scales are **constrained to average 1** (`meanAxleScale`), which is what
  makes `profile.wheelRadius` genuinely the mean rolling radius rather than a
  number that happens to be near one.
- `hoverSkirt` and `shadowY` are derived, not authored. `GROUND_DECAL_LIFT`
  (0.04) is the one deliberate exception: a shadow decal must sit slightly off
  the plane to beat z-fighting, so that lift is named rather than sprinkled.
- The skirt's flare and aspect are ratios of derived hull extents.

Downstream frame dependency caught in the same pass: the skimmer's hood camera
socket at `localY: 2.75` would have ended up **inside the cabin** once the model
moved into the ground frame; it is now 3.82 (above the ground-frame roof at
2.9). `RIG_HOOD_CAMERA_MOUNTS.localY` is now documented as ground-frame, and
explicitly contrasted with `RigProfile.camera.focusHeight`, which is body-frame.
The three `focusHeight` values were checked and needed no change — 1.7 / 1.05 /
1.3 map to ground-frame 2.65 / 1.67 / 2.65, landing on cab, roll bar, and cabin
respectively.

### Why no unit test caught any of this, and what does

`rig-blockout.test.ts` (now 25 tests) proves the authored geometry agrees with
`RIG_PROFILES`, and it passed throughout the float. That is not a gap in the
test's rigour; it is a limit of its **inputs**. Authored numbers compared with
authored numbers agree with themselves. A model can be internally perfect and
still be mounted at the wrong height, because the defect lived in a
relationship — scene graph to terrain mesh — in which no authored constant
participates.

The two cues a player would have noticed it by were independently degraded,
which is why it survived review: ground-texture parallax was weak (fixed
2026-08-02 for unrelated reasons — see the audit follow-up), and blob shadows
had no crisp edge, so "shadow not touching the rig" read as "shadow is mushy."
Two soft failures masking a hard one.

So the check follows the pattern the repo already established with
`orientationEvidence`, which reads world transforms off *visible model parts*
rather than duplicating authored coordinates. New siblings:

- `RigGroundContactEvidence` + `GameRenderer.groundContactEvidence()` — measures
  world-space tyre extents (`Box3.setFromObject`), shadow position, and skirt
  edge against `world.terrain.height` beneath each.
- `window.getRigGroundContactEvidence()` on the acceptance bridge.
- `tools/rig-ground-contact-acceptance.cjs` (`npm run test:ground-contact`) —
  3 rigs × 3 terrain places, documented in `tools/README.md`.

Two implementation details worth keeping:

- `Box3.setFromObject` counts **invisible** children, so module tread blocks
  were inflating the contact measurement. The tyre mesh is now named `"tyre"`
  and measured specifically. A bounding box that silently includes hidden
  geometry is a good way to build a measurement that is wrong in the safe
  direction.
- `parts.wheelSpinScale[index] ?? 1` — a missing scale falls back to the
  reference rate rather than freezing the wheel. A missing entry is an authoring
  gap, and a stationary wheel on a moving rig reads as a far worse bug than a
  slightly fast one.

### Measured result

`npm run test:ground-contact`, against the canonical dev server, at three
terrain locations per rig, each after `advanceTime(600)` so the suspension has
settled:

| rig             | tyre gaps (m)   | shadow gap (m) | skirt gap (m) |
| --------------- | --------------- | -------------- | ------------- |
| utility-tractor | −0.033 … +0.020 | 0.028 – 0.045  | n/a           |
| toy-buggy       | −0.023 … −0.022 | 0.031 – 0.040  | n/a           |
| marsh-skimmer   | n/a             | 0.040          | 0.538 – 0.547 |

`bodyOriginY - terrainY` equals `rideHeight` to three decimals at every skimmer
sample (3.108−1.758, 2.401−1.051, 2.446−1.096 = 1.350), skirt gaps sit on the
0.55 m cushion, shadow gaps sit on the deliberate 0.04 `GROUND_DECAL_LIFT`, and
`contactsGround` is true at all nine samples. Slightly negative tyre gaps are
compression, which is the correct sign for a loaded suspension.

Suite: typecheck clean; vitest 90 files / 585 tests plus 7 kernel-probe
assertions; `test:ground-contact` and `test:weather-scene` both green;
`npm run verify:head` **EXIT 0** (format:check → typecheck → test → asset,
slice-binding, and reachability audits → build).

### A formatting entanglement the operator needs to know about

`format:check` failed on `src/game/renderer.ts` and
`src/game/rig-blockout.test.ts` before `verify:head` would pass. Both are now
formatted, but they are not equivalent cases:

- `rig-blockout.test.ts` was already clean at HEAD, so its reformat is entirely
  this session's.
- **`renderer.ts` was already unformatted at HEAD.** The 2026-08-06 tree-wide
  sweep rewrote it but was never committed — that entry explicitly left
  committing as the operator's call — so its reformat now carries pre-existing
  backlog changes mixed with this session's rig work. This is precisely the
  "9 files already entangled with in-flight parallel work" hazard that entry
  named, arriving as predicted.

Verified rather than assumed, via `git show HEAD:<path> | prettier --check
--stdin-filepath <path>` (read-only). Anyone splitting formatting-only from
feature commits cannot do it mechanically for `renderer.ts`.

### Also closed in this pass

`tools/weather-scene-browser-acceptance.cjs` had no `tools/README.md` entry and
no npm script since it was written. Both added (`npm run test:weather-scene`),
and the tool re-run to confirm it still passes before being documented as
working. Its own design note is worth repeating: it asserts
`fogDensity > phaseBaseFogDensity` rather than `fogDensity === expected`, so a
phase-table lookup alone cannot satisfy the check — the same tautology-avoidance
that the ground-contact tool needed.

### img2threejs for rigs: the binding, and why the plate cannot be a rig yet

The forge pipeline works end-to-end for `field-plough-01`
(`assets:derive-field-plough` → `build` → `tier1` → `review` →
`export-…-glb`, against
`/Users/pranay/Projects/external-skills/img2threejs__img2threejs/forge/`). The
question this session actually had to answer was not "does it work" but "what
does it mean to point it at a rig", and the honest answer turned out to be a
constraint rather than a green light.

A plough and a rig are not the same kind of object, and the difference is exactly
the one above. `field-plough-01.asset.json` declares its root as
`{width: 3.8, height: 1.8, depth: 1.35, confidence: 0.3}` — honest and harmless,
because nothing in `physics.ts` reads a plough's width. A rig's `track` and
`wheelbase` place the four points where terrain is sampled; `wheelRadius`
converts distance into rotation; `rideHeight` is where the kernel rests the body.
Estimating those from a photograph is structurally the same act as hand-writing
them as literals in `renderer.ts`, which is the drift this whole addendum is
about. So for rigs the pipeline inverts at the dimensional layer: **the plate
supplies form, `RIG_PROFILES` supplies dimensions.**

That is now machine-checkable rather than a review instruction:

- `src/game/rig-blockout.ts` already derives the ground-frame silhouette from the
  profile, so `tools/rig-asset-envelope.ts` derives a rig's dimensional envelope
  from `blockoutFor()` — root extent, hull, one node per wheel mount, hover skirt,
  contact decal — in the **ground frame**, each node carrying the derivation a
  reviewer can check by hand, plus an explicit `authorable` list so "not derived"
  is distinguishable from "forgotten". `compareEnvelope()` reports drift between
  a candidate spec and the derivation.
- `tools/derive-rig-asset-envelope.ts` (`npm run assets:rig-envelope`) emits it
  and audits a candidate `.asset.json`. Exit 1 on drift, so it can gate a step.
- 33 unit tests in `tools/rig-asset-envelope.test.ts`, inside `npm run test`,
  so the tool is a thin CLI over tested logic rather than a second implementation.

**It was first written under `src/game/`, and the repo's own audit rejected it.**
Worth recording, because the reason I put it there was bad and the reason it was
rejected is good. `vitest.config.ts` collected only `src/**/*.test.ts`, so
`src/game/` was the cheap way to get the logic inside `npm run test` — a
test-runner convenience deciding an architectural question.
`npm run audit:slice-bindings` failed immediately: *"src/game/rig-asset-envelope.ts
is unreachable but appears in no disposition group."*

Neither escape hatch was honest. `QUARANTINED` means "an accepted decision forbids
this from the runtime" — no decision forbids this, it simply is not runtime code.
The design doc's *archived* group means "not used, with a named future home" — it
is used, today. The audit was not being pedantic; it was reporting that
`audit-runtime-reachability.mjs` scans all of `src/` and closes with "a module
with tests but no entry path is tested behaviour the player cannot reach." That
sentence is true of gameplay and false of an authoring-time contract checker, so
the module was diluting a budget whose entire job is to pressure *unwired
gameplay* — and at 452 lines it had become the largest entry in that list, above
real rig systems like `winch-physics.ts`.

The stronger argument is about import direction. **The directory encodes which way
dependencies are allowed to point.** Tools may depend on the runtime; the runtime
must never depend on a tool. In `src/game/`, nothing stopped a future gameplay
module from importing the envelope and shipping authoring-time code to players; in
`tools/`, that import is an upward dependency a reviewer spots on sight. So the
module and its test moved to `tools/`, and `vitest.config.ts` was widened to
`["src/**/*.test.ts", "tools/**/*.test.ts"]` — which is the change that should
have been made first. The split is unambiguous because it falls on the extension:
the existing tool tests run under `node:test` and are `.test.mjs`, which that glob
cannot match, so nothing is collected twice. Precedent already existed —
`tools/heatmap-from-ghost-trail.ts` imports from `../src/game/`.

**And one more thing fell out of it.** `tsconfig.json` included
`["src", "worker", …]` but not `tools`, so every TypeScript tool in the repo has
been shipping **untypechecked** since the first one was written. Adding `"tools"`
(safe: `allowJs` is off, so the `.mjs`/`.cjs` tools are not pulled in) surfaced a
real defect in `tools/heatmap-from-ghost-trail.ts` on the first run — an
unchecked `grid[i] += 1` under `noUncheckedIndexedAccess`. Fixed as
`grid[cell] = (grid[cell] ?? 0) + 1` rather than with a `!`, and this is the
interesting part: `!` would have evaluated `undefined + 1` to `NaN`, which then
propagates through `maxCount` and blanks every cell. The heatmap would still
render — uniformly empty. A wrong answer that still looks like a heatmap is worse
than a missing one, which is the same preference the rest of this addendum keeps
arriving at.

Four design choices in it are worth recording, because each encodes a lesson from
this session rather than a preference:

1. **Signed comparison.** A magnitude check would pass a model with its left and
   right wheels swapped — and a reconstruction from a three-quarter plate has to
   infer the hidden side, so mirroring it is the obvious way to get it wrong.
2. **A missing dimension is drift, not agreement.** Otherwise a spec that simply
   declined to state a radius would pass.
3. **A uniform offset is reported as one cause, not N.** If every position drift
   is the same offset on the same axis, the tool leads with that and names
   `rideHeight` when it matches. This is the diagnostic lesson of the float
   promoted into code: presented as "seven nodes are at the wrong height", a
   reviewer edits seven numbers and the frame stays broken. It requires three
   agreeing nodes and refuses when any dimension drift is also present, so a
   coincidence cannot be dressed up as a systemic cause.
4. **No component scaffolding.** Emitting `role: "TODO"`,
   `materials: ["placeholder"]` and friends would make a spec pass
   `npm run test:assets` before anyone authored it. A green check that is evidence
   of nothing is worse than no spec.

Verified against fixtures covering all four CLI paths: a clean spec passes; three
independent defects report as three; a spec authored in the body frame reports
every node low by exactly −0.9500 and is correctly diagnosed as one `rideHeight`
frame error; a `rig` spec with no `runtime.adapter.rigId` exits 2 rather than
guessing a profile from `assetId`.

**And the blocker this surfaced.** The only rig-scale plate in the repo is
`assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.png`, and
there is no `utility-tow-recovery` in `RIG_IDS` — the shipped rigs are
`utility-tractor`, `toy-buggy`, `marsh-skimmer`. So `--check` has nothing to bind
it to, and promoting it to `assetFamily: "rig"` would mean inventing a fourth
playable rig: physics tuning, unlock placement, save migration. That is a design
decision, not an art gate, and it is the operator's.

The repo's own sequencing already points elsewhere in the meantime.
`docs/plans/MASTER_EXECUTION_TRACKER.md:2966`: *"once this module passes, the same
contract can be reused for the tow boom, winch, stabilizer, wheel, and beacon
modules before the full utility tow rig is attempted."* Those are `rig-part`
family — no dimensional contract — they are extractable from this same plate,
which separates boom hinge, winch spool and cable, drawers, tow eyes, and beacon
clearly, and `winch` is already a real module (`src/game/first-rung.ts:21`) with a
live `requiredCapability: "tow"` seam. A `winch` part has somewhere to land; a
whole recovery truck does not. Recorded in
`assets/workbench/utility-tow-recovery-01/README.md` as well, since that is where
someone picks the work up.

### A bug this pass introduced and caught, worth recording for the method

`rootExtent()` initially computed depth as `|mount.z| + radius * 2` — a
half-wheelbase plus a diameter — where width was correctly
`|mount.x| * 2 + width`. The tractor's root therefore claimed 4.588 m of depth
while its rear tyres reached 2.40 m from centre, i.e. 4.80 m across.

The interesting part is why the test suite did not catch it. The containment test
compared the root's **full** width against a wheel's **distance from centre**,
which almost anything satisfies, and never checked depth at all. A containment
check that cannot fail is not a containment check — the same shape of defect as
the tautological geometry tests described above, arriving in brand-new code
written by someone who had just finished documenting the hazard. It now compares
half-extent against half-extent on both axes, and depth is
`|mount.z| * 2 + radius * 2`.

### Still open

- **A rig `.asset.json` has never been authored**, for the reason above. The
  envelope's `--check` path is verified against fixtures, not against a committed
  spec, and the ground-frame origin check is a keyword heuristic — a *pass* there
  is the reviewer's judgment, not the tool's evidence.
- Any imported GLB must clear `tools/inspect-glb-provenance.mjs` before manifest
  registration, and an imported rig mesh must be authored in the **ground frame**
  and mounted under the `body` group, or it re-introduces the float.
- Nothing in this addendum is committed. No git write actions were taken.

### Measured, after the move

- `npm run verify:head` **EXIT 0** (format:check → typecheck → test → asset,
  slice-binding, and reachability audits → build).
- vitest **91 files / 618 tests**, up from 90 / 585: the +1 file and +33 tests are
  `tools/rig-asset-envelope.test.ts`, now collected from `tools/`.
- `npm run audit:reachability`: **12 unreachable modules / 974 lines**, down from
  13 / 1426. The 452 lines removed are the envelope module leaving `src/`, which
  is the audit's objection resolved rather than suppressed — no `QUARANTINED`
  entry and no disposition-table row was added.
- `npm run audit:slice-bindings`: "No contradictions. Every disposition agrees
  with the import graph."
- `tsc --noEmit` now covers 5 files under `tools/` — including
  `tools/replay-record-inspect.ts`, a third TypeScript tool that had also never
  been typechecked and passes clean.
- `npm run assets:rig-envelope -- utility-tractor` unchanged after the move:
  root `width=3.3816 depth=4.7992 heightAtLeast=1.3015`, hull centred at
  y = 0.9500 = `rideHeight`, front wheels at y = 0.5904 = their own radius, rear
  at 0.8496, decal at 0.0400 = `GROUND_DECAL_LIFT`.
