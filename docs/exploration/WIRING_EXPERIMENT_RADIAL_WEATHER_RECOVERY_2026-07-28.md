# Wiring Experiment: Radial Quick-Action, Weather, and Fleet Recovery (2026-07-28)

**Status:** proposed wiring experiment - not yet run  
**Evidence tier:** Tier 1 static source inspection plus experiment design  
**Related modules:** `src/game/radial-ui.ts`, `src/game/weather.ts`, `src/game/fleet-recovery.ts`  
**Related method note:** [Reachability and the Missing Middle](WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md)

## Why these three modules

The reachability room named the radial quick-action wheel, weather, and
fleet-recovery as converging on the same missing middle: one reachable verb
that turns pressure into a visible outcome.

- `radial-ui.ts` already defines the player-facing quick-action vocabulary.
- `weather.ts` already defines deterministic environmental pressure.
- `fleet-recovery.ts` already defines a multi-vehicle recovery primitive.

That makes them a good candidate trio for the first wiring experiment because
they span interface, world condition, and consequence without requiring a new
story system.

## Current reachability anchors

The live runtime already exposes part of the intended route:

- `src/main.ts` surfaces a recovery-specific label, touch action, and
  emergency prompt when a rig is disabled.
- `src/game/control-guidance.ts` already gives recovery its own semantic lesson
  and visible explanation.
- `src/game/mission-propositions.ts` already weights recovery propositions by
  weather phase, so pressure can change the proposition quality.
- `src/game/weather.ts` already defines the deterministic pressure source that
  can make that proposition heavier or lighter.
- `src/game/fleet-recovery.ts` is still isolated and test-only, which makes it
  the right consequence primitive to wire rather than the right place to invent
  a new model.

That means the first wiring route is not "make a new feature from scratch." It
is "connect the existing recovery vocabulary to the existing pressure model
and the existing multi-vehicle recovery consequence."

## Crosswalk to the current activity/command boundary

The experiment should ride the already-proven command boundary rather than
invent a new activity language:

- `resolveControlLesson()` already exposes recovery as a readable lesson.
- `resolvePrimaryAction()` and `executePrimaryActionCommand()` already prove
  the stateful command/result seam for the current primary action path.
- `deriveMissions(...)` already turns state and weather into derived
  propositions, including recovery-shaped opportunities.
- `mission-resolver.ts` and `progression.ts` already carry the consequence
  ledger forward after an accepted outcome.

That makes the experiment a bridge across four existing layers:

```text
control guidance
  -> named action
  -> derived mission proposition
  -> authoritative command/result
  -> progression consequence
```

The first wiring goal is therefore not a new registry. It is to make the
recovery-shaped path visible and reachable across those layers in one
explainable route.

## Crosswalk to the acceptance surface gate

The experiment should also point at the current player-facing acceptance
surface question:

- the contract ledger spec already names a read-only board sourced from
  `publicState`;
- the core loop contract still says the acceptance surface is not yet a settled
  product claim;
- the experiment should therefore use the board/ledger surface as the place
  where the recovery-shaped proposition becomes a player choice, without
  turning it into a second quest authority.

In other words, the experiment is not just about recovery. It is a concrete
probe for whether the read-only contract board can become the accepted mission
choice surface.

## Experiment hypothesis

If these modules are wired into one player-facing route, then:

1. the quick-action wheel can expose a recovery-oriented verb that is visibly
   conditioned by the world state,
2. weather can be read as pressure rather than decoration,
3. fleet recovery can become a concrete, reachable response rather than a
   hidden utility function.

## What the wiring experiment should prove

The experiment is successful if the player can:

- see a recovery-oriented action in the quick-action surface,
- observe weather or surface condition change the value/availability of that
  action,
- trigger a fleet-recovery outcome that has visible state and explanation,
- return to the shell or play state without losing context,
- and understand the difference between "available", "conditional", and
  "unavailable" from the surface itself.

## Proposed first wiring route

The first route candidate is:

```text
disabled or stranded state
  -> recovery lesson / recovery prompt
  -> radial quick-action entry
  -> weather-weighted mission proposition or recovery pressure check
  -> fleet-recovery consequence
  -> visible return to play
```

This is deliberately narrower than "generalize every action." It targets the
single recovery-shaped path that the current code already hints at.

## What would count as a useful failure

If this route cannot be wired cleanly, the failure should tell us which layer is
actually missing:

- if the wheel entry exists but is unreadable, the problem is UI/focus;
- if the lesson exists but the action stays hidden, the problem is control
  surfacing;
- if the proposition exists but the consequence is invisible, the problem is
  mission/progression admission;
- if the recovery consequence exists but the weather coupling is absent, the
  problem is pressure modeling.
- if the board can show the proposition but not admit it as a choice, the
  problem is the missing acceptance surface contract, not the route itself.

That keeps the experiment honest: it should isolate which part of the missing
middle is still unsolved.

## What the experiment must not do

- It must not create a second control authority.
- It must not invent a new weather model.
- It must not make fleet recovery invisible or pointer-only.
- It must not depend on hidden state that only the code can explain.
- It must not add a separate save path or a separate recovery history.

## Proposed wiring shape

```text
radial-ui (visible action vocabulary)
  + weather (deterministic pressure)
  + fleet-recovery (multi-rig consequence)
  -> one reachable verb
  -> one visible feedback path
  -> one recovery explanation
```

The experiment should preserve the shell’s role as presentation and the
simulation’s role as authority.

## Acceptance criteria

The wiring experiment is ready to call successful when:

1. the action can be reached from a player-facing surface,
2. the action’s availability can be explained in plain language,
3. weather conditions can be named as the reason for pressure or availability
   change,
4. the recovery result updates visible state,
5. the path back to play is obvious,
6. the experiment can be described to a player without referencing internal
   module names.

## Evidence to collect

- browser-visible state before and after the action,
- explicit reason codes or visible explanation text,
- a regression test or deterministic probe for the route,
- a note on whether the experiment stayed within the canonical shell/input
  contract,
- a note on whether the action remained readable when weather pressure changed.
- a note on whether the route used the existing recovery vocabulary rather
  than inventing a new control language.

## Open questions

- Should the first wiring target be a radial item that only appears during
  recovery relevance, or a fixed item that changes availability?
- Should weather affect the quick-action wheel directly, or only the recovery
  outcome it feeds?
- Should fleet recovery become a shell-visible helper action before it becomes
  part of the main gameplay loop?

## Anything else?

Yes: this is the first experiment that directly tests whether the repo can turn
one reachable verb into one legible outcome across UI, weather, and recovery.
If it fails, the failure should tell us whether the missing middle is UI,
pressure, or consequence, instead of leaving that ambiguous.
