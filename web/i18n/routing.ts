import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Türkisch führt — der Markt ist Antalya. EN für Touristen, RU für Residenten.
  locales: ['tr', 'en', 'ru'],
  defaultLocale: 'tr',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
