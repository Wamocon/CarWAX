import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.setCacheEnabled(false);
const c = await page.target().createCDPSession();
await c.send('Network.enable');
const m = new Map();
c.on('Network.requestWillBeSent', e => m.set(e.requestId, { url: e.request.url, type: e.type }));
c.on('Network.responseReceived', e => { const r = m.get(e.requestId); if (r) r.mime = e.response.mimeType; });
c.on('Network.loadingFinished', e => { const r = m.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0', timeout: 90000 });
const all = [...m.values()].filter(r => r.bytes != null);
const tot = all.reduce((s, r) => s + r.bytes, 0);
console.log('MOBILE 390x844 cold load: ' + all.length + ' requests, ' + tot + ' bytes (' + (tot/1024).toFixed(0) + ' KB)');
const byType = {};
for (const r of all) { byType[r.type] = byType[r.type] || {n:0,b:0}; byType[r.type].n++; byType[r.type].b += r.bytes; }
console.log(JSON.stringify(byType));
console.log('\nimages fetched on mobile:');
all.filter(r => /image/.test(r.mime||'')).sort((a,b)=>b.bytes-a.bytes).forEach(r => console.log(`  ${String(r.bytes).padStart(8)}  ${r.mime}  ${r.url.replace('http://localhost:3100','').slice(0,100)}`));

// what would next/image cost for the same hero at 828w?
for (const w of [640, 828, 1080, 1920]) {
  const u = `http://localhost:3100/_next/image?url=%2Fimg%2Fhero-studio.jpg&w=${w}&q=75`;
  const res = await page.evaluate(async (u) => { const r = await fetch(u); const b = await r.blob(); return { size: b.size, type: b.type }; }, u);
  console.log(`  optimized hero w=${w}: ${res.size} bytes ${res.type}`);
}
await browser.close();
