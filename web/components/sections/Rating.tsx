import { useTranslations, useFormatter } from 'next-intl';
import { Star, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { aggregateRating, branches, reviewUrl } from '@/lib/data/site';

/**
 * Google-Bewertung mit Sternen — als Auszeichnung, nicht als Bekenntnis.
 *
 * Die Sektion erscheint erst ab `proudFrom` (4,5). Darunter rendert sie gar
 * nichts. Der aktuelle Wert liegt bei 2,6, also ist sie derzeit unsichtbar,
 * und das ist eine Entscheidung des Kunden: die eigene schwache Zahl auf der
 * eigenen Startseite zu wiederholen ist unüblich, und kein Wettbewerber in
 * Antalya tut es.
 *
 * Sie bleibt trotzdem im Code. Sobald die Sanierung greift und der Schnitt
 * über 4,5 steigt, kommt die Auszeichnung von allein zurück; es genügt, die
 * Zahl in `branchRatings` nachzuführen.
 */
export function Rating() {
  const t = useTranslations('rating');
  // Fest auf 'tr-TR' formatiert stand auf der englischen Seite "2,6",
  // was ein englischer Leser als Tausendertrenner liest. Ausgerechnet die
  // eine Zahl, die hier bewusst ehrlich steht.
  const format = useFormatter();
  const rating = aggregateRating();
  const branch = branches[0];

  /*
    Die Sektion zeigt sich nur, wenn die Zahl sie trägt.

    Auf Wunsch des Kunden erscheinen die Sterne nicht, solange die Bewertung
    unter `proudFrom` liegt. Bewusst als Schwelle und nicht als gelöschte
    Sektion: die Auszeichnung ist fertig gebaut und kommt von selbst zurück,
    sobald sie verdient ist. Niemand muss dafür Code anfassen oder sich in
    zwei Jahren daran erinnern, dass es sie einmal gab.

    Was das NICHT ändert: was in Google steht. Die Zahl liegt einen Klick
    entfernt in Maps, ob wir sie hier wiederholen oder nicht. Der einzige
    Hebel sind neue, gute Bewertungen, und die Einladung dazu steht jetzt
    im Kontaktbereich.
  */
  if (!rating || rating.value < rating.proudFrom) return null;

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
                {format.number(rating.value, { minimumFractionDigits: 1 })}
              </span>

              {/* Sterne als zwei Ebenen: graue Basis, farbige Füllung darüber
                  auf exakt den Prozentsatz beschnitten. So stimmt auch der
                  halbe Stern, statt auf die nächste Ganzzahl zu runden. */}
              <span
                className="relative inline-flex"
                role="img"
                aria-label={t('starsLabel', {
                  value: format.number(rating.value, { minimumFractionDigits: 1 }),
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
            <h2 id="degerlendirme-h" className="h2 mb-5">
              {t('proudTitle')}
            </h2>
            <p className="lead mb-8">
              {t('proudLead')}
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
              {t('source', {
                date: format.dateTime(new Date(rating.verifiedAt), {
                  dateStyle: 'long',
                }),
              })}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
