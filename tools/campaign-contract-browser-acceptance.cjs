/**
 * Campaign contract browser acceptance.
 *
 * Proves the tranche-1 quest-semantics wiring end to end in the live shell:
 * 1. Bootstrap and enter the world with zero console errors.
 * 2. Open the mission board and find the campaign root contract
 *    ("Sunken Flats Submerged Relay") derived from campaign.ts.
 * 3. Verify chained campaign contracts stay hidden before the relay deed.
 * 4. Select and accept the relay contract; verify it becomes the persisted
 *    active mission through the public text contract.
 *
 * Usage: node tools/campaign-contract-browser-acceptance.cjs
 * Requires the canonical dev server (tools/start-canonical-dev-server.cjs).
 */
const {
  chromium,
  assert,
  state,
  bootstrapAndEnter,
  teardown,
  collectConsole,
} = require("./acceptance-helpers.cjs");

const RELAY_TITLE = "Sunken Flats Submerged Relay";
const RELAY_ID = "contract-sunken-relay";
const CHAINED_TITLE = "Launch Ridge Beacon Delivery";

async function boardEntries(page) {
  return page.evaluate(() => {
    return [...document.querySelectorAll("#mission-board-list li button")].map(
      (button) => button.querySelector("strong")?.textContent ?? "",
    );
  });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = collectConsole(page);

  try {
    await bootstrapAndEnter(page);

    // The 3D canvas overlays the masthead for synthetic pointer events, so
    // drive the DOM controls directly like the other acceptance probes do.
    await page.evaluate(() =>
      document.querySelector("#mission-board-button").click(),
    );
    await page.waitForSelector("#mission-board-list li button", {
      timeout: 10_000,
    });

    const titles = await boardEntries(page);
    assert(
      titles.includes(RELAY_TITLE),
      `campaign root contract listed on the board (saw: ${titles.join(" | ")})`,
    );
    assert(
      !titles.includes(CHAINED_TITLE),
      "chained campaign contract stays hidden before the relay deed",
    );

    await page.evaluate((title) => {
      const button = [
        ...document.querySelectorAll("#mission-board-list li button"),
      ].find((b) => b.querySelector("strong")?.textContent === title);
      if (!button) throw new Error("relay contract button not found");
      button.click();
    }, RELAY_TITLE);

    await page.waitForSelector("#mission-briefing:not([hidden])", {
      timeout: 5_000,
    });
    const acceptDisabled = await page.evaluate(
      () => document.querySelector("#mission-briefing-accept").disabled,
    );
    assert(!acceptDisabled, "accept button enabled for the relay contract");

    await page.evaluate(() =>
      document.querySelector("#mission-briefing-accept").click(),
    );
    const s = await state(page);
    assert(
      s.mission?.id === RELAY_ID,
      `relay contract is the persisted active mission (saw: ${JSON.stringify(s.mission)})`,
    );

    // Headless-GPU driver performance warnings (ReadPixels stalls) are
    // environmental noise, not application errors.
    const appProblems = consoleErrors.filter(
      (entry) => !entry.includes("GL Driver Message"),
    );
    assert(
      appProblems.length === 0,
      `zero console errors (saw: ${appProblems.join(" | ")})`,
    );

    console.log("campaign-contract-browser-acceptance: PASS");
  } finally {
    await teardown(browser);
  }
}

main().catch((error) => {
  console.error("campaign-contract-browser-acceptance: FAIL");
  console.error(error);
  process.exitCode = 1;
});
