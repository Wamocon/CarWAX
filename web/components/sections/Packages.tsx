import { useTranslations } from 'next-intl';
import { Check, Phone } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { packages, branches } from '@/lib/data/site';

/**
 * Die Pakete stammen 1:1 aus dem Konzernmenü (Ceramic Premium, Full, Deep,
 * Shine). Neu ist nur die Anordnung: Good-Better-Best statt Menüliste, mit
 * Ceramic Premium als hervorgehobener Mitte.
 */
export function Packages() {
  const t = useTranslations('packages');

  return (
    <section
      id="paketler"
      className="section wash-brand border-y border-hairline"
      aria-labelledby="paketler-h"
    >
      <div className="wrap">
        <SectionHeading
          id="paketler-h"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <ul className="grid gap-4 lg:grid-cols-4">
          {packages.map((p, i) => (
            <Reveal
              as="li"
              key={p.id}
              delay={i * 0.05}
              className={
                p.featured
                  ? 'glass grad-ring glow-brand'
                  : 'glass sheen'
              }
            >
              <article className="flex h-full flex-col p-8">
                {p.featured ? (
                  <span className="mb-4 inline-block self-start border border-brand/45 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand">
                    {t('featured')}
                  </span>
                ) : null}

                <h3 className="mb-3 text-[1.3rem] tracking-[-0.02em]">
                  {t(`${p.id}.title`)}
                </h3>
                <p className="mb-6 text-[0.95rem] leading-relaxed text-fg-muted">
                  {t(`${p.id}.text`)}
                </p>

                <ul className="mb-8 space-y-2.5">
                  {p.includes.map((k) => (
                    <li key={k} className="flex gap-2.5 text-[0.9rem] text-fg-muted">
                      <Check
                        aria-hidden
                        size={15}
                        className="mt-1 shrink-0 text-brand"
                      />
                      {t(`includes.${k}`)}
                    </li>
                  ))}
                </ul>

                <a
                  href={`tel:${branches[0].phone}`}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 self-start font-mono text-[0.75rem] tracking-[0.06em] text-brand transition-opacity duration-140 ease-out hover:opacity-80"
                >
                  <Phone aria-hidden size={14} />
                  {t('askPrice')}
                </a>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[0.85rem] text-fg-faint">{t('note')}</p>
        </Reveal>
      </div>
    </section>
  );
}
