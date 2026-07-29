# Public Asset Promotion Player-Gate Evidence Note

- Date: 2026-07-28
- Status: evidence note; operator approval still required for promotion
- Evidence tier: Tier 1 synthesis plus Tier 4 developer-surface bridge proof
- Related ADR: [ADR-0038: Public asset promotion boundary separates runtime-tested bridges from public approval](../decisions/ADR-0038-public-asset-promotion-boundary-separates-runtime-tested-bridges-from-public-approval.md)
- Related package index: [Public Asset Promotion Package Index](PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- Related review: [Player Asset and Seed Boot Boundary Review](PLAYER_ASSET_AND_SEED_BOOT_BOUNDARY_ISSUE_REVIEW_2026-07-26.md)

## Purpose

This note explains why the player surface is still protected even though the
developer bridge is live.

The repo now distinguishes three different things:

```text
developer bridge proof -> runtime-tested import and browser visibility
player gate -> build-time exclusion of unapproved runtime files
public approval -> explicit operator sign-off for player-safe truth
```

That separation is deliberate. It prevents runtime observability from being
mistaken for public approval.

## What is already proven

- The developer browser surface can load both imported GLB bridge candidates.
- The runtime bridge list reports both assets as loaded with fallback inactive.
- The player distribution boundary still keys off `publicRuntimeApproved`.
- The build gate and player-asset review path reject unapproved runtime files
  from player output.
- The public-approved set remains empty until operator sign-off is recorded.

## What that means for the first public candidate

The first candidate remains `kenney-car-kit-breakable-crate-fixture`.

Why this is still the right first public asset:

- it is the smallest runtime bridge candidate;
- it is less semantically entangled with core rig behavior;
- it already proved live in the developer surface;
- it is easier to roll back or replace if needed.

The tractor preview remains developer-only proof because it is a useful bridge
scale test, not the first player-facing promotion candidate.

## What this note does not prove

- It does not approve the crate for player distribution.
- It does not change `publicRuntimeApproved`.
- It does not replace the approval record or the checklist.

## Relationship to the gate trail

Use this note together with:

- the approval-record template;
- the first public candidate checklist;
- the public asset promotion workflow;
- ADR-0038;
- the player-asset build gate review.

That combination gives the repo one complete story:

1. runtime bridge proof exists;
2. player distribution remains closed;
3. public approval is still a separate operator decision.

## Anything else?

Yes: if a reviewer cannot distinguish proof, gate, and approval after reading
this note, the asset promotion trail is still too implicit.
