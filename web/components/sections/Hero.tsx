'use client';

import { useTranslations } from 'next-intl';
import { motion, type Variants } from 'motion/react';
import { GlossSweep } from '@/components/anim/GlossSweep';
import { Button } from '@/components/ui/Button';
import { branches } from '@/lib/data/site';

/** --ease-out aus dem Designsystem. Als Tupel, sonst weitet TS es zu number[]. */
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Der Text steigt zeilenweise aus einer Maske auf. Jede Zeile liegt in einem
 * `overflow-hidden`-Container, der Inhalt startet auf translateY(102%).
 * Staffel 70 ms — kurz genug, dass es als eine Bewegung gelesen wird.
 */
const line: Variants = {
  hidden: { y: '102%' },
  show: (i: number) => ({
    y: '0%',
    transition: { duration: 1.05, delay: 0.12 + i * 0.07, ease: EASE_OUT },
  }),
};

const fade: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (d: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: d, ease: EASE_OUT },
  }),
};

export function Hero() {
  const t = useTranslations('hero');

  return (
    <header className="relative flex min-h-svh items-end overflow-hidden">
      <GlossSweep
        src="/img/hero-studio.jpg"
        alt=""
        className="absolute inset-0 -z-10"
      />

      {/*
        Textschleier. Der Hero bleibt in beiden Modi dunkel: das Motiv ist ein
        dunkel gegradetes Foto, und weiße Schrift darauf funktioniert immer.
        Der Schleier ist deshalb bewusst NICHT an die Modusfarbe gekoppelt.
        Nur die letzten Prozent laufen in die Bühnenfarbe aus, damit im hellen
        Modus keine harte schwarze Kante zur nächsten Sektion steht.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: [
            'linear-gradient(90deg, rgba(8,10,14,.86) 0%, rgba(8,10,14,.5) 40%, transparent 68%)',
            'linear-gradient(180deg, rgba(8,10,14,.84) 0%, rgba(8,10,14,.22) 30%, rgba(8,10,14,.72) 72%, rgba(8,10,14,.82) 88%, var(--color-bg) 100%)',
          ].join(','),
        }}
      />

      {/* on-dark definiert die Farbtokens lokal um: hell auf Foto, in beiden Modi. */}
      <div className="on-dark wrap relative z-20 pb-[clamp(46px,8vh,104px)]">
        {/*
          Kein Label über der Headline mehr. Vorher stand hier
          „Antalya · 1989'dan beri" — eine Information, die die Vertrauensleiste
          direkt darunter ohnehin trägt, und in dieser Position nichts weiter
          als der Kicker, an dem man eine Vorlage erkennt. Die Headline beginnt
          jetzt auf der ersten Zeile.

          Auch der Farbverlauf auf der Schlusszeile ist weg. Betonung kommt aus
          Gewicht und Grad; ein Verlauf über Schrift ist Dekoration, die auf
          hellem Grund zusätzlich Kontrast kostet.
        */}
        <h1 className="display mb-7">
          {(['l1', 'l2', 'l3'] as const).map((k, i) => (
            <span key={k} className="block overflow-hidden">
              <motion.span
                className="block"
                variants={line}
                initial="hidden"
                animate="show"
                custom={i}
              >
                {t(`title.${k}`)}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="lead mb-9 max-w-[52ch]"
          variants={fade}
          initial="hidden"
          animate="show"
          custom={0.45}
        >
          {t('sub')}
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-3.5"
          variants={fade}
          initial="hidden"
          animate="show"
          custom={0.6}
        >
          <Button href={`tel:${branches[0].phone}`}>{t('ctaPrimary')}</Button>
          <Button href="#hizmetler" variant="ghost">
            {t('ctaSecondary')}
          </Button>
        </motion.div>
      </div>
    </header>
  );
}
