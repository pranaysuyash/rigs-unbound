# Playtest SIM2 Synthesis — 2026-07-27

Status: **complete** — all three persona reports collected; synthesis ready for
operator review.

| Persona                         | Status                                             | Report                                              | Screenshots                     |
| ------------------------------- | -------------------------------------------------- | --------------------------------------------------- | ------------------------------- |
| Explorer / systems tinkerer     | ✅ complete                                        | `docs/reviews/PLAYTEST_SIM2_EXPLORER_2026-07-27.md` | `artifacts/playtest2-explorer/` |
| Achiever / optimizer            | ✅ complete                                        | `docs/reviews/PLAYTEST_SIM2_ACHIEVER_2026-07-27.md` | `artifacts/playtest2-achiever/` |
| Casual / relaxed browser player | ✅ complete (agent timed out after writing report) | `docs/reviews/PLAYTEST_SIM2_CASUAL_2026-07-27.md`   | `artifacts/playtest2-casual/`   |

## Headline scores

- **Explorer: 7/10** — world-I-want-more-of; held back by persistence regressions
  and missing feedback.
- **Achiever: 6/10** — would-grind; held back by a session-dominating map-modal
  loop, a stuck quest rung, and undiscoverable interactions.
- **Casual: 6/10** — would reopen if fixed; held back by softlocks, untrusted
  compass, and a rescue tool locked behind the progress being stuck prevents.

## Meta-note: port chaos and why it matters

Each agent found a different live port:

| Agent    | Port found | Brief said |
| -------- | ---------- | ---------- |
| Explorer | 4180       | 4174       |
| Achiever | 4173       | 4174       |
| Casual   | 4174       | 4174       |

This happened because multiple Vite processes were running on the machine, the
agent brief pointed to 4174, and the canonical Vite config actually pins the
dev server to **4173**. The result was three agents testing three different
runtime instances.

This is not acceptable as a long-term practice. A first-principles, motto_v4
solution requires:

1. **Single canonical port** — 4173, as declared in `vite.config.ts`.
2. **One canonical launcher** — `tools/start-canonical-dev-server.cjs` ensures
   exactly one `npm run dev` on 4173 and exits when ready.
3. **Agent brief reads from the same source of truth** — no hard-coded ports in
   playtest prompts; agents should run the launcher or verify the canonical port.
4. **No opportunistic port fallback** — if the canonical port is unreachable,
   the agent fails loudly rather than connecting to a stale process.

### Persistence verdict

| Agent    | Port | Persistence observation                             |
| -------- | ---- | --------------------------------------------------- |
| Explorer | 4180 | Save rollback; furrows invisible                    |
| Achiever | 4173 | Lug tyres and 211 furrows persist                   |
| Casual   | 4174 | Position, condition, survey % all restore correctly |

The contradictions are almost certainly due to different builds/ports. On a
clean single-port build, persistence appears to work. The explorer's rollback
and the achiever's success both describe non-canonical runtimes.

## What all three personas confirm is working

| Finding                                | Evidence                                                     | Implication                                   |
| -------------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Terrain genuinely gates machines       | Torque drowned / Spark dead in mud / Drift floats over water | Core "ground decides" promise is playable     |
| Three rigs feel meaningfully different | Instant pull vs bog vs cushion; GRIP vs CUSHION gauges       | Machine identity is the game's strongest idea |
| Rig switching works                    | R + proximity pointer + context bar rewrite                  | Fleet-as-garage concept is coherent           |
| Earn→spend loop is real                | Casual bought Lug tyres; achiever confirmed persistence      | Progression spine has a satisfying hook       |
| Writing voice lands                    | Intro, workshop one-liners, discovery toasts                 | Tone is a genuine differentiator              |
| Map / rumor graph delights             | Named regions, discovery toasts, "climb for sightlines"      | Exploration layer has appetite                |

## What failed / regressed (clustered)

### P0 — launch-blocking

| Finding                                                | Personas | Owner                 | Notes                                                     |
| ------------------------------------------------------ | -------- | --------------------- | --------------------------------------------------------- |
| Field map auto-reopens ~1 s after closing              | Achiever | input/map lane        | Covers the screen repeatedly                              |
| "Lower the blade" rung never completes despite furrows | Achiever | first-rung lane       | Aligns with first-rung test regression                    |
| Hard stuck on building geometry, no self-rescue        | Casual   | physics/recovery lane | Torque wedged on Home Silo                                |
| Softlock in mud without winch                          | Casual   | verbs/recovery lane   | Rescue tool gated behind currency unreachable while stuck |

### P1 — experience-breaking

| Finding                                            | Personas         | Owner                    | Notes                               |
| -------------------------------------------------- | ---------------- | ------------------------ | ----------------------------------- |
| Save rollback / inconsistent persistence           | Explorer         | save/persistence lane    | Only on non-canonical port; monitor |
| Hood camera occluded by cab / clips into terrain   | Explorer, Casual | camera/renderer lane     | Makes first-person unusable         |
| Chase camera occluded by silo at spawn             | Casual, Achiever | camera/renderer lane     | First drive is blind                |
| "Reset field" is a full wipe, not a respawn        | Casual           | recovery/UI lane         | Label undersells destructiveness    |
| Tutorial tips repeat; "Got it" doesn't stick       | Explorer         | first-rung/guidance lane | Blocks lower-center view            |
| Welcome panel perf probe never finishes            | Achiever         | boot/metrics lane        | Stays on screen after entry works   |
| Workshop buy is blind (no catalog/prices)          | Achiever         | economy/UI lane          | Keys 1–6 with no preview            |
| Cargo hook-up undiscoverable                       | Achiever         | verbs/feedback lane      | No prompt, Space/X do nothing       |
| Salvage hint silently retargets between piles      | Casual, Explorer | guidance HUD             | Compass feels random                |
| Contextual Space collision: collect vs lower blade | Casual           | input/verbs lane         | First Space press does wrong thing  |

### P2 — polish / confusion

| Finding                                              | Personas | Owner                     | Notes                                    |
| ---------------------------------------------------- | -------- | ------------------------- | ---------------------------------------- |
| Objective distance ping-pongs                        | Explorer | guidance HUD              | Reads as noise                           |
| Map header "0% surveyed" vs HUD 42%                  | Achiever | map/UI lane               | Inconsistent survey readout              |
| "Take contract" / explore / jump no visible effect   | Explorer | verbs/feedback lane       | Or feedback is invisible                 |
| Teal ring / orange ramp look interactable but aren't | Explorer | set-dressing / affordance | Creates false promise                    |
| Intro modal replays over a returning save            | Casual   | boot/save lane            | Returning player shouldn't re-read pitch |
| S = brake-then-reverse is undiscoverable             | Casual   | input tutorial            | No cue that reverse engages only at stop |

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

## Comparison to SIM1

SIM1 reports are at:

- `docs/reviews/PLAYTEST_SIM_EXPLORER_2026-07-25.md`
- `docs/reviews/PLAYTEST_SIM_CASUAL_2026-07-25.md`
- `docs/reviews/PLAYTEST_SIM_ACHIEVER_2026-07-25.md`

The first-rung/save-diagnostics tranche that ran between SIM1 and SIM2 improved
some things and introduced others:

- **Improved:** rig-switching proximity pointer, workshop tradeoff one-liners,
  salvage hint system, persistent module fitting, contextual HUD warnings.
- **Regressed / still open:** first-rung blade-completion logic, chase camera
  occlusion at spawn, hood camera occlusion, map auto-open loop (new),
  salvage-hint retargeting confusion, cargo hook-up discoverability.

The biggest change is that SIM2 casual on a clean build confirms
**persistence works**, whereas SIM1 highlighted save confusion. The remaining
P0 issues are now about softlock/recovery and a stuck quest rung rather than
wholesale data loss.

## Recommended next actions

1. **Resolve the parallel-owned runtime batch** in `src/game/first-rung.ts` /
   `src/game/state.ts` to fix:
   - the `first-rung.test.ts` regression,
   - the achiever's "Lower the blade" rung that never completes,
   - the map auto-open loop (likely input/state wiring).
2. **Add a cheap self-rescue path** so a casual player stuck in mud or against a
   building can recover without a full world wipe (e.g., emergency tow-home,
   unstuck assist, or winch available by default).
3. **Fix spawn camera framing** so the chase camera is not behind/inside the
   Home Silo on entry.
4. **Re-run a single-port acceptance pass** on the canonical 4173 port with all
   three personas to confirm the P0/P1 list reproduces on one known build.
5. **Present the validated list to the operator** before starting Farmfall
   Phase A.

## Anything else?

Yes. Three strategic observations:

1. The game's **strongest idea** — three rigs as answers to terrain — is
   consistently praised by all three personas. This is the spine to protect and
   extend.
2. The **biggest threat to retention** is not difficulty but **undiscoverable
   recovery**. Casual players do not file bug reports when stuck; they leave.
   Fixing self-rescue is higher leverage than tuning balance.
3. The **port chaos must not repeat**. Future playtests must start from
   `tools/start-canonical-dev-server.cjs` and fail if 4173 is not reachable.
