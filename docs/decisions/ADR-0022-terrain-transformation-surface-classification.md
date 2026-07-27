# ADR-0022: Terrain transformation surface classification

- Status: **Decided** (pending R1 implementation)
- Date: 2026-07-27
- Deciders: project owner (Pranay), implementing agent
- Related: [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md), Reclamation journey (Step 3)

## Context

The Reclamation journey requires that ploughing changes not just terrain height but also surface classification — the player must see and feel that "I altered the land, and the land remembers." Currently `surfaceFor()` classifies surfaces by slope, elevation, moisture, route weight, and authored pads. It has **no deformation-based classification**: a ploughed field still reads as "grass" in the surface table, which contradicts the core Reclamation promise.

Three decisions must be made before R1:

1. At what deformation depth does grass become tilled?
2. What is the maximum slope at which tilled classification applies?
3. Should the transition be gradual or binary?

## Decision 1: Tilled threshold at DEFORM_MIN × 0.6 (−0.25 m)

### Values

- `DEFORM_MIN = -0.42` (deepest a single cell may be cut)
- `PLOUGH_DEPTH = -0.13` (height change per cut pass)
- `PLOUGH_FILL = +0.075` (height change per fill pass)

### Rationale

At −0.25 m cumulative deformation, the player crosses the tilled threshold after approximately **2 cut passes** over the same cell. This is the right pacing:

- **1 pass (−0.13 m):** Too early. The player hasn't committed to the action yet; a surface shift after a single tap feels accidental.
- **2 passes (−0.26 m):** Right. The player has driven over the same ground twice, understood the mechanic, and now sees the surface change. The "I did something" moment arrives after deliberate effort.
- **3+ passes (−0.39+ m):** Too late. The player has already carved a meaningful furrow and is wondering why the surface hasn't changed.

The threshold is expressed as a fraction of `DEFORM_MIN` rather than a fixed value so it scales if the deformation bounds change later.

### Implementation

In `surfaceFor()`, after the existing slope/elevation/moisture checks and before the final grass fallback:

```typescript
// Deformation-based tilled classification. When cumulative cut deformation
// exceeds the tilled threshold, grass becomes tilled soil — the surface the
// plough was designed to create. This is the Reclamation mechanic: the player
// alters the land, and the surface classification changes to reflect it.
const deform = this.deformation.get(deformKey(cx, cz)) ?? 0;
if (deform <= TILLED_DEFORMATION_THRESHOLD) {
  return SURFACES.tilled;
}
```

Where `TILLED_DEFORMATION_THRESHOLD = DEFORM_MIN * 0.6`.

## Decision 2: Maximum tilled slope at 0.25

### Rationale

A slope of 0.25 is approximately 14°. This is the practical limit at which a tractor can realistically work soil:

- Below 0.25: the tractor has traction and stability to cut/fill effectively. Tilled classification is earned.
- Above 0.25: the ground is too steep for the blade to work cleanly. The surface stays as its natural classification (grass, rock) even if deformed.
- Above `ROCK_SLOPE` (0.62): the surface is already classified as rock, which is non-deformable anyway, so the slope gate only matters for the 0.25–0.62 range.

This prevents the physically implausible case where deforming a steep hillside creates "tilled cliff." The surface classification respects the mechanical reality of the tool.

### Implementation

```typescript
const steepness = slope ?? this.slope(x, z);
if (steepness > MAX_TILLED_SLOPE) {
  // Too steep for the plough to work. Surface stays as its natural
  // classification even if deformed.
} else {
  const deform = this.deformation.get(deformKey(cx, cz)) ?? 0;
  if (deform <= TILLED_DEFORMATION_THRESHOLD) {
    return SURFACES.tilled;
  }
}
```

Where `MAX_TILLED_SLOPE = 0.25`.

## Decision 3: Binary snap with visual tell

### Rationale

A gradual blend (interpolating grip/drag between grass and tilled based on deformation depth) is more physically accurate but:

1. **Harder to communicate.** The player cannot feel a 5% grip change. They can feel "this is now tilled soil" — a discrete surface identity.
2. **More expensive.** Every `surfaceFor()` call would need to sample the deformation map and interpolate, adding cost to the hot path.
3. **Legibility.** The existing surface names ("Pasture", "Tilled soil", "Bare rock") are discrete identities. A gradient undermines that vocabulary.

The binary snap is the right call: below the threshold → grass. At or below → tilled. The player gets a clear "now it's different" moment.

### Visual tell

The renderer already distinguishes cut vs fill furrow decals by color (brown for cut, tan for fill). To preview the surface transition before the threshold:

- Furrow decals in the "approaching threshold" zone (0.15–0.25 m deformation) use a transitional color between grass-green and tilled-brown.
- This gives the player a visual hint that the surface is about to change, without requiring a gradient in the physics model.

This is a renderer-only concern and does not affect the simulation.

## Consequences

**Positive**

- The Reclamation journey has a legible surface-change moment after ~2 passes.
- Surface classification respects physical reality (no tilled cliffs).
- Binary snap is cheap, legible, and consistent with existing surface vocabulary.
- Furrow decal color provides the visual preview without simulation cost.

**Negative / accepted risk**

- The 0.25 m threshold is tuned for the current PLOUGH_DEPTH. If PLOUGH_DEPTH changes, the threshold fraction should be re-evaluated.
- The max tilled slope (0.25) is an authorial choice, not a physical measurement. It may need tuning after playtesting.

## Alternatives considered

- **Gradual blend.** Rejected: harder to communicate, more expensive, undermines discrete surface vocabulary.
- **Fixed −0.15 m threshold.** Rejected: doesn't scale if DEFORM_MIN changes; the fractional form is more robust.
- **No slope gate.** Rejected: creates physically implausible tilled classification on steep terrain.
- **Tilled at 1 pass.** Rejected: feels accidental; the player hasn't committed to the action yet.
