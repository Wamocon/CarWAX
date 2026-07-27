import { useTranslations } from 'next-intl';
import { MessageSquare, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { branches, whatsappUrl } from '@/lib/data/site';

/**
 * WhatsApp ist in der Türkei der normale Weg, einen Betrieb zu erreichen —
 * niedriger als ein Anruf, verbindlicher als ein Formular.
 *
 * Nur Filialen mit Mobilnummer erscheinen hier; ein Festnetzanschluss kann
 * kein WhatsApp führen, und ein Knopf, der ins Leere läuft, ist schlimmer
 * als kein Knopf.
 */
export function WhatsApp() {
  const t = useTranslations('whatsapp');
  const reachable = branches.filter((b) => b.whatsapp);

  if (reachable.length === 0) return null;

  return (
    <section
      id="whatsapp"
      className="section wash-ember border-y border-hairline"
      aria-labelledby="whatsapp-h"
    >
      <div className="wrap">
        <SectionHeading
          id="whatsapp-h"
          eyebrow={t('eyebrow')}
          title={t('title')}
          lead={t('lead')}
        />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reachable.map((b, i) => (
            <Reveal as="li" key={b.id} delay={(i % 3) * 0.06}>
              <a
                href={whatsappUrl(b.whatsapp!, t('message', { branch: b.name }))}
                target="_blank"
                rel="noopener noreferrer"
                className="sheen group flex h-full flex-col justify-between gap-6 p-7 glass transition-[transform,border-color] duration-200 ease-out hover:border-hairline-strong motion-safe:hover:-translate-y-0.5"
              >
                <span>
                  <span className="flex items-center gap-2.5">
                    <MessageSquare
                      aria-hidden
                      size={17}
                      style={{ color: 'var(--color-wa)' }}
                    />
                    <span className="text-[1.05rem]">{b.name}</span>
                  </span>
                  <span className="mt-1.5 block pl-[28px] font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-faint">
                    {b.district}
                  </span>
                </span>

                <span className="inline-flex items-center gap-2 font-mono text-[0.75rem] tracking-[0.06em] text-fg-muted transition-colors duration-200 group-hover:text-fg">
                  {t('cta')}
                  <ArrowUpRight aria-hidden size={14} />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={0.12}>
          <p className="mt-8 text-[0.85rem] text-fg-faint">{t('note')}</p>
        </Reveal>
      </div>
    </section>
  );
}
