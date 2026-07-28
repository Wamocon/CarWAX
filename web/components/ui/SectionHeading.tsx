import { Reveal } from './Reveal';

/**
 * Sektionskopf.
 *
 * Bewusst OHNE Kicker über der Überschrift. Die erste Fassung hatte über jeder
 * Sektion ein kleines Label („Hizmetlerimiz", „Ürünlerimiz", „Konum") und
 * zusätzlich eine Kapitelnummer. Beides ist genau die Dreiteilung, an der man
 * eine Vorlage erkennt: dreizehn Sektionen, dreizehnmal derselbe Aufbau. Und
 * die Labels sagten nichts, was die Überschrift nicht schon sagt.
 *
 * Stattdessen trägt die Überschrift selbst, und der Rhythmus entsteht über die
 * Größe: `lg` für die drei Sektionen, die das Argument tragen, `md` für den
 * Rest. Eine Seite, auf der alle Überschriften gleich groß sind, hat keine
 * Betonung — sie hat nur Abstände.
 */
export function SectionHeading({
  title,
  lead,
  id,
  size = 'md',
}: {
  title: string;
  lead?: string;
  id?: string;
  size?: 'md' | 'lg';
}) {
  return (
    // Die Breitenbegrenzung sitzt auf der Überschrift, NICHT auf dem
    // Kopfbereich. Lag sie außen, erbte der Fließtext darunter dieselben
    // 24 Zeichen und brach nach jedem zweiten Wort um.
    <header className="mb-14">
      <Reveal>
        <h2
          id={id}
          className={size === 'lg' ? 'h2-lg mb-6 max-w-[19ch]' : 'h2 mb-5 max-w-[24ch]'}
        >
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.07}>
          <p className="lead max-w-[54ch]">{lead}</p>
        </Reveal>
      ) : null}
    </header>
  );
}
