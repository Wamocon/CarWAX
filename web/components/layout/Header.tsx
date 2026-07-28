'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Phone, Menu, X } from 'lucide-react';
import { useLenis } from 'lenis/react';
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
  const sheetRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  // Der Balken wird erst hinterlegt, wenn der Hero weg ist. Davor läge ein
  // Kasten über dem Bild und würde das Motiv zerschneiden.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /*
    Bei offenem Menü darf die Seite dahinter nicht mitscrollen.

    `document.body.style.overflow = 'hidden'` hat das NICHT geleistet: Lenis
    besitzt hier das Scrollen und bewegt das Dokument selbst weiter. Wer das
    Schubfach öffnete und wischte, scrollte die Seite dahinter, und beim
    Schließen stand er irgendwo weit unten. Lenis muss man anhalten.
  */
  useEffect(() => {
    const lenis = lenisRef.current;
    if (menu) lenis?.stop();
    else lenis?.start();
    // Zusätzlich für den Fall reduzierter Bewegung, wo Lenis gar nicht läuft.
    document.documentElement.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
      lenisRef.current?.start();
    };
  }, [menu, lenisRef]);

  /*
    Fokusfalle. Ohne sie lief Tab aus dem offenen Schubfach heraus in die
    Seite dahinter: erst die sieben Menüpunkte, dann still weiter auf die
    Hero-Knöpfe, den Vergleichsregler und die Paketkarten, die unter der
    Überlagerung liegen und für einen sehenden Nutzer gar nicht da sind.
  */
  useEffect(() => {
    if (!menu) return;
    const sheet = sheetRef.current;
    const opener = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        sheet?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [menu]);

  const main = branches[0];

  return (
    <>
      {/*
        `data-bar` sagt, worauf der Balken gerade liegt.

        Solange er durchsichtig ist, liegt er auf dem Heldenbild, und das ist in
        BEIDEN Modi ein dunkles Foto. Im hellen Modus stand die Navigation dort
        vorher als dunkles Schiefergrau auf Fast-Schwarz: gemessene 2,56:1, weit
        unter AA, und der Fokusring war praktisch unsichtbar. `on-dark` definiert
        die Farbtokens lokal um, genau wie im Hero selbst.

        Am `data-bar` hängt außerdem die Wortmarke: die Originaldatei hat schwarze
        Bildteile, die auf dem Foto verschwinden. Siehe globals.css.
      */}
      <header
        data-bar={solid || menu ? 'solid' : 'clear'}
        className={[
          'fixed inset-x-0 top-0 z-50',
          'transition-[background-color,border-color,backdrop-filter] duration-300 ease-out',
          solid || menu
            ? 'border-b border-hairline bg-bg/85 backdrop-blur-md'
            : 'on-dark border-b border-transparent bg-transparent',
        ].join(' ')}
      >
        <div className="wrap flex h-18 items-center justify-between gap-4">
          {/*
            shrink-0 ist hier nicht kosmetisch: ohne das quetscht der Flex-
            Container das Logo zusammen, sobald Navigation und Knöpfe eng
            werden. Auf dem Telefon kam die Wortmarke dadurch auf 64px statt
            106px heraus und war sichtbar gestaucht.
          */}
          {/* `self-stretch` gibt dem Sprung nach oben die volle Balkenhöhe als
              Trefferfläche. Die Wortmarke selbst ist nur 26px hoch, und auf dem
              Telefon war das ein Ziel weit unter den 44px, die ein Daumen
              braucht. Am Aussehen ändert es nichts. */}
          <a
            href="#top"
            aria-label={`${brand.displayName} — ${brand.descriptor}`}
            className="flex shrink-0 items-center self-stretch"
          >
            <Image
              src="/brand/carwax-logo-light.png"
              alt=""
              width={417}
              height={102}
              priority
              className="logo-bright h-6.5 w-auto"
            />
            {/* Originalmarke mit schwarzen Bildteilen. Erscheint erst, wenn der
                Balken im hellen Modus hinterlegt ist, siehe globals.css. */}
            <Image
              src="/brand/carwax-logo.png"
              alt=""
              width={417}
              height={102}
              priority
              className="logo-original h-6.5 w-auto"
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

            {/* Der sichtbare Text faellt unter 640px weg. Ohne aria-label
                blieb der wichtigste Knopf der Seite dort namenlos, und
                VoiceOver las die nackte tel:-URL vor. */}
            <a
              href={`tel:${main.phone}`}
              aria-label={`${t('call')} ${main.phoneLabel}`}
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
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('menuLabel')}
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
