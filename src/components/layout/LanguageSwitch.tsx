'use client'

import { useLocale } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

/**
 * MK / EN switch that keeps the visitor on the same page.
 * `pill`: a segmented toggle for the header (the current language is filled
 * with the header's ink: paper on the navy bar, navy on the pill).
 */
export function LanguageSwitch({
  className = '',
  label,
  variant = 'text',
}: {
  className?: string
  label: string
  variant?: 'text' | 'pill'
}) {
  const pathname = usePathname()
  const current = useLocale()

  if (variant === 'pill') {
    return (
      <nav aria-label={label} className={`items-center rounded-full border-[var(--ink)] border-[3px] p-0.5 text-sm font-black ${className}`}>
        {locales.map((l) => (
          <Link
            key={l}
            href={pathname}
            locale={l}
            hrefLang={l}
            lang={l}
            aria-current={l === current ? 'true' : undefined}
            className={`grid h-9 min-w-10 place-items-center rounded-full px-2 uppercase transition-colors ${
              l === current ? 'bg-[var(--ink)] text-[var(--ink-contrast)]' : 'hover:bg-yellow hover:text-navy'
            }`}
          >
            {l.toUpperCase()}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav aria-label={label} className={`flex items-center gap-1 font-bold ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          <Link
            href={pathname}
            locale={l}
            hrefLang={l}
            lang={l}
            aria-current={l === current ? 'true' : undefined}
            className={`grid min-h-11 min-w-11 place-items-center rounded-full px-2 uppercase ${
              l === current ? 'underline decoration-[3px] underline-offset-4' : 'opacity-70 hover:opacity-100'
            }`}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </nav>
  )
}
