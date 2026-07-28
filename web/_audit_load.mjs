import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:3100/tr';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });

for (const [label, vp, cpu] of [
  ['DESKTOP 1440x900 no throttle', { width: 1440, height: 900 }, 1],
  ['MOBILE 390x844 dpr3 CPU4x', { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, 4],
]) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.setCacheEnabled(false);
  const c = await page.target().createCDPSession();
  await c.send('Emulation.setCPUThrottlingRate', { rate: cpu });

  await page.evaluateOnNewDocument(() => {
    window.__cls = 0; window.__srcs = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) {
      window.__cls += e.value;
      window.__srcs.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), n: (e.sources||[]).map(s=>s.node?`${s.node.tagName}.${String(s.node.className||'').slice(0,55)}`:'?').join(',') });
    }}).observe({ type: 'layout-shift', buffered: true });
    window.__lcp = null;
    new PerformanceObserver((l) => { const es = l.getEntries(); const e = es[es.length-1];
      window.__lcp = { t: Math.round(e.startTime), url: e.url, tag: e.element?e.element.tagName:null, cls: e.element?String(e.element.className).slice(0,90):null };
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(URL, { waitUntil: 'load', timeout: 90000 });
  // let the 2.2s hero sweep finish, no scrolling at all
  await new Promise((r) => setTimeout(r, 4500));

  const out = await page.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint').map(p => `${p.name}=${Math.round(p.startTime)}`);
    return { cls: window.__cls, srcs: window.__srcs, lcp: window.__lcp, paints,
      ttfb: Math.round(n.responseStart), dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd) };
  });
  console.log('\n########## ' + label + ' ##########');
  console.log(`TTFB ${out.ttfb}  paints[${out.paints.join(' ')}]  DCL ${out.dcl}  load ${out.load}`);
  console.log('LCP: ' + JSON.stringify(out.lcp));
  console.log('CLS on load, ZERO user interaction: ' + out.cls.toFixed(4) + '  (good <0.1, poor >0.25)');
  console.log('shift sources (first 6): ' + JSON.stringify(out.srcs.slice(0, 6), null, 1));
  console.log('total shift entries: ' + out.srcs.length);
  await page.close();
}
await browser.close();
