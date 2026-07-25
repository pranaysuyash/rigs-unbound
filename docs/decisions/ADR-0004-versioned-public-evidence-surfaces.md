# ADR-0004: Versioned public evidence surfaces

- Status: Proposed
- Date: 2026-07-25
- Owner: Product/platform
- Next reviewer: Project owner before the first public deployment

## Context

The project is intended to be built publicly and shared. Generic devlog posts and videos can create interest, but they do not prove browser compatibility, vehicle feel, procedural reproducibility, or whether feedback refers to the current build.

The additional workbook proposes making shareability part of the product: each post can point to a playable vehicle, world seed, challenge, or replay, and feedback can carry enough versioned context to reproduce the experience.

## Decision

Propose four canonical public object types:

- vehicle blueprint/version;
- world recipe/version/seed;
- challenge/version;
- replay/run record.

Conceptual URL shapes:

```text
/vehicle/{blueprintVersionId}
/world/{recipeVersionId}/{seedOrOpaqueShareId}
/challenge/{challengeId}
/replay/{replayId}
```

These are product routes, not authorization or storage contracts. When implemented, each resource gets one canonical route and shared validation rather than duplicate `v2` paths.

## Minimum public loop

```text
publish versioned guest build
→ player reaches first drive without mandatory account
→ build captures version + capability tier + selected run context
→ player creates share or contextual feedback
→ reproducible bundle resolves the same versions/seed/vehicle/events
→ project records disposition
→ a later changelog links the fix or decision
```

## Public surfaces

### Guest playable

- capability and compatibility check;
- understandable limitation/fallback state;
- compact contract and rapid first drive;
- no mandatory account;
- local/exportable progress as documented by the build.

### Vehicle share

- original/fork ancestry;
- versioned blueprint and visible module/capability explanation;
- dependency/license/provenance status;
- compatibility and play/test action;
- no ownership/inventory transfer.

### World/seed share

- recipe/generator/content versions;
- required/suggested capability envelope;
- validation status and known limitations;
- deterministic or explicit “best effort” reproduction status;
- fallback if the exact build is no longer runnable.

### Challenge

- pinned rules, versions, seed, allowed build policy, scoring, expiry/archive behavior;
- no client-authored authoritative score/reward;
- accessibility and assist policy visible.

### Replay/run record

- version/build signature;
- semantic actions/events and checkpoints as needed;
- desync/compatibility status;
- privacy-safe device/performance summary;
- camera/playback/fork/report actions.

## Feedback and bug bundle

Minimum contextual data:

- build/version;
- browser capability class and selected quality tier;
- mode/contract/world/seed references;
- vehicle blueprint/loadout references;
- recent significant game events;
- error class/phase;
- optional replay/screenshot explicitly chosen by the player.

Do not collect:

- raw secrets/tokens;
- unnecessary stable device identifiers;
- unrestricted browsing history/referrer detail;
- raw chat or personal text unrelated to the report;
- precise personal data without a documented need and consent path.

## Initial events to evaluate

- load started/failed;
- first accepted drive input;
- contract started/finished;
- module equipped or rejected;
- world generation failed and validator stage;
- quality tier changed automatically or manually;
- share created;
- contextual feedback submitted.

Every event needs a decision owner, retention period, privacy classification, schema/version, validation, and deletion/export treatment before collection. “Return” analytics are optional and privacy-reviewed rather than automatic.

## Consequences

### Benefits

- Public feedback becomes reproducible engineering evidence.
- Sharing reinforces vehicles/worlds as product objects.
- Engine, performance, generator, and compatibility regressions can be tied to versions.
- Devlogs can show real decisions and before/after play.
- Guest play preserves low entry friction.

### Costs and risks

- Old links and version dependencies create long-term compatibility/storage obligations.
- Public identifiers can leak creator/player information if poorly designed.
- Replays and screenshots can contain UGC or personal data.
- Challenge scores invite cheating and moderation.
- Maintaining many historical builds can be expensive and insecure.
- A public share surface can be mistaken for a supported production service.

## Guardrails

- Opaque share IDs where exposing a seed/object ID creates privacy or abuse risk.
- No secrets, account IDs, or direct personal identifiers in URLs.
- Versioned schemas and explicit compatibility/expiry/archive states.
- Rate limits, access control, abuse reporting, and takedown paths before public creation.
- Immutable evidence bundle plus append-only disposition; do not silently rewrite historical reports.
- Static historical preview/export when an old runtime cannot safely remain executable.
- Public maturity, browser support, data collection, and known issues are visible.
- Sharing a build never transfers owned inventory or economic value.

## Validation plan

Tier 2:

- route/object schema tests;
- invalid, unknown, expired, private, deleted, incompatible, and corrupted ID states;
- privacy scan of example URLs/events;
- deterministic seed/version resolution fixtures;
- replay format and size budget tests.

Tier 3:

- a fresh browser follows a link, enters guest play, reproduces the run context, and submits a contextual report;
- a changed build shows a clear compatibility or archived state rather than silently running different content;
- report bundle reproduces one injected generator, asset, and gameplay failure.

Tier 4:

- external players understand what is public, what is saved, and how to report/withdraw content.

## Rollback or sunset

Before public persistence or payment:

- export available public objects;
- define archival/static-preview behavior;
- define deletion/takedown and account closure;
- publish shutdown/sunset behavior;
- keep the solo build and local save meaningful where practical.

## Revisit triggers

- Link storage/compatibility cost exceeds evidence value.
- Public reports do not reproduce issues.
- Seed exposure enables abuse or spoilers.
- Creator/player privacy needs stronger indirection.
- A single generic share route is demonstrably clearer without weakening type safety or canonical ownership.

## Update Log

- 2026-07-25: Proposed from the additional workbook’s public-build loop; no routes, telemetry, storage, or deployment implemented.

## Anything else?

“Build in public” should produce better decisions, not surveillance or content pressure. A public surface exists only when it helps a player play, share, understand, or report something concrete.

## Addendum (2026-07-25) - public evidence surfaces remain proposed, not yet a live publication layer

- Re-checked the decision against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still fits the solo-lab posture described by the risk register,
  not a public discovery/trading/UGC surface.
- That means the proposed public object types are still just that:
  - vehicle blueprint/version,
  - world recipe/version/seed,
  - challenge/version,
  - replay/run record.
- The current runtime does not yet expose a publication workflow, moderation
  queue, or shareable public object route family for packs or creator content.
- So this ADR remains correctly positioned as the future public-evidence
  boundary, not a live pack-publication service.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.
