import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

for (const locale of ['tr', 'en', 'ru']) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`http://localhost:3100/${locale}`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2500));
  const d = await page.evaluate(() => {
    const out = { dashes: [], hero: [], rating: null, counters: [], packages: [] };
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.nodeValue;
      if (!t || !/[\u2013\u2014]/.test(t)) continue;
      const el = n.parentElement;
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      let sec = el.closest('section,header,footer');
      out.dashes.push({ text: t.trim().slice(0, 200), tag: el.tagName, sec: sec ? (sec.id || sec.tagName) : '?' });
    }
    document.querySelectorAll('span.block.overflow-hidden').forEach(el => {
      out.hero.push({ text: el.innerText.trim(), sh: el.scrollHeight, ch: el.clientHeight, w: Math.round(el.getBoundingClientRect().width) });
    });
    const rt = document.querySelector('#reviews, [id*=rating]');
    return out;
  });
  console.log('=====', locale);
  console.log('DASHES:', JSON.stringify(d.dashes, null, 1));
  console.log('HERO MASKS:', JSON.stringify(d.hero));
  await page.screenshot({ path: `${OUT}/hero-${locale}.png` });
  await page.close();
}
await browser.close();
