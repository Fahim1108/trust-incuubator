import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createHmac } from "node:crypto";
import jsQR from "jsqr";
import {PNG} from "pngjs";
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
  onCreatedId,
  extraHTTPHeaders,
  proxy,
  accessURL,
  onUploadedPath,
  staff,
  customer,
}) {
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || "/usr/bin/chromium",
    headless: true,
    env:{...process.env,...(process.env.ADMIN_BROWSER_XDG_DATA_HOME?{XDG_DATA_HOME:process.env.ADMIN_BROWSER_XDG_DATA_HOME}:{})},
    ...(proxy ? { proxy } : {}),
  });
  const context = await browser.newContext({ baseURL, extraHTTPHeaders });
  const page = await context.newPage();
  const failures = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await mkdir("artifacts/admin", { recursive: true });
  try {
    if(accessURL)await page.goto(accessURL);
    await page.goto("/admin/products");
    await page.waitForURL("**/admin/sign-in");
    assert.equal(await page.locator("input[type=password]").count(), 1);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in securely" }).click();
    await page.waitForURL("**/admin/mfa");
    await page.getByRole('button',{name:'Set up authenticator',exact:true}).click();
    const qr=page.getByAltText('Private authenticator enrollment QR code');
    await qr.waitFor();
    // Decode only in memory. Never save QR screenshots, TOTP secrets or codes.
    const image=PNG.sync.read(await qr.screenshot());
    const decoded=jsQR(new Uint8ClampedArray(image.data),image.width,image.height);
    assert(decoded,'Authenticator QR must be readable');
    const uri=new URL(decoded.data);
    assert.equal(uri.protocol,'otpauth:');
    secret=uri.searchParams.get('secret');assert(secret);
    await page.getByLabel("Authenticator code").fill(code(secret));
    await page.getByRole("button", { name: "Verify and continue" }).click();
    await page.waitForURL((url) => url.pathname === "/admin");
    await page.getByRole("heading", { name: "Store overview" }).waitFor();
    assert.equal(
      await page
        .getByText("Your collection, priorities and daily operations in one place.", { exact: false })
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
    await page.goto('/admin/media');
    await page.getByLabel('Private draft image',{exact:true}).setInputFiles({name:'verification.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64')});
    await page.getByRole('button',{name:'Upload private image',exact:true}).click();
    await page.getByText('Private image uploaded.',{exact:true}).waitFor();
    const uploaded=await page.getByLabel('Stored object path').inputValue();
    onUploadedPath(uploaded);
    assert(/^[a-f0-9-]+\/[a-f0-9-]+\.png$/.test(uploaded));
    await page.screenshot({path:'artifacts/admin/private-upload-390.png',fullPage:true});
    await page.goto('/admin/products/new');
    const createdId=await page.locator('input[name=request_id]').inputValue();onCreatedId(createdId);
    await page.getByLabel('Product name',{exact:true}).fill('Disposable browser created product');
    await page.getByLabel('Description',{exact:true}).fill('QA draft creation only');
    await page.getByRole('button',{name:'Create draft',exact:true}).click();
    await page.getByRole('status').filter({hasText:'Basic product draft saved.'}).waitFor();
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
    await card.getByLabel("Actual chest (inches)").fill("22.5");
    await card.getByLabel("Actual length (inches)").fill("28");
    await card.locator("select[name=condition]").selectOption("very_good");

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
    await page.goto('/admin/products?review=AA-SHIRT-999');
    const review=page.locator('article.aa-product').filter({hasText:'AA-SHIRT-999'});
    await review.getByRole('button',{name:'4. Review',exact:true}).click();
    await review.getByRole('button',{name:'Save & Next',exact:true}).click();
    await page.waitForURL('**/admin/products?filter=missing-size');
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
    const {query:readSql,uuid:sqlUuid}=await import('../lib/supabase-development.mjs');
    const measured=(await readSql(`select chest_inches,length_inches,condition from public.thrift_intake where product_id=${sqlUuid(product)}`))[0];
    assert.equal(Number(measured.chest_inches),22.5);assert.equal(Number(measured.length_inches),28);assert.equal(measured.condition,'very_good');
    // Revoked membership is checked on each data/action request, not a hidden menu flag.
    const { query, uuid } = await import("../lib/supabase-development.mjs");
    await query(
      `delete from public.user_roles where user_id=${uuid((await query(`select actor_id from public.admin_audit_logs where target_id=${uuid(product)} limit 1`))[0].actor_id)}`,
      false,
    );
    await page.goto("/admin/products");
    await page.waitForURL("**/admin/sign-in?denied=1");
    for(const [role,account] of [['analyst',staff],['customer',customer]]){
      if(!account)throw new Error('Missing browser role fixture: '+role);
      await context.clearCookies();
      if(accessURL)await page.goto(accessURL);
      await page.goto('/admin/sign-in');
      await page.getByLabel('Email',{exact:true}).fill(account.email);
      await page.getByLabel('Password',{exact:true}).fill(account.password);
      await page.getByRole('button',{name:'Sign in securely'}).click();
      if(role==='customer'){
        await page.getByRole('alert').filter({hasText:'This account does not have staff access.'}).waitFor();
        await page.goto('/admin');await page.waitForURL('**/admin/sign-in');
      }else{
        await page.waitForURL('**/admin/mfa');
        await page.getByLabel('Authenticator code').fill(code(account.secret));
        await page.getByRole('button',{name:'Verify and continue'}).click();
        await page.waitForURL(u=>u.pathname==='/admin');
        await page.getByRole('heading',{name:'Store overview',exact:true}).waitFor();
        await page.screenshot({path:'artifacts/admin/analyst-1440.png',fullPage:true});
        await page.goto('/admin/products/new');await page.getByText('Your role cannot create products.',{exact:true}).waitFor();
        await page.goto('/admin/media');await page.getByText('Your role cannot upload draft images.',{exact:true}).waitFor();
        await page.goto('/admin/audit');await page.getByRole('heading',{name:'Audit access unavailable',exact:true}).waitFor();
      }
    }
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
            "real browser QR enrollment and six-digit TOTP verification",
            "HttpOnly session cookies",
            "real catalogue snapshot",
            "responsive no overflow",
            "mobile dialog Escape",
            "draft save survives reload",
            "audit log displays persisted changes",
            "logout invalidates browser access",
            "role revocation blocks data",
            "real private image upload through UI",
            "analyst dashboard and create/upload/audit restrictions",
            "customer browser sign-in rejected",
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
    const summary=String(e.message||'Browser operation failed').split('\n')[0];
    throw new Error('Hosted browser verification failed at '+new URL(page.url()).pathname+': '+summary.replaceAll(password,'[redacted]').replaceAll(email,'[test account]').replace(/([?&]_vercel_share=)[A-Za-z0-9_-]+/g,'$1[redacted]'));
  } finally {
    await context.close();
    await browser.close();
  }
}
