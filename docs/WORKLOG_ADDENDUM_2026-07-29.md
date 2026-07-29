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

- Re-read the mission acceptance surface contract and the shell contracts together.
- The board is already real on desktop, while the compact/mobile shell still hides the trigger cluster and shows only passive status hints.
- The next useful decision is therefore about exposure policy: keep the board desktop-first, or add a smaller compact entry path that preserves the same choice semantics.
- That keeps the board as a choice layer rather than letting it drift toward a second authority or another status-only panel.

Anything else? Yes: the board question has shifted from “does it exist?” to “how should compact/mobile expose it?”


## Analysis thread — the collision matrix now needs a trigger/sensor pair, not another blocker

- Re-read the 3d-games lens against the dynamic-world collision exploration and category/mask contract.
- The collision system already proves the important first-playable blocker behavior. The next durable proof is a non-blocking pair: one trigger and one sensor.
- That keeps the matrix from becoming abstraction theatre: the contract only matters if it can distinguish block, fire, observe, and ignore in real gameplay roles.
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
