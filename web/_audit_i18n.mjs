import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

const report = {};

for (const locale of ['tr', 'en', 'ru']) {
  for (const vp of [{ w: 390, h: 844, n: 'mobile' }, { w: 1440, h: 900, n: 'desktop' }]) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:3100/${locale}`, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));
    // scroll through to trigger reveals
    await page.evaluate(async () => {
      const H = document.body.scrollHeight;
      for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 300));
    });
    await new Promise(r => setTimeout(r, 800));

    const data = await page.evaluate(() => {
      const res = { dashes: [], overflow: [], clipped: [], docScrollW: document.documentElement.scrollWidth, winW: window.innerWidth, lang: document.documentElement.lang, text: document.body.innerText };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const t = n.nodeValue;
        if (!t || !/[\u2013\u2014]/.test(t)) continue;
        const el = n.parentElement;
        if (!el) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        res.dashes.push({ text: t.trim().slice(0, 160), tag: el.tagName, cls: (el.className || '').toString().slice(0, 80) });
      }
      // horizontal overflow elements
      document.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return;
        if (r.right > window.innerWidth + 2 || r.left < -2) {
          // only report if it's not an intentional scroller ancestor
          res.overflow.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 70), left: Math.round(r.left), right: Math.round(r.right), text: (el.innerText || '').trim().slice(0, 60) });
        }
        // text clipping: overflow hidden + content taller/wider than box
        if ((cs.overflow === 'hidden' || cs.overflowY === 'hidden' || cs.overflowX === 'hidden')) {
          if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0 && cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') {
            const txt = (el.innerText || '').trim();
            if (txt) res.clipped.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 70), sh: el.scrollHeight, ch: el.clientHeight, text: txt.slice(0, 80) });
          }
        }
      });
      return res;
    });
    report[`${locale}-${vp.n}`] = data;
    fs.writeFileSync(`${OUT}/text-${locale}-${vp.n}.txt`, data.text, 'utf8');
    await page.close();
  }
}

fs.writeFileSync(`${OUT}/i18n-report.json`, JSON.stringify(report, (k, v) => k === 'text' ? undefined : v, 2), 'utf8');
console.log('done');
await browser.close();
