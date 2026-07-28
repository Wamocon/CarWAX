import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:3100/tr';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

await page.evaluateOnNewDocument(() => {
  window.__lt = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lt.push({ start: Math.round(e.startTime), dur: Math.round(e.duration) });
  }).observe({ type: 'longtask', buffered: true });
  window.__cls = 0;
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) {
      window.__cls += e.value;
      window.__shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: (e.sources||[]).map(s=>s.node?((s.node.tagName||'')+'.'+String(s.node.className||'').slice(0,50)):'?') });
    }
  }).observe({ type: 'layout-shift', buffered: true });
  window.__frames = [];
  let last = performance.now();
  const tick = (t) => { window.__frames.push(Math.round((t - last) * 100) / 100); last = t; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});

const client = await page.target().createCDPSession();
await client.send('Emulation.setCPUThrottlingRate', { rate: 4 }); // ~mid-tier laptop / high-end phone

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 });
await new Promise((r) => setTimeout(r, 3000));

// find section offsets
const offsets = await page.evaluate(() => {
  const o = {};
  const grab = (sel, name) => { const e = document.querySelector(sel); if (e) o[name] = Math.round(e.getBoundingClientRect().top + window.scrollY); };
  grab('#yorumlar', 'testimonials');
  grab('#gloss-scroll-h', 'glossHeading');
  o.docHeight = document.documentElement.scrollHeight;
  o.vh = window.innerHeight;
  return o;
});
console.log('offsets', JSON.stringify(offsets));

async function scrollSection(name, from, to) {
  await page.evaluate((y) => window.scrollTo(0, y), from);
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(() => { window.__frames.length = 0; window.__lt.length = 0; });
  const steps = 60;
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), Math.round((to - from) / steps));
    await new Promise((r) => setTimeout(r, 30));
  }
  await new Promise((r) => setTimeout(r, 600));
  const { frames, lt } = await page.evaluate(() => ({ frames: window.__frames.slice(), lt: window.__lt.slice() }));
  const f = frames.filter((x) => x > 0 && x < 2000).sort((a, b) => a - b);
  const p = (q) => f.length ? f[Math.min(f.length - 1, Math.floor(f.length * q))] : 0;
  const dropped = f.filter((x) => x > 32).length;
  console.log(`\n--- ${name} (scroll ${from} -> ${to}, CPU 4x throttle) ---`);
  console.log(`frames ${f.length}  median ${p(0.5)}ms  p90 ${p(0.9)}ms  p99 ${p(0.99)}ms  max ${f[f.length-1]}ms`);
  console.log(`frames >32ms (dropped): ${dropped} (${(dropped/f.length*100).toFixed(1)}%)   >100ms: ${f.filter(x=>x>100).length}`);
  console.log(`long tasks: ${lt.length}, total ${lt.reduce((s,e)=>s+e.dur,0)}ms, max ${lt.reduce((m,e)=>Math.max(m,e.dur),0)}ms`);
}

await scrollSection('TESTIMONIALS pin+scrub', offsets.testimonials - 100, offsets.testimonials + 2600);
await scrollSection('SCROLLGLOSS pin+scrub', Math.max(0, offsets.glossHeading - 400), offsets.glossHeading + 2600);
await scrollSection('CONTROL: top of page (no pin)', 0, 2000);

const cls = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts }));
console.log('\n=== CLS after full scroll: ' + cls.cls.toFixed(4));
console.log(JSON.stringify(cls.shifts.slice(0, 10), null, 1));

// mobile hero cost
const m = await browser.newPage();
await m.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await m.setCacheEnabled(false);
const mc = await m.target().createCDPSession();
await mc.send('Network.enable');
const mReq = new Map();
mc.on('Network.requestWillBeSent', (e) => mReq.set(e.requestId, { url: e.request.url }));
mc.on('Network.loadingFinished', (e) => { const r = mReq.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
await m.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 });
const mAll = [...mReq.values()].filter((r) => r.bytes != null);
console.log('\n=== MOBILE 390x844 dpr3 cold load ===');
console.log('requests ' + mAll.length + '  bytes ' + mAll.reduce((s, r) => s + r.bytes, 0) + ' (' + (mAll.reduce((s,r)=>s+r.bytes,0)/1024).toFixed(0) + ' KB)');
console.log(mAll.filter(r=>/img|image/.test(r.url)).map(r=>`  ${String(r.bytes).padStart(8)} ${r.url.replace('http://localhost:3100','')}`).join('\n'));

await browser.close();
