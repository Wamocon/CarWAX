'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Vorher/Nachher, gesteuert per Ziehen — oder per Pfeiltasten.
 *
 * Der Griff ist ein echter `role="slider"` mit Tastaturbedienung. Ein
 * Vergleichsregler, den man nur mit der Maus schieben kann, ist für jeden mit
 * Tastatur oder Screenreader eine Sackgasse.
 *
 * Zwei Bilder übereinander, das obere per `clip-path: inset()` beschnitten.
 * clip-path läuft auf dem Compositor — kein Layout, kein Paint, auch beim
 * Ziehen keine verlorenen Frames.
 */
export function GlossCompare({ src }: { src: string }) {
  const t = useTranslations('gloss');
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const labelId = useId();

  const setFromClientX = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - step));
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + step));
    else if (e.key === 'Home') setPos(0);
    else if (e.key === 'End') setPos(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={box}
      className="relative aspect-[16/9] touch-none select-none overflow-hidden border border-hairline bg-bg-raised"
      style={{ ['--pos' as string]: `${pos}%` }}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) setFromClientX(e.clientX);
      }}
    >
      {/* nachher — versiegelt */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          filter: 'saturate(1.16) brightness(1.03) contrast(1.16)',
        }}
      />
      {/* vorher — matt, nur links sichtbar */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          filter: 'saturate(.4) brightness(.66) contrast(.94)',
          clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)',
        }}
      />

      <span id={labelId} className="sr-only">
        {t('sliderLabel')}
      </span>

      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}%`}
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 z-20 -ml-6 w-12 cursor-ew-resize focus-visible:outline-none"
        style={{ left: 'var(--pos)' }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-brand"
          style={{ boxShadow: '0 0 26px 3px rgba(236,28,36,.5)' }}
        />
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-brand bg-bg/60 backdrop-blur-sm"
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
            <path d="M5 1 1 6l4 5M13 1l4 5-4 5" stroke="#F4F3F1" strokeWidth="1.5" />
          </svg>
        </span>
      </div>

      <span className="pointer-events-none absolute bottom-4 left-4 z-10 border border-hairline bg-bg/65 px-3.5 py-2 font-mono text-[0.625rem] uppercase tracking-[0.24em]">
        {t('before')}
      </span>
      <span className="pointer-events-none absolute bottom-4 right-4 z-10 border border-brand/45 bg-bg/65 px-3.5 py-2 font-mono text-[0.625rem] uppercase tracking-[0.24em] text-brand">
        {t('after')}
      </span>
    </div>
  );
}
