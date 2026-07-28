import { useTranslations } from 'next-intl';
import { Phone, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { branches, reviewUrl } from '@/lib/data/site';

export function Contact() {
  const t = useTranslations('contact');

  return (
    <section
      id="iletisim"
      className="section wash-brand border-t border-hairline"
      aria-labelledby="iletisim-h"
    >
      <div className="wrap">
        <SectionHeading
          id="iletisim-h"
          title={t('title')}
          lead={t('lead')}
        />

        <Reveal>
          {/* Nicht bemalt: die Zahl der Karten ist `branches.length`.
              Bei vier Filialen geht das Raster auf, bei fuenf stuenden
              drei graue Zellen da. Haarlinie an der Karte statt am
              Behaelter macht das unmoeglich. */}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
            {branches.map((b) => (
              <li key={b.id} className="border border-hairline -mt-px -ml-px bg-bg-raised">
                <a
                  href={`tel:${b.phone}`}
                  className="group flex h-full flex-col justify-between gap-6 p-7 transition-[background-color] duration-200 hover:bg-bg"
                  aria-label={`${b.name}, ${b.district} — ${t('call')} ${b.phoneLabel}`}
                >
                  <span>
                    <span className="block text-[1.05rem]">{b.name}</span>
                    <span className="mt-1 block font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-faint">
                      {b.district}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 font-mono text-[0.8125rem] tracking-[0.06em] text-brand">
                    <Phone aria-hidden size={14} />
                    {b.phoneLabel}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[0.95rem] text-fg-muted">{t('note')}</p>
        </Reveal>

        {/*
          Die Bitte um eine Bewertung, ohne Zahl und ohne Sterne.

          Die Bewertungssektion ist ausgeblendet, solange der Schnitt unter 4,5
          liegt. Damit fiele aber auch das Einzige weg, das den Schnitt je
          bewegen kann: neue Rückmeldungen. Deshalb steht die Einladung hier
          unten, wo jemand ankommt, der tatsächlich schon Kunde war, und nicht
          oben im Verkaufsweg, wo sie bettelnd wirkt.

          Kein Wert, kein Stern, keine Behauptung. Nur die Aufforderung.
        */}
        <Reveal delay={0.16}>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-hairline pt-8">
            <p className="max-w-[54ch] flex-1 text-[0.9rem] leading-relaxed text-fg-faint">
              {t('reviewNote')}
            </p>
            <a
              href={reviewUrl(branches[0].address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 border-b border-hairline-strong pb-1 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-muted transition-colors duration-200 hover:border-brand hover:text-brand"
            >
              {t('reviewCta')}
              <ArrowUpRight aria-hidden size={14} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
