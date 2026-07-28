import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

// ---------- A: reduced-motion testimonials screenshot ----------
{
  const page = await browser.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => { const s = document.getElementById('yorumlar'); window.scrollTo(0, s.getBoundingClientRect().top + scrollY); });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'shot_rm_1440.png' });
  // count fully visible cards + confirm clipping ancestor
  const d = await page.evaluate(() => {
    const s = document.getElementById('yorumlar');
    const ul = s.querySelector('ul');
    const vw = innerWidth;
    const cards = [...ul.children].map((li, i) => { const r = li.getBoundingClientRect(); return { i, l: Math.round(r.left), r: Math.round(r.right), vis: r.left < vw && r.right > 0 }; });
    let n = ul, clip = null;
    while (n && n !== document.body) { const cs = getComputedStyle(n); if (/hidden|clip|auto|scroll/.test(cs.overflowX)) { clip = n.className + ' overflowX=' + cs.overflowX; break; } n = n.parentElement; }
    return { cards, clip, visible: cards.filter(c => c.vis).length, hidden: cards.filter(c => !c.vis).length };
  });
  console.log('A reduced-motion 1440:', JSON.stringify(d, null, 1));
  await page.close();
}

// ---------- B: full pin sweep, does last card arrive & does pin release ----------
{
  const page = await browser.newPage();
  for (const w of [768, 1024, 1440]) {
    await page.setViewport({ width: w, height: 900 });
    await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 900));
    const res = await page.evaluate(async () => {
      const s = document.getElementById('yorumlar');
      const ul = s.querySelector('ul');
      const spacer = s.querySelector('.pin-spacer') || s.closest('.pin-spacer');
      const top = s.getBoundingClientRect().top + scrollY;
      const h = s.getBoundingClientRect().height;
      const seen = new Set(); const trail = [];
      for (let y = top - 300; y < top + h + 600; y += 60) {
        scrollTo(0, y);
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        [...ul.children].forEach((li, i) => { const r = li.getBoundingClientRect(); if (r.left < innerWidth - 30 && r.right > 30) seen.add(i); });
      }
      // settle
      for (let k = 0; k < 200; k++) await new Promise(r => requestAnimationFrame(r));
      [...ul.children].forEach((li, i) => { const r = li.getBoundingClientRect(); if (r.left < innerWidth - 30 && r.right > 30) seen.add(i); });
      const lastR = ul.children[ul.children.length - 1].getBoundingClientRect();
      const stageAfter = ul.closest('.section').getBoundingClientRect();
      return { sectionH: Math.round(h), seen: [...seen].sort((a, b) => a - b), seenCount: seen.size, finalX: getComputedStyle(ul).transform, lastCard: { l: Math.round(lastR.left), r: Math.round(lastR.right) }, vw: innerWidth, stageTop: Math.round(stageAfter.top), trail };
    });
    console.log(`B pin ${w}px:`, JSON.stringify({ ...res, trail: undefined }));
  }
  await page.close();
}

// ---------- C: menu open then cross the 1280 seam ----------
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1366 });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.click('button[aria-controls="mobile-menu"]');
  await new Promise(r => setTimeout(r, 400));
  const before = await page.evaluate(() => ({ body: getComputedStyle(document.body).overflow, drawer: getComputedStyle(document.getElementById('mobile-menu')).display, burger: getComputedStyle(document.querySelector('button[aria-controls="mobile-menu"]')).display }));
  await page.setViewport({ width: 1366, height: 1024 }); // rotate iPad Pro
  await new Promise(r => setTimeout(r, 600));
  const after = await page.evaluate(() => {
    const y0 = scrollY; scrollTo(0, 1200);
    return { body: getComputedStyle(document.body).overflow, drawer: getComputedStyle(document.getElementById('mobile-menu')).display, drawerHiddenAttr: document.getElementById('mobile-menu').hasAttribute('hidden'), burger: getComputedStyle(document.querySelector('button[aria-controls="mobile-menu"]')).display, scrolledFrom: y0, scrolledTo: scrollY, htmlOverflow: getComputedStyle(document.documentElement).overflow };
  });
  await new Promise(r => setTimeout(r, 500));
  const after2 = await page.evaluate(() => ({ scrollY, bodyOverflow: document.body.style.overflow }));
  console.log('C seam before:', JSON.stringify(before));
  console.log('C seam after :', JSON.stringify(after), JSON.stringify(after2));
  await page.screenshot({ path: 'shot_seam_1366.png' });
  await page.close();
}
await browser.close();
