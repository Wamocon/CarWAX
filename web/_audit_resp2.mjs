import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const WIDTHS = [320, 360, 390, 414, 480, 640, 768, 834, 1024, 1279, 1280, 1440, 1920];
const LOCALE = process.argv[2] || 'tr';
const HEIGHT = +(process.argv[3] || 900);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
});
const page = await browser.newPage();

for (const w of WIDTHS) {
  await page.setViewport({ width: w, height: HEIGHT });
  await page.goto(`http://localhost:3100/${LOCALE}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 500));

  // open menu if burger visible
  const burgerVisible = await page.evaluate(() => {
    const b = document.querySelector('button[aria-controls="mobile-menu"]');
    return b ? getComputedStyle(b).display !== 'none' : false;
  });
  let menuInfo = null;
  if (burgerVisible) {
    await page.click('button[aria-controls="mobile-menu"]');
    await new Promise((r) => setTimeout(r, 400));
    menuInfo = await page.evaluate(() => {
      const vw = innerWidth, vh = innerHeight;
      const d = document.getElementById('mobile-menu');
      const nav = d.querySelector('nav');
      const items = [...d.querySelectorAll('a')].map(a => {
        const r = a.getBoundingClientRect();
        return { txt: a.textContent.trim().slice(0, 24), t: +r.top.toFixed(0), b: +r.bottom.toFixed(0), l: +r.left.toFixed(0), rr: +r.right.toFixed(0) };
      });
      const lang = d.querySelector('nav > div:last-child');
      const lr = lang ? lang.getBoundingClientRect() : null;
      const over = [];
      d.querySelectorAll('*').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.right - vw > 1 || -r.left > 1) over.push({ tag: el.tagName + '.' + String(el.className).slice(0, 40), l: +r.left.toFixed(1), rr: +r.right.toFixed(1) });
      });
      return {
        vh, navScrollH: nav.scrollHeight, navClientH: nav.clientHeight,
        canScroll: nav.scrollHeight > nav.clientHeight,
        contentBottom: Math.max(...[...nav.children].map(c => c.getBoundingClientRect().bottom)).toFixed(0),
        langBottom: lr ? +lr.bottom.toFixed(0) : null,
        langVisible: lr ? (lr.bottom <= vh && lr.top >= 0) : null,
        firstTop: items[0]?.t, lastBottom: items[items.length - 1]?.b,
        overflow: over,
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    });
  }

  // grids
  const grids = await page.evaluate(() => {
    const g = (sel) => {
      const c = document.querySelector(sel);
      if (!c) return null;
      const kids = [...c.children].filter(k => getComputedStyle(k).display !== 'none');
      const rows = {};
      kids.forEach(k => {
        const r = k.getBoundingClientRect();
        const key = Math.round(r.top);
        (rows[key] ||= []).push(+r.width.toFixed(0));
      });
      const rowList = Object.entries(rows).sort((a, b) => a[0] - b[0]).map(([, v]) => v.length);
      return { n: kids.length, rows: rowList, widths: [...new Set(kids.map(k => Math.round(k.getBoundingClientRect().width)))] };
    };
    return {
      packages: g('#paketler .grid') || g('#paketler ul'),
      services: g('#hizmetler .grid') || g('#hizmetler ul'),
      marine: g('#marine .grid') || g('#marine ul'),
    };
  });

  console.log(`\n### ${LOCALE} ${w}x${HEIGHT} burger=${burgerVisible}`);
  if (menuInfo) console.log('  menu:', JSON.stringify(menuInfo));
  console.log('  grids:', JSON.stringify(grids));
}
await browser.close();
