import { useTranslations } from 'next-intl';
import { MapPin, Phone, Clock, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { branches, directionsUrl } from '@/lib/data/site';

export function Branches() {
  const t = useTranslations('branches');

  return (
    <section id="subeler" className="section" aria-labelledby="subeler-h">
      <div className="wrap">
        <SectionHeading
          id="subeler-h"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {branches.map((b, i) => (
            <Reveal as="li" key={b.id} delay={(i % 2) * 0.06} className="glass sheen">
              <article className="flex h-full flex-col p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <h3 className="text-[1.35rem] tracking-[-0.02em]">{b.name}</h3>
                  {b.tier === 'premium' ? (
                    <span className="mt-1 shrink-0 border border-brand/45 px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-brand">
                      {t('premium')}
                    </span>
                  ) : null}
                </div>

                <dl className="mb-7 space-y-3 text-[0.95rem] text-fg-muted">
                  <div className="flex gap-3">
                    <dt className="sr-only">{t('addressLabel')}</dt>
                    <MapPin aria-hidden size={16} className="mt-1 shrink-0 text-fg-faint" />
                    <dd>{b.address}</dd>
                  </div>
                  {b.hours ? (
                    <div className="flex gap-3">
                      <dt className="sr-only">{t('hoursLabel')}</dt>
                      <Clock aria-hidden size={16} className="mt-1 shrink-0 text-fg-faint" />
                      <dd>
                        {t('everyday')} · {b.hours}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-auto flex flex-wrap gap-3">
                  <a
                    href={`tel:${b.phone}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[2px] bg-brand px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-white transition-[transform,background-color] duration-140 ease-out hover:bg-brand-hot active:scale-[0.97]"
                    aria-label={`${b.name} — ${t('call')} ${b.phoneLabel}`}
                  >
                    <Phone aria-hidden size={14} />
                    {b.phoneLabel}
                  </a>
                  <a
                    href={directionsUrl(b.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-[2px] border border-hairline-strong px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] transition-[transform,border-color,color] duration-140 ease-out hover:border-brand hover:text-brand active:scale-[0.97]"
                    aria-label={`${b.name} — ${t('route')} (${t('newTab')})`}
                  >
                    {t('route')}
                    <ArrowUpRight aria-hidden size={14} />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
