/**
 * Verifizierte Betriebsdaten. Alles hier stammt von carwax.com.tr oder aus
 * Kartendiensten und ist nachprüfbar.
 *
 * ZERO-FABRICATION: Kein Wert in dieser Datei darf geschätzt sein. Was nicht
 * bestätigt ist, steht als `null` und wird im UI weggelassen — nicht geraten.
 */

export const brand = {
  legalName: 'CARWAX Car Care Systems',
  displayName: 'CarWAX',
  descriptor: 'Car Care Systems',
  /** Aus carwax-logo.png gepickt. Nicht ändern ohne neues Logo. */
  red: '#EC1C24',
  foundedTrade: 1989, // Öğretmenler Oto Yıkama, İstanbul-Erenköy
  foundedBrand: 1995, // Marke CARWAX
  firstFranchise: 2002,
} as const;

/** Konzernzentrale — Quelle: carwax.com.tr/iletisim */
export const hq = {
  address:
    'Yukarı Dudullu Mah. Necip Fazıl Blv., Keyap Sitesi H Blok No: 44-132, Ümraniye / İstanbul',
  phone: '+90 216 540 03 48',
  mobile: '+90 554 494 15 83',
} as const;

/**
 * Antalya-Standorte — Quelle: carwax.com.tr/istasyonlar
 * Mark Antalya und Özdilek teilen sich eine Nummer: sehr wahrscheinlich
 * derselbe Betreiber. VOR GO-LIVE beim Kunden bestätigen.
 */
/**
 * `whatsapp` ist nur dort gesetzt, wo die Nummer eine türkische Mobilnummer
 * ist (05xx) — nur die können WhatsApp führen. TerraCity hat einen Festnetz-
 * anschluss (0242) und bekommt deshalb keinen WhatsApp-Knopf.
 *
 * ⚠️ VOM KUNDEN BESTÄTIGEN LASSEN: dass diese Mobilnummern tatsächlich
 * WhatsApp entgegennehmen. Ein toter WhatsApp-Link kostet mehr Vertrauen,
 * als der Knopf einbringt.
 */
export const branches = [
  {
    id: 'terracity',
    name: 'TerraCity',
    tier: 'premium',
    district: 'Muratpaşa',
    address: 'Fener Mah., Tekelioğlu Cad. No: 55, Muratpaşa / Antalya',
    phone: '+902423181617',
    phoneLabel: '0242 318 16 17',
    whatsapp: null,
    /** Bestätigt über terracity.com.tr: Center-Zeiten, denen der Laden folgt. */
    hours: '10:00 – 22:00',
  },
  {
    id: 'mark-antalya',
    name: 'Mark Antalya',
    tier: 'premium',
    district: 'Muratpaşa',
    address: 'Tahılpazarı, Kazım Özalp Cad. No: 84, Muratpaşa / Antalya',
    phone: '+905332079606',
    phoneLabel: '0533 207 96 06',
    whatsapp: '905332079606',
    hours: null,
  },
  {
    id: 'erasta',
    name: 'Erasta AVM',
    tier: 'standard',
    district: 'Kepez',
    address: 'Erasta AVM, Dumlupınar Blv. No: 47, Kepez / Antalya',
    phone: '+905324897274',
    phoneLabel: '0532 489 72 74',
    whatsapp: '905324897274',
    hours: null,
  },
  {
    id: 'ozdilek',
    name: 'ÖzdilekPark',
    tier: 'standard',
    district: 'Kepez',
    address: 'Fabrikalar Mah., Fikri Erten Cad. No: 2, Kepez / Antalya',
    phone: '+905332079606',
    phoneLabel: '0533 207 96 06',
    whatsapp: '905332079606',
    hours: null,
  },
] as const;

/**
 * Vorformatierte WhatsApp-Nachricht. Der Kunde muss nichts tippen, und die
 * Filiale weiß beim ersten Blick, worum es geht und woher der Kontakt kommt.
 */
export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Karte ohne API-Schlüssel: der `output=embed`-Modus von Google Maps nimmt
 * eine Suchanfrage entgegen. Damit ist die Karte sofort korrekt, ohne dass
 * wir Koordinaten raten oder ein Maps-Billing-Konto brauchen.
 */
export function mapEmbedUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(
    `CarWAX ${address}`,
  )}&output=embed&hl=tr`;
}

/** Führt auf den Google-Eintrag der Filiale — dort kann bewertet werden. */
export function reviewUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `CarWAX ${address}`,
  )}`;
}

/**
 * Google-Bewertung.
 *
 * ⚠️ Der Wert ist echt und schlecht: **2,6 ★ aus 704 Bewertungen**, abgelesen
 * am 27.07.2026 aus dem Google-Maps-Eintrag „Carwax Terracity Profesyonel
 * Araç Bakım Hizmetleri". Zum Vergleich: Meguiar's Antalya steht bei 4,9 ★
 * aus 665 Bewertungen — nahezu gleiche Menge, 2,3 Sterne Abstand.
 *
 * Die Anzeige wurde ausdrücklich gewünscht. Deshalb steht sie hier ehrlich
 * und mit Datum, statt geschönt. Sobald die Sanierung greift: `value` und
 * `count` hier aktualisieren — die Sektion rechnet den Rest selbst.
 */
export const rating = {
  value: 2.6,
  count: 704,
  scale: 5,
  branchId: 'terracity',
  /** Alles darunter zeigt die Sektion als Bitte um Bewertungen, nicht als Auszeichnung. */
  proudFrom: 4.5,
  verifiedAt: '2026-07-27',
} as const;

/** Routenlink ohne Koordinaten — Google löst die Adresse selbst auf. */
export function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `CarWAX ${address}`,
  )}`;
}

/**
 * Social.
 *
 * Auf carwax.com.tr zeigen die Icons für Facebook, Instagram und X ins Leere —
 * sie verlinken Login-/Checkpoint-Seiten statt Profile. Nur der YouTube-Kanal
 * ist echt und wurde geprüft. Deshalb steht hier nur, was auflösbar ist;
 * `verified: false` erscheint nicht im UI, bis der Kunde die Profile bestätigt.
 */
export const social = [
  {
    id: 'youtube',
    href: 'https://www.youtube.com/channel/UCTV5r4xf-YtNa1B6WCGOxrQ',
    label: 'YouTube',
    verified: true,
  },
  {
    id: 'instagram',
    href: 'https://www.instagram.com/carwax_antalya/',
    label: 'Instagram',
    // Handle kam vom Kunden über das Ticket. Inhalt konnte nicht gelesen
    // werden (Meta blockt jeden automatisierten Zugriff), die Quelle ist aber
    // der Kunde selbst — deshalb sichtbar.
    verified: true,
  },
  {
    id: 'facebook',
    href: 'https://www.facebook.com/terracitycarwax/',
    label: 'Facebook',
    verified: false, // über Suche gefunden, nicht vom Kunden bestätigt
  },
] as const;

/**
 * Zähler von der Konzern-Startseite. Echte, veröffentlichte Zahlen —
 * deshalb dürfen sie prominent stehen.
 */
export const counters = [
  { id: 'yikama', value: 114465 },
  { id: 'boyaKoruma', value: 44608 },
  { id: 'antibakteriyel', value: 41256 },
  { id: 'seramik', value: 36962 },
] as const;

/** Leistungen exakt nach der Menüstruktur von carwax.com.tr. */
export const services = [
  { id: 'seramik', img: '/img/svc-seramik-premium.jpg', group: 'koruma' },
  { id: 'grafen', img: '/img/svc-grafen.jpg', group: 'koruma' },
  { id: 'ppf', img: '/img/svc-ppf-hq.jpg', group: 'koruma' },
  { id: 'camKaplama', img: '/img/svc-cam-kaplama.jpg', group: 'koruma' },
  { id: 'camFilmi', img: '/img/svc-cam-filmi.jpg', group: 'koruma' },
  { id: 'sesYalitimi', img: '/img/svc-ses-yalitimi.jpg', group: 'koruma' },
  { id: 'icTemizlik', img: '/img/svc-ic-temizlik.jpg', group: 'ic' },
  { id: 'antibakteriyel', img: '/img/svc-antibakteriyel.jpg', group: 'ic' },
  { id: 'metalKaplama', img: '/img/svc-metal-kaplama.jpg', group: 'koruma' },
  { id: 'gocuk', img: '/img/svc-gocuk.jpg', group: 'onarim' },
  { id: 'camCatlak', img: '/img/svc-cam-catlak.jpg', group: 'onarim' },
] as const;

/**
 * Uygulama Paketleri — exakt die Pakete aus dem Konzernmenü.
 * Keine erfundenen Bündel, keine erfundenen Preise.
 */
export const packages = [
  {
    id: 'shine',
    featured: false,
    includes: ['boyaKoruma', 'pastaCila', 'disYikama'],
  },
  {
    id: 'ceramicPremium',
    featured: true,
    includes: ['seramik9h', 'boyaKoruma', 'pastaCila', 'jantKrom'],
  },
  {
    id: 'full',
    featured: false,
    includes: ['nanoBoyaKoruma', 'antibakteriyel', 'icTemizlik'],
  },
  {
    id: 'deep',
    featured: false,
    includes: ['antibakteriyel', 'icTemizlik', 'doseme'],
  },
] as const;

/** Ürünlerimiz — eigene Chemie, echte Katalogfotos. */
export const products = [
  { id: 'sampuan', img: '/img/urun-sampuan.jpg' },
  { id: 'pasta', img: '/img/urun-pasta.jpg' },
  { id: 'jant', img: '/img/urun-jant.jpg' },
  { id: 'icTemizlik', img: '/img/urun-ic-temizlik.jpg' },
  { id: 'parfum', img: '/img/urun-parfum.jpg' },
  { id: 'amator', img: '/img/urun-amator.jpg' },
] as const;

/** Ekibimiz — Namen und Rollen von carwax.com.tr/ekibimiz. */
export const team = [
  { id: 'mustafa', name: 'Mustafa Mumcu', img: '/img/team-mustafa-mumcu.jpg' },
  { id: 'nergis', name: 'Nergis Mumcu', img: '/img/team-nergis-mumcu.jpg' },
  { id: 'dilara', name: 'Dilara Akiner', img: '/img/team-dilara-akiner.jpg' },
  { id: 'emrah', name: 'Emrah Kaya', img: '/img/team-emrah-kaya.jpg' },
  { id: 'gokhan', name: 'Gökhan Çalım', img: '/img/team-gokhan-calim.jpg' },
  { id: 'yusuf', name: 'Yusuf Kaya', img: '/img/team-yusuf-kaya.jpg' },
] as const;

/** C-Marine Care — in Antalya der Hebel, den kein lokaler Wettbewerber hat. */
export const marine = [
  { id: 'jelcoat', img: '/img/marine-jelcoat.jpg' },
  { id: 'pastaCila', img: '/img/marine-pasta-cila.jpg' },
  { id: 'tik', img: '/img/marine-tik.jpg' },
  { id: 'pervane', img: '/img/marine-pervane.jpg' },
  { id: 'kevlar', img: '/img/marine-kevlar.jpg' },
  { id: 'boya', img: '/img/marine-boya.jpg' },
] as const;

/**
 * NOCH OFFEN — vom Kunden zu liefern, bis dahin nirgends im UI:
 *   whatsapp, Öffnungszeiten, Geokoordinaten, Preise, Google-Rating,
 *   Instagram-Handle des Antalya-Betriebs.
 */
export const pending = {
  whatsapp: null,
  hours: null,
  geo: null,
  prices: null,
  rating: null,
  instagram: null,
} as const;
