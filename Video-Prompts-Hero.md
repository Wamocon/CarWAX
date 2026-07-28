# Hero-Video · Veo-Prompts (Stand Juli 2026)

> Projekt: **CarWAX Car Care Systems — Antalya** · WAMOCON
> Marken-Rot exakt aus dem Logo gemessen: **`#EC1C24`**
> Zweck: 8-Sekunden-Clips als Hintergrund der Hero-Sektion und für das Erklärvideo.

---

## 1. Was Veo 3.1 aktuell kann (verifiziert, Januar/Juli 2026)

| Punkt | Stand |
|---|---|
| Referenzbilder | **max. 3 pro Clip** („Ingredients to Video": character / object / scene) |
| Länge | 4, 6 oder 8 Sekunden |
| Format | 16:9 **und** 9:16 (Hochformat seit Jan 2026 auch bei Ingredients to Video) |
| Auflösung | 1080p, Upscaling bis 4K |
| Wo | Gemini-App · Google Flow · AI Studio · Gemini API |

**Konsequenz:** Es lassen sich **nicht** 6–8 Bilder in einen Clip geben.
Deshalb **drei Sets à drei Bildern** → drei Clips à 8 s → 24 s Material.
Quellen: [Google Developers Blog](https://developers.googleblog.com/en/introducing-veo-3-1-and-new-creative-capabilities-in-the-gemini-api/) ·
[Veo-3.1-Prompting-Guide, Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1) ·
[Workspace Update 9:16](https://workspaceupdates.googleblog.com/2026/01/ingredients-to-video-portrait-vids.html)

---

## 2. Die drei Upload-Sets

Ordner: `01 Fotos/VEO-Upload/`

| Set | Ordner | Bilder (in dieser Reihenfolge hochladen) |
|---|---|---|
| **A · Hero** | `A-Hero-Studio/` | Szene schwarzes Studio + roter Sportwagen · Objekt Spiegelglanz-Lackfläche · Szene dunkle Halle |
| **B · Handwerk** | `B-Handwerk/` | Objekt Keramik-Applikator · Aktion Handschuh + Applikator · Aktion PPF-Folie |
| **C · Marine** | `C-Marine/` | Aktion Yacht-Rumpf-Politur · Objekt Teakdeck · Objekt Propeller |

Die Dateinamen sagen bereits, welche Rolle das Bild spielt
(`01-SCENE-…`, `02-OBJECT-…`, `03-ACTION-…`).

---

## 3. PROMPT A — Hero-Loop (Set A · 16:9 · 8 s)

```
Cinematic automotive commercial. Use the reference images for the car, the paint finish
and the studio environment. A deep candy-red sports car stands in a pitch-black studio.
Fine backlit water mist drifts slowly across the frame from the right. The camera performs
an extremely slow dolly push-in with a subtle parallax drift to the left. One hard rim-light
rakes along the shoulder line, and its reflection travels slowly down the polished paint,
revealing a mirror-like ceramic-coated surface. Tiny water beads sit on the hood and catch
the light. Colour palette: near-black background, deep crimson red, cool white speculars.
Anamorphic lens, shallow depth of field, subtle film grain, 24fps motion blur.
No text, no logos, no people, no cuts. Calm, luxurious, loopable.
```

**Negative:** `text, watermark, logo, subtitles, people, hands, fast motion, zoom bounce, cartoon, oversaturated, lens flare spam, shaky camera, cuts, transitions, distorted car body, wrong wheel count`

---

## 4. PROMPT B — Handwerk / Makro (Set B · 16:9 · 8 s)

```
Cinematic macro sequence for a luxury car-care brand. Use the reference images for the
applicator, the gloved hand and the paint protection film. Extreme close-up of a
black-gloved detailer's hand gliding a ceramic-coating applicator across flawless dark-red
paint in a blacked-out studio. Behind the applicator the surface turns mirror-glossy and a
razor-thin white reflection line sweeps across it. Slow, weighty camera slide from left to
right, macro depth of field, dust motes floating in the light beam.
Colour palette: black, deep crimson, cold white highlight. Anamorphic lens, gentle film
grain. No text, no logo, no face, seamless loop.
```

**Negative:** `text, watermark, logo, face, fast motion, cartoon, plastic skin, extra fingers, deformed hand, shaky camera, cuts`

---

## 5. PROMPT C — C-Marine Care (Set C · 16:9 · 8 s)

> Antalya hat Marinas — das ist das Argument, das kein lokaler Wettbewerber hat.

```
Cinematic shot at blue hour in a Mediterranean marina. Use the reference images for the
yacht hull, the teak deck and the polished propeller. A white luxury motor yacht hull,
freshly polished, mirrors the last warm light. A slow lateral dolly glides along the hull;
the gelcoat reflection travels with the camera. Calm water, soft ripples, distant marina
lights as bokeh. Colour palette: deep teal-black water, pearl-white hull, warm amber
highlights. Anamorphic lens, shallow depth of field, subtle grain.
No text, no logo, no people, seamless loop.
```

**Negative:** `text, watermark, logo, people, fast motion, choppy water, cartoon, oversaturated, shaky camera, cuts`

---

## 6. Bonus — 9:16 für Instagram / Reels

Gleiche Prompts, nur Format auf **9:16** stellen und diesen Satz anhängen:

```
Vertical 9:16 composition, subject centred with generous headroom for a text overlay in
the upper third and a call-to-action in the lower third.
```

---

## 7. Technische Vorgaben für den Einbau

- **Format:** MP4 (H.264) + WebM, 1920×1080, 8 s, **ohne Ton**
- **Dateigröße:** unter **6 MB** (Referenz: New Level Premium `aerial.mp4` = 5,7 MB)
- **Attribute:** `autoplay muted loop playsinline preload="metadata"` + Poster-JPG
- **Mobil:** 9:16-Schnitt oder nur Poster (Datenvolumen)
- **`prefers-reduced-motion`:** Video pausiert, Poster bleibt stehen
- Video pausiert automatisch, sobald der Hero aus dem Viewport scrollt (IntersectionObserver)

---

## 8. Zusammenspiel mit der Animation

Der Clip ist nur die **Bühne**. Die Bewegung darüber liegt in
[`demo/hero-animation.html`](demo/hero-animation.html) und läuft ohne jede Bibliothek:

| Modul | Was es macht |
|---|---|
| **Gloss Sweep** | Lichtkante wischt über das Bild, matte Fläche wird zu Spiegelglanz — die Produktgeschichte als Animation |
| **Ken Burns** | 26-s-Zoom, unmerklich langsam |
| **Scroll-Parallax** | Hintergrund driftet langsamer als der Text |
| **Vorher/Nachher** | dieselbe Technik, aber per Drag steuerbar |
| **Scroll-Sequenz** | vier Prozessbilder, an den Scroll gekoppelt |
| **Zahlenband** | zählt die echten CarWAX-Werte hoch (114.465 / 44.608 / 36.962 / 41.256) |

Jedes Modul ist einzeln herauslösbar und in jedem anderen WAMOCON-Projekt verwendbar.
