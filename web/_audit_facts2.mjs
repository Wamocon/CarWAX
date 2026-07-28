import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

for (const loc of ['tr', 'en']) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:3100/${loc}`, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  });
  await new Promise(r => setTimeout(r, 3500));
  const box = await page.evaluate(() => {
    const cs = [...document.querySelectorAll('section')].find(s => s.querySelector('number-flow-react'));
    cs.scrollIntoView({ block: 'center' });
    return true;
  });
  await new Promise(r => setTimeout(r, 2500));
  const vals = await page.evaluate(() => {
    return [...document.querySelectorAll('number-flow-react')].map(n => {
      const sr = n.shadowRoot;
      const txt = sr ? (sr.textContent || '').replace(/\s+/g, '') : 'NO-SHADOW';
      return { aria: n.getAttribute('aria-label'), shadow: txt.slice(0, 40), light: (n.textContent||'').trim().slice(0,40) };
    });
  });
  console.log('==', loc, JSON.stringify(vals));
  const el = await page.evaluateHandle(() => [...document.querySelectorAll('section')].find(s => s.querySelector('number-flow-react')));
  await el.asElement().screenshot({ path: `${OUT}/counters-${loc}.png` });
  await page.close();
}
await browser.close();
