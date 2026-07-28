import {
  brand,
  branches,
  counters,
  hq,
  marine,
  packages,
  services,
} from '@/lib/data/site';

/**
 * Wissensbasis des Concierge.
 *
 * Sie wird aus `lib/data/site.ts` generiert, nicht danebengeschrieben. Damit
 * kann der Bot nichts wissen, was nicht auch auf der Seite steht — und wenn
 * der Kunde eine Telefonnummer korrigiert, korrigiert sich der Bot mit.
 */

/**
 * ⚠️ Muss jede id aus `services` in site.ts abdecken.
 *
 * Als die Liste von elf auf siebzehn wuchs, blieben sechs Beschriftungen hier
 * stehen. Der Rückfall auf `s.id` hat daraus stillschweigend „pasOnleme" und
 * „dosemeTamiri" gemacht — und zwar in /llms.txt, das genau dafür existiert,
 * dass Antwortmaschinen den Betrieb korrekt zitieren, und im Systemprompt des
 * Concierge. `assertLabels()` unten lässt das nicht mehr durchgehen.
 */
const SERVICE_LABELS: Record<string, string> = {
  seramik: 'Seramik Kaplama (ceramic coating, 9H)',
  grafen: 'Grafen Kaplama (graphene coating)',
  ceramicWax: 'Ceramic Wax (fast ceramic-based protection)',
  pastaCila: 'Pasta & Cila (compound and polish)',
  ppf: 'PPF Boya Koruma Filmi (paint protection film, BQ/HQ/PQ)',
  renkDegisim: 'Renk Değişim Filmleri (colour change wrap film)',
  camKaplama: 'Seramik Cam Kaplama (water-repellent glass coating)',
  camFilmi: 'Oto Cam Filmi (window tinting)',
  sesYalitimi: 'Ses Yalıtımı (sound insulation)',
  metalKaplama: 'Metal & Krom Kaplama (wheel, chrome and metal coating)',
  pasOnleme: 'Pas Önleme (rust prevention, underbody and cavities)',
  icTemizlik: 'Detaylı İç Temizlik (deep interior cleaning)',
  icMekan: 'İç Mekan Koruma (interior stain protection)',
  antibakteriyel: 'Antibakteriyel Temizlik (cabin/AC hygiene)',
  gocuk: 'Göçük Onarımı (paintless dent repair)',
  camCatlak: 'Cam Çatlak Tamiri (windscreen chip/crack repair)',
  dosemeTamiri: 'Döşeme Tamiri (upholstery and leather repair)',
};

const MARINE_LABELS: Record<string, string> = {
  jelcoat: 'Jelkot bakımı (gelcoat care)',
  pastaCila: 'Pasta & cila (compound and polish)',
  camPastasi: 'Cam pastası (glass compound)',
  tik: 'Tik güverte bakımı (teak deck care)',
  pervane: 'Dümen, flap ve pervane temizliği (rudder, flap and propeller)',
  kromKoruma: 'Krom koruma (chrome protection)',
  boya: 'Boya uygulaması (paint application)',
  zehirliBoya: 'Zehirli boya uygulaması (antifouling paint)',
  kumlama: 'Kumlama uygulaması (sandblasting)',
  fiber: 'Fiber bakımı (fibreglass care)',
  kevlar: 'Kevlar bakım ve onarımı (kevlar care and repair)',
  genelTemizlik: 'Genel temizlik ve bakım (general cleaning and care)',
};

const PACKAGE_LABELS: Record<string, string> = {
  shineEko: 'Shine Eko: paint gloss, clay bar, teflon polish',
  shinePlus: 'Shine Plus: deep scratch removal, paint protection, ceramic wax',
  deepEko: 'Deep Eko: interior cleaning and standard wash',
  deepPlus: 'Deep Plus: deepest interior clean, engine bay, AC ducts, ozone',
  fullEko: 'Full Eko: interior clean plus scratch removal and paint protection',
  fullPlus: 'Full Plus: the complete treatment inside and out, with ULV sterilisation',
};

const COUNTER_LABELS: Record<string, string> = {
  yikama: 'washes',
  boyaKoruma: 'paint-protection applications',
  antibakteriyel: 'antibacterial cleans',
  seramik: 'ceramic coatings',
};

/**
 * Fällt beim Bauen auf, nicht beim Kunden.
 *
 * Ohne diese Prüfung wandert eine neu angelegte Leistung als roher Bezeichner
 * in die Wissensbasis, und der Fehler ist genau dort unsichtbar, wo er am
 * teuersten ist: in dem, was ein Sprachmodell über den Betrieb behauptet.
 */
function assertLabels(
  what: string,
  ids: readonly string[],
  labels: Record<string, string>,
) {
  const missing = ids.filter((id) => !labels[id]);
  if (missing.length) {
    throw new Error(
      `Wissensbasis unvollständig: ${what} ohne Beschriftung -> ${missing.join(', ')}. ` +
        `In lib/ai/knowledge.ts ergänzen.`,
    );
  }
}

export function buildKnowledgeBase(): string {
  assertLabels('Leistungen', services.map((s) => s.id), SERVICE_LABELS);
  assertLabels('C-Marine', marine.map((m) => m.id), MARINE_LABELS);
  assertLabels('Pakete', packages.map((p) => p.id), PACKAGE_LABELS);

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

  // Die Dauern sind der einzige harte Zeitwert, den wir haben. Sie stehen als
  // Durchschnitt auf den Paketseiten des Kunden und dürfen deshalb genannt
  // werden, aber ausdrücklich als Richtwert und nicht als Zusage.
  const packageLines = packages
    .map(
      (p) =>
        `- ${PACKAGE_LABELS[p.id] ?? p.id}` +
        (p.hours ? ` (about ${p.hours} hours on average)` : ''),
    )
    .join('\n');

  const counterLines = counters
    .map((c) => `- ${c.value.toLocaleString('en-US')} ${COUNTER_LABELS[c.id] ?? c.id}`)
    .join('\n');

  return `# CarWAX Antalya — verified facts

## The company
- Legal name: ${brand.legalName}
- Trading since ${brand.foundedTrade}; the CARWAX brand was founded in ${brand.foundedBrand};
  the first franchise branch opened in ${brand.firstFranchise}.
- ${brand.stations} stations in total. Also present in Dubai, Kazakhstan,
  Northern Cyprus, Iraq, Kosovo, Bulgaria and Nigeria. The stated goal is
  ${brand.stationsTarget2030} stations by the end of 2030.
- CARWAX manufactures its own care products (formulations developed by American
  and Turkish engineers) and runs its stations on its own software.
- Service is insured.
- Head office: ${hq.address}. Phone ${hq.phone} or ${hq.phone2}. Email ${hq.email}.

## The four Antalya branches
${branchLines}

All four are inside shopping centres, so customers can leave the car and carry on
with their day.

## Services offered
${serviceLines}

## Care packages (Uygulama Paketleri)
Three families in two levels each. Shine works on the paint, Deep on the cabin,
Full on both. Eko is the standard level, Plus the extended one.
${packageLines}

## Boat and yacht care (C-Marine Care)
${marineLines}

## Verified numbers (group-wide, published by CARWAX)
${counterLines}

## Google rating
- The site does not display a rating, and you must not state one. Do not quote a
  number, a star count, or a review total, even if you can infer one.
- If a visitor asks about the rating: say the reviews are on the branch's Google
  listing and they are welcome to look, and that feedback by phone reaches the
  branch directly. Never claim the rating is good, never claim there is none, and
  never argue with a visitor who mentions a bad one. Acknowledge, do not defend.

## Customer comments on the site
- The eleven quotes in the "Müşteri Yorumları" section are the customer comments
  CARWAX publishes on carwax.com.tr. They are NOT Google reviews. If anyone asks
  where they come from, say exactly that.

## Things we do NOT know
- Prices. No price list has been published. Never quote, estimate, or guess a price.
- Opening hours of Mark Antalya, Erasta AVM and ÖzdilekPark.
- Whether a specific branch offers boat care.
- How long an individual service takes. The package durations above are averages
  published by CARWAX; anything outside that list is unknown.
- Whether an appointment is required, and which slots are free.
- Any rating figure. Not published on this site, not yours to quote.`;
}
