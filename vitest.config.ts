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
    include: ["src/**/*.test.ts"],

    server: {
      deps: {
        inline: ["@dimforge/rapier3d"],
      },
    },
  },
});
