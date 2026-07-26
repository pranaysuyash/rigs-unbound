const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  const toast = async (label) => {
    const txt = await page.evaluate(() => document.body.innerText);
    const lines = txt
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    console.log("[" + label + "]", lines.slice(-8).join(" | "));
  };

  // 1) workshop module with 0 salvage
  await page.keyboard.press("1");
  await page.waitForTimeout(600);
  await toast("press-1-module");
  await h.shot("module-attempt");
  // T repair with 0 salvage
  await page.keyboard.press("t");
  await page.waitForTimeout(600);
  await toast("press-t-repair");

  // 2) Spark jump at speed
  await page.keyboard.press("r");
  await page.waitForTimeout(1200);
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.down(" ");
  await page.waitForTimeout(300);
  await h.shot("spark-jump-air");
  await page.keyboard.up(" ");
  await page.waitForTimeout(600);
  await h.shot("spark-jump-land");
  await page.keyboard.up("w");
  await toast("spark-jump");

  // 3) B blade
  await page.keyboard.press("b");
  await page.waitForTimeout(600);
  await toast("press-b");
  await h.shot("b-blade");

  // 4) VIEW dropdown -> Survey
  await page.selectOption("select", { label: "Survey" }).catch(async () => {
    const opts = await page.evaluate(() =>
      [...document.querySelectorAll("select option")].map((o) => o.textContent),
    );
    console.log("view options:", opts);
  });
  await page.waitForTimeout(800);
  await h.shot("view-survey");
  await page.selectOption("select", { label: "Tactical" }).catch(() => {});
  await page.waitForTimeout(800);
  await h.shot("view-tactical");
  await page.selectOption("select", { label: "Chase" }).catch(() => {});

  // 5) Physics Lab
  await page.getByText("Physics Lab").click();
  await page.waitForTimeout(2500);
  await h.shot("physics-lab");
  console.log("url after Physics Lab:", page.url());

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
