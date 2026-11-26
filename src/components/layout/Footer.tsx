import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { contactLinks } from '@/lib/contact'
import type { SiteSetting } from '@/payload-types'

import { LanguageSwitch } from './LanguageSwitch'
import { navItems } from './Header'

export async function Footer({ locale, settings }: { locale: Locale; settings: SiteSetting }) {
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const items = await navItems(locale)
  const c = contactLinks(settings)
  const policies = [
    { href: '/about', label: t('about') },
    { href: '/shipping', label: t('shipping') },
    { href: '/returns', label: t('returns') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
  ]
  const contact = [
    c.viber && { href: c.viber, label: 'Viber' },
    c.instagram && { href: c.instagram, label: c.instagramHandle ? `@${c.instagramHandle}` : 'Instagram' },
    c.email && { href: c.email, label: settings.email as string },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <footer className="bg-navy text-paper border-orange relative overflow-hidden border-t" data-track-anchor="footer">
      <div className="container-x pt-16 pb-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label={t('footer')}>
            <h2 className="text-orange mb-3 text-sm font-bold tracking-widest uppercase">{t('explore')}</h2>
            <ul className="space-y-1">
              {items.map((i) => (
                <li key={i.label}>
                  <Link href={i.href} className="inline-block py-1.5 hover:underline">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t('policies')}>
            <h2 className="text-orange mb-3 text-sm font-bold tracking-widest uppercase">{t('policies')}</h2>
            <ul className="space-y-1">
              {policies.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="inline-block py-1.5 hover:underline">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="text-orange mb-3 text-sm font-bold tracking-widest uppercase">{t('getInTouch')}</h2>
            {contact.length ? (
              <ul className="space-y-1">
                {contact.map((i) => (
                  <li key={i.href}>
                    <a
                      href={i.href}
                      className="inline-block py-1.5 hover:underline"
                      {...(i.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {i.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="opacity-80">{tc('contactSoon')}</p>
            )}
          </div>
          <div>
            <h2 className="text-orange mb-3 text-sm font-bold tracking-widest uppercase">{tc('language')}</h2>
            <LanguageSwitch label={tc('language')} />
          </div>
        </div>
      </div>
      {/* The wordmark sits in the "box": its letters pop up out of the orange rim as the bottom
          of the page is reached (M4 motion; static and fully visible without it). */}
      <div className="container-x overflow-hidden pt-6" aria-hidden="true" data-footer-wordmark>
        <p className="display text-paper flex justify-center pb-[0.06em] text-[clamp(4.5rem,23vw,21rem)] leading-[0.8] select-none [text-shadow:0.035em_0.035em_0_var(--color-orange)]">
          {'INVENTO'.split('').map((ch, i) => (
            <span key={i} data-footer-letter className="inline-block origin-bottom">
              {ch}
            </span>
          ))}
        </p>
      </div>
      <div className="bg-orange h-1.5" aria-hidden="true" />
      <div>
        <div className="container-x flex flex-col items-center justify-between gap-2 pt-5 pb-24 text-sm sm:flex-row sm:pb-5 sm:pr-52">
          <p>{tc('madeIn')}</p>
          <p>© {new Date().getFullYear()} INVENTO</p>
        </div>
      </div>
    </footer>
  )
}
