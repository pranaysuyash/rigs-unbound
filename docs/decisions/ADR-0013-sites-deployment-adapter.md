# ADR-0013: Sites deployment adapter

- Date: 2026-07-25
- Status: Accepted
- Owner / next reviewer: project owner

## Context

Rigs Unbound is a browser-first Vite game. OpenAI Sites deploys a validated,
immutable source commit as a Cloudflare Worker-compatible artifact. Replacing
the game with a framework starter would create a second application surface and
discard the current runtime architecture.

## Decision

Keep the existing Vite application and add one bounded deployment adapter:

- the Cloudflare Vite plugin builds the existing client assets;
- `worker/index.ts` provides the required Worker entrypoint and delegates to
  the canonical static asset binding;
- SPA fallback serves `index.html` for direct routes;
- `src/hosting/sites-vite-plugin.ts` places only the opaque Sites project binding in
  the build output;
- credentials and runtime values remain outside source control.

## Options considered

1. Replace the game with the Sites vinext starter.
   Rejected because it would be an architectural rewrite with no player value.
2. Deploy the existing static `dist/` without a Worker entrypoint.
   Rejected because it does not meet the Sites artifact contract.
3. Add the bounded adapter described above.
   Chosen because it preserves one game runtime and makes deployment explicit.

## Tradeoffs and risks

- The Cloudflare build plugin adds development dependencies and a packaging
  surface that must remain compatible with Vite.
- The game remains client-only; device-local progress is not account-backed.
- Production deployment is public and should not contain private paid source
  assets. Only app-owned build assets may be shipped.

## Validation and rollback

- Run typecheck, unit tests, formatting, production build, browser acceptance,
  and the Sites packaging validator.
- Confirm the deployment reaches a terminal successful state and load the
  production URL.
- Roll back by redeploying a prior saved Sites version or reverting this commit
  and publishing the replacement commit.

## Revisit when

- authenticated or server-authoritative state is introduced;
- multiplayer requires backend routes;
- the hosting artifact contract changes;
- the current static asset adapter no longer satisfies runtime requirements.
