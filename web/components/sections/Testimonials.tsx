'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { testimonials } from '@/lib/data/site';
import { useGsap } from '@/lib/hooks';

/**
 * Kundenstimmen als Bahn, die beim Scrollen quer läuft.
 *
 * Warum quer statt Raster: elf Zitate untereinander sind eine Textwand, und
 * ein Raster zwingt alle auf dieselbe Höhe, obwohl die Zitate verschieden lang
 * sind. Die Bahn nimmt die Länge, wie sie kommt. Die Querbewegung ist zugleich
 * der zweite Moment auf der Seite, der ohne Erklärung teuer aussieht.
 *
 * Ab 768px gepinnt und am Scrollrad geführt, darunter ein normaler Wischbereich
 * mit Snap. Eine gepinnte Querbahn auf dem Telefon kostet mehr Bedienbarkeit,
 * als sie an Wirkung bringt.
 *
 * HERKUNFT: Die elf Zitate stehen so auf carwax.com.tr unter „Müşteri
 * Yorumları". Das sind keine Google-Rezensionen; die Fußzeile der Sektion
 * nennt die Quelle offen, und direkt darunter folgt die ungeschönte 2,6.
 */
export function Testimonials() {
  const t = useTranslations('testimonials');
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGsap(() => {
    const el = root.current;
    const st = stage.current;
    const tr = track.current;
    if (!el || !st || !tr) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      // Weglänge an die tatsächliche Überbreite gekoppelt statt an einen
      // festen Prozentwert. Sonst hängt die Bahn je nach Sprache
      // unterschiedlich lange fest: Russisch trägt spürbar mehr Text.
      const overhang = () => Math.max(0, tr.scrollWidth - tr.clientWidth);
      if (overhang() <= 0) return;

      const tween = gsap.to(tr, {
        x: () => -overhang(),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${overhang() + window.innerHeight * 0.35}`,
          pin: st,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(tr, { clearProps: 'transform' });
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      id="yorumlar"
      className="border-y border-hairline"
      aria-labelledby="yorumlar-h"
    >
      <div ref={stage} className="section wash-ember overflow-hidden">
        <div className="wrap">
          <SectionHeading
            id="yorumlar-h"
            eyebrow={t('eyebrow')}
            title={t('title')}
            lead={t('lead')}
          />
        </div>

        {/*
          Die Bahn liegt in `.wrap`, überschreitet dessen Breite aber bewusst.
          Ab Tablet läuft sie deshalb sichtbar rechts aus dem Bild — das ist
          das Signal „hier geht es weiter". Darunter wird derselbe Kasten zum
          Wischbereich mit Einrastpunkten.
        */}
        <div className="wrap">
          <ul
            ref={track}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:overflow-x-visible md:pb-0"
          >
            {testimonials.map((c) => (
              <li key={c.id} className="w-[min(84vw,25rem)] shrink-0 snap-start">
                <figure className="glass flex h-full flex-col gap-5 p-8">
                  <Quote aria-hidden size={22} className="shrink-0 text-brand" />
                  <blockquote className="flex-1 text-[0.975rem] leading-relaxed text-fg-muted">
                    {t(`items.${c.id}`)}
                  </blockquote>
                  <figcaption className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-faint">
                    {c.name}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <div className="wrap">
          <p className="mt-8 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint">
            {t('source')}
          </p>
        </div>
      </div>
    </section>
  );
}
