# World Site Verb Vocabulary Decision

**Date:** 2026-07-26  
**Status:** Implemented as a compile-time world-schema contract  
**Evidence tier:** Tier 1 source inspection. No test, build, browser, or runtime command was run in this pass.

## Decision

The player-facing verb promised by an authored world site is a stable `WorldSiteVerb`, owned by `src/game/world.ts`, rather than an unconstrained string.

`WORLD_SITE_VERBS` now defines the current vocabulary:

```text
restore, till, haul, tow, shrink, wade, ascend
```

## Why

Sites are shared world data consumed by terrain, discovery, navigation, renderer presentation, and rumor enrichment. An arbitrary string allowed a landmark typo or uncontrolled new label to silently diverge across those consumers.

This is deliberately a vocabulary contract, not a generic activity implementation system. A verb does not automatically grant behavior, reward logic, or capability requirements. Those remain owned by simulation/activity/affordance contracts.

## Implementation

- Added `WORLD_SITE_VERBS` and derived `WorldSiteVerb` in `src/game/world.ts`.
- Changed `WorldSite.verb` from `string` to `WorldSiteVerb`.
- Existing authored site records are validated by TypeScript against the canonical vocabulary.
- Preserved literal site IDs with `satisfies readonly WorldSite[]`, then derived `WorldSiteId` from the canonical site table so authored structure references cannot name an unknown site.
- Changed `RouteSegment.from`/`to` to `WorldSiteId` and made route resolution fail at module construction if an impossible reference reaches it, instead of silently dropping a route.
- Added `src/game/world-schema.test.ts` to assert unique site identities, canonical promised verbs, and one resolved route per authored route.

## Extension rule

Adding a new verb requires one deliberate update to the canonical vocabulary and a review of its discovery/UI/rumor/activity meaning. Do not add one-off literal strings in renderer, UI, or activity code.

## Non-goals

- No runtime JSON schema loader was added.
- No activity registry or behavior callback was added.
- No external content/modding format changed.
- No player-visible behavior changed in this edit.

## Validation limit

The contract is compile-time protection for the current authored TypeScript data. Runtime validation is still required before untrusted external content may define site verbs.

## Review passes

### Pass 1 - Immediate correctness

Enumerated every current authored site verb and retained each existing literal unchanged. The edit only narrows the schema type; it does not change discovery, terrain, route, renderer, or activity behavior.

The follow-on route review found that unresolved authored route endpoints previously disappeared during route resolution. The resolver now rejects that invalid canonical data instead of degrading the route network silently.

### Pass 2 - Architecture and long-term viability

Derived `WorldSiteId` from `WORLD_SITES` rather than adding a second hand-maintained ID list. Structure references now use that derived type, preserving one canonical source for landmark identity.

### Pass 3 - Rule compliance and supervision readiness

Recorded source ownership, extension rules, non-goals, and the Tier 1 limitation. Added focused invariant coverage but did not run compile, test, browser, or runtime verification in this pass, so behavior is not claimed as runtime-verified.

## Anything else?

Yes: this vocabulary is intentionally small and product-specific. Future content packs should resolve their verbs through a versioned schema or an approved extension mechanism, not mutate this array at runtime.
