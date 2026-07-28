'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const LABEL: Record<string, string> = { tr: 'TR', en: 'EN', ru: 'RU' };
const FULL: Record<string, string> = {
  tr: 'Türkçe',
  en: 'English',
  ru: 'Русский',
};

/**
 * Wo steht der Leser gerade?
 *
 * Die Seite ist ein einziges langes Dokument. `usePathname()` von next-intl
 * gibt den Pfad ohne Sprachpräfix zurück, also schlicht `/`; ein Sprachwechsel
 * warf den Leser damit an den Anfang zurück. Ausgerechnet dort, wo er am
 * wahrscheinlichsten ist: jemand scrollt bis zu den Paketen und merkt dann,
 * dass er lieber Englisch liest.
 *
 * Statt die Scrollposition in Pixeln zu merken wird die Sektion bestimmt, die
 * gerade oben steht. Das ist auch das Richtige, weil Russisch und Türkisch
 * unterschiedlich lang setzen: derselbe Pixelwert läge in der anderen Sprache
 * woanders, dieselbe Sektion nicht.
 */
function currentSectionHash(): string {
  if (typeof document === 'undefined') return '';
  const marks = document.querySelectorAll<HTMLElement>(
    'main > section[id], main > header[id]',
  );
  let last = '';
  for (const el of marks) {
    // 120px Toleranz: der Kopfbalken verdeckt die oberste Zeile.
    if (el.getBoundingClientRect().top <= 120) last = el.id;
    else break;
  }
  return last ? `#${last}` : '';
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav aria-label="Dil / Language" className="flex items-center gap-1">
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-current={active ? 'true' : undefined}
            // Der sichtbare Text ist nur "TR" — Screenreader bekommen den ganzen Namen.
            aria-label={FULL[l]}
            onClick={() => {
              // Ein vorhandener Anker gewinnt: den hat der Leser selbst
              // gesetzt, indem er einen Menüpunkt angeklickt hat.
              const hash = window.location.hash || currentSectionHash();
              router.replace(`${pathname}${hash}`, { locale: l });
            }}
            className={[
              'min-h-11 min-w-11 px-2 font-mono text-[0.6875rem] tracking-[0.18em]',
              'transition-[color,transform] duration-140 ease-out',
              'active:scale-[0.97]',
              active ? 'text-brand' : 'text-fg-faint hover:text-fg',
            ].join(' ')}
          >
            {LABEL[l]}
          </button>
        );
      })}
    </nav>
  );
}
