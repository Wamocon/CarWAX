/**
 * Headless-QA-Sweep.
 *
 * WICHTIG: gegen den Production-Build laufen lassen, nicht gegen `next dev`.
 *   npm run build && PORT=3100 npm start
 *   node scripts/qa.mjs
 *
 * Grund: In headless Chrome scheitert der HMR-WebSocket des Dev-Servers
 * (`ERR_INVALID_HTTP_RESPONSE`). Turbopacks Client-Runtime bootet dann nicht
 * fertig, React hydriert nie, und jede Prüfung meldet Fehler, die es im echten
 * Build nicht gibt. Der Production-Build hat keinen HMR-Socket.
 */
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:3100';
const OUT = resolve('scripts/__screens');
mkdirSync(OUT, { recursive: true });

const LOCALES = ['tr', 'en', 'ru'];
const VIEWPORTS = [
  { id: 'desktop', width: 1600, height: 900 },
  { id: 'tablet', width: 834, height: 1112 },
  { id: 'phone', width: 390, height: 844 },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

let failures = 0;

for (const locale of LOCALES) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    const errors = [];
    const failed = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().includes('favicon')) {
        errors.push(m.text());
      }
    });
    page.on('requestfailed', (r) =>
      failed.push(`${r.url()} :: ${r.failure()?.errorText}`),
    );

    await page.setViewport({
      width: vp.width,
      height: vp.height,
      isMobile: vp.width < 500,
      hasTouch: vp.width < 500,
    });
    await page.goto(`${BASE}/${locale}`, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });
    // Auf den Eintritts-Animationen ausruhen lassen, bevor gemessen wird.
    await new Promise((r) => setTimeout(r, 4200));

    const checks = await page.evaluate(() => {
      const de = document.documentElement;
      return {
        overflow: de.scrollWidth - de.clientWidth,
        // Hydriert? Lenis hängt seine Klasse an <html>, sobald es läuft.
        hydrated: de.className.includes('lenis'),
        // Sind die Eintritts-Animationen wirklich durchgelaufen?
        heroTextVisible:
          getComputedStyle(document.querySelector('.eyebrow')).opacity === '1',
        title: document.title,
      };
    });

    await page.screenshot({
      path: `${OUT}/${locale}-${vp.id}.png`,
      fullPage: false,
    });

    const problems = [];
    if (errors.length) problems.push(`JS: ${errors.slice(0, 3).join(' | ')}`);
    if (failed.length) problems.push(`REQ: ${failed.slice(0, 3).join(' | ')}`);
    if (checks.overflow > 0) problems.push(`H-OVERFLOW ${checks.overflow}px`);
    if (!checks.hydrated) problems.push('NOT HYDRATED');
    if (!checks.heroTextVisible) problems.push('HERO TEXT STUCK AT initial');

    const tag = problems.length ? 'FAIL' : ' ok ';
    if (problems.length) failures++;
    console.log(
      `[${tag}] ${locale}/${vp.id.padEnd(7)} ${problems.join(' · ') || checks.title.slice(0, 58)}`,
    );

    await page.close();
  }
}

await browser.close();
console.log(
  failures ? `\n${failures} Prüfung(en) fehlgeschlagen.` : '\nAlle Prüfungen bestanden.',
);
process.exit(failures ? 1 : 0);
