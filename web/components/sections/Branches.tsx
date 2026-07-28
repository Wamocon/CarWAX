'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { branches, directionsUrl, mapEmbedUrl } from '@/lib/data/site';

/**
 * Standorte und Karte, zusammengelegt.
 *
 * Vorher waren das zwei Sektionen direkt hintereinander, und beide zählten
 * dieselben vier Filialen auf: erst vier Karten mit Adresse und Telefon, dann
 * eine Karte mit einer Auswahlliste, die genau dieselben vier Namen noch einmal
 * führte. Zwei Überschriften sagten dabei fast dasselbe („Size en yakın olanı
 * seçin." und „Size en yakın olanı seçin, haritada görün"). Für den Besucher
 * war es zweimal dieselbe Aufgabe.
 *
 * Jetzt ist es eine Aufgabe: die Filialkarten SIND die Auswahl für die Karte.
 * Nichts ist verschwunden, die Öffnungszeiten, Telefonnummern und Routenlinks
 * stehen weiter an jeder Filiale, und der Anker `#harita` funktioniert
 * unverändert, damit die Navigation nicht ins Leere zeigt.
 */
export function Branches() {
  const t = useTranslations('branches');
  const tMap = useTranslations('map');
  const [active, setActive] = useState(0);
  const current = branches[active];

  return (
    <section id="subeler" className="section" aria-labelledby="subeler-h">
      <div className="wrap">
        <SectionHeading id="subeler-h" title={t('title')} lead={t('lead')} />

        <ul className="grid gap-4 sm:grid-cols-2">
          {branches.map((b, i) => {
            const selected = i === active;
            return (
              <Reveal
                as="li"
                key={b.id}
                delay={(i % 2) * 0.06}
                className={[
                  'glass sheen transition-[border-color] duration-200 ease-out',
                  selected ? 'grad-ring' : '',
                ].join(' ')}
              >
                <article className="flex h-full flex-col p-8">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <h3 className="text-[1.35rem] tracking-[-0.02em]">{b.name}</h3>
                    {b.tier === 'premium' ? (
                      <span className="mt-1 shrink-0 border border-brand/45 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand">
                        {t('premium')}
                      </span>
                    ) : null}
                  </div>

                  <dl className="mb-7 space-y-3 text-[0.95rem] text-fg-muted">
                    <div className="flex gap-3">
                      <dt className="sr-only">{t('addressLabel')}</dt>
                      <MapPin aria-hidden size={16} className="mt-1 shrink-0 text-fg-faint" />
                      <dd>{b.address}</dd>
                    </div>
                    {b.hours ? (
                      <div className="flex gap-3">
                        <dt className="sr-only">{t('hoursLabel')}</dt>
                        <Clock aria-hidden size={16} className="mt-1 shrink-0 text-fg-faint" />
                        <dd>
                          {t('everyday')} · {b.hours}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <a
                      href={`tel:${b.phone}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-brand px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-white transition-[transform,background-color] duration-140 ease-out hover:bg-brand-hot active:scale-[0.97]"
                      aria-label={`${b.name} — ${t('call')} ${b.phoneLabel}`}
                    >
                      <Phone aria-hidden size={14} />
                      {b.phoneLabel}
                    </a>

                    {/*
                      Eigener Knopf statt die ganze Karte klickbar zu machen:
                      in der Karte stecken bereits zwei Links, und ein Klickziel
                      um zwei Links herum ist für Tastatur und Screenreader ein
                      Fehler, kein Komfort.
                    */}
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-pressed={selected}
                      aria-controls="map-frame"
                      className={[
                        'inline-flex min-h-11 items-center gap-2 rounded-[2px] border px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em]',
                        'transition-[transform,border-color,color] duration-140 ease-out active:scale-[0.97]',
                        selected
                          ? 'border-brand text-brand'
                          : 'border-hairline-strong hover:border-brand hover:text-brand',
                      ].join(' ')}
                    >
                      <MapPin aria-hidden size={14} />
                      {tMap('showOnMap')}
                    </button>

                    <a
                      href={directionsUrl(b.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-hairline-strong px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] transition-[transform,border-color,color] duration-140 ease-out hover:border-brand hover:text-brand active:scale-[0.97]"
                      aria-label={`${b.name} — ${t('route')} (${t('newTab')})`}
                    >
                      {t('route')}
                      <ArrowUpRight aria-hidden size={14} />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>

        {/* Der Anker bleibt `harita`, damit „Konum" in der Navigation weiter
            an die richtige Stelle springt. */}
        <Reveal delay={0.08}>
          <div id="harita" className="mt-4 scroll-mt-24">
            <div className="relative min-h-105 overflow-hidden rounded-sm border border-hairline bg-bg-sunken">
              <iframe
                // key erzwingt einen echten Neuaufbau beim Wechsel; ohne das
                // hält Google die zuvor geladene Ansicht fest.
                key={current.id}
                id="map-frame"
                title={`${current.name} — ${current.address}`}
                src={mapEmbedUrl(current.address)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-105 w-full border-0"
                style={{ filter: 'invert(0.92) hue-rotate(180deg) saturate(0.7)' }}
              />
            </div>
            <p
              aria-live="polite"
              className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-fg-faint"
            >
              {current.name} · {current.district}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
