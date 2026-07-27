'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGsap } from '@/lib/hooks';

/**
 * Die Signature, jetzt am Scroll.
 *
 * Die Sektion wird gepinnt, und der Versiegelungs-Wisch folgt exakt dem
 * Scrollrad: der Nutzer *fährt* die Beschichtung selbst über den Lack. Das
 * ist der Unterschied zwischen einer Animation, die abläuft, und einer, die
 * man bedient — und der Grund, warum es sich teuer anfühlt statt dekoriert.
 *
 * Technisch ist der ganze Effekt eine einzige Zahl: `--sweep` von 0 auf 100.
 * Daran hängen der Beschnitt der matten Ebene, die Position der Lichtkante
 * und die Deckkraft der beiden Bildunterschriften. Kein Layout, kein Paint,
 * nur Compositing — deshalb bleibt es auch auf 120-Hz-Displays sauber.
 */
export function ScrollGloss({ src }: { src: string }) {
  const t = useTranslations('gloss');
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGsap(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: '+=180%',
        pin: st,
        scrub: 0.6,
        anticipatePin: 1,
      },
    });

    tl.fromTo(
      st,
      { '--sweep': '0%' },
      { '--sweep': '100%', ease: 'none' },
      0,
    )
      // Die Kante ist nur währenddessen sichtbar, nicht davor und nicht danach.
      .fromTo(
        st,
        { '--edge': 0 },
        { '--edge': 1, duration: 0.12, ease: 'none' },
        0,
      )
      .to(st, { '--edge': 0, duration: 0.12, ease: 'none' }, 0.88)
      // Bildunterschriften kreuzen sich in der Mitte des Wischs.
      .fromTo(
        '[data-cap="before"]',
        { opacity: 1 },
        { opacity: 0, duration: 0.25, ease: 'none' },
        0.32,
      )
      .fromTo(
        '[data-cap="after"]',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'none' },
        0.42,
      );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="gloss-scroll-h"
      className="relative h-[280vh]"
    >
      <div
        ref={stage}
        className="relative h-screen w-full overflow-hidden"
        style={
          {
            '--sweep': '0%',
            '--edge': 0,
          } as React.CSSProperties
        }
      >
        {/* versiegelt: liegt unten und wird aufgedeckt */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${src})`,
            filter: 'saturate(1.16) brightness(1.03) contrast(1.16)',
          }}
        />
        {/* matt: liegt oben und wird weggewischt */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${src})`,
            filter: 'saturate(0.3) brightness(0.5) contrast(1.02)',
            clipPath: 'inset(0 0 0 var(--sweep))',
          }}
        />
        {/* die Lichtkante läuft auf derselben Zahl mit */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[10%] -bottom-[10%] w-[clamp(90px,12vw,200px)] mix-blend-screen"
          style={{
            left: 'var(--sweep)',
            transform: 'translateX(-50%) skewX(-9deg)',
            opacity: 'var(--edge)',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.05) 34%, rgba(255,255,255,.6) 49%, rgba(255,255,255,.95) 50%, rgba(255,255,255,.55) 51%, rgba(236,28,36,.32) 62%, transparent 100%)',
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(8,8,10,.72) 0%, transparent 34%, rgba(8,8,10,.55) 78%, rgba(8,8,10,.88) 100%)',
          }}
        />

        <div className="wrap absolute inset-x-0 bottom-[clamp(48px,10vh,120px)]">
          <p className="eyebrow mb-5 text-white">{t('eyebrow')}</p>
          <h2
            id="gloss-scroll-h"
            className="h2 mb-4 max-w-[16ch] text-white"
          >
            {t('title')}
          </h2>
          <div className="relative h-[3.5em] max-w-[54ch]">
            <p
              data-cap="before"
              className="absolute inset-0 text-[1rem] leading-relaxed text-white/70"
            >
              {t('scrollBefore')}
            </p>
            <p
              data-cap="after"
              className="absolute inset-0 text-[1rem] leading-relaxed text-white/85"
            >
              {t('scrollAfter')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
