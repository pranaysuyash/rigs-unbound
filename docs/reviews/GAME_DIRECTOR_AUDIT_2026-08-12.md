# Game Director Audit — 2026-08-12

- Status: **Studio judgment call — durable review**
- Date: 2026-08-12
- Owner: project owner (Pranay); synthesis by agent session (parallel Explore
  audits on runtime ground truth and doc-corpus discipline, both cited inline)
- Role: this document answers one question only — *does the current state of
  the repository produce the game we are trying to make?* — using
  [Game Design Spine](../design/GAME_DESIGN_SPINE.md) §1-§2 (canonical vision
  and pillars) as the standard, not local code quality or subsystem elegance.
- Relationship to prior audits: [Visual Game-Feel Audit](VISUAL_GAME_FEEL_AUDIT_2026-08-01.md)
  answered *does it look/flow/behave like a game* from pixels. This document
  answers *is this the right game, prioritized correctly* from measured
  runtime + repo process. It does not re-litigate either.
- Evidence tiers used throughout per `motto_v5.md` §0.5. Runtime claims below
  are Tier 1-2 (static inspection + `npx vitest run`/`npm run typecheck`,
  independently re-run and confirmed by me, not only quoted from source
  agents) unless marked otherwise. Two Explore agents traced (a) the actual
  player-facing runtime loop file-by-file and (b) the discipline of the
  uncommitted doc corpus; their findings are folded in with file:line
  citations preserved.

---

## 1. Verdict, up front

**The game the operator pitched is not yet the game being built session to
session, and the gap is not a subsystem gap — it is a sequencing and
attention gap.** The engineering foundation is unusually strong for this
stage: a real dialogue surface, a real restoration loop, a real branching
world-consequence choice, 639/639 tests green, one coherent input/camera
system instead of stitched demos. But the studio's attention is currently
split three ways — proving the first playable, expanding the design-doc
surface toward procedural-rig infinity, and prototyping a fourth camera/
control paradigm (top-down) — and none of the three is finished. A Game
Director's job here is not to praise the engineering (it earns praise) or to
demand more docs (there are enough). It is to say: **finish the one loop that
proves the game, and stop opening new fronts until it's proven.**

## 2. North Star check — fantasy → pillars → loops → systems → features

> Canonical fantasy (Spine §1): *"an open-world vehicle universe where
> vehicles are the playable characters... without ever losing ownership,
> history, or agency."*

Run the hierarchy top-down against measured state:

| Layer | Spine says | Measured state | Verdict |
| --- | --- | --- | --- |
| Fantasy | Vehicles are persistent characters you never lose continuity with | Naming persists (`renameRig`, `state.ts:474-539`), save schema v17 carries identity | **Holds** |
| Pillars | 5 pillars (§2): real gameplay bodies, universal capability contracts, explicit persistence, self-declaring activities, everything inspectable | Restoration/naming/waterworks all route through one state machine and one save path; no second authority found | **Holds** |
| Loops | §10 first-playable: one continuous session, main quest, 2 side quests, exploration, customization, economy, world memory, ridge-top promise | Arrival→bargain→restore→name→waterworks-choice all reachable and tested (agent-confirmed, `main.ts`/`state.ts` citations below). **The finale does not exist** — no ridge/dawn/switchback scene, `CAMERA_PRESETS["night-completion"]` (`camera.ts:100-184`) is dead code, imported nowhere. The authored "first night" threat (machines orienting to the buried signal, varying by branch/survey) has **zero implementation** — what fires instead is a generic storm/landslide road event unrelated to the narrative state. | **Breaks here** — the loop is real for ~80% of its length and then trails into free play instead of resolving |
| Systems | Quest semantics, world-memory, economy, settlements | Real: `MissionClass`, settlement needs/life, waterworks consequence all wired and tested | **Holds, arguably ahead of the loop that should be consuming it** |
| Features | Top-down mode, procedural rig generation, infinite asset pipeline | ADR-0053 (top-down) proposed 2026-08-09, unsigned; rig-generation research pair proposes scope beyond the spine's 3 hand-authored profiles, no named consumer, nothing shipped | **New feature surface opening before the loop above it is finished** |

This is the diagnostic a North Star check is for: **the break is in the
middle of the hierarchy, not at the bottom.** Systems and pillars are sound.
Features are being proposed. The *loop* — the thing a first-time player
actually walks through start to finish — is the layer that stops short.
Shipping more systems or features does not fix a loop that doesn't resolve;
only finishing the loop does.

## 3. What's actually working (say this plainly, it's earned)

- **One coherent control/camera/UI system, not tech-demo soup.** A single
  `InputController` unifies keyboard/gamepad/gyro into one `InputFrame`; one
  `camera.ts` serves six view modes through one `<select>`; 8+ overlay
  surfaces (welcome, dialogue, workshop, mission board, map, control-lesson,
  touch controls, HUD) share one dark-panel visual language driven from one
  `main.ts`. This is the opposite of the "engine-research project" failure
  ADR-0040 diagnosed a year — sorry, two weeks — ago. It has been corrected.
- **The restoration → naming → Water Before Night chain is real, not
  scaffolding.** Diagnose → replace → first start → naming beat → waterworks
  branch each mutate real `GameState`, persist through `storage.ts`, and are
  gated correctly (naming can't fire before the tractor helps in the field;
  waterworks can't fire before first start). This is genuinely the hardest
  part of "does the story mean anything mechanically," and it's done.
- **639/639 tests pass**, and per the project's own Test Sensitivity
  discipline (`motto_v5.md` §0.5.1) the two Explore agents found no stub
  markers, no `TODO`/disabled paths in the critical restoration/dialogue/
  waterworks code — the gaps are silent omissions (missing scenes), not
  broken promises (fake-passing tests).
- **The studio catches its own mistakes in public, on paper, before I did.**
  `VISUAL_GAME_FEEL_AUDIT_2026-08-01.md` already reached "strong
  vertical-slice engineering build with zero art-direction pass" eleven days
  before this audit, and its 2026-08-11 update shows real forensic
  discipline (measuring rendered geometry against terrain to explain floating
  props, not guessing). The reachability audit (`tools/audit-runtime-
  reachability.mjs`) converted "docs claim X is wired" from an assertion into
  a mechanically checked number, and it's been used against itself
  repeatedly (`FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` addenda, 2026-08-06/07,
  found and corrected *ten* wrong binding claims in its own spec). That
  self-correction habit is rarer and more valuable than any single feature.

## 4. What's actually broken, ranked by blast radius on the player promise

### 4.1 The slice does not end — this is the P0

The first-playable spec's entire purpose (Spine §10) is to prove "if this
slice works, Rigs Unbound is a game." It cannot prove that yet, because it
has no ending. A player who plays the whole implemented arc (agent-verified:
arrival, bargain, restoration, naming, Water Before Night, a generic road
hazard) reaches no ridge, no dawn, no vista, no "here is the world, choose
your next contract" moment — they just keep driving. The exact scene the
spine describes as the slice's payoff (§5: "the player sees — and the topo
map records — Sunken Flats' reopened causeway... two signal sources the
scanner can hear but not decode... The slice ends with the player choosing
the next contract — not a cutscene") is absent from the runtime, and there
is a orphaned camera preset (`camera.ts:100-184`,
`CAMERA_PRESETS["night-completion"]`) that reads as if someone started
building it and stopped. **This is not a new system to build. It is
finishing the one already promised.** Nothing else on this list matters as
much, because nothing else is what the slice's own definition of "done"
depends on.

### 4.2 The night threat that gives the whole opening its stakes is missing

Spine + slice spec both hinge the first night's tension on the buried signal:
"the machines that come at night orient to the signal, not the farm" if the
player surveyed early. Measured: no `nightVariant`/`nightMachine` symbol
exists anywhere in `src/game`. What fires in its place is a generic
storm-triggered landslide (`world.advanceRoadIncidents`, unrelated to
branch/survey state). This matters because it's the one beat where the
slice's three earlier player choices (waterworks branch, customization pick,
whether the north field was surveyed) are supposed to *converge* into a
felt, differentiated consequence. Right now those three choices change flavor
text and terrain color, but not what happens to the player at night. That is
the exact mechanic that would make "your choices mattered" true instead of
decorative.

### 4.3 The production build is currently broken

`npm run typecheck` fails (confirmed independently, not just quoted): three
errors in `renderer.ts` (5811, 5835, 5922) — an unused variable and two calls
to a local helper missing an argument added mid-refactor. `package.json`
wires `npm run build` through `tsc --noEmit` first, so **the shippable build
does not currently compile**, even though `vitest`/`vite dev` both look
green because neither type-checks. This is a five-minute fix, not a design
problem, but a Game Director's job includes noticing when "639/639 green"
is being read as "ready" when the actual release gate is red. Flag and fix
before any more feature work lands on top of it.

### 4.4 Attention is fragmenting across three fronts at once

As of this audit, the repo is simultaneously: (a) trying to finish the first
playable, (b) accumulating ~7,000 lines of uncommitted research docs written
2026-08-01 through 2026-08-11 (per the doc-discipline agent's count,
including a new `docs/design/rigs/` directory of 15 files not even in this
audit's original file list), and (c) drafting ADR-0053, a fourth camera/
control paradigm ("Top-Down Game Mode Architecture") proposed 2026-08-09,
unsigned, while the first three paradigms (chase/hood/tactical) haven't yet
carried one player through a finished slice. None of this is bad work in
isolation — the doc-discipline audit found most of the August 5 exploration
docs are healthy (documentation *trailing* shipped code, the opposite of
sprawl) — but two items are the real risk:

- **The rig-generation research pair** (`RIG_GENERATION_EVOLUTION_AND_
  PERSISTENCE_2026-08-05.md`, `RIG_GENERATION_INFINITE_POSSIBILITIES_
  2026-08-05.md`, ~9,600 words combined) explicitly argues procedural rig
  generation should be "core architecture, not nice-to-have" — a real scope
  expansion beyond the spine's current 3 hand-authored profiles, with no
  named consumer and nothing shipped against it. This is exactly the
  accretion pattern ADR-0040 exists to stop, reappearing two weeks after the
  correction, one layer down (research docs instead of design docs, but the
  same gravitational pull toward "the system should be infinite" before "the
  system works for three cases").
- **ADR-0053 (top-down mode)** is a legitimate long-term pillar (the spine's
  "same vehicle, many games" explicitly wants this) proposed at exactly the
  wrong sequencing moment: before the *first* control paradigm has proven
  itself fun end-to-end. Building a fourth mode's control architecture while
  mode one's slice has no ending is optimizing the wrong variable.

### 4.5 Decision debt: 9 of 13 post-spine ADRs are unsigned while implementation proceeds

ADR-0042, 0045, 0046, 0047, 0048, 0049, 0050, 0051, 0053 are all "Proposed —
operator sign-off required," several explicitly noting "implementation in
progress" or "first runtime stage implemented" in the same status line. The
project's own rule (`motto_v5.md` §0.12.2, ADR-first for load-bearing
decisions) says implementation follows sign-off, not the reverse. This is a
volume problem, not a quality problem — the ADRs read as well-reasoned — but
nine open load-bearing decisions is more than one operator can meaningfully
review and gate in the cadence they're arriving. **A Game Director doesn't
need better ADRs here; the studio needs fewer decisions in flight at once.**

### 4.6 State/renderer file size is a coherence risk, not yet a coherence failure

`state.ts` (4,828 lines) and `renderer.ts` (6,057 lines) are both effectively
single-file god-objects. Nothing observed in this audit shows this has broken
anything yet — the reachability/binding audits and 639 passing tests are real
evidence the seams still hold — but every new system (settlements, waterworks,
road incidents, and now potentially top-down modes and procedural rigs) adds
to two files already large enough that "does this change conflict with the
other active stream's uncommitted edits" (a real, named risk in this repo's
own `AGENTS.md`: *"src/game/ may contain uncommitted parallel-owned runtime
work"*) gets structurally harder every month. Not urgent; worth a named owner
before it is urgent.

## 5. Cut / Keep / Finish — anchored to the long-term shape (motto §0.12.4)

| Item | Call | Why |
| --- | --- | --- |
| Finish the ridge-top finale scene (§4.1) | **Finish now, P0** | It is the literal proof-criterion the slice exists to deliver; a dead camera preset suggests the work is partially started |
| Build the authored night-threat mechanic (§4.2) | **Finish now, P0** | Without it, the slice's three earlier player choices don't converge into a felt consequence — the emotional payoff of the whole opening depends on this |
| Fix the `renderer.ts` typecheck break (§4.3) | **Finish now, trivial** | Blocks the actual release gate; unrelated to design judgment, just needs doing before anything else ships on top |
| Top-down game mode (ADR-0053) | **Pause, not cut** | Belongs in the long-term shape (spine explicitly wants many control paradigms on one rig) — but sequenced *after* one paradigm proves the full loop, not concurrent with it |
| Procedural/infinite rig generation | **Pause, not cut — needs a named consumer first** | The spine's persistence ladder and "3 profiles" reality don't need infinite variation to prove the fantasy; revisit after first playable ships, and only with an explicit spine/ADR entry, not standalone research docs |
| Settlement/quest/economy depth already built | **Keep, stop adding more of it for now** | It is ahead of the loop that should be consuming it; the finale and night-threat need this depth to *pay off*, not more of it added on top |
| The reachability/binding/asset-coverage audit tooling | **Keep, expand** | This is the single highest-leverage process asset in the repo — it converts claims into checked facts and has already caught ten wrong claims in one document. More of the corpus should get this treatment, not less. |
| 9 unsigned post-spine ADRs | **Batch-review, don't keep opening new ones** | Operator should clear the backlog (accept/reject/defer explicitly) before more proposals queue behind it |

## 6. Cross-discipline read

- **Design vs. Engineering:** aligned. The spine is unusually well-grounded
  in what the runtime actually does (it was written *from* a reachability
  audit, not before one). No fantasy-vs-implementation gap at the vision
  layer — the gap is entirely in the unfinished loop, which is an execution
  gap, not a design-direction gap.
- **Art vs. Engineering:** the real fault line right now. Simulation depth is
  ahead of presentation by a wide margin (`VISUAL_GAME_FEEL_AUDIT`'s own
  words: "the systems depth is real... the gap is not 'needs polish'; it is
  'an art/direction pass has not started yet'"). A Game Director's read on
  top of that: don't start the art pass on the *whole* game yet either —
  start it on the finale scene specifically, once it exists, because that's
  the one scene a first-time player and a trailer both need to look
  intentional.
- **Process vs. Product:** the studio's documentation discipline
  (reachability audits, binding checkers, evidence tiers) is genuinely
  above the median for a project this size, and it is actively protecting
  product coherence. The risk is not that documentation is fake — it's that
  document *volume* (7,000+ uncommitted lines in under two weeks) is
  outrunning the operator's bandwidth to gate it, which quietly re-creates
  the "doc sprawl" failure mode one layer removed from where ADR-0040 killed
  it the first time.

## 7. Priority-ordered action list

1. Fix the three `renderer.ts` typecheck errors — unblocks `npm run build`.
2. Build the ridge-top / open-world-promise finale scene, reusing/repairing
   the orphaned `CAMERA_PRESETS["night-completion"]` (`camera.ts:100-184`)
   rather than starting fresh — it appears to be exactly the intended vista
   camera, just never wired to a trigger.
3. Build the authored night-threat mechanic so the waterworks branch,
   customization choice, and north-field survey converge into a differentiated
   first night, replacing/supplementing the generic storm-landslide event.
4. Run one full end-to-end playtest of the completed slice (arrival through
   finale) and update `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`'s own binding
   table against the result — the pattern that already caught ten wrong
   claims should be applied to whatever ships from items 2-3.
5. Operator batch-reviews the 9 unsigned post-spine ADRs (0042, 0045-0051,
   0053) — accept, reject, or explicitly defer each, rather than letting new
   proposals (top-down mode, procedural rigs) queue behind an unresolved
   backlog.
6. Only after the slice has a proven ending: resume ADR-0053 (top-down mode)
   and give the rig-generation research pair a named spine/ADR consumer
   before any implementation starts against it.
7. Commit or prune the uncommitted doc corpus (~7,000+ lines across
   `docs/exploration/`, `docs/research/`, `docs/design/rigs/`); bring
   `EXPLORATION_MAP.md`'s header current with its own content (currently
   dated 2026-08-05 while containing entries through 2026-08-06, itself
   uncommitted since 2026-07-31).

## 8. "Anything else?" (motto §0.1.1 standing prompt)

Yes, three things:

- **The welcome-panel/bootstrap sequence is a tutorial gate, not a story
  beat** (agent finding: mechanics blurb about Torque/Spark/Drift traction,
  no narrative framing) — the arrival bargain dialogue fires automatically
  right after, which means the player's actual first emotional beat is
  preceded by a UI-mode explainer. That's a defensible onboarding choice, but
  it's worth an explicit design decision (does the fiction start at "enter
  the field" or does the mechanics tutorial happen first) rather than an
  accident of build order.
- **This audit did not evaluate whether the finished loop, once it has an
  ending, is actually *fun*** — that requires a human playtest this document
  cannot substitute for. Everything here is "does the promise get delivered,"
  not "does delivering the promise feel good." Once items 1-4 above land,
  the next audit this project needs is a playtest-based one, not another
  document-vs-runtime reconciliation.
- **The eight-plus overlay surface count (§2 loop-layer table; welcome,
  dialogue, workshop, mission board, map, control-lesson, touch controls,
  HUD) is a lot of UI for a "first 60 seconds," and this audit did not
  evaluate whether a first-time player experiences that as rich or as
  cluttered** — that's a question for the same playtest, not for source
  reading.

## Evidence

- Runtime loop trace: independent Explore-agent source audit of `main.ts`,
  `state.ts`, `camera.ts`, `input.ts`, `campaign.ts`; `npx vitest run`
  (91 files / 639 tests passing) and `npm run typecheck` (3 errors,
  `renderer.ts:5811/5835/5922`) — both re-run and confirmed directly by this
  audit, not only quoted.
- Doc-corpus discipline: independent Explore-agent audit of 12+ uncommitted
  docs against `GAME_DESIGN_SPINE.md`'s named-consumer rule, `ADR-0043`
  status, and `EXPLORATION_MAP.md` staleness.
- `npm run audit:reachability`: 93 modules, 80 reachable, 12 unreachable
  (974 lines), 3 formally `DEFERRED` with named preconditions — re-run
  directly in this session.
- `git log --pretty=%s --since=2026-07-29`: 5 feat / 2 docs / 2 chore / 1 fix
  in committed history (healthy ratio) versus ~7,000+ lines of uncommitted
  docs in the same window (the gap between committed discipline and working-
  tree reality).
