import { cpSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { sites } from "./src/hosting/sites-vite-plugin";

function runtimeAssetsPlugin() {
  return {
    name: "rigs-unbound-runtime-assets",
    apply: "build" as const,
    closeBundle() {
      const source = resolve("assets/runtime");
      const destination = resolve("dist/client/assets/runtime");
      mkdirSync(destination, { recursive: true });
      cpSync(source, destination, { recursive: true, force: true });
    },
  };
}

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
      strictPort: true,
    },
    build: {
      target: "es2022",
      sourcemap: true,
    },
    environments: {
      client: {
        build: {
          rollupOptions: {
            input: {
              field: "index.html",
              physicsLab: "physics-lab.html",
              box3dLab: "box3d-lab.html",
            },
          },
        },
      },
    },
    plugins: [
      wasm(),
      sites(),
      runtimeAssetsPlugin(),
      cloudflare({
        viteEnvironment: { name: "server" },
        config: {
          name: "rigs-unbound",
          main: "./worker/index.ts",
          compatibility_date: "2026-07-25",
          assets: {
            binding: "ASSETS",
            not_found_handling: "single-page-application",
          },
        },
      }),
    ],
  };
});
