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
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <ul className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 3) * 0.06} className="bg-bg">
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
