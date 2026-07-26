const {
  chromium,
} = require("/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright");
const fs = require("fs");
const OUT = "artifacts/playtest-casual/";
let n = 10;

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  page.on("pageerror", (e) =>
    console.log("[pageerror]", String(e).slice(0, 300)),
  );
  const shot = async (label) => {
    const f = `${OUT}${String(n++).padStart(2, "0")}-${label}.png`;
    await page.screenshot({ path: f });
    console.log("shot:", f);
  };

  await page.goto("http://127.0.0.1:4174/", {
    waitUntil: "load",
    timeout: 30000,
  });
  await page.waitForTimeout(4000);

  // Read the modal fully first
  await shot("modal-full");

  // Click ENTER THE FIELD
  await page.mouse.click(462, 447);
  await page.waitForTimeout(1500);
  await shot("entered-field");

  // just sit and look around 3s
  await page.waitForTimeout(3000);
  await shot("idle");

  // drive forward with W for 3 seconds
  await page.keyboard.down("w");
  await page.waitForTimeout(1500);
  await shot("driving-w-1");
  await page.waitForTimeout(1500);
  await shot("driving-w-2");
  await page.keyboard.up("w");
  await shot("stopped-after-w");

  // steer left while driving
  await page.keyboard.down("w");
  await page.keyboard.down("a");
  await page.waitForTimeout(1500);
  await shot("turning-left");
  await page.keyboard.up("a");
  await page.waitForTimeout(1000);
  await page.keyboard.up("w");
  await shot("after-turn");

  // reverse
  await page.keyboard.down("s");
  await page.waitForTimeout(2000);
  await shot("reversing");
  await page.keyboard.up("s");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
