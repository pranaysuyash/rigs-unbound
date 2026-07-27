# Playtest SIM2 Synthesis — 2026-07-27

Status: **in progress** — explorer and achiever reports complete; casual report
pending.

| Persona | Status | Report | Screenshots |
| --- | --- | --- | --- |
| Explorer / systems tinkerer | ✅ complete | `docs/reviews/PLAYTEST_SIM2_EXPLORER_2026-07-27.md` | `artifacts/playtest2-explorer/` |
| Achiever / optimizer | ✅ complete | `docs/reviews/PLAYTEST_SIM2_ACHIEVER_2026-07-27.md` | `artifacts/playtest2-achiever/` |
| Casual / relaxed browser player | ⏳ running | — | — |

## Meta-note: three different ports

Each agent found a different live port:

| Agent | Port found | Brief said |
| --- | --- | --- |
| Explorer | 4180 | 4174 |
| Achiever | 4173 | 4174 |
| Dev server task | 4174 | 4174 |

This means multiple Vite processes are running on the machine and the agents are
connecting to whichever one responds. The SIM2 reports therefore describe
**different runtime instances**, which may explain some of the contradictions
below. The casual report will add a third data point.

## Headline scores

- **Explorer: 7/10** — world-I-want-more-of; held back by persistence
  regressions and missing feedback.
- **Achiever: 6/10** — would-grind; held back by a session-dominating map-modal
  loop, a stuck quest rung, and undiscoverable interactions.

## What both personas confirm is working

| Finding | Explorer | Achiever | Implication |
| --- | --- | --- | --- |
| Terrain genuinely gates machines | Torque drowned, Drift crossed same water | Three rigs feel meaningfully different per job | Core promise is playable |
| Rig switching works | R + context bar rewrite | R + distance pointer | Machine-family identity is coherent |
| Day/night tone shift | GLOAM is atmospheric peak | Did not reach night | GLOAM is a real strength |
| Earn→spend loop | Save rollback hid it | Lug tyres bought and persist | Loop is real when persistence works |

## Contradictions that need investigation

| Topic | Explorer | Achiever | Likely explanation |
| --- | --- | --- | --- |
| Save persistence | 5 salvage + objectives rolled back | Lug tyres persist across reloads | Different builds/ports or different save paths |
| Furrow visibility | No visible furrow before/after reload | 211 furrows persist on field map | Different renderer branch or save state |
| Port | 4180 | 4173 | Multiple running Vite processes |
| Hood/chase camera | Hood ~80% occluded | Chase occluded by silo | Both camera issues, different modes |

These contradictions mean we cannot treat SIM2 as a single validated run yet.
The casual report and a clean single-port rerun are needed before routing fixes.

## What failed / regressed (combined)

| Finding | Severity | Owner | Notes |
| --- | --- | --- | --- |
| Field map auto-reopens ~1 s after closing | **P0** | input/map lane | Session-dominating for achiever |
| "Lower the blade" rung never completes despite furrows | **P0** | first-rung lane | Blocks achiever progression; may relate to first-rung test regression |
| Save rollback / inconsistent persistence | P0/P1 | save/persistence lane | Explorer hit rollback; achiever did not |
| Spawn into deep water / inconsistent spawn | P1 | save/recovery lane | Explorer only |
| Hood camera occluded by cab | P1 | camera/renderer lane | Explorer only |
| Chase camera occluded by silo | P1 | camera/renderer lane | Achiever only |
| Tutorial tips repeat; "Got it" doesn't stick | P1 | first-rung/guidance lane | Explorer |
| Welcome panel perf probe never finishes | P1 | boot/metrics lane | Achiever |
| Workshop buy is blind (no catalog/prices) | P1 | economy/UI lane | Achiever |
| Cargo hook-up undiscoverable | P1 | verbs/feedback lane | Achiever |
| Objective distance ping-pongs | P2 | guidance HUD | Explorer |
| Map header "0% surveyed" vs HUD 42% | P2 | map/UI lane | Achiever |
| "Take contract" / explore / jump no visible effect | P2 | verbs/feedback lane | Explorer |
| Teal ring / orange ramp look interactable but aren't | P2 | set-dressing / affordance | Explorer |

## First-rung test regression

`src/game/first-rung.test.ts` now fails:

```
shows sight-destination when affordable rig is within sight radius of Long Furrow
expected stage: "sight-destination"
received stage: "attempt-route"
```

This sits in the parallel-owned `src/game/first-rung.ts` tranche and aligns with
the achiever's observation that the blade rung does not complete. It should be
addressed by the parallel owner, not by agents editing `src/game/` from other
lanes.

## Comparison to SIM1 (placeholder)

SIM1 reports are at:

- `docs/reviews/PLAYTEST_SIM_EXPLORER_2026-07-25.md`
- `docs/reviews/PLAYTEST_SIM_CASUAL_2026-07-25.md`
- `docs/reviews/PLAYTEST_SIM_ACHIEVER_2026-07-25.md`

This section will be completed after the casual SIM2 report lands, focusing on
whether the first-rung/save-diagnostics tranche repaired the issues SIM1
surfaced.

## Recommended next actions

1. Wait for the casual SIM2 report.
2. Re-run all three personas against a **single confirmed port** (the dev server
   on 4174) to resolve the persistence/camera contradictions.
3. Route the P0 map-modal loop and stuck blade rung to the parallel-owned
   `src/game/first-rung.ts` lane.
4. Present the complete synthesis before starting Farmfall Phase A.

## Anything else?

Yes. The port confusion is not a small QA footnote — it means the agents may
have tested different builds with different save/render behavior. Any fix
routing based on SIM2 should be conditional until a single-port validation run
confirms which bugs reproduce on the canonical build.
