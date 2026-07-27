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
    <section className="section pt-0" aria-labelledby="rakamlar-h">
      <div className="wrap">
        <h2 id="rakamlar-h" className="sr-only">
          {t('title')}
        </h2>
        <div
          ref={ref}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {counters.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05} className="glass sheen p-9">
              <span className="block font-mono text-[clamp(2.1rem,4vw,3.1rem)] font-medium leading-none tabular-nums text-brand">
                <NumberFlow
                  value={live ? c.value : 0}
                  locales={locale}
                  transformTiming={{ duration: 1600, easing: 'cubic-bezier(.23,1,.32,1)' }}
                />
              </span>
              <span className="mt-3 block font-mono text-[0.6875rem] uppercase leading-relaxed tracking-[0.2em] text-fg-faint">
                {t(c.id)}
              </span>
            </Reveal>
          ))}
        </div>
        <p className="mt-5 text-[0.85rem] text-fg-faint">{t('lead')}</p>
      </div>
    </section>
  );
}
