import { defineConfig } from "vite";
import { sites } from "./src/hosting/sites-vite-plugin";

export default defineConfig(async () => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      port: 4174,
      strictPort: true,
    },
    preview: {
      host: "0.0.0.0",
      port: 4174,
      strictPort: true,
    },
    build: {
      target: "es2022",
      sourcemap: true,
    },
    plugins: [
      sites(),
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
