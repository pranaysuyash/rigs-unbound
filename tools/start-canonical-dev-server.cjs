#!/usr/bin/env node
/**
 * Canonical dev-server launcher for local browser acceptance and playtests.
 *
 * The project Vite config pins the dev server to port 4173 with
 * `strictPort: true`. This script ensures exactly one such server is running,
 * so agents and acceptance tools do not accidentally connect to stale processes
 * on other ports.
 *
 * Usage:
 *   node tools/start-canonical-dev-server.cjs
 *
 * It exits once the server is responding on 127.0.0.1:4173. It does not keep
 * the foreground busy. To stop the server, kill the printed PID.
 */

const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const CANONICAL_PORT = 4173;
const CANONICAL_HOST = "127.0.0.1";
const START_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 250;

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[canonical-dev-server] ${message}`);
}

function isPortListening(host, port) {
  return new Promise((resolve) => {
    const req = http.request(
      { host, port, method: "HEAD", path: "/", timeout: 500 },
      () => resolve(true),
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function waitForServer(host, port, deadline) {
  while (Date.now() < deadline) {
    if (await isPortListening(host, port)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

async function main() {
  const alreadyListening = await isPortListening(
    CANONICAL_HOST,
    CANONICAL_PORT,
  );
  if (alreadyListening) {
    log(`already responding on http://${CANONICAL_HOST}:${CANONICAL_PORT}`);
    return;
  }

  log("starting npm run dev...");
  const proc = spawn("npm", ["run", "dev"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    detached: true,
  });

  // Detach so this launcher can exit without killing the server.
  proc.unref();

  const deadline = Date.now() + START_TIMEOUT_MS;
  const ready = await waitForServer(CANONICAL_HOST, CANONICAL_PORT, deadline);

  if (!ready) {
    log(`server did not become ready within ${START_TIMEOUT_MS}ms`);
    process.exitCode = 1;
    return;
  }

  log(`ready on http://${CANONICAL_HOST}:${CANONICAL_PORT}`);
  log(`server PID: ${proc.pid}`);
}

main().catch((error) => {
  log(`error: ${error.message}`);
  process.exitCode = 1;
});
