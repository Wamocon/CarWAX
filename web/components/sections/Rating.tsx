import { useTranslations } from 'next-intl';
import { Star, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { aggregateRating, branches, reviewUrl } from '@/lib/data/site';

/**
 * Google-Bewertung mit Sternen.
 *
 * Die Sektion liest den Wert aus `rating` und entscheidet selbst, wie sie
 * auftritt: ab `proudFrom` als Auszeichnung, darunter als offene Bitte um
 * Bewertungen. Damit muss beim Sanieren niemand Code anfassen — nur die Zahl.
 *
 * Der aktuelle Wert ist 2,6. Eine schlechte Bewertung zu verstecken, während
 * sie einen Klick entfernt in Google steht, wirkt schlechter als sie zu
 * benennen; sie zu benennen und um Rückmeldung zu bitten, ist die einzige
 * Fassung, die dem Besucher gegenüber ehrlich bleibt.
 */
export function Rating() {
  const t = useTranslations('rating');
  const rating = aggregateRating();
  const branch = branches[0];
  if (!rating) return null;
  const proud = rating.value >= rating.proudFrom;
  const pct = (rating.value / rating.scale) * 100;

  return (
    <section
      id="degerlendirme"
      className="section wash-brand border-y border-hairline"
      aria-labelledby="degerlendirme-h"
    >
      <div className="wrap">
        <div className="grid items-center gap-12 lg:grid-cols-[auto_1fr]">
          <Reveal>
            <div className="glass grad-ring flex flex-col items-center gap-4 px-12 py-10 text-center">
              <span className="font-mono text-[3.4rem] font-medium leading-none tabular-nums">
                {rating.value.toLocaleString('tr-TR', { minimumFractionDigits: 1 })}
              </span>

              {/* Sterne als zwei Ebenen: graue Basis, farbige Füllung darüber
                  auf exakt den Prozentsatz beschnitten. So stimmt auch der
                  halbe Stern, statt auf die nächste Ganzzahl zu runden. */}
              <span
                className="relative inline-flex"
                role="img"
                aria-label={t('starsLabel', {
                  value: rating.value,
                  scale: rating.scale,
                })}
              >
                <span aria-hidden className="flex gap-1">
                  {Array.from({ length: rating.scale }, (_, i) => (
                    <Star key={i} size={22} className="text-fg-faint/40" />
                  ))}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 flex gap-1 overflow-hidden"
                  style={{ width: `${pct}%` }}
                >
                  {Array.from({ length: rating.scale }, (_, i) => (
                    <Star
                      key={i}
                      size={22}
                      className="shrink-0"
                      style={{ color: 'var(--color-star)', fill: 'var(--color-star)' }}
                    />
                  ))}
                </span>
              </span>

              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-faint">
                {t('count', { count: rating.count })}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            {/* Diese Sektion baut ihre Überschrift selbst, braucht die
                Kapitelnummer aber trotzdem: sonst reißt die Zählung genau
                hier eine Lücke. */}
            <p className="eyebrow mb-5">
              {t('eyebrow')}
              <span aria-hidden className="chapter" />
            </p>
            <h2 id="degerlendirme-h" className="h2 mb-5">
              {proud ? t('proudTitle') : t('honestTitle')}
            </h2>
            <p className="lead mb-8">
              {proud ? t('proudLead') : t('honestLead')}
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={reviewUrl(branch.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="sheen inline-flex min-h-13 items-center gap-3 rounded-[2px] bg-brand px-8 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-white transition-[transform,background-color] duration-140 ease-out hover:bg-brand-hot active:scale-[0.97]"
              >
                {t('cta')}
                <ArrowUpRight aria-hidden size={15} />
              </a>
            </div>

            <p className="mt-6 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint">
              {t('source', { date: rating.verifiedAt })}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
