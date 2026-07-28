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

      /*
        Überlauf NICHT über scrollWidth messen.

        `overflow-x: clip` auf <html> und <body> verbirgt genau den Überlauf,
        den wir suchen: scrollWidth meldet dann sauber, während ein Element
        rechts aus dem Bild ragt. Genau so ist der Menüknopf einmal auf einem
        390px-Telefon nach 384–428px gerutscht, ohne dass die Prüfung anschlug.

        Deshalb jedes sichtbare Element einzeln gegen die Fensterbreite messen.
        Zwei Zugeständnisse: 1px Toleranz gegen Rundung, und Elemente, die
        bewusst quer aus dem Bild laufen, sind ausgenommen (die Zitatbahn).
      */
      const w = window.innerWidth;
      const spill = [];

      /*
        Ein Element ragt nur dann WIRKLICH aus dem Bild, wenn es kein Vorfahr
        vorher abschneidet. Die Farbwolken liegen mit Absicht weit außerhalb
        und stecken in `.aurora { overflow: hidden }`; ohne diese Prüfung
        meldet jede Seite drei Fehlalarme und man gewöhnt sich das Hinsehen ab.

        Die Kette endet BEWUSST vor <html>/<body>: die tragen `overflow-x: clip`,
        und genau deren Verbergen wollen wir ja umgehen.
      */
      const clippedByAncestor = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p);
          if (/hidden|clip|auto|scroll/.test(o.overflowX + o.overflow)) return true;
        }
        return false;
      };

      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('#yorumlar')) continue; // Querbahn läuft absichtlich hinaus
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (cs.position === 'fixed') continue; // Schwebeknöpfe, Kopfbalken, Wolken
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right <= w + 1 && r.left >= -1) continue;
        if (clippedByAncestor(el)) continue;

        const cls =
          typeof el.className === 'string' && el.className
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : '';
        spill.push(
          `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls} ` +
            `${Math.round(r.left)}–${Math.round(r.right)}`,
        );
        if (spill.length >= 3) break;
      }

      // Sind die Eintritts-Animationen wirklich durchgelaufen? Die Hero-Zeilen
      // starten maskiert auf translateY(102%) und müssen am Ende bei 0 stehen.
      // Vorher hing diese Prüfung an `.eyebrow` — das Element gibt es im Hero
      // nicht mehr, die Prüfung traf ein fremdes und ging still durch.
      const heroLine = document.querySelector('h1.display span > span');
      const heroBox = heroLine && heroLine.getBoundingClientRect();
      const h1Box = document.querySelector('h1.display')?.getBoundingClientRect();

      /*
        Bemalte Rasterbehälter mit unvollständiger letzter Reihe.

        `gap-px bg-hairline` lässt die Karten sich aus einer gefärbten Fläche
        ausstanzen. Geht das Raster auf, sieht es aus wie eine Tabelle. Bleibt
        eine Zelle leer, sieht der Besucher keine Lücke, sondern den Behälter:
        einen grauen Block. Genau so ist es bei den Leistungen und bei den
        Produkten passiert, und es fiel keiner Prüfung auf, weil die Seite
        technisch fehlerfrei war.

        Spannen werden mitgezählt, sonst meldet die Marine-Strecke mit ihrer
        doppelt breiten Kachel einen Fehlalarm.
      */
      const paintedGaps = [];
      for (const grid of document.querySelectorAll('main ul, main ol, main div')) {
        const g = getComputedStyle(grid);
        if (g.display !== 'grid') continue;
        const cols = g.gridTemplateColumns.split(' ').filter(Boolean).length;
        if (cols < 2) continue;
        if (g.backgroundColor === 'rgba(0, 0, 0, 0)' || g.backgroundColor === 'transparent')
          continue;

        let units = 0;
        for (const c of grid.children) {
          if (getComputedStyle(c).display === 'none') continue;
          const m = getComputedStyle(c).gridColumn.match(/span (\d+)/);
          units += m ? Number(m[1]) : 1;
        }
        const empty = (cols - (units % cols)) % cols;
        if (empty > 0) {
          const sec = grid.closest('section');
          paintedGaps.push(
            `${sec?.id || '?'}: ${units}/${cols} -> ${empty} leer`,
          );
        }
      }

      return {
        spill,
        paintedGaps,
        hydrated: de.className.includes('lenis'),
        heroTextVisible: Boolean(
          heroLine &&
            getComputedStyle(heroLine).opacity === '1' &&
            heroBox.height > 0 &&
            // Noch in der Maske geparkt heißt: unterhalb der eigenen Zeile.
            h1Box &&
            heroBox.top < h1Box.bottom,
        ),
        // Die Sektionen, die es geben MUSS. Fällt eine weg, weil ein Umbau
        // sie zerlegt hat, meldet das hier statt erst der Kunde.
        missingSections: [
          'hizmetler',
          'paketler',
          'yorumlar',
          'degerlendirme',
          'marine',
          'urunler',
          'subeler',
          'harita',
          'sorular',
          'iletisim',
        ].filter((id) => !document.getElementById(id)),
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
    if (checks.spill.length)
      problems.push(`AUS DEM BILD: ${checks.spill.join(' | ')}`);
    if (checks.paintedGaps.length)
      problems.push('GRAUE LEERZELLE: ' + checks.paintedGaps.join(' | '));
    if (!checks.hydrated) problems.push('NOT HYDRATED');
    if (!checks.heroTextVisible) problems.push('HERO TEXT STUCK AT initial');
    if (checks.missingSections.length)
      problems.push(`SEKTION FEHLT: ${checks.missingSections.join(', ')}`);

    const tag = problems.length ? 'FAIL' : ' ok ';
    if (problems.length) failures++;
    console.log(
      `[${tag}] ${locale}/${vp.id.padEnd(7)} ${problems.join(' · ') || checks.title.slice(0, 58)}`,
    );

    await page.close();
  }
}

/*
  Durchgang mit reduzierter Bewegung.

  Diese Klasse von Fehlern ist im normalen Sweep unsichtbar und war deshalb
  lange da: Animationen setzen ihren Anfangszustand in JavaScript, und wenn
  der Effekt bei `prefers-reduced-motion` gar nicht erst anläuft, bleibt der
  Inhalt in diesem Anfangszustand hängen. Konkret gefunden wurden sieben von
  elf Kundenstimmen, die ohne Scrollbereich hinter einem `overflow-hidden`
  eingesperrt waren, und zwei Bildunterschriften, die deckungsgleich
  übereinander lagen und unlesbaren Mischsatz ergaben.

  Wer reduzierte Bewegung einstellt, bekommt weniger Bewegung. Nicht weniger
  Inhalt.
*/
{
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: 'reduce' },
  ]);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`${BASE}/tr`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));

  const rm = await page.evaluate(() => {
    const track = document.querySelector('#yorumlar ul');
    const after = document.querySelector('[data-cap="after"]');
    const before = document.querySelector('[data-cap="before"]');
    const gloss = document.querySelector('#gloss-scroll-h')?.closest('section');
    return {
      overflow: track ? getComputedStyle(track).overflowX : 'kein Track',
      overWide: track ? track.scrollWidth > track.clientWidth + 1 : false,
      after: after ? getComputedStyle(after).opacity : '?',
      before: before ? getComputedStyle(before).opacity : '?',
      glossH: gloss ? Math.round(gloss.getBoundingClientRect().height) : 0,
      vh: window.innerHeight,
    };
  });

  const problems = [];
  if (rm.overWide && !['auto', 'scroll'].includes(rm.overflow))
    problems.push(`ZITATE UNERREICHBAR (overflow-x=${rm.overflow})`);
  if (rm.after !== '0' || rm.before !== '1')
    problems.push(`BILDUNTERSCHRIFTEN ÜBERDRUCKT (${rm.before}/${rm.after})`);
  if (rm.glossH > rm.vh * 1.4)
    problems.push(`LEERE BAHN ${rm.glossH}px bei ${rm.vh}px Sichtfeld`);

  if (problems.length) failures++;
  console.log(
    `[${problems.length ? 'FAIL' : ' ok '}] reduzierte Bewegung   ${
      problems.join(' · ') || 'Inhalt vollständig erreichbar'
    }`,
  );
  await page.close();
}

await browser.close();
console.log(
  failures ? `\n${failures} Prüfung(en) fehlgeschlagen.` : '\nAlle Prüfungen bestanden.',
);
process.exit(failures ? 1 : 0);
