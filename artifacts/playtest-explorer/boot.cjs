const {
  chromium,
} = require("/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--enable-webgl", "--use-angle=metal"],
  });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("CONSOLE: " + m.text());
  });
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "artifacts/playtest-explorer/01-boot.png" });
  const info = await page.evaluate(() => ({
    title: document.title,
    canvases: [...document.querySelectorAll("canvas")].map((c) => ({
      w: c.width,
      h: c.height,
    })),
    buttons: [...document.querySelectorAll("button, a, [role=button]")].map(
      (b) => b.textContent.trim().slice(0, 60),
    ),
    bodyText: document.body.innerText.slice(0, 1500),
    hasRgt: typeof window.render_game_to_text === "function",
  }));
  console.log(JSON.stringify(info, null, 2));
  console.log("ERRORS:", errors.slice(0, 10));
  await browser.close();
})();
