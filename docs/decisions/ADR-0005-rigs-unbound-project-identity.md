# ADR-0005: Rigs Unbound project identity

- Status: **Accepted**
- Date: 2026-07-25
- Decision owner: project owner
- Next reviewer: project owner before commercial launch or a major public campaign

## Context

The workspace began under the descriptive local folder name `openworld_1`. That label was useful during exploration but did not express the game’s core fantasy: vehicles are persistent characters whose repair history, attachments, movement, and transformation unlock different ways to inhabit the world.

The project now needs one durable human-facing identity before its existing research, visual exploration, and decisions are published in a GitHub repository.

## Decision

The game and public project are named **Rigs Unbound**.

The canonical GitHub repository is:

`pranaysuyash/rigs-unbound`

The display name uses title case with a space. Machine-facing repository references use the lowercase hyphenated slug `rigs-unbound`. The existing local folder may remain `openworld_1`; it is a filesystem location, not a second product identity.

## Why this path

- “Rigs” accommodates bicycles, tractors, toy cars, improvised hybrids, rockets, and spacecraft without restricting the project to conventional automobiles.
- “Unbound” supports the defining promise: one persistent machine can cross places, scales, activities, and genre-like situations.
- The name is short enough for repository, UI, documentation, and community use.
- One accepted identity removes naming drift while leaving visual identity and world fiction open to exploration.

## Options considered

1. Keep `openworld_1` as the public name.
   - Rejected because it describes a workspace and genre ambition rather than the game’s distinctive player fantasy.
2. Delay naming until after the first playable.
   - Rejected for project identity because the public repository needs a coherent name now.
3. Use **Rigs Unbound**.
   - Accepted by the project owner.

## Consequences and boundaries

- README, progress, exploration, and future public surfaces should use **Rigs Unbound** consistently.
- The repository is public, but public visibility does not grant reuse rights. No project software/content license has been selected in this decision.
- Paid source bundles, including the privately owned Kenney All-in-1 collection, must not be committed wholesale. Selective imports require the existing provenance and license-review gate.
- The accepted project name is not evidence of trademark, storefront, domain, or company-name clearance. That review is required before commercial launch or a major marketing investment.
- The name does not accept an engine, economy, multiplayer model, final art direction, or production scope.

## Validation plan

- Confirm the public repository slug is available and owned by the intended GitHub account.
- Check public-facing tracked files for stale `Openworld 1` / `openworld_1` product references.
- Verify local logs, generated machine context, secrets, and private source-asset locations are excluded or sanitized before the first push.
- Revisit the name after the first playable only if player comprehension, legal clearance, or platform discovery produces contrary evidence.

## Rollback or migration path

GitHub can rename a repository while retaining redirects, and public documentation can migrate through one coordinated identity change. The local folder name does not need to change during that migration. Any future rename must update this ADR, README, repository metadata, package/application identifiers, deployment URLs, and public discovery surfaces as one decision-driven change.

## Update log

- 2026-07-25: Accepted **Rigs Unbound** as the game/project name and `rigs-unbound` as the GitHub repository slug.
- 2026-07-25: Aligned the local checkout directory with the canonical slug at `Game_dev/rigs-unbound`.

## Addendum: local checkout alignment

The project owner subsequently chose to align the local checkout with the public identity. The canonical local directory is now:

`Game_dev/rigs-unbound`

This supersedes the earlier allowance to retain `openworld_1` as the local folder name. It does not change the game name, GitHub slug, remote URL, or any gameplay/product decision.

The directory migration preserved the existing `.git` history and `origin` configuration. Machine-generated `.agent/` and `docs/context/agent-start/` files were regenerated after the move so their absolute paths and project collection identifier reference `rigs-unbound`.

## Anything else?

The name should earn meaning from the restoration-and-transformation journey. It should not become a reason to widen the first playable or imply that every imagined vehicle already exists.
