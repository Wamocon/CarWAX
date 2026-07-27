import { brand, branches, counters, hq, marine, services } from '@/lib/data/site';

/**
 * Wissensbasis des Concierge.
 *
 * Sie wird aus `lib/data/site.ts` generiert, nicht danebengeschrieben. Damit
 * kann der Bot nichts wissen, was nicht auch auf der Seite steht — und wenn
 * der Kunde eine Telefonnummer korrigiert, korrigiert sich der Bot mit.
 */

const SERVICE_LABELS: Record<string, string> = {
  seramik: 'Seramik Kaplama (ceramic coating, 9H)',
  grafen: 'Grafen Kaplama (graphene coating)',
  ppf: 'PPF Boya Koruma Filmi (paint protection film, BQ/HQ/PQ)',
  camKaplama: 'Seramik Cam Kaplama (water-repellent glass coating)',
  camFilmi: 'Oto Cam Filmi (window tinting)',
  sesYalitimi: 'Ses Yalıtımı (sound insulation)',
  icTemizlik: 'Detaylı İç Temizlik (deep interior cleaning)',
  antibakteriyel: 'Antibakteriyel Temizlik (cabin/AC hygiene)',
  metalKaplama: 'Metal & Krom Kaplama (wheel, chrome and metal coating)',
  gocuk: 'Göçük Onarımı (paintless dent repair)',
  camCatlak: 'Cam Çatlak Tamiri (windscreen chip/crack repair)',
};

const MARINE_LABELS: Record<string, string> = {
  jelcoat: 'Jelkot bakımı (gelcoat care)',
  pastaCila: 'Pasta & cila (compound and polish)',
  tik: 'Tik güverte bakımı (teak deck care)',
  pervane: 'Pervane temizliği (propeller cleaning)',
  kevlar: 'Kevlar onarımı (kevlar repair)',
  boya: 'Boya uygulaması (paint application)',
};

const COUNTER_LABELS: Record<string, string> = {
  yikama: 'washes',
  boyaKoruma: 'paint-protection applications',
  antibakteriyel: 'antibacterial cleans',
  seramik: 'ceramic coatings',
};

export function buildKnowledgeBase(): string {
  const branchLines = branches
    .map(
      (b) =>
        `- ${b.name} (${b.district}, ${b.tier === 'premium' ? 'Premium branch' : 'standard branch'})\n` +
        `  Address: ${b.address}\n` +
        `  Phone: ${b.phoneLabel} (tel:${b.phone})` +
        (b.hours ? `\n  Opening hours: every day, ${b.hours}` : ''),
    )
    .join('\n');

  const serviceLines = services
    .map((s) => `- ${SERVICE_LABELS[s.id] ?? s.id}`)
    .join('\n');

  const marineLines = marine
    .map((m) => `- ${MARINE_LABELS[m.id] ?? m.id}`)
    .join('\n');

  const counterLines = counters
    .map((c) => `- ${c.value.toLocaleString('en-US')} ${COUNTER_LABELS[c.id] ?? c.id}`)
    .join('\n');

  return `# CarWAX Antalya — verified facts

## The company
- Legal name: ${brand.legalName}
- Trading since ${brand.foundedTrade}; the CARWAX brand was founded in ${brand.foundedBrand};
  the first franchise branch opened in ${brand.firstFranchise}.
- More than 50 stations across Turkey. Also present in Dubai, Kazakhstan,
  Northern Cyprus, Iraq, Kosovo, Bulgaria and Nigeria.
- CARWAX manufactures its own care products (formulations developed by American
  and Turkish engineers).
- Service is insured.
- Head office: ${hq.address}. Phone ${hq.phone}.

## The four Antalya branches
${branchLines}

All four are inside shopping centres, so customers can leave the car and carry on
with their day.

## Services offered
${serviceLines}

## Boat and yacht care (C-Marine Care)
${marineLines}

## Verified numbers (group-wide, published by CARWAX)
${counterLines}

## Things we do NOT know
- Prices. No price list has been published. Never quote, estimate, or guess a price.
- Opening hours of Mark Antalya, Erasta AVM and ÖzdilekPark.
- Whether a specific branch offers boat care.
- How long a specific treatment takes.
- Whether an appointment is required, and what slots are free.
- Any customer rating or review score.`;
}
