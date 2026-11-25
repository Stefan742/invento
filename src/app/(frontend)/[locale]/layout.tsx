import '@/styles/globals.css'

import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import { CartProvider } from '@/components/cart/CartProvider'
import { OrderSticker } from '@/components/cart/CartUI'
import { AnnouncementBar, SocialDock } from '@/components/layout/Chrome'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MotionRoot } from '@/components/motion/MotionRoot'
import { PRELOADER_INLINE_SCRIPT } from '@/components/motion/preloader-script'
import { routing, type Locale } from '@/i18n/routing'
import { contactLinks } from '@/lib/contact'
import { motionEnabled } from '@/lib/motion-flags'
import { isOrderable } from '@/lib/availability'
import { getKits, getSiteSettings } from '@/lib/data'
import { resolveImage } from '@/lib/media'
import { absoluteUrl, buildMetadata, jsonLd, siteUrl } from '@/lib/seo'
import { bodyFont, displayFont } from '@/styles/fonts'

// Content comes from the CMS on each request (served from a tagged data cache that admin
// edits expire), so pages never need a rebuild and the build needs no database.
export const dynamic = 'force-dynamic'

type Props = { children: ReactNode; params: Promise<{ locale: string }> }

export const viewport: Viewport = {
  themeColor: '#0D1B2A',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'meta' })
  const settings = await getSiteSettings(locale)
  const og = resolveImage(settings.defaultOgImage, 'og')
  const description = settings.siteDescription || t('defaultDescription')
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: t('defaultTitle'), template: '%s · INVENTO' },
    description,
    applicationName: 'INVENTO',
    ...buildMetadata({
      locale,
      title: t('defaultTitle'),
      description,
      image: og ? { url: og.src, width: og.width, height: og.height, alt: og.alt } : null,
    }),
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'common' })
  const [settings, kits] = await Promise.all([getSiteSettings(locale as Locale), getKits(locale as Locale)])
  const c = contactLinks(settings)
  const ordersOpen = settings.ordersOpen !== false
  const catalog = kits.map((k) => {
    const img = resolveImage(k.heroImage, 'thumb')
    return {
      id: k.id,
      slug: k.slug,
      title: k.title,
      price: typeof k.priceMKD === 'number' ? k.priceMKD : null,
      orderable: isOrderable(k, true),
      image: img ? { src: img.src, width: img.width, height: img.height, alt: img.alt } : null,
    }
  })
  const rules = {
    ordersOpen,
    ordersClosedMessage: settings.ordersClosedMessage ?? null,
    maxQuantityPerLine: settings.maxQuantityPerLine ?? 5,
    shippingFee: typeof settings.shippingFlatFee === 'number' ? settings.shippingFlatFee : null,
    shippingNote: settings.shippingNote ?? null,
  }

  const org = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl()}/#org`,
        name: 'INVENTO',
        url: absoluteUrl(locale),
        slogan: t('slogan'),
        ...(c.instagram ? { sameAs: [c.instagram] } : {}),
        ...(settings.email ? { email: settings.email } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl()}/#website`,
        name: 'INVENTO',
        url: absoluteUrl(locale),
        inLanguage: locale,
        publisher: { '@id': `${siteUrl()}/#org` },
      },
    ],
  }

  return (
    <html lang={locale} className={`${displayFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh">
        {motionEnabled('preloader') ? (
          // Must run before first paint so the overlay never flashes in or out. Home page only.
          <script dangerouslySetInnerHTML={{ __html: PRELOADER_INLINE_SCRIPT }} />
        ) : null}
        <NextIntlClientProvider>
          <CartProvider catalog={catalog} rules={rules}>
          <a
            href="#main"
            className="bg-orange text-navy sr-only z-[100] rounded-full px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            {t('skipToContent')}
          </a>
          <AnnouncementBar settings={settings} />
          <Header locale={locale} />
          {children}
          <Footer locale={locale} settings={settings} />
          <OrderSticker label={t('order')} />
          <SocialDock settings={settings} />
          <MotionRoot />
          </CartProvider>
        </NextIntlClientProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(org) }} />
      </body>
    </html>
  )
}
