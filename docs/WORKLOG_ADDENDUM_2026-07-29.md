# Worklog Addendum — 2026-07-29

## Exploration thread — one-rig disablement must not become a soft-lock

- Captured the operator's question about starting with one rig and losing
  mobility in [Single-Rig Disablement and Recovery Exploration](exploration/SINGLE_RIG_DISABLEMENT_AND_RECOVERY_EXPLORATION_2026-07-29.md).
- Static inspection found that `src/game/state.ts` already has a condition-zero
  emergency path to Home Silo with a 25% limp-home patch, no salvage reward,
  cargo detachment, and recovery telemetry. That is implementation evidence,
  not yet an accepted product policy or full browser proof.
- External research compared Pacific Drive's single-car repair/garage loop,
  Jalopy's one-car maintenance identity, and SnowRunner's fleet-based towing
  and garage recovery. The synthesis is a proposed ladder: guaranteed but
  non-optimal emergency escape, with field repair, settlement help, loaners,
  and fleet towing as richer choices.
- Added proposed [ADR-0048](decisions/ADR-0048-single-rig-failure-recovery-and-continuity.md)
  and routed it through the decision register, exploration map, and execution
  tracker. No `src/game/` files were edited.

Anything else? Yes: this question also tests the open Act I sequencing choice
recorded as RU-0912. If one machine is the opening protagonist, recovery is a
core story contract rather than a later fleet convenience.

## Redirect — recovery must be expanded from the vision, not the current branch

- The operator corrected the first exploration directly:
  > “you still are stuck to what exists not expanding/researching/exploring, look at the vision, dont anchor to existing...i am thinking of teleport, otehr one as you mentioned- reserve 25% home limp, if other vehicles at home or later multiplayer-call for help or change/switch to character and that char gets to come and help, or if has ingame currency-buy mana kind of thing or call repair/mechnic or maybe if more advanced upgrades and skills unlocked then self repair”
- Re-read the canonical [Game Design Spine](design/GAME_DESIGN_SPINE.md) and
  long-term first-principles design. The vision explicitly supports fleet and
  vehicle continuity, temporary loaners, relationships, multiplayer, wealth,
  and failure-as-follow-up-story.
- Expanded the exploration and ADR from a single emergency-return proposal to
  a **recovery constellation**: home authority, character/vehicle switching,
  social help, earned rescue capacity, machine mastery, and physical
  stranded-rig consequence.
- New external precedent research covers Rockstar's mechanic/insurance/impound
  service calls, State of Decay 2's survivor switching and skills, Deep Rock
  Galactic's solo helper that is replaced by multiplayer, and No Man's Sky's
  infrastructure-gated vehicle summoning.

Anything else? Yes: the 25% Home Limp idea is retained as a candidate invariant,
but it is no longer treated as the creative center. The real decision is which
continuity paths the player earns, who can help, and how each path changes the
world/story.

## Redirect — recovery must be expanded into a player-continuity web

- The operator repeated that the work was still anchored to existing runtime
  behavior. The response was widened again from a recovery constellation to a
  full design-space artifact: [Recovery Web and Player Continuity Design Space](exploration/RECOVERY_WEB_AND_PLAYER_CONTINUITY_DESIGN_SPACE_2026-07-29.md).
- The artifact starts from the vision's persistence ladder rather than the
  current condition-zero branch. It explores what can move, who can act next,
  what can be spent, what remains in the world, and how the player can change
  bodies without losing the disabled rig's identity.
- It separates operator recall, rig recall, anchor jump, remote workshop
  projection, vehicle summon, character switching, reserve rigs, loaners,
  mechanics, rescue capacity, self-repair, async traces, live SOS, and
  persistent stranded-rig consequences.
- External research is recorded in the artifact using official or primary
  product sources where available: No Man's Sky vehicle summoning, Rockstar
  mechanic and recovery services, State of Decay 2 survivor switching, Deep
  Rock Galactic's bounded solo helper, Fortnite's physical reboot object, and
  Pacific Drive's car and garage relationship.
- No runtime files were changed for this ideation pass. The design remains
  proposed and requires operator selection of the first continuity slice.

## Implementation note — the mission board header now shows selection context

- Added a dedicated selection-context line under the board summary so the
  player can see which contract is currently previewed without opening the
  briefing.
- The board title still stays fixed; the new line carries the changing
  selection state, which keeps the header readable while the row selection
  drives the detail pane.
- This closes the live header gap observed in the browser probe and keeps the
  board's information hierarchy consistent across desktop and compact shells.
- `src/game/` was left untouched.

Anything else? Yes: this is a live UI change, not another policy note.

## Implementation note — removed stale workshop boot probes so the app starts again

- `src/main.ts` no longer requires the unused workshop restoration action
  nodes that were crashing boot before the browser proof.
- The live surface now starts cleanly again, which makes the mission-board
  evidence real instead of only theoretical.
- This was a runtime-surface fix needed to verify the header work, not a new
  workshop feature.
- `src/game/` was left untouched.

Anything else? Yes: the boot fix is preservation work, not new gameplay.

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

## Analysis thread — the browser daemon can re-anchor, but the DOM witness is still not dependable

- Re-checked the live daemon after the browser-daemon lens pass.
- The canonical developer route is reachable again and reports the expected
  `Rigs Unbound` title.
- The current `status` and `exec` probe path is still not a trustworthy DOM
  witness: the page-state fields came back empty before re-anchoring, and the
  direct execution probe returned `undefined`/timed out instead of a stable
  snapshot.
- That keeps the browser-delivery gap explicit in the docs: the route exists,
  but the player-facing fidelity witness still needs its own on-screen surface.
- `src/game/` was left untouched.

Anything else? Yes: this is a probe-path reliability note, not a runtime fix.

## Analysis thread — audio still needs a reload-safe preference trail behind the rescue cue

- Re-read the updated audio contract after the browser-daemon pass.
- The live surface still confirms the useful half of the audio trust feature:
  sound can toggle in-session from the visible pause/menu control.
- The missing half is still the same one the contract has been naming: a
  visible persisted preference trail that survives reload instead of resetting
  to session state.
- That keeps the next audio proof narrow and honest: the rescue-loop cue is
  still the target, but it now needs to sit on top of a reload-safe
  preference layer to be a durable affordance.
- `src/game/` was left untouched.

Anything else? Yes: the audio lane remains a documentation and contract
alignment pass, not a runtime change.

## Analysis thread — the browser witness must be perceivable and keyboard-reachable

- Re-read the accessibility/input contract alongside the browser-delivery
  witness note.
- The named fidelity witness cannot be treated as complete if it is only a
  visible badge. It also needs a focusable route and a keyboard path into the
  same state.
- The next proof slice therefore needs to announce mode, readiness, and the
  rescue cue through an accessible status surface or live region, not just as
  a visual treatment.
- That keeps the shell aligned across pointer, keyboard, and assistive-tech
  users.
- `src/game/` was left untouched.

Anything else? Yes: this is still contract alignment, not a runtime
implementation change.

## Analysis thread — compact mission-board view can reduce density, not choice

- Re-read the mission acceptance surface contract with the compact-view gap
  in mind.
- The next note is now explicit: compact presentation may reduce visible
  density, but it must not reduce the underlying choice set or the
  accept/dismiss semantics.
- The active row still needs a reachable focus path and a perceivable reason
  string, even when the board is collapsed or sectioned.
- That keeps compact mode as a presentation choice instead of a second,
  weaker mission surface.
- `src/game/` was left untouched.

Anything else? Yes: this is a board-shape contract note, not a UI rewrite.

## Analysis thread — compact sectioned board can shrink density without shrinking authority

- Re-read the section-and-visibility contract after the acceptance-surface
  compact-view note.
- The compact-shell boundary is now explicit: compact mode may collapse space,
  but it must not collapse the choice model, the active row, or the reason
  string.
- The same four sections still need to exist in both density modes, with one
  announced toggle state and one focus path that survives the switch.
- That keeps compact view as a layout decision instead of a different mission
  board.
- `src/game/` was left untouched.

Anything else? Yes: this is still documentation and analysis, not a runtime
change.

## Analysis thread — browser loading also has to respect tab visibility and first interaction

- Re-read the loading/profile contract through the `web-games` lens.
- The shell can be progress-led and truthful, but browser rules still matter:
  hidden tabs should pause or visibly suspend simulation work, and audio
  should wait for the first real user interaction instead of assuming autoplay.
- Progressive loading still wins on mobile and low-bandwidth surfaces; the
  loading story is not just a text narrative, it is also a browser-behavior
  contract.
- `src/game/` was left untouched.

Anything else? Yes: this is browser-policy analysis, not a runtime change.

## Analysis thread — the browser funnel also needs a bounded offline and installable shell story

- Re-read the browser-game lens against the resource-envelope note.
- The browser build is the free demo funnel, so the next contract boundary is
  PWA/offline: the shell may cache a small safe asset set, but offline state
  must never masquerade as authoritative simulation truth.
- The visible shell should be able to tell the player whether it is online,
  installable, cached, or degraded instead of leaving that status implicit.
- `src/game/` was left untouched.

Anything else? Yes: this is still browser-policy analysis, not a runtime
implementation change.

## Analysis thread — compact/mobile mission-board exposure needs an explicit product decision

- Re-read the mission acceptance surface through the game-design lens.
- The compact shell can’t stay in the vague middle: either it is intentionally
  board-free and desktop-first, or it exposes one small, discoverable entry
  path that reaches the same choice semantics as the desktop board.
- Hidden DOM affordances are not enough; the player-facing action path has to
  be obvious enough to count as a real affordance.
- `src/game/` was left untouched.

Anything else? Yes: this is a contract decision note, not a UI implementation.

## Analysis thread — the bootstrap narrative still needs an explicit profile choice moment

- Re-read the loading/profile contract after the browser-game and accessibility
  passes.
- The shell already explains measuring and readiness, but it still needs one
  explicit first-choice moment for the player profile itself.
- The next proof slice should answer, in order: what mode am I in, which
  profile is active or being measured, and do I need to choose or can I
  proceed?
- That keeps the loading narrative from collapsing into passive status text.
- `src/game/` was left untouched.

Anything else? Yes: this is a bootstrap-story note, not a runtime change.

## Analysis thread — first visit should surface a chooser or a reasoned default

- Re-read the loading/profile bootstrap contract one more time.
- The profile state needs one more explicit boundary: if the shell is not on a
  known profile, the player should see a visible chooser or a plain-language
  reason for the default that was applied.
- That makes the first visit actionable instead of leaving the profile implied
  by the status line.
- The shell can remain compact, but the player should not have to guess whether
  profile choice is settled, measured, or waiting for input.
- `src/game/` was left untouched.

Anything else? Yes: this is still a contract note, not a runtime change.

## Analysis thread — live DOM shows profile status but not a dedicated first-visit chooser

- A live DOM probe on the canonical developer surface now shows
  `#bootstrap-status`, `#profile-status`, and `#camera-select`.
- In that slice there is still no dedicated profile-chooser control, which
  means the shell can narrate profile state but not yet present the first-visit
  choice as its own affordance.
- The next proof slice should separate status, chooser, and default
  explanation instead of letting the status line stand in for first-time input.
- `src/game/` was left untouched.

Anything else? Yes: this is still browser-surface analysis, not a runtime
change.

## Analysis thread - compact shell already exposes a visible contract entry point

- A live compact-viewport probe at 390 x 844 shows the Contracts button visible and focusable, along with the board close and accept actions in the DOM.
- That means compact mode is not board-free; it already exposes the same choice surface through a smaller entry path.
- The next documentation step is preservation: keep the visible entry path, keep the choice semantics, and keep the focus path explicit.
- src/game/ was left untouched.

Anything else? Yes: this is still browser-surface analysis, not a runtime change.

## Analysis thread - clearing local browser state still does not surface a dedicated profile chooser

- A first-visit simulation cleared localStorage and sessionStorage before reloading the canonical developer surface.
- After reload, the shell still reported the same ready/profile status pair and the only obvious choice control in the sampled DOM remained `#camera-select`.
- That means the current browser surface can explain profile state, but it still does not expose a dedicated first-visit profile chooser even when remembered browser state is removed.
- The next proof slice should keep the distinction explicit: status line, visible chooser, and reasoned default are not the same thing.
- `src/game/` was left untouched.

Anything else? Yes: this is still browser-surface analysis, not a runtime change.

## Execution thread — tranche 1 (quest semantics) landed and browser-proven

- The mission system now has quest semantics inside the existing authority,
  not beside it: `MissionClass` (main/side/local/hidden/repeatable/emergent),
  `giverId`, and a `MissionPrerequisite` graph (mission-completed, discovery,
  capability, insight) on `MissionProposition`; derivation filters unmet
  prerequisites so the quest graph gates visibility.
- `campaign.ts` is wired and entry-reachable: a campaign generator derives
  main-class contracts from `CAMPAIGN_CONTRACTS` with deed-based chaining
  (Launch Ridge unlocks after the Sunken Flats relay deed). Stale data was
  corrected against the live world graph (`home-farm` → `home-silo`); the
  marsh contract is explicitly dormant until the `marsh-depot` site is
  authored, pinned by a derivation test.
- Save schema v10 → v11: `activeSideMissions` joins the persisted state (one
  main-class focus mission, up to `MAX_ACTIVE_SIDE_MISSIONS = 3` concurrent
  non-main missions); pre-v11 records migrate with an empty list and default
  class "local"/null giver on in-flight missions. Completion/failure search
  both slots; binding-driven hooks in `state.ts` use `activeMissionMatching`.
- The mission-board accept button now mirrors the authority rules instead of
  disabling on any active mission (side quests stay acceptable alongside the
  main quest).
- Evidence: `npx tsc --noEmit` PASS; `npx vitest run` 479 tests / 75 files
  PASS; `npm run audit:reachability` 25 → 24 unreachable with budget green;
  new reusable probe `tools/campaign-contract-browser-acceptance.cjs`
  (`npm run test:campaign-browser`) PASS: board lists the relay contract as
  an acceptable main-class quest, the chained contract stays hidden, and
  acceptance persists through the public text contract with zero app console
  errors. Documented in `tools/README.md`.
- Environment note: a full disk (Chrome code_sign_clone cache, 122GB)
  interrupted the wrap-up; operator is handling cleanup. All evidence above
  re-verified after the interruption where affected (typecheck).

## Analysis thread - acceptance-route probe is currently blocked by browser IPC storage exhaustion

- I attempted a route comparison for `?acceptance=field-02` after the compact-shell probe.
- The browser daemon is still running, but `browser-client.js status` now fails with `ENOSPC: no space left on device` when trying to write `.browser-command`.
- Because of that local storage pressure, the acceptance-route comparison is inconclusive right now: I cannot claim the chooser is present or absent on that route from this run.
- The current product-level gap stays the same, but the evidence lane is temporarily blocked by the environment, not by the app contract itself.
- `src/game/` was left untouched.

Anything else? Yes: this is an environment blocker note, not a product conclusion.

## Analysis thread - the camera selector is not the profile chooser

- The live DOM gives us one useful clarification: `#camera-select` is a real
  choice control, but it should not be treated as the first-visit profile
  chooser.
- The bootstrap story still needs a profile-specific default or chooser
  explanation even if the shell already exposes camera mode selection.
- That keeps the browser narrative from collapsing distinct decisions into one
  control.
- `src/game/` was left untouched.

Anything else? Yes: this is a contract clarification, not a runtime change.

## Analysis thread - runtime quality profile is not the same as player profile setup

- The shell's is a runtime quality indicator, not a player-setup or identity profile chooser.
- Keeping those meanings separate explains why the chooser gap can remain real even when the browser already shows a visible profile line.
- That distinction should prevent future notes from collapsing renderer quality and player setup into one control.
- was left untouched.

Anything else? Yes: this is a terminology clarification, not a runtime change.

## Analysis thread - runtime quality profile is not the same as player profile setup

- The shell status line `#profile-status` is a runtime quality indicator, not a player-setup or identity profile chooser.
- Keeping those meanings separate explains why the chooser gap can remain real even when the browser already shows a visible profile line.
- That distinction should prevent future notes from collapsing renderer quality and player setup into one control.
- src/game/ was left untouched.

Anything else? Yes: this is a terminology clarification, not a runtime change.

## Analysis thread - the board header is not desktop-only after the compact probe

- A compact-viewport probe at `390 x 844` already showed the `Contracts`
  button visible and focusable, so the header/summary contract should no
  longer describe the board as desktop-only.
- The durable rule is now preservation: compact mode still needs a visible
  entry point, readable header text, and the same close/back path.
- This corrects an older assumption in the header contract without changing
  the actual board behavior.
- `src/game/` was left untouched.

Anything else? Yes: this is a contract correction, not a runtime change.

## Analysis thread - section headings should be navigable landmarks for screen readers

- The section/visibility contract already depends on visible headings and short
  summaries, so the next accessibility rule is to make those headings useful to
  assistive tech as well.
- Treating the four section headings as navigable landmarks or equivalent
  semantic anchors keeps screen-reader users from having to guess where the
  active, available, deferred, or history rows begin.
- That preserves the compact/expanded board as a multi-modal choice surface
  instead of a visual-only layout.
- `src/game/` was left untouched.

Anything else? Yes: this is an accessibility clarification, not a runtime change.

## Analysis thread - compact versus expanded state should remember the session preference

- The board already offers a compact/expanded density choice, so the most useful policy is to remember that choice for the current session instead of making the user rediscover it each time.
- That keeps the board stable and respectful of presentation preference without turning layout into a separate save or profile authority.
- The remembered state should remain presentation-only: it can restore the last chosen density, but it should not change which rows exist or what the player can choose.
- src/game/ was left untouched.

Anything else? Yes: this is a layout preference decision, not a runtime change.

## Analysis thread - history should collapse into a recap once it starts competing with the current choice

- The best history threshold is not a fixed archive count by itself. The trigger should be when history starts crowding out the active and available rows on the board.
- In practice, that means older history should collapse into a recap once it exceeds the compact board budget for the current viewport or once it would push decision-relevant rows below the visible decision area.
- The recap should keep a count and a path to detail, while notable milestone rows can remain expanded when they still teach the current decision.
- src/game/ was left untouched.

Anything else? Yes: this is a board-density decision, not a runtime change.

## Analysis thread - filtered-out rows should be summarized in a counter, not hidden entirely

- The board should keep filtered-out rows visible as a short summary count rather than removing them from the players awareness.
- That keeps the board honest about the existence of additional rows while preserving a compact choice surface.
- The counter should make the filter state clear and still leave a path to reveal the suppressed rows when the player asks for them.
- src/game/ was left untouched.

Anything else? Yes: this is a density-policy clarification, not a runtime change.

## Analysis thread - the selected row should remain the choice surface, with detail kept secondary

- The acceptance surface should keep the selected row itself as the primary choice surface.
- Any deeper detail pane should stay secondary to the row, not replace the row as the place where the player makes the decision.
- That keeps the contract aligned with the existing row model: selection, reason, accept, and back all stay on the row path the player can reach directly.
- src/game/ was left untouched.

Anything else? Yes: this is a choice-surface clarification, not a runtime change.

## Analysis thread - notable milestones should stay expanded by default

- Milestones are the history items most likely to teach the current decision, so they should remain expanded unless the user explicitly collapses them.
- That keeps the recap count focused on older or less decision-relevant history while preserving the few events that still matter at a glance.
- The rule is presentation-only: milestone expansion should not change the underlying history data, only how much of it is shown by default.
- src/game/ was left untouched.

Anything else? Yes: this is a history-display policy clarification, not a runtime change.

## Analysis thread - filtering should not erase the history recap

- When the player filters the board, the filtered-out rows should stay
  summarized as a counter and the history recap should remain its own summary.
- That lets the board show both kinds of compactness at once: filter summary
  for nonmatching rows, history recap for older rows that still exist.
- The two summaries should stay distinct so the player can tell whether the
  board is hiding rows because of a filter or compressing history because the
  section is crowded.
- src/game/ was left untouched.

Anything else? Yes: this is a board-density clarification, not a runtime
change.

## Analysis thread - history entries should be grouped primarily by contract

- History should be grouped first by contract, with outcome type as the useful
  secondary label inside that grouping.
- That keeps the recap tied to the choice context that created it instead of
  drifting into session bookkeeping.
- Session-level grouping can still exist as a fallback for long-running play,
  but it should not be the primary shape of the history section.
- src/game/ was left untouched.

Anything else? Yes: this is a history grouping policy clarification, not a
runtime change.

## Analysis thread - the recap count should stay in the history section, not the board header

- The board header already has its own title and summary responsibilities, so the recap count should remain inside the history section where it belongs.
- That keeps the header small and the history recap local to the memory it is summarizing.
- The board can still show a short section-level history summary, but the dedicated recap count should not become another header-level counter.
- src/game/ was left untouched.

Anything else? Yes: this is a history-layout clarification, not a runtime change.

## Tranche 1 — Quest semantics implemented (2026-07-29)

- Implemented the first tranche of the First Playable — The Road That Was slice.
- Fixed `src/game/mission-lifecycle.ts` `acceptMission` so the focus slot is
  reserved for `main`-class missions; non-main missions always enter the side
  slot and respect `MAX_ACTIVE_SIDE_MISSIONS`.
- Updated `src/game/state.ts` `publicState()` to expose `mission` with
  `missionClass`/`giverId` and a new `activeSideMissions` array.
- Enhanced `src/main.ts` contract board: missions are grouped by class, each
  row shows giver and active state, and the accept button explains why it is
  disabled (focus slot full, side limit, etc.). Added matching CSS in
  `src/styles.css`.
- Removed the parallel `CampaignContract` engine from `src/game/campaign.ts`
  (`deriveCampaignContracts`, `activeContractCount`); campaign content now
  flows exclusively through `mission-propositions.ts` → `mission-lifecycle.ts`.
- Rewrote `src/game/campaign.test.ts` to verify campaign missions surface in
  `deriveMissions`, stay locked until prerequisites are met, and unlock after
  the root relay contract completes.
- Added tests in `src/game/mission-lifecycle.test.ts` for standalone side
  mission acceptance.
- Added tests in `src/game/state.test.ts` for the public mission surface.
- Verification: `npm run typecheck` passes; `npx vitest run --pool=forks
--poolOptions.forks.singleFork` passes 76 files / 487 tests.
- Note: outcomes (world-memory deltas, favor, relationship deltas) are still
  deferred until Tranche 2/3 consumers exist; the prerequisite graph already
  handles campaign unlocking.

## Analysis thread - deferred propositions should stay visible in the same list

- Deferred propositions should remain visible in the same list as available ones, with a clear reason string, rather than moving to a separate unavailable section.
- That keeps the player's choice surface in one place and makes the why not yet answer easy to find.
- The row can be deferred, but it should still be part of the same board context so the player does not have to hunt for it in a second location.
- src/game/ was left untouched.

Anything else? Yes: this is a board-structure clarification, not a runtime change.

## Analysis thread - the empty state should distinguish no active rows from nothing yet discovered

- The empty state should use different copy for "no active rows" versus "nothing yet discovered" because those are different player situations with different next-step guidance.
- That keeps the board honest without adding a new system: the player should know whether the board is empty because nothing is available right now or because discovery has not yet unlocked anything to show.
- The visual shell can stay the same, but the explanation should match the cause of the empty state.
- src/game/ was left untouched.

Anything else? Yes: this is an empty-state copy policy, not a runtime change.

## Analysis thread - the board summary count should reflect visible rows

- The header summary count should describe the rows currently visible in the board, not the hidden or filtered rows that are summarized elsewhere.
- That keeps the header honest about what the player can inspect right now and avoids double-counting rows that are already represented by filter or recap counters.
- If the board needs to explain hidden rows, that explanation belongs in the relevant section or filter summary, not in the header count itself.
- src/game/ was left untouched.

Anything else? Yes: this is a header-count clarification, not a runtime change.

## Analysis thread - loading should say loading on initial entry and refreshing on in-place updates

- Use "Loading contracts" for the initial load and "Refreshing board" for an in-place refresh.
- During refresh, keep the last known row list visible until the update completes so the board does not flicker into an empty state.
- If the board is rebuilt synchronously, do not show a loading state at all; move straight to the ready board.
- src/game/ was left untouched.

Anything else? Yes: this is a loading-behavior clarification, not a runtime change.

## Analysis thread - the broader discovery hint should stay on the shell, not inside the empty board

- Keep the concise empty-board message in the board itself, and keep the broader discovery hint on the shell or other outer guidance surface.
- That keeps the empty board focused on explaining its immediate absence and recovery path instead of becoming a second tutorial panel.
- The board can still point the player back to play, but the more general discovery guidance should live outside the empty surface.
- src/game/ was left untouched.

Anything else? Yes: this is an empty-state guidance clarification, not a runtime change.

## Analysis thread - loading should preserve the last row list until refresh completes

- During refresh, keep the last known row list visible until the update completes so the board does not flicker into an empty state.
- That preserves context while the board is waiting and keeps loading distinct from empty state.
- The loading message can say the board is refreshing, but the rows should still anchor the user until the new data arrives.
- src/game/ was left untouched.

Anything else? Yes: this is a loading-refresh policy clarification, not a runtime change.

## Analysis thread - refresh should stay text-based rather than animated

- Refresh should remain text-based rather than animated so the board stays calm, readable, and easy to understand while it updates.
- If any motion exists elsewhere in the shell, it should belong to explicit content or transition rules, not to the loading state itself.
- That keeps the loading/refresh experience honest: the board says what it is doing instead of trying to perform a separate animation language.
- src/game/ was left untouched.

Anything else? Yes: this is a loading-animation clarification, not a runtime change.

## Analysis thread - synchronous board rebuilds should skip loading entirely

- If the board is rebuilt synchronously, do not show a loading state at all; move straight to the ready board.
- That keeps loading reserved for cases where the player truly has to wait and prevents a zero-duration rebuild from becoming meaningless status noise.
- The board should still preserve its title, close/back path, and ready copy, but it should not pretend to load when it is already ready.
- src/game/ was left untouched.

Anything else? Yes: this is a loading-behavior clarification, not a runtime change.

## Analysis thread - the empty state should adapt its copy to the selected mode

- The empty state should change its copy when the selected mode changes what the player needs to understand, while keeping the same visual panel.
- That lets the board explain the right reason or next step without inventing a different empty-state system for each mode.
- The panel stays the same; the words adapt to the mode.
- src/game/ was left untouched.

Anything else? Yes: this is a mode-sensitive copy clarification, not a runtime change.

## Analysis thread - the board title should remain constant across contexts

- The board title should stay constant so the header remains an anchor while mode, summary, and rows do the contextual work.
- That keeps the board easy to recognize when the player opens it from different states without adding another changing label to the header.
- The title can still be paired with a mode indicator or summary line, but the title itself should not become a context-sensitive status string.
- src/game/ was left untouched.

Anything else? Yes: this is a header-title clarification, not a runtime change.

## Analysis thread - the live board header currently has no dedicated mode-indicator node

- A live DOM probe of the open `Contracts` board showed the header is just the `Field contracts` index, the `Choose what pulls you next` title, and the `Close` button.
- There is no separate mode-indicator element in that header structure, so the text-only-versus-icon question is not answered by the live markup yet.
- If a mode indicator is introduced, the next proof slice should make it text-first and explicit before any icon treatment is considered.
- src/game/ was left untouched.

Anything else? Yes: the live board header is currently a title block plus close button, not a completed mode-indicator surface.

## Analysis thread - the broader shell search also found no compact/expanded mode cue in sampled DOM

- A page-wide DOM search for `compact`, `expanded`, and `mode` returned no matching text, ids, classes, or aria labels in the sampled shell.
- That means the live surface is not currently reusing an existing shell cue for the mode indicator question.
- The question therefore remains an open affordance decision, not a label that already exists elsewhere in the shell.
- src/game/ was left untouched.

Anything else? Yes: the sampled shell does not currently expose a separate mode cue to borrow.

## Implementation note - compact shell now keeps the contracts trigger reachable

- The small-screen masthead rule no longer hides the entire button cluster.
- `#mission-board-button` stays visible on compact/coarse layouts, while the less essential masthead actions remain trimmed so the header stays readable.
- That turns the contract-board exposure question from a desktop-only path into a compact-shell entry point without adding a separate page or a forced auto-open.
- src/game/ was left untouched.

Anything else? Yes: this is a real shell exposure change, not another policy note.

## Implementation thread - new Machine Awakening foundation: Floodgate 12

- Added `src/game/machine-awakening.ts`, a new deterministic local-machine
  interaction system rather than a variation of the existing cargo, survey, or
  rescue loops.
- Floodgate 12 now has an explicit `discover -> diagnose -> stabilize ->
restore` grammar. Its success emits a route-opening event for the Sunken
  Flats spillway; it requires survey, tow, and a bounded salvage commitment.
- Added focused proof coverage in `src/game/machine-awakening.test.ts` for the
  complete transition, range/capability gates, out-of-order rejection, and
  non-spending failure behavior.
- Recorded the design, ownership boundary, evidence level, and required
  runtime/save/presentation admission work in
  `docs/research/MACHINE_AWAKENING_FLOODGATE_12_VERTICAL_SLICE_2026-07-29.md`.

Anything else? Yes: this is a real new game-system foundation, but it is not
yet connected to the parallel-owned global state or renderer. It must not be
presented as a playable world change until that integration proof lands.

## Addendum - Floodgate 12 now joins the primary-action and save contract

- The Floodgate 12 system is now state-owned under schema v13, carries a
  migration/default path for earlier records, and is exposed through the
  public browser snapshot as an explicit route consequence.
- At Sunken Flats, the normal `Act` control now progresses the machine through
  inspect, diagnose, stabilize, and restore. The shell prompt names that local
  work rather than sending the player to a new menu or overlay.
- Added a state integration proof covering canonical action sequencing,
  salvage spend, save recovery, and public-state visibility.

Anything else? Yes: the authored 3D gate/water state and its traversal impact
remain open. The simulation knows a route has opened; the world still needs to
show and physically honour it before the encounter is fully player-complete.

## Asset production thread - first persistent infrastructure environment concept

- Generated `assets/generated/marsh-depot-floodgate-environment-concept-2026-07-29.png` through the bundled imagegen CLI with `gpt-image-1.5`, at 1536 × 1024 PNG and high quality.
- The original-resolution review found a readable repaired tractor, stilted Marsh Depot, workers, cargo movement, ferry route, and Floodgate 12 landmark in one Patchwork Atlas scene.
- The artifact is registered in `assets/asset-manifest.json` and `docs/research/ASSET_PROVENANCE_REGISTER.md`, with the exact prompt in the adjacent `.prompt.md` sidecar.
- It remains concept/reference-only, public-ineligible, and not a runtime layout or mesh authority. `src/game/` was not touched.
- Asset checks passed: `npm run assets:preflight` (15 entries, 0 errors) and `npm run test:assets` (9 passed).

Anything else? Yes: the next image pass should test a same-camera Floodgate 12
before/after state so the visual consequence can be compared against runtime
state instead of being inferred from a single hero scene.

## Asset production thread - object-first catalog and utility tow reference

- Added the living object-first catalog at `docs/exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md`, with separate lanes for rigs, rig parts, props, vegetation, roads/infrastructure, sprites/clouds, environment materials, and scene kits.
- Generated and visually inspected `assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.png` as a neutral isolated input for the existing `utility_tow_recovery_01` intake path.
- Added the exact prompt sidecar, manifest entry, provenance record, and repo-owned reconstruction workbench README under `assets/workbench/utility-tow-recovery-01/`.
- Read the local `img2threejs` skill contract. The reconstruction path is staged and quality-gated; it is not a one-shot image-to-mesh shortcut, and it does not authorize runtime integration.
- `src/game/` remains untouched because it is parallel-owned.

Anything else? Yes: the next execution step is to run the image probe, admission, pre-spec, and strict-quality gates in the workbench, then let the delegated audit identify the exact non-runtime reconstruction seam.

## Asset production thread - first bounded rig-part reference

- Generated and visually inspected `assets/generated/field-plough-01-object-reference-2026-07-29.png` as the first bounded reconstruction input.
- The image is a conditional single-view reference for a field-plough attachment. It visibly contains a repeated share system, attachment frame, hydraulic ram, hinge hardware, worn metal, rust, and soil residue; the visible share count conflicts with the prompt and is recorded as an input uncertainty.
- Added prompt sidecar, manifest entry, provenance record, and workbench README under `assets/workbench/field-plough-01/`.
- The delegated audit found the existing `field-plough` attachment and `ploughPivot` renderer seam, and confirmed that img2threejs currently yields procedural TypeScript/JSON rather than a GLB.

Anything else? Yes: this package is now ready for the intake/spec stage, not runtime integration.

## Asset production thread - field-plough intake gate

- Delegated the local `img2threejs` staged intake for the field-plough reference into `assets/workbench/field-plough-01/`.
- Probe and reference admission passed; the pre-spec classified the candidate as a complex articulated hard-surface rig part.
- Detail inventory was authored with 12 mapped observed details, and painted-steel PBR extraction passed at confidence `0.86` against the `0.70` threshold.
- Normal spec validation passed with warnings, but strict-quality remains blocked with 12 errors because the embedded sculpt spec is still shallow and does not yet carry the enriched hierarchy/material/lighting/repetition/detail/viewpoint contract.
- No factory, GLB, runtime promotion, manifest change, or `src/game/` change was made by the reconstruction worker.

Anything else? Yes: the correct next task is spec enrichment and strict revalidation; the gate is doing its job by preventing a generic plough placeholder from becoming a claimed asset.

## Asset architecture thread - canonical semantic definition

- Added `assets/asset-spec.schema.json` and `assets/specs/field-plough-01.asset.json` as the first canonical asset-definition layer.
- The definition now owns reusable asset semantics: identity and uncertainty, provisional dimensions, component hierarchy, sockets/pivots, action states, material layers, collision authority, LOD, runtime adapter, compiler stages, provenance, and gate evidence.
- Extended the manifest schema and asset preflight so a manifest entry can link to and structurally check its canonical spec; added a regression test and `assets:spec-preflight` alias.
- Recorded the architecture in ADR-0047 and linked it through the decision register.
- Kept `img2threejs` outputs explicitly derived; no factory, GLB, runtime integration, or public approval was created.

Anything else? Yes: this is the long-term compiler architecture the earlier proof-of-concept was missing.

## Asset compiler thread - canonical definition to blockout factory

- The delegated derivation attempt was quota-blocked, so the work was completed locally through the reusable `tools/derive-img2threejs-spec.mjs` compiler.
- The canonical field-plough definition now deterministically populates the tool-specific `ObjectSculptSpec` with components, mapped detail inventory, repetition systems, PBR references, lighting, feature targets, action readiness, and four review viewpoints.
- Normal and strict img2threejs validation both pass with zero errors and zero warnings.
- Generated the current unlocked blockout factory at `assets/workbench/field-plough-01/generated/createFieldPloughModel.ts`; isolated TypeScript compilation passes.
- No GLB, runtime integration, collision authority change, browser acceptance, or public approval was performed.

Anything else? Yes: the production pipeline now has a real compiler boundary, and the next evidence is visual review rather than another spec-filling loop.

## Asset compiler thread - reproducibility and repository health closure

- Added `assets:derive-field-plough` as the reproducible package command for
  rebuilding the tool-specific derived spec from the canonical definition.
- Added an asset regression asserting that the derived spec and generated
  blockout factory remain present, linked to `field-plough-01`, and retain the
  four review viewpoints and two repetition systems.
- Final asset evidence is green: `npm run assets:preflight`, `npm run
test:assets` (11/11), normal and strict img2threejs validation (0 errors,
  0 warnings), isolated factory TypeScript compilation, JSON parsing, and
  `git diff --check`.
- Repository-wide `npm run typecheck` passed; the current full Vitest run also
  passed (`80` files, `497` tests). No `src/game/` file was changed by this
  asset lane; unrelated parallel runtime edits remain preserved.

Anything else? Yes: the production boundary is now explicit. The next work is
visual/multi-angle review and packaging, not claiming this blockout as a GLB
or runtime asset.

## Open-world settlement contribution history

- Added a bounded, recoverable community-contribution record to settlement
  state. It records capability-specific help and time without setting a place
  to complete or granting a route unlock.
- Added response definitions that separate affected services. At Long Furrow,
  a physical plough cut can relieve field capacity while a tow action can move
  soaked stores, leaving other pressures in force.
- Routed voluntary context responses through the existing primary command/event
  boundary. No mission is accepted and no secondary settlement command system
  was introduced.
- Added ADR-0049. The remaining migration of legacy mission-linked settlement
  outcomes is named rather than hidden.
- Verified the contribution, contact, recovery, and shared command surfaces with
  `npm run typecheck` and `npx vitest run`: `84` test files and `506` tests
  passed after the resident/service-specific correction.
- Added contributed-response props to the authored settlement scene groups.
  These reveal only from saved contribution history: raised stores, shifted yard
  loads, route markers, ferry caches, ford lines, and signal arrays. Long Furrow
  drainage remains terrain work rather than a substitute mesh.
- Runtime command evidence on canonical `http://127.0.0.1:4173` exercised the
  existing tow-capable buggy at Long Furrow. `Move soaked stores` raised favor
  to `1`, opened Stores exchange, retained Field exchange as sheltering, kept
  the plough response available, accepted no mission, and emitted no app console
  errors. Renderer load is observed; a human visual frame of the contributed
  prop remains an explicit review gap.
- Added a derived after-dark settlement rhythm. The ordinary crew rests and
  otherwise healthy services are off shift, but existing pressure still takes
  priority and no machine action, contact, route, mission, or side mission is
  gated by the clock.
- Canonical browser evidence advanced the same Long Furrow state to night
  (`worldMinuteOfDay: 1366.6`): Stores exchange was `off-shift`, field work
  stayed `sheltering` because saturation remained, a seed keeper was `resting`,
  and both `mission` and `activeSideMissions` were empty. The browser console
  remained clean.

Anything else? Yes: this establishes causal authority without prescribing a
player path. The next work needs visible response props, local dialogue, and
browser evidence for partial and delayed consequences.

## Asset compiler thread - open-world candidate policy correction

- Browser-rendered the field-plough factory from the named review viewpoints
  and created a reference/render comparison sheet. The first render exposed a
  real compiler defect: attachment metadata replaced authored geometry with
  endpoint markers, and hierarchy transforms double-counted positions.
- Corrected the reusable derivation compiler so authored geometry renders as an
  assembled procedural candidate. The current comparison is lower-fidelity than
  the reference but structurally inspectable and useful for open-world review.
- Corrected the canonical lifecycle from an implicit promotion block to
  `procedural-candidate; refinement-open`. Visual refinement, optional GLB
  delivery, runtime adapter integration, collision implementation, and public
  rights review are separately tracked evidence work, not restrictions on
  development availability.
- No `src/game/` files were edited; parallel runtime work remains preserved.

## Asset compiler thread - verification disposition

Pass 1, correctness: the canonical spec, manifest, evidence roadmap, strict
derived spec, prepared factory, browser review harness, and comparison sheet
were rebuilt and checked. Asset preflight passed with 17 entries and no
findings; asset tests passed 11/11; strict img2threejs validation passed with
zero errors and warnings; isolated factory and review TypeScript compilation
passed; browser capture completed with no console errors.

Pass 2, architecture: the candidate lifecycle is now data-driven and additive.
Development availability is separate from visual refinement, optional GLB
delivery, runtime adapter integration, simulation-owned collision, and public
rights approval. The derived factory keeps semantic attachment contracts while
using authored component geometry for review. No duplicate asset definition or
second collision authority was introduced.

Pass 3, compliance: `npm run typecheck` passed. The full Vitest run completed
with 504 passing tests and 2 failures in parallel-owned runtime behavior:
`src/game/state.test.ts` expects a plough diagnostic, and
`src/game/command-event-lane-proof.test.ts` expects the post-delivery action
chain. Those files were not edited in this asset lane and are preserved for
their owner; the failures remain explicitly unresolved rather than hidden.

## Addendum (2026-07-29) -- spatial settlement affordance correction

Settlement help no longer resolves merely because a compatible rig is anywhere
inside a settlement service radius. Each contribution now requires proximity to
the material condition it can affect, such as Long Furrow's drainage edge or
raised stores ground. The result remains a voluntary, partial world consequence
with no mission, unlock, deadline, or fixed response order.

## Asset compiler thread - rejected preview and authored field-plough rebuild

- Rejected the prior comparison as visually invalid. The generic generated
  output had one slab-like body, an arch-like frame, floating primitives, no
  credible repeated share system, and UI chrome inside the evidence image.
- Added the reference-specific authored procedural factory at
  `assets/workbench/field-plough-01/authored/createFieldPloughModel.ts`.
- Rebuilt the visible engineering hierarchy as a crossbeam, rear stiffener,
  triangulated top-link frame, lower clevises, central hydraulic assembly, and
  four named share units with shanks, moldboards, cutting points, clamps, pins,
  bolts, soil patches, and named sockets.
- Replaced the non-tileable photo-cutout material shortcut with localized
  vertex wear plus separate rust, soil, and exposed-steel geometry.
- Updated the browser capture to save raw WebGL canvas frames and generated the
  controlled latest comparison at
  `review/comparison-front-three-quarter-authored-v14.png`.
- Recorded the independent audit in `review/visual-parity-review.json`:
  development blockout `6/10`, reference-faithful production use `3.5/10`,
  photoreal use `2/10`. The blockout is accepted for development, while hero
  and promotional use remain rejected until the named geometry and material
  refinements close.
- Preserved the generic factory as compiler evidence, changed the canonical
  visual path to the authored factory, and added an asset regression covering
  four shares, hitch socket, hydraulic hierarchy, collision ownership, and the
  review decision.
- No `src/game/` files were edited.

## Asset compiler thread - authored rebuild verification

- Pass 1, immediate correctness: controlled comparison confirms the replacement
  is a four-share field plough rather than the rejected slab and arch assembly.
  `npm run assets:preflight` passed with 17 entries and zero findings,
  `npm run test:assets` passed 12/12, isolated authored-factory and review-harness
  TypeScript compilation passed, and `git diff --check` passed.
- Pass 2, architecture and long-term viability: the canonical asset definition
  points to the authored visual factory, the generic img2threejs result remains
  retained as non-authoritative compiler evidence, the visual review is
  machine-readable, and collision remains simulation-owned. The repeatable
  capture command is `npm run assets:review-field-plough`.
- Pass 3, rule compliance and supervision readiness: the canonical browser
  harness on port 4173 captured five raw-canvas views with zero console errors.
  Repository typecheck passed and the full Vitest suite passed 85 files and 515
  tests. Development-blockout acceptance and photoreal rejection are stated
  separately, with the exact refinement backlog and no hidden production claim.

## Asset compiler thread - img2threejs skill compliance correction

- Loaded and followed
  `/Users/pranay/Projects/external-skills/img2threejs__img2threejs/SKILL.md`
  after acknowledging that using isolated stage scripts was not equivalent to
  the requested skill workflow.
- Ran locked-pass status and check. The blockout failed because no passing Tier
  1 result or `continue` review exists.
- Ran Tier 1 diagnostics, Divine Eye, multi-angle degeneration checks, bounded
  correction decisions, per-layer scoring, per-feature scoring, review append,
  and pipeline synchronization.
- Recorded the first correction as `refine-spec`. Strengthened the canonical
  share definitions and derivation with handed helicoidal section profiles,
  integrated cutting-share constraints, four-instance staggering, camera
  alignment targets, and review-history preservation.
- Re-derived and strict-validated the sculpt spec with zero errors and warnings,
  regenerated the currently unlocked blockout factory, prepared its visual
  attachment handling, and compiled it in isolation.
- Rebuilt the authored implementation from the refined spec. Tier 1 scale delta
  improved from `0.2954` to a passing `0.0611`, aspect-ratio delta improved from
  `0.1679` to `0.1001`, and silhouette IoU improved from `0.4085` to `0.4700`.
  The latter two still fail.
- Divine Eye improved from `0.630` to `0.714` and returns `probe` with
  reconstruction mode suspected. Multi-angle validation remains
  non-degenerate.
- Recorded the post-spec action as `refine-code`. The pipeline remains locked at
  blockout with no completed passes. Development placeholder availability is
  separate from img2threejs pass acceptance.
- Verified that `npm run assets:build-field-plough` preserves both skill review
  entries instead of erasing them. Asset preflight passes with 17 entries and
  zero findings, asset tests pass 12/12, repository typecheck passes, the full
  Vitest suite passes 86 files and 522 tests, and `git diff --check` passes.

## Open-world causeway carrier correction

- Detected and corrected an invalid test/content assumption: a ground tractor
  placed in flooded Sunken Flats correctly disables before it can deliver the
  causeway crate. The old generic phrasing hid this physical contradiction.
- Preserved the real open-world solution already present in the canonical rig
  model: Marsh Skimmer combines `hover` and `tow`, and its hover physics applies
  towing cost without drowning in standing water.
- Updated causeway manifest feedback to share that knowledge after loading. It
  is not a vehicle gate, route lock, required order, or mission instruction.
- Replaced the impossible tractor delivery proof with a Marsh Skimmer
  fixed-step towing proof. Material fact, terrain passage, and route revision
  still derive through existing cargo and world authority.
- `npm run typecheck && npx vitest run` passed: 86 test files and 523 tests.
  Browser delivery evidence remains open on an isolated disposable save; the
  existing browser/player state is intentionally untouched.

## Living frontier correction: habitat belongs to terrain, not the player

- Corrected the initial habitat presentation seam after design review. The
  environmental projection was non-gating, but visible life was positioned in
  a ring around the active rig, making the world appear to spawn fauna for the
  player.
- `GameWorld` now exposes fixed terrain-cell habitat patches. The renderer
  streams nearby cells for visibility, while their identities, coordinates,
  environmental observations, and ambient placement remain world-owned.
- This changes neither collision, persistence, weather, field authority,
  player route choice, nor settlement progression. It adds no quest, reward,
  prompt, rig restriction, route permission, or ecology clock.
- Corrected the exploration record: current disturbance comes from existing
  field-condition memory. General vehicle-noise and wheelspin disturbance is a
  future simulation design, not an implemented claim.

## Field-plough production part package continuation

- Re-evaluated the prior self-imposed stop at procedural placeholder status. A
  customizable rig system needs a usable part contract even while reference
  fidelity remains under review.
- Added stable variant controls to the authored factory: 3-share or 4-share
  assemblies, normalized wear, and paint color. Added named replaceable share
  mount and cutting-edge sockets plus material-slot metadata.
- Added the repo-local part package contract at
  `assets/workbench/field-plough-01/package/field-plough-01.part-package.json`.
  It records coordinates, root, attachment sockets, replaceable subassemblies,
  materials, variant limits, LOD follow-up, and the separate visual admission
  status.
- Delegated and reviewed a bounded GLB export sidecar at
  `tools/export-field-plough-glb.cjs`. It exports through the canonical port
  `4173` review harness with Three `GLTFExporter`, is deterministic across
  repeated runs, and produced `assets/runtime/field-plough-01.glb` with 78
  nodes, 60 meshes, 22 materials, zero GLB preflight findings, and SHA-256
  `fa3681d96758b4808d84061858dd999b79dcc58307f574d2bf248896f356dc20`.
- Recorded the derivative as asset id `field-plough-01` without runtime-path
  admission. The package and GLB are ready for the parallel-owned runtime lane,
  while public approval, visual hero quality, and simulation collision
  authority remain explicitly separate and are not implied by the export.
- Updated asset tests to cover the part contract and GLB digest. `src/game/`
  remains untouched to preserve parallel runtime ownership.

## Persistent ecology world actors

- Reframed ecology from ambient, read-only habitat presentation into an
  independent world system. The initial implementation added durable regional
  groups for Long Furrow grazers, Sunken Flats waders, and Quarry Run
  scavengers under `GameWorld` spatial memory.
- Population, vitality, position, and territory now persist through the same
  snapshot, storage, replay, and recovery path as terrain and field memory.
  Actors advance from the shared world clock, not a task timer or separate
  ecology clock.
- Machine work and infrastructure affect regional suitability through existing
  field and moisture authority. Grazers also alter canonical vegetation, roots,
  and soil health, allowing ecology to change terrain resilience without a
  second ecology map.
- This is not a final product constraint: regional groups can later promote
  individual creatures when identity or physical interaction matters. Collision,
  care, extraction, threat, construction, and settlement systems remain open
  expansions rather than forbidden behaviors.
- ADR-0051 records the proposed boundary and explicit operator decisions still
  required. Source work is pending focused and full verification.

## Persistent ecology evidence and visual read

- Added `tools/open-world-ecology-browser-acceptance.cjs` and
  `npm run test:ecology-browser`. The reusable tool uses an isolated browser
  context, exposes the three persisted regional groups, positions a Skimmer
  beside the Long Furrow herd, asserts no mission or side mission, captures
  evidence, and leaves the interactive save alone.
- Browser acceptance passed with zero errors. A survey-camera frame was
  inspected and now shows the herd as a place-owned group, not a player-ring
  effect. The first visual pass revealed undersized static silhouettes, so the
  renderer mirror was corrected with readable group scale and local wandering
  around the authoritative actor location.
- `npm run typecheck` passed. Focused ecology and habitat tests passed 6/6.
  The full suite remains 524/525 due only to the parallel field-plough runtime
  asset expectation drift recorded separately.

## Machine presence now changes ecology without creating an objective

- Added a bounded, decaying, persistent ecology-disturbance field to
  `GameWorld`. Real rig speed and slip feed it through the fixed-step loop;
  nearby actor groups relocate immediately and later return through ordinary
  world-time behavior.
- Disturbance persists with world memory so a reload does not erase an actor
  relocation or contradict the land history that caused it. It is neither a
  mission timer nor a separate ecology clock.
- Focused typecheck and ecology coverage passed. Browser acceptance now drives
  the Skimmer through the Long Furrow herd using normal input and observed a
  `27.93m` herd relocation after `34.62m` of vehicle travel, with no mission,
  no side mission, full condition, and zero browser errors.

## Ecology as situated local knowledge

- Named residents now expose changing local ecology through the existing field
  note surface. The notes are observations, not mission text or directives.

- Added decaying, persistent disturbance memory to ecological actors. Residents
  can report a recent flight without creating a duty, score, or recovery loop.
- Focused typecheck, four ecology tests, and the canonical-port browser proof
  passed. Browser proof: 35.11m Skimmer travel, 27.93m herd displacement, no
  active mission, no side missions, no browser errors.

## Sunken Flats waterworks supersession

- Replaced the canonical singleton `floodgate-12` identity with persistent
  `sunken-flats-waterworks`, retaining explicit old-save recovery.
- Replaced the single gate renderer silhouette with a distributed waterworks
  assembly. This preserves spatial hydrology and optional service while removing
  the prior vertical-slice framing from the current world.

- Verified the Sunken Flats Waterworks supersession with typecheck, six focused
  infrastructure tests, and canonical-browser traversal. The new entity persists
  through reload while the player crosses 185.35m of water with no mission or
  side mission; the survey artifact shows the optional inspection affordance.

## Game visuals discovery and approval gate

- Applied the existing-project discovery prompt through Part 0 for the game
  visuals request.
- Captured the applicable instruction stack, canonical `motto_v4`, visual
  direction, renderer and asset ownership, current visual evidence, automated
  baseline, open gaps, risks, and a project-specific execution brief in
  `docs/reviews/GAME_VISUALS_DISCOVERY_AND_APPROVAL_PACKAGE_2026-07-29.md`.
- Static inspection and current repository captures support a Patchwork Atlas
  working baseline, but not final art approval. The recommended next proof is a
  Sunken Flats / Marsh Depot before-and-after visual consequence plus one
  source-to-runtime asset representation chain.
- No implementation files were changed in this discovery pass. Runtime visual
  edits remain pending operator approval and explicit clearance of the
  parallel-owned `src/game/` files.

### Anything else?

The approval package keeps visual quality tied to player inference, world
consequence, fallback readability, and provenance rather than treating more
decoration as the goal.
