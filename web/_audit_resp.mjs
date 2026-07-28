import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const WIDTHS = [320, 360, 390, 414, 480, 640, 768, 834, 1024, 1280, 1440, 1920];
const THEMES = ['dark', 'light'];
const LOCALE = process.argv[2] || 'tr';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const out = [];
const page = await browser.newPage();

for (const w of WIDTHS) {
  for (const theme of THEMES) {
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:3100/${LOCALE}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
    await new Promise((r) => setTimeout(r, 700));

    const res = await page.evaluate(() => {
      const vw = window.innerWidth;
      const bad = [];
      const path = (el) => {
        const parts = [];
        let n = el;
        while (n && n.nodeType === 1 && parts.length < 5) {
          let s = n.tagName.toLowerCase();
          if (n.id) { s += '#' + n.id; parts.unshift(s); break; }
          const cls = (n.className && typeof n.className === 'string')
            ? '.' + n.className.trim().split(/\s+/).slice(0, 4).join('.') : '';
          parts.unshift(s + cls);
          n = n.parentElement;
        }
        return parts.join(' > ');
      };
      document.querySelectorAll('*').forEach((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        const overR = r.right - vw;
        const overL = -r.left;
        if (overR > 1 || overL > 1) {
          bad.push({
            sel: path(el),
            left: +r.left.toFixed(1),
            right: +r.right.toFixed(1),
            width: +r.width.toFixed(1),
            overR: +overR.toFixed(1),
            overL: +overL.toFixed(1),
            inTrack: !!el.closest('#yorumlar'),
          });
        }
      });
      return { vw, bad };
    });

    // Header specifics
    const header = await page.evaluate(() => {
      const h = document.querySelector('header');
      if (!h) return null;
      const imgs = [...h.querySelectorAll('img')].map((i) => {
        const r = i.getBoundingClientRect();
        const cs = getComputedStyle(i);
        return {
          src: i.getAttribute('src'),
          cls: i.className,
          disp: cs.display,
          w: +r.width.toFixed(2),
          hh: +r.height.toFixed(2),
          ratio: r.height ? +(r.width / r.height).toFixed(3) : null,
          natural: i.naturalWidth + 'x' + i.naturalHeight,
          natRatio: i.naturalHeight ? +(i.naturalWidth / i.naturalHeight).toFixed(3) : null,
        };
      });
      const burger = h.querySelector('button[aria-controls="mobile-menu"]');
      const br = burger ? burger.getBoundingClientRect() : null;
      const lang = h.querySelector('[class*="hidden"][class*="sm:block"]');
      const lr = lang ? lang.getBoundingClientRect() : null;
      const bar = h.querySelector('.wrap');
      const barR = bar ? bar.getBoundingClientRect() : null;
      return {
        imgs,
        burger: br && { l: +br.left.toFixed(1), r: +br.right.toFixed(1), over: +(br.right - window.innerWidth).toFixed(1) },
        lang: lr && { l: +lr.left.toFixed(1), r: +lr.right.toFixed(1), w: +lr.width.toFixed(1) },
        bar: barR && { l: +barR.left.toFixed(1), r: +barR.right.toFixed(1) },
        headerH: +h.getBoundingClientRect().height.toFixed(1),
      };
    });

    out.push({ w, theme, vw: res.vw, bad: res.bad, header });
    const nonTrack = res.bad.filter((b) => !b.inTrack);
    console.log(`${LOCALE} ${w}px ${theme}: overflow=${res.bad.length} (nonTrack=${nonTrack.length}) logoRatio=${header?.imgs.filter(i=>i.disp!=='none').map(i=>i.ratio).join(',')}`);
    if (nonTrack.length) {
      nonTrack.slice(0, 8).forEach((b) => console.log(`    OVER right+${b.overR} left+${b.overL} w=${b.width}  ${b.sel}`));
    }
  }
}

fs.writeFileSync(`_audit_resp_${LOCALE}.json`, JSON.stringify(out, null, 1));
await browser.close();
