import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { KitCard } from '@/components/kits/KitCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { NextDropBlock } from '@/components/sections/PickYourBox'
import type { Locale } from '@/i18n/routing'
import { getAvailability } from '@/lib/availability'
import { getKits } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'kits' })
  const tn = await getTranslations({ locale, namespace: 'nav' })
  return buildMetadata({ locale, path: '/kits', title: tn('kits'), description: t('intro') })
}

export default async function KitsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'kits' })
  const kits = await getKits(locale)
  const allSoldOut = kits.length > 0 && kits.every((k) => getAvailability(k) === 'sold_out')

  return (
    <main id="main">
      <PageHeader title={t('title')} intro={t('intro')} world="yellow" art="box" />
      <section className="bg-paper text-navy">
        <div className="container-x py-16 sm:py-20">
          {allSoldOut ? (
            <div className="mb-12">
              <NextDropBlock locale={locale} kits={kits} />
            </div>
          ) : null}
          {kits.length ? (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {kits.map((kit, i) => (
                <li key={kit.id}>
                  <KitCard kit={kit} locale={locale} index={i} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xl font-semibold">{t('empty')}</p>
          )}
        </div>
      </section>
    </main>
  )
}
