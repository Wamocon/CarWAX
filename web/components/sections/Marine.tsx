import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { marine } from '@/lib/data/site';

/** In einer Marina-Stadt das Argument, das kein lokaler Wettbewerber hat. */
export function Marine() {
  const t = useTranslations('marine');

  return (
    <section
      id="marine"
      className="section wash-ember border-y border-hairline"
      aria-labelledby="marine-h"
    >
      <div className="wrap">
        <SectionHeading
          id="marine-h"
          size="lg"
          title={t('title')}
          lead={t('lead')}
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {marine.map((m, i) => (
            <Reveal as="li" key={m.id} delay={(i % 3) * 0.06}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-[4px] border border-hairline transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1">
                <Image
                  src={m.img}
                  alt={t(m.id)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-600 ease-out motion-safe:group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em]">
                  {t(m.id)}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
