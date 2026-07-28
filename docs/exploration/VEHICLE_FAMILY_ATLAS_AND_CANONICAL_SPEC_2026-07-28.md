# Vehicle Family Atlas and Canonical Spec

Status: exploration / proposed contract; not a runtime implementation
Date: 2026-07-28
Owner: Rigs Unbound project
Related: [Long-Term Game Design From First Principles](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md), [Same-Vehicle Comparison Boards](SAME_VEHICLE_COMPARISON_BOARDS_2026-07-27.md), [Asset Pipeline and Provenance Contract](../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)

## Why this exists

The project is building a large, expressive fleet rather than a pile of
unrelated vehicle illustrations. The durable unit is therefore a **vehicle
family**: a locomotion and capability grammar that can produce multiple rigs,
attachments, states, scenes, and game-mode interpretations while preserving a
recognizable identity.

The image-generation atlas is an exploration instrument. It proposes visual
possibilities and exposes silhouette, hardpoint, material, and locomotion
questions. It is not a mesh, an orthographic package, a production manifest,
or a runtime authority.

## First-principles invariants

1. **Verb before silhouette.** A rig exists to perform meaningful verbs:
   cultivate, tow, rescue, carry, scout, build, defend, traverse, recover,
   or discover. A beautiful shape without a useful verb is a prop, not a
   playable rig candidate.
2. **Identity survives transformation.** A rig may change attachments,
   damage state, lighting, biome, or game mode without becoming a different
   vehicle by accident.
3. **Capability has a cost.** Every new locomotion permission, tool socket,
   cargo capacity, or defensive capability must introduce a tradeoff in mass,
   heat, fuel, visibility, handling, noise, maintenance, or opportunity.
4. **Reference and runtime remain separate.** Generated images are proposals;
   approved multi-view references and validated meshes are later artifacts.
5. **One spec, many outputs.** A family spec is the shared source for prompts,
   reference packages, mesh candidates, attachment sockets, physics envelopes,
   LOD targets, and mode variants. No image sheet becomes the canonical truth.
6. **Modes change meaning, not just color grading.** A tractor in farming,
   racing, survival, construction, or absurd discovery should change its
   verbs, constraints, risks, and player decisions—not only its backdrop.
7. **Player readability wins.** When atmosphere, detail, or procedural variety
   competes with silhouette, attachment readability, or navigation, simplify
   the presentation before weakening the player’s understanding.

## Family registry

| Family | Core verbs | Locomotion envelope | Candidate game roles | Reference status |
|---|---|---|---|---|
| Farm / field | cultivate, seed, harvest, irrigate, tow | wheeled, tracked, marsh hybrid | farming, trade, restoration, racing | active |
| Utility / tow | repair, tow, recover, carry, bridge | wheeled, tracked, articulated | service, salvage, construction, rescue | active |
| Rescue / emergency | reach, stabilize, evacuate, illuminate, supply | wheeled, tracked, aquatic hybrid | disaster response, escort, co-op rescue | active |
| Construction / salvage | lift, cut, brace, demolish, reclaim | wheeled, tracked, crane hybrid | building, ruins, economic recovery | active |
| Scout / courier | discover, map, deliver, evade, signal | wheeled, bike, hover, light flight | exploration, time trials, relay | proposed |
| Hauler / logistics | load, route, convoy, trade, provision | wheeled, tracked, aquatic | economy, convoy, settlement growth | proposed |
| Amphibious / water | ferry, dredge, skim, pump, recover | aquatic, wheeled-aquatic, hover | flood, marsh, river, coast | active |
| Extreme terrain | climb, anchor, survive, tunnel, traverse | snow, dune, vertical, hybrid | expedition, survival, discovery | active |
| Aerial / orbital | lift, survey, dock, deploy, retrieve | VTOL, balloon, orbital | high-altitude, launch, zero-g | active |
| Defense / warding | protect, distract, barricade, clear, escort | wheeled, tracked, modular | night defense, zombie tiers, faction conflict | proposed |
| Civic / absurd | perform, parade, improvise, reveal, delight | any family substrate | festivals, myths, toyscale, surreal events | proposed |

The registry is intentionally broader than the current runtime. “Active” means
there is an image/reference exploration lane, not that the family is playable.

## Current generated tranche

| Asset | What it explores | Intended next use |
|---|---|---|
| [utility-tow-lineup-2026-07-28.png](assets/vehicle-family-atlas-2026-07-28/utility-tow-lineup-2026-07-28.png) | mechanic van, tow boom, tracked recovery, flatbed, service cart, inspection crane | isolate the tow rig and recovery crawler; define winch, boom, cargo, and stabilizer sockets |
| [rescue-emergency-lineup-2026-07-28.png](assets/vehicle-family-atlas-2026-07-28/rescue-emergency-lineup-2026-07-28.png) | ambulance, flood boat, mountain crawler, water tender, clinic bus, search rover | compare response roles; remove accidental real-world markings before any public-facing reuse |
| [extreme-aspiration-lineup-2026-07-28.png](assets/vehicle-family-atlas-2026-07-28/extreme-aspiration-lineup-2026-07-28.png) | snow crawler, dune sail hauler, marsh skimmer, VTOL, sky barge, orbital tug | choose one grounded extreme rig and one aspirational rig for isolated reconstruction tests |

### First isolated candidate

[utility-tow-recovery-candidate-01-2026-07-28.png](assets/vehicle-family-atlas-2026-07-28/utility-tow-recovery-candidate-01-2026-07-28.png) is the first isolated candidate. Its provisional stable ID is `utility_tow_recovery_01`.

It has useful reconstruction affordances: a single complete silhouette,
front tow eyes, a rear winch, a folded boom, cab mass, side tool drawers, two
axles, and a clear neutral background. It is still not sufficient for mesh
admission because exact scale, rear/side/top views, socket coordinates,
underbody geometry, wheel pivot conventions, and material IDs are unknown.

All three are concept/reference only. They are not approved runtime assets.

## Canonical vehicle-family record

Every family candidate should eventually be representable by a versioned record
like this. The field names are proposed and must not be treated as implemented
runtime contracts until an ADR and code path adopt them.

```yaml
family_id: utility_tow
revision: 0.1
status: proposed
identity:
  silhouette: compact cab, exposed service rails, rear recovery spine
  persistent_features: [cab-window shape, front tow eyes, rear spine]
  palette: [weathered teal, cream, oxidized orange]
verbs: [repair, tow, recover, carry, inspect]
locomotion:
  primary: wheeled
  alternates: [tracked]
  environments: [road, soil, rubble, shallow_water]
capabilities:
  sockets: [front_tool, rear_winch, top_crane, cargo_bed, beacon]
  cargo: medium
  crew: solo_or_companion
tradeoffs:
  strengths: [pulling_power, repair_access, modularity]
  weaknesses: [turning_radius, heat, noise, slow_reverse]
physics_envelope:
  mass_class: medium
  axle_count: 2
  steering: front_or_articulated
  suspension: reinforced
  rollover_risk: medium
presentation:
  camera_roles: [chase, work_close, tactical_overhead, workshop]
  animation_roles: [boom_raise, winch_pull, stabilizer_deploy, beacon_spin]
asset_pipeline:
  reference_views: [beauty, front, side, rear, top]
  mesh_targets: {high: 30000, medium: 12000, low: 3000}
  collision: convex_compound
  approval_gates: [reference_admission, mesh_validation, runtime_budget, browser_proof]
```

## Mode/use-case diff model

The same family should be evaluated across modes using a structured diff:

| Diff axis | Farming | Racing | Survival / zombie tiers | Construction / salvage | Absurd / discovery |
|---|---|---|---|---|---|
| Primary verb | cultivate | route and corner | illuminate, escape, defend | lift, brace, reclaim | reveal, improvise, delight |
| Valuable stat | soil care and reliability | acceleration and handling | light reach, noise, fuel | torque, stability, socket capacity | surprise and interaction affordance |
| Failure cost | crop loss, time | position, condition | health, fuel, shelter | collapse, debt, lost materials | opportunity and reputation |
| Attachment emphasis | plow, seeder, trailer | aero kit, slicks, ballast | floodlights, cage, decoy, weapon mount subject to design review | crane, winch, breaker, scaffold | parade rig, impossible tool, signal device |
| Lighting | warm work lamps | readable track markers | darkness is a resource problem; progressive tiers demand better coverage | work lamps and dust readability | theatrical reveal with readable navigation |
| Camera | work close and isometric | chase and corner anticipation | low visibility tactical and rear-threat awareness | overhead placement and attachment clearance | authored set-piece plus free exploration |
| World relationship | improves land | masters a route | protects a fragile route or shelter | changes the physical world | changes what the player believes is possible |

This table is a design test, not a promise that every mode ships. A candidate
that only changes paint, props, or weather fails the same-vehicle test.

## Reference-to-mesh admission path

```text
family spec
  -> generated lineup exploration
  -> candidate selection and visual diff
  -> isolated single-view reference
  -> multi-view / scale / socket package
  -> img2threejs reconstruction candidate
  -> topology, UV, material, collision, animation validation
  -> runtime manifest admission
  -> browser proof and budget evidence
```

The next meaningful artifact for a selected candidate is not another lineup.
It is an isolated reconstruction-ready package with explicit dimensions,
functional parts, material callouts, socket locations, and an uncertainty log.

## Discussion carried forward

- The earlier “reference versus shipped mesh” discussion remains valid: a mesh
  can become canonical after validation, but an unvalidated generated mesh is
  not automatically trustworthy.
- A high-level vehicle DNA/spec remains useful for playable vehicles because
  gameplay, physics, upgrades, damage, attachment points, and animation extend
  beyond geometry.
- Static props may later use a validated mesh as their canonical asset; this
  registry is intentionally stricter for interactive rigs.
- Absurdity is welcome when it creates a new decision or expressive verb. It
  is not a reason to abandon scale, collision, readability, or provenance.

## Open decisions and closure criteria

1. Select one utility/tow candidate and one extreme candidate for isolated
   reference packages. Closure: named candidates, stable IDs, and accepted
   persistent features.
2. Decide whether response markings are wholly fictional or whether real-world
   symbols are excluded from public-facing art. Closure: provenance and visual
   policy note.
3. Define the first runtime bridge schema for family/spec records. Closure:
   ADR, source-of-truth location, validation, and migration/replacement path.
4. Decide whether weaponized survival variants belong in the same family or a
   separate defense family. Closure: verb/tradeoff analysis and player-facing
   content boundary.
5. Complete `utility_tow_recovery_01` as a reconstruction package. Closure:
   front/side/rear/top views, dimensions, socket map, material callouts,
   uncertainty log, and `img2threejs` intake checks.

## Anything else?

Yes. The atlas needs negative space and failure examples as much as hero rigs:
broken winches, overloaded cargo, blocked lights, bogged tracks, damaged
attachments, and visually confusing silhouettes should be generated later as
validation fixtures. That will keep the pipeline grounded in recoverability
and gameplay readability instead of only aspirational beauty shots.

## Update log

### 2026-07-28 — family tranche added

- Added three generated reference sheets for utility/tow, rescue/emergency,
  and extreme/aspiration families.
- Added the family registry, canonical proposed spec, mode-diff model, and
  image-to-mesh admission path.
- Recorded all output as concept/reference-only; no runtime code or manifest
  changed.
- Three-pass review: Pass 1 checked visual coverage and distinct silhouettes;
  Pass 2 checked separation of family spec, references, meshes, and runtime;
  Pass 3 checked provenance, uncertainty, and the “Anything else?” sweep.
- Selected `utility_tow_recovery_01` and generated one isolated candidate view;
  it passes visual intake review but remains below multi-view admission.
