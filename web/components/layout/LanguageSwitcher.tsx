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
            onClick={() => router.replace(pathname, { locale: l })}
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
