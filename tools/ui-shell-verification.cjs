const playwrightModule =
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("http://127.0.0.1:4173/?surface=developer");
  await page.waitForSelector("#game-canvas");
  await page.waitForTimeout(2000);

  // Enter the world
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  const domState = async () =>
    page.evaluate(() => ({
      pauseHidden: document
        .querySelector("#pause-overlay")
        .hasAttribute("hidden"),
      mapHidden: document.querySelector("#map-overlay").hasAttribute("hidden"),
      mapCanvasHidden: document
        .querySelector("#map-canvas")
        .hasAttribute("hidden"),
      rumorHostHidden: document
        .querySelector("#rumor-map-host")
        .hasAttribute("hidden"),
      navHidden: document
        .querySelector("#navigator-panel")
        .hasAttribute("hidden"),
      paused: JSON.parse(window.render_game_to_text()).paused,
      mapOpen: JSON.parse(window.render_game_to_text()).mapOpen,
    }));

  // Open pause menu
  await page.keyboard.press("p");
  await page.waitForTimeout(300);
  const state1 = await domState();

  // Close pause
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const state2 = await domState();

  // Open map
  await page.keyboard.press("m");
  await page.waitForTimeout(300);
  const state3 = await domState();

  // Switch to rumor layer
  await page.click("#map-layer-rumor");
  await page.waitForTimeout(300);
  const state4 = await domState();

  // Close map
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  const state5 = await domState();

  // Toggle navigator (default hidden)
  await page.keyboard.press("v");
  await page.waitForTimeout(300);
  const state6 = await domState();

  await page.keyboard.press("v");
  await page.waitForTimeout(300);
  const state7 = await domState();

  await browser.close();

  const result = {
    pauseOpened: !state1.pauseHidden && state1.paused,
    pauseClosed: state2.pauseHidden && !state2.paused,
    mapOpened:
      !state3.mapHidden &&
      state3.mapOpen &&
      !state3.mapCanvasHidden &&
      state3.rumorHostHidden,
    rumorLayerActive:
      !state4.mapHidden && state4.mapCanvasHidden && !state4.rumorHostHidden,
    mapClosed: state5.mapHidden && !state5.mapOpen,
    navDefaultHidden: state3.navHidden,
    navToggledVisible: !state6.navHidden,
    navToggledHidden: state7.navHidden,
    consoleErrors: errors,
  };
  console.log(JSON.stringify(result, null, 2));

  const ok = Object.values(result).every((v) =>
    Array.isArray(v) ? v.length === 0 : v === true,
  );
  process.exit(ok ? 0 : 1);
})();
