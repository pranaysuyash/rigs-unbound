# Playtest SIM2 Synthesis — 2026-07-27

Status: **in progress** — explorer report complete; casual and achiever reports
pending.

| Persona | Status | Report | Screenshots |
| --- | --- | --- | --- |
| Explorer / systems tinkerer | ✅ complete | `docs/reviews/PLAYTEST_SIM2_EXPLORER_2026-07-27.md` | `artifacts/playtest2-explorer/` |
| Casual / relaxed browser player | ⏳ running | — | — |
| Achiever / optimizer | ⏳ running | — | — |

## Meta-note

The explorer agent discovered the live build was serving on **port 4180**, not
4174 as briefed. The casual and achiever agents may report the same. This
suggests either the dev server shifted or a second Vite process is running.
Whichever process produced the tested build, the SIM2 findings refer to that
runtime.

## Explorer headline

**Score: 7/10.** Strong systemic spine — terrain genuinely gates machines, the
gloaming is atmospheric, and the three-rig triangle feels distinct. Held back by
persistence regressions, missing feedback on interactables, and a hood camera
that hides the world.

## What worked (explorer)

| Finding | Evidence | Implication |
| --- | --- | --- |
| Terrain-decides thesis is real | Torque drowned in water Drift crossed at 32 km/h | Core promise is already playable |
| Contextual HUD warnings mean it | "Water is over the axles. Get out…" | Good diegetic feedback |
| Rig switching feels like carrying a garage | R swaps rigs, control bar rewrites per rig | Machine-family identity is working |
| GLOAM phase is atmospheric peak | Rust sky, headlights matter, home windows lit | Day/night tone transition is effective |
| Damage is positional and sticky | Condition drops from drowning survive reload | Consequence has weight |

## What failed / regressed (explorer)

| Finding | Severity | Likely owner | Notes |
| --- | --- | --- | --- |
| Save rollback while "Saved locally just now" shows | P0 | save/persistence lane | 5 salvage + objective chain reverted to 0 |
| Spawn into deep water on reload | P0 | save/recovery lane | Cost condition through no player action |
| Spawn position inconsistent across loads | P1 | save/recovery lane | home / X+35 / X−49 / X−101 |
| Ploughed furrow invisible before and after reload | P1 | terrain renderer / persistence | "Shape soft ground" tip promises visible change |
| Hood camera ~80% occluded by cab geometry | P1 | camera/renderer lane | Makes first-person driving unusable |
| Tutorial tips repeat every load; "Got it" doesn't stick | P1 | first-rung/guidance lane | Blocks lower-center view |
| Objective distance ping-pongs | P2 | guidance HUD | Reads as noise |
| "Take contract" / "explore" / jump produce no visible effect | P2 | verbs/feedback lane | Or feedback is invisible |
| Teal ring / orange ramp / ringed crate look interactable but aren't | P2 | set-dressing / affordance | Creates false promise |

## Comparison to SIM1 (placeholder)

SIM1 reports are at:

- `docs/reviews/PLAYTEST_SIM_EXPLORER_2026-07-25.md`
- `docs/reviews/PLAYTEST_SIM_CASUAL_2026-07-25.md`
- `docs/reviews/PLAYTEST_SIM_ACHIEVER_2026-07-25.md`

This section will be filled after casual and achiever SIM2 reports land, with a
focus on whether the first-rung/save-diagnostics tranche actually repaired the
issues SIM1 surfaced.

## Cross-persona risk register (pending)

The synthesis will cluster findings by:

1. **P0 — launch-blocking:** crashes, broken saves, unbeatable first rung.
2. **P1 — experience-breaking:** unclear progression, unusable camera, persistent
   world marks missing.
3. **P2 — polish / confusion:** repeated tips, invisible verbs, set-dressing
   affordance.
4. **Opportunity:** systemic strengths to protect and extend.

## Recommended next actions (pending full synthesis)

1. Wait for casual and achiever reports.
2. Compare SIM2 to SIM1 to measure whether the first-rung repair worked.
3. Route P0 save/spawn regressions to the parallel-owned persistence lane.
4. Route P1 furrow visibility and hood camera to the renderer lane.
5. Present the complete synthesis to the operator before starting Farmfall Phase A.

## Anything else?

Yes. The explorer found the build on port 4180, which means either the dev
server shifted during the session or the agent launcher needs to be updated. The
casual/achiever reports will confirm whether this is consistent.
