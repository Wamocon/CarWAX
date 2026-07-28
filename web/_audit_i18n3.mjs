import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

// 1. Language switcher scroll preservation (desktop)
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));
await page.evaluate(() => window.scrollTo(0, 6000));
await new Promise(r => setTimeout(r, 1200));
const before = await page.evaluate(() => ({ y: window.scrollY, url: location.href }));
// find EN button
const btns = await page.$$('nav[aria-label="Dil / Language"] button');
console.log('switcher buttons found:', btns.length);
if (btns.length) {
  await btns[1].click();
  await new Promise(r => setTimeout(r, 3000));
}
const after = await page.evaluate(() => ({ y: window.scrollY, url: location.href, lang: document.documentElement.lang, h: document.body.scrollHeight }));
console.log('BEFORE', JSON.stringify(before));
console.log('AFTER ', JSON.stringify(after));
await page.screenshot({ path: `${OUT}/switch-after.png` });

// 2. anchor + locale switch: does the hash survive?
await page.goto('http://localhost:3100/tr#paketler', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));
const b2 = await page.evaluate(() => ({ y: window.scrollY, url: location.href }));
const btns2 = await page.$$('nav[aria-label="Dil / Language"] button');
await btns2[2].click();
await new Promise(r => setTimeout(r, 3000));
const a2 = await page.evaluate(() => ({ y: window.scrollY, url: location.href, lang: document.documentElement.lang }));
console.log('HASH BEFORE', JSON.stringify(b2));
console.log('HASH AFTER ', JSON.stringify(a2));

// 3. mobile: is switcher reachable?
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844 });
await m.goto('http://localhost:3100/ru', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));
const vis = await m.evaluate(() => {
  const n = document.querySelector('nav[aria-label="Dil / Language"]');
  if (!n) return 'absent';
  const r = n.getBoundingClientRect();
  const cs = getComputedStyle(n);
  return { w: Math.round(r.width), h: Math.round(r.height), disp: cs.display, vis: cs.visibility };
});
console.log('MOBILE SWITCHER (ru, closed menu):', JSON.stringify(vis));

// 4. Package cards RU: measure card heights + button text wraps
for (const loc of ['tr', 'en', 'ru']) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(`http://localhost:3100/${loc}`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));} });
  await new Promise(r => setTimeout(r, 800));
  const d = await p.evaluate(() => {
    const out = { nav: [], buttons: [], headings: [] };
    document.querySelectorAll('header nav a, header nav button').forEach(a => {
      const r = a.getBoundingClientRect();
      out.nav.push({ t: a.innerText.trim(), w: Math.round(r.width), sw: a.scrollWidth, cw: a.clientWidth });
    });
    document.querySelectorAll('a,button').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (el.scrollWidth > el.clientWidth + 1) out.buttons.push({ t: el.innerText.trim().slice(0,50), sw: el.scrollWidth, cw: el.clientWidth });
    });
    document.querySelectorAll('h1,h2,h3').forEach(h => {
      if (h.scrollWidth > h.clientWidth + 1 || h.scrollHeight > h.clientHeight + 2) {
        const cs = getComputedStyle(h);
        if (cs.overflow !== 'visible' || cs.textOverflow === 'ellipsis')
          out.headings.push({ t: h.innerText.trim().slice(0,60), sw: h.scrollWidth, cw: h.clientWidth, sh: h.scrollHeight, ch: h.clientHeight });
      }
    });
    return out;
  });
  console.log('---', loc, 'overflowing buttons:', JSON.stringify(d.buttons));
  console.log('---', loc, 'clipped headings:', JSON.stringify(d.headings));
  await p.close();
}
await browser.close();
