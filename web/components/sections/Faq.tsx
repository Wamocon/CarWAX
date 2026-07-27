import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { faq } from '@/lib/data/site';

/**
 * Die fünf Fragen, die der Kunde auf seiner eigenen Startseite beantwortet.
 * Inhaltlich übernommen, sprachlich geglättet — gute Substanz, die in der
 * ersten Fassung schlicht fehlte.
 *
 * Bewusst natives <details>: kein Zustand, kein JavaScript, funktioniert vor
 * der Hydration und ist für Screenreader von Haus aus richtig ausgezeichnet.
 * Das Aufklappen animiert der Browser über `interpolate-size` (siehe
 * globals.css); wo er das nicht kann, springt es auf — und das ist in Ordnung.
 */
export function Faq() {
  const t = useTranslations('faq');

  return (
    <section id="sorular" className="section" aria-labelledby="sorular-h">
      <div className="wrap">
        <SectionHeading
          id="sorular-h"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        {/* Linksbündig auf der Textkante der Überschrift. Zentriert stand der
            Block vorher gegen die eigene Sektionsüberschrift versetzt. */}
        <div className="max-w-[68ch] border-t border-hairline">
          {faq.map((id, i) => (
            <Reveal key={id} delay={Math.min(i, 4) * 0.05}>
              <details className="faq group border-b border-hairline">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.05rem] leading-snug transition-colors duration-200 hover:text-brand">
                  {t(`items.${id}.q`)}
                  <Plus
                    aria-hidden
                    size={18}
                    className="shrink-0 text-brand transition-transform duration-300 ease-out group-open:rotate-45"
                  />
                </summary>
                <div className="faq-body">
                  <p className="pb-6 text-[0.95rem] leading-relaxed text-fg-muted">
                    {t(`items.${id}.a`)}
                  </p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
