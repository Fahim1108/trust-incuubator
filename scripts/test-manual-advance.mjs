import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';

const origin = process.env.CLAUDE_PREVIEW_URL || 'http://localhost:3001';
const directory = 'artifacts/manual-advance';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const results = [];
try {
  for (const width of [360, 390, 430, 768, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'], ...(width < 768 ? { isMobile: true, hasTouch: true } : {}) });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/checkout', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-summary-advance]')).toHaveText('Select location');
    await page.locator('#checkout-fullName').fill('Payment UI Test');
    await page.locator('#checkout-phone').fill('01700000000');
    await page.locator('#checkout-division').selectOption('Dhaka');
    await page.locator('#checkout-district').selectOption('Dhaka');
    await page.locator('#checkout-area').selectOption('Banani');
    await page.locator('#checkout-addressLine').fill('Isolated browser test address');
    await expect(page.locator('[data-summary-advance]')).toHaveText('৳70');
    const getTotal = async () => {
      const text = await page.getByRole('region', { name: 'Order summary', exact: true }).locator('dd').last().innerText();
      return Number(text.replace(/[^0-9.]/g, ''));
    };
    const total = await getTotal();
    await expect(page.locator('[data-summary-remaining]')).toHaveText(`৳${new Intl.NumberFormat('en-BD').format(total - 70)}`);
    await page.getByRole('button', { name: 'Continue to Payment', exact: true }).click();
    const payment = page.locator('[data-advance-payment]');
    await expect(payment.locator('[data-required-advance]')).toHaveText('৳70');
    await expect(payment.getByRole('button', { name: 'Copy Number', exact: true })).toBeDisabled();
    await expect(payment.getByText('Not configured', { exact: true })).toBeVisible();
    await expect(payment.getByText(/Payment collection is unavailable/)).toBeVisible();
    await payment.getByRole('tab', { name: 'Nagad', exact: true }).click();
    await expect(payment.getByRole('tab', { name: 'Nagad', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(payment.getByRole('textbox', { name: /^Your Nagad Number/ })).toBeVisible();
    await payment.getByRole('tab', { name: 'Nagad', exact: true }).press('ArrowLeft');
    await expect(payment.getByRole('tab', { name: 'bKash', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(payment.getByRole('tab', { name: 'bKash', exact: true })).toBeFocused();
    await payment.getByRole('button', { name: 'Copy Amount', exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('70');
    await expect(payment.getByText('Amount copied.', { exact: true })).toBeVisible();
    const submit = payment.getByRole('button', { name: 'Submit Payment', exact: true });
    await submit.click();
    const trx = payment.getByRole('textbox', { name: /^Transaction ID/ });
    await expect(trx).toHaveAttribute('aria-invalid', 'true');
    await expect(trx).toBeFocused();
    await trx.fill('  QA-TX_1.2  ');
    await trx.press('Tab');
    await expect(trx).toHaveValue('QA-TX_1.2');
    const sender = payment.getByRole('textbox', { name: /^Your bKash Number/ });
    await sender.fill('123');
    await submit.click();
    await expect(sender).toHaveAttribute('aria-invalid', 'true');
    await sender.fill('01700000000');
    await sender.focus();
    assert.equal(await sender.getAttribute('inputmode'), 'tel');
    if (width < 768) await expect(page.locator('[data-whatsapp-support]')).toHaveCSS('visibility', 'hidden');
    await sender.blur();
    await payment.getByLabel('Note (optional)', { exact: true }).fill('UI test only; no live transaction.');
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); scrollTo({ top: 0, behavior: 'instant' }); });
    await page.screenshot({ path: `${directory}/payment-${width}.png`, fullPage: true });

    let release; let count = 0; let payload = '';
    await page.route('**/*', async route => {
      const request = route.request();
      if (request.method() === 'POST' && request.headers()['next-action']) {
        count++; payload = request.postData() || '';
        await new Promise(resolve => { release = resolve; });
      }
      await route.continue();
    });
    const dimensions = await submit.evaluate(e => [e.offsetWidth, e.offsetHeight]);
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await expect(submit.locator('[data-loader-size=sm]')).toBeVisible();
    assert.deepEqual(await submit.evaluate(e => [e.offsetWidth, e.offsetHeight]), dimensions);
    assert.ok(payload.includes('QA-TX_1.2'));
    assert.equal(/totalMinor|advanceMinor|remainingMinor/.test(payload), false, 'Browser cannot submit authoritative amounts');
    await expect.poll(() => !!release).toBe(true);
    assert.equal(count, 1);
    await page.screenshot({ path: `${directory}/pending-${width}.png` });
    release();
    await expect(submit).toBeEnabled();
    await expect(payment.getByRole('alert')).toContainText('No payment details were saved and no order was confirmed');
    await expect(page.getByRole('heading', { name: 'Payment Details Submitted', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Your Order Is Confirmed!', exact: true })).toHaveCount(0);
    await page.unroute('**/*');
    await page.route('**/*', route => route.request().method() === 'POST' && route.request().headers()['next-action'] ? route.abort('failed') : route.continue());
    await submit.click();
    await expect(submit).toBeEnabled();
    await expect(payment.getByRole('alert')).toContainText('Payment details could not be submitted');
    await expect(trx).toHaveValue('QA-TX_1.2');
    await page.unroute('**/*');

    // The back button changes the location through actual address selectors.
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.locator('#checkout-district').selectOption('Gazipur');
    await page.locator('#checkout-area').selectOption('Gazipur Sadar');
    await expect(page.locator('[data-summary-advance]')).toHaveText('৳130');
    const outsideTotal = await getTotal();
    await expect(page.locator('[data-summary-remaining]')).toHaveText(`৳${new Intl.NumberFormat('en-BD').format(outsideTotal - 130)}`);
    await page.getByRole('button', { name: 'Continue to Payment', exact: true }).click();
    await expect(payment.locator('[data-required-advance]')).toHaveText('৳130');
    await payment.getByRole('button', { name: 'Copy Amount', exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('130');
    await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: () => Promise.reject(new Error('Test-only clipboard denial')) }));
    await payment.getByRole('button', { name: 'Copy Amount', exact: true }).click();
    await expect(payment.getByText(/Could not copy amount/)).toBeVisible();
    await page.getByRole('button', { name: 'Review Order', exact: true }).click();
    await page.getByRole('button', { name: /Place Order/ }).click();
    await expect(page.getByRole('heading', { name: 'Order not placed', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role=dialog]')).toHaveCount(0);

    const support = page.locator('[data-whatsapp-support]');
    assert.equal(await support.getAttribute('href'), 'https://wa.me/8801632915921');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await expect(support).toBeVisible();
    const r = await support.boundingBox();
    assert.ok(r.width === 44 && r.height === 44);
    if (width < 768) {
      const navigation = page.getByRole('navigation', { name: 'Quick navigation', exact: true });
      if (await navigation.count()) { const nav = await navigation.boundingBox(); assert.ok(r.y + r.height < nav.y, 'Support stays above mobile navigation'); }
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    await context.close();
    results.push({ width, result: 'passed', amounts: [70, 130], copyAmountAndFailure: 'passed', copyNumber: 'disabled: no recipient configured', validation: 'passed', actualPendingAndFailure: 'passed', falseConfirmation: 'prevented', whatsapp: 'passed' });
    console.log(`PASS ${width}px: advance/remaining, provider tabs, clipboard, validation, actual pending/error cleanup, no fake confirmation, WhatsApp and keyboard`);
  }
  await writeFile(`${directory}/verification.json`, JSON.stringify({ origin, results, backend: 'Not connected. Actual server-action unavailability responses and transport failures tested; no payment or order was created.' }, null, 2));
} finally { await browser.close(); }
