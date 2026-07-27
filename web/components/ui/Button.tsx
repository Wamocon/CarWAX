import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * Zwei Varianten, mehr braucht die Seite nicht.
 *
 * `active:scale-[0.97]` ist Pflicht, nicht Deko — ohne sofortiges
 * Druckfeedback wirkt eine Oberfläche taub. 140 ms, ease-out: schnell genug,
 * dass es zum Klick gehört, langsam genug, dass man es sieht.
 *
 * Die Kurve steht hier ausgeschrieben statt als `ease-[--ease-out]`:
 * Tailwind v4 löst eine nackte Custom-Property in eckigen Klammern nicht auf,
 * die Klasse fiele still aus und der Button hätte gar kein Easing.
 */
export function Button({
  variant = 'primary',
  className,
  ...props
}: ComponentPropsWithoutRef<'a'> & { variant?: 'primary' | 'ghost' }) {
  return (
    <a
      {...props}
      className={clsx(
        'inline-flex min-h-13 items-center gap-3 rounded-[2px] px-8',
        'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.22em]',
        'transition-[transform,background-color,border-color,color]',
        'duration-140 ease-out',
        'active:scale-[0.97]',
        variant === 'primary'
          ? 'bg-brand text-white hover:bg-brand-hot'
          : 'border border-hairline-strong text-fg hover:border-brand hover:text-brand',
        className,
      )}
    />
  );
}
