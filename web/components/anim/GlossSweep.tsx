'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Die Signature.
 *
 * Zwei identische Bilder übereinander: oben matt, darunter versiegelt. Eine
 * Lichtkante wandert durch und wischt die matte Ebene per `clip-path: inset()`
 * weg. Was zurückbleibt, ist Spiegelglanz.
 *
 * Das ist keine Dekoration — es ist exakt das, was eine Keramikversiegelung
 * physisch tut. Die Animation *ist* das Produktversprechen.
 *
 * Warum clip-path und nicht ein maskiertes Overlay: clip-path läuft auf dem
 * Compositor, kostet kein Layout und kein Paint, und lässt sich mit einer
 * einzigen Zahl steuern. Die Kante bekommt dieselbe Zahl — dadurch können
 * Wischkante und Enthüllung nicht auseinanderlaufen.
 *
 * Läuft bewusst über 2,2 s. Das ist weit über den 300 ms für UI-Animationen,
 * aber das hier ist keine Interaktion, sondern eine Marketing-Animation, die
 * genau einmal beim Eintritt erzählt.
 */
export function GlossSweep({
  src,
  alt = '',
  className,
  duration = 2200,
  play = true,
}: {
  src: string;
  alt?: string;
  className?: string;
  duration?: number;
  play?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || !play) return;

    // Reduzierte Bewegung: kein Wisch, aber das Ergebnis zeigen wir trotzdem.
    if (reduced) {
      el.style.setProperty('--sweep', '100%');
      return;
    }

    let raf = 0;
    let start: number | null = null;
    el.style.setProperty('--sweep', '0%');
    el.style.setProperty('--edge-opacity', '1');

    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      // Starkes Ausrollen — dieselbe Kurve wie --ease-out im Designsystem.
      const eased = 1 - Math.pow(1 - p, 4);
      el.style.setProperty('--sweep', `${(eased * 100).toFixed(2)}%`);
      if (p < 1) raf = requestAnimationFrame(step);
      else el.style.setProperty('--edge-opacity', '0');
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [play, reduced, duration, src]);

  return (
    <div
      ref={root}
      className={className}
      style={{ '--sweep': '100%', '--edge-opacity': '0' } as React.CSSProperties}
      role="img"
      aria-label={alt}
    >
      {/* versiegelt — liegt unten und wird aufgedeckt */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          filter: 'saturate(1.14) brightness(1.02) contrast(1.16)',
        }}
      />
      {/* matt — liegt oben und wird weggewischt */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          filter: 'saturate(0.34) brightness(0.54) contrast(1.04)',
          clipPath: 'inset(0 0 0 var(--sweep))',
        }}
      />
      {/* die Kante selbst */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[10%] -bottom-[10%] w-[clamp(90px,12vw,190px)] mix-blend-screen"
        style={{
          left: 'var(--sweep)',
          transform: 'translateX(-50%) skewX(-9deg)',
          opacity: 'var(--edge-opacity)',
          transition: 'opacity 500ms var(--ease-out)',
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.05) 34%, rgba(255,255,255,.55) 49%, rgba(255,255,255,.9) 50%, rgba(255,255,255,.5) 51%, rgba(236,28,36,.3) 62%, transparent 100%)',
        }}
      />
    </div>
  );
}
