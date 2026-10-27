import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createHmac } from "node:crypto";
function code(secret) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of secret.toUpperCase().replace(/=+$/, ""))
    bits += chars.indexOf(c).toString(2).padStart(5, "0");
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8)
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
  return String(
    (h.readUInt32BE(h[h.length - 1] & 15) & 0x7fffffff) % 1000000,
  ).padStart(6, "0");
}
export async function verifyAdminBrowser({
  baseURL,
  email,
  password,
  secret,
  product,
  extraHTTPHeaders,
  proxy,
}) {
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    headless: true,
    ...(proxy ? { proxy } : {}),
  });
  const context = await browser.newContext({ baseURL, extraHTTPHeaders });
  const page = await context.newPage();
  const failures = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await mkdir("artifacts/admin", { recursive: true });
  try {
    await page.goto("/admin/products");
    await page.waitForURL("**/admin/sign-in");
    assert.equal(await page.locator("input[type=password]").count(), 1);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await page.waitForURL("**/admin/mfa");
    await page.getByLabel("Authenticator code").fill(code(secret));
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await page.waitForURL((url) => url.pathname === "/admin");
    await page.getByRole("heading", { name: "Store overview" }).waitFor();
    assert.equal(
      await page
        .getByText("No sample business metrics.", { exact: false })
        .count(),
      1,
    );
    const cookies = await context.cookies();
    assert(
      cookies.some(
        (c) =>
          c.name.startsWith("aa-admin-auth") &&
          c.httpOnly &&
          c.sameSite === "Lax",
      ),
    );
    if (baseURL.startsWith("https:"))
      assert(
        cookies
          .filter((c) => c.name.startsWith("aa-admin-auth"))
          .every((c) => c.secure),
      );
    for (const width of [360, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({
        path: `artifacts/admin/overview-${width}.png`,
        fullPage: true,
      });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        "Admin overflow at " + width,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    if (await menu.isVisible()) {
      await menu.click();
      await page.getByRole("dialog").waitFor();
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
    }
    await page.goto("/admin/products?q=one&q=two");
    await page.getByRole("heading", {name:"Product drafts",exact:true}).waitFor();
    await page.goto("/admin/products");
    const card = page.locator("article").filter({ hasText: "AA-SHIRT-999" });
    await card.locator("summary").click();
    await card
      .getByLabel("Product name", { exact: true })
      .fill("Browser verified draft");
    await card.getByRole("button", { name: "Continue", exact: true }).click();
    await card.getByLabel("Price (BDT)").fill("580.29");

    await card.getByRole("button", { name: "Continue", exact: true }).click();

    await card
      .getByLabel("Description", { exact: true })
      .fill("Disposable browser verification only.");
    await card.getByRole("button", { name: "Continue", exact: true }).click();
    // Reaching review must never submit implicitly through a changing button type.
    assert.equal(
      await page
        .getByRole("heading", { name: "Browser verified draft", exact: true })
        .count(),
      0,
    );
    await card.getByRole("button", { name: "Save draft", exact: true }).click();
    await page
      .getByRole("heading", { name: "Browser verified draft", exact: true })
      .waitFor();
    await page.getByRole("status").filter({hasText:"Draft saved."}).waitFor();
    await page.reload();
    await page
      .getByRole("heading", { name: "Browser verified draft", exact: true })
      .waitFor();
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.screenshot({
        path: `artifacts/admin/products-${width}.png`,
        fullPage: true,
      });
    }
    await page.goto("/admin/audit");
    await page.getByRole("heading", { name: "Catalogue audit log", exact: true }).waitFor();
    assert((await page.getByRole("heading", { name: "thrift / draft saved", exact: true }).count()) > 0);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.waitForURL("**/admin/sign-in");
    await page.goto("/admin");
    await page.waitForURL("**/admin/sign-in");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await page.waitForURL("**/admin/mfa");
    await page.getByLabel("Authenticator code").fill(code(secret));
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await page.waitForURL((url) => url.pathname === "/admin");
    // Revoked membership is checked on each data/action request, not a hidden menu flag.
    const { query, uuid } = await import("../lib/supabase-development.mjs");
    await query(
      `delete from public.user_roles where user_id=${uuid((await query(`select actor_id from public.admin_audit_logs where target_id=${uuid(product)} limit 1`))[0].actor_id)}`,
      false,
    );
    await page.goto("/admin/products");
    await page.waitForURL("**/admin/sign-in?denied=1");
    assert(!failures.length, "Browser errors: " + failures.length);
    await writeFile(
      "artifacts/admin/browser-results.json",
      JSON.stringify(
        {
          baseURL,
          viewports: [360, 390, 430, 768, 1440],
          checks: [
            "unauthenticated redirect",
            "password sign-in",
            "real TOTP MFA",
            "HttpOnly session cookies",
            "real catalogue snapshot",
            "responsive no overflow",
            "mobile dialog Escape",
            "draft save survives reload",
            "audit log displays persisted changes",
            "logout invalidates browser access",
            "role revocation blocks data",
          ],
          success: true,
        },
        null,
        2,
      ) + "\n",
    );
  } catch (e) {
    if (new URL(page.url()).pathname === "/admin/products")
      await page.screenshot({
        path: "artifacts/admin/browser-failure.png",
        fullPage: true,
      });
    throw e;
  } finally {
    await context.close();
    await browser.close();
  }
}
