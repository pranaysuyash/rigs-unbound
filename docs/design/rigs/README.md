# Rig Design Catalog & Index

**Canonical repository directory for all authored rig designs, physical profiles, module schemas, and visual turnarounds in *Rigs Unbound*.**

**Production references:**

- [`RIG_PRODUCTION_PIPELINE.md`](RIG_PRODUCTION_PIPELINE.md) — the canonical
  stage-by-stage path from image reference plate to runtime rig (S0–S7), the
  Two-Lane Contract (FORM from image, DIMENSIONS from `RIG_PROFILES`), the
  three model-production lanes, per-stage gates, and the adding-a-rig /
  adding-a-module runbooks.
- [`RIG_INVENTORY_EXPANSION_AND_UPGRADES_ROADMAP.md`](RIG_INVENTORY_EXPANSION_AND_UPGRADES_ROADMAP.md) —
  where the inventory stands today, the expansion waves (wire authored rigs →
  module fitment → variants → families), and the upgrade-module design space.

---

## Catalog Status Overview (16 Rigs Across 11 Vehicle Families)

| Rig ID | Rig Name | Family | Locomotion | Status | Spec Document | Concept Asset |
|---|---|---|---|---|---|---|
| `utility-tractor` | Torque-70 Utility Tractor | Torque | Ground Wheels (4x4) | Runtime Implemented | [Torque Profile](../../systems/VEHICLE_PROGRESSION.md) | [Model Sheet](../../exploration/assets/design_explorations/tractor_character_model_sheet_2026-07-25.png) |
| `toy-buggy` | Spark Scout Buggy | Spark | Ground Wheels (4x4) | Runtime Implemented | [Spark Spec](../../plans/RIG_LAB_01_2026-07-25.md) | [Buggy Ref](../../exploration/assets/vehicle-reference-atlas-2026-07-26/utility-service-lineup.png) |
| `marsh-skimmer` | Marsh Skimmer 01 | Marsh Skimmer | Amphibious Pontoons | Runtime Implemented | [Marsh Skimmer Spec](../../plans/MARSH_SKIMMER_01_2026-07-25.md) | [Skimmer Ref](../../exploration/assets/vehicle-family-atlas-2026-07-28/utility-tow-lineup-2026-07-28.png) |
| `heavy-utility-tow-recovery-01` | Heavy Utility Tow & Recovery Rig | Heavy Utility Tow | Ground Wheels (6x6) | Spec Locked / Authored (Wiring Pending) | [Spec](specs/heavy-utility-tow-recovery-01.md) | `assets/generated/rig_concepts/heavy_utility_tow_recovery_01_concept.png` |
| `heavy-salvage-crane-02` | Heavy 8x8 Salvage Crane Rig | Heavy Utility Tow | Ground Wheels (8x8) | Spec Locked / Authored (Wiring Pending) | [Spec](specs/heavy-salvage-crane-02.md) | `assets/generated/rig_concepts/heavy_salvage_crane_02_concept.png` |
| `snow-crawler-expedition-01` | Sub-Zero Expedition Snow Crawler | Snow Crawler | Caterpillar Tracks | Spec Locked / Authored (Wiring Pending) | [Spec](specs/snow-crawler-expedition-01.md) | `assets/generated/rig_concepts/snow_crawler_expedition_01_concept.png` |
| `harvester-combined-cultivator-01` | Harvester & Combined Cultivator | Harvester | Ground Wheels (Asymmetric) | Spec Locked / Authored (Wiring Pending) | [Spec](specs/harvester-combined-cultivator-01.md) | `assets/generated/rig_concepts/harvester_combined_cultivator_01_concept.png` |
| `sentinel-mobile-fort-01` | Sentinel Mobile Fortification Crawler | Sentinel | Quad-Track Crawler | Spec Locked / Authored (Wiring Pending) | [Spec](specs/sentinel-mobile-fort-01.md) | `assets/generated/rig_concepts/sentinel_mobile_fort_01_concept.png` |
| `aero-skimmer-survey-01` | Aero-Skimmer High-Altitude Rig | Aero-Skimmer | Twin Directional Fans | Spec Locked / Authored (Wiring Pending) | [Spec](specs/aero-skimmer-survey-01.md) | `assets/generated/rig_concepts/aero_skimmer_survey_01_concept.png` |
| `aero-cargo-freighter-02` | Aero Heavy Tilt-Rotor Cargo Skimmer | Aero-Skimmer | Quad Tilt-Rotors | Spec Locked / Authored (Wiring Pending) | [Spec](specs/aero-cargo-freighter-02.md) | `assets/generated/rig_concepts/aero_cargo_freighter_02_concept.png` |
| `torque-field-cutter-02` | Torque Heavy Field Cultivator | Torque | Ground Wheels (Dual Rear) | Spec Locked / Authored (Wiring Pending) | [Spec](specs/torque-field-cutter-02.md) | `assets/generated/rig_concepts/torque_field_cutter_02_concept.png` |
| `spark-dune-runner-02` | Spark Desert Dune Runner | Spark | Ultra-Light 4x4 Buggy | Spec Locked / Authored (Wiring Pending) | [Spec](specs/spark-dune-runner-02.md) | `assets/generated/rig_concepts/spark_dune_runner_02_concept.png` |
| `marsh-dredger-heavy-02` | Marsh Heavy Dredger Hovercraft | Marsh Skimmer | Quad Air-Pontoons | Spec Locked / Authored (Wiring Pending) | [Spec](specs/marsh-dredger-heavy-02.md) | `assets/generated/rig_concepts/marsh_dredger_heavy_02_concept.png` |
| `hauler-road-train-01` | Hauler Highway Cargo Rig | Hauler | Ground Wheels (6x4) | Spec Locked / Authored (Wiring Pending) | [Spec](specs/hauler-road-train-01.md) | `assets/generated/rig_concepts/hauler_road_train_01_concept.png` |
| `construction-excavator-01` | Construction Earthmover Excavator | Construction Earthmover | Caterpillar Tracks | Spec Locked / Authored (Wiring Pending) | [Spec](specs/construction-excavator-01.md) | `assets/generated/rig_concepts/construction_excavator_01_concept.png` |
| `micro-scout-pipe-crawler-01` | Micro-Scout Pipe & Duct Crawler | Micro-Scout Toy Rover | 6-Wheel Micro Rover | Spec Locked / Authored (Wiring Pending) | [Spec](specs/micro-scout-pipe-crawler-01.md) | `assets/generated/rig_concepts/micro_scout_pipe_crawler_01_concept.png` |

---

## Design Guidelines & Standards

Before authoring a new rig design specification, read:
1. [`RIG_DESIGN_SYSTEM.md`](RIG_DESIGN_SYSTEM.md) — The schema and rules for rig DNA, physical parameters, hardpoints, and subassembly breakdowns.
2. [`DESIGN.md`](../../../DESIGN.md) — Patchwork Atlas visual direction, material rules, and aesthetic standards.
3. [`RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md`](../../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md) — Layer 1 (Archetype DNA) and Layer 2 (Procedural Variant Generation) architecture.

---

## Adding New Rigs to the Catalog

The complete, gate-ordered runbook (reference plates → spec → profile →
blockout → authored model → acceptance → renderer wiring → catalog/manifest
registration) is [`RIG_PRODUCTION_PIPELINE.md`](RIG_PRODUCTION_PIPELINE.md) §4.
In short:

1. Generate and manifest-register the reference plates (S0).
2. Author the spec in `docs/design/rigs/specs/<rig-id>.md` (S1).
3. Extend `RIG_IDS` / `RIG_PROFILES` and the blockout ratio tables (S2–S3).
4. Author the model factory in `assets/workbench/<rig-id>/authored/` (S4),
   pass the acceptance gates (S5), wire it into the renderer (S6), and update
   this index with a truthful status (S7).
