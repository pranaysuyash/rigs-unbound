"use strict";

/**
 * A hard deadline for any script that drives a browser.
 *
 * Every automation script in `tools/` launches Playwright, and Playwright can
 * throw *after* a browser is launched but *before* the script's own `finally`
 * is reachable — for example at `newPage()` when the host is out of GPU
 * processes. When that happens the script never exits, the browser is never
 * closed, and the process sits there consuming a slot forever. This repository
 * has already lost a 14-hour trailer capture and an 18-hour playtest driver to
 * exactly that shape, so the deadline is not a nicety: an automation script
 * that cannot exit is worse than one that fails, because a failure is visible.
 *
 * The timer is `unref`'d, so arming it never keeps an otherwise-finished process
 * alive. It only fires when the script has genuinely overrun.
 *
 * Usage — call once at module load, before any browser work:
 *
 *     const { armWatchdog } = require("./browser-watchdog.cjs");
 *     armWatchdog({ minutes: 20, label: "trailer capture" });
 */

/**
 * @param {{ minutes?: number, label?: string }} [options]
 * @returns {NodeJS.Timeout}
 */
function armWatchdog(options = {}) {
  const minutes =
    Number.isFinite(options.minutes) && options.minutes > 0
      ? options.minutes
      : 20;
  const label = options.label ?? "browser script";
  const timer = setTimeout(
    () => {
      process.stderr.write(
        `\nwatchdog: ${label} exceeded ${minutes} min, forcing exit\n`,
      );
      // Non-zero: an overrun is a failure, and callers in CI must see it as one.
      process.exit(1);
    },
    minutes * 60 * 1000,
  );
  timer.unref();
  return timer;
}

module.exports = { armWatchdog };
