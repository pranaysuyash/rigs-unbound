import { cpSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { sites } from "./src/hosting/sites-vite-plugin";

interface RuntimeAssetManifestEntry {
  id: string;
  runtimePath: string | null;
  publicRuntimeApproved: boolean;
  runtimePresentation?: {
    siteId: string;
    offsetX: number;
    offsetZ: number;
    yaw: number;
    targetMaxDimension: number;
    fallbackWidth: number;
    fallbackHeight: number;
    fallbackDepth: number;
    fallbackColor: number;
  };
}

interface RuntimeAssetManifest {
  assetRoot: string;
  entries: RuntimeAssetManifestEntry[];
}

const manifestPath = resolve("assets/asset-manifest.json");

function runtimeAssetManifest(): RuntimeAssetManifest {
  return JSON.parse(readFileSync(manifestPath, "utf8")) as RuntimeAssetManifest;
}

function isInside(root: string, candidate: string): boolean {
  const pathFromRoot = relative(root, candidate);
  return (
    pathFromRoot === "" ||
    (pathFromRoot !== ".." &&
      !pathFromRoot.startsWith(`..${sep}`) &&
      !pathFromRoot.startsWith(sep))
  );
}

function runtimeAssetsPlugin(manifest: RuntimeAssetManifest) {
  return {
    name: "rigs-unbound-runtime-assets",
    apply: "build" as const,
    closeBundle() {
      const assetRoot = resolve(manifest.assetRoot);
      const clientRoot = resolve("dist/client");
      const destinationRoot = resolve(clientRoot, manifest.assetRoot);

      // A second build into an existing output directory must not retain a
      // previously copied proof candidate after its approval is withdrawn.
      rmSync(destinationRoot, { recursive: true, force: true });

      for (const entry of manifest.entries) {
        if (!entry.publicRuntimeApproved || !entry.runtimePath) continue;
        const source = resolve(entry.runtimePath);
        if (!isInside(assetRoot, source)) {
          throw new Error(
            `Approved runtime asset ${entry.id} escapes ${manifest.assetRoot}.`,
          );
        }
        const destination = resolve(clientRoot, entry.runtimePath);
        if (!isInside(clientRoot, destination)) {
          throw new Error(
            `Approved runtime asset ${entry.id} escapes the client build.`,
          );
        }
        mkdirSync(dirname(destination), { recursive: true });
        cpSync(source, destination, { force: true });
      }
    },
  };
}

export default defineConfig(async ({ command }) => {
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const { cloudflare } = await import("@cloudflare/vite-plugin");
  const manifest = runtimeAssetManifest();
  const runtimeEntries =
    command === "serve"
      ? manifest.entries
      : manifest.entries.filter((entry) => entry.publicRuntimeApproved);

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
    define: {
      // Development intentionally sees proof candidates for acceptance work.
      // Player builds receive only the public-approved manifest projection, so
      // unapproved ids and paths are not compiled into the browser bundle.
      __RUNTIME_ASSET_ENTRIES__: JSON.stringify(runtimeEntries),
    },
    plugins: [
      wasm(),
      sites(),
      runtimeAssetsPlugin(manifest),
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
