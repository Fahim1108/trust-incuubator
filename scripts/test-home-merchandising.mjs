import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
await mkdir('artifacts/merchandising', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1100 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(await page.locator('[data-section]').evaluateAll(es => es.map(e => e.dataset.section)), ['hero', 'categories', 'brands', 'new-arrivals', 'featured']);
    const collectionLinks = [];
    let previous = [];
    for (const title of ['New Arrivals', 'Featured Picks']) {
      const section = page.getByRole('region', { name: title, exact: true });
      await section.scrollIntoViewIfNeeded();
      await expect(section.getByRole('heading', { name: title, exact: true })).toBeVisible();
      const cards = section.locator('ul > li');
      assert.equal(await cards.count(), 8);
      assert.equal(await section.locator('ul > li:visible').count(), width < 768 ? 4 : 8);
      const positions = await section.locator('ul > li:visible').evaluateAll(es => es.map(e => ({ x: e.getBoundingClientRect().x, y: Math.round(e.getBoundingClientRect().y) })));
      assert.equal(positions.filter(p => p.y === positions[0].y).length, width < 768 ? 2 : 4);
      const links = await section.locator('h3 a').evaluateAll(es => es.map(e => e.getAttribute('href')));
      assert.ok(links.every(link => !previous.includes(link)), 'Adjacent sections do not repeat products');
      previous = links;
      for (const link of links) assert.equal((await page.request.get(`http://localhost:3001${link}`)).status(), 200);
      assert.ok(/(?:BDT\s|৳)\d/.test(await section.textContent()), 'BDT prices remain visible');
      assert.equal(await section.getByRole('button', { name: /wishlist/ }).count(), width < 768 ? 4 : 8);
      const href = await section.getByRole('link', { name: 'View All', exact: true }).getAttribute('href');
      collectionLinks.push(href);
      assert.equal((await page.request.get(`http://localhost:3001${href}`)).status(), 200);
      for (const image of await section.locator('li:visible img').all()) {
        await image.evaluate(e => e.loading = 'eager');
        await expect(image).toHaveJSProperty('complete', true);
        assert.ok(await image.evaluate(e => e.naturalWidth > 0));
      }
      await section.evaluate(e => e.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await section.screenshot({ path: `artifacts/merchandising/${title === 'New Arrivals' ? 'new-arrivals' : 'featured'}-${width}.png` });
    }
    for (const slug of ['trending', 'most-popular', 'missing']) {
      const missing = await browser.newPage();
      await missing.goto(`http://localhost:3001/collections/${slug}`, { waitUntil: 'networkidle' });
      await expect(missing.getByText('Page not found', { exact: true })).toBeVisible();
      assert.equal(await missing.locator('main article').count(), 0);
      await missing.close();
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/merchandising/home-${width}.png`, fullPage: true });
    await page.goto(`http://localhost:3001${collectionLinks[0]}`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'New Arrivals', exact: true })).toBeVisible();
    assert.equal(await page.locator('main article').count(), 8, 'View All shows all eight collection cards on mobile');
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: homepage order, 4 mobile/8 desktop cards, 2/4 columns, nonrepeating selections, BDT/wishlist/images, product and collection links, disabled collections unavailable, no overflow/errors`);
    await page.close();
  }
} finally { await browser.close(); }
