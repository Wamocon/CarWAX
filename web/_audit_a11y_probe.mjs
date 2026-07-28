import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function srgb(c) { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
function lum([r, g, b]) { return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b); }
function ratio(a, b) { const l1 = lum(a), l2 = lum(b); return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100; }
function parseColor(s) { const m = s.match(/rgba?\(([^)]+)\)/); const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
function over(fg, bg) { const a = fg[3]; return [Math.round(fg[0] * a + bg[0] * (1 - a)), Math.round(fg[1] * a + bg[1] * (1 - a)), Math.round(fg[2] * a + bg[2] * (1 - a))]; }

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

async function probe({ theme, width, height, scrollTo = 0, selectors, shots = [], tag }) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
  await sleep(900);
  if (scrollTo) {
    await page.evaluate(async (sel) => {
      document.querySelector(sel)?.scrollIntoView({ block: 'center', behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 1200));
    }, scrollTo);
    await sleep(1500);
  }
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
  await sleep(600);

  // pause aurora animations for deterministic sampling
  const rows = [];
  for (const sel of selectors) {
    const els = await page.$$(sel);
    for (let k = 0; k < Math.min(els.length, 4); k++) {
      const info = await els[k].evaluate((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { color: cs.color, fs: parseFloat(cs.fontSize), fw: cs.fontWeight, text: (el.innerText || '').trim().slice(0, 40), rect: { x: r.x, y: r.y, w: r.width, h: r.height } };
      });
      if (info.rect.w < 2) continue;
      rows.push({ sel, k, ...info });
    }
  }

  // hide glyphs, screenshot
  const styleHandle = await page.addStyleTag({ content: `*,*::before,*::after{ -webkit-text-fill-color: transparent !important; text-shadow:none !important; }` });
  await sleep(300);
  const b64 = await page.screenshot({ encoding: 'base64' });
  await styleHandle.evaluate((s) => s.remove());
  await sleep(200);

  const bgs = await page.evaluate(async ({ b64, rows }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const dpr = img.width / window.innerWidth;
    return rows.map((r) => {
      const x = Math.round(r.rect.x * dpr), y = Math.round(r.rect.y * dpr);
      const w = Math.round(r.rect.w * dpr), h = Math.round(r.rect.h * dpr);
      const d = ctx.getImageData(Math.max(0, x), Math.max(0, y), Math.max(1, Math.min(w, img.width - x)), Math.max(1, Math.min(h, img.height - y))).data;
      // full histogram: report min-lum and max-lum pixel plus mean
      let mn = null, mx = null, sum = [0, 0, 0], n = 0;
      const L = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
      for (let p = 0; p < d.length; p += 4) {
        const px = [d[p], d[p + 1], d[p + 2]];
        if (!mn || L(px) < L(mn)) mn = px;
        if (!mx || L(px) > L(mx)) mx = px;
        sum[0] += px[0]; sum[1] += px[1]; sum[2] += px[2]; n++;
      }
      return { mean: sum.map((v) => Math.round(v / n)), min: mn, max: mx };
    });
  }, { b64, rows });

  const out = rows.map((r, i) => {
    const bg = bgs[i];
    const fg = parseColor(r.color);
    const mk = (b) => { const f = fg[3] < 1 ? over(fg, b) : [fg[0], fg[1], fg[2]]; return ratio(f, b); };
    return {
      tag, theme, width, sel: r.sel, k: r.k, text: r.text, fs: r.fs, fw: r.fw, color: r.color,
      bgMean: `rgb(${bg.mean})`, bgMin: `rgb(${bg.min})`, bgMax: `rgb(${bg.max})`,
      crMean: mk(bg.mean), crWorstDark: mk(bg.min), crWorstLight: mk(bg.max),
      need: (r.fs >= 24 || (r.fs >= 18.66 && parseInt(r.fw) >= 700)) ? 3 : 4.5,
    };
  });

  for (const s of shots) {
    const el = await page.$(s.sel);
    if (el) { try { await el.screenshot({ path: `${OUT}/${s.name}.png` }); } catch (e) { } }
    else if (s.clip) await page.screenshot({ path: `${OUT}/${s.name}.png`, clip: s.clip });
  }
  await page.close();
  return out;
}

const all = [];

// header nav + language switcher over the hero photo, both themes
for (const theme of ['light', 'dark']) {
  all.push(...await probe({
    tag: 'header-over-hero', theme, width: 1440, height: 900,
    selectors: ['header nav[aria-label="Ana menü"] a', 'header button[lang="en"]', 'header button[lang="ru"]', 'header button[lang="tr"]'],
    shots: [{ name: `header-${theme}`, clip: { x: 0, y: 0, width: 1440, height: 110 } }],
  }));
}

// header after scroll (solid bar)
for (const theme of ['light', 'dark']) {
  all.push(...await probe({
    tag: 'header-solid', theme, width: 1440, height: 900, scrollTo: '#urunler',
    selectors: ['header nav[aria-label="Ana menü"] a', 'header button[lang="en"]'],
    shots: [{ name: `header-solid-${theme}`, clip: { x: 0, y: 0, width: 1440, height: 110 } }],
  }));
}

// testimonials source line + faint text on wash
for (const theme of ['light', 'dark']) {
  all.push(...await probe({
    tag: 'testimonials', theme, width: 1440, height: 900, scrollTo: '#yorumlar',
    selectors: ['.text-fg-faint'],
    shots: [{ name: `testimonials-${theme}`, clip: { x: 0, y: 0, width: 1440, height: 900 } }],
  }));
}

writeFileSync(OUT + '/probe.json', JSON.stringify(all, null, 2));
for (const r of all) console.log(`${r.tag} ${r.theme} ${r.sel.slice(0, 32)}#${r.k} "${r.text.slice(0, 22)}" fs=${r.fs} ${r.color} mean=${r.bgMean} CR=${r.crMean} (need ${r.need})`);
await browser.close();
