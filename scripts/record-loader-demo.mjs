import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { chromium, expect } from '@playwright/test';

const origin = process.env.CLAUDE_PREVIEW_URL || 'http://localhost:3001';
const directory = process.env.LOADER_ARTIFACT_DIR || 'artifacts/loader-visibility/local';
await mkdir(directory, { recursive: true });
const access = process.env.ATTIRES_BROWSER_ACCESS_FILE
  ? JSON.parse(await readFile(process.env.ATTIRES_BROWSER_ACCESS_FILE, 'utf8')) : null;
const proxy = new URL(origin).protocol === 'https:' && (process.env.HTTPS_PROXY || process.env.HTTP_PROXY);
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'],
  ...(proxy ? { proxy: { server: new URL(proxy).origin } } : {}),
});
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 950 },
    recordVideo: { dir: directory, size: { width: 390, height: 950 } },
    ...(access ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': access.secret } } : {}),
  });
  const started = performance.now();
  const page = await context.newPage();
  await page.goto(origin + '/motion-preview', { waitUntil: 'networkidle' });
  const button = page.getByRole('button', { name: 'Test Loading Animation', exact: true });
  const offset = (performance.now() - started) / 1000;
  await button.click();
  const overlay = page.locator('[data-aa-loader=overlay]');
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveCount(0, { timeout: 5000 });
  await expect(button).toBeFocused();
  const video = page.video();
  await context.close();
  const source = await video.path();
  await video.saveAs(`${directory}/demo-complete.webm`);
  const encode = spawnSync('/usr/bin/ffmpeg', ['-y', '-ss', String(offset), '-i', source, '-t', '3',
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${directory}/loading-demo-3s.mp4`], { encoding: 'utf8' });
  if (encode.status !== 0) throw new Error('Demonstration video encoding failed');
  await writeFile(`${directory}/recording.json`, JSON.stringify({ origin, route: '/motion-preview', durationSeconds: 3, source: 'actual browser recording', reducedMotion: false, artificialDelay: 'three-second demo route only' }, null, 2));
  console.log('PASS recorded and encoded actual three-second loader demonstration');
} finally { await browser.close(); }
