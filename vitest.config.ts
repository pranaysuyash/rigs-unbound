import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";
import assetManifest from "./assets/asset-manifest.json";

export default defineConfig({
  plugins: [wasm()],
  define: {
    // Tests exercise the intentional developer/acceptance inventory. Production
    // filtering is asserted against the real build output by the asset gate.
    __RUNTIME_ASSET_ENTRIES__: JSON.stringify(assetManifest.entries),
  },
  test: {
    // Terrain sampling, Rapier initialization, and Box3D/WASM compilation are
    // individually fast but contend heavily when Vitest starts every simulation
    // file at once. File-serial execution preserves the five-second per-test
    // signal instead of masking host contention with larger timeouts.
    fileParallelism: false,
    environment: "happy-dom",
    // `tools/` is included so that a TypeScript authoring tool's logic is unit
    // tested by `npm run test` without having to live under `src/`, where the
    // reachability audit would rightly count it as gameplay the player cannot
    // reach. The split is by extension and is unambiguous: tool tests written
    // against `node:test` are `.test.mjs` and cannot match this glob, so nothing
    // is collected by two runners.
    include: [
      "src/**/*.test.ts",
      "tools/**/*.test.ts",
      "assets/workbench/**/*.test.ts",
    ],

    server: {
      deps: {
        inline: ["@dimforge/rapier3d"],
      },
    },
  },
});
