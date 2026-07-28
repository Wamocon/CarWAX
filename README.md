# CarWAX Antalya

Premium-Website für **CARWAX Car Care Systems**, Antalya. Dreisprachig
(TR / EN / RU), heller und dunkler Modus, mit KI-Concierge.

Gebaut von [WAMOCON](https://wamocon.com/webdesign).

---

## Schnellstart

```bash
npm install            # installiert web/ mit
cp web/.env.example web/.env.local   # Backend-Zugang eintragen (optional)
npm run dev            # http://localhost:3000/tr
```

Die Wurzel enthält nur Weiterleitungen; die eigentliche Anwendung liegt in
[`web/`](web). `npm run dev` funktioniert von beiden Orten aus.

## Prüfen

```bash
npm run typecheck
npm run build
cd web && PORT=3100 npm start
cd web && npm run qa      # 3 Sprachen × 3 Viewports
```

> ⚠️ **QA immer gegen den Production-Build laufen lassen, nie gegen `next dev`.**
> In headless Chrome scheitert der HMR-WebSocket des Dev-Servers. Turbopacks
> Client-Runtime bootet dann nicht fertig, React hydriert nie, und jede Prüfung
> meldet Fehler, die es im echten Build nicht gibt.

---

## Vor dem Livegang

Eine Sache **muss** gesetzt werden, sonst zeigt die Seite Google die falsche Adresse:

```bash
# in web/.env.local
NEXT_PUBLIC_SITE_URL=https://die-echte-domain.com
```

Daran hängen `canonical`, `hreflang`, `sitemap.xml`, `robots.txt`, `og:image`
und sämtliche strukturierten Daten. Ohne den Wert läuft alles gegen den
Platzhalter `https://carwax-antalya.com`. Die Seite funktioniert, aber jede
Suchmaschine bekommt eine Domain genannt, die dem Kunden nicht gehört.

Danach prüfen:

```bash
curl -s https://die-echte-domain.com/tr | grep -o 'rel="canonical"[^>]*'
curl -s https://die-echte-domain.com/sitemap.xml
curl -s https://die-echte-domain.com/llms.txt
```

Und einmal durch den [Rich-Results-Test](https://search.google.com/test/rich-results)
sowie den [Schema-Validator](https://validator.schema.org/) schicken.

### Danach beim Kunden

| Was | Warum |
|---|---|
| Google Business Profile für alle vier Filialen beanspruchen | Nur TerraCity hat einen gepflegten Eintrag. Die anderen drei sind eine nackte Stecknadel und tauchen in der Umkreissuche kaum auf. |
| Search Console einrichten, Sitemap einreichen | Sonst dauert die Indexierung der drei Sprachfassungen unnötig lange. |
| Die drei WhatsApp-Nummern bestätigen lassen | Ein toter WhatsApp-Knopf kostet mehr Vertrauen, als er einbringt. |
| Bewertungen der drei übrigen Filialen nachtragen | In `branchRatings` in `lib/data/site.ts`. Der Gesamtschnitt rechnet sich dann selbst. |

---

## Auffindbarkeit

Die Seite liefert mehr als HTML aus:

| Pfad | Zweck |
|---|---|
| `/sitemap.xml` | Drei Sprachfassungen mit `alternates` |
| `/robots.txt` | `/api/` gesperrt, damit Crawler kein KI-Kontingent verbrennen |
| `/llms.txt` | Maschinenlesbare Faktenkarte für Antwortmaschinen, erzeugt aus derselben Wissensbasis wie der Concierge |
| `/manifest.webmanifest` | „Zum Startbildschirm hinzufügen" auf Android |
| `/og.jpg` | Vorschaubild, vor allem für WhatsApp |

Im `<head>` steht ein zusammenhängender **JSON-LD-Graph**: `Organization`,
`WebSite`, vier `AutoRepair`-Knoten mit geprüften Koordinaten und Postleitzahlen,
`FAQPage` mit `speakable`, und C-Marine als eigener `Service`.
Erzeugt in [`web/lib/seo/jsonld.ts`](web/lib/seo/jsonld.ts) aus `lib/data/site.ts`.

> Die Google-Bewertung steht im Graphen **nur an der Filiale, für die eine echte
> Zahl vorliegt**. Sie an alle vier zu hängen wäre eine Falschaussage gegenüber
> Google, und Google prüft das.

---

## Bilder neu erzeugen

```bash
cd web && python scripts/grade-images.py
```

Liest `01 Fotos/web-carwax/` und schreibt alle 54 Bilder nach `public/img/`.
Ein Aufruf, reproduzierbar. Produktfotos und Porträts laufen bewusst ungegradet
durch: ein Katalogbild darf nicht kinematisch sein, und Gesichter vertragen die
Entsättigung nicht.

---

## Aufbau

```
DESIGN.md                    Designsystem: Farbe, Typo, Raum, Motion, Prüfliste
INSTRUCTION.md               Playbook, Befunde, offene Punkte
Marktanalyse-*.md            Markt- und Wettbewerbsanalyse Antalya
Roadmap-*.xlsx               26 priorisierte Maßnahmen
Video-Prompts-Hero.md        Veo-Prompts für die Hero-Clips
Video-Script-*.md            Drehbuch Erklärvideo (TR) mit WAMOCON-Intro

01 Fotos/                    Bildarchiv des Kunden + Galerie zum Durchsehen
demo/hero-animation.html     Erster Prototyp der Signature, ohne Abhängigkeiten

web/                         Die Website
  app/[locale]/              Layout und Startseite, Locales tr | en | ru
  app/api/chat/              Streaming-Endpunkt des Concierge
  app/globals.css            Design-Tokens, beide Modi, Atmosphäre
  components/anim/           ScrollGloss (Signature), Tilt, GlossSweep
  components/sections/       Die Sektionen der Startseite
  components/ai/             Concierge und WhatsApp-Knopf
  lib/ai/                    Provider, Systemprompt, Wissensbasis, Rate-Limiter
  lib/seo/jsonld.ts          Strukturierte Daten, erzeugt aus site.ts
  lib/data/site.ts           Verifizierte Betriebsdaten (Zero-Fabrication)
  messages/                  Übersetzungen
  scripts/qa.mjs             Headless-QA
  scripts/grade-images.py    Bild-Pipeline, erzeugt alle 54 Bilder
```

## Stack

Next.js 16 (App Router, React 19, Turbopack) · Tailwind CSS v4 · motion.dev ·
GSAP 3 + ScrollTrigger · Lenis · next-intl 4 · NumberFlow · Geist · Playwright-
artige QA über puppeteer-core.

---

## Zwei Regeln, die das Projekt trägt

**Zero-Fabrication.** Keine erfundenen Preise, Bewertungen, Zertifikate oder
Garantien. Was nicht belegt ist, steht als `null` in `lib/data/site.ts` und
erscheint nirgends im UI. Die Wissensbasis des Concierge wird aus derselben
Datei erzeugt — er kann nichts wissen, was nicht auch auf der Seite steht.

**Motion nach `emil-design-eng`.** Kein `ease-in`, kein `transition: all`,
UI-Animationen unter 300 ms, `:active { scale(.97) }` auf allem Drückbaren,
`prefers-reduced-motion` überall respektiert. Details in [`DESIGN.md`](DESIGN.md).

**Kein Kicker über einer Überschrift.** Dazu keine Kapitelnummern und kein
Farbverlauf auf Schrift. Label, Überschrift und Fließtext dreizehnmal
untereinander sind genau die Dreiteilung, an der man eine Vorlage erkennt.
Betonung kommt stattdessen aus zwei Überschriftengraden. Begründung in
[`DESIGN.md`](DESIGN.md).
