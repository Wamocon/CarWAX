import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/**
 * Sicherheits-Kopfzeilen.
 *
 * Kosten nichts, greifen ab dem ersten Aufruf, und ohne sie liefert die Seite
 * bei jedem Sicherheitsscan des Kunden vermeidbare Befunde. Bewusst OHNE
 * strenge CSP: die Seite bindet die Google-Karte als iframe ein, und eine CSP,
 * die das nicht sauber abbildet, zerlegt die Karte still. Wer eine CSP will,
 * baut sie zusammen mit der Karte und prüft sie erst im Report-Only-Modus.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    // Greift nur unter HTTPS. Vercel liefert ausschließlich HTTPS aus.
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 92, 95],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
