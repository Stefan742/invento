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
 * Two-state header. At the top of the page it is a full-width navy bar that blends into the
 * navy hero; once the page scrolls (MotionRoot sets `data-scrolled`) the bar fades away and the
 * controls sit in a floating paper "sticker" pill that stays on screen. Only opacity and
 * transform animate. Without JS it simply stays the navy bar.
 * Pages pad their first block by --header-h, since the header overlays it.
 */
export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const items = await navItems(locale)

  return (
    <header
      data-site-header
      className="group/header pointer-events-none sticky top-0 z-40 -mb-[var(--header-h)] h-[var(--header-h)]"
    >
      <div
        aria-hidden="true"
        className="bg-navy absolute inset-0 transition-opacity duration-300 group-data-[scrolled]/header:opacity-0 motion-reduce:transition-none"
      />
      <div className="container-x relative flex h-full items-center">
        <div className="text-paper group-data-[scrolled]/header:text-navy pointer-events-auto relative isolate flex h-14 w-full items-center justify-between gap-3 pr-1.5 pl-4 [--ink-contrast:var(--color-navy)] [--ink:var(--color-paper)] group-data-[scrolled]/header:[--ink-contrast:var(--color-paper)] group-data-[scrolled]/header:[--ink:var(--color-navy)]">
          <span
            aria-hidden="true"
            className="bg-paper border-navy absolute inset-0 -z-10 -translate-y-2 scale-95 rounded-full border-[3px] opacity-0 shadow-[4px_4px_0_0_var(--color-navy)] transition duration-300 ease-[var(--ease-back)] group-data-[scrolled]/header:translate-y-0 group-data-[scrolled]/header:scale-100 group-data-[scrolled]/header:opacity-100 motion-reduce:transition-none"
          />
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
