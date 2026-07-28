import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { social, hq, brand } from '@/lib/data/site';

/**
 * Sprungziele, die nicht in den Kopfbalken passen. Sieben Punkte sind dort
 * schon die Obergrenze; Yorumlar und Sorular kämen als achter und neunter
 * hinzu und würden den Balken auf dem Laptop umbrechen lassen. Im Fuß sind
 * sie trotzdem erreichbar, und der Fuß ist der Ort, an dem Besucher nach
 * genau solchen Nebenwegen suchen.
 */
const JUMP = [
  { id: 'hizmetler', key: 'services' },
  { id: 'paketler', key: 'packages' },
  { id: 'yorumlar', key: 'reviews' },
  { id: 'marine', key: 'marine' },
  { id: 'urunler', key: 'products' },
  { id: 'subeler', key: 'branches' },
  { id: 'sorular', key: 'faq' },
  { id: 'iletisim', key: 'contact' },
] as const;

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  // Nur bestätigte Profile. Ein toter Link im Footer kostet mehr Vertrauen,
  // als ein fehlendes Icon je kosten könnte.
  const links = social.filter((s) => s.verified);

  return (
    <footer className="border-t border-hairline py-14">
      <div className="wrap grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Image
            src="/brand/carwax-logo-light.png"
            alt={brand.legalName}
            width={417}
            height={102}
            className="only-dark h-7 w-auto"
          />
          <Image
            src="/brand/carwax-logo.png"
            alt={brand.legalName}
            width={417}
            height={102}
            className="only-light h-7 w-auto"
          />
          <address className="mt-4 max-w-[46ch] text-[0.9rem] not-italic leading-relaxed text-fg-muted">
            {hq.address}
          </address>
          {/* Beide Zentralnummern und die Mailadresse. Auf der Kundenseite
              stehen sie gleichberechtigt; hier fehlte bisher die zweite. */}
          <div className="mt-2 flex flex-wrap items-center gap-x-6">
            {[hq.phone, hq.phone2].map((p) => (
              <a
                key={p}
                href={`tel:${p.replace(/\s/g, '')}`}
                className="inline-flex min-h-11 items-center font-mono text-[0.85rem] text-fg-muted transition-colors hover:text-fg"
              >
                {p}
              </a>
            ))}
            <a
              href={`mailto:${hq.email}`}
              className="inline-flex min-h-11 items-center font-mono text-[0.85rem] text-fg-muted transition-colors hover:text-fg"
            >
              {hq.email}
            </a>
          </div>
        </div>

        {links.length > 0 ? (
          <nav aria-label={t('socialLabel')} className="flex flex-wrap gap-3">
            {links.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-[2px] border border-hairline px-5 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-muted transition-[transform,border-color,color] duration-140 ease-out hover:border-brand hover:text-brand active:scale-[0.97]"
                aria-label={`${s.label} (${t('newTab')})`}
              >
                {s.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>

      <nav
        aria-label={nav('menuLabel')}
        className="wrap mt-12 flex flex-wrap gap-x-8 gap-y-1 border-t border-hairline pt-7"
      >
        {JUMP.map((j) => (
          <a
            key={j.id}
            href={`#${j.id}`}
            className="inline-flex min-h-11 items-center font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-fg-muted transition-colors duration-200 hover:text-brand"
          >
            {nav(j.key)}
          </a>
        ))}
      </nav>

      <div className="wrap mt-6 flex flex-wrap justify-between gap-4 border-t border-hairline pt-7 text-[0.8rem] text-fg-faint">
        <span>
          © {brand.foundedBrand}-{new Date().getFullYear()} {brand.legalName}.{' '}
          {t('rights')}
        </span>
        <span>
          {t('by')}{' '}
          <a
            href="https://wamocon.com/webdesign"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            WAMOCON
          </a>
        </span>
      </div>
    </footer>
  );
}
