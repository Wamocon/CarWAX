import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

for (const loc of ['tr', 'en', 'ru']) {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 1000 });
  await p.goto(`http://localhost:3100/${loc}`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await p.evaluate(async () => { const H=document.body.scrollHeight; for(let y=0;y<H;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));} });
  await new Promise(r => setTimeout(r, 700));
  for (const [id, name] of [['paketler','pkg'], ['subeler','branches'], ['hizmetler','svc']]) {
    const el = await p.$(`#${id}`);
    if (!el) { console.log(loc, id, 'MISSING'); continue; }
    await p.evaluate(i => document.getElementById(i).scrollIntoView(), id);
    await new Promise(r => setTimeout(r, 900));
    try { await el.screenshot({ path: `${OUT}/${name}-${loc}.png`, captureBeyondViewport: false }); } catch(e) { console.log('shot fail', loc, id, e.message); }
  }
  // package card metrics
  const m = await p.evaluate(() => {
    const s = document.getElementById('paketler');
    if (!s) return null;
    const cards = [...s.querySelectorAll('article, li')].map(c => {
      const r = c.getBoundingClientRect();
      return { h: Math.round(r.height), w: Math.round(r.width), t: (c.innerText||'').split('\n')[0].slice(0,30) };
    });
    return cards.slice(0, 12);
  });
  console.log('===', loc, JSON.stringify(m));
  await p.close();
}
await browser.close();
