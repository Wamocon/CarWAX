'use client';

import { useEffect, useRef } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Lenis + GSAP.
 *
 * Beide wollen den Frame-Loop besitzen. Laufen sie getrennt, driftet
 * ScrollTrigger um einen Frame gegen den geglätteten Scrollwert — sichtbar
 * als Zittern bei gepinnten Sektionen. Deshalb hängt Lenis' raf an GSAPs
 * Ticker, lagSmoothing ist aus, und ScrollTrigger.update läuft auf Lenis'
 * scroll-Ereignis. Genau die Reihenfolge, die die Lenis-Doku vorgibt.
 *
 * Zur Bildrate: GSAPs Ticker läuft auf requestAnimationFrame und folgt damit
 * der Bildwiederholrate des Displays — auf einem 120-Hz-Panel also 120 fps,
 * ohne Zutun. Was man dafür NICHT tun darf, ist `gsap.ticker.fps()` auf einen
 * festen Wert zu setzen: das deckelt die Rate hart auf 60 und fühlt sich auf
 * schnellen Displays schlechter an als gar keine Glättung.
 *
 * `lagSmoothing(0)` ist hier Pflicht, nicht Geschmack: mit aktivierter
 * Glättung springt GSAP nach einem langen Frame in der Zeit vorwärts, und
 * eine scrub-gebundene Animation rutscht sichtbar gegen die Scrollposition.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Wer reduzierte Bewegung eingestellt hat, bekommt natives Scrollen.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    const onScroll = () => ScrollTrigger.update();
    lenisRef.current?.lenis?.on('scroll', onScroll);

    return () => {
      gsap.ticker.remove(update);
      lenisRef.current?.lenis?.off('scroll', onScroll);
    };
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        // 0.09 ist der Punkt, an dem die Seite nachläuft, ohne schwammig zu
        // werden. Darunter fühlt sie sich träge an, darüber wieder hart.
        lerp: 0.09,
        wheelMultiplier: 1,
        // Touch bleibt nativ: ein geglättetes Wischen auf dem Telefon fühlt
        // sich falsch an, weil es nicht am Finger klebt.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
