# Gameplay Long-Game Evaluation — From Experiment Lab to Game

- Status: **Proposed evaluation — awaiting operator read; no status changes made**
- Date: 2026-08-23
- Evaluator: agent session (ZCode), prompted by operator: *"start evaluating for
  improvements, not just basic but full game play, long term, current one looks
  like an experiment lab not a game"*
- Method: read-first evaluation across the design spine, first-playable spec,
  execution board, three prior audits (visual feel 2026-08-01, game director
  2026-08-12, mechanics 2026-08-13), the AAA visual roadmap, the last three
  worklog addenda (08-13, 08-21, 08-23), and the live runtime surfaces
  (`campaign.ts`, `mission-propositions.ts`, `world.ts`, `audio.ts`, board and
  tracker state). No `src/game/` files were read-modified; no git writes.
- Companion skills applied: 3d-games (rendering/perf principles), game-design
  (core-loop, progression, player-psychology frameworks).

## 1. Verdict

**The operator's diagnosis is correct, and it is measurable.** Rigs Unbound
today is a **superbly engineered demo of a game's skeleton** wrapped in the
presentation of a test harness. It has a complete, ending narrative slice; it
does not yet have a second hour, and — more importantly — it has never been
checked for the thing that makes anything a game: whether the moment-to-moment
loop is *felt* as fun. Every quality gate the repo runs (typecheck, vitest,
reachability audits, browser acceptance, visual parity) proves **reachable and
correct**, never **compelling**. The one board item that would answer it —
GD-18, the human feel playtest — is still open on the 2026-08-12 board while
four subsequent work streams (mechanics audit, top-down suite, AAA VFX stages
0–6, asset audit) shipped around it.

The lab feeling decomposes into four specific deficits, each with evidence:

1. **The 30-second core loop is unproven.** Driving is the primary verb; its
   verified feedback surface is text toasts plus gauge needles. The 2026-08-01
   feel audit found every observed interaction resolving as a toast, the
   claimed "juice" (camera shake, first-start flare, audio cues) unverified,
   and audio never heard at all. Nothing since has closed that finding.
2. **The dramatic machine wears a lab coat.** The narrative arc — genuinely
   well designed as a state machine — renders every beat, from "the stranger
   arrives in a strange valley" to "you replaced a spark plug," in the same
   gray panel with the same typography and the same toast. No portraits, no
   camera staging, no scene treatment. Sequenced, not staged (feel audit §3).
3. **Content volume is a demo.** Authored campaign content totals **three
   contracts** (`campaign.ts`: sunken-relay available; ridge-ascent and
   marsh-ford locked behind `jump`/`ford`), **four world sites**, and **three
   rigs with real handling** (13 of 16 fleet rigs render as generic blockouts
   fitting zero modules — RIG_PRODUCTION pipeline findings, 2026-08-17).
   Post-finale play is two contracts plus procedurally generated repeatable
   propositions. That is 1–3 hours of horizon; a long game needs a second and
   third horizon.
4. **The process optimizes for auditor-verifiable, not player-felt.** The
   spine's own §0 diagnosis (2026-07-29: "engine-research project, not a game
   studio"; last-60-commits 41 docs : 6 feat+test) was correct, was briefly
   corrected by the GD-01..05 slice push, and has since **regressed in
   pattern**: the three fronts the director audit flagged (slice, top-down
   modes, procedural generation) all received more work after P0 shipped,
   while the two highest-leverage player-facing follow-ups (feel playtest,
   presentation staging) did not. The AAA visual push is polishing the
   *least* load-bearing layer of an unstaged scene: photoreal puddles under
   toast-based drama is still a lab — a beautiful one.

## 2. What is genuinely strong (keep, do not rebuild)

- **The design spine** (`GAME_DESIGN_SPINE.md`, ADR-0040): persistence ladder,
  quest anatomy, plural campaigns, staged economy, monetization stance. This
  is professional-grade direction; the long game is already correctly
  designed on paper.
- **The slice's dramatic structure**: arrival bargain → restoration → naming
  beat → first work → Water Before Night branch → authored first-night threat
  → ridge-top open-world promise. As a causality chain with real consequences
  and closures, this is the strongest asset the game has.
- **Systems substrate**: mission lifecycle + propositions with prerequisites,
  world graph, Journey/Mastery/Insight progression, scrap/parts/favor economy,
  validated v10 saves, replay determinism. The plumbing the spine said was
  "without quests" now has one full quest chain through it.
- **Engineering discipline**: 730+ tests, reachability budget, browser
  acceptance harnesses, evidence tiers. This rigor is rare and valuable — it
  just needs to be aimed at a new target (see §5).
- **Instrument-grade HUD** (feel audit: "would not look out of place in a
  shipped vehicle-sim") and one hero silhouette (Torque's side view) that
  already read as designed.

## 3. Why it reads as "lab" — root cause, not symptoms

The recurring pattern across the last six months of worklogs is
**breadth-first verification**: new systems, new modes, new rigs, new render
stages — each landing with audits and acceptance scripts, none landing with a
staged, audible, felt experience. A lab proves a mechanism works; a game makes
a player *feel* it working. The gap is not missing technology; it is that
**presentation, juice, and content depth have no enforceable gate**, so they
lose every scheduling conflict against verifiable plumbing and verifiable
pixels.

Concretely, three open items on the repo's own board name the exact gap and
have sat open while breadth shipped: GD-18 (feel playtest), GD-15
(fiction-first onboarding decision), and the feel audit's juice-verification
follow-up. The fix is therefore partly **process** (§5 guardrails) and partly
**a redirection of the next tranche of work** (§4).

One pushback the operator should hear plainly: **TASK-VFX-01..04 (AAA visual
roadmap) is currently scheduled as if it were the path from lab to game. It
is not.** The feel audit already identified juice + staging as "the single
cheapest available fix to the behave-like-a-game axis — cheaper than any art
pass." Visual fidelity raises the ceiling of a scene that already feels
authored; it does nothing for a scene whose emotional beats are
typographically identical to its diagnostic readouts. Grass density on an
unstaged valley is set dressing on an empty stage. Continue VFX *after* (or in
lockstep with) staging and feel work, not before it.

## 4. Improvement program — full gameplay, long term

Three phases. Each phase has a player-felt gate, not just an audit gate.
Phases are strictly sequential at the top level; items within a phase
parallelize.

### Phase A — Make the first 30 minutes feel like a game (weeks)

Goal: a cold player, who has read nothing, finishes the opening hour and says
*"oh, this is a game"* — without a single new system being added.

- **A1 — Run GD-18 now.** The feel playtest is the cheapest, highest-leverage
  open item in the repo and everything else in this program is sequenced by
  its findings. Scope is already written on the board (GD-18: hesitation,
  wrong turns, coaching, completion time, unprompted retelling; evaluate
  8-overlay density; validate GD-15 sequencing cold).
- **A2 — Staging pass on the dialogue/narrative surface.** Dialogue beats get
  a distinct visual and camera treatment vs. mechanical readouts: a reframe
  or dim on narrative beats, a character presence for the old man (silhouette
  or portrait plate — the 2D art budget is one character to start), and
  distinct panel grammar for *story* vs. *diagnostics*. This is the feel
  audit's prescription, still unexecuted. The dialogue surface implementation
  plan (2026-07-31) already sketches the surface to extend.
- **A3 — Verify-or-build the juice, and make the world audible.** First-start
  sequence (crank → catch → headlight flare → panel pulse), furrow-engage
  rumble, winch tension creak, night-threat stinger. `audio.ts` exists (625
  lines, `RigAudio`); the feel audit could not verify any of it lands. The
  gate is a captured session *with audio on* reviewed by a human, plus the
  playtest confirming players report the moments without prompting.
- **A4 — Close GD-15 with A1's evidence.** Expect fiction-first (the board's
  own recommendation); record it in the spine addendum so onboarding stops
  being accidental.
- **A5 — Overlay-density triage.** Eight overlay surfaces for a first-time
  player (welcome, dialogue, workshop, mission board, map, control lesson,
  touch controls, HUD) is lab-grade instrumentation. Fold the welcome blurb
  into diegetic first-minute guidance; make the mission board reachable from
  one persistent anchor instead of a mode.

### Phase B — Build the second horizon: post-finale gameplay (1–2 months)

Goal: the ridge-top promise — the slice's final shot — becomes a real act,
and "one more contract" exists as a felt pull. This is where "full gameplay"
starts.

- **B1 — Author the two locked contracts as full quest arcs**, not delivery
  checklists. *Launch Ridge Beacon Delivery* (`jump`) and *Marsh Skimmer
  Supply Run* (`ford`) each get: a named giver from the existing NPC texture
  (Sera Tal the signal keeper; Ione Vale/Oren Pike the ferry pair), stakes
  tied to the buried-signal mystery, a branch with closures, and a
  world-memory delta that visibly changes the region (repeater lit; depot
  relief ships arriving). Wire through the existing mission lifecycle per
  spine §5 — extension, never a parallel system.
- **B2 — Make the buried signal the Act-2 spine.** The slice ends with two
  signals "the scanner can hear but not decode." That mystery is the game's
  retention engine and it is already seeded (`radio-scanner.ts` wired,
  rumor-graph reachable). Design a three-beat decode arc (ridge repeater →
  marsh buoy → the north-field source) where each beat requires a capability
  the player must earn, ending in a real revelation that recontextualizes
  the valley. Mystery outperforms missions for long-play retention; the repo
  already believes this (spine §4 "universe mysteries") — it needs content.
- **B3 — Fleet growth through play.** Spark and Drift exist but are R-to-cycle
  lab artifacts today. Each becomes an acquisition story beat (win, earn, or
  rescue the machine), with the naming ritual (Spine §12.2) per rig. The
  rig-inventory roadmap's Wave 1–2 (wire the 13 authored factories + module
  fitment) should be consumed *here*, one rig per beat — not as a standalone
  batch wiring task. A rig that arrives through a story moment is content;
  the same rig wired in a batch is inventory.
- **B4 — Close the economy loop.** Scrap → parts → workshop services with
  the NPC workshops (spine §7 "build early"): repair, one module fitment
  service, one tuning service. Favor spends as access (loaner rig for one
  contract). Gate: a player can go broke, recover through repeatable
  contracts, and *choose* between spending paths — the first real economic
  decision after the Water Before Night branch.
- **B5 — Day-arc rhythm.** Repeatable proposition generation exists; shape it
  into a day cycle players can plan around (fair-weather work windows,
  night pressure, storm contracts after the first-night threat type is
  established). Rest beats between intensity (game-design flow pacing), so
  long sessions breathe instead of grinding.

### Phase C — The long game: world-of-worlds cadence (quarter+)

Goal: a repeatable content engine that turns "one valley" into the spine's
plural universe without re-entering lab mode.

- **C1 — Region authoring kit.** Codify what the home county taught: per
  region, a landmark hierarchy (horizon anchor → regional → secrets), rumor
  nodes, 2–3 contract archetypes, one mystery fragment, one capability gate.
  Each new region is then weeks of content on proven lanes. Only start after
  B1–B4 prove one full act plays well cold.
- **C2 — Async social layer.** `ghost.ts` (retained as the multiplayer seed):
  time-trial ghosts on relay routes, "traces" of other players' best recovery
  lines. Zero server authority needed; fits the maturity ladder's step 2.
- **C3 — Second campaign vertical.** Pick exactly one from the candidate
  registry (zombie-city night defense and toy-scale metropolis are the two
  most genre-stretching) as the proof of the genre-transition contract. One,
  not several.
- **C4 — Steam desktop shell (Tauri/Electron)** when the browser funnel proves
  retention: fullscreen, gamepad, achievements, cloud saves (spine §7
  platform posture). This is packaging, scheduled last on purpose.

### What NOT to do now (explicit anti-scope)

- No new rendering stages (pause TASK-VFX-01..04 until A lands, then resume in
  lockstep: a scene gets fidelity when its beat is staged).
- No procedural rig generation (GD-13 stays gated behind an ADR with a named
  consumer).
- No multiplayer beyond async ghosts, no UGC marketplace, no accounts — the
  spine's authority ladder already sequences these; nothing has changed.
- No new rigs beyond the B3 story beats. Sixteen silhouettes in a garage menu
  is a showroom; three rigs with histories is a fleet.

## 5. Process guardrails — keep it a game, not a lab

1. **Add a player-felt gate to "definition of done."** The spine's §11.1
   ("player-reachable") got the slice finished; extend it: every tranche
   closes with either (a) a cold-player observation session, or (b) an
   explicit deferral note in the tracker naming when the feel check happens.
   GD-18 becomes a recurring instrument, not a one-off.
2. **Commit-mix discipline enforced, not aspirational.** The spine targets
   feat+test ≥ docs on a 60-commit window; measure it in the tracker's
   header each update. When the ratio inverts, the next tranche must be
   player-facing by rule.
3. **One depth front at a time.** The director audit's fragmentation finding
   (three fronts) repeated itself after P0. Rule: Phase B items outrank any
   Phase C pull; VFX outranks nothing until A closes.
4. **Playtest recruiting rule.** At least one tester per phase who has read
   no project docs (the old A6 pattern). The repo's biggest blind spot is
   that its evaluators know the design intent.
5. **The 30-second test as a standing prompt.** Every worklog entry for
   gameplay-facing work answers: what did the player *do, feel, get* in the
   last 30 seconds of the changed surface? If the answer is "read a toast,"
   the work isn't done.

## 6. Sequenced action list (for an execution board)

| # | Action | Gate / evidence | Phase |
| --- | --- | --- | --- |
| 1 | Run GD-18 feel playtest (cold player, full slice, audio on) | recorded session + findings doc; board item closed | A |
| 2 | Staging pass: dialogue vs. diagnostics grammar, old-man presence, camera treatment | before/after capture of 3 beats; playtest #2 confirms beats land | A |
| 3 | Juice verification/build: first-start sequence, furrow/winch feel, night stinger; audible-world check | captured session with audio; playtest reports moments unprompted | A |
| 4 | GD-15 decision recorded; overlay-density triage (8 → ≤5 surfaces in minute one) | spine addendum; cold-player completes opening with no coaching | A |
| 5 | Author ridge-ascent + marsh-ford as quest arcs (givers, branches, closures, region deltas) | lifecycle-wired; browser acceptance; each has a memory sentence | B |
| 6 | Buried-signal Act-2 arc design + first decode beat | design note tied to radio-scanner; beat 1 playable | B |
| 7 | Spark & Drift acquisition + naming beats; Wave-1 rig wiring consumed per beat | one rig per story moment; no batch wiring | B |
| 8 | Economy closure: workshop services, favor-as-access loaner | player can go broke and recover; spending choice exists | B |
| 9 | Day-arc rhythm on proposition generation | a played week has weather-shaped plans; rest beats verified | B |
| 10 | Region authoring kit + second region | new region ships in ≤ 3 weeks using the kit | C |
| 11 | Async ghosts on relay routes | ladder step 2 satisfied; ghost visible + beatable | C |
| 12 | Second campaign vertical (pick one) + Steam shell decision | genre-transition contract exercised once; funnel data | C |

## 7. Honest confidence notes

- This evaluation did not replay the slice end-to-end hands-on this session;
  it relies on the repo's three dated audits, their screenshots, the passing
  acceptance scripts' documented coverage, and direct reading of the runtime
  content surfaces. The strongest possible next evidence is action #1 itself.
- Image-analysis tooling failed on this environment (CDN analyzer rejected
  URLs); latest stage-5/6 captures were assessed via the written audits and
  the 2026-08-21 progress review instead of fresh machine vision.
- Phase estimates (weeks / 1–2 months / quarter) assume the existing agent
  cadence and no parallel-stream collisions in `src/game/`.
- The judgment that VFX is currently mis-prioritized relative to staging is
  an opinion offered for operator decision, not a finding; the operator may
  weigh demo-funnel visuals higher than this evaluator does.

## 8. Anything else? (standing prompt)

One structural observation for later: the repo now contains *four* living
status surfaces (master tracker, 2026-08-12 board, AAA roadmap task list, rig
production pipeline) plus the spine. That is one more than a solo operator can
keep current; consider consolidating the board + tracker into a single
"current front" doc at the next natural boundary, archiving the rest as
history. Documentation surface area is itself a lab-inducing drag on cadence.

---

## Addendum — first-hand evidence, 2026-08-25 (follow-up session)

Status: supplemental evidence for §1 and §7; no phase structure changed. The
image analyzer and hands-on replay that failed on 2026-08-23 were retried and
completed. Three new findings, one of them material to §1's deficit #4.

### A. Machine-vision verdicts on the latest captures (analyzer retry succeeded)

- **Stage 6 farm-day** (latest visual state, 2026-08-21): verdict *"100% a
  prototype/tech demo"*. Named: inconsistent art direction (stylized blocky
  tractor against realistic water against pixelated/out-of-place UI), no
  authored sense of place (props scattered without paths/clearings), UI as
  spreadsheet-like low-contrast panels, debug text visible to the player
  ("Quality: reduced", saved-locally toasts).
- **Stage 5 first-night threat** (the dramatic beat): verdict — the threat is
  conveyed *purely textually*; no rain, lightning, wind, or storm atmosphere
  is visible; lighting reads placeholder; UI panels dominate the frame; a
  player "would feel zero tension… essentially the same as playing at noon."
- Caveat: the day capture ran under the performance safeguard ("Quality:
  reduced" HUD), which tempers scenery-density complaints but not the
  art-direction-consistency, UI-dominance, or staging findings.
- Both verdicts independently corroborate the 2026-08-01 feel audit — three
  weeks and two visual overhauls (stages 5–6) later, the dramatic beats still
  read as test scenes to a cold critic. This is live confirmation of §3's
  claim that fidelity work is not the binding constraint.

### B. Material new finding: the "verifiable" layer itself had drifted (deficit #4 specimen)

Attempting the hands-on replay surfaced an evidence-integrity chain worth
recording in full:

1. **Port squatter masked everything.** A `python -m http.server` serving an
   unrelated project (`~/Projects/pdf_editor`, spawned by a `.workbuddy-ai`
   tool, twice in one day) owned 127.0.0.1:4173. The canonical launcher's
   health check only asked "does the port respond," reported healthy, and the
   acceptance suite failed at bootstrap with a misleading 90s timeout.
   Launcher hardened (identity probe on `/src/main.ts` + `lsof` squatter
   diagnostics + non-zero exit); squatters freed; Vite verified sole owner.
2. **The complete-slice acceptance's Steps 6–7 were vacuous.** They read
   `firstNightThreatResolved` / `openWorldPromiseFinaleRevealed` /
   `obstacles` from `render_game_to_text()` — **fields that do not exist in
   the observability contract** (`publicState` never exposes them) — with
   `?? false` fallbacks and pass conditions of merely `!== null`. The two
   highest-stakes P0 beats (GD-03 night threat, GD-02 finale) had *never*
   been verified at the browser layer; the GD-05 "browser acceptance PASS"
   evidence on the board overstated coverage. Their logic is unit-tested;
   their browser path was not.
3. **The runtime itself is sound where it was checkable.** A new reusable
   probe (`tools/probe-night-beat.cjs`) played the real path (salvage →
   restoration → waterworks branch) then forced night via
   `window.advanceTime`: the authored threat fired with its diagnostic
   ("The storm has found the farm on its own tonight, same as any valley's."
   — `first-night-threat.ts:101`). PASS. The harness was the broken part,
   not the game.
4. **Script made truthful.** `complete-slice-browser-acceptance.cjs` Step 6
   now drives and asserts the night beat (verified live); Step 7 now *fails
   honestly* with named follow-ups (add the sunken-relay contract step;
   expose `firstNightThreat`/`openWorldPromise` in the text contract)
   instead of passing vacuously.
5. **Live console-gate regression.** The run also fails on
   `THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated` warnings
   (×2) — introduced by the AAA Stage 2 shadow work (`renderer.ts`) and not
   caught because the full slice acceptance was not re-run after the visual
   overhaul. **The complete-slice acceptance is currently red on the working
   tree**, contradicting the tracker's standing pass claims. Fix is trivial
   (`PCFShadowMap` or the current API name) but lives in `src/game/` — held
   for ownership clearance per AGENTS.md.

### C. What this changes in the evaluation

- §1 deficit #4 ("process gates on auditor-verifiable, not player-felt") gets
  a sharper edge: on this day even the *auditor-verifiable* layer had rotted —
  a green acceptance was greener than reality. The proposed player-felt gate
  (§5.1) does not replace verification hygiene; both are needed.
- New concrete action for the Phase A / process list: **expose
  `firstNightThreat` and `openWorldPromise` in `render_game_to_text()`**
  (small `publicState` addition — needs `src/game/` clearance) and **add the
  sunken-relay completion step** to the slice harness so the finale becomes
  browser-verifiable for the first time.
- The machine-vision corroborations (§A) strengthen the Phase A ordering:
  staging and atmosphere-at-dramatic-beats outrank further fidelity stages.

Evidence paths: probe tool `tools/probe-night-beat.cjs`; hardened launcher
`tools/start-canonical-dev-server.cjs`; patched harness
`tools/complete-slice-browser-acceptance.cjs`; run logs in
`docs/WORKLOG_ADDENDUM_2026-08-25.md`. No `src/game/` files were modified; no
git write actions taken.
