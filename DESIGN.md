# DESIGN.md — CarWAX Car Care Systems · Antalya

> Für Menschen **und** Coding-Agents. Konkrete Werte statt Adjektive.
> Referenzformat: [Refero Styles · DESIGN.md für AI-Agents](https://styles.refero.design/ai-agents/design-md-examples).
> Motion-Standard: [`emil-design-eng`](https://github.com/emilkowalski/skills) (lokal installiert unter `~/.claude/skills/`).

---

## 0. Der Satz, der alles steuert

**Eine schwarze Werkhalle um Mitternacht, ein einziges hartes Licht auf lackiertem Rot.**

Nicht „elegant-editorial" (das ist Alanyum). Dieses hier ist **technisch, präzise, gebaut**.
CarWAX ist seit 1989 im Markt, produziert eigene Chemie, betreibt 50+ Stationen und pflegt Yachten.
Der Auftritt muss nach **Ingenieurbetrieb** aussehen, nicht nach Waschstraße.

Wenn eine Designentscheidung ansteht, ist die Frage: *Würde Porsche Motorsport das so machen?*
Nicht: *Sieht das hübsch aus?*

---

## 1. Farbe

Alle Werte gemessen — Rot direkt aus `carwax-logo.png` gepickt, nicht geschätzt.

| Token | Hex | Rolle | Anteil im Viewport |
|---|---|---|---|
| `--bg` | `#08080A` | Grundbühne | 70–85 % |
| `--bg-raised` | `#101013` | Sektionswechsel, Karten | 10–20 % |
| `--bg-sunken` | `#050506` | Footer, Overlays | – |
| `--brand` | **`#EC1C24`** | **Markenrot — exakt aus dem Logo** | **≤ 5 %** |
| `--brand-hot` | `#FF3B42` | Hover, aktiver Zustand | punktuell |
| `--brand-deep` | `#8E0D13` | Verläufe, Schattenkante | punktuell |
| `--fg` | `#F4F3F1` | Fließtext | – |
| `--fg-muted` | `#9C9893` | Sekundärtext | – |
| `--fg-faint` | `#6A6763` | Labels, Meta | – |
| `--hairline` | `rgba(244,243,241,.09)` | Trennlinien, Kartenrand | – |
| `--hairline-strong` | `rgba(244,243,241,.20)` | Hover-Rand, Fokus | – |
| `--wa` | `#25D366` | WhatsApp — fix, nie ändern | – |

### Die harte Regel

**Rot ist nie Fläche.** Rot ist Linie, Ziffer, Rand, Cursor, ein einzelner Button.
Die aktuelle Seite `carwax.com.tr` legt einen roten Verlauf über jedes Foto — genau das
macht sie billig. Wir drehen es um: das Foto bleibt, Rot markiert nur.

Wenn mehr als ein Zwanzigstel des sichtbaren Bereichs rot ist, ist es zu viel.

### Kein Schatten auf Schwarz

`box-shadow` liest sich auf `#08080A` nicht. Tiefe entsteht über
**Haarlinie + minimal hellere Fläche + Grain**. Ausnahme: der rote Glow an der
Vorher/Nachher-Kante (`0 0 26px 3px rgba(236,28,36,.5)`) — der ist Absicht.

---

## 2. Typografie

**Geist Sans + Geist Mono** (npm `geist`, selbst gehostet, kein Google-Fonts-Request).

Begründung: Das CarWAX-Logo ist eine schwere, kursiv geneigte Grotesk. Eine Serifen-
Headline würde dagegen arbeiten. Geist ist technisch, neutral und trägt bei großen Graden
enge Laufweite — genau der „engineered"-Ton. Mono für Labels ist das Signal, das den
Unterschied zwischen *Werkstatt* und *Labor* macht.

| Rolle | Familie | Größe | Tracking | Weight |
|---|---|---|---|---|
| Display / Hero | Geist Sans | `clamp(3.2rem, 9vw, 8rem)` | `-0.035em` | 500 |
| H2 | Geist Sans | `clamp(2rem, 4.4vw, 3.6rem)` | `-0.025em` | 500 |
| H3 | Geist Sans | `clamp(1.25rem, 2vw, 1.6rem)` | `-0.015em` | 500 |
| Fließtext | Geist Sans | `1.0625rem` / `1.65` | `0` | 400 |
| Eyebrow / Label | **Geist Mono** | `0.6875rem` | `0.22em`, uppercase | 500 |
| Zahl / Spec | **Geist Mono** | variabel, `tabular-nums` | `-0.01em` | 500 |

- **Zeilenhöhe Display: `0.94`.** Enger als es sich richtig anfühlt — das ist der Punkt.
- Fließtext nie breiter als **68 Zeichen**.
- Türkisch braucht `İ ı ş ğ ç ö ü`, Russisch Kyrillisch — Geist deckt beides.
  **Vor dem Launch mit echtem TR/RU-Text prüfen, nicht mit Lorem Ipsum.**

---

## 3. Raum & Raster

| Größe | Wert |
|---|---|
| Basiseinheit | `4px` |
| Container | `max-width: 1280px` |
| Seitenrand | `clamp(20px, 5vw, 64px)` |
| Sektionspolsterung | `clamp(96px, 12vw, 180px)` vertikal |
| Abstand H2 → Text | `20px` |
| Abstand Text → Inhalt | `56px` |
| Kartenraster | 12 Spalten, `gap: 1px` auf `--hairline` (Linien entstehen aus dem Gap) |

**Dichte: offen.** Großzügig, viel Schwarzraum. Die Seite darf sich leer anfühlen —
Leere ist hier das Luxussignal. Nie mehr als **drei** Informationsebenen pro Bildschirm.

---

## 4. Komponenten-Rahmung

| Element | Regel |
|---|---|
| Radius | `2px`. Nicht 0 (wirkt roh), nicht 12px (wirkt freundlich/SaaS). |
| Kartenrand | `1px solid var(--hairline)`, Hover → `--hairline-strong` |
| Kartenfüllung | `--bg-raised`, kein Verlauf |
| Button primär | Fläche `--brand`, Text `#fff`, Höhe `52px`, Mono-Label `0.22em` |
| Button sekundär | transparent, `1px solid var(--hairline-strong)` |
| Fokus | `outline: 2px solid var(--brand); outline-offset: 2px` — nie entfernen |
| Touch-Ziel | mindestens `44px` |
| Bild | randlos, ohne Radius, immer kinematisch gegradet (siehe §6) |

---

## 5. Motion

Kurven nach `emil-design-eng`. **`ease-in` kommt nirgends vor.**

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);    /* Ein-/Austritt, Standard */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* Bewegung auf dem Schirm */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* Drawer, Sheets */
```

| Element | Dauer |
|---|---|
| Button-Druckfeedback | `140ms` |
| Tooltip, kleines Popover | `160ms` |
| Dropdown, Select | `200ms` |
| Modal, Drawer | `280ms` |
| Scroll-gebundene Erzählung | ungebunden (nicht UI) |

**UI unter 300 ms. Immer.** Lange Bewegung gibt es nur dort, wo erzählt wird —
Hero-Wisch, Ken Burns, Scroll-Sequenz. Das sind Marketing-Animationen, keine Interaktionen.

### Pflicht

- Jedes drückbare Element: `:active { transform: scale(0.97) }`
- Nie `transition: all` — immer die Eigenschaft benennen
- Nie aus `scale(0)` einblenden — `scale(0.95)` + `opacity: 0`
- Hover-Effekte hinter `@media (hover: hover) and (pointer: fine)`
- Popover skaliert aus dem Trigger (`transform-origin: var(--transform-origin)`), Modal bleibt zentriert
- Stagger 40–70 ms, nie mehr
- `prefers-reduced-motion`: Bewegung raus, Opazität bleibt
- Nur `transform` und `opacity` animieren

### Die Signature: „Gloss Sweep"

Eine Lichtkante wandert über das Bild; dahinter wird matte Fläche zu Spiegelglanz.
Zwei Ebenen desselben Fotos, die obere matt, per `clip-path: inset()` weggewischt.

**Das ist die Produktgeschichte als Bewegung** — genau das macht eine Keramikversiegelung.
Kein Wettbewerber in Antalya hat so etwas. Prototyp läuft: [`demo/hero-animation.html`](demo/hero-animation.html).

Einsatz: einmal im Hero, einmal als Vorher/Nachher. **Nicht öfter.** Eine Signature,
die dreimal auftritt, ist keine Signature mehr.

---

## 6. Bildsprache

193 Originaldateien liegen unter [`01 Fotos/web-carwax/`](01%20Fotos/web-carwax/), Übersicht: [`01 Fotos/GALERIE.html`](01%20Fotos/GALERIE.html).

**Verwendbar:** dunkelrote Lackaufnahmen, Handschuh-Makros, PPF-Folie, Politur,
C-Marine (Yacht, Teak, Propeller), Produktreihe auf Weiß, Teamporträts.

**Nicht verwendbar:** die Filial-Ankündigungsslides mit rotem Vollflächenverlauf.
Das ist Social-Media-Grafik, keine Markenfotografie.

### Grading (Pflicht vor Einbau)

Schwarzpunkt anheben auf ~`#0A0A0B`, Sättigung außerhalb des Rots zurücknehmen,
Rot selbst leicht anheben, Vignette, feines Korn. Ziel: alle Bilder wirken aus
**einem** Set. Aktuell stammen sie sichtbar aus fünf verschiedenen Quellen.

### Was fehlt

Fotos der Antalya-Filialen, echte Vorher/Nachher-Paare, das lokale Team.
Bis die da sind: vorhandene Motive verwenden, **nichts erfinden**.

---

## 7. Ton

Deutsch intern, **Türkisch** primär auf der Seite, dazu EN / RU
(Antalya: Tourismus, Residenten, Mietwagen). Arabisch nur, wenn der Kunde es will —
die Konzernseite führt es, es kostet aber RTL-Aufwand.

Kurze Sätze. Belege statt Behauptungen. **1989**, **50+ Stationen**, **114.465 Wäschen** —
das sind verifizierte Zahlen von der Konzernseite und tragen mehr als jedes Adjektiv.

**Zero-Fabrication:** keine erfundenen Preise, Ratings, Zertifikate, Garantien.
Preise bis auf Weiteres „Fiyat için sorun" über WhatsApp.

---

## 8. Stack

Gespiegelt von [`D:\Real Estate CRM\New Level Premium`](D:/Real%20Estate%20CRM/New%20Level%20Premium) — läuft dort bereits produktiv.

| Ebene | Wahl | Warum |
|---|---|---|
| Framework | **Next.js 16** (App Router, React 19, Turbopack) | im Haus, geprüft |
| Styling | **Tailwind CSS v4** (CSS-first Tokens) | Tokens oben leben in `@theme` |
| Motion | **motion** (motion.dev) | Springs, Layout, Exit — Emils Empfehlung |
| Scroll-Erzählung | **GSAP 3.15 + ScrollTrigger** | pin/scrub kann Motion nicht |
| Smooth Scroll | **Lenis 1.3.25** (`lenis/react`) | via `gsap.ticker` gekoppelt |
| 3D | **R3F 9 + drei 10** | nur falls nötig — siehe unten |
| Komponenten | **Animate UI** (Copy-Paste, React + Tailwind + Motion) | kein Dependency-Ballast |
| Primitives | **base-ui** | Dialog, Popover, Select — barrierefrei |
| Zahlen | **NumberFlow** | Ziffernwechsel im Zahlenband |
| Toasts | **Sonner** | Buchungsbestätigung |
| i18n | **next-intl 4** | TR / EN / RU |
| Schrift | **geist** (npm) | selbst gehostet |
| QA | **Playwright** | Screenshot-Sweep pro Sprache + Viewport |

### Zwei Korrekturen

**Inspira UI ist Vue/Nuxt**, nicht React — in einem Next.js-Projekt nicht direkt nutzbar.
Die Effekte, die es bekannt gemacht haben, sind ohnehin GSAP/CSS und lassen sich
in einer Stunde nachbauen. Wir nehmen die *Ideen*, nicht das Paket.

**Three.js nur, wenn es etwas erklärt.** Bei New Level war die 3D-Turmmaquette
sinnvoll — es ging um ein Gebäude. Hier gäbe es ein 3D-Auto, das niemand braucht und
das 400 KB kostet. **Vorschlag: kein WebGL.** Wenn doch, dann genau eine Stelle:
ein rotierender Lackschnitt, der die Schichten Lack → Keramik → PPF zeigt.
Das erklärt das teuerste Produkt. Alles andere ist Angeberei.

---

## 9. Prüfliste vor jedem Commit

- [ ] Kein `transition: all`
- [ ] Kein `ease-in`
- [ ] Jedes drückbare Element hat `:active { scale(0.97) }`
- [ ] UI-Animationen < 300 ms
- [ ] Rot unter 5 % der Fläche
- [ ] Fokus sichtbar auf jedem interaktiven Element
- [ ] Kein horizontaler Überlauf 320–768 px
- [ ] `prefers-reduced-motion` getestet
- [ ] Echter TR- und RU-Text, kein Lorem Ipsum
- [ ] Keine erfundene Zahl auf der Seite
