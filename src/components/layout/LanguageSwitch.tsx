'use client'

import { useLocale } from 'next-intl'

import { Link, usePathname } from '@/i18n/navigation'
import { locales } from '@/i18n/routing'

/** MK / EN switch that keeps the visitor on the same page. */
export function LanguageSwitch({ className = '', label }: { className?: string; label: string }) {
  const pathname = usePathname()
  const current = useLocale()
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
