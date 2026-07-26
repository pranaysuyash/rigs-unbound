# ADR-0020 — Contextual first-use control guidance

- Date: 2026-07-26
- Status: Accepted and implemented locally
- Owner: Rigs Unbound interaction shell
- Related runtime: Field 02

## Context

Rigs Unbound adds controls as the active rig, fitted capabilities, nearby
objects, condition, and world knowledge change. A permanent key list supports
recall, but it does not explain a control at the moment its meaning becomes
relevant. A single front-loaded tutorial would also teach actions before the
player has enough context to understand them.

The solution must work for keyboard and touch, preserve semantic actions, and
remain independent from rig identity and gameplay progression.

## Decision

1. Introduce a control when its gameplay context first becomes relevant.
2. Show at most one non-modal lesson at a time. Urgent recovery and contextual
   actions lead; optional spatial-literacy controls follow.
3. Explain both the action's purpose and its current keyboard/touch input.
4. Retire a lesson when the player performs the action or chooses `Got it`.
5. Persist learned lesson IDs as a browser-local UI preference under
   `rigs-unbound.control-lessons.v1`.
6. Keep lessons outside the save schema, activity contract, capability state,
   and progression rules. A missing, malformed, or cleared preference simply
   allows the explanation to appear again.
7. Resolve lessons from semantic context. Central gameplay code does not branch
   on tractor, buggy, or skimmer names.

The first implemented lesson set covers drive, contextual act, workshop fit,
blade use, camera selection, surveyed map, nearby rig switching, and recovery.

## Options considered

- Teach every input on entry: rejected because it front-loads unfamiliar
  actions and obscures the playable world.
- Keep only the permanent control strip: rejected because recall labels do not
  explain why a newly available action matters.
- Store tutorial completion in world saves: rejected because input education
  is a player-interface preference, not world history.
- Add an always-on minimap tutorial: rejected because Field 02's map is
  deliberately surveyed knowledge with fog-of-war semantics, not a universal
  radar. It is introduced when map reading becomes relevant.

## Consequences

- New players receive an explanation at the point of need without losing
  control of the rig.
- Keyboard and touch remain two input sources for the same semantic action.
- Future rigs and capabilities can add bounded lesson content without editing
  world rules or save migrations.
- The current browser-local preference is per browser profile. A future account
  sync or input-remapping system may choose to carry it across devices.

## Validation

- Tier 2: pure resolver tests cover fresh entry, contextual priority, workshop
  relevance, learned-tip suppression, recovery priority, and malformed local
  preference recovery.
- Tier 3: production browser acceptance confirms the fresh `drive` lesson,
  keyboard and touch descriptions, and retirement after real forward input.
- Tier 4: desktop and 390×844 screenshots confirm the lesson is readable and
  does not cover the permanent desktop controls or mobile direction buttons.

## Rollback and migration

The feature is additive. Removing the DOM renderer and resolver calls leaves
gameplay state untouched. The local preference can be ignored or versioned
without save migration.

## Revisit triggers

- Controls become remappable or input glyphs become device-specific.
- Account-level preferences need cross-device synchronization.
- Human playtests show lessons appear too early, too often, or during unsafe
  driving moments.
- More than one newly relevant action regularly competes for attention.

## Next reviewer

The input-remapping and accessibility owner should reuse the semantic lesson
IDs and replace literal input labels with resolved glyphs rather than creating
a parallel tutorial system.

## Anything else?

The permanent control strip, contextual prompt, and first-use lesson serve
different jobs: recall, immediate affordance, and explanation. They should share
semantic action truth while remaining distinct presentation layers.
