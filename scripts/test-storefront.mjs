import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
const origin = process.env.STOREFRONT_TEST_ORIGIN ?? "http://localhost:3000";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw new Error("This screenshot test is restricted to the local preview.");
await mkdir("artifacts/storefront", { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
try {
  for (const width of [375, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(origin, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}px`,
    );
    assert.equal(
      await page
        .locator("body")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      "rgb(255, 255, 255)",
    );
    for (const surface of await page
      .locator(
        ".store-header,.store-search,.category-card,.store-footer,.catalogue-empty",
      )
      .all()) {
      assert.equal(
        await surface.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
        "rgb(255, 255, 255)",
      );
    }
    const backgroundsLoaded = await page.evaluate(async () => {
      const urls = [
        ...new Set(
          [
            ...document.querySelectorAll(".photo-tile,.category-photography"),
          ].flatMap((element) => {
            const background = getComputedStyle(element).backgroundImage;
            return [...background.matchAll(/url\(["']?([^"')]+)/g)].map(
              (match) => match[1],
            );
          }),
        ),
      ];
      const loaded = await Promise.all(
        urls.map(
          (src) =>
            new Promise((resolve) => {
              const image = new Image();
              image.onload = () => resolve(true);
              image.onerror = () => resolve(false);
              image.src = src;
            }),
        ),
      );
      return urls.length >= 2 && loaded.every(Boolean);
    });
    assert.equal(
      backgroundsLoaded,
      true,
      "Campaign and category photographs load",
    );
    await page
      .getByRole("button", {
        name: "Show campaign 2: NEW ARRIVALS",
        exact: true,
      })
      .click();
    await expect(page.locator("h1")).toHaveText(/NEW\s*ARRIVALS/);
    await page
      .getByRole("button", {
        name: "Show campaign 1: STYLE ELEVATED",
        exact: true,
      })
      .click();
    await expect(page.locator("h1")).toHaveText(/STYLE\s*ELEVATED/);
    await page.screenshot({
      path: `artifacts/storefront/home-${width}.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `artifacts/storefront/preview-${width}.png`,
    });
    if (width < 768) {
      const menu = page.getByRole("button", {
        name: "Open navigation",
        exact: true,
      });
      await menu.click();
      await page
        .getByRole("navigation", { name: "Mobile navigation", exact: true })
        .waitFor({ state: "visible" });
      await page
        .getByRole("navigation", { name: "Mobile navigation", exact: true })
        .getByRole("link", { name: "Categories", exact: true })
        .focus();
      await page.keyboard.press("Escape");
      await page
        .getByRole("navigation", { name: "Mobile navigation", exact: true })
        .waitFor({ state: "detached" });
      assert.equal(
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(
        await page.locator(":focus").getAttribute("class"),
        "menu-toggle icon-control",
      );
    }
    const search = page.locator(
      width < 768 ? "#mobile-search" : "#header-search",
    );
    await search.fill("nonexistent-shirt-test");
    await Promise.all([
      page.waitForURL(
        (url) => url.searchParams.get("q") === "nonexistent-shirt-test",
      ),
      search.press("Enter"),
    ]);
    await page
      .getByRole("heading", { name: "Results for “nonexistent-shirt-test”" })
      .waitFor();
    await page
      .locator(".catalogue-tools select[name=category]")
      .selectOption("shirts");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await page.waitForURL(
      (url) => url.searchParams.get("category") === "shirts",
    );
    assert.equal(
      new URL(page.url()).searchParams.get("q"),
      "nonexistent-shirt-test",
    );
    assert.deepEqual(errors, [], `Browser exceptions at ${width}px`);
    console.log(
      `PASS ${width}px: white surfaces, no overflow, images, navigation, search and category filtering`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
