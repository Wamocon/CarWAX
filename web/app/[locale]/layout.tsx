import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

import { routing } from '@/i18n/routing';
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

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale,
      type: 'website',
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
