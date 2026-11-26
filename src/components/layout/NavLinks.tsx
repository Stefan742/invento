'use client'

import { Link, usePathname } from '@/i18n/navigation'

type Item = { href: string | { pathname: string; hash?: string }; label: string }

/** Desktop nav: chunky display links that pop up like stickers on hover; the current section is orange. */
export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname()
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const path = typeof item.href === 'string' ? item.href : null
        const current = path !== null && (pathname === path || pathname.startsWith(`${path}/`))
        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={`display inline-block rounded-full border-[3px] px-3.5 pt-1.5 pb-1 text-xl transition duration-200 ease-[var(--ease-back)] xl:px-4 ${
                current
                  ? 'bg-orange border-navy -rotate-2 shadow-[2px_2px_0_0_var(--color-navy)]'
                  : 'hover:bg-yellow hover:border-navy border-transparent hover:-translate-y-0.5 hover:-rotate-2 hover:shadow-[3px_3px_0_0_var(--color-navy)]'
              }`}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
