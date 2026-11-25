import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { OrderForm } from '@/components/order/OrderForm'
import { PageHeader } from '@/components/layout/PageHeader'
import { ButtonLink } from '@/components/ui'
import type { Locale } from '@/i18n/routing'
import { issueFormToken } from '@/lib/antispam'
import { getSiteSettings } from '@/lib/data'
import { alternatesFor } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'order' })
  return { title: t('title'), robots: { index: false }, alternates: alternatesFor(locale, '/order') }
}

export default async function OrderPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'order' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const settings = await getSiteSettings(locale)
  const open = settings.ordersOpen !== false

  return (
    <main id="main">
      <PageHeader title={t('title')} intro={open ? t('intro') : undefined} world="orange" art="box" />
      <section className="bg-paper text-navy">
        <div className="container-x py-12 sm:py-16">
          {open ? (
            <OrderForm
              formToken={issueFormToken()}
              locale={locale}
              turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null}
            />
          ) : (
            <div className="bg-navy text-paper max-w-2xl rounded-2xl p-8" data-orders-paused>
              <p className="text-xl font-bold">{settings.ordersClosedMessage || tc('ordersPaused')}</p>
              <ButtonLink href="/kits" variant="orange" className="mt-6">
                {tc('seeTheBoxes')}
              </ButtonLink>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
