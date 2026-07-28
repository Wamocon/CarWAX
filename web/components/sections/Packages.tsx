import { useTranslations } from 'next-intl';
import { Check, Phone, Clock } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { packages, branches } from '@/lib/data/site';

/** Kompakt sichtbar; der Rest steht hinter einer Aufklapp-Zeile. */
const VISIBLE = 5;

/**
 * Alle sechs Uygulama Paketleri, geordnet nach Familie und Stufe:
 * Shine (Lack) → Deep (Innenraum) → Full (beides), je Eko vor Plus.
 * Full Plus steht als Gipfel hervorgehoben am Ende.
 *
 * Zwei Dinge tragen die Sektion, und beide sind vom Kunden belegt statt
 * ausgedacht: die Anwendungsdauer und die vollständige Inhaltsliste. Lange
 * Pakete führen bis zu sechzehn Punkte — die Karte zeigt fünf und legt den
 * Rest in ein natives <details>. Kein Zustand, kein JavaScript, funktioniert
 * ohne Hydration und bleibt für Screenreader eine saubere Aufklappgruppe.
 */
export function Packages() {
  const t = useTranslations('packages');

  return (
    <section
      id="paketler"
      className="section wash-brand border-y border-hairline"
      aria-labelledby="paketler-h"
    >
      <div className="wrap">
        <SectionHeading
          id="paketler-h"
          title={t('title')}
          lead={t('lead')}
        />

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((p, i) => {
            const shown = p.includes.slice(0, VISIBLE);
            const rest = p.includes.slice(VISIBLE);

            return (
              <Reveal
                as="li"
                key={p.id}
                delay={(i % 3) * 0.05}
                className={p.featured ? 'glass grad-ring glow-brand' : 'glass sheen'}
              >
                <article className="flex h-full flex-col p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        'inline-block border px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em]',
                        p.tier === 'plus'
                          ? 'border-brand/45 text-brand'
                          : 'border-hairline-strong text-fg-faint',
                      ].join(' ')}
                    >
                      {t(`tier.${p.tier}`)}
                    </span>
                    {p.featured ? (
                      <span className="inline-block border border-brand/45 bg-brand/10 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand">
                        {t('featured')}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mb-3 text-[1.3rem] tracking-[-0.02em]">
                    {t(`${p.id}.title`)}
                  </h3>
                  <p className="mb-5 text-[0.95rem] leading-relaxed text-fg-muted">
                    {t(`${p.id}.text`)}
                  </p>

                  {/* Die Dauer ist die ehrlichste Zahl der Seite: sie sagt dem
                      Besucher, ob er wartet oder das Auto dalässt. Kein
                      Wettbewerber in Antalya nennt sie. */}
                  {p.hours ? (
                    <p className="mb-6 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-fg-faint">
                      <Clock aria-hidden size={13} className="text-brand" />
                      {t('duration', { hours: p.hours })}
                    </p>
                  ) : null}

                  <ul className="mb-5 space-y-2.5">
                    {shown.map((k) => (
                      <li key={k} className="flex gap-2.5 text-[0.9rem] text-fg-muted">
                        <Check aria-hidden size={15} className="mt-1 shrink-0 text-brand" />
                        {t(`includes.${k}`)}
                      </li>
                    ))}
                  </ul>

                  {rest.length > 0 ? (
                    <details className="group mb-6">
                      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-fg-faint transition-colors duration-200 hover:text-fg">
                        <span className="grid h-4 w-4 place-items-center border border-hairline-strong text-[0.75rem] leading-none">
                          <span aria-hidden className="group-open:hidden">
                            +
                          </span>
                          <span aria-hidden className="hidden group-open:inline">
                            –
                          </span>
                        </span>
                        {t('more', { count: rest.length })}
                      </summary>
                      <ul className="mt-3 space-y-2.5">
                        {rest.map((k) => (
                          <li key={k} className="flex gap-2.5 text-[0.9rem] text-fg-muted">
                            <Check aria-hidden size={15} className="mt-1 shrink-0 text-brand" />
                            {t(`includes.${k}`)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : null}

                  <a
                    href={`tel:${branches[0].phone}`}
                    className="mt-auto inline-flex min-h-11 items-center gap-2 self-start font-mono text-[0.75rem] tracking-[0.06em] text-brand transition-opacity duration-140 ease-out hover:opacity-80"
                  >
                    <Phone aria-hidden size={14} />
                    {t('askPrice')}
                  </a>
                </article>
              </Reveal>
            );
          })}
        </ul>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[0.85rem] text-fg-faint">{t('note')}</p>
        </Reveal>
      </div>
    </section>
  );
}
