# 3D Game Skill App Analysis and Current Surface Gaps

- Date: 2026-07-28
- Status: researching
- Lens: `3d-games`
- Scope: current browser surface, current 3D contracts, and the next proof gaps that are still mostly policy-led rather than runtime-observed

## Why this note exists

The `3d-games` skill is useful here because the repo already treats the game as
an architecture problem, not just a content problem. The current surface has
camera policy, physics boundaries, visibility budgets, shader/material policy,
lighting policy, and a separate physics lab. What still needs a durable home is
the analysis that ties those lanes back to the live app surface and names the
remaining 3D proof gaps in one place.

This is an analysis note, not an acceptance claim.

## Live surface evidence

The current shell was checked live at `http://localhost:4173/?acceptance=field-02`.

Observed facts from the rendered browser surface:

- page title: `Rigs Unbound`
- camera selector label: `Camera view`
- camera options:
  - `Chase`
  - `Hood`
  - `Side`
  - `Tactical`
  - `Top-down`
  - `Survey`
- physics-lab entry point: `/physics-lab.html`

That is a meaningful split. The shell already exposes camera policy as a user
choice, while the physics lab is a separate evidence surface instead of a
hidden implementation detail.

## What the current 3D surface already proves

### 1) Camera is a product surface, not a debug toggle

The live shell exposes six named camera modes. That means the project already
has:

- a semantic camera model,
- explicit user-facing camera selection,
- an architecture that expects different views to mean different things.

That aligns with the existing camera-feel contracts in the research stack and
is more mature than a single hard-coded chase camera.

### 2) Physics is separated enough to deserve its own proof lane

The shell links to a dedicated physics lab. That tells us the repo already
recognizes physics as a distinct evidence lane instead of collapsing it into
the main shell.

That separation is healthy, but it also means the public app surface does not
yet carry all 3D proof obligations itself. Some of the important evidence
still lives in the lab and in the contracts.

### 3) The repo already has the right 3D language

The 3D contract index already names the important lanes:

- visibility and LOD,
- collision category/mask,
- camera feel,
- shader/material strategy,
- lighting and atmosphere,
- renderer performance and accessibility,
- physics quality,
- physics readability and speed,
- resource budgets,
- portal visibility.

So the problem is not absence of vocabulary. The problem is turning that
vocabulary into browser-visible threshold evidence that future reviewers can
inspect quickly.

## What is still mostly contractual

These areas are clearly present in the docs, but not yet strongly represented
as live public-surface proof from this pass:

- lighting and atmosphere fallback behavior,
- render-budget thresholds visible to the browser user,
- LOD and culling threshold capture bundles,
- a browser-visible summary of when the scene has degraded but is still
  intentionally playable,
- public linkage between the shell, the physics lab, and the threshold
  baseline.

In short: the repo has a good 3D architecture lattice, but the public-facing
evidence is still thinner than the policy surface.

## Current interpretation

The app already behaves like a browser game platform with named camera modes
and a distinct physics proof lane. That is a real structural strength.

What it does not yet give us, from this pass alone, is a single browser-visible
story that says:

- how the renderer degrades,
- how camera readability is protected,
- how LOD and visibility thresholds are compared across profiles,
- how the public shell and the physics lab agree on those thresholds.

That gap is exactly where the next 3D analysis work should go.

## Next probe recommendations

The next exploration slice should focus on the same 3D contract lattice, but
from a runtime-evidence angle:

1. compare the shell and lab against the performance/readability baseline;
2. inspect whether the visibility and LOD contract has a browser-visible
   threshold capture path;
3. check whether lighting/readability claims are observable in the public
   surface or only in policy notes;
4. decide whether the next skill lens should be browser-delivery oriented
   rather than purely 3D-architecture oriented.

The likely next skill after this one is `3d-web-experience`, because the next
question is not "does the app have 3D concepts?" but "how well does the web
surface deliver those concepts to a player in the browser?"

## Durable takeaway

This repo already has a serious 3D architecture backbone. The remaining work
is less about inventing new categories and more about proving them in the live
browser surface with thresholded, reviewable evidence.

## Addendum (2026-07-28) - 3d-web-experience lens

The `3d-web-experience` skill sharpens the next question: the repo already has
named cameras, a separate physics proof lane, and a browser-first shell, but
the public surface still needs to be trustworthy about delivery rather than
just expressive about 3D.

What the live and static evidence now suggests:

- The shell is already browser-native enough to support a real 3D product
  experience, not a decorative overlay.
- The accessibility and public-shell evidence already show that the app can
  present itself coherently on a mobile-sized viewport.
- The remaining gap is not "add more 3D". It is "make loading, fallback, and
  machine feedback readable to the player in the browser."

The animation and signature contracts make the split clearer:

- `VehicleAnimationSystem` owns rig-local presentation channels.
- `InteractionSystem` owns camera and selection controls.
- `Rig Signature and Feedback Emission` already proves the source-side
  contract, but it still lacks a listener-owned player-facing consumer.

So the next durable proof slice should be small and explicit:

1. connect the signature/feedback lane to one readable presentation cue,
2. keep the cue accessible and non-authoritative,
3. keep gameplay state separate from presentation state,
4. add or name the loading/fallback affordance the player actually sees.

That keeps the browser-delivery question aligned with the 3d-web-experience
skill: purpose over novelty, mobile-first trust, and an honest loading story.

## Addendum (2026-07-28) - live browser probe confirms a measured warmup state

The browser probe against `http://localhost:4173/?acceptance=field-02` in a
390 x 844 viewport tightened the analysis:

- the shell is not blank or stalled;
- it is explicitly narrating a measured warmup state;
- the player-facing save/profile/bootstrap lines are present and readable;
- the missing piece is still a first-class progress affordance, not basic
  browser trust.

Observed live strings:

- `Measuring device performance… Choose Enter the field to begin.`
- `Quality: measuring. Still measuring frame performance.`
- `New field ready · progress saves locally`

Observed gaps:

- no `progress` or `role="progressbar"` element,
- no `aria-busy` state,
- no percentage meter or visibly bounded warmup bar.

That makes the remaining work narrower and more honest: the browser already
explains itself, but the loading contract still stops short of a dedicated
progress indicator.

## Addendum (2026-07-28) - acceptance board exposure is desktop-first in the current shell

The live board probe also sharpened the shell interpretation:

- the acceptance board exists and opens in the desktop-ready path;
- the compact/mobile shell hides the masthead button cluster via CSS;
- the remaining question is therefore exposure policy, not missing runtime
  plumbing.

That matters for the 3D-web lens because it shows the browser surface is
already differentiating between viewports rather than trying to force every
overlay into every screen size. The next judgment is whether that policy is
acceptable for the public compact shell or should be narrowed with a smaller
entry path.

## Addendum (2026-07-28) - compact contract-board exposure is not a quality-profile symptom

The browser probe against the compact shell also confirmed one more useful
separation:

- the page is still on the `standard` profile awaiting evidence rather than
  the `mobile-safe` fallback,
- the contract-board trigger remains hidden because of shell viewport CSS,
- so the board entry gap is not a renderer-quality regression.

## Addendum (2026-07-28) - the bootstrap seam now has a determinate progress contract in source

The current runtime patch moved the loading seam one level deeper into the
3D/browser delivery contract:

- `#bootstrap-status` now carries determinate progress semantics while the
  shell is still measuring frame samples;
- `aria-busy` follows that warmup state instead of staying permanently false;
- the ready state still resolves to a normal status line once the sample
  target is met.

That is a useful 3D-web outcome because the app is no longer only narrating a
warmup state. It now exposes the warmup as an explicit browser contract. Live
browser verification is still the next proof step.

That keeps the 3D analysis honest: visibility profiles govern scene quality
and fallback reasons, while the shell's exposure policy governs whether the
player can discover the contract board at all.

## Addendum (2026-07-28) - the compact 3D surface is live, but still lacks a dedicated progress affordance

A compact-viewport probe at `390 x 844` showed the actual 3D game surface is
already present and interactive:

- `#game-canvas` is visible and rendered as a live canvas;
- `#map-canvas` exists but is hidden;
- the shell does not expose a `progress` element or `role="progressbar"` node;
- the visible status line still reports `Quality: standard.` rather than a
  named loading meter.

That means the current 3D-web issue is not a blank shell or missing scene. It
is a communication contract: the runtime comes up, but it does not yet offer a
first-class progress affordance for the browser warmup story. The surface is
already playable enough to inspect, which makes the remaining gap narrower and
more explicit.

## Addendum (2026-07-28) - the lighting contract is phase-driven and mostly implicit in the public shell

A follow-up browser probe on the live shell showed the current lighting story
is not exposed as a dedicated visible control panel. Instead, the surface
communicates light and phase through the shell state:

- `DAY` is visible in the masthead and world-clock;
- `N light` appears only as a hidden controls-legend hint;
- the public HUD does not surface a separate ambient/shadow/light-settings
  panel;
- the visible interaction model remains on camera, map, pause, and contract
  surfaces rather than on lighting adjustment.

That makes the present lighting contract easy to miss but still legible in
context: the game appears to be using phase-based environmental lighting as a
background system, with the player only given a keyboard hint rather than a
front-and-center lighting UI. For the repo record, the important distinction is
that lighting is present as a world-state cue, but not yet exposed as a player
feature.

## Addendum (2026-07-28) - texture/material state is visible through diagnostics and surface naming, not through a texture settings panel

A live browser probe also sharpened the texture/material side of the public
surface:

- runtime diagnostics expose a live texture count via `tex:16`;
- the visible environment names a specific ground/material state:
  - `HARDPAN TRACK`
  - `SURFACE GRIP`
  - `TRACK`
- hidden module copy and welcome text carry material-affecting language such
  as `Lug tyres`, `mud`, and `dust bowls`, which indicates the shell is
  already encoding surface and traction differences in player-readable terms;
- the public HUD still does not expose a dedicated texture or material settings
  panel, compression toggle, or texture-quality control.

That means the live texture/material contract is currently descriptive rather
than configurable: the game shows texture complexity in diagnostics and uses
surface naming to communicate traction/material differences, but it does not
yet give the player a separate texture-control surface. For a browser game,
that is the right distinction to preserve in the record because it keeps
rendering state, world state, and player-facing controls separate.

## Addendum (2026-07-28) - motion is visible as live gauges and overlay transitions, not as a keyframe animation surface

A follow-up probe against the live shell found the strongest animation signal
is the UI motion layer rather than a named animation editor or clip player:

- `#speed-needle`, `#tacho-needle`, and `#radar-sweep` are live SVG elements
  in the public shell;
- the pause overlay and radial overlay both use `opacity` and `visibility`
  transitions, so the shell is already animating shell-state changes even when
  it is not exposing a dedicated animation panel;
- the computed styles for the motion elements report no CSS keyframe
  animation name, which suggests the motion contract is stateful/discrete
  rather than cinematic or clip-driven at the shell layer;
- the visible runtime therefore communicates movement through gauges, sweep
  indicators, and shell transitions rather than through a player-facing
  animation editor or playback UI.

That is a useful architectural distinction for the repo record: the game does
have a motion language, but the public shell presents it as live telemetry and
overlay behavior, not as an editable animation feature. The next useful proof
slice would be to see whether a player-facing motion state ever becomes a
first-class control, but today the browser evidence still points to implicit UI
motion rather than exposed animation tooling.

## Addendum (2026-07-28) - post-processing is represented by lightweight shell effects, not a dedicated composer stack

A final probe for the effect stack found one visible post-processing-adjacent
signal, but it is modest:

- the public shell exposes an SVG `#glow` filter in the rumor/map surface;
- the map legend and grade bar use readably styled UI state to reinforce the
  current terrain and traction story;
- no dedicated post-processing control surface, bloom toggle, vignette panel,
  or color-grading UI is exposed to the player;
- the visible effect language remains tied to shell presentation and SVG/UI
  polish rather than a first-class `EffectComposer`-style feature set.

That keeps the record honest: the game does use visual emphasis and readable
surface treatment, but the effect stack is still a background presentation
detail rather than a player-owned post-processing system. For a browser game,
that separation is healthy because it avoids making the screen-space treatment
look like gameplay authority.

## Addendum (2026-07-28) - loader behavior is present as world-survey state, while asset failure remains hidden

A loader-focused probe found the shell does carry a progress-like readout, but
it is tied to world survey rather than asset ingestion:

- `#map-progress` is visible and currently reads `0% surveyed`;
- the public HUD still does not expose a dedicated asset-loading bar,
  `aria-busy` indicator, or retry surface;
- a no-render `#error-panel` exists with the message `The 3D scene is
  unavailable. Try again`, which shows a failure path is modeled in the DOM
  even though it is only surfaced on failure or preview, not in the ready
  shell;
- the runtime therefore separates three ideas that should stay distinct in the
  repo record:
  - world progress (`0% surveyed`),
  - asset/runtime loading (not publicly surfaced),
  - and failure fallback (hidden until an error state is actually raised).

That is the useful loaders takeaway for this browser game: the shell does not
currently act like a traditional asset-loader screen, but it does preserve a
distinct world-progress signal and an explicit failure panel behind the ready
state. The next proof slice would be a visible asset-loading or retry contract
if the product decides players need one.

## Addendum (2026-07-28) - geometry is exposed as world layout and count telemetry, not as a mesh editor

A geometry-focused probe found the public shell speaks in spatial terms, but
it does not expose a dedicated geometry-editing surface:

- the runtime diagnostics expose `geo:105`, which reads like a live geometry
  budget/count signal rather than a model inspector;
- the shell also exposes `bridges:2/2` and `props:233/233`, so the world is
  clearly tracking structural layout and repeated placed objects;
- the map and rumor surfaces describe node relationships, survey reach, and
  sightline-dependent visibility rather than raw vertex controls;
- the map note `The map only shows ground your rig could see. Climb for
  sightlines; a survey mast reaches further.` makes the spatial contract
  explicit in player language;
- there is no public geometry editor, mesh list, or instancing control panel
  in the shell.

That makes the geometry contract descriptive and operational rather than
authoring-oriented: the game shows world layout, structure counts, and
sightline constraints as live state, but it does not invite the player to edit
geometry directly. For the repo record, that distinction matters because it
keeps world-space truth, placement counts, and authoring tools in separate
layers.

## Addendum (2026-07-28) - material response is visible as grip, grade, and part choice, not as a material editor

A materials-focused probe found the shell communicates material behavior in
player terms rather than exposing a PBR editor:

- the visible traction panel surfaces `GRIP 82%` and `GRADE level` as live
  response to the current ground;
- the current capability line reads `Ploughing`, which ties the rig state to
  the terrain/material interaction rather than to a visual surface preset;
- the hidden workshop panel exposes material-affecting part choices such as
  `Low-range gearing`, `Lug tyres`, and `Survey mast`;
- the hidden part text explicitly describes why those parts matter:
  climbing grades, biting into mud and dust bowls, and extending sightlines;
- the public shell does not expose a dedicated material editor, paint booth,
  or surface-parameter panel.

That means the material contract is operational and legible: the player sees
surface grip, grade, and capability as live state, while the more specialized
material-affecting parts remain inside the workshop lane. That is a good
separation for the repo record because it keeps vehicle/material response
distinct from visual skinning or authoring tools.

## Addendum (2026-07-28) - shader behavior is implied by the live surface language, not exposed as a shader tool

A shader-focused probe did not find a player-facing GLSL or shader editor
surface, but it did confirm the game uses shader-like presentation language in
the shell:

- the `#glow` filter remains the main explicit effect signal in the rumor/map
  surface;
- the visible terrain/material vocabulary combines with lighting, traction,
  and survey state to produce a readable world surface;
- the shell does not expose a shader graph, fragment editor, uniform panel, or
  other direct shader-authoring control;
- the public UI therefore treats shader behavior as an implementation detail
  of readability and surface treatment rather than a user-owned tool.

That is the right distinction to preserve in the repo record: the browser
surface clearly benefits from shader-backed rendering, but the shell keeps the
shader layer invisible and lets the player interact with the results through
terrain, traction, and visibility language instead of shader knobs.

## Addendum (2026-07-28) - the foundational scene is exposed as a live canvas and camera selector, not as a scene editor

A fundamentals-focused probe confirmed the browser shell is built around a
real live 3D canvas and camera/navigation surface:

- `#game-canvas` is visible in the public shell;
- the visible help text explicitly offers `C · View menu` and suggests
  switching among Chase, Hood, Side, Tactical, Top-down, and Survey views;
- `#camera-select` exists in the DOM, indicating the camera system is a real
  shell control even though it is hidden in the ready state on this viewport;
- `#navigator-panel` exists with coordinate-style readouts such as `X: -12.1
  Z: -0.1`, which anchors the world in navigable scene space rather than a
  purely decorative overlay;
- the public shell still does not expose a scene graph editor, transform
  hierarchy editor, or Object3D inspection surface.

That means the fundamentals contract is live and gameplay-facing: the player
interacts with a real scene canvas and named camera viewpoints, while the
deeper scene setup stays hidden inside the implementation. For the repo
record, that keeps the fundamental 3D scene separate from authoring tools,
which is exactly the right split for a browser game that wants to stay usable
instead of turning into a scene editor.

## Addendum (2026-07-28) - the web-game shell is live in-browser, but it does not yet present a full PWA/asset-install contract

A browser-game-specific probe showed the shell respects the browser, but it
stops short of a full installable/PWA surface:

- the page is visible and interactive in the browser, with no unload guard or
  hidden tab state at the moment of inspection;
- `navigator.serviceWorker` exists, but there are no active registrations and
  no service-worker controller on the current page;
- there is no manifest link in the document head, only a favicon reference;
- there are no `<audio>` or `<video>` elements mounted in the ready shell;
- that means the current browser-game contract is a live WebGL app with
  browser-native status and controls, not an installable PWA with a surfaced
  offline asset pipeline.

That distinction matters for the repo record because it keeps the browser
capability boundary explicit: the game is definitely a browser-native title,
but the PWA/offline path is not yet part of the public contract. If that ever
changes, the next proof slice should be a real manifest, an actual service
worker registration, and a visible offline/fallback story the player can see.

## Addendum (2026-07-28) - sound is exposed as a control, but no audio assets are mounted in the ready shell

A game-audio probe found a browser-native audio contract, but it is still very
lightweight:

- the public shell exposes sound toggles in the masthead and the pause overlay;
- the visible control text explicitly reads `Sound on`;
- there are no `<audio>` or `<video>` elements mounted in the ready shell;
- there is no visible music, ambient, or SFX browser element to inspect in the
  current runtime state.

That means the current audio contract is a UI control contract, not an active
audio-playback contract. The player can toggle sound state, but the browser
surface does not yet mount a visible media pipeline or audio asset player in
the ready shell. For the repo record, that keeps browser audio behavior and
asset playback separate, which is the right boundary for a live game shell.

## Addendum (2026-07-28) - asset production and provenance are not surfaced as public shell controls

A 3D-asset-production probe found no public asset-pipeline vocabulary in the
ready shell:

- no visible export/import controls,
- no provenance or rights labels,
- no build/package/download workflow,
- no GLB/glTF/USD/FBX handoff panel,
- no asset-library or asset-version browser in the player-facing UI.

The hidden workshop parts and the live world diagnostics are about gameplay
state, not about asset delivery. That means the shell keeps production asset
workflow entirely behind the scenes, which is the correct separation for this
repo record: asset production is part of the build/content pipeline, but it is
not a player-facing contract in the current browser game.

## Addendum (2026-07-28) - rendering optimization stays implicit; the shell surfaces playability, not culling or LOD controls

A 3d-games probe found the browser shell still reads like a playable 3D
surface, not a rendering-editor surface:

- the live `#game-canvas` remains the public 3D scene entrypoint;
- the camera affordance is still framed as named views and readability help,
  not as a frustum/occlusion/LOD tuning panel;
- the public DOM text does not surface culling, batching, or level-of-detail
  controls;
- the diagnostic strip exposes performance and scene counts such as FPS,
  backend, geometry, texture, bridge, and prop totals, but those are readout
  signals rather than tuning knobs;
- the ready shell still presents the world as something the player can read and
  navigate, not something they can optimize through a visible renderer
  settings UI.

For the repo record, that means the engine’s rendering optimizations are still
an implementation concern. The player-facing contract is “the world is readable
and playable,” not “the player may author or tune the rendering pipeline.”

## Addendum (2026-07-28) - the 3D web-experience contract favors accessibility and playable entry, but not explicit low-end fallback UI

A 3d-web-experience probe showed the shell is trying to behave like a web app
first, not a static 3D toy:

- the public controls include `Skip to playable world`, `Fullscreen`, and
  `Accessibility`;
- the visible shell still includes camera/view guidance and touch-facing copy,
  which means the browser experience is being framed for interaction, not just
  observation;
- the current page is a compact mobile-sized viewport (`390 × 844`) with the
  3D canvas still present;
- the probe did not surface a dedicated loading skeleton, offline banner,
  low-end quality selector, or static 2D fallback UI in the ready shell;
- `prefers-reduced-motion` handling is present in the shell CSS and is now
  browser-verified: the transition clamp engages under reduced motion.

For the repo record, that means the app has the beginnings of a web-accessible
3D contract, but it still keeps the harder web-resilience pieces hidden behind
the implementation boundary rather than exposing them as a public player
choice.

## Addendum (2026-07-28) - accessibility structure is already unusually strong for a live game shell

An accessibility-auditor probe found the shell already ships with a serious
amount of semantic structure:

- `Skip to playable world` is present as a real skip link into `#game-canvas`;
- the canvas itself is focusable and carries an accessible name:
  `Rigs Unbound playable world`;
- the page exposes real landmarks and named regions such as `main`, `header`,
  `aside`, `section`, `footer`, and descriptive region labels like `Game
  status`, `Rig instruments`, `World opportunities`, `Controls`, `Touch driving
  controls`, and `Workshop`;
- the shell surfaces a large set of keyboard-reachable controls, including
  camera selection, contracts, map/radar, recovery, fullscreen, and touch
  driving actions;
- the hidden dialog surfaces are not just visually hidden; they already carry
  `role="dialog"` plus `aria-modal="true"`, and several of them are wired to
  labels and descriptions;
- live status and alert messaging is present through `role="status"`,
  `role="alert"`, and `aria-live` regions.

The remaining caveat is that this probe did not verify screen-reader output,
contrast ratios, or tab-trap behavior end to end. So the structural contract is
strong, but the full accessibility story is still only partially proven at the
runtime level.

## Addendum (2026-07-28) - Physics Lab 01 is a real secondary simulation surface, but it currently boots into a failure fallback

A browser-daemon probe of `http://localhost:4173/physics-lab` found a distinct
simulation route rather than a simple modal:

- the page title is `Rigs Unbound — Physics Lab 01`;
- the route exposes a real `#physics-canvas` with the accessible name
  `Playable Rapier raycast vehicle laboratory`;
- it includes telemetry for `SPEED`, `SLIP`, `WHEEL CONTACT`, `PHYSICS`,
  `FRAME`, `BODIES / COLLIDERS`, `VIEW`, `SOLVER`, and `TIME`;
- it surfaces controls for `Pause`, `Debug geometry`, `Reset rig`, camera
  views, physics frequency, time scale, touch steering, and a return path back
  to `Field 02`;
- the page also exposes a skip link into the physics laboratory, which means
  the route is intentionally treated as a first-class browser surface;
- the runtime state currently includes an explicit failure message:
  `Physics laboratory could not start. Return to Field 02`.

Console inspection did not show a JS runtime exception beyond the normal Vite
connection chatter, so the failure message may be the lab’s own fallback state
rather than an uncaught crash. For the repo record, this makes the Physics Lab a
real secondary surface with useful simulation controls, but not yet a confirmed
healthy runtime path.

## Addendum (2026-07-28) - Box3D Probe 01 is a parallel physics route with its own contract vocabulary and the same fallback pattern

A second browser-daemon probe of `http://localhost:4173/box3d-lab` found a
distinct route with a slightly different physics vocabulary:

- the page title is `Rigs Unbound — Box3D Probe 01`;
- the canvas is named `Playable Box3D physical-wheel vehicle probe`;
- the lab header calls itself `BOUNDED SOLVER EXPERIMENT / EVIDENCE FIXTURE`;
- the telemetry includes `BOX3D 0.1.0 / BOX3D-WASM 0.2.0`, `BODIES /
  SHAPES`, `SLIP ESTIMATE`, `WHEEL PROXIMITY`, `PHYSICS`, `FRAME`, `VIEW`,
  `SOLVER`, and `TIME`;
- the controls mirror the Rapier lab shape but rename the debug control to
  `Debug contract` and the route backlink to `Rapier lab`;
- the runtime state also shows a fallback message:
  `Box3D probe could not start. Return to Rapier Physics Lab 01`.

That makes Box3D a second dedicated simulation route, not merely a variant label
inside the main field shell. It also suggests the repo is experimenting with
parallel physics backends or evidence fixtures, while still keeping the public
surface honest about startup failure.

## Addendum (2026-07-28) - the accessibility statement is now a real public browser-facing trust surface

The shell’s `Accessibility` link resolves to a browser-visible statement page,
and the page is not a stub:

- the title is `Accessibility Statement - Rigs Unbound`;
- it states the current accessibility posture in plain browser-facing language;
- it names what is already working, what still needs validation, the known
  gaps, feedback guidance, and related evidence links;
- the linked repo doc [Accessibility Statement](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/ACCESSIBILITY_STATEMENT.md)
  mirrors the same promise in durable markdown form;
- the page explicitly remains honest about what has not yet been proven,
  including manual assistive-technology testing and the loading-progress story.

For the repo record, this is important because the app now has a public-facing
accessibility promise boundary instead of hiding that policy in private notes.
The contract is still intentionally incomplete, but it is now discoverable from
the browser shell and mirrored in repo docs.

## Addendum (2026-07-28) - the loading/progress issue remains open and the public statement now matches that fact more carefully

The browser-delivery loading review still treats startup progress as a P2
clarity gap:

- the shell is readable and trustworthy;
- the startup story is still textual rather than a named progress/warmup
  affordance;
- the root-cause note points to a binary measuring/ready state model;
- the closure trigger still requires a visible loading or warmup affordance on
  the canonical Field 02 surface.

That matters because the public accessibility statement now mirrors the same
honesty: fallback-aware browser behavior is part of the current runtime posture, and
reduced-motion handling is now browser-verified. The repo record should keep
treating startup progress as an open browser-delivery issue, not as a solved UX
pattern.

## Addendum (2026-07-28) - the browser-facing accessibility statement now matches the revised repo wording after refresh

After updating `accessibility.html`, a fresh browser navigation to
`/accessibility?refresh=1` showed the new statement text live:

- `The live runtime includes fallback-aware browser behavior.`
- `Reduced-motion browser settings are honored in the shell.`

That confirms the public pointer and repo statement are aligned again instead of
drifting on stale wording. The page still keeps the loading story explicit as
textual rather than meter-based, which is consistent with the open loading
issue review.

## Addendum (2026-07-28) - the root browser shell is still not installable as a surfaced PWA

A live probe of the canonical root shell confirmed the current browser contract
stops short of installability:

- `index.html` exposes a favicon and a `theme-color` meta tag;
- no manifest link is present in the document head;
- `navigator.serviceWorker` exists, but there is no active controller on the
  current page;
- `display-mode: standalone` is false in the inspected browser session;
- the player gets a browser-native WebGL shell, not a surfaced install/offline
  PWA contract.

That is consistent with the earlier web-experience analysis: the app is built
for browser playability and readability first, while installability remains an
implementation boundary rather than a public player promise.

## Addendum (2026-07-28) - the asset bridge is real in developer mode and fenced off from the public surface

A live compare of the two browser surfaces confirmed the asset-promotion split
that the docs describe:

- `?surface=developer` sets `body.dataset.surface` to `developer`;
- the developer surface loads both runtime GLBs:
  `kenney-car-kit-breakable-crate-fixture.glb` and
  `kenney-car-kit-tractor-preview.glb`;
- the normal player surface sets `body.dataset.surface` to `player`;
- the normal player surface loads no `.glb` runtime assets in the inspected
  navigation.

That proves the runtime bridge is not imaginary: the developer surface can see
the imported assets, and the public surface still stays clean until
`publicRuntimeApproved` changes. The browser-visible separation is therefore
working even though the promotion decision itself remains proposed.

## Addendum (2026-07-28) - the mission acceptance surface is live and stateful in the canonical browser shell

A browser probe of the `Contracts` control showed the contract board is a real
dialog in the live shell:

- opening the board moved focus to `#mission-board-close`;
- the board reported `role="dialog"` and `aria-modal="true"`;
- the first proposition row was marked selected with `aria-pressed="true"`;
- the `Accept contract` button became enabled once a row was selected;
- the board stayed a distinct overlay surface rather than mutating the whole
  shell into a different page.

That makes the mission-acceptance docs materially grounded. The browser already
has a live row-selection surface that matches the board contract, which means
the remaining work is refinement and proof around edge cases rather than
inventing the basic surface from scratch.

## Addendum (2026-07-28) - the pause overlay now has proper focus recovery, but its announcement remains textual

A browser probe of the `KeyP` pause path showed a mixed result:

- the pause overlay opens as a real dialog with `role="dialog"` and
  `aria-modal="true"`;
- the primary resume control receives focus on open;
- closing the overlay returns focus to `#game-canvas`;
- the visible pause label remains `Paused.` in `#current-prompt`;
- but `#current-prompt` itself still does not expose a dedicated live-region
  or announcement role.

So the focus problem that the earlier review tracked is fixed in the live shell,
but the underlying announcement contract is still only partially proven. The
shell has a visible pause cue and a recoverable dialog, yet the dedicated
non-visual announcement path still needs its own named surface.
## Addendum (2026-07-28) - the workshop panel remains hidden on the current player surface

A live probe of the player shell found `#workshop-panel` present in the DOM but
still `hidden: true` with focus staying on `#game-canvas`. The visible player
controls do not surface a dedicated workshop trigger in the current state, so
the workshop remains a real progression surface in the source trail but not a
currently mounted dialog on this player surface. That keeps the earlier workshop
review open: the surface exists, but its discoverability contract still needs a
player-facing entry path.

## Addendum (2026-07-28) - 3d-web-experience lens on the radial touch path

The browser-delivery lens found one more concrete seam in the current shell.

Live browser probe at `http://localhost:4173/` in a `390 x 844` mobile
viewport:

- `#welcome-panel` is a real first-run modal gate with `role="dialog"` and
  `aria-modal="true"`;
- its visible dismiss path is `Enter the field`;
- after dismissing it, `#touch-radial-action` becomes reachable and opens the
  radial overlay;
- the radial overlay itself is a real dialog surface with four visible items
  on the mobile shell;
- the focus contract is still incomplete in this viewport because focus stays
  on `#touch-radial-action` after open rather than moving to the radial close
  control;
- `Tab` then escapes to `#control-lesson-dismiss` instead of staying inside the
  quick-action overlay.

That keeps the browser-delivery story honest: the shell is touch-aware and the
wheel is mounted, but the mobile focus handoff still needs hardening before the
quick-action path can be treated as fully self-contained.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The next browser-facing check should compare the mobile and
desktop focus paths so the radial contract can be written once, with one
explicit focus target and one explicit escape path.

## Addendum (2026-07-28) - the radial mobile issue is visibility first, then focus

A later DOM probe tightened the mobile finding.

Observed on the `390 x 844` mobile shell after opening `Quick`:

- `#radial-overlay` is mounted and populated,
- but its computed `visibility` remains `hidden`,
- `#radial-menu-close` is present and focusable in markup,
- `document.activeElement` still stays on `#touch-radial-action`.

So the open path is not just missing a focus handoff. The overlay is not yet
visibly surfaced in the mobile probe, which means the next browser-delivery
proof has to inspect both visibility state and focus state together.

Anything else? Yes. The correct follow-up is not to keep treating the wheel as
a mere keyboard trap; it is a visibility-and-focus contract on touch-sized
shells.

## Addendum (2026-07-28) - pause now proves focus recovery, but not an announcement surface

A live browser probe of the pause path clarified the current shell behavior:

- `KeyP` opens a real modal pause dialog with `role="dialog"` and
  `aria-modal="true"`;
- focus lands on `#pause-resume` when the dialog opens;
- clicking Resume closes the dialog and restores focus to `#game-canvas`;
- the visible pause cue is still only `Paused.` in `#current-prompt`;
- `#current-prompt` does not yet expose its own `role` or `aria-live`
  contract.

That keeps the 3D-web-experience lane honest: the shell’s modal mechanics are
solid, but the player-facing pause announcement is still textual rather than an
explicitly modeled announcement surface.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The pause route now belongs in the “announcement semantics”
queue, not the “focus recovery” queue.

## Addendum (2026-07-28) - bootstrap status is a narrated state, not a progress meter

A live browser probe of the pre-entry shell on a `390 x 844` viewport found a
clear distinction:

- `#welcome-panel` is a real modal gate with `role="dialog"` and
  `aria-modal="true"`;
- `#bootstrap-status` is a polite `role="status"` region;
- its text says `Measuring device performance… Choose Enter the field to
  begin.`;
- there is no `progress` element or `role="progressbar"` in the current live
  surface;
- `aria-busy` is not set on the bootstrap status region.

So the shell does have an honest loading narrative, but it is still a narrated
status contract rather than a bounded progress contract. That is the next
browser-delivery seam if we want the shell to explain startup more explicitly to
players and assistive tech.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The current loading story is readable, but the progress
story is still implicit.

## Addendum (2026-07-28) - the mission board is desktop-first on the compact shell

A mobile-sized browser probe found that the `Contracts` control is present in
markup but not exposed as a box on the compact surface. The responsive CSS hides
`.masthead__buttons` under the mobile/coarse-layout breakpoint, so
`#mission-board-button` remains in the DOM but has no rendered box on the touch
shell.

That means the mission board is currently a desktop-first overlay, not a touch-
first shell surface. The behavior is intentional policy, not a broken click
path, but it does mean the compact shell does not yet offer a mission-board
entry point of its own.

Evidence depth: Tier 4 live browser inspection plus Tier 1 CSS inspection.

Anything else? Yes. The compact shell still needs an explicit decision on
whether the contract board should get a touch-safe entry path, or remain a
non-mobile overlay by design.

## Addendum (2026-07-28) - touch Radar is now a pure navigator toggle

A code-path review found a compact-shell coupling bug: the touch `Radar`
button was falling through the generic tap-action handler and could also route
into the pause fallback. That meant one touch action was trying to toggle both
a persistent navigator surface and a modal overlay.

The runtime path in `src/main.ts` now skips the generic tap fallback for
`button[data-tap-action="navigator"]`, so touch `Radar` is only a navigator
toggle.

That keeps the visible label honest and removes a cross-wire between a HUD
toggle and the pause overlay. The fix still needs a fresh browser confirmation
in a later pass.

Evidence depth: Tier 1 source inspection of the corrected runtime path.

Anything else? Yes. The touch `Radar` action now matches its label, but the
next proof should confirm the live click path no longer enters pause.

## Addendum (2026-07-28) - touch Radar now confirms as a pure navigator toggle

A fresh browser probe on a `390 x 844` mobile viewport confirmed the runtime
fix:

- tapping `Radar` turns `#navigator-panel` on (`aria-hidden="false"`),
- `#pause-overlay` stays closed,
- the current prompt stays on the Home Silo workshop state,
- the active element remains the `Radar` button itself.

That confirms the touch `Radar` action now behaves as a single-purpose HUD
toggle rather than cross-wiring into pause.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The compact-shell touch actions now read more like the
visible labels promise, which is the kind of small but durable browser trust
improvement this exploration lane is looking for.

## Addendum (2026-07-28) - the mobile map focus path now lands on the close control

A fresh live browser probe on a `390 x 844` mobile viewport confirmed the map
hardening:

- tapping `Map` opens `#map-overlay` as a real dialog with `role="dialog"` and
  `aria-modal="true"`;
- the close control is visible;
- focus now lands on `#map-close` after the delayed open assertion;
- the close control keeps focus across the later checks instead of leaving focus
  on the Map trigger button.

That closes the mobile map-focus gap that the earlier probe surfaced. The shell
now has a touch-exposed major overlay whose open path actually hands focus to
its close control.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The map overlay is now a stronger proof that the compact
shell can do modal focus handoff correctly when the runtime explicitly claims
it.

## Addendum (2026-07-28) - the mobile radial wheel now stays open and focuses the close control

A fresh browser probe on a `390 x 844` mobile viewport confirmed the full
compact-shell radial path after the lesson suppression and delayed-focus fixes:

- tapping `Quick` opens `#radial-overlay` as a visible dialog;
- the overlay remains open across later checks instead of being closed by the
  control lesson;
- focus settles on `#radial-menu-close` after the delayed focus assertion;
- the close control remains focused through later checks;
- the wheel still contains the four live items: Air down, Air up, Differential
  open, and Winch.

That closes the mobile radial visibility and focus gap. The compact shell now
has a touch-exposed quick-action overlay that behaves like a real modal control
surface instead of a transient flash.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The radial wheel now proves the same core shell trust shape
as the map overlay: it opens, stays open, and hands focus to its close control
on the touch shell.

## Addendum (2026-07-28) - the headline prompt is now an explicit live region

The shell’s main prompt line now carries the announcement contract directly in
markup:

- `#current-prompt` has `role="status"`, `aria-live="polite"`, and
  `aria-atomic="true"`;
- the attribute set is present before entering the world;
- the pause path still renders `Paused.` through the same prompt line;
- the prompt now behaves like a deliberate status/announcement surface instead
  of a plain heading with changing text.

That tightens the browser-delivery story one step further: the shell’s central
status line is now both visually prominent and semantically explicit.

Evidence depth: Tier 4 live browser inspection plus Tier 1 markup inspection.

Anything else? Yes. The headline prompt is now doing real accessibility work,
which makes the remaining shell narrative surfaces easier to reason about.

## Addendum (2026-07-28) - the desktop contract board now proves the overlay contract too

A fresh desktop browser probe confirmed that the mission board now stays open
and focuses its close control after the suppression fix:

- `Contracts` opens `#mission-board` as a real dialog,
- `#mission-board-close` becomes the active element and stays focused,
- selected rows enable `Accept contract`,
- the board still closes cleanly when requested.

That gives the shell a third concrete overlay proof point alongside Map and the
radial quick-action wheel. The current 3D/browser story is no longer just about
camera and status text; it also includes stable, focus-safe modal overlays in
practice.

Evidence depth: Tier 4 live browser inspection.

Anything else? Yes. The contract board now behaves like a proper shell surface,
which is the right shape for a layered browser game rather than a single-canvas
prototype.


## Addendum (2026-07-28) - the public profile line now resolves to a plain-language full-detail state after entry

A follow-up browser probe on the live shell confirmed the player-facing profile
line is now clearer after world entry:

- warmup state: `Quality: measuring. Still measuring frame performance.`;
- post-entry ready state: `Quality: standard. Full scenery detail is active.`;
- the bootstrap warmup contract stays separate from the runtime profile signal;
- the profile line remains a live status region rather than a developer-only
  diagnostic.

That closes the loop on the browser-facing profile wording: the visible 3D
surface now explains both the measuring phase and the settled full-detail state
in plain language.

## Addendum (2026-07-28) - the developer diagnostics line now exposes the fallback policy too

The developer-surface formatter now names the renderer-visibility policy
directly, and the live browser probe shows the operator lane using the warmup
and steady forms while the helper remains unit-covered for fallback:

- warmup: `Renderer visibility warmup: standard (insufficient-frame-samples)`;
- steady: `Renderer visibility steady: standard`;
- fallback: `Renderer visibility fallback: mobile-safe (...)`.

That keeps the public HUD player-facing while the hidden operator lane stays
terse and code-oriented.

## Addendum (2026-07-28) - the developer diagnostics lane now has an acceptance-only visibility preview hook

I followed the 3D-games lens into the live browser seam and closed the last
gap between the operator helper and the actual page state:

- `window.__forceProfile("mobile-safe")` now exists on the developer surface;
- the renderer accepts that preview profile without touching simulation;
- the public HUD still reads `Quality: standard. Full scenery detail is active.`;
- the developer diagnostics line now reports
  `Renderer visibility fallback: mobile-safe (acceptance preview)`.

Evidence depth: Tier 4 live browser inspection plus Tier 2 helper coverage.

Anything else? Yes. The analysis is now anchored in a real acceptance preview
path instead of only in policy text.

## Addendum (2026-07-28) - no-render fallback is now tracked as a dedicated issue

The browser-3D seam is now split into two verified recovery lanes and one
resolved degraded-mode lane:

- policy fallback exists,
- context-loss recovery exists,
- a true no-render fallback surface now exists.

The dedicated review lives at
`docs/reviews/rigs_unbound_issue_review_2026-07-28.md`.

Evidence depth: Tier 1 source inspection plus Tier 4 live browser inspection.

## Addendum (2026-07-29) - camera selection is already semantic, lighting is still keyboard-first

A fresh shell probe shows the camera contract is already a good 3D-control
surface:

- `View` is a real `<select id="camera-select" aria-label="Camera view">`;
- the available camera modes are named options (`Chase`, `Hood`, `Side`,
  `Tactical`, `Top-down`, `Survey`);
- the active selection is therefore exposed through standard form semantics,
  not a custom widget.

The remaining control-surface gap is lighting:

- the help legend exposes `N light`;
- the live DOM does not expose a persistent on-screen light control button;
- that makes lighting a keyboard-first affordance rather than a durable touch
  or pointer control.

So the shell already gets the camera contract right, but lighting still needs a
stronger visible control story if we want the 3D input surface to feel equally
complete across input modes.


## Addendum (2026-07-29) - renderer diagnostics are visible, but not announced

A fresh accessibility probe found one more split in the shell's 3D telemetry:

- `#bootstrap-status` is a proper live status region (`role="status"`,
  `aria-live="polite"`, `aria-atomic="true");
- `#runtime-diagnostics` is visible text, but it has no `role`, no `aria-live`,
  and no `aria-atomic` state;
- the renderer visibility warmup note is therefore readable on screen, but it is
  not announced as a status update for assistive tech.

So the shell still distinguishes user-facing readiness from diagnostics, but the
renderer warmup line remains an on-screen metric rather than a narrated state.

## Addendum (2026-07-29) - touch controls cover core actions, but lighting remains absent

A fresh input-surface probe shows the touch layer is real and usable for the
main work verbs:

- `touch-primary-action`, `touch-blade-action`, `touch-recovery-action`, and
  `touch-radial-action` are present in the live DOM;
- the touch strip exposes blade, recovery, and quick actions directly;
- those buttons carry explicit labels such as `Lower field plough` and
  `Switch blade from cut to fill`.

The remaining touch-parity gap is lighting:

- the shell still does not expose a persistent touch-visible light toggle;
- lighting remains keyboard/help-legend only (`N light`);
- that makes the light control less discoverable on pointer and touch-first
  surfaces than the other core rig actions.

So the touch contract is strong for the main driving and blade verbs, but the
lighting affordance still does not feel first-class across input modes.

## Addendum (2026-07-29) - some toggles announce state, while radar and quick action still only change text

A fresh control-state probe shows the shell already distinguishes good toggle
semantics from weaker ones:

- `mute-button` exposes `aria-pressed="false"`;
- the map layer buttons use `aria-pressed` to show the active layer;
- `controls-legend-toggle` exposes `aria-expanded="false"` with
  `aria-controls="controls-legend"`.

The remaining weak spots are the radar and quick-action controls:

- `pause-navigator` reads `Radar off`, but it has no `aria-pressed`, so its
  state is visible only as text;
- `touch-radial-action` reads `Quick`, but it also has no announced toggle or
  expanded state.

So the shell already has examples of good stateful controls. The next polishing
gap is making the radar and quick-action surfaces match that standard instead
of relying on label text alone.

## Addendum (2026-07-29) - the radial overlay is semantic, but its launcher still is not

A fresh browser probe confirms one more split in the quick-action surface:

- `#radial-overlay` is a proper `role="dialog"` surface with the expected
  hidden/visible behavior;
- `#touch-radial-action` is still just a plain button labeled `Quick`;
- the launcher does not expose `aria-expanded`, `aria-controls`, or a similar
  announced state contract for open/closed behavior.

So the wheel itself is semantically sound, but the launcher still relies on
label text instead of a stateful accessible contract. That makes the radial
entry point weaker than the dialog it opens.

## Addendum (2026-07-29) - two modal dialogs are still missing accessible names

A fresh modal-contract probe shows most overlays are labeled correctly, but two
dialogs are still under-specified:

- `#mission-board` and `#pause-overlay` expose `aria-labelledby` and are named
  dialogs;
- `#map-overlay` and `#radial-overlay` expose `role="dialog"` and
  `aria-modal="true"`, but they do not expose `aria-labelledby` or
  `aria-describedby`;
- both of those overlays therefore rely on visible text alone for their
  accessible name instead of a named dialog contract.

So the shell has modal behavior, but two of the overlays still need explicit
accessible naming to match the quality of the named mission board and pause
dialogs.

## Addendum (2026-07-29) - mission board and radial overlays now show the modal focus contract

Fresh browser probes confirmed the modal interaction path on two dialogs:

- `#mission-board` opens from its button, moves focus to
  `#mission-board-close`, and returns focus when closed;
- `#radial-overlay` opens from `#touch-radial-action`, moves focus to
  `#radial-menu-close`, and returns focus to `#game-canvas` when closed.

That means the shell already has a working modal-focus pattern, not just modal
markup.

The remaining unproven seam is the map overlay trigger:

- `#map-overlay` is still a hidden modal dialog in the DOM;
- in this session its visible touch/keyboard trigger did not produce an open
  state we could verify;
- so map-focus behavior remains unverified here, rather than positively broken.

So the modal contract is partly proven and partly still under observation. The
named dialogs and radial sheet now show the intended focus behavior, while the
map path needs a reliable live activation check before it can be called done.


## Addendum (2026-07-29) - pause now shows the modal focus contract too

A fresh keyboard probe confirmed the pause path works the same way as the other
named dialogs:

- pressing `P` opens `#pause-overlay`;
- focus lands on `#pause-resume`;
- closing the overlay returns focus to `#game-canvas`.

So pause is not just a labeled modal; it also follows the shell's modal focus
pattern.

## Addendum (2026-07-29) - the map overlay also follows the modal focus contract after entering the field

After entering the field, the map path became verifiable:

- clicking the `Map` control opens `#map-overlay`;
- focus lands on `#map-close`;
- closing the overlay returns focus to `#game-canvas`.

So the earlier unverified map seam was state-dependent, not broken. The map
overlay is another working modal-focus dialog once the shell has left the
welcome state.

## Addendum (2026-07-29) - the regular modal dialogs do not have the fallback's explicit Tab trap

Source inspection closes one last accessibility distinction:

- the no-render fallback installs a dedicated `keydown` handler that traps
  `Tab` and routes `Escape` to retry;
- the regular dialogs use shared open/close focus management, but they do not
  attach an equivalent dialog-specific `keydown` trap in source;
- that means the shell now has verified open/close focus behavior for the
  dialogs, but not the same explicit keyboard-trap contract the fallback
  surface has.

So the modal dialogs are usable and focus-managed, but the fallback still has a
strictly stronger keyboard contract than the regular overlays.

## Addendum (2026-07-29) - the map and radial launchers now expose open state, and pause radar is initialized too

The last control-state gaps from the recent shell audit are now wired through
source and reflected in the live browser:

- the map opener now exposes `aria-controls="map-overlay"` and
  `aria-expanded="false"`;
- `#touch-radial-action` now exposes `aria-controls="radial-overlay"` and
  `aria-expanded="false"`;
- `#pause-navigator` is initialized with `aria-pressed="false"` instead of
  relying on text alone at startup.

That means the earlier state-announcement gap on the map and radial launchers
is now closed. The remaining modal distinction is narrower: the regular dialogs
still use open/close focus management, while the no-render fallback keeps the
stronger explicit `Tab`/`Escape` trap.

## Addendum (2026-07-29) - the regular modal dialogs now share the Tab trap too

The shared modal keydown handler is now live in source, and a browser probe on
the pause dialog confirmed it:

- opening `#pause-overlay` and pressing `Tab` moved focus from
  `#pause-resume` to `#pause-mute`;
- the regular modal dialogs therefore now keep focus inside the dialog instead
  of leaking it back to the page;
- the fallback surface still keeps its dedicated retry behavior, but the
  regular dialogs are no longer weaker on Tab containment.

So the remaining difference is now mostly about fallback-specific retry
semantics, not basic modal focus trapping.

## Addendum (2026-07-29) - Shift+Tab wrap is source-backed, even though the live probe timed out

A direct source check shows the shared modal handler wraps focus in both
directions:

- `Tab` advances to the next focusable control inside the active modal;
- `Shift+Tab` wraps back through the same focusable set;
- the handler only runs while one of the visible modal dialogs is active.

The live pause probe for the reverse direction timed out, so that direction is
source-backed here rather than live-verified in this session. The important
part is still clear: the modal trap is intended to wrap, not just keep focus in
one direction.

## Addendum (2026-07-29) - Shift+Tab wrap is now live-verified on the pause modal

A fresh browser probe confirmed the reverse wrap in the real shell:

- `Tab` moved focus from `#pause-resume` to `#pause-mute`;
- `Shift+Tab` moved focus back from `#pause-mute` to `#pause-resume`;
- the pause modal therefore wraps focus in both directions in-browser.

So the shared modal trap is now fully verified live, not just from source.

## Addendum (2026-07-29) - the accessibility statement is now a real browser-facing pointer

The next browser-delivery seam is not whether the shell has an accessibility
statement. It does. The live shell links to `/accessibility.html`, and the
statement page is already present in the repo as a durable public artifact.

What that changes:

- the accessibility posture is now discoverable from the player-facing shell;
- the statement can be audited without relying on chat memory or an internal
  note;
- the remaining work is mostly about manual inclusive QA coverage and keeping
  the statement's `Last updated` stamp synchronized with the evidence trail.

What is still not fully proven from this pass:

- spoken screen-reader narration over the public shell;
- 200% zoom and narrow reflow validation on the statement page itself;
- JavaScript-disabled fallback behavior for the public promise surface.

So the current 3D web-experience takeaway is narrower and more useful: the app
already has a browser-facing trust surface for accessibility, but the next
proof slice is the manual QA stack that makes that surface durable.

## Addendum (2026-07-29) - the accessibility surface is now browser-verified in the key low-level cases

The current browser work closed several of the lower-level accessibility
questions that were still open in this analysis:

- the public statement page is reachable from the shell;
- the statement page still works with JavaScript disabled;
- the statement page stays in bounds at 200% browser scale;
- the shell honors reduced-motion settings in the browser;
- the shell accessibility tree exposes the skip link, main region, dialog,
  and key controls;
- terse touch controls now expose clearer spoken names in the accessibility
  tree.

What still needs a true human-quality screen-reader pass is the spoken
narration experience itself: how the live status text, warmup language, and
dynamic control feedback sound when read end to end by an actual screen reader.
That is now the remaining proof slice, not the structural baseline.

The shell now also exposes explicit spoken labels for the live announcement
surfaces, the current objective now speaks as a full phrase, and the world
clock has been made passive text to avoid time-update chatter. The remaining
work is quality and flow rather than unlabeled regions.

The notification toast also stays out of the accessibility tree while idle now,
so the live feedback surface is available when needed without adding extra
spoken clutter between messages.

## Addendum (2026-07-29) - the loading story now has semantic progress, so the old "no progressbar" note is stale

A live browser probe against the shell's bootstrap state now found a named
`Loading status` progressbar while measuring, with bounded `aria-valuenow`
state and a descriptive progress message. The same surface returns to a normal
status once warmup completes.

That means the earlier loading notes in this analysis were too broad. The live
issue is no longer "the shell has no progress semantics"; it is whether the
bootstrap, profile, and diagnostics surfaces read as one coherent story to a
human screen-reader user.

## Addendum (2026-07-29) - the old "no progressbar" shell note is stale, but the cohesion question remains

A fresh live probe now shows the bootstrap surface is semantic rather than
merely textual:

- `#bootstrap-status` is a `progressbar` while measuring;
- `#profile-status` stays visible with the active quality string;
- `#runtime-diagnostics` is hidden from the public HUD.

So the shell no longer lacks progress semantics. The remaining browser-facing
question is whether the bootstrap, profile, and ready states read as one calm
story instead of three separate announcements.

## Addendum (2026-07-29) - the runtime summary is acceptance-only, not public-shell text

A live route comparison shows the current split very clearly:

- the public shell hides `#runtime-diagnostics`;
- the `?acceptance=field-02` shell reveals `#runtime-diagnostics` with the
  renderer/backend summary;
- both routes keep `#bootstrap-status` as the progressbar and `#profile-status`
  as the visible quality line.

That makes the remaining question a phrasing/cohesion question, not a missing
progress or missing diagnostics question.

## Addendum (2026-07-29) - ADR-0039 is the durable browser-policy anchor for this split

The route split in this analysis now has a named decision trail:

- ADR-0039 keeps `#bootstrap-status` public and semantic;
- ADR-0039 keeps `#profile-status` public and visible;
- ADR-0039 route-gates `#runtime-diagnostics` to the acceptance/developer
  surface.

That matters for the 3D record because the public shell and the acceptance
surface are now intentionally carrying different parts of the same browser
story. The analysis should keep treating the public shell as the player-facing
surface and the diagnostics route as the reviewer-facing evidence lane.

## Addendum (2026-07-29) - the next lens is asset production, not just asset presence

The `3d-asset-production` skill makes the next gap more concrete:

- the repo already has a real asset-pipeline vocabulary;
- the remaining question is whether assets are packaged as delivery-ready
  contracts, not just referenced as scene content;
- web delivery needs the weakest target to be explicit, along with scale,
  provenance, material, LOD, and validation expectations;
- generated or imported 3D content should stay non-authoritative until it has a
  clear source/export/preview/validation trail.

That means the next exploration slice should keep asking:

1. which assets are public/runtime-admitted,
2. which assets are reference-only,
3. what proofs exist for scale, provenance, and packaging,
4. where the browser surface tells the player or reviewer that distinction.
