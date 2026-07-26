# Plan: Farmfall Slice 01 — crops, signature ecology, night threats, dawn consequences + mastery kernel

Date: 2026-07-25
Status: **active execution candidate; exact design remains proposed** (the
operator's “do all” direction keeps the workstream in scope; it does not accept
every agent-authored implementation detail)

## Scope revision — 2026-07-25 (playtest-driven, prepended as Phase 0)

Three uncontaminated simulated players (`docs/reviews/PLAYTEST_SIM_SYNTHESIS_2026-07-25.md`)
found the build unplayable past minute ~8 for first-timers. The following is
now **Phase 0 — playability repair**, landing before Phase A:

- **P0 bugs**: B1 title card re-opens over live gameplay on Space and never
  pauses the sim; B2 salvage crates uncollectable (proximity + drive-through
  yield 0); B3 soft-lock (drowned rig at 0% + 0 salvage + inert "Reset
  field"); B4 day/night clock derails (jumped backward 22:27→11:51, stuck
  GLOAM forever). Each gets a reproducing regression test first, then the fix.
- **P1 in the same pass where cheap**: B5 hood camera clips inside rig
  geometry; B6 Drift unreachable at spawn + 320%-grade hover climb reads as a
  bug; B7 hide the Physics Lab dev fixture from the player UI (query-param or
  build flag gate); B8 debug telemetry line out of the default HUD.
- **Onboarding rung** (moves to Phase B presentation): one reachable first
  salvage near spawn, pickup confirmation feedback, per-rig action labels,
  signal-verb explanations. The "guided first job" is the day→night loop
  itself plus opportunity hints — no quest system.
- Evidence note: the fantasy-differentiation gate **passed** (all three
  personas); "alive as a system, empty as a place" (explorer) is the exact
  gap this slice's ecology fills. The Phase A/B scope below is unchanged and
  validated.

Phase order is now: **0 → A → B**, each with its own green gates.

---

Decisions: ADR-0002 (slice direction), ADR-0018 (progression spine, Accepted),
ADR-0006/0011 (capability-first, no rig-name branches), ADR-0007 (terrain substrate),
ADR-0012 (perception chain), motto_v4 (acceptance contract, evidence tiers).

## Intent

Turn the engine into a game: the first complete day/night loop with opposition,
scarcity, and progression. This is the ADR-0002 thesis test made runnable on the
Field 02 world, and the first consumer of the ADR-0018 spine.

Player experience after this unit:

1. Day: plough tilled cells near the homestead, sow them, crops grow over real
   play time; haul cargo/salvage for scrap; invest scrap in repair/modules.
2. The player triggers dusk (existing `N` phase cycle is the deliberate diegetic
   trigger for the slice) — night is a choice with a price.
3. Night: threats emerge and hunt **signatures** (noise + light). Working loudly
   harvests faster but pulls danger; going dark and quiet is safer but slower.
   Threats eat mature crops and damage rigs on contact. Driving into a threat at
   speed repels it at condition cost; the beacon herds them (tool-as-defense).
4. Dawn: threats dissolve; a dawn record scores the night (crops saved/lost,
   damage taken, mastery earned) and the world remembers all of it.
5. Every meaningful action feeds Verb Mastery (situation-weighted); journey
   phases and mastery ranks make rigs visibly better **at their verbs**.

## Phase A — kernel (headless, test-driven)

All in `src/game/`; deterministic, fixed-step, bounded collections, no
presentation imports, no rig-name branches.

1. **Signature system** (`signature.ts`): per-rig per-tick scalar + vector
   derived from engine load, speed, active tool, beacon/lights state, and
   phase. Pure function of kernel state. Signature decays with distance
   (squared falloff over terrain). Exposed via telemetry.
2. **Crop system** (`crops.ts`): tilled cells derive from existing plough
   deformation on soft ground; `sow`/`harvest` contextual primary actions on
   the affordance chain; growth advances by kernel elapsed time with phase
   multiplier (faster by day); mature crops are a resource + a threat target.
   Bounded (cap ~1200 cells), serializable.
3. **Threat ecology** (`threats.ts`): bounded threat set (cap ~24) spawned at
   gloam/night at world edge; seek strongest signature (greedy + slight noise
   jitter — seeded); contact damages rig condition; idle threats near crops
   consume them; high-speed rig contact repels/destroys a threat at condition
   cost; beacon-lit zone pushes them away. Threats dissolve at dawn.
4. **Dawn record**: on phase transition night→day, compute and store the
   night's score (crops lost/saved, condition lost, threats repelled, mastery
   deltas) into a bounded journal (cap ~30) + last-dawn summary in state.
5. **Verb Mastery kernel** (`mastery.ts`, per ADR-0018): situation hash
   (verb × terrain class × load class × phase × outcome), diminishing returns
   per hash, rank thresholds (novice→practiced→seasoned→master), rank effects
   composed through `effectiveProfile()` as bounded per-verb
   offsets/multipliers. First verbs: `plough`, `tow`. Journey phase inferred
   (found→working from repair/deeds) — full journey deed-gating lands with a
   later unit; schema must not preclude it.
6. **Save schema v6**: crops, mastery state, dawn journal, threat snapshot
   (bounded), phase. Migration v5→v6 preserves ADR-0019's absolute world clock
   and recovery audit; the v1–v5 chain remains readable. Corrupt/unknown
   mastery entries are dropped with clamps, matching existing recovery posture.
7. **Tests** (vitest, alongside existing suites): signature determinism +
   phase/tool effects; sow/grow/harvest cycle + bounds; threat spawn only at
   gloam/night, seek behavior, crop consumption, repel cost, dawn dissolve;
   dawn record correctness; mastery diminishing returns (identical repetitions
   → ~zero gain; varied situations → gain), rank thresholds, `effectiveProfile`
   composition; v5→v6 migration; full-sequence determinism unchanged;
   no-capability-name branches.

## Phase B — presentation + acceptance

1. Renderer: instanced crop states (tilled/growing/mature/eaten), threat
   meshes (signature-hunter silhouettes — listeners/moths, not spider drones;
   primitives consistent with current proof material), threat motion,
   contact/repel feedback through the ADR-0012 perception chain.
2. Audio: threat proximity layer + signature-linked mix (louder rig = more
   danger audible) using the existing procedural audio seam.
3. HUD/field kit: signature meter, night threat indicator (non-audio
   equivalent required), crop count, dawn summary card, mastery rank +
   journey phase display (low-chrome, icon + text + state).
4. `render_game_to_text()` + run-record: extend with crops/threats/mastery.
5. Browser acceptance (`tools/rig-lab-browser-acceptance.cjs`): full
   day→dusk→night→dawn cycle headless-driven, crop cycle, threat contact,
   mastery gain, save/reload, desktop + 390×844 screenshots, zero
   console/page errors.

## Explicitly out of scope (deferred, not forgotten)

- Time trial + ghost replay (next unit; forces ADR-0014 step-4 replay lane).
- Favor/NPCs, Parts inventory loops, full journey deed-gating, fleet sheet UI.
- Second biome, toy-scale, space. Multiplayer. Real-money anything.
- Rapier/dynamics changes (parallel physics-lab workstream owns that surface).

## Boundaries while parallel work is active

Do not modify: `index.html`, `vite.config.ts`, `package.json`,
`src/physics-lab/**`, `tools/physics-lab*`, `docs/**` written by other agents.
Re-check `git status --short` before and after; if unexpected changes appear
inside `src/game/` or `src/main.ts`, stop and report instead of merging
assumptions.

## Acceptance gates (all required before "done")

- `npm run typecheck`, `npm test` (existing 90 + new), `npm run format:check`,
  `npm run build` — all green.
- Browser acceptance green incl. the new night-cycle script.
- Durable docs updated in the same pass: progress.md, WORKLOG.md (append-only,
  only if not concurrently modified — otherwise standalone acceptance doc),
  this plan's status.
- Acceptance report per motto §0.4/§0.4.1 with evidence tiers, verified vs
  inferred, remaining gaps, and an "Anything else?" section.

## Anything else?

Yes. Two standing cautions: (1) threats must stay _ecological_ — readable
hunters of noise/light — or we recreate the "generic spider drone" problem
this slice exists to kill; (2) the night must be **worth** entering: mature
crops harvested at night should carry a bonus or exclusivity, otherwise the
optimal strategy is to sleep through the game's central loop.

## Addendum — 2026-07-26 provenance and sequencing

The operator's “do all” instruction establishes that Farmfall remains an open
workstream. It does not convert the proposed signature formula, threat family,
crop bounds, save version, mastery balance, or presentation into accepted
architecture before implementation evidence exists. Each phase remains subject
to the current code, decision register, tests, browser evidence, and
first-principles review.

## Addendum — 2026-07-26 current-code correction

Do not implement Phase A literally from the older text above:

- the runtime is already save schema v6, so crops cannot “migrate v5→v6”;
- deformation and legacy furrows do not carry cut/fill/verb provenance;
- cached rig telemetry is not gameplay authority;
- an emitter cannot own universal listener weights or falloff;
- Reclamation, Unbound Passage, and this plan currently propose different
  sequencing and require operator arbitration.

[ADR-0025](../decisions/ADR-0025-emission-source-listener-separation.md)
records the proposed source/listener boundary and the source-only evidence
fixture.
[ADR-0026](../decisions/ADR-0026-cultivation-provenance-and-schema-v7.md)
records the proposed cultivation ledger, schema-v7 ownership, and remaining
product choices. RU-0202 and RU-0203 remain open until those gates close; a
passing pure-function test is not ecology or crop-loop completion.
