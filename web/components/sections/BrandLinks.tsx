import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { brandLinks } from '@/lib/data/site';

/**
 * Onlineshop und Franchise-Bewerbung.
 *
 * Beide standen im Hauptmenü des Kunden und fehlten hier komplett. Sie tragen
 * keine eigene Sektion mit Überschrift und Bildern: das sind Nebenwege, keine
 * Argumente. Zwei Zeilen am Ende der Produktstrecke, groß genug zum Treffen,
 * leise genug, um den Weg zum Telefon nicht zu stören.
 */
export function BrandLinks() {
  const t = useTranslations('brandLinks');

  return (
    <section className="section pt-0" aria-labelledby="markenwege-h">
      <div className="wrap">
        <h2
          id="markenwege-h"
          className="mb-8 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-faint"
        >
          {t('title')}
        </h2>

        <ul className="grid gap-px overflow-hidden border-y border-hairline bg-hairline sm:grid-cols-2">
          {brandLinks.map((l, i) => (
            <Reveal as="li" key={l.id} delay={i * 0.06} className="bg-bg">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-28 items-center justify-between gap-6 px-1 py-8 transition-colors duration-200 sm:px-8"
              >
                <span>
                  <span className="block text-[1.15rem] tracking-[-0.015em] transition-colors duration-200 group-hover:text-brand">
                    {t(`${l.id}.title`)}
                  </span>
                  <span className="mt-1 block text-[0.9rem] text-fg-muted">
                    {t(`${l.id}.text`)}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  size={20}
                  className="shrink-0 text-fg-faint transition-[transform,color] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                />
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
