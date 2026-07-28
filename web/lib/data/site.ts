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
  /**
   * „Carwax 122 istasyonuyla …" — wörtlich von der Startseite des Kunden
   * (Abschnitt „Biz Kimiz?"). Eine frühere Fassung schrieb hier „50+", das
   * war eine Zählung aus der Stationsliste und lag deutlich zu niedrig.
   */
  stations: 122,
  /** Erklärtes Ziel des Franchisesystems, ebenfalls von der Startseite. */
  stationsTarget2030: 190,
} as const;

/** Konzernzentrale — Quelle: carwax.com.tr/iletisim */
export const hq = {
  address:
    'Yukarı Dudullu Mah. Necip Fazıl Blv., Keyap Sitesi H Blok No: 44-132, Ümraniye / İstanbul',
  phone: '+90 216 540 03 48',
  /** Zweite Zentralnummer, steht im Fußbereich der Kundenseite gleichberechtigt. */
  phone2: '+90 216 540 03 49',
  mobile: '+90 554 494 15 83',
  /**
   * Auf carwax.com.tr durch Cloudflare verschleiert (`data-cfemail`).
   * Aus dem Hex-Token dekodiert, nicht geraten.
   */
  email: 'info@carwax.com.tr',
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
    postalCode: '07160',
    geo: { lat: 36.852484, lon: 30.757174 },
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
    postalCode: '07050',
    geo: { lat: 36.892923, lon: 30.704038 },
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
    postalCode: '07090',
    geo: { lat: 36.907604, lon: 30.664542 },
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
    postalCode: '07025',
    geo: { lat: 36.910394, lon: 30.677527 },
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
/**
 * Bewertungen je Filiale.
 *
 * Nur TerraCity hat einen Google-Eintrag, der eine Bewertung ausliefert
 * (2,6 aus 704, abgelesen am 27.07.2026 aus der eingebetteten Karte). Die
 * anderen drei Adressen liefern in Google Maps nur eine Stecknadel ohne
 * Bewertungskarte. Sobald ihre Werte vorliegen, hier eintragen: die Sektion
 * bildet daraus automatisch den gewichteten Gesamtschnitt.
 */
export const branchRatings = [
  { branchId: 'terracity', value: 2.6, count: 704 },
  // { branchId: 'mark-antalya', value: ?, count: ? },
  // { branchId: 'erasta',       value: ?, count: ? },
  // { branchId: 'ozdilek',      value: ?, count: ? },
] as const;

export const ratingMeta = {
  scale: 5,
  /** Darunter tritt die Sektion als Bitte um Bewertungen auf, nicht als Auszeichnung. */
  proudFrom: 4.5,
  verifiedAt: '2026-07-27',
} as const;

/**
 * Gesamtschnitt über alle erfassten Filialen.
 *
 * Gewichtet nach Bewertungsanzahl, nicht als Mittel der Mittelwerte: eine
 * Filiale mit 12 Bewertungen darf eine mit 704 nicht gleich stark ziehen.
 * Bei nur einer erfassten Filiale ist das Ergebnis schlicht deren Wert.
 */
export function aggregateRating() {
  const total = branchRatings.reduce((n, r) => n + r.count, 0);
  if (total === 0) return null;
  const weighted = branchRatings.reduce((n, r) => n + r.value * r.count, 0) / total;
  return {
    value: Math.round(weighted * 10) / 10,
    count: total,
    branches: branchRatings.length,
    scale: ratingMeta.scale,
    proudFrom: ratingMeta.proudFrom,
    verifiedAt: ratingMeta.verifiedAt,
  };
}

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
    scope: 'brand',
    verified: true,
  },
  {
    id: 'instagram',
    href: 'https://www.instagram.com/carwax_antalya/',
    label: 'Instagram',
    scope: 'antalya',
    // Handle kam vom Kunden über das Ticket. Inhalt konnte nicht gelesen
    // werden (Meta blockt jeden automatisierten Zugriff), die Quelle ist aber
    // der Kunde selbst — deshalb sichtbar.
    verified: true,
  },
  {
    id: 'instagram-tr',
    // Aus dem Footer-Icon der Kundenseite gezogen: der Login-Redirect trägt
    // `?next=/carwax.turkiye/` — das ist der Landeskanal der Marke.
    href: 'https://www.instagram.com/carwax.turkiye/',
    label: 'Instagram Türkiye',
    scope: 'brand',
    verified: true,
  },
  {
    id: 'facebook',
    // Ebenso aus dem Checkpoint-Redirect: `?next=…/carwaxcarcaresystems/`.
    // Das offizielle Markenprofil, nicht das lose Filialprofil.
    href: 'https://www.facebook.com/carwaxcarcaresystems/',
    label: 'Facebook',
    scope: 'brand',
    verified: true,
  },
  {
    id: 'x',
    // `redirect_after_login=/carwax_pcw` — bis hierher schlicht übersehen.
    href: 'https://x.com/carwax_pcw',
    label: 'X',
    scope: 'brand',
    verified: true,
  },
  {
    id: 'facebook-terracity',
    href: 'https://www.facebook.com/terracitycarwax/',
    label: 'Facebook TerraCity',
    scope: 'antalya',
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

/**
 * Leistungen exakt nach der Menüstruktur von carwax.com.tr.
 *
 * Jetzt vollständig: alle siebzehn Punkte aus „Koruma & Kaplama",
 * „İç Bakım & Koruma" und „Onarım & Düzeltme". Die sechs zuletzt ergänzten
 * standen im Menü des Kunden, fehlten hier aber. Die Varianten einer Familie
 * (Seramik Nano/Plus/Premium, PPF in BQ/HQ/PQ) laufen bewusst unter einem
 * Punkt: siebzehn Karten sind schon viel, dreißig wären eine Preisliste.
 */
export const services = [
  { id: 'seramik', img: '/img/svc-seramik-premium.jpg', group: 'koruma' },
  { id: 'grafen', img: '/img/svc-grafen.jpg', group: 'koruma' },
  { id: 'ceramicWax', img: '/img/svc-ceramic-wax.jpg', group: 'koruma' },
  { id: 'pastaCila', img: '/img/svc-pasta-cila.jpg', group: 'koruma' },
  { id: 'ppf', img: '/img/svc-ppf-hq.jpg', group: 'koruma' },
  { id: 'renkDegisim', img: '/img/svc-renk-degisim.jpg', group: 'koruma' },
  { id: 'camKaplama', img: '/img/svc-cam-kaplama.jpg', group: 'koruma' },
  { id: 'camFilmi', img: '/img/svc-cam-filmi.jpg', group: 'koruma' },
  { id: 'metalKaplama', img: '/img/svc-metal-kaplama.jpg', group: 'koruma' },
  { id: 'pasOnleme', img: '/img/svc-pas-onleme.jpg', group: 'koruma' },
  { id: 'sesYalitimi', img: '/img/svc-ses-yalitimi.jpg', group: 'koruma' },
  { id: 'icTemizlik', img: '/img/svc-ic-temizlik.jpg', group: 'ic' },
  { id: 'icMekan', img: '/img/svc-ic-mekan.jpg', group: 'ic' },
  { id: 'antibakteriyel', img: '/img/svc-antibakteriyel.jpg', group: 'ic' },
  { id: 'gocuk', img: '/img/svc-gocuk.jpg', group: 'onarim' },
  { id: 'camCatlak', img: '/img/svc-cam-catlak.jpg', group: 'onarim' },
  { id: 'dosemeTamiri', img: '/img/svc-doseme.jpg', group: 'onarim' },
] as const;

/**
 * Uygulama Paketleri — alle sechs, exakt wie im Konzernmenü.
 *
 * Eine frühere Fassung führte nur vier und mischte „Ceramic Premium" (eine
 * Leistung, kein Paket) darunter. Der Kunde verkauft in Wahrheit drei Familien
 * in je zwei Stufen: Shine (Lack), Deep (Innenraum), Full (beides).
 *
 * `includes` und `hours` sind wörtlich von den sechs Paketseiten übernommen.
 * Die Anwendungsdauer ist der stärkste Inhalt der ganzen Sektion: sie ist
 * konkret, nachprüfbar, und kein Wettbewerber in Antalya nennt sie. Deep Eko
 * gibt auf der Kundenseite keine Dauer an, steht deshalb auf `null` und wird
 * im UI weggelassen statt geschätzt.
 */
export const packages = [
  {
    id: 'shineEko',
    family: 'shine',
    tier: 'eko',
    featured: false,
    hours: '5',
    includes: [
      'standartYikama',
      'kilUygulamasi',
      'demirTozu',
      'teflonCila',
      'islakCila',
    ],
  },
  {
    id: 'shinePlus',
    family: 'shine',
    tier: 'plus',
    featured: false,
    hours: '6',
    includes: [
      'standartYikama',
      'kilUygulamasi',
      'demirTozu',
      'derinCizik',
      'ortaAsinma',
      'boyaKoruma',
      'seramikWax',
      'motorTemizligi',
      'islakCila',
    ],
  },
  {
    id: 'deepEko',
    family: 'deep',
    tier: 'eko',
    featured: false,
    hours: null,
    includes: [
      'standartYikama',
      'islakCila',
      'koltuk',
      'doseme',
      'bagaj',
      'antibakteriyel',
    ],
  },
  {
    id: 'deepPlus',
    family: 'deep',
    tier: 'plus',
    featured: false,
    hours: '3-4',
    includes: [
      'standartYikama',
      'islakCila',
      'motorTemizligi',
      'koltuk',
      'doseme',
      'bagaj',
      'antibakteriyel',
      'deriPlastik',
      'klimaKanallari',
      'ozon',
      'nanoAntibakteriyel',
    ],
  },
  {
    id: 'fullEko',
    family: 'full',
    tier: 'eko',
    featured: false,
    hours: '6',
    includes: [
      'kilUygulamasi',
      'derinCizik',
      'ortaAsinma',
      'boyaKoruma',
      'motorTemizligi',
      'koltuk',
      'doseme',
      'bagaj',
      'antibakteriyel',
      'deriPlastik',
      'klimaKanallari',
    ],
  },
  {
    id: 'fullPlus',
    family: 'full',
    tier: 'plus',
    featured: true,
    hours: '10-12',
    includes: [
      'detayliYikama',
      'demirTozu',
      'kilUygulamasi',
      'derinCizik',
      'ortaAsinma',
      'boyaKoruma',
      'seramikWax',
      'motorTemizligi',
      'farTemizligi',
      'koltuk',
      'doseme',
      'bagaj',
      'antibakteriyel',
      'deriPlastik',
      'klimaKanallari',
      'ulv',
    ],
  },
] as const;

/**
 * Ürünlerimiz — eigene Chemie, echte Katalogfotos.
 * Alle zehn Gruppen aus dem Katalog des Kunden; vier davon fehlten bisher.
 */
export const products = [
  { id: 'sampuan', img: '/img/urun-sampuan.jpg' },
  { id: 'lastik', img: '/img/urun-lastik.jpg' },
  { id: 'jant', img: '/img/urun-jant.jpg' },
  { id: 'icTemizlik', img: '/img/urun-ic-temizlik.jpg' },
  { id: 'leke', img: '/img/urun-leke.jpg' },
  { id: 'hizli', img: '/img/urun-hizli.jpg' },
  { id: 'motor', img: '/img/urun-motor.jpg' },
  { id: 'pasta', img: '/img/urun-pasta.jpg' },
  { id: 'parfum', img: '/img/urun-parfum.jpg' },
  { id: 'amator', img: '/img/urun-amator.jpg' },
] as const;

/**
 * Weiterführende Angebote der Marke, die keine eigene Sektion tragen, aber
 * verlinkt gehören: der Onlineshop und die Franchise-Bewerbung. Beide standen
 * im Hauptmenü des Kunden und fehlten hier komplett.
 */
export const brandLinks = [
  { id: 'shop', href: 'https://carwax.com.tr/urunlerimiz/' },
  { id: 'franchise', href: 'https://carwax.com.tr/bayilik-basvurusu/' },
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

/**
 * C-Marine Care — in Antalya der Hebel, den kein lokaler Wettbewerber hat.
 *
 * Jetzt vollständig: alle zwölf Punkte des C-Marine-Menüs. Die vier zuletzt
 * ergänzten Motive wurden vorher einzeln angesehen — alle zeigen tatsächlich
 * ein Boot (roter Runabout, Chromreling, Decksklampen) und nicht wie manche
 * andere Marine-Seite des Kunden ein Auto.
 */
export const marine = [
  { id: 'jelcoat', img: '/img/marine-jelcoat.jpg' },
  { id: 'pastaCila', img: '/img/marine-pasta-cila.jpg' },
  { id: 'camPastasi', img: '/img/marine-cam.jpg' },
  { id: 'tik', img: '/img/marine-tik.jpg' },
  { id: 'pervane', img: '/img/marine-pervane.jpg' },
  { id: 'kromKoruma', img: '/img/marine-krom.jpg' },
  { id: 'boya', img: '/img/marine-boya.jpg' },
  { id: 'zehirliBoya', img: '/img/marine-zehirli.jpg' },
  { id: 'kumlama', img: '/img/marine-kumlama.jpg' },
  { id: 'fiber', img: '/img/marine-fiber.jpg' },
  { id: 'kevlar', img: '/img/marine-kevlar.jpg' },
  { id: 'genelTemizlik', img: '/img/marine-genel.jpg' },
] as const;

/**
 * Kundenstimmen.
 *
 * ⚠️ HERKUNFT: Das sind die elf Zitate, die der Kunde selbst auf
 * carwax.com.tr unter „Müşteri Yorumları" veröffentlicht. Es sind **keine**
 * Google-Rezensionen und werden auf der Seite auch nicht als solche
 * ausgegeben — die Sektion nennt die Quelle sichtbar. Echte Google-Kommentare
 * ließen sich ohne Places-API-Schlüssel nicht auslesen, und erfinden ist
 * ausgeschlossen.
 *
 * Bewusst direkt VOR der Bewertungssektion platziert: erst die Stimmen, dann
 * die ungeschönte 2,6. Andersherum läse sich die Reihenfolge wie Schönfärberei.
 */
export const testimonials = [
  { id: 'emre', name: 'Emre Koç' },
  { id: 'osman', name: 'Osman Aslan' },
  { id: 'yusufg', name: 'Yusuf Gün' },
  { id: 'yasemin', name: 'Yasemin Ergen' },
  { id: 'turgut', name: 'Turgut Kara' },
  { id: 'zeynep', name: 'Zeynep Kırmızı' },
  { id: 'ahmet', name: 'Ahmet Yılmaz' },
  { id: 'ebru', name: 'Ebru Kaya' },
  { id: 'mehmet', name: 'Mehmet Aksoy' },
  { id: 'cenk', name: 'Cenk Kılıç' },
  { id: 'ayse', name: 'Ayşe Güler' },
] as const;

/**
 * Die fünf Fragen, die der Kunde auf seiner Startseite selbst beantwortet.
 * Inhaltlich übernommen, sprachlich geglättet. Gute Substanz, die bisher
 * schlicht fehlte.
 */
export const faq = ['nedir', 'hizmetler', 'nerede', 'franchise', 'teknoloji'] as const;

/**
 * NOCH OFFEN — vom Kunden zu liefern, bis dahin nirgends im UI:
 *   whatsapp, Öffnungszeiten, Geokoordinaten, Preise, Google-Rating,
 *   Instagram-Handle des Antalya-Betriebs.
 */
export const pending = {
  whatsapp: null,
  hours: null,
  prices: null,
  rating: null,
  instagram: null,
} as const;
