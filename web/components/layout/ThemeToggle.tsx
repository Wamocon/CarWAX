'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

/**
 * Modus-Umschalter.
 *
 * Der Startwert wird NICHT hier gesetzt, sondern von einem Inline-Skript im
 * <head> (siehe layout.tsx), bevor der erste Pixel gezeichnet wird. Würde
 * React das übernehmen, sähe jeder Hell-Nutzer beim Laden kurz die dunkle
 * Seite aufblitzen. Diese Komponente liest den bereits gesetzten Zustand nur
 * aus und schreibt Änderungen zurück.
 */
export function ThemeToggle() {
  const t = useTranslations('theme');
  const [theme, setTheme] = useState<Theme>('dark');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || 'dark';
    setTheme(current);
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('carwax-theme', next);
    } catch {
      // Privater Modus o. Ä. — dann gilt die Wahl eben nur für diese Sitzung.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // Vor der Hydration wissen wir den Zustand nicht; ohne diesen Riegel
      // würde der Screenreader kurz den falschen Modus ansagen.
      aria-label={ready ? (theme === 'dark' ? t('toLight') : t('toDark')) : t('toggle')}
      className="grid h-11 w-11 place-items-center rounded-[2px] text-fg-muted transition-[color,transform,background-color] duration-140 ease-out hover:bg-glass hover:text-fg active:scale-[0.97]"
    >
      {theme === 'dark' ? (
        <Sun aria-hidden size={17} />
      ) : (
        <Moon aria-hidden size={17} />
      )}
    </button>
  );
}
