# Playable Foundation Plan

- Date: 2026-07-25
- Status: Complete (local field-test contract)
- Owner: Project owner
- Risk class: low; local browser prototype
- Evidence target: Tier 4 local runtime observation

## Context

The repository has a strong product and research foundation but no executable game. The incoming review is accurate about that evidence gap, but its reduced tractor-defense scope and two-engine sequence are review proposals rather than accepted product boundaries.

The operator clarified that Rigs Unbound remains an open game: vehicles, places, scale changes, and mechanic families remain open for exploration. The first runtime must therefore create evidence without recasting the whole game as one farm-defense slice.

## Decision unit

Build one provisional Three.js reference runtime over a renderer-independent TypeScript state kernel.

This is not an accepted final-engine decision. It is the shortest coherent path to testing the already-proposed invariants:

- a persistent rig is the playable character;
- a place remembers the rig's actions;
- attachments change verbs and silhouette;
- camera and world-state changes do not replace the vehicle identity;
- future regions and activity families are discovered spatially;
- named actions, fixed-step updates, state export, and deterministic stepping remain outside renderer ownership.

## Product mode and visual plan

- Product mode: experience.
- Audience: a curious player opening a browser link for the first time.
- Single job: drive immediately, understand what the rig can do, and leave a visible trace.
- Visual direction: Patchwork Atlas field prototype.
- Palette:
  - Soil Ink `#17201c`
  - Tractor Rust `#b94f32`
  - Workshop Bone `#ead8b8`
  - Harvest Gold `#d9aa52`
  - Signal Cyan `#6bc9c4`
  - Night Reservoir `#13283c`
- Typography:
  - display: Avenir Next Condensed with durable sans-serif fallbacks;
  - body: Trebuchet MS with system fallbacks;
  - instruments: SFMono-Regular with monospace fallbacks.
- Signature element: persistent furrows become both world geometry and the run-history instrument in the HUD.
- Anti-references: generic dashboard cards, purple gradients, glassmorphism, excessive chrome, fake metrics, and a landing page that delays play.

## Acceptance contract

### Player behavior

- Load directly into a rendered world with a clear start action.
- Drive and reverse the tractor with keyboard, gamepad, or touch.
- Raise/lower the plough and leave bounded persistent furrow marks.
- Toggle chase/tactical cameras.
- Cycle day/gloam/night presentation without changing controls or identity.
- Discover multiple spatial opportunity landmarks.
- Pause, reset, reload, and recover a validated local save.

### Architecture

- Fixed-step state updates do not import Three.js.
- Renderer objects never enter saved or exported game state.
- Named actions are the only input contract.
- `window.render_game_to_text()` returns the current public state.
- `window.advanceTime(ms)` advances the same simulation deterministically.
- Invalid or incompatible local data falls back to a clean initial state with a visible diagnostic.

### Verification

- TypeScript strict typecheck.
- Unit tests for movement, plough memory, phase/camera changes, discovery, and save validation.
- Production build.
- Visible-browser desktop and narrow viewport checks.
- Console and page-error inspection.
- Direct runtime interaction through the public browser hooks.

## Explicit boundaries

- No engine acceptance.
- No backend, auth, cloud save, analytics, multiplayer, economy, or UGC.
- No private Kenney bundle dependency or copied paid source asset.
- Primitive Patchwork Atlas geometry is a guaranteed reproducible fixture, not production art.
- No claim that the local prototype is publicly deployed or launch-ready.

## Rollback and revisit

The renderer may be replaced without migrating the state contract. Revisit the runtime choice if content authoring, physics, mobile performance, WebGL fallback, or a second vehicle exposes concrete friction. A future engine comparison must reuse the same named actions, state hooks, and acceptance scene rather than creating parallel game truth.

## Parallel-work reconciliation

While this runtime was being implemented, a separate `experiments/deterministic-kernel-probe/` landed in the same checkout. That probe is preserved as a disposable, dependency-free farm → defense → time-trial contract experiment.

The two surfaces have explicit ownership:

- `src/game/` is the live 3D reference runtime and its current browser state contract;
- `experiments/deterministic-kernel-probe/` is a non-production comparison fixture for deterministic cross-mode continuity.

The root verification commands run both suites, while Vitest is scoped to the TypeScript runtime so it does not misinterpret the experiment's native `node:test` file. If the experiment's richer mode/state contract is promoted, it must replace the live state contract through a recorded migration rather than become a second production kernel.

The parallel experiment server occupied `127.0.0.1:4173` during live verification. The 3D Vite runtime therefore uses `4174`; this preserves both running surfaces and removes ambiguous localhost routing.

## Anything else?

Yes. Openness should live in the world graph and system seams, not in shipping every imagined mechanic at once. The first runtime keeps the horizon wide while making one honest interaction chain observable.
