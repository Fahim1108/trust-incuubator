import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
await mkdir('artifacts/browse-refinement', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1400 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.equal(await page.getByRole('tablist', { name: 'Browse by' }).count(), 0);
    const categories = page.getByRole('region', { name: 'Shop by Categories', exact: true });
    const brands = page.getByRole('region', { name: 'Shop by Brands', exact: true });
    await expect(categories).toBeVisible();
    await expect(brands).toBeVisible();
    assert.deepEqual(await categories.locator('li a').allTextContents().then(a => a.map(s => s.trim())), ['Shirts', 'Pants', 'Sneakers', 'Belt', 'Wallet', 'Watches']);
    assert.equal(await brands.locator('li').count(), 10);
    for (const image of await categories.locator('img').all()) {
      await expect(image).toHaveJSProperty('complete', true);
      assert.ok(await image.evaluate(e => e.naturalWidth > 0));
    }
    const c = await categories.boundingBox();
    const b = await brands.boundingBox();
    assert.ok(b.y >= c.y + c.height, 'Brands follows categories');
    if (width === 390) {
      assert.ok((await categories.locator('img').first().boundingBox()).height < 70, 'Compact category photo');
      assert.ok((await brands.locator('li a').first().boundingBox()).height <= 48, 'Compact brand tile');
    }
    for (const section of [categories, brands]) {
      for (const link of await section.locator('li a').all()) {
        const href = await link.getAttribute('href');
        assert.equal((await page.request.get(`http://localhost:3001${href}`)).status(), 200, href);
      }
    }
    await categories.locator('li a').first().focus();
    assert.equal(await categories.locator('li a').first().evaluate(e => getComputedStyle(e).outlineStyle), 'solid');
    await page.locator(':focus').evaluate(e => e.blur());
    await page.screenshot({ path: `artifacts/browse-refinement/browse-${width}.png`, clip: { x: 0, y: c.y - 12, width, height: b.y + b.height - c.y + 24 } });
    const footer = page.locator('footer');
    assert.equal(await footer.evaluate(e => getComputedStyle(e).backgroundColor), 'rgb(64, 0, 0)');
    const logo = footer.locator('img').first();
    const wordmark = footer.locator('img[src*="wordmark-white"]');
    await expect(wordmark).toBeVisible();
    await expect(wordmark).toHaveJSProperty('complete', true);
    const l = await logo.boundingBox();
    const w = await wordmark.boundingBox();
    const social = await footer.getByRole('list', { name: 'Social media' }).boundingBox();
    assert.ok(Math.abs(l.x + l.width / 2 - w.x - w.width / 2) < 1, 'Original logo and artwork wordmark centered');
    assert.ok(w.y >= l.y + l.height + 6 && w.y <= l.y + l.height + 10, 'Compact wordmark gap');
    assert.ok(social.y > w.y + w.height, 'Social icons below complete branding');
    await expect(footer.getByText('Created by Firoj Ahamed Fahim', { exact: true })).toBeVisible();
    await footer.screenshot({ path: `artifacts/browse-refinement/footer-${width}.png` });
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: visible ordered sections, compact cards, images, routes, focus, original wordmark alignment, footer, no overflow/errors`);
    await page.close();
  }
} finally { await browser.close(); }
