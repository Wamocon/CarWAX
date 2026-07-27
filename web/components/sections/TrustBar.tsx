import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/ui/Reveal';

const ITEMS = ['since', 'stations', 'languages', 'insured'] as const;

/** Nur Belegbares. Jeder Punkt lässt sich auf carwax.com.tr nachlesen. */
export function TrustBar() {
  const t = useTranslations('trust');
  return (
    <section aria-label={t('label')} className="border-y border-hairline bg-bg-raised">
      <ul className="wrap grid grid-cols-2 gap-x-8 gap-y-6 py-9 md:grid-cols-4">
        {ITEMS.map((k, i) => (
          <Reveal as="li" key={k} delay={i * 0.05}>
            <span className="block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-faint">
              {t(`${k}.label`)}
            </span>
            <span className="mt-1.5 block text-[0.95rem] text-fg">{t(`${k}.value`)}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
