import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Tilt } from '@/components/anim/Tilt';
import { Phone } from 'lucide-react';
import { services, branches } from '@/lib/data/site';

/**
 * Reihenfolge der Gruppen. Schutz und Beschichtung ist das Kerngeschäft und
 * steht deshalb vorn; Reparatur schließt ab, weil das der seltenste Anlass ist.
 */
const GROUPS = ['koruma', 'ic', 'onarim'] as const;

/**
 * Siebzehn Leistungen, nach Anlass gruppiert statt in einer Reihe.
 *
 * Vorher lagen alle siebzehn in einem einzigen flachen Raster, knapp 2900px
 * hoch. Niemand liest siebzehn gleichwertige Kacheln; man überfliegt sie und
 * merkt sich keine. Wer mit „mein Lack ist stumpf" kommt, muss nicht an
 * Ses Yalıtımı und Cam Çatlak Tamiri vorbeiscrollen, um Pasta & Cila zu finden.
 *
 * Die Einteilung ist nicht erfunden: `group` steht seit jeher an jeder
 * Leistung in `site.ts` und stammt aus der Menüstruktur des Kunden
 * (Koruma & Kaplama, İç Bakım & Koruma, Onarım & Düzeltme). Sie wurde bisher
 * nur nicht angezeigt.
 *
 * Keine Leistung fällt weg. Es sind dieselben siebzehn, nur auffindbar.
 */
export function Services() {
  const t = useTranslations('services');

  return (
    <section id="hizmetler" className="section wash-brand" aria-labelledby="hizmetler-h">
      <div className="wrap">
        <SectionHeading
          id="hizmetler-h"
          size="lg"
          title={t('title')}
          lead={t('lead')}
        />

        {GROUPS.map((group, gi) => {
          const items = services.filter((s) => s.group === group);
          if (items.length === 0) return null;

          return (
            <div key={group} className={gi > 0 ? 'mt-16' : undefined}>
              <Reveal>
                <h3 className="mb-6 flex items-baseline gap-4 border-b border-hairline pb-4">
                  <span className="text-[1.35rem] tracking-[-0.02em]">
                    {t(`groups.${group}`)}
                  </span>
                  <span className="font-mono text-[0.6875rem] tabular-nums text-fg-faint">
                    {items.length}
                  </span>
                </h3>
              </Reveal>

              <ul className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s, i) => (
                  <Reveal
                    as="li"
                    key={s.id}
                    delay={(i % 3) * 0.06}
                    className="group bg-bg transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1"
                  >
                    <Tilt className="h-full">
                      <article className="flex h-full flex-col">
                        <div className="relative aspect-16/10 overflow-hidden">
                          <Image
                            src={s.img}
                            alt={t(`${s.id}.title`)}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-600 ease-out motion-safe:group-hover:scale-[1.04]"
                          />
                          <div
                            aria-hidden
                            className="absolute inset-0 bg-linear-to-t from-bg via-bg/10 to-transparent"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-7">
                          <h4 className="mb-2 text-[1.15rem] tracking-[-0.015em]">
                            {t(`${s.id}.title`)}
                          </h4>
                          <p className="text-[0.95rem] leading-relaxed text-fg-muted">
                            {t(`${s.id}.text`)}
                          </p>
                        </div>
                      </article>
                    </Tilt>
                  </Reveal>
                ))}

                {/* Die Anruf-Karte hängt an der letzten Gruppe und füllt dort
                    die freie Rasterzelle. Sie fängt alle ab, die nach siebzehn
                    Leistungen immer noch nicht wissen, was sie brauchen. */}
                {group === GROUPS[GROUPS.length - 1] ? (
                  <Reveal as="li" delay={0.12} className="bg-bg">
                    <a
                      href={`tel:${branches[0].phone}`}
                      className="flex h-full flex-col justify-center gap-4 p-9 transition-[background-color] duration-200 hover:bg-bg-raised"
                    >
                      <span className="eyebrow">{t('helpEyebrow')}</span>
                      <span className="text-[1.35rem] leading-snug tracking-[-0.02em]">
                        {t('helpTitle')}
                      </span>
                      <span className="text-[0.95rem] text-fg-muted">{t('helpText')}</span>
                      <span className="mt-2 inline-flex items-center gap-2 font-mono text-[0.8125rem] text-brand">
                        <Phone aria-hidden size={14} />
                        {branches[0].phoneLabel}
                      </span>
                    </a>
                  </Reveal>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
