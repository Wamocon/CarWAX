import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { marine } from '@/lib/data/site';

/**
 * C-Marine Care. In einer Marina-Stadt das Argument, das kein lokaler
 * Wettbewerber hat.
 *
 * Deshalb liegt die Sektion nicht mehr im Textkasten und nicht mehr im
 * gleichmäßigen Dreierraster. Vorher waren es zwölf gleich große Kacheln in
 * derselben Anordnung wie Leistungen und Produkte, also der dritte Auftritt
 * desselben Bausteins, ausgerechnet beim einzigen Alleinstellungsmerkmal.
 *
 * Jetzt läuft die Bildstrecke breiter als der Text, und das erste Motiv trägt
 * die vierfache Fläche. Ein Blickfang plus eine Reihe kleinerer Belege liest
 * sich redaktionell; zwölf gleich große Quadrate lesen sich als Katalogseite.
 * Kein Inhalt fällt weg, nur die Gleichförmigkeit.
 */
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
      </div>

      {/*
        Bewusst außerhalb von `.wrap`: die Strecke soll die Textbreite
        überschreiten. Randlos über `100vw` wäre falsch, weil das die
        Bildlaufleiste mitzählt und die Seite waagerecht überlaufen ließe.
        Die Sektion ist ohnehin volle Breite; es reicht, den Textkasten
        wegzulassen und ein knappes Innenmaß zu setzen.
      */}
      <ul className="grid gap-3 px-[clamp(12px,2vw,28px)] sm:grid-cols-2 lg:grid-cols-4">
        {marine.map((m, i) => {
          const feature = i === 0;
          return (
            <Reveal
              as="li"
              key={m.id}
              delay={(i % 4) * 0.05}
              /* Das erste Motiv nimmt zwei Spalten und zwei Zeilen. */
              className={feature ? 'lg:col-span-2 lg:row-span-2' : undefined}
            >
              <figure
                className={[
                  'group relative h-full overflow-hidden border border-hairline',
                  'transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1',
                  feature ? 'aspect-4/3 lg:aspect-auto' : 'aspect-4/3',
                ].join(' ')}
              >
                <Image
                  src={m.img}
                  alt={t(m.id)}
                  fill
                  sizes={
                    feature
                      ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw'
                      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  }
                  className="object-cover transition-transform duration-600 ease-out motion-safe:group-hover:scale-[1.04]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent"
                />
                <figcaption
                  className={[
                    'absolute inset-x-0 bottom-0 p-5 font-mono uppercase tracking-[0.2em]',
                    feature ? 'text-[0.8125rem]' : 'text-[0.6875rem]',
                  ].join(' ')}
                >
                  {t(m.id)}
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
