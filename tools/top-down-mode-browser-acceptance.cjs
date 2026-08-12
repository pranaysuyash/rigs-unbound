const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function runAcceptanceTest() {
  console.log("[top-down-acceptance] Starting browser visual acceptance check...");
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  try {
    await page.goto("http://127.0.0.1:4173/?acceptance=field-02", {
      waitUntil: "networkidle",
    });

    // Give page focus via trusted click
    await page.click("body");

    // Select top-down camera view via window contract
    await page.evaluate(() => {
      if (typeof window.selectCamera === "function") {
        window.selectCamera("top-down");
      }
    });

    // Wait for camera transition settling
    await page.waitForTimeout(1000);

    // Test control paradigm switching on window object
    const paradigmResult = await page.evaluate(() => {
      const results = {};
      if (typeof window.setControlParadigm === "function") {
        results.setArcade = window.setControlParadigm("screen-relative");
        results.getArcade = window.getControlParadigm();
        results.setTwinStick = window.setControlParadigm("twin-stick");
        results.getTwinStick = window.getControlParadigm();
        results.setHeading = window.setControlParadigm("heading-relative");
        results.getHeading = window.getControlParadigm();
      }
      return results;
    });

    console.log("[top-down-acceptance] Control paradigm window readback:", paradigmResult);

    // Ensure artifacts dir exists
    const artifactsDir = path.join(__dirname, "..", "artifacts");
    if (!fs.existsSync(artifactsDir)) {
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    // Capture Desktop Top-Down Screenshot
    const desktopScreenshotPath = path.join(artifactsDir, "top-down-acceptance-desktop.png");
    await page.screenshot({ path: desktopScreenshotPath });
    console.log(`[top-down-acceptance] Saved desktop screenshot to: ${desktopScreenshotPath}`);

    // Switch to Narrow Viewport (390 x 844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    const narrowScreenshotPath = path.join(artifactsDir, "top-down-acceptance-narrow.png");
    await page.screenshot({ path: narrowScreenshotPath });
    console.log(`[top-down-acceptance] Saved narrow screenshot to: ${narrowScreenshotPath}`);

    // Check performance snapshot
    const perfSnapshot = await page.evaluate(() => {
      return typeof window.getPerformanceSnapshot === "function"
        ? window.getPerformanceSnapshot()
        : null;
    });

    console.log("[top-down-acceptance] Performance snapshot:", perfSnapshot);

    if (consoleErrors.length > 0) {
      console.error("[top-down-acceptance] Console errors detected:", consoleErrors);
      process.exitCode = 1;
    } else {
      console.log("[top-down-acceptance] VISUAL ACCEPTANCE PASSED: 0 console errors, screenshots captured.");
    }
  } catch (error) {
    console.error("[top-down-acceptance] Acceptance test failed:", error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runAcceptanceTest();
