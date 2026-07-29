# ADR-0039: Browser policy surface split keeps bootstrap/profile public and route-gates diagnostics

- Date: 2026-07-29
- Status: Proposed — operator sign-off required
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [Browser Policy Surface Split](../research/BROWSER_POLICY_SURFACE_SPLIT_2026-07-29.md)
  - [Web Loading and Profile Bootstrap Contract](../research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
  - [Visibility Profile Selection Design](../research/VISIBILITY_PROFILE_SELECTION_DESIGN_2026-07-26.md)
  - [Resource Budget and Fallback Envelope](../research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)
  - [Accessibility and Profile Visibility Live Repo Analysis](../research/ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md)
  - [Browser Loading Progress Issue Review](../reviews/BROWSER_LOADING_PROGRESS_ISSUE_REVIEW_2026-07-28.md)

## Context

Current live probes show the browser shell has a clear route split:

- `#bootstrap-status` is the semantic loading affordance and exposes a
  progressbar while the shell is measuring device performance.
- `#profile-status` is visible on the public shell and narrates the active
  quality profile.
- `#runtime-diagnostics` is hidden on the public shell and revealed on
  `?acceptance=field-02`, where it carries the renderer/backend summary as
  static text.

The public shell is already structurally calm and readable. The acceptance /
developer route carries the deeper runtime summary. The question is whether to
keep this split as the durable policy, or to consolidate the player-facing
warmup narrative further.

Without an explicit decision, the repo risks treating the current route split
as a temporary UI accident instead of a load-bearing browser policy.

## Decision

Keep the current route-gated browser policy:

1. `#bootstrap-status` remains the public semantic loading surface.
2. `#profile-status` remains public and player-facing.
3. `#runtime-diagnostics` remains hidden on the public shell and exposed on the
   acceptance/developer route.
4. The acceptance/developer diagnostics text remains a readable summary, not a
   second public live-status surface.
5. Any later phrasing improvement must preserve this surface split unless a new
   operator-approved policy explicitly changes it.

## Options considered

### 1. Collapse diagnostics into the public shell

Rejected.

Why: it adds noise to the public experience and blurs the boundary between
player-facing state and acceptance/developer evidence.

### 2. Hide diagnostics everywhere

Rejected.

Why: it would remove useful acceptance/developer visibility and make the route
split less helpful for debugging and policy checks.

### 3. Keep the current route-gated split

Proposed.

Why: it preserves a calm public shell while keeping the deeper runtime summary
available on the acceptance/developer surface.

## Consequences

### Positive

- public shell stays calm and readable;
- bootstrap/profile remain the only live public surfaces the player needs to
  parse;
- acceptance/developer routes keep the deeper runtime summary available;
- diagnostics remain visible where they help most, without becoming a public
  HUD commitment.

### Trade-offs

- the player-facing warmup story still has to be phrased carefully so it reads
  coherently;
- reviewers must remember that acceptance/developer diagnostics are route-gated
  and static-text, not a second live status region.

## Validation plan

Before this ADR is ever promoted beyond Proposed, verify:

- the public shell still hides `#runtime-diagnostics`;
- the acceptance route still shows the renderer/backend summary;
- `#bootstrap-status` remains semantic progress while measuring;
- `#profile-status` remains visible on the public shell;
- any phrasing changes preserve this route split in live browser probes.

## Rollback / migration path

If the policy changes later:

- keep the current browser-policy note as the historical snapshot;
- update the acceptance and research notes together;
- record the new route split or consolidation decision in a successor ADR;
- avoid leaving both the old and new public-shell contracts live at once.

## Owner or next reviewer

Operator approval required.

Next reviewer: project owner / operator.

## Revisit trigger

Revisit this ADR if:

- the public shell should expose diagnostics directly;
- the acceptance/developer route is removed or renamed;
- the loading/profile story is consolidated into one new public surface;
- a stronger operator-approved browser policy supersedes the current split.

## Update log

- 2026-07-29: proposed the current browser-policy split as a durable decision
  so the public shell, acceptance route, and diagnostics route each have an
  explicit role.
