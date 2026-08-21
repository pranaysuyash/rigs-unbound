# Rig Production Pipeline — From Image Reference to Runtime Rig

**Date:** 2026-08-17
**Status:** Canonical production reference (documentation; no code changed in this pass)
**Scope:** The repeatable path that turns an image reference plate into a fully
integrated, buyable, upgradable rig in *Rigs Unbound* — and the honest state of
every stage today.
**Evidence tier:** Tier 1 (static inspection of code, tools, assets, and test
surfaces). Every claim below is labeled **Observed** (seen in the live tree) or
**Proposed** (not yet implemented). Nothing here promotes a paused decision;
see §9 for the GD-13 boundary.

---

## 1. The Two-Lane Contract (the one rule that makes this safe)

Every rig is produced by two lanes that must never collide:

| Lane | Source of truth | Owns | Never owns |
|---|---|---|---|
| **FORM** | The image reference plate | Subassemblies, proportions, materials, greebles, story marks, silhouette character | Absolute dimensions |
| **DIMENSIONS** | `RIG_PROFILES` in `src/game/contracts.ts` | `track`, `wheelbase`, `wheelRadius`, `rideHeight`, `mass`, power | Shape or proportion opinions |

This is not a style preference. It is the codified lesson of
`tools/rig-asset-envelope.ts`, whose module docblock states it exactly:

> the reference plate supplies FORM — which subassemblies exist, their
> proportions, materials, greebles. `RIG_PROFILES` supplies DIMENSIONS —
> footprint, ride height, wheel radii.

Estimating simulation dimensions from a photograph is structurally the same act
as hand-writing them as renderer literals — the exact drift that once left every
rig floating above the terrain by its own `rideHeight` (see the module docblock
of `src/game/rig-blockout.ts` and the 2026-08-11 worklog addendum). The blockout
module exists so that derived quantities (contact positions, rolling radius,
spin scale, steer sweep) *cannot* disagree with the simulation, and authored
quantities exist only as **ratios** (`RIG_SILHOUETTES`, `RIG_SUPERSTRUCTURES`,
`RIG_MODULE_FORMS`) so a profile change rescales the whole rig coherently.

**Consequence for the pipeline:** an image reference may freely dictate what a
rig *looks like*, but the moment any number from the image is about to become a
metre in the game, it must enter through `RIG_PROFILES` (simulation lane) or as
a ratio in `rig-blockout.ts` (form lane) — never as an absolute literal in a
model factory or the renderer.

---

## 2. Pipeline overview

```
S0 Reference plate        S1 Design spec           S2 Simulation identity
(3 images + manifest)  →  (specs/<id>.md)       →  (rig-ids + RIG_PROFILES)
                                                        │
                                                        ▼
S6 Runtime wiring   ←  S5 Acceptance gates   ←  S4 Model FORM          ←  S3 Derived blockout
(renderer registry)     (envelope + browser)     (authored factory /      (silhouettes +
     │                       │                   img2threejs / GenAI)      superstructures)
     ▼                       ▼                                                  ▲
S7 Catalog & manifest registration ◄──────────────────────────────────────────┘
```

| Stage | Produces | Canonical location | Gate |
|---|---|---|---|
| S0 | Concept turnaround, orthographic blueprint, detail breakout | `assets/generated/rig_concepts/<id>_{concept,orthographic,details}.png` + `assets/asset-manifest.json` entry (`kind: "reference"`, `rightsStatus: "review-required-before-distribution"`) | `npm run assets:preflight` |
| S1 | Design specification | `docs/design/rigs/specs/<rig-id>.md` per the `RIG_DESIGN_SYSTEM.md` schema | Spec/profile table agreement (§4.1) |
| S2 | Rig identity + physical profile | `src/game/rig-ids.ts`, `RIG_PROFILES` in `src/game/contracts.ts` | `candidate-rigs-blockout.test.ts` profile test |
| S3 | Derived dimensional bridge | `RIG_SILHOUETTES` + `RIG_SUPERSTRUCTURES` (+ `RIG_MODULE_FORMS` when modules fit) in `src/game/rig-blockout.ts` | `rig-blockout.test.ts` invariants (axle-scale mean = 1, no module/superstructure overlap, doubling coherence) |
| S4 | Model FORM | Lane A: `assets/workbench/<rig-id>/authored/create<X>Model.ts` (+ test). Lane B: img2threejs forge output. Lane C: external GLB | Workbench unit test (Lane A); sculpt-spec validation (Lane B); `tools/asset-preflight.mjs` (Lane C) |
| S5 | Evidence the model is right | Envelope check + browser captures | `npm run assets:rig-envelope`, `npm run test:ground-contact`, `tools/cross-rig-portrait-evidence.cjs`, `tools/rig-module-visual-acceptance.cjs` |
| S6 | Runtime presentation | Renderer model registry (currently `createCandidateRig()` generic blockout for the 13 candidates — see §8 Gap 1) | `npm run typecheck && npx vitest run` + rig-lab browser acceptance |
| S7 | Catalog registration | `docs/design/rigs/README.md` index row; manifest entries; GLB promotion (only when `publicRuntimeApproved` is deliberately set) | `tools/audit-asset-manifest-coverage.mjs`, `tools/assert-player-build-assets.mjs` |

---

## 3. Stage reference

### S0 — Reference plate production

**Observed state.** The 13 candidate rigs each have three generated reference
plates in `assets/generated/rig_concepts/` (26 PNGs total: every rig has
`_concept` and `_orthographic`; several also have `_details` breakouts). All
are registered in `assets/asset-manifest.json` as `kind: "reference"`,
`status: "concept"`, `publicRuntimeApproved: false` (44 manifest entries
total; 39 reference-kind).

**How to produce a plate (repeat of the proven recipe):**

1. Start from the design intent (family, verbs, locomotion class) and the
   Patchwork Atlas aesthetic rules in `docs/DESIGN.md` and
   `RIG_DESIGN_SYSTEM.md` §1.
2. Generate the **concept turnaround**: isometric 3/4 model-sheet, studio
   neutral lighting, isolated object on white — the format every existing
   plate uses.
3. Generate the **orthographic blueprint**: Side/Front/Rear/Top flat grid
   projection — this is the plate the blockout and any reconstruction lane
   aligns against.
4. Generate the **detail breakout** for subassemblies that carry identity
   (e.g. the tow rig's boom hinge, winch spool, outrigger, beacon).
5. Register each image in `assets/asset-manifest.json` with
   `sourceType: "generated-image"`, `kind: "reference"`,
   `rightsStatus: "review-required-before-distribution"` — exactly like the
   existing `heavy-utility-tow-recovery-01-model-sheet` entry.

**Gate.** `npm run assets:preflight` validates schema, SHA-256, and license
fields. Concept images are deliberately *not* runtime assets; they never enter
`assets/runtime/`.

### S1 — Design specification

**Observed state.** 13 spec files exist in `docs/design/rigs/specs/`, one per
candidate rig, following the `RIG_DESIGN_SYSTEM.md` §2 schema: identity block,
physical profile table (the seven simulation parameters), hardpoint & module
socket schema, subassembly breakdown, and the visual/3D-reconstruction prompt.

The spec's job in this pipeline is to be the **bridge document** between the
image and the code: the profile table must contain the same numbers that land
in `RIG_PROFILES`, and the socket schema is the future module-fitment contract
(see the upgrades roadmap doc for how sockets become `ModuleId`s).

### S2 — Simulation identity

**Observed state.** `RIG_IDS` (16 entries) and `RIG_PROFILES` in
`src/game/contracts.ts` are the simulation truth for all 16 rigs.
`candidate-rigs-blockout.test.ts` asserts every id has a profile with positive
wheelbase/track/mass/enginePower/rideHeight.

**Adding a rig here:**

1. Append the id to `RIG_IDS` (this extends the `RigId` union everywhere).
2. Add the `RIG_PROFILES` entry, transcribing the S1 spec table verbatim —
   the spec and the profile must not drift; if a number changes, change both
   in the same commit and say so.
3. Decide `mobilityAdapter` (ground vs hover) — this switches the blockout's
   wheel/skirt derivation and the traversal kernel's adapter.

### S3 — Derived blockout (ratios, never metres)

**Observed state.** `src/game/rig-blockout.ts` carries `RIG_SILHOUETTES` and
`RIG_SUPERSTRUCTURES` for all 16 rigs, plus `RIG_MODULE_FORMS` for the six
shipped modules. `blockoutFor(rigId)` derives the hull, wheel mounts (with
spin scale, steer sweep, tread envelopes), hover skirt, module mounts, and the
bodywork volumes that module placement must avoid.

**Authoring rules (enforced by `rig-blockout.test.ts`):**

- `frontWheelScale`/`rearWheelScale` must average to 1 (so `wheelRadius` is
  honestly the mean rolling radius).
- Superstructure forms are ratios of the derived hull, measured from the
  hull's top face (`yAboveTopScale`) — never absolute metres.
- Every buyable module needs a visual: it appears in `RIG_MODULE_FORMS` or
  `WHEEL_MOUNTED_MODULE_IDS`, or the completeness test fails.
- A hull-top module must find a real surface: placement negotiates the
  superstructure volumes and throws if none fits.

**Where the image reference enters this stage:** the orthographic plate tells
you the *ratios* — how much bigger the rear wheels are, how far the cab
overhangs the wheelbase, how many bodywork volumes the silhouette needs. Read
proportions off the plate; write ratios into the tables; let the derivation
resolve metres.

### S4 — Model FORM (three production lanes)

This is where "building rigs from image references" actually happens, and the
project has three lanes with different maturity:

#### Lane A — Authored TypeScript factory (proven, 14×)

**Observed state.** Every candidate rig has an authored parametric model
factory in `assets/workbench/<rig-id>/authored/create<X>Model.ts` with a
colocated test (e.g. `createSnowCrawlerModel.ts` +
`createSnowCrawlerModel.test.ts`), plus the fully-wired
`field-plough-01/authored/createFieldPloughModel.ts`. These factories build
Three.js scene graphs from primitives + `RoundedBoxGeometry` with
`MeshStandardMaterial`/`MeshPhysicalMaterial` in the Patchwork Atlas palette
(sage green, arctic steel, thermal glow, window glass — observed in the snow
crawler factory).

Why this lane leads: the factory is *parametric*, so the Two-Lane Contract is
enforceable — dimensions come in as arguments (ultimately from the blockout),
and the factory only expresses form. It is testable without a browser,
version-controlled, and needs no external service.

**Rules for Lane A:**

1. The factory receives dimensions; it does not invent them. Where a factory
   needs a dimension, take it from the blockout output (`blockoutFor(id)`)
   or pass it in from the renderer's existing derivation path.
2. Author in the GROUND frame (y = 0 is the contact plane) — the same frame
   `rig-blockout.ts` documents. The renderer applies
   `groundFrameOffsetY` when mounting.
3. Colocate a `<name>.test.ts` that asserts the factory's structural
   invariants (part presence, ground contact, dimensional agreement with the
   profile envelope).

#### Lane B — img2threejs forge from the reference plate (proven 1×, for an attachment)

**Observed state.** The complete forge chain ran end-to-end for
`field-plough-01` (a rig attachment, not a rig chassis):

```
assets/specs/field-plough-01.asset.json        canonical asset definition
  → tools/derive-img2threejs-spec.mjs          sculpt spec derivation
  → img2threejs validate_sculpt_spec.py        strict quality validation
  → generate_threejs_factory.py                generated TS factory (blockout pass)
  → tools/prepare-img2threejs-review-factory.mjs
  → tools/capture-field-plough-review.cjs      browser review captures
  → tools/export-field-plough-glb.cjs          GLB export
```

npm scripts exist for every step (`assets:derive-field-plough`,
`assets:build-field-plough`, `assets:review-field-plough`,
`assets:export-field-plough`, `assets:status-field-plough`).

**The rig-specific inversion (Observed in `tools/rig-asset-envelope.ts`, exercised via
`npm run assets:rig-envelope`):** a plough has no dimensional contract with the
simulation, so its spec dimensions can be estimated from the photo with honest
low confidence. A rig is the opposite — so for rigs the forge's dimensional
layer is *replaced* by the profile envelope. `tools/rig-asset-envelope.ts`
emits the machine-checkable envelope (GROUND frame, contact plane at y ≈ 0,
footprint from track/wheelbase, ride height, wheel radii) and can check a
candidate spec against it, "which turns 'remember to keep the generated rig on
the profile' from a review instruction into a failing test."

**When to use Lane B:** when a rig or module's form is too sculptural for
hand-authored primitives (the plough's helicoidal moldboards are the canonical
example) and a trustworthy reference plate exists. The 2026-08-05 asset
pipeline exploration notes the first img2threejs attempt on the plough failed
its Tier 1 gate (IoU 0.47 vs 0.85) before the authored pass succeeded — treat
the silhouette gate as real, not ceremonial.

#### Lane C — External GenAI GLB (proposed, 0 shipped)

**Proposed state.** `docs/research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md`
maps the external landscape (Tripo P1 / Meshy 6 for game-ready GLB, Hyper3D
Rodin for hero assets, Meshy/Polycam for PBR texture sets) and the hybrid
orchestration (LLM orchestrates; GenAI generates pixels/polygons; Blender MCP
refines; manifest gates). Nothing has been produced through this lane yet, and
that doc is paused with the other `RIG_GENERATION_*` research per GD-13 (§9).
Any first use of Lane C must go through the existing manifest/preflight gates
and the rig envelope check — an imported mesh authored in any frame other than
GROUND "will fail `tools/rig-ground-contact-acceptance.cjs` once mounted"
(Observed design intent in `rig-asset-envelope.ts`).

#### Lane decision rule

| Situation | Lane |
|---|---|
| Blocky hard-surface rig, Patchwork Atlas palette, must stay parametric | **A** (default for all 16 current rigs) |
| Sculptural form driven by a specific reference (moldboards, blades, organic shells) | **B**, gated by the rig envelope |
| Hero showcase asset where maximum detail matters and browser budget allows | **C** (Proposed — needs GD-13 resolution + ADR) |

### S5 — Acceptance gates

**Observed tooling (all present in `tools/`):**

| Check | Command | What it proves |
|---|---|---|
| Envelope derivation/check | `npm run assets:rig-envelope` | Candidate model dims satisfy the profile envelope (`tools/derive-rig-asset-envelope.ts`, `tools/rig-asset-envelope.ts`, `tools/rig-asset-envelope.test.ts`) |
| Ground contact | `npm run test:ground-contact` | Mounted model actually touches the terrain plane (GROUND frame) |
| Rig lab | `npm run test:browser` (`tools/rig-lab-browser-acceptance.cjs`) | Rig renders and behaves in the lab scene |
| Module visuals | `node tools/rig-module-visual-acceptance.cjs` | Fitted modules render at their derived mounts, clear of wheels/bodywork |
| Cross-rig portraits | `node tools/cross-rig-portrait-evidence.cjs` | Per-rig visual evidence across the roster |
| Camera / reduced motion | `tools/cross-rig-camera-evidence.cjs`, `tools/cross-rig-reduced-motion-evidence.cjs` | Camera and accessibility behavior per rig |
| Full unit suite | `npm run typecheck && npx vitest run` | No regression anywhere in the game |

Evidence discipline follows the project standard: Tier 2 for unit-gated
claims, Tier 3/4 for "it looks right in the browser" claims, and screenshots
land in the workbench `review/` folder (the field-plough pattern:
`assets/workbench/field-plough-01/review/*.png`).

### S6 — Runtime wiring

**Observed state — this is the pipeline's current frontier.**
`src/game/renderer.ts` has bespoke builders for the three launch rigs
(tractor, buggy, skimmer) and a generic `createCandidateRig()` (line ~4392)
that renders any of the 13 candidates from its blockout: hull box,
superstructure boxes, wheels (or hover skirt), headlights, state shell. The 13
authored workbench factories are **not yet imported by the renderer** — the
only workbench import is `createFieldPlough01Model` for the plough attachment.

This is deliberate staging, not an oversight: the blockout guarantees every
candidate is dimensionally honest in-game today, and promoting each rig from
"generic blockout" to "authored factory" is an independent, testable step
(see the expansion roadmap doc, Wave 1). The promotion pattern is proven:
wire the factory import, mount it through the same GROUND-frame +
`groundFrameOffsetY` path `createCandidateRig` uses, keep the blockout as
the dimensional authority the factory consumes, then run the S5 gates.

### S7 — Catalog & manifest registration

**Observed state.** `docs/design/rigs/README.md` is the catalog index (16
rows); `assets/asset-manifest.json` holds reference entries (S0) and runtime
entries (`assets/runtime/*.glb`: the field-plough GLB and two Kenney fixture
GLBs). Player-build boundary enforcement (`tools/assert-player-build-assets.mjs`)
separates the developer surface from the `publicRuntimeApproved` player
surface. A rig is "in the inventory" when: its index row status is truthful,
its manifest entries exist, and — for runtime GLB promotion only — the public
asset promotion package process has been followed
(`docs/research/PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md`).

---

## 4. Adding rig N+1 — the runbook

The complete checklist, in order, with the gates that must be green before
moving on. (This generalizes the README's 4-step "Adding New Rigs" section;
that section now points here.)

1. **[S0]** Generate the three reference plates; register them in
   `assets/asset-manifest.json` as reference/concept entries.
   Gate: `npm run assets:preflight`.
2. **[S1]** Author `docs/design/rigs/specs/<rig-id>.md` from the
   `RIG_DESIGN_SYSTEM.md` §2 schema. Fill the profile table first — it is the
   contract everything downstream reads.
3. **[S2]** Extend `RIG_IDS` and `RIG_PROFILES` from the spec table.
   Gate: `npx vitest run src/game/candidate-rigs-blockout.test.ts`.
4. **[S3]** Add `RIG_SILHOUETTES[<rig-id>]` and
   `RIG_SUPERSTRUCTURES[<rig-id>]` (ratios read off the orthographic plate).
   Gate: `npx vitest run src/game/rig-blockout.test.ts`
   `src/game/candidate-rigs-blockout.test.ts`.
5. **[S4 Lane A]** Author
   `assets/workbench/<rig-id>/authored/create<X>Model.ts` + colocated test,
   consuming blockout-derived dimensions, GROUND frame, Patchwork Atlas
   materials. Gate: the colocated workbench test.
6. **[S5]** Run `npm run assets:rig-envelope`, `npm run test:ground-contact`,
   and the rig-lab/cross-rig evidence captures once the rig renders (after
   step 7) — capture screenshots into the workbench `review/` folder.
7. **[S6]** Wire the factory into the renderer's rig construction path
   (replacing that rig's `createCandidateRig` fallback).
   Gate: `npm run typecheck && npx vitest run` + `npm run test:browser`.
8. **[S7]** Add/refresh the catalog index row in
   `docs/design/rigs/README.md` with a truthful status, and update this
   pipeline's §8 state table if the frontier moved.

Steps 1–5 are safe, parallelizable, and touch no runtime behavior (docs,
workbench, ratios). Step 7 is the only step that changes what the player sees,
and it is per-rig isolated.

## 5. Adding a module/upgrade — the runbook

1. Define the `ModuleId` + `ModuleDefinition` in `src/game/contracts.ts`:
   `promise` (a traversal-envelope consequence, never a cosmetic stat bump —
   ADR-0007 §4), `cost`, `fits`, optional `grantsCapability`, and
   `effects`/`offsets` bounded to the archetype envelope.
2. Add the visual form: `RIG_MODULE_FORMS[<id>]` (or
   `WHEEL_MOUNTED_MODULE_IDS` for wheel-hung modules). The completeness test
   fails the build if a buyable module has no visual — that is the point.
3. If the module should fit candidate rigs, extend their `fits` lists —
   today all six shipped modules fit only `utility-tractor` and `toy-buggy`
   (Observed; the biggest single upgrade-system gap, tracked in the
   expansion roadmap doc).
4. Gates: `npx vitest run src/game/rig-blockout.test.ts` (mount invariants,
   collision avoidance) and `node tools/rig-module-visual-acceptance.cjs`
   (rendered placement).
5. For sculptural modules, produce them through Lane B exactly like
   `field-plough-01` (attachment implement) and mount via the existing
   attachment contract.

---

## 6. Worked examples

### 6.1 The complete image→runtime proof: `field-plough-01`

The only object that has traveled every stage including GLB export. Its
workbench (`assets/workbench/field-plough-01/`) contains the canonical asset
definition, detail inventory, reference camera evidence, PBR texture set
(`pbr-painted-steel/*.png`), authored + generated factories, review captures
(v1–v11 comparison sheets), and the exported `assets/runtime/field-plough-01.glb`.
The renderer imports the authored factory for the plough attachment
(`src/game/renderer.ts:64`). This is the reference implementation of Lane B
and of review-driven form iteration.

### 6.2 The current rig frontier: `snow-crawler-expedition-01`

Stages complete (Observed): S0 (3 plates + manifest entries), S1
(`specs/snow-crawler-expedition-01.md` with full socket schema), S2 (profile,
7400 kg, 3.10 track / 3.80 wheelbase), S3 (silhouette + superstructure),
S4 Lane A (`authored/createSnowCrawlerModel.ts` + test — sage-green armor,
crawler tracks, thermal glow, V-plow with heated cutting edge). Stage not yet
done: S6 — the renderer still draws this rig through the generic blockout.
Its spec's socket schema (`ice-breaker-blade-01`, radar dome,
`heat-beacon-spotlight`, heated skid plate, `arctic-sled-hitch-01`) is the
authored input for future module expansion.

---

## 7. Verification command reference

```bash
npm run typecheck                     # tsc + kernel-probe typecheck
npx vitest run                        # full unit suite
npx vitest run src/game/rig-blockout.test.ts src/game/candidate-rigs-blockout.test.ts
npm run assets:preflight              # manifest schema/hash/license
npm run assets:rig-envelope           # derive/check rig asset envelopes
npm run test:ground-contact           # browser: rigs touch terrain
npm run test:browser                  # rig lab acceptance
node tools/rig-module-visual-acceptance.cjs
node tools/cross-rig-portrait-evidence.cjs
node tools/start-canonical-dev-server.cjs   # canonical dev surface (port 4173)
```

---

## 8. Honest state table (2026-08-17)

| Stage | State | Evidence |
|---|---|---|
| S0 plates + manifest | **Complete for all 16** (13 candidates × ~3 plates; launch rigs use exploration atlases) | `assets/generated/rig_concepts/` (26 files), 44 manifest entries |
| S1 specs | **Complete for 13 candidates**; launch rigs covered by progression/lab docs | `docs/design/rigs/specs/` (13 files) |
| S2 profiles | **Complete for 16** | `RIG_IDS`, `RIG_PROFILES`, passing blockout tests |
| S3 blockout | **Complete for 16** | `RIG_SILHOUETTES`, `RIG_SUPERSTRUCTURES`, passing tests |
| S4 Lane A factories | **Complete for 13 candidates + plough**, each with colocated tests | `assets/workbench/*/authored/create*Model.ts` (15) |
| S4 Lane B forge | **Proven once** (field-plough) with rig envelope checker ready | `tools/derive-img2threejs-spec.mjs` chain, `tools/rig-asset-envelope.ts` |
| S4 Lane C GenAI GLB | **Proposed only, 0 shipped** | research doc, paused per GD-13 |
| S5 gates | **Tooling complete**; per-rig evidence captured for launch rigs + plough | tools listed in §5 |
| S6 renderer wiring | **Frontier** — 3 bespoke + 13 generic blockout renders; 13 authored factories unwired | `renderer.ts` `createCandidateRig()` |
| S7 catalog | **Index truthful**; GLB runtime promotion only for plough + fixtures | `docs/design/rigs/README.md`, `assets/runtime/*.glb` |

**Gap 1 (next lever):** wire the 13 authored factories into the renderer,
one rig at a time, behind the S5 gates.
**Gap 2:** module fitment for candidate rigs (all six modules currently fit
only the two starter rigs).
**Gap 3:** variant generation (Layer 2 DNA seeds) and Lane C — both Proposed,
both gated on GD-13 (§9).

---

## 9. Decision boundaries (what this doc does and does not authorize)

- This document **describes and consolidates the proven pipeline**. It does
  not reopen paused scope: procedural variant generation, episode-grammar
  integration, and external GenAI lanes remain gated on
  **GD-13** ("Give procedural rig generation a named spine/ADR consumer",
  `docs/plans/NEXT_EXECUTION_BOARD_2026-08-12.md`), whose resume condition is
  GD-02/03/04 complete plus a drafted ADR in the sign-off queue.
- Load-bearing decisions in this doc (Two-Lane Contract, ratio-only
  authoring, GROUND frame) are **Observed as already-implemented code
  behavior**, restated as documentation — not new proposals.
- The expansion sequencing in the companion roadmap
  (`RIG_INVENTORY_EXPANSION_AND_UPGRADES_ROADMAP.md`) is **Proposed** until
  the operator accepts it.

---

## Linked artifacts

- [Rig Design Catalog & Index](README.md) — the 16-rig inventory table
- [Rig Design Specification System](RIG_DESIGN_SYSTEM.md) — the spec schema and 11 families
- [Inventory, Expansion & Upgrades Roadmap](RIG_INVENTORY_EXPANSION_AND_UPGRADES_ROADMAP.md) — waves, fitment matrix, variant layer
- [Asset Pipeline for Infinite Rigs](../../research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md) — Lane C landscape (paused)
- [Rig Generation for Infinite Possibilities](../../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md) — Layer 1/2/3 architecture (paused)
- [Asset Pipeline and Provenance Contract](../../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- `src/game/rig-blockout.ts` · `src/game/contracts.ts` · `src/game/rig-ids.ts`
- `tools/rig-asset-envelope.ts` · `tools/derive-rig-asset-envelope.ts` · `tools/derive-img2threejs-spec.mjs`
- `assets/workbench/field-plough-01/` — the end-to-end reference implementation
