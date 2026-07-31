# Rigs Unbound Game Visuals Discovery and Approval Package

Date: 2026-07-29  
Status: **Part 0 complete, implementation approval pending**  
Evidence posture: Tier 1 static inspection, Tier 2 automated baseline, Tier 4 visual inspection of existing repository captures  
Scope: game visuals only. No implementation files were changed during this discovery pass.

## Approval request

The attached existing-project prompt requires an approval gate before visual
implementation. This document is the project-specific execution brief and
approval package for that gate.

Recommended approval is to execute the bounded visual-quality lane described in
Section 11, subject to one explicit runtime-ownership confirmation:

> Clear the current `src/game/` visual/runtime files for this visual pass after
> each pre-edit recheck, or narrow the approved work to the non-runtime asset,
> documentation, and evidence surfaces.

The repository currently contains uncommitted parallel work in `src/game/`,
including `renderer.ts`, `gameworld.ts`, `state.ts`, and related tests. The repo
instruction at `AGENTS.md` says not to edit `src/game/` unless the owner clears
the collision. Approval of this package without that clearance authorizes the
documentation and asset-review workstreams only.

## 1. Instruction Applicability Map

| Source | Scope and priority | Rules relevant to game visuals | Current status |
| --- | --- | --- | --- |
| `/Users/pranay/AGENTS.md` | Global workspace rules | Preserve parallel work, read current state, use durable docs, no unapproved git writes, test and report evidence honestly | Current, loaded |
| `/Users/pranay/Projects/AGENTS.md` | All Projects repos | Additive and comprehensive work, search with `rg`, use canonical docs, no duplicate systems, use relevant skills, keep docs and runtime aligned | Current, loaded |
| `AGENTS.md` | Rigs Unbound repo, nearest scoped rule | `src/game/` may be parallel-owned; do not edit it without explicit clearance; use port 4173; run typecheck and Vitest before implementation completion claims | Current, loaded |
| `motto_v4.md` | Rigs Unbound doctrine | Whole-answer mandate, evidence tiers, approval before material decisions, ADR-first load-bearing decisions, documentation continuity, runtime ownership, no status inflation | Current and canonical, loaded |
| `docs/context/agent-start/SESSION_CONTEXT.md` | Generated project context | Current project identity, paths, retrieval anchors, and startup rules | Regenerated 2026-07-29 |
| `docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt` | Generated startup handoff | Recheck dirty state, use current files, preserve parallel work, use canonical motto and docs | Regenerated 2026-07-29 |
| `DESIGN.md` | Project visual direction | Patchwork Atlas lead, vehicles as characters, readable camera grammar, low-chrome field kit, asset provenance and anti-slop rules | Exploratory direction, not final art approval |
| `docs/decisions/README.md` | ADR navigation and status | Proposed decisions require operator sign-off; update index when ADR status changes | Current, existing changes preserved |
| `docs/plans/MASTER_EXECUTION_TRACKER.md` | Execution status | Record evidence and status transitions; keep visual and runtime lanes explicit | Current, existing parallel changes preserved |
| `docs/WORKLOG.md` and dated addenda | Durable chronology | Use dated addenda for substantial work; preserve historical reasoning | Current, existing parallel changes preserved |

### Skills used for discovery

- `3d-games`: rendering, camera, lighting, LOD, culling, and performance
  principles. Applied to the renderer and proposed acceptance gates.
- `game-art`: visual-style selection, silhouette readability, material and asset
  pipeline principles. Applied to the Patchwork Atlas and field-plough review.
- `3d-web-experience`: browser 3D loading, fallback, model-size, and mobile
  constraints. Applied to the browser visual and fallback proposal.
- `Browser Daemon`: read for the intended interactive QA workflow. The specific
  legacy path in that skill is not installed at the referenced location, so the
  repository's canonical browser harness and port 4173 remain the source for
  future runtime evidence.

No plugin is required for this discovery pass. No recommended remote plugin was
installed or used. Image generation was not run because Part 0 forbids
unapproved asset replacement and the repository already has an active,
provenance-gated asset lane.

### Instruction conflicts and resolution

The attached prompt asks for a complete visual discovery and an explicit
approval before implementation. The repo rule permits documentation and
read-only inspection but protects `src/game/`. These rules are compatible:
discovery and this package are allowed now; renderer/runtime implementation is
held until the owner approves the scope and clears the contested runtime files.

## 2. Project Reconstruction Report

### What Rigs Unbound is

Rigs Unbound is a browser-based 3D vehicle game prototype under the accepted
project identity in `docs/decisions/ADR-0005-rigs-unbound-project-identity.md`.
The durable product thesis is a machine-keeper odyssey: the player restores
machines, learns their physical differences, uses them to reconnect places and
communities, and carries a persistent workshop through a remembered world.

### Current reality

- The primary runtime is a Vite and Three.js browser application.
- Fixed-step gameplay state, world memory, save migration, commands, and
  simulation contracts live outside the renderer.
- The renderer reads terrain, obstacles, exploration, settlement, ecology, and
  infrastructure state. It creates presentation only.
- The current scene uses project-owned procedural geometry, instanced terrain
  props, water, field/furrow presentation, settlement structures, lamps,
  residents, ecology actors, dust, and several vehicle silhouettes.
- The live shell has a DOM field kit, low-chrome controls, camera selection,
  accessibility surface, local-save status, and a first-entry field dialog.
- Existing visual captures demonstrate a repaired tractor, a compact buggy, a
  hover skimmer, a settlement/causeway state, and a survey view.
- The current browser development surface is canonically port 4173, enforced by
  `tools/start-canonical-dev-server.cjs` and `vite.config.ts`.

### Discovery evidence captured on 2026-07-29

| Check | Outcome | Evidence tier |
| --- | --- | --- |
| `/Users/pranay/Projects/agent-start --project /Users/pranay/Projects/Game_dev/rigs-unbound` | Completed; context pack regenerated and `motto_v4` is the canonical doctrine surface | Tier 1 |
| `node tools/start-canonical-dev-server.cjs` | Existing canonical server responded on `http://127.0.0.1:4173`; no alternate port was used | Tier 3 |
| `npm run typecheck` | Passed, including the deterministic-kernel probe typecheck | Tier 2 |
| `npx vitest run` | Passed: 87 test files, 528 tests | Tier 2 |
| `npm run assets:preflight` | Passed: 18 manifest entries, zero errors | Tier 2 |
| Visual inspection | Inspected the current causeway entry capture, ecology survey capture, and field-plough controlled comparison | Tier 4 |
| Git preservation check | `main` at `f0336ea`; dirty tracked and untracked work was already present across runtime, assets, docs, and tests before this package; no cleanup, staging, commit, reset, checkout, or deletion was performed | Tier 1 |

The inspected captures show a strong Patchwork Atlas color and shell language,
but also show the first-entry card covering most of the scene, a survey state
where the rig is small relative to the field kit, and a field-plough blockout
that is structurally useful but not production art. These are observations of
the current artifacts, not claims about external-player preference.

### Documented intent

`DESIGN.md` describes Patchwork Atlas as the leading visual language:
tactile hand-built diorama environments, bold readable machine silhouettes,
visible repair seams and material history, restrained biome color, clear
interaction cues, and diegetic world-state changes. Signal Noir is a danger and
information-state transformation. Salvage Opera is a rare region or event
crescendo, not the default scene treatment.

The visual promise is not photorealism. It is machine character and world
memory: a player should infer what the machine can do, what happened to it, and
which local opportunity or distant possibility is calling.

### Implemented scope

- Camera policies for chase, hood, side, tactical, top-down, and survey roles.
- Presentation signals for day, gloam, night, weather, traction, water,
  settlement lamps, settlement residents, traffic, and ecology.
- Procedural vehicle silhouettes for Torque, Spark, and Drift.
- Visibility profiles and runtime diagnostics for draw calls, renderer memory,
  GPU-memory estimation, profile state, and near/mid/far/cull counts.
- An asset manifest, provenance fields, canonical asset definitions, derived
  factories, and an imported runtime bridge seam.
- The field-plough authored development part, factory, GLB derivative, and
  review harness, all still classified below public visual approval.

### Partial or insufficiently proven scope

- The Patchwork Atlas direction is exploratory, not an accepted final art
  direction or a production art bible.
- Current runtime geometry is readable blockout/procedural presentation, not
  production-quality final art.
- The field-plough visual package is a development-ready procedural blockout;
  its controlled silhouette score remains below the stated production gate.
- The player-visible shell does not yet provide one named fidelity witness that
  explains loading, quality profile, and intentional degradation as a coherent
  visual state.
- Visibility accounting exists, but the runtime still sets repeated instanced
  meshes such as trees and dust to `frustumCulled = false`; logical prop
  filtering is not the same as renderer frustum culling or representation LOD.
- Lighting has readable day/gloam/night behavior, but the named lighting-tier
  policy and fallback matrix remain incomplete.
- Camera collision protects terrain and known scene geometry, but the visual
  evidence still identifies large props and site structures as a possible
  occlusion/readability risk.
- Browser visual proof is distributed across several captures and scripts, not
  one current, named fidelity witness bundle.

### Planned or open scope

- A representative open-world before/after visual slice where a material world
  contribution changes the place visibly without creating a quest or route gate.
- One source-to-runtime representation chain with explicit semantic ownership,
  LOD/representation intent, provenance, and runtime/public status.
- A measured lighting and quality matrix across standard, mobile-safe, and
  reduced-motion profiles.
- A focused visual review that distinguishes user readability from developer
  diagnostics and distinguishes procedural candidates from public assets.

### Contradictions and unknowns

1. The user request says “game visuals” without naming a surface, scene, rig,
   camera, or asset. This package recommends a representative world-consequence
   slice plus one asset representation chain, but that remains a proposal.
2. Existing documentation is rich but distributed. The two similarly named
   living-catalog files, `docs/vehicle_game_visual_exploration_living_catalog.md`
   and `docs/vehicle_game_visual_exploration_living_catalog(1).md`, are a
   duplicate-truth risk and must not be treated as two active catalogs. The
   un-suffixed file is the intended navigation target; the duplicate should be
   classified before any cleanup, with no deletion during this pass.
3. Existing screenshots prove current presentation states, but no external
   player language test proves that the visual differences read as heavy,
   nervous, skimming, or straining bodies.
4. No final art-style sign-off exists. Patchwork Atlas is the strongest current
   lead, not an accepted production commitment.
5. The field-plough GLB exists as a developer derivative, but public approval,
   hero-reference fidelity, and simulation collision authority remain separate
   open decisions.

## 3. Vision, motto_v4, and first-principles synthesis

### Canonical vision

**Product thesis:** a persistent machine-keeper odyssey through dense,
remembered places.

**User promise:** “I gave abandoned machines a second life, learned what each
one could become, and used my strange fleet to leave a wounded world more
connected, but not necessarily more controlled.” This is documented intent,
not external-player validation.

**Visual interpretation:** the machine is the emotional anchor. World visuals
should provide a readable local verb, visible consequence, and distant promise
in the same frame. Detail should support identity, material history, capability,
and place ownership rather than add generic spectacle.

### Motto v4 operating implications for visuals

| Motto principle | Visual implication | Current alignment / gap |
| --- | --- | --- |
| Whole-answer mandate | Finish the chosen visual slice through source, runtime, fallback, evidence, and docs, rather than polishing one screenshot | Existing lanes often have strong individual evidence but the fidelity witness bundle is still open |
| Evidence tiers and confidence honesty | Separate concept art, procedural candidate, runtime-tested bridge, and public-approved visual truth | Asset manifest and ADR-0038/ADR-0047 already establish this boundary |
| Source-of-truth discipline | Simulation owns world/collision/state; renderer owns projection; asset definition owns semantics; manifest owns lifecycle | Strong foundation, must be preserved in all visual changes |
| ADR-first and append-only decisions | Any load-bearing art direction, asset promotion, lighting policy, or renderer contract change needs a durable proposal and approval | Patchwork Atlas remains exploratory; no silent final-style promotion |
| Documentation continuity | Store visual decisions, rejected directions, evidence, and redirects in repo docs | Existing `DESIGN.md`, exploration map, tracker, provenance register, and review index provide the canonical surfaces |
| Parallel-authoring hold | Do not edit contested runtime files until ownership is explicitly cleared and rechecked | Active constraint for `src/game/` |
| Observability is delivery | A visual fallback, reduced profile, or failed asset load must be explainable to the player/reviewer and operator | Runtime diagnostics exist; one player-facing fidelity witness is still proposed |
| Performance before visual excess | Use profile-specific budgets, representation tiers, culling, and fallback before adding density or effects | Logical visibility exists; true frustum/LOD and named lighting policy remain open |
| Anything else? | Ask whether visual polish is hiding a more important readability, recovery, provenance, or operator gap | The current recommendation explicitly checks those gaps |

### First principles extracted from project evidence

1. Vehicles are characters. Silhouette, movement, sound, wear, attachments, and
   visible history must reinforce identity.
2. Art serves gameplay. A visual change is valuable when it improves inference,
   navigation, consequence recognition, or emotional attachment.
3. The ground decides. World visuals must reflect simulation-owned terrain,
   ecology, settlement, and infrastructure state rather than inventing parallel
   truth.
4. Open world means possibility, not a scripted sequence. Visual cues can invite
   action and show consequences, but must not turn into forced task order,
   invisible route permissions, or mandatory machine checks.
5. Readability survives degradation. Standard, mobile-safe, and reduced-motion
   profiles may lose atmosphere and decorative detail before they lose the rig,
   hazard, affordance, or consequence.
6. Provenance is part of art quality. A visually convincing reference or GLB is
   not automatically a shippable asset.
7. One canonical representation chain beats a collage of disconnected props.

## 4. Current-state architecture

### Visual ownership map

| Layer | Canonical responsibility | Evidence |
| --- | --- | --- |
| Simulation kernel | Fixed-step state, world memory, terrain/collision, material contributions, ecology and settlement facts | `src/game/state.ts`, `src/game/gameworld.ts`, `src/game/world.ts`, domain tests |
| Presentation renderer | Three.js scene, meshes, materials, lighting, camera, effects, renderer metrics, asset bridge | `src/game/renderer.ts` |
| Animation/feedback | Derived presentation channels for steering, load, traction, camera anticipation, reduced motion | `src/game/animation.ts`, `src/game/feedback.ts` |
| DOM shell | Accessible field kit, controls, profile/status text, modal and fallback surfaces | `src/main.ts`, `src/styles.css`, `index.html` |
| Asset definition | Semantic component graph, sockets, materials, action states, LOD, collision intent, provenance, compiler stages | `assets/specs/field-plough-01.asset.json`, ADR-0047 |
| Asset compiler/workbench | Derived sculpt specs, factories, PBR maps, review captures, GLB derivatives | `assets/workbench/field-plough-01/`, `tools/derive-img2threejs-spec.mjs` |
| Asset manifest | Lifecycle admission, rights/provenance metadata, runtime path, public approval flag | `assets/asset-manifest.json`, `tools/asset-preflight.mjs` |
| Browser acceptance | Runtime/manual proof at the canonical local port, with state text and visual captures | `tools/*browser-acceptance.cjs`, `docs/reviews/assets/` |

### End-to-end flow

Authoritative state and facts are produced by the gameplay kernel. The
renderer reads that state, resolves visual presentation and camera, and emits
metrics. The DOM shell exposes semantics and controls. Asset definitions and
manifest gates control what may enter runtime or public distribution. Review
artifacts record whether the visual result is readable and whether its asset
status is honest.

The boundary to preserve is:

```text
player input -> command/state -> world fact -> renderer projection -> DOM/canvas presentation -> visual evidence
```

The renderer must never become the owner of terrain traversal, settlement
condition, ecology movement, route permission, or collision truth.

## 5. Gap analysis

| Gap | Evidence | Severity | Impact | Recommended response | Affects visual request |
| --- | --- | --- | --- | --- | --- |
| Request surface is unspecified | User request contains only “game visuals” | High decision gap | A broad redesign could touch the wrong system or collide with parallel work | Approve a representative slice and runtime ownership boundary | Yes, blocks implementation scope |
| Visual direction is not final | `DESIGN.md` says exploratory; Patchwork Atlas is a lead | Medium | Final assets could be promoted against an unaccepted style | Preserve Patchwork Atlas as the baseline hypothesis; do not declare final art | Yes |
| Current welcome/entry composition dominates the first visual capture | Existing `open-world-causeway-browser-acceptance-2026-07-29.png` shows the large entry card covering most of the scene | Medium | The first promise is not visually inspectable until dismissal | Treat first-entry composition and post-dismissal field readability as separate acceptance states | Yes |
| Survey view and field kit compete for attention | Existing ecology capture shows a strong top-down world but small rig and dense shell panels | Medium | The player may read the dashboard before reading the machine or consequence | Use camera-specific composition budgets and compare chase/survey states | Yes |
| Primitive/blockout geometry is below final visual quality | Field-plough comparison and `DESIGN.md` classify current geometry as proof/blockout | Medium | Visual identity is present but not yet durable production art | Finish one semantic asset chain to the accepted quality gate before widening asset count | Yes |
| Logical visibility is not representation LOD | `renderer.ts` exposes profile counts but sets repeated meshes to `frustumCulled = false` | High technical gap | More scenery may increase GPU/CPU cost without a principled quality fallback | Implement or explicitly defer one measured representation-tier proof, after ownership clearance | Yes |
| Lighting policy is not named as a tier matrix | Existing tracker/worklog analysis identifies this as open | Medium | Mood passes can silently reduce readability or diverge across profiles | Define phase/profile lighting rules and an operator-readable summary before widening effects | Yes |
| Place consequences need a named fidelity witness | Existing settlement, causeway, traffic, and ecology evidence is distributed across captures | Medium | Runtime truth may be working while visual change is hard to audit | Create a compact before/after witness for one place, with state text and visual evidence | Yes |
| Runtime/public asset statuses must stay separate | ADR-0038, manifest, field-plough review | High trust gap | A convincing GLB could be mistaken for public-ready art | Keep procedural candidate, runtime-tested, and public-approved distinct | Yes |
| External player read is missing | No external-player validation in current evidence | Medium | Numeric or internal visual assertions may not equal felt machine character | Add a short player-language review after the first approved visual slice | Yes |

## 6. Decision log for this approval gate

### Existing decisions preserved

- `ADR-0001`: keep the gameplay kernel renderer-independent; Three.js remains a
  reference runtime, not a final-engine acceptance.
- `ADR-0038`: runtime-tested asset bridges are not public approval.
- `ADR-0047`: canonical asset definitions are the source of truth; compiler
  outputs and GLBs are derived artifacts.
- `ADR-0050`: material facts, not missions, should own settlement capacity and
  world consequences. This matters because visual consequences must project
  from material history without creating mission-owned visuals.
- `ADR-0051`: ecology actors are persistent world state; renderer mirrors them
  and does not spawn wildlife around the active rig.

### Proposed decision, pending approval

For the next game-visuals implementation, use Patchwork Atlas as the working
visual baseline and execute one representative visual-consequence slice plus
one source-to-runtime asset representation chain. Keep Signal Noir as a
state-based danger treatment and do not build Salvage Opera effects broadly.

Why: this aligns with the accepted machine-keeper direction, improves the
player's ability to read machine identity and world memory, and produces
measurable evidence without creating a second renderer, asset catalog, or
simulation authority.

Alternatives rejected for this gate:

1. Broad “make everything prettier” renderer rewrite. Rejected because it lacks
   a user-facing acceptance target and would collide with contested runtime
   work.
2. Promote the field-plough GLB directly into the public player surface.
   Rejected because the current asset is a developer derivative with visual
   gates and public approval still open.
3. Add more vehicle families or effects first. Rejected because current
   evidence says readability, representation tier, lighting policy, and asset
   promotion boundaries are higher-leverage gaps.
4. Add a new visual dashboard. Rejected because `DESIGN.md` explicitly keeps
   the field kit low-chrome and because diagnostics should not become a second
   player HUD.

Status: **Proposed, operator approval required.**

## 7. Open-questions register

| Question | Current assumption | Confidence | Blocks? | Owner / closure |
| --- | --- | --- | --- | --- |
| What exact visual surface should be first? | Sunken Flats causeway and Marsh Depot before/after, because both have current material/world evidence and a visible place consequence | Tier 0 proposal | Yes for implementation scope | Operator selects or approves the representative slice |
| May this pass edit `src/game/`? | Not without explicit collision clearance and pre-edit recheck | Tier 1, repo instruction | Yes for runtime changes | Operator clears the contested runtime lane or narrows scope |
| Is Patchwork Atlas final? | No, it is the strongest working hypothesis | Tier 1 | No for a bounded prototype slice; yes for final-art claims | Operator sign-off after visual comparison and player-language review |
| Should the field-plough become public runtime art? | No decision; keep developer/procedural candidate status | Tier 1 | No for asset-workbench progress; yes for public promotion | Separate public asset approval record |
| What are the numeric desktop/mobile budgets? | Existing metrics can measure them, but current docs do not establish one final threshold table | Tier 1 | No for discovery; yes before performance claims | Define a named budget matrix and capture deterministic fixture evidence |
| Does current visual contrast read in player language? | Unknown | Tier 0 | No for internal implementation, yes for quality closure | External or operator player-language review after implementation |

## 8. Risk register

| Risk | Likelihood | Impact | Severity | Mitigation / contingency | Status |
| --- | --- | --- | --- | --- | --- |
| Editing a parallel-owned renderer causes lost or conflicting work | Medium | High | Critical for this pass | Require explicit runtime clearance, snapshot current state, re-read before each edit, and keep changes grouped | Open |
| Visual polish hides weak gameplay readability | Medium | High | High | Gate on inference of machine capability, local affordance, hazard, and world consequence, not screenshot admiration | Open |
| Asset status inflation makes a blockout appear production-ready | Medium | High | High | Preserve manifest, canonical spec, runtime bridge, and public approval as separate states | Open |
| More scenery worsens frame time or mobile fallback | Medium | High | High | Measure standard/mobile-safe profiles, representation tiers, draw calls, memory, and fallback behavior before density increase | Open |
| Top-down or modal composition hides the player machine | Medium | Medium | Medium | Capture chase and survey states separately; keep rig, world consequence, and controls legible in each role | Open |
| Lighting or effects reduce contrast at night or in rain | Medium | Medium | Medium | Add named lighting-tier matrix and reduced-motion/readability checks | Open |
| Duplicate visual catalog creates stale guidance | Medium | Medium | Medium | Treat the un-suffixed catalog as navigation target, classify the duplicate, and do not delete without approval | Open |
| Generated or imported assets carry unclear rights/provenance | Low to medium | High | High | Use existing provenance register, hashes, source/derived distinction, and public approval gate | Open |
| Internal metrics are mistaken for player-facing quality | Medium | Medium | Medium | Build a named fidelity witness that is perceivable in the player shell and separate diagnostics from player UI | Open |

## 9. Proposed quality scorecard

| Dimension | Baseline | Proposed threshold | Evidence |
| --- | --- | --- | --- |
| Vision alignment | Patchwork Atlas lead is coherent but exploratory | Every changed visual element reinforces machine character, place memory, or readable opportunity | Visual review against `DESIGN.md` and approved brief |
| Machine readability | Three contrasting silhouettes exist | A reviewer can identify active rig class, forward direction, and at least one capability from gameplay-distance captures | Browser capture plus state text |
| World consequence readability | Settlement lamps, props, people, traffic, ecology, and causeway projections exist in separate lanes | The chosen before/after slice makes the changed place condition visible without reading diagnostics | Before/after browser capture and state evidence |
| Camera composition | Six camera roles exist; survey and entry composition remain dense | Chase and survey each preserve rig, affordance, and spatial context; no required state is hidden by the shell | Desktop and narrow screenshots |
| Lighting | Day/gloam/night states render | Named profile/phase policy preserves value contrast and interaction cues in standard/mobile-safe/reduced-motion states | Lighting matrix and captures |
| Representation/performance | Logical visibility counts and GPU estimate exist; some instanced meshes disable native culling | One measured representation-tier proof shows which geometry/detail is selected per profile, with no gameplay semantic change | Runtime metrics and deterministic fixture |
| Asset integrity | Canonical field-plough definition and derived chain exist | Every promoted visual has source, semantic definition, provenance, runtime status, replacement path, and review evidence | Manifest, spec, preflight, review packet |
| Accessibility | DOM field kit and reduced-motion clamps exist | Visual state is also perceivable through text/status and remains operable at narrow width and reduced motion | Browser accessibility and reduced-motion evidence |
| Documentation | Design, tracker, worklog, provenance, and reviews exist | The approved visual decision, changes, evidence, and remaining gaps are traceable from the indexes | Repo docs |

## 10. Three-pass discovery review

### Pass 1, correctness and completeness

Confirmed the request is underspecified, mapped it to current visual gaps, and
separated implemented, partial, planned, contradictory, and unknown scope. No
runtime or asset implementation file was changed.

### Pass 2, architecture and long-term viability

Confirmed the recommended path extends the existing renderer, world projection,
asset manifest, and browser evidence surfaces. It does not introduce a second
renderer, second asset catalog, second HUD, or renderer-owned simulation truth.
The main architectural dependency is explicit clearance for the contested
`src/game/` lane.

### Pass 3, rule compliance and supervision readiness

Confirmed the package keeps proposed decisions proposed, distinguishes evidence
tiers, records unknowns and owner decisions, includes an “Anything else?” check,
and leaves implementation pending approval. The current confidence in this
discovery package is below 1.00 because the exact visual surface and runtime
ownership clearance are unresolved.

## 11. Proposed execution brief

### Exact mission

Make one approved slice of Rigs Unbound's visual promise materially easier to
read in active play: the player should see a recognizable machine, a meaningful
local world condition, a visible consequence of material history, and a distant
invitation, while standard/mobile-safe/reduced-motion behavior remains legible
and asset status remains honest.

### Recommended target state

- Patchwork Atlas is visibly coherent in the selected slice, while remaining
  explicitly a working baseline rather than a final art-style declaration.
- The selected place has a before/after or state comparison that a player can
  understand without opening diagnostics.
- The active rig remains a readable character in chase and the spatial view.
- The visual quality/fallback state is named in the player-facing shell and in
  operator evidence.
- One asset or asset family has a traceable source-to-runtime representation
  chain, with procedural/runtime/public status kept separate.
- The same simulation state still owns world consequences, collision, and
  persistence.

### Workstreams after approval

1. **Visual contract and evidence surface**
   - Define the selected slice, composition states, lighting/profile matrix,
     visual vocabulary, and evidence bundle.
   - Files likely involved: this package, `DESIGN.md`, relevant tracker,
     worklog addendum, and a focused review artifact.
   - No runtime mutation is required for the documentation-only stage.

2. **Representative world-consequence visual slice**
   - Recommended subject: Sunken Flats / Marsh Depot causeway and settlement
     condition, because current material facts, terrain ownership, authored
     deck/rail presentation, lamps, residents, and browser evidence already
     exist as a coherent seam.
   - Preserve voluntary open-world behavior: no quest gate, route permission,
     forced sequence, or new mission authority.
   - Likely runtime files: `src/game/renderer.ts`, `src/game/gameworld.ts`, and
     adjacent projection contracts, only after ownership clearance.

3. **Vehicle and asset representation chain**
   - Use the existing field-plough package as a development candidate or choose
     a place asset if the operator prefers. Do not promote the current GLB to
     public truth by implication.
   - Complete only the gates required by the approved visual slice: semantic
     definition, named sockets/materials, representation or LOD intent,
     provenance, review, and runtime adapter status.
   - Keep simulation collision separate from visual geometry.

4. **Camera, lighting, and quality proof**
   - Compare chase, survey, narrow-width, standard, mobile-safe, and
     reduced-motion states.
   - Implement only the smallest coherent correction supported by the evidence,
     such as a camera composition fix, named lighting tier, or fidelity witness.
   - Do not add effects solely for a more dramatic screenshot.

5. **Independent visual and integration critique**
   - Review against the approved visual contract, machine readability, world
     consequence, asset provenance, performance, accessibility, and parallel
     ownership boundaries.
   - Re-run the complete affected flow after each justified finding.

### Explicit exclusions

- No broad renderer rewrite.
- No engine migration or second production renderer.
- No public asset approval by agent assertion.
- No replacement of the Patchwork Atlas direction with a new style without a
  separate decision record and operator approval.
- No duplicate asset catalog, visual HUD, or simulation pipeline.
- No new missions, route locks, mandatory machine requirements, or scripted
  flow introduced to make a screenshot easier to produce.
- No direct edits to contested `src/game/` files until explicitly cleared.

### Acceptance criteria

1. The selected visual slice is named in the repo and linked from the reviews
   index, tracker, worklog, and design direction.
2. The chosen scene shows a clear active machine, readable local affordance or
   consequence, and distant world promise at the approved camera states.
3. Before/after or state-change evidence demonstrates that visual presentation
   follows simulation-owned state and survives reload where persistence is part
   of the selected slice.
4. Standard, mobile-safe, and reduced-motion states preserve gameplay
   readability; lower profiles remove detail before they remove meaning.
5. Renderer metrics and asset status are visible in the evidence bundle, but
   player-facing diagnostics remain separate from the field kit.
6. The selected visual asset has a canonical definition or documented
   procedural source, provenance, representation/LOD intent, review evidence,
   runtime status, and explicit public-approval status.
7. `npm run typecheck`, `npx vitest run`, and `npm run assets:preflight` pass
   after implementation, plus the focused browser acceptance scripts for the
   selected slice on port 4173.
8. An independent critic records no unresolved critical or high-severity
   visual, architecture, provenance, accessibility, or performance finding in
   the accepted scope.
9. Documentation accurately separates verified, inferred, proposed, blocked,
   and unknown states.

### Rollback

Keep visual changes additive and source-traceable. If the selected runtime
visual regresses, remove or supersede the projection/asset admission while
retaining the canonical semantic definition, review history, provenance, and
simulation state. Do not rewrite or delete historical evidence. Public approval
must remain false until a separate sign-off exists.

### Required user decisions

1. Approve or change the recommended first slice, Sunken Flats / Marsh Depot
   before-and-after visual consequence.
2. Explicitly clear or withhold edit access to the contested `src/game/` runtime
   files for this visual pass.
3. Confirm whether the field-plough should remain the asset-chain candidate or
   whether the first visual asset should instead be a place asset.

## 12. Approval package summary

I believe the project is a renderer-independent, browser-based open vehicle
game whose visual identity is carried by persistent machine character and
visible world memory. That conclusion is supported by `ADR-0001`, `ADR-0005`,
`DESIGN.md`, the renderer/world ownership code, the asset provenance chain, and
the existing browser captures.

The correct visual strategy is to preserve and extend the existing foundation,
not start a blank-slate art rewrite. The highest-leverage next proof is one
representative world-consequence slice plus one honest source-to-runtime asset
chain, then a browser visual comparison across camera and quality profiles.

I will preserve all current runtime, asset, docs, and evidence work, including
the field-plough developer derivative and all uncommitted parallel changes. I
will not edit or delete contested runtime files, promote unapproved assets, or
create a second visual truth source without the explicit decisions above.

### Anything else?

Yes. The most important remaining risk is not that the scene lacks more
decoration. It is that a visually attractive capture could still fail to tell a
player what the machine can do, what changed in the place, or what the next
voluntary possibility is. The accepted visual lane must therefore measure
inference and continuity, not only surface polish.

## Approval status

**Pending explicit operator approval.** No implementation files were changed by
this discovery pass. The only allowed next action after approval is to re-check
the current dirty state, re-read the applicable files, update this brief if the
parallel runtime has changed, and then execute only the approved workstreams.
