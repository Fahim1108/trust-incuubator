import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
const origin = process.env.STOREFRONT_TEST_ORIGIN ?? "http://localhost:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw new Error("Local preview only");
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await page.clock.install({ time: new Date("2030-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2030-01-01T00:00:01Z"));
  await page.goto(origin, { waitUntil: "networkidle" });
  const slide = (n) =>
    page.getByRole("button", { name: new RegExp(`Show campaign ${n}:`) });
  await expect(slide(1)).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(2900);
  await expect(slide(1)).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(200);
  await expect(slide(2)).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(6000);
  await expect(slide(1)).toHaveAttribute("aria-pressed", "true");
  await page.locator(".campaign-stage").hover();
  await page.clock.runFor(3100);
  await expect(slide(1)).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(0, 0);
  await slide(1).focus();
  await page.clock.runFor(3100);
  await expect(slide(1)).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Pause slideshow", exact: true })
    .click();
  await page.mouse.move(0, 0);
  await page.locator(":focus").evaluate((e) => e.blur());
  await page.clock.runFor(3100);
  await expect(slide(1)).toHaveAttribute("aria-pressed", "true");
  console.log(
    "PASS: 3-second rotation, wraparound, hover/focus pause and manual pause",
  );
  const reduced = await browser.newPage({ reducedMotion: "reduce" });
  await reduced.goto(origin, { waitUntil: "networkidle" });
  await expect(
    reduced.getByRole("button", { name: "Play slideshow", exact: true }),
  ).toBeVisible();
  assert.equal(
    await reduced
      .getByRole("button", {
        name: "Show campaign 1: STYLE ELEVATED",
        exact: true,
      })
      .getAttribute("aria-pressed"),
    "true",
  );
  console.log("PASS: reduced-motion preference disables autoplay by default");
} finally {
  await browser.close();
}
