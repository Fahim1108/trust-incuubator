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
        ".store-header,.store-search,.category-card,.store-footer,.catalogue-empty,.featured-empty",
      )
      .all()) {
      assert.equal(
        await surface.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
        "rgb(255, 255, 255)",
      );
    }
    await expect(
      page.getByRole("heading", { name: "Featured Products", exact: true }),
    ).toBeVisible();
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
    const headerLogo = page.locator(".store-header .brand-logo-image");
    await expect(headerLogo).toHaveAttribute("src", "/images/BRAND-LOGO.jpg");
    await expect(page.locator(".official-cover")).toBeVisible();
    assert.equal(
      await page
        .locator(".official-cover")
        .evaluate(
          (image) =>
            image.complete &&
            image.naturalWidth > 0 &&
            getComputedStyle(image).objectFit === "contain",
        ),
      true,
      "Original cover loads without cropping",
    );
    const logoGeometry = await headerLogo.evaluate((image) => {
      const rect = image.getBoundingClientRect();
      const frame = image.parentElement.getBoundingClientRect();
      const scale = rect.width / 540;
      return {
        loaded: image.complete && image.naturalWidth > 0,
        center: (frame.left + frame.right) / 2,
        artworkFits:
          rect.left + 120 * scale >= frame.left &&
          rect.left + 420 * scale <= frame.right &&
          rect.top + 128 * scale >= frame.top &&
          rect.top + 412 * scale <= frame.bottom,
      };
    });
    assert.equal(logoGeometry.loaded, true);
    assert.ok(
      Math.abs(logoGeometry.center - width / 2) < 2,
      "Official logo is centered",
    );
    assert.equal(
      logoGeometry.artworkFits,
      true,
      "Complete symbol and original lettering fit inside the logo frame",
    );
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
