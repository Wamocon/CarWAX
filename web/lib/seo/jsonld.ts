import {
  aggregateRating,
  brand,
  branchRatings,
  branches,
  hq,
  marine,
  packages,
  services,
  social,
  directionsUrl,
} from '@/lib/data/site';

/**
 * Strukturierte Daten.
 *
 * Das ist der stärkste Hebel der ganzen Seite und hat bis hierher komplett
 * gefehlt. Wer in Antalya „seramik kaplama" sucht, bekommt von Google eine
 * lokale Trefferliste; ohne AutoRepair-Auszeichnung mit Adresse, Telefon und
 * Öffnungszeiten steht der Betrieb dort schlechter da, als er müsste, egal wie
 * gut die Seite aussieht.
 *
 * ZERO-FABRICATION gilt auch hier, und hier besonders: strukturierte Daten
 * gehen direkt in Suchergebnisse. Nichts wird geschätzt.
 *   - `aggregateRating` steht nur an der Filiale, für die eine echte Google-
 *     Bewertung vorliegt (TerraCity). Sie an alle vier zu hängen, wäre eine
 *     Falschaussage gegenüber Google, und Google prüft das.
 *   - `openingHours` steht nur, wo die Zeiten bestätigt sind.
 *   - Preise kommen nicht vor. `priceRange` bleibt weg, statt geraten zu werden.
 */

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://carwax-antalya.com';

/** Ohne Leerzeichen, wie schema.org es für `telephone` erwartet. */
function tel(v: string) {
  return v.replace(/\s+/g, '');
}

function branchNode(b: (typeof branches)[number], locale: string) {
  const rating = branchRatings.find((r) => r.branchId === b.id);

  return {
    '@type': 'AutoRepair',
    '@id': `${BASE}/${locale}#${b.id}`,
    name: `${brand.legalName} ${b.name}`,
    branchOf: { '@id': `${BASE}#organization` },
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressLocality: b.district,
      addressRegion: 'Antalya',
      postalCode: b.postalCode,
      addressCountry: 'TR',
    },
    /**
     * Koordinaten aus OpenStreetMap/Nominatim, je Filiale einzeln aufgelöst
     * und gegen die Adresse des Kunden geprüft. Nicht geschätzt: für lokale
     * Suche ist das der Unterschied zwischen „irgendwo in Antalya" und einem
     * Treffer in der Umkreissuche.
     */
    geo: {
      '@type': 'GeoCoordinates',
      latitude: b.geo.lat,
      longitude: b.geo.lon,
    },
    hasMap: directionsUrl(b.address),
    areaServed: [
      { '@type': 'City', name: 'Antalya' },
      { '@type': 'AdministrativeArea', name: b.district },
    ],
    telephone: b.phone,
    url: `${BASE}/${locale}#subeler`,
    image: `${BASE}/og.jpg`,
    currenciesAccepted: 'TRY',
    ...(b.whatsapp
      ? { contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          telephone: `+${b.whatsapp}`,
          availableLanguage: ['tr', 'en', 'ru'],
        } }
      : {}),
    ...(b.hours
      ? {
          // "10:00 – 22:00" trägt einen Halbgeviertstrich für die Anzeige;
          // schema.org will reine Zeiten.
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: b.hours.split(/[–-]/)[0].trim(),
            closes: b.hours.split(/[–-]/)[1].trim(),
          },
        }
      : {}),
    ...(rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.value,
            reviewCount: rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/**
 * Ein einziger Graph statt fünf lose Blöcke. So kann `branchOf` per `@id` auf
 * die Organisation zeigen, und Google liest Marke und Filialen als einen
 * Zusammenhang statt als fünf Fremde.
 */
export function buildJsonLd(
  locale: string,
  t: (key: string) => string,
  faqIds: readonly string[],
) {
  const overall = aggregateRating();

  const organization = {
    '@type': 'Organization',
    '@id': `${BASE}#organization`,
    name: brand.legalName,
    alternateName: brand.displayName,
    url: BASE,
    logo: `${BASE}/brand/carwax-logo.png`,
    foundingDate: String(brand.foundedBrand),
    email: hq.email,
    telephone: tel(hq.phone),
    address: {
      '@type': 'PostalAddress',
      streetAddress: hq.address,
      addressCountry: 'TR',
    },
    sameAs: social.filter((s) => s.verified).map((s) => s.href),
    makesOffer: [...services, ...packages].map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: t(offerKey(s.id)) },
    })),
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${BASE}#website`,
    url: `${BASE}/${locale}`,
    name: brand.legalName,
    inLanguage: locale,
    publisher: { '@id': `${BASE}#organization` },
  };

  const faqPage = {
    '@type': 'FAQPage',
    /**
     * AEO: `speakable` markiert die Passagen, die ein Sprachassistent
     * vorlesen darf. Ohne das liest er im Zweifel die Navigation.
     */
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#sorular h2', '#sorular summary', '#sorular p'],
    },
    '@id': `${BASE}/${locale}#faq`,
    mainEntity: faqIds.map((id) => ({
      '@type': 'Question',
      name: t(`faq.items.${id}.q`),
      acceptedAnswer: { '@type': 'Answer', text: t(`faq.items.${id}.a`) },
    })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      website,
      ...branches.map((b) => branchNode(b, locale)),
      faqPage,
      // Die Bootssparte ist in Antalya das Alleinstellungsmerkmal und
      // verdient einen eigenen Knoten statt nur eine Zeile im Angebot.
      {
        '@type': 'Service',
        '@id': `${BASE}/${locale}#marine`,
        name: 'C-Marine Care',
        serviceType: t('marine.title'),
        provider: { '@id': `${BASE}#organization` },
        areaServed: { '@type': 'City', name: 'Antalya' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'C-Marine Care',
          itemListElement: marine.map((m) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: t(`marine.${m.id}`) },
          })),
        },
      },
      ...(overall
        ? [
            {
              '@type': 'AggregateRating',
              '@id': `${BASE}#rating`,
              itemReviewed: { '@id': `${BASE}#organization` },
              ratingValue: overall.value,
              reviewCount: overall.count,
              bestRating: overall.scale,
              worstRating: 1,
            },
          ]
        : []),
    ],
  };
}

/** Leistungen und Pakete liegen in verschiedenen Namensräumen. */
function offerKey(id: string) {
  return packages.some((p) => p.id === id)
    ? `packages.${id}.title`
    : `services.${id}.title`;
}
