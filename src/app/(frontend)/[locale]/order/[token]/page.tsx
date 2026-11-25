import config from '@payload-config'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getPayload } from 'payload'

import { Illustration } from '@/components/illustrations/Illustration'
import { CopySummary } from '@/components/order/CopySummary'
import { ExternalButton } from '@/components/ui'
import type { Locale } from '@/i18n/routing'
import { contactLinks } from '@/lib/contact'
import { getSiteSettings } from '@/lib/data'
import { formatPrice } from '@/lib/format'
import { orderSummaryText } from '@/lib/order'
import { getOrderByToken } from '@/lib/orders-server'

type Props = { params: Promise<{ locale: Locale; token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'success' })
  // Private, unguessable URL: never indexed, never sent as a referrer.
  return { title: t('title'), robots: { index: false, follow: false }, referrer: 'no-referrer' }
}

/** Order success page. Shows the reference and a non-personal summary only (no name, phone or address). */
export default async function OrderSuccessPage({ params }: Props) {
  const { locale, token } = await params
  setRequestLocale(locale)
  const payload = await getPayload({ config })
  const order = await getOrderByToken(payload, token)
  if (!order) notFound()

  const [t, tc, tcart, settings] = await Promise.all([
    getTranslations({ locale, namespace: 'success' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'cart' }),
    getSiteSettings(locale),
  ])
  const c = contactLinks(settings)
  const money = (n: number) => tc('priceMKD', { price: formatPrice(n, locale) })
  const totalText = order.total !== null ? `${tcart('total')}: ${money(order.total)}` : tcart('totalOnViber')
  const summary = orderSummaryText(order.ref, order.items, { order: t('orderWord'), total: totalText })

  return (
    <main id="main" className="bg-orange text-navy">
      <div className="container-x grid gap-10 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Illustration name="box" className="w-28" />
          <h1 className="display display-lg break-words">{t('title')}</h1>
          <p className="text-2xl font-bold">{t('lead')}</p>
          <div className="bg-navy text-paper inline-block rounded-2xl px-6 py-4">
            <p className="text-sm font-bold tracking-widest uppercase">{t('ref')}</p>
            <p className="display text-orange text-6xl" data-order-ref>
              {order.ref}
            </p>
          </div>
          <section aria-labelledby="next-title" className="bg-paper border-navy rounded-2xl border-[3px] p-6 shadow-[6px_6px_0_0_var(--color-navy)]">
            <h2 id="next-title" className="display text-3xl">
              {t('next')}
            </h2>
            <p className="mt-2 whitespace-pre-line">{settings.orderSuccessNote || t('defaultNext')}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ExternalButton href={c.viber} variant="orange" disabledLabel={tc('contactSoon')}>
                {t('viber')}
              </ExternalButton>
              <CopySummary text={summary} label={t('copy')} copiedLabel={t('copied')} />
              {c.instagram ? (
                <ExternalButton href={c.instagram} variant="paper">
                  {t('instagram')}
                </ExternalButton>
              ) : null}
            </div>
            <p className="mt-3 text-sm">{t('copyHint')}</p>
          </section>
        </div>

        <section aria-labelledby="items-title" className="bg-paper border-navy self-start rounded-2xl border-[3px] p-6">
          <h2 id="items-title" className="display text-3xl">
            {t('items')}
          </h2>
          <ul className="divide-navy/15 mt-3 divide-y-2">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-4 py-3">
                <span className="font-semibold">
                  {i.title} × {i.quantity}
                </span>
                <span>{typeof i.price === 'number' ? money(i.price * i.quantity) : tc('priceSoon')}</span>
              </li>
            ))}
          </ul>
          <p className="border-navy/30 mt-2 border-t-2 pt-3 text-lg font-bold">{totalText}</p>
          <p className="mt-3 font-semibold">{tc('payOnDelivery')}</p>
        </section>
      </div>
    </main>
  )
}
