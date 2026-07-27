# Same Vehicle Prompt Sheets

- Status: **living prompt library**
- Date: 2026-07-26
- Purpose: provide copyable prompt seeds for the same vehicle across different modes, scenes, and escalation levels

## How to use

Use these as starting points for later image generation or `img2threejs`
reference passes. Keep the vehicle identity constant unless a new family is
explicitly desired.

## Shared baseline

When using any prompt below, preserve:

- one original tractor or chosen canonical machine;
- same chassis family across all variants;
- visible repair history;
- no logos or real-brand likeness;
- no text or UI unless explicitly requested;
- clear silhouette margin;
- project-owned saving only.

## Farming day prompt

```text
Use case: stylized-concept
Asset type: original vehicle scene reference
Primary request: show the same patchwork tractor in a bright farming scene at work, with plow, soil, crop rows, and practical utility
Scene/backdrop: open field, fence line, barn or silo in the distance
Subject: same tractor with visible repair history, plow, beacon, and work lights
Style/medium: tactile stylized 3D concept art
Composition/framing: close chase or medium work camera
Lighting/mood: warm daylight, calm, readable, productive
Color palette: cream, rust, field green, brown soil, amber accents
Constraints: no text, no logos, no brand likeness, no extra vehicle identity changes
```

## Racing prompt

```text
Use case: stylized-concept
Asset type: original vehicle scene reference
Primary request: show the same tractor as a racing machine, keeping the same character but making it feel stable, competitive, and heroic on a route
Scene/backdrop: dirt track, pit lane, flags, dust, spectators or route markers
Subject: same tractor with race-tuned tires, tightened stance, and less clutter
Style/medium: tactile stylized 3D concept art
Composition/framing: close chase, low-angle, high-energy
Lighting/mood: bright race daylight or sunset glare
Color palette: same machine palette, but with sharper contrast and dust
Constraints: keep the same tractor identity; do not turn it into a different racer archetype
```

## Dystopian survival prompt

```text
Use case: stylized-concept
Asset type: original vehicle scene reference
Primary request: show the same tractor surviving in a broken world, with scavenged armor, cargo, and field repairs
Scene/backdrop: ruined road, abandoned field, broken signage, fog, rain, or ash
Subject: same tractor, now a shelter and scavenger platform, still clearly the same machine
Style/medium: tactile stylized 3D concept art
Composition/framing: medium chase, slightly wider to show environment threat
Lighting/mood: dusk, fog, low power, tense but readable
Color palette: muted rust, dirty cream, dark steel, emergency amber
Constraints: no brand likeness, no lore-breaking sci-fi swap, no UI text
```

## Zombie-defense prompt

```text
Use case: stylized-concept
Asset type: original vehicle scene reference
Primary request: show the same tractor in a zombie-defense role, with escalating lights, barricade tools, and non-explosive anti-horde hardware
Scene/backdrop: rural perimeter, ruined fence line, night threat zone, debris
Subject: same tractor with brush guard, floodlights, roof rack, and defensive attachments
Style/medium: tactile stylized 3D concept art
Composition/framing: tactical chase or elevated top-down
Lighting/mood: deep night, strong light cones, danger silhouettes
Color palette: dark field tones, intense amber/white lamps, selective red danger accents
Constraints: keep the machine recognizably the same tractor; escalate plausibly and then absurdly if needed
```

## Deep-dark prompt

```text
Use case: stylized-concept
Asset type: original vehicle scene reference
Primary request: show the same tractor in near-total darkness where lamps define the vehicle identity
Scene/backdrop: black field, fog, smoke, rain, or tunnel-like darkness
Subject: same tractor, but now the headlights, beacon, mast lights, and side lamps are the design
Style/medium: tactile stylized 3D concept art
Composition/framing: close or medium chase, shape-first composition
Lighting/mood: as dark as possible while still readable
Color palette: very dark environment, bright lamps, tiny reflected highlights
Constraints: no silhouette loss, no random redesign, no extra subjects
```

## Absurd prompt

```text
Use case: stylized-concept
Asset type: original vehicle scene reference
Primary request: show the same tractor in a weird but legible mythic version, preserving identity while changing the world contract
Scene/backdrop: dream, moon base, ceremonial plaza, courtroom, museum, or abandoned theme park
Subject: same tractor, now treated as a story object, still clearly itself
Style/medium: tactile stylized 3D concept art
Composition/framing: whichever framing makes the machine read most clearly
Lighting/mood: dramatic, symbolic, slightly absurd
Color palette: keep core machine colors and add a strong scene-specific accent
Constraints: absurd is allowed, identity drift is not
```

## Add a new sheet when

- a new mode changes the machine identity enough to deserve a repeatable prompt;
- a new lighting state becomes important enough to prototype visually;
- a new threat ladder adds a reusable escalation pattern;
- a new scene contract becomes a core product possibility.

## Comparison-board prompt seeds

These seeds match the new paired boards and can be reused for later image or
`img2threejs` passes.

The corresponding project-owned comparison-board evidence lives in
[Same Vehicle Comparison Boards](SAME_VEHICLE_COMPARISON_BOARDS_2026-07-27.md)
and is registered in the [Asset Provenance Register](../research/ASSET_PROVENANCE_REGISTER.md).

### Farming versus racing

```text
Show the same tractor in a single comparison board with one farming panel and one racing panel; keep the cab, wheel family, and repair history identical while shifting only the loadout, camera, dust, and route contract.
```

### Survival versus construction

```text
Show the same tractor as a survival shelter rig beside the same tractor as a construction and salvage tool; keep the same machine identity while adding armor, cargo, booms, clamps, and work lighting.
```

### Urban versus absurd

```text
Show the same tractor as a civic oddity beside a mythic or absurd version; preserve the silhouette and repair grammar so the identity survives even when the world contract becomes strange.
```
