import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const origin = process.env.CLAUDE_PREVIEW_URL || 'http://localhost:3001';
const directory = 'artifacts/payment-receiving';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [];
try {
  for (const width of [360, 390, 430, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], ...(width < 768 ? { isMobile: true, hasTouch: true } : {}) });
    const page = await context.newPage();
    const errors = []; let posts = 0;
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (request.method() === 'POST') posts++; });
    await page.goto(origin + '/checkout', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-summary-advance]')).toHaveText('Select location');
    for (const [field, value] of [['fullName', 'Payment UI Test'], ['phone', '01700000000'], ['addressLine', 'Isolated browser test address']]) await page.locator('#checkout-' + field).fill(value);
    await page.locator('#checkout-division').selectOption('Dhaka');
    await page.locator('#checkout-district').selectOption('Dhaka');
    await page.locator('#checkout-area').selectOption('Banani');
    await expect(page.locator('[data-summary-advance]')).toHaveText('৳70');
    await page.getByRole('button', { name: 'Continue to Payment', exact: true }).click();
    const panel = page.locator('[data-advance-payment]');
    const totalText = await page.getByRole('region', { name: 'Order summary', exact: true }).locator('dd').last().innerText();
    const total = Number(totalText.replace(/[^0-9.]/g, ''));
    for (const mode of ['cod', 'online']) {
      if (mode === 'online') await page.getByRole('radio', { name: /^Full Online Payment/ }).check();
      await expect(panel).toHaveAttribute('data-payment-mode', mode);
      const reference = panel.getByRole('textbox', { name: /^Transaction ID \/ Last 4 digits of number/ });
      await reference.fill('1234');
      await expect(reference).toHaveValue('1234');
      await expect(panel.locator('[data-required-advance]')).toHaveText(`৳${new Intl.NumberFormat('en-BD').format(mode === 'cod' ? 70 : total)}`);
      await expect(panel.locator('[data-remaining-balance]')).toHaveText(`৳${new Intl.NumberFormat('en-BD').format(mode === 'cod' ? total - 70 : 0)}`);
      for (const method of ['bKash', 'Nagad']) {
        await panel.getByRole('tab', { name: 'Personal ' + method, exact: true }).click();
        const number = panel.locator('[data-recipient-number]');
        const copy = panel.getByRole('button', { name: 'Copy Number', exact: true });
        if (/^01[3-9]\d{8}$/.test(await number.innerText())) {
          await expect(copy).toBeEnabled(); await copy.click();
          await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(await number.innerText());
        } else await expect(copy).toBeDisabled();
        await expect(panel.getByRole('button', { name: 'Submit Payment', exact: true })).toBeDisabled();
        await expect(panel.getByRole('textbox', { name: new RegExp('^Your ' + method + ' Number') })).toBeVisible();
      }
      await panel.getByRole('tab', { name: 'Personal Nagad', exact: true }).press('ArrowLeft');
      await expect(panel.getByRole('tab', { name: 'Personal bKash', exact: true })).toBeFocused();
      for (const method of ['bKash', 'Nagad']) {
        const image = panel.getByRole('tab', { name: 'Personal ' + method, exact: true }).locator('img');
        await expect.poll(() => image.evaluate(e => e.complete && e.naturalWidth > 0)).toBe(true);
        await expect(image).toHaveAttribute('src', new RegExp(method.toLowerCase() + '\\.png'));
      }
      await expect(panel.getByRole('link', { name: /Vecteezy/i })).toHaveCount(0);
      await panel.getByRole('button', { name: 'Copy Amount', exact: true }).click();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(String(mode === 'cod' ? 70 : total));
      const submit = panel.getByRole('button', { name: 'Submit Payment', exact: true });
      await expect(submit).toBeDisabled();
      // Even synthetic form submission must not call a live action.
      await panel.locator('form').dispatchEvent('submit');
      await expect(panel.getByRole('alert')).toContainText('Live payment submission is disabled');
      assert.equal(posts, 0);
      await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); scrollTo({ top: 0, behavior: 'instant' }); });
      await page.screenshot({ path: `${directory}/${mode}-${width}.png`, fullPage: true });
    }
    await page.getByRole('radio', { name: /^Cash on Delivery/ }).check();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.locator('#checkout-district').selectOption('Gazipur');
    await page.locator('#checkout-area').selectOption('Gazipur Sadar');
    await expect(page.locator('[data-summary-advance]')).toHaveText('৳130');
    await page.getByRole('button', { name: 'Continue to Payment', exact: true }).click();
    await expect(panel.locator('[data-required-advance]')).toHaveText('৳130');
    await panel.getByRole('button', { name: 'Copy Amount', exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('130');
    await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => Promise.reject(new Error('Test-only clipboard denial')) }));
    await panel.getByRole('button', { name: 'Copy Number', exact: true }).click();
    await expect(panel.getByText(/Could not copy number/)).toBeVisible();
    const phone = panel.getByRole('textbox', { name: /^Your bKash Number/ });
    await phone.focus();
    if (width < 768) await expect(page.locator('[data-whatsapp-support]')).toHaveCSS('visibility', 'hidden');
    await page.getByRole('button', { name: 'Review Order', exact: true }).click();
    await expect(page.getByRole('button', { name: /Place Order/ })).toBeDisabled();
    await expect(page.getByRole('heading', { name: 'Your Order Is Confirmed!', exact: true })).toHaveCount(0);
    assert.equal(posts, 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    await context.close();
    results.push({ width, modes: ['cod', 'online'], numberCopy: 'passed', amounts: 'passed: 70/130/full total', liveSubmission: 'disabled, zero POSTs', logo: 'supplied bKash and Nagad PNGs loaded; no attribution UI', overflow: false });
    console.log(`PASS ${width}px: shared COD/full UI, authorised recipient copy, amounts, logo, keyboard, disabled live submission and no false confirmation`);
  }
  await writeFile(`${directory}/verification.json`, JSON.stringify({ origin, results, backend: 'No payment/order submission enabled.' }, null, 2));
} finally { await browser.close(); }
