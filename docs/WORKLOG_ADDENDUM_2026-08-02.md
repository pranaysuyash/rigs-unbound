# Worklog Addendum — 2026-08-02

## Verified restoration-beat "juice" claim, then staged dialogue beats (audit items 1 and 3)

Continuing from `VISUAL_GAME_FEEL_AUDIT_2026-08-01.md`'s recommended priority
order. Repo was clean and synced at `39cf2e7` at session start; no parallel
`src/game/` collision was active, so this session proceeded per
`AGENTS.md`'s parallel-runtime rule.

### Item 1 — verify the restoration-beat juice claim

The audit flagged `docs/WORKLOG_ADDENDUM_2026-07-31.md`'s claim of camera
shake, headlight flare, and audio cues on first engine start as **unverified**
(Tier 0) because screenshots can't capture motion or sound.

- Read the implementation directly: `renderer.addShake()` /
  `renderer.flashHeadlights()` (`src/game/renderer.ts:3369-3384`) and
  `RigAudio.chirp()` / `RigAudio.impact()` (`src/game/audio.ts:326-389`) are
  real, non-stub implementations — synthesized WebAudio buffers, an actual
  per-frame camera-position offset gated behind `prefers-reduced-motion`, and
  a per-rig headlight-intensity ramp on a real timer.
- Played the flow live end to end (recover → diagnose → rebuild → start
  engine) against the canonical `4173` dev server. Each step produced the
  expected toast (`"Torque starts. The old man nods — work can begin."`) and
  state transition (condition 25% → 100%, workshop advancing to the Water
  Before Night panel), with zero console/page errors throughout.
- Confirmed `prefers-reduced-motion` was **not** set in the test browser, so
  the shake path was not silently skipped.
- **Not independently confirmed**: the actual on-screen motion and audible
  sound within the ~350ms flare window. The preview pane in this session's
  tooling was throttled far below real-time (the built-in device-performance
  gate, which normally completes in a couple of seconds, took roughly 90
  seconds of wall time here), which also made a `requestAnimationFrame`-based
  pixel check time out. This is recorded as a tooling limitation, not a
  claim that the effect doesn't fire — per this repo's own evidence-tier
  discipline (motto_v4 §0.5), the distinction is kept explicit rather than
  rounded up.
- **Verdict**: code-level (Tier 2/3) and live-executed-with-no-errors (Tier 3)
  evidence both support that this is real, wired functionality, not a false
  claim. Full Tier 4 (observed motion/audio) evidence remains open for a
  session with an unthrottled preview.

### Item 3 — stage dialogue beats with camera reframe/dim

The audit's other finding: dialogue beats (the old man's arrival bargain, the
naming beat) rendered in the identical panel style as mechanical workshop
feedback, with no camera or lighting cue marking the difference.

Added one mechanism, reused by every dialogue beat rather than special-cased
per beat:

- `#dialogue-scrim` (`index.html`), a full-viewport radial-gradient dim layer
  at `z-index: 3` — above the canvas and the ambient weather overlay, below
  the HUD (`z-index: 4+`) and the dialogue panel itself (`z-index: 8`) — so
  the instrument HUD stays fully legible while the world behind it dims.
  Styled in `src/styles.css`; respects the existing global
  `prefers-reduced-motion` rule that already zeroes all transition durations.
- `GameRenderer.setNarrativeFocus(active)` (`src/game/renderer.ts`): eases
  the camera FOV narrower by up to 5° while a dialogue beat is open, using
  the same exponential-smoothing pattern already used for the speed-based FOV
  boost, so it reads as a soft focus pull rather than a snap.
- Both are toggled from the single `showDialoguePanel` / `hideDialoguePanel`
  pair in `src/main.ts` that every dialogue beat already routes through, so
  no per-beat wiring was needed and no new dialogue-authoring surface was
  introduced.
- Deliberately did **not** touch `.dialogue-panel`'s own typography/plate
  styling or add character art — the audit separately named portrait/art
  direction as a larger, asset-driven gap, not part of this cheap fix.

Verification:

- `npm run typecheck` — clean.
- `npx vitest run` — 538/538 passing, 87 files, no regressions.
- `npm run build` — clean; existing >500kB Three.js chunk advisory is
  pre-existing and unrelated to this change.
- Live: hot-reloaded into the running `4173` session with zero console
  errors; confirmed via the CSS object model that `.dialogue-scrim` and
  `.dialogue-scrim--visible` are present, correctly ordered, and resolve to
  the intended element (verified indirectly — an inline `!important`
  background-color override took effect at the correct z-index/position —
  after the same preview-throttling issue above prevented a direct
  before/after opacity screenshot).

### Item 4 — ground texture and a worn path between authored sites

Investigated before writing any code, per this repo's measure-first
discipline. Live Top-down/Tactical screenshots against the running `4173`
build showed exactly what the audit described: a near-uniform, low-contrast
ground plane even standing on the Home Silo service pad.

Ruled out, by reading the code rather than guessing, several plausible
renderer-level causes before touching anything:

- **Not a missing system.** `WORLD_ROUTES` / `RESOLVED_ROUTES`
  (`src/game/world.ts`) already define an authored track network between
  Home Silo and four other sites, `routeWeight()` and `surfaceFor()`
  (`src/game/terrain.ts`) already classify a corridor and the Home Silo pad
  as `SURFACES.track`, and `resolveTerrainVertexColour()`
  (`src/game/renderer.ts`) already paints that classification into the
  terrain's vertex-color buffer. The in-world HUD location label
  ("HARDPAN TRACK · HOME VALLEY") confirms the classification is correct at
  the player's actual starting position.
- **Not the sun angle.** The sun's position is fixed
  (`src/game/renderer.ts:644`, `(-120, 190, -70)`), a steep ~54° elevation,
  not a grazing dawn angle — ruled out by reading the constant, not by
  observation.
- **Not shadow-frustum clipping.** No light in the scene has `castShadow`
  set; there is no shadow camera to be too small for a pulled-back view.
- **Not the performance-safeguard/visibility profile.** Read
  `src/game/visibility.ts`: the `standard`/`mobile-safe` profiles only
  change prop instance counts and draw distance, nothing color- or
  lighting-related.
- **Genuinely inconclusive**: fog (`FogExp2`, would blend toward a *pale*
  background colour, not darken further) and general scene exposure. A
  `readPixels`-based objective canvas sample and a double-`requestAnimationFrame`
  computed-style check were both attempted to get tooling-independent ground
  truth; both were unusable in this session (the former reads a cleared,
  all-zero buffer because the WebGL context isn't configured to preserve its
  drawing buffer outside the app's own render loop; the latter timed out
  after 30s, consistent with the same severe preview-pane throttling that
  made the earlier device-performance gate take ~90s). This is recorded as
  an open, unresolved measurement gap for a session with a real,
  unthrottled browser — not papered over.

What was actually fixed, scoped to what's confirmable without solving that
gap: `SURFACES.track.color` (`src/game/world.ts`) was `0x6c6151`, close
enough in hue/luminance to `SURFACES.grass.color` (`0x64763f`) that the two
could plausibly wash together under any non-ideal lighting condition — a
real, code-comparable defect independent of the rendering mystery above.
Retuned to `0x9c8a68`, a warmer, lighter worn-dirt tone with much wider
separation from grass. Also widened the per-vertex micro-variation term in
`resolveTerrainVertexColour()` from a 0.90-1.08 multiplier spread to
0.78-1.126, for a more visible texture break at pulled-back camera angles
without introducing visible noise up close. Both changes are presentation-
only (`SurfaceMaterial.color` is documented as the render-only field;
`grip`/`rollingDrag`/`deformable` were not touched).

Verified live: before/after screenshots in both Top-down and Tactical view
at the Home Silo pad show a clearly readable warm-toned worn-track disc
against the surrounding pasture, where the prior build showed a flat,
uniform dark plane. `npm run typecheck`, `npx vitest run` (538/538), and
`npm run build` all clean after the change.

### Anything else?

Item 2 (prop/material language, loose primitives) was already partially
closed by `3c009c0` before this session started. The unresolved measurement
gap noted above under item 4 (no reliable way to get objective canvas pixel
data or a real per-frame computed-style read in this session's preview
tooling) is worth fixing at the tooling level before the next visual/game-
feel audit is attempted from this environment — it silently degrades to
"trust the screenshot," which is exactly the failure mode motto_v4 §0.5
exists to prevent.

## motto_v4 rules honored

- §0.5 (Evidence Tiers): every claim above is tagged by what tier of
  evidence supports it, including the explicit tooling-throttle gap.
- §0.2 (Confidence Honesty): the preview-pane throttling that blocked a
  direct visual/audio confirmation is stated plainly rather than omitted.
- §23 (Parallel-Authoring): re-checked `git status`/`git log` before editing
  `src/game/renderer.ts`; no active collision was present.
