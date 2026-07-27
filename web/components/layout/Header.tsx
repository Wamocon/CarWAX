'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Phone } from 'lucide-react';
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

  // Der Balken wird erst hinterlegt, wenn der Hero weg ist — davor würde ein
  // Kasten über dem Bild liegen und das Motiv zerschneiden.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const main = branches[0];

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50',
        'transition-[background-color,border-color,backdrop-filter] duration-300',
        'ease-out',
        solid
          ? 'border-b border-hairline bg-bg/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      ].join(' ')}
    >
      <div className="wrap flex h-18 items-center justify-between gap-6">
        {/* Die echte Wortmarke, nicht nachgebaut. Die helle Variante hat nur
            die schwarzen Bildteile auf Creme gedreht — Rot bleibt Original. */}
        <a href="#top" aria-label={`${brand.displayName} — ${brand.descriptor}`}>
          <Image
            src="/brand/carwax-logo-light.png"
            alt=""
            width={417}
            height={102}
            priority
            className="only-dark h-6.5 w-auto"
          />
          {/* Originalmarke mit schwarzen Bildteilen — nur auf hellem Grund. */}
          <Image
            src="/brand/carwax-logo.png"
            alt=""
            width={417}
            height={102}
            priority
            className="only-light h-6.5 w-auto"
          />
        </a>

        <nav aria-label="Ana menü" className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-muted transition-colors duration-200 hover:text-fg"
            >
              {t(n.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
          <a
            href={`tel:${main.phone}`}
            className={[
              'inline-flex min-h-11 items-center gap-2 px-4',
              'rounded-[2px] bg-brand text-white',
              'font-mono text-[0.6875rem] uppercase tracking-[0.2em]',
              'transition-[transform,background-color] duration-140',
              'ease-out active:scale-[0.97]',
              'hover:bg-brand-hot',
            ].join(' ')}
          >
            <Phone aria-hidden size={14} />
            <span className="hidden sm:inline">{t('call')}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
