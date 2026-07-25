import { defineConfig } from "vitest/config";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm()],
  test: {
    include: ["src/**/*.test.ts"],
    server: {
      deps: {
        inline: ["@dimforge/rapier3d"],
      },
    },
  },
});
