# Rig Inventory, Expansion & Upgrades Roadmap

**Date:** 2026-08-17
**Status:** Proposed — execution sequencing for operator review; nothing here
is Accepted or started. This doc gives the paused procedural-generation work
(`RIG_GENERATION_*` research, board item GD-13) the named consumer it was
missing, without reopening implementation before the gate clears.
**Evidence tier:** Tier 1 (static inspection). Current-state claims are
**Observed**; all waves/goals are **Proposed**.
**Companion:** [`RIG_PRODUCTION_PIPELINE.md`](RIG_PRODUCTION_PIPELINE.md) —
the stage-by-stage production reference this roadmap sequences.

---

## 1. Where the inventory stands today (Observed)

| Layer | Count | Truth |
|---|---|---|
| Rig identities | 16 | `RIG_IDS` in `src/game/rig-ids.ts` |
| Families represented | 11 of 11 authored families | `RIG_DESIGN_SYSTEM.md` §4; catalog README |
| Runtime-bespoke rigs | 3 | tractor, buggy, skimmer (bespoke renderer builders) |
| Blockout-rendered candidate rigs | 13 | `renderer.ts` `createCandidateRig()` |
| Authored model factories (unwired) | 13 | `assets/workbench/*/authored/create*Model.ts` |
| Reference plates | 26 PNGs, all manifest-registered | `assets/generated/rig_concepts/` |
| Design specs | 13 | `docs/design/rigs/specs/` |
| Upgrade modules | 6, fitting **2** rigs | `MODULES` in `src/game/contracts.ts` — every `fits` list is `["utility-tractor", "toy-buggy"]` |
| Socket schemas authored in specs | ~13 × 6 sockets | every spec's §2 hardpoint table — none realized as modules yet |
| GLB runtime rigs | 0 (plough attachment + fixtures only) | `assets/runtime/*.glb` |

Read plainly: **the form library is nearly complete for wave-zero of the
inventory; the wiring and the upgrade economy are where "full-blown" is won
or lost.** Thirteen rigs have images, specs, profiles, blockouts, and authored
3D models — and render as generic boxes, can buy nothing, and bolt on nothing.

---

## 2. The expansion waves (Proposed)

Sequenced so every wave ships player-visible value, uses only proven pipeline
lanes (Lane A/B of the production pipeline doc), and leaves the paused
Layer-2/3 research untouched until GD-13 clears.

### Wave 1 — Light up the shelf: wire the authored rigs (S6 completion)

**Goal:** each of the 13 candidate rigs renders through its authored factory
instead of the generic blockout.

- Per rig: import the workbench factory into the renderer's construction
  path, mount through the existing GROUND-frame + `groundFrameOffsetY`
  contract, feed it blockout-derived dimensions (Two-Lane Contract), then run
  the S5 gates (`assets:rig-envelope`, `test:ground-contact`, rig-lab
  acceptance, cross-rig portraits, reduced-motion evidence).
- The runbook is §4 of the production pipeline doc, entering at step 7.
- Rigs can be promoted in any order; each is isolated. A sensible order is
  one family at a time so the cross-rig portrait sheets stay comparable.
- **Exit evidence:** 13/13 rigs render authored models; full unit suite +
  browser acceptances green; per-rig review captures in workbench `review/`.

### Wave 2 — Make upgrades real: the module fitment matrix

**Goal:** every rig can buy and show modules; the garage promise ("I bought
something" is visible) holds fleet-wide.

1. **Fitment pass (contracts):** extend `MODULES[*].fits` from the two
   starter rigs to the candidates where the module is physically and
   fictionally right (skid plates and winches are near-universal; pontoons
   fit ground rigs; the hover rigs need their own pool — see step 2).
2. **Realize one spec socket per rig (first slice):** each spec's §2 socket
   table already names signature equipment (snow crawler:
   `ice-breaker-blade-01`, radar dome, heated skid plate; tow rig: rotating
   boom + spooled winch; sentinel: shield wall). Pick one per rig, define it
   as a `ModuleDefinition` + `RIG_MODULE_FORMS` entry, and let the existing
   completeness/collision tests + `rig-module-visual-acceptance.cjs` gate it.
3. **Anchor anchor-types:** track rigs (snow crawler, excavator, sentinel)
   need a shared "track visual" treatment in the blockout (their locomotion
   class is caterpillar; today they render wheels). This is a blockout-level
   form decision, ratio-authored, test-covered the same way hover skirts are.
4. **Hover module pool:** pontoons/fans rigs get their own category
   (buoyancy thrusters, dredge arm, sonar mast) so `fits` stays honest.
- **Exit evidence:** fitment matrix documented in this file (§4); every
  buyable module renders on every rig that can buy it; module-visual
  acceptance green across the roster.

### Wave 3 — Variant layer (gated on GD-13)

**Goal:** seed-derived variants within archetypes (the Layer 2 `RigDNA` of
`RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md`).

- Remains **Proposed and paused**. Gate: GD-13's resume condition (GD-02/03/04
  `[x]` + drafted ADR in the sign-off queue). The technical hook is already
  shaped for it: `EffectiveRig` composition (`composeRigEffectiveProfile`)
  already derives runtime handling from blueprint + installed modules, so a
  seed-derived blueprint delta composes through the same pure path.
- First proof slice when unpaused: the revised slice from the research doc
  (one archetype, one seed variant, two contexts, one reinterpretation, one
  save/load round-trip) — *not* a mesh-generation project. Variants re-use
  the same factories with seed-scaled ratios (the ratio-only authoring rule
  is what makes this cheap: scale the profile, the form follows).

### Wave 4 — Family growth and Lane C (gated)

- New archetypes beyond the 11 families and external GenAI GLB production
  (Tripo/Meshy/Rodin, per `ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md`)
  stay Proposed behind the same GD-13 gate. The pipeline doc's Lane C
  decision rule and the manifest/preflight/envelope gates are the entry
  contract for any first use.

---

## 3. Upgrade system: from 6 modules to a real catalog (Proposed design space)

The shipped module contract is deliberately narrow and high-quality
(Observed): six modules, each a *traversal-envelope* consequence with a
promise sentence, bounded effects, optional capability grant. Expansion
should preserve those properties. The spec socket tables are the authored
seed pool — realized per family they give a first catalog of roughly:

| Family (example rig) | Signature modules named in specs (Observed source) | Candidate verbs |
|---|---|---|
| Snow Crawler | ice-breaker blade (heated), radar dome + heat-beam spotlight, heated skid plate, arctic sled hitch | thaw, ice-break, deep-snow tow |
| Heavy Utility Tow | rotating boom crane, spooled winch, outriggers, beacon | hoist, recover |
| Harvester | grain tank, cutter header, straw chopper | harvest, cultivate |
| Sentinel | shield wall, spotlight tower, turret mount | fortify, defend |
| Construction | excavator arm, stabilizer legs, drill mast | dig, grade |
| Marsh | dredge arm, sonar mast, buoyancy thrusters | dredge, ford |
| Aero | tilt-rotor tuning, cargo clamp, survey pod | airlift, survey |
| Hauler | fifth-wheel hitch, aux fuel tank, spare-tire rack | haul, range |
| Micro-Scout | sensor boom, line-reel, magnet foot | inspect, thread |
| Spark | roll cage, aero kit, jump jets (spec-named) | jump, race |
| Torque | dual-rear lug pack, ballast weights, hitch | pull, plough |

Rules for turning any of these into a real module (from the production
pipeline §5 runbook): traversal/legibility consequence first (`promise`),
bounded `effects`/`offsets`, honest `fits`, visual form in
`RIG_MODULE_FORMS` or via Lane B for sculptural parts, acceptance gates green.
Module *tiers* (mark-I/II/III) are **not** proposed — the design spine's
progression is capability-shaped, not stat-shaped; revisit only with a spine
change.

---

## 4. Fitment matrix (to be filled by Wave 2; empty = today's Observed state)

| Module | tractor | buggy | skimmer | 13 candidates |
|---|---|---|---|---|
| low-range-gearing | ✅ | ✅ | — | none |
| lug-tires | ✅ | ✅ | — | none |
| winch | ✅ | ✅ | — | none |
| survey-mast | ✅ | ✅ | — | none |
| skid-plate | ✅ | ✅ | — | none |
| flotation-pontoons | ✅ | ✅ | — | none |

*(Wave 2 replaces this table with the realized matrix; keep it truthful to
`MODULES[*].fits` at all times — this table is documentation, the contract is
truth.)*

---

## 5. Inventory & catalog governance

- The **catalog index** (`docs/design/rigs/README.md`) is the human inventory
  surface; statuses must name the real stage (`Runtime Implemented`,
  `Authored / Wiring Pending`, …) rather than aspirational labels.
- The **manifest** is the machine inventory for artifacts; reference plates
  never become runtime entries without the public promotion package
  (`PUBLIC_ASSET_PROMOTION_WORKFLOW_FOR_FIRST_RUNTIME_BRIDGE_CANDIDATE_2026-07-28.md`).
- New-family proposals (Wave 4) enter through `RIG_DESIGN_SYSTEM.md`'s
  authoring path, not by extending this roadmap's scope.

---

## 6. Relationship to paused research (the GD-13 answer)

GD-13 asked for "a named spine/ADR consumer" before procedural rig
generation work resumes. This roadmap is that consumer, stated as demand:

- **Waves 1–2** consume only proven lanes and existing contracts — no new
  architecture, no research-doc license needed. They can proceed under the
  normal board as ordinary implementation slices.
- **Waves 3–4** are the procedural-generation scope. When the gate clears,
  the ADR that resumes them should reference this roadmap's Wave 3/4 exit
  criteria as its acceptance shape, and the research docs stay the design
  source rather than becoming implicit implementation authority.

---

## Linked artifacts

- [Rig Production Pipeline](RIG_PRODUCTION_PIPELINE.md) — stage reference, runbooks, gates
- [Rig Design Catalog & Index](README.md)
- [Rig Generation for Infinite Possibilities](../../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md) (paused)
- [Asset Pipeline for Infinite Rigs](../../research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md) (paused)
- [Next Execution Board 2026-08-12](../../plans/NEXT_EXECUTION_BOARD_2026-08-12.md) — GD-13 item
- `src/game/contracts.ts` (`MODULES`, `RIG_PROFILES`, `EffectiveRig`)
