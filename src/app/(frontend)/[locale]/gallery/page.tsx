import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Lightbox } from '@/components/gallery/Lightbox'
import { buildPhotos } from '@/components/gallery/photos'
import { PageHeader } from '@/components/layout/PageHeader'
import type { Locale } from '@/i18n/routing'
import { getBuilds } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ locale: Locale }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const tn = await getTranslations({ locale, namespace: 'nav' })
  return buildMetadata({ locale, path: '/gallery', title: tn('gallery'), description: t('intro') })
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'gallery' })
  const tc = await getTranslations({ locale, namespace: 'common' })
  const builds = await getBuilds(locale)
  const photos = buildPhotos(builds, (name) => t('builtBy', { name }))

  return (
    <main id="main">
      <PageHeader title={t('title')} intro={t('intro')} world="teal" art="catapult" />
      <section className="bg-paper text-navy">
        <div className="container-x py-16 sm:py-20">
          {photos.length ? (
            <Lightbox
              photos={photos}
              labels={{
                close: tc('close'),
                previous: tc('previous'),
                next: tc('next'),
                open: t.raw('open') as string,
                placeholder: tc('placeholder'),
              }}
              listClassName="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
            />
          ) : (
            <p className="text-xl font-semibold">{t('empty')}</p>
          )}
        </div>
      </section>
    </main>
  )
}
