import { useTranslations } from 'next-intl';
import { Phone } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { branches } from '@/lib/data/site';

export function Contact() {
  const t = useTranslations('contact');

  return (
    <section
      id="iletisim"
      className="section wash-brand border-t border-hairline"
      aria-labelledby="iletisim-h"
    >
      <div className="wrap">
        <SectionHeading
          id="iletisim-h"
          title={t('title')}
          lead={t('lead')}
        />

        <Reveal>
          <ul className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4">
            {branches.map((b) => (
              <li key={b.id} className="bg-bg-raised">
                <a
                  href={`tel:${b.phone}`}
                  className="group flex h-full flex-col justify-between gap-6 p-7 transition-[background-color] duration-200 hover:bg-bg"
                  aria-label={`${b.name}, ${b.district} — ${t('call')} ${b.phoneLabel}`}
                >
                  <span>
                    <span className="block text-[1.05rem]">{b.name}</span>
                    <span className="mt-1 block font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-faint">
                      {b.district}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 font-mono text-[0.8125rem] tracking-[0.06em] text-brand">
                    <Phone aria-hidden size={14} />
                    {b.phoneLabel}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[0.95rem] text-fg-muted">{t('note')}</p>
        </Reveal>
      </div>
    </section>
  );
}
