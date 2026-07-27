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
  lib/data/site.ts           Verifizierte Betriebsdaten (Zero-Fabrication)
  messages/                  Übersetzungen
  scripts/qa.mjs             Headless-QA
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
