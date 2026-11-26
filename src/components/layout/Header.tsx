import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

import { CartButton } from '../cart/CartUI'
import { Illustration } from '../illustrations/Illustration'
import { LanguageSwitch } from './LanguageSwitch'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'

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

/** Box + wordmark. Colours follow the surrounding `--ink` / text colour. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`group/logo flex items-center gap-2 ${className}`}>
      <Illustration
        name="box"
        className="h-10 w-10 -rotate-6 transition-transform duration-300 ease-[var(--ease-back)] group-hover/logo:-translate-y-0.5 group-hover/logo:rotate-6"
      />
      <span className="display text-3xl tracking-wide">INVENTO</span>
    </span>
  )
}

/**
 * Floating "sticker" header: a paper pill with the site's chunky navy outline and hard shadow,
 * sitting over the first section of every page (pages pad their first block by --header-h).
 */
export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const items = await navItems(locale)

  return (
    <header
      data-site-header
      className="pointer-events-none sticky top-0 z-40 -mb-[var(--header-h)] h-[var(--header-h)]"
    >
      <div className="container-x flex h-full items-center">
        <div className="bg-paper text-navy border-navy pointer-events-auto flex h-14 w-full items-center justify-between gap-3 rounded-full border-[3px] pr-1.5 pl-4 shadow-[4px_4px_0_0_var(--color-navy)] [--ink:var(--color-navy)]">
          <Link href="/" aria-label="INVENTO, home" className="rounded-full">
            <Logo />
          </Link>
          <nav aria-label={t('main')} className="hidden lg:block">
            <NavLinks items={items} />
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitch label={tc('language')} variant="pill" className="hidden sm:flex" />
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
      </div>
    </header>
  )
}
