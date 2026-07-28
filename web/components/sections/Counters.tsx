'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import NumberFlow from '@number-flow/react';
import { Reveal } from '@/components/ui/Reveal';
import { counters } from '@/lib/data/site';

/**
 * Echte, vom Konzern veröffentlichte Zahlen — deshalb dürfen sie so groß stehen.
 *
 * NumberFlow animiert die Ziffern einzeln statt den ganzen Text neu zu setzen.
 * Startwert 0, damit der Anstieg überhaupt sichtbar ist; ausgelöst erst, wenn
 * das Band im Bild ist, sonst läuft die Animation ins Leere.
 */
export function Counters() {
  const t = useTranslations('counters');
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    /*
      Ein Band, keine Sektion.

      Vorher standen die vier Zahlen als Glaskarten im selben Raster und mit
      derselben Höhe wie jede andere Sektion. Damit war es der elfte Block in
      einer Reihe gleich hoher Blöcke. Jetzt läuft es randlos über die volle
      Breite, sitzt auf der abgesenkten Fläche und ist bewusst flach: es
      trennt zwei große Sektionen, statt selbst eine zu sein.

      Die Karten sind weg. Die Zahlen brauchen keinen Rahmen, sie brauchen
      Platz; die Haarlinien zwischen den Spalten reichen als Gliederung.
    */
    <section
      className="relative border-y border-hairline bg-bg-sunken"
      aria-labelledby="rakamlar-h"
    >
      <h2 id="rakamlar-h" className="sr-only">
        {t('title')}
      </h2>

      <div
        ref={ref}
        className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4"
      >
        {counters.map((c, i) => (
          <Reveal
            key={c.id}
            delay={i * 0.05}
            className="bg-bg-sunken px-[clamp(20px,4vw,48px)] py-[clamp(40px,6vw,72px)]"
          >
            <span className="block font-mono text-[clamp(2.3rem,4.4vw,3.4rem)] font-medium leading-none tabular-nums text-brand">
              <NumberFlow
                value={live ? c.value : 0}
                locales={locale}
                transformTiming={{ duration: 1600, easing: 'cubic-bezier(.23,1,.32,1)' }}
              />
            </span>
            <span className="mt-4 block font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.2em] text-fg-faint">
              {t(c.id)}
            </span>
          </Reveal>
        ))}
      </div>

      <p className="wrap py-6 text-[0.85rem] text-fg-faint">{t('lead')}</p>
    </section>
  );
}
