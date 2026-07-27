'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Phone, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { branches, brand } from '@/lib/data/site';

const NAV = [
  { id: 'hizmetler', key: 'services' },
  { id: 'paketler', key: 'packages' },
  { id: 'marine', key: 'marine' },
  { id: 'urunler', key: 'products' },
  { id: 'subeler', key: 'branches' },
  { id: 'harita', key: 'map' },
  { id: 'iletisim', key: 'contact' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);

  // Der Balken wird erst hinterlegt, wenn der Hero weg ist. Davor läge ein
  // Kasten über dem Bild und würde das Motiv zerschneiden.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bei offenem Menü darf die Seite dahinter nicht mitscrollen.
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menu]);

  const main = branches[0];

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50',
          'transition-[background-color,border-color,backdrop-filter] duration-300 ease-out',
          solid || menu
            ? 'border-b border-hairline bg-bg/85 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="wrap flex h-18 items-center justify-between gap-4">
          {/*
            shrink-0 ist hier nicht kosmetisch: ohne das quetscht der Flex-
            Container das Logo zusammen, sobald Navigation und Knöpfe eng
            werden. Auf dem Telefon kam die Wortmarke dadurch auf 64px statt
            106px heraus und war sichtbar gestaucht.
          */}
          <a
            href="#top"
            aria-label={`${brand.displayName} — ${brand.descriptor}`}
            className="shrink-0"
          >
            <Image
              src="/brand/carwax-logo-light.png"
              alt=""
              width={417}
              height={102}
              priority
              className="only-dark h-6.5 w-auto"
            />
            {/* Originalmarke mit schwarzen Bildteilen, nur auf hellem Grund. */}
            <Image
              src="/brand/carwax-logo.png"
              alt=""
              width={417}
              height={102}
              priority
              className="only-light h-6.5 w-auto"
            />
          </a>

          {/* Sieben Punkte brauchen Platz. Unter 1280px wandern sie ins
              Schubfach, statt zweizeilig umzubrechen und den Balken zu
              verdoppeln. */}
          <nav
            aria-label={t('menuLabel')}
            className="hidden items-center gap-7 xl:flex"
          >
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                className="whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-fg-muted transition-colors duration-200 hover:text-fg"
              >
                {t(n.key)}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            {/*
              Der Sprachumschalter braucht 140px. Auf einem 390px-Telefon
              schob er den Menüknopf auf 384–428px, also aus dem Bild heraus.
              Aufgefallen ist das NICHT über scrollWidth: `overflow-x: clip`
              auf <html> verbirgt genau diesen Überlauf, die Standardprüfung
              meldete sauber. Unter 640px steht die Sprachwahl deshalb im
              Schubfach statt im Balken.
            */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <a
              href={`tel:${main.phone}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-brand px-4 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-white transition-[transform,background-color] duration-140 ease-out hover:bg-brand-hot active:scale-[0.97]"
            >
              <Phone aria-hidden size={14} />
              <span className="hidden sm:inline">{t('call')}</span>
            </a>

            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? t('closeMenu') : t('openMenu')}
              className="grid h-11 w-11 place-items-center rounded-[2px] text-fg transition-[background-color,transform] duration-140 ease-out hover:bg-glass active:scale-[0.97] xl:hidden"
            >
              {menu ? <X aria-hidden size={20} /> : <Menu aria-hidden size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Schubfach. Volle Höhe, große Tippziele, ein Punkt pro Zeile. */}
      <div
        id="mobile-menu"
        hidden={!menu}
        className="fixed inset-0 z-40 bg-bg/97 pt-18 backdrop-blur-xl xl:hidden"
      >
        <nav aria-label={t('menuLabel')} className="wrap flex h-full flex-col overflow-y-auto py-6">
          {NAV.map((n, i) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => setMenu(false)}
              className="flex min-h-14 items-center justify-between border-b border-hairline text-[1.15rem] transition-colors duration-200 hover:text-brand"
            >
              {t(n.key)}
              <span className="font-mono text-[0.625rem] text-fg-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
            </a>
          ))}

          <a
            href={`tel:${main.phone}`}
            onClick={() => setMenu(false)}
            className="mt-8 inline-flex min-h-14 items-center justify-center gap-2.5 rounded-[2px] bg-brand font-mono text-[0.75rem] uppercase tracking-[0.2em] text-white transition-transform duration-140 ease-out active:scale-[0.97]"
          >
            <Phone aria-hidden size={16} />
            {main.phoneLabel}
          </a>

          {/* Sprachwahl, die unter 640px aus dem Balken genommen wurde. */}
          <div className="mt-6 flex justify-center sm:hidden">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </>
  );
}
