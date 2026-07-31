# Restoration Loop Design Note

- Date: 2026-07-31
- Status: **design note for implementation**
- Parent: `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §3, Tranche 2
- Related: `docs/reviews/IMPLEMENTATION_DIRECTION_DECISION_LOG_2026-07-31.md`

## Purpose

This note records the restoration-loop direction discussed with the operator and another agent session. It exists so future work does not rediscover the same conversation and so the implementation has a single design target.

The restoration loop is the second tranche of The Road That Was. It must turn a broken tractor into a moving machine in a way that feels like caring for a body, not clicking through a menu.

## Current state

The runtime already wires `vehicle-maintenance.ts`, `workshop-lab.ts`, and `salvage-crafting.ts`. The player currently sees a workshop panel with three sequential actions:

1. **Diagnose** — read a log.
2. **Rebuild** — read a log.
3. **Start engine** — the tractor can now move.

This is functional but not felt. The reward is textual, not embodied.

## Design target

The loop should read as:

```text
Inspect the machine → identify what is broken → act on the broken part →
get an immediate physical response → start the engine → feel motion
```

In game-design terms:

```text
Action → Feedback → Reward → Repeat
```

## Step-by-step specification

### 1. Inspect

**Current:** player clicks "Diagnose" and reads text.

**Target:** the player can see the damage by looking at the tractor.

- Flat or missing tire.
- Smoke from the exhaust.
- Dead or flickering headlight.
- Bent or missing panel.
- A visible leak or spark.

**Implementation:**

- Use existing rig-state condition fields to drive visual state.
- Add a subtle camera emphasis (slow pan or highlight) on the most critical damage on first open of the workshop.
- Keep a non-diegetic "Diagnose" fallback for accessibility: a summary panel that reads the damage aloud/visually.

### 2. Identify

**Current:** diagnosis produces a text log.

**Target:** the player understands the problem through a combination of visual read, sound, and a concise label.

- Hovering or focusing a damaged part shows its name and status.
- The old man (via dialogue surface) can point to the problem in one sentence.
- The summary panel remains available for screen-reader users.

### 3. Act

**Current:** player clicks "Rebuild" and a log appears.

**Target:** the player performs a direct action on the broken part.

- Click the flat tire → mount spare.
- Click the missing panel → patch/strap it.
- Click the dead battery → jump/charge.
- Click the fouled spark → clean/replace.

**Implementation:**

- Convert the workshop panel from three global buttons to a set of clickable part targets.
- Each target maps to an existing maintenance action in `vehicle-maintenance.ts`.
- Actions play a short animation and sound.
- Salvage parts from `salvage-crafting.ts` are consumed here.

### 4. Respond

**Target:** every repair produces an immediate, readable response.

- Tire inflated: the rig visibly rises; suspension settles.
- Panel patched: the silhouette changes; a duct-tape or primer patch appears.
- Battery charged: lights brighten; dashboard indicators flicker alive.
- Spark replaced: engine coughs once, then idles smoother.

**Implementation:**

- Add presentation hooks in `src/game/renderer.ts` or the vehicle animation system for condition-driven visual changes.
- Add short sound cues (engine cough, air wrench, metal clang).
- Keep changes within the existing ADR-0034 boundary (simulation owns physical truth; presentation owns rig-local animation).

### 5. Start engine

**Current:** player clicks "Start engine" and the tractor is drivable.

**Target:** the start action is a deliberate, satisfying moment.

- The starter cranks with sound and vibration.
- On success, the engine catches, exhaust puffs, and the rig is ready.
- On partial repair, the engine may stutter before catching (this is flavor, not failure).

### 6. First motion

**Target:** the player is moving within 60 seconds of launch.

- The first input produces motion immediately after the engine starts.
- The workshop panel auto-dismisses or minimizes.
- The camera settles into chase mode.
- Shell narration confirms the machine is alive with one concise line.

## Accessibility requirements

- The visual damage read must have a text equivalent (screen reader + high-contrast outline).
- The direct-part interaction must be keyboard-focusable.
- The non-diegetic summary panel remains reachable at any time.
- No required action should depend solely on color or subtle animation.

## State machine

```text
[Broken]
   │
   ▼
[Inspect] ──(visual/summary)──► [Identified]
   │
   ▼
[Repair part A] ──(feedback)──► [Part A fixed]
   │
   ▼
[Repair part B] ──(feedback)──► [Part B fixed]
   │
   ▼
[Start engine] ──(crank/catch)──► [Running]
   │
   ▼
[Drive]
```

The exact number of parts is a tuning decision. For the first playable, **two parts** is the target: one obvious (flat tire or dead battery), one discovered (fouled spark or missing panel). This creates a small inspect-and-act arc without becoming a puzzle.

## Persistence

- The repaired state is saved normally through `GameState`.
- The naming moment (after first work) writes `fieldName` to per-save vehicle state.
- The restoration loop itself should be repeatable only if the machine becomes damaged again later; it is not a mandatory ritual every session.

## Audio cues (bounded)

This window adds only the following targeted sounds:

- Engine crank / catch.
- Air wrench / bolt tighten.
- Tire inflate / metal patch.
- Spark clean / electrical zap.

A full audio direction document is deferred until the loop is proven.

## Testing plan

1. **Unit tests:** verify that existing maintenance state transitions still occur with the new presentation paths.
2. **Browser acceptance:** launch the canonical port, open the workshop, inspect the damage, repair two parts, start the engine, and drive within 60 seconds.
3. **Accessibility check:** verify keyboard navigation and screen-reader labels.
4. **Regression:** ensure the old non-diegetic fallback still works.

## Open questions

1. Should the two damaged parts be deterministic for the first session, or seed-derived?
2. Should the old man provide a hint if the player lingers, or remain silent?
3. Should the workshop panel close automatically on engine start, or require manual close?
4. What is the exact sound asset strategy: synthesized tones, recorded samples, or both?

## Anything else?

Yes. The restoration loop is not a separate system. It is a presentation and feedback layer over the existing maintenance/workshop/salvage state. The goal is to make the existing wiring feel like a game.
