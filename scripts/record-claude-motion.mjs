import { mkdir, rename } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const directory = 'artifacts/motion';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, recordVideo: { dir: directory, size: { width: 390, height: 844 } } });
try {
  const page = await context.newPage();
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open menu', exact: true }).tap();
  const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
  await expect(menu).toBeVisible();
  await menu.getByRole('button', { name: 'Men', exact: true }).tap();
  await expect(menu.getByRole('link', { name: 'Shirts', exact: true })).toBeVisible();
  await menu.getByRole('button', { name: 'Close', exact: true }).tap();
  await expect(page.locator('[role=dialog]')).toHaveCount(0);
  const search = page.locator('header input[type=search]:visible').first();
  let releaseSearch;
  await page.route('**/*', async route => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) await new Promise(resolve => { releaseSearch = resolve; });
    await route.continue();
  });
  await search.fill('cotton');
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'true');
  // Test-only transport hold for recording; the application adds no delay.
  await page.waitForTimeout(900);
  releaseSearch();
  await expect(page.getByRole('listbox')).toHaveAttribute('aria-busy', 'false');
  await page.unroute('**/*');
  await page.getByRole('button', { name: 'Clear search', exact: true }).tap();
  const product = page.getByRole('region', { name: 'New Arrivals', exact: true }).locator('article').first();
  await product.scrollIntoViewIfNeeded();
  await product.getByRole('button', { name: /wishlist/ }).tap();
  await page.getByRole('button', { name: /^Cart \(/ }).tap();
  const cart = page.getByRole('dialog');
  await expect(cart).toBeVisible();
  await cart.getByRole('button', { name: 'Increase quantity', exact: true }).first().tap();
  await cart.getByRole('button', { name: 'Close', exact: true }).tap();
  await expect(page.locator('[role=dialog]')).toHaveCount(0);
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.getByRole('tab', { name: /^Slide 2:/ }).tap();
  await expect.poll(() => page.locator('.aa-hero-slide[aria-hidden=false]').evaluate(e => getComputedStyle(e).opacity)).toBe('1');
  await page.goto('http://localhost:3001/loader-preview', { waitUntil: 'networkidle' });
  let releaseAsset;
  await page.route('**/brand/logo-loader-original.png', async route => {
    if (route.request().resourceType() === 'fetch') await new Promise(resolve => { releaseAsset = resolve; });
    await route.continue();
  });
  await page.getByRole('button', { name: 'Load brand asset', exact: true }).tap();
  await expect(page.locator('[data-aa-loader=overlay]')).toBeVisible();
  await page.waitForTimeout(1700);
  releaseAsset();
  await expect(page.locator('[data-aa-loader=overlay]')).toHaveCount(0);
  const video = page.video();
  await context.close();
  await rename(await video.path(), `${directory}/interactions.webm`);
  console.log('Recorded real browser interactions and pending states; request holds exist only in the test runner.');
} finally { await context.close(); await browser.close(); }
