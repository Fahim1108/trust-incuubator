import assert from "node:assert/strict";
import { mkdir, rename } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
await mkdir("artifacts/loader", { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      recordVideo:
        width === 390 && process.env.LOADER_RECORD_VIDEO === "1"
          ? { dir: "artifacts/loader", size: { width: 390, height: 900 } }
          : undefined,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:3001/loader-preview", {
      waitUntil: "networkidle",
    });
    let release;
    await page.route("**/brand/logo-loader-original.png", async (route) => {
      if (route.request().resourceType() !== "fetch") return route.continue();
      await new Promise((resolve) => {
        release = resolve;
      });
      await route.continue();
    });
    await page
      .getByRole("button", { name: "Load brand asset", exact: true })
      .click();
    const overlay = page.locator("[data-aa-loader=overlay]");
    await expect(overlay).toBeVisible();
    const ring = overlay.locator("[data-loader-ring]");
    const badge = overlay.locator("[data-loader-badge]");
    const size = await ring.boundingBox();
    const b = await badge.boundingBox();
    assert.equal(
      await ring.evaluate((element) =>
        parseFloat(getComputedStyle(element).width),
      ),
      width < 768 ? 140 : 185,
    );
    assert.equal(b.width, width < 768 ? 110 : 150);
    assert.ok(Math.abs(size.x + size.width / 2 - width / 2) < 1);
    assert.ok(Math.abs(size.y + size.height / 2 - 450) < 1);
    assert.equal(
      await overlay.evaluate((e) => getComputedStyle(e).backgroundColor),
      "rgb(255, 255, 255)",
    );
    assert.equal(
      await badge.evaluate((e) => getComputedStyle(e).backgroundColor),
      "rgb(107, 2, 2)",
    );
    assert.equal(
      await ring.locator("circle").getAttribute("stroke"),
      "#6B0202",
    );
    assert.equal(
      await ring.locator("circle").getAttribute("stroke-width"),
      "4",
    );
    const timing = await ring.evaluate((e) => {
      const c = getComputedStyle(e);
      return [
        c.animationDuration,
        c.animationTimingFunction,
        c.animationIterationCount,
        c.transform,
      ];
    });
    assert.deepEqual(timing.slice(0, 3), ["1.6s", "linear", "infinite"]);
    const logo = overlay.locator("[data-loader-logo]");
    const first = await logo.boundingBox();
    await page.screenshot({ path: `artifacts/loader/loader-${width}.png` });
    await page.waitForTimeout(1750);
    assert.deepEqual(await logo.boundingBox(), first, "Logo never moves");
    assert.equal(
      await logo.evaluate((e) => getComputedStyle(e).transform),
      "none",
    );
    assert.notEqual(
      await ring.evaluate((e) => getComputedStyle(e).transform),
      timing[3],
    );
    await page.keyboard.press("Tab");
    assert.equal(
      await overlay.evaluate((e) => e === document.activeElement),
      true,
    );
    assert.equal(
      await page
        .getByRole("button", {
          name: "Load brand asset",
          exact: true,
          includeHidden: true,
        })
        .evaluate((e) => !!e.closest("[inert]")),
      true,
    );
    assert.ok(release, "Real fetch is pending");
    release();
    await expect(overlay).toHaveCount(0);
    await expect(page.locator("[data-loader-result]")).toContainText(
      "Brand asset loaded",
    );
    await expect(page.locator("[data-aa-loader-exit]")).toHaveCount(0);
    assert.equal(
      await page
        .getByRole("button", { name: "Load brand asset", exact: true })
        .evaluate((e) => !!e.closest("[inert]")),
      false,
    );
    await page.unroute("**/brand/logo-loader-original.png");
    await page.route("**/brand/logo-loader-original.png", (route) =>
      route.request().resourceType() === "fetch"
        ? route.abort()
        : route.continue(),
    );
    await page
      .getByRole("button", { name: "Load brand asset", exact: true })
      .click();
    await expect(page.locator("[data-loader-result]")).toContainText(
      "request failed",
    );
    await expect(overlay).toHaveCount(0);
    assert.deepEqual(errors, []);
    const video = page.video();
    await context.close();
    if (video)
      await rename(
        await video.path(),
        "artifacts/loader/loading-animation.webm",
      );
    console.log(
      `PASS ${width}px: reference dimensions, white/maroon, stationary logo, rotating ring, real pending fetch, focus isolation, success/error cleanup`,
    );
  }
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto("http://localhost:3001/loader-preview", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await reduced
      .locator("[data-loader-ring]")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  console.log("PASS reduced motion: no ring animation");
} finally {
  await browser.close();
}
