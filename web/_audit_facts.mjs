import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
});

for (const loc of ['tr', 'en', 'ru']) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:3100/${loc}`, { waitUntil: 'networkidle0' });

  // scroll through the whole page to trigger IntersectionObservers
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 3000));

  const out = await page.evaluate(() => {
    const res = {};
    // counters
    const nodes = [...document.querySelectorAll('number-flow-react')];
    res.counters = nodes.map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim());
    // rating block
    const rat = document.querySelector('#degerlendirme');
    res.rating = rat ? rat.innerText.replace(/\n+/g, ' | ') : null;
    // testimonials section source
    const all = document.body.innerText;
    res.hasCarwaxSource = all.includes('carwax.com.tr');
    // counters lead text
    const secs = [...document.querySelectorAll('section')];
    const cs = secs.find((s) => s.querySelector('number-flow-react'));
    res.countersSection = cs ? cs.innerText.replace(/\n+/g, ' | ') : null;
    // branches hours
    const br = document.querySelector('#subeler');
    res.branchesFirst = br ? br.innerText.split('\n').slice(0, 14).join(' | ') : null;
    // dashes in visible text
    const dashes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const p = n.parentElement;
      if (!p) continue;
      const tag = p.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') continue;
      const cs2 = getComputedStyle(p);
      if (cs2.display === 'none' || cs2.visibility === 'hidden') continue;
      const t = n.textContent || '';
      if (/[\u2013\u2014]/.test(t)) dashes.push(t.trim().slice(0, 90));
    }
    res.dashes = [...new Set(dashes)];
    return res;
  });
  console.log('=====', loc, '=====');
  console.log(JSON.stringify(out, null, 1));
  await page.close();
}

await browser.close();
