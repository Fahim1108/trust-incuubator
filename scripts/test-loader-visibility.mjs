import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = process.env.CLAUDE_PREVIEW_URL || 'http://localhost:3001';
const hosted = new URL(origin).protocol === 'https:';
const directory = process.env.LOADER_ARTIFACT_DIR || 'artifacts/loader-visibility/local';
await mkdir(directory, { recursive: true });
const access = process.env.ATTIRES_BROWSER_ACCESS_FILE
  ? JSON.parse(await readFile(process.env.ATTIRES_BROWSER_ACCESS_FILE, 'utf8')) : null;
const proxyUrl = hosted && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY);
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium', args: ['--no-sandbox'],
  ...(proxyUrl ? { proxy: { server: new URL(proxyUrl).origin } } : {}),
});
const contextOptions = { ...(access ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': access.secret } } : {}) };
const results = [];
async function holdActions(page) {
  let release;
  await page.route('**/*', async route => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      await new Promise(resolve => { release = resolve; });
    }
    await route.continue();
  });
  return async () => { await expect.poll(() => !!release).toBe(true); release(); };
}
async function checkPending(button) {
  const box = await button.evaluate(e => [e.offsetWidth, e.offsetHeight]);
  await button.click({ noWaitAfter: true });
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button).toBeDisabled();
  const loader = button.locator('[data-loader-size=sm]');
  await expect(loader).toBeVisible();
  assert.deepEqual(await button.evaluate(e => [e.offsetWidth, e.offsetHeight]), box);
  return box;
}

try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ ...contextOptions, viewport: { width, height: 950 },
      ...(width === 390 && process.env.LOADER_RECORD_VIDEO === '1'
        ? { recordVideo: { dir: directory, size: { width: 390, height: 950 } } } : {}),
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(origin + '/motion-preview', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Loading animation preview', exact: true })).toBeVisible();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    for (const surface of ['white', 'burgundy']) {
      const section = page.locator(`[data-demo-surface=${surface}]`);
      assert.equal(await section.evaluate(e => getComputedStyle(e).backgroundColor), surface === 'white' ? 'rgb(255, 255, 255)' : 'rgb(64, 0, 0)');
      for (const [size, pixels, stroke] of [['sm', 24, 2], ['md', 40, 3], ['lg', 80, 4]]) {
        const loader = section.locator(`[data-loader-size=${size}]`);
        const ring = loader.locator('[data-loader-ring]');
        await expect(loader).toBeVisible();
        assert.equal(await ring.evaluate(e => getComputedStyle(e).width), pixels + 'px');
        assert.equal(await ring.locator('circle').getAttribute('stroke-width'), String(stroke));
        assert.deepEqual(await ring.evaluate(e => { const c = getComputedStyle(e); return [c.animationDuration, c.animationTimingFunction, c.animationIterationCount]; }), ['1.6s', 'linear', 'infinite']);
        assert.equal(await ring.evaluate(e => getComputedStyle(e.parentElement).backgroundColor), 'rgb(255, 255, 255)');
        const image = loader.locator('[data-loader-logo]');
        await expect.poll(() => image.evaluate(e => e.complete && e.naturalWidth > 0)).toBe(true);
        assert.equal(await image.evaluate(e => getComputedStyle(e).transform), 'none');
        const first = await ring.evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.atan2(m.b, m.a) * 180 / Math.PI; });
        await page.waitForTimeout(120); // Browser measurement only; not application timing.
        const second = await ring.evaluate(e => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.atan2(m.b, m.a) * 180 / Math.PI; });
        const clockwise = (second - first + 360) % 360;
        assert.ok(clockwise > 5 && clockwise < 100, 'Visible ring rotates clockwise');
      }
    }
    await page.screenshot({ path: `${directory}/sizes-${width}.png`, fullPage: true });
    const button = page.getByRole('button', { name: 'Test Loading Animation', exact: true });
    const started = Date.now();
    await button.click();
    const overlay = page.locator('[data-aa-loader=overlay]');
    await expect(overlay).toBeVisible();
    const logo = overlay.locator('[data-loader-logo]');
    const logoBox = await logo.boundingBox();
    await page.screenshot({ path: `${directory}/overlay-${width}.png` });
    await page.keyboard.press('Tab');
    await expect(overlay).toBeFocused();
    assert.equal(await button.evaluate(e => !!e.closest('[inert]')), true);
    assert.deepEqual(await logo.boundingBox(), logoBox);
    await expect(overlay).toHaveCount(0, { timeout: 5000 });
    const elapsed = Date.now() - started;
    assert.ok(elapsed >= 2900 && elapsed < 5000, `Demo lasted ${elapsed}ms`);
    await expect(button).toBeFocused();
    await expect(button).toBeEnabled();
    assert.equal(await button.evaluate(e => !!e.closest('[inert]')), false);
    await expect(page.locator('[data-aa-loader-exit]')).toHaveCount(0);
    await expect(page.locator('[data-demo-result]')).toContainText('Demonstration finished');
    assert.deepEqual(errors, []);
    const video = page.video();
    await context.close();
    if (video) await video.saveAs(`${directory}/demonstration.webm`);
    results.push({ width, surfaces: ['white', 'burgundy'], sizes: [24, 40, 80], clockwise: true, actualLogosLoaded: true, demoMilliseconds: elapsed, focusAndCleanup: 'passed' });
    console.log(`PASS ${width}px: all sizes/surfaces, official assets, clockwise 1.6s ring, stationary logo, 3-second demo and focus cleanup`);
  }

  const context = await browser.newContext({ ...contextOptions, viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  // Search navigation, distinct from suggestions checked by test-claude-motion.
  await page.goto(origin, { waitUntil: 'networkidle' });
  const search = page.locator('header input[type=search]:visible').first();
  await search.fill('wallet');
  await expect(page.getByRole('listbox', { name: 'Product suggestions' })).toHaveAttribute('aria-busy', 'false');
  let releaseNavigation;
  await page.route('**/*', async route => {
    const r = route.request(); const u = new URL(r.url());
    if (r.headers().rsc && u.pathname === '/shop' && u.searchParams.get('q') === 'wallet') await new Promise(resolve => { releaseNavigation = resolve; });
    await route.continue();
  });
  const submit = page.locator('header:visible').getByRole('button', { name: 'Search', exact: true }).filter({ visible: true });
  await submit.click({ noWaitAfter: true });
  // App Router can commit its cached loading shell immediately: the compact
  // transition indicator then hands off to the non-modal route fallback.
  await expect(page.locator('[data-route-loader] [data-loader-size=lg]')).toBeVisible();
  await expect.poll(() => !!releaseNavigation).toBe(true);
  await page.screenshot({ path: `${directory}/search-submission.png` });
  releaseNavigation();
  await expect(page.locator('[data-route-loader]')).toHaveCount(0);
  await expect(submit).toBeEnabled();
  await expect(page).toHaveURL(/\/shop\?q=wallet/);
  await page.unroute('**/*');
  console.log('PASS search submission: pending transition hands off to visible route loader, then cleans up');

  await page.goto(origin + '/account/register', { waitUntil: 'networkidle' });
  await page.getByLabel('Full Name', { exact: true }).fill('Loader Test');
  await page.getByLabel('Email', { exact: true }).fill('loader-test@example.invalid');
  await page.getByLabel('Mobile Number', { exact: true }).fill('01700000000');
  await page.getByLabel('Password', { exact: true }).fill('PreviewOnly123!');
  await page.getByLabel('Confirm Password', { exact: true }).fill('PreviewOnly123!');
  await page.getByRole('checkbox', { name: /I agree/ }).check();
  const releaseRegistration = await holdActions(page);
  const register = page.getByRole('button', { name: 'Create Account', exact: true });
  await checkPending(register);
  await page.screenshot({ path: `${directory}/signup-pending.png` });
  await releaseRegistration();
  await expect(register).toBeEnabled();
  await page.unroute('**/*');
  await expect(page.getByText(/Account registration is not connected yet/)).toBeVisible();
  console.log('PASS signup: actual server-action pending loader and honest not-connected response');

  await page.goto(origin + '/checkout', { waitUntil: 'networkidle' });
  await page.locator('#checkout-fullName').fill('Loader Test');
  await page.locator('#checkout-phone').fill('01700000000');
  await page.locator('#checkout-division').selectOption('Dhaka');
  await page.locator('#checkout-district').selectOption('Dhaka');
  await page.locator('#checkout-area').selectOption('Banani');
  await page.locator('#checkout-addressLine').fill('Demonstration address only');
  await page.getByRole('button', { name: 'Continue to Payment', exact: true }).click();
  await page.getByRole('button', { name: 'Review Order', exact: true }).click();
  const place = page.getByRole('button', { name: /Place Order/ });
  await expect(place).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Your Order Is Confirmed!', exact: true })).toHaveCount(0);
  console.log('PASS checkout: live submission stays disabled until payment services are configured');
  await context.close();

  const reduced = await browser.newContext({ ...contextOptions, reducedMotion: 'reduce', viewport: { width: 390, height: 950 } });
  const rp = await reduced.newPage();
  await rp.goto(origin + '/motion-preview', { waitUntil: 'networkidle' });
  for (const ring of await rp.locator('[data-loader-ring]').all()) assert.equal(await ring.evaluate(e => getComputedStyle(e).animationName), 'none');
  await rp.getByRole('button', { name: 'Test Loading Animation', exact: true }).click();
  await expect(rp.locator('[data-aa-loader=overlay]')).toBeVisible();
  await expect(rp.locator('[data-aa-loader=overlay]')).toHaveCount(0, { timeout: 5000 });
  await expect(rp.locator('[data-aa-loader-exit]')).toHaveCount(0);
  await reduced.close();
  console.log('PASS reduced motion: static official logo/ring, demo closes and restores interaction');
  await writeFile(`${directory}/verification.json`, JSON.stringify({ origin, results, realSearchSubmission: 'passed', realSignupAction: 'passed (not-connected response)', checkoutSubmission: 'disabled until services are configured', reducedMotion: 'passed', note: 'Controlled slow requests are test-only. No real authentication/order backend was enabled.' }, null, 2));
} finally { await browser.close(); }
