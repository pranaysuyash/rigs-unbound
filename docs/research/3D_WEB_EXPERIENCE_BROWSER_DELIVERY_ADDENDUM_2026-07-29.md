# 3D Web Experience Browser-Delivery Addendum

- Date: 2026-07-29
- Status: researching
- Lens: `3d-web-experience`
- Scope: browser-delivery policy, mobile usability, reduced-motion behavior, loading/fallback readability, and the boundary between decorative 3D and gameplay-critical 3D

## Why this note exists

The `3d-web-experience` skill is the right next lens after the 3D-games pass
because the repo already proves it has real 3D structure. The remaining question
is not whether the app can render 3D at all. The question is how the browser
surface should explain fidelity, fallback, and accessibility to the player.

The current research trail already points at that gap:

- [3D Game Skill App Analysis and Current Surface Gaps](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_SKILL_APP_ANALYSIS_2026-07-28.md)
- [3D Web Experience Live Repo Analysis](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md)

This note does not claim a new runtime fix. It records the next browser-delivery
interpretation layer so future work does not have to rediscover the same split.

## What the current web-3D trail already implies

The existing browser-delivery analysis already shows that the app is not a toy
scene:

- runtime profile selection exists in the browser entrypoint;
- diagnostics and camera policy are visible in the shell;
- touch and narrow-layout support are already part of the browser surface;
- runtime bridge assets can fail safely instead of collapsing the scene;
- physics remains a separate evidence lane rather than being hidden inside the
  shell;
- the renderer already distinguishes presentation concerns from gameplay truth.

That is enough to say the repo is browser-first in architecture, not just in
branding.

## What the `3d-web-experience` skill adds

The skill's anti-patterns sharpen the remaining question:

- 3D should serve the experience, not exist for its own sake.
- Desktop-only 3D is a trap.
- Loading state is part of the product.
- A fallback path is part of trust, not an optional extra.

Against the current repo state, that means the missing work is mostly a named
browser-delivery contract, not another renderer rewrite.

## What still needs a named contract

The current trail still leaves these items too implicit:

- which 3D is full-fidelity, which 3D can degrade, and which 3D is purely
  decorative;
- what the browser should say when it is intentionally reduced for mobile,
  accessibility, or budget reasons;
- whether loading should be narrated as a ready state, a measured warmup, or a
  bounded progress state;
- how the player should understand that the physics lab and the public shell
  are separate evidence lanes;
- where the public browser surface explains that the current experience is safe
  enough to use but still not complete as a delivery contract.

That is the browser-delivery boundary this skill is asking us to name.

## Recommended next proof slice

The next durable slice should stay small and explicit:

1. write a browser-delivery policy that names full-fidelity, reduced, and
   fallback states;
2. make the loading story readable to the player as a browser affordance, not
   just a status note;
3. keep decorative 3D separate from gameplay-critical 3D in the docs trail;
4. confirm the mobile/narrow story is still intentional rather than accidental;
5. keep the policy aligned with accessibility rather than treating it as a
   postscript.

## Durable takeaway

The browser surface already behaves like a real 3D product. The next step is to
make the delivery policy explicit so the player, reviewer, and future agent can
tell what is essential, what can degrade, and what must stay trustworthy.

## Evidence tier

- Tier 1: static skill and repository-doc inspection in this pass
- Tier 4: prior browser observations are already recorded in the linked live
  repo analysis

## Addendum (2026-07-29) - the canonical surface reappears, but the exec witness still drops the DOM payload

A later probe re-anchored the daemon to the canonical developer route again:

- URL: `http://127.0.0.1:4173/?surface=developer`
- Title: `Rigs Unbound`
- Console log count: `45`

The direct `browser-client.js exec` check still did not return a usable DOM
payload for the sampled page-state object. The route itself is live, but the
probe path still cannot be treated as a stable browser-delivery witness for
rendered content. That keeps the same architectural implication in force:
we need an explicitly named fidelity witness, not just a reachable route.

This addendum does not change the earlier conclusion about full-fidelity,
reduced, and fallback states needing their own named contract.


## Addendum (2026-07-29) - live browser evidence confirms the developer surface, but not a trustworthy DOM probe path

- Re-checked the live browser daemon against the current app surface while using the `web-games` lens.
- The daemon status still reports the canonical dev surface at `http://127.0.0.1:4173/?surface=developer` with the `Rigs Unbound` title.
- The captured console slice is healthy enough for analysis: it is dominated by repeated Vite `connecting` / `connected` messages and does not show app errors in the observed window.
- The current daemon `exec` probe path is not trustworthy enough for browser-delivery claims in this session: after a successful navigation command, it still returned an `about:blank` evaluation result for DOM inspection.
- That means the browser-delivery contract should not depend on this probe path as its source of truth. The contract needs a named, reliable witness for rendered fidelity, reduced mode, and fallback state so the player and reviewer can tell what is actually on-screen.
- Evidence depth: Tier 4 for daemon status and console inspection, Tier 1 for the probe-path diagnosis.

## Addendum (2026-07-29) - the next browser-delivery proof is one named fidelity witness

- The current browser-delivery trail already distinguishes full-fidelity,
  reduced, and fallback states in principle.
- The next proof slice should be one explicit witness surface that names the
  current mode and loading state in the browser itself, instead of another route
  probe or console-only observation.
- That witness should make the browser story legible to the player and reviewer:
  what is intentionally degraded, what is still interactive, and what still
  needs time to become ready.
- Anything else? No. This contract stays useful only if it remains small and
  visible, because a browser-delivery promise that cannot be seen on-screen is
  not yet a delivery promise.

## Addendum (2026-07-29) - gameplay-critical 3D stays essential; decorative 3D can degrade

- The browser-delivery policy now needs one more explicit distinction:
  gameplay-critical 3D is part of the contract, while decorative 3D may
  degrade if the surface needs to protect accessibility, performance, or
  mobile stability.
- That distinction keeps the browser story honest. It prevents the shell from
  treating wonder as mandatory when the actual requirement is trust, clarity,
  and playability.
- The witness surface should therefore say not only what mode is active, but
  also whether the current 3D is essential to play or merely embellishment.
- Anything else? No. The policy remains useful only if the player can tell
  which parts of the 3D experience are load-bearing and which ones are
  allowed to soften.

## Addendum (2026-07-29) - the daemon can re-anchor, but the DOM witness is still not dependable

- In this session the browser daemon was successfully re-anchored to
  `http://127.0.0.1:4173/?surface=developer` and the page title reported
  `Rigs Unbound`.
- The `status` and `console` probes still did not produce a stable, structured
  DOM witness for the current page state: `status` returned empty page fields
  before re-anchoring, and `exec` still resolved to `undefined`/timeout rather
  than a trustworthy page snapshot.
- That means the browser-delivery contract still needs a named on-screen
  witness surface, not just a reachable route and a daemon that can be
  re-anchored on demand.
- Anything else? No. This is still the same contract gap: route reachability is
  not the same thing as a reliable browser-delivery witness.
