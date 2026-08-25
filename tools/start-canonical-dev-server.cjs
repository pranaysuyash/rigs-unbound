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
 * The health check verifies the responder is THIS project's Vite dev server,
 * not merely that something answers the port. A bare port-responds check once
 * let an unrelated `python -m http.server` (serving a different project's
 * directory) masquerade as the canonical server: the launcher reported
 * healthy, then every acceptance script failed at bootstrap because the
 * squatter cannot transform TypeScript modules. See
 * docs/WORKLOG_ADDENDUM_2026-08-25.md for the incident.
 *
 * Identity check: GET /src/main.ts must return JavaScript containing the
 * observability marker `render_game_to_text`. Only the real Vite server can
 * transform that module, and only this project contains the marker.
 *
 * If a non-canonical process owns the port, this script exits 1 and prints the
 * `lsof` evidence plus the exact kill command. It never kills unknown
 * processes itself — that stays a human/agent decision per AGENTS.md
 * ("diagnose and free it... do not paper over the conflict").
 *
 * It exits once the canonical server is healthy. To stop the server, kill the
 * printed PID.
 */

const { spawn, execFileSync } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const CANONICAL_PORT = 4173;
const CANONICAL_HOST = "127.0.0.1";
const START_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 250;
const PROBE_PATH = "/src/main.ts";
const PROBE_MARKER = "render_game_to_text";

function log(message) {
  // eslint-disable-next-line no-console
  console.log(`[canonical-dev-server] ${message}`);
}

/**
 * Fetch the probe path and report whether the responder is this project's
 * Vite dev server.
 *
 * @returns {Promise<{ok: boolean, detail: string}>}
 */
function probeCanonical(host, port) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        host,
        port,
        method: "GET",
        path: PROBE_PATH,
        timeout: 2_000,
      },
      (res) => {
        const status = res.statusCode;
        const contentType = String(res.headers["content-type"] || "");
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          // Cap the buffered body; the marker appears early in the module.
          if (body.length < 64 * 1024) body += chunk;
        });
        res.on("end", () => {
          if (status !== 200) {
            resolve({
              ok: false,
              detail: `${PROBE_PATH} -> HTTP ${status} (${contentType || "no content-type"})`,
            });
            return;
          }
          if (!contentType.includes("javascript")) {
            resolve({
              ok: false,
              detail: `${PROBE_PATH} -> HTTP 200 but content-type "${contentType}" is not a JavaScript transform`,
            });
            return;
          }
          if (!body.includes(PROBE_MARKER)) {
            resolve({
              ok: false,
              detail: `${PROBE_PATH} served JavaScript without the "${PROBE_MARKER}" marker — responder is a Vite server for a DIFFERENT project`,
            });
            return;
          }
          resolve({
            ok: true,
            detail: `${PROBE_PATH} -> canonical Vite transform`,
          });
        });
      },
    );
    req.on("error", (error) =>
      resolve({ ok: false, detail: `request error: ${error.message}` }),
    );
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, detail: "request timed out" });
    });
    req.end();
  });
}

async function waitForCanonical(host, port, deadline) {
  while (Date.now() < deadline) {
    const probe = await probeCanonical(host, port);
    if (probe.ok) {
      return probe;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return null;
}

/**
 * Best-effort port ownership report so the operator can see exactly which
 * process is squatting the canonical port.
 */
function reportPortOwners() {
  try {
    const out = execFileSync("lsof", [
      "-nP",
      `-i:${CANONICAL_PORT}`,
    ]).toString();
    const lines = out.trim().split("\n");
    for (const line of lines) {
      log(`port owner: ${line}`);
    }
  } catch {
    log(
      `port ownership unknown (lsof reported nothing listening on ${CANONICAL_PORT})`,
    );
  }
}

function reportSquatter(detail) {
  log("");
  log(`NOT the canonical dev server: ${detail}`);
  log("");
  log(
    `A process is answering http://${CANONICAL_HOST}:${CANONICAL_PORT} but it is not`,
  );
  log(
    "this project's Vite dev server. Per AGENTS.md: diagnose and free the port;",
  );
  log(
    "do not start another port and do not run acceptance against this responder.",
  );
  log("");
  reportPortOwners();
  log("");
  log(
    "If the listed PID is a disposable static server from another project, free it:",
  );
  log(
    `  kill <PID>   # then re-run: node tools/start-canonical-dev-server.cjs`,
  );
}

async function main() {
  const initial = await probeCanonical(CANONICAL_HOST, CANONICAL_PORT);

  if (initial.ok) {
    log(
      `already healthy on http://${CANONICAL_HOST}:${CANONICAL_PORT} (${initial.detail})`,
    );
    return;
  }

  // Distinguish "nothing there" (start one) from "wrong responder there"
  // (refuse loudly). A connection error means nothing is listening.
  const nothingListening = initial.detail.startsWith("request error");
  if (!nothingListening) {
    reportSquatter(initial.detail);
    process.exitCode = 1;
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
  const ready = await waitForCanonical(
    CANONICAL_HOST,
    CANONICAL_PORT,
    deadline,
  );

  if (!ready) {
    log(`canonical server did not become healthy within ${START_TIMEOUT_MS}ms`);
    reportPortOwners();
    process.exitCode = 1;
    return;
  }

  log(`ready on http://${CANONICAL_HOST}:${CANONICAL_PORT} (${ready.detail})`);
  log(`server PID: ${proc.pid}`);
}

main().catch((error) => {
  log(`error: ${error.message}`);
  process.exitCode = 1;
});
