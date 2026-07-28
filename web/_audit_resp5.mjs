import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

// D: does the page behind the open drawer stay put?
{
  const page = await browser.newPage();
  for (const [w, h] of [[390, 844], [360, 640], [768, 1024]]) {
    await page.setViewport({ width: w, height: h });
    await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 700));
    await page.click('button[aria-controls="mobile-menu"]');
    await new Promise(r => setTimeout(r, 400));
    const y0 = await page.evaluate(() => scrollY);
    // real wheel over the drawer
    await page.mouse.move(w / 2, h / 2);
    for (let i = 0; i < 12; i++) { await page.mouse.wheel({ deltaY: 300 }); await new Promise(r => setTimeout(r, 40)); }
    await new Promise(r => setTimeout(r, 900));
    const after = await page.evaluate(() => ({ y: scrollY, bodyOv: getComputedStyle(document.body).overflow, drawerTop: document.getElementById('mobile-menu').getBoundingClientRect().top, firstItemTop: Math.round(document.querySelector('#mobile-menu a').getBoundingClientRect().top) }));
    console.log(`D ${w}x${h}: scrollY ${y0} -> ${after.y}  bodyOverflow=${after.bodyOv} drawerTop=${after.drawerTop} firstItemTop=${after.firstItemTop}`);
    await page.screenshot({ path: `shot_drawer_${w}x${h}.png` });
  }
  await page.close();
}

// E: drawer at short viewports - is everything reachable?
{
  const page = await browser.newPage();
  for (const [w, h] of [[320, 568], [360, 640], [740, 360], [812, 375], [390, 664]]) {
    await page.setViewport({ width: w, height: h });
    await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    await page.click('button[aria-controls="mobile-menu"]');
    await new Promise(r => setTimeout(r, 350));
    const d = await page.evaluate(() => {
      const nav = document.querySelector('#mobile-menu nav');
      const kids = [...nav.children];
      const last = kids[kids.length - 1].getBoundingClientRect();
      return { vh: innerHeight, scrollH: nav.scrollHeight, clientH: nav.clientHeight, scrollable: nav.scrollHeight > nav.clientHeight + 1, overflowY: getComputedStyle(nav).overflowY, lastBottom: Math.round(last.bottom), cutBy: Math.round(last.bottom - innerHeight) };
    });
    console.log(`E ${w}x${h}:`, JSON.stringify(d));
  }
  await page.close();
}

// F: header bar geometry per width per locale (overlap / gap between logo, nav, controls)
{
  const page = await browser.newPage();
  for (const loc of ['tr', 'en', 'ru']) {
    for (const w of [320, 360, 390, 414, 480, 639, 640, 768, 834, 1024, 1279, 1280, 1320, 1440, 1920]) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto(`http://localhost:3100/${loc}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 450));
      const d = await page.evaluate(() => {
        const h = document.querySelector('header');
        const bar = h.querySelector('.wrap');
        const vis = el => el && getComputedStyle(el).display !== 'none';
        const rr = el => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) }; };
        const logo = h.querySelector('a[href="#top"]');
        const nav = h.querySelector('nav');
        const ctrl = h.querySelector('.wrap > div:last-child');
        const lang = h.querySelector('div.hidden.sm\\:block') || [...h.querySelectorAll('div')].find(d => d.className.includes('sm:block'));
        const img = [...h.querySelectorAll('img')].find(i => getComputedStyle(i).display !== 'none');
        const ir = img.getBoundingClientRect();
        const out = { vw: innerWidth, bar: rr(bar), logo: rr(logo), navVis: vis(nav), nav: vis(nav) ? rr(nav) : null, ctrl: rr(ctrl), langVis: vis(lang), lang: vis(lang) ? rr(lang) : null, logoRatio: +(ir.width / ir.height).toFixed(3), logoW: +ir.width.toFixed(1), logoH: +ir.height.toFixed(1) };
        out.gapLogoCtrl = out.navVis ? (out.nav.l - out.logo.r) : (out.ctrl.l - out.logo.r);
        out.gapNavCtrl = out.navVis ? out.ctrl.l - out.nav.r : null;
        return out;
      });
      const flag = (d.gapLogoCtrl < 4 || (d.gapNavCtrl !== null && d.gapNavCtrl < 4) || d.ctrl.r > d.vw || Math.abs(d.logoRatio - 4.09) > 0.05) ? '  <<< FLAG' : '';
      console.log(`F ${loc} ${w}: logo=${JSON.stringify(d.logo)} nav=${d.navVis ? JSON.stringify(d.nav) : 'hidden'} ctrl=${JSON.stringify(d.ctrl)} lang=${d.langVis ? d.lang.w : 'hid'} gapLC=${d.gapLogoCtrl} gapNC=${d.gapNavCtrl} ratio=${d.logoRatio}${flag}`);
    }
  }
  await page.close();
}
await browser.close();
