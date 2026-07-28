# Dynamics Direction from First Principles — solver, authored, or hybrid

Date: 2026-07-27
Status: **exploration; no decision taken. ADR-0023's pause on solver/backend work remains in force.**
Trigger: operator direction 2026-07-27 — "explore whatever is long term 1st
principles" for the dynamics question, in place of signing off ADR-0023.
Sources: ADR-0007/0009/0017/0023, physics-lab and Box3D acceptance reviews,
the browser vehicle-physics catalog, and `src/game/physics.ts`.

## 1. The question, reframed

"Which physics engine?" is the wrong question, and the project's own canon
proves it. DESIGN.md's invariant is _vehicles are characters_: handling
identity is **characterization** — `driveForce`'s lugging falloff
(`physics.ts:145-158`) is why "you need a run-up at that hill" is a learnable
fact about Spark. A general solver computes plausible motion; it does not
know that Torque should feel deliberate.

The first-principles question is:

> **Which physical consequences does the game want to _mean_ something, and
> what is the cheapest honest generator for each meaning?**

That decomposes the problem: locomotion feel is a meaning the authored layer
already generates well (342-test deterministic baseline, two contrasting
families, save migration, grade-as-progression). Joints, unstable cargo,
rollover, and destruction are meanings the authored model _cannot_ generate
(ADR-0007 §3 is explicit: three rotational DOF on springs cannot tumble; no
joints, no stacking, no real hitch dynamics). The solver question is only
ever about the second list.

## 2. Honest evidence inventory (what is actually proven)

- **Authored adapters prove**: a shipped, deterministic, migratable baseline
  with authored feel for two families. They fail structurally at: rollover,
  articulation, stacking, real hitch dynamics.
- **Rapier lab proves**: the _port_ is executable (intent → project-owned
  contract → solver → plain-data capture/telemetry), same-runtime
  determinism, ~0.10 ms step. It does not prove player feel, cross-runtime
  determinism, representative-device perf, or articulation. 593 kB gzip WASM.
- **Box3D probe proves**: a second wheel family fits the same port (forcing
  the good `DynamicsService` split), at 215 kB gzip. It fails semantic
  outcomes (contact telemetry is an AABB estimate), collision semantics, and
  wrapper maturity (unofficial, untyped, young).
- **Neither lab ranks engines.** Rapier-raycast vs Box3D-physical-wheel is a
  solver-plus-controller _bundle_ comparison; per ADR-0023 §4 it must never
  be cited as an engine verdict.

## 3. Three candidate long-term positions

**A. Authored core + targeted solver services** _(catalog's hybrid; the
default posture)_ — locomotion always authored per family; solvers admitted
per-capability (joints, unstable cargo, CCD events) as bounded services
behind `DynamicsService`-shaped ports that never own the rig's transform or
identity. Preserves determinism, bundle, and feel absolutely. Costs: an
honest coupling seam between solver-simulated attachments and authored
locomotion (unbuilt anywhere); bespoke admission per capability.
_Discriminator: the articulated towing/lifting/recovery experiment — if the
coupling seam reads coherently in play within browser budgets, A wins._

**B. Solver-core with authored tuning layer** _(ADR-0017's original shape,
done honestly)_ — full rigid-body rigs; character lives in a controller layer
above the solver. Makes articulation/rollover/destruction native. Costs:
determinism becomes a proof obligation (insertion order, JS transcendentals);
WASM on the critical path; the highest rig-character risk — raycast wheels
"still require authoring the same handling curve, so the cost is paid either
way" (ADR-0007). _Discriminator: the rig-character gate — solver chassis
running Torque/Spark/Drift profiles must stay statistically separable and,
ultimately, player-distinguishable (Tier 4/5)._

**C. Dual-track per family** _(the audit's synthesis)_ — each controller
family independently chooses authored or solver-backed at admission time.
Maximally honest to the vehicle-universe thesis; highest lifecycle burden and
the most variance pushed into save/replay/telemetry contracts.
_Discriminator: whether the second and third admitted families reuse the port
machinery cleanly (as the raycast/physical-wheel split did) or fork it._

The docs' own trajectory: catalog → A; ADR-0017-as-written → B;
ADR-0023 → procedurally neutral, structurally closest to C-with-A-as-default.

## 4. The load-bearing insight: two design decisions precede any solver evidence

ADR-0007's flip trigger lists articulated trailers, destructibles, and
**rollover as a fail state**. These are _design_ decisions the operator can
make today, and making them reopens ADR-0007 regardless of ADR-0023's status:

1. **Is rollover a desired fail state?** If yes, authored-only is
   disqualified for that family _by construction_ — no benchmark needed. It
   fits the fiction (recovery gameplay, strain narrative, scars on the
   machine) but costs a 6-DOF body somewhere.
2. **Is an articulated towing/lifting/recovery activity a named product
   requirement?** If yes, ADR-0023's proposed first experiment has its
   player-fantasy question and the A-vs-B-vs-C discriminator exists.

If both are no for the foreseeable game, position A with zero solver
services is the honest answer and the labs remain fixtures. This is a real
option, not a failure.

## 5. Recommended posture (exploration recommendation, not a decision)

1. **Default to A.** It is the only position consistent with every accepted
   invariant (determinism, authored feel, bundle discipline, capability-first
   grammar) and with ADR-0023's semantic-outcome gate (gameplay consumes
   project-owned meanings, not contact manifolds).
2. **Let design, not benchmarks, pull the trigger.** Answer the two design
   questions in §4 first. If articulation is a requirement, run ADR-0023's
   first question as an A-shaped experiment (joint service coupled to
   authored locomotion) before any B-shaped one — it is cheaper and its
   failure mode is informative rather than corrupting.
3. **Keep the labs as fixtures and hold the bundle-comparison rule.** The
   existing Rapier/Box3D data answers "does the port host two families?"
   (yes) and nothing more.
4. **Provenance hygiene before leverage.** The audit flags ADR-0006,
   ADR-0012, and ADR-0021 as needing sign-off re-checks; do that before any
   position is built on them. Public-lab route disposition (keep / dev-only /
   separate deployment) is an independent open operator decision.

## 6. Operator decision points surfaced (not decided here)

1. Rollover as a fail state: desired or excluded? (design)
2. Articulated towing/lifting/recovery activity: named requirement or not?
   (design; becomes ADR-0023's first experiment if yes)
3. ADR-0023 disposition after this exploration: sign off its evidence program
   (no-global default, nine gates, first question) or keep the pause.
4. Public physics-lab route: keep, dev-only gate, or separate deployment.

## Anything else?

Yes. The terrain-face traversability addendum (ADR-0007, 2026-07-26) quietly
created the first _solver-independent_ physical boundary above the adapters —
a semantic refusal (`terrain-face`) that any future solver service must also
honor. That is the template position A needs: physical truth expressed as
project-owned meaning, generator-agnostic. Whoever builds the articulation
experiment should copy that pattern exactly, and the fair-comparison harness
should treat cross-runtime determinism as a _reported divergence_ metric, not
a promised property — the honest version of the determinism contract is "we
measure and publish drift," which is also the only version compatible with
ever shipping a solver.
