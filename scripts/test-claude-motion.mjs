import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const origin = process.env.CLAUDE_PREVIEW_URL || 'http://localhost:3001';
const directory = 'artifacts/motion';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const evidence = [];
const settle = locator => expect.poll(() => locator.evaluate(e => getComputedStyle(e).scale)).toMatch(/^(1|none)$/);
try {
  for (const width of [360, 390, 430, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, ...(width < 768 ? { hasTouch: true, isMobile: true } : {}) });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    const search = page.locator('header input[type=search]:visible').first();
    const dimensions = await search.boundingBox();
    const borderBefore = await search.locator('xpath=..').evaluate(e => getComputedStyle(e).borderColor);
    await search.focus();
    await expect.poll(() => search.locator('xpath=..').evaluate(e => getComputedStyle(e).borderColor)).not.toBe(borderBefore);
    assert.notEqual(await search.locator('xpath=..').evaluate(e => getComputedStyle(e).boxShadow), 'none');
    assert.equal((await search.boundingBox()).width, dimensions.width);
    const menu = page.getByRole('button', { name: 'Open menu', exact: true });
    if (width < 1024) {
      await menu.click();
      const dialog = page.getByRole('dialog', { name: 'Menu', exact: true });
      await expect(dialog).toBeVisible();
      assert.ok(await dialog.evaluate(e => getComputedStyle(e).transitionDuration.split(',').every(value => parseFloat(value) >= .22 && parseFloat(value) <= .3)));
      assert.equal(await page.locator('body').evaluate(e => e.style.overflow), 'hidden');
      assert.equal(await page.locator('main').evaluate(e => e.inert), true);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await dialog.evaluate(e => e.contains(document.activeElement)), true);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(menu).toBeFocused();
      assert.equal(await page.locator('main').evaluate(e => e.inert), false);
      assert.notEqual(await page.locator('body').evaluate(e => e.style.overflow), 'hidden');
    }
    const product = page.getByRole('region', { name: 'New Arrivals', exact: true }).locator('article').first();
    await product.scrollIntoViewIfNeeded();
    const image = product.locator('.aa-product-photo');
    if (width === 1440) {
      await product.hover();
      await expect.poll(() => image.evaluate(e => getComputedStyle(e).transform)).toMatch(/1\.03/);
      assert.equal(await image.evaluate(e => getComputedStyle(e).transitionDuration), '0.35s');
      await page.mouse.move(0, 0);
    }
    const wish = product.getByRole('button', { name: /wishlist/ });
    const saved = await wish.getAttribute('aria-pressed');
    await wish.click();
    await expect(wish).toHaveAttribute('aria-pressed', saved === 'true' ? 'false' : 'true');
    assert.equal(await wish.locator('[data-aa-loader]').count(), 0, 'Instant wishlist does not fabricate a pending request');
    await page.screenshot({ path: `${directory}/interaction-${width}.png` });
    assert.deepEqual(errors, []);
    evidence.push({ width, result: 'passed', checks: ['no overflow', 'search focus without resizing', 'drawer timing/scroll/focus/inert cleanup', 'product hover or touch', 'instant accurate wishlist'] });
    console.log(`PASS ${width}px: responsive focus, menu, scroll/focus isolation, hover/touch and wishlist`);
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(origin + '/cart', { waitUntil: 'networkidle' });
  const cartCount = page.locator('[data-cart-count]:visible').first();
  const quantityBefore = Number(await cartCount.textContent());
  await page.getByRole('button', { name: 'Increase quantity', exact: true }).first().click();
  await expect(cartCount).toHaveText(String(quantityBefore + 1));
  await expect.poll(() => cartCount.evaluate(e => getComputedStyle(e).animationName)).toBe('aa-count-update');
  assert.equal(await cartCount.evaluate(e => getComputedStyle(e).animationIterationCount), '1');
  console.log('PASS cart: real local quantity update, accurate badge and one-shot animation');
  await page.goto(origin, { waitUntil: 'networkidle' });
  const reveal = page.locator('[data-section=featured] [data-reveal]');
  await reveal.evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect(reveal).toHaveAttribute('data-reveal', 'shown');
  assert.ok(await reveal.evaluate(e => e.getAnimations().some(a => a.effect.getTiming().duration === 450)));
  await reveal.evaluate(async e => { await Promise.all(e.getAnimations().map(a => a.finished)); });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await reveal.evaluate(e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  assert.equal(await reveal.evaluate(e => e.getAnimations().length), 0, 'Reveal only plays once');
  await page.getByRole('region', { name: 'Shop by Categories', exact: true }).getByRole('link').first().click();
  await page.waitForURL('**/category/shirts');
  await expect.poll(() => page.locator('[data-route-motion]').evaluate(e => e.getAnimations().some(a => a.effect.getTiming().duration === 350))).toBe(true);
  await page.goBack({ waitUntil: 'networkidle' });
  console.log('PASS once-only reveal and ready-route entrance; cached navigation has no global overlay');
  assert.equal(await page.locator('[data-aa-loader=overlay]').count(), 0);
  const search = page.locator('header input[type=search]:visible').first();
  let releaseSearch;
  let intercepted = 0;
  await page.route('**/*', async route => {
    const request = route.request();
    if (request.method() === 'POST' && request.headers()['next-action'] && request.postData()?.includes('cotton')) {
      intercepted++;
      await new Promise(resolve => { releaseSearch = resolve; });
    }
    await route.continue();
  });
  await search.fill('cotton');
  const listbox = page.getByRole('listbox', { name: 'Product suggestions' });
  await expect(listbox).toHaveAttribute('aria-busy', 'true');
  const small = listbox.locator('[data-loader-size=sm]');
  await expect(small).toBeVisible();
  const ring = small.locator('[data-loader-ring]');
  assert.equal(await ring.evaluate(e => getComputedStyle(e).width), '24px');
  assert.equal(await ring.evaluate(e => getComputedStyle(e).animationDuration), '1.6s');
  assert.equal(await small.locator('[data-loader-logo]').evaluate(e => getComputedStyle(e).transform), 'none');
  const transform = await ring.evaluate(e => getComputedStyle(e).transform);
  await expect.poll(() => ring.evaluate(e => getComputedStyle(e).transform)).not.toBe(transform);
  await search.fill('wallet');
  await expect(search).toHaveValue('wallet');
  assert.ok(releaseSearch && intercepted === 1);
  await page.evaluate(() => {
    document.documentElement.dataset.staleSuggestion = 'false';
    const element = document.querySelector('[aria-label="Product suggestions"]');
    const observer = new MutationObserver(() => { if (element.textContent.includes('Cotton')) document.documentElement.dataset.staleSuggestion = 'true'; });
    observer.observe(element, { childList: true, subtree: true });
  });
  releaseSearch();
  await expect(listbox).toHaveAttribute('aria-busy', 'false');
  await expect(listbox).toContainText('Minimal Wallet');
  assert.equal(await page.locator('html').getAttribute('data-stale-suggestion'), 'false');
  await page.unroute('**/*');
  await page.route('**/*', route => route.request().method() === 'POST' && route.request().headers()['next-action'] ? route.abort('failed') : route.continue());
  await search.fill('sneakers');
  await expect(listbox.getByRole('status')).toContainText('Search is unavailable');
  await expect(listbox).toHaveAttribute('aria-busy', 'false');
  await expect(search).toHaveValue('sneakers');
  await page.unroute('**/*');
  console.log('PASS search: real pending official loader, typing, stale-response rejection and failure cleanup');

  await page.goto(origin + '/account/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email or Mobile', { exact: true }).fill('motion-test@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('PreviewOnly123!');
  let releaseForm; let submissions = 0;
  await page.route('**/*', async route => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      submissions++;
      await new Promise(resolve => { releaseForm = resolve; });
    }
    await route.continue();
  });
  const button = page.getByRole('button', { name: /Sign In/ });
  const before = await button.evaluate(e => [e.offsetWidth, e.offsetHeight]);
  await button.click();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button).toBeDisabled();
  await expect(button.locator('[data-loader-size=sm]')).toBeVisible();
  assert.deepEqual(await button.evaluate(e => [e.offsetWidth, e.offsetHeight]), before);
  await page.getByLabel('Password', { exact: true }).press('Enter');
  assert.equal(submissions, 1);
  assert.ok(releaseForm); releaseForm();
  await expect(button).toBeEnabled();
  await expect(page.getByText(/Sign in is not connected yet/)).toBeVisible();
  assert.deepEqual(await button.evaluate(e => [e.offsetWidth, e.offsetHeight]), before);
  await page.unroute('**/*');
  await page.route('**/*', route => route.request().method() === 'POST' && route.request().headers()['next-action'] ? route.abort('failed') : route.continue());
  await button.click();
  await expect(page.getByText('The request could not be completed. Please try again.', { exact: true })).toBeVisible();
  await expect(button).toBeEnabled();
  await page.unroute('**/*');
  await button.hover();
  await page.mouse.down();
  await expect.poll(() => button.evaluate(e => getComputedStyle(e).scale)).toBe('0.98');
  await page.mouse.up();
  await settle(button);
  console.log('PASS forms: real server pending, stable layout, duplicate prevention, truthful unavailable result, transport error cleanup and press feedback');

  await page.goto(origin + '/shop', { waitUntil: 'networkidle' });
  let releaseFilter;
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.headers().rsc && url.pathname === '/shop' && url.searchParams.get('sort') === 'price-asc') {
      await new Promise(resolve => { releaseFilter = resolve; });
    }
    await route.continue();
  });
  await page.getByLabel('Sort by', { exact: true }).selectOption('price-asc');
  const resultArea = page.locator('.aa-content-pending');
  await expect(resultArea).toHaveAttribute('aria-busy', 'true');
  await expect(resultArea.locator('[data-loader-size=md]')).toBeVisible();
  await expect.poll(() => Boolean(releaseFilter)).toBe(true);
  releaseFilter();
  await expect(resultArea).toHaveAttribute('aria-busy', 'false');
  await expect(page.getByLabel('Sort by', { exact: true })).toHaveValue('price-asc');
  await page.unroute('**/*');
  console.log('PASS catalogue: genuine navigation-pending medium loader and URL-backed results');
  await page.close();

  const hero = await browser.newPage({ viewport: { width: 390, height: 1000 }, hasTouch: true, isMobile: true });
  await hero.clock.install();
  await hero.goto(origin, { waitUntil: 'networkidle' });
  const chosen = () => hero.getByRole('tab', { selected: true }).getAttribute('aria-label');
  const firstSlide = await chosen();
  await hero.clock.fastForward(6500);
  assert.notEqual(await chosen(), firstSlide, 'Normal slideshow advances');
  await hero.emulateMedia({ reducedMotion: 'reduce' });
  const stoppedSlide = await chosen();
  await hero.clock.fastForward(13000);
  assert.equal(await chosen(), stoppedSlide, 'Live reduced-motion change stops autoplay');
  await hero.close();
  console.log('PASS hero: automatic advance and live reduced-motion pause');

  const reduced = await browser.newPage({ viewport: { width: 390, height: 1000 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true });
  await reduced.goto(origin + '/loader-preview', { waitUntil: 'networkidle' });
  for (const [size, width] of [['sm', 24], ['md', 40], ['lg', 80]]) {
    const loader = reduced.locator(`[data-loader-size=${size}]`);
    assert.equal(await loader.locator('[data-loader-ring]').evaluate(e => parseFloat(getComputedStyle(e).width)), width);
    assert.equal(await loader.locator('[data-loader-ring]').evaluate(e => getComputedStyle(e).animationName), 'none');
    assert.equal(await loader.locator('[data-loader-logo]').evaluate(e => getComputedStyle(e).transform), 'none');
  }
  await reduced.goto(origin, { waitUntil: 'networkidle' });
  for (const reveal of await reduced.locator('[data-reveal]').all()) assert.equal(await reveal.evaluate(e => getComputedStyle(e).opacity), '1');
  await reduced.close();
  const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 1000 } });
  await noJs.goto(origin, { waitUntil: 'networkidle' });
  for (const title of ['Shop by Categories', 'Shop by Brands', 'New Arrivals', 'Featured Picks']) {
    const region = noJs.getByRole('region', { name: title, exact: true });
    await expect(region).toBeVisible();
    assert.equal(await region.evaluate(e => getComputedStyle(e.parentElement).opacity), '1');
  }
  await noJs.close();
  console.log('PASS reduced motion and JavaScript-disabled content; loader variants 24/40/80px');
  await writeFile(`${directory}/verification.json`, JSON.stringify({ widths: evidence, pendingAndFailureChecks: 'passed', reducedMotion: 'passed', javascriptDisabled: 'passed', note: 'Cloud-local browser checks; no artificial runtime delay or fake transaction success.' }, null, 2));
} finally { await browser.close(); }
