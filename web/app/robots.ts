import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carwax-antalya.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Der Chat-Endpunkt läuft gegen ein kostenpflichtiges Backend und hat
      // einen Rate-Limiter. Ein Crawler, der ihn abklappert, verbrennt
      // Kontingent, ohne dass ein Mensch etwas davon hat.
      disallow: '/api/',
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
