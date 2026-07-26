# Simulated Playtest Synthesis — three personas, one build

Date: 2026-07-25
Status: **synthesis accepted into evidence; feeds Farmfall Slice 01 scope**
Method: three uncontaminated agent-players (casual / achiever / explorer)
drove the live build at 127.0.0.1:4174 via Playwright with real input and
screenshot reading. No docs, source, or design context was given to them.
Reports: `PLAYTEST_SIM_CASUAL_2026-07-25.md`, `..._ACHIEVER_...`,
`..._EXPLORER_...` (same directory). ~180 screenshots under
`artifacts/playtest-*`.
Caveat (confidence honesty): these are AI-simulated players, not humans. Their
_language_ evidence is strong (uncontaminated, screenshot-grounded); their
_taste_ calibration is not human. A real external session remains open.

## 1. The recorded gate: PASSED

The standing question — "do players describe rigs as different fantasies or
just different speeds?" — is answered in the affirmative by all three:

| Rig    | Casual                     | Achiever                              | Explorer                                |
| ------ | -------------------------- | ------------------------------------- | --------------------------------------- |
| Torque | planted, lumbering, sturdy | planted, deliberate, stubborn, honest | earnest, stubborn, agricultural, honest |
| Spark  | twitchy, eager, fragile    | skittish, eager, reckless, brittle    | eager, skittish, slippery               |
| Drift  | floaty, slidy, ghostly     | (not reached)                         | (not reached — parked across water)     |

Independent personas converged on near-identical fantasy words, and all three
spontaneously described _job-based rig choice_ ("would pick different rigs per
job", "leaving the graded track is a decision", "weight, hills, water,
fragility all read within seconds"). Terrain genuinely differentiates rigs.
**This is the product's core bet, and it held.** Drift's reachability,
however, is a content bug (see B6), so hover evidence is thinner.

## 2. The blocking fun gap: the first rung is missing

All three personas failed the same way: **zero salvage banked** in 10–15+
minutes. Causes compound:

- The nearest salvage to spawn is across deep water the starting tractor
  cannot cross (casual, explorer — the explorer's Torque _drowned trying_).
- The pickup mechanic is never taught (achiever).
- Collection itself appears broken: the explorer drove to "1 m" and through
  crates with salvage staying 0 (B2 below — may be the whole story).

Consequence: the module/repair/economy loop — the game's entire progression
skeleton — never activated for any player. Every persona independently named
the same cure: one reachable first salvage + pickup confirmation + a guided
first job.

## 3. Scores and what moves them

- Casual: **4/10**, closes tab at ~6–8 min → ~7 with a guided first job.
- Achiever: **6/10** "would grind" → 8 with reachable first crate, pickup
  confirmation, records, wreck consequences.
- Explorer: **7/10** ("the valley is a 9") → 8–9 with crate economy, night
  cycle, and soft-lock fixed. "I still don't know how big the valley is, and
  it bothers me — I'd come back."

The build is one onboarding rung + one bug pass away from a 7–8 across
personas. That is an unusually cheap improvement curve.

## 4. Consolidated bug list (severity-ranked)

| #   | Bug                                                                                                                                               | Evidence                                      | Sev                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| B1  | **Title card re-opens over live gameplay** (Space — the primary action — re-summons it; sim keeps running, players drove to 33 km/h with it open) | all three personas                            | **P0**                                             |
| B2  | **Salvage crates uncollectable** (proximity 1 m + drive-through, count stays 0, compass re-targets)                                               | explorer; consistent with all three banking 0 | **P0**                                             |
| B3  | **Soft-lock**: drowned rig at 0% condition + 0 salvage = no escape; "Reset field" inert via clicks; only a fresh profile recovers                 | explorer; casual hit drowning too             | **P0**                                             |
| B4  | **Day/night derails**: clock jumped backward 22:27→11:51, then stuck at GLOAM; night never ended even at 06:15                                    | explorer                                      | **P0**                                             |
| B5  | **Hood camera broken/clips** inside rig geometry (black plane fills screen)                                                                       | casual (3 screenshots), explorer              | **P1**                                             |
| B6  | Drift unreachable at spawn (parked across water Torque can't ford); also climbs 320% grades — reads as a bug, not a feature                       | explorer, casual                              | P1                                                 |
| B7  | Physics Lab dev fixture exposed in player UI; button leads to stuck "RAPIER LOADING" black viewport                                               | achiever, casual                              | P1                                                 |
| B8  | fps/draw-call debug line visible in player HUD                                                                                                    | casual                                        | P2                                                 |
| B9  | Spawn camera blocked by silo wall on every reset                                                                                                  | achiever                                      | P2                                                 |
| B10 | Chase camera: no tree occlusion handling                                                                                                          | casual                                        | P2 (known: prop-aware occlusion is a recorded gap) |
| B11 | "B blade" (grading blade) appeared unannounced; signal verbs (TILL/HAUL/TOW/WADE/ASCEND/SHRINK) unexplained; Space's per-rig meaning unlabeled    | casual, explorer                              | P2 — onboarding/legibility                         |
| B12 | No records/best-times; "Local field record" HUD line looks like stats but is renderer telemetry                                                   | achiever                                      | P2                                                 |

Note: B2 and B12 partially explain the achiever's "no persistence" claim —
the explorer confirmed persistence **works** (world restored even a drowned
rig across reload). Achiever likely hit B2 (nothing to persist) or "Reset
field".

## 5. Persona-specific signals worth keeping

- **Explorer**: the world-memory systems are the delight engine — he
  photographed his own furrow scars, felled trees, the fog-of-war map,
  discovered the blade and Toy Grove unaided. "Alive as a system, empty as a
  place" is the exact niche Farmfall's ecology (threats, crops, dawn
  consequences) is designed to fill. Validated direction.
- **Achiever**: wants records/best-times/mastery ("number go up") — validates
  ADR-0018's vertical-power amendment and the Time Trial plan's per-circuit
  records.
- **Casual**: needs labeling and a first task, not more systems. The
  opportunity-compass concept (analysis doc §4.4) is the right shape: verbs
  in reach, explained.

## 6. Scope changes ratified into Farmfall Slice 01

Appended to `docs/plans/FARMFALL_SLICE_01_2026-07-25.md` as a scope revision:

1. **Phase 0 — playability repair (P0s first)**: B1–B4 fixed with regression
   tests before any new system; B5–B8 in the same pass where cheap.
2. **Onboarding rung added to Phase B**: one reachable first salvage near
   spawn, pickup confirmation feedback, per-rig action labeling, signal-verb
   explanations — the "guided first job" is satisfied by the day→night loop
   itself plus an opportunity hint.
3. The ecology/crops/mastery scope is unchanged — the playtests _validate_
   it: emptiness (explorer), missing stakes (casual), missing records
   (achiever) are exactly what threats/dawn/mastery address.

## Anything else?

Yes. Two meta-findings about the _testing_ itself: (1) all three agents
played for ~2 hours without wanting to stop, yet scored the game 4–7 — long
sessions were driven by _searching for the game_ inside the toy, not by the
game's loop; session length was a confusion metric here, not an engagement
metric. (2) The simulated-player method worked better than expected as a
bug-net — B1–B4 are real, reproducible-class defects that unit tests and the
acceptance script all missed, because every prior test knew how the game was
supposed to be played. Fresh-eyes simulation is now a proven lane in the
verification harness and should be repeated after Farmfall.

## Closure addendum — 2026-07-26

B1–B4 are closed in the local schema-v5 release candidate:

- B1: explicit entry state gates input and simulation; Space enters once,
  transfers focus, and then becomes the rig's primary action.
- B2: one authored cache is reachable from spawn, teaches the action, collects
  through the canonical affordance chain, and survives reload.
- B3: a condition-zero rig is immobile and exposes one non-rewarding,
  auditable Home Silo recovery through keyboard, visible mouse action, and
  touch.
- B4: one absolute world clock derives phase; day→gloam→night→dawn remains
  monotonic and persists through v4→v5 migration and reload.

Evidence: 108 root tests, seven kernel-probe tests, clean typecheck/format/build,
and Field 02 browser acceptance on development `4173` and rebuilt production
preview `4174`, with zero captured console/page errors. This does not close
B5–B12 or replace the required post-Farmfall simulated and human playtests.
