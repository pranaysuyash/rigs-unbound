# ADR-0026: Cultivation provenance and schema-v7 ownership

- Date: 2026-07-26
- Status: **Proposed — operator sign-off required before crop implementation**
- Decision owner / next reviewer: project owner
- Related: ADR-0007, ADR-0018, RU-0203, RU-0405, Reclamation proposal

## Context

The Farmfall plan says crops derive from plough deformation and migrate into
save schema v6. Current code makes both assumptions unsafe:

- the runtime is already schema v6;
- terrain deformation records height delta but not the verb that caused it;
- legacy `FurrowMark` does not record cut versus fill;
- cut and fill both create furrow marks;
- Long Furrow is authored with a `tilled` surface, so surface identity alone
  does not prove player cultivation;
- Reclamation proposes route grading and fill as first-class terrain verbs.

Inferring crop eligibility from negative height, a furrow mark, or a `tilled`
surface would make grading/fill accidentally sowable and would create a second
interpretation of terrain history.

## Proposed decision

### One semantic soil-preparation ledger

Terrain remains the sole height/material authority. `GameWorld` gains one
bounded semantic ledger on the same terrain-cell lattice that records only
accepted cultivation-cut events.

- plough cut may prepare a cell;
- fill, route grading, generic deformation, and authored `tilled` surfaces do
  not;
- crop state never erases deformation or furrow history;
- legacy saves start with an empty preparation ledger because provenance cannot
  be reconstructed honestly.

### One bounded crop map

The first proof uses one authored 24–32-cell plot and one crop type. A live
entry stores:

```text
cell coordinates
crop id
sownAtWorldMinute
```

Growth stage is derived from monotonic `worldTimeMinutes`, not updated every
fixed step. Admission rejects over-cap sowing; it never silently evicts an old
crop.

### Contextual actions

`sow-crop` and `harvest-crop` extend the existing semantic primary-action
command/event lane. Eligibility is based on capability, prepared soil, current
terrain, stability, range, blade state, occupancy, and maturity—never a rig ID
or a dedicated keyboard shortcut.

### Persistence

Cultivation claims schema v7 with an explicit v6→v7 migration. The current v6
key remains the rollback source. Later mastery, threats, and dawn records either
extend the accepted v7 design before release or use v8; they must not silently
reuse incompatible assumptions.

## Decisions still required

1. **Sequencing:** Farmfall cultivation now, Reclamation terrain-authorship
   proof first, or Unbound Passage first.
2. **Harvest value:** contract outcome, physical produce, or another explicit
   non-duplicate value path. Do not silently create currency or convert crops
   into Scrap.
3. **Post-sow terrain change:** whether fill/cut destroys, suspends, or merely
   blocks growth/harvest.
4. **Capacity and timing:** measured first-proof bounds and world-minute
   maturity thresholds.

## Acceptance contract

- cut prepares; fill/grading/authored surface/legacy furrows do not;
- duplicate/full/immature/unstable/out-of-range actions reject with stable
  reason codes;
- growth uses monotonic world time and cannot be exploited by free phase
  cycling;
- v6 migrates with empty cultivation provenance and all earlier world memory
  intact;
- malformed crop entries recover individually;
- replay hashes and semantic action outcomes remain deterministic;
- rendering is instanced and dirty-revision driven;
- keyboard and real touch complete plough→raise→sow→mature→harvest;
- desktop/narrow layouts add contextual feedback, not permanent HUD clutter;
- save bytes, draw calls, step time, and console/page errors are measured.

## Anything else?

Yes. A crop is not just a green mesh on a furrow. The durable decision is who
owns the fact that soil was prepared, how that fact survives Reclamation-style
terrain authorship, and what a harvest means to the existing economy.
