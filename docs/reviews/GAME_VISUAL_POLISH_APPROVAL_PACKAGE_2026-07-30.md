# Rigs Unbound browser visual polish approval package

Date: 2026-07-30  
Status: Part 0 complete, implementation evidence captured, broader objective still open  
Evidence posture: Tier 1 static inspection, Tier 3 canonical local server, Tier 4 live browser captures  
Scope: browser-shell visual polish only. No `src/game/` edits, no asset replacement, no engine migration.

## Recommendation

Approve a narrow visual-polish slice focused on the browser shell, HUD hierarchy, and responsive composition.

The live page already has a strong Patchwork Atlas mood and a readable machine-first identity. The current polish gap is not the art direction itself. It is the way the shell composes that direction:

- the opening plate is dramatic but heavy;
- the desktop right rail and field kit compete for attention;
- the mobile header and overlay stack compress into a crowded layout;
- the page reads clearly as a game, but not yet as a tuned, elegant game surface.

The recommended first slice is to refine the browser-facing composition while preserving the existing visual language and avoiding the contested gameplay runtime lane.

## 1. Instruction applicability map

| Source | Scope and priority | Rules relevant to this slice | Current status |
| --- | --- | --- | --- |
| `/Users/pranay/AGENTS.md` | Global workspace rules | Preserve parallel work, use current state, document durable evidence, no unapproved git writes | Current |
| `/Users/pranay/Projects/AGENTS.md` | All Projects repos | Additive and comprehensive work, use canonical docs, no duplicate systems, use relevant skills | Current |
| `AGENTS.md` | Rigs Unbound repo | `src/game/` may be parallel-owned; do not edit it without explicit clearance; canonical dev server is port 4173; run typecheck and Vitest before completion claims | Current |
| `motto_v4.md` | Canonical doctrine | Whole-answer mandate, evidence tiers, append-only decisions, documentation continuity, approval before material changes | Current and canonical |
| `DESIGN.md` | Visual direction | Patchwork Atlas baseline, readable machine silhouettes, low-chrome field kit, no generic HUD or card-grid polish | Exploratory but current |
| `docs/design/GAME_DESIGN_SPINE.md` | Product vision | Open vehicle-universe, vehicles as playable characters, persistent machine identity | Accepted by operator sign-off |
| `docs/decisions/ADR-0010-rendering-accessibility-contract.md` | Renderer/accessibility gate | Visual changes must preserve readability, reduced-motion safety, and profile-aware behavior | Proposed, load-bearing |
| `docs/reviews/README.md` | Review navigation | Visual evidence and acceptance records belong in durable review surfaces | Current |
| `docs/plans/MASTER_EXECUTION_TRACKER.md` | Execution tracking | Evidence and status changes belong in the tracker | Current |
| `3d-web-experience` skill | 3D web presentation | 3D should serve readability and performance, not decoration alone | Loaded |
| `Browser Daemon` skill | Browser QA workflow | Live browser inspection, console review, viewport checks | Loaded |

## 2. Project reconstruction

### Current reality

- Observed live browser captures at `http://127.0.0.1:4173/` show a strong, coherent visual language built around a repaired tractor, soft low-poly terrain, and a low-chrome HUD.
- Observed desktop capture: `/.codex-visual-polish-field.png` shows the scene is readable, but the welcome plate, right rail, and field kit create a dense composition.
- Observed mobile capture: `/.codex-visual-polish-mobile.png` shows the shell compresses aggressively, with the header, right rail, field-kit card, and control overlays competing for vertical space.
- Observed initial capture: `/.codex-visual-polish-current.png` shows the opening modal is visually striking but dominates the frame before entry.
- Observed code state: current worktree already contains unrelated uncommitted changes, including runtime, asset, docs, and test work. This visual-polish slice must preserve that parallel work.

### Documented intent

- `DESIGN.md` states Patchwork Atlas is the leading visual grammar.
- The machine should feel like a character, and the HUD should feel like a field kit attached to that machine, not a generic dashboard.
- The world should read as a place with state, not a menu stack.
- Reduced motion, accessibility, and readable contrast are part of the visual contract.

### Long-term vision

- The game is an open vehicle-universe where visual identity comes from machine character, material history, and visible world consequence.
- Visual polish should increase inference, not merely decoration.
- The shell should remain honest about maturity and should not turn into a second game UI.

### Implemented scope

- A live Three.js browser runtime exists on the canonical local port.
- The shell already exposes a title, status summary, controls, objective, survey/mission surfaces, and accessibility entry point.
- The runtime already separates simulation state from renderer projection.

### Partial scope

- The current shell is legible but visually dense in its first-entry and narrow-viewport states.
- The right rail, field kit, and modal surfaces all deserve hierarchy tuning.
- The mobile presentation hides some chrome and compresses others, which keeps the page functional but not yet polished.

### Unknown scope

- Whether the first polish pass should make the welcome plate smaller, lighter, or shorter after entry.
- Whether the mobile right rail should be compacted further or partially deferred.
- Whether the field polish should include minor copy tweaks, or remain purely spatial/typographic.

## 3. Visual evidence summary

### Desktop

The desktop capture shows:

- a strong mood and readable machine-first presentation;
- a clear central playfield;
- a right-side horizon rail that is informative but visually tall;
- a left-lower field kit that is readable but heavy;
- a centered opening plate that feels like an event, but also like a wall.

### Mobile

The mobile capture shows:

- the main rig remains visible, which is good;
- the masthead compresses hard;
- the horizon rail takes a large share of the remaining vertical space;
- the lower control/lesson surfaces stack tightly enough to feel crowded;
- the result is readable, but not yet elegant.

## 4. Gap analysis

| Gap | Evidence | Severity | Impact | Recommended response |
| --- | --- | --- | --- | --- |
| Opening composition is too heavy | Desktop and initial capture show the welcome plate dominates the frame | Medium | The first visual impression is strong but over-assertive | Reduce modal mass, preserve mood, keep the player-facing promise clear |
| Desktop HUD hierarchy is crowded | Field kit + right rail + modal/lesson surfaces occupy too much visual weight | Medium | The player reads panels before reading the machine and terrain | Tune spacing, opacity, and visual grouping without adding new surfaces |
| Mobile composition compresses too hard | 390 × 844 capture shows top controls, right rail, and lower overlays all compete | High | The game stays playable, but the shell feels cramped and less polished | Simplify responsive stacking, improve spacing, and prune redundant emphasis |
| The polish target is easy to misinterpret | Current codebase includes parallel runtime work and asset work | High | A visual fix could accidentally become a renderer or asset rewrite | Keep the slice in the browser shell, not `src/game/` |
| A prettier shell could hide readability | This is a known risk in 3D/browser games | Medium | The page might look nicer while becoming harder to parse | Gate on machine readability, objective readability, and narrow-viewport legibility |

## 5. Decision log for this gate

### Preserved decisions

- The open vehicle-universe vision in `docs/design/GAME_DESIGN_SPINE.md` remains canonical.
- Patchwork Atlas remains the current baseline visual language, not a final art declaration.
- Renderer/simulation separation remains intact.
- Parallel-owned `src/game/` work stays untouched unless explicitly cleared.

### Proposed decision

Use the next implementation pass to polish the browser shell and HUD composition only.

That means:

1. improve the welcome/entry plate so it feels intentional but not overpowering;
2. improve desktop hierarchy between the masthead, field kit, and horizon rail;
3. improve mobile spacing and stacking so the shell reads clearly at 390 px wide;
4. keep the runtime honest about state and accessibility, without adding a second dashboard.

### Rejected alternatives

1. Renderer rewrite or engine migration. Rejected because the visible problem is composition, not engine choice.
2. Asset replacement or new hero-art import. Rejected because the current issue is shell polish, not a missing asset family.
3. `src/game/` runtime edits for this slice. Rejected because the collision is unresolved and unnecessary for the target.
4. Generic “make it prettier” pass with no state constraints. Rejected because it can hide readability regressions.

## 6. Risks

| Risk | Likelihood | Impact | Severity | Mitigation |
| --- | --- | --- | --- | --- |
| Shell polish hides gameplay cues | Medium | High | High | Keep objective text, horizon signals, and machine readouts visible |
| Mobile polish introduces a second layout system | Medium | Medium | Medium | Change the existing shell rather than adding a parallel HUD |
| Visual tuning leaks into contested runtime files | Medium | High | High | Keep the implementation plan limited to the browser shell unless ownership is cleared |
| Aesthetic tweaks worsen contrast or accessibility | Medium | High | High | Recheck reduced-motion, keyboard focus, and text contrast with each iteration |

## 7. Proposed execution brief

### Mission

Make the browser shell feel visually tuned and easier to read, especially in the opening state and the compact mobile viewport, while preserving the current game identity and runtime boundaries.

### Approved scope

- `index.html`
- `src/main.ts`
- `src/styles.css`
- review/docs surfaces tied to the visual-polish decision

### Excluded systems

- `src/game/`
- asset replacement or public asset promotion
- engine migration
- second HUD or dashboard system
- simulation or collision truth

### Behavior to preserve

- the current Patchwork Atlas direction;
- the visible machine-first tone;
- the accessible shell entry points;
- local save/state semantics;
- canonical port 4173 for browser evidence.

### Dependency-ordered workstreams

1. Tighten the entry and in-field composition on desktop.
2. Simplify the mobile hierarchy so the playfield stays readable.
3. Rebalance typography, spacing, and panel weight.
4. Re-run browser screenshots and console checks.
5. Record the evidence and decision trail in repo docs.

### Acceptance criteria

1. Desktop 1440px capture shows the main machine, objective, and horizon rail without the shell feeling overstacked.
2. Mobile 390px capture keeps the machine and objective legible without the rail and overlays crowding the playfield.
3. The change preserves accessibility and does not create a second HUD.
4. `npm run typecheck && npx vitest run` pass after implementation.
5. Browser evidence is captured on the canonical local port and linked from the review trail.

### Validation

- Typecheck
- Vitest
- Browser capture at desktop and mobile widths
- Console check for errors and warnings

### Anything else?

Yes. The important question is not “can the page look fancier?” It is “can the player still tell what the machine is, what the world is asking, and what matters next?” This slice should answer that cleanly.

## 8. Approval request

Approve the browser-shell visual polish slice, limited to `index.html`, `src/main.ts`, `src/styles.css`, and the related review/doc trail, with `src/game/` left untouched unless you explicitly clear that collision.

## 9. Implementation evidence captured (2026-07-30)

The approved shell slice was implemented and rechecked in-browser against the canonical local port.

- Desktop in-world capture: `/.codex-visual-polish-after-desktop-inworld.png`
- Mobile in-world capture: `/.codex-visual-polish-after-mobile-inworld.png`

Observed effects:

- ambient shell framing is more deliberate, with darker edge falloff and clearer premium separation from the playfield;
- the masthead and bottom control strip read as layered glass surfaces instead of one flat bar;
- the field kit feels denser and more anchored without becoming a second dashboard;
- the mobile horizon rail compresses into a broader, less vertical strip, which reduces the previous cramped feel;
- the opening plate is still assertive, but now sits inside a calmer overall composition.

## 10. Whole-game presentation mood follow-up (2026-07-30)

The shell now reacts to the current world phase and weather profile rather than staying visually fixed. The page publishes these state markers into the document root, and the shell theme shifts with them through CSS variables.

Observed browser-state markers:

- `data-world-phase="day"`
- `data-weather-phase="clear"`
- `data-quality-profile="standard"`

This is a presentation-layer improvement only. It does not alter simulation truth, but it makes the game surface feel more like a living product layer tied to the world instead of a static web app skin.

Launch note:

- During the 2026-07-30 Browser start check, the new pointer-atmosphere wiring briefly hit a startup-order error because the pointer state initialized after the first style commit. That was corrected in `src/main.ts`, and the canonical page now loads cleanly again at `http://localhost:4173/`.

Rig-identity note:

- The same browser session also confirmed that the shell now inherits the active rig identity, with the field-kit border tint switching to the active rig accent. On the current rig, the browser readout showed `--shell-rig-accent="#d9aa52"` and `fieldKitBorderLeftColor="rgb(217, 170, 82)"`, which makes the cockpit feel tuned to the machine rather than staying on one static palette.

Camera-posture note:

- The shell now also reacts to the current camera mode. In the live browser, switching from `chase` to `top-down` updated the presentation variables from `--shell-camera-depth="1"` / `--shell-camera-energy="0.09"` / `--shell-camera-tilt="0.04deg"` to `--shell-camera-depth="0.88"` / `--shell-camera-energy="0.18"` / `--shell-camera-tilt="0.24deg"`, and the field-kit transform subtly tightened in response. The page was then restored to `chase` after verification.

Presentation-transition note:

- The shell now emits a short pulse when presentation state changes. In the live browser, switching to `hood` produced a temporary `data-presentation-pulse` token while the page restyled, and the attribute cleared again after the transition before the page was restored to `chase`. This keeps camera and rig changes feeling responsive rather than abrupt.
