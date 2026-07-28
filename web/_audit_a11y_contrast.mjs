import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function srgb(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function lum([r, g, b]) {
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}
function ratio(a, b) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
function parseColor(s) {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
function over(fg, bg) {
  const a = fg[3];
  return [
    Math.round(fg[0] * a + bg[0] * (1 - a)),
    Math.round(fg[1] * a + bg[1] * (1 - a)),
    Math.round(fg[2] * a + bg[2] * (1 - a)),
  ];
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--force-device-scale-factor=1'],
});

const findings = [];

async function run(theme, width, height, locale = 'tr') {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:3100/${locale}`, { waitUntil: 'networkidle0' });
  await page.evaluate((t) => {
    localStorage.setItem('carwax-theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  await sleep(400);
  // trigger all reveals
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.7);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));
  });
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
  await sleep(700);

  const docH = await page.evaluate(() => document.body.scrollHeight);
  const results = [];
  for (let y = 0; y < docH; y += height) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(600);

    // tag visible text leaf elements
    const els = await page.evaluate(() => {
      const out = [];
      let i = 0;
      document.querySelectorAll('[data-aidx]').forEach((e) => e.removeAttribute('data-aidx'));
      for (const el of document.querySelectorAll('body *')) {
        if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'NOSCRIPT'].includes(el.tagName)) continue;
        // must have direct text
        let txt = '';
        for (const n of el.childNodes) if (n.nodeType === 3) txt += n.nodeValue;
        txt = txt.trim();
        if (txt.length < 2) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        if (parseFloat(cs.opacity) < 0.9) continue;
        if (el.closest('.sr-only') || cs.clip === 'rect(0px, 0px, 0px, 0px)') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        if (r.bottom < 4 || r.top > innerHeight - 4) continue;
        if (r.right < 0 || r.left > innerWidth) continue;
        // ancestor opacity
        let anc = el, faded = false;
        while (anc && anc !== document.body) {
          if (parseFloat(getComputedStyle(anc).opacity) < 0.9) { faded = true; break; }
          anc = anc.parentElement;
        }
        if (faded) continue;
        el.setAttribute('data-aidx', String(i));
        out.push({
          i,
          txt: txt.slice(0, 60),
          color: cs.color,
          fontSize: parseFloat(cs.fontSize),
          fontWeight: cs.fontWeight,
          cls: el.className.toString().slice(0, 80),
          tag: el.tagName,
          rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        });
        i++;
      }
      return out;
    });
    if (!els.length) continue;

    // hide glyphs -> pure background plate
    await page.addStyleTag({
      id: 'a11y-hide',
      content: `*, *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }`,
    });
    await sleep(250);
    const b64 = await page.screenshot({ encoding: 'base64', captureBeyondViewport: false });
    await page.evaluate(() => document.querySelectorAll('#a11y-hide, style[id="a11y-hide"]').forEach((s) => s.remove()));
    await page.evaluate(() => {
      [...document.querySelectorAll('style')].forEach((s) => {
        if (s.textContent.includes('-webkit-text-fill-color: transparent !important')) s.remove();
      });
    });

    const bgs = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const out = {};
      for (const el of document.querySelectorAll('[data-aidx]')) {
        const r = el.getBoundingClientRect();
        const x = Math.max(0, Math.round(r.x)), y = Math.max(0, Math.round(r.y));
        const w = Math.min(Math.round(r.width), img.width - x);
        const h = Math.min(Math.round(r.height), img.height - y);
        if (w <= 0 || h <= 0) continue;
        const d = ctx.getImageData(x, y, w, h).data;
        // modal color (quantized) = the dominant background
        const map = new Map();
        for (let p = 0; p < d.length; p += 4) {
          const k = ((d[p] >> 3) << 10) | ((d[p + 1] >> 3) << 5) | (d[p + 2] >> 3);
          const e = map.get(k) || [0, 0, 0, 0];
          e[0] += d[p]; e[1] += d[p + 1]; e[2] += d[p + 2]; e[3]++;
          map.set(k, e);
        }
        let best = null;
        for (const e of map.values()) if (!best || e[3] > best[3]) best = e;
        // also worst-case: the pixel in the box with luminance closest to text color
        out[el.getAttribute('data-aidx')] = {
          modal: [Math.round(best[0] / best[3]), Math.round(best[1] / best[3]), Math.round(best[2] / best[3])],
          n: best[3],
          total: d.length / 4,
        };
      }
      return out;
    }, b64);

    for (const e of els) {
      const bg = bgs[String(e.i)];
      if (!bg) continue;
      const fg = parseColor(e.color);
      if (!fg) continue;
      const fgC = fg[3] < 1 ? over(fg, bg.modal) : [fg[0], fg[1], fg[2]];
      const cr = ratio(fgC, bg.modal);
      const large = e.fontSize >= 24 || (e.fontSize >= 18.66 && parseInt(e.fontWeight) >= 700);
      const need = large ? 3 : 4.5;
      if (cr < need) {
        results.push({
          theme, width, y,
          txt: e.txt, tag: e.tag, cls: e.cls,
          color: e.color, fontSize: e.fontSize, weight: e.fontWeight,
          bg: `rgb(${bg.modal.join(',')})`,
          ratio: Math.round(cr * 100) / 100,
          need,
          coverage: Math.round((bg.n / bg.total) * 100),
        });
      }
    }
  }
  await page.close();
  return results;
}

for (const theme of ['dark', 'light']) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const r = await run(theme, w, h);
    findings.push(...r);
    console.log(theme, w, '->', r.length, 'fails');
  }
}

writeFileSync(OUT + '/contrast.json', JSON.stringify(findings, null, 2));
await browser.close();
console.log('done', findings.length);
