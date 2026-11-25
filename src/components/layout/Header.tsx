import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { CartButton } from '../cart/CartUI'
import { Illustration } from '../illustrations/Illustration'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileMenu } from './MobileMenu'

export async function navItems(locale: Locale) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  return [
    { href: '/kits', label: t('kits') },
    { href: { pathname: '/', hash: 'how-it-works' }, label: t('howItWorks') },
    { href: '/gallery', label: t('gallery') },
    { href: '/faq', label: t('faq') },
    { href: '/contact', label: t('contact') },
  ]
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Illustration name="box" className="h-9 w-9 [--ink:var(--color-paper)]" />
      <span className="display text-3xl tracking-wide">INVENTO</span>
    </span>
  )
}

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const items = await navItems(locale)

  return (
    <header className="bg-navy text-paper sticky top-0 z-40 [--ink:var(--color-paper)]">
      <div className="container-x flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" aria-label="INVENTO, home" className="rounded-full">
          <Logo />
        </Link>
        <nav aria-label={t('main')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="hover:bg-paper/10 rounded-full px-4 py-2.5 font-semibold transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch label={tc('language')} className="hidden sm:flex" />
          <CartButton />
          <MobileMenu
            items={items}
            openLabel={tc('openMenu')}
            closeLabel={tc('closeMenu')}
            menuLabel={tc('menu')}
          >
            <LanguageSwitch label={tc('language')} className="display text-4xl" />
          </MobileMenu>
        </div>
      </div>
    </header>
  )
}
