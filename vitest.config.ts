import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm()],
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
