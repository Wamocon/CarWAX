import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:3100/tr';

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

await page.evaluateOnNewDocument(() => {
  window.__all = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__all.push({
        v: e.value, t: Math.round(e.startTime), recent: e.hadRecentInput, y: Math.round(window.scrollY),
        src: (e.sources || []).map((s) => {
          const n = s.node;
          return n ? `${n.tagName}#${n.id || ''}.${String(n.className || '').slice(0, 70)}` : '?';
        }),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 });
await new Promise((r) => setTimeout(r, 2500));

// REAL wheel input, all the way down the page
await page.mouse.move(720, 450);
const H = await page.evaluate(() => document.documentElement.scrollHeight);
let y = 0;
while (y < H - 900) {
  await page.mouse.wheel({ deltaY: 220 });
  y += 220;
  await new Promise((r) => setTimeout(r, 22));
}
await new Promise((r) => setTimeout(r, 1500));

const all = await page.evaluate(() => window.__all);
const counted = all.filter((e) => !e.recent);
const excluded = all.filter((e) => e.recent);
const sum = (a) => a.reduce((s, e) => s + e.v, 0);

console.log('=== REAL WHEEL SCROLL, full page, 1440x900 ===');
console.log('layout-shift entries: ' + all.length);
console.log('CLS (hadRecentInput=false, counts toward CWV): ' + sum(counted).toFixed(4));
console.log('excluded by hadRecentInput=true: ' + excluded.length + ' entries, ' + sum(excluded).toFixed(4));

// attribute by element
const byEl = new Map();
for (const e of counted) {
  const k = e.src.join(' | ') || '(no source)';
  const cur = byEl.get(k) || { n: 0, v: 0, ys: [] };
  cur.n++; cur.v += e.v; if (cur.ys.length < 4) cur.ys.push(e.y);
  byEl.set(k, cur);
}
console.log('\n=== CLS attribution (top 10 by summed value) ===');
[...byEl.entries()].sort((a, b) => b[1].v - a[1].v).slice(0, 10).forEach(([k, v]) => {
  console.log(`${v.v.toFixed(4)}  (${v.n} shifts, scrollY ~${v.ys.join(',')})  ${k}`);
});

// worst 1s session window (the actual CLS metric)
const s = counted.slice().sort((a, b) => a.t - b.t);
let best = 0, i = 0;
for (let j = 0; j < s.length; j++) {
  while (s[j].t - s[i].t > 5000) i++;
  let w = 0, k = i;
  while (k <= j && s[k].t - s[i].t <= 5000) { w += s[k].v; k++; }
  if (w > best) best = w;
}
console.log('\nworst 5s session window CLS: ' + best.toFixed(4) + '   (good <0.1, poor >0.25)');

await browser.close();
