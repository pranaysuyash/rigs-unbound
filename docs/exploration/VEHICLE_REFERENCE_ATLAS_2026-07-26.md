# Vehicle Reference Atlas

- Status: **seed atlas in progress**
- Date: 2026-07-26
- Purpose: create a broad reference pool of original rigs and vehicles that can later be turned into isolated `img2threejs` reconstruction inputs and then into production models

## Why this exists

The tractor work showed that a single good reference is useful, but a real vehicle pipeline needs breadth:

- different locomotion grammars;
- different silhouettes and hardpoint layouts;
- different scale regimes;
- different repair histories and module families;
- different verbs the player can feel from the frame alone.

This atlas is not a ship list. It is a visual research seed bank.

## Visual contract for every image

- original fictional vehicle only;
- centered or clearly separated from other subjects;
- flat neutral background;
- no text, logos, watermark, UI, or environment clutter;
- visible silhouette margin for future isolation and cropping;
- one dominant subject per image, or a very clean lineup sheet if a family comparison is the point;
- readable hardpoints, wheels, tracks, hover elements, and attachment logic;
- same design family across variants, but different enough to teach reconstruction something useful.

## Planned vehicle families

### 1. Farm and field rigs

These are the closest neighbors to the tractor baseline.

| ID                        | Concept                                                                               | What it tests                                   |
| ------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `field-tractor-restored`  | cleaner version of the patchwork tractor with repaired cab and clearer mount geometry | canonical turnaround, restoration history       |
| `field-tractor-workhorse` | heavier rear stance, wider tires, stronger plow body                                  | mass, traction, stance, load-bearing silhouette |
| `seed-runner`             | narrow rapid planting rig with rear sowing body and tank                              | cargo + sowing hardpoints                       |
| `harvest-tug`             | compact tow-and-salvage farm rig                                                      | towing, recovery, winch language                |
| `orchard-crawler`         | low, wide machine for tight rows and terrain pressure                                 | width, clearance, crop-safe geometry            |
| `marsh-skimmer`           | amphibious farm support rig for wet land                                              | floatation, raised intake, mud logic            |

### 2. Utility and service rigs

These broaden the world beyond farm identity without leaving the project’s mechanical language.

| ID                  | Concept                                                         | What it tests                                        |
| ------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| `service-van-rig`   | boxy mobile mechanic/support vehicle                            | enclosed service body, side access, tool storage     |
| `tow-truck-rig`     | long wheelbase recovery truck                                   | boom, hook, chassis length, rear logic               |
| `crane-yard-rig`    | compact crane truck for construction or salvage                 | vertical arm articulation, counterweight silhouette  |
| `delivery-sprinter` | small route runner with parcel capacity                         | road speed, urban readability, side-panel language   |
| `garage-carrier`    | mobile repair platform with open deck                           | multi-vehicle support, staging deck, module stacking |
| `road-winch-rig`    | road-clearing utility vehicle with front and rear cable systems | cable routing, anchoring, asymmetric tool faces      |

### 3. Toy-scale and small-world rigs

These keep the vehicle-as-protagonist idea alive at tiny scale.

| ID                | Concept                                                        | What it tests                            |
| ----------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `desk-buggy`      | tiny toy car that can move through furniture-scale worlds      | small silhouette readability             |
| `mini-crawler`    | compact tracked rig for ducts, shelves, and maintenance spaces | track language, interior traversal       |
| `courier-skiff`   | tiny hover or glide craft for delicate routes                  | floating clearance and smooth undersides |
| `pocket-forklift` | micro utility loader                                           | fork geometry, compact articulation      |

### 4. Rescue, defense, and odd jobs

These add story and gameplay verbs without becoming generic combat vehicles.

| ID                | Concept                                                | What it tests                                  |
| ----------------- | ------------------------------------------------------ | ---------------------------------------------- |
| `rescue-bus`      | shelter-on-wheels with visible interior volume         | passenger scale, public-service identity       |
| `field-ambulance` | compact support van for recovery and triage            | medical/service identity without brand cues    |
| `light-guard-rig` | work-light vehicle with shielded lamps and sensor mast | visibility, beacon language, night readability |
| `riot-scrub`      | barrier-moving municipal rig                           | push, block, and clear semantics               |

### 5. Extreme and aspiration rigs

These are for “what if the same world gets stranger” moments.

| ID              | Concept                                                   | What it tests                                       |
| --------------- | --------------------------------------------------------- | --------------------------------------------------- |
| `snow-crawler`  | winter terrain machine with high ground clearance         | seasonal state, track depth, cold-weather character |
| `dune-hauler`   | desert cargo machine with oversized intake and suspension | heat, sand, dust, cargo mass                        |
| `launch-tender` | airport/spaceport service rig                             | scale aspiration, landing gear-like supports        |
| `sky-barge`     | slow aerial utility craft or lift platform                | non-road locomotion, underside structure            |

## Initial generation order

The first image batch should favor the most reconstruction-friendly and game-useful shapes:

1. restored field tractor
2. seed runner
3. marsh skimmer
4. service van rig
5. tow truck rig
6. mini crawler
7. rescue bus
8. snow crawler
9. dune hauler
10. tractor evolution sheet
11. construction and salvage rigs
12. aquatic and amphibious rigs
13. aerial and orbital support rigs
14. urban and civic support rigs

If the first round is strong, the second round can move into more unusual forms like garage carrier, launch tender, and sky barge.

## Version families

Each concept should be explored in at least three visual variants:

- `v1` baseline form;
- `v2` repaired / more story-bearing form;
- advanced specialized form with a stronger tool or environment bias.

For the tractor family, the intended sequence is:

- `found`
- `stabilized`
- `working`
- `specialized`
- `hybridized`
- `storied`

That sequence should stay recognizable even when the machine class changes.

The dedicated tractor evolution sheet is the first version-family proof for this atlas.

## Prompt pattern

Use one prompt per image, or one prompt per family lineup sheet when comparison is the point.

```text
Use case: stylized-concept
Asset type: original vehicle reference for later image-to-3D reconstruction
Primary request: create an original [vehicle name] with a strong silhouette, believable hardpoints, and a tactile game-ready repair language
Input images: tractor reference board if needed for palette or material family
Scene/backdrop: flat neutral background with no floor plane or clutter
Subject: one isolated vehicle, clearly separated from the background
Style/medium: authored stylized 3D concept art, low-poly but materially rich, original design
Constraints: no text, no logos, no brand likeness, no humans, no watermark, generous silhouette margin
```

## Downstream use

Once a concept proves out visually:

1. save the chosen image into the repo as a reference asset;
2. register it in provenance notes;
3. convert it into a reconstruction/admission input for `img2threejs`;
4. generate the first isolated vehicle turnaround;
5. use the turnaround to guide production mesh work;
6. keep the generated reference and the runtime mesh separate in the manifest.

## Open questions

- How much should each family preserve the tractor’s repair grammar?
- Which non-tractor rigs should become canonical first-playable candidates?
- Which of these should remain world-lore references only?
- What is the smallest useful number of variants per family before the board becomes noisy?

The atlas is now intentionally broad enough to support later isolated
reconstruction passes across multiple movement classes and city/farm worlds,
not only tractor derivatives.
