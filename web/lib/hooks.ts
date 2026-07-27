'use client';

import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';

/**
 * useLayoutEffect warnt auf dem Server. Auf dem Client wollen wir aber das
 * Layout-Timing, damit GSAP misst, bevor der Nutzer den Sprung sieht.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * GSAP-Kontext als Hook.
 *
 * `gsap.context()` sammelt alles, was im Callback erzeugt wird, und räumt es
 * mit einem Aufruf wieder ab. Ohne das überlebt bei jedem Sprachwechsel ein
 * ScrollTrigger, der auf ein längst entferntes Element zeigt — und die Seite
 * wird von Navigation zu Navigation langsamer.
 *
 * Bei reduzierter Bewegung läuft der Callback gar nicht erst: die Inhalte
 * stehen dann in ihrem Endzustand, statt auf einen Scroll zu warten, der
 * sie nie enthüllt.
 */
export function useGsap(
  setup: () => void | (() => void),
  deps: React.DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(setup);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
