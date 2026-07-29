# Worklog Addendum — 2026-07-29

## Analysis thread — 3d-web-experience is the next browser-delivery lens

- Re-read the `3d-web-experience` skill and used it as the next analysis lens
  after the `3d-games` pass.
- The live repo trail already shows browser-first 3D structure, but the public
  delivery policy is still unnamed enough to need its own durable note.
- Added `docs/research/3D_WEB_EXPERIENCE_BROWSER_DELIVERY_ADDENDUM_2026-07-29.md`
  so the browser-delivery gap is now recorded as a concrete next proof slice
  instead of only as a conversational recommendation.
- The next analysis question is not "add more 3D"; it is "make the browser
  delivery policy explicit enough that players and reviewers can tell what is
  full-fidelity, reduced, or fallback."

Anything else? Yes: the parallel-owned runtime files were left untouched.

## Analysis thread — accessibility lens tightens the public promise boundary

- Re-read the `Accessibility Auditor` skill and applied it to the current
  public statement / shell evidence trail.
- The public accessibility statement now names the manual inclusive QA stack
  explicitly instead of leaving it implied in the review notes.
- The remaining open proof is narrowed to spoken screen-reader narration on
  the live shell and statement page; browser-visible structure, reduced motion,
  zoom, and JavaScript-disabled rendering are already part of the documented
  trail.

Anything else? Yes: the accessibility work is still documentation and
evidence alignment, not a runtime behavior change.

## Analysis thread — browser-daemon probe confirms the public statement route shape

- Used the Browser Daemon lens to check the live accessibility statement route
  instead of relying only on static docs.
- The live browser session currently reports `http://127.0.0.1:4173/accessibility`
  with the expected `Accessibility Statement - Rigs Unbound` title.
- The visible page structure still matches the durable promise note: the main
  heading is `Accessibility Statement`, and the page links to shell evidence,
  live repo analysis, and the public promise contract.

Anything else? Yes: this is browser evidence for the public statement route,
not a claim that manual spoken narration is already complete.

## Analysis thread — asset-production lens narrows the remaining proof to promotion records

- Re-read the `3d-asset-production` skill against the current asset-provenance
  and runtime-bridge notes.
- The runtime bridge is already proven live for the small static prop and the
  tractor preview, so the remaining question is not whether imported GLBs can
  load.
- The next durable asset proof is the public-approval record itself: a compact
  rights/provenance summary tied to the promotion decision, not just the
  registry entry.

Anything else? Yes: the asset work is still documentation and evidence
alignment, not a new asset import.

## Analysis thread — promotion records now require compact rights/provenance summaries

- Updated the public-asset promotion approval template, checklist, and
  workflow so the approval record must carry a compact rights/provenance
  summary tied to the decision itself.
- That closes the documentation gap the asset-live-analysis note was pointing
  at: rights/provenance is no longer only a registry concern; it is now part of
  the promotion decision record.

Anything else? Yes: the asset lane still needs a real approval decision to be
recorded, but the template shape is now explicit enough to support it cleanly.

## Analysis thread — game-design keeps tow-plus-repair as the next coherent loop

- Re-read the `game-design` skill and the current activity/command readiness
  contract.
- The next coherent activity proof is still tow-plus-repair because it gives
  the player a clean action -> feedback -> recovery -> repeat loop while
  reusing the existing command/result seam.
- The generic activity registry should continue to wait until a third
  materially different activity exists and proves the same pattern in real
  play.

Anything else? Yes: this is still a design-contract update, not a runtime
feature change.

## Analysis thread — audio stays a support channel, with one readable cue next

- Re-read the `game-audio` skill and the game/UI synthesis against the current
  audio contract.
- The next audio proof is still intentionally small: one readable machine-state
  cue, persisted mute, and one explicit suppression rule for bursty sounds.
- That keeps audio aligned with the rest of the browser surface: support the
  machine feel, do not become the only place where state is understood.

Anything else? Yes: this remains documentation and evidence alignment, not a
runtime audio-system change.

## Analysis thread — accessibility/input now points at durable bindings and a visible profile indicator

- Re-read the `Accessibility Auditor` lens against the current input and shell
  notes.
- The shell already has named actions, visible help, and a real quick-action
  surface.
- The next input proof is now narrower: reload-safe bindings plus a visible
  input/accessibility profile indicator, with the compact-shell contract
  remaining a policy choice rather than an input failure.

Anything else? Yes: the input work remains documentation and contract
alignment, not a new control implementation.

## Analysis thread — replay now points at an exportable artifact, not a richer validator

- Re-read the replay / run-record contracts alongside the current command and
  envelope notes.
- The browser-visible replay validator is already useful proof, but the next
  durable step is still a portable replay artifact:
  - exportable retained input history,
  - stable compatibility classification,
  - and a visible divergence reason when the artifact cannot be replayed
    safely.
- The lane stays on the product side of the line without becoming a ghost/share
  feature prematurely.

Anything else? Yes: the replay work is still documentation and evidence
alignment, not a new playback implementation.

## Analysis thread — replay is still about a portable artifact with visible divergence, not a bigger validator

- Re-read the replay acceptance record after the loop, camera, audio, and
  authority passes.
- The current validator already does the right local work: explicit replay
  classes, visible unsupported-entry failures, and deterministic reducers.
- The next proof slice is the portable artifact boundary:
  - retained input history that can be exported,
  - compatibility classification that survives import/reload,
  - and a divergence reason that can be shown to the player or operator.
- That keeps replay explainable instead of turning it into a second authority
  source.

## Analysis thread — behavior/planner now points at one multi-candidate selector

- Re-read the planner contract alongside the command/event and replay notes.
- The repo already has deterministic single-verb resolution and a reusable
  history spine.
- The next proof is now explicit: one machine/task selector or activity scorer
  with at least two valid candidates, deterministic tie-breaking, and a
  structured reason for the losing branch.

Anything else? Yes: the planner work is still documentation and contract
alignment, not a new AI framework.


## Analysis thread — replay lane still wants a portable artifact before any shared-state promise

- Re-read the replay contract together with the current exploration map entry for replay/input-log work.
- The durable next proof is still the same shape: an exportable replay artifact with compatibility classification and a visible unsupported/divergence reason.
- That keeps the order honest: first a portable artifact that can explain itself, then any ghost/share or shared-state promise built on top of it.
- The exploration map now reflects that narrower proof slice instead of implying the next step is simply a richer validator.

Anything else? Yes: replay is still a prerequisite lane for shared authority, not a substitute for it.

## Analysis thread — live browser evidence confirms the developer surface, but the JS probe path is flaky

- Re-checked the live browser daemon on the canonical `4173` surface.
- Status currently reports `http://127.0.0.1:4173/?surface=developer` with the
  `Rigs Unbound` title.
- The captured console slice is healthy enough to continue analysis: it shows
  repeated Vite `connecting` / `connected` messages, but no app errors in the
  observed buffer.
- The `browser-client.js exec` path returned `about:blank` even after a
  successful navigation command, so it is not a trustworthy DOM witness for
  this session.
- That means the next live-browser proof should use a more reliable probe path
  before we make any claim about rendered replay or shared-authority controls.

Anything else? Yes: the runtime is live, but the current browser probe channel
is only partially useful.


## Analysis thread — the multiplayer skill confirms the current staging order

- Re-read the local `multiplayer` skill and checked it against the repo’s authority and replay contracts.
- The skill’s architecture tree lines up with the repo’s current staging order: authoritative dedicated server for competitive play, host-based authority for casual co-op, and input/state separation before any networked mutation.
- That reinforces the current conclusion rather than changing it: the repo’s next shareable proof is still replay/ghost portability, not a networked multiplayer implementation.
- The exploration map now names that decision tree explicitly so future work does not blur async sharing, small co-op, and server authority into the same layer.

Anything else? Yes: the multiplayer lane is now better bounded, not bigger.


## Analysis thread — web-games lens says the browser surface needs a trustworthy fidelity witness

- Re-read the `web-games` skill and paired it with the live browser daemon evidence.
- The app is confirmed live on the canonical developer surface, and the console buffer is mostly Vite lifecycle noise, so the shell is healthy enough to continue analysis.
- The important gap is not raw browser uptime; it is a reliable DOM/render witness. The current IPC exec probe produced `about:blank`, so browser-delivery policy should not lean on that channel as truth.
- The browser-delivery contract therefore needs to name full-fidelity, reduced, and fallback states and also define how they are witnessed in the live surface.

Anything else? Yes: the web-games lens turns the browser witness itself into part of the contract.


## Analysis thread — game-design now points at one tow-plus-repair rescue loop

- Re-read the `game-design` skill and the current core-loop/progression contract.
- The next proof is not a generic activity registry. It is one concrete tow-plus-repair rescue loop that can be experienced inside the 30-second loop: drive, attach, recover, improve, repeat.
- That gives us a durable player-facing test of action -> feedback -> reward without pretending the broader progression or mission systems are already finished.
- The mission acceptance surface stays separate above the loop; this note only sharpens the next loop-sized proof.

Anything else? Yes: the loop is the proof, not the abstraction around it.


## Analysis thread — accessibility now narrows to spoken narration of the tow-plus-repair loop

- Re-read the accessibility/input contract and the public accessibility promise against the current loop/progression notes.
- The shell is already structurally accessible enough that the next real proof is not another landmark pass; it is narration quality.
- The next accessibility proof should make the shell speak the same tow-plus-repair loop in a coherent way: objective, action, recovery, reward, and next possibility.
- That keeps accessibility tied to the player-facing loop instead of treating it as a separate settings panel problem.

Anything else? Yes: the remaining accessibility gap is spoken narration quality, not structural operability.


## Analysis thread — the mission board’s next question is compact exposure policy, not existence

- Re-read the first-playable slice and the execution tracker with the
  dialogue/narration tranche in mind.
- The next proof slice is now explicitly a text-first conversation surface:
  arrival and bargain, the naming beat as player-authored dialogue, and shell
  narration as the announcement layer.
- That keeps the opening readable and accessible without inventing a second
  story engine or narrative authority.
- `src/game/` remains parallel-owned and was left untouched during this
  analysis.

Anything else? Yes: the remaining work here is still documentation and
evidence alignment, not a runtime narrative-system change.

## Analysis thread — gameplay-critical 3D stays essential while decorative 3D can degrade

- Re-read the browser-delivery addendum with the 3D web-experience skill in
  mind.
- The next browser-proof should distinguish load-bearing 3D from decorative
  3D so the public surface can degrade safely without hiding gameplay truth.
- That keeps the browser contract honest about accessibility and performance:
  wonder is optional, but playability is not.
- The docs trail remains the source of truth here; `src/game/` was not
  touched.

Anything else? Yes: this is still policy documentation, not a renderer
rewrite.

## Analysis thread — the first playable needs one obvious 30-second loop

- Re-read the first-playable slice through the game-design skill lens.
- The next proof is not another system definition; it is the one loop the
  player should feel immediately: problem, repair/recover, visible response,
  improved next attempt, repeat.
- That gives the opening a quick win, a readable surprise, and a rest beat
  without inventing a separate progression machine.
- The slice now has a sharper design question to answer: if the opening loop
  is not obviously satisfying, the game still needs more design proof.

Anything else? Yes: this is a design-contract note, not a runtime change.

- Re-read the mission acceptance surface contract and the shell contracts together.
- The board is already real on desktop, while the compact/mobile shell still hides the trigger cluster and shows only passive status hints.
- The next useful decision is therefore about exposure policy: keep the board desktop-first, or add a smaller compact entry path that preserves the same choice semantics.
- That keeps the board as a choice layer rather than letting it drift toward a second authority or another status-only panel.

Anything else? Yes: the board question has shifted from “does it exist?” to “how should compact/mobile expose it?”


## Analysis thread — the collision matrix now needs a trigger/sensor pair, not another blocker

- Re-read the 3d-games lens against the dynamic-world collision exploration and category/mask contract.
- The collision system already proves the important first-playable blocker behavior. The next durable proof is a non-blocking pair: one trigger and one sensor.
- That keeps the matrix from becoming abstraction theatre: the contract only matters if it can distinguish block, fire, observe, and ignore in real gameplay roles.

## Analysis thread — collision now wants one trigger and one sensor, not more blocking geometry

- Re-read the collision category/mask contract after the loop, camera, audio,
  and browser-delivery passes.
- The next proof slice is deliberately small:
  - one trigger that fires a consequence without mutating physics;
  - one sensor that observes or announces without blocking motion.
- The current best candidates remain the workshop/contract pad for trigger and
  the survey mast or replay/debug probe for sensor.
- That keeps collision semantics honest: a category/mask system is only useful
  if it can separate block, fire, observe, and ignore in the same real space.

## Analysis thread — performance wants one named comparison bundle, not more raw metrics

- Re-read the performance/per-frame budget lens against the KPI and loading
  notes.
- The runtime already exposes useful signals, and the live browser surface is
  still on the canonical developer route.
- The next proof slice is therefore not “add another metric.” It is one named
  comparison artifact that binds:
  - load / first-controllable timing,
  - profile or fallback state,
  - draw-call / triangle pressure,
  - and a short operator note about what changed under pressure.
- That keeps the performance story reviewable instead of just measurable.

## Analysis thread — browser witness is live again, but the JS exec path is not trustworthy yet

- Re-anchored the browser daemon to the canonical developer surface on
  `http://127.0.0.1:4173/?surface=developer`.
- The daemon now reports the title `Rigs Unbound` and a higher console-log
  count, which confirms the route is live again.
- The direct `browser-client.js exec` DOM probe still returned `undefined`,
  so this session cannot yet treat that probe path as a trustworthy witness for
  rendered DOM state.
- The next browser-delivery proof should use a stronger inspection route than
  the current exec snippet before we make any player-facing claim from it.

## Analysis thread — game-audio tightens to one rescue-loop cue plus persistence visibility

- Re-read the `game-audio` skill after the loop and accessibility passes.
- The current audio contract already supports the right direction: audio should
  help the player read machine state, speed, strain, and success.
- The next proof slice is therefore very small and concrete:
  - one cue that changes when the tow/recover/repair state changes;
  - one explicit source or signature path for that cue;
  - one persisted mute/preference trail visible after reload.
- That keeps the audio layer supportive of the loop rather than letting it
  become a separate music director or a second HUD.
- The best candidate pair remains a workshop/contract pad trigger and a survey or replay/debug probe sensor.

Anything else? Yes: the next collision proof is role separation, not more blocking geometry.


## Analysis thread — audio should speak rescue state, not become a soundtrack system

- Re-read the `game-audio` skill against the current audio contract, loop contract, and accessibility notes.
- The next proof is intentionally small: one readable cue for tow/recover/repair state changes in the rescue loop, persisted mute, and an explicit cooldown for bursty interaction sounds.
- That keeps audio as a support channel for machine feel and comfort instead of letting it become a second HUD or a replacement for shell narration.
- The rescue loop is the right target because it is already the next concrete player-facing loop, so the audio cue can be judged against something real.

Anything else? Yes: the audio lane is now about rescue-state legibility.


## Analysis thread — camera should explain the rescue loop, not add another mode

- Re-read the camera contract against the current loop, audio, and accessibility notes.
- The camera system is already rich enough that the next proof is not a new mode or a new camera state machine.
- The useful gap is one advisory recommendation with a reason string for the tow-plus-repair rescue loop, kept player-overridable and explainable through the existing camera vocabulary.
- That keeps the camera lane focused on framing the loop the player is actually trying to read, rather than inventing another view category.

Anything else? Yes: the camera work is now about explanation quality for the rescue loop.


## Analysis thread — the umbrella baseline now needs one canonical budget table

- Re-read the performance/readability baseline, the KPI note, and the draft operator bundle together.
- The runtime already produces enough pressure evidence to justify one canonical operator table, but the bundle remains draft-only.
- The next proof slice should be a single budget table naming within-budget, degraded-but-acceptable, and fail-soft states, plus a fail-soft summary that points back to the specialized contract owners.
- The KPI note still flags actor count and active physics count as missing first-class fields, so the operator bundle should call those out instead of pretending the current snapshot is already complete.

Anything else? Yes: the umbrella baseline is now a packaging problem, not a missing-observability problem.

## Analysis thread — the budget table now needs a clear owner map and explicit missing metrics

- Re-read the umbrella baseline together with the operator-observability contract and the runtime KPI note.
- The next operator bundle should not only classify within-budget, degraded, and fail-soft states; it should also point to the specialized contract owner for whichever threshold was exceeded.
- The measurement gap is still the same and should be made visible in the bundle itself:
  - actor count,
  - active physics count.
- That keeps the operator artifact honest: the bundle can already summarize the live surface, but it should not pretend the runtime is reporting fields it still only implies.

Anything else? Yes: the next proof is one canonical budget table with a named owner path and a visible measurement gap.

## Analysis thread — the asset lane now points to the approval record, not another bridge candidate

- Re-read the `3d-asset-production` skill against the current asset trail and public-promotion package.
- The runtime bridge admission is already proven, and the package index now makes the public approval boundary readable.
- The remaining proof is the promotion record itself:
  - asset identity,
  - compact rights/provenance summary,
  - runtime proof reference,
  - rollback or replacement path,
  - operator sign-off.
- That keeps the asset trail honest by making the promotion decision the thing that turns a loadable bridge into player truth.

Anything else? Yes: the asset lane now has a single missing artifact, not an open-ended promotion problem.

## Analysis thread — browser delivery now points to a visible progress/profile affordance

- Re-read the `3d-web-experience` skill against the loading/profile bootstrap contract and the accessibility/profile visibility analysis.
- The shell is already truthful about boot, save, and fallback state, so the app is not failing at basic browser trust.
- The remaining browser-delivery seam is narrower:
  - a clearly named progress affordance distinct from ordinary status text,
  - or a clearly named player-facing comfort/profile indicator that does not require developer diagnostics.
- That is the next durable proof slice because it makes the current loading story legible to players without inventing a new runtime system.

Anything else? Yes: browser delivery is now about naming progress and profile in the player surface, not proving the shell is alive.

## Analysis thread — the live shell is readable, but the progress story is still text/status based

- Re-checked the live browser surface at `http://127.0.0.1:4173/?surface=developer`.
- The current shell is truthful and readable:
  - `#bootstrap-status` says `Field systems ready with standard scenery detail.`
  - `#profile-status` says `Quality: measuring. Still measuring frame performance.`
  - `#save-status` says `New field ready · progress saves locally`
- But the live DOM still has no dedicated `progress` element and no
  `[role=progressbar]` node, so the progress contract is still conveyed as
  text/status rather than as a named progress affordance.
- That makes the next browser-delivery proof slice very specific: either add a
  dedicated progress affordance, or intentionally bless the status-based
  narrative as the public contract and document why that is sufficient.

Anything else? Yes: the browser lane now has runtime proof, not just static synthesis, and it confirms the remaining seam is narrow.

## Analysis thread — the map overlay is a real dialog, but the probe path still is not stable enough to prove focus behavior cleanly

- Re-checked the map overlay through the browser daemon after the world shell
  loaded.
- The overlay now reads as a real dialog in the live DOM:
  - `role="dialog"`,
  - `aria-modal="true"`,
  - labelled by `#map-overlay-title`,
  - in-world controls for `Field`, `Rumor`, `Journal`, and `Close`.
- That means the earlier “missing dialog contract” reading was too strong.
  The remaining question is tighter:
  - can the browser probe consistently prove focus entry and restore,
  - or is the current daemon path too flaky to treat as authoritative for that
    behavior?
- For now, keep the gap phrased as focus/discovery stability rather than a
  missing ARIA dialog structure.

Anything else? Yes: the map overlay is semantically sound; the open/focus proof still needs a more trustworthy witness.

## Analysis thread — audio mute works in-session, but persistence is still absent from localStorage

- Re-read the audio contract against the live developer surface and checked the
  current mute control state.
- The visible audio toggle is working:
  - the pause/menu mute control starts at `Sound on`,
  - it toggles to `Sound off` in-session when activated.
- The persistence half is still missing from the current browser probe:
  - no `sound`, `audio`, or `mute` keys were present in `localStorage` during
    the check.
- That means the audio lane now has a very concrete gap: comfort toggles work
  for the current session, but the preference is not yet visibly persisted
  across reloads.

Anything else? Yes: the audio lane has moved from a prose-only gap to a runtime-proved session-toggle / no-persistence split.

## Analysis thread — control lessons persist, but the binding registry is still missing

- Re-read the accessibility/input contract after the live browser probe.
- The shell already persists first-use control lessons:
  - `localStorage` contains `rigs-unbound.control-lessons.v1`.
- But that is still not the reload-safe binding registry the contract asks for,
  and the visible profile line remains the quality state rather than an input
  or accessibility profile indicator.
- So the input lane now has a useful split:
  - help/lesson persistence exists,
  - remap/binding persistence is still missing,
  - visible input/accessibility profile state is still missing.

Anything else? Yes: the shell remembers some help, but not yet the full input policy layer.

## Analysis thread — the visible quality profile is browser-proven, but the input-profile layer is still separate

- Re-read the visible input/accessibility profile issue after the live browser
  probe.
- The public shell now clearly shows the quality profile in-session:
  - `#profile-status` reads `Quality: standard. Full scenery detail is active.`
  - `#runtime-diagnostics` stays hidden from the public HUD.
- The browser also confirms the shell remembers first-use control lessons:
  - `localStorage` contains `rigs-unbound.control-lessons.v1`.
- So the profile layer is now more precise:
  - the quality profile is visible and readable,
  - the first-use help layer persists,
  - the reload-safe binding registry / input-profile layer is still the durable
    missing piece.

Anything else? Yes: the player-facing quality profile is live, but the separate input-policy surface still needs its own persistence story.

## Analysis thread — the save announcement contract is now browser-proven

- Re-checked the live shell against the save/recovery announcement contract.
- `#save-status` is a real live status region in the browser:
  - `role="status"`
  - `aria-live="polite"`
  - `aria-atomic="true"`
- That means the save line is no longer just a visual persistence label; it is
  part of the accessible browser contract now.
- The remaining work around save/recovery is therefore broader narration QA,
  not the browser-visible announcement contract itself.

Anything else? Yes: one of the older accessibility gaps can now be retired as a browser-contract issue.

- Picked the next skill lenses in sequence: `3d-games`, then `3d-web-experience`, then `3d-asset-production`.
- The durable repo note now separates engine-side 3D concerns from browser-delivery policy and asset-production contracts instead of lumping them into one vague 3D bucket.
- `docs/exploration/EXPLORATION_MAP.md` now points at that split so future passes can find the right analysis lane quickly.
- The public asset package index is now documented as discovery only; the approval record template remains the canonical public-approval decision artifact.
- A repo search did not find a populated public-asset approval record yet, so the asset lane is still waiting on an actual operator decision artifact rather than implying one exists already.
- Added `docs/reviews/PUBLIC_ASSET_PROMOTION_APPROVAL_RECORD_FIELD_MAP_2026-07-29.md` so the approval template fields now point at their source evidence instead of leaving the operator to guess.
- The new worksheet is now linked from both the package index and the main reviews navigation, so the approval trail is reachable from the two expected entry points.
- The manifest-side asset-pipeline analysis now names the field map too, so the manifest is clearly identity/provenance state while the approval worksheet carries the operator decision path.
- The reviews home now puts the public asset promotion package index, checklist, template, and field map in the intended reading order before any approval decision.
- The public asset promotion review itself now links the field map directly, so the approval trail is reachable without bouncing through the package index first.
- Added `docs/research/SCREEN_READER_NARRATION_PASS_2026-07-29.md` so the remaining accessibility gap is now a concrete manual QA pass instead of a vague “spoken narration” reminder.
- Re-checked the live browser daemon on the canonical developer route and captured a current runtime failure: `createInitialRadialMenuState` is undefined, with a follow-on `src/game/radial-ui.ts` module-load error.
- Reconciled the failure against the radial authority audit so the static dead-code analysis and the current live boot failure are separated instead of being conflated.
- Added `docs/research/RADIAL_MENU_BOOT_FAILURE_SNAPSHOT_2026-07-29.md` so the live failure has one durable browser-evidence anchor.
- The snapshot is now linked from the reviews home as well, so the live failure is discoverable alongside the blocker review.
- The master execution tracker now carries the same live radial boot-failure snapshot so the operational board matches the browser evidence.
- The execution tracker now points at the same pre-signoff draft, so the operational board and the review trail stay aligned on the same non-approved asset state.
- Added a compact decision packet so the crate approval trail can be reviewed in one sit-down without mistaking the packet for the decision itself.
- The new pre-signoff record is now the quickest place to review the crate candidate evidence without mistaking it for approval.

## Analysis thread — resource budget now wants one named low-budget capture bundle

- Re-read the resource-budget envelope after the KPI, loading/profile, and
  browser-delivery notes.
- The runtime already measures pressure, and the developer browser surface is
  still live on the canonical route.
- The next proof slice is not another metric field. It is a named capture
  bundle that ties:
  - the measured budget state,
  - the selected fallback or steady profile,
  - the observed render/load pressure,
  - and a short operator note about what changed under pressure.
- That turns the fallback envelope into a reviewable artifact rather than a
  loose set of live measurements.

## Analysis thread — observability now needs first-class actor and physics counts

- Re-read the runtime KPI note after the operator-observability and resource
  budget passes.
- The runtime already exposes enough pressure information to justify fallback
  policy, but the actor and physics dimensions are still implicit in the
  snapshot.
- The next proof slice is therefore a first-class summary field or snapshot
  extension that names:
  - per-frame actor count,
  - active physics count,
  - and the profile/fixture pair those counts belong to.
- That makes operator comparison easier because it separates renderer pressure
  from simulation pressure in the same summary.

## Analysis thread — the public asset packet is readable, but the populated approval record is still missing

- Re-read the public asset promotion packet after the package index and field
  map.
- The repo now has the correct decision trail shape:
  - discovery surface,
  - field map,
  - pre-signoff record,
  - approval template,
  - runtime bridge proof.
- The missing piece is still the populated approval record itself. The packet is
  a cover note, not the authority.
- That keeps the asset lane honest: runtime bridge proof is already present,
  but public approval remains a separate durable artifact.

## Analysis thread — streaming now wants one deterministic chunk key plus one measured lifecycle

- Re-read the streaming/world-residency contract after the world-scaling and
  observability passes.
- The world is still intentionally single-residency, so the next proof slice
  should not be a full streamer. It should be the first explicit residency
  boundary:
  - one deterministic chunk key from fixed grid coordinates;
  - one manifest-validated request/validate/activate/unload lifecycle;
  - one active-residency budget counter;
  - one operator-visible churn or activation-latency summary.
- That keeps world truth canonical while making residency measurable instead of
  implicit.

## Analysis thread — the event graph still needs a named handler ownership map

- Re-read the event-graph contract after the replay, observability, and browser
  delivery passes.
- The runtime already records ordered outcomes in the bounded run record, so
  the missing piece is the shared dispatch graph itself:
  - one explicit handler ownership map;
  - one replay-safe consumer and one diagnostics-only consumer;
  - one traceable fan-out order for a canonical event kind;
  - one rule that keeps presentation from mutating state through the event
    path.
- That keeps simulation, presentation, replay, and diagnostics aligned without
  pretending the current record flow is already a full event bus.

## Analysis thread — the capability lane now wants a versioned definition plus one owned adapter boundary

- Re-read the capability contract after the event, streaming, and observability
  passes.
- The repo already has structured admissions and composition-backed capability
  claims, so the missing piece is no longer basic yes/no gating.
- The next proof slice is the smallest versioned boundary that makes the
  capability lane explicit:
  - one versioned capability definition record,
  - one owned adapter registration boundary,
  - one explicit denial reason code path for an unsupported claim,
  - one world-affordance example tied to a real rig/action pair.
- That keeps the current composition model intact while making future machines,
  tools, and motion families easier to validate and explain.

## Analysis thread — visibility/LOD now wants one representation-tier proof slice

- Re-read the visibility contract after the current renderer/accounting passes.
- The repo already exposes useful visibility accounting:
  - near/mid/far/culled counts,
  - submitted-vs-candidate pressure,
  - and capacity pressure.
- The next proof slice should not be another cull counter. It should be one
  imported-asset representation example plus one operator-visible tier summary
  that distinguishes visibility bookkeeping from actual lower-fidelity asset
  selection.
- That keeps the contract narrow and honest: the current seam explains load,
  but it does not yet prove representation LOD.

## Analysis thread — asset production now wants a source-to-runtime representation chain

- Re-read the asset-pipeline analysis after the promotion and rights/provenance
  notes.
- The current lane is now split cleanly enough to avoid a vague "asset work"
  bucket:
  - visibility/LOD still needs a representation-tier proof slice;
  - public approval still needs a durable rights/provenance-linked promotion
    record.
- The next asset-production proof should therefore be a source-to-runtime
  chain for one asset family, not another bridge candidate:
  - one named source file or source package;
  - one documented runtime derivative or export target;
  - one explicit rights/provenance summary carried into the promotion note;
  - one visible representation choice or LOD-variant summary tied to the
    exported asset.
- That keeps asset production grounded in deliverable consumer contracts rather
  than in generator-side output alone.

## Analysis thread — browser delivery now wants one named fidelity witness

- Re-read the browser-delivery analysis after the web-3D skill pass.
- The browser trail already distinguishes full-fidelity, reduced, and fallback
  states in principle.
- The next proof slice should be one explicit witness surface that names the
  current mode and loading state in the browser itself, instead of another route
  probe or console-only observation.
- That witness should make the browser story legible to the player and reviewer:
  what is intentionally degraded, what is still interactive, and what still
  needs time to become ready.

## Analysis thread — accessibility wants the witness to be perceivable, not just visible

- Re-read the accessibility/input contract after the browser-delivery note.
- The browser witness is useful only if assistive tech can perceive the same
  state:
  - one narrated status or mode change;
  - one focusable route into that state;
  - one keyboard path that reaches the witness without pointer input.
- That keeps the delivery promise honest for screen-reader and keyboard users,
  not just sighted reviewers.

## Analysis thread — lighting now wants a named tier matrix, not another mood pass

- Re-read the lighting/atmosphere contract after the camera and browser-delivery
  passes.
- The runtime already shows the key behavior: lighting can simplify
  responsibly while preserving readability.
- The next proof slice should make that policy explicit in contract form:
  - one named lighting tier matrix keyed to phase or budget;
  - one operator/debug field that reports the active lighting strategy;
  - one formal fallback rule that says exactly when atmosphere yields to
    clarity.
- That keeps the lighting lane reviewable as policy instead of as another set of
  rendered effects.

## Analysis thread — the event graph now needs one owned handler map

- Re-read the event-graph contract after the replay, observability, and
  browser-delivery passes.
- The current record substrate is good enough to keep ordered truth, but the
  event graph still lacks an explicit ownership boundary.
- The next proof slice should be one canonical event kind routed through:
  - one named owner in the handler map;
  - one replay-safe consumer;
  - one diagnostics-only consumer;
  - one traceable fan-out order;
  - one rule that keeps presentation from mutating state through the event
    path.
- That keeps the event lane reviewable as reusable dispatch policy instead of
  as ad hoc local command handling.

## Analysis thread — loading/bootstrap now wants one cohesive narrative

- Re-read the bootstrap contract after the browser witness note.
- The browser now has enough pieces to tell the player that the shell is
  measuring, the profile is active, and the field is ready.
- The next proof slice should therefore not be another progress control. It
  should be one cohesive bootstrap narrative that binds:
  - the measuring state,
  - the selected profile state,
  - the ready state,
  - and one plain-language transition reason that explains why the shell is
    still waiting or has already settled.
- That keeps the public surface readable without creating a second loading
  model.

## Analysis thread — resource budget now wants one capture bundle that explains the shell

- Re-read the resource-budget contract after the KPI and bootstrap passes.
- The browser now has enough public state to explain itself at three levels:
  - the bootstrap narrative;
  - the active profile state;
  - and the fallback/degrade reasoning.
- The next proof slice should therefore be one named low-budget capture bundle
  that combines:
  - the measured budget state;
  - the selected profile or fallback state;
  - the operator-visible bootstrap narrative;
  - and the pressure source summary that explains why the shell is in that
    state.
- That keeps the resource envelope reviewable as a single evidence object
  instead of as separate runtime facts that have to be mentally stitched
  together later.

## Analysis thread — the render profile matrix now needs one human-readable summary

- Re-read the render profile matrix after the bootstrap and budget passes.
- The matrix already has the policy shape it needs:
  - full, standard, and mobile-safe tiers;
  - visible profile state in the shell;
  - acceptance-only diagnostics for deeper rationale.
- The next proof slice should therefore be one human-readable summary that ties
  the active profile to its visible tradeoffs in the live shell, rather than a
  second policy table or a new hidden rules layer.
- That keeps the render lane understandable to players and reviewers without
  duplicating the matrix as a second authority surface.

## Analysis thread — the shell profile now wants one browser-proved owner

- Re-read the VFX/state-shell visual-quality contract after the render-profile
  pass.
- The shell lane already has the core ingredients:
  - a state-shell mesh and shader envelope;
  - live integrity and impact data from feedback;
  - profile-dependent quality policy elsewhere in the render stack.
- The next proof slice should be one browser-proved shell profile that owns the
  visible rig-state language for a single quality band, with a clear public
  approval boundary.
- That means no separate shell style forks for the same quality level. The
  contract should prove one owned profile first, then let later variation build
  on that owner.

## Analysis thread — audio and accessibility should announce the same rescue cue

- Re-read the audio and accessibility contracts together.
- The next proof slice should make the tow/recover/repair state readable in
  more than one channel:
  - the audio cue survives mute persistence and stays cue-sized;
  - the same state change is announced in an accessible live region or
    equivalent perceivable path;
  - keyboard users can reach the same state without pointer-only interaction.
- That keeps the player trust contract aligned across sound, narration, and
  input rather than letting each channel drift toward a separate story.

## Analysis thread — observability now needs one named actor/physics summary

- Re-read the operator-observability contract after the KPI and shell/profile
  passes.
- The local diagnostics lane already has enough structure to explain the app:
  snapshot, run record, performance data, profile policy, and acceptance-only
  DOM diagnostics.
- The next proof slice should therefore not be a new telemetry system. It
  should be one named diagnostics extension that reports:
  - per-frame actor count;
  - active physics count;
  - and the profile/fixture pair those counts belong to.
- That keeps the operator lane useful for comparing scenes and budgets without
  turning diagnostics into authority or public HUD clutter.

## Analysis thread — replay now wants one exportable artifact with a human-readable verdict

- Re-read the replay contract after the current run-record and browser-witness
  notes.
- The replay lane already has the right local ingredients:
  - bounded run record;
  - admitted initial context;
  - validator verdicts for verified, unsupported, invalid, diverged, and
    truncated records;
  - browser-visible validation access.
- The next proof slice should therefore be one portable replay artifact that
  carries:
  - a retained input slice or exportable record;
  - the compatibility classification;
  - the validation verdict;
  - and a human-readable reason when replay is unsupported or diverged.
- That keeps replay on the product side of the line without turning it into a
  ghost/share transport or a richer validator layer.

## Analysis thread — camera now wants one visible recommendation summary

- Re-read the camera contract against the current loop, audio, and accessibility notes.
- The current camera lane already has the right mechanics and evidence hooks.
- The next proof slice should therefore be one advisory recommendation plus one
  browser-visible reason summary that explains why the current mode helps the
  tow-plus-repair loop.
- That summary should live in the same local evidence lane as the existing
  camera evidence, but it must stay player-overridable and must not become a
  second camera brain.

## Analysis thread — mission acceptance headers now need a compact-shell entry point

- Re-read the board-header contract after the loading, transition, and player
  orientation notes.
- The desktop runtime already proves the board header and summary can exist as
  a readable overlay.
- The remaining gap is the compact shell, which still suppresses the trigger
  cluster that opens the board in smaller viewports.
- The next proof slice should therefore be one compact-shell-visible entry
  point that preserves:
  - the board title,
  - the short summary line,
  - the explicit mode indicator,
  - and the close/back path.
- That keeps the contract aligned across viewport classes instead of treating
  the small shell as a different board.

## Analysis thread — loading and empty-state need compact-shell-safe recovery cues

- Re-read the loading/refresh and empty-state contracts after the board-header
  pass.
- The next proof slice should be one compact-shell-safe loading/refresh state
  that preserves:
  - the board title;
  - the last known selection or section context when available;
  - a short honest loading or refreshing message;
  - and the visible close/back path.
- The corresponding empty-state slice should keep a compact-shell-safe recovery
  hint visible without pretending the board is loading.
- That keeps the board honest across viewport classes: loading explains waiting,
  empty explains absence.

## Analysis thread — row selection and transition need compact-shell-safe continuity

- Re-read the row/announcement and transition/restore contracts after the
  compact-shell board-header and loading passes.
- The next proof slice should be one compact-shell-safe row set that preserves:
  - one visible selected-state indicator;
  - one announcement path for selection changes;
  - one accept action and one dismiss/back action;
  - one keyboard-only path through rows and actions.
- The matching transition slice should preserve:
  - one explicit open action;
  - one explicit close action;
  - one mode toggle that preserves selection;
  - one focus restore path after close;
  - one preserved selected row across reopen when context has not changed;
  - one readable transition summary for reconfiguration.
- That keeps the board feeling like one recoverable tool instead of a new page
  every time the shell changes shape.

## Analysis thread — sectioning and history need compact-shell-safe structure

- Re-read the section/visibility and history recap contracts after the row and
  transition passes.
- The next proof slice should be one compact-shell-safe board layout that keeps:
  - one visible heading and short summary per section;
  - compact mode showing the current decision-relevant rows;
  - expanded mode revealing the fuller readable ledger;
  - a visible toggle that remains explicit and accessible.
- The matching history slice should keep:
  - a visible history section;
  - one recap count or summary line;
  - one preserved path to expand more history;
  - and one stable selection path back to active or available rows.
- That keeps the board readable and memory-rich without turning it into an
  archive or dashboard.

## Analysis thread — the top-level surface now needs a compact-shell-visible entry path

- Re-read the mission acceptance surface contract after the board-header,
  loading, row, transition, section, and history passes.
- The desktop board already proves the choice layer is real.
- The next proof slice should therefore be a compact-shell-visible entry path
  that preserves the same choice semantics:
  - discoverable from the ready shell;
  - focus-safe;
  - readable in the same terms as the desktop board;
  - and still not a second mission authority or progression ledger.
- That keeps the parent contract focused on exposure policy rather than on
  inventing a second board.

## Analysis thread — the first-playable queue now starts with quest semantics

- Re-read the first-playable slice and master tracker after the 2026-07-29
  realignment pass.
- The top of the execution queue is now the slice's first tranche:
  **Quest semantics**.
- The next proof slice should therefore be one versioned quest-proposition
  contract that gives `MissionProposition` an explicit shape for:
  - `class`;
  - `giver`;
  - `prerequisites`;
  - `outcomes`.
- That contract should keep one `main` quest active while allowing multiple
  `side`/`local` quests to coexist, and it should route `campaign.ts` through
  the mission lifecycle rather than preserving a parallel campaign engine.
- That keeps the first-playable work on the contract side of the line instead
  of inventing a second quest authority.

## Analysis thread — the tracker now narrows tranche 1 to a proposition contract

- Re-read the master execution tracker after the quest-semantics pass.
- The first tranche is now explicitly narrowed to a versioned proposition
  contract:
  - `MissionProposition.class`
  - `MissionProposition.giver`
  - `MissionProposition.prerequisites`
  - `MissionProposition.outcomes`
- The target behavior remains the same as the slice doc: one `main` quest may
  stay active while multiple `side` / `local` propositions coexist, and
  `campaign.ts` should route through the mission lifecycle instead of keeping a
  parallel campaign engine.
- Because `src/game/` still has parallel-owned uncommitted runtime work, the
  safe preparation boundary for this tranche remains documentation and
  non-`src/game/` scaffolding until the operator explicitly clears the
  collision.

## Analysis thread — tranche 2 is now the restoration loop

- Re-read the tracker after the tranche-1 quest-semantics note.
- The second tranche is the restoration loop: maintenance, workshop, and
  salvage as one recoverable player surface.
- The next proof slice should preserve the workshop overlay as the visible home
  for repair / restore actions, salvage as a bounded source of parts and
  provenance, and maintenance as a readable state change rather than a hidden
  stat bump.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.

## Analysis thread — tranche 3 is Water Before Night

- Re-read the first-playable slice and master tracker after the tranche-2
  restoration-loop note.
- The third tranche is Water Before Night: the pump circuit, the repair versus
  redirect branch, and the first-night consequence as one causal loop.
- The next proof slice should preserve the consequence chain through
  `surface-moisture.ts`, `soil-ecosystem.ts`, `river-hydrology.ts`, and
  `world-memory.ts` so the field changes because of the player’s choice.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.

## Analysis thread — tranche 4 is north field + night variants

- Re-read the first-playable slice and master tracker after the tranche-3
  Water Before Night note.
- The fourth tranche is north field + night variants: scanner/probe/topo
  wiring, hazard pressure, and the way the workshop choice changes the first
  night.
- The next proof slice should preserve the consequence chain through
  `seismic-probe.ts`, `radio-scanner.ts`, `topo-map.ts`, `landslide-hazard.ts`,
  `debris-physics.ts`, and `world-memory.ts` so the field changes because of
  the player’s choice.
- Because `src/game/` still has parallel-owned uncommitted runtime work, safe
  preparation for this tranche remains documentation and non-`src/game/`
  scaffolding until the operator explicitly clears the collision.

## Design thread — whole-game correction: spine, ADR-0040, and the integrated opening

- Operator feedback (two external reviews, 2026-07-29) confirmed the repo had
  confused game architecture with game design, and that the recorded vision
  was narrower than the pitched open vehicle-universe.
- Measured before designing (per project memory): `npm run audit:reachability`
  shows 25 unreachable modules / 1,836 lines; the last-60-commit histogram is
  41 docs / 13 chore / 4 feat / 2 test.
- Landed, all pending operator sign-off:
  - `docs/design/GAME_DESIGN_SPINE.md` — canonical whole-game design surface
    (vision, persistence ladder, systemic pillars, world-of-worlds topology,
    layered story + campaign-candidate registry, quest architecture over the
    existing mission lifecycle, exploration architecture, economy and four
    marketplace decisions, multiplayer posture, continuity models, studio
    operating model, open operator decisions).
  - `docs/decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md`
    — reclassifies ADR-0029 as Campaign One identity; execution packages must
    name the spine layer they serve.
  - `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` — integrated opening
    slice (main quest, Water Before Night, What the Old Tractor Kept, north
    field mystery, first customization choice, night consequence, ridge-top
    open-world promise) bound module-by-module to the runtime; wires 12–14 of
    the 25 unreachable modules; reachability gate ≤ 13.
  - Tracker: new top section reorders execution behind the slice's six
    tranches; header now names the spine as design source of truth (pending).
  - Exploration map: navigation links + dated addendum; decisions README
    indexes ADR-0040.
- Correction of a same-session agent error: this session initially claimed the
  name "Torque" was a reviewer hallucination after checking only the narrative
  doc. It is runtime canon — `RIG_PROFILES["utility-tractor"].fieldName` in
  `src/game/contracts.ts` — and visible in the live HUD. The lesson is the
  standing project memory applied to the agent itself: grep the source, not
  just the docs, before asserting absence.
- Operator sign-off (same day): **ADR-0040 accepted**, with the condition
  that existing work is updated in place, never deleted. Naming canon set:
  the stranger names the tractor Torque only after caring for it, once it
  runs and starts helping the old man; later arcs may offer selectable
  names. Spine §12 and the slice spec's naming beat record this.
- Remaining open operator decisions: compact-view contract-board exposure;
  commercial-store stance (both explained in spine §12.3–12.4).

## Realignment pass — First Playable slice supersedes overlay-only next slice (2026-07-29)

- Re-ran verification after recent commits: `npm run typecheck` passes;
  `npx vitest run --pool=forks --poolOptions.forks.singleFork` passes
  75 files / 471 tests. The `tinypool` parallel-runner instability remains
  the default; the forks workaround is the canonical verification command
  until that is fixed upstream.
- Re-read `docs/plans/MASTER_EXECUTION_TRACKER.md` and found the 2026-07-29
  vision-hierarchy correction: the project has pivoted to the integrated
  opening slice documented in `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`
  and `docs/design/GAME_DESIGN_SPINE.md`, gated on
  `docs/decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md`.
- The tracker explicitly states that existing technical lanes (Contract
  Ledger overlay, Garage/Fleet roster, Labs drawer) continue only where a
  slice tranche needs them. The top of the queue is now the slice's six
  tranches, beginning with **Quest semantics**.
- Spawned three parallel explore agents to analyze:
  1. the Quest semantics tranche requirements (`mission-lifecycle.ts`,
     `mission-propositions.ts`, `campaign.ts`);
  2. the UI shell surfaces needed for the full First Playable;
  3. the current `src/game/` parallel-ownership collision state.
- Key findings from the agents:
  - Quest semantics requires extending `MissionProposition` with `class`,
    `giver`, `prerequisites`, `outcomes`; relaxing exclusivity so one
    `main` quest is active but multiple `side`/`local` quests can coexist;
    and wiring `campaign.ts` through the mission lifecycle instead of
    keeping a parallel `CampaignContract` engine.
  - The UI shell already has the right foundation (overlay manager, map,
    pause, workshop, mission board, radial). The new surfaces needed are
    a dialogue/narration overlay, quest-class extensions to the contract
    board, a restoration mode in the workshop, and scanner/probe readouts.
  - `src/game/` currently has uncommitted parallel-owned runtime work
    (7 dirty files, +539/−35 lines, including renderer and rig-tool
    replay changes). `AGENTS.md` forbids editing `src/game/` without
    explicit operator clearance.
- Proposed next step: implement Tranche 1 — Quest semantics, but only
  after the operator clears the `src/game/` collision. Until then, safe
  preparation work is limited to documentation and non-`src/game/` shell
  scaffolding.

## Design thread — naming is player-authored; viewport priority resolved

- Operator clarified the naming canon further: "Torque" is one player's name
  for their rig, not fixed catalog canon. Rigs Unbound is an RPG whose
  characters are rigs; display names belong to the vehicle level of the
  persistence ladder, per save. The slice's naming beat is now a player
  text-input moment (suggested default: Torque), and `fieldName` moves from
  static `RIG_PROFILES` config into per-save vehicle state during the slice.
- Operator resolved spine decision 3: desktop and tablet sizes first;
  compact/mobile exposure (including the contract-board trigger) is deferred
  to its own later package with no parity promise yet.
- Operator questioned the "never sell power/progression" line; the spine now
  records its provenance (ADR-0029 exclusions, economy research's
  no-premium-currency stance, operator-endorsed review) and marks it as
  operator-amendable working law rather than immutable doctrine.
- Spine §1 now states the genre-breadth canon explicitly: open-world, RPG,
  shooter, racing, tower defense, construction, and sim conventions are all
  admissible over time, entering through the systemic pillars and the
  activity grammar.

## Design thread — genre framing corrected; monetization direction recorded

- Operator corrected the spine's "RPG whose characters are rigs" framing: the
  RPG comparison covers only the persistence/identity model. The game is not
  one genre; the same rig spans many gameplays over time (field work now,
  races, zombie night-defense, top-down modes, future designs), and different
  players' differently built rigs may unlock different quests and content.
  Spine §1 and §12.2 updated; rigs are also not limited to real-world
  machines.
- Operator set monetization direction, now recorded in spine §7
  "Monetization": fun playable game first; premium-first (Steam/itch) with
  the browser build as the free demo funnel; campaign expansions later;
  cosmetics optional; purchased soft currency rejected in its power-buying
  form (indirect progression sale); engineered scarcity to drive purchases
  rejected as a named dark-pattern trap; diegetic in-world ad placements
  recorded as a deferred candidate pending audience scale and legal review;
  anything legally grey (lootboxes, paid randomness) excluded entirely.
- Spine §12.4 closed as "direction set"; remaining specifics (pricing, first
  storefront, cosmetics at 1.0) are open but block nothing.

## Design thread — platform posture: web tech is the stack, browser is one channel

- Operator raised the "it's still a browser game, isn't it?" concern against
  the demo-funnel strategy. Recorded the platform posture in spine §7:
  browser carries the free opening slice; Steam carries the same codebase in
  a desktop shell (Tauri/Electron) with Steamworks integration (fullscreen,
  gamepad, achievements, cloud saves, offline); ADR-0001's headless kernel is
  the explicit ceiling hedge — if the product ever outgrows web tech, the
  shell is what gets replaced, not the game. Consoles remain a far-future
  port decision.
