'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Inhalt steigt beim Eintritt leicht auf. Einmal, nicht bei jedem Vorbeiscrollen —
 * wiederholte Eintritte lenken ab, sobald jemand die Seite zweimal durchläuft.
 * Staffel bleibt unter 80 ms, sonst wirkt die Seite langsam.
 */
const variants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay, ease: EASE_OUT },
  }),
};

export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={variants}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </Tag>
  );
}
