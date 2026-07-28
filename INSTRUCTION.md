# INSTRUCTION.md — CarWAX Car Care Systems · Antalya

> Arbeits-Playbook. Beim Weiterarbeiten zuerst diese Datei lesen, dann [`DESIGN.md`](DESIGN.md).
> Stand: **27.07.2026** · Status: **Next.js-Gerüst steht, Hero live, 9/9 QA grün**

---

## 1. Projekt in einem Satz

Neue Premium-Website für den **CarWAX-Betrieb in Antalya** (vier Stationen), dreisprachig
TR/EN/RU, plus türkisches Erklärvideo mit WAMOCON-Intro. Vorbild: das Alanyum-Projekt,
technisch gehoben auf den New-Level-Premium-Stack.

## 2. Der wichtigste Befund

**CarWAX ist keine Waschstraße, sondern eine Franchise-Marke seit 1989.**

| | |
|---|---|
| Marke | CARWAX Car Care Systems · Handel seit 1989, Marke seit 1995, Franchise seit 2002 |
| Inhaber | Mustafa Mumcu (Direktör), Erkan Mumcu · Nergis Mumcu (Genel Müdür) |
| Zentrale | Ümraniye / İstanbul · +90 216 540 03 48 |
| Netz | 50+ Stationen · Dubai, Kasachstan, KKTC, Irak, Kosovo, Bulgarien, Nigeria |
| Eigene Chemie | ja — eigene Produktlinie + Onlineshop „CarWAX Online" |
| Besonderheit | **C-Marine Care** — komplette Yacht-/Bootssparte |
| Bestandsseite | [carwax.com.tr](https://carwax.com.tr) (TR/EN/RU/AR) — **mit Lorem Ipsum auf der Startseite** |

**Antalya-Stationen:** TerraCity + Mark Antalya (Muratpaşa, beide „Premium Bayi"),
Erasta AVM + ÖzdilekPark (Kepez), Agora AVM (neu).
Mark Antalya und Özdilek teilen eine Telefonnummer → sehr wahrscheinlich derselbe Betreiber.
**Vor Go-Live bestätigen lassen.**

## 3. Der Hebel

| Betrieb | Bewertung | Anzahl |
|---|---|---|
| Meguiar's Antalya | 4,9 ★ | **665** |
| Hızır Oto Yıkama Konyaaltı | 4,9 ★ | 198 |
| ADA Oto Yıkama Çallı | 5,0 ★ | 170 |
| **CarWax TerraCity** | **3,9 ★** | **17** |

Dazu offene Beschwerden auf Şikayetvar zur Filiale Özdilek — und CarWAX hat dort **kein
Markenprofil**, beantwortet also nichts. Die stärkste Marke im Markt hat lokal die
schwächste digitale Reputation. Das ist die ganze Geschichte des Pitches.

## 4. Dateistruktur

```
DESIGN.md                    → Designsystem (Farbe, Typo, Raum, Motion, Stack)
INSTRUCTION.md               → diese Datei
Video-Prompts-Hero.md        → Veo-3.1-Prompts + Upload-Sets

01 Fotos/
  web-carwax/                → 193 Originalbilder von carwax.com.tr (offline)
  GALERIE.html               → Übersicht aller 193 Bilder im Browser
  _contactsheet-1..6.jpg     → Kontaktbögen
  VEO-Upload/{A,B,C}/        → 3 Sets à 3 Bildern für Veo (max. 3 pro Clip)

demo/hero-animation.html     → »Gloss Sweep«-Prototyp, single-file, ohne Abhängigkeiten

web/                         → die eigentliche Website (Next.js 16)
  app/[locale]/              → Layout + Startseite, Locales tr|en|ru
  app/globals.css            → Design-Tokens als Tailwind-v4-@theme
  components/anim/GlossSweep → die Signature-Animation als React-Komponente
  components/sections/Hero   → Hero mit zeilenweisem Masken-Reveal
  components/providers/      → SmoothScroll (Lenis ⇄ GSAP-Ticker)
  lib/data/site.ts           → verifizierte Betriebsdaten (Zero-Fabrication)
  messages/{tr,en,ru}.json   → Übersetzungen
  public/img/                → 38 gegradete Bilder
  scripts/qa.mjs             → Headless-QA über 3 Sprachen × 3 Viewports
```

## 5. Entwickeln

```bash
cd web
npm install
npm run dev            # http://localhost:3000 → /tr
```

### ⚠ QA immer gegen den Production-Build

```bash
npm run build
PORT=3100 npm start
node scripts/qa.mjs
```

**Warum:** In headless Chrome scheitert der HMR-WebSocket des Dev-Servers
(`ERR_INVALID_HTTP_RESPONSE`). Turbopacks Client-Runtime bootet dann nicht fertig,
React hydriert nie — die Seite sieht fertig aus, ist aber tot, und jede Prüfung meldet
Fehler, die im echten Build nicht existieren. Der Production-Build hat keinen HMR-Socket.
Das hat einmal eine halbe Stunde Fehlersuche gekostet; nicht nochmal darauf hereinfallen.

Beim Rebuild **erst den laufenden Server stoppen** — ein `npm run build` unter einem
laufenden `npm start` zerlegt dessen Chunk-Auflösung, und alle Requests hängen.

## 6. Verifizierter Stand (27.07.2026)

✅ Build grün, 3 Locales vorgerendert · ✅ `tsc --noEmit` sauber
✅ QA 9/9 (tr/en/ru × desktop/tablet/phone): keine JS-Fehler, keine fehlgeschlagenen
Requests, kein horizontaler Überlauf, Hydration bestätigt, Hero-Animationen laufen durch
✅ Markenrot `#EC1C24` aus dem Logo gemessen · ✅ 38 Bilder gegradet

## 6a. Google-Bewertung — warum sie NICHT auf der Seite steht

> ⚠️ **Korrektur vom 27.07.2026, nachmittags.** Eine frühere Fassung nannte
> hier „3,9 ★ bei 17 Bewertungen (Yandex)". Das war der einzige Wert, den ich
> zu dem Zeitpunkt auslesen konnte, und er ist deutlich zu freundlich.
> Die eingebettete Karte auf der neuen Seite zeigt den echten Google-Eintrag —
> die Zahlen unten sind die richtigen.

Es war gewünscht, die Google-Sterne einzublenden. Drei Gründe, warum das aktuell
schadet statt zu helfen:

1. **Die echte Google-Bewertung ist 2,6 ★ bei 704 Bewertungen** (Carwax Terracity
   Profesyonel Araç Bakım Hizmetleri, abgelesen aus dem Google-Maps-Eintrag).
   Nicht 17 Bewertungen — **704**. Der Eintrag ist gut besucht und schlecht bewertet.
2. **Şikayetvar ist noch deutlicher: 1,7 von 5 bei 43 Bewertungen. 100 Beschwerden
   im letzten Jahr, davon 8 gelöst.** Das ist keine Ausreißer-Statistik, das ist ein
   Muster.
3. **Der Wettbewerb steht bei 4,9 ★ mit 665 Bewertungen** (Meguiar's Antalya).
   Bei praktisch gleicher Bewertungsmenge — 704 gegen 665 — steht CarWAX 2,3 Sterne
   darunter. Das ist der schärfste Befund des ganzen Projekts.

Regel aus dem Alanyum-Projekt, hier übernommen: **Rating erst prominent ab ≥ 4,5 ★.**
Vorher zuerst sanieren — QR-Karte bei der Fahrzeugübergabe, Nachfass-Nachricht, und ein
Markenprofil auf Şikayetvar anlegen, damit die offenen Beschwerden überhaupt beantwortet
werden. `pending.rating` in `lib/data/site.ts` bleibt bis dahin `null`.

## 7. Offene Punkte

1. **Kundendaten:** WhatsApp-Nummer, Öffnungszeiten der drei übrigen Filialen,
   Geokoordinaten, Preise, Google-Rating. Stehen als `null` in `lib/data/site.ts` und
   erscheinen nirgends im UI, bis sie bestätigt sind.
2. **Social bestätigen lassen:** Auf carwax.com.tr zeigen die Icons für Facebook,
   Instagram und X ins Leere — sie verlinken Login-Seiten statt Profile. Geprüft und
   echt ist nur der YouTube-Kanal. Instagram `@carwax_antalya` steht auf der Seite, weil
   der Kunde das Handle selbst über das Ticket geliefert hat.
   `facebook.com/terracitycarwax` ist über die Suche gefunden, nicht bestätigt, und
   deshalb `verified: false` — es erscheint nicht im Footer.
3. **Instagram-Bilder:** Meta blockiert jeden automatisierten Zugriff. Muss der Kunde
   oder Waleri liefern.
4. **Hero-Video:** Veo-Clips nach [`Video-Prompts-Hero.md`](Video-Prompts-Hero.md) erzeugen,
   unter 6 MB, als Hintergrund hinter den Gloss Sweep legen.
5. **Marktanalyse + Roadmap** nach dem WAMOCON-Master-Prompt schreiben.
6. **Türkisches Erklärvideo** mit WAMOCON-Webdesign-Intro (~15 s), dann ~60–90 s CarWAX.
7. **TR/RU von Muttersprachlern prüfen lassen.** Die Übersetzungen sind sorgfältig, aber
   nicht muttersprachlich geprüft.
8. **Scope klären:** Antalya-Betreiber oder Konzern? Ändert Umfang und Zielgruppe.

## 8. Referenzen

- Playbook Vorgängerprojekt: [`D:\Alanium Car Wash\instruction.md`](D:/Alanium%20Car%20Wash/instruction.md)
- Stack-Vorbild: [`D:\Real Estate CRM\New Level Premium`](D:/Real%20Estate%20CRM/New%20Level%20Premium)
- Master-Prompt Marktanalyse: [`D:\Alanium Car Wash\MASTER-PROMPT-Marktanalyse-Universal.md`](D:/Alanium%20Car%20Wash/MASTER-PROMPT-Marktanalyse-Universal.md)
- Branchen-Prompt: [`D:\Alanium Car Wash\PROMPT-Website-Autowasch-Branche.md`](D:/Alanium%20Car%20Wash/PROMPT-Website-Autowasch-Branche.md)
- Motion-Standard: `~/.claude/skills/emil-design-eng/SKILL.md`
