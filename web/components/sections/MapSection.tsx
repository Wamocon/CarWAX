'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, ArrowUpRight, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { branches, directionsUrl, mapEmbedUrl } from '@/lib/data/site';

/**
 * Eine Karte, vier Standorte, umschaltbar.
 *
 * Bewusst ein einziges iframe statt vier: vier eingebettete Karten sind vier
 * fremde Skript-Ladungen und vierfaches Layout-Gewicht. Umgeschaltet wird
 * über `key`, damit React das iframe wirklich neu lädt statt nur die src zu
 * tauschen — sonst hält Google die alte Ansicht fest.
 */
export function MapSection() {
  const t = useTranslations('map');
  const [active, setActive] = useState(0);
  const branch = branches[active];

  return (
    <section id="harita" className="section" aria-labelledby="harita-h">
      <div className="wrap">
        <SectionHeading
          id="harita-h"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <Reveal>
          <div className="grid gap-px overflow-hidden rounded-[4px] bg-hairline lg:grid-cols-[320px_1fr]">
            {/* Standortliste — auch die Auswahl, nicht nur Deko */}
            <ul
              className="bg-bg-raised"
              role="tablist"
              aria-label={t('tablistLabel')}
            >
              {branches.map((b, i) => {
                const selected = i === active;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      role="tab"
                      id={`map-tab-${b.id}`}
                      aria-selected={selected}
                      aria-controls="map-frame"
                      onClick={() => setActive(i)}
                      className={[
                        // Der letzte Eintrag bekommt keine Trennlinie — sonst
                        // steht unter der Liste ein Strich ins Leere.
                        'w-full px-6 py-5 text-left',
                        i < branches.length - 1 ? 'border-b border-hairline' : '',
                        'transition-[background-color,border-color] duration-200 ease-out',
                        selected ? 'bg-glass-strong' : 'hover:bg-glass',
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2.5">
                        <MapPin
                          aria-hidden
                          size={15}
                          className={selected ? 'text-brand' : 'text-fg-faint'}
                        />
                        <span className="text-[1rem]">{b.name}</span>
                      </span>
                      <span className="mt-1.5 block pl-[26px] font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint">
                        {b.district}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="relative min-h-[380px] bg-bg-sunken">
              <iframe
                // key erzwingt einen echten Neuaufbau beim Wechsel
                key={branch.id}
                id="map-frame"
                role="tabpanel"
                aria-labelledby={`map-tab-${branch.id}`}
                title={`${branch.name} — ${branch.address}`}
                src={mapEmbedUrl(branch.address)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[380px] w-full border-0"
                style={{ filter: 'invert(0.92) hue-rotate(180deg) saturate(0.7)' }}
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="mr-auto text-[0.95rem] text-fg-muted">{branch.address}</p>
            <a
              href={`tel:${branch.phone}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-brand px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-white transition-[transform,background-color] duration-140 ease-out hover:bg-brand-hot active:scale-[0.97]"
            >
              <Phone aria-hidden size={14} />
              {branch.phoneLabel}
            </a>
            <a
              href={directionsUrl(branch.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="sheen inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-hairline-strong px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] transition-[transform,border-color,color] duration-140 ease-out hover:border-brand hover:text-brand active:scale-[0.97]"
            >
              {t('route')}
              <ArrowUpRight aria-hidden size={14} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
