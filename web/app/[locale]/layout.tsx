import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { routing } from '@/i18n/routing';
import { buildJsonLd } from '@/lib/seo/jsonld';
import { faq } from '@/lib/data/site';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carwax-antalya.com';

  return {
    metadataBase: new URL(base),
    title: t('title'),
    description: t('description'),
    // Ohne alternates zeigt Google einer russischen Suchanfrage die türkische
    // Fassung. Die drei Sprachen sind Arbeit, die sonst niemand findet.
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
        // Für Besucher, deren Sprache keine der drei ist. Ohne x-default
        // rät Google, welche Fassung es einem Deutschen oder Araber zeigt.
        'x-default': `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      siteName: 'CarWAX Antalya',
      locale,
      type: 'website',
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: t('title') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/og.jpg'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  // Explizit übergeben. Ohne `messages` bekommt der Client-Provider nichts,
  // jedes useTranslations() in einer Client-Komponente wirft, und die
  // Hydration bricht still ab — die Seite sieht dann fertig aus, ist aber tot.
  const messages = await getMessages();

  // Ein flacher Übersetzer für die strukturierten Daten: die brauchen die
  // Namensräume gemischt (services.*, packages.*, marine.*, faq.*).
  const tAll = await getTranslations({ locale });
  const jsonLd = buildJsonLd(locale, (k) => tAll(k), faq);

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Läuft vor dem ersten Paint und setzt data-theme direkt auf <html>.
          Ohne das sieht jeder Hell-Nutzer beim Laden kurz die dunkle Seite
          aufblitzen — React ist an dieser Stelle schlicht zu spät.
          Reihenfolge: gespeicherte Wahl > Systemeinstellung > dunkel.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('carwax-theme');if(!s){s=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=s;}catch(e){document.documentElement.dataset.theme='dark';}})();`,
          }}
        />
        {/*
          Strukturierte Daten. Sie stehen bewusst serverseitig gerendert im
          <head> und nicht per Skript nachgeladen: ein Crawler, der kein
          JavaScript ausführt, muss sie trotzdem sehen.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScroll>
            {/* Drei Farbwolken hinter allem, dazu das Korn darüber.
                Beide Ebenen fixed und ohne Interaktion. */}
            <div className="aurora" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="grain" aria-hidden="true" />
            {children}
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
