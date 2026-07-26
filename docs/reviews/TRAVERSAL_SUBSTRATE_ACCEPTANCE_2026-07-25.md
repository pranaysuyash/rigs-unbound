# Traversal substrate acceptance review — 2026-07-25

Scope: the terrain-as-substrate pass recorded in
[ADR-0007](../decisions/ADR-0007-terrain-as-simulation-substrate.md) and planned in
[the open-world traversal plan](../plans/OPEN_WORLD_TRAVERSAL_2026-07-25.md).

This review records **what was verified, what was found broken, and what is still
unproven**. It deliberately does not restate the plan.

> **Two authors, and the worktree is mid-refactor.** A parallel agent extended
> this work during the session with a six-mode camera vocabulary (`chase`, `hood`,
> `side`, `tactical`, `top-down`, `survey`), and is now adding a third rig,
> `marsh-skimmer`. Their work was preserved intact; the only thing changed on their
> behalf was a stale hardcoded camera assertion in this pass's own test, which
> became table-driven.
>
> **State at the time of writing:** the tree does **not** typecheck and 30 of 75
> tests fail, because that third rig is partially applied — `"marsh-skimmer"` is in
> the `RigId` union while its profile, voice, and state construction are not yet
> written, and `wheels` / `wheelRotation` are being lifted off `RigState` (sensible:
> a skimmer has no wheels, so this generalises along the mobility-adapter boundary
> ADR-0006 anticipated). This is a transient in-flight state belonging to that
> refactor, not a regression in the work reviewed here.
>
> Everything recorded below as verified was verified against the immediately
> preceding clean run: **75/75 tests, clean `tsc --noEmit`, passing production
> build**. Re-run the suite once the skimmer refactor lands before treating any of
> it as current.

## The disputed question this pass answered

> Does making the ground a simulated system turn two tabulated vehicle profiles
> into two machines that behave differently?

**Answer: yes, measurably — and it exposed that the previous answer was partly a
lie.** Before this pass, `low-range gearing` promised "climbs grades that used to
stall the engine" and changed no climb whatsoever, because both rigs were
traction-limited at a standstill and raising engine power did nothing.

## Verified

### Tier 2 — automated

- `npm run typecheck`: clean.
- `npm test`: **75 root tests** (was 14) plus 7 preserved kernel-probe tests.
- `npm run build`: passes at 617.70 kB raw / 162.84 kB gzip.

Invariants that are now _asserted_ rather than trusted:

| Invariant                                            | Why it needs a test                                     |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Every site holds its anchor within 1.2 m             | Noise leaking into a pad buries a landmark              |
| Every route grade-limited below 0.17                 | This is the reachability guarantee for the weakest rig  |
| Launch Ridge is the _only_ unrouted site             | Catches an accidentally unreachable landmark            |
| Terrain is continuous under step refinement          | Catches a jump discontinuity while allowing real cliffs |
| Spawn is flat and dry                                | The player must not begin in a cliff or a lake          |
| Firm ground favours slicks, soft ground favours lugs | This _is_ the rig identity claim                        |
| Determinism under an identical input sequence        | `applyRigInput` and the test suite both depend on it    |
| Malformed spatial memory drops per entry             | One bad number must not cost a session's ploughing      |

### Tier 4 — observed in a browser

Runtime grip, read through `render_game_to_text` after the `placeRig` telemetry
fix below:

| Surface                | Torque (lugs) | Spark (slicks) |
| ---------------------- | ------------- | -------------- |
| hardpan track          | 0.98          | **1.16**       |
| bare rock              | 0.958         | **1.118**      |
| marsh / standing water | **0.51**      | 0.27           |

Driving from pasture into the Sunken Flats dropped grip **73% → 53%** and speed
**33 → 10 km/h** on screen. The limit the player meets is the ground, not a number.

Also observed: terrain/biomes/water/instanced props render; ploughing produced 37
furrows and **113 deformed terrain cells** with the mesh following the cut; module
install, repair, and winch recovery each refuse with a reason (cost, place, or
missing part); the field map reveals only surveyed ground and reported 20%.

### Performance

| Measurement                 | Before    | After                             |
| --------------------------- | --------- | --------------------------------- |
| Terrain mesh build          | 445 ms    | **174 ms**                        |
| Field map build during boot | 419 ms    | **0 ms** (deferred to first open) |
| Furrow draw calls           | up to 640 | **1** (instanced)                 |
| First controllable frame    | 3,946 ms  | **458 ms**                        |

From the parallel agent's visible-Chrome run on the same build: 21.89 ms average
frame, 20.7 ms p95, 68 draw calls, 100,822 triangles, 30.6 MB heap — roughly
46 fps in a development build.

**Honest caveat on frame rate.** Frame timing measured inside the _automation_
browser is worthless: a single `requestAnimationFrame` gap of 10,298 ms was
observed, i.e. hard background throttling, and it reported 12 fps for a build
whose per-frame CPU cost measured **0.46 ms** for step + render + HUD combined.
The 46 fps figure above comes from a visible window and is a machine snapshot on an
M3 Max, not a target and not a device claim.

## Defects found and fixed

Ordered by how badly each would have misled a player or a reviewer.

1. **Both rigs were modelled backwards.** The tractor's grille, hood, and
   headlights sat at local −Z — the same end as the plough — while travel is toward
   +Z. It drove cab-first with its lights pointing behind it. Present in the
   _accepted_ Rig Lab 01 evidence and not caught by any test, because no test
   asserted anything about which way a rig faces.
2. **A module's advertised promise was false.** `low-range gearing` claimed to
   climb grades that stall the engine and did nothing, because traction bound
   before power did. Fixed by adding `lowSpeedTorque`: a tractor makes full pulling
   force from rest, a speed-geared buggy bogs and needs a run-up. Now the promise
   is true and is covered by a test.
3. **Route endpoints detached from their pads.** The grade limiter overwrote its
   own pinned endpoints, benching the Quarry track to 3.7 m against a 15.5 m pad —
   an 11 m cliff at the corridor edge, and the cause of a 4.68 slope reading.
4. **A dark wall around the horizon in daylight.** `scene.background` as a colour
   is written by a buffer clear and skips tone mapping and the sRGB encode; fogged
   geometry does not. Two pipelines, two answers, one visible band. The sky is now
   tone-mapped geometry, so the horizon and the sky agree by construction.
   _(First hypothesis — mismatched fog colour — was wrong and is recorded as wrong.)_
5. **The buggy out-gripped the tractor on tilled soil**, contradicting the field
   being the tractor's home ground. The lug/slick crossover sits near surface grip
   0.55; tilled was authored at 0.68. Now 0.52, and the whole table is locked by a
   test so this cannot silently invert again.
6. **`placeRig` reported the wrong location.** The test hook teleported without
   stepping, so telemetry still described the _previous_ ground — which produced a
   false "both surfaces are mud" reading and nearly became a wrong conclusion in
   this very review. It now runs one idle step.
7. **Four wasted `height()` calls per terrain vertex.** `surfaceFor` without a
   slope argument recomputes slope from scratch; the mesh builder had the neighbour
   heights sitting in an array beside it.
8. **The renderer owned world layout.** 42 props from a private RNG that the
   kernel could not collide with — the architectural defect ADR-0007 exists to
   close. The renderer is now a pure view.

## Not verified — do not claim these

- **That the rigs _feel_ different to anyone but us.** This is the project's
  central claim and it remains Tier 4 at best. The external-player language gate
  from the Rig Lab 01 review stays open, and terrain does not close it — it only
  makes the question worth asking. The honest new question is whether players
  describe _ground_ (mud, grade, run-ups) rather than stats.
- **Audio.** The synth is wired, running, and driven by real slip/load signals.
  Nobody has listened to it in this session. Unheard audio is not shipped audio.
- **Any device or production performance.** No cold-cache, low-power, mobile, or
  deployed measurement exists.
- **Mobile layout — RESOLVED 2026-07-25, after this review was first written.**
  The earlier reading (`#touch-controls` bottom 899.4 against an `innerHeight` of
  844, i.e. ~55 px of action row off-screen) came from the local tree _while the
  stylesheet was being edited concurrently_, and was never a property of a built
  artifact. Re-measured on the deployed site at 390 x 844: touch controls sit
  10.4 px **inside** the viewport, there is a 54 px gap above the field kit, and
  horizontal overflow is 0. All five touch actions are on-screen and reachable.
  Recorded here rather than deleted, because "measured on a tree mid-refactor" is
  a real failure mode worth remembering.
  - Remaining polish, not a blocker: at 390 px the field-kit panel overlaps the rig
    itself. The portrait chase camera should pull back further, or the kit should
    shrink, so the machine is never behind its own instruments.

## Anything else?

1. **The world is now large enough to be empty.** 500 m across with 7 sites risks
   precisely the "procedural expanse without authored reasons to move through it"
   that `DESIGN.md`'s anti-slop list forbids. Salvage and sightlines are a first
   answer, not a sufficient one. The next content question is density of _reasons_,
   not more square metres — and adding rigs or biomes will not fix it.
2. **Two of the eight defects above were false promises, not crashes.** A module
   that does nothing and a vehicle that faces backwards both pass every test that
   only checks state transitions. The tests added in this pass assert _claims_
   (this module changes this outcome; this surface favours this tyre) rather than
   only mechanics, which is the pattern worth keeping.
3. **The bundle is still over the advisory** at 617 kB raw. It is almost entirely
   Three.js and it is not addressed here; recorded rather than quietly tolerated.
