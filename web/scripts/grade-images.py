# -*- coding: utf-8 -*-
"""
CarWAX Bild-Pipeline.

Die 193 Rohbilder stammen sichtbar aus fuenf Quellen (Studio, Stock, KI, Handy,
Marketing). Ohne Angleichung sieht die Seite nach Sammelsurium aus. Diese
Pipeline zwingt alles auf einen Look:

  Schwarzpunkt anheben -> Kontrast -> Saettigung runter, Rot zurueckholen
  -> Vignette -> feines Korn

Produkte (weisser Hintergrund) und Teamportraits laufen ungegradet durch --
ein Katalogbild darf nicht kinematisch sein, und Gesichter vertragen die
Entsaettigung nicht.
"""
import os
import math

from PIL import Image, ImageEnhance, ImageFilter, ImageChops

SRC = r"D:\Professional Car WAX car care systems\01 Fotos\web-carwax"
OUT = r"D:\Professional Car WAX car care systems\web\public\img"

BLACK_POINT = 10          # 0x0A — der Schwarzwert des Designsystems
MAX_W = 2400              # Next/Image skaliert von hier runter


# --- Motivliste ------------------------------------------------------------
# (Quelldatei, Zielname, Grading an/aus)
SHOTS = [
    # Hero / Bühne
    ("2287564367-2-scaled.jpg",        "hero-studio",        True),
    ("Slider2-notext.png",             "hero-halle",         True),
    ("Seramikplus.png",                "hero-seramik",       True),

    # Koruma & Kaplama
    ("Genel-Temizlik.jpg",             "svc-genel-temizlik", True),
    ("seramiknano.png",                "svc-seramik-nano",   True),
    ("semaik-premium.png",             "svc-seramik-premium", True),
    ("seramikcamkaplama.png",          "svc-cam-kaplama",    True),
    ("Grafen-Kaplama.png",             "svc-grafen",         True),
    ("HQ-Koruma-Filmi.png",            "svc-ppf-hq",         True),
    ("BQ-Koruma-Filmi.png",            "svc-ppf-bq",         True),
    ("PQ-Koruma-Filmi.png",            "svc-ppf-pq",         True),
    ("Metalkaplama.png",               "svc-metal-kaplama",  True),
    ("darkestwindowtint.jpg",          "svc-cam-filmi",      True),
    ("ses-yalitimi.jpg",               "svc-ses-yalitimi",   True),

    # İç bakım
    ("gb9gxgnz9oi1gtpphiff5earkqf6arvv1650550215.jpg", "svc-ic-temizlik", True),
    ("antibacterial_mist_treatment_f_1622203906_8b609ec4_progressive.jpg",
                                       "svc-antibakteriyel", True),

    # Onarım
    ("gocuk-onarimio-768x512.jpg",     "svc-gocuk",          True),
    ("uto-glass-crack-repair-1.png",   "svc-cam-catlak",     True),

    # C-Marine Care — das Argument, das in Antalya kein Wettbewerber hat.
    #
    # ACHTUNG: carwax.com.tr bebildert mehrere Marine-Seiten mit AUTOFOTOS
    # (Jelcoat-Bakimi.jpg, C-Marine-Pasta-Cila.jpg, Boya-Uygulama.jpg zeigen
    # rote Karosserien). Ein Autofoto unter der Überschrift "Yat bakımı" ist
    # eine Falschaussage. Hier stehen deshalb die 854x590-Varianten mit dem
    # Zusatz "-yeni"/"cmarine-" — das sind die echten Bootsaufnahmen.
    ("Jelcoat-bakimi-yeni-1.jpg",      "marine-jelcoat",     True),
    ("Tik-Bakimi.jpg",                 "marine-tik",         True),
    ("Pervane-Temizlik-Koruma.jpg",    "marine-pervane",     True),
    ("cmarine-pasta-cila-1.jpg",       "marine-pasta-cila",  True),
    ("kevlar-bakim-1.jpg",             "marine-kevlar",      True),
    ("boya-uygulama-1.jpg",            "marine-boya",        True),
    ("Krom-Koruma-yeni-1.jpg",         "marine-krom",        True),
    ("cam-pastas-1.jpg",               "marine-cam",         True),

    # Produkte — Katalogware, kein Grading
    ("02-Aracyikamasampuanlari-min-1.png", "urun-sampuan",   False),
    ("cizikgidericiler.png",           "urun-pasta",         False),
    ("09-Amatorurunler.png",           "urun-amator",        False),
    ("parfumler.png",                  "urun-parfum",        False),
    ("04-Jantmetalkromurunleri-min.png", "urun-jant",        False),
    ("05-ictemizlikurunleri-min.png",  "urun-ic-temizlik",   False),

    # Team — Gesichter bleiben natürlich
    ("mustafa-mumcu.jpg",              "team-mustafa-mumcu", False),
    ("nergis-mumcu.jpg",               "team-nergis-mumcu",  False),
    ("emrah-kaya.jpg",                 "team-emrah-kaya",    False),
    ("gokhan-calim.jpg",               "team-gokhan-calim",  False),
    ("dilara-akiner-1.jpg",            "team-dilara-akiner", False),
    ("yusuf-kaya.jpg",                 "team-yusuf-kaya",    False),

    # Marke
    ("carwax-logo.png",                "brand-logo",         False),
    ("Carwax-map.png",                 "brand-map",          False),
]


def lift_blacks(im, floor=BLACK_POINT):
    """Schwarz nie auf 0 — reines Schwarz sieht auf einem OLED wie ein Loch aus."""
    lut = [min(255, floor + int(v * (255 - floor) / 255)) for v in range(256)]
    return im.point(lut * 3)


def vignette(im, strength=0.34):
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    cx, cy = w / 2.0, h / 2.0
    maxd = math.hypot(cx, cy)
    for y in range(h):
        dy2 = (y - cy) ** 2
        for x in range(w):
            d = math.sqrt((x - cx) ** 2 + dy2) / maxd
            px[x, y] = int(255 * max(0.0, 1.0 - strength * (d ** 2.2)))
    return ImageChops.multiply(im, Image.merge("RGB", (mask, mask, mask)))


def grain(im, amount=6):
    """Feines Korn bindet unterschiedliche Quellen optisch zusammen."""
    w, h = im.size
    noise = Image.effect_noise((w, h), amount).convert("L")
    noise = noise.filter(ImageFilter.GaussianBlur(0.4))
    return Image.blend(im, ImageChops.overlay(im, Image.merge("RGB", (noise,) * 3)), 0.12)


def graded(im):
    im = ImageEnhance.Color(im).enhance(0.82)      # Sättigung global runter …
    im = ImageEnhance.Contrast(im).enhance(1.14)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.09)))  # … Rot gezielt zurückholen
    im = Image.merge("RGB", (r, g, b))
    im = lift_blacks(im)
    im = vignette(im)
    im = grain(im)
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    ok = miss = 0
    for src, name, do_grade in SHOTS:
        p = os.path.join(SRC, src)
        if not os.path.exists(p):
            print(f"  MISS  {src}")
            miss += 1
            continue

        im = Image.open(p)
        # Transparenz auf die Bühnenfarbe legen, sonst wird PNG-Alpha schwarz-hart
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
            bg = Image.new("RGBA", im.size, (8, 8, 10, 255))
            im = Image.alpha_composite(bg, im)
        im = im.convert("RGB")

        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)),
                           Image.LANCZOS)

        if do_grade:
            im = graded(im)
            im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=42, threshold=3))

        dest = os.path.join(OUT, name + ".jpg")
        im.save(dest, "JPEG", quality=88, optimize=True, progressive=True)
        print(f"  ok    {name}.jpg  {im.width}x{im.height}  "
              f"{os.path.getsize(dest)//1024} KB  {'graded' if do_grade else 'raw'}")
        ok += 1

    print(f"\n{ok} Bilder geschrieben, {miss} fehlend -> {OUT}")



# ---------------------------------------------------------------------------
# Nachtraege. Die Liste oben ist der erste Durchgang; alles darunter kam beim
# Inhaltsabgleich mit carwax.com.tr dazu. Bewusst in derselben Datei, damit
# `python scripts/grade-images.py` weiterhin ALLE Bilder erzeugt.
# ---------------------------------------------------------------------------
SHOTS += [
    # C-Marine Care, die restlichen vier Motive. Alle vorher einzeln geprueft,
    # dass sie tatsaechlich ein Boot zeigen und nicht wie einige andere
    # Marine-Seiten des Kunden ein Auto.
    ("Zehirli-Boya-Uygulamasi.jpg", "marine-zehirli", True),
    ("Kumlama-Uygulama.jpg",        "marine-kumlama", True),
    ("Fiber-Bakimi.jpg",            "marine-fiber",   True),
    ("Genel-Temizlik.jpg",          "marine-genel",   True),

    # Leistungen, die im Menue des Kunden stehen und in der ersten Fassung
    # fehlten. Wo sein Bildarchiv nur ein 320px-Icon-Motiv hatte, steht hier
    # die groessere Aufnahme derselben Arbeit von der jeweiligen Leistungsseite.
    ("car-wrapping.jpg",                                "svc-renk-degisim", True),
    ("CeramicCoatingSacramento.jpg",                    "svc-ceramic-wax",  True),
    ("1000x1000__03carpolishingcopy-1668410112846.jpg", "svc-pasta-cila",   True),
    ("pas-sokucu.png",                                  "svc-pas-onleme",   True),
    ("ChatGPT-Image-18-Nis-2025-10_42_12.png",          "svc-ic-mekan",     True),
    ("dosemetamiri2.png",                               "svc-doseme",       True),

    # Produktgruppen, ungegradet wie die uebrigen Katalogbilder
    ("03-Lastikplastikurunleri-min.png",  "urun-lastik", False),
    ("06-lekesokuculer-min.png",          "urun-leke",   False),
    ("07-Hizlicilalar-min.png",           "urun-hizli",  False),
    ("08-Motortemizlemevekoruma-min.png", "urun-motor",  False),
]


if __name__ == "__main__":
    main()
