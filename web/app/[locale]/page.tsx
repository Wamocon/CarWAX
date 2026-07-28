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
import { BrandLinks } from '@/components/sections/BrandLinks';
import { Story } from '@/components/sections/Story';
import { Branches } from '@/components/sections/Branches';
import { MapSection } from '@/components/sections/MapSection';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
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
              title={t('title')}
              lead={t('lead')}
            />
            <Reveal>
              {/*
                Anderes Motiv als die gepinnte Wisch-Sequenz weiter oben.
                Vorher lief beides auf demselben Bild mit derselben
                Überschrift, und der zweite Auftritt las sich als Wiederholung
                statt als zweiter Beleg. Zwei Motive zeigen, dass der Effekt
                nicht am einen Foto hängt.

                Bewusst ein Auto: die Sektion erklärt Seramik Kaplama am
                Fahrzeug. Das Motiv „Genel Temizlik" zeigt einen Bootsrumpf
                und steht deshalb als `marine-genel` in der Marine-Sektion.
              */}
              <GlossCompare src="/img/svc-seramik-premium.jpg" />
            </Reveal>
          </div>
        </section>

        <Packages />
        {/* Erst die Stimmen, die der Kunde selbst veröffentlicht, dann direkt
            darunter die ungeschönte Google-Zahl. Andersherum läse sich die
            Reihenfolge wie Schönfärberei. */}
        <Testimonials />
        <Rating />
        <Counters />
        <Marine />
        <Products />
        <BrandLinks />
        <Story />
        <Branches />
        <MapSection />
        <Faq />
        <WhatsApp />
        <Contact />
      </main>

      <Footer />
      <WhatsAppFab />
      <Concierge />
    </>
  );
}
