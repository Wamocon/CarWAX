'use client';

import { useRef, useState } from 'react';
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
  // Sagt der Anzeige, ob die Bahn gerade geführt wird oder ob der
  // Besucher selbst wischt. Nur im ersten Fall gibt es eine Strecke,
  // deren Fortschritt man anzeigen könnte.
  const [pinned, setPinned] = useState(false);

  useGsap(() => {
    const el = root.current;
    const st = stage.current;
    const tr = track.current;
    if (!el || !st || !tr) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();
    // Höhe zählt genauso wie Breite: auf einem quer gehaltenen Telefon (375px
    // hoch) oder in einem flachen Laptopfenster ist die gepinnte Bühne höher
    // als das Sichtfeld, und der Besucher scrollt viertausend Pixel an
    // Zitatkarten vorbei, von denen er nur die erste Zeile sieht.
    mm.add('(min-width: 768px) and (min-height: 880px)', () => {
      // Weglänge an die tatsächliche Überbreite gekoppelt statt an einen
      // festen Prozentwert. Sonst hängt die Bahn je nach Sprache
      // unterschiedlich lange fest: Russisch trägt spürbar mehr Text.
      const overhang = () => Math.max(0, tr.scrollWidth - tr.clientWidth);
      if (overhang() <= 0) return;

      // Erst jetzt den händischen Scrollbereich abschalten: ab hier führt der
      // Effekt die Bahn. Wird der Effekt zurückgedreht, kommt er zurück.
      tr.dataset.pinned = 'true';
      setPinned(true);

      /*
        Der Fortschrittsbalken ist nicht Zierde, er ist die Begründung.

        Eine gepinnte Querbahn nimmt dem Besucher den Scroll ab und schickt ihn
        seitwärts. Ohne Anhaltspunkt, wie weit er ist und wie viel noch kommt,
        ist das ein Karussell ohne Grund: man scrollt und weiß nicht, wann es
        aufhört. Mit Positionsanzeige wird daraus eine Strecke mit Anfang und
        Ende, und die Bewegung hat einen Zweck statt nur einer Wirkung.

        Läuft auf demselben Scrub wie die Bahn, kann also nicht auseinander
        driften, und kostet nur eine Transform.
      */
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
          onUpdate: (self) => {
            st.style.setProperty('--rail', String(self.progress));
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(tr, { clearProps: 'transform' });
        delete tr.dataset.pinned;
        setPinned(false);
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
          {/*
            Die Bahn ist IMMER von Hand scrollbar. Vorher stand hier
            `md:overflow-x-visible`: ab 768px verschwand der Scrollbereich und
            die Bahn war nur noch über GSAP erreichbar. Bei `prefers-reduced-
            motion` läuft GSAP aber gar nicht erst an — sieben der elf Zitate
            waren dann hinter dem `overflow-hidden` der Bühne eingesperrt, ohne
            Scrollbalken, ohne Ziehen, ohne Pfeile.

            Jetzt schaltet erst der laufende Effekt den Scrollbereich ab, per
            `data-pinned` aus dem matchMedia-Block. Kein Effekt, kein Abschalten.
          */}
          <ul
            ref={track}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 data-[pinned=true]:overflow-x-visible data-[pinned=true]:pb-0"
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

        <div className="wrap mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint">
            {t('source')}
          </p>

          {/* Nur sichtbar, solange die Bahn tatsächlich geführt wird. Auf dem
              Telefon wischt der Besucher selbst und sieht seinen Fortschritt
              am Einrasten der Karten. */}
          <div
            aria-hidden
            className="hidden h-px w-40 shrink-0 bg-hairline-strong data-[pinned=true]:block"
            data-pinned={pinned}
          >
            <div
              className="h-px origin-left bg-brand"
              style={{ transform: 'scaleX(var(--rail, 0))' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
