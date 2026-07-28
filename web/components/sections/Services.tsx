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

              {/*
                Kein `gap-px bg-hairline` mehr.

                Dieser Kniff malt den Rasterbehälter und lässt die Karten
                darin ausstanzen. Solange das Raster exakt aufgeht, sieht das
                aus wie eine Tabelle. Sobald eine Reihe nicht voll wird, ist
                die leere Zelle aber kein Loch, sondern eine ausgefüllte graue
                Fläche: der Behälter selbst.

                Vor der Gruppierung ging es auf, 17 Leistungen plus die
                Anrufkarte sind 18 Kacheln und damit genau sechs Dreierreihen.
                Die Gruppen sind 11, 3 und 3 und lassen bei zwei wie bei drei
                Spalten Reste stehen. Jetzt trägt jede Karte ihre eigene
                Haarlinie und die Lücke ist einfach unsichtbar, unabhängig
                davon, wie viele Leistungen später dazukommen.
              */}
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s, i) => (
                  <Reveal
                    as="li"
                    key={s.id}
                    delay={(i % 3) * 0.06}
                    className="group border border-hairline -mt-px -ml-px bg-bg transition-[background-color] duration-300 ease-out hover:bg-bg-raised"
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

              </ul>
            </div>
          );
        })}

        {/*
          Die Anruf-Karte ist keine Leistung und stand vorher trotzdem als
          achtzehnte Kachel zwischen den Leistungen. Als breiter Abschluss über
          die volle Textbreite ist sie schwerer zu übersehen und muss nicht mehr
          eine Rasterlücke stopfen, für die sie nie gedacht war.
        */}
        <Reveal delay={0.1}>
          <a
            href={`tel:${branches[0].phone}`}
            className="mt-14 grid items-center gap-6 border border-hairline bg-bg p-9 transition-[background-color,border-color] duration-200 hover:border-brand/40 hover:bg-bg-raised sm:grid-cols-[1fr_auto] sm:p-12"
          >
            <span>
              <span className="eyebrow mb-4">{t('helpEyebrow')}</span>
              <span className="mt-4 block max-w-[22ch] text-[clamp(1.4rem,2.6vw,2rem)] leading-snug tracking-[-0.02em]">
                {t('helpTitle')}
              </span>
              <span className="mt-3 block max-w-[52ch] text-[0.95rem] leading-relaxed text-fg-muted">
                {t('helpText')}
              </span>
            </span>

            <span className="inline-flex min-h-13 items-center gap-3 justify-self-start rounded-[2px] bg-brand px-8 font-mono text-[0.8125rem] tracking-[0.06em] text-white sm:justify-self-end">
              <Phone aria-hidden size={16} />
              {branches[0].phoneLabel}
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
