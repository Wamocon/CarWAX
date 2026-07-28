import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const LOCALE = process.argv[2] || 'tr';
const RM = process.argv[3] === 'rm';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
if (RM) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

for (const w of [360, 640, 767, 768, 834, 1024, 1280, 1440, 1920]) {
  await page.setViewport({ width: w, height: 900 });
  await page.goto(`http://localhost:3100/${LOCALE}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 900));

  // scroll to testimonials
  await page.evaluate(() => {
    const s = document.getElementById('yorumlar');
    window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 100);
  });
  await new Promise((r) => setTimeout(r, 900));

  const info = await page.evaluate(() => {
    const s = document.getElementById('yorumlar');
    const ul = s.querySelector('ul');
    const cs = getComputedStyle(ul);
    const lis = [...ul.children];
    const vw = innerWidth;
    const stage = ul.closest('.section');
    const rects = lis.map(li => { const r = li.getBoundingClientRect(); return { l: +r.left.toFixed(0), r: +r.right.toFixed(0) }; });
    return {
      overflowX: cs.overflowX,
      trackScrollW: ul.scrollWidth, trackClientW: ul.clientWidth,
      overhang: ul.scrollWidth - ul.clientWidth,
      canUserScroll: cs.overflowX === 'auto' || cs.overflowX === 'scroll',
      stageOverflow: stage ? getComputedStyle(stage).overflow : null,
      pinSpacer: !!s.querySelector('.pin-spacer') || (s.parentElement && s.parentElement.classList.contains('pin-spacer')),
      sectionH: +s.getBoundingClientRect().height.toFixed(0),
      transform: cs.transform,
      nCards: lis.length,
      offscreenRight: rects.filter(x => x.l >= vw).length,
      firstL: rects[0].l, lastR: rects[rects.length - 1].r, vw,
      docH: document.documentElement.scrollHeight,
    };
  });
  console.log(`\n== ${LOCALE} ${w}px rm=${RM}`, JSON.stringify(info));

  // Now scroll through the whole pin and check release + how many cards become visible
  if (!RM) {
    const sweep = await page.evaluate(async () => {
      const s = document.getElementById('yorumlar');
      const ul = s.querySelector('ul');
      const top = s.getBoundingClientRect().top + scrollY;
      const seen = new Set();
      const steps = [];
      for (let y = top - 200; y < top + 3500; y += 100) {
        window.scrollTo(0, y);
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        [...ul.children].forEach((li, i) => { const r = li.getBoundingClientRect(); if (r.left < innerWidth - 20 && r.right > 20) seen.add(i); });
        steps.push({ y, x: getComputedStyle(ul).transform, top: +s.getBoundingClientRect().top.toFixed(0) });
      }
      return { seenCount: seen.size, seen: [...seen].sort((a, b) => a - b), last: steps[steps.length - 1] };
    });
    console.log('   sweep:', JSON.stringify(sweep));
  }
}
await browser.close();
