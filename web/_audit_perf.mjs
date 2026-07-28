import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:3100/tr';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.setCacheEnabled(false);

const reqs = [];
const client = await page.target().createCDPSession();
await client.send('Network.enable');
await client.send('Performance.enable');

const byId = new Map();
client.on('Network.requestWillBeSent', (e) => {
  byId.set(e.requestId, { url: e.request.url, type: e.type, encoded: 0, start: e.timestamp });
});
client.on('Network.responseReceived', (e) => {
  const r = byId.get(e.requestId);
  if (r) { r.status = e.response.status; r.mime = e.response.mimeType; r.type = e.type; }
});
client.on('Network.loadingFinished', (e) => {
  const r = byId.get(e.requestId);
  if (r) { r.encoded = e.encodedDataLength; r.done = true; }
});

// long tasks + CLS observers installed before navigation
await page.evaluateOnNewDocument(() => {
  window.__lt = [];
  window.__cls = 0;
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__lt.push({ start: e.startTime, dur: e.duration });
  }).observe({ type: 'longtask', buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (!e.hadRecentInput) {
        window.__cls += e.value;
        window.__shifts.push({
          value: e.value,
          t: e.startTime,
          sources: (e.sources || []).map((s) => ({
            node: s.node ? (s.node.tagName || '') + '.' + ((s.node.className && String(s.node.className).slice(0, 60)) || '') : '?',
            prev: s.previousRect ? [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height] : null,
            cur: s.currentRect ? [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height] : null,
          })),
        });
      }
    }
  }).observe({ type: 'layout-shift', buffered: true });
  window.__lcp = null;
  new PerformanceObserver((l) => {
    const es = l.getEntries();
    const e = es[es.length - 1];
    window.__lcp = {
      time: e.startTime, size: e.size, url: e.url,
      tag: e.element ? e.element.tagName : null,
      cls: e.element ? String(e.element.className).slice(0, 120) : null,
      id: e.element ? e.element.id : null,
    };
  }).observe({ type: 'largest-contentful-paint', buffered: true });
});

const t0 = Date.now();
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 });
const loadMs = Date.now() - t0;

await new Promise((r) => setTimeout(r, 1500));

const lcp = await page.evaluate(() => window.__lcp);
const nav = await page.evaluate(() => {
  const n = performance.getEntriesByType('navigation')[0];
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  return { domContentLoaded: n.domContentLoadedEventEnd, load: n.loadEventEnd, ttfb: n.responseStart, fcp: fcp ? fcp.startTime : null };
});

// image sizing audit
const imgs = await page.evaluate(() => {
  return [...document.querySelectorAll('img')].map((i) => {
    const r = i.getBoundingClientRect();
    return {
      src: i.currentSrc || i.src,
      natural: [i.naturalWidth, i.naturalHeight],
      rendered: [Math.round(r.width), Math.round(r.height)],
      hasWH: !!(i.getAttribute('width') && i.getAttribute('height')),
      loading: i.getAttribute('loading'),
      fetchpriority: i.getAttribute('fetchpriority'),
      dpr: window.devicePixelRatio,
    };
  });
});

const all = [...byId.values()].filter((r) => r.done);
const total = all.reduce((s, r) => s + r.encoded, 0);
const byType = {};
for (const r of all) {
  const t = r.type || 'other';
  byType[t] = byType[t] || { n: 0, bytes: 0 };
  byType[t].n++; byType[t].bytes += r.encoded;
}

const top = all.slice().sort((a, b) => b.encoded - a.encoded).slice(0, 22)
  .map((r) => `${String(r.encoded).padStart(9)}  ${r.type.padEnd(10)} ${r.mime || ''} ${r.url.replace('http://localhost:3100', '')}`);

console.log('=== COLD LOAD ' + URL + ' (1440x900, cache disabled) ===');
console.log('wall load (networkidle0): ' + loadMs + ' ms');
console.log('TTFB ' + nav.ttfb.toFixed(0) + '  FCP ' + (nav.fcp || 0).toFixed(0) + '  DCL ' + nav.domContentLoaded.toFixed(0) + '  load ' + nav.load.toFixed(0));
console.log('requests: ' + all.length + '   total encoded bytes: ' + total + ' (' + (total / 1024 / 1024).toFixed(2) + ' MB)');
console.log('by type: ' + JSON.stringify(byType, null, 1));
console.log('\n=== LCP ===');
console.log(JSON.stringify(lcp, null, 1));
console.log('\n=== TOP 22 RESOURCES ===');
console.log(top.join('\n'));

console.log('\n=== IMAGES rendered vs natural (oversize >2x linear) ===');
for (const i of imgs) {
  const over = i.rendered[0] > 0 ? (i.natural[0] / i.rendered[0]) : 0;
  const flag = over > 2 ? ' <== OVERSIZED ' + over.toFixed(1) + 'x' : '';
  const wh = i.hasWH ? '' : ' [no width/height attr]';
  console.log(`nat ${i.natural.join('x')} -> rendered ${i.rendered.join('x')}${flag}${wh}  ${i.src.replace('http://localhost:3100', '').slice(0, 110)}`);
}

const cls = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts }));
console.log('\n=== CLS (load only) === ' + cls.cls.toFixed(4));
console.log(JSON.stringify(cls.shifts.slice(0, 8), null, 1));

const lt = await page.evaluate(() => window.__lt);
console.log('\n=== LONG TASKS during load: ' + lt.length + ' total ' + lt.reduce((s, e) => s + e.dur, 0).toFixed(0) + 'ms');
console.log(JSON.stringify(lt.slice(0, 12)));

await browser.close();
