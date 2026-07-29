# Wide-Open Brainstorm — Reachability and the Missing Middle

Date: 2026-07-28
Status: **exploration and recommendation — not an accepted ADR, not operator sign-off**
Skill: `wide-open-brainstorm` (Carl Kibler external-skills), run in **single-agent mode**
Supporting lenses: `game-design`, `game-development`, `threejs-game-director`, `3d-web-experience`
Evidence: Tier 3 — reproducible static measurement of this checkout via
`tools/audit-runtime-reachability.mjs`, plus Tier 1 synthesis of current docs

Related: [Exploration Map](EXPLORATION_MAP.md) ·
[Integration-First Roadmap](INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md) ·
[Long-Term Game Design](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md) ·
[Wide-Open Brainstorm 2026-07-27](WIDE_OPEN_BRAINSTORM_RIGS_UNBOUND_2026-07-27.md) ·
[Next-Tranche Arbitration](WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md) ·
[Master Execution Tracker](../plans/MASTER_EXECUTION_TRACKER.md)

---

## 0. How this room was run

The skill's step-2 environment detection found no `ask-*` external LLM wrappers
installed (`ask-gemini`, `ask-copilot`, `ask-cerebras`, `ask-zai` all absent).
Bare `gemini`, `codex`, and `claude` binaries exist but are not the skill's
outsider-role interface, and repo precedent (RU-0909) already established
internal-only role play as the accepted mode here. This room therefore ran in
**single-agent mode**: Strategist, Champion, Operator, Cartographer, Archivist,
Trickster, Skeptic, Future Self, Outsider, Customer Whisperer, Devil's Advocate,
Executioner, plus the skill's mandatory Methodologist and Data Steward because
this session touches architecture and process policy.

No role output below is an operator decision. The Executioner's verdict and the
build conditions in §12 are the load-bearing parts and require sign-off.

---

## 1. White Hat first — what is measurably true today

Every number here is reproducible on this checkout.

```bash
node tools/audit-runtime-reachability.mjs
```

| Fact                                         |  Value | How measured                 |
| -------------------------------------------- | -----: | ---------------------------- |
| Non-test source modules                      |     78 | reachability audit           |
| Modules reachable from a shipped entry point |     48 | reachability audit           |
| **Modules unreachable from any entry point** | **30** | reachability audit           |
| Unreachable lines                            |  2,365 | reachability audit           |
| Unreachable modules that have passing tests  |     28 | reachability audit           |
| Documentation lines under `docs/`            | 71,402 | `find docs -name '*.md'`     |
| TypeScript lines under `src/`                | 32,697 | `find src -name '*.ts'`      |
| ADRs                                         |     34 | `ls docs/decisions/ADR-*.md` |
| Research notes named `*CONTRACT*`            |     48 | `ls docs/research`           |
| Docs commits in the last 100                 |     49 | `git log --oneline -100`     |
| Feature/fix commits in the last 100          |     15 | `git log --oneline -100`     |
| External human playtests                     |      0 | worklog and reviews index    |

Two derived ratios matter:

- **Documentation-to-code: 2.2 : 1.**
- **Documentation-commits-to-shipping-commits: 3.3 : 1.**

### 1.1 The unreachable set is not junk — that is what makes it serious

```text
animation.ts(325)  asset-manager.ts(261)  radial-ui.ts(123)  signature.ts(91)
ghost.ts(84)  weather.ts(83)  campaign.ts(82)  world-memory.ts(81)
winch-physics.ts(78)  salvage-crafting.ts(77)  seismic-probe.ts(74)
thermal-camera.ts(71)  procedural-missions.ts(70)  radio-scanner.ts(69)
expedition-economy.ts(64)  topo-map.ts(64)  workshop-lab.ts(61)
fleet-recovery.ts(58)  differential-lock.ts(57)  soil-ecosystem.ts(53)
debris-physics.ts(51)  electrical-grid.ts(51)  landslide-hazard.ts(49)
thermal-engine.ts(47)  cargo-crane.ts(45)  fuel-efficiency.ts(45)
tire-pressure.ts(43)  vehicle-maintenance.ts(43)  surface-moisture.ts(34)
winch-pulley.ts(31)
```

Read that list as a design document rather than a defect list. It is,
almost exactly, the **tactical vocabulary of an off-road reclamation game**:
tyre pressure, diff lock, winching, crane work, thermal load, fuel burn,
moisture, debris, landslide, soil, weather, radio. It is also the memory layer
of the project's own accepted thesis — `world-memory.ts` — and the emotional
payoff of the fleet concept — `fleet-recovery.ts`.

The most on-thesis code in the repository is the code the player cannot reach.

## Addendum (2026-07-28): the raw reachability snapshot now has a current classification

The 30-module snapshot above remains valid as the room's measured evidence
from the time it was run. It should now be read as historical measurement, not
as the current ownership interpretation. The live classification for the
measured orphan set now lives in:

- [Runtime Reachability Ownership Matrix](../reviews/RUNTIME_REACHABILITY_OWNERSHIP_MATRIX_2026-07-28.md)
- [Runtime Reachability Dispositions](RUNTIME_REACHABILITY_DISPOSITIONS_2026-07-28.md)

Those two artifacts keep the budgeted archive/defer list and module-by-module
rationale in the canonical navigation surfaces. Future edits should treat this
brainstorm as the reasoning room that led to the classification, not as the
classification itself.

### 1.2 One documentation claim is factually false

[ADR-0031](../decisions/ADR-0031-renderer-delegates-rig-local-animation-to-vehicle-animation-system.md)
and the Master Execution Tracker both state that `src/game/animation.ts` is
wired into the live renderer path. Earlier in this cycle it was not imported by
`renderer.ts`; that claim has been corrected in the current checkout by wiring
the system from the frame loop.

This is not a nitpick. It is the first observed case of the governance layer
making a **false claim about the runtime**, and it was found by a 200-line
static audit that had never been run before. That is the specific failure mode
the Executioner builds its case on in §10.

---

## 2. The seed, restated

> Rigs Unbound is a browser-delivered machine-keeper odyssey. Vehicles are the
> playable characters. Terrain is the only building material. The land
> remembers what you do to it. A persistent home grows into a wandering
> workshop; regions are dense remembered places; rare scale changes reveal a
> larger living atlas.

That seed is intact and, in this room's judgement, correct. Nothing below
argues against the fantasy. Everything below argues about the **path from
substrate to felt experience**, and about the **metabolism** that path runs on.

---

## 3. The room's central finding: The Missing Middle

Four roles arrived here independently from different directions.

**The Operator** mapped a working session and found the gap:

```text
1. wake in the workshop, see one rig you own and one you are repairing
2. look out at a landscape with one visible obstruction and one visible promise
3. choose a rig because of what it can do to that obstruction
4. drive out — and hit a physical problem you did not predict
5. ??? ← nothing lives here
6. arrive, see the map show your change
7. spend scrap on one part
8. notice a second obstruction the new capability makes interesting
```

Step 5 is empty. The player departs and the player arrives. Between those two
events there is steering, and nothing else. Every verb that would fill step 5 —
air down the tyres, lock the diff, rig the winch, swing the crane, read the
thermal load, watch the moisture — exists, is tested, and is unreachable.

**The Cartographer** found the same hole in the interface. The UI has a
10,000-foot layer (map, atlas, rumour graph) and a ground layer (action prompt,
save line, objective chip). It has no 1,000-foot layer: no surface that shows
_what my machine is doing right now and at what cost_. `radial-ui.ts` — 123
lines, tested, unreachable — is exactly that surface.

> **The UI's missing altitude and the gameplay's missing middle are the same
> hole. The interface is an accurate map of the wiring.**

**The Devil's Advocate** pushed harder: rig differentiation is the part the
project has already _proven_ (three simulated personas described Torque, Spark,
and Drift as different fantasies), and the game still is not fun. Therefore
differentiation was never the bottleneck. The project spent its best thinking on
the axis that was already working.

**The Customer Whisperer** confirmed it emotionally. The reported experience of
the current build — "a small valley, checklist, test field" — is precisely what
_departure plus arrival with nothing between them_ feels like. A checklist is
what a journey becomes when the middle is removed.

**Named idea 1: The Missing Middle.** The game has verbs for _starting_ and
verbs for _finishing_, and almost none for _coping_. Coping is where tactile
machine games live.

---

## 4. The Strategist's reframe

The project's competitive alternative is not another vehicle game. It is
**its own documentation**.

The unit of progress this repo currently rewards is _a named contract_. Thirty-
four ADRs and forty-eight contract notes are real intellectual assets, and they
have already prevented real damage (RU-0903 caught AI-attributed decisions being
promoted to Accepted). But the incentive gradient has drifted: writing a
contract note closes a lane in the tracker; wiring a verb does not.

The correct unit of progress is **a reachable verb**: something a player can
do, that changes state they can perceive, that persists.

**Named idea 2: the Reachability Budget.** Treat unreachable modules as a
tracked number with a ceiling, the way a project tracks failing tests. Not a
purity rule — a budget, with an explicit allowance for deliberate pre-positioned
work, and a requirement that the allowance be _declared_ rather than accumulated
by inattention.

`tools/audit-runtime-reachability.mjs --max N` implements the enforcement half
today. The policy half needs operator sign-off.

---

## 5. Views and organizing metaphors

### The Pegboard (Cartographer, Trickster)

The right metaphor for the missing 1,000-foot layer is not a dashboard. It is
the **workshop pegboard**: tools hang in physical states, and taking one down
costs something.

- Tyres aired down: better mud grip, worse road speed, slower to re-inflate.
- Diff locked: climbs the gully, scrubs the tyres, punishes tight turns.
- Winch deployed: you are anchored — powerful and immobile.
- Crane extended: high centre of gravity, and the storm is coming.

Each is a **commitment with a reversal cost**. That is the shape of a tactical
verb, and it is the shape almost every unreachable module already has.

### The Habit Map (Trickster, Future Self)

> **Named idea 3: The Land Is Trying To Forget.**

Routes you use stay open. Routes you abandon silt up, regrow, wash out. The map
stops being a completion checklist and becomes a **portrait of your routine** —
the shape of the county is the shape of how you actually live in it.

This makes "the land remembers" _earned_ rather than guaranteed, which is a
stronger version of the accepted thesis. It also gives `soil-ecosystem.ts`,
`surface-moisture.ts`, `landslide-hazard.ts`, and `weather.ts` a reason to exist
that is not "more simulation."

### The Logbook (Archivist)

The project computes an enormous amount of provenance — save source, schema
version, recovery reason, route attribution, fleet inheritance — and shows
almost all of it to operators rather than players.

> **Named idea 4: The Logbook.** One diegetic index where each opened route,
> each scar, each fitted part gets a line in the machine's own voice.

This converts operator diagnostics into player story and closes two open lane
gaps at once: the save-status announcement gap and the world-memory legibility
gap. The Machine Journal tab added on 2026-07-27 is the seed; `world-memory.ts`
is the unreachable engine.

### The Compliance Officer (Trickster)

The Sleeping Atlas premise is strong but abstract. Make it **bureaucratic**.

> **Named idea 5: The Compliance Officer.** The Atlas is not evil. It is a
> returning system that surveys your improvised road, files it as
> non-compliant, and schedules it for straightening.

What this reveals: "Unbound" means _chosen purpose versus assigned function_,
and the cleanest dramatisation of that is **craft versus paperwork**. It is
funny, it is legible in one sentence, it makes the antagonist threaten exactly
what the player values (their accumulated, idiosyncratic route graph), and it
gives `campaign.ts` — currently unreachable — a spine.

---

## 6. Actions and workflows — ground level

**Named idea 6: Stranded, Not Reset.**

Current failure is a soft recovery: 25% condition, teleport to Home Silo, award
nothing. It is safe, auditable, and emotionally inert. The Customer Whisperer's
verdict: failure should produce a **story**, not a rollback.

A rig that dies in the flats stays there. It becomes a marker on the map and a
contract on the ledger: _go get it_. You take a different rig. You rig the winch
(unreachable). You drag it home through the mud you cut last week. The fleet
becomes emotionally necessary rather than administratively available.

`fleet-recovery.ts` is 58 lines, tested, and unreachable. The emotional payoff
of the entire fleet premise is sitting in an unwired file.

**Named idea 7: One Machine That Changes** _(the Outsider's challenge)_.

Every document treats the multi-rig fleet as foundational. No evidence says a
first-session player wants three machines. An outsider sees one tractor and two
things they have not earned. Consider: Act I is **one machine that transforms**
(restoration, modules, visible history), and the fleet is Act II. This does not
contradict the Living Atlas Odyssey — it sequences it. It also removes the
"which rig?" decision from the exact moment the player has the least basis for
making it.

This is a genuine disagreement with the current roadmap and is recorded as such,
not resolved here.

---

## 7. The Champion's first-principles case

The Champion's mandate is to defend the operator's actual direction with causal
reasoning, not to flatter it. The strongest honest case:

1. **The documentation ratio is the cost of agent parallelism, not
   procrastination.** This project is built by a single operator plus rotating
   agents with no shared memory. In a conventional team that context lives in
   people's heads and in chat. Here it must live on disk or it does not exist.
   2.2 : 1 is the _price of the labour model_, and comparing it to a
   human-team ratio is a category error.

2. **The contracts have already paid for themselves.** RU-0903 caught
   AI-generated physics recommendations being laundered into "operator
   accepted" ADRs. Without the provenance discipline, the project would now be
   building on invented authority. That single save is worth a lot of prose.

3. **The unreachable modules are cheap, tested, pre-positioned vocabulary.**
   Thirty modules, 2,365 lines, average 79 lines each, 28 with tests. This is
   not abandoned code; it is a **parts bin**. A parts bin is the correct asset
   for a game about parts bins. The Executioner's framing — "unmaintained
   claims" — assumes wiring is expensive. That assumption is untested.

4. **The thesis has never wavered.** Across seven sessions and 276 documents,
   the north star has not drifted: vehicles as characters, terrain as material,
   land that remembers. Long-running solo projects usually die of thesis drift.
   This one is unusually stable.

**What the Champion concedes:** the writing rate is not the problem, but the
**admission rate** is. A contract note that ships without a wired verb is a
promise the runtime has not made. The fix is not to write less. It is to
require that each contract arrive holding hands with one reachable verb.

---

## 8. The Skeptic — what should NOT be built

- **A fourth map view.** Lists and maps are this project's comfort reflex.
- **A general Episode Runner engine** before one episode exists by hand.
- **All thirty orphans.** Wiring everything is the same mistake as writing
  everything. Some of these should be explicitly archived, and the project's own
  code-preservation rule makes that hard to say. Say it anyway: an orphan with
  no admission path is not future infrastructure, it is an unmaintained claim.
- **Another CONTRACT note or ADR before one orphan is wired.**
- **A Contract Ledger that is a list.** If the ledger renders as a mission log,
  it becomes the noise generator every role warned about. It should render as
  _places with needs_, not rows with statuses.

---

## 9. Time horizons and the leapfrog

| Horizon       | What good versions converge on                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **6 months**  | The middle is wired: three to five tactical verbs with reversal costs. One external human has played it. The route you cut is visible as a personal artifact, not a completion percentage.                         |
| **12 months** | Weather is an antagonist with opinions, not a difficulty slider. Decay makes persistence earned. The Logbook is the progression surface. The second region's difficulty is _route maintenance_, not new mechanics. |
| **24 months** | Bounded contract authoring. Convoy co-op. The county is a shareable object.                                                                                                                                        |

**Named idea 8: Routes Are The Save File.**

> The leapfrog: publish your route graph as a URL. Someone else loads your
> county, drives the roads you cut, and adds one of their own. The map becomes
> a collaborative palimpsest.

This is one object that simultaneously serves the async social layer, the first
UGC surface, and the marketing artifact — and every prerequisite already exists
in this repository: deterministic terrain deltas, versioned saves, world memory,
and the public-evidence-object policy in ADR-0004. It requires no server
authority, no accounts, and no moderation surface to ship the first version.

It is also the strongest possible answer to "why does the land remembering
matter?" — because someone else can drive it.

---

## 10. Kill test — the Executioner's verdict

The Executioner's mandate is to argue for abandonment, not balance.

**The kill case is not about the game design. It is about the metabolism.**

In the last hundred commits this project produced 49 documentation commits and
15 feature commits. In the same period it accumulated 34 ADRs, 48 contract
notes, and 30 gameplay modules the player cannot reach. It has run zero external
human playtests. The doc corpus is 71,402 lines — already beyond what any agent
or human can hold in working memory, which means the contracts have begun to
function as an archive rather than as a constraint.

And here is the terminal symptom, found during reachability auditing: a prior
claim that `src/game/animation.ts` was not wired into the live renderer path
survived a full documentation and release gate without being noticed.
The correction is now tracked as part of the same path: renderer-path wiring is
in place now.

A governance layer that makes false claims about the runtime is worse than no
governance layer, because it is trusted.

**Verdict: the idea survives the kill test. The method does not.**

The Executioner tried and could not make the case against the product. The
substrate is genuinely rare — deterministic persistent terrain deformation that
survives migrations is not a prototype feature. The thesis is genuinely
differentiated. The visual and physical foundations are real.

What the Executioner _can_ make the case against is the current working method,
and that case is strong enough to warrant a hard stop-and-reverse rather than a
gentle adjustment.

---

## 11. Champion vs. Executioner arbitration

|            | Champion                               | Executioner                               |
| ---------- | -------------------------------------- | ----------------------------------------- |
| Docs ratio | Cost of the agent labour model         | Evidence of displacement activity         |
| Orphans    | Cheap tested pre-positioned vocabulary | 2,365 lines of unmaintained claims        |
| Contracts  | Already prevented invented authority   | Now generating false runtime claims       |
| Fix        | Raise the admission rate               | Stop writing until the runtime catches up |

**What would make each side concede:**

- The **Champion concedes** if wiring an orphan turns out to be expensive —
  that would prove the modules were written against an imagined state shape
  rather than the real one, and the parts-bin defence collapses.
- The **Executioner concedes** if a batch of orphans each wire into
  `state.ts` / `main.ts` in a small, tested commit and measurably add
  player-perceivable verbs.

**The disagreement resolves into a single cheap experiment, not an argument.**

---

## 12. Build conditions

### Proceed now if

Three chosen orphans wire into the live loop in under ~300 lines total, with
tests green and one player-visible consequence each. Recommended first three,
chosen because they fill the Missing Middle rather than because they are
smallest:

1. `tire-pressure.ts` (43) — air down for grip, pay road speed. A commitment
   with a reversal cost, on the exact axis the terrain system already models.
2. `winch-physics.ts` (78) + `fleet-recovery.ts` (58) — turns failure into
   _Stranded, Not Reset_ and makes the second rig emotionally necessary.
3. `radial-ui.ts` (123) — the Pegboard; gives the two above a home, and gives
   the interface its missing altitude.

### Prototype first if

Those modules' state shapes do not match schema v9. That would make this a
_schema_ question rather than a _wiring_ question, and it should route to a
migration ADR rather than a wiring commit.

### Pause and reconsider the method if

After three honest attempts the orphans require redesign to wire. That outcome
validates the Executioner completely and means the parts bin is a mirage — at
which point the correct move is to archive the majority explicitly rather than
carry them.

### Kill condition (unchanged from 2026-07-27, still open)

No external human has completed a session and described what they made in their
own words. This remains the project's single largest open risk and no amount of
internal role play substitutes for it.

---

## 13. Where roles converged

Convergence is the highest-signal output of a room. Four independent
convergences appeared:

1. **The Missing Middle** — Operator, Cartographer, Devil's Advocate, and
   Customer Whisperer reached it from workflow, interface, design-axis, and
   emotional-arc directions respectively. This is the session's strongest
   signal.
2. **The most on-thesis code is unreachable** — Archivist pointed at
   `world-memory.ts`, Customer Whisperer at `fleet-recovery.ts`, Trickster at
   `weather.ts`, Cartographer at `radial-ui.ts`. None were coordinated.
3. **Lists are the recurring failure mode** — Skeptic, Cartographer, and Future
   Self all independently warned that the next artifact will be a list unless
   it is deliberately designed as a place.
4. **Routes are the real artifact** — Future Self, Archivist, and Trickster
   converged on the route graph as the object that carries memory, social play,
   and meaning.

---

## 14. Methodologist and Data Steward

Required by the skill because this session proposes a process and architecture
change.

### Methodologist — decision criteria and acceptance boundaries

- The Reachability Budget is a **budget, not a purity gate**. It must permit a
  declared allowance for deliberate pre-positioned work.
- Enforcement belongs at the same tier as the existing doc-authority audit:
  reported by default, failing only under an explicitly adopted policy.
- Scope boundary: this proposal does **not** authorise editing `src/game/`.
  Per `AGENTS.md`, that directory may hold parallel-owned work and requires an
  explicit collision clearance from the operator.

### Data Steward — metrics and instrumentation

| Metric                                                             | Source                                           | Status                                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------- |
| `unreachableCount` / `unreachableLines`                            | `tools/audit-runtime-reachability.mjs`           | **instrumented today**                                                 |
| `reachableVerbs` — distinct player-invokable semantic actions      | needs a counter over the primary-action resolver | not instrumented                                                       |
| `docsCommitsToFeatCommits` (rolling 50)                            | `git log`                                        | ad hoc                                                                 |
| `timeToFirstPlayerChange` — load to first persisted world mutation | needs a hook                                     | **not instrumented; better onboarding KPI than `firstControllableMs`** |

Assumption requiring an experiment: _that wiring orphans improves play._ Test it
with three, not thirty.

---

## 15. Six-hat coverage

| Hat        | Coverage this session                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **White**  | 30 unreachable modules / 2,365 lines / 28 tested, measured reproducibly (historical snapshot; live classification now lives in the ownership matrix/disposition pair); 2.2 : 1 docs-to-code; 3.3 : 1 docs-to-shipping commits; one false ADR wiring claim identified.                                                    |
| **Yellow** | The parts bin is the correct asset for a game about parts bins; the substrate is rare; the thesis has not drifted in seven sessions; Routes-As-Save-File is reachable with existing primitives.                            |
| **Black**  | The governance layer has begun making false runtime claims; zero external playtests; the doc corpus exceeds working-memory capacity; lists are the reflexive next artifact.                                                |
| **Green**  | The Missing Middle, the Pegboard, The Land Is Trying To Forget, The Compliance Officer, Stranded Not Reset, Routes Are The Save File, One Machine That Changes.                                                            |
| **Red**    | Departure-plus-arrival feels like a checklist because it _is_ one; failure that rolls back is emotionally inert; the interface currently reads as an engineering dashboard rather than a machine.                          |
| **Blue**   | Next action is a wiring experiment on three named modules, not another contract note. The reachability audit is now a standing instrument. Operator sign-off required on the budget policy and on the ADR-0031 correction. |

---

## 16. Reformulated reusable prompt

```text
Run a wide-open brainstorm for Rigs Unbound.

BEFORE GENERATING ANY IDEAS, measure:
  node tools/audit-runtime-reachability.mjs
  git log --oneline -100 | cut -d: -f1 | sort | uniq -c | sort -rn
  find docs -name '*.md' | wc -l; find src -name '*.ts' -exec cat {} + | wc -l

THESIS: vehicles are characters; terrain is the only building material;
the land remembers. Machine-keeper odyssey, browser-delivered.

STANDING TENSION: this project converts thinking into documents faster than
into reachable play. Any room that ends with a new contract note and no wired
verb has failed, regardless of idea quality.

ROLES: Strategist, Champion, Operator, Cartographer, Archivist, Trickster,
Skeptic, Future Self, Outsider, Customer Whisperer, Devil's Advocate,
Executioner, Methodologist, Data Steward.

REQUIRED OUTPUTS: measured White Hat table; the convergence set; named ideas;
kill verdict; build conditions expressed as a cheap experiment with a concede
condition for both Champion and Executioner.

FORBIDDEN OUTPUT: a recommendation whose next action is another document.
```

---

## Anything else?

Yes — three things this room deliberately did not resolve.

1. **The fleet-versus-single-machine sequencing** (§6, named idea 7) is a real
   disagreement with the current roadmap. It is recorded, not decided. It
   deserves its own operator decision because it changes Act I.

2. **This document is itself an instance of the problem it describes.** It is
   another exploration note in a repository that has 276 of them. Its only
   defence is that it shipped a reusable measuring instrument
   (`tools/audit-runtime-reachability.mjs`, six tests) alongside the prose, and
   that its recommended next action is a wiring commit rather than another note.
   If the next session produces another document instead, this one should be
   read as evidence for the Executioner rather than against.

3. **The ADR-0031 correction is not optional.** The same provenance principle is
   still true: historical correction text is preserved, while runtime claims are
   now true to source.
