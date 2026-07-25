# Blockout evaluation preview

This is an intake-only browser surface for the generated `blockout` factory. It
is deliberately separate from the Rigs Unbound renderer and production entrypoint.

Run it from the repository root:

```bash
npx vite docs/research/assets/tractor-isolated-intake-2026-07-25/preview --host 127.0.0.1 --port 4175
```

Open `http://127.0.0.1:4175/preview/`. The page uses the plain renderer required for evaluation (no bloom or depth of
field), the generated neutral look-dev lights, and the factory's deterministic
front-three-quarter framing helper. Browser capture should save evidence beside
this intake directory and record the exact URL, viewport, and console state.
