# Rig Capability Vocabulary Decision

**Date:** 2026-07-26  
**Status:** Implemented as a canonical contract vocabulary  
**Evidence tier:** Tier 1 source inspection. No test, build, browser, or runtime command was run in this pass.

## Decision

`RIG_CAPABILITIES` in `src/game/contracts.ts` is the canonical vocabulary for what a machine can claim today. `RigCapability` is derived from that array instead of being maintained as a separate string union.

The same source-of-truth pattern defines `MOBILITY_ADAPTERS` and the derived `MobilityAdapter` type. Capability claims and locomotion adapters remain separate: a capability says what a machine can offer; an adapter owns how that machine moves.

## Current vocabulary

```text
plough, tow, jump, winch, survey, ford, hover
```

## Why

Capabilities are cross-boundary production data:

- rig profiles declare them;
- modules grant them;
- affordances require them;
- state exposes effective composed capabilities;
- activities, future content, replay diagnostics, and authority validation need stable names.

A standalone union is type-safe for local code but cannot itself serve as a runtime-checkable vocabulary for future validated content. The canonical array supplies both the derived type and the ordered source for later validation/UI tooling without adding another registry.

## Boundaries

- A capability is a semantic claim, not a boolean callback or a physics implementation.
- Presence does not itself prove range, mass, attachment compatibility, fuel, terrain, or activity legality; affordance/state validation owns those facts.
- Adapter-specific mechanics remain in their specialised controllers. A shared vocabulary must not force tractors, hover rigs, and future machines through one universal physics function.
- A new mobility adapter requires a specialised controller/probe and explicit profile compatibility; adding a string alone is not an implementation.

## Extension rule

Add a capability only when a real rig/module/world-offer use case requires it. The same decision must identify its owner, validation rule, state/persistence implications, UI/accessibility explanation, replay/authority treatment, and any adapter differences.

Do not create capability strings in activity, renderer, audio, or UI modules.

## Module identity review

`ModuleId` remains a deliberate string union paired with `Readonly<Record<ModuleId, ModuleDefinition>>`. Unlike the capability vocabulary, module definitions are a keyed content table whose exhaustive key/type relationship catches missing or misspelled module records at compile time. `MODULE_IDS` is already derived from that canonical table for runtime iteration.

Do not replace this pair with an independent hand-maintained module-ID array. The current combination is a useful authoring invariant, not a second editable content source.

## Non-goals

- No universal capability plugin runtime.
- No data-pack loader or arbitrary capability callback names.
- No change to current capability composition or player behavior.
- No implication that every vocabulary item already has a second affordance consumer.

## Review passes

### Pass 1 - Immediate correctness

Preserved every existing literal capability and mobility adapter. Changed only their ownership form from hand-maintained unions to canonical arrays plus derived types.

### Pass 2 - Architecture and long-term viability

Kept semantics separate from implementation. The vocabularies enable future validation while retaining current adapter/state ownership and avoiding a generic behavior framework.

### Pass 3 - Rule compliance and supervision readiness

Recorded source ownership, extension requirements, non-goals, and Tier 1 evidence limits. No test, compile, browser, or runtime command was run, so this is not represented as runtime verification.

## Anything else?

Yes: capability vocabulary and affordance parameters must evolve together only when real shared constraints appear. Adding many speculative terms now would weaken the same contract this decision is intended to protect.
