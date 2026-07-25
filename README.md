# Rigs Unbound

**Rigs Unbound** is a public browser-game exploration about **vehicles as the playable characters**. A bicycle, tractor, toy car, rocket, fantasy machine, or hybrid vehicle should not merely be a skin: its shape, movement, tools, limitations, history, and upgrades should change which stories and mechanics become possible.

The project is deliberately in **exploration**, not production. No engine, final art direction, backend, economy, or multiplayer model has been accepted yet.

Repository: [github.com/pranaysuyash/rigs-unbound](https://github.com/pranaysuyash/rigs-unbound)

## Current north star

> Build a playful world where every vehicle is a different verb, and where changing place, scale, time, or danger can transform the genre without erasing the player's machine, progress, or consequences.

The recurring loop under investigation is:

1. choose or continue caring for a vehicle;
2. enter a place with opportunities rather than a mode-selection menu;
3. use that vehicle's capabilities to race, build, farm, fight, haul, explore, or rescue;
4. bring back parts, knowledge, relationships, damage, and stories;
5. modify the vehicle and unlock genuinely different possibilities.

## Start here

- [Exploration map](docs/exploration/EXPLORATION_MAP.md)
- [Wide-open concept exploration](docs/exploration/OPEN_WORLD_VEHICLE_GAME_BRAINSTORM_2026-07-25.md)
- [Visual direction preference and variants](docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md)
- [Tractor restoration and modular growth](docs/exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md)
- [Technology and engine options](docs/research/TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25.md)
- [Additional ChatGPT research ingestion](docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md)
- [Game reference atlas](docs/research/GAME_REFERENCE_ATLAS_2026-07-25.md)
- [Risk and public-readiness register](docs/research/RISK_AND_PUBLIC_READINESS_REGISTER_2026-07-25.md)
- [Asset provenance register](docs/research/ASSET_PROVENANCE_REGISTER.md)
- [Kenney asset library audit](docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md)
- [ADR-0001: architecture experiments](docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md)
- [ADR-0002: first playable hypothesis](docs/decisions/ADR-0002-first-playable-tractor-day-night-loop.md)
- [ADR-0003: versioned gameplay-content composition](docs/decisions/ADR-0003-versioned-gameplay-content-composition.md)
- [ADR-0004: versioned public evidence surfaces](docs/decisions/ADR-0004-versioned-public-evidence-surfaces.md)
- [ADR-0005: Rigs Unbound project identity](docs/decisions/ADR-0005-rigs-unbound-project-identity.md)
- [Latest motto compliance review](docs/reviews/motto_review.md)
- [Design direction](DESIGN.md)
- [Worklog and evidence](docs/WORKLOG.md)
- [Implementation progress](progress.md)

## Present boundaries

- The supplied 2026 JavaScript/Python animation, simulation, physics, 2D, and 3D catalog is research input, not a dependency list.
- “Anything goes” describes the exploration space. The shipped game still needs a coherent core loop, performance budget, safety model, and content grammar.
- Multiplayer, accounts, user-generated content, trading, and real-money purchases are separate risk-bearing systems. They will only enter a playable after their player value and authority model are proven.
- Generated worlds will be **seeded and constrained by authored rules**. Procedural does not mean unbounded, unreviewed, or content-complete.
- Public means playable from a link, understandable without the creator present, respectful of player data, and honest about its maturity.
- Public repository visibility is not a software or asset license. Reuse rights remain reserved until a project license is deliberately selected; third-party and generated assets retain their separately recorded terms.

## Evidence status

Current artifacts are planning and primary-source research evidence (Tier 1), plus recorded local structural checks on the documents (Tier 2). There is no runtime, browser, multiplayer, production, or player-test evidence yet.

## Anything else?

The next irreversible-looking choice should be resisted until a tiny competing prototype can answer it. A ten-minute playable that feels alive is more valuable than a large architecture that can theoretically host every idea.
