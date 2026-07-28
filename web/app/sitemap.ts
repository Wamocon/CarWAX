import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carwax-antalya.com';

/**
 * Die Seite ist ein Einzeiler mit drei Sprachfassungen. Ohne Sitemap findet
 * Google die russische und englische Fassung nur über Zufall, weil nichts
 * intern darauf verlinkt außer dem Sprachumschalter.
 *
 * `alternates.languages` verknüpft die drei Fassungen ausdrücklich als
 * Übersetzungen derselben Seite und nicht als drei ähnliche Seiten.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(routing.locales.map((l) => [l, `${BASE}/${l}`])),
    // Muss zum <link rel="alternate"> im HTML passen. Deklarieren beide
    // Mechanismen dasselbe URL-Set unterschiedlich, meldet die Search Console
    // einen Widerspruch und ignoriert im Zweifel beide.
    'x-default': `${BASE}/${routing.defaultLocale}`,
  };

  return routing.locales.map((locale) => ({
    url: `${BASE}/${locale}`,
    lastModified: new Date('2026-07-28'),
    changeFrequency: 'monthly',
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: { languages },
  }));
}
