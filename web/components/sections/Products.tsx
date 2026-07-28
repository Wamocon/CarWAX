import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { products } from '@/lib/data/site';

/**
 * Eigene Chemie ist das Argument, das kein lokaler Wettbewerber führen kann.
 * Katalogfotos bleiben ungegradet — ein Produktbild soll das Etikett zeigen,
 * nicht kinematisch aussehen.
 */
export function Products() {
  const t = useTranslations('products');

  return (
    <section id="urunler" className="section wash-ember" aria-labelledby="urunler-h">
      <div className="wrap">
        <SectionHeading
          id="urunler-h"
          title={t('title')}
          lead={t('lead')}
        />

        {/*
          Rasterbehälter NICHT einfärben. Bei `gap-px bg-hairline` stanzen
          sich die Karten aus einer gefärbten Fläche aus; sobald eine
          Reihe nicht voll wird, ist die leere Zelle keine Lücke, sondern
          der Behälter selbst und damit ein grauer Block. Genau das stand
          bei zehn Produkten in drei Spalten zweimal am Ende. Jede Karte
          trägt jetzt ihre eigene Haarlinie, dann ist die Lücke unsichtbar,
          egal wie viele Produkte dazukommen.
        */}
                {/*
          Nahtlos, ohne den Behälter zu färben.

          Der alte Kniff `gap-px bg-hairline` sah bündig aus, machte aber jede
          unvollständige Reihe zu einem grauen Block, weil man dann den
          eingefärbten Behälter sieht. Getrennte Karten mit Abstand lösten das,
          kosteten aber genau die Bündigkeit, die die Sektion getragen hat.

          Jetzt kollabieren die Ränder: `gap-0` und jede Karte einen Pixel nach
          oben und links gezogen, sodass aus zwei aneinanderstoßenden 1px-Rändern
          eine einzige Linie wird. Sieht aus wie eine Tabelle, und eine leere
          Zelle zeichnet schlicht nichts.
        */}
<ul className="grid sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 3) * 0.06} className="border border-hairline -mt-px -ml-px bg-bg transition-[background-color] duration-300 ease-out hover:bg-bg-raised">
              <figure className="flex h-full flex-col">
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  <Image
                    src={p.img}
                    alt={t(`${p.id}.title`)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-6"
                  />
                </div>
                <figcaption className="p-7">
                  <h3 className="mb-2 text-[1.05rem] tracking-[-0.015em]">
                    {t(`${p.id}.title`)}
                  </h3>
                  <p className="text-[0.9rem] leading-relaxed text-fg-muted">
                    {t(`${p.id}.text`)}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
