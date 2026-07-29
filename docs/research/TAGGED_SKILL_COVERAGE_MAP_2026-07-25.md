# Tagged skill coverage map — 2026-07-25

## Purpose

Answer one question honestly:

> Have all user-tagged skills been analyzed and applied to Rigs Unbound?

No. A useful subset has been applied with durable evidence, several subjects
have been researched without skill-specific provenance, and many overlapping or
alternative-stack skills remain deliberately unexercised.

This map prevents four different states from being collapsed into “analyzed”:

1. a skill was named;
2. its `SKILL.md` was read;
3. its guidance changed a project artifact or implementation;
4. that change was verified in the actual game.

Only states 3 and 4 count as applied.

## Evidence durability status

This map is currently shared-worktree evidence, not yet committed/pushed Git
evidence. It becomes a canonical audit only after the moving parallel batch is
stabilized, reviewed, grouped, verified, and committed.

## Evidence classes

- **Applied and evidenced**: skill guidance is named in durable artifacts and
  tied to code, research, tests, generated assets, or deployment evidence.
- **Topic covered; skill provenance incomplete**: the repo covers the subject,
  but cannot prove that the specifically tagged skill was read and applied.
- **Alternative/deferred**: useful only when a named decision or experiment
  activates it.
- **No durable evidence**: no project artifact proves application. This does
  not prove that no agent ever opened the skill; it means the work is not
  auditable.

## Applied and evidenced

| Skill family               | Evidence and present value                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `game-development`         | Orchestration and architecture audit in `MULTI_SKILL_LONG_TERM_POSSIBILITY_AUDIT_2026-07-25.md`                                |
| both `3d-games` variants   | Renderer, physics, culling, collision, streaming, replay, resource, accessibility, and authority contracts                     |
| `3d-web-experience`        | Browser delivery, fallback, mobile/accessibility, and web-asset constraints                                                    |
| `web-games`                | Browser-first runtime and delivery framing                                                                                     |
| `threejs-fundamentals`     | Current Three.js architecture and renderer baseline                                                                            |
| `threejs-materials`        | Material/readability recommendations and strategy contract                                                                     |
| `threejs-shaders`          | Shader strategy, explicit deferral, and fallback rules                                                                         |
| Browser/Playwright tooling | Full desktop/narrow gameplay acceptance and production verification; exact tagged Browser-plugin provenance remains incomplete |
| Sites                      | Existing public deployment adapter, immutable version flow, rollback, and deployment runbook                                   |
| image generation           | Concept sheet and isolated tractor reconstruction reference, both governed by provenance and promotion gates                   |

Additional useful skills not in the original tag set were also applied:

- `3d-asset-production`;
- `img2threejs`;
- `game-design`;
- `game-audio`;
- `hig-foundations`;
- accessibility auditing.

## Topic covered; tagged skill provenance incomplete

These subjects have substantial project work, but the specifically tagged skill
cannot yet be credited as applied:

| Tagged family                                  | Existing topic coverage                                                        | Missing proof                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `game-art` variants                            | visual direction, tractor model sheet, asset provenance, reconstruction intake | explicit game-art skill review and art-production acceptance                                  |
| `game-testing`, `game-playtest`                | deterministic tests and full browser acceptance                                | skill-specific test strategy and external-player playtest protocol                            |
| `game-ui-frontend`, `threejs-game-ui-designer` | HUD, prompts, responsive touch, accessibility work                             | subject is covered; exact wrapper application and workshop/progression flow proof are missing |
| `multiplayer`                                  | authority, replay, state ownership, abuse, and staged social roadmap           | applied multiplayer skill plus a bounded network experiment                                   |
| `web-3d-asset-pipeline`                        | manifest, provenance, preflight, GLB promotion gates                           | explicit plugin-skill provenance and one approved runtime GLB                                 |
| `threejs-postprocessing`                       | effect/readability strategy and generated intake experiment                    | measured in-game postprocessing decision                                                      |
| `threejs-interaction`                          | semantic inputs, actions, affordances, touch/gamepad                           | explicit interaction-skill audit                                                              |
| `threejs-animation`                            | perception chain and procedural motion                                         | authored animation pipeline proof                                                             |
| `threejs-textures`                             | PBR reference extraction and material policy                                   | runtime texture/compression fixture                                                           |
| `threejs-lighting`                             | lighting/atmosphere contract                                                   | applied skill and tiered runtime lighting evidence                                            |
| `threejs-geometry`                             | primitive rigs, instancing, generated blockout                                 | applied skill and accepted geometry/LOD fixture                                               |
| `threejs-loaders`                              | asset-ingest and failure contracts                                             | actual validated GLB loader in the game                                                       |
| `webgpu`                                       | technology research and fallback policy                                        | representative-device WebGPU/WebGL comparison                                                 |
| `2d-games`, Phaser                             | engine/options research                                                        | a decision-triggered 2D mechanic spike                                                        |
| `wide-open-brainstorm`                         | broad product brainstorm exists                                                | explicit skill provenance and role/hat audit                                                  |

## No durable evidence of application

The following tagged surfaces have no durable proof of **exact skill
application**. Some were considered comparatively or cover subjects already
researched elsewhere; they must not be described as absent from consideration:

- the `game-studio` umbrella skill;
- `game-studio:game-playtest`;
- `game-studio:game-ui-frontend`;
- `game-studio:web-3d-asset-pipeline`;
- `game-studio:sprite-pipeline`;
- `game-studio:web-game-foundations`;
- `game-studio:react-three-fiber-game`;
- `game-studio:three-webgl-game`;
- `game-studio:phaser-2d-game`;
- `threejs-gameplay-systems`;
- `threejs-game-ui-designer`;
- `threejs-game-director`;
- `threejs-3d-generator`;
- `r3f-drei`;
- `threejs-skills` as an umbrella;
- `develop-web-game`;
- Webwright;
- Chrome DevTools skill guidance.

Several are overlapping wrappers around capabilities already present. They
should be activated when a concrete decision or proof slice needs them, not
read ceremonially so the checklist reaches 100%.

## Alternative stacks deliberately deferred

These skills should remain comparative tools rather than becoming parallel
runtimes:

- React Three Fiber and Drei;
- Phaser and the broader 2D runtime path;
- alternate Three/WebGL game starters;
- WebGPU-only rendering;
- sprite production as a second world renderer.

They become relevant only if the current Three.js runtime fails a measured
contract or a bounded mechanic is genuinely better served by a different
representation. Until then, applying them broadly would create architecture
theatre and duplicate truth sources.

## Own next call: prove the restoration fantasy

The next primary product slice should be **Torque Restoration Proof 01**, not a
second general skill-reading pass. This is a completion and refactor of the
existing workshop, salvage, module, capability, and persistence substrate—not a
second progression system.

The slice:

1. starts Torque visibly dilapidated and mechanically limited;
2. asks the player to earn salvage through the existing connected world;
3. lets the player return to the workshop and choose one of two functional,
   visually distinct upgrades;
4. changes silhouette, handling, available action, and tradeoff—not only a
   number;
5. persists the installed module and vehicle condition through reload;
6. creates one clear before/after shareable moment.

This tests the unique thesis—vehicle as character, history, capability, and
progression—more directly than another renderer, engine, or vehicle-family
experiment.

## Execution in commit and decision units

### Gate 0 — stabilize current parallel work

- inventory the current research, accessibility, asset-preflight, generated
  intake, screenshots, and proposed ADRs;
- validate and group them without discarding or mixing moving work;
- establish the current clean baseline before changing gameplay.

### Decision 1 — restoration and composition contract

Record one ADR covering:

- found/restored component stages;
- hardpoints, shared support budgets, module ownership, and compatibility;
- salvage spending;
- visual and physics effects;
- install/swap rules;
- persistence and migration;
- rollback and observable invalid-composition recovery.

### Commit 1 — canonical composition and migration

- versioned restoration, component, and owned-module state;
- hardpoint, shared-budget, and compatibility validation;
- deterministic migration from the current module-ID arrays without silent
  loss;
- typed install/repair outcomes;
- tests for insufficient funds, conflicts, retries, invalid saves, and exact
  round trips.

### Commit 2 — honest opening and earned restoration

- a reliable but visibly dilapidated `found` Torque;
- a deterministic near-home salvage lead;
- the canonical workshop transition that restores the front mount and broad
  plough;
- preserved movement, cargo, world memory, and other rigs.

### Commit 3 — visible support choice

- recovery winch versus survey mast through one meaningful support budget;
- visible sockets and snapshot-driven broken/restored/module geometry;
- semantic preview/confirm controls with keyboard and touch support;
- explicit gained action and performance cost;
- handling/action changes through existing capability adapters.

### Commit 4 — player proof

- full browser acceptance;
- save/reload and invalid-data coverage;
- narrow layout and reduced-motion checks;
- external-player comprehension prompt;
- public deployment only after the exact-source release gate passes.

## Skills to activate for that slice

Apply skills by responsibility:

- `game-art` and the asset pipeline for visible upgrade language and promotion;
- game UI skills for the workshop choice and explanation;
- gameplay-system/director skills for the restoration loop and consequences;
- Three.js geometry/material/lighting/interaction skills only where the two
  upgrades need them;
- game-testing and game-playtest for deterministic and player-comprehension
  evidence;
- Sites only at the exact-source release gate.

Keep multiplayer, WebGPU, R3F, Phaser, broad sprite work, and open creator
systems deferred. None is needed to prove this slice.

## Acceptance signal

The slice succeeds when a new player can answer, without reading project docs:

1. what was wrong with Torque;
2. what they did to earn the upgrade;
3. which upgrade they chose;
4. what capability and cost changed;
5. why their Torque now feels like their machine.

## Anything else?

Skill coverage is not the product. The correct long-term workflow is to maintain
this audit, activate the best skill set for each proof slice, and turn guidance
into verified player value. Reading every overlapping wrapper before the next
playable improvement would delay the strongest available learning.

## Addendum (2026-07-28) — the skill-development lens says the audit itself is the durable artifact

- Re-read the `Skill Development` guidance against the current skill-coverage
  map and the parallel handoff trail.
- The important repo behavior is already visible:
  - skills are being used one at a time,
  - the resulting docs distinguish “read,” “applied,” “proven,” and
    “deliberately deferred,”
  - and the parallel-runtime boundary remains explicit so another agent does
    not have to guess where to land.
- The skill-coverage map should therefore be treated as a provenance ledger,
  not as a checklist to exhaust mechanically. The value is in preserving why a
  skill was chosen, what artifact it changed, and what evidence still remains.
- The next agent should read this map as the shortest path to the live
  boundary, then continue from the named handoff or slice instead of redoing
  the entire skill inventory.
- Evidence depth: Tier 1 static review of the skill guidance and the current
  coverage map. No runtime or code change was needed for this addendum.
