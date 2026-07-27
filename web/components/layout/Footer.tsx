import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { social, hq, brand } from '@/lib/data/site';

export function Footer() {
  const t = useTranslations('footer');
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
          <a
            href={`tel:${hq.phone.replace(/\s/g, '')}`}
            className="mt-2 inline-flex min-h-11 items-center font-mono text-[0.85rem] text-fg-muted transition-colors hover:text-fg"
          >
            {hq.phone}
          </a>
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

      <div className="wrap mt-12 flex flex-wrap justify-between gap-4 border-t border-hairline pt-7 text-[0.8rem] text-fg-faint">
        <span>
          © {brand.foundedBrand}–2026 {brand.legalName}. {t('rights')}
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
