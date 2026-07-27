import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Concierge } from '@/components/ai/Concierge';
import { Hero } from '@/components/sections/Hero';
import { TrustBar } from '@/components/sections/TrustBar';
import { Services } from '@/components/sections/Services';
import { GlossCompare } from '@/components/sections/GlossCompare';
import { ScrollGloss } from '@/components/anim/ScrollGloss';
import { WhatsAppFab } from '@/components/ai/WhatsAppFab';
import { Counters } from '@/components/sections/Counters';
import { Marine } from '@/components/sections/Marine';
import { Packages } from '@/components/sections/Packages';
import { Products } from '@/components/sections/Products';
import { Story } from '@/components/sections/Story';
import { Branches } from '@/components/sections/Branches';
import { MapSection } from '@/components/sections/MapSection';
import { Rating } from '@/components/sections/Rating';
import { WhatsApp } from '@/components/sections/WhatsApp';
import { Contact } from '@/components/sections/Contact';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'gloss' });
  const common = await getTranslations({ locale, namespace: 'common' });

  return (
    <>
      {/* Erster fokussierbarer Punkt der Seite. Sichtbar, sobald er Fokus hat. */}
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-[2px] focus:bg-brand focus:px-5 focus:py-3 focus:text-white"
      >
        {common('skipToContent')}
      </a>

      <Header />

      <main id="top">
        <Hero />
        <TrustBar />
        <ScrollGloss src="/img/svc-seramik-nano.jpg" />
        <Services />

        <section className="section pt-0" aria-labelledby="parlaklik-h">
          <div className="wrap">
            <SectionHeading
              id="parlaklik-h"
              eyebrow={t('eyebrow')}
              title={t('title')}
              lead={t('lead')}
            />
            <Reveal>
              {/* Bewusst ein Auto: die Sektion erklärt Seramik Kaplama am
                  Fahrzeug. `svc-genel-temizlik` zeigt einen Bootsrumpf und
                  gehört deshalb in die Marine-Sektion, nicht hierher. */}
              <GlossCompare src="/img/svc-seramik-nano.jpg" />
            </Reveal>
          </div>
        </section>

        <Packages />
        <Rating />
        <Counters />
        <Marine />
        <Products />
        <Story />
        <Branches />
        <MapSection />
        <WhatsApp />
        <Contact />
      </main>

      <Footer />
      <WhatsAppFab />
      <Concierge />
    </>
  );
}
