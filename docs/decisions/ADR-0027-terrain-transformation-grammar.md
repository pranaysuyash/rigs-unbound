# ADR-0027: Terrain transformation grammar — clear, grade, fill

- Status: **Proposed**
- Date: 2026-07-26
- Deciders: project owner (Pranay)
- Implements: R1 (terrain transformation feedback) and R2 (route opening proof) from the Reclamation Strategic Synthesis
- Supersedes: the ad-hoc cut/fill plough mode in `src/game/state.ts` § PLOUGH_DEPTH / PLOUGH_FILL
- Related: [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md) (terrain as substrate), [ADR-0011](ADR-0011-command-capability-affordance-state-separation.md) (command/event separation), Reclamation Strategic Synthesis (`docs/research/RECLAMATION_STRATEGIC_SYNTHESIS_2026-07-26.md`)

---

## Context

The Reclamation loop is the first validated game loop for Rigs Unbound. Its
core promise is: *you make land passable, and the land remembers.* The loop
requires the player to encounter a terrain blocker, transform it, and see the
world change in a way that opens a route and benefits another rig.

### What exists today

The terrain field (`src/game/terrain.ts`) already supports player deformation
through `deform(x, z, delta, radiusCells)`. The plough blade operates in two
modes defined by `BladeMode` in `src/game/contracts.ts`:

- **cut** — lowers ground by `PLOUGH_DEPTH = -0.13 m` per pass (bounded by
  `DEFORM_MIN = -0.42 m`)
- **fill** — raises ground by `PLOUGH_FILL = 0.075 m` per pass (bounded by
  `DEFORM_MAX = +0.30 m`)

Both modes write the same `FurrowMark` record: `{ x, z, heading, createdAt,
rigId }`. The renderer applies one rust-tone vertex displacement regardless of
blade mode. There is no visual distinction between cutting a path through a bog
and building a mound in a meadow.

Surface classification (`surfaceFor` in `terrain.ts`) is a priority chain:

```
water → authored pad → track (routeWeight > 0.5) → rock (steep/high)
  → mud (low-lying wet) → sand (dry) → grass (default)
```

The thresholds are:

| Surface | Trigger condition |
|---------|-------------------|
| water   | `height < WATER_LEVEL` |
| pad     | inside a site's `serviceRadius` with `padSurface` |
| track   | `routeWeight > 0.5` |
| rock    | `slope > 0.62` or `elevation > 38` |
| mud     | `elevation < WATER_LEVEL + 1.05` or `moisture > 0.71` |
| sand    | `moisture < 0.34` |
| grass   | everything else |

Critically, **deformation does not participate in surface selection**. A cell
that was grass stays grass no matter how deep it is cut or how high it is
filled. The only way surface changes today is through the base noise field at
construction time.

### What is missing

The Reclamation journey requires three terrain verbs that the current system
cannot express:

1. **Clear** — removing a shallow bog or gully by cutting it down to firm
   ground. The player sees wet mud become dry grass. The surface grip improves.
   A rig that was stuck now drives through.

2. **Grade** — smoothing a steep slope by cutting the high side and filling the
   low side. The player sees a slope become a ramp. The grade drops below the
   rig's climbing threshold. A route that was blocked by grade opens.

3. **Fill** — bridging a gap or depression by raising it above the waterline.
   The player sees water become mud, then grass. A rig that would drown now
   crosses.

None of these produce a meaningful feedback loop today because:

- deformation does not shift surface classification
- cut and fill look identical in the renderer
- there is no before/after signal the player can read

---

## Decision

### 1. Three terrain verbs, one blade, mode-gated

The blade remains a single physical attachment on the utility tractor. The
player switches between three modes that map to distinct terrain outcomes:

| Verb | Blade mode | Height effect | When the player uses it |
|------|-----------|---------------|-------------------------|
| **Clear** | `cut` | Lowers ground by `PLOUGH_DEPTH` per pass | A bog, gully, or shallow water blocks the route |
| **Grade** | `cut` | Lowers ground, but the renderer draws a *smoothed* furrow with reduced side ridges | A slope is too steep; the player cuts the high side |
| **Fill** | `fill` | Raises ground by `PLOUGH_FILL` per pass | A gap or depression needs bridging |

**Clear vs Grade distinction**: Both use the `cut` blade mode and the same
`deform()` call. The distinction is *presentation*, not simulation:

- **Clear** applies the standard furrow: full `PLOUGH_DEPTH`, standard falloff,
  side ridges at `DEFORM_MAX` on adjacent cells. This is the existing behaviour.
- **Grade** applies a wider, shallower cut: half the depth (`PLOUGH_DEPTH ×
  0.5`), double the radius (`radiusCells = 2`), and suppresses side-ridge
  generation. The result is a smoothed surface rather than a furrowed trench.

The mode selection is automatic based on context, not a player toggle. When the
blade is in `cut` mode:

- If the surface ahead is **mud, sand, or grass below a slope threshold**
  (grade < 0.25): the blade **clears** — standard furrow behaviour.
- If the surface ahead is **any surface above a slope threshold** (grade ≥
  0.25): the blade **grades** — wider, shallower, smoothed presentation.

This means the player does not need to choose between clear and grade. They
lower the blade and drive. The terrain responds appropriately. The distinction
matters for the *renderer*, not for the *input*.

### 2. Surface classification shifts on deformation

This is the load-bearing change. After any `deform()` call, the affected cells
must be re-classified by `surfaceFor()` using the *new* height, not the base
height. The implementation is:

**`surfaceFor` gains a deformation-aware path.** The current `height()` already
composes `baseHeight() + deformationAt()`. Since `surfaceFor` is called from
`sample()` which calls `height()`, the surface classification already reads the
deformed height. However, the current threshold logic does not produce
meaningful transitions because:

- Mud is triggered by `elevation < WATER_LEVEL + 1.05` or `moisture > 0.71`
- Cutting a bog cell *lowers* its elevation, which keeps it in the mud zone
- Filling a bog cell *raises* it, which could push it above the waterline
  threshold into the grass zone — **but only if the water-level margin is
  crossed**

The required change is to make **deformation itself a surface modifier**, not
just a height modifier:

```
surfaceFor(x, z, height, slope):
  1. Compute base surface from height/slope/moisture (existing logic)
  2. If the cell has player deformation:
     a. Deep cut (deformation < DEFORM_MIN × 0.6): surface → tilled
        (exposed subsoil, moderate grip, high rolling drag)
     b. Fill above waterline: surface → grass (reclaimed ground)
     c. Fill above waterline in a wet zone: surface → sand (drained soil)
     d. Standard deformation: surface stays as the base classification
        but grip/rollingDrag shift by ±10% to reflect disturbed ground
```

This gives the player visible, meaningful consequences:

| Action | Before | After | Gameplay effect |
|--------|--------|-------|-----------------|
| Cut a bog deeply | mud (grip 0.38) | tilled (grip 0.52) | Better traction, still high drag |
| Fill a depression above waterline | water/mud | grass (grip 0.82) | Crossable, good grip |
| Fill wet ground to sand level | mud | sand (grip 0.54) | Moderate grip, high drag |
| Grade a slope | rock/steep grass | grass (smoothed) | Grade drops, rig can climb |

### 3. Furrow visual by blade mode

The renderer must distinguish cut and fill furrows visually. The current
`FurrowMark` record gains a `mode` field (matching the existing
`AttachmentState.mode` on the plough):

```typescript
interface FurrowMark {
  x: number;
  z: number;
  heading: number;
  createdAt: number;
  rigId: RigId;
  /** Blade mode when this mark was created. */
  mode: BladeMode;
}
```

**Visual consequences:**

| Mode | Vertex displacement | Vertex color | Side ridges |
|------|--------------------|-------------:|:-----------:|
| cut  | Negative (trench)  | Dark brown (`0x5c3a1a`) | Yes — raised spoil on both sides |
| fill | Positive (mound)   | Light ochre (`0xb8975a`) | No — material comes from behind |

The grade mode (wide, shallow cut) uses the same dark brown as cut but with
reduced side ridges and a wider displacement kernel. The renderer can detect
grade vs clear from the furrow's `heading` consistency: consecutive furrow marks
with similar headings and small spacing indicate a grade pass, while scattered
marks indicate clearing.

**Practical renderer change:** The `furrowDecals` instanced mesh already exists.
The vertex shader or the instance colour buffer must be extended to sample
`furrow.mode` and apply the appropriate colour and displacement sign. This is a
local change to `renderer.ts` § `refreshFurrows()`.

### 4. Surface classification drives traversal

The route-opening proof (R2) depends on surface classification changes making a
previously impassable path traversable. The chain is:

1. Player drives into a bog. Mud surface → low grip, high rolling drag.
   `traversalBlockReason` may fire if the grade is steep enough.
2. Player lowers the blade. Cut mode → `deform()` lowers the bog cells.
3. Deep cuts shift surface from mud to tilled. Grip improves from 0.38 to 0.52.
4. Player switches to fill mode. Fills the remaining depression above waterline.
5. Filled cells shift surface from water/mud to grass. Grip jumps to 0.82.
6. The physics model reads the new surface → higher grip, lower rolling drag →
   the rig now drives through where it was stuck.

This chain requires no changes to `physics.ts` or `collision.ts`. The physics
already reads `surface.grip` and `surface.rollingDrag` from the terrain sample.
The only change is that those numbers now *shift* when the player deforms the
ground.

### 5. Persistence

Deformation already persists through the save record (`deformationEntries()` in
`terrain.ts`, stored in `GameWorld`). The `mode` field on `FurrowMark` must
also persist. This is a schema-safe addition: old save records without `mode`
default to `"cut"` (matching the pre-ADR behaviour), and the recovery path in
`recoverShared` already handles missing fields gracefully.

The surface classification shift is *derived* from the persisted deformation, not
stored separately. This means the save record remains a minimal height-delta
list, and the surface re-classification happens at load time through the same
`surfaceFor()` path. No new save schema version is required.

---

## Consequences

**Positive**

- The Reclamation loop becomes designable: clear → surface shift → grade
  improvement → route opens → cross-rig benefit.
- The player gets legible before/after feedback without a HUD indicator: the
  ground colour changes, the rig handles differently, and the route opens.
- The blade mode toggle (C key) remains useful: fill mode is still a distinct
  player action for bridging gaps.
- No new engine dependency, no new asset, no schema version bump.
- The existing `deform()` API is unchanged; the verb distinction is in
  presentation and surface classification, not in the mutation path.

**Negative / accepted risk**

- The `surfaceFor()` function gains a deformation-dependent branch, which means
  it is no longer purely height-based. This is a deliberate expansion of the
  surface model, not a violation of ADR-0007: the terrain field remains the
  single source of truth, and `surfaceFor` is a method on that field.
- The furrow `mode` field is a backward-compatible addition to `FurrowMark`. Old
  records load with `mode: "cut"` default. The renderer must handle the absence
  gracefully.
- The automatic clear-vs-grade selection is a heuristic. If the slope threshold
  (0.25) is wrong, the player may see unexpected behaviour at the boundary. This
  is tunable after playtesting, not a design flaw.
- The surface shift thresholds (DEFORM_MIN × 0.6 for tilled, waterline for
  grass) are first-draft values. They will need playtesting to confirm they
  produce the right *feel* — a single cut should not instantly flip a bog to
  grass; it should take 3-5 passes to cross the threshold.

---

## Alternatives considered

1. **Keep cut/fill as the only verbs, add visual distinction only.** Rejected:
   without surface classification shifts, the Reclamation loop has no gameplay
   consequence. The player changes how the ground *looks* but not how it
   *behaves*. The synthesis identifies this as the exact gap that makes terrain
   transformation feel like chores rather than building.

2. **Add a separate "grade" blade attachment.** Rejected: the Reclamation
   journey starts with one rig (Torque) and one blade. Adding a second
   attachment before the first loop is proven violates the cut/keep/finish
   principle (motto_v4 §0.12.4). The grade behaviour is a presentation variant
   of the cut mode, not a new capability.

3. **Store surface classification in the deformation record.** Rejected: this
   creates a parallel truth source. The surface is derived from height, slope,
   moisture, and deformation — storing it separately means a future change to
   `surfaceFor()` would not retroactively fix old records. Derivation at read
   time is the correct architecture.

4. **Make all three verbs player-selectable (C key cycles clear/grade/fill).**
   Rejected for now: three modes on one key increases input complexity before
   the first loop is proven. The clear/grade automatic selection based on slope
   keeps the input at two modes (cut/fill) while delivering three visual
   outcomes. If playtesting shows players want explicit grade control, the
   automatic heuristic can be replaced with a toggle later.

---

## Implementation scope

This ADR covers the *design* of the terrain transformation grammar. The
implementation is split across R1 and R2 in the Reclamation execution plan:

**R1: Terrain transformation feedback** (~3 commits)
- `FurrowMark.mode` field addition
- `surfaceFor()` deformation-aware branch
- Renderer furrow colour by mode
- `state.ts` plough depth/radius adjustment for grade mode

**R2: Route opening proof** (~2 commits)
- Surface classification shift validation (tests proving mud→tilled, water→grass)
- `physics.ts` traversal confirmation (grip/rollingDrag change makes route passable)
- End-to-end test: bog → cut → surface shift → rig drives through

---

## Anything else?

Yes. Two observations the synthesis raised that this ADR intentionally defers:

1. **The slope threshold for automatic grade selection (0.25) is a
   first-draft value.** It should be tuned against the actual seeded terrain
   after R1 lands. The right number is the one where the player never thinks
   "why did it grade here instead of clearing?" If that thought occurs during
   playtesting, the threshold needs adjustment, not a design change.

2. **The surface shift thresholds (DEFORM_MIN × 0.6 for tilled, waterline for
   grass) should produce a multi-pass experience.** A single cut should not
   instantly flip a bog to grass. The player should need to make 3-5 passes
   to fully transform a cell from mud to tilled, and 5-8 passes to fill a
   depression above waterline. This pacing is tunable through the thresholds
   and the `PLOUGH_DEPTH` / `PLOUGH_FILL` constants, not through the design
   grammar itself.

---

## Update log

- 2026-07-26: Proposed. Operator decision required on the slope threshold and
  surface shift pacing before R1 implementation begins.
