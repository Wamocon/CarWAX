import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = 'D:/Real Estate CRM/Cati/.tmp/claude/d--Professional-Car-WAX-car-care-systems/d147f53e-0cdc-4986-b32b-d4ad55ac03de/scratchpad';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrollAll(page) {
  await page.evaluate(async () => {
    const h = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += Math.round(h * 0.7)) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 600));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
});

const report = {};

// ---------------------------------------------------------------- headings + alt
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await scrollAll(page);

  report.headings = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
      tag: h.tagName,
      text: (h.innerText || '').trim().slice(0, 70),
      hidden: h.offsetParent === null && getComputedStyle(h).position !== 'fixed',
    }))
  );

  report.images = await page.evaluate(() =>
    [...document.querySelectorAll('img')].map((i) => ({
      src: i.getAttribute('src')?.slice(0, 90),
      alt: i.getAttribute('alt'),
      hasAlt: i.hasAttribute('alt'),
      w: i.clientWidth,
      h: i.clientHeight,
      cls: i.className.slice(0, 60),
    }))
  );

  report.landmarks = await page.evaluate(() => ({
    main: document.querySelectorAll('main').length,
    nav: [...document.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label')),
    header: document.querySelectorAll('header').length,
    footer: document.querySelectorAll('footer').length,
    skipLink: !!document.querySelector('a[href^="#"][class*="sr-only"], .skip-link'),
    htmlLang: document.documentElement.lang,
    dirAttr: document.documentElement.dir,
  }));

  // links / buttons with no accessible name
  report.namelessControls = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a[href],button,[role="button"],summary,input,textarea,select')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const name = (
        el.getAttribute('aria-label') ||
        (el.getAttribute('aria-labelledby')
          ? [...document.querySelectorAll('#' + el.getAttribute('aria-labelledby'))].map((n) => n.innerText).join(' ')
          : '') ||
        el.innerText ||
        el.getAttribute('title') ||
        (el.id && document.querySelector(`label[for="${el.id}"]`)?.innerText) ||
        ''
      ).trim();
      if (!name) out.push({ tag: el.tagName, cls: el.className.toString().slice(0, 70), href: el.getAttribute('href')?.slice(0, 50) });
    }
    return out;
  });

  // details disclosures
  report.details = await page.evaluate(() =>
    [...document.querySelectorAll('details')].map((d) => ({
      open: d.open,
      summaryText: d.querySelector('summary')?.innerText.trim().slice(0, 50),
      summaryTabIndex: d.querySelector('summary')?.tabIndex,
      role: d.querySelector('summary')?.getAttribute('role'),
    }))
  );

  await page.close();
}

// ---------------------------------------------------------------- keyboard tab order
async function tabAudit(width, height, openMenu) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await sleep(800);

  if (openMenu) {
    await page.evaluate(() => {
      const b = document.querySelector('button[aria-controls="mobile-menu"]');
      b?.click();
    });
    await sleep(500);
  }

  const seq = [];
  await page.evaluate(() => document.body.focus());
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { tag: 'BODY' };
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      // is it visible?
      const invisible =
        cs.visibility === 'hidden' ||
        cs.display === 'none' ||
        parseFloat(cs.opacity) < 0.05 ||
        r.width === 0 ||
        r.height === 0;
      // outline on focus-visible
      return {
        tag: el.tagName,
        name: (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || '').trim().slice(0, 45),
        cls: el.className.toString().slice(0, 60),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        opacity: cs.opacity,
        outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor,
        invisible,
        inViewport: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
        matchesFocusVisible: el.matches(':focus-visible'),
        insideMenu: !!el.closest('#mobile-menu'),
        insideHeader: !!el.closest('header'),
      };
    });
    seq.push(info);
  }
  await page.close();
  return seq;
}

report.tab1440 = await tabAudit(1440, 900, false);
report.tab390 = await tabAudit(390, 844, false);
report.tab390menu = await tabAudit(390, 844, true);

// ---------------------------------------------------------------- touch targets @390
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await scrollAll(page);
  report.touch = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('a[href],button,summary,input,textarea,select,[role="button"]')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.width < 44 || r.height < 44) {
        out.push({
          tag: el.tagName,
          name: (el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 40),
          cls: el.className.toString().slice(0, 70),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
    return out;
  });
  await page.close();
}

// ---------------------------------------------------------------- reduced motion
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await scrollAll(page);
  await sleep(1200);
  report.reducedMotionHidden = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.15 && el.innerText && el.innerText.trim().length > 6) {
        const r = el.getBoundingClientRect();
        if (r.width > 20 && r.height > 10) {
          out.push({
            tag: el.tagName,
            cls: el.className.toString().slice(0, 60),
            opacity: cs.opacity,
            transform: cs.transform,
            text: el.innerText.trim().slice(0, 50),
          });
        }
      }
    }
    return out.slice(0, 40);
  });
  // also: JS animation still running?
  report.reducedMotionAnims = await page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === 'running').length
  );
  await page.close();
}

// ---------------------------------------------------------------- no-JS-ish: motion reveal without scroll
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3100/tr', { waitUntil: 'networkidle0' });
  await sleep(1500);
  report.belowFoldOpacity = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('section, section *')) {
      const cs = getComputedStyle(el);
      if (parseFloat(cs.opacity) < 0.15 && el.innerText && el.innerText.trim().length > 6) {
        out.push({ cls: el.className.toString().slice(0, 50), op: cs.opacity, text: el.innerText.trim().slice(0, 40) });
      }
    }
    return out.length;
  });
  await page.close();
}

writeFileSync(OUT + '/struct.json', JSON.stringify(report, null, 2));
console.log('done');
await browser.close();
