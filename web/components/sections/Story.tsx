import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { brand, team } from '@/lib/data/site';

const MILESTONES = [
  { year: brand.foundedTrade, key: 'start' },
  { year: brand.foundedBrand, key: 'name' },
  { year: brand.firstFranchise, key: 'franchise' },
] as const;

/** Kurumsal — Biz Kimiz, Başarı Hikayemiz und Ekibimiz in einer Sektion. */
export function Story() {
  const t = useTranslations('story');

  return (
    <section
      id="hakkimizda"
      className="section border-t border-hairline"
      aria-labelledby="hakkimizda-h"
    >
      <div className="wrap">
        <SectionHeading
          id="hakkimizda-h"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <ol className="mb-20 grid gap-px bg-hairline sm:grid-cols-3">
          {MILESTONES.map((m, i) => (
            <Reveal as="li" key={m.year} delay={i * 0.06} className="bg-bg p-8">
              <span className="block font-mono text-[2.2rem] leading-none tabular-nums text-brand">
                {m.year}
              </span>
              <span className="mt-4 block text-[0.95rem] leading-relaxed text-fg-muted">
                {t(`milestones.${m.key}`)}
              </span>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <h3 className="mb-8 text-[1.4rem] tracking-[-0.02em]">{t('teamTitle')}</h3>
        </Reveal>

        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {team.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 6) * 0.04}>
              <figure>
                <div className="relative aspect-square overflow-hidden border border-hairline">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3">
                  <span className="block text-[0.9rem]">{p.name}</span>
                  <span className="mt-0.5 block font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint">
                    {t(`roles.${p.id}`)}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
