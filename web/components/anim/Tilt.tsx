'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

/**
 * Karte, die sich leicht zum Zeiger neigt.
 *
 * Der Zeigerwert läuft durch eine Feder, bevor er in die Rotation geht. Roh
 * angebunden klebt die Karte am Cursor und wirkt billig; mit Feder hat sie
 * Masse und läuft nach. Das ist der ganze Unterschied.
 *
 * Nur an Geräten mit echtem Zeiger. Auf einem Touchscreen gibt es kein
 * Schweben, und ein Tap würde die Karte nur zucken lassen.
 */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const spring = { stiffness: 150, damping: 18, mass: 0.4 };
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
      }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return;
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
