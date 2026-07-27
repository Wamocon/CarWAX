import { Reveal } from './Reveal';

export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  id?: string;
}) {
  return (
    <header className="mb-14">
      <Reveal>
        <p className="eyebrow mb-5">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 id={id} className="h2 mb-5">
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.12}>
          <p className="lead">{lead}</p>
        </Reveal>
      ) : null}
    </header>
  );
}
